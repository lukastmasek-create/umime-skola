--!nonstrict
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
	local tw = TweenService:Create(o, TweenInfo.new(t or 0.15, style or Enum.EasingStyle.Quad, dir or Enum.EasingDirection.Out), props)
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
local function nextOrder(parent)
	local n = (parent:GetAttribute("_n") or 0) + 1
	parent:SetAttribute("_n", n)
	return n
end
W.nextOrder = nextOrder

function W.begin(m, cw) W.m, W.cw = m, cw end

-- ───────── formatting ─────────
local NB = "\u{00A0}"
function W.fmt(n)
	if n ~= n then return "0" end
	local neg = n < 0
	local a = math.abs(n)
	local s
	if a >= 1e12 then s = string.format("%.2f", a / 1e12):gsub("%.", ",") .. NB .. "bil."
	elseif a >= 1e9 then s = string.format("%.2f", a / 1e9):gsub("%.", ",") .. NB .. "mld."
	elseif a >= 1e6 then s = string.format("%.2f", a / 1e6):gsub("%.", ",") .. NB .. "mil."
	else
		local i = tostring(math.floor(a + 0.5))
		local out, n = {}, #i
		for k = 1, n do
			table.insert(out, i:sub(k, k))
			if (n - k) % 3 == 0 and k < n then table.insert(out, NB) end
		end
		s = table.concat(out)
	end
	return (neg and "−" or "") .. s
end
function W.dec(n, d) return (string.format("%." .. (d or 2) .. "f", n):gsub("%.", ",")) end
function W.dur(ms)
	ms = math.max(0, ms)
	local s = ms / 1000
	if s < 90 then return math.ceil(s) .. NB .. "s" end
	local m = s / 60
	if m < 90 then return math.ceil(m) .. NB .. "min" end
	local h = m / 60
	if h < 48 then return string.format("%.1f", h):gsub("%.", ",") .. NB .. "h" end
	return string.format("%.1f", h / 24):gsub("%.", ",") .. NB .. "d"
end

-- ───────── text ─────────
-- string.upper only handles ASCII, so Czech diacritics need an explicit map.
local UP = { ["á"] = "Á", ["č"] = "Č", ["ď"] = "Ď", ["é"] = "É", ["ě"] = "Ě", ["í"] = "Í", ["ň"] = "Ň", ["ó"] = "Ó", ["ř"] = "Ř", ["š"] = "Š", ["ť"] = "Ť", ["ú"] = "Ú", ["ů"] = "Ů", ["ý"] = "Ý", ["ž"] = "Ž", ["ä"] = "Ä", ["ö"] = "Ö", ["ü"] = "Ü", ["ĺ"] = "Ĺ", ["ľ"] = "Ľ", ["ô"] = "Ô" }
function W.upper(str)
	str = string.upper(str)
	for lo, hi in pairs(UP) do str = str:gsub(lo, hi) end
	return str
end

function W.label(parent, o)
	return new("TextLabel", {
		Size = o.size or UDim2.new(1, 0, 0, o.h or 20), Position = o.pos or UDim2.new(), BackgroundTransparency = 1, Text = o.text or "",
		TextColor3 = o.color or col.text, Font = o.font or T.font.body, TextSize = o.ts or T.size.body,
		TextXAlignment = o.align or Enum.TextXAlignment.Left, TextYAlignment = o.valign or Enum.TextYAlignment.Center,
		TextWrapped = o.wrap ~= false, TextTruncate = o.truncate or Enum.TextTruncate.None, LayoutOrder = o.order or 0,
		AnchorPoint = o.anchor or Vector2.new(), RichText = o.rich == true, AutomaticSize = o.auto or Enum.AutomaticSize.None,
	}, parent)
end

