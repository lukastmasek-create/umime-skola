"""Čtyři varianty každého kusu pro každou panenku (jediný zdroj pravdy). Blender podle toho staví modely a `python panenky_sets.py`
zapíše src/lib/dress-variants.json, ze kterého čerpá web (náhledové barvy a názvy tvarů).

Každá varianta je (druh, barvy). Druh je klíč tvaru, např. "hair:long" nebo "outfit:gown"; web k němu najde název v překladech.
Varianta 0 je vždy podpisový kus panenky."""
import json
import os

SLOTS = ("hair", "outfit", "shoes", "makeup", "accessory", "topper")

# (druh, hlavní barva, vedlejší barva)
HAIR = {
    "princess": [("long", "#f2c94c"), ("bob", "#b5532a"), ("pony", "#3a2418"), ("curly", "#e8a0c4")],
    "athlete": [("pony", "#7a4a2a"), ("bun", "#1c1c28"), ("braids", "#c25a2e"), ("bob", "#f0c75e")],
    "rocker": [("bob", "#2a1f3d"), ("pony", "#d02a8c"), ("curly", "#17131f"), ("long", "#6a3bb0")],
    "fairy": [("curly", "#58c27d"), ("long", "#a8e6cf"), ("braids", "#ff9ec4"), ("bun", "#b49cf0")],
    "chef": [("bun", "#3b2418"), ("bob", "#c4402a"), ("braids", "#1c1c28"), ("pony", "#e8c060")],
    "astronaut": [("braids", "#1c1c28"), ("bun", "#5a3a24"), ("bob", "#2a2a3a"), ("long", "#7a3b2a")],
}

# druh šatů: gown/short/mermaid/summer (princeznovské střihy), sport, rock, fairy, chef, astro
OUTFIT = {
    "princess": [("gown", "#ff7eb6", "#ffd1e8"), ("short", "#6fb3ff", "#ffffff"), ("mermaid", "#8a4bd0", "#e6dcff"), ("summer", "#7ee0b0", "#ffe36e")],
    "athlete": [("sport", "#2a8cff", "#ffffff"), ("short", "#ff7a3a", "#ffe0c0"), ("fairy", "#7ee0b0", "#ffffff"), ("rock", "#1f1b2e", "#2a8cff")],
    "rocker": [("rock", "#1f1b2e", "#c43cff"), ("sport", "#e8453c", "#ffffff"), ("mermaid", "#2a1f3d", "#c43cff"), ("fairy", "#c43cff", "#ffd1e8")],
    "fairy": [("fairy", "#7ee0b0", "#ffe36e"), ("short", "#ffb5d6", "#ffffff"), ("sport", "#58c27d", "#ffe36e"), ("rock", "#3a2a5c", "#7ee0b0")],
    "chef": [("chef", "#ffffff", "#ff6b5b"), ("mermaid", "#e8453c", "#fff0d0"), ("sport", "#ff9a3c", "#ffffff"), ("fairy", "#ffd1a8", "#ff6b5b")],
    "astronaut": [("astro", "#f2f4ff", "#ff5d73"), ("sport", "#2e3a6e", "#f4c542"), ("rock", "#3a2a5c", "#59e0ff"), ("short", "#59e0ff", "#ffffff")],
}

SHOES = {
    "princess": [("heels", "#ff4f9a", "#ffd1e8"), ("sneaker", "#ffffff", "#ff7eb6"), ("boots", "#7a4a2a", "#e6b84a"), ("ballet", "#d8b8ff", "#ffffff")],
    "athlete": [("sneaker", "#ffffff", "#ff5d3a"), ("heels", "#ff7a3a", "#ffe0c0"), ("boots", "#2a2438", "#2a8cff"), ("ballet", "#7ee0b0", "#ffffff")],
    "rocker": [("boots", "#2a2438", "#c43cff"), ("sneaker", "#e8453c", "#ffffff"), ("clog", "#1f1b2e", "#c43cff"), ("heels", "#7a1fa8", "#ffd1e8")],
    "fairy": [("ballet", "#ffb5d6", "#ffffff"), ("heels", "#7ee0b0", "#ffe36e"), ("sneaker", "#58c27d", "#ffffff"), ("boots", "#7a4a2a", "#ffe36e")],
    "chef": [("clog", "#ffffff", "#ff6b5b"), ("sneaker", "#e8453c", "#ffffff"), ("heels", "#ff9a3c", "#fff0d0"), ("boots", "#3b2418", "#ffb84d")],
    "astronaut": [("moon", "#c9cfe6", "#ff5d73"), ("sneaker", "#ffffff", "#2e3a6e"), ("boots", "#2e3a6e", "#59e0ff"), ("clog", "#f2f4ff", "#ff5d73")],
}

