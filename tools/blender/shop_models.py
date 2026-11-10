"""Modely pro obchod: kategorie, suroviny a doplňky.

Spuštění (potřebuje modul bpy, `pip install bpy`):
    python3 tools/blender/shop_models.py [id ...]      # bez argumentů se udělají všechny

Pro každý model vznikne:
  public/shop-models/<id>.glb   model s animací (plynulé otáčení, smyčka)
  public/shop-models/<id>.webp  animovaná smyčka vyrenderovaná v Cycles (průhledné pozadí)
"""
import math
import os
import sys

import bpy
import bmesh
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "shop-models")
FRAMES = os.environ.get("SHOP_FRAMES_DIR", "/tmp/shop-frames")
N = 24  # snímků ve smyčce
SIZE = int(os.environ.get("SHOP_SIZE", "320"))
SAMPLES = int(os.environ.get("SHOP_SAMPLES", "32"))
MINZ = [-1.0]


# ---------------------------------------------------------------- pomocné funkce
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, metal=0.0, rough=0.5, trans=0.0, ior=1.45, emit=None, emit_strength=0.0, coat=0.0, sheen=0.0, bump=0.0, noise=40.0, absorb=None,
        tint2=None, tscale=5.0, rvar=0.0, voro=0.0, vscale=12.0, crack=None, crack_scale=4.0, rings=None, brick=None):
    """PBR materiál. tint2 = druhá barva míchaná šumem, rvar = kolísání drsnosti (škrábance, otěr),
    voro = buňkový reliéf (kámen, šupiny), crack = zářící praskliny, rings = letokruhy, brick = šindele."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    t = m.node_tree
    bsdf = t.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["IOR"].default_value = ior
    if trans:
        bsdf.inputs["Transmission Weight"].default_value = trans
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = 0.05
    if sheen:
        bsdf.inputs["Sheen Weight"].default_value = sheen
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = emit_strength
    if absorb:
        v = t.nodes.new("ShaderNodeVolumeAbsorption")
        v.inputs["Color"].default_value = (*absorb[:3], 1)
        v.inputs["Density"].default_value = absorb[3]
        t.links.new(v.outputs["Volume"], t.nodes["Material Output"].inputs["Volume"])

    def mix_colors(fac_socket, a, b_):
        mx = t.nodes.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        t.links.new(fac_socket, mx.inputs[0])
        mx.inputs[6].default_value = (*a, 1)
        mx.inputs[7].default_value = (*b_, 1)
        return mx.outputs[2]

    if rings:
        w = t.nodes.new("ShaderNodeTexWave")
        w.wave_type = "RINGS"
        w.rings_direction = "Z"
        w.inputs["Scale"].default_value = 7
        w.inputs["Distortion"].default_value = 3
        w.inputs["Detail"].default_value = 3
        t.links.new(mix_colors(w.outputs["Fac"], color, rings), bsdf.inputs["Base Color"])
    elif brick and tint2:
        br = t.nodes.new("ShaderNodeTexBrick")
        br.inputs["Scale"].default_value = brick
        br.inputs["Color1"].default_value = (*color, 1)
        br.inputs["Color2"].default_value = (*tint2, 1)
        br.inputs["Mortar"].default_value = (color[0] * 0.4, color[1] * 0.4, color[2] * 0.4, 1)
        br.inputs["Mortar Size"].default_value = 0.02
        t.links.new(br.outputs["Color"], bsdf.inputs["Base Color"])
        bb = t.nodes.new("ShaderNodeBump")
        bb.inputs["Strength"].default_value = 0.5
        t.links.new(br.outputs["Fac"], bb.inputs["Height"])
        t.links.new(bb.outputs["Normal"], bsdf.inputs["Normal"])
    elif tint2:
        n = t.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = tscale
        n.inputs["Detail"].default_value = 8
        cr = t.nodes.new("ShaderNodeValToRGB")
        cr.color_ramp.elements[0].position = 0.35
        cr.color_ramp.elements[1].position = 0.65
        t.links.new(n.outputs["Fac"], cr.inputs["Fac"])
        t.links.new(mix_colors(cr.outputs["Color"], color, tint2), bsdf.inputs["Base Color"])
    if rvar:
        n = t.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = 28
        n.inputs["Detail"].default_value = 10
        ma = t.nodes.new("ShaderNodeMath")
        ma.operation = "MULTIPLY_ADD"
        t.links.new(n.outputs["Fac"], ma.inputs[0])
        ma.inputs[1].default_value = rvar
        ma.inputs[2].default_value = max(rough - rvar / 2, 0.02)
        t.links.new(ma.outputs[0], bsdf.inputs["Roughness"])
    nrm = None
    if bump:
        n = t.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = noise
        n.inputs["Detail"].default_value = 10
        b = t.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = bump
        t.links.new(n.outputs["Fac"], b.inputs["Height"])
        nrm = b.outputs["Normal"]
    if voro:
        vn = t.nodes.new("ShaderNodeTexVoronoi")
        vn.inputs["Scale"].default_value = vscale
        vb = t.nodes.new("ShaderNodeBump")
        vb.inputs["Strength"].default_value = voro
        t.links.new(vn.outputs["Distance"], vb.inputs["Height"])
        if nrm is not None:
            t.links.new(nrm, vb.inputs["Normal"])
        nrm = vb.outputs["Normal"]
    if nrm is not None and not brick:
        t.links.new(nrm, bsdf.inputs["Normal"])
    if crack:
        cv = t.nodes.new("ShaderNodeTexVoronoi")
        cv.feature = "DISTANCE_TO_EDGE"
        cv.inputs["Scale"].default_value = crack_scale
        cr = t.nodes.new("ShaderNodeValToRGB")
        cr.color_ramp.elements[0].position = 0.0
        cr.color_ramp.elements[0].color = (1, 1, 1, 1)
        cr.color_ramp.elements[1].position = 0.05
        cr.color_ramp.elements[1].color = (0, 0, 0, 1)
        t.links.new(cv.outputs["Distance"], cr.inputs["Fac"])
        ms = t.nodes.new("ShaderNodeMath")
        ms.operation = "MULTIPLY"
        t.links.new(cr.outputs["Color"], ms.inputs[0])
        ms.inputs[1].default_value = emit_strength or 8.0
        t.links.new(ms.outputs[0], bsdf.inputs["Emission Strength"])
        bsdf.inputs["Emission Color"].default_value = (*crack, 1)
    return m


def finish(obj, m, smooth=True, bevel=0.0, subsurf=0):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    if smooth:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth()
        obj.select_set(False)
    if bevel:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
    if subsurf:
        mod = obj.modifiers.new("sub", "SUBSURF")
        mod.levels = subsurf
    return obj


def cube(size=(1, 1, 1), loc=(0, 0, 0), m=None, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, m, smooth=False, bevel=bevel)


def sphere(r=0.5, loc=(0, 0, 0), scale=(1, 1, 1), m=None, seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    return finish(o, m)


def cyl(r=0.5, h=1.0, loc=(0, 0, 0), rot=(0, 0, 0), m=None, verts=48, r2=None, bevel=0.0, smooth=True):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    return finish(o, m, smooth=smooth, bevel=bevel)


def torus(R=0.5, r=0.08, loc=(0, 0, 0), rot=(0, 0, 0), m=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=24)
    return finish(bpy.context.active_object, m)


def displaced(r, loc, m, strength=0.15, scale=2.0, seed=1, flat=(1, 1, 1), sub=5):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, location=loc, subdivisions=sub)
    o = bpy.context.active_object
    o.scale = flat
    bpy.ops.object.transform_apply(scale=True)
    tex = bpy.data.textures.new(f"t{seed}", "CLOUDS")
    tex.noise_scale = 1.0 / scale
    tex.noise_depth = 3
    mod = o.modifiers.new("disp", "DISPLACE")
    mod.texture = tex
    mod.strength = strength
    mod.mid_level = 0.5
    return finish(o, m)


def from_points(points, faces, m, name="mesh", smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(points, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return finish(o, m, smooth=smooth)


def surface(f, nu, nv, m, close_u=False, name="surf"):
    """Parametrická plocha f(u, v) -> (x, y, z), u a v v rozsahu 0 až 1."""
    pts, faces = [], []
    for i in range(nu + 1):
        for j in range(nv + 1):
            pts.append(f(i / nu, j / nv))
    for i in range(nu):
        for j in range(nv):
            a = i * (nv + 1) + j
            faces.append((a, a + 1, a + nv + 2, a + nv + 1))
    o = from_points(pts, faces, m, name)
    mod = o.modifiers.new("solid", "SOLIDIFY")
    mod.thickness = 0.02
    return o


def prism_from_polygon(poly, depth, m, bevel=0.02, name="poly"):
    """Vytáhne 2D obrys (seznam bodů v rovině XZ) do hloubky po ose Y."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -depth / 2, z)) for x, z in poly]
    bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    moved = [v for v in res["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, depth, 0), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return finish(o, m, smooth=False, bevel=bevel)


def gem(top_r, mid_r, depth, crown, m, facets=10, loc=(0, 0, 0)):
    """Brilantový brus: deska, korunka s fasetami, rondist a hrot s fasetami."""
    n = facets
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n
        pts.append((top_r * 0.55 * math.cos(a), top_r * 0.55 * math.sin(a), crown))
    for z in (0.0, -0.07):
        for k in range(2 * n):
            a = 2 * math.pi * k / (2 * n)
            r = mid_r if k % 2 == 0 else mid_r * 0.97
            pts.append((r * math.cos(a), r * math.sin(a), z))
    for k in range(n):
        a = 2 * math.pi * (k + 0.5) / n
        pts.append((mid_r * 0.42 * math.cos(a), mid_r * 0.42 * math.sin(a), -depth * 0.62))
    pts.append((0, 0, -depth))
    T, G1, G2, P = 0, n, 3 * n, 5 * n
    apex = len(pts) - 1
    M = 2 * n
    faces = [tuple(range(n))[::-1]]
    for k in range(n):
        k1 = (k + 1) % n
        faces.append((T + k, G1 + 2 * k, G1 + 2 * k + 1))
        faces.append((T + k, G1 + 2 * k + 1, G1 + (2 * k + 2) % M))
        faces.append((T + k, G1 + (2 * k + 2) % M, T + k1))
    for k in range(M):
        k1 = (k + 1) % M
        faces.append((G1 + k, G2 + k, G2 + k1, G1 + k1))
    for k in range(n):
        k1 = (k + 1) % n
        faces.append((G2 + (2 * k - 1) % M, G2 + 2 * k, P + k))
        faces.append((G2 + 2 * k, G2 + 2 * k + 1, P + k))
        faces.append((G2 + 2 * k + 1, G2 + (2 * k + 2) % M, P + k))
        faces.append((P + k, G2 + (2 * k + 2) % M, P + k1))
        faces.append((P + k, P + k1, apex))
    o = from_points(pts, faces, m, "gem", smooth=False)
    o.location = loc
    return o


def leaf_poly(length=1.0, width=0.5, pts=18):
    poly = []
    for i in range(pts + 1):
        t = i / pts
        w = math.sin(math.pi * t) ** 0.8 * width / 2
        poly.append((w, t * length - length / 2))
    for i in range(pts, -1, -1):
        t = i / pts
        w = math.sin(math.pi * t) ** 0.8 * width / 2
        poly.append((-w, t * length - length / 2))
    return poly[:-1]


# ---------------------------------------------------------------- modely
def m_wood():
    bark = mat("bark", (0.2, 0.11, 0.05), rough=0.95, tint2=(0.38, 0.27, 0.17), tscale=9, bump=2.0, noise=10, voro=0.8, vscale=7)
    cut = mat("cut", (0.86, 0.66, 0.4), rough=0.65, rings=(0.55, 0.34, 0.16), bump=0.1, noise=90)
    o = cyl(0.55, 1.2, rot=(math.pi / 2, 0, 0), m=bark, verts=64)
    o.data.materials.append(cut)
    for p in o.data.polygons:
        if abs(p.normal.y) > 0.9:
            p.material_index = 1
    cyl(0.1, 0.5, loc=(0.45, -0.1, 0.45), rot=(0.6, 0.5, 0), m=bark, r2=0.07)


def m_iron():
    iron = mat("iron", (0.33, 0.34, 0.36), metal=1, rough=0.4, tint2=(0.5, 0.35, 0.25), tscale=6, rvar=0.3, bump=0.15, noise=90)
    cyl(0.45, 0.35, loc=(0, 0, 0.45), m=iron, verts=6, bevel=0.03, smooth=False)
    cyl(0.2, 1.1, loc=(0, 0, -0.2), m=iron, verts=32)
    for i in range(7):
        torus(0.2, 0.025, loc=(0, 0, -0.55 + i * 0.12), m=iron)


def m_silver():
    silver = mat("silver", (0.85, 0.87, 0.9), metal=1, rough=0.18)
    cyl(0.85, 0.3, loc=(0, 0, 0), m=silver, r2=0.65, verts=4, bevel=0.05, smooth=False).rotation_euler = (0, 0, math.pi / 4)
    cyl(0.85, 0.3, loc=(0, 0, 0.3), m=silver, r2=0.65, verts=4, bevel=0.05, smooth=False).rotation_euler = (0, 0, math.pi / 4)


def m_gold():
    gold = mat("gold", (1.0, 0.78, 0.25), metal=1, rough=0.2, rvar=0.12)
    cyl(0.8, 0.16, rot=(math.pi / 2 + 0.35, 0, 0), m=gold, verts=96, bevel=0.02)
    torus(0.74, 0.07, rot=(math.pi / 2, 0, 0), m=gold)
    cyl(0.45, 0.04, loc=(0, -0.09, 0), rot=(math.pi / 2, 0, 0), m=gold, verts=5, smooth=False)
    cyl(0.45, 0.04, loc=(0, 0.09, 0), rot=(math.pi / 2, 0, 0), m=gold, verts=5, smooth=False)


def m_moon_dust():
    dust = mat("dust", (0.4, 0.4, 0.42), rough=1.0, tint2=(0.62, 0.61, 0.6), tscale=6, bump=1.2, noise=140, voro=0.7, vscale=4)
    displaced(0.75, (0, 0, 0), dust, strength=0.18, scale=1.4, seed=2)
    for i, (x, y, z, r) in enumerate([(0.3, -0.6, 0.3, 0.12), (-0.4, -0.55, -0.2, 0.18), (0.1, -0.7, -0.4, 0.1)]):
        sphere(r, (x, y, z), m=mat(f"crater{i}", (0.4, 0.4, 0.42), rough=1.0))


def m_meteorite():
    rock = mat("meteor", (0.05, 0.045, 0.045), metal=0.5, rough=0.55, tint2=(0.2, 0.17, 0.15), tscale=8, rvar=0.3, bump=1.4, noise=25, crack=(1.0, 0.3, 0.04), crack_scale=3.0, emit_strength=7.0)
    displaced(0.75, (0, 0, 0), rock, strength=0.28, scale=1.1, seed=3, flat=(1.1, 0.9, 0.85))
    glow = mat("glow", (1, 0.3, 0.05), emit=(1, 0.3, 0.04), emit_strength=2.0)
    for k in range(5):
        a = k * 1.1 + 0.3
        sphere(0.09, (0.8 * math.cos(a) * 0.95, -0.55 - 0.1 * k % 0.2, 0.55 * math.sin(a * 1.7)), scale=(1.2, 0.6, 0.8), m=glow, seg=16)


def m_star_crystal():
    c = mat("crystal", (0.35, 0.85, 1.0), rough=0.03, trans=1.0, ior=1.55, emit=(0.1, 0.5, 0.9), emit_strength=0.3, absorb=(0.1, 0.6, 1.0, 3.0))
    specs = [(0, 0, 0, 0.0, 0.0, 1.6, 0.28), (0.3, 0.1, -0.1, 0.4, 0.2, 1.1, 0.2), (-0.3, -0.1, -0.1, -0.45, -0.1, 1.0, 0.2), (0.05, -0.3, -0.15, 0.1, -0.55, 0.9, 0.17)]
    for x, y, z, rx, ry, h, r in specs:
        cyl(r, h, loc=(x, y, z + h / 2 - 0.5), rot=(rx, ry, 0), m=c, verts=6, bevel=0.01, smooth=False)
        cyl(r * 0.01, 0.35, loc=(x + math.sin(ry) * (h + 0.1) * 0.5, y - math.sin(rx) * (h + 0.1) * 0.5, z + h - 0.35 / 2 - 0.5 + 0.35), rot=(rx, ry, 0), m=c, r2=r, verts=6, smooth=False)


def m_comet_core():
    ice = mat("ice", (0.75, 0.92, 1.0), rough=0.25, trans=0.4, emit=(0.2, 0.55, 1.0), emit_strength=0.5, bump=0.5, noise=30)
    displaced(0.5, (-0.35, -0.1, 0.3), ice, strength=0.12, scale=1.2, seed=4)
    for k in range(7):
        r = 0.36 - k * 0.04
        sphere(r, (0.0 + k * 0.17, 0.0 + k * 0.05, -0.0 - k * 0.14), m=mat(f"tail{k}", (0.35, 0.7, 1.0), rough=0.4, trans=0.3, emit=(0.2, 0.55, 1.0), emit_strength=1.0 - k * 0.1), seg=20)


def fan(m, name="fan", lift=0.0):
    def f(u, v):
        a = (u - 0.5) * math.pi * 0.95
        r = v * 1.0
        ridge = 1 + 0.05 * math.sin(u * 30)
        return (math.sin(a) * r * ridge, -(r * r) * 0.38 - 0.03 * math.sin(u * 30) * r, math.cos(a) * r * ridge * 0.95 - 0.55)

    return surface(f, 64, 20, m, name=name)


def m_shell():
    pink = mat("shell", (0.92, 0.5, 0.42), rough=0.3, coat=0.6, tint2=(1.0, 0.9, 0.8), tscale=3, bump=0.15, noise=30)
    fan(pink, "scallop")
    cyl(0.2, 0.06, loc=(0, 0.02, -0.55), m=pink, r2=0.28, verts=24)


def m_coral():
    c = mat("coral", (0.95, 0.3, 0.28), rough=0.6, tint2=(1.0, 0.65, 0.5), tscale=5, bump=0.5, noise=60, voro=1.0, vscale=30)
    cyl(0.18, 0.5, loc=(0, 0, -0.55), m=c, r2=0.22)
    branches = [(0, 0, 0.0, 0.9), (0.28, 0.0, 0.5, 0.7), (-0.3, 0.1, -0.5, 0.7), (0.05, 0.3, 0.2, 0.6), (0.0, -0.3, -0.3, 0.6)]
    for bx, by, tilt, ln in branches:
        o = cyl(0.1, ln, loc=(bx * 0.6, by * 0.6, -0.15 + ln / 2), rot=(by * 1.5, tilt * 0.8, 0), m=c, r2=0.14)
        tipz = -0.15 + ln
        sphere(0.12, (bx * 0.6 + math.sin(tilt * 0.8) * ln * 0.5, by * 0.6 - math.sin(by * 1.5) * ln * 0.5, tipz - 0.03), m=c, seg=24)


def m_pearl():
    shell = mat("nacre", (0.85, 0.5, 0.45), rough=0.35, coat=0.05, sheen=0.1)
    pearl = mat("pearl", (0.9, 0.88, 0.85), rough=0.1, coat=0.5, sheen=0.4, metal=0.1)
    o = fan(shell, "back")
    o.scale = (0.95, 0.95, 0.95)
    o.rotation_euler = (-0.5, 0, 0)
    o.location = (0, 0.25, -0.1)
    sphere(0.36, (0, -0.28, -0.35), m=pearl)


def m_ocean_heart():
    pts = []
    for i in range(80):
        t = 2 * math.pi * i / 80
        x = 16 * math.sin(t) ** 3
        z = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x / 22, z / 22 + 0.05))
    glass = mat("ocean", (0.1, 0.5, 1.0), rough=0.02, trans=1.0, ior=1.6, absorb=(0.0, 0.35, 1.0, 4.0))
    o = prism_from_polygon(pts, 0.45, glass, bevel=0.1)
    sphere(0.12, (0, 0, 0), m=mat("core", (0.3, 0.9, 1), emit=(0.3, 0.9, 1), emit_strength=8), seg=24)


