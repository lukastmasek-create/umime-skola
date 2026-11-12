import type { GameSlug } from "@/lib/games";

// SVG nálepky z public/ikony (stejný styl jako na homepage) pro hry nad vlastní sadou a pro sady.
export const GAME_ICON: Partial<Record<GameSlug, string>> = {
  osmismerka: "osmismerka",
  spojovani: "spojovani",
  pexeso: "pexeso",
  sibenice: "sibenice",
  trideni: "trideni",
  doplnovani: "doplnovani",
  milionar: "milionar",
  presmycky: "presmycky",
  blesk: "blesk",
  poklad: "balicek-truhla",
  oblekani: "vytvarka",
  obrana: "town_hall",
  krizovka: "krizovka",
  pravda: "pravda",
  piskvorky: "piskvorky",
  bingo: "bingo",
  razeni: "razeni",
};

// Ikona samotné sady.
export const SET_ICON = "sada";

// Barevné přechody karet z lobby na homepage (plné názvy tříd, ať je Tailwind najde).
export const TILE_GRADS = [
  "from-[#2fae6d] to-[#0c3b2c]",
  "from-[#3b5bff] to-[#0e1a5c]",
  "from-[#e0584a] to-[#5a1f2b]",
  "from-[#7b3dff] to-[#1a0d4d]",
  "from-[#1ec5ff] to-[#0a2b4d]",
  "from-[#ffc933] to-[#7a4a0a]",
] as const;
