"""Realističtější 3D ikony školních předmětů na úvodní stránce (public/home/predmet-*.webp).

    python umime-art/scripts/predmety.py <výstupní složka> [slug ...]

Potřebuje modul bpy (pip install bpy). Vykreslí PNG 1024 × 1024 s průhledným pozadím a rovnou
je zmenší na 512 × 512 WebP. Cycles, fyzikální materiály, zkosené hrany, měkké světlo.
"""

import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/predmety"
ONLY = sys.argv[2:]
os.makedirs(OUT, exist_ok=True)
random.seed(7)


# ---------- pomocné funkce ----------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=0.45, metal=0.0, coat=0.0, coat_rough=0.08, spec=0.5, emit=None, sss=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    for k, v in (("Coat Weight", coat), ("Coat Roughness", coat_rough), ("Subsurface Weight", sss)):
        if k in b.inputs:
            b.inputs[k].default_value = v
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = spec
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = 1.0
    return m


def finish(o, m, bevel=0.0, smooth=True, subsurf=0):
    o.data.materials.clear()
    o.data.materials.append(m)
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
        mod.limit_method = "ANGLE"
    if subsurf:
        s = o.modifiers.new("sub", "SUBSURF")
        s.levels = subsurf
        s.render_levels = subsurf
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def box(name, size, loc, m, bevel=0.02, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, m, bevel)


def cyl(name, r, h, loc, m, bevel=0.0, rot=(0, 0, 0), verts=48, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object
    o.name = name
    return finish(o, m, bevel)


def sph(name, r, loc, m, scale=(1, 1, 1), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    return finish(o, m)


def lathe(name, profile, loc, m, steps=64):
    """profile: seznam (r, z) bodů; otočí se kolem osy Z."""
    me = bpy.data.meshes.new(name)
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, angle=2 * math.pi, steps=steps, axis=(0, 0, 1), cent=(0, 0, 0))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o.location = loc
    return finish(o, m)


def text(name, s, loc, size, m, depth=0.05, rot=(math.pi / 2, 0, 0), bevel=0.012):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.body = s
    o.data.size = size
    o.data.extrude = depth
    o.data.bevel_depth = bevel
    o.data.bevel_resolution = 3
    o.data.align_x = "CENTER"
    o.data.align_y = "CENTER"
    o.data.materials.append(m)
    return o


def curve_tube(name, pts, radius, m, closed=False, res=24, taper=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 8
    cu.resolution_u = res
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for p, c in zip(sp.bezier_points, pts):
        p.co = c
        p.handle_left_type = p.handle_right_type = "AUTO"
    sp.use_cyclic_u = closed
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    cu.materials.append(m)
    if taper:
        t = bpy.data.curves.new(name + "t", "CURVE")
        ts = t.splines.new("POLY")
        ts.points.add(len(taper) - 1)
        for i, (x, y) in enumerate(taper):
            ts.points[i].co = (x, y, 0, 1)
        to = bpy.data.objects.new(name + "t", t)
        bpy.context.collection.objects.link(to)
        cu.taper_object = to
    return o


# ---------- scéna ----------
def setup_scene(res=1024):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 64
    sc.cycles.use_denoising = True
    sc.cycles.device = "CPU"
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    # měkký nebeský přechod jako okolní světlo
    tc = w.node_tree.nodes.new("ShaderNodeTexCoord")
    sep = w.node_tree.nodes.new("ShaderNodeSeparateXYZ")
    ramp = w.node_tree.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.55, 0.52, 0.5, 1)
    ramp.color_ramp.elements[1].color = (1.1, 1.15, 1.25, 1)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[1].position = 0.75
    w.node_tree.links.new(tc.outputs["Generated"], sep.inputs[0])
    w.node_tree.links.new(sep.outputs[2], ramp.inputs[0])
    w.node_tree.links.new(ramp.outputs[0], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.7
    for name, loc, energy, size, col in (
        ("key", (3.5, -4, 5), 420, 3.5, (1, 0.95, 0.88)),
        ("fill", (-5, -2.5, 2.5), 160, 4, (0.85, 0.92, 1)),
        ("rim", (-1, 5, 4), 260, 3, (1, 1, 1)),
    ):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy
        ld.size = size
        ld.color = col
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        d = Vector((0, 0, 0.8)) - Vector(loc)
        lo.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def frame_camera(margin=1.18, az=-28, el=22, focal=70):
    objs = [o for o in bpy.context.scene.objects if o.type in {"MESH", "CURVE", "FONT"}]
    pts = []
    for o in objs:
        for c in o.bound_box:
            pts.append(o.matrix_world @ Vector(c))
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (mn + mx) / 2
    rad = (mx - mn).length / 2
    cd = bpy.data.cameras.new("cam")
    cd.lens = focal
    cd.sensor_width = 36
    co = bpy.data.objects.new("cam", cd)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    dist = rad * margin * focal / 18 * 1.0
    a, e = math.radians(az), math.radians(el)
    co.location = ctr + Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist
    co.rotation_euler = (ctr - co.location).to_track_quat("-Z", "Y").to_euler()
    return ctr


def noise_bump(m, scale=60, strength=0.08):
    nt = m.node_tree
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 8
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(n.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])


def marble(name, base, vein, scale=3.0):
    m = mat(name, base, rough=0.35, coat=0.3)
    nt = m.node_tree
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 10
    n.inputs["Distortion"].default_value = 2.0
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (*base, 1)
    r.color_ramp.elements[1].color = (*vein, 1)
    r.color_ramp.elements[0].position = 0.42
    r.color_ramp.elements[1].position = 0.62
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], r.inputs[0])
    nt.links.new(r.outputs[0], nt.nodes["Principled BSDF"].inputs["Base Color"])
    return m


