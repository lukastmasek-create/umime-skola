"""Duha: duhový oblouk nad kopečky, balónky stoupají, mráčky plují a třpytky září."""
import math
import random

import common as C
import kit as K

rnd = random.Random(80)


def build():
    K.setup([(0.0, "#e8f6ff"), (0.5, "#8ccaff"), (1.0, "#3a9ae8")], ambient="#ffffff", ambient_strength=0.8)
    cols = ["#ff5d73", "#ff9f43", "#ffd24d", "#3ddc97", "#3fc1ff", "#5a6cff", "#a87bff"]
    arcs = []
    for i, col in enumerate(cols):
        r = 11.0 - i * 0.7
        tor = C.cylinder((0, 40 - i * 0.12, -6.0), r, 0.05, C.mat(col, emit=1.3), verts=96)
        tor.rotation_euler = (math.pi / 2, 0, 0)
        arcs.append(tor)
    C.cylinder((0, 39.0, -6.0), 11.0 - 7 * 0.7, 0.05, C.gradient_mat([(0.0, "#e8f4ff"), (1.0, "#d0e8ff")], "Z", 1.0), verts=96).rotation_euler = (math.pi / 2, 0, 0)
    cm = K.lit("#ffffff", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.6, 1.0, -11.0), (2.4, 0.8, 11.0), (4.2, 0.6, 2.0)], period=30.0, y=35)
    K.hill(-9, 26, -5.4, 12, 3.2, K.lit("#a8e890"))
    K.hill(9, 26, -5.4, 12, 3.0, K.lit("#98e080"))
    K.ground(-4.3, K.lit("#8ad870"), y=4)
    balloons = []
    for (x, col, ph) in [(-12.0, "#ff5d73", 0.0), (-9.5, "#ffd24d", 0.3), (9.0, "#3fc1ff", 0.55), (12.5, "#a87bff", 0.8), (-6.5, "#3ddc97", 0.15)]:
        b = C.sphere((x, 8, 0), 0.5, K.lit(col, 0.3), seg=18)
        b.scale = (1, 1, 1.2)
        s = K.box((x, 8, 0), (0.02, 0.02, 1.2), K.lit("#ffffff"))
        balloons.append((b, s, x, ph))
    sp = K.stars(30, rnd, zmin=-2, zmax=4, y=20, size=(0.05, 0.1), color="#fff6a0")

    def update(t):
        K.move_clouds(clouds, per, t)
        K.twinkle(sp, t, 3)
        for (b, s, x, ph) in balloons:
            k = (t + ph) % 1.0
            z = -4.5 + 10.5 * k
            xx = x + 0.3 * math.sin(C.TAU * (t * 2 + ph))
            b.location = (xx, 8, z)
            s.location = (xx, 8, z - 1.2)

    return update
