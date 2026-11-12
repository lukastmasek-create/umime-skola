import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REVIEW_GAME, dueIds, normalizeReview, type ReviewState } from "@/lib/review";
import type { FreshCourse, WeakCourse } from "@/lib/pro-tools/plan";
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

/** Slabá místa (nejvíc chyb v opakování) a nové kurzy, ze kterých se skládají plány. */
export async function loadPlanInputs(userId: string, now: number = Date.now()): Promise<{ due: number; weak: WeakCourse[]; fresh: FreshCourse[]; state: ReviewState }> {
  const state = await loadReview(userId);
  const due = dueIds(state, now);
  const dueSet = new Set(due);
  const stat = new Map<string, { count: number; low: number }>();
  for (const [id, item] of Object.entries(state.items)) {
    if (!item.course) continue;
    const s = stat.get(item.course) ?? { count: 0, low: 0 };
    s.count++;
    if (item.box <= 1 || dueSet.has(id)) s.low++;
    stat.set(item.course, s);
  }
  const top = [...stat.entries()].sort((a, b) => b[1].low - a[1].low || b[1].count - a[1].count).slice(0, 5);
  const knownIds = [...new Set([...Object.keys(state.courses), ...top.map(([id]) => id)])];
  const [weakRows, freshRows] = await Promise.all([
    top.length ? prisma.course.findMany({ where: { id: { in: top.map(([id]) => id) } }, select: { id: true, title: true, slug: true, category: true } }) : Promise.resolve([]),
    prisma.course.findMany({ where: { published: true, id: { notIn: knownIds } }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, slug: true, category: true } }),
  ]);
  const info = new Map(weakRows.map((c) => [c.id, c]));
  const weak: WeakCourse[] = top
    .filter(([id]) => info.has(id))
    .map(([id, s]) => {
      const c = info.get(id)!;
      return { courseId: id, title: c.title, href: courseHref(c.category, c.slug), low: s.low, count: s.count };
    });
  const fresh: FreshCourse[] = freshRows.map((c) => ({ courseId: c.id, title: c.title, href: courseHref(c.category, c.slug) }));
  return { due: due.length, weak, fresh, state };
}
