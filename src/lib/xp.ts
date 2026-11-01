import { prisma } from "@/lib/prisma";
import { FULL_ACCESS_XP, isFullAccessUser } from "@/lib/full-access";

export async function getXp(userId: string): Promise<number> {
  const result = await prisma.xpEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const xp = result._sum.amount ?? 0;
  // Účty s plným přístupem mají nejvyšší úroveň, aby nic nezůstalo zamčené.
  return (await isFullAccessUser(userId)) ? Math.max(xp, FULL_ACCESS_XP) : xp;
}
