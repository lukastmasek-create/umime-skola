--!strict
-- Economy game data. Ported from src/lib/idle/economy.ts.
-- Time unit: milliseconds. 1 game hour = 1 game year (rates are yearly). Money in credits.
local C = {}

local H = 3600000
C.H = H
C.DAY = 24 * H
C.GAME_DAY = H / 365
C.MAX_OFFLINE_MIN = 15
C.MAX_NAME = 20
C.MAX_COMPANY_UNITS = 50
C.MAX_EDU = 25
C.EDU_BONUS_PER_LEVEL = 0.04
C.PERSONAL_TAX = 0.23
C.LIVING_BASE = 320

-- Work / shifts
C.PERF_MAX = 100
C.ENERGY_MAX = 100
C.ENERGY_PER_HOUR = 360
C.SITUATIONS_PER_SHIFT = 3
C.SITUATION_ENERGY = 10
C.SHIFT_MIN_ENERGY = 30
C.LEAD_EXTRA_ENERGY = 10
C.WALK_EXTRA_ENERGY = 15
C.SHIFT_COOLDOWN_MS = 2 * 60000
C.SHIFTS_PER_YEAR = 12
C.PASSIVE_SHARE = 0.6
C.RANK_POINTS = { 0, 50, 150, 400, 900 }
C.MAX_JOB_RANK = 5
C.JOB_RANK_BONUS = 0.15
C.PROMO_MIN_RANK_MS = 2 * H
C.PROMO_RETRY_MS = H
C.PROMO_BASE = 60
C.PROMO_PER_PERF = 0.3
C.PROMO_MAX = 90
C.LEAD_MIN_RANK = 4
C.LEAD_PAY = 1.05
C.RAISE_COOLDOWN_MS = 7 * C.DAY
C.RAISE_BASE = 40
C.RAISE_PER_PERF = 0.5
C.RAISE_SENIOR_PENALTY = 10
C.RAISE_MAX = 2
C.BONUS_SHARE = 0.1
C.BONUS_MS = C.DAY
C.REST_COOLDOWN_MS = 6 * H
C.SICK_CHANCE = 0.03
C.BAD_PERF = 30
C.DISMISS_STREAK = 5

C.COUNTRIES = { "us", "gb", "de", "jp", "cz", "sk" }
C.CITIES = { "village", "town", "city", "metropolis" }
C.ERAS = { "1990", "2010", "2025", "2050" }
C.FAMILIES = { "poor", "middle", "rich", "business" }

C.COUNTRY_DEF = {
	cz = { currency = "Kč", salary = 1, living = 1 },
	sk = { currency = "€", salary = 1, living = 0.95 },
	de = { currency = "€", salary = 1.1, living = 1.1 },
	us = { currency = "$", salary = 1.15, living = 1.15 },
	gb = { currency = "£", salary = 1.1, living = 1.15 },
	jp = { currency = "¥", salary = 1.05, living = 1.05 },
}
C.CITY_DEF = {
	village = { salary = 0.9, living = 0.6, rent = 0.8 },
	town = { salary = 1, living = 0.85, rent = 0.95 },
	city = { salary = 1.15, living = 1.1, rent = 1.15 },
	metropolis = { salary = 1.3, living = 1.5, rent = 1.4 },
}
C.ERA_DEF = {
	["1990"] = { start = 0.6, digital = false, crypto = false },
	["2010"] = { start = 1, digital = true, crypto = true },
	["2025"] = { start = 1, digital = true, crypto = true },
	["2050"] = { start = 1.5, digital = true, crypto = true },
}
C.FAMILY_DEF = {
	poor = { start = 20, living = 0.8, company = 1 },
	middle = { start = 120, living = 1, company = 1 },
	rich = { start = 2000, living = 1.4, company = 1 },
	business = { start = 800, living = 1, company = 0.9 },
}

