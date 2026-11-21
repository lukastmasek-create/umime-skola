--!nonstrict
-- HUD UI kit. Every screen is built from these pieces so the whole game shares one sci-fi look:
-- cut-corner neon frames, corner brackets, chevrons, dotted ring gauges, segmented bars, hazard plates.
-- No image assets: every shape is drawn from Frames. Diagonals use a hard-edged UIGradient (never Rotation),
-- so everything still clips correctly inside ScrollingFrames.
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

function W.corner(o, r) return new("UICorner", { CornerRadius = UDim.new(0, r or 0) }, o) end
function W.round(o) return new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, o) end
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

-- ───────── continuous animation registry (phase comes from the clock, so it survives re-renders) ─────────
W.spinners = setmetatable({}, { __mode = "k" }) -- UIGradient -> degrees per second
W.glows = setmetatable({}, { __mode = "k" }) -- instance -> { prop, lo, hi, speed }
function W.spin(g, speed) W.spinners[g] = speed or 90; return g end
function W.glow(o, prop, lo, hi, speed) W.glows[o] = { prop = prop, lo = lo, hi = hi, speed = speed or 2, phase = math.random() * 6 }; return o end
function W.step()
	local t = os.clock()
	for g, speed in pairs(W.spinners) do
		if g.Parent then g.Rotation = (t * speed) % 360 end
	end
	for o, g in pairs(W.glows) do
		if o.Parent then o[g.prop] = g.lo + (g.hi - g.lo) * (0.5 + 0.5 * math.sin(t * g.speed + g.phase)) end
	end
end

-- ───────── sound (built-in engine sounds only: no external asset ids) ─────────
W.muted = false
local SFX = {
	click = { id = "rbxasset://sounds/clickfast.wav", vol = 0.25, speed = 1.25 },
	good = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.32, speed = 1.4 },
	cash = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.3, speed = 1.8 },
	bad = { id = "rbxasset://sounds/electronicpingshort.wav", vol = 0.3, speed = 0.5 },
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

-- ───────── HUD glyphs ─────────
-- Color emoji clash with monochrome neon line-work, so icons are drawn as cyan glyphs. Known emoji map to a
-- geometric symbol; anything else becomes a two-letter callsign taken from the item's name ("PR" = Programmer).
local GLYPH = {
	["🏠"] = "⌂", ["💼"] = "▣", ["🍔"] = "◒", ["🏭"] = "▥", ["📈"] = "↗", ["🎲"] = "◈", ["🏆"] = "♛", ["📱"] = "▯",
	["⚖️"] = "⇌", ["🕘"] = "◷", ["🎯"] = "◎", ["☰"] = "≡", ["🎁"] = "✦", ["💵"] = "$", ["💰"] = "$", ["💎"] = "◆",
	["📊"] = "▤", ["🏦"] = "▦", ["🧾"] = "▤", ["🚨"] = "!", ["⚠️"] = "!", ["📰"] = "▤", ["🗞️"] = "▤", ["🗂️"] = "▦",
	["▶️"] = "▶", ["😴"] = "z", ["🏖️"] = "◐", ["🏅"] = "▲", ["💸"] = "$", ["🦺"] = "◭", ["🚪"] = "⇥", ["🎓"] = "△",
	["📚"] = "▥", ["📋"] = "≡", ["🧺"] = "◒", ["🛍️"] = "◇", ["🎬"] = "▶", ["🥫"] = "ϟ", ["📦"] = "▢", ["🛠️"] = "⊞",
	["🤝"] = "⇄", ["🧮"] = "∑", ["👔"] = "◭", ["🏷️"] = "◇", ["⚙️"] = "✲", ["⬆️"] = "↑", ["📣"] = "◁", ["📝"] = "✎",
	["🔬"] = "◉", ["🛡️"] = "◊", ["🏢"] = "▥", ["🚀"] = "▲", ["📑"] = "≡", ["✨"] = "✦", ["⭐"] = "★", ["📅"] = "▦",
	["🧩"] = "◈", ["🔔"] = "◬", ["📌"] = "◆", ["✅"] = "✓", ["📲"] = "▯", ["💻"] = "▭", ["🖥️"] = "▭", ["🪪"] = "▣",
	["🏙️"] = "▥", ["♻️"] = "↺", ["🐷"] = "$", ["🌟"] = "✦", ["🧠"] = "◎", ["📜"] = "≡", ["🧺 "] = "◒", ["⚡"] = "ϟ",
	["🔊"] = "◀)", ["🔇"] = "◀×", ["🪙"] = "◎", ["🏘️"] = "⌂", ["🥇"] = "1", ["🥈"] = "2", ["🥉"] = "3", ["🚀 "] = "▲",
	["🅰️"] = "A", ["🅱️"] = "B", ["©️"] = "C", ["🎉"] = "✦",
}
local function monogram(title)
	title = tostring(title or "")
	local a, b = title:match("^%W*(%w)%w*%W+(%w)")
	if a then return string.upper(a .. b) end
	local w = title:match("%w%w?")
	return w and string.upper(w) or "◆"
end
local function isPlain(s)
	-- ASCII, or a single symbol from Geometric Shapes / Arrows / Math / Misc Technical blocks (monochrome in fonts)
	if not s:find("[\128-\255]") then return true end
	local b1, b2 = s:byte(1, 2)
	return #s <= 3 and b1 == 0xE2 and b2 ~= nil and (b2 == 0x86 or b2 == 0x87 or b2 == 0x88 or b2 == 0x8C or b2 == 0x96 or b2 == 0x97 or b2 == 0x9C)
end
function W.glyph(icon, title)
	if icon == nil or icon == "" then return nil end
	if GLYPH[icon] then return GLYPH[icon] end
	if isPlain(icon) then return icon end
	return monogram(title)
end
W.monogram = monogram

function W.label(parent, o)
	return new("TextLabel", {
		Size = o.size or UDim2.new(1, 0, 0, o.h or 20), Position = o.pos or UDim2.new(), BackgroundTransparency = 1, Text = o.text or "",
		TextColor3 = o.color or col.text, Font = o.font or T.font.body, TextSize = o.ts or T.size.body,
		TextXAlignment = o.align or Enum.TextXAlignment.Left, TextYAlignment = o.valign or Enum.TextYAlignment.Center,
		TextWrapped = o.wrap ~= false, TextTruncate = o.truncate or Enum.TextTruncate.None, LayoutOrder = o.order or 0,
		AnchorPoint = o.anchor or Vector2.new(), RichText = o.rich == true, AutomaticSize = o.auto or Enum.AutomaticSize.None,
		ZIndex = o.z or 2, TextTransparency = o.tt or 0,
	}, parent)
end

-- ───────── primitives: cut-corner frame ─────────
local ROT = { tl = 45, tr = 135, br = 225, bl = 315 }
local POS = {
	tl = function(c) return UDim2.new(0, 0, 0, 0) end, tr = function(c) return UDim2.new(1, -c, 0, 0) end,
	br = function(c) return UDim2.new(1, -c, 1, -c) end, bl = function(c) return UDim2.new(0, 0, 1, -c) end,
}
local function seq(points)
	local kps = {}
	for _, p in ipairs(points) do table.insert(kps, NumberSequenceKeypoint.new(p[1], p[2])) end
	return NumberSequence.new(kps)
