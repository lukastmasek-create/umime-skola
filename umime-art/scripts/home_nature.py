"""3D rendery ozdob přírodní části úvodní stránky: ježek, veverka, slunce, měsíc a světluška.

    blender -b --python umime-art/scripts/home_nature.py -- <výstupní složka> [id]
    python umime-art/scripts/home_nature.py <výstupní složka> [id]

Výstup (PNG 1024 × 1024, průhledné) převede `home_nature_publish.py` do `public/home/`.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import frames as F  # noqa: E402  (mat, studio, lin: stejné fyzikální materiály a studiové světlo)
from frames import lin, mat  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "nature_out"
ONLY = ARGS[1] if len(ARGS) > 1 else None
os.makedirs(OUT, exist_ok=True)


def scene(cam_loc=(0, -7.5, 1.6), look=(0, 0, 1.0), lens=60, samples=96):
    F.reset()
    sc = bpy.context.scene
    sc.cycles.samples = samples
    for o in list(bpy.data.objects):
        if o.type == "CAMERA":
            bpy.data.objects.remove(o)
    cam = bpy.data.cameras.new("c")
    cam.lens = lens
    co = bpy.data.objects.new("c", cam)
    co.location = cam_loc
    bpy.context.collection.objects.link(co)
    co.rotation_euler = (Vector(look) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = co


def sph(loc, r, m, scale=(1, 1, 1), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=32, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def cone(loc, r1, r2, depth, m, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=depth, vertices=verts, location=loc)
    o = bpy.context.active_object
    o.rotation_euler = tuple(math.radians(a) if abs(a) > 6.3 or True else a for a in rot)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def render(name):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("OK", name, flush=True)


def eye(loc, r=0.1):
    sph(loc, r, mat("#16132b", rough=0.1, coat=1.0))
    sph(loc + Vector((0.02, -0.05, 0.035)), r * 0.35, mat("#ffffff", rough=0.1, emit=1.5))


def hedgehog():
    scene(look=(0, 0, 0.75))
    fur = mat("#6b4a2c", rough=0.9)
    belly = mat("#f1dcb8", rough=0.8, subsurface_Weight=0.3)
    spine = mat("#3a2a1c", rough=0.6)
    tip = mat("#a07a4a", rough=0.6)
    # tělo: nízká elipsa, ostny na zádech
    sph((0, 0.1, 0.75), 1.0, fur, (1.25, 1.0, 0.95))
    sph((0.35, -0.55, 0.55), 0.85, belly, (0.95, 0.8, 0.8))
    rnd = random.Random(4)
    for i in range(420):
        # bod na horní půlsféře zad (směr od kamery dozadu)
        u = rnd.uniform(0, 2 * math.pi)
        v = rnd.uniform(0.05, 0.95)
        nx, ny, nz = math.cos(u) * math.sqrt(1 - v * v), math.sin(u) * math.sqrt(1 - v * v) * 0.9 + 0.35, v
        if ny < -0.15 and nz < 0.6:
            continue
        base = Vector((nx * 1.25, 0.1 + ny * 1.0, 0.75 + nz * 0.95))
        d = Vector((nx, ny * 0.9, nz)).normalized()
        o = cone(base + d * 0.12, 0.05, 0.004, 0.46, spine if i % 3 else tip, verts=8)
        o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    # hlava a čumák
    sph((0.0, -0.95, 0.62), 0.55, belly, (1.0, 1.0, 0.9))
    cone((0.0, -1.55, 0.58), 0.38, 0.06, 0.8, belly, verts=32).rotation_euler = (math.radians(90), 0, 0)
    sph((0.0, -1.95, 0.6), 0.12, mat("#16132b", rough=0.2, coat=1.0))
    eye(Vector((-0.28, -1.28, 0.8)), 0.1)
    eye(Vector((0.28, -1.28, 0.8)), 0.1)
    for sx in (-1, 1):
        sph((sx * 0.42, -0.9, 1.05), 0.2, fur, (1, 0.5, 1))
        sph((sx * 0.55, -0.55, 0.12), 0.26, belly, (1, 1.3, 0.55))
        sph((sx * 0.62, 0.6, 0.12), 0.26, belly, (1, 1.3, 0.55))
    render("jezek")


def squirrel():
    scene(look=(0, 0, 1.0), cam_loc=(0, -8.5, 1.8))
    fur = mat("#b8531f", rough=0.85, subsurface_Weight=0.2)
    fur2 = mat("#d9792e", rough=0.85)
    belly = mat("#f6e2c4", rough=0.8)
    dark = mat("#16132b", rough=0.2, coat=1.0)
    # tělo vsedě, velký ocas za zády
    sph((0, 0.1, 0.9), 0.85, fur, (0.85, 0.85, 1.15))
    sph((0, -0.45, 0.8), 0.6, belly, (0.8, 0.45, 1.0))
    sph((0, -0.15, 2.0), 0.62, fur, (1, 1, 0.95))
    sph((0, -0.55, 1.8), 0.32, belly, (1, 0.7, 0.7))
    sph((0, -0.82, 1.92), 0.09, dark)
    eye(Vector((-0.27, -0.6, 2.12)), 0.1)
    eye(Vector((0.27, -0.6, 2.12)), 0.1)
    for sx in (-1, 1):
        c = cone((sx * 0.36, -0.05, 2.7), 0.2, 0.02, 0.55, fur, verts=24)
        c.rotation_euler = (math.radians(-8), math.radians(sx * 12), 0)
        sph((sx * 0.38, -0.12, 2.62), 0.07, belly, (1, 0.4, 1.4))
        sph((sx * 0.5, -0.4, 0.15), 0.3, fur2, (1, 1.5, 0.5))
    # ocas: řetěz zvětšujících se koulí do tvaru S
    for k in range(9):
        t = k / 8
        x = math.sin(t * 2.4) * 0.35
        y = 0.7 + t * 0.55
        z = 0.5 + t * 2.1
        sph((x, y, z), 0.3 + 0.22 * math.sin(t * math.pi) + 0.1 * t, fur if k % 2 else fur2, (1.1, 0.9, 1.2))
    # žalud v packách
    sph((0.0, -0.78, 1.05), 0.2, mat("#c08a3e", rough=0.4, coat=0.6), (1, 1, 1.2))
    sph((0.0, -0.78, 1.25), 0.2, mat("#6b4a2a", rough=0.7), (1.05, 1.05, 0.55))
    for sx in (-1, 1):
        sph((sx * 0.18, -0.75, 1.1), 0.14, fur2)
    render("veverka")


def sun():
    scene(look=(0, 0, 0), cam_loc=(0, -13, 0), lens=70)
    glow = mat("#ffd24d", rough=0.3, emit=2.2, emit_color="#ffb020")
    sph((0, 0, 0), 1.35, mat("#ffcf40", rough=0.25, emit=1.2, emit_color="#ffb52a", coat=0.5))
    for k in range(14):
        a = k * 2 * math.pi / 14
        d = Vector((math.cos(a), 0, math.sin(a)))
        c = cone(d * 2.0, 0.3, 0.02, 0.95 if k % 2 else 0.7, glow, verts=20)
        c.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    for sx in (-1, 1):
        eye(Vector((sx * 0.45, -1.25, 0.25)), 0.14)
        sph((sx * 0.8, -1.05, -0.2), 0.2, mat("#ff9a6b", rough=0.6, emit=0.4), (1, 0.4, 0.7))
    # úsměv: půlkruh z korálků
    for k in range(9):
        a = math.radians(205 + k * 16)
        sph((math.cos(a) * 0.55, -1.3, -0.15 + math.sin(a) * 0.4), 0.06, mat("#7a3b10", rough=0.4))
    render("slunce")


def moon():
    scene(look=(0, 0, 0), cam_loc=(0, -11, 0), lens=70)
    # srpek: koule bez posunuté koule (boolean)
    m = mat("#e8e2b8", rough=0.55, emit=0.12, emit_color="#fff4c8", subsurface_Weight=0.2)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.6, segments=96, ring_count=48, location=(0, 0, 0))
    a = bpy.context.active_object
    a.data.materials.append(m)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.5, segments=96, ring_count=48, location=(0.8, -0.35, 0.25))
    b = bpy.context.active_object
    mod = a.modifiers.new("b", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = b
    b.hide_render = True
    b.hide_viewport = True
    bpy.context.view_layer.objects.active = a
    bpy.ops.object.modifier_apply(modifier="b")
    bpy.ops.object.shade_smooth()
    rnd = random.Random(2)
    crat = mat("#d8d2b0", rough=0.9)
    for _ in range(7):
        ang = rnd.uniform(math.radians(120), math.radians(250))
        r = rnd.uniform(1.0, 1.45)
        sph((math.cos(ang) * r, -1.5, math.sin(ang) * r), rnd.uniform(0.09, 0.2), crat, (1, 0.3, 1))
    sph((-0.85, -1.3, 0.35), 0.1, mat("#16132b", rough=0.2, coat=1.0), (1, 0.7, 1))
    sph((-0.75, -1.35, -0.1), 0.1, mat("#ff9a6b", rough=0.6), (1.4, 0.4, 0.8))
    for s in range(14):  # hvězdičky kolem
        a2 = rnd.uniform(0, 2 * math.pi)
        r2 = rnd.uniform(2.1, 2.9)
        sph((math.cos(a2) * r2, 0, math.sin(a2) * r2), rnd.uniform(0.04, 0.09), mat("#fff6c8", emit=6.0))
    render("mesic")


def firefly():
    scene(look=(0, 0, 0), cam_loc=(0, -6, 0.3), lens=70)
    dark = mat("#2a2236", rough=0.4)
    glow = mat("#fff6a8", rough=0.2, emit=4.0, emit_color="#ffe65a")
    sph((0, 0, 0.6), 0.28, dark, (1, 1.2, 1))
    sph((0, 0, 1.0), 0.22, dark)
    sph((0, 0.0, -0.1), 0.34, glow, (1, 1.1, 1.25))
    eye(Vector((-0.1, -0.2, 1.05)), 0.06)
    eye(Vector((0.1, -0.2, 1.05)), 0.06)
    wing = mat("#dff0ff", rough=0.1, transmission=0.8)
    for sx in (-1, 1):
        sph((sx * 0.5, 0.15, 0.95), 0.34, wing, (1.3, 0.06, 0.65), rot=(0, sx * 25, 0))
    for sx in (-1, 1):
        sph((sx * 0.15, -0.15, 1.45), 0.05, dark, (0.4, 0.4, 2.4), rot=(0, sx * 25, 0))
    render("svetluska")


ITEMS = dict(jezek=hedgehog, veverka=squirrel, slunce=sun, mesic=moon, svetluska=firefly)

if __name__ == "__main__":
    for k, fn in ITEMS.items():
        if ONLY and ONLY != k:
            continue
        fn()
