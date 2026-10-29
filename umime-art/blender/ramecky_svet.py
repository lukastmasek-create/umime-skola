"""Rámečky avatarů z nových světů obchodu (512 × 512, průhledné pozadí): listová liána s květy (les), královský zlatý
kruh s drahokamy a korunkami (hrad), korálový věnec s perlami (moře). Prstenec leží kolem avataru, vnitřní okraj je u poloměru 1,0.
Spuštění: python ramecky_svet.py -- liana | kralovsky | koral [--preview]    Výstup: out/ramecek_<jmeno>/f_0001.png"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
KEY = [a for a in args() if a in ("liana", "kralovsky", "koral")][0]
S = 512
sc = reset(S, S, 1, samples=24 if PREVIEW else 96, name="ramecek_" + KEY, world=("#ffffff", 0.9), view="AgX", look="AgX - Punchy")
sc.render.film_transparent = True
add_camera((0, -40, 0), (0, 0, 0), ortho_scale=2.6)
add_sun((math.radians(60), 0, math.radians(-30)), energy=3.4, color="#fff0d8", angle=0.3)
add_area((-3, -6, 3), (0, 0, 1), energy=400, size=6, color="#cfe0ff")
_M = {}


def M(name, color, roughness=0.5, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def at(a, r):
    return (r * math.cos(a), -0.02, r * math.sin(a))


R = 1.1
flat = (math.pi / 2, 0, 0)
if KEY == "liana":
    torus((0, 0, 0), R, 0.045, M("liana_k", "#6b4a2a", 0.8), rot=flat)
    torus((0.0, -0.02, 0.0), R + 0.02, 0.03, M("liana_k2", "#8a6a3c", 0.8), rot=flat)
    for k in range(18):
        a = k * math.tau / 18
        sx, sy = at(a, R + 0.02)[0], at(a, R + 0.02)[2]
        leaf = sphere((sx + 0.07 * math.cos(a), -0.03, sy + 0.07 * math.sin(a)), 0.09, M("list" + str(k % 2), ["#3fb060", "#69cf72"][k % 2], 0.6), scale=(1.6, 0.35, 0.8), seg=12, rings=8)
        leaf.rotation_euler = (0, -a + (0.6 if k % 2 else -0.6), 0)
    for k in range(7):
        a = k * math.tau / 7 + 0.2
        x, _, z = at(a, R + 0.1)
        for j in range(5):
            b = j * math.tau / 5
            sphere((x + 0.05 * math.cos(b), -0.06, z + 0.05 * math.sin(b)), 0.035, M("kvetl" + str(k % 3), ["#ff8ad0", "#ffd24d", "#ffffff"][k % 3], 0.5), seg=8, rings=6)
        sphere((x, -0.07, z), 0.03, glow("liana_sv", "#fff2a0", 5.0), seg=8, rings=6)
elif KEY == "kralovsky":
    torus((0, 0, 0), R, 0.075, M("zlato", "#ffc933", 0.22, 0.95), rot=flat)
    torus((0, -0.02, 0), R - 0.07, 0.022, M("zlato_i", "#ffe58a", 0.25, 0.9), rot=flat)
    for k in range(12):
        a = k * math.tau / 12
        x, _, z = at(a, R)
        c = ["#e0453a", "#46a6ff", "#3fe08a"][k % 3]
        sphere((x, -0.07, z), 0.055, M("drahokam" + c, c, 0.1, 0.2), seg=10, rings=8)
    for k in range(4):
        a = k * math.tau / 4 + math.pi / 4
        x, _, z = at(a, R + 0.08)
        cone((x, -0.04, z), 0.11, 0.0, 0.22, M("zlato", "#ffc933", 0.22, 0.95), verts=5, rot=(math.pi / 2 - 0 * a, 0, 0))
        sphere((x, -0.06, z), 0.05, M("perla_k", "#ffffff", 0.2), seg=8, rings=6)
else:
    torus((0, 0, 0), R, 0.05, M("koral_k", "#ff7aa8", 0.5), rot=flat)
    for k in range(14):
        a = k * math.tau / 14 + 0.1
        x, _, z = at(a, R)
        c = ["#ff7aa8", "#ffb347", "#9a6aff", "#3fe0b0"][k % 4]
        L = 0.1 + 0.07 * ((k * 7) % 3)
        bar((x, -0.03, z), (x + L * math.cos(a), -0.04, z + L * math.sin(a)), 0.03, M("koral" + c, c, 0.5), verts=6)
        for s_ in (-1, 1):
            bar((x + 0.55 * L * math.cos(a), -0.04, z + 0.55 * L * math.sin(a)), (x + 0.9 * L * math.cos(a + s_ * 0.5), -0.045, z + 0.9 * L * math.sin(a + s_ * 0.5)), 0.022, M("koral" + c, c, 0.5), verts=6)
        sphere((x + L * math.cos(a), -0.05, z + L * math.sin(a)), 0.035, glow("korK" + c, c, 1.5), seg=8, rings=6)
    for k in range(8):
        a = k * math.tau / 8 + 0.35
        x, _, z = at(a, R - 0.02)
        sphere((x, -0.08, z), 0.05, M("perla_k", "#ffffff", 0.15), seg=10, rings=8)

run(lambda t: None, "ramecek_" + KEY)
