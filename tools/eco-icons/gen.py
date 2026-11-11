#!/usr/bin/env python3
"""Generuje src/components/idle/eco-icon-data.ts: vlastní sadu ikon pro hry.

Styl: barevná dlaždice s jemným přechodem a bílý duotónový symbol (obrys + průsvitná
výplň) s měkkým stínem. Symboly jsou z Lucide (ISC), co v Lucide chybí, je nakreslené
ručně níže ve stejné mřížce 24 a s tloušťkou čáry 2 (CUSTOM).

Spuštění (balík @iconify-json/lucide nainstaluj mimo projekt a dej cestu k němu):
  python3 tools/eco-icons/gen.py /cesta/k/node_modules/@iconify-json/lucide/icons.json

Úpravy: změň GLYPH (znak -> symbol, barva dlaždice), COLORS, nebo CUSTOM, spusť znovu.
"""
import json, re, sys

OUT = "src/components/idle/eco-icon-data.ts"

# Barvy dlaždic: (světlý horní okraj, spodní tmavý okraj)
COLORS = {
    "money": ("#ffd84d", "#f08a00"), "red": ("#ff7a6e", "#d62839"), "rose": ("#ff7fa0", "#d81b60"),
    "orange": ("#ffb15c", "#e8590c"), "amber": ("#ffd166", "#e58a00"), "yellow": ("#ffe666", "#e0a800"),
    "green": ("#6fe08f", "#1f9d55"), "emerald": ("#4fe0b0", "#0a8f6a"), "teal": ("#4fe3d4", "#0f8f90"),
    "cyan": ("#5ad8f2", "#0a8fb8"), "sky": ("#6cc4ff", "#1b74d6"), "blue": ("#7aa5ff", "#2c50d4"),
    "indigo": ("#9a96ff", "#4b43d6"), "violet": ("#b894ff", "#6d3fd6"), "purple": ("#d28bff", "#9229c9"),
    "pink": ("#ff8ed1", "#d6339a"), "brown": ("#d9a066", "#8a5326"), "slate": ("#a9b6c9", "#4f6075"),
    "lime": ("#c3ef5b", "#6aa312"),
}

