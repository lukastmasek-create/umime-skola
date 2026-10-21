// Herní logika Města. Čistý kód bez databáze a Reactu, stejný výpočet běží na
// serveru (autoritativně) i v prohlížeči (okamžitá odezva při stavění).
//
// Jak město funguje:
//  - Domy mají kapacitu, kolik v nich bydlí lidí ale závisí na spokojenosti okolí.
//  - Budovy s pracovními místy zaměstnávají obyvatele a ti vydělávají mince.
//  - Parky, lampy, sochy a další dekorace zvedají spokojenost v okolí.
//  - Továrny a dílny spokojenost snižují.
//  - Budovy bez napojení na silnici (která vede k okraji mapy) nefungují.
//  - Učení pomáhá dvakrát: úroveň účtu odemyká budovy a XP z posledních 24 hodin
//    zvyšuje výdělek, víc když je ve městě škola, knihovna nebo univerzita.

import type { Locale } from "@/i18n/config";

export type CityCat = "road" | "housing" | "work" | "service" | "nature" | "decor" | "transport";

export type CityItemDef = {
  id: string;
  cat: CityCat;
  size: [number, number];
  cost: number;
  // Cena v bodech z učení (pomníky). Body se při zbourání nevracejí.
  pointsCost?: number;
  // Úroveň účtu (z XP), od které jde budovu postavit.
  level: number;
  housing?: number;
  jobs?: number;
  // Mince za hodinu na jedno obsazené pracovní místo.
  yield?: number;
  happy?: number;
  radius?: number;
  edu?: number;
  needsRoad?: boolean;
  needsRail?: boolean;
  names: Record<Locale, string>;
};

const n = (cs: string, en: string, de: string, ru: string): Record<Locale, string> => ({ cs, en, de, ru });

