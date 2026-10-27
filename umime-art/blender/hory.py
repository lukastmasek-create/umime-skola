"""Tři vrstvy hor pro paralaxu (zadní, střední, přední). Každá je samostatný PNG s průhledností."""
import random
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

PREVIEW = "--preview" in args()
W, H, SCALE = 1760, 480, 100  # px na jednotku
LAYERS = {
    # název: (počet, výška od-do, poloměr/výška, barva, barva sněhu, výška sněhové čáry, seed, spodek)
    "zadni": (9, (3.0, 3.8), 0.62, "#5a35b8", "#efeaff", 0.34, 11, -1.2),
    "stredni": (12, (2.4, 3.2), 0.6, "#3b1d8a", "#e2dcfb", 0.3, 23, -1.6),
    "predni": (16, (1.4, 2.0), 0.7, "#1d1046", "#9d92d6", 0.14, 37, -1.9),
}


def peak_material(color, snow, line):
    m = bpy.data.materials.new("hora")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.85
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 7.0; noise.inputs["Detail"].default_value = 4
    add = nt.nodes.new("ShaderNodeMath"); add.operation = "MULTIPLY_ADD"; add.inputs[1].default_value = 0.28
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].color = hex_rgba(color)
    el = ramp.color_ramp.elements.new(line)
    ramp.color_ramp.elements[1].position = 0.5
    ramp.color_ramp.elements[1].color = hex_rgba(snow)
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    # lokální z (od -0.5 do 0.5 depth) + šum -> práh sněhu
    nt.links.new(noise.outputs["Fac"], add.inputs[0])
    sub = nt.nodes.new("ShaderNodeMath"); sub.operation = "ADD"
    nt.links.new(sep.outputs["Z"], sub.inputs[0]); nt.links.new(add.outputs[0], sub.inputs[1])
    thr = nt.nodes.new("ShaderNodeMath"); thr.operation = "GREATER_THAN"; thr.inputs[1].default_value = 0.0
    nt.links.new(sub.outputs[0], thr.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = hex_rgba(color)
    mix.inputs[7].default_value = hex_rgba(snow)
    nt.links.new(thr.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m, thr, sub


def build(name):
    count, (h0, h1), ratio, color, snow, line, seed, base = LAYERS[name]
    sc = reset(W, H, 1, samples=28, name=f"hory_{name}")
    rnd = random.Random(seed)
    sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0.18
    span = W / SCALE
    for i in range(count):
        x = -span / 2 + (i + rnd.uniform(0.15, 0.85)) * span / count
        h = rnd.uniform(h0, h1)
        sides = rnd.choice((5, 6, 7))
        depth = h + 2.5
        bpy.ops.mesh.primitive_cone_add(vertices=sides, radius1=depth * ratio * 0.85 * rnd.uniform(0.8, 1.35), radius2=0.0, depth=depth, location=(x, rnd.uniform(-0.3, 0.3), base + h - depth / 2))
        o = bpy.context.object
        o.rotation_euler = (0, 0, rnd.uniform(0, math.tau))
        for v in o.data.vertices:  # nepravidelnost
            v.co.x += rnd.uniform(-0.12, 0.12) * h * 0.4
            v.co.y += rnd.uniform(-0.12, 0.12) * h * 0.4
        m, thr, sub = peak_material(color, snow, line)
        # sněhová čára relativně k výšce vrcholu: posun v lokálním z
        thr.inputs[1].default_value = depth / 2 - line * h
        o.data.materials.append(m)
        for p in o.data.polygons: p.use_smooth = False
    # světlo: teplý západ zprava, chladné doplnění zleva
    add_sun((math.radians(78), math.radians(0), math.radians(105)), energy=7.5, color="#ffb27a", angle=0.2)
    add_sun((math.radians(60), math.radians(0), math.radians(-70)), energy=2.4, color="#a9b3ff", angle=0.5)
    add_camera((0, -20, 0.8), (0, 0, 0.8), ortho_scale=span)
    sc.render.pixel_aspect_x = 1
    render(lambda t: None)


if PREVIEW:
    build("stredni")
else:
    for n in LAYERS:
        build(n)
