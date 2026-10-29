"""3D ikony skupin hlavního menu (public/brand/menu/<klic>.webp): osm malých hračkových předmětů.
Spuštění: python menu_ikony.py -- kurzy | nastaveni | hry | obchod | studium | extra | spolu | zebricky
Jeden snímek 256 × 256, průhledné pozadí, ortografická kamera mírně shora.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

KEY = sys.argv[sys.argv.index("--") + 1]
sc = setup("menu_" + KEY, size=256, frames=1, samples=64, az=-30, el=22, ortho=2.5, target_z=0.55, world=("#f5efff", 0.75))
M = lambda n, c, **k: material(n + KEY, c, **k)
dark = M("dk", "#2c2540", roughness=0.6)
gold = M("gold", "#ffc933", roughness=0.25, metallic=0.9)
white = M("wh", "#ffffff", roughness=0.4)


def kurzy():
    cols = ["#3b7be0", "#ff6f91", "#2fae55"]
    z = 0.08
    for i, c in enumerate(cols):
        w = 1.5 - i * 0.12
        box((0.05 * (i - 1), 0, z + 0.14), (w, 1.0, 0.28), M("b%d" % i, c, roughness=0.45), rot=(0, 0, math.radians(8 * (i - 1))), bevel=0.03)
        box((0.05 * (i - 1) + 0.02, -0.0, z + 0.14), (w * 0.9, 0.96, 0.2), white, rot=(0, 0, math.radians(8 * (i - 1))), bevel=0)
        z += 0.3
    # absolventská čepice
    box((0.0, 0.0, z + 0.22), (1.1, 1.1, 0.07), dark, rot=(0, 0, math.radians(45)), bevel=0.01)
    cyl((0, 0, z + 0.1), 0.32, 0.2, dark, verts=24)
    bar((0.55, 0.0, z + 0.2), (0.55, 0.0, z - 0.2), 0.02, gold, verts=8)
    sphere((0.55, 0.0, z - 0.22), 0.06, gold, seg=10, rings=8)


def nastaveni():
    body = M("gear", "#8fa6c8", roughness=0.3, metallic=0.8)
    cyl((0, 0, 0.45), 0.62, 0.3, body, verts=48, rot=(math.pi / 2, 0, 0))
    for k in range(10):
        a = k * math.tau / 10
        box((0.72 * math.cos(a), 0, 0.45 + 0.72 * math.sin(a)), (0.3, 0.3, 0.3), body, rot=(0, -a, 0), bevel=0.03)
    cyl((0, -0.08, 0.45), 0.3, 0.2, dark, verts=32, rot=(math.pi / 2, 0, 0))
    cyl((0, -0.12, 0.45), 0.2, 0.2, M("hub", "#ffc933", roughness=0.3, metallic=0.9), verts=32, rot=(math.pi / 2, 0, 0))


def hry():
    body = M("pad", "#7b5be0", roughness=0.35)
    sphere((0, 0, 0.35), 0.6, body, scale=(1.5, 0.95, 0.55), seg=32, rings=16)
    for sx in (-1, 1):
        sphere((sx * 0.72, 0.05, 0.28), 0.34, body, scale=(0.8, 1.0, 0.8), seg=20, rings=12)
    box((-0.5, -0.25, 0.62), (0.4, 0.12, 0.12), white, bevel=0.02)
    box((-0.5, -0.25, 0.62), (0.12, 0.12, 0.4), white, bevel=0.02)
    for (dx, dz, c) in ((0.45, 0.06, "#ff6f91"), (0.7, -0.08, "#ffc933"), (0.56, -0.2, "#2fae55")):
        sphere((dx, -0.3 + dz * 0.2, 0.6 + dz * 0.5), 0.09, M("btn" + c, c, roughness=0.3), seg=12, rings=8)
    cyl((0, -0.4, 0.62), 0.07, 0.04, dark, verts=16, rot=(math.pi / 2, 0, 0))


def obchod():
    bag = M("bag", "#ff7a5c", roughness=0.5)
    box((0, 0, 0.5), (1.1, 0.5, 0.85), bag, bevel=0.05)
    box((0, -0.26, 0.28), (1.1, 0.04, 0.12), M("band", "#ffc933", roughness=0.4), bevel=0)
    torus((0, 0, 1.0), 0.28, 0.04, dark, rot=(math.pi / 2, 0, 0))
    sphere((0, -0.28, 0.58), 0.18, gold, scale=(1, 0.2, 1), seg=16, rings=10)


def studium():
    sphere((0, 0, 0.95), 0.55, glow("bulb", "#ffe46b", 3.0), seg=32, rings=20)
    cyl((0, 0, 0.45), 0.25, 0.25, M("neck", "#c9ced8", roughness=0.3, metallic=0.9), verts=24)
    for k in range(3):
        cyl((0, 0, 0.3 - k * 0.07), 0.23 - k * 0.03, 0.06, M("ring%d" % k, "#c9ced8" if k % 2 == 0 else "#8e98aa", roughness=0.3, metallic=0.9), verts=24)
    sphere((0, 0, 0.12), 0.1, dark, seg=12, rings=8)
    for k in range(6):
        a = k * math.tau / 6
        bar((0.75 * math.cos(a), 0, 0.95 + 0.75 * math.sin(a)), (0.95 * math.cos(a), 0, 0.95 + 0.95 * math.sin(a)), 0.03, gold, verts=6)


def extra():
    gem = M("gem", "#46d6ff", roughness=0.1, metallic=0.2)
    cone((0, 0, 0.35), 0.62, 0.0, 0.7, gem, verts=6, rot=(math.pi, 0, 0))
    cyl((0, 0, 0.62), 0.62, 0.2, M("gem2", "#8fe8ff", roughness=0.1), verts=6)
    cone((0, 0, 0.82), 0.45, 0.62, 0.2, M("gem3", "#b9f2ff", roughness=0.1), verts=6)
    for k in range(3):
        sphere((0.6 * math.cos(k * 2.1), 0.5 * math.sin(k * 2.1), 1.1 + 0.1 * k), 0.05, gold, seg=8, rings=6)


def spolu():
    for sx, c in ((-0.5, "#ff6f91"), (0.5, "#3b7be0")):
        m = M("p" + c, c, roughness=0.45)
        sphere((sx, 0, 0.95), 0.3, M("skin" + c, "#ffd2a8", roughness=0.5), seg=20, rings=14)
        sphere((sx, 0, 0.4), 0.45, m, scale=(1, 0.85, 1.05), seg=20, rings=14)
    sphere((0, -0.2, 1.35), 0.14, gold, scale=(1, 0.3, 1), seg=12, rings=8)


def zebricky():
    cup = M("cup", "#ffc933", roughness=0.2, metallic=0.95)
    cone((0, 0, 0.95), 0.55, 0.38, 0.8, cup, verts=32, rot=(math.pi, 0, 0))
    cyl((0, 0, 0.5), 0.12, 0.35, cup, verts=16)
    cyl((0, 0, 0.3), 0.4, 0.1, M("base", "#8a5a34", roughness=0.5), verts=32)
    box((0, 0, 0.12), (0.8, 0.5, 0.24), M("base2", "#6b4a2d", roughness=0.5), bevel=0.03)
    for sx in (-1, 1):
        torus((sx * 0.55, 0, 1.0), 0.17, 0.04, cup, rot=(math.pi / 2, 0, 0))
    sphere((0, -0.4, 1.0), 0.14, M("star", "#fff3a0", roughness=0.3), scale=(1, 0.25, 1), seg=14, rings=8)


def mestecko():
    wall = M("wall", "#fff1d6", roughness=0.6)
    roof = M("roof", "#e8503a", roughness=0.45)
    box((0, 0, 0.45), (1.1, 0.8, 0.7), wall, bevel=0.04)
    # sedlová střecha jako hranol
    prism(-0.62, 0.62, -0.5, 0.5, 0.78, 1.28, roof)
    box((0.35, 0.15, 1.2), (0.16, 0.16, 0.34), M("chim", "#a85a3c", roughness=0.7), bevel=0.01)
    box((0, -0.42, 0.32), (0.26, 0.04, 0.46), M("door", "#7b5be0", roughness=0.5), bevel=0.01)
    for sx in (-0.34, 0.34):
        box((sx, -0.42, 0.5), (0.2, 0.04, 0.2), M("win", "#9ad8ff", roughness=0.2), bevel=0.01)
    bar((-0.7, -0.1, 0.0), (-0.7, -0.1, 1.2), 0.02, dark, verts=8)
    box((-0.52, -0.1, 1.08), (0.34, 0.03, 0.2), M("flag", "#ffc933", roughness=0.4), bevel=0)
    cyl((0.9, -0.3, 0.2), 0.14, 0.4, M("tree", "#2fae55", roughness=0.6), verts=16)


{"mestecko": mestecko, "kurzy": kurzy, "nastaveni": nastaveni, "hry": hry, "obchod": obchod, "studium": studium, "extra": extra, "spolu": spolu, "zebricky": zebricky}[KEY]()


def update(t):
    pass


run(update, "menu_" + KEY)