-- ───────── toast ─────────
function W.attach(gui)
	W.gui = gui
	W.toastFrame = new("Frame", { Size = UDim2.new(0, 360, 0, 40), Position = UDim2.new(0.5, 0, 1, -76), AnchorPoint = Vector2.new(0.5, 1), BackgroundColor3 = col.panel2, Visible = false, ZIndex = 200, BorderSizePixel = 0 }, gui)
	W.corner(W.toastFrame)
	W.toastStroke = W.stroke(W.toastFrame, col.line, 1.5)
	W.toastLabel = new("TextLabel", { Size = UDim2.new(1, -16, 1, 0), Position = UDim2.fromOffset(8, 0), BackgroundTransparency = 1, Font = T.font.bold, TextSize = T.size.body, TextColor3 = col.text, TextWrapped = true, ZIndex = 201, Text = "" }, W.toastFrame)
	W.toastId = 0
end
function W.toast(text, kind)
	if not W.toastFrame then return end
	W.toastId += 1
	local id = W.toastId
	local color = (kind == "bad") and col.red or ((kind == "warn") and col.amber or col.teal)
	W.toastLabel.Text = text
	W.toastStroke.Color = color
	W.toastFrame.Size = UDim2.new(0, math.min(W.m and W.m.w - 24 or 360, 420), 0, 44)
	W.toastFrame.Visible = true
	W.toastFrame.BackgroundTransparency = 1
	W.tween(W.toastFrame, { BackgroundTransparency = 0 }, 0.12)
	task.delay(3.2, function()
		if W.toastId == id and W.toastFrame then W.toastFrame.Visible = false end
	end)
end

-- ───────── cards, rows, stats ─────────
function W.card(parent, o)
	o = o or {}
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundColor3 = o.bg or col.panel, BorderSizePixel = 0, LayoutOrder = nextOrder(parent) }, parent)
	W.corner(f, 14)
	new("UIGradient", { Rotation = 120, Color = ColorSequence.new(col.panel2, col.panel) }, f)
	W.stroke(f, o.accent or col.lineDim, o.accent and 1.5 or 1, o.accent and 0.15 or 0.2)
	W.pad(f, 12, 12, 12, 12)
	new("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	if o.title then
		local h = new("Frame", { Size = UDim2.new(1, 0, 0, 22), BackgroundTransparency = 1, LayoutOrder = 0 }, f)
		new("Frame", { Size = UDim2.fromOffset(4, 16), Position = UDim2.fromOffset(0, 3), BackgroundColor3 = o.accent or col.magenta, BorderSizePixel = 0 }, h)
		new("TextLabel", { Size = UDim2.new(0.62, -12, 1, 0), Position = UDim2.fromOffset(12, 0), BackgroundTransparency = 1, Text = W.upper(o.title), Font = T.font.caps, TextSize = 14, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, TextTruncate = Enum.TextTruncate.AtEnd }, h)
		if o.right then
			W.label(h, { text = o.right, size = UDim2.new(0.38, 0, 1, 0), pos = UDim2.new(0.62, 0, 0, 0), align = Enum.TextXAlignment.Right, color = col.muted, ts = T.size.caption, wrap = false, font = T.font.caps })
		end
	end
	return f
end

function W.stat(parent, o)
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, 62), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 12)
	new("UIGradient", { Rotation = 90, Color = ColorSequence.new(col.panel3, col.panel2) }, f)
	W.stroke(f, o.color or col.line, 1.2, 0.35)
	W.label(f, { text = W.upper(o.label), pos = UDim2.fromOffset(10, 4), size = UDim2.new(1, -14, 0, 14), ts = 10, color = col.muted, font = T.font.caps, wrap = false })
	local v = W.label(f, { text = o.value, pos = UDim2.fromOffset(10, 18), size = UDim2.new(1, -14, 0, 26), ts = o.ts or T.size.title, color = o.color or col.text, font = T.font.mono, wrap = false })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(10, 44), size = UDim2.new(1, -14, 0, 14), ts = 11, color = col.muted, wrap = false }) end
	f.Name = o.name or "Stat"
	return f, v
end

