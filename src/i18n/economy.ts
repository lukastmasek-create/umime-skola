import type { Locale } from "./config";
import type { AssetCategoryId, AssetId, CityId, CompanyId, CountryId, EraId, EventId, FamilyId, HustleId, JobId } from "@/lib/idle/economy";

// Texty Ekonomiky ve všech čtyřech jazycích.
export type EconomyText = {
  // formátování čísel: jazyk pro oddělovače a zkratky řádů (milion, miliarda, bilion)
  numberLocale: string;
  units: { million: string; billion: string; trillion: string };
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
  assetCategories: Record<AssetCategoryId, string>;
  hustles: Record<HustleId, string>;
  // detail firmy: ovládání, které se otevře po kliknutí na „Spravovat“
  detail: {
    open: string;
    close: string;
    upgrade: string;
    upgradeDone: string;
    upgradeBuy: string;
    upgradeHint: string;
    staff: string;
    staffHint: string;
    hire: string;
    fire: string;
    staffFull: string;
    price: string;
    output: string;
    risk: string;
    riskHint: string;
    priceHint: string;
    outputHint: string;
    lessonsTitle: string;
    previewTitle: string;
    previewNow: string;
    previewSafe: string;
    previewBold: string;
    rules: string[];
    tasksTitle: string;
    taskDone: string;
    taskTodo: string;
    tasks: { profit: string; risk: string; fund: string; staff: string };
    campaign: string;
    campaignHint: string;
    campaignGo: string;
    campaignRunning: string;
    eventTitle: string;
    eventNone: string;
    eventFund: string;
    eventFunded: string;
    eventEnds: string;
    eventNoAction: string;
    income: string;
    costs: string;
    net: string;
    sellTitle: string;
    sellHint: string;
    sellGo: string;
    sellConfirm: string;
    contractTitle: string;
    contractHint: string;
    contractGo: string;
    contractRunning: string;
    researchTitle: string;
    researchHint: string;
    researchLevel: string;
    researchGo: string;
    researchMax: string;
    rivalTitle: string;
    rivalNow: string;
    rivalShield: string;
    rivalNone: string;
  };
  phase: {
    names: string[];
    now: string;
    need: string;
    go: string;
    max: string;
    locked: string;
    rates: string;
    title: string;
  };
  events: Record<EventId, { title: string; text: string }>;
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
  incomeTitle: string;
  statsTitle: string;
  vsPeak: string;
  atPeak: string;
  totalEarned: string;
  timePlayed: string;
  days: string;
  assetsTitle: string;
  companiesOwned: string;
  hustlesRunning: string;
  none: string;
  ovSummary: string;
  ovEarnings: string;
  ovAssets: string;
  ovEducation: string;
  centerIncome: string;
  centerAssets: string;
  passiveShare: string;
  bestCompany: string;
  avgDay: string;
  yearlyCost: string;
  companiesPerHour: string;
  noCompany: string;
  shareLabel: string;
  other: string;
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
  risk: string;
  riskLow: string;
  riskMid: string;
  riskHigh: string;
  yieldPerHour: string;
  trend6h: string;
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
  hustlePanel: string;
  hustleOffer: string;
  hustleCashOut: string;
  hustleNone: string;
  hustleStake: string;
  hustleRisk: string;
  riskHint: string;
  hustleAll: string;
  hustleTopUp: string;
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
  toast: {
    bought: string;
    sold: string;
    profit: string;
    loss: string;
    created: string;
    edu: string;
    job: string;
    restarted: string;
    upgraded: string;
    hired: string;
    fired: string;
    level: string;
    campaign: string;
    funded: string;
    companySold: string;
    contract: string;
    researched: string;
  };
  errors: Record<string, string>;
};

