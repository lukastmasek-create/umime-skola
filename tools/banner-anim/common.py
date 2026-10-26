"""Společné pomůcky pro animované bannery profilu (Blender jako Python modul `bpy`).

Každá scéna je smyčka: `build()` vrátí funkci `update(t)`, kde t je 0..1 (poslední snímek je těsně před 1),
a všechny pohyby jsou periodické, takže se animace plynule opakuje.
"""
import math
import random

import bpy
import bmesh
from mathutils import Vector

W, H = 1200, 400
TAU = math.tau


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    return sc


def rgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


def mat(color, emit=0.0, rough=0.6, name="m"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if emit:
        e = nt.nodes.new("ShaderNodeEmission")
        e.inputs["Color"].default_value = rgb(color) if isinstance(color, str) else color
        e.inputs["Strength"].default_value = emit
        nt.links.new(e.outputs[0], out.inputs[0])
    else:
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        b.inputs["Base Color"].default_value = rgb(color) if isinstance(color, str) else color
        b.inputs["Roughness"].default_value = rough
        nt.links.new(b.outputs[0], out.inputs[0])
    return m


def set_emit_strength(m, v):
    for n in m.node_tree.nodes:
        if n.type == "EMISSION":
            n.inputs["Strength"].default_value = v


def gradient_mat(stops, axis="Z", emit=1.0, name="grad", scale=1.0, offset=0.0):
    """Plochá emisní plocha s barevným přechodem podle souřadnice objektu (stops = [(pozice, '#hex'), ...])."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mp = nt.nodes.new("ShaderNodeMapRange")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs[{"X": 0, "Y": 1, "Z": 2}[axis]], ramp.inputs[0])
    cr = ramp.color_ramp
    while len(cr.elements) > len(stops):
        cr.elements.remove(cr.elements[-1])
    while len(cr.elements) < len(stops):
        cr.elements.new(0.5)
    for el, (p, c) in zip(cr.elements, stops):
        el.position = p
        el.color = rgb(c)
    em.inputs["Strength"].default_value = emit
    nt.links.new(ramp.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs[0])
    return m


def link(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    return obj


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def box(loc, size, m, name="box"):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    return link(o, m)


def sphere(loc, r, m, seg=24, name="sphere", smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, radius=r, segments=seg, ring_count=max(8, seg // 2))
    o = bpy.context.active_object
    o.name = name
    if smooth:
        shade_smooth(o)
    return link(o, m)


def cone(loc, r1, r2, h, m, verts=16, name="cone", smooth=False):
    bpy.ops.mesh.primitive_cone_add(location=loc, radius1=r1, radius2=r2, depth=h, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    if smooth:
        shade_smooth(o)
    return link(o, m)


def cylinder(loc, r, h, m, verts=16, name="cyl"):
    bpy.ops.mesh.primitive_cylinder_add(location=loc, radius=r, depth=h, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    return link(o, m)


def plane(loc, size, m, name="plane", rot=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, 1)
    return link(o, m)


def empty(loc=(0, 0, 0), name="pivot"):
    o = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return o


def parent(child, par):
    child.parent = par
    child.matrix_parent_inverse = par.matrix_world.inverted()


def camera(loc, target, lens=35, ortho=None):
    cam = bpy.data.cameras.new("cam")
    if ortho:
        cam.type = "ORTHO"
        cam.ortho_scale = ortho
    else:
        cam.lens = lens
        cam.sensor_fit = "HORIZONTAL"
        cam.sensor_width = 36
    o = bpy.data.objects.new("cam", cam)
    bpy.context.collection.objects.link(o)
    o.location = loc
    d = Vector(target) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = o
    return o


def sun(rot=(0.9, 0.2, 0.6), strength=3.0, color="#fff4e0", angle=0.1):
    s = bpy.data.lights.new("sun", "SUN")
    s.energy = strength
    s.color = rgb(color)[:3]
    s.angle = angle
    o = bpy.data.objects.new("sun", s)
    bpy.context.collection.objects.link(o)
    o.rotation_euler = rot
    return o


def world(color, strength=1.0):
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = rgb(color)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def wrap(x, span):
    """Zabalí x do intervalu (-span/2, span/2) – pro objekty, co se vrací zleva."""
    return (x + span / 2) % span - span / 2


def render_frames(update, frames, out_dir, samples=24, only=None, res=None):
    sc = bpy.context.scene
    sc.cycles.samples = samples
    if res:
        sc.render.resolution_x, sc.render.resolution_y = res
    import os

    os.makedirs(out_dir, exist_ok=True)
    idx = range(frames) if only is None else only
    for i in idx:
        update(i / frames)
        sc.render.filepath = os.path.join(out_dir, f"f{i:03d}.png")
        bpy.ops.render.render(write_still=True)
        print("frame", i, flush=True)


def alpha_mat(color, strength=1.0, alpha=0.3, name="alpha"):
    """Světélkující poloprůhledná plocha (záře, paprsky)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    em.inputs["Color"].default_value = rgb(color)
    em.inputs["Strength"].default_value = strength
    mix.inputs[0].default_value = 1.0 - alpha
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m
