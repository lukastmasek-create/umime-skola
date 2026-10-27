"""Ikony nových modulů Základny (public/base/icons/<id>.webp, 256x256, průhledné pozadí).

Dlaždice s barevným okrajem podle kategorie a malým modelem navrchu, ve stejném stylu jako ostatní ikony.
Spuštění: python render_icons.py fusion biolab mining dock   (potřebuje modul bpy a Pillow)
"""
import math
import os
import sys

import bpy
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "base", "icons")


def rgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


def mat(color, rough=0.45, metal=0.0, emit=0.0, alpha=1.0):
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgb(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = rgb(color)
        b.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    return m


def put(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def box(loc, size, m, bevel=0.06):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    mod = o.modifiers.new("b", "BEVEL")
    mod.width = bevel
    mod.segments = 3
    return put(o, m)


def cyl(loc, r, h, m, verts=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(location=loc, radius=r, depth=h, vertices=verts, rotation=rot)
    return put(bpy.context.active_object, m)


def cone(loc, r1, r2, h, m, verts=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(location=loc, radius1=r1, radius2=r2, depth=h, vertices=verts, rotation=rot)
    return put(bpy.context.active_object, m)


def sphere(loc, r, m):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, radius=r, segments=32, ring_count=16)
    return put(bpy.context.active_object, m)


def torus(loc, R, r, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=R, minor_radius=r, major_segments=48, minor_segments=16, rotation=rot)
    return put(bpy.context.active_object, m)


def tile(edge):
    box((0, 0, 0.1), (4.3, 4.3, 0.2), mat(edge, 0.5), 0.08)
    box((0, 0, 0.33), (4.0, 4.0, 0.26), mat("#e4e7ee", 0.5), 0.07)
    return 0.46  # výška plochy dlaždice


def build_fusion(z):
    dark, steel, plasma = mat("#4b5262", 0.35, 0.6), mat("#b9c0cc", 0.3, 0.8), mat("#ff8a4a", 0.2, emit=6.0)
    torus((0, 0, z + 1.55), 1.15, 0.38, dark, rot=(math.pi / 2, 0, 0))
    torus((0, 0, z + 1.55), 0.72, 0.1, plasma, rot=(math.pi / 2, 0, 0))
    sphere((0, 0, z + 1.55), 0.34, mat("#ffd9a8", 0.2, emit=5.0))
    for ang in (45, 135, 225, 315):
        x, y = math.cos(math.radians(ang)) * 1.55, math.sin(math.radians(ang)) * 1.55
        box((x, y, z + 0.32), (0.55, 0.55, 0.64), steel, 0.05)
    box((0, 0, z + 0.2), (1.3, 1.6, 0.4), dark, 0.06)


def build_biolab(z):
    glass = mat("#bfeee0", 0.05, alpha=0.35)
    green, soil, steel = mat("#3fbf6a", 0.6), mat("#6b4a2b", 0.8), mat("#b9c0cc", 0.3, 0.7)
    box((0, 0.95, z + 0.35), (3.2, 0.9, 0.7), steel, 0.06)
    for i, x in enumerate((-1.1, 0, 1.1)):
        cyl((x, -0.2, z + 0.9), 0.5, 1.6, glass, 40)
        cyl((x, -0.2, z + 0.2), 0.52, 0.2, steel, 40)
        sphere((x, -0.2, z + 1.75), 0.5, glass)
        for k in range(3):
            cone((x + (k - 1) * 0.18, -0.2 + (k % 2) * 0.1, z + 0.75 + k * 0.1), 0.17, 0.0, 0.6 + 0.15 * (i % 2), green, 12)
        cyl((x, -0.2, z + 0.4), 0.42, 0.18, soil, 32)
    sphere((1.2, 1.0, z + 0.92), 0.22, mat("#7bd9f2", 0.2, emit=1.5))


def build_mining(z):
    steel, dark, ore, orange = mat("#b9c0cc", 0.3, 0.7), mat("#4b5262", 0.4, 0.5), mat("#c9825a", 0.7), mat("#ff8a6b", 0.5)
    box((-0.6, -0.4, z + 0.2), (2.2, 1.8, 0.4), dark, 0.06)
    box((-0.9, -0.4, z + 1.35), (0.35, 0.35, 2.3), orange, 0.04)
    arm = box((0.0, -0.4, z + 2.35), (2.2, 0.32, 0.32), orange, 0.04)
    arm.rotation_euler = (0, math.radians(-10), 0)
    cyl((0.95, -0.4, z + 1.5), 0.12, 1.3, steel, 16)
    cone((0.95, -0.4, z + 0.7), 0.3, 0.0, 0.7, steel, 24, rot=(math.pi, 0, 0))
    for i, (x, y) in enumerate(((1.2, 1.2), (0.3, 1.3), (1.4, 0.35))):
        box((x, y, z + 0.3), (0.65, 0.65, 0.6), ore, 0.07).rotation_euler = (0, 0, 0.3 * i)
    for sx in (-1.4, 1.4):
        cyl((sx, -1.3, z + 0.22), 0.2, 0.45, mat("#ffd24d", 0.4, emit=1.0), 16)


def build_dock(z):
    steel, dark, light = mat("#b9c0cc", 0.3, 0.7), mat("#4b5262", 0.4, 0.5), mat("#9a86f0", 0.3, emit=2.5)
    torus((0, -0.9, z + 1.25), 1.15, 0.2, steel, rot=(math.pi / 2, 0, 0))
    torus((0, -0.9, z + 1.25), 0.95, 0.07, light, rot=(math.pi / 2, 0, 0))
    for sx in (-1.2, 1.2):
        box((sx, -0.9, z + 0.6), (0.35, 0.5, 1.2), dark, 0.05)
    box((0, 0.5, z + 0.12), (2.6, 2.2, 0.12), dark, 0.04)
    # lodička
    body = mat("#f2f4f8", 0.35)
    cyl((0, 0.6, z + 0.55), 0.35, 1.5, body, 32, rot=(math.pi / 2, 0, 0))
    cone((0, -0.3, z + 0.55), 0.35, 0.0, 0.6, mat("#ff5a3c", 0.4), 32, rot=(-math.pi / 2, 0, 0))
    box((0, 0.7, z + 0.55), (1.6, 0.3, 0.06), mat("#9a86f0", 0.4), 0.02)
    for sx in (-1.0, 1.0):
        cyl((sx, 1.3, z + 0.2), 0.12, 0.1, light, 16)


MODULES = {
    "fusion": ("#ffc933", build_fusion),
    "biolab": ("#4aa3d8", build_biolab),
    "mining": ("#ff8a6b", build_mining),
    "dock": ("#9a86f0", build_dock),
}


def render(mid):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    sc.view_settings.view_transform = "Standard"
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 512
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    edge, builder = MODULES[mid]
    z = tile(edge)
    builder(z)
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = rgb("#dfe6f5")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    sc.world = w
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 4.0
    so = bpy.data.objects.new("sun", sun)
    bpy.context.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-40))
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 7.2
    co = bpy.data.objects.new("c", cam)
    bpy.context.collection.objects.link(co)
    co.location = (7, -7, 6.2)
    co.rotation_euler = (math.radians(58), 0, math.radians(45))
    sc.camera = co
    tmp = f"/tmp/baseicon_{mid}.png"
    sc.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    im = Image.open(tmp).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    side = max(im.size)
    canvas = Image.new("RGBA", (side + 24, side + 24), (0, 0, 0, 0))
    canvas.paste(im, ((canvas.width - im.width) // 2, (canvas.height - im.height) // 2))
    canvas = canvas.resize((256, 256), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    canvas.save(os.path.join(OUT, f"{mid}.webp"), quality=88, method=6)
    print("icon", mid)


if __name__ == "__main__":
    for mid in sys.argv[1:] or MODULES:
        render(mid)
