"""Stavebnice detailních budov pro živé 3D městečko (public/mestecko3d/*.glb).

Spuštění jedné budovy:  python umime-art/blender/mestecko3d_budovy.py -- <jméno|all> [--preview]
Konvence: Blender Z nahoru, dveře budovy míří k -Y (po exportu do glTF je to +Z v three.js),
počátek = střed půdorysu na zemi, 1 jednotka = 1 metr ve hře. Materiály jsou čisté barvy
(bez textur, ať jsou soubory malé), okna a lampy mají emisi, kterou hra v noci zesílí
(materiály s názvem začínajícím „glow_“).
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "mestecko3d")
TAU = math.tau
_mats = {}


def hexc(h, a=1.0):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (a,)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()


def mat(color, rough=0.7, metal=0.0, name=None, alpha=1.0):
    key = name or f"m_{color}_{rough}_{metal}_{alpha}"
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND" if hasattr(m, "blend_method") else None
    _mats[key] = m
    return m


def glow(color, strength=1.0):
    key = f"glow_{color}"
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color)
    b.inputs["Emission Color"].default_value = hexc(color)
    b.inputs["Emission Strength"].default_value = strength
    b.inputs["Roughness"].default_value = 0.3
    _mats[key] = m
    return m


def _fin(o, m, bevel=0.0, smooth=False, seg=2):
    if m is not None:
        o.data.materials.append(m)
    if bevel:
        mod = o.modifiers.new("b", "BEVEL")
        mod.width = bevel
        mod.segments = seg
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(40)
    for p in o.data.polygons:
        p.use_smooth = smooth
    return o


def box(c, s, m, bevel=0.03, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c, rotation=rot)
    o = bpy.context.object
    o.scale = s
    return _fin(o, m, bevel)


def cyl(c, r, h, m, verts=16, bevel=0.0, rot=(0, 0, 0), r2=None, smooth=True):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=c, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=h, location=c, rotation=rot)
    return _fin(bpy.context.object, m, bevel, smooth)


def cone(c, r, h, m, verts=16, rot=(0, 0, 0), smooth=False):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=0, depth=h, location=c, rotation=rot)
    return _fin(bpy.context.object, m, 0, smooth)


def sphere(c, r, m, seg=16, scale=(1, 1, 1), smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=max(6, seg // 2), radius=r, location=c)
    o = bpy.context.object
    o.scale = scale
    return _fin(o, m, 0, smooth)


def torus(c, R, r, m, rot=(0, 0, 0), seg=24):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=8, location=c, rotation=rot)
    return _fin(bpy.context.object, m, 0, True)


def dome(c, r, m, seg=24, smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=c)
    o = bpy.context.object
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    bm.to_mesh(o.data)
    bm.free()
    return _fin(o, m, 0, smooth)


def mesh(verts, faces, m, name="mesh", smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return _fin(o, m, 0, smooth)


def prism_roof(cx, cy, z0, w, d, h, m, over=0.3, thick=0.12, along="x"):
    """Sedlová střecha jako dvě desky s přesahem; hřeben podél osy `along`."""
    objs = []
    if along == "x":
        half = d / 2 + over
        ang = math.atan2(h, half)
        L = math.hypot(half, h)
        for s in (-1, 1):
            o = box((cx, cy + s * half / 2, z0 + h / 2), (w + 2 * over, L, thick), m, bevel=0.02, rot=(-s * ang, 0, 0))
            objs.append(o)
    else:
        half = w / 2 + over
        ang = math.atan2(h, half)
        L = math.hypot(half, h)
        for s in (-1, 1):
            o = box((cx + s * half / 2, cy, z0 + h / 2), (L, d + 2 * over, thick), m, bevel=0.02, rot=(0, s * ang, 0))
            objs.append(o)
    return objs


def gable_wall(cx, cy, z0, w, d, h, m, along="x"):
    """Trojúhelníkové štíty pod sedlovou střechou."""
    if along == "x":
        for s in (-1, 1):
            x = cx + s * w / 2
            mesh([(x, cy - d / 2, z0), (x, cy + d / 2, z0), (x, cy, z0 + h)], [(0, 1, 2)], m, "stit")
    else:
        for s in (-1, 1):
            y = cy + s * d / 2
            mesh([(cx - w / 2, y, z0), (cx + w / 2, y, z0), (cx, y, z0 + h)], [(0, 1, 2)], m, "stit")


def tiles(cx, cy, z0, w, d, h, m, over=0.3, rows=6, along="x"):
    """Řady tašek přes střechu (lišty, které dělají reliéf)."""
    half = (d if along == "x" else w) / 2 + over
    ang = math.atan2(h, half)
    for s in (-1, 1):
        for k in range(1, rows):
            t = k / rows
            off = half * (1 - t)
            z = z0 + h * t + 0.07
            if along == "x":
                box((cx, cy + s * off, z), (w + 2 * over + 0.04, 0.12, 0.05), m, bevel=0.015, rot=(-s * ang, 0, 0))
            else:
                box((cx + s * off, cy, z), (0.12, d + 2 * over + 0.04, 0.05), m, bevel=0.015, rot=(0, s * ang, 0))
    # hřeben
    if along == "x":
        cyl((cx, cy, z0 + h + 0.05), 0.11, w + 2 * over, m, verts=8, rot=(0, math.pi / 2, 0))
    else:
        cyl((cx, cy, z0 + h + 0.05), 0.11, d + 2 * over, m, verts=8, rot=(math.pi / 2, 0, 0))


def window(x, y, z, w, h, face="-y", frame="#ffffff", glass="#ffd98a", shutters=None, box_flowers=False, arch=False):
    """Okno s rámem, příčkami, parapetem; volitelně okenice a truhlík s květinami."""
    fm = mat(frame, 0.5)
    gm = glow(glass, 0.6)
    d = 0.07
    if face in ("-y", "+y"):
        sy = -1 if face == "-y" else 1
        yy = y + sy * 0.02
        box((x, yy + sy * 0.02, z), (w, 0.04, h), gm, bevel=0)
        for dx in (-w / 2, w / 2):
            box((x + dx, yy + sy * d / 2, z), (0.08, d, h + 0.08), fm, 0.01)
        for dz in (-h / 2, h / 2):
            box((x, yy + sy * d / 2, z + dz), (w + 0.08, d, 0.08), fm, 0.01)
        box((x, yy + sy * d / 2, z), (0.05, d * 0.8, h), fm, 0)
        box((x, yy + sy * d / 2, z), (w, d * 0.8, 0.05), fm, 0)
        box((x, yy + sy * 0.1, z - h / 2 - 0.07), (w + 0.2, 0.18, 0.06), fm, 0.01)
        if arch:
            cyl((x, yy + sy * d / 2, z + h / 2), w / 2 + 0.04, d, fm, verts=16, rot=(math.pi / 2, 0, 0))
            cyl((x, yy + sy * (d / 2 + 0.01), z + h / 2), w / 2 - 0.02, d, gm, verts=16, rot=(math.pi / 2, 0, 0))
        if shutters:
            sm = mat(shutters, 0.6)
            for s in (-1, 1):
                sh = box((x + s * (w / 2 + w * 0.27), yy + sy * 0.05, z), (w * 0.5, 0.05, h + 0.06), sm, 0.01)
                for k in (-1, 0, 1):
                    box((x + s * (w / 2 + w * 0.27), yy + sy * 0.08, z + k * h * 0.3), (w * 0.42, 0.02, 0.04), mat("#16132b", 0.6), 0)
        if box_flowers:
            box((x, yy + sy * 0.18, z - h / 2 - 0.2), (w + 0.1, 0.22, 0.2), mat("#8a5a34", 0.7), 0.02)
            rnd = random.Random(int(x * 13 + z * 7))
            for k in range(5):
                c = rnd.choice(["#ff5d73", "#ffd24d", "#ffffff", "#a87bff", "#ff9f43"])
                sphere((x - w / 2 + (k + 0.5) * w / 5, yy + sy * 0.2, z - h / 2 - 0.05), 0.09, mat(c, 0.6), seg=8)
                sphere((x - w / 2 + (k + 0.5) * w / 5, yy + sy * 0.22, z - h / 2 - 0.12), 0.08, mat("#3f9a4a", 0.7), seg=6)
    else:
        sx = -1 if face == "-x" else 1
        xx = x + sx * 0.02
        box((xx + sx * 0.02, y, z), (0.04, w, h), gm, bevel=0)
        for dy in (-w / 2, w / 2):
            box((xx + sx * d / 2, y + dy, z), (d, 0.08, h + 0.08), fm, 0.01)
        for dz in (-h / 2, h / 2):
            box((xx + sx * d / 2, y, z + dz), (d, w + 0.08, 0.08), fm, 0.01)
        box((xx + sx * d / 2, y, z), (d * 0.8, 0.05, h), fm, 0)
        box((xx + sx * d / 2, y, z), (d * 0.8, w, 0.05), fm, 0)
        box((xx + sx * 0.1, y, z - h / 2 - 0.07), (0.18, w + 0.2, 0.06), fm, 0.01)
        if shutters:
            sm = mat(shutters, 0.6)
            for s in (-1, 1):
                box((xx + sx * 0.05, y + s * (w / 2 + w * 0.27), z), (0.05, w * 0.5, h + 0.06), sm, 0.01)
                for k in (-1, 0, 1):
                    box((xx + sx * 0.08, y + s * (w / 2 + w * 0.27), z + k * h * 0.3), (0.02, w * 0.42, 0.04), mat("#16132b", 0.6), 0)
        if box_flowers:
            box((xx + sx * 0.18, y, z - h / 2 - 0.2), (0.22, w + 0.1, 0.2), mat("#8a5a34", 0.7), 0.02)
            rnd = random.Random(int(y * 13 + z * 7 + x))
            for k in range(5):
                c = rnd.choice(["#ff5d73", "#ffd24d", "#ffffff", "#a87bff", "#ff9f43"])
                sphere((xx + sx * 0.2, y - w / 2 + (k + 0.5) * w / 5, z - h / 2 - 0.05), 0.09, mat(c, 0.6), seg=8)
                sphere((xx + sx * 0.22, y - w / 2 + (k + 0.5) * w / 5, z - h / 2 - 0.12), 0.08, mat("#3f9a4a", 0.7), seg=6)


def door(x, y, z0, w, h, color="#8a5a34", frame="#ffffff", face="-y", arch=False, steps=1, knob="#ffd24d"):
    sy = -1 if face == "-y" else 1
    yy = y + sy * 0.03
    dm = mat(color, 0.65)
    box((x, yy + sy * 0.03, z0 + h / 2), (w, 0.06, h), dm, 0.01)
    for k in range(1, 4):
        box((x - w / 2 + k * w / 4, yy + sy * 0.065, z0 + h / 2), (0.025, 0.02, h * 0.92), mat("#5a3a20", 0.7), 0)
    fm = mat(frame, 0.5)
    for dx in (-w / 2 - 0.05, w / 2 + 0.05):
        box((x + dx, yy + sy * 0.05, z0 + h / 2), (0.1, 0.1, h + 0.1), fm, 0.01)
    box((x, yy + sy * 0.05, z0 + h + 0.05), (w + 0.2, 0.1, 0.1), fm, 0.01)
    if arch:
        cyl((x, yy + sy * 0.05, z0 + h + 0.05), w / 2 + 0.1, 0.1, fm, verts=16, rot=(math.pi / 2, 0, 0))
        cyl((x, yy + sy * 0.07, z0 + h + 0.05), w / 2 - 0.02, 0.06, dm, verts=16, rot=(math.pi / 2, 0, 0))
    sphere((x + w * 0.32, yy + sy * 0.1, z0 + h * 0.48), 0.05, mat(knob, 0.3, 0.6), seg=8)
    sm = mat("#cfc8b8", 0.85)
    for k in range(steps):
        box((x, yy + sy * (0.2 + 0.18 * (steps - 1 - k)), z0 - 0.06 - k * 0.12 + 0.12 * steps - 0.12), (w + 0.5 + 0.2 * k, 0.36 + 0.18 * k, 0.12), sm, 0.02)


def chimney(x, y, z, h=1.0, color="#a8574a"):
    box((x, y, z + h / 2), (0.45, 0.45, h), mat(color, 0.85), 0.02)
    box((x, y, z + h + 0.05), (0.55, 0.55, 0.12), mat("#6e6a78", 0.8), 0.02)
    # cihly
    for k in range(int(h / 0.25)):
        box((x, y - 0.231, z + 0.12 + k * 0.25), (0.46, 0.01, 0.03), mat("#8a443a", 0.9), 0)


def foundation(w, d, h=0.35, color="#b8b0a8"):
    box((0, 0, h / 2), (w + 0.16, d + 0.16, h), mat(color, 0.9), 0.04)
    rnd = random.Random(int(w * 100 + d))
    for k in range(int(w / 0.5)):
        box((-w / 2 + 0.25 + k * 0.5, -d / 2 - 0.085, h / 2 + rnd.uniform(-0.05, 0.05)), (0.44, 0.02, 0.14), mat("#a49c94", 0.9), 0)


def trim(w, d, z, color="#ffffff", t=0.12):
    box((0, 0, z), (w + 0.12, d + 0.12, t), mat(color, 0.5), 0.02)


def corner_posts(w, d, z0, h, color="#ffffff"):
    for sx in (-1, 1):
        for sy in (-1, 1):
            box((sx * w / 2, sy * d / 2, z0 + h / 2), (0.16, 0.16, h), mat(color, 0.5), 0.02)


def fence(x0, y0, x1, y1, color="#ffffff", h=0.7, step=0.35):
    L = math.hypot(x1 - x0, y1 - y0)
    ang = math.atan2(y1 - y0, x1 - x0)
    n = max(2, int(L / step))
    m = mat(color, 0.6)
    for k in range(n + 1):
        t = k / n
        box((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, h / 2), (0.08, 0.08, h), m, 0.01)
        cone((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, h + 0.05), 0.06, 0.1, m, verts=4)
    for z in (h * 0.35, h * 0.75):
        box(((x0 + x1) / 2, (y0 + y1) / 2, z), (L, 0.05, 0.06), m, 0.005, rot=(0, 0, ang))


def bush(x, y, s=1.0, color="#3f9a4a"):
    m = mat(color, 0.8)
    for (dx, dy, dz, r) in [(0, 0, 0.3, 0.42), (0.3, 0.1, 0.25, 0.32), (-0.28, -0.05, 0.26, 0.3), (0.05, -0.2, 0.45, 0.28)]:
        sphere((x + dx * s, y + dy * s, dz * s), r * s, m, seg=10)


def flowers_bed(x, y, w, d, n=12, seed=3):
    rnd = random.Random(seed)
    box((x, y, 0.08), (w, d, 0.16), mat("#7a5a3a", 0.95), 0.03)
    for _ in range(n):
        px, py = x + rnd.uniform(-w / 2 + 0.1, w / 2 - 0.1), y + rnd.uniform(-d / 2 + 0.1, d / 2 - 0.1)
        cyl((px, py, 0.28), 0.015, 0.25, mat("#3f8f3a", 0.7), verts=5)
        sphere((px, py, 0.42), 0.08, mat(rnd.choice(["#ff5d73", "#ffd24d", "#ffffff", "#a87bff", "#ff9f43"]), 0.5), seg=8)


def sign_board(x, y, z, w, h, board="#7a4a2e", face="#ffd24d", icon=None):
    """Vývěsní štít: deska s rámem a jednoduchým symbolem z tvarů."""
    box((x, y, z), (w, 0.08, h), mat(board, 0.6), 0.02)
    box((x, y - 0.05, z), (w - 0.14, 0.02, h - 0.14), mat(face, 0.5), 0)
    if icon:
        icon(x, y - 0.08, z)


def lamp_post(x, y, h=2.4):
    m = mat("#3a3f55", 0.4, 0.5)
    cyl((x, y, 0.1), 0.16, 0.2, m, verts=10)
    cyl((x, y, h / 2), 0.05, h, m, verts=8)
    box((x, y, h + 0.02), (0.32, 0.32, 0.05), m, 0.01)
    box((x, y, h + 0.2), (0.24, 0.24, 0.3), glow("#fff1b0", 1.2), 0.02)
    cone((x, y, h + 0.45), 0.24, 0.2, m, verts=4, rot=(0, 0, math.pi / 4))


def finish_and_export(name, preview=False):
    """Aplikuje modifikátory, spojí vše do jednoho objektu a uloží GLB (Draco)."""
    os.makedirs(OUT, exist_ok=True)
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.mesh.customdata_custom_splitnormals_clear() if o.data.has_custom_normals else None
    path = os.path.join(OUT, f"{name}.glb")
    raw = f"/tmp/claude-0/mestecko3d-raw-{name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=raw,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_lights=False,
        export_cameras=False,
    )
    # Blender jako modul neumí Draco: komprimuje se dodatečně přes gltf-transform (cesta v GLTF_TRANSFORM).
    import subprocess

    tool = os.environ.get("GLTF_TRANSFORM", "gltf-transform")
    subprocess.run([tool, "optimize", raw, path, "--compress", "draco", "--texture-compress", "false", "--simplify", "false"], check=True, capture_output=True)
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    print(f"EXPORT {name}: {os.path.getsize(path) // 1024} kB, {tris} trojúhelníků", flush=True)
    if preview:
        render_preview(name, o)


def render_preview(name, obj):
    """Rychlý náhled budovy (Cycles) do /tmp/claude-0/sp/budovy/<jméno>.png pro kontrolu detailu."""
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 24
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 640, 480
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#cfe8ff")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    sc.world = w
    bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    size = max(max(v[i] for v in bb) - min(v[i] for v in bb) for i in range(3))
    cz = (max(v[2] for v in bb) + min(v[2] for v in bb)) / 2
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = size * 1.35
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    a = math.radians(float(os.environ.get("PREVIEW_ANGLE", "-35")))
    co.location = (math.sin(a) * 30, -math.cos(a) * 30, cz + 17)
    d = Vector((0, 0, cz)) - co.location
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = co
    s = bpy.data.lights.new("s", "SUN")
    s.energy = 3.5
    so = bpy.data.objects.new("s", s)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-40))
    g = bpy.data.meshes.new("g")
    bpy.ops.mesh.primitive_plane_add(size=size * 4)
    bpy.context.object.data.materials.append(mat("#8fd07a", 0.9))
    os.makedirs("/tmp/claude-0/sp/budovy", exist_ok=True)
    sc.render.filepath = f"/tmp/claude-0/sp/budovy/{name}{os.environ.get('PREVIEW_TAG', '')}.png"
    bpy.ops.render.render(write_still=True)


def args():
    a = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return [x for x in a if not x.startswith("--")], "--preview" in a
