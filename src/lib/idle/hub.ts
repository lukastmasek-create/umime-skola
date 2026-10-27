// Úspěchy a denní úkoly napříč všemi stálými hrami. Čistý kód bez databáze a Reactu.
// Úspěchy se počítají ze stavů her (jen rostoucí hodnoty, takže o ně hráč nepřijde), denní úkoly z přírůstku
// od prvního otevření přehledu v daný den. Odměny jsou body z učení; nárok se ukládá, aby šel vybrat jen jednou.

export type MetricId =
  | "baseModules"
  | "baseEarned"
  | "baseShips"
  | "baseResearch"
  | "cityBuildings"
  | "cityEarned"
  | "farmLevel"
  | "farmOrders"
  | "farmEarned"
  | "petsOwned"
  | "petLevel"
  | "petsEarned"
  | "learnXp"
  | "learnXpToday";

export type Metrics = Record<MetricId, number>;

export const EMPTY_METRICS: Metrics = {
  baseModules: 0,
  baseEarned: 0,
  baseShips: 0,
  baseResearch: 0,
  cityBuildings: 0,
  cityEarned: 0,
  farmLevel: 0,
  farmOrders: 0,
  farmEarned: 0,
  petsOwned: 0,
  petLevel: 0,
  petsEarned: 0,
  learnXp: 0,
  learnXpToday: 0,
};

export type GameKey = "base" | "city" | "farm" | "pets" | "learn";

export type AchievementDef = { id: string; game: GameKey; metric: MetricId; target: number; reward: number };

const ladder = (game: GameKey, metric: MetricId, steps: [target: number, reward: number][]): AchievementDef[] =>
  steps.map(([target, reward], i) => ({ id: `${metric}:${i + 1}`, game, metric, target, reward }));

export const ACHIEVEMENTS: AchievementDef[] = [
  ...ladder("base", "baseModules", [[5, 10], [15, 25], [30, 60]]),
  ...ladder("base", "baseEarned", [[5_000, 10], [50_000, 30], [500_000, 80]]),
  ...ladder("base", "baseShips", [[1, 10], [3, 30]]),
  ...ladder("base", "baseResearch", [[3, 15], [10, 50]]),
  ...ladder("city", "cityBuildings", [[10, 10], [40, 30], [100, 80]]),
  ...ladder("city", "cityEarned", [[5_000, 10], [50_000, 30], [500_000, 80]]),
  ...ladder("farm", "farmLevel", [[3, 10], [8, 30], [15, 70], [20, 120]]),
  ...ladder("farm", "farmOrders", [[5, 10], [25, 40], [100, 100]]),
  ...ladder("farm", "farmEarned", [[2_000, 10], [20_000, 40]]),
  ...ladder("pets", "petsOwned", [[2, 10], [5, 30], [8, 60]]),
  ...ladder("pets", "petLevel", [[3, 10], [6, 30], [10, 80]]),
  ...ladder("pets", "petsEarned", [[2_000, 10], [20_000, 40]]),
  ...ladder("learn", "learnXp", [[100, 10], [500, 40], [2_000, 120]]),
];

export type DailyDef = { id: string; metric: MetricId; target: number; reward: number };

// Úkoly na přírůstek (kromě učení, to se čte přímo z dnešních XP). Částky jsou zvolené tak, aby šly zvládnout
// za krátké sezení i na začátku hry.
export const DAILY_GAME_POOL: DailyDef[] = [
  { id: "farmEarned", metric: "farmEarned", target: 300, reward: 10 },
  { id: "cityEarned", metric: "cityEarned", target: 600, reward: 10 },
  { id: "baseEarned", metric: "baseEarned", target: 800, reward: 10 },
  { id: "petsEarned", metric: "petsEarned", target: 200, reward: 10 },
  { id: "farmOrders", metric: "farmOrders", target: 2, reward: 15 },
  { id: "cityBuildings", metric: "cityBuildings", target: 3, reward: 10 },
];

export const DAILY_LEARN: DailyDef = { id: "learnXpToday", metric: "learnXpToday", target: 40, reward: 20 };

export const DAILY_COUNT = 3;

export type HubState = {
  v: 1;
  claimed: string[];
  daily: { date: string; baseline: Partial<Metrics>; claimed: string[] } | null;
};

export const EMPTY_HUB: HubState = { v: 1, claimed: [], daily: null };

const isStr = (v: unknown): v is string => typeof v === "string";

