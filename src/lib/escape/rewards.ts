import { CASTLE_ROOM } from "./rooms/castle";
import { EXPEDITION_ROOM } from "./rooms/expedition";
import { JUNGLE_ROOM } from "./rooms/jungle";
import { KITCHEN_ROOM } from "./rooms/kitchen";
import { LAB_ROOM } from "./rooms/lab";
import { LIBRARY_ROOM } from "./rooms/library";
import { MUSEUM_ROOM } from "./rooms/museum";
import { OBSERVATORY_ROOM } from "./rooms/observatory";
import { PIRATE_ROOM } from "./rooms/pirate";
import { buildRoom } from "./rooms/kit";
import { ROOM_KITS } from "./rooms/translations";
import { OLD_ROOM_KITS } from "./rooms/translations-old";
import { LAB_VARIANTS } from "./rooms/translations-lab";
import { buildInnerRoom, type InnerText } from "./rooms/inner";
import { INNER_CS } from "./rooms/inner-cs";
import { INNER_EN } from "./rooms/inner-en";
import { INNER_DE } from "./rooms/inner-de";
import { INNER_RU } from "./rooms/inner-ru";
import type { Locale } from "@/i18n/config";
import type { Room } from "./types";

export const ROOMS: Record<string, Room> = {
  lab: LAB_ROOM,
  museum: MUSEUM_ROOM,
  expedition: EXPEDITION_ROOM,
  jungle: JUNGLE_ROOM,
  pirate: PIRATE_ROOM,
  kitchen: KITCHEN_ROOM,
  library: LIBRARY_ROOM,
  observatory: OBSERVATORY_ROOM,
  castle: CASTLE_ROOM,
};

// Místnost v jazyce hráče. Všechny místnosti mají překlady, čeština je výchozí.
const VARIANTS: Record<string, Partial<Record<Locale, Room>>> = Object.fromEntries([
  ...Object.entries({ ...ROOM_KITS, ...OLD_ROOM_KITS }).map(([id, kits]) => [id, Object.fromEntries(Object.entries(kits).map(([loc, kit]) => [loc, buildRoom(kit!)]))]),
  ["lab", LAB_VARIANTS] as const,
]);

export function getRoom(id: string, locale: Locale): Room | undefined {
  return VARIANTS[id]?.[locale] ?? ROOMS[id];
}

// Každá únikovka má víc místností za sebou: první (kit.ts / lab.ts) a druhou (inner.ts).
const INNER: Record<Locale, Record<string, InnerText>> = { cs: INNER_CS, en: INNER_EN, de: INNER_DE, ru: INNER_RU };

export type Difficulty = 1 | 2 | 3 | 4 | 5;

// Obtížnost únikovky (1 = nejlehčí, 5 = nejtěžší) podle náročnosti učiva v obou místnostech.
export const ROOM_DIFFICULTY: Record<string, Difficulty> = {
  observatory: 1,
  jungle: 2,
  expedition: 2,
  kitchen: 3,
  pirate: 3,
  castle: 3,
  museum: 4,
  library: 4,
  lab: 5,
};

export type Escape = { id: string; rooms: Room[]; timeLimitSeconds: number; difficulty: Difficulty };

export function getEscape(id: string, locale: Locale): Escape | undefined {
  const first = getRoom(id, locale);
  if (!first) return undefined;
  const innerText = INNER[locale][id] ?? INNER_CS[id];
  const rooms = innerText ? [first, buildInnerRoom(id, innerText)] : [first];
  return { id, rooms, timeLimitSeconds: escapeTimeLimit(id), difficulty: ROOM_DIFFICULTY[id] ?? 3 };
}

// Časový limit celé únikovky (součet limitů místností). Nezávisí na jazyce, používá ho i server.
export function escapeTimeLimit(id: string): number {
  const first = ROOMS[id];
  if (!first) return 0;
  return first.timeLimitSeconds + (INNER_CS[id] ? buildInnerRoom(id, INNER_CS[id]).timeLimitSeconds : 0);
}

// Co hráč dostane za dokončení místnosti. `firstXp` jen poprvé, `repeatXp`
// při každém dalším dokončení.
export const ROOM_REWARDS: Record<string, { unlocks: string[]; firstXp: number; repeatXp: number }> = {
  lab: { unlocks: ["avatar:chemik", "title:heisenberg"], firstXp: 60, repeatXp: 15 },
  museum: { unlocks: ["avatar:archaeologist"], firstXp: 60, repeatXp: 15 },
  expedition: { unlocks: ["avatar:explorer"], firstXp: 60, repeatXp: 15 },
  jungle: { unlocks: ["avatar:ranger"], firstXp: 60, repeatXp: 15 },
  pirate: { unlocks: ["avatar:sailor"], firstXp: 60, repeatXp: 15 },
  kitchen: { unlocks: ["avatar:chef"], firstXp: 60, repeatXp: 15 },
  library: { unlocks: ["title:librarian"], firstXp: 60, repeatXp: 15 },
  observatory: { unlocks: ["title:astronomer"], firstXp: 60, repeatXp: 15 },
  castle: { unlocks: ["title:castellan"], firstXp: 60, repeatXp: 15 },
};

// Titul za dokončení všech místností.
export const ESCAPE_MASTER_UNLOCK = "title:escape-master";

// Dvě místnosti a deset hádanek se za méně než minutu poctivě vyřešit nedají.
export const MIN_ESCAPE_SECONDS = 60;
