"""Podmořské město pro uživatelský obchod: perleťová promenáda na mořském dně, pět mušlových kiosků (převlékárna, kancelář,
rámařství, galerie, akvárium), bubliny v trubicích, korálové sloupy, kotvy a světelné medúzy. Vodu, paprsky, ryby a bubliny
kreslí web. Spuštění: python more.py -- zadni | predni [--preview]   Výstup: out/more_<vrstva>/f_0001.png a kotvy.json
"""
from svet_lib import *

DECK = 0.3
SHELLS = ["#ff7aa8", "#46d6ff", "#ffb347", "#9a6aff", "#3fe0b0"]
SAND = "#e8d6a8"


def coral(x, y, s=1.0, c="#ff7aa8", z=DECK):
    cyl((x, y, z + 0.4 * s), 0.06 * s, 0.8 * s, M("koral" + c, c, 0.5), verts=8)
    for k in range(4):
        a = k * math.tau / 4 + x
        bar((x, y, z + 0.5 * s), (x + 0.28 * s * math.cos(a), y + 0.28 * s * math.sin(a), z + 0.95 * s), 0.035 * s, M("koral" + c, c, 0.5), verts=6)
        sphere((x + 0.28 * s * math.cos(a), y + 0.28 * s * math.sin(a), z + 0.97 * s), 0.05 * s, G("korK" + c, c, 1.2), seg=8, rings=6)


def seaweed(x, y, h=1.2, z=DECK):
    for k in range(5):
        sphere((x + 0.03 * math.sin(k * 1.3), y, z + 0.12 + k * h / 5), 0.07, M("rasa" + str(k % 2), ["#2fb870", "#4fe08a"][k % 2], 0.6), scale=(0.7, 0.5, 1.4), seg=8, rings=6)


def shell_kiosk(cx, c, key):
    with grp("zadni"):
        for sx in (-1, 1):
            cyl((cx + sx * 1.25, 0.2, DECK + 1.5), 0.13, 3.0, M("sloupP", "#f4f1ea", 0.35, 0.2), verts=16)
            sphere((cx + sx * 1.25, 0.2, DECK + 3.0), 0.2, M("sloupK", c, 0.3), seg=12, rings=8)
        # zadní stěna: perleťová mušle
        box((cx, 0.95, DECK + 1.5), (2.5, 0.12, 2.8), M("mu_zadni", "#1d5a7a", 0.5), bevel=0.06)
        box((cx, 0.88, DECK + 1.5), (2.3, 0.02, 2.6), G("mu_rim" + c, c, 0.5), bevel=0)
        # střecha: velká mušle (vějíř)
        sphere((cx, 0.0, DECK + 3.0), 1.7, M("strechaM" + c, c, 0.28, 0.1), scale=(1.0, 0.85, 0.42), seg=32, rings=16)
        for k in range(9):
            a = -1.3 + k * 0.325
            bar((cx, 0.0, DECK + 2.7), (cx + 1.55 * math.sin(a), -0.5, DECK + 2.95), 0.03, M("zebro" + c, "#ffffff", 0.3), verts=6)
        sphere((cx, -0.15, DECK + 3.35), 0.2, G("perla", "#ffffff", 2.5), seg=14, rings=10)
        # cedule z perlové desky
        box((cx, -0.88, DECK + 2.4), (1.7, 0.06, 0.36), M("cedule_m", "#2a4a6a", 0.4), bevel=0.02)
        box((cx, -0.92, DECK + 2.4), (1.6, 0.02, 0.28), G("cedule_ms" + c, "#bff0ff", 0.9), bevel=0)
        for sx in (-1, 1):
            bar((cx + sx * 0.8, -0.88, DECK + 2.6), (cx + sx * 0.8, -0.3, DECK + 2.85), 0.012, M("lano_m", "#cfe8f0", 0.5), verts=5)


def pearl_counter(cx, w=2.1):
    with grp("predni"):
        box((cx, -0.75, DECK + 0.3), (w, 0.55, 0.6), M("pult_m", "#d8eef0", 0.35, 0.2), bevel=0.08)
        box((cx, -0.75, DECK + 0.64), (w + 0.1, 0.62, 0.07), M("pult_md", "#46b6e0", 0.3, 0.3), bevel=0.03)
        for k in range(4):
            sphere((cx - 0.75 + k * 0.5, -1.04, DECK + 0.3), 0.06, G("perlaP", "#ffffff", 1.5), seg=8, rings=6)