-- Jobs: salary = yearly gross at rank 1, fee = entry fee, edu = required Education
C.JOBS = {
	{ id = "warehouse", salary = 480, fee = 0, edu = 0 },
	{ id = "seller", salary = 520, fee = 15, edu = 1 },
	{ id = "farmer", salary = 540, fee = 20, edu = 1 },
	{ id = "cook", salary = 560, fee = 40, edu = 2 },
	{ id = "firefighter", salary = 600, fee = 60, edu = 4 },
	{ id = "police", salary = 650, fee = 80, edu = 5 },
	{ id = "teacher", salary = 680, fee = 120, edu = 6 },
	{ id = "journalist", salary = 700, fee = 120, edu = 6 },
	{ id = "vet", salary = 850, fee = 300, edu = 8 },
	{ id = "architect", salary = 900, fee = 400, edu = 9 },
	{ id = "programmer", salary = 1100, fee = 600, edu = 10 },
	{ id = "pilot", salary = 1300, fee = 800, edu = 11 },
	{ id = "doctor", salary = 1400, fee = 900, edu = 12 },
	{ id = "banker", salary = 1600, fee = 1200, edu = 14 },
}
C.JOB_BY_ID = {}
for _, j in ipairs(C.JOBS) do C.JOB_BY_ID[j.id] = j end

-- Shift situations: perf per choice 1..3 (0-100)
C.SITUATIONS = {
	{ id = "delivery", text = "A delivery arrives late.", choices = { "Rush it", "Split it up", "Leave it" }, perf = { 100, 70, 30 } },
	{ id = "customer", text = "An angry customer shows up.", choices = { "Argue", "Listen and fix", "Call a colleague" }, perf = { 40, 90, 60 } },
	{ id = "queue", text = "A long queue is forming.", choices = { "Work faster", "Open 2nd counter", "Ignore it" }, perf = { 80, 50, 20 } },
	{ id = "tools", text = "A tool breaks down.", choices = { "Patch it", "Replace and log it", "Keep working" }, perf = { 70, 100, 40 } },
	{ id = "colleague", text = "A colleague needs help.", choices = { "Say no", "Help quickly", "Teach them" }, perf = { 30, 80, 100 } },
	{ id = "spill", text = "Something spilled on the floor.", choices = { "Walk around", "Clean + warn sign", "Call janitor" }, perf = { 60, 100, 20 } },
}

-- Companies
C.COMPANIES = {
	{ id = "shoes", cost = 1000, digital = false, payback = 5 },
	{ id = "clothes", cost = 2000, digital = false, payback = 6 },
	{ id = "bakery", cost = 3000, digital = false, payback = 6.5 },
	{ id = "tech", cost = 6000, digital = false, payback = 7 },
	{ id = "carwash", cost = 9000, digital = false, payback = 7.5 },
	{ id = "delivery", cost = 12000, digital = true, payback = 8 },
	{ id = "eshop", cost = 20000, digital = true, payback = 8.5 },
	{ id = "supermarket", cost = 40000, digital = false, payback = 9 },
	{ id = "printshop", cost = 60000, digital = false, payback = 9.5 },
	{ id = "digi", cost = 120000, digital = true, payback = 10 },
	{ id = "software", cost = 150000, digital = true, payback = 11 },
	{ id = "streaming", cost = 200000, digital = true, payback = 11.5 },
	{ id = "hardware", cost = 300000, digital = false, payback = 12 },
	{ id = "factory", cost = 500000, digital = false, payback = 13 },
}
C.COMPANY_BY_ID = {}
for _, c in ipairs(C.COMPANIES) do C.COMPANY_BY_ID[c.id] = c end
C.COMPANY_GROWTH = 1.15
C.SETTING_RANGE = {
	price = { min = 0.5, max = 2, step = 0.05 },
	output = { min = 0.5, max = 1.5, step = 0.05 },
	risk = { min = 0, max = 1, step = 0.05 },
}
C.STAFF_ROLES = { "producer", "seller", "accountant", "manager" }
C.ROLE_WAGE = { producer = 1, seller = 1, accountant = 1.5, manager = 2.5 }
C.ROLE_MAX = { producer = math.huge, seller = math.huge, accountant = 1, manager = 1 }
C.SELLER_REVENUE = 500
C.MANAGER_BONUS = 0.1
C.ACCOUNTANT_TAX_CUT = 0.15
C.ACCOUNTANT_TAX_MAX = 0.5
C.ROOKIE_MS = 6 * H
C.ROOKIE_FACTOR = 0.6
C.STAFF_SICK_CHANCE = 0.1
C.QUIT_CHANCE = 0.15
C.MAX_STAFF_PER_UNIT = 3
C.STAFF_REVENUE = 720
C.STAFF_BASE_WAGE = 480
C.STAFF_HIRE_YEARS = 1 / 12
C.UPGRADE_BONUS = 0.3
C.UPGRADE_COST_MULT = 4
C.SELL_SHARE = 0.6
C.INPUT_RATE = 0.1
C.STOCK_PER_UNIT = 4
C.NO_STOCK_OUTPUT = 0.2
C.SHORTAGE_PRICE = 1.5
C.OPEX_SHARE = 0.5
C.MAX_PHASE = 12
C.RENT_FLOOR = 0.001
C.PHASE_RATES = {
	{ rent = 0, tax = 0.05 }, { rent = 0.05, tax = 0.1 }, { rent = 0.07, tax = 0.12 }, { rent = 0.08, tax = 0.15 },
	{ rent = 0.09, tax = 0.15 }, { rent = 0.1, tax = 0.18 }, { rent = 0.11, tax = 0.18 }, { rent = 0.12, tax = 0.2 },
	{ rent = 0.13, tax = 0.2 }, { rent = 0.14, tax = 0.22 }, { rent = 0.15, tax = 0.25 }, { rent = 0.16, tax = 0.25 },
}
C.PHASE_COST_YEARS = 0.25
C.WARN_HOURS = 24
C.WARN_MS = 24 * H

