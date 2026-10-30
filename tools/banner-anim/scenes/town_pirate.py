"""Pirátský přístav ve dne: velká loď s plachtami se houpe, racci krouží, vlny se třpytí a mola s domky."""
import math
import random

import common as C
import kit as K

rnd = random.Random(62)


def build():
    K.setup([(0.0, "#d6f0ff"), (0.55, "#9fd8ff"), (1.0, "#4aa6ea")], ambient="#eaf6ff", ambient_strength=0.7, sun_rot=(0.9, 0.1, 0.8))
    cm = K.lit("#ffffff", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.8, 1.0, -6.0), (2.9, 0.7, 9.0)], period=30.0, y=45)
    K.hill(-12, 35, -2.2, 6, 2.6, K.lit("#6caf5c"))
    K.hill(12, 35, -2.4, 7, 2.4, K.lit("#5f9f50"))
    wm = K.wave_mat("#1f8ccc", "#bfeaff", scale=0.8)
    K.water(-1.5, wm, y=6)
    # přístav vpravo
    wood = K.lit("#8a5a2b")
    K.box((11.5, 7, -1.3), (7, 2, 0.3), wood)
    for x in range(9, 15, 2):
        K.box((x, 6.2, -2.2), (0.2, 0.2, 2.0), wood)
    for (x, wall, roof) in [(10.0, "#f4e3c0", "#c0392b"), (12.2, "#ffe0a0", "#2e86c1"), (14.2, "#f0d0b0", "#8e44ad")]:
        K.house(x, 9, -1.15, 1.6, 1.6, K.lit(wall), K.lit(roof), C.mat("#5a3a20", emit=1.0), K.lit("#5a3a20"))
    # loď vlevo
    ship = C.empty((0, 0, 0), "ship")
    hull = K.box((0, 0, 0), (6.0, 1.6, 1.3), K.lit("#7a4a22", 0.6))
    hull.parent = ship
    K.box((0, -0.82, 0.1), (6.0, 0.05, 0.25), K.lit("#ffd24d", 0.5)).parent = ship
    K.box((-2.6, 0, 0.75), (1.2, 1.6, 0.6), K.lit("#6a3e1c")).parent = ship
    sails = []
    for dx, h in [(-1.3, 4.0), (1.3, 4.6)]:
        K.box((dx, 0, h / 2), (0.14, 0.14, h), wood).parent = ship
        for k, w in enumerate((2.0, 1.6)):
            sl = K.box((dx, -0.1, h * (0.42 + 0.3 * k)), (w, 0.08, 1.1), K.lit("#fbf6e8", 0.8))
            sl.parent = ship
            sails.append(sl)
    flag = K.box((1.6, 0, 4.9), (0.7, 0.04, 0.4), C.mat("#16132b", emit=1.0))
    flag.parent = ship
    C.sphere((1.6, -0.05, 4.9), 0.1, C.mat("#ffffff", emit=1.5), seg=8).parent = ship
    gulls = []
    gm = K.lit("#ffffff")
    for (cx, cz, r, ph) in [(-3.0, 3.0, 2.6, 0.0), (4.0, 3.6, 2.0, 0.5)]:
        wl = K.box((0, 8, 0), (0.5, 0.04, 0.08), gm)
        wr = K.box((0, 8, 0), (0.5, 0.04, 0.08), gm)
        gulls.append((wl, wr, cx, cz, r, ph))

    def update(t):
        K.move_clouds(clouds, per, t)
        K.wave_phase(wm, t, 2)
        ship.location = (-8.0, 9, -1.4 + 0.15 * math.sin(C.TAU * t * 2))
        ship.rotation_euler = (0, 0.04 * math.sin(C.TAU * t * 2 + 0.7), 0)
        for i, sl in enumerate(sails):
            sl.scale = (1.0, 1.0 + 0.6 * (0.5 + 0.5 * math.sin(C.TAU * (t * 2 + i * 0.2))), 1.0)
        flag.scale.x = 1 + 0.2 * math.sin(C.TAU * t * 4)
        for (wl, wr, cx, cz, r, ph) in gulls:
            a = C.TAU * (t + ph)
            x, z = cx + r * math.cos(a), cz + 0.4 * math.sin(a)
            f = math.radians(25) * math.sin(C.TAU * (t * 8 + ph))
            wl.location = (x - 0.24 * math.cos(f), 8, z + 0.24 * math.sin(f))
            wr.location = (x + 0.24 * math.cos(f), 8, z + 0.24 * math.sin(f))
            wl.rotation_euler = (0, -f, 0)
            wr.rotation_euler = (0, f, 0)

    return update
