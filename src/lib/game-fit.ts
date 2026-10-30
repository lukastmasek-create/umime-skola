import type { GameQuestion } from "@/i18n/game";
import { isClassicSlug, type GameSlug } from "./games";
import { toGaps, toHangman, toPairs, toScrambles, toStatements, toWords } from "./classic-games";

// Dá se hra sestavit z otázek kurzu? Prahy odpovídají tomu, co jednotlivé hry potřebují
// (např. osmisměrka a křížovka chtějí jednoslovné odpovědi z písmen, ne čísla).
export function canPlay(slug: GameSlug, questions: GameQuestion[], difficulty: number): boolean {
  if (!isClassicSlug(slug)) return true; // akční hry mají v nouzi ukázkové otázky
  const n = questions.length;
  switch (slug) {
    case "osmismerka":
      return toWords(questions, 8).length >= 4;
    case "krizovka":
      return toWords(questions, 10).length >= 4;
    case "presmycky":
      return toScrambles(questions, 6).length >= 3;
    case "sibenice":
      return toHangman(questions, 5).length >= 3;
    case "doplnovani":
      return toGaps(questions, 6, 34).gaps.length >= 4;
    case "spojovani":
    case "pexeso":
      return toPairs(questions, 8).length >= 4;
    case "bingo":
      return toPairs(questions, 16).filter((p) => p.answer.length <= 24).length >= 9;
    case "trideni":
    case "pravda":
      return toStatements(questions, 12).length >= 6;
    case "milionar":
      return n >= (difficulty <= 2 ? 9 : 11);
    case "blesk":
    case "obrana":
      return n >= 12;
    case "piskvorky":
      return n >= 8;
    case "poklad":
    case "oblekani":
      return n >= 6;
  }
}
