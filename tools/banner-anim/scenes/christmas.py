"""Vánoce: zasněžená vesnička, vánoční strom s blikajícími světýlky, sněží a okna svítí."""
import math
import random

import common as C
import kit as K

rnd = random.Random(74)


def build():
    K.setup([(0.0, "#3a4a8a"), (0.5, "#1e2a5a"), (1.0, "#0c1432")], ambient="#6a7ab8", ambient_strength=0.45, sun_rot=(1.1, 0.2, -0.6), sun_strength=0.8, sun_color="#b8c8ff")
    st = K.stars(50, rnd, zmin=0.5, zmax=5)
    snow = K.lit("#f4f8ff", 0.8)
    K.hill(0, 30, -5.0, 30, 3.2, snow)
    K.ground(-4.3, snow, y=4)
    win = C.mat("#ffc25a", emit=3.5)
    lights = []
    for i, (x, w, h) in enumerate([(-13.5, 1.8, 1.6), (-11.2, 1.6, 2.0), (-8.8, 1.7, 1.5), (8.8, 1.7, 1.7), (11.2, 1.6, 1.4), (13.5, 1.9, 1.9)]):
        piv, ls = K.house(x, 9, -4.3, w, h, K.lit(rnd.choice(["#c0392b", "#8a5a3a", "#2e5a8a"])), snow, win, K.lit("#5a3a20"))
        lights += ls
    tree = K.pine(0, 6, -4.3, 4.6, K.lit("#1f6a3a"), K.lit("#5a3a20"))
    star = C.sphere((0, 5.6, 0.0), 0.28, C.mat("#ffd24d", emit=6.0), seg=12)
    bulbs = []
    for k in range(22):
        h = rnd.uniform(0.25, 0.85)
        r = (0.95 - h) * 1.55
        a = rnd.uniform(0, math.pi)
        b = C.sphere((r * math.cos(a), 5.4, -4.3 + h * 4.6), 0.08, C.mat(rnd.choice(["#ff5d73", "#ffd24d", "#3fc1ff", "#7ee0b0"]), emit=5.0), seg=8)
        bulbs.append((b, rnd.random()))
    for (x, col) in [(-0.9, "#e5484d"), (0.8, "#3fc1ff"), (0.1, "#ffd24d")]:
        K.box((x, 5.2, -4.0), (0.55, 0.5, 0.55), K.lit(col, 0.5))
    flakes = []
    fm = C.mat("#ffffff", emit=1.6)
    for _ in range(80):
        x0 = rnd.uniform(-15.5, 15.5)
        o = C.sphere((x0, 4, 0), rnd.uniform(0.04, 0.09), fm, seg=6, smooth=False)
        flakes.append((o, x0, rnd.random(), 1))

    def update(t):
        K.twinkle(st, t, 2)
        K.fall(flakes, t, drift=0.5)
        for (b, ph) in bulbs:
            on = math.sin(C.TAU * (t * 3 + ph)) > -0.2
            s = 1.0 if on else 0.4
            b.scale = (s, s, s)
        s = 1 + 0.15 * math.sin(C.TAU * t * 2)
        star.scale = (s, s, s)
        for i, w in enumerate(lights):
            k = 0.9 + 0.1 * math.sin(C.TAU * (t * 4 + i * 0.3))
            w.scale = (k, 1, k)

    return update
