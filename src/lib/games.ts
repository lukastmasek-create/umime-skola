export type GameSlug =
  | "space-invaders"
  | "pac-man"
  | "snake"
  | "breakout"
  | "tetris"
  | "kong"
  | "flappy"
  | "mole"
  | "ninja"
  | "osmismerka"
  | "spojovani"
  | "pexeso"
  | "sibenice"
  | "trideni"
  | "doplnovani"
  | "milionar"
  | "presmycky"
  | "blesk"
  | "poklad"
  | "oblekani"
  | "obrana"
  | "krizovka"
  | "pravda"
  | "piskvorky"
  | "bingo";

// Klasické hry bez enginu: hrají se na otázkách kurzu (src/components/classic).
export const CLASSIC_SLUGS = [
  "osmismerka",
  "spojovani",
  "pexeso",
  "sibenice",
  "trideni",
  "doplnovani",
  "milionar",
  "presmycky",
  "blesk",
  "poklad",
  "oblekani",
  "obrana",
  "krizovka",
  "pravda",
  "piskvorky",
  "bingo",
] as const;
export type ClassicSlug = (typeof CLASSIC_SLUGS)[number];

export function isClassicSlug(slug: string): slug is ClassicSlug {
  return (CLASSIC_SLUGS as readonly string[]).includes(slug);
}

// `kind`: akční hry běží na plátně (src/lib/*-engine.ts), klasické jsou kvízové (src/components/classic).
// `isNew`: na seznamu her dostane štítek „Nové“.
// `archived`: hra je schovaná (nenabízí se a adresa vrací 404), kód i obrázky zůstávají a jde ji vrátit smazáním příznaku.
export type GameInfo = { slug: GameSlug; emoji: string; name: string; kind: "action" | "classic"; available: boolean; isNew?: boolean; archived?: boolean };

export const GAMES: GameInfo[] = [
  { slug: "space-invaders", emoji: "🚀", name: "Obrana galaxie", kind: "action", available: true },
  { slug: "pac-man", emoji: "👻", name: "Labyrint duchů", kind: "action", available: true },
  { slug: "snake", emoji: "🐍", name: "Had z džungle", kind: "action", available: true },
  { slug: "breakout", emoji: "🧱", name: "Průlom hradeb", kind: "action", available: true },
  { slug: "tetris", emoji: "🟪", name: "Pád bloků", kind: "action", available: true },
  { slug: "kong", emoji: "🌋", name: "Výstup na sopku", kind: "action", available: true },
  { slug: "flappy", emoji: "🐤", name: "Let přes útesy", kind: "action", available: true },
  { slug: "mole", emoji: "🔨", name: "Lov krtků", kind: "action", available: true },
  { slug: "ninja", emoji: "🥷", name: "Stínový bojovník", kind: "action", available: true },
  { slug: "osmismerka", emoji: "🔤", name: "Osmisměrka", kind: "classic", available: true },
  { slug: "spojovani", emoji: "🔗", name: "Spojování", kind: "classic", available: true },
  { slug: "pexeso", emoji: "🃏", name: "Pexeso", kind: "classic", available: true },
  { slug: "sibenice", emoji: "🪢", name: "Šibenice", kind: "classic", available: true },
  { slug: "trideni", emoji: "🗂️", name: "Třídění", kind: "classic", available: true },
  { slug: "doplnovani", emoji: "✏️", name: "Doplňování", kind: "classic", available: true },
  { slug: "milionar", emoji: "⛰️", name: "Výstup na vrchol", kind: "classic", available: true },
  { slug: "presmycky", emoji: "🔀", name: "Přesmyčky", kind: "classic", available: true },
  { slug: "blesk", emoji: "⚡", name: "Bleskový kvíz", kind: "classic", available: true },
  { slug: "poklad", emoji: "🏴‍☠️", name: "Hon za pokladem", kind: "classic", available: true },
  { slug: "oblekani", emoji: "👗", name: "Obleč panenku", kind: "classic", available: true },
  { slug: "obrana", emoji: "🏰", name: "Obrana města", kind: "classic", available: true },
  { slug: "krizovka", emoji: "✍️", name: "Křížovka", kind: "classic", available: true, isNew: true },
  { slug: "pravda", emoji: "⚖️", name: "Pravda, nebo lež", kind: "classic", available: true, isNew: true },
  { slug: "piskvorky", emoji: "⭕", name: "Kvízové piškvorky", kind: "classic", available: true, isNew: true },
  { slug: "bingo", emoji: "🎱", name: "Bingo", kind: "classic", available: true, isNew: true },
];

// Hry, které se nabízejí hráčům (bez archivovaných).
export const ACTIVE_GAMES = GAMES.filter((g) => !g.archived);

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}

// Délka kola akční hry podle obtížnosti kurzu (1–5): lehčí kola jsou kratší, těžší delší.
const RUN_LENGTH = [6, 7, 8, 10, 12];
export function runLength(level: number): number {
  return RUN_LENGTH[Math.min(5, Math.max(1, Math.round(level))) - 1];
}
