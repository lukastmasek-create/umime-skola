import { prisma } from "@/lib/prisma";
import { collectionXpPercent, normalizeCards } from "@/lib/collection";

// Procentní bonus k XP z aktivit podle počtu různých karet ve sbírce.
export async function collectionXpBonusPercent(userId: string): Promise<number> {
  try {
    const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: "cards" } }, select: { data: true } });
    return collectionXpPercent(normalizeCards(row?.data).owned);
  } catch {
    return 0;
  }
}
