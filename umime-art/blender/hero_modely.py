"""Generátor realistických 3D ikon pro hero na úvodní stránce (štít „bez reklam“, odznak úrovně, mince).

Cycles, fyzikální materiály (zlato, smalt, sklo), zkosené hrany, studiové osvětlení, AgX. Průhledné pozadí.
Každý model se dá otočit (smyčka snímků) a složit do pásu snímků jako ostatní animace webu.

    ../../.venv-art/bin/python hero_modely.py -- <výstupní složka> [model ...] [--size 512] [--samples 128] [--frames 1|24]

Modely: stit, odznak, mince (bez názvu se vykreslí všechny). Při --frames > 1 se vedle snímků složí pás
<model>.webp (a <model>-still.webp) připravený pro public/home/hero3d/.
Potřebuje balíček bpy (pip install bpy) a pro pás ještě Pillow.
"""

import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

# ---------------------------------------------------------------- argumenty
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]


def opt(name, default):
    if name in argv:
        i = argv.index(name)
        v = argv[i + 1]
        del argv[i : i + 2]
        return type(default)(v)
    return default


SIZE = opt("--size", 512)
SAMPLES = opt("--samples", 128)
FRAMES = opt("--frames", 1)
OUT = argv[0] if argv else "/tmp/hero3d"
ONLY = argv[1:]
os.makedirs(OUT, exist_ok=True)


