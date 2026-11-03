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
//  - Investice: akcie (dividendy), kovy, kryptoměny, nemovitosti, cenné papíry a arbitráž. Ceny kolísají podle času
//    (stejně na serveru i v prohlížeči), tržní zprávy hnou celou kategorií, limitní a stop-loss příkazy se plní při hraní,
//    startupy každých 12 hodin buď vyjdou (výplata), nebo zkrachují.
//  - Hustle: reselling, flipování domů a aut. Vložíš kapitál, po čase si vybereš výsledek (může i prodělat).
//  - Body z učení se dají investovat do Vzdělání (trvalý bonus ke všem příjmům). Aktivní učení za posledních
//    24 hodin dává navíc dočasné zrychlení.
//  - Kdykoliv můžeš začít znovu. Rekordní jmění a počet pokusů zůstávají.

// Hra je na aktivní hraní: mimo hru peníze běží jen chvíli a všechno ostatní je svižné.
export const MAX_OFFLINE_MIN = 15;
// Časový posun: herní čas běží rychleji než reálný (1×–16×). Mimo hru se strop offline násobí rychlostí.
export const SPEEDS = [1, 2, 4, 8, 16] as const;
export type Speed = (typeof SPEEDS)[number];
export const isSpeed = (v: unknown): v is Speed => SPEEDS.includes(v as Speed);
// Kotva herních hodin: herní čas `game` připadá na reálný čas `real`.
export type GameClock = { real: number; game: number };
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

export type CompanyId =
  | "shoes"
  | "clothes"
  | "bakery"
  | "tech"
  | "carwash"
  | "delivery"
  | "eshop"
  | "supermarket"
  | "printshop"
  | "digi"
  | "software"
  | "streaming"
  | "hardware"
  | "factory";
// payback = návratnost v hodinách (zisk za hodinu na jeden kus = cena / návratnost)
export type CompanyDef = { id: CompanyId; cost: number; digital: boolean; payback: number };
export const COMPANIES: CompanyDef[] = [
  { id: "shoes", cost: 150, digital: false, payback: 5 },
  { id: "clothes", cost: 600, digital: false, payback: 6 },
  { id: "bakery", cost: 1_200, digital: false, payback: 6.5 },
  { id: "tech", cost: 2_500, digital: false, payback: 7 },
  { id: "carwash", cost: 5_000, digital: false, payback: 7.5 },
  { id: "delivery", cost: 8_000, digital: true, payback: 8 },
  { id: "eshop", cost: 18_000, digital: true, payback: 8.5 },
  { id: "supermarket", cost: 25_000, digital: false, payback: 9 },
  { id: "printshop", cost: 40_000, digital: false, payback: 9.5 },
  { id: "digi", cost: 80_000, digital: true, payback: 10 },
  { id: "software", cost: 250_000, digital: true, payback: 11 },
  { id: "streaming", cost: 400_000, digital: true, payback: 11.5 },
  { id: "hardware", cost: 800_000, digital: false, payback: 12 },
  { id: "factory", cost: 3_000_000, digital: false, payback: 13 },
];
// Zisk firmy za hodinu na jeden kus, bez úprav (ty přidává nastavení firmy).
export const companyIncome = (id: CompanyId): number => {
  const def = COMPANIES.find((c) => c.id === id)!;
  return def.cost / def.payback;
};
export const COMPANY_GROWTH = 1.15;

// Nastavení jedné firmy (typu) z detailu. Hráč si hodnoty nastaví sám posuvníkem; všechno se počítá
// z času a stavu, takže server i prohlížeč vidí totéž.
// price = násobek ceny produktu (víc na kus, víc citlivé na krize)
// output = násobek výroby (víc zboží, víc provozních nákladů)
// risk = 0 bezpečně … 1 riskantně (vyšší riziko = vyšší výnos z výroby i silnější dopad událostí)
export const SETTING_RANGE = {
  price: { min: 0.5, max: 2, step: 0.05 },
  output: { min: 0.5, max: 1.5, step: 0.05 },
  risk: { min: 0, max: 1, step: 0.05 },
} as const;
export type SettingKey = keyof typeof SETTING_RANGE;
export type CompanySetup = {
  upgraded: boolean; // jednorázové vylepšení celého oboru
  staff: number; // zaměstnanci celkem (max MAX_STAFF_PER_UNIT na kus)
  price: number;
  output: number;
  risk: number;
  marketingUntil: number; // do kdy běží marketingová kampaň
};
export const DEFAULT_SETUP: CompanySetup = { upgraded: false, staff: 0, price: 1, output: 1, risk: 0.3, marketingUntil: 0 };
export const clampSetting = (key: SettingKey, v: number) => {
  const r = SETTING_RANGE[key];
  const snapped = Math.round(v / r.step) * r.step;
  return Math.min(r.max, Math.max(r.min, Number(snapped.toFixed(2))));
};
// Výnos z rizika: bezpečná firma vyrábí o trochu míň, riskantní o něco víc.
export const riskOutput = (risk: number) => 0.85 + 0.6 * risk;
// Citlivost na události: bezpečná firma má nárazník, riskantní je vystavená víc.
export const riskExposure = (risk: number) => 0.3 + 1.5 * risk;
// Provozní náklady výroby v násobku zisku kusu (výroba nad 0,5× něco stojí).
export const upkeepShare = (output: number) => Math.max(0, (output - 0.5) * 0.3);
export const MAX_STAFF_PER_UNIT = 3;
export const STAFF_OUTPUT = 0.12; // zvýšení výroby na jednoho zaměstnance (na celou firmu přepočteno)
export const STAFF_WAGE = 0.08; // hodinová mzda jednoho zaměstnance v násobku zisku kusu
export const STAFF_HIRE_HOURS = 24; // nábor stojí den mzdy
export const UPGRADE_BONUS = 0.3;
export const UPGRADE_COST_MULT = 2;
export const MARKETING_MINUTES = 30;
export const MARKETING_BONUS = 1.3;
export const MARKETING_COST = 0.1; // kampaň stojí podíl ceny firem
export const FUND_COST = 0.1; // krizový fond stojí podíl ceny firem
export const FUND_SAVES = 0.65; // jaký díl ztráty z události fond zachrání