def m_acorn():
    nut = mat("nut", (0.5, 0.28, 0.1), rough=0.4, coat=0.5, tint2=(0.75, 0.5, 0.22), tscale=3, rvar=0.2, bump=0.15, noise=60)
    capm = mat("cap", (0.28, 0.17, 0.08), rough=0.85, tint2=(0.42, 0.28, 0.14), tscale=10, bump=0.6, noise=120, voro=1.4, vscale=16)
    sphere(0.5, (0, 0, -0.1), scale=(1, 1, 1.3), m=nut)
    cap = sphere(0.56, (0, 0, 0.3), scale=(1, 1, 0.65), m=capm)
    cyl(0.05, 0.3, loc=(0, 0, 0.72), m=capm)


def m_resin():
    r = mat("resin", (0.95, 0.55, 0.08), rough=0.03, trans=1.0, ior=1.5, absorb=(1.0, 0.4, 0.0, 2.5))
    sphere(0.6, (0, 0, 0), scale=(1, 1, 0.8), m=r)
    cyl(0.18, 0.8, loc=(0.15, 0, -0.55), m=r, r2=0.1)
    sphere(0.1, (0.15, 0, -0.98), scale=(1, 1, 1.3), m=r, seg=24)


def m_amber():
    a = mat("amber", (1.0, 0.55, 0.05), rough=0.05, trans=1.0, ior=1.55, absorb=(1.0, 0.5, 0.0, 5.0))
    gem(0.55, 0.78, 0.8, 0.55, a, facets=7)
    bug = mat("inc", (0.1, 0.05, 0.02), rough=0.6)
    sphere(0.08, (0.15, 0.1, 0.12), scale=(1, 1.6, 0.8), m=bug, seg=16)


