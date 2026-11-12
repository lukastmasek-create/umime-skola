// Zkoušky nanečisto (PRO): výběr otázek, vyhodnocení a odhad výsledku. Čistá logika bez databáze.

export const EXAM_SIZES = [20, 30, 50] as const;
export const MINUTES_PER_QUESTION = 1.2;
/** Přijímačky na střední školu mají z češtiny i z matematiky po 50 bodech. */
export const EXAM_MAX_POINTS = 50;

export function clampSize(n: unknown): number {
  const v = Math.floor(Number(n));
  return (EXAM_SIZES as readonly number[]).includes(v) ? v : EXAM_SIZES[0];
}

export function examMinutes(n: number): number {
  return Math.round(n * MINUTES_PER_QUESTION);
}

/** Náhodný výběr bez opakování (Fisher–Yates), `rand` jde dosadit kvůli testům. */
export function sample<T>(items: T[], n: number, rand: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export type ExamScore = { correct: number; total: number; percent: number; points: number; low: number; high: number };

/**
 * Vyhodnotí odpovědi. `answers[id]` je zvolený index nebo null (bez odpovědi, počítá se jako chyba).
 * Odhad bodů z 50 má pásmo ±1,64 směrodatné odchylky (zhruba 90% interval), protože výsledek z pár otázek kolísá.
 */
export function scoreExam(answers: Record<string, number | null>, correctIndex: Record<string, number>): ExamScore {
  const ids = Object.keys(correctIndex);
  const total = ids.length;
  const correct = ids.filter((id) => answers[id] === correctIndex[id]).length;
  const p = total ? correct / total : 0;
  const margin = total ? 1.64 * Math.sqrt((p * (1 - p)) / total) : 0;
  const pts = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * EXAM_MAX_POINTS);
  return { correct, total, percent: Math.round(p * 100), points: pts(p), low: pts(p - margin), high: pts(p + margin) };
}
