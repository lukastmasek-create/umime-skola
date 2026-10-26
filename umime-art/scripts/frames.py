"""Realistické rámečky profilovky (public/cosmetics/frames/<id>.webp, 512 × 512, průhledné).

    blender -b --python umime-art/scripts/frames.py -- <výstupní složka> [id]
    python umime-art/scripts/frames.py <výstupní složka> [id]

Geometrie je stejná jako v `AvatarFrame.tsx`: obrázek je 1,2× větší než avatar, takže kolečko avataru má
poloměr 213 px (2,13 jednotky Blenderu, 1 jednotka = 100 px) a rámeček začíná těsně za ním.
Fyzikální materiály (kov, sklo, drahokamy, smalt, láva) a světlo ze studiového prostředí; záře neonu
a ohně se dodělá při převodu (`frames_publish.py`), protože Cycles v prostředí bez GPU nemá kompozitní záři.
"""

import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "frames_out"
ONLY = ARGS[1] if len(ARGS) > 1 else None
os.makedirs(OUT, exist_ok=True)


def lin(h):
    h = h.lstrip("#")
    return tuple(pow(int(h[i : i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (1.0,)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 96
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 10
    sc.cycles.transparent_max_bounces = 16
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.view_settings.view_transform = "Standard"
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 1024  # renderuje se 2× a zmenšuje
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 5.12
    co = bpy.data.objects.new("c", cam)
    co.location = (0, -10, 0)
    co.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.collection.objects.link(co)
    sc.camera = co
    studio()


def studio():
    """Studiové prostředí: tmavé okolí a světelné karty, které se odrážejí v kovu a skle."""
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    # jemný přechod nahoře světlejší
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#2a2d3a")
    ramp.color_ramp.elements[1].color = lin("#b8c4d8")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.9
    bpy.context.scene.world = w
    for loc, rot, size, e, col in (
        ((-4, -6, 5), (math.radians(55), 0, math.radians(-30)), (5, 2.2), 900, "#fff3e0"),
        ((5, -5, 2), (math.radians(80), 0, math.radians(50)), (6, 1.2), 500, "#dfeaff"),
        ((0, -7, -5), (math.radians(110), 0, 0), (7, 1.5), 220, "#ffe9cf"),
        ((-6, -4, -1), (math.radians(90), 0, math.radians(-70)), (1.2, 6), 260, "#ffffff"),
    ):
        d = bpy.data.lights.new("l", "AREA")
        d.shape = "RECTANGLE"
        d.size, d.size_y = size
        d.energy = e
        d.color = lin(col)[:3]
        o = bpy.data.objects.new("l", d)
        o.location = loc
        o.rotation_euler = rot
        bpy.context.collection.objects.link(o)


def mat(color, rough=0.4, metal=0.0, emit=0.0, coat=0.0, transmission=0.0, ior=1.45, alpha=1.0, emit_color=None, **extra):
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.05
    if transmission:
        b.inputs["Transmission Weight"].default_value = transmission
    if emit:
        b.inputs["Emission Color"].default_value = lin(emit_color or color) if isinstance(emit_color or color, str) else (emit_color or color)
        b.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    for k, v in extra.items():
        name = next(i.name for i in b.inputs if i.name.lower() == k.replace("_", " ").lower())
        b.inputs[name].default_value = v
    return m


def noise_bump(m, scale=40, strength=0.15, detail=8, bump_dist=0.05):
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = bump_dist
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])


def link_obj(o, m=None, smooth=True):
    bpy.context.collection.objects.link(o) if o.name not in bpy.context.collection.objects else None
    if m is not None:
        o.data.materials.append(m)
    if smooth and o.type == "MESH":
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def torus(R, r, m, y=0.0, major=160, minor=48, scale_z=1.0):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=major, minor_segments=minor)
    o = bpy.context.active_object
    o.rotation_euler = (math.pi / 2, 0, 0)
    o.location = (0, y, 0)
    if scale_z != 1.0:
        o.scale = (1, 1, scale_z)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def sphere(loc, r, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=32, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def ring_pose(a, R, y=0.0):
    """Poloha na prstenci a otočení, při kterém míří lokální +Z ven z kruhu."""
    return Vector((R * math.cos(a), y, R * math.sin(a))), (0, math.pi / 2 - a, 0)


def render(name):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("OK", name, flush=True)


# --------------------------------------------------------------------------------------------


def frame_gold():
    reset()
    gold = mat("#ffc861", rough=0.16, metal=1.0)
    gold_dark = mat("#c98a2a", rough=0.32, metal=1.0)
    noise_bump(gold_dark, 90, 0.05)
    torus(2.32, 0.15, gold)  # hlavní prstenec
    torus(2.32, 0.075, gold_dark, y=-0.12, scale_z=1.0)  # tmavší jádro pod ním
    # točené lano po vnějším okraji
    n = 96
    for i in range(n):
        a = 2 * math.pi * i / n
        p, rot = ring_pose(a, 2.50, -0.02)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.065, segments=20, ring_count=12, location=p)
        o = bpy.context.active_object
        o.scale = (1.5, 0.9, 0.9)
        o.rotation_euler = (0, math.pi / 2 - a, math.radians(38))
        o.location = p
        o.data.materials.append(gold)
        bpy.ops.object.shade_smooth()
    # vnitřní perličky
    for i in range(72):
        a = 2 * math.pi * i / 72
        p, _ = ring_pose(a, 2.16, 0.06)
        sphere(p, 0.042, gold)
    torus(2.5, 0.03, gold_dark, y=0.04)
    # drahokamy v objímkách
    for ang, col in ((90, "#e0113a"), (210, "#1a4be8"), (330, "#0fa15a")):
        a = math.radians(ang)
        p, rot = ring_pose(a, 2.32, 0.04)
        gem = sphere(p + Vector((0, -0.2, 0)), 0.2, mat(col, rough=0.03, transmission=0.55, ior=1.77, emit=0.9), (1, 0.42, 1))
        bez = torus(0.21, 0.05, gold)
        bez.location = p + Vector((0, -0.17, 0))
        for k in range(6):  # drápky
            b = math.radians(60 * k + 30)
            sphere(p + Vector((0.2 * math.cos(b), -0.2, 0.2 * math.sin(b))), 0.045, gold)
    bpy.context.scene.render.film_transparent = True
    render("gold")


def frame_rainbow():
    reset()
    m = bpy.data.materials.new("rb")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ang = nt.nodes.new("ShaderNodeMath")
    ang.operation = "ARCTAN2"
    nrm = nt.nodes.new("ShaderNodeMath")
    nrm.operation = "MULTIPLY_ADD"
    nrm.inputs[1].default_value = 1 / (2 * math.pi)
    nrm.inputs[2].default_value = 0.5
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cols = ["#ff3b6b", "#ff9a3d", "#ffe14d", "#4cdc7c", "#3db8ff", "#7a5cff", "#ff3b6b"]
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = lin(cols[0])
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = lin(cols[-1])
    for i, c in enumerate(cols[1:-1], 1):
        e = ramp.color_ramp.elements.new(i / (len(cols) - 1))
        e.color = lin(c)
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    nt.links.new(sep.outputs["Y"], ang.inputs[0])
    nt.links.new(sep.outputs["X"], ang.inputs[1])
    nt.links.new(ang.outputs["Value"], nrm.inputs[0])
    nt.links.new(nrm.outputs["Value"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.12
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Coat Roughness"].default_value = 0.02
    b.inputs["Subsurface Weight"].default_value = 0.25
    b.inputs["Subsurface Radius"].default_value = (0.4, 0.4, 0.4)
    torus(2.32, 0.2, m, minor=64)
    # bílý lesklý vnitřní kroužek
    torus(2.13, 0.045, mat("#ffffff", rough=0.12, coat=1.0))
    # obláčky z hladkého pěnového materiálu
    foam = mat("#ffffff", rough=0.55, subsurface_Weight=0.4)
    rnd = random.Random(7)
    for ang_deg in (232, 308):
        a = math.radians(ang_deg)
        p, _ = ring_pose(a, 2.32, -0.15)
        for dx, dz, r in ((-0.22, -0.04, 0.17), (0.0, 0.08, 0.24), (0.22, -0.02, 0.19), (0.38, -0.08, 0.13), (-0.38, -0.08, 0.13)):
            sphere(p + Vector((dx, -0.15, dz)), r, foam, (1, 0.8, 0.85))
    # jiskřivé hvězdičky
    star_m = mat("#ffe27a", rough=0.15, metal=1.0, emit=0.4)
    for ang_deg in (100, 25, 160, 330, 200):
        a = math.radians(ang_deg)
        p, _ = ring_pose(a, 2.62, -0.1)
        sphere(p, 0.05, star_m)
    render("rainbow")


def frame_neon():
    reset()
    bpy.context.scene.cycles.samples = 64
    glass = mat("#ffffff", rough=0.03, transmission=1.0, ior=1.5)
    cyan = mat("#25f4ff", rough=0.2, emit=3.2)
    pink = mat("#ff4fd8", rough=0.2, emit=3.0)
    # trubice: skleněný plášť s plynem uvnitř
    torus(2.38, 0.085, glass, minor=40)
    torus(2.38, 0.05, cyan, minor=32)
    torus(2.22, 0.07, glass, minor=40)
    torus(2.22, 0.04, pink, minor=32)
    # kovové úchyty a konce trubic
    steel = mat("#9aa3b2", rough=0.35, metal=1.0)
    for i in range(8):
        a = 2 * math.pi * i / 8 + 0.2
        p, rot = ring_pose(a, 2.30, 0.14)
        bpy.ops.mesh.primitive_cube_add(size=1, location=p)
        o = bpy.context.active_object
        o.scale = (0.08, 0.035, 0.3)
        o.rotation_euler = rot
        o.data.materials.append(steel)
        bpy.ops.object.shade_smooth()
        for rr in (2.38, 2.22):
            pp, _ = ring_pose(a, rr, 0.04)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.07, location=pp)
            c = bpy.context.active_object
            c.rotation_euler = (math.pi / 2, 0, 0)
            c.data.materials.append(steel)
    render("neon")


def make_leaf(length, width, m, curl=0.25):
    bm = bmesh.new()
    nu, nv = 14, 6
    verts = []
    for i in range(nu + 1):
        t = i / nu
        w = width * (math.sin(math.pi * min(1, t * 1.05)) ** 0.75)
        row = []
        for j in range(nv + 1):
            s = j / nv * 2 - 1
            x = s * w
            y = length * t
            z = abs(s) * w * curl - 0.35 * length * t * t * 0.3 + (0.05 * length * math.sin(t * math.pi) * 0.4)
            row.append(bm.verts.new((x, z, y)))
        verts.append(row)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((verts[i][j], verts[i][j + 1], verts[i + 1][j + 1], verts[i + 1][j]))
    me = bpy.data.meshes.new("leaf")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("leaf", me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    for p in me.polygons:
        p.use_smooth = True
    return o


def leaf_material():
    m = bpy.data.materials.new("leaf")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.45
    b.inputs["Subsurface Weight"].default_value = 0.3
    b.inputs["Subsurface Radius"].default_value = (0.3, 0.6, 0.1)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    # žilnatina: světlejší pruh uprostřed a šikmé postranní žilky
    mid = nt.nodes.new("ShaderNodeMath")
    mid.operation = "ABSOLUTE"
    sub = nt.nodes.new("ShaderNodeMath")
    sub.operation = "SUBTRACT"
    sub.inputs[1].default_value = 0.5
    nt.links.new(sep.outputs["X"], sub.inputs[0])
    nt.links.new(sub.outputs["Value"], mid.inputs[0])
    veins = nt.nodes.new("ShaderNodeTexWave")
    veins.wave_type = "BANDS"
    veins.bands_direction = "Y"
    veins.inputs["Scale"].default_value = 9
    veins.inputs["Distortion"].default_value = 4
    nt.links.new(tc.outputs["Generated"], veins.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#2f7d2a")
    ramp.color_ramp.elements[1].color = lin("#7fcf55")
    mix = nt.nodes.new("ShaderNodeMath")
    mix.operation = "ADD"
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "MULTIPLY"
    inv.inputs[1].default_value = -3.0
    nt.links.new(mid.outputs["Value"], inv.inputs[0])
    nt.links.new(inv.outputs["Value"], mix.inputs[0])
    nt.links.new(veins.outputs["Fac"], mix.inputs[1])
    clamp = nt.nodes.new("ShaderNodeClamp")
    nt.links.new(mix.outputs["Value"], clamp.inputs[0])
    nt.links.new(clamp.outputs["Result"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m


def frame_leaf():
    reset()
    bark = mat("#5b3a22", rough=0.8)
    noise_bump(bark, 60, 0.4)
    torus(2.22, 0.07, bark, minor=24)
    lm = leaf_material()
    rnd = random.Random(11)
    n = 56
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.03, 0.03)
        for side in (-1, 1):
            leaf = make_leaf(0.44 + rnd.uniform(-0.04, 0.06), 0.18, lm)
            p, rot = ring_pose(a, 2.22, rnd.uniform(-0.04, 0.04))
            leaf.location = p
            # list roste od větve šikmo ven a ve směru obvodu
            tangent = Vector((-math.sin(a), 0, math.cos(a)))
            radial = Vector((math.cos(a), 0, math.sin(a)))
            direction = (tangent * (0.78 if i % 2 else -0.78) + radial * (0.4 if side > 0 else -0.45) + Vector((0, rnd.uniform(-0.25, 0.1), 0))).normalized()
            leaf.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
            leaf.rotation_euler.rotate_axis("Z", rnd.uniform(-0.3, 0.3))
    berry = mat("#c0182a", rough=0.15, coat=1.0)
    for i in range(14):
        a = rnd.uniform(0, 2 * math.pi)
        p, _ = ring_pose(a, 2.22 + rnd.uniform(-0.1, 0.1), -0.12)
        sphere(p, 0.055, berry)
    render("leaf")


def star_mesh(r_out, r_in, depth, m):
    bm = bmesh.new()
    pts = []
    for i in range(10):
        rad = r_out if i % 2 == 0 else r_in
        a = math.pi / 5 * i + math.pi / 2
        pts.append((rad * math.cos(a), rad * math.sin(a)))
    front = [bm.verts.new((x, -depth / 2, z)) for x, z in pts]
    back = [bm.verts.new((x, depth / 2, z)) for x, z in pts]
    bm.faces.new(front[::-1])
    bm.faces.new(back)
    for i in range(10):
        j = (i + 1) % 10
        bm.faces.new((front[i], front[j], back[j], back[i]))
    # prohnutí stran dovnitř: střed hvězdy se zvedne
    c_f = bm.verts.new((0, -depth * 0.9, 0))
    for i in range(10):
        pass
    me = bpy.data.meshes.new("star")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("star", me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    bv = o.modifiers.new("b", "BEVEL")
    bv.width = depth * 0.45
    bv.segments = 4
    for p in me.polygons:
        p.use_smooth = False
    return o


def frame_stars():
    reset()
    enamel = mat("#4b3bd8", rough=0.12, coat=1.0, subsurface_Weight=0.15)
    gold = mat("#ffc861", rough=0.14, metal=1.0)
    pearl = mat("#f4f0ff", rough=0.12, coat=1.0, subsurface_Weight=0.3)
    torus(2.32, 0.16, enamel, minor=56)
    torus(2.16, 0.035, gold)
    torus(2.48, 0.035, gold)
    for i in range(84):
        a = 2 * math.pi * i / 84
        p, _ = ring_pose(a, 2.32, -0.13)
        sphere(p, 0.022, pearl)
    for ang, big in ((90, 1.0), (162, 0.62), (18, 0.62), (234, 0.75), (306, 0.75), (126, 0.4), (54, 0.4)):
        a = math.radians(ang)
        p, rot = ring_pose(a, 2.32, -0.25)
        s = star_mesh(0.33 * big + 0.06, 0.15 * big + 0.03, 0.13, gold)
        s.location = p
        s.rotation_euler = (0, -(a - math.pi / 2), 0)
    render("stars")


def frame_fire():
    reset()
    bpy.context.scene.cycles.samples = 64
    # ztuhlá láva: tmavá hornina s žhavými prasklinami (voronoi)
    m = bpy.data.materials.new("lava")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 16
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 5
    nz.inputs["Detail"].default_value = 10
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    crack = nt.nodes.new("ShaderNodeValToRGB")
    crack.color_ramp.elements[0].position = 0.0
    crack.color_ramp.elements[1].position = 0.12
    crack.color_ramp.elements[0].color = (1, 1, 1, 1)
    crack.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs["Distance"], crack.inputs[0])
    heat = nt.nodes.new("ShaderNodeValToRGB")
    heat.color_ramp.elements[0].color = lin("#d02000")
    heat.color_ramp.elements[1].color = lin("#ff9a2a")
    nt.links.new(nz.outputs["Fac"], heat.inputs[0])
    b.inputs["Base Color"].default_value = lin("#1a1210")
    b.inputs["Roughness"].default_value = 0.85
    nt.links.new(heat.outputs["Color"], b.inputs["Emission Color"])
    mult = nt.nodes.new("ShaderNodeMath")
    mult.operation = "MULTIPLY"
    mult.inputs[1].default_value = 3.5
    sepc = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(crack.outputs["Color"], sepc.inputs[0])
    nt.links.new(sepc.outputs["Red"], mult.inputs[0])
    nt.links.new(mult.outputs["Value"], b.inputs["Emission Strength"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.7
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    # skutečně nerovný prstenec: torus s displace modifikátorem
    ring = torus(2.2, 0.14, m, minor=64, major=220)
    tex = bpy.data.textures.new("d", "CLOUDS")
    tex.noise_scale = 0.35
    d = ring.modifiers.new("d", "DISPLACE")
    d.texture = tex
    d.strength = 0.12
    # plameny: protažené špičaté kapky se žhavým přechodem a průhledností
    fm = bpy.data.materials.new("flame")
    fm.use_nodes = True
    ft = fm.node_tree
    for n in list(ft.nodes):
        if n.type != "OUTPUT_MATERIAL":
            ft.nodes.remove(n)
    out = [n for n in ft.nodes if n.type == "OUTPUT_MATERIAL"][0]
    tcf = ft.nodes.new("ShaderNodeTexCoord")
    sepf = ft.nodes.new("ShaderNodeSeparateXYZ")
    ft.links.new(tcf.outputs["Generated"], sepf.inputs[0])
    ramp = ft.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#e83a00")
    ramp.color_ramp.elements[1].color = lin("#ffb43a")
    # spodek žlutobílý, špička oranžovočervená
    inv = ft.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    ft.links.new(sepf.outputs["Z"], inv.inputs[1])
    ft.links.new(inv.outputs["Value"], ramp.inputs[0])
    emit = ft.nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 2.4
    ft.links.new(ramp.outputs["Color"], emit.inputs["Color"])
    transp = ft.nodes.new("ShaderNodeBsdfTransparent")
    # průhlednost: ubývá směrem ke špičce a k okrajům (tvar řídí geometrie)
    fade = ft.nodes.new("ShaderNodeMath")
    fade.operation = "POWER"
    fade.inputs[1].default_value = 0.6
    ft.links.new(sepf.outputs["Z"], fade.inputs[0])
    mixs = ft.nodes.new("ShaderNodeMixShader")
    ft.links.new(fade.outputs["Value"], mixs.inputs[0])
    ft.links.new(emit.outputs["Emission"], mixs.inputs[1])
    ft.links.new(transp.outputs["BSDF"], mixs.inputs[2])
    # mix 0 = první, 1 = druhý: u země (Z=0) má být plamen vidět, nahoře mizet
    ft.links.new(mixs.outputs["Shader"], out.inputs["Surface"])
    fm.surface_render_method = "BLENDED" if hasattr(fm, "surface_render_method") else None
    rnd = random.Random(5)
    n = 44
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.04, 0.04)
        h = rnd.uniform(0.14, 0.26) * (1.3 if i % 4 == 0 else 1.0)
        w = rnd.uniform(0.07, 0.12)
        bm = bmesh.new()
        rows = 12
        prev = None
        for k in range(rows + 1):
            t = k / rows
            wid = w * (1 - t) ** 0.8 * (1 + 0.25 * math.sin(t * 6 + i))
            sway = 0.12 * h * math.sin(t * 2.5 + i) * t
            vs = [bm.verts.new((sway - wid, 0, h * t)), bm.verts.new((sway, -wid * 0.5, h * t)), bm.verts.new((sway + wid, 0, h * t))]
            if prev:
                for j in range(2):
                    bm.faces.new((prev[j], prev[j + 1], vs[j + 1], vs[j]))
            prev = vs
        me = bpy.data.meshes.new("f")
        bm.to_mesh(me)
        bm.free()
        o = bpy.data.objects.new("f", me)
        bpy.context.collection.objects.link(o)
        o.data.materials.append(fm)
        p, rot = ring_pose(a, 2.28 + rnd.uniform(0, 0.05), -0.05)
        o.location = p
        o.rotation_euler = rot
        for pl in me.polygons:
            pl.use_smooth = True
    # jiskry
    ember = mat("#ffb347", rough=0.4, emit=12.0)
    for i in range(34):
        a = rnd.uniform(0, 2 * math.pi)
        rr = 2.3 + rnd.uniform(0, 0.24)
        p, _ = ring_pose(a, rr, 0)
        sphere(p, rnd.uniform(0.012, 0.03), ember)
    render("fire")


FRAMES = dict(gold=frame_gold, rainbow=frame_rainbow, neon=frame_neon, leaf=frame_leaf, stars=frame_stars, fire=frame_fire)

if __name__ == "__main__":
    for k, fn in FRAMES.items():
        if ONLY and ONLY != k:
            continue
        fn()
