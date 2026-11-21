local RS = game:GetService("ReplicatedStorage")
local SSS = game:GetService("ServerScriptService")
local SPS = game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")
local function clear(p, n) local o = p:FindFirstChild(n) if o then o:Destroy() end end
clear(RS, "Economy") clear(SSS, "EconomyService") clear(SPS, "EconomyUI")
local function make(class, name, parent, source)
	local o = Instance.new(class) o.Name = name o.Source = source o.Parent = parent return o
end
local econ = Instance.new("Folder") econ.Name = "Economy" econ.Parent = RS
make("ModuleScript", "Config", econ, [==[
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

C.COUNTRIES = { "cz", "sk", "de", "us", "gb", "jp" }
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
C.STATE_VERSION = 2

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
C.HISTORY_STEP_MS = 15 * 60000
C.HISTORY_MAX = 96

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

return C
]==])
make("ModuleScript", "Logic", econ, [==[
--!nonstrict
-- Pure game logic (no Roblox services). Server-authoritative; client only calls read-only helpers.
-- Every action mutates `state` in place and returns (true, info, extra) or (false, errorCode).
-- Source of truth: umime-skola src/lib/idle/economy.ts (see README for deliberate differences).
local C = require(script.Parent.Config)
local H = C.H
local L = {}

-- ───────── deterministic hash (FNV-1a + murmur3 fmix32) ─────────
local TWO32 = 4294967296
local function mul32(a, b)
	return ((a * (b % 65536)) % TWO32 + ((a * math.floor(b / 65536)) % 65536) * 65536) % TWO32
end
local function hash32(s)
	local h = 2166136261
	for i = 1, #s do
		h = bit32.bxor(h, string.byte(s, i))
		h = mul32(h, 16777619)
	end
	h = bit32.bxor(h, bit32.rshift(h, 16))
	h = mul32(h, 0x85ebca6b)
	h = bit32.bxor(h, bit32.rshift(h, 13))
	h = mul32(h, 0xc2b2ae35)
	h = bit32.bxor(h, bit32.rshift(h, 16))
	return h / TWO32
end
L.hash32 = hash32

local function hustleRoll(seed, round, index)
	local x = bit32.bxor(bit32.bxor(seed, mul32(round + 1, 0x9e3779b1)), mul32(index + 1, 0x85ebca77))
	x = mul32(bit32.bxor(x, bit32.rshift(x, 16)), 0x7feb352d)
	x = mul32(bit32.bxor(x, bit32.rshift(x, 15)), 0x846ca68b)
	x = bit32.bxor(x, bit32.rshift(x, 16))
	return x / TWO32
end
L.hustleRoll = hustleRoll

local function clamp(v, lo, hi) return math.min(hi, math.max(lo, v)) end
local function contains(list, v)
	for _, x in ipairs(list) do if x == v then return true end end
	return false
end
local function fail(code) return false, code end
local function isNum(v) return type(v) == "number" and v == v and v ~= math.huge and v ~= -math.huge end
local function isInt(v) return isNum(v) and v == math.floor(v) end
local function deepCopy(t)
	if type(t) ~= "table" then return t end
	local o = {}
	for k, v in pairs(t) do o[k] = deepCopy(v) end
	return o
end
L.deepCopy = deepCopy

-- ───────── state ─────────
function L.emptyNeeds()
	local n = {}
	for _, id in ipairs(C.NEEDS) do n[id] = 0 end
	return n
end

function L.newState(now, runs, best)
	return {
		v = C.STATE_VERSION, character = nil, cash = 0, totalEarned = 0, peak = 0, best = best or 0, runs = runs or 0,
		startedAt = now, lastSeen = now, job = nil, energy = C.ENERGY_MAX, edu = 0, eduPoints = 0,
		needs = L.emptyNeeds(), boosts = {}, shift = nil, shiftReadyAt = 0, restReadyAt = 0, sickUntil = 0,
		vacationUntil = 0, vacations = {}, crisis = nil,
		dayPay = 0, bonusAt = now, raises = {}, raiseReadyAt = 0,
		companies = {}, setup = {}, responses = {}, research = {}, contracts = {}, phase = 1,
		holdings = {}, cost = {}, hustle = {}, knowledge = {}, orders = {}, orderSeq = 0, arbReadyAt = 0,
		distressAt = 0, bankruptcies = 0, lastBankruptId = nil, lastBankruptAt = 0,
		news = {}, startupRound = {}, history = {},
		-- device progression and device-gated UI preferences (kept across restarts of the economy? no: reset on restart)
		device = 1, deviceLog = {}, stats = { shifts = 0 }, watch = {}, views = {}, pins = {},
	}
end

-- Fill missing fields with defaults and sanitize numbers. Safe for any older profile or garbage input.
function L.migrate(raw, now)
	local fresh = L.newState(now, 0, 0)
	if type(raw) ~= "table" then return fresh end
	for k, v in pairs(fresh) do
		if raw[k] == nil and k ~= "character" and k ~= "job" and k ~= "shift" and k ~= "crisis" and k ~= "lastBankruptId" then
			raw[k] = deepCopy(v)
		end
	end
	for _, k in ipairs({ "cash", "totalEarned", "peak", "best", "runs", "energy", "edu", "eduPoints", "dayPay", "orderSeq", "phase", "device" }) do
		if not isNum(raw[k]) then raw[k] = fresh[k] end
	end
	if type(raw.stats) ~= "table" then raw.stats = { shifts = 0 } end
	raw.stats.shifts = isNum(raw.stats.shifts) and raw.stats.shifts or 0
	raw.startedAt = isNum(raw.startedAt) and math.min(raw.startedAt, now) or now
	raw.lastSeen = isNum(raw.lastSeen) and math.min(raw.lastSeen, now) or now
	raw.bonusAt = isNum(raw.bonusAt) and math.min(raw.bonusAt, now) or now
	raw.energy = clamp(raw.energy, 0, C.ENERGY_MAX)
	raw.edu = clamp(math.floor(raw.edu), 0, C.MAX_EDU)
	raw.phase = clamp(math.floor(raw.phase), 1, C.MAX_PHASE)
	raw.device = clamp(math.floor(raw.device), 1, #C.DEVICES)
	if type(raw.needs) ~= "table" then raw.needs = L.emptyNeeds() end
	for _, id in ipairs(C.NEEDS) do raw.needs[id] = isNum(raw.needs[id]) and clamp(raw.needs[id], 0, C.MAX_NEED_DAYS) or 0 end
	-- strip unknown ids
	for _, field in ipairs({ "companies", "setup", "responses", "research", "contracts" }) do
		for id in pairs(raw[field]) do if not C.COMPANY_BY_ID[id] then raw[field][id] = nil end end
	end
	for _, field in ipairs({ "holdings", "cost", "startupRound" }) do
		for id in pairs(raw[field]) do if not C.ASSET_BY_ID[id] then raw[field][id] = nil end end
	end
	for id in pairs(raw.hustle) do if not C.HUSTLE_BY_ID[id] then raw.hustle[id] = nil end end
	for id, slot in pairs(raw.setup) do
		local d = L.defaultSetup()
		for k, v in pairs(d) do if slot[k] == nil then slot[k] = deepCopy(v) end end
	end
	raw.v = C.STATE_VERSION
	return raw
end

function L.defaultSetup()
	return {
		upgraded = false, staff = 0, roles = { producer = 0, seller = 0, accountant = 0, manager = 0 },
		rookieUntil = 0, unionUntil = 0, marketingUntil = 0, price = 1, output = 1, risk = 0.3, stock = 0,
	}
end
local function setupOf(state, id)
	local s = state.setup[id]
	if not s then s = L.defaultSetup(); state.setup[id] = s end
	return s
end
L.setupOf = setupOf

function L.cleanName(raw)
	if type(raw) ~= "string" then return "" end
	raw = raw:gsub("[%c<>]", ""):gsub("%s+", " ")
	raw = raw:match("^%s*(.-)%s*$")
	return string.sub(raw, 1, C.MAX_NAME)
end

-- ───────── events & prices ─────────
local function eventWindow(now) return math.floor(now / C.EVENT_WINDOW_MS) end
L.eventWindow = eventWindow

function L.currentEvent(now)
	local window = eventWindow(now)
	if now - window * C.EVENT_WINDOW_MS >= C.EVENT_DURATION_MS then return nil end
	local def = C.EVENTS[math.floor(hash32("event:" .. window) * #C.EVENTS) + 1]
	return { def = def, window = window, endsAt = window * C.EVENT_WINDOW_MS + C.EVENT_DURATION_MS }
end

local function eventAffects(def, id)
	if def.affects == "all" then return true end
	if def.affects == "digital" or def.affects == "physical" then
		return C.COMPANY_BY_ID[id].digital == (def.affects == "digital")
	end
	return contains(def.affects, id)
end
L.eventAffects = eventAffects
function L.isNegativeEvent(def) return def.mult < 1 or def.wageMult > 1 end

function L.currentAssetEvent(now)
	local window = math.floor(now / C.ASSET_EVENT_WINDOW_MS)
	if now - window * C.ASSET_EVENT_WINDOW_MS >= C.ASSET_EVENT_DURATION_MS then return nil end
	local def = C.ASSET_EVENTS[math.floor(hash32("asset-event:" .. window) * #C.ASSET_EVENTS) + 1]
	return { def = def, endsAt = window * C.ASSET_EVENT_WINDOW_MS + C.ASSET_EVENT_DURATION_MS }
end

local function assetEventMult(id, now)
	local ev = L.currentAssetEvent(now)
	if not ev then return 1 end
	local cat = C.ASSET_BY_ID[id].cat
	if ev.def.affects == "all" or contains(ev.def.affects, cat) then return ev.def.mult end
	return 1
end

function L.assetPrice(id, now, origin)
	local def = C.ASSET_BY_ID[id]
	local hours = now / H
	local pa = hash32(def.seed .. ":a") * math.pi * 2
	local pb = hash32(def.seed .. ":b") * math.pi * 2
	local wave = 0.6 * math.sin(hours / 0.5 + pa) + 0.4 * math.sin(hours / 0.12 + pb)
	local noise = (hash32(def.seed .. ":" .. math.floor(now / 60000)) - 0.5) * 0.3
	local years = math.min(C.GROWTH_HORIZON_YEARS, math.max(0, now - origin) / H)
	local trend = (1 + def.drift) ^ years
	return math.max(1, def.base * trend * (1 + def.vol * (wave + noise))) * assetEventMult(id, now)
end

function L.arbitrageSpread(now)
	local h = now / H
	local a = math.sin(h * 20 + 0.7) * 0.5 + math.sin(h * 70 + 2.1) * 0.5
	local b = math.sin(h * 17 + 4.2) * 0.5 + math.sin(h * 55 + 0.3) * 0.5
	return math.abs(a - b) * 0.03
end

function L.startupOutcome(id, round)
	local r = hash32("startup-round:" .. id .. ":" .. round)
	if r < C.STARTUP_EXIT_CHANCE then
		return { kind = "exit", mult = 4 + hash32("startup-mult:" .. id .. ":" .. round) * 4 }
	end
	if r < C.STARTUP_EXIT_CHANCE + C.STARTUP_KRACH_CHANCE then return { kind = "krach" } end
	return { kind = "run" }
end

function L.isLocked(state, kind, id)
	local era = state.character and C.ERA_DEF[state.character.era] or C.ERA_DEF["2025"]
	if kind == "company" then return (not era.digital) and C.COMPANY_BY_ID[id].digital end
	return (not era.crypto) and C.ASSET_BY_ID[id].crypto
end

-- ───────── needs ─────────
function L.livingCost(state)
	local ch = state.character
	if not ch then return 0 end
	return C.LIVING_BASE * C.COUNTRY_DEF[ch.country].living * C.CITY_DEF[ch.city].living * C.FAMILY_DEF[ch.family].living
end
function L.needDaily(state, id)
	return math.round(L.livingCost(state) * 24 * C.NEED_DEF[id].share)
end
function L.boostPrice(state, id)
	return math.round(L.livingCost(state) * 24 * C.BOOST_DEF[id].priceShare)
end
function L.needsEffects(state, now)
	local n = state.needs
	local function empty(id) return n[id] <= 0 end
	local function boost(kind)
		local m = 1
		for _, b in ipairs(state.boosts) do
			if b.until_ > now then m *= C.BOOST_DEF[b.id][kind] end
		end
		return m
	end
	return {
		income = (empty("clothing") and C.CLOTHING_INCOME or 1) * boost("income"),
		energyRegen = (empty("food") and C.FOOD_REGEN or 1) * (empty("leisure") and C.LEISURE_REGEN or 1) * boost("energy"),
		energyDrain = empty("drink") and C.DRINK_DRAIN or 0,
		energyCap = empty("health") and C.HEALTH_ENERGY_CAP or 1,
		noShift = empty("transport"),
		bills = empty("housing"),
	}
end

-- ───────── companies ─────────
function L.companyIncome(id)
	local d = C.COMPANY_BY_ID[id]
	return d.cost / d.payback
end
local function familyCompany(state) return state.character and C.FAMILY_DEF[state.character.family].company or 1 end
function L.companyPrice(state, id)
	return math.round(C.COMPANY_BY_ID[id].cost * familyCompany(state) * C.COMPANY_GROWTH ^ (state.companies[id] or 0))
end
function L.upgradePrice(state, id) return math.round(C.COMPANY_BY_ID[id].cost * C.UPGRADE_COST_MULT * familyCompany(state)) end
function L.hireCost(role) return math.round(C.STAFF_BASE_WAGE * C.STAFF_HIRE_YEARS * C.ROLE_WAGE[role]) end
function L.sellPrice(state, id) return math.round((L.companyPrice(state, id) / C.COMPANY_GROWTH) * C.SELL_SHARE) end
function L.stockCapacity(n, phase) return n * C.STOCK_PER_UNIT * phase end
function L.batchPrice(id, now)
	local ev = L.currentEvent(now)
	local shortage = ev and ev.def.id == "shortage" and eventAffects(ev.def, id)
	return math.round(L.companyIncome(id) * (shortage and C.SHORTAGE_PRICE or 1))
end
function L.phaseRequirement(k) return k <= 1 and 0 or math.round(400 * 1.8 ^ (k - 2)) end
function L.phaseCost(k) return math.round(L.phaseRequirement(k) * C.PHASE_COST_YEARS) end
function L.campaignPrice(state, id) return math.round(C.COMPANY_BY_ID[id].cost * (state.companies[id] or 0) * C.MARKETING_COST * familyCompany(state)) end
function L.fundPrice(state, id) return math.round(C.COMPANY_BY_ID[id].cost * (state.companies[id] or 0) * C.FUND_COST * familyCompany(state)) end
function L.contractPrice(state, id) return math.round((state.companies[id] or 0) * L.companyIncome(id) * C.CONTRACT_FEE_YEARS * familyCompany(state)) end
function L.researchLevel(state, id) return state.research[id] or 0 end
function L.researchPrice(state, id) return math.round(C.COMPANY_BY_ID[id].cost * C.RESEARCH_COST * (L.researchLevel(state, id) + 1) * familyCompany(state)) end
function L.contractActive(state, id, now) return (state.contracts[id] or 0) > now end

local function payroll(roles)
	local sum = 0
	for _, k in ipairs(C.STAFF_ROLES) do sum += (roles[k] or 0) * C.ROLE_WAGE[k] end
	return sum * C.STAFF_BASE_WAGE
end
function L.moraleFrom(wageShare) return math.min(1, math.max(0, 1.2 - 2 * wageShare)) end

function L.currentRival(state, now)
	local window = eventWindow(now)
	if now - window * C.EVENT_WINDOW_MS >= C.EVENT_DURATION_MS then return nil end
	local ownedList = {}
	for _, c in ipairs(C.COMPANIES) do if (state.companies[c.id] or 0) > 0 then table.insert(ownedList, c.id) end end
	if #ownedList == 0 then return nil end
	return ownedList[math.floor(hash32("rival:" .. window) * #ownedList) + 1]
end

local function rivalMult(state, id, now)
	if L.currentRival(state, now) ~= id then return 1 end
	local s = setupOf(state, id)
	local shield = now < s.marketingUntil and C.RIVAL_CAMPAIGN_SHIELD or 1
	return math.max(0.5, 1 - C.RIVAL_BITE * s.price * shield)
end

local function eventEffect(state, id, now)
	local ev = L.currentEvent(now)
	if not ev or not eventAffects(ev.def, id) then return 1, 1 end
	local s = setupOf(state, id)
	local exposure = (0.3 + 1.5 * s.risk) * s.price * (1 + C.RESEARCH_EXPOSURE * L.researchLevel(state, id))
		* (L.contractActive(state, id, now) and C.CONTRACT_EXPOSURE or 1)
	local saved = state.responses[id] == ev.window and (1 - C.FUND_SAVES) or 1
	local d = ev.def
	local mult
	if d.mult < 1 then mult = math.max(0.05, 1 - (1 - d.mult) * exposure * saved)
	else mult = 1 + (d.mult - 1) * exposure end
	return mult, 1 + (d.wageMult - 1) * saved
end

function L.companyYield(state, id, now)
	local n = state.companies[id] or 0
	if n <= 0 then return { gross = 0, costs = 0, morale = 1, strike = false } end
	local s = setupOf(state, id)
	local effMult, wageMult = eventEffect(state, id, now)
	local base = n * L.companyIncome(id)
	local r = s.roles
	local rookie = now < s.rookieUntil and C.ROOKIE_FACTOR or 1
	local sick = (r.producer > 0 and hash32(`sick:{id}:{eventWindow(now)}`) < C.STAFF_SICK_CHANCE) and 1 or 0
	local producers = math.max(0, r.producer - sick)
	local staffRevenue = producers * rookie * C.STAFF_REVENUE + r.seller * rookie * C.SELLER_REVENUE
	local boost = (s.upgraded and 1 + C.UPGRADE_BONUS or 1) * s.price * s.output * (0.85 + 0.6 * s.risk)
		* (now < s.marketingUntil and C.MARKETING_BONUS or 1)
		* (r.manager > 0 and 1 + C.MANAGER_BONUS or 1) * effMult
		* (L.contractActive(state, id, now) and 1 + C.CONTRACT_BONUS or 1)
		* (1 + C.RESEARCH_BONUS * L.researchLevel(state, id)) * rivalMult(state, id, now)
	local stocked = s.stock > 0 and 1 or C.NO_STOCK_OUTPUT
	local gross0 = (base * boost + staffRevenue) * stocked
	local wageCost = payroll(r) * wageMult
	local morale = gross0 > 0 and L.moraleFrom(wageCost / gross0) or 1
	local unionOn = s.staff >= C.UNION_MIN_STAFF and s.unionUntil <= now
	local strike = unionOn and morale < C.UNION_THRESHOLD and hash32(`strike:{id}:{eventWindow(now)}`) < C.STRIKE_CHANCE
	local upkeep = math.max(0, (s.output - 0.5) * 0.5)
	return { gross = strike and gross0 * C.STRIKE_OUTPUT or gross0, costs = base * (upkeep + C.OPEX_SHARE) + wageCost, morale = morale, strike = strike }
end

-- ───────── jobs & rates ─────────
function L.eduBonus(edu) return math.min(C.MAX_EDU, math.max(0, edu)) * C.EDU_BONUS_PER_LEVEL end
function L.eduCost(edu) return 5 + edu * 6 end
function L.inCrisis(state, now)
	local c = state.crisis
	return c ~= nil and state.job ~= nil and c.job == state.job.id and now >= c.startAt and now < c.endAt
end
function L.jobHourly(state, now)
	local job, ch = state.job, state.character
	if not job or not ch then return 0 end
	return C.JOB_BY_ID[job.id].salary * (1 + C.JOB_RANK_BONUS * (job.rank - 1)) * C.COUNTRY_DEF[ch.country].salary
		* C.CITY_DEF[ch.city].salary * (state.raises[job.id] or 1) * (L.inCrisis(state, now or 0) and C.CRISIS_SALARY or 1)
end

function L.rates(state, now)
	local ch = state.character
	if not ch then return { salary = 0, companies = 0, passive = 0, living = 0, companyCosts = 0, multiplier = 1, net = 0, dividends = 0 } end
	local city = C.CITY_DEF[ch.city]
	local family = C.FAMILY_DEF[ch.family]
	local fx = L.needsEffects(state, now)
	local multiplier = (1 + L.eduBonus(state.edu)) * fx.income
	local passiveFactor = state.sickUntil > now and 0 or (state.vacationUntil > now and C.VACATION_PAY or 1)
	local salary = L.jobHourly(state, now) * C.PASSIVE_SHARE * passiveFactor * (1 - C.PERSONAL_TAX)

	local companies, costs, value, accountants = 0, 0, 0, 0
	for _, c in ipairs(C.COMPANIES) do
		local n = state.companies[c.id] or 0
		if n > 0 then
			local y = L.companyYield(state, c.id, now)
			companies += y.gross
			costs += y.costs
			value += c.cost * n * family.company
			accountants += setupOf(state, c.id).roles.accountant
		end
	end
	local taxCut = math.min(C.ACCOUNTANT_TAX_MAX, C.ACCOUNTANT_TAX_CUT * accountants)
	local phase = C.PHASE_RATES[clamp(state.phase, 1, C.MAX_PHASE)]
	local rent = math.max(phase.rent * companies, C.RENT_FLOOR * value)
	local tax = phase.tax * (1 - taxCut) * math.max(0, companies - costs - rent)
	costs += rent + tax

	local passive, dividends = 0, 0
	for _, a in ipairs(C.ASSETS) do
		local qty = state.holdings[a.id] or 0
		if a.yield > 0 and qty > 0 then
			local income = qty * L.assetPrice(a.id, now, state.startedAt) * a.yield * (a.cat == "realestate" and city.rent or 1)
			passive += income
			if a.cat == "stocks" then dividends += income end
		end
	end
	local living = C.LIVING_BASE * C.COUNTRY_DEF[ch.country].living * city.living * family.living
	local gross = (salary + companies + passive) * multiplier
	return { salary = salary, companies = companies, passive = passive, living = living, companyCosts = costs,
		multiplier = multiplier, net = gross - costs, dividends = dividends }
end

function L.portfolioValue(state, now)
	local total = 0
	for _, a in ipairs(C.ASSETS) do total += (state.holdings[a.id] or 0) * L.assetPrice(a.id, now, state.startedAt) end
	return total
end

function L.netWorth(state, now)
	local total = state.cash + L.portfolioValue(state, now)
	for _, c in ipairs(C.COMPANIES) do
		local n = state.companies[c.id] or 0
		if n > 0 then total += c.cost * n * familyCompany(state) end
	end
	for _, slot in pairs(state.hustle) do total += slot.value end
	return math.round(total)
end

function L.distressOf(state, now)
	local any = false
	for _, c in ipairs(C.COMPANIES) do if (state.companies[c.id] or 0) > 0 then any = true break end end
	if not state.character or not any then return false, 0 end
	local r = L.rates(state, now)
	if not (r.net < 0 and state.cash < -r.net * C.WARN_HOURS) then return false, 0 end
	local since = state.distressAt ~= 0 and state.distressAt or now
	return true, math.max(0, since + C.WARN_MS - now)
end

-- ───────── settle (apply elapsed time) ─────────
local function pushNews(state, item)
	table.insert(state.news, item)
	while #state.news > C.NEWS_MAX do table.remove(state.news, 1) end
end

local function closePosition(state, id, cash, basis)
	state.holdings[id] = nil
	state.cost[id] = nil
	state.cash += cash
	state.totalEarned += math.max(0, cash - basis)
end

local function resolveStartups(state, now)
	local cur = math.floor(now / C.STARTUP_ROUND_MS)
	for _, a in ipairs(C.ASSETS) do
		if a.cat == "startups" then
			local id = a.id
			if (state.holdings[id] or 0) <= 0 then
				state.startupRound[id] = cur
			else
				local last = state.startupRound[id] or cur
				for r = math.max(last + 1, cur - C.STARTUP_MAX_ROUNDS + 1), cur do
					local qty = state.holdings[id] or 0
					if qty <= 0 then break end
					local out = L.startupOutcome(id, r)
					if out.kind ~= "run" then
						local price = L.assetPrice(id, r * C.STARTUP_ROUND_MS, state.startedAt)
						local basis = qty * (state.cost[id] or price)
						if out.kind == "exit" then
							local money = qty * price * out.mult
							closePosition(state, id, money, basis)
							pushNews(state, { t = r * C.STARTUP_ROUND_MS, kind = "startup-exit", asset = id, amount = math.round(money) })
						else
							closePosition(state, id, 0, basis)
							pushNews(state, { t = r * C.STARTUP_ROUND_MS, kind = "startup-krach", asset = id, amount = math.round(qty * price) })
						end
					end
				end
				state.startupRound[id] = cur
			end
		end
	end
end

local function applyBuy(state, id, money, price, now)
	local qty = money / price
	local have = state.holdings[id] or 0
	local avg = state.cost[id] or price
	state.cost[id] = (have * avg + money) / (have + qty)
	state.holdings[id] = have + qty
	state.cash -= money
	if have <= 0 and C.ASSET_BY_ID[id].cat == "startups" then state.startupRound[id] = math.floor(now / C.STARTUP_ROUND_MS) end
end

local function applySell(state, id, share, price)
	local have = state.holdings[id] or 0
	local qty = have * share
	local money = qty * price
	local profit = money - qty * (state.cost[id] or price)
	if have - qty < 1e-9 then state.holdings[id] = nil; state.cost[id] = nil else state.holdings[id] = have - qty end
	state.cash += money
	state.totalEarned += math.max(0, profit)
	return money, profit
end

local function fillOrdersAt(state, at)
	local snapshot = {}
	for i, o in ipairs(state.orders) do snapshot[i] = o end
	for _, o in ipairs(snapshot) do
		local p = L.assetPrice(o.asset, at, state.startedAt)
		local hit = (o.when == "below") and p <= o.price or (o.when == "above" and p >= o.price)
		if hit then
			for i, x in ipairs(state.orders) do if x.id == o.id then table.remove(state.orders, i) break end end
			if o.side == "buy" then
				local money = math.min(o.amount, state.cash)
				if money < 1 then pushNews(state, { t = at, kind = "order-failed", asset = o.asset, amount = 0 })
				else
					applyBuy(state, o.asset, money, p, at)
					pushNews(state, { t = at, kind = "buy-filled", asset = o.asset, amount = math.round(money) })
				end
			elseif (state.holdings[o.asset] or 0) <= 0 then
				pushNews(state, { t = at, kind = "order-failed", asset = o.asset, amount = 0 })
			else
				local money = applySell(state, o.asset, o.share, p)
				pushNews(state, { t = at, kind = "sell-filled", asset = o.asset, amount = math.round(money) })
			end
		end
	end
end

local function fillOrders(state, from, to)
	if #state.orders == 0 or to <= from then return end
	local step = math.max(C.ORDER_CHECK_MS, math.ceil((to - from) / C.ORDER_MAX_SAMPLES))
	local at = from + step
	while true do
		local t = math.min(at, to)
		fillOrdersAt(state, t)
		if t >= to or #state.orders == 0 then break end
		at += step
	end
end

local function applyQuits(state, now)
	local window = eventWindow(now)
	for _, c in ipairs(C.COMPANIES) do
		local s = state.setup[c.id]
		if s and s.staff > 0 and (state.companies[c.id] or 0) > 0 and hash32(`quit:{c.id}:{window}`) < C.QUIT_CHANCE then
			local best = "producer"
			for _, k in ipairs(C.STAFF_ROLES) do if s.roles[k] > s.roles[best] then best = k end end
			s.roles[best] -= 1
			s.staff -= 1
		end
	end
end

local function bankruptcy(state, now)
	local worst, worstNet = nil, math.huge
	for _, c in ipairs(C.COMPANIES) do
		if (state.companies[c.id] or 0) > 0 then
			local y = L.companyYield(state, c.id, now)
			if y.gross - y.costs < worstNet then worstNet = y.gross - y.costs; worst = c.id end
		end
	end
	state.distressAt = 0
	if not worst then return end
	state.companies[worst] = nil
	state.setup[worst] = nil
	state.contracts[worst] = nil
	state.research[worst] = nil
	state.bankruptcies += 1
	state.lastBankruptId = worst
	state.lastBankruptAt = now
end

local function withPeak(state, now)
	local worth = L.netWorth(state, now)
	state.peak = math.max(state.peak, worth)
	state.best = math.max(state.best, worth)
end

local function recordHistory(state, now)
	local last = state.history[#state.history]
	if last and now - last.t < C.HISTORY_STEP_MS then return end
	table.insert(state.history, { t = now, w = L.netWorth(state, now), p = math.round(L.portfolioValue(state, now)) })
	while #state.history > C.HISTORY_MAX do table.remove(state.history, 1) end
end

function L.settle(state, now)
	if not state.character then state.lastSeen = now return end
	local elapsed = math.min(math.max(0, now - state.lastSeen), C.MAX_OFFLINE_MIN * 60000)
	local hours = elapsed / H
	local prev = state.lastSeen
	state.lastSeen = now
	local fx = L.needsEffects(state, now)
	if elapsed > 0 then
		local rate = L.rates(state, prev + elapsed / 2)
		local gain = rate.net * hours
		state.cash += gain
		if gain > 0 then state.totalEarned += gain end
		state.energy = math.min(C.ENERGY_MAX * fx.energyCap,
			math.max(0, state.energy + C.ENERGY_PER_HOUR * hours * fx.energyRegen - fx.energyDrain * hours))
		if state.job then state.job.hours += hours end
		for _, c in ipairs(C.COMPANIES) do
			local n, s = state.companies[c.id] or 0, state.setup[c.id]
			if s and n > 0 and s.stock > 0 then s.stock = math.max(0, s.stock - n * s.output * C.INPUT_RATE * hours) end
		end
		for _, id in ipairs(C.NEEDS) do state.needs[id] = math.max(0, state.needs[id] - hours / 24) end
		if fx.bills then state.cash -= L.needDaily(state, "housing") / 24 * hours end
		if eventWindow(now) ~= eventWindow(prev) then applyQuits(state, now) end
	end
	-- drop expired boosts
	for i = #state.boosts, 1, -1 do if state.boosts[i].until_ <= now then table.remove(state.boosts, i) end end
	local danger = L.distressOf(state, now)
	if not danger then state.distressAt = 0
	else
		if state.distressAt == 0 then state.distressAt = now end
		if now - state.distressAt >= C.WARN_MS then bankruptcy(state, now) end
	end
	if now - state.bonusAt >= C.BONUS_MS then
		local bonus = state.dayPay * C.BONUS_SHARE
		state.cash += bonus
		state.totalEarned += bonus
		state.dayPay = 0
		state.bonusAt = now
	end
	resolveStartups(state, now)
	fillOrders(state, now - elapsed, now)
	recordHistory(state, now)
	withPeak(state, now)
end

-- ───────── gates: why an action is locked, what it costs ─────────
-- Each gate returns { ok = bool, price = n, reasons = { {code=..., need=..., have=...}, ... } }
local function gate(price, cash)
	return { ok = true, price = price, reasons = {}, cash = cash }
end
local function need(g, code, ok, have, req)
	if not ok then g.ok = false; table.insert(g.reasons, { code = code, have = have, need = req }) end
end
function L.jobGate(state, id)
	local def = C.JOB_BY_ID[id]
	local g = gate(def.fee, state.cash)
	need(g, "edu", state.edu >= def.edu, state.edu, def.edu)
	need(g, "busyShift", state.shift == nil, 0, 1)
	need(g, "sameJob", not (state.job and state.job.id == id), 0, 1)
	return g
end
function L.companyGate(state, id)
	local g = gate(L.companyPrice(state, id), state.cash)
	need(g, "era", not L.isLocked(state, "company", id), 0, 1)
	need(g, "maxUnits", (state.companies[id] or 0) < C.MAX_COMPANY_UNITS, 0, 1)
	return g
end
function L.hustleGate(state, id)
	local def = C.HUSTLE_BY_ID[id]
	local g = gate(def.cost, state.cash)
	need(g, "edu", state.edu >= def.edu, state.edu, def.edu)
	need(g, "cash", state.cash >= def.cost, math.floor(state.cash), def.cost)
	need(g, "running", state.hustle[id] == nil, 0, 1)
	return g
end
function L.deviceGate(state, tier, now)
	local d = C.DEVICES[tier]
	if not d then return { ok = false, price = 0, reasons = { { code = "unknownDevice" } } } end
	local g = gate(d.price, state.cash)
	need(g, "deviceOrder", tier == state.device + 1, state.device, tier - 1)
	local req = d.req
	if req.shifts then need(g, "shifts", (state.stats.shifts or 0) >= req.shifts, state.stats.shifts or 0, req.shifts) end
	if req.edu then need(g, "edu", state.edu >= req.edu, state.edu, req.edu) end
	if req.netWorth then
		local nw = now and L.netWorth(state, now) or 0
		need(g, "netWorth", nw >= req.netWorth, nw, req.netWorth)
	end
	if req.companies then
		local n = 0
		for _, c in ipairs(C.COMPANIES) do n += state.companies[c.id] or 0 end
		need(g, "companies", n >= req.companies, n, req.companies)
	end
	need(g, "cash", state.cash >= d.price, math.floor(state.cash), d.price)
	return g
end

-- Upcoming expenses and active projects (iPad+ overview) and alerts (PC).
function L.upcoming(state, now)
	local list = {}
	for _, id in ipairs(C.NEEDS) do
		local msLeft = state.needs[id] * 24 * H
		if state.needs[id] < 2 then
			table.insert(list, { kind = "need", id = id, inMs = msLeft, amount = L.needDaily(state, id) })
		end
	end
	for _, c in ipairs(C.COMPANIES) do
		local n, s = state.companies[c.id] or 0, state.setup[c.id]
		if s and n > 0 then
			local burn = n * s.output * C.INPUT_RATE
			if burn > 0 then
				table.insert(list, { kind = "stock", id = c.id, inMs = (s.stock / burn) * H, amount = L.batchPrice(c.id, now) * 5 })
			end
		end
	end
	table.sort(list, function(a, b) return a.inMs < b.inMs end)
	return list
end

function L.projects(state, now)
	local list = {}
	if state.shift then table.insert(list, { kind = "shift", step = state.shift.step }) end
	for id, slot in pairs(state.hustle) do
		table.insert(list, { kind = "hustle", id = id, round = slot.round, due = L.hustleDue(slot, id, now), inMs = L.hustleRoundAt(slot, id, slot.round) - now })
	end
	for _, o in ipairs(state.orders) do table.insert(list, { kind = "order", order = o }) end
	return list
end

function L.alerts(state, now)
	local list = {}
	local danger, left = L.distressOf(state, now)
	if danger then table.insert(list, { level = "bad", code = "distress", ms = left }) end
	if state.energy < C.SHIFT_MIN_ENERGY then table.insert(list, { level = "warn", code = "lowEnergy" }) end
	for _, id in ipairs(C.NEEDS) do
		if state.needs[id] <= 0 then table.insert(list, { level = "bad", code = "needEmpty", id = id }) end
	end
	for _, c in ipairs(C.COMPANIES) do
		local s = state.setup[c.id]
		if (state.companies[c.id] or 0) > 0 and s and s.stock <= 0 then table.insert(list, { level = "warn", code = "noStock", id = c.id }) end
	end
	local ev = L.currentEvent(now)
	if ev then
		for _, c in ipairs(C.COMPANIES) do
			if (state.companies[c.id] or 0) > 0 and eventAffects(ev.def, c.id) then
				table.insert(list, { level = L.isNegativeEvent(ev.def) and "bad" or "good", code = "event", id = c.id, event = ev.def.id })
				break
			end
		end
	end
	if state.sickUntil > now then table.insert(list, { level = "warn", code = "sick" }) end
	if L.inCrisis(state, now) then table.insert(list, { level = "warn", code = "crisis" }) end
	for _, o in ipairs(state.orders) do
		local p = L.assetPrice(o.asset, now, state.startedAt)
		if math.abs(p - o.price) / o.price < 0.03 then table.insert(list, { level = "good", code = "orderNear", id = o.asset }) end
	end
	return list
end

-- ───────── actions ─────────
function L.createCharacter(state, input, now)
	if state.character then return fail("has-character") end
	local name = L.cleanName(input.name)
	if name == "" or not contains(C.COUNTRIES, input.country) or not contains(C.CITIES, input.city)
		or not contains(C.ERAS, input.era) or not contains(C.FAMILIES, input.family) then return fail("bad-request") end
	local fresh = L.newState(now, state.runs, state.best)
	for k in pairs(state) do state[k] = nil end
	for k, v in pairs(fresh) do state[k] = v end
	state.character = { country = input.country, name = name, city = input.city, era = input.era, family = input.family }
	state.cash = math.round(C.FAMILY_DEF[input.family].start * C.ERA_DEF[input.era].start)
	state.peak = state.cash
	withPeak(state, now)
	return true
end

-- Restart: wipes progress (including device tier and layout choices). Record (`best`) and run count stay.
function L.restart(state, now)
	local fresh = L.newState(now, state.runs + 1, state.best)
	for k in pairs(state) do state[k] = nil end
	for k, v in pairs(fresh) do state[k] = v end
	return true
end

function L.buyNeed(state, id, days, now)
	if not state.character then return fail("no-character") end
	if not C.NEED_DEF[id] then return fail("bad-request") end
	if not isInt(days) or days < 1 then return fail("bad-request") end
	local have = state.needs[id]
	local add = math.min(days, C.MAX_NEED_DAYS - have)
	if add <= 1e-9 then return fail("max") end
	state.cash -= math.round(L.needDaily(state, id) * add)
	state.needs[id] = have + add
	withPeak(state, now)
	return true
end

function L.buyBoost(state, id, now)
	if not state.character then return fail("no-character") end
	local def = C.BOOST_DEF[id]
	if not def then return fail("bad-request") end
	local current = now
	for _, b in ipairs(state.boosts) do if b.id == id and b.until_ > now then current = b.until_ end end
	local untilT = math.min(now + C.MAX_BOOST_MINUTES * 60000, math.max(current, now) + def.minutes * 60000)
	for i = #state.boosts, 1, -1 do if state.boosts[i].id == id then table.remove(state.boosts, i) end end
	table.insert(state.boosts, { id = id, until_ = untilT })
	state.cash -= L.boostPrice(state, id)
	withPeak(state, now)
	return true
end

function L.takeJob(state, id, now)
	if not state.character then return fail("no-character") end
	local def = C.JOB_BY_ID[id]
	if not def then return fail("bad-request") end
	if state.shift then return fail("busy") end
	if state.job and state.job.id == id then return fail("same-job") end
	if state.edu < def.edu then return fail("locked") end
	state.cash -= def.fee
	state.job = { id = id, hours = 0, rank = 1, rankSince = now, points = 0, perfs = {}, bad = 0, warned = false, lead = false, promoRetryAt = 0 }
	withPeak(state, now)
	return true
end

function L.quitJob(state, now)
	if not state.job then return fail("no-job") end
	if state.shift then return fail("busy") end
	state.job = nil
	return true
end

function L.situationAt(seed, step)
	return C.SITUATIONS[(seed + step * 2) % #C.SITUATIONS + 1]
end

function L.startShift(state, now, rng, walk)
	rng = rng or math.random
	if not state.character then return fail("no-character") end
	if not state.job then return fail("no-job") end
	if state.shift then return fail("busy") end
	if state.sickUntil > now then return fail("sick") end
	if state.vacationUntil > now then return fail("vacation") end
	if now < state.shiftReadyAt then return fail("cooldown") end
	local noTransport = L.needsEffects(state, now).noShift
	if noTransport and not walk then return fail("no-transport") end
	local extra = (state.job.lead and C.LEAD_EXTRA_ENERGY or 0) + (noTransport and C.WALK_EXTRA_ENERGY or 0)
	if state.energy < C.SHIFT_MIN_ENERGY + extra then return fail("low-energy") end
	if rng() < C.SICK_CHANCE then
		state.sickUntil = now + (rng() < 0.5 and 1 or 2) * C.GAME_DAY
		return true, "sick"
	end
	local event = "shift-started"
	if (not state.crisis or now >= state.crisis.endAt) and rng() < C.CRISIS_CHANCE then
		state.crisis = { job = state.job.id, startAt = now + C.CRISIS_DELAY_MS, endAt = now + C.CRISIS_DELAY_MS + C.CRISIS_MS }
		event = "crisis-warning"
	end
	state.energy -= extra
	state.shift = { startedAt = now, seed = math.floor(rng() * #C.SITUATIONS), step = 0, perfSum = 0, lead = state.job.lead }
	return true, event
end

local function avgPerf(perfs)
	if #perfs == 0 then return 0 end
	local s = 0
	for _, p in ipairs(perfs) do s += p end
	return s / #perfs
end

function L.chooseShift(state, index, now)
	if not state.character then return fail("no-character") end
	if not state.job then return fail("no-job") end
	local shift = state.shift
	if not shift then return fail("no-shift") end
	if not isInt(index) or index < 1 or index > 3 then return fail("bad-request") end
	local perf = L.situationAt(shift.seed, shift.step).perf[index]
	shift.step += 1
	shift.perfSum += perf
	state.energy = math.max(0, state.energy - C.SITUATION_ENERGY)
	if shift.step < C.SITUATIONS_PER_SHIFT then return true, "shift-step" end

	local avg = shift.perfSum / C.SITUATIONS_PER_SHIFT
	local mult = 1 + L.eduBonus(state.edu)
	local pay = math.round(L.jobHourly(state, now) * (1 - C.PASSIVE_SHARE) * (1 / C.SHIFTS_PER_YEAR) * (1 - C.PERSONAL_TAX)
		* (0.7 + 0.6 * avg / C.PERF_MAX) * (shift.lead and C.LEAD_PAY or 1) * mult)
	local points = avg >= 70 and 10 or (avg >= 40 and 6 or 3)
	local job = state.job
	job.points += points
	table.insert(job.perfs, avg)
	while #job.perfs > 5 do table.remove(job.perfs, 1) end
	state.eduPoints += points
	state.stats.shifts += 1
	local event = "shift-done"
	if avg >= C.BAD_PERF then job.bad = 0; job.warned = false
	elseif job.bad + 1 >= C.DISMISS_STREAK and job.warned then state.job = nil; event = "fired"
	elseif job.bad + 1 >= C.DISMISS_STREAK then job.bad = 0; job.warned = true; event = "warned"
	else job.bad += 1 end
	state.cash += pay
	state.totalEarned += pay
	state.dayPay += pay
	state.shift = nil
	state.shiftReadyAt = now + C.SHIFT_COOLDOWN_MS
	withPeak(state, now)
	return true, event, pay
end

function L.rest(state, now)
	if not state.character then return fail("no-character") end
	if state.shift then return fail("busy") end
	if now < state.restReadyAt then return fail("cooldown") end
	state.energy = C.ENERGY_MAX
	state.restReadyAt = now + C.REST_COOLDOWN_MS
	return true, "rested"
end

function L.startVacation(state, now)
	if not state.character then return fail("no-character") end
	if state.shift then return fail("busy") end
	if state.sickUntil > now then return fail("sick") end
	if state.vacationUntil > now then return fail("busy") end
	local recent = {}
	for _, t in ipairs(state.vacations) do if now - t < C.VACATION_WINDOW_MS then table.insert(recent, t) end end
	if #recent >= C.VACATION_MAX then return fail("max") end
	table.insert(recent, now)
	state.vacations = recent
	state.vacationUntil = now + C.VACATION_MS
	state.energy = C.ENERGY_MAX
	return true, "vacation"
end

function L.requestPromotion(state, now, rng)
	rng = rng or math.random
	if not state.character then return fail("no-character") end
	local job = state.job
	if not job then return fail("no-job") end
	if state.shift then return fail("busy") end
	if job.rank >= C.MAX_JOB_RANK then return fail("max") end
	if now < job.promoRetryAt then return fail("cooldown") end
	if job.points < C.RANK_POINTS[job.rank + 1] then return fail("not-enough-points") end
	if state.edu < C.JOB_BY_ID[job.id].edu + job.rank then return fail("locked") end
	if now - job.rankSince < C.PROMO_MIN_RANK_MS then return fail("not-ready") end
	local chance = math.min(C.PROMO_MAX, C.PROMO_BASE + C.PROMO_PER_PERF * avgPerf(job.perfs))
	if rng() * 100 < chance then
		job.rank += 1; job.rankSince = now; job.promoRetryAt = 0
		return true, "promoted"
	end
	job.promoRetryAt = now + C.PROMO_RETRY_MS
	return true, "promo-rejected"
end

function L.negotiateRaise(state, now, rng)
	rng = rng or math.random
	if not state.character then return fail("no-character") end
	if not state.job then return fail("no-job") end
	if state.shift then return fail("busy") end
	if now < state.raiseReadyAt then return fail("cooldown") end
	local penalty = state.job.rank >= C.LEAD_MIN_RANK and C.RAISE_SENIOR_PENALTY or 0
	local chance = math.max(0, C.RAISE_BASE + C.RAISE_PER_PERF * avgPerf(state.job.perfs) - penalty)
	state.raiseReadyAt = now + C.RAISE_COOLDOWN_MS
	if rng() * 100 < chance then
		local id = state.job.id
		state.raises[id] = math.min(C.RAISE_MAX, (state.raises[id] or 1) * (1.05 + rng() * 0.05))
		return true, "raised"
	end
	return true, "raise-rejected"
end

function L.setLead(state, on)
	if not state.job then return fail("no-job") end
	if state.shift then return fail("busy") end
	if on and state.job.rank < C.LEAD_MIN_RANK then return fail("locked") end
	state.job.lead = on and true or false
	return true
end

function L.investEdu(state, now)
	if not state.character then return fail("no-character") end
	if state.edu >= C.MAX_EDU then return fail("max") end
	local cost = L.eduCost(state.edu)
	if state.eduPoints < cost then return fail("not-enough-points") end
	state.eduPoints -= cost
	state.edu += 1
	return true
end

-- Companies
local function owned(state, id)
	if not state.character then return nil, "no-character" end
	if not C.COMPANY_BY_ID[id] then return nil, "bad-request" end
	if (state.companies[id] or 0) <= 0 then return nil, "nothing" end
	return id
end

function L.buyCompany(state, id, now)
	if not state.character then return fail("no-character") end
	if not C.COMPANY_BY_ID[id] then return fail("bad-request") end
	if L.isLocked(state, "company", id) then return fail("locked") end
	local n = state.companies[id] or 0
	if n >= C.MAX_COMPANY_UNITS then return fail("max") end
	state.cash -= L.companyPrice(state, id)
	state.companies[id] = n + 1
	withPeak(state, now)
	return true
end

function L.sellCompany(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local n = state.companies[id]
	local money = L.sellPrice(state, id)
	state.cash += money
	if n - 1 <= 0 then
		state.companies[id], state.setup[id], state.contracts[id], state.research[id] = nil, nil, nil, nil
	else
		state.companies[id] = n - 1
		local s = state.setup[id]
		if s then
			local cap = (n - 1) * C.MAX_STAFF_PER_UNIT
			local excess = math.max(0, s.staff - cap)
			for _, k in ipairs({ "producer", "seller", "manager", "accountant" }) do
				local d = math.min(s.roles[k], excess)
				s.roles[k] -= d; excess -= d; s.staff -= d
			end
			s.stock = math.min(s.stock, L.stockCapacity(n - 1, state.phase))
		end
	end
	withPeak(state, now)
	return true, "sold", money
end

function L.upgradeCompany(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local s = setupOf(state, id)
	if s.upgraded then return fail("max") end
	state.cash -= L.upgradePrice(state, id)
	s.upgraded = true
	withPeak(state, now)
	return true
end

function L.hireStaff(state, id, delta, role, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	role = role or "producer"
	if delta ~= 1 and delta ~= -1 then return fail("bad-request") end
	if not C.ROLE_WAGE[role] then return fail("bad-request") end
	local s = setupOf(state, id)
	if delta == -1 then
		if s.roles[role] <= 0 then return fail("nothing") end
		s.roles[role] -= 1; s.staff -= 1
		return true
	end
	if s.staff >= state.companies[id] * C.MAX_STAFF_PER_UNIT then return fail("max") end
	if s.roles[role] >= C.ROLE_MAX[role] then return fail("max") end
	state.cash -= L.hireCost(role)
	s.roles[role] += 1; s.staff += 1
	s.rookieUntil = math.max(now, s.rookieUntil) + C.ROOKIE_MS
	withPeak(state, now)
	return true
end

function L.buyStock(state, id, amount, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	if not isInt(amount) or amount < 1 then return fail("bad-request") end
	local s = setupOf(state, id)
	if s.stock + amount > L.stockCapacity(state.companies[id], state.phase) + 1e-9 then return fail("max") end
	state.cash -= L.batchPrice(id, now) * amount
	s.stock += amount
	withPeak(state, now)
	return true
end

function L.setCompanySetting(state, id, field, value, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local r = C.SETTING_RANGE[field]
	if not r or not isNum(value) then return fail("bad-request") end
	local snapped = math.floor(value / r.step + 0.5) * r.step
	setupOf(state, id)[field] = clamp(tonumber(string.format("%.2f", snapped)), r.min, r.max)
	return true
end

function L.runCampaign(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local s = setupOf(state, id)
	if now < s.marketingUntil then return fail("busy") end
	state.cash -= L.campaignPrice(state, id)
	s.marketingUntil = now + C.MARKETING_MINUTES * 60000
	withPeak(state, now)
	return true
end

function L.fundResponse(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local ev = L.currentEvent(now)
	if not ev or not L.isNegativeEvent(ev.def) or not eventAffects(ev.def, id) then return fail("nothing") end
	if state.responses[id] == ev.window then return fail("busy") end
	state.cash -= L.fundPrice(state, id)
	state.responses[id] = ev.window
	withPeak(state, now)
	return true
end

function L.signContract(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	if L.contractActive(state, id, now) then return fail("busy") end
	state.cash -= L.contractPrice(state, id)
	state.contracts[id] = now + C.CONTRACT_MS
	withPeak(state, now)
	return true
end

function L.researchCompany(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local lvl = L.researchLevel(state, id)
	if lvl >= C.MAX_RESEARCH then return fail("max") end
	state.cash -= L.researchPrice(state, id)
	state.research[id] = lvl + 1
	withPeak(state, now)
	return true
end

function L.unionDeal(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	local s = setupOf(state, id)
	if s.staff < C.UNION_MIN_STAFF then return fail("nothing") end
	if s.unionUntil > now then return fail("busy") end
	state.cash -= math.round(payroll(s.roles) * C.UNION_DEAL_YEARS)
	s.unionUntil = now + C.UNION_DEAL_MS
	withPeak(state, now)
	return true
end

function L.upgradePhase(state, now)
	if not state.character then return fail("no-character") end
	if state.phase >= C.MAX_PHASE then return fail("max") end
	local nextPhase = state.phase + 1
	if L.rates(state, now).companies < L.phaseRequirement(nextPhase) then return fail("locked") end
	state.cash -= L.phaseCost(nextPhase)
	state.phase = nextPhase
	withPeak(state, now)
	return true
end

-- Assets and orders
function L.buyAsset(state, id, amount, now)
	if not state.character then return fail("no-character") end
	if not C.ASSET_BY_ID[id] then return fail("bad-request") end
	if not isNum(amount) or amount <= 0 then return fail("bad-request") end
	if L.isLocked(state, "asset", id) then return fail("locked") end
	local money = math.min(amount, state.cash)
	if money < 1 then return fail("not-enough-cash") end
	applyBuy(state, id, money, L.assetPrice(id, now, state.startedAt), now)
	withPeak(state, now)
	return true, "bought", math.round(money)
end

function L.sellAsset(state, id, share, now)
	if not state.character then return fail("no-character") end
	if not C.ASSET_BY_ID[id] then return fail("bad-request") end
	if (state.holdings[id] or 0) <= 0 then return fail("nothing") end
	share = isNum(share) and clamp(share, 0, 1) or 1
	if share <= 0 then return fail("bad-request") end
	local money, profit = applySell(state, id, share, L.assetPrice(id, now, state.startedAt))
	withPeak(state, now)
	return true, "sold", math.round(money), math.round(profit)
end

function L.placeOrder(state, input, now)
	if not state.character then return fail("no-character") end
	if type(input) ~= "table" or not C.ASSET_BY_ID[input.asset] then return fail("bad-request") end
	if input.side ~= "buy" and input.side ~= "sell" then return fail("bad-request") end
	if input.when ~= "below" and input.when ~= "above" then return fail("bad-request") end
	if not isNum(input.price) or input.price <= 0 then return fail("bad-request") end
	local current = L.assetPrice(input.asset, now, state.startedAt)
	if input.when == "below" and input.price >= current then return fail("bad-request") end
	if input.when == "above" and input.price <= current then return fail("bad-request") end
	if #state.orders >= C.MAX_ORDERS then return fail("max") end
	local amount, share = 0, 0
	if input.side == "buy" then
		if not isNum(input.amount) or input.amount <= 0 then return fail("bad-request") end
		amount = input.amount
	else
		if (state.holdings[input.asset] or 0) <= 0 then return fail("nothing") end
		local s = isNum(input.share) and input.share or 1
		if s <= 0 or s > 1 then return fail("bad-request") end
		share = s
	end
	table.insert(state.orders, {
		id = `o{state.orderSeq}-{now}`, asset = input.asset, side = input.side, when = input.when,
		price = input.price, amount = amount, share = share, createdAt = now,
	})
	state.orderSeq += 1
	withPeak(state, now)
	return true
end

function L.cancelOrder(state, id, now)
	if not state.character then return fail("no-character") end
	if type(id) ~= "string" then return fail("bad-request") end
	for i, o in ipairs(state.orders) do
		if o.id == id then table.remove(state.orders, i) return true end
	end
	return fail("nothing")
end

function L.arbitrageLimit(state) return C.ARB_CAP * (1 + state.edu * 0.2) end
function L.arbitrage(state, amount, now)
	if not state.character then return fail("no-character") end
	if now < state.arbReadyAt then return fail("cooldown") end
	if not isNum(amount) or amount <= 0 then return fail("bad-request") end
	local money = math.min(amount, state.cash, L.arbitrageLimit(state))
	if money < 1 then return fail("not-enough-cash") end
	local edge = L.arbitrageSpread(now) - C.ARB_FEE
	if edge <= 0 then return fail("no-spread") end
	local profit = money * edge
	state.cash += profit
	state.totalEarned += profit
	state.arbReadyAt = now + C.ARB_COOLDOWN_MS
	withPeak(state, now)
	return true, "arbitrage", math.round(profit)
end

-- Hustles
function L.hustleRoundAt(slot, id, round) return slot.startedAt + (round + 1) * C.HUSTLE_BY_ID[id].gapSec * 1000 end
function L.hustleDue(slot, id, now)
	return slot ~= nil and slot.round < C.HUSTLE_PHASES and now >= L.hustleRoundAt(slot, id, slot.round)
end
function L.hustleMarket(slot, id)
	local m = C.HUSTLE_BY_ID[id].market
	return m[1] + (m[2] - m[1]) * hustleRoll(slot.seed, C.HUSTLE_PHASES, 0)
end
function L.hustleHint(slot, id, experience)
	if experience <= 0 then return nil end
	local up = L.hustleMarket(slot, id) >= 1
	local reliability = math.min(0.9, 0.5 + 0.1 * experience)
	local correct = hustleRoll(slot.seed, C.HUSTLE_PHASES, 1) < reliability
	if correct then return up end
	return not up
end
local function hustleBase(def)
	local denom = (1 - def.commission) * (1 - def.scam * def.lossShare)
	return (def.target / denom) ^ (1 / C.HUSTLE_PHASES)
end
function L.hustleChoices(slot, id)
	local def = C.HUSTLE_BY_ID[id]
	local base = hustleBase(def)
	local bonus = 1 + math.min(C.HUSTLE_STREAK_MAX, slot.streak * C.HUSTLE_STREAK_STEP)
	local function range(mid, width) return math.max(0.05, mid - width) * bonus, (mid + width) * bonus end
	local ratio = slot.value > 0 and slot.stake / slot.value or 1
	local list = {}
	for i, o in ipairs(def.phases[slot.round + 1]) do
		local lo, hi = range(base + (o.cost + def.upkeep) * ratio, o.width)
		table.insert(list, { index = i, cost = o.cost, lo = lo, hi = hi, event = false })
	end
	if hustleRoll(slot.seed, slot.round, 4) < C.HUSTLE_EVENT_CHANCE then
		local lo, hi = range(base + C.HUSTLE_EVENT.cost * ratio, C.HUSTLE_EVENT.width)
		table.insert(list, { index = 4, cost = C.HUSTLE_EVENT.cost, lo = lo, hi = hi, event = true })
	end
	return list
end

function L.startHustle(state, id, stake, now, rng)
	rng = rng or math.random
	if not state.character then return fail("no-character") end
	local def = C.HUSTLE_BY_ID[id]
	if not def then return fail("bad-request") end
	if state.edu < def.edu then return fail("locked") end
	if state.hustle[id] then return fail("busy") end
	stake = stake or def.cost
	if not isInt(stake) or stake < 1 or stake > 1e12 then return fail("bad-request") end
	if state.cash < stake then return fail("not-enough-cash") end
	state.cash -= stake
	state.hustle[id] = { startedAt = now, value = stake, stake = stake, round = 0, seed = math.floor(rng() * 2 ^ 31),
		streak = 0, protected = false, log = {} }
	return true
end

function L.topUpHustle(state, id, amount, now)
	if not state.character then return fail("no-character") end
	local slot = C.HUSTLE_BY_ID[id] and state.hustle[id]
	if not slot then return fail("nothing") end
	if not isInt(amount) or amount < 1 or amount > 1e12 then return fail("bad-request") end
	if state.cash < amount then return fail("not-enough-cash") end
	slot.value += amount
	slot.stake += amount
	state.cash -= amount
	return true
end

function L.decideHustle(state, id, option, now)
	if not state.character then return fail("no-character") end
	local def = C.HUSTLE_BY_ID[id]
	if not def then return fail("bad-request") end
	local slot = state.hustle[id]
	if not slot then return fail("nothing") end
	if not L.hustleDue(slot, id, now) then return fail("not-ready") end
	local choice
	for _, c in ipairs(L.hustleChoices(slot, id)) do if c.index == option then choice = c end end
	if not choice then return fail("bad-request") end
	local last = slot.round == C.HUSTLE_PHASES - 1
	-- roll index is 0-based in the web version (parity)
	local quality = choice.lo + (choice.hi - choice.lo) * hustleRoll(slot.seed, slot.round, choice.index - 1)
	local mult, value, lost = quality, slot.value * quality, false
	if last then
		mult = quality * L.hustleMarket(slot, id) * (1 - def.commission)
		value = slot.value * mult
		local chance = math.max(0, def.scam * (slot.protected and 0.5 or 1) - (state.knowledge[id] or 0) * 0.01)
		if hustleRoll(slot.seed, C.HUSTLE_PHASES, 2) < chance then
			lost = true
			value *= 1 - def.lossShare
		end
	end
	value = math.max(0, math.round(value - (choice.cost + def.upkeep) * slot.stake))
	slot.value = value
	slot.round += 1
	slot.streak = quality >= 1 and slot.streak + 1 or 0
	slot.protected = slot.protected or (slot.round == 2 and choice.index - 1 == def.protect)
	table.insert(slot.log, math.round(mult * 100) / 100)
	if not last then return true, "step" end
	state.hustle[id] = nil
	local profit = value - slot.stake
	state.cash += value
	state.knowledge[id] = math.min(C.HUSTLE_MAX_EXPERIENCE, (state.knowledge[id] or 0) + 1)
	state.totalEarned += math.max(0, profit)
	withPeak(state, now)
	return true, lost and "lost" or "done", profit
end

-- ───────── devices: one atomic purchase ─────────
-- Deducts the price and unlocks the tier in the same synchronous call (no yields), so no partial state exists.
-- Nothing else (shift, hustles, orders, holdings, cash after deduction) is touched.
function L.buyDevice(state, tier, now)
	if not state.character then return fail("no-character") end
	if not isInt(tier) or not C.DEVICES[tier] then return fail("bad-request") end
	if tier <= state.device then return fail("max") end
	local g = L.deviceGate(state, tier, now)
	if not g.ok then
		for _, r in ipairs(g.reasons) do
			if r.code == "cash" then return fail("not-enough-cash") end
		end
		return fail("locked")
	end
	state.cash -= C.DEVICES[tier].price
	state.device = tier
	table.insert(state.deviceLog, { tier = tier, t = now, price = C.DEVICES[tier].price })
	withPeak(state, now)
	return true, "device", tier
end

local function deviceDef(state) return C.DEVICES[state.device] end

-- Device-gated UI preferences (validated server-side so a client can't fake a higher tier).
function L.toggleWatch(state, id)
	if not C.ASSET_BY_ID[id] then return fail("bad-request") end
	local limit = deviceDef(state).limits.watch
	for i, v in ipairs(state.watch) do
		if v == id then table.remove(state.watch, i) return true end
	end
	if #state.watch >= limit then return fail("locked") end
	table.insert(state.watch, id)
	return true
end

function L.saveView(state, name, view)
	local limit = deviceDef(state).limits.views
	name = L.cleanName(name)
	if name == "" or type(view) ~= "table" then return fail("bad-request") end
	local tab = view.tab
	if not contains({ "overview", "work", "needs", "companies", "invest", "hustle", "compare", "board" }, tab) then return fail("bad-request") end
	local clean = { name = string.sub(name, 1, 16), tab = tab, filter = type(view.filter) == "string" and string.sub(view.filter, 1, 16) or "" }
	for i, v in ipairs(state.views) do
		if v.name == clean.name then state.views[i] = clean return true end
	end
	if #state.views >= limit then return fail("locked") end
	table.insert(state.views, clean)
	return true
end

function L.deleteView(state, index)
	if not isInt(index) or not state.views[index] then return fail("nothing") end
	table.remove(state.views, index)
	return true
end

function L.setPins(state, list)
	local limit = deviceDef(state).limits.pins
	if type(list) ~= "table" or #list > limit then return fail("locked") end
	local out, seen = {}, {}
	for _, id in ipairs(list) do
		if not contains(C.PIN_CARDS, id) or seen[id] then return fail("bad-request") end
		seen[id] = true
		table.insert(out, id)
	end
	state.pins = out
	return true
end

return L
]==])
make("ModuleScript", "Strings", econ, [==[
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
]==])
local svc = make("Script", "EconomyService", SSS, [==[
--!nonstrict
-- Wires Roblox services around ServerCore: DataStore (versioned, retried), Remotes, leaderboard.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))
local Core = require(script:WaitForChild("ServerCore"))(L, C)

local STORE, BOARD = nil, nil
do
	local ok, a, b = pcall(function()
		return DataStoreService:GetDataStore("EconomyGame_v2"), DataStoreService:GetOrderedDataStore("EconomyBest_v2")
	end)
	if ok then STORE, BOARD = a, b else warn("[Economy] DataStore unavailable (publish the place). Progress will not save.") end
end

local remotes = Instance.new("Folder")
remotes.Name = "EconomyRemotes"
remotes.Parent = ReplicatedStorage
local function remote(class, name)
	local r = Instance.new(class)
	r.Name = name
	r.Parent = remotes
	return r
end
local actionRF = remote("RemoteFunction", "Action")
local boardRF = remote("RemoteFunction", "Board")
local stateRE = remote("RemoteEvent", "State")
local noticeRE = remote("RemoteEvent", "Notice")

local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end
local function key(p) return "p_" .. p.UserId end

local sessions = {}
local saving = {}
local lastBoardWrite = {}

-- ───────── persistence ─────────
local function withRetries(fn)
	local lastErr
	for attempt = 1, 3 do
		local ok, res = pcall(fn)
		if ok then return true, res end
		lastErr = res
		task.wait(attempt)
	end
	return false, lastErr
end

local function save(player)
	local s = sessions[player]
	if not s or s.readOnly or not STORE then return true end
	if saving[player] then return false end -- the running save loop will pick up the dirty flag
	saving[player] = true
	local allOk = true
	while s.dirty do
		s.dirty = false
		local snap = Core.snapshot(s)
		local ok, err = withRetries(function()
			STORE:UpdateAsync(key(player), function() return snap end)
		end)
		if not ok then
			warn("[Economy] save failed", player.Name, err)
			s.dirty = true -- keep for the next autosave; never drop progress
			allOk = false
			break
		end
		if BOARD and (os.clock() - (lastBoardWrite[player] or -1e9)) > 300 then
			lastBoardWrite[player] = os.clock()
			pcall(function() BOARD:SetAsync(tostring(player.UserId), math.floor(math.min(snap.best, 9e15))) end)
		end
	end
	saving[player] = nil
	return allOk
end

local function push(player)
	local s = sessions[player]
	if s then stateRE:FireClient(player, s.state, nowMs(), s.readOnly) end
end

Players.PlayerAdded:Connect(function(player)
	local now = nowMs()
	local session
	if not STORE then
		session = Core.newSession(nil, now)
	else
		local ok, data = withRetries(function() return STORE:GetAsync(key(player)) end)
		if ok then
			session = Core.newSession(data, now)
		else
			-- Could not read: do NOT overwrite the real save with a blank one.
			session = Core.newSession(nil, now, { readOnly = true })
			noticeRE:FireClient(player, "load-failed")
		end
	end
	if not player.Parent then return end
	sessions[player] = session
	L.settle(session.state, now)
	push(player)
end)

Players.PlayerRemoving:Connect(function(player)
	local s = sessions[player]
	if s then
		Core.tick(s, nowMs())
		save(player)
	end
	sessions[player], saving[player], lastBoardWrite[player] = nil, nil, nil
end)

game:BindToClose(function()
	local deadline = os.clock() + 25
	for _, p in ipairs(Players:GetPlayers()) do
		task.spawn(save, p)
	end
	while os.clock() < deadline do
		local busy = false
		for _, p in ipairs(Players:GetPlayers()) do if saving[p] then busy = true end end
		if not busy then break end
		task.wait(0.2)
	end
end)

-- ───────── remotes ─────────
actionRF.OnServerInvoke = function(player, name, reqId, ...)
	local s = sessions[player]
	if not s then return false, "not-ready" end
	local ok, info, extra, extra2 = Core.invoke(s, name, reqId, nowMs(), os.clock(), ...)
	push(player)
	return ok, info, extra, extra2
end

local boardCache, boardAt = nil, 0
local nameCache = {}
boardRF.OnServerInvoke = function()
	if not BOARD then return {} end
	if boardCache and os.clock() - boardAt < 30 then return boardCache end
	local ok, pages = pcall(function() return BOARD:GetSortedAsync(false, C.BOARD_SIZE) end)
	if not ok then return boardCache or {} end
	local list = {}
	for rank, entry in ipairs(pages:GetCurrentPage()) do
		local uid = tonumber(entry.key)
		if uid and not nameCache[uid] then
			local okN, n = pcall(function() return Players:GetNameFromUserIdAsync(uid) end)
			nameCache[uid] = okN and n or ("#" .. tostring(uid))
		end
		table.insert(list, { rank = rank, name = nameCache[uid or 0] or "?", value = entry.value })
	end
	boardCache, boardAt = list, os.clock()
	return list
end

-- ───────── tick + autosave ─────────
local acc, saveAcc = 0, 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	saveAcc += dt
	if acc >= 1 then
		acc = 0
		local now = nowMs()
		for player, s in pairs(sessions) do
			Core.tick(s, now)
			push(player)
		end
	end
	if saveAcc >= 60 then
		saveAcc = 0
		for player, s in pairs(sessions) do
			if s.dirty then task.spawn(save, player) end
		end
	end
end)
]==])
make("ModuleScript", "ServerCore", svc, [==[
--!nonstrict
-- Roblox-independent server core. The service script wires DataStore / Remotes around it.
-- Guarantees: every action is validated + executed synchronously (no yields), duplicate request ids replay
-- the cached result instead of executing twice, and unknown action names are rejected.
return function(L, C)
	local Core = {}
	local SEEN_MAX = 128
	local BUCKET_MAX, BUCKET_REFILL = 12, 10 -- burst 12, 10 actions per second sustained

	function Core.newSession(raw, now, opts)
		opts = opts or {}
		local state = (raw ~= nil) and L.migrate(raw, now) or L.newState(now, 0, 0)
		return {
			state = state, seen = {}, seenOrder = {}, readOnly = opts.readOnly == true,
			dirty = false, bucket = BUCKET_MAX, bucketAt = 0,
		}
	end

	local ACTIONS = {
		createCharacter = function(st, now, input) return L.createCharacter(st, type(input) == "table" and input or {}, now) end,
		restart = function(st, now) return L.restart(st, now) end,
		buyNeed = function(st, now, id, days) return L.buyNeed(st, id, days, now) end,
		buyBoost = function(st, now, id) return L.buyBoost(st, id, now) end,
		takeJob = function(st, now, id) return L.takeJob(st, id, now) end,
		quitJob = function(st, now) return L.quitJob(st, now) end,
		startShift = function(st, now, walk) return L.startShift(st, now, math.random, walk == true) end,
		chooseShift = function(st, now, idx) return L.chooseShift(st, idx, now) end,
		rest = function(st, now) return L.rest(st, now) end,
		startVacation = function(st, now) return L.startVacation(st, now) end,
		requestPromotion = function(st, now) return L.requestPromotion(st, now, math.random) end,
		negotiateRaise = function(st, now) return L.negotiateRaise(st, now, math.random) end,
		setLead = function(st, now, on) return L.setLead(st, on == true) end,
		investEdu = function(st, now) return L.investEdu(st, now) end,
		buyCompany = function(st, now, id) return L.buyCompany(st, id, now) end,
		sellCompany = function(st, now, id) return L.sellCompany(st, id, now) end,
		upgradeCompany = function(st, now, id) return L.upgradeCompany(st, id, now) end,
		hireStaff = function(st, now, id, delta, role) return L.hireStaff(st, id, delta, role, now) end,
		buyStock = function(st, now, id, amount) return L.buyStock(st, id, amount, now) end,
		setCompanySetting = function(st, now, id, field, v) return L.setCompanySetting(st, id, field, v, now) end,
		runCampaign = function(st, now, id) return L.runCampaign(st, id, now) end,
		fundResponse = function(st, now, id) return L.fundResponse(st, id, now) end,
		signContract = function(st, now, id) return L.signContract(st, id, now) end,
		researchCompany = function(st, now, id) return L.researchCompany(st, id, now) end,
		unionDeal = function(st, now, id) return L.unionDeal(st, id, now) end,
		upgradePhase = function(st, now) return L.upgradePhase(st, now) end,
		buyAsset = function(st, now, id, amount) return L.buyAsset(st, id, amount, now) end,
		sellAsset = function(st, now, id, share) return L.sellAsset(st, id, share, now) end,
		placeOrder = function(st, now, input) return L.placeOrder(st, input, now) end,
		cancelOrder = function(st, now, id) return L.cancelOrder(st, id, now) end,
		arbitrage = function(st, now, amount) return L.arbitrage(st, amount, now) end,
		startHustle = function(st, now, id, stake) return L.startHustle(st, id, stake, now, math.random) end,
		topUpHustle = function(st, now, id, amount) return L.topUpHustle(st, id, amount, now) end,
		decideHustle = function(st, now, id, opt) return L.decideHustle(st, id, opt, now) end,
		buyDevice = function(st, now, tier) return L.buyDevice(st, tier, now) end,
		toggleWatch = function(st, now, id) return L.toggleWatch(st, id) end,
		saveView = function(st, now, name, view) return L.saveView(st, name, view) end,
		deleteView = function(st, now, idx) return L.deleteView(st, idx) end,
		setPins = function(st, now, list) return L.setPins(st, list) end,
	}
	Core.ACTIONS = ACTIONS

	local function remember(session, reqId, result)
		session.seen[reqId] = result
		table.insert(session.seenOrder, reqId)
		if #session.seenOrder > SEEN_MAX then
			local old = table.remove(session.seenOrder, 1)
			session.seen[old] = nil
		end
	end

	-- Returns ok, info, extra, extra2. `now` in ms. `clock` seconds for the rate limiter (optional).
	function Core.invoke(session, name, reqId, now, clock, ...)
		if type(name) ~= "string" or type(reqId) ~= "string" or #reqId < 8 or #reqId > 64 then return false, "bad-request" end
		local cached = session.seen[reqId]
		if cached then return cached[1], cached[2], cached[3], cached[4] end -- replay, never re-execute
		local fn = ACTIONS[name]
		if not fn then return false, "bad-request" end
		if session.readOnly then return false, "save-unavailable" end
		if clock then
			session.bucket = math.min(BUCKET_MAX, session.bucket + (clock - session.bucketAt) * BUCKET_REFILL)
			session.bucketAt = clock
			if session.bucket < 1 then return false, "rate-limit" end -- not remembered: client may retry with a new id
			session.bucket -= 1
		end
		L.settle(session.state, now)
		local ok, info, extra, extra2 = fn(session.state, now, ...)
		remember(session, reqId, { ok, info, extra, extra2 })
		if ok then session.dirty = true end
		return ok, info, extra, extra2
	end

	function Core.tick(session, now)
		if session.readOnly then return end
		L.settle(session.state, now)
		session.dirty = true
	end

	function Core.snapshot(session) return L.deepCopy(session.state) end

	return Core
end
]==])
local ui = make("LocalScript", "EconomyUI", SPS, [==[
--!nonstrict
-- Client shell: one product, four device tiers (Telefon / iPad / Laptop / PC).
-- The server owns all state. This script only renders it and sends actions with request ids.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))
local S = require(Economy:WaitForChild("Strings"))
local T = require(script:WaitForChild("Theme"))
local W = require(script:WaitForChild("Widgets"))
local Screens = require(script:WaitForChild("Screens"))

local remotes = ReplicatedStorage:WaitForChild("EconomyRemotes")
local actionRF = remotes:WaitForChild("Action")
local boardRF = remotes:WaitForChild("Board")
local stateRE = remotes:WaitForChild("State")
local noticeRE = remotes:WaitForChild("Notice")

local player = Players.LocalPlayer
local col = T.color

local gui = Instance.new("ScreenGui")
gui.Name = "EconomyGui"
gui.ResetOnSpawn = false
gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets -- respects notches and the Roblox top bar
gui.DisplayOrder = 10
gui.Parent = player:WaitForChild("PlayerGui")
W.begin(T.metrics(gui.AbsoluteSize, UserInputService.TouchEnabled), 320)
W.attach(gui)

local state, readOnly = nil, false
local ui = {
	tab = "home", filter = {}, company = nil, orderAsset = nil, cmpKind = "jobs", cmpSel = {}, panelTab = nil,
	previewTier = nil, board = nil, pinEdit = false, pick = { country = "cz", city = "town", era = "2025", family = "middle", name = player.DisplayName },
}
local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end

-- ───────── actions: request ids, retry on transport failure, outcome animations ─────────
local inflight = false
local refs = {} -- live references for header animation
local render, rebuildShell

local function act(name, ...)
	if inflight then return false end
	inflight = true
	local reqId = HttpService:GenerateGUID(false)
	local args = table.pack(...)
	local before = state and state.cash or 0
	local ok, info, extra, extra2
	for attempt = 1, 3 do
		local success, a, b, c, d = pcall(function() return actionRF:InvokeServer(name, reqId, table.unpack(args, 1, args.n)) end)
		if success then ok, info, extra, extra2 = a, b, c, d break end
		task.wait(0.5 * attempt) -- same reqId: the server replays, never double-charges
	end
	inflight = false
	if ok == nil then W.toast(S.err["save-unavailable"], "bad") return false end
	if ok then
		local msg = S.evt[info]
		if msg then W.toast(S.f(msg, { n = extra and W.fmt(extra) or "" }), (info == "fired" or info == "lost" or info == "warned" or info == "sick") and "bad" or "good") end
		if info == "device" then W.deviceFlash(S.f(S.deviceUi.unlocked, { name = S.devices[C.DEVICES[extra].id].name })) end
		task.delay(0.15, function()
			if not state or not refs.cash then return end
			local delta = state.cash - before
			if info == "shift-done" and extra then
				W.floatText(refs.cash, "+" .. W.fmt(extra), col.teal); W.pulse(refs.cash, col.teal)
			elseif delta < -1 then
				W.floatText(refs.cash, "−" .. W.fmt(-delta), col.red); W.pulse(refs.cash, col.red)
				if info == "lost" then W.shake(refs.cash) end
			elseif delta > 1 then
				W.floatText(refs.cash, "+" .. W.fmt(delta), col.teal); W.pulse(refs.cash, col.teal)
			end
		end)
	else
		W.toast(S.err[info] or tostring(info), "bad")
	end
	render()
	return ok
end

local function go(tab)
	ui.tab = tab
	ui.panelTab = nil
	render()
	if tab == "board" then
		task.spawn(function()
			local ok, list = pcall(function() return boardRF:InvokeServer() end)
			if ok then ui.board = list; render() end
		end)
	end
end

-- ───────── creation screen ─────────
local function createScreen(ctx, parent)
	local card = W.card(parent, { title = S.create.title, accent = col.magenta })
	W.note(card, S.create.hint)
	local nameRow = W.new("Frame", { Size = UDim2.new(1, 0, 0, 40), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = W.nextOrder(card) }, card)
	W.corner(nameRow)
	W.label(nameRow, { text = S.create.name, pos = UDim2.fromOffset(10, 0), size = UDim2.fromOffset(80, 40), color = col.muted })
	local box = W.new("TextBox", { Size = UDim2.new(1, -110, 0, 30), Position = UDim2.fromOffset(98, 5), BackgroundColor3 = col.ink, TextColor3 = col.text, Text = ui.pick.name, ClearTextOnFocus = false, Font = T.font.bold, TextSize = 15, PlaceholderText = S.create.name, TextXAlignment = Enum.TextXAlignment.Left }, nameRow)
	W.corner(box, 4)
	W.stroke(box, col.line, 1, 0.4)
	box.FocusLost:Connect(function() ui.pick.name = box.Text end)
	local function chooser(label, key, list, names)
		W.note(card, label, col.line)
		local opts = {}
		for _, v in ipairs(list) do table.insert(opts, { id = v, text = names[v] }) end
		W.segmented(card, opts, ui.pick[key], function(id) ui.pick.name = box.Text; ui.pick[key] = id; render() end)
	end
	chooser(S.create.country, "country", C.COUNTRIES, S.countries)
	chooser(S.create.city, "city", C.CITIES, S.cities)
	chooser(S.create.era, "era", C.ERAS, S.eras)
	chooser(S.create.family, "family", C.FAMILIES, S.families)
	local startMoney = math.round(C.FAMILY_DEF[ui.pick.family].start * C.ERA_DEF[ui.pick.era].start)
	W.row(card, { title = S.f(S.create.startMoney, { n = W.fmt(startMoney) }), cw = ctx.cw, actions = { { text = S.create.start, variant = "good", w = 150, onClick = function()
		act("createCharacter", { name = box.Text, country = ui.pick.country, city = ui.pick.city, era = ui.pick.era, family = ui.pick.family })
	end } } })
end

-- Phone bottom bar has five slots; everything else (including Srovnání / Historie of a laptop or PC) lives here.
local FIVE = { home = true, work = true, needs = true, companies = true, invest = true }
local function moreScreen(ctx, parent)
	local card = W.card(parent, { title = S.nav.more })
	for _, id in ipairs(ctx.navItems) do
		if not FIVE[id] then
			W.row(card, { title = S.nav[id], cw = ctx.cw, actions = { { text = S.nav[id], variant = "primary", onClick = function() go(id) end } } })
		end
	end
end

-- ───────── shell (rebuilt only when layout-relevant inputs change) ─────────
local shell, mainScroll, sideScroll, barsFrame, signature
local layout = {}

local function tierNow() return ui.previewTier or (state and state.device) or 1 end

local function navItems(tier)
	local list = { "home", "work", "needs", "companies", "invest", "hustle", "board", "device" }
	if tier >= 3 then table.insert(list, 6, "compare") end
	if tier >= 4 then table.insert(list, 7, "history") end
	return list
end

local function newScroll(parent, size, pos, pad)
	local sf = W.new("ScrollingFrame", { Size = size, Position = pos, BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 6, ScrollBarImageColor3 = col.lineDim, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y, ScrollingDirection = Enum.ScrollingDirection.Y }, parent)
	W.new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }, sf)
	W.pad(sf, pad, pad, pad, pad + 4)
	return sf
end

local function barcode(parent, seed, h)
	local f = W.new("Frame", { Size = UDim2.new(0, 70, 0, h), BackgroundTransparency = 1 }, parent)
	local x = 0
	local i = 0
	while x < 66 do
		i += 1
		local w = 1 + math.floor(L.hash32("bc:" .. seed .. ":" .. i) * 3)
		if i % 2 == 1 then W.new("Frame", { Size = UDim2.fromOffset(w, h), Position = UDim2.fromOffset(x, 0), BackgroundColor3 = col.creamInk, BorderSizePixel = 0 }, f) end
		x += w + 1
	end
	return f
end

function rebuildShell()
	if shell then shell:Destroy() end
	refs = {}
	local vp = gui.AbsoluteSize
	local m = T.metrics(vp, UserInputService.TouchEnabled)
	local tier = tierNow()
	local feat = C.DEVICES[tier].features
	local hasChar = state and state.character ~= nil
	layout = { m = m, tier = tier, feat = feat }

	shell = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = col.ink, BorderSizePixel = 0 }, gui)
	W.new("UIGradient", { Rotation = 70, Color = ColorSequence.new(col.ink2, col.ink) }, shell)
	W.begin(m, 320)

	local g = m.gutter
	-- top bar: logo, tab strip with underline on the active tab, player badge (opens the device shop)
	local topbar = W.new("Frame", { Size = UDim2.new(1, 0, 0, m.topH), BackgroundTransparency = 1 }, shell)
	local logo = W.new("TextLabel", { Size = UDim2.fromOffset(200, m.topH), Position = UDim2.fromOffset(g, 0), BackgroundTransparency = 1, RichText = true, Text = '<font color="#FF2D78">▶  EKONO</font>MIKA', Font = T.font.display, TextSize = (m.class == "compact") and 17 or 22, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left }, topbar)
	local avatarW = (m.class == "compact") and 120 or 200
	local badge = W.new("TextButton", { Size = UDim2.fromOffset(avatarW, m.topH - 8), Position = UDim2.new(1, -g - avatarW, 0, 4), BackgroundTransparency = 1, Text = "", AutoButtonColor = false }, topbar)
	local av = W.avatar(badge, player.DisplayName, col.blueDark, 32)
	av.Position = UDim2.new(1, -32, 0.5, -16)
	W.stroke(av, col.line, 2)
	local nameL = W.label(badge, { text = player.DisplayName, size = UDim2.new(1, -40, 0, 18), pos = UDim2.fromOffset(0, 6), align = Enum.TextXAlignment.Right, font = T.font.caps, ts = 12, wrap = false })
	W.label(badge, { text = "● " .. S.hero.online .. " · " .. W.upper(S.devices[C.DEVICES[tier].id].name), size = UDim2.new(1, -40, 0, 14), pos = UDim2.fromOffset(0, m.topH - 28), align = Enum.TextXAlignment.Right, font = T.font.caps, ts = 10, color = col.teal, wrap = false })
	badge.Activated:Connect(function() go("device") end)
	refs.info = nameL
	if RunService:IsStudio() and hasChar then
		for i = 1, #C.DEVICES do
			local b = W.new("TextButton", { Size = UDim2.fromOffset(24, 22), Position = UDim2.new(1, -g - avatarW - 8 - (#C.DEVICES - i + 1) * 28, 0.5, -11), BackgroundColor3 = (ui.previewTier == i) and col.magenta or col.panel3, Text = tostring(i), Font = T.font.bold, TextSize = 12, TextColor3 = col.text }, topbar)
			W.corner(b, 11)
			b.Activated:Connect(function() ui.previewTier = (ui.previewTier ~= i) and i or nil; render() end)
		end
	end
	local items = hasChar and navItems(tier) or {}
	layout.items = items
	local bottomNav = (m.class == "compact")
	if hasChar and not bottomNav then
		local tabsX = g + 210
		local strip = W.new("ScrollingFrame", { Size = UDim2.new(1, -tabsX - avatarW - g - 8 - (RunService:IsStudio() and 124 or 0), 0, m.topH), Position = UDim2.fromOffset(tabsX, 0), BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 0, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X, ScrollingDirection = Enum.ScrollingDirection.X }, topbar)
		W.new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder, VerticalAlignment = Enum.VerticalAlignment.Center }, strip)
		for i, id in ipairs(items) do
			local active = ui.tab == id
			local label = W.upper(S.nav[id])
			local b = W.new("TextButton", { Size = UDim2.fromOffset(math.max(64, 22 + #S.nav[id] * 9), m.topH - 12), BackgroundTransparency = 1, Text = label, Font = T.font.caps, TextSize = 13, TextColor3 = active and col.teal or col.text, AutoButtonColor = false, LayoutOrder = i }, strip)
			if active then W.new("Frame", { Size = UDim2.new(1, -16, 0, 2), Position = UDim2.new(0, 8, 1, -4), BackgroundColor3 = col.teal, BorderSizePixel = 0 }, b) end
			b.Activated:Connect(function() go(id) end)
		end
	end

	-- stats strip: three clearly different numbers
	local tw = math.floor((vp.X - 2 * g - 2 * 8) / 3)
	local statsY = m.topH + 2
	local statH = m.statsH - 8
	local function tile(i, label, color, name)
		local f, v = W.stat(shell, { label = label, value = "…", color = color, size = UDim2.fromOffset(tw, statH), order = i, ts = (m.class == "compact") and 17 or 22 })
		f.Position = UDim2.fromOffset(g + (i - 1) * (tw + 8), statsY)
		f.Name = name
		return f, v
	end
	refs.cash, refs.cashV = tile(1, S.ui.cash, col.teal, "CashTile")
	refs.worth, refs.worthV = tile(2, S.ui.netWorth, col.line, "WorthTile")
	refs.income, refs.incomeV = tile(3, S.ui.income, col.amber, "IncomeTile")

	local top = m.headerH
	local leftW = 0
	local bottomH = (bottomNav and hasChar) and m.navH or 0

	-- bottom navigation (phone): rounded pills, active in hot pink
	if hasChar and bottomNav then
		local nav = W.new("Frame", { Size = UDim2.new(1, 0, 0, bottomH), Position = UDim2.new(0, 0, 1, -bottomH), BackgroundColor3 = col.panel, BorderSizePixel = 0, ZIndex = 5 }, shell)
		W.stroke(nav, col.lineDim, 1)
		local five = { "home", "work", "needs", "companies", "invest", "more" }
		local bw = 1 / #five
		for i, id in ipairs(five) do
			local active = (ui.tab == id) or (id == "more" and not FIVE[ui.tab])
			local b = W.new("TextButton", { Size = UDim2.new(bw, -4, 1, -10), Position = UDim2.new(bw * (i - 1), 2, 0, 5), BackgroundColor3 = active and col.magenta or col.panel2, Text = S.navShort[id] .. "\n" .. S.nav[id], Font = T.font.caps, TextSize = 11, TextColor3 = col.text, AutoButtonColor = true, ZIndex = 6, TextWrapped = true }, nav)
			W.new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, b)
			b.Activated:Connect(function() go(id) end)
		end
	end

	-- content region
	local areaX, areaY = leftW, top
	local areaW, areaH = vp.X - leftW, vp.Y - top - bottomH
	local sideVisible = hasChar and tier >= 2 and areaW >= 900
	local sideW = sideVisible and math.min(360, math.floor(areaW * 0.36)) or 0
	local barsH = 0
	layout.areaW, layout.sideVisible, layout.sideW = areaW, sideVisible, sideW
	local mainW = areaW - sideW
	local pad = g
	layout.cw = mainW - 2 * pad - 8

	-- toolbar (laptop+): quick actions + saved views in one horizontally scrolling row above the main column
	barsFrame = nil
	if hasChar and (feat.quickActions or feat.savedViews) then
		barsH = m.btnH + 14
		barsFrame = W.new("ScrollingFrame", { Size = UDim2.fromOffset(mainW, barsH), Position = UDim2.fromOffset(areaX, areaY), BackgroundColor3 = col.ink2, BorderSizePixel = 0, ScrollBarThickness = 3, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X, ScrollingDirection = Enum.ScrollingDirection.X }, shell)
		W.stroke(barsFrame, col.lineDim, 1)
		W.new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder, VerticalAlignment = Enum.VerticalAlignment.Center }, barsFrame)
		W.pad(barsFrame, pad, 4, pad, 4)
	end
	mainScroll = newScroll(shell, UDim2.fromOffset(mainW, areaH - barsH), UDim2.fromOffset(areaX, areaY + barsH), pad)
	sideScroll = nil
	if sideVisible then
		sideScroll = newScroll(shell, UDim2.fromOffset(sideW, areaH), UDim2.fromOffset(areaX + mainW, areaY), 8)
		W.stroke(sideScroll, col.lineDim, 1)
	end
	W.m = m
end

local function context(parent)
	return {
		state = state, now = nowMs(), L = L, C = C, S = S, W = W, T = T, act = act, ui = ui, m = layout.m, cw = layout.cw or 320,
		sideW = layout.sideW, feat = layout.feat, tier = layout.tier, navItems = layout.items or {}, go = go, rerender = function() render() end, parent = parent,
	}
end

local function clear(sf)
	for _, c in ipairs(sf:GetChildren()) do
		if not c:IsA("UIListLayout") and not c:IsA("UIPadding") then c:Destroy() end
	end
	sf:SetAttribute("_n", 0)
end

local function panelsFor(tier)
	if tier >= 4 then return { "alerts", "pinned", "watch", "upcoming", "projects" } end
	return { "watch", "upcoming", "projects" }
end

local pressed = false
local pending = false
local function fill()
	if not state or not mainScroll then return end
	local m, tier = layout.m, layout.tier
	local posMain = mainScroll.CanvasPosition
	local posSide = sideScroll and sideScroll.CanvasPosition
	clear(mainScroll)
	if sideScroll then clear(sideScroll) end
	if barsFrame then clear(barsFrame) end
	local cw = layout.cw
	W.begin(m, cw)
	if readOnly then W.note(W.card(mainScroll, { title = S.ui.title, accent = col.red }), S.ui.saveFailed, col.red) end
	if ui.previewTier and ui.previewTier ~= state.device then W.note(W.card(mainScroll, { title = S.ui.studioPreview, accent = col.amber }), S.ui.preview .. " " .. S.devices[C.DEVICES[ui.previewTier].id].name, col.amber) end

	if not state.character then
		createScreen(context(mainScroll), mainScroll)
		return
	end
	local feat = layout.feat
	if barsFrame then
		W.begin(m, layout.cw)
		Screens.toolbar(context(barsFrame), barsFrame)
	end
	W.begin(m, cw)

	-- narrow tablets/laptops/PCs: side panels become a tab strip above the main screen
	local showPanel = nil
	if tier >= 2 and not layout.sideVisible then
		local opts = { { id = "", text = S.ui.main } }
		for _, p in ipairs(panelsFor(tier)) do table.insert(opts, { id = p, text = S.panel[p] or p }) end
		local strip = W.card(mainScroll, {})
		W.segmented(strip, opts, ui.panelTab or "", function(id) ui.panelTab = (id ~= "") and id or nil; render() end)
		showPanel = ui.panelTab
	end

	local ctx = context(mainScroll)
	if showPanel then
		Screens.panel[showPanel](ctx, mainScroll)
	else
		local tab = ui.tab
		if tab == "more" then moreScreen(ctx, mainScroll)
		elseif tab == "compare" and tier < 3 then W.reason(W.card(mainScroll, { title = S.nav.compare }), S.devices.laptop.name) 
		elseif tab == "history" and tier < 4 then W.reason(W.card(mainScroll, { title = S.nav.history }), S.devices.pc.name)
		elseif Screens[tab] then Screens[tab](ctx, mainScroll) end
	end
	if sideScroll then
		local sctx = context(sideScroll)
		sctx.cw = layout.sideW - 20
		W.begin(m, sctx.cw)
		for _, p in ipairs(panelsFor(tier)) do Screens.panel[p](sctx, sideScroll) end
	end
	task.defer(function()
		if mainScroll then mainScroll.CanvasPosition = posMain end
		if sideScroll and posSide then sideScroll.CanvasPosition = posSide end
	end)
end

function render()
	if not state then return end
	local sig = table.concat({ tostring(gui.AbsoluteSize.X), tostring(gui.AbsoluteSize.Y), tostring(tierNow()), state.character and "c" or "n", ui.tab, tostring(ui.previewTier) }, "|")
	if sig ~= signature or not shell then
		signature = sig
		rebuildShell()
	end
	if UserInputService:GetFocusedTextBox() then return end -- never destroy a box while typing
	if pressed then pending = true return end -- never destroy a button mid-press (would eat the click)
	fill()
end

UserInputService.InputBegan:Connect(function(i)
	if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then pressed = true end
end)
UserInputService.InputEnded:Connect(function(i)
	if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
		pressed = false
		if pending then pending = false; task.delay(0.12, function() if not pressed then render() end end) end
	end
end)

gui:GetPropertyChangedSignal("AbsoluteSize"):Connect(function() signature = nil; render() end)

-- ───────── server events ─────────
stateRE.OnClientEvent:Connect(function(st, serverNow, ro)
	state, readOnly = st, ro == true
	render()
end)
noticeRE.OnClientEvent:Connect(function(kind)
	if kind == "load-failed" and shell then W.modal(S.ui.title, S.ui.saveFailed, { { text = "OK", variant = "primary" } }) end
end)

-- header values update continuously; cash is projected between pushes with the same shared rates (server stays authoritative)
local acc = 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	if acc < 0.1 or not state or not refs.cashV then return end
	acc = 0
	if not state.character then
		refs.cashV.Text = "—"; refs.worthV.Text = "—"; refs.incomeV.Text = "—"
		refs.info.Text = W.upper(S.create.title)
		return
	end
	local now = nowMs()
	local r = L.rates(state, now)
	local dtH = math.clamp(now - state.lastSeen, 0, C.MAX_OFFLINE_MIN * 60000) / C.H
	local cash = state.cash + r.net * dtH
	refs.cashV.Text = W.fmt(cash)
	refs.cashV.TextColor3 = (cash < 0) and col.red or col.teal
	refs.worthV.Text = W.fmt(L.netWorth(state, now))
	refs.incomeV.Text = W.fmt(r.net)
	refs.incomeV.TextColor3 = (r.net >= 0) and col.amber or col.red
	local ch = state.character
	refs.info.Text = (layout.m and layout.m.class == "compact") and W.upper(ch.name) or (W.upper(ch.name) .. " · " .. S.countries[ch.country])
end)
]==])
make("ModuleScript", "Theme", ui, [==[
--!nonstrict
-- One visual system for all four device tiers ("NexusPlay"-style neon dashboard):
-- violet-to-black gradient base, hot-pink glow for featured cards, mint pill CTA, lavender outlined side panel,
-- slab-serif display type with monospaced captions, thin mint progress lines on gradient tiles.
local T = {}

local function hex(h) return Color3.fromHex(h) end
T.color = {
	ink = hex("0A0414"), ink2 = hex("240A3A"), panel = hex("150A2B"), panel2 = hex("21103F"), panel3 = hex("301857"),
	line = hex("8E9BFF"), lineDim = hex("4A3A86"), blue = hex("5B6CFF"), blueDark = hex("3A2A8C"),
	magenta = hex("FF2D78"), red = hex("FF4D6D"), teal = hex("19F5A0"), amber = hex("FFC93C"),
	cream = hex("F4EEFF"), creamInk = hex("12061F"), text = hex("F4EEFF"), muted = hex("A094C7"), disabled = hex("3A2F5E"),
	tileA = hex("B0185F"), tileB = hex("1D5FB8"), tileC = hex("B5560E"), tileD = hex("7A1FA8"), tileE = hex("0F8F82"), tileF = hex("3A2FB5"),
}
T.font = {
	display = Enum.Font.GothamBlack, head = Enum.Font.GothamBold, caps = Enum.Font.Code,
	body = Enum.Font.BuilderSansMedium, bold = Enum.Font.BuilderSansBold, mono = Enum.Font.RobotoMono,
}
T.size = { caption = 12, body = 14, label = 16, title = 22, display = 30 }
T.space = { xs = 4, sm = 8, md = 12, lg = 16 }
T.radius = 12

-- Width classes: compact < 620, medium < 1020, wide >= 1020 (viewport pixels).
function T.metrics(viewport, touch)
	local w = viewport.X
	local class = (w < 620) and "compact" or ((w < 1020) and "medium" or "wide")
	return {
		class = class, w = w, h = viewport.Y, touch = touch,
		btnH = touch and 44 or 34, gutter = (class == "compact") and 8 or 16,
		topH = (class == "compact") and 46 or 54, statsH = (class == "compact") and 62 or 70,
		headerH = ((class == "compact") and 46 or 54) + ((class == "compact") and 62 or 70), navH = 60,
	}
end

return T
]==])
make("ModuleScript", "Widgets", ui, [==[
--!nonstrict
local TweenService = game:GetService("TweenService")
local T = require(script.Parent.Theme)
local W = {}
local col = T.color

function W.new(class, props, parent)
	local o = Instance.new(class)
	for k, v in pairs(props or {}) do o[k] = v end
	if parent then o.Parent = parent end
	return o
end
local new = W.new

function W.tween(o, props, t, style, dir)
	local tw = TweenService:Create(o, TweenInfo.new(t or 0.15, style or Enum.EasingStyle.Quad, dir or Enum.EasingDirection.Out), props)
	tw:Play()
	return tw
end

function W.corner(o, r) return new("UICorner", { CornerRadius = UDim.new(0, r or T.radius) }, o) end
function W.stroke(o, color, th, tr)
	return new("UIStroke", { Color = color or col.line, Thickness = th or 1, Transparency = tr or 0, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, o)
end
function W.pad(o, l, t, r, b)
	return new("UIPadding", { PaddingLeft = UDim.new(0, l), PaddingTop = UDim.new(0, t or l), PaddingRight = UDim.new(0, r or l), PaddingBottom = UDim.new(0, b or t or l) }, o)
end
local function nextOrder(parent)
	local n = (parent:GetAttribute("_n") or 0) + 1
	parent:SetAttribute("_n", n)
	return n
end
W.nextOrder = nextOrder

function W.begin(m, cw) W.m, W.cw = m, cw end

-- ───────── formatting ─────────
local NB = "\u{00A0}"
function W.fmt(n)
	if n ~= n then return "0" end
	local neg = n < 0
	local a = math.abs(n)
	local s
	if a >= 1e12 then s = string.format("%.2f", a / 1e12):gsub("%.", ",") .. NB .. "bil."
	elseif a >= 1e9 then s = string.format("%.2f", a / 1e9):gsub("%.", ",") .. NB .. "mld."
	elseif a >= 1e6 then s = string.format("%.2f", a / 1e6):gsub("%.", ",") .. NB .. "mil."
	else
		local i = tostring(math.floor(a + 0.5))
		local out, n = {}, #i
		for k = 1, n do
			table.insert(out, i:sub(k, k))
			if (n - k) % 3 == 0 and k < n then table.insert(out, NB) end
		end
		s = table.concat(out)
	end
	return (neg and "−" or "") .. s
end
function W.dec(n, d) return (string.format("%." .. (d or 2) .. "f", n):gsub("%.", ",")) end
function W.dur(ms)
	ms = math.max(0, ms)
	local s = ms / 1000
	if s < 90 then return math.ceil(s) .. NB .. "s" end
	local m = s / 60
	if m < 90 then return math.ceil(m) .. NB .. "min" end
	local h = m / 60
	if h < 48 then return string.format("%.1f", h):gsub("%.", ",") .. NB .. "h" end
	return string.format("%.1f", h / 24):gsub("%.", ",") .. NB .. "d"
end

-- ───────── text ─────────
-- string.upper only handles ASCII, so Czech diacritics need an explicit map.
local UP = { ["á"] = "Á", ["č"] = "Č", ["ď"] = "Ď", ["é"] = "É", ["ě"] = "Ě", ["í"] = "Í", ["ň"] = "Ň", ["ó"] = "Ó", ["ř"] = "Ř", ["š"] = "Š", ["ť"] = "Ť", ["ú"] = "Ú", ["ů"] = "Ů", ["ý"] = "Ý", ["ž"] = "Ž", ["ä"] = "Ä", ["ö"] = "Ö", ["ü"] = "Ü", ["ĺ"] = "Ĺ", ["ľ"] = "Ľ", ["ô"] = "Ô" }
function W.upper(str)
	str = string.upper(str)
	for lo, hi in pairs(UP) do str = str:gsub(lo, hi) end
	return str
end

function W.label(parent, o)
	return new("TextLabel", {
		Size = o.size or UDim2.new(1, 0, 0, o.h or 20), Position = o.pos or UDim2.new(), BackgroundTransparency = 1, Text = o.text or "",
		TextColor3 = o.color or col.text, Font = o.font or T.font.body, TextSize = o.ts or T.size.body,
		TextXAlignment = o.align or Enum.TextXAlignment.Left, TextYAlignment = o.valign or Enum.TextYAlignment.Center,
		TextWrapped = o.wrap ~= false, TextTruncate = o.truncate or Enum.TextTruncate.None, LayoutOrder = o.order or 0,
		AnchorPoint = o.anchor or Vector2.new(), RichText = o.rich == true, AutomaticSize = o.auto or Enum.AutomaticSize.None,
	}, parent)
end

-- ───────── toast ─────────
function W.attach(gui)
	W.gui = gui
	W.toastFrame = new("Frame", { Size = UDim2.new(0, 360, 0, 40), Position = UDim2.new(0.5, 0, 1, -76), AnchorPoint = Vector2.new(0.5, 1), BackgroundColor3 = col.panel2, Visible = false, ZIndex = 200, BorderSizePixel = 0 }, gui)
	W.corner(W.toastFrame)
	W.toastStroke = W.stroke(W.toastFrame, col.line, 1.5)
	W.toastLabel = new("TextLabel", { Size = UDim2.new(1, -16, 1, 0), Position = UDim2.fromOffset(8, 0), BackgroundTransparency = 1, Font = T.font.bold, TextSize = T.size.body, TextColor3 = col.text, TextWrapped = true, ZIndex = 201, Text = "" }, W.toastFrame)
	W.toastId = 0
end
function W.toast(text, kind)
	if not W.toastFrame then return end
	W.toastId += 1
	local id = W.toastId
	local color = (kind == "bad") and col.red or ((kind == "warn") and col.amber or col.teal)
	W.toastLabel.Text = text
	W.toastStroke.Color = color
	W.toastFrame.Size = UDim2.new(0, math.min(W.m and W.m.w - 24 or 360, 420), 0, 44)
	W.toastFrame.Visible = true
	W.toastFrame.BackgroundTransparency = 1
	W.tween(W.toastFrame, { BackgroundTransparency = 0 }, 0.12)
	task.delay(3.2, function()
		if W.toastId == id and W.toastFrame then W.toastFrame.Visible = false end
	end)
end

-- ───────── cards, rows, stats ─────────
function W.card(parent, o)
	o = o or {}
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundColor3 = o.bg or col.panel, BorderSizePixel = 0, LayoutOrder = nextOrder(parent) }, parent)
	W.corner(f, 14)
	new("UIGradient", { Rotation = 120, Color = ColorSequence.new(col.panel2, col.panel) }, f)
	W.stroke(f, o.accent or col.lineDim, o.accent and 1.5 or 1, o.accent and 0.15 or 0.2)
	W.pad(f, 12, 12, 12, 12)
	new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	if o.title then
		local h = new("Frame", { Size = UDim2.new(1, 0, 0, 22), BackgroundTransparency = 1, LayoutOrder = 0 }, f)
		new("Frame", { Size = UDim2.fromOffset(4, 16), Position = UDim2.fromOffset(0, 3), BackgroundColor3 = o.accent or col.magenta, BorderSizePixel = 0 }, h)
		new("TextLabel", { Size = UDim2.new(0.62, -12, 1, 0), Position = UDim2.fromOffset(12, 0), BackgroundTransparency = 1, Text = W.upper(o.title), Font = T.font.caps, TextSize = 14, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, TextTruncate = Enum.TextTruncate.AtEnd }, h)
		if o.right then
			W.label(h, { text = o.right, size = UDim2.new(0.38, 0, 1, 0), pos = UDim2.new(0.62, 0, 0, 0), align = Enum.TextXAlignment.Right, color = col.muted, ts = T.size.caption, wrap = false, font = T.font.caps })
		end
	end
	return f
end

function W.stat(parent, o)
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, 62), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 12)
	new("UIGradient", { Rotation = 90, Color = ColorSequence.new(col.panel3, col.panel2) }, f)
	W.stroke(f, o.color or col.line, 1.2, 0.35)
	W.label(f, { text = W.upper(o.label), pos = UDim2.fromOffset(10, 4), size = UDim2.new(1, -14, 0, 14), ts = 10, color = col.muted, font = T.font.caps, wrap = false })
	local v = W.label(f, { text = o.value, pos = UDim2.fromOffset(10, 18), size = UDim2.new(1, -14, 0, 26), ts = o.ts or T.size.title, color = o.color or col.text, font = T.font.mono, wrap = false })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(10, 44), size = UDim2.new(1, -14, 0, 14), ts = 11, color = col.muted, wrap = false }) end
	f.Name = o.name or "Stat"
	return f, v
end

-- Buttons: pill shaped. primary/good = mint CTA with dark text ("PLAY NOW"), ghost = outline pill,
-- danger/select = hot pink. `reason` makes it look locked and shows why on tap.
local VARIANT = {
	primary = { fill = col.teal, fillT = 0, edge = col.teal, text = col.creamInk },
	good = { fill = col.teal, fillT = 0, edge = col.teal, text = col.creamInk },
	danger = { fill = col.red, fillT = 0, edge = col.red, text = Color3.new(1, 1, 1) },
	ghost = { fill = col.panel3, fillT = 0.55, edge = col.cream, text = col.text },
	select = { fill = col.magenta, fillT = 0, edge = Color3.fromHex("FF8CB8"), text = Color3.new(1, 1, 1) },
	disabled = { fill = col.disabled, fillT = 0.3, edge = col.lineDim, text = col.muted },
}
function W.button(parent, o)
	local v = VARIANT[o.reason and "disabled" or (o.variant or "primary")]
	local h = o.h or (W.m and W.m.btnH or 34)
	local b = new("TextButton", {
		Size = o.size or UDim2.fromOffset(o.w or 96, h), Position = o.pos or UDim2.new(), AnchorPoint = o.anchor or Vector2.new(),
		BackgroundColor3 = v.fill, BackgroundTransparency = v.fillT, Text = o.text, TextColor3 = v.text, Font = T.font.bold, TextSize = o.ts or 13, TextWrapped = true,
		AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or 0,
	}, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, b)
	local st = W.stroke(b, v.edge, (v.fillT > 0) and 1.5 or 0, 0)
	local sc = new("UIScale", { Scale = 1 }, b)
	b.MouseEnter:Connect(function() if not W.m.touch then W.tween(sc, { Scale = 1.04 }, 0.08) end end)
	b.MouseLeave:Connect(function() W.tween(sc, { Scale = 1 }, 0.08) end)
	b.MouseButton1Down:Connect(function() W.tween(sc, { Scale = 0.95 }, 0.06) end)
	b.MouseButton1Up:Connect(function() W.tween(sc, { Scale = 1 }, 0.1) end)
	b.Activated:Connect(function()
		if o.reason then W.toast(o.reason, "warn") return end
		if o.onClick then o.onClick(b) end
	end)
	return b
end

-- Item row: left = title/sub, right = action buttons. Stacks buttons under the text when space is short.
function W.row(parent, o)
	local m = W.m
	local cw = (o.cw or W.cw or 320) - 20
	local actions = o.actions or {}
	local aw, gap = 0, 6
	for _, a in ipairs(actions) do a.w = a.w or math.max(72, 14 + #a.text * 7); aw += a.w + gap end
	local stacked = (#actions > 0) and (cw - aw < 170 or m.class == "compact")
	local textH = (o.sub and 50 or 28) + (o.extra and 18 or 0)
	local height = textH + 8 + ((stacked and #actions > 0) and (m.btnH + 6) or 0)
	height = math.max(height, (not stacked and #actions > 0) and (m.btnH + 12) or 0)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, height), BackgroundColor3 = o.selected and col.panel3 or col.ink, BackgroundTransparency = o.selected and 0 or 0.35, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 12)
	if o.selected then
		W.stroke(f, col.magenta, 2)
		new("Frame", { Size = UDim2.new(0, 4, 1, -8), Position = UDim2.fromOffset(2, 4), BackgroundColor3 = col.magenta, BorderSizePixel = 0 }, f)
	elseif o.alert then
		W.stroke(f, col.red, 1.5)
	end
	local tw = stacked and (cw) or (cw - aw)
	W.label(f, { text = o.title, pos = UDim2.fromOffset(12, 4), size = UDim2.new(0, tw, 0, 20), font = T.font.bold, ts = T.size.label, color = o.titleColor or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(12, 24), size = UDim2.new(0, tw, 0, 30), ts = 12, color = col.muted, valign = Enum.TextYAlignment.Top }) end
	if o.extra then W.label(f, { text = o.extra, pos = UDim2.fromOffset(12, 50), size = UDim2.new(0, tw, 0, 16), ts = 12, color = o.extraColor or col.amber, wrap = false }) end
	local x = stacked and 12 or (cw + 10 - aw + gap)
	for _, a in ipairs(actions) do
		local y = stacked and (textH + 4) or math.floor((height - m.btnH) / 2)
		a.pos = UDim2.fromOffset(x, y)
		W.button(f, a)
		x += a.w + gap
	end
	return f
end

function W.reason(parent, text, color)
	return W.label(parent, { text = "⛔ " .. text, color = color or col.amber, ts = 12, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end
function W.note(parent, text, color)
	return W.label(parent, { text = text, color = color or col.muted, ts = 12, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end

-- Thin mint progress line (tiles and meters)
function W.progress(parent, frac, color, h, order)
	frac = math.clamp(frac or 0, 0, 1)
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, math.min(h or 6, 8)), BackgroundColor3 = col.ink, BackgroundTransparency = 0.3, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent) }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, bar)
	local fill = new("Frame", { Size = UDim2.new(frac, 0, 1, 0), BackgroundColor3 = color or col.teal, BorderSizePixel = 0 }, bar)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, fill)
	return bar
end

-- Avatar circle with a status dot (side-panel rows)
function W.avatar(parent, letter, color, size, dot)
	local a = new("TextLabel", { Size = UDim2.fromOffset(size or 34, size or 34), BackgroundColor3 = color or col.magenta, Text = string.sub(letter, 1, 1), Font = T.font.bold, TextSize = 16, TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, a)
	if dot then
		local d = new("Frame", { Size = UDim2.fromOffset(9, 9), Position = UDim2.new(1, -9, 1, -9), BackgroundColor3 = dot, BorderSizePixel = 0 }, a)
		new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, d)
		W.stroke(d, col.panel, 1.5)
	end
	return a
end

-- Featured hero card with a pink glow, price tag, mint CTA pill and an outline pill.
function W.hero(parent, o)
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, o.h or 210), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 18)
	new("UIGradient", { Rotation = 25, Color = ColorSequence.new(Color3.fromHex("3A0B5E"), Color3.fromHex("14052B")) }, f)
	W.stroke(f, col.magenta, 3, 0.1)
	W.stroke(f, col.magenta, 1, 0) -- glow edge + crisp edge
	W.label(f, { text = W.upper(o.kicker or ""), pos = UDim2.fromOffset(20, 14), size = UDim2.new(0.6, 0, 0, 16), ts = 11, color = col.teal, font = T.font.caps, wrap = false })
	if o.price then
		local tag = new("Frame", { Size = UDim2.fromOffset(math.max(64, 18 + #o.price * 9), 38), Position = UDim2.new(1, -20, 0, 14), AnchorPoint = Vector2.new(1, 0), BackgroundColor3 = col.magenta, BorderSizePixel = 0 }, f)
		W.corner(tag, 6)
		W.label(tag, { text = o.price, size = UDim2.fromScale(1, 1), color = Color3.new(1, 1, 1), font = T.font.bold, ts = 16, align = Enum.TextXAlignment.Center, wrap = false })
	end
	W.label(f, { text = W.upper(o.title), pos = UDim2.fromOffset(20, 36), size = UDim2.new(1, -40, 0, 52), ts = (W.m and W.m.class == "compact") and 24 or 34, color = col.text, font = T.font.display, valign = Enum.TextYAlignment.Center })
	if o.sub and o.sub ~= "" then W.label(f, { text = o.sub, pos = UDim2.fromOffset(20, 92), size = UDim2.new(1, -40, 0, 40), ts = 13, color = col.muted, font = T.font.caps, valign = Enum.TextYAlignment.Top }) end
	local y = (o.h or 210) - 58
	local x = 20
	if o.cta then
		W.button(f, { text = "▶  " .. o.cta, variant = "good", w = math.max(150, 40 + #o.cta * 9), h = 42, ts = 15, pos = UDim2.fromOffset(x, y), onClick = o.onCta })
		x += math.max(150, 40 + #o.cta * 9) + 10
	end
	if o.secondary then W.button(f, { text = o.secondary, variant = "ghost", w = math.max(130, 30 + #o.secondary * 8), h = 42, ts = 13, pos = UDim2.fromOffset(x, y), onClick = o.onSecondary }) end
	return f
end

-- "Continue" tile: gradient card, shape badge with a number, caps title, caption and a thin progress line.
function W.tile(parent, o)
	local f = new("TextButton", { Size = UDim2.fromOffset(o.w, o.h or 150), BackgroundColor3 = o.color or col.tileA, Text = "", AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 14)
	new("UIGradient", { Rotation = 135, Color = ColorSequence.new(o.color or col.tileA, o.color2 or col.tileD) }, f)
	local sc = new("UIScale", { Scale = 1 }, f)
	f.MouseEnter:Connect(function() if not W.m.touch then W.tween(sc, { Scale = 1.03 }, 0.1) end end)
	f.MouseLeave:Connect(function() W.tween(sc, { Scale = 1 }, 0.1) end)
	f.Activated:Connect(function() if o.onClick then o.onClick() end end)
	local badge = new("TextLabel", { Size = UDim2.fromOffset(52, 52), Position = UDim2.new(0.5, -26, 0, 14), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.6, Text = tostring(o.num or ""), Font = T.font.display, TextSize = 20, TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = (o.shape == "circle") and UDim.new(0.5, 0) or UDim.new(0, 14) }, badge)
	if o.shape ~= "circle" then badge.Rotation = 0 end
	W.stroke(badge, Color3.new(1, 1, 1), 1.5, 0.1)
	W.label(f, { text = W.upper(o.title), pos = UDim2.new(0, 12, 1, -50), size = UDim2.new(1, -24, 0, 16), ts = 13, font = T.font.caps, color = Color3.new(1, 1, 1), wrap = false, truncate = Enum.TextTruncate.AtEnd })
	W.label(f, { text = o.caption or "", pos = UDim2.new(0, 12, 1, -32), size = UDim2.new(1, -24, 0, 12), ts = 10, font = T.font.caps, color = Color3.new(1, 1, 1), wrap = false, truncate = Enum.TextTruncate.AtEnd })
	local pb = new("Frame", { Size = UDim2.new(1, -24, 0, 4), Position = UDim2.new(0, 12, 1, -14), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.6, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pb)
	local pf = new("Frame", { Size = UDim2.new(math.clamp(o.pct or 0, 0, 1), 0, 1, 0), BackgroundColor3 = col.teal, BorderSizePixel = 0 }, pb)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pf)
	return f
end

-- Bar sparkline for charts. values = array of numbers.
function W.chart(parent, values, color, h, labels)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 90), BackgroundColor3 = col.ink, BorderSizePixel = 0, LayoutOrder = nextOrder(parent) }, parent)
	W.corner(f)
	W.stroke(f, col.lineDim, 1)
	if #values < 2 then
		W.label(f, { text = labels and labels.none or "…", size = UDim2.fromScale(1, 1), color = col.muted, align = Enum.TextXAlignment.Center })
		return f
	end
	local lo, hi = math.huge, -math.huge
	for _, v in ipairs(values) do lo = math.min(lo, v); hi = math.max(hi, v) end
	if hi - lo < 1e-9 then hi = lo + 1 end
	local n = math.min(#values, 60)
	local step = #values / n
	local inner = new("Frame", { Size = UDim2.new(1, -12, 1, -12), Position = UDim2.fromOffset(6, 6), BackgroundTransparency = 1 }, f)
	for i = 1, n do
		local v = values[math.min(#values, math.floor((i - 1) * step) + 1)]
		local frac = 0.08 + 0.92 * (v - lo) / (hi - lo)
		new("Frame", { Size = UDim2.new(1 / n, -1, frac, 0), Position = UDim2.new((i - 1) / n, 0, 1 - frac, 0), BackgroundColor3 = color or col.line, BorderSizePixel = 0, BackgroundTransparency = (i == n) and 0 or 0.25 }, inner)
	end
	return f, lo, hi
end

-- Chip (cream tag) and segmented selector
function W.chip(parent, text, color, order)
	local c = new("TextLabel", { Size = UDim2.fromOffset(math.max(40, 14 + #text * 7), 22), BackgroundColor3 = color or col.cream, Text = text, TextColor3 = col.creamInk, Font = T.font.caps, TextSize = 13, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent) }, parent)
	W.corner(c, 3)
	return c
end

function W.flow(parent, h)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 0), AutomaticSize = (h and Enum.AutomaticSize.None or Enum.AutomaticSize.Y), BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Wraps = true, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	return f
end

-- Selector made of chips/buttons: options = { {id, text} }, calls onPick(id)
function W.segmented(parent, options, current, onPick)
	local f = W.flow(parent)
	for i, o in ipairs(options) do
		W.button(f, { text = o.text, variant = (o.id == current) and "select" or "ghost", w = math.max(64, 16 + #o.text * 7), h = math.max(30, W.m.btnH - 4), order = i, onClick = function() onPick(o.id) end })
	end
	return f
end

-- Compare table: headers = { "", col1, col2 }, rows = { { label, v1, v2, ... } }
function W.table(parent, headers, rows, cw)
	local cols = #headers
	local first = math.min(120, math.floor((cw or 320) * 0.3))
	local other = math.floor(((cw or 320) - 20 - first) / math.max(1, cols - 1))
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { Padding = UDim.new(0, 2), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	local function rowOf(cells, header, idx)
		local r = new("Frame", { Size = UDim2.new(1, 0, 0, header and 28 or 26), BackgroundColor3 = header and col.blueDark or ((idx % 2 == 0) and col.panel2 or col.panel), BorderSizePixel = 0, LayoutOrder = idx }, f)
		for i, text in ipairs(cells) do
			local x = (i == 1) and 6 or (first + (i - 2) * other + 6)
			W.label(r, { text = tostring(text), pos = UDim2.fromOffset(x, 0), size = UDim2.fromOffset((i == 1) and first - 6 or other - 8, header and 28 or 26), ts = header and 12 or 12, font = (header or i == 1) and T.font.bold or T.font.mono, color = (i == 1) and col.muted or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
		end
	end
	rowOf(headers, true, 0)
	for i, r in ipairs(rows) do rowOf(r, false, i) end
	return f
end

-- ───────── retro dialog ─────────
function W.modal(title, text, buttons)
	local gui = W.gui
	local overlay = new("TextButton", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.45, Text = "", AutoButtonColor = false, ZIndex = 150 }, gui)
	local w = math.min(W.m.w - 24, 420)
	local win = new("Frame", { Size = UDim2.fromOffset(w, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundColor3 = col.panel, BorderSizePixel = 0, ZIndex = 151 }, overlay)
	W.corner(win, 14)
	W.stroke(win, col.magenta, 2)
	new("UIListLayout", { SortOrder = Enum.SortOrder.LayoutOrder }, win)
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, 28), BackgroundColor3 = col.magenta, BorderSizePixel = 0, LayoutOrder = 1, ZIndex = 152 }, win)
	new("UIGradient", { Color = ColorSequence.new(col.blueDark, col.magenta) }, bar)
	new("TextLabel", { Size = UDim2.new(1, -40, 1, 0), Position = UDim2.fromOffset(8, 0), BackgroundTransparency = 1, Text = W.upper(title), Font = T.font.head, TextSize = 15, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 153 }, bar)
	local x = new("TextButton", { Size = UDim2.fromOffset(22, 20), Position = UDim2.new(1, -26, 0, 4), BackgroundColor3 = col.panel3, Text = "×", TextColor3 = col.text, Font = T.font.bold, TextSize = 16, ZIndex = 153, AutoButtonColor = true }, bar)
	local body = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = 2, ZIndex = 152 }, win)
	W.pad(body, 14, 12, 14, 14)
	new("UIListLayout", { Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder }, body)
	new("TextLabel", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, Text = text, TextWrapped = true, Font = T.font.body, TextSize = T.size.body, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, LayoutOrder = 1, ZIndex = 153 }, body)
	local row = new("Frame", { Size = UDim2.new(1, 0, 0, W.m.btnH), BackgroundTransparency = 1, LayoutOrder = 2, ZIndex = 153 }, body)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 8), HorizontalAlignment = Enum.HorizontalAlignment.Right }, row)
	local function close() overlay:Destroy() end
	x.Activated:Connect(close)
	for i, b in ipairs(buttons or {}) do
		local btn = W.button(row, { text = b.text, variant = b.variant, w = math.max(88, 20 + #b.text * 7), order = i, onClick = function() close(); if b.onClick then b.onClick() end end })
		btn.ZIndex = 154
	end
	return overlay
end

-- ───────── subtle outcome animations ─────────
function W.floatText(anchor, text, color)
	if not (W.gui and anchor and anchor.Parent) then return end
	local p, s = anchor.AbsolutePosition, anchor.AbsoluteSize
	local inset = W.gui.AbsolutePosition
	local l = new("TextLabel", { Size = UDim2.fromOffset(200, 28), Position = UDim2.fromOffset(p.X - inset.X + s.X / 2 - 100, p.Y - inset.Y + s.Y - 4), BackgroundTransparency = 1, Text = text, TextColor3 = color or col.teal, Font = T.font.mono, TextSize = 22, ZIndex = 300 }, W.gui)
	W.tween(l, { Position = l.Position - UDim2.fromOffset(0, 46), TextTransparency = 1 }, 1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	task.delay(1.2, function() l:Destroy() end)
end
function W.shake(frame)
	if not (frame and frame.Parent) then return end
	local p = frame.Position
	task.spawn(function()
		for i = 1, 4 do
			W.tween(frame, { Position = p + UDim2.fromOffset((i % 2 == 0) and -6 or 6, 0) }, 0.04)
			task.wait(0.05)
		end
		W.tween(frame, { Position = p }, 0.05)
	end)
end
function W.pulse(frame, color)
	if not (frame and frame.Parent) then return end
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color or col.teal, BackgroundTransparency = 0.55, BorderSizePixel = 0, ZIndex = 250 }, frame)
	W.corner(o)
	W.tween(o, { BackgroundTransparency = 1 }, 0.6)
	task.delay(0.65, function() o:Destroy() end)
end
function W.deviceFlash(text)
	if not W.gui then return end
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.2, ZIndex = 400, BorderSizePixel = 0 }, W.gui)
	local l = new("TextLabel", { Size = UDim2.fromScale(1, 0.2), Position = UDim2.fromScale(0, 0.4), BackgroundTransparency = 1, Text = text, Font = T.font.head, TextSize = 44, TextColor3 = col.ink, ZIndex = 401 }, o)
	W.tween(o, { BackgroundTransparency = 1 }, 1.2)
	W.tween(l, { TextTransparency = 1 }, 1.4)
	task.delay(1.5, function() o:Destroy() end)
end

return W
]==])
make("ModuleScript", "Screens", ui, [==[
--!nonstrict
-- Every screen reads live server state through ctx. No screen computes outcomes: it only reads display values
-- (rates, gates, prices) from the shared Logic and sends actions through ctx.act.
local Screens = { panel = {}, pin = {} }

local function init(ctx)
	return ctx.state, ctx.now, ctx.L, ctx.C, ctx.S, ctx.W, ctx.T
end

local function reasonText(S, r)
	return S.f(S.reason[r.code] or r.code, { have = r.have and math.floor(r.have) or 0, need = r.need or 0 })
end
local function firstReason(S, gate)
	local r = gate.reasons[1]
	return r and reasonText(S, r) or nil
end

-- ───────── next action (Phone home) ─────────
local function nextAction(ctx)
	local st, now, L, C, S = ctx.state, ctx.now, ctx.L, ctx.C, ctx.S
	if not st.job then return { text = S.home.nextJob, tab = "work", btn = S.nav.work } end
	for id, slot in pairs(st.hustle) do
		if L.hustleDue(slot, id, now) then return { text = S.home.nextHustle, tab = "hustle", btn = S.nav.hustle } end
	end
	if st.shift then return { text = S.f(S.work.decision, { a = st.shift.step + 1, b = C.SITUATIONS_PER_SHIFT }), tab = "work", btn = S.nav.work } end
	for _, id in ipairs({ "food", "drink", "housing", "transport", "clothing" }) do
		if st.needs[id] <= 0 then return { text = S.home.nextFood, sub = S.needs[id].effect, tab = "needs", btn = S.nav.needs } end
	end
	if st.energy >= C.SHIFT_MIN_ENERGY and now >= st.shiftReadyAt and st.sickUntil <= now and st.vacationUntil <= now then
		return { text = S.home.nextShift, tab = "work", btn = S.nav.work }
	end
	if st.device < #C.DEVICES then
		local g = L.deviceGate(st, st.device + 1, now)
		if g.ok then return { text = S.f(S.home.nextDevice, { name = S.devices[C.DEVICES[st.device + 1].id].name }), tab = "device", btn = S.nav.device, tag = ctx.W.fmt(C.DEVICES[st.device + 1].price) } end
	end
	if st.energy < C.SHIFT_MIN_ENERGY then return { text = S.home.nextRest, tab = "work", btn = S.nav.work } end
	if next(st.companies) == nil and st.cash > 1500 then return { text = S.home.nextCompany, tab = "companies", btn = S.nav.companies } end
	if st.cash > 500 then return { text = S.home.nextInvest, tab = "invest", btn = S.nav.invest } end
	if st.device < #C.DEVICES then
		return { text = S.f(S.home.nextSave, { name = S.devices[C.DEVICES[st.device + 1].id].name }), tab = "device", btn = S.nav.device }
	end
	return { text = S.ui.nextNone }
end
Screens.nextAction = nextAction

local function halfGrid(ctx, parent, items)
	local W = ctx.W
	local f = W.flow(parent)
	local w = math.floor((ctx.cw - 20 - 6) / 2)
	for i, it in ipairs(items) do
		W.stat(f, { label = it.label, value = it.value, color = it.color, sub = it.sub, size = UDim2.fromOffset(w, 62), order = i })
	end
	return f
end

-- ───────── home ─────────
local ALERT_TAB = { distress = "companies", lowEnergy = "work", needEmpty = "needs", noStock = "companies", event = "companies", sick = "work", crisis = "work", orderNear = "invest" }

local function alertText(ctx, a)
	local S, C = ctx.S, ctx.C
	local name = a.id and ((S.needs[a.id] and S.needs[a.id].name) or S.companies[a.id] or S.assets[a.id]) or ""
	if a.code == "distress" then return S.f(S.alerts.distress, { t = ctx.W.dur(a.ms) }) end
	if a.code == "event" then return S.f(S.alerts.event, { name = S.events[a.event], co = S.companies[a.id] }) end
	return S.f(S.alerts[a.code], { name = name })
end

local function tileData(ctx)
	local st, now, L, C, S, W = ctx.state, ctx.now, ctx.L, ctx.C, ctx.S, ctx.W
	local H = S.hero.tiles
	local minDays = math.huge
	for _, id in ipairs(C.NEEDS) do minDays = math.min(minDays, st.needs[id]) end
	local stock, cap, units = 0, 0, 0
	for _, c in ipairs(C.COMPANIES) do
		local n = st.companies[c.id] or 0
		if n > 0 then
			units += n
			cap += L.stockCapacity(n, st.phase)
			stock += (st.setup[c.id] and st.setup[c.id].stock or 0)
		end
	end
	local worth = math.max(1, L.netWorth(st, now))
	local pv = L.portfolioValue(st, now)
	local holdings = 0
	for _ in pairs(st.holdings) do holdings += 1 end
	local hustles, hr = 0, 0
	for _, slot in pairs(st.hustle) do hustles += 1; hr = math.max(hr, slot.round) end
	local nextDev = C.DEVICES[st.device + 1]
	local list = {
		{ tab = "work", color = ctx.T.color.tileA, c2 = ctx.T.color.tileD, shape = "hex", num = st.job and st.job.rank or "—", title = S.nav.work, pct = st.energy / C.ENERGY_MAX, cap = S.f(H.work, { n = math.floor(st.energy) }) },
		{ tab = "needs", color = ctx.T.color.tileB, c2 = ctx.T.color.tileF, shape = "circle", num = (minDays <= 0) and "!" or math.floor(minDays), title = S.nav.needs, pct = math.min(1, minDays / C.MAX_NEED_DAYS), cap = S.f(H.needs, { n = W.dec(minDays, 1) }) },
		{ tab = "companies", color = ctx.T.color.tileC, c2 = ctx.T.color.tileA, shape = "hex", num = units, title = S.nav.companies, pct = (cap > 0) and (stock / cap) or 0, cap = S.f(H.companies, { n = (cap > 0) and math.floor(100 * stock / cap) or 0 }) },
		{ tab = "invest", color = ctx.T.color.tileD, c2 = ctx.T.color.tileB, shape = "circle", num = holdings, title = S.nav.invest, pct = pv / worth, cap = S.f(H.invest, { n = math.floor(100 * pv / worth) }) },
		{ tab = "hustle", color = ctx.T.color.tileE, c2 = ctx.T.color.tileF, shape = "hex", num = hustles, title = S.nav.hustle, pct = hr / C.HUSTLE_PHASES, cap = S.f(H.hustle, { a = hr, b = C.HUSTLE_PHASES }) },
	}
	if nextDev then
		table.insert(list, { tab = "device", color = ctx.T.color.tileF, c2 = ctx.T.color.tileA, shape = "circle", num = st.device, title = S.nav.device, pct = math.min(1, math.max(0, st.cash) / math.max(1, nextDev.price)), cap = S.f(H.device, { n = math.min(100, math.floor(100 * math.max(0, st.cash) / math.max(1, nextDev.price))) }) })
	else
		table.insert(list, { tab = "device", color = ctx.T.color.tileF, c2 = ctx.T.color.tileA, shape = "circle", num = st.device, title = S.nav.device, pct = 1, cap = S.ui.max })
	end
	return list
end

function Screens.home(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local nxt = nextAction(ctx)
	local wide = ctx.cw >= 700

	-- hero (featured next step) + side panel ("friends online" slot -> what is happening in the economy)
	local top = W.new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = W.nextOrder(parent) }, parent)
	W.new("UIListLayout", { FillDirection = wide and Enum.FillDirection.Horizontal or Enum.FillDirection.Vertical, Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder }, top)
	local heroW = wide and math.floor((ctx.cw - 12) * 0.62) or ctx.cw
	W.hero(top, {
		kicker = S.hero.kicker, title = nxt.text, sub = nxt.sub or S.hero.sub, price = nxt.tag or S.hero.free, h = wide and 230 or 215,
		size = UDim2.fromOffset(heroW, wide and 230 or 215), order = 1,
		cta = nxt.btn and S.hero.cta or nil, onCta = function() if nxt.tab then ctx.go(nxt.tab) end end,
		secondary = (nxt.tab ~= "device" and st.device < #C.DEVICES) and S.hero.secondary or nil, onSecondary = function() ctx.go("device") end,
	})
	local panelW = wide and (ctx.cw - 12 - heroW) or ctx.cw
	local panel = W.new("Frame", { Size = UDim2.fromOffset(panelW, wide and 230 or 0), AutomaticSize = wide and Enum.AutomaticSize.None or Enum.AutomaticSize.Y, BackgroundColor3 = T.color.ink, BackgroundTransparency = 0.35, BorderSizePixel = 0, LayoutOrder = 2 }, top)
	W.corner(panel, 18)
	W.stroke(panel, T.color.line, 1.5, 0.1)
	W.pad(panel, 12, 10, 12, 10)
	W.new("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, panel)
	W.label(panel, { text = W.upper(S.hero.panelTitle), size = UDim2.new(1, 0, 0, 16), ts = 11, color = T.color.teal, font = T.font.caps, wrap = false, order = 0 })
	local alerts = L.alerts(st, now)
	local shown = 0
	for _, a in ipairs(alerts) do
		if shown >= (wide and 4 or 5) then break end
		shown += 1
		local color = (a.level == "bad") and T.color.red or ((a.level == "warn") and T.color.amber or T.color.teal)
		local row = W.new("Frame", { Size = UDim2.new(1, 0, 0, 38), BackgroundColor3 = T.color.ink, BackgroundTransparency = 0.4, BorderSizePixel = 0, LayoutOrder = shown }, panel)
		W.corner(row, 10)
		local text = alertText(ctx, a)
		local av = W.avatar(row, text, color, 28, color)
		av.Position = UDim2.fromOffset(6, 5)
		W.label(row, { text = text, pos = UDim2.fromOffset(42, 0), size = UDim2.new(1, -118, 1, 0), ts = 12, font = T.font.caps, wrap = false, truncate = Enum.TextTruncate.AtEnd })
		W.button(row, { text = S.hero.panelOpen, variant = "ghost", w = 64, h = 24, ts = 10, pos = UDim2.new(1, -70, 0.5, -12), onClick = function() ctx.go(ALERT_TAB[a.code] or "home") end })
	end
	if shown == 0 then W.label(panel, { text = S.hero.panelEmpty, size = UDim2.new(1, 0, 0, 40), ts = 12, color = T.color.muted, font = T.font.caps, order = 1 }) end

	-- "continue" tile row
	W.label(parent, { text = W.upper(S.hero.continueTitle), size = UDim2.new(1, 0, 0, 24), ts = 16, font = T.font.head, color = T.color.text, wrap = false, order = W.nextOrder(parent) })
	local tiles = W.flow(parent)
	local data = tileData(ctx)
	local cols = (ctx.m.class == "compact") and 2 or ((ctx.cw >= 900) and 6 or 3)
	local tw = math.floor((ctx.cw - 6 * (cols - 1) - 2) / cols)
	for i, td in ipairs(data) do
		W.tile(tiles, { w = tw, h = 150, color = td.color, color2 = td.c2, shape = td.shape, num = td.num, title = td.title, pct = td.pct, caption = td.cap, order = i, onClick = function() ctx.go(td.tab) end })
	end

	local r = L.rates(st, now)
	card = W.card(parent, { title = S.home.income, right = S.f(S.home.mult, { n = W.dec(r.multiplier) }) })
	halfGrid(ctx, card, {
		{ label = S.home.salary, value = W.fmt(r.salary), color = T.color.line },
		{ label = S.home.companies, value = W.fmt(r.companies), color = T.color.line },
		{ label = S.home.passive, value = W.fmt(r.passive), color = T.color.line },
		{ label = S.home.costs, value = "−" .. W.fmt(r.companyCosts), color = T.color.red },
		{ label = S.home.living, value = "−" .. W.fmt(r.living), color = T.color.amber, sub = S.needsUi.hint },
		{ label = S.ui.income, value = W.fmt(r.net), color = (r.net >= 0) and T.color.teal or T.color.red },
	})
	local danger, left = L.distressOf(st, now)
	if danger then
		local c = W.card(parent, { title = S.co.distress, accent = T.color.red })
		W.note(c, S.f(S.co.distressText, { n = W.dur(left) }), T.color.red)
	end
	if st.sickUntil > now then W.note(W.card(parent, { title = S.work.title }), S.work.sick, T.color.amber) end
	local ev = L.currentEvent(now)
	local ae = L.currentAssetEvent(now)
	if ev or ae then
		local c = W.card(parent, { title = S.home.title })
		if ev then W.note(c, S.f(S.home.event, { name = S.events[ev.def.id] }) .. "  ×" .. W.dec(ev.def.mult, 2), ev.def.mult < 1 and T.color.red or T.color.teal) end
		if ae then W.note(c, S.f(S.home.news, { name = S.assetEvents[ae.def.id] }), T.color.line) end
	end
	card = W.card(parent, { title = S.board.record })
	W.note(card, S.f(S.home.record, { a = W.fmt(st.best), b = st.runs }) .. " · " .. S.f(S.board.bankrupt, { n = st.bankruptcies }))
	W.row(card, {
		title = S.home.restart, sub = S.home.restartHint, cw = ctx.cw,
		actions = { { text = S.home.restart, variant = "danger", onClick = function()
			W.modal(S.home.restart, S.home.restartConfirm .. " " .. S.home.restartHint, {
				{ text = S.ui.no, variant = "ghost" },
				{ text = S.ui.yes, variant = "danger", onClick = function() ctx.act("restart") end },
			})
		end } },
	})
	W.note(parent, S.legal.saveNote)
end

-- ───────── work ─────────
local function def_edu_for(C, job) return C.JOB_BY_ID[job.id].edu + job.rank end
function Screens.work(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local fx = L.needsEffects(st, now)
	local job = st.job
	local card = W.card(parent, { title = S.work.current })
	if job then
		local def = C.JOB_BY_ID[job.id]
		local nextPts = C.RANK_POINTS[job.rank + 1]
		W.row(card, { title = S.jobs[job.id], sub = S.f(S.work.rank, { a = job.rank, b = C.MAX_JOB_RANK }) .. " · " .. (nextPts and S.f(S.work.points, { a = job.points, b = nextPts }) or ("" .. job.points)) .. " · " .. S.f(S.work.pay, { n = W.fmt(L.jobHourly(st, now)) }), cw = ctx.cw })
		W.progress(card, st.energy / C.ENERGY_MAX, st.energy < 30 and T.color.red or T.color.teal)
		W.note(card, S.ui.energy .. " " .. math.floor(st.energy) .. "/" .. C.ENERGY_MAX)
		if st.sickUntil > now then W.note(card, S.work.sick, T.color.amber) end
		if L.inCrisis(st, now) then W.note(card, S.work.crisis, T.color.amber) end
		if fx.noShift then W.note(card, S.work.walk, T.color.amber) end
	else
		W.note(card, S.work.noJob)
	end

	if job and st.shift then
		local sit = L.situationAt(st.shift.seed, st.shift.step)
		local txt = S.situations[sit.id]
		local sc = W.card(parent, { title = S.f(S.work.decision, { a = st.shift.step + 1, b = C.SITUATIONS_PER_SHIFT }), accent = T.color.magenta })
		W.note(sc, txt.text, T.color.text)
		for i, choice in ipairs(txt.choices) do
			W.row(sc, { title = choice, cw = ctx.cw, actions = { { text = S.work.choose, variant = "primary", onClick = function() ctx.act("chooseShift", i) end } } })
		end
	elseif job then
		local cd = math.max(0, st.shiftReadyAt - now)
		local reason
		if st.sickUntil > now then reason = S.err.sick
		elseif st.vacationUntil > now then reason = S.err.vacation
		elseif cd > 0 then reason = S.f(S.work.cooldown, { n = W.dur(cd) })
		elseif st.energy < C.SHIFT_MIN_ENERGY then reason = S.err["low-energy"] end
		local ac = W.card(parent, { title = S.work.start })
		W.row(ac, { title = S.work.start, sub = S.f(S.work.startHint, { n = C.SHIFT_MIN_ENERGY }), cw = ctx.cw,
			actions = { { text = S.work.start, variant = "good", reason = reason, onClick = function() ctx.act("startShift", fx.noShift) end } } })
		local rreason = (now < st.restReadyAt) and S.f(S.work.cooldown, { n = W.dur(st.restReadyAt - now) }) or nil
		W.row(ac, { title = S.work.rest, sub = S.work.restHint, cw = ctx.cw, actions = { { text = S.work.rest, variant = "ghost", reason = rreason, onClick = function() ctx.act("rest") end } } })
		W.row(ac, { title = S.work.vacation, sub = S.work.vacationHint, cw = ctx.cw, actions = { { text = S.work.vacation, variant = "ghost", onClick = function() ctx.act("startVacation") end } } })
		local nextPts = C.RANK_POINTS[job.rank + 1]
		local preason
		if job.rank >= C.MAX_JOB_RANK then preason = S.err.max
		elseif nextPts and job.points < nextPts then preason = S.f(S.reason.points, { have = job.points, need = nextPts })
		elseif st.edu < def_edu_for(C, job) then preason = S.f(S.reason.edu, { have = st.edu, need = def_edu_for(C, job) }) end
		W.row(ac, { title = S.work.promo, sub = S.work.promoHint, cw = ctx.cw, actions = { { text = S.work.promo, variant = "primary", reason = preason, onClick = function() ctx.act("requestPromotion") end } } })
		W.row(ac, { title = S.work.raise, sub = S.work.raiseHint, cw = ctx.cw, actions = { { text = S.work.raise, variant = "primary", reason = (now < st.raiseReadyAt) and S.f(S.work.cooldown, { n = W.dur(st.raiseReadyAt - now) }) or nil, onClick = function() ctx.act("negotiateRaise") end } } })
		if job.rank >= C.LEAD_MIN_RANK then
			W.row(ac, { title = S.work.lead, sub = S.work.leadHint, cw = ctx.cw, actions = { { text = job.lead and S.ui.no or S.ui.yes, variant = job.lead and "select" or "ghost", onClick = function() ctx.act("setLead", not job.lead) end } } })
		end
		W.row(ac, { title = S.work.quit, cw = ctx.cw, actions = { { text = S.work.quit, variant = "danger", onClick = function() ctx.act("quitJob") end } } })
	end

	-- education
	local ec = W.card(parent, { title = S.work.edu, right = S.f(S.work.eduPoints, { n = st.eduPoints }) })
	local cost = L.eduCost(st.edu)
	local ereason = (st.edu >= C.MAX_EDU) and S.err.max or ((st.eduPoints < cost) and S.f(S.reason.points, { have = st.eduPoints, need = cost }) or nil)
	W.row(ec, { title = S.work.edu .. " " .. st.edu .. "/" .. C.MAX_EDU, sub = S.f(S.work.eduHint, { n = cost }), cw = ctx.cw,
		actions = { { text = S.work.eduBuy, variant = "good", reason = ereason, onClick = function() ctx.act("investEdu") end } } })

	if not st.shift then
		local jc = W.card(parent, { title = S.work.jobs })
		if ctx.feat.savedViews or ctx.feat.compare then
			W.segmented(jc, { { id = "", text = S.ui.all }, { id = "open", text = S.ui.available } }, ctx.ui.filter.work or "", function(id) ctx.ui.filter.work = id; ctx.rerender() end)
		end
		for _, j in ipairs(C.JOBS) do
			local g = L.jobGate(st, j.id)
			local show = (ctx.ui.filter.work ~= "open") or (st.edu >= j.edu)
			if show then
				local current = job and job.id == j.id
				W.row(jc, {
					title = S.jobs[j.id], selected = current, cw = ctx.cw,
					sub = S.f(S.work.salary, { n = W.fmt(j.salary) }) .. " · " .. S.f(S.work.fee, { n = W.fmt(j.fee) }) .. " · " .. S.f(S.work.needEdu, { n = j.edu }),
					extra = (not g.ok and not current) and ("⛔ " .. (firstReason(S, g) or "")) or nil,
					actions = { { text = current and "✓" or S.ui.buy, variant = "primary", reason = (not g.ok) and (firstReason(S, g) or S.err.locked) or nil, onClick = function() ctx.act("takeJob", j.id) end } },
				})
			end
		end
	end
end

-- ───────── needs ─────────
function Screens.needs(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.needsUi.title })
	W.note(card, S.needsUi.hint)
	local fx = L.needsEffects(st, now)
	if fx.noShift then W.note(card, "⚠ " .. S.needsUi.transportWarn, T.color.amber) end
	if fx.bills then W.note(card, "⚠ " .. S.needsUi.billsWarn, T.color.red) end
	for _, id in ipairs(C.NEEDS) do
		local have = st.needs[id]
		local price = L.needDaily(st, id)
		local full = C.MAX_NEED_DAYS - have <= 1e-9
		W.row(card, {
			title = S.needs[id].name .. (have <= 0 and ("  " .. S.needsUi.empty) or ""), titleColor = have <= 0 and T.color.red or T.color.text, alert = have <= 0,
			sub = S.needs[id].effect, extra = S.f(S.needsUi.days, { n = W.dec(have, 1) }) .. " · " .. S.f(S.needsUi.perDay, { n = W.fmt(price) }), extraColor = T.color.line, cw = ctx.cw,
			actions = {
				{ text = S.needsUi.plus1, variant = "primary", reason = full and S.err.max or nil, onClick = function() ctx.act("buyNeed", id, 1) end },
				{ text = S.needsUi.plus7, variant = "ghost", reason = full and S.err.max or nil, onClick = function() ctx.act("buyNeed", id, C.MAX_NEED_DAYS) end },
			},
		})
		W.progress(card, have / C.MAX_NEED_DAYS, have <= 0 and T.color.red or T.color.teal, 6)
	end
	local bc = W.card(parent, { title = S.needsUi.boosts })
	for _, id in ipairs(C.BOOSTS) do
		local left = 0
		for _, b in ipairs(st.boosts) do if b.id == id then left = math.max(0, b.until_ - now) end end
		W.row(bc, { title = S.boosts[id], sub = (left > 0) and S.f(S.ui.soon, { n = W.dur(left) }) or "", cw = ctx.cw,
			actions = { { text = S.ui.buy .. " " .. W.fmt(L.boostPrice(st, id)), variant = "primary", onClick = function() ctx.act("buyBoost", id) end } } })
	end
end

-- ───────── companies ─────────
local function companyDetail(ctx, parent, id)
	local st, now, L, C, S, W, T = init(ctx)
	local n = st.companies[id] or 0
	local s = L.setupOf(st, id)
	local y = L.companyYield(st, id, now)
	local card = W.card(parent, { title = S.companies[id] .. " ×" .. n, accent = T.color.magenta, right = S.f(S.co.profit, { n = W.fmt(y.gross - y.costs) }) })
	if y.strike then W.note(card, "⚠ " .. S.co.strike, T.color.red) end
	if L.currentRival(st, now) == id then W.note(card, "⚠ " .. S.co.rival, T.color.amber) end
	W.note(card, S.f(S.co.morale, { n = math.floor(y.morale * 100) }) .. (now < s.rookieUntil and (" · " .. S.co.rookies) or ""))
	if s.stock <= 0 then W.note(card, "⚠ " .. S.co.noStock, T.color.red) end
	W.progress(card, s.stock / math.max(1, L.stockCapacity(n, st.phase)), s.stock <= 0 and T.color.red or T.color.line, 8)
	W.row(card, { title = S.f(S.co.stock, { a = W.dec(s.stock, 1), b = L.stockCapacity(n, st.phase) }), cw = ctx.cw,
		actions = { { text = S.co.buyStock .. " " .. W.fmt(L.batchPrice(id, now) * 5), variant = "primary", onClick = function() ctx.act("buyStock", id, 5) end } } })
	W.note(card, S.f(S.co.staff, { a = s.staff, b = n * C.MAX_STAFF_PER_UNIT }))
	for _, role in ipairs(C.STAFF_ROLES) do
		local cap = C.ROLE_MAX[role]
		local full = s.staff >= n * C.MAX_STAFF_PER_UNIT or s.roles[role] >= cap
		W.row(card, { title = S.roles[role] .. " ×" .. s.roles[role], sub = S.f(S.ui.price, {}) .. " " .. W.fmt(L.hireCost(role)), cw = ctx.cw,
			actions = {
				{ text = "+", w = 52, variant = "primary", reason = full and S.err.max or nil, onClick = function() ctx.act("hireStaff", id, 1, role) end },
				{ text = "−", w = 52, variant = "ghost", reason = (s.roles[role] <= 0) and S.err.nothing or nil, onClick = function() ctx.act("hireStaff", id, -1, role) end },
			} })
	end
	for _, field in ipairs({ "price", "output", "risk" }) do
		local r = C.SETTING_RANGE[field]
		W.row(card, { title = S.f(S.co[field], { n = W.dec(s[field], 2) }), cw = ctx.cw,
			actions = {
				{ text = "−", w = 52, variant = "ghost", reason = (s[field] <= r.min + 1e-9) and S.err.max or nil, onClick = function() ctx.act("setCompanySetting", id, field, s[field] - r.step * 2) end },
				{ text = "+", w = 52, variant = "primary", reason = (s[field] >= r.max - 1e-9) and S.err.max or nil, onClick = function() ctx.act("setCompanySetting", id, field, s[field] + r.step * 2) end },
			} })
	end
	W.row(card, { title = s.upgraded and S.co.upgraded or S.co.upgrade, sub = "+30 %", cw = ctx.cw,
		actions = { { text = S.ui.buy .. " " .. W.fmt(L.upgradePrice(st, id)), variant = "primary", reason = s.upgraded and S.err.max or nil, onClick = function() ctx.act("upgradeCompany", id) end } } })
	W.row(card, { title = S.co.campaign, sub = "+30 % / 30 min", cw = ctx.cw, actions = { { text = W.fmt(L.campaignPrice(st, id)), variant = "primary", reason = (now < s.marketingUntil) and S.err.busy or nil, onClick = function() ctx.act("runCampaign", id) end } } })
	W.row(card, { title = S.co.contract, sub = "+35 %", cw = ctx.cw, actions = { { text = W.fmt(L.contractPrice(st, id)), variant = "primary", reason = L.contractActive(st, id, now) and S.err.busy or nil, onClick = function() ctx.act("signContract", id) end } } })
	local lvl = L.researchLevel(st, id)
	W.row(card, { title = S.f(S.co.research, { a = lvl, b = C.MAX_RESEARCH }), cw = ctx.cw, actions = { { text = W.fmt(L.researchPrice(st, id)), variant = "primary", reason = (lvl >= C.MAX_RESEARCH) and S.err.max or nil, onClick = function() ctx.act("researchCompany", id) end } } })
	if s.staff >= C.UNION_MIN_STAFF then
		W.row(card, { title = S.co.union, cw = ctx.cw, actions = { { text = S.ui.buy, variant = "primary", reason = (s.unionUntil > now) and S.err.busy or nil, onClick = function() ctx.act("unionDeal", id) end } } })
	end
	local ev = L.currentEvent(now)
	if ev and L.isNegativeEvent(ev.def) and L.eventAffects(ev.def, id) then
		W.row(card, { title = S.co.fund, sub = S.events[ev.def.id], alert = true, cw = ctx.cw, actions = { { text = W.fmt(L.fundPrice(st, id)), variant = "danger", reason = (st.responses[id] == ev.window) and S.err.busy or nil, onClick = function() ctx.act("fundResponse", id) end } } })
	end
	W.row(card, { title = S.co.sell, cw = ctx.cw, actions = { { text = W.fmt(L.sellPrice(st, id)), variant = "danger", onClick = function() ctx.act("sellCompany", id) end } } })
end

function Screens.companies(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local r = L.rates(st, now)
	local card = W.card(parent, { title = S.co.title, right = S.f(S.co.phase, { a = st.phase, b = C.MAX_PHASE }) })
	W.note(card, S.f(S.co.revenue, { n = W.fmt(r.companies) }) .. " · " .. S.f(S.co.costs, { n = W.fmt(r.companyCosts) }))
	local danger, left = L.distressOf(st, now)
	if danger then W.note(card, "⚠ " .. S.co.distress .. ": " .. S.f(S.co.distressText, { n = W.dur(left) }), T.color.red) end
	if st.lastBankruptId and now - st.lastBankruptAt < 3600000 then W.note(card, S.f(S.co.bankruptcy, { name = S.companies[st.lastBankruptId] }), T.color.red) end
	if st.phase < C.MAX_PHASE then
		local req, cost = L.phaseRequirement(st.phase + 1), L.phaseCost(st.phase + 1)
		local reason = (r.companies < req) and S.f(S.reason.cash, { have = W.fmt(r.companies), need = W.fmt(req) }) or nil
		W.row(card, { title = S.co.nextPhase, sub = S.f(S.co.phaseHint, { req = W.fmt(req), cost = W.fmt(cost) }), cw = ctx.cw,
			actions = { { text = S.co.upgradePhase, variant = "good", reason = reason, onClick = function() ctx.act("upgradePhase") end } } })
	end
	local lc = W.card(parent, {})
	if ctx.feat.savedViews then
		W.segmented(lc, { { id = "", text = S.ui.all }, { id = "owned", text = S.ui.owned } }, ctx.ui.filter.companies or "", function(id) ctx.ui.filter.companies = id; ctx.rerender() end)
	end
	for _, c in ipairs(C.COMPANIES) do
		local n = st.companies[c.id] or 0
		if (ctx.ui.filter.companies ~= "owned") or n > 0 then
			local g = L.companyGate(st, c.id)
			local y = L.companyYield(st, c.id, now)
			local reason = (not g.ok) and firstReason(S, g) or ((st.cash < g.price) and S.f(S.reason.cash, { have = W.fmt(st.cash), need = W.fmt(g.price) }) or nil)
			W.row(lc, {
				title = S.f(S.co.unit, { name = S.companies[c.id], n = n }), selected = (ctx.ui.company == c.id), cw = ctx.cw,
				sub = S.f(S.ui.price, {}) .. " " .. W.fmt(g.price) .. (n > 0 and (" · " .. S.f(S.co.profit, { n = W.fmt(y.gross - y.costs) })) or "") .. " · " .. S.f(S.cmp.payback, { n = c.payback }),
				extra = reason and ("⛔ " .. reason) or nil,
				actions = (function()
					local a = { { text = S.ui.buy, variant = "primary", reason = reason, onClick = function() ctx.act("buyCompany", c.id) end } }
					if n > 0 then table.insert(a, { text = (ctx.ui.company == c.id) and S.ui.close or S.co.manage, variant = "ghost", onClick = function() ctx.ui.company = (ctx.ui.company ~= c.id) and c.id or nil; ctx.rerender() end }) end
					return a
				end)(),
			})
		end
	end
	if ctx.ui.company and (st.companies[ctx.ui.company] or 0) > 0 then companyDetail(ctx, parent, ctx.ui.company) end
end

-- ───────── invest ─────────
local ORDER_KINDS = {
	{ id = "buyBelow", side = "buy", when = "below", key = "orderBuyBelow", pcts = { -0.03, -0.05, -0.1 } },
	{ id = "sellAbove", side = "sell", when = "above", key = "orderSellAbove", pcts = { 0.03, 0.05, 0.1 } },
	{ id = "sellBelow", side = "sell", when = "below", key = "orderSellBelow", pcts = { -0.03, -0.05, -0.1 } },
	{ id = "buyAbove", side = "buy", when = "above", key = "orderBuyAbove", pcts = { 0.03, 0.05, 0.1 } },
}

local function assetRow(ctx, parent, a, opts)
	local st, now, L, C, S, W, T = init(ctx)
	opts = opts or {}
	local price = L.assetPrice(a.id, now, st.startedAt)
	local have = st.holdings[a.id] or 0
	local locked = L.isLocked(st, "asset", a.id)
	local sub = S.f(S.inv.price, { n = W.fmt(price) }) .. " · " .. S.f(S.inv.yield, { n = W.dec(a.yield * 100, 1) })
	local extra
	if have > 0 then extra = S.f(S.inv.own, { q = W.dec(have, 2), v = W.fmt(have * price) }) .. " · " .. S.f(S.inv.pnl, { n = W.fmt(have * (price - (st.cost[a.id] or price))) }) end
	local watched = false
	for _, id in ipairs(st.watch) do if id == a.id then watched = true end end
	local lockText = locked and S.inv.locked or nil
	local actions = {
		{ text = S.f(S.inv.buy10, {}), variant = "primary", reason = lockText or ((st.cash < 1) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyAsset", a.id, st.cash * 0.1) end },
		{ text = S.inv.buyAll, variant = "ghost", reason = lockText or ((st.cash < 1) and S.err["not-enough-cash"] or nil), onClick = function() ctx.act("buyAsset", a.id, st.cash) end },
		{ text = S.inv.sellHalf, variant = "ghost", reason = (have <= 0) and S.err.nothing or nil, onClick = function() ctx.act("sellAsset", a.id, 0.5) end },
		{ text = S.inv.sellAll, variant = "danger", reason = (have <= 0) and S.err.nothing or nil, onClick = function() ctx.act("sellAsset", a.id, 1) end },
	}
	if opts.compact then actions = { actions[1], actions[4] } end
	if ctx.feat.watchlist then table.insert(actions, { text = watched and "★" or "☆", w = 48, variant = watched and "select" or "ghost", onClick = function() ctx.act("toggleWatch", a.id) end }) end
	table.insert(actions, { text = "⚙", w = 48, variant = (ctx.ui.orderAsset == a.id) and "select" or "ghost", onClick = function() ctx.ui.orderAsset = (ctx.ui.orderAsset ~= a.id) and a.id or nil; ctx.rerender() end })
	W.row(parent, { title = S.assets[a.id], sub = sub, extra = extra, extraColor = T.color.line, selected = (ctx.ui.orderAsset == a.id), cw = ctx.cw, actions = actions })
end
Screens.assetRow = assetRow

local function orderComposer(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local id = ctx.ui.orderAsset
	local card = W.card(parent, { title = S.inv.orders .. ": " .. S.assets[id], accent = T.color.magenta })
	W.note(card, S.inv.orderHint)
	local price = L.assetPrice(id, now, st.startedAt)
	W.note(card, S.f(S.inv.price, { n = W.fmt(price) }))
	for _, k in ipairs(ORDER_KINDS) do
		local f = W.flow(card)
		W.label(f, { text = S.inv[k.key], size = UDim2.new(1, 0, 0, 18), ts = 12, color = T.color.muted })
		for _, pct in ipairs(k.pcts) do
			local limit = price * (1 + pct)
			local reason
			if k.side == "sell" and (st.holdings[id] or 0) <= 0 then reason = S.err.nothing
			elseif #st.orders >= C.MAX_ORDERS then reason = S.f(S.inv.orderMax, { n = C.MAX_ORDERS }) end
			W.button(f, { text = string.format("%+d %% · %s", math.round(pct * 100), W.fmt(limit)), variant = "ghost", w = 150, reason = reason, onClick = function()
				ctx.act("placeOrder", { asset = id, side = k.side, when = k.when, price = limit, amount = math.max(1, st.cash * 0.25), share = 1 })
			end })
		end
	end
end

function Screens.invest(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local pv = L.portfolioValue(st, now)
	local card = W.card(parent, { title = S.inv.title, right = S.inv.portfolio .. " " .. W.fmt(pv) })
	local ae = L.currentAssetEvent(now)
	if ae then W.note(card, "📰 " .. S.assetEvents[ae.def.id] .. "  ×" .. W.dec(ae.def.mult, 2), ae.def.mult < 1 and T.color.red or T.color.teal) end
	W.note(card, S.inv.startupWarn)
	local opts = { { id = "", text = S.ui.all } }
	for _, cat in ipairs(C.ASSET_CATEGORIES) do table.insert(opts, { id = cat, text = S.assetCats[cat] }) end
	table.insert(opts, { id = "owned", text = S.ui.owned })
	W.segmented(card, opts, ctx.ui.filter.invest or "", function(id) ctx.ui.filter.invest = id; ctx.rerender() end)
	if ctx.ui.orderAsset then orderComposer(ctx, parent) end
	local f = ctx.ui.filter.invest or ""
	local cur
	local list
	for _, a in ipairs(C.ASSETS) do
		local show = (f == "") or (f == a.cat) or (f == "owned" and (st.holdings[a.id] or 0) > 0)
		if show then
			if a.cat ~= cur then cur = a.cat; list = W.card(parent, { title = S.assetCats[a.cat] }) end
			assetRow(ctx, list, a)
		end
	end
	if #st.orders > 0 then
		local oc = W.card(parent, { title = S.inv.orders .. " (" .. #st.orders .. "/" .. C.MAX_ORDERS .. ")" })
		for _, o in ipairs(st.orders) do
			W.row(oc, { title = S.sides[o.side] .. " " .. S.assets[o.asset], sub = S.sides[o.when] .. " " .. W.fmt(o.price), cw = ctx.cw,
				actions = { { text = S.inv.orderCancel, variant = "danger", onClick = function() ctx.act("cancelOrder", o.id) end } } })
		end
	end
	local arb = W.card(parent, { title = S.inv.arb })
	local spread = L.arbitrageSpread(now) * 100
	W.note(arb, S.inv.arbHint .. " " .. S.f(S.inv.spread, { n = W.dec(spread, 2) }))
	local amount = math.min(st.cash, L.arbitrageLimit(st))
	local reason
	if now < st.arbReadyAt then reason = S.f(S.work.cooldown, { n = W.dur(st.arbReadyAt - now) })
	elseif amount < 1 then reason = S.err["not-enough-cash"]
	elseif L.arbitrageSpread(now) - C.ARB_FEE <= 0 then reason = S.err["no-spread"] end
	W.row(arb, { title = S.f(S.inv.arbRun, { n = W.fmt(amount) }), cw = ctx.cw, actions = { { text = S.inv.arb, variant = "good", reason = reason, onClick = function() ctx.act("arbitrage", amount) end } } })
	if #st.news > 0 then
		local nc = W.card(parent, { title = S.inv.log })
		for i = #st.news, math.max(1, #st.news - 6), -1 do
			local n = st.news[i]
			W.note(nc, S.news[n.kind] .. " · " .. S.assets[n.asset] .. " · " .. W.fmt(n.amount), (n.kind == "startup-krach" or n.kind == "order-failed") and T.color.red or T.color.teal)
		end
	end
end

-- ───────── hustle ─────────
function Screens.hustle(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.hu.title })
	W.note(card, S.hu.hint)
	for _, h in ipairs(C.HUSTLES) do
		local slot = st.hustle[h.id]
		if not slot then
			local g = L.hustleGate(st, h.id)
			local reason = (not g.ok) and firstReason(S, g) or nil
			W.row(card, { title = S.hustles[h.id], sub = S.f(S.hu.stake, { n = W.fmt(h.cost) }) .. " · " .. S.f(S.hu.experience, { a = st.knowledge[h.id] or 0, b = C.HUSTLE_MAX_EXPERIENCE }) .. " · " .. S.f(S.hu.needEdu, { n = h.edu }), extra = reason and ("⛔ " .. reason) or nil, cw = ctx.cw,
				actions = { { text = S.hu.start, variant = "good", reason = reason, onClick = function() ctx.act("startHustle", h.id, h.cost) end } } })
		else
			local c = W.card(parent, { title = S.hustles[h.id], accent = T.color.magenta, right = S.f(S.hu.round, { a = slot.round + 1, b = C.HUSTLE_PHASES }) })
			W.note(c, S.f(S.hu.value, { n = W.fmt(slot.value) }) .. " · " .. S.f(S.hu.stake, { n = W.fmt(slot.stake) }), T.color.text)
			if L.hustleDue(slot, h.id, now) then
				local hint = L.hustleHint(slot, h.id, st.knowledge[h.id] or 0)
				if hint ~= nil then W.note(c, hint and S.hu.hintUp or S.hu.hintDown, T.color.line) end
				for _, ch in ipairs(L.hustleChoices(slot, h.id)) do
					W.row(c, { title = (ch.event and (S.hu.opportunity .. " ★ ") or "") .. S.f(S.hu.option, { n = ch.index }), sub = S.f(S.hu.range, { lo = W.dec(ch.lo), hi = W.dec(ch.hi) }) .. " · " .. S.f(S.hu.cost, { n = math.round(ch.cost * 100) }), cw = ctx.cw,
						actions = { { text = S.work.choose, variant = ch.event and "select" or "primary", onClick = function() ctx.act("decideHustle", h.id, ch.index) end } } })
				end
			else
				W.note(c, S.f(S.hu.opens, { n = W.dur(L.hustleRoundAt(slot, h.id, slot.round) - now) }), T.color.amber)
			end
			local amt = math.max(1, math.floor(h.cost / 2))
			W.row(c, { title = S.f(S.hu.topUp, { n = W.fmt(amt) }), cw = ctx.cw, actions = { { text = "+", w = 56, variant = "ghost", reason = (st.cash < amt) and S.err["not-enough-cash"] or nil, onClick = function() ctx.act("topUpHustle", h.id, amt) end } } })
		end
	end
end

-- ───────── board ─────────
function Screens.board(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.board.title })
	W.note(card, S.f(S.board.best, { n = W.fmt(st.best) }) .. " · " .. S.f(S.board.runs, { n = st.runs }))
	local data = ctx.ui.board
	if not data or #data == 0 then W.note(card, S.board.empty) return end
	local rows = {}
	for _, e in ipairs(data) do table.insert(rows, { "#" .. e.rank, e.name, W.fmt(e.value) }) end
	W.table(card, { S.board.rank, "", S.board.record }, rows, ctx.cw)
end

-- ───────── device shop ─────────
local function reqLines(ctx, d)
	local st, now, L, C, S, W = init(ctx)
	local out = {}
	local req = d.req
	if req.shifts then table.insert(out, { text = S.f(S.reason.shifts, { have = st.stats.shifts or 0, need = req.shifts }), ok = (st.stats.shifts or 0) >= req.shifts }) end
	if req.edu then table.insert(out, { text = S.f(S.reason.edu, { have = st.edu, need = req.edu }), ok = st.edu >= req.edu }) end
	if req.netWorth then local nw = L.netWorth(st, now); table.insert(out, { text = S.f(S.reason.netWorth, { have = W.fmt(nw), need = W.fmt(req.netWorth) }), ok = nw >= req.netWorth }) end
	if req.companies then
		local n = 0
		for _, c in ipairs(C.COMPANIES) do n += st.companies[c.id] or 0 end
		table.insert(out, { text = S.f(S.reason.companies, { have = n, need = req.companies }), ok = n >= req.companies })
	end
	return out
end

function Screens.device(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.deviceUi.title })
	W.note(card, S.deviceUi.note)
	for tier, d in ipairs(C.DEVICES) do
		local info = S.devices[d.id]
		local owned = tier <= st.device
		local isNext = tier == st.device + 1
		local c = W.card(parent, { title = info.name .. " · " .. info.tag, accent = owned and T.color.teal or (isNext and T.color.magenta or T.color.lineDim), right = owned and ("✓ " .. S.deviceUi.owned) or W.fmt(d.price) })
		W.note(c, info.desc, T.color.text)
		W.note(c, S.deviceUi.benefits .. ":", T.color.line)
		local order = { "splitView", "watchlist", "upcoming", "compare", "savedViews", "quickActions", "pinnedCards", "history", "alerts" }
		local limitFor = { watchlist = d.limits.watch, savedViews = d.limits.views, pinnedCards = d.limits.pins }
		local any = false
		for _, k in ipairs(order) do
			if d.features[k] then
				local prev = C.DEVICES[tier - 1]
				if not (prev and prev.features[k]) or limitFor[k] ~= nil and prev and limitFor[k] ~= ({ watchlist = prev.limits.watch, savedViews = prev.limits.views, pinnedCards = prev.limits.pins })[k] then
					any = true
					W.note(c, "• " .. S.f(S.deviceFeatures[k], { n = limitFor[k] }), T.color.text)
				end
			end
		end
		if not any and tier == 1 then W.note(c, "• " .. S.devices.phone.tag, T.color.text) end
		if isNext then
			W.note(c, S.deviceUi.requirements .. ":", T.color.line)
			for _, r in ipairs(reqLines(ctx, d)) do W.note(c, (r.ok and "✓ " or "✗ ") .. r.text, r.ok and T.color.teal or T.color.amber) end
			local after = st.cash - d.price
			local days = after / math.max(1, L.livingCost(st) * 24)
			W.note(c, S.f(S.deviceUi.afterLine, { a = S.ui.cash, b = W.fmt(st.cash), c = W.fmt(after), d = W.dec(math.max(0, days), 1) }), after < 0 and T.color.red or T.color.text)
			local g = L.deviceGate(st, tier, now)
			local reason = (not g.ok) and firstReason(S, g) or nil
			W.row(c, { title = S.f(S.deviceUi.buy, { n = W.fmt(d.price) }), cw = ctx.cw,
				actions = { { text = S.ui.buy, variant = "good", reason = reason, onClick = function()
					W.modal(S.deviceUi.title, S.f(S.deviceUi.confirm, { name = info.name, price = W.fmt(d.price), cash = S.ui.cash, before = W.fmt(st.cash), after = W.fmt(st.cash - d.price) }), {
						{ text = S.ui.no, variant = "ghost" },
						{ text = S.ui.buy, variant = "good", onClick = function() ctx.act("buyDevice", tier) end },
					})
				end } } })
		end
	end
end

-- ───────── compare workspace (laptop+) ─────────
local function cmpItems(ctx, kind)
	local st, now, L, C, S, W = init(ctx)
	local out = {}
	if kind == "jobs" then
		for _, j in ipairs(C.JOBS) do table.insert(out, { id = j.id, name = S.jobs[j.id] }) end
	elseif kind == "companies" then
		for _, c in ipairs(C.COMPANIES) do table.insert(out, { id = c.id, name = S.companies[c.id] }) end
	else
		for _, a in ipairs(C.ASSETS) do table.insert(out, { id = a.id, name = S.assets[a.id] }) end
	end
	return out
end

function Screens.compare(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local ui = ctx.ui
	local card = W.card(parent, { title = S.cmp.title })
	W.note(card, S.cmp.hint)
	W.segmented(card, { { id = "jobs", text = S.cmp.jobs }, { id = "companies", text = S.cmp.companies }, { id = "assets", text = S.cmp.assets } }, ui.cmpKind, function(id)
		ui.cmpKind = id; ui.cmpSel = {}; ctx.rerender()
	end)
	local kind = ui.cmpKind
	local sel = ui.cmpSel
	local function selected(id) for _, v in ipairs(sel) do if v == id then return true end end return false end
	if #sel == 0 then W.note(card, S.cmp.pick) end
	if #sel > 0 then
		local headers = { S.cmp.metric }
		local rows = {}
		local function add(label, fn) local r = { label }; for _, id in ipairs(sel) do table.insert(r, fn(id)) end; table.insert(rows, r) end
		for _, id in ipairs(sel) do table.insert(headers, (kind == "jobs" and S.jobs[id]) or (kind == "companies" and S.companies[id]) or S.assets[id]) end
		if kind == "jobs" then
			add(S.cmp.salaryCol, function(id) return W.fmt(C.JOB_BY_ID[id].salary) end)
			add(S.cmp.feeCol, function(id) return W.fmt(C.JOB_BY_ID[id].fee) end)
			add(S.cmp.eduCol, function(id) return C.JOB_BY_ID[id].edu end)
			add(S.cmp.netPay, function(id) local ch = st.character; return W.fmt(C.JOB_BY_ID[id].salary * C.COUNTRY_DEF[ch.country].salary * C.CITY_DEF[ch.city].salary * (1 - C.PERSONAL_TAX)) end)
			add(S.ui.locked, function(id) return (st.edu >= C.JOB_BY_ID[id].edu) and "✓" or "✗" end)
		elseif kind == "companies" then
			add(S.cmp.priceCol, function(id) return W.fmt(L.companyPrice(st, id)) end)
			add(S.cmp.paybackCol, function(id) return W.dec(C.COMPANY_BY_ID[id].payback, 1) end)
			add(S.cmp.incomeCol, function(id) return W.fmt(L.companyIncome(id)) end)
			add(S.ui.owned, function(id) return st.companies[id] or 0 end)
			add(S.ui.locked, function(id) return L.isLocked(st, "company", id) and "✗" or "✓" end)
		else
			add(S.cmp.priceCol, function(id) return W.fmt(L.assetPrice(id, now, st.startedAt)) end)
			add(S.cmp.yieldCol, function(id) return W.dec(C.ASSET_BY_ID[id].yield * 100, 1) .. " %" end)
			add(S.cmp.driftCol, function(id) return W.dec(C.ASSET_BY_ID[id].drift * 100, 1) .. " %" end)
			add(S.cmp.volCol, function(id) return "±" .. W.dec(C.ASSET_BY_ID[id].vol * 100, 0) .. " %" end)
			add(S.ui.owned, function(id) return W.dec(st.holdings[id] or 0, 2) end)
		end
		W.table(card, headers, rows, ctx.cw)
	end
	local lc = W.card(parent, {})
	for _, it in ipairs(cmpItems(ctx, kind)) do
		local on = selected(it.id)
		W.row(lc, { title = it.name, selected = on, cw = ctx.cw, actions = { { text = on and S.cmp.remove or S.cmp.add, variant = on and "danger" or "primary", reason = (not on and #sel >= 3) and S.err.max or nil, onClick = function()
			if on then for i, v in ipairs(sel) do if v == it.id then table.remove(sel, i) break end end else table.insert(sel, it.id) end
			ctx.rerender()
		end } } })
	end
end

-- ───────── history (PC) ─────────
function Screens.history(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.hist.title })
	local w, p = {}, {}
	for _, h in ipairs(st.history) do table.insert(w, h.w); table.insert(p, h.p) end
	W.note(card, S.hist.worth, T.color.line)
	local _, lo, hi = W.chart(card, w, T.color.teal, 110, { none = S.hist.none })
	if lo then W.note(card, S.f(S.hist.minLabel, { n = W.fmt(lo) }) .. " · " .. S.f(S.hist.maxLabel, { n = W.fmt(hi) }) .. " · " .. S.f(S.hist.nowLabel, { n = W.fmt(L.netWorth(st, now)) })) end
	W.note(card, S.hist.portfolio, T.color.line)
	W.chart(card, p, T.color.line, 80, { none = S.hist.none })
	local nc = W.card(parent, { title = S.hist.log })
	if #st.news == 0 then W.note(nc, S.hist.none) end
	for i = #st.news, 1, -1 do
		local n = st.news[i]
		W.note(nc, S.news[n.kind] .. " · " .. S.assets[n.asset] .. " · " .. W.fmt(n.amount), (n.kind == "startup-krach" or n.kind == "order-failed") and T.color.red or T.color.teal)
	end
	local dc = W.card(parent, { title = S.hist.devices })
	if #st.deviceLog == 0 then W.note(dc, S.devices.phone.name .. " · " .. S.ui.free) end
	for _, d in ipairs(st.deviceLog) do W.note(dc, S.devices[C.DEVICES[d.tier].id].name .. " · " .. W.fmt(d.price)) end
end

-- ───────── side panels (iPad+) ─────────
function Screens.panel.watch(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.watch, right = #st.watch .. "/" .. C.DEVICES[st.device].limits.watch })
	if #st.watch == 0 then W.note(card, S.panel.noWatch) end
	for _, id in ipairs(st.watch) do assetRow(ctx, card, C.ASSET_BY_ID[id], { compact = true }) end
end

local function dur(ctx, ms) return ctx.W.dur(ms) end
function Screens.panel.upcoming(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.upcoming })
	local list = L.upcoming(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for i, u in ipairs(list) do
		if i > 6 then break end
		local text
		if u.kind == "need" then text = (u.inMs <= 0) and S.f(S.panel.needNow, { name = S.needs[u.id].name }) or S.f(S.panel.needIn, { name = S.needs[u.id].name, t = dur(ctx, u.inMs) })
		else text = S.f(S.panel.stockIn, { name = S.companies[u.id], t = dur(ctx, u.inMs) }) end
		W.note(card, text .. " · " .. W.fmt(u.amount), (u.inMs <= 0) and T.color.red or T.color.text)
	end
end

function Screens.panel.projects(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.projects })
	local list = L.projects(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for _, p in ipairs(list) do
		if p.kind == "shift" then W.note(card, S.f(S.panel.shiftActive, { n = p.step + 1 }), T.color.text)
		elseif p.kind == "hustle" then
			W.note(card, p.due and S.f(S.panel.hustleDue, { name = S.hustles[p.id] }) or S.f(S.panel.hustleIn, { name = S.hustles[p.id], t = dur(ctx, p.inMs) }), p.due and T.color.amber or T.color.text)
		else
			local o = p.order
			W.note(card, S.f(S.panel.orderLine, { side = S.sides[o.side], name = S.assets[o.asset], price = S.sides[o.when] .. " " .. W.fmt(o.price) }))
		end
	end
end

function Screens.panel.alerts(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local card = W.card(parent, { title = S.panel.alerts })
	local list = L.alerts(st, now)
	if #list == 0 then W.note(card, S.panel.empty) end
	for _, a in ipairs(list) do
		local color = (a.level == "bad") and T.color.red or ((a.level == "warn") and T.color.amber or T.color.teal)
		local name = a.id and (S.needs[a.id] and S.needs[a.id].name or S.companies[a.id] or S.assets[a.id]) or ""
		local text
		if a.code == "distress" then text = S.f(S.alerts.distress, { t = dur(ctx, a.ms) })
		elseif a.code == "event" then text = S.f(S.alerts.event, { name = S.events[a.event], co = S.companies[a.id] })
		else text = S.f(S.alerts[a.code], { name = name }) end
		W.note(card, "● " .. text, color)
	end
end

-- Pinned cards (PC): configurable list stored on the server (validated against device limits)
function Screens.pin.cash(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.cash, value = W.fmt(ctx.state.cash), color = T.color.teal }) end
function Screens.pin.netWorth(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.netWorth, value = W.fmt(ctx.L.netWorth(ctx.state, ctx.now)), color = T.color.line }) end
function Screens.pin.income(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; local r = ctx.L.rates(ctx.state, ctx.now); W.stat(p, { label = S.ui.income, value = W.fmt(r.net), color = r.net >= 0 and T.color.teal or T.color.red }) end
function Screens.pin.energy(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.ui.energy, value = math.floor(ctx.state.energy) .. "/100", color = ctx.state.energy < 30 and T.color.red or T.color.teal }) end
function Screens.pin.needs(ctx, p)
	local W, S, T, C = ctx.W, ctx.S, ctx.T, ctx.C
	local empty = 0
	local minDays = math.huge
	for _, id in ipairs(C.NEEDS) do if ctx.state.needs[id] <= 0 then empty += 1 end; minDays = math.min(minDays, ctx.state.needs[id]) end
	W.stat(p, { label = S.preset.needs, value = empty > 0 and (empty .. " " .. S.needsUi.empty) or W.dec(minDays, 1) .. " d", color = empty > 0 and T.color.red or T.color.teal })
end
function Screens.pin.companies(ctx, p)
	local W, S, T, C, L = ctx.W, ctx.S, ctx.T, ctx.C, ctx.L
	local n, profit = 0, 0
	for _, c in ipairs(C.COMPANIES) do
		local k = ctx.state.companies[c.id] or 0
		if k > 0 then n += k; local y = L.companyYield(ctx.state, c.id, ctx.now); profit += y.gross - y.costs end
	end
	W.stat(p, { label = S.preset.companies, value = tostring(n), sub = W.fmt(profit) .. " / rok", color = T.color.line })
end
function Screens.pin.portfolio(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.preset.portfolio, value = W.fmt(ctx.L.portfolioValue(ctx.state, ctx.now)), color = T.color.line }) end
function Screens.pin.projects(ctx, p) local W, S, T = ctx.W, ctx.S, ctx.T; W.stat(p, { label = S.preset.projects, value = tostring(#ctx.L.projects(ctx.state, ctx.now)), color = T.color.amber }) end
function Screens.pin.hustle(ctx, p)
	local W, S, T = ctx.W, ctx.S, ctx.T
	local due = 0
	for id, slot in pairs(ctx.state.hustle) do if ctx.L.hustleDue(slot, id, ctx.now) then due += 1 end end
	W.stat(p, { label = S.preset.hustle, value = tostring(due), sub = "čeká", color = due > 0 and T.color.amber or T.color.muted })
end
function Screens.pin.events(ctx, p)
	local W, S, T = ctx.W, ctx.S, ctx.T
	local ev = ctx.L.currentEvent(ctx.now)
	W.stat(p, { label = S.preset.events, value = ev and S.events[ev.def.id] or "—", color = ev and (ev.def.mult < 1 and T.color.red or T.color.teal) or T.color.muted, ts = 16 })
end

function Screens.panel.pinned(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local limit = C.DEVICES[st.device].limits.pins
	local card = W.card(parent, { title = S.panel.pinned, right = #st.pins .. "/" .. limit })
	local flow = W.flow(card)
	local w = math.floor((ctx.sideW or ctx.cw) / 2) - 18
	for i, id in ipairs(st.pins) do
		local holder = W.new("Frame", { Size = UDim2.fromOffset(math.max(120, w), 62), BackgroundTransparency = 1, LayoutOrder = i }, flow)
		local inner = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1 }, holder)
		W.new("UIListLayout", {}, inner)
		if Screens.pin[id] then Screens.pin[id](ctx, inner) end
	end
	if #st.pins == 0 then W.note(card, S.panel.empty) end
	W.button(card, { text = ctx.ui.pinEdit and S.ui.done or S.ui.edit, variant = ctx.ui.pinEdit and "select" or "ghost", w = 100, onClick = function() ctx.ui.pinEdit = not ctx.ui.pinEdit; ctx.rerender() end })
	if ctx.ui.pinEdit then
		local fl = W.flow(card)
		for i, id in ipairs(C.PIN_CARDS) do
			local on = false
			for _, v in ipairs(st.pins) do if v == id then on = true end end
			W.button(fl, { text = S.preset[id], variant = on and "select" or "ghost", w = 110, order = i, onClick = function()
				local list = {}
				for _, v in ipairs(st.pins) do if v ~= id then table.insert(list, v) end end
				if not on then table.insert(list, id) end
				ctx.act("setPins", list)
			end })
		end
	end
end

-- Compact toolbar (laptop+): quick actions on the left, saved views on the right. Horizontal scroll, never clips.
function Screens.toolbar(ctx, parent)
	local st, now, L, C, S, W, T = init(ctx)
	local feat = ctx.feat
	local n = 0
	local function nextN() n += 1 return n end
	local function tag(text)
		local l = W.label(parent, { text = W.upper(text), size = UDim2.fromOffset(8 + #text * 7, ctx.m.btnH), ts = 11, font = T.font.head, color = T.color.muted, wrap = false, align = Enum.TextXAlignment.Center })
		l.LayoutOrder = nextN()
	end
	if feat.quickActions then
		tag(S.quick.title)
		local shiftReason
		if not st.job then shiftReason = S.err["no-job"]
		elseif st.shift then shiftReason = nil
		elseif st.sickUntil > now then shiftReason = S.err.sick
		elseif now < st.shiftReadyAt then shiftReason = S.f(S.work.cooldown, { n = W.dur(st.shiftReadyAt - now) })
		elseif st.energy < C.SHIFT_MIN_ENERGY then shiftReason = S.err["low-energy"] end
		local fx = L.needsEffects(st, now)
		W.button(parent, { text = st.shift and S.work.choose or S.quick.shift, variant = "good", w = 100, order = nextN(), reason = shiftReason, onClick = function()
			if st.shift then ctx.go("work") else ctx.act("startShift", fx.noShift) end
		end })
		W.button(parent, { text = S.quick.rest, variant = "ghost", w = 110, order = nextN(), reason = (now < st.restReadyAt) and S.err.cooldown or nil, onClick = function() ctx.act("rest") end })
		W.button(parent, { text = S.quick.food, variant = "primary", w = 100, order = nextN(), reason = (st.needs.food >= C.MAX_NEED_DAYS - 1e-9) and S.err.max or nil, onClick = function() ctx.act("buyNeed", "food", 1) end })
		W.button(parent, { text = S.quick.sellAll, variant = "ghost", w = 130, order = nextN(), onClick = function() ctx.go("invest") end })
	end
	if feat.savedViews then
		local limit = C.DEVICES[st.device].limits.views
		tag(S.views.title .. " " .. #st.views .. "/" .. limit)
		for i, v in ipairs(st.views) do
			W.button(parent, { text = v.name, variant = "primary", w = math.max(90, 16 + #v.name * 7), order = nextN(), onClick = function() ctx.ui.filter[v.tab] = v.filter; ctx.go(v.tab) end })
			W.button(parent, { text = "×", variant = "danger", w = 34, order = nextN(), onClick = function() ctx.act("deleteView", i) end })
		end
		W.button(parent, { text = S.views.save, variant = "good", w = 140, order = nextN(), reason = (#st.views >= limit) and S.f(S.views.limit, { n = limit }) or nil, onClick = function()
			ctx.act("saveView", S.f(S.views.name, { n = #st.views + 1 }) .. " · " .. S.nav[ctx.ui.tab], { tab = ctx.ui.tab, filter = ctx.ui.filter[ctx.ui.tab] or "" })
		end })
	end
end

return Screens
]==])
print("Ekonomika installed. Enable Studio Access to API Services (Game Settings > Security), then press Play.")
