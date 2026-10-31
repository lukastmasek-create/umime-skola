"""Vesmírná stanice: prstenec stanice se otáčí, planeta s měsícem, raketa prolétá a hvězdy blikají."""
import math
import random

import common as C
import kit as K

rnd = random.Random(61)


def build():
    K.setup([(0.0, "#2a1a5a"), (0.5, "#120c34"), (1.0, "#05061a")], ambient="#3a3080", ambient_strength=0.3, sun_rot=(0.6, 0.0, 1.2), sun_strength=3.0, sun_color="#fff0e0")
    st = K.stars(90, rnd, zmin=-5, zmax=5)
    planet = C.sphere((10.5, 30, -1.5), 4.2, K.lit("#3f7fe0", 0.6), seg=48)
    for k, col in enumerate(["#7ee0b0", "#5aaa6a"]):
        c = C.sphere((10.5 + 1.2 - k * 2.4, 27, -1.0 + k * 1.4), 1.2 + k * 0.4, K.lit(col, 0.7), seg=24)
        c.scale = (1.4, 0.6, 0.8)
    moon = C.sphere((0, 25, 0), 0.7, K.lit("#c8c8d8"), seg=24)
    # stanice: středový válec, prstenec s moduly, solární panely
    st_piv = C.empty((0, 0, 0), "station")
    hub = C.cylinder((0, 0, 0), 0.6, 2.4, K.lit("#e8ecf4", 0.3), verts=20)
    hub.rotation_euler = (math.pi / 2, 0, 0)
    hub.parent = st_piv
    ring = []
    for k in range(10):
        a = k * C.TAU / 10
        m = K.box((3.0 * math.cos(a), 0, 3.0 * math.sin(a)), (0.9, 0.9, 0.9), K.lit("#d8dee8" if k % 2 else "#ffb020", 0.35))
        ring.append(m)
        w = K.box((3.0 * math.cos(a), -0.48, 3.0 * math.sin(a)), (0.3, 0.05, 0.25), C.mat("#8fe8ff", emit=3.0))
        ring.append(w)
        sp = K.box((1.5 * math.cos(a), 0, 1.5 * math.sin(a)), (0.12, 0.12, 0.12), K.lit("#9aa4b8"))
        sp.scale = (1, 1, 1)
        ring.append(sp)
    spokes = []
    for k in range(4):
        a = k * C.TAU / 4
        s = K.box((1.5 * math.cos(a), 0, 1.5 * math.sin(a)), (0.15, 0.15, 3.0), K.lit("#9aa4b8"))
        s.rotation_euler = (0, -a + math.pi / 2, 0)
        spokes.append(s)
    for o in ring + spokes:
        o.parent = st_piv
    for dx in (-1, 1):
        p = K.box((dx * 1.9, 0.5, 0), (2.2, 0.05, 0.9), K.lit("#2a4a9a", 0.2))
        p.parent = st_piv
    st_piv.location = (-8.5, 18, 0.8)
    # raketa
    rk = C.empty((0, 0, 0), "rocket")
    C.cylinder((0, 0, 0), 0.22, 1.1, K.lit("#f4f4f8", 0.3), verts=16).parent = rk
    C.cone((0, 0, 0.75), 0.22, 0.0, 0.45, K.lit("#e5484d", 0.4), verts=16).parent = rk
    flame = C.cone((0, 0, -0.8), 0.18, 0.0, 0.6, C.mat("#ffb020", emit=6.0), verts=12)
    flame.rotation_euler = (math.pi, 0, 0)
    flame.parent = rk
    rk.rotation_euler = (0, math.radians(-70), 0)

    def update(t):
        K.twinkle(st, t, 2)
        st_piv.rotation_euler = (0, C.TAU * t / 2, 0)
        a = C.TAU * t
        moon.location = (10.5 + 6.2 * math.cos(a), 30 - 6.0 * math.sin(a), -1.5 + 1.6 * math.sin(a))
        x = -17 + 34 * ((t * 1.0 + 0.3) % 1.0)
        rk.location = (x, 12, -3.4 + 0.12 * (x + 17))
        flame.scale = (1, 1, 0.8 + 0.4 * abs(math.sin(C.TAU * t * 10)))

    return update