const cs: EconomyText = {
  numberLocale: "cs-CZ",
  units: { million: "mil.", billion: "mld.", trillion: "bil." },
  title: "Ekonomika",
  intro: "Snaž se zbohatnout. Hra nikdy nekončí, ale peníze rostou jen, když hraješ. Pořád něco kupuj, obchoduj a vybírej.",
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
    bakery: "Pekárna",
    carwash: "Myčka",
    eshop: "E-shop",
    printshop: "Tiskárna",
    streaming: "Streaming",
  },
  assets: { coin: "Hlavní coin", altcoin: "Altcoin", stablecoin: "Stablecoin", memecoin: "Memecoin", defi: "DeFi token", flat: "Byt", house: "Dům", land: "Pozemek", office: "Kancelář", technology: "Technologie", energy: "Energetika", bank: "Banky", consumer: "Spotřební zboží", biotech: "Biotech", gold: "Zlato", silver: "Stříbro", copper: "Měď", state: "Státní dluhopisy", corporate: "Firemní dluhopisy", junk: "Vysoký výnos", index: "Světový index", dividend: "Dividendový fond", theme: "Tematický fond", startup_it: "Startup IT", startup_fintech: "Startup fintech", startup_green: "Startup zelená energie" },
  assetCategories: { crypto: "Kryptoměny", realestate: "Pozemky a nemovitosti", stocks: "Akcie", metals: "Kovy", bonds: "Dluhopisy", funds: "Fondy", startups: "Startupy" },
  hustles: { lemonade: "Limonádový stánek", reselling: "Reselling", carflip: "Flipování aut", houseflip: "Flipování domů", startup: "Startup" },
  detail: {
    open: "Spravovat",
    close: "Zavřít",
    upgrade: "Vylepšení oboru",
    upgradeDone: "Vylepšeno (+30 %)",
    upgradeBuy: "Vylepšit za {n}",
    upgradeHint: "Jednorázové vylepšení: všechny firmy tohoto oboru vydělávají o 30 % víc.",
    staff: "Zaměstnanci",
    staffHint: "Každý zaměstnanec zvedne výnos, ale stojí mzdu. Nejvíc tři na kus.",
    hire: "Najmout za {n}",
    fire: "Propustit",
    staffFull: "Kapacita je plná",
    price: "Cena produktu",
    output: "Výroba",
    risk: "Riziko",
    riskHint: "Bezpečné: menší výnos a menší dopad krizí. Riskantní: víc výnosu, ale silnější ztráty.",
    priceHint: "Cena: víc za kus, ale firma je citlivější na krize.",
    outputHint: "Výroba: víc zboží, ale vyšší provozní náklady.",
    lessonsTitle: "Pravidla hry",
    previewTitle: "Odhad čistého zisku za hodinu",
    previewNow: "Teď",
    previewSafe: "Při bezpečném nastavení (riziko 0)",
    previewBold: "Při riskantním nastavení (riziko 1)",
    rules: [
      "Výnos firmy = kusy × zisk kusu × cena × výroba × riziko.",
      "Riziko zvyšuje výnos, ale i ztrátu při události.",
      "Výroba stojí provoz. Vysoká výroba se vyplatí, jen když máš peníze na provoz.",
      "Krizový fond zmírní ztrátu z události. Jde zaplatit jednou za událost.",
    ],
    tasksTitle: "Úkoly",
    taskDone: "Splněno",
    taskTodo: "Zatím ne",
    tasks: {
      profit: "Dosáhni čistého zisku aspoň 1 000 Kč za hodinu u jedné firmy",
      risk: "Nastav riziko nad 0,8 a sleduj, jak se změní výnos",
      fund: "Zaplať krizový fond při události",
      staff: "Najmi aspoň jednoho zaměstnance",
    },
    campaign: "Marketing",
    campaignHint: "Kampaň na 30 minut zvedne výnos o 30 %.",
    campaignGo: "Spustit za {n}",
    campaignRunning: "Běží ještě {t}",
    eventTitle: "Mimořádná událost",
    eventNone: "Teď žádná událost není. Nová přijde každé dvě hodiny.",
    eventFund: "Krizový fond za {n}",
    eventFunded: "Fond zaplacen, ztráta je zmírněná",
    eventEnds: "Končí za {t}",
    eventNoAction: "Tahle událost firmu nezasáhne.",
    income: "Výnos",
    costs: "Náklady",
    net: "Čistý zisk",
    sellTitle: "Prodej firmy",
    sellHint: "Prodáš jeden kus za podíl ceny, kterou jsi za něj zaplatil. Firma s posledním kusem zmizí.",
    sellGo: "Prodat jeden kus za {n}",
    sellConfirm: "Opravdu prodat jeden kus této firmy?",
    contractTitle: "Odběratelský kontrakt",
    contractHint: "Pevný odběr na 6 hodin: +35 % výnosu, ale krize tuto firmu zasáhnou silněji.",
    contractGo: "Podepsat za {n}",
    contractRunning: "Platí ještě {t}",
    researchTitle: "Výzkum produktů",
    researchHint: "Každá úroveň zvedne výnos oboru o 15 %, ale nové produkty jsou citlivější na krize.",
    researchLevel: "Úroveň {n} z {max}",
    researchGo: "Vyvinout za {n}",
    researchMax: "Nejvyšší úroveň",
    rivalTitle: "Konkurence",
    rivalNow: "Konkurent teď přetahuje zákazníky u tohoto oboru (−20 %).",
    rivalShield: "Kampaň konkurenci částečně brání.",
    rivalNone: "Teď tě žádný konkurent neohrožuje.",
  },
  phase: {
    names: ["Garáž", "Dílna", "Malý sklad", "Prodejna", "Pobočka", "Velká pobočka", "Výrobní hala", "Logistické centrum", "Fabrika", "Velká fabrika", "Zahraniční závod", "Sídlo holdingu"],
    title: "Fáze firmy",
    now: "Fáze {n} z 12: {name}",
    need: "Pro další fázi potřebuješ výnos firem aspoň {v} / h.",
    go: "Postoupit za {c}",
    max: "Nejvyšší fáze: sídlo holdingu",
    locked: "Zatím málo výnosu",
    rates: "Nájem {r} % výnosu, daň {t} % zisku",
  },
  events: {
    crash: { title: "Krach trhu", text: "Ceny na trhu prudce padly. Zisk firem klesá." },
    hyper: { title: "Hyperinflace", text: "Peníze ztrácejí hodnotu a mzdy zaměstnanců výrazně rostou." },
    shortage: { title: "Nedostatek zboží", text: "Dodavatelé nestíhají. Zboží chybí a prodeje klesají." },
    outage: { title: "Výpadek serverů", text: "Digitální služby padají a zákazníci přestávají platit." },
    boom: { title: "Ekonomický rozmach", text: "Lidé utrácejí. Všechny firmy vydělávají víc." },
    viral: { title: "Virální trend", text: "Digitální produkty se šíří samy. Zisk roste." },
    strike: { title: "Stávka", text: "Dělníci odešli z práce. Výroba stojí a mzdy rostou." },
    fashion: { title: "Módní vlna", text: "Oblečení a obuv jsou hit. Prodej roste." },
    subsidy: { title: "Státní dotace", text: "Fyzické firmy dostaly podporu. Zisk roste a mzdy jsou nižší." },
    breach: { title: "Únik dat", text: "Digitální firmy ztrácejí důvěru zákazníků. Zisk klesá." },
  },
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
  overviewHint: "Příjem běží v reálném čase, ale mimo hru jen 15 minut. Hraj aktivně!",
  incomeTitle: "Příjmy za hodinu",
  statsTitle: "Tvoje hra",
  vsPeak: "oproti vrcholu této hry",
  atPeak: "Jsi na vrcholu této hry 🎉",
  totalEarned: "Celkem vydělano",
  timePlayed: "Čas ve hře",
  days: "{n} d",
  assetsTitle: "Majetek",
  companiesOwned: "Firmy",
  hustlesRunning: "Rozjeté hustle",
  none: "žádný",
  ovSummary: "Shrnutí",
  ovEarnings: "Výdělky",
  ovAssets: "Majetek",
  ovEducation: "Vzdělání",
  centerIncome: "Příjem/h",
  centerAssets: "Celkem",
  passiveShare: "Pasivní podíl",
  bestCompany: "Nejlepší firma",
  avgDay: "Průměr za den",
  yearlyCost: "Roční náklady",
  companiesPerHour: "Firmy – příjem za hodinu",
  noCompany: "Zatím žádná firma",
  shareLabel: "Podíl",
  other: "Ostatní",
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
  workHint: "Po každých 15 minutách v práci dostaneš vyšší pozici a víc peněz (až 5 pozic).",
  buy: "Koupit za {n}",
  owned: "Máš: {n}",
  earns: "{n} / h za kus",
  locked1990: "V této době ještě neexistuje",
  maxed: "Maximum",
  companiesHint: "Každá další firma stejného oboru je dražší o 15 %.",
  investHint: "Ceny kolísají. Kup, když jsou nízko, prodej, když jsou vysoko.",
  risk: "Riziko",
  riskLow: "nízké",
  riskMid: "střední",
  riskHigh: "vysoké",
  yieldPerHour: "Výnos od {v} / h",
  trend6h: "Vývoj ceny za posledních 6 hodin",
  holding: "Držíš: {v}",
  price: "Cena",
  invest: "Investovat {n}",
  sell: "Prodat polovinu",
  sellAll: "Prodat vše",
  all: "Vše",
  profit: "Zisk",
  arbitrage: "Arbitráž",
  arbitrageHint: "Když se ceny na dvou trzích rozejdou víc než o poplatek, vyděláš na rozdílu. Obchod lze opakovat po minutě.",
  spread: "Rozdíl cen: {n} %",
  arbitrageGo: "Vydělat na rozdílu ({n})",
  arbitrageWait: "Další obchod za {t}",
  hustleHint: "Vlož kapitál, počkej a vyber výsledek. Můžeš vydělat i prodělat.",
  hustleStart: "Začít (vložit {n})",
  hustleReady: "Hotovo!",
  hustleRunning: "Zbývá {t}",
  hustleCollect: "Vybrat výsledek",
  hustlePanel: "Rozjeté hustly – rozhoduj průběžně",
  hustleOffer: "Nabídka: {n}",
  hustleCashOut: "Prodat teď (−5 %)",
  hustleNone: "Žádný hustl neběží.",
  hustleStake: "Vklad",
  hustleRisk: "Riziko",
  riskHint: "Vyšší riziko = širší rozsah výsledků: víc zisku i ztráty. 1 % je téměř jistý výsledek.",
  hustleAll: "Vše",
  hustleTopUp: "Dokoupit {n}",
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
  toast: { bought: "Koupeno", sold: "Prodáno za {n}", profit: "Zisk {n}", loss: "Ztráta {n}", created: "Postava vytvořena", edu: "Vzdělání vylepšeno", job: "Nová práce", restarted: "Začínáš znovu", upgraded: "Obor vylepšen", hired: "Zaměstnanec najat", fired: "Zaměstnanec propuštěn", level: "Nastaveno", campaign: "Kampaň běží 30 minut", funded: "Krizový fond zaplacen", companySold: "Firma prodána za {n}", contract: "Kontrakt podepsán", researched: "Výzkum hotový" },
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
  numberLocale: "en-US",
  units: { million: "M", billion: "B", trillion: "T" },
  title: "Economy",
  intro: "Try to get rich. The game never ends, but your money only grows while you play. Keep buying, trading and collecting.",
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
    bakery: "Bakery",
    carwash: "Car wash",
    eshop: "E-shop",
    printshop: "Print shop",
    streaming: "Streaming",
  },
  assets: { coin: "Main coin", altcoin: "Altcoin", stablecoin: "Stablecoin", memecoin: "Memecoin", defi: "DeFi token", flat: "Apartment", house: "House", land: "Plot of land", office: "Office", technology: "Technology", energy: "Energy", bank: "Banks", consumer: "Consumer goods", biotech: "Biotech", gold: "Gold", silver: "Silver", copper: "Copper", state: "Government bonds", corporate: "Corporate bonds", junk: "High yield", index: "World index", dividend: "Dividend fund", theme: "Thematic fund", startup_it: "IT startup", startup_fintech: "Fintech startup", startup_green: "Green energy startup" },
  assetCategories: { crypto: "Crypto", realestate: "Land and property", stocks: "Stocks", metals: "Metals", bonds: "Bonds", funds: "Funds", startups: "Startups" },
  hustles: { lemonade: "Lemonade stand", reselling: "Reselling", carflip: "Car flipping", houseflip: "House flipping", startup: "Startup" },
  detail: {
    open: "Manage",
    close: "Close",
    upgrade: "Industry upgrade",
    upgradeDone: "Upgraded (+30 %)",
    upgradeBuy: "Upgrade for {n}",
    upgradeHint: "One-time upgrade: every company in this industry earns 30 % more.",
    staff: "Employees",
    staffHint: "Each employee raises output but costs wages. Up to three per unit.",
    hire: "Hire for {n}",
    fire: "Let go",
    staffFull: "At capacity",
    price: "Product price",
    output: "Production",
    risk: "Risk",
    riskHint: "Safe: smaller income and smaller crisis impact. Risky: more income, but heavier losses.",
    priceHint: "Price: more per unit, but the company is more exposed to crises.",
    outputHint: "Production: more goods, but higher running costs.",
    lessonsTitle: "Game rules",
    previewTitle: "Estimated net profit per hour",
    previewNow: "Now",
    previewSafe: "With a safe setting (risk 0)",
    previewBold: "With a risky setting (risk 1)",
    rules: [
      "Company income = units × profit per unit × price × production × risk.",
      "Risk raises income, but also the loss from an event.",
      "Production costs upkeep. High production pays off only when you can afford the upkeep.",
      "A crisis fund softens the loss from an event. You can pay it once per event.",
    ],
    tasksTitle: "Tasks",
    taskDone: "Done",
    taskTodo: "Not yet",
    tasks: {
      profit: "Reach 1,000 net profit per hour from one company",
      risk: "Set risk above 0.8 and watch how income changes",
      fund: "Pay the crisis fund during an event",
      staff: "Hire at least one employee",
    },
    campaign: "Marketing",
    campaignHint: "A 30-minute campaign raises income by 30 %.",
    campaignGo: "Launch for {n}",
    campaignRunning: "Running for {t} more",
    eventTitle: "Extraordinary event",
    eventNone: "No event right now. A new one comes every two hours.",
    eventFund: "Crisis fund for {n}",
    eventFunded: "Fund paid, the loss is softened",
    eventEnds: "Ends in {t}",
    eventNoAction: "This event does not affect the company.",
    income: "Income",
    costs: "Costs",
    net: "Net profit",
    sellTitle: "Sell company",
    sellHint: "You sell one unit for a share of the price you paid for it. The company with its last unit disappears.",
    sellGo: "Sell one unit for {n}",
    sellConfirm: "Really sell one unit of this company?",
    contractTitle: "Supply contract",
    contractHint: "A fixed buyer for 6 hours: +35 % income, but crises hit this company harder.",
    contractGo: "Sign for {n}",
    contractRunning: "Active for {t} more",
    researchTitle: "Product research",
    researchHint: "Each level raises the industry's income by 15 %, but new products are more exposed to crises.",
    researchLevel: "Level {n} of {max}",
    researchGo: "Develop for {n}",
    researchMax: "Top level",
    rivalTitle: "Competition",
    rivalNow: "A competitor is taking customers in this industry right now (−20 %).",
    rivalShield: "The campaign partly protects against the competitor.",
    rivalNone: "No competitor is threatening you right now.",
  },
  phase: {
    names: ["Garage", "Workshop", "Small warehouse", "Shop", "Branch", "Large branch", "Production hall", "Logistics centre", "Factory", "Large factory", "Foreign plant", "Holding HQ"],
    title: "Company phase",
    now: "Phase {n} of 12: {name}",
    need: "The next phase needs company income of at least {v} / h.",
    go: "Advance for {c}",
    max: "Top phase: holding HQ",
    locked: "Not enough income yet",
    rates: "Rent {r} % of income, tax {t} % of profit",
  },
  events: {
    crash: { title: "Market crash", text: "Market prices collapsed. Company profits fall." },
    hyper: { title: "Hyperinflation", text: "Money loses value and employee wages rise sharply." },
    shortage: { title: "Shortage", text: "Suppliers cannot keep up. Goods are missing and sales drop." },
    outage: { title: "Server outage", text: "Digital services are down and customers stop paying." },
    boom: { title: "Economic boom", text: "People are spending. Every company earns more." },
    viral: { title: "Viral trend", text: "Digital products spread on their own. Profits grow." },
    strike: { title: "Strike", text: "Workers have walked out. Production stops and wages rise." },
    fashion: { title: "Fashion wave", text: "Clothes and shoes are a hit. Sales grow." },
    subsidy: { title: "State subsidy", text: "Physical companies got support. Profits grow and wages are lower." },
    breach: { title: "Data breach", text: "Digital companies are losing customer trust. Profits fall." },
  },
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
  overviewHint: "Income runs in real time, but only for 15 minutes while you are away. Play actively!",
  incomeTitle: "Income per hour",
  statsTitle: "Your game",
  vsPeak: "vs. this run's peak",
  atPeak: "You're at this run's peak 🎉",
  totalEarned: "Total earned",
  timePlayed: "Time played",
  days: "{n} d",
  assetsTitle: "Assets",
  companiesOwned: "Companies",
  hustlesRunning: "Running hustles",
  none: "none",
  ovSummary: "Summary",
  ovEarnings: "Earnings",
  ovAssets: "Assets",
  ovEducation: "Education",
  centerIncome: "Income/h",
  centerAssets: "Total",
  passiveShare: "Passive share",
  bestCompany: "Best company",
  avgDay: "Average per day",
  yearlyCost: "Yearly costs",
  companiesPerHour: "Companies – income per hour",
  noCompany: "No company yet",
  shareLabel: "Share",
  other: "Other",
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
  workHint: "After every 15 minutes at work you get a higher rank and more pay (up to 5 ranks).",
  buy: "Buy for {n}",
  owned: "Owned: {n}",
  earns: "{n} / h each",
  locked1990: "Does not exist in this era yet",
  maxed: "Maximum",
  companiesHint: "Each additional company of the same kind costs 15 % more.",
  investHint: "Prices move. Buy low, sell high.",
  risk: "Risk",
  riskLow: "low",
  riskMid: "medium",
  riskHigh: "high",
  yieldPerHour: "Yield from {v} / h",
  trend6h: "Price trend over the last 6 hours",
  holding: "Holding: {v}",
  price: "Price",
  invest: "Invest {n}",
  sell: "Sell half",
  sellAll: "Sell all",
  all: "All",
  profit: "Profit",
  arbitrage: "Arbitrage",
  arbitrageHint: "When prices on two markets drift apart by more than the fee, you profit from the gap. You can trade again after a minute.",
  spread: "Price gap: {n} %",
  arbitrageGo: "Profit from the gap ({n})",
  arbitrageWait: "Next trade in {t}",
  hustleHint: "Put in capital, wait and collect the result. You can win or lose.",
  hustleStart: "Start (invest {n})",
  hustleReady: "Done!",
  hustleRunning: "{t} left",
  hustleCollect: "Collect result",
  hustlePanel: "Running hustles – decide as you go",
  hustleOffer: "Offer: {n}",
  hustleCashOut: "Sell now (−5%)",
  hustleNone: "No hustle is running.",
  hustleStake: "Stake",
  hustleRisk: "Risk",
  riskHint: "Higher risk = wider range of results: more profit and more loss. 1% is almost a sure result.",
  hustleAll: "All",
  hustleTopUp: "Add {n}",
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
  toast: { bought: "Bought", sold: "Sold for {n}", profit: "Profit {n}", loss: "Loss {n}", created: "Character created", edu: "Education improved", job: "New job", restarted: "Starting over", upgraded: "Industry upgraded", hired: "Employee hired", fired: "Employee let go", level: "Saved", campaign: "Campaign running for 30 minutes", funded: "Crisis fund paid", companySold: "Company sold for {n}", contract: "Contract signed", researched: "Research done" },
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