C.EVENT_WINDOW_MS = 2 * H
C.EVENT_DURATION_MS = 30 * 60000
-- affects: "all" | "digital" | "physical" | { companyIds }
C.EVENTS = {
	{ id = "crash", name = "Market crash", affects = "all", mult = 0.6, wageMult = 1 },
	{ id = "hyper", name = "Hyperinflation", affects = "all", mult = 0.9, wageMult = 2 },
	{ id = "shortage", name = "Supply shortage", affects = { "shoes", "clothes", "bakery", "supermarket", "printshop", "factory", "hardware" }, mult = 0.6, wageMult = 1 },
	{ id = "outage", name = "Server outage", affects = { "digi", "software", "streaming", "eshop", "delivery" }, mult = 0.5, wageMult = 1 },
	{ id = "boom", name = "Economic boom", affects = "all", mult = 1.4, wageMult = 1 },
	{ id = "viral", name = "Going viral", affects = { "digi", "streaming", "eshop" }, mult = 1.6, wageMult = 1 },
	{ id = "strike", name = "Industry strike", affects = { "factory", "hardware", "printshop", "bakery" }, mult = 0.7, wageMult = 1.5 },
	{ id = "fashion", name = "Fashion trend", affects = { "clothes", "shoes" }, mult = 1.5, wageMult = 1 },
	{ id = "subsidy", name = "State subsidy", affects = "physical", mult = 1.2, wageMult = 0.8 },
	{ id = "breach", name = "Data breach", affects = "digital", mult = 0.7, wageMult = 1 },
}

-- Assets: yield & drift yearly. seed groups legacy waves.
local function asset(id, cat, base, vol, yield, drift, seed, crypto)
	return { id = id, cat = cat, base = base, vol = vol, yield = yield, drift = drift, seed = seed or id, crypto = crypto or false }
