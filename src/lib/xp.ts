import { prisma } from "@/lib/prisma";

export async function getXp(userId: string): Promise<number> {
  const result = await prisma.xpEvent.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
