-- Mirrors parity.ts using the Luau port. Prints "P key value" lines.
local C, L = __mod("Config"), __mod("Logic")
local function P(k, v) print(string.format("P %s %.12g", k, v)) end
local function rng() return 0.5 end
local function must(ok, a) assert(ok, "action failed " .. tostring(a)) end

local T0 = 1700000000000
local st = L.newState(T0, 0, 0)
must(L.createCharacter(st, { name = "T", country = "de", city = "city", era = "2025", family = "business" }, T0))
P("start.cash", st.cash)
st.cash = 5000000
must(L.takeJob(st, "warehouse", T0))
for _ = 1, 3 do must(L.buyCompany(st, "shoes", T0)) end
for _ = 1, 2 do must(L.buyCompany(st, "tech", T0)) end
must(L.hireStaff(st, "shoes", 1, "producer", T0))
must(L.hireStaff(st, "shoes", 1, "seller", T0))
must(L.hireStaff(st, "tech", 1, "accountant", T0))
must(L.buyStock(st, "shoes", 10, T0))
must(L.buyStock(st, "tech", 8, T0))
must(L.setCompanySetting(st, "shoes", "price", 1.3, T0))
must(L.setCompanySetting(st, "shoes", "risk", 0.7, T0))
must(L.buyNeed(st, "food", 5, T0))
must(L.buyNeed(st, "transport", 3, T0))
for _, pair in ipairs({ { "flat", 20000 }, { "technology", 10000 }, { "gold", 5000 }, { "state", 3000 }, { "startup_it", 1000 }, { "coin", 2000 } }) do
	must(L.buyAsset(st, pair[1], pair[2], T0))
end

local T1 = T0 + 600000
for _, id in ipairs({ "flat", "technology", "gold", "state", "coin", "biotech", "memecoin", "index" }) do
	P("price." .. id, L.assetPrice(id, T1, st.startedAt))
end
local r = L.rates(st, T1)
for _, k in ipairs({ "salary", "companies", "passive", "living", "companyCosts", "multiplier", "net", "dividends" }) do P("rates." .. k, r[k]) end
P("netWorth", L.netWorth(st, T1))
P("living", L.livingCost(st))
P("needDaily.food", L.needDaily(st, "food"))
P("companyPrice.shoes", L.companyPrice(st, "shoes"))
P("sellPrice.shoes", L.sellPrice(st, "shoes"))
P("batch.shoes", L.batchPrice("shoes", T1))
P("phaseReq5", L.phaseRequirement(5))
P("phaseCost5", L.phaseCost(5))
P("arbSpread", L.arbitrageSpread(T1))
for w = 0, 11 do
	local ev = L.currentEvent(w * 7200000 + 1000)
	local idx = 0
	if ev then for i, e in ipairs(C.EVENTS) do if e.id == ev.def.id then idx = i end end end
	P("event.idx." .. w, idx)
	local ae = L.currentAssetEvent(w * 10800000 + 1000)
	local aidx = 0
	if ae then for i, e in ipairs(C.ASSET_EVENTS) do if e.id == ae.def.id then aidx = i end end end
	P("aevent.idx." .. w, aidx)
end

-- shift
local before = st.cash
local s2 = L.deepCopy(st)
must(L.startShift(s2, T1, rng))
P("shift.seed", s2.shift.seed)
for _, i in ipairs({ 3, 2, 1 }) do must(L.chooseShift(s2, i, T1)) end
P("shift.cash", s2.cash - before)
P("shift.points", s2.job.points)
P("shift.energy", s2.energy)

local T2 = T1 + 600000
L.settle(s2, T2)
P("settle.cash", s2.cash)
P("settle.energy", s2.energy)
P("settle.peak", s2.peak)

-- hustle
local h = L.deepCopy(st)
must(L.startHustle(h, "carflip", nil, T1, rng))
local slot = h.hustle.carflip
P("hustle.seed", slot.seed)
P("hustle.market", L.hustleMarket(slot, "carflip"))
for round = 0, 2 do
	local tt = L.hustleRoundAt(h.hustle.carflip, "carflip", h.hustle.carflip.round) + 1
	for i, c in ipairs(L.hustleChoices(h.hustle.carflip, "carflip")) do
		P(`hustle.r{round}.c{i - 1}.lo`, c.lo)
		P(`hustle.r{round}.c{i - 1}.hi`, c.hi)
	end
	must(L.decideHustle(h, "carflip", 2, tt))
end
P("hustle.cash", h.cash)
P("hustle.exp", h.knowledge.carflip or 0)

for rd = 100, 107 do
	local o = L.startupOutcome("startup_it", rd)
	P("startup." .. rd, o.kind == "exit" and o.mult or (o.kind == "krach" and -1 or 0))
end