end
C.ASSET_CATEGORIES = { "crypto", "realestate", "stocks", "metals", "bonds", "funds", "startups" }
C.ASSETS = {
	asset("coin", "crypto", 500, 0.5, 0, 0, "crypto", true),
	asset("altcoin", "crypto", 120, 0.8, 0, 0, nil, true),
	asset("stablecoin", "crypto", 10, 0.005, 0.03, 0, nil, true),
	asset("memecoin", "crypto", 5, 1.2, 0, 0, nil, true),
	asset("defi", "crypto", 80, 0.6, 0.05, 0, nil, true),
	asset("flat", "realestate", 5000, 0.04, 0.035, 0.05, "realestate"),
	asset("house", "realestate", 12000, 0.05, 0.03, 0.05),
	asset("land", "realestate", 2000, 0.03, 0, 0.04),
	asset("office", "realestate", 20000, 0.06, 0.05, 0.04),
	asset("technology", "stocks", 100, 0.18, 0.01, 0.09, "stocks"),
	asset("energy", "stocks", 80, 0.08, 0.04, 0.02),
	asset("bank", "stocks", 60, 0.12, 0.04, 0.04),
	asset("consumer", "stocks", 40, 0.1, 0.025, 0.04),
	asset("biotech", "stocks", 150, 0.35, 0, 0.06),
	asset("gold", "metals", 2000, 0.07, 0, 0.04, "metal"),
	asset("silver", "metals", 30, 0.1, 0, 0.03),
	asset("copper", "metals", 150, 0.12, 0, 0.02),
	asset("state", "bonds", 1000, 0.01, 0.045, 0, "bonds"),
	asset("corporate", "bonds", 1000, 0.03, 0.055, 0),
	asset("junk", "bonds", 1000, 0.12, 0.08, 0),
	asset("index", "funds", 300, 0.03, 0.015, 0.06, "fund"),
	asset("dividend", "funds", 200, 0.02, 0.03, 0.04),
	asset("theme", "funds", 250, 0.08, 0.005, 0.07),
	asset("startup_it", "startups", 200, 0.4, 0, 0, "startup"),
	asset("startup_fintech", "startups", 150, 0.5, 0, 0),
	asset("startup_green", "startups", 120, 0.3, 0, 0),
}
C.ASSET_BY_ID = {}
for _, a in ipairs(C.ASSETS) do C.ASSET_BY_ID[a.id] = a end
C.GROWTH_HORIZON_YEARS = 40

C.ASSET_EVENT_WINDOW_MS = 3 * H
C.ASSET_EVENT_DURATION_MS = H
C.ASSET_EVENTS = {
	{ id = "cryptoRally", name = "Crypto rally", affects = { "crypto" }, mult = 1.5 },
	{ id = "cryptoCrash", name = "Crypto crash", affects = { "crypto" }, mult = 0.6 },
	{ id = "rateHike", name = "Rate hike", affects = { "bonds", "realestate", "funds" }, mult = 0.93 },
	{ id = "rateCut", name = "Rate cut", affects = { "bonds", "realestate" }, mult = 1.05 },
	{ id = "techBoom", name = "Tech boom", affects = { "stocks", "startups" }, mult = 1.2 },
	{ id = "goldFear", name = "Gold fear", affects = { "metals" }, mult = 1.25 },
	{ id = "panic", name = "Market panic", affects = { "stocks", "funds", "startups" }, mult = 0.82 },
	{ id = "bull", name = "Bull market", affects = "all", mult = 1.1 },
	{ id = "bear", name = "Bear market", affects = "all", mult = 0.9 },
}
C.STARTUP_ROUND_MS = H
C.STARTUP_EXIT_CHANCE = 0.02
C.STARTUP_KRACH_CHANCE = 0.18
C.STARTUP_MAX_ROUNDS = 30
C.NEWS_MAX = 12

