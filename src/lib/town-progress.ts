// Postup v městečku: úkoly od obyvatel, vylepšování budov a album pokladů.
// Sdílí server (api/mestecko/ukoly, budovy, poklady) i prohlížeč (TownPanel).

import type { NpcKey } from "./town-npc";

// ------------------------------------------------------------------------------------------- úkoly
// Úkol se plní běžnou aktivitou na webu; server ho ověří z XP, bodů a stavu miniher.
export type QuestKind = "xp" | "games" | "test" | "collect" | "mini" | "npc" | "escape";
export type QuestGiver = NpcKey | "kavarna" | "dilna" | "sklenik" | "mlyn" | "muzeum";
export type QuestDef = { id: string; kind: QuestKind; target: number; reward: number; giver: QuestGiver; href?: string };

export const QUEST_POOL: QuestDef[] = [
  { id: "xp30", kind: "xp", target: 30, reward: 15, giver: "knihovnice", href: "/kurzy" },
  { id: "xp60", kind: "xp", target: 60, reward: 25, giver: "knihovnice", href: "/kurzy" },
  { id: "games2", kind: "games", target: 2, reward: 12, giver: "kluk", href: "/kurzy" },
  { id: "games4", kind: "games", target: 4, reward: 20, giver: "kluk", href: "/kurzy" },
  { id: "test1", kind: "test", target: 1, reward: 15, giver: "babicka", href: "/kurzy" },
  { id: "collect4", kind: "collect", target: 4, reward: 10, giver: "farmar" },
  { id: "collect8", kind: "collect", target: 8, reward: 18, giver: "farmar" },
  { id: "mini1", kind: "mini", target: 1, reward: 10, giver: "pekar" },
  { id: "mini3", kind: "mini", target: 3, reward: 18, giver: "pekar" },
  { id: "npc1", kind: "npc", target: 1, reward: 10, giver: "babicka" },
  { id: "escape1", kind: "escape", target: 1, reward: 20, giver: "kluk", href: "/unikovky" },
];
export const QUESTS_PER_DAY = 3;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Tři úkoly na den: různé druhy, pořadí podle dne a hráče (každý má jiné); vlastní budovy na parcelách přidají své.
export function dailyQuests(day: string, userId: string, built: readonly PlotBuilding[] = []): QuestDef[] {
  const order = [...QUEST_POOL].sort((a, b) => hash(day + userId + a.id) - hash(day + userId + b.id));
  const out: QuestDef[] = [];
  for (const q of order) {
    if (out.some((o) => o.kind === q.kind)) continue;
    out.push(q);
    if (out.length >= QUESTS_PER_DAY) break;
  }
  for (const b of PLOT_BUILDINGS) if (built.includes(b)) out.push(PLOT_QUESTS[b]);
  return out;
}

export const questReason = (day: string, id: string) => `Městečko: úkol ${day} ${id}`;
export type QuestSnapshot = { id: string; kind: QuestKind; giver: QuestGiver; target: number; progress: number; reward: number; claimed: boolean; href?: string }[];

// ------------------------------------------------------------------------------------------ budovy
// Každá budova má 3 úrovně za body; úroveň dává bonus (popis v i18n/town-progress.ts).
export const BUILDING_IDS = ["skola", "herna", "obchod", "namesti", "pekarna", "knihovna", "hvezdarna", "kvetinarstvi"] as const;
export type BuildingId = (typeof BUILDING_IDS)[number];
export const isBuildingId = (v: unknown): v is BuildingId => typeof v === "string" && (BUILDING_IDS as readonly string[]).includes(v);
export const MAX_BUILDING_LEVEL = 3;

export const BUILDINGS: Record<BuildingId, { icon: string; costs: [number, number, number] }> = {
  skola: { icon: "🏫", costs: [200, 450, 900] },
  herna: { icon: "🕹️", costs: [200, 450, 900] },
  obchod: { icon: "🛍️", costs: [150, 350, 700] },
  namesti: { icon: "⛲", costs: [120, 260, 520] },
  pekarna: { icon: "🥐", costs: [100, 220, 450] },
  knihovna: { icon: "📚", costs: [100, 220, 450] },
  hvezdarna: { icon: "🔭", costs: [100, 220, 450] },
  kvetinarstvi: { icon: "🌷", costs: [100, 220, 450] },
};

