import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROOMS, ROOM_REWARDS, MIN_ESCAPE_SECONDS, ESCAPE_MASTER_UNLOCK } from "@/lib/escape/rewards";
import { computeStars } from "@/lib/escape/score";

const int = (value: unknown) => Math.floor(Number(value));

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const roomId = typeof body?.room === "string" ? body.room : "";
  const room = ROOMS[roomId];
  const reward = ROOM_REWARDS[roomId];
  const seconds = int(body?.seconds);
  const mistakes = int(body?.mistakes);
  const hints = int(body?.hints);
  const relaxed = body?.relaxed === true;

  if (
    !room ||
    !reward ||
    ![seconds, mistakes, hints].every((n) => Number.isFinite(n) && n >= 0) ||
    seconds < MIN_ESCAPE_SECONDS ||
    seconds > 6 * 60 * 60
  ) {
    return NextResponse.json({ error: "Neplatný výsledek." }, { status: 400 });
  }

  const stars = computeStars({
    seconds,
    mistakes,
    hints,
    relaxed,
    limitSeconds: room.timeLimitSeconds,
  });

  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const [previous, today] = await Promise.all([
      prisma.escapeRun.count({ where: { userId, room: roomId } }),
      prisma.escapeRun.count({ where: { userId, room: roomId, createdAt: { gte: startOfDay } } }),
    ]);
    const firstWin = previous === 0;
    const xpGained = firstWin ? reward.firstXp : today === 0 ? reward.repeatXp : 0;

    let masterUnlocked = false;
    await prisma.$transaction(async (tx) => {
      await tx.escapeRun.create({
        data: { userId, room: roomId, seconds, stars, mistakes, hints, relaxed },
      });
      if (xpGained > 0) {
        await tx.xpEvent.create({ data: { userId, amount: xpGained, source: "escape" } });
      }
      if (firstWin) {
        await tx.unlock.createMany({
          data: reward.unlocks.map((key) => ({ userId, key })),
          skipDuplicates: true,
        });
      }
      // Dokončil/a všechny místnosti? Pak přibude titul Mistr útěku (jen jednou).
      const done = await tx.escapeRun.findMany({ where: { userId }, distinct: ["room"], select: { room: true } });
      if (Object.keys(ROOMS).every((id) => done.some((d) => d.room === id))) {
        const added = await tx.unlock.createMany({ data: [{ userId, key: ESCAPE_MASTER_UNLOCK }], skipDuplicates: true });
        masterUnlocked = added.count > 0;
      }
    });

    return NextResponse.json({
      stars,
      xpGained,
      firstWin,
      unlocked: [...(firstWin ? reward.unlocks : []), ...(masterUnlocked ? [ESCAPE_MASTER_UNLOCK] : [])],
    });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
