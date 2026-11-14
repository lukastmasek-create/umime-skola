import type { Level, Shape } from "./logic";

// Tvary (vždy od 0,0)
const DOM_H: Shape = [[0, 0], [0, 1]];
const DOM_V: Shape = [[0, 0], [1, 0]];
const TRI_H: Shape = [[0, 0], [0, 1], [0, 2]];
const TRI_V: Shape = [[0, 0], [1, 0], [2, 0]];
const SQUARE: Shape = [[0, 0], [0, 1], [1, 0], [1, 1]];
const L_TET: Shape = [[0, 0], [1, 0], [2, 0], [2, 1]];
const L_MIRROR: Shape = [[0, 1], [1, 1], [2, 1], [2, 0]];
const T_TET: Shape = [[0, 0], [0, 1], [0, 2], [1, 1]];
const S_TET: Shape = [[0, 1], [0, 2], [1, 0], [1, 1]];

// Klíč H (vodorovný) musí vyjet dírou vpravo v řádku 2, klíč V (svislý) dírou dole ve sloupci 3.
export const LEVELS: Level[] = [
  {
    name: "První dveře",
    pieces: [
      { id: "H", r: 2, c: 0, shape: DOM_H, axis: "h", key: "H" },
      { id: "V", r: 0, c: 3, shape: DOM_V, axis: "v", key: "V" },
      { id: "A", r: 0, c: 0, shape: SQUARE, axis: "both" },
      { id: "B", r: 3, c: 4, shape: TRI_V, axis: "v" },
      { id: "C", r: 4, c: 0, shape: TRI_H, axis: "h" },
    ],
  },
  {
    name: "Zatáčky",
    pieces: [
      { id: "H", r: 2, c: 1, shape: DOM_H, axis: "h", key: "H" },
      { id: "V", r: 1, c: 3, shape: DOM_V, axis: "v", key: "V" },
      { id: "A", r: 0, c: 0, shape: TRI_V, axis: "v" },
      { id: "B", r: 0, c: 3, shape: T_TET, axis: "h" },
      { id: "C", r: 4, c: 1, shape: S_TET, axis: "h" },
      { id: "D", r: 3, c: 5, shape: DOM_V, axis: "v" },
    ],
  },
  {
    name: "Těsně",
    pieces: [
      { id: "H", r: 2, c: 0, shape: DOM_H, axis: "h", key: "H" },
      { id: "V", r: 0, c: 3, shape: DOM_V, axis: "v", key: "V" },
      { id: "A", r: 0, c: 1, shape: SQUARE, axis: "both" },
      { id: "B", r: 3, c: 1, shape: L_MIRROR, axis: "v" },
      { id: "D", r: 4, c: 3, shape: T_TET, axis: "h" },
      { id: "E", r: 0, c: 4, shape: DOM_H, axis: "h" },
    ],
  },
];
