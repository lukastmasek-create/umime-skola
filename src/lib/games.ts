export type GameSlug =
  | "space-invaders"
  | "super-mario"
  | "pac-man"
  | "snake"
  | "breakout"
  | "tetris"
  | "kong"
  | "stonozka"
  | "flappy"
  | "mole"
  | "ninja"
  | "osmismerka"
  | "spojovani"
  | "pexeso"
  | "sibenice";

// Klasické hry bez enginu: hrají se na otázkách kurzu (src/components/classic).
export const CLASSIC_SLUGS = ["osmismerka", "spojovani", "pexeso", "sibenice"] as const;
export type ClassicSlug = (typeof CLASSIC_SLUGS)[number];

export function isClassicSlug(slug: string): slug is ClassicSlug {
  return (CLASSIC_SLUGS as readonly string[]).includes(slug);
}

// `archived`: hra je schovaná (nenabízí se a adresa vrací 404), kód i obrázky zůstávají a jde ji vrátit smazáním příznaku.
export const GAMES: { slug: GameSlug; emoji: string; name: string; available: boolean; archived?: boolean }[] = [
  { slug: "space-invaders", emoji: "👾", name: "Space Invaders", available: true },
  { slug: "super-mario", emoji: "🍄", name: "Super Mario", available: true, archived: true },
  { slug: "pac-man", emoji: "🟡", name: "Pac-Man", available: true },
  { slug: "snake", emoji: "🐍", name: "Snake", available: true },
  { slug: "breakout", emoji: "🧱", name: "Breakout", available: true },
  { slug: "tetris", emoji: "🧩", name: "Tetris", available: true },
  { slug: "kong", emoji: "🦍", name: "Kong", available: true },
  { slug: "stonozka", emoji: "🐛", name: "Centipede", available: true, archived: true },
  { slug: "flappy", emoji: "🐤", name: "Flappy", available: true },
  { slug: "mole", emoji: "🔨", name: "Whack-a-mole", available: true },
  { slug: "ninja", emoji: "🥷", name: "Ninja", available: true },
  { slug: "osmismerka", emoji: "🔤", name: "Osmisměrka", available: true },
  { slug: "spojovani", emoji: "🔗", name: "Spojování", available: true },
  { slug: "pexeso", emoji: "🃏", name: "Pexeso", available: true },
  { slug: "sibenice", emoji: "🪢", name: "Šibenice", available: true },
];

// Hry, které se nabízejí hráčům (bez archivovaných).
export const ACTIVE_GAMES = GAMES.filter((g) => !g.archived);

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}
