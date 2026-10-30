// Katalog uživatelského obchodu. Nabídku sestavujeme my, vývojáři: nové zboží stačí
// dopsat sem. Kupuje se za body z učení a koupená věc se uloží jako odemčení
// (tabulka Unlock) s klíčem "<druh>:<ref>", stejně jako avatary a tituly z úspěchů.
//
// `asset3d` je název modelu, který má dodat 3D tým (viz SHOP_ASSETS.md). Dokud model
// není, hra kreslí náhradní vzhled kódem.

import type { Locale } from "@/i18n/config";

export type ShopKind = "avatar" | "title" | "frame" | "banner" | "pet" | "city";

export const SHOP_KINDS: ShopKind[] = ["avatar", "title", "frame", "banner", "pet", "city"];

export type ShopItem = {
  id: string;
  kind: ShopKind;
  // Id věci v příslušné hře nebo profilu (avatar, titul, rámeček, doplněk, budova).
  ref: string;
  price: number;
  names: Record<Locale, string>;
  tag?: "new" | "popular";
  asset3d?: string;
};

const n = (cs: string, en: string, de: string, ru: string): Record<Locale, string> => ({ cs, en, de, ru });

export const SHOP_ITEMS: ShopItem[] = [
  // --- avatary ---
  { id: "avatar-astronaut", kind: "avatar", ref: "astronaut", price: 120, tag: "new", asset3d: "avatar-astronaut", names: n("Astronaut", "Astronaut", "Astronaut", "Астронавт") },
  { id: "avatar-pirate", kind: "avatar", ref: "pirate", price: 150, asset3d: "avatar-pirate", names: n("Pirát", "Pirate", "Pirat", "Пират") },
  { id: "avatar-captain", kind: "avatar", ref: "captain", price: 220, tag: "new", names: n("Kapitán", "Captain", "Kapitän", "Капитан") },
  { id: "avatar-sea-wolf", kind: "avatar", ref: "sea-wolf", price: 180, tag: "new", names: n("Mořský vlk", "Sea wolf", "Seebär", "Морской волк") },
  { id: "avatar-mermaid", kind: "avatar", ref: "mermaid", price: 200, tag: "new", names: n("Mořská panna", "Mermaid", "Meerjungfrau", "Русалка") },
  { id: "avatar-fairy", kind: "avatar", ref: "fairy", price: 200, tag: "new", names: n("Víla", "Fairy", "Fee", "Фея") },
  { id: "avatar-ranger", kind: "avatar", ref: "ranger", price: 170, tag: "new", names: n("Hajný", "Ranger", "Förster", "Лесник") },
  { id: "avatar-knight", kind: "avatar", ref: "knight", price: 230, tag: "new", names: n("Rytíř", "Knight", "Ritter", "Рыцарь") },
  { id: "avatar-princess", kind: "avatar", ref: "princess", price: 240, tag: "new", names: n("Princezna", "Princess", "Prinzessin", "Принцесса") },
  { id: "avatar-diver", kind: "avatar", ref: "diver", price: 190, tag: "new", names: n("Potápěč", "Diver", "Taucher", "Водолаз") },
  { id: "avatar-octopus", kind: "avatar", ref: "octopus", price: 220, tag: "new", names: n("Chobotnice", "Octopus", "Krake", "Осьминог") },
  { id: "avatar-wizard", kind: "avatar", ref: "wizard", price: 200, tag: "popular", asset3d: "avatar-wizard", names: n("Čaroděj", "Wizard", "Zauberer", "Волшебник") },
  { id: "avatar-pumpkin", kind: "avatar", ref: "pumpkin", price: 90, asset3d: "avatar-pumpkin", names: n("Dýně", "Pumpkin", "Kürbis", "Тыква") },
  { id: "avatar-winter", kind: "avatar", ref: "winter", price: 110, names: n("Zimní", "Winter", "Winter", "Зимний") },

  // --- tituly ---
  { id: "title-scholar", kind: "title", ref: "scholar", price: 80, names: n("Učenec", "Scholar", "Gelehrter", "Учёный") },
  { id: "title-bookworm", kind: "title", ref: "bookworm", price: 80, names: n("Knihomol", "Bookworm", "Bücherwurm", "Книголюб") },
  { id: "title-mathematician", kind: "title", ref: "mathematician", price: 100, names: n("Matematik", "Mathematician", "Mathematiker", "Математик") },
  { id: "title-builder", kind: "title", ref: "builder", price: 120, names: n("Stavitel", "Builder", "Baumeister", "Строитель") },
  { id: "title-forest-guardian", kind: "title", ref: "forest-guardian", price: 120, tag: "new", names: n("Strážce lesa", "Forest guardian", "Waldwächter", "Страж леса") },
  { id: "title-fairy-friend", kind: "title", ref: "fairy-friend", price: 100, tag: "new", names: n("Přítel víl", "Fairy friend", "Feenfreund", "Друг фей") },
  { id: "title-firefly", kind: "title", ref: "firefly", price: 90, tag: "new", names: n("Světluška", "Firefly", "Glühwürmchen", "Светлячок") },
  { id: "title-knight", kind: "title", ref: "knight", price: 130, tag: "new", names: n("Rytíř", "Knight", "Ritter", "Рыцарь") },
  { id: "title-court-scholar", kind: "title", ref: "court-scholar", price: 140, tag: "new", names: n("Dvorní učenec", "Court scholar", "Hofgelehrter", "Придворный учёный") },
  { id: "title-castle-lord", kind: "title", ref: "castle-lord", price: 200, tag: "new", names: n("Pán hradu", "Lord of the castle", "Burgherr", "Владыка замка") },
  { id: "title-sea-sage", kind: "title", ref: "sea-sage", price: 130, tag: "new", names: n("Mořský mudrc", "Sea sage", "Meeresweiser", "Морской мудрец") },
  { id: "title-pearl-hunter", kind: "title", ref: "pearl-hunter", price: 110, tag: "new", names: n("Lovec perel", "Pearl hunter", "Perlenjäger", "Ловец жемчуга") },
  { id: "title-deep-diver", kind: "title", ref: "deep-diver", price: 160, tag: "new", names: n("Hlubinný potápěč", "Deep diver", "Tiefseetaucher", "Глубоководный водолаз") },
  { id: "title-pet-friend", kind: "title", ref: "pet-friend", price: 100, names: n("Přítel zvířat", "Animal friend", "Tierfreund", "Друг животных") },
  { id: "title-legend", kind: "title", ref: "legend", price: 400, tag: "popular", names: n("Legenda", "Legend", "Legende", "Легенда") },
  { id: "title-dreamer", kind: "title", ref: "dreamer", price: 90, tag: "new", names: n("Snílek", "Dreamer", "Träumer", "Мечтатель") },
  { id: "title-adventurer", kind: "title", ref: "adventurer", price: 140, tag: "new", names: n("Dobrodruh", "Adventurer", "Abenteurer", "Авантюрист") },
  { id: "title-navigator", kind: "title", ref: "navigator", price: 140, tag: "new", names: n("Navigátor", "Navigator", "Navigator", "Штурман") },
  { id: "title-captain", kind: "title", ref: "captain", price: 160, tag: "new", names: n("Kapitán", "Captain", "Kapitän", "Капитан") },
  { id: "title-golden-hook", kind: "title", ref: "golden-hook", price: 180, tag: "new", names: n("Zlatá ruka", "Golden hook", "Goldhaken", "Золотой крюк") },
  { id: "title-sea-wolf", kind: "title", ref: "sea-wolf", price: 200, tag: "new", names: n("Mořský vlk", "Sea wolf", "Seebär", "Морской волк") },
  { id: "title-treasure-keeper", kind: "title", ref: "treasure-keeper", price: 220, tag: "new", names: n("Strážce pokladu", "Treasure keeper", "Schatzhüter", "Хранитель сокровищ") },
  { id: "title-hero", kind: "title", ref: "hero", price: 300, tag: "new", names: n("Hrdina", "Hero", "Held", "Герой") },

  // --- rámečky avataru ---
  { id: "frame-leaf", kind: "frame", ref: "leaf", price: 100, names: n("Listový rámeček", "Leaf frame", "Blätterrahmen", "Рамка из листьев") },
  { id: "frame-gold", kind: "frame", ref: "gold", price: 150, names: n("Zlatý rámeček", "Gold frame", "Goldrahmen", "Золотая рамка") },
  { id: "frame-neon", kind: "frame", ref: "neon", price: 200, tag: "new", names: n("Neonový rámeček", "Neon frame", "Neonrahmen", "Неоновая рамка") },
  { id: "frame-rainbow", kind: "frame", ref: "rainbow", price: 250, names: n("Duhový rámeček", "Rainbow frame", "Regenbogenrahmen", "Радужная рамка") },
  { id: "frame-stars", kind: "frame", ref: "stars", price: 300, names: n("Hvězdný rámeček", "Star frame", "Sternenrahmen", "Звёздная рамка") },
  { id: "frame-vine", kind: "frame", ref: "vine", price: 220, tag: "new", names: n("Liánový věnec", "Vine wreath", "Ranken-Kranz", "Венок из лиан") },
  { id: "frame-royal", kind: "frame", ref: "royal", price: 320, tag: "new", names: n("Královský rámeček", "Royal frame", "Königsrahmen", "Королевская рамка") },
  { id: "frame-coral", kind: "frame", ref: "coral", price: 260, tag: "new", names: n("Korálový věnec", "Coral wreath", "Korallenkranz", "Коралловый венок") },
  { id: "frame-fire", kind: "frame", ref: "fire", price: 350, tag: "popular", names: n("Ohnivý rámeček", "Fire frame", "Feuerrahmen", "Огненная рамка") },

  // --- pozadí profilu ---
  { id: "banner-sunset", kind: "banner", ref: "sunset", price: 80, names: n("Západ slunce", "Sunset", "Sonnenuntergang", "Закат") },
  { id: "banner-ocean", kind: "banner", ref: "ocean", price: 80, names: n("Oceán", "Ocean", "Ozean", "Океан") },
  { id: "banner-forest", kind: "banner", ref: "forest", price: 100, names: n("Les", "Forest", "Wald", "Лес") },
  { id: "banner-candy", kind: "banner", ref: "candy", price: 120, names: n("Bonbóny", "Candy", "Bonbons", "Конфеты") },
  { id: "banner-snow", kind: "banner", ref: "snow", price: 120, names: n("Sníh", "Snow", "Schnee", "Снег") },
  { id: "banner-night-city", kind: "banner", ref: "night-city", price: 160, names: n("Noční město", "Night city", "Nachtstadt", "Ночной город") },
  { id: "banner-treasure-map", kind: "banner", ref: "treasure-map", price: 130, tag: "new", names: n("Mapa pokladu", "Treasure map", "Schatzkarte", "Карта сокровищ") },
  { id: "banner-pirate-night", kind: "banner", ref: "pirate-night", price: 160, tag: "new", names: n("Pirátská noc", "Pirate night", "Piratennacht", "Пиратская ночь") },
  { id: "banner-storm", kind: "banner", ref: "storm", price: 180, tag: "new", names: n("Bouře", "Storm", "Sturm", "Буря") },
  { id: "banner-forest-glade", kind: "banner", ref: "forest-glade", price: 140, tag: "new", names: n("Lesní mýtina", "Forest glade", "Waldlichtung", "Лесная поляна") },
  { id: "banner-castle-day", kind: "banner", ref: "castle-day", price: 140, tag: "new", names: n("Hradní nádvoří", "Castle courtyard", "Burghof", "Замковый двор") },
  { id: "banner-castle-night", kind: "banner", ref: "castle-night", price: 170, tag: "new", names: n("Hradby za noci", "Castle by night", "Burg bei Nacht", "Замок ночью") },
  { id: "banner-deep-sea", kind: "banner", ref: "deep-sea", price: 150, tag: "new", names: n("Hlubiny", "The deep", "Tiefsee", "Глубины") },
  { id: "banner-jellyfish", kind: "banner", ref: "jellyfish", price: 190, tag: "new", names: n("Medúzí záře", "Jellyfish glow", "Quallenleuchten", "Сияние медуз") },
  { id: "banner-town-space", kind: "banner", ref: "town-space", price: 210, tag: "new", names: n("Vesmírná stanice", "Space station", "Raumstation", "Космическая станция") },
  { id: "banner-town-pirate", kind: "banner", ref: "town-pirate", price: 180, tag: "new", names: n("Pirátský přístav", "Pirate harbour", "Piratenhafen", "Пиратская гавань") },
  { id: "banner-town-forest", kind: "banner", ref: "town-forest", price: 190, tag: "new", names: n("Kouzelný les", "Magic forest", "Zauberwald", "Волшебный лес") },
  { id: "banner-town-castle", kind: "banner", ref: "town-castle", price: 180, tag: "new", names: n("Království", "Kingdom", "Königreich", "Королевство") },
  { id: "banner-town-sea", kind: "banner", ref: "town-sea", price: 200, tag: "new", names: n("Podmořské město", "Underwater city", "Unterwasserstadt", "Подводный город") },
  { id: "banner-spring", kind: "banner", ref: "spring", price: 120, tag: "new", names: n("Jaro", "Spring", "Frühling", "Весна") },
  { id: "banner-summer", kind: "banner", ref: "summer", price: 120, tag: "new", names: n("Léto u moře", "Summer beach", "Sommerstrand", "Летний пляж") },
  { id: "banner-autumn", kind: "banner", ref: "autumn", price: 120, tag: "new", names: n("Podzim", "Autumn", "Herbst", "Осень") },
  { id: "banner-christmas", kind: "banner", ref: "christmas", price: 170, tag: "new", names: n("Vánoční vesnička", "Christmas village", "Weihnachtsdorf", "Рождественская деревня") },
  { id: "banner-halloween", kind: "banner", ref: "halloween", price: 170, tag: "new", names: n("Halloween", "Halloween", "Halloween", "Хэллоуин") },
  { id: "banner-volcano", kind: "banner", ref: "volcano", price: 190, tag: "new", names: n("Sopka", "Volcano", "Vulkan", "Вулкан") },
  { id: "banner-desert", kind: "banner", ref: "desert", price: 140, tag: "new", names: n("Pyramidy", "Pyramids", "Pyramiden", "Пирамиды") },
  { id: "banner-aurora", kind: "banner", ref: "aurora", price: 220, tag: "new", names: n("Polární záře", "Northern lights", "Polarlicht", "Северное сияние") },
  { id: "banner-dino", kind: "banner", ref: "dino", price: 180, tag: "new", names: n("Pravěk", "Dino land", "Urzeit", "Мир динозавров") },
  { id: "banner-rainbow", kind: "banner", ref: "rainbow", price: 150, tag: "new", names: n("Duha", "Rainbow", "Regenbogen", "Радуга") },
  { id: "banner-galaxy", kind: "banner", ref: "galaxy", price: 200, tag: "popular", names: n("Galaxie", "Galaxy", "Galaxie", "Галактика") },

  // --- doplňky pro mazlíčky ---
  { id: "pet-bow", kind: "pet", ref: "bow", price: 80, asset3d: "pet-bow", names: n("Mašle", "Bow", "Schleife", "Бантик") },
  { id: "pet-flower", kind: "pet", ref: "flower", price: 90, asset3d: "pet-flower", names: n("Kytička", "Flower", "Blümchen", "Цветочек") },
  { id: "pet-party", kind: "pet", ref: "party", price: 100, asset3d: "pet-party", names: n("Oslavná čepice", "Party hat", "Partyhut", "Праздничная шапка") },
  { id: "pet-glasses", kind: "pet", ref: "glasses", price: 120, asset3d: "pet-glasses", names: n("Sluneční brýle", "Sunglasses", "Sonnenbrille", "Солнечные очки") },
  { id: "pet-scarf", kind: "pet", ref: "scarf", price: 130, asset3d: "pet-scarf", names: n("Šála", "Scarf", "Schal", "Шарф") },
  { id: "pet-halo", kind: "pet", ref: "halo", price: 180, tag: "new", names: n("Svatozář", "Halo", "Heiligenschein", "Нимб") },
  { id: "pet-headphones", kind: "pet", ref: "headphones", price: 200, tag: "new", names: n("Sluchátka", "Headphones", "Kopfhörer", "Наушники") },
  { id: "pet-crown", kind: "pet", ref: "crown", price: 250, tag: "popular", asset3d: "pet-crown", names: n("Koruna", "Crown", "Krone", "Корона") },

  // --- speciální budovy do města ---
  { id: "city-christmas-tree", kind: "city", ref: "christmas_tree", price: 150, tag: "new", asset3d: "city-christmas-tree", names: n("Vánoční strom", "Christmas tree", "Weihnachtsbaum", "Новогодняя ёлка") },
  { id: "city-windmill", kind: "city", ref: "windmill", price: 250, asset3d: "city-windmill", names: n("Větrný mlýn", "Windmill", "Windmühle", "Ветряная мельница") },
  { id: "city-ferris-wheel", kind: "city", ref: "ferris_wheel", price: 400, tag: "popular", asset3d: "city-ferris-wheel", names: n("Obří kolo", "Ferris wheel", "Riesenrad", "Колесо обозрения") },
  { id: "city-carousel", kind: "city", ref: "carousel", price: 300, tag: "new", names: n("Kolotoč", "Carousel", "Karussell", "Карусель") },
  { id: "city-lighthouse", kind: "city", ref: "lighthouse", price: 350, tag: "new", names: n("Maják", "Lighthouse", "Leuchtturm", "Маяк") },
  { id: "city-rocket-pad", kind: "city", ref: "rocket_pad", price: 600, tag: "new", names: n("Kosmodrom", "Rocket pad", "Raketenstartplatz", "Космодром") },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

// Klíč odemčení uložený v tabulce Unlock.
export function unlockKey(item: ShopItem): string {
  return `${item.kind}:${item.ref}`;
}

// --- Denní nabídka, balíčky a dárky ---

export const DEAL_COUNT = 3;
export const DEAL_DISCOUNT = 0.3;
export const BUNDLE_DISCOUNT = 0.25;

// Den ve tvaru RRRR-MM-DD podle UTC: server i prohlížeč z něj dostanou stejnou denní nabídku.
export function dayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

// Kdy se nabídka mění (půlnoc UTC).
export function nextDealReset(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Id zboží, které je v daný den ve slevě.
export function dailyDealIds(day: string): string[] {
  const rand = seededRandom(`deals:${day}`);
  const pool = [...SHOP_ITEMS];
  const picked: string[] = [];
  while (picked.length < DEAL_COUNT && pool.length > 0) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0].id);
  }
  return picked;
}

