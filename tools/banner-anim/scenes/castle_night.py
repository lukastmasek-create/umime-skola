"""Hradby za noci: měsíc, hvězdy, okna hradu blikají jako svíčky a kolem létají netopýři."""
import math
import random

import common as C
import kit as K
from scenes.castle_day import castle

rnd = random.Random(32)


def build():
    K.setup([(0.0, "#3a2a5a"), (0.5, "#1e2250"), (1.0, "#0c1030")], ambient="#2a2f66", ambient_strength=0.35, sun_rot=(1.1, 0.2, -0.8), sun_strength=0.6, sun_color="#9fb0ff")
    C.sphere((-10.5, 55, 3.2), 1.4, C.mat("#fff3c4", emit=3.0), seg=32)
    st = K.stars(70, rnd, zmin=0.0, zmax=5)
    K.hill(-9, 30, -5.0, 16, 3.4, C.mat("#232a52", emit=1.0))
    K.hill(10, 30, -5.2, 17, 3.0, C.mat("#1e2448", emit=1.0))
    K.hill(0, 16, -6.4, 20, 3.0, C.mat("#181d3c", emit=1.0))
    K.ground(-4.4, C.mat("#141830", emit=1.0), y=6)
    win = C.mat("#ffc25a", emit=4.0)
    flags, lights = castle(0, 14, -4.4, 0.95, K.lit("#5a5a78", 0.8), K.lit("#3a2a5a", 0.6), K.lit("#c0392b", 0.5), win=win)
    bats = []
    bm = C.mat("#0a0a18", emit=1.0)
    for (cx, cz, r, ph) in [(-5.0, 2.0, 2.4, 0.0), (5.5, 2.6, 2.0, 0.33), (8.5, 1.2, 1.6, 0.66)]:
        body = C.sphere((0, 9, 0), 0.12, bm, seg=8)
        wl = K.box((0, 9, 0), (0.45, 0.04, 0.16), bm)
        wr = K.box((0, 9, 0), (0.45, 0.04, 0.16), bm)
        bats.append((body, wl, wr, cx, cz, r, ph))

    def update(t):
        K.twinkle(st, t, 2)
        K.flap(flags, t, 2)
        for i, w in enumerate(lights):
            s = 0.85 + 0.15 * math.sin(C.TAU * (t * 6 + i * 0.37)) * math.sin(C.TAU * (t * 2 + i))
            w.scale = (s, 1, s)
        for (body, wl, wr, cx, cz, r, ph) in bats:
            a = C.TAU * (t + ph)
            x, z = cx + r * math.cos(a), cz + 0.6 * r * math.sin(2 * a) * 0.5
            body.location = (x, 9, z)
            f = math.radians(40) * math.sin(C.TAU * (t * 12 + ph * 3))
            wl.location = (x - 0.24 * math.cos(f), 9, z + 0.24 * math.sin(f))
            wr.location = (x + 0.24 * math.cos(f), 9, z + 0.24 * math.sin(f))
            wl.rotation_euler = (0, -f, 0)
            wr.rotation_euler = (0, f, 0)

    return update