const de: EconomyText = {
  numberLocale: "de-DE",
  units: { million: "Mio.", billion: "Mrd.", trillion: "Bio." },
  title: "Wirtschaft",
  intro: "Versuche, reich zu werden. Das Spiel endet nie, aber dein Geld wächst nur, solange du spielst. Kaufe, handle und sammle ständig.",
  login: "Anmelden",
  loginHint: "Dein Fortschritt in der Wirtschaft wird in deinem Konto gespeichert.",
  unavailable: "Das Spiel ist gerade nicht erreichbar, versuche es gleich noch einmal.",
  loading: "Lädt…",
  tabs: { overview: "Übersicht", work: "Arbeit", companies: "Firma", invest: "Investieren", hustle: "Hustle", board: "Rangliste" },
  create: {
    title: "Erstelle deine Figur",
    hint: "Deine Wahl bestimmt das Startgeld und kleine Vorteile. Du kannst jederzeit mit einer neuen Figur neu beginnen.",
    name: "Name",
    namePlaceholder: "Wie heißt du?",
    country: "Land",
    city: "Stadt",
    era: "Epoche",
    family: "Familie",
    start: "Spiel starten",
    startMoney: "Start mit {n}",
  },
  countries: { cz: "Tschechien", sk: "Slowakei", de: "Deutschland", us: "USA", gb: "Großbritannien", jp: "Japan" },
  cities: { village: "Dorf", town: "Kleinstadt", city: "Großstadt", metropolis: "Metropole" },
  eras: { "1990": "Die 90er", "2010": "2010", "2025": "Heute", "2050": "Zukunft" },
  families: { poor: "Arme Familie", middle: "Mittelschicht", rich: "Reiche Familie", business: "Unternehmerfamilie" },
  jobs: { warehouse: "Lagerarbeiter", seller: "Verkäufer", cook: "Koch", police: "Polizist", vet: "Tierarzt", programmer: "Programmierer", banker: "Banker" },
  companies: {
    shoes: "Schuhe",
    clothes: "Kleidung",
    tech: "Elektronik",
    delivery: "Lieferdienst",
    supermarket: "Supermarkt",
    digi: "Digital",
    software: "Software",
    hardware: "Hardware",
    factory: "Fabrik",
    bakery: "Bäckerei",
    carwash: "Autowaschanlage",
    eshop: "Online-Shop",
    printshop: "Druckerei",
    streaming: "Streaming",
  },
  assets: { coin: "Hauptcoin", altcoin: "Altcoin", stablecoin: "Stablecoin", memecoin: "Memecoin", defi: "DeFi-Token", flat: "Wohnung", house: "Haus", land: "Grundstück", office: "Büro", technology: "Technologie", energy: "Energie", bank: "Banken", consumer: "Konsumgüter", biotech: "Biotech", gold: "Gold", silver: "Silber", copper: "Kupfer", state: "Staatsanleihen", corporate: "Unternehmensanleihen", junk: "Hochzins", index: "Welt-Index", dividend: "Dividendenfonds", theme: "Themenfonds", startup_it: "IT-Startup", startup_fintech: "Fintech-Startup", startup_green: "Startup Grüne Energie" },
  assetCategories: { crypto: "Kryptowährungen", realestate: "Grundstücke und Immobilien", stocks: "Aktien", metals: "Metalle", bonds: "Anleihen", funds: "Fonds", startups: "Startups" },
  hustles: { lemonade: "Limonadenstand", reselling: "Reselling", carflip: "Autos flippen", houseflip: "Häuser flippen", startup: "Startup" },
  detail: {
    open: "Verwalten",
    close: "Schließen",
    upgrade: "Branchen-Upgrade",
    upgradeDone: "Verbessert (+30 %)",
    upgradeBuy: "Verbessern für {n}",
    upgradeHint: "Einmaliges Upgrade: Jede Firma dieser Branche verdient 30 % mehr.",
    staff: "Mitarbeiter",
    staffHint: "Jeder Mitarbeiter steigert die Leistung, kostet aber Lohn. Höchstens drei pro Einheit.",
    hire: "Einstellen für {n}",
    fire: "Entlassen",
    staffFull: "Kapazität erreicht",
    price: "Produktpreis",
    output: "Produktion",
    risk: "Risiko",
    riskHint: "Sicher: kleinerer Ertrag und geringere Krisenfolgen. Riskant: mehr Ertrag, aber stärkere Verluste.",
    priceHint: "Preis: mehr pro Einheit, aber die Firma ist anfälliger für Krisen.",
    outputHint: "Produktion: mehr Ware, aber höhere Betriebskosten.",
    lessonsTitle: "Spielregeln",
    previewTitle: "Geschätzter Reingewinn pro Stunde",
    previewNow: "Jetzt",
    previewSafe: "Bei sicherer Einstellung (Risiko 0)",
    previewBold: "Bei riskanter Einstellung (Risiko 1)",
    rules: [
      "Ertrag der Firma = Einheiten × Gewinn pro Einheit × Preis × Produktion × Risiko.",
      "Das Risiko erhöht den Ertrag, aber auch den Verlust bei einem Ereignis.",
      "Produktion kostet Unterhalt. Hohe Produktion lohnt sich nur, wenn du den Unterhalt zahlen kannst.",
      "Der Krisenfonds mildert den Verlust eines Ereignisses. Er kann einmal pro Ereignis bezahlt werden.",
    ],
    tasksTitle: "Aufgaben",
    taskDone: "Erledigt",
    taskTodo: "Noch nicht",
    tasks: {
      profit: "Erreiche 1.000 Reingewinn pro Stunde mit einer Firma",
      risk: "Stelle das Risiko über 0,8 ein und beobachte den Ertrag",
      fund: "Bezahle den Krisenfonds während eines Ereignisses",
      staff: "Stelle mindestens einen Mitarbeiter ein",
    },
    campaign: "Marketing",
    campaignHint: "Eine 30-minütige Kampagne steigert den Ertrag um 30 %.",
    campaignGo: "Starten für {n}",
    campaignRunning: "Läuft noch {t}",
    eventTitle: "Außergewöhnliches Ereignis",
    eventNone: "Gerade kein Ereignis. Alle zwei Stunden kommt ein neues.",
    eventFund: "Krisenfonds für {n}",
    eventFunded: "Fonds bezahlt, der Verlust ist abgefedert",
    eventEnds: "Endet in {t}",
    eventNoAction: "Dieses Ereignis betrifft die Firma nicht.",
    income: "Ertrag",
    costs: "Kosten",
    net: "Reingewinn",
    sellTitle: "Firma verkaufen",
    sellHint: "Du verkaufst eine Einheit für einen Anteil des Preises, den du dafür bezahlt hast. Die Firma mit der letzten Einheit verschwindet.",
    sellGo: "Eine Einheit für {n} verkaufen",
    sellConfirm: "Wirklich eine Einheit dieser Firma verkaufen?",
    contractTitle: "Liefervertrag",
    contractHint: "Fester Abnehmer für 6 Stunden: +35 % Ertrag, aber Krisen treffen diese Firma stärker.",
    contractGo: "Unterschreiben für {n}",
    contractRunning: "Noch {t} gültig",
    researchTitle: "Produktforschung",
    researchHint: "Jede Stufe erhöht den Ertrag der Branche um 15 %, aber neue Produkte sind krisenanfälliger.",
    researchLevel: "Stufe {n} von {max}",
    researchGo: "Entwickeln für {n}",
    researchMax: "Höchste Stufe",
    rivalTitle: "Konkurrenz",
    rivalNow: "Ein Konkurrent zieht gerade Kunden in dieser Branche ab (−20 %).",
    rivalShield: "Die Kampagne schützt teilweise vor dem Konkurrenten.",
    rivalNone: "Gerade bedroht dich kein Konkurrent.",
  },
  phase: {
    names: ["Garage", "Werkstatt", "Kleinlager", "Laden", "Filiale", "Große Filiale", "Produktionshalle", "Logistikzentrum", "Fabrik", "Große Fabrik", "Auslandswerk", "Holding-Zentrale"],
    title: "Firmenstufe",
    now: "Stufe {n} von 12: {name}",
    need: "Für die nächste Stufe brauchst du einen Firmenertrag von mindestens {v} / h.",
    go: "Aufsteigen für {c}",
    max: "Höchste Stufe: Holding-Zentrale",
    locked: "Noch zu wenig Ertrag",
    rates: "Miete {r} % des Ertrags, Steuer {t} % des Gewinns",
  },
  events: {
    crash: { title: "Börsencrash", text: "Die Marktpreise sind stark gefallen. Die Gewinne der Firmen sinken." },
    hyper: { title: "Hyperinflation", text: "Geld verliert an Wert und die Löhne der Mitarbeiter steigen stark." },
    shortage: { title: "Warenmangel", text: "Die Lieferanten kommen nicht nach. Waren fehlen und die Verkäufe sinken." },
    outage: { title: "Serverausfall", text: "Digitale Dienste sind ausgefallen und Kunden zahlen nicht mehr." },
    boom: { title: "Wirtschaftsboom", text: "Die Leute geben Geld aus. Alle Firmen verdienen mehr." },
    viral: { title: "Viraler Trend", text: "Digitale Produkte verbreiten sich von selbst. Der Gewinn wächst." },
    strike: { title: "Streik", text: "Die Arbeiter haben die Arbeit niedergelegt. Die Produktion steht und die Löhne steigen." },
    fashion: { title: "Modewelle", text: "Kleidung und Schuhe sind ein Hit. Der Absatz wächst." },
    subsidy: { title: "Staatliche Förderung", text: "Physische Firmen bekamen Unterstützung. Der Gewinn wächst und die Löhne sind niedriger." },
    breach: { title: "Datenleck", text: "Digitale Firmen verlieren das Vertrauen der Kunden. Der Gewinn sinkt." },
  },
  cash: "Bargeld",
  netWorth: "Vermögen",
  perHour: "{n} pro Stunde",
  best: "Rekord",
  runs: "Versuche",
  salary: "Gehalt",
  businessIncome: "Firmen",
  passiveIncome: "Mieten und Zinsen",
  living: "Lebenshaltungskosten",
  multiplier: "Einkommensfaktor",
  overviewHint: "Das Einkommen läuft in Echtzeit, aber nur 15 Minuten, wenn du nicht da bist. Spiel aktiv!",
  incomeTitle: "Einkommen pro Stunde",
  statsTitle: "Dein Spiel",
  vsPeak: "gegenüber dem Höchststand dieses Durchlaufs",
  atPeak: "Du bist auf dem Höchststand dieses Durchlaufs 🎉",
  totalEarned: "Insgesamt verdient",
  timePlayed: "Spielzeit",
  days: "{n} T",
  assetsTitle: "Vermögenswerte",
  companiesOwned: "Firmen",
  hustlesRunning: "Laufende Hustles",
  none: "keine",
  ovSummary: "Übersicht",
  ovEarnings: "Verdienst",
  ovAssets: "Vermögen",
  ovEducation: "Bildung",
  centerIncome: "Ertrag/Std",
  centerAssets: "Gesamt",
  passiveShare: "Passiver Anteil",
  bestCompany: "Beste Firma",
  avgDay: "Durchschnitt pro Tag",
  yearlyCost: "Jährliche Kosten",
  companiesPerHour: "Firmen – Ertrag pro Stunde",
  noCompany: "Noch keine Firma",
  shareLabel: "Anteil",
  other: "Sonstiges",
  learning: "Bonus für heutiges Lernen",
  education: "Bildung",
  educationHint: "Investiere Punkte vom Lernen: Jede Stufe erhöht dauerhaft alle Einkünfte um 4 %.",
  educationBuy: "Stufe {n} für {p} Punkte",
  educationMax: "Höchste Stufe",
  currentJob: "Dein Job",
  noJob: "Du hast noch keinen Job.",
  rank: "Rang {n}",
  perHourShort: "/ Std.",
  take: "Job antreten",
  quit: "Kündigen",
  fee: "Kurs {n}",
  free: "Kostenlos",
  workHint: "Nach jeweils 15 Minuten Arbeit bekommst du einen höheren Rang und mehr Lohn (bis zu 5 Ränge).",
  buy: "Kaufen für {n}",
  owned: "Besitz: {n}",
  earns: "{n} / Std. pro Stück",
  locked1990: "Gibt es in dieser Epoche noch nicht",
  maxed: "Maximum",
  companiesHint: "Jede weitere Firma derselben Art kostet 15 % mehr.",
  investHint: "Die Preise schwanken. Kaufe günstig, verkaufe teuer.",
  risk: "Risiko",
  riskLow: "niedrig",
  riskMid: "mittel",
  riskHigh: "hoch",
  yieldPerHour: "Rendite ab {v} / Std.",
  trend6h: "Kursverlauf der letzten 6 Stunden",
  holding: "Bestand: {v}",
  price: "Preis",
  invest: "{n} investieren",
  sell: "Hälfte verkaufen",
  sellAll: "Alles verkaufen",
  all: "Alles",
  profit: "Gewinn",
  arbitrage: "Arbitrage",
  arbitrageHint: "Wenn die Preise an zwei Märkten mehr als die Gebühr auseinanderliegen, verdienst du an der Differenz. Nach einer Minute kannst du erneut handeln.",
  spread: "Preisdifferenz: {n} %",
  arbitrageGo: "An der Differenz verdienen ({n})",
  arbitrageWait: "Nächster Handel in {t}",
  hustleHint: "Setze Kapital ein, warte und hole das Ergebnis ab. Du kannst gewinnen oder verlieren.",
  hustleStart: "Starten ({n} einsetzen)",
  hustleReady: "Fertig!",
  hustleRunning: "Noch {t}",
  hustleCollect: "Ergebnis abholen",
  hustlePanel: "Laufende Hustles – entscheide unterwegs",
  hustleOffer: "Angebot: {n}",
  hustleCashOut: "Jetzt verkaufen (−5 %)",
  hustleNone: "Kein Hustle läuft.",
  hustleStake: "Einsatz",
  hustleRisk: "Risiko",
  riskHint: "Höheres Risiko = breitere Ergebnisse: mehr Gewinn und mehr Verlust. 1 % ist fast ein sicheres Ergebnis.",
  hustleAll: "Alles",
  hustleTopUp: "Nachlegen {n}",
  minutes: "{n} Min.",
  hours: "{n} Std.",
  boardHint: "Sortiert nach dem höchsten Vermögen, das ein Spieler je erreicht hat.",
  boardEmpty: "Noch niemand da.",
  you: "du",
  yourRank: "Du bist auf Platz {n}",
  restart: "Neu beginnen",
  restartConfirm: "Wirklich neu beginnen? Du verlierst Figur, Firmen und Investitionen. Dein Rekord bleibt.",
  restartHint: "Du kannst jederzeit mit einer neuen Figur bei null anfangen.",
  saveNote: "Das Spiel speichert sich nach jeder Aktion selbst.",
  toast: { bought: "Gekauft", sold: "Verkauft für {n}", profit: "Gewinn {n}", loss: "Verlust {n}", created: "Figur erstellt", edu: "Bildung verbessert", job: "Neuer Job", restarted: "Neustart", upgraded: "Branche verbessert", hired: "Mitarbeiter eingestellt", fired: "Mitarbeiter entlassen", level: "Gespeichert", campaign: "Kampagne läuft 30 Minuten", funded: "Krisenfonds bezahlt", companySold: "Firma verkauft für {n}", contract: "Vertrag unterschrieben", researched: "Forschung abgeschlossen" },
  errors: {
    generic: "Etwas ist schiefgelaufen.",
    "login-required": "Bitte anmelden.",
    "bad-request": "Ungültige Aktion.",
    "no-character": "Erstelle zuerst eine Figur.",
    "has-character": "Du hast schon eine Figur.",
    "not-enough-cash": "Nicht genug Geld.",
    "not-enough-points": "Nicht genug Lernpunkte.",
    locked: "Das gibt es in dieser Epoche noch nicht.",
    max: "Du hast das Maximum erreicht.",
    "no-job": "Du hast keinen Job.",
    "same-job": "Diesen Job hast du schon.",
    nothing: "Nichts zu verkaufen.",
    busy: "Das läuft bereits.",
    "not-ready": "Noch nicht fertig.",
    "no-spread": "Die Preisdifferenz lohnt sich gerade nicht, versuche es später.",
    cooldown: "Warte noch einen Moment.",
    conflict: "Das Spiel hat sich inzwischen geändert, versuche es erneut.",
    unavailable: "Das Spiel ist vorübergehend nicht verfügbar.",
  },
};

