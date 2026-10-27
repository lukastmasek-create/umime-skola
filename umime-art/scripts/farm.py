"""Render grafiky Farmy (stálá hra): plodiny ve třech stádiích, zvířata, ikony surovin a panorama.

    python umime-art/scripts/farm.py <výstupní složka> [skupina]      (skupiny: crops, animals, icons, hero)

Výstup (PNG, průhledné, 256 × 256; panorama 1600 × 520):
    crops/<plodina>_<stadium>.png   stadia 1 (sazenice), 2 (roste), 3 (zralé); každý snímek má i záhon
    soil.png                        prázdný záhon
    animals/<zvíře>.png
    icons/<surovina>.png            ikony plodin a výrobků zvířat
    hero.png                        panorama farmy (nepruhledné)
Na weby je převede `farm_publish.py` do `public/farm/`.
"""

import math
import os
import random
import sys

import bpy

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "farm_out"
GROUP = ARGS[1] if len(ARGS) > 1 else None
ONLY = set(filter(None, os.environ.get("ONLY", "").split(",")))


def want(name):
    return not ONLY or name in ONLY
TAU = math.tau


def rgb(h):
    h = h.lstrip("#")
    return tuple(pow(int(h[i : i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (1.0,)


_mats = {}


def M(color, rough=0.5, emit=0.0, metal=0.0):
    key = (color, rough, emit, metal)
    if key in _mats and _mats[key].name in bpy.data.materials:
        return _mats[key]
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgb(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = rgb(color)
        b.inputs["Emission Strength"].default_value = emit
    _mats[key] = m
    return m


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def sph(loc, r, m, sc=(1, 1, 1), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=32, ring_count=18, location=loc)
    o = bpy.context.active_object
    o.scale = sc
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.data.materials.append(m)
    return smooth(o)


def cyl(loc, r, h, m, rot=(0, 0, 0), verts=32, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, vertices=verts, location=loc)
    o = bpy.context.active_object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.data.materials.append(m)
    return smooth(o)


def cone(loc, r, h, m, rot=(0, 0, 0)):
    return cyl(loc, r, h, m, rot, 24, r2=0.0)


def box(loc, size, m, rot=(0, 0, 0), bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.scale = size
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width = bevel
        bv.segments = 3
    return o


def reset(res=(256, 256), samples=40, transparent=True):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.render.film_transparent = transparent
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.9, 0.93, 1.0, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.8
    sc.world = w
    return sc


def lights(sc, sun=3.6, fill=0.0):
    d = bpy.data.lights.new("s", "SUN")
    d.energy = sun
    d.angle = math.radians(8)
    o = bpy.data.objects.new("s", d)
    sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(50), 0, math.radians(30))
    d2 = bpy.data.lights.new("f", "AREA")
    d2.energy = 120 + fill
    d2.size = 6
    o2 = bpy.data.objects.new("f", d2)
    sc.collection.objects.link(o2)
    o2.location = (-4, -5, 4)
    o2.rotation_euler = (math.radians(60), 0, math.radians(-35))


def camera(sc, loc, target, scale, ortho=True):
    from mathutils import Vector

    cam = bpy.data.objects.new("c", bpy.data.cameras.new("c"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = "ORTHO" if ortho else "PERSP"
    cam.data.ortho_scale = scale
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


def catcher(size=8, z=0.0):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    p = bpy.context.active_object
    p.is_shadow_catcher = True


def render(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("OK", path, flush=True)


# ------------------------------------------------------------------------------------------
# Záhon a plodiny
# ------------------------------------------------------------------------------------------

SOIL = "#6b4429"
GREEN = "#6fbf3a"
DGREEN = "#3f8f2f"


def soil():
    box((0, 0, 0.12), (2.3, 2.3, 0.24), M(SOIL, 0.95), bevel=0.12)
    for i in range(-3, 4):
        box((i * 0.3, 0, 0.27), (0.14, 1.9, 0.07), M("#8a5a38", 0.95), bevel=0.03)
    box((0, 0, 0.02), (2.5, 2.5, 0.06), M("#4f8a2c", 0.9), bevel=0.1)


def leaf_cluster(x, y, k, col=GREEN, n=5, r=0.2, z=0.3):
    for i in range(n):
        a = TAU * i / n
        cone((x + math.cos(a) * 0.12 * k, y + math.sin(a) * 0.12 * k, z + 0.1 * k), 0.06 * k + 0.02, r * k + 0.05, M(col, 0.5),
             rot=(math.degrees(0.9) * math.sin(a), -math.degrees(0.9) * math.cos(a), 0))


K = {1: 0.38, 2: 0.72, 3: 1.0}


def c_wheat(s):
    k = K[s]
    gold = "#e2b84a" if s == 3 else "#9bd05a"
    for gx in (-0.6, -0.3, 0.0, 0.3, 0.6):
        for gy in (-0.55, 0.0, 0.55):
            cyl((gx, gy, 0.3 + 0.35 * k), 0.022, 0.7 * k, M("#c9b44a" if s == 3 else GREEN, 0.6))
            if s >= 2:
                sph((gx, gy, 0.3 + 0.7 * k + 0.05), 0.045, M(gold, 0.5), (1, 1, 3.2))


def c_corn(s):
    k = K[s]
    for gx, gy in ((-0.5, -0.4), (0.4, -0.35), (-0.1, 0.45), (0.6, 0.4), (-0.6, 0.35)):
        cyl((gx, gy, 0.3 + 0.55 * k), 0.05, 1.1 * k, M(DGREEN, 0.5))
        for i in range(3):
            a = TAU * i / 3 + gx
            cone((gx + math.cos(a) * 0.14 * k, gy + math.sin(a) * 0.14 * k, 0.3 + 0.8 * k), 0.07 * k + 0.02, 0.5 * k + 0.1, M(GREEN, 0.5),
                 rot=(70 * math.sin(a), -70 * math.cos(a), 0))
        if s == 3:
            sph((gx + 0.1, gy, 0.3 + 0.7), 0.09, M("#f2c533", 0.4), (1, 1, 2.0))
            cone((gx + 0.1, gy, 0.3 + 0.55), 0.1, 0.25, M(GREEN, 0.5), rot=(180, 0, 0))


def c_carrot(s):
    k = K[s]
    for gx in (-0.65, -0.35, -0.05, 0.25, 0.55):
        for gy in (-0.5, 0.0, 0.5):
            leaf_cluster(gx, gy + 0.05 * math.sin(gx * 9), k, GREEN, 3, 0.32, 0.28)
            if s == 3:
                sph((gx, gy, 0.31), 0.1, M("#f08a24", 0.45), (1, 1, 0.75))


def c_tomato(s):
    k = K[s]
    for gx, gy in ((-0.45, -0.3), (0.45, -0.3), (0.0, 0.45)):
        for i in range(4):
            a = TAU * i / 4
            sph((gx + math.cos(a) * 0.14 * k, gy + math.sin(a) * 0.14 * k, 0.3 + 0.3 * k), 0.2 * k + 0.05, M(DGREEN, 0.5))
        cyl((gx, gy, 0.3 + 0.35 * k), 0.025, 0.7 * k, M("#8a6a3a", 0.7))
        if s == 3:
            for i in range(5):
                a = TAU * i / 5 + gx
                sph((gx + math.cos(a) * 0.28, gy + math.sin(a) * 0.28, 0.45 + 0.1 * (i % 2)), 0.085, M("#e5352b", 0.3))


def c_strawberry(s):
    k = K[s]
    for gx, gy in ((-0.6, -0.5), (0.1, -0.55), (0.65, -0.35), (-0.4, 0.35), (0.3, 0.4), (-0.05, 0.0)):
        sph((gx, gy, 0.32), 0.17 * k + 0.05, M(GREEN, 0.5), (1, 1, 0.55))
        if s == 3:
            for i in range(3):
                a = TAU * i / 3 + gx * 3
                cone((gx + math.cos(a) * 0.15, gy + math.sin(a) * 0.15, 0.34), 0.06, 0.13, M("#e0243a", 0.3), rot=(180, 0, 0))
        elif s == 2:
            sph((gx + 0.05, gy, 0.4), 0.025, M("#fff3e0", 0.5))


def c_pumpkin(s):
    k = K[s]
    for gx, gy in ((-0.45, -0.1), (0.5, 0.15)):
        for i in range(4):
            a = TAU * i / 4 + gx
            cyl((gx + math.cos(a) * 0.4 * k, gy + math.sin(a) * 0.4 * k, 0.3), 0.18 * k + 0.04, 0.02, M(DGREEN, 0.5))
        if s == 2:
            sph((gx, gy, 0.38), 0.14, M("#8bc34a", 0.5), (1, 1, 0.8))
        if s == 3:
            for i in range(6):
                a = TAU * i / 6
                sph((gx + math.cos(a) * 0.1, gy + math.sin(a) * 0.1, 0.56), 0.26, M("#f08a1c", 0.4), (0.42, 0.42, 0.9) if False else (1, 1, 1), rot=(0, 0, 0)).scale = (0.5, 0.5, 0.9) if False else (0.42, 0.42, 0.78)
            sph((gx, gy, 0.55), 0.3, M("#f08a1c", 0.4), (1, 1, 0.82))
            cyl((gx, gy, 0.88), 0.045, 0.14, M("#6b8f2a", 0.6))


def c_potato(s):
    k = K[s]
    for gx, gy in ((-0.5, -0.4), (0.0, -0.45), (0.55, -0.35), (-0.3, 0.35), (0.35, 0.4)):
        for i in range(4):
            a = TAU * i / 4
            sph((gx + math.cos(a) * 0.1 * k, gy + math.sin(a) * 0.1 * k, 0.3 + 0.18 * k), 0.15 * k + 0.04, M(DGREEN, 0.5))
        if s == 3:
            for i in range(2):
                sph((gx + 0.22 + i * 0.1, gy - 0.1 + 0.2 * i, 0.3), 0.08, M("#b98a52", 0.8), (1.2, 0.9, 0.7))


def c_sunflower(s):
    k = K[s]
    for gx, gy in ((-0.5, -0.3), (0.45, -0.35), (0.05, 0.4)):
        h = 1.5 * k + 0.1
        cyl((gx, gy, 0.3 + h / 2), 0.04, h, M(DGREEN, 0.5))
        for sgn in (-1, 1):
            cone((gx + sgn * 0.12, gy, 0.3 + h * 0.45), 0.08, 0.3 * k + 0.05, M(GREEN, 0.5), rot=(0, sgn * 80, 0))
        if s == 3:
            cyl((gx, gy - 0.06, 0.3 + h + 0.02), 0.2, 0.08, M("#5a3a1a", 0.8), rot=(75, 0, 0))
            for i in range(14):
                a = TAU * i / 14
                cone((gx + math.cos(a) * 0.3, gy - 0.1, 0.3 + h + 0.02 + math.sin(a) * 0.3 * 0.95), 0.07, 0.2, M("#ffcc1f", 0.4),
                     rot=(75 + 0, 0, 0)).rotation_euler = (math.radians(75) , math.radians(0), 0)
        elif s == 2:
            sph((gx, gy, 0.3 + h + 0.03), 0.1, M("#8bc34a", 0.5))


def c_apple(s):
    k = K[s]
    cyl((0, 0, 0.3 + 0.5 * k), 0.09 * k + 0.03, 1.0 * k, M("#7a4e2a", 0.8))
    sph((0, 0, 0.3 + 1.0 * k + 0.2), 0.55 * k + 0.1, M("#4caf3a", 0.5))
    if s >= 2:
        sph((0.3 * k, 0.1, 0.3 + 1.0 * k + 0.1), 0.3 * k, M("#59bd44", 0.5))
        sph((-0.3 * k, -0.1, 0.3 + 1.0 * k + 0.15), 0.3 * k, M("#59bd44", 0.5))
    if s == 3:
        for fx, fy, fz in ((0.5, -0.4, 1.45), (-0.5, -0.4, 1.5), (0.0, -0.62, 1.3), (0.3, -0.55, 1.85), (-0.3, -0.55, 1.8), (0.62, -0.1, 1.2), (-0.62, -0.1, 1.25), (0.0, -0.5, 1.05)):
            sph((fx, fy, fz), 0.11, M("#d92b2b", 0.3))
            cyl((fx, fy, fz + 0.1), 0.012, 0.06, M("#6b4a2a"))


def c_grapes(s):
    k = K[s]
    for gx in (-0.8, 0.8):
        cyl((gx, 0, 0.3 + 0.55), 0.05, 1.1, M("#7a4e2a", 0.8))
    cyl((0, 0, 1.4), 0.03, 1.7, M("#7a4e2a", 0.8), rot=(0, 90, 0))
    for i in range(7):
        x = -0.7 + i * 0.23
        sph((x, 0, 1.15 - 0.1 * k + 0.1), 0.22 * k + 0.06, M(DGREEN, 0.5), (1, 0.7, 0.9))
        if s == 3 and i % 2 == 0:
            for row, (zz, nn) in enumerate(((1.0, 3), (0.88, 3), (0.76, 2), (0.65, 1))):
                for j in range(nn):
                    sph((x + (j - (nn - 1) / 2) * 0.115, -0.05, zz), 0.07, M("#6a2c91", 0.25))


CROPS = dict(wheat=c_wheat, corn=c_corn, carrot=c_carrot, tomato=c_tomato, strawberry=c_strawberry,
             pumpkin=c_pumpkin, potato=c_potato, sunflower=c_sunflower, apple=c_apple, grapes=c_grapes)


def scene_sprite(scale=3.6, tilt=58, tz=0.7):
    sc = reset()
    lights(sc)
    camera(sc, (0, -8 * math.cos(math.radians(90 - tilt)) * 1.0, 8 * math.sin(math.radians(90 - tilt)) + 0.3), (0, 0, tz), scale)
    return sc


def do_crops():
    for name, fn in CROPS.items():
        if not want(name):
            continue
        for s in (1, 2, 3):
            scene_sprite()
            soil()
            fn(s)
            render(f"{OUT}/crops/{name}_{s}.png")
    if want("soil"):
        scene_sprite()
        soil()
        render(f"{OUT}/soil.png")


# ------------------------------------------------------------------------------------------
# Zvířata
# ------------------------------------------------------------------------------------------


def eyes(y, z, x=0.12, r=0.045, shine=True):
    for sx in (-1, 1):
        sph((sx * x, y, z), r, M("#16132b", 0.2))
        if shine:
            sph((sx * x + 0.012, y - 0.03, z + 0.02), r * 0.35, M("#ffffff", 0.2))


def a_chicken():
    W = M("#fbfaf5")
    sph((0, 0, 0.55), 0.42, W, (1, 1.15, 1))
    sph((0, -0.38, 0.95), 0.27, W)
    cone((0, -0.62, 0.93), 0.06, 0.14, M("#ff9d1f"), rot=(-90, 0, 0))
    for i in range(3):
        sph(((i - 1) * 0.07, -0.38, 1.22 + 0.02 * (i % 2)), 0.06, M("#e5352b"))
    sph((0, -0.58, 0.82), 0.05, M("#e5352b"))
    eyes(-0.6, 1.0, 0.1, 0.035)
    sph((0, 0.45, 0.62), 0.2, W, (0.7, 1.2, 1.1))
    for sx in (-1, 1):
        cyl((sx * 0.14, -0.05, 0.12), 0.025, 0.25, M("#ff9d1f"))
        box((sx * 0.14, -0.1, 0.02), (0.13, 0.2, 0.03), M("#ff9d1f"), bevel=0.01)


def a_duck():
    Y = M("#ffd83a")
    sph((0, 0, 0.5), 0.42, Y, (1, 1.2, 0.95))
    sph((0, -0.36, 0.92), 0.26, Y)
    sph((0, -0.58, 0.88), 0.11, M("#ff9d1f"), (1.3, 1.4, 0.55))
    eyes(-0.55, 0.98, 0.1, 0.035)
    sph((0, 0.5, 0.58), 0.18, Y, (0.8, 1.1, 1.2))
    for sx in (-1, 1):
        sph((sx * 0.4, 0.03, 0.52), 0.1, M("#f5c321"), (0.4, 1.2, 0.8))
        box((sx * 0.14, -0.08, 0.02), (0.14, 0.22, 0.03), M("#ff9d1f"), bevel=0.01)


def a_sheep():
    F = M("#f7f3ea", 0.9)
    for p in ((0, 0, 0.62), (0.28, 0.05, 0.6), (-0.28, 0.05, 0.6), (0.15, 0.3, 0.55), (-0.15, 0.3, 0.55), (0, -0.2, 0.75), (0, 0.15, 0.85)):
        sph(p, 0.3, F)
    sph((0, -0.5, 0.78), 0.2, M("#3a2f2a", 0.6), (1, 1.1, 1.1))
    eyes(-0.66, 0.82, 0.08, 0.03)
    for sx in (-1, 1):
        sph((sx * 0.22, -0.46, 0.92), 0.08, M("#3a2f2a"), (1.5, 0.6, 0.7))
        cyl((sx * 0.2, 0.05, 0.15), 0.045, 0.3, M("#3a2f2a"))
        cyl((sx * 0.2, 0.3, 0.15), 0.045, 0.3, M("#3a2f2a"))


def a_goat():
    B = M("#f1e2c8", 0.7)
    sph((0, 0.05, 0.62), 0.38, B, (0.9, 1.4, 1))
    sph((0, -0.45, 0.95), 0.22, B, (0.9, 1.1, 1.1))
    sph((0, -0.62, 0.86), 0.12, M("#d9c3a0"), (0.9, 1, 0.8))
    eyes(-0.58, 1.0, 0.09, 0.03)
    for sx in (-1, 1):
        cone((sx * 0.1, -0.42, 1.2), 0.045, 0.25, M("#6b5a43"), rot=(-20, sx * 15, 0))
        sph((sx * 0.22, -0.4, 0.98), 0.07, B, (1.4, 0.5, 0.6))
        cyl((sx * 0.2, 0.3, 0.17), 0.05, 0.34, M("#d9c3a0"))
        cyl((sx * 0.2, -0.2, 0.17), 0.05, 0.34, M("#d9c3a0"))
    cone((0, -0.62, 0.7), 0.04, 0.16, M("#d9c3a0"), rot=(180, 0, 0))


def a_cow():
    W = M("#fbfaf5")
    sph((0, 0.05, 0.75), 0.5, W, (0.95, 1.6, 1))
    sph((0.32, 0.0, 0.88), 0.2, M("#2c2a33"), (1, 1.2, 0.9))
    sph((-0.28, 0.4, 0.8), 0.18, M("#2c2a33"), (1, 1, 1))
    sph((0, -0.7, 1.0), 0.3, W, (0.95, 1.1, 1))
    sph((0, -0.92, 0.9), 0.2, M("#f7b8c4"), (1.1, 0.9, 0.8))
    for sx in (-1, 1):
        sph((sx * 0.06, -1.05, 0.9), 0.025, M("#8a4a5a"))
        cone((sx * 0.2, -0.65, 1.34), 0.05, 0.2, M("#f5e6c4"), rot=(0, sx * 25, 0))
        sph((sx * 0.35, -0.66, 1.14), 0.1, W, (1.5, 0.5, 0.7))
        cyl((sx * 0.28, 0.5, 0.25), 0.075, 0.5, W)
        cyl((sx * 0.28, -0.4, 0.25), 0.075, 0.5, W)
        box((sx * 0.28, 0.5, 0.0), (0.16, 0.18, 0.06), M("#2c2a33"), bevel=0.02)
        box((sx * 0.28, -0.4, 0.0), (0.16, 0.18, 0.06), M("#2c2a33"), bevel=0.02)
    eyes(-0.95, 1.08, 0.13, 0.04)
    cyl((0, 0.85, 0.75), 0.03, 0.6, M("#fbfaf5"), rot=(60, 0, 0))
    sph((0, 1.08, 0.5), 0.07, M("#2c2a33"))


def a_pig():
    P = M("#f7a8b8", 0.5)
    sph((0, 0.05, 0.55), 0.5, P, (1, 1.35, 0.95))
    sph((0, -0.6, 0.65), 0.34, P)
    sph((0, -0.9, 0.58), 0.17, M("#f48aa0"), (1.1, 0.6, 0.9))
    for sx in (-1, 1):
        sph((sx * 0.05, -1.0, 0.58), 0.025, M("#8a3a4a"))
        cone((sx * 0.2, -0.58, 0.98), 0.1, 0.2, M("#f48aa0"), rot=(0, sx * 25, 0))
        cyl((sx * 0.25, 0.4, 0.14), 0.075, 0.28, P)
        cyl((sx * 0.25, -0.3, 0.14), 0.075, 0.28, P)
    eyes(-0.88, 0.78, 0.14, 0.04)
    cyl((0, 0.65, 0.65), 0.025, 0.2, P, rot=(70, 0, 0))


def a_bee():
    Y = M("#ffcf1f")
    sph((0, 0, 0.7), 0.4, Y, (0.9, 1.25, 0.9))
    for dy in (-0.15, 0.1, 0.32):
        cyl((0, dy, 0.7), 0.37 * (1 - abs(dy) * 0.5), 0.1, M("#2c2a33"), rot=(90, 0, 0))
    sph((0, -0.48, 0.78), 0.26, Y)
    eyes(-0.7, 0.84, 0.1, 0.05)
    for sx in (-1, 1):
        sph((sx * 0.35, 0.0, 1.15), 0.2, M("#d9ecff", 0.1), (0.35, 1, 1.2), rot=(0, sx * 20, 0))
        cyl((sx * 0.08, -0.6, 1.05), 0.012, 0.25, M("#2c2a33"), rot=(-20, sx * 10, 0))
    cone((0, 0.58, 0.68), 0.05, 0.2, M("#2c2a33"), rot=(-90, 0, 0))


ANIMALS = dict(chicken=a_chicken, duck=a_duck, sheep=a_sheep, goat=a_goat, cow=a_cow, pig=a_pig, bee=a_bee)


def do_animals():
    for name, fn in ANIMALS.items():
        if not want(name):
            continue
        sc = reset()
        lights(sc)
        camera(sc, (3.0, -6.0, 3.2), (0, 0, 0.55), 2.9)
        catcher(8)
        fn()
        render(f"{OUT}/animals/{name}.png")


# ------------------------------------------------------------------------------------------
# Ikony surovin
# ------------------------------------------------------------------------------------------


def i_wheat():
    for deg in (-16, 0, 16):
        th = math.radians(deg)
        L = 1.1
        cx, cz = math.sin(th) * L / 2, 0.1 + math.cos(th) * L / 2
        cyl((cx, 0, cz), 0.022, L, M("#c9b44a", 0.6), rot=(0, deg, 0))
        for j in range(6):
            d = L - 0.05 - j * 0.085
            sph((math.sin(th) * d, 0, 0.1 + math.cos(th) * d), 0.055, M("#e2b84a", 0.5), (1.2, 1, 1.5), rot=(0, deg, 0))
    cyl((0, 0, 0.35), 0.1, 0.07, M("#c0392b", 0.6))


def i_corn():
    sph((0, 0, 0.5), 0.3, M("#f2c533", 0.4), (1, 1, 1.9))
    for i in range(6):
        a = TAU * i / 6
        cone((math.cos(a) * 0.25, math.sin(a) * 0.25, 0.28), 0.1, 0.8, M("#6fbf3a"), rot=(math.degrees(0.2) * math.sin(a) * 3, -math.degrees(0.2) * math.cos(a) * 3, 0))


def i_carrot():
    cone((0, 0, 0.5), 0.26, 1.05, M("#f08a24", 0.45), rot=(180, 0, 0))
    for i in range(5):
        a = TAU * i / 5
        cone((math.cos(a) * 0.12, math.sin(a) * 0.12, 1.15), 0.07, 0.5, M("#4caf3a"), rot=(math.degrees(0.5) * math.sin(a), -math.degrees(0.5) * math.cos(a), 0))


def i_tomato():
    sph((0, 0, 0.5), 0.45, M("#e5352b", 0.3), (1, 1, 0.88))
    for i in range(5):
        a = TAU * i / 5
        cone((math.cos(a) * 0.12, math.sin(a) * 0.12, 0.93), 0.09, 0.22, M("#4caf3a"), rot=(math.degrees(1.1) * math.sin(a), -math.degrees(1.1) * math.cos(a), 0))


def i_strawberry():
    sph((0, 0, 0.62), 0.42, M("#e0243a", 0.3), (1, 1, 1.05))
    cone((0, 0, 0.3), 0.32, 0.5, M("#e0243a", 0.3), rot=(180, 0, 0))
    for i in range(16):
        a = TAU * i / 16 + (i % 3) * 0.2
        h = 0.3 + (i * 37 % 10) * 0.045
        rr = 0.42 * math.sqrt(max(0.05, 1 - ((h - 0.62) / 0.45) ** 2))
        sph((math.cos(a) * rr * 0.97, -abs(math.sin(a)) * rr * 0.97, h), 0.03, M("#fff3c0", 0.4), (1, 0.6, 1.4))
    for i in range(6):
        a = TAU * i / 6
        cone((math.cos(a) * 0.16, math.sin(a) * 0.16, 1.05), 0.09, 0.26, M("#4caf3a"), rot=(math.degrees(1.1) * math.sin(a), -math.degrees(1.1) * math.cos(a), 0))


def i_pumpkin():
    for i in range(7):
        a = TAU * i / 7
        sph((math.cos(a) * 0.12, math.sin(a) * 0.12, 0.45), 0.4, M("#f08a1c", 0.4), (0.62, 0.62, 0.82))
    sph((0, 0, 0.45), 0.5, M("#f08a1c", 0.4), (1, 1, 0.8))
    cyl((0, 0, 0.92), 0.06, 0.2, M("#6b8f2a", 0.6))


def i_potato():
    sph((0, 0, 0.4), 0.45, M("#b98a52", 0.8), (1.25, 0.95, 0.8), rot=(0, 0, 20))
    for p in ((0.2, 0.3, 0.6), (-0.3, 0.2, 0.55), (0.1, -0.35, 0.6), (-0.2, -0.2, 0.62)):
        sph(p, 0.035, M("#7a5a30"))


def i_sunflower():
    cyl((0, 0, 0.5), 0.3, 0.14, M("#5a3a1a", 0.8), rot=(90, 0, 0))
    for i in range(16):
        a = TAU * i / 16
        sph((math.cos(a) * 0.5, 0, 0.5 + math.sin(a) * 0.5), 0.15, M("#ffcc1f", 0.4), (0.7, 0.3, 1.5), rot=(0, -math.degrees(a) + 90, 0))


def i_apple():
    sph((0, 0, 0.45), 0.5, M("#d92b2b", 0.3), (1, 1, 0.92))
    cyl((0, 0, 0.95), 0.03, 0.2, M("#6b4a2a"))
    sph((0.14, 0, 1.0), 0.14, M("#4caf3a"), (1.4, 0.4, 0.8), rot=(0, -20, 0))


def i_grapes():
    random.seed(8)
    rows = [(0.0, 0.9, 4), (0.0, 0.7, 4), (0.0, 0.5, 3), (0.0, 0.32, 2), (0.0, 0.16, 1)]
    for _, z, n in rows:
        for j in range(n):
            sph(((j - (n - 1) / 2) * 0.2, 0, z), 0.12, M("#6a2c91", 0.25))
    cyl((0, 0, 1.15), 0.02, 0.25, M("#6b4a2a"))
    sph((0.12, 0, 1.2), 0.14, M("#4caf3a"), (1.4, 0.4, 0.8))


def i_egg():
    sph((0, 0, 0.5), 0.36, M("#fbf3e6", 0.3), (1, 1, 1.3))


def i_duckegg():
    sph((0, 0, 0.5), 0.36, M("#cfe8ef", 0.3), (1, 1, 1.3))


def i_milk():
    cyl((0, 0, 0.5), 0.3, 0.8, M("#ffffff", 0.2))
    cyl((0, 0, 0.98), 0.2, 0.18, M("#ffffff", 0.2), r2=0.12)
    cyl((0, 0, 1.12), 0.14, 0.1, M("#3b82f6", 0.3))
    cyl((0, -0.02, 0.5), 0.31, 0.28, M("#3b82f6", 0.3))


def i_wool():
    for p in ((0, 0, 0.5), (0.3, 0.05, 0.45), (-0.3, 0.0, 0.45), (0.15, -0.1, 0.8), (-0.15, 0.1, 0.75), (0, 0, 0.25)):
        sph(p, 0.3, M("#f7f3ea", 0.9))
    sph((0, 0, 0.55), 0.12, M("#f48aa0"), (3, 0.3, 0.3), rot=(0, 0, 20)) if False else None


def i_cheese():
    cyl((0, 0, 0.35), 0.55, 0.5, M("#ffd24a", 0.4))
    box((0, 0.75, 0.35), (1.3, 0.5, 0.52), M("#fff0c4", 0.4), bevel=0.0).hide_render = True
    for p in ((0.2, -0.5, 0.45), (-0.25, -0.45, 0.25), (0.35, -0.3, 0.28)):
        sph((p[0] * 0.9, -0.5 + p[1] * 0.0, p[2]), 0.075, M("#d99a1a", 0.6))
    cyl((0, 0, 0.62), 0.55, 0.04, M("#ffe08a", 0.4))


def i_truffle():
    for i in range(8):
        a = TAU * i / 8
        sph((math.cos(a) * 0.14, math.sin(a) * 0.14, 0.4 + 0.05 * (i % 2)), 0.2, M("#3a2a20", 0.9))
    sph((0, 0, 0.45), 0.34, M("#2c1f18", 0.9))


def i_honey():
    cyl((0, 0, 0.5), 0.4, 0.8, M("#f2a516", 0.1))
    cyl((0, 0, 0.5), 0.41, 0.4, M("#ffc233", 0.15))
    cyl((0, 0, 0.98), 0.3, 0.16, M("#8a5a2a", 0.5))
    box((0, -0.41, 0.5), (0.4, 0.04, 0.3), M("#fff3c0", 0.6), bevel=0.01)
    sph((0, -0.43, 0.5), 0.07, M("#ffc233", 0.3), (1.3, 0.3, 1.3))


ICONS = dict(wheat=i_wheat, corn=i_corn, carrot=i_carrot, tomato=i_tomato, strawberry=i_strawberry, pumpkin=i_pumpkin,
             potato=i_potato, sunflower=i_sunflower, apple=i_apple, grapes=i_grapes,
             egg=i_egg, duckegg=i_duckegg, milk=i_milk, wool=i_wool, cheese=i_cheese, truffle=i_truffle, honey=i_honey)


def do_icons():
    for name, fn in ICONS.items():
        if not want(name):
            continue
        sc = reset()
        lights(sc, 3.0)
        camera(sc, (0, -8, 4.2), (0, 0, 0.55), 1.9)
        catcher(6)
        fn()
        render(f"{OUT}/icons/{name}.png")


# ------------------------------------------------------------------------------------------
# Panorama
# ------------------------------------------------------------------------------------------


def do_hero():
    sc = reset((1600, 520), 48, False)
    w = sc.world
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.78, 1.0, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 1.2
    lights(sc, 4.2)
    camera(sc, (0, -16, 3.4), (0, 0, 2.3), 18.0)
    bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0))
    bpy.context.active_object.data.materials.append(M("#6fbf3a", 0.9))
    for x, y, r, h in ((-11, 9, 6, 0.55), (-2, 11, 8, 0.5), (9, 10, 7, 0.6), (15, 8, 5, 0.5)):
        sph((x, y, 0), r, M("#5aa82f", 0.9), (1.5, 1, h))
    # slunce
    sph((7.5, 12, 6.5), 1.0, M("#fff3a0", 0.3, emit=8.0))
    # stodola
    bx, by = -5.2, 2.0
    box((bx, by, 1.3), (4.0, 3.0, 2.6), M("#c0392b", 0.6), bevel=0.05)
    pitch = 28
    off = 1.0
    for sgn, ang in ((-1, -pitch), (1, pitch)):
        box((bx + sgn * off, by, 2.6 + 0.55), (2.4, 3.4, 0.22), M("#8a2f22", 0.6), rot=(0, ang, 0), bevel=0.03)
    box((bx, by - 1.52, 3.0), (4.0, 0.06, 0.8), M("#c0392b", 0.6), bevel=0.0)
    box((bx, by - 1.55, 1.0), (1.7, 0.06, 2.0), M("#f6f0e0", 0.6), bevel=0.02)
    for a in (38, -38):
        box((bx, by - 1.6, 1.0), (0.12, 0.05, 2.3), M("#c0392b", 0.6), rot=(0, a, 0), bevel=0.0)
    box((bx, by - 1.58, 2.05), (1.7, 0.07, 0.1), M("#c0392b", 0.6), bevel=0.0)
    sph((bx, by - 1.55, 3.05), 0.18, M("#f6f0e0", 0.5))
    # silo
    cyl((-1.9, 2.8, 2.0), 0.9, 4.0, M("#dfe4ea", 0.5))
    sph((-1.9, 2.8, 4.0), 0.9, M("#9aa7b4", 0.4), (1, 1, 0.7))
    for z in (0.9, 2.0, 3.1):
        cyl((-1.9, 2.8, z), 0.92, 0.07, M("#9aa7b4", 0.4))
    # záhony
    for i in range(3):
        for j in range(4):
            x0, y0 = 1.8 + j * 1.9, 0.2 - i * 1.7
            box((x0, y0, 0.12), (1.6, 1.4, 0.24), M("#6b4429", 0.95), bevel=0.1)
            for k in range(3):
                for l in range(2):
                    sph((x0 + (k - 1) * 0.42, y0 + (l - 0.5) * 0.5, 0.42), 0.19, M("#4caf3a" if (i + j) % 2 else "#e2b84a", 0.5), (1, 1, 1.15))
    # stromy
    for x, y, r in ((7.4, 4.2, 1.1), (9.0, 5.2, 0.9), (-9.3, 4.4, 1.0)):
        cyl((x, y, 0.9), 0.17, 1.8, M("#7a4e2a", 0.8))
        sph((x, y, 2.3), r, M("#4caf3a", 0.5))
    # plot a balíky sena
    for i in range(18):
        cyl((-8.4 + i * 0.95, -3.2, 0.42), 0.07, 0.84, M("#f6f0e0", 0.6))
    for z in (0.3, 0.62):
        box((0.1, -3.2, z), (16.9, 0.07, 0.1), M("#f6f0e0", 0.6), bevel=0.01)
    for x, y in ((-8.4, 0.5), (-7.5, 0.1)):
        cyl((x, y, 0.45), 0.5, 0.9, M("#e2b84a", 0.8), rot=(90, 0, 0))
    render(f"{OUT}/hero.png")


if __name__ == "__main__":
    for g, fn in (("crops", do_crops), ("animals", do_animals), ("icons", do_icons), ("hero", do_hero)):
        if GROUP and GROUP != g:
            continue
        fn()
