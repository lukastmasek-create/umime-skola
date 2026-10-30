"""Léto: pláž s palmami a slunečníky, slunce svítí, vlny se třpytí, plachetnice a míč na vlnách."""
import math
import random

import common as C
import kit as K

rnd = random.Random(72)


def palm(x, y, z, h):
    piv = C.empty((x, y, z), "palm")
    for k in range(6):
        seg = C.cylinder((0.05 * k * k * 0.1, 0, h * (k + 0.5) / 6), 0.1 - k * 0.008, h / 6, K.lit("#a07040"), verts=7)
        seg.parent = piv
    for k in range(6):
        f = K.box((0.6 * math.cos(k * 1.047), 0.6 * math.sin(k * 1.047), h), (1.3, 0.06, 0.24), K.lit("#3f9a3a"))
        f.rotation_euler = (0, -0.35, k * 1.047)
        f.parent = piv
    piv.location = (x, y, z)
    return piv


def build():
    K.setup([(0.0, "#fff8d8"), (0.45, "#bfeaff"), (1.0, "#4ab0f0")], ambient="#fff8e0", ambient_strength=0.8, sun_rot=(0.9, 0.1, 0.4), sun_strength=3.0)
    sun = C.sphere((-11.0, 55, 3.4), 1.3, C.mat("#fff4b0", emit=4.0), seg=32)
    wm = K.wave_mat("#2aa6d8", "#d8f6ff", scale=0.8)
    K.water(-1.2, wm, y=10)
    sand = K.box((0, 5, -3.9), (80, 8, 4.0), K.lit("#f2d79a", 0.95))
    palms = [palm(-12.5, 6, -1.9, 3.6), palm(-10.4, 7, -1.9, 3.0), palm(12.6, 6, -1.9, 3.8)]
    for (x, col) in [(8.6, "#ff5d73"), (10.8, "#3fc1ff")]:
        C.cylinder((x, 5, -1.0), 0.04, 1.8, K.lit("#ffffff"), verts=6)
        u = C.cone((x, 5, -0.1), 1.0, 0.0, 0.5, K.lit(col, 0.5), verts=8)
    towel = K.box((-6.5, 4.5, -1.92), (1.8, 0.05, 0.1), K.lit("#ffd24d"))
    boat = C.empty((0, 0, 0), "boat")
    K.box((0, 0, 0), (1.6, 0.4, 0.35), K.lit("#ffffff", 0.4)).parent = boat
    sail = C.cone((0.1, 0, 0.9), 0.6, 0.0, 1.4, K.lit("#ff6f5e", 0.5), verts=3)
    sail.scale = (1, 0.1, 1)
    sail.parent = boat
    ball = C.sphere((0, 9, 0), 0.3, K.lit("#ff5d73", 0.4), seg=16)

    def update(t):
        K.wave_phase(wm, t, 2)
        K.sway(palms, t, 3, 1)
        s = 1.0 + 0.04 * math.sin(C.TAU * t * 2)
        sun.scale = (s, s, s)
        boat.location = (C.wrap(-17 + 34 * t + 17, 34), 16, -0.9 + 0.08 * math.sin(C.TAU * t * 3))
        ball.location = (4.5, 9, -1.15 + 0.12 * math.sin(C.TAU * t * 2))
        ball.rotation_euler = (0, C.TAU * t, 0)

    return update