MAKEUP = {
    "princess": [("#c8365e", "#d89a9c", "#f2a0a8"), ("#c97b72", "#cfa68e", "#eab09a"), ("#8e1b3a", "#6d4a78", "#c97a8c"), ("#e0608a", "#46b5a8", "#f4b0b8")],
    "athlete": [("#d9695a", "#8fb8d8", "#f09a86"), ("#c97b72", "#cfa68e", "#eab09a"), ("#b02a3c", "#a07a62", "#d98a7a"), ("#e0608a", "#f0b840", "#f4a8a0")],
    "rocker": [("#7a1fa8", "#3a2a5c", "#b78acb"), ("#8e1b3a", "#26202e", "#c97a8c"), ("#d02a8c", "#5a2a7a", "#e0a0c8"), ("#2a1f3d", "#6a6a8a", "#a89ab8")],
    "fairy": [("#f06b9c", "#9be6c0", "#ffb0c8"), ("#e0608a", "#e8c8f0", "#ffc0d0"), ("#c8365e", "#46b5a8", "#f4a0b0"), ("#d890e0", "#ffe36e", "#ffc8e0")],
    "chef": [("#c8453c", "#e8a860", "#e89078"), ("#a83a2a", "#a07a62", "#d08068"), ("#e0608a", "#d8a0a0", "#f0a8a0"), ("#8e1b3a", "#7a4a3a", "#c87868")],
    "astronaut": [("#b44a64", "#7a8cff", "#d08a8a"), ("#8e1b3a", "#4a5aa0", "#c07a8a"), ("#d0607a", "#59e0ff", "#e8a0a8"), ("#6a2a4a", "#a8a8c8", "#b88898")],
}

ACCESSORY = {
    "princess": [("necklace", "#ffd23f", "#59c3ff"), ("glasses", "#e6b84a", "#ff7eb6"), ("bag", "#ff7eb6", "#ffffff"), ("wand", "#c9923a", "#ffe36e")],
    "athlete": [("medal", "#ffd23f", "#ff5d3a"), ("glasses", "#2a8cff", "#ffffff"), ("bag", "#ff7a3a", "#ffffff"), ("necklace", "#ffd23f", "#ff5d3a")],
    "rocker": [("glasses", "#1f1b2e", "#c43cff"), ("necklace", "#c9ced8", "#c43cff"), ("medal", "#c43cff", "#1f1b2e"), ("bag", "#1f1b2e", "#c43cff")],
    "fairy": [("wand", "#c9923a", "#ffe36e"), ("necklace", "#7ee0b0", "#ffe36e"), ("bag", "#ffb5d6", "#ffffff"), ("glasses", "#ff7eb6", "#ffe36e")],
    "chef": [("ladle", "#b0b6c2", "#6e4520"), ("bag", "#ff6b5b", "#ffffff"), ("medal", "#e8453c", "#ffd23f"), ("necklace", "#ffb84d", "#ff6b5b")],
    "astronaut": [("badge", "#ffd23f", "#2a8cff"), ("glasses", "#59e0ff", "#2e3a6e"), ("medal", "#ff5d73", "#ffffff"), ("necklace", "#c9cfe6", "#59e0ff")],
}

TOPPER = {
    "princess": [("crown", "#ffd23f", "#ff4f9a"), ("headband", "#ff7eb6", "#ffffff"), ("flowers", "#ff7eb6", "#ffe36e"), ("hat", "#e8c887", "#ff7eb6")],
    "athlete": [("cap", "#ff5d3a", "#ffffff"), ("headband", "#2a8cff", "#ffffff"), ("hat", "#e8c887", "#ff5d3a"), ("flowers", "#ff7a3a", "#ffe36e")],
    "rocker": [("jacket", "#2a2438", "#c43cff"), ("cap", "#1f1b2e", "#c43cff"), ("headband", "#7a1fa8", "#ffd1e8"), ("hat", "#2a2438", "#c43cff")],
    "fairy": [("flowers", "#ff7eb6", "#ffe36e"), ("headband", "#7ee0b0", "#ffffff"), ("crown", "#ffe36e", "#7ee0b0"), ("hat", "#a8e6cf", "#ff7eb6")],
    "chef": [("chefhat", "#ffffff", "#e6e6ee"), ("cap", "#e8453c", "#ffffff"), ("headband", "#ff9a3c", "#ffffff"), ("hat", "#e8c887", "#e8453c")],
    "astronaut": [("helmet", "#cfe3ff", "#9fb4d9"), ("cap", "#2e3a6e", "#f4c542"), ("hat", "#c9cfe6", "#ff5d73"), ("headband", "#59e0ff", "#ffffff")],
}

TABLE = {"hair": HAIR, "outfit": OUTFIT, "shoes": SHOES, "makeup": MAKEUP, "accessory": ACCESSORY, "topper": TOPPER}
DOLL_IDS = tuple(HAIR)


def swatch(slot, v):
    """Náhledová barva varianty pro web."""
    return v[1] if slot in ("hair", "outfit", "shoes", "accessory", "topper") else v[0]


def to_json():
    out = {}
    for did in DOLL_IDS:
        out[did] = {}
        for slot in SLOTS:
            out[did][slot] = [{"kind": f"{slot}:{v[0]}" if slot != "makeup" else f"makeup:{i}", "swatch": swatch(slot, v)} for i, v in enumerate(TABLE[slot][did])]
    return out


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, "..", "..", "src", "lib", "dress-variants.json")
    with open(path, "w") as f:
        json.dump(to_json(), f, indent=1, ensure_ascii=False)
    print("OK", os.path.abspath(path))
