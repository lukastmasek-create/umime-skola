// Společná logika denního kvízu (server i klient): nastavení hry, bodování, série.

export const QUIZ_SIZE = 10;
export const TIMED_SECONDS = 20; // limit na otázku v časovém režimu
export const TIMED_GRACE_MS = 3000; // tolerance na dobu odezvy sítě
export const MAX_STREAK_BONUS = 4;
export const FLAWLESS_BONUS_POINTS = 10;
export const FLAWLESS_BONUS_XP = 10;

export type QuizConfig = { subject: string | null; difficulty: number; timed: boolean };

export const clampDifficulty = (n: unknown) => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 3;
};

// Body za správnou odpověď: obtížnost + bonus za sérii (od druhé v řadě), v časovém režimu ×1,5.
export function pointsFor(difficulty: number, streak: number, timed: boolean) {
  const base = difficulty + Math.min(Math.max(streak - 1, 0), MAX_STREAK_BONUS);
  return Math.round(base * (timed ? 1.5 : 1));
}

// XP za správnou odpověď: 1 + obtížnost.
export const xpFor = (difficulty: number) => 1 + difficulty;

// Série bezchybných odpovědí a body z uložených odpovědí (pro žebříček).
export function summarize(answers: { correct: boolean }[], config: QuizConfig) {
  let streak = 0;
  let best = 0;
  let points = 0;
  for (const a of answers) {
    if (a.correct) {
      streak += 1;
      best = Math.max(best, streak);
      points += pointsFor(config.difficulty, streak, config.timed);
    } else {
      streak = 0;
    }
  }
  const score = answers.filter((a) => a.correct).length;
  const flawless = answers.length >= QUIZ_SIZE && score === answers.length;
  if (flawless) points += FLAWLESS_BONUS_POINTS;
  return { score, streak, best, points, flawless };
}
