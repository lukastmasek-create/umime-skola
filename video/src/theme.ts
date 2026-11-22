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
export const DURATION = 650;

// Scény: [start, délka] ve snímcích.
export const S = {
  kurzy: [0, 180],
  materialy: [170, 150],
  code: [310, 150],
  scratch: [450, 130],
  outro: [570, 80],
} as const;
