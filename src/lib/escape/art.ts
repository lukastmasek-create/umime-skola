// Vyrenderovaná grafika únikových místností (umime-art/scripts/escape_rooms.py a escape_publish.py).
// Všechny místnosti z kostry `rooms/kit.ts` sdílejí stejné rozložení, takže mají i stejné výřezy stavů.
// Souřadnice jsou v jednotkách SVG 800 × 450 a odpovídají REGIONS v escape_publish.py.
export const ART_ROOMS = ["museum", "expedition", "jungle", "pirate", "kitchen", "library", "observatory", "castle"];

export type ArtPatch = { file: string; x: number; y: number; w: number; h: number };

export const ART_PATCHES: Record<"b_open" | "d_used" | "e_on" | "door_open", ArtPatch> = {
  b_open: { file: "b_open.webp", x: 268, y: 88, w: 194, h: 224 },
  d_used: { file: "d_used.webp", x: 462, y: 10, w: 148, h: 100 },
  e_on: { file: "e_on.webp", x: 470, y: 228, w: 130, h: 132 },
  door_open: { file: "door_open.webp", x: 626, y: 98, w: 148, h: 298 },
};

// Druhé místnosti (rooms/inner.ts) mají vlastní kostru, takže i jiné klikací místa a jiné výřezy stavů.
// Renderuje je umime-art/scripts/escape_inner.py, výřezy dělá escape_inner_publish.py.
export const INNER_ART_ROOMS = [
  "lab-2",
  "museum-2",
  "expedition-2",
  "jungle-2",
  "pirate-2",
  "kitchen-2",
  "library-2",
  "observatory-2",
  "castle-2",
];

export const INNER_ART_PATCHES: Record<"b_open" | "d_used" | "door_open", ArtPatch> = {
  b_open: { file: "b_open.webp", x: 262, y: 140, w: 168, h: 178 },
  d_used: { file: "d_used.webp", x: 450, y: 40, w: 156, h: 142 },
  door_open: { file: "door_open.webp", x: 626, y: 98, w: 148, h: 298 },
};

// Místnosti, které mají vyrenderované předměty do inventáře (public/escape/<id>/items/).
export const ART_ITEM_ROOMS = ["lab", ...ART_ROOMS, ...INNER_ART_ROOMS];