export const CITY_ITEMS: CityItemDef[] = [
  // --- doprava ---
  { id: "road", cat: "road", size: [1, 1], cost: 5, level: 1, names: n("Silnice", "Road", "Straße", "Дорога") },
  { id: "rail", cat: "road", size: [1, 1], cost: 15, level: 3, names: n("Koleje", "Railway", "Gleis", "Рельсы") },
  { id: "crossing", cat: "road", size: [1, 1], cost: 60, level: 3, names: n("Železniční přejezd", "Level crossing", "Bahnübergang", "Переезд") },
  { id: "bus_stop", cat: "transport", size: [1, 1], cost: 40, level: 2, happy: 2, radius: 2, names: n("Autobusová zastávka", "Bus stop", "Bushaltestelle", "Автобусная остановка") },
  { id: "tram_stop", cat: "transport", size: [1, 1], cost: 90, level: 4, happy: 3, radius: 3, names: n("Tramvajová zastávka", "Tram stop", "Straßenbahnhaltestelle", "Трамвайная остановка") },
  { id: "train_station", cat: "transport", size: [3, 2], cost: 1400, level: 6, jobs: 12, yield: 12, happy: 4, radius: 5, needsRoad: true, needsRail: true, names: n("Nádraží", "Train station", "Bahnhof", "Вокзал") },

  // --- bydlení ---
  { id: "cottage", cat: "housing", size: [1, 1], cost: 60, level: 1, housing: 3, needsRoad: true, names: n("Chaloupka", "Cottage", "Häuschen", "Домик") },
  { id: "house", cat: "housing", size: [2, 2], cost: 220, level: 1, housing: 9, needsRoad: true, names: n("Rodinný dům", "House", "Haus", "Дом") },
  { id: "townhouse", cat: "housing", size: [2, 1], cost: 300, level: 3, housing: 12, needsRoad: true, names: n("Řadový dům", "Townhouse", "Reihenhaus", "Таунхаус") },
  { id: "apartments", cat: "housing", size: [2, 2], cost: 900, level: 5, housing: 40, needsRoad: true, names: n("Bytový dům", "Apartment block", "Wohnblock", "Многоквартирный дом") },
  { id: "tower", cat: "housing", size: [3, 3], cost: 3500, level: 10, housing: 150, needsRoad: true, names: n("Věžák", "High-rise", "Hochhaus", "Высотка") },

  // --- obchody a práce ---
  { id: "stall", cat: "work", size: [1, 1], cost: 50, level: 1, jobs: 1, yield: 8, needsRoad: true, names: n("Stánek", "Stall", "Marktstand", "Ларёк") },
  { id: "shop", cat: "work", size: [2, 1], cost: 180, level: 1, jobs: 4, yield: 8, needsRoad: true, names: n("Obchod", "Shop", "Laden", "Магазин") },
  { id: "bakery", cat: "work", size: [1, 1], cost: 150, level: 2, jobs: 3, yield: 10, happy: 1, radius: 2, needsRoad: true, names: n("Pekárna", "Bakery", "Bäckerei", "Пекарня") },
  { id: "cafe", cat: "work", size: [2, 1], cost: 240, level: 2, jobs: 4, yield: 10, happy: 2, radius: 3, needsRoad: true, names: n("Kavárna", "Café", "Café", "Кафе") },
  { id: "market", cat: "work", size: [3, 3], cost: 700, level: 3, jobs: 10, yield: 10, happy: 3, radius: 4, needsRoad: true, names: n("Tržnice", "Market hall", "Markthalle", "Рынок") },
  { id: "supermarket", cat: "work", size: [3, 2], cost: 900, level: 4, jobs: 14, yield: 10, needsRoad: true, names: n("Supermarket", "Supermarket", "Supermarkt", "Супермаркет") },
  { id: "workshop", cat: "work", size: [2, 2], cost: 400, level: 2, jobs: 8, yield: 12, happy: -2, radius: 3, needsRoad: true, names: n("Dílna", "Workshop", "Werkstatt", "Мастерская") },
  { id: "factory", cat: "work", size: [3, 3], cost: 1500, level: 5, jobs: 30, yield: 14, happy: -5, radius: 5, needsRoad: true, names: n("Továrna", "Factory", "Fabrik", "Завод") },
  { id: "office", cat: "work", size: [2, 2], cost: 1100, level: 6, jobs: 24, yield: 16, needsRoad: true, names: n("Kancelářská budova", "Office building", "Bürogebäude", "Офисное здание") },
  { id: "hotel", cat: "work", size: [3, 2], cost: 2600, level: 9, jobs: 25, yield: 16, happy: 1, radius: 3, needsRoad: true, names: n("Hotel", "Hotel", "Hotel", "Отель") },
  { id: "mall", cat: "work", size: [4, 3], cost: 3200, level: 8, jobs: 60, yield: 12, happy: 2, radius: 4, needsRoad: true, names: n("Obchodní centrum", "Shopping mall", "Einkaufszentrum", "Торговый центр") },
  { id: "skyscraper", cat: "work", size: [3, 3], cost: 6000, level: 12, jobs: 90, yield: 18, needsRoad: true, names: n("Mrakodrap", "Skyscraper", "Wolkenkratzer", "Небоскрёб") },

  // --- služby ---
  { id: "school", cat: "service", size: [3, 2], cost: 800, level: 2, jobs: 10, yield: 5, edu: 2, happy: 3, radius: 5, needsRoad: true, names: n("Škola", "School", "Schule", "Школа") },
  { id: "library", cat: "service", size: [2, 2], cost: 600, level: 3, jobs: 5, yield: 5, edu: 2, happy: 3, radius: 4, needsRoad: true, names: n("Knihovna", "Library", "Bibliothek", "Библиотека") },
  { id: "fire_station", cat: "service", size: [2, 2], cost: 900, level: 4, jobs: 8, yield: 5, happy: 3, radius: 6, needsRoad: true, names: n("Hasiči", "Fire station", "Feuerwehr", "Пожарная часть") },
  { id: "police", cat: "service", size: [2, 2], cost: 900, level: 4, jobs: 8, yield: 5, happy: 3, radius: 6, needsRoad: true, names: n("Policie", "Police station", "Polizei", "Полиция") },
  { id: "town_hall", cat: "service", size: [3, 3], cost: 2500, level: 5, jobs: 12, yield: 6, happy: 4, radius: 8, needsRoad: true, names: n("Radnice", "Town hall", "Rathaus", "Ратуша") },
  { id: "hospital", cat: "service", size: [3, 3], cost: 2200, level: 6, jobs: 30, yield: 6, happy: 5, radius: 7, needsRoad: true, names: n("Nemocnice", "Hospital", "Krankenhaus", "Больница") },
  { id: "museum", cat: "service", size: [3, 2], cost: 1800, level: 7, jobs: 10, yield: 5, edu: 2, happy: 4, radius: 6, needsRoad: true, names: n("Muzeum", "Museum", "Museum", "Музей") },
  { id: "university", cat: "service", size: [4, 3], cost: 4000, level: 8, jobs: 40, yield: 7, edu: 6, happy: 2, radius: 6, needsRoad: true, names: n("Univerzita", "University", "Universität", "Университет") },

  // --- příroda ---
  { id: "tree", cat: "nature", size: [1, 1], cost: 15, level: 1, happy: 1, radius: 2, names: n("Strom", "Tree", "Baum", "Дерево") },
  { id: "bush", cat: "nature", size: [1, 1], cost: 8, level: 1, happy: 0.5, radius: 1, names: n("Keř", "Bush", "Busch", "Куст") },
  { id: "flowerbed", cat: "nature", size: [1, 1], cost: 20, level: 1, happy: 1.5, radius: 2, names: n("Květinový záhon", "Flowerbed", "Blumenbeet", "Клумба") },
  { id: "park", cat: "nature", size: [3, 3], cost: 400, level: 2, happy: 5, radius: 5, names: n("Park", "Park", "Park", "Парк") },
  { id: "playground", cat: "nature", size: [2, 2], cost: 350, level: 2, happy: 4, radius: 4, names: n("Hřiště", "Playground", "Spielplatz", "Детская площадка") },
  { id: "pond", cat: "nature", size: [2, 2], cost: 300, level: 3, happy: 3, radius: 4, names: n("Rybník", "Pond", "Teich", "Пруд") },
  { id: "fountain", cat: "nature", size: [2, 2], cost: 450, level: 4, happy: 4, radius: 5, names: n("Fontána", "Fountain", "Brunnen", "Фонтан") },

  // --- dekorace ---
  { id: "lamp", cat: "decor", size: [1, 1], cost: 25, level: 1, happy: 1, radius: 3, names: n("Lampa", "Street lamp", "Straßenlaterne", "Фонарь") },
  { id: "bench", cat: "decor", size: [1, 1], cost: 18, level: 1, happy: 0.8, radius: 2, names: n("Lavička", "Bench", "Bank", "Скамейка") },
  { id: "bin", cat: "decor", size: [1, 1], cost: 12, level: 1, happy: 0.6, radius: 2, names: n("Odpadkový koš", "Bin", "Mülleimer", "Урна") },
  { id: "fence", cat: "decor", size: [1, 1], cost: 10, level: 1, happy: 0.2, radius: 1, names: n("Zábradlí", "Railing", "Geländer", "Ограждение") },
  { id: "mailbox", cat: "decor", size: [1, 1], cost: 15, level: 1, happy: 0.4, radius: 1, names: n("Poštovní schránka", "Mailbox", "Briefkasten", "Почтовый ящик") },
  { id: "flag", cat: "decor", size: [1, 1], cost: 30, level: 2, happy: 1, radius: 3, names: n("Vlajka", "Flag", "Flagge", "Флаг") },
  { id: "statue", cat: "decor", size: [1, 1], cost: 250, level: 3, happy: 3, radius: 4, names: n("Socha", "Statue", "Statue", "Статуя") },
  { id: "clock_tower", cat: "decor", size: [2, 2], cost: 900, level: 6, happy: 4, radius: 6, names: n("Hodinová věž", "Clock tower", "Uhrturm", "Часовая башня") },
  { id: "memorial", cat: "decor", size: [2, 2], cost: 0, pointsCost: 120, level: 5, happy: 6, radius: 5, names: n("Pomník", "Memorial", "Denkmal", "Памятник") },
  { id: "monument", cat: "decor", size: [3, 3], cost: 0, pointsCost: 300, level: 8, happy: 10, radius: 8, names: n("Monument", "Monument", "Monument", "Монумент") },
];

