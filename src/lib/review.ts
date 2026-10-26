import { DAY_MS, dayKey } from "@/lib/gamify";

// Opakování chyb metodou krabiček (Leitner): špatně zodpovězená otázka začíná
// v krabičce 0 a vrací se zítra; každá správná odpověď ji posune o krabičku dál
// a prodlouží pauzu. Po poslední krabičce se otázka považuje za zvládnutou
// a z opakování zmizí. Stav je v IdleState (game "review").

export const REVIEW_GAME = "review";
export const BOX_INTERVAL_DAYS = [1, 2, 4, 8, 16];
export const MAX_TRACKED = 300;
export const REVIEW_BATCH = 10;

export type ReviewItem = { box: number; due: string; course: string | null };
export type CourseProgress = { tests: number; best: number; last: string };
export type ReviewState = {
  items: Record<string, ReviewItem>;
  courses: Record<string, CourseProgress>;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeReview(raw: unknown): ReviewState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const items: ReviewState["items"] = {};
  if (r.items && typeof r.items === "object") {
    for (const [id, v] of Object.entries(r.items as Record<string, unknown>)) {
      const item = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
      const box = Math.floor(Number(item.box));
      if (!Number.isFinite(box) || typeof item.due !== "string" || !DATE.test(item.due)) continue;
      items[id] = {
        box: Math.min(BOX_INTERVAL_DAYS.length - 1, Math.max(0, box)),
        due: item.due,
        course: typeof item.course === "string" ? item.course : null,
      };
    }
  }
  const courses: ReviewState["courses"] = {};
  if (r.courses && typeof r.courses === "object") {
    for (const [id, v] of Object.entries(r.courses as Record<string, unknown>)) {
      const c = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
      const tests = Math.floor(Number(c.tests));
      const best = Math.floor(Number(c.best));
      if (!Number.isFinite(tests) || !Number.isFinite(best) || typeof c.last !== "string") continue;
      courses[id] = { tests: Math.max(0, tests), best: Math.min(100, Math.max(0, best)), last: c.last };
    }
  }
  return { items, courses };
}

export type ReviewResult = { id: string; correct: boolean; course?: string | null };

// Zapíše výsledky odpovědí. Špatná odpověď otázku (znovu) zařadí na zítřek,
// správná posune tu, která už se opakuje; nové správné odpovědi se nesledují.
export function applyResults(state: ReviewState, results: ReviewResult[], now: number): ReviewState {
  const items = { ...state.items };
  const today = dayKey(new Date(now));
  const dayAt = (days: number) => dayKey(new Date(now + days * DAY_MS));
  for (const { id, correct, course } of results) {
    const current = items[id];
    if (!correct) {
      items[id] = { box: 0, due: dayAt(BOX_INTERVAL_DAYS[0]), course: course ?? current?.course ?? null };
    } else if (current && current.due <= today) {
      const box = current.box + 1;
      if (box >= BOX_INTERVAL_DAYS.length) delete items[id];
      else items[id] = { ...current, box, due: dayAt(BOX_INTERVAL_DAYS[box]) };
    }
  }
  // Při přeplnění se zahodí nejdéle odložené otázky.
  const ids = Object.keys(items);
  if (ids.length > MAX_TRACKED) {
    ids
      .sort((a, b) => items[b].due.localeCompare(items[a].due))
      .slice(0, ids.length - MAX_TRACKED)
      .forEach((id) => delete items[id]);
  }
  return { ...state, items };
}

export function recordCourse(state: ReviewState, courseId: string, percent: number, now: number): ReviewState {
  const prev = state.courses[courseId];
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  return {
    ...state,
    courses: {
      ...state.courses,
      [courseId]: { tests: (prev?.tests ?? 0) + 1, best: Math.max(prev?.best ?? 0, pct), last: dayKey(new Date(now)) },
    },
  };
}

export function dueIds(state: ReviewState, now: number): string[] {
  const today = dayKey(new Date(now));
  return Object.entries(state.items)
    .filter(([, item]) => item.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
    .map(([id]) => id);
}

export type CourseStatus = "new" | "started" | "done";

export const DONE_PERCENT = 85;

export function courseStatus(progress: CourseProgress | undefined): CourseStatus {
  if (!progress || progress.tests === 0) return "new";
  return progress.best >= DONE_PERCENT ? "done" : "started";
}
