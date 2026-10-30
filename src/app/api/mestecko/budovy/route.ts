import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BUILDINGS, MAX_BUILDING_LEVEL, buildReason, isBuildingId } from "@/lib/town-progress";
import { BUILD_GAME, buildingLevels, normalizeLevels } from "@/lib/town-progress-server";

// Vylepšování budov v městečku za body. Bonusy se uplatňují jinde (api/xp, api/shop, minihry, sběr).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, levels: {}, points: 0 });
  try {
    const [levels, user] = await Promise.all([
      buildingLevels(session.user.id),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { points: true } }),
    ]);
    return NextResponse.json({ loggedIn: true, levels, points: user?.points ?? 0 });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { upgrade: id }: zvýší budovu o úroveň a strhne body.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id: unknown = body.upgrade;
  if (!isBuildingId(id)) return NextResponse.json({ error: "unknown" }, { status: 400 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: BUILD_GAME } } });
      const levels = normalizeLevels(row?.data);
      const cur = levels[id] ?? 0;
      if (cur >= MAX_BUILDING_LEVEL) return { error: "max" as const };
      const price = BUILDINGS[id].costs[cur];
      const paid = await tx.user.updateMany({ where: { id: userId, points: { gte: price } }, data: { points: { decrement: price } } });
      if (paid.count === 0) return { error: "not-enough" as const };
      await tx.pointTransaction.create({ data: { userId, amount: -price, reason: buildReason(id, cur + 1) } });
      levels[id] = cur + 1;
      const data = { levels } as unknown as Prisma.InputJsonValue;
      await tx.idleState.upsert({ where: { userId_game: { userId, game: BUILD_GAME } }, create: { userId, game: BUILD_GAME, data }, update: { data } });
      const user = await tx.user.findUnique({ where: { id: userId }, select: { points: true } });
      return { ok: true as const, levels, points: user?.points ?? 0 };
    });
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