export const CITY_CATS: CityCat[] = ["road", "housing", "work", "service", "nature", "decor", "transport"];

const BY_ID = new Map(CITY_ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): CityItemDef | undefined {
  return BY_ID.get(id);
}

export type Placed = [id: string, x: number, y: number, rot: 0 | 1];

export type CityState = {
  v: 1;
  size: number;
  items: Placed[];
  coins: number;
  totalEarned: number;
  // Stav je dopočítaný do tohoto okamžiku (ms od roku 1970).
  lastSeen: number;
};

export const CITY_SIZE = 28;
export const START_COINS = 1500;
export const OFFLINE_CAP_HOURS = 8;
export const MAX_BATCH = 80;
export const REFUND_RATE = 0.5;
export const MAX_LEARNING_BONUS = 0.5;
// Hodnoty `happy` v katalogu jsou malá čísla, tímto se přepočtou na body spokojenosti 0–100.
export const HAPPY_SCALE = 3;

export function footprint(def: CityItemDef, rot: 0 | 1): [number, number] {
  return rot === 1 ? [def.size[1], def.size[0]] : def.size;
}

export function startState(now: number): CityState {
  const mid = Math.floor(CITY_SIZE / 2);
  const items: Placed[] = [];
  for (let x = 0; x < CITY_SIZE; x++) items.push(["road", x, mid, 0]);
  return { v: 1, size: CITY_SIZE, items, coins: START_COINS, totalEarned: 0, lastSeen: now };
}

