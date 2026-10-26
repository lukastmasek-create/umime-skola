"""Galaxie: hvězdy plují a blikají, komety přeletí, planety se vznášejí a měsíc obíhá."""
import math
import random

import bpy

import common as C


def fade_mat(color, strength=3.0, name="fade"):
    """Šmouha komety: svítí u hlavy (Z=0), ke špičce (Z=1) mizí do průhledna."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    em = nt.nodes.new("ShaderNodeEmission")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs[2], ramp.inputs[0])
    ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    em.inputs["Color"].default_value = C.rgb(color)
    em.inputs["Strength"].default_value = strength
    nt.links.new(ramp.outputs[0], mix.inputs[0])
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m


def stars(seed, period, count, r_range, colors, zspan=11.0):
    rnd = random.Random(seed)
    base = [(rnd.uniform(0, period), rnd.uniform(-zspan / 2, zspan / 2), rnd.uniform(*r_range), rnd.choice(colors)) for _ in range(count)]
    copies = math.ceil(34 / period) + 1
    span = period * copies
    mats = {c: C.mat(c, emit=8.0, name="star") for c in colors}
    items = []
    for n in range(copies):
        for (x, z, r, c) in base:
            o = C.sphere((0, 10, z), r, mats[c], seg=8, name="star", smooth=False)
            items.append((o, x + n * period - span / 2, rnd.randint(1, 2), rnd.random()))
    return items, span


def build():
    C.camera((0, -30, 0), (0, 0, 0), ortho=30)
    C.world("#05030f", 0.0)
    back = C.plane((0, 40, 0), (60, 24), C.gradient_mat([(0.0, "#04030f"), (0.5, "#0a0728"), (1.0, "#33207f")], "Y", 1.0))
    back.name = "backdrop"

    layers = []
    for seed, period, n, rr in [(1, 5.0, 9, (0.025, 0.045)), (2, 7.5, 10, (0.04, 0.07)), (3, 10.0, 5, (0.07, 0.11))]:
        items, span = stars(seed, period, n, rr, ["#ffffff", "#cfd8ff", "#ffe9a8"])
        layers.append((items, span, period))

    sat = C.sphere((-9.0, 0, -0.3), 1.6, C.gradient_mat([(0.0, "#5a2b18"), (0.35, "#b4693a"), (0.5, "#e0a46c"), (0.7, "#a65a30"), (1.0, "#4a2214")], "Z", 1.0), seg=32, name="saturn")
    bpy.ops.mesh.primitive_torus_add(major_radius=2.45, minor_radius=0.5, major_segments=64, minor_segments=12, location=(-9.0, 0, -0.3))
    ring = bpy.context.active_object
    ring.scale = (1, 1, 0.07)
    C.link(ring, C.mat("#e0c08f", emit=1.4))
    blue = C.sphere((9.4, 0, 0.9), 1.0, C.gradient_mat([(0.0, "#12306e"), (0.5, "#3a7de0"), (1.0, "#12306e")], "Z", 1.0), seg=32, name="blue")
    teal = C.sphere((3.5, 0, -3.0), 0.35, C.gradient_mat([(0.0, "#1b6a6a"), (1.0, "#52c9b0")], "Z", 1.0), seg=24, name="teal")
    moon = C.sphere((0, 0, 0), 0.28, C.mat("#c9c3d8", emit=1.2), seg=16, name="moon")

    tail_m = fade_mat("#bfe3ff", 4.0)
    head_m = C.mat("#ffffff", emit=10.0)
    comets = []
    for (t0, t1, p0, p1) in [(0.04, 0.5, (17.0, 4.2), (-9.0, 0.9)), (0.52, 0.98, (-16.0, 3.6), (8.0, -1.2))]:
        head = C.sphere((0, 5, 0), 0.13, head_m, seg=12, name="cometHead")
        tail = C.cone((0, 5, 0), 0.17, 0.0, 5.5, tail_m, verts=16, name="cometTail")
        comets.append((head, tail, t0, t1, p0, p1))

    def update(t):
        for items, span, period in layers:
            for (o, x0, m, ph) in items:
                o.location.x = C.wrap(x0 + period * t, span)
                s = 0.8 + 0.4 * math.sin(C.TAU * (t * m + ph))
                o.scale = (s, s, s)
        sat.location.z = -0.3 + 0.12 * math.sin(C.TAU * t)
        ring.location.z = sat.location.z
        ring.rotation_euler = (math.radians(20) + 0.04 * math.sin(C.TAU * t), 0.0, math.radians(-18))
        blue.location.z = 0.9 + 0.1 * math.sin(C.TAU * t + 2.0)
        blue.rotation_euler.z = C.TAU * t
        a = C.TAU * t
        moon.location = (-9.0 + 3.4 * math.cos(a), -1.0 * math.sin(a), sat.location.z + 0.9 * math.sin(a))
        teal.location.z = -3.0 + 0.12 * math.sin(C.TAU * t + 4.0)
        for (head, tail, t0, t1, p0, p1) in comets:
            on = t0 <= t <= t1
            head.hide_render = tail.hide_render = not on
            if not on:
                continue
            u = (t - t0) / (t1 - t0)
            x = p0[0] + (p1[0] - p0[0]) * u
            z = p0[1] + (p1[1] - p0[1]) * u
            ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
            ux, uz = -math.cos(ang), -math.sin(ang)  # ocas míří proti směru letu
            head.location = (x, 5, z)
            tail.location = (x + ux * 2.75, 5, z + uz * 2.75)
            tail.rotation_euler = (0, math.atan2(ux, uz), 0)

    return update
