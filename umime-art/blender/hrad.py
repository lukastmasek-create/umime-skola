"""Hrad a tržiště pro uživatelský obchod: dlážděné náměstí pod hradbami, pět dřevěných stánků s pruhovanými stříškami
(kostýmy, kancelář, kovárna, tkalcovna, sokolna), věže s praporci, studna, sudy a pochodně. Obloha, kopce a hrad v dálce
jsou z webu. Spuštění: python hrad.py -- zadni | predni [--preview]   Výstup: out/hrad_<vrstva>/f_0001.png a kotvy.json
"""
from svet_lib import *

DECK = 0.3
STONE = "#b8b0a4"
STRIPES = [("#d6362b", "#fff1d6"), ("#2f6fd8", "#fff1d6"), ("#2fa070", "#fff1d6"), ("#ff9a3c", "#fff1d6"), ("#8a3ffc", "#fff1d6")]


def stone(name="kamen_h", color=STONE):
    return stone_material(name, color, scale=22, strength=0.4, roughness=0.9)


def torch(x, y, z=DECK):
    bar((x, y, z), (x, y, z + 1.3), 0.04, M("pochodenD", "#4a3220", 0.8), verts=8)
    cyl((x, y, z + 1.32), 0.09, 0.1, M("pochodenK", "#2c2c38", 0.5, 0.6), verts=10)
    sphere((x, y, z + 1.45), 0.11, G("plamen_p", "#ffb347", 7.0), scale=(0.8, 0.8, 1.4), seg=10, rings=8)


def battlements(x0, x1, y, z, n):
    for k in range(n):
        box((x0 + (x1 - x0) * (k + 0.5) / n, y, z + 0.18), ((x1 - x0) / n * 0.55, 0.5, 0.36), stone(), bevel=0.02)


def tower(x, y, h=6.5, r=1.0, roof="#c0392b"):
    cyl((x, y, h / 2), r, h, stone("vez_k"), verts=28)
    cyl((x, y, h + 0.15), r + 0.15, 0.3, stone("vez_k2", "#a8a094"), verts=28)
    cone((x, y, h + 1.2), r + 0.25, 0.0, 1.9, M("vez_s" + roof, roof, 0.45), verts=28)
    bar((x, y, h + 2.1), (x, y, h + 2.9), 0.02, M("tyc", "#5a3c24", 0.8), verts=6)
    box((x + 0.28, y, h + 2.7), (0.5, 0.02, 0.3), M("praporek" + roof, roof, 0.5), bevel=0)
    for k in range(3):
        box((x, y - r + 0.02, 1.4 + k * 1.7), (0.18, 0.04, 0.45), G("strelnice", "#ffd98a", 2.2), bevel=0)


def market_stall(cx, c, key):
    c1, c2 = STRIPES[STALL_KEYS.index(key)]
    with grp("zadni"):
        # čtyři trámy, zadní stěna z prken
        for sx in (-1, 1):
            box((cx + sx * 1.25, 0.1, DECK + 1.5), (0.14, 0.14, 3.0), M("tram", "#6a4a2c", 0.8), bevel=0.02)
            box((cx + sx * 1.25, -0.9, DECK + 1.2), (0.12, 0.12, 2.4), M("tram", "#6a4a2c", 0.8), bevel=0.02)
        box((cx, 0.95, DECK + 1.3), (2.6, 0.12, 2.6), M("prkna_h", "#8a5e3c", 0.8), bevel=0.03)
        for k in range(6):
            box((cx - 1.0 + k * 0.4, 0.88, DECK + 1.3), (0.02, 0.02, 2.5), M("prkna_s", "#5a3c24", 0.8), bevel=0)
        # pruhovaná stříška (sedlová) z látky
        for i in range(8):
            u = (i + 0.5) / 8
            xx = cx - 1.45 + 2.9 * u
            box((xx, -0.1, DECK + 3.0 + 0.02 * (i % 2)), (0.36, 1.9, 0.07), M("pruh" + c1 + str(i % 2), c1 if i % 2 == 0 else c2, 0.6), rot=(0.1, 0, 0), bevel=0)
        for k in range(8):  # zoubkovaná sukně
            box((cx - 1.35 + k * 0.385, -1.02, DECK + 2.82), (0.3, 0.04, 0.22), M("pruh" + c1 + str(k % 2), c1 if k % 2 == 0 else c2, 0.6), bevel=0)
        # cedule
        box((cx, -0.98, DECK + 2.45), (1.7, 0.06, 0.34), M("cedule_h", "#3a2a1a", 0.7), bevel=0.02)
        box((cx, -1.02, DECK + 2.45), (1.6, 0.02, 0.26), G("cedule_hs" + c1, "#ffdca0", 0.8), bevel=0)
        # praporek na špičce
        bar((cx, -0.1, DECK + 3.1), (cx, -0.1, DECK + 3.75), 0.02, M("tyc", "#5a3c24", 0.8), verts=6)
        box((cx + 0.25, -0.1, DECK + 3.6), (0.46, 0.02, 0.26), M("prap" + c1, c1, 0.5), bevel=0)


