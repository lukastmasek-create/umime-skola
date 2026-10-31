"""Rámečky avatarů z nových světů obchodu (512 × 512, průhledné pozadí): listová liána s květy (les), královský zlatý
kruh s drahokamy a korunkami (hrad), korálový věnec s perlami (moře). Prstenec leží kolem avataru, vnitřní okraj je u poloměru 1,0.
Spuštění: python ramecky_svet.py -- liana | kralovsky | koral | piratsky | vesmirny | ledovy | sladky | drak [--preview]    Výstup: out/ramecek_<jmeno>/f_0001.png"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
KEY = [a for a in args() if a in ("liana", "kralovsky", "koral", "piratsky", "vesmirny", "ledovy", "sladky", "drak")][0]
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
elif KEY == "piratsky":
    # lano s uzly, kotva dole, zlaté mince a lebka nahoře
    torus((0, 0, 0), R, 0.06, M("lano", "#c8a060", 0.85), rot=flat)
    for k in range(36):
        a = k * math.tau / 36
        x, _, z = at(a, R)
        sphere((x, -0.05, z), 0.045, M("lano_u", "#a8804a", 0.85), scale=(1.3, 0.6, 0.6), seg=8, rings=6).rotation_euler = (0, -a + 0.7, 0)
    ax, _, az = at(-math.pi / 2, R + 0.05)
    bar((ax, -0.08, az + 0.12), (ax, -0.08, az - 0.18), 0.03, M("zelezo", "#4a4e5c", 0.4, 0.8))
    bar((ax - 0.16, -0.08, az - 0.12), (ax + 0.16, -0.08, az - 0.12), 0.025, M("zelezo", "#4a4e5c", 0.4, 0.8))
    torus((ax, -0.08, az + 0.16), 0.05, 0.015, M("zelezo", "#4a4e5c", 0.4, 0.8), rot=flat)
    for s_ in (-1, 1):
        cone((ax + s_ * 0.17, -0.08, az - 0.1), 0.04, 0.0, 0.08, M("zelezo", "#4a4e5c", 0.4, 0.8), verts=4, rot=(math.pi / 2, 0, 0))
    for k in range(9):
        a = k * math.tau / 9 + 0.35
        if abs(math.sin(a) + 1) < 0.25:
            continue
        x, _, z = at(a, R)
        cyl((x, -0.09, z), 0.06, 0.02, M("mince", "#ffc933", 0.25, 0.9), verts=16, rot=flat)
    tx, _, tz = at(math.pi / 2, R + 0.02)
    sphere((tx, -0.1, tz), 0.1, M("lebka", "#f4f0e4", 0.5), seg=14, rings=10)
    for s_ in (-1, 1):
        sphere((tx + s_ * 0.035, -0.19, tz + 0.01), 0.025, M("oko", "#16132b", 0.5), seg=8, rings=6)
        bar((tx - 0.14, -0.08, tz - 0.12 * s_), (tx + 0.14, -0.08, tz + 0.12 * s_), 0.022, M("kost", "#f4f0e4", 0.5))
elif KEY == "vesmirny":
    # kovový prstenec se světelným pásem, planety a hvězdy
    torus((0, 0, 0), R, 0.055, M("kov", "#a8b0c8", 0.25, 0.85), rot=flat)
    torus((0, -0.04, 0), R + 0.06, 0.016, glow("neon_c", "#4fd8ff", 4.0), rot=flat)
    torus((0, -0.04, 0), R - 0.06, 0.012, glow("neon_f", "#b06bff", 3.0), rot=flat)
    for (a, r, c) in [(0.5, 0.12, "#ffb36b"), (2.2, 0.09, "#6fe8ff"), (3.6, 0.14, "#c08cff"), (5.1, 0.08, "#7ee0b0")]:
        x, _, z = at(a, R + 0.02)
        sphere((x, -0.1, z), r, M("planeta" + c, c, 0.6), seg=16, rings=12)
        if r > 0.11:
            torus((x, -0.1, z), r * 1.6, 0.012, M("prsten" + c, "#ffe0b0", 0.4), rot=(math.pi / 2 - 0.5, 0.3, 0))
    for k in range(10):
        a = k * math.tau / 10 + 0.15
        x, _, z = at(a, R + 0.13)
        sphere((x, -0.06, z), 0.022, glow("hvezda", "#fff6c8", 6.0), seg=8, rings=6)
elif KEY == "ledovy":
    # ledový kruh s krystaly a vločkami
    torus((0, 0, 0), R, 0.06, M("led", "#bfe8ff", 0.08, 0.1), rot=flat)
    for k in range(16):
        a = k * math.tau / 16
        x, _, z = at(a, R + 0.02)
        L = 0.12 + 0.08 * ((k * 5) % 3)
        cone((x + 0.5 * L * math.cos(a), -0.04, z + 0.5 * L * math.sin(a)), 0.035, 0.0, L, M("krystal", "#dff4ff", 0.05, 0.1), verts=6, rot=(0, -a + math.pi / 2, 0))
    for k in range(5):
        a = k * math.tau / 5 + 0.6
        x, _, z = at(a, R)
        for j in range(3):
            b = j * math.pi / 3
            bar((x - 0.09 * math.cos(b), -0.1, z - 0.09 * math.sin(b)), (x + 0.09 * math.cos(b), -0.1, z + 0.09 * math.sin(b)), 0.012, glow("vlocka", "#ffffff", 2.0))
elif KEY == "sladky":
    # pruhovaná cukrová hůl dokola, bonbony a lízátka
    # cukrová hůl ze střídavých červených a bílých článků
    N = 48
    for k in range(N):
        a0, a1 = k * math.tau / N, (k + 1.02) * math.tau / N
        p0, p1 = at(a0, R), at(a1, R)
        bar((p0[0], 0, p0[2]), (p1[0], 0, p1[2]), 0.065, M("hul" + str(k % 2), ["#ff2d55", "#ffffff"][k % 2], 0.25), verts=12)
    cols = ["#ff9fd0", "#7ee0b0", "#ffd24d", "#8fc8ff", "#c08cff"]
    for k in range(10):
        a = k * math.tau / 10 + 0.2
        x, _, z = at(a, R + 0.02)
        c = cols[k % 5]
        if k % 2:
            sphere((x, -0.09, z), 0.07, M("bonbon" + c, c, 0.25), scale=(1.4, 0.8, 0.8), seg=12, rings=8)
            for s_ in (-1, 1):
                cone((x + s_ * 0.12, -0.09, z), 0.05, 0.0, 0.06, M("bonbon" + c, c, 0.25), verts=6, rot=(0, s_ * math.pi / 2, 0))
        else:
            cyl((x, -0.09, z), 0.07, 0.03, M("lizatko" + c, c, 0.25), verts=18, rot=flat)
            torus((x, -0.11, z), 0.04, 0.01, M("lizatko_s", "#ffffff", 0.3), rot=flat)
elif KEY == "drak":
    # dračí šupiny, rohy, drahokam a plamínky
    torus((0, 0, 0), R, 0.06, M("draci", "#2f8a5a", 0.45, 0.2), rot=flat)
    for k in range(24):
        a = k * math.tau / 24
        x, _, z = at(a, R + 0.05)
        sphere((x, -0.06, z), 0.06, M("supina" + str(k % 2), ["#3fb070", "#5ad08a"][k % 2], 0.35, 0.2), scale=(1.0, 0.5, 1.4), seg=10, rings=6).rotation_euler = (0, -a, 0)
    for s_ in (-1, 1):
        x, _, z = at(math.pi / 2 + s_ * 0.35, R + 0.05)
        cone((x, -0.05, z + 0.08), 0.05, 0.0, 0.26, M("roh", "#f4e8c8", 0.4), verts=10, rot=(math.pi / 2 - math.pi / 2, s_ * -0.4, 0))
    gx, _, gz = at(math.pi / 2, R)
    sphere((gx, -0.12, gz), 0.075, M("drahokam_d", "#ff3d5a", 0.05, 0.3), seg=12, rings=8)
    for k in range(6):
        a = k * math.tau / 6 - math.pi / 2 + 0.3
        x, _, z = at(a, R + 0.12)
        cone((x, -0.04, z), 0.04, 0.0, 0.12, glow("plamen", "#ff9f43", 3.0), verts=8, rot=(0, -a + math.pi / 2, 0))
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
