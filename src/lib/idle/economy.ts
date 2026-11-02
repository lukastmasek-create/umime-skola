// Herní logika Ekonomiky (nekonečná hra o bohatství). Čistý kód bez databáze a Reactu:
// stejný výpočet běží na serveru (autoritativně) i v prohlížeči (živý odpočet peněz).
//
// Jak Ekonomika funguje:
//  - Hráč si vytvoří postavu (země, jméno, město, doba, rodina). To určuje startovní peníze a drobné bonusy.
//  - Peníze plynou v reálném čase, mimo hru jen chvíli (MAX_OFFLINE_MIN minut): plat z práce, zisk firem,
//    nájmy z nemovitostí, úroky z cenných papírů.
//  - Práce: 60 % platu běží pasivně. Zbylých 40 % vydělávají směny: 3 rozhodnutí, každé s jiným výkonem.
//    Výkon dává body práce, z bodů se odemykají stupně a žádost o povýšení. Energie směny omezuje.
//  - Vzdělání odemyká povolání. Dovolená, nemoc, prémie, vyjednání platu a krize v oboru hru doplňují.
//  - Firmy: stavíš a rozšiřuješ podniky a najímáš do nich zaměstnance (stojí mzdu, zvyšují výnos).
//  - Investice: akcie, kovy, kryptoměny (ceny kolísají podle času, stejně na serveru i v prohlížeči),
//    nemovitosti, cenné papíry a arbitráž.
//  - Hustle: reselling, flipování domů a aut. Vložíš kapitál, po čase si vybereš výsledek (může i prodělat).
//  - Body z učení se dají investovat do Vzdělání (trvalý bonus ke všem příjmům). Aktivní učení za posledních
//    24 hodin dává navíc dočasné zrychlení.
//  - Kdykoliv můžeš začít znovu. Rekordní jmění a počet pokusů zůstávají.

// Hra je na aktivní hraní: mimo hru peníze běží jen chvíli a všechno ostatní je svižné.
export const MAX_OFFLINE_MIN = 15;
// Násobek všech příjmů a výdajů za hodinu (hodinové sazby níž jsou zachované, jen se rychleji "točí").
export const INCOME_SPEED = 20;
export const MAX_NAME = 20;
export const MAX_COMPANY_UNITS = 50;
export const MAX_EDU = 25;
export const EDU_BONUS_PER_LEVEL = 0.04;
export const MAX_LEARNING_BONUS = 0.5;
// Hodiny v práci dřív určovaly stupeň. Zůstávají kvůli převodu starých uložených her.
export const JOB_RANK_HOURS = 0.25;
export const MAX_JOB_RANK = 5;
export const JOB_RANK_BONUS = 0.15;
export const ARB_COOLDOWN_MS = 60_000;
export const ARB_FEE = 0.005;
export const ARB_CAP = 100_000;
const H = 3_600_000;
const DAY = 24 * H;

// --- Práce: směny, energie, kariéra ---

export const PERF_MAX = 100;
export const ENERGY_MAX = 100;
export const ENERGY_PER_HOUR = 8;
export const SITUATIONS_PER_SHIFT = 3;
export const SITUATION_ENERGY = 10;
export const SHIFT_MIN_ENERGY = 30;
export const LEAD_EXTRA_ENERGY = 10;
export const SHIFT_COOLDOWN_MS = 2 * 60_000;
export const SHIFT_PAY_HOURS = 2;
// Podíl platu, který běží pasivně. Zbytek jde do směn.
export const PASSIVE_SHARE = 0.6;
// Body potřebné k dalšímu stupni: RANK_POINTS[stupeň − 1] (stupeň 1 → 2 chce 50 bodů).
export const RANK_POINTS = [0, 50, 150, 400, 900];
export const PROMO_RETRY_MS = H;
export const PROMO_MIN_RANK_MS = 2 * H;
export const PROMO_BASE = 60;
export const PROMO_PER_PERF = 0.3;
export const PROMO_MAX = 90;
export const LEAD_MIN_RANK = 4;
export const LEAD_PAY = 1.05;
export const RAISE_COOLDOWN_MS = 7 * DAY;
export const RAISE_BASE = 40;
export const RAISE_PER_PERF = 0.5;
export const RAISE_SENIOR_PENALTY = 10;
export const RAISE_MAX = 2;
export const BONUS_SHARE = 0.1;
export const BONUS_MS = DAY;
export const REST_COOLDOWN_MS = 6 * H;
export const VACATION_MS = DAY;
export const VACATION_PAY = 0.5;
export const VACATION_MAX = 2;
export const VACATION_WINDOW_MS = 30 * DAY;
export const SICK_CHANCE = 0.03;
export const CRISIS_CHANCE = 0.02;
export const CRISIS_DELAY_MS = DAY;
export const CRISIS_MS = 7 * DAY;
export const CRISIS_SALARY = 0.9;
// Výkon pod BAD_PERF se počítá jako špatná směna. Po DISMISS_STREAK takových za sebou přijde varování,
// a když je po varování dalších DISMISS_STREAK špatných směn, přijde výpověď. Jedna dobrá směna varování ruší.
export const BAD_PERF = 30;
export const DISMISS_STREAK = 5;
export const COMPANY_STAFF_MAX = 5;
export const STAFF_BOOST = 0.06;
export const STAFF_HIRE_HOURS = 2;
export const STAFF_WAGE = 60;

// --- Postava ---

export const COUNTRIES = ["cz", "sk", "de", "us", "gb", "jp"] as const;
export const CITIES = ["village", "town", "city", "metropolis"] as const;
export const ERAS = ["1990", "2010", "2025", "2050"] as const;
export const FAMILIES = ["poor", "middle", "rich", "business"] as const;
export type CountryId = (typeof COUNTRIES)[number];
export type CityId = (typeof CITIES)[number];
export type EraId = (typeof ERAS)[number];
export type FamilyId = (typeof FAMILIES)[number];

