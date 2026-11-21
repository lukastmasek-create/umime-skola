--!nonstrict
-- UI kit. Every screen is built from these pieces so the whole game shares one look and one motion language.
local TweenService = game:GetService("TweenService")
local T = require(script.Parent.Theme)
local W = {}
local col = T.color

function W.new(class, props, parent)
	local o = Instance.new(class)
	for k, v in pairs(props or {}) do o[k] = v end
	if parent then o.Parent = parent end
	return o
end
local new = W.new

function W.tween(o, props, t, style, dir)
	local tw = TweenService:Create(o, TweenInfo.new(t or T.motion.base, style or Enum.EasingStyle.Quad, dir or Enum.EasingDirection.Out), props)
	tw:Play()
	return tw
end

function W.corner(o, r) return new("UICorner", { CornerRadius = UDim.new(0, r or T.radius) }, o) end
function W.stroke(o, color, th, tr)
	return new("UIStroke", { Color = color or col.line, Thickness = th or 1, Transparency = tr or 0, ApplyStrokeMode = Enum.ApplyStrokeMode.Border }, o)
end
function W.pad(o, l, t, r, b)
	return new("UIPadding", { PaddingLeft = UDim.new(0, l), PaddingTop = UDim.new(0, t or l), PaddingRight = UDim.new(0, r or l), PaddingBottom = UDim.new(0, b or t or l) }, o)
end
function W.gradient(o, seq, rot)
	return new("UIGradient", { Color = seq, Rotation = rot or 0 }, o)
end
local function nextOrder(parent)
	local n = (parent:GetAttribute("_n") or 0) + 1
	parent:SetAttribute("_n", n)
	return n
end
W.nextOrder = nextOrder

function W.begin(m, cw) W.m, W.cw = m, cw end

-- ───────── continuous animation registry (survives re-renders: phase comes from the clock) ─────────
W.spinners = setmetatable({}, { __mode = "k" }) -- UIGradient -> degrees per second
W.glows = setmetatable({}, { __mode = "k" }) -- instance -> { prop, lo, hi, speed }
function W.spin(g, speed) W.spinners[g] = speed or 90; return g end
function W.glow(o, prop, lo, hi, speed) W.glows[o] = { prop = prop, lo = lo, hi = hi, speed = speed or 2 }; return o end
function W.step()
	local t = os.clock()
	for g, speed in pairs(W.spinners) do
		if g.Parent then g.Rotation = (t * speed) % 360 end
	end
	for o, g in pairs(W.glows) do
		if o.Parent then o[g.prop] = g.lo + (g.hi - g.lo) * (0.5 + 0.5 * math.sin(t * g.speed)) end
	end
end

-- ───────── sound (built-in engine sounds only: no external asset ids) ─────────
W.muted = false
local SFX = {
	click = { id = "rbxasset://sounds/clickfast.wav", vol = 0.25, speed = 1.1 },
	good = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.35, speed = 1.3 },
	cash = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.3, speed = 1.7 },
	bad = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.3, speed = 0.55 },
	big = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.45, speed = 1.0 },
}
local soundPool = {}
function W.sound(kind)
	if W.muted or not W.gui then return end
	local d = SFX[kind]
	if not d then return end
	local s = soundPool[kind]
	if not s then
		local ok, inst = pcall(function() return new("Sound", { SoundId = d.id, Volume = d.vol, PlaybackSpeed = d.speed }, W.gui) end)
		if not ok then return end
		s = inst
		soundPool[kind] = s
	end
	pcall(function() s.TimePosition = 0; s:Play() end)
	if kind == "big" then task.delay(0.12, function() W.sound("good") end) end
end

-- ───────── formatting ─────────
function W.fmt(n)
	if type(n) ~= "number" or n ~= n then return "0" end
	local neg = n < 0
	local a = math.abs(n)
	local s
	if a >= 1e12 then s = string.format("%.2fT", a / 1e12)
	elseif a >= 1e9 then s = string.format("%.2fB", a / 1e9)
	elseif a >= 1e6 then s = string.format("%.2fM", a / 1e6)
	else
		local i = tostring(math.floor(a + 0.5))
		local out, len = {}, #i
		for k = 1, len do
			table.insert(out, i:sub(k, k))
			if (len - k) % 3 == 0 and k < len then table.insert(out, ",") end
		end
		s = table.concat(out)
	end
	return (neg and "−" or "") .. s
end
function W.dec(n, d) return string.format("%." .. (d or 2) .. "f", n) end
function W.dur(ms)
	ms = math.max(0, ms)
	local s = ms / 1000
	if s < 90 then return math.ceil(s) .. "s" end
	local m = s / 60
	if m < 90 then return math.ceil(m) .. " min" end
	local h = m / 60
	if h < 48 then return string.format("%.1f h", h) end
	return string.format("%.1f d", h / 24)
end

function W.upper(str) return string.upper(str or "") end

