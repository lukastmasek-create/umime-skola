"""Západ slunce: slunce se zhlubuje a vlní, paprsky se pomalu otáčejí, mraky plují, ptáci přeletí a stromy se kývají."""
import math
import random

import bpy

import common as C

rnd = random.Random(3)


def build():
    C.camera((0, -30, 0), (0, 0, 0), ortho=30)
    C.world("#2a1040", 0.0)
    sky = C.plane((0, 40, 0), (60, 24), C.gradient_mat([(0.0, "#ffe27a"), (0.36, "#ffb04d"), (0.52, "#ff6f5e"), (0.8, "#e8456a"), (1.0, "#8a2f7a")], "Y", 1.0))
    sky.name = "sky"

    # paprsky (pomalu se otáčejí kolem slunce)
    sun_c = (1.8, 0, -0.6)
    rays_m = C.alpha_mat("#fff2b0", 1.0, 0.16)
    rays_piv = []
    for k in range(14):
        ang = k * math.tau / 14
        r = C.box((0, 20, 0), (0.55, 0.05, 9.0), rays_m, name="ray")
        r.hide_render = False
        rays_piv.append((r, ang))
    halo = C.sphere((sun_c[0], 18, sun_c[2]), 3.9, C.alpha_mat("#ffe29a", 1.0, 0.3), seg=48, name="halo")
    sun = C.sphere((sun_c[0], 16, sun_c[2]), 2.5, C.mat("#fffbe0", emit=2.4), seg=48, name="sun")

    # kopce a země (ploché emisní siluety)
    def hill(x, y, z, sx, sz, c1, c2):
        h = C.sphere((x, y, z), 1.0, C.gradient_mat([(0.0, c2), (1.0, c1)], "Z", 1.0), seg=48, name="hill")
        h.scale = (sx, 3, sz)
        return h

    hill(-9, 14, -3.3, 14, 2.4, "#c43c68", "#8a2a58")
    hill(10, 14, -3.6, 15, 2.8, "#b8345f", "#7e2658")
    hill(-2, 9, -4.6, 22, 3.2, "#8e2a5c", "#5c1f4f")
    hill(12, 7, -4.8, 12, 2.6, "#7a2458", "#4d1a4a")
    C.box((0, 5, -5.8), (40, 3, 3.6), C.mat("#2c1040", emit=1.0), name="ground")

    # stromy na kopcích
    leaf_m = C.mat("#4d1a4a", emit=1.0)
    trunk_m = C.mat("#3a1440", emit=1.0)
    trees = []
    for (x, base) in [(-12.5, -1.1), (-10.8, -1.4), (-4.0, -2.2), (7.5, -1.5), (9.2, -1.9), (13.0, -2.0)]:
        piv = C.empty((0, 0, 0), "tree")
        C.cylinder((0, 0, 0.45), 0.08, 0.9, trunk_m, verts=6).parent = piv
        C.sphere((0, 0, 1.3), 0.6, leaf_m, seg=16).parent = piv
        C.sphere((-0.3, 0, 1.05), 0.4, leaf_m, seg=12).parent = piv
        C.sphere((0.3, 0, 1.05), 0.4, leaf_m, seg=12).parent = piv
        piv.location = (x, 6.5, base)
        trees.append((piv, rnd.random()))

    # mraky
    cm = C.mat("#b8345f", emit=1.0)
    P = 15.0
    clouds = []
    for n in range(-3, 4):
        for (dx, z, s) in [(2.0, 3.4, 1.0), (9.5, 2.2, 0.7)]:
            parts = []
            for (px, pz, r) in [(-0.9, -0.1, 0.7), (-0.2, 0.2, 0.9), (0.7, 0.1, 0.8), (1.4, -0.1, 0.55)]:
                o = C.sphere((dx + n * P + px * s, 12, z + pz * s), r * s, cm, seg=14)
                o.scale.z = 0.62
                parts.append((o, o.location.x))
            clouds.append(parts)
    cloud_span = P * 7

    # ptáci
    bird_m = C.mat("#3a1440", emit=1.0)
    birds = []
    for (z0, ph, sc) in [(3.2, 0.0, 1.0), (2.6, 0.06, 0.8), (3.8, 0.1, 0.65)]:
        body = C.sphere((0, 8, 0), 0.07 * sc, bird_m, seg=8)
        wl = C.box((0, 8, 0), (0.5 * sc, 0.04, 0.06 * sc), bird_m)
        wr = C.box((0, 8, 0), (0.5 * sc, 0.04, 0.06 * sc), bird_m)
        birds.append((body, wl, wr, z0, ph, sc))

    def update(t):
        s = 1.0 + 0.03 * math.sin(C.TAU * t)
        sun.scale = (s, s, s)
        halo.scale = (1.0 + 0.05 * math.sin(C.TAU * t + 1.0),) * 3
        for (r, ang) in rays_piv:
            a = ang + C.TAU * t / 14
            r.location = (sun_c[0] + 6.0 * math.sin(a), 20, sun_c[2] + 6.0 * math.cos(a))
            r.rotation_euler = (0, a, 0)
        for (piv, ph) in trees:
            piv.rotation_euler = (0, math.radians(2.5) * math.sin(C.TAU * (t * 2 + ph)), 0)
        for parts in clouds:
            for (o, x0) in parts:
                o.location.x = C.wrap(x0 + P * t, cloud_span)
        for (body, wl, wr, z0, ph, sc) in birds:
            x = -17 + 34 * ((t + ph) % 1.0) * 1.0
            z = z0 + 0.35 * math.sin(C.TAU * (t * 2 + ph))
            body.location = (x, 8, z)
            f = math.radians(32) * math.sin(C.TAU * (t * 16 + ph))
            L = 0.25 * sc
            wl.location = (x - L * math.cos(f), 8, z + L * math.sin(f))
            wr.location = (x + L * math.cos(f), 8, z + L * math.sin(f))
            wl.rotation_euler = (0, -f, 0)
            wr.rotation_euler = (0, f, 0)

    return update