// salary = násobek platu, living = násobek životních nákladů
export const COUNTRY_DEF: Record<CountryId, { currency: string; salary: number; living: number }> = {
  cz: { currency: "Kč", salary: 1, living: 1 },
  sk: { currency: "€", salary: 1, living: 0.95 },
  de: { currency: "€", salary: 1.1, living: 1.1 },
  us: { currency: "$", salary: 1.15, living: 1.15 },
  gb: { currency: "£", salary: 1.1, living: 1.15 },
  jp: { currency: "¥", salary: 1.05, living: 1.05 },
};
// rent = násobek nájmů z nemovitostí
export const CITY_DEF: Record<CityId, { salary: number; living: number; rent: number }> = {
  village: { salary: 0.9, living: 0.6, rent: 0.8 },
  town: { salary: 1, living: 0.85, rent: 0.95 },
  city: { salary: 1.15, living: 1.1, rent: 1.15 },
  metropolis: { salary: 1.3, living: 1.5, rent: 1.4 },
};
// Doba: násobek startovních peněz a od jaké chvíle existují digitální obory.
export const ERA_DEF: Record<EraId, { start: number; digital: boolean; crypto: boolean }> = {
  "1990": { start: 0.6, digital: false, crypto: false },
  "2010": { start: 1, digital: true, crypto: true },
  "2025": { start: 1, digital: true, crypto: true },
  "2050": { start: 1.5, digital: true, crypto: true },
};
// start = startovní peníze, living = životní náklady, cost = násobek cen firem
export const FAMILY_DEF: Record<FamilyId, { start: number; living: number; company: number }> = {
  poor: { start: 100, living: 0.8, company: 1 },
  middle: { start: 300, living: 1, company: 1 },
  rich: { start: 1500, living: 1.4, company: 1 },
  business: { start: 500, living: 1, company: 0.9 },
};

export type Character = { country: CountryId; name: string; city: CityId; era: EraId; family: FamilyId };

// --- Práce ---

export type JobId =
  | "warehouse"
  | "seller"
  | "farmer"
  | "cook"
  | "firefighter"
  | "police"
  | "teacher"
  | "journalist"
  | "vet"
  | "architect"
  | "programmer"
  | "pilot"
  | "doctor"
  | "banker";
// salary = plat za hodinu (stupeň 1), fee = jednorázový poplatek za kurzy / nástup, edu = potřebné Vzdělání
export type JobDef = { id: JobId; salary: number; fee: number; edu: number };
export const JOBS: JobDef[] = [
  { id: "warehouse", salary: 40, fee: 0, edu: 0 },
  { id: "seller", salary: 60, fee: 100, edu: 1 },
  { id: "farmer", salary: 70, fee: 150, edu: 1 },
  { id: "cook", salary: 90, fee: 300, edu: 2 },
  { id: "firefighter", salary: 120, fee: 500, edu: 4 },
  { id: "police", salary: 140, fee: 800, edu: 5 },
  { id: "teacher", salary: 180, fee: 1_200, edu: 6 },
  { id: "journalist", salary: 200, fee: 1_500, edu: 6 },
  { id: "vet", salary: 320, fee: 3_000, edu: 8 },
  { id: "architect", salary: 400, fee: 4_000, edu: 9 },
  { id: "programmer", salary: 480, fee: 6_000, edu: 10 },
  { id: "pilot", salary: 550, fee: 7_000, edu: 11 },
  { id: "doctor", salary: 600, fee: 9_000, edu: 12 },
  { id: "banker", salary: 800, fee: 15_000, edu: 14 },
];

// Situace směny. Každá má 3 volby s pevným výkonem (0–100 %). Stejné situace sdílí všechna povolání.
export type SituationId = "delivery" | "customer" | "queue" | "tools" | "colleague" | "spill";
export const SITUATIONS: { id: SituationId; perf: [number, number, number] }[] = [
  { id: "delivery", perf: [100, 70, 30] },
  { id: "customer", perf: [40, 90, 60] },
  { id: "queue", perf: [80, 50, 20] },
  { id: "tools", perf: [70, 100, 40] },
  { id: "colleague", perf: [30, 80, 100] },
  { id: "spill", perf: [60, 100, 20] },
];
// Situace se vybírají tak, aby se ve směně nezopakovaly: seed + 0, 2, 4 (modulo počet situací).
export const situationAt = (seed: number, step: number) => SITUATIONS[(seed + step * 2) % SITUATIONS.length];

export type JobState = {
  id: JobId;
  // hodiny v pozici (nepoužívá se pro stupeň, jen pro přehled)
  hours: number;
  // přiznaný stupeň 1–5 (povyšuje se žádostí)
  rank: number;
  // kdy hráč získal aktuální stupeň (kvůli čekací době na další)
  rankSince: number;
  // body práce; nepřenášejí se mezi povoláními
  points: number;
  // výkony posledních 5 směn (0–100)
  perfs: number[];
  // po sobě jdoucí špatné směny a jestli je už varování
  bad: number;
  warned: boolean;
  // vedoucí směny (od stupně 4)
  lead: boolean;
  promoRetryAt: number;
};
export type ShiftState = { startedAt: number; seed: number; step: number; perfSum: number; lead: boolean } | null;
export type Crisis = { job: JobId; startAt: number; endAt: number } | null;

// Události, které akce vrací kvůli zprávě v UI.
export type EconomyEvent =
  | "shift-started"
  | "shift-step"
  | "shift-done"
  | "sick"
  | "crisis-warning"
  | "promoted"
  | "promo-rejected"
  | "raised"
  | "raise-rejected"
  | "warned"
  | "fired"
  | "vacation"
  | "rested";

export function newJob(id: JobId, now: number): JobState {
  return { id, hours: 0, rank: 1, rankSince: now, points: 0, perfs: [], bad: 0, warned: false, lead: false, promoRetryAt: 0 };
}

// --- Firmy ---