# ---------- modely ----------
def cestina():
    paper = mat("papir", (0.96, 0.95, 0.9), rough=0.8)
    noise_bump(paper, 220, 0.02)
    blue = mat("modra", (0.2, 0.42, 0.85), rough=0.5)
    red = mat("cervena", (0.85, 0.12, 0.1), rough=0.4, coat=0.3)
    # sešit: deska + listy
    box("deska", (1.5, 0.12, 2.0), (0, 0.06, 0), mat("deska", (0.15, 0.3, 0.7), rough=0.4, coat=0.4), 0.03, rot=(0, 0, 0))
    box("list", (1.42, 0.05, 1.92), (0, -0.0, 0), paper, 0.01)
    for i in range(7):
        box(f"radek{i}", (1.1, 0.004, 0.018), (0.04, -0.03, 0.55 - i * 0.2), blue, 0.002)
    box("okraj", (0.012, 0.004, 1.9), (-0.55, -0.03, 0), mat("okraj", (0.85, 0.2, 0.2), rough=0.5), 0.001)
    text("Aa", "Aa", (-0.2, -0.045, 0.62), 0.5, red, depth=0.03, rot=(math.pi / 2, 0, 0))
    for o in bpy.context.scene.objects:  # sešit trochu naklonit
        pass
    # tužka
    yellow = mat("tuzka", (0.96, 0.72, 0.08), rough=0.28, coat=0.6)
    wood = mat("drevo", (0.86, 0.66, 0.42), rough=0.65)
    graphite = mat("tuha", (0.06, 0.06, 0.07), rough=0.35)
    metal = mat("kov", (0.8, 0.8, 0.82), rough=0.22, metal=1.0)
    pink = mat("guma", (0.95, 0.5, 0.55), rough=0.6)
    L = 2.3
    p = []
    body = cyl("telo", 0.075, L, (0, 0, 0), yellow, 0.008, verts=6)
    tip = cyl("hrot", 0.075, 0.28, (0, 0, L / 2 + 0.14), wood, 0, verts=6, r2=0.016)
    mine = cyl("mina", 0.025, 0.07, (0, 0, L / 2 + 0.29), graphite, 0, verts=24, r2=0.003)
    fer = cyl("kovova", 0.082, 0.14, (0, 0, -L / 2 - 0.07), metal, 0.006, verts=24)
    gum = cyl("gumicka", 0.07, 0.14, (0, 0, -L / 2 - 0.2), pink, 0.02, verts=24)
    for o in (body, tip, mine, fer, gum):
        o.parent = None
    pen = bpy.data.objects.new("tuzka_root", None)
    bpy.context.collection.objects.link(pen)
    for o in (body, tip, mine, fer, gum):
        o.parent = pen
    pen.location = (0.55, -0.22, 0.05)
    pen.rotation_euler = (math.radians(-90 + 10), math.radians(36), 0)
    pen.rotation_euler = (math.radians(86), math.radians(-30), math.radians(0))


def literatura():
    specs = [((0.2, 0.3, 0.8), 1.9, 0.38, 4), ((0.12, 0.55, 0.32), 1.8, 0.36, -3), ((0.85, 0.2, 0.12), 1.95, 0.4, 2)]
    z = 0
    page = mat("strany", (0.95, 0.92, 0.82), rough=0.85)
    noise_bump(page, 400, 0.15)
    gold = mat("zlato", (0.95, 0.72, 0.25), rough=0.25, metal=1.0)
    for i, (col, w, h, rot) in enumerate(specs):
        cov = mat(f"vazba{i}", col, rough=0.5, coat=0.15)
        noise_bump(cov, 120, 0.05)
        d = 1.35
        g = bpy.data.objects.new(f"kniha{i}", None)
        bpy.context.collection.objects.link(g)
        parts = [
            box("zad", (w, d, 0.05), (0, 0, -h / 2 + 0.025), cov, 0.015),
            box("predek", (w, d, 0.05), (0, 0, h / 2 - 0.025), cov, 0.015),
            box("hrbet", (0.07, d, h), (-w / 2 + 0.035, 0, 0), cov, 0.02),
            box("stranky", (w - 0.1, d - 0.07, h - 0.09), (0.035, -0.02, 0), page, 0.006),
            box("pruh", (0.09, d + 0.02, 0.035), (-w / 2 + 0.035, 0, 0.1), gold, 0.006),
            box("pruh2", (0.09, d + 0.02, 0.035), (-w / 2 + 0.035, 0, -0.1), gold, 0.006),
        ]
        for o in parts:
            o.parent = g
        g.location = (0.03 * (i - 1), 0, z + h / 2)
        g.rotation_euler = (0, 0, math.radians(rot))
        z += h + 0.002
    # záložka
    rib = mat("stuha", (0.95, 0.8, 0.15), rough=0.55)
    box("zalozka", (0.07, 0.01, 0.6), (-0.55, -0.7, z - 1.2), rib, 0.003, rot=(0, 0, 0))


def anglictina():
    blue = mat("bublina", (0.12, 0.45, 0.95), rough=0.18, coat=0.8, sss=0.15)
    b = sph("bublina", 1.0, (0, 0, 0.3), blue, scale=(1.35, 0.55, 0.95), seg=64)
    # ocas
    bpy.ops.mesh.primitive_cone_add(radius1=0.4, radius2=0.0, depth=0.75, location=(-0.62, 0, -0.62), rotation=(math.radians(90), math.radians(-35), 0), vertices=48)
    t = bpy.context.object
    t.scale = (1, 0.7, 1)
    finish(t, blue, 0.0, subsurf=1)
    white = mat("bila", (0.97, 0.97, 1.0), rough=0.25, coat=0.5)
    text("Hi", "Hi!", (0.03, -0.55, 0.28), 0.95, white, depth=0.09, rot=(math.radians(90), 0, 0), bevel=0.03)
    # drobný odlesk
    gl = mat("lesk", (1, 1, 1), rough=0.1, emit=(1, 1, 1))


