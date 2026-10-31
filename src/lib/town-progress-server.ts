import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_SOURCES } from "@/lib/gamify";
import {
  BUILDING_IDS,
  isBuildingId,
  normalizePlots,
  normalizeTreasures,
  questReason,
  treasureFor,
  type BuildingId,
  type BuildingLevels,
  type PlotState,
  type QuestDef,
  type QuestKind,
  type TreasureStore,
} from "@/lib/town-progress";

// Serverové pomůcky pro postup v městečku (budovy, úkoly, poklady). Stav je v IdleState pod těmito hrami.
export const BUILD_GAME = "mestecko-budovy";
export const TREASURE_GAME = "mestecko-poklady";
export const PLOT_GAME = "mestecko-parcely";
const MINI_GAME = "mestecko-mini";

type Db = Prisma.TransactionClient | typeof prisma;

export function normalizeLevels(raw: unknown): BuildingLevels {
  const levels = ((raw && typeof raw === "object" ? (raw as { levels?: unknown }).levels : null) ?? {}) as Record<string, unknown>;
  const out: BuildingLevels = {};
  for (const id of BUILDING_IDS) {
    const v = Number(levels[id]);
    if (Number.isInteger(v) && v > 0) out[id] = Math.min(3, v);
  }
  return out;
}

export async function buildingLevels(userId: string, db: Db = prisma): Promise<BuildingLevels> {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: BUILD_GAME } } });
  return normalizeLevels(row?.data);
}

// Úroveň jedné budovy pro bonus; při chybě databáze bez bonusu.
export async function buildingLevel(userId: string, id: BuildingId, db: Db = prisma): Promise<number> {
  if (!isBuildingId(id)) return 0;
  try {
    return (await buildingLevels(userId, db))[id] ?? 0;
  } catch {
    return 0;
  }
}

function startOfDay(day: string) {
  return new Date(day + "T00:00:00Z");
}

// Pokrok úkolů dne z XP, bodů a stavu miniher (jedna sada dotazů pro všechny úkoly).
export async function questProgress(userId: string, day: string, quests: QuestDef[]): Promise<Record<string, number>> {
  const since = startOfDay(day);
  const kinds = new Set<QuestKind>(quests.map((q) => q.kind));
  const [xpRows, collect, npc, mini, claimed] = await Promise.all([
    kinds.has("xp") || kinds.has("games") || kinds.has("test") || kinds.has("escape")
      ? prisma.xpEvent.findMany({ where: { userId, source: { in: [...ACTIVITY_SOURCES] }, createdAt: { gte: since } }, select: { source: true, amount: true } })
      : Promise.resolve([]),
    kinds.has("collect") ? prisma.pointTransaction.count({ where: { userId, reason: { startsWith: `Městečko: sběr ${day} #` }, createdAt: { gte: since } } }) : Promise.resolve(0),
    kinds.has("npc") ? prisma.pointTransaction.count({ where: { userId, reason: { endsWith: ` otázka ${day}` }, createdAt: { gte: since } } }) : Promise.resolve(0),
    kinds.has("mini") ? prisma.idleState.findUnique({ where: { userId_game: { userId, game: MINI_GAME } } }) : Promise.resolve(null),
    prisma.pointTransaction.findMany({ where: { userId, reason: { in: quests.map((q) => questReason(day, q.id)) } }, select: { reason: true } }),
  ]);
  const miniStore = ((mini?.data as { mini?: Record<string, { day?: string; plays?: number }> } | null)?.mini ?? {}) as Record<string, { day?: string; plays?: number }>;
  const miniPlays = Object.values(miniStore).reduce((sum, e) => sum + (e?.day === day ? Number(e.plays) || 0 : 0), 0);
  const per: Record<QuestKind, number> = {
    xp: xpRows.reduce((s, r) => s + r.amount, 0),
    games: xpRows.filter((r) => r.source === "game").length,
    test: xpRows.filter((r) => r.source === "test").length,
    escape: xpRows.filter((r) => r.source === "escape").length,
    collect,
    npc,
    mini: miniPlays,
  };
  const out: Record<string, number> = {};
  for (const q of quests) out[q.id] = per[q.kind];
  for (const c of claimed) out[`claimed:${c.reason}`] = 1;
  return out;
}

export async function readTreasures(userId: string, db: Db = prisma): Promise<TreasureStore> {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: TREASURE_GAME } } });
  return normalizeTreasures(row?.data);
}

export async function writeTreasures(userId: string, store: TreasureStore, db: Db = prisma) {
  const data = store as unknown as Prisma.InputJsonValue;
  await db.idleState.upsert({ where: { userId_game: { userId, game: TREASURE_GAME } }, create: { userId, game: TREASURE_GAME, data }, update: { data } });
}

// Sebrání denního místa: když v něm je schovaný poklad, přidá ho do alba a vrátí jeho id.
export async function maybeTreasure(userId: string, day: string, spotIdx: number, db: Db): Promise<string | null> {
  const { spot, piece } = treasureFor(day, userId);
  if (spot !== spotIdx) return null;
  const store = await readTreasures(userId, db);
  store.pieces[piece] = (store.pieces[piece] ?? 0) + 1;
  await writeTreasures(userId, store, db);
  return piece;
}

export async function readPlots(userId: string, db: Db = prisma): Promise<PlotState> {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: PLOT_GAME } } });
  return normalizePlots(row?.data);
}

export async function writePlots(userId: string, state: PlotState, db: Db = prisma) {
  const data = state as unknown as Prisma.InputJsonValue;
  await db.idleState.upsert({ where: { userId_game: { userId, game: PLOT_GAME } }, create: { userId, game: PLOT_GAME, data }, update: { data } });
}
