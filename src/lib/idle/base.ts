// Herní logika Základny (vesmírná stanice). Čistý kód bez databáze a Reactu, stejný výpočet
// běží na serveru (autoritativně) i v prohlížeči (okamžitá odezva při stavění).
//
// Jak Základna funguje:
//  - Moduly se staví na mřížce a fungují, jen když jsou souvisle spojené s velitelským modulem.
//  - Energie: solární panely a reaktory vyrábějí, ostatní moduly spotřebovávají. Při nedostatku
//    klesne výkon všech modulů podle poměru.
//  - Posádka bydlí v ubytování a obsluhuje moduly, na každého člena je potřeba podpora života
//    (skleník dává kyslík a jídlo, recyklace vody vodu, systém podpory života obojí).
//  - Moduly vydělávají kredity a vědu. Věda odemyká cíle a platí se za výzkum.
//  - V loděnici se stavějí lodě, parkují v hangárech a létají na mise k planetám.
//  - Mise běží v reálném čase i když hráč není ve hře. Po návratu přijde krátká otázka k cíli.
//  - Učení pomáhá: XP z posledních 24 hodin, aktivní mazlíček a velikost města zvyšují výdělek.

import type { Locale } from "@/i18n/config";

export type BaseCat = "core" | "energy" | "life" | "science" | "industry" | "ships";

export type ModuleDef = {
  id: string;
  cat: BaseCat;
  size: [number, number];
  cost: number;
  // Cena v bodech z učení (nejdražší moduly). Body se při zbourání nevracejí.
  pointsCost?: number;
  // Úroveň účtu (z XP), od které jde modul postavit.
  level: number;
  // + vyrábí, - spotřebovává energii.
  energy?: number;
  // Kolik členů posádky modul ubytuje a kolik jich potřebuje k provozu.
  housing?: number;
  crew?: number;
  // Kolik členů posádky unese podpora života modulu.
  life?: number;
  // Kredity a věda za hodinu při plném provozu.
  credits?: number;
  science?: number;
  // Počet lodí, které modul zaparkuje.
  slots?: number;
  // Bonus k odměně z misí (anténa).
  missionBonus?: number;
  shipyard?: boolean;
  names: Record<Locale, string>;
};

const n = (cs: string, en: string, de: string, ru: string): Record<Locale, string> => ({ cs, en, de, ru });

export const BASE_SIZE = 16;
export const START_CREDITS = 3000;
export const OFFLINE_CAP_HOURS = 8;
export const MAX_BATCH = 40;
export const REFUND_RATE = 0.5;
export const MAX_LEARNING_BONUS = 0.5;
export const MAX_PET_BONUS = 0.2;
export const MAX_CITY_BONUS = 0.2;
export const MAX_ANTENNAS = 3;
export const MAX_DEBRIEFS = 6;

