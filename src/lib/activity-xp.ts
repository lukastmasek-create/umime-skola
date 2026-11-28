import type { Prisma } from "@prisma/client";
import { DAILY_ACTIVITY_XP_CAP, MAX_XP_PER_CLAIM } from "@/lib/progression";

export const cappedActivitySources = ["game", "test", "live-verified", "daily-verified"];
export const rankedActivitySources = ["live-verified", "daily-verified"];
type ActivitySource = "game" | "test" | "live-verified" | "daily-verified";

export async function lockActivityUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
}

// Call inside the same transaction that locks the user and commits the result.
export async function awardActivityXp(tx: Prisma.TransactionClient, userId: string, requested: number, source: ActivitySource, now = Date.now()) {
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const used = await tx.xpEvent.aggregate({
    where: { userId, source: { in: cappedActivitySources }, createdAt: { gte: startOfDay } },
    _sum: { amount: true },
  });
  const gained = Math.max(0, Math.min(requested, MAX_XP_PER_CLAIM, DAILY_ACTIVITY_XP_CAP - (used._sum.amount ?? 0)));
  if (gained > 0) await tx.xpEvent.create({ data: { userId, amount: gained, source } });
  return gained;
}
