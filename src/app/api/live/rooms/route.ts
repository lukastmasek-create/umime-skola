import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/live/http";
import { cleanQuestions, cleanSettings, LIMITS, MODES } from "@/lib/live/logic";
import { createRoom, LiveError } from "@/lib/live/service";
import type { LiveMode, LiveQuestion } from "@/lib/live/types";

export const dynamic = "force-dynamic";

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Hru může založit kdokoliv (i bez účtu); kdo ji založí, je v ní učitel.
export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;

    const mode = MODES.includes(body.mode as LiveMode) ? (body.mode as LiveMode) : "QUIZ";
    const source = (body.source && typeof body.source === "object" ? body.source : {}) as Record<string, unknown>;
    const count = Math.max(1, Math.min(LIMITS.questions[1], Number(source.count) || 10));

    let questions: LiveQuestion[] = [];
    let title = typeof body.title === "string" ? body.title : "";

    if (source.type === "set") {
      if (!userId) throw new LiveError("login-required", 401);
      const set = await prisma.questionSet.findFirst({ where: { id: String(source.id), ownerId: userId } });
      if (!set) throw new LiveError("set-not-found", 404);
      questions = shuffle(cleanQuestions(set.questions)).slice(0, count);
      title = title || set.title;
    } else if (source.type === "course") {
      const difficulty = Number(source.difficulty);
      const course = await prisma.course.findFirst({ where: { slug: String(source.slug), published: true }, select: { id: true, title: true } });
      if (!course) throw new LiveError("course-not-found", 404);
      const rows = await prisma.question.findMany({
        where: { courseId: course.id, ...(Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5 ? { difficulty } : {}) },
        select: { prompt: true, options: true, correctIndex: true, explanation: true },
      });
      questions = cleanQuestions(shuffle(rows).slice(0, count));
      title = title || course.title;
    } else {
      throw new LiveError("bad-source");
    }
    return createRoom({ hostUserId: userId, title, mode, questions, settings: cleanSettings(body.settings) });
  });
}
