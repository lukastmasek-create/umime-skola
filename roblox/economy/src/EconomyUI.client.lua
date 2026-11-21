--!nonstrict
-- Client shell: one product, four device tiers (Phone / Tablet / Laptop / Gaming PC).
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

local player = Players.LocalPlayer
local col = T.color

local gui = Instance.new("ScreenGui")
gui.Name = "EconomyGui"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = false
gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets -- respects notches and the Roblox top bar
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.DisplayOrder = 10
gui.Parent = player:WaitForChild("PlayerGui")
W.begin(T.metrics(gui.AbsoluteSize, UserInputService.TouchEnabled), 320)
W.attach(gui)

-- ───────── HUD backdrop: navy void, tactical grid, slow-spinning rings (outside the shell, never restarts) ─────────
local backdrop = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, ZIndex = 0 }, gui)
W.new("UIGradient", { Rotation = 90, Color = ColorSequence.new(col.ink2, col.ink) }, backdrop)
do
	local grid = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = 0 }, backdrop)
	for i = 1, 60 do
		W.new("Frame", { Position = UDim2.new(0, i * 40, 0, 0), Size = UDim2.new(0, 1, 1, 0), BackgroundColor3 = col.line, BackgroundTransparency = (i % 5 == 0) and 0.9 or 0.96, BorderSizePixel = 0, ZIndex = 0 }, grid)
	end
	for i = 1, 40 do
		W.new("Frame", { Position = UDim2.new(0, 0, 0, i * 40), Size = UDim2.new(1, 0, 0, 1), BackgroundColor3 = col.line, BackgroundTransparency = (i % 5 == 0) and 0.9 or 0.96, BorderSizePixel = 0, ZIndex = 0 }, grid)
	end
	-- big HUD ring cluster bottom-left and a hologram platform bottom-right
	local cluster = W.new("Frame", { Size = UDim2.fromOffset(420, 420), Position = UDim2.new(0, -140, 1, -260), BackgroundTransparency = 1, ZIndex = 0 }, backdrop)
	for i, spec in ipairs({ { 1, 0.85, 12 }, { 0.78, 0.8, -20 }, { 0.56, 0.75, 35 }, { 0.34, 0.85, -50 } }) do
		local r = W.new("Frame", { Size = UDim2.fromScale(spec[1], spec[1]), Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, ZIndex = 0 }, cluster)
		W.round(r)
		local st = W.stroke(r, col.line, (i == 1) and 2 or 1, spec[2])
		W.spin(W.new("UIGradient", { Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0), NumberSequenceKeypoint.new(0.3, 0), NumberSequenceKeypoint.new(0.31, 1), NumberSequenceKeypoint.new(0.6, 1), NumberSequenceKeypoint.new(0.61, 0), NumberSequenceKeypoint.new(0.8, 0), NumberSequenceKeypoint.new(0.81, 1), NumberSequenceKeypoint.new(1, 1) }) }, st), spec[3])
	end
	local plat = W.new("Frame", { Size = UDim2.fromOffset(360, 140), Position = UDim2.new(1, -300, 1, -110), BackgroundTransparency = 1, ZIndex = 0 }, backdrop)
	for i = 1, 3 do
		local e = W.new("Frame", { Size = UDim2.new(1 - i * 0.2, 0, 0.36 - i * 0.07, 0), Position = UDim2.new(0.5, 0, 0.5 + i * 0.07, 0), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundColor3 = col.line, BackgroundTransparency = 0.97, ZIndex = 0 }, plat)
		W.round(e)
		W.glow(W.stroke(e, col.line, 1.5, 0.75), "Transparency", 0.6, 0.9, 1 + i * 0.4)
	end
end

