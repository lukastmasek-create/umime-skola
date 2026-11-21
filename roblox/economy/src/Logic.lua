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

function L.emptyStats()
	local t = {}
	for _, k in ipairs(C.STAT_KEYS) do t[k] = 0 end
	return t
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
		device = 1, deviceLog = {}, stats = L.emptyStats(), watch = {}, views = {}, pins = {},
		-- v3: milestones claimed (id -> true) and daily login streak
		milestones = {}, dailyAt = 0, dailyStreak = 0,
		-- v4: bank balances, daily missions, legacy points (kept across restarts)
		savings = 0, loan = 0, missions = { day = -1, list = {} }, legacy = 0,
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
	if type(raw.stats) ~= "table" then raw.stats = L.emptyStats() end
	raw.stats.shifts = isNum(raw.stats.shifts) and raw.stats.shifts or 0
	raw.stats.hustles = isNum(raw.stats.hustles) and raw.stats.hustles or 0
	if type(raw.milestones) ~= "table" then raw.milestones = {} end
	for id in pairs(raw.milestones) do if not C.MILESTONE_BY_ID[id] then raw.milestones[id] = nil end end
	raw.dailyAt = isNum(raw.dailyAt) and math.min(raw.dailyAt, now) or 0
	raw.dailyStreak = isNum(raw.dailyStreak) and clamp(math.floor(raw.dailyStreak), 0, C.DAILY_MAX_STREAK) or 0
	for _, k in ipairs(C.STAT_KEYS) do raw.stats[k] = isNum(raw.stats[k]) and raw.stats[k] or 0 end
	raw.savings = isNum(raw.savings) and math.max(0, raw.savings) or 0
	raw.loan = isNum(raw.loan) and math.max(0, raw.loan) or 0
	if not isNum(raw.legacy) then raw.legacy = ((raw.runs or 0) > 0) and L.legacyFor(raw.best or 0) or 0 end
	raw.legacy = clamp(math.floor(raw.legacy), 0, C.LEGACY_MAX)
	if type(raw.missions) ~= "table" or type(raw.missions.list) ~= "table" then raw.missions = { day = -1, list = {} } end
	for i = #raw.missions.list, 1, -1 do
		local m = raw.missions.list[i]
		if type(m) ~= "table" or not C.MISSION_BY_ID[m.id] or not isNum(m.base) or not isNum(m.target) then table.remove(raw.missions.list, i) end
	end
	for _, h in ipairs(raw.history) do h.c = isNum(h.c) and h.c or h.w; h.i = isNum(h.i) and h.i or 0 end
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
function L.unionPrice(state, id) return math.round(payroll(setupOf(state, id).roles) * C.UNION_DEAL_YEARS) end
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
	if not ch then return { salary = 0, companies = 0, passive = 0, living = 0, companyCosts = 0, multiplier = 1, net = 0, dividends = 0, savingsInterest = 0, loanInterest = 0, bank = 0 } end
	local city = C.CITY_DEF[ch.city]
	local family = C.FAMILY_DEF[ch.family]
	local fx = L.needsEffects(state, now)
	local multiplier = (1 + L.eduBonus(state.edu)) * fx.income * (1 + C.LEGACY_BONUS * (state.legacy or 0))
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
	-- bank interest is paid in cash every tick; it is not boosted by the income multiplier
	local savingsInterest = (state.savings or 0) * C.BANK_SAVINGS_RATE
	local loanInterest = (state.loan or 0) * C.BANK_LOAN_RATE
	return { salary = salary, companies = companies, passive = passive, living = living, companyCosts = costs,
		multiplier = multiplier, net = gross - costs + savingsInterest - loanInterest, dividends = dividends,
		savingsInterest = savingsInterest, loanInterest = loanInterest, bank = savingsInterest - loanInterest }
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
	total += (state.savings or 0) - (state.loan or 0)
	return math.round(total)
end

-- Where the net worth sits (for allocation charts). Values are >= 0 except debt, which is reported positive.
function L.allocation(state, now)
	local companies, hustles = 0, 0
	for _, c in ipairs(C.COMPANIES) do companies += c.cost * (state.companies[c.id] or 0) * familyCompany(state) end
	for _, slot in pairs(state.hustle) do hustles += slot.value end
	return { cash = math.max(0, state.cash), savings = state.savings or 0, portfolio = L.portfolioValue(state, now), companies = companies, hustles = hustles, debt = (state.loan or 0) + math.max(0, -state.cash) }