export type CompanyId = "shoes" | "clothes" | "tech" | "delivery" | "supermarket" | "digi" | "software" | "hardware" | "factory";
export type CompanyDef = { id: CompanyId; cost: number; digital: boolean };
export const COMPANIES: CompanyDef[] = [
  { id: "shoes", cost: 150, digital: false },
  { id: "clothes", cost: 600, digital: false },
  { id: "tech", cost: 2_500, digital: false },
  { id: "delivery", cost: 8_000, digital: true },
  { id: "supermarket", cost: 25_000, digital: false },
  { id: "digi", cost: 80_000, digital: true },
  { id: "software", cost: 250_000, digital: true },
  { id: "hardware", cost: 800_000, digital: false },
  { id: "factory", cost: 3_000_000, digital: false },
];
// Zisk firmy za hodinu: čím dál dražší obor, tím delší návratnost (5 h u první, 13 h u poslední).
export const companyIncome = (id: CompanyId): number => {
  const idx = COMPANIES.findIndex((c) => c.id === id);
  return Math.round(COMPANIES[idx].cost / (5 + idx));
};
export const COMPANY_GROWTH = 1.15;

// --- Investice ---

export type AssetId = "stocks" | "metal" | "crypto" | "bonds" | "realestate";
export type AssetDef = {
  id: AssetId;
  base: number;
  // výkyv ceny kolem základní hodnoty (0,15 = ±15 %)
  vol: number;
  // pravidelný výnos za hodinu jako podíl z ceny (nájem / úrok)
  yield: number;
  // dlouhodobý růst ceny za hodinu
  drift: number;
  crypto?: boolean;
};
export const ASSETS: AssetDef[] = [
  { id: "bonds", base: 1_000, vol: 0.01, yield: 0.0015, drift: 0 },
  { id: "metal", base: 2_000, vol: 0.07, yield: 0, drift: 0.00005 },
  { id: "stocks", base: 100, vol: 0.18, yield: 0, drift: 0.00015 },
  { id: "realestate", base: 50_000, vol: 0.04, yield: 0.005, drift: 0.00008 },
  { id: "crypto", base: 500, vol: 0.5, yield: 0, drift: 0, crypto: true },
];

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

// Cena je čistá funkce času: dvě vlny (perioda zhruba 3 hodiny a 45 minut) a malý šum po minutě. Server i prohlížeč vidí totéž.
export function assetPrice(id: AssetId, now: number): number {
  const def = ASSETS.find((a) => a.id === id)!;
  const phaseA = hash32(`${id}:a`) * Math.PI * 2;
  const phaseB = hash32(`${id}:b`) * Math.PI * 2;
  const hours = now / H;
  const wave = 0.6 * Math.sin(hours / 0.5 + phaseA) + 0.4 * Math.sin(hours / 0.12 + phaseB);
  const noise = (hash32(`${id}:${Math.floor(now / 60_000)}`) - 0.5) * 0.3;
  const trend = 1 + def.drift * (hours % 5_000);
  return Math.max(1, def.base * trend * (1 + def.vol * (wave + noise)));
}

// Dva trhy, které se krátkodobě rozcházejí. Rozdíl mezi nimi je příležitost pro arbitráž.
export function arbitrageSpread(now: number): number {
  const h = now / H;
  const a = Math.sin(h * 20 + 0.7) * 0.5 + Math.sin(h * 70 + 2.1) * 0.5;
  const b = Math.sin(h * 17 + 4.2) * 0.5 + Math.sin(h * 55 + 0.3) * 0.5;
  return Math.abs(a - b) * 0.03;
}

// --- Hustle ---

export type HustleId = "reselling" | "houseflip" | "carflip";
export type HustleDef = { id: HustleId; cost: number; minutes: number; min: number; max: number };
// Výsledek je násobek vloženého kapitálu mezi min a max (rozloženo rovnoměrně). Střední hodnota je mírně nad 1.
export const HUSTLES: HustleDef[] = [
  { id: "reselling", cost: 200, minutes: 1, min: 0.85, max: 1.5 },
  { id: "carflip", cost: 5_000, minutes: 5, min: 0.8, max: 1.55 },
  { id: "houseflip", cost: 60_000, minutes: 20, min: 0.75, max: 1.6 },
];
export type HustleSlot = { startedAt: number; payout: number } | null;

// --- Stav ---

export type EconomyState = {
  v: 1;
  character: Character | null;
  cash: number;
  totalEarned: number;
  // Největší jmění v tomto pokusu a nejlepší za celou dobu hraní.
  peak: number;
  best: number;
  runs: number;
  startedAt: number;
  lastSeen: number;
  job: JobState | null;
  energy: number;
  shift: ShiftState;
  shiftReadyAt: number;
  restReadyAt: number;
  sickUntil: number;
  vacationUntil: number;
  // začátky dovolených (kvůli limitu na 30 dní)
  vacations: number[];
  // výplaty ze směn za aktuální den a kdy naposledy vyplaceno prémie
  dayPay: number;
  bonusAt: number;
  // trvalé zvýšení platu podle povolání (násobek, 1 = bez zvýšení)
  raises: Partial<Record<JobId, number>>;
  raiseReadyAt: number;
  crisis: Crisis;
  // zaměstnanci podle firmy
  staff: Partial<Record<CompanyId, number>>;
  companies: Partial<Record<CompanyId, number>>;
  holdings: Partial<Record<AssetId, number>>;
  // průměrná nákupní cena držených kusů (jen pro zobrazení zisku)
  cost: Partial<Record<AssetId, number>>;
  hustle: Partial<Record<HustleId, HustleSlot>>;
  edu: number;
  arbReadyAt: number;
};

export type ErrorCode =
  | "bad-request"
  | "no-character"
  | "has-character"
  | "not-enough-cash"
  | "not-enough-points"
  | "locked"
  | "max"
  | "no-job"
  | "same-job"
  | "nothing"
  | "busy"
  | "not-ready"
  | "no-spread"
  | "cooldown"
  | "no-shift"
  | "low-energy"
  | "sick"
  | "vacation";

export type ActionResult =
  | { ok: true; state: EconomyState; pointsSpent?: number; gained?: { cash?: number; profit?: number }; event?: EconomyEvent }
  | { ok: false; error: ErrorCode };