export function normalizeHub(raw: unknown): HubState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const known = new Set(ACHIEVEMENTS.map((a) => a.id));
  const claimed = Array.isArray(r.claimed) ? r.claimed.filter((x): x is string => isStr(x) && known.has(x)) : [];
  let daily: HubState["daily"] = null;
  if (r.daily && typeof r.daily === "object") {
    const d = r.daily as Record<string, unknown>;
    if (isStr(d.date) && /^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
      const baseline: Partial<Metrics> = {};
      if (d.baseline && typeof d.baseline === "object") {
        for (const [k, v] of Object.entries(d.baseline as Record<string, unknown>)) {
          if (k in EMPTY_METRICS && typeof v === "number" && Number.isFinite(v)) baseline[k as MetricId] = v;
        }
      }
      daily = { date: d.date, baseline, claimed: Array.isArray(d.claimed) ? d.claimed.filter(isStr) : [] };
    }
  }
  return { v: 1, claimed: [...new Set(claimed)], daily };
}

export function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Tři úkoly na den: vždycky jeden z učení a dva herní, pro stejného hráče a den pořád stejné. */
export function pickDaily(userId: string, date: string): DailyDef[] {
  const pool = [...DAILY_GAME_POOL];
  const picked: DailyDef[] = [];
  let h = hash(`${userId}|${date}`);
  while (picked.length < DAILY_COUNT - 1 && pool.length > 0) {
    const i = h % pool.length;
    picked.push(pool.splice(i, 1)[0]);
    h = hash(`${h}|${i}`);
  }
  return [DAILY_LEARN, ...picked];
}

/** Zajistí záznam pro dnešek: nový den začíná z aktuálních hodnot, takže se počítá jen to, co hráč udělá dnes. */
export function rollDaily(hub: HubState, date: string, metrics: Metrics): HubState {
  if (hub.daily && hub.daily.date === date) return hub;
  const baseline: Partial<Metrics> = {};
  for (const q of DAILY_GAME_POOL) baseline[q.metric] = metrics[q.metric];
  return { ...hub, daily: { date, baseline, claimed: [] } };
}

export type AchievementView = AchievementDef & { progress: number; done: boolean; claimed: boolean };
export type DailyView = DailyDef & { progress: number; done: boolean; claimed: boolean };

export function achievementViews(metrics: Metrics, hub: HubState): AchievementView[] {
  const claimed = new Set(hub.claimed);
  return ACHIEVEMENTS.map((a) => {
    const progress = Math.min(a.target, Math.max(0, metrics[a.metric]));
    return { ...a, progress, done: progress >= a.target, claimed: claimed.has(a.id) };
  });
}

export function dailyProgress(def: DailyDef, metrics: Metrics, hub: HubState): number {
  if (def.metric === "learnXpToday") return Math.min(def.target, Math.max(0, metrics.learnXpToday));
  const base = hub.daily?.baseline[def.metric] ?? metrics[def.metric];
  return Math.min(def.target, Math.max(0, metrics[def.metric] - base));
}

export function dailyViews(userId: string, metrics: Metrics, hub: HubState): DailyView[] {
  if (!hub.daily) return [];
  const claimed = new Set(hub.daily.claimed);
  return pickDaily(userId, hub.daily.date).map((d) => {
    const progress = dailyProgress(d, metrics, hub);
    return { ...d, progress, done: progress >= d.target, claimed: claimed.has(d.id) };
  });
}

export type ClaimResult = { ok: true; hub: HubState; reward: number } | { ok: false; error: "unknown" | "not-done" | "already-claimed" };

export function claimAchievement(hub: HubState, metrics: Metrics, id: string): ClaimResult {
  const a = achievementViews(metrics, hub).find((x) => x.id === id);
  if (!a) return { ok: false, error: "unknown" };
  if (a.claimed) return { ok: false, error: "already-claimed" };
  if (!a.done) return { ok: false, error: "not-done" };
  return { ok: true, hub: { ...hub, claimed: [...hub.claimed, id] }, reward: a.reward };
}

export function claimDaily(userId: string, hub: HubState, metrics: Metrics, id: string): ClaimResult {
  const d = dailyViews(userId, metrics, hub).find((x) => x.id === id);
  if (!d || !hub.daily) return { ok: false, error: "unknown" };
  if (d.claimed) return { ok: false, error: "already-claimed" };
  if (!d.done) return { ok: false, error: "not-done" };
  return { ok: true, hub: { ...hub, daily: { ...hub.daily, claimed: [...hub.daily.claimed, id] } }, reward: d.reward };
}
