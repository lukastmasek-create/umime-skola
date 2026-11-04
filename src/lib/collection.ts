import type { Locale } from "@/i18n/config";

export type Rarity = "common" | "rare" | "epic";

export type CardDef = { id: string; icon: string; rarity: Rarity; names: Record<Locale, string> };

const c = (id: string, icon: string, rarity: Rarity, cs: string, en: string, de: string, ru: string): CardDef => ({
  id, icon, rarity, names: { cs, en, de, ru },
});

export const CARDS: CardDef[] = [
  c("book", "📚", "common", "Kniha", "Book", "Buch", "Книга"),
  c("pencil", "✏️", "common", "Tužka", "Pencil", "Bleistift", "Карандаш"),
  c("globe", "🌍", "common", "Globus", "Globe", "Globus", "Глобус"),
  c("atom", "⚛️", "common", "Atom", "Atom", "Atom", "Атом"),
  c("leaf", "🍃", "common", "List", "Leaf", "Blatt", "Лист"),
  c("abacus", "🧮", "common", "Počítadlo", "Abacus", "Abakus", "Счёты"),
  c("owl", "🦉", "common", "Sova", "Owl", "Eule", "Сова"),
  c("telescope", "🔭", "rare", "Dalekohled", "Telescope", "Teleskop", "Телескоп"),
  c("microscope", "🔬", "rare", "Mikroskop", "Microscope", "Mikroskop", "Микроскоп"),
  c("scroll", "📜", "rare", "Svitek", "Scroll", "Schriftrolle", "Свиток"),
  c("compass", "🧭", "rare", "Kompas", "Compass", "Kompass", "Компас"),
  c("rocket", "🚀", "rare", "Raketa", "Rocket", "Rakete", "Ракета"),
  c("trophy", "🏆", "epic", "Pohár", "Trophy", "Pokal", "Кубок"),
  c("crown", "👑", "epic", "Koruna", "Crown", "Krone", "Корона"),
  c("dragon", "🐉", "epic", "Drak", "Dragon", "Drache", "Дракон"),
  c("gem", "💎", "epic", "Drahokam", "Gem", "Edelstein", "Самоцвет"),
];

export const RARITY_ODDS: Record<Rarity, number> = { common: 0.7, rare: 0.25, epic: 0.05 };

export type CardsState = { owned: Record<string, number>; claimed: string[] };

// Jednorázové bonusy za počet různých karet ve sbírce. Záměrně malé: celá sbírka
// dá dohromady necelých 130 XP a 55 bodů, takže nepřebíjí denní výzvy ani série.
export type CollectionBonus = { id: string; uniqueAt: number; xp: number; points: number };

export const COLLECTION_BONUSES: CollectionBonus[] = [
  { id: "collection:4", uniqueAt: 4, xp: 10, points: 5 },
  { id: "collection:8", uniqueAt: 8, xp: 25, points: 10 },
  { id: "collection:12", uniqueAt: 12, xp: 40, points: 15 },
  { id: "collection:16", uniqueAt: 16, xp: 60, points: 25 },
];

export function uniqueCardCount(owned: Record<string, number>): number {
  return CARDS.filter((card) => (owned[card.id] ?? 0) > 0).length;
}

// Bonusy, na které už hráč dosáhl, ale ještě je nedostal. Stejné číslo se po druhém
// volání nevrátí, protože každý bonus se po vyplacení zapíše do `claimed`.
export function dueCollectionBonuses(state: CardsState): CollectionBonus[] {
  const unique = uniqueCardCount(state.owned);
  return COLLECTION_BONUSES.filter((b) => unique >= b.uniqueAt && !state.claimed.includes(b.id));
}

export function normalizeCards(raw: unknown): CardsState {
  const owned: Record<string, number> = {};
  const obj = raw && typeof raw === "object" ? (raw as { owned?: unknown; claimed?: unknown }) : null;
  const src = obj?.owned;
  if (src && typeof src === "object") {
    for (const card of CARDS) {
      const n = Math.floor(Number((src as Record<string, unknown>)[card.id]));
      if (Number.isFinite(n) && n > 0) owned[card.id] = Math.min(n, 999);
    }
  }
  const known = new Set(COLLECTION_BONUSES.map((b) => b.id));
  const claimed = Array.isArray(obj?.claimed)
    ? [...new Set(obj.claimed.filter((id): id is string => typeof id === "string" && known.has(id)))]
    : [];
  return { owned, claimed };
}

// Vylosuje kartu. `boost` posouvá šanci k vzácnějším (0 až 1), `rand` je kvůli testům vyměnitelné.
export function rollCard(boost = 0, rand: () => number = Math.random): CardDef {
  const r = rand();
  const epic = RARITY_ODDS.epic + boost * 0.15;
  const rare = RARITY_ODDS.rare + boost * 0.25;
  const rarity: Rarity = r < epic ? "epic" : r < epic + rare ? "rare" : "common";
  const pool = CARDS.filter((card) => card.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)];
}