// Cena, kterou za zboží v daný den zaplatíš.
export function salePrice(item: ShopItem, day: string): number {
  return dailyDealIds(day).includes(item.id) ? Math.max(1, Math.round(item.price * (1 - DEAL_DISCOUNT))) : item.price;
}

export type ShopBundle = {
  id: string;
  itemIds: string[];
  color: string;
  names: Record<Locale, string>;
};

export const SHOP_BUNDLES: ShopBundle[] = [
  { id: "pirate", itemIds: ["avatar-pirate", "frame-gold", "pet-glasses", "banner-ocean"], color: "#7fd0e8", names: n("Pirátská sada", "Pirate set", "Piraten-Set", "Пиратский набор") },
  { id: "space", itemIds: ["avatar-astronaut", "frame-stars", "banner-galaxy", "city-rocket-pad"], color: "#8c7cff", names: n("Vesmírná sada", "Space set", "Weltraum-Set", "Космический набор") },
  { id: "winter", itemIds: ["avatar-winter", "banner-snow", "pet-scarf", "city-christmas-tree"], color: "#bfe6ff", names: n("Zimní sada", "Winter set", "Winter-Set", "Зимний набор") },
  { id: "forest", itemIds: ["avatar-fairy", "frame-vine", "banner-forest-glade", "title-forest-guardian"], color: "#7ee0a0", names: n("Lesní sada", "Forest set", "Wald-Set", "Лесной набор") },
  { id: "castle", itemIds: ["avatar-knight", "frame-royal", "banner-castle-day", "title-knight"], color: "#d6a84a", names: n("Hradní sada", "Castle set", "Burg-Set", "Замковый набор") },
  { id: "sea", itemIds: ["avatar-diver", "frame-coral", "banner-deep-sea", "title-sea-sage"], color: "#5fd0ee", names: n("Podmořská sada", "Underwater set", "Unterwasser-Set", "Подводный набор") },
  { id: "magic", itemIds: ["avatar-wizard", "frame-neon", "pet-party", "title-scholar"], color: "#c9a8ff", names: n("Kouzelná sada", "Magic set", "Zauber-Set", "Волшебный набор") },
];

export function getBundle(id: string): ShopBundle | undefined {
  return SHOP_BUNDLES.find((b) => b.id === id);
}

// Cena balíčku za to, co ještě nevlastníš: základní ceny mínus sleva za sadu.
export function bundlePrice(bundle: ShopBundle, ownedIds: ReadonlySet<string>): { price: number; full: number; missing: string[] } {
  const missing = bundle.itemIds.filter((id) => !ownedIds.has(id));
  const full = missing.reduce((sum, id) => sum + (getShopItem(id)?.price ?? 0), 0);
  return { price: Math.round(full * (1 - BUNDLE_DISCOUNT)), full, missing };
}
