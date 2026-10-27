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