function W.label(parent, o)
	return new("TextLabel", {
		Size = o.size or UDim2.new(1, 0, 0, o.h or 20), Position = o.pos or UDim2.new(), BackgroundTransparency = 1, Text = o.text or "",
		TextColor3 = o.color or col.text, Font = o.font or T.font.body, TextSize = o.ts or T.size.body,
		TextXAlignment = o.align or Enum.TextXAlignment.Left, TextYAlignment = o.valign or Enum.TextYAlignment.Center,
		TextWrapped = o.wrap ~= false, TextTruncate = o.truncate or Enum.TextTruncate.None, LayoutOrder = o.order or 0,
		AnchorPoint = o.anchor or Vector2.new(), RichText = o.rich == true, AutomaticSize = o.auto or Enum.AutomaticSize.None,
		ZIndex = o.z or 1, TextTransparency = o.tt or 0,
	}, parent)
end

-- ───────── toasts (stacked, slide in from the top, colored edge + icon) ─────────
function W.attach(gui)
	W.gui = gui
	W.toastHost = new("Frame", { Size = UDim2.new(0, 380, 1, 0), Position = UDim2.new(0.5, 0, 0, 0), AnchorPoint = Vector2.new(0.5, 0), BackgroundTransparency = 1, ZIndex = 200 }, gui)
	new("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder, HorizontalAlignment = Enum.HorizontalAlignment.Center }, W.toastHost)
	W.toastPad = W.pad(W.toastHost, 0, 140, 0, 0)
	W.toastN = 0
end
local TOAST_ICON = { good = "✓", bad = "✕", warn = "!", gold = "★" }
function W.toast(text, kind)
	if not W.toastHost then return end
	kind = kind or "good"
	local color = (kind == "bad") and col.red or ((kind == "warn") and col.amber or ((kind == "gold") and col.gold or col.teal))
	local width = math.min((W.m and W.m.w or 400) - 24, 380)
	W.toastHost.Size = UDim2.new(0, width, 1, 0)
	W.toastPad.PaddingTop = UDim.new(0, W.m and (W.m.headerH + 8) or 140)
	W.toastN += 1
	local holder = new("Frame", { Size = UDim2.new(1, 0, 0, 48), BackgroundTransparency = 1, LayoutOrder = W.toastN, ZIndex = 200 }, W.toastHost)
	local f = new("Frame", { Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(0, -14), BackgroundColor3 = col.panel2, BackgroundTransparency = 1, BorderSizePixel = 0, ZIndex = 201 }, holder)
	W.corner(f, 14)
	local st = W.stroke(f, color, 1.5, 1)
	local icon = new("TextLabel", { Size = UDim2.fromOffset(28, 28), Position = UDim2.new(0, 10, 0.5, -14), BackgroundColor3 = color, BackgroundTransparency = 1, Text = TOAST_ICON[kind] or "•", Font = T.font.display, TextSize = 15, TextColor3 = col.creamInk, TextTransparency = 1, ZIndex = 202 }, f)
	W.corner(icon, 14)
	local l = W.label(f, { text = text, pos = UDim2.fromOffset(48, 0), size = UDim2.new(1, -58, 1, 0), font = T.font.bold, ts = 14, z = 202, tt = 1 })
	W.tween(f, { Position = UDim2.fromOffset(0, 0), BackgroundTransparency = 0.04 }, 0.22, Enum.EasingStyle.Back)
	W.tween(st, { Transparency = 0 }, 0.2)
	W.tween(icon, { BackgroundTransparency = 0, TextTransparency = 0 }, 0.2)
	W.tween(l, { TextTransparency = 0 }, 0.2)
	local frames = {}
	for _, c in ipairs(W.toastHost:GetChildren()) do if c:IsA("Frame") then table.insert(frames, c) end end
	table.sort(frames, function(a, b) return a.LayoutOrder < b.LayoutOrder end)
	for i = 1, #frames - 4 do frames[i]:Destroy() end
	task.delay(3.4, function()
		if not holder.Parent then return end
		W.tween(f, { Position = UDim2.fromOffset(0, -10), BackgroundTransparency = 1 }, 0.25)
		W.tween(st, { Transparency = 1 }, 0.25)
		W.tween(icon, { BackgroundTransparency = 1, TextTransparency = 1 }, 0.25)
		W.tween(l, { TextTransparency = 1 }, 0.25)
		task.delay(0.27, function() holder:Destroy() end)
	end)
	W.sound((kind == "bad" or kind == "warn") and "bad" or "good")
end

-- ───────── cards, rows, stats ─────────
-- Glass card: layered gradient fill, soft border; optional icon + title + right caption.
function W.card(parent, o)
	o = o or {}
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundColor3 = o.bg or col.panel, BorderSizePixel = 0, LayoutOrder = nextOrder(parent) }, parent)
	W.corner(f, 16)
	new("UIGradient", { Rotation = 100, Color = ColorSequence.new(col.panel2, col.panel) }, f)
	W.stroke(f, o.accent or col.lineSoft, o.accent and 1.5 or 1, o.accent and 0.15 or 0)
	W.pad(f, 14, 14, 14, 14)
	new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	if o.title then
		local h = new("Frame", { Size = UDim2.new(1, 0, 0, 26), BackgroundTransparency = 1, LayoutOrder = 0 }, f)
		local x
		if o.icon then
			local ic = new("TextLabel", { Size = UDim2.fromOffset(26, 26), BackgroundColor3 = o.accent or col.panel3, BackgroundTransparency = o.accent and 0.7 or 0, Text = o.icon, TextSize = 15, Font = T.font.body, TextColor3 = col.text }, h)
			W.corner(ic, 8)
			x = 34
		else
			local bar = new("Frame", { Size = UDim2.fromOffset(4, 18), Position = UDim2.fromOffset(0, 4), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, h)
			W.corner(bar, 2)
			if o.accent then bar.BackgroundColor3 = o.accent else W.gradient(bar, T.brandSeq, 90) end
			x = 12
		end
		new("TextLabel", { Size = UDim2.new(0.64, -x, 1, 0), Position = UDim2.fromOffset(x, 0), BackgroundTransparency = 1, Text = W.upper(o.title), Font = T.font.head, TextSize = 14, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, TextTruncate = Enum.TextTruncate.AtEnd }, h)
		if o.right then
			W.label(h, { text = o.right, size = UDim2.new(0.36, 0, 1, 0), pos = UDim2.new(0.64, 0, 0, 0), align = Enum.TextXAlignment.Right, color = o.rightColor or col.muted, ts = 12, wrap = false, font = T.font.caps })
		end
	end
	return f
end

function W.stat(parent, o)
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, 64), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 14)
	new("UIGradient", { Rotation = 90, Color = ColorSequence.new(col.panel3, col.panel2) }, f)
	W.stroke(f, o.color or col.line, 1, 0.55)
	local ix = 12
	if o.icon then
		W.label(f, { text = o.icon, pos = UDim2.fromOffset(10, 5), size = UDim2.fromOffset(18, 18), ts = 13, align = Enum.TextXAlignment.Center })
		ix = 32
	end
	W.label(f, { text = W.upper(o.label), pos = UDim2.fromOffset(ix, 6), size = UDim2.new(1, -ix - 6, 0, 14), ts = 10, color = col.muted, font = T.font.caps, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	local v = W.label(f, { text = o.value, pos = UDim2.fromOffset(12, 21), size = UDim2.new(1, -16, 0, 28), ts = o.ts or T.size.title, color = o.color or col.text, font = T.font.mono, wrap = false })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(12, 46), size = UDim2.new(1, -16, 0, 14), ts = 11, color = col.muted, wrap = false, truncate = Enum.TextTruncate.AtEnd }) end
	local line = new("Frame", { Size = UDim2.new(1, -24, 0, 2), Position = UDim2.new(0, 12, 1, -3), BackgroundColor3 = o.color or col.line, BackgroundTransparency = 0.35, BorderSizePixel = 0 }, f)
	W.corner(line, 1)
	f.Name = o.name or "Stat"
	return f, v
