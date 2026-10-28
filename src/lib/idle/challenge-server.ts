// Společná serverová pomůcka pro výzvy: boost ze série otázek se přičítá k bonusům ve všech třech hrách.
import { prisma } from "@/lib/prisma";
import { CHALLENGE_GAME, boostBonus, normalizeChallenge, type ChGame } from "@/lib/idle/challenge";

type Db = Pick<typeof prisma, "idleState">;

/** Zrychlení hry z právě běžícího boostu (0, když hráč nemá aktivní sérii). */
export async function challengeBoost(db: Db, userId: string, game: ChGame, now: number): Promise<number> {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: CHALLENGE_GAME } }, select: { data: true } });
  if (!row) return 0;
  return boostBonus(normalizeChallenge(row.data, now).games[game], now);
}
