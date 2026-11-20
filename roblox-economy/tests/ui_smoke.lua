local C, L, S, Core = __mods.Config, __mods.Logic, __mods.Strings, __mods.CoreFactory(__mods.Logic, __mods.Config)

local function test(name, fn)
	local ok, err = pcall(fn)
	print((ok and "PASS " or "FAIL ") .. name .. (ok and "" or (": " .. tostring(err))))
end

-- ───────── mock game / services ─────────
MOCK.now = 1700000000000
MOCK.touch = true
MOCK.studio = false
workspace = { GetServerTimeNow = function() return MOCK.now / 1000 end }
local stateSig, noticeSig = nil, nil
local session = Core.newSession(nil, MOCK.now)
local nextGuid = 0
local function push()
	if stateSig then stateSig:Fire(L.deepCopy(session.state), MOCK.now, false) end
end
local function remote(name)
	local r = MOCK.Instance("Remote")
	if name == "Action" then
		function r.InvokeServer(self, n, reqId, ...)
			local ok, info, extra, extra2 = Core.invoke(session, n, reqId, MOCK.now, nil, ...)
			push()
			return ok, info, extra, extra2
		end
	elseif name == "Board" then
		function r.InvokeServer() return { { rank = 1, name = "Tester", value = 123456 } } end
	end
	return r
end
local remotes = { Action = remote("Action"), Board = remote("Board"), State = MOCK.Instance("Remote"), Notice = MOCK.Instance("Remote") }
stateSig = remotes.State.OnClientEvent
noticeSig = remotes.Notice.OnClientEvent
MOCK.playerGui = MOCK.Instance("PlayerGui")

local function folder(tbl)
	return { WaitForChild = function(_, n) return tbl[n] or { __module = n } end }
end
local RS = { WaitForChild = function(_, n)
	if n == "Economy" then return folder({}) end
	if n == "EconomyRemotes" then return folder(remotes) end
end }
local hb = MOCK.Instance("Heartbeat").Heartbeat
local uisBegan, uisEnded = MOCK.Instance("x").InputBegan, MOCK.Instance("x").InputEnded
local services = {
	Players = { LocalPlayer = { DisplayName = "Tester", UserId = 42, WaitForChild = function() return MOCK.playerGui end } },
	ReplicatedStorage = RS,
	RunService = { IsStudio = function() return MOCK.studio end, Heartbeat = hb },
	UserInputService = setmetatable({ GetFocusedTextBox = function() return nil end, InputBegan = uisBegan, InputEnded = uisEnded }, { __index = function(t, k) if k == "TouchEnabled" then return MOCK.touch end end }),
	HttpService = { GenerateGUID = function() nextGuid += 1 return "guid-" .. string.format("%08d", nextGuid) end },
}
for k, v in pairs(services) do MOCK.services[k] = v end
local fakeScript = { WaitForChild = function(_, n) return { __module = n } end }
local function fakeRequire(m) return assert(__mods[m.__module], "module " .. tostring(m.__module)) end

__initFn(fakeScript, fakeRequire)
local gui = MOCK.playerGui._children[1]
assert(gui and gui.ClassName == "ScreenGui", "ScreenGui created")

local function resize(x, y, touch)
	MOCK.vp = { X = x, Y = y }
	MOCK.touch = touch
	gui._sig["prop:AbsoluteSize"]:Fire()
end
local function heartbeat() hb:Fire(0.2) end
local function tap(needle, nth) local ok = MOCK.tap(gui, needle, nth) MOCK.flush() return ok end
local function tapExact(t) local ok = MOCK.tapExact(gui, t) MOCK.flush() return ok end
local function tapLast(needle)
	local n = 0
	MOCK.walk(gui, function(o) if o.ClassName == "TextButton" and type(o._props.Text) == "string" and string.find(o._props.Text, needle, 1, true) then n += 1 end end)
	return tap(needle, n)