export const isCountry = (v: unknown): v is CountryId => COUNTRIES.includes(v as CountryId);
export const isCity = (v: unknown): v is CityId => CITIES.includes(v as CityId);
export const isEra = (v: unknown): v is EraId => ERAS.includes(v as EraId);
export const isFamily = (v: unknown): v is FamilyId => FAMILIES.includes(v as FamilyId);
export const isJob = (v: unknown): v is JobId => JOBS.some((j) => j.id === v);
export const isCompany = (v: unknown): v is CompanyId => COMPANIES.some((c) => c.id === v);
export const isAsset = (v: unknown): v is AssetId => ASSETS.some((a) => a.id === v);
export const isHustle = (v: unknown): v is HustleId => HUSTLES.some((h) => h.id === v);

export const jobDef = (id: JobId) => JOBS.find((j) => j.id === id)!;
export const companyDef = (id: CompanyId) => COMPANIES.find((c) => c.id === id)!;
export const assetDef = (id: AssetId) => ASSETS.find((a) => a.id === id)!;
export const hustleDef = (id: HustleId) => HUSTLES.find((h) => h.id === id)!;

export function emptyState(now: number, runs = 0, best = 0): EconomyState {
  return {
    v: 1,
    character: null,
    cash: 0,
    totalEarned: 0,
    peak: 0,
    best,
    runs,
    startedAt: now,
    lastSeen: now,
    job: null,
    energy: ENERGY_MAX,
    shift: null,
    shiftReadyAt: 0,
    restReadyAt: 0,
    sickUntil: 0,
    vacationUntil: 0,
    vacations: [],
    dayPay: 0,
    bonusAt: now,
    raises: {},
    raiseReadyAt: 0,
    crisis: null,
    staff: {},
    companies: {},
    holdings: {},
    cost: {},
    hustle: {},
    edu: 0,
    arbReadyAt: 0,
  };
}

const finite = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
}

export function normalizeState(raw: unknown, now: number): EconomyState {
  const base = emptyState(now);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;

  const c = r.character as Record<string, unknown> | null | undefined;
  const name = cleanName(c?.name);
  const character: Character | null =
    c && name && isCountry(c.country) && isCity(c.city) && isEra(c.era) && isFamily(c.family)
      ? { country: c.country, name, city: c.city, era: c.era, family: c.family }
      : null;

  const companies: EconomyState["companies"] = {};
  for (const def of COMPANIES) {
    const n = Math.floor(finite((r.companies as Record<string, unknown> | undefined)?.[def.id], 0, 0, MAX_COMPANY_UNITS));
    if (n > 0) companies[def.id] = n;
  }
  const staff: EconomyState["staff"] = {};
  for (const def of COMPANIES) {
    const n = Math.floor(finite((r.staff as Record<string, unknown> | undefined)?.[def.id], 0, 0, COMPANY_STAFF_MAX));
    if (n > 0) staff[def.id] = n;
  }
  const raises: EconomyState["raises"] = {};
  for (const def of JOBS) {
    const v = finite((r.raises as Record<string, unknown> | undefined)?.[def.id], 1, 1, RAISE_MAX);
    if (v > 1) raises[def.id] = v;
  }
  const holdings: EconomyState["holdings"] = {};
  const cost: EconomyState["cost"] = {};
  for (const a of ASSETS) {
    const q = finite((r.holdings as Record<string, unknown> | undefined)?.[a.id], 0, 0, 1e9);
    if (q > 0) {
      holdings[a.id] = q;
      cost[a.id] = finite((r.cost as Record<string, unknown> | undefined)?.[a.id], a.base, 0, 1e12);
    }
  }
  const hustle: EconomyState["hustle"] = {};
  for (const h of HUSTLES) {
    const s = (r.hustle as Record<string, { startedAt?: unknown; payout?: unknown } | null> | undefined)?.[h.id];
    if (s && typeof s === "object") {
      hustle[h.id] = { startedAt: finite(s.startedAt, now, 0, now), payout: finite(s.payout, 0, 0, h.cost * h.max) };
    }
  }

  // Stará uložená hra má jen id a hodiny. Stupeň se odvodí z hodin, body začínají od nuly.
  const jr = r.job as Record<string, unknown> | null | undefined;
  let job: JobState | null = null;
  if (jr && isJob(jr.id)) {
    const hours = finite(jr.hours, 0, 0, 1e6);
    job = {
      id: jr.id,
      hours,
      rank: Math.floor(finite(jr.rank, jobRank(hours), 1, MAX_JOB_RANK)),
      rankSince: finite(jr.rankSince, now, 0, now),
      points: Math.floor(finite(jr.points, 0, 0, 1e6)),
      perfs: (Array.isArray(jr.perfs) ? jr.perfs : [])
        .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
        .map((x) => Math.min(PERF_MAX, Math.max(0, x)))
        .slice(-5),
      bad: Math.floor(finite(jr.bad, 0, 0, 1e6)),
      warned: jr.warned === true,
      lead: jr.lead === true,
      promoRetryAt: finite(jr.promoRetryAt, 0, 0, now + PROMO_RETRY_MS),
    };
  }

  const sr = r.shift as Record<string, unknown> | null | undefined;
  const shift: ShiftState =
    job && sr && typeof sr === "object"
      ? {
          startedAt: finite(sr.startedAt, now, 0, now),
          seed: Math.floor(finite(sr.seed, 0, 0, SITUATIONS.length - 1)),
          step: Math.floor(finite(sr.step, 0, 0, SITUATIONS_PER_SHIFT - 1)),
          perfSum: finite(sr.perfSum, 0, 0, PERF_MAX * SITUATIONS_PER_SHIFT),
          lead: sr.lead === true,
        }
      : null;

  const cr = r.crisis as Record<string, unknown> | null | undefined;
  const crisis: Crisis = cr && isJob(cr.job) ? { job: cr.job, startAt: finite(cr.startAt, 0, 0, 1e15), endAt: finite(cr.endAt, 0, 0, 1e15) } : null;

  const cash = finite(r.cash, 0, 0, 1e15);
  return {
    v: 1,
    character,
    cash,
    totalEarned: finite(r.totalEarned, 0, 0, 1e18),
    peak: finite(r.peak, cash, 0, 1e15),
    best: finite(r.best, 0, 0, 1e15),
    runs: Math.floor(finite(r.runs, 0, 0, 1e6)),
    startedAt: finite(r.startedAt, now, 0, now),
    lastSeen: finite(r.lastSeen, now, 0, now),
    job,
    energy: finite(r.energy, ENERGY_MAX, 0, ENERGY_MAX),
    shift,
    shiftReadyAt: finite(r.shiftReadyAt, 0, 0, now + SHIFT_COOLDOWN_MS),
    restReadyAt: finite(r.restReadyAt, 0, 0, now + REST_COOLDOWN_MS),
    sickUntil: finite(r.sickUntil, 0, 0, now + 3 * DAY),
    vacationUntil: finite(r.vacationUntil, 0, 0, now + VACATION_MS),
    vacations: (Array.isArray(r.vacations) ? r.vacations : [])
      .filter((x): x is number => typeof x === "number" && Number.isFinite(x) && x <= now)
      .slice(-10),
    dayPay: finite(r.dayPay, 0, 0, 1e15),
    bonusAt: finite(r.bonusAt, now, 0, now),
    raises,
    raiseReadyAt: finite(r.raiseReadyAt, 0, 0, now + RAISE_COOLDOWN_MS),
    crisis,
    staff,
    companies,
    holdings,
    cost,
    hustle,
    edu: Math.floor(finite(r.edu, 0, 0, MAX_EDU)),
    arbReadyAt: finite(r.arbReadyAt, 0, 0, now + ARB_COOLDOWN_MS),
  };
}

