// Denní série, denní výzvy a úspěchy. Nic z toho nemá vlastní tabulku: série a
// postup se počítají ze záznamů XP a pokusů o únikovky, vyzvednutá odměna se
// zapíše jako XpEvent se zdrojem "quest:<id>" (denní) nebo "milestone:<id>" (jednou).

export const DAY_MS = 24 * 60 * 60 * 1000;

// Zdroje XP, které se počítají jako aktivita (učení nebo hraní).
export const ACTIVITY_SOURCES = ["game", "test", "escape"] as const;

export type QuestId = "learn" | "test" | "escape" | "idle";

export type QuestDef = { id: QuestId; target: number; bonusXp: number };

export const QUESTS: QuestDef[] = [
  { id: "learn", target: 30, bonusXp: 15 },
  { id: "test", target: 1, bonusXp: 10 },
  { id: "escape", target: 1, bonusXp: 20 },
  { id: "idle", target: 1, bonusXp: 5 },
];

export type MilestoneDef = { id: string; days: number; bonusXp: number };

export const STREAK_MILESTONES: MilestoneDef[] = [
  { id: "streak-3", days: 3, bonusXp: 20 },
  { id: "streak-7", days: 7, bonusXp: 50 },
  { id: "streak-14", days: 14, bonusXp: 100 },
  { id: "streak-30", days: 30, bonusXp: 250 },
];

export type WeeklyId = "xp" | "days" | "tests" | "escape";

export type WeeklyDef = { id: WeeklyId; target: number; bonusXp: number };

export const WEEKLY_QUESTS: WeeklyDef[] = [
  { id: "xp", target: 150, bonusXp: 60 },
  { id: "days", target: 5, bonusXp: 50 },
  { id: "tests", target: 5, bonusXp: 40 },
  { id: "escape", target: 3, bonusXp: 60 },
];

// Týden začíná v pondělí (UTC); klíč týdne je datum onoho pondělí.
export function startOfUtcWeek(now: number): Date {
  const d = startOfUtcDay(now);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

export const weeklySource = (id: WeeklyId, weekStart: Date) => `weekly:${id}:${dayKey(weekStart)}`;
export const achievementSource = (id: string) => `achievement:${id}`;
export const questSource = (id: QuestId) => `quest:${id}`;
export const milestoneSource = (id: string) => `milestone:${id}`;

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(now: number): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Série = počet po sobě jdoucích dní s aktivitou. Když dnes ještě nic nebylo,
// série žije dál od včerejška (hráč ji ještě může dnes prodloužit).
export function computeStreak(activityDays: Iterable<string>, now: number) {
  const days = new Set(activityDays);
  const today = dayKey(new Date(now));
  const doneToday = days.has(today);
  let cursor = now - (doneToday ? 0 : DAY_MS);
  let current = 0;
  while (days.has(dayKey(new Date(cursor)))) {
    current++;
    cursor -= DAY_MS;
  }

  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of [...days].sort()) {
    const t = Date.parse(key);
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
    prev = t;
    if (run > best) best = run;
  }
  return { current, best: Math.max(best, current), doneToday };
}

export type AchievementStats = {
  tests: number;
  games: number;
  escapeRooms: number;
  bestStreak: number;
  level: number;
};

export type AchievementDef = { id: string; icon: string; value: (s: AchievementStats) => number; target: number; bonusXp: number };

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-test", icon: "📝", value: (s) => s.tests, target: 1, bonusXp: 10 },
  { id: "tests-10", icon: "🎓", value: (s) => s.tests, target: 10, bonusXp: 40 },
  { id: "first-game", icon: "🎮", value: (s) => s.games, target: 1, bonusXp: 10 },
  { id: "games-10", icon: "🕹️", value: (s) => s.games, target: 10, bonusXp: 40 },
  { id: "first-escape", icon: "🗝️", value: (s) => s.escapeRooms, target: 1, bonusXp: 20 },
  { id: "escape-all", icon: "🏆", value: (s) => s.escapeRooms, target: 6, bonusXp: 100 },
  { id: "streak-7", icon: "🔥", value: (s) => s.bestStreak, target: 7, bonusXp: 50 },
  { id: "streak-30", icon: "☄️", value: (s) => s.bestStreak, target: 30, bonusXp: 200 },
  { id: "level-5", icon: "⭐", value: (s) => s.level, target: 5, bonusXp: 30 },
  { id: "level-10", icon: "🌟", value: (s) => s.level, target: 10, bonusXp: 80 },
];