// Přijme i poškozené nebo staré uložení a vždy vrátí platné město.
export function normalizeCity(raw: unknown, now: number): CityState {
  const base = startState(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<CityState>;
  const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

  const items: Placed[] = [];
  const taken = new Set<number>();
  if (Array.isArray(r.items)) {
    for (const entry of r.items) {
      if (!Array.isArray(entry) || entry.length < 3) continue;
      const [id, x, y, rot] = entry as [unknown, unknown, unknown, unknown];
      const def = typeof id === "string" ? getItem(id) : undefined;
      if (!def || !Number.isInteger(x) || !Number.isInteger(y)) continue;
      const r2: 0 | 1 = rot === 1 ? 1 : 0;
      const [w, h] = footprint(def, r2);
      const px = x as number;
      const py = y as number;
      if (px < 0 || py < 0 || px + w > CITY_SIZE || py + h > CITY_SIZE) continue;
      const cells: number[] = [];
      for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) cells.push((py + dy) * CITY_SIZE + px + dx);
      if (cells.some((c) => taken.has(c))) continue;
      for (const c of cells) taken.add(c);
      items.push([def.id, px, py, r2]);
    }
  }
  return {
    v: 1,
    size: CITY_SIZE,
    items,
    coins: num(r.coins, START_COINS),
    totalEarned: num(r.totalEarned, 0),
    lastSeen: num(r.lastSeen, now, 0, now),
  };
}

export type CityError =
  | "unknown-item"
  | "out-of-bounds"
  | "occupied"
  | "not-enough-coins"
  | "not-enough-points"
  | "locked"
  | "nothing-there"
  | "too-many";

export type PlaceContext = { level: number; points: number };

function cellIndex(x: number, y: number) {
  return y * CITY_SIZE + x;
}

export function occupancy(items: Placed[]): Map<number, number> {
  const map = new Map<number, number>();
  items.forEach(([id, x, y, rot], index) => {
    const def = getItem(id);
    if (!def) return;
    const [w, h] = footprint(def, rot);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) map.set(cellIndex(x + dx, y + dy), index);
  });
  return map;
}

export function canPlace(
  state: CityState,
  id: string,
  x: number,
  y: number,
  rot: 0 | 1,
  ctx: PlaceContext,
  occ: Map<number, number> = occupancy(state.items),
): { ok: true } | { ok: false; error: CityError } {
  const def = getItem(id);
  if (!def) return { ok: false, error: "unknown-item" };
  if (!Number.isInteger(x) || !Number.isInteger(y)) return { ok: false, error: "out-of-bounds" };
  const [w, h] = footprint(def, rot);
  if (x < 0 || y < 0 || x + w > CITY_SIZE || y + h > CITY_SIZE) return { ok: false, error: "out-of-bounds" };
  if (def.level > ctx.level) return { ok: false, error: "locked" };
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) if (occ.has(cellIndex(x + dx, y + dy))) return { ok: false, error: "occupied" };
  if (state.coins < def.cost) return { ok: false, error: "not-enough-coins" };
  if ((def.pointsCost ?? 0) > ctx.points) return { ok: false, error: "not-enough-points" };
  return { ok: true };
}

export type BuildOutcome =
  | { ok: true; state: CityState; pointsSpent: number; placed: number; failed: number; firstError?: CityError }
  | { ok: false; error: CityError };

