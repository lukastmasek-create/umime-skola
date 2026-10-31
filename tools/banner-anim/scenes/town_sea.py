"""Podmořské město: kupole se svítícími okny, ponorka propluje, ryby plavou a bublinky stoupají."""
import math
import random

import common as C
import kit as K

rnd = random.Random(65)


def build():
    K.setup([(0.0, "#082a5a"), (0.5, "#145a9a"), (1.0, "#3a9ad0")], ambient="#5ab8ff", ambient_strength=0.5, sun_rot=(0.3, 0.0, 0.2), sun_strength=1.2, sun_color="#c8f0ff")
    for k in range(5):
        r = K.box((-11 + k * 5.5, 25, 2.5), (1.2, 0.05, 12.0), C.alpha_mat("#d8f6ff", 1.2, 0.07))
        r.rotation_euler = (0, 0.25, 0)
    K.hill(0, 30, -5.4, 30, 2.2, K.lit("#1f4f7a"))
    K.ground(-4.5, K.lit("#c8b07a"), y=5)
    glass = C.alpha_mat("#a8ecff", 1.0, 0.25)
    lights = []
    for (x, r) in [(-11.5, 2.2), (-8.0, 1.4), (8.6, 1.8), (12.2, 2.4), (-14.2, 1.0)]:
        C.cylinder((x, 12, -4.5 + 0.2), r * 1.05, 0.4, K.lit("#8a9ab8", 0.4), verts=24)
        C.sphere((x, 12, -4.3), r, glass, seg=24)
        for k in range(3):
            b = K.box((x - r * 0.4 + k * r * 0.4, 11.2 - r * 0.2, -4.0 + r * 0.25 + (k % 2) * r * 0.2), (r * 0.18, 0.05, r * 0.26), C.mat("#ffd86b", emit=3.0))
            lights.append(b)
        C.cylinder((x, 12.5, -4.3 + r * 0.5), r * 0.25, r * 1.0, K.lit("#d8e0f0", 0.4), verts=12)
    tube = K.box((0, 13, -4.0), (16.0, 0.4, 0.4), glass)
    sub = C.empty((0, 0, 0), "sub")
    body = C.sphere((0, 0, 0), 1.0, K.lit("#ffd24d", 0.35), seg=24)
    body.scale = (1.8, 0.8, 0.8)
    body.parent = sub
    K.box((0.2, 0, 0.8), (0.6, 0.4, 0.5), K.lit("#ffd24d", 0.35)).parent = sub
    for k in range(3):
        C.sphere((-0.7 + k * 0.7, -0.75, 0.05), 0.18, C.mat("#a8ecff", emit=2.0), seg=10).parent = sub
    prop = K.box((-1.95, 0, 0), (0.05, 0.6, 0.12), K.lit("#5a6a88"))
    prop.parent = sub
    fishes = []
    for (z, col, dirn, sp, n) in [(2.6, "#ff8fd0", -1, 1, 4), (0.6, "#7ee0b0", 1, 2, 3), (3.6, "#ffb020", 1, 1, 3)]:
        for k in range(n):
            x0 = k * 1.5
            piv, tail = K.fish(x0, 7 + k * 0.1, z, 0.55, K.lit(col, 0.4), K.lit(col, 0.6))
            fishes.append((piv, tail, x0, z, dirn, sp))
    bub = K.bubbles(26, rnd, C.alpha_mat("#e8fbff", 1.5, 0.45))

    def update(t):
        x = C.wrap(-17 + 34 * t + 17, 34)
        sub.location = (x, 9, 1.6 + 0.25 * math.sin(C.TAU * t * 2))
        prop.rotation_euler = (C.TAU * t * 12, 0, 0)
        K.swim(fishes, t)
        K.rise(bub, t)
        for i, b in enumerate(lights):
            s = 0.85 + 0.15 * math.sin(C.TAU * (t * 2 + i * 0.4))
            b.scale = (s, 1, s)

    return update