def m_golden_leaf():
    g = mat("leaf", (1.0, 0.7, 0.15), metal=1, rough=0.25)
    o = prism_from_polygon(leaf_poly(1.5, 0.9), 0.04, g, bevel=0.015)
    o.rotation_euler = (0, 0, 0)
    cyl(0.015, 1.5, loc=(0, 0, 0), rot=(math.pi / 2, 0, 0), m=g, verts=8)
    for s in (-1, 1):
        for k in range(4):
            cyl(0.01, 0.4, loc=(s * 0.15, 0, -0.45 + k * 0.28), rot=(math.pi / 2, 0, s * 1.0), m=g, verts=8)
    cyl(0.03, 0.35, loc=(0, 0, -0.9), rot=(math.pi / 2, 0, 0), m=g, verts=12)


def m_stone():
    s = mat("stone", (0.3, 0.3, 0.32), rough=0.9, tint2=(0.5, 0.48, 0.45), tscale=4, rvar=0.3, bump=1.6, noise=22, voro=0.5, vscale=5)
    displaced(0.8, (0, 0, 0), s, strength=0.4, scale=1.0, seed=7, flat=(1.1, 0.9, 0.75), sub=5)


def m_steel():
    s = mat("steel", (0.6, 0.64, 0.7), metal=1, rough=0.3, rvar=0.3, bump=0.08, noise=200)
    teeth = 10
    pts = []
    for k in range(teeth):
        a0 = 2 * math.pi * k / teeth
        for da, r in ((0.0, 0.62), (0.14, 0.62), (0.2, 0.9), (0.42, 0.9), (0.48, 0.62)):
            a = a0 + da * 2 * math.pi / teeth * 2
            pts.append((r * math.cos(a), r * math.sin(a)))
    o = prism_from_polygon([(x, z) for x, z in pts], 0.3, s, bevel=0.02)
    cyl(0.28, 0.34, rot=(math.pi / 2, 0, 0), m=mat("axle", (0.15, 0.15, 0.17), metal=1, rough=0.4), verts=32)
    o.rotation_euler = (0, 0, 0)


