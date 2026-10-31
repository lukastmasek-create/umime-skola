import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeRoom, roomEndlessBonus, roomXpBonus } from "@/lib/room";

// Bonusy z nábytku v pokoji pro API (XP, nekonečné hry). Stav pokoje je v IdleState pod hrou ROOM_GAME.
export const ROOM_GAME = "room";
type Db = Pick<typeof prisma, "idleState"> | Prisma.TransactionClient;

export async function readRoom(userId: string, db: Db = prisma) {
  const row = await db.idleState.findUnique({ where: { userId_game: { userId, game: ROOM_GAME } }, select: { data: true } });
  return normalizeRoom(row?.data);
}

export async function roomXpPercent(userId: string, source: string): Promise<number> {
  try {
    return roomXpBonus(await readRoom(userId), source);
  } catch {
    return 0;
  }
}

export async function roomEndless(db: Db, userId: string): Promise<number> {
  try {
    return roomEndlessBonus(await readRoom(userId, db));
  } catch {
    return 0;
  }
}
