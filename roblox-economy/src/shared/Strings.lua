--!nonstrict
-- All player-facing text lives here (Czech by default, matching the web game). Add `Strings.en` etc. for localization.
local S = {}

S.locale = "cs"

function S.f(template, vars)
	return (template:gsub("{(%w+)}", function(k) local v = vars and vars[k]; return v ~= nil and tostring(v) or "{" .. k .. "}" end))
end

S.ui = {
	title = "EKONOMIKA",
	cash = "Dostupná hotovost", netWorth = "Jmění", income = "Čistý příjem / rok", perYear = "{n} / rok",
	energy = "Energie", next = "Další krok", nextNone = "Vše běží. Zvaž investici nebo firmu.",
	yes = "Ano", no = "Ne", close = "Zavřít", back = "Zpět", confirm = "Potvrdit", buy = "Koupit", sell = "Prodat",
	owned = "Vlastníš", price = "Cena", cost = "Cena", effect = "Co to změní", locked = "Zamčeno", free = "Zdarma",
	max = "Maximum", soon = "Za {n}", now = "Teď", secLeft = "{n} s", minLeft = "{n} min", hourLeft = "{n} h",
	loading = "Načítám…", saveFailed = "Postup se nepodařilo načíst. Hra běží jen pro čtení, aby se nepřepsalo uložení.",
	studioPreview = "Náhled zařízení (jen Studio)", preview = "Náhled",
	more = "Víc", pinned = "Připnuté karty", edit = "Upravit", done = "Hotovo",
	nothing = "Zatím nic.", panels = "Panely", all = "Vše", available = "Dostupné", main = "Hlavní",
}

S.nav = {
	home = "Přehled", work = "Práce", needs = "Potřeby", companies = "Firma", invest = "Investice",
	hustle = "Hustle", board = "Žebříček", device = "Zařízení", compare = "Srovnání", history = "Historie", more = "Víc",
}
S.navShort = { home = "PŘ", work = "PR", needs = "PO", companies = "FI", invest = "IN", hustle = "HU", board = "ŽE", device = "ZA", compare = "SR", history = "HI", more = "…" }

S.devices = {
	phone = { name = "Telefon", tag = "Kompaktní přehled", desc = "Jeden panel, spodní navigace. Všechny akce hry jsou dostupné." },
	ipad = { name = "iPad", tag = "Rozdělený pohled", desc = "Rozdělený pohled, sledované investice, výdaje na obzoru a rozjeté projekty." },
	laptop = { name = "Laptop", tag = "Srovnávací pracovna", desc = "Srovnání prací, firem a investic vedle sebe, uložené pohledy a rychlé akce." },
	pc = { name = "PC", tag = "Řídicí centrum", desc = "Konfigurovatelné připnuté karty, hluboká historie a panel upozornění." },
}
S.deviceFeatures = {
	splitView = "Rozdělený pohled (seznam + detail)", watchlist = "Sledované investice (až {n})", upcoming = "Přehled nadcházejících výdajů a projektů",
	compare = "Srovnávací pracovna (až 3 položky)", savedViews = "Uložené pohledy (až {n})", quickActions = "Rychlé akce na jedno klepnutí",
	pinnedCards = "Připnuté karty (až {n})", history = "Hluboká historie jmění a událostí", alerts = "Panel upozornění",
}
S.deviceUi = {
	title = "Zařízení", current = "Aktuální zařízení", nextTitle = "Další zařízení", buy = "Koupit za {n}", owned = "Vlastníš",
	noMore = "Máš nejlepší zařízení.", benefits = "Co získáš", price = "Cena", requirements = "Podmínky", unlocked = "Odemčeno: {name}",
	afterLine = "{a}: {b} → {c} (pokryje {d} dní potřeb)", confirm = "{name}: {price}\n{cash}: {before} → {after}",
	note = "Zařízení mění přehlednost a rychlost ovládání, ne výdělek. Všechny ekonomické akce jsou dostupné na každém zařízení.",
}
S.reason = {
	edu = "Potřebuješ Vzdělání {need} (máš {have}).", busyShift = "Nejdřív dokonči směnu.", sameJob = "Tuto práci už máš.",
	era = "V této době ještě neexistuje.", maxUnits = "Dosažen nejvyšší počet kusů.", cash = "Chybí hotovost: {have} z {need}.",
	running = "Už běží.", shifts = "Odpracuj směny: {have} z {need}.", netWorth = "Jmění {have} z {need}.", companies = "Potřebuješ aspoň {need} firmu (máš {have}).",
	points = "Chybí body: {have} z {need}.", deviceOrder = "Zařízení se kupují postupně.", unknownDevice = "Neznámé zařízení.",
}
S.err = {
	["not-enough-cash"] = "Nemáš dost hotovosti.", ["not-enough-points"] = "Nemáš dost bodů.", locked = "Zamčeno: splň podmínky.",
	max = "Už je na maximu.", ["no-job"] = "Nemáš práci.", busy = "Právě to nejde.", cooldown = "Chvíli počkej.",
	["low-energy"] = "Chybí energie. Odpočiň si nebo kup jídlo.", sick = "Jsi nemocný.", vacation = "Jsi na dovolené.",
	["no-transport"] = "Bez dopravy jdeš pěšky.", ["not-ready"] = "Ještě není připraveno.", ["same-job"] = "Tuto práci už máš.",
	nothing = "Není co dělat.", ["bad-request"] = "Neplatný požadavek.", ["no-spread"] = "Teď není rozdíl mezi trhy.",
	["rate-limit"] = "Příliš rychle, zpomal.", ["save-unavailable"] = "Uložení je nedostupné.", ["not-ready-server"] = "Server se připravuje.",
	["no-character"] = "Nejdřív vytvoř postavu.", ["has-character"] = "Postavu už máš.", ["no-shift"] = "Není aktivní směna.",
}
S.evt = {
	["shift-started"] = "Směna začala.", ["shift-step"] = "Další situace.", ["shift-done"] = "Směna hotová! +{n}", sick = "Onemocněl jsi.",
	["crisis-warning"] = "Pozor: v oboru se blíží krize.", promoted = "Povýšení!", ["promo-rejected"] = "Žádost zamítnuta. Zkus to za hodinu.",
	raised = "Zvýšení platu schváleno!", ["raise-rejected"] = "Zvýšení zamítnuto.", warned = "Varování za špatné výkony!",
	fired = "Dostal jsi výpověď!", rested = "Plně odpočatý.", vacation = "Dovolená začala.", sold = "Prodáno +{n}", bought = "Koupeno za {n}",
	arbitrage = "Arbitráž +{n}", lost = "Hustle: přišel podvod!", done = "Hustle dokončen.", step = "Fáze rozhodnuta.", device = "Zařízení odemčeno!",
}

