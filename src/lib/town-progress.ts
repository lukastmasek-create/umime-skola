// Postup v městečku: úkoly od obyvatel, vylepšování budov a album pokladů.
// Sdílí server (api/mestecko/ukoly, budovy, poklady) i prohlížeč (TownPanel).

import type { NpcKey } from "./town-npc";

// ------------------------------------------------------------------------------------------- úkoly
// Úkol se plní běžnou aktivitou na webu; server ho ověří z XP, bodů a stavu miniher.
export type QuestKind = "xp" | "games" | "test" | "collect" | "mini" | "npc" | "escape";
export type QuestDef = { id: string; kind: QuestKind; target: number; reward: number; giver: NpcKey; href?: string };

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

// Tři úkoly na den: různé druhy, pořadí podle dne a hráče (každý má jiné).
export function dailyQuests(day: string, userId: string): QuestDef[] {
  const order = [...QUEST_POOL].sort((a, b) => hash(day + userId + a.id) - hash(day + userId + b.id));
  const out: QuestDef[] = [];
  for (const q of order) {
    if (out.some((o) => o.kind === q.kind)) continue;
    out.push(q);
    if (out.length >= QUESTS_PER_DAY) break;
  }
  return out;
}

export const questReason = (day: string, id: string) => `Městečko: úkol ${day} ${id}`;
export type QuestSnapshot = { id: string; kind: QuestKind; giver: NpcKey; target: number; progress: number; reward: number; claimed: boolean; href?: string }[];

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
