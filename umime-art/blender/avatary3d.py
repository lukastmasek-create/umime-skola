"""Generátor 3D avatarů (náhrada chybějících avatars.py): hračkové postavičky s velkou hlavou, animace „klid“ a „radost“.

    python umime-art/blender/avatary3d.py -- all [--stills]
    python umime-art/blender/avatary3d.py -- piratka zralok --stills

Výstup: public/avatars-3d/<id>.glb (Draco), s --stills i <id>-portret.webp (256 × 256) a <id>-postava.webp (výška 256).
Model dodržuje stejnou stavbu jako původní avatary, aby fungoval šatník a pohyby v Avatar3D:
  avatar_<id> › <id>_telo (pivot u chodidel) › <id>_telo_model, <id>_hlava (pivot na krku) › <id>_hlava_model,
  <id>_oko_leve/_prave (+ _radost), <id>_odlesk_*, <id>_pusa (+ _radost), <id>_antena_model (pokrývka hlavy),
  <id>_rameno_leva/_prava › <id>_ruka_*_model, <id>_ocas › <id>_ocas_model, doplňky koruna…, <id>_nausnice, <id>_preska.
Materiály pro přebarvení: <id>_hlava_mat (kůže), <id>_telo_mat, <id>_ruka_leva/prava_mat, <id>_ocas_mat,
<id>_antena_mat, Av_oko; odlesky Av_odlesk, pusa Av_pusa.
"""
import math
import os
import subprocess
import sys

import bpy
from mathutils import Matrix, Vector

TAU = math.tau
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "avatars-3d"))
TMP = "/tmp/claude-0/avatary"
FPS = 24

# --------------------------------------------------------------------------------------------- pomůcky
_mats = {}


def hexc(h, a=1.0):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (a,)


def mat(name, color, rough=0.38, metal=0.0, coat=0.25, emit=0.0, alpha=1.0):
    if name in _mats:
        return _mats[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.2
    if emit:
        b.inputs["Emission Color"].default_value = hexc(color)
        b.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        try:
            m.blend_method = "BLEND"
        except (AttributeError, TypeError):
            pass
    _mats[name] = m
    return m


def _new(obj, m, smooth=True, sub=0):
    obj.data.materials.append(m)
    if smooth:
        for p in obj.data.polygons:
            p.use_smooth = True
    if sub:
        mod = obj.modifiers.new("sub", "SUBSURF")
        mod.levels = sub
        mod.render_levels = sub
    return obj


def sphere(loc, r, m, scale=(1, 1, 1), seg=32, rings=16, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=r, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = scale
    return _new(o, m)


def cyl(loc, r, h, m, verts=32, rot=(0, 0, 0), r2=None, smooth=True):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=h, location=loc, rotation=rot)
    return _new(bpy.context.object, m, smooth)


def cone(loc, r, h, m, verts=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=0, depth=h, location=loc, rotation=rot)
    return _new(bpy.context.object, m)


def torus(loc, R, r, m, rot=(0, 0, 0), arc=1.0, seg=48):
    bpy.ops.mesh.primitive_torus_add(location=loc, rotation=rot, major_radius=R, minor_radius=r, major_segments=seg, minor_segments=12)
    o = bpy.context.object
    if arc < 1.0:
        # ponechat jen část prstence (oblouk): smazat vrcholy pod osou
        me = o.data
        import bmesh

        bm = bmesh.new()
        bm.from_mesh(me)
        lim = math.cos(math.pi * arc)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y / max(1e-6, math.hypot(v.co.x, v.co.y)) < lim and math.hypot(v.co.x, v.co.y) > R * 0.3], context="VERTS")
        bm.to_mesh(me)
        bm.free()
    return _new(o, m)