-- Buttons: pill shaped. primary/good = mint CTA with dark text ("PLAY NOW"), ghost = outline pill,
-- danger/select = hot pink. `reason` makes it look locked and shows why on tap.
local VARIANT = {
	primary = { fill = col.teal, fillT = 0, edge = col.teal, text = col.creamInk },
	good = { fill = col.teal, fillT = 0, edge = col.teal, text = col.creamInk },
	danger = { fill = col.red, fillT = 0, edge = col.red, text = Color3.new(1, 1, 1) },
	ghost = { fill = col.panel3, fillT = 0.55, edge = col.cream, text = col.text },
	select = { fill = col.magenta, fillT = 0, edge = Color3.fromHex("FF8CB8"), text = Color3.new(1, 1, 1) },
	disabled = { fill = col.disabled, fillT = 0.3, edge = col.lineDim, text = col.muted },
}
function W.button(parent, o)
	local v = VARIANT[o.reason and "disabled" or (o.variant or "primary")]
	local h = o.h or (W.m and W.m.btnH or 34)
	local b = new("TextButton", {
		Size = o.size or UDim2.fromOffset(o.w or 96, h), Position = o.pos or UDim2.new(), AnchorPoint = o.anchor or Vector2.new(),
		BackgroundColor3 = v.fill, BackgroundTransparency = v.fillT, Text = o.text, TextColor3 = v.text, Font = T.font.bold, TextSize = o.ts or 13, TextWrapped = true,
		AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or 0,
	}, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, b)
	local st = W.stroke(b, v.edge, (v.fillT > 0) and 1.5 or 0, 0)
	local sc = new("UIScale", { Scale = 1 }, b)
	b.MouseEnter:Connect(function() if not W.m.touch then W.tween(sc, { Scale = 1.04 }, 0.08) end end)
	b.MouseLeave:Connect(function() W.tween(sc, { Scale = 1 }, 0.08) end)
	b.MouseButton1Down:Connect(function() W.tween(sc, { Scale = 0.95 }, 0.06) end)
	b.MouseButton1Up:Connect(function() W.tween(sc, { Scale = 1 }, 0.1) end)
	b.Activated:Connect(function()
		if o.reason then W.toast(o.reason, "warn") return end
		if o.onClick then o.onClick(b) end
	end)
	return b
end

