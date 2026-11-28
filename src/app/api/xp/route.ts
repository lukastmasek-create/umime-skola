import { sameOriginMutation } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { buildingLevel } from "@/lib/town-progress-server";
import { roomXpPercent } from "@/lib/room-server";
import { craftXpPercent } from "@/lib/craft-server";
import { collectionXpBonusPercent } from "@/lib/collection-server";
import { XP_BONUS_PER_LEVEL } from "@/lib/town-progress";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXp } from "@/lib/xp";
import { awardActivityXp, lockActivityUser } from "@/lib/activity-xp";
import { withinRateLimit } from "@/lib/rate-limit";
import { MAX_XP_PER_CLAIM, levelProgress } from "@/lib/progression";

export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Nejsi přihlášený/á." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const source = typeof body?.source === "string" ? body.source : "";
  const requested = Math.floor(Number(body?.amount));
  if ((source !== "game" && source !== "test") || !Number.isFinite(requested) || requested <= 0) {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  try {
    if (!(await withinRateLimit(`xp:${userId}`, 35, 60))) {
      return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }
    // vylepšená škola (testy) a herna (hry) v městečku přidávají XP
    const building = source === "test" ? "skola" : source === "game" ? "herna" : null;
    const bonusLevel = building ? await buildingLevel(userId, building) : 0;
    // nábytek v pokoji (stůl, knihovna, vitrína) přidává další procenta
    const roomBonus = await roomXpPercent(userId, source);
    // craftěné svitky (Craftování v profilu) přidávají XP na omezenou dobu, nejvýš +50 %
    const craftBonus = await craftXpPercent(userId);
    // sbírka karet přidává 1 % za každou různou kartu (nejvýš 16 %)
    const collectionBonus = await collectionXpBonusPercent(userId);
    const boosted = Math.round(Math.min(requested, MAX_XP_PER_CLAIM) * (1 + (XP_BONUS_PER_LEVEL * bonusLevel + roomBonus + craftBonus + collectionBonus) / 100));
    // Arcade and practice games keep personal XP. Competitive XP has separate server-controlled sources.
    const gained = await prisma.$transaction(async (tx) => {
      await lockActivityUser(tx, userId);
      return awardActivityXp(tx, userId, boosted, source);
    });
    return NextResponse.json({
      gained,
      capped: gained < Math.min(requested, MAX_XP_PER_CLAIM),
      ...levelProgress(await getXp(userId)),
    });
  } catch {
    return NextResponse.json({ error: "Databáze není dostupná." }, { status: 503 });
  }
}