def nemcina():
    # preclík: dvě smyčky a překřížená ramena
    dough = mat("testo", (0.62, 0.3, 0.09), rough=0.32, coat=0.4, coat_rough=0.25, sss=0.1)
    noise_bump(dough, 25, 0.12)
    pts = [(-0.95, 0, -0.55), (-1.15, 0, 0.35), (-0.55, 0, 0.9), (0.0, 0, 0.35), (0.55, 0, -0.35), (1.0, 0, -0.9), (1.15, 0, -0.1), (1.0, 0, 0.55), (0.35, 0, 0.9), (0.0, 0, 0.3), (-0.55, 0, -0.45), (-1.0, 0, -0.9)]
    # vlastní tvar: horní oblouk, překřížení a dolní konce
    import math as m
    P = []
    # levá a pravá smyčka kreslené parametricky
    N = 40
    for i in range(N):
        a = i / N * 2 * m.pi
        x = 1.15 * m.sin(a)
        z = 0.55 * m.sin(2 * a) * 1.0 + 0.1
        P.append((x, 0, z))
    # osmička = lemniskáta, doplníme tloušťku a přidáme horní oblouky
    # (jednoduché a čitelné: překroucená osmička s tlustými konci)
    o = curve_tube("preclik", [(x, 0.0, z * 1.0) for x, _, z in P[::2]], 0.2, dough, closed=True)
    o.rotation_euler = (math.radians(90), 0, 0)
    # druhá smyčka přes osmičku pro typické překřížení
    arc = [(-0.95, 0.12, -0.9), (-1.25, 0.1, -0.1), (-0.8, 0.12, 0.7), (0, 0.12, 0.95), (0.8, 0.12, 0.7), (1.25, 0.1, -0.1), (0.95, 0.12, -0.9)]
    o2 = curve_tube("oblouk", [(x, y, z) for x, y, z in arc], 0.2, dough, closed=False)
    o2.rotation_euler = (math.radians(90), 0, 0)
    o2.location = (0, 0, 0)
    salt = mat("sul", (0.98, 0.97, 0.92), rough=0.3)
    for _ in range(70):
        a = random.random() * math.tau
        x = 1.15 * math.sin(a)
        z = 0.55 * math.sin(2 * a) + 0.1
        bx = box("sul", (0.045, 0.03, 0.03), (x + random.uniform(-0.1, 0.1), -0.17 + random.uniform(-0.04, 0.02), z + random.uniform(-0.1, 0.1)), salt, 0.006, rot=(random.random(), random.random(), random.random()))


def rustina():
    red = mat("cervena", (0.78, 0.07, 0.07), rough=0.32, coat=0.55)
    skin = mat("kuze", (0.99, 0.84, 0.7), rough=0.55, sss=0.2)
    yellow = mat("zluta", (0.97, 0.78, 0.12), rough=0.35, coat=0.3)
    green = mat("zelena", (0.1, 0.5, 0.2), rough=0.4)
    blue = mat("modra", (0.2, 0.4, 0.85), rough=0.4)
    dark = mat("tmava", (0.06, 0.04, 0.04), rough=0.3)
    cheek = mat("tvar", (0.95, 0.4, 0.45), rough=0.6)
    profile = [(0.0, 0.0), (0.55, 0.0), (0.82, 0.15), (0.95, 0.55), (0.88, 1.0), (0.72, 1.4), (0.66, 1.62), (0.72, 1.78), (0.8, 1.98), (0.74, 2.3), (0.55, 2.55), (0.3, 2.68), (0.0, 2.72)]
    body = lo = lathe("matrjoska", profile, (0, 0, 0), red, 96)
    sb = lo.modifiers.new("sub", "SUBSURF")
    sb.levels = sb.render_levels = 2
    # obličej
    f = sph("oblicej", 0.5, (0, -0.44, 2.18), skin, scale=(0.95, 0.35, 1.05))
    for s in (-1, 1):
        sph("oko", 0.06, (s * 0.17, -0.7, 2.28), dark, scale=(1, 0.5, 1.2), seg=24)
        sph("oko_l", 0.015, (s * 0.15, -0.74, 2.32), mat("l", (1, 1, 1), rough=0.1, emit=(1, 1, 1)), seg=12)
        sph("tvar", 0.09, (s * 0.3, -0.69, 2.08), cheek, scale=(1, 0.3, 0.7), seg=24)
    sph("usta", 0.07, (0, -0.72, 1.95), mat("usta", (0.8, 0.15, 0.2), rough=0.4), scale=(1, 0.35, 0.55), seg=24)
    # šátek (pruh kolem obličeje)
    cu = bpy.data.curves.new("satek", "CURVE")
    # květiny na zástěrce
    for i, (x, z, c) in enumerate(((0, 1.0, yellow), (-0.32, 0.72, yellow), (0.32, 0.72, yellow))):
        for k in range(6):
            a = k * math.tau / 6
            sph("lupen", 0.14, (x + 0.16 * math.cos(a) * 0.9, -0.88 + 0.0, z + 0.16 * math.sin(a)), c, scale=(1, 0.25, 1), seg=24)
        sph("stred", 0.1, (x, -0.9, z), mat("s", (0.85, 0.12, 0.12), rough=0.3), scale=(1, 0.4, 1), seg=24)
    for x in (-0.55, -0.15, 0.25):
        pass
    # pruh šátku kolem čela
    t = bpy.ops.mesh.primitive_torus_add(location=(0, -0.05, 2.18), major_radius=0.64, minor_radius=0.06, rotation=(0, 0, 0))
    to = bpy.context.object
    to.scale = (1.0, 0.8, 1.5)
    finish(to, yellow)
    to.hide_render = True


def matematika():
    cols = [((0.9, 0.22, 0.12), "plus", (-0.62, 0.0, 0.62)), ((0.15, 0.35, 0.9), "minus", (0.62, 0.0, 0.62)), ((0.12, 0.6, 0.3), "krat", (-0.62, 0.0, -0.62)), ((0.97, 0.72, 0.1), "deleno", (0.62, 0.0, -0.62))]
    white = mat("symbol", (0.98, 0.98, 1.0), rough=0.3, coat=0.4)
    for i, (c, sym, (x, y, z)) in enumerate(cols):
        m = mat(f"kostka{i}", c, rough=0.28, coat=0.7, coat_rough=0.12, sss=0.1)
        box("kostka", (1.12, 1.12, 1.12), (x, y, z), m, 0.09, rot=(0, 0, 0))
        fy = y - 0.57
        t = 0.1
        if sym == "plus":
            box("p1", (0.6, t, 0.16), (x, fy, z), white, 0.02)
            box("p2", (0.16, t + 0.02, 0.6), (x, fy - 0.01, z), white, 0.02)
        elif sym == "minus":
            box("m", (0.6, t, 0.16), (x, fy, z), white, 0.02)
        elif sym == "krat":
            box("k1", (0.66, t, 0.16), (x, fy, z), white, 0.02, rot=(0, math.radians(45), 0))
            box("k2", (0.66, t + 0.02, 0.16), (x, fy - 0.01, z), white, 0.02, rot=(0, math.radians(-45), 0))
        else:
            box("d", (0.6, t, 0.14), (x, fy, z), white, 0.02)
            for s in (-1, 1):
                sph("tecka", 0.1, (x, fy, z + s * 0.27), white, scale=(1, 0.6, 1), seg=24)


