// Herní logika Mazlíčků. Čistý kód bez databáze a Reactu: stejný výpočet běží na
// serveru (autoritativně) i v prohlížeči (jen pro plynulé zobrazení výdělku).
// Čas se nikdy nebere ze "hodin hráče", vždy ho dodá volající.

export type SpeciesId = "cat" | "dog" | "bunny" | "fox" | "dragon" | "hamster" | "panda" | "penguin" | "frog" | "unicorn" | "robot";

export const SPECIES: { id: SpeciesId; pointsCost: number }[] = [
  { id: "cat", pointsCost: 0 },
  { id: "dog", pointsCost: 0 },
  { id: "bunny", pointsCost: 0 },
  { id: "fox", pointsCost: 150 },
  { id: "dragon", pointsCost: 500 },
  { id: "hamster", pointsCost: 100 },
  { id: "panda", pointsCost: 200 },
  { id: "penguin", pointsCost: 250 },
  { id: "frog", pointsCost: 300 },
  { id: "unicorn", pointsCost: 700 },
  { id: "robot", pointsCost: 900 },
];

export type UpgradeId = "bowl" | "toys" | "bed" | "playground" | "school";
export const UPGRADES: UpgradeId[] = ["bowl", "toys", "bed", "playground", "school"];
export const MAX_UPGRADE_LEVEL = 5;

export type PetStats = {
  name: string;
  growth: number;
  hunger: number; // 0..100, 100 = syté
  happy: number; // 0..100
  // Doplněk z obchodu, který mazlíček nosí (ref z katalogu, např. "crown").
  accessory: string | null;
};

export type PetGameState = {
  v: 1;
  active: SpeciesId | null;
  pets: Partial<Record<SpeciesId, PetStats>>;
  coins: number;
  totalEarned: number;
  upgrades: Record<UpgradeId, number>;
  // Stav je dopočítaný do tohoto okamžiku (ms od roku 1970).
  lastSeen: number;
  lastPlayAt: number;
};

export const MAX_LEVEL = 10;
export const MAX_NAME_LENGTH = 16;
export const PLAY_COOLDOWN_MS = 2 * 60 * 1000;
export const TREAT_POINTS_COST = 20;
export const FEED_GROWTH = 6;
export const PLAY_GROWTH = 6;
export const TREAT_GROWTH = 30;
export const MAX_LEARNING_BONUS = 0.5;
export const EVENT_CAP = 0.3;

const BASE_OFFLINE_HOURS = 6;
const OFFLINE_HOURS_PER_BED = 3;
const SIMULATION_STEPS = 12;

export function isSpecies(value: unknown): value is SpeciesId {
  return SPECIES.some((s) => s.id === value);
}

export function emptyState(now: number): PetGameState {
  return {
    v: 1,
    active: null,
    pets: {},
    coins: 0,
    totalEarned: 0,
    upgrades: { bowl: 0, toys: 0, bed: 0, playground: 0, school: 0 },
    lastSeen: now,
    lastPlayAt: 0,
  };
}

// Dokáže přijmout i staré nebo poškozené uložení a vždy vrátí platný stav.
export function normalizeState(raw: unknown, now: number): PetGameState {
  const base = emptyState(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PetGameState>;
  const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

  const pets: PetGameState["pets"] = {};
  for (const s of SPECIES) {
    const p = (r.pets as Record<string, Partial<PetStats>> | undefined)?.[s.id];
    if (!p) continue;
    pets[s.id] = {
      name: typeof p.name === "string" ? p.name.slice(0, MAX_NAME_LENGTH) : "",
      growth: num(p.growth, 0),
      hunger: num(p.hunger, 100, 0, 100),
      happy: num(p.happy, 100, 0, 100),
      accessory: typeof p.accessory === "string" && /^[a-z-]{1,24}$/.test(p.accessory) ? p.accessory : null,
    };
  }
  const active = isSpecies(r.active) && pets[r.active] ? r.active : null;

  return {
    v: 1,
    active,
    pets,
    coins: num(r.coins, 0),
    totalEarned: num(r.totalEarned, 0),
    upgrades: {
      bowl: num(r.upgrades?.bowl, 0, 0, MAX_UPGRADE_LEVEL),
      toys: num(r.upgrades?.toys, 0, 0, MAX_UPGRADE_LEVEL),
      bed: num(r.upgrades?.bed, 0, 0, MAX_UPGRADE_LEVEL),
      playground: num(r.upgrades?.playground, 0, 0, MAX_UPGRADE_LEVEL),
      school: num(r.upgrades?.school, 0, 0, MAX_UPGRADE_LEVEL),
    },
    lastSeen: num(r.lastSeen, now, 0, now),
    lastPlayAt: num(r.lastPlayAt, 0),
  };
}

export function growthForLevel(level: number): number {
  return 20 * (level - 1) * (level - 1);
}

export function levelFromGrowth(growth: number): number {
  return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, growth) / 20)) + 1);
}

export function stageFromLevel(level: number): 1 | 2 | 3 {
  return level >= 6 ? 3 : level >= 3 ? 2 : 1;
}