// --- Mimořádné události ---
// Každé dvě hodiny přijde jedna událost a trvá půl hodiny. Vybírá se podle času (stejné na serveru i v prohlížeči).
export const EVENT_WINDOW_MS = 2 * H;
export const EVENT_DURATION_MS = 30 * 60_000;
export type EventId = "crash" | "hyper" | "shortage" | "outage" | "boom" | "viral" | "strike" | "fashion" | "subsidy" | "breach";
export type EventDef = {
  id: EventId;
  // "all" = celý trh, "digital" / "physical" = obor podle typu, nebo seznam konkrétních oborů
  affects: "all" | "digital" | "physical" | CompanyId[];
  mult: number; // změna zisku (<1 je ztráta, >1 zisk), za stabilní směr
  wageMult: number; // změna mezd zaměstnanců
};
export const EVENTS: EventDef[] = [
  { id: "crash", affects: "all", mult: 0.6, wageMult: 1 },
  { id: "hyper", affects: "all", mult: 0.9, wageMult: 2 },
  { id: "shortage", affects: ["shoes", "clothes", "bakery", "supermarket", "printshop", "factory", "hardware"], mult: 0.6, wageMult: 1 },
  { id: "outage", affects: ["digi", "software", "streaming", "eshop", "delivery"], mult: 0.5, wageMult: 1 },
  { id: "boom", affects: "all", mult: 1.4, wageMult: 1 },
  { id: "viral", affects: ["digi", "streaming", "eshop"], mult: 1.6, wageMult: 1 },
  { id: "strike", affects: ["factory", "hardware", "printshop", "bakery"], mult: 0.7, wageMult: 1.5 },
  { id: "fashion", affects: ["clothes", "shoes"], mult: 1.5, wageMult: 1 },
  { id: "subsidy", affects: "physical", mult: 1.2, wageMult: 0.8 },
  { id: "breach", affects: "digital", mult: 0.7, wageMult: 1 },
];
export type ActiveEvent = { def: EventDef; window: number; endsAt: number };
export const eventWindow = (now: number) => Math.floor(now / EVENT_WINDOW_MS);
export function currentEvent(now: number): ActiveEvent | null {
  const window = eventWindow(now);
  const offset = now - window * EVENT_WINDOW_MS;
  if (offset >= EVENT_DURATION_MS) return null;
  const def = EVENTS[Math.floor(hash32(`event:${window}`) * EVENTS.length)];
  return { def, window, endsAt: window * EVENT_WINDOW_MS + EVENT_DURATION_MS };
}
export const eventAffects = (def: EventDef, id: CompanyId): boolean => {
  if (def.affects === "all") return true;
  if (def.affects === "digital" || def.affects === "physical") return companyDef(id).digital === (def.affects === "digital");
  return def.affects.includes(id);
};
// Ztrátová událost jde zmírnit krizovým fondem; zisková ne.
export const isNegativeEvent = (def: EventDef) => def.mult < 1 || def.wageMult > 1;

// --- Investice ---

// Kategorie investic. Každá má několik konkrétních položek s vlastním rizikem a výnosem.
export type AssetCategoryId = "crypto" | "realestate" | "stocks" | "metals" | "bonds" | "funds" | "startups";
export const ASSET_CATEGORIES: AssetCategoryId[] = ["crypto", "realestate", "stocks", "metals", "bonds", "funds", "startups"];

export type AssetId =
  | "coin" | "altcoin" | "stablecoin" | "memecoin" | "defi"
  | "flat" | "house" | "land" | "office"
  | "technology" | "energy" | "bank" | "consumer" | "biotech"
  | "gold" | "silver" | "copper"
  | "state" | "corporate" | "junk"
  | "index" | "dividend" | "theme"
  | "startup_it" | "startup_fintech" | "startup_green";

export type AssetDef = {
  id: AssetId;
  cat: AssetCategoryId;
  // klíč pro náhodné vlny ceny. U položek převzatých z dřívějších obecných aktiv zůstává původní,
  // takže jejich cena i držby zůstanou přesně stejné.
  seed: string;
  base: number;
  // výkyv ceny kolem základní hodnoty (0,15 = ±15 %)
  vol: number;
  // pravidelný výnos za hodinu jako podíl z ceny (nájem / úrok / dividenda)
  yield: number;
  // dlouhodobý růst ceny za hodinu
  drift: number;
  crypto?: boolean;
};

const asset = (
  id: AssetId,
  cat: AssetCategoryId,
  base: number,
  vol: number,
  yieldRate: number,
  drift: number,
  extra: { seed?: string; crypto?: boolean } = {},
): AssetDef => ({ id, cat, seed: extra.seed ?? id, base, vol, yield: yieldRate, drift, ...(extra.crypto ? { crypto: true } : {}) });

export const ASSETS: AssetDef[] = [
  // kryptoměny (odemknuté až v éře s kryptem)
  asset("coin", "crypto", 500, 0.5, 0, 0, { seed: "crypto", crypto: true }),
  asset("altcoin", "crypto", 120, 0.8, 0, 0.0001, { crypto: true }),
  asset("stablecoin", "crypto", 10, 0.005, 0.0003, 0, { crypto: true }),
  asset("memecoin", "crypto", 5, 1.2, 0, 0, { crypto: true }),
  asset("defi", "crypto", 80, 0.6, 0.0002, 0.00005, { crypto: true }),
  // pozemky a nemovitosti (výnos násobí nájem ve městě)
  asset("flat", "realestate", 50_000, 0.04, 0.005, 0.00008, { seed: "realestate" }),
  asset("house", "realestate", 120_000, 0.05, 0.004, 0.00006),
  asset("land", "realestate", 20_000, 0.03, 0, 0.0001),
  asset("office", "realestate", 200_000, 0.06, 0.006, 0.00004),
  // akcie
  asset("technology", "stocks", 100, 0.18, 0.00025, 0.00015, { seed: "stocks" }),
  asset("energy", "stocks", 80, 0.08, 0.0003, 0.00003),
  asset("bank", "stocks", 60, 0.12, 0.0004, 0.00005),
  asset("consumer", "stocks", 40, 0.1, 0.0002, 0.00004),
  asset("biotech", "stocks", 150, 0.35, 0, 0.0001),
  // kovy
  asset("gold", "metals", 2_000, 0.07, 0, 0.00005, { seed: "metal" }),
  asset("silver", "metals", 30, 0.1, 0, 0.00003),
  asset("copper", "metals", 150, 0.12, 0, 0.00002),
  // dluhopisy
  asset("state", "bonds", 1_000, 0.01, 0.0015, 0, { seed: "bonds" }),
  asset("corporate", "bonds", 1_000, 0.03, 0.0022, 0),
  asset("junk", "bonds", 1_000, 0.12, 0.004, 0),
  // fondy
  asset("index", "funds", 300, 0.03, 0.0008, 0.00003, { seed: "fund" }),
  asset("dividend", "funds", 200, 0.02, 0.0012, 0.00001),
  asset("theme", "funds", 250, 0.08, 0.0002, 0.00008),
  // startupy: vysoké riziko, bez výnosu, nejvyšší očekávaný růst
  asset("startup_it", "startups", 200, 0.4, 0, 0.0002, { seed: "startup" }),
  asset("startup_fintech", "startups", 150, 0.5, 0, 0.00025),
  asset("startup_green", "startups", 120, 0.3, 0, 0.00015),
];