export const MODULES: ModuleDef[] = [
  { id: "core", cat: "core", size: [2, 2], cost: 0, level: 1, energy: 4, housing: 6, life: 6, credits: 20, names: n("Velitelský modul", "Command module", "Kommandomodul", "Командный модуль") },
  { id: "corridor", cat: "core", size: [1, 1], cost: 10, level: 1, names: n("Chodba", "Corridor", "Korridor", "Коридор") },

  { id: "solar", cat: "energy", size: [2, 1], cost: 120, level: 1, energy: 6, names: n("Solární panely", "Solar panels", "Solarpaneele", "Солнечные панели") },
  { id: "reactor", cat: "energy", size: [2, 2], cost: 1800, pointsCost: 150, level: 6, energy: 30, crew: 2, names: n("Jaderný reaktor", "Nuclear reactor", "Kernreaktor", "Ядерный реактор") },

  { id: "quarters", cat: "life", size: [2, 2], cost: 300, level: 1, energy: -2, housing: 8, names: n("Ubytování", "Quarters", "Unterkünfte", "Жилой модуль") },
  { id: "greenhouse", cat: "life", size: [2, 2], cost: 400, level: 2, energy: -2, crew: 2, life: 6, credits: 14, names: n("Skleník", "Greenhouse", "Gewächshaus", "Оранжерея") },
  { id: "water", cat: "life", size: [1, 2], cost: 350, level: 2, energy: -2, crew: 1, life: 6, names: n("Recyklace vody", "Water recycler", "Wasseraufbereitung", "Переработка воды") },

  { id: "lab", cat: "science", size: [2, 2], cost: 700, level: 3, energy: -4, crew: 3, science: 3, credits: 8, names: n("Laboratoř", "Laboratory", "Labor", "Лаборатория") },
  { id: "observatory", cat: "science", size: [2, 2], cost: 1400, level: 5, energy: -3, crew: 2, science: 5, names: n("Observatoř", "Observatory", "Observatorium", "Обсерватория") },
  { id: "antenna", cat: "science", size: [1, 1], cost: 600, level: 4, energy: -1, crew: 1, missionBonus: 0.08, names: n("Komunikační anténa", "Comms antenna", "Kommunikationsantenne", "Антенна связи") },

  { id: "workshop", cat: "industry", size: [2, 2], cost: 500, level: 2, energy: -3, crew: 3, credits: 24, names: n("Dílna", "Workshop", "Werkstatt", "Мастерская") },
  { id: "trade", cat: "industry", size: [2, 2], cost: 900, level: 4, energy: -3, crew: 4, credits: 40, names: n("Obchodní modul", "Trade module", "Handelsmodul", "Торговый модуль") },

  { id: "hangar", cat: "ships", size: [3, 2], cost: 1000, level: 3, energy: -2, crew: 2, slots: 2, names: n("Hangár", "Hangar", "Hangar", "Ангар") },
  { id: "shipyard", cat: "ships", size: [3, 3], cost: 1600, level: 4, energy: -6, crew: 4, shipyard: true, names: n("Loděnice", "Shipyard", "Werft", "Верфь") },
];

export const BASE_CATS: BaseCat[] = ["core", "energy", "life", "science", "industry", "ships"];

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));
export function getModule(id: string): ModuleDef | undefined {
  return BY_ID.get(id);
}

// --- lodě a cíle ---

export type ShipType = "probe" | "shuttle" | "explorer";

export type ShipDef = {
  id: ShipType;
  tier: 1 | 2 | 3;
  cost: number;
  pointsCost?: number;
  level: number;
  // Čas stavby v minutách a rychlost (cesta trvá základní dobu cíle dělenou rychlostí).
  buildMinutes: number;
  speed: number;
  names: Record<Locale, string>;
};

export const SHIPS: ShipDef[] = [
  { id: "probe", tier: 1, cost: 400, level: 3, buildMinutes: 5, speed: 1, names: n("Sonda", "Probe", "Sonde", "Зонд") },
  { id: "shuttle", tier: 2, cost: 1500, level: 5, buildMinutes: 20, speed: 2, names: n("Raketoplán", "Shuttle", "Raumfähre", "Шаттл") },
  { id: "explorer", tier: 3, cost: 5000, pointsCost: 80, level: 8, buildMinutes: 60, speed: 4, names: n("Průzkumník", "Explorer", "Entdecker", "Исследователь") },
];

const SHIP_BY_ID = new Map(SHIPS.map((s) => [s.id, s]));
export function getShip(id: string): ShipDef | undefined {
  return SHIP_BY_ID.get(id as ShipType);
}

export type DestDef = {
  id: string;
  // Nejnižší třída lodi, která tam doletí.
  tier: 1 | 2 | 3;
  // Základní doba cesty v minutách pro rychlost 1.
  baseMinutes: number;
  credits: number;
  science: number;
  // Cena výzkumu ve vědě (0 = odemčeno od začátku).
  researchCost: number;
  // Správná odpověď otázky po misi (text otázky je v i18n/base.ts).
  quizCorrect: number;
  // Vzdálenost od Slunce pro mapu (v dílcích 0 až 1) a barva planety.
  orbit: number;
  color: string;
  names: Record<Locale, string>;
};

