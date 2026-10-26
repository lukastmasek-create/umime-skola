"""Oceán: vlny se valí k divákovi, loď se houpe, palmy se kývají a mraky plují."""
import math
import random

import bmesh
import bpy
import numpy as np

import common as C

rnd = random.Random(11)

# (amplituda, kx, ky, celých period za smyčku, fáze)
WAVES = [
    (0.20, 0.10, 0.55, 1, 0.3),
    (0.12, 0.35, 0.80, 2, 1.7),
    (0.08, -0.45, 1.10, 2, 4.1),
    (0.025, 0.9, 1.7, 3, 2.2),
    (0.012, -1.3, 2.4, 3, 5.0),
]


def height(x, y, t):
    h = 0.0
    for (a, kx, ky, m, ph) in WAVES:
        h = h + a * np.sin(kx * x + ky * y + C.TAU * m * t + ph)
    return h


def puff(cx, cz, m, y=70.0, scale=1.0):
    parts = []
    for (dx, dz, r) in [(-3.2, -0.3, 2.0), (-1.4, 0.5, 2.7), (1.1, 0.7, 3.0), (3.3, -0.2, 2.2), (0.2, -0.6, 2.4)]:
        o = C.sphere((cx + dx * scale, y, cz + dz * scale), r * scale, m, seg=20)
        o.scale.z = 0.72
        parts.append(o)
    flat = C.box((cx, y, cz - 1.55 * scale), (9.0 * scale, 4.0 * scale, 0.1), m)
    flat.hide_render = True
    return parts


