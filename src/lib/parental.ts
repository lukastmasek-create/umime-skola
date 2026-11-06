import { prisma } from "@/lib/prisma";
import { DAY_MS, dayKey } from "@/lib/gamify";
import { DONE_PERCENT, REVIEW_GAME, coursesDoneBetween, normalizeReview } from "@/lib/review";

// Rodičovská kontrola: PIN (bcrypt), denní limit času na webu (minuty, 0 = bez limitu), zákaz nákupů
// v obchodech a zákaz společného hraní. Uloženo v IdleState pod hrou PARENTAL_GAME.
export const PARENTAL_GAME = "rodicovska-kontrola";
// fails / lockedUntil: počet chybných PINů a do kdy je ověřování zamčené (ochrana proti hádání PINu).
export type Parental = {
  pin: string | null;
  minutes: number;
  blockShop: boolean;
  blockTogether: boolean;
  fails: number;
  lockedUntil: number;
};

export function normalizeParental(raw: unknown): Parental {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const minutes = Math.floor(Number(r.minutes));
  return {
    pin: typeof r.pin === "string" && r.pin ? r.pin : null,
    minutes: Number.isFinite(minutes) ? Math.min(600, Math.max(0, minutes)) : 0,
    blockShop: r.blockShop === true,
    blockTogether: r.blockTogether === true,
    fails: Number.isFinite(Number(r.fails)) ? Math.max(0, Math.floor(Number(r.fails))) : 0,
    lockedUntil: Number.isFinite(Number(r.lockedUntil)) ? Math.max(0, Number(r.lockedUntil)) : 0,
  };
}

export async function readParental(userId: string): Promise<Parental> {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: PARENTAL_GAME } }, select: { data: true } });
  return normalizeParental(row?.data);
}

export const REPORT_DAYS = 7;

/** Týdenní přehled pro rodiče: kolik kurzů dítě dokončilo za posledních 7 dní (včetně dneška). */
export async function weeklyReport(userId: string, now = Date.now()) {
  const row = await prisma.idleState.findUnique({ where: { userId_game: { userId, game: REVIEW_GAME } }, select: { data: true } });
  const state = normalizeReview(row?.data);
  const fromDay = dayKey(new Date(now - (REPORT_DAYS - 1) * DAY_MS));
  const weekIds = coursesDoneBetween(state, fromDay);
  const totalDone = coursesDoneBetween(state, "0000-00-00").length;
  const titles = weekIds.length
    ? (await prisma.course.findMany({ where: { id: { in: weekIds } }, select: { title: true }, orderBy: { title: "asc" } })).map((c) => c.title)
    : [];
  return { days: REPORT_DAYS, threshold: DONE_PERCENT, doneThisWeek: weekIds.length, doneTotal: totalDone, titles };
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