# znak -> (symbol Lucide nebo "custom:nazev", barva dlaždice)
GLYPH = {
    "⏩": ("fast-forward", "blue"), "⏱": ("timer", "blue"), "☀": ("sun", "yellow"), "☕": ("coffee", "brown"),
    "♻": ("recycle", "green"), "⚓": ("anchor", "sky"), "⚔": ("swords", "slate"), "⚖": ("scale", "money"),
    "⚙": ("settings", "slate"), "⚛": ("atom", "violet"), "⚠": ("triangle-exclamation-point", "amber"),
    "⚡": ("zap", "yellow"), "⛪": ("church", "indigo"), "⛰": ("mountain-snow", "emerald"), "⛲": ("droplets", "cyan"),
    "⛸": ("snowflake", "cyan"), "⛽": ("fuel", "sky"), "✅": ("circle-check", "green"), "✈": ("plane", "sky"),
    "✊": ("hand-fist", "teal"), "✋": ("hand", "slate"), "✖": ("x", "slate"), "✨": ("sparkles", "amber"),
    "❌": ("circle-x", "red"), "❓": ("circle-question-mark", "blue"), "❤": ("heart", "red"), "➕": ("plus", "green"),
    "➖": ("minus", "red"), "⭐": ("star", "money"), "🅿": ("square-parking", "sky"), "🌆": ("sunset", "indigo"),
    "🌊": ("waves", "cyan"), "🌬": ("wind", "sky"), "🌱": ("sprout", "green"), "🌲": ("tree-pine", "emerald"),
    "🌳": ("tree-deciduous", "green"), "🌷": ("flower-2", "pink"), "🌹": ("rose", "red"), "🌻": ("flower", "yellow"),
    "🌽": ("custom:corn", "yellow"), "🌾": ("wheat", "amber"), "🌿": ("leaf", "green"), "🍄": ("custom:mushroom", "red"),
    "🍅": ("custom:tomato", "red"), "🍇": ("grape", "purple"), "🍉": ("custom:watermelon", "green"), "🍋": ("citrus", "yellow"),
    "🍎": ("apple", "red"), "🍑": ("mango", "orange"), "🍒": ("cherry", "rose"), "🍓": ("custom:strawberry", "rose"),
    "🍖": ("drumstick", "orange"), "🍞": ("custom:bread", "brown"), "🍯": ("custom:honey", "amber"), "🍰": ("cake-slice", "pink"),
    "🍳": ("egg-fried", "amber"), "🍽": ("utensils", "slate"), "🎁": ("gift", "red"), "🎃": ("custom:pumpkin", "orange"),
    "🎄": ("tree-pine", "red"), "🎅": ("candy-cane", "red"), "🎉": ("party-popper", "pink"), "🎓": ("graduation-cap", "blue"),
    "🎠": ("roller-coaster", "pink"), "🎡": ("ferris-wheel", "pink"), "🎨": ("palette", "pink"), "🎬": ("clapperboard", "violet"),
    "🎭": ("drama", "pink"), "🎮": ("gamepad-2", "violet"), "🎯": ("target", "red"), "🎾": ("volleyball", "lime"),
    "🏀": ("ball-wave", "orange"), "🏆": ("trophy", "money"), "🏊": ("waves-ladder", "cyan"), "🏖": ("parasol", "cyan"),
    "🏗": ("hard-hat", "amber"), "🏘": ("houses", "indigo"), "🏙": ("building-complex", "indigo"), "🏚": ("house-cog", "slate"),
    "🏛": ("university", "indigo"), "🏞": ("trees", "emerald"), "🏟": ("dome", "indigo"), "🏠": ("house", "indigo"),
    "🏡": ("house-heart", "emerald"), "🏢": ("building", "indigo"), "🏥": ("hospital", "red"), "🏦": ("landmark", "money"),
    "🏨": ("hotel", "violet"), "🏪": ("store", "orange"), "🏫": ("school", "blue"), "🏬": ("shopping-bag", "pink"),
    "🏭": ("factory", "slate"), "🏰": ("castle", "violet"), "🐄": ("custom:cow", "brown"), "🐐": ("custom:goat", "slate"),
    "🐑": ("custom:sheep", "sky"), "🐔": ("bird", "amber"), "🐖": ("custom:pig", "rose"), "🐛": ("worm", "green"),
    "🐝": ("custom:bee", "yellow"), "🐠": ("fish", "cyan"), "🐾": ("paw-print", "orange"), "👕": ("shirt", "blue"),
    "👟": ("sport-shoe", "orange"), "👥": ("users", "teal"), "👩‍🚀": ("user-round-star", "violet"), "👮": ("shield-user", "blue"),
    "💐": ("flower", "pink"), "💖": ("heart", "pink"), "💡": ("lightbulb", "yellow"), "💥": ("bomb", "red"),
    "💧": ("droplet", "cyan"), "💰": ("coins", "money"), "💱": ("arrow-right-left", "money"), "💵": ("banknote", "green"),
    "💻": ("laptop", "blue"), "💼": ("briefcase-business", "brown"), "📅": ("calendar-days", "indigo"), "📈": ("trending-up", "green"),
    "📉": ("trending-down", "red"), "📐": ("pencil-ruler", "blue"), "📖": ("book-open", "blue"), "📚": ("library-big", "blue"),
    "📜": ("scroll", "brown"), "📝": ("notebook-pen", "blue"), "📡": ("satellite-dish", "violet"), "📣": ("megaphone", "orange"),
    "📦": ("package", "brown"), "📬": ("mailbox", "blue"), "📮": ("inbox", "red"), "📰": ("newspaper", "slate"),
    "📱": ("smartphone", "blue"), "📺": ("tv", "violet"), "🔁": ("repeat", "blue"), "🔄": ("refresh-cw", "blue"),
    "🔒": ("lock", "slate"), "🔥": ("flame", "orange"), "🔧": ("wrench", "slate"), "🔬": ("microscope", "violet"),
    "🔭": ("telescope", "violet"), "🕊": ("feather", "sky"), "🕍": ("church", "violet"), "🕰": ("clock-3", "brown"),
    "🖤": ("heart", "slate"), "🖥": ("monitor", "blue"), "🖨": ("printer", "slate"), "🖼": ("image", "pink"),
    "🗑": ("trash", "slate"), "🗞": ("rss", "orange"), "🗼": ("lighthouse", "red"), "🗽": ("crown", "teal"),
    "🗿": ("stone", "slate"), "😄": ("laugh", "green"), "😐": ("meh", "amber"), "😟": ("face-slightly-frowning", "red"),
    "🙂": ("smile", "lime"), "🚀": ("rocket", "violet"), "🚇": ("train-front-tunnel", "sky"), "🚉": ("train-front", "sky"),
    "🚊": ("tram-front", "sky"), "🚌": ("bus-front", "sky"), "🚏": ("signpost", "sky"), "🚒": ("fire-extinguisher", "red"),
    "🚓": ("siren", "blue"), "🚗": ("car-front", "sky"), "🚚": ("truck", "orange"), "🚦": ("traffic-cone", "orange"),
    "🚧": ("construction", "amber"), "🚩": ("flag", "red"), "🚰": ("faucet", "cyan"), "🚿": ("shower-head", "cyan"),
    "🛍": ("shopping-bag", "pink"), "🛏": ("bed", "indigo"), "🛒": ("shopping-cart", "amber"), "🛝": ("toy-brick", "orange"),
    "🛡": ("shield-half", "blue"), "🛣": ("road", "slate"), "🛤": ("train-track", "slate"), "🛰": ("satellite", "violet"),
    "🛵": ("moped", "orange"), "🛸": ("orbit", "violet"), "🤒": ("thermometer", "red"), "🤝": ("handshake", "teal"),
    "🥇": ("medal", "money"), "🥐": ("croissant", "orange"), "🥔": ("bean", "brown"), "🥕": ("carrot", "orange"),
    "🥖": ("cookie", "amber"), "🥚": ("egg", "amber"), "🥛": ("milk", "sky"), "🥤": ("cup-soda", "red"),
    "🥬": ("leafy-green", "green"), "🦁": ("cat", "orange"), "🦃": ("drumstick", "brown"), "🦆": ("custom:duck", "cyan"),
    "🦙": ("custom:llama", "purple"), "🧀": ("cheese", "yellow"), "🧩": ("puzzle", "violet"), "🧪": ("flask-conical", "violet"),
    "🧰": ("toolbox", "red"), "🧱": ("brick-wall", "red"), "🧵": ("spool", "pink"), "🧶": ("cloud", "sky"),
    "🧸": ("baby", "pink"), "🧹": ("broom", "slate"), "🧺": ("shopping-basket", "orange"), "🧾": ("receipt-text", "slate"),
    "🩺": ("stethoscope", "teal"), "🪄": ("wand-sparkles", "violet"), "🪑": ("armchair", "brown"), "🪙": ("circle-dollar-sign", "money"),
    "🪴": ("plant-pot", "green"), "🫁": ("heart-pulse", "cyan"),
}
ALIAS = {"★": "⭐", "✕": "❌"}  # drobné značky v textu: stejné ikony jako výše
BARE = {  # značky bez dlaždice (kreslí se přímo v textu)
    "✓": '<path d="m5 12.5 4.500 4.500L19 7" fill="none" stroke="#22c55e" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"/>',
    "▲": '<path d="M12 6 20 17H4z" fill="currentColor"/>',
    "▼": '<path d="M12 18 4 7h16z" fill="currentColor"/>',
}