def m_ruby():
    r = mat("ruby", (0.9, 0.0, 0.05), rough=0.0, trans=1.0, ior=1.77, absorb=(1.0, 0.0, 0.03, 14.0))
    g = gem(0.75, 0.95, 1.0, 0.45, r, facets=8)


def m_royal_seal():
    wax = mat("wax", (0.55, 0.03, 0.05), rough=0.25, coat=0.7)
    gold = mat("sg", (1.0, 0.75, 0.2), metal=1, rough=0.25)
    cyl(0.8, 0.18, rot=(math.pi / 2, 0, 0), m=wax, verts=64, bevel=0.04)
    torus(0.58, 0.05, loc=(0, -0.1, 0), rot=(math.pi / 2, 0, 0), m=wax)
    star = []
    for k in range(10):
        r = 0.4 if k % 2 == 0 else 0.17
        a = math.pi / 2 + k * math.pi / 5
        star.append((r * math.cos(a), r * math.sin(a)))
    o = prism_from_polygon(star, 0.06, gold, bevel=0.01)
    o.location = (0, -0.12, 0)


def m_herb():
    stem = mat("stem", (0.2, 0.45, 0.15), rough=0.6)
    lf = mat("herb", (0.16, 0.5, 0.14), rough=0.5, sheen=0.5, tint2=(0.4, 0.68, 0.2), tscale=7, bump=0.25, noise=70)
    cyl(0.03, 1.5, loc=(0, 0, 0), m=stem, verts=12)
    for k in range(6):
        side = 1 if k % 2 == 0 else -1
        z = -0.5 + k * 0.25
        o = prism_from_polygon(leaf_poly(0.55, 0.28), 0.015, lf, bevel=0.004)
        o.rotation_euler = (0, 0, 0)
        o.location = (side * 0.2, 0, z)
        o.rotation_euler = (0, side * 0.9, 0)
        o.rotation_euler.rotate_axis("Y", 0)
    o = prism_from_polygon(leaf_poly(0.5, 0.26), 0.015, lf, bevel=0.004)
    o.location = (0, 0, 0.85)


