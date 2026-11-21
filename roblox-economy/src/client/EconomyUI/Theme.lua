--!nonstrict
-- One visual system for all four device tiers ("NexusPlay"-style neon dashboard):
-- violet-to-black gradient base, hot-pink glow for featured cards, mint pill CTA, lavender outlined side panel,
-- slab-serif display type with monospaced captions, thin mint progress lines on gradient tiles.
local T = {}

local function hex(h) return Color3.fromHex(h) end
T.color = {
	ink = hex("0A0414"), ink2 = hex("240A3A"), panel = hex("150A2B"), panel2 = hex("21103F"), panel3 = hex("301857"),
	line = hex("8E9BFF"), lineDim = hex("4A3A86"), blue = hex("5B6CFF"), blueDark = hex("3A2A8C"),
	magenta = hex("FF2D78"), red = hex("FF4D6D"), teal = hex("19F5A0"), amber = hex("FFC93C"),
	cream = hex("F4EEFF"), creamInk = hex("12061F"), text = hex("F4EEFF"), muted = hex("A094C7"), disabled = hex("3A2F5E"),
	tileA = hex("B0185F"), tileB = hex("1D5FB8"), tileC = hex("B5560E"), tileD = hex("7A1FA8"), tileE = hex("0F8F82"), tileF = hex("3A2FB5"),
}
T.font = {
	display = Enum.Font.GothamBlack, head = Enum.Font.GothamBold, caps = Enum.Font.Code,
	body = Enum.Font.BuilderSansMedium, bold = Enum.Font.BuilderSansBold, mono = Enum.Font.RobotoMono,
}
T.size = { caption = 12, body = 14, label = 16, title = 22, display = 30 }
T.space = { xs = 4, sm = 8, md = 12, lg = 16 }
T.radius = 12

-- Width classes: compact < 620, medium < 1020, wide >= 1020 (viewport pixels).
function T.metrics(viewport, touch)
	local w = viewport.X
	local class = (w < 620) and "compact" or ((w < 1020) and "medium" or "wide")
	return {
		class = class, w = w, h = viewport.Y, touch = touch,
		btnH = touch and 44 or 34, gutter = (class == "compact") and 8 or 16,
		topH = (class == "compact") and 46 or 54, statsH = (class == "compact") and 62 or 70,
		headerH = ((class == "compact") and 46 or 54) + ((class == "compact") and 62 or 70), navH = 60,
	}
end

return T
