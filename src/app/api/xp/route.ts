import { NextResponse } from "next/server";
import { buildingLevel } from "@/lib/town-progress-server";
import { roomXpPercent } from "@/lib/room-server";
import { XP_BONUS_PER_LEVEL } from "@/lib/town-progress";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { DAILY_ACTIVITY_XP_CAP, MAX_XP_PER_CLAIM, levelProgress } from "@/lib/progression";

const ACTIVITY_SOURCES = ["game", "test"];

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const source = typeof body?.source === "string" ? body.source : "";
  const requested = Math.floor(Number(body?.amount));
  if (!ACTIVITY_SOURCES.includes(source) || !Number.isFinite(requested) || requested <= 0) {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const usedToday = await prisma.xpEvent.aggregate({
      where: { userId, source: { in: ACTIVITY_SOURCES }, createdAt: { gte: startOfDay } },
      _sum: { amount: true },
    });
    const remaining = Math.max(0, DAILY_ACTIVITY_XP_CAP - (usedToday._sum.amount ?? 0));
    // vylepšená škola (testy) a herna (hry) v městečku přidávají XP
    const building = source === "test" ? "skola" : source === "game" ? "herna" : null;
    const bonusLevel = building ? await buildingLevel(userId, building) : 0;
    // nábytek v pokoji (stůl, knihovna, vitrína) přidává další procenta
    const roomBonus = await roomXpPercent(userId, source);
    const boosted = Math.round(requested * (1 + (XP_BONUS_PER_LEVEL * bonusLevel + roomBonus) / 100));
    const gained = Math.min(boosted, MAX_XP_PER_CLAIM, remaining);

    if (gained > 0) {
      await prisma.xpEvent.create({ data: { userId, amount: gained, source } });
    }
    return NextResponse.json({
      gained,
      capped: gained < Math.min(requested, MAX_XP_PER_CLAIM),
      ...levelProgress(await getXp(userId)),
    });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
