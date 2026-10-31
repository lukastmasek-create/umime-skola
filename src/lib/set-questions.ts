import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { GameQuestion } from "@/i18n/game";
import { cleanSetQuestions } from "@/lib/live/logic";

// Vlastní sada přihlášeného uživatele převedená na otázky pro klasické hry (jen čtyři možnosti, bez id,
// takže se chyby nezapisují do opakování kurzů).
export async function loadOwnSet(id: string): Promise<{ title: string; questions: GameQuestion[] } | "login" | null> {
  const session = await auth().catch(() => null);
  const ownerId = session?.user?.id;
  if (!ownerId) return "login";
  const set = await prisma.questionSet.findFirst({ where: { id, ownerId } });
  if (!set) return null;
  const questions: GameQuestion[] = cleanSetQuestions(set.questions)
    .filter((q) => q.options.length === 4)
    .map((q) => ({
      prompt: q.prompt,
      options: q.options as [string, string, string, string],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      ...(q.image ? { image: q.image } : {}),
    }));
  return { title: set.title, questions };
}
