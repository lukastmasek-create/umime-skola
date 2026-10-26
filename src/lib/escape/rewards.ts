import { EXPEDITION_ROOM } from "./rooms/expedition";
import { JUNGLE_ROOM } from "./rooms/jungle";
import { KITCHEN_ROOM } from "./rooms/kitchen";
import { LAB_ROOM } from "./rooms/lab";
import { MUSEUM_ROOM } from "./rooms/museum";
import { PIRATE_ROOM } from "./rooms/pirate";
import type { Room } from "./types";

export const ROOMS: Record<string, Room> = {
  lab: LAB_ROOM,
  museum: MUSEUM_ROOM,
  expedition: EXPEDITION_ROOM,
  jungle: JUNGLE_ROOM,
  pirate: PIRATE_ROOM,
  kitchen: KITCHEN_ROOM,
};

// Co hráč dostane za dokončení místnosti. `firstXp` jen poprvé, `repeatXp`
// při každém dalším dokončení.
export const ROOM_REWARDS: Record<string, { unlocks: string[]; firstXp: number; repeatXp: number }> = {
  lab: { unlocks: ["avatar:chemik", "title:heisenberg"], firstXp: 60, repeatXp: 15 },
  museum: { unlocks: ["avatar:archaeologist"], firstXp: 60, repeatXp: 15 },
  expedition: { unlocks: ["avatar:explorer"], firstXp: 60, repeatXp: 15 },
  jungle: { unlocks: ["avatar:ranger"], firstXp: 60, repeatXp: 15 },
  pirate: { unlocks: ["avatar:sailor"], firstXp: 60, repeatXp: 15 },
  kitchen: { unlocks: ["avatar:chef"], firstXp: 60, repeatXp: 15 },
};

export const MIN_ESCAPE_SECONDS = 45;
