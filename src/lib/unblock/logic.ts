// Vlastní engine posuvných bloků (deska 6×6). Bez Reactu a DOM, takže běží i v testech.
//
// Deska má dvě díry (výstupy): vpravo v řádku H_ROW (pro vodorovný klíč „H“)
// a dole ve sloupci V_COL (pro svislý klíč „V“). Vyjet klíč ven = vyhrát.

export const SIZE = 6;
export const H_ROW = 2;
export const V_COL = 3;

export type Axis = "h" | "v" | "both";
export type Key = "H" | "V";
/** Relativní buňky tvaru [řádek, sloupec]; minimum je vždy 0,0. */
export type Shape = [number, number][];
export type Piece = {
  id: string;
  r: number; // kotva (levý horní roh tvaru)
  c: number;
  shape: Shape;
  axis: Axis; // po jaké ose se dá posouvat
  key?: Key; // klíč: musí vyjet jeho dírou
};
export type Level = { name: string; pieces: Piece[] };

export const cellsOf = (p: Piece, r = p.r, c = p.c): [number, number][] =>
  p.shape.map(([dr, dc]) => [r + dr, c + dc]);

export const bbox = (shape: Shape) => ({
  w: Math.max(...shape.map(([, dc]) => dc)) + 1,
  h: Math.max(...shape.map(([dr]) => dr)) + 1,
});

const inBoard = (y: number, x: number) => y >= 0 && y < SIZE && x >= 0 && x < SIZE;

/** Může být piece `id` s kotvou (r,c)? Kolize a mimo-desku jen přes vlastní díru. */
export function canAt(pieces: Piece[], id: string, r: number, c: number): boolean {
  const self = pieces.find((p) => p.id === id);
  if (!self) return false;
  const taken = new Set<string>();
  for (const o of pieces) if (o.id !== id) for (const [y, x] of cellsOf(o)) taken.add(`${y},${x}`);
  for (const [y, x] of cellsOf(self, r, c)) {
    if (inBoard(y, x)) {
      if (taken.has(`${y},${x}`)) return false;
      continue;
    }
    const throughHole =
      (self.key === "H" && y === H_ROW && x >= SIZE) || (self.key === "V" && x === V_COL && y >= SIZE);
    if (!throughHole) return false;
  }
  return true;
}

/** Piece je celý mimo desku (klíč prošel dírou). */
export function isOut(p: Piece): boolean {
  return cellsOf(p).every(([y, x]) => !inBoard(y, x));
}

export const isSolved = (pieces: Piece[]): boolean =>
  pieces.filter((p) => p.key).every((p) => isOut(p));

/** Dosah posunu piece po ose: { min, max } kotvy (včetně aktuální). */
export function axisRange(pieces: Piece[], id: string, axis: "h" | "v"): { min: number; max: number } {
  const p = pieces.find((q) => q.id === id)!;
  const at = (k: number) => (axis === "h" ? canAt(pieces, id, p.r, k) : canAt(pieces, id, k, p.c));
  const start = axis === "h" ? p.c : p.r;
  const cap = SIZE; // klíč smí vyjet nejvýš celý ven
  let min = start;
  while (min - 1 >= -SIZE && at(min - 1)) min--;
  let max = start;
  while (max + 1 <= cap && at(max + 1)) max++;
  return { min, max };
}

export function movePiece(pieces: Piece[], id: string, axis: "h" | "v", k: number): Piece[] {
  return pieces.map((p) => (p.id !== id ? p : axis === "h" ? { ...p, c: k } : { ...p, r: k }));
}

/** Všechny osy, po kterých lze piece posouvat. */
export const axesOf = (p: Piece): ("h" | "v")[] => (p.axis === "both" ? ["h", "v"] : [p.axis]);

/** BFS: nejmenší počet tahů k vyřešení, nebo -1. Jen pro testy / ladění levelů. */
export function minMoves(start: Piece[], limit = 400_000): number {
  const key = (ps: Piece[]) => ps.map((p) => `${p.r},${p.c}`).join("|");
  const seen = new Set<string>([key(start)]);
  let frontier: Piece[][] = [start];
  for (let depth = 0; frontier.length; depth++) {
    const next: Piece[][] = [];
    for (const st of frontier) {
      if (isSolved(st)) return depth;
      for (const p of st) {
        for (const ax of axesOf(p)) {
          const { min, max } = axisRange(st, p.id, ax);
          const cur = ax === "h" ? p.c : p.r;
          for (let k = min; k <= max; k++) {
            if (k === cur) continue;
            const ns = movePiece(st, p.id, ax, k);
            const kk = key(ns);
            if (seen.has(kk)) continue;
            seen.add(kk);
            if (seen.size > limit) return -1;
            next.push(ns);
          }
        }
      }
    }
    frontier = next;
  }
  return -1;
}
