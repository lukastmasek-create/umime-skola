import { normalizeBase } from "./base";
import { getItem as getCityItem, normalizeCity } from "./city";
import { levelInfo as farmLevelInfo, normalizeState as normalizeFarm } from "./farm";
import { levelFromGrowth, normalizeState as normalizePets } from "./pets";
import { EMPTY_METRICS, type Metrics } from "./hub";

export type RawStates = { zakladna?: unknown; mesto?: unknown; farma?: unknown; mazlicci?: unknown };

/** Čísla pro úspěchy a úkoly z uložených stavů všech her (chybějící hra = nuly). */
export function metricsFrom(raw: RawStates, learnXp: number, learnXpToday: number, learnXpWeek: number, now: number): Metrics {
  const m: Metrics = { ...EMPTY_METRICS, learnXp, learnXpToday, learnXpWeek };
  if (raw.zakladna) {
    const s = normalizeBase(raw.zakladna, now);
    m.baseModules = s.items.filter((it) => it[0] !== "core" && it[0] !== "corridor").length;
    m.baseEarned = Math.floor(s.totalEarned);
    m.baseShips = s.ships.length;
    m.baseResearch = s.researched.length;
  }
  if (raw.mesto) {
    const s = normalizeCity(raw.mesto, now);
    m.cityBuildings = s.items.filter((it) => getCityItem(it[0])?.cat !== "road").length;
    m.cityEarned = Math.floor(s.totalEarned);
  }
  if (raw.farma) {
    const s = normalizeFarm(raw.farma, now);
    m.farmLevel = farmLevelInfo(s.xp).level;
    m.farmOrders = s.ordersDone;
    m.farmEarned = Math.floor(s.totalEarned);
  }
  if (raw.mazlicci) {
    const s = normalizePets(raw.mazlicci, now);
    const stats = Object.values(s.pets).filter((p): p is NonNullable<typeof p> => !!p);
    m.petsOwned = stats.length;
    m.petLevel = stats.reduce((best, p) => Math.max(best, levelFromGrowth(p.growth)), 0);
    m.petsEarned = Math.floor(s.totalEarned);
  }
  return m;
}
