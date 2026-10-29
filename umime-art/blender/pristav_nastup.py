"""Molo s lávkou k pirátské galéře (nástup na loď): průhledná vrstva 1280 × 512 se stejnou kamerou jako pristav_lod.py
(PPU 100, náklon 26°, TZ 1.6), takže se loď z pásu snímků vloží doprostřed (svět x = 0 je uprostřed obrázku, vodoryska na řádku 400).
Molo je vlevo, lávka vede z mola na palubu. Web přidává moře, loď, hrdinu a pěnu u pilot.
Spuštění: python pristav_nastup.py [--preview]     Výstup: out/pristav_nastup/f_0001.png a kotvy.json
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
PART = [a for a in args() if a in ("molo", "lavka")][0] if any(a in ("molo", "lavka") for a in args()) else "molo"
W, H = 1280, 512
PPU = 100.0
EL = math.radians(26)
TZ = 1.6
WOOD, WOOD_D, WOOD_L = "#9a6a3c", "#6b4526", "#c79256"
_M = {}


def M(name, color, roughness=0.75, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def G(name, color, strength=4.0):
    if name not in _M:
        _M[name] = glow(name, color, strength)
    return _M[name]


def norm(x, y, z=0.0):
    return [round((W / 2 + PPU * x) / W, 5), round((H / 2 - PPU * (y * math.sin(EL) + (z - TZ) * math.cos(EL))) / H, 5)]


sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name="pristav_nastup_" + PART, world=("#cfe8ff", 0.9), view="AgX", look="AgX - Punchy")
sc.view_settings.exposure = 0.35
sc.render.film_transparent = True
add_camera((0, -60 * math.cos(EL), 60 * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=W / PPU)
add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=4.2, color="#fff0d8", angle=0.25)
add_area((-6, -9, 8), (0, 0, 1), energy=500, size=10, color="#bcd4ff")

DECK = 0.92            # horní plocha mola
X0, X1 = -6.6, -3.5    # molo od kraje obrázku po konec u lodi
Y0, Y1 = -2.2, 0.6
planks = ["#a2723f", "#946838", "#b07d48", "#8a5f33"]
gx0, gy0, gz0 = X1 - 0.1, -1.05, DECK + 0.02
gx1, gy1, gz1 = -1.35, -0.6, 1.0
steps = 14


def build_molo():
    # prkna palubky (příčně), každé trochu jiného odstínu
    k = 0
    x = X0
    while x < X1:
        w = 0.26
        box(((x + min(x + w, X1)) / 2, (Y0 + Y1) / 2, DECK - 0.04), (min(w, X1 - x) - 0.015, Y1 - Y0, 0.08), M("prkno%d" % (k % 4), planks[k % 4], 0.8), bevel=0.01)
        x += w
        k += 1
    # trámy pod molem a čelo
    box(((X0 + X1) / 2, Y0 + 0.05, DECK - 0.3), (X1 - X0, 0.14, 0.5), M("celo", WOOD_D, 0.85), bevel=0.01)
    box((X1 - 0.05, (Y0 + Y1) / 2, DECK - 0.3), (0.14, Y1 - Y0, 0.5), M("celo", WOOD_D, 0.85), bevel=0.01)
    # piloty do vody
    for px in (-6.3, -5.2, -4.1, -3.55):
        for py in (Y0 + 0.1, 0.5):
            cyl((px, py, -0.2), 0.12, 1.5, M("pilota", "#5a3a22", 0.9), verts=12)
            cyl((px, py, DECK - 0.4), 0.15, 0.1, M("pilota_c", "#3f2915", 0.9), verts=12)
    # sloupky s lanem po přední hraně
    posts = [-6.4, -5.3, -4.2, -3.6]
    for px in posts:
        cyl((px, Y0 + 0.08, DECK + 0.32), 0.075, 0.65, M("sloupek", WOOD_D, 0.85), verts=12)
        sphere((px, Y0 + 0.08, DECK + 0.68), 0.09, M("sloupek_k", WOOD_L, 0.7), seg=12, rings=8)
    for a, b in zip(posts, posts[1:]):
        n = 12
        prev = None
        for i in range(n + 1):
            t = i / n
            pxx = a + (b - a) * t
            pzz = DECK + 0.55 - 0.16 * math.sin(math.pi * t)
            cur = (pxx, Y0 + 0.08, pzz)
            if prev:
                bar(prev, cur, 0.022, M("lano", "#d8b878", 0.9), verts=6)
            prev = cur
    # kulisy: sudy, bedny, smotané lano, lucerna na sloupu, síť
    for (bx, by) in ((-6.0, -0.3), (-5.5, 0.15), (-4.6, 0.2)):
        cyl((bx, by, DECK + 0.2), 0.22, 0.4, M("sud", WOOD, 0.8), verts=18)
        torus((bx, by, DECK + 0.1), 0.22, 0.015, M("obruc", "#2c2c38", 0.4, 0.8))
        torus((bx, by, DECK + 0.32), 0.22, 0.015, M("obruc", "#2c2c38", 0.4, 0.8))
    box((-5.0, -0.5, DECK + 0.18), (0.5, 0.5, 0.36), M("bedna", "#c79256", 0.8), bevel=0.012)
    box((-5.0, -0.5, DECK + 0.5), (0.36, 0.36, 0.28), M("bedna2", "#b07d48", 0.8), rot=(0, 0, 0.3), bevel=0.012)
    torus((-4.0, -0.05, DECK + 0.05), 0.2, 0.05, M("lano", "#d8b878", 0.9))
    torus((-4.0, -0.05, DECK + 0.12), 0.16, 0.05, M("lano", "#d8b878", 0.9))
    cyl((-3.75, -1.9, DECK + 0.9), 0.045, 1.8, M("sloupek", WOOD_D, 0.85), verts=10)
    sphere((-3.75, -1.9, DECK + 1.9), 0.12, G("lucerna", "#ffcf6b", 3.0), seg=14, rings=10)
    box((-3.75, -1.9, DECK + 2.02), (0.22, 0.22, 0.05), M("lucerna_s", "#2c2c38", 0.5, 0.6), bevel=0.01)


def build_lavka():
    # lávka z mola na palubu galéry
    for i in range(steps):
        t0 = i / steps
        t1 = (i + 1) / steps
        a = (gx0 + (gx1 - gx0) * t0, gy0 + (gy1 - gy0) * t0, gz0 + (gz1 - gz0) * t0)
        b = (gx0 + (gx1 - gx0) * t1, gy0 + (gy1 - gy0) * t1, gz0 + (gz1 - gz0) * t1)
        mid = tuple((p + q) / 2 for p, q in zip(a, b))
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        ln = math.dist(a, b)
        box(mid, (ln + 0.02, 0.62, 0.07), M("lavka", planks[i % 4], 0.8), rot=(0, 0, ang), bevel=0.008)
        if i % 3 == 0:
            box(mid, (0.05, 0.64, 0.1), M("lavka_p", WOOD_D, 0.85), rot=(0, 0, ang), bevel=0.005)
    # zábradlí lávky: dvě tyče na sloupcích
    for s, off in (("f", -0.37), ("b", 0.37)):
        prev = None
        for i in range(steps + 1):
            t = i / steps
            px = gx0 + (gx1 - gx0) * t
            py = gy0 + (gy1 - gy0) * t + off
            pz = gz0 + (gz1 - gz0) * t + 0.38
            cur = (px, py, pz)
            if prev:
                bar(prev, cur, 0.02, M("lano", "#d8b878", 0.9), verts=6)
            if i % 4 == 0:
                cyl((px, py, pz - 0.2), 0.03, 0.4, M("sloupek", WOOD_D, 0.85), verts=8)
            prev = cur


build_molo() if PART == "molo" else build_lavka()


def update(t):
    pass


run(update, "pristav_nastup_" + PART)

json.dump({
    "w": W, "h": H, "ppu": PPU,
    "piloty": [norm(px, py, 0.0) for px in (-6.3, -5.2, -4.1, -3.55) for py in (Y0 + 0.1, 0.5)],
    "paluba_start": norm(-6.0, -0.9, DECK),     # kam hrdina vstoupí na molo
    "lavka_zacatek": norm(gx0, gy0, gz0),
    "lavka_konec": norm(gx1, gy1, gz1),
    "paluba_stred": norm(-0.3, -0.1, 0.95),
    "lucerna": norm(-3.75, -1.9, DECK + 1.9),
}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "pristav_nastup_" + PART, "kotvy.json"), "w"))
