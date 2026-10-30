"""Sopka: z kráteru tryská láva, stoupá kouř, lávové proudy žhnou a létají jiskry."""
import math
import random

import common as C
import kit as K

rnd = random.Random(76)


def build():
    K.setup([(0.0, "#ff8a4a"), (0.4, "#a83a3a"), (1.0, "#2a1428")], ambient="#a85a4a", ambient_strength=0.4, sun_rot=(1.0, 0.2, -0.7), sun_strength=1.2, sun_color="#ffb080")
    K.hill(-11, 34, -5.0, 10, 3.0, C.mat("#4a2028", emit=1.0))
    K.hill(12, 34, -5.0, 10, 3.2, C.mat("#4a2028", emit=1.0))
    rock = K.lit("#4a3a3a", 0.9)
    vol = C.cone((8.5, 22, -1.4), 6.5, 1.2, 7.0, rock, verts=10)
    crater = C.cylinder((8.5, 22, 2.1), 1.15, 0.2, C.mat("#ffb020", emit=6.0), verts=10)
    lava_m = C.mat("#ff5a1a", emit=4.0)
    flows = []
    for (dx, rot) in [(-1.6, 0.42), (1.4, -0.38), (0.0, 0.0)]:
        f = K.box((8.5 + dx, 18.6, -1.0), (0.35, 0.05, 6.4), lava_m)
        f.rotation_euler = (0, rot, 0)
        flows.append(f)
    K.ground(-4.3, K.lit("#5a4038", 0.9), y=4)
    for x in (-13, -10.5, -8.0, 13.5):
        C.cone((x, 6, -3.8), 0.6, 0.0, 1.2, rock, verts=6)
    smoke_m = K.lit("#6a5a62", 0.9)
    puffs = []
    for k in range(7):
        o = C.sphere((8.5, 24, 3), 0.8, smoke_m, seg=14)
        puffs.append((o, k / 7))
    sparks = []
    sm = C.mat("#ffd84d", emit=6.0)
    for _ in range(20):
        o = C.sphere((8.5, 20, 2.2), 0.08, sm, seg=6, smooth=False)
        sparks.append((o, rnd.uniform(-2.5, 2.5), rnd.uniform(3, 5), rnd.random()))
    trees = [K.pine(x, 8, -4.3, h, C.mat("#1f2a1f", emit=1.0), C.mat("#1a1414", emit=1.0)) for (x, h) in [(-12.0, 3.0), (-9.5, 2.4), (-6.8, 2.0)]]

    def update(t):
        crater.scale = (1, 1, 1 + 0.4 * math.sin(C.TAU * t * 4))
        for i, f in enumerate(flows):
            f.scale.x = 1.0 + 0.25 * math.sin(C.TAU * (t * 2 + i * 0.3))
        for (o, ph) in puffs:
            k = (t + ph) % 1.0
            o.location = (8.5 - 3.0 * k, 24, 2.6 + 3.2 * k)
            s = 0.6 + 1.6 * k
            o.scale = (s, s, s * 0.8)
        for (o, vx, vz, ph) in sparks:
            k = (t * 2 + ph) % 1.0
            o.location = (8.5 + vx * k, 20, 2.2 + vz * k - 6.0 * k * k)
        K.sway(trees, t, 1.5)

    return update