def m_magic_dust():
    glass = mat("glass", (0.9, 0.95, 1.0), rough=0.02, trans=1.0, ior=1.45)
    glow = mat("dustglow", (0.7, 0.4, 1.0), emit=(0.7, 0.35, 1.0), emit_strength=4.0)
    sphere(0.6, (0, 0, -0.15), m=glass)
    cyl(0.2, 0.5, loc=(0, 0, 0.55), m=glass, verts=32)
    cyl(0.23, 0.18, loc=(0, 0, 0.88), m=mat("cork", (0.5, 0.33, 0.18), rough=0.9, bump=0.8, noise=80), verts=24)
    sphere(0.45, (0, 0, -0.2), m=mat("liq", (0.55, 0.25, 0.95), rough=0.05, trans=0.6, emit=(0.6, 0.3, 1), emit_strength=1.0))
    for k in range(10):
        a = k * 2.4
        sphere(0.04, (0.3 * math.cos(a), 0.3 * math.sin(a), -0.25 + 0.06 * k), m=glow, seg=10)


def m_moonstone():
    s = mat("moon", (0.75, 0.82, 1.0), rough=0.12, trans=0.6, ior=1.5, emit=(0.5, 0.65, 1.0), emit_strength=0.9, coat=1.0, sheen=1.0)
    sphere(0.7, (0, 0, 0.05), m=s)
    cyl(0.5, 0.2, loc=(0, 0, -0.75), m=mat("base", (0.2, 0.2, 0.25), metal=0.8, rough=0.3), r2=0.35, verts=48)


def m_dragon_scale():
    g = mat("scale", (0.05, 0.55, 0.3), metal=0.6, rough=0.25, coat=0.5, bump=0.3, noise=40)

    def f(u, v):
        a = (u - 0.5) * math.pi * 0.9
        r = v
        x = math.sin(a) * r * 0.75
        z = -math.cos(a) * r * 0.9 + 0.5
        y = -(r * r) * 0.25 + 0.05 * math.sin(u * math.pi * 10) * r
        return (x, y, z)

    o = surface(f, 40, 16, g, name="scl")
    o.location = (0, 0, 0)
    ridge = mat("rid", (0.9, 0.75, 0.25), metal=1, rough=0.3)
    cyl(0.02, 0.9, loc=(0, 0.1, 0.0), m=ridge, verts=8)


# kategorie
def m_cat_avatar():
    white = mat("suit", (0.92, 0.93, 0.95), rough=0.35, coat=0.2)
    visor = mat("visor", (0.02, 0.04, 0.1), rough=0.02, metal=0.6, coat=1.0)
    sphere(0.75, (0, 0, 0.1), m=white)
    sphere(0.5, (0, -0.5, 0.1), scale=(1.15, 0.55, 0.85), m=visor)
    sphere(0.1, (0.25, -0.93, 0.28), m=mat("refl", (1, 1, 1), emit=(1, 1, 1), emit_strength=3), scale=(1, 0.3, 0.6), seg=16)
    torus(0.62, 0.14, loc=(0, 0, -0.62), m=mat("ring", (0.35, 0.45, 0.95), rough=0.4))
    cyl(0.5, 0.3, loc=(0, 0, -0.85), m=white, r2=0.62)


def m_cat_title():
    gold = mat("medal", (1.0, 0.72, 0.18), metal=1, rough=0.2)
    red = mat("ribbon", (0.8, 0.1, 0.15), rough=0.55, sheen=0.8)
    cyl(0.7, 0.14, loc=(0, 0, -0.1), rot=(math.pi / 2, 0, 0), m=gold, verts=64, bevel=0.02)
    torus(0.62, 0.05, loc=(0, -0.09, -0.1), rot=(math.pi / 2, 0, 0), m=gold)
    star = []
    for k in range(10):
        r = 0.42 if k % 2 == 0 else 0.18
        a = math.pi / 2 + k * math.pi / 5
        star.append((r * math.cos(a), r * math.sin(a) - 0.1))
    prism_from_polygon(star, 0.06, mat("star", (1.0, 0.9, 0.5), metal=1, rough=0.15), bevel=0.01).location = (0, -0.12, 0)
    for s in (-1, 1):
        o = prism_from_polygon([(0, 0), (0.28, 0), (0.28, 0.9), (0, 0.9)], 0.04, red, bevel=0.005)
        o.location = (s * 0.18, 0.02, 0.45)
        o.rotation_euler = (0, s * -0.35, 0)


def m_cat_frame():
    gold = mat("frm", (0.95, 0.68, 0.2), metal=1, rough=0.25, bump=0.05, noise=60)
    for loc, size in [((0, 0, 0.75), (1.7, 0.2, 0.2)), ((0, 0, -0.75), (1.7, 0.2, 0.2)), ((0.75, 0, 0), (0.2, 0.2, 1.7)), ((-0.75, 0, 0), (0.2, 0.2, 1.7))]:
        cube(size, loc, gold, bevel=0.05)
    for x in (-0.75, 0.75):
        for z in (-0.75, 0.75):
            sphere(0.17, (x, 0, z), m=gold, seg=24)
    sphere(0.14, (0, -0.12, 0.75), m=mat("jewel", (0.1, 0.45, 1.0), rough=0.03, trans=1, emit=(0.1, 0.4, 1), emit_strength=1.5), seg=24)
    cube((1.3, 0.04, 1.3), (0, 0.05, 0), mat("canvas", (0.35, 0.8, 0.6), rough=0.7), bevel=0.0)


def m_cat_banner():
    pole = mat("pole", (0.6, 0.4, 0.2), rough=0.5, bump=0.3, noise=30)
    cloth = mat("flag", (0.15, 0.85, 0.5), rough=0.7, sheen=0.8)
    cyl(0.05, 2.0, loc=(-0.7, 0, 0), m=pole, verts=24)
    sphere(0.09, (-0.7, 0, 1.0), m=mat("fin", (1, 0.75, 0.2), metal=1, rough=0.25), seg=24)

    def f(u, v):
        x = -0.65 + u * 1.5
        z = 0.85 - v * 0.9
        y = 0.12 * math.sin(u * 5.0 + v) * u
        return (x, y, z)

    surface(f, 30, 10, cloth, name="cloth")
    st = []
    for k in range(10):
        r = 0.2 if k % 2 == 0 else 0.09
        a = math.pi / 2 + k * math.pi / 5
        st.append((r * math.cos(a), r * math.sin(a)))
    o = prism_from_polygon(st, 0.02, mat("flagstar", (1, 1, 1), rough=0.6), bevel=0.0)
    o.location = (0.15, -0.1, 0.4)