const ru: EconomyText = {
  numberLocale: "ru-RU",
  units: { million: "млн", billion: "млрд", trillion: "трлн" },
  title: "Экономика",
  intro: "Постарайся разбогатеть. Игра никогда не заканчивается, но деньги растут, только пока ты играешь. Постоянно покупай, торгуй и забирай.",
  login: "Войти",
  loginHint: "Прогресс в экономике сохраняется в твоём аккаунте.",
  unavailable: "Игра сейчас недоступна, попробуй чуть позже.",
  loading: "Загрузка…",
  tabs: { overview: "Обзор", work: "Работа", companies: "Компания", invest: "Инвестиции", hustle: "Подработки", board: "Рейтинг" },
  create: {
    title: "Создай персонажа",
    hint: "Твой выбор определяет стартовые деньги и небольшие бонусы. В любой момент можно начать заново с новым персонажем.",
    name: "Имя",
    namePlaceholder: "Как тебя зовут?",
    country: "Страна",
    city: "Город",
    era: "Эпоха",
    family: "Семья",
    start: "Начать игру",
    startMoney: "Старт с {n}",
  },
  countries: { cz: "Чехия", sk: "Словакия", de: "Германия", us: "США", gb: "Британия", jp: "Япония" },
  cities: { village: "Деревня", town: "Небольшой город", city: "Большой город", metropolis: "Мегаполис" },
  eras: { "1990": "90-е", "2010": "2010", "2025": "Сегодня", "2050": "Будущее" },
  families: { poor: "Бедная семья", middle: "Средний класс", rich: "Богатая семья", business: "Семья предпринимателей" },
  jobs: { warehouse: "Кладовщик", seller: "Продавец", cook: "Повар", police: "Полицейский", vet: "Ветеринар", programmer: "Программист", banker: "Банкир" },
  companies: {
    shoes: "Обувь",
    clothes: "Одежда",
    tech: "Техника",
    delivery: "Доставка",
    supermarket: "Супермаркет",
    digi: "Цифровой бизнес",
    software: "Софт",
    hardware: "Железо",
    factory: "Фабрика",
    bakery: "Пекарня",
    carwash: "Автомойка",
    eshop: "Интернет-магазин",
    printshop: "Типография",
    streaming: "Стриминг",
  },
  assets: { coin: "Основная монета", altcoin: "Альткоин", stablecoin: "Стейблкоин", memecoin: "Мемкоин", defi: "DeFi-токен", flat: "Квартира", house: "Дом", land: "Участок", office: "Офис", technology: "Технологии", energy: "Энергетика", bank: "Банки", consumer: "Потребительские товары", biotech: "Биотех", gold: "Золото", silver: "Серебро", copper: "Медь", state: "Гос. облигации", corporate: "Корп. облигации", junk: "Высокодоходные", index: "Мировой индекс", dividend: "Дивидендный фонд", theme: "Тематический фонд", startup_it: "IT-стартап", startup_fintech: "Финтех-стартап", startup_green: "Стартап «зелёная энергия»" },
  assetCategories: { crypto: "Криптовалюты", realestate: "Участки и недвижимость", stocks: "Акции", metals: "Металлы", bonds: "Облигации", funds: "Фонды", startups: "Стартапы" },
  hustles: { lemonade: "Лимонадный стенд", reselling: "Перепродажа", carflip: "Флип автомобилей", houseflip: "Флип домов", startup: "Стартап" },
  detail: {
    open: "Управлять",
    close: "Закрыть",
    upgrade: "Улучшение отрасли",
    upgradeDone: "Улучшено (+30 %)",
    upgradeBuy: "Улучшить за {n}",
    upgradeHint: "Одноразовое улучшение: все компании этой отрасли зарабатывают на 30 % больше.",
    staff: "Сотрудники",
    staffHint: "Каждый сотрудник повышает выпуск, но стоит зарплаты. Не больше трёх на единицу.",
    hire: "Нанять за {n}",
    fire: "Уволить",
    staffFull: "Нет мест",
    price: "Цена продукта",
    output: "Производство",
    risk: "Риск",
    riskHint: "Безопасно: меньше дохода и меньше влияние кризисов. Рискованно: больше дохода, но сильнее потери.",
    priceHint: "Цена: больше за единицу, но компания сильнее подвержена кризисам.",
    outputHint: "Выпуск: больше товара, но выше расходы на содержание.",
    lessonsTitle: "Правила игры",
    previewTitle: "Оценка чистой прибыли в час",
    previewNow: "Сейчас",
    previewSafe: "При безопасной настройке (риск 0)",
    previewBold: "При рискованной настройке (риск 1)",
    rules: [
      "Доход компании = единицы × прибыль за единицу × цена × выпуск × риск.",
      "Риск повышает доход, но и потерю от события.",
      "Выпуск требует расходов. Большой выпуск окупается, только если хватает денег на содержание.",
      "Антикризисный фонд смягчает потерю от события. Оплатить его можно раз за событие.",
    ],
    tasksTitle: "Задания",
    taskDone: "Готово",
    taskTodo: "Пока нет",
    tasks: {
      profit: "Получи 1 000 чистой прибыли в час с одной компании",
      risk: "Установи риск выше 0,8 и посмотри, как изменится доход",
      fund: "Оплати антикризисный фонд во время события",
      staff: "Найми хотя бы одного сотрудника",
    },
    campaign: "Маркетинг",
    campaignHint: "Кампания на 30 минут повышает доход на 30 %.",
    campaignGo: "Запустить за {n}",
    campaignRunning: "Идёт ещё {t}",
    eventTitle: "Чрезвычайное событие",
    eventNone: "Сейчас событий нет. Новое приходит каждые два часа.",
    eventFund: "Антикризисный фонд за {n}",
    eventFunded: "Фонд оплачен, потери смягчены",
    eventEnds: "Закончится через {t}",
    eventNoAction: "Это событие не затрагивает компанию.",
    income: "Доход",
    costs: "Расходы",
    net: "Чистая прибыль",
    sellTitle: "Продажа компании",
    sellHint: "Ты продаёшь одну единицу за часть цены, которую за неё заплатил. Компания с последней единицей исчезнет.",
    sellGo: "Продать одну единицу за {n}",
    sellConfirm: "Точно продать одну единицу этой компании?",
    contractTitle: "Контракт с покупателем",
    contractHint: "Постоянный покупатель на 6 часов: +35 % дохода, но кризисы бьют по этой компании сильнее.",
    contractGo: "Подписать за {n}",
    contractRunning: "Действует ещё {t}",
    researchTitle: "Исследование продуктов",
    researchHint: "Каждый уровень повышает доход отрасли на 15 %, но новые продукты сильнее подвержены кризисам.",
    researchLevel: "Уровень {n} из {max}",
    researchGo: "Разработать за {n}",
    researchMax: "Максимальный уровень",
    rivalTitle: "Конкуренция",
    rivalNow: "Конкурент сейчас переманивает клиентов в этой отрасли (−20 %).",
    rivalShield: "Кампания частично защищает от конкурента.",
    rivalNone: "Сейчас тебе никто не угрожает.",
  },
  phase: {
    names: ["Гараж", "Мастерская", "Малый склад", "Магазин", "Филиал", "Большой филиал", "Производственный цех", "Логистический центр", "Фабрика", "Большая фабрика", "Зарубежный завод", "Штаб-квартира холдинга"],
    title: "Фаза компании",
    now: "Фаза {n} из 12: {name}",
    need: "Для следующей фазы нужен доход компаний не меньше {v} / ч.",
    go: "Перейти за {c}",
    max: "Высшая фаза: штаб-квартира холдинга",
    locked: "Пока мало дохода",
    rates: "Аренда {r} % дохода, налог {t} % прибыли",
  },
  events: {
    crash: { title: "Обвал рынка", text: "Цены на рынке резко упали. Прибыль компаний снижается." },
    hyper: { title: "Гиперинфляция", text: "Деньги теряют ценность, зарплаты сотрудников заметно растут." },
    shortage: { title: "Дефицит товаров", text: "Поставщики не справляются. Товаров не хватает, продажи падают." },
    outage: { title: "Сбой серверов", text: "Цифровые сервисы не работают, клиенты перестают платить." },
    boom: { title: "Экономический подъём", text: "Люди много тратят. Все компании зарабатывают больше." },
    viral: { title: "Вирусный тренд", text: "Цифровые продукты распространяются сами. Прибыль растёт." },
    strike: { title: "Забастовка", text: "Рабочие ушли с производства. Выпуск стоит, зарплаты растут." },
    fashion: { title: "Модная волна", text: "Одежда и обувь в тренде. Продажи растут." },
    subsidy: { title: "Государственная субсидия", text: "Физические компании получили поддержку. Прибыль растёт, зарплаты ниже." },
    breach: { title: "Утечка данных", text: "Цифровые компании теряют доверие клиентов. Прибыль падает." },
  },
  cash: "Наличные",
  netWorth: "Состояние",
  perHour: "{n} в час",
  best: "Рекорд",
  runs: "Попыток",
  salary: "Зарплата",
  businessIncome: "Компании",
  passiveIncome: "Аренда и проценты",
  living: "Расходы на жизнь",
  multiplier: "Множитель доходов",
  overviewHint: "Доход идёт в реальном времени, но пока тебя нет — только 15 минут. Играй активно!",
  incomeTitle: "Доход в час",
  statsTitle: "Твоя игра",
  vsPeak: "относительно пика этой игры",
  atPeak: "Ты на пике этой игры 🎉",
  totalEarned: "Всего заработано",
  timePlayed: "Время в игре",
  days: "{n} д",
  assetsTitle: "Активы",
  companiesOwned: "Компании",
  hustlesRunning: "Активные подработки",
  none: "нет",
  ovSummary: "Итоги",
  ovEarnings: "Заработок",
  ovAssets: "Активы",
  ovEducation: "Образование",
  centerIncome: "Доход/ч",
  centerAssets: "Всего",
  passiveShare: "Доля пассивного",
  bestCompany: "Лучшая компания",
  avgDay: "В среднем за день",
  yearlyCost: "Годовые расходы",
  companiesPerHour: "Компании — доход в час",
  noCompany: "Пока нет компаний",
  shareLabel: "Доля",
  other: "Прочее",
  learning: "Бонус за сегодняшнюю учёбу",
  education: "Образование",
  educationHint: "Вкладывай баллы за учёбу: каждый уровень навсегда повышает все доходы на 4 %.",
  educationBuy: "Уровень {n} за {p} баллов",
  educationMax: "Высший уровень",
  currentJob: "Твоя работа",
  noJob: "У тебя пока нет работы.",
  rank: "Ранг {n}",
  perHourShort: "/ ч",
  take: "Устроиться",
  quit: "Уволиться",
  fee: "Курсы {n}",
  free: "Бесплатно",
  workHint: "После каждых 15 минут работы ты получаешь более высокий ранг и больше денег (до 5 рангов).",
  buy: "Купить за {n}",
  owned: "Есть: {n}",
  earns: "{n} / ч с одной",
  locked1990: "В эту эпоху этого ещё нет",
  maxed: "Максимум",
  companiesHint: "Каждая следующая компания того же вида дороже на 15 %.",
  investHint: "Цены колеблются. Покупай дёшево, продавай дорого.",
  risk: "Риск",
  riskLow: "низкий",
  riskMid: "средний",
  riskHigh: "высокий",
  yieldPerHour: "Доход от {v} / ч",
  trend6h: "Динамика цены за последние 6 часов",
  holding: "В наличии: {v}",
  price: "Цена",
  invest: "Вложить {n}",
  sell: "Продать половину",
  sellAll: "Продать всё",
  all: "Всё",
  profit: "Прибыль",
  arbitrage: "Арбитраж",
  arbitrageHint: "Когда цены на двух рынках расходятся больше, чем комиссия, ты зарабатываешь на разнице. Сделку можно повторить через минуту.",
  spread: "Разница в ценах: {n} %",
  arbitrageGo: "Заработать на разнице ({n})",
  arbitrageWait: "Следующая сделка через {t}",
  hustleHint: "Вложи капитал, подожди и забери результат. Можно выиграть, а можно и потерять.",
  hustleStart: "Начать (вложить {n})",
  hustleReady: "Готово!",
  hustleRunning: "Осталось {t}",
  hustleCollect: "Забрать результат",
  hustlePanel: "Текущие подработки — решай по ходу",
  hustleOffer: "Предложение: {n}",
  hustleCashOut: "Продать сейчас (−5%)",
  hustleNone: "Сейчас ничего не запущено.",
  hustleStake: "Вклад",
  hustleRisk: "Риск",
  riskHint: "Выше риск — шире диапазон результатов: больше и прибыли, и убытка. 1 % — почти гарантированный результат.",
  hustleAll: "Всё",
  hustleTopUp: "Докупить {n}",
  minutes: "{n} мин",
  hours: "{n} ч",
  boardHint: "Порядок по самому высокому состоянию, которого когда-либо достиг игрок.",
  boardEmpty: "Пока здесь никого нет.",
  you: "ты",
  yourRank: "Ты на {n}-м месте",
  restart: "Начать заново",
  restartConfirm: "Точно начать заново? Ты потеряешь персонажа, компании и инвестиции. Рекорд останется.",
  restartHint: "В любой момент можно начать с нуля с новым персонажем.",
  saveNote: "Игра сохраняется сама после каждого действия.",
  toast: { bought: "Куплено", sold: "Продано за {n}", profit: "Прибыль {n}", loss: "Убыток {n}", created: "Персонаж создан", edu: "Образование улучшено", job: "Новая работа", restarted: "Начинаем заново", upgraded: "Отрасль улучшена", hired: "Сотрудник нанят", fired: "Сотрудник уволен", level: "Сохранено", campaign: "Кампания идёт 30 минут", funded: "Антикризисный фонд оплачен", companySold: "Компания продана за {n}", contract: "Контракт подписан", researched: "Исследование готово" },
  errors: {
    generic: "Что-то пошло не так.",
    "login-required": "Войди в аккаунт.",
    "bad-request": "Недопустимое действие.",
    "no-character": "Сначала создай персонажа.",
    "has-character": "Персонаж у тебя уже есть.",
    "not-enough-cash": "Не хватает денег.",
    "not-enough-points": "Не хватает баллов за учёбу.",
    locked: "В эту эпоху этого ещё нет.",
    max: "Достигнут максимум.",
    "no-job": "У тебя нет работы.",
    "same-job": "Ты уже на этой работе.",
    nothing: "Нечего продавать.",
    busy: "Это уже идёт.",
    "not-ready": "Ещё не готово.",
    "no-spread": "Сейчас разница в ценах невыгодна, попробуй позже.",
    cooldown: "Подожди ещё немного.",
    conflict: "Игра тем временем изменилась, попробуй ещё раз.",
    unavailable: "Игра временно недоступна.",
  },
};

export function getEconomyText(locale: Locale): EconomyText {
  switch (locale) {
    case "cs":
      return cs;
    case "de":
      return de;
    case "ru":
      return ru;
    default:
      return en;
  }
}
