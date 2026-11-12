import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/live/http";
import { requireProUserId } from "@/lib/pro-server";
import { courseHref, loadReview } from "@/lib/pro-tools/server";
import { dayKey } from "@/lib/gamify";

export const dynamic = "force-dynamic";

// Sešit chyb (PRO): otázky, které hráč zodpověděl špatně a ještě je nezvládl, i s vysvětlením.
// Zdrojem je stav opakování (krabičky), takže se sešit plní sám při každé chybě.
export async function GET() {
  return handle(async () => {
    const userId = await requireProUserId();
    const state = await loadReview(userId);
    const today = dayKey(new Date());
    const tracked = Object.entries(state.items).sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due));
    const rows = tracked.length
      ? await prisma.question.findMany({
          where: { id: { in: tracked.map(([id]) => id) } },
          select: {
            id: true,
            prompt: true,
            options: true,
            correctIndex: true,
            answers: true,
            explanation: true,
            course: { select: { id: true, title: true, slug: true, category: true } },
          },
        })
      : [];
    const byId = new Map(rows.map((q) => [q.id, q]));
    const entries = tracked
      .map(([id, item]) => {
        const q = byId.get(id);
        if (!q) return null;
        return {
          id,
          prompt: q.prompt,
          answer: q.options[q.correctIndex] ?? q.answers[0] ?? "",
          explanation: q.explanation,
          box: item.box,
          due: item.due <= today,
          courseId: q.course.id,
          courseTitle: q.course.title,
          courseHref: courseHref(q.course.category, q.course.slug),
        };
      })
      .filter((e): e is NonNullable<typeof e> => !!e);
    return { entries, total: entries.length };
  });
}