def m_cat_pet():
    pad = mat("pad", (0.25, 0.13, 0.1), rough=0.7, bump=0.15, noise=100)
    toe = mat("toe", (0.95, 0.55, 0.6), rough=0.6, sheen=0.5)
    fur = mat("fur", (0.9, 0.62, 0.35), rough=0.9, sheen=1.0, bump=0.4, noise=300)
    cyl(0.9, 0.35, rot=(math.pi / 2, 0, 0), m=fur, verts=64, bevel=0.04)
    sphere(0.38, (0, -0.2, -0.22), scale=(1.25, 0.5, 0.9), m=toe)
    for x, z in [(-0.58, 0.05), (-0.22, 0.42), (0.22, 0.42), (0.58, 0.05)]:
        sphere(0.14, (x, -0.2, z), scale=(1, 0.5, 1.2), m=toe)


def m_cat_city():
    wall = mat("wall", (0.95, 0.85, 0.68), rough=0.9, tint2=(0.85, 0.76, 0.6), tscale=5, bump=0.35, noise=110)
    roof = mat("roofm", (0.62, 0.18, 0.12), rough=0.75, tint2=(0.78, 0.3, 0.2), brick=14)
    cube((1.3, 1.1, 0.9), (0, 0, -0.2), wall, bevel=0.02)
    poly = [(-0.8, 0), (0.8, 0), (0, 0.65)]
    o = prism_from_polygon(poly, 1.3, roof, bevel=0.02)
    o.rotation_euler = (0, 0, math.pi / 2)
    o.location = (0, 0, 0.25)
    cube((0.2, 0.2, 0.5), (0.42, 0.28, 0.58), mat("brick", (0.5, 0.25, 0.2), rough=0.9), bevel=0.01)
    door = mat("door", (0.35, 0.2, 0.1), rough=0.6)
    cube((0.28, 0.06, 0.55), (0, -0.56, -0.38), door, bevel=0.01)
    win = mat("win", (1.0, 0.85, 0.4), emit=(1, 0.8, 0.3), emit_strength=2.5)
    for x in (-0.38, 0.38):
        cube((0.24, 0.06, 0.24), (x, -0.56, -0.12), win, bevel=0.005)
    cube((2.0, 1.8, 0.1), (0, 0, -0.7), mat("grass", (0.3, 0.6, 0.25), rough=1.0, bump=0.5, noise=300), bevel=0.02)


def m_cat_limited():
    g = mat("diamond", (0.95, 0.98, 1.0), rough=0.0, trans=1.0, ior=2.42)
    gem(0.7, 0.95, 1.0, 0.35, g, facets=12)
    glow = mat("sp", (1, 1, 1), emit=(1, 1, 1), emit_strength=6)
    sphere(0.04, (0.7, -0.5, 0.5), m=glow, seg=10)
    sphere(0.03, (-0.7, -0.4, 0.6), m=glow, seg=10)


def m_shop_bag():
    bag = mat("bag", (0.15, 0.85, 0.5), rough=0.5, sheen=0.5)
    rope = mat("rope", (0.95, 0.95, 0.9), rough=0.8)
    o = cyl(0.75, 1.3, loc=(0, 0, -0.1), m=bag, r2=0.9, verts=4, bevel=0.05, smooth=False)
    o.rotation_euler = (0, 0, math.pi / 4)
    o.scale = (1, 0.65, 1)
    torus(0.32, 0.03, loc=(0, 0, 0.7), rot=(math.pi / 2, 0, 0), m=rope)
    cyl(0.28, 0.02, loc=(0, -0.45, -0.1), rot=(math.pi / 2, 0, 0), m=mat("lbl", (1, 1, 1), rough=0.6), verts=48)


# budovy a věci do města
def m_christmas_tree():
    green = mat("fir", (0.05, 0.35, 0.12), rough=0.9, bump=1.0, noise=90)
    for i, (r, z, h) in enumerate([(0.8, -0.45, 0.8), (0.62, -0.05, 0.7), (0.44, 0.3, 0.6)]):
        cyl(r, h, loc=(0, 0, z), m=green, r2=0.02)
    cyl(0.12, 0.35, loc=(0, 0, -0.85), m=mat("trunk", (0.3, 0.18, 0.08), rough=0.9, bump=0.6, noise=40))
    star = []
    for k in range(10):
        r = 0.2 if k % 2 == 0 else 0.09
        a = math.pi / 2 + k * math.pi / 5
        star.append((r * math.cos(a), r * math.sin(a)))
    prism_from_polygon(star, 0.06, mat("tstar", (1, 0.85, 0.2), metal=1, rough=0.2, emit=(1, 0.8, 0.2), emit_strength=1.5), bevel=0.01).location = (0, 0, 0.78)
    cols = [(0.9, 0.1, 0.1), (0.2, 0.4, 1.0), (1.0, 0.8, 0.2)]
    for k in range(9):
        a = k * 2.1
        zr = [(-0.4, 0.62), (0.0, 0.46), (0.33, 0.3)][k % 3]
        rr = zr[1] * (0.85 if k % 2 else 0.7)
        sphere(0.07, (rr * math.cos(a), rr * math.sin(a), zr[0]), m=mat(f"b{k}", cols[k % 3], metal=0.8, rough=0.1), seg=16)
    cube((0.3, 0.3, 0.25), (0.65, -0.5, -0.95), mat("gift", (0.85, 0.1, 0.15), rough=0.5), bevel=0.02)
    cube((0.32, 0.06, 0.27), (0.65, -0.5, -0.95), mat("rib", (1, 0.85, 0.3), rough=0.4), bevel=0.0)


def m_windmill():
    stone = mat("mstone", (0.82, 0.75, 0.62), rough=0.9, bump=0.6, noise=40)
    red = mat("mroof", (0.75, 0.15, 0.1), rough=0.7)
    cyl(0.62, 1.4, loc=(0, 0, -0.3), m=stone, r2=0.42)
    cyl(0.55, 0.55, loc=(0, 0, 0.7), m=red, r2=0.02)
    cube((0.2, 0.05, 0.35), (0, -0.62, -0.7), mat("mdoor", (0.35, 0.2, 0.1), rough=0.6), bevel=0.01)
    wood = mat("blade", (0.92, 0.88, 0.78), rough=0.8)
    arm_m = mat("arm", (0.4, 0.25, 0.12), rough=0.8)
    hub = Vector((0, -0.55, 0.35))
    for k in range(2):
        a = k * math.pi / 2 + 0.4
        arm = cube((0.06, 0.06, 1.7), tuple(hub), arm_m, bevel=0.01)
        arm.rotation_euler = (0, a, 0)
    for k in range(4):
        a = k * math.pi / 2 + 0.4
        d = Vector((math.sin(a), 0, math.cos(a)))
        pr = Vector((math.cos(a), 0, -math.sin(a)))
        pos = hub + d * 0.55 + pr * 0.16 + Vector((0, -0.04, 0))
        sail = cube((0.3, 0.02, 0.6), tuple(pos), wood, bevel=0.0)
        sail.rotation_euler = (0, a, 0)
    sphere(0.1, (0, -0.52, 0.35), m=mat("hub", (0.3, 0.2, 0.1), rough=0.6), seg=16)


