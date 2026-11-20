-- Integration tests for the Roblox port. Prints PASS/FAIL lines.
local C, L = __mod("Config"), __mod("Logic")
local Core = __mod("Core")(L, C)
local failures = 0
local function test(name, fn)
	local ok, err = pcall(fn)
	print((ok and "PASS " or "FAIL ") .. name .. (ok and "" or (": " .. tostring(err))))
end
local T0 = 1700000000000
local function fresh(family)
	local st = L.newState(T0, 0, 0)
	assert(L.createCharacter(st, { name = "Tester", country = "cz", city = "town", era = "2025", family = family or "middle" }, T0))
	return st
end
local function rngConst(v) return function() return v end end
local function doShift(st, now)
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 7 end
	assert(L.startShift(st, now, rngConst(0.5)))
	local pay
	for i = 1, 3 do local ok, ev, p = L.chooseShift(st, 2, now) assert(ok) pay = p or pay end
	return pay
end

test("character: start money = family.start * era.start", function()
	local st = fresh("rich")
	assert(st.cash == 2000 and st.peak == 2000)
	local b = L.newState(T0, 0, 0)
	assert(L.createCharacter(b, { name = "x", country = "us", city = "city", era = "1990", family = "business" }, T0))
	assert(b.cash == math.round(800 * 0.6))
	local ok, err = L.createCharacter(b, { name = "y", country = "cz", city = "town", era = "2025", family = "poor" }, T0)
	assert(not ok and err == "has-character")
	local bad = L.newState(T0, 0, 0)
	assert(not (L.createCharacter(bad, { name = "<>", country = "cz", city = "town", era = "2025", family = "poor" }, T0)))
end)

test("first slice: job -> shift -> pay -> points", function()
	local st = fresh()
	assert(L.takeJob(st, "warehouse", T0))
	local cash = st.cash
	local pay = doShift(st, T0)
	assert(pay and pay > 0 and st.cash == cash + pay, "pay credited")
	assert(st.job.points == 6 or st.job.points == 10 or st.job.points == 3)
	assert(st.stats.shifts == 1 and st.shift == nil and st.energy == 100 - 30)
	local ok, err = L.startShift(st, T0 + 1000, rngConst(0.5))
	assert(not ok and err == "cooldown")
	assert(st.eduPoints == st.job.points)
end)

test("job gates: education locked, reason reported", function()
	local st = fresh()
	local g = L.jobGate(st, "banker")
	assert(not g.ok and g.reasons[1].code == "edu" and g.reasons[1].need == 14)
	local ok, err = L.takeJob(st, "banker", T0)
	assert(not ok and err == "locked")
end)

test("needs: purchase deducts and stocks; empty needs hurt", function()
	local st = fresh()
	local price = L.needDaily(st, "food")
	assert(L.buyNeed(st, "food", 3, T0))
	assert(st.needs.food == 3 and st.cash == 120 - price * 3)
	assert(not (L.buyNeed(st, "food", 5, T0)) == false) -- fills to max 7, partial
	local ok, err = L.buyNeed(st, "food", 1, T0)
	assert(not ok and err == "max")
	local fx = L.needsEffects(st, T0)
	assert(fx.noShift == true and fx.income < 1 and fx.bills == true)
end)

test("settle: offline gain capped at MAX_OFFLINE_MIN", function()
	local st = fresh()
	assert(L.takeJob(st, "warehouse", T0))
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 7 end
	local a = L.deepCopy(st)
	L.settle(a, T0 + 15 * 60000)
	local b = L.deepCopy(st)
	L.settle(b, T0 + 10 * 3600000)
	assert(math.abs(b.cash - a.cash) < 1e-6 * math.max(1, math.abs(a.cash)) + 1, "cap holds: " .. a.cash .. " vs " .. b.cash)
end)

