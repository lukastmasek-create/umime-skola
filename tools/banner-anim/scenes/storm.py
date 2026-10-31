"""Bouře: tmavé mraky plují, prší, dvakrát za smyčku blesk, maják otáčí světelným kuželem a moře se vlní."""
import math
import random

import common as C
import kit as K

rnd = random.Random(8)


def build():
    sky = K.setup([(0.0, "#4a5878"), (0.6, "#2a3350"), (1.0, "#141b30")], ambient="#3a4660", ambient_strength=0.5, sun_strength=0)
    cm = C.mat("#3a4562", emit=1.0)
    cm2 = C.mat("#2b3450", emit=1.0)
    clouds, per = K.drifting_clouds(cm, [(4.2, 1.6, 0.0), (3.4, 1.3, 12.0), (4.4, 1.2, -9.0)], period=30.0, y=40)
    clouds2, per2 = K.drifting_clouds(cm2, [(3.0, 1.4, 6.0), (2.6, 1.0, -4.0)], period=30.0, y=35)
    wm = K.wave_mat("#16233d", "#4a6a90", scale=0.8)
    K.water(-1.8, wm, y=4)
    # maják na skále
    rock = K.hill(10.5, 8, -2.4, 3.0, 1.4, C.mat("#1e2436", emit=1.0))
    white = K.lit("#e8e8ee", 0.6)
    redm = K.lit("#c0392b", 0.6)
    for k in range(5):
        C.cylinder((10.5, 8, -1.0 + k * 0.6), 0.45 - k * 0.04, 0.6, white if k % 2 == 0 else redm, verts=16)
    lamp = C.sphere((10.5, 7.5, 2.2), 0.3, C.mat("#fff6c0", emit=8.0), seg=12)
    beam = K.box((10.5 - 3.5, 7.0, 2.2), (7.0, 0.05, 0.5), C.alpha_mat("#fff3b0", 1.4, 0.18))
    for v in beam.data.vertices:
        if v.co.x < 0:
            v.co.z *= 3.0  # kužel se k okraji rozšiřuje
    # blesk
    bolt_m = C.mat("#e8f0ff", emit=10.0)
    bolt = []
    pts = [(-6.0, 5.0), (-6.6, 3.4), (-5.6, 2.6), (-6.8, 0.6), (-6.0, -0.2), (-7.2, -1.6)]
    for (a, b) in zip(pts, pts[1:]):
        cx, cz = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        seg = K.box((cx, 30, cz), (0.14, 0.1, L), bolt_m)
        seg.rotation_euler = (0, math.atan2(b[0] - a[0], b[1] - a[1]), 0)
        bolt.append(seg)
    flash = K.plane((0, -5, 0), (40, 14), C.alpha_mat("#dfe8ff", 1.0, 0.0))
    flash_mat = flash.data.materials[0]
    # déšť
    rain_m = C.alpha_mat("#a8b8d8", 1.2, 0.5)
    drops = []
    for _ in range(90):
        x0 = rnd.uniform(-16, 16)
        o = K.box((x0, rnd.uniform(5, 25), 0), (0.03, 0.03, 0.55), rain_m)
        o.rotation_euler = (0, 0.2, 0)
        drops.append((o, x0, rnd.random(), rnd.choice([3, 4, 5])))

    def update(t):
        K.move_clouds(clouds, per, t)
        K.move_clouds(clouds2, per2, t, speed=2)
        K.wave_phase(wm, t, 3)
        c = math.cos(C.TAU * t)
        beam.scale.x = c
        beam.location.x = 10.5 - 3.5 * c
        lamp.scale = (1 + 0.4 * abs(c),) * 3
        on = (0.10 < t < 0.14) or (0.62 < t < 0.65)
        for s in bolt:
            s.hide_render = not on
        mix = None
        for n in flash_mat.node_tree.nodes:
            if n.type == "MIX_SHADER":
                mix = n
        mix.inputs[0].default_value = 0.75 if on else 1.0
        for (o, x0, ph, sp) in drops:
            k = (ph + t * sp) % 1.0
            o.location = (x0 - 1.5 * k, o.location.y, 6.0 - 12.0 * k)

    return update