end
local FILL_SEQ = seq({ { 0, 1 }, { 0.49, 1 }, { 0.5, 0 }, { 1, 0 } })
local lineSeqCache = {}
local function lineSeq(cut, th)
	local key = cut .. ":" .. th
	if not lineSeqCache[key] then
		local d = math.clamp(th / (cut * 1.4142) * 0.5, 0.02, 0.2)
		lineSeqCache[key] = seq({ { 0, 1 }, { 0.5 - d - 0.01, 1 }, { 0.5 - d, 0 }, { 0.5 + d, 0 }, { 0.5 + d + 0.01, 1 }, { 1, 1 } })
	end
	return lineSeqCache[key]
end
local function diag(parent, corner, c, color, tr, mode, th, z)
	local f = new("Frame", { Size = UDim2.fromOffset(c, c), Position = POS[corner](c), BackgroundColor3 = color, BackgroundTransparency = tr, BorderSizePixel = 0, ZIndex = z }, parent)
	new("UIGradient", { Rotation = ROT[corner], Transparency = (mode == "fill") and FILL_SEQ or lineSeq(c, th) }, f)
	return f
end

-- Draws a chamfered frame into `host` (behind its content). o: cut, corners {tl,tr,br,bl}, fill, fillT, line, lineT, th, z.
-- Returns { fills = {...}, lines = {...}, root = Frame } so callers can recolor on hover.
function W.chamfer(host, o)
	o = o or {}
	local c = o.cut or T.cut
	local cs = o.corners or { tl = true, br = true }
	local th = o.th or 1
	local z = o.z or 1
	local root = new("Frame", { Name = "Deco", Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = z }, host)
	local parts = { fills = {}, lines = {}, root = root }
	local L, R = cs.tl and c or 0, cs.tr and c or 0
	local BL, BR = cs.bl and c or 0, cs.br and c or 0
	if o.fill then
		local ft = o.fillT or 0
		local function band(pos, size) table.insert(parts.fills, new("Frame", { Position = pos, Size = size, BackgroundColor3 = o.fill, BackgroundTransparency = ft, BorderSizePixel = 0, ZIndex = z }, root)) end
		band(UDim2.new(0, 0, 0, c), UDim2.new(1, 0, 1, -2 * c))
		band(UDim2.new(0, L, 0, 0), UDim2.new(1, -L - R, 0, c))
		band(UDim2.new(0, BL, 1, -c), UDim2.new(1, -BL - BR, 0, c))
		for corner, on in pairs(cs) do if on then table.insert(parts.fills, diag(root, corner, c, o.fill, ft, "fill", th, z)) end end
	end
	if o.line then
		local lt = o.lineT or 0
		local function edge(pos, size) table.insert(parts.lines, new("Frame", { Position = pos, Size = size, BackgroundColor3 = o.line, BackgroundTransparency = lt, BorderSizePixel = 0, ZIndex = z }, root)) end
		edge(UDim2.new(0, L, 0, 0), UDim2.new(1, -L - R, 0, th))
		edge(UDim2.new(0, BL, 1, -th), UDim2.new(1, -BL - BR, 0, th))
		edge(UDim2.new(0, 0, 0, L), UDim2.new(0, th, 1, -L - BL))
		edge(UDim2.new(1, -th, 0, R), UDim2.new(0, th, 1, -R - BR))
		for corner, on in pairs(cs) do if on then table.insert(parts.lines, diag(root, corner, c, o.line, lt, "line", th, z)) end end
	end
	return parts
end
local function recolor(parts, line, fillT)
	if line then for _, f in ipairs(parts.lines) do f.BackgroundColor3 = line end end
	if fillT then for _, f in ipairs(parts.fills) do f.BackgroundTransparency = fillT end end
end

-- L-shaped targeting brackets just inside each corner.
function W.brackets(host, size, color, th, inset, z)
	size, th, inset = size or 12, th or 2, inset or 0
	local root = new("Frame", { Name = "Brackets", Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = z or 2 }, host)
	local function bar(pos, sz) new("Frame", { Position = pos, Size = sz, BackgroundColor3 = color or col.line, BorderSizePixel = 0, ZIndex = z or 2 }, root) end
	for _, k in ipairs({ { 0, 0, 1, 1 }, { 1, 0, -1, 1 }, { 0, 1, 1, -1 }, { 1, 1, -1, -1 } }) do
		local sx, sy, dx, dy = k[1], k[2], k[3], k[4]
		local x = (dx > 0) and inset or (-inset - size)
		local y = (dy > 0) and inset or (-inset - th)
		bar(UDim2.new(sx, x, sy, y), UDim2.fromOffset(size, th))
		local x2 = (dx > 0) and inset or (-inset - th)
		local y2 = (dy > 0) and inset or (-inset - size)
		bar(UDim2.new(sx, x2, sy, y2), UDim2.fromOffset(th, size))
	end
	return root
end

-- Diagonal hazard stripes (warning / danger plates).
local HAZARD = (function()
	local pts = {}
	local n = 9
	for i = 0, n - 1 do
		local a, b = i / n, (i + 1) / n
		local v = (i % 2 == 0) and 0 or 1
		table.insert(pts, { a == 0 and 0 or a + 0.002, v })
		table.insert(pts, { b, v })
	end
	pts[#pts][1] = 1
	return seq(pts)
end)()
function W.hazard(parent, pos, size, color, z)
	local f = new("Frame", { Position = pos, Size = size, BackgroundColor3 = color or col.amber, BackgroundTransparency = 0.15, BorderSizePixel = 0, ZIndex = z or 2, ClipsDescendants = true }, parent)
	new("UIGradient", { Rotation = 45, Transparency = HAZARD }, f)
	return f
end

-- ">>>" chevron run with a travelling glow.
function W.chevrons(parent, pos, n, color, ts, z)
	local f = new("Frame", { Position = pos, Size = UDim2.fromOffset((n or 3) * (ts or 14) * 0.62, ts or 14), BackgroundTransparency = 1, ZIndex = z or 2 }, parent)
	for i = 1, (n or 3) do
		local l = W.label(f, { text = "›", pos = UDim2.fromOffset((i - 1) * (ts or 14) * 0.55, -2), size = UDim2.fromOffset(ts or 14, (ts or 14) + 2), ts = (ts or 14) + 6, color = color or col.line, font = T.font.display, align = Enum.TextXAlignment.Center, z = z or 2, wrap = false })
		W.glow(l, "TextTransparency", 0, 0.75, 3)
		W.glows[l].phase = -i * 0.6
	end
	return f
end

-- Dotted ring gauge: `n` dots around a circle, lit up to `pct`, an outer dashed spinning ring and centre text.
local DASH = seq({ { 0, 0 }, { 0.12, 0 }, { 0.13, 1 }, { 0.25, 1 }, { 0.26, 0 }, { 0.38, 0 }, { 0.39, 1 }, { 0.5, 1 }, { 0.51, 0 }, { 0.63, 0 }, { 0.64, 1 }, { 0.75, 1 }, { 0.76, 0 }, { 0.88, 0 }, { 0.89, 1 }, { 1, 1 } })
function W.ring(parent, o)
	local size = o.size or 64
	local f = new("Frame", { Position = o.pos or UDim2.new(), AnchorPoint = o.anchor or Vector2.new(), Size = UDim2.fromOffset(size, size), BackgroundTransparency = 1, ZIndex = o.z or 2, LayoutOrder = o.order or 0 }, parent)
	local outer = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = o.z or 2 }, f)
	W.round(outer)
	local st = W.stroke(outer, o.color or col.line, 1.5, 0.15)
	W.spin(new("UIGradient", { Transparency = DASH }, st), o.spin or 40)
	local inner = new("Frame", { Size = UDim2.new(1, -16, 1, -16), Position = UDim2.fromOffset(8, 8), BackgroundColor3 = o.color or col.line, BackgroundTransparency = 0.93, ZIndex = o.z or 2 }, f)
	W.round(inner)
	W.stroke(inner, o.color or col.line, 1, 0.6)
	local n = o.dots or 24
	local lit = math.floor(math.clamp(o.pct or 0, 0, 1) * n + 0.5)
	local r = size / 2 - 4
	for i = 1, n do
		local a = (i - 1) / n * math.pi * 2 - math.pi / 2
		local d = new("Frame", { Size = UDim2.fromOffset(3, 3), Position = UDim2.new(0.5, math.floor(math.cos(a) * r) - 1, 0.5, math.floor(math.sin(a) * r) - 1), BackgroundColor3 = (i <= lit) and (o.color or col.line) or col.lineSoft, BorderSizePixel = 0, ZIndex = (o.z or 2) + 1 }, f)
		W.round(d)
	end
	if o.text then W.label(f, { text = o.text, size = UDim2.fromScale(1, 1), ts = o.ts or math.floor(size * 0.24), font = T.font.head, color = o.textColor or col.text, align = Enum.TextXAlignment.Center, wrap = false, z = (o.z or 2) + 1 }) end
	return f