end

-- Buttons: pill shaped. primary = brand gradient, good = mint gradient, gold = reward gradient, danger = coral,
-- ghost = outline glass pill, select = active pink. `reason` makes it look locked and explains why on tap.
local VARIANT = {
	primary = { seq = T.brandSeq, text = Color3.new(1, 1, 1) },
	good = { seq = T.goodSeq, text = col.creamInk },
	gold = { seq = T.goldSeq, text = col.creamInk },
	danger = { seq = T.dangerSeq, text = Color3.new(1, 1, 1) },
	ghost = { fill = col.panel3, fillT = 0.45, edge = col.lineDim, text = col.text },
	select = { fill = col.magenta, fillT = 0, edge = Color3.fromHex("FF9CC2"), text = Color3.new(1, 1, 1) },
	disabled = { fill = col.disabled, fillT = 0.25, edge = col.lineSoft, text = col.faint },
}
W.hover = 0 -- number of hovered interactive elements; the shell avoids re-rendering under the cursor
local function track(b, sc, shine, hoverScale)
	local inside = false
	b.MouseEnter:Connect(function()
		if not inside then inside = true; W.hover += 1 end
		if W.m and W.m.touch then return end
		W.tween(sc, { Scale = hoverScale }, 0.1)
		if shine then W.tween(shine, { BackgroundTransparency = 0.88 }, 0.1) end
	end)
	b.MouseLeave:Connect(function()
		if inside then inside = false; W.hover = math.max(0, W.hover - 1) end
		W.tween(sc, { Scale = 1 }, 0.1)
		if shine then W.tween(shine, { BackgroundTransparency = 1 }, 0.12) end
	end)
	b.Destroying:Connect(function() if inside then inside = false; W.hover = math.max(0, W.hover - 1) end end)
	b.MouseButton1Down:Connect(function() W.tween(sc, { Scale = 0.94 }, 0.06) end)
	b.MouseButton1Up:Connect(function() W.tween(sc, { Scale = 1 }, 0.14, Enum.EasingStyle.Back) end)