// --- Bonusy a sazby ---

export const learningBonusFromXp = (xpLast24h: number) => Math.min(MAX_LEARNING_BONUS, Math.max(0, xpLast24h) / 1000);
export const eduBonus = (edu: number) => Math.min(MAX_EDU, Math.max(0, edu)) * EDU_BONUS_PER_LEVEL;
export const eduCost = (edu: number) => 10 + edu * 8;
export const jobRank = (hours: number) => Math.min(MAX_JOB_RANK, 1 + Math.floor(hours / JOB_RANK_HOURS));
export const companyPrice = (state: EconomyState, id: CompanyId): number => {
  const owned = state.companies[id] ?? 0;
  const mult = state.character ? FAMILY_DEF[state.character.family].company : 1;
  return Math.round(companyDef(id).cost * mult * Math.pow(COMPANY_GROWTH, owned));
};

export function isLocked(state: EconomyState, kind: "company" | "asset", id: string): boolean {
  const era = state.character ? ERA_DEF[state.character.era] : ERA_DEF["2025"];
  if (kind === "company") return !era.digital && companyDef(id as CompanyId).digital;
  return !era.crypto && !!assetDef(id as AssetId).crypto;
}

// Hodinový plat za stupeň, zemi, město, zvýšení a krizi. Plat za hodinu, před pasivním podílem.
export function jobHourly(state: EconomyState, now: number): number {
  if (!state.job || !state.character) return 0;
  const job = state.job;
  const ch = state.character;
  const raise = state.raises[job.id] ?? 1;
  const inCrisis = !!state.crisis && state.crisis.job === job.id && now >= state.crisis.startAt && now < state.crisis.endAt;
  return (
    jobDef(job.id).salary *
    (1 + JOB_RANK_BONUS * (job.rank - 1)) *
    COUNTRY_DEF[ch.country].salary *
    CITY_DEF[ch.city].salary *
    raise *
    (inCrisis ? CRISIS_SALARY : 1)
  );
}

export type Rates = {
  salary: number;
  companies: number;
  passive: number;
  living: number;
  // mzdy zaměstnancům (výdaj)
  wages: number;
  // všechny příjmy se násobí multiplier (vzdělání + učení + rozšíření)
  multiplier: number;
  // čistý příjem za hodinu
  net: number;
};

const avgPerf = (perfs: number[]) => (perfs.length ? perfs.reduce((a, b) => a + b, 0) / perfs.length : 0);

export function rates(state: EconomyState, now: number, learning = 0): Rates {
  const ch = state.character;
  if (!ch) return { salary: 0, companies: 0, passive: 0, living: 0, wages: 0, multiplier: 1, net: 0 };
  const country = COUNTRY_DEF[ch.country];
  const city = CITY_DEF[ch.city];
  const family = FAMILY_DEF[ch.family];
  const multiplier = 1 + eduBonus(state.edu) + Math.min(MAX_LEARNING_BONUS, Math.max(0, learning));

  // Pasivní plat: 60 % stupně, nic během nemoci, polovina na dovolené.
  const passiveFactor = state.sickUntil > now ? 0 : state.vacationUntil > now ? VACATION_PAY : 1;
  const salary = jobHourly(state, now) * PASSIVE_SHARE * passiveFactor;

  let companies = 0;
  let staffCount = 0;
  for (const c of COMPANIES) {
    const n = state.companies[c.id] ?? 0;
    const s = state.staff[c.id] ?? 0;
    staffCount += s;
    if (n > 0) companies += n * companyIncome(c.id) * (1 + STAFF_BOOST * s);
  }
  const wages = staffCount * STAFF_WAGE * country.salary * city.salary;

  let passive = 0;
  for (const a of ASSETS) {
    if (!a.yield) continue;
    const qty = state.holdings[a.id] ?? 0;
    if (qty > 0) passive += qty * assetPrice(a.id, now) * a.yield * (a.id === "realestate" ? city.rent : 1);
  }
  // Životní náklady jsou malé, ale rostou s tím, jak jsi na tom líp (aby hráč nebyl zadarmo bohatý).
  const living = (6 * country.living * city.living * family.living) * (1 + Math.log10(1 + (state.cash + 0) / 1000) * 0.5);
  const gross = (salary + companies + passive) * multiplier * INCOME_SPEED;
  return {
    salary: salary * INCOME_SPEED,
    companies: companies * INCOME_SPEED,
    passive: passive * INCOME_SPEED,
    living: living * INCOME_SPEED,
    wages: wages * INCOME_SPEED,
    multiplier,
    net: gross - (living + wages) * INCOME_SPEED,
  };
}