def dejepis():
    mr = marble("mramor", (0.92, 0.89, 0.82), (0.7, 0.66, 0.6), 4.0)
    stone = mat("kamen", (0.78, 0.74, 0.66), rough=0.6)
    noise_bump(stone, 40, 0.1)
    # schody
    for i in range(3):
        box("schod", (3.4 - i * 0.2, 1.9 - i * 0.2, 0.14), (0, 0, 0.07 + i * 0.14), mr, 0.015)
    z0 = 0.42
    # sloupy
    for i in range(6):
        x = -1.28 + i * 0.512
        for y in (-0.62, 0.62):
            cyl("sloup", 0.12, 1.5, (x, y, z0 + 0.82), mr, 0.0, verts=24)
            for k in range(12):  # kanelury
                a = k * math.tau / 12
                cyl("kan", 0.012, 1.4, (x + 0.118 * math.cos(a), y + 0.118 * math.sin(a), z0 + 0.82), stone, 0, verts=8)
            box("hlavice", (0.34, 0.34, 0.08), (x, y, z0 + 1.6), mr, 0.012)
            cyl("patka", 0.16, 0.06, (x, y, z0 + 0.03), mr, 0.01, verts=24)
    zt = z0 + 1.66
    box("architrav", (3.2, 1.5, 0.28), (0, 0, zt + 0.14), mr, 0.02)
    box("fries", (3.25, 1.55, 0.06), (0, 0, zt + 0.31), stone, 0.01)
    # štít (trojúhelníkový hranol)
    bm = bmesh.new()
    pts = [(-1.7, -0.78, zt + 0.34), (1.7, -0.78, zt + 0.34), (0, -0.78, zt + 1.05)]
    vf = [bm.verts.new(p) for p in pts]
    vb = [bm.verts.new((p[0], 0.78, p[2])) for p in pts]
    bm.faces.new(vf)
    bm.faces.new(vb[::-1])
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((vf[i], vf[j], vb[j], vb[i]))
    me = bpy.data.meshes.new("stit")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("stit", me)
    bpy.context.collection.objects.link(o)
    finish(o, mr, 0.02, smooth=False)
    # vnitřní pole štítu
    bm = bmesh.new()
    pts = [(-1.35, -0.8, zt + 0.43), (1.35, -0.8, zt + 0.43), (0, -0.8, zt + 0.88)]
    v = [bm.verts.new(p) for p in pts]
    bm.faces.new(v)
    me = bpy.data.meshes.new("pole")
    bm.to_mesh(me)
    bm.free()
    po = bpy.data.objects.new("pole", me)
    bpy.context.collection.objects.link(po)
    finish(po, stone, 0, smooth=False)


def zemepis():
    # glóbus s procedurálními kontinenty
    gm = bpy.data.materials.new("zeme")
    gm.use_nodes = True
    nt = gm.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.28
    b.inputs["Coat Weight"].default_value = 0.6
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 1.15
    n.inputs["Detail"].default_value = 6
    n.inputs["Roughness"].default_value = 0.55
    n.inputs["Distortion"].default_value = 0.6
    r = nt.nodes.new("ShaderNodeValToRGB")
    cs = r.color_ramp.elements
    cs[0].position = 0.0
    cs[0].color = (0.04, 0.22, 0.62, 1)
    cs[1].position = 0.5
    cs[1].color = (0.1, 0.5, 0.2, 1)
    e = cs.new(0.47)
    e.color = (0.08, 0.38, 0.72, 1)
    e2 = cs.new(0.505)
    e2.color = (0.8, 0.72, 0.45, 1)
    e3 = cs.new(0.56)
    e3.color = (0.12, 0.5, 0.2, 1)
    e4 = cs.new(0.78)
    e4.color = (0.5, 0.4, 0.28, 1)
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], r.inputs[0])
    nt.links.new(r.outputs[0], b.inputs["Base Color"])
    g = sph("glob", 1.0, (0, 0, 1.6), gm, seg=96)
    g.rotation_euler = (0, math.radians(23), 0)
    # polární čepičky
    ice = mat("led", (0.97, 0.98, 1.0), rough=0.4)
    for s in (-1, 1):
        sph("cepicka", 0.33, (0, 0, 1.6 + s * 0.97), ice, scale=(1, 1, 0.3), seg=32)
    gold = mat("mosaz", (0.9, 0.65, 0.2), rough=0.22, metal=1.0)
    bpy.ops.mesh.primitive_torus_add(location=(0, 0, 1.6), major_radius=1.22, minor_radius=0.035, major_segments=96, rotation=(math.radians(90), 0, 0))
    ring = bpy.context.object
    finish(ring, gold)
    # poloviční oblouk (otevřeme prstenec: odřízneme dolní část podstavcem)
    cyl("osa", 0.03, 2.55, (0, 0, 1.6), gold, 0.0, verts=16)
    brown = mat("drevo", (0.35, 0.18, 0.08), rough=0.4, coat=0.4)
    cyl("noha", 0.1, 0.5, (0, 0, 0.35), gold, 0.0, verts=32, r2=0.07)
    cyl("podstavec", 0.65, 0.12, (0, 0, 0.06), brown, 0.03, verts=64)
    cyl("podstavec2", 0.5, 0.1, (0, 0, 0.17), gold, 0.015, verts=64)


