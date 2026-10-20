import { LAB_ROOM } from "./rooms/lab";
import type { Room } from "./types";

export const ROOMS: Record<string, Room> = { lab: LAB_ROOM };

// Co hráč dostane za dokončení místnosti. `firstXp` jen poprvé, `repeatXp`
// při každém dalším dokončení.
export const ROOM_REWARDS: Record<string, { unlocks: string[]; firstXp: number; repeatXp: number }> = {
  lab: { unlocks: ["avatar:chemik", "title:heisenberg"], firstXp: 60, repeatXp: 15 },
};

export const MIN_ESCAPE_SECONDS = 45;
