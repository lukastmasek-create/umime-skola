import type { Locale } from "./config";
import type { AssetId, CityId, CompanyId, CountryId, EraId, FamilyId, HustleId, JobId } from "@/lib/idle/economy";

// Texty Ekonomiky. Zatím česky a anglicky; němčina a ruština zobrazují angličtinu.
export type EconomyText = {
  title: string;
  intro: string;
  login: string;
  loginHint: string;
  unavailable: string;
  loading: string;
  tabs: { overview: string; work: string; companies: string; invest: string; hustle: string; board: string };
  create: {
    title: string;
    hint: string;
    name: string;
    namePlaceholder: string;
    country: string;
    city: string;
    era: string;
    family: string;
    start: string;
    startMoney: string;
  };
  countries: Record<CountryId, string>;
  cities: Record<CityId, string>;
  eras: Record<EraId, string>;
  families: Record<FamilyId, string>;
  jobs: Record<JobId, string>;
  companies: Record<CompanyId, string>;
  assets: Record<AssetId, string>;
  hustles: Record<HustleId, string>;
  cash: string;
  netWorth: string;
  perHour: string;
  best: string;
  runs: string;
  salary: string;
  businessIncome: string;
  passiveIncome: string;
  living: string;
  multiplier: string;
  overviewHint: string;
  learning: string;
  education: string;
  educationHint: string;
  educationBuy: string;
  educationMax: string;
  currentJob: string;
  noJob: string;
  rank: string;
  perHourShort: string;
  take: string;
  quit: string;
  fee: string;
  free: string;
  workHint: string;
  buy: string;
  owned: string;
  earns: string;
  locked1990: string;
  maxed: string;
  companiesHint: string;
  investHint: string;
  holding: string;
  price: string;
  invest: string;
  sell: string;
  sellAll: string;
  all: string;
  profit: string;
  arbitrage: string;
  arbitrageHint: string;
  spread: string;
  arbitrageGo: string;
  arbitrageWait: string;
  hustleHint: string;
  hustleStart: string;
  hustleReady: string;
  hustleRunning: string;
  hustleCollect: string;
  minutes: string;
  hours: string;
  boardHint: string;
  boardEmpty: string;
  you: string;
  yourRank: string;
  restart: string;
  restartConfirm: string;
  restartHint: string;
  saveNote: string;
  toast: { bought: string; sold: string; profit: string; loss: string; created: string; edu: string; job: string; restarted: string };
  errors: Record<string, string>;
};