def box(loc, size, m, rot=(0, 0, 0), bevel=0.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new("bev", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    return _new(o, m)


def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e


def group(name, objs, pivot):
    """Spojí díly do jednoho objektu, zapeče modifikátory a zavěsí pod pivot (geometrie relativně k pivotu)."""
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(objs) > 1:
        bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    o.data.name = name
    w = pivot.matrix_world.translation.copy()
    o.data.transform(Matrix.Translation(-w))
    o.location = (0, 0, 0)
    o.parent = pivot
    return o


# ------------------------------------------------------------------------------------------- postavička
EYE_Y = -0.43


def build(spec):
    aid = spec["id"]
    P = lambda part: f"{aid}_{part}"  # noqa: E731
    skin = mat(P("hlava_mat"), spec.get("skin", "#ffd5a8"), rough=0.45)
    top = mat(P("telo_mat"), spec["top"], rough=0.5)
    arm_l = mat(P("ruka_leva_mat"), spec.get("sleeve", spec["top"]), rough=0.5)
    arm_r = mat(P("ruka_prava_mat"), spec.get("sleeve", spec["top"]), rough=0.5)
    pants = mat(P("kalhoty"), spec.get("pants", "#2f3c6e"), rough=0.55)
    shoes = mat(P("boty"), spec.get("shoes", "#3a2a22"), rough=0.4)
    eye = mat("Av_oko", spec.get("eye", "#1a1420"), rough=0.15, coat=0.6)
    hi = mat("Av_odlesk", "#ffffff", rough=0.1, emit=0.6)
    mouth_m = mat("Av_pusa", "#6a2a2a", rough=0.4)
    blush = mat("Av_tvar", "#ff9aa8", rough=0.6)
    gold = mat("Av_zlato", "#ffc933", rough=0.25, metal=0.9)
    animal = spec.get("kind") == "animal"
    robot = spec.get("kind") == "robot"
    fur = skin

    root = empty(f"avatar_{aid}", (0, 0, 0))
    telo = empty(P("telo"), (0, 0, 0), root)
    hlava = empty(P("hlava"), (0, 0, 1.0), telo)
    sh_l = empty(P("rameno_leva"), (-0.33, 0, 0.88), telo)
    sh_r = empty(P("rameno_prava"), (0.33, 0, 0.88), telo)

    # ---- tělo: trup, nohy, boty, límec a detaily oblečení
    body = []
    if robot:
        body.append(box((0, 0, 0.62), (0.62, 0.5, 0.62), top, bevel=0.14))
        body.append(cyl((0, -0.255, 0.66), 0.13, 0.03, mat(P("svetlo"), spec.get("glow", "#4fd8ff"), emit=2.5), rot=(math.pi / 2, 0, 0)))
        # krk z kroužků mezi trupem a hlavou
        for k in range(3):
            body.append(cyl((0, 0, 0.96 + k * 0.045), 0.12 - k * 0.01, 0.04, mat(P("krk"), "#6a7288", metal=0.6, rough=0.3)))
    else:
        body.append(sphere((0, 0, 0.62), 0.36, top, scale=(1.0, 0.86, 1.05)))
    belly = spec.get("belly")
    if belly:
        body.append(sphere((0, -0.2, 0.6), 0.25, mat(P("bricho"), belly, rough=0.5), scale=(0.95, 0.5, 1.1)))
    for s in (-1, 1):
        body.append(cyl((s * 0.14, 0, 0.2), 0.11, 0.24, pants if not animal else fur))
        body.append(sphere((s * 0.14, -0.05, 0.07), 0.13, shoes if not animal else mat(P("tlapka"), spec.get("paw", "#5a3a20")), scale=(1, 1.3, 0.62)))
    collar = spec.get("collar")
    if collar:
        body.append(torus((0, 0, 0.94), 0.2, 0.05, mat(P("limec"), collar), rot=(0, 0, 0)))
    for k in range(spec.get("buttons", 0)):
        b = sphere((0, -0.31, 0.78 - k * 0.14), 0.03, gold, seg=12, rings=8)
        b.name = P(f"knoflik_{k + 1}")
    if spec.get("belt"):
        body.append(torus((0, 0, 0.42), 0.33, 0.035, mat(P("pasek"), spec["belt"]), rot=(0, 0, 0)))
        buckle = box((0, -0.33, 0.42), (0.12, 0.03, 0.09), gold, bevel=0.01)
        buckle.name = P("preska")
    stripes = spec.get("stripes")
    if stripes:
        for k in range(4):
            body.append(torus((0, 0, 0.5 + k * 0.11), 0.355 * (1 - abs(k - 1.5) * 0.06), 0.016, mat(P("pruh"), stripes)))
    if spec.get("vest"):
        vm = mat(P("vesta"), spec["vest"], rough=0.6)
        for s in (-1, 1):
            body.append(sphere((s * 0.17, -0.12, 0.66), 0.24, vm, scale=(0.6, 0.62, 1.05)))
    if spec.get("cape"):
        body.append(sphere((0, 0.2, 0.55), 0.38, mat(P("plast"), spec["cape"], rough=0.6), scale=(1.05, 0.35, 1.3)))
    if spec.get("dress"):
        body.append(cone((0, 0, 0.38), 0.46, 0.62, top))
    telo_model = group(P("telo_model"), body, telo)
    for o in list(bpy.context.scene.objects):
        if o.name.startswith(P("knoflik_")) or o.name == P("preska"):
            group(o.name, [o], telo)

    # ---- hlava
    head = []
    hc = Vector((0, 0, 1.42))
    if robot:
        head.append(box(hc, (0.82, 0.74, 0.7), skin, bevel=0.2))
    else:
        head.append(sphere(hc, 0.47, skin, scale=(1.0, 0.94, 0.94)))
    ears = spec.get("ears", "human")
    if ears == "human":
        for s in (-1, 1):
            head.append(sphere((s * 0.46, 0.02, 1.4), 0.08, skin, scale=(0.6, 1, 1.15)))
    elif ears in ("bear", "squirrel", "dog"):
        for s in (-1, 1):
            if ears == "squirrel":
                head.append(cone((s * 0.27, 0.02, 1.86), 0.12, 0.26, fur, rot=(0, s * -0.35, 0)))
                head.append(cone((s * 0.29, -0.01, 1.99), 0.05, 0.12, mat(P("chocholka"), spec.get("tuft", "#7a4a2a")), rot=(0, s * -0.35, 0)))
            elif ears == "dog":
                head.append(box((s * 0.42, 0.02, 1.62), (0.1, 0.18, 0.32), mat(P("ucho"), spec.get("ear", "#8a92a8"), metal=0.6, rough=0.3), rot=(0, s * 0.35, 0), bevel=0.04))
            else:
                head.append(sphere((s * 0.3, 0.03, 1.8), 0.12, fur, scale=(1, 0.6, 1)))
    if spec.get("muzzle"):
        head.append(sphere((0, -0.36, 1.3), 0.18, mat(P("cumak"), spec["muzzle"], rough=0.5), scale=(1.15, 0.8, 0.8)))
        head.append(sphere((0, -0.5, 1.37), 0.05, mat(P("nos"), "#2a1a1a", rough=0.2, coat=0.5), scale=(1.3, 0.9, 0.9)))
    elif not robot:
        head.append(sphere((0, -0.45, 1.33), 0.045, mat(P("nos_k"), spec.get("nose", "#f0a080"), rough=0.4)))
    if not robot:
        for s in (-1, 1):
            head.append(sphere((s * 0.25, -0.38, 1.27), 0.07, blush, scale=(1.2, 0.4, 0.75)))
    # obočí
    if spec.get("brows"):
        for s in (-1, 1):
            head.append(box((s * 0.15, -0.43, 1.58), (0.12, 0.025, 0.025), mat(P("oboci"), spec["brows"]), rot=(0, s * -0.15, 0), bevel=0.01))
    # vlasy
    hair = spec.get("hair")
    if hair:
        hm = mat(P("vlasy"), hair[1], rough=0.45)
        style = hair[0]
        # vlasy kryjí temeno a zátylek, obličej zůstává volný (střed posunutý nahoru a dozadu)
        head.append(sphere((0, 0.1, 1.55), 0.49, hm, scale=(1.03, 0.94, 0.86)))
        # ofina: několik kapek přes čelo
        for k in range(5):
            x = -0.26 + k * 0.13
            head.append(sphere((x, -0.34, 1.74 - abs(k - 2) * 0.035), 0.1, hm, scale=(1.0, 0.6, 0.7)))
        if style in ("long", "pony"):
            for s in (-1, 1):
                head.append(sphere((s * 0.42, 0.05, 1.18), 0.16, hm, scale=(0.7, 0.8, 1.6)))
            head.append(sphere((0, 0.32, 1.2), 0.3, hm, scale=(1.2, 0.6, 1.2)))
        if style == "pony":
            head.append(sphere((0, 0.5, 1.45), 0.16, hm, scale=(0.9, 1.0, 1.3)))
        if style == "bun":
            head.append(sphere((0, 0.15, 1.95), 0.17, hm))
    if spec.get("beard"):
        bm = mat(P("vousy"), spec["beard"], rough=0.6)
        # plnovous pod pusou a knír nad ní, pusa zůstane vidět
        head.append(sphere((0, -0.33, 1.06), 0.24, bm, scale=(1.3, 0.62, 0.72)))
        for s in (-1, 1):
            head.append(sphere((s * 0.33, -0.26, 1.18), 0.12, bm, scale=(0.8, 0.7, 1.1)))
            head.append(sphere((s * 0.075, -0.45, 1.285), 0.055, bm, scale=(1.5, 0.55, 0.5)))
    if spec.get("hood"):
        hdm = mat(P("kapuce"), spec["hood"], rough=0.55)
        head.append(sphere((0, 0.06, 1.48), 0.56, hdm, scale=(1.0, 0.95, 0.95)))
        head.append(torus((0, -0.24, 1.42), 0.42, 0.06, hdm, rot=(math.pi / 2 - 0.2, 0, 0)))
        for k in range(9):
            a = math.pi * (0.15 + 0.7 * k / 8)
            head.append(cone((math.cos(a) * 0.4, -0.3, 1.42 + math.sin(a) * 0.4 - 0.1), 0.035, 0.08, mat("Av_zuby", "#ffffff", rough=0.3), rot=(math.pi / 2 + 0.3, 0, -a + math.pi / 2)))
    hlava_model = group(P("hlava_model"), head, hlava)

    # ---- oči, odlesky, pusa (+ varianty pro radost)
    eye_z = 1.42
    parts = []
    for s, side in ((-1, "leve"), (1, "prave")):
        x = s * 0.17
        if robot:
            o = box((x, -0.38, eye_z), (0.17, 0.03, 0.12), mat("Av_svit", spec.get("glow", "#4fd8ff"), emit=3.0), bevel=0.04)
        else:
            o = sphere((x, EYE_Y, eye_z), 0.085, eye, scale=(0.9, 0.45, 1.15))
        parts.append((P(f"oko_{side}"), [o]))
        h1 = sphere((x + 0.03, EYE_Y - 0.035, eye_z + 0.045), 0.03, hi, seg=12, rings=8)
        parts.append((P(f"odlesk_{side}"), [h1]))
        h2 = sphere((x - 0.025, EYE_Y - 0.035, eye_z - 0.04), 0.014, hi, seg=10, rings=6)
        parts.append((P(f"odlesk2_{side}"), [h2]))
        hap = torus((x, EYE_Y - 0.01, eye_z - 0.02), 0.06, 0.016, eye, rot=(math.pi / 2, 0, 0), arc=0.5)
        parts.append((P(f"oko_{side}_radost"), [hap]))
    smile = torus((0, -0.44, 1.24), 0.06, 0.014, mouth_m, rot=(math.pi / 2, math.pi, 0), arc=0.5)
    parts.append((P("pusa"), [smile]))
    open_m = sphere((0, -0.43, 1.22), 0.07, mouth_m, scale=(1.1, 0.4, 0.75))
    tongue = sphere((0, -0.455, 1.19), 0.035, mat("Av_jazyk", "#ff7a8a"), scale=(1.2, 0.5, 0.6))
    parts.append((P("pusa_radost"), [open_m, tongue]))
    face = {}
    for name, objs in parts:
        face[name] = group(name, objs, hlava)

    # ---- pokrývka hlavy / anténa a korunka
    hat = spec.get("hat")
    if hat:
        am = mat(P("antena_mat"), hat[1], rough=0.45)
        kind = hat[0]
        h = []
        if kind == "captain":
            h.append(cyl((0, 0, 1.86), 0.4, 0.18, am, r2=0.44))
            h.append(cyl((0, -0.12, 1.79), 0.28, 0.04, mat(P("stitek"), "#1a1a2a", rough=0.3), rot=(-0.25, 0, 0)))
            h.append(torus((0, 0, 1.79), 0.41, 0.025, gold))
            h.append(sphere((0, -0.43, 1.88), 0.06, gold, scale=(1, 0.4, 1)))
        elif kind == "tricorn":
            h.append(cyl((0, 0, 1.82), 0.56, 0.06, am))
            h.append(sphere((0, 0, 1.86), 0.36, am, scale=(1, 1, 0.7)))
            for a in (0, TAU / 3, 2 * TAU / 3):
                h.append(box((math.sin(a) * 0.42, -math.cos(a) * 0.42, 1.9), (0.5, 0.06, 0.16), am, rot=(0, 0, a), bevel=0.02))
            h.append(sphere((0, -0.42, 1.92), 0.07, mat("Av_lebka", "#f4f0e4"), scale=(1, 0.4, 1)))
        elif kind == "beanie":
            h.append(sphere((0, 0.02, 1.62), 0.5, am, scale=(1.0, 0.98, 0.78)))
            h.append(torus((0, 0, 1.7), 0.46, 0.06, am))
            h.append(sphere((0, 0, 2.07), 0.09, mat(P("bambule"), "#ffffff", rough=0.8)))
        elif kind == "cone":
            h.append(cone((0, 0.05, 2.15), 0.42, 0.95, am, rot=(0.12, 0, 0)))
            h.append(torus((0, 0, 1.72), 0.42, 0.06, mat(P("lem"), "#ffffff", rough=0.8)))
        elif kind == "witch":
            h.append(cyl((0, 0, 1.8), 0.7, 0.04, am))
            h.append(cone((0, 0.08, 2.25), 0.36, 0.95, am, rot=(0.25, 0, 0)))
            h.append(torus((0, 0, 1.86), 0.35, 0.05, mat(P("stuha"), spec.get("band", "#8e44ad"))))
            h.append(sphere((0, -0.36, 1.87), 0.05, gold, scale=(1, 0.4, 1)))
        elif kind == "helmet":
            h.append(sphere((0, 0, 1.42), 0.66, mat(P("sklo"), "#bfe8ff", rough=0.05, coat=1.0, alpha=0.25)))
            h.append(torus((0, 0, 0.95), 0.4, 0.08, am))
            h.append(cyl((0.35, 0.1, 2.05), 0.02, 0.3, am, rot=(0, 0.3, 0)))
            h.append(sphere((0.4, 0.1, 2.2), 0.05, mat(P("svetylko"), "#ff5d73", emit=3.0)))
        elif kind == "diver":
            h.append(sphere((0, 0, 1.42), 0.66, mat(P("sklo"), "#bfe8ff", rough=0.05, coat=1.0, alpha=0.25)))
            h.append(torus((0, 0, 0.98), 0.42, 0.1, am))
            for s in (-1, 1):
                h.append(cyl((s * 0.62, 0, 1.42), 0.12, 0.1, am, rot=(0, math.pi / 2, 0)))
            # mosazný rámeček okénka kolem obličeje
            h.append(torus((0, -0.5, 1.42), 0.4, 0.04, am, rot=(math.pi / 2, 0, 0)))
        elif kind == "fin":
            h.append(cone((0, 0.12, 2.1), 0.2, 0.42, am, rot=(-0.4, 0, 0)))
        elif kind == "bandana":
            h.append(sphere((0, 0.04, 1.58), 0.5, am, scale=(1.02, 0.98, 0.8)))
            for k in range(14):
                a = k * TAU / 14
                # puntíky na povrchu šátku (elipsoid se středem 1,58 a poloosami 0,51 × 0,49 × 0,4)
                h.append(sphere((math.sin(a) * 0.48, 0.04 - math.cos(a) * 0.46, 1.73), 0.03, mat(P("tecky"), "#ffffff", rough=0.5), seg=10, rings=6, scale=(1, 0.5, 1)))
            h.append(sphere((0.3, 0.42, 1.55), 0.09, am))
        elif kind == "antenna":
            h.append(cyl((0, 0, 1.9), 0.02, 0.3, am))
            h.append(sphere((0, 0, 2.08), 0.06, mat(P("svetylko"), spec.get("glow", "#ff5d73"), emit=3.0)))
        group(P("antena_model"), h, hlava)
    if spec.get("crown"):
        c = []
        cm = gold
        c.append(cyl((0, 0, 1.88), 0.24, 0.12, cm, r2=0.27))
        for k in range(6):
            a = k * TAU / 6
            c.append(cone((math.sin(a) * 0.25, -math.cos(a) * 0.25, 2.0), 0.05, 0.14, cm))
        for k, col in enumerate(["#e5484d", "#2e86c1", "#3fb070"]):
            a = (k - 1) * 0.6
            c.append(sphere((math.sin(a) * 0.255, -math.cos(a) * 0.255, 1.88), 0.035, mat(f"Av_kamen_{k}", col, rough=0.1, coat=0.8), seg=12, rings=8))
        group("koruna_" + aid, c, hlava)
    if spec.get("earring"):
        group(P("nausnice"), [torus((0.47, -0.02, 1.3), 0.035, 0.008, gold, rot=(0, math.pi / 2, 0))], hlava)
    if spec.get("eyepatch"):
        group(P("paska"), [sphere((-0.17, EYE_Y - 0.01, eye_z), 0.11, mat(P("paska_m"), "#1a1a1a", rough=0.4), scale=(1, 0.3, 1)), torus((0, 0, 1.5), 0.48, 0.012, mat(P("paska_m"), "#1a1a1a"), rot=(0.25, -0.3, 0))], hlava)

    # ---- ruce
    for piv, m, s, side in ((sh_l, arm_l, -1, "leva"), (sh_r, arm_r, 1, "prava")):
        x = s * 0.36
        arm = [cyl((x, 0, 0.7), 0.075, 0.34, m), sphere((x, 0, 0.87), 0.085, m)]
        hand = sphere((x, 0, 0.5), 0.09, skin if not robot else mat(P("ruka_kov"), "#8a92a8", metal=0.6, rough=0.3))
        arm.append(hand)
        group(P(f"ruka_{side}_model"), arm, piv)

    # ---- ocas
    tail = spec.get("tail")
    if tail:
        piv = empty(P("ocas"), (0, 0.3, 0.45), telo)
        tm = mat(P("ocas_mat"), tail[1], rough=0.6)
        t = []
        if tail[0] == "fluffy":
            for k in range(6):
                a = k / 5
                t.append(sphere((0, 0.36 + math.sin(a * 2.2) * 0.25, 0.45 + a * 0.7), 0.17 + 0.06 * math.sin(a * math.pi), tm))
        elif tail[0] == "shark":
            t.append(cone((0, 0.5, 0.45), 0.16, 0.42, tm, rot=(-math.pi / 2, 0, 0)))
            t.append(box((0, 0.72, 0.5), (0.05, 0.12, 0.38), tm, rot=(0.3, 0, 0), bevel=0.03))
        elif tail[0] == "spring":
            for k in range(6):
                t.append(torus((0, 0.36 + k * 0.05, 0.45 + k * 0.05), 0.06, 0.015, tm, rot=(math.pi / 2 - 0.6, 0, 0)))
            t.append(sphere((0, 0.68, 0.76), 0.07, mat(P("kulicka"), spec.get("glow", "#ff5d73"), emit=2.0)))
        group(P("ocas_model"), t, piv)

    # ---- animace „klid“ (2 s smyčka) a „radost“ (1,25 s)
    def keys(clip, frames):
        """frames: {objekt: [(snímek, {vlastnost: hodnota})]}; každý klip je vlastní akce ve stopě NLA téhož jména."""
        for obj, ks in frames.items():
            if obj.animation_data is None:
                obj.animation_data_create()
            act = bpy.data.actions.new(f"{obj.name}_{clip}")
            obj.animation_data.action = act
            base = {"location": tuple(obj.location), "rotation_euler": tuple(obj.rotation_euler), "scale": tuple(obj.scale)}
            for f, vals in ks:
                for prop, v in vals.items():
                    setattr(obj, prop, v)
                    obj.keyframe_insert(data_path=prop, frame=f)
                for prop, v in base.items():
                    setattr(obj, prop, v)
            track = obj.animation_data.nla_tracks.new()
            track.name = clip
            track.strips.new(clip, 1, act)
            obj.animation_data.action = None

    hl, tl = hlava.location.copy(), telo.location.copy()
    idle = {
        telo: [(1, {"scale": (1, 1, 1)}), (25, {"scale": (1.015, 1.015, 0.985)}), (49, {"scale": (1, 1, 1)})],
        hlava: [(1, {"rotation_euler": (0, 0, 0)}), (13, {"rotation_euler": (0.03, 0.05, 0.04)}), (37, {"rotation_euler": (-0.02, -0.05, -0.04)}), (49, {"rotation_euler": (0, 0, 0)})],
        sh_l: [(1, {"rotation_euler": (0, 0.05, 0)}), (25, {"rotation_euler": (0.08, 0.1, 0)}), (49, {"rotation_euler": (0, 0.05, 0)})],
        sh_r: [(1, {"rotation_euler": (0, -0.05, 0)}), (25, {"rotation_euler": (-0.08, -0.1, 0)}), (49, {"rotation_euler": (0, -0.05, 0)})],
    }
    joy = {
        telo: [(1, {"location": tl, "scale": (1, 1, 1)}), (5, {"location": tl, "scale": (1.08, 1.08, 0.88)}), (13, {"location": tl + Vector((0, 0, 0.32)), "scale": (0.96, 0.96, 1.06)}), (21, {"location": tl, "scale": (1.06, 1.06, 0.9)}), (30, {"location": tl, "scale": (1, 1, 1)})],
        hlava: [(1, {"rotation_euler": (0, 0, 0)}), (13, {"rotation_euler": (-0.15, 0, 0.1)}), (30, {"rotation_euler": (0, 0, 0)})],
        sh_l: [(1, {"rotation_euler": (0, 0, 0)}), (9, {"rotation_euler": (0, 2.5, 0)}), (22, {"rotation_euler": (0, 2.3, 0)}), (30, {"rotation_euler": (0, 0, 0)})],
        sh_r: [(1, {"rotation_euler": (0, 0, 0)}), (9, {"rotation_euler": (0, -2.5, 0)}), (22, {"rotation_euler": (0, -2.3, 0)}), (30, {"rotation_euler": (0, 0, 0)})],
    }
    if tail:
        tp = bpy.data.objects[P("ocas")]
        idle[tp] = [(1, {"rotation_euler": (0, 0, -0.15)}), (25, {"rotation_euler": (0, 0, 0.15)}), (49, {"rotation_euler": (0, 0, -0.15)})]
        joy[tp] = [(1, {"rotation_euler": (0, 0, 0)}), (8, {"rotation_euler": (0, 0, 0.5)}), (16, {"rotation_euler": (0, 0, -0.5)}), (24, {"rotation_euler": (0, 0, 0.4)}), (30, {"rotation_euler": (0, 0, 0)})]
    on, off = (1, 1, 1), (0.001, 0.001, 0.001)
    for side in ("leve", "prave"):
        for nm in (f"oko_{side}", f"odlesk_{side}", f"odlesk2_{side}"):
            idle[face[P(nm)]] = [(1, {"scale": on}), (49, {"scale": on})]
            joy[face[P(nm)]] = [(1, {"scale": on}), (3, {"scale": off}), (27, {"scale": off}), (30, {"scale": on})]
        hp = face[P(f"oko_{side}_radost")]
        idle[hp] = [(1, {"scale": off}), (49, {"scale": off})]
        joy[hp] = [(1, {"scale": off}), (3, {"scale": on}), (27, {"scale": on}), (30, {"scale": off})]
    idle[face[P("pusa")]] = [(1, {"scale": on}), (49, {"scale": on})]
    joy[face[P("pusa")]] = [(1, {"scale": on}), (3, {"scale": off}), (27, {"scale": off}), (30, {"scale": on})]
    idle[face[P("pusa_radost")]] = [(1, {"scale": off}), (49, {"scale": off})]
    joy[face[P("pusa_radost")]] = [(1, {"scale": off}), (3, {"scale": on}), (27, {"scale": on}), (30, {"scale": off})]
    keys("klid", idle)
    keys("radost", joy)
    # výchozí stav (bez animace): radostné varianty schované
    for nm in (P("oko_leve_radost"), P("oko_prave_radost"), P("pusa_radost")):
        face[nm].scale = off
    return root


# ---------------------------------------------------------------------------------------------- export
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _mats.clear()
    sc = bpy.context.scene
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 1, 49


def export(aid):
    os.makedirs(TMP, exist_ok=True)
    raw = f"{TMP}/{aid}.glb"
    bpy.ops.export_scene.gltf(filepath=raw, export_format="GLB", export_apply=True, export_yup=True, export_animations=True, export_animation_mode="NLA_TRACKS", export_lights=False, export_cameras=False)
    out = os.path.join(OUT, f"{aid}.glb")
    tool = os.environ.get("GLTF_TRANSFORM", "gltf-transform")
    # jen komprese geometrie: optimize by spojil uzly a zničil jejich jména, na kterých stojí šatník a mrkání
    subprocess.run([tool, "draco", raw, out], check=True, capture_output=True)
    print(f"EXPORT {aid}: {os.path.getsize(out) // 1024} kB", flush=True)


def stills(aid):
    """Portrét do kolečka a celá postava pro podium (Cycles, průhledné pozadí)."""
    from PIL import Image

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "AgX"
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#e8eeff")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8
    sc.world = w
    for (rot, en) in [((math.radians(55), 0, math.radians(-30)), 3.0), ((math.radians(70), 0, math.radians(140)), 1.2)]:
        ld = bpy.data.lights.new("s", "SUN")
        ld.energy = en
        lo = bpy.data.objects.new("s", ld)
        sc.collection.objects.link(lo)
        lo.rotation_euler = rot
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    sc.camera = co

    def shot(path, z, ortho, size):
        cam.ortho_scale = ortho
        co.location = (0.0, -8.0, z + 0.25)
        co.rotation_euler = (math.radians(88), 0, 0)
        sc.render.resolution_x = sc.render.resolution_y = size
        sc.render.filepath = path
        sc.frame_set(1)
        bpy.ops.render.render(write_still=True)

    shot(f"{TMP}/{aid}-p.png", 1.35, 1.45, 512)
    shot(f"{TMP}/{aid}-f.png", 1.05, 2.45, 512)
    Image.open(f"{TMP}/{aid}-p.png").resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, f"{aid}-portret.webp"), quality=86)
    fig = Image.open(f"{TMP}/{aid}-f.png")
    fig = fig.crop(fig.getbbox())
    h = 256
    fig = fig.resize((max(1, round(fig.width * h / fig.height)), h), Image.LANCZOS)
    fig.save(os.path.join(OUT, f"{aid}-postava.webp"), quality=86)
    print(f"STILLS {aid}: postava {fig.width} × {h}", flush=True)


