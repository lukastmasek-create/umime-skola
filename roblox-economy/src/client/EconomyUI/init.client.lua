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
