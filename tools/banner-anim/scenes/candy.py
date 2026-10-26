"""Cukrová země: lízátka se kývají, bonbóny se mačkají, posypky padají a cukrová vata pluje."""
import math
import random

import bpy

import common as C

rnd = random.Random(9)


def swirl_mat(c1, c2, scale=5.0, name="swirl"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    wave = nt.nodes.new("ShaderNodeTexWave")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    wave.wave_type = "RINGS"
    wave.rings_direction = "Z"
    wave.inputs["Scale"].default_value = scale
    wave.inputs["Distortion"].default_value = 4.0
    wave.inputs["Detail"].default_value = 0.0
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].color = C.rgb(c1)
    ramp.color_ramp.elements[1].color = C.rgb(c2)
    ramp.color_ramp.elements[1].position = 0.5
    nt.links.new(wave.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs[0])
    return m


def stripe_mat(c1, c2, scale=5.0, name="stripe"):
    m = swirl_mat(c1, c2, scale, name)
    for n in m.node_tree.nodes:
        if n.type == "TEX_WAVE":
            n.wave_type = "BANDS"
            n.bands_direction = "Z"
            n.inputs["Distortion"].default_value = 0.0
    return m


def build():
    C.camera((0, -30, 0), (0, 0, 0), ortho=30)
    C.world("#ffe3f1", 0.0)
    C.plane((0, 40, 0), (60, 24), C.gradient_mat([(0.0, "#ffe0ee"), (0.45, "#ffd0e6"), (1.0, "#ffe9f4")], "Y", 1.0))

    def hill(x, y, z, sx, sz, c):
        h = C.sphere((x, y, z), 1.0, C.mat(c, emit=1.0), seg=40, name="hill")
        h.scale = (sx, 3, sz)

    hill(-9, 20, -3.6, 14, 2.6, "#ffc3de")
    hill(9, 20, -3.9, 15, 2.8, "#ffb6d7")
    hill(0, 16, -4.4, 22, 2.8, "#ffaad1")
    C.box((0, 8, -6.2), (40, 6, 4.4), C.mat("#ffd9ea", emit=1.0), name="ground")

    # lízátka
    stick_m = C.mat("#ffffff", emit=1.0)
    pops = []
    for (x, y, h, r, c1, c2) in [(-12.0, 10, 3.6, 1.0, "#ff4f87", "#ffffff"), (-9.2, 12, 2.8, 0.75, "#8a5cff", "#ffffff"), (10.5, 10, 3.4, 1.0, "#ff8a3d", "#ffffff"), (13.0, 12, 2.6, 0.7, "#2fc4a0", "#ffffff"), (-2.0, 14, 2.0, 0.55, "#ff4f87", "#ffd23d")]:
        piv = C.empty((0, 0, 0), "pop")
        C.cylinder((0, 0, h / 2), 0.07, h, stick_m, verts=8).parent = piv
        disc = C.cylinder((0, 0, h + r * 0.4), r, 0.12, swirl_mat(c1, c2, 2.2), verts=48, name="disc")
        disc.rotation_euler = (math.pi / 2, 0, 0)
        disc.parent = piv
        piv.location = (x, y, -4.0)
        pops.append((piv, rnd.random()))

    # cukrové hůlky
    canes = []
    for (x, y, h) in [(-14.0, 11, 3.0), (6.5, 13, 2.6)]:
        piv = C.empty((0, 0, 0), "cane")
        sm = stripe_mat("#ff4f87", "#ffffff", 3.5)
        C.cylinder((0, 0, h / 2), 0.14, h, sm, verts=16).parent = piv
        hook = bpy.data.curves.new("hook", "CURVE")
        hook.dimensions = "3D"
        hook.bevel_depth = 0.14
        hook.bevel_resolution = 4
        sp = hook.splines.new("POLY")
        pts = [(0.5 - 0.5 * math.cos(a), 0, h + 0.5 * math.sin(a)) for a in [i * math.pi / 12 for i in range(13)]]
        sp.points.add(len(pts) - 1)
        for p, (px, py, pz) in zip(sp.points, pts):
            p.co = (px, py, pz, 1.0)
        ho = bpy.data.objects.new("hook", hook)
        bpy.context.collection.objects.link(ho)
        ho.data.materials.append(stripe_mat("#ff4f87", "#ffffff", 3.5))
        ho.parent = piv
        piv.location = (x, y, -4.0)
        canes.append((piv, rnd.random()))

    # bonbóny
    drops = []
    for i in range(18):
        x = rnd.uniform(-15, 15)
        if abs(x) < 5:
            continue
        s = rnd.uniform(0.35, 0.7)
        c = rnd.choice(["#ff4f87", "#8a5cff", "#ffd23d", "#2fc4a0", "#ff8a3d", "#4aa8ff"])
        o = C.sphere((x, rnd.uniform(6, 9), -4.4 - rnd.uniform(0, 0.3)), s, C.mat(c, emit=1.0), seg=20, name="drop")
        o.scale = (1.0, 1.0, 0.75)
        drops.append((o, s, rnd.randint(1, 3), rnd.random()))

    # posypky (padají, smyčka přes celý výškový rozsah)
    sprinkle_cols = ["#ff4f87", "#8a5cff", "#ffd23d", "#2fc4a0", "#ff8a3d", "#4aa8ff", "#ffffff"]
    sp_mats = [C.mat(c, emit=1.0) for c in sprinkle_cols]
    sprinkles = []
    span = 12.0
    for i in range(110):
        x = rnd.uniform(-15, 15)
        z0 = rnd.uniform(0, span)
        o = C.cylinder((x, rnd.uniform(1, 9), 0), 0.035, 0.28, rnd.choice(sp_mats), verts=6, name="sprinkle")
        sprinkles.append((o, x, z0, rnd.randint(1, 2), rnd.random(), rnd.randint(1, 2)))

    # cukrová vata
    cm = C.mat("#ffffff", emit=1.0)
    cm2 = C.mat("#ffe6f2", emit=1.0)
    P = 16.0
    clouds = []
    for n in range(-3, 4):
        for (dx, z, s, m) in [(1.0, 3.5, 1.0, cm), (9.0, 2.4, 0.7, cm2)]:
            parts = []
            for (px, pz, r) in [(-0.9, -0.1, 0.7), (-0.2, 0.25, 0.95), (0.7, 0.1, 0.8), (1.4, -0.1, 0.55)]:
                o = C.sphere((dx + n * P + px * s, 24, z + pz * s), r * s, m, seg=14)
                o.scale.z = 0.65
                parts.append((o, o.location.x))
            clouds.append(parts)
    cloud_span = P * 7

    def update(t):
        for (piv, ph) in pops:
            piv.rotation_euler = (0, math.radians(5) * math.sin(C.TAU * (t + ph)), 0)
        for (piv, ph) in canes:
            piv.rotation_euler = (0, math.radians(2.5) * math.sin(C.TAU * (t * 2 + ph)), 0)
        for (o, s, m, ph) in drops:
            q = 0.72 + 0.1 * math.sin(C.TAU * (t * m + ph))
            o.scale = (1.0 + (0.75 - q) * 0.6, 1.0, q)
        for (o, x, z0, k, ph, m) in sprinkles:
            o.location.z = (z0 - span * k * t) % span - 5.5
            o.location.x = x + 0.4 * math.sin(C.TAU * (t * m + ph))
            o.rotation_euler = (0, C.TAU * (t * k * 2 + ph), 0)
        for parts in clouds:
            for (o, x0) in parts:
                o.location.x = C.wrap(x0 + P * t, cloud_span)

    return update