# Ruční symboly (mřížka 24, čára 2, kulaté konce), tam kde Lucide nic nemá.
CUSTOM = {
    "cow": '<path d="M7 8C5.500 7.500 4 6 4 4M17 8c1.500-.5 3-2 3-4"/><path d="M6.500 11 3 10.500M17.500 11l3.500-.5"/><path d="M7 8h10l1 5c0 2.500-1 4-3 4.500V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1.500C7 17 6 15.500 6 13z"/><path d="M9.500 12h.01M14.500 12h.01M10.500 18h.01M13.500 18h.01"/>',
    "pig": '<path d="M6 7 5 3.500 9.500 5.500M18 7l1-3.500-4.500 2"/><ellipse cx="12" cy="12" rx="7.500" ry="7"/><ellipse cx="12" cy="14.500" rx="3" ry="2.200"/><path d="M8.500 10h.01M15.500 10h.01M11 14.500h.01M13 14.500h.01"/>',
    "sheep": '<path d="M7.500 9a3.500 3.500 0 0 1 4.500-3 3.500 3.500 0 0 1 4.500 3 2.500 2.500 0 0 1 1 4H6.500a2.500 2.500 0 0 1 1-4z"/><path d="M9 13v3.500a3 4 0 0 0 6 0V13"/><path d="M8.500 14 5.500 15.500M15.500 14l3 1.500"/><path d="M10.500 14.500h.01M13.500 14.500h.01M12 18.500h.01"/>',
    "goat": '<path d="M9 6C8 4 6 3.500 5 4.500M15 6c1-2 3-2.500 4-1.500"/><path d="M8 7h8l1 5-2 4v2l-3 3-3-3v-2l-2-4z"/><path d="M8 10 4.500 10.500M16 10l3.500.5"/><path d="M10 11h.01M14 11h.01M12 18v3"/>',
    "llama": '<path d="M9 7 8 2.500M15 7l1-4.500"/><path d="M8.500 7h7l.5 4c0 1-.7 2-1.800 2.500V21h-4.400v-7.500C8.700 13 8 12 8 11z"/><path d="M10.500 9.500h.01M13.500 9.500h.01M11 11.500h2M9.500 17h5"/>',
    "duck": '<circle cx="14" cy="7" r="3.500"/><path d="M17.500 7 21 8l-3.500 1M14.500 6h.01"/><path d="M11 9.500C9 11 5 11.500 4 15c0 3 3 5 8 5 4.500 0 7.500-2 7.500-5 0-2.500-2-3.500-4-3.500"/><path d="M9 15c1.500 1 3.500 1 5 0"/>',
    "bee": '<path d="M9 9C6.500 6 4 6.500 4 8.500S6 11 9 10.500M15 9c2.500-3 5-2.500 5-.5s-2 2.500-5 2"/><path d="M12 8c-2.500 0-4 2-4 5s1.500 7 4 7 4-4 4-7-1.500-5-4-5z"/><path d="M8.200 12h7.600M8.500 15.500h7M10.500 6.500 9 4M13.500 6.500 15 4"/>',
    "corn": '<path d="M12 3c2.500 0 4 3 4 7.500S14.500 19 12 19s-4-4-4-8.500S9.500 3 12 3z"/><path d="M8.200 9h7.600M8 12.500h8M8.500 16h7M12 3v16"/><path d="M12 22c-4 0-7-3-7.500-7 3 .5 5.500 2.500 7.500 7zM12 22c4 0 7-3 7.500-7-3 .5-5.500 2.500-7.500 7z"/>',
    "mushroom": '<path d="M3.500 12.500C3.500 7.500 7.500 4 12 4s8.500 3.500 8.500 8.500z"/><path d="M9 12.500V18a3 3 0 0 0 6 0v-5.500"/><path d="M8.500 9h.01M12.500 7h.01M15.500 10h.01"/>',
    "tomato": '<path d="M12 6.500C7 6 3.500 9 3.500 13.500S7.500 21 12 21s8.500-3 8.500-7.500S17 6 12 6.500z"/><path d="M12 6.500 9 4.500M12 6.500l3-2M12 6.500V3.500M12 6.500 8 7.500M12 6.500l4 1"/>',
    "watermelon": '<path d="M3 9a9 9 0 0 0 18 0z"/><path d="M5.500 9a6.500 6.500 0 0 0 13 0"/><path d="M9 12.500h.01M12 14.500h.01M15 12.500h.01"/>',
    "strawberry": '<path d="M12 21c-4.500-2.500-7.500-6-7.500-9.500 0-2 1.500-3.500 3.500-3.500 1.500 0 2.800.8 4 .8s2.500-.8 4-.8c2 0 3.500 1.500 3.500 3.500 0 3.500-3 7-7.500 9.500z"/><path d="M12 8.500C10.500 8.500 8.500 7.500 8 5.500c1.500 0 3 .8 4 2.500 1-1.700 2.500-2.500 4-2.500-.5 2-2.500 3-4 3z"/><path d="M9.500 12.500h.01M12.500 11.500h.01M14.500 14.500h.01M11 16h.01"/>',
    "bread": '<path d="M5 10c-2-.5-2.500-3-1-4.500S8 4 12 4s6.500-.2 8 1.500S19.500 9.500 19 10V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 13h6M9 16.500h4"/>',
    "honey": '<path d="M7 5h10v3H7z"/><path d="M6 8h12v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z"/><path d="M9 12h6v4H9z"/><path d="M15 5V2.500M13.500 2.500h3"/>',
    "pumpkin": '<path d="M12 6.500c-2-1.500-4.500-1.500-6.500 0C3.500 8 2.500 10.500 2.500 13c0 4 3.500 7 6 7 1.500 0 2.200-.7 3.500-.7s2 .7 3.500.7c2.500 0 6-3 6-7 0-2.500-1-5-3-6.500-2-1.500-4.500-1.500-6.500 0z"/><path d="M12 6.500V3.500l1.500-1M12 6.500c-2.500 3-2.500 10 0 13M12 6.500c2.500 3 2.500 10 0 13"/>',
}

