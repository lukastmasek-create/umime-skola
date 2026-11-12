import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, subscriptionCoversUser, type SubscriptionRecord, type SubscriptionTier } from "@/lib/pro";
import { hasFullAccessEmail } from "@/lib/full-access";
import { LiveError } from "@/lib/live/service";
import { requireUserId } from "@/lib/teams/server";

const ALL_TIERS: SubscriptionTier[] = ["INDIVIDUAL", "FAMILY", "SCHOOL"];

// Které tarify právě teď pokrývají účet? Načte jen předplatná, která by mohla účet pokrývat.
// Účty s plným přístupem mají odemčené všechny tarify.
export async function proTiers(userId: string, now: Date = new Date()): Promise<Set<SubscriptionTier>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, subscriptionId: true, schoolId: true, email: true },
  });
  if (!user) return new Set();
  if (hasFullAccessEmail(user.email)) return new Set(ALL_TIERS);

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

  return new Set(candidates.filter((sub) => isSubscriptionActive(sub, now) && subscriptionCoversUser(sub, user)).map((sub) => sub.tier));
}

// Má účet právě teď PRO (kterýkoli tarif)?
export async function hasPro(userId: string, now: Date = new Date()): Promise<boolean> {
  return (await proTiers(userId, now)).size > 0;
}

// Brána pro PRO funkce: přihlášený účet s aktivním předplatným (nebo s plným přístupem).
export async function requireProUserId(): Promise<string> {
  const userId = await requireUserId();
  if (!(await hasPro(userId))) throw new LiveError("pro-required", 402);
  return userId;
}

/** Brána pro funkce jen pro rodinný nebo školní tarif. */
export async function requireTierUserId(tier: "FAMILY" | "SCHOOL"): Promise<string> {
  const userId = await requireUserId();
  const tiers = await proTiers(userId);
  if (tiers.size === 0) throw new LiveError("pro-required", 402);
  if (!tiers.has(tier)) throw new LiveError("tier-required", 402);
  return userId;
}