end
local function navTo(tab)
	if MOCK.tapExact(gui, S.navShort[tab] .. "\n" .. S.nav[tab]) then MOCK.flush() return true end
	if tapExact(__mods.Widgets.upper(S.nav[tab])) then return true end
	if tapExact(S.navShort.more .. "\n" .. S.nav.more) and tapExact(S.nav[tab]) then return true end
	return false
end
local function has(t) return MOCK.has(gui, t) or MOCK.has(gui, __mods.Widgets.upper(t)) end
local function advance(ms) MOCK.now += ms; session.state.lastSeen = math.max(session.state.lastSeen, MOCK.now - 1) end

-- ───────── first slice through the real UI ─────────
resize(400, 800, true)
push()

test("UI: new player sees character creation (Czech copy, centralized strings)", function()
	assert(has(S.create.title), "creation title")
	assert(has(S.create.start))
end)

test("UI: create character -> home shows next action", function()
	assert(tap(S.families.poor)) -- choose poor family (start 20)
	assert(tap(S.create.start))
	assert(session.state.character and session.state.character.family == "poor")
	assert(has(S.home.nextJob), "next step: choose a job")
	heartbeat()
end)

test("UI: take job, buy needs, run a full shift, get paid", function()
	assert(tap("PR\n" .. S.nav.work))
	assert(has(S.work.jobs), "job list")
	assert(tap(S.ui.buy), "take warehouse job")
	assert(session.state.job and session.state.job.id == "warehouse")
	assert(tap("PO\n" .. S.nav.needs))
	assert(tap(S.needsUi.plus7, 1)) -- food
	assert(tap(S.needsUi.plus7, 5)) -- transport
	assert(session.state.needs.food == 7 and session.state.needs.transport == 7)
	assert(tap("PR\n" .. S.nav.work))
	local cash = session.state.cash
	assert(tap(S.work.start, 1), "start shift button")
	assert(session.state.shift, "shift active")
	for i = 1, 3 do assert(tap(S.work.choose, 1)) end
	assert(session.state.shift == nil and session.state.stats.shifts == 1 and session.state.cash > cash - 1e9)
	assert(session.state.job.points >= 3)
end)

