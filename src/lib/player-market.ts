import { getShopItem, type ShopItem } from "@/lib/shop";

// Trh mezi hráči: hráč vystaví věc z katalogu, kterou vlastní, za body; jiný hráč ji koupí.
// Vystavená věc se hráči odebere (je „ve výloze“), při zrušení se vrátí. Trh si bere poplatek.
// Nabídky jsou v IdleState pod hrou MARKET_GAME (jeden řádek na prodávajícího), bez změny schématu.
export const MARKET_GAME = "trh-nabidky";
export const MARKET_KINDS = ["avatar", "title", "frame", "banner"] as const;
export const MARKET_FEE = 0.1;
export const MAX_LISTINGS = 5;
export const MIN_PRICE = 10;
export const maxPrice = (item: ShopItem) => Math.max(MIN_PRICE, item.price * 2);
export const sellerGets = (price: number) => price - Math.ceil(price * MARKET_FEE);

export type Listing = { id: string; itemId: string; price: number; at: string };
export type MarketOffer = Listing & { sellerId: string; seller: string; mine: boolean };

export function tradable(itemId: string): ShopItem | null {
  const item = getShopItem(itemId);
  return item && (MARKET_KINDS as readonly string[]).includes(item.kind) ? item : null;
}

export function normalizeListings(raw: unknown): Listing[] {
  const list = (raw && typeof raw === "object" ? (raw as { listings?: unknown }).listings : null) ?? [];
  if (!Array.isArray(list)) return [];
  return list
    .filter((l): l is Listing => !!l && typeof l.id === "string" && typeof l.itemId === "string" && Number.isInteger(l.price) && typeof l.at === "string")
    .filter((l) => tradable(l.itemId))
    .slice(0, MAX_LISTINGS);
}
