// Úroveň n začíná na 25 * n * (n - 1) XP: úroveň 2 = 50, 3 = 150, 5 = 500,
// 10 = 2250, 20 = 9500. Čím výš, tím víc XP je potřeba na další úroveň.

export const XP_PER_LEVEL_BASE = 25;
export const DAILY_ACTIVITY_XP_CAP = 300;
export const MAX_XP_PER_CLAIM = 100;

export function xpForLevel(level: number): number {
  return XP_PER_LEVEL_BASE * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  const safe = Math.max(0, xp);
  return Math.floor((1 + Math.sqrt(1 + (4 * safe) / XP_PER_LEVEL_BASE)) / 2);
}

export type LevelProgress = {
  level: number;
  xp: number;
  levelStart: number;
  nextLevelAt: number;
  intoLevel: number;
  neededForNext: number;
  percent: number;
};

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const levelStart = xpForLevel(level);
  const nextLevelAt = xpForLevel(level + 1);
  const intoLevel = xp - levelStart;
  const neededForNext = nextLevelAt - levelStart;
  return {
    level,
    xp,
    levelStart,
    nextLevelAt,
    intoLevel,
    neededForNext,
    percent: Math.min(100, Math.round((intoLevel / neededForNext) * 100)),
  };
}