-- ───────── splash: reticle boot screen with a segmented loader ─────────
local splash = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = col.ink, BorderSizePixel = 0, ZIndex = 600 }, gui)
do
	W.reticle(splash, UDim2.new(0.5, 0, 0.42, -90), 110, col.line, 601)
	local logo = W.label(splash, { text = S.ui.title, size = UDim2.new(1, 0, 0, 56), pos = UDim2.new(0, 0, 0.42, -24), ts = 40, font = T.font.display, color = col.line, align = Enum.TextXAlignment.Center, z = 601 })
	W.glow(logo, "TextTransparency", 0, 0.25, 2)
	W.label(splash, { text = "// " .. W.upper(S.ui.tagline) .. " //", size = UDim2.new(1, 0, 0, 20), pos = UDim2.new(0, 0, 0.42, 34), ts = 14, font = T.font.head, color = col.muted, align = Enum.TextXAlignment.Center, z = 601 })
	local track = W.new("Frame", { Size = UDim2.fromOffset(260, 10), Position = UDim2.new(0.5, -130, 0.42, 66), BackgroundTransparency = 1, ZIndex = 601 }, splash)
	W.new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 3) }, track)
	for i = 1, 16 do
		local seg = W.new("Frame", { Size = UDim2.new(1 / 16, -3, 1, 0), BackgroundColor3 = col.line, BorderSizePixel = 0, ZIndex = 601, LayoutOrder = i }, track)
		W.glow(seg, "BackgroundTransparency", 0, 0.9, 5)
		W.glows[seg].phase = -i * 0.35
	end
	W.label(splash, { text = W.upper(S.ui.loading), size = UDim2.new(1, 0, 0, 20), pos = UDim2.new(0, 0, 0.42, 84), ts = 13, font = T.font.head, color = col.line, align = Enum.TextXAlignment.Center, z = 601 })
	W.label(splash, { text = S.ui.tips[math.random(1, #S.ui.tips)], size = UDim2.new(1, -40, 0, 40), pos = UDim2.new(0, 20, 1, -70), ts = 14, color = col.muted, align = Enum.TextXAlignment.Center, z = 601 })
	W.brackets(splash, 40, col.lineDim, 2, 20, 601)
end
local function dismissSplash()
	if not splash or not splash.Parent then return end
	local s = splash
	splash = nil
	for _, d in ipairs(s:GetDescendants()) do
		if d:IsA("TextLabel") then W.tween(d, { TextTransparency = 1 }, 0.35) elseif d:IsA("Frame") then W.tween(d, { BackgroundTransparency = 1 }, 0.35) end
	end
	W.tween(s, { BackgroundTransparency = 1 }, 0.4)
	task.delay(0.45, function() s:Destroy() end)
end

local remotes = ReplicatedStorage:WaitForChild("EconomyRemotes")
local actionRF = remotes:WaitForChild("Action")
local boardRF = remotes:WaitForChild("Board")
local stateRE = remotes:WaitForChild("State")
local noticeRE = remotes:WaitForChild("Notice")

local state, readOnly = nil, false
local ui = {
	tab = "home", filter = {}, company = nil, orderAsset = nil, cmpKind = "jobs", cmpSel = {}, panelTab = nil,
	previewTier = nil, board = nil, pinEdit = false, pick = { country = "us", city = "town", era = "2025", family = "middle", name = player.DisplayName },
}
local function nowMs() return math.floor(workspace:GetServerTimeNow() * 1000) end

-- ───────── actions: request ids, retry on transport failure, outcome feedback ─────────
local inflight = false
local refs = {} -- live references for header animation
local render, rebuildShell

local BAD = { fired = true, lost = true, warned = true, sick = true, ["promo-rejected"] = true, ["raise-rejected"] = true }
local function act(name, ...)
	if inflight then return false end
	inflight = true
	local reqId = HttpService:GenerateGUID(false)
	local args = table.pack(...)
	local before = state and state.cash or 0
	local ok, info, extra
	for attempt = 1, 3 do
		local success, a, b, c = pcall(function() return actionRF:InvokeServer(name, reqId, table.unpack(args, 1, args.n)) end)
		if success then ok, info, extra = a, b, c break end
		task.wait(0.5 * attempt) -- same reqId: the server replays, never double-charges
	end
	inflight = false
	if ok == nil then W.toast(S.err["save-unavailable"], "bad") return false end
	if ok then
		local msg = S.evt[info]
		if info == "device" then
			W.celebrate(S.f(S.deviceUi.unlocked, { name = S.devices[C.DEVICES[extra].id].name }), S.devices[C.DEVICES[extra].id].tag, "📲")
		elseif info == "promoted" then
			W.celebrate(msg, state and state.job and S.jobs[state.job.id] or nil, "🏅")
		elseif info == "milestone" or info == "daily" or info == "mission" then
			W.toast(S.f(msg, { n = W.fmt(extra or 0) }), "gold"); W.confetti(50); W.sound("cash")
		elseif info == "fired" then
			W.modal(msg, S.work.noJob, { { text = S.ui.close, variant = "ghost" }, { text = S.work.jobs, variant = "primary", onClick = function() ui.tab = "work"; render(true) end } }, { icon = "📦" })
		elseif msg then
			W.toast(S.f(msg, { n = extra and W.fmt(extra) or "" }), BAD[info] and "bad" or "good")
		else
			W.sound("click")
		end
		task.delay(0.15, function()
			if not state or not refs.cash then return end
			local delta = state.cash - before
			if info == "shift-done" and extra then
				W.floatText(refs.cash, "+" .. W.fmt(extra), col.teal); W.pulse(refs.cash, col.teal); W.sound("cash")
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
	render(true)
	return ok
end

local function go(tab)
	if ui.tab ~= tab then ui.animate = true end
	ui.tab = tab
	ui.panelTab = nil
	render(true)
	if tab == "board" then
		task.spawn(function()
			local ok, list = pcall(function() return boardRF:InvokeServer() end)
			if ok then ui.board = list; render(true) end
		end)
	end
end

-- ───────── creation screen ─────────
local function createScreen(ctx, parent)
	W.hero(parent, { kicker = S.create.welcome, title = S.ui.title, sub = S.create.pitch, icon = "◎", h = ctx.m.class == "compact" and 190 or 210 })
	local card = W.card(parent, { title = S.create.title, icon = "▣", accent = col.line })
	W.note(card, S.create.hint)
	local nameRow = W.new("Frame", { Size = UDim2.new(1, 0, 0, 48), BackgroundTransparency = 1, LayoutOrder = W.nextOrder(card) }, card)
	W.chamfer(nameRow, { cut = 10, corners = { tl = true, br = true }, fill = col.ink, fillT = 0.3, line = col.lineDim, z = 1 })
	W.label(nameRow, { text = "// " .. W.upper(S.create.name), pos = UDim2.fromOffset(14, 0), size = UDim2.fromOffset(90, 48), color = col.line, font = T.font.head, ts = 13 })
	local box = W.new("TextBox", { Size = UDim2.new(1, -124, 0, 34), Position = UDim2.fromOffset(108, 7), BackgroundColor3 = col.panel2, BackgroundTransparency = 0.2, BorderSizePixel = 0, TextColor3 = col.text, Text = ui.pick.name, ClearTextOnFocus = false, Font = T.font.mono, TextSize = 16, PlaceholderText = S.create.name, PlaceholderColor3 = col.faint, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 2 }, nameRow)
	W.pad(box, 10, 0, 10, 0)
	local bs = W.stroke(box, col.lineDim, 1)
	box.Focused:Connect(function() W.tween(bs, { Color = col.glow }, 0.15) end)
	box.FocusLost:Connect(function() ui.pick.name = box.Text; W.tween(bs, { Color = col.lineDim }, 0.15) end)
	local function chooser(label, key, list, names, icons)
		W.divider(card, label, col.line)
		local opts = {}
		for _, v in ipairs(list) do table.insert(opts, { id = v, text = (icons and icons[v] and (icons[v] .. " · ") or "") .. names[v] }) end
		W.segmented(card, opts, ui.pick[key], function(id) ui.pick.name = box.Text; ui.pick[key] = id; render(true) end)
	end
	chooser(S.create.country, "country", C.COUNTRIES, S.countries, S.countryFlag)
	chooser(S.create.city, "city", C.CITIES, S.cities)
	chooser(S.create.era, "era", C.ERAS, S.eras)
	chooser(S.create.family, "family", C.FAMILIES, S.families)
	local startMoney = math.round(C.FAMILY_DEF[ui.pick.family].start * C.ERA_DEF[ui.pick.era].start)
	W.row(card, { title = S.f(S.create.startMoney, { n = W.fmt(startMoney) }), icon = "$", cw = ctx.cw, highlight = col.line, actions = { { text = "▶  " .. S.create.start, variant = "good", w = 170, onClick = function()
		act("createCharacter", { name = box.Text, country = ui.pick.country, city = ui.pick.city, era = ui.pick.era, family = ui.pick.family })
	end } } })
end

-- Phone bottom bar has five slots; everything else lives under "More".
local FIVE = { home = true, work = true, needs = true, companies = true, invest = true }
local function moreScreen(ctx, parent)
	local card = W.card(parent, { title = S.nav.more, icon = S.navIcon.more })
	for _, id in ipairs(ctx.navItems) do
		if not FIVE[id] then
			local badge = (id == "goals") and L.claimableCount(state, ctx.now) or 0
			W.row(card, { title = S.nav[id], icon = S.navIcon[id], cw = ctx.cw, extra = badge > 0 and S.f(S.goals.ready, { n = badge }) or nil, extraColor = col.gold,
				actions = { { text = S.hero.panelOpen, variant = badge > 0 and "gold" or "ghost", onClick = function() go(id) end } } })
		end
	end
	W.row(card, { title = S.ui.sound, icon = "SFX", cw = ctx.cw, actions = { { text = W.muted and S.ui.soundOff or S.ui.soundOn, w = 96, variant = "ghost", onClick = function() W.muted = not W.muted; render(true) end } } })
end

-- ───────── shell (rebuilt only when layout-relevant inputs change) ─────────
local shell, mainScroll, sideScroll, barsFrame, signature, cover
local layout = {}

local function tierNow() return ui.previewTier or (state and state.device) or 1 end

local function navItems(tier)
	local list = { "home", "work", "needs", "companies", "invest", "bank", "hustle" }
	if tier >= 3 then table.insert(list, "compare") end
	if tier >= 4 then table.insert(list, "history") end
	for _, id in ipairs({ "goals", "board", "device" }) do table.insert(list, id) end
	return list
end

local function newScroll(parent, size, pos, pad)
	local sf = W.new("ScrollingFrame", { Size = size, Position = pos, BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 4, ScrollBarImageColor3 = col.lineDim, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y, ScrollingDirection = Enum.ScrollingDirection.Y }, parent)
	W.new("UIListLayout", { Padding = UDim.new(0, 10), SortOrder = Enum.SortOrder.LayoutOrder }, sf)
	W.pad(sf, pad, pad, pad, pad + 6)
	return sf
end

local function navBadge(parent, n)
	if n <= 0 then return end
	local b = W.new("Frame", { Size = UDim2.fromOffset(22, 18), Position = UDim2.new(1, -4, 0, 2), AnchorPoint = Vector2.new(1, 0), BackgroundTransparency = 1, ZIndex = 8 }, parent)
	local parts = W.chamfer(b, { cut = 5, corners = { tl = true, br = true }, fill = col.amber, fillT = 0, z = 8 })
	for _, f in ipairs(parts.fills) do W.glow(f, "BackgroundTransparency", 0, 0.35, 4) end
	W.label(b, { text = tostring(n), size = UDim2.fromScale(1, 1), ts = 12, font = T.font.head, color = col.creamInk, align = Enum.TextXAlignment.Center, z = 9 })
end

function rebuildShell()
	if shell then shell:Destroy() end
	refs = {}
	local vp = gui.AbsoluteSize
	local m = T.metrics(vp, UserInputService.TouchEnabled)
	local tier = tierNow()
	local feat = C.DEVICES[tier].features
	local hasChar = state and state.character ~= nil
	local claim = hasChar and L.claimableCount(state, nowMs()) or 0
	layout = { m = m, tier = tier, feat = feat, claim = claim }

	shell = W.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, BorderSizePixel = 0, ZIndex = 1 }, gui)
	W.begin(m, 320)

	local g = m.gutter
	local compact = m.class == "compact"
	-- top bar: HUD header plate, logo with live dot, bracketed tab strip, SFX toggle, player badge (opens the device shop)
	local topbar = W.new("Frame", { Size = UDim2.new(1, 0, 0, m.topH), BackgroundTransparency = 1 }, shell)
	W.chamfer(topbar, { cut = 16, corners = { bl = true, br = true }, fill = col.ink, fillT = 0.15, line = col.lineDim, z = 0 })
	W.new("Frame", { Position = UDim2.new(0.5, -60, 1, -3), Size = UDim2.fromOffset(120, 3), BackgroundColor3 = col.line, BorderSizePixel = 0, ZIndex = 1 }, topbar)
	local logoW = compact and 160 or 220
	local dot = W.new("Frame", { Size = UDim2.fromOffset(8, 8), Position = UDim2.new(0, g, 0.5, -4), BackgroundColor3 = col.line, BorderSizePixel = 0, ZIndex = 2 }, topbar)
	W.glow(dot, "BackgroundTransparency", 0, 0.7, 3)
	W.label(topbar, { text = S.ui.title, size = UDim2.fromOffset(logoW, m.topH), pos = UDim2.fromOffset(g + 16, 0), ts = compact and 15 or 18, font = T.font.display, color = col.line, wrap = false })

	local avatarW = compact and 128 or 210
	local badge = W.new("TextButton", { Size = UDim2.fromOffset(avatarW, m.topH - 8), Position = UDim2.new(1, -g - avatarW, 0, 4), BackgroundTransparency = 1, Text = "", AutoButtonColor = false, ZIndex = 2 }, topbar)
	local av = W.avatar(badge, string.sub(player.DisplayName, 1, 1), col.line, 36, col.line)
	av.Position = UDim2.new(1, -38, 0.5, -18)
	local nameL = W.label(badge, { text = player.DisplayName, size = UDim2.new(1, -48, 0, 18), pos = UDim2.fromOffset(0, compact and 4 or 8), align = Enum.TextXAlignment.Right, font = T.font.head, ts = 14, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	W.label(badge, { text = "SYS · " .. W.upper(S.devices[C.DEVICES[tier].id].name) .. " · " .. S.hero.online, size = UDim2.new(1, -48, 0, 14), pos = UDim2.fromOffset(0, compact and 22 or 28), align = Enum.TextXAlignment.Right, font = T.font.head, ts = 11, color = col.line, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	badge.Activated:Connect(function() W.sound("click"); go("device") end)
	refs.info = nameL

	local rightUsed = avatarW + 8
	if not compact then
		local snd = W.button(topbar, { text = W.muted and S.ui.soundOff or S.ui.soundOn, variant = W.muted and "ghost" or "select", w = 84, h = 30, ts = 12, pos = UDim2.new(1, -g - rightUsed - 84, 0.5, -15), onClick = function() W.muted = not W.muted; signature = nil; render(true) end })
		snd.Name = "Sound"
		rightUsed += 92
	end
	if RunService:IsStudio() and hasChar then
		for i = 1, #C.DEVICES do
			W.button(topbar, { text = tostring(i), variant = (ui.previewTier == i) and "select" or "ghost", w = 26, h = 24, ts = 12, pos = UDim2.new(1, -g - rightUsed - (#C.DEVICES - i + 1) * 30, 0.5, -12), onClick = function() ui.previewTier = (ui.previewTier ~= i) and i or nil; render(true) end })
		end
		rightUsed += #C.DEVICES * 30 + 6
	end
	local items = hasChar and navItems(tier) or {}
	layout.items = items
	local bottomNav = compact
	if hasChar and not bottomNav then
		local tabsX = g + logoW
		local strip = W.new("ScrollingFrame", { Size = UDim2.new(1, -tabsX - g - rightUsed, 0, m.topH), Position = UDim2.fromOffset(tabsX, 0), BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 0, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X, ScrollingDirection = Enum.ScrollingDirection.X, ZIndex = 2 }, topbar)
		W.new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 4), SortOrder = Enum.SortOrder.LayoutOrder, VerticalAlignment = Enum.VerticalAlignment.Center }, strip)
		local iconOnly = m.class == "medium"
		for i, id in ipairs(items) do
			local active = ui.tab == id
			local text = iconOnly and S.navIcon[id] or (S.navIcon[id] .. " " .. W.upper(S.nav[id]))
			local w = iconOnly and 40 or math.max(78, 40 + #S.nav[id] * 9)
			local b = W.new("TextButton", { Size = UDim2.fromOffset(w, m.topH - 18), BackgroundTransparency = 1, Text = "", AutoButtonColor = false, LayoutOrder = i, ZIndex = 2 }, strip)
			local parts = W.chamfer(b, { cut = 7, corners = { tl = true, br = true }, fill = col.line, fillT = active and 0.8 or 1, line = col.line, lineT = active and 0 or 1, z = 2 })
			local l = W.label(b, { text = text, size = UDim2.fromScale(1, 1), ts = iconOnly and 17 or 13, font = T.font.head, color = active and col.line or col.muted, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
			if active then
				W.brackets(b, 6, col.glow, 2, -3, 3)
				local u = W.new("Frame", { Size = UDim2.new(0.5, 0, 0, 2), Position = UDim2.new(0.25, 0, 1, 1), BackgroundColor3 = col.glow, BorderSizePixel = 0, ZIndex = 3 }, b)
				local usc = W.new("UIScale", { Scale = 0.2 }, u)
				W.tween(usc, { Scale = 1 }, 0.25, Enum.EasingStyle.Back)
			end
			b.MouseEnter:Connect(function() if not active then l.TextColor3 = col.text; for _, f in ipairs(parts.lines) do f.BackgroundTransparency = 0.5 end end end)
			b.MouseLeave:Connect(function() if not active then l.TextColor3 = col.muted; for _, f in ipairs(parts.lines) do f.BackgroundTransparency = 1 end end end)
			b.Activated:Connect(function() W.sound("click"); go(id) end)
			if id == "goals" then navBadge(b, claim) end
		end
	end

	-- stats strip: three headline numbers, animated
	local tw = math.floor((vp.X - 2 * g - 2 * 10) / 3)
	local statsY = m.topH + 8
	local statH = m.statsH - 12
	local function tile(i, label, color, name, icon)
		local f, v = W.stat(shell, { label = label, value = "…", color = color, size = UDim2.fromOffset(tw, statH), order = i, ts = compact and 17 or 24, icon = icon })
		f.Position = UDim2.fromOffset(g + (i - 1) * (tw + 10), statsY)
		f.Name = name
		return f, v
	end
	refs.cash, refs.cashV = tile(1, S.ui.cash, col.line, "CashTile", "$")
	refs.worth, refs.worthV = tile(2, S.ui.netWorth, col.sky, "WorthTile", "◆")
	refs.income, refs.incomeV = tile(3, S.ui.income, col.amber, "IncomeTile", "↗")

	local top = m.headerH + 4
	local bottomH = (bottomNav and hasChar) and m.navH or 0

	-- bottom navigation (phone): cut-corner glyph plates, active one lit with brackets
	if hasChar and bottomNav then
		local nav = W.new("Frame", { Size = UDim2.new(1, 0, 0, bottomH), Position = UDim2.new(0, 0, 1, -bottomH), BackgroundTransparency = 1, ZIndex = 5 }, shell)
		W.chamfer(nav, { cut = 16, corners = { tl = true, tr = true }, fill = col.ink, fillT = 0.05, line = col.lineDim, z = 5 })
		local five = { "home", "work", "needs", "companies", "invest", "more" }
		local bw = 1 / #five
		for i, id in ipairs(five) do
			local active = (ui.tab == id) or (id == "more" and not FIVE[ui.tab])
			local b = W.new("TextButton", { Size = UDim2.new(bw, -6, 1, -14), Position = UDim2.new(bw * (i - 1), 3, 0, 8), BackgroundTransparency = 1, Text = "", AutoButtonColor = false, ZIndex = 6 }, nav)
			W.chamfer(b, { cut = 8, corners = { tl = true, br = true }, fill = col.line, fillT = active and 0.78 or 0.96, line = col.line, lineT = active and 0 or 0.75, z = 6 })
			if active then W.brackets(b, 6, col.glow, 2, 2, 7) end
			W.label(b, { text = S.navIcon[id], size = UDim2.new(1, 0, 0, 26), pos = UDim2.fromOffset(0, 4), ts = 20, font = T.font.head, color = active and col.glow or col.muted, align = Enum.TextXAlignment.Center, z = 7, wrap = false })
			W.label(b, { text = W.upper(S.nav[id]), size = UDim2.new(1, 0, 0, 14), pos = UDim2.new(0, 0, 1, -20), ts = 11, font = T.font.head, color = active and col.line or col.muted, align = Enum.TextXAlignment.Center, wrap = false, z = 7 })
			local sc = W.new("UIScale", { Scale = 1 }, b)
			b.MouseButton1Down:Connect(function() W.tween(sc, { Scale = 0.92 }, 0.06) end)
			b.MouseButton1Up:Connect(function() W.tween(sc, { Scale = 1 }, 0.14, Enum.EasingStyle.Back) end)
			b.Activated:Connect(function() W.sound("click"); go(id) end)
			if id == "more" then navBadge(b, claim) end
		end
	end

	-- content region
	local areaX, areaY = 0, top
	local areaW, areaH = vp.X, vp.Y - top - bottomH
	local sideVisible = hasChar and tier >= 2 and areaW >= 900
	local sideW = sideVisible and math.min(380, math.floor(areaW * 0.34)) or 0
	local barsH = 0
	layout.areaW, layout.sideVisible, layout.sideW = areaW, sideVisible, sideW
	local mainW = areaW - sideW
	local pad = g
	layout.cw = mainW - 2 * pad - 6

	-- toolbar (laptop+): quick actions + saved views in one horizontally scrolling row above the main column
	barsFrame = nil
	if hasChar and (feat.quickActions or feat.savedViews) then
		barsH = m.btnH + 16
		barsFrame = W.new("ScrollingFrame", { Size = UDim2.fromOffset(mainW, barsH), Position = UDim2.fromOffset(areaX, areaY), BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 0, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.X, ScrollingDirection = Enum.ScrollingDirection.X }, shell)
		W.new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder, VerticalAlignment = Enum.VerticalAlignment.Center }, barsFrame)
		W.pad(barsFrame, pad, 4, pad, 4)
	end
	mainScroll = newScroll(shell, UDim2.fromOffset(mainW, areaH - barsH), UDim2.fromOffset(areaX, areaY + barsH), pad)
	layout.mainPos = mainScroll.Position
	sideScroll = nil
	if sideVisible then
		local sideBg = W.new("Frame", { Size = UDim2.fromOffset(sideW, areaH), Position = UDim2.fromOffset(areaX + mainW, areaY), BackgroundColor3 = col.ink, BackgroundTransparency = 0.45, BorderSizePixel = 0 }, shell)
		W.new("Frame", { Size = UDim2.new(0, 1, 1, 0), BackgroundColor3 = col.lineDim, BorderSizePixel = 0 }, sideBg)
		for i = 0, 3 do W.new("Frame", { Position = UDim2.new(0, -1, 0, 20 + i * 8), Size = UDim2.fromOffset(4, 4), BackgroundColor3 = col.line, BackgroundTransparency = i * 0.25, BorderSizePixel = 0 }, sideBg) end
		sideScroll = newScroll(shell, UDim2.fromOffset(sideW, areaH), UDim2.fromOffset(areaX + mainW, areaY), 10)
	end
	-- cover used for the tab-switch fade-in
	cover = W.new("Frame", { Size = mainScroll.Size, Position = mainScroll.Position, BackgroundColor3 = col.ink, BackgroundTransparency = 1, BorderSizePixel = 0, ZIndex = 3, Active = false }, shell)
	W.m = m
end

local function context(parent)
	return {
		state = state, now = nowMs(), L = L, C = C, S = S, W = W, T = T, act = act, ui = ui, m = layout.m, cw = layout.cw or 320,
		sideW = layout.sideW, feat = layout.feat, tier = layout.tier, navItems = layout.items or {}, go = go, rerender = function() render(true) end, parent = parent,
	}
end

local function clear(sf)
	for _, c in ipairs(sf:GetChildren()) do
		if not c:IsA("UIListLayout") and not c:IsA("UIPadding") then c:Destroy() end
	end
	sf:SetAttribute("_n", 0)
	sf:SetAttribute("_sec", 0)
end

local function panelsFor(tier)
	if tier >= 4 then return { "alerts", "pinned", "watch", "upcoming", "projects" } end
	return { "watch", "upcoming", "projects" }
end

local function fill()
	if not state or not mainScroll then return end
	local m, tier = layout.m, layout.tier
	local posMain = mainScroll.CanvasPosition
	local posSide = sideScroll and sideScroll.CanvasPosition
	local animate = ui.animate
	ui.animate = false
	clear(mainScroll)
	if sideScroll then clear(sideScroll) end
	if barsFrame then clear(barsFrame) end
	local cw = layout.cw
	W.begin(m, cw)
	if readOnly then W.note(W.card(mainScroll, { title = S.ui.title, icon = "⚠️", accent = col.red }), S.ui.saveFailed, col.red) end
	if ui.previewTier and ui.previewTier ~= state.device then W.note(W.card(mainScroll, { title = S.ui.studioPreview, accent = col.amber }), S.ui.preview .. " " .. S.devices[C.DEVICES[ui.previewTier].id].name, col.amber) end

	if not state.character then
		createScreen(context(mainScroll), mainScroll)
		return
	end
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
		W.segmented(mainScroll, opts, ui.panelTab or "", function(id) ui.panelTab = (id ~= "") and id or nil; ui.animate = true; render(true) end)
		showPanel = ui.panelTab
	end

	local ctx = context(mainScroll)
	if showPanel then
		Screens.panel[showPanel](ctx, mainScroll)
	else
		local tab = ui.tab
		if tab == "more" then moreScreen(ctx, mainScroll)
		elseif tab == "compare" and tier < 3 then W.reason(W.card(mainScroll, { title = S.nav.compare, icon = S.navIcon.compare }), S.f(S.ui.requires, { name = S.devices.laptop.name }))
		elseif tab == "history" and tier < 4 then W.reason(W.card(mainScroll, { title = S.nav.history, icon = S.navIcon.history }), S.f(S.ui.requires, { name = S.devices.pc.name }))
		elseif Screens[tab] then Screens[tab](ctx, mainScroll) end
	end
	if sideScroll then
		local sctx = context(sideScroll)
		sctx.cw = layout.sideW - 26
		W.begin(m, sctx.cw)
		for _, p in ipairs(panelsFor(tier)) do Screens.panel[p](sctx, sideScroll) end
	end
	if animate and cover then
		mainScroll.CanvasPosition = Vector2.new()
		mainScroll.Position = layout.mainPos + UDim2.fromOffset(0, 18)
		W.tween(mainScroll, { Position = layout.mainPos }, 0.3, Enum.EasingStyle.Quint)
		cover.BackgroundTransparency = 0
		W.tween(cover, { BackgroundTransparency = 1 }, 0.25)
	else
		task.defer(function()
			if mainScroll then mainScroll.CanvasPosition = posMain end
			if sideScroll and posSide then sideScroll.CanvasPosition = posSide end
		end)
	end
end

-- Content refresh policy. Re-building every server push (1/s) would reset hover states and animations,
-- so content refreshes immediately when something discrete changes (or the player acts), and otherwise
-- only every few seconds for countdown text — and never under the cursor or mid-press.
local function contentSig(now)
	if not state or not state.character then return "none" end
	local st = state
	local parts = { st.device, st.edu, st.eduPoints, st.phase, st.job and (st.job.id .. st.job.rank .. ":" .. st.job.points .. (st.job.lead and "L" or "")) or "-",
		st.shift and st.shift.step or "-", math.floor(st.energy / 5), #st.orders, #st.watch, #st.views, #st.pins, #st.news, L.claimableCount(st, now),
		now >= st.shiftReadyAt and 1 or 0, now >= st.restReadyAt and 1 or 0, now >= st.raiseReadyAt and 1 or 0, now >= st.arbReadyAt and 1 or 0,
		st.sickUntil > now and 1 or 0, st.vacationUntil > now and 1 or 0, math.floor(now / C.EVENT_WINDOW_MS), L.currentEvent(now) and 1 or 0, L.currentAssetEvent(now) and 1 or 0 }
	for _, id in ipairs(C.NEEDS) do table.insert(parts, math.floor(st.needs[id] * 10)) end
	table.insert(parts, math.floor((st.savings or 0) / 10)); table.insert(parts, math.floor((st.loan or 0) / 10)); table.insert(parts, #st.history)
	for _, m in ipairs(st.missions and st.missions.list or {}) do table.insert(parts, m.id .. (m.claimed and "c" or "") .. (L.missionReady(st, m, now) and "r" or "")) end
	for id, n in pairs(st.companies) do
		local s = st.setup[id]
		table.insert(parts, id .. n .. (s and (":" .. s.staff .. ":" .. math.floor(s.stock) .. ":" .. s.price .. s.output .. s.risk .. tostring(s.upgraded)) or ""))
	end
	for id, q in pairs(st.holdings) do table.insert(parts, id .. math.floor(q * 100)) end
	for id, slot in pairs(st.hustle) do table.insert(parts, id .. slot.round .. (L.hustleDue(slot, id, now) and "d" or "")) end
	return table.concat(parts, "|")
end

local pressed = false
local pending = false
local lastFill, lastSig = 0, ""
function render(force)
	if not state then return end
	dismissSplash()
	local sig = table.concat({ tostring(gui.AbsoluteSize.X), tostring(gui.AbsoluteSize.Y), tostring(tierNow()), state.character and "c" or "n", ui.tab, tostring(ui.previewTier), tostring(state.character and L.claimableCount(state, nowMs()) or 0) }, "|")
	if sig ~= signature or not shell then
		signature = sig
		rebuildShell()
		force = true
	end
	if UserInputService:GetFocusedTextBox() then return end -- never destroy a box while typing
	if pressed then pending = true return end -- never destroy a button mid-press (would eat the click)
	local now = nowMs()
	local csig = contentSig(now)
	local age = os.clock() - lastFill
	if not force then
		if csig == lastSig and (age < 5 or (W.hover > 0 and age < 12)) then return end
		if csig ~= lastSig and W.hover > 0 and age < 2 then return end
	end
	lastSig, lastFill = csig, os.clock()
	fill()
end

UserInputService.InputBegan:Connect(function(i)
	if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then pressed = true end
end)
UserInputService.InputEnded:Connect(function(i)
	if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
		pressed = false
		if pending then pending = false; task.delay(0.12, function() if not pressed then render(true) end end) end
	end
end)

gui:GetPropertyChangedSignal("AbsoluteSize"):Connect(function() signature = nil; render(true) end)

-- ───────── server events ─────────
local firstState = true
stateRE.OnClientEvent:Connect(function(st, serverNow, ro)
	state, readOnly = st, ro == true
	render(firstState)
	firstState = false
end)
noticeRE.OnClientEvent:Connect(function(kind)
	if kind == "load-failed" then
		task.spawn(function()
			while not shell do task.wait(0.2) end
			W.modal(S.ui.title, S.ui.saveFailed, { { text = "OK", variant = "primary" } }, { icon = "⚠️" })
		end)
	end
end)

-- Header values count up smoothly toward the projected value; cash is projected between pushes with
-- the same shared rates (the server stays authoritative).
local shown = { cash = nil, worth = nil, income = nil }
local function ease(key, target, dt)
	local cur = shown[key]
	if cur == nil or math.abs(target - cur) > math.max(1e9, math.abs(target) * 10) then shown[key] = target return target end
	cur += (target - cur) * math.min(1, dt * 7)
	if math.abs(target - cur) < 0.5 then cur = target end
	shown[key] = cur
	return cur
end
local acc = 0
RunService.Heartbeat:Connect(function(dt)
	W.step()
	acc += dt
	if acc < 1 / 30 or not state or not refs.cashV then return end
	local step = acc
	acc = 0
	if not state.character then
		refs.cashV.Text = "—"; refs.worthV.Text = "—"; refs.incomeV.Text = "—"
		refs.info.Text = player.DisplayName
		return
	end
	local now = nowMs()
	local r = L.rates(state, now)
	local dtH = math.clamp(now - state.lastSeen, 0, C.MAX_OFFLINE_MIN * 60000) / C.H
	local cash = ease("cash", state.cash + r.net * dtH, step)
	refs.cashV.Text = W.fmt(cash)
	refs.cashV.TextColor3 = (cash < 0) and col.red or col.teal
	refs.worthV.Text = W.fmt(ease("worth", L.netWorth(state, now), step))
	local inc = ease("income", r.net, step)
	refs.incomeV.Text = (inc >= 0 and "+" or "") .. W.fmt(inc)
	refs.incomeV.TextColor3 = (r.net >= 0) and col.amber or col.red
	local ch = state.character
	refs.info.Text = (layout.m and layout.m.class == "compact") and ch.name or ("[" .. (S.countryFlag[ch.country] or "") .. "] " .. ch.name)
end)