// Postaví více kusů najednou (tažení myší při pokládání silnic a plotů).
// Platná políčka se postaví, neplatná se přeskočí.
export function buildMany(
  state: CityState,
  requests: { id: string; x: number; y: number; rot?: 0 | 1 }[],
  ctx: PlaceContext,
): BuildOutcome {
  if (requests.length === 0) return { ok: false, error: "nothing-there" };
  if (requests.length > MAX_BATCH) return { ok: false, error: "too-many" };

  let items = [...state.items];
  let coins = state.coins;
  let points = ctx.points;
  let spent = 0;
  let placed = 0;
  let failed = 0;
  let firstError: CityError | undefined;
  const occ = occupancy(items);

  for (const req of requests) {
    const rot: 0 | 1 = req.rot === 1 ? 1 : 0;
    const check = canPlace({ ...state, items, coins }, req.id, req.x, req.y, rot, { level: ctx.level, points }, occ);
    if (!check.ok) {
      failed++;
      firstError ??= check.error;
      continue;
    }
    const def = getItem(req.id)!;
    coins -= def.cost;
    points -= def.pointsCost ?? 0;
    spent += def.pointsCost ?? 0;
    items = [...items, [def.id, req.x, req.y, rot]];
    const [w, h] = footprint(def, rot);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) occ.set(cellIndex(req.x + dx, req.y + dy), items.length - 1);
    placed++;
  }

  if (placed === 0) return { ok: false, error: firstError ?? "occupied" };
  return { ok: true, state: { ...state, items, coins }, pointsSpent: spent, placed, failed, firstError };
}

export function demolishAt(
  state: CityState,
  tiles: { x: number; y: number }[],
): { ok: true; state: CityState; removed: number; refund: number } | { ok: false; error: CityError } {
  if (tiles.length > MAX_BATCH) return { ok: false, error: "too-many" };
  const occ = occupancy(state.items);
  const remove = new Set<number>();
  for (const t of tiles) {
    if (!Number.isInteger(t.x) || !Number.isInteger(t.y)) continue;
    const index = occ.get(cellIndex(t.x, t.y));
    if (index !== undefined) remove.add(index);
  }
  if (remove.size === 0) return { ok: false, error: "nothing-there" };
  let refund = 0;
  const items = state.items.filter((entry, index) => {
    if (!remove.has(index)) return true;
    refund += Math.floor((getItem(entry[0])?.cost ?? 0) * REFUND_RATE);
    return false;
  });
  return { ok: true, state: { ...state, items, coins: state.coins + refund }, removed: remove.size, refund };
}

// --- výpočet města ---

export type CityStats = {
  capacity: number;
  population: number;
  jobs: number;
  employed: number;
  unemployed: number;
  happiness: number;
  incomePerHour: number;
  eduPoints: number;
  eduCoverage: number;
  stations: number;
  // Index v state.items -> true, pokud je budova napojená a funguje.
  working: boolean[];
  // Stav spokojenosti každého domu (index v state.items), ostatní jsou undefined.
  houseHappiness: (number | undefined)[];
  buildings: number;
};

function isRoadLike(id: string) {
  return id === "road" || id === "crossing";
}
function isRailLike(id: string) {
  return id === "rail" || id === "crossing";
}

// Silnice jsou "napojené", když z nich vede cesta k okraji mapy.
export function connectedRoads(items: Placed[]): Set<number> {
  const roads = new Set<number>();
  for (const [id, x, y] of items) if (isRoadLike(id)) roads.add(cellIndex(x, y));
  const seen = new Set<number>();
  const queue: number[] = [];
  for (const c of roads) {
    const x = c % CITY_SIZE;
    const y = Math.floor(c / CITY_SIZE);
    if (x === 0 || y === 0 || x === CITY_SIZE - 1 || y === CITY_SIZE - 1) {
      seen.add(c);
      queue.push(c);
    }
  }
  while (queue.length) {
    const c = queue.pop()!;
    const x = c % CITY_SIZE;
    const y = Math.floor(c / CITY_SIZE);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= CITY_SIZE || ny >= CITY_SIZE) continue;
      const nc = cellIndex(nx, ny);
      if (roads.has(nc) && !seen.has(nc)) {
        seen.add(nc);
        queue.push(nc);
      }
    }
  }
  return seen;
}

function touches(
  x: number,
  y: number,
  w: number,
  h: number,
  predicate: (cell: number) => boolean,
): boolean {
  for (let dx = -1; dx <= w; dx++) {
    for (let dy = -1; dy <= h; dy++) {
      const inside = dx >= 0 && dx < w && dy >= 0 && dy < h;
      const corner = (dx === -1 || dx === w) && (dy === -1 || dy === h);
      if (inside || corner) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= CITY_SIZE || ny >= CITY_SIZE) continue;
      if (predicate(cellIndex(nx, ny))) return true;
    }
  }
  return false;
}