end

function L.legacyFor(best) return math.min(C.LEGACY_MAX, math.floor(math.sqrt(math.max(0, best) / C.LEGACY_DIVISOR))) end

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
	table.insert(state.history, { t = now, w = L.netWorth(state, now), p = math.round(L.portfolioValue(state, now)), c = math.round(state.cash), i = math.round(L.rates(state, now).net) })
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
	-- overdraft protection: savings automatically cover a negative cash balance
	if state.cash < 0 and (state.savings or 0) > 0 then
		local cover = math.min(state.savings, -state.cash)
		state.savings -= cover
		state.cash += cover
	end
	resolveStartups(state, now)
	fillOrders(state, now - elapsed, now)
	L.rollMissions(state, now)
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

-- ───────── affordability ─────────
-- Investments must be paid from cash on hand. Essentials may dip into a small overdraft.
local function canPay(state, price) return state.cash + 1e-6 >= price end
function L.overdraft(state) return L.livingCost(state) * 24 * C.OVERDRAFT_DAYS end
local function canPayEssential(state, price) return state.cash - price >= -L.overdraft(state) - 1e-6 end
L.canPay, L.canPayEssential = canPay, canPayEssential

-- ───────── actions ─────────
function L.createCharacter(state, input, now)
	if state.character then return fail("has-character") end
	local name = L.cleanName(input.name)
	if name == "" or not contains(C.COUNTRIES, input.country) or not contains(C.CITIES, input.city)
		or not contains(C.ERAS, input.era) or not contains(C.FAMILIES, input.family) then return fail("bad-request") end
	local fresh = L.newState(now, state.runs, state.best)
	fresh.dailyAt, fresh.dailyStreak = state.dailyAt or 0, state.dailyStreak or 0 -- the login streak belongs to the player, not the run
	fresh.legacy = state.legacy or 0
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
	fresh.dailyAt, fresh.dailyStreak = state.dailyAt or 0, state.dailyStreak or 0
	fresh.legacy = math.max(state.legacy or 0, L.legacyFor(state.best)) -- the record becomes permanent income points
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
	local price = math.round(L.needDaily(state, id) * add)
	if not canPayEssential(state, price) then return fail("not-enough-cash") end
	state.cash -= price
	state.needs[id] = have + add
	state.stats.supplies = (state.stats.supplies or 0) + 1
	withPeak(state, now)
	return true
end

function L.buyBoost(state, id, now)
	if not state.character then return fail("no-character") end
	local def = C.BOOST_DEF[id]
	if not def then return fail("bad-request") end
	if not canPay(state, L.boostPrice(state, id)) then return fail("not-enough-cash") end
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
	if not canPay(state, def.fee) then return fail("not-enough-cash") end
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
		state.stats.promotions = (state.stats.promotions or 0) + 1
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
	state.stats.studies = (state.stats.studies or 0) + 1
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
	if not canPay(state, L.companyPrice(state, id)) then return fail("not-enough-cash") end
	state.cash -= L.companyPrice(state, id)
	state.companies[id] = n + 1
	state.stats.companiesBought = (state.stats.companiesBought or 0) + 1
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
	if not canPay(state, L.upgradePrice(state, id)) then return fail("not-enough-cash") end
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
	if not canPay(state, L.hireCost(role)) then return fail("not-enough-cash") end
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
	if not canPayEssential(state, L.batchPrice(id, now) * amount) then return fail("not-enough-cash") end
	state.cash -= L.batchPrice(id, now) * amount
	s.stock += amount
	state.stats.restocks = (state.stats.restocks or 0) + 1
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
	if not canPay(state, L.campaignPrice(state, id)) then return fail("not-enough-cash") end
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
	if not canPayEssential(state, L.fundPrice(state, id)) then return fail("not-enough-cash") end
	state.cash -= L.fundPrice(state, id)
	state.responses[id] = ev.window
	withPeak(state, now)
	return true
end

function L.signContract(state, id, now)
	local cid, err = owned(state, id)
	if not cid then return fail(err) end
	if L.contractActive(state, id, now) then return fail("busy") end
	if not canPay(state, L.contractPrice(state, id)) then return fail("not-enough-cash") end
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
	if not canPay(state, L.researchPrice(state, id)) then return fail("not-enough-cash") end
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
	if not canPayEssential(state, L.unionPrice(state, id)) then return fail("not-enough-cash") end
	state.cash -= L.unionPrice(state, id)
	s.unionUntil = now + C.UNION_DEAL_MS
	withPeak(state, now)
	return true