def prirodopis():
    green = mat("gekon", (0.28, 0.72, 0.18), rough=0.35, coat=0.5, sss=0.25)
    noise_bump(green, 140, 0.25)
    belly = mat("bricho", (0.78, 0.9, 0.4), rough=0.45, sss=0.2)
    spot = mat("skvrny", (0.95, 0.75, 0.1), rough=0.35)
    eye = mat("oko", (1, 1, 1), rough=0.05, coat=1.0)
    dark = mat("zornice", (0.02, 0.02, 0.02), rough=0.1)
    pad = mat("list", (0.1, 0.45, 0.15), rough=0.5, sss=0.2)
    # leknín
    cyl("list", 1.5, 0.07, (0, 0, 0.035), pad, 0.02, verts=96)
    # tělo: řetěz koulí
    chain = [(0.0, 0.0, 0.42, 0.52), (-0.5, 0.0, 0.42, 0.5), (-0.98, 0.0, 0.4, 0.42)]
    for i, (x, y, z, r) in enumerate(chain):
        sph("telo", r, (x, y, z), green, scale=(1.15, 0.85, 0.75))
    sph("hlava", 0.46, (0.7, 0.0, 0.5), green, scale=(1.25, 0.95, 0.8))
    sph("tlama", 0.3, (1.0, 0.0, 0.4), green, scale=(1.1, 0.85, 0.65))
    sph("bricho", 0.5, (-0.2, 0.0, 0.2), belly, scale=(1.9, 0.9, 0.35))
    for s in (-1, 1):
        sph("oko", 0.2, (0.75, s * 0.33, 0.78), eye, seg=48)
        sph("zornice", 0.1, (0.9, s * 0.38, 0.82), dark, seg=32)
        sph("odlesk", 0.03, (0.95, s * 0.35, 0.9), mat("o", (1, 1, 1), rough=0.1, emit=(1, 1, 1)), seg=12)
        # nohy
        for fx, bx in ((0.45, 1), (-0.7, -1)):
            sph("stehno", 0.18, (fx, s * 0.62, 0.3), green, scale=(1.1, 1.0, 0.8))
            sph("chodidlo", 0.15, (fx + 0.2 * bx, s * 0.95, 0.12), green, scale=(1.3, 1.1, 0.45))
            for k in (-1, 0, 1):
                sph("prst", 0.045, (fx + 0.38 * bx + 0.03 * k, s * 1.0 + 0.1 * k * s, 0.09), green, scale=(1.4, 0.8, 0.6), seg=16)
    # skvrny na hřbetu
    for i in range(7):
        x = 0.35 - i * 0.28
        sph("skvrna", 0.1 - i * 0.004, (x, 0.0, 0.42 + 0.35 + (0.05 if i % 2 else 0)), spot, scale=(1.2, 1.0, 0.5), seg=24)
    # ocas: zužující se trubice
    tail = [(-1.2, 0, 0.35), (-1.6, 0.25, 0.25), (-1.95, 0.55, 0.15), (-2.2, 0.25, 0.1), (-2.3, -0.1, 0.1)]
    curve_tube("ocas", tail, 0.3, green, taper=[(0, 1.0), (0.5, 0.5), (1, 0.05)])
    sph("lek_kvet", 0.0001, (0, 0, 0), pad)  # dummy aby slug nebyl prázdný



# ---------- opravené verze (přepisují ty výše) ----------
def anglictina():
    blue = mat("bublina", (0.12, 0.45, 0.95), rough=0.18, coat=0.8, sss=0.15)
    sph("bublina", 1.0, (0, 0, 0.3), blue, scale=(1.35, 0.55, 0.95), seg=64)
    bpy.ops.mesh.primitive_cone_add(radius1=0.42, radius2=0.0, depth=0.95, location=(-0.75, 0, -0.45), rotation=(0, math.radians(-149.5), 0), vertices=64)
    t = bpy.context.object
    t.scale = (1, 0.55, 1)
    finish(t, blue, 0.0, subsurf=1)
    white = mat("bila", (0.97, 0.97, 1.0), rough=0.25, coat=0.5)
    text("Hi", "Hi!", (0.03, -0.55, 0.28), 0.95, white, depth=0.09, rot=(math.radians(90), 0, 0), bevel=0.03)


def cestina():
    paper = mat("papir", (0.96, 0.95, 0.9), rough=0.8)
    noise_bump(paper, 220, 0.02)
    blue = mat("modra", (0.2, 0.42, 0.85), rough=0.5)
    red = mat("cervena", (0.85, 0.12, 0.1), rough=0.4, coat=0.3)
    box("deska", (1.5, 0.12, 2.0), (0, 0.06, 0), mat("deska", (0.15, 0.3, 0.7), rough=0.4, coat=0.4), 0.03)
    box("list", (1.42, 0.05, 1.92), (0, 0.0, 0), paper, 0.01)
    for i in range(7):
        box(f"radek{i}", (1.1, 0.004, 0.018), (0.04, -0.03, 0.55 - i * 0.2), blue, 0.002)
    box("okraj", (0.012, 0.004, 1.9), (-0.55, -0.03, 0), mat("okraj", (0.85, 0.2, 0.2), rough=0.5), 0.001)
    text("Aa", "Aa", (-0.2, -0.045, 0.62), 0.5, red, depth=0.03, rot=(math.pi / 2, 0, 0))
    yellow = mat("tuzka", (0.96, 0.72, 0.08), rough=0.28, coat=0.6)
    wood = mat("drevo", (0.86, 0.66, 0.42), rough=0.65)
    graphite = mat("tuha", (0.06, 0.06, 0.07), rough=0.35)
    metal = mat("kov", (0.8, 0.8, 0.82), rough=0.22, metal=1.0)
    pink = mat("guma", (0.95, 0.5, 0.55), rough=0.6)
    L = 2.6
    parts = [
        cyl("telo", 0.09, L, (0, 0, 0), yellow, 0.01, verts=6),
        cyl("hrot", 0.09, 0.34, (0, 0, L / 2 + 0.17), wood, 0, verts=6, r2=0.02),
        cyl("mina", 0.03, 0.08, (0, 0, L / 2 + 0.35), graphite, 0, verts=24, r2=0.004),
        cyl("kovova", 0.098, 0.16, (0, 0, -L / 2 - 0.08), metal, 0.006, verts=24),
        cyl("gumicka", 0.085, 0.16, (0, 0, -L / 2 - 0.23), pink, 0.025, verts=24),
    ]
    pen = bpy.data.objects.new("tuzka_root", None)
    bpy.context.collection.objects.link(pen)
    for o in parts:
        o.parent = pen
    pen.location = (0.3, -0.28, -0.1)
    pen.rotation_euler = (0, math.radians(52), 0)


def nemcina():
    dough = mat("testo", (0.62, 0.3, 0.09), rough=0.3, coat=0.45, coat_rough=0.25, sss=0.1)
    noise_bump(dough, 25, 0.12)
    P = [(1.10, 0.32, -0.15), (1.15, 0.16, 0.55), (0.65, 0.10, 0.95), (0.1, 0.30, 0.45), (-0.45, 0.2, -0.15), (-0.9, 0.08, -0.8), (0.0, 0.06, -1.1),
         (0.9, 0.08, -0.8), (0.45, 0.2, -0.15), (-0.1, 0.1, 0.45), (-0.65, 0.10, 0.95), (-1.15, 0.16, 0.55), (-1.10, 0.32, -0.15)]
    curve_tube("preclik", [(x, y, z) for x, y, z in P], 0.17, dough)
    salt = mat("sul", (0.98, 0.97, 0.92), rough=0.3)
    for _ in range(90):
        i = random.randrange(len(P) - 1)
        t = random.random()
        a, b = P[i], P[i + 1]
        x, y, z = [a[k] + (b[k] - a[k]) * t for k in range(3)]
        box("sul", (0.05, 0.03, 0.035), (x + random.uniform(-0.06, 0.06), y - 0.15, z + random.uniform(-0.06, 0.06)), salt, 0.008, rot=(random.random(), random.random(), random.random()))