// Jmění = hotovost + hodnota investic + cena firem + rozjeté hustle.
export function netWorth(state: EconomyState, now: number): number {
  let total = state.cash;
  for (const a of ASSETS) total += (state.holdings[a.id] ?? 0) * assetPrice(a.id, now);
  for (const c of COMPANIES) {
    const n = state.companies[c.id] ?? 0;
    if (n > 0) total += c.cost * n * (state.character ? FAMILY_DEF[state.character.family].company : 1);
  }
  for (const h of HUSTLES) total += state.hustle[h.id]?.payout ? hustleDef(h.id).cost : 0;
  return Math.round(total);
}

// Připíše příjem za uplynulý čas a doplní energii. Sazba se bere z poloviny úseku (cena aktiv se mění), proto stačí hrubý odhad.
// Prémie se vyplácí jednou za den, bez ohledu na offline strop.
export function settle(state: EconomyState, now: number, learning = 0): EconomyState {
  if (!state.character) return { ...state, lastSeen: now };
  const elapsed = Math.min(Math.max(0, now - state.lastSeen), MAX_OFFLINE_MIN * 60_000);
  const hours = elapsed / H;
  let next: EconomyState = { ...state, lastSeen: now };
  if (elapsed > 0) {
    const rate = rates(state, state.lastSeen + elapsed / 2, learning);
    const gain = rate.net * hours;
    next = {
      ...next,
      cash: Math.max(0, state.cash + gain),
      job: state.job ? { ...state.job, hours: state.job.hours + hours } : null,
      totalEarned: state.totalEarned + (gain > 0 ? gain : 0),
      energy: Math.min(ENERGY_MAX, state.energy + ENERGY_PER_HOUR * hours),
    };
  }
  if (now - state.bonusAt >= BONUS_MS) {
    const bonus = state.dayPay * BONUS_SHARE;
    next = { ...next, cash: next.cash + bonus, totalEarned: next.totalEarned + bonus, dayPay: 0, bonusAt: now };
  }
  return withPeak(next, now);
}

function withPeak(state: EconomyState, now: number): EconomyState {
  const worth = netWorth(state, now);
  return { ...state, peak: Math.max(state.peak, worth), best: Math.max(state.best, worth) };
}

const fail = (error: ErrorCode): ActionResult => ({ ok: false, error });
const done = (state: EconomyState, now: number, extra: Omit<Extract<ActionResult, { ok: true }>, "ok" | "state"> = {}): ActionResult => ({
  ok: true,
  state: withPeak(state, now),
  ...extra,
});

// --- Akce ---

export function createCharacter(state: EconomyState, input: Partial<Record<keyof Character, unknown>>, now: number): ActionResult {
  if (state.character) return fail("has-character");
  const name = cleanName(input.name);
  if (!name || !isCountry(input.country) || !isCity(input.city) || !isEra(input.era) || !isFamily(input.family)) return fail("bad-request");
  const character: Character = { country: input.country, name, city: input.city, era: input.era, family: input.family };
  const cash = Math.round(FAMILY_DEF[character.family].start * ERA_DEF[character.era].start);
  return done({ ...emptyState(now, state.runs, state.best), character, cash, peak: cash }, now);
}

// Začít znovu: smaže postup a postavu, zůstane rekord a počet pokusů.
export function restart(state: EconomyState, now: number): ActionResult {
  return { ok: true, state: emptyState(now, state.runs + 1, state.best) };
}

// Nástup do práce. Povolání se odemyká Vzděláním, nový nástup začíná s nulovými body.
export function takeJob(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isJob(id)) return fail("bad-request");
  if (state.shift) return fail("busy");
  if (state.job?.id === id) return fail("same-job");
  const def = jobDef(id);
  if (state.edu < def.edu) return fail("locked");
  if (state.cash < def.fee) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - def.fee, job: newJob(id, now) }, now);
}

export function quitJob(state: EconomyState, now: number): ActionResult {
  if (!state.job) return fail("no-job");
  if (state.shift) return fail("busy");
  return done({ ...state, job: null }, now);
}

// Směna: spustí se, když je energie, hráč není nemocný ani na dovolené a uplynul cooldown.
// Losuje se nemoc (hráč ji nevidí předem) a krize v oboru (přijde za den, ukáže se jako varování).
export function startShift(state: EconomyState, now: number, rng: () => number = Math.random): ActionResult {
  if (!state.character) return fail("no-character");
  if (!state.job) return fail("no-job");
  if (state.shift) return fail("busy");
  if (state.sickUntil > now) return fail("sick");
  if (state.vacationUntil > now) return fail("vacation");
  if (now < state.shiftReadyAt) return fail("cooldown");
  const extra = state.job.lead ? LEAD_EXTRA_ENERGY : 0;
  if (state.energy < SHIFT_MIN_ENERGY + extra) return fail("low-energy");

  if (rng() < SICK_CHANCE) {
    const days = rng() < 0.5 ? 1 : 2;
    return done({ ...state, sickUntil: now + days * DAY }, now, { event: "sick" });
  }

  let event: EconomyEvent = "shift-started";
  let crisis = state.crisis;
  if ((!crisis || now >= crisis.endAt) && rng() < CRISIS_CHANCE) {
    crisis = { job: state.job.id, startAt: now + CRISIS_DELAY_MS, endAt: now + CRISIS_DELAY_MS + CRISIS_MS };
    event = "crisis-warning";
  }
  const seed = Math.floor(rng() * SITUATIONS.length);
  return done(
    {
      ...state,
      energy: state.energy - extra,
      crisis,
      shift: { startedAt: now, seed, step: 0, perfSum: 0, lead: state.job.lead },
    },
    now,
    { event },
  );
}

