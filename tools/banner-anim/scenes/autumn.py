"""Podzim: oranžové a červené stromy, padá listí, dýně na poli a drak na obloze."""
import math
import random

import common as C
import kit as K

rnd = random.Random(73)


def build():
    K.setup([(0.0, "#ffe8c0"), (0.5, "#ffc890"), (1.0, "#8ab8e0")], ambient="#fff0d8", ambient_strength=0.7, sun_rot=(1.1, 0.2, 0.9), sun_strength=2.4, sun_color="#ffd8a0")
    cm = K.lit("#fff4ea", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.7, 0.9, -8.0), (2.9, 0.6, 7.0)], period=30.0, y=45)
    K.hill(-8, 30, -5.0, 16, 3.0, K.lit("#c8a050"))
    K.hill(9, 30, -5.2, 16, 2.8, K.lit("#b89048"))
    K.ground(-4.3, K.lit("#a8883c"), y=4)
    trunk = K.lit("#6a4228")
    trees = []
    for (x, y, h) in [(-13.0, 14, 4.8), (-10.2, 18, 4.0), (-7.5, 22, 3.2), (7.8, 22, 3.4), (10.4, 18, 4.2), (13.2, 14, 5.0)]:
        trees.append(K.round_tree(x, y, -4.3, h, K.lit(rnd.choice(["#e86a2a", "#d8402a", "#f0a030", "#c8582a"])), trunk))
    for (x, s) in [(-5.5, 0.5), (-4.5, 0.38), (4.8, 0.45), (6.0, 0.6)]:
        p = C.sphere((x, 4, -4.3 + s * 0.7), s, K.lit("#ff8a1f", 0.6), seg=16)
        p.scale = (1.2, 1, 0.85)
        C.cylinder((x, 4, -4.3 + s * 1.4), 0.05, 0.2, K.lit("#3f7a2a"), verts=5)
    leaves = []
    for _ in range(36):
        x0 = rnd.uniform(-15, 15)
        o = K.box((x0, 5, 0), (0.22, 0.04, 0.16), K.lit(rnd.choice(["#e86a2a", "#d8402a", "#f0a030"])))
        leaves.append((o, x0, rnd.random(), 1))
    kite = C.cone((0, 12, 0), 0.6, 0.0, 0.1, K.lit("#3fc1ff", 0.5), verts=4)
    kite.rotation_euler = (math.pi / 2, 0, 0)
    kite.scale = (1, 1, 1.6)
    tail = [K.box((0, 12, 0), (0.12, 0.04, 0.12), K.lit("#ff5d73")) for _ in range(5)]

    def update(t):
        K.move_clouds(clouds, per, t)
        K.sway(trees, t, 2.5)
        K.fall(leaves, t, drift=1.5)
        for (o, x0, ph, sp) in leaves:
            o.rotation_euler = (C.TAU * (t * 2 + ph), 0, C.TAU * (t + ph))
        kx, kz = 6.5 + 0.8 * math.sin(C.TAU * t), 3.2 + 0.4 * math.sin(C.TAU * t * 2)
        kite.location = (kx, 12, kz)
        kite.rotation_euler = (math.pi / 2, 0.2 * math.sin(C.TAU * t * 2), 0)
        for i, o in enumerate(tail):
            o.location = (kx - 0.3 * (i + 1) * 0.7, 12, kz - 0.9 - 0.35 * i + 0.15 * math.sin(C.TAU * (t * 3 - i * 0.15)))

    return update
