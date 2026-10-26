"""Les: stromy se kývají ve větru, květiny se houpou, plují mraky a poletují motýli."""
import math
import random

import bpy

import common as C

rnd = random.Random(5)


def tree_pine(m_leaf, m_trunk, s):
    parts = []
    parts.append(C.cylinder((0, 0, 0.5 * s), 0.22 * s, 1.0 * s, m_trunk, verts=8, name="trunk"))
    for (z, r, h) in [(1.1, 1.5, 1.9), (2.2, 1.2, 1.7), (3.2, 0.85, 1.5)]:
        parts.append(C.cone((0, 0, z * s + 0.4 * s), r * s, 0.0, h * s, m_leaf, verts=10, name="pine"))
    return parts


def tree_round(m_leaf, m_trunk, s):
    parts = [C.cylinder((0, 0, 0.8 * s), 0.25 * s, 1.6 * s, m_trunk, verts=8, name="trunk")]
    for (dx, dz, r) in [(0, 2.7, 1.5), (-0.9, 2.3, 1.1), (0.9, 2.4, 1.1)]:
        parts.append(C.sphere((dx * s, 0, dz * s), r * s, m_leaf, seg=14, name="crown"))
    return parts


def build():
    C.camera((0, -24, 3.0), (0, 20, 1.55), lens=35)
    C.world("#d9f3e6", 1.0)
    sky = C.plane((0, 150, 30), (900, 200), C.gradient_mat([(0.0, "#e8f7df"), (0.4, "#c9f0db"), (1.0, "#9fdcf0")], "Y", 1.0))
    sky.scale = (450, 80, 1)
    sky.location.z = 28
    C.sun(rot=(math.radians(55), 0, math.radians(30)), strength=3.2, color="#fff4dc")

    # země a vzdálené kopce
    ground = C.plane((0, 40, 0), (400, 300), C.mat("#58cf55", rough=1.0, name="grass"), rot=(0, 0, 0))
    for (x, y, sx, sz, col) in [(-30, 85, 50, 6, "#b3e8a8"), (25, 95, 60, 7, "#a0e09a"), (0, 70, 70, 4, "#7fd68a")]:
        h = C.sphere((x, y, 0), 1.0, C.mat(col, emit=1.0), seg=32, name="hill")
        h.scale = (sx, 20, sz)

    m_trunk = C.mat("#7a4f2a", rough=0.9)
    greens = [C.mat(c, rough=0.8) for c in ["#1f9a4a", "#26a85a", "#198a40", "#34b565"]]
    trees = []
    placed = 0
    while placed < 90:
        side = rnd.choice([-1, 1])
        x = side * rnd.uniform(8, 38) if rnd.random() < 0.9 else rnd.uniform(-9, 9)
        y = rnd.uniform(14, 60)
        if abs(x) < 11 and y < 45:
            continue
        s = rnd.uniform(0.55, 0.95) * (1.0 + y / 90)
        piv = C.empty((0, 0, 0), "tree")
        parts = (tree_pine if rnd.random() < 0.55 else tree_round)(rnd.choice(greens), m_trunk, s)
        for p in parts:
            p.parent = piv
        piv.location = (x, y, 0)
        trees.append((piv, rnd.random(), rnd.randint(1, 2)))
        placed += 1

    # květiny v popředí
    stem_m = C.mat("#2f9a45", rough=0.9)
    flowers = []
    for i in range(26):
        x = rnd.uniform(-30, 30)
        if abs(x) < 6:
            continue
        y = rnd.uniform(6, 12)
        piv = C.empty((0, 0, 0), "flower")
        st = C.cylinder((0, 0, 0.35), 0.03, 0.7, stem_m, verts=6, name="stem")
        fl = C.sphere((0, 0, 0.75), 0.14, C.mat(rnd.choice(["#ff5a6e", "#ffd23d", "#ffffff", "#ff9ac8"]), emit=0.6), seg=10, name="bloom")
        st.parent = piv
        fl.parent = piv
        piv.location = (x, y, 0)
        flowers.append((piv, rnd.random(), rnd.randint(1, 2)))

    # mraky (periodické, posun o jednu periodu za smyčku)
    cloud_m = C.mat("#ffffff", rough=1.0, name="cloud")
    cb = cloud_m.node_tree.nodes["Principled BSDF"]
    cb.inputs["Emission Color"].default_value = (1, 1, 1, 1)
    cb.inputs["Emission Strength"].default_value = 0.9
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

    # motýli
    butterflies = []
    for (col, cx, cy, cz, ph) in [("#ff7ac8", -8.0, 14.0, 3.2, 0.0), ("#ffd23d", 9.0, 18.0, 3.8, 0.4), ("#7ab8ff", 1.5, 12.0, 2.6, 0.7)]:
        body = C.sphere((0, 0, 0), 0.05, C.mat("#2b1b3a"), seg=8)
        wm = C.mat(col, emit=0.8)
        wl = C.plane((-0.12, 0, 0), (0.3, 0.34), wm)
        wr = C.plane((0.12, 0, 0), (0.3, 0.34), wm)
        butterflies.append((body, wl, wr, cx, cy, cz, ph))

    def update(t):
        for (piv, ph, m) in trees:
            a = math.radians(2.2) * math.sin(C.TAU * (t * m + ph))
            piv.rotation_euler = (a * 0.5, a, 0)
        for (piv, ph, m) in flowers:
            a = math.radians(9) * math.sin(C.TAU * (t * m + ph))
            piv.rotation_euler = (0, a, 0)
        for parts in clouds:
            for (o, x0) in parts:
                o.location.x = C.wrap(x0 + P * t, cloud_span)
        for (body, wl, wr, cx, cy, cz, ph) in butterflies:
            u = C.TAU * (t + ph)
            x = cx + 5.0 * math.sin(u)
            y = cy + 1.5 * math.sin(2 * u)
            z = cz + 0.7 * math.sin(3 * u)
            body.location = (x, y, z)
            f = abs(math.sin(C.TAU * t * 7))
            wl.location = (x - 0.15 * f, y, z)
            wr.location = (x + 0.15 * f, y, z)
            wl.scale = (0.15 * (0.2 + 0.8 * f) + 0.0001, 0.17, 1)
            wr.scale = (0.15 * (0.2 + 0.8 * f) + 0.0001, 0.17, 1)

    return update
