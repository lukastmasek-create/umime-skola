-- Headless UI smoke test: renders every screen and side panel for several game states, widths and device
-- tiers against tests/roblox_mock.lua, then presses every button. Any runtime error fails the run.
local C = require("Config")
local L = require("Logic")
local S = require("Strings")
local T = require("Theme")
local W = require("Widgets")
local Screens = require("Screens")

local H = C.H
local T0 = 1000.0 * H

local acted = {}
local function makeState(kind)
	local st = L.newState(T0, 2, 123456)
	assert(L.createCharacter(st, { name = "Ada Lovelace", country = "gb", city = "city", era = "2025", family = "rich" }, T0))
	if kind == "fresh" then return st end
	st.cash = 2500000
	st.edu = 12; st.eduPoints = 400
	assert(L.takeJob(st, "programmer", T0))
	st.job.rank = 4; st.job.points = 420
	for _, id in ipairs(C.NEEDS) do st.needs[id] = 4 end
	st.needs.drink = 0
	for _, id in ipairs({ "shoes", "bakery", "software" }) do assert(L.buyCompany(st, id, T0)) end
	assert(L.buyCompany(st, "shoes", T0))
	assert(L.hireStaff(st, "shoes", 1, "producer", T0)); assert(L.hireStaff(st, "shoes", 1, "seller", T0)); assert(L.hireStaff(st, "shoes", 1, "manager", T0))
	assert(L.buyStock(st, "shoes", 5, T0))
	assert(L.buyAsset(st, "gold", 20000, T0)); assert(L.buyAsset(st, "startup_it", 5000, T0)); assert(L.buyAsset(st, "index", 9000, T0))
	st.device = 4
	assert(L.toggleWatch(st, "gold")); assert(L.toggleWatch(st, "index"))
	assert(L.saveView(st, "Assets", { tab = "invest", filter = "stocks" }))
	assert(L.setPins(st, { "cash", "netWorth", "income", "needs", "companies", "hustle" }))
	local price = L.assetPrice("gold", T0, st.startedAt)
	assert(L.placeOrder(st, { asset = "gold", side = "sell", when = "above", price = price * 1.05, share = 1 }, T0))
	assert(L.placeOrder(st, { asset = "index", side = "buy", when = "below", price = L.assetPrice("index", T0, st.startedAt) * 0.95, amount = 1000 }, T0))
	assert(L.startHustle(st, "lemonade", 100, T0, function() return 0.42 end))
	assert(L.startHustle(st, "carflip", 10000, T0, function() return 0.7 end))
	st.stats.shifts = 12
	for i = 1, 30 do table.insert(st.history, { t = T0 + i, w = 1000 * i, p = 50 * i }) end
	table.insert(st.news, { t = T0, kind = "startup-exit", asset = "startup_it", amount = 999 })
	table.insert(st.news, { t = T0, kind = "order-failed", asset = "gold", amount = 0 })
	table.insert(st.deviceLog, { tier = 2, t = T0, price = 600 })
	st.milestones.first_shift = true
	if kind == "shift" then
		assert(L.startShift(st, T0, function() return 0.5 end, false))
		st.sickUntil = 0
	end
	return st
end

local function ctxFor(st, now, m, cw, tier, ui)
	return {
		state = st, now = now, L = L, C = C, S = S, W = W, T = T, ui = ui, m = m, cw = cw, sideW = 360,
		feat = C.DEVICES[tier].features, tier = tier, navItems = { "home", "work", "needs", "companies", "invest", "hustle", "compare", "history", "goals", "board", "device" },
		act = function(name) table.insert(acted, name); return true end, go = function() end, rerender = function() end,
	}
end

local gui = Instance.new("ScreenGui")
W.attach(gui)

local tabs = { "home", "work", "needs", "companies", "invest", "hustle", "board", "device", "compare", "history", "goals" }
local panels = { "watch", "upcoming", "projects", "alerts", "pinned" }
local widths = { { 390, true }, { 800, false }, { 1400, false } }
local renders, presses = 0, 0

local function pressAll(root)
	for _, d in ipairs(root:GetDescendants()) do
		if d.ClassName == "TextButton" and d._p.Activated then
			d._p.Activated:Fire(); presses = presses + 1
		end
		if d._p.MouseEnter then d._p.MouseEnter:Fire() end
		if d._p.MouseLeave then d._p.MouseLeave:Fire() end
	end
end