// Bonusy podle úrovně: XP navíc (%), vrácení bodů z nákupu (%), body navíc za sebranou věc, kola miniher navíc.
export const XP_BONUS_PER_LEVEL = 5;
export const CASHBACK_PER_LEVEL = 3;
export const COLLECT_BONUS_PER_LEVEL = 1;
export const EXTRA_PLAYS_PER_LEVEL = 1;

// Která budova přidává kola které minihře.
export const MINI_BUILDING: Record<string, BuildingId> = {
  bakery: "pekarna",
  cashier: "pekarna",
  library: "knihovna",
  stars: "hvezdarna",
  flowers: "kvetinarstvi",
  harvest: "kvetinarstvi",
};

export type BuildingLevels = Partial<Record<BuildingId, number>>;
export const buildReason = (id: BuildingId, level: number) => `Městečko: stavba ${id} ${level}`;

// ----------------------------------------------------------------------------------------- poklady
// Sady po šesti kouscích. Každý den je v jednom ze sbíraných míst schovaný kousek (pro každého hráče jiný).
export const TREASURE_SETS = {
  pirati: ["🧭", "🗝️", "🦜", "🗺️", "💰", "⚓"],
  les: ["🍄", "🦋", "🌰", "🪶", "🧚", "🌈"],
  vesmir: ["🪐", "☄️", "🛰️", "👽", "🌙", "🔭"],
  hrad: ["👑", "🛡️", "🗡️", "🐉", "🏰", "📜"],
  more: ["🐚", "🦀", "🐙", "🐠", "🔱", "🫧"],
} as const;
export type TreasureSet = keyof typeof TREASURE_SETS;
export const TREASURE_SET_IDS = Object.keys(TREASURE_SETS) as TreasureSet[];
export const SET_REWARD = 100;
export type TreasureId = `${TreasureSet}:${number}`;

export function isTreasureSet(v: unknown): v is TreasureSet {
  return typeof v === "string" && v in TREASURE_SETS;
}

export function treasureFor(day: string, userId: string): { spot: number; piece: TreasureId } {
  const h = hash(`poklad|${day}|${userId}`);
  const set = TREASURE_SET_IDS[h % TREASURE_SET_IDS.length];
  const idx = (h >>> 8) % TREASURE_SETS[set].length;
  return { spot: (h >>> 16) % 8, piece: `${set}:${idx}` };
}

export type TreasureStore = { pieces: Record<string, number>; claimed: TreasureSet[] };
export function normalizeTreasures(raw: unknown): TreasureStore {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<TreasureStore>;
  const pieces: Record<string, number> = {};
  for (const [k, v] of Object.entries(r.pieces ?? {})) {
    const [set, i] = k.split(":");
    if (isTreasureSet(set) && Number(i) >= 0 && Number(i) < TREASURE_SETS[set].length && Number.isFinite(v)) pieces[k] = Math.max(0, Math.floor(v as number));
  }
  return { pieces, claimed: (Array.isArray(r.claimed) ? r.claimed : []).filter(isTreasureSet) };
}

export function setComplete(store: TreasureStore, set: TreasureSet): boolean {
  return TREASURE_SETS[set].every((_, i) => (store.pieces[`${set}:${i}`] ?? 0) > 0);
}

// ------------------------------------------------------------------------------------ parcely a cesty
// Ke každé parcele vede plánovaná cesta (lib/town3d/layout: MAIN_ROADS s `planned`, ve stejném pořadí jako ROAD_IDS).
// Až je cesta dostavěná, dá se na parcele postavit jedna z vlastních budov. Každá vydělává body za den
// a její obyvatel dává jeden úkol navíc.
export const ROAD_IDS = ["zapad", "vychod", "severozapad"] as const;
export type RoadId = (typeof ROAD_IDS)[number];
export const isRoadId = (v: unknown): v is RoadId => typeof v === "string" && (ROAD_IDS as readonly string[]).includes(v);
export const ROAD_COST: Record<RoadId, number> = { zapad: 150, vychod: 150, severozapad: 220 };

