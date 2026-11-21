--!nonstrict
-- Visual system shared by all four device tiers.
-- Deep midnight base with layered glass panels, a violet→pink brand gradient, mint for money gained,
-- coral for money lost, gold for rewards. Bold geometric display type, clean UI sans, tabular mono numbers.
local T = {}

local function hex(h) return Color3.fromHex(h) end
T.color = {
	-- surfaces (darkest → lightest)
	ink = hex("07060F"), ink2 = hex("120D26"), panel = hex("141029"), panel2 = hex("1C1638"), panel3 = hex("2A2152"), raised = hex("332862"),
	-- lines
	line = hex("9AA4FF"), lineDim = hex("3A3170"), lineSoft = hex("272052"),
	-- brand
	brand = hex("8B5CF6"), brand2 = hex("EC4899"), blue = hex("5B8CFF"), blueDark = hex("2B2470"),
	-- semantic
	magenta = hex("FF3D8B"), red = hex("FF5A6E"), teal = hex("2EF2A6"), amber = hex("FFC24B"), gold = hex("FFD66B"), sky = hex("5ED3FF"),
	-- text
	cream = hex("F6F2FF"), creamInk = hex("0D0A1C"), text = hex("F4F1FF"), muted = hex("A49CC9"), faint = hex("6E6696"), disabled = hex("2C2650"),
	-- tile gradients (pairs)
	tileA = hex("C2185B"), tileB = hex("1E5BD8"), tileC = hex("D9661A"), tileD = hex("7B2FF7"), tileE = hex("0E9F8E"), tileF = hex("3F35C8"), tileG = hex("B8860B"),
	shadow = hex("000000"),
}
T.brandSeq = ColorSequence.new({ ColorSequenceKeypoint.new(0, T.color.brand), ColorSequenceKeypoint.new(1, T.color.brand2) })
T.goodSeq = ColorSequence.new({ ColorSequenceKeypoint.new(0, hex("2EF2A6")), ColorSequenceKeypoint.new(1, hex("19C3E6")) })
T.goldSeq = ColorSequence.new({ ColorSequenceKeypoint.new(0, hex("FFE08A")), ColorSequenceKeypoint.new(1, hex("FF9F2E")) })
T.dangerSeq = ColorSequence.new({ ColorSequenceKeypoint.new(0, hex("FF6B7F")), ColorSequenceKeypoint.new(1, hex("E0315A")) })

-- Fonts are looked up defensively: a name missing in this Studio version falls back instead of crashing the UI.
local function font(name, fallback)
	local ok, f = pcall(function() return Enum.Font[name] end)
	return (ok and f) or fallback
end
T.font = {
	display = font("GothamBlack", Enum.Font.SourceSansBold), head = font("GothamBold", Enum.Font.SourceSansBold),
	caps = font("GothamMedium", Enum.Font.SourceSansSemibold), body = font("BuilderSansMedium", Enum.Font.SourceSans),
	bold = font("BuilderSansBold", Enum.Font.SourceSansBold), mono = font("RobotoMono", Enum.Font.Code),
}
T.size = { caption = 12, body = 14, label = 16, title = 22, display = 30 }
T.space = { xs = 4, sm = 8, md = 12, lg = 16, xl = 24 }
T.radius = 14
T.motion = { fast = 0.08, base = 0.18, slow = 0.35 }

-- Width classes: compact < 620, medium < 1020, wide >= 1020 (viewport pixels).
function T.metrics(viewport, touch)
	local w = viewport.X
	local class = (w < 620) and "compact" or ((w < 1020) and "medium" or "wide")
	local compact = class == "compact"
	return {
		class = class, w = w, h = viewport.Y, touch = touch,
		btnH = touch and 44 or 36, gutter = compact and 10 or 18,
		topH = compact and 50 or 60, statsH = compact and 70 or 80,
		headerH = (compact and 50 or 60) + (compact and 70 or 80), navH = 68,
	}
end

return T
