// Herní logika Farmy. Čistý kód bez databáze a Reactu: stejný výpočet běží na serveru
// (autoritativně) i v prohlížeči (odpočty a náhled).
//
// Jak Farma funguje:
//  - Na záhonech se sází plodiny. Rostou v reálném čase i když hráč není ve hře, zralé počkají.
//  - Zvířata ve dvoře produkují suroviny. Každé zvíře drží nanejvýš několik dávek, než si je hráč vyzvedne.
//  - Úroda a suroviny jdou do sýpky (omezená kapacita). Prodávají se za mince, nebo se odevzdají do zakázek.
//  - Zkušenosti farmy (z prodeje, sklizně a zakázek) odemykají nové plodiny, zvířata a záhony.
//  - Učení pomáhá: bonus z XP za posledních 24 hodin zrychluje růst plodin i produkci zvířat.
//  - Hnojivo (za body z učení) dozraje jeden záhon okamžitě.

import type { Locale } from "@/i18n/config";

const n = (cs: string, en: string, de: string, ru: string): Record<Locale, string> => ({ cs, en, de, ru });

export const MAX_PLOTS = 24;
export const START_PLOTS = 6;
export const START_COINS = 60;
export const MAX_LEVEL = 20;
export const BASE_SILO = 40;
export const SILO_STEP = 30;
export const MAX_SILO_UPGRADES = 6;
export const MAX_ANIMALS_PER_KIND = 6;
export const ANIMAL_BATCH_CAP = 6;
export const FERTILIZE_POINTS_COST = 10;
export const ORDER_COUNT = 3;
export const MAX_LEARNING_BONUS = 0.5;

export type CropId =
  | "wheat"
  | "carrot"
  | "corn"
  | "potato"
  | "tomato"
  | "strawberry"
  | "sunflower"
  | "cabbage"
  | "pumpkin"
  | "watermelon"
  | "apple"
  | "cherry"
  | "grapes"
  | "peach"
  | "lavender"
  | "rose";
export type AnimalId = "chicken" | "duck" | "sheep" | "goat" | "cow" | "turkey" | "pig" | "bee" | "alpaca" | "silkworm";
export type ProductId = "egg" | "duckegg" | "wool" | "cheese" | "milk" | "turkeyegg" | "truffle" | "honey" | "alpacawool" | "silk";
export type ItemId = CropId | ProductId;

export type CropDef = { id: CropId; level: number; seed: number; minutes: number; price: number; xp: number; names: Record<Locale, string> };
export type AnimalDef = {
  id: AnimalId;
  level: number;
  cost: number;
  product: ProductId;
  // Jak často jedno zvíře vyprodukuje jednu dávku.
  minutes: number;
  names: Record<Locale, string>;
};
export type ProductDef = { id: ProductId; price: number; xp: number; names: Record<Locale, string> };

