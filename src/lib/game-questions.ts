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
  // Míchání: uvnitř každé vzdálenosti od obtížnosti otázky zamíchej, ať se kolo pokaždé skládá jinak
  // a hry se neopakují. Nejdřív jdou otázky stejné obtížnosti, pak sousední.
  type Row = (typeof course.questions)[number];
  const byDistance = new Map<number, Row[]>();
  for (const q of course.questions) {
    if (q.options.length !== 4 || q.correctIndex < 0 || q.correctIndex >= 4) continue;
    const d = Math.abs(q.difficulty - difficulty);
    byDistance.set(d, [...(byDistance.get(d) ?? []), q]);
  }
  const questions = [...byDistance.keys()]
    .sort((a, b) => a - b)
    .flatMap((d) => shuffle<Row>(byDistance.get(d) ?? []))
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
