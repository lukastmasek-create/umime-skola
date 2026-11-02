import { prisma } from "@/lib/prisma";
import { userHasPro, type SubscriptionRecord } from "@/lib/pro";

// Má účet právě teď PRO? Načte jen předplatná, která by mohla účet pokrývat.
export async function hasPro(userId: string, now: Date = new Date()): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, subscriptionId: true, schoolId: true },
  });
  if (!user) return false;

  const candidates: SubscriptionRecord[] = await prisma.subscription.findMany({
    where: {
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      AND: [
        {
          OR: [
            { ownerId: user.id },
            ...(user.subscriptionId ? [{ id: user.subscriptionId }] : []),
            ...(user.schoolId ? [{ tier: "SCHOOL" as const, schoolId: user.schoolId }] : []),
          ],
        },
      ],
    },
    select: { id: true, tier: true, ownerId: true, schoolId: true, startsAt: true, endsAt: true },
  });

  return userHasPro(user, candidates, now);
}
