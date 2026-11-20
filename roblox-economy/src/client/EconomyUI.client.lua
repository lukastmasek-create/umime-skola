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