export const CROPS: CropDef[] = [
  { id: "wheat", level: 1, seed: 5, minutes: 2, price: 10, xp: 1, names: n("Pšenice", "Wheat", "Weizen", "Пшеница") },
  { id: "carrot", level: 1, seed: 8, minutes: 5, price: 17, xp: 2, names: n("Mrkev", "Carrot", "Karotte", "Морковь") },
  { id: "corn", level: 2, seed: 14, minutes: 10, price: 30, xp: 3, names: n("Kukuřice", "Corn", "Mais", "Кукуруза") },
  { id: "potato", level: 3, seed: 20, minutes: 20, price: 46, xp: 4, names: n("Brambor", "Potato", "Kartoffel", "Картофель") },
  { id: "tomato", level: 4, seed: 30, minutes: 45, price: 76, xp: 6, names: n("Rajče", "Tomato", "Tomate", "Помидор") },
  { id: "strawberry", level: 5, seed: 45, minutes: 90, price: 128, xp: 9, names: n("Jahoda", "Strawberry", "Erdbeere", "Клубника") },
  { id: "sunflower", level: 6, seed: 60, minutes: 120, price: 170, xp: 11, names: n("Slunečnice", "Sunflower", "Sonnenblume", "Подсолнух") },
  { id: "cabbage", level: 7, seed: 75, minutes: 150, price: 205, xp: 13, names: n("Zelí", "Cabbage", "Kohl", "Капуста") },
  { id: "pumpkin", level: 8, seed: 90, minutes: 180, price: 260, xp: 15, names: n("Dýně", "Pumpkin", "Kürbis", "Тыква") },
  { id: "watermelon", level: 9, seed: 115, minutes: 240, price: 330, xp: 18, names: n("Meloun", "Watermelon", "Wassermelone", "Арбуз") },
  { id: "apple", level: 10, seed: 140, minutes: 300, price: 430, xp: 22, names: n("Jablko", "Apple", "Apfel", "Яблоко") },
  { id: "cherry", level: 11, seed: 170, minutes: 360, price: 500, xp: 26, names: n("Třešně", "Cherries", "Kirschen", "Вишня") },
  { id: "grapes", level: 12, seed: 200, minutes: 480, price: 660, xp: 32, names: n("Hrozny", "Grapes", "Trauben", "Виноград") },
  { id: "peach", level: 14, seed: 240, minutes: 600, price: 810, xp: 38, names: n("Broskev", "Peach", "Pfirsich", "Персик") },
  { id: "lavender", level: 16, seed: 300, minutes: 720, price: 980, xp: 46, names: n("Levandule", "Lavender", "Lavendel", "Лаванда") },
  { id: "rose", level: 18, seed: 420, minutes: 900, price: 1330, xp: 62, names: n("Růže", "Rose", "Rose", "Роза") },
];

export const ANIMALS: AnimalDef[] = [
  { id: "chicken", level: 2, cost: 120, product: "egg", minutes: 6, names: n("Slepice", "Chicken", "Huhn", "Курица") },
  { id: "duck", level: 3, cost: 220, product: "duckegg", minutes: 10, names: n("Kachna", "Duck", "Ente", "Утка") },
  { id: "sheep", level: 5, cost: 500, product: "wool", minutes: 20, names: n("Ovce", "Sheep", "Schaf", "Овца") },
  { id: "goat", level: 6, cost: 750, product: "cheese", minutes: 30, names: n("Koza", "Goat", "Ziege", "Коза") },
  { id: "cow", level: 8, cost: 1200, product: "milk", minutes: 40, names: n("Kráva", "Cow", "Kuh", "Корова") },
  { id: "turkey", level: 9, cost: 1600, product: "turkeyegg", minutes: 50, names: n("Krocan", "Turkey", "Truthahn", "Индюк") },
  { id: "pig", level: 11, cost: 2000, product: "truffle", minutes: 60, names: n("Prase", "Pig", "Schwein", "Свинья") },
  { id: "bee", level: 13, cost: 3200, product: "honey", minutes: 90, names: n("Včely", "Bees", "Bienen", "Пчёлы") },
  { id: "alpaca", level: 15, cost: 4300, product: "alpacawool", minutes: 110, names: n("Alpaka", "Alpaca", "Alpaka", "Альпака") },
  { id: "silkworm", level: 17, cost: 5600, product: "silk", minutes: 150, names: n("Bource", "Silkworm", "Seidenraupe", "Шелкопряд") },
];

export const PRODUCTS: ProductDef[] = [
  { id: "egg", price: 14, xp: 1, names: n("Vejce", "Egg", "Ei", "Яйцо") },
  { id: "duckegg", price: 26, xp: 2, names: n("Kachní vejce", "Duck egg", "Enten-Ei", "Утиное яйцо") },
  { id: "wool", price: 60, xp: 4, names: n("Vlna", "Wool", "Wolle", "Шерсть") },
  { id: "cheese", price: 95, xp: 6, names: n("Sýr", "Cheese", "Käse", "Сыр") },
  { id: "milk", price: 140, xp: 8, names: n("Mléko", "Milk", "Milch", "Молоко") },
  { id: "turkeyegg", price: 185, xp: 10, names: n("Krocaní vejce", "Turkey egg", "Truthahn-Ei", "Индюшиное яйцо") },
  { id: "truffle", price: 230, xp: 12, names: n("Lanýž", "Truffle", "Trüffel", "Трюфель") },
  { id: "honey", price: 360, xp: 18, names: n("Med", "Honey", "Honig", "Мёд") },
  { id: "alpacawool", price: 480, xp: 25, names: n("Vlna z alpaky", "Alpaca wool", "Alpaka-Wolle", "Шерсть альпаки") },
  { id: "silk", price: 700, xp: 36, names: n("Hedvábí", "Silk", "Seide", "Шёлк") },
];

