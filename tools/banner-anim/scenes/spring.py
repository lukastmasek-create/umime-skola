"""Jaro: rozkvetlé třešně, padají okvětní lístky, tulipány se kývají a včely bzučí."""
import math
import random

import common as C
import kit as K

rnd = random.Random(71)


def build():
    K.setup([(0.0, "#fff4fa"), (0.5, "#ffe0f0"), (1.0, "#b8e4ff")], ambient="#fff0f6", ambient_strength=0.75)
    cm = K.lit("#ffffff", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.8, 0.9, -5.0), (3.0, 0.6, 10.0)], period=30.0, y=45)
    K.hill(-8, 30, -5.0, 16, 3.0, K.lit("#a8e08a"))
    K.hill(9, 30, -5.2, 16, 2.8, K.lit("#98d47c"))
    K.ground(-4.3, K.lit("#8fd070"), y=4)
    trunk = K.lit("#7a5232")
    trees = []
    for (x, y, h) in [(-12.5, 14, 4.8), (-9.5, 18, 3.8), (9.8, 18, 4.0), (12.8, 14, 5.0)]:
        trees.append(K.round_tree(x, y, -4.3, h, K.lit(rnd.choice(["#ffb8d8", "#ffc8e0", "#ff9ec7"]), 0.6), trunk))
    tulips = []
    for _ in range(30):
        x = rnd.uniform(-14.5, 14.5)
        if abs(x) < 2.5:
            continue
        piv = C.empty((x, 3.5, -4.3), "tulip")
        C.cylinder((0, 0, 0.3), 0.03, 0.6, K.lit("#3f8f3a"), verts=5).parent = piv
        c = C.cone((0, 0, 0.72), 0.16, 0.2, 0.3, K.lit(rnd.choice(["#ff5d73", "#ffd24d", "#a87bff", "#ff9f43"]), 0.5), verts=6)
        c.parent = piv
        piv.location = (x, 3.5, -4.3 + rnd.uniform(-0.5, 0.0))
        tulips.append(piv)
    pm = K.lit("#ffc0dc", 0.6)
    petals = []
    for _ in range(40):
        x0 = rnd.uniform(-15, 15)
        o = K.box((x0, 6, 0), (0.14, 0.04, 0.1), pm)
        petals.append((o, x0, rnd.random(), 1))
    bees = []
    for (cx, cz, ph) in [(-5.0, -1.8, 0.0), (6.0, -1.2, 0.5)]:
        b = C.sphere((0, 4, 0), 0.16, K.lit("#ffd24d", 0.4), seg=10)
        b.scale = (1.4, 1, 1)
        bees.append((b, cx, cz, ph))

    def update(t):
        K.move_clouds(clouds, per, t)
        K.sway(trees, t, 1.5)
        K.sway(tulips, t, 7, 2)
        K.fall(petals, t, drift=1.2)
        for i, (o, x0, ph, sp) in enumerate(petals):
            o.rotation_euler = (C.TAU * (t * 2 + ph), 0, C.TAU * (t + ph))
        for (b, cx, cz, ph) in bees:
            a = C.TAU * (t + ph)
            b.location = (cx + 1.6 * math.sin(a), 4, cz + 0.5 * math.sin(3 * a))

    return update
