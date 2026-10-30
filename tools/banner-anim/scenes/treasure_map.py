"""Mapa pokladu: stará mapa s ostrovy, lodička obepluje ostrov, čárkovaná cesta se posouvá k X, kompas se kývá."""
import math
import random

import common as C
import kit as K

rnd = random.Random(21)


def build():
    K.setup([(0.0, "#c99a5a"), (1.0, "#e9cf96")], ambient="#fff4dc", ambient_strength=0.9, sun_rot=(0.7, 0.3, 0.4), sun_strength=2.2)
    paper = K.box((0, 6, 0), (34, 1, 12), K.lit("#ecd7a4", 0.95), name="paper")
    sea = K.box((0, 5.45, 1.4), (34, 0.1, 3.2), K.lit("#9cc7c2", 0.9), name="sea")
    sand = K.lit("#e2c27c")
    green = K.lit("#6ea24f")
    islands = []
    for (x, z, sx, sz) in [(-10.5, -1.2, 3.2, 2.0), (9.5, 1.0, 3.6, 2.4), (11.5, -3.0, 1.6, 0.9), (-6.0, 3.0, 1.4, 0.8)]:
        s = C.sphere((x, 5.2, z), 1.0, sand, seg=28)
        s.scale = (sx, 0.5, sz)
        g = C.sphere((x, 5.0, z + 0.15), 1.0, green, seg=24)
        g.scale = (sx * 0.72, 0.5, sz * 0.66)
        islands.append(s)
    trunk = K.lit("#8a5a2b")
    leaf = K.lit("#3f8f3a")
    palms = []
    for (x, z) in [(-11.4, -0.6), (-9.6, -0.4), (8.6, 1.8), (10.6, 1.6)]:
        piv = C.empty((x, 4.6, z - 0.3), "palm")
        C.cylinder((0, 0, 0.5), 0.07, 1.0, trunk, verts=6).parent = piv
        for k in range(5):
            f = K.box((0.35 * math.cos(k * 1.256), 0, 1.05), (0.75, 0.05, 0.14), leaf)
            f.rotation_euler = (0, -0.4, k * 1.256)
            f.parent = piv
        piv.location = (x, 4.6, z - 0.3)
        palms.append(piv)
    # X a cesta
    red = C.mat("#c0392b", emit=1.3)
    x1 = K.box((9.8, 4.6, -0.2), (1.1, 0.05, 0.18), red)
    x1.rotation_euler = (0, 0.785, 0)
    x2 = K.box((9.8, 4.6, -0.2), (1.1, 0.05, 0.18), red)
    x2.rotation_euler = (0, -0.785, 0)
    path = [(-9.5, -1.4), (-6.5, -2.6), (-3.0, -3.2), (0.5, -3.4), (4.0, -2.8), (6.8, -1.6), (9.2, -0.4)]
    dashes = [K.box((0, 4.7, 0), (0.32, 0.05, 0.1), C.mat("#7a2a1a", emit=1.0)) for _ in range(22)]
    # kompas
    comp = C.cylinder((-12.0, 4.8, 3.0), 1.1, 0.1, K.lit("#d9b46a", 0.5), verts=32)
    comp.rotation_euler = (math.pi / 2, 0, 0)
    needle = K.box((-12.0, 4.6, 3.0), (0.12, 0.05, 1.7), C.mat("#c0392b", emit=1.0))
    # lodička
    boat = C.empty((0, 0, 0), "boat")
    hull = K.box((0, 0, 0), (0.9, 0.3, 0.25), K.lit("#7a4a22"))
    hull.parent = boat
    sail = K.box((0, -0.05, 0.42), (0.4, 0.05, 0.6), K.lit("#f6f0dc"))
    sail.parent = boat

    def pt(u):
        u = u % 1.0
        f = u * (len(path) - 1)
        i = min(int(f), len(path) - 2)
        k = f - i
        a, b = path[i], path[i + 1]
        return (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)

    def update(t):
        for i, d in enumerate(dashes):
            u = (i / len(dashes) + t / len(dashes) * 2) % 1.0
            x, z = pt(u)
            d.location = (x, 4.65, z)
            d.hide_render = False
        s = 1.0 + 0.15 * math.sin(C.TAU * t * 2)
        x1.scale = x2.scale = (s, 1, s)
        needle.rotation_euler = (0, 0.35 * math.sin(C.TAU * t), 0)
        a = C.TAU * t
        boat.location = (-0.5 + 4.2 * math.cos(a), 4.7, 1.6 + 1.0 * math.sin(a))
        boat.rotation_euler = (0, 0.08 * math.sin(C.TAU * t * 3), 0)
        boat.scale = (1 if math.sin(a) < 0 else -1, 1, 1)
        K.sway(palms, t, 4, 2)

    return update
