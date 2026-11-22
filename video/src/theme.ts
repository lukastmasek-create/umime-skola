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
export const DURATION = 562;

// Scény: [start, délka] ve snímcích.
export const S = {
  intro: [0, 45],
  kurzy: [30, 125],
  materialy: [148, 114],
  code: [258, 114],
  scratch: [366, 100],
  outro: [452, 110],
} as const;
// Hlas začíná po 1 s loga a trvá 17,32 s.
export const VOICE_FROM = 30;
