import { prisma } from "@/lib/prisma";
import { userHasPro, type SubscriptionRecord } from "@/lib/pro";
import { hasFullAccessEmail } from "@/lib/full-access";
import { LiveError } from "@/lib/live/service";
import { requireUserId } from "@/lib/teams/server";

// Má účet právě teď PRO? Načte jen předplatná, která by mohla účet pokrývat.
export async function hasPro(userId: string, now: Date = new Date()): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, subscriptionId: true, schoolId: true, email: true },
  });
  if (!user) return false;
  // Účty s plným přístupem mají všechno odemčené, tedy i PRO.
  if (hasFullAccessEmail(user.email)) return true;

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

// Brána pro PRO funkce: přihlášený účet s aktivním předplatným (nebo s plným přístupem).
export async function requireProUserId(): Promise<string> {
  const userId = await requireUserId();
  if (!(await hasPro(userId))) throw new LiveError("pro-required", 402);
  return userId;
}