def m_ferris_wheel():
    metal = mat("fw", (0.85, 0.2, 0.25), metal=0.6, rough=0.35)
    white = mat("fwa", (0.95, 0.95, 0.97), metal=0.5, rough=0.3)
    torus(0.9, 0.04, rot=(math.pi / 2, 0, 0), m=metal)
    torus(0.45, 0.03, rot=(math.pi / 2, 0, 0), m=white)
    cols = [(1, 0.8, 0.2), (0.2, 0.7, 1), (0.3, 0.9, 0.4), (1, 0.4, 0.5)]
    for k in range(12):
        a = k * math.pi / 6
        sp = cyl(0.015, 1.8, rot=(0, a, 0), m=white, verts=8)
        sp.rotation_euler = (math.pi / 2, 0, 0)
        sp.rotation_euler = (math.pi / 2, a, 0)
    for k in range(8):
        a = k * math.pi / 4
        x, z = 0.9 * math.sin(a), 0.9 * math.cos(a)
        sphere(0.12, (x, 0, z - 0.12), scale=(1, 1.1, 0.9), m=mat(f"g{k}", cols[k % 4], rough=0.3, coat=0.5), seg=20)
    for s in (-1, 1):
        l = cyl(0.04, 1.6, loc=(s * 0.5, 0, -0.8), rot=(0, -s * 0.35, 0), m=metal, verts=12)
    sphere(0.1, (0, 0, 0), m=white, seg=16)


def m_carousel():
    base = mat("cbase", (0.95, 0.85, 0.65), rough=0.5)
    canopy = mat("canopy", (0.9, 0.2, 0.35), rough=0.5, sheen=0.6)
    gold = mat("cgold", (1.0, 0.75, 0.2), metal=1, rough=0.25)
    cyl(0.95, 0.18, loc=(0, 0, -0.75), m=base, bevel=0.03)
    cyl(0.1, 1.3, loc=(0, 0, -0.1), m=gold, verts=24)
    cyl(1.0, 0.45, loc=(0, 0, 0.7), m=canopy, r2=0.05)
    torus(1.0, 0.04, loc=(0, 0, 0.5), m=gold)
    cols = [(0.95, 0.95, 0.95), (0.2, 0.6, 1.0), (1, 0.7, 0.2), (0.4, 0.9, 0.5)]
    for k in range(4):
        a = k * math.pi / 2
        x, y = 0.62 * math.cos(a), 0.62 * math.sin(a)
        cyl(0.025, 1.15, loc=(x, y, -0.1), m=gold, verts=12)
        sphere(0.17, (x, y, -0.2), scale=(1.3, 0.7, 0.9), m=mat(f"h{k}", cols[k], rough=0.35, coat=0.6), seg=24)
        sphere(0.09, (x + 0.12 * math.cos(a + 1.57), y + 0.12 * math.sin(a + 1.57), -0.05), m=mat(f"hh{k}", cols[k], rough=0.35), seg=16)


def m_lighthouse():
    white = mat("lh_w", (0.96, 0.96, 0.95), rough=0.6)
    red = mat("lh_r", (0.8, 0.1, 0.1), rough=0.6)
    z = -0.95
    for i in range(4):
        r1 = 0.55 - i * 0.07
        r2 = 0.55 - (i + 1) * 0.07
        cyl(r1, 0.4, loc=(0, 0, z + 0.2 + i * 0.4), m=red if i % 2 else white, r2=r2)
    cyl(0.4, 0.08, loc=(0, 0, 0.72), m=mat("deck", (0.2, 0.2, 0.22), metal=0.7, rough=0.4))
    cyl(0.26, 0.3, loc=(0, 0, 0.9), m=mat("lamp", (1.0, 0.95, 0.6), rough=0.05, trans=0.8, emit=(1, 0.9, 0.5), emit_strength=3))
    cyl(0.34, 0.25, loc=(0, 0, 1.15), m=red, r2=0.03)
    cyl(0.9, 0.12, loc=(0, 0, -1.0), m=mat("rock", (0.35, 0.36, 0.38), rough=0.95, bump=0.8, noise=20), r2=0.7)


def m_rocket_pad():
    body = mat("rk", (0.95, 0.95, 0.97), rough=0.3, metal=0.2, coat=0.5)
    red = mat("rkr", (0.9, 0.15, 0.15), rough=0.35)
    cyl(0.28, 1.3, loc=(0, 0, 0.05), m=body, verts=48)
    cyl(0.28, 0.6, loc=(0, 0, 0.99), m=red, r2=0.02)
    for k in range(3):
        a = k * 2 * math.pi / 3
        fin = prism_from_polygon([(0, 0), (0.4, -0.2), (0.4, -0.55), (0, -0.3)], 0.04, red, bevel=0.01)
        fin.rotation_euler = (0, 0, a)
        fin.location = (0.22 * math.cos(a), 0.22 * math.sin(a), -0.35)
        fin.rotation_euler = (0, 0, a)
    sphere(0.1, (0, -0.27, 0.45), m=mat("rkw", (0.3, 0.7, 1.0), rough=0.03, trans=0.6, emit=(0.2, 0.6, 1), emit_strength=1.0), seg=20)
    cyl(0.28, 0.25, loc=(0, 0, -0.75), m=mat("flame", (1, 0.6, 0.1), emit=(1, 0.5, 0.1), emit_strength=8, trans=0.5), r2=0.03)
    cyl(0.95, 0.14, loc=(0, 0, -1.0), m=mat("pad", (0.3, 0.32, 0.36), metal=0.5, rough=0.5), bevel=0.02)


def m_town_hall():
    wall = mat("th_w", (0.93, 0.88, 0.78), rough=0.85, bump=0.1, noise=80)
    roof = mat("th_r", (0.25, 0.35, 0.55), rough=0.6)
    cube((1.7, 1.0, 0.9), (0, 0, -0.35), wall, bevel=0.02)
    for x in (-0.6, -0.2, 0.2, 0.6):
        cyl(0.07, 0.9, loc=(x, -0.58, -0.35), m=mat("col", (1, 0.97, 0.9), rough=0.5), verts=24)
    o = prism_from_polygon([(-0.95, 0), (0.95, 0), (0, 0.4)], 1.1, roof, bevel=0.02)
    o.location = (0, -0.05, 0.1)
    o.rotation_euler = (math.pi / 2 * 0, 0, 0)
    cube((0.5, 0.5, 0.45), (0, 0.1, 0.55), wall, bevel=0.02)
    cyl(0.34, 0.3, loc=(0, 0.1, 0.9), m=roof, r2=0.02, verts=4).rotation_euler = (0, 0, math.pi / 4)
    cyl(0.14, 0.04, loc=(0, -0.16, 0.55), rot=(math.pi / 2, 0, 0), m=mat("clock", (1, 1, 1), rough=0.3), verts=32)
    cube((0.3, 0.06, 0.5), (0, -0.55, -0.62), mat("th_d", (0.3, 0.2, 0.12), rough=0.6), bevel=0.01)
    cube((2.1, 1.5, 0.1), (0, 0, -0.85), mat("th_g", (0.55, 0.55, 0.58), rough=0.9, bump=0.3, noise=200), bevel=0.02)


