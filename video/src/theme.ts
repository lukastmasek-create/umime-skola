// Barvy převzaté z src/app/globals.css (tmavý motiv).
export const C = {
  bg: "#12102a",
  ink: "#16132b",
  paper: "#f6f1e4",
  brand: "#3248f0",
  brandLight: "#cdd6ff",
  coral: "#ff5a3c",
  yellow: "#ffc933",
  green: "#17a864",
  blue: "#29a3ff",
} as const;

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION = 725;

// Scény: [start, délka] ve snímcích.
export const S = {
  intro: [0, 85],
  kurzy: [75, 180],
  materialy: [245, 150],
  code: [385, 150],
  scratch: [525, 130],
  outro: [645, 80],
} as const;
