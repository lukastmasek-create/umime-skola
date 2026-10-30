"""Halloween: strašidelný dům, svítící dýně, netopýři kolem měsíce a duch, který se vznáší."""
import math
import random

import common as C
import kit as K

rnd = random.Random(75)


def build():
    K.setup([(0.0, "#ff8a3a"), (0.35, "#8a3a6a"), (1.0, "#1a0f30")], ambient="#6a3a8a", ambient_strength=0.35, sun_rot=(1.1, 0.2, 0.8), sun_strength=0.7, sun_color="#ffb070")
    moon = C.sphere((9.5, 55, 2.8), 1.8, C.mat("#ffe8a0", emit=3.0), seg=32)
    st = K.stars(30, rnd, zmin=1.5, zmax=5)
    K.hill(0, 30, -5.0, 30, 3.0, C.mat("#24143a", emit=1.0))
    K.ground(-4.3, C.mat("#1a0f28", emit=1.0), y=4)
    dark = C.mat("#120a20", emit=1.0)
    K.box((-10.5, 14, -2.6), (4.0, 2, 3.4), dark)
    K.tower(-12.4, 14, -4.3, 0.7, 4.5, dark, dark)
    roof = C.cone((-10.3, 14, 0.2), 2.6, 0.0, 1.6, dark, verts=4)
    roof.rotation_euler = (0, 0, math.pi / 4)
    wins = []
    for (x, z) in [(-11.2, -2.6), (-9.6, -2.6), (-10.4, -1.2), (-12.4, -0.6)]:
        wins.append(K.box((x, 12.9, z), (0.45, 0.05, 0.6), C.mat("#ffb84d", emit=3.5)))
    trees = []
    for x in (6.5, 13.5):
        piv = C.empty((x, 12, -4.3), "deadtree")
        C.cylinder((0, 0, 1.3), 0.18, 2.6, dark, verts=6).parent = piv
        for (a, h, L) in [(0.7, 1.8, 1.2), (-0.8, 2.2, 1.0), (0.5, 2.5, 0.7)]:
            b = K.box((math.sin(a) * L / 2, 0, h + math.cos(a) * L / 2 * 0.3), (0.1, 0.1, L), dark)
            b.rotation_euler = (0, a, 0)
            b.parent = piv
        trees.append(piv)
    pumpkins = []
    for (x, s) in [(-6.0, 0.55), (-4.6, 0.4), (4.0, 0.5), (5.5, 0.38), (11.0, 0.45)]:
        p = C.sphere((x, 4, -4.3 + s * 0.7), s, K.lit("#ff7a1a", 0.5), seg=16)
        p.scale = (1.25, 1, 0.85)
        face = K.box((x, 4 - s, -4.3 + s * 0.75), (s * 0.9, 0.05, s * 0.3), C.mat("#ffd84d", emit=4.0))
        pumpkins.append(face)
    ghost = C.empty((0, 0, 0), "ghost")
    g = C.sphere((0, 0, 0), 0.6, K.lit("#f4f4ff", 0.6), seg=18)
    g.scale = (1, 1, 1.3)
    g.parent = ghost
    for dx in (-0.2, 0.2):
        C.sphere((dx, -0.55, 0.2), 0.09, C.mat("#16132b", emit=1.0), seg=8).parent = ghost
    bats = []
    bm = C.mat("#0a0614", emit=1.0)
    for (cx, cz, r, ph) in [(9.5, 2.8, 2.6, 0.0), (9.5, 2.8, 3.4, 0.5), (-4.0, 3.0, 2.0, 0.25)]:
        body = C.sphere((0, 9, 0), 0.12, bm, seg=8)
        wl = K.box((0, 9, 0), (0.45, 0.04, 0.16), bm)
        wr = K.box((0, 9, 0), (0.45, 0.04, 0.16), bm)
        bats.append((body, wl, wr, cx, cz, r, ph))

    def update(t):
        K.twinkle(st, t, 2)
        K.sway(trees, t, 2)
        for i, f in enumerate(pumpkins + wins):
            k = 0.8 + 0.2 * math.sin(C.TAU * (t * 5 + i * 0.37))
            f.scale = (1, 1, k)
        ghost.location = (-2.5 + 1.5 * math.sin(C.TAU * t), 8, 0.5 + 0.4 * math.sin(C.TAU * t * 2))
        for (body, wl, wr, cx, cz, r, ph) in bats:
            a = C.TAU * (t + ph)
            x, z = cx + r * math.cos(a), cz + 0.5 * r * math.sin(a) * 0.5
            body.location = (x, 9, z)
            f = math.radians(40) * math.sin(C.TAU * (t * 12 + ph * 3))
            wl.location = (x - 0.24 * math.cos(f), 9, z + 0.24 * math.sin(f))
            wr.location = (x + 0.24 * math.cos(f), 9, z + 0.24 * math.sin(f))
            wl.rotation_euler = (0, -f, 0)
            wr.rotation_euler = (0, f, 0)

    return update
