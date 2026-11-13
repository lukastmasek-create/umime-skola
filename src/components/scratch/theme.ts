import type { Category } from "@/lib/scratch/engine";

// Sdílené barvy a tvary pro editor i stránku Lekce.
export const CAT_COLOR: Record<Category, string> = {
  events: "#ffc933",
  motion: "#8fd0ff",
  pen: "#7ee0b0",
  control: "#ff8a6b",
  looks: "#c9a8ff",
  custom: "#ffb3d9",
};

export const INK = "#16132b";

// Ručně nakreslený obrys: každý roh má trochu jiný poloměr, takže to nevypadá jako strojový rámeček.
export const SKETCH_RADIUS = "14px 18px 12px 16px / 16px 12px 18px 14px";