// Jedno rozhodnutí ve směně. Po třetím se směna vyúčtuje: výplata, body, varování nebo výpověď.
export function chooseShift(state: EconomyState, index: unknown, now: number, learning = 0): ActionResult {
  if (!state.character) return fail("no-character");
  if (!state.job) return fail("no-job");
  const shift = state.shift;
  if (!shift) return fail("no-shift");
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 2) return fail("bad-request");

  const perf = situationAt(shift.seed, shift.step).perf[index];
  const step = shift.step + 1;
  const perfSum = shift.perfSum + perf;
  const energy = state.energy - SITUATION_ENERGY;
  if (step < SITUATIONS_PER_SHIFT) {
    return done({ ...state, energy, shift: { ...shift, step, perfSum } }, now, { event: "shift-step" });
  }

  const avg = perfSum / SITUATIONS_PER_SHIFT;
  const mult = 1 + eduBonus(state.edu) + Math.min(MAX_LEARNING_BONUS, Math.max(0, learning));
  const pay = Math.round(
    jobHourly(state, now) *
      (1 - PASSIVE_SHARE) *
      SHIFT_PAY_HOURS *
      (0.7 + (0.6 * avg) / PERF_MAX) *
      (shift.lead ? LEAD_PAY : 1) *
      mult *
      INCOME_SPEED,
  );

  const points = avg >= 70 ? 10 : avg >= 40 ? 6 : 3;
  const job: JobState = { ...state.job, points: state.job.points + points, perfs: [...state.job.perfs, avg].slice(-5) };
  let event: EconomyEvent = "shift-done";
  let nextJob: JobState | null;
  if (avg >= BAD_PERF) {
    nextJob = { ...job, bad: 0, warned: false };
  } else if (job.bad + 1 >= DISMISS_STREAK && job.warned) {
    nextJob = null;
    event = "fired";
  } else if (job.bad + 1 >= DISMISS_STREAK) {
    nextJob = { ...job, bad: 0, warned: true };
    event = "warned";
  } else {
    nextJob = { ...job, bad: job.bad + 1 };
  }

  return done(
    {
      ...state,
      cash: state.cash + pay,
      totalEarned: state.totalEarned + pay,
      dayPay: state.dayPay + pay,
      energy,
      job: nextJob,
      shift: null,
      shiftReadyAt: now + SHIFT_COOLDOWN_MS,
    },
    now,
    { gained: { cash: pay }, event },
  );
}

// Odpočinek: doplní energii na maximum, jednou za 6 hodin.
export function rest(state: EconomyState, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (state.shift) return fail("busy");
  if (now < state.restReadyAt) return fail("cooldown");
  return done({ ...state, energy: ENERGY_MAX, restReadyAt: now + REST_COOLDOWN_MS }, now, { event: "rested" });
}

// Žádost o povýšení: musí být body na další stupeň, Vzdělání, 2 hodiny v pozici a šance podle výkonu.
export function requestPromotion(state: EconomyState, now: number, rng: () => number = Math.random): ActionResult {
  if (!state.character) return fail("no-character");
  if (!state.job) return fail("no-job");
  if (state.shift) return fail("busy");
  const job = state.job;
  if (job.rank >= MAX_JOB_RANK) return fail("max");
  if (now < job.promoRetryAt) return fail("cooldown");
  if (job.points < RANK_POINTS[job.rank]) return fail("not-enough-points");
  if (state.edu < jobDef(job.id).edu + job.rank) return fail("locked");
  if (now - job.rankSince < PROMO_MIN_RANK_MS) return fail("not-ready");

  const chance = Math.min(PROMO_MAX, PROMO_BASE + PROMO_PER_PERF * avgPerf(job.perfs));
  if (rng() * 100 < chance) {
    return done({ ...state, job: { ...job, rank: job.rank + 1, rankSince: now, promoRetryAt: 0 } }, now, { event: "promoted" });
  }
  return done({ ...state, job: { ...job, promoRetryAt: now + PROMO_RETRY_MS } }, now, { event: "promo-rejected" });
}

// Vyjednání platu: jednou za 7 dní, šance podle výkonu, úspěch zvýší plat tohoto povolání o 5–10 %.
export function negotiateRaise(state: EconomyState, now: number, rng: () => number = Math.random): ActionResult {
  if (!state.character) return fail("no-character");
  if (!state.job) return fail("no-job");
  if (state.shift) return fail("busy");
  if (now < state.raiseReadyAt) return fail("cooldown");

  const penalty = state.job.rank >= LEAD_MIN_RANK ? RAISE_SENIOR_PENALTY : 0;
  const chance = Math.max(0, RAISE_BASE + RAISE_PER_PERF * avgPerf(state.job.perfs) - penalty);
  const raiseReadyAt = now + RAISE_COOLDOWN_MS;
  if (rng() * 100 < chance) {
    const id = state.job.id;
    const current = state.raises[id] ?? 1;
    const up = 1 + 0.05 + rng() * 0.05;
    return done({ ...state, raiseReadyAt, raises: { ...state.raises, [id]: Math.min(RAISE_MAX, current * up) } }, now, { event: "raised" });
  }
  return done({ ...state, raiseReadyAt }, now, { event: "raise-rejected" });
}

// Zapnutí a vypnutí role vedoucího směny (od stupně 4). Vedoucí dostane +5 % a stojí víc energie.
export function setLead(state: EconomyState, on: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!state.job) return fail("no-job");
  if (state.shift) return fail("busy");
  if (typeof on !== "boolean") return fail("bad-request");
  if (on && state.job.rank < LEAD_MIN_RANK) return fail("locked");
  return done({ ...state, job: { ...state.job, lead: on } }, now);
}