export const DESTINATIONS: DestDef[] = [
  { id: "moon", tier: 1, baseMinutes: 15, credits: 150, science: 3, researchCost: 0, quizCorrect: 1, orbit: 0.22, color: "#c9c9d6", names: n("Měsíc", "The Moon", "Der Mond", "Луна") },
  { id: "venus", tier: 2, baseMinutes: 60, credits: 500, science: 10, researchCost: 25, quizCorrect: 2, orbit: 0.36, color: "#e8c27a", names: n("Venuše", "Venus", "Venus", "Венера") },
  { id: "mars", tier: 2, baseMinutes: 90, credits: 700, science: 14, researchCost: 40, quizCorrect: 0, orbit: 0.5, color: "#d9694a", names: n("Mars", "Mars", "Mars", "Марс") },
  { id: "asteroids", tier: 2, baseMinutes: 120, credits: 1000, science: 18, researchCost: 70, quizCorrect: 3, orbit: 0.62, color: "#9a8f80", names: n("Pás planetek", "Asteroid belt", "Asteroidengürtel", "Пояс астероидов") },
  { id: "europa", tier: 3, baseMinutes: 360, credits: 2600, science: 45, researchCost: 150, quizCorrect: 1, orbit: 0.76, color: "#bfe3f2", names: n("Europa", "Europa", "Europa", "Европа") },
  { id: "saturn", tier: 3, baseMinutes: 480, credits: 3600, science: 60, researchCost: 220, quizCorrect: 2, orbit: 0.9, color: "#e6cf8f", names: n("Saturnovy prstence", "Saturn's rings", "Saturnringe", "Кольца Сатурна") },
];

const DEST_BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));
export function getDest(id: string): DestDef | undefined {
  return DEST_BY_ID.get(id);
}

// --- stav ---

export type Placed = [id: string, x: number, y: number, rot: 0 | 1];

export type Mission = { dest: string; startedAt: number; endsAt: number; credits: number; science: number };
export type Ship = { id: string; type: ShipType; readyAt: number; mission: Mission | null };
export type Debrief = { dest: string; science: number };

export type BaseState = {
  v: 1;
  size: number;
  items: Placed[];
  credits: number;
  science: number;
  totalEarned: number;
  ships: Ship[];
  researched: string[];
  // Co hráč postavil nebo navštívil (Kodex).
  codex: string[];
  debriefs: Debrief[];
  // Stav je dopočítaný do tohoto okamžiku (ms od roku 1970).
  lastSeen: number;
};

export function footprint(def: ModuleDef, rot: 0 | 1): [number, number] {
  return rot === 1 ? [def.size[1], def.size[0]] : def.size;
}

export function startState(now: number): BaseState {
  const mid = Math.floor(BASE_SIZE / 2) - 1;
  return {
    v: 1,
    size: BASE_SIZE,
    items: [["core", mid, mid, 0]],
    credits: START_CREDITS,
    science: 0,
    totalEarned: 0,
    ships: [],
    researched: [],
    codex: ["core"],
    debriefs: [],
    lastSeen: now,
  };
}

const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

function cellIndex(x: number, y: number) {
  return y * BASE_SIZE + x;
}