-- Hustles
C.HUSTLE_PHASES = 3
C.HUSTLE_MAX_EXPERIENCE = 5
C.HUSTLE_EVENT = { cost = 0.1, width = 0.35 }
C.HUSTLE_EVENT_CHANCE = 0.15
C.HUSTLE_STREAK_STEP = 0.01
C.HUSTLE_STREAK_MAX = 0.05
local function o(cost, width) return { cost = cost, width = width } end
C.HUSTLES = {
	{ id = "lemonade", cost = 100, gapSec = 20, edu = 0, market = { 0.9, 1.1 }, scam = 0, lossShare = 0, protect = -1, commission = 0, upkeep = 0.06, target = 1.0,
		phases = { { o(0.1, 0.05), o(0.24, 0.1), o(0, 0.2) }, { o(0, 0.05), o(0, 0.5), o(0.16, 0.15) }, { o(0, 0.025), o(0, 0.25), o(0.2, 0.2) } } },
	{ id = "reselling", cost = 400, gapSec = 40, edu = 0, market = { 0.85, 1.15 }, scam = 0.1, lossShare = 1, protect = 1, commission = 0.1, upkeep = 0, target = 1.0,
		phases = { { o(0.3, 0.1), o(0.2, 0.075), o(0, 0.35) }, { o(0, 0.02), o(0.1, 0), o(0, 0.025) }, { o(0, 0.025), o(0, 0.2), o(0.04, 0.45) } } },
	{ id = "carflip", cost = 10000, gapSec = 90, edu = 0, market = { 0.9, 1.1 }, scam = 0.08, lossShare = 0.4, protect = 1, commission = 0.05, upkeep = 0.04, target = 1.0,
		phases = { { o(0, 0.25), o(0.1, 0.075), o(0.24, 0.15) }, { o(0.16, 0.05), o(0.24, 0.075), o(0.6, 0.1) }, { o(0, 0.035), o(0, 0.075), o(0, 0.2) } } },
	{ id = "houseflip", cost = 120000, gapSec = 180, edu = 3, market = { 0.88, 1.12 }, scam = 0.05, lossShare = 0.2, protect = 1, commission = 0.03, upkeep = 0.08, target = 1.0,
		phases = { { o(0.16, 0.1), o(0.24, 0.075), o(0.4, 0.15) }, { o(0.1, 0.04), o(0.3, 0.075), o(0.7, 0.125) }, { o(0, 0.025), o(0, 0.05), o(0.12, 0.2) } } },
	{ id = "startup", cost = 300000, gapSec = 300, edu = 8, market = { 0.8, 1.2 }, scam = 0.15, lossShare = 1, protect = 1, commission = 0, upkeep = 0.16, target = 1.08,
		phases = { { o(0, 0.025), o(0.1, 0.075), o(0.2, 0.175) }, { o(0, 0.3), o(0.2, 0.1), o(0.4, 0.4) }, { o(0, 0.1), o(0.2, 0.65), o(0, 0.125) } } },
	{ id = "freelance", cost = 2000, gapSec = 60, edu = 0, market = { 0.97, 1.03 }, scam = 0.12, lossShare = 1, protect = 0, commission = 0.1, upkeep = 0, target = 1.0,
		phases = { { o(0, 0.1), o(0.2, 0.15), o(0.4, 0.35) }, { o(0, 0.05), o(0.2, 0.175), o(0, 0.35) }, { o(0, 0.02), o(0.1, 0.08), o(0, 0.5) } } },
}
C.HUSTLE_BY_ID = {}
for _, h in ipairs(C.HUSTLES) do C.HUSTLE_BY_ID[h.id] = h end

-- Needs
C.NEEDS = { "food", "drink", "clothing", "housing", "transport", "health", "leisure" }
C.NEED_DEF = {
	food = { share = 0.3 }, drink = { share = 0.1 }, clothing = { share = 0.1 }, housing = { share = 0.25 },
	transport = { share = 0.1 }, health = { share = 0.08 }, leisure = { share = 0.07 },
}
C.MAX_NEED_DAYS = 7
C.CLOTHING_INCOME = 0.85
C.FOOD_REGEN = 0.5
C.LEISURE_REGEN = 0.8
C.DRINK_DRAIN = 3
C.HEALTH_ENERGY_CAP = 0.7


-- ───────── v2 additions ─────────
-- (STATE_VERSION is set in the v3 block below)

-- Vacation, crisis
C.VACATION_MS = C.GAME_DAY
C.VACATION_PAY = 0.5
C.VACATION_MAX = 2
C.VACATION_WINDOW_MS = 30 * C.DAY
C.CRISIS_CHANCE = 0.02
C.CRISIS_DELAY_MS = C.GAME_DAY
C.CRISIS_MS = 7 * C.GAME_DAY
C.CRISIS_SALARY = 0.9

-- Orders, arbitrage
C.MAX_ORDERS = 8
C.ORDER_CHECK_MS = 10 * 60000
C.ORDER_MAX_SAMPLES = 400
C.ARB_COOLDOWN_MS = 60000
C.ARB_FEE = 0.005
C.ARB_CAP = 5000

-- Boosts (consumer goods)
C.BOOSTS = { "energy_drink", "cinema" }
C.BOOST_DEF = {
	energy_drink = { need = "drink", priceShare = 0.1, minutes = 30, energy = 2, income = 1 },
	cinema = { need = "leisure", priceShare = 0.25, minutes = 120, energy = 1, income = 1.1 },
}
C.MAX_BOOST_MINUTES = 240

