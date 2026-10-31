"""Živý 3D pokoj (RoomView): místnost a dvanáct kusů nábytku → public/room/3d/<jméno>.glb

    python umime-art/blender/pokoj3d.py -- all [--preview]
    python umime-art/blender/pokoj3d.py -- mistnost desk --preview

Měřítko v metrech, přední strana nábytku míří k -Y (v three.js k +Z, ke kameře). Místnost je řez pokojem:
podlaha 7 × 6 m, zadní stěna s oknem (y = +3) a levá stěna s dveřmi (x = -3,5); rozmístění nábytku je
v src/lib/room3d.ts.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
import mestecko3d_lib as L  # noqa: E402
from mestecko3d_lib import *  # noqa: E402,F401,F403

L.OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "room", "3d")
WHITE = "#fffaf0"
RW, RD, RH = 7.0, 6.0, 2.8


# ------------------------------------------------------------------------------------------- místnost
def build_mistnost():
    # podlaha z prken
    rnd = random.Random(3)
    for k in range(int(RD / 0.2)):
        y = -RD / 2 + 0.1 + k * 0.2
        x0 = -RW / 2
        while x0 < RW / 2:
            ln = min(rnd.uniform(1.2, 2.4), RW / 2 - x0)
            box((x0 + ln / 2, y, -0.02), (ln - 0.01, 0.19, 0.04), mat(rnd.choice(["#b8844e", "#a8743e", "#c0905a"]), 0.75), 0.004)
            x0 += ln
    # stěny s lištami
    wall = mat("#f4e4cc", 0.95)
    box((0, RD / 2 + 0.06, RH / 2), (RW + 0.24, 0.12, RH), wall, 0)
    box((-RW / 2 - 0.06, 0, RH / 2), (0.12, RD, RH), wall, 0)
    stripe = mat("#e8c8a0", 0.9)
    box((0, RD / 2 - 0.005, 0.5), (RW, 0.01, 1.0), stripe, 0)
    box((-RW / 2 + 0.005, 0, 0.5), (0.01, RD, 1.0), stripe, 0)
    trim_m = mat(WHITE, 0.6)
    box((0, RD / 2 - 0.02, 1.0), (RW, 0.04, 0.05), trim_m, 0.005)
    box((-RW / 2 + 0.02, 0, 1.0), (0.04, RD, 0.05), trim_m, 0.005)
    box((0, RD / 2 - 0.02, 0.06), (RW, 0.04, 0.12), mat("#8a5a34", 0.7), 0.005)
    box((-RW / 2 + 0.02, 0, 0.06), (0.04, RD, 0.12), mat("#8a5a34", 0.7), 0.005)
    # okno se záclonami a parapetem (nad stolem)
    wx, wz, ww, wh = 0.8, 1.65, 1.5, 1.2
    box((wx, RD / 2 - 0.005, wz), (ww, 0.02, wh), glow("#bfe6ff", 0.8), 0)
    fm = mat(WHITE, 0.5)
    for dx in (-ww / 2, 0, ww / 2):
        box((wx + dx, RD / 2 - 0.04, wz), (0.07, 0.07, wh + 0.07), fm, 0.01)
    for dz in (-wh / 2, 0, wh / 2):
        box((wx, RD / 2 - 0.04, wz + dz), (ww + 0.07, 0.07, 0.07), fm, 0.01)
    box((wx, RD / 2 - 0.12, wz - wh / 2 - 0.05), (ww + 0.3, 0.24, 0.05), fm, 0.01)
    cyl((wx, RD / 2 - 0.1, wz + wh / 2 + 0.25), 0.02, ww + 1.2, mat("#8a5a34", 0.6), verts=8, rot=(0, math.pi / 2, 0))
    for s in (-1, 1):
        for k in range(5):
            cyl((wx + s * (ww / 2 + 0.18 + k * 0.07), RD / 2 - 0.12, wz + 0.05), 0.045, 1.6, mat("#e5484d" if k % 2 else "#f06070", 0.9), verts=8)
    # radiátor pod oknem
    for k in range(9):
        box((wx - 0.4 + k * 0.1, RD / 2 - 0.08, 0.45), (0.06, 0.06, 0.5), mat(WHITE, 0.4), 0.01)
    # dveře v levé stěně
    dz0 = 2.0
    box((-RW / 2 + 0.015, -1.8, dz0 / 2 + 0.02), (0.03, 0.9, dz0), mat("#a0703e", 0.6), 0.01)
    for k in range(2):
        box((-RW / 2 + 0.035, -1.8, 0.55 + k * 0.85), (0.01, 0.65, 0.65), mat("#8a5a34", 0.6), 0.005)
    for dy in (-0.5, 0.5):
        box((-RW / 2 + 0.04, -1.8 + dy, dz0 / 2 + 0.05), (0.06, 0.08, dz0 + 0.1), fm, 0.01)
    box((-RW / 2 + 0.04, -1.8, dz0 + 0.1), (0.06, 1.08, 0.08), fm, 0.01)
    sphere((-RW / 2 + 0.09, -1.45, 1.0), 0.04, mat("#ffd24d", 0.3, 0.7), seg=10)
    # plakáty a nástěnná polička
    for (x, y, z, w, h, c, face) in [(-1.9, RD / 2, 1.75, 0.7, 0.9, "#5a6cff", "y"), (2.6, RD / 2, 1.8, 0.6, 0.6, "#ff8a3d", "y"), (-RW / 2, 0.8, 1.7, 0.8, 0.6, "#3fb070", "x")]:
        if face == "y":
            box((x, y - 0.015, z), (w + 0.06, 0.02, h + 0.06), mat("#2a2a32", 0.5), 0)
            box((x, y - 0.03, z), (w, 0.01, h), mat(c, 0.6), 0)
            sphere((x, y - 0.04, z + 0.08), 0.12, mat("#ffd24d", 0.5), seg=10, scale=(1, 0.2, 1))
        else:
            box((x + 0.015, y, z), (0.02, w + 0.06, h + 0.06), mat("#2a2a32", 0.5), 0)
            box((x + 0.03, y, z), (0.01, w, h), mat(c, 0.6), 0)
            cone((x + 0.04, y, z - 0.05), 0.16, 0.25, mat("#ffffff", 0.5), verts=3, rot=(0, math.pi / 2, 0))
    box((-RW / 2 + 0.14, 2.0, 1.95), (0.25, 1.0, 0.04), mat("#8a5a34", 0.7), 0.01)
    for k, c in enumerate(["#e5484d", "#2e86c1", "#ffd24d"]):
        box((-RW / 2 + 0.14, 1.65 + k * 0.09, 2.1), (0.18, 0.06, 0.26), mat(c, 0.6), 0.005)
    cyl((-RW / 2 + 0.14, 2.3, 2.05), 0.06, 0.12, mat("#c8743a", 0.8), verts=10)
    sphere((-RW / 2 + 0.14, 2.3, 2.17), 0.09, mat("#3f9a4a", 0.8), seg=10)
    # vypínač
    box((-RW / 2 + 0.02, -1.15, 1.1), (0.02, 0.08, 0.12), mat(WHITE, 0.4), 0.005)


def build_rug():
    """Kulatý koberec se soustřednými pruhy (zvlášť, ať se dá posunout)."""
    for k, (r, c) in enumerate([(1.4, "#2e5aa8"), (1.15, "#f4ead8"), (0.9, "#e5a83a"), (0.65, "#f4ead8"), (0.4, "#e5484d")]):
        cyl((0, 0, 0.005 + k * 0.002), r, 0.01, mat(c, 0.95), verts=48)


def build_lampa():
    """Závěsná lampa (střed 0,0, visí od stropu dolů)."""
    cyl((0, 0, RH - 0.03), 0.08, 0.04, mat(WHITE, 0.5), verts=12)
    cyl((0, 0, RH - 0.4), 0.006, 0.75, mat("#2a2a2a", 0.6), verts=5)
    cone((0, 0, RH - 0.85), 0.32, 0.26, mat("#2e8a6a", 0.5), verts=24)
    sphere((0, 0, RH - 0.97), 0.07, glow("#ffe8b0", 3.0), seg=12)


# --------------------------------------------------------------------------------------------- nábytek
def build_rocketbed():
    w, d = 2.2, 1.1
    body = mat(WHITE, 0.4)
    red = mat("#e5484d", 0.4)
    box((0, 0, 0.22), (w, d, 0.3), body, 0.08)
    for x in (-0.5, 0.35):
        box((x, 0, 0.22), (0.12, d + 0.01, 0.31), red, 0.03)
    # špička rakety u hlavy, ploutve u nohou
    cone((w / 2 + 0.28, 0, 0.32), 0.42, 0.6, red, verts=20, rot=(0, math.pi / 2, 0))
    for s in (-1, 1):
        box((-w / 2 - 0.1, s * (d / 2 + 0.08), 0.25), (0.5, 0.16, 0.5), red, 0.04, rot=(0, 0, 0))
    box((-w / 2 - 0.2, 0, 0.55), (0.4, 0.12, 0.6), red, 0.04)
    for k in range(3):
        cyl((-0.9 + k * 0.6, -d / 2 - 0.005, 0.22), 0.09, 0.02, glow("#8fe8ff", 0.8), verts=16, rot=(math.pi / 2, 0, 0))
        torus((-0.9 + k * 0.6, -d / 2 - 0.01, 0.22), 0.1, 0.02, mat("#3a3f55", 0.4, 0.6), rot=(math.pi / 2, 0, 0))
    # matrace, přikrývka s hvězdami a polštář
    box((0, 0, 0.45), (w - 0.1, d - 0.12, 0.16), mat("#f4f4f8", 0.9), 0.06)
    box((-0.25, 0, 0.55), (w * 0.7, d - 0.06, 0.08), mat("#2e5aa8", 0.85), 0.04)
    rnd = random.Random(5)
    for k in range(9):
        sphere((-1.0 + rnd.uniform(0, 1.5), rnd.uniform(-0.4, 0.4), 0.595), 0.03, mat("#ffd24d", 0.5), seg=6)
    box((0.82, 0, 0.6), (0.36, 0.7, 0.14), mat(WHITE, 0.9), 0.06)
    # plyšák
    sphere((0.5, 0.3, 0.66), 0.1, mat("#c8946a", 0.9), seg=12)
    sphere((0.5, 0.3, 0.8), 0.07, mat("#c8946a", 0.9), seg=12)


def build_desk():
    w, d, h = 1.4, 0.7, 0.75
    wood = mat("#d8a868", 0.6)
    box((0, 0, h), (w, d, 0.05), wood, 0.02)
    for x in (-w / 2 + 0.05,):
        for y in (-d / 2 + 0.05, d / 2 - 0.05):
            box((x, y, h / 2), (0.05, 0.05, h), wood, 0.01)
    # kontejner se šuplíky
    box((w / 2 - 0.22, 0, h / 2), (0.4, d - 0.04, h - 0.04), wood, 0.02)
    for k in range(3):
        box((w / 2 - 0.22, -d / 2 + 0.005, 0.15 + k * 0.22), (0.36, 0.01, 0.18), mat("#e8bc80", 0.6), 0.005)
        box((w / 2 - 0.22, -d / 2 - 0.01, 0.2 + k * 0.22), (0.12, 0.02, 0.02), mat("#3a3f55", 0.4, 0.6), 0.005)
    # monitor, klávesnice, myš
    box((0, 0.2, h + 0.03), (0.22, 0.14, 0.02), mat("#2a2f45", 0.4, 0.5), 0.01)
    box((0, 0.22, h + 0.17), (0.05, 0.03, 0.28), mat("#2a2f45", 0.4, 0.5), 0.01)
    box((0, 0.18, h + 0.38), (0.62, 0.04, 0.38), mat("#1a1d2a", 0.3, 0.4), 0.015)
    box((0, 0.155, h + 0.39), (0.56, 0.01, 0.32), glow("#6fc3ff", 1.0), 0)
    box((0, -0.12, h + 0.035), (0.44, 0.15, 0.02), mat("#eef2f8", 0.5), 0.005)
    for r in range(3):
        for c in range(11):
            box((-0.19 + c * 0.038, -0.165 + r * 0.04, h + 0.05), (0.03, 0.03, 0.01), mat("#c8ccd4", 0.5), 0.002)
    sphere((0.33, -0.12, h + 0.035), 0.035, mat("#eef2f8", 0.5), seg=10, scale=(0.8, 1.2, 0.5))
    # lampička a stojánek s tužkami
    cyl((-0.55, 0.2, h + 0.03), 0.08, 0.02, mat("#e5484d", 0.4), verts=14)
    cyl((-0.55, 0.2, h + 0.2), 0.012, 0.34, mat("#3a3f55", 0.4, 0.6), verts=6, rot=(0.2, 0, 0))
    cone((-0.55, 0.14, h + 0.38), 0.1, 0.12, mat("#e5484d", 0.4), verts=14, rot=(math.pi + 0.5, 0, 0))
    cyl((-0.4, -0.15, h + 0.06), 0.04, 0.1, mat("#2e86c1", 0.5), verts=10)
    for k, c in enumerate(["#ffd24d", "#e5484d", "#3fb070"]):
        cyl((-0.41 + k * 0.012, -0.15, h + 0.15), 0.006, 0.14, mat(c, 0.5), verts=5, rot=(0.1 * (k - 1), 0.1, 0))
    # židle
    cx, cy = 0.0, -0.75
    cyl((cx, cy, 0.04), 0.03, 0.06, mat("#2a2a32", 0.5), verts=6)
    for k in range(5):
        a = k * TAU / 5
        box((cx + math.cos(a) * 0.15, cy + math.sin(a) * 0.15, 0.06), (0.3, 0.04, 0.03), mat("#2a2a32", 0.5), 0.01, rot=(0, 0, a))
        sphere((cx + math.cos(a) * 0.29, cy + math.sin(a) * 0.29, 0.03), 0.03, mat("#2a2a32", 0.5), seg=8)
    cyl((cx, cy, 0.25), 0.025, 0.38, mat("#8a92a8", 0.3, 0.8), verts=8)
    box((cx, cy, 0.47), (0.46, 0.44, 0.08), mat("#2e86c1", 0.8), 0.04)
    box((cx, cy - 0.22, 0.78), (0.44, 0.07, 0.5), mat("#2e86c1", 0.8), 0.05)


def build_bookshelf():
    w, d, h = 1.0, 0.35, 2.0
    wood = mat("#a8743e", 0.7)
    for x in (-w / 2, w / 2):
        box((x, 0, h / 2), (0.04, d, h), wood, 0.01)
    box((0, d / 2 - 0.01, h / 2), (w, 0.02, h), mat("#6a4426", 0.8), 0)
    rnd = random.Random(8)
    for k in range(5):
        z = 0.06 + k * 0.48
        box((0, 0, z), (w, d, 0.03), wood, 0.005)
        if k == 4:
            continue
        x = -w / 2 + 0.04
        while x < w / 2 - 0.08:
            bw = rnd.uniform(0.04, 0.08)
            bh = rnd.uniform(0.26, 0.4)
            if rnd.random() < 0.1 and x > -0.2:
                # kytička nebo fotka místo knih
                cyl((x + 0.08, 0, z + 0.07), 0.05, 0.1, mat("#c8743a", 0.8), verts=10)
                sphere((x + 0.08, 0, z + 0.17), 0.07, mat("#3f9a4a", 0.8), seg=10)
                x += 0.18
                continue
            box((x + bw / 2, 0.01, z + 0.02 + bh / 2), (bw, d * 0.78, bh), mat(rnd.choice(["#e5484d", "#2e86c1", "#ffd24d", "#3fb070", "#8e44ad", "#ff9f43", "#16a085"]), 0.6), 0.004)
            x += bw + 0.005
    box((0, 0, h + 0.02), (w + 0.06, d + 0.04, 0.04), wood, 0.01)


def build_sofa():
    w, d = 2.0, 0.9
    fab = mat("#2ea89a", 0.9)
    fab2 = mat("#3fc0b0", 0.9)
    box((0, 0, 0.25), (w, d, 0.3), fab, 0.06)
    for s in (-1, 1):
        box((s * (w / 2 - 0.1), 0, 0.42), (0.2, d, 0.55), fab, 0.04)
        box((s * 0.45, -0.05, 0.47), (0.88, d - 0.25, 0.16), fab2, 0.06)
        box((s * 0.45, d / 2 - 0.15, 0.75), (0.88, 0.22, 0.5), fab2, 0.08, rot=(math.radians(-10), 0, 0))
    for x in (-w / 2 + 0.1, w / 2 - 0.1):
        for y in (-d / 2 + 0.1, d / 2 - 0.1):
            cyl((x, y, 0.05), 0.03, 0.1, mat("#5a3a20", 0.6), verts=8, r2=0.02)
    box((-0.6, d / 2 - 0.3, 0.7), (0.32, 0.12, 0.32), mat("#ffd24d", 0.9), 0.06, rot=(math.radians(-15), 0, 0.3))
    box((0.65, d / 2 - 0.3, 0.68), (0.3, 0.12, 0.3), mat("#e5484d", 0.9), 0.06, rot=(math.radians(-15), 0, -0.2))
    # deka přehozená přes opěrku
    box((w / 2 - 0.1, -0.1, 0.71), (0.24, 0.6, 0.03), mat("#f4ead8", 0.9), 0.01)
    box((w / 2 + 0.015, -0.1, 0.5), (0.03, 0.6, 0.4), mat("#f4ead8", 0.9), 0.01)


def build_globe():
    wood = mat("#8a5a34", 0.6)
    for k in range(3):
        a = k * TAU / 3
        cyl((math.cos(a) * 0.16, math.sin(a) * 0.16, 0.3), 0.02, 0.62, wood, verts=6, rot=(math.sin(a) * 0.35, -math.cos(a) * 0.35, 0))
    cyl((0, 0, 0.6), 0.1, 0.04, wood, verts=12)
    cyl((0, 0, 0.66), 0.02, 0.1, mat("#c8a050", 0.3, 0.8), verts=8)
    sphere((0, 0, 0.95), 0.26, mat("#3a8ad8", 0.4), seg=24)
    rnd = random.Random(4)
    for k in range(14):
        a, b = rnd.uniform(0, TAU), rnd.uniform(-0.9, 0.9)
        x, y, z = math.cos(a) * math.cos(b), math.sin(a) * math.cos(b), math.sin(b)
        sphere((x * 0.255, y * 0.255, 0.95 + z * 0.255), rnd.uniform(0.05, 0.1), mat("#5ab85e", 0.6), seg=8, scale=(1, 1, 0.35))
    torus((0, 0, 0.95), 0.3, 0.012, mat("#c8a050", 0.3, 0.8), rot=(math.pi / 2, 0.4, 0))


def build_guitar():
    body = mat("#e5a03a", 0.4)
    cyl((0, 0, 0.42), 0.21, 0.1, body, verts=24, rot=(math.pi / 2, 0, 0))
    cyl((0, 0, 0.7), 0.16, 0.1, body, verts=24, rot=(math.pi / 2, 0, 0))
    torus((0, 0, 0.42), 0.21, 0.01, mat("#5a3a20", 0.5), rot=(math.pi / 2, 0, 0))
    cyl((0, -0.051, 0.6), 0.06, 0.01, mat("#2a1a10", 0.6), verts=16, rot=(math.pi / 2, 0, 0))
    box((0, -0.05, 0.4), (0.18, 0.02, 0.03), mat("#5a3a20", 0.6), 0.005)
    box((0, -0.02, 1.08), (0.06, 0.03, 0.62), mat("#6a4426", 0.6), 0.008)
    box((0, -0.02, 1.45), (0.09, 0.03, 0.16), mat("#5a3a20", 0.6), 0.01)
    for k in range(6):
        x = -0.025 + k * 0.01
        cyl((x, -0.056, 0.92), 0.0015, 1.0, mat("#d8d8e0", 0.2, 0.9), verts=4)
    for s in (-1, 1):
        for k in range(3):
            cyl((s * 0.055, -0.02, 1.4 + k * 0.05), 0.008, 0.03, mat("#e8e8f0", 0.3, 0.8), verts=6, rot=(0, math.pi / 2, 0))
    # stojan
    m = mat("#2a2a32", 0.5)
    for s in (-1, 1):
        box((s * 0.15, 0.1, 0.14), (0.03, 0.03, 0.32), m, 0.005, rot=(0.4, s * -0.3, 0))
    box((0, -0.06, 0.25), (0.34, 0.04, 0.03), m, 0.005)


def build_aquarium():
    w, d = 1.2, 0.5
    wood = mat("#6a4426", 0.6)
    box((0, 0, 0.35), (w, d, 0.7), wood, 0.02)
    for s in (-1, 1):
        box((s * w / 4, -d / 2 - 0.005, 0.35), (w / 2 - 0.04, 0.01, 0.6), mat("#7a5232", 0.6), 0.005)
        sphere((s * 0.06, -d / 2 - 0.02, 0.4), 0.02, mat("#ffd24d", 0.3, 0.7), seg=8)
    th = 0.55
    box((0, 0, 0.71 + th / 2), (w - 0.04, d - 0.04, th), mat("#cfefff", 0.05, alpha=0.25), 0)
    box((0, 0, 0.7 + th * 0.42), (w - 0.08, d - 0.08, th * 0.82), mat("#4ab0f0", 0.1, alpha=0.4), 0)
    box((0, 0, 0.73), (w - 0.08, d - 0.08, 0.04), mat("#e8d4a0", 0.9), 0)
    rnd = random.Random(2)
    for k in range(10):
        sphere((rnd.uniform(-0.5, 0.5), rnd.uniform(-0.15, 0.15), 0.76), 0.025, mat(rnd.choice(["#ff9f43", "#ffffff", "#c8b480"]), 0.8), seg=6)
    for k in range(6):
        x = -0.45 + k * 0.18
        cone((x, 0.1, 0.9), 0.04, 0.32, mat("#3fa04a", 0.7), verts=5)
    for (x, z, c) in [(-0.2, 1.0, "#ff8a3d"), (0.25, 0.92, "#ffd24d"), (0.05, 1.1, "#e5484d")]:
        sphere((x, -0.05, z), 0.04, mat(c, 0.4), seg=10, scale=(1.4, 0.6, 0.9))
        cone((x - 0.07, -0.05, z), 0.03, 0.05, mat(c, 0.4), verts=4, rot=(0, math.pi / 2, 0))
    box((0, 0, 0.71 + th + 0.02), (w, d, 0.04), mat("#2a2f45", 0.4, 0.5), 0.01)
    box((0, -0.1, 0.71 + th - 0.005), (w - 0.2, 0.06, 0.01), glow("#dff8ff", 1.5), 0)
    for k in range(5):
        sphere((0.45, 0.1, 0.8 + k * 0.08), 0.012 + k * 0.003, mat("#dff8ff", 0.05, alpha=0.5), seg=6)


def build_telescope():
    m = mat("#3a3f55", 0.4, 0.6)
    for k in range(3):
        a = k * TAU / 3
        cyl((math.cos(a) * 0.2, math.sin(a) * 0.2, 0.5), 0.015, 1.05, m, verts=6, rot=(math.sin(a) * 0.38, -math.cos(a) * 0.38, 0))
    sphere((0, 0, 1.0), 0.05, m, seg=10)
    tube = mat(WHITE, 0.3, 0.2)
    cyl((0.0, 0.15, 1.15), 0.08, 0.9, tube, verts=20, rot=(math.radians(-55), 0, 0))
    torus((0.0, 0.52, 1.41), 0.085, 0.015, mat("#e5484d", 0.4), rot=(math.radians(35), 0, 0))
    cyl((0.0, -0.22, 0.89), 0.03, 0.1, m, verts=10, rot=(math.radians(-55), 0, 0))
    cyl((0.07, 0.15, 1.24), 0.02, 0.3, m, verts=8, rot=(math.radians(-55), 0, 0))


def build_trophy():
    w, d, h = 1.0, 0.4, 1.8
    wood = mat("#6a4426", 0.6)
    # dutá skříň: boky, záda, dno a strop, ať jsou poháry vidět
    for x in (-w / 2 + 0.02, w / 2 - 0.02):
        box((x, 0, h / 2), (0.04, d, h), wood, 0.01)
    box((0, d / 2 - 0.02, h / 2), (w, 0.04, h), mat("#3a2a1a", 0.8), 0)
    box((0, 0, 0.05), (w, d, 0.1), wood, 0.01)
    for k in range(4):
        box((0, 0, 0.15 + k * 0.42), (w - 0.08, d - 0.06, 0.02), mat("#f4ead8", 0.4), 0)
    cups = [("#ffc933", 0.18), ("#c8ccd4", 0.15), ("#d8955a", 0.13)]
    for k in range(3):
        z0 = 0.16 + k * 0.42
        for j, (c, s) in enumerate(cups):
            x = -0.3 + j * 0.3
            cm = mat(c, 0.2, 0.9)
            box((x, 0, z0 + 0.02), (0.1, 0.1, 0.04), mat("#2a2a32", 0.5), 0.005)
            cyl((x, 0, z0 + 0.07), 0.015, 0.08, cm, verts=8)
            cyl((x, 0, z0 + 0.11 + s / 2), s * 0.45, s, cm, verts=16, r2=s * 0.25)
            for sx in (-1, 1):
                torus((x + sx * s * 0.45, 0, z0 + 0.11 + s * 0.6), s * 0.18, 0.01, cm, rot=(math.pi / 2, 0, 0))
    for j in range(3):
        cyl((-0.3 + j * 0.3, -0.05, 1.47 + 0.08), 0.05, 0.01, mat(["#ffc933", "#c8ccd4", "#d8955a"][j], 0.2, 0.9), verts=16, rot=(math.pi / 2, 0, 0))
        box((-0.3 + j * 0.3, -0.05, 1.47 + 0.18), (0.04, 0.005, 0.16), mat(["#e5484d", "#2e86c1", "#3fb070"][j], 0.6), 0)
    box((0, -d / 2 - 0.005, h / 2), (w - 0.1, 0.01, h - 0.2), mat("#dff4ff", 0.05, alpha=0.2), 0)
    box((0, 0, h + 0.03), (w + 0.06, d + 0.04, 0.06), wood, 0.01)


def build_arcade():
    w, d, h = 0.8, 0.8, 1.8
    side = mat("#5a3aa8", 0.5)
    for s in (-1, 1):
        box((s * w / 2, 0, h / 2), (0.05, d, h), side, 0.01)
        box((s * (w / 2 + 0.026), 0, h * 0.6), (0.005, d * 0.8, h * 0.4), mat("#ff5d9a", 0.5), 0)
    box((0, d / 2 - 0.03, h / 2), (w, 0.05, h), mat("#2a1a5a", 0.6), 0)
    box((0, -d / 2 + 0.2, 0.45), (w - 0.05, 0.05, 0.9), mat("#2a1a5a", 0.6), 0)
    box((0, -0.12, 0.98), (w - 0.05, 0.5, 0.06), mat("#ffd24d", 0.4), 0.01, rot=(math.radians(-12), 0, 0))
    cyl((-0.18, -0.2, 1.06), 0.012, 0.1, mat("#2a2a2a", 0.4), verts=6)
    sphere((-0.18, -0.2, 1.12), 0.035, mat("#e5484d", 0.3), seg=10)
    for k, c in enumerate(["#e5484d", "#2e86c1", "#3fb070", "#ffd24d"]):
        cyl((0.02 + (k % 2) * 0.09, -0.24 + (k // 2) * 0.09, 1.02), 0.025, 0.02, mat(c, 0.3), verts=12)
    box((0, 0.05, 1.35), (w - 0.06, 0.04, 0.5), mat("#1a1d2a", 0.3), 0.01, rot=(math.radians(-15), 0, 0))
    box((0, 0.025, 1.35), (w - 0.16, 0.01, 0.4), glow("#7ee0b0", 1.2), 0, rot=(math.radians(-15), 0, 0))
    box((0, 0.1, 1.72), (w, 0.2, 0.18), glow("#ff5d9a", 1.5), 0.01)
    box((0, -0.35, 0.55), (0.12, 0.01, 0.06), mat("#ffd24d", 0.3, 0.7), 0.003)


def build_piano():
    w, d, h = 1.5, 0.6, 1.2
    black = mat("#1a1a22", 0.15, 0.1)
    box((0, 0.1, h / 2), (w, d - 0.2, h), black, 0.02)
    box((0, -0.12, 0.72), (w, 0.3, 0.06), black, 0.01)
    for s in (-1, 1):
        box((s * (w / 2 - 0.03), -0.15, 0.36), (0.06, 0.06, 0.72), black, 0.01)
    for k in range(36):
        box((-w / 2 + 0.09 + k * 0.037, -0.2, 0.77), (0.034, 0.14, 0.02), mat(WHITE, 0.3), 0.002)
    for k in range(36):
        if k % 7 in (2, 6):
            continue
        box((-w / 2 + 0.108 + k * 0.037, -0.17, 0.79), (0.02, 0.08, 0.025), black, 0.002)
    box((0, -0.03, 0.98), (0.4, 0.02, 0.26), mat(WHITE, 0.6), 0, rot=(math.radians(-10), 0, 0))
    for k in range(5):
        box((0, -0.045, 0.9 + k * 0.04), (0.32, 0.005, 0.005), mat("#2a2a32", 0.6), 0, rot=(math.radians(-10), 0, 0))
    # stolička a svícen
    box((0, -0.55, 0.48), (0.6, 0.32, 0.06), black, 0.02)
    box((0, -0.55, 0.52), (0.56, 0.28, 0.04), mat("#8e2a3a", 0.8), 0.015)
    for x in (-0.26, 0.26):
        for y in (-0.68, -0.42):
            box((x, y, 0.23), (0.04, 0.04, 0.46), black, 0.005)
    cyl((0.55, 0.15, h + 0.02), 0.05, 0.03, mat("#c8a050", 0.3, 0.8), verts=10)
    cyl((0.55, 0.15, h + 0.1), 0.02, 0.14, mat(WHITE, 0.6), verts=8)
    sphere((0.55, 0.15, h + 0.19), 0.02, glow("#ffc46b", 3.0), seg=8, scale=(1, 1, 1.6))


def build_plant():
    pot = mat("#e8e0d4", 0.5)
    cyl((0, 0, 0.22), 0.22, 0.44, pot, verts=20, r2=0.17)
    torus((0, 0, 0.44), 0.22, 0.02, pot, seg=24)
    cyl((0, 0, 0.43), 0.2, 0.02, mat("#5a3a20", 1.0), verts=20)
    rnd = random.Random(6)
    leaf = [mat("#2f8a42", 0.6), mat("#3fa04a", 0.6), mat("#4eb058", 0.6)]
    for k in range(9):
        a = k * TAU / 9 + rnd.uniform(-0.2, 0.2)
        length = rnd.uniform(0.5, 0.9)
        tilt = rnd.uniform(0.3, 0.7)
        ex = math.cos(a) * math.sin(tilt) * length
        ey = math.sin(a) * math.sin(tilt) * length
        ez = 0.44 + math.cos(tilt) * length
        cyl((ex / 2, ey / 2, 0.44 + (ez - 0.44) / 2), 0.008, length, mat("#3a7a3a", 0.7), verts=5, rot=(-math.sin(a) * tilt, math.cos(a) * tilt, 0))
        lf = sphere((ex, ey, ez), 0.16, leaf[k % 3], seg=12, scale=(1.4, 0.9, 0.18))
        lf.rotation_euler = (math.cos(a) * 0.6, math.sin(a) * -0.6 + 0.3, a)


BUILDERS = {
    "mistnost": build_mistnost,
    "koberec": build_rug,
    "lampa": build_lampa,
    "rocketbed": build_rocketbed,
    "desk": build_desk,
    "bookshelf": build_bookshelf,
    "sofa": build_sofa,
    "globe": build_globe,
    "guitar": build_guitar,
    "aquarium": build_aquarium,
    "telescope": build_telescope,
    "trophy": build_trophy,
    "arcade": build_arcade,
    "piano": build_piano,
    "plant": build_plant,
}

if __name__ == "__main__":
    names, preview = args()
    if names == ["all"]:
        names = list(BUILDERS)
    for n in names:
        reset()
        BUILDERS[n]()
        finish_and_export(n, preview)
