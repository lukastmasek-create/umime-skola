import { prisma } from "@/lib/prisma";
import type { GameQuestion } from "@/i18n/game";

// Otázky kurzu pro hry: na jednu úroveň připadá v kurzu jen pár otázek, takže kolo doplníme
// z nejbližších obtížností (nejdřív stejná, pak sousední), ať je dost na výběr.
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
        select: { id: true, prompt: true, options: true, correctIndex: true, explanation: true, difficulty: true },
      },
    },
  });
  if (!course) return null;
  const questions = course.questions
    .filter((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4)
    .sort((a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty))
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