-- Company management extras
C.MARKETING_MINUTES = 30
C.MARKETING_BONUS = 1.3
C.MARKETING_COST = 0.3
C.FUND_COST = 0.3
C.FUND_SAVES = 0.65
C.CONTRACT_MS = 6 * C.H
C.CONTRACT_FEE_YEARS = 0.25
C.CONTRACT_BONUS = 0.35
C.CONTRACT_EXPOSURE = 1.5
C.MAX_RESEARCH = 3
C.RESEARCH_COST = 1
C.RESEARCH_BONUS = 0.15
C.RESEARCH_EXPOSURE = 0.1
C.RIVAL_BITE = 0.2
C.RIVAL_CAMPAIGN_SHIELD = 0.5
C.UNION_MIN_STAFF = 3
C.UNION_THRESHOLD = 0.4
C.STRIKE_CHANCE = 0.5
C.STRIKE_OUTPUT = 0.5
C.UNION_DEAL_MS = 12 * C.H
C.UNION_DEAL_YEARS = 1 / 12

-- History (net worth chart)
C.HISTORY_STEP_MS = 5 * 60000
C.HISTORY_MAX = 144 -- 12 real hours of 5-minute samples

-- Leaderboard
C.BOARD_SIZE = 20

-- ───────── DEVICES: single configuration table ─────────
-- Buy sequentially. price in credits (cash must cover it, not allowed to go negative).
-- req: shifts = lifetime completed shifts, edu = Education level, netWorth, companies = owned units.
-- Tuning (middle family, Warehouse job, town): ~370 credits per real hour gross vs ~270 living cost,
-- so iPad (600) is ~3-4 real hours of surplus for poor/middle starts. Laptop and PC price against company / investment capital.
-- features: UI capabilities only. No income multipliers.
C.DEVICES = {
	{ id = "phone", tier = 1, price = 0, req = {},
		limits = { watch = 0, views = 0, pins = 0 },
		features = {} },
	{ id = "ipad", tier = 2, price = 600, req = { shifts = 3 },
		limits = { watch = 4, views = 0, pins = 0 },
		features = { splitView = true, watchlist = true, upcoming = true } },
	{ id = "laptop", tier = 3, price = 6000, req = { shifts = 10, edu = 3, netWorth = 5000 },
		limits = { watch = 8, views = 4, pins = 0 },
		features = { splitView = true, watchlist = true, upcoming = true, compare = true, savedViews = true, quickActions = true } },
	{ id = "pc", tier = 4, price = 40000, req = { edu = 8, companies = 1, netWorth = 50000 },
		limits = { watch = 12, views = 8, pins = 6 },
		features = { splitView = true, watchlist = true, upcoming = true, compare = true, savedViews = true, quickActions = true, pinnedCards = true, history = true, alerts = true } },
}
C.PIN_CARDS = { "cash", "netWorth", "income", "needs", "companies", "portfolio", "projects", "hustle", "energy", "events" }

-- ───────── v3: economy guard rails ─────────
-- (v3 bumped STATE_VERSION to 3; see the v4 block)
-- Essentials (needs, company stock) may run into a small overdraft so a broke player can still eat.
-- Everything else (companies, staff, upgrades, boosts, job fees...) must be paid from cash on hand.
C.OVERDRAFT_DAYS = 2

-- ───────── v3: daily reward (login streak) ─────────
C.DAILY_COOLDOWN_MS = 20 * H -- claimable once every 20 real hours
C.DAILY_GRACE_MS = 48 * H -- claim within 48 h of the previous claim to keep the streak
C.DAILY_MAX_STREAK = 7
C.DAILY_BASE_HOURS = 1.5 -- reward = living cost x hours x (1 + 0.25 x (streak - 1)), min DAILY_MIN
C.DAILY_STREAK_STEP = 0.25
C.DAILY_MIN = 50