def rustina():
    red = mat("cervena", (0.78, 0.07, 0.07), rough=0.32, coat=0.55)
    skin = mat("kuze", (0.99, 0.84, 0.7), rough=0.55, sss=0.2)
    yellow = mat("zluta", (0.97, 0.78, 0.12), rough=0.35, coat=0.3)
    dark = mat("tmava", (0.06, 0.04, 0.04), rough=0.3)
    cheek = mat("tvar", (0.95, 0.4, 0.45), rough=0.6)
    profile = [(0.0, 0.0), (0.55, 0.0), (0.82, 0.15), (0.95, 0.55), (0.88, 1.0), (0.72, 1.4), (0.66, 1.62), (0.72, 1.78), (0.8, 1.98), (0.76, 2.3), (0.58, 2.58), (0.3, 2.72), (0.0, 2.76)]
    lo = lathe("matrjoska", profile, (0, 0, 0), red, 96)
    sb = lo.modifiers.new("sub", "SUBSURF")
    sb.levels = sb.render_levels = 2
    sph("oblicej", 0.5, (0, -0.7, 2.28), skin, scale=(0.95, 0.4, 1.05))
    for sx in (-1, 1):
        sph("oko", 0.06, (sx * 0.17, -0.88, 2.38), dark, scale=(1, 0.5, 1.2), seg=24)
        sph("oko_l", 0.016, (sx * 0.15, -0.92, 2.42), mat("l", (1, 1, 1), rough=0.1, emit=(1, 1, 1)), seg=12)
        sph("tvar", 0.09, (sx * 0.3, -0.86, 2.18), cheek, scale=(1, 0.3, 0.7), seg=24)
    sph("usta", 0.07, (0, -0.9, 2.05), mat("usta", (0.8, 0.15, 0.2), rough=0.4), scale=(1, 0.35, 0.55), seg=24)
    bpy.ops.mesh.primitive_torus_add(location=(0, -0.68, 2.28), major_radius=0.5, minor_radius=0.065, rotation=(math.pi / 2, 0, 0), major_segments=64)
    to = bpy.context.object
    to.scale = (0.96, 1.0, 1.1)
    finish(to, yellow)
    for x, z in ((0, 1.0), (-0.34, 0.7), (0.34, 0.7)):
        for k in range(6):
            a = k * math.tau / 6
            sph("lupen", 0.14, (x + 0.15 * math.cos(a), -0.9, z + 0.15 * math.sin(a)), yellow, scale=(1, 0.25, 1), seg=24)
        sph("stred", 0.1, (x, -0.92, z), mat("s", (0.85, 0.12, 0.12), rough=0.3), scale=(1, 0.4, 1), seg=24)


def zemepis_globus_mat():
    pass


def prirodopis():
    green = mat("gekon", (0.28, 0.72, 0.18), rough=0.35, coat=0.5, sss=0.25)
    noise_bump(green, 140, 0.15)
    belly = mat("bricho", (0.78, 0.9, 0.4), rough=0.45, sss=0.2)
    spot = mat("skvrny", (0.95, 0.75, 0.1), rough=0.35)
    eye = mat("oko", (1, 1, 1), rough=0.05, coat=1.0)
    dark = mat("zornice", (0.02, 0.02, 0.02), rough=0.1)
    pad = mat("list", (0.1, 0.45, 0.15), rough=0.5, sss=0.2)
    cyl("list", 1.6, 0.07, (0.0, 0, 0.035), pad, 0.02, verts=96)
    parts = []
    # tělo, hlava a ocas jako překrývající se koule, které se pak sloučí do jednoho tvaru
    def blob(r, loc, sc=(1, 1, 1)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=32, ring_count=16)
        o = bpy.context.object
        o.scale = sc
        parts.append(o)
    for i in range(7):
        x = 0.35 - i * 0.22
        blob(0.52 - i * 0.012, (x, 0, 0.45), (1.1, 0.85, 0.75))
    blob(0.46, (0.78, 0, 0.52), (1.25, 0.95, 0.8))
    blob(0.3, (1.1, 0, 0.42), (1.1, 0.85, 0.65))
    for sx in (-1, 1):
        for fx, bx in ((0.5, 1), (-0.7, -1)):
            blob(0.19, (fx, sx * 0.58, 0.3), (1.1, 1.0, 0.8))
            blob(0.15, (fx + 0.2 * bx, sx * 0.88, 0.14), (1.3, 1.1, 0.45))
    tail = [(-1.25, 0, 0.4), (-1.55, 0.12, 0.32), (-1.85, 0.3, 0.24), (-2.1, 0.5, 0.17), (-2.35, 0.55, 0.13), (-2.55, 0.4, 0.1), (-2.65, 0.2, 0.09)]
    for i, (x, y, z) in enumerate(tail):
        blob(0.3 * (1 - i / (len(tail) + 0.5)) + 0.04, (x, y, z), (1, 1, 0.75))
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    g = bpy.context.object
    rm = g.modifiers.new("remesh", "REMESH")
    rm.mode = "VOXEL"
    rm.voxel_size = 0.035
    rm.use_smooth_shade = True
    sm = g.modifiers.new("smooth", "SMOOTH")
    sm.iterations = 4
    sm.factor = 0.8
    finish(g, green)
    sph("bricho", 0.5, (-0.2, 0.0, 0.18), belly, scale=(2.0, 0.9, 0.3))
    for sx in (-1, 1):
        sph("oko", 0.2, (0.85, sx * 0.34, 0.8), eye, seg=48)
        sph("zornice", 0.1, (1.0, sx * 0.38, 0.84), dark, seg=32)
        sph("odlesk", 0.03, (1.05, sx * 0.35, 0.92), mat("o", (1, 1, 1), rough=0.1, emit=(1, 1, 1)), seg=12)
    for i in range(7):
        x = 0.4 - i * 0.28
        sph("skvrna", 0.1 - i * 0.005, (x, 0.0, 0.8 + 0.0), spot, scale=(1.2, 1.0, 0.45), seg=24)


