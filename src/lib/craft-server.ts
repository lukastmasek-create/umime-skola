import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CRAFT_GAME, PROCESS_BATCH, activeTotal, applyEvents, emptyCraft, normalizeCraft, type CraftState } from "@/lib/craft";

// Stav craftování je v IdleState pod hrou CRAFT_GAME. Materiály za učení a za odměny ze stálých her se připisují
// líně při otevření: projdou se nové XP události a transakce bodů od posledního ukazatele, takže není potřeba
// sahat do všech míst, kde se XP rozdávají.

type Db = Pick<typeof prisma, "idleState"> | Prisma.TransactionClient;

/** Zdroje XP, které nejsou učení (kolo štěstí je náhoda). */
const NOT_LEARNING = ["wheel"];
/** Odměny ze stálých her (úkoly, úspěchy) se zapisují s tímto důvodem (viz api/stale-hry/prehled). */
const QUEST_REASON = "Stálé hry";

export class CraftConflict extends Error {}

export type LoadedCraft = {
  state: CraftState;
  /** updatedAt uloženého záznamu (null = ještě neexistuje) pro optimistický zámek. */
  version: Date | null;
  /** Materiály připsané právě teď (za učení a úkoly od minula). */
  gained: Record<string, number>;
  /** true = stav je potřeba uložit (nový hráč nebo posunuté ukazatele). */
  dirty: boolean;
};

export async function loadCraft(userId: string, now: number): Promise<LoadedCraft> {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: CRAFT_GAME } } });
  const base = (row && normalizeCraft(row.data, now)) || emptyCraft(now);
  const start: CraftState = { ...base, lastGain: {} };
  const [xp, quests] = await Promise.all([
    prisma.xpEvent.findMany({
      where: { userId, createdAt: { gt: new Date(start.xpCursor) }, source: { notIn: NOT_LEARNING }, amount: { gt: 0 } },
      orderBy: { createdAt: "asc" },
      take: PROCESS_BATCH,
      select: { id: true, amount: true, createdAt: true },
    }),
    prisma.pointTransaction.findMany({
      where: { userId, createdAt: { gt: new Date(start.questCursor) }, reason: { startsWith: QUEST_REASON }, amount: { gt: 0 } },
      orderBy: { createdAt: "asc" },
      take: PROCESS_BATCH,
      select: { id: true, amount: true, createdAt: true },
    }),
  ]);
  const lite = (rows: { id: string; amount: number; createdAt: Date }[]) => rows.map((r) => ({ id: r.id, amount: r.amount, at: r.createdAt.getTime() }));
  const state = applyEvents(start, lite(xp), lite(quests));
  return { state, version: row?.updatedAt ?? null, gained: state.lastGain, dirty: !row || state !== start };
}

/** Uloží stav; projde jen, když se záznam mezitím nezměnil (jinak CraftConflict). */
export async function saveCraft(tx: Prisma.TransactionClient, userId: string, version: Date | null, state: CraftState) {
  const data = { ...state, lastGain: {} } as unknown as Prisma.InputJsonValue;
  if (version) {
    const res = await tx.idleState.updateMany({ where: { userId, game: CRAFT_GAME, updatedAt: version }, data: { data } });
    if (res.count === 0) throw new CraftConflict();
    return;
  }
  try {
    await tx.idleState.create({ data: { userId, game: CRAFT_GAME, data } });
  } catch {
    throw new CraftConflict();
  }
}

async function readState(db: Db, userId: string, now: number): Promise<CraftState | null> {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: CRAFT_GAME } }, select: { data: true } });
  return row ? normalizeCraft(row.data, now) : null;
}

/** Procenta XP navíc z právě běžících craftěných bonusů (0 až MAX_XP_BOOST). */
export async function craftXpPercent(userId: string): Promise<number> {
  try {
    const now = Date.now();
    const s = await readState(prisma, userId, now);
    return s ? activeTotal(s, "xp", now) : 0;
  } catch {
    return 0;
  }
}

/** Zrychlení stálých her z craftěných přesýpacích hodin (podíl 0 až MAX_ENDLESS_BOOST). */
export async function craftEndlessBoost(db: Db, userId: string): Promise<number> {
  try {
    const now = Date.now();
    const s = await readState(db, userId, now);
    return s ? activeTotal(s, "endless", now) : 0;
  } catch {
    return 0;
  }
}