-- Item row: left = title/sub, right = action buttons. Stacks buttons under the text when space is short.
function W.row(parent, o)
	local m = W.m
	local cw = (o.cw or W.cw or 320) - 20
	local actions = o.actions or {}
	local aw, gap = 0, 6
	for _, a in ipairs(actions) do a.w = a.w or math.max(72, 14 + #a.text * 7); aw += a.w + gap end
	local stacked = (#actions > 0) and (cw - aw < 170 or m.class == "compact")
	local textH = (o.sub and 50 or 28) + (o.extra and 18 or 0)
	local height = textH + 8 + ((stacked and #actions > 0) and (m.btnH + 6) or 0)
	height = math.max(height, (not stacked and #actions > 0) and (m.btnH + 12) or 0)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, height), BackgroundColor3 = o.selected and col.panel3 or col.ink, BackgroundTransparency = o.selected and 0 or 0.35, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 12)
	if o.selected then
		W.stroke(f, col.magenta, 2)
		new("Frame", { Size = UDim2.new(0, 4, 1, -8), Position = UDim2.fromOffset(2, 4), BackgroundColor3 = col.magenta, BorderSizePixel = 0 }, f)
	elseif o.alert then
		W.stroke(f, col.red, 1.5)
	end
	local tw = stacked and (cw) or (cw - aw)
	W.label(f, { text = o.title, pos = UDim2.fromOffset(12, 4), size = UDim2.new(0, tw, 0, 20), font = T.font.bold, ts = T.size.label, color = o.titleColor or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
	if o.sub then W.label(f, { text = o.sub, pos = UDim2.fromOffset(12, 24), size = UDim2.new(0, tw, 0, 30), ts = 12, color = col.muted, valign = Enum.TextYAlignment.Top }) end
	if o.extra then W.label(f, { text = o.extra, pos = UDim2.fromOffset(12, 50), size = UDim2.new(0, tw, 0, 16), ts = 12, color = o.extraColor or col.amber, wrap = false }) end
	local x = stacked and 12 or (cw + 10 - aw + gap)
	for _, a in ipairs(actions) do
		local y = stacked and (textH + 4) or math.floor((height - m.btnH) / 2)
		a.pos = UDim2.fromOffset(x, y)
		W.button(f, a)
		x += a.w + gap
	end
	return f
end

function W.reason(parent, text, color)
	return W.label(parent, { text = "⛔ " .. text, color = color or col.amber, ts = 12, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end
function W.note(parent, text, color)
	return W.label(parent, { text = text, color = color or col.muted, ts = 12, auto = Enum.AutomaticSize.Y, size = UDim2.new(1, 0, 0, 16), order = nextOrder(parent) })
end

-- Thin mint progress line (tiles and meters)
function W.progress(parent, frac, color, h, order)
	frac = math.clamp(frac or 0, 0, 1)
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, math.min(h or 6, 8)), BackgroundColor3 = col.ink, BackgroundTransparency = 0.3, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent) }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, bar)
	local fill = new("Frame", { Size = UDim2.new(frac, 0, 1, 0), BackgroundColor3 = color or col.teal, BorderSizePixel = 0 }, bar)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, fill)
	return bar
end

-- Avatar circle with a status dot (side-panel rows)
function W.avatar(parent, letter, color, size, dot)
	local a = new("TextLabel", { Size = UDim2.fromOffset(size or 34, size or 34), BackgroundColor3 = color or col.magenta, Text = string.sub(letter, 1, 1), Font = T.font.bold, TextSize = 16, TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, parent)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, a)
	if dot then
		local d = new("Frame", { Size = UDim2.fromOffset(9, 9), Position = UDim2.new(1, -9, 1, -9), BackgroundColor3 = dot, BorderSizePixel = 0 }, a)
		new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, d)
		W.stroke(d, col.panel, 1.5)
	end
	return a
end

-- Featured hero card with a pink glow, price tag, mint CTA pill and an outline pill.
function W.hero(parent, o)
	local f = new("Frame", { Size = o.size or UDim2.new(1, 0, 0, o.h or 210), BackgroundColor3 = col.panel2, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 18)
	new("UIGradient", { Rotation = 25, Color = ColorSequence.new(Color3.fromHex("3A0B5E"), Color3.fromHex("14052B")) }, f)
	W.stroke(f, col.magenta, 3, 0.1)
	W.stroke(f, col.magenta, 1, 0) -- glow edge + crisp edge
	W.label(f, { text = W.upper(o.kicker or ""), pos = UDim2.fromOffset(20, 14), size = UDim2.new(0.6, 0, 0, 16), ts = 11, color = col.teal, font = T.font.caps, wrap = false })
	if o.price then
		local tag = new("Frame", { Size = UDim2.fromOffset(math.max(64, 18 + #o.price * 9), 38), Position = UDim2.new(1, -20, 0, 14), AnchorPoint = Vector2.new(1, 0), BackgroundColor3 = col.magenta, BorderSizePixel = 0 }, f)
		W.corner(tag, 6)
		W.label(tag, { text = o.price, size = UDim2.fromScale(1, 1), color = Color3.new(1, 1, 1), font = T.font.bold, ts = 16, align = Enum.TextXAlignment.Center, wrap = false })
	end
	W.label(f, { text = W.upper(o.title), pos = UDim2.fromOffset(20, 36), size = UDim2.new(1, -40, 0, 52), ts = (W.m and W.m.class == "compact") and 24 or 34, color = col.text, font = T.font.display, valign = Enum.TextYAlignment.Center })
	if o.sub and o.sub ~= "" then W.label(f, { text = o.sub, pos = UDim2.fromOffset(20, 92), size = UDim2.new(1, -40, 0, 40), ts = 13, color = col.muted, font = T.font.caps, valign = Enum.TextYAlignment.Top }) end
	local y = (o.h or 210) - 58
	local x = 20
	if o.cta then
		W.button(f, { text = "▶  " .. o.cta, variant = "good", w = math.max(150, 40 + #o.cta * 9), h = 42, ts = 15, pos = UDim2.fromOffset(x, y), onClick = o.onCta })
		x += math.max(150, 40 + #o.cta * 9) + 10
	end
	if o.secondary then W.button(f, { text = o.secondary, variant = "ghost", w = math.max(130, 30 + #o.secondary * 8), h = 42, ts = 13, pos = UDim2.fromOffset(x, y), onClick = o.onSecondary }) end
	return f
end

-- "Continue" tile: gradient card, shape badge with a number, caps title, caption and a thin progress line.
function W.tile(parent, o)
	local f = new("TextButton", { Size = UDim2.fromOffset(o.w, o.h or 150), BackgroundColor3 = o.color or col.tileA, Text = "", AutoButtonColor = false, BorderSizePixel = 0, LayoutOrder = o.order or nextOrder(parent) }, parent)
	W.corner(f, 14)
	new("UIGradient", { Rotation = 135, Color = ColorSequence.new(o.color or col.tileA, o.color2 or col.tileD) }, f)
	local sc = new("UIScale", { Scale = 1 }, f)
	f.MouseEnter:Connect(function() if not W.m.touch then W.tween(sc, { Scale = 1.03 }, 0.1) end end)
	f.MouseLeave:Connect(function() W.tween(sc, { Scale = 1 }, 0.1) end)
	f.Activated:Connect(function() if o.onClick then o.onClick() end end)
	local badge = new("TextLabel", { Size = UDim2.fromOffset(52, 52), Position = UDim2.new(0.5, -26, 0, 14), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.6, Text = tostring(o.num or ""), Font = T.font.display, TextSize = 20, TextColor3 = Color3.new(1, 1, 1), BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = (o.shape == "circle") and UDim.new(0.5, 0) or UDim.new(0, 14) }, badge)
	if o.shape ~= "circle" then badge.Rotation = 0 end
	W.stroke(badge, Color3.new(1, 1, 1), 1.5, 0.1)
	W.label(f, { text = W.upper(o.title), pos = UDim2.new(0, 12, 1, -50), size = UDim2.new(1, -24, 0, 16), ts = 13, font = T.font.caps, color = Color3.new(1, 1, 1), wrap = false, truncate = Enum.TextTruncate.AtEnd })
	W.label(f, { text = o.caption or "", pos = UDim2.new(0, 12, 1, -32), size = UDim2.new(1, -24, 0, 12), ts = 10, font = T.font.caps, color = Color3.new(1, 1, 1), wrap = false, truncate = Enum.TextTruncate.AtEnd })
	local pb = new("Frame", { Size = UDim2.new(1, -24, 0, 4), Position = UDim2.new(0, 12, 1, -14), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.6, BorderSizePixel = 0 }, f)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pb)
	local pf = new("Frame", { Size = UDim2.new(math.clamp(o.pct or 0, 0, 1), 0, 1, 0), BackgroundColor3 = col.teal, BorderSizePixel = 0 }, pb)
	new("UICorner", { CornerRadius = UDim.new(0.5, 0) }, pf)
	return f
end

-- Bar sparkline for charts. values = array of numbers.
function W.chart(parent, values, color, h, labels)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 90), BackgroundColor3 = col.ink, BorderSizePixel = 0, LayoutOrder = nextOrder(parent) }, parent)
	W.corner(f)
	W.stroke(f, col.lineDim, 1)
	if #values < 2 then
		W.label(f, { text = labels and labels.none or "…", size = UDim2.fromScale(1, 1), color = col.muted, align = Enum.TextXAlignment.Center })
		return f
	end
	local lo, hi = math.huge, -math.huge
	for _, v in ipairs(values) do lo = math.min(lo, v); hi = math.max(hi, v) end
	if hi - lo < 1e-9 then hi = lo + 1 end
	local n = math.min(#values, 60)
	local step = #values / n
	local inner = new("Frame", { Size = UDim2.new(1, -12, 1, -12), Position = UDim2.fromOffset(6, 6), BackgroundTransparency = 1 }, f)
	for i = 1, n do
		local v = values[math.min(#values, math.floor((i - 1) * step) + 1)]
		local frac = 0.08 + 0.92 * (v - lo) / (hi - lo)
		new("Frame", { Size = UDim2.new(1 / n, -1, frac, 0), Position = UDim2.new((i - 1) / n, 0, 1 - frac, 0), BackgroundColor3 = color or col.line, BorderSizePixel = 0, BackgroundTransparency = (i == n) and 0 or 0.25 }, inner)
	end
	return f, lo, hi
end

-- Chip (cream tag) and segmented selector
function W.chip(parent, text, color, order)
	local c = new("TextLabel", { Size = UDim2.fromOffset(math.max(40, 14 + #text * 7), 22), BackgroundColor3 = color or col.cream, Text = text, TextColor3 = col.creamInk, Font = T.font.caps, TextSize = 13, BorderSizePixel = 0, LayoutOrder = order or nextOrder(parent) }, parent)
	W.corner(c, 3)
	return c
end

function W.flow(parent, h)
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, h or 0), AutomaticSize = (h and Enum.AutomaticSize.None or Enum.AutomaticSize.Y), BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Wraps = true, Padding = UDim.new(0, 6), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	return f
end

-- Selector made of chips/buttons: options = { {id, text} }, calls onPick(id)
function W.segmented(parent, options, current, onPick)
	local f = W.flow(parent)
	for i, o in ipairs(options) do
		W.button(f, { text = o.text, variant = (o.id == current) and "select" or "ghost", w = math.max(64, 16 + #o.text * 7), h = math.max(30, W.m.btnH - 4), order = i, onClick = function() onPick(o.id) end })
	end
	return f
end

-- Compare table: headers = { "", col1, col2 }, rows = { { label, v1, v2, ... } }
function W.table(parent, headers, rows, cw)
	local cols = #headers
	local first = math.min(120, math.floor((cw or 320) * 0.3))
	local other = math.floor(((cw or 320) - 20 - first) / math.max(1, cols - 1))
	local f = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = nextOrder(parent) }, parent)
	new("UIListLayout", { Padding = UDim.new(0, 2), SortOrder = Enum.SortOrder.LayoutOrder }, f)
	local function rowOf(cells, header, idx)
		local r = new("Frame", { Size = UDim2.new(1, 0, 0, header and 28 or 26), BackgroundColor3 = header and col.blueDark or ((idx % 2 == 0) and col.panel2 or col.panel), BorderSizePixel = 0, LayoutOrder = idx }, f)
		for i, text in ipairs(cells) do
			local x = (i == 1) and 6 or (first + (i - 2) * other + 6)
			W.label(r, { text = tostring(text), pos = UDim2.fromOffset(x, 0), size = UDim2.fromOffset((i == 1) and first - 6 or other - 8, header and 28 or 26), ts = header and 12 or 12, font = (header or i == 1) and T.font.bold or T.font.mono, color = (i == 1) and col.muted or col.text, wrap = false, truncate = Enum.TextTruncate.AtEnd })
		end
	end
	rowOf(headers, true, 0)
	for i, r in ipairs(rows) do rowOf(r, false, i) end
	return f
end

-- ───────── retro dialog ─────────
function W.modal(title, text, buttons)
	local gui = W.gui
	local overlay = new("TextButton", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(0, 0, 0), BackgroundTransparency = 0.45, Text = "", AutoButtonColor = false, ZIndex = 150 }, gui)
	local w = math.min(W.m.w - 24, 420)
	local win = new("Frame", { Size = UDim2.fromOffset(w, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.fromScale(0.5, 0.5), AnchorPoint = Vector2.new(0.5, 0.5), BackgroundColor3 = col.panel, BorderSizePixel = 0, ZIndex = 151 }, overlay)
	W.corner(win, 14)
	W.stroke(win, col.magenta, 2)
	new("UIListLayout", { SortOrder = Enum.SortOrder.LayoutOrder }, win)
	local bar = new("Frame", { Size = UDim2.new(1, 0, 0, 28), BackgroundColor3 = col.magenta, BorderSizePixel = 0, LayoutOrder = 1, ZIndex = 152 }, win)
	new("UIGradient", { Color = ColorSequence.new(col.blueDark, col.magenta) }, bar)
	new("TextLabel", { Size = UDim2.new(1, -40, 1, 0), Position = UDim2.fromOffset(8, 0), BackgroundTransparency = 1, Text = W.upper(title), Font = T.font.head, TextSize = 15, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, ZIndex = 153 }, bar)
	local x = new("TextButton", { Size = UDim2.fromOffset(22, 20), Position = UDim2.new(1, -26, 0, 4), BackgroundColor3 = col.panel3, Text = "×", TextColor3 = col.text, Font = T.font.bold, TextSize = 16, ZIndex = 153, AutoButtonColor = true }, bar)
	local body = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = 2, ZIndex = 152 }, win)
	W.pad(body, 14, 12, 14, 14)
	new("UIListLayout", { Padding = UDim.new(0, 12), SortOrder = Enum.SortOrder.LayoutOrder }, body)
	new("TextLabel", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, Text = text, TextWrapped = true, Font = T.font.body, TextSize = T.size.body, TextColor3 = col.text, TextXAlignment = Enum.TextXAlignment.Left, LayoutOrder = 1, ZIndex = 153 }, body)
	local row = new("Frame", { Size = UDim2.new(1, 0, 0, W.m.btnH), BackgroundTransparency = 1, LayoutOrder = 2, ZIndex = 153 }, body)
	new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 8), HorizontalAlignment = Enum.HorizontalAlignment.Right }, row)
	local function close() overlay:Destroy() end
	x.Activated:Connect(close)
	for i, b in ipairs(buttons or {}) do
		local btn = W.button(row, { text = b.text, variant = b.variant, w = math.max(88, 20 + #b.text * 7), order = i, onClick = function() close(); if b.onClick then b.onClick() end end })
		btn.ZIndex = 154
	end
	return overlay
end

-- ───────── subtle outcome animations ─────────
function W.floatText(anchor, text, color)
	if not (W.gui and anchor and anchor.Parent) then return end
	local p, s = anchor.AbsolutePosition, anchor.AbsoluteSize
	local inset = W.gui.AbsolutePosition
	local l = new("TextLabel", { Size = UDim2.fromOffset(200, 28), Position = UDim2.fromOffset(p.X - inset.X + s.X / 2 - 100, p.Y - inset.Y + s.Y - 4), BackgroundTransparency = 1, Text = text, TextColor3 = color or col.teal, Font = T.font.mono, TextSize = 22, ZIndex = 300 }, W.gui)
	W.tween(l, { Position = l.Position - UDim2.fromOffset(0, 46), TextTransparency = 1 }, 1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	task.delay(1.2, function() l:Destroy() end)
end
function W.shake(frame)
	if not (frame and frame.Parent) then return end
	local p = frame.Position
	task.spawn(function()
		for i = 1, 4 do
			W.tween(frame, { Position = p + UDim2.fromOffset((i % 2 == 0) and -6 or 6, 0) }, 0.04)
			task.wait(0.05)
		end
		W.tween(frame, { Position = p }, 0.05)
	end)
end
function W.pulse(frame, color)
	if not (frame and frame.Parent) then return end
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color or col.teal, BackgroundTransparency = 0.55, BorderSizePixel = 0, ZIndex = 250 }, frame)
	W.corner(o)
	W.tween(o, { BackgroundTransparency = 1 }, 0.6)
	task.delay(0.65, function() o:Destroy() end)
end
function W.deviceFlash(text)
	if not W.gui then return end
	local o = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(1, 1, 1), BackgroundTransparency = 0.2, ZIndex = 400, BorderSizePixel = 0 }, W.gui)
	local l = new("TextLabel", { Size = UDim2.fromScale(1, 0.2), Position = UDim2.fromScale(0, 0.4), BackgroundTransparency = 1, Text = text, Font = T.font.head, TextSize = 44, TextColor3 = col.ink, ZIndex = 401 }, o)
	W.tween(o, { BackgroundTransparency = 1 }, 1.2)
	W.tween(l, { TextTransparency = 1 }, 1.4)
	task.delay(1.5, function() o:Destroy() end)
end

return W
