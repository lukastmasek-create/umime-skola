"""Noční město: okna se rozsvěcují a zhasínají, hvězdy blikají, na věžích pulzují červená světla a letadlo přeletí."""
import math
import random

import bmesh
import bpy

import common as C

rnd = random.Random(7)


def smooth(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def quads_mesh(name, quads, m):
    """Jeden objekt z mnoha čtverečků (x, z, w, h) ve výšce y."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    for (x, y, z, w, h) in quads:
        v = [bm.verts.new((x - w / 2, y, z - h / 2)), bm.verts.new((x + w / 2, y, z - h / 2)), bm.verts.new((x + w / 2, y, z + h / 2)), bm.verts.new((x - w / 2, y, z + h / 2))]
        bm.faces.new(v)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    me.materials.append(m)
    return o


def build():
    C.camera((0, -30, 0), (0, 0, 0), ortho=30)
    C.world("#0b0720", 0.0)
    sky = C.plane((0, 40, 0), (60, 24), C.gradient_mat([(0.0, "#3a1f5e"), (0.36, "#e0628a"), (0.44, "#a8407a"), (0.62, "#40256f"), (1.0, "#120b33")], "Y", 1.0))
    sky.name = "sky"

    # hvězdy
    star_m = C.mat("#ffffff", emit=8.0)
    stars = []
    for i in range(70):
        x, z = rnd.uniform(-15, 15), rnd.uniform(-0.5, 5)
        o = C.sphere((x, 10, z), rnd.uniform(0.025, 0.06), star_m, seg=8, smooth=False)
        stars.append((o, rnd.randint(1, 3), rnd.random()))

    # měsíc
    moon = C.sphere((-11.0, 8, 3.6), 0.75, C.mat("#fff5d6", emit=3.0), seg=32, name="moon")
    halo = C.sphere((-11.0, 9, 3.6), 1.5, C.mat("#a58bff", emit=0.5), seg=32, name="halo")

    # budovy ve dvou vrstvách (zadní světlejší, přední tmavá)
    body_back = C.mat("#2c1d5c", emit=1.0)
    body_front = C.mat("#150e33", emit=1.0)
    lit_m = C.mat("#ffd98a", emit=2.2)
    static_quads, flick = [], []
    base = -3.2
    towers = []
    for layer, (mat_body, yoff, hmin, hmax, wmin, wmax, lit_p) in enumerate([(body_back, 3.0, 1.4, 4.6, 0.8, 1.8, 0.4), (body_front, 0.0, 0.8, 3.8, 0.9, 2.2, 0.5)]):
        x = -16.5
        while x < 16.5:
            w, h = rnd.uniform(wmin, wmax), rnd.uniform(hmin, hmax)
            cx = x + w / 2
            o = C.box((cx, yoff, base + h / 2 - 1.0), (w, 0.5, h + 2.0), mat_body, name="bld")
            cols, rows = int(w / 0.3), int(h / 0.42)
            for c in range(cols):
                for r in range(rows):
                    wx = cx - w / 2 + (c + 0.5) * (w / cols)
                    wz = base + 0.3 + r * 0.42
                    q = (wx, yoff - 0.27, wz, 0.13, 0.19)
                    p = rnd.random()
                    if p < lit_p * 0.6:
                        static_quads.append(q)
                    elif p < lit_p * 0.6 + 0.34:
                        flick.append((q, p < lit_p * 0.6 + 0.12))
            if h > 3.2 and layer == 0:
                towers.append((cx, base + h + 0.05))
            x += w + rnd.uniform(0.0, 0.15)
    quads_mesh("static_windows", static_quads, lit_m)

    # blikající okna: skupiny po několika oknech, každá s vlastním materiálem
    groups = []
    rnd.shuffle(flick)
    gsize = 5
    for gi in range(0, len(flick), gsize):
        chunk = flick[gi : gi + gsize]
        m = C.mat("#ffd98a", emit=0.0)
        quads_mesh("flick", [q for q, _ in chunk], m)
        s0 = 1 if chunk[0][1] else 0
        a = rnd.uniform(0.02, 0.8)
        b = a + rnd.uniform(0.1, 0.19)
        if b > 0.97:
            b = 0.97
        groups.append((m, s0, a, min(b, 0.98)))

    # černé "pobřeží" dole + silnice
    C.box((0, -0.5, base - 1.2), (40, 2.0, 2.6), C.mat("#07041a", emit=1.0), name="ground")

    # červená světla na věžích
    red_m = C.mat("#ff4a3d", emit=0.0)
    reds = []
    for (x, z) in towers:
        o = C.sphere((x, -0.4, z), 0.07, red_m, seg=10, smooth=False)
        reds.append(o)

    plane_m = C.mat("#ff5d4d", emit=0.0)
    plane_light = C.sphere((0, 9, 4.2), 0.07, plane_m, seg=10, smooth=False)
    plane_white = C.sphere((0.2, 9, 4.2), 0.05, C.mat("#ffffff", emit=7.0), seg=10, smooth=False)

    def level(s0, a, b, t):
        e = 0.025
        k = smooth((t - a) / e) - smooth((t - b) / e)
        return s0 * (1 - k) + (1 - s0) * k

    def update(t):
        for (o, m, ph) in stars:
            s = 0.75 + 0.35 * math.sin(C.TAU * (t * m + ph))
            o.scale = (s, s, s)
        for (m, s0, a, b) in groups:
            C.set_emit_strength(m, 2.6 * level(s0, a, b, t))
        pulse = 0.5 + 0.5 * math.sin(C.TAU * t * 3)
        C.set_emit_strength(red_m, 6.0 * pulse ** 3)
        x = -16 + 32 * t
        plane_light.location.x = x
        plane_white.location.x = x + 0.25
        C.set_emit_strength(plane_m, 7.0 if (t * 12) % 1 < 0.5 else 0.0)

    return update