export type Plot = { crop: CropId; plantedAt: number } | null;
export type AnimalStock = { count: number; lastCollect: number };
export type Order = { id: string; items: { item: ItemId; qty: number }[]; coins: number; xp: number };

export type FarmState = {
  v: 1;
  coins: number;
  xp: number;
  totalEarned: number;
  plots: Plot[];
  animals: Partial<Record<AnimalId, AnimalStock>>;
  stock: Partial<Record<ItemId, number>>;
  siloUpgrades: number;
  orders: Order[];
  ordersDone: number;
  lastSeen: number;
};

export type ErrorCode =
  | "bad-request"
  | "not-enough-coins"
  | "not-enough-points"
  | "level-too-low"
  | "plot-occupied"
  | "plot-empty"
  | "not-ripe"
  | "silo-full"
  | "max-plots"
  | "max-animals"
  | "max-level"
  | "nothing-to-collect"
  | "nothing-to-sell"
  | "order-missing-items"
  | "unknown-order";

export type ActionResult =
  | { ok: true; state: FarmState; pointsSpent?: number; gained?: { coins?: number; xp?: number; items?: number } }
  | { ok: false; error: ErrorCode };

export const isCrop = (v: unknown): v is CropId => CROPS.some((c) => c.id === v);
export const isAnimal = (v: unknown): v is AnimalId => ANIMALS.some((a) => a.id === v);
export const isItem = (v: unknown): v is ItemId => isCrop(v) || PRODUCTS.some((p) => p.id === v);
export const cropDef = (id: CropId) => CROPS.find((c) => c.id === id)!;
export const animalDef = (id: AnimalId) => ANIMALS.find((a) => a.id === id)!;
export const productDef = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;

export function itemPrice(item: ItemId): number {
  return isCrop(item) ? cropDef(item).price : productDef(item as ProductId).price;
}
function itemXp(item: ItemId): number {
  return isCrop(item) ? cropDef(item).xp : productDef(item as ProductId).xp;
}

// --- Úroveň farmy ---

export function xpForLevel(level: number): number {
  return 30 * (level - 1) * (level - 1);
}
export function levelFromXp(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, xp) / 30)) + 1);
}
export function levelInfo(xp: number) {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level, percent: 100, intoLevel: 0, needed: 0, maxed: true };
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  return { level, percent: Math.floor(((xp - from) / (to - from)) * 100), intoLevel: xp - from, needed: to - from, maxed: false };
}

// Bonusy z ostatních Stálých her (společně s učením zrychlují růst plodin i zvířat).
export const MAX_PET_BONUS = 0.1;
export const MAX_CITY_BONUS = 0.1;
// Aktivní mazlíček: +1 % za každou svou úroveň, nejvýš +10 %.
export function petSpeedBonus(level: number | null): number {
  return level ? Math.min(MAX_PET_BONUS, Math.max(0, level) * 0.01) : 0;
}
// Město: +1 % za každých 15 budov (bez silnic), nejvýš +10 %.
export function citySpeedBonus(buildings: number): number {
  return Math.min(MAX_CITY_BONUS, Math.floor(Math.max(0, buildings) / 15) * 0.01);
}

// Bonus za učení: každých 100 XP z posledních 24 hodin dá +10 %, nejvýš +50 %.
export function learningBonusFromXp(xpLast24h: number): number {
  return Math.min(MAX_LEARNING_BONUS, Math.max(0, xpLast24h) / 1000);
}

// --- Kapacity a ceny ---

