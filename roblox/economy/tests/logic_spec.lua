-- Pure-logic tests. Run with: node tools/run-tests.js (see README). No Roblox services needed.
local C = require("Config")
local L = require("Logic")
local Core = require("ServerCore")(L, C)

local passed, failed = 0, 0
local function test(name, fn)
	local ok, err = pcall(fn)
	if ok then passed = passed + 1 else failed = failed + 1; print("FAIL " .. name .. ": " .. tostring(err)) end
end
local function eq(a, b, msg) if a ~= b then error((msg or "") .. " expected " .. tostring(b) .. ", got " .. tostring(a), 2) end end

local H = C.H
local T0 = 1000.0 * H -- float on purpose: some Lua VMs used for testing have 32-bit integers

local function fresh(family)
	local st = L.newState(T0, 0, 0)
	assert(L.createCharacter(st, { name = "Ada", country = "us", city = "town", era = "2025", family = family or "middle" }, T0))
	return st
end

test("create character sets start cash", function()
	local st = fresh("middle")
	eq(st.cash, 120)
	eq(st.character.name, "Ada")
end)

test("name is sanitized and bad input rejected", function()
	local st = L.newState(T0, 0, 0)
	local ok, err = L.createCharacter(st, { name = "  ", country = "us", city = "town", era = "2025", family = "middle" }, T0)
	eq(ok, false); eq(err, "bad-request")
	ok, err = L.createCharacter(st, { name = "x", country = "mars", city = "town", era = "2025", family = "middle" }, T0)
	eq(ok, false)
end)

test("companies cannot be bought on credit (leverage exploit closed)", function()
	local st = fresh("middle")
	local ok, err = L.buyCompany(st, "factory", T0)
	eq(ok, false); eq(err, "not-enough-cash")
	eq(st.cash, 120)
	st.cash = 1000
	assert(L.buyCompany(st, "shoes", T0))
	eq(st.cash, 0)
	eq(st.companies.shoes, 1)
end)

test("job fee requires cash", function()
	local st = fresh("poor")
	st.edu = 20
	local ok, err = L.takeJob(st, "banker", T0)
	eq(ok, false); eq(err, "not-enough-cash")
	assert(L.takeJob(st, "warehouse", T0))
end)

test("essentials may use a small overdraft, not more", function()
	local st = fresh("poor")
	st.cash = 0
	assert(L.buyNeed(st, "food", 1, T0))
	assert(st.cash < 0)
	local ok, err = L.buyNeed(st, "housing", C.MAX_NEED_DAYS, T0)
	eq(ok, false); eq(err, "not-enough-cash")
end)

test("full shift pays, counts and unlocks the first milestone", function()
	local st = fresh()
	assert(L.takeJob(st, "warehouse", T0))
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 3 end
	local seq = { 0.9, 0.9, 0.9 }
	local i = 0
	local rng = function() i = i + 1; return seq[i] or 0.9 end
	assert(L.startShift(st, T0, rng, false))
	assert(L.chooseShift(st, 1, T0))
	assert(L.chooseShift(st, 2, T0))
	local ok, ev, pay = L.chooseShift(st, 3, T0)
	assert(ok); eq(ev, "shift-done"); assert(pay > 0)
	eq(st.stats.shifts, 1)
	eq(L.claimableCount(st, T0) >= 1, true)
	local before = st.cash
	local ok2, info, reward = L.claimMilestone(st, "first_shift", T0)
	assert(ok2); eq(info, "milestone")
	eq(st.cash, before + reward)
	local ok3, err = L.claimMilestone(st, "first_shift", T0)
	eq(ok3, false); eq(err, "max")
end)

test("locked milestone cannot be claimed", function()
	local st = fresh()
	local ok, err = L.claimMilestone(st, "worth_10m", T0)
	eq(ok, false); eq(err, "locked")
	ok, err = L.claimMilestone(st, "nope", T0)
	eq(ok, false); eq(err, "bad-request")
end)

