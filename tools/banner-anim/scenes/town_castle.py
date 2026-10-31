"""Království: hrad na kopci, pod ním městečko s domky, turnajové prapory vlají a balónek stoupá."""
import math
import random

import common as C
import kit as K
from scenes.castle_day import castle

rnd = random.Random(64)


def build():
    K.setup([(0.0, "#ffe8c8"), (0.5, "#ffc8a0"), (1.0, "#a8c8ff")], ambient="#fff0e0", ambient_strength=0.7, sun_rot=(1.1, 0.2, 1.0), sun_strength=2.4, sun_color="#ffe8c0")
    cm = K.lit("#fff4ea", 0.9)
    clouds, per = K.drifting_clouds(cm, [(3.9, 0.9, -11.0), (3.2, 0.7, 7.0)], period=30.0, y=45)
    K.hill(0, 22, -4.2, 9, 3.2, K.lit("#8fc77a"))
    flags, _ = castle(0, 23, -1.5, 0.6, K.lit("#e8dcc4", 0.8), K.lit("#2e5aa8", 0.6), K.lit("#ffd24d", 0.5))
    K.hill(-10, 26, -5.0, 12, 3.0, K.lit("#9fd08a"))
    K.hill(10, 26, -5.0, 12, 3.0, K.lit("#9fd08a"))
    K.ground(-4.4, K.lit("#86c070"), y=4)
    houses = []
    for i, x in enumerate([-13.8, -12.0, -10.1, -8.2, 8.3, 10.2, 12.1, 13.9]):
        wall = rnd.choice(["#fff0d0", "#ffe0b0", "#f4d8c0", "#ffffff"])
        roof = rnd.choice(["#c0392b", "#d35400", "#8e44ad", "#2e86c1"])
        K.house(x, 8 + (i % 2), -4.4, 1.5, 1.4 + 0.3 * (i % 3), K.lit(wall), K.lit(roof), K.lit("#5a8ad8", 0.2), K.lit("#6a3e1c"))
    banners = []
    for x in (-5.5, -4.0, 4.0, 5.5):
        K.box((x, 6, -3.2), (0.08, 0.08, 2.4), K.lit("#6a3e1c"))
        b = K.box((x + 0.35, 6, -2.4), (0.6, 0.04, 0.9), K.lit(rnd.choice(["#e5484d", "#ffd24d", "#3fc1ff"]), 0.6))
        banners.append(b)
    balloon = C.empty((0, 0, 0), "balloon")
    C.sphere((0, 0, 0.6), 0.6, K.lit("#e5484d", 0.4), seg=20).parent = balloon
    K.box((0, 0, -0.25), (0.3, 0.3, 0.25), K.lit("#8a5a2b")).parent = balloon

    def update(t):
        K.move_clouds(clouds, per, t)
        K.flap(flags, t, 3)
        K.flap(banners, t, 2)
        balloon.location = (9.0 + 0.6 * math.sin(C.TAU * t), 15, 1.2 + 0.5 * math.sin(C.TAU * t))

    return update
