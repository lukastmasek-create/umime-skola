import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/live/http";
import { requireProUserId } from "@/lib/pro-server";
import { courseHref, loadReview } from "@/lib/pro-tools/server";
import { buildStudyPlan, type FreshCourse, type WeakCourse } from "@/lib/pro-tools/plan";
import { DAY_MS, dayKey } from "@/lib/gamify";
import { dueIds } from "@/lib/review";

export const dynamic = "force-dynamic";

// Osobní plán učení (PRO): týdenní plán po 15 minutách podle slabých míst v opakování.
export async function GET() {
  return handle(async () => {
    const userId = await requireProUserId();
    const state = await loadReview(userId);
    const now = Date.now();
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
      top.length
        ? prisma.course.findMany({ where: { id: { in: top.map(([id]) => id) } }, select: { id: true, title: true, slug: true, category: true } })
        : Promise.resolve([]),
      prisma.course.findMany({
        where: { published: true, id: { notIn: knownIds } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, category: true },
      }),
    ]);
    const info = new Map(weakRows.map((c) => [c.id, c]));
    const weak: WeakCourse[] = top
      .filter(([id]) => info.has(id))
      .map(([id, s]) => {
        const c = info.get(id)!;
        return { courseId: id, title: c.title, href: courseHref(c.category, c.slug), low: s.low, count: s.count };
      });
    const fresh: FreshCourse[] = freshRows.map((c) => ({ courseId: c.id, title: c.title, href: courseHref(c.category, c.slug) }));

    const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(now + i * DAY_MS)));
    return { plan: buildStudyPlan({ days, due: due.length, weak, fresh }), due: due.length };
  });
}
