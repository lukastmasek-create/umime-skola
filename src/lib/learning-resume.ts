import { getCategoryBySlug, type CategorySlug } from "@/lib/taxonomy";
import { getGame } from "@/lib/games";
import { runnerAllowed } from "@/lib/runner";
import type { Locale } from "@/i18n/config";

export const LEARNING_RESUME_GAME = "learning-resume";
export type LearningResume = { category: CategorySlug; course: string; difficulty: number; game: string | null };

// Store route parts, never a client-provided URL or title. Resolve publication and title on the server.
export function parseLearningResume(raw: unknown): LearningResume | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const category = typeof r.category === "string" ? getCategoryBySlug(r.category) : null;
  if (!category || typeof r.course !== "string" || !/^[\p{L}\p{N}_-]{1,200}$/u.test(r.course)) return null;
  if (typeof r.difficulty !== "number" || !Number.isInteger(r.difficulty) || r.difficulty < 1 || r.difficulty > 5) return null;
  if (r.game !== null) {
    if (typeof r.game !== "string") return null;
    const game = getGame(r.game);
    if (!game?.available || game.archived || game.setOnly || (game.slug === "runner" && !runnerAllowed(r.difficulty))) return null;
  }
  return { category: category.slug, course: r.course, difficulty: r.difficulty, game: r.game as string | null };
}

export function learningResumeHref(locale: Locale, resume: LearningResume) {
  const base = `/${locale}/kurzy/${resume.category}/${encodeURIComponent(resume.course)}`;
  return resume.game ? `${base}/kurz/${resume.difficulty}/hra/${resume.game}` : `${base}/test/${resume.difficulty}`;
}
