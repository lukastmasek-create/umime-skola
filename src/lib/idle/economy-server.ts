import type { Prisma } from "@prisma/client";
import { learningBonusFromXp, gameNow, normalizeState, settle, type EconomyState } from "@/lib/idle/economy";

// Sdílené serverové části Ekonomiky, které potřebují i jiné routy (např. nákup materiálů za peníze v craftu).

export const ECONOMY_GAME = "ekonomika";
const DAY_MS = 24 * 60 * 60 * 1000;

export class EconomyConflict extends Error {}

type Db = Pick<Prisma.TransactionClient, "xpEvent">;

export async function learningFor(db: Db, userId: string, real: number): Promise<number> {
  const sum = await db.xpEvent.aggregate({ where: { userId, createdAt: { gte: new Date(real - DAY_MS) } }, _sum: { amount: true } });
  return learningBonusFromXp(sum._sum.amount ?? 0);
}

export type LoadedEconomy = { id: string; updatedAt: Date; now: number; state: EconomyState };

// Načte stav Ekonomiky a dopočítá příjem do teď. Vrací null, když hráč nemá postavu.
export async function loadEconomy(tx: Prisma.TransactionClient, userId: string, real: number): Promise<LoadedEconomy | null> {
  const row = await tx.idleState.findUnique({ where: { userId_game: { userId, game: ECONOMY_GAME } } });
  if (!row) return null;
  const base = normalizeState(row.data, real);
  if (!base.character) return null;
  const learning = await learningFor(tx, userId, real);
  const now = gameNow(base, real);
  return { id: row.id, updatedAt: row.updatedAt, now, state: settle(base, now, learning) };
}

// Uloží stav tak, aby se zápis nepřepsal souběžnou změnou (jinak EconomyConflict).
export async function saveEconomy(tx: Prisma.TransactionClient, loaded: LoadedEconomy, state: EconomyState): Promise<void> {
  const data = { ...state, lastSeen: loaded.now } as unknown as Prisma.InputJsonValue;
  const res = await tx.idleState.updateMany({ where: { id: loaded.id, updatedAt: loaded.updatedAt }, data: { data } });
  if (res.count === 0) throw new EconomyConflict();
}