for _, kind in ipairs({ "fresh", "mid", "shift" }) do
	for _, wspec in ipairs(widths) do
		for tier = 1, 4 do
			local st = makeState(kind)
			local now = T0 + (kind == "mid" and 5 * 60000 or 0)
			-- make a hustle round due in the mid state
			if kind ~= "fresh" then now = T0 + 400 * 1000 end
			L.settle(st, now)
			local m = T.metrics(Vector2.new(wspec[1], 800), wspec[2])
			local ui = { tab = "home", filter = {}, company = (kind ~= "fresh") and "shoes" or nil, orderAsset = (kind ~= "fresh") and "gold" or nil, cmpKind = "jobs", cmpSel = { "warehouse", "doctor" }, board = { { rank = 1, name = "Zed", value = 1e9 }, { rank = 2, name = "Amy", value = 5e6 }, { rank = 4, name = "Bo", value = 10 } }, pinEdit = true }
			for _, tab in ipairs(tabs) do
				local root = Instance.new("ScrollingFrame")
				local cw = m.w - 40
				W.begin(m, cw)
				local ok, err = pcall(Screens[tab], ctxFor(st, now, m, cw, tier, ui), root)
				if not ok then error(string.format("screen %s (state=%s width=%d tier=%d): %s", tab, kind, wspec[1], tier, tostring(err))) end
				local ok2, err2 = pcall(pressAll, root)
				if not ok2 then error(string.format("buttons on %s (state=%s width=%d tier=%d): %s", tab, kind, wspec[1], tier, tostring(err2))) end
				renders = renders + 1
				if tab == "compare" then ui.cmpKind = (ui.cmpKind == "jobs") and "companies" or ((ui.cmpKind == "companies") and "assets" or "jobs"); ui.cmpSel = {} end
			end
			for _, p in ipairs(panels) do
				local root = Instance.new("ScrollingFrame")
				W.begin(m, 330)
				local ok, err = pcall(Screens.panel[p], ctxFor(st, now, m, 330, tier, ui), root)
				if not ok then error(string.format("panel %s (state=%s tier=%d): %s", p, kind, tier, tostring(err))) end
				pressAll(root)
				renders = renders + 1
			end
			local bar = Instance.new("ScrollingFrame")
			local ok, err = pcall(Screens.toolbar, ctxFor(st, now, m, 600, tier, ui), bar)
			if not ok then error("toolbar: " .. tostring(err)) end
			pressAll(bar)
		end
	end
end

-- widgets that only fire on outcomes
W.toast("hello", "good"); W.toast("bad", "bad"); W.toast("warn", "warn"); W.toast("gold", "gold"); W.toast("5th", "good")
W.celebrate("Promoted!", "Programmer", "🏅")
W.confetti(10)
W.floatText(Instance.new("Frame"), "+100")
W.pulse(Instance.new("Frame"))
W.step()
assert(W.fmt(1234567) == "1.23M", W.fmt(1234567))
assert(W.fmt(12345) == "12,345", W.fmt(12345))
assert(W.fmt(-999) == "−999", W.fmt(-999))
assert(W.dur(30000) == "30s", W.dur(30000))

-- every string key referenced through S.* tables used with S.f must be a string
for k, v in pairs(S.milestones) do assert(C.MILESTONE_BY_ID[k], "milestone string without def: " .. k) end
for _, m in ipairs(C.MILESTONES) do assert(S.milestones[m.id], "missing milestone name: " .. m.id); assert(S.milestoneKind[m.kind], "missing kind text " .. m.kind) end
for _, j in ipairs(C.JOBS) do assert(S.jobs[j.id] and S.jobIcon[j.id], "job text " .. j.id) end
for _, c in ipairs(C.COMPANIES) do assert(S.companies[c.id] and S.companyIcon[c.id], "company text " .. c.id) end
for _, a in ipairs(C.ASSETS) do assert(S.assets[a.id] and S.assetCatIcon[a.cat], "asset text " .. a.id) end
for _, h in ipairs(C.HUSTLES) do assert(S.hustles[h.id] and S.hustleIcon[h.id], "hustle text " .. h.id) end
for _, n in ipairs(C.NEEDS) do assert(S.needs[n] and S.needIcon[n], "need text " .. n) end
for _, id in ipairs(C.COUNTRIES) do assert(S.countries[id] and S.countryFlag[id], "country " .. id) end
for _, sit in ipairs(C.SITUATIONS) do assert(S.situations[sit.id] and #S.situations[sit.id].choices == 3, "situation " .. sit.id) end
for _, e in ipairs(C.EVENTS) do assert(S.events[e.id], "event " .. e.id) end
for _, e in ipairs(C.ASSET_EVENTS) do assert(S.assetEvents[e.id], "asset event " .. e.id) end

print(string.format("UI OK: %d renders, %d button presses, %d instances, %d actions sent", renders, presses, INSTANCES, #acted))