S.create = {
	title = "Vytvoř postavu", name = "Jméno", country = "Země (platy a náklady)", city = "Město (plat, náklady, nájmy)",
	era = "Doba (startovní peníze, digitální obory)", family = "Rodina (startovní peníze)", start = "Začít hru",
	hint = "Volba určuje startovní peníze a drobné bonusy. Jde ji změnit jen novým začátkem.",
	startMoney = "Start: {n}",
}
S.countries = { cz = "Česko", sk = "Slovensko", de = "Německo", us = "USA", gb = "Británie", jp = "Japonsko" }
S.cities = { village = "Vesnice", town = "Malé město", city = "Velké město", metropolis = "Metropole" }
S.eras = { ["1990"] = "90. léta", ["2010"] = "2010", ["2025"] = "Dnes", ["2050"] = "Budoucnost" }
S.families = { poor = "Chudá rodina", middle = "Střední třída", rich = "Bohatá rodina", business = "Podnikatelská rodina" }
S.jobs = { warehouse = "Skladník", seller = "Prodejce", cook = "Kuchař", police = "Policista", vet = "Zvěrolékař", programmer = "Programátor", farmer = "Farmář", firefighter = "Hasič", teacher = "Učitel", journalist = "Novinář", architect = "Architekt", pilot = "Pilot", doctor = "Lékař", banker = "Bankéř" }
S.companies = { shoes = "Boty", clothes = "Oblečení", tech = "Technika", delivery = "Rozvážka", supermarket = "Supermarket", digi = "Digi", software = "Software", hardware = "Hardware", factory = "Fabrika", bakery = "Pekárna", carwash = "Myčka", eshop = "E-shop", printshop = "Tiskárna", streaming = "Streaming" }
S.assets = { coin = "Hlavní coin", altcoin = "Altcoin", stablecoin = "Stablecoin", memecoin = "Memecoin", defi = "DeFi token", flat = "Byt", house = "Dům", land = "Pozemek", office = "Kancelář", technology = "Technologie", energy = "Energetika", bank = "Banky", consumer = "Spotřební zboží", biotech = "Biotech", gold = "Zlato", silver = "Stříbro", copper = "Měď", state = "Státní dluhopisy", corporate = "Firemní dluhopisy", junk = "Vysoký výnos", index = "Světový index", dividend = "Dividendový fond", theme = "Tematický fond", startup_it = "Startup IT", startup_fintech = "Startup fintech", startup_green = "Startup zelená energie" }
S.assetCats = { crypto = "Kryptoměny", realestate = "Nemovitosti", stocks = "Akcie", metals = "Kovy", bonds = "Dluhopisy", funds = "Fondy", startups = "Startupy" }
S.roles = { producer = "Výrobce", seller = "Prodavač", accountant = "Účetní", manager = "Manažer" }
S.hustles = { lemonade = "Limonádový stánek", reselling = "Reselling", carflip = "Flipování aut", houseflip = "Flipování domů", startup = "Startup", freelance = "Freelance zakázka" }
S.needs = {
	food = { name = "Jídlo", effect = "Bez jídla se energie dobíjí jen napůl." },
	drink = { name = "Pití", effect = "Bez pití energie ubývá." },
	clothing = { name = "Oblečení", effect = "Bez oblečení je výdělek nižší o 15 %." },
	housing = { name = "Bydlení", effect = "Bez bydlení platíš pokuty každou hodinu." },
	transport = { name = "Doprava", effect = "Bez dopravy jdeš na směnu pěšky a stojí víc energie." },
	health = { name = "Zdraví", effect = "Bez péče o zdraví nejde energie nad 70 %." },
	leisure = { name = "Zábava", effect = "Bez zábavy se energie dobíjí o pětinu pomaleji." },
}
S.boosts = { energy_drink = "Energy drink (rychlejší dobíjení)", cinema = "Kino (+10 % výdělku)" }
S.events = {
	crash = "Krach trhu", hyper = "Hyperinflace", shortage = "Nedostatek zboží", outage = "Výpadek serverů", boom = "Ekonomický rozmach",
	viral = "Virální trend", strike = "Stávka", fashion = "Módní vlna", subsidy = "Státní dotace", breach = "Únik dat",
}
S.assetEvents = { cryptoRally = "Boom kryptoměn", cryptoCrash = "Pád kryptoměn", rateHike = "Zvýšení úroků", rateCut = "Snížení úroků", techBoom = "Technologický boom", goldFear = "Strach z krize, zlato roste", panic = "Panika na trhu", bull = "Býčí trh", bear = "Medvědí trh" }
S.news = { ["startup-exit"] = "Exit startupu", ["startup-krach"] = "Krach startupu", ["buy-filled"] = "Nákup splněn", ["sell-filled"] = "Prodej splněn", ["order-failed"] = "Příkaz selhal" }
S.situations = {
	delivery = { text = "Pozdní dodávka čeká na vyložení.", choices = { "Rychle vyložit", "Rozdělit mezi kolegy", "Nechat na později" } },
	customer = { text = "Přišel naštvaný zákazník.", choices = { "Hádat se", "Vyslechnout a vyřešit", "Zavolat kolegu" } },
	queue = { text = "Tvoří se dlouhá fronta.", choices = { "Pracovat rychleji", "Otevřít druhou přepážku", "Ignorovat" } },
	tools = { text = "Rozbilo se nářadí.", choices = { "Opravit provizorně", "Vyměnit a nahlásit", "Pracovat dál" } },
	colleague = { text = "Kolega potřebuje pomoc.", choices = { "Odmítnout", "Rychle pomoci", "Naučit ho to" } },
	spill = { text = "Na zemi je rozlitá tekutina.", choices = { "Obejít", "Uklidit a označit", "Zavolat uklízeče" } },
}
S.work = {
	title = "Práce", current = "Aktuální práce", rank = "Stupeň {a} z {b}", points = "Body {a} z {b}", pay = "Roční mzda {n}",
	start = "Začít směnu", startHint = "3 rozhodnutí, stojí energii ({n}+).", rest = "Odpočinek", restHint = "Doplní energii. Jednou za 6 hodin.",
	vacation = "Dovolená", vacationHint = "Den volna, plat na polovinu, plná energie.",
	promo = "Žádost o povýšení", promoHint = "Chce body, Vzdělání a 2 hodiny na stupni.", raise = "Vyjednat plat", raiseHint = "Jednou za 7 dní.",
	lead = "Vedoucí směny", leadHint = "+5 % výplata, +10 energie.", quit = "Dát výpověď", choose = "Vybrat", decision = "Rozhodnutí {a}/{b}",
	jobs = "Nabídka prací", salary = "Mzda {n}/rok", fee = "Nástup {n}", needEdu = "Vzdělání {n}", noJob = "Zatím nemáš práci. Vyber níže.",
	sick = "Jsi nemocný: žádný pasivní plat ani směny.", cooldown = "Pauza {n}", edu = "Vzdělání", eduHint = "+4 % ke všem příjmům. Stojí {n} bodů z práce.", eduBuy = "Investovat", eduPoints = "Body učení: {n}",
	walk = "Bez dopravy: pěšky (+15 energie)", crisis = "Krize v oboru: plat -10 %.",
}
S.needsUi = { title = "Životní potřeby", hint = "Zásoba se kupuje na dny dopředu a každý den ubývá.", days = "{n} dní", perDay = "{n} / den", plus1 = "+1 den", plus7 = "+7 dní", boosts = "Spotřební zboží", empty = "PRÁZDNÉ", transportWarn = "Bez dopravy jdeš pěšky (+15 energie).", billsWarn = "Bez bydlení platíš pokuty každou hodinu." }
S.co = {
	title = "Firmy", phase = "Fáze {a}/{b}", revenue = "Výnos {n}/rok", costs = "Náklady {n}/rok", profit = "Zisk {n}/rok",
	nextPhase = "Další fáze", phaseHint = "Chce výnos firem {req}/rok, stojí {cost}. Zvedá nájem a daň, zvětšuje sklad.", upgradePhase = "Postoupit",
	unit = "{name} ×{n}", staff = "Zaměstnanci {a}/{b}", stock = "Zásoby {a}/{b} dávek", noStock = "BEZ ZÁSOB: výnos klesl na 20 %",
	price = "Cena produktu ×{n}", output = "Výroba ×{n}", risk = "Riziko {n}", upgrade = "Vylepšit obor", upgraded = "Vylepšeno (+30 %)",
	campaign = "Marketing", contract = "Kontrakt", research = "Výzkum {a}/{b}", union = "Dohoda s odbory", fund = "Krizový fond", sell = "Prodat kus",
	buyStock = "Zásoby ×5", morale = "Spokojenost {n} %", strike = "STÁVKA", rival = "Konkurent útočí", manage = "Spravovat", hire = "Najmout", fire = "Propustit",
	distress = "VAROVÁNÍ PŘED KRACHEM", distressText = "Peníze nestačí na provozní náklady. Zbývá {n}. Prodej kus, propusť nebo sniž výrobu.",
	bankruptcy = "Firma {name} zkrachovala.", rookies = "Noví lidé se zaškolují.",
}
S.inv = {
	title = "Investice", portfolio = "Portfolio", own = "Držíš {q} ({v})", yield = "Výnos {n} %/rok", buy10 = "Koupit 10 %", buyAll = "Koupit vše", sellHalf = "Prodat ½", sellAll = "Prodat vše",
	watch = "Sledovat", unwatch = "Nesledovat", orders = "Příkazy", orderHint = "Nákup nebo prodej, až cena dosáhne hranice. Plní se i mimo hru (do limitu).",
	orderBuyBelow = "Nákup při poklesu", orderSellAbove = "Prodej při růstu (take-profit)", orderSellBelow = "Prodej při poklesu (stop-loss)", orderBuyAbove = "Nákup při průrazu",
	orderPlace = "Zadat příkaz", orderCancel = "Zrušit", orderMax = "Nejvýš {n} příkazů.", arb = "Arbitráž", arbHint = "Rozdíl mezi dvěma trhy. Zisk závisí na aktuálním rozdílu.", arbRun = "Obchodovat {n}",
	spread = "Rozdíl trhů {n} %", news = "Tržní zprávy", log = "Záznamy z trhu", pnl = "Zisk/ztráta {n}", startupWarn = "Startup: každý rok buď vyjde, nebo zkrachuje.", locked = "Zamčeno v této době",
	price = "Cena {n}", limitPrice = "Hranice ceny", amount = "Částka", share = "Podíl",
}
S.hu = { title = "Hustle", hint = "Vložíš kapitál a ve třech kolech rozhoduješ. Výsledek se vyplatí na konci a může být i ztráta.", stake = "Vklad {n}", start = "Začít", round = "Kolo {a}/{b}", value = "Hodnota {n}", topUp = "Přidat kapitál {n}",
	opens = "Další rozhodnutí za {n}", option = "Volba {n}", opportunity = "Příležitost", range = "výsledek ×{lo} až ×{hi}", cost = "náklad {n} % vkladu", hintUp = "Tip: trh poroste ▲", hintDown = "Tip: trh klesne ▼",
	experience = "Zkušenost {a}/{b}", needEdu = "Vzdělání {n}", chosen = "Vybráno" }
