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
