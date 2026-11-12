// Rodinný tarif UčímePRO: pozvánky, rodinný souboj s handicapem a plán na prázdniny. Čistá logika bez databáze.

import type { FreshCourse, PlanDay, PlanTask, WeakCourse } from "./plan";

/** Nejvýš 5 účtů v rodině včetně plátce. */
export const FAMILY_MAX_ACCOUNTS = 5;
export const INVITE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export type Invite = { code: string; exp: number };

/** Kód pozvánky: id předplatného a náhodná část. Id je v kódu, aby šlo předplatné i plátce najít bez prohledávání. */
export function makeInviteCode(subscriptionId: string, random: string): string {
  return `${subscriptionId}~${random}`;
}

export function parseInviteCode(code: unknown): { subscriptionId: string; random: string } | null {
  if (typeof code !== "string") return null;
  const m = /^([a-z0-9]{20,40})~([A-Z0-9]{6,12})$/i.exec(code.trim());
  return m ? { subscriptionId: m[1], random: m[2] } : null;
}

/** Odstraní prošlé pozvánky a nechá nejvýš 5 nejnovějších. */
export function pruneInvites(raw: unknown, now: number): Invite[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i): i is Invite => !!i && typeof (i as Invite).code === "string" && Number.isFinite((i as Invite).exp) && (i as Invite).exp > now)
    .slice(-5);
}

export function seatsLeft(memberCount: number): number {
  return Math.max(0, FAMILY_MAX_ACCOUNTS - 1 - memberCount);
}

// --- Rodinný souboj s handicapem ---

export type Handicap = 1 | 2 | 3;
export const HANDICAPS: Record<Handicap, { childBonus: number; parentSeconds: number }> = {
  1: { childBonus: 2, parentSeconds: 12 },
  2: { childBonus: 4, parentSeconds: 8 },
  3: { childBonus: 6, parentSeconds: 5 },
};
export const DUEL_QUESTIONS = 10;

export function cleanHandicap(raw: unknown): Handicap {
  const n = Math.floor(Number(raw));
  return n === 1 || n === 3 ? n : 2;
}

export type DuelResult = { child: number; parent: number; winner: "child" | "parent" | "draw" };

/** Dítě dostane náskok v bodech, rodič odpovídá na čas. Vyhrává víc bodů. */
export function duelResult(childCorrect: number, parentCorrect: number, handicap: Handicap): DuelResult {
  const child = childCorrect + HANDICAPS[handicap].childBonus;
  return { child, parent: parentCorrect, winner: child === parentCorrect ? "draw" : child > parentCorrect ? "child" : "parent" };
}

// --- Plán na prázdniny ---

export const MAX_HOLIDAY_DAYS = 70;
const DAY = 24 * 60 * 60 * 1000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function holidayDays(start: unknown, end: unknown): string[] | null {
  if (typeof start !== "string" || typeof end !== "string" || !DATE.test(start) || !DATE.test(end)) return null;
  const a = Date.parse(start + "T00:00:00Z");
  const b = Date.parse(end + "T00:00:00Z");
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  const n = Math.min(MAX_HOLIDAY_DAYS, Math.round((b - a) / DAY) + 1);
  return Array.from({ length: n }, (_, i) => new Date(a + i * DAY).toISOString().slice(0, 10));
}

/**
 * Každý den 15 minut: 5 minut opakování a 10 minut na slabý nebo nový kurz, kurzy se střídají.
 * Každý sedmý den je volný (jen 5 minut), aby prázdniny zůstaly prázdninami.
 */
export function buildHolidayPlan(days: string[], weak: WeakCourse[], fresh: FreshCourse[]): PlanDay[] {
  const pool: (WeakCourse | FreshCourse)[] = [...weak, ...fresh];
  return days.map((date, i) => {
    const tasks: PlanTask[] = [];
    if (i % 7 === 6) {
      tasks.push({ kind: "rest", minutes: 5 });
      return { date, tasks };
    }
    tasks.push({ kind: "review", minutes: 5, due: 0 });
    if (pool.length > 0) {
      const c = pool[i % pool.length];
      const isWeak = "low" in c;
      tasks.push({ kind: isWeak ? "weak" : "fresh", minutes: 10, courseId: c.courseId, title: c.title, href: c.href });
    }
    return { date, tasks };
  });
}
