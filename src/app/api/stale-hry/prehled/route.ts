import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { claimAchievement, claimDaily, achievementViews, dailyViews, dayKey, normalizeHub, rollDaily, type HubState } from "@/lib/idle/hub";
import { metricsFrom } from "@/lib/idle/hub-metrics";

const HUB = "hub";
const GAMES = ["zakladna", "mesto", "farma", "mazlicci"] as const;

class Conflict extends Error {}

async function load(userId: string, now: number) {
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const [rows, total, today, user] = await Promise.all([
    prisma.idleState.findMany({ where: { userId, game: { in: [...GAMES, HUB] } } }),
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.xpEvent.aggregate({ where: { userId, createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ]);
  const byGame = Object.fromEntries(rows.map((r) => [r.game, r])) as Record<string, (typeof rows)[number] | undefined>;
  const metrics = metricsFrom(
    { zakladna: byGame.zakladna?.data, mesto: byGame.mesto?.data, farma: byGame.farma?.data, mazlicci: byGame.mazlicci?.data },
    total._sum.amount ?? 0,
    today._sum.amount ?? 0,
    now,
  );
  return { metrics, hubRow: byGame[HUB], points: user?.points ?? 0 };
}

function view(userId: string, metrics: ReturnType<typeof metricsFrom>, hub: HubState, points: number) {
  return {
    points,
    date: hub.daily?.date ?? null,
    daily: dailyViews(userId, metrics, hub),
    achievements: achievementViews(metrics, hub),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  try {
    const now = Date.now();
    const { metrics, hubRow, points } = await load(userId, now);
    const before = normalizeHub(hubRow?.data);
    const hub = rollDaily(before, dayKey(now), metrics);
    if (hub !== before || !hubRow) {
      const data = hub as unknown as Prisma.InputJsonValue;
      await prisma.idleState.upsert({ where: { userId_game: { userId, game: HUB } }, create: { userId, game: HUB, data }, update: { data } });
    }
    return NextResponse.json(view(userId, metrics, hub, points));
  } catch (error) {
    console.error("prehled GET failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: unknown; kind?: unknown; id?: unknown };
  if (body.action !== "claim" || typeof body.id !== "string" || (body.kind !== "achievement" && body.kind !== "daily")) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  try {
    const now = Date.now();
    const { metrics, hubRow } = await load(userId, now);
    if (!hubRow) return NextResponse.json({ error: "not-ready" }, { status: 409 });
    const hub = rollDaily(normalizeHub(hubRow.data), dayKey(now), metrics);
    const claim = body.kind === "daily" ? claimDaily(userId, hub, metrics, body.id) : claimAchievement(hub, metrics, body.id);
    if (!claim.ok) return NextResponse.json({ error: claim.error }, { status: claim.error === "unknown" ? 400 : 409 });

    // Optimistická zámek: zápis projde jen, když se záznam mezitím nezměnil (dvojklik, dvě okna).
    const points = await prisma.$transaction(async (tx) => {
      const res = await tx.idleState.updateMany({
        where: { userId, game: HUB, updatedAt: hubRow.updatedAt },
        data: { data: claim.hub as unknown as Prisma.InputJsonValue },
      });
      if (res.count === 0) throw new Conflict();
      await tx.pointTransaction.create({ data: { userId, amount: claim.reward, reason: "Stálé hry: odměna" } });
      const u = await tx.user.update({ where: { id: userId }, data: { points: { increment: claim.reward } }, select: { points: true } });
      return u.points;
    });
    return NextResponse.json({ reward: claim.reward, ...view(userId, metrics, claim.hub, points) });
  } catch (error) {
    if (error instanceof Conflict) return NextResponse.json({ error: "conflict" }, { status: 409 });
    console.error("prehled POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