end
function W.button(parent, o)
	local key = o.reason and "disabled" or (o.variant or "primary")
	local v = VARIANT[key] or VARIANT.primary
	local h = o.h or (W.m and W.m.btnH or 34)
	local text = o.text
	if o.icon then text = o.icon .. "  " .. text end
	local b = new("TextButton", {
		Size = o.size or UDim2.fromOffset(o.w or 96, h), Position = o.pos or UDim2.new(), AnchorPoint = o.anchor or Vector2.new(),
		BackgroundColor3 = v.seq and Color3.new(1, 1, 1) or v.fill, BackgroundTransparency = v.fillT or 0, Text = text, TextColor3 = v.text, Font = T.font.bold, TextSize = o.ts or 14, TextWrapped = true,
		AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or 0, ZIndex = o.z or 1,
	}, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, b)
	if v.seq then W.gradient(b, v.seq, 0) else W.stroke(b, v.edge, 1.2, 0) end
	local shine = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 1, BorderSizePixel = 0, ZIndex = b.ZIndex }, b)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, shine)
	local sc = new("UIScale", { Scale = 1 }, b)
	track(b, sc, shine, 1.04)
	b.Activated:Connect(function()
		if o.reason then W.toast(o.reason, "warn"); W.shake(b) return end
		W.sound("click")
		if o.onClick then o.onClick(b) end
	end)
	return b
end

