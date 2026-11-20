local RS=game:GetService("ReplicatedStorage")
local SSS=game:GetService("ServerScriptService")
local SPS=game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")
local function clear(p,n) local o=p:FindFirstChild(n) if o then o:Destroy() end end
clear(RS,"Economy") clear(SSS,"EconomyService") clear(SPS,"EconomyUI")
local econ=Instance.new("Folder") econ.Name="Economy" econ.Parent=RS
local parents={econ=econ,sss=SSS,sps=SPS}
local function add(name,class,parent,src)
	local s=Instance.new(class) s.Name=name s.Source=src s.Parent=parents[parent]
end
add("Config","ModuleScript","econ",[==[
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

return C
]==])
add("Logic","ModuleScript","econ",[==[
--!nonstrict
-- Pure game logic (no Roblox services). Runs on the server (authoritative) and on the client (live cash counter).
-- Every action mutates `state` in place and returns (true, info) or (false, errorCode).
local C = require(script.Parent.Config)
local H = C.H
local L = {}

-- ───────── deterministic hash (FNV-1a + murmur3 fmix32), 32-bit safe in Luau doubles ─────────
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

local function clamp(v, lo, hi) return math.min(hi, math.max(lo, v)) end
local function contains(list, v)
	for _, x in ipairs(list) do if x == v then return true end end
	return false
end
local function fail(code) return false, code end

-- ───────── state ─────────
function L.emptyNeeds()
	local n = {}
	for _, id in ipairs(C.NEEDS) do n[id] = 0 end
	return n
end

function L.newState(now, runs, best)
	return {
		v = 1, character = nil, cash = 0, totalEarned = 0, peak = 0, best = best or 0, runs = runs or 0,
		startedAt = now, lastSeen = now, job = nil, energy = C.ENERGY_MAX, edu = 0, eduPoints = 0,
		needs = L.emptyNeeds(), shift = nil, shiftReadyAt = 0, restReadyAt = 0, sickUntil = 0,
		dayPay = 0, bonusAt = now, raises = {}, raiseReadyAt = 0,
		companies = {}, setup = {}, phase = 1, holdings = {}, cost = {}, hustle = {}, knowledge = {},
		distressAt = 0, bankruptcies = 0, lastBankruptId = nil, lastBankruptAt = 0,
		news = {}, startupRound = {},
	}
end

function L.defaultSetup()
	return {
		upgraded = false, staff = 0, roles = { producer = 0, seller = 0, accountant = 0, manager = 0 },
		rookieUntil = 0, price = 1, output = 1, risk = 0.3, stock = 0,
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
function L.needsEffects(state)
	local n = state.needs
	local function empty(id) return n[id] <= 0 end
	return {
		income = empty("clothing") and C.CLOTHING_INCOME or 1,
		energyRegen = (empty("food") and C.FOOD_REGEN or 1) * (empty("leisure") and C.LEISURE_REGEN or 1),
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
function L.companyPrice(state, id)
	local mult = state.character and C.FAMILY_DEF[state.character.family].company or 1
	return math.round(C.COMPANY_BY_ID[id].cost * mult * C.COMPANY_GROWTH ^ (state.companies[id] or 0))
end
local function familyCompany(state) return state.character and C.FAMILY_DEF[state.character.family].company or 1 end
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

local function payroll(roles)
	local sum = 0
	for _, k in ipairs(C.STAFF_ROLES) do sum += (roles[k] or 0) * C.ROLE_WAGE[k] end
	return sum * C.STAFF_BASE_WAGE
end

local function eventEffect(state, id, now)
	local ev = L.currentEvent(now)
	if not ev or not eventAffects(ev.def, id) then return 1, 1 end
	local s = setupOf(state, id)
	local exposure = (0.3 + 1.5 * s.risk) * s.price
	local d = ev.def
	local mult
	if d.mult < 1 then mult = math.max(0.05, 1 - (1 - d.mult) * exposure)
	else mult = 1 + (d.mult - 1) * exposure end
	return mult, d.wageMult
end

function L.companyYield(state, id, now)
	local n = state.companies[id] or 0
	if n <= 0 then return { gross = 0, costs = 0 } end
	local s = setupOf(state, id)
	local effMult, wageMult = eventEffect(state, id, now)
	local base = n * L.companyIncome(id)
	local r = s.roles
	local rookie = now < s.rookieUntil and C.ROOKIE_FACTOR or 1
	local sick = (r.producer > 0 and hash32(`sick:{id}:{eventWindow(now)}`) < C.STAFF_SICK_CHANCE) and 1 or 0
	local producers = math.max(0, r.producer - sick)
	local staffRevenue = producers * rookie * C.STAFF_REVENUE + r.seller * rookie * C.SELLER_REVENUE
	local boost = (s.upgraded and 1 + C.UPGRADE_BONUS or 1) * s.price * s.output * (0.85 + 0.6 * s.risk)
		* (r.manager > 0 and 1 + C.MANAGER_BONUS or 1) * effMult
	local stocked = s.stock > 0 and 1 or C.NO_STOCK_OUTPUT
	local gross = (base * boost + staffRevenue) * stocked
	local upkeep = math.max(0, (s.output - 0.5) * 0.5)
	return { gross = gross, costs = base * (upkeep + C.OPEX_SHARE) + payroll(r) * wageMult }
end

-- ───────── jobs & rates ─────────
function L.eduBonus(edu) return math.min(C.MAX_EDU, math.max(0, edu)) * C.EDU_BONUS_PER_LEVEL end
function L.eduCost(edu) return 5 + edu * 6 end
function L.jobHourly(state)
	local job, ch = state.job, state.character
	if not job or not ch then return 0 end
	return C.JOB_BY_ID[job.id].salary * (1 + C.JOB_RANK_BONUS * (job.rank - 1)) * C.COUNTRY_DEF[ch.country].salary
		* C.CITY_DEF[ch.city].salary * (state.raises[job.id] or 1)
end

function L.rates(state, now)
	local ch = state.character
	if not ch then return { salary = 0, companies = 0, passive = 0, living = 0, companyCosts = 0, multiplier = 1, net = 0, dividends = 0 } end
	local city = C.CITY_DEF[ch.city]
	local family = C.FAMILY_DEF[ch.family]
	local fx = L.needsEffects(state)
	local multiplier = (1 + L.eduBonus(state.edu)) * fx.income
	local salary = L.jobHourly(state) * C.PASSIVE_SHARE * (state.sickUntil > now and 0 or 1) * (1 - C.PERSONAL_TAX)

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

function L.netWorth(state, now)
	local total = state.cash
	for _, a in ipairs(C.ASSETS) do total += (state.holdings[a.id] or 0) * L.assetPrice(a.id, now, state.startedAt) end
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
	state.bankruptcies += 1
	state.lastBankruptId = worst
	state.lastBankruptAt = now
end

local function withPeak(state, now)
	local worth = L.netWorth(state, now)
	state.peak = math.max(state.peak, worth)
	state.best = math.max(state.best, worth)
end

function L.settle(state, now)
	if not state.character then state.lastSeen = now return end
	local elapsed = math.min(math.max(0, now - state.lastSeen), C.MAX_OFFLINE_MIN * 60000)
	local hours = elapsed / H
	local prev = state.lastSeen
	state.lastSeen = now
	local fx = L.needsEffects(state)
	if elapsed > 0 then
		local rate = L.rates(state, prev + elapsed / 2)
		local gain = rate.net * hours
		state.cash += gain
		if gain > 0 then state.totalEarned += gain end
		state.energy = math.min(C.ENERGY_MAX * fx.energyCap,
			math.max(0, state.energy + C.ENERGY_PER_HOUR * hours * fx.energyRegen - fx.energyDrain * hours))
		for _, c in ipairs(C.COMPANIES) do
			local n, s = state.companies[c.id] or 0, state.setup[c.id]
			if s and n > 0 and s.stock > 0 then s.stock = math.max(0, s.stock - n * s.output * C.INPUT_RATE * hours) end
		end
		for _, id in ipairs(C.NEEDS) do state.needs[id] = math.max(0, state.needs[id] - hours / 24) end
		if fx.bills then state.cash -= L.needDaily(state, "housing") / 24 * hours end
		if eventWindow(now) ~= eventWindow(prev) then applyQuits(state, now) end
	end
	-- distress warning / bankruptcy
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
	withPeak(state, now)
end

-- ───────── actions ─────────
local function inList(list, v) return contains(list, v) end

function L.createCharacter(state, input, now)
	if state.character then return fail("has-character") end
	local name = L.cleanName(input.name)
	if name == "" or not inList(C.COUNTRIES, input.country) or not inList(C.CITIES, input.city)
		or not inList(C.ERAS, input.era) or not inList(C.FAMILIES, input.family) then return fail("bad-request") end
	local fresh = L.newState(now, state.runs, state.best)
	for k in pairs(state) do state[k] = nil end
	for k, v in pairs(fresh) do state[k] = v end
	state.character = { country = input.country, name = name, city = input.city, era = input.era, family = input.family }
	state.cash = math.round(C.FAMILY_DEF[input.family].start * C.ERA_DEF[input.era].start)
	state.peak = state.cash
	withPeak(state, now)
	return true
end

function L.restart(state, now)
	local fresh = L.newState(now, state.runs + 1, state.best)
	for k in pairs(state) do state[k] = nil end
	for k, v in pairs(fresh) do state[k] = v end
	return true
end

function L.buyNeed(state, id, days, now)
	if not state.character then return fail("no-character") end
	if not C.NEED_DEF[id] then return fail("bad-request") end
	if type(days) ~= "number" or days < 1 or days ~= math.floor(days) then return fail("bad-request") end
	local have = state.needs[id]
	local add = math.min(days, C.MAX_NEED_DAYS - have)
	if add <= 1e-9 then return fail("max") end
	state.cash -= math.round(L.needDaily(state, id) * add)
	state.needs[id] = have + add
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
	if now < state.shiftReadyAt then return fail("cooldown") end
	local noTransport = L.needsEffects(state).noShift
	if noTransport and not walk then return fail("no-transport") end
	local extra = (state.job.lead and C.LEAD_EXTRA_ENERGY or 0) + (noTransport and C.WALK_EXTRA_ENERGY or 0)
	if state.energy < C.SHIFT_MIN_ENERGY + extra then return fail("low-energy") end
	if rng() < C.SICK_CHANCE then
		state.sickUntil = now + (rng() < 0.5 and 1 or 2) * C.GAME_DAY
		return true, "sick"
	end
	state.energy -= extra
	state.shift = { startedAt = now, seed = math.floor(rng() * #C.SITUATIONS), step = 0, perfSum = 0, lead = state.job.lead }
	return true, "shift-started"
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
	if type(index) ~= "number" or index < 1 or index > 3 or index ~= math.floor(index) then return fail("bad-request") end
	local perf = L.situationAt(shift.seed, shift.step).perf[index]
	shift.step += 1
	shift.perfSum += perf
	state.energy -= C.SITUATION_ENERGY
	if shift.step < C.SITUATIONS_PER_SHIFT then return true, "shift-step" end

	local avg = shift.perfSum / C.SITUATIONS_PER_SHIFT
	local mult = 1 + L.eduBonus(state.edu)
	local pay = math.round(L.jobHourly(state) * (1 - C.PASSIVE_SHARE) * (1 / C.SHIFTS_PER_YEAR) * (1 - C.PERSONAL_TAX)
		* (0.7 + 0.6 * avg / C.PERF_MAX) * (shift.lead and C.LEAD_PAY or 1) * mult)
	local points = avg >= 70 and 10 or (avg >= 40 and 6 or 3)
	local job = state.job
	job.points += points
	table.insert(job.perfs, avg)
	while #job.perfs > 5 do table.remove(job.perfs, 1) end
	state.eduPoints += points -- shifts also feed learning points used for Education
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
		state.companies[id] = nil
		state.setup[id] = nil
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
	return true, money
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
	if type(amount) ~= "number" or amount < 1 or amount ~= math.floor(amount) then return fail("bad-request") end
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
	if not r or type(value) ~= "number" or value ~= value then return fail("bad-request") end
	local snapped = math.floor(value / r.step + 0.5) * r.step
	setupOf(state, id)[field] = clamp(tonumber(string.format("%.2f", snapped)), r.min, r.max)
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

-- Assets
function L.buyAsset(state, id, amount, now)
	if not state.character then return fail("no-character") end
	local def = C.ASSET_BY_ID[id]
	if not def then return fail("bad-request") end
	if type(amount) ~= "number" or amount <= 0 or amount ~= amount then return fail("bad-request") end
	if L.isLocked(state, "asset", id) then return fail("locked") end
	local money = math.min(amount, state.cash)
	if money < 1 then return fail("not-enough-cash") end
	local price = L.assetPrice(id, now, state.startedAt)
	local qty = money / price
	local have = state.holdings[id] or 0
	local avg = state.cost[id] or price
	state.cost[id] = (have * avg + money) / (have + qty)
	state.holdings[id] = have + qty
	state.cash -= money
	if have <= 0 and def.cat == "startups" then state.startupRound[id] = math.floor(now / C.STARTUP_ROUND_MS) end
	withPeak(state, now)
	return true
end

function L.sellAsset(state, id, share, now)
	if not state.character then return fail("no-character") end
	if not C.ASSET_BY_ID[id] then return fail("bad-request") end
	local have = state.holdings[id] or 0
	if have <= 0 then return fail("nothing") end
	share = (type(share) == "number" and share == share) and clamp(share, 0, 1) or 1
	if share <= 0 then return fail("bad-request") end
	local price = L.assetPrice(id, now, state.startedAt)
	local qty = have * share
	local money = qty * price
	local profit = money - qty * (state.cost[id] or price)
	if have - qty < 1e-9 then state.holdings[id] = nil; state.cost[id] = nil else state.holdings[id] = have - qty end
	state.cash += money
	state.totalEarned += math.max(0, profit)
	withPeak(state, now)
	return true, math.round(money)
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
	if type(stake) ~= "number" or stake < 1 or stake ~= math.floor(stake) then return fail("bad-request") end
	if state.cash < stake then return fail("not-enough-cash") end
	state.cash -= stake
	state.hustle[id] = { startedAt = now, value = stake, stake = stake, round = 0, seed = math.floor(rng() * 2 ^ 31),
		streak = 0, protected = false, log = {} }
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
	local quality = choice.lo + (choice.hi - choice.lo) * hustleRoll(slot.seed, slot.round, choice.index)
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

return L
]==])
add("EconomyService","Script","sss",[==[
--!nonstrict
-- Authoritative server: per-player state, DataStore saving, one RemoteFunction for all actions.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))

local STORE = DataStoreService:GetDataStore("EconomyGame_v1")
local TICK_SEC = 1
local SAVE_SEC = 60
local ACTION_MIN_GAP = 0.08 -- seconds, basic spam guard

local remotes = Instance.new("Folder")
remotes.Name = "EconomyRemotes"
remotes.Parent = ReplicatedStorage
local actionRF = Instance.new("RemoteFunction")
actionRF.Name = "Action"
actionRF.Parent = remotes
local stateRE = Instance.new("RemoteEvent")
stateRE.Name = "State"
stateRE.Parent = remotes

local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end

local states: { [Player]: any } = {}
local lastAction: { [Player]: number } = {}
local dirty: { [Player]: boolean } = {}

local function push(player)
	local st = states[player]
	if st then stateRE:FireClient(player, st, nowMs()) end
end

local function save(player)
	local st = states[player]
	if not st then return end
	local ok, err = pcall(function()
		STORE:SetAsync("p_" .. player.UserId, st)
	end)
	if not ok then warn("[Economy] save failed for", player.Name, err) end
	dirty[player] = false
end

Players.PlayerAdded:Connect(function(player)
	local ok, data = pcall(function() return STORE:GetAsync("p_" .. player.UserId) end)
	local now = nowMs()
	local st
	if ok and type(data) == "table" and data.v == 1 then
		st = data
		-- never trust negative gaps; settle caps offline gain to MAX_OFFLINE_MIN
		st.lastSeen = math.min(st.lastSeen or now, now)
	else
		st = L.newState(now, 0, 0)
	end
	states[player] = st
	L.settle(st, now)
	push(player)
end)

Players.PlayerRemoving:Connect(function(player)
	local st = states[player]
	if st then
		L.settle(st, nowMs())
		save(player)
	end
	states[player], lastAction[player], dirty[player] = nil, nil, nil
end)

game:BindToClose(function()
	if RunService:IsStudio() then return end
	for _, p in ipairs(Players:GetPlayers()) do save(p) end
end)

-- Action table: name -> function(state, now, ...) returning ok, info, extra
local actions = {
	createCharacter = function(st, now, input) return L.createCharacter(st, type(input) == "table" and input or {}, now) end,
	restart = function(st, now) return L.restart(st, now) end,
	buyNeed = function(st, now, id, days) return L.buyNeed(st, id, days, now) end,
	takeJob = function(st, now, id) return L.takeJob(st, id, now) end,
	quitJob = function(st, now) return L.quitJob(st, now) end,
	startShift = function(st, now, walk) return L.startShift(st, now, math.random, walk == true) end,
	chooseShift = function(st, now, idx) return L.chooseShift(st, idx, now) end,
	rest = function(st, now) return L.rest(st, now) end,
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
	upgradePhase = function(st, now) return L.upgradePhase(st, now) end,
	buyAsset = function(st, now, id, amount) return L.buyAsset(st, id, amount, now) end,
	sellAsset = function(st, now, id, share) return L.sellAsset(st, id, share, now) end,
	startHustle = function(st, now, id, stake) return L.startHustle(st, id, stake, now, math.random) end,
	decideHustle = function(st, now, id, opt) return L.decideHustle(st, id, opt, now) end,
}

actionRF.OnServerInvoke = function(player, name, ...)
	local st = states[player]
	local fn = actions[name]
	if not st or type(name) ~= "string" or not fn then return false, "bad-request" end
	local t = os.clock()
	if lastAction[player] and t - lastAction[player] < ACTION_MIN_GAP then return false, "cooldown" end
	lastAction[player] = t
	local now = nowMs()
	L.settle(st, now) -- always settle before acting
	local ok, info, extra = fn(st, now, ...)
	dirty[player] = true
	push(player)
	return ok, info, extra
end

-- Periodic settle + push + autosave
local acc, saveAcc = 0, 0
RunService.Heartbeat:Connect(function(dt)
	acc += dt
	saveAcc += dt
	if acc >= TICK_SEC then
		acc = 0
		local now = nowMs()
		for player, st in pairs(states) do
			L.settle(st, now)
			dirty[player] = true
			push(player)
		end
	end
	if saveAcc >= SAVE_SEC then
		saveAcc = 0
		for player in pairs(states) do
			if dirty[player] then task.spawn(save, player) end
		end
	end
end)
]==])
add("EconomyUI","LocalScript","sps",[==[
--!nonstrict
-- Client UI, fully built from code (no assets needed). Server pushes state every second;
-- the cash counter between pushes is projected locally with the shared Logic.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Economy = ReplicatedStorage:WaitForChild("Economy")
local C = require(Economy:WaitForChild("Config"))
local L = require(Economy:WaitForChild("Logic"))
local remotes = ReplicatedStorage:WaitForChild("EconomyRemotes")
local actionRF = remotes:WaitForChild("Action")
local stateRE = remotes:WaitForChild("State")

local player = Players.LocalPlayer
local state, offset = nil, 0 -- offset = serverNow - clientNow (ms)
local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end

-- ───────── formatting ─────────
local function fmt(n)
	local neg = n < 0
	n = math.abs(n)
	local s
	if n >= 1e12 then s = string.format("%.2fT", n / 1e12)
	elseif n >= 1e9 then s = string.format("%.2fB", n / 1e9)
	elseif n >= 1e6 then s = string.format("%.2fM", n / 1e6)
	elseif n >= 1e4 then s = string.format("%.1fk", n / 1e3)
	else s = string.format("%.0f", n) end
	return (neg and "-" or "") .. s
end
local function title(id) return (id:gsub("^%l", string.upper):gsub("_", " ")) end
local ERR = {
	["not-enough-cash"] = "Not enough cash.", ["not-enough-points"] = "Not enough points.", locked = "Locked (need Education / era).",
	max = "Already at max.", ["no-job"] = "You have no job.", busy = "Busy right now.", cooldown = "Cooldown, wait a bit.",
	["low-energy"] = "Too tired. Rest or buy food.", sick = "You are sick.", ["no-transport"] = "No transport! Buy transport.",
	["not-ready"] = "Not ready yet.", ["same-job"] = "You already have this job.", nothing = "Nothing to do.",
	["bad-request"] = "Invalid request.",
}
local EVT = {
	["shift-started"] = "Shift started.", ["shift-step"] = "Next situation.", ["shift-done"] = "Shift done!", sick = "You got sick!",
	promoted = "Promoted!", ["promo-rejected"] = "Promotion rejected. Retry in 1h.", raised = "Raise approved!",
	["raise-rejected"] = "Raise rejected.", warned = "Warning: bad performance!", fired = "You were fired!", rested = "Fully rested.",
	lost = "Hustle: you got scammed!", done = "Hustle finished!",
}

-- ───────── ui helpers ─────────
local gui = Instance.new("ScreenGui")
gui.Name = "EconomyGui"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Parent = player:WaitForChild("PlayerGui")

local BG, PANEL, ACCENT, TEXT, GOOD, BAD = Color3.fromRGB(18, 22, 30), Color3.fromRGB(30, 36, 48), Color3.fromRGB(70, 130, 255), Color3.fromRGB(235, 238, 245), Color3.fromRGB(80, 200, 120), Color3.fromRGB(235, 90, 90)

local function make(class, props, parent)
	local o = Instance.new(class)
	for k, v in pairs(props) do o[k] = v end
	o.Parent = parent
	return o
end
local function corner(o, r) make("UICorner", { CornerRadius = UDim.new(0, r or 8) }, o) end

local root = make("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = BG, BorderSizePixel = 0 }, gui)
local top = make("Frame", { Size = UDim2.new(1, 0, 0, 64), BackgroundColor3 = PANEL, BorderSizePixel = 0 }, root)
local cashLbl = make("TextLabel", { Size = UDim2.new(0.5, 0, 0, 34), Position = UDim2.fromOffset(12, 4), BackgroundTransparency = 1, TextColor3 = GOOD, Font = Enum.Font.GothamBold, TextSize = 26, TextXAlignment = Enum.TextXAlignment.Left, Text = "" }, top)
local subLbl = make("TextLabel", { Size = UDim2.new(1, -24, 0, 22), Position = UDim2.fromOffset(12, 38), BackgroundTransparency = 1, TextColor3 = TEXT, Font = Enum.Font.Gotham, TextSize = 14, TextXAlignment = Enum.TextXAlignment.Left, Text = "" }, top)
local eventLbl = make("TextLabel", { Size = UDim2.new(0.5, -12, 0, 34), Position = UDim2.new(0.5, 0, 0, 4), BackgroundTransparency = 1, TextColor3 = Color3.fromRGB(255, 200, 80), Font = Enum.Font.GothamMedium, TextSize = 14, TextXAlignment = Enum.TextXAlignment.Right, Text = "", TextWrapped = true }, top)

local tabBar = make("Frame", { Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromOffset(0, 64), BackgroundTransparency = 1 }, root)
make("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, tabBar)
make("UIPadding", { PaddingLeft = UDim.new(0, 8), PaddingTop = UDim.new(0, 4) }, tabBar)

local body = make("ScrollingFrame", { Size = UDim2.new(1, -16, 1, -150), Position = UDim2.fromOffset(8, 108), BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 6, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y }, root)
make("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, body)

local toast = make("TextLabel", { Size = UDim2.new(1, -16, 0, 30), Position = UDim2.new(0, 8, 1, -36), BackgroundColor3 = PANEL, TextColor3 = TEXT, Font = Enum.Font.GothamMedium, TextSize = 15, Text = "", Visible = false }, root)
corner(toast)
local toastId = 0
local function say(msg, bad)
	toastId += 1
	local id = toastId
	toast.Text = msg
	toast.TextColor3 = bad and BAD or GOOD
	toast.Visible = true
	task.delay(3, function() if toastId == id then toast.Visible = false end end)
end

local order = 0
local function row(height)
	order += 1
	local f = make("Frame", { Size = UDim2.new(1, 0, 0, height or 40), BackgroundColor3 = PANEL, LayoutOrder = order }, body)
	corner(f)
	return f
end
local function text(parent, str, size, color, pos, sz, align)
	return make("TextLabel", { Size = sz or UDim2.new(1, -16, 1, 0), Position = pos or UDim2.fromOffset(10, 0), BackgroundTransparency = 1, Text = str, TextColor3 = color or TEXT, Font = Enum.Font.Gotham, TextSize = size or 14, TextXAlignment = align or Enum.TextXAlignment.Left, TextWrapped = true }, parent)
end
local function header(str)
	order += 1
	make("TextLabel", { Size = UDim2.new(1, 0, 0, 26), BackgroundTransparency = 1, Text = str, TextColor3 = ACCENT, Font = Enum.Font.GothamBold, TextSize = 17, TextXAlignment = Enum.TextXAlignment.Left, LayoutOrder = order }, body)
end
local function btn(parent, str, pos, size, cb, color)
	local b = make("TextButton", { Size = size, Position = pos, BackgroundColor3 = color or ACCENT, Text = str, TextColor3 = Color3.new(1, 1, 1), Font = Enum.Font.GothamMedium, TextSize = 13, AutoButtonColor = true }, parent)
	corner(b, 6)
	b.Activated:Connect(cb)
	return b
end
local function info(str)
	local r = row(34)
	text(r, str, 14)
end

local function act(name, ...)
	local ok, i, extra = actionRF:InvokeServer(name, ...)
	if ok then
		if type(i) == "string" and EVT[i] then say(EVT[i] .. (extra and (" +" .. fmt(extra)) or "")) end
	else
		say(ERR[i] or tostring(i), true)
	end
	return ok
end
-- row with title/description on left and a button on right
local function item(titleStr, desc, btnText, cb, color, h)
	local r = row(h or 54)
	text(r, titleStr, 15, TEXT, UDim2.fromOffset(10, 4), UDim2.new(1, -150, 0, 20))
	text(r, desc, 12, Color3.fromRGB(160, 170, 190), UDim2.fromOffset(10, 24), UDim2.new(1, -150, 0, 28))
	if btnText then btn(r, btnText, UDim2.new(1, -134, 0.5, -16), UDim2.fromOffset(124, 32), cb, color) end
	return r
end

-- ───────── tabs ─────────
local tabs, current = {}, "Overview"
local render

local function tabOverview(now)
	local ch, r = state.character, L.rates(state, now)
	header("Character")
	info(`{ch.name} · {ch.country:upper()} · {title(ch.city)} · era {ch.era} · {title(ch.family)} family`)
	header("Income per game-year (1 real hour)")
	info(`Salary {fmt(r.salary)} · Companies {fmt(r.companies)} · Passive {fmt(r.passive)} · Costs -{fmt(r.companyCosts)} · NET {fmt(r.net)}`)
	info(`Multiplier x{string.format("%.2f", r.multiplier)} · Education {state.edu}/{C.MAX_EDU} · Learning points {state.eduPoints}`)
	item("Invest in Education", `+{C.EDU_BONUS_PER_LEVEL * 100}% to all income. Costs {L.eduCost(state.edu)} learning points (earned from shifts).`, "Study", function() act("investEdu") end)
	info(`Net worth {fmt(L.netWorth(state, now))} · Peak {fmt(state.peak)} · Best ever {fmt(state.best)} · Runs {state.runs} · Bankruptcies {state.bankruptcies}`)
	local danger, left = L.distressOf(state, now)
	if danger then item("⚠ BANKRUPTCY WARNING", `Cash can't cover company costs. {math.ceil(left / 3600000 * 60)} min left. Sell a unit, fire staff or lower output.`, nil, nil, BAD) end
	local ev = L.currentEvent(now)
	if ev then info("Event: " .. ev.def.name .. " (x" .. ev.def.mult .. " profit)") end
	local ae = L.currentAssetEvent(now)
	if ae then info("Market news: " .. ae.def.name) end
	if #state.news > 0 then
		header("Market log")
		for i = #state.news, math.max(1, #state.news - 4), -1 do
			local n = state.news[i]
			info(`{n.kind} · {title(n.asset)} · {fmt(n.amount)}`)
		end
	end
	item("Start over", "Wipe progress. Record and run count stay.", "Restart", function() act("restart") end, BAD)
end

local function tabWork(now)
	local job = state.job
	header("Job")
	if job then
		local def = C.JOB_BY_ID[job.id]
		local nextPts = C.RANK_POINTS[job.rank + 1]
		info(`{title(job.id)} · rank {job.rank}/{C.MAX_JOB_RANK} · points {job.points}{nextPts and ("/" .. nextPts) or ""} · pay {fmt(L.jobHourly(state))}/yr · energy {math.floor(state.energy)}/{C.ENERGY_MAX}`)
		if state.sickUntil > now then info("🤒 You are sick, no passive pay and no shifts.") end
		if state.shift then
			local sit = L.situationAt(state.shift.seed, state.shift.step)
			header(`Shift {state.shift.step + 1}/{C.SITUATIONS_PER_SHIFT}: {sit.text}`)
			for i, c in ipairs(sit.choices) do
				item(c, "", "Choose", function() act("chooseShift", i) end, nil, 40)
			end
		else
			local cd = math.max(0, math.ceil((state.shiftReadyAt - now) / 1000))
			item("Start shift", `3 decisions. Needs {C.SHIFT_MIN_ENERGY} energy. {cd > 0 and ("Cooldown " .. cd .. "s") or "Ready"}`, "Work", function()
				act("startShift", L.needsEffects(state).noShift)
			end)
			item("Rest", "Refill energy. Once per 6 game-hours.", "Rest", function() act("rest") end)
			item("Request promotion", "Needs points, Education and 2h at rank.", "Ask", function() act("requestPromotion") end)
			item("Negotiate raise", "Once per 7 days, chance by performance.", "Ask", function() act("negotiateRaise") end)
			if job.rank >= C.LEAD_MIN_RANK then
				item("Shift lead", "+5% pay, +10 energy cost.", job.lead and "Disable" or "Enable", function() act("setLead", not job.lead) end)
			end
			item("Quit job", "", "Quit", function() act("quitJob") end, BAD, 40)
		end
	else
		info("No job yet. Pick one below.")
	end
	if not state.shift then
		header("Available jobs")
		for _, j in ipairs(C.JOBS) do
			local locked = state.edu < j.edu
			item(title(j.id), `Salary {j.salary}/yr · fee {j.fee} · needs Education {j.edu}`, (job and job.id == j.id) and "Current" or (locked and "Locked" or "Take job"), function() act("takeJob", j.id) end, locked and Color3.fromRGB(90, 90, 100) or nil, 46)
		end
	end
end

local function tabNeeds(now)
	header("Daily needs (stock in days, max " .. C.MAX_NEED_DAYS .. ")")
	local fx = L.needsEffects(state)
	if fx.noShift then info("⚠ No transport: shifts only on foot (+15 energy).") end
	if fx.bills then info("⚠ Unpaid housing: you are fined every hour.") end
	for _, id in ipairs(C.NEEDS) do
		local have = state.needs[id]
		local r = row(54)
		text(r, title(id), 15, have <= 0 and BAD or TEXT, UDim2.fromOffset(10, 4), UDim2.new(0.4, 0, 0, 20))
		text(r, `{string.format("%.1f", have)} days · {fmt(L.needDaily(state, id))}/day`, 12, Color3.fromRGB(160, 170, 190), UDim2.fromOffset(10, 26), UDim2.new(0.45, 0, 0, 22))
		btn(r, "+1 day", UDim2.new(1, -190, 0.5, -16), UDim2.fromOffset(86, 32), function() act("buyNeed", id, 1) end)
		btn(r, "+7 days", UDim2.new(1, -96, 0.5, -16), UDim2.fromOffset(86, 32), function() act("buyNeed", id, C.MAX_NEED_DAYS) end)
	end
end

local selectedCompany
local function tabCompanies(now)
	local r = L.rates(state, now)
	header(`Companies · phase {state.phase}/{C.MAX_PHASE}`)
	info(`Revenue {fmt(r.companies)}/yr · costs {fmt(r.companyCosts)}/yr`)
	if state.phase < C.MAX_PHASE then
		local req, cost = L.phaseRequirement(state.phase + 1), L.phaseCost(state.phase + 1)
		item("Next phase", `Needs revenue {fmt(req)}/yr, costs {fmt(cost)}. Raises rent/tax, bigger stock.`, "Upgrade", function() act("upgradePhase") end)
	end
	for _, c in ipairs(C.COMPANIES) do
		local n = state.companies[c.id] or 0
		local locked = L.isLocked(state, "company", c.id)
		local y = L.companyYield(state, c.id, now)
		item(`{title(c.id)} x{n}`, `Price {fmt(L.companyPrice(state, c.id))} · profit {fmt(y.gross - y.costs)}/yr` .. (locked and " · LOCKED (era)" or ""), locked and "Locked" or "Buy", function() act("buyCompany", c.id) end, locked and Color3.fromRGB(90, 90, 100) or nil)
		if n > 0 then
			local s = L.setupOf(state, c.id)
			local d = row(120)
			text(d, `Staff {s.staff}/{n * C.MAX_STAFF_PER_UNIT} (P{s.roles.producer} S{s.roles.seller} A{s.roles.accountant} M{s.roles.manager}) · stock {string.format("%.1f", s.stock)}/{L.stockCapacity(n, state.phase)}{s.stock <= 0 and " ⚠ NO STOCK" or ""} · price x{s.price} output x{s.output} risk {s.risk}`, 12, TEXT, UDim2.fromOffset(8, 2), UDim2.new(1, -16, 0, 30))
			local x = 8
			local function mini(label, cb, w)
				btn(d, label, UDim2.fromOffset(x, 36), UDim2.fromOffset(w or 74, 28), cb)
				x += (w or 74) + 4
			end
			for _, role in ipairs(C.STAFF_ROLES) do mini("+" .. role:sub(1, 4), function() act("hireStaff", c.id, 1, role) end, 60) end
			mini("-staff", function() act("hireStaff", c.id, -1, "producer") end, 60)
			x = 8
			local function mini2(label, cb, w)
				btn(d, label, UDim2.fromOffset(x, 70), UDim2.fromOffset(w or 70, 28), cb, Color3.fromRGB(60, 90, 160))
				x += (w or 70) + 4
			end
			mini2("Stock x5", function() act("buyStock", c.id, 5) end)
			mini2("Price +", function() act("setCompanySetting", c.id, "price", s.price + 0.1) end, 56)
			mini2("Price -", function() act("setCompanySetting", c.id, "price", s.price - 0.1) end, 56)
			mini2("Out +", function() act("setCompanySetting", c.id, "output", s.output + 0.1) end, 50)
			mini2("Out -", function() act("setCompanySetting", c.id, "output", s.output - 0.1) end, 50)
			mini2("Risk +", function() act("setCompanySetting", c.id, "risk", s.risk + 0.1) end, 56)
			mini2("Risk -", function() act("setCompanySetting", c.id, "risk", s.risk - 0.1) end, 56)
			x = 8
			if not s.upgraded then mini2("Upgrade " .. fmt(L.upgradePrice(state, c.id)), function() act("upgradeCompany", c.id) end, 130) end
			btn(d, "Sell 1 for " .. fmt(L.sellPrice(state, c.id)), UDim2.new(1, -140, 0, 86), UDim2.fromOffset(130, 28), function() act("sellCompany", c.id) end, BAD)
		end
	end
end

local function tabInvest(now)
	header("Investments (prices move with time, news hit whole categories)")
	local ae = L.currentAssetEvent(now)
	if ae then info("📰 " .. ae.def.name .. " (x" .. ae.def.mult .. ")") end
	local cur
	for _, a in ipairs(C.ASSETS) do
		if a.cat ~= cur then cur = a.cat; header(title(a.cat)) end
		local price = L.assetPrice(a.id, now, state.startedAt)
		local have = state.holdings[a.id] or 0
		local locked = L.isLocked(state, "asset", a.id)
		local pl = ""
		if have > 0 then pl = ` · own {string.format("%.2f", have)} ({fmt(have * price)}, P/L {fmt(have * (price - (state.cost[a.id] or price)))})` end
		local r = row(54)
		text(r, `{title(a.id)} · {fmt(price)}`, 15, TEXT, UDim2.fromOffset(10, 4), UDim2.new(0.5, 0, 0, 20))
		text(r, `yield {string.format("%.1f", a.yield * 100)}%/yr{pl}{locked and " · LOCKED" or ""}`, 12, Color3.fromRGB(160, 170, 190), UDim2.fromOffset(10, 26), UDim2.new(0.55, 0, 0, 24))
		if not locked then
			btn(r, "Buy 10%", UDim2.new(1, -290, 0.5, -16), UDim2.fromOffset(70, 32), function() act("buyAsset", a.id, state.cash * 0.1) end)
			btn(r, "Buy all", UDim2.new(1, -216, 0.5, -16), UDim2.fromOffset(66, 32), function() act("buyAsset", a.id, state.cash) end)
			btn(r, "Sell ½", UDim2.new(1, -146, 0.5, -16), UDim2.fromOffset(66, 32), function() act("sellAsset", a.id, 0.5) end, Color3.fromRGB(150, 90, 40))
			btn(r, "Sell all", UDim2.new(1, -76, 0.5, -16), UDim2.fromOffset(66, 32), function() act("sellAsset", a.id, 1) end, BAD)
		end
	end
end

local function tabHustle(now)
	header("Hustles: 3 rounds of decisions, pick safe vs risky")
	for _, h in ipairs(C.HUSTLES) do
		local slot = state.hustle[h.id]
		local locked = state.edu < h.edu
		if not slot then
			item(title(h.id), `Stake {fmt(h.cost)} · needs Education {h.edu} · experience {state.knowledge[h.id] or 0}/{C.HUSTLE_MAX_EXPERIENCE}`, locked and "Locked" or "Start", function() act("startHustle", h.id, h.cost) end, locked and Color3.fromRGB(90, 90, 100) or nil)
		else
			local hdr = `{title(h.id)} · round {slot.round + 1}/{C.HUSTLE_PHASES} · value {fmt(slot.value)} (stake {fmt(slot.stake)})`
			if L.hustleDue(slot, h.id, now) then
				local hint = L.hustleHint(slot, h.id, state.knowledge[h.id] or 0)
				header(hdr .. (hint ~= nil and (hint and " · market hint ▲" or " · market hint ▼") or ""))
				for _, c in ipairs(L.hustleChoices(slot, h.id)) do
					item(`Option {c.index}{c.event and " ★ opportunity" or ""}`, `result x{string.format("%.2f", c.lo)}–x{string.format("%.2f", c.hi)} · cost {math.round(c.cost * 100)}% of stake`, "Choose", function() act("decideHustle", h.id, c.index) end, nil, 46)
				end
			else
				local left = math.max(0, math.ceil((L.hustleRoundAt(slot, h.id, slot.round) - now) / 1000))
				item(hdr, `Next decision opens in {left}s`, nil, nil)
			end
		end
	end
end

-- ───────── character creation ─────────
local pick = { country = "cz", city = "town", era = "2025", family = "middle", name = player.DisplayName }
local function tabCreate()
	header("Create your character")
	local r = row(40)
	text(r, "Name:", 14, TEXT, UDim2.fromOffset(10, 0), UDim2.fromOffset(60, 40))
	local box = make("TextBox", { Size = UDim2.new(1, -90, 0, 28), Position = UDim2.fromOffset(74, 6), BackgroundColor3 = BG, TextColor3 = TEXT, Text = pick.name, ClearTextOnFocus = false, Font = Enum.Font.Gotham, TextSize = 14 }, r)
	corner(box, 6)
	box.FocusLost:Connect(function() pick.name = box.Text end)
	local function chooser(label, key, list)
		local rr = row(72)
		text(rr, label, 13, Color3.fromRGB(160, 170, 190), UDim2.fromOffset(10, 2), UDim2.new(1, -16, 0, 18))
		local w = math.floor((rr.AbsoluteSize.X > 0 and rr.AbsoluteSize.X or 500) / #list) - 6
		for i, v in ipairs(list) do
			btn(rr, v, UDim2.new((i - 1) / #list, 6, 0, 26), UDim2.new(1 / #list, -6, 0, 38), function() pick[key] = v; render() end, pick[key] == v and ACCENT or Color3.fromRGB(55, 62, 80))
		end
	end
	chooser("Country (pay & living cost)", "country", C.COUNTRIES)
	chooser("City (salary / living / rent)", "city", C.CITIES)
	chooser("Era (start money, digital & crypto)", "era", C.ERAS)
	chooser("Family (start money: poor 20 · middle 120 · rich 2000 · business 800)", "family", C.FAMILIES)
	item("Start game", "Cannot change later (except full restart).", "Create", function() act("createCharacter", { name = box.Text, country = pick.country, city = pick.city, era = pick.era, family = pick.family }) end, GOOD)
end

tabs = {
	{ "Overview", tabOverview }, { "Work", tabWork }, { "Needs", tabNeeds },
	{ "Companies", tabCompanies }, { "Invest", tabInvest }, { "Hustle", tabHustle },
}
local tabButtons = {}
for i, t in ipairs(tabs) do
	local b = make("TextButton", { Size = UDim2.fromOffset(104, 32), BackgroundColor3 = PANEL, Text = t[1], TextColor3 = TEXT, Font = Enum.Font.GothamMedium, TextSize = 14, LayoutOrder = i }, tabBar)
	corner(b, 6)
	b.Activated:Connect(function() current = t[1]; render() end)
	tabButtons[t[1]] = b
end

function render()
	if not state then return end
	local scroll = body.CanvasPosition
	for _, c in ipairs(body:GetChildren()) do if not c:IsA("UIListLayout") then c:Destroy() end end
	order = 0
	tabBar.Visible = state.character ~= nil
	local now = nowMs()
	if not state.character then
		tabCreate()
	else
		for name, b in pairs(tabButtons) do b.BackgroundColor3 = (name == current) and ACCENT or PANEL end
		for _, t in ipairs(tabs) do if t[1] == current then t[2](now) end end
	end
	body.CanvasPosition = scroll
end

-- ───────── state sync ─────────
local lastRender = 0
stateRE.OnClientEvent:Connect(function(st, serverNow)
	state = st
	offset = serverNow - nowMs()
	render()
	lastRender = os.clock()
end)

-- live cash projection between pushes (server still authoritative)
RunService.RenderStepped:Connect(function()
	if not state then return end
	if not state.character then cashLbl.Text = "Economy"; subLbl.Text = "Create your character"; return end
	local now = nowMs()
	local r = L.rates(state, now)
	local dt = math.clamp(now - state.lastSeen, 0, C.MAX_OFFLINE_MIN * 60000) / C.H
	local cash = state.cash + r.net * dt
	cashLbl.Text = (cash < 0 and "-" or "") .. fmt(math.abs(cash)) .. " " .. "cr"
	cashLbl.TextColor3 = cash < 0 and BAD or GOOD
	subLbl.Text = `NET {fmt(r.net)}/yr · Energy {math.floor(state.energy)} · Worth {fmt(L.netWorth(state, now))} · Edu {state.edu}`
	local ev = L.currentEvent(now)
	eventLbl.Text = ev and ("⚡ " .. ev.def.name) or ""
end)
]==])
print("Economy installed. Enable API Services, then Play.")