def build():
    C.camera((0, -24, 2.2), (0, 20, 0.66), lens=35)
    C.world("#a9dcff", 1.0)
    sky = C.plane((0, 90, 20), (400, 140), C.gradient_mat([(0.0, "#d6f0ff"), (0.45, "#a9dcff"), (1.0, "#4aa6ea")], "Y", 1.0))
    sky.name = "sky"
    sky.location.z = 10.0
    sky.scale = (200, 70, 1)

    sun_obj = C.sphere((-16.0, 80, 13.0), 3.6, C.mat("#fffbe0", emit=6.0), seg=32, name="sun")
    C.sun(rot=(math.radians(62), 0, math.radians(-14)), strength=3.5, color="#fff2d6")

    # voda
    nx, ny = 240, 150
    xs = np.linspace(-60, 60, nx)
    ys = np.linspace(-30, 120, ny)
    gx, gy = np.meshgrid(xs, ys)
    verts = np.stack([gx, gy, np.zeros_like(gx)], axis=-1).reshape(-1, 3)
    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            a = j * nx + i
            faces.append((a, a + 1, a + nx + 1, a + nx))
    me = bpy.data.meshes.new("water")
    me.from_pydata(verts.tolist(), [], faces)
    me.update()
    water = bpy.data.objects.new("water", me)
    bpy.context.collection.objects.link(water)
    for p in me.polygons:
        p.use_smooth = True
    wm = C.mat("#2f7fe6", rough=0.18, name="water")
    me.materials.append(wm)
    bsdf = wm.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Specular IOR Level"].default_value = 0.8
    flat_xy = verts[:, :2].copy()

    # ostrov s palmami
    isl = C.sphere((12.5, 26, -0.15), 3.6, C.mat("#f1d27a", rough=0.9), seg=32, name="island")
    isl.scale = (1.0, 0.7, 0.28)
    palms = []
    for (px, py, lean, h) in [(11.6, 25.4, -0.18, 3.6), (13.6, 26.2, 0.2, 3.0)]:
        piv = C.empty((px, py, 0.1), "palm")
        trunk = C.cylinder((px + lean * h / 2, py, 0.1 + h / 2), 0.1, h, C.mat("#8a5a2b", rough=0.9), verts=8, name="trunk")
        trunk.rotation_euler = (0, lean, 0)
        leaves = []
        for k in range(6):
            ang = k * math.tau / 6
            lf = C.cone((px + lean * h, py, 0.1 + h), 0.35, 0.0, 1.9, C.mat("#2fb04e", rough=0.7), verts=4, name="leaf")
            lf.scale = (1.0, 0.25, 1.0)
            leaves.append((lf, ang))
        palms.append((trunk, leaves, px, py, lean, h))

    # loď
    hull = C.box((-9.0, 20, 0.2), (2.6, 0.9, 0.5), C.mat("#e8e1d3", rough=0.6), name="hull")
    bm = bmesh.new()
    v1 = bm.verts.new((0, 0, 0))
    v2 = bm.verts.new((0, 0, 3.2))
    v3 = bm.verts.new((1.5, 0, 0.2))
    bm.faces.new((v1, v3, v2))
    sm = bpy.data.meshes.new("sail")
    bm.to_mesh(sm)
    bm.free()
    sail = bpy.data.objects.new("sail", sm)
    bpy.context.collection.objects.link(sail)
    sm.materials.append(C.mat("#ffffff", rough=0.9))
    sail.location = (-9.2, 19.9, 0.45)
    flag = C.box((-9.2, 20, 3.7), (0.08, 0.08, 0.2), C.mat("#ff5a3c", emit=1.0), name="flag")
    mast = C.cylinder((-9.2, 20, 1.9), 0.05, 3.4, C.mat("#7a5a3a"), verts=6, name="mast")

    # mraky
    cloud_mat = C.mat("#ffffff", emit=0.0, rough=1.0, name="cloud")
    bsdf2 = cloud_mat.node_tree.nodes["Principled BSDF"]
    bsdf2.inputs["Emission Color"].default_value = (1, 1, 1, 1)
    bsdf2.inputs["Emission Strength"].default_value = 0.9
    clouds = []
    P = 36.0
    for n in range(-3, 3):
        for (dx, z, s) in [(5.0, 11.5, 1.0), (24.0, 9.0, 0.7)]:
            parts = puff(dx + n * P, z, cloud_mat, y=70 + (1 if s < 1 else 0), scale=s)
            clouds.append((parts, dx + n * P))
    cloud_span = P * 6

    def update(t):
        h = height(flat_xy[:, 0], flat_xy[:, 1], t)
        co = np.zeros((len(verts), 3), dtype=np.float32)
        co[:, :2] = flat_xy
        co[:, 2] = h
        me.vertices.foreach_set("co", co.ravel())
        me.update()
        # loď
        bx, by = -9.0, 20.0
        hz = float(height(np.array([bx]), np.array([by]), t)[0])
        hz2 = float(height(np.array([bx + 1.0]), np.array([by]), t)[0])
        hz3 = float(height(np.array([bx]), np.array([by + 1.0]), t)[0])
        roll = math.atan2(hz2 - hz, 1.0) * 2.0
        pitch = math.atan2(hz3 - hz, 1.0) * 2.0
        hull.location = (bx, by, 0.1 + hz)
        hull.rotation_euler = (-pitch * 0.6, roll, 0)
        sail.location = (bx - 0.2, by - 0.1, 0.35 + hz)
        sail.rotation_euler = (-pitch * 0.6, roll, 0)
        mast.location = (bx - 0.2, by, 1.8 + hz)
        mast.rotation_euler = (-pitch * 0.6, roll, 0)
        flag.location = (bx - 0.2, by, 3.5 + hz)
        flag.rotation_euler = (-pitch * 0.6, roll, 0)
        # palmy
        for (trunk, leaves, px, py, lean, h) in palms:
            sway = 0.05 * math.sin(C.TAU * t)
            trunk.rotation_euler = (0, lean + sway, 0)
            topx = px + math.sin(lean + sway) * h
            topz = 0.1 + math.cos(lean + sway) * h
            trunk.location = (px + math.sin(lean + sway) * h / 2, py, 0.1 + math.cos(lean + sway) * h / 2)
            for (lf, ang) in leaves:
                droop = 1.1 + 0.12 * math.sin(C.TAU * t + ang)
                lf.location = (topx + math.cos(ang) * 0.8, py + math.sin(ang) * 0.8, topz - 0.15)
                lf.rotation_euler = (math.sin(ang) * droop, -math.cos(ang) * droop, 0)
        # mraky
        shift = P * t
        for (parts, x0) in clouds:
            xx = C.wrap(x0 + shift, cloud_span)
            for o in parts:
                o.location.x = o.location.x  # relativní posun řešíme přes dx níže
        # (pozice částí se přepisují níže)

    # mraky: uložit původní x částí a posouvat je jako celek
    base_x = {id(o): o.location.x for (parts, _) in clouds for o in parts}

    def update_clouds(t):
        shift = P * t
        for (parts, x0) in clouds:
            for o in parts:
                o.location.x = C.wrap(base_x[id(o)] + shift, cloud_span)

    def full(t):
        update(t)
        update_clouds(t)

    return full