-- Item row: optional icon bubble, title/sub/extra on the left, action buttons on the right.
-- Buttons stack under the text when the row is narrow.
function W.row(parent, o)
	local m = W.m
	local cw = (o.cw or W.cw or 320) - 28
	local actions = o.actions or {}
	local aw, gap = 0, 6
	for _, a in ipairs(actions) do a.w = a.w or math.max(76, 24 + #a.text * 7.5); aw += a.w + gap end
	local stacked = (#actions > 0) and (cw - aw < 180 or m.class == "compact")
	local ix = o.icon and 52 or 12
	local textH = (o.sub and 50 or 30) + (o.extra and 18 or 0)
	local height = textH + 8 + ((stacked and #actions > 0) and (m.btnH + 6) or 0)
	height = math.max(height, (not stacked and #actions > 0) and (m.btnH + 14) or 0, o.icon and 56 or 0)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, height), BackgroundColor3 = o.selected and col.panel3 or col.ink, BackgroundTransparency = o.selected and 0.1 or 0.45, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 12)
	if o.selected then
		W.stroke(f, col.magenta, 1.5)
		local bar = new("Frame", { Size = UDim2.new(0, 3, 1, -16), Position = UDim2.fromOffset(0, 8), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, f)
		W.gradient(bar, T.brandSeq, 90)
	elseif o.alert then
		W.stroke(f, col.red, 1.2, 0.2)
	elseif o.highlight then
		W.stroke(f, o.highlight, 1.2, 0.3)
	else
		W.stroke(f, col.lineSoft, 1, 0.3)
	end
	if o.icon then
		local ic = new("TextLabel", { Size = UDim2.fromOffset(38, 38), Position = UDim2.fromOffset(8, stacked and 9 or math.floor((height - 38) / 2)), BackgroundColor3 = o.iconColor or Color3.new(1, 1, 1), Text = o.icon, TextSize = 20, Font = T.font.body, TextColor3 = col.text, BorderSizePixel = 0 }, f)
		W.corner(ic, 11)
		if not o.iconColor then W.gradient(ic, ColorSequence.new(col.raised, col.panel3), 135) end
	end
	local tw = (stacked and cw or (cw - aw)) - (ix - 12)
	local ty = (not stacked and not o.sub and not o.extra) and math.floor((height - 22) / 2) or 6
	W.label(f, { text = o.title, pos = UDim2.fromOffset(ix, ty), size = UDim2.new(0, tw, 0, 22), font = T.font.bold, ts = T.size.label, color = o.titleColor or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(ix, 27), size = UDim2.new(0, tw, 0, 30), ts = 12, color = col.muted, valign = Enum.TextYAlignment.Top }) end
	if o.extra then W.label(f, { text = o.extra, pos = UDim2.fromOffset(ix, (o.sub and 54 or 30)), size = UDim2.new(0, tw, 0, 16), ts = 12, color = o.extraColor or col.amber, wrap = false, truncate = Enum.TextTruncate.AtEnd, font = T.font.caps }) end
	local x = stacked and ix or (cw + 16 - aw + gap)
	for _, a in ipairs(actions) do
		local y = stacked and (textH + 4) or math.floor((height - m.btnH) / 2)
		a.pos = UDim2.fromOffset(x, y)
		W.button(f, a)
		x += a.w + gap
	end
	return f
end

function W.reason(parent, text, color)
	return W.label(parent, { text = "🔒  " .. text, color = color or col.amber, ts = 13, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent), font = T.font.caps })
end
function W.note(parent, text, color)
	return W.label(parent, { text = text, color = color or col.muted, ts = 13, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end

-- Progress bar with a softly shaded fill.
function W.progress(parent, frac, color, h, order)
	frac = math.clamp(frac or 0, 0, 1)
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, math.min(h or 6, 10)), BackgroundColor3 = col.ink, BackgroundTransparency = 0.2, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent), ClipsDescendants = true }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, bar)
	local fill = new("Frame", { Size = UDim2.new(frac, 0, 1, 0), BackgroundColor3 = color or col.teal, BorderSizePixel = 0 }, bar)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, fill)
	new("UIGradient", { Color = ColorSequence.new(Color3.new(1, 1, 1), Color3.new(0.78, 0.78, 0.78)), Rotation = 90 }, fill)
	return bar
end

-- Avatar circle with a status dot
function W.avatar(parent, letter, color, size, dot)
	size = size or 34
	local a = new("TextLabel", { Size = UDim2.fromOffset(size, size), BackgroundColor3 = color or col.magenta, Text = letter, Font = T.font.display, TextSize = math.floor(size * 0.45), TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, a)
	if dot then
		local d = new("Frame", { Size = UDim2.fromOffset(10, 10), Position = UDim2.new(1, -9, 1, -9), BackgroundColor3 = dot, BorderSizePixel = 0 }, a)
		new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, d)
		W.stroke(d, col.panel, 2)
	end
	return a
end

-- Featured hero card: animated brand-gradient border, ambient glow orbs, price tag, CTA pills.
function W.hero(parent, o)
	local hgt = o.h or 220
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, hgt), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent), ClipsDescendants = true }, parent)
	W.corner(f, 20)
	new("UIGradient", { Rotation = 25, Color = ColorSequence.new(Color3.fromHex("3B1470"), Color3.fromHex("120A2A")) }, f)
	local st = W.stroke(f, Color3.new(1, 1, 1), 2, 0)
	W.spin(W.gradient(st, ColorSequence.new({
		ColorSequenceKeypoint.new(0, col.brand), ColorSequenceKeypoint.new(0.5, col.brand2), ColorSequenceKeypoint.new(1, col.sky),
	}), 0), 60)
	local orb1 = new("Frame", { Size = UDim2.fromOffset(260, 260), Position = UDim2.new(1, -120, 0, -110), BackgroundColor3 = col.brand2, BackgroundTransparency = 0.82, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, orb1)
	W.glow(orb1, "BackgroundTransparency", 0.78, 0.9, 1.3)
	local orb2 = new("Frame", { Size = UDim2.fromOffset(200, 200), Position = UDim2.new(0, -80, 1, -70), BackgroundColor3 = col.blue, BackgroundTransparency = 0.86, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, orb2)
	W.glow(orb2, "BackgroundTransparency", 0.82, 0.94, 0.9)
	local compact = W.m and W.m.class == "compact"
	W.label(f, { text = "✦  " .. W.upper(o.kicker or ""), pos = UDim2.fromOffset(22, 16), size = UDim2.new(0.6, 0, 0, 16), ts = 11, color = col.teal, font = T.font.head, wrap = false })
	if o.price then
		local tag = new("Frame", { Size = UDim2.fromOffset(math.max(70, 24 + #o.price * 10), 36), Position = UDim2.new(1, -20, 0, 14), AnchorPoint = Vector2.new(1, 0), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, Rotation = 3 }, f)
		W.corner(tag, 8)
		W.gradient(tag, T.brandSeq, 0)
		W.label(tag, { text = o.price, size = UDim2.fromScale(1, 1), color = Color3.new(1, 1, 1), font = T.font.display, ts = 15, align = Enum.TextXAlignment.Center, wrap = false })
	end
	if o.icon then
		W.label(f, { text = o.icon, pos = UDim2.new(1, -100, 1, -116), size = UDim2.fromOffset(84, 84), ts = 62, align = Enum.TextXAlignment.Center, tt = 0.1 })
	end
	W.label(f, { text = o.title, pos = UDim2.fromOffset(22, 38), size = UDim2.new(1, -44, 0, compact and 60 or 64), ts = compact and 24 or 32, color = col.text, font = T.font.display, valign = Enum.TextYAlignment.Center })
	if o.sub and o.sub ~= "" then W.label(f, { text = o.sub, pos = UDim2.fromOffset(22, compact and 98 or 104), size = UDim2.new(1, -130, 0, 40), ts = 13, color = col.muted, font = T.font.body, valign = Enum.TextYAlignment.Top }) end
	local y = hgt - 60
	local x = 22
	if o.cta then
		local w = math.max(150, 50 + #o.cta * 9)
		W.button(f, { text = "▶  " .. o.cta, variant = "good", w = w, h = 44, ts = 16, pos = UDim2.fromOffset(x, y), onClick = o.onCta })
		x += w + 10
	end
	if o.secondary then W.button(f, { text = o.secondary, variant = "ghost", w = math.max(120, 30 + #o.secondary * 8), h = 44, ts = 14, pos = UDim2.fromOffset(x, y), onClick = o.onSecondary }) end
	return f
end

-- Dashboard tile: gradient card with a big emoji, count badge, caps title, caption and a progress line.
function W.tile(parent, o)
	local f = new("TextButton", { Size = UDim2.fromOffset(o.w, o.h or 150), BackgroundColor3 = Color3.new(1, 1, 1), Text = "", AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent), ClipsDescendants = true }, parent)
	W.corner(f, 16)
	new("UIGradient", { Rotation = 135, Color = ColorSequence.new(o.color or col.tileA, o.color2 or col.tileD) }, f)
	W.stroke(f, Color3.new(1, 1, 1), 1, 0.82)
	local sc = new("UIScale", { Scale = 1 }, f)
	track(f, sc, nil, 1.04)
	f.Activated:Connect(function() W.sound("click"); if o.onClick then o.onClick() end end)
	local deco = new("Frame", { Size = UDim2.fromOffset(120, 120), Position = UDim2.new(1, -70, 0, -40), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.9, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, deco)
	W.label(f, { text = o.icon or "", pos = UDim2.fromOffset(12, 10), size = UDim2.fromOffset(48, 48), ts = 34 })
	local badge = new("TextLabel", { Size = UDim2.fromOffset(44, 26), Position = UDim2.new(1, -12, 0, 14), AnchorPoint = Vector2.new(1, 0), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.6, Text = tostring(o.num or ""), Font = T.font.display, TextSize = 14, TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, badge)
	if o.alert then badge.BackgroundColor3 = col.red; badge.BackgroundTransparency = 0; W.glow(badge, "BackgroundTransparency", 0, 0.35, 5) end
	W.label(f, { text = W.upper(o.title), pos = UDim2.new(0, 12, 1, -52), size = UDim2.new(1, -24, 0, 18), ts = 14, font = T.font.head, color = Color3.new(1, 1, 1), wrap = false, truncate = Enum.TextTruncate.AtEnd })
	W.label(f, { text = o.caption or "", pos = UDim2.new(0, 12, 1, -33), size = UDim2.new(1, -24, 0, 14), ts = 11, font = T.font.caps, color = Color3.new(1, 1, 1), tt = 0.15, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	local pb = new("Frame", { Size = UDim2.new(1, -24, 0, 5), Position = UDim2.new(0, 12, 1, -14), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.6, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pb)
	local pf = new("Frame", { Size = UDim2.new(math.clamp(o.pct or 0, 0, 1), 0, 1, 0), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, pb)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pf)
	return f
end

-- Column chart with gridlines, fading columns and a highlighted latest value.
function W.chart(parent, values, color, h, labels)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 90), BackgroundColor3 = col.ink, BackgroundTransparency = 0.2, BorderSizePixel = 0, LayoutOrder = nextOrder(parent), ClipsDescendants = true }, parent)
	W.corner(f, 12)
	W.stroke(f, col.lineSoft, 1)
	if #values < 2 then
		W.label(f, { text = labels and labels.none or "…", size = UDim2.fromScale(1, 1), color = col.muted, align = Enum.TextXAlignment.Center })
		return f
	end
	for i = 1, 3 do
		new("Frame", { Size = UDim2.new(1, 0, 0, 1), Position = UDim2.fromScale(0, i / 4), BackgroundColor3 = col.lineSoft, BackgroundTransparency = 0.4, BorderSizePixel = 0 }, f)
	end
	local lo, hi = math.huge, -math.huge
	for _, v in ipairs(values) do lo = math.min(lo, v); hi = math.max(hi, v) end
	if hi - lo < 1e-9 then hi = lo + 1 end
	local n = math.min(#values, 60)
	local step = #values / n
	local inner = new("Frame", { Size = UDim2.new(1, -12, 1, -12), Position = UDim2.fromOffset(6, 6), BackgroundTransparency = 1 }, f)
	for i = 1, n do
		local v = values[math.min(#values, math.floor((i - 1) * step) + 1)]
		local frac = 0.06 + 0.94 * (v - lo) / (hi - lo)
		local bar = new("Frame", { Size = UDim2.new(1 / n, -1, frac, 0), Position = UDim2.new((i - 1) / n, 0, 1 - frac, 0), BackgroundColor3 = color or col.line, BorderSizePixel = 0, BackgroundTransparency = (i == n) and 0 or 0.3 }, inner)
		new("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0, 0.75) }, bar)
	end
	return f, lo, hi
end

function W.chip(parent, text, color, order)
	local c = new("TextLabel", { Size = UDim2.fromOffset(math.max(40, 18 + #text * 7), 22), BackgroundColor3 = color or col.cream, Text = text, TextColor3 = col.creamInk, Font = T.font.head, TextSize = 12, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent) }, parent)
	W.corner(c, 11)
	return c
end

function W.flow(parent, h)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 0), AutomaticSize = (h and Enum.AutomaticSize.None or Enum.AutomaticSize.Y), BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Wraps = true, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	return f
end

-- Segmented selector: options = { {id, text} }, calls onPick(id)
function W.segmented(parent, options, current, onPick)
	local f = W.flow(parent)
	for i, o in ipairs(options) do
		W.button(f, { text = o.text, variant = (o.id == current) and "select" or "ghost", w = math.max(64, 24 + #o.text * 7.5), h = math.max(30, W.m.btnH - 6), ts = 13, order = i, onClick = function() onPick(o.id) end })
	end
	return f
end

-- Compare table: headers = { "", col1, col2 }, rows = { { label, v1, v2, ... } }
function W.table(parent, headers, rows, cw)
	local cols = #headers
	local first = math.min(140, math.floor((cw or 320) * 0.32))
	local other = math.floor(((cw or 320) - 28 - first) / math.max(1, cols - 1))
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { Padding = UDim.new(0, 2), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	local function rowOf(cells, header, idx)
		local r = new("Frame", { Size = UDim2.new(1, 0, 0, header and 30 or 28), BackgroundColor3 = header and Color3.new(1, 1, 1) or ((idx % 2 == 0) and col.panel2 or col.panel), BorderSizePixel = 0, LayoutOrder = idx }, f)
		W.corner(r, 8)
		if header then W.gradient(r, ColorSequence.new(col.blueDark, col.panel3), 0) end
		for i, text in ipairs(cells) do
			local x = (i == 1) and 8 or (first + (i - 2) * other + 8)
			W.label(r, { text = tostring(text), pos = UDim2.fromOffset(x, 0), size = UDim2.fromOffset((i == 1) and first - 8 or other - 8, header and 30 or 28), ts = 12, font = (header or i == 1) and T.font.head or T.font.mono, color = (i == 1 and not header) and col.muted or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
		end
	end
	rowOf(headers, true, 0)
	for i, r in ipairs(rows) do rowOf(r, false, i) end
	return f
end

-- ───────── dialog (fades the backdrop, pops the window) ─────────
function W.modal(title, text, buttons, opts)
	opts = opts or {}
	local overlay = new("TextButton", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 1, Text = "", AutoButtonColor = false, ZIndex = 150 }, W.gui)
	W.tween(overlay, { BackgroundTransparency = 0.35 }, 0.2)
	local w = math.min(W.m.w - 24, 440)
	local win = new("TextButton", { Size = UDim2.fromOffset(w, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0, ZIndex = 151, Text = "", AutoButtonColor = false }, overlay)
	W.corner(win, 20)
	new("UIGradient", { Rotation = 90, Color = ColorSequence.new(col.panel2, col.panel) }, win)
	local st = W.stroke(win, Color3.new(1, 1, 1), 1.5)
	W.gradient(st, T.brandSeq, 45)
	local sc = new("UIScale", { Scale = 0.85 }, win)
	W.tween(sc, { Scale = 1 }, 0.25, Enum.EasingStyle.Back)
	new("UIListLayout", { SortOrder = Enum.SortOrder.LayoutOrder, HorizontalAlignment = Enum.HorizontalAlignment.Center }, win)
	W.pad(win, 20, 20, 20, 18)
	if opts.icon then W.label(win, { text = opts.icon, size = UDim2.new(1, 0, 0, 56), ts = 44, align = Enum.TextXAlignment.Center, order = 0 }) end
	W.label(win, { text = W.upper(title), size = UDim2.new(1, 0, 0, 28), ts = 18, font = T.font.display, align = Enum.TextXAlignment.Center, order = 1 })
	local body = new("TextLabel", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, Text = text, TextWrapped = true, Font = T.font.body, TextSize = 15, TextColor3 = col.muted, TextXAlignment = Enum.TextXAlignment.Center, LayoutOrder = 2 }, win)
	W.pad(body, 0, 8, 0, 14)
	local row = new("Frame", { Size = UDim2.new(1, 0, 0, W.m.btnH), BackgroundTransparency = 1, LayoutOrder = 3 }, win)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 10), HorizontalAlignment = Enum.HorizontalAlignment.Center, SortOrder = Enum.SortOrder.LayoutOrder }, row)
	local closed = false
	local function close()
		if closed then return end
		closed = true
		W.tween(overlay, { BackgroundTransparency = 1 }, 0.15)
		W.tween(sc, { Scale = 0.9 }, 0.15)
		task.delay(0.16, function() overlay:Destroy() end)
	end
	overlay.Activated:Connect(function() if opts.dismissable ~= false then close() end end)
	for i, b in ipairs(buttons or {}) do
		W.button(row, { text = b.text, variant = b.variant, w = math.max(110, 28 + #b.text * 8), order = i, onClick = function() close(); if b.onClick then b.onClick() end end })
	end
	for _, d in ipairs(win:GetDescendants()) do if d:IsA("GuiObject") then d.ZIndex = d.ZIndex + 152 end end
	return overlay
end

-- ───────── outcome feedback ─────────
function W.floatText(anchor, text, color)
	if not (W.gui and anchor and anchor.Parent) then return end
	local p, s = anchor.AbsolutePosition, anchor.AbsoluteSize
	local inset = W.gui.AbsolutePosition
	local l = new("TextLabel", { Size = UDim2.fromOffset(220, 30), Position = UDim2.fromOffset(p.X - inset.X + s.X / 2 - 110, p.Y - inset.Y + s.Y - 6), BackgroundTransparency = 1, Text = text, TextColor3 = color or col.teal, Font = T.font.display, TextSize = 24, ZIndex = 300, TextStrokeTransparency = 0.6 }, W.gui)
	local sc = new("UIScale", { Scale = 0.6 }, l)
	W.tween(sc, { Scale = 1 }, 0.25, Enum.EasingStyle.Back)
	W.tween(l, { Position = l.Position - UDim2.fromOffset(0, 54), TextTransparency = 1, TextStrokeTransparency = 1 }, 1.2)
	task.delay(1.3, function() l:Destroy() end)
end
function W.shake(frame)
	if not (frame and frame.Parent) then return end
	local p = frame.Position
	task.spawn(function()
		for i = 1, 4 do
			if not frame.Parent then return end
			W.tween(frame, { Position = p + UDim2.fromOffset((i % 2 == 0) and -5 or 5, 0) }, 0.04)
			task.wait(0.045)
		end
		if frame.Parent then W.tween(frame, { Position = p }, 0.05) end
	end)
end
function W.pulse(frame, color)
	if not (frame and frame.Parent) then return end
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color or col.teal, BackgroundTransparency = 0.5, BorderSizePixel = 0, ZIndex = 250 }, frame)
	W.corner(o, 14)
	W.tween(o, { BackgroundTransparency = 1 }, 0.6)
	task.delay(0.65, function() o:Destroy() end)
end

-- Confetti burst from the top of the screen.
local CONFETTI = { col.brand, col.brand2, col.teal, col.gold, col.sky, col.amber }
function W.confetti(count)
	if not W.gui then return end
	local size = W.gui.AbsoluteSize
	local host = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = 500 }, W.gui)
	for i = 1, (count or 70) do
		local x = math.random() * size.X
		local p = new("Frame", {
			Size = UDim2.fromOffset(math.random(6, 11), math.random(10, 16)), Position = UDim2.fromOffset(x, -20 - math.random() * 120),
			BackgroundColor3 = CONFETTI[math.random(1, #CONFETTI)], BorderSizePixel = 0, Rotation = math.random(0, 360), ZIndex = 500,
		}, host)
		if i % 3 == 0 then W.corner(p, 6) end
		local t = 1.4 + math.random() * 1.2
		W.tween(p, { Position = UDim2.fromOffset(x + (math.random() - 0.5) * 220, size.Y + 30), Rotation = p.Rotation + math.random(-540, 540) }, t, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		task.delay(t * 0.7, function() if p.Parent then W.tween(p, { BackgroundTransparency = 1 }, t * 0.3) end end)
	end
	task.delay(3, function() host:Destroy() end)
end

-- Full-screen celebration banner (device unlocks, promotions, goals).
function W.celebrate(title, sub, icon)
	if not W.gui then return end
	W.sound("big")
	W.confetti(90)
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 1, ZIndex = 400, BorderSizePixel = 0 }, W.gui)
	W.tween(o, { BackgroundTransparency = 0.45 }, 0.2)
	local box = new("Frame", { Size = UDim2.fromOffset(math.min(W.gui.AbsoluteSize.X - 40, 460), 200), Position = UDim2.fromScale(0.5, 0.45), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, ZIndex = 401 }, o)
	local sc = new("UIScale", { Scale = 0.4 }, box)
	W.tween(sc, { Scale = 1 }, 0.45, Enum.EasingStyle.Back)
	local i = W.label(box, { text = icon or "🎉", size = UDim2.new(1, 0, 0, 80), ts = 64, align = Enum.TextXAlignment.Center, z = 402 })
	local t = W.label(box, { text = W.upper(title), pos = UDim2.fromOffset(0, 84), size = UDim2.new(1, 0, 0, 44), ts = 34, font = T.font.display, align = Enum.TextXAlignment.Center, z = 402 })
	W.gradient(t, T.goldSeq, 90)
	local s = W.label(box, { text = sub or "", pos = UDim2.fromOffset(0, 130), size = UDim2.new(1, 0, 0, 40), ts = 16, color = col.text, align = Enum.TextXAlignment.Center, font = T.font.bold, z = 402 })
	task.delay(1.9, function()
		if not o.Parent then return end
		W.tween(o, { BackgroundTransparency = 1 }, 0.3)
		W.tween(i, { TextTransparency = 1 }, 0.3); W.tween(t, { TextTransparency = 1 }, 0.3); W.tween(s, { TextTransparency = 1 }, 0.3)
		task.delay(0.32, function() o:Destroy() end)
	end)
end
function W.deviceFlash(text) W.celebrate(text, nil, "📲") end

return W
