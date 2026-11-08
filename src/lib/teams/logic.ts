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

// --- Třídy 2: připojení, skupiny, cílení zadání, termíny, přehledy ---

export const JOIN_MODES = ["OPEN", "APPROVAL", "CLOSED"] as const;
export type JoinMode = (typeof JOIN_MODES)[number];
export const MAX_GROUPS = 12;
export const MAX_BULK_EMAILS = 100;
export const SOON_HOURS = 72;

export function cleanJoinMode(raw: unknown): JoinMode | null {
  return JOIN_MODES.find((m) => m === raw) ?? null;
}

/** Stav připojení kódem podle režimu týmu: rovnou člen, čeká na schválení, nebo zamítnuto. */
export function joinOutcome(mode: string): "active" | "pending" | "closed" {
  if (mode === "CLOSED") return "closed";
  return mode === "APPROVAL" ? "pending" : "active";
}

/** E-maily z vloženého textu (oddělené čárkou, středníkem, mezerou nebo novým řádkem), bez duplicit. */
export function parseEmails(raw: unknown): { valid: string[]; invalid: string[] } {
  const parts = typeof raw === "string" ? raw.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean) : [];
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p) && p.length <= 254) valid.push(p);
    else invalid.push(p);
  }
  return { valid: valid.slice(0, MAX_BULK_EMAILS), invalid };
}

export type Target = { groupId: string | null; userId: string | null };

/** Je zadání pro daného žáka? Bez cílů platí pro celou třídu. */
export function isAssignedTo(targets: Target[], member: { userId: string; groupId: string | null }): boolean {
  if (targets.length === 0) return true;
  return targets.some((t) => (t.userId != null && t.userId === member.userId) || (t.groupId != null && t.groupId === member.groupId));
}

/** Rozdělí id náhodně do `count` skupin co nejrovnoměrněji. */
export function splitRandomly<T>(items: T[], count: number): T[][] {
  const n = Math.max(1, Math.floor(count));
  const out: T[][] = Array.from({ length: n }, () => []);
  shuffle(items).forEach((item, i) => out[i % n].push(item));
  return out;
}

export type DueState = "none" | "ok" | "soon" | "overdue";

export function dueState(dueAt: Date | string | null, now: Date = new Date()): DueState {
  if (!dueAt) return "none";
  const ms = new Date(dueAt).getTime() - now.getTime();
  if (Number.isNaN(ms)) return "none";
  if (ms < 0) return "overdue";
  return ms <= SOON_HOURS * 3600_000 ? "soon" : "ok";
}

/** Splněno po termínu = první úspěšný pokus byl po dueAt. */
export function completedLate(attempts: { percent: number; createdAt: Date | string }[], passPercent: number, dueAt: Date | string | null): boolean {
  if (!dueAt) return false;
  const due = new Date(dueAt).getTime();
  const firstPass = attempts
    .filter((a) => a.percent >= passPercent)
    .map((a) => new Date(a.createdAt).getTime())
    .sort((a, b) => a - b)[0];
  return firstPass != null && firstPass > due;
}

/** Indexy špatně zodpovězených otázek z výsledku hodnocení. */
export function wrongIndexes(review: { id: number; correct: boolean }[]): number[] {
  return review.filter((r) => !r.correct).map((r) => r.id);
}

export type QuestionStat = { index: number; attempts: number; wrong: number };

/** Chybovost po otázkách. Pokusy bez zaznamenaných chyb (starší) se nepočítají. */
export function questionStats(total: number, attempts: { wrong: unknown }[]): QuestionStat[] {
  const stats: QuestionStat[] = Array.from({ length: total }, (_, index) => ({ index, attempts: 0, wrong: 0 }));
  for (const a of attempts) {
    if (!Array.isArray(a.wrong)) continue;
    const wrong = new Set(a.wrong.filter((n): n is number => Number.isInteger(n)));
    for (const s of stats) {
      s.attempts++;
      if (wrong.has(s.index)) s.wrong++;
    }
  }
  return stats;
}

/** Hodnota buňky CSV; chrání před vložením vzorce do Excelu (=, +, -, @). */
export function csvCell(v: string | number | null | undefined): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}
