import type { GameQuestion } from "@/i18n/game";

// Společné pomůcky pro klasické hry (osmisměrka, spojování, pexeso, šibenice). Všechny berou otázky kurzu:
// dvojice „otázka ↔ správná odpověď“ i slova ze správných odpovědí.

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

export function answerOf(q: GameQuestion): string {
  return q.options[q.correctIndex].trim();
}

export type Pair = { id?: string; prompt: string; answer: string; explanation: string };

function clip(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

// Dvojice pro spojování a pexeso: nejdřív ty s krátkým textem, aby se vešly na kartičku.
export function toPairs(questions: GameQuestion[], count: number): Pair[] {
  const seen = new Set<string>();
  const unique = questions.filter((q) => {
    const key = answerOf(q).toLowerCase();
    if (seen.has(key)) return false; // dvě karty se stejnou odpovědí by se daly spojit křížem
    seen.add(key);
    return true;
  });
  const fits = (q: GameQuestion, p: number, a: number) => q.prompt.length <= p && answerOf(q).length <= a;
  const ordered = [
    ...shuffle(unique.filter((q) => fits(q, 60, 26))),
    ...shuffle(unique.filter((q) => !fits(q, 60, 26) && fits(q, 110, 46))),
    ...shuffle(unique.filter((q) => !fits(q, 110, 46))),
  ];
  return ordered.slice(0, count).map((q) => ({
    id: q.id,
    prompt: clip(q.prompt, 90),
    answer: clip(answerOf(q), 44),
    explanation: q.explanation,
  }));
}

export type WordItem = { id?: string; word: string; clue: string };

// Slova pro osmisměrku: jednoslovné odpovědi z písmen (3 až 11), jedno slovo jen jednou.
export function toWords(questions: GameQuestion[], count: number): WordItem[] {
  const seen = new Set<string>();
  const out: WordItem[] = [];
  for (const q of shuffle(questions)) {
    const raw = answerOf(q);
    if (!/^\p{L}{3,11}$/u.test(raw)) continue;
    const word = raw.toLocaleUpperCase("cs");
    if (seen.has(word)) continue;
    seen.add(word);
    out.push({ id: q.id, word, clue: clip(q.prompt, 100) });
    if (out.length >= count) break;
  }
  return out;
}

export type Placed = WordItem & { cells: [number, number][] };

const DIRS_EASY: [number, number][] = [[0, 1], [1, 0]];
const DIRS_MEDIUM: [number, number][] = [...DIRS_EASY, [1, 1]];
const DIRS_ALL: [number, number][] = [...DIRS_MEDIUM, [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];

export function buildWordSearch(words: WordItem[], difficulty: number): { grid: string[][]; placed: Placed[] } {
  const longest = Math.max(...words.map((w) => w.word.length));
  const size = Math.min(13, Math.max(9, longest + 1, Math.ceil(words.length * 1.4)));
  const dirs = difficulty <= 2 ? DIRS_EASY : difficulty === 3 ? DIRS_MEDIUM : DIRS_ALL;
  const grid: string[][] = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const placed: Placed[] = [];

  for (const item of [...words].sort((a, b) => b.word.length - a.word.length)) {
    const letters = [...item.word];
    let done = false;
    for (let attempt = 0; attempt < 250 && !done; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r0 = Math.floor(Math.random() * size);
      const c0 = Math.floor(Math.random() * size);
      const r1 = r0 + dr * (letters.length - 1);
      const c1 = c0 + dc * (letters.length - 1);
      if (r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
      const cells: [number, number][] = letters.map((_, i) => [r0 + dr * i, c0 + dc * i]);
      if (!cells.every(([r, c], i) => grid[r][c] === "" || grid[r][c] === letters[i])) continue;
      cells.forEach(([r, c], i) => {
        grid[r][c] = letters[i];
      });
      placed.push({ ...item, cells });
      done = true;
    }
  }

  // Výplň z písmen samotných slov, ať se skrytá slova neprozradí jinou abecedou.
  const pool = [...new Set(placed.flatMap((p) => [...p.word]))];
  const filler = pool.length > 0 ? pool : [..."ABCDEFGHIJKLMNOPRSTUVZ"];
  for (const row of grid) {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "") row[c] = filler[Math.floor(Math.random() * filler.length)];
    }
  }
  return { grid, placed };
}

export type HangmanItem = { id?: string; prompt: string; answer: string; explanation: string };

// Odpovědi do šibenice: 3 až 28 znaků, aspoň tři písmena.
export function toHangman(questions: GameQuestion[], count: number): HangmanItem[] {
  const out: HangmanItem[] = [];
  const seen = new Set<string>();
  for (const q of shuffle(questions)) {
    const answer = answerOf(q);
    const letters = [...answer].filter((ch) => /\p{L}/u.test(ch)).length;
    if (answer.length < 3 || answer.length > 28 || letters < 3) continue;
    if (seen.has(answer.toLowerCase())) continue;
    seen.add(answer.toLowerCase());
    out.push({ id: q.id, prompt: clip(q.prompt, 140), answer, explanation: q.explanation });
    if (out.length >= count) break;
  }
  return out;
}

export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export type Statement = {
  id?: string;
  question: string;
  shown: string;
  truth: boolean;
  correct: string;
  explanation: string;
};

// Tvrzení pro třídění: otázka + odpověď, která je buď správná, nebo jedna ze špatných z téže otázky.
export function toStatements(questions: GameQuestion[], count: number): Statement[] {
  const short = questions.filter((q) => q.prompt.length <= 120 && q.options.every((o) => o.length <= 48));
  const pool = shuffle(short.length >= count ? short : questions).slice(0, count);
  const truths = shuffle(pool.map((_, i) => i < Math.ceil(pool.length / 2)));
  return pool.map((q, i) => {
    const correct = answerOf(q);
    const wrongs = q.options.filter((_, k) => k !== q.correctIndex);
    return {
      id: q.id,
      question: q.prompt,
      shown: truths[i] ? correct : wrongs[Math.floor(Math.random() * wrongs.length)],
      truth: truths[i],
      correct,
      explanation: q.explanation,
    };
  });
}

export type Gap = {
  id?: string;
  before: string;
  after: string;
  answer: string;
  explanation: string;
};

// Věty s mezerou pro doplňování. Otázka s „…“ se rozdělí v mezeře, jinak se mezera přidá na konec.
export function toGaps(questions: GameQuestion[], count: number, maxAnswer: number): { gaps: Gap[]; extras: string[] } {
  const rank = (q: GameQuestion) => (/…|___/.test(q.prompt) ? 0 : q.prompt.trimEnd().endsWith(":") ? 1 : 2);
  const usable = shuffle(questions.filter((q) => answerOf(q).length <= maxAnswer && q.prompt.length <= 140)).sort(
    (a, b) => rank(a) - rank(b),
  );
  const seen = new Set<string>();
  const picked: GameQuestion[] = [];
  for (const q of usable) {
    const a = answerOf(q).toLowerCase();
    if (seen.has(a)) continue;
    seen.add(a);
    picked.push(q);
    if (picked.length >= count) break;
  }
  const gaps = shuffle(picked).map((q): Gap => {
    const m = q.prompt.match(/…|___/);
    if (m && m.index !== undefined) {
      return {
        id: q.id,
        before: q.prompt.slice(0, m.index).trimEnd(),
        after: q.prompt.slice(m.index + m[0].length).trimStart(),
        answer: answerOf(q),
        explanation: q.explanation,
      };
    }
    return { id: q.id, before: q.prompt.trimEnd(), after: "", answer: answerOf(q), explanation: q.explanation };
  });
  // Dvě špatné odpovědi navíc do banky slov, ať se nedá doplnit vylučovací metodou.
  const answers = new Set(gaps.map((g) => g.answer.toLowerCase()));
  const extras = shuffle(
    picked.flatMap((q) => q.options.filter((_, k) => k !== q.correctIndex)).filter((o) => !answers.has(o.toLowerCase()) && o.length <= maxAnswer),
  );
  return { gaps, extras: [...new Set(extras)].slice(0, 2) };
}

export function normalizeAnswer(s: string): string {
  return stripDiacritics(s).toLowerCase().replace(/[.,;:!?'"„“]/g, "").replace(/\s+/g, " ").trim();
}

export type Shuffled = { id?: string; prompt: string; options: string[]; correct: number; explanation: string };

// Otázka s náhodně zamíchanými možnostmi (správná odpověď nezůstává na stejném místě).
export function shuffleQuestion(q: GameQuestion): Shuffled {
  const order = shuffle([0, 1, 2, 3]);
  return {
    id: q.id,
    prompt: q.prompt,
    options: order.map((i) => q.options[i]),
    correct: order.indexOf(q.correctIndex),
    explanation: q.explanation,
  };
}

export type Scramble = { id?: string; clue: string; word: string; letters: string[]; explanation: string };

// Přesmyčky: jednoslovné odpovědi o 4 až 10 písmenech, písmena zamíchaná tak, aby slovo nevzniklo samo.
export function toScrambles(questions: GameQuestion[], count: number): Scramble[] {
  const seen = new Set<string>();
  const out: Scramble[] = [];
  for (const q of shuffle(questions)) {
    const raw = answerOf(q);
    if (!/^\p{L}{4,10}$/u.test(raw)) continue;
    const word = raw.toLocaleUpperCase("cs");
    if (seen.has(word) || new Set(word).size < 3) continue;
    seen.add(word);
    let letters = shuffle([...word]);
    for (let tries = 0; tries < 12 && letters.join("") === word; tries++) letters = shuffle([...word]);
    out.push({ id: q.id, clue: q.prompt, word, letters, explanation: q.explanation });
    if (out.length >= count) break;
  }
  return out;
}