export const siloCapacity = (state: FarmState) => BASE_SILO + SILO_STEP * state.siloUpgrades;
export const siloUpgradeCost = (upgrades: number) => Math.round(150 * Math.pow(1.7, upgrades));
export const plotCost = (plotCount: number) => Math.round(80 * Math.pow(1.28, plotCount - START_PLOTS));
// Od jaké úrovně farmy jde koupit další záhon (7.–24.).
export const plotLevel = (plotCount: number) => 2 + Math.floor((plotCount - START_PLOTS) / 2);
export const animalPrice = (id: AnimalId, owned: number) => Math.round(animalDef(id).cost * Math.pow(1.45, owned));
export const stockTotal = (state: FarmState) => Object.values(state.stock).reduce((a, b) => a + (b ?? 0), 0);

// --- Čas ---

export function growMs(crop: CropId, learningBonus: number): number {
  return (cropDef(crop).minutes * 60_000) / (1 + learningBonus);
}
export function plotProgress(plot: Plot, now: number, learningBonus: number): number {
  if (!plot) return 0;
  return Math.min(1, Math.max(0, (now - plot.plantedAt) / growMs(plot.crop, learningBonus)));
}
export const isRipe = (plot: Plot, now: number, learningBonus: number) => !!plot && plotProgress(plot, now, learningBonus) >= 1;

export function animalIntervalMs(id: AnimalId, learningBonus: number): number {
  return (animalDef(id).minutes * 60_000) / (1 + learningBonus);
}
// Kolik hotových dávek čeká u daného druhu zvířat.
export function animalReady(id: AnimalId, stock: AnimalStock | undefined, now: number, learningBonus: number): number {
  if (!stock || stock.count <= 0) return 0;
  const batches = Math.floor((now - stock.lastCollect) / animalIntervalMs(id, learningBonus));
  return Math.max(0, Math.min(batches, ANIMAL_BATCH_CAP)) * stock.count;
}

// --- Stav ---

export function emptyState(now: number): FarmState {
  return {
    v: 1,
    coins: START_COINS,
    xp: 0,
    totalEarned: 0,
    plots: Array.from({ length: START_PLOTS }, () => null),
    animals: {},
    stock: {},
    siloUpgrades: 0,
    orders: [],
    ordersDone: 0,
    lastSeen: now,
  };
}

function unlockedItems(level: number): ItemId[] {
  return [
    ...CROPS.filter((c) => c.level <= level).map((c) => c.id as ItemId),
    ...ANIMALS.filter((a) => a.level <= level).map((a) => a.product as ItemId),
  ];
}

// Nová zakázka podle úrovně farmy. `rand` jde dosadit kvůli testům.
export function makeOrder(level: number, rand: () => number = Math.random): Order {
  const pool = unlockedItems(level);
  const lines = rand() < 0.5 || pool.length < 2 ? 1 : 2;
  const items: Order["items"] = [];
  while (items.length < lines) {
    const item = pool[Math.floor(rand() * pool.length)];
    if (items.some((i) => i.item === item)) continue;
    const price = itemPrice(item);
    const qty = Math.max(2, Math.min(12, Math.round((60 + level * 8) / price + 2 + rand() * 4)));
    items.push({ item, qty });
  }
  const value = items.reduce((s, i) => s + itemPrice(i.item) * i.qty, 0);
  return {
    id: Math.floor(rand() * 1e9).toString(36),
    items,
    coins: Math.round(value * 1.6),
    xp: Math.max(3, Math.round(value * 0.2)),
  };
}

export function fillOrders(state: FarmState, rand: () => number = Math.random): FarmState {
  if (state.orders.length >= ORDER_COUNT) return state;
  const level = levelFromXp(state.xp);
  const orders = [...state.orders];
  while (orders.length < ORDER_COUNT) orders.push(makeOrder(level, rand));
  return { ...state, orders };
}