// Přijme poškozené nebo staré uložení a vždy vrátí platnou základnu.
export function normalizeBase(raw: unknown, now: number): BaseState {
  const base = startState(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<BaseState>;

  const items: Placed[] = [];
  const taken = new Set<number>();
  if (Array.isArray(r.items)) {
    for (const entry of r.items) {
      if (!Array.isArray(entry) || entry.length < 3) continue;
      const [id, x, y, rot] = entry as [unknown, unknown, unknown, unknown];
      const def = typeof id === "string" ? getModule(id) : undefined;
      if (!def || !Number.isInteger(x) || !Number.isInteger(y)) continue;
      const rr: 0 | 1 = rot === 1 ? 1 : 0;
      const [w, h] = footprint(def, rr);
      const px = x as number;
      const py = y as number;
      if (px < 0 || py < 0 || px + w > BASE_SIZE || py + h > BASE_SIZE) continue;
      const cells: number[] = [];
      for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) cells.push(cellIndex(px + dx, py + dy));
      if (cells.some((c) => taken.has(c))) continue;
      for (const c of cells) taken.add(c);
      items.push([def.id, px, py, rr]);
    }
  }
  // Velitelský modul musí být přesně jeden, bez něj se začíná znovu.
  const firstCore = items.findIndex((i) => i[0] === "core");
  const finalItems = firstCore < 0 ? base.items : items.filter((i, index) => i[0] !== "core" || index === firstCore);

  const ships: Ship[] = [];
  if (Array.isArray(r.ships)) {
    for (const s of r.ships.slice(0, 40)) {
      if (!s || typeof s !== "object") continue;
      const sh = s as Partial<Ship>;
      if (typeof sh.id !== "string" || !getShip(String(sh.type))) continue;
      let mission: Mission | null = null;
      const m = sh.mission as Partial<Mission> | null | undefined;
      if (m && typeof m.dest === "string" && getDest(m.dest)) {
        mission = {
          dest: m.dest,
          startedAt: num(m.startedAt, now),
          endsAt: num(m.endsAt, now),
          credits: num(m.credits, 0),
          science: num(m.science, 0),
        };
      }
      ships.push({ id: sh.id.slice(0, 24), type: sh.type as ShipType, readyAt: num(sh.readyAt, 0), mission });
    }
  }
  const strings = (v: unknown, valid: (s: string) => boolean) =>
    Array.isArray(v) ? [...new Set(v.filter((s): s is string => typeof s === "string" && valid(s)))] : [];
  const debriefs: Debrief[] = [];
  if (Array.isArray(r.debriefs)) {
    for (const d of r.debriefs.slice(0, MAX_DEBRIEFS)) {
      const dd = d as Partial<Debrief>;
      if (dd && typeof dd.dest === "string" && getDest(dd.dest)) debriefs.push({ dest: dd.dest, science: num(dd.science, 0) });
    }
  }

  return {
    v: 1,
    size: BASE_SIZE,
    items: finalItems,
    credits: num(r.credits, START_CREDITS),
    science: num(r.science, 0),
    totalEarned: num(r.totalEarned, 0),
    ships,
    researched: strings(r.researched, (s) => !!getDest(s) && getDest(s)!.researchCost > 0),
    codex: strings(r.codex, (s) => !!getModule(s) || !!getDest(s)),
    debriefs,
    lastSeen: num(r.lastSeen, now, 0, now),
  };
}

export type BaseError =
  | "unknown-item"
  | "out-of-bounds"
  | "occupied"
  | "not-enough-credits"
  | "not-enough-points"
  | "not-enough-science"
  | "locked"
  | "nothing-there"
  | "too-many"
  | "only-one-core"
  | "core-protected"
  | "no-shipyard"
  | "no-hangar-slot"
  | "unknown-ship"
  | "unknown-dest"
  | "ship-busy"
  | "ship-not-ready"
  | "ship-too-weak"
  | "dest-locked"
  | "no-mission"
  | "nothing-to-answer"
  | "already-researched";

export type PlaceContext = { level: number; points: number };

export function occupancy(items: Placed[]): Map<number, number> {
  const map = new Map<number, number>();
  items.forEach(([id, x, y, rot], index) => {
    const def = getModule(id);
    if (!def) return;
    const [w, h] = footprint(def, rot);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) map.set(cellIndex(x + dx, y + dy), index);
  });
  return map;
}