// Staré obecné názvy držeb -> výchozí položka. Při načtení se držby přesunou (viz normalizeState).
const LEGACY_ASSET: Partial<Record<AssetId, string>> = {
  coin: "crypto",
  flat: "realestate",
  technology: "stocks",
  gold: "metal",
  state: "bonds",
  index: "fund",
  startup_it: "startup",
};

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
  const def = assetDef(id);
  const phaseA = hash32(`${def.seed}:a`) * Math.PI * 2;
  const phaseB = hash32(`${def.seed}:b`) * Math.PI * 2;
  const hours = now / H;
  const wave = 0.6 * Math.sin(hours / 0.5 + phaseA) + 0.4 * Math.sin(hours / 0.12 + phaseB);
  const noise = (hash32(`${def.seed}:${Math.floor(now / 60_000)}`) - 0.5) * 0.3;
  const trend = 1 + def.drift * (hours % 5_000);
  return Math.max(1, def.base * trend * (1 + def.vol * (wave + noise))) * assetEventMult(id, now);
}

// Dva trhy, které se krátkodobě rozcházejí. Rozdíl mezi nimi je příležitost pro arbitráž.
export function arbitrageSpread(now: number): number {
  const h = now / H;
  const a = Math.sin(h * 20 + 0.7) * 0.5 + Math.sin(h * 70 + 2.1) * 0.5;
  const b = Math.sin(h * 17 + 4.2) * 0.5 + Math.sin(h * 55 + 0.3) * 0.5;
  return Math.abs(a - b) * 0.03;
}

// --- Tržní zprávy (ovlivní ceny aktiv) ---
// Každé tři hodiny přijde jedna zpráva a platí hodinu. Působí na celou kategorii nebo na všechno. Počítá se podle času, stejně na serveru i v prohlížeči.
export const ASSET_EVENT_WINDOW_MS = 3 * H;
export const ASSET_EVENT_DURATION_MS = H;
export type AssetEventDef = { id: string; affects: "all" | AssetCategoryId[]; mult: number };
export const ASSET_EVENTS: AssetEventDef[] = [
  { id: "cryptoRally", affects: ["crypto"], mult: 1.5 },
  { id: "cryptoCrash", affects: ["crypto"], mult: 0.6 },
  { id: "rateHike", affects: ["bonds", "realestate", "funds"], mult: 0.93 },
  { id: "rateCut", affects: ["bonds", "realestate"], mult: 1.05 },
  { id: "techBoom", affects: ["stocks", "startups"], mult: 1.2 },
  { id: "goldFear", affects: ["metals"], mult: 1.25 },
  { id: "panic", affects: ["stocks", "funds", "startups"], mult: 0.82 },
  { id: "bull", affects: "all", mult: 1.1 },
  { id: "bear", affects: "all", mult: 0.9 },
];
export type ActiveAssetEvent = { def: AssetEventDef; endsAt: number };
export function currentAssetEvent(now: number): ActiveAssetEvent | null {
  const window = Math.floor(now / ASSET_EVENT_WINDOW_MS);
  const offset = now - window * ASSET_EVENT_WINDOW_MS;
  if (offset >= ASSET_EVENT_DURATION_MS) return null;
  const def = ASSET_EVENTS[Math.floor(hash32(`asset-event:${window}`) * ASSET_EVENTS.length)];
  return { def, endsAt: window * ASSET_EVENT_WINDOW_MS + ASSET_EVENT_DURATION_MS };
}
// Násobek ceny z právě běžící zprávy (1 = žádná zpráva na toto aktivum nepůsobí).
export function assetEventMult(id: AssetId, now: number): number {
  const ev = currentAssetEvent(now);
  if (!ev) return 1;
  const cat = assetDef(id).cat;
  return ev.def.affects === "all" || ev.def.affects.includes(cat) ? ev.def.mult : 1;
}

// --- Startupy: kola každých 12 hodin ---
// Držba startupu v každém kole buď vyjde (exit s násobkem vložené ceny), nebo zkrachuje, nebo běží dál.
export const STARTUP_ROUND_MS = 12 * H;
export const STARTUP_EXIT_CHANCE = 0.2;
export const STARTUP_KRACH_CHANCE = 0.15;
// Kolo, které uplynulo bez přepočtu (dlouhá nepřítomnost), se nevyhodnocuje po jednom: vezme se nejvýš tolik posledních kol.
export const STARTUP_MAX_ROUNDS = 30;
export type StartupOutcome = { kind: "run" } | { kind: "krach" } | { kind: "exit"; mult: number };
export const startupRoundOf = (now: number) => Math.floor(now / STARTUP_ROUND_MS);
export function startupOutcome(id: AssetId, round: number): StartupOutcome {
  const r = hash32(`startup-round:${id}:${round}`);
  if (r < STARTUP_EXIT_CHANCE) return { kind: "exit", mult: 1.8 + hash32(`startup-mult:${id}:${round}`) * 0.8 };
  if (r < STARTUP_EXIT_CHANCE + STARTUP_KRACH_CHANCE) return { kind: "krach" };
  return { kind: "run" };
}
export const STARTUP_IDS: AssetId[] = ASSETS.filter((a) => a.cat === "startups").map((a) => a.id);

// --- Příkazy (limitní, stop-loss, take-profit) ---
// Příkaz čeká, až cena dosáhne hranice. Plní se stejně jako příjmy: při přepočtu stavu, nejvýš do offline okna.
export const MAX_ORDERS = 8;
export const ORDER_CHECK_MS = 10 * 60_000;
const ORDER_MAX_SAMPLES = 400;
export type OrderSide = "buy" | "sell";
// "below": spustit, když cena klesne na hranici (limitní nákup, stop-loss). "above": když vystoupá (take-profit, nákup na průrazu).
export type OrderWhen = "below" | "above";
export type Order = { id: string; asset: AssetId; side: OrderSide; when: OrderWhen; price: number; amount: number; share: number; createdAt: number };

// Zprávy z trhu: výsledky kol startupů a naplněné příkazy.
export const NEWS_MAX = 12;
export const NEWS_KINDS = ["startup-exit", "startup-krach", "buy-filled", "sell-filled", "order-failed"] as const;
export type NewsKind = (typeof NEWS_KINDS)[number];
export type NewsItem = { t: number; kind: NewsKind; asset: AssetId; amount: number };