end

-- Crosshair reticle (decor).
function W.reticle(parent, pos, size, color, z)
	local f = new("Frame", { Position = pos, Size = UDim2.fromOffset(size, size), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, ZIndex = z or 1 }, parent)
	local ring = new("Frame", { Size = UDim2.fromScale(0.7, 0.7), Position = UDim2.fromScale(0.15, 0.15), BackgroundTransparency = 1, ZIndex = z or 1 }, f)
	W.round(ring)
	W.spin(new("UIGradient", { Transparency = DASH }, W.stroke(ring, color or col.line, 1.5, 0.3)), -25)
	local core = new("Frame", { Size = UDim2.fromScale(0.3, 0.3), Position = UDim2.fromScale(0.35, 0.35), BackgroundTransparency = 1, ZIndex = z or 1 }, f)
	W.round(core)
	W.stroke(core, color or col.line, 1, 0.4)
	for _, p in ipairs({ { 0.5, 0, 0, 0.18 }, { 0.5, 0.82, 0, 0.18 }, { 0, 0.5, 0.18, 0 }, { 0.82, 0.5, 0.18, 0 } }) do
		local vertical = p[3] == 0
		new("Frame", { Position = UDim2.new(p[1], vertical and -1 or 0, p[2], vertical and 0 or -1), Size = UDim2.new(p[3], vertical and 2 or 0, p[4], vertical and 0 or 2), BackgroundColor3 = color or col.line, BackgroundTransparency = 0.2, BorderSizePixel = 0, ZIndex = z or 1 }, f)
	end
	local dot = new("Frame", { Size = UDim2.fromOffset(4, 4), Position = UDim2.new(0.5, -2, 0.5, -2), BackgroundColor3 = color or col.line, BorderSizePixel = 0, ZIndex = z or 1 }, f)
	W.round(dot)
	W.glow(dot, "BackgroundTransparency", 0, 0.7, 4)
	return f
end