test("net-worth milestones use this run's peak, not the all-time record", function()
	local st = L.newState(T0, 3, 50000000)
	assert(L.createCharacter(st, { name = "Ada", country = "us", city = "town", era = "2025", family = "middle" }, T0))
	eq(st.best, 50000000)
	local ok = L.claimMilestone(st, "worth_10m", T0)
	eq(ok, false)
end)

test("daily reward: cooldown and streak", function()
	local st = fresh()
	assert(L.dailyReady(st, T0))
	local ok, info, r1 = L.claimDaily(st, T0)
	assert(ok); eq(info, "daily"); eq(st.dailyStreak, 1)
	local ok2, err = L.claimDaily(st, T0 + H)
	eq(ok2, false); eq(err, "cooldown")
	local _, _, r2 = L.claimDaily(st, T0 + 21 * H)
	eq(st.dailyStreak, 2); assert(r2 > r1)
	-- miss the grace window: streak resets
	L.claimDaily(st, T0 + 21 * H + 60 * H)
	eq(st.dailyStreak, 1)
end)

test("daily streak survives restart, cash does not", function()
	local st = fresh()
	L.claimDaily(st, T0)
	assert(L.restart(st, T0 + H))
	eq(st.dailyStreak, 1); eq(st.dailyAt, T0); eq(st.character, nil); eq(st.runs, 1)
	eq(L.dailyReady(st, T0 + 2 * H), false)
end)

test("migrate fills v3 fields on a v2 save and strips garbage", function()
	local raw = { v = 2, cash = 50, stats = { shifts = 4 }, milestones = { bogus = true }, companies = { fake = 3 }, character = { name = "A", country = "cz", city = "town", era = "2025", family = "middle" } }
	local st = L.migrate(raw, T0)
	eq(st.v, C.STATE_VERSION)
	eq(st.stats.hustles, 0)
	eq(st.milestones.bogus, nil)
	eq(st.companies.fake, nil)
	eq(st.dailyStreak, 0)
	eq(st.cash, 50)
end)

test("migrate survives non-table input", function()
	local st = L.migrate("garbage", T0)
	eq(st.v, C.STATE_VERSION)
end)

test("settle accrues passive salary over time", function()
	local st = fresh()
	assert(L.takeJob(st, "warehouse", T0))
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 7 end
	local c0 = st.cash
	L.settle(st, T0 + 10 * 60000)
	assert(st.cash > c0, "cash should grow")
end)

test("saved views accept the home tab", function()
	local st = fresh()
	st.device = 3
	assert(L.saveView(st, "Main", { tab = "home", filter = "" }))
end)

test("server core: duplicate request ids replay, unknown actions rejected", function()
	local s = Core.newSession(nil, T0)
	local ok = Core.invoke(s, "createCharacter", "req-00000001", T0, nil, { name = "Bo", country = "us", city = "city", era = "2025", family = "rich" })
	assert(ok)
	local cash = s.state.cash
	assert(Core.invoke(s, "buyCompany", "req-00000002", T0, nil, "shoes"))
	local after = s.state.cash
	assert(Core.invoke(s, "buyCompany", "req-00000002", T0, nil, "shoes")) -- replay
	eq(s.state.cash, after); eq(s.state.companies.shoes, 1)
	assert(after < cash)
	local bad, code = Core.invoke(s, "giveMeMoney", "req-00000003", T0, nil)
	eq(bad, false); eq(code, "bad-request")
	assert(Core.invoke(s, "claimDaily", "req-00000004", T0, nil))
end)

test("rate limiter blocks bursts", function()
	local s = Core.newSession(nil, T0)
	Core.invoke(s, "createCharacter", "req-10000000", T0, 0, { name = "Bo", country = "us", city = "city", era = "2025", family = "rich" })
	local limited = false
	for i = 1, 40 do
		local ok, code = Core.invoke(s, "toggleWatch", "req-2" .. string.format("%07d", i), T0, 0, "gold")
		if code == "rate-limit" then limited = true end
	end
	eq(limited, true)
end)