def fyzika():
    """Atom: jádro z červených a modrých kuliček, tři kovové oběžné dráhy a tři elektrony."""
    red = mat("proton", (0.9, 0.15, 0.1), rough=0.25, coat=0.8, coat_rough=0.1, sss=0.1)
    blue = mat("neutron", (0.15, 0.4, 0.95), rough=0.25, coat=0.8, coat_rough=0.1, sss=0.1)
    ring = mat("draha", (0.85, 0.87, 0.92), rough=0.22, metal=1.0)
    elec = mat("elektron", (1.0, 0.8, 0.12), rough=0.2, coat=0.9, coat_rough=0.06, emit=(1.0, 0.55, 0.05))
    for i, (x, y, z) in enumerate([(0.2, 0.0, 0.2), (-0.2, 0.15, 0.1), (0.0, -0.2, -0.2), (0.12, 0.22, -0.18), (-0.18, -0.1, 0.24), (0.0, 0.0, -0.02)]):
        sph("jadro", 0.27, (x, y, z), red if i % 2 == 0 else blue, seg=32)
    R, r = 1.35, 0.5
    for k, ang in enumerate((0, 60, 120)):
        a = math.radians(ang)
        pts = []
        for j in range(64):
            t = 2 * math.pi * j / 64
            x, z = R * math.cos(t), r * 2.0 * math.sin(t) * 0.5
            # elipsa se otočí kolem osy pohledu o `ang`
            xr = x * math.cos(a) - z * math.sin(a) * 1.0
            zr = x * math.sin(a) + z * math.cos(a)
            pts.append((xr, 0.0 + 0.45 * math.sin(t + k) * 0.5, zr))
        curve_tube("draha", pts, 0.035, ring, closed=True, res=8)
        t0 = 2 * math.pi * (0.15 + 0.3 * k)
        x, z = R * math.cos(t0), r * math.sin(t0)
        xr = x * math.cos(a) - z * math.sin(a)
        zr = x * math.sin(a) + z * math.cos(a)
        sph("elektron", 0.16, (xr, 0.45 * math.sin(t0 + k) * 0.5, zr), elec, seg=32)


def chemie():
    """Erlenmeyerova baňka se svítivým roztokem, bublinami a zkumavkou."""
    glass = mat("sklo", (0.9, 0.97, 1.0), rough=0.04, coat=1.0, coat_rough=0.02, spec=0.8)
    gb = glass.node_tree.nodes["Principled BSDF"]
    for k, v in (("Transmission Weight", 0.9), ("IOR", 1.45)):
        if k in gb.inputs:
            gb.inputs[k].default_value = v
    liq = mat("roztok", (0.35, 0.95, 0.5), rough=0.2, coat=0.6, emit=(0.2, 0.9, 0.35))
    liq2 = mat("roztok2", (0.9, 0.35, 0.85), rough=0.2, coat=0.6, emit=(0.9, 0.2, 0.8))
    cork = mat("korek", (0.7, 0.5, 0.3), rough=0.8)
    lathe("banka", [(0.0, -0.9), (0.9, -0.9), (0.95, -0.82), (0.5, 0.35), (0.22, 0.6), (0.22, 1.05), (0.3, 1.1), (0.3, 1.15), (0.2, 1.15)], (0, 0, 0), glass)
    lathe("roztok", [(0.0, -0.84), (0.86, -0.84), (0.9, -0.78), (0.62, -0.25), (0.0, -0.25)], (0, 0, 0), liq)
    cyl("korek", 0.19, 0.2, (0, 0, 1.2), cork, 0.01)
    for i, (x, y, z, r) in enumerate([(0.15, -0.1, -0.1, 0.12), (-0.2, 0.0, 0.1, 0.09), (0.05, 0.1, 0.35, 0.07), (0.1, -0.05, 0.8, 0.08)]):
        sph("bublina", r, (x, y - 0.1, z), glass, seg=24)
    # zkumavka vedle
    lathe("zkumavka", [(0.0, -0.8), (0.17, -0.8), (0.2, -0.6), (0.2, 0.7), (0.23, 0.74), (0.2, 0.74)], (1.25, -0.1, 0.0), glass)
    lathe("roztok_z", [(0.0, -0.74), (0.14, -0.74), (0.17, -0.58), (0.17, 0.05), (0.0, 0.05)], (1.25, -0.1, 0.0), liq2)


def obcanka():
    """Volební urna s lístkem, vlajka a váhy spravedlnosti."""
    blue = mat("urna", (0.2, 0.42, 0.95), rough=0.3, coat=0.6)
    dark = mat("tmava", (0.08, 0.08, 0.12), rough=0.5)
    paper = mat("listek", (0.99, 0.97, 0.9), rough=0.7)
    gold = mat("zlato", (1.0, 0.78, 0.2), rough=0.2, metal=1.0)
    green = mat("zelena", (0.15, 0.7, 0.3), rough=0.4)
    red = mat("cervena", (0.85, 0.15, 0.15), rough=0.4)
    box("urna", (1.3, 1.1, 1.1), (0, 0, 0), blue, 0.05)
    box("stesbina", (0.8, 0.14, 0.04), (0, 0, 0.56), dark, 0.005)
    box("listek", (0.55, 0.02, 0.75), (0, -0.05, 0.95), paper, 0.005, rot=(0, math.radians(8), 0))
    for i in range(3):
        box("radek", (0.38, 0.005, 0.03), (0, -0.07, 1.15 - i * 0.14), dark, 0.001, rot=(0, math.radians(8), 0))
    box("zaskrtnuti", (0.14, 0.01, 0.035), (-0.12, -0.075, 0.75), green, 0.002, rot=(0, math.radians(-45), 0))
    box("zaskrtnuti2", (0.26, 0.01, 0.035), (0.05, -0.075, 0.78), green, 0.002, rot=(0, math.radians(50), 0))
    box("stitek", (0.5, 0.02, 0.4), (0, -0.56, 0.0), paper, 0.01)
    sph("hvezda", 0.12, (0, -0.58, 0.02), gold, scale=(1, 0.2, 1), seg=24)
    # váhy
    cyl("sloupek", 0.04, 1.5, (1.4, 0, 0.1), gold, 0.005, verts=24)
    cyl("podstava", 0.28, 0.1, (1.4, 0, -0.65), gold, 0.01, verts=32)
    box("ramena", (1.1, 0.05, 0.05), (1.4, 0, 0.82), gold, 0.01)
    for sx in (-1, 1):
        x = 1.4 + sx * 0.5
        cyl("miska", 0.22, 0.04, (x, 0, 0.25), gold, 0.005, verts=32)
        for dx in (-0.14, 0.14):
            cyl("retizek", 0.008, 0.6, (x + dx * 0.9, 0, 0.55), gold, verts=8, rot=(0, math.radians(dx * 40), 0))
    sph("kulicka", 0.07, (1.4, 0, 0.9), gold, seg=24)