-- ───────── v3: milestones (one-time goals with a cash reward and edu points) ─────────
-- kind: shifts | netWorth | companies | edu | hustles | device | rank | portfolio | phase
C.MILESTONES = {
	{ id = "first_shift", kind = "shifts", target = 1, reward = 60, points = 5 },
	{ id = "shifts_10", kind = "shifts", target = 10, reward = 400, points = 10 },
	{ id = "shifts_50", kind = "shifts", target = 50, reward = 3000, points = 25 },
	{ id = "shifts_200", kind = "shifts", target = 200, reward = 20000, points = 60 },
	{ id = "rank_2", kind = "rank", target = 2, reward = 300, points = 10 },
	{ id = "rank_5", kind = "rank", target = 5, reward = 8000, points = 40 },
	{ id = "edu_3", kind = "edu", target = 3, reward = 250, points = 0 },
	{ id = "edu_10", kind = "edu", target = 10, reward = 6000, points = 0 },
	{ id = "first_company", kind = "companies", target = 1, reward = 500, points = 10 },
	{ id = "companies_10", kind = "companies", target = 10, reward = 15000, points = 30 },
	{ id = "phase_3", kind = "phase", target = 3, reward = 5000, points = 20 },
	{ id = "first_hustle", kind = "hustles", target = 1, reward = 150, points = 5 },
	{ id = "hustles_10", kind = "hustles", target = 10, reward = 5000, points = 25 },
	{ id = "portfolio_5k", kind = "portfolio", target = 5000, reward = 400, points = 10 },
	{ id = "portfolio_100k", kind = "portfolio", target = 100000, reward = 8000, points = 30 },
	{ id = "worth_10k", kind = "netWorth", target = 10000, reward = 500, points = 10 },
	{ id = "worth_100k", kind = "netWorth", target = 100000, reward = 5000, points = 25 },
	{ id = "worth_1m", kind = "netWorth", target = 1000000, reward = 50000, points = 60 },
	{ id = "worth_10m", kind = "netWorth", target = 10000000, reward = 400000, points = 120 },
	{ id = "device_ipad", kind = "device", target = 2, reward = 200, points = 10 },
	{ id = "device_pc", kind = "device", target = 4, reward = 10000, points = 40 },
}
C.MILESTONE_BY_ID = {}
for _, m in ipairs(C.MILESTONES) do C.MILESTONE_BY_ID[m.id] = m end

-- ───────── v4: bank, missions, legacy ─────────
C.STATE_VERSION = 4
-- Rates are per game year (= one real hour), the same unit as salaries and yields.
C.BANK_SAVINGS_RATE = 0.04
C.BANK_LOAN_RATE = 0.12
C.BANK_LOAN_LTV = 0.5 -- total debt may reach 50% of equity (net worth after debt)
C.BANK_MIN = 10

-- Daily missions: three per real day, picked from this pool. `counter` is a lifetime stat in state.stats
-- (or "earned" = totalEarned). target "living" means `livingHours` hours of living cost.
C.MISSIONS_PER_DAY = 3
C.MISSION_POOL = {
	{ id = "shifts", counter = "shifts", target = 3, hours = 1.0, points = 6 },
	{ id = "trades", counter = "trades", target = 4, hours = 0.8, points = 4 },
	{ id = "supplies", counter = "supplies", target = 3, hours = 0.6, points = 3 },
	{ id = "restock", counter = "restocks", target = 2, hours = 1.2, points = 5, needsCompany = true },
	{ id = "hustle", counter = "hustles", target = 1, hours = 1.0, points = 5 },
	{ id = "study", counter = "studies", target = 1, hours = 0.8, points = 0 },
	{ id = "deposit", counter = "deposits", target = 2, hours = 0.6, points = 3 },
	{ id = "earn", counter = "earned", livingHours = 4, hours = 1.0, points = 5 },
}
C.MISSION_BY_ID = {}
for _, m in ipairs(C.MISSION_POOL) do C.MISSION_BY_ID[m.id] = m end

-- Legacy: restarting converts your all-time record into permanent points. Each point = +2% to all income.
C.LEGACY_DIVISOR = 10000 -- points = floor(sqrt(record / divisor))
C.LEGACY_BONUS = 0.02
C.LEGACY_MAX = 100

C.STAT_KEYS = { "shifts", "hustles", "trades", "supplies", "restocks", "studies", "deposits", "promotions", "companiesBought" }

return C
