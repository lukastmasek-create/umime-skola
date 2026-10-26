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

// Místnost v jazyce hráče. Nové místnosti mají překlady, ostatní zatím jen česky.
const VARIANTS: Record<string, Partial<Record<Locale, Room>>> = Object.fromEntries(
  Object.entries(ROOM_KITS).map(([id, kits]) => [id, Object.fromEntries(Object.entries(kits).map(([loc, kit]) => [loc, buildRoom(kit!)]))]),
);

export function getRoom(id: string, locale: Locale): Room | undefined {
  return VARIANTS[id]?.[locale] ?? ROOMS[id];
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

export const MIN_ESCAPE_SECONDS = 45;