def unwrap(body: str) -> str:
    """Lucide nastavuje čáru (currentColor, tloušťka 2...) na obálce nebo přímo na prvcích;
    to by přebilo naši bílou, tak to zahodíme a čáru nastavujeme sami v tile_svg."""
    body = re.sub(r' (?:fill="none"|stroke="currentColor"|stroke-linecap="round"|stroke-linejoin="round"|stroke-width="2")', "", body)
    m = re.match(r"^<g>(.*)</g>$", body, re.S)
    return m.group(1) if m else body

def esc_id(s): return re.sub(r"[^a-z0-9]", "", s)

def duotone(body: str, dy: float) -> str:
    """Doplní průsvitnou výplň uzavřeným tvarům a vrátí [stín, symbol] jako dvě vrstvy."""
    def fix(m):
        tag, attrs = m.group(1), m.group(2)
        closed = tag in ("circle", "rect", "ellipse", "polygon")
        if tag == "path":
            d = re.search(r'd="([^"]+)"', attrs)
            closed = bool(d and d.group(1).strip().lower().endswith("z"))
        return f"<{tag}{attrs}{' data-f' if closed else ''}/>"
    body = re.sub(r"<(path|circle|rect|ellipse|polygon|line|polyline)\b([^>]*?)/?>", fix, body)
    shadow = body.replace(" data-f", "")
    glyph = body.replace(" data-f", ' fill="#fff" fill-opacity=".24"')
    return (f'<g transform="translate(0 {dy})" stroke="#0b1020" stroke-opacity=".28" fill="none">{shadow}</g>'
            f'<g stroke="#fff" fill="none">{glyph}</g>')

