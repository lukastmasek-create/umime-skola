import type { WorldId } from "@/lib/market-worlds";

// Čistá logika katalogu trhu hráčů: do kterého světa věc patří a graf cen pro posuvník.
// Svět určuje téma věci (pirátská, vesmírná…); co do žádného světa nepatří, je „other“.
export type CatalogWorld = WorldId | "other";
export const CATALOG_WORLDS: CatalogWorld[] = ["pirate", "space", "forest", "castle", "sea", "other"];

const IDS: Record<Exclude<CatalogWorld, "other">, string[]> = {
  pirate: ["avatar-pirate", "avatar-captain", "avatar-sea-wolf", "avatar-piratka", "title-treasure-hunter", "title-golden-hook", "title-sea-wolf", "title-treasure-keeper", "title-captain", "title-navigator", "title-adventurer", "frame-pirate", "banner-treasure-map", "banner-pirate-night", "banner-storm", "banner-town-pirate"],
  space: ["avatar-astronaut", "avatar-kosmonautka", "avatar-robopes", "title-star-sailor", "title-rocket-scientist", "title-planet-explorer", "frame-space", "frame-stars", "banner-town-space", "banner-galaxy", "banner-aurora"],
  forest: ["avatar-ranger", "avatar-fairy", "avatar-skritek", "avatar-veverka", "title-mushroom-wizard", "title-forest-guardian", "title-fairy-friend", "title-firefly", "frame-leaf", "frame-vine", "banner-forest", "banner-forest-glade", "banner-town-forest"],
  castle: ["avatar-knight", "avatar-princess", "avatar-princ", "avatar-wizard", "avatar-carodejnice", "title-dragon-tamer", "title-royal-architect", "title-knight", "title-court-scholar", "title-castle-lord", "frame-royal", "frame-dragon", "banner-castle-day", "banner-castle-night", "banner-town-castle"],
  sea: ["avatar-mermaid", "avatar-diver", "avatar-octopus", "avatar-zralok", "title-coral-keeper", "title-sea-sage", "title-pearl-hunter", "title-deep-diver", "frame-coral", "banner-ocean", "banner-deep-sea", "banner-jellyfish", "banner-town-sea"],
};

const WORLD_OF = new Map<string, CatalogWorld>();
for (const [world, ids] of Object.entries(IDS)) for (const id of ids) WORLD_OF.set(id, world as CatalogWorld);

export function itemWorld(itemId: string): CatalogWorld {
  return WORLD_OF.get(itemId) ?? "other";
}

// Graf cen: `bins` stejně širokých sloupců od min do max, hodnota = počet cen v sloupci.
export function priceHistogram(prices: number[], min: number, max: number, bins = 24): number[] {
  const out = new Array<number>(bins).fill(0);
  const span = Math.max(1, max - min);
  for (const p of prices) {
    const i = Math.min(bins - 1, Math.max(0, Math.floor(((p - min) / span) * bins)));
    out[i] += 1;
  }
  return out;
}

export function averagePrice(prices: number[]): number {
  return prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
}