export function canPlace(
  state: BaseState,
  id: string,
  x: number,
  y: number,
  rot: 0 | 1,
  ctx: PlaceContext,
  occ: Map<number, number> = occupancy(state.items),
): { ok: true } | { ok: false; error: BaseError } {
  const def = getModule(id);
  if (!def) return { ok: false, error: "unknown-item" };
  if (def.id === "core") return { ok: false, error: "only-one-core" };
  if (!Number.isInteger(x) || !Number.isInteger(y)) return { ok: false, error: "out-of-bounds" };
  const [w, h] = footprint(def, rot);
  if (x < 0 || y < 0 || x + w > BASE_SIZE || y + h > BASE_SIZE) return { ok: false, error: "out-of-bounds" };
  if (def.level > ctx.level) return { ok: false, error: "locked" };
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) if (occ.has(cellIndex(x + dx, y + dy))) return { ok: false, error: "occupied" };
  if (state.credits < def.cost) return { ok: false, error: "not-enough-credits" };
  if ((def.pointsCost ?? 0) > ctx.points) return { ok: false, error: "not-enough-points" };
  return { ok: true };
}

export type BuildOutcome =
  | { ok: true; state: BaseState; pointsSpent: number; placed: number; failed: number; firstError?: BaseError }
  | { ok: false; error: BaseError };

export function buildMany(
  state: BaseState,
  requests: { id: string; x: number; y: number; rot?: 0 | 1 }[],
  ctx: PlaceContext,
): BuildOutcome {
  if (requests.length === 0) return { ok: false, error: "nothing-there" };
  if (requests.length > MAX_BATCH) return { ok: false, error: "too-many" };

  let items = [...state.items];
  let credits = state.credits;
  let points = ctx.points;
  let spent = 0;
  let placed = 0;
  let failed = 0;
  let firstError: BaseError | undefined;
  const codex = new Set(state.codex);
  const occ = occupancy(items);

  for (const req of requests) {
    const rot: 0 | 1 = req.rot === 1 ? 1 : 0;
    const check = canPlace({ ...state, items, credits }, req.id, req.x, req.y, rot, { level: ctx.level, points }, occ);
    if (!check.ok) {
      failed++;
      firstError ??= check.error;
      continue;
    }
    const def = getModule(req.id)!;
    credits -= def.cost;
    points -= def.pointsCost ?? 0;
    spent += def.pointsCost ?? 0;
    items = [...items, [def.id, req.x, req.y, rot]];
    codex.add(def.id);
    const [w, h] = footprint(def, rot);
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) occ.set(cellIndex(req.x + dx, req.y + dy), items.length - 1);
    placed++;
  }

  if (placed === 0) return { ok: false, error: firstError ?? "occupied" };
  return { ok: true, state: { ...state, items, credits, codex: [...codex] }, pointsSpent: spent, placed, failed, firstError };
}

export function demolishAt(
  state: BaseState,
  tiles: { x: number; y: number }[],
): { ok: true; state: BaseState; removed: number; refund: number } | { ok: false; error: BaseError } {
  if (tiles.length > MAX_BATCH) return { ok: false, error: "too-many" };
  const occ = occupancy(state.items);
  const remove = new Set<number>();
  let touchedCore = false;
  for (const t of tiles) {
    if (!Number.isInteger(t.x) || !Number.isInteger(t.y)) continue;
    const index = occ.get(cellIndex(t.x, t.y));
    if (index === undefined) continue;
    if (state.items[index][0] === "core") {
      touchedCore = true;
      continue;
    }
    remove.add(index);
  }
  if (remove.size === 0) return { ok: false, error: touchedCore ? "core-protected" : "nothing-there" };
  let refund = 0;
  const items = state.items.filter((entry, index) => {
    if (!remove.has(index)) return true;
    refund += Math.floor((getModule(entry[0])?.cost ?? 0) * REFUND_RATE);
    return false;
  });
  // Lodě, které už nemají hangár, se vrátí domů (stačí kapacita, přebytek zůstane stát v doku).
  return { ok: true, state: { ...state, items, credits: state.credits + refund }, removed: remove.size, refund };
}

