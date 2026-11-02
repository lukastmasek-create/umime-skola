// Herní logika Ekonomiky (nekonečná hra o bohatství). Čistý kód bez databáze a Reactu:
// stejný výpočet běží na serveru (autoritativně) i v prohlížeči (živý odpočet peněz).
//
// Jak Ekonomika funguje:
//  - Hráč si vytvoří postavu (země, jméno, město, doba, rodina). To určuje startovní peníze a drobné bonusy.
//  - Peníze plynou v reálném čase, mimo hru jen chvíli (MAX_OFFLINE_MIN minut): plat z práce, zisk firem,
//    nájmy z nemovitostí, úroky z cenných papírů.
//  - Práce: zaměstnání s platem, který časem roste (zkušenosti). Firmy: stavíš a rozšiřuješ podniky.
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
export const JOB_RANK_HOURS = 0.25;
export const MAX_JOB_RANK = 5;
export const JOB_RANK_BONUS = 0.15;
export const ARB_COOLDOWN_MS = 60_000;
export const ARB_FEE = 0.005;
export const ARB_CAP = 100_000;
const H = 3_600_000;

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

export type JobId = "warehouse" | "seller" | "cook" | "police" | "vet" | "programmer" | "banker";
export type JobDef = { id: JobId; salary: number; fee: number };
// salary = plat za hodinu (rank 1), fee = jednorázový poplatek za kurzy / nástup
export const JOBS: JobDef[] = [
  { id: "warehouse", salary: 40, fee: 0 },
  { id: "seller", salary: 60, fee: 100 },
  { id: "cook", salary: 90, fee: 300 },
  { id: "police", salary: 140, fee: 800 },
  { id: "vet", salary: 320, fee: 3_000 },
  { id: "programmer", salary: 480, fee: 6_000 },
  { id: "banker", salary: 800, fee: 15_000 },
];

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
  job: { id: JobId; hours: number } | null;
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
  | "ready";

export type ActionResult =
  | { ok: true; state: EconomyState; pointsSpent?: number; gained?: { cash?: number; profit?: number } }
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
    companies: {},
    setup: {},
    responses: {},
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
    const s = (r.hustle as Record<string, { startedAt?: unknown; payout?: unknown; stake?: unknown } | null> | undefined)?.[h.id];
    if (s && typeof s === "object") {
      const stake = finite(s.stake, h.cost, 1, 1e12);
      hustle[h.id] = { startedAt: finite(s.startedAt, now, 0, now), payout: finite(s.payout, 0, 0, stake * h.max), stake };
    }
  }
  const j = r.job as { id?: unknown; hours?: unknown } | null | undefined;
  const job = j && isJob(j.id) ? { id: j.id, hours: finite(j.hours, 0, 0, 1e6) } : null;

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
    companies,
    setup,
    responses,
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

export type Rates = {
  salary: number;
  companies: number;
  passive: number;
  living: number;
  // provoz a mzdy firem (výdaje, nenásobí se bonusy)
  companyCosts: number;
  // všechny příjmy se násobí multiplier (vzdělání + učení + rozšíření)
  multiplier: number;
  // čistý příjem za hodinu
  net: number;
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

export function rates(state: EconomyState, now: number, learning = 0): Rates {
  const ch = state.character;
  if (!ch) return { salary: 0, companies: 0, passive: 0, living: 0, companyCosts: 0, multiplier: 1, net: 0 };
  const country = COUNTRY_DEF[ch.country];
  const city = CITY_DEF[ch.city];
  const family = FAMILY_DEF[ch.family];
  const multiplier = 1 + eduBonus(state.edu) + Math.min(MAX_LEARNING_BONUS, Math.max(0, learning));

  const salary = state.job
    ? jobDef(state.job.id).salary * (1 + JOB_RANK_BONUS * (jobRank(state.job.hours) - 1)) * country.salary * city.salary
    : 0;
  let companies = 0;
  let companyCosts = 0;
  for (const c of COMPANIES) {
    const y = companyYield(state, c.id, now);
    companies += y.gross;
    companyCosts += y.costs;
  }
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
    companyCosts: companyCosts * INCOME_SPEED,
    multiplier,
    net: gross - (living + companyCosts) * INCOME_SPEED,
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

// Připíše příjem za uplynulý čas. Sazba se bere z poloviny úseku (cena aktiv se mění), proto stačí hrubý odhad.
export function settle(state: EconomyState, now: number, learning = 0): EconomyState {
  if (!state.character) return { ...state, lastSeen: now };
  const elapsed = Math.min(Math.max(0, now - state.lastSeen), MAX_OFFLINE_MIN * 60_000);
  if (elapsed <= 0) return { ...state, lastSeen: now };
  const hours = elapsed / H;
  const rate = rates(state, state.lastSeen + elapsed / 2, learning);
  const gain = rate.net * hours;
  const cash = Math.max(0, state.cash + gain);
  const earned = gain > 0 ? gain : 0;
  const job = state.job ? { ...state.job, hours: state.job.hours + hours } : null;
  const next: EconomyState = { ...state, cash, job, totalEarned: state.totalEarned + earned, lastSeen: now };
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

export function takeJob(state: EconomyState, id: unknown, now: number): ActionResult {
  if (!state.character) return fail("no-character");
  if (!isJob(id)) return fail("bad-request");
  if (state.job?.id === id) return fail("same-job");
  const fee = jobDef(id).fee;
  if (state.cash < fee) return fail("not-enough-cash");
  return done({ ...state, cash: state.cash - fee, job: { id, hours: 0 } }, now);
}

export function quitJob(state: EconomyState, now: number): ActionResult {
  if (!state.job) return fail("no-job");
  return done({ ...state, job: null }, now);
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
