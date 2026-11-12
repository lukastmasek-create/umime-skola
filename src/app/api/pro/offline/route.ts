import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/live/http";
import { LiveError } from "@/lib/live/service";
import { requireProUserId } from "@/lib/pro-server";
import { courseHref } from "@/lib/pro-tools/server";

export const dynamic = "force-dynamic";

const MAX_QUESTIONS = 200;

// Offline režim (PRO): ?q= hledá kurzy ke stažení, ?slug= vrátí otázky kurzu i se správnými odpověďmi
// pro uložení do zařízení.
export async function GET(request: Request) {
  return handle(async () => {
    await requireProUserId();
    const params = new URL(request.url).searchParams;
    const slug = params.get("slug");
    if (slug) {
      const course = await prisma.course.findFirst({
        where: { slug, published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          questions: {
            where: { options: { isEmpty: false } },
            orderBy: { order: "asc" },
            take: MAX_QUESTIONS,
            select: { id: true, prompt: true, options: true, correctIndex: true, explanation: true },
          },
        },
      });
      if (!course) throw new LiveError("course-not-found", 404);
      return { slug: course.slug, title: course.title, href: courseHref(course.category, course.slug), questions: course.questions, savedAt: Date.now() };
    }
    const q = (params.get("q") ?? "").trim().slice(0, 60);
    const courses = await prisma.course.findMany({
      where: { published: true, ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}) },
      orderBy: { title: "asc" },
      take: 30,
      select: { slug: true, title: true, category: true, _count: { select: { questions: true } } },
    });
    return {
      courses: courses
        .filter((c) => c._count.questions > 0)
        .map((c) => ({ slug: c.slug, title: c.title, category: c.category, questions: Math.min(MAX_QUESTIONS, c._count.questions) })),
    };
  });
}
