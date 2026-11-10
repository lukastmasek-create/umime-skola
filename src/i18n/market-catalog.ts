import { withFallbacks } from "./config";
import type { Locale } from "./config";

// Texty katalogu trhu hráčů (filtry, štítky, balíčky). Ostatní texty jsou v player-market.ts.
export type MarketCatalogText = {
  search: string;
  priceRange: string;
  priceAvg: string; // {n}
  reset: string;
  tag: string;
  tags: { all: string; new: string; popular: string };
  world: string;
  worlds: { pirate: string; space: string; forest: string; castle: string; sea: string; other: string };
  ownership: string;
  own: { all: string; missing: string; have: string };
  topItem: string;
  favorites: string;
  favAdd: string;
  favRemove: string;
  bundles: string;
  bundlesHint: string;
  bundleSave: string; // {n}
  bundleBuy: string;
  bundleOwned: string;
  bundleDone: string;
  results: string; // {n}
  noResults: string;
  filters: string;
  wants: string; // {name}
};

const cs: MarketCatalogText = {
  search: "Hledat věc nebo prodejce",
  priceRange: "Cenové rozpětí",
  priceAvg: "Průměrná cena je {n}",
  reset: "Zrušit",
  tag: "Štítek",
  tags: { all: "Vše", new: "Novinky", popular: "Oblíbené" },
  world: "Svět",
  worlds: { pirate: "Pirátský", space: "Vesmírný", forest: "Lesní", castle: "Hradní", sea: "Podmořský", other: "Ostatní" },
  ownership: "Vlastnictví",
  own: { all: "Vše", missing: "Nemám", have: "Mám" },
  topItem: "Top věc",
  favorites: "Oblíbené",
  favAdd: "Přidat do oblíbených",
  favRemove: "Odebrat z oblíbených",
  bundles: "Balíčky",
  bundlesHint: "Sady od obchodu o čtvrtinu levněji. Co už máš, se nepočítá.",
  bundleSave: "Ušetříš {n}",
  bundleBuy: "Koupit sadu",
  bundleOwned: "Máš celou",
  bundleDone: "Sada je tvoje!",
  results: "Nalezeno: {n}",
  noResults: "Nic jsme nenašli. Zkus upravit hledání nebo filtry.",
  filters: "Filtry",
  wants: "Chce: {name}",
};
const en: MarketCatalogText = {
  search: "Search items or sellers",
  priceRange: "Price range",
  priceAvg: "The average price is {n}",
  reset: "Reset",
  tag: "Tag",
  tags: { all: "All", new: "New", popular: "Popular" },
  world: "World",
  worlds: { pirate: "Pirate", space: "Space", forest: "Forest", castle: "Castle", sea: "Undersea", other: "Other" },
  ownership: "Ownership",
  own: { all: "All", missing: "Don't have", have: "Have" },
  topItem: "Top item",
  favorites: "Favourites",
  favAdd: "Add to favourites",
  favRemove: "Remove from favourites",
  bundles: "Bundles",
  bundlesHint: "Sets from the shop, a quarter cheaper. What you already own isn't counted.",
  bundleSave: "You save {n}",
  bundleBuy: "Buy set",
  bundleOwned: "You own it all",
  bundleDone: "The set is yours!",
  results: "Found: {n}",
  noResults: "Nothing found. Try changing your search or filters.",
  filters: "Filters",
  wants: "Wants: {name}",
};
const de: MarketCatalogText = {
  search: "Gegenstand oder Verkäufer suchen",
  priceRange: "Preisspanne",
  priceAvg: "Der Durchschnittspreis ist {n}",
  reset: "Zurücksetzen",
  tag: "Label",
  tags: { all: "Alle", new: "Neu", popular: "Beliebt" },
  world: "Welt",
  worlds: { pirate: "Piraten", space: "Weltraum", forest: "Wald", castle: "Burg", sea: "Unterwasser", other: "Sonstige" },
  ownership: "Besitz",
  own: { all: "Alle", missing: "Fehlt mir", have: "Habe ich" },
  topItem: "Top-Artikel",
  favorites: "Favoriten",
  favAdd: "Zu Favoriten hinzufügen",
  favRemove: "Aus Favoriten entfernen",
  bundles: "Pakete",
  bundlesHint: "Sets vom Shop, ein Viertel günstiger. Was du schon hast, zählt nicht.",
  bundleSave: "Du sparst {n}",
  bundleBuy: "Set kaufen",
  bundleOwned: "Alles vorhanden",
  bundleDone: "Das Set gehört dir!",
  results: "Gefunden: {n}",
  noResults: "Nichts gefunden. Ändere Suche oder Filter.",
  filters: "Filter",
  wants: "Möchte: {name}",
};
const ru: MarketCatalogText = {
  search: "Искать вещь или продавца",
  priceRange: "Диапазон цен",
  priceAvg: "Средняя цена: {n}",
  reset: "Сбросить",
  tag: "Метка",
  tags: { all: "Все", new: "Новинки", popular: "Популярное" },
  world: "Мир",
  worlds: { pirate: "Пиратский", space: "Космический", forest: "Лесной", castle: "Замковый", sea: "Подводный", other: "Другое" },
  ownership: "Наличие",
  own: { all: "Все", missing: "Нет у меня", have: "Есть у меня" },
  topItem: "Топ",
  favorites: "Избранное",
  favAdd: "В избранное",
  favRemove: "Убрать из избранного",
  bundles: "Наборы",
  bundlesHint: "Наборы от магазина на четверть дешевле. Что уже есть, не считается.",
  bundleSave: "Экономия {n}",
  bundleBuy: "Купить набор",
  bundleOwned: "Всё уже есть",
  bundleDone: "Набор твой!",
  results: "Найдено: {n}",
  noResults: "Ничего не найдено. Измени поиск или фильтры.",
  filters: "Фильтры",
  wants: "Хочет: {name}",
};

const texts = withFallbacks({ cs, en, de, ru });
export const getMarketCatalogText = (locale: Locale) => texts[locale];