// Historie hodnoty: jmění (w) a hodnota investic (p), zapisuje se každou čtvrt hodinu.
export const HISTORY_STEP_MS = 15 * 60_000;
export const HISTORY_MAX = 96;
export type HistoryPoint = { t: number; w: number; p: number };

export const portfolioValue = (state: Pick<EconomyState, "holdings">, now: number): number =>
  ASSETS.reduce((sum, a) => sum + (state.holdings[a.id] ?? 0) * assetPrice(a.id, now), 0);

// --- Hustle ---

export type HustleId = "lemonade" | "reselling" | "carflip" | "houseflip" | "startup";
export type HustleDef = { id: HustleId; cost: number; minutes: number; min: number; max: number };
// Výsledek je násobek vloženého kapitálu mezi min a max (rozloženo rovnoměrně). Střední hodnota je mírně nad 1.
export const HUSTLES: HustleDef[] = [
  { id: "lemonade", cost: 50, minutes: 1, min: 0.6, max: 1.8 },
  { id: "reselling", cost: 200, minutes: 1, min: 0.85, max: 1.5 },
  { id: "carflip", cost: 5_000, minutes: 5, min: 0.8, max: 1.55 },
  { id: "houseflip", cost: 60_000, minutes: 20, min: 0.75, max: 1.6 },
  { id: "startup", cost: 150_000, minutes: 45, min: 0.3, max: 3.2 },
];
// Předčasný prodej rozjetého hustlu: nabídka roste od vkladu k výplatě, prodej teď stojí poplatek.
export const HUSTLE_CASHOUT_FEE = 0.05;
export type HustleSlot = { startedAt: number; payout: number; stake: number } | null;
// Vklad je libovolná celá částka (nejvýš do výše hotovosti). Riziko 1–100 % určuje, jak široký je rozsah výplaty
// kolem střední hodnoty: 1 % = téměř jistý výsledek, 100 % = plný rozsah hustlu.
export const HUSTLE_RISK_DEFAULT = 100;
export const isHustleStake = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 1e12;
export const isHustleRisk = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 100;
export type HustleOptions = { stake?: unknown; risk?: unknown };

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
  companies: Partial<Record<CompanyId, number>>;
  // nastavení firem (jen pro obory, které hráč vlastní)
  setup: Partial<Record<CompanyId, CompanySetup>>;
  // na kterou událost (číslo okna) hráč u firmy zareagoval
  responses: Partial<Record<CompanyId, number>>;
  holdings: Partial<Record<AssetId, number>>;
  // průměrná nákupní cena držených kusů (jen pro zobrazení zisku)
  cost: Partial<Record<AssetId, number>>;
  hustle: Partial<Record<HustleId, HustleSlot>>;
  edu: number;
  arbReadyAt: number;
  // čekající příkazy, pořadové číslo příkazu, zprávy z trhu, historie hodnoty
  orders: Order[];
  orderSeq: number;
  news: NewsItem[];
  history: HistoryPoint[];
  // poslední vyhodnocené kolo startupu u držené položky (kolo, které nastalo po nákupu, už platí)
  startupRound: Partial<Record<AssetId, number>>;
  // časový posun a kotva herních hodin (viz gameNow)
  speed: Speed;
  clock: GameClock;
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
  | "ready"
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
    companies: {},
    setup: {},
    responses: {},
    holdings: {},
    cost: {},
    hustle: {},
    edu: 0,
    arbReadyAt: 0,
    orders: [],
    orderSeq: 0,
    news: [],
    history: [],
    startupRound: {},
    speed: 1,
    clock: { real: now, game: now },
  };
}

const finite = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
}

export function normalizeState(raw: unknown, real: number): EconomyState {
  const base = emptyState(real);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const speed: Speed = isSpeed(r.speed) ? r.speed : 1;
  const k = (r.clock ?? {}) as Partial<Record<keyof GameClock, unknown>>;
  const clock: GameClock = { real: finite(k.real, real, 0, real), game: finite(k.game, real, 0, 1e15) };
  // Kotva je v herním čase; ořezy níž se počítají proti herním hodinám, jinak by se zrychlený čas useknul.
  const now = gameNow({ speed, clock }, real);

  const c = r.character as Record<string, unknown> | null | undefined;
  const name = cleanName(c?.name);
  const character: Character | null =
    c && name && isCountry(c.country) && isCity(c.city) && isEra(c.era) && isFamily(c.family)
      ? { country: c.country, name, city: c.city, era: c.era, family: c.family }
      : null;

  const companies: EconomyState["companies"] = {};
  const setup: EconomyState["setup"] = {};
  const responses: EconomyState["responses"] = {};
  const win = eventWindow(now);
  for (const def of COMPANIES) {
    const n = Math.floor(finite((r.companies as Record<string, unknown> | undefined)?.[def.id], 0, 0, MAX_COMPANY_UNITS));
    if (n > 0) companies[def.id] = n;
    const s = (r.setup as Record<string, Partial<Record<keyof CompanySetup, unknown>>> | undefined)?.[def.id];
    if (n > 0 && s && typeof s === "object") {
      setup[def.id] = {
        upgraded: s.upgraded === true,
        staff: Math.floor(finite(s.staff, 0, 0, n * MAX_STAFF_PER_UNIT)),
        price: clampSetting("price", finite(s.price, 1, SETTING_RANGE.price.min, SETTING_RANGE.price.max)),
        output: clampSetting("output", finite(s.output, 1, SETTING_RANGE.output.min, SETTING_RANGE.output.max)),
        risk: clampSetting("risk", finite(s.risk, 0.3, SETTING_RANGE.risk.min, SETTING_RANGE.risk.max)),
        marketingUntil: finite(s.marketingUntil, 0, 0, now + EVENT_WINDOW_MS),
      };
    }
    const resp = (r.responses as Record<string, unknown> | undefined)?.[def.id];
    if (n > 0 && typeof resp === "number" && Number.isFinite(resp) && resp <= win) responses[def.id] = Math.floor(resp);
  }
  const hIn = (r.holdings ?? {}) as Record<string, unknown>;
  const cIn = (r.cost ?? {}) as Record<string, unknown>;
  const raises: EconomyState["raises"] = {};
  for (const def of JOBS) {
    const v = finite((r.raises as Record<string, unknown> | undefined)?.[def.id], 1, 1, RAISE_MAX);
    if (v > 1) raises[def.id] = v;
  }
  const holdings: EconomyState["holdings"] = {};
  const cost: EconomyState["cost"] = {};
  for (const a of ASSETS) {
    const old = LEGACY_ASSET[a.id];
    const qNew = finite(hIn[a.id], 0, 0, 1e9);
    const qOld = old ? finite(hIn[old], 0, 0, 1e9) : 0;
    const q = qNew + qOld;
    if (q > 0) {
      const cNew = finite(cIn[a.id], a.base, 0, 1e12);
      const cOld = old ? finite(cIn[old], a.base, 0, 1e12) : cNew;
      holdings[a.id] = q;
      // nákupní cena na kus: vážený průměr, pokud se stará a nová držba slily
      cost[a.id] = (qNew * cNew + qOld * cOld) / q;
    }
  }
  const hustle: EconomyState["hustle"] = {};
  for (const h of HUSTLES) {
    const s = (r.hustle as Record<string, { startedAt?: unknown; payout?: unknown; stake?: unknown } | null> | undefined)?.[h.id];
    if (s && typeof s === "object") {
      const stake = finite(s.stake, h.cost, 1, 1e12);
      hustle[h.id] = { startedAt: finite(s.startedAt, now, 0, now), payout: finite(s.payout, 0, 0, stake * h.max), stake };
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

  const startupRound: EconomyState["startupRound"] = {};
  const srIn = (r.startupRound ?? {}) as Record<string, unknown>;
  for (const id of STARTUP_IDS) {
    const v = srIn[id];
    if (typeof v === "number" && Number.isFinite(v)) startupRound[id] = Math.floor(Math.min(1e12, Math.max(0, v)));
  }

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
    companies,
    setup,
    responses,
    holdings,
    cost,
    hustle,
    edu: Math.floor(finite(r.edu, 0, 0, MAX_EDU)),
    arbReadyAt: finite(r.arbReadyAt, 0, 0, now + ARB_COOLDOWN_MS),
    orders: normalizeOrders(r.orders, now),
    orderSeq: Math.floor(finite(r.orderSeq, 0, 0, 1e9)),
    news: normalizeNews(r.news, now),
    history: normalizeHistory(r.history, now),
    startupRound,
    speed,
    clock,
  };
}

function normalizeOrders(raw: unknown, now: number): Order[] {
  if (!Array.isArray(raw)) return [];
  const out: Order[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== "string" || o.id.length > 40 || !isAsset(o.asset)) continue;
    if ((o.side !== "buy" && o.side !== "sell") || (o.when !== "below" && o.when !== "above")) continue;
    const price = finite(o.price, 0, 0, 1e15);
    if (price <= 0) continue;
    out.push({
      id: o.id,
      asset: o.asset,
      side: o.side as OrderSide,
      when: o.when as OrderWhen,
      price,
      amount: finite(o.amount, 0, 0, 1e15),
      share: finite(o.share, 0, 0, 1),
      createdAt: finite(o.createdAt, now, 0, now),
    });
    if (out.length >= MAX_ORDERS) break;
  }
  return out;
}

