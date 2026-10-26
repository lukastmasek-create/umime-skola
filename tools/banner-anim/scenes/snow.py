"""Zima: sněží, stromy se pod závanem větru jemně kývají, sněhulák mává šátkem a v dálce plují mraky."""
import math
import random

import bpy

import common as C

rnd = random.Random(21)


def snow_pine(m_leaf, m_snow, m_trunk, s):
    parts = [C.cylinder((0, 0, 0.5 * s), 0.2 * s, 1.0 * s, m_trunk, verts=8, name="trunk")]
    for (z, r, h) in [(1.1, 1.5, 1.9), (2.2, 1.2, 1.7), (3.2, 0.85, 1.5)]:
        parts.append(C.cone((0, 0, z * s + 0.4 * s), r * s, 0.0, h * s, m_leaf, verts=10, name="pine"))
        cap = C.cone((0, 0, z * s + 0.4 * s + 0.2 * s), r * s * 0.8, 0.0, h * s * 0.88, m_snow, verts=10, name="cap")
        parts.append(cap)
    return parts


def build():
    C.camera((0, -24, 3.0), (0, 20, 1.6), lens=35)
    C.world("#e6f2ff", 1.0)
    sky = C.plane((0, 150, 30), (900, 200), C.gradient_mat([(0.0, "#f4f9ff"), (0.4, "#dcecfb"), (1.0, "#a9cdef")], "Y", 1.0))
    sky.scale = (450, 80, 1)
    sky.location.z = 28
    C.sun(rot=(math.radians(50), 0, math.radians(25)), strength=2.6, color="#fff6e8")

    C.plane((0, 40, 0), (400, 300), C.mat("#e9f1fa", rough=1.0, name="snowground"), rot=(0, 0, 0))
    for (x, y, sx, sz, col) in [(-30, 85, 50, 5, "#e9f2fb"), (25, 95, 60, 6, "#e0ecf8"), (0, 70, 70, 3, "#eef5fc")]:
        h = C.sphere((x, y, 0), 1.0, C.mat(col, emit=1.0), seg=32, name="hill")
        h.scale = (sx, 20, sz)

    m_trunk = C.mat("#6b4a2e", rough=0.9)
    m_snow = C.mat("#ffffff", rough=1.0)
    greens = [C.mat(c, rough=0.8) for c in ["#1f7a52", "#25885a", "#1b6c48"]]
    trees = []
    placed = 0
    while placed < 80:
        side = rnd.choice([-1, 1])
        x = side * rnd.uniform(9, 38) if rnd.random() < 0.9 else rnd.uniform(-9, 9)
        y = rnd.uniform(14, 60)
        if abs(x) < 11 and y < 45:
            continue
        s = rnd.uniform(0.55, 0.95) * (1.0 + y / 90)
        piv = C.empty((0, 0, 0), "tree")
        for p in snow_pine(rnd.choice(greens), m_snow, m_trunk, s):
            p.parent = piv
        piv.location = (x, y, 0)
        trees.append((piv, rnd.random(), rnd.randint(1, 2)))
        placed += 1

    # sněhulák vpravo
    sx, sy = 9.5, 9.0
    sn = C.empty((0, 0, 0), "snowman")
    for (z, r) in [(0.55, 0.6), (1.4, 0.45), (2.0, 0.32)]:
        C.sphere((0, 0, z), r, m_snow, seg=20).parent = sn
    nose = C.cone((0, -0.3, 2.0), 0.06, 0.0, 0.35, C.mat("#ff7a1a"), verts=8)
    nose.rotation_euler = (math.pi / 2, 0, 0)
    nose.location = (0, -0.4, 2.0)
    nose.parent = sn
    for ex in (-0.1, 0.1):
        e = C.sphere((ex, -0.28, 2.08), 0.035, C.mat("#15111f"), seg=8)
        e.parent = sn
    hat = C.cylinder((0, 0, 2.38), 0.22, 0.28, C.mat("#1b1730"), verts=14)
    hat.parent = sn
    brim = C.cylinder((0, 0, 2.25), 0.36, 0.04, C.mat("#1b1730"), verts=14)
    brim.parent = sn
    scarf = C.cylinder((0, 0, 1.78), 0.34, 0.1, C.mat("#ff5a3c"), verts=16)
    scarf.parent = sn
    tail = C.box((0.25, -0.3, 1.6), (0.12, 0.05, 0.5), C.mat("#ff5a3c"))
    tail.parent = sn
    sn.location = (sx, sy, 0)
    sn.scale = (1.3, 1.3, 1.3)

    # sníh – každá vločka padá po celém výškovém rozsahu k-krát za smyčku, takže se smyčka hladce uzavírá
    flake_m = C.mat("#ffffff", emit=4.0)
    flakes = []
    for i in range(520):
        y = rnd.uniform(4, 50)
        depth = y + 24
        hw, hh = 0.55 * depth, 0.2 * depth
        x0 = rnd.uniform(-hw, hw)
        z0 = rnd.uniform(-1, 2 * hh)
        span = 2 * hh + 3
        r = rnd.uniform(0.035, 0.075) * (depth / 30)
        o = C.sphere((x0, y, z0), r, flake_m, seg=6, smooth=False)
        flakes.append((o, x0, z0, span, rnd.randint(1, 2), rnd.randint(1, 3), rnd.random(), 0.25 + 0.5 * rnd.random()))

    cloud_m = C.mat("#ffffff", rough=1.0, name="cloud")
    cb = cloud_m.node_tree.nodes["Principled BSDF"]
    cb.inputs["Emission Color"].default_value = (1, 1, 1, 1)
    cb.inputs["Emission Strength"].default_value = 0.8
    clouds, P = [], 40.0
    for n in range(-3, 3):
        for (dx, z, sc) in [(6.0, 14.0, 1.1), (27.0, 11.0, 0.75)]:
            parts = []
            for (px, pz, r) in [(-3.0, -0.3, 2.0), (-1.2, 0.5, 2.6), (1.2, 0.6, 2.9), (3.3, -0.2, 2.1)]:
                o = C.sphere((dx + n * P + px * sc, 80, z + pz * sc), r * sc, cloud_m, seg=16)
                o.scale.z = 0.7
                parts.append((o, o.location.x))
            clouds.append(parts)
    cloud_span = P * 6

    def update(t):
        for (piv, ph, m) in trees:
            a = math.radians(1.6) * math.sin(C.TAU * (t * m + ph))
            piv.rotation_euler = (a * 0.5, a, 0)
        sn.rotation_euler = (0, 0, math.radians(6) * math.sin(C.TAU * t))
        scarf.rotation_euler = (0, 0, 0)
        tail.rotation_euler = (0, math.radians(18) * math.sin(C.TAU * t * 2), 0)
        for (o, x0, z0, span, k, m, ph, amp) in flakes:
            o.location.z = (z0 - span * k * t) % span - 1.0
            o.location.x = x0 + amp * math.sin(C.TAU * (t * m + ph))
        for parts in clouds:
            for (o, x0) in parts:
                o.location.x = C.wrap(x0 + P * t, cloud_span)

    return update
