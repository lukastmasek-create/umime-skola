import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopBlocked } from "@/lib/parental";
import { LIMITED_ITEMS, getLimited } from "@/lib/limited";

class Err extends Error {}

async function snapshot(userId: string | undefined) {
  const [counts, mine, user] = await Promise.all([
    prisma.limitedCopy.groupBy({ by: ["itemId"], _count: { _all: true } }),
    userId ? prisma.limitedCopy.findMany({ where: { userId }, select: { itemId: true, serial: true } }) : [],
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { points: true } }) : null,
  ]);
  const sold = Object.fromEntries(counts.map((c) => [c.itemId, c._count._all]));
  return {
    loggedIn: !!userId,
    points: user?.points ?? 0,
    items: LIMITED_ITEMS.map((i) => ({ id: i.id, sold: sold[i.id] ?? 0, serial: mine.find((m) => m.itemId === i.id)?.serial ?? null })),
  };
}

export async function GET() {
  const session = await auth();
  try {
    return NextResponse.json(await snapshot(session?.user?.id));
  } catch (error) {
    console.error("limited GET failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  if (await shopBlocked(userId)) return NextResponse.json({ error: "parental" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { id?: unknown };
  const item = typeof body.id === "string" ? getLimited(body.id) : undefined;
  if (!item) return NextResponse.json({ error: "unknown-item" }, { status: 400 });

  try {
    await prisma.$transaction(
      async (t) => {
        if (await t.limitedCopy.findUnique({ where: { itemId_userId: { itemId: item.id, userId } } })) throw new Err("owned");
        const serial = (await t.limitedCopy.count({ where: { itemId: item.id } })) + 1;
        if (serial > item.edition) throw new Err("sold-out");
        const paid = await t.user.updateMany({ where: { id: userId, points: { gte: item.price } }, data: { points: { decrement: item.price } } });
        if (paid.count === 0) throw new Err("not-enough-points");
        await t.pointTransaction.create({ data: { userId, amount: -item.price, reason: `shop:limited:${item.id}:#${serial}` } });
        await t.limitedCopy.create({ data: { itemId: item.id, serial, userId } });
        const key = `${item.kind}:${item.ref}`;
        await t.unlock.upsert({ where: { userId_key: { userId, key } }, create: { userId, key }, update: {} });
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    return NextResponse.json(await snapshot(userId));
  } catch (error) {
    if (error instanceof Err) return NextResponse.json({ error: error.message }, { status: 400 });
    // Dva nákupy naráz o stejné číslo: druhý to má zkusit znovu.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "retry" }, { status: 409 });
    console.error("limited POST failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