export function computeCity(state: CityState, learningBonus: number): CityStats {
  const items = state.items;
  const roads = connectedRoads(items);
  const rails = new Set<number>();
  for (const [id, x, y] of items) if (isRailLike(id)) rails.add(cellIndex(x, y));

  const working: boolean[] = items.map(() => false);
  const geometry = items.map(([id, x, y, rot]) => {
    const def = getItem(id)!;
    const [w, h] = footprint(def, rot);
    return { def, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  });

  // Které budovy fungují (jsou napojené na silnici a případně na koleje).
  geometry.forEach((g, i) => {
    if (!g.def.needsRoad) {
      working[i] = true;
      return;
    }
    const road = touches(g.x, g.y, g.w, g.h, (c) => roads.has(c));
    const rail = !g.def.needsRail || touches(g.x, g.y, g.w, g.h, (c) => rails.has(c));
    working[i] = road && rail;
  });

  // Zdroje spokojenosti (dekorace, služby, příroda i znečišťovatelé).
  const sources = geometry.filter((g, i) => (g.def.happy ?? 0) !== 0 && (g.def.radius ?? 0) > 0 && working[i]);

  const houseHappiness: (number | undefined)[] = items.map(() => undefined);
  let capacity = 0;
  let rawPopulation = 0;
  let weightedHappy = 0;
  geometry.forEach((g, i) => {
    if (!g.def.housing) return;
    let local = 0;
    for (const s of sources) {
      const dist = Math.hypot(s.cx - g.cx, s.cy - g.cy);
      const radius = s.def.radius!;
      if (dist > radius + 1) continue;
      local += s.def.happy! * HAPPY_SCALE * Math.max(0, 1 - dist / (radius + 1));
    }
    const happy = Math.max(0, Math.min(100, 40 + Math.min(60, local)));
    houseHappiness[i] = happy;
    capacity += g.def.housing;
    if (!working[i]) return;
    const occupancyRate = Math.max(0.25, Math.min(1, 0.25 + 0.75 * (happy / 100)));
    const people = g.def.housing * occupancyRate;
    rawPopulation += people;
    weightedHappy += happy * people;
  });

  let jobs = 0;
  let stations = 0;
  let eduPoints = 0;
  geometry.forEach((g, i) => {
    if (!working[i]) return;
    jobs += g.def.jobs ?? 0;
    eduPoints += g.def.edu ?? 0;
    if (g.def.id === "train_station") stations++;
  });

  const population = Math.floor(rawPopulation);
  const employed = Math.min(population, jobs);
  const unemployed = Math.max(0, population - jobs);
  const baseHappy = rawPopulation > 0 ? weightedHappy / rawPopulation : 40;
  const unemploymentPenalty = population > 0 ? Math.min(15, (unemployed / population) * 30) : 0;
  const happiness = Math.max(0, Math.min(100, baseHappy - unemploymentPenalty));

  const fillRate = jobs > 0 ? Math.min(1, population / jobs) : 0;
  const eduCoverage = Math.min(1, eduPoints / Math.max(1, population / 60));
  const learning = 1 + Math.min(MAX_LEARNING_BONUS, Math.max(0, learningBonus)) * (0.5 + 0.5 * eduCoverage);
  const happyMult = 0.7 + 0.3 * (happiness / 100);
  const transportMult = 1 + 0.05 * Math.min(4, stations);
  let raw = 0;
  geometry.forEach((g, i) => {
    if (!working[i]) return;
    raw += (g.def.jobs ?? 0) * fillRate * (g.def.yield ?? 0);
  });

  return {
    capacity,
    population,
    jobs,
    employed: Math.floor(employed),
    unemployed: Math.floor(unemployed),
    happiness,
    incomePerHour: raw * happyMult * learning * transportMult,
    eduPoints,
    eduCoverage,
    stations,
    working,
    houseHappiness,
    buildings: items.filter(([id]) => !isRoadLike(id) && id !== "rail").length,
  };
}

export function learningBonusFromXp(xpLast24h: number): number {
  return Math.min(MAX_LEARNING_BONUS, Math.max(0, xpLast24h) / 1000);
}

// Dopočítá výdělek od posledního uložení, nejvýš OFFLINE_CAP_HOURS zpětně.
export function settleCity(state: CityState, now: number, learningBonus: number): CityState {
  const hours = Math.min(OFFLINE_CAP_HOURS, Math.max(0, (now - state.lastSeen) / 3_600_000));
  if (hours <= 0) return { ...state, lastSeen: now };
  const earned = Math.floor(computeCity(state, learningBonus).incomePerHour * hours);
  return { ...state, coins: state.coins + earned, totalEarned: state.totalEarned + earned, lastSeen: now };
}