function normalizeNews(raw: unknown, now: number): NewsItem[] {
  if (!Array.isArray(raw)) return [];
  const out: NewsItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const n = x as Record<string, unknown>;
    if (!(NEWS_KINDS as readonly unknown[]).includes(n.kind) || !isAsset(n.asset)) continue;
    out.push({ t: finite(n.t, now, 0, now), kind: n.kind as NewsKind, asset: n.asset, amount: finite(n.amount, 0, 0, 1e15) });
  }
  return out.slice(-NEWS_MAX);
}

function normalizeHistory(raw: unknown, now: number): HistoryPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryPoint[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const h = x as Record<string, unknown>;
    out.push({ t: finite(h.t, now, 0, now), w: finite(h.w, 0, -1e15, 1e15), p: finite(h.p, 0, 0, 1e15) });
  }
  return out.slice(-HISTORY_MAX);
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
  // provoz firem (výdaje, nenásobí se bonusy)
  companyCosts: number;
  // všechny příjmy se násobí multiplier (vzdělání + učení + rozšíření)
  multiplier: number;
  // čistý příjem za hodinu
  net: number;
  // z passive: výnos z akcií (dividendy) za hodinu
  dividends: number;
};

export const setupOf = (state: EconomyState, id: CompanyId): CompanySetup => state.setup[id] ?? DEFAULT_SETUP;
const familyCompany = (state: EconomyState) => (state.character ? FAMILY_DEF[state.character.family].company : 1);
export const upgradePrice = (state: EconomyState, id: CompanyId) => Math.round(companyDef(id).cost * UPGRADE_COST_MULT * familyCompany(state));
export const hireCost = (id: CompanyId) => Math.round(companyIncome(id) * STAFF_WAGE * INCOME_SPEED * STAFF_HIRE_HOURS);
export const campaignPrice = (state: EconomyState, id: CompanyId) => Math.round(companyDef(id).cost * (state.companies[id] ?? 0) * MARKETING_COST * familyCompany(state));
export const fundPrice = (state: EconomyState, id: CompanyId) => Math.round(companyDef(id).cost * (state.companies[id] ?? 0) * FUND_COST * familyCompany(state));

// Účinek právě běžící události na jednu firmu (jen když ji hráč nezmírnil krizovým fondem).
export function eventEffect(state: EconomyState, id: CompanyId, now: number): { mult: number; wageMult: number } {
  const ev = currentEvent(now);
  if (!ev || !eventAffects(ev.def, id)) return { mult: 1, wageMult: 1 };
  const s = setupOf(state, id);
  // Cena i riziko zvyšují citlivost na událost.
  const exposure = riskExposure(s.risk) * s.price;
  const saved = state.responses[id] === ev.window ? 1 - FUND_SAVES : 1;
  const d = ev.def;
  const mult = d.mult < 1 ? Math.max(0.05, 1 - (1 - d.mult) * exposure * saved) : 1 + (d.mult - 1) * exposure;
  return { mult, wageMult: 1 + (d.wageMult - 1) * saved };
}

// Výnos jedné firmy za hodinu (na jeden kus = companyIncome) a její provozní výdaje.
export function companyYield(state: EconomyState, id: CompanyId, now: number): { gross: number; costs: number } {
  const n = state.companies[id] ?? 0;
  if (n <= 0) return { gross: 0, costs: 0 };
  const s = setupOf(state, id);
  const effect = eventEffect(state, id, now);
  const base = n * companyIncome(id);
  const staffMult = 1 + STAFF_OUTPUT * (s.staff / n);
  const boost =
    (s.upgraded ? 1 + UPGRADE_BONUS : 1) *
    s.price *
    s.output *
    riskOutput(s.risk) *
    (now < s.marketingUntil ? MARKETING_BONUS : 1) *
    staffMult *
    effect.mult;
  return {
    gross: base * boost,
    costs: base * upkeepShare(s.output) + s.staff * companyIncome(id) * STAFF_WAGE * effect.wageMult,
  };
}

