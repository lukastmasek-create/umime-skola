import { NextResponse } from "next/server";
import { buildingLevel, buildingLevels } from "@/lib/town-progress-server";
import { EXTRA_PLAYS_PER_LEVEL, MINI_BUILDING } from "@/lib/town-progress";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { DAILY_ACTIVITY_XP_CAP } from "@/lib/progression";
import { MINI, MINI_IDS, PLAYS_PER_DAY, isMiniId, type MiniId, type MiniSnapshot } from "@/lib/town-mini";

// Minihry městečka: server drží počet kol za den a nejlepší skóre, odměna je omezená stropem skóre a počtem kol.
const GAME = "mestecko-mini";
type Entry = { day: string; plays: number; best: number };
type Store = Partial<Record<MiniId, Entry>>;

function parse(data: unknown): Store {
  const raw = (data && typeof data === "object" ? (data as { mini?: unknown }).mini : null) as Record<string, Entry> | null;
  const out: Store = {};
  if (raw && typeof raw === "object") {
    for (const k of MINI_IDS) {
      const e = raw[k];
      if (e && typeof e.day === "string" && Number.isFinite(e.plays) && Number.isFinite(e.best)) out[k] = e;
    }
  }
  return out;
}

function snapshot(store: Store, day: string, levels: Partial<Record<string, number>> = {}): MiniSnapshot {
  const out = {} as MiniSnapshot;
  for (const k of MINI_IDS) {
    const e = store[k];
    const total = PLAYS_PER_DAY + (MINI_BUILDING[k] ? EXTRA_PLAYS_PER_LEVEL * (levels[MINI_BUILDING[k]] ?? 0) : 0);
    out[k] = { left: e?.day === day ? Math.max(0, total - e.plays) : total, best: e?.best ?? 0 };
  }
  return out;
}

export async function GET() {
  const session = await auth();
  const day = dayKey();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, day, mini: snapshot({}, day) });
  try {
    const [row, levels] = await Promise.all([
      prisma.idleState.findUnique({ where: { userId_game: { userId: session.user.id, game: GAME } } }),
      buildingLevels(session.user.id),
    ]);
    return NextResponse.json({ loggedIn: true, day, mini: snapshot(parse(row?.data), day, levels) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { game, score }: zapíše kolo a vyplatí odměnu.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const game: unknown = body.game;
  const raw = Math.floor(Number(body.score));
  if (!isMiniId(game) || !Number.isFinite(raw) || raw < 0) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const def = MINI[game];
  const score = Math.min(def.maxScore, raw);
  const day = dayKey();
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: GAME } } });
      const store = parse(row?.data);
      const cur: Entry = store[game]?.day === day ? (store[game] as Entry) : { day, plays: 0, best: store[game]?.best ?? 0 };
      // vylepšená budova (pekárna, květinářství…) přidává kola navíc
      const extra = MINI_BUILDING[game] ? EXTRA_PLAYS_PER_LEVEL * (await buildingLevel(userId, MINI_BUILDING[game], tx)) : 0;
      if (cur.plays >= PLAYS_PER_DAY + extra) return { error: "limit" };
      cur.plays += 1;
      cur.best = Math.max(cur.best, score);
      store[game] = cur;
      const data = { mini: store } as unknown as Prisma.InputJsonValue;
      if (row) {
        const updated = await tx.idleState.updateMany({ where: { id: row.id, updatedAt: row.updatedAt }, data: { data } });
        if (updated.count === 0) return { error: "conflict" };
      } else {
        await tx.idleState.create({ data: { userId, game: GAME, data } });
      }
      const points = def.points(score);
      if (points > 0) {
        await tx.pointTransaction.create({ data: { userId, amount: points, reason: `Městečko: minihra ${game} ${day}` } });
        await tx.user.update({ where: { id: userId }, data: { points: { increment: points } } });
      }
      let xp = 0;
      const wanted = def.xp(score);
      if (wanted > 0) {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        const used = await tx.xpEvent.aggregate({ where: { userId, source: { in: ["game", "test"] }, createdAt: { gte: start } }, _sum: { amount: true } });
        xp = Math.min(wanted, Math.max(0, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
        if (xp > 0) await tx.xpEvent.create({ data: { userId, amount: xp, source: "game" } });
      }
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      return { ok: true, score, points, xp, mini: snapshot(store, day), balance: user?.points ?? 0 };
    });
    if ("error" in result) return NextResponse.json(result, { status: result.error === "conflict" ? 409 : 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
