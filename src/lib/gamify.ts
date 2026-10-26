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
  { id: "escape-all", icon: "🏆", value: (s) => s.escapeRooms, target: 9, bonusXp: 100 },
  { id: "streak-7", icon: "🔥", value: (s) => s.bestStreak, target: 7, bonusXp: 50 },
  { id: "streak-30", icon: "☄️", value: (s) => s.bestStreak, target: 30, bonusXp: 200 },
  { id: "level-5", icon: "⭐", value: (s) => s.level, target: 5, bonusXp: 30 },
  { id: "level-10", icon: "🌟", value: (s) => s.level, target: 10, bonusXp: 80 },
];

// --- Zmrazení a záchrana série ---

export const FREEZE_PRICE = 100;
export const MAX_FREEZES = 3;
export const RESCUE_COOLDOWN_DAYS = 7;

// Stav uložený v IdleState (game "streak"): zmrazení v zásobě, dny kryté
// zmrazením nebo záchranou a den, kdy byla naposledy použita záchrana.
export type StreakState = { freezes: number; covered: string[]; lastRescue: string | null };

export function normalizeStreakState(raw: unknown): StreakState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const freezes = Math.floor(Number(r.freezes));
  return {
    freezes: Number.isFinite(freezes) ? Math.min(MAX_FREEZES, Math.max(0, freezes)) : 0,
    covered: Array.isArray(r.covered)
      ? r.covered.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-120)
      : [],
    lastRescue: typeof r.lastRescue === "string" ? r.lastRescue : null,
  };
}

// Doplní do `state` kryté dny, pokud včerejšek chybí a série by se přetrhla.
// Nejdřív se spotřebuje zmrazení; když žádné není a hráč dnes dokončil test,
// použije se záchrana (jednou za týden). Vrací `rescuable`, jestli by hráči dnes
// záchrana ještě pomohla (stačí dokončit test).
export function applyStreakProtection(
  realDays: Set<string>,
  state: StreakState,
  now: number,
  testToday: boolean,
): { state: StreakState; changed: boolean; rescuable: boolean; used: "freeze" | "rescue" | null } {
  const days = new Set([...realDays, ...state.covered]);
  const today = dayKey(new Date(now));
  const yesterday = dayKey(new Date(now - DAY_MS));
  const before = dayKey(new Date(now - 2 * DAY_MS));
  const broken = !days.has(today) && !days.has(yesterday) && days.has(before);
  const brokenAfterToday = days.has(today) && !days.has(yesterday) && days.has(before);
  if (!broken && !brokenAfterToday) return { state, changed: false, rescuable: false, used: null };

  const next = { ...state, covered: [...state.covered, yesterday] };
  if (state.freezes > 0) {
    return { state: { ...next, freezes: state.freezes - 1 }, changed: true, rescuable: false, used: "freeze" };
  }
  const cooledDown =
    !state.lastRescue || now - Date.parse(state.lastRescue) >= RESCUE_COOLDOWN_DAYS * DAY_MS;
  if (cooledDown && testToday) {
    return { state: { ...next, lastRescue: today }, changed: true, rescuable: false, used: "rescue" };
  }
  return { state, changed: false, rescuable: cooledDown, used: null };
}