const avgPerf = (perfs: number[]) => (perfs.length ? perfs.reduce((a, b) => a + b, 0) / perfs.length : 0);

export function rates(state: EconomyState, now: number, learning = 0): Rates {
  const ch = state.character;
  if (!ch) return { salary: 0, companies: 0, passive: 0, living: 0, companyCosts: 0, multiplier: 1, net: 0, dividends: 0 };
  const country = COUNTRY_DEF[ch.country];
  const city = CITY_DEF[ch.city];
  const family = FAMILY_DEF[ch.family];
  const multiplier = 1 + eduBonus(state.edu) + Math.min(MAX_LEARNING_BONUS, Math.max(0, learning));

  // Pasivní plat: 60 % stupně, nic během nemoci, polovina na dovolené.
  const passiveFactor = state.sickUntil > now ? 0 : state.vacationUntil > now ? VACATION_PAY : 1;
  const salary = jobHourly(state, now) * PASSIVE_SHARE * passiveFactor;

  let companies = 0;
  let companyCosts = 0;
  for (const c of COMPANIES) {
    const y = companyYield(state, c.id, now);
    companies += y.gross;
    companyCosts += y.costs;
  }
  let passive = 0;
  let dividends = 0;
  for (const a of ASSETS) {
    if (!a.yield) continue;
    const qty = state.holdings[a.id] ?? 0;
    if (qty <= 0) continue;
    const income = qty * assetPrice(a.id, now) * a.yield * (a.cat === "realestate" ? city.rent : 1);
    passive += income;
    if (a.cat === "stocks") dividends += income;
  }
  // Životní náklady jsou malé, ale rostou s tím, jak jsi na tom líp (aby hráč nebyl zadarmo bohatý).
  const living = (6 * country.living * city.living * family.living) * (1 + Math.log10(1 + (state.cash + 0) / 1000) * 0.5);
  const gross = (salary + companies + passive) * multiplier * INCOME_SPEED;
  return {
    salary: salary * INCOME_SPEED,
    companies: companies * INCOME_SPEED,
    passive: passive * INCOME_SPEED,
    living: living * INCOME_SPEED,
    companyCosts: companyCosts * INCOME_SPEED,
    multiplier,
    net: gross - (living + companyCosts) * INCOME_SPEED,
    dividends: dividends * INCOME_SPEED,
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
  for (const h of HUSTLES) total += state.hustle[h.id]?.stake ?? 0;
  return Math.round(total);
}

// Herní čas v okamžiku reálného času `real`: od kotvy běží rychlostí `speed`.
export function gameNow(state: Pick<EconomyState, "speed" | "clock">, real: number): number {
  return state.clock.game + Math.max(0, real - state.clock.real) * state.speed;
}

// Připíše příjem za uplynulý čas a doplní energii. Sazba se bere z poloviny úseku (cena aktiv se mění), proto stačí hrubý odhad.
// Prémie se vyplácí jednou za den, bez ohledu na offline strop.
export function settle(state: EconomyState, now: number, learning = 0): EconomyState {
  if (!state.character) return { ...state, lastSeen: now };
  const elapsed = Math.min(Math.max(0, now - state.lastSeen), MAX_OFFLINE_MIN * 60_000 * state.speed);
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
  next = resolveStartups(next, now);
  next = fillOrders(next, now - elapsed, now);
  next = recordHistory(next, now);
  return withPeak(next, now);
}

// Zapíše nový bod do historie, nejvýš jednou za čtvrt hodiny.
function recordHistory(state: EconomyState, now: number): EconomyState {
  const last = state.history[state.history.length - 1];
  if (last && now - last.t < HISTORY_STEP_MS) return state;
  const point: HistoryPoint = { t: now, w: netWorth(state, now), p: portfolioValue(state, now) };
  return { ...state, history: [...state.history, point].slice(-HISTORY_MAX) };
}

function pushNews(state: EconomyState, item: NewsItem): EconomyState {
  return { ...state, news: [...state.news, item].slice(-NEWS_MAX) };
}

// Vyhodnotí kola startupů, která od posledního přepočtu nastala u držených položek.
function resolveStartups(state: EconomyState, now: number): EconomyState {
  const cur = startupRoundOf(now);
  const rounds: Partial<Record<AssetId, number>> = { ...state.startupRound };
  let s = state;
  for (const id of STARTUP_IDS) {
    if ((s.holdings[id] ?? 0) <= 0) {
      rounds[id] = cur;
      continue;
    }
    const last = rounds[id] ?? cur;
    for (let r = Math.max(last + 1, cur - STARTUP_MAX_ROUNDS + 1); r <= cur; r++) {
      const qty = s.holdings[id] ?? 0;
      if (qty <= 0) break;
      const out = startupOutcome(id, r);
      if (out.kind === "run") continue;
      const price = assetPrice(id, r * STARTUP_ROUND_MS);
      const basis = qty * (s.cost[id] ?? price);
      if (out.kind === "exit") {
        const money = qty * price * out.mult;
        s = pushNews(closePosition(s, id, money, basis), { t: r * STARTUP_ROUND_MS, kind: "startup-exit", asset: id, amount: Math.round(money) });
      } else {
        s = pushNews(closePosition(s, id, 0, basis), { t: r * STARTUP_ROUND_MS, kind: "startup-krach", asset: id, amount: Math.round(qty * price) });
      }
    }
    rounds[id] = cur;
  }
  return { ...s, startupRound: rounds };
}

// Uzavře celou držbu a připíše výtěžek (u krachu nulový). Do celkového výdělku se počítá jen kladný zisk.
function closePosition(state: EconomyState, id: AssetId, cash: number, basis: number): EconomyState {
  const holdings = { ...state.holdings };
  const cost = { ...state.cost };
  delete holdings[id];
  delete cost[id];
  return { ...state, cash: state.cash + cash, holdings, cost, totalEarned: state.totalEarned + Math.max(0, cash - basis) };
}

// Plní čekající příkazy, pokud cena v úseku [from, to] dosáhla hranice. Kontroluje se po krocích, ne jen na konci.
function fillOrders(state: EconomyState, from: number, to: number): EconomyState {
  if (state.orders.length === 0 || to <= from) return state;
  const step = Math.max(ORDER_CHECK_MS, Math.ceil((to - from) / ORDER_MAX_SAMPLES));
  let s = state;
  for (let at = from + step; ; at += step) {
    const t = Math.min(at, to);
    s = fillOrdersAt(s, t);
    if (t >= to || s.orders.length === 0) break;
  }
  return s;
}

function fillOrdersAt(state: EconomyState, at: number): EconomyState {
  let s = state;
  for (const o of state.orders) {
    const p = assetPrice(o.asset, at);
    const hit = o.when === "below" ? p <= o.price : p >= o.price;
    if (!hit) continue;
    s = { ...s, orders: s.orders.filter((x) => x.id !== o.id) };
    if (o.side === "buy") {
      const money = Math.min(o.amount, s.cash);
      s = money < 1
        ? pushNews(s, { t: at, kind: "order-failed", asset: o.asset, amount: 0 })
        : pushNews(applyBuy(s, o.asset, money, p, at), { t: at, kind: "buy-filled", asset: o.asset, amount: Math.round(money) });
    } else if ((s.holdings[o.asset] ?? 0) <= 0) {
      s = pushNews(s, { t: at, kind: "order-failed", asset: o.asset, amount: 0 });
    } else {
      const sold = applySell(s, o.asset, o.share, p);
      s = pushNews(sold.state, { t: at, kind: "sell-filled", asset: o.asset, amount: Math.round(sold.money) });
    }
  }
  return s;
}

function withPeak(state: EconomyState, now: number): EconomyState {
  const worth = netWorth(state, now);
  return { ...state, peak: Math.max(state.peak, worth), best: Math.max(state.best, worth) };
}

const fail = (error: ErrorCode): ActionResult => ({ ok: false, error });

// Přepne rychlost času. Volá se až po připsání příjmu, takže se nic nepočítá starou rychlostí navíc.
export function setSpeed(state: EconomyState, speed: unknown, real: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isSpeed(speed)) return fail("bad-request");
  return { ok: true, state: { ...state, speed, clock: { real, game: gameNow(state, real) } } };
}
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
  return done({ ...emptyState(now, state.runs, state.best), speed: state.speed, clock: state.clock, character, cash, peak: cash }, now);
}

