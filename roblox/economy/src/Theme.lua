--!nonstrict
-- Sci-fi HUD visual system shared by all four device tiers.
-- Deep navy void, a faint tactical grid, cyan neon line-work: cut-corner frames, corner brackets, chevrons,
-- dotted ring gauges, segmented bars and hazard-striped warning plates. Cyan carries everything; amber and red
-- appear only for warnings and danger, exactly like a heads-up display.
local T = {}

local function hex(h) return Color3.fromHex(h) end
T.color = {
	-- surfaces (darkest → lightest)
	ink = hex("050B14"), ink2 = hex("0A1626"), panel = hex("0B1C2C"), panel2 = hex("0F2438"), panel3 = hex("123049"), raised = hex("17405E"),
	-- line-work
	line = hex("3BE4FF"), lineDim = hex("1D7A93"), lineSoft = hex("12445A"), glow = hex("7FF1FF"),
	-- semantic
	cyan = hex("3BE4FF"), teal = hex("3BE4FF"), sky = hex("7FD8FF"), blue = hex("2A8CFF"),
	amber = hex("FFB020"), gold = hex("FFD25A"), red = hex("FF3B55"), magenta = hex("3BE4FF"),
	brand = hex("3BE4FF"), brand2 = hex("1FA9E0"), blueDark = hex("0C2A40"),
	-- text
	text = hex("DDF8FF"), muted = hex("78AFC4"), faint = hex("3F6E82"), cream = hex("DDF8FF"), creamInk = hex("03121C"), disabled = hex("0E2232"),
	-- tile tints (kept for screens; all stay in the cyan family)
	tileA = hex("0E3A52"), tileB = hex("0B2F47"), tileC = hex("10344C"), tileD = hex("0A2840"), tileE = hex("0D3550"), tileF = hex("0B2C45"), tileG = hex("2B2A12"),
	shadow = hex("000000"),
}
local c = T.color
T.brandSeq = ColorSequence.new(c.line, c.brand2)
T.goodSeq = ColorSequence.new(c.line, c.brand2)
T.goldSeq = ColorSequence.new(hex("FFE08A"), c.amber)
T.dangerSeq = ColorSequence.new(hex("FF6B7F"), c.red)

-- Fonts are looked up defensively: a name missing in this Studio version falls back instead of crashing the UI.
local function font(name, fallback)
	local ok, f = pcall(function() return Enum.Font[name] end)
	return (ok and f) or fallback
end
T.font = {
	display = font("Michroma", font("GothamBlack", Enum.Font.SourceSansBold)), -- wide techno headlines
	head = font("Sarpanch", font("GothamBold", Enum.Font.SourceSansBold)), -- condensed HUD labels
	caps = font("Jura", font("GothamMedium", Enum.Font.SourceSans)), -- thin tactical captions
	body = font("TitilliumWeb", font("BuilderSansMedium", Enum.Font.SourceSans)),
	bold = font("TitilliumWeb", font("BuilderSansBold", Enum.Font.SourceSansBold)),
	mono = font("RobotoMono", Enum.Font.Code),
}
T.size = { caption = 12, body = 15, label = 16, title = 22, display = 30 }
T.space = { xs = 4, sm = 8, md = 12, lg = 16, xl = 24 }
T.radius = 0
T.cut = 10 -- chamfer size of cut corners (px)
T.motion = { fast = 0.08, base = 0.18, slow = 0.35 }

-- Width classes: compact < 620, medium < 1020, wide >= 1020 (viewport pixels).
function T.metrics(viewport, touch)
	local w = viewport.X
	local class = (w < 620) and "compact" or ((w < 1020) and "medium" or "wide")
	local compact = class == "compact"
	return {
		class = class, w = w, h = viewport.Y, touch = touch,
		btnH = touch and 44 or 36, gutter = compact and 10 or 18,
		topH = compact and 52 or 60, statsH = compact and 74 or 84,
		headerH = (compact and 52 or 60) + (compact and 74 or 84), navH = 70,
	}
end

return T
