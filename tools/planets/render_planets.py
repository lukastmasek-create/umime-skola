"""Planety pro mapu Základny (public/base/planets/<id>.webp, 256x256, průhledné pozadí).

Spuštění: python render_planets.py mercury jupiter titan   (potřebuje modul bpy a Pillow)
"""
import math
import os
import sys

import bpy
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "base", "planets")


def rgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


def ramp(nt, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    cr = r.color_ramp
    while len(cr.elements) < len(stops):
        cr.elements.new(0.5)
    for el, (p, c) in zip(cr.elements, stops):
        el.position = p
        el.color = rgb(c)
    return r


PLANETS = {
    # id: (jak se barví, hrubost krátérů/pruhů)
    "mercury": "craters",
    "jupiter": "bands",
    "titan": "haze",
}


def material(kind):
    m = bpy.data.materials.new("planet")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.85
    tc = nt.nodes.new("ShaderNodeTexCoord")
    if kind == "craters":
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.inputs["Scale"].default_value = 9.0
        vor.feature = "DISTANCE_TO_EDGE"
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 5.0
        noise.inputs["Detail"].default_value = 6.0
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "FLOAT"
        mix.inputs[0].default_value = 0.55
        nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
        nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        nt.links.new(vor.outputs["Distance"], mix.inputs[2])
        nt.links.new(noise.outputs["Fac"], mix.inputs[3])
        r = ramp(nt, [(0.18, "#6f6760"), (0.4, "#a39a90"), (0.7, "#c9c2b6")])
        nt.links.new(mix.outputs[0], r.inputs[0])
        nt.links.new(r.outputs[0], bsdf.inputs["Base Color"])
    elif kind == "bands":
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = "Z"
        wave.inputs["Scale"].default_value = 2.4
        wave.inputs["Distortion"].default_value = 1.6
        wave.inputs["Detail"].default_value = 1.0
        wave.inputs["Detail Scale"].default_value = 1.2
        r = ramp(nt, [(0.0, "#b5683a"), (0.35, "#e3b98a"), (0.65, "#f4e4c8"), (1.0, "#c98852")])
        nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
        nt.links.new(wave.outputs["Fac"], r.inputs[0])
        nt.links.new(r.outputs[0], bsdf.inputs["Base Color"])
    else:  # haze
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 3.0
        noise.inputs["Detail"].default_value = 3.0
        r = ramp(nt, [(0.35, "#d98a2b"), (0.55, "#e8a64a"), (0.8, "#f2c373")])
        nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        nt.links.new(noise.outputs["Fac"], r.inputs[0])
        nt.links.new(r.outputs[0], bsdf.inputs["Base Color"])
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m


def render(pid):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.view_settings.view_transform = "Standard"
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 512
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32)
    sph = bpy.context.active_object
    sph.rotation_euler = (math.radians(12), 0, math.radians(-18))
    for p in sph.data.polygons:
        p.use_smooth = True
    sph.data.materials.append(material(PLANETS[pid]))
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = rgb("#2a2550")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    sc.world = w
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 4.2
    so = bpy.data.objects.new("sun", sun)
    bpy.context.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-35))
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 2.95
    co = bpy.data.objects.new("c", cam)
    bpy.context.collection.objects.link(co)
    co.location = (0, -6, 0)
    co.rotation_euler = (math.pi / 2, 0, 0)
    sc.camera = co
    tmp = f"/tmp/planet_{pid}.png"
    sc.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    im = Image.open(tmp).convert("RGBA").resize((256, 256), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, f"{pid}.webp"), quality=88, method=6)
    print("planet", pid)


if __name__ == "__main__":
    for pid in sys.argv[1:] or PLANETS:
        render(pid)