// Začít znovu: smaže postup a postavu, zůstane rekord a počet pokusů.
export function restart(state: EconomyState, now: number): ActionResult {
  return { ok: true, state: { ...emptyState(now, state.runs + 1, state.best), speed: state.speed, clock: state.clock } };
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

// Akce v detailu firmy. Všechny vyžadují, že firmu vlastníš.
function ownedCompany(state: EconomyState, id: unknown): { id: CompanyId; error?: ErrorCode } {
  if (!state.character) return { id: "shoes", error: "no-character" };
  if (!isCompany(id)) return { id: "shoes", error: "bad-request" };
  if ((state.companies[id] ?? 0) <= 0) return { id, error: "nothing" };
  return { id };
}

const withSetup = (state: EconomyState, id: CompanyId, patch: Partial<CompanySetup>): EconomyState["setup"] => ({
  ...state.setup,
  [id]: { ...setupOf(state, id), ...patch },
});

export function upgradeCompany(state: EconomyState, id: unknown, now: number): ActionResult {
  const o = ownedCompany(state, id);
  if (o.error) return fail(o.error);
  if (setupOf(state, o.id).upgraded) return fail("max");
  const price = upgradePrice(state, o.id);
  if (state.cash < price) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - price, setup: withSetup(state, o.id, { upgraded: true }) }, now);
}

export function hireStaff(state: EconomyState, id: unknown, delta: unknown, now: number): ActionResult {
  const o = ownedCompany(state, id);
  if (o.error) return fail(o.error);
  if (delta !== 1 && delta !== -1) return fail("bad-request");
  const s = setupOf(state, o.id);
  const n = state.companies[o.id] ?? 0;
  if (delta === -1) {
    if (s.staff <= 0) return fail("nothing");
    return done({ ...state, setup: withSetup(state, o.id, { staff: s.staff - 1 }) }, now);
  }
  if (s.staff >= n * MAX_STAFF_PER_UNIT) return fail("max");
  const fee = hireCost(o.id);
  if (state.cash < fee) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - fee, setup: withSetup(state, o.id, { staff: s.staff + 1 }) }, now);
}

// Nastavení čísla (cena, výroba, riziko) v rozsahu SETTING_RANGE. Hodnota se zaokrouhlí a ořízne.
export function setCompanySetting(state: EconomyState, id: unknown, field: unknown, value: unknown, now: number): ActionResult {
  const o = ownedCompany(state, id);
  if (o.error) return fail(o.error);
  if (field !== "price" && field !== "output" && field !== "risk") return fail("bad-request");
  if (typeof value !== "number" || !Number.isFinite(value)) return fail("bad-request");
  const v = clampSetting(field, value);
  const patch: Partial<CompanySetup> = field === "price" ? { price: v } : field === "output" ? { output: v } : { risk: v };
  return done({ ...state, setup: withSetup(state, o.id, patch) }, now);
}

export function runCampaign(state: EconomyState, id: unknown, now: number): ActionResult {
  const o = ownedCompany(state, id);
  if (o.error) return fail(o.error);
  if (now < setupOf(state, o.id).marketingUntil) return fail("busy");
  const price = campaignPrice(state, o.id);
  if (state.cash < price) return fail("not-enough-cash");
  return done(
    { ...state, cash: state.cash - price, setup: withSetup(state, o.id, { marketingUntil: now + MARKETING_MINUTES * 60_000 }) },
    now,
  );
}

// Reakce na negativní událost: krizový fond zmírní ztrátu. Jen jednou za událost a u firmy, kterou událost zasáhla.
export function fundResponse(state: EconomyState, id: unknown, now: number): ActionResult {
  const o = ownedCompany(state, id);
  if (o.error) return fail(o.error);
  const ev = currentEvent(now);
  if (!ev || !isNegativeEvent(ev.def) || !eventAffects(ev.def, o.id)) return fail("nothing");
  if (state.responses[o.id] === ev.window) return fail("busy");
  const price = fundPrice(state, o.id);
  if (state.cash < price) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - price, responses: { ...state.responses, [o.id]: ev.window } }, now);
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
  return done(applyBuy(state, id, money, assetPrice(id, now), now), now);
}

// Nákup za hotovost za zadanou cenu kusu. Sdílí ho přímý nákup i plnění příkazu.
function applyBuy(state: EconomyState, id: AssetId, money: number, price: number, now: number): EconomyState {
  const qty = money / price;
  const have = state.holdings[id] ?? 0;
  const avg = state.cost[id] ?? price;
  const newCost = (have * avg + money) / (have + qty);
  // Nová držba startupu se poprvé vyhodnotí až v dalším kole, ne v tom, ve kterém byla koupena.
  const startupRound = have <= 0 && assetDef(id).cat === "startups" ? { ...state.startupRound, [id]: startupRoundOf(now) } : state.startupRound;
  return {
    ...state,
    cash: state.cash - money,
    holdings: { ...state.holdings, [id]: have + qty },
    cost: { ...state.cost, [id]: newCost },
    startupRound,
  };
}

