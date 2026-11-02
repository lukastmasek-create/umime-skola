import type { Locale } from "./config";
import type { AssetId, CityId, CompanyId, CountryId, Direction, EraId, EventId, FamilyId, HustleId, JobId, Level } from "@/lib/idle/economy";

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
    direction: string;
    levels: Record<Level, string>;
    outputLevels: Record<Level, string>;
    directions: Record<Direction, string>;
    directionHint: string;
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
  assets: { bonds: "Cenné papíry", metal: "Kovy", stocks: "Akcie", realestate: "Nemovitosti", crypto: "Kryptoměny" },
  hustles: { reselling: "Reselling", carflip: "Flipování aut", houseflip: "Flipování domů" },
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
    direction: "Směr firmy",
    levels: { low: "Nízká", normal: "Běžná", high: "Vysoká" },
    outputLevels: { low: "Malá", normal: "Běžná", high: "Velká" },
    directions: { stable: "Stabilní", growth: "Růstový" },
    directionHint: "Stabilní firma riskuje méně. Růstová vydělá víc, ale krize ji zasáhnou silněji.",
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
  toast: { bought: "Koupeno", sold: "Prodáno za {n}", profit: "Zisk {n}", loss: "Ztráta {n}", created: "Postava vytvořena", edu: "Vzdělání vylepšeno", job: "Nová práce", restarted: "Začínáš znovu", upgraded: "Obor vylepšen", hired: "Zaměstnanec najat", fired: "Zaměstnanec propuštěn", level: "Nastaveno", campaign: "Kampaň běží 30 minut", funded: "Krizový fond zaplacen" },
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
  assets: { bonds: "Securities", metal: "Metals", stocks: "Stocks", realestate: "Real estate", crypto: "Crypto" },
  hustles: { reselling: "Reselling", carflip: "Car flipping", houseflip: "House flipping" },
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
    direction: "Company direction",
    levels: { low: "Low", normal: "Normal", high: "High" },
    outputLevels: { low: "Small", normal: "Normal", high: "Large" },
    directions: { stable: "Stable", growth: "Growth" },
    directionHint: "A stable company takes less risk. A growth company earns more, but crises hit it harder.",
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
  toast: { bought: "Bought", sold: "Sold for {n}", profit: "Profit {n}", loss: "Loss {n}", created: "Character created", edu: "Education improved", job: "New job", restarted: "Starting over", upgraded: "Industry upgraded", hired: "Employee hired", fired: "Employee let go", level: "Saved", campaign: "Campaign running for 30 minutes", funded: "Crisis fund paid" },
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
  assets: { bonds: "Wertpapiere", metal: "Metalle", stocks: "Aktien", realestate: "Immobilien", crypto: "Kryptowährungen" },
  hustles: { reselling: "Reselling", carflip: "Autos flippen", houseflip: "Häuser flippen" },
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
    direction: "Ausrichtung der Firma",
    levels: { low: "Niedrig", normal: "Normal", high: "Hoch" },
    outputLevels: { low: "Gering", normal: "Normal", high: "Groß" },
    directions: { stable: "Stabil", growth: "Wachstum" },
    directionHint: "Eine stabile Firma riskiert weniger. Eine Wachstumsfirma verdient mehr, aber Krisen treffen sie stärker.",
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
  toast: { bought: "Gekauft", sold: "Verkauft für {n}", profit: "Gewinn {n}", loss: "Verlust {n}", created: "Figur erstellt", edu: "Bildung verbessert", job: "Neuer Job", restarted: "Neustart", upgraded: "Branche verbessert", hired: "Mitarbeiter eingestellt", fired: "Mitarbeiter entlassen", level: "Gespeichert", campaign: "Kampagne läuft 30 Minuten", funded: "Krisenfonds bezahlt" },
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
  assets: { bonds: "Ценные бумаги", metal: "Металлы", stocks: "Акции", realestate: "Недвижимость", crypto: "Криптовалюты" },
  hustles: { reselling: "Перепродажа", carflip: "Флип автомобилей", houseflip: "Флип домов" },
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
    direction: "Направление компании",
    levels: { low: "Низкая", normal: "Обычная", high: "Высокая" },
    outputLevels: { low: "Малое", normal: "Обычное", high: "Большое" },
    directions: { stable: "Стабильное", growth: "Ростовое" },
    directionHint: "Стабильная компания рискует меньше. Ростовая зарабатывает больше, но кризисы бьют по ней сильнее.",
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
  toast: { bought: "Куплено", sold: "Продано за {n}", profit: "Прибыль {n}", loss: "Убыток {n}", created: "Персонаж создан", edu: "Образование улучшено", job: "Новая работа", restarted: "Начинаем заново", upgraded: "Отрасль улучшена", hired: "Сотрудник нанят", fired: "Сотрудник уволен", level: "Сохранено", campaign: "Кампания идёт 30 минут", funded: "Антикризисный фонд оплачен" },
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
