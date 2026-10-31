"""Pravěk: dinosaurus s dlouhým krkem pomalu kývá hlavou, pterodaktyl letí, kapradiny se vlní a sopka kouří."""
import math
import random

import common as C
import kit as K

rnd = random.Random(79)


def build():
    K.setup([(0.0, "#ffd0a0"), (0.5, "#ffe0b0"), (1.0, "#5ab4e0")], ambient="#fff4e0", ambient_strength=0.7, sun_rot=(1.0, 0.2, 0.8), sun_strength=2.4, sun_color="#ffe0b0")
    C.cone((-9.0, 34, -1.8), 4.6, 0.8, 5.6, K.lit("#8a6a5a"), verts=9)
    puffs = [(C.sphere((-9.0, 35, 1.2), 0.7, K.lit("#c8c0c0"), seg=12), k / 5) for k in range(5)]
    K.hill(0, 30, -5.0, 30, 2.6, K.lit("#7ab060"))
    K.ground(-4.3, K.lit("#6aa050"), y=4)
    green = K.lit("#5aa060", 0.6)
    dino = C.empty((0, 0, 0), "dino")
    body = C.sphere((0, 0, 1.4), 1.3, green, seg=20)
    body.scale = (1.6, 0.9, 0.9)
    body.parent = dino
    for dx in (-1.0, 0.9):
        K.box((dx, 0, 0.5), (0.4, 0.4, 1.2), green).parent = dino
    tail = C.cone((-2.6, 0, 1.4), 0.6, 0.05, 2.6, green, verts=10)
    tail.rotation_euler = (0, -math.pi / 2 + 0.25, 0)
    tail.parent = dino
    neck_piv = C.empty((1.6, 0, 1.9), "neck")
    neck_piv.parent = dino
    neck = K.box((0, 0, 1.4), (0.42, 0.42, 2.8), green)
    neck.parent = neck_piv
    head = C.sphere((0.3, 0, 2.9), 0.42, green, seg=14)
    head.scale = (1.5, 0.9, 0.8)
    head.parent = neck_piv
    C.sphere((0.55, -0.32, 3.0), 0.07, C.mat("#16132b", emit=1.0), seg=6).parent = neck_piv
    for k in range(5):
        C.cone((-0.8 + k * 0.5, 0, 2.6), 0.2, 0.0, 0.4, K.lit("#e8b040"), verts=4).parent = dino
    dino.location = (9.0, 10, -4.3)
    ferns = []
    for x in (-14, -12.5, -11, -6.5, 5.0, 13.5):
        piv = C.empty((x, 6, -4.3), "fern")
        for k in range(5):
            f = C.sphere((0, 0, 0.8), 1.0, K.lit("#5cbf5a", 0.6), seg=10)
            f.scale = (0.22, 0.08, 0.8)
            f.rotation_euler = (0, -0.9 + k * 0.45, 0)
            f.parent = piv
        piv.location = (x, 6, -4.3)
        ferns.append(piv)
    ptero = C.empty((0, 0, 0), "ptero")
    pm = K.lit("#b06a4a", 0.6)
    C.sphere((0, 0, 0), 0.22, pm, seg=10).parent = ptero
    wl = K.box((-0.55, 0, 0), (1.0, 0.04, 0.2), pm)
    wr = K.box((0.55, 0, 0), (1.0, 0.04, 0.2), pm)

    def update(t):
        neck_piv.rotation_euler = (0, 0.15 + 0.15 * math.sin(C.TAU * t), 0)
        for (o, ph) in puffs:
            k = (t + ph) % 1.0
            o.location = (-9.0 + 1.5 * k, 35, 1.2 + 3.0 * k)
            s = 0.6 + 1.2 * k
            o.scale = (s, s, s)
        K.sway(ferns, t, 6, 2)
        x = C.wrap(17 - 34 * t + 17, 34)
        z = 3.2 + 0.3 * math.sin(C.TAU * t * 2)
        ptero.location = (x, 12, z)
        f = 0.6 * math.sin(C.TAU * t * 6)
        wl.location = (x - 0.55 * math.cos(f), 12, z + 0.55 * math.sin(f))
        wr.location = (x + 0.55 * math.cos(f), 12, z + 0.55 * math.sin(f))
        wl.rotation_euler = (0, -f, 0)
        wr.rotation_euler = (0, f, 0)

    return update
