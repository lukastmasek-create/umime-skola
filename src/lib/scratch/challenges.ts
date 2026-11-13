import { BOUND_X, type Line, type Sprite } from "./engine";

// Výzvy pro žáky: kontrola běží nad stavem po doběhnutí skriptu (kresba + poloha kočky).
export const CHALLENGE_IDS = ["square", "edge", "lines"] as const;
export type ChallengeId = (typeof CHALLENGE_IDS)[number];

export type ChallengeState = { sprite: Pick<Sprite, "x" | "y">; lines: Line[] };

const MIN_SEGMENT = 0.5;

// Tvar je uzavřený, když se každý konec čáry v kresbě potká aspoň s jedním dalším koncem.
export function isClosedShape(lines: Line[]): boolean {
  const segs = lines.filter((l) => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) >= MIN_SEGMENT);
  if (segs.length < 4) return false;
  const key = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;
  const count = new Map<string, number>();
  for (const l of segs) {
    for (const k of [key(l.x1, l.y1), key(l.x2, l.y2)]) count.set(k, (count.get(k) ?? 0) + 1);
  }
  return [...count.values()].every((c) => c >= 2);
}

export function checkChallenge(id: ChallengeId, state: ChallengeState): boolean {
  switch (id) {
    case "square":
      return isClosedShape(state.lines);
    case "edge":
      return state.sprite.x >= BOUND_X - 30;
    case "lines":
      return state.lines.length >= 12;
  }
}
