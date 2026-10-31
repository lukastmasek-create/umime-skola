import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { COLLECT_BONUS, COLLECT_COUNT, COLLECT_VALUE, bonusReason, collectReason, dailySpots } from "@/lib/town";
import { COLLECT_BONUS_PER_LEVEL, TREASURE_SETS, type TreasureSet } from "@/lib/town-progress";
import { buildingLevel, maybeTreasure } from "@/lib/town-progress-server";

async function snapshot(userId: string, day: string) {
  const since = new Date(day + "T00:00:00Z");
  const [rows, user] = await Promise.all([
    prisma.pointTransaction.findMany({ where: { userId, reason: { startsWith: "Městečko: " }, createdAt: { gte: since } }, select: { reason: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { points: true } }),
  ]);
  const spots = dailySpots(day);
  const collected = spots.filter((s) => rows.some((r) => r.reason === collectReason(day, s.idx))).map((s) => s.idx);
  return { loggedIn: true as const, day, spots, collected, bonus: rows.some((r) => r.reason === bonusReason(day)), points: user?.points ?? 0 };
}

export async function GET() {
  const session = await auth();
  const day = dayKey();
  if (!session?.user?.id) return NextResponse.json({ loggedIn: false, day, spots: dailySpots(day), collected: [], bonus: false });
  try {
    return NextResponse.json(await snapshot(session.user.id, day));
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

// POST { idx }: sebere věc na denním místě a přičte body; po osmé přijde bonus. Každé místo jednou za den.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const idx = Number(body.idx);
  const day = dayKey();
  const spot = dailySpots(day).find((s) => s.idx === idx);
  if (!Number.isInteger(idx) || !spot) return NextResponse.json({ error: "unknown" }, { status: 400 });
  const since = new Date(day + "T00:00:00Z");
  try {
    const gained = await prisma.$transaction(async (tx) => {
      // zámek na uživatele, aby dva souběžné požadavky nesebraly totéž dvakrát
      await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${userId}))`;
      const reason = collectReason(day, idx);
      const done = await tx.pointTransaction.findFirst({ where: { userId, reason, createdAt: { gte: since } }, select: { id: true } });
      if (done) return null;
      // vylepšené náměstí přidává body za každou sebranou věc
      let amount = COLLECT_VALUE[spot.kind] + COLLECT_BONUS_PER_LEVEL * (await buildingLevel(userId, "namesti", tx));
      await tx.pointTransaction.create({ data: { userId, amount, reason } });
      const count = await tx.pointTransaction.count({ where: { userId, reason: { startsWith: `Městečko: sběr ${day} #` }, createdAt: { gte: since } } });
      if (count >= COLLECT_COUNT) {
        await tx.pointTransaction.create({ data: { userId, amount: COLLECT_BONUS, reason: bonusReason(day) } });
        amount += COLLECT_BONUS;
      }
      await tx.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
      const piece = await maybeTreasure(userId, day, idx, tx);
      return { amount, piece };
    });
    if (gained === null) return NextResponse.json({ error: "owned" }, { status: 409 });
    const [set, i] = (gained.piece ?? "").split(":");
    const treasure = gained.piece ? TREASURE_SETS[set as TreasureSet]?.[Number(i)] ?? null : null;
    return NextResponse.json({ gained: gained.amount, treasure, ...(await snapshot(userId, day)) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
