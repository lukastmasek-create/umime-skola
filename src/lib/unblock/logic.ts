// Pure sliding-block logic (6x6). No React, no DOM: testable with node.

export const SIZE = 6;
export const TARGET_ID = "X";
export const EXIT_ROW = 2;

export type Orient = "h" | "v";
export type Block = { id: string; orient: Orient; r: number; c: number; len: 2 | 3 };
export type Level = { name: string; blocks: Block[] };

export const along = (b: Block): number => (b.orient === "h" ? b.c : b.r);

export const maxPos = (b: Block): number =>
  // target may slide until only its left cell is still on the board (exit)
  b.id === TARGET_ID ? SIZE - b.len + 1 : SIZE - b.len;

export function cells(b: Block, p: number = along(b)): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < b.len; i++) out.push(b.orient === "h" ? [b.r, p + i] : [p + i, b.c]);
  return out;
}

export function canOccupy(blocks: Block[], id: string, p: number): boolean {
  const self = blocks.find((b) => b.id === id);
  if (!self) return false;
  if (p < 0 || p > maxPos(self)) return false;
  const taken = new Set<string>();
  for (const o of blocks) if (o.id !== id) for (const [r, c] of cells(o)) taken.add(`${r},${c}`);
  for (const [r, c] of cells(self, p)) {
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue; // off-board part is only ever the exit
    if (taken.has(`${r},${c}`)) return false;
  }
  return true;
}

/** Inclusive range of positions block `id` may slide to right now. */
export function slideRange(blocks: Block[], id: string): { min: number; max: number } {
  const self = blocks.find((b) => b.id === id)!;
  const start = along(self);
  let min = start;
  while (min - 1 >= 0 && canOccupy(blocks, id, min - 1)) min--;
  let max = start;
  while (max + 1 <= maxPos(self) && canOccupy(blocks, id, max + 1)) max++;
  return { min, max };
}

export function moveBlock(blocks: Block[], id: string, p: number): Block[] {
  return blocks.map((b) => (b.id !== id ? b : b.orient === "h" ? { ...b, c: p } : { ...b, r: p }));
}

export function isSolved(blocks: Block[]): boolean {
  const t = blocks.find((b) => b.id === TARGET_ID);
  return !!t && t.c + t.len > SIZE;
}

/** Breadth-first search: minimal number of slides to solve, or -1. Used by tests / tooling. */
export function minMoves(start: Block[], limit = 500_000): number {
  const key = (bs: Block[]) => bs.map((b) => `${b.id}${along(b)}`).join("|");
  const seen = new Set<string>([key(start)]);
  let frontier: Block[][] = [start];
  let depth = 0;
  while (frontier.length) {
    const next: Block[][] = [];
    for (const state of frontier) {
      if (isSolved(state)) return depth;
      for (const b of state) {
        const { min, max } = slideRange(state, b.id);
        for (let p = min; p <= max; p++) {
          if (p === along(b)) continue;
          const ns = moveBlock(state, b.id, p);
          const k = key(ns);
          if (seen.has(k)) continue;
          seen.add(k);
          if (seen.size > limit) return -1;
          next.push(ns);
        }
      }
    }
    frontier = next;
    depth++;
  }
  return -1;
}