// --- výpočet základny ---

export type BaseStats = {
  energyProduced: number;
  energyUsed: number;
  powerFactor: number;
  housing: number;
  crewNeeded: number;
  crewFactor: number;
  lifeCapacity: number;
  lifeFactor: number;
  // Součin všech omezení výkonu, 0 až 1.
  efficiency: number;
  creditsPerHour: number;
  sciencePerHour: number;
  slots: number;
  shipyards: number;
  antennas: number;
  missionBonus: number;
  // Index v state.items -> true, pokud je modul spojený s velitelským modulem.
  connected: boolean[];
  modules: number;
};

function bonusMultiplier(bonus: Bonus): number {
  return 1 + Math.min(MAX_LEARNING_BONUS, Math.max(0, bonus.learning)) + Math.min(MAX_PET_BONUS, Math.max(0, bonus.pet)) + Math.min(MAX_CITY_BONUS, Math.max(0, bonus.city));
}

export type Bonus = { learning: number; pet: number; city: number };
export const NO_BONUS: Bonus = { learning: 0, pet: 0, city: 0 };

// Bonus za učení: každých 100 XP získaných za posledních 24 hodin dá +10 %.
export function learningBonusFromXp(xpLast24h: number): number {
  return Math.min(MAX_LEARNING_BONUS, Math.max(0, xpLast24h) / 1000);
}

// Aktivní mazlíček: +2 % za úroveň (úroveň 1 až 10).
export function petBonusFromLevel(level: number | null): number {
  return level ? Math.min(MAX_PET_BONUS, level * 0.02) : 0;
}

// Město: +1 % za každých 10 budov.
export function cityBonusFromBuildings(buildings: number): number {
  return Math.min(MAX_CITY_BONUS, Math.floor(Math.max(0, buildings) / 10) * 0.01);
}

// Souvislé moduly: z velitelského modulu se šíří přes sousedící políčka.
export function connectedModules(items: Placed[]): boolean[] {
  const occ = occupancy(items);
  const result = items.map(() => false);
  const core = items.findIndex((i) => i[0] === "core");
  if (core < 0) return result;
  const queue = [core];
  result[core] = true;
  while (queue.length) {
    const index = queue.pop()!;
    const [id, x, y, rot] = items[index];
    const def = getModule(id)!;
    const [w, h] = footprint(def, rot);
    for (let dx = -1; dx <= w; dx++) {
      for (let dy = -1; dy <= h; dy++) {
        const inside = dx >= 0 && dx < w && dy >= 0 && dy < h;
        const corner = (dx === -1 || dx === w) && (dy === -1 || dy === h);
        if (inside || corner) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= BASE_SIZE || ny >= BASE_SIZE) continue;
        const other = occ.get(cellIndex(nx, ny));
        if (other !== undefined && !result[other]) {
          result[other] = true;
          queue.push(other);
        }
      }
    }
  }
  return result;
}

