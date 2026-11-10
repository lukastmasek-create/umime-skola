import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopBlocked } from "@/lib/parental";
import { withinRateLimit } from "@/lib/rate-limit";
import { findVoucher, voucherKey } from "@/lib/vouchers";

class AlreadyUsed extends Error {}

// Uplatnění voucheru: body se připíšou a kód se uloží jako odemčení, takže jde použít jen jednou na účet.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "login-required" }, { status: 401 });
  if (await shopBlocked(userId)) return NextResponse.json({ error: "parental" }, { status: 403 });
  // Brání zkoušení kódů naslepo.
  if (!(await withinRateLimit(`voucher:${userId}`, 10, 600))) return NextResponse.json({ error: "rate" }, { status: 429 });

  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  const voucher = findVoucher(body.code);
  if (!voucher) return NextResponse.json({ error: "unknown-code" }, { status: 400 });

  try {
    const points = await prisma.$transaction(async (t) => {
      const key = voucherKey(voucher);
      if (await t.unlock.findUnique({ where: { userId_key: { userId, key } } })) throw new AlreadyUsed();
      await t.unlock.create({ data: { userId, key } });
      await t.pointTransaction.create({ data: { userId, amount: voucher.points, reason: `shop:voucher:${voucher.code}` } });
      const user = await t.user.update({ where: { id: userId }, data: { points: { increment: voucher.points } }, select: { points: true } });
      return user.points;
    });
    return NextResponse.json({ ok: true, added: voucher.points, label: voucher.label, points });
  } catch (error) {
    if (error instanceof AlreadyUsed || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      return NextResponse.json({ error: "used" }, { status: 400 });
    }
    console.error("voucher failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
