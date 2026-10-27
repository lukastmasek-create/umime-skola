"""Společné pomůcky pro render animací úvodní stránky (Blender jako modul bpy).

Spuštění: python umime-art/blender/<skript>.py  (potřebuje balíček bpy, viz BLENDER_ANIM.md)
Snímky se renderují do umime-art/out/<nazev>/ jako PNG s průhledností.
"""
import math
import os
import sys

import bpy
from mathutils import Euler, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "out")


def hex_rgba(h, a=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    # Blender chce lineární barvy
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), a)


def reset(width, height, frames, fps=24, samples=24, name="anim", world=("#b9b4ff", 0.55), view="Standard", look="None"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    sc.cycles.max_bounces = 4
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = view
    sc.view_settings.look = look
    sc.frame_start = 1
    sc.frame_end = frames
    sc.render.fps = fps
    sc.render.filepath = os.path.join(OUT, name, "f_")
    # Měkké okolní světlo, aby stíny nebyly černé (hračkový vzhled jako ostatní grafika webu)
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = hex_rgba(world[0])
    bg.inputs[1].default_value = world[1]
    sc.world = w
    return sc


def material(name, color, roughness=0.45, emission=None, emission_strength=0.0, metallic=0.0, subsurface=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hex_rgba(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    if emission:
        b.inputs["Emission Color"].default_value = hex_rgba(emission)
        b.inputs["Emission Strength"].default_value = emission_strength
    return m


def add_camera(location, target=(0, 0, 0), lens=60, ortho_scale=None):
    cam_data = bpy.data.cameras.new("cam")
    if ortho_scale:
        cam_data.type = "ORTHO"
        cam_data.ortho_scale = ortho_scale
    else:
        cam_data.lens = lens
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = location
    direction = Vector(target) - Vector(location)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


def add_sun(rotation, energy=3.0, color="#fff1dd", angle=0.35):
    d = bpy.data.lights.new("sun", "SUN")
    d.energy = energy
    d.angle = angle
    d.color = hex_rgba(color)[:3]
    o = bpy.data.objects.new("sun", d)
    bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = Euler(rotation)
    return o


def add_area(location, target, energy=200, size=4, color="#ffffff"):
    d = bpy.data.lights.new("area", "AREA")
    d.energy = energy
    d.size = size
    d.color = hex_rgba(color)[:3]
    o = bpy.data.objects.new("area", d)
    bpy.context.scene.collection.objects.link(o)
    o.location = location
    o.rotation_euler = (Vector(target) - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    return o


def link(obj, mat=None, smooth=True):
    bpy.context.scene.collection.objects.link(obj)
    if mat is not None and hasattr(obj.data, "materials"):
        obj.data.materials.append(mat)
    if smooth and obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True
    return obj


def render(update, only_frames=None):
    """Pro každý snímek zavolá update(t), kde t = 0..1 je poloha ve smyčce (poslední snímek
    se nerovná prvnímu, takže smyčka je plynulá), a vyrenderuje ho."""
    sc = bpy.context.scene
    os.makedirs(os.path.dirname(sc.render.filepath), exist_ok=True)
    total = sc.frame_end - sc.frame_start + 1
    frames = only_frames or range(sc.frame_start, sc.frame_end + 1)
    for f in frames:
        sc.frame_set(f)
        update((f - sc.frame_start) / total)
        sc.render.filepath = os.path.join(os.path.dirname(sc.render.filepath), "f_%04d.png" % f)
        bpy.ops.render.render(write_still=True)
        print("frame", f, flush=True)


def args():
    """Argumenty za `--` (např. --preview pro jediný snímek)."""
    return sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
