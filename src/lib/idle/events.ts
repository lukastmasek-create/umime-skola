// Sezónní události a „hra týdne“ ve Stálých hrách. Čistý kód bez databáze: co je aktivní, se vždy dopočítá z data,
// takže není potřeba žádný plánovač a server i prohlížeč vidí totéž. Bonus je násobitel výdělku (nebo rychlosti
// u Farmy) a má strop, aby se události nesčítaly do nesmyslných čísel.

export type GameId = "base" | "city" | "farm" | "pets";
export const GAME_IDS: GameId[] = ["base", "city", "farm", "pets"];

// Měsíc a den (1–12, 1–31), obě hranice včetně; interval může přetéct přes konec roku.
type Md = [month: number, day: number];

export type EventDef = {
  id: string;
  ranges: [from: Md, to: Md][];
  bonus: Partial<Record<GameId, number>>;
};

export const EVENTS: EventDef[] = [
  { id: "spring-planting", ranges: [[[3, 20], [4, 30]]], bonus: { farm: 0.2 } },
  { id: "meteors", ranges: [[[8, 8], [8, 14]], [[12, 12], [12, 15]]], bonus: { base: 0.25 } },
  { id: "back-to-school", ranges: [[[9, 1], [9, 14]]], bonus: { base: 0.1, city: 0.1, farm: 0.1, pets: 0.1 } },
  { id: "harvest", ranges: [[[9, 15], [10, 10]]], bonus: { farm: 0.2, city: 0.1 } },
  { id: "animal-day", ranges: [[[10, 1], [10, 7]]], bonus: { pets: 0.25 } },
  { id: "pumpkin", ranges: [[[10, 25], [11, 2]]], bonus: { farm: 0.15, pets: 0.15 } },
  { id: "christmas", ranges: [[[12, 1], [12, 31]]], bonus: { city: 0.25, pets: 0.1 } },
];

export const WEEKLY_FOCUS_BONUS = 0.15;
export const MAX_EVENT_BONUS = 0.3;

function mdValue(m: number, d: number): number {
  return m * 100 + d;
}

export function inRange(month: number, day: number, [from, to]: [Md, Md]): boolean {
  const v = mdValue(month, day);
  const a = mdValue(from[0], from[1]);
  const b = mdValue(to[0], to[1]);
  return a <= b ? v >= a && v <= b : v >= a || v <= b;
}

export function activeEvents(now: number): EventDef[] {
  const d = new Date(now);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return EVENTS.filter((e) => e.ranges.some((r) => inRange(month, day, r)));
}

/** Číslo týdne od pondělí 5. 1. 1970 (UTC); pro stejný týden vždycky stejné. */
export function weekNumber(now: number): number {
  const MONDAY0 = 4 * 86_400_000; // 1. 1. 1970 je čtvrtek, první pondělí je 5. 1.
  return Math.floor((now - MONDAY0) / (7 * 86_400_000));
}

/** Týdenní klíč pro týdenní cíle, např. "2026-W44" (ISO týden, UTC). */
export function isoWeekKey(now: number): string {
  const d = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Začátek aktuálního ISO týdne (pondělí 00:00 UTC) v ms. */
export function weekStart(now: number): number {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  const dayNum = d.getUTCDay() || 7;
  return d.getTime() - (dayNum - 1) * 86_400_000;
}

/** Hra týdne: každý týden jedna ze čtyř her, po čtyřech týdnech se střídání opakuje. */
export function weeklyFocus(now: number): GameId {
  return GAME_IDS[((weekNumber(now) % 4) + 4) % 4];
}

export type EventBonus = { total: number; events: string[]; focus: boolean };

/** Bonus události pro jednu hru: součet aktivních událostí a hry týdne, nejvýš MAX_EVENT_BONUS. */
export function eventBonusFor(game: GameId, now: number): EventBonus {
  let sum = 0;
  const events: string[] = [];
  for (const e of activeEvents(now)) {
    const b = e.bonus[game];
    if (b) {
      sum += b;
      events.push(e.id);
    }
  }
  const focus = weeklyFocus(now) === game;
  if (focus) sum += WEEKLY_FOCUS_BONUS;
  return { total: Math.min(MAX_EVENT_BONUS, sum), events, focus };
}

export function allEventBonuses(now: number): Record<GameId, EventBonus> {
  return { base: eventBonusFor("base", now), city: eventBonusFor("city", now), farm: eventBonusFor("farm", now), pets: eventBonusFor("pets", now) };
}