# ---------------------------------------------------------------- scéna
def lin(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def new_scene(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.cycles.glossy_bounces = 6
    sc.cycles.transmission_bounces = 8
    sc.render.resolution_x = sc.render.resolution_y = SIZE
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    sc.frame_start, sc.frame_end = 1, max(1, FRAMES)
    sc.render.filepath = os.path.join(OUT, name, "f_")
    studio_world(sc)
    camera(sc)
    lights()
    return sc


def studio_world(sc):
    """Světlý studiový „strop“: gradient od teplé bílé k chladné modré, aby se zlato a sklo měly v čem odrážet."""
    w = bpy.data.worlds.new("studio")
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    bg = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(coord.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    el = ramp.color_ramp.elements
    el[0].position, el[0].color = 0.25, (*lin("#27325f"), 1)
    el[1].position, el[1].color = 0.85, (*lin("#fff4e6"), 1)
    mid = el.new(0.5)
    mid.color = (*lin("#8da2d9"), 1)
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.9
    nt.links.new(bg.outputs[0], out.inputs[0])
    sc.world = w


def camera(sc, dist=7.0, lens=70):
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    cam.data.lens = lens
    cam.location = (0, -dist, 0.35)
    cam.rotation_euler = (math.radians(87), 0, 0)
    sc.collection.objects.link(cam)
    sc.camera = cam


def area(loc, size, energy, color="#ffffff"):
    d = bpy.data.lights.new("a", "AREA")
    d.energy, d.size, d.color = energy, size, lin(color)
    o = bpy.data.objects.new("a", d)
    o.location = loc
    bpy.context.scene.collection.objects.link(o)
    aim = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y")
    o.rotation_euler = aim.to_euler()


def lights():
    area((-3.5, -4, 4), 4.5, 520, "#fff0dc")  # hlavní měkké světlo shora zleva
    area((4, -3, 1.5), 3.0, 220, "#a9c4ff")  # chladná výplň zprava
    area((0, 4, 3), 3.0, 330, "#ffffff")  # protisvětlo pro odlesk hran


# ---------------------------------------------------------------- materiály
def pbr(name, color, rough=0.4, metal=0.0, coat=0.0, trans=0.0, ior=1.45, sss=0.0, emit=None, emit_k=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*lin(color), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    for k, v in (("Coat Weight", coat), ("Coat Roughness", 0.05), ("Transmission Weight", trans), ("Subsurface Weight", sss)):
        if k in b.inputs:
            b.inputs[k].default_value = v
    if emit:
        b.inputs["Emission Color"].default_value = (*lin(emit), 1)
        b.inputs["Emission Strength"].default_value = emit_k
    return m


GOLD = lambda: pbr("zlato", "#ffc233", rough=0.22, metal=1.0, coat=0.3)
GOLD_SATIN = lambda: pbr("zlato-saten", "#e8a91c", rough=0.38, metal=1.0)
STEEL = lambda: pbr("ocel", "#d7dde8", rough=0.25, metal=1.0)
GLASS = lambda c: pbr("sklo", c, rough=0.04, trans=1.0, ior=1.5)


def enamel(color):
    return pbr("smalt", color, rough=0.12, coat=1.0, sss=0.08)


# ---------------------------------------------------------------- stavebnice
def obj_from_bmesh(bm, name, mat, bevel=0.0, subsurf=0, smooth=True, solid=0.0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    me.materials.append(mat)
    if solid:
        s = o.modifiers.new("solid", "SOLIDIFY")
        s.thickness, s.offset = solid, 0
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width, b.segments, b.limit_method = bevel, 5, "ANGLE"
    if subsurf:
        s = o.modifiers.new("sub", "SUBSURF")
        s.levels = s.render_levels = subsurf
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return o


def plate(points, depth, z=0.0):
    """Zvolený obrys (2D body) vytlačený do hloubky depth, s dolní plochou v z."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, 0, y + z * 0)) for x, y in points]
    face = bm.faces.new(vs)
    geom = bmesh.ops.extrude_face_region(bm, geom=[face])
    verts = [v for v in geom["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, depth, 0), verts=verts)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def inset_points(points, k):
    cx = sum(p[0] for p in points) / len(points)
    cy = sum(p[1] for p in points) / len(points)
    return [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in points]


def cylinder_y(radius, depth, mat, y=0.0, bevel=0.0, verts=96):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=(0, y, 0), rotation=(math.pi / 2, 0, 0))
    o = bpy.context.object
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width, b.segments, b.limit_method = bevel, 6, "ANGLE"
    return o


def torus_y(major, minor, mat, y=0.0):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=96, minor_segments=24, location=(0, y, 0), rotation=(math.pi / 2, 0, 0))
    o = bpy.context.object
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def star_points(n, r_out, r_in, rot=math.pi / 2):
    pts = []
    for i in range(n * 2):
        r = r_out if i % 2 == 0 else r_in
        a = rot + i * math.pi / n
        pts.append((r * math.cos(a), r * math.sin(a)))
    return pts


def parent_all(objs, root):
    for o in objs:
        o.parent = root


def pivot():
    root = bpy.data.objects.new("pivot", None)
    bpy.context.scene.collection.objects.link(root)
    return root


# ---------------------------------------------------------------- modely
def model_stit():
    """Štít „bez reklam“: zlatý lem, zelený smaltovaný střed, sklem krytý bílý háček."""
    root = pivot()
    # symetrický „heater“ štít: rovný vršek, boky se zužují do špičky
    steps = 28
    right = [(1.0, 0.95), (1.0, 0.25)]
    for i in range(1, steps + 1):
        u = i / steps
        right.append((math.cos(u * math.pi / 2) ** 0.85, 0.25 - 1.575 * math.sin(u * math.pi / 2) ** 1.25 - 0.2 * u))
    left = [(-x, y) for x, y in reversed(right)]
    outline = right + left[1:]

    base = obj_from_bmesh(plate(outline, 0.30), "stit-lem", GOLD(), bevel=0.06, subsurf=1)
    mid = obj_from_bmesh(plate(inset_points(outline, 0.80), 0.34), "stit-stred", enamel("#13a85c"), bevel=0.04, subsurf=1)
    mid.location.y = -0.03
    inner = obj_from_bmesh(plate(inset_points(outline, 0.62), 0.36), "stit-vnitrni", enamel("#1fcf7a"), bevel=0.05, subsurf=1)
    inner.location.y = -0.06
    # háček z bílé keramiky
    chk = pbr("hacek", "#ffffff", rough=0.15, coat=1.0)
    pts = [(-0.52, -0.02), (-0.28, 0.22), (-0.10, -0.00), (0.42, 0.60), (0.64, 0.38), (-0.10, -0.46)]
    tick = obj_from_bmesh(plate(pts, 0.12), "hacek", chk, bevel=0.035, subsurf=1)
    tick.location = (0, -0.16, 0.0)
    # sklo přes celý střed (lom světla)
    glass = obj_from_bmesh(plate(inset_points(outline, 0.80), 0.02), "stit-sklo", GLASS("#dfffee"), bevel=0.02)
    glass.location.y = -0.20
    parent_all([base, mid, inner, tick, glass], root)
    root.location = (0, 0, 0.1)
    root.scale = (1.15, 1.15, 1.15)
    return root


def model_odznak():
    """Odznak úrovně: zubatý zlatý kotouč, modrý smaltovaný střed, hvězda a dvě stuhy."""
    root = pivot()
    teeth = 28
    rim = []
    for i in range(teeth * 4):
        a = i * 2 * math.pi / (teeth * 4)
        r = 1.0 + 0.045 * (1 if (i // 2) % 2 == 0 else -1)
        rim.append((r * math.cos(a), r * math.sin(a)))
    gold = obj_from_bmesh(plate(rim, 0.22), "odznak-zlato", GOLD(), bevel=0.04, subsurf=1)
    face = cylinder_y(0.78, 0.08, enamel("#2f4bff"), y=-0.04, bevel=0.02)
    ring = torus_y(0.80, 0.045, GOLD_SATIN(), y=-0.07)
    star = obj_from_bmesh(plate(star_points(5, 0.5, 0.21), 0.10), "odznak-hvezda", GOLD(), bevel=0.025, subsurf=1)
    star.location.y = -0.14
    star.location.z = 0.0
    # lesklá kapka skla nahoře jako odlesk
    gl = cylinder_y(0.74, 0.012, GLASS("#ffffff"), y=-0.20, bevel=0.004)
    # stuhy
    ribbon = enamel("#1a2fd6")
    objs = [gold, face, ring, star, gl]
    for sx in (-1, 1):
        pts = [(0.0, 0.0), (0.38 * sx, 0.0), (0.62 * sx, -0.95), (0.30 * sx, -0.78), (0.0, -0.95)]
        r = obj_from_bmesh(plate(pts, 0.05), "stuha", ribbon, bevel=0.01)
        r.location = (0.12 * sx, 0.12, -0.70)
        r.rotation_euler = (0, math.radians(12 * -sx), 0)
        objs.append(r)
    parent_all(objs, root)
    root.location = (0, 0, 0.35)
    return root


def model_mince():
    """Zlatá mince s vyraženou hvězdou a vroubkovaným okrajem."""
    root = pivot()
    body = cylinder_y(1.0, 0.16, GOLD(), bevel=0.03)
    rim = torus_y(0.92, 0.055, GOLD_SATIN(), y=-0.085)
    inner = cylinder_y(0.80, 0.02, GOLD_SATIN(), y=-0.085)
    star = obj_from_bmesh(plate(star_points(5, 0.52, 0.22), 0.07), "mince-hvezda", GOLD(), bevel=0.02, subsurf=1)
    star.location.y = -0.10
    # vroubkování okraje
    objs = [body, rim, inner, star]
    for i in range(72):
        a = i * 2 * math.pi / 72
        bpy.ops.mesh.primitive_cube_add(size=1, location=(1.0 * math.cos(a), 0.0, 1.0 * math.sin(a)))
        c = bpy.context.object
        c.scale = (0.012, 0.085, 0.03)
        c.rotation_euler = (0, -a, 0)
        c.data.materials.append(GOLD_SATIN())
        objs.append(c)
    parent_all(objs, root)
    root.location = (0, 0, 0.35)
    root.scale = (1.4, 1.4, 1.4)
    return root


MODELS = {"stit": model_stit, "odznak": model_odznak, "mince": model_mince}


# ---------------------------------------------------------------- render
def stage_floor_shadow():
    """Neviditelná podlaha, která jen zachytí měkký stín (film je průhledný)."""
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -1.55))
    f = bpy.context.object
    f.is_shadow_catcher = True


def render_model(name):
    sc = new_scene("hero_" + name)
    root = MODELS[name]()
    stage_floor_shadow()
    # ukázat model mírně z boku a seshora, ať jsou vidět hrany a odlesky
    root.rotation_euler = (math.radians(8), 0, math.radians(-14))
    for f in range(1, FRAMES + 1):
        t = (f - 1) / max(1, FRAMES)
        # smyčka: pomalé otočení o ±22° (sin), mince a odznak se k tomu mírně naklánějí
        root.rotation_euler[2] = math.radians(-14 + 22 * math.sin(t * 2 * math.pi))
        root.rotation_euler[0] = math.radians(8 + 4 * math.cos(t * 2 * math.pi))
        sc.frame_set(f)
        sc.render.filepath = os.path.join(OUT, "hero_" + name, "f_%04d.png" % f)
        bpy.ops.render.render(write_still=True)
    return os.path.join(OUT, "hero_" + name)


def pack(name, folder):
    """Složí snímky do pásu <name>.webp (a <name>-still.webp) – stejný formát jako ostatní animace webu."""
    try:
        from PIL import Image
    except ImportError:
        print("Pillow není nainstalovaný, pás se neskládá")
        return
    files = sorted(f for f in os.listdir(folder) if f.endswith(".png"))
    fr = [Image.open(os.path.join(folder, f)).convert("RGBA") for f in files]
    box = fr[0].getbbox() or (0, 0, SIZE, SIZE)
    for im in fr[1:]:
        b = im.getbbox()
        if b:
            box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    side = max(box[2] - box[0], box[3] - box[1])
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    crop = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
    px = 384
    fr = [im.crop(crop).resize((px, px), Image.LANCZOS) for im in fr]
    fr[0].save(os.path.join(OUT, name + "-still.webp"), format="WEBP", quality=88, method=5, alpha_quality=92)
    if len(fr) > 1:
        sheet = Image.new("RGBA", (px * len(fr), px), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * px, 0))
        sheet.save(os.path.join(OUT, name + ".webp"), format="WEBP", quality=80, method=5, alpha_quality=88)


if __name__ == "__main__":
    for n in ONLY or list(MODELS):
        folder = render_model(n)
        pack(n, folder)
        print("hotovo:", n)
