"""Medúzí záře: svítící medúzy pulzují a stoupají temnou vodou, kolem se vznáší plankton."""
import math
import random

import common as C
import kit as K

rnd = random.Random(52)


def jelly(x, z, s, col):
    piv = C.empty((0, 0, 0), "jelly")
    bell = C.sphere((0, 0, 0), 0.8 * s, C.mat(col, emit=2.2), seg=24)
    bell.scale = (1, 1, 0.7)
    bell.parent = piv
    C.sphere((0, 0.5, 0), 1.15 * s, C.alpha_mat(col, 1.0, 0.05), seg=20).parent = piv
    tent = []
    for k in range(5):
        tt = K.box(((k - 2) * 0.28 * s, 0, -0.9 * s), (0.05 * s, 0.05, 1.4 * s), C.alpha_mat(col, 2.0, 0.6))
        tt.parent = piv
        tent.append(tt)
    piv.location = (x, 8, z)
    return piv, bell, tent


def build():
    K.setup([(0.0, "#03081c"), (0.6, "#06122e"), (1.0, "#0d2a5a")], ambient="#0d2a5a", ambient_strength=0.2, sun_strength=0)
    jellies = []
    for (x, col, s, ph) in [(-11.0, "#ff8fe0", 1.1, 0.0), (-6.5, "#78f0ff", 0.8, 0.3), (6.0, "#ffe680", 0.9, 0.6), (10.5, "#9a8cff", 1.2, 0.15), (13.5, "#78f0ff", 0.6, 0.8), (-13.8, "#ffe680", 0.6, 0.5)]:
        piv, bell, tent = jelly(x, 0, s, col)
        jellies.append((piv, bell, tent, x, ph, s))
    plank = K.stars(70, rnd, zmin=-5, zmax=5, y=12, size=(0.03, 0.06), color="#a8f0ff")
    for (o, ph, r) in plank:
        o.location.x = rnd.uniform(-15.5, 15.5)

    def update(t):
        K.twinkle(plank, t, 2)
        for i, (piv, bell, tent, x, ph, s) in enumerate(jellies):
            k = (t + ph) % 1.0
            piv.location = (x + 0.4 * math.sin(C.TAU * (t + ph)), 8, -6.5 + 13.0 * k)
            p = 0.5 + 0.5 * math.sin(C.TAU * (t * 4 + ph))
            bell.scale = (1.0 + 0.12 * p, 1.0 + 0.12 * p, 0.7 - 0.12 * p)
            for j, tt in enumerate(tent):
                tt.rotation_euler = (0, 0.25 * math.sin(C.TAU * (t * 4 + ph + j * 0.2)), 0)

    return update