// Prodej podílu držby za zadanou cenu. Sdílí ho přímý prodej i plnění příkazu.
function applySell(state: EconomyState, id: AssetId, share: number, price: number): { state: EconomyState; money: number; profit: number } {
  const have = state.holdings[id] ?? 0;
  const qty = have * share;
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
  const next = { ...state, cash: state.cash + money, holdings, cost, totalEarned: state.totalEarned + Math.max(0, profit) };
  return { state: next, money, profit };
}

// Prodej za podíl držených kusů (0–1], nebo všeho.
export function sellAsset(state: EconomyState, id: unknown, share: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isAsset(id)) return fail("bad-request");
  const have = state.holdings[id] ?? 0;
  if (have <= 0) return fail("nothing");
  const s = typeof share === "number" && Number.isFinite(share) ? Math.min(1, Math.max(0, share)) : 1;
  if (s <= 0) return fail("bad-request");
  const sold = applySell(state, id, s, assetPrice(id, now));
  return done(sold.state, now, { gained: { cash: Math.round(sold.money), profit: Math.round(sold.profit) } });
}

// Příkaz: nákup nebo prodej, až cena dosáhne hranice. Hranice musí být na správné straně aktuální ceny,
// jinak by se příkaz splnil hned (to je dobře vidět jako chyba, ne jako tichý nákup).
export function placeOrder(
  state: EconomyState,
  input: { asset: unknown; side: unknown; when: unknown; price: unknown; amount: unknown; share: unknown },
  now: number,
): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isAsset(input.asset)) return fail("bad-request");
  const asset = input.asset;
  if (input.side !== "buy" && input.side !== "sell") return fail("bad-request");
  if (input.when !== "below" && input.when !== "above") return fail("bad-request");
  const price = qtyOf(input.price);
  if (price === null) return fail("bad-request");
  const current = assetPrice(asset, now);
  if (input.when === "below" ? price >= current : price <= current) return fail("bad-request");
  if (state.orders.length >= MAX_ORDERS) return fail("max");
  let amount = 0;
  let share = 0;
  if (input.side === "buy") {
    const spend = qtyOf(input.amount);
    if (spend === null) return fail("bad-request");
    amount = spend;
  } else {
    if ((state.holdings[asset] ?? 0) <= 0) return fail("nothing");
    const s = typeof input.share === "number" && Number.isFinite(input.share) ? input.share : 1;
    if (s <= 0 || s > 1) return fail("bad-request");
    share = s;
  }
  const order: Order = {
    id: `o${state.orderSeq}-${now.toString(36)}`,
    asset,
    side: input.side,
    when: input.when,
    price,
    amount,
    share,
    createdAt: now,
  };
  return done({ ...state, orders: [...state.orders, order], orderSeq: state.orderSeq + 1 }, now);
}

export function cancelOrder(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (typeof id !== "string") return fail("bad-request");
  if (!state.orders.some((o) => o.id === id)) return fail("nothing");
  return done({ ...state, orders: state.orders.filter((o) => o.id !== id) }, now);
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
export function startHustle(
  state: EconomyState,
  id: unknown,
  now: number,
  rng: () => number = Math.random,
  opts: HustleOptions = {},
): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  if (state.hustle[id]) return fail("busy");
  const def = hustleDef(id);
  const stake = opts.stake === undefined ? def.cost : opts.stake;
  if (!isHustleStake(stake)) return fail("bad-request");
  const risk = opts.risk === undefined ? HUSTLE_RISK_DEFAULT : opts.risk;
  if (!isHustleRisk(risk)) return fail("bad-request");
  if (state.cash < stake) return fail("not-enough-cash");
  const mid = (def.min + def.max) / 2;
  const half = ((def.max - def.min) / 2) * (risk / 100);
  const payout = Math.round(stake * (mid - half + 2 * half * rng()));
  return done({ ...state, cash: state.cash - stake, hustle: { ...state.hustle, [id]: { startedAt: now, payout, stake } } }, now);
}

// Dokoupení kapitálu během čekání: výplata se zvětší ve stejném poměru jako vklad.
export function topUpHustle(state: EconomyState, id: unknown, now: number, amount: unknown): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  const slot = state.hustle[id];
  if (!slot) return fail("nothing");
  if (hustleReady(slot, id, now)) return fail("ready");
  if (!isHustleStake(amount)) return fail("bad-request");
  const add = amount;
  if (state.cash < add) return fail("not-enough-cash");
  const extra = Math.round((slot.payout / slot.stake) * add);
  const next = { startedAt: slot.startedAt, stake: slot.stake + add, payout: slot.payout + extra };
  return done({ ...state, cash: state.cash - add, hustle: { ...state.hustle, [id]: next } }, now);
}

export const hustleReady = (slot: HustleSlot | undefined, id: HustleId, now: number) =>
  !!slot && now - slot.startedAt >= hustleDef(id).minutes * 60_000;

// Aktuální nabídka kupce: lineárně roste od vloženého kapitálu k výplatě.
export function hustleOffer(slot: NonNullable<HustleSlot>, id: HustleId, now: number): number {
  const def = hustleDef(id);
  const p = Math.min(1, Math.max(0, (now - slot.startedAt) / (def.minutes * 60_000)));
  return Math.round(slot.stake + (slot.payout - slot.stake) * p);
}

// Průběžné rozhodování: hráč může rozjetý hustl prodat dřív za aktuální nabídku (mínus poplatek).
export function cashOutHustle(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  const slot = state.hustle[id];
  if (!slot) return fail("nothing");
  if (hustleReady(slot, id, now)) return fail("ready");
  const value = Math.round(hustleOffer(slot, id, now) * (1 - HUSTLE_CASHOUT_FEE));
  const hustle = { ...state.hustle };
  delete hustle[id];
  const profit = value - slot.stake;
  return done({ ...state, cash: state.cash + value, hustle, totalEarned: state.totalEarned + Math.max(0, profit) }, now, {
    gained: { cash: value, profit },
  });
}

export function collectHustle(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isHustle(id)) return fail("bad-request");
  const slot = state.hustle[id];
  if (!slot) return fail("nothing");
  if (!hustleReady(slot, id, now)) return fail("not-ready");
  const hustle = { ...state.hustle };
  delete hustle[id];
  const profit = slot.payout - slot.stake;
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