end

function L.upgradePhase(state, now)
	if not state.character then return fail("no-character") end
	if state.phase >= C.MAX_PHASE then return fail("max") end
	local nextPhase = state.phase + 1
	if L.rates(state, now).companies < L.phaseRequirement(nextPhase) then return fail("locked") end
	if not canPay(state, L.phaseCost(nextPhase)) then return fail("not-enough-cash") end
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
	state.stats.trades = (state.stats.trades or 0) + 1
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
	state.stats.trades = (state.stats.trades or 0) + 1
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
	state.stats.hustles = (state.stats.hustles or 0) + 1
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
	if not contains({ "home", "work", "needs", "companies", "invest", "hustle", "compare", "board", "goals" }, tab) then return fail("bad-request") end
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

-- ───────── v3: milestones ─────────
function L.milestoneProgress(state, m, now)
	local k = m.kind
	if k == "shifts" then return state.stats.shifts or 0 end
	if k == "hustles" then return state.stats.hustles or 0 end
	if k == "edu" then return state.edu end
	if k == "device" then return state.device end
	if k == "phase" then return state.phase end
	if k == "rank" then return state.job and state.job.rank or 0 end
	if k == "portfolio" then return L.portfolioValue(state, now) end
	if k == "netWorth" then return math.max(state.peak or 0, L.netWorth(state, now)) end
	if k == "companies" then
		local n = 0
		for _, c in ipairs(C.COMPANIES) do n += state.companies[c.id] or 0 end
		return n
	end
	return 0
end

-- Rewards scale with the character's cost of living so a goal is worth the same effort in every country.
function L.milestoneReward(state, m)
	local scale = math.max(0.6, L.livingCost(state) / C.LIVING_BASE)
	return math.round(m.reward * scale)
end

function L.milestoneList(state, now)
	local out = {}
	for _, m in ipairs(C.MILESTONES) do
		local have = L.milestoneProgress(state, m, now)
		table.insert(out, { def = m, have = have, done = have >= m.target, claimed = state.milestones[m.id] == true, reward = L.milestoneReward(state, m) })
	end
	return out
end

function L.claimableCount(state, now)
	if not state.character then return 0 end
	local n = 0
	for _, m in ipairs(C.MILESTONES) do
		if not state.milestones[m.id] and L.milestoneProgress(state, m, now) >= m.target then n += 1 end
	end
	if L.dailyReady(state, now) then n += 1 end
	for _, m in ipairs(state.missions and state.missions.list or {}) do if L.missionReady(state, m, now) then n += 1 end end
	return n
end

function L.claimMilestone(state, id, now)
	if not state.character then return fail("no-character") end
	local m = type(id) == "string" and C.MILESTONE_BY_ID[id]
	if not m then return fail("bad-request") end
	if state.milestones[id] then return fail("max") end
	if L.milestoneProgress(state, m, now) < m.target then return fail("locked") end
	local reward = L.milestoneReward(state, m)
	state.milestones[id] = true
	state.cash += reward
	state.totalEarned += reward
	state.eduPoints += m.points
	withPeak(state, now)
	return true, "milestone", reward
end

-- ───────── v3: daily reward ─────────
function L.dailyReady(state, now) return state.character ~= nil and now - (state.dailyAt or 0) >= C.DAILY_COOLDOWN_MS end
function L.dailyNextStreak(state, now)
	if (state.dailyAt or 0) > 0 and now - state.dailyAt <= C.DAILY_GRACE_MS then
		return math.min(C.DAILY_MAX_STREAK, (state.dailyStreak or 0) + 1)
	end
	return 1
end
function L.dailyReward(state, streak)
	local v = L.livingCost(state) * C.DAILY_BASE_HOURS * (1 + C.DAILY_STREAK_STEP * (streak - 1))
	return math.max(C.DAILY_MIN, math.round(v))
end
function L.claimDaily(state, now)
	if not state.character then return fail("no-character") end
	if not L.dailyReady(state, now) then return fail("cooldown") end
	local streak = L.dailyNextStreak(state, now)
	local reward = L.dailyReward(state, streak)
	state.dailyStreak = streak
	state.dailyAt = now
	state.cash += reward
	state.totalEarned += reward
	withPeak(state, now)
	return true, "daily", reward
