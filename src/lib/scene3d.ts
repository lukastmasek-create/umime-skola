// Společný popis 3D scény pro hry. Herní logika zůstává v enginech (souřadnice 640 × 420),
// engine jen každý snímek řekne, co kde stojí, a GameView3D to vykreslí z modelů .glb (three.js).

export type Layout3D = "floor" | "wall";

export type Item3D = {
  // Stabilní klíč, aby se objekt mezi snímky znovu použil.
  key: string;
  // "kong/sud" = /game-models/kong/sud.glb, nebo primitiv: "box" | "sphere" | "cyl" | "cone".
  model: string;
  // Střed ve hře (px). floor: x vpravo, y dolů (do hloubky). wall: y dolů ve svislé rovině.
  x: number;
  y: number;
  // Výška nad podlahou (floor) nebo hloubka před zdí (wall), px.
  z?: number;
  // Rozměry v px: w = šířka (osa x), h = svislý rozměr, d = hloubka. Model se zvětšuje rovnoměrně podle w (nebo h).
  w?: number;
  h?: number;
  d?: number;
  // Otočení kolem svislé osy (rad). Model se dívá do +Z (dolů po obrazovce); viz facing().
  rot?: number;
  // Otočení kolem osy dívající se na kameru (valící se sud, točící se kolo).
  roll?: number;
  color?: string;
  opacity?: number;
  // Popisek odpovědi nad objektem.
  label?: string;
  labelColor?: string;
  labelW?: number;
  // Vznášení nahoru a dolů a otáčení (ozdoba).
  bob?: number;
  spin?: number;
  hidden?: boolean;
};

export type Scene3D = {
  layout: Layout3D;
  items: Item3D[];
  // Barva podlahy (floor) nebo zadní stěny (wall) a barva pozadí.
  ground: string;
  sky: string;
  // Volitelná úprava kamery: zvětšení (1 = celé hřiště) a náklon.
  zoom?: number;
};

// Otočení modelu, aby se díval ve směru pohybu (dx doprava, dy dolů po obrazovce).
export function facing(dx: number, dy: number): number {
  return Math.atan2(dx, dy);
}

export type View3D = {
  // Převede bod hry (x, y, výška) na pixel v plátně 640 × 420, nebo null, když je mimo záběr.
  project(x: number, y: number, z?: number): { x: number; y: number } | null;
};

// Režim her: výchozí je 3D, hráč si v nastavení může vrátit klasické 2D.
export type GameMode = "3d" | "2d";
const MODE_KEY = "gameMode";

export function getGameMode(): GameMode {
  try {
    return localStorage.getItem(MODE_KEY) === "2d" ? "2d" : "3d";
  } catch {
    return "3d";
  }
}

export function setGameMode(mode: GameMode) {
  try {
    if (mode === "3d") localStorage.removeItem(MODE_KEY);
    else localStorage.setItem(MODE_KEY, mode);
  } catch {
    // úložiště nemusí být dostupné
  }
}
