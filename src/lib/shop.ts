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
  { id: "avatar-wizard", kind: "avatar", ref: "wizard", price: 200, tag: "popular", asset3d: "avatar-wizard", names: n("Čaroděj", "Wizard", "Zauberer", "Волшебник") },
  { id: "avatar-pumpkin", kind: "avatar", ref: "pumpkin", price: 90, asset3d: "avatar-pumpkin", names: n("Dýně", "Pumpkin", "Kürbis", "Тыква") },
  { id: "avatar-winter", kind: "avatar", ref: "winter", price: 110, names: n("Zimní", "Winter", "Winter", "Зимний") },

  // --- tituly ---
  { id: "title-scholar", kind: "title", ref: "scholar", price: 80, names: n("Učenec", "Scholar", "Gelehrter", "Учёный") },
  { id: "title-bookworm", kind: "title", ref: "bookworm", price: 80, names: n("Knihomol", "Bookworm", "Bücherwurm", "Книголюб") },
  { id: "title-mathematician", kind: "title", ref: "mathematician", price: 100, names: n("Matematik", "Mathematician", "Mathematiker", "Математик") },
  { id: "title-builder", kind: "title", ref: "builder", price: 120, names: n("Stavitel", "Builder", "Baumeister", "Строитель") },
  { id: "title-pet-friend", kind: "title", ref: "pet-friend", price: 100, names: n("Přítel zvířat", "Animal friend", "Tierfreund", "Друг животных") },
  { id: "title-legend", kind: "title", ref: "legend", price: 400, tag: "popular", names: n("Legenda", "Legend", "Legende", "Легенда") },

  // --- rámečky avataru ---
  { id: "frame-leaf", kind: "frame", ref: "leaf", price: 100, names: n("Listový rámeček", "Leaf frame", "Blätterrahmen", "Рамка из листьев") },
  { id: "frame-gold", kind: "frame", ref: "gold", price: 150, names: n("Zlatý rámeček", "Gold frame", "Goldrahmen", "Золотая рамка") },
  { id: "frame-neon", kind: "frame", ref: "neon", price: 200, tag: "new", names: n("Neonový rámeček", "Neon frame", "Neonrahmen", "Неоновая рамка") },
  { id: "frame-rainbow", kind: "frame", ref: "rainbow", price: 250, names: n("Duhový rámeček", "Rainbow frame", "Regenbogenrahmen", "Радужная рамка") },
  { id: "frame-stars", kind: "frame", ref: "stars", price: 300, names: n("Hvězdný rámeček", "Star frame", "Sternenrahmen", "Звёздная рамка") },
  { id: "frame-fire", kind: "frame", ref: "fire", price: 350, tag: "popular", names: n("Ohnivý rámeček", "Fire frame", "Feuerrahmen", "Огненная рамка") },

  // --- pozadí profilu ---
  { id: "banner-sunset", kind: "banner", ref: "sunset", price: 80, names: n("Západ slunce", "Sunset", "Sonnenuntergang", "Закат") },
  { id: "banner-ocean", kind: "banner", ref: "ocean", price: 80, names: n("Oceán", "Ocean", "Ozean", "Океан") },
  { id: "banner-forest", kind: "banner", ref: "forest", price: 100, names: n("Les", "Forest", "Wald", "Лес") },
  { id: "banner-candy", kind: "banner", ref: "candy", price: 120, names: n("Bonbóny", "Candy", "Bonbons", "Конфеты") },
  { id: "banner-snow", kind: "banner", ref: "snow", price: 120, names: n("Sníh", "Snow", "Schnee", "Снег") },
  { id: "banner-night-city", kind: "banner", ref: "night-city", price: 160, names: n("Noční město", "Night city", "Nachtstadt", "Ночной город") },
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