test("bank: deposit, interest, withdraw", function()
	local st = fresh("rich")
	local ok, info = L.bankDeposit(st, 1000, T0)
	assert(ok); eq(info, "deposited"); eq(st.savings, 1000); eq(st.cash, 1000)
	local r = L.rates(st, T0)
	eq(r.savingsInterest, 1000 * C.BANK_SAVINGS_RATE)
	ok = L.bankWithdraw(st, 400, T0)
	assert(ok); eq(st.savings, 600); eq(st.cash, 1400)
	local bad, code = L.bankDeposit(st, -5, T0)
	eq(bad, false); eq(code, "bad-request")
end)

test("bank: loans capped by equity and repayable", function()
	local st = fresh("rich") -- 2000 cash, equity 2000 -> cap 1000
	eq(L.loanCapacity(st, T0), 1000)
	local ok, info, got = L.bankBorrow(st, 999999, T0)
	assert(ok); eq(got, 1000); eq(st.loan, 1000); eq(st.cash, 3000)
	eq(L.netWorth(st, T0), 2000)
	eq(L.loanCapacity(st, T0), 0)
	local no = L.bankBorrow(st, 100, T0)
	eq(no, false)
	assert(L.bankRepay(st, 5000, T0))
	eq(st.loan, 0); eq(st.cash, 2000)
	assert(L.rates(st, T0).loanInterest == 0)
end)

test("savings cover negative cash", function()
	local st = fresh("rich")
	assert(L.bankDeposit(st, 1500, T0))
	st.cash = -300
	L.settle(st, T0 + 1000)
	assert(st.cash >= 0 - 1e-6, "cash covered"); assert(st.savings < 1500)
end)

test("missions roll once per day and pay out", function()
	local st = fresh()
	L.settle(st, T0)
	eq(#st.missions.list, C.MISSIONS_PER_DAY)
	local day = st.missions.day
	local first = st.missions.list[1].id
	L.settle(st, T0 + 1000)
	eq(st.missions.day, day); eq(st.missions.list[1].id, first)
	-- force-complete mission 1 by bumping its counter
	local m = st.missions.list[1]
	local d = C.MISSION_BY_ID[m.id]
	if d.counter == "earned" then st.totalEarned = st.totalEarned + m.target else st.stats[d.counter] = st.stats[d.counter] + m.target end
	assert(L.missionReady(st, m, T0 + 1000))
	assert(L.claimableCount(st, T0 + 1000) >= 1)
	local ok, info, reward = L.claimMission(st, 1, T0 + 1000)
	assert(ok); eq(info, "mission"); assert(reward > 0)
	local again = L.claimMission(st, 1, T0 + 1000)
	eq(again, false)
	L.settle(st, T0 + C.DAY + 1000)
	assert(st.missions.day ~= day, "new day rolls new missions")
end)

test("legacy: restart converts record into permanent income points", function()
	local st = fresh()
	st.best = 1000000 -- sqrt(1e6 / 1e4) = 10 points
	assert(L.restart(st, T0))
	eq(st.legacy, 10)
	assert(L.createCharacter(st, { name = "Ada", country = "us", city = "town", era = "2025", family = "middle" }, T0))
	eq(st.legacy, 10)
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 5 end
	local r = L.rates(st, T0)
	assert(math.abs(r.multiplier - 1.2) < 1e-9, "multiplier " .. r.multiplier)
end)

test("stats counters increment", function()
	local st = fresh("rich")
	st.cash = 1e6
	assert(L.buyNeed(st, "food", 1, T0)); eq(st.stats.supplies, 1)
	assert(L.buyAsset(st, "gold", 100, T0)); eq(st.stats.trades, 1)
	assert(L.sellAsset(st, "gold", 1, T0)); eq(st.stats.trades, 2)
	assert(L.buyCompany(st, "shoes", T0)); eq(st.stats.companiesBought, 1)
end)

test("history records cash and income", function()
	local st = fresh()
	L.settle(st, T0 + 1)
	local h = st.history[#st.history]
	assert(h.c ~= nil and h.i ~= nil and h.w ~= nil)
end)

print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then error("tests failed") end
