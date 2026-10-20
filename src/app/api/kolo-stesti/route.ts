import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WHEEL_PRIZES, WHEEL_SPIN_COOLDOWN_MS, pickWheelPrizeIndex } from "@/lib/wheel";

export async function POST() {
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
  if (user.lastWheelSpinAt) {
    const nextSpinAt = new Date(user.lastWheelSpinAt.getTime() + WHEEL_SPIN_COOLDOWN_MS);
    if (nextSpinAt > now) {
      return NextResponse.json(
        { error: "Kolo dnes už bylo roztočeno.", nextSpinAt: nextSpinAt.toISOString() },
        { status: 429 }
      );
    }
  }

  const prizeIndex = pickWheelPrizeIndex();
  const amount = WHEEL_PRIZES[prizeIndex].amount;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: { increment: amount },
        lastWheelSpinAt: now,
      },
      select: { points: true },
    });
    await tx.pointTransaction.create({
      data: { userId, amount, reason: "Kolo štěstí" },
    });
    await tx.xpEvent.create({ data: { userId, amount, source: "wheel" } });
    return updatedUser;
  });

  return NextResponse.json({
    prizeIndex,
    amount,
    points: updated.points,
    nextSpinAt: new Date(now.getTime() + WHEEL_SPIN_COOLDOWN_MS).toISOString(),
  });
}