S.board = { title = "Žebříček", rank = "#", empty = "Žebříček je zatím prázdný (nebo se Studio nepřipojilo k DataStore).", you = "Ty", best = "Rekord {n}", record = "Rekordní jmění", runs = "Pokusy {n}", bankrupt = "Krachy {n}" }
S.cmp = { title = "Srovnání", hint = "Vyber až 3 položky a porovnej je vedle sebe.", jobs = "Práce", companies = "Firmy", assets = "Investice", add = "Přidat", remove = "Odebrat", metric = "Ukazatel", pick = "Vyber položky níže.", payback = "Návratnost {n} r.", profit = "Zisk/ks {n}", salaryCol = "Mzda", feeCol = "Poplatek", eduCol = "Vzdělání", priceCol = "Cena", yieldCol = "Výnos", driftCol = "Růst", volCol = "Kolísání", paybackCol = "Návratnost", netPay = "Čistá roční mzda", incomeCol = "Příjem/ks za rok" }
S.views = { title = "Uložené pohledy", save = "Uložit pohled", name = "Pohled {n}", apply = "Použít", delete = "Smazat", empty = "Žádné uložené pohledy.", limit = "Limit pohledů je {n}." }
S.quick = { title = "Rychlé akce", shift = "Směna", rest = "Odpočinek", food = "Jídlo +1", sellAll = "Investice: stav", device = "Zařízení" }
S.panel = { watch = "Sledované", upcoming = "Nadcházející výdaje", projects = "Aktivní projekty", alerts = "Upozornění", pinned = "Připnuté karty", empty = "Prázdné", history = "Historie",
	needIn = "{name}: zásoba dojde za {t}", needNow = "{name}: zásoba je prázdná", stockIn = "{name}: sklad dojde za {t}", shiftActive = "Směna běží (krok {n}/3)", hustleDue = "{name}: čeká rozhodnutí", hustleIn = "{name}: další kolo za {t}",
	orderLine = "{side} {name} při {price}", noWatch = "Přidej investice tlačítkem Sledovat.", buy = "Nákup", sell = "Prodej" }
