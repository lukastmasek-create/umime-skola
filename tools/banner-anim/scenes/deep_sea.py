"""Hlubiny: světelné paprsky z hladiny, hejna ryb plavou, chaluhy se vlní a stoupají bublinky."""
import math
import random

import common as C
import kit as K

rnd = random.Random(41)


def build():
    K.setup([(0.0, "#0a2c6a"), (0.45, "#1f8ccc"), (1.0, "#5fd0ee")], ambient="#7fd8ff", ambient_strength=0.6, sun_rot=(0.3, 0.0, 0.2), sun_strength=1.6, sun_color="#d8f8ff")
    rays = []
    for k in range(6):
        r = K.box((-12 + k * 4.8, 20, 2.0), (1.3, 0.05, 14.0), C.alpha_mat("#e8fbff", 1.3, 0.08))
        r.rotation_euler = (0, 0.25, 0)
        rays.append(r)
    K.hill(0, 30, -6.0, 30, 2.4, K.lit("#1f5f8a"))
    K.ground(-4.6, K.lit("#e2c88a"), y=5)
    weeds = []
    for x in [-14, -13.2, -11.8, -10.5, 9.8, 11.2, 12.4, 13.8, -7.5, 7.0]:
        piv = C.empty((x, 4, -4.6), "weed")
        m = K.lit(rnd.choice(["#2f9a55", "#3fbf6a", "#2a8a7a"]))
        h = rnd.uniform(2.0, 3.6)
        for k in range(6):
            seg = C.sphere((0, 0, (k + 0.5) * h / 6), 0.18, m, seg=8)
            seg.scale = (1, 1, 2.2)
            seg.parent = piv
        piv.location = (x, 4, -4.6)
        weeds.append(piv)
    corals = []
    for (x, col) in [(-9.0, "#ff6f91"), (-12.5, "#ff9f43"), (10.5, "#a87bff"), (8.2, "#ff6f91"), (13.0, "#ffd24d")]:
        for k in range(4):
            c = C.sphere((x + rnd.uniform(-0.6, 0.6), 3.5, -4.4 + rnd.uniform(0, 0.8)), rnd.uniform(0.25, 0.45), K.lit(col, 0.5), seg=10)
    fishes = []
    for (z, col, dirn, sp, n) in [(1.8, "#ffb020", 1, 1, 5), (-0.6, "#5ab8ff", -1, 1, 4), (3.2, "#ff6f91", 1, 2, 3), (-2.4, "#7ee0b0", -1, 1, 3)]:
        body = K.lit(col, 0.4)
        fin = K.lit(col, 0.6)
        for k in range(n):
            x0 = k * 1.6 + rnd.uniform(-0.3, 0.3)
            piv, tail = K.fish(x0, 6 + k * 0.1, z + rnd.uniform(-0.4, 0.4), rnd.uniform(0.5, 0.75), body, fin)
            fishes.append((piv, tail, x0, piv.location.z, dirn, sp))
    bub = K.bubbles(30, rnd, C.alpha_mat("#e8fbff", 1.5, 0.45))

    def update(t):
        for i, r in enumerate(rays):
            r.scale.x = 1.0 + 0.4 * math.sin(C.TAU * (t + i * 0.17))
        K.sway(weeds, t, 7, 1)
        K.swim(fishes, t)
        K.rise(bub, t)

    return update