// Dokáže přijmout i staré nebo poškozené uložení a vždy vrátí platný stav.
export function normalizeState(raw: unknown, now: number): FarmState {
  const base = emptyState(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<FarmState>;
  const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

  const plotCount = Array.isArray(r.plots) ? Math.min(MAX_PLOTS, Math.max(START_PLOTS, r.plots.length)) : START_PLOTS;
  const plots: Plot[] = Array.from({ length: plotCount }, (_, i) => {
    const p = Array.isArray(r.plots) ? (r.plots[i] as { crop?: unknown; plantedAt?: unknown } | null) : null;
    return p && isCrop(p.crop) ? { crop: p.crop, plantedAt: num(p.plantedAt, now, 0, now) } : null;
  });

  const animals: FarmState["animals"] = {};
  for (const a of ANIMALS) {
    const s = (r.animals as Record<string, Partial<AnimalStock>> | undefined)?.[a.id];
    if (s && num(s.count, 0) > 0) animals[a.id] = { count: num(s.count, 1, 1, MAX_ANIMALS_PER_KIND), lastCollect: num(s.lastCollect, now, 0, now) };
  }

  const stock: FarmState["stock"] = {};
  if (r.stock && typeof r.stock === "object") {
    for (const [k, v] of Object.entries(r.stock)) if (isItem(k) && num(v, 0) > 0) stock[k] = Math.floor(num(v, 0, 0, 100_000));
  }

  const orders: Order[] = Array.isArray(r.orders)
    ? r.orders
        .filter((o): o is Order => !!o && typeof o === "object" && Array.isArray((o as Order).items))
        .map((o) => ({
          id: typeof o.id === "string" ? o.id.slice(0, 16) : "x",
          items: o.items.filter((i) => isItem(i?.item) && num(i.qty, 0) > 0).map((i) => ({ item: i.item, qty: Math.floor(num(i.qty, 1, 1, 99)) })),
          coins: num(o.coins, 0),
          xp: num(o.xp, 0),
        }))
        .filter((o) => o.items.length > 0)
        .slice(0, ORDER_COUNT)
    : [];

  return {
    v: 1,
    coins: num(r.coins, START_COINS),
    xp: num(r.xp, 0),
    totalEarned: num(r.totalEarned, 0),
    plots,
    animals,
    stock,
    siloUpgrades: num(r.siloUpgrades, 0, 0, MAX_SILO_UPGRADES),
    orders,
    ordersDone: num(r.ordersDone, 0),
    lastSeen: num(r.lastSeen, now, 0, now),
  };
}

// --- Akce ---

const fail = (error: ErrorCode): ActionResult => ({ ok: false, error });

function addStock(state: FarmState, item: ItemId, qty: number): FarmState {
  return { ...state, stock: { ...state.stock, [item]: (state.stock[item] ?? 0) + qty } };
}

function plotIndex(state: FarmState, v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < state.plots.length ? v : null;
}

export function plant(state: FarmState, plotIdx: unknown, crop: unknown, now: number): ActionResult {
  const i = plotIndex(state, plotIdx);
  if (i === null || !isCrop(crop)) return fail("bad-request");
  const def = cropDef(crop);
  if (levelFromXp(state.xp) < def.level) return fail("level-too-low");
  if (state.plots[i]) return fail("plot-occupied");
  if (state.coins < def.seed) return fail("not-enough-coins");
  const plots = [...state.plots];
  plots[i] = { crop, plantedAt: now };
  return { ok: true, state: { ...state, coins: state.coins - def.seed, plots } };
}

// Zasadí vybranou plodinu na všechny volné záhony, na které stačí mince.
export function plantAll(state: FarmState, crop: unknown, now: number): ActionResult {
  if (!isCrop(crop)) return fail("bad-request");
  const def = cropDef(crop);
  if (levelFromXp(state.xp) < def.level) return fail("level-too-low");
  const plots = [...state.plots];
  let coins = state.coins;
  let planted = 0;
  for (let i = 0; i < plots.length; i++) {
    if (plots[i] || coins < def.seed) continue;
    plots[i] = { crop, plantedAt: now };
    coins -= def.seed;
    planted++;
  }
  if (planted === 0) return fail(state.plots.every((p) => p) ? "plot-occupied" : "not-enough-coins");
  return { ok: true, state: { ...state, coins, plots } };
}

function harvestOne(state: FarmState, i: number, now: number, bonus: number): ActionResult {
  const plot = state.plots[i];
  if (!plot) return fail("plot-empty");
  if (!isRipe(plot, now, bonus)) return fail("not-ripe");
  if (stockTotal(state) >= siloCapacity(state)) return fail("silo-full");
  const plots = [...state.plots];
  plots[i] = null;
  const next = addStock({ ...state, plots }, plot.crop, 1);
  return { ok: true, state: { ...next, xp: next.xp + cropDef(plot.crop).xp }, gained: { items: 1, xp: cropDef(plot.crop).xp } };
}

export function harvest(state: FarmState, plotIdx: unknown, now: number, bonus: number): ActionResult {
  const i = plotIndex(state, plotIdx);
  return i === null ? fail("bad-request") : harvestOne(state, i, now, bonus);
}

export function harvestAll(state: FarmState, now: number, bonus: number): ActionResult {
  let cur = state;
  let items = 0;
  let xp = 0;
  let lastError: ErrorCode = "not-ripe";
  for (let i = 0; i < state.plots.length; i++) {
    if (!cur.plots[i]) continue;
    const r = harvestOne(cur, i, now, bonus);
    if (r.ok) {
      cur = r.state;
      items++;
      xp += r.gained?.xp ?? 0;
    } else lastError = r.error;
  }
  return items === 0 ? fail(lastError) : { ok: true, state: cur, gained: { items, xp } };
}

// Hnojivo: záhon dozraje hned. Platí se body z učení (strhne je volající).
export function fertilize(state: FarmState, plotIdx: unknown, now: number, bonus: number): ActionResult {
  const i = plotIndex(state, plotIdx);
  if (i === null) return fail("bad-request");
  const plot = state.plots[i];
  if (!plot) return fail("plot-empty");
  if (isRipe(plot, now, bonus)) return fail("bad-request");
  const plots = [...state.plots];
  plots[i] = { crop: plot.crop, plantedAt: now - Math.ceil(growMs(plot.crop, bonus)) - 1 };
  return { ok: true, state: { ...state, plots }, pointsSpent: FERTILIZE_POINTS_COST };
}

export function buyPlot(state: FarmState): ActionResult {
  const count = state.plots.length;
  if (count >= MAX_PLOTS) return fail("max-plots");
  if (levelFromXp(state.xp) < plotLevel(count)) return fail("level-too-low");
  const cost = plotCost(count);
  if (state.coins < cost) return fail("not-enough-coins");
  return { ok: true, state: { ...state, coins: state.coins - cost, plots: [...state.plots, null] } };
}

export function buyAnimal(state: FarmState, id: unknown, now: number): ActionResult {
  if (!isAnimal(id)) return fail("bad-request");
  const def = animalDef(id);
  if (levelFromXp(state.xp) < def.level) return fail("level-too-low");
  const owned = state.animals[id]?.count ?? 0;
  if (owned >= MAX_ANIMALS_PER_KIND) return fail("max-animals");
  const cost = animalPrice(id, owned);
  if (state.coins < cost) return fail("not-enough-coins");
  return {
    ok: true,
    state: {
      ...state,
      coins: state.coins - cost,
      // Nové zvíře začne nanovo, ostatní si své hotové dávky nechají.
      animals: { ...state.animals, [id]: { count: owned + 1, lastCollect: owned === 0 ? now : (state.animals[id]!.lastCollect) } },
    },
  };
}

function collectOne(state: FarmState, id: AnimalId, now: number, bonus: number): ActionResult {
  const stock = state.animals[id];
  const ready = animalReady(id, stock, now, bonus);
  if (!stock || ready === 0) return fail("nothing-to-collect");
  const room = siloCapacity(state) - stockTotal(state);
  if (room <= 0) return fail("silo-full");
  const take = Math.min(ready, room);
  const product = animalDef(id).product;
  const xp = productDef(product).xp * take;
  // Když se vzalo vše, odpočet začíná znovu; jinak zůstane část dávek čekat.
  const perBatch = stock.count;
  const batchesTaken = Math.ceil(take / perBatch);
  const lastCollect = take === ready ? now : stock.lastCollect + batchesTaken * animalIntervalMs(id, bonus);
  const next = addStock({ ...state, animals: { ...state.animals, [id]: { ...stock, lastCollect } } }, product, take);
  return { ok: true, state: { ...next, xp: next.xp + xp }, gained: { items: take, xp } };
}

export function collect(state: FarmState, id: unknown, now: number, bonus: number): ActionResult {
  return isAnimal(id) ? collectOne(state, id, now, bonus) : fail("bad-request");
}

export function collectAll(state: FarmState, now: number, bonus: number): ActionResult {
  let cur = state;
  let items = 0;
  let xp = 0;
  let lastError: ErrorCode = "nothing-to-collect";
  for (const a of ANIMALS) {
    if (!cur.animals[a.id]) continue;
    const r = collectOne(cur, a.id, now, bonus);
    if (r.ok) {
      cur = r.state;
      items += r.gained?.items ?? 0;
      xp += r.gained?.xp ?? 0;
    } else lastError = r.error;
  }
  return items === 0 ? fail(lastError) : { ok: true, state: cur, gained: { items, xp } };
}

// Prodá jednu surovinu, nebo (item = "all") celou sýpku.
/** Odebere ze sýpky jeden kus (krmení mazlíčků úrodou z farmy). */
export function takeItem(state: FarmState, item: unknown): ActionResult {
  if (!isItem(item)) return fail("bad-request");
  const have = state.stock[item] ?? 0;
  if (have < 1) return fail("nothing-to-sell");
  const stock = { ...state.stock };
  if (have === 1) delete stock[item];
  else stock[item] = have - 1;
  return { ok: true, state: { ...state, stock } };
}

export function sell(state: FarmState, item: unknown): ActionResult {
  const entries = item === "all" ? (Object.entries(state.stock) as [ItemId, number][]) : isItem(item) ? [[item, state.stock[item] ?? 0] as [ItemId, number]] : null;
  if (!entries) return fail("bad-request");
  let coins = 0;
  let xp = 0;
  const stock = { ...state.stock };
  for (const [id, qty] of entries) {
    if (!qty || qty <= 0) continue;
    coins += itemPrice(id) * qty;
    xp += Math.ceil(itemXp(id) * qty * 0.25);
    delete stock[id];
  }
  if (coins === 0) return fail("nothing-to-sell");
  return { ok: true, state: { ...state, stock, coins: state.coins + coins, xp: state.xp + xp, totalEarned: state.totalEarned + coins }, gained: { coins, xp } };
}

export function deliver(state: FarmState, orderId: unknown, rand: () => number = Math.random): ActionResult {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return fail("unknown-order");
  if (order.items.some((i) => (state.stock[i.item] ?? 0) < i.qty)) return fail("order-missing-items");
  const stock = { ...state.stock };
  for (const i of order.items) {
    const left = (stock[i.item] ?? 0) - i.qty;
    if (left > 0) stock[i.item] = left;
    else delete stock[i.item];
  }
  const xpTotal = state.xp + order.xp;
  const next: FarmState = {
    ...state,
    stock,
    coins: state.coins + order.coins,
    xp: xpTotal,
    totalEarned: state.totalEarned + order.coins,
    ordersDone: state.ordersDone + 1,
    orders: state.orders.filter((o) => o.id !== order.id),
  };
  return { ok: true, state: fillOrders(next, rand), gained: { coins: order.coins, xp: order.xp } };
}

export function upgradeSilo(state: FarmState): ActionResult {
  if (state.siloUpgrades >= MAX_SILO_UPGRADES) return fail("max-level");
  const cost = siloUpgradeCost(state.siloUpgrades);
  if (state.coins < cost) return fail("not-enough-coins");
  return { ok: true, state: { ...state, coins: state.coins - cost, siloUpgrades: state.siloUpgrades + 1 } };
}