def tile_svg(glyph_body: str, color: str) -> str:
    top, bot = COLORS[color]
    gid = "eg-" + color
    defs = (f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="{top}"/>'
            f'<stop offset="1" stop-color="{bot}"/></linearGradient>'
            '<linearGradient id="eg-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>')
    tile = (f'<rect x=".75" y=".75" width="22.500" height="22.500" rx="6.800" fill="url(#{gid})"/>'
            '<path d="M7.550.75h8.900c3.700 0 6.800 3.100 6.800 6.800V10C17 12.600 7 12.600.75 10V7.550C.75 3.850 3.850.75 7.550.75z" fill="url(#eg-gloss)"/>'
            '<rect x="1.200" y="1.200" width="21.600" height="21.600" rx="6.400" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>'
            f'<rect x=".4" y=".4" width="23.200" height="23.200" rx="7.100" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".8"/>')
    glyph = ('<g transform="translate(4.700 4.500) scale(.608)" stroke-width="2.300" stroke-linecap="round" stroke-linejoin="round">'
             + duotone(glyph_body, 1.4) + '</g>')
    return defs + tile + glyph

def main():
    lucide = json.load(open(sys.argv[1]))["icons"]
    out, missing = {}, []
    for ch, (g, color) in GLYPH.items():
        if g.startswith("custom:"): body = CUSTOM[g[7:]]
        elif g in lucide: body = unwrap(lucide[g]["body"])
        else: missing.append((ch, g)); continue
        out[ch] = tile_svg(body, color)
    for ch, to in ALIAS.items():
        if ch not in BARE: out[ch] = out[to]
    for ch, b in BARE.items(): out[ch] = b
    if missing: sys.exit(f"Chybí symboly: {missing}")
    ts = ("// Generováno skriptem tools/eco-icons/gen.py, neupravuj ručně.\n"
          "// Vlastní sada ikon her: dlaždice s přechodem + symboly z Lucide (ISC) a ručně kreslené.\n"
          "// Hodnota je vnitřek <svg viewBox=\"0 0 24 24\">. Značky bez dlaždice (✓ ▲ ▼) jsou v BARE.\n"
          f"export const ECO_BARE: string[] = {json.dumps(list(BARE), ensure_ascii=False)};\n"
          f"export const ECO_ICON_SVG: Record<string, string> = {json.dumps(out, ensure_ascii=False, separators=(',', ':'))};\n")
    open(OUT, "w", encoding="utf-8").write(ts)
    print(len(out), "icons", len(ts) // 1024, "KB")

main()
