"""Poušť: pyramidy v žáru, karavana velbloudů prochází, slunce pulzuje a vítr zvedá písek."""
import math
import random

import common as C
import kit as K

rnd = random.Random(77)


def camel(s):
    piv = C.empty((0, 0, 0), "camel")
    m = K.lit("#c8904a", 0.8)
    body = C.sphere((0, 0, 0.9 * s), 0.55 * s, m, seg=14)
    body.scale = (1.5, 0.7, 0.8)
    body.parent = piv
    C.sphere((0, 0, 1.35 * s), 0.35 * s, m, seg=12).parent = piv
    neck = K.box((0.85 * s, 0, 1.3 * s), (0.18 * s, 0.18 * s, 0.8 * s), m)
    neck.rotation_euler = (0, 0.4, 0)
    neck.parent = piv
    C.sphere((1.1 * s, 0, 1.7 * s), 0.2 * s, m, seg=10).parent = piv
    legs = []
    for dx in (-0.5, -0.2, 0.3, 0.6):
        l = K.box((dx * s, 0, 0.35 * s), (0.1 * s, 0.1 * s, 0.7 * s), m)
        l.parent = piv
        legs.append(l)
    return piv, legs


def build():
    K.setup([(0.0, "#58b0ec"), (0.45, "#a8dcf4"), (1.0, "#ffe0a0")], ambient="#fff4e0", ambient_strength=0.75, sun_rot=(0.8, 0.1, 0.6), sun_strength=3.0, sun_color="#fff0d0")
    sun = C.sphere((-10.5, 55, 3.4), 1.5, C.mat("#fffbe0", emit=4.0), seg=32)
    sand = K.lit("#f0c878", 0.95)
    K.hill(-6, 34, -5.0, 16, 2.4, K.lit("#e8b868"))
    K.hill(9, 34, -5.0, 18, 2.6, K.lit("#e0b060"))
    for (x, y, s) in [(7.0, 24, 4.2), (11.5, 28, 3.0), (3.6, 30, 2.0)]:
        p = C.cone((x, y, -3.0 + s * 0.45), s, 0.0, s * 1.2, K.lit("#e8c080", 0.85), verts=4)
        p.rotation_euler = (0, 0, math.pi / 4)
    K.ground(-4.0, sand, y=4)
    K.hill(-10, 8, -5.6, 8, 2.0, K.lit("#f4d088"))
    K.hill(13, 8, -5.8, 6, 1.8, K.lit("#f4d088"))
    cacti = []
    for x in (-13.0, -8.4, 12.6):
        piv = C.empty((x, 6, -4.0), "cactus")
        cm = K.lit("#4a9a4a", 0.6)
        C.cylinder((0, 0, 0.8), 0.2, 1.6, cm, verts=8).parent = piv
        C.cylinder((0.35, 0, 1.0), 0.12, 0.7, cm, verts=8).parent = piv
        C.cylinder((-0.35, 0, 0.8), 0.12, 0.6, cm, verts=8).parent = piv
        cacti.append(piv)
    camels = [camel(0.8) for _ in range(3)]
    dust = []
    dm = C.alpha_mat("#fff0c8", 1.2, 0.4)
    for _ in range(40):
        z0 = rnd.uniform(-4, 0)
        o = K.box((0, 5, z0), (0.3, 0.03, 0.03), dm)
        dust.append((o, rnd.uniform(-15, 15), z0, rnd.random()))

    def update(t):
        s = 1 + 0.05 * math.sin(C.TAU * t * 2)
        sun.scale = (s, s, s)
        for i, (piv, legs) in enumerate(camels):
            x = C.wrap(-15 + 34 * t - i * 2.4 + 17, 34)
            piv.location = (x, 7, -4.0 + 0.05 * abs(math.sin(C.TAU * t * 8 + i)))
            for j, l in enumerate(legs):
                l.rotation_euler = (0, 0.3 * math.sin(C.TAU * (t * 8 + j * 0.5 + i * 0.2)), 0)
        for (o, x0, z0, ph) in dust:
            o.location = (C.wrap(x0 + 34 * ((t * 2 + ph) % 1.0), 34), 5, z0 + 0.2 * math.sin(C.TAU * (t * 3 + ph)))

    return update
