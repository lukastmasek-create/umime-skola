// Banky otázek. Kolo je VŽDY jen číselné, nebo jen slovní.

export type QType = "number" | "word";
export type Question = { type: QType; prompt: string; answer: string };

const NUMBER_QS: Question[] = [
  { type: "number", prompt: "Kolik je 7 × 8?", answer: "56" },
  { type: "number", prompt: "Kolik je 12 + 35?", answer: "47" },
  { type: "number", prompt: "Kolik je 9²?", answer: "81" },
  { type: "number", prompt: "Kolik stran má šestiúhelník?", answer: "6" },
  { type: "number", prompt: "Kolik nohou má pavouk?", answer: "8" },
  { type: "number", prompt: "Kolik minut má 2 hodiny?", answer: "120" },
  { type: "number", prompt: "Kolik stupňů má pravý úhel?", answer: "90" },
  { type: "number", prompt: "Které je prvočíslo hned za 13?", answer: "17" },
  { type: "number", prompt: "Kolik dní má přestupný rok?", answer: "366" },
  { type: "number", prompt: "Kolik je 144 ÷ 12?", answer: "12" },
  { type: "number", prompt: "Kolik je na Zemi světadílů?", answer: "7" },
  { type: "number", prompt: "Kolik hráčů je v jednom týmu fotbalu na hřišti?", answer: "11" },
  { type: "number", prompt: "Kolik strun má kytara?", answer: "6" },
  { type: "number", prompt: "Kolik je 3³?", answer: "27" },
  { type: "number", prompt: "Kolik kostí má dospělý člověk?", answer: "206" },
  { type: "number", prompt: "Kolik hodin má týden?", answer: "168" },
  { type: "number", prompt: "Kolik je 1000 − 387?", answer: "613" },
  { type: "number", prompt: "Kolik sekund je 5 minut?", answer: "300" },
  { type: "number", prompt: "Kolik je 25 % z 200?", answer: "50" },
  { type: "number", prompt: "Římská číslice XIV zapsaná arabsky?", answer: "14" },
  { type: "number", prompt: "Kolik měsíců má 31 dní?", answer: "7" },
  { type: "number", prompt: "Kolik rohů má krychle?", answer: "8" },
];

const WORD_QS: Question[] = [
  { type: "word", prompt: "Opak slova „dlouhý“?", answer: "krátký" },
  { type: "word", prompt: "Hlavní město Japonska?", answer: "Tokio" },
  { type: "word", prompt: "Množné číslo slova „myš“?", answer: "myši" },
  { type: "word", prompt: "Chemická značka zlata?", answer: "Au" },
  { type: "word", prompt: "Největší planeta sluneční soustavy?", answer: "Jupiter" },
  { type: "word", prompt: "Hlavní jazyk Brazílie?", answer: "portugalština" },
  { type: "word", prompt: "Co vyrábí včely?", answer: "med" },
  { type: "word", prompt: "Opak slova „štědrý“?", answer: "lakomý" },
  { type: "word", prompt: "Horký nápoj z kakaových bobů?", answer: "čokoláda" },
  { type: "word", prompt: "Jakou barvu má zralý banán?", answer: "žlutá" },
  { type: "word", prompt: "Hlavní město Itálie?", answer: "Řím" },
  { type: "word", prompt: "Které zvíře říká „bú“?", answer: "kráva" },
  { type: "word", prompt: "Minulý čas slovesa „běžet“ (on)?", answer: "běžel" },
  { type: "word", prompt: "Co je zmrzlá voda?", answer: "led" },
  { type: "word", prompt: "Opak slova „rozšířit“?", answer: "zúžit" },
  { type: "word", prompt: "Měna Japonska?", answer: "jen" },
  { type: "word", prompt: "Orgán, který pumpuje krev?", answer: "srdce" },
  { type: "word", prompt: "Nejvyšší suchozemské zvíře?", answer: "žirafa" },
  { type: "word", prompt: "Jak se řekne mláděti psa?", answer: "štěně" },
  { type: "word", prompt: "Hlavní město České republiky?", answer: "Praha" },
  { type: "word", prompt: "Opak slova „statečný“?", answer: "zbabělý" },
  { type: "word", prompt: "Plyn, který rostliny pohlcují?", answer: "oxid uhličitý" },
  { type: "word", prompt: "Ovoce, které prý odežene doktora?", answer: "jablko" },
];

export type Round = { type: QType; pool: Question[] };

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRound(rand: () => number = Math.random): Round {
  const type: QType = rand() < 0.5 ? "number" : "word";
  const src = type === "number" ? NUMBER_QS : WORD_QS;
  return { type, pool: shuffle(src, rand) };
}

/** Otázka pro blok i; `offset` se po každé správné odpovědi posune (rotace). */
export function questionFor(round: Round, i: number, offset: number): Question {
  const n = round.pool.length;
  return round.pool[(((i + offset) % n) + n) % n];
}

const normWord = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function checkAnswer(q: Question, input: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  if (q.type === "number") {
    const n = Number(raw.replace(",", "."));
    return Number.isFinite(n) && n === Number(q.answer);
  }
  return normWord(raw) === normWord(q.answer);
}