export type LevelInfo = { level: number; percent: number; intoLevel: number; needed: number; maxed: boolean };

export function levelInfo(growth: number): LevelInfo {
  const level = levelFromGrowth(growth);
  if (level >= MAX_LEVEL) return { level, percent: 100, intoLevel: 0, needed: 0, maxed: true };
  const start = growthForLevel(level);
  const needed = growthForLevel(level + 1) - start;
  const intoLevel = growth - start;
  return { level, percent: Math.round((intoLevel / needed) * 100), intoLevel, needed, maxed: false };
}

export function hungerDecayPerHour(state: PetGameState): number {
  return 8 * (1 - 0.12 * state.upgrades.bowl);
}

export const HAPPY_DECAY_PER_HOUR = 6;

// Hřiště: každá úroveň zkrátí pauzu mezi hrami o 14 % (na nejvyšší úrovni zbývá 30 %).
export function playCooldownMs(state: PetGameState): number {
  return Math.round(PLAY_COOLDOWN_MS * (1 - 0.14 * state.upgrades.playground));
}

// Škola: každá úroveň zesílí vliv učení na výdělek o 20 % (na nejvyšší úrovni dvojnásobně).
export function learningPower(state: PetGameState): number {
  return 1 + 0.2 * state.upgrades.school;
}

export function offlineCapHours(state: PetGameState): number {
  return BASE_OFFLINE_HOURS + OFFLINE_HOURS_PER_BED * state.upgrades.bed;
}

// Mince za hodinu pro dané hodnoty. learningBonus je 0..MAX_LEARNING_BONUS.
export function incomePerHour(
  state: PetGameState,
  stats: PetStats,
  learningBonus: number,
  eventBonus = 0,
): number {
  const level = levelFromGrowth(stats.growth);
  const base = 20 + 12 * (level - 1);
  const hungerFactor = stats.hunger <= 0 ? 0 : stats.hunger < 25 ? 0.5 : 1;
  const happyFactor = 0.6 + 0.4 * (stats.happy / 100);
  const toys = 1 + 0.15 * state.upgrades.toys;
  const learning = 1 + Math.min(MAX_LEARNING_BONUS, Math.max(0, learningBonus)) * learningPower(state);
  return base * hungerFactor * happyFactor * toys * learning * (1 + Math.min(EVENT_CAP, Math.max(0, eventBonus)));
}

export function currentIncomePerHour(state: PetGameState, learningBonus: number, eventBonus = 0): number {
  const stats = state.active ? state.pets[state.active] : undefined;
  return stats ? incomePerHour(state, stats, learningBonus, eventBonus) : 0;
}

// Bonus za učení: každých 100 XP získaných za posledních 24 hodin dá +10 %.
export function learningBonusFromXp(xpLast24h: number): number {
  return Math.min(MAX_LEARNING_BONUS, Math.max(0, xpLast24h) / 1000);
}

// Dopočítá výdělek a hlad/spokojenost od posledního uložení. Maximálně
// offlineCapHours hodin zpětně, zbytek je ztracený (aby hra nebyla povinnost).
export function settle(state: PetGameState, now: number, learningBonus: number, eventBonus = 0): PetGameState {
  const next: PetGameState = {
    ...state,
    pets: { ...state.pets },
    upgrades: { ...state.upgrades },
    lastSeen: now,
  };
  const elapsedHours = Math.max(0, (now - state.lastSeen) / 3_600_000);
  const hours = Math.min(elapsedHours, offlineCapHours(state));
  const active = state.active;
  const stats = active ? state.pets[active] : undefined;
  if (!active || !stats || hours <= 0) return next;

  const dt = hours / SIMULATION_STEPS;
  let { hunger, happy } = stats;
  let earned = 0;
  for (let i = 0; i < SIMULATION_STEPS; i++) {
    earned += incomePerHour(state, { ...stats, hunger, happy }, learningBonus, eventBonus) * dt;
    hunger = Math.max(0, hunger - hungerDecayPerHour(state) * dt);
    happy = Math.max(0, happy - HAPPY_DECAY_PER_HOUR * dt);
  }
  const gained = Math.floor(earned);
  next.pets[active] = { ...stats, hunger, happy };
  next.coins = state.coins + gained;
  next.totalEarned = state.totalEarned + gained;
  return next;
}

export function feedCost(level: number): number {
  return 10 + 2 * level;
}

export function upgradeCost(level: number): number {
  return Math.round(60 * Math.pow(1.8, level));
}

export type ActionResult =
  | { ok: true; state: PetGameState; pointsSpent?: number }
  | { ok: false; error: ErrorCode };

export type ErrorCode =
  | "no-pet"
  | "not-enough-coins"
  | "not-enough-points"
  | "cooldown"
  | "max-level"
  | "unknown-species"
  | "unknown-upgrade"
  | "invalid-name"
  | "not-owned"
  | "no-item";

function withActive(state: PetGameState): { active: SpeciesId; stats: PetStats } | null {
  const active = state.active;
  const stats = active ? state.pets[active] : undefined;
  return active && stats ? { active, stats } : null;
}

