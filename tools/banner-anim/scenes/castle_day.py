"""Hradní nádvoří ve dne: hrad s věžemi, vlajky vlají, mraky plují a ptáci přeletí."""
import math
import random

import common as C
import kit as K

rnd = random.Random(31)


def castle(x, y, z, s, wall, roof, flag, win=None):
    flags = []
    parts = []
    for (dx, h, r) in [(-3.0, 4.2, 0.8), (3.0, 4.2, 0.8), (0.0, 5.6, 1.0), (-5.2, 3.0, 0.6), (5.2, 3.0, 0.6)]:
        piv, f = K.tower(x + dx * s, y, z, r * s, h * s, wall, roof, flag)
        flags.append(f)
        parts.append(piv)
    K.box((x, y + 0.3, z + 1.3 * s), (10.4 * s, 1.2, 2.6 * s), wall)
    for k in range(13):
        K.box((x - 5.0 * s + k * 0.83 * s, y + 0.3, z + 2.75 * s), (0.4 * s, 1.2, 0.35 * s), wall)
    K.box((x, y - 0.35, z + 0.8 * s), (1.4 * s, 0.1, 1.6 * s), K.lit("#4a3020"))
    lights = []
    if win is not None:
        for dx in (-3.0, 3.0, 0.0):
            for dz in (2.4, 3.4):
                lights.append(K.box((x + dx * s, y - 1.0, z + dz * s), (0.22 * s, 0.05, 0.38 * s), win))
    return flags, lights


def build():
    K.setup([(0.0, "#e8f6ff"), (0.5, "#a9dcff"), (1.0, "#5aaee8")], ambient="#eaf4ff", ambient_strength=0.7, sun_rot=(0.9, 0.2, 0.7))
    C.sphere((11.5, 55, 3.4), 1.0, C.mat("#fff4c0", emit=3.0), seg=24)
    cm = K.lit("#ffffff", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.6, 1.0, -9.0), (2.8, 0.7, 5.0), (4.1, 0.6, 13.0)], period=30.0, y=45)
    K.hill(-9, 30, -5.0, 16, 3.4, K.lit("#8fc77a"))
    K.hill(10, 30, -5.2, 17, 3.0, K.lit("#7ebd6c"))
    K.hill(0, 16, -6.4, 20, 3.0, K.lit("#6caf5c"))
    K.ground(-4.4, K.lit("#78b865"), y=6)
    flags, _ = castle(0, 14, -4.4, 0.95, K.lit("#d8d2c4", 0.8), K.lit("#c0392b", 0.6), K.lit("#ffd24d", 0.5))
    trees = [K.round_tree(x, 9, -4.4, h, K.lit("#3f8f3a"), K.lit("#7a5232")) for (x, h) in [(-12.5, 2.6), (-10.6, 2.0), (11.0, 2.4), (13.2, 2.8)]]
    bird_m = C.mat("#2a2a40", emit=1.0)
    birds = []
    for (z0, ph, sc) in [(3.0, 0.0, 1.0), (2.5, 0.08, 0.8), (3.5, 0.15, 0.7)]:
        wl = K.box((0, 8, 0), (0.5 * sc, 0.04, 0.06 * sc), bird_m)
        wr = K.box((0, 8, 0), (0.5 * sc, 0.04, 0.06 * sc), bird_m)
        birds.append((wl, wr, z0, ph, sc))

    def update(t):
        K.move_clouds(clouds, per, t)
        K.flap(flags, t, 3)
        K.sway(trees, t, 2.0)
        for (wl, wr, z0, ph, sc) in birds:
            x = -17 + 34 * ((t + ph) % 1.0)
            z = z0 + 0.3 * math.sin(C.TAU * (t * 2 + ph))
            f = math.radians(30) * math.sin(C.TAU * (t * 14 + ph))
            L = 0.24 * sc
            wl.location = (x - L * math.cos(f), 8, z + L * math.sin(f))
            wr.location = (x + L * math.cos(f), 8, z + L * math.sin(f))
            wl.rotation_euler = (0, -f, 0)
            wr.rotation_euler = (0, f, 0)

    return update
