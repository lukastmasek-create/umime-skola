import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { GameQuestion } from "@/i18n/game";
import type { GameSlug } from "@/lib/games";
import { cleanSetQuestions, isChoice } from "@/lib/live/logic";
import type { SetItem } from "@/lib/live/types";

const FILL = "–";

// Vlastní sada přihlášeného uživatele. Položky zůstávají tak, jak jsou uložené (otázky, spojování, slova).
export async function loadOwnSet(id: string): Promise<{ title: string; items: SetItem[] } | "login" | null> {
  const session = await auth().catch(() => null);
  const ownerId = session?.user?.id;
  if (!ownerId) return "login";
  const set = await prisma.questionSet.findFirst({ where: { id, ownerId } });
  if (!set) return null;
  return { title: set.title, items: cleanSetQuestions(set.questions) };
}

/**
 * Otázky pro jednu klasickou hru. Klasické hry berou `GameQuestion`: u spojování je levá strana zadání
 * a pravá správná odpověď, u křížovky je nápověda zadání a slovo správná odpověď. Hry s možnostmi
 * dostanou jen otázky se čtyřmi možnostmi, jako dřív.
 */
export function poolFor(slug: GameSlug, items: SetItem[]): GameQuestion[] {
  const choice: GameQuestion[] = items
    .filter(isChoice)
    .filter((q) => q.options.length === 4)
    .map((q) => ({
      prompt: q.prompt,
      options: q.options as [string, string, string, string],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      ...(q.image ? { image: q.image } : {}),
    }));
  const pairs: GameQuestion[] = items.flatMap((item) =>
    !isChoice(item) && item.kind === "pairs"
      ? item.pairs.map((p) => ({ prompt: p.left, options: [p.right, FILL, FILL, FILL] as [string, string, string, string], correctIndex: 0, explanation: "" }))
      : [],
  );
  const words: GameQuestion[] = items.flatMap((item) =>
    !isChoice(item) && item.kind === "word" ? [{ prompt: item.clue, options: [item.word, FILL, FILL, FILL] as [string, string, string, string], correctIndex: 0, explanation: "" }] : [],
  );
  switch (slug) {
    case "krizovka":
      return [...words, ...choice];
    case "spojovani":
      return [...pairs, ...choice];
    default:
      return choice;
  }
}