end

-- ───────── v4: bank ─────────
-- Equity = net worth after debt. Total debt may reach BANK_LOAN_LTV x equity.
function L.loanCapacity(state, now)
	local equity = math.max(0, L.netWorth(state, now))
	return math.max(0, C.BANK_LOAN_LTV * equity - (state.loan or 0))
end
local function bankAmount(v) return isNum(v) and v > 0 and v <= 1e15 end
function L.bankDeposit(state, amount, now)
	if not state.character then return fail("no-character") end
	if not bankAmount(amount) then return fail("bad-request") end
	local money = math.min(amount, state.cash)
	if money < C.BANK_MIN then return fail("not-enough-cash") end
	state.cash -= money
	state.savings += money
	state.stats.deposits = (state.stats.deposits or 0) + 1
	return true, "deposited", math.round(money)
end
function L.bankWithdraw(state, amount, now)
	if not state.character then return fail("no-character") end
	if not bankAmount(amount) then return fail("bad-request") end
	local money = math.min(amount, state.savings)
	if money < 1 then return fail("nothing") end
	state.savings -= money
	state.cash += money
	return true, "withdrawn", math.round(money)
end
function L.bankBorrow(state, amount, now)
	if not state.character then return fail("no-character") end
	if not bankAmount(amount) then return fail("bad-request") end
	local money = math.min(amount, L.loanCapacity(state, now))
	if money < C.BANK_MIN then return fail("locked") end
	state.loan += money
	state.cash += money
	return true, "borrowed", math.round(money)
end
function L.bankRepay(state, amount, now)
	if not state.character then return fail("no-character") end
	if not bankAmount(amount) then return fail("bad-request") end
	if state.loan <= 0 then return fail("nothing") end
	local money = math.min(amount, state.loan, math.max(0, state.cash))
	if money < 1 then return fail("not-enough-cash") end
	state.loan -= money
	if state.loan < 0.5 then state.loan = 0 end
	state.cash -= money
	return true, "repaid", math.round(money)
end

-- ───────── v4: daily missions ─────────
local function counterValue(state, key)
	if key == "earned" then return state.totalEarned or 0 end
	return state.stats[key] or 0
end
L.counterValue = counterValue
function L.missionDay(now) return math.floor(now / C.DAY) end
function L.missionTarget(state, def)
	if def.livingHours then return math.max(100, math.round(L.livingCost(state) * def.livingHours)) end
	return def.target
end
function L.missionReward(state, def) return math.max(25, math.round(L.livingCost(state) * def.hours)) end
-- Picks today's missions once per day (server tick). Deterministic per day, skipping ones that can't be done.
function L.rollMissions(state, now)
	if not state.character then return end
	local day = L.missionDay(now)
	if state.missions.day == day then return end
	local hasCompany = next(state.companies) ~= nil
	local pool = {}
	for _, d in ipairs(C.MISSION_POOL) do
		if not d.needsCompany or hasCompany then table.insert(pool, d) end
	end
	table.sort(pool, function(a, b) return hash32("mission:" .. day .. ":" .. a.id) < hash32("mission:" .. day .. ":" .. b.id) end)
	local list = {}
	for i = 1, math.min(C.MISSIONS_PER_DAY, #pool) do
		local d = pool[i]
		table.insert(list, { id = d.id, base = counterValue(state, d.counter), target = L.missionTarget(state, d), claimed = false })
	end
	state.missions = { day = day, list = list }
end
function L.missionProgress(state, m)
	local d = C.MISSION_BY_ID[m.id]
	return math.max(0, counterValue(state, d.counter) - m.base)
end
function L.missionReady(state, m, now)
	return not m.claimed and state.missions.day == L.missionDay(now) and L.missionProgress(state, m) >= m.target
end
function L.claimMission(state, index, now)
	if not state.character then return fail("no-character") end
	if not isInt(index) then return fail("bad-request") end
	local m = state.missions.list[index]
	if not m or state.missions.day ~= L.missionDay(now) then return fail("nothing") end
	if m.claimed then return fail("max") end
	if L.missionProgress(state, m) < m.target then return fail("locked") end
	local d = C.MISSION_BY_ID[m.id]
	local reward = L.missionReward(state, d)
	m.claimed = true
	state.cash += reward
	state.totalEarned += reward
	state.eduPoints += d.points
	withPeak(state, now)
	return true, "mission", reward
end

return L
