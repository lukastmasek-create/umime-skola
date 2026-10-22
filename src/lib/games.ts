export type GameSlug =
  | "space-invaders"
  | "super-mario"
  | "pac-man"
  | "snake"
  | "breakout"
  | "tetris"
  | "kong"
  | "stonozka";

export const GAMES: { slug: GameSlug; emoji: string; name: string; available: boolean }[] = [
  { slug: "space-invaders", emoji: "👾", name: "Space Invaders", available: true },
  { slug: "super-mario", emoji: "🍄", name: "Super Mario", available: true },
  { slug: "pac-man", emoji: "🟡", name: "Pac-Man", available: true },
  { slug: "snake", emoji: "🐍", name: "Snake", available: true },
  { slug: "breakout", emoji: "🧱", name: "Breakout", available: true },
  { slug: "tetris", emoji: "🧩", name: "Tetris", available: true },
  { slug: "kong", emoji: "🦍", name: "Kong", available: true },
  { slug: "stonozka", emoji: "🐛", name: "Centipede", available: true },
];

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}