# --------------------------------------------------------------------------------------------- postavy
SPECS = [
    dict(id="captain", skin="#ffd5a8", top="#1f3a6e", pants="#1a2a4a", collar="#ffffff", buttons=3, hair=("short", "#f4f4f4"), beard="#f4f4f4", hat=("captain", "#1f3a6e"), brows="#e0e0e0"),
    dict(id="sea-wolf", skin="#e0b48a", top="#ffc933", sleeve="#ffc933", pants="#2f3c6e", beard="#9a9aa0", hat=("beanie", "#b8392b"), brows="#6a6a70", earring=True, buttons=2),
    dict(id="princess", skin="#ffe0c8", top="#ff8fc8", dress=True, hair=("long", "#ffd24d"), crown=True, belt="#ffc933", earring=True, pants="#ff8fc8", shoes="#e5484d"),
    dict(id="diver", skin="#ffd5a8", top="#2e86c1", stripes="#ffd24d", pants="#2e86c1", shoes="#ffd24d", hair=("short", "#6a3b22"), hat=("diver", "#c8a050")),
    dict(id="piratka", skin="#f0c8a0", top="#ffffff", stripes="#e5484d", vest="#7a4a2a", pants="#2a2a3a", hair=("long", "#c0392b"), hat=("bandana", "#e5484d"), earring=True, eyepatch=True, belt="#3a2a1a"),
    dict(id="kosmonautka", skin="#ffd5a8", top="#f4f4f8", sleeve="#f4f4f8", pants="#f4f4f8", shoes="#ff8a3d", collar="#2e86c1", hair=("bun", "#3a2a22"), hat=("helmet", "#2e86c1"), buttons=2),
    dict(id="robopes", kind="robot", skin="#c8d0dc", top="#8a92a8", pants="#6a7288", shoes="#4a5268", ears="dog", ear="#6a7288", hat=("antenna", "#4a5268"), tail=("spring", "#8a92a8"), glow="#4fd8ff"),
    dict(id="skritek", skin="#ffd5a8", top="#3f9a4a", pants="#7a4a2a", shoes="#5a3a20", beard="#ffffff", hat=("cone", "#e5484d"), belt="#3a2a1a", brows="#ffffff"),
    dict(id="veverka", kind="animal", skin="#d8843a", top="#d8843a", sleeve="#d8843a", belly="#ffe8c8", muzzle="#ffe8c8", ears="squirrel", tuft="#a8582a", tail=("fluffy", "#c8743a"), paw="#8a4a1a"),
    dict(id="princ", skin="#ffd5a8", top="#2e5aa8", pants="#f4ead8", shoes="#5a3a20", hair=("short", "#7a4a2a"), crown=True, cape="#c0392b", belt="#ffc933", buttons=2),
    dict(id="carodejnice", skin="#ffe0c8", top="#6a3aa8", dress=True, pants="#6a3aa8", shoes="#2a1a3a", hair=("long", "#8e44ad"), hat=("witch", "#2a2238"), band="#c08cff", earring=True),
    dict(id="zralok", skin="#ffd5a8", top="#7a8ca8", sleeve="#7a8ca8", belly="#f4f4f8", pants="#7a8ca8", shoes="#4a5a78", hood="#7a8ca8", hat=("fin", "#7a8ca8"), tail=("shark", "#7a8ca8")),
]


if __name__ == "__main__":
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    want = [x for x in a if not x.startswith("--")]
    do_stills = "--stills" in a
    for spec in SPECS:
        if want != ["all"] and spec["id"] not in want:
            continue
        reset()
        build(spec)
        export(spec["id"])
        if do_stills:
            stills(spec["id"])
