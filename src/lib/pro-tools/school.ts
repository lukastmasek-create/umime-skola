// Školní tarif UčímePRO: čistá logika (varianty zadání, lekce, tempo, známkování). Bez databáze, aby šla testovat.

import { shuffle, type SnapQuestion } from "@/lib/teams/logic";

/** Zamíchá možnosti otázky a přepočítá správný index. */
export function shuffleOptions(q: SnapQuestion): SnapQuestion {
  if (q.options.length < 2) return q;
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
}

/**
 * Varianta zadání pro jednoho žáka: jiný výběr otázek z banky a jiné pořadí možností.
 * Žáci s indexem `n` a `n + 1` dostanou co nejméně společných otázek (výběr se otáčí po bance).
 */
export function variantFor(pool: SnapQuestion[], count: number, studentIndex: number): SnapQuestion[] {
  if (pool.length === 0) return [];
  const take = Math.min(count, pool.length);
  const start = (studentIndex * take) % pool.length;
  const picked = Array.from({ length: take }, (_, i) => pool[(start + i) % pool.length]);
  return shuffle(picked).map(shuffleOptions);
}

export type Lesson = { warmup: SnapQuestion[]; core: SnapQuestion[]; exit: SnapQuestion[] };

/** 20minutová lekce: 2 otázky na rozehřátí (5 min), jádro až 8 otázek k rozboru (13 min) a 2 otázky na závěr (2 min). */
export function buildLesson(ordered: SnapQuestion[]): Lesson {
  const q = ordered.slice(0, 12);
  if (q.length <= 4) return { warmup: q.slice(0, 1), core: q.slice(1, Math.max(1, q.length - 1)), exit: q.slice(-1).filter(() => q.length > 1) };
  return { warmup: q.slice(0, 2), core: q.slice(2, q.length - 2), exit: q.slice(-2) };
}

export type PaceStudent = { id: string; score: number | null };
export type PaceSplit = { slower: string[]; middle: string[]; faster: string[] };

/** Rozdělí žáky na třetiny podle skóre. Kdo ještě nemá žádná data, jde do střední skupiny. */
export function splitByPace(students: PaceStudent[]): PaceSplit {
  const scored = students.filter((s) => s.score !== null).sort((a, b) => (a.score as number) - (b.score as number));
  const noData = students.filter((s) => s.score === null).map((s) => s.id);
  if (scored.length < 3) return { slower: [], middle: [...scored.map((s) => s.id), ...noData], faster: [] };
  const third = Math.ceil(scored.length / 3);
  return {
    slower: scored.slice(0, third).map((s) => s.id),
    middle: [...scored.slice(third, scored.length - third).map((s) => s.id), ...noData],
    faster: scored.slice(scored.length - third).map((s) => s.id),
  };
}

/** Skóre tempa: průměr nejlepších výsledků a podíl splněných zadání. */
export function paceScore(bests: number[], assigned: number): number | null {
  if (assigned === 0 || bests.length === 0) return null;
  const avg = bests.reduce((a, b) => a + b, 0) / bests.length;
  return Math.round(avg * 0.7 + (bests.length / assigned) * 100 * 0.3);
}

export const GRADE_SCALE = [
  { min: 90, grade: 1 },
  { min: 75, grade: 2 },
  { min: 50, grade: 3 },
  { min: 30, grade: 4 },
  { min: 0, grade: 5 },
] as const;

export function gradeFor(percent: number): number {
  return GRADE_SCALE.find((g) => percent >= g.min)?.grade ?? 5;
}

/** Zasekl se: aspoň dva pokusy a pořád pod hranicí splnění. */
export function isStuck(attempts: number, best: number, passPercent: number): boolean {
  return attempts >= 2 && best < passPercent;
}

/** Podíl žáků, kteří zadání splnili (v procentech). */
export function understoodPercent(done: number, assigned: number): number {
  return assigned > 0 ? Math.round((done / assigned) * 100) : 0;
}

export const PACE_GROUP_NAMES = { slower: "Skupina A", middle: "Skupina B", faster: "Skupina C" } as const;