export function feed(state: PetGameState): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  const cost = feedCost(levelFromGrowth(pet.stats.growth));
  if (state.coins < cost) return { ok: false, error: "not-enough-coins" };
  return {
    ok: true,
    state: {
      ...state,
      coins: state.coins - cost,
      pets: {
        ...state.pets,
        [pet.active]: {
          ...pet.stats,
          hunger: Math.min(100, pet.stats.hunger + 35),
          growth: pet.stats.growth + FEED_GROWTH,
        },
      },
    },
  };
}

export function play(state: PetGameState, now: number): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  if (now - state.lastPlayAt < playCooldownMs(state)) return { ok: false, error: "cooldown" };
  return {
    ok: true,
    state: {
      ...state,
      lastPlayAt: now,
      pets: {
        ...state.pets,
        [pet.active]: {
          ...pet.stats,
          happy: Math.min(100, pet.stats.happy + 30),
          growth: pet.stats.growth + PLAY_GROWTH,
        },
      },
    },
  };
}

// Pamlsek se platí body z učení; volající je musí atomicky strhnout z účtu.
// Krmení úrodou z farmy: růst podle ceny položky (drahá surovina nakrmí víc), nejvýš jako pamlsek za body.
export function farmFeedGrowth(price: number): number {
  return Math.max(2, Math.min(20, Math.round(price / 3)));
}

export function feedWithFarm(state: PetGameState, itemPrice: number): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  return {
    ok: true,
    state: {
      ...state,
      pets: {
        ...state.pets,
        [pet.active]: {
          ...pet.stats,
          hunger: Math.min(100, pet.stats.hunger + 25),
          happy: Math.min(100, pet.stats.happy + 5),
          growth: pet.stats.growth + farmFeedGrowth(itemPrice),
        },
      },
    },
  };
}

export function treat(state: PetGameState): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  return {
    ok: true,
    pointsSpent: TREAT_POINTS_COST,
    state: {
      ...state,
      pets: {
        ...state.pets,
        [pet.active]: {
          ...pet.stats,
          hunger: 100,
          happy: Math.min(100, pet.stats.happy + 40),
          growth: pet.stats.growth + TREAT_GROWTH,
        },
      },
    },
  };
}

export function buyUpgrade(state: PetGameState, id: unknown): ActionResult {
  if (!UPGRADES.includes(id as UpgradeId)) return { ok: false, error: "unknown-upgrade" };
  const upgrade = id as UpgradeId;
  const level = state.upgrades[upgrade];
  if (level >= MAX_UPGRADE_LEVEL) return { ok: false, error: "max-level" };
  const cost = upgradeCost(level);
  if (state.coins < cost) return { ok: false, error: "not-enough-coins" };
  return {
    ok: true,
    state: {
      ...state,
      coins: state.coins - cost,
      upgrades: { ...state.upgrades, [upgrade]: level + 1 },
    },
  };
}

// Vybrat mazlíčka. Nového druhu se zdarma drží jen první tři; ostatní se
// kupují za body z učení (pointsAvailable) a pak zůstanou navždy odemčené.
export function adopt(state: PetGameState, species: unknown, pointsAvailable: number): ActionResult {
  if (!isSpecies(species)) return { ok: false, error: "unknown-species" };
  if (state.pets[species]) return { ok: true, state: { ...state, active: species } };
  const cost = SPECIES.find((s) => s.id === species)!.pointsCost;
  if (cost > pointsAvailable) return { ok: false, error: "not-enough-points" };
  return {
    ok: true,
    pointsSpent: cost > 0 ? cost : undefined,
    state: {
      ...state,
      active: species,
      pets: { ...state.pets, [species]: { name: "", growth: 0, hunger: 100, happy: 100, accessory: null } },
    },
  };
}

export function rename(state: PetGameState, name: unknown): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  if (typeof name !== "string") return { ok: false, error: "invalid-name" };
  const clean = name.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, MAX_NAME_LENGTH);
  if (clean.length === 0) return { ok: false, error: "invalid-name" };
  return {
    ok: true,
    state: { ...state, pets: { ...state.pets, [pet.active]: { ...pet.stats, name: clean } } },
  };
}

// Nasadí nebo sundá doplněk. Smí jen ten, který hráč koupil (owned = ref z klíčů "pet:<ref>").
export function setAccessory(state: PetGameState, accessory: unknown, owned: string[]): ActionResult {
  const pet = withActive(state);
  if (!pet) return { ok: false, error: "no-pet" };
  if (accessory !== null && (typeof accessory !== "string" || !owned.includes(accessory))) {
    return { ok: false, error: "not-owned" };
  }
  return {
    ok: true,
    state: { ...state, pets: { ...state.pets, [pet.active]: { ...pet.stats, accessory } } },
  };
}

export function moodOf(stats: PetStats): "happy" | "ok" | "sad" | "hungry" {
  if (stats.hunger < 25) return "hungry";
  if (stats.happy < 30) return "sad";
  return stats.happy >= 70 && stats.hunger >= 50 ? "happy" : "ok";
}