def build():
    out = begin("more", "#5fa8d8", sun_color="#bfeaff", sun_energy=3.0, fill="#8ad0ff", exposure=0.2, extra=[((-6, -6, 3), (0, 0, 1), 200, 8, "#7ef0d8")])
    anchors = {}
    with grp("zadni"):
        # dno: pískové schody, perleťová promenáda
        box((0, -0.45, DECK - 0.1), (17.6, 3.1, 0.2), M("podlaha_m", SAND, 0.85), bevel=0.04)
        for k in range(11):
            box((-8.0 + k * 1.6, -0.45, DECK + 0.004), (0.9, 2.8, 0.012), M("dlaz_m" + str(k % 2), ["#f4ead0", "#e2d0a0"][k % 2], 0.8), bevel=0)
        box((0, -2.05, DECK - 0.3), (17.6, 0.2, 0.6), M("hrana_m", "#f4f1ea", 0.35, 0.2), bevel=0.06)
        for k in range(9):
            sphere((-8.0 + k * 2.0, -2.12, DECK - 0.25), 0.28, M("skoljka", ["#ff9ad8", "#f4f1ea", "#ffd24d"][k % 3], 0.5), scale=(1.1, 0.6, 0.7), seg=10, rings=6)
        # korálová brána a sloupy v pozadí
        for k, (tx, ty, c) in enumerate(((-8.2, 2.4, "#ff7aa8"), (-4.9, 3.0, "#ffb347"), (-1.6, 2.6, "#9a6aff"), (1.6, 3.0, "#46d6ff"), (4.9, 2.6, "#ff7aa8"), (8.2, 3.0, "#3fe0b0"))):
            cyl((tx, ty, 3.2), 0.5, 6.4, M("sloupK" + c, c, 0.45), verts=18)
            for j in range(4):
                sphere((tx + 0.3 * math.sin(j + tx), ty - 0.45, 1.0 + j * 1.3), 0.3, M("sloupK" + c, c, 0.45), scale=(1, 0.7, 1), seg=10, rings=8)
            sphere((tx, ty, 6.6), 0.7, G("sloupG" + c, c, 1.0), seg=16, rings=10)
        # kotva a řetěz u kraje
        torus((-8.2, -1.2, DECK + 0.65), 0.35, 0.05, M("kotva", "#3a4a6a", 0.4, 0.7), rot=(math.pi / 2, 0, 0))
        bar((-8.2, -1.2, DECK + 0.3), (-8.2, -1.2, DECK + 1.2), 0.05, M("kotva", "#3a4a6a", 0.4, 0.7), verts=8)
        bar((-8.5, -1.2, DECK + 1.0), (-7.9, -1.2, DECK + 1.0), 0.05, M("kotva", "#3a4a6a", 0.4, 0.7), verts=8)
        for x_ in (-7.0, -5.0, -3.9, -1.7, -0.3, 1.9, 3.7, 5.2, 7.2):
            seaweed(x_, 1.0 + 0.2 * math.sin(x_), h=1.2 + 0.3 * math.sin(x_ * 2))
        for k, x_ in enumerate((-8.4, -4.8, 4.9, 8.4)):
            coral(x_, -0.4 - 0.3 * (k % 2), 1.2, ["#ff7aa8", "#9a6aff", "#ffb347", "#3fe0b0"][k])
    for key, cx, c in zip(STALL_KEYS, STALL_X, SHELLS):
        shell_kiosk(cx, c, key)
        pearl_counter(cx)
        anchors[key] = stall_anchors(cx, DECK, name_z=2.4, roof_z=3.0)
    with grp("zadni"):
        for k in range(3):  # převlékárna: potápěčské kostýmy
            mx = -7.2 + k * 0.7
            sphere((mx, 0.55, DECK + 1.5), 0.16, M("helmaM", "#cfeaff", 0.1, 0.1), seg=14, rings=10)
            cyl((mx, 0.55, DECK + 1.0), 0.2, 0.7, M("oblekM" + str(k), ["#ffd24d", "#ff7aa8", "#46d6ff"][k], 0.5), verts=14)
            bar((mx, 0.55, DECK), (mx, 0.55, DECK + 0.65), 0.025, M("stojan_m", "#9aa6c0", 0.4, 0.6), verts=6)
        cx = -3.2  # kancelář: perlová knihovna s lahvovou poštou
        for k in range(3):
            box((cx - 0.55, 0.6, DECK + 1.1 + k * 0.5), (1.1, 0.25, 0.04), M("police_m", "#cfe8f0", 0.4), bevel=0.01)
        for k in range(3):
            cyl((cx - 0.5 + k * 0.3, 0.6, DECK + 1.28 + 0.5 * (k % 2)), 0.07, 0.34, M("lahev", "#bfe8d0", 0.1, 0.1), verts=10, rot=(0, math.radians(90), 0))
        sphere((cx + 0.6, 0.55, DECK + 1.45), 0.14, G("perla", "#ffffff", 2.5), seg=10, rings=8)
        cx = 0.0   # rámařství: rámy z mušlí a korálu
        for k, rr in enumerate((0.34, 0.26)):
            torus((cx - 0.55 + k * 0.85, 0.7, DECK + 1.5 - 0.1 * k), rr, 0.05, M("ram_m", "#ff9ad8", 0.4), rot=(math.pi / 2, 0, 0))
            torus((cx - 0.55 + k * 0.85, 0.68, DECK + 1.5 - 0.1 * k), rr - 0.1, 0.02, G("ram_mz", "#bff0ff", 2.2), rot=(math.pi / 2, 0, 0))
        cx = 3.2   # galerie: obrazy z medúz
        for k, (c1, w_, h_) in enumerate((("#ff7aa8", 0.55, 0.7), ("#46d6ff", 0.55, 0.55), ("#9a6aff", 0.5, 0.65), ("#ffd24d", 0.45, 0.5))):
            box((cx - 0.9 + k * 0.6, 0.55, DECK + 1.45 + 0.12 * (k % 2)), (w_ + 0.08, 0.04, h_ + 0.08), M("ram_g", "#f4f1ea", 0.4), bevel=0.01)
            box((cx - 0.9 + k * 0.6, 0.52, DECK + 1.45 + 0.12 * (k % 2)), (w_, 0.02, h_), G("obraz" + c1, c1, 1.6), bevel=0)
        cx = 6.4   # akvárium: skleněná bublina s rybkou
        sphere((cx + 0.6, 0.45, DECK + 1.15), 0.62, M("akvarium", "#bfe8ff", 0.04, 0.1), seg=20, rings=14)
        sphere((cx + 0.6, 0.45, DECK + 1.0), 0.17, G("rybka", "#ffb347", 2.0), scale=(1.5, 0.8, 1), seg=12, rings=8)
        for sx in (-1, 1):
            torus((cx + 0.6 + sx * 0.4, 0.4, DECK + 1.5), 0.05, 0.015, G("bubl", "#ffffff", 2.0), rot=(math.pi / 2, 0, 0))
        # světelné medúzy nad promenádou
        for k, (x_, c1) in enumerate(((-5.0, "#ff9ad8"), (-1.6, "#7ef0d8"), (1.6, "#ffd24d"), (5.0, "#9a6aff"))):
            sphere((x_, -1.3, DECK + 3.6), 0.28, G("medusa" + c1, c1, 2.4), scale=(1, 1, 0.7), seg=14, rings=8)
            for j in range(4):
                bar((x_ + (j - 1.5) * 0.09, -1.3, DECK + 3.5), (x_ + (j - 1.5) * 0.11, -1.3, DECK + 3.0), 0.01, G("medusa" + c1, c1, 1.6), verts=5)
    with grp("predni"):
        for k in range(7):
            coral(-8.4 + k * 2.8, -1.85, 0.8, ["#ff7aa8", "#ffb347", "#9a6aff", "#3fe0b0"][k % 4], z=DECK - 0.1)
        for k in range(3):
            sphere((-6.0 + k * 5.5, -1.9, DECK + 0.05), 0.2, M("kamen_m", "#9ab0c0", 0.9), scale=(1.2, 0.8, 0.6), seg=10, rings=6)
        cx = -6.4
        for k in range(2):
            sphere((cx - 0.6 + k * 0.45, -0.75, DECK + 0.84), 0.13, M("helmaM", "#cfeaff", 0.1, 0.1), seg=14, rings=10)
        cx = -3.2
        for k in range(3):
            sphere((cx - 0.3 + k * 0.3, -0.75, DECK + 0.76), 0.07, G("perlaP", "#ffffff", 1.5), seg=8, rings=6)
        cx = 0.0
        sphere((cx + 0.5, -0.75, DECK + 0.8), 0.14, M("skoljka2", "#ff9ad8", 0.4), scale=(1.2, 0.5, 0.8), seg=12, rings=8)
        cx = 3.2
        cyl((cx + 0.4, -0.75, DECK + 0.8), 0.06, 0.4, M("stetec_m", "#46b6e0", 0.5), verts=8)
        cx = 6.4
        sphere((cx - 0.4, -0.75, DECK + 0.78), 0.1, M("krmivo", "#ffb347", 0.6), scale=(1, 1, 0.6), seg=10, rings=8)
    out["kotvy"] = anchors
    out["lod"] = [0.7, 0.07]                                 # ponorka plující za promenádou
    out["lampy"] = [norm(x, -1.3, DECK + 3.6) for x in (-5.0, -1.6, 1.6, 5.0)]
    out["ryba"] = norm(-1.7, -1.4, DECK + 0.2)
    out["krab"] = norm(7.6, -1.45, DECK)
    out["bublinac"] = norm(-8.2, -1.2, DECK + 0.9)
    out["pena"] = []
    finish("more", out)


build()
