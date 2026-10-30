// Které 3D postavy z profilu (public/avatars-3d) hrají v městečku. Bez three.js, ať to jde importovat kdekoli.

export const NPC_MODEL: Record<string, string> = {
  knihovnice: "chemik",
  pekar: "chef",
  kluk: "founder",
  farmar: "ranger",
  babicka: "fairy",
  kocka: "cat",
  ovce: "llama",
  slepice: "phoenix",
  pes: "fox",
};
/** Vzhled hrdiny 0..5 (src/lib/hero.ts) → 3D postava. */
export const HERO_MODELS = ["explorer", "astronaut", "pilot", "sailor", "knight", "ninja"];
export const portraitOf = (model: string) => `/avatars-3d/${model}-portret.webp`;
export const figureOf = (model: string) => `/avatars-3d/${model}-postava.webp`;