const cs: EconomyText = {
  title: "Ekonomika",
  intro: "Snaž se zbohatnout. Hra nikdy nekončí, peníze se hromadí i když zrovna nejsi ve hře.",
  login: "Přihlas se",
  loginHint: "Postup v ekonomice se ukládá k tvému účtu.",
  unavailable: "Hra je teď nedostupná, zkus to za chvíli.",
  loading: "Načítám…",
  tabs: { overview: "Přehled", work: "Práce", companies: "Firma", invest: "Investice", hustle: "Hustle", board: "Žebříček" },
  create: {
    title: "Vytvoř si postavu",
    hint: "Volba určuje startovní peníze a drobné bonusy. Kdykoliv můžeš začít znovu s jinou postavou.",
    name: "Jméno",
    namePlaceholder: "Jak se jmenuješ?",
    country: "Země",
    city: "Město",
    era: "Doba",
    family: "Rodina",
    start: "Začít hrát",
    startMoney: "Start s {n}",
  },
  countries: { cz: "Česko", sk: "Slovensko", de: "Německo", us: "USA", gb: "Británie", jp: "Japonsko" },
  cities: { village: "Vesnice", town: "Malé město", city: "Velké město", metropolis: "Metropole" },
  eras: { "1990": "90. léta", "2010": "2010", "2025": "Dnes", "2050": "Budoucnost" },
  families: { poor: "Chudá rodina", middle: "Střední třída", rich: "Bohatá rodina", business: "Podnikatelská rodina" },
  jobs: { warehouse: "Skladník", seller: "Prodejce", cook: "Kuchař", police: "Policista", vet: "Zvěrolékař", programmer: "Programátor", banker: "Bankéř" },
  companies: {
    shoes: "Boty",
    clothes: "Oblečení",
    tech: "Technika",
    delivery: "Rozvážka",
    supermarket: "Supermarket",
    digi: "Digi",
    software: "Software",
    hardware: "Hardware",
    factory: "Fabrika",
  },
  assets: { bonds: "Cenné papíry", metal: "Kovy", stocks: "Akcie", realestate: "Nemovitosti", crypto: "Kryptoměny" },
  hustles: { reselling: "Reselling", carflip: "Flipování aut", houseflip: "Flipování domů" },
  cash: "Hotovost",
  netWorth: "Jmění",
  perHour: "{n} za hodinu",
  best: "Rekord",
  runs: "Pokusů",
  salary: "Plat",
  businessIncome: "Firmy",
  passiveIncome: "Nájmy a úroky",
  living: "Životní náklady",
  multiplier: "Násobek příjmů",
  overviewHint: "Příjem běží v reálném čase, mimo hru nejdéle 12 hodin.",
  learning: "Bonus za dnešní učení",
  education: "Vzdělání",
  educationHint: "Investuj body z učení: každá úroveň trvale zvedne všechny příjmy o 4 %.",
  educationBuy: "Úroveň {n} za {p} bodů",
  educationMax: "Nejvyšší úroveň",
  currentJob: "Tvoje práce",
  noJob: "Zatím nemáš práci.",
  rank: "Pozice {n}",
  perHourShort: "/ h",
  take: "Nastoupit",
  quit: "Dát výpověď",
  fee: "Kurz {n}",
  free: "Zdarma",
  workHint: "Po každých 10 hodinách v práci dostaneš vyšší pozici a víc peněz (až 5 pozic).",
  buy: "Koupit za {n}",
  owned: "Máš: {n}",
  earns: "{n} / h za kus",
  locked1990: "V této době ještě neexistuje",
  maxed: "Maximum",
  companiesHint: "Každá další firma stejného oboru je dražší o 15 %.",
  investHint: "Ceny kolísají. Kup, když jsou nízko, prodej, když jsou vysoko.",
  holding: "Držíš: {v}",
  price: "Cena",
  invest: "Investovat {n}",
  sell: "Prodat polovinu",
  sellAll: "Prodat vše",
  all: "Vše",
  profit: "Zisk",
  arbitrage: "Arbitráž",
  arbitrageHint: "Když se ceny na dvou trzích rozejdou víc než o poplatek, vyděláš na rozdílu. Obchod lze opakovat po 20 minutách.",
  spread: "Rozdíl cen: {n} %",
  arbitrageGo: "Vydělat na rozdílu ({n})",
  arbitrageWait: "Další obchod za {t}",
  hustleHint: "Vlož kapitál, počkej a vyber výsledek. Můžeš vydělat i prodělat.",
  hustleStart: "Začít (vložit {n})",
  hustleReady: "Hotovo!",
  hustleRunning: "Zbývá {t}",
  hustleCollect: "Vybrat výsledek",
  minutes: "{n} min",
  hours: "{n} h",
  boardHint: "Pořadí podle nejvyššího jmění, kterého kdy hráč dosáhl.",
  boardEmpty: "Zatím tu nikdo není.",
  you: "ty",
  yourRank: "Jsi na {n}. místě",
  restart: "Začít znovu",
  restartConfirm: "Opravdu začít znovu? Přijdeš o postavu, firmy i investice. Zůstane ti rekord.",
  restartHint: "Kdykoliv můžeš začít od nuly s novou postavou.",
  saveNote: "Hra se ukládá sama po každé akci.",
  toast: { bought: "Koupeno", sold: "Prodáno za {n}", profit: "Zisk {n}", loss: "Ztráta {n}", created: "Postava vytvořena", edu: "Vzdělání vylepšeno", job: "Nová práce", restarted: "Začínáš znovu" },
  errors: {
    generic: "Něco se nepovedlo.",
    "login-required": "Přihlas se.",
    "bad-request": "Neplatná akce.",
    "no-character": "Nejdřív si vytvoř postavu.",
    "has-character": "Postavu už máš.",
    "not-enough-cash": "Nemáš dost peněz.",
    "not-enough-points": "Nemáš dost bodů z učení.",
    locked: "V téhle době to ještě neexistuje.",
    max: "Dosáhl jsi maxima.",
    "no-job": "Nemáš práci.",
    "same-job": "V téhle práci už jsi.",
    nothing: "Nic k prodeji.",
    busy: "Tohle už běží.",
    "not-ready": "Ještě to není hotové.",
    "no-spread": "Teď se rozdíl cen nevyplatí, zkus to později.",
    cooldown: "Ještě chvíli počkej.",
    conflict: "Hra se mezitím změnila, zkus to znovu.",
    unavailable: "Hra je dočasně nedostupná.",
  },
};

