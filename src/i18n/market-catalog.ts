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

const uk: MarketCatalogText = {
  search: "Шукати річ або продавця",
  priceRange: "Діапазон цін",
  priceAvg: "Середня ціна: {n}",
  reset: "Скинути",
  tag: "Мітка",
  tags: { all: "Усі", new: "Новинки", popular: "Популярне" },
  world: "Світ",
  worlds: { pirate: "Піратський", space: "Космічний", forest: "Лісовий", castle: "Замковий", sea: "Підводний", other: "Інше" },
  ownership: "Наявність",
  own: { all: "Усі", missing: "Немає в мене", have: "Є в мене" },
  topItem: "Топ",
  favorites: "Обране",
  favAdd: "Додати до обраного",
  favRemove: "Прибрати з обраного",
  bundles: "Набори",
  bundlesHint: "Набори з магазину, на чверть дешевші. Те, що вже є, не враховується.",
  bundleSave: "Економія {n}",
  bundleBuy: "Купити набір",
  bundleOwned: "Усе вже є",
  bundleDone: "Набір твій!",
  results: "Знайдено: {n}",
  noResults: "Нічого не знайдено. Змін пошук або фільтри.",
  filters: "Фільтри",
  wants: "Хоче: {name}",
};
const ja: MarketCatalogText = {
  search: "アイテムや出品者を検索",
  priceRange: "価格帯",
  priceAvg: "平均価格は {n}",
  reset: "リセット",
  tag: "タグ",
  tags: { all: "すべて", new: "新着", popular: "人気" },
  world: "ワールド",
  worlds: { pirate: "海賊", space: "宇宙", forest: "森", castle: "城", sea: "海中", other: "その他" },
  ownership: "所持状況",
  own: { all: "すべて", missing: "持っていない", have: "持っている" },
  topItem: "人気No.1",
  favorites: "お気に入り",
  favAdd: "お気に入りに追加",
  favRemove: "お気に入りから削除",
  bundles: "セット",
  bundlesHint: "ショップのセットが4分の1お得です。すでに持っているものは含まれません。",
  bundleSave: "{n} お得",
  bundleBuy: "セットを購入",
  bundleOwned: "すべて所持済み",
  bundleDone: "セットを手に入れました！",
  results: "見つかった件数: {n}",
  noResults: "見つかりませんでした。検索語やフィルターを変えてみてください。",
  filters: "フィルター",
  wants: "欲しい: {name}",
};
const es: MarketCatalogText = {
  search: "Buscar artículo o vendedor",
  priceRange: "Rango de precios",
  priceAvg: "El precio medio es {n}",
  reset: "Restablecer",
  tag: "Etiqueta",
  tags: { all: "Todo", new: "Novedades", popular: "Populares" },
  world: "Mundo",
  worlds: { pirate: "Pirata", space: "Espacial", forest: "Bosque", castle: "Castillo", sea: "Submarino", other: "Otros" },
  ownership: "Posesión",
  own: { all: "Todo", missing: "No lo tengo", have: "Lo tengo" },
  topItem: "Top artículo",
  favorites: "Favoritos",
  favAdd: "Añadir a favoritos",
  favRemove: "Quitar de favoritos",
  bundles: "Paquetes",
  bundlesHint: "Conjuntos de la tienda, un cuarto más baratos. Lo que ya tienes no cuenta.",
  bundleSave: "Ahorras {n}",
  bundleBuy: "Comprar conjunto",
  bundleOwned: "Lo tienes todo",
  bundleDone: "¡El conjunto es tuyo!",
  results: "Encontrados: {n}",
  noResults: "No hemos encontrado nada. Prueba a cambiar la búsqueda o los filtros.",
  filters: "Filtros",
  wants: "Busca: {name}",
};
const fr: MarketCatalogText = {
  search: "Chercher un objet ou un vendeur",
  priceRange: "Fourchette de prix",
  priceAvg: "Le prix moyen est de {n}",
  reset: "Réinitialiser",
  tag: "Étiquette",
  tags: { all: "Tout", new: "Nouveautés", popular: "Populaires" },
  world: "Monde",
  worlds: { pirate: "Pirates", space: "Espace", forest: "Forêt", castle: "Château", sea: "Sous-marin", other: "Autres" },
  ownership: "Possession",
  own: { all: "Tout", missing: "Je ne l'ai pas", have: "Je l'ai" },
  topItem: "Top objet",
  favorites: "Favoris",
  favAdd: "Ajouter aux favoris",
  favRemove: "Retirer des favoris",
  bundles: "Lots",
  bundlesHint: "Ensembles de la boutique, un quart moins cher. Ce que tu possèdes déjà n'est pas compté.",
  bundleSave: "Tu économises {n}",
  bundleBuy: "Acheter l'ensemble",
  bundleOwned: "Tu as tout",
  bundleDone: "L'ensemble est à toi !",
  results: "Trouvés : {n}",
  noResults: "Rien trouvé. Essaie de modifier ta recherche ou tes filtres.",
  filters: "Filtres",
  wants: "Recherché : {name}",
};

const texts: Record<Locale, MarketCatalogText> = { cs, en, de, ru, uk, ja, es, fr };
export const getMarketCatalogText = (locale: Locale) => texts[locale];
