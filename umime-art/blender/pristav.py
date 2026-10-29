"""Pirátský přístav pro uživatelský obchod: dřevěné molo s pěti stánky (avatary, tituly, rámečky, pozadí, mazlíčci),
sudy, bedny, kanón, palma a lucerny. Moře, pirátskou loď i obchodníky doplňuje web z vlastních vrstev, proto
se vykreslují dva průhledné obrázky: ZADNÍ (molo, zadní stěny a střechy stánků) a PŘEDNÍ (pulty, sudy a bedny před
obchodníky). Web je vrství: moře, loď, zadní vrstva, obchodníci, přední vrstva.

Spuštění: python pristav.py -- zadni | predni [--preview]   (každá vrstva ve vlastním procesu)
Výstup: out/pristav_<vrstva>/f_0001.png a out/pristav_kotvy.json (polohy pro web, normalizované)
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
W, H = (1000, 450) if PREVIEW else (2000, 900)
UNITS = 16.0
PPU = W / UNITS
EL = math.radians(26)
TZ = 1.3
CAM_D = 60.0
LAYER = [a for a in args() if a in ("zadni", "predni")][0] if any(a in ("zadni", "predni") for a in args()) else "zadni"
_M = {}


def M(name, color, roughness=0.7, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def G(name, color, strength=4.0):
    if name not in _M:
        _M[name] = glow(name, color, strength)
    return _M[name]


def project(x, y, z):
    return (W / 2 + PPU * x, H / 2 - PPU * (y * math.sin(EL) + (z - TZ) * math.cos(EL)))


def norm(x, y, z=0.0):
    px, py = project(x, y, z)
    return [round(px / W, 5), round(py / H, 5)]


WOOD, WOOD_D, WOOD_L = "#9a6a3c", "#6b4526", "#c79256"
GROUPS = {"zadni": [], "predni": []}
_cur = ["zadni"]


class grp:
    """Co se v bloku vytvoří, patří do dané vrstvy (zadní, nebo přední)."""

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.before = set(bpy.data.objects)

    def __exit__(self, *a):
        GROUPS[self.name] += [o for o in bpy.data.objects if o not in self.before]


def plank_deck(x0, x1, y0, y1, z, mat, mat2):
    """Molo z jednotlivých prken (šířka 0,3), střídají se dvě barvy."""
    x = x0
    k = 0
    while x < x1 - 0.01:
        w = min(0.34, x1 - x)
        box(((x + x + w) / 2, (y0 + y1) / 2, z), (w - 0.02, y1 - y0, 0.1), mat if k % 3 else mat2, bevel=0.012)
        x += w
        k += 1


def barrel(x, y, s=1.0, z=0.3):
    cyl((x, y, z + 0.2 * s), 0.19 * s, 0.4 * s, M("sud", WOOD, 0.8), verts=18)
    for dz in (0.1, 0.32):
        torus((x, y, z + dz * s), 0.19 * s, 0.014, M("sud_o", "#3a3a48", 0.4, 0.7))


def crate(x, y, s=1.0, z=0.3, rot=0.0):
    box((x, y, z + 0.16 * s), (0.32 * s, 0.32 * s, 0.32 * s), M("bedna", WOOD_L, 0.8), rot=(0, 0, rot), bevel=0.01)
    for sx in (-1, 1):
        box((x + sx * 0.15 * s * math.cos(rot), y + sx * 0.15 * s * math.sin(rot), z + 0.16 * s), (0.03 * s, 0.34 * s, 0.34 * s), M("bedna_l", WOOD_D, 0.8), rot=(0, 0, rot), bevel=0)


def coil(x, y, s=1.0, z=0.3):
    for k in range(4):
        torus((x, y, z + 0.03 + 0.03 * k), 0.18 * s - 0.01 * k, 0.025, M("lano", "#d8b878", 0.9))


def lantern(x, y, z):
    bar((x, y, z - 0.35), (x, y, z), 0.014, M("kov", "#3a3a48", 0.4, 0.7), verts=8)
    sphere((x, y, z + 0.08), 0.09, G("lucerna", "#ffcf6b", 5.0), scale=(1, 1, 1.25), seg=12, rings=8)
    cyl((x, y, z + 0.2), 0.06, 0.03, M("kov", "#3a3a48", 0.4, 0.7), verts=10)


def gold_pile(x, y, z, n=14, seed=1):
    import random
    r = random.Random(seed)
    for _ in range(n):
        a, d = r.uniform(0, math.tau), r.uniform(0, 0.13)
        sphere((x + d * math.cos(a), y + d * math.sin(a), z + 0.02 + r.uniform(0, 0.05) * (1 - d * 5)), 0.028, M("zlato", "#ffc933", 0.25, 0.9), scale=(1, 1, 0.5), seg=8, rings=6)


def awning(cx, y0, y1, z, w, c1, c2, back_z=None):
    """Střecha stánku: pruhovaná plachta, šikmo dolů dopředu."""
    n = 8
    for i in range(n):
        x = cx - w / 2 + (i + 0.5) * w / n
        box((x, (y0 + y1) / 2, z), (w / n, y1 - y0, 0.035), M("pr" + c1 + c2 + str(i % 2), c1 if i % 2 == 0 else c2, 0.6), rot=(0.35, 0, 0), bevel=0)
    # volán na předním okraji
    for i in range(n):
        x = cx - w / 2 + (i + 0.5) * w / n
        sphere((x, y0 - 0.02, z - 0.1), w / n / 2, M("pr" + c1 + c2 + str(i % 2), c1 if i % 2 == 0 else c2, 0.6), scale=(1, 0.2, 0.7), seg=10, rings=6)


def stall_frame(cx, w=2.4, z0=0.3, h=1.9, y_back=0.55):
    """Čtyři sloupky a zadní stěna z prken; vrací y přední hrany."""
    with grp("zadni"):
        for sx in (-1, 1):
            bar((cx + sx * w / 2, y_back, z0), (cx + sx * w / 2, y_back, z0 + h), 0.05, M("sloupek", WOOD_D, 0.8), verts=10)
            bar((cx + sx * w / 2, -1.2, z0), (cx + sx * w / 2, -1.2, z0 + h - 0.2), 0.05, M("sloupek", WOOD_D, 0.8), verts=10)
        for k in range(7):
            box((cx - w / 2 + 0.17 + k * (w - 0.34) / 6, y_back, z0 + 0.95), (0.34, 0.04, 1.5), M("zed" + str(k % 2), WOOD if k % 2 else WOOD_L, 0.8), bevel=0.006)


def counter(cx, w=2.1, y=-0.75, z=0.3):
    with grp("predni"):
        box((cx, y, z + 0.28), (w, 0.55, 0.56), M("pult", WOOD, 0.75), bevel=0.02)
        box((cx, y, z + 0.58), (w + 0.1, 0.62, 0.06), M("pult_d", WOOD_L, 0.7), bevel=0.015)
        for k in range(5):
            box((cx - w / 2 + 0.2 + k * (w - 0.4) / 4, y - 0.28, z + 0.28), (0.04, 0.02, 0.5), M("pult_l", WOOD_D, 0.8), bevel=0)


def build(layer):
    sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name="pristav_" + layer, world=("#cfe8ff", 0.9), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.35
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=4.2, color="#fff0d8", angle=0.25)
    add_area((6, -9, 8), (0, 0, 1), energy=700, size=10, color="#bcd4ff")
    out = {"w": W, "h": H, "ppu": PPU}
    deck_z = 0.3

    # ------------------------------------------------------------ molo
    with grp("zadni"):
        plank_deck(-8.6, 8.6, -2.0, 0.6, deck_z - 0.05, M("prkno", WOOD, 0.8), M("prkno2", WOOD_L, 0.8))
        box((0, -2.02, deck_z - 0.28), (17.3, 0.12, 0.4), M("nosnik", WOOD_D, 0.85), bevel=0.01)
        for x in [-8.4 + k * 1.4 for k in range(13)]:
            for y in (-1.95, 0.55):
                cyl((x, y, -0.4), 0.11, 1.1, M("pilota", "#5a3a22", 0.9), verts=10)
        # ochozy: zábradlí vpravo nahoře
        for k in range(9):
            bar((-8.3 + k * 0.4, 0.58, deck_z), (-8.3 + k * 0.4, 0.58, deck_z + 0.45), 0.025, M("zabr", WOOD_D, 0.8), verts=8)
        bar((-8.3, 0.58, deck_z + 0.45), (-5.1, 0.58, deck_z + 0.45), 0.03, M("zabr", WOOD_D, 0.8), verts=8)

    # ------------------------------------------------------------ pět stánků
    stalls = [
        ("avatary", -6.4, "#d6362b", "#fff0d6"),
        ("tituly", -3.2, "#2f6fd8", "#fff0d6"),
        ("ramecky", 0.0, "#2fa070", "#fff0d6"),
        ("pozadi", 3.2, "#ffc933", "#ff7a3c"),
        ("mazlicci", 6.4, "#8a3ffc", "#fff0d6"),
    ]
    anchors = {}
    for key, cx, c1, c2 in stalls:
        stall_frame(cx)
        with grp("zadni"):
            awning(cx, -1.45, -0.35, 2.5, 2.7, c1, c2)
            sphere((cx, 0.55, 2.75), 0.0001, M("x", WOOD), seg=4, rings=3)
        counter(cx)
        anchors[key] = {
            "npc": norm(cx - 0.1, -0.05, deck_z),
            "pult": norm(cx, -0.75, deck_z + 0.62),
            "strecha": norm(cx, -0.4, 2.7),
            "bublina": norm(cx, -0.2, 2.9),
            "nazev": norm(cx, -1.3, 2.6),
        }

    # --- obsah stánků -------------------------------------------------------------
    # 1 avatary: věšák s kostýmy, klobouky a zrcadlo
    cx = -6.4
    with grp("zadni"):
        bar((cx - 1.0, 0.4, deck_z + 1.55), (cx + 1.0, 0.4, deck_z + 1.55), 0.03, M("kov", "#3a3a48", 0.4, 0.7), verts=8)
        for k, c in enumerate(("#d6362b", "#2f6fd8", "#16132b", "#ffc933", "#2fa070")):
            xx = cx - 0.8 + k * 0.4
            box((xx, 0.38, deck_z + 1.15), (0.28, 0.06, 0.62), M("kost" + c, c, 0.65), rot=(0, 0, 0.05 * (k - 2)), bevel=0.02)
            sphere((xx, 0.4, deck_z + 1.5), 0.05, M("kost" + c, c, 0.65), seg=8, rings=6)
        torus((cx + 0.95, 0.5, deck_z + 1.0), 0.28, 0.035, M("rama", "#ffc933", 0.3, 0.9), rot=(math.pi / 2, 0, 0))
        cyl((cx + 0.95, 0.52, deck_z + 1.0), 0.26, 0.02, M("zrcadlo", "#bfe8ff", 0.05, 0.9), verts=24, rot=(math.pi / 2, 0, 0))
    with grp("predni"):
        for k, c in enumerate(("#16132b", "#d6362b")):
            # klobouk na pultu
            cyl((cx - 0.6 + k * 0.5, -0.75, deck_z + 0.68), 0.16, 0.05, M("klob" + c, c, 0.6), verts=20)
            sphere((cx - 0.6 + k * 0.5, -0.75, deck_z + 0.76), 0.1, M("klob" + c, c, 0.6), scale=(1, 1, 0.8), seg=14, rings=8)
        box((cx + 0.55, -0.75, deck_z + 0.66), (0.4, 0.3, 0.1), M("slozene", "#3b7be0", 0.7), bevel=0.02)
    # 2 tituly: truhla se zlatem, svitky, brk, cedule
    cx = -3.2
    with grp("zadni"):
        box((cx - 0.8, 0.2, deck_z + 0.2), (0.7, 0.45, 0.4), M("truhla", "#7a4a2e", 0.7), bevel=0.02)
        cyl((cx - 0.8, 0.2, deck_z + 0.4), 0.225, 0.7, M("truhla", "#7a4a2e", 0.7), verts=18, rot=(0, math.pi / 2, 0)).scale = (1, 1, 1)
        gold_pile(cx - 0.8, 0.2, deck_z + 0.43)
        box((cx - 0.8, -0.04, deck_z + 0.3), (0.12, 0.03, 0.14), M("zlato", "#ffc933", 0.25, 0.9), bevel=0)
        box((cx + 0.7, 0.45, deck_z + 1.2), (0.8, 0.04, 0.56), M("cedule", "#e9d8a6", 0.9), bevel=0.01)
        for k in range(3):
            box((cx + 0.55 + k * 0.15, 0.42, deck_z + 1.2 + 0.1 * (k % 2)), (0.1, 0.01, 0.04), M("ink", "#3a2a1a", 0.9), bevel=0)
        box((cx, 0.45, deck_z + 1.75), (1.4, 0.05, 0.3), M("tab", "#3a2a1a", 0.8), bevel=0.01)  # prázdná tabule nad stánkem
    with grp("predni"):
        for k in range(3):
            cyl((cx - 0.2 + k * 0.3, -0.75, deck_z + 0.67), 0.04, 0.34, M("svitek", "#f1e2b5", 0.9), verts=14, rot=(0, math.pi / 2, 0.2 * k))
        bar((cx + 0.7, -0.75, deck_z + 0.62), (cx + 0.8, -0.72, deck_z + 1.05), 0.012, M("brk", "#ffffff", 0.5), verts=6)
        sphere((cx + 0.7, -0.75, deck_z + 0.62), 0.07, M("kalamar", "#16132b", 0.4), seg=10, rings=8)
    # 3 rámečky: kormidlo a obrazy na stěně
    cx = 0.0
    with grp("zadni"):
        wheel_c = (cx - 0.7, 0.3, deck_z + 0.95)
        bar((cx - 0.7, 0.3, deck_z), (cx - 0.7, 0.3, deck_z + 0.95), 0.07, M("kormstojan", WOOD_D, 0.8), verts=10)
        torus(wheel_c, 0.42, 0.05, M("kormidlo", "#8a5a34", 0.55), rot=(math.pi / 2, 0, 0))
        for k in range(8):
            a = k * math.tau / 8
            bar(wheel_c, (wheel_c[0] + 0.58 * math.cos(a), wheel_c[1], wheel_c[2] + 0.58 * math.sin(a)), 0.03, M("kormidlo", "#8a5a34", 0.55), verts=8)
            sphere((wheel_c[0] + 0.58 * math.cos(a), wheel_c[1], wheel_c[2] + 0.58 * math.sin(a)), 0.055, M("kormidlo_h", "#ffc933", 0.3, 0.8), seg=8, rings=6)
        sphere(wheel_c, 0.09, M("kormidlo_h", "#ffc933", 0.3, 0.8), seg=12, rings=8)
        for k, (c, w_, h_) in enumerate((("#ffc933", 0.5, 0.6), ("#46d6ff", 0.55, 0.45), ("#ff6f91", 0.45, 0.55))):
            x = cx + 0.45 + k * 0.5
            box((x, 0.5, deck_z + 1.2 + 0.1 * (k % 2)), (w_ + 0.1, 0.04, h_ + 0.1), M("obr" + c, c, 0.35, 0.6), bevel=0.01)
            box((x, 0.47, deck_z + 1.2 + 0.1 * (k % 2)), (w_, 0.03, h_), M("platno", "#f3ecd8", 0.9), bevel=0)
    with grp("predni"):
        box((cx + 0.6, -0.75, deck_z + 0.66), (0.5, 0.34, 0.08), M("naradi", "#3a3a48", 0.5, 0.5), bevel=0.01)
        bar((cx + 0.35, -0.75, deck_z + 0.62), (cx + 0.35, -0.6, deck_z + 0.85), 0.02, M("kladivo", "#7a4a2e", 0.8), verts=8)
        box((cx + 0.35, -0.6, deck_z + 0.88), (0.14, 0.06, 0.06), M("kladivo_h", "#9aa0b0", 0.3, 0.8), bevel=0.01)
    # 4 pozadí: plachtoviny, vlajky, mapový stůl
    cx = 3.2
    with grp("zadni"):
        bar((cx - 1.0, 0.45, deck_z + 1.7), (cx + 1.0, 0.45, deck_z + 1.7), 0.03, M("kov", "#3a3a48", 0.4, 0.7), verts=8)
        for k, c in enumerate(("#d6362b", "#ffc933", "#3b7be0", "#2fa070", "#8a3ffc")):
            box((cx - 0.85 + k * 0.42, 0.43, deck_z + 1.2), (0.34, 0.03, 0.9), M("pl" + c, c, 0.7), rot=(0, 0, 0.04 * (k - 2)), bevel=0)
            sphere((cx - 0.85 + k * 0.42, 0.42, deck_z + 0.72), 0.04, M("pl_o", "#ffffff", 0.5), seg=8, rings=6)
        # černá vlajka s lebkou
        pole_top = (cx + 1.1, 0.3, deck_z + 2.1)
        bar((cx + 1.1, 0.3, deck_z), pole_top, 0.03, M("kormstojan", WOOD_D, 0.8), verts=8)
        box((cx + 1.35, 0.3, deck_z + 1.9), (0.5, 0.02, 0.34), M("cerna", "#16132b", 0.7), bevel=0)
        sphere((cx + 1.35, 0.28, deck_z + 1.93), 0.07, M("lebka", "#ffffff", 0.5), seg=10, rings=8)
        for sx in (-1, 1):
            bar((cx + 1.35 - 0.12, 0.28, deck_z + 1.82 + sx * 0.0), (cx + 1.35 + 0.12, 0.28, deck_z + 1.82), 0.012, M("lebka", "#ffffff", 0.5), verts=6)
    with grp("predni"):
        for k, c in enumerate(("#3b7be0", "#ffc933", "#d6362b")):
            cyl((cx - 0.6 + k * 0.45, -0.75, deck_z + 0.7), 0.075, 0.5, M("role" + c, c, 0.7), verts=14, rot=(0, math.pi / 2, 0.15 * k))
        box((cx + 0.7, -0.75, deck_z + 0.64), (0.45, 0.35, 0.03), M("mapa", "#e9d8a6", 0.9), bevel=0)
        bar((cx + 0.55, -0.7, deck_z + 0.66), (cx + 0.85, -0.78, deck_z + 0.66), 0.01, M("cerv", "#d6362b", 0.5), verts=6)
    # 5 mazlíčci: bidýlko, klec, hamak
    cx = 6.4
    with grp("zadni"):
        bar((cx - 0.9, 0.35, deck_z), (cx - 0.9, 0.35, deck_z + 1.1), 0.04, M("bidlo", WOOD_D, 0.8), verts=8)
        bar((cx - 1.1, 0.35, deck_z + 1.1), (cx - 0.5, 0.35, deck_z + 1.1), 0.035, M("bidlo", WOOD_D, 0.8), verts=8)
        # klec
        for k in range(9):
            a = k * math.tau / 9
            bar((cx + 0.7 + 0.22 * math.cos(a), 0.3 + 0.22 * math.sin(a), deck_z + 0.45), (cx + 0.7 + 0.1 * math.cos(a), 0.3 + 0.1 * math.sin(a), deck_z + 1.2), 0.012, M("kov", "#c9ced8", 0.3, 0.8), verts=6)
        torus((cx + 0.7, 0.3, deck_z + 0.45), 0.22, 0.02, M("kov", "#c9ced8", 0.3, 0.8))
        sphere((cx + 0.7, 0.3, deck_z + 1.2), 0.1, M("kov", "#c9ced8", 0.3, 0.8), seg=10, rings=8)
        # hamak
        bar((cx - 0.2, 0.5, deck_z + 1.55), (cx + 0.3, 0.5, deck_z + 1.4), 0.012, M("lano", "#d8b878", 0.9), verts=6)
    with grp("predni"):
        cyl((cx - 0.6, -0.75, deck_z + 0.7), 0.15, 0.1, M("mistka", "#46d6ff", 0.4), verts=20)
        sphere((cx - 0.6, -0.75, deck_z + 0.74), 0.12, M("ryby", "#ff8a3c", 0.5), scale=(1.4, 1, 0.5), seg=10, rings=8)
        box((cx + 0.2, -0.75, deck_z + 0.68), (0.4, 0.3, 0.08), M("kost2", "#f3ecd8", 0.8), bevel=0.02)

    # ------------------------------------------------------------ kulisy kolem
    with grp("zadni"):
        barrel(-8.0, -0.3, 1.0)
        barrel(-7.7, 0.15, 0.85)
        crate(-8.1, 0.4, 0.9, rot=0.3)
        coil(-5.0, 0.2)
        crate(4.9, 0.3, 1.0, rot=0.4)
        barrel(5.1, -0.1, 0.9)
        # kotva
        bar((8.1, 0.2, deck_z), (8.1, 0.2, deck_z + 0.8), 0.04, M("kotva", "#3a3a48", 0.4, 0.8), verts=8)
        torus((8.1, 0.2, deck_z + 0.85), 0.07, 0.02, M("kotva", "#3a3a48", 0.4, 0.8), rot=(math.pi / 2, 0, 0))
        torus((8.1, 0.2, deck_z + 0.25), 0.28, 0.035, M("kotva", "#3a3a48", 0.4, 0.8), rot=(math.pi / 2, 0, 0))
    with grp("predni"):
        # kanón na pravém okraji mola
        c_x, c_y = 8.0, -1.35
        cyl((c_x, c_y, deck_z + 0.3), 0.18, 0.8, M("kanon", "#2c2c38", 0.35, 0.8), verts=18, rot=(0, math.radians(100), math.radians(8)))
        for sy in (-1, 1):
            cyl((c_x - 0.1, c_y + sy * 0.2, deck_z + 0.16), 0.16, 0.06, M("kolo", WOOD_D, 0.8), verts=16, rot=(math.pi / 2, 0, 0))
        barrel(-8.1, -1.45, 1.0)
        crate(7.2, -1.6, 0.9, rot=0.2)
        crate(7.6, -1.5, 0.7, rot=0.5, z=deck_z + 0.3)
        coil(-5.2, -1.6, 1.0)
        # palma vpravo
    with grp("zadni"):
        px, py = 8.3, 0.0
        bar((px, py, deck_z), (px + 0.35, py, deck_z + 2.0), 0.1, M("palma", "#8a5a34", 0.9), verts=10)
        for k in range(8):
            a = k * math.tau / 8
            leaf = box((px + 0.35 + 0.5 * math.cos(a), py + 0.5 * math.sin(a) * 0.9, deck_z + 2.05 - 0.04 * (k % 2)), (0.95, 0.2, 0.025), M("list", "#3ea65a" if k % 2 else "#2f8f4a", 0.6), rot=(0, 0.35 * (1 if math.cos(a) > 0 else -1) * 0, a), bevel=0)
        sphere((px + 0.35, py, deck_z + 2.0), 0.12, M("kokos", "#6b4526", 0.7), seg=10, rings=8)
        for sx, sz in ((-0.08, 1.88), (0.08, 1.9)):
            sphere((px + 0.35 + sx, py - 0.06, deck_z + sz), 0.09, M("kokos", "#6b4526", 0.7), seg=10, rings=8)
        # lucerny na sloupcích stánků
    with grp("zadni"):
        for cx in (-7.6, -4.8, -1.6, 1.6, 4.8, 7.6):
            lantern(cx, -1.2, deck_z + 1.95)
    out["kotvy"] = anchors
    out["lod"] = norm(-2.2, 3.6, 0.0)
    out["lavka"] = [norm(-4.6, 0.6, deck_z + 0.1), norm(-3.6, 2.6, 0.5)]
    out["racci"] = [norm(-8.2, -0.3, 1.2), norm(8.4, -0.6, 1.2)]
    out["pena"] = [norm(x, y, 0.0) for x in [-8.4 + k * 1.4 for k in range(13)] for y in (-1.95,)]
    out["lampy"] = [norm(cx, -1.2, deck_z + 1.95) for cx in (-7.6, -4.8, -1.6, 1.6, 4.8, 7.6)]

    for lay, objs in GROUPS.items():
        if lay != layer:
            for o in objs:
                o.hide_render = True
    os.makedirs(os.path.join(OUT, "pristav_" + layer), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "pristav_" + layer, "kotvy.json"), "w"))
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, "pristav_" + layer)


build(LAYER)
