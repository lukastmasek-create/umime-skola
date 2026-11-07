// Čistá logika týmů (bez databáze), aby šla testovat.

export type SnapQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  answers: string[];
  explanation: string;
};

export type PublicQuestion = { id: number; prompt: string; options: string[]; gaps: number };
export type AnswerInput = { choice?: number | null; typed?: string[] };

export const MAX_TEAM_NAME = 40;
export const MAX_MESSAGE = 500;
export const MAX_ATTEMPTS_LIMIT = 20;
export const MAX_QUESTIONS = 30;

const norm = (v: string) => v.trim().toLowerCase();

export function cleanSnapshot(raw: unknown): SnapQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: SnapQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const prompt = typeof r.prompt === "string" ? r.prompt.trim().slice(0, 400) : "";
    const options = Array.isArray(r.options) ? r.options.filter((o): o is string => typeof o === "string").map((o) => o.trim().slice(0, 160)) : [];
    const answers = Array.isArray(r.answers) ? r.answers.filter((o): o is string => typeof o === "string").map((o) => o.trim().slice(0, 120)) : [];
    const correctIndex = typeof r.correctIndex === "number" ? r.correctIndex : -1;
    const explanation = typeof r.explanation === "string" ? r.explanation.trim().slice(0, 400) : "";
    if (!prompt) continue;
    if (answers.length > 0) {
      if (prompt.split("___").length - 1 !== answers.length) continue;
    } else if (options.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) continue;
    out.push({ prompt, options: answers.length ? [] : options, correctIndex: answers.length ? 0 : correctIndex, answers, explanation });
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}

export function toPublic(questions: SnapQuestion[]): PublicQuestion[] {
  return questions.map((q, id) => ({ id, prompt: q.prompt, options: q.options, gaps: q.answers.length }));
}

export function isAnswerCorrect(q: SnapQuestion, a: AnswerInput | undefined): boolean {
  if (!a) return false;
  if (q.answers.length > 0) {
    const typed = Array.isArray(a.typed) ? a.typed : [];
    return q.answers.every((ans, i) => typeof typed[i] === "string" && norm(typed[i]) === norm(ans));
  }
  return a.choice === q.correctIndex;
}

export type GradeResult = {
  correct: number;
  total: number;
  percent: number;
  review: { id: number; correct: boolean; correctText: string; explanation: string }[];
};

export function gradeAttempt(questions: SnapQuestion[], answers: Record<string, AnswerInput> | undefined): GradeResult {
  const review = questions.map((q, id) => ({
    id,
    correct: isAnswerCorrect(q, answers?.[String(id)]),
    correctText: q.answers.length ? q.answers.join(" / ") : q.options[q.correctIndex] ?? "",
    explanation: q.explanation,
  }));
  const correct = review.filter((r) => r.correct).length;
  const total = questions.length;
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0, review };
}

/** Zbývající pokusy (null = neomezeně). */
export function attemptsLeft(maxAttempts: number | null, used: number): number | null {
  return maxAttempts == null ? null : Math.max(0, maxAttempts - used);
}

export type StudentStatus = "done" | "tried" | "viewed" | "new";

/** Stav žáka v dashboardu: splnil / zkoušel (pod hranicí) / jen zobrazil / nezobrazil. */
export function studentStatus(opts: { viewed: boolean; attempts: number; best: number; passPercent: number }): StudentStatus {
  if (opts.attempts > 0 && opts.best >= opts.passPercent) return "done";
  if (opts.attempts > 0) return "tried";
  return opts.viewed ? "viewed" : "new";
}

export function cleanMaxAttempts(raw: unknown): number | null {
  if (raw == null || raw === "" || raw === 0) return null;
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(n, MAX_ATTEMPTS_LIMIT);
}

export function shuffle<T>(items: T[]): T[] {
  const c = [...items];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}
