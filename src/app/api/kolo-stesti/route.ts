import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WHEEL_EXTRA_PER_DAY, WHEEL_EXTRA_PRICE, WHEEL_EXTRA_REASON, WHEEL_PRIZES, WHEEL_SPIN_COOLDOWN_MS, pickWheelPrizeIndex } from "@/lib/wheel";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { extra?: unknown };
  const extra = body.extra === true;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true, lastWheelSpinAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Uživatel nenalezen." }, { status: 404 });
  }

  const now = new Date();
  let extraSpin = false;
  if (user.lastWheelSpinAt) {
    const nextSpinAt = new Date(user.lastWheelSpinAt.getTime() + WHEEL_SPIN_COOLDOWN_MS);
    if (nextSpinAt > now && extra) {
      extraSpin = true;
    } else if (nextSpinAt > now) {
      return NextResponse.json(
        { error: "Kolo dnes už bylo roztočeno.", nextSpinAt: nextSpinAt.toISOString() },
        { status: 429 }
      );
    }
  }

  // Extra točení: platí se body, nejvýš WHEEL_EXTRA_PER_DAY za den (UTC), bezplatné točení se tím nemění.
  if (extraSpin) {
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const used = await prisma.pointTransaction.count({ where: { userId, reason: WHEEL_EXTRA_REASON, createdAt: { gte: dayStart } } });
    if (used >= WHEEL_EXTRA_PER_DAY) {
      return NextResponse.json({ error: "Dnešní extra točení jsou vyčerpaná." }, { status: 429 });
    }
    if (user.points < WHEEL_EXTRA_PRICE) {
      return NextResponse.json({ error: `Na extra točení potřebuješ ${WHEEL_EXTRA_PRICE} bodů.` }, { status: 400 });
    }
  }

  const prizeIndex = pickWheelPrizeIndex();
  const amount = WHEEL_PRIZES[prizeIndex].amount;

  const updated = await prisma.$transaction(async (tx) => {
    if (extraSpin) {
      const paid = await tx.user.updateMany({ where: { id: userId, points: { gte: WHEEL_EXTRA_PRICE } }, data: { points: { decrement: WHEEL_EXTRA_PRICE } } });
      if (paid.count === 0) throw new Error("not-enough-points");
      await tx.pointTransaction.create({ data: { userId, amount: -WHEEL_EXTRA_PRICE, reason: WHEEL_EXTRA_REASON } });
    }
    const updatedUser = await tx.user.update({
      where: { id: userId },
      // U extra točení zůstává čas bezplatného točení beze změny.
      data: extraSpin ? { points: { increment: amount } } : { points: { increment: amount }, lastWheelSpinAt: now },
      select: { points: true },
    });
    await tx.pointTransaction.create({
      data: { userId, amount, reason: "Kolo štěstí" },
    });
    // XP jen za bezplatné točení, ať se úroveň nedá koupit za body.
    if (!extraSpin) await tx.xpEvent.create({ data: { userId, amount, source: "wheel" } });
    return updatedUser;
  });

  return NextResponse.json({
    prizeIndex,
    amount,
    points: updated.points,
    nextSpinAt: extraSpin
      ? new Date(user.lastWheelSpinAt!.getTime() + WHEEL_SPIN_COOLDOWN_MS).toISOString()
      : new Date(now.getTime() + WHEEL_SPIN_COOLDOWN_MS).toISOString(),
  });
}