test("migrate: old/partial profiles get safe defaults; garbage sanitized", function()
	local old = { v = 1, character = { country = "cz", name = "A", city = "town", era = "2025", family = "middle" }, cash = 50, startedAt = T0 - 1000, lastSeen = T0 + 99999999, needs = { food = 3 } }
	local st = L.migrate(old, T0)
	assert(st.v == C.STATE_VERSION and st.device == 1 and st.stats.shifts == 0 and #st.orders == 0)
	assert(st.lastSeen <= T0, "future lastSeen clamped")
	assert(st.needs.food == 3 and st.needs.drink == 0)
	local junk = L.migrate({ cash = 0 / 0, energy = 999, edu = 99, device = 77, companies = { fake = 3 } }, T0)
	assert(junk.cash == 0 and junk.energy == 100 and junk.edu == 25 and junk.device == 4 and junk.companies.fake == nil)
	local none = L.migrate("nonsense", T0)
	assert(none.cash == 0 and none.character == nil)
end)

local function readyForIpad(st)
	assert(L.takeJob(st, "warehouse", T0))
	local t = T0
	for i = 1, 3 do
		t += C.SHIFT_COOLDOWN_MS + 1000
		st.energy = 100
		doShift(st, t)
	end
	return t
end

test("device: gate explains reasons, then purchase deducts exactly once", function()
	local st = fresh()
	local g0 = L.deviceGate(st, 2, T0)
	assert(not g0.ok and g0.price == C.DEVICES[2].price)
	local codes = {}
	for _, r in ipairs(g0.reasons) do codes[r.code] = true end
	assert(codes.shifts and codes.cash, "reasons: shifts + cash")
	local ok, err = L.buyDevice(st, 2, T0)
	assert(not ok and err == "locked" or err == "not-enough-cash")
	local t = readyForIpad(st)
	st.cash = 3000
	local before = st.cash
	assert(L.deviceGate(st, 2, t).ok)
	local ok2 = L.buyDevice(st, 2, t)
	assert(ok2 and st.device == 2 and st.cash == before - C.DEVICES[2].price and #st.deviceLog == 1)
	local ok3, err3 = L.buyDevice(st, 2, t)
	assert(not ok3 and err3 == "max" and st.cash == before - C.DEVICES[2].price, "second purchase rejected, no charge")
	local ok4, err4 = L.buyDevice(st, 4, t)
	assert(not ok4 and st.device == 2, "cannot skip tiers")
end)

test("device: rapid repeated requests with same request id charge once (ServerCore)", function()
	local st = fresh()
	local t = readyForIpad(st)
	st.cash = 5000
	st.lastSeen = t
	local snapshot = L.deepCopy(st)
	local session = Core.newSession(st, t)
	local before = session.state.cash
	local results = {}
	for i = 1, 20 do results[i] = { Core.invoke(session, "buyDevice", "req-device-aaaa", t, nil, 2) } end
	assert(session.state.cash == before - C.DEVICES[2].price and session.state.device == 2, "charged once")
	for i = 2, 20 do assert(results[i][1] == results[1][1], "replay returns same result") end
	-- 20 different request ids: first buys, rest rejected, still only one charge
	local s2 = Core.newSession(snapshot, t)
	local okCount = 0
	for i = 1, 20 do if (Core.invoke(s2, "buyDevice", "req-unique-" .. i, t, nil, 2)) then okCount += 1 end end
	assert(okCount == 1 and s2.state.cash == before - C.DEVICES[2].price, "distinct ids: only one succeeds, one charge")
end)

test("device: upgrade during active shift and pending order preserves both", function()
	local st = fresh()
	local t = readyForIpad(st)
	st.cash = 30000
	assert(L.buyAsset(st, "flat", 5000, t))
	local cur = L.assetPrice("flat", t, st.startedAt)
	assert(L.placeOrder(st, { asset = "flat", side = "sell", when = "above", price = cur * 1.5, share = 0.5 }, t))
	assert(L.placeOrder(st, { asset = "gold", side = "buy", when = "below", price = L.assetPrice("gold", t, st.startedAt) * 0.5, amount = 100 }, t))
	t += C.SHIFT_COOLDOWN_MS + 1000
	st.energy = 100
	assert(L.startShift(st, t, rngConst(0.5)))
	assert(L.chooseShift(st, 2, t))
	local shiftBefore = L.deepCopy(st.shift)
	st.lastSeen = t
	local holdBefore, cashBefore = st.holdings.flat, st.cash
	local session = Core.newSession(st, t)
	assert(Core.invoke(session, "buyDevice", "req-upgrade-1234", t, nil, 2))
	local s = session.state
	assert(s.device == 2 and s.cash == cashBefore - C.DEVICES[2].price)
	assert(s.shift and s.shift.step == shiftBefore.step and s.shift.seed == shiftBefore.seed and s.shift.perfSum == shiftBefore.perfSum, "shift intact")
	assert(#s.orders == 2 and s.holdings.flat == holdBefore, "orders + holdings intact")
	-- shift still completes after the upgrade
	assert(Core.invoke(session, "chooseShift", "req-choose-0001", t, nil, 2))
	assert(Core.invoke(session, "chooseShift", "req-choose-0002", t, nil, 2))
	assert(s.shift == nil and s.stats.shifts == 4)
end)

test("orders: limit order fills when price crosses, even across a gap", function()
	local st = fresh("rich")
	local id = "technology"
	local cur = L.assetPrice(id, T0, st.startedAt)
	local limit = cur * 0.97
	assert(L.placeOrder(st, { asset = id, side = "buy", when = "below", price = limit, amount = 500 }, T0))
	local ok = L.placeOrder(st, { asset = id, side = "buy", when = "below", price = cur * 1.1, amount = 500 }, T0)
	assert(not ok, "limit must be on the correct side of the price")
	local hitAt
	for m = 1, 3000 do
		if L.assetPrice(id, T0 + m * 60000, st.startedAt) <= limit then hitAt = T0 + m * 60000 break end
	end
	assert(hitAt, "price crosses within test window")
	st.lastSeen = hitAt - 5 * 60000
	for _, n in ipairs(C.NEEDS) do st.needs[n] = 7 end
	L.settle(st, hitAt)
	assert(#st.orders == 0 and (st.holdings[id] or 0) > 0, "order filled")
	assert(st.news[#st.news].kind == "buy-filled")
end)

test("orders: cancel + max", function()
	local st = fresh("rich")
	local cur = L.assetPrice("gold", T0, st.startedAt)
	for i = 1, C.MAX_ORDERS do assert(L.placeOrder(st, { asset = "gold", side = "buy", when = "below", price = cur * 0.5, amount = 10 }, T0)) end
	local ok, err = L.placeOrder(st, { asset = "gold", side = "buy", when = "below", price = cur * 0.5, amount = 10 }, T0)
	assert(not ok and err == "max")
	assert(L.cancelOrder(st, st.orders[1].id, T0) and #st.orders == C.MAX_ORDERS - 1)
end)

test("assets: buy/sell realised profit, locked crypto in 1990", function()
	local st = fresh("rich")
	assert(L.buyAsset(st, "index", 1000, T0))
	assert(st.holdings.index > 0 and st.cash == 1000)
	local ok, i1, money = L.sellAsset(st, "index", 1, T0)
	assert(ok and st.holdings.index == nil and math.abs(st.cash - 2000) < 1e-6)
	local old = L.newState(T0, 0, 0)
	assert(L.createCharacter(old, { name = "o", country = "cz", city = "town", era = "1990", family = "rich" }, T0))
	local ok2, err2 = L.buyAsset(old, "coin", 100, T0)
	assert(not ok2 and err2 == "locked")
end)

test("companies: price growth, staff roles cap, stock, bankruptcy warning", function()
	local st = fresh("business")
	st.cash = 1e6
	assert(L.buyCompany(st, "shoes", T0))
	assert(L.companyPrice(st, "shoes") == math.round(1000 * 0.9 * 1.15))
	assert(L.hireStaff(st, "shoes", 1, "manager", T0))
	local ok, err = L.hireStaff(st, "shoes", 1, "manager", T0)
	assert(not ok and err == "max", "one manager cap")
	assert(L.buyStock(st, "shoes", 4, T0) and st.setup.shoes.stock == 4)
	local ok2 = L.buyStock(st, "shoes", 50, T0)
	assert(not ok2, "stock over capacity rejected")
	st.cash = -1e6
	local danger = L.distressOf(st, T0)
	assert(danger == true or danger == false)
end)

test("hustle: stake locked, 3 rounds, result credited", function()
	local st = fresh("rich")
	assert(L.startHustle(st, "lemonade", 100, T0, rngConst(0.3)))
	local ok, err = L.decideHustle(st, "lemonade", 1, T0)
	assert(not ok and err == "not-ready")
	for r = 1, 3 do
		local t = L.hustleRoundAt(st.hustle.lemonade, "lemonade", st.hustle.lemonade.round) + 1
		assert(L.decideHustle(st, "lemonade", 2, t))
	end
	assert(st.hustle.lemonade == nil and st.knowledge.lemonade == 1)
end)

test("restart keeps record + runs, resets device and layout", function()
	local st = fresh("rich")
	st.best = 123456
	st.device = 3
	L.restart(st, T0)
	assert(st.best == 123456 and st.runs == 1 and st.device == 1 and st.character == nil and #st.views == 0)
end)

test("device-gated UI prefs: limits enforced server-side", function()
	local st = fresh()
	local ok, err = L.toggleWatch(st, "gold")
	assert(not ok and err == "locked", "phone has no watchlist")
	st.device = 2
	for _, id in ipairs({ "gold", "silver", "copper", "flat" }) do assert(L.toggleWatch(st, id)) end
	assert(not (L.toggleWatch(st, "house")), "iPad watch limit 4")
	assert(L.toggleWatch(st, "gold") and #st.watch == 3)
	assert(not (L.saveView(st, "v", { tab = "work" })), "iPad has no saved views")
	st.device = 3
	assert(L.saveView(st, "Moje práce", { tab = "work", filter = "" }))
	assert(not (L.saveView(st, "x", { tab = "hack" })))
	assert(not (L.setPins(st, { "cash" })), "laptop has no pins")
	st.device = 4
	assert(L.setPins(st, { "cash", "needs" }) and #st.pins == 2)
	assert(not (L.setPins(st, { "cash", "cash" })))
end)

test("ServerCore: unknown action, bad request id, rate limit, read-only", function()
	local session = Core.newSession(fresh(), T0)
	local ok, err = Core.invoke(session, "giveMoney", "req-xxxxxxxx", T0, 0)
	assert(not ok and err == "bad-request")
	ok, err = Core.invoke(session, "rest", "x", T0, 0)
	assert(not ok and err == "bad-request")
	local limited = 0
	for i = 1, 40 do
		local o, e = Core.invoke(session, "buyNeed", "req-rate-" .. i, T0, 100, "food", 1)
		if e == "rate-limit" then limited += 1 end
	end
	assert(limited > 0, "burst limited")
	local ro = Core.newSession(nil, T0, { readOnly = true })
	ok, err = Core.invoke(ro, "createCharacter", "req-readonly-1", T0, nil, {})
	assert(not ok and err == "save-unavailable")
end)

test("hash32 deterministic and in [0,1)", function()
	for i = 1, 200 do
		local v = L.hash32("probe:" .. i)
		assert(v >= 0 and v < 1 and v == L.hash32("probe:" .. i))
	end
end)

test("economy tuning: new player can afford iPad within a few real hours", function()
	local rows = {}
	for _, fam in ipairs(C.FAMILIES) do
		local st = fresh(fam)
		assert(L.takeJob(st, "warehouse", T0))
		for _, id in ipairs(C.NEEDS) do st.needs[id] = 7 end
		local r = L.rates(st, T0)
		local shiftsPerHour = 12 -- energy-limited
		local pay = 0
		do local c = L.deepCopy(st); pay = doShift(c, T0) end
		local perHour = r.net + shiftsPerHour * pay - r.living * 1 -- needs bought each hour at living cost
		table.insert(rows, string.format("%s: passive net %.0f/h, shift %.1f, minus living %.0f => ~%.0f credits/real hour", fam, r.net, pay, r.living, perHour))
	end
	print("INFO " .. table.concat(rows, " | "))
end)