S.alerts = {
	distress = "Krach firmy za {t}", lowEnergy = "Nízká energie", needEmpty = "{name}: prázdná zásoba", noStock = "{name}: sklad je prázdný", event = "Událost: {name} zasahuje {co}",
	sick = "Jsi nemocný", crisis = "Krize v tvém oboru", orderNear = "Cena {name} je blízko příkazu",
}
S.hist = { title = "Historie", worth = "Jmění v čase", portfolio = "Portfolio", log = "Poslední zprávy", devices = "Pořízená zařízení", none = "Zatím žádná data.", nowLabel = "Teď {n}", minLabel = "Min {n}", maxLabel = "Max {n}" }
S.home = {
	title = "Přehled", income = "Příjmy za rok", salary = "Plat", companies = "Firmy", passive = "Pasivní", costs = "Náklady firem", living = "Život (odhad)", mult = "Násobič ×{n}",
	record = "Rekord {a} · pokusy {b}", restart = "Začít znovu", restartHint = "Smaže postup včetně zařízení. Rekord a počet pokusů zůstanou.", restartConfirm = "Opravdu začít znovu?",
	event = "Událost: {name}", news = "Tržní zpráva: {name}", nextJob = "Vyber si práci", nextShift = "Začni směnu", nextFood = "Kup jídlo a pití", nextTransport = "Kup dopravu", nextDevice = "Můžeš koupit {name}", nextRest = "Odpočiň si", nextHustle = "Vyřeš rozhodnutí v hustlu",
	nextCompany = "Zvaž první firmu", nextInvest = "Investuj volnou hotovost", nextSave = "Šetři na {name}",
}
S.hero = {
	kicker = "Doporučený krok · teď", sub = "Podle tvého stavu je to nejvýhodnější další tah.", cta = "Pokračovat", secondary = "Zařízení",
	free = "ZDARMA", panelTitle = "Dění v ekonomice", panelOpen = "Otevřít", panelEmpty = "Všechno běží. Žádná upozornění.", online = "ONLINE", continueTitle = "Pokračuj",
	tiles = { work = "energie {n} %", needs = "zásoba {n} dní", companies = "sklad {n} %", invest = "portfolio {n} % jmění", hustle = "kolo {a}/{b}", device = "{n} % ceny" },
}
S.preset = { cash = "Hotovost", netWorth = "Jmění", income = "Příjem", needs = "Potřeby", companies = "Firmy", portfolio = "Portfolio", projects = "Projekty", hustle = "Hustle", energy = "Energie", events = "Události" }
S.legal = { saveNote = "Postup se ukládá na server Roblox. Hra je pro zábavu, nejde o finanční poradenství." }
S.sides = { buy = "Nákup", sell = "Prodej", below = "pod", above = "nad" }

return S