def hudebka():
    """Dvě spojené osminové noty na notové osnově a zlatý houslový klíč z kruhových oblouků."""
    gold = mat("zlato", (1.0, 0.78, 0.2), rough=0.2, coat=0.5, metal=1.0)
    note = mat("nota", (0.1, 0.08, 0.2), rough=0.25, coat=0.9)
    pink = mat("ruzova", (1.0, 0.4, 0.6), rough=0.3, coat=0.7)
    paper = mat("osnova", (0.98, 0.96, 0.9), rough=0.7)
    box("osnova", (3.0, 0.08, 1.5), (0, 0.1, 0), paper, 0.03)
    for i in range(5):
        box("linka", (2.8, 0.01, 0.025), (0, 0.04, -0.4 + i * 0.2), note, 0.002)
    for x in (-0.55, 0.65):
        sph("hlavicka", 0.19, (x, -0.02, -0.5), note, scale=(1.3, 0.55, 0.95), seg=32)
        box("nozicka", (0.05, 0.05, 1.3), (x + 0.2, -0.02, 0.1), note, 0.01)
    box("trambus", (1.35, 0.06, 0.22), (0.22, -0.02, 0.68), note, 0.01, rot=(0, math.radians(-3), 0))
    # houslový klíč: spirála + svislý tah (trubice po křivce)
    pts = [(-1.1, -0.1, -0.6), (-1.35, -0.1, -0.35), (-1.15, -0.1, -0.05), (-0.95, -0.1, 0.4), (-1.2, -0.1, 0.7), (-1.4, -0.1, 0.3), (-1.2, -0.1, 0.0), (-0.95, -0.1, 0.1)]
    curve_tube("klic", pts, 0.05, gold, res=16)
    sph("klic_hlava", 0.09, (-1.1, -0.1, -0.62), gold, seg=24)


def francouzstina():
    """Baret na bagetě a malá trikolóra."""
    navy = mat("baret", (0.1, 0.16, 0.45), rough=0.9, sss=0.0)
    noise_bump(navy, 120, 0.04)
    crust = mat("kurka", (0.88, 0.62, 0.3), rough=0.6, sss=0.1)
    noise_bump(crust, 60, 0.03)
    dark = mat("zarez", (0.62, 0.38, 0.14), rough=0.7)
    blue = mat("modra", (0.0, 0.25, 0.65), rough=0.45)
    white = mat("bila", (0.98, 0.98, 1.0), rough=0.45)
    red = mat("cervena", (0.88, 0.12, 0.18), rough=0.45)
    # bageta (podlouhlá kapsle) leží vpředu, baret za ní
    ang = math.radians(-14)
    bag = sph("bageta", 0.32, (0.0, -0.45, -0.5), crust, scale=(3.6, 1.0, 0.95), seg=48)
    bag.rotation_euler = (0, 0, ang)
    for i in range(5):
        x = -1.0 + i * 0.5
        o = sph("zarez", 0.17, (x * math.cos(ang), -0.45 + x * math.sin(ang), -0.22), dark, scale=(1.0, 0.2, 0.45), seg=24)
        o.rotation_euler = (0, 0, ang + math.radians(40))
    # baret
    sph("baret", 0.8, (0.35, 0.55, 0.15), navy, scale=(1.0, 1.0, 0.36), seg=48)
    sph("copanek", 0.06, (0.35, 0.55, 0.42), navy, seg=16)
    cyl("lem", 0.62, 0.05, (0.35, 0.55, -0.12), mat("lem", (0.07, 0.11, 0.33), rough=0.8), 0.01, verts=48)
    # vlajka
    for i, m in enumerate((blue, white, red)):
        box("pruh", (0.22, 0.03, 0.5), (-1.25 + i * 0.22, -0.7, 0.55), m, 0.005)
    cyl("tycka", 0.018, 1.0, (-1.38, -0.7, 0.35), mat("tycka", (0.8, 0.82, 0.88), rough=0.25, metal=1.0), verts=12)


BUILDERS = {
    "cestina": cestina,
    "literatura": literatura,
    "anglictina": anglictina,
    "nemcina": nemcina,
    "rustina": rustina,
    "matematika": matematika,
    "dejepis": dejepis,
    "zemepis": zemepis,
    "prirodopis": prirodopis,
    "fyzika": fyzika,
    "chemie": chemie,
    "obcanka": obcanka,
    "hudebka": hudebka,
    "francouzstina": francouzstina,
}
CAM = {"fyzika": (-18, 22), "chemie": (-18, 16), "obcanka": (-24, 18), "hudebka": (-14, 14), "francouzstina": (-20, 28), "cestina": (-14, 14), "dejepis": (-24, 24), "zemepis": (-20, 14), "prirodopis": (-20, 24), "matematika": (-22, 20), "anglictina": (-14, 10), "rustina": (-16, 8), "nemcina": (-6, 6), "literatura": (-30, 24)}


def render_all(builders, cams, only, out, prefix, size=512):
    from PIL import Image

    for slug, fn in builders.items():
        if only and slug not in only:
            continue
        reset()
        setup_scene()
        fn()
        az, el = cams.get(slug, (-25, 20))
        frame_camera(az=az, el=el)
        path = os.path.join(out, f"{slug}.png")
        bpy.context.scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        im = Image.open(path).convert("RGBA")
        bb = im.getchannel("A").point(lambda a: 255 if a > 6 else 0).getbbox()
        if bb:
            w, h = bb[2] - bb[0], bb[3] - bb[1]
            side = max(w, h) + 2 * int(max(w, h) * 0.04)
            sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            sq.paste(im.crop(bb), ((side - w) // 2, (side - h) // 2))
            im = sq
        im.resize((size, size), Image.LANCZOS).save(os.path.join(out, f"{prefix}{slug}.webp"), quality=90, method=6)
        print("OK", slug)


if __name__ == "__main__":
    render_all(BUILDERS, CAM, ONLY, OUT, "predmet-")