MODELS = {
    "wood": m_wood, "iron": m_iron, "silver": m_silver, "gold": m_gold,
    "moon-dust": m_moon_dust, "meteorite": m_meteorite, "star-crystal": m_star_crystal, "comet-core": m_comet_core,
    "shell": m_shell, "coral": m_coral, "pearl": m_pearl, "ocean-heart": m_ocean_heart,
    "acorn": m_acorn, "resin": m_resin, "amber": m_amber, "golden-leaf": m_golden_leaf,
    "stone": m_stone, "steel": m_steel, "ruby": m_ruby, "royal-seal": m_royal_seal,
    "herb": m_herb, "magic-dust": m_magic_dust, "moonstone": m_moonstone, "dragon-scale": m_dragon_scale,
    "cat-avatar": m_cat_avatar, "cat-title": m_cat_title, "cat-frame": m_cat_frame, "cat-banner": m_cat_banner,
    "christmas_tree": m_christmas_tree, "windmill": m_windmill, "ferris_wheel": m_ferris_wheel, "carousel": m_carousel,
    "lighthouse": m_lighthouse, "rocket_pad": m_rocket_pad, "town_hall": m_town_hall,
    "cat-pet": m_cat_pet, "cat-city": m_cat_city, "cat-limited": m_cat_limited, "shop-bag": m_shop_bag,
}


# ---------------------------------------------------------------- scéna, animace, render
def build(name):
    reset()
    MODELS[name]()
    parts = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    bpy.context.view_layer.update()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in parts:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector((min(lo[i], w[i]) for i in range(3)))
            hi = Vector((max(hi[i], w[i]) for i in range(3)))
    center = (lo + hi) / 2
    radius = max((hi - lo).length / 2, 0.01)
    root = bpy.data.objects.new("root", None)
    bpy.context.collection.objects.link(root)
    for o in parts:
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
    s = 1.0 / radius * 1.05
    MINZ[0] = (lo.z - center.z) * s
    for o in parts:
        o.location = (o.location - center) * s
        o.scale = o.scale * s
        for mod in o.modifiers:
            if mod.type == "DISPLACE":
                mod.strength *= s
    bpy.context.view_layer.update()
    # smyčka: otočení o 360° kolem svislé osy, lineárně
    root.rotation_mode = "XYZ"
    root.rotation_euler = (0, 0, 0)
    root.keyframe_insert("rotation_euler", frame=1)
    root.rotation_euler = (0, 0, 2 * math.pi)
    root.keyframe_insert("rotation_euler", frame=N + 1)
    for fc in root.animation_data.action.layers[0].strips[0].channelbags[0].fcurves if hasattr(root.animation_data.action, "layers") else root.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = N
    return root


def setup_render():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 12
    sc.cycles.transmission_bounces = 12
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.render.resolution_x = SIZE
    sc.render.resolution_y = SIZE
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.exposure = -1.2
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    ramp.color_ramp.elements[0].position = 0.1
    ramp.color_ramp.elements[0].color = (0.12, 0.18, 0.16, 1)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.9
    # softboxy: viditelné jen v odrazech, ne přímo v obraze
    for loc, size, strength, color in [((-4, -3, 3), (3, 1.2), 25, (1, 1, 1)), ((4.5, -2, 1), (1.2, 3), 18, (0.8, 1, 0.9)), ((0, 4, 3), (4, 1.0), 14, (0.9, 0.95, 1.0)), ((0, -6, 2), (5, 3), 5, (1, 1, 1))]:
        bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
        pl = bpy.context.active_object
        pl.scale = (size[0], size[1], 1)
        pl.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("Z", "Y").to_euler()
        em = bpy.data.materials.new("box")
        em.use_nodes = True
        eb = em.node_tree.nodes["Principled BSDF"]
        eb.inputs["Base Color"].default_value = (*color, 1)
        eb.inputs["Emission Color"].default_value = (*color, 1)
        eb.inputs["Emission Strength"].default_value = strength
        pl.data.materials.append(em)
        pl.visible_camera = False
    bpy.ops.mesh.primitive_plane_add(size=9, location=(0, 0, MINZ[0] - 0.12))
    ground = bpy.context.active_object
    ground.is_shadow_catcher = True
    cam = bpy.data.cameras.new("cam")
    cam.lens = 60
    co = bpy.data.objects.new("cam", cam)
    bpy.context.collection.objects.link(co)
    co.location = (0, -4.2, 2.2)
    co.rotation_euler = (math.radians(62), 0, 0)
    sc.camera = co
    for loc, energy, color in [((-3, -3, 4), 400, (1, 0.97, 0.9)), ((3.5, -2, 1.5), 180, (0.6, 1.0, 0.8)), ((0, 3, 3), 220, (0.7, 0.8, 1.0))]:
        ld = bpy.data.lights.new("l", "AREA")
        ld.energy = energy
        ld.size = 3
        ld.color = color
        lo = bpy.data.objects.new("l", ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        d = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y")
        lo.rotation_euler = d.to_euler()


def render(name):
    os.makedirs(OUT, exist_ok=True)
    d = os.path.join(FRAMES, name)
    os.makedirs(d, exist_ok=True)
    root = build(name)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f"{name}.glb"), export_format="GLB", export_animations=True, export_apply=True)
    setup_render()
    sc = bpy.context.scene
    for f in range(1, N + 1):
        sc.frame_set(f)
        sc.render.filepath = os.path.join(d, f"{f:03d}.png")
        bpy.ops.render.render(write_still=True)
    from PIL import Image

    frames = [Image.open(os.path.join(d, f"{f:03d}.png")).convert("RGBA") for f in range(1, N + 1)]
    frames[0].save(os.path.join(OUT, f"{name}.png"))
    frames[0].save(os.path.join(OUT, f"{name}.webp"), save_all=True, append_images=frames[1:], duration=83, loop=0, quality=82, method=4, lossless=False)


if __name__ == "__main__":
    names = sys.argv[1:] or list(MODELS)
    for nm in names:
        print("==", nm, flush=True)
        render(nm)
