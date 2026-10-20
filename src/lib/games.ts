export type GameSlug = "space-invaders" | "super-mario" | "pac-man";

export const GAMES: { slug: GameSlug; emoji: string; name: string; available: boolean }[] = [
  { slug: "space-invaders", emoji: "👾", name: "Space Invaders", available: true },
  { slug: "super-mario", emoji: "🍄", name: "Super Mario", available: true },
  { slug: "pac-man", emoji: "🟡", name: "Pac-Man", available: false },
];

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}
