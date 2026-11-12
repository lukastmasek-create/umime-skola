import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REVIEW_GAME, normalizeReview, type ReviewState } from "@/lib/review";
import { CATEGORIES } from "@/lib/taxonomy";

export async function loadReview(userId: string): Promise<ReviewState> {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } } });
  return normalizeReview(row?.data);
}

export async function saveGameState(userId: string, game: string, data: unknown) {
  const json = data as Prisma.InputJsonValue;
  await prisma.idleState.upsert({
    where: { userId_game: { userId, game } },
    create: { userId, game, data: json },
    update: { data: json },
  });
}

export async function loadGameState(userId: string, game: string): Promise<unknown> {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game } } });
  return row?.data ?? null;
}

/** Cesta ke kurzu bez jazyka, např. "zakladni/zlomky". */
export function courseHref(category: string, slug: string): string {
  return `${CATEGORIES.find((c) => c.value === category)?.slug ?? "zakladni"}/${slug}`;
}
