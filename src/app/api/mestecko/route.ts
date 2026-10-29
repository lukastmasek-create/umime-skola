import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/shop";
import { COLLECT_BONUS, COLLECT_COUNT, COLLECT_VALUE, bonusReason, collectReason, dailySpots } from "@/lib/town";

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
      let amount = COLLECT_VALUE[spot.kind];
      await tx.pointTransaction.create({ data: { userId, amount, reason } });
      const count = await tx.pointTransaction.count({ where: { userId, reason: { startsWith: `Městečko: sběr ${day} #` }, createdAt: { gte: since } } });
      if (count >= COLLECT_COUNT) {
        await tx.pointTransaction.create({ data: { userId, amount: COLLECT_BONUS, reason: bonusReason(day) } });
        amount += COLLECT_BONUS;
      }
      await tx.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
      return amount;
    });
    if (gained === null) return NextResponse.json({ error: "owned" }, { status: 409 });
    return NextResponse.json({ gained, ...(await snapshot(userId, day)) });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