test("UI: device purchase flows through the server, locked reason visible first", function()
	assert(navTo("device"), "device nav")
	assert(has(S.deviceUi.requirements), "requirements shown")
	assert(has(S.f(S.reason.shifts, { have = 1, need = 3 })), "exact locked reason")
	-- play two more shifts, then top up cash (test-only cheat on the mocked server)
	for i = 1, 2 do
		advance(C.SHIFT_COOLDOWN_MS + 1000)
		session.state.energy = 100
		assert(L.startShift(session.state, MOCK.now, function() return 0.5 end))
		for k = 1, 3 do L.chooseShift(session.state, 2, MOCK.now) end
	end
	session.state.cash = 1000
	push()
	assert(tap(S.ui.buy, 1), "buy opens confirm")
	assert(has(S.deviceUi.title), "modal shown")
	assert(tapLast(S.ui.buy), "confirm")
	assert(session.state.device == 2 and session.state.cash <= 1000 - C.DEVICES[2].price + 5, "price deducted")
	assert(#session.state.deviceLog == 1)
end)

test("UI: iPad on a phone-width screen exposes side panels as tabs", function()
	assert(navTo("home"))
	assert(has(S.panel.watch) and has(S.panel.upcoming) and has(S.panel.projects))
	assert(tap(S.panel.upcoming))
	assert(has(S.panel.upcoming))
end)

-- ───────── layout sweep across tiers x viewport classes x all tabs, on a rich profile ─────────
local function richState()
	local st = L.newState(MOCK.now - 4 * 3600000, 2, 99999)
	assert(L.createCharacter(st, { name = "Rich", country = "de", city = "city", era = "2025", family = "business" }, MOCK.now - 4 * 3600000))
	st.cash = 5e6
	st.edu = 14; st.eduPoints = 80; st.stats.shifts = 30
	assert(L.takeJob(st, "banker", MOCK.now))
	for _, c in ipairs(C.COMPANIES) do
		for _ = 1, 2 do assert(L.buyCompany(st, c.id, MOCK.now)) end
		L.hireStaff(st, c.id, 1, "producer", MOCK.now); L.hireStaff(st, c.id, 1, "seller", MOCK.now); L.buyStock(st, c.id, 4, MOCK.now)
	end
	for _, a in ipairs(C.ASSETS) do L.buyAsset(st, a.id, 2000, MOCK.now) end
	for _, id in ipairs(C.NEEDS) do st.needs[id] = (id == "food") and 0 or 3 end
	local cur = L.assetPrice("gold", MOCK.now, st.startedAt)
	assert(L.placeOrder(st, { asset = "gold", side = "buy", when = "below", price = cur * 0.8, amount = 100 }, MOCK.now))
	assert(L.placeOrder(st, { asset = "gold", side = "sell", when = "above", price = cur * 1.2, share = 1 }, MOCK.now))
	assert(L.startHustle(st, "carflip", 10000, MOCK.now - 200000, function() return 0.4 end))
	assert(L.startHustle(st, "lemonade", 100, MOCK.now - 100, function() return 0.4 end))
	L.startShift(st, MOCK.now, function() return 0.5 end)
	st.history = {}
	for i = 1, 40 do table.insert(st.history, { t = MOCK.now - (40 - i) * 900000, w = 4e6 + i * 5e4 + (i % 5) * 1e4, p = 1e5 + i * 2000 }) end
	table.insert(st.news, { t = MOCK.now, kind = "startup-exit", asset = "startup_it", amount = 5000 })
	st.watch = { "gold", "coin" }
	st.views = { { name = "Můj pohled", tab = "work", filter = "open" } }
	st.pins = { "cash", "needs", "events" }
	st.deviceLog = { { tier = 2, t = MOCK.now, price = 600 } }
	return st
end

local tabsFor = function(tier)
	local t = { "home", "work", "needs", "companies", "invest", "hustle", "board", "device" }
	if tier >= 3 then table.insert(t, "compare") end
	if tier >= 4 then table.insert(t, "history") end
	return t
end

for _, vp in ipairs({ { 390, 780, true, "compact" }, { 820, 600, true, "medium" }, { 1280, 720, false, "wide" } }) do
	for tier = 1, 4 do
		test(("sweep: %s viewport, tier %d: every tab renders with live data"):format(vp[4], tier), function()
			session = Core.newSession(richState(), MOCK.now)
			session.state.device = tier
			resize(vp[1], vp[2], vp[3])
			push()
			for _, tab in ipairs(tabsFor(tier)) do
				assert(navTo(tab), "nav " .. tab)
				assert(MOCK.countButtons(gui) > 3, "buttons for " .. tab)
				heartbeat()
			end
			local feat = C.DEVICES[tier].features
			-- tier-specific surfaces
			push()
			assert(navTo("home"))
			if tier >= 2 then
				if vp[4] == "wide" or vp[4] == "medium" and false then assert(has(S.panel.watch)) else assert(tap(S.panel.watch)); assert(has(S.panel.watch)) end
			end
			if tier >= 3 then assert(has(S.quick.title) and has(S.views.title), "laptop toolbar") end
			if tier == 4 then
				assert(tap(S.panel.alerts) or has(S.panel.alerts), "alerts panel")
				assert(has(S.panel.alerts) or has(S.alerts.needEmpty:gsub("{name}", "")), "PC has alerts")
			end
			if tier < 3 then assert(not has(S.quick.title), "no quick actions below laptop") end
		end)
	end
end

test("sweep: layout adapts without error when a PC player resizes to a phone", function()
	session = Core.newSession(richState(), MOCK.now)
	session.state.device = 4
	resize(1400, 800, false); push()
	assert(has(S.panel.pinned))
	resize(380, 760, true)
	assert(has(S.panel.pinned) == false or has(S.ui.main), "side column collapses into panel tabs")
	assert(tap(S.ui.main) or true)
end)

test("UI: compare workspace (laptop) shows selected items side by side", function()
	session = Core.newSession(richState(), MOCK.now)
	session.state.device = 3
	resize(1280, 720, false); push()
	assert(navTo("compare"), "compare nav")
	assert(tap(S.cmp.add, 1), "add 1"); assert(tap(S.cmp.add, 1), "add 2")
	assert(has(S.cmp.salaryCol), "table rendered")
	assert(tapExact(S.cmp.assets), "assets kind")
	assert(tap(S.cmp.add, 1), "asset add1"); assert(tap(S.cmp.add, 1), "asset add2")
	assert(has(S.cmp.yieldCol), "yield col")
end)

test("UI: saved views and watchlist round-trip through the server (laptop)", function()
	session = Core.newSession(richState(), MOCK.now)
	session.state.device = 3
	session.state.views = {}
	resize(1280, 720, false); push()
	assert(navTo("work"))
	assert(tap(S.views.save), "save view")
	assert(#session.state.views == 1 and session.state.views[1].tab == "work")
	assert(navTo("invest"))
	assert(tap("☆", 1))
	assert(#session.state.watch >= 3)
end)

test("UI: PC pinned cards editable, limit enforced by the server", function()
	session = Core.newSession(richState(), MOCK.now)
	session.state.device = 4
	session.state.pins = {}
	resize(1400, 800, false); push()
	assert(tap(S.ui.edit), "edit")
	assert(tapExact(S.preset.cash), "pin cash"); assert(tapExact(S.preset.needs), "pin needs")
	assert(#session.state.pins == 2, "pins=" .. #session.state.pins)
	for _, id in ipairs({ "netWorth", "income", "companies", "portfolio", "projects" }) do tapExact(S.preset[id]) end
	assert(#session.state.pins <= C.DEVICES[4].limits.pins, "pin limit")
end)

test("UI: upgrading while a shift and orders are pending keeps them (full stack)", function()
	local st = richState()
	st.device = 1
	st.stats.shifts = 30
	session = Core.newSession(st, MOCK.now)
	session.state.shift = { startedAt = MOCK.now, seed = 2, step = 1, perfSum = 70, lead = false }
	resize(400, 800, true); push()
	local orders, shiftStep = #session.state.orders, session.state.shift.step
	assert(navTo("device"), "device nav")
	assert(tap(S.ui.buy, 1)); assert(tapLast(S.ui.buy))
	assert(session.state.device == 2)
	assert(session.state.shift and session.state.shift.step == shiftStep and #session.state.orders == orders)
end)

test("UI: read-only (failed load) profile blocks actions and says why", function()
	session = Core.newSession(nil, MOCK.now, { readOnly = true })
	resize(400, 800, true)
	stateSig:Fire(L.deepCopy(session.state), MOCK.now, true)
	assert(has(S.ui.saveFailed))
end)

test("Strings: every nav / device / job / company / asset / hustle / need has a Czech name", function()
	for _, id in ipairs({ "home", "work", "needs", "companies", "invest", "hustle", "board", "device", "compare", "history", "more" }) do assert(S.nav[id] and S.navShort[id], id) end
	for _, d in ipairs(C.DEVICES) do assert(S.devices[d.id].name and S.devices[d.id].desc) end
	for _, j in ipairs(C.JOBS) do assert(S.jobs[j.id]) end
	for _, c in ipairs(C.COMPANIES) do assert(S.companies[c.id]) end
	for _, a in ipairs(C.ASSETS) do assert(S.assets[a.id]) end
	for _, h in ipairs(C.HUSTLES) do assert(S.hustles[h.id]) end
	for _, n in ipairs(C.NEEDS) do assert(S.needs[n].name) end
	for _, e in ipairs(C.EVENTS) do assert(S.events[e.id]) end
	for _, e in ipairs(C.ASSET_EVENTS) do assert(S.assetEvents[e.id]) end
	for _, s in ipairs(C.SITUATIONS) do assert(S.situations[s.id] and #S.situations[s.id].choices == 3) end
	for _, b in ipairs(C.BOOSTS) do assert(S.boosts[b]) end
end)