export function computeBase(state: BaseState, bonus: Bonus = NO_BONUS): BaseStats {
  const connected = connectedModules(state.items);
  let energyProduced = 0;
  let energyUsed = 0;
  let housing = 0;
  let crewNeeded = 0;
  let lifeCapacity = 0;
  let slots = 0;
  let shipyards = 0;
  let antennas = 0;
  let modules = 0;
  state.items.forEach(([id], i) => {
    const def = getModule(id);
    if (!def || !connected[i]) return;
    modules++;
    const e = def.energy ?? 0;
    if (e > 0) energyProduced += e;
    else energyUsed += -e;
    housing += def.housing ?? 0;
    crewNeeded += def.crew ?? 0;
    lifeCapacity += def.life ?? 0;
    slots += def.slots ?? 0;
    if (def.shipyard) shipyards++;
    if (def.missionBonus) antennas++;
  });
  const powerFactor = energyUsed > 0 ? Math.min(1, energyProduced / energyUsed) : 1;
  const crewFactor = crewNeeded > 0 ? Math.min(1, housing / crewNeeded) : 1;
  const crewInUse = Math.min(housing, crewNeeded);
  const lifeFactor = crewInUse > 0 ? Math.min(1, lifeCapacity / crewInUse) : 1;
  const efficiency = powerFactor * crewFactor * lifeFactor;
  const mult = bonusMultiplier(bonus);

  let credits = 0;
  let science = 0;
  state.items.forEach(([id], i) => {
    const def = getModule(id);
    if (!def || !connected[i]) return;
    credits += (def.credits ?? 0) * efficiency;
    science += (def.science ?? 0) * efficiency;
  });
  return {
    energyProduced,
    energyUsed,
    powerFactor,
    housing,
    crewNeeded,
    crewFactor,
    lifeCapacity,
    lifeFactor,
    efficiency,
    creditsPerHour: credits * mult,
    sciencePerHour: science * mult,
    slots,
    shipyards,
    antennas,
    missionBonus: Math.min(MAX_ANTENNAS, antennas) * 0.08,
    connected,
    modules,
  };
}

// Dopočítá výdělek od posledního uložení, nejvýš offlineCap hodin zpětně.
export function settleBase(state: BaseState, now: number, bonus: Bonus = NO_BONUS): BaseState {
  const elapsed = Math.max(0, (now - state.lastSeen) / 3_600_000);
  const hours = Math.min(elapsed, OFFLINE_CAP_HOURS);
  const next: BaseState = { ...state, lastSeen: now };
  if (hours <= 0) return next;
  const stats = computeBase(state, bonus);
  const credits = Math.floor(stats.creditsPerHour * hours);
  const science = Math.floor(stats.sciencePerHour * hours);
  next.credits = state.credits + credits;
  next.science = state.science + science;
  next.totalEarned = state.totalEarned + credits;
  return next;
}

// --- lodě a mise ---