const en: EconomyText = {
  title: "Economy",
  intro: "Try to get rich. The game never ends and your money keeps growing even when you are away.",
  login: "Log in",
  loginHint: "Your economy progress is saved to your account.",
  unavailable: "The game is unavailable right now, try again in a moment.",
  loading: "Loading…",
  tabs: { overview: "Overview", work: "Work", companies: "Company", invest: "Invest", hustle: "Hustle", board: "Leaderboard" },
  create: {
    title: "Create your character",
    hint: "Your choices set your starting money and small perks. You can restart with a new character any time.",
    name: "Name",
    namePlaceholder: "What is your name?",
    country: "Country",
    city: "City",
    era: "Era",
    family: "Family",
    start: "Start playing",
    startMoney: "Start with {n}",
  },
  countries: { cz: "Czechia", sk: "Slovakia", de: "Germany", us: "USA", gb: "Britain", jp: "Japan" },
  cities: { village: "Village", town: "Small town", city: "Big city", metropolis: "Metropolis" },
  eras: { "1990": "The 90s", "2010": "2010", "2025": "Today", "2050": "The future" },
  families: { poor: "Poor family", middle: "Middle class", rich: "Rich family", business: "Business family" },
  jobs: { warehouse: "Warehouse worker", seller: "Salesperson", cook: "Cook", police: "Police officer", vet: "Veterinarian", programmer: "Programmer", banker: "Banker" },
  companies: {
    shoes: "Shoes",
    clothes: "Clothing",
    tech: "Electronics",
    delivery: "Delivery",
    supermarket: "Supermarket",
    digi: "Digital",
    software: "Software",
    hardware: "Hardware",
    factory: "Factory",
  },
  assets: { bonds: "Securities", metal: "Metals", stocks: "Stocks", realestate: "Real estate", crypto: "Crypto" },
  hustles: { reselling: "Reselling", carflip: "Car flipping", houseflip: "House flipping" },
  cash: "Cash",
  netWorth: "Net worth",
  perHour: "{n} per hour",
  best: "Record",
  runs: "Runs",
  salary: "Salary",
  businessIncome: "Companies",
  passiveIncome: "Rent and interest",
  living: "Living costs",
  multiplier: "Income multiplier",
  overviewHint: "Income runs in real time, up to 12 hours while you are away.",
  learning: "Bonus for today's learning",
  education: "Education",
  educationHint: "Invest points from learning: every level permanently raises all income by 4 %.",
  educationBuy: "Level {n} for {p} points",
  educationMax: "Highest level",
  currentJob: "Your job",
  noJob: "You have no job yet.",
  rank: "Rank {n}",
  perHourShort: "/ h",
  take: "Start job",
  quit: "Quit",
  fee: "Course {n}",
  free: "Free",
  workHint: "After every 10 hours at work you get a higher rank and more pay (up to 5 ranks).",
  buy: "Buy for {n}",
  owned: "Owned: {n}",
  earns: "{n} / h each",
  locked1990: "Does not exist in this era yet",
  maxed: "Maximum",
  companiesHint: "Each additional company of the same kind costs 15 % more.",
  investHint: "Prices move. Buy low, sell high.",
  holding: "Holding: {v}",
  price: "Price",
  invest: "Invest {n}",
  sell: "Sell half",
  sellAll: "Sell all",
  all: "All",
  profit: "Profit",
  arbitrage: "Arbitrage",
  arbitrageHint: "When prices on two markets drift apart by more than the fee, you profit from the gap. You can trade again after 20 minutes.",
  spread: "Price gap: {n} %",
  arbitrageGo: "Profit from the gap ({n})",
  arbitrageWait: "Next trade in {t}",
  hustleHint: "Put in capital, wait and collect the result. You can win or lose.",
  hustleStart: "Start (invest {n})",
  hustleReady: "Done!",
  hustleRunning: "{t} left",
  hustleCollect: "Collect result",
  minutes: "{n} min",
  hours: "{n} h",
  boardHint: "Ranked by the highest net worth a player has ever reached.",
  boardEmpty: "Nobody here yet.",
  you: "you",
  yourRank: "You are number {n}",
  restart: "Start over",
  restartConfirm: "Really start over? You lose your character, companies and investments. Your record stays.",
  restartHint: "You can start from zero with a new character any time.",
  saveNote: "The game saves itself after every action.",
  toast: { bought: "Bought", sold: "Sold for {n}", profit: "Profit {n}", loss: "Loss {n}", created: "Character created", edu: "Education improved", job: "New job", restarted: "Starting over" },
  errors: {
    generic: "Something went wrong.",
    "login-required": "Log in.",
    "bad-request": "Invalid action.",
    "no-character": "Create a character first.",
    "has-character": "You already have a character.",
    "not-enough-cash": "Not enough money.",
    "not-enough-points": "Not enough learning points.",
    locked: "That does not exist in this era yet.",
    max: "You reached the maximum.",
    "no-job": "You have no job.",
    "same-job": "You already have this job.",
    nothing: "Nothing to sell.",
    busy: "That is already running.",
    "not-ready": "Not ready yet.",
    "no-spread": "The price gap is not worth it right now, try later.",
    cooldown: "Wait a little longer.",
    conflict: "The game changed in the meantime, try again.",
    unavailable: "The game is temporarily unavailable.",
  },
};

export function getEconomyText(locale: Locale): EconomyText {
  return locale === "cs" ? cs : en;
}
