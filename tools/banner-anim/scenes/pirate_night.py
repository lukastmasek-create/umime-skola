"""Pirátská noc: měsíc a hvězdy, loď s lucernou se houpe na vlnách, mraky plují."""
import math
import random

import common as C
import kit as K

rnd = random.Random(5)


def ship(x, z, s):
    piv = C.empty((0, 0, 0), "ship")
    dark = C.mat("#1a1530", emit=1.0)
    hull = K.box((0, 0, 0), (4.2 * s, 1, 1.0 * s), dark)
    hull.parent = piv
    for dx in (-2.1 * s, 2.1 * s):
        b = K.box((dx * 0.95, 0, 0.35 * s), (0.6 * s, 1, 0.6 * s), dark)
        b.parent = piv
    for dx, h in [(-0.9 * s, 3.2 * s), (0.9 * s, 3.8 * s)]:
        K.box((dx, 0, h / 2), (0.1 * s, 0.5, h), dark).parent = piv
        for k, w in enumerate((1.6, 1.3)):
            sl = K.box((dx, 0.1, h * (0.45 + 0.27 * k)), (w * s, 0.1, 0.8 * s), C.mat("#2a2346", emit=1.0))
            sl.parent = piv
    lantern = C.sphere((2.3 * s, -0.4, 0.9 * s), 0.16 * s, C.mat("#ffcf6b", emit=6.0), seg=12)
    lantern.parent = piv
    halo = C.sphere((2.3 * s, 0.4, 0.9 * s), 0.6 * s, C.alpha_mat("#ffc04d", 1.0, 0.25), seg=16)
    halo.parent = piv
    for k in range(4):
        K.box((-1.4 * s + k * 0.9 * s, -0.55, 0.12 * s), (0.2 * s, 0.05, 0.2 * s), C.mat("#ffb84d", emit=3.0)).parent = piv
    piv.location = (x, 10, z)
    return piv, halo


def build():
    K.setup([(0.0, "#1d3a7a"), (0.55, "#0e1a3d"), (1.0, "#070c22")], ambient="#1a2850", ambient_strength=0.3, sun_strength=0)
    moon = C.sphere((-9.5, 50, 3.0), 1.6, C.mat("#fff3c4", emit=3.0), seg=40)
    st = K.stars(60, rnd, zmin=-0.5, zmax=5)
    cm = C.mat("#22305e", emit=1.0)
    clouds, per = K.drifting_clouds(cm, [(3.8, 1.1, 4.0), (2.4, 0.8, -8.0)], period=30.0, y=40)
    wm = K.wave_mat("#0a2a50", "#2a5aa0", scale=0.8)
    K.water(-1.6, wm, y=4)
    sh, halo = ship(6.5, -1.0, 1.0)
    sh2, _ = ship(-13.0, -1.2, 0.55)

    def update(t):
        K.twinkle(st, t, 3)
        K.move_clouds(clouds, per, t)
        K.wave_phase(wm, t, 2)
        sh.location.z = -1.0 + 0.18 * math.sin(C.TAU * t * 2)
        sh.rotation_euler = (0, 0.05 * math.sin(C.TAU * t * 2 + 0.6), 0)
        sh2.location.z = -1.2 + 0.1 * math.sin(C.TAU * t * 2 + 1.4)
        s = 1.0 + 0.2 * math.sin(C.TAU * t * 6)
        halo.scale = (s, s, s)

    return update
