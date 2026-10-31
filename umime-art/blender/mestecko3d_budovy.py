"""Detailní budovy živého 3D městečka → public/mestecko3d/<jméno>.glb

    python umime-art/blender/mestecko3d_budovy.py -- all [--preview]
    python umime-art/blender/mestecko3d_budovy.py -- skola herna --preview

Rozměry odpovídají rozložení v src/lib/town3d/layout.ts (půdorys v metrech, dveře k -Y).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from mestecko3d_lib import *  # noqa: E402,F401,F403

WHITE = "#fffaf0"


def cottage(w, d, h, wall, roof, accent="#5a3a20", shutters=None, wins=2, floors=1, chim=True, door_color="#8a5a34", flowers=True, roof_h=None):
    """Domek: podezdívka, zdi s rohovými lištami, sedlová střecha s taškami, okna, dveře, komín."""
    foundation(w, d)
    z0 = 0.35
    wm = mat(wall, 0.85)
    box((0, 0, z0 + h / 2), (w, d, h), wm, 0.03)
    corner_posts(w, d, z0, h, WHITE)
    trim(w, d, z0 + h, WHITE)
    if floors > 1:
        trim(w, d, z0 + h / 2, WHITE, 0.08)
    rh = roof_h or d * 0.45
    gable_wall(0, 0, z0 + h, w, d, rh, wm, along="x")
    rm = mat(roof, 0.7)
    prism_roof(0, 0, z0 + h, w, d, rh, rm, over=0.35, along="x")
    tiles(0, 0, z0 + h, w, d, rh, mat(roof, 0.6), over=0.35, rows=6, along="x")
    # okna v každém patře
    fh = h / floors
    for f in range(floors):
        zc = z0 + fh * f + fh * 0.58
        xs = [-w * 0.3, w * 0.3] if wins == 2 else [-w * 0.33, 0, w * 0.33]
        for x in xs:
            if f == 0 and abs(x) < 0.6:
                continue
            window(x, -d / 2, zc, 0.7, 0.8, shutters=shutters, box_flowers=flowers and f == 0)
        window(-w / 2, 0, zc, 0.7, 0.8, face="-x", shutters=shutters, box_flowers=flowers and f == 0)
        window(w / 2, 0, zc, 0.7, 0.8, face="+x", shutters=shutters, box_flowers=flowers and f == 0)
        for x in (-w * 0.3, w * 0.3):
            window(x, d / 2, zc, 0.7, 0.8, face="+y", shutters=shutters, box_flowers=flowers and f == 0)
    # kamenný sokl a dřevěné obložení pod okny
    stone = mat("#a8a094", 0.9)
    rnd = random.Random(int(w * 100 + d * 10))
    for side in (-1, 1):
        for k in range(int(w / 0.55)):
            box((-w / 2 + 0.3 + k * 0.55, side * (d / 2 + 0.03), z0 + 0.14 + rnd.uniform(-0.02, 0.02)), (0.48, 0.06, 0.24), stone, 0.02)
        for k in range(int(d / 0.55)):
            box((side * (w / 2 + 0.03), -d / 2 + 0.3 + k * 0.55, z0 + 0.14 + rnd.uniform(-0.02, 0.02)), (0.06, 0.48, 0.24), stone, 0.02)
    # střešní okénko na zadní straně
    ang = math.atan2(rh, d / 2 + 0.35)
    sy = d * 0.22
    sz = z0 + h + rh * (1 - sy / (d / 2 + 0.35)) + 0.16
    box((-w * 0.2, sy, sz), (0.8, 0.7, 0.1), mat(WHITE, 0.5), 0.01, rot=(ang, 0, 0))
    box((-w * 0.2, sy + 0.02, sz + 0.05), (0.62, 0.52, 0.04), glow("#ffd98a", 0.6), 0, rot=(ang, 0, 0))
    # zadní dvířka
    door(w * 0.05, d / 2, z0, 0.75, 1.5, color=door_color, face="+y")
    door(0, -d / 2, z0, 0.9, 1.7, color=door_color)
    # stříška nad dveřmi
    box((0, -d / 2 - 0.35, z0 + 2.05), (1.5, 0.75, 0.08), mat(roof, 0.7), 0.02, rot=(math.radians(-14), 0, 0))
    for s in (-1, 1):
        box((s * 0.65, -d / 2 - 0.62, z0 + 1.6), (0.07, 0.07, 0.9), mat(accent, 0.6), 0.01)
    if chim:
        chimney(w * 0.28, d * 0.12, z0 + h + rh * 0.55, 1.0)
    return z0 + h + rh


def build_domek(variant):
    wall, roof, shut = [
        ("#fff0d0", "#c0392b", "#2e86c1"),
        ("#ffe0b0", "#2e86c1", "#c0392b"),
        ("#f4d8c0", "#8e44ad", "#3f9a4a"),
        ("#e8f4ff", "#16a085", "#d35400"),
        ("#ffffff", "#d35400", "#2e5aa8"),
        ("#fff0f4", "#2e5aa8", "#e5484d"),
    ][variant]
    cottage(4.8, 4.0, 2.9, wall, roof, shutters=shut)
    # poštovní schránka a zahrádka
    box((1.6, -3.3, 0.5), (0.1, 0.1, 1.0), mat("#5a4a3a", 0.7), 0.01)
    box((1.6, -3.3, 1.05), (0.5, 0.36, 0.36), mat("#e5484d", 0.5), 0.04)
    box((1.6, -3.49, 1.05), (0.3, 0.02, 0.06), mat("#16132b", 0.5), 0)
    box((1.88, -3.3, 1.2), (0.03, 0.03, 0.35), mat("#ffd24d", 0.5), 0)
    fence(-2.6, -2.4, -2.6, 2.4)
    fence(2.6, -2.4, 2.6, 2.4)
    bush(-1.9, -2.6, 0.7, "#4ea844")
    flowers_bed(1.0 if variant % 2 else -1.0, 2.6, 2.2, 0.6, 10, variant)
    # dvorek: sud na dešťovku a hranice dřeva (na straně bez záhonu)
    o = -1 if variant % 2 else 1
    cyl((o * 2.1, 2.4, 0.45), 0.3, 0.9, mat("#8a5a34", 0.75), verts=14)
    for z in (0.15, 0.75):
        torus((o * 2.1, 2.4, z), 0.31, 0.025, mat("#4a4a52", 0.4, 0.6), seg=16)
    cyl((o * 2.1, 2.4, 0.91), 0.26, 0.02, mat("#5ab8e8", 0.2), verts=14)
    for i in range(3):
        for j in range(4 - i):
            cyl((o * 1.3 + (j - (3 - i) / 2) * 0.24, 2.75, 0.12 + i * 0.21), 0.11, 0.8, mat("#a8744a" if (i + j) % 2 else "#94643c", 0.85), verts=8, rot=(math.pi / 2, 0, 0))


def build_skola():
    w, d, h = 15, 8, 5.5
    foundation(w, d, 0.5)
    z0 = 0.5
    wm = mat("#f4e3c0", 0.85)
    box((0, 0, z0 + h / 2), (w, d, h), wm, 0.04)
    corner_posts(w, d, z0, h, WHITE)
    trim(w, d, z0 + h, WHITE, 0.18)
    trim(w, d, z0 + h / 2, WHITE, 0.08)
    gable_wall(0, 0, z0 + h, w, d, 2.6, wm)
    prism_roof(0, 0, z0 + h, w, d, 2.6, mat("#b84a3a", 0.7), over=0.4)
    tiles(0, 0, z0 + h, w, d, 2.6, mat("#a8403a", 0.6), over=0.4, rows=8)
    for x in (-5.6, -3.4, 3.4, 5.6):
        window(x, -d / 2, z0 + 1.5, 1.2, 1.4, shutters="#2e5aa8", box_flowers=True)
        window(x, -d / 2, z0 + 4.2, 1.2, 1.3, arch=True)
        window(x, d / 2, z0 + 1.5, 1.2, 1.4, face="+y")
        window(x, d / 2, z0 + 4.2, 1.2, 1.3, face="+y")
    for y in (-2, 2):
        window(-w / 2, y, z0 + 2.8, 1.0, 1.2, face="-x")
        window(w / 2, y, z0 + 2.8, 1.0, 1.2, face="+x")
    # věž s hodinami
    tw, th = 4.2, 10.5
    box((0, -1.0, z0 + th / 2), (tw, tw, th), mat("#f0d8b0", 0.85), 0.04)
    trim(tw, tw, z0 + th, WHITE, 0.2) if False else box((0, -1.0, z0 + th), (tw + 0.3, tw + 0.3, 0.25), mat(WHITE, 0.5), 0.03)
    box((0, -1.0, z0 + 6.2), (tw + 0.15, tw + 0.15, 0.12), mat(WHITE, 0.5), 0.02)
    cone((0, -1.0, z0 + th + 1.9), tw * 0.82, 3.6, mat("#b84a3a", 0.6), verts=4, rot=(0, 0, math.pi / 4))
    cyl((0, -1.0, z0 + th + 4.0), 0.06, 1.2, mat("#ffd24d", 0.3, 0.8), verts=6)
    sphere((0, -1.0, z0 + th + 4.6), 0.18, mat("#ffd24d", 0.3, 0.8), seg=10)
    # ciferník
    fy = -1.0 - tw / 2 - 0.05
    cyl((0, fy, z0 + 8.2), 1.25, 0.12, mat(WHITE, 0.4), verts=32, rot=(math.pi / 2, 0, 0))
    torus((0, fy - 0.07, z0 + 8.2), 1.25, 0.08, mat("#ffd24d", 0.3, 0.7), rot=(math.pi / 2, 0, 0))
    for k in range(12):
        a = k * TAU / 12
        box((math.sin(a) * 1.0, fy - 0.08, z0 + 8.2 + math.cos(a) * 1.0), (0.08, 0.02, 0.2), mat("#16132b", 0.5), 0, rot=(0, -a, 0))
    box((0, fy - 0.1, z0 + 8.45), (0.08, 0.02, 0.55), mat("#16132b", 0.5), 0)
    box((0.3, fy - 0.11, z0 + 8.2), (0.6, 0.02, 0.07), mat("#16132b", 0.5), 0)
    window(0, -1.0 - tw / 2, z0 + 5.0, 1.0, 1.2, arch=True)
    # zvonice
    for sx in (-1, 1):
        for sy in (-1, 1):
            box((sx * 1.6, -1.0 + sy * 1.6, z0 + th - 1.1), (0.3, 0.3, 1.8), mat(WHITE, 0.5), 0.02)
    cone((0, -1.0, z0 + th - 1.0), 0.5, 0.8, mat("#ffd24d", 0.3, 0.8), verts=12, rot=(math.pi, 0, 0))
    # vchod se sloupy a schody
    door(0, -1.0 - tw / 2, z0, 1.8, 2.6, color="#5a3a20", steps=3)
    for x in (-1.6, 1.6):
        cyl((x, -1.0 - tw / 2 - 0.7, z0 + 1.5), 0.18, 3.0, mat(WHITE, 0.5), verts=12)
    box((0, -1.0 - tw / 2 - 0.7, z0 + 3.1), (4.0, 1.6, 0.25), mat(WHITE, 0.5), 0.03)
    # vývěsní štít s knihou
    def book(x, y, z):
        box((x - 0.35, y, z), (0.6, 0.04, 0.45), mat("#e5484d", 0.5), 0.01)
        box((x + 0.35, y, z), (0.6, 0.04, 0.45), mat("#3fc1ff", 0.5), 0.01)
    sign_board(0, -1.0 - tw / 2 - 1.55, z0 + 3.6, 2.6, 0.7, icon=book)
    # stožár s vlajkou, lavičky, keře
    cyl((6.8, -5.2, 3.5), 0.06, 7.0, mat("#c8c8d0", 0.3, 0.8), verts=8)
    box((7.5, -5.2, 6.4), (1.4, 0.04, 0.9), mat("#ffd24d", 0.6), 0.01)
    for x in (-5.5, 5.5):
        bush(x, -4.8, 0.8)
    flowers_bed(-4, -5.0, 3.0, 0.7, 14, 1)
    flowers_bed(4, -5.0, 3.0, 0.7, 14, 2)


def build_knihovna():
    w, d, h = 9, 6.4, 4.6
    box((0, 0, 0.3), (w + 0.6, d + 0.6, 0.6), mat("#cfc8b8", 0.9), 0.04)
    for k in range(3):
        box((0, -d / 2 - 0.5 - k * 0.3, 0.1 + 0.1 * (2 - k)), (5.6 + 0.4 * k, 0.4, 0.2 + 0.2 * (2 - k)), mat("#d8d0c0", 0.9), 0.02)
    z0 = 0.6
    wm = mat("#e8d0b0", 0.85)
    box((0, 0.3, z0 + h / 2), (w, d - 0.6, h), wm, 0.03)
    # sloupoví a tympanon
    for x in (-3.3, -1.1, 1.1, 3.3):
        cyl((x, -d / 2 + 0.2, z0 + h / 2), 0.3, h, mat(WHITE, 0.5), verts=16)
        box((x, -d / 2 + 0.2, z0 + 0.12), (0.8, 0.8, 0.24), mat(WHITE, 0.5), 0.02)
        box((x, -d / 2 + 0.2, z0 + h - 0.12), (0.8, 0.8, 0.24), mat(WHITE, 0.5), 0.02)
    box((0, 0, z0 + h + 0.2), (w + 0.4, d + 0.4, 0.4), mat(WHITE, 0.5), 0.03)
    gable_wall(0, 0, z0 + h + 0.4, w, d, 2.2, mat(WHITE, 0.5), along="y")
    prism_roof(0, 0, z0 + h + 0.4, w, d, 2.2, mat("#8a3a3a", 0.7), over=0.3, along="y")
    mesh([(-w / 2 + 0.5, -d / 2 - 0.25, z0 + h + 0.45), (w / 2 - 0.5, -d / 2 - 0.25, z0 + h + 0.45), (0, -d / 2 - 0.25, z0 + h + 2.2)], [(0, 1, 2)], mat("#f4ead8", 0.5), "tympanon")
    # kniha v tympanonu
    box((-0.35, -d / 2 - 0.3, z0 + h + 1.05), (0.6, 0.04, 0.5), mat("#e5484d", 0.5), 0.01)
    box((0.35, -d / 2 - 0.3, z0 + h + 1.05), (0.6, 0.04, 0.5), mat("#ffd24d", 0.5), 0.01)
    door(0, -d / 2 + 0.6, z0, 1.4, 2.6, color="#5a3a20", steps=0)
    for x in (-2.6, 2.6):
        window(x, -d / 2 + 0.6, z0 + 2.2, 1.1, 1.6, arch=True)
    for y in (-1, 1.5):
        window(-w / 2, y, z0 + 2.4, 1.0, 1.6, face="-x")
        window(w / 2, y, z0 + 2.4, 1.0, 1.6, face="+x")
    for x in (-3, 0, 3):
        window(x, d / 2, z0 + 2.4, 1.0, 1.6, face="+y")
    # lampy u schodů a hromádka knih
    for x in (-3.0, 3.0):
        lamp_post(x, -d / 2 - 1.6, 2.0)
    for k, c in enumerate(["#3fc1ff", "#ff5d73", "#7ee0b0"]):
        box((-4.1, -d / 2 - 0.9, 0.08 + k * 0.14), (0.7, 0.5, 0.13), mat(c, 0.5), 0.01, rot=(0, 0, k * 0.2))


def build_hvezdarna():
    r, h = 3.0, 4.0
    cyl((0, 0, 0.2), r + 0.3, 0.4, mat("#b8b0a8", 0.9), verts=24)
    cyl((0, 0, 0.4 + h / 2), r, h, mat("#e8e8f0", 0.8), verts=24, bevel=0.0)
    for z in (0.4 + h * 0.5, 0.4 + h):
        torus((0, 0, z), r + 0.02, 0.08, mat(WHITE, 0.5), seg=32)
    dm = mat("#5a7ad8", 0.4, 0.3)
    dome((0, 0, 0.4 + h), r, dm, seg=32)
    # štěrbina a dalekohled
    box((0, 0, 0.4 + h + r * 0.55), (0.7, r * 2.02, r * 1.1), mat("#2a3060", 0.6), 0, rot=(math.radians(-25), 0, 0))
    cyl((0, -1.4, 0.4 + h + 1.9), 0.35, 3.0, mat("#3a3f55", 0.4, 0.6), verts=12, rot=(math.radians(55), 0, 0), r2=0.5)
    for k in range(10):
        a = k * TAU / 10
        sphere((math.cos(a) * r * 0.8, math.sin(a) * r * 0.8, 0.4 + h + math.sqrt(max(0.0, r * r - (r * 0.8) ** 2)) * 0.6), 0.08, glow("#fff6a0", 1.5), seg=6)
    door(0, -r + 0.05, 0.4, 1.1, 2.1, color="#2a3060")
    for a in (-0.9, 0.9, 2.2, -2.2):
        window(math.sin(a) * r, -math.cos(a) * r, 0.4 + 2.8, 0.5, 0.6, face="-y") if abs(a) < 1 else None
    # hvězdy na plotě a cedule
    def planet(x, y, z):
        sphere((x, y, z), 0.24, mat("#ffb020", 0.5), seg=12)
        torus((x, y, z), 0.36, 0.04, mat("#ffffff", 0.5), rot=(1.2, 0, 0.3))
    sign_board(1.9, -r - 0.8, 1.5, 1.4, 0.6, board="#2a3060", face="#1a1f4a", icon=planet)
    cyl((1.9, -r - 0.8, 0.6), 0.05, 1.2, mat("#3a3f55", 0.4, 0.5), verts=6)


def build_herna():
    w, d, h = 9.6, 6.4, 5.0
    foundation(w, d, 0.3, "#3a2a7a")
    z0 = 0.3
    box((0, 0, z0 + h / 2), (w, d, h), mat("#6a5aff", 0.5), 0.05)
    for k in range(6):
        box((-w / 2 + 0.8 + k * 1.6, -d / 2 - 0.02, z0 + h / 2), (0.08, 0.04, h), mat("#8a7aff", 0.4), 0)
    box((0, 0, z0 + h + 0.4), (w + 0.4, d + 0.4, 0.8), mat("#3a2a9a", 0.5), 0.05)
    # neonový nápis s herní ovladačkou
    box((0, -d / 2 - 0.25, z0 + h - 0.6), (6.2, 0.3, 1.4), mat("#2a1a6a", 0.4), 0.05)
    box((0, -d / 2 - 0.42, z0 + h - 0.6), (5.8, 0.06, 1.0), glow("#ff6fd8", 2.0), 0.02)
    box((-1.4, -d / 2 - 0.47, z0 + h - 0.6), (1.2, 0.04, 0.6), glow("#6ff0ff", 2.0), 0.02)
    for x, c in [(1.2, "#ffd24d"), (1.8, "#7ee0b0")]:
        cyl((x, -d / 2 - 0.47, z0 + h - 0.6), 0.2, 0.06, glow(c, 2.0), verts=12, rot=(math.pi / 2, 0, 0))
    # výlohy a dveře
    for x in (-3.0, 3.0):
        window(x, -d / 2, z0 + 1.6, 2.2, 2.0, frame="#2a1a6a", glass="#6ff0ff")
    box((0, -d / 2 - 0.02, z0 + 1.3), (1.8, 0.06, 2.6), glow("#ff5d73", 0.8), 0.02)
    box((0, -d / 2 - 0.08, z0 + 1.3), (0.06, 0.04, 2.6), mat("#2a1a6a", 0.5), 0)
    # žárovky kolem štítu
    for k in range(14):
        sphere((-3.1 + k * 6.2 / 13, -d / 2 - 0.42, z0 + h + 0.15), 0.1, glow(["#ffd24d", "#ff6fd8", "#6ff0ff"][k % 3], 2.5), seg=6)
    # obří joystick na střeše
    cyl((2.8, 0.5, z0 + h + 1.1), 1.0, 0.6, mat("#16132b", 0.4), verts=20)
    cyl((2.8, 0.5, z0 + h + 2.2), 0.14, 1.8, mat("#16132b", 0.4), verts=10)
    sphere((2.8, 0.5, z0 + h + 3.2), 0.55, mat("#ff5d73", 0.25), seg=16)
    for (x, c) in [(-1.6, "#ffd24d"), (-0.6, "#3fc1ff")]:
        cyl((x, 0.8, z0 + h + 0.95), 0.4, 0.3, mat(c, 0.3), verts=16)
    for y in (-1.5, 1.5):
        window(-w / 2, y, z0 + 2.4, 1.2, 1.2, face="-x", glass="#6ff0ff")
        window(w / 2, y, z0 + 2.4, 1.2, 1.2, face="+x", glass="#6ff0ff")


def build_arena():
    R, h = 4.4, 2.8
    cyl((0, 0, 0.1), R + 0.4, 0.2, mat("#cfc8b8", 0.9), verts=40)
    cyl((0, 0, 0.25), R - 0.4, 0.12, mat("#6aa050", 0.9), verts=40)
    for k in range(4):
        cyl((0, 0, 0.32 + k * 0.01), R - 1.2 - k * 0.8, 0.02, mat(WHITE if k % 2 == 0 else "#6aa050", 0.9), verts=40)
    # tribuny jako stupně (kromě vchodu na -Y)
    for ring in range(4):
        rr = R - 0.3 + ring * 0.35
        for k in range(28):
            a = k * TAU / 28
            if math.sin(a) < -0.85:
                continue
            box((math.cos(a) * rr, math.sin(a) * rr, 0.3 + ring * 0.45), (1.1, 0.4, 0.45 + ring * 0.0), mat(["#e8dcc4", "#ff5d73", "#3fc1ff", "#ffd24d"][ring], 0.7), 0.02, rot=(0, 0, a + math.pi / 2))
    for k in range(12):
        a = k * TAU / 12
        if math.sin(a) < -0.85:
            continue
        cyl((math.cos(a) * (R + 1.1), math.sin(a) * (R + 1.1), 1.6), 0.12, 3.2, mat(WHITE, 0.5), verts=8)
        cone((math.cos(a) * (R + 1.1), math.sin(a) * (R + 1.1), 3.4), 0.3, 0.5, mat(["#ff5d73", "#3fc1ff", "#ffd24d"][k % 3], 0.5), verts=8)
    # brána
    for s in (-1, 1):
        box((s * 1.4, -R - 0.7, 1.6), (0.5, 0.5, 3.2), mat("#d8ccb4", 0.8), 0.03)
    box((0, -R - 0.7, 3.3), (3.6, 0.6, 0.5), mat("#d8ccb4", 0.8), 0.03)
    sign_board(0, -R - 1.05, 3.3, 2.0, 0.5, face="#ffd24d")
    # pohár na podstavci
    cyl((0, 0, 0.7), 0.7, 0.8, mat("#e8e0d0", 0.6), verts=16)
    gold = mat("#ffd24d", 0.25, 0.9)
    cyl((0, 0, 1.25), 0.35, 0.3, gold, verts=16)
    cyl((0, 0, 1.6), 0.08, 0.5, gold, verts=10)
    cyl((0, 0, 2.15), 0.2, 0.7, gold, verts=20, r2=0.55)
    for s in (-1, 1):
        torus((s * 0.6, 0, 2.2), 0.22, 0.05, gold, rot=(math.pi / 2, 0, 0))
    for s in (-1, 1):
        cyl((s * 3.0, R * 0.6, 3.6), 0.05, 2.0, mat("#5a4a3a", 0.6), verts=6)
        box((s * 3.0 + 0.5, R * 0.6, 4.3), (1.0, 0.04, 0.6), mat("#ff5d73" if s < 0 else "#3fc1ff", 0.6), 0.01)


def build_shop(kind):
    walls = {"kvetinarstvi": "#c8f0d8", "obchod": "#ffffff", "pekarna": "#ffd8a0", "pokoj": "#ffe0f0"}
    roofs = {"kvetinarstvi": "#3f9a5a", "obchod": "#ff5d73", "pekarna": "#c0582a", "pokoj": "#5a6cff"}
    w, d = 6, 4.8
    top = cottage(w, d, 3.6, walls[kind], roofs[kind], shutters=None if kind != "pokoj" else "#5a6cff", wins=2, chim=kind in ("pekarna", "pokoj"), flowers=kind != "obchod")
    # markýza a výloha
    if kind in ("obchod", "pekarna", "kvetinarstvi"):
        stripe = {"obchod": ("#ff5d73", WHITE), "pekarna": ("#ffd24d", "#c0582a"), "kvetinarstvi": ("#7ee0b0", WHITE)}[kind]
        for k in range(8):
            box((-w / 2 + 0.375 + k * 0.75, -d / 2 - 0.55, 0.35 + 2.75), (0.75, 1.2, 0.07), mat(stripe[k % 2], 0.6), 0.01, rot=(math.radians(-20), 0, 0))
        for k in range(8):
            cyl((-w / 2 + 0.375 + k * 0.75, -d / 2 - 1.12, 0.35 + 2.52), 0.14, 0.75, mat(stripe[k % 2], 0.6), verts=10, rot=(0, math.pi / 2, 0))
    if kind == "obchod":
        def bag(x, y, z):
            box((x, y, z - 0.05), (0.45, 0.06, 0.4), mat("#ff5d73", 0.5), 0.02)
            torus((x, y, z + 0.18), 0.12, 0.03, mat("#16132b", 0.5), rot=(math.pi / 2, 0, 0))
        sign_board(0, -d / 2 - 0.08, 0.35 + 3.3, 1.6, 0.5, icon=bag)
        for x, c in [(-2.3, "#ff8fd0"), (2.3, "#3fc1ff")]:
            box((x, -d / 2 - 0.9, 0.4), (0.7, 0.7, 0.8), mat("#8a5a34", 0.7), 0.03)
            sphere((x, -d / 2 - 0.9, 1.05), 0.3, mat(c, 0.4), seg=12)
    if kind == "pekarna":
        torus((0, -d / 2 - 0.2, 0.35 + 3.35), 0.35, 0.12, mat("#d89040", 0.6), rot=(math.pi / 2, 0, 0))
        cyl((0, -d / 2 - 0.2, 0.35 + 3.05), 0.02, 0.3, mat("#3a3f55", 0.4), verts=5)
        for k in range(3):
            sphere((-2.0 + k * 0.4, -d / 2 - 0.85, 0.95), 0.15, mat("#d89040", 0.6), seg=10, scale=(1.4, 0.8, 0.6))
        box((-1.6, -d / 2 - 0.85, 0.45), (1.6, 0.6, 0.9), mat("#8a5a34", 0.7), 0.03)
    if kind == "kvetinarstvi":
        for k in range(4):
            box((-2.3 + k * 1.5, -d / 2 - 0.85, 0.25), (1.1, 0.5, 0.5), mat("#8a5a34", 0.7), 0.03)
            for j in range(3):
                sphere((-2.6 + k * 1.5 + j * 0.3, -d / 2 - 0.85, 0.65), 0.16, mat(["#ff5d73", "#ffd24d", "#a87bff", "#ff9f43"][(k + j) % 4], 0.5), seg=8)
        # malý skleník na boku
        gl = mat("#bfefff", 0.1, alpha=0.5)
        box((w / 2 + 1.0, 0.5, 1.0), (1.8, 2.4, 2.0), gl, 0.02)
        prism_roof(w / 2 + 1.0, 0.5, 2.0, 1.8, 2.4, 0.7, gl, over=0.05, thick=0.05, along="y")
    if kind == "pokoj":
        def heart(x, y, z):
            sphere((x - 0.12, y, z + 0.06), 0.14, mat("#ff5d73", 0.5), seg=10)
            sphere((x + 0.12, y, z + 0.06), 0.14, mat("#ff5d73", 0.5), seg=10)
            cone((x, y, z - 0.12), 0.24, 0.28, mat("#ff5d73", 0.5), verts=4, rot=(math.pi, 0, math.pi / 4))
        sign_board(0, -d / 2 - 0.08, 0.35 + 3.15, 1.0, 0.6, face=WHITE, icon=heart)
        fence(-3.2, -3.6, -1.0, -3.6)
        fence(1.0, -3.6, 3.2, -3.6)
        bush(2.6, -3.0, 0.7, "#5cbf5a")


def build_strom():
    """Obří strom s domečkem pro Kouzelný les."""
    bark = mat("#7a4a2a", 0.9)
    for k in range(7):
        a = k * TAU / 7
        cyl((math.cos(a) * 1.9, math.sin(a) * 1.9, 0.4), 0.6, 1.2, bark, verts=8, rot=(math.cos(a) * 0.8, math.sin(a) * 0.8, 0))
    cyl((0, 0, 5), 2.4, 10, bark, verts=14, r2=1.7)
    for k in range(10):
        a = k * TAU / 10
        box((math.cos(a) * 2.2, math.sin(a) * 2.2, 5), (0.2, 0.2, 9.5), mat("#6a4026", 0.9), 0, rot=(0, 0, a))
    leaf = [mat("#3f9a5a", 0.8), mat("#4eaa60", 0.8), mat("#2f8a4a", 0.8)]
    rnd = random.Random(4)
    for (x, y, z, r) in [(0, 0, 12, 5.5), (-4, 1, 10, 3.8), (4, -1, 10.5, 4.2), (1, 3, 11, 3.6), (-1, -3, 11, 3.6), (0.5, 0, 15.5, 3.8)]:
        sphere((x, y, z), r, leaf[rnd.randrange(3)], seg=14)
        for _ in range(6):
            a, b = rnd.uniform(0, TAU), rnd.uniform(-0.6, 0.9)
            sphere((x + math.cos(a) * r * 0.85 * math.cos(b), y + math.sin(a) * r * 0.85 * math.cos(b), z + math.sin(b) * r * 0.85), r * 0.4, leaf[rnd.randrange(3)], seg=10)
    # kulaté dveře, okénka, schody kolem kmene, lucerny
    cyl((0, -2.35, 1.3), 1.1, 0.2, mat("#5a3a20", 0.7), verts=24, rot=(math.pi / 2, 0, 0))
    torus((0, -2.45, 1.3), 1.1, 0.12, mat("#ffd24d", 0.4), rot=(math.pi / 2, 0, 0))
    sphere((0.6, -2.55, 1.2), 0.08, mat("#ffd24d", 0.3, 0.6), seg=8)
    box((0, -2.6, 0.12), (2.4, 0.8, 0.24), mat("#a07040", 0.8), 0.03)
    for z, a in [(4.5, -0.6), (6.8, 0.7)]:
        cyl((math.sin(a) * 2.25, -math.cos(a) * 2.25, z), 0.5, 0.15, glow("#ffd27a", 0.8), verts=16, rot=(math.pi / 2, 0, a))
        torus((math.sin(a) * 2.3, -math.cos(a) * 2.3, z), 0.5, 0.08, mat("#5a3a20", 0.7), rot=(math.pi / 2, 0, a))
    for k in range(16):
        a = k * TAU / 12
        box((math.cos(a) * 2.7, math.sin(a) * 2.7, 0.6 + k * 0.45), (1.0, 0.5, 0.12), mat("#a07040", 0.8), 0.02, rot=(0, 0, a))
    for k in range(8):
        a = k * TAU / 8 + 0.2
        sphere((math.cos(a) * 4.8, math.sin(a) * 4.8, 7.8 + (k % 2) * 0.6), 0.16, glow(["#fff59a", "#ffb8f0", "#a8f0ff"][k % 3], 2.0), seg=8)
    # svítící houby kolem
    for k in range(9):
        a = k * TAU / 9
        if math.sin(a) < -0.6:
            continue
        x, y = math.cos(a) * 5.5, math.sin(a) * 5.5
        cyl((x, y, 0.3), 0.15, 0.6, mat("#f4ead8", 0.7), verts=8)
        dome((x, y, 0.6), 0.65, glow(["#ff6fd8", "#6ff0ff", "#b88cff"][k % 3], 0.8), seg=14)


def build_hrad(film=False):
    """Hrad; `film` vynechá padací most a mříž, ty v cut scéně (town3d/films.ts) animuje three.js."""
    stone = mat("#d8d2c4", 0.9)
    stone2 = mat("#cfc8b8", 0.9)
    w, d, h = 16, 10, 6
    box((0, 0, h / 2), (w, d, h), stone, 0.05)
    rnd = random.Random(9)
    for _ in range(80):
        x, z = rnd.uniform(-w / 2 + 0.4, w / 2 - 0.4), rnd.uniform(0.4, h - 0.4)
        box((x, -d / 2 - 0.02, z), (rnd.uniform(0.4, 0.8), 0.04, 0.3), mat("#c4bcae", 0.95), 0)
    for k in range(int(w / 0.8)):
        box((-w / 2 + 0.4 + k * 0.8, -d / 2 + 0.25, h + 0.35), (0.5, 0.5, 0.7), stone, 0.02)
        box((-w / 2 + 0.4 + k * 0.8, d / 2 - 0.25, h + 0.35), (0.5, 0.5, 0.7), stone, 0.02)
    towers = [(-8, -5, 11, "#c0392b"), (8, -5, 11, "#2e5aa8"), (-8, 5, 9, "#c0392b"), (8, 5, 9, "#2e5aa8"), (0, 1, 15, "#7a3aa8")]
    for (x, y, th, c) in towers:
        r = 2.0 if th < 15 else 2.4
        cyl((x, y, th / 2), r, th, stone2, verts=16)
        cyl((x, y, th + 0.1), r + 0.25, 0.3, stone, verts=16)
        for k in range(10):
            a = k * TAU / 10
            box((x + math.cos(a) * (r + 0.1), y + math.sin(a) * (r + 0.1), th + 0.6), (0.5, 0.4, 0.6), stone, 0.02, rot=(0, 0, a))
        cone((x, y, th + 2.6), r + 0.4, 4.2, mat(c, 0.6), verts=16)
        cyl((x, y, th + 5.1), 0.05, 1.4, mat("#5a4a3a", 0.6), verts=6)
        box((x + 0.45, y, th + 5.5), (0.9, 0.04, 0.5), mat("#ffd24d", 0.6), 0.01)
        for z in (th * 0.45, th * 0.75):
            window(x, y - r, z, 0.55, 0.9, frame="#9a9284", arch=True)
    # brána s padacím mostem a mříží
    box((0, -d / 2 - 0.1, 2.2), (3.6, 0.5, 4.4), mat("#bcb4a4", 0.9), 0.03)
    cyl((0, -d / 2 - 0.1, 4.4), 1.8, 0.5, mat("#bcb4a4", 0.9), verts=24, rot=(math.pi / 2, 0, 0))
    box((0, -d / 2 - 0.4, 1.9), (2.6, 0.1, 3.8), mat("#3a2a1a", 0.7), 0)
    if film:
        for x in (-3.2, 3.2):
            lamp_post(x, -d / 2 - 1.6, 2.6)
        return
    for k in range(7):
        box((-1.2 + k * 0.4, -d / 2 - 0.47, 1.9), (0.08, 0.06, 3.6), mat("#5a5a6a", 0.4, 0.7), 0)
    for k in range(5):
        box((0, -d / 2 - 0.47, 0.5 + k * 0.7), (2.5, 0.06, 0.08), mat("#5a5a6a", 0.4, 0.7), 0)
    box((0, -d / 2 - 2.0, 0.1), (3.0, 3.4, 0.2), mat("#8a5a34", 0.8), 0.02)
    for k in range(8):
        box((0, -d / 2 - 0.5 - k * 0.42, 0.21), (3.0, 0.05, 0.02), mat("#5a3a20", 0.8), 0)
    # prapory na zdi a erb
    for x in (-4.5, 4.5):
        box((x, -d / 2 - 0.08, 4.0), (1.2, 0.05, 2.6), mat("#c0392b" if x < 0 else "#2e5aa8", 0.6), 0.01)
        cone((x, -d / 2 - 0.08, 2.5), 0.6, 0.5, mat("#c0392b" if x < 0 else "#2e5aa8", 0.6), verts=3, rot=(math.pi, 0, 0))
    cyl((0, -d / 2 - 0.4, 5.5), 0.7, 0.1, mat("#ffd24d", 0.4, 0.6), verts=6, rot=(math.pi / 2, 0, 0))
    for x in (-3.2, 3.2):
        lamp_post(x, -d / 2 - 1.6, 2.6)


def build_stanek():
    wood = mat("#a07040", 0.8)
    box((0, 0, 0.5), (2.8, 1.6, 1.0), wood, 0.03)
    box((0, -0.3, 1.02), (2.9, 1.0, 0.06), mat("#c89a5a", 0.7), 0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box((sx * 1.35, sy * 0.75, 1.4), (0.12, 0.12, 2.8), wood, 0.01)
    for k in range(6):
        box((-1.25 + k * 0.5, 0, 2.85), (0.5, 2.0, 0.08), mat(["#ff5d73", WHITE][k % 2], 0.6), 0.01, rot=(math.radians(8), 0, 0))
    rnd = random.Random(2)
    for k in range(7):
        sphere((-1.1 + k * 0.36, -0.35, 1.15), 0.14, mat(rnd.choice(["#ff5d73", "#ffd24d", "#7ee0b0", "#ff9f43"]), 0.5), seg=8)
    box((0, -0.85, 1.8), (1.4, 0.05, 0.4), mat("#ffd24d", 0.5), 0.01)


def build_stanice():
    """Startovací rampa s věží a raketou."""
    cyl((0, 0, 0.3), 8, 0.6, mat("#3a3f55", 0.6), verts=40)
    cyl((0, 0, 0.62), 6.5, 0.05, mat("#ffd24d", 0.5), verts=40)
    cyl((0, 0, 0.64), 6.2, 0.05, mat("#3a3f55", 0.6), verts=40)
    for k in range(16):
        a = k * TAU / 16
        sphere((math.cos(a) * 7.5, math.sin(a) * 7.5, 0.65), 0.22, glow("#ff8fd0", 2.0), seg=8)
    # věž
    steel = mat("#d8dee8", 0.35, 0.6)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box((4.5 + sx * 0.6, sy * 0.6, 7.5), (0.2, 0.2, 14), steel, 0.01)
    for k in range(13):
        box((4.5, 0, 1.2 + k * 1.05), (1.4, 1.4, 0.12), steel, 0.01)
        box((4.5, -0.6, 1.7 + k * 1.05), (1.2, 0.06, 0.06), steel, 0, rot=(0, math.radians(40 if k % 2 else -40), 0))
    box((2.8, 0, 9.2), (3.4, 0.6, 0.3), steel, 0.02)
    sphere((4.5, 0, 14.8), 0.3, glow("#ff5d73", 3.0), seg=8)
    # raketa
    white = mat("#f4f4f8", 0.3)
    red = mat("#e5484d", 0.4)
    cyl((0, 0, 4.6), 1.2, 8.0, white, verts=24, r2=1.15)
    for z in (2.0, 7.4):
        torus((0, 0, z), 1.2, 0.06, red, seg=24)
    cone((0, 0, 10.1), 1.15, 3.0, red, verts=24, smooth=True)
    cyl((0, 0, 0.9), 0.8, 0.7, mat("#3a3f55", 0.4, 0.6), verts=16, r2=1.0)
    for k in range(3):
        a = k * TAU / 3
        box((math.cos(a) * 1.35, math.sin(a) * 1.35, 1.8), (0.15, 1.2, 2.4), red, 0.03, rot=(0, 0, a + math.pi / 2))
    cyl((0, -1.17, 6.4), 0.45, 0.1, glow("#8fe8ff", 1.2), verts=16, rot=(math.pi / 2, 0, 0))
    torus((0, -1.2, 6.4), 0.45, 0.07, mat("#c8c8d0", 0.3, 0.8), rot=(math.pi / 2, 0, 0))
    # kontrolní budka
    box((-5.0, 3.5, 1.4), (2.6, 2.0, 1.6), mat("#e8ecf4", 0.4), 0.05)
    dome((-5.0, 3.5, 2.2), 1.0, mat("#8fe8ff", 0.2, 0.2), seg=16)
    window(-5.0, 2.5, 1.5, 1.4, 0.6, glass="#8fe8ff", frame="#3a3f55")


def build_podmorske():
    """Skleněné kupole podmořského města (pod nimi základny a svítící okna)."""
    glass = mat("#a8ecff", 0.05, alpha=0.45)
    base = mat("#8a9ab8", 0.5, 0.3)
    for (x, y, r) in [(-5, 1, 3.0), (3, 3, 3.6), (6, -3, 2.2), (-2, 7, 2.4)]:
        cyl((x, y, 0.2), r * 1.06, 0.4, base, verts=32)
        torus((x, y, 0.42), r * 1.04, 0.1, mat("#ffd24d", 0.4, 0.6), seg=32)
        dome((x, y, 0.4), r, glass, seg=24)
        for k in range(8):
            a = k * TAU / 8
            torus((x, y, 0.4), r, 0.04, base, rot=(math.pi / 2, 0, a), seg=24) if k < 4 else None
        cyl((x, y, 0.4 + r * 0.35), r * 0.28, r * 0.7, mat("#e8ecf4", 0.4), verts=16)
        dome((x, y, 0.4 + r * 0.7), r * 0.3, mat("#ff8fd0", 0.4), seg=14)
        for k in range(4):
            a = k * TAU / 4 + 0.3
            box((x + math.cos(a) * r * 0.28, y + math.sin(a) * r * 0.28, 0.4 + r * 0.4), (0.2, 0.05, 0.3), glow("#ffd86b", 1.5), 0, rot=(0, 0, a + math.pi / 2))
    # spojovací tunely
    for (a, b) in [((-5, 1), (3, 3)), ((3, 3), (6, -3)), ((-5, 1), (-2, 7))]:
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        cyl(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.6), 0.45, L, glass, verts=12, rot=(0, math.pi / 2, ang))
    # korály a chaluhy
    rnd = random.Random(3)
    for _ in range(14):
        x, y = rnd.uniform(-9, 9), rnd.uniform(-6, 10)
        if any(math.hypot(x - cx, y - cy) < r + 0.6 for (cx, cy, r) in [(-5, 1, 3.0), (3, 3, 3.6), (6, -3, 2.2), (-2, 7, 2.4)]):
            continue
        c = rnd.choice(["#ff6f91", "#ff9f43", "#a87bff", "#ffd24d"])
        for k in range(3):
            cyl((x + rnd.uniform(-0.2, 0.2), y + rnd.uniform(-0.2, 0.2), 0.4 + k * 0.1), 0.08, 0.8 + k * 0.2, mat(c, 0.6), verts=6, rot=(rnd.uniform(-0.4, 0.4), rnd.uniform(-0.4, 0.4), 0))


def build_fontana():
    stone = mat("#d8d0c0", 0.85)
    cyl((0, 0, 0.35), 3.2, 0.7, stone, verts=32)
    cyl((0, 0, 0.62), 2.85, 0.2, mat("#7fd8ff", 0.05, 0.1), verts=32)
    torus((0, 0, 0.7), 3.05, 0.18, mat("#e8e0d0", 0.8), seg=40)
    cyl((0, 0, 1.4), 0.4, 1.6, stone, verts=16, r2=0.3)
    cyl((0, 0, 2.2), 1.2, 0.2, stone, verts=24, r2=1.0)
    cyl((0, 0, 2.32), 1.0, 0.08, mat("#7fd8ff", 0.05, 0.1), verts=24)
    cyl((0, 0, 2.8), 0.2, 0.9, stone, verts=12)
    sphere((0, 0, 3.35), 0.35, mat("#ffd24d", 0.3, 0.7), seg=14)
    for k in range(8):
        a = k * TAU / 8
        sphere((math.cos(a) * 1.15, math.sin(a) * 1.15, 2.3), 0.1, stone, seg=8)
    for k in range(6):
        a = k * TAU / 6
        box((math.cos(a) * 3.6, math.sin(a) * 3.6, 0.25), (1.6, 0.5, 0.12), mat("#a07040", 0.8), 0.02, rot=(0, 0, a + math.pi / 2)) if k % 2 == 0 else None


def build_most():
    wood = mat("#a0704a", 0.8)
    dark = mat("#7a5232", 0.8)
    for k in range(12):
        z = 0.35 + 0.25 * math.sin(math.pi * (k + 0.5) / 12)
        box((0, -4.6 + (k + 0.5) * 9.2 / 12, z), (4.6, 0.72, 0.18), wood, 0.02)
    for s in (-1, 1):
        for k in range(7):
            y = -4.6 + k * 9.2 / 6
            z = 0.35 + 0.25 * math.sin(math.pi * k / 6)
            box((s * 2.2, y, z + 0.55), (0.18, 0.18, 1.1), dark, 0.02)
        for k in range(6):
            y0, y1 = -4.6 + k * 9.2 / 6, -4.6 + (k + 1) * 9.2 / 6
            z0, z1 = 0.35 + 0.25 * math.sin(math.pi * k / 6), 0.35 + 0.25 * math.sin(math.pi * (k + 1) / 6)
            box((s * 2.2, (y0 + y1) / 2, (z0 + z1) / 2 + 1.05), (0.12, 9.2 / 6 + 0.1, 0.1), dark, 0.01, rot=(math.atan2(z1 - z0, y1 - y0), 0, 0))


def build_parcela():
    box((0, 0, 0.06), (8, 7, 0.12), mat("#c8a878", 0.95), 0.02)
    for (x, y) in [(-4, -3.5), (4, -3.5), (-4, 3.5), (4, 3.5)]:
        box((x, y, 0.5), (0.12, 0.12, 1.0), mat(WHITE, 0.5), 0.01)
        box((x, y, 1.0), (0.2, 0.2, 0.1), mat("#ff5d73", 0.5), 0.01)
    box((0, -3.5, 0.9), (0.15, 0.15, 1.8), mat("#7a5232", 0.7), 0.01)
    box((0, -3.6, 1.7), (2.2, 0.1, 1.0), mat("#7ee0b0", 0.5), 0.03)
    box((0, -3.66, 1.7), (1.8, 0.02, 0.6), mat(WHITE, 0.5), 0)
    # cihly, prkna a kolečko jako stavební materiál
    for k in range(3):
        box((-2.5, 1.6, 0.2 + k * 0.25), (1.6, 0.8, 0.22), mat("#c8584a", 0.8), 0.02)
    for k in range(4):
        box((2.4, 1.5, 0.15 + k * 0.12), (2.4, 0.3, 0.1), mat("#c89a5a", 0.8), 0.01, rot=(0, 0, 0.08 * k))
    cyl((0.6, 2.4, 0.3), 0.28, 0.12, mat("#3a3f55", 0.5), verts=12, rot=(0, math.pi / 2, 0))
    box((0.0, 2.4, 0.55), (1.0, 0.6, 0.35), mat("#ffb020", 0.5), 0.03)


def build_lampa():
    lamp_post(0, 0, 2.6)


BUILDERS = {
    "skola": build_skola,
    "knihovna": build_knihovna,
    "hvezdarna": build_hvezdarna,
    "herna": build_herna,
    "arena": build_arena,
    "kvetinarstvi": lambda: build_shop("kvetinarstvi"),
    "obchod": lambda: build_shop("obchod"),
    "pekarna": lambda: build_shop("pekarna"),
    "pokoj": lambda: build_shop("pokoj"),
    "strom": build_strom,
    "hrad": build_hrad,
    "hrad-scena": lambda: build_hrad(film=True),
    "stanek": build_stanek,
    "stanice": build_stanice,
    "podmorske": build_podmorske,
    "fontana": build_fontana,
    "most": build_most,
    "parcela": build_parcela,
    "lampa": build_lampa,
}
for i in range(6):
    BUILDERS[f"domek{i + 1}"] = (lambda v: (lambda: build_domek(v)))(i)


if __name__ == "__main__":
    names, preview = args()
    if names == ["all"]:
        names = list(BUILDERS)
    for n in names:
        reset()
        BUILDERS[n]()
        finish_and_export(n, preview)