def wooden_table(cx, w=2.1):
    with grp("predni"):
        box((cx, -0.75, DECK + 0.3), (w, 0.55, 0.6), M("pult_h", "#8a5e3c", 0.7), bevel=0.05)
        box((cx, -0.75, DECK + 0.64), (w + 0.1, 0.62, 0.07), M("pult_hd", "#c79256", 0.55), bevel=0.02)
        for k in range(5):
            box((cx - 0.8 + k * 0.4, -1.03, DECK + 0.3), (0.02, 0.01, 0.5), M("prkna_s", "#5a3c24", 0.8), bevel=0)


def barrel(x, y, s=1.0, z=DECK):
    cyl((x, y, z + 0.2 * s), 0.18 * s, 0.4 * s, M("sud_h", "#8a5a34", 0.7), verts=16)
    for dz in (0.08, 0.32):
        torus((x, y, z + dz * s), 0.185 * s, 0.014 * s, M("obruc_h", "#2c2c38", 0.4, 0.8))


def build():
    out = begin("hrad", "#cfe0f8", sun_color="#fff0d0", sun_energy=4.0, fill="#cde0ff", exposure=0.4, extra=[((-6, -6, 3), (0, 0, 1), 250, 8, "#ffe0b0")])
    anchors = {}
    with grp("zadni"):
        # dlážděné náměstí
        box((0, -0.5, DECK - 0.1), (17.6, 3.1, 0.2), stone("dlazba", "#a8a094"), bevel=0.02)
        rr = random.Random(5)
        for k in range(120):
            box((-8.4 + rr.uniform(0, 16.8), -1.9 + rr.uniform(0, 2.9), DECK + 0.004), (rr.uniform(0.22, 0.4), rr.uniform(0.18, 0.3), 0.012), M("dlazbaK" + str(k % 3), ["#bdb5a8", "#a8a094", "#cfc7ba"][k % 3], 0.9), rot=(0, 0, rr.uniform(0, 3)), bevel=0.004)
        box((0, -2.05, DECK - 0.3), (17.6, 0.2, 0.6), stone("kamen_o"), bevel=0.04)
        # hradby se cimbuřím, brána uprostřed a věže po stranách
        box((0, 1.6, DECK + 1.9), (17.6, 0.9, 3.8), stone(), bevel=0.03)
        for k in range(12):
            box((-8.1 + k * 1.5, 1.4, DECK + 4.05), (0.8, 0.5, 0.5), stone(), bevel=0.02)
        tower(-8.4, 1.4, h=5.2, roof="#c0392b")
        tower(8.4, 1.4, h=5.2, roof="#2f6fd8")
        # brána s padací mříží
        box((0, 1.15, DECK + 1.8), (2.0, 0.2, 3.6), M("brana_t", "#2c2438", 0.7), bevel=0.02)
        cyl((0, 1.05, DECK + 3.6), 1.0, 0.25, M("brana_t", "#2c2438", 0.7), verts=24, rot=(math.pi / 2, 0, 0))
        for k in range(7):
            bar((-0.8 + k * 0.27, 1.0, DECK + 0.3), (-0.8 + k * 0.27, 1.0, DECK + 3.5), 0.03, M("mrize", "#3a3a48", 0.4, 0.7), verts=6)
        for k in range(5):
            bar((-0.9, 1.0, DECK + 0.7 + k * 0.7), (0.9, 1.0, DECK + 0.7 + k * 0.7), 0.025, M("mrize", "#3a3a48", 0.4, 0.7), verts=6)
        # vlajky a erby na hradbách
        for k, (x_, c) in enumerate(((-5.2, "#d6362b"), (-2.6, "#2f6fd8"), (2.6, "#2fa070"), (5.2, "#ffc933"))):
            box((x_, 1.05, DECK + 3.1), (0.7, 0.04, 1.2), M("erb" + c, c, 0.5), bevel=0.01)
            cone((x_, 1.05, DECK + 2.4), 0.35, 0.0, 0.35, M("erb" + c, c, 0.5), verts=3, rot=(math.pi, 0, 0))
            sphere((x_, 1.0, DECK + 3.1), 0.16, M("erb_k", "#ffffff", 0.5), scale=(1, 0.2, 1), seg=10, rings=8)
        # studna před bránou (v záloze)
        cyl((-7.6, -1.5, DECK + 0.25), 0.4, 0.5, stone("studna_k"), verts=20)
        for sx in (-1, 1):
            bar((-7.6 + sx * 0.38, -1.5, DECK + 0.5), (-7.6 + sx * 0.38, -1.5, DECK + 1.3), 0.04, M("tram", "#6a4a2c", 0.8), verts=6)
        box((-7.6, -1.5, DECK + 1.35), (1.0, 0.7, 0.07), M("strecha_s", "#a8574a", 0.6), rot=(0.18, 0, 0), bevel=0.01)
        # pochodně mezi stánky
        for x_ in (-8.0, -4.8, -1.6, 1.6, 4.8, 8.0):
            torch(x_, -1.5 if abs(x_) < 8 else -0.6)
    for i, (key, cx) in enumerate(zip(STALL_KEYS, STALL_X)):
        market_stall(cx, None, key)
        wooden_table(cx)
        anchors[key] = stall_anchors(cx, DECK, name_z=2.45, roof_z=3.1)
        anchors[key]["nazev"] = norm(cx, -1.02, DECK + 2.45)
    with grp("zadni"):
        # obsah stánků
        for k in range(3):  # kostýmy: šaty na tyčích
            mx = -7.2 + k * 0.7
            bar((mx, 0.55, DECK + 1.7), (mx, 0.55, DECK + 0.3), 0.03, M("tyc", "#5a3c24", 0.8), verts=6)
            cone((mx, 0.55, DECK + 1.0), 0.34, 0.1, 0.8, M("satHr" + str(k), ["#d6362b", "#2f6fd8", "#ffc933"][k], 0.6), verts=12)
            sphere((mx, 0.55, DECK + 1.5), 0.13, M("hlavaHr", "#e8c8a0", 0.6), seg=10, rings=8)
        cx = -3.2   # kancelář: pergameny a pečeť
        for k in range(3):
            box((cx - 0.5 + k * 0.4, 0.6, DECK + 1.4), (0.3, 0.02, 0.6), M("pergamen", "#f4e6c0", 0.8), rot=(0, 0.05 * (k - 1), 0.04 * (k - 1)), bevel=0)
        sphere((cx + 0.6, 0.55, DECK + 1.1), 0.12, M("pecet", "#d6362b", 0.4), scale=(1, 0.5, 1), seg=10, rings=8)
        cx = 0.0    # kovárna: kovadlina, meče a štíty na zdi
        box((cx - 0.6, 0.4, DECK + 0.35), (0.5, 0.3, 0.2), M("kovadlina", "#3a3a48", 0.3, 0.8), bevel=0.02)
        for k in range(3):
            bar((cx + 0.2 + k * 0.28, 0.75, DECK + 0.9), (cx + 0.2 + k * 0.28, 0.75, DECK + 2.0), 0.03, M("mec", "#d6dde8", 0.2, 0.9), verts=6)
            box((cx + 0.2 + k * 0.28, 0.75, DECK + 1.0), (0.2, 0.03, 0.04), M("ruk", "#c9a23a", 0.4, 0.7), bevel=0)
        cyl((cx - 0.6, 0.78, DECK + 1.6), 0.3, 0.05, M("stit", "#d6362b", 0.4, 0.5), verts=20, rot=(math.pi / 2, 0, 0))
        cx = 3.2    # tkalcovna: látky v barvách
        for k, c1 in enumerate(("#ff6f91", "#3b7be0", "#ffd24d", "#7ee0b0")):
            box((cx - 0.9 + k * 0.6, 0.6, DECK + 1.4), (0.5, 0.04, 1.4), M("latka" + c1, c1, 0.8), bevel=0)
        cx = 6.4    # sokolna: bidýlko a klobouk
        bar((cx - 0.8, 0.6, DECK + 1.5), (cx + 0.8, 0.6, DECK + 1.5), 0.04, M("tyc", "#5a3c24", 0.8), verts=6)
        for k in range(2):
            sphere((cx - 0.3 + k * 0.7, 0.6, DECK + 1.75), 0.15, M("sokol" + str(k), "#8a6a4a", 0.7), scale=(0.8, 0.8, 1.2), seg=10, rings=8)
        # kontejnery: sudy, bedny, seno
        barrel(8.1, -0.4)
        barrel(-8.2, -0.5, 1.1)
        box((7.8, 0.3, DECK + 0.2), (0.5, 0.4, 0.4), M("bedna_h", "#c79256", 0.8), rot=(0, 0, 0.3), bevel=0.02)
        for k in range(3):
            box((-6.2 + k * 0.55, 0.2, DECK + 0.14), (0.5, 0.35, 0.28), M("seno_h", "#f2c14a", 0.95), bevel=0.04)
    with grp("predni"):
        barrel(-4.9, -1.6, 0.9)
        barrel(-4.6, -1.7, 0.7)
        box((5.0, -1.6, DECK + 0.2), (0.5, 0.4, 0.4), M("bedna_h", "#c79256", 0.8), rot=(0, 0, -0.2), bevel=0.02)
        box((5.15, -1.55, DECK + 0.55), (0.34, 0.3, 0.3), M("bedna_h2", "#b07d48", 0.8), rot=(0, 0, 0.4), bevel=0.02)
        cx = -6.4
        for k in range(2):
            sphere((cx - 0.6 + k * 0.45, -0.75, DECK + 0.82), 0.16, M("klobouk_h" + str(k), ["#d6362b", "#2f6fd8"][k], 0.5), scale=(1, 1, 0.7), seg=12, rings=8)
        cx = -3.2
        box((cx, -0.75, DECK + 0.72), (0.5, 0.32, 0.1), M("kniha_h", "#8a3ffc", 0.5), bevel=0.02)
        cx = 0.0
        sphere((cx + 0.5, -0.75, DECK + 0.78), 0.12, M("podkova", "#4a4a58", 0.4, 0.7), scale=(1, 0.3, 1), seg=10, rings=8)
        cx = 3.2
        box((cx + 0.3, -0.75, DECK + 0.7), (0.5, 0.3, 0.05), M("latka_p", "#ff6f91", 0.8), bevel=0)
        cx = 6.4
        for k in range(2):
            sphere((cx - 0.4 + k * 0.4, -0.75, DECK + 0.76), 0.09, M("vejce_h", "#fff1d6", 0.5), scale=(1, 1, 1.3), seg=10, rings=8)
    out["kotvy"] = anchors
    out["lod"] = [0.72, 0.07]                                # hrad v dálce nad hradbami
    out["lampy"] = [norm(x, -1.5 if abs(x) < 8 else -0.6, DECK + 1.45) for x in (-8.0, -4.8, -1.6, 1.6, 4.8, 8.0)]
    out["pes"] = norm(-1.7, -1.45, DECK)
    out["slepice"] = norm(7.4, -1.4, DECK)
    out["katapult"] = norm(-7.4, -1.15, DECK + 0.7)
    out["pena"] = []
    finish("hrad", out)


build()