-- Divider: thin line with end caps and an optional small plate ("MESSAGE" style).
function W.divider(parent, text, color, order)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, text and 18 or 8), BackgroundTransparency = 1, LayoutOrder = order or nextOrder(parent) }, parent)
	local cy = text and 9 or 4
	new("Frame", { Position = UDim2.new(0, 0, 0, cy), Size = UDim2.new(1, 0, 0, 1), BackgroundColor3 = color or col.lineDim, BorderSizePixel = 0 }, f)
	new("Frame", { Position = UDim2.new(0, 0, 0, cy - 2), Size = UDim2.fromOffset(18, 4), BackgroundColor3 = color or col.line, BorderSizePixel = 0 }, f)
	new("Frame", { Position = UDim2.new(1, -18, 0, cy - 2), Size = UDim2.fromOffset(18, 4), BackgroundColor3 = color or col.line, BorderSizePixel = 0 }, f)
	if text then
		local w = 24 + #text * 7
		local plate = new("Frame", { Position = UDim2.new(0.5, -w / 2, 0, 0), Size = UDim2.fromOffset(w, 18), BackgroundTransparency = 1, ZIndex = 2 }, f)
		W.chamfer(plate, { cut = 5, corners = { tl = true, tr = true, bl = true, br = true }, fill = col.ink, fillT = 0, line = color or col.line, z = 2 })
		W.label(plate, { text = W.upper(text), size = UDim2.fromScale(1, 1), ts = 11, font = T.font.head, color = color or col.line, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
	end
	return f
end

-- ───────── toasts (HUD message plates stacked under the header) ─────────
function W.attach(gui)
	W.gui = gui
	W.toastHost = new("Frame", { Size = UDim2.new(0, 380, 1, 0), Position = UDim2.new(0.5, 0, 0, 0), AnchorPoint = Vector2.new(0.5, 0), BackgroundTransparency = 1, ZIndex = 200 }, gui)
	new("UIListLayout", { Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder, HorizontalAlignment = Enum.HorizontalAlignment.Center }, W.toastHost)
	W.toastPad = W.pad(W.toastHost, 0, 140, 0, 0)
	W.toastN = 0
end
local TOAST_TAG = { good = "OK", bad = "ERR", warn = "WARN", gold = "REWARD" }
function W.toast(text, kind)
	if not W.toastHost then return end
	kind = kind or "good"
	local color = (kind == "bad") and col.red or ((kind == "warn") and col.amber or ((kind == "gold") and col.gold or col.line))
	local width = math.min((W.m and W.m.w or 400) - 24, 400)
	W.toastHost.Size = UDim2.new(0, width, 1, 0)
	W.toastPad.PaddingTop = UDim.new(0, W.m and (W.m.headerH + 8) or 140)
	W.toastN += 1
	local holder = new("Frame", { Size = UDim2.new(1, 0, 0, 50), BackgroundTransparency = 1, LayoutOrder = W.toastN, ZIndex = 200 }, W.toastHost)
	local f = new("Frame", { Size = UDim2.fromScale(1, 1), Position = UDim2.fromOffset(40, 0), BackgroundTransparency = 1, ZIndex = 201 }, holder)
	W.chamfer(f, { cut = 10, corners = { tl = true, br = true }, fill = col.ink2, fillT = 0.05, line = color, z = 201 })
	if kind ~= "good" then W.hazard(f, UDim2.new(1, -46, 0, 6), UDim2.fromOffset(30, 8), color, 202) end
	local tagW = 18 + #TOAST_TAG[kind] * 8
	local tag = new("Frame", { Position = UDim2.fromOffset(12, 13), Size = UDim2.fromOffset(tagW, 24), BackgroundTransparency = 1, ZIndex = 202 }, f)
	W.chamfer(tag, { cut = 6, corners = { tl = true, br = true }, fill = color, fillT = 0, z = 202 })
	W.label(tag, { text = TOAST_TAG[kind], size = UDim2.fromScale(1, 1), ts = 12, font = T.font.head, color = col.creamInk, align = Enum.TextXAlignment.Center, wrap = false, z = 203 })
	W.label(f, { text = text, pos = UDim2.fromOffset(tagW + 22, 0), size = UDim2.new(1, -tagW - 34, 1, 0), font = T.font.bold, ts = 15, z = 202 })
	W.tween(f, { Position = UDim2.fromOffset(0, 0) }, 0.22, Enum.EasingStyle.Quint)
	local frames = {}
	for _, ch in ipairs(W.toastHost:GetChildren()) do if ch:IsA("Frame") then table.insert(frames, ch) end end
	table.sort(frames, function(a, b) return a.LayoutOrder < b.LayoutOrder end)
	for i = 1, #frames - 4 do frames[i]:Destroy() end
	task.delay(3.4, function()
		if not holder.Parent then return end
		W.tween(f, { Position = UDim2.fromOffset(-40, 0) }, 0.2)
		task.delay(0.2, function() holder:Destroy() end)
	end)
	W.sound((kind == "bad" or kind == "warn") and "bad" or "good")
end

-- ───────── cards, rows, stats ─────────
-- HUD panel: cut-corner neon frame with brackets, a title plate with chevrons and an edge notch.
-- Returns the inner body (a vertical list) so callers add rows/notes to it.
function W.card(parent, o)
	o = o or {}
	local accent = o.accent or col.lineDim
	local outer = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	W.chamfer(outer, { cut = 14, corners = { tl = true, br = true }, fill = col.panel, fillT = 0.25, line = accent, lineT = o.accent and 0 or 0.1, z = 1 })
	-- edge notch + corner ticks
	new("Frame", { Position = UDim2.new(1, -64, 0, -1), Size = UDim2.fromOffset(40, 3), BackgroundColor3 = o.accent or col.line, BorderSizePixel = 0, ZIndex = 2 }, outer)
	new("Frame", { Position = UDim2.new(0, 14, 1, -2), Size = UDim2.fromOffset(24, 3), BackgroundColor3 = o.accent or col.line, BackgroundTransparency = 0.3, BorderSizePixel = 0, ZIndex = 2 }, outer)
	local body = new("Frame", { Name = "Body", Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, ZIndex = 2 }, outer)
	W.pad(body, 16, 14, 16, 16)
	new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }, body)
	if o.title then
		local h = new("Frame", { Size = UDim2.new(1, 0, 0, 26), BackgroundTransparency = 1, LayoutOrder = 0, ZIndex = 2 }, body)
		local g = W.glyph(o.icon, o.title)
		local title = W.upper(o.title)
		local plateW = math.min(math.floor((W.cw or 320) * 0.7), (g and 34 or 16) + #title * 9 + 16)
		local plate = new("Frame", { Size = UDim2.fromOffset(plateW, 26), BackgroundTransparency = 1, ZIndex = 2 }, h)
		W.chamfer(plate, { cut = 8, corners = { tl = true, br = true }, fill = o.accent or col.line, fillT = 0.84, line = o.accent or col.line, lineT = 0.2, z = 2 })
		local x = 10
		if g then
			W.label(plate, { text = g, pos = UDim2.fromOffset(6, 0), size = UDim2.fromOffset(22, 26), ts = 15, font = T.font.head, color = o.accent or col.line, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
			x = 30
		end
		W.label(plate, { text = title, pos = UDim2.fromOffset(x, 0), size = UDim2.new(1, -x - 8, 1, 0), ts = 14, font = T.font.head, color = col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd, z = 3 })
		W.chevrons(h, UDim2.fromOffset(plateW + 8, 6), 3, o.accent or col.line, 13, 2)
		new("Frame", { Position = UDim2.new(0, plateW + 40, 0, 13), Size = UDim2.new(1, -plateW - 40 - (o.right and 110 or 0), 0, 1), BackgroundColor3 = col.lineSoft, BorderSizePixel = 0, ZIndex = 2 }, h)
		if o.right then
			W.label(h, { text = W.upper(o.right), size = UDim2.new(0, 104, 1, 0), pos = UDim2.new(1, -104, 0, 0), align = Enum.TextXAlignment.Right, color = o.rightColor or col.muted, ts = 12, wrap = false, font = T.font.head, truncate = Enum.TextTruncate.AtEnd })
		end
	end
	return body
end

function W.stat(parent, o)
	local color = o.color or col.line
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, 64), BackgroundTransparency = 1, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.chamfer(f, { cut = 10, corners = { tl = true, br = true }, fill = col.panel, fillT = 0.25, line = color, lineT = 0.35, z = 1 })
	W.brackets(f, 8, color, 2, 3, 2)
	local g = W.glyph(o.icon, o.label)
	local ix = 12
	if g then
		W.label(f, { text = g, pos = UDim2.fromOffset(10, 6), size = UDim2.fromOffset(16, 14), ts = 13, font = T.font.head, color = color, align = Enum.TextXAlignment.Center, wrap = false })
		ix = 30
	end
	W.label(f, { text = "// " .. W.upper(o.label), pos = UDim2.fromOffset(ix, 6), size = UDim2.new(1, -ix - 8, 0, 14), ts = 11, color = col.muted, font = T.font.head, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	local v = W.label(f, { text = o.value, pos = UDim2.fromOffset(12, 21), size = UDim2.new(1, -20, 0, 28), ts = o.ts or T.size.title, color = color, font = T.font.mono, wrap = false })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(12, 46), size = UDim2.new(1, -20, 0, 14), ts = 11, color = col.muted, wrap = false, truncate = Enum.TextTruncate.AtEnd }) end
	-- segmented underline
	for i = 0, 4 do
		new("Frame", { Position = UDim2.new(1, -16 - i * 9, 1, -6), Size = UDim2.fromOffset(6, 2), BackgroundColor3 = color, BackgroundTransparency = i * 0.18, BorderSizePixel = 0, ZIndex = 2 }, f)
	end
	f.Name = o.name or "Stat"
	return f, v
end

-- Buttons: cut-corner plates. primary/good = solid cyan with dark text, gold = amber, danger = red outline with
-- hazard tick, ghost = outline glass, select = lit outline. `reason` locks the button and explains why on tap.
local VARIANT = {
	primary = { fill = col.line, fillT = 0, line = col.glow, text = col.creamInk, hoverT = 0.15 },
	good = { fill = col.line, fillT = 0, line = col.glow, text = col.creamInk, hoverT = 0.15 },
	gold = { fill = col.amber, fillT = 0, line = col.gold, text = col.creamInk, hoverT = 0.15 },
	danger = { fill = col.red, fillT = 0.82, line = col.red, text = col.text, hoverT = 0.6 },
	ghost = { fill = col.line, fillT = 0.92, line = col.lineDim, text = col.text, hoverT = 0.8, hoverLine = col.line },
	select = { fill = col.line, fillT = 0.7, line = col.line, text = col.text, hoverT = 0.6 },
	disabled = { fill = col.disabled, fillT = 0.3, line = col.lineSoft, text = col.faint, hoverT = 0.3 },
}
W.hover = 0 -- number of hovered interactive elements; the shell avoids re-rendering under the cursor
local function track(b, sc, onIn, onOut)
	local inside = false
	b.MouseEnter:Connect(function()
		if not inside then inside = true; W.hover += 1 end
		if W.m and W.m.touch then return end
		W.tween(sc, { Scale = 1.03 }, 0.1)
		if onIn then onIn() end
	end)
	b.MouseLeave:Connect(function()
		if inside then inside = false; W.hover = math.max(0, W.hover - 1) end
		W.tween(sc, { Scale = 1 }, 0.1)
		if onOut then onOut() end
	end)
	b.Destroying:Connect(function() if inside then inside = false; W.hover = math.max(0, W.hover - 1) end end)
	b.MouseButton1Down:Connect(function() W.tween(sc, { Scale = 0.95 }, 0.06) end)
	b.MouseButton1Up:Connect(function() W.tween(sc, { Scale = 1 }, 0.14, Enum.EasingStyle.Back) end)
end
function W.button(parent, o)
	local key = o.reason and "disabled" or (o.variant or "primary")
	local v = VARIANT[key] or VARIANT.primary
	local h = o.h or (W.m and W.m.btnH or 34)
	local text = W.upper(o.text)
	local g = o.icon and W.glyph(o.icon, o.text)
	if g then text = g .. "  " .. text end
	if o.reason then text = "⊘ " .. text end
	local z = o.z or 2
	local b = new("TextButton", {
		Size = o.size or UDim2.fromOffset(o.w or 96, h), Position = o.pos or UDim2.new(), AnchorPoint = o.anchor or Vector2.new(),
		BackgroundTransparency = 1, Text = "", AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or 0, ZIndex = z,
	}, parent)
	local cut = math.min(9, math.floor(h / 3))
	local parts = W.chamfer(b, { cut = cut, corners = { tl = true, br = true }, fill = v.fill, fillT = v.fillT, line = v.line, z = z })
	if key == "danger" then W.hazard(b, UDim2.new(1, -cut - 14, 0, 3), UDim2.fromOffset(12, 4), col.red, z + 1) end
	local label = W.label(b, { text = text, size = UDim2.new(1, -10, 1, 0), pos = UDim2.fromOffset(5, 0), ts = o.ts or 14, font = T.font.head, color = v.text, align = Enum.TextXAlignment.Center, wrap = true, z = z + 1 })
	label.Name = "Label"
	local sc = new("UIScale", { Scale = 1 }, b)
	track(b, sc,
		function() recolor(parts, v.hoverLine or col.glow, v.hoverT) end,
		function() recolor(parts, v.line, v.fillT) end)
	b.Activated:Connect(function()
		if o.reason then W.toast(o.reason, "warn"); W.shake(b) return end
		W.sound("click")
		if o.onClick then o.onClick(b) end
	end)
	return b
end

-- Item row: cut-corner plate, optional glyph box, title/sub/extra on the left, action buttons on the right.
function W.row(parent, o)
	local m = W.m
	local cw = (o.cw or W.cw or 320) - 32
	local actions = o.actions or {}
	local aw, gap = 0, 6
	for _, a in ipairs(actions) do a.w = a.w or math.max(84, 30 + #a.text * 8.5); aw += a.w + gap end
	local stacked = (#actions > 0) and (cw - aw < 180 or m.class == "compact")
	local g = W.glyph(o.icon, o.title)
	local ix = g and 54 or 14
	local textH = (o.sub and 50 or 30) + (o.extra and 18 or 0)
	local height = textH + 8 + ((stacked and #actions > 0) and (m.btnH + 6) or 0)
	height = math.max(height, (not stacked and #actions > 0) and (m.btnH + 14) or 0, g and 56 or 0)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, height), BackgroundTransparency = 1, LayoutOrder = o.order or nextOrder(parent) }, parent)
	local lineColor = (o.selected and col.line) or (o.alert and col.red) or o.highlight or col.lineSoft
	W.chamfer(f, { cut = 9, corners = { tl = true, br = true }, fill = o.selected and col.panel3 or col.ink, fillT = o.selected and 0.2 or 0.45, line = lineColor, lineT = (o.selected or o.alert or o.highlight) and 0 or 0.2, z = 1 })
	if o.selected then
		local bar = new("Frame", { Size = UDim2.new(0, 3, 1, -24), Position = UDim2.fromOffset(3, 12), BackgroundColor3 = col.line, BorderSizePixel = 0, ZIndex = 2 }, f)
		W.glow(bar, "BackgroundTransparency", 0, 0.5, 3)
	elseif o.alert then
		W.hazard(f, UDim2.new(1, -40, 0, 4), UDim2.fromOffset(26, 5), col.red, 2)
	end
	if g then
		local box = new("Frame", { Size = UDim2.fromOffset(38, 38), Position = UDim2.fromOffset(9, stacked and 9 or math.floor((height - 38) / 2)), BackgroundTransparency = 1, ZIndex = 2 }, f)
		local tint = o.iconColor or (o.alert and col.red) or o.highlight or col.line
		W.chamfer(box, { cut = 7, corners = { tl = true, tr = true, bl = true, br = true }, fill = tint, fillT = 0.88, line = tint, lineT = 0.25, z = 2 })
		W.label(box, { text = g, size = UDim2.fromScale(1, 1), ts = (#g <= 3) and 18 or 13, font = T.font.head, color = tint, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
	end
	local tw = (stacked and cw or (cw - aw)) - (ix - 14)
	local ty = (not stacked and not o.sub and not o.extra) and math.floor((height - 22) / 2) or 6
	W.label(f, { text = o.title, pos = UDim2.fromOffset(ix, ty), size = UDim2.new(0, tw, 0, 22), font = T.font.bold, ts = T.size.label, color = o.titleColor or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(ix, 27), size = UDim2.new(0, tw, 0, 30), ts = 13, color = col.muted, valign = Enum.TextYAlignment.Top }) end
	if o.extra then W.label(f, { text = o.extra, pos = UDim2.fromOffset(ix, (o.sub and 54 or 30)), size = UDim2.new(0, tw, 0, 16), ts = 12, color = o.extraColor or col.amber, wrap = false, truncate = Enum.TextTruncate.AtEnd, font = T.font.head }) end
	local x = stacked and ix or (cw + 18 - aw + gap)
	for _, a in ipairs(actions) do
		local y = stacked and (textH + 4) or math.floor((height - m.btnH) / 2)
		a.pos = UDim2.fromOffset(x, y)
		W.button(f, a)
		x += a.w + gap
	end
	return f
end

function W.reason(parent, text, color)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 30), BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	W.hazard(f, UDim2.fromOffset(0, 4), UDim2.fromOffset(22, 22), color or col.amber, 2)
	W.label(f, { text = W.upper(text), pos = UDim2.fromOffset(32, 0), size = UDim2.new(1, -32, 1, 0), color = color or col.amber, ts = 13, font = T.font.head })
	return f
end
function W.note(parent, text, color)
	return W.label(parent, { text = text, color = color or col.muted, ts = 14, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end

-- Segmented progress bar (blocks), like the HUD loaders.
function W.progress(parent, frac, color, h, order)
	frac = math.clamp(frac or 0, 0, 1)
	local n = 16
	local lit = math.floor(frac * n + 0.5)
	if frac > 0 and lit == 0 then lit = 1 end
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, math.clamp(h or 6, 4, 10)), BackgroundTransparency = 1, LayoutOrder = order or nextOrder(parent) }, parent)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 2), SortOrder = Enum.SortOrder.LayoutOrder }, bar)
	color = color or col.line
	for i = 1, n do
		local seg = new("Frame", { Size = UDim2.new(1 / n, -2, 1, 0), BackgroundColor3 = (i <= lit) and color or col.lineSoft, BackgroundTransparency = (i <= lit) and 0 or 0.4, BorderSizePixel = 0, LayoutOrder = i }, bar)
		if i == lit then W.glow(seg, "BackgroundTransparency", 0, 0.5, 4) end
	end
	return bar
end

-- Avatar: dashed spinning ring with a letter.
function W.avatar(parent, letter, color, size, dot)
	size = size or 34
	local a = new("TextLabel", { Size = UDim2.fromOffset(size, size), BackgroundColor3 = color or col.line, BackgroundTransparency = 0.85, Text = W.upper(letter), Font = T.font.head, TextSize = math.floor(size * 0.45), TextColor3 = color or col.line, BorderSizePixel = 0, ZIndex = 2 }, parent)
	W.round(a)
	W.spin(new("UIGradient", { Transparency = DASH }, W.stroke(a, color or col.line, 1.5, 0)), 60)
	if dot then
		local d = new("Frame", { Size = UDim2.fromOffset(9, 9), Position = UDim2.new(1, -8, 1, -8), BackgroundColor3 = dot, BorderSizePixel = 0, ZIndex = 3 }, a)
		W.round(d)
		W.glow(d, "BackgroundTransparency", 0, 0.6, 3)
	end
	return a
end

-- Waveform bars (decor; the equalizer-like chart in the HUD panels).
function W.wave(parent, pos, size, color, bars, z)
	local f = new("Frame", { Position = pos, Size = size, BackgroundTransparency = 1, ZIndex = z or 2 }, parent)
	bars = bars or 18
	for i = 1, bars do
		local hgt = 0.2 + 0.8 * math.abs(math.sin(i * 1.7) * math.cos(i * 0.6))
		local b = new("Frame", { Size = UDim2.new(1 / bars, -2, hgt, 0), Position = UDim2.new((i - 1) / bars, 0, 1 - hgt, 0), BackgroundColor3 = color or col.line, BorderSizePixel = 0, ZIndex = z or 2 }, f)
		W.glow(b, "BackgroundTransparency", 0.1, 0.7, 2 + (i % 4))
	end
	return f
end

-- Featured hero panel: big cut-corner frame, brackets, reticle, chevrons, waveform, hex price plate, CTAs.
function W.hero(parent, o)
	local hgt = o.h or 220
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, hgt), BackgroundTransparency = 1, LayoutOrder = o.order or nextOrder(parent), ClipsDescendants = true }, parent)
	W.chamfer(f, { cut = 22, corners = { tl = true, br = true, tr = true }, fill = col.panel2, fillT = 0.15, line = col.line, th = 2, z = 1 })
	W.brackets(f, 16, col.glow, 2, 6, 2)
	-- scanline sweep
	local scan = new("Frame", { Size = UDim2.new(1, 0, 0, 2), Position = UDim2.fromScale(0, 0.5), BackgroundColor3 = col.line, BackgroundTransparency = 0.85, BorderSizePixel = 0, ZIndex = 2 }, f)
	W.glow(scan, "BackgroundTransparency", 0.75, 0.95, 1.5)
	local compact = W.m and W.m.class == "compact"
	if not compact then W.reticle(f, UDim2.new(1, -90, 0.5, 10), 120, col.line, 1) end
	W.wave(f, UDim2.new(1, compact and -120 or -230, 1, -40), UDim2.fromOffset(compact and 90 or 110, 26), col.line, 16, 2)
	-- kicker plate
	local k = W.upper(o.kicker or "")
	local kp = new("Frame", { Position = UDim2.fromOffset(24, 16), Size = UDim2.fromOffset(30 + #k * 8, 22), BackgroundTransparency = 1, ZIndex = 2 }, f)
	W.chamfer(kp, { cut = 6, corners = { tl = true, br = true }, fill = col.line, fillT = 0.82, line = col.line, z = 2 })
	W.label(kp, { text = "◆ " .. k, size = UDim2.fromScale(1, 1), ts = 12, color = col.line, font = T.font.head, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
	W.chevrons(f, UDim2.fromOffset(34 + #k * 8 + 6, 20), 4, col.line, 13, 2)
	if o.price then
		local pw = math.max(78, 30 + #o.price * 10)
		local tag = new("Frame", { Size = UDim2.fromOffset(pw, 34), Position = UDim2.new(1, -24 - pw, 0, 14), BackgroundTransparency = 1, ZIndex = 2 }, f)
		W.chamfer(tag, { cut = 17, corners = { tl = true, tr = true, bl = true, br = true }, fill = col.line, fillT = 0, z = 2 })
		W.label(tag, { text = W.upper(o.price), size = UDim2.fromScale(1, 1), color = col.creamInk, font = T.font.head, ts = 15, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
	end
	local g = W.glyph(o.icon, o.title)
	if g and not compact then
		W.label(f, { text = g, pos = UDim2.new(1, -120, 0.5, -20), size = UDim2.fromOffset(60, 60), ts = 34, color = col.glow, font = T.font.head, align = Enum.TextXAlignment.Center, z = 2 })
	end
	W.label(f, { text = W.upper(o.title), pos = UDim2.fromOffset(24, 44), size = UDim2.new(1, compact and -48 or -200, 0, compact and 60 or 64), ts = compact and 20 or 26, color = col.text, font = T.font.display, valign = Enum.TextYAlignment.Center })
	if o.sub and o.sub ~= "" then W.label(f, { text = o.sub, pos = UDim2.fromOffset(24, compact and 104 or 110), size = UDim2.new(1, compact and -48 or -200, 0, 40), ts = 14, color = col.muted, font = T.font.body, valign = Enum.TextYAlignment.Top }) end
	local y = hgt - 62
	local x = 24
	if o.cta then
		local w = math.max(160, 60 + #o.cta * 10)
		W.button(f, { text = "▶  " .. o.cta, variant = "good", w = w, h = 44, ts = 16, pos = UDim2.fromOffset(x, y), onClick = o.onCta })
		x += w + 10
	end
	if o.secondary then W.button(f, { text = o.secondary, variant = "ghost", w = math.max(130, 40 + #o.secondary * 9), h = 44, ts = 14, pos = UDim2.fromOffset(x, y), onClick = o.onSecondary }) end
	return f
end

-- Dashboard module: cut-corner frame, index plate, dotted ring gauge with %, title and caption.
local tileIndex = 0
function W.tile(parent, o)
	local f = new("TextButton", { Size = UDim2.fromOffset(o.w, o.h or 150), BackgroundTransparency = 1, Text = "", AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	local tint = o.alert and col.amber or col.line
	local parts = W.chamfer(f, { cut = 12, corners = { tl = true, br = true }, fill = col.panel, fillT = 0.2, line = tint, lineT = 0.3, z = 1 })
	local sc = new("UIScale", { Scale = 1 }, f)
	track(f, sc, function() recolor(parts, col.glow, 0.05) end, function() recolor(parts, tint, 0.2) end)
	f.Activated:Connect(function() W.sound("click"); if o.onClick then o.onClick() end end)
	-- index plate "01"
	local idx = string.format("%02d", o.order or 0)
	local plate = new("Frame", { Position = UDim2.fromOffset(10, 10), Size = UDim2.fromOffset(34, 20), BackgroundTransparency = 1, ZIndex = 2 }, f)
	W.chamfer(plate, { cut = 6, corners = { tl = true, br = true }, fill = tint, fillT = 0, z = 2 })
	W.label(plate, { text = idx, size = UDim2.fromScale(1, 1), ts = 12, font = T.font.head, color = col.creamInk, align = Enum.TextXAlignment.Center, wrap = false, z = 3 })
	if o.alert then W.hazard(f, UDim2.new(1, -40, 0, 14), UDim2.fromOffset(26, 8), col.amber, 2) end
	local g = W.glyph(o.icon, o.title)
	W.label(f, { text = g or "", pos = UDim2.fromOffset(50, 8), size = UDim2.fromOffset(24, 24), ts = 18, font = T.font.head, color = tint, align = Enum.TextXAlignment.Center, wrap = false })
	local rs = math.min(70, math.floor(o.w * 0.45))
	W.ring(f, { size = rs, pos = UDim2.new(0.5, 0, 0, 36), anchor = Vector2.new(0.5, 0), pct = o.pct, text = tostring(o.num or ""), color = tint, ts = (#tostring(o.num or "") > 3) and 11 or 15, z = 2, dots = 20 })
	W.label(f, { text = W.upper(o.title), pos = UDim2.new(0, 12, 1, -40), size = UDim2.new(1, -24, 0, 16), ts = 13, font = T.font.head, color = col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	W.label(f, { text = o.caption or "", pos = UDim2.new(0, 12, 1, -24), size = UDim2.new(1, -24, 0, 14), ts = 11, font = T.font.caps, color = col.muted, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	return f
end

-- Signal chart: grid, glowing columns and a highlighted latest value.
function W.chart(parent, values, color, h, labels)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 90), BackgroundTransparency = 1, LayoutOrder = nextOrder(parent), ClipsDescendants = true }, parent)
	W.chamfer(f, { cut = 10, corners = { tl = true, br = true }, fill = col.ink, fillT = 0.2, line = col.lineSoft, z = 1 })
	if #values < 2 then
		W.label(f, { text = labels and labels.none or "…", size = UDim2.fromScale(1, 1), color = col.muted, align = Enum.TextXAlignment.Center })
		return f
	end
	for i = 1, 3 do
		new("Frame", { Size = UDim2.new(1, -20, 0, 1), Position = UDim2.new(0, 10, i / 4, 0), BackgroundColor3 = col.lineSoft, BackgroundTransparency = 0.3, BorderSizePixel = 0, ZIndex = 2 }, f)
	end
	for i = 1, 9 do
		new("Frame", { Size = UDim2.new(0, 1, 1, -20), Position = UDim2.new(i / 10, 0, 0, 10), BackgroundColor3 = col.lineSoft, BackgroundTransparency = 0.6, BorderSizePixel = 0, ZIndex = 2 }, f)
	end
	local lo, hi = math.huge, -math.huge
	for _, v in ipairs(values) do lo = math.min(lo, v); hi = math.max(hi, v) end
	if hi - lo < 1e-9 then hi = lo + 1 end
	local n = math.min(#values, 60)
	local step = #values / n
	local inner = new("Frame", { Size = UDim2.new(1, -20, 1, -16), Position = UDim2.fromOffset(10, 8), BackgroundTransparency = 1, ZIndex = 2 }, f)
	for i = 1, n do
		local v = values[math.min(#values, math.floor((i - 1) * step) + 1)]
		local frac = 0.05 + 0.95 * (v - lo) / (hi - lo)
		local bar = new("Frame", { Size = UDim2.new(1 / n, -2, frac, 0), Position = UDim2.new((i - 1) / n, 0, 1 - frac, 0), BackgroundColor3 = color or col.line, BorderSizePixel = 0, BackgroundTransparency = (i == n) and 0 or 0.35, ZIndex = 2 }, inner)
		new("UIGradient", { Rotation = 90, Transparency = NumberSequence.new(0, 0.85) }, bar)
		new("Frame", { Size = UDim2.new(1, 0, 0, 2), BackgroundColor3 = col.glow, BorderSizePixel = 0, ZIndex = 3 }, bar)
	end
	return f, lo, hi
end

function W.chip(parent, text, color, order)
	local w = math.max(48, 24 + #text * 7.5)
	local c = new("Frame", { Size = UDim2.fromOffset(w, 24), BackgroundTransparency = 1, LayoutOrder = order or nextOrder(parent) }, parent)
	W.chamfer(c, { cut = 6, corners = { tl = true, br = true }, fill = color or col.line, fillT = 0.82, line = color or col.line, lineT = 0.2, z = 1 })
	W.label(c, { text = W.upper(text), size = UDim2.fromScale(1, 1), ts = 12, font = T.font.head, color = color or col.line, align = Enum.TextXAlignment.Center, wrap = false })
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
		W.button(f, { text = o.text, variant = (o.id == current) and "select" or "ghost", w = math.max(70, 30 + #o.text * 8.5), h = math.max(30, W.m.btnH - 6), ts = 13, order = i, onClick = function() onPick(o.id) end })
	end
	return f
end

-- Data table: header plate + thin-lined rows.
function W.table(parent, headers, rows, cw)
	local cols = #headers
	local first = math.min(140, math.floor((cw or 320) * 0.32))
	local other = math.floor(((cw or 320) - 32 - first) / math.max(1, cols - 1))
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { Padding = UDim.new(0, 0), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	local function rowOf(cells, header, idx)
		local r = new("Frame", { Size = UDim2.new(1, 0, 0, header and 30 or 30), BackgroundTransparency = 1, LayoutOrder = idx }, f)
		if header then
			W.chamfer(r, { cut = 8, corners = { tl = true, br = true }, fill = col.line, fillT = 0.85, line = col.line, lineT = 0.3, z = 1 })
		else
			new("Frame", { Position = UDim2.new(0, 0, 1, -1), Size = UDim2.new(1, 0, 0, 1), BackgroundColor3 = col.lineSoft, BorderSizePixel = 0 }, r)
			if idx % 2 == 0 then new("Frame", { Size = UDim2.new(1, 0, 1, -1), BackgroundColor3 = col.line, BackgroundTransparency = 0.96, BorderSizePixel = 0 }, r) end
		end
		for i, text in ipairs(cells) do
			local x = (i == 1) and 10 or (first + (i - 2) * other + 10)
			W.label(r, { text = header and W.upper(tostring(text)) or tostring(text), pos = UDim2.fromOffset(x, 0), size = UDim2.fromOffset((i == 1) and first - 10 or other - 10, 30), ts = 13, font = (header or i == 1) and T.font.head or T.font.mono, color = header and col.line or ((i == 1) and col.muted or col.text), wrap = false, truncate = Enum.TextTruncate.AtEnd })
		end
	end
	rowOf(headers, true, 0)
	for i, r in ipairs(rows) do rowOf(r, false, i) end
	return f
end

-- ───────── dialog: dimmed grid backdrop, bracketed cut-corner window, title plate, warning stripes ─────────
function W.modal(title, text, buttons, opts)
	opts = opts or {}
	local overlay = new("TextButton", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = col.ink, BackgroundTransparency = 1, Text = "", AutoButtonColor = false, ZIndex = 150 }, W.gui)
	W.tween(overlay, { BackgroundTransparency = 0.25 }, 0.2)
	local danger = false
	for _, b in ipairs(buttons or {}) do if b.variant == "danger" then danger = true end end
	local accent = danger and col.red or col.line
	local w = math.min(W.m.w - 24, 460)
	local win = new("TextButton", { Size = UDim2.fromOffset(w, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, BorderSizePixel = 0, ZIndex = 151, Text = "", AutoButtonColor = false }, overlay)
	W.chamfer(win, { cut = 20, corners = { tl = true, br = true }, fill = col.ink2, fillT = 0.02, line = accent, th = 2, z = 151 })
	W.brackets(win, 18, accent, 2, -6, 152)
	local sc = new("UIScale", { Scale = 0.85 }, win)
	W.tween(sc, { Scale = 1 }, 0.25, Enum.EasingStyle.Back)
	local body = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, ZIndex = 152 }, win)
	new("UIListLayout", { SortOrder = Enum.SortOrder.LayoutOrder, HorizontalAlignment = Enum.HorizontalAlignment.Center, Padding = UDim.new(0, 6) }, body)
	W.pad(body, 22, 22, 22, 20)
	local warn = W.upper(danger and "Warning" or "Message")
	local top = new("Frame", { Size = UDim2.new(1, 0, 0, 22), BackgroundTransparency = 1, LayoutOrder = 0, ZIndex = 152 }, body)
	W.hazard(top, UDim2.fromOffset(0, 5), UDim2.new(0.5, -70, 0, 12), accent, 152)
	W.hazard(top, UDim2.new(0.5, 70, 0, 5), UDim2.new(0.5, -70, 0, 12), accent, 152)
	W.label(top, { text = warn, size = UDim2.fromScale(1, 1), ts = 13, font = T.font.head, color = accent, align = Enum.TextXAlignment.Center, z = 153 })
	local g = W.glyph(opts.icon, title)
	if g then W.label(body, { text = g, size = UDim2.new(1, 0, 0, 44), ts = 32, font = T.font.head, color = accent, align = Enum.TextXAlignment.Center, order = 1, z = 153 }) end
	W.label(body, { text = W.upper(title), size = UDim2.new(1, 0, 0, 30), ts = 18, font = T.font.display, align = Enum.TextXAlignment.Center, order = 2, z = 153 })
	local msg = new("TextLabel", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, Text = text, TextWrapped = true, Font = T.font.body, TextSize = 15, TextColor3 = col.muted, TextXAlignment = Enum.TextXAlignment.Center, LayoutOrder = 3, ZIndex = 153 }, body)
	W.pad(msg, 0, 4, 0, 12)
	local row = new("Frame", { Size = UDim2.new(1, 0, 0, W.m.btnH), BackgroundTransparency = 1, LayoutOrder = 4, ZIndex = 153 }, body)
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
		W.button(row, { text = b.text, variant = b.variant, w = math.max(120, 36 + #b.text * 9), order = i, z = 154, onClick = function() close(); if b.onClick then b.onClick() end end })
	end
	return overlay
end

-- ───────── outcome feedback ─────────
function W.floatText(anchor, text, color)
	if not (W.gui and anchor and anchor.Parent) then return end
	local p, s = anchor.AbsolutePosition, anchor.AbsoluteSize
	local inset = W.gui.AbsolutePosition
	local l = new("TextLabel", { Size = UDim2.fromOffset(220, 30), Position = UDim2.fromOffset(p.X - inset.X + s.X / 2 - 110, p.Y - inset.Y + s.Y - 6), BackgroundTransparency = 1, Text = text, TextColor3 = color or col.line, Font = T.font.mono, TextSize = 24, ZIndex = 300, TextStrokeTransparency = 0.7, TextStrokeColor3 = col.ink }, W.gui)
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
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color or col.line, BackgroundTransparency = 0.6, BorderSizePixel = 0, ZIndex = 250 }, frame)
	W.tween(o, { BackgroundTransparency = 1 }, 0.6)
	task.delay(0.65, function() o:Destroy() end)
end

-- Data-shard burst (cyan/amber squares falling through the HUD).
local SHARDS = { col.line, col.glow, col.sky, col.gold, col.line }
function W.confetti(count)
	if not W.gui then return end
	local size = W.gui.AbsoluteSize
	local host = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, ZIndex = 500 }, W.gui)
	for _ = 1, (count or 70) do
		local x = math.random() * size.X
		local s = math.random(3, 8)
		local p = new("Frame", { Size = UDim2.fromOffset(s, s), Position = UDim2.fromOffset(x, -20 - math.random() * 120), BackgroundColor3 = SHARDS[math.random(1, #SHARDS)], BorderSizePixel = 0, ZIndex = 500 }, host)
		local t = 1.3 + math.random() * 1.2
		W.tween(p, { Position = UDim2.fromOffset(x + (math.random() - 0.5) * 120, size.Y + 30) }, t, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		task.delay(t * 0.7, function() if p.Parent then W.tween(p, { BackgroundTransparency = 1 }, t * 0.3) end end)
	end
	task.delay(3, function() host:Destroy() end)
end

-- Full-screen celebration: expanding HUD rings, bracketed title, shard burst.
function W.celebrate(title, sub, icon)
	if not W.gui then return end
	W.sound("big")
	W.confetti(80)
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = col.ink, BackgroundTransparency = 1, ZIndex = 400, BorderSizePixel = 0 }, W.gui)
	W.tween(o, { BackgroundTransparency = 0.3 }, 0.2)
	for i = 1, 3 do
		local r = new("Frame", { Size = UDim2.fromOffset(40, 40), Position = UDim2.fromScale(0.5, 0.45), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, ZIndex = 401 }, o)
		W.round(r)
		local st = W.stroke(r, col.line, 2, 0)
		task.delay((i - 1) * 0.12, function()
			if not r.Parent then return end
			W.tween(r, { Size = UDim2.fromOffset(420, 420) }, 0.9, Enum.EasingStyle.Quint)
			W.tween(st, { Transparency = 1 }, 0.9)
		end)
	end
	local box = new("Frame", { Size = UDim2.fromOffset(math.min(W.gui.AbsoluteSize.X - 40, 480), 170), Position = UDim2.fromScale(0.5, 0.45), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundTransparency = 1, ZIndex = 401 }, o)
	W.brackets(box, 22, col.glow, 3, 0, 402)
	local sc = new("UIScale", { Scale = 0.4 }, box)
	W.tween(sc, { Scale = 1 }, 0.45, Enum.EasingStyle.Back)
	local g = W.glyph(icon, title) or "✦"
	local i = W.label(box, { text = g, pos = UDim2.fromOffset(0, 10), size = UDim2.new(1, 0, 0, 50), ts = 40, font = T.font.head, color = col.glow, align = Enum.TextXAlignment.Center, z = 402 })
	local t = W.label(box, { text = W.upper(title), pos = UDim2.fromOffset(0, 64), size = UDim2.new(1, 0, 0, 44), ts = 28, font = T.font.display, color = col.line, align = Enum.TextXAlignment.Center, z = 402 })
	local s = W.label(box, { text = W.upper(sub or ""), pos = UDim2.fromOffset(0, 112), size = UDim2.new(1, 0, 0, 30), ts = 15, color = col.text, align = Enum.TextXAlignment.Center, font = T.font.head, z = 402 })
	task.delay(1.9, function()
		if not o.Parent then return end
		W.tween(o, { BackgroundTransparency = 1 }, 0.3)
		W.tween(i, { TextTransparency = 1 }, 0.3); W.tween(t, { TextTransparency = 1 }, 0.3); W.tween(s, { TextTransparency = 1 }, 0.3)
		task.delay(0.32, function() o:Destroy() end)
	end)
end
function W.deviceFlash(text) W.celebrate(text, nil, "📲") end

return W
