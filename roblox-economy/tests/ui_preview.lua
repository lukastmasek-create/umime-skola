-- Same flow as ui_smoke, but dumps the live widget tree (JSON) for the preview renderer.
local C, L, S, Core = __mods.Config, __mods.Logic, __mods.Strings, __mods.CoreFactory(__mods.Logic, __mods.Config)
MOCK.now = 1700000000000
MOCK.touch = false
workspace = { GetServerTimeNow = function() return MOCK.now / 1000 end }
local stateSig
local session
local function push() if stateSig then stateSig:Fire(L.deepCopy(session.state), MOCK.now, false) end end
local remotes = { Action = MOCK.Instance("R"), Board = MOCK.Instance("R"), State = MOCK.Instance("R"), Notice = MOCK.Instance("R") }
remotes.Action.InvokeServer = function(self, n, reqId, ...) local ok, a, b, c = Core.invoke(session, n, reqId, MOCK.now, nil, ...) push() return ok, a, b, c end
remotes.Board.InvokeServer = function() return {} end
stateSig = remotes.State.OnClientEvent
MOCK.playerGui = MOCK.Instance("PlayerGui")
local function folder(t) return { WaitForChild = function(_, n) return t[n] or { __module = n } end } end
local hb = MOCK.Instance("H").Heartbeat
local touchEnabled = false
MOCK.services.Players = { LocalPlayer = { DisplayName = "Marta", UserId = 4242, WaitForChild = function() return MOCK.playerGui end } }
MOCK.services.ReplicatedStorage = { WaitForChild = function(_, n) if n == "Economy" then return folder({}) end return folder(remotes) end }
MOCK.services.RunService = { IsStudio = function() return false end, Heartbeat = hb }
MOCK.services.UserInputService = setmetatable({ GetFocusedTextBox = function() end, InputBegan = MOCK.Instance("x").InputBegan, InputEnded = MOCK.Instance("x").InputEnded }, { __index = function(t, k) if k == "TouchEnabled" then return MOCK.touch end end })
MOCK.services.HttpService = { GenerateGUID = function() return "guid-preview-0001" end }
__initFn({ WaitForChild = function(_, n) return { __module = n } end }, function(m) return __mods[m.__module] end)
local gui = MOCK.playerGui._children[1]

-- the same player profile for every tier
local function profile()
	local t0 = MOCK.now - 6 * 3600000
	local st = L.newState(t0, 1, 482000)
	assert(L.createCharacter(st, { name = "Marta", country = "cz", city = "city", era = "2025", family = "middle" }, t0))
	st.cash = 900000; st.edu = 10; st.eduPoints = 40; st.stats.shifts = 34
	assert(L.takeJob(st, "programmer", t0))
	st.job.rank = 2; st.job.points = 120
	for _, id in ipairs({ "shoes", "bakery", "eshop" }) do
		for _ = 1, 2 do assert(L.buyCompany(st, id, t0)) end
		L.hireStaff(st, id, 1, "producer", t0); L.hireStaff(st, id, 1, "seller", t0); L.buyStock(st, id, 6, t0)
	end
	for _, id in ipairs({ "index", "gold", "technology", "flat", "coin" }) do L.buyAsset(st, id, 6000, MOCK.now) end
	st.cash = 48200
	for _, id in ipairs(C.NEEDS) do st.needs[id] = ({ food = 0.4, drink = 2, clothing = 3, housing = 5, transport = 1.5, health = 4, leisure = 2 })[id] end
	local cur = L.assetPrice("gold", MOCK.now, st.startedAt)
	L.placeOrder(st, { asset = "gold", side = "buy", when = "below", price = cur * 0.95, amount = 2000 }, MOCK.now)
	L.startHustle(st, "reselling", 400, MOCK.now - 30000, function() return 0.4 end)
	st.history = {}
	local w = 380000
	for i = 1, 60 do w = w + math.sin(i / 4) * 9000 + 3500; table.insert(st.history, { t = MOCK.now - (60 - i) * 900000, w = w, p = w * 0.18 }) end
	table.insert(st.news, { t = MOCK.now, kind = "startup-exit", asset = "startup_it", amount = 8200 })
	table.insert(st.news, { t = MOCK.now, kind = "buy-filled", asset = "technology", amount = 1500 })
	st.watch = { "gold", "coin", "technology" }
	st.views = { { name = "Investice rychle", tab = "invest", filter = "owned" } }
	st.pins = { "cash", "income", "needs", "events" }
	st.deviceLog = { { tier = 2, t = MOCK.now, price = 600 }, { tier = 3, t = MOCK.now, price = 6000 } }
	return st
end

local esc = function(s) return (tostring(s):gsub('\\', '\\\\'):gsub('"', '\\"'):gsub('\n', '\\n')) end
local function ser(v)
	local t = type(v)
	if t == "number" then return (v ~= v or v == math.huge or v == -math.huge) and "0" or tostring(v) end
	if t == "boolean" then return tostring(v) end
	if t == "string" then return '"' .. esc(v) .. '"' end
	if t == "table" then
		if v.__path then return '"' .. v.__path .. '"' end
		local parts = {}
		for k, x in pairs(v) do if type(k) == "string" and k:sub(1, 1) ~= "_" then table.insert(parts, '"' .. k .. '":' .. ser(x)) end end
		return "{" .. table.concat(parts, ",") .. "}"
	end
	return "null"
end
local function dump(o)
	local props = {}
	for k, v in pairs(o._props) do
		if type(v) ~= "function" then table.insert(props, '"' .. k .. '":' .. ser(v)) end
	end
	local kids = {}
	for _, c in ipairs(o._children) do table.insert(kids, dump(c)) end
	return '{"c":"' .. o.ClassName .. '","p":{' .. table.concat(props, ",") .. '},"k":[' .. table.concat(kids, ",") .. ']}'
end

local shots = {
	{ "wide-home-tier%d", 1280, 720, false, "home" },
}
local function shot(name, vpx, vpy, touch, tier, tab)
	session = Core.newSession(profile(), MOCK.now)
	session.state.device = tier
	MOCK.vp = { X = vpx, Y = vpy }
	MOCK.touch = touch
	gui._sig["prop:AbsoluteSize"]:Fire()
	push()
	if tab ~= "home" then
		if not MOCK.tapExact(gui, S.navShort[tab] .. "\n" .. S.nav[tab]) and not MOCK.tapExact(gui, __mods.Widgets.upper(S.nav[tab])) then MOCK.tapExact(gui, S.navShort.more .. "\n" .. S.nav.more); MOCK.tapExact(gui, S.nav[tab]) end
	end
	MOCK.flush()
	hb:Fire(0.2)
	local shell
	for _, c in ipairs(gui._children) do if c.ClassName == "Frame" and c._props.BackgroundColor3 then shell = c end end
	print("SHOT\t" .. name .. "\t" .. vpx .. "\t" .. vpy .. "\t" .. dump(shell))
end

for tier = 1, 4 do shot("wide-home-t" .. tier, 1280, 720, false, tier, "home") end
for tier = 1, 4 do shot("phone-home-t" .. tier, 390, 780, true, tier, "home") end
shot("wide-compare-t3", 1280, 720, false, 3, "compare")
shot("wide-history-t4", 1280, 720, false, 4, "history")
shot("wide-invest-t3", 1280, 720, false, 3, "invest")
shot("phone-device-t1", 390, 780, true, 1, "device")
shot("wide-device-t2", 1280, 720, false, 2, "device")
