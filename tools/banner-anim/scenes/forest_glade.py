"""Lesní mýtina: sluneční paprsky, stromy se kývají, motýli poletují, světlušky blikají a květiny se pohupují."""
import math
import random

import common as C
import kit as K

rnd = random.Random(14)


def build():
    K.setup([(0.0, "#d8f7c0"), (0.5, "#9fe0a0"), (1.0, "#5fbf8a")], ambient="#e8ffe0", ambient_strength=0.7, sun_rot=(0.8, 0.25, -0.6))
    K.hill(0, 30, -5.5, 30, 3.2, K.lit("#5caa52"))
    K.hill(-10, 22, -5.8, 14, 2.6, K.lit("#4f9a47"))
    K.hill(11, 22, -5.9, 14, 2.4, K.lit("#4a9444"))
    K.ground(-4.2, K.lit("#79c75f"), y=4)
    trunk = K.lit("#7a5232")
    trees = []
    for (x, y, h, kind) in [(-13.5, 18, 5.5, 0), (-11.2, 14, 4.2, 1), (-8.4, 20, 4.8, 0), (8.6, 20, 4.6, 1), (11.0, 15, 5.2, 0), (13.6, 18, 4.4, 1),
                            (-5.5, 26, 3.4, 1), (5.2, 26, 3.6, 0), (-2.0, 30, 2.6, 1), (2.6, 30, 2.8, 1)]:
        leaf = K.lit(rnd.choice(["#3f8f3a", "#4ea844", "#2f7f3a"]))
        trees.append(K.round_tree(x, y, -4.2, h, leaf, trunk) if kind == 0 else K.pine(x, y, -4.2, h * 1.2, leaf, trunk))
    rays = []
    for k in range(5):
        r = K.box((-6 + k * 3.2, 8, 2.0), (1.0, 0.05, 12.0), C.alpha_mat("#fff8c8", 1.4, 0.1))
        r.rotation_euler = (0, -0.45, 0)
        rays.append(r)
    flowers = []
    for _ in range(26):
        x = rnd.uniform(-14, 14)
        if abs(x) < 3:
            continue
        col = rnd.choice(["#ff6f91", "#ffd24d", "#ffffff", "#a87bff", "#ff9f43"])
        piv = C.empty((x, 3.5, -4.2), "fl")
        C.cylinder((0, 0, 0.25), 0.03, 0.5, K.lit("#3f8f3a"), verts=5).parent = piv
        C.sphere((0, 0, 0.55), 0.16, K.lit(col, 0.5), seg=10).parent = piv
        C.sphere((0, -0.08, 0.55), 0.07, K.lit("#ffcf3a", 0.5), seg=8).parent = piv
        piv.location = (x, 3.5, -4.2 + rnd.uniform(-0.4, 0.1))
        flowers.append(piv)
    flies = K.stars(18, rnd, zmin=-3.5, zmax=1.5, y=6, size=(0.05, 0.09), color="#fff59a")
    butterflies = []
    for (cx, cz, col, ph) in [(-6.5, -1.0, "#ff8fd0", 0.0), (6.0, 0.2, "#5ab8ff", 0.4), (-2.5, 1.5, "#ffd24d", 0.7)]:
        m = K.lit(col, 0.4)
        wl = K.box((0, 3, 0), (0.45, 0.04, 0.35), m)
        wr = K.box((0, 3, 0), (0.45, 0.04, 0.35), m)
        butterflies.append((wl, wr, cx, cz, ph))

    def update(t):
        K.sway(trees, t, 2.0, 1)
        K.sway(flowers, t, 8.0, 2)
        K.twinkle(flies, t, 3)
        for i, r in enumerate(rays):
            r.scale.x = 1.0 + 0.35 * math.sin(C.TAU * (t + i * 0.2))
        for (wl, wr, cx, cz, ph) in butterflies:
            a = C.TAU * (t + ph)
            x = cx + 2.2 * math.sin(a)
            z = cz + 0.8 * math.sin(2 * a)
            f = 1.1 * abs(math.sin(C.TAU * t * 10 + ph * 5))
            wl.location = (x - 0.22 * math.cos(f), 3, z)
            wr.location = (x + 0.22 * math.cos(f), 3, z)
            wl.rotation_euler = (0, f, 0)
            wr.rotation_euler = (0, -f, 0)

    return update
