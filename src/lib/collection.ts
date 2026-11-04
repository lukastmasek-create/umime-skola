import { tr8 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export type Rarity = "common" | "rare" | "epic";

export type CardDef = { id: string; icon: string; rarity: Rarity; names: Record<Locale, string> };

const c = (
  id: string,
  icon: string,
  rarity: Rarity,
  cs: string,
  en: string,
  de: string,
  ru: string,
  uk?: string,
  ja?: string,
  es?: string,
  fr?: string,
): CardDef => ({
  id, icon, rarity, names: tr8(cs, en, de, ru, uk, ja, es, fr),
});

export const CARDS: CardDef[] = [
  c("book", "📚", "common", "Kniha", "Book", "Buch", "Книга", "Книга", "本", "Libro", "Livre"),
  c("pencil", "✏️", "common", "Tužka", "Pencil", "Bleistift", "Карандаш", "Олівець", "えんぴつ", "Lápiz", "Crayon"),
  c("globe", "🌍", "common", "Globus", "Globe", "Globus", "Глобус", "Глобус", "地球儀", "Globo terráqueo", "Globe"),
  c("atom", "⚛️", "common", "Atom", "Atom", "Atom", "Атом", "Атом", "原子", "Átomo", "Atome"),
  c("leaf", "🍃", "common", "List", "Leaf", "Blatt", "Лист", "Листок", "葉っぱ", "Hoja", "Feuille"),
  c("abacus", "🧮", "common", "Počítadlo", "Abacus", "Abakus", "Счёты", "Рахівниця", "そろばん", "Ábaco", "Boulier"),
  c("owl", "🦉", "common", "Sova", "Owl", "Eule", "Сова", "Сова", "ふくろう", "Búho", "Hibou"),
  c("telescope", "🔭", "rare", "Dalekohled", "Telescope", "Teleskop", "Телескоп", "Телескоп", "望遠鏡", "Telescopio", "Télescope"),
  c("microscope", "🔬", "rare", "Mikroskop", "Microscope", "Mikroskop", "Микроскоп", "Мікроскоп", "顕微鏡", "Microscopio", "Microscope"),
  c("scroll", "📜", "rare", "Svitek", "Scroll", "Schriftrolle", "Свиток", "Сувій", "巻物", "Pergamino", "Parchemin"),
  c("compass", "🧭", "rare", "Kompas", "Compass", "Kompass", "Компас", "Компас", "コンパス", "Brújula", "Boussole"),
  c("rocket", "🚀", "rare", "Raketa", "Rocket", "Rakete", "Ракета", "Ракета", "ロケット", "Cohete", "Fusée"),
  c("trophy", "🏆", "epic", "Pohár", "Trophy", "Pokal", "Кубок", "Кубок", "トロフィー", "Trofeo", "Trophée"),
  c("crown", "👑", "epic", "Koruna", "Crown", "Krone", "Корона", "Корона", "王冠", "Corona", "Couronne"),
  c("dragon", "🐉", "epic", "Drak", "Dragon", "Drache", "Дракон", "Дракон", "ドラゴン", "Dragón", "Dragon"),
  c("gem", "💎", "epic", "Drahokam", "Gem", "Edelstein", "Самоцвет", "Самоцвіт", "宝石", "Gema", "Gemme"),
];

export const RARITY_ODDS: Record<Rarity, number> = { common: 0.7, rare: 0.25, epic: 0.05 };

export type CardsState = { owned: Record<string, number>; claimed: string[] };

// Procentní bonus k XP z aktivit: 1 % za každou různou kartu, nejvýš 16 % (celá sbírka).
export const COLLECTION_XP_PERCENT_PER_CARD = 1;

// Jednorázové bonusy za počet různých karet, jen body (XP je procentní, viz výše).
export type CollectionBonus = { id: string; uniqueAt: number; points: number };

export const COLLECTION_BONUSES: CollectionBonus[] = [
  { id: "collection:4", uniqueAt: 4, points: 5 },
  { id: "collection:8", uniqueAt: 8, points: 10 },
  { id: "collection:12", uniqueAt: 12, points: 15 },
  { id: "collection:16", uniqueAt: 16, points: 25 },
];

export function uniqueCardCount(owned: Record<string, number>): number {
  return CARDS.filter((card) => (owned[card.id] ?? 0) > 0).length;
}

// Bonusy, na které už hráč dosáhl, ale ještě je nedostal. Stejné číslo se po druhém
// volání nevrátí, protože každý bonus se po vyplacení zapíše do `claimed`.
export function collectionXpPercent(owned: Record<string, number>): number {
  return uniqueCardCount(owned) * COLLECTION_XP_PERCENT_PER_CARD;
}

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