export const PLOT_IDS = ["parcela1", "parcela2", "parcela3", "parcela4", "parcela5"] as const;
export type PlotId = (typeof PLOT_IDS)[number];
export const isPlotId = (v: unknown): v is PlotId => typeof v === "string" && (PLOT_IDS as readonly string[]).includes(v);
export const PLOT_ROAD: Record<PlotId, RoadId> = { parcela1: "zapad", parcela3: "zapad", parcela2: "vychod", parcela4: "vychod", parcela5: "severozapad" };

export const PLOT_BUILDINGS = ["kavarna", "dilna", "sklenik", "mlyn", "muzeum"] as const;
export type PlotBuilding = (typeof PLOT_BUILDINGS)[number];
export const isPlotBuilding = (v: unknown): v is PlotBuilding => typeof v === "string" && (PLOT_BUILDINGS as readonly string[]).includes(v);
export const PLOT_BUILDING: Record<PlotBuilding, { icon: string; cost: number; income: number }> = {
  kavarna: { icon: "☕", cost: 300, income: 6 },
  dilna: { icon: "🔨", cost: 300, income: 6 },
  sklenik: { icon: "🌱", cost: 350, income: 7 },
  mlyn: { icon: "🌾", cost: 400, income: 8 },
  muzeum: { icon: "🏛️", cost: 500, income: 10 },
};
// úkol navíc od obyvatele vlastní budovy (giver = budova)
export const PLOT_QUESTS: Record<PlotBuilding, Omit<QuestDef, "giver"> & { giver: PlotBuilding }> = {
  kavarna: { id: "plot-kavarna", kind: "mini", target: 2, reward: 16, giver: "kavarna" },
  dilna: { id: "plot-dilna", kind: "games", target: 3, reward: 18, giver: "dilna", href: "/kurzy" },
  sklenik: { id: "plot-sklenik", kind: "collect", target: 6, reward: 16, giver: "sklenik" },
  mlyn: { id: "plot-mlyn", kind: "xp", target: 45, reward: 20, giver: "mlyn", href: "/kurzy" },
  muzeum: { id: "plot-muzeum", kind: "test", target: 1, reward: 20, giver: "muzeum", href: "/kurzy" },
};

export type PlotState = { roads: RoadId[]; plots: Partial<Record<PlotId, PlotBuilding>>; incomeDay: string | null };
export function normalizePlots(raw: unknown): PlotState {
  const r = (raw && typeof raw === "object" ? raw : {}) as { roads?: unknown; plots?: unknown; incomeDay?: unknown };
  const roads = Array.isArray(r.roads) ? ROAD_IDS.filter((id) => (r.roads as unknown[]).includes(id)) : [];
  const plots: PlotState["plots"] = {};
  const used = new Set<string>();
  const src = (r.plots && typeof r.plots === "object" ? r.plots : {}) as Record<string, unknown>;
  for (const p of PLOT_IDS) {
    const b = src[p];
    if (isPlotBuilding(b) && !used.has(b) && roads.includes(PLOT_ROAD[p])) {
      plots[p] = b;
      used.add(b);
    }
  }
  return { roads, plots, incomeDay: typeof r.incomeDay === "string" ? r.incomeDay : null };
}
export const plotIncome = (s: PlotState) => Object.values(s.plots).reduce((sum, b) => sum + (b ? PLOT_BUILDING[b].income : 0), 0);
export const roadReason = (id: RoadId) => `Městečko: cesta ${id}`;
export const plotReason = (plot: PlotId, b: PlotBuilding) => `Městečko: stavba ${b} na ${plot}`;
export const incomeReason = (day: string) => `Městečko: příjem z budov ${day}`;
