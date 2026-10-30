"""Kouzelný les: obří strom s domečkem, svítící houby pulzují, víly (světýlka) kroužní a padá vílí prach."""
import math
import random

import common as C
import kit as K

rnd = random.Random(63)


def build():
    K.setup([(0.0, "#2a1a4a"), (0.5, "#2a3a6a"), (1.0, "#1a2a4a")], ambient="#6a5aaa", ambient_strength=0.45, sun_rot=(1.0, 0.2, -0.5), sun_strength=0.8, sun_color="#c8b8ff")
    K.hill(0, 35, -5.0, 30, 3.0, C.mat("#1f3a3a", emit=1.0))
    K.ground(-4.3, K.lit("#2f6a4a"), y=4)
    trunk = K.lit("#5a3a2a")
    trees = []
    for (x, y, h) in [(-13.5, 15, 5.2), (-10.2, 20, 4.4), (10.0, 20, 4.6), (13.2, 15, 5.0), (-6.5, 26, 3.2), (6.5, 26, 3.4)]:
        trees.append(K.pine(x, y, -4.3, h * 1.2, K.lit(rnd.choice(["#2a5a5a", "#2f6a5a", "#3a5a7a"])), trunk))
    # obří strom s domečkem vlevo od středu
    big = C.cylinder((-7.0, 10, -1.8), 0.9, 5.0, K.lit("#6a4430"), verts=14)
    for (dx, dz, r) in [(0, 2.2, 2.2), (-1.6, 1.6, 1.5), (1.6, 1.7, 1.6), (0, 3.4, 1.4)]:
        C.sphere((-7.0 + dx, 10, dz), r, K.lit("#3a7a6a"), seg=20)
    door = K.box((-7.0, 9.05, -3.6), (0.6, 0.05, 1.0), C.mat("#ffcf6b", emit=3.0))
    win = K.box((-7.0, 9.05, -1.6), (0.5, 0.05, 0.5), C.mat("#ffcf6b", emit=3.0))
    shrooms = []
    for (x, col, s) in [(-11.5, "#ff6fd8", 0.8), (-9.0, "#6ff0ff", 0.6), (-4.5, "#b88cff", 0.5), (5.0, "#6ff0ff", 0.7), (8.6, "#ff6fd8", 0.55), (11.8, "#ffe66f", 0.8), (3.5, "#b88cff", 0.4)]:
        C.cylinder((x, 4, -4.3 + 0.3 * s), 0.12 * s, 0.6 * s, K.lit("#f4ead8"), verts=8)
        cap = C.sphere((x, 4, -4.3 + 0.65 * s), 0.5 * s, C.mat(col, emit=2.5), seg=16)
        cap.scale = (1, 1, 0.55)
        shrooms.append((cap, rnd.random()))
    fairies = []
    for (cx, cz, r, ph, col) in [(-3.5, 1.0, 2.0, 0.0, "#fff59a"), (4.5, 0.4, 1.6, 0.4, "#a8f0ff"), (9.5, 2.0, 1.4, 0.7, "#ffb8f0")]:
        f = C.sphere((0, 5, 0), 0.14, C.mat(col, emit=8.0), seg=10)
        h = C.sphere((0, 5.2, 0), 0.22, C.mat(col, emit=2.0), seg=10)
        fairies.append((f, h, cx, cz, r, ph))
    dust = K.stars(40, rnd, zmin=-4, zmax=4, y=6, size=(0.03, 0.06), color="#fff2b0")
    flakes = [(o, o.location.x, ph, 1) for (o, ph, r) in dust]

    def update(t):
        K.sway(trees, t, 1.5)
        for i, (cap, ph) in enumerate(shrooms):
            s = 1.0 + 0.08 * math.sin(C.TAU * (t * 2 + ph))
            cap.scale = (s, s, 0.55 * s)
        for (f, h, cx, cz, r, ph) in fairies:
            a = C.TAU * (t + ph)
            p = (cx + r * math.cos(a), 5, cz + 0.6 * math.sin(2 * a))
            f.location = p
            h.location = (p[0], 5.2, p[2])
        K.fall(flakes, t, drift=0.3)
        door.scale.z = 1.0
        w = 0.9 + 0.1 * math.sin(C.TAU * t * 3)
        win.scale = (w, 1, w)

    return update
