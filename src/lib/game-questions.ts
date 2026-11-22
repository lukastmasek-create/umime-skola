import { prisma } from "@/lib/prisma";
import type { GameQuestion } from "@/i18n/game";

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Otázky kurzu pro hry: jen otázky dané obtížnosti (každá úroveň má vlastní sadu).
export async function loadGameQuestions(
  courseSlug: string,
  category: "ZAKLADNI" | "STREDNI" | "PRIJIMACKY" | "MATURITA",
  difficulty: number,
  size: number,
): Promise<{ title: string; questions: GameQuestion[]; hasLevel: boolean } | null> {
  const course = await prisma.course.findFirst({
    where: { slug: courseSlug, category, published: true },
    select: {
      title: true,
      levels: { where: { order: difficulty, published: true }, select: { id: true } },
      questions: {
        where: { difficulty },
        select: { id: true, prompt: true, options: true, correctIndex: true, explanation: true },
      },
    },
  });
  if (!course) return null;
  const questions = shuffle(course.questions)
    .filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4)
    .slice(0, size)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt.replaceAll("___", "…"),
      options: q.options as GameQuestion["options"],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));
  return { title: course.title, questions, hasLevel: course.levels.length > 0 };
}