let shipCounter = 0;
function newShipId(now: number): string {
  shipCounter = (shipCounter + 1) % 1000;
  return `s${now.toString(36)}${shipCounter.toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export function buildShip(
  state: BaseState,
  type: unknown,
  ctx: PlaceContext,
  now: number,
  bonus: Bonus = NO_BONUS,
): { ok: true; state: BaseState; pointsSpent: number } | { ok: false; error: BaseError } {
  const def = typeof type === "string" ? getShip(type) : undefined;
  if (!def) return { ok: false, error: "unknown-ship" };
  if (def.level > ctx.level) return { ok: false, error: "locked" };
  const stats = computeBase(state, bonus);
  if (stats.shipyards < 1) return { ok: false, error: "no-shipyard" };
  if (state.ships.length >= stats.slots) return { ok: false, error: "no-hangar-slot" };
  if (state.credits < def.cost) return { ok: false, error: "not-enough-credits" };
  if ((def.pointsCost ?? 0) > ctx.points) return { ok: false, error: "not-enough-points" };
  const ship: Ship = { id: newShipId(now), type: def.id, readyAt: now + def.buildMinutes * 60_000, mission: null };
  return {
    ok: true,
    pointsSpent: def.pointsCost ?? 0,
    state: { ...state, credits: state.credits - def.cost, ships: [...state.ships, ship] },
  };
}

export function researchDest(state: BaseState, destId: unknown): { ok: true; state: BaseState } | { ok: false; error: BaseError } {
  const dest = typeof destId === "string" ? getDest(destId) : undefined;
  if (!dest) return { ok: false, error: "unknown-dest" };
  if (dest.researchCost === 0 || state.researched.includes(dest.id)) return { ok: false, error: "already-researched" };
  if (state.science < dest.researchCost) return { ok: false, error: "not-enough-science" };
  return { ok: true, state: { ...state, science: state.science - dest.researchCost, researched: [...state.researched, dest.id] } };
}

export function isUnlocked(state: BaseState, dest: DestDef): boolean {
  return dest.researchCost === 0 || state.researched.includes(dest.id);
}

export function missionDurationMs(dest: DestDef, ship: ShipDef): number {
  return Math.round((dest.baseMinutes * 60_000) / ship.speed);
}

export function launchMission(
  state: BaseState,
  shipId: unknown,
  destId: unknown,
  now: number,
  bonus: Bonus = NO_BONUS,
): { ok: true; state: BaseState } | { ok: false; error: BaseError } {
  const dest = typeof destId === "string" ? getDest(destId) : undefined;
  if (!dest) return { ok: false, error: "unknown-dest" };
  const index = state.ships.findIndex((s) => s.id === shipId);
  if (index < 0) return { ok: false, error: "unknown-ship" };
  const ship = state.ships[index];
  const def = getShip(ship.type)!;
  if (ship.mission) return { ok: false, error: "ship-busy" };
  if (ship.readyAt > now) return { ok: false, error: "ship-not-ready" };
  if (def.tier < dest.tier) return { ok: false, error: "ship-too-weak" };
  if (!isUnlocked(state, dest)) return { ok: false, error: "dest-locked" };
  const stats = computeBase(state, bonus);
  const mult = bonusMultiplier(bonus) + stats.missionBonus;
  const mission: Mission = {
    dest: dest.id,
    startedAt: now,
    endsAt: now + missionDurationMs(dest, def),
    credits: Math.round(dest.credits * mult),
    science: Math.round(dest.science * mult),
  };
  const ships = state.ships.map((s, i) => (i === index ? { ...s, mission } : s));
  return { ok: true, state: { ...state, ships } };
}

// Vyzvedne všechny mise, které už dorazily. Každá přidá odměnu, záznam do Kodexu a otázku.
export function collectMissions(
  state: BaseState,
  now: number,
): { ok: true; state: BaseState; collected: number } | { ok: false; error: BaseError } {
  let credits = state.credits;
  let science = state.science;
  let earned = state.totalEarned;
  const codex = new Set(state.codex);
  const debriefs = [...state.debriefs];
  let collected = 0;
  const ships = state.ships.map((s) => {
    if (!s.mission || s.mission.endsAt > now) return s;
    credits += s.mission.credits;
    science += s.mission.science;
    earned += s.mission.credits;
    codex.add(s.mission.dest);
    if (debriefs.length < MAX_DEBRIEFS) debriefs.push({ dest: s.mission.dest, science: Math.max(1, Math.round(s.mission.science * 0.5)) });
    collected++;
    return { ...s, mission: null };
  });
  if (collected === 0) return { ok: false, error: "no-mission" };
  return { ok: true, state: { ...state, credits, science, totalEarned: earned, ships, codex: [...codex], debriefs }, collected };
}

// Odpověď na otázku po misi. Správná dá bonus vědy, špatná jen ukáže správné vysvětlení.
export function answerDebrief(
  state: BaseState,
  choice: unknown,
): { ok: true; state: BaseState; correct: boolean; correctIndex: number; dest: string; science: number } | { ok: false; error: BaseError } {
  const first = state.debriefs[0];
  if (!first) return { ok: false, error: "nothing-to-answer" };
  const dest = getDest(first.dest)!;
  const correct = choice === dest.quizCorrect;
  return {
    ok: true,
    correct,
    correctIndex: dest.quizCorrect,
    dest: dest.id,
    science: correct ? first.science : 0,
    state: { ...state, science: state.science + (correct ? first.science : 0), debriefs: state.debriefs.slice(1) },
  };
}
