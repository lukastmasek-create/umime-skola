import { prisma } from "@/lib/prisma";

// Rodičovská kontrola: PIN (bcrypt), denní limit času na webu (minuty, 0 = bez limitu), zákaz nákupů
// v obchodech a zákaz společného hraní. Uloženo v IdleState pod hrou PARENTAL_GAME.
export const PARENTAL_GAME = "rodicovska-kontrola";
export type Parental = { pin: string | null; minutes: number; blockShop: boolean; blockTogether: boolean };

export function normalizeParental(raw: unknown): Parental {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const minutes = Math.floor(Number(r.minutes));
  return {
    pin: typeof r.pin === "string" && r.pin ? r.pin : null,
    minutes: Number.isFinite(minutes) ? Math.min(600, Math.max(0, minutes)) : 0,
    blockShop: r.blockShop === true,
    blockTogether: r.blockTogether === true,
  };
}

export async function readParental(userId: string): Promise<Parental> {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: PARENTAL_GAME } }, select: { data: true } });
  return normalizeParental(row?.data);
}

/** Smí hráč utrácet body v obchodech? (rodič mohl nákupy zakázat) */
export async function shopBlocked(userId: string): Promise<boolean> {
  try {
    const p = await readParental(userId);
    return !!p.pin && p.blockShop;
  } catch {
    return false;
  }
}