// Dovolená: 1 den, pasivní plat na polovinu, energie doplněna. Nejvýš 2 dny za 30 dní.
export function startVacation(state: EconomyState, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (state.shift) return fail("busy");
  if (state.sickUntil > now) return fail("sick");
  if (state.vacationUntil > now) return fail("busy");
  const recent = state.vacations.filter((t) => now - t < VACATION_WINDOW_MS);
  if (recent.length >= VACATION_MAX) return fail("max");
  return done({ ...state, vacationUntil: now + VACATION_MS, vacations: [...recent, now], energy: ENERGY_MAX }, now, { event: "vacation" });
}

// Najmout zaměstnance do vlastní firmy: jednorázově 2 hodiny výnosu firmy, nejvýš 5 na firmu.
export function hireStaff(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isCompany(id)) return fail("bad-request");
  const owned = state.companies[id] ?? 0;
  if (owned < 1) return fail("nothing");
  const staff = state.staff[id] ?? 0;
  if (staff >= COMPANY_STAFF_MAX) return fail("max");
  const cost = Math.round(STAFF_HIRE_HOURS * owned * companyIncome(id) * INCOME_SPEED);
  if (state.cash < cost) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - cost, staff: { ...state.staff, [id]: staff + 1 } }, now);
}

export function fireStaff(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isCompany(id)) return fail("bad-request");
  const staff = state.staff[id] ?? 0;
  if (staff < 1) return fail("nothing");
  const next = { ...state.staff };
  if (staff - 1 > 0) next[id] = staff - 1;
  else delete next[id];
  return done({ ...state, staff: next }, now);
}

export function buyCompany(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isCompany(id)) return fail("bad-request");
  if (isLocked(state, "company", id)) return fail("locked");
  const owned = state.companies[id] ?? 0;
  if (owned >= MAX_COMPANY_UNITS) return fail("max");
  const price = companyPrice(state, id);
  if (state.cash < price) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - price, companies: { ...state.companies, [id]: owned + 1 } }, now);
}

function qtyOf(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

// Nákup za částku (cash), ne za počet kusů: kusy jsou zlomkové, takže jde investovat i malá suma.
export function buyAsset(state: EconomyState, id: unknown, amount: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isAsset(id)) return fail("bad-request");
  const spend = qtyOf(amount);
  if (spend === null) return fail("bad-request");
  if (isLocked(state, "asset", id)) return fail("locked");
  const money = Math.min(spend, state.cash);
  if (money < 1) return fail("not-enough-cash");
  const price = assetPrice(id, now);
  const qty = money / price;
  const have = state.holdings[id] ?? 0;
  const avg = state.cost[id] ?? price;
  const newCost = (have * avg + money) / (have + qty);
  return done(
    {
      ...state,
      cash: state.cash - money,
      holdings: { ...state.holdings, [id]: have + qty },
      cost: { ...state.cost, [id]: newCost },
    },
    now,
  );
}

// Prodej za podíl držených kusů (0–1], nebo všeho.
export function sellAsset(state: EconomyState, id: unknown, share: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isAsset(id)) return fail("bad-request");
  const have = state.holdings[id] ?? 0;
  if (have <= 0) return fail("nothing");
  const s = typeof share === "number" && Number.isFinite(share) ? Math.min(1, Math.max(0, share)) : 1;
  if (s <= 0) return fail("bad-request");
  const qty = have * s;
  const price = assetPrice(id, now);
  const money = qty * price;
  const remaining = have - qty;
  const holdings = { ...state.holdings };
  const cost = { ...state.cost };
  if (remaining < 1e-9) {
    delete holdings[id];
    delete cost[id];
  } else {
    holdings[id] = remaining;
  }
  const profit = money - qty * (state.cost[id] ?? price);
  return done({ ...state, cash: state.cash + money, holdings, cost, totalEarned: state.totalEarned + Math.max(0, profit) }, now, {
    gained: { cash: Math.round(money), profit: Math.round(profit) },
  });
}

export function arbitrageLimit(state: EconomyState): number {
  return ARB_CAP * (1 + state.edu * 0.2);
}

export function arbitrage(state: EconomyState, amount: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (now < state.arbReadyAt) return fail("cooldown");
  const spend = qtyOf(amount);
  if (spend === null) return fail("bad-request");
  const money = Math.min(spend, state.cash, arbitrageLimit(state));
  if (money < 1) return fail("not-enough-cash");
  const edge = arbitrageSpread(now) - ARB_FEE;
  if (edge <= 0) return fail("no-spread");
  const profit = money * edge;
  return done(
    { ...state, cash: state.cash + profit, totalEarned: state.totalEarned + profit, arbReadyAt: now + ARB_COOLDOWN_MS },
    now,
    { gained: { cash: Math.round(profit), profit: Math.round(profit) } },
  );
}

// `rng` vrací číslo [0,1); server dává Math.random, test pevnou hodnotu.
export function startHustle(state: EconomyState, id: unknown, now: number, rng: () => number = Math.random): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  if (state.hustle[id]) return fail("busy");
  const def = hustleDef(id);
  if (state.cash < def.cost) return fail("not-enough-cash");
  const payout = Math.round(def.cost * (def.min + (def.max - def.min) * rng()));
  return done({ ...state, cash: state.cash - def.cost, hustle: { ...state.hustle, [id]: { startedAt: now, payout } } }, now);
}

export const hustleReady = (slot: HustleSlot | undefined, id: HustleId, now: number) =>
  !!slot && now - slot.startedAt >= hustleDef(id).minutes * 60_000;

export function collectHustle(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  const slot = state.hustle[id];
  if (!slot) return fail("nothing");
  if (!hustleReady(slot, id, now)) return fail("not-ready");
  const hustle = { ...state.hustle };
  delete hustle[id];
  const profit = slot.payout - hustleDef(id).cost;
  return done({ ...state, cash: state.cash + slot.payout, hustle, totalEarned: state.totalEarned + Math.max(0, profit) }, now, {
    gained: { cash: slot.payout, profit },
  });
}

// Investice bodů z učení do Vzdělání: trvalý bonus ke všem příjmům.
export function investEdu(state: EconomyState, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (state.edu >= MAX_EDU) return fail("max");
  return done({ ...state, edu: state.edu + 1 }, now, { pointsSpent: eduCost(state.edu) });
}
