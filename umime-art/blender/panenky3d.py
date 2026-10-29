"""3D panenky pro hru „Obleč panenku“: jedna GLB na panenku s tělem, šedým spodním prádlem a kusy oblečení jako samostatné uzly.

Uzly: face_happy/face_sad/face_neutral (obočí a pusa), slot_hair, slot_outfit, slot_shoes, slot_makeup (uvnitř lips_<nálada>),
slot_accessory, slot_topper. Web je zapíná a vypíná a materiály kusů (jméno <slot>_a / <slot>_b) přebarvuje při špatné odpovědi.
Panenka hledí do -Y (po exportu do +Z), je vysoká asi 2 jednotky.

Spuštění: python panenky3d.py -- <id|all>   → ../../public/dolls/panenka-<id>.glb
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa: E402,F401,F403
from mathutils import Vector  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTDIR = os.path.join(REPO, "public", "dolls")

# Zrcadlí src/lib/dress.ts
DOLLS = {
    "princess": dict(skin="#f7d3b8", hair=("long", "#f4c542"), outfit=("gown", "#ff7eb6", "#ffd1e8"), shoes=("heels", "#ff4f9a", "#ffd1e8"),
                     makeup=("#e0457b", "#c58bff", "#ff9ab8"), acc=("necklace", "#ffd23f", "#59c3ff"), topper=("crown", "#ffd23f", "#ff4f9a")),
    "athlete": dict(skin="#e8b48e", hair=("pony", "#7a4a2a"), outfit=("sport", "#2a8cff", "#ffffff"), shoes=("sneaker", "#ffffff", "#ff5d3a"),
                    makeup=("#e07a6a", "#8fd0ff", "#ffa08a"), acc=("medal", "#ffd23f", "#ff5d3a"), topper=("cap", "#ff5d3a", "#ffffff")),
    "rocker": dict(skin="#f1c9a8", hair=("bob", "#2a1f3d"), outfit=("rock", "#1f1b2e", "#c43cff"), shoes=("boots", "#2a2438", "#c43cff"),
                   makeup=("#7a1fa8", "#3a2a5c", "#b78acb"), acc=("glasses", "#1f1b2e", "#c43cff"), topper=("jacket", "#2a2438", "#c43cff")),
    "fairy": dict(skin="#f9dcc4", hair=("curly", "#58c27d"), outfit=("fairy", "#7ee0b0", "#ffe36e"), shoes=("ballet", "#ffb5d6", "#ffffff"),
                  makeup=("#f06b9c", "#9be6c0", "#ffb0c8"), acc=("wand", "#c9923a", "#ffe36e"), topper=("flowers", "#ff7eb6", "#ffe36e")),
    "chef": dict(skin="#d9a07a", hair=("bun", "#3b2418"), outfit=("chef", "#ffffff", "#ff6b5b"), shoes=("clog", "#ffffff", "#ff6b5b"),
                 makeup=("#d4504a", "#ffb84d", "#f08a70"), acc=("ladle", "#b0b6c2", "#6e4520"), topper=("chefhat", "#ffffff", "#e6e6ee")),
    "astronaut": dict(skin="#b98a68", hair=("braids", "#1c1c28"), outfit=("astro", "#f2f4ff", "#ff5d73"), shoes=("moon", "#c9cfe6", "#ff5d73"),
                      makeup=("#c4506a", "#7a8cff", "#d98a8a"), acc=("badge", "#ffd23f", "#2a8cff"), topper=("helmet", "#cfe3ff", "#9fb4d9")),
}

GREY, GREY_DARK, INK = "#9aa0ac", "#7d8391", "#2b2236"
_M = {}


def mt(name, color, rough=0.55, alpha=None, metal=0.0):
    if name not in _M:
        m = material(name, color, roughness=rough, metallic=metal)
        if alpha is not None:
            m.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = alpha
            try:
                m.surface_render_method = "BLENDED"
            except Exception:
                pass
        _M[name] = m
    return _M[name]


def node(name, parent=None):
    o = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(o)
    if parent:
        o.parent = parent
    return o


def smooth(o):
    if o.type == "MESH":
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def add(g, o, mat):
    o.parent = g
    o.data.materials.append(mat)
    return smooth(o)


def sph(g, loc, r, mat, sc=(1, 1, 1), rot=(0, 0, 0), seg=20, rings=14):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=rings)
    o = bpy.context.object
    o.scale = sc
    o.rotation_euler = rot
    return add(g, o, mat)


def seg(g, p1, p2, r1, r2, mat, verts=18, sy=1.0, cap=False):
    a, b = Vector(p1), Vector(p2)
    d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=d.length, location=(a + b) / 2, end_fill_type="NGON")
    o = bpy.context.object
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    if sy != 1.0:
        o.scale = (1, sy, 1)
    add(g, o, mat)
    if cap:
        sph(g, p1, r1, mat, seg=verts, rings=10)
        sph(g, p2, r2, mat, seg=verts, rings=10)
    return o


def box(g, loc, size, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = size
    o.rotation_euler = rot
    return add(g, o, mat)


def ring(g, loc, R, r, mat, sc=(1, 1, 1), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=R, minor_radius=r, major_segments=36, minor_segments=10)
    o = bpy.context.object
    o.scale = sc
    o.rotation_euler = rot
    return add(g, o, mat)


def star(g, loc, r, mat, rot=(math.pi / 2, 0, 0), depth=0.02):
    bpy.ops.mesh.primitive_cone_add(vertices=5, radius1=r, radius2=r * 0.5, depth=depth, location=loc)
    o = bpy.context.object
    o.rotation_euler = rot
    return add(g, o, mat)


def arc(g, cx, z, y, half, bend, r, mat, n=7):
    """Oblouk z kuliček (pusa): bend > 0 = úsměv (střed níž), bend < 0 = smutek."""
    for i in range(n):
        u = -1 + 2 * i / (n - 1)
        sph(g, (cx + u * half, y, z - bend * (1 - u * u)), r, mat, seg=10, rings=8)


def shell(g, z0, z1, r0, r1, mat, sy=0.8, verts=28):
    seg(g, (0, 0, z0), (0, 0, z1), r0, r1, mat, verts=verts, sy=sy)


SHOULDER = 1.24
HEAD_Z = 1.68
WRIST = 0.70


def arm_pts(sx):
    return (0.235 * sx, 0, SHOULDER), (0.36 * sx, -0.02, WRIST)


def body(root, d):
    g = node("body", root)
    skin = mt("body_skin", d["skin"], 0.6)
    for sx in (-1, 1):
        x = 0.1 * sx
        seg(g, (x, 0, 0.88), (x * 0.95, 0, 0.12), 0.088, 0.052, skin, cap=True)
        sph(g, (x, -0.045, 0.06), 0.06, skin, sc=(0.95, 1.5, 0.7))
        a, b = arm_pts(sx)
        seg(g, a, b, 0.052, 0.04, skin, cap=True)
        sph(g, b, 0.052, skin)
    seg(g, (0, 0, 0.88), (0, 0, 1.3), 0.2, 0.17, skin, sy=0.78, cap=False)
    sph(g, (0, 0, 0.9), 0.2, skin, sc=(1, 0.78, 0.5))
    sph(g, (0, 0, 1.3), 0.17, skin, sc=(1, 0.78, 0.55))
    seg(g, (0, 0, 1.28), (0, 0, 1.44), 0.062, 0.055, skin)
    sph(g, (0, 0, HEAD_Z), 0.29, skin, sc=(1, 0.95, 1.04), seg=32, rings=20)
    for sx in (-1, 1):
        sph(g, (0.285 * sx, 0, HEAD_Z - 0.02), 0.045, skin, sc=(0.5, 0.8, 1.1))
    # spodní prádlo: šedé kraťasy a sportovní podprsenka (vlastní uzel, web ho při oblečení schová)
    u = node("underwear", root)
    gm, gd = mt("under_grey", GREY, 0.95), mt("under_dark", GREY_DARK, 0.95)
    seg(u, (0, 0, 0.84), (0, 0, 1.0), 0.213, 0.2, gm, sy=0.8)
    seg(u, (0, 0, 0.985), (0, 0, 1.0), 0.205, 0.205, gd, sy=0.8)
    for sx in (-1, 1):
        x = 0.1 * sx
        seg(u, (x, 0, 0.88), (x * 1.02, 0, 0.62), 0.101, 0.094, gm)
        sph(u, (0.075 * sx, -0.135, 1.18), 0.082, gm, sc=(1, 0.9, 0.95))
        seg(u, (0.075 * sx, -0.12, 1.24), (0.14 * sx, -0.03, 1.31), 0.012, 0.012, gd)
    seg(u, (0, 0, 1.12), (0, 0, 1.2), 0.182, 0.182, gm, sy=0.8)
    # oči a nos
    eye = mt("face_eye", INK, 0.3)
    white = mt("face_white", "#ffffff", 0.3)
    for sx in (-1, 1):
        sph(g, (0.095 * sx, -0.262, 1.70), 0.036, eye, sc=(1, 0.5, 1.35), seg=14, rings=10)
        sph(g, (0.088 * sx, -0.284, 1.717), 0.011, white, seg=8, rings=6)
        sph(g, (0.15 * sx, -0.222, 1.62), 0.05, mt("face_blush", "#ffb0b8", 0.8), sc=(1, 0.3, 0.7), seg=12, rings=8)
    sph(g, (0, -0.287, 1.64), 0.018, skin, sc=(1, 0.8, 1))
    return g


def faces(root, d):
    brow = mt("face_brow", INK, 0.5)
    mouth = mt("face_mouth", "#b5524f", 0.5)
    tear = mt("face_tear", "#7fd0ff", 0.2, alpha=0.8)
    for mood in ("happy", "sad", "neutral"):
        g = node(f"face_{mood}", root)
        for sx in (-1, 1):
            tilt = {"happy": -0.12, "sad": 0.4, "neutral": 0.0}[mood]
            box(g, (0.1 * sx, -0.258, 1.775 + (0.02 if mood == "happy" else 0)), (0.09, 0.012, 0.014), brow, rot=(0, tilt * sx, 0))
        bend = {"happy": 0.026, "sad": -0.022, "neutral": 0.0}[mood]
        arc(g, 0, 1.585 if mood != "sad" else 1.565, -0.262, 0.05, bend, 0.012, mouth)
        if mood == "sad":
            sph(g, (-0.11, -0.266, 1.64), 0.018, tear, sc=(0.7, 0.6, 1.6), seg=10, rings=8)


def make_hair(root, d):
    g = node("slot_hair", root)
    kind, col = d["hair"]
    m = mt("hair_a", col, 0.5)
    sph(g, (0, 0.05, HEAD_Z + 0.02), 0.325, m, sc=(1, 1, 1.02), seg=32, rings=20)
    for i, x in enumerate((-0.19, -0.095, 0.0, 0.095, 0.19)):
        sph(g, (x, -0.205, 1.855 - abs(x) * 0.25), 0.095, m, sc=(1.1, 0.7, 0.85))
    if kind == "long":
        sph(g, (0, 0.13, 1.42), 0.3, m, sc=(1.05, 0.55, 1.55))
        for sx in (-1, 1):
            seg(g, (0.27 * sx, -0.02, 1.7), (0.31 * sx, 0.02, 1.2), 0.07, 0.05, m, cap=True)
    elif kind == "bob":
        sph(g, (0, 0.11, 1.6), 0.335, m, sc=(1.02, 0.86, 0.88))
        for sx in (-1, 1):
            seg(g, (0.27 * sx, -0.03, 1.72), (0.31 * sx, -0.02, 1.5), 0.075, 0.07, m, cap=True)
    elif kind == "pony":
        sph(g, (0.17, 0.2, 1.92), 0.05, mt("hair_b", "#ff5d3a", 0.5))
        seg(g, (0.17, 0.2, 1.9), (0.3, 0.34, 1.35), 0.11, 0.035, m, cap=True)
    elif kind == "bun":
        sph(g, (0, 0.05, 2.1), 0.14, m)
        ring(g, (0, 0.05, 2.0), 0.1, 0.018, mt("hair_b", "#ff6b5b", 0.5))
    elif kind == "curly":
        for k in range(12):
            a = math.radians(-100 + k * 18.5)
            sph(g, (math.sin(a) * 0.3, 0.03 + math.cos(a) * 0.1 * -1 + 0.08, 1.52 + (k % 3) * 0.16), 0.105, m)
        for x in (-0.12, 0, 0.12):
            sph(g, (x, 0.0, 2.0), 0.11, m)
    elif kind == "braids":
        rib = mt("hair_b", "#ff5d73", 0.5)
        for sx in (-1, 1):
            for k in range(7):
                sph(g, (0.29 * sx + 0.02 * ((k % 2) * 2 - 1) * sx, 0.04, 1.58 - k * 0.085), 0.058, m, sc=(1, 0.9, 0.85))
            sph(g, (0.29 * sx, 0.04, 0.97), 0.045, rib)
    return g


def make_outfit(root, d):
    g = node("slot_outfit", root)
    kind, ca, cb = d["outfit"]
    a, b = mt("outfit_a", ca, 0.6), mt("outfit_b", cb, 0.6)
    if kind == "gown":
        shell(g, 0.95, 1.31, 0.215, 0.185, a)
        sph(g, (0, 0, 1.31), 0.185, a, sc=(1, 0.8, 0.5))
        shell(g, 0.92, 1.0, 0.232, 0.225, b)
        seg(g, (0, 0, 0.97), (0, 0, 0.13), 0.205, 0.62, a, verts=48, sy=1.0)
        ring(g, (0, 0, 0.15), 0.6, 0.035, b)
        for k in range(10):
            ang = k * math.tau / 10 + 0.3
            sph(g, (math.cos(ang) * 0.45, math.sin(ang) * 0.45, 0.4 + (k % 3) * 0.1), 0.028, mt("outfit_dot", "#ffffff", 0.4), seg=8, rings=6)
        for sx in (-1, 1):
            sph(g, (0.16 * sx, -0.02, 1.27), 0.07, a)
        sph(g, (0, -0.2, 0.99), 0.05, b)
    elif kind == "sport":
        shell(g, 1.0, 1.31, 0.205, 0.185, a)
        sph(g, (0, 0, 1.3), 0.185, a, sc=(1, 0.8, 0.5))
        shell(g, 1.12, 1.17, 0.21, 0.205, b)
        for sx in (-1, 1):
            sph(g, (0.17 * sx, -0.02, 1.24), 0.075, a)
            x = 0.1 * sx
            seg(g, (x, 0, 0.9), (x * 1.04, 0, 0.58), 0.108, 0.104, a)
            seg(g, (x, 0, 0.11), (x, 0, 0.3), 0.06, 0.064, b)
            ring(g, (x, 0, 0.28), 0.063, 0.01, a)
        seg(g, (0, 0, 0.84), (0, 0, 1.0), 0.222, 0.21, a, sy=0.8)
        shell(g, 0.95, 0.99, 0.222, 0.222, b)
    elif kind == "rock":
        shell(g, 0.98, 1.3, 0.21, 0.185, a)
        sph(g, (0, 0, 1.3), 0.185, a, sc=(1, 0.8, 0.5))
        for sx in (-1, 1):
            a1, b1 = arm_pts(sx)
            seg(g, a1, (0.3 * sx, -0.01, 1.07), 0.07, 0.066, a)
            sph(g, a1, 0.07, a)
        star(g, (0, -0.172, 1.16), 0.075, b, depth=0.015)
        seg(g, (0, 0, 0.98), (0, 0, 0.55), 0.215, 0.38, b, verts=40)
        tart = mt("outfit_line", ca, 0.6)
        for z, rr in ((0.62, 0.35), (0.73, 0.31), (0.84, 0.275)):
            ring(g, (0, 0, z), rr, 0.012, tart)
        shell(g, 0.97, 1.01, 0.222, 0.222, tart)
    elif kind == "fairy":
        shell(g, 0.95, 1.31, 0.212, 0.186, a)
        sph(g, (0, 0, 1.3), 0.186, a, sc=(1, 0.8, 0.5))
        for k in range(10):
            ang = k * math.tau / 10
            petal = a if k % 2 == 0 else b
            sph(g, (math.cos(ang) * 0.26, math.sin(ang) * 0.26, 0.62), 0.2, petal, sc=(0.5, 0.22, 1.15), rot=(0, math.radians(14) * 0, ang + math.pi / 2), seg=14, rings=10)
        seg(g, (0, 0, 0.98), (0, 0, 0.7), 0.205, 0.28, a, verts=32)
        wing = mt("outfit_wing", "#bff3ff", 0.2, alpha=0.6)
        for sx in (-1, 1):
            sph(g, (0.27 * sx, 0.16, 1.38), 0.25, wing, sc=(1, 0.05, 1.45), rot=(0, math.radians(-22) * sx, 0))
            sph(g, (0.2 * sx, 0.15, 1.0), 0.17, wing, sc=(1, 0.05, 1.3), rot=(0, math.radians(18) * sx, 0))
        for k in range(3):
            sph(g, (0, -0.19 + 0.0, 1.14 - k * 0.1), 0.025, b, sc=(1, 0.5, 1))
    elif kind == "chef":
        shell(g, 0.84, 1.33, 0.235, 0.205, a, sy=0.82)
        sph(g, (0, 0, 1.33), 0.205, a, sc=(1, 0.82, 0.5))
        for sx in (-1, 1):
            a1, b1 = arm_pts(sx)
            seg(g, a1, b1, 0.075, 0.068, a, cap=True)
            ring(g, (b1[0], b1[1], b1[2] + 0.04), 0.07, 0.012, b)
            x = 0.1 * sx
            seg(g, (x, 0, 0.88), (x * 1.02, 0, 0.14), 0.108, 0.1, b)
            for z in (0.3, 0.5, 0.7):
                ring(g, (x * 1.01, 0, z), 0.104, 0.01, mt("outfit_check", "#ffffff", 0.6))
        for z in (0.95, 1.05, 1.15, 1.25):
            sph(g, (0.045, -0.2, z), 0.018, b, sc=(1, 0.6, 1))
    elif kind == "astro":
        shell(g, 0.86, 1.32, 0.225, 0.2, a, sy=0.82)
        sph(g, (0, 0, 1.32), 0.2, a, sc=(1, 0.82, 0.5))
        for sx in (-1, 1):
            a1, b1 = arm_pts(sx)
            seg(g, a1, b1, 0.075, 0.068, a, cap=True)
            sph(g, b1, 0.068, b)
            x = 0.1 * sx
            seg(g, (x, 0, 0.9), (x * 0.98, 0, 0.16), 0.108, 0.092, a, cap=True)
        ring(g, (0, 0, 0.94), 0.225, 0.02, b, sc=(1, 0.82, 1))
        sph(g, (0.09, -0.185, 1.2), 0.04, b, sc=(1, 0.4, 1))
        box(g, (-0.05, -0.19, 1.1), (0.11, 0.025, 0.07), mt("outfit_panel", d["acc"][2], 0.4))
    return g


def foot_shape(g, x, mat, r=0.09, sc=(0.95, 1.5, 0.75), z=0.07):
    sph(g, (x, -0.05, z), r, mat, sc=sc)


def make_shoes(root, d):
    g = node("slot_shoes", root)
    kind, ca, cb = d["shoes"]
    a, b = mt("shoes_a", ca, 0.5), mt("shoes_b", cb, 0.5)
    for sx in (-1, 1):
        x = 0.1 * sx * 0.95
        if kind == "sneaker":
            foot_shape(g, x, a)
            box(g, (x, -0.055, 0.015), (0.17, 0.27, 0.035), b)
            sph(g, (x, -0.08, 0.12), 0.03, b, sc=(1.5, 1, 0.6))
            seg(g, (x, 0, 0.1), (x, 0, 0.17), 0.07, 0.075, a)
        elif kind == "heels":
            foot_shape(g, x, a, r=0.08, sc=(0.95, 1.6, 0.6), z=0.13)
            seg(g, (x, 0.05, 0.13), (x, 0.055, 0.0), 0.028, 0.016, a)
            seg(g, (x, 0, 0.14), (x, 0, 0.17), 0.065, 0.065, b)
        elif kind == "boots":
            seg(g, (x, 0, 0.4), (x, 0, 0.06), 0.1, 0.095, a, cap=True)
            foot_shape(g, x, a)
            box(g, (x, -0.055, 0.015), (0.18, 0.28, 0.035), b)
            ring(g, (x, 0, 0.37), 0.102, 0.014, b)
            for z in (0.18, 0.27):
                ring(g, (x, 0, z), 0.098, 0.008, b)
        elif kind == "ballet":
            foot_shape(g, x, a, r=0.075, sc=(1, 1.6, 0.6), z=0.06)
            ring(g, (x, 0, 0.15), 0.062, 0.01, b)
            ring(g, (x, 0, 0.21), 0.062, 0.01, b)
        elif kind == "clog":
            foot_shape(g, x, a, r=0.1, sc=(1, 1.55, 0.85))
            box(g, (x, -0.055, 0.015), (0.19, 0.29, 0.04), b)
            sph(g, (x, -0.12, 0.13), 0.025, b)
        elif kind == "moon":
            seg(g, (x, 0, 0.44), (x, 0, 0.08), 0.112, 0.105, a, cap=True)
            sph(g, (x, -0.05, 0.05), 0.1, b, sc=(1.15, 1.6, 0.55))
            ring(g, (x, 0, 0.42), 0.114, 0.016, b)
    return g


def make_makeup(root, d):
    g = node("slot_makeup", root)
    lips, shadow, blush = d["makeup"]
    sh, bl = mt("makeup_a", shadow, 0.5), mt("makeup_b", blush, 0.7)
    lip = mt("makeup_lips", lips, 0.35)
    lash = mt("makeup_lash", INK, 0.5)
    for sx in (-1, 1):
        sph(g, (0.095 * sx, -0.248, 1.742), 0.05, sh, sc=(1.4, 0.3, 0.7), seg=14, rings=8)
        sph(g, (0.15 * sx, -0.21, 1.62), 0.056, bl, sc=(1, 0.3, 0.75), seg=14, rings=8)
        for k in range(3):
            seg(g, (0.13 * sx + k * 0.012 * sx, -0.262, 1.715), (0.162 * sx + k * 0.012 * sx, -0.26, 1.735 + k * 0.012), 0.004, 0.003, lash, verts=6)
    for mood, bend, z in (("happy", 0.026, 1.585), ("sad", -0.022, 1.565), ("neutral", 0.0, 1.58)):
        lg = node(f"lips_{mood}", g)
        arc(lg, 0, z, -0.264, 0.05, bend, 0.0145, lip)
    return g


def make_accessory(root, d):
    g = node("slot_accessory", root)
    kind, ca, cb = d["acc"]
    a, b = mt("accessory_a", ca, 0.4, metal=0.0), mt("accessory_b", cb, 0.4)
    if kind == "necklace":
        ring(g, (0, -0.02, 1.27), 0.125, 0.008, a, sc=(1, 0.8, 1))
        sph(g, (0, -0.125, 1.2), 0.035, b)
    elif kind == "medal":
        seg(g, (0.07, -0.14, 1.3), (0, -0.17, 1.2), 0.012, 0.012, b)
        seg(g, (-0.07, -0.14, 1.3), (0, -0.17, 1.2), 0.012, 0.012, b)
        sph(g, (0, -0.178, 1.17), 0.045, a, sc=(1, 0.3, 1))
    elif kind == "glasses":
        gl = mt("accessory_lens", cb, 0.15, alpha=0.55)
        for sx in (-1, 1):
            ring(g, (0.095 * sx, -0.275, 1.70), 0.06, 0.01, a, rot=(math.pi / 2, 0, 0))
            sph(g, (0.095 * sx, -0.272, 1.70), 0.055, gl, sc=(1, 0.12, 1))
            seg(g, (0.15 * sx, -0.27, 1.71), (0.285 * sx, -0.06, 1.72), 0.008, 0.008, a, verts=6)
        box(g, (0, -0.28, 1.71), (0.04, 0.01, 0.01), a)
    elif kind == "wand":
        seg(g, (0.37, -0.05, 0.62), (0.5, -0.12, 1.05), 0.014, 0.012, a)
        star(g, (0.5, -0.12, 1.12), 0.085, b, rot=(math.pi / 2, 0, 0), depth=0.03)
    elif kind == "ladle":
        seg(g, (0.37, -0.05, 0.6), (0.44, -0.1, 1.02), 0.016, 0.012, b)
        sph(g, (0.45, -0.1, 1.07), 0.065, a, sc=(1, 1, 0.55), rot=(math.radians(15), 0, 0))
    elif kind == "badge":
        sph(g, (0.1, -0.19, 1.2), 0.05, a, sc=(1, 0.35, 1))
        star(g, (0.1, -0.205, 1.2), 0.04, b, depth=0.008)
        sph(g, (0, -0.05, 2.1), 0.0, a, seg=4, rings=3)
    return g


def make_topper(root, d):
    g = node("slot_topper", root)
    kind, ca, cb = d["topper"]
    a, b = mt("topper_a", ca, 0.5), mt("topper_b", cb, 0.5)
    if kind == "crown":
        ring(g, (0, 0.0, 1.97), 0.2, 0.025, a)
        for k in range(5):
            ang = k * math.tau / 5
            x, y = math.sin(ang) * 0.2, math.cos(ang) * 0.2
            seg(g, (x, y, 1.97), (x, y, 2.13), 0.04, 0.008, a, verts=8)
            sph(g, (x, y, 2.14), 0.025, b)
    elif kind == "cap":
        sph(g, (0, 0.03, 1.93), 0.325, a, sc=(1, 1.02, 0.62))
        sph(g, (0, -0.3, 1.9), 0.2, a, sc=(0.95, 1.1, 0.14))
        ring(g, (0, 0.03, 1.9), 0.31, 0.02, b, sc=(1, 1.02, 1))
        sph(g, (0, 0.03, 2.1), 0.03, b)
    elif kind == "jacket":
        shell(g, 0.9, 1.31, 0.232, 0.205, a, sy=0.82)
        sph(g, (0, 0, 1.31), 0.205, a, sc=(1, 0.82, 0.5))
        for sx in (-1, 1):
            a1, b1 = arm_pts(sx)
            seg(g, a1, b1, 0.082, 0.074, a, cap=True)
            ring(g, (b1[0], b1[1], b1[2] + 0.05), 0.075, 0.013, b)
            box(g, (0.07 * sx, -0.2, 1.22), (0.08, 0.02, 0.14), b, rot=(0, 0, 0.5 * sx))
        box(g, (0, -0.2, 1.1), (0.012, 0.015, 0.4), b)
    elif kind == "flowers":
        for k in range(7):
            ang = math.radians(-105 + k * 35)
            x, y, z = math.sin(ang) * 0.25, -math.cos(ang) * 0.2 + 0.03, 1.93 - abs(math.sin(ang)) * 0.0
            if k == 3:
                z += 0.06
            for p in range(5):
                pa = p * math.tau / 5
                sph(g, (x + math.cos(pa) * 0.035, y, z + math.sin(pa) * 0.035), 0.032, a if k % 2 == 0 else mt("topper_w", "#ffffff", 0.5), seg=10, rings=8)
            sph(g, (x, y - 0.012, z), 0.028, b, seg=10, rings=8)
    elif kind == "chefhat":
        seg(g, (0, 0.02, 1.95), (0, 0.02, 2.05), 0.2, 0.2, a)
        for k in range(6):
            ang = k * math.tau / 6
            sph(g, (math.sin(ang) * 0.12, 0.02 + math.cos(ang) * 0.12, 2.16), 0.115, a)
        sph(g, (0, 0.02, 2.27), 0.13, a)
        ring(g, (0, 0.02, 2.03), 0.2, 0.012, b)
    elif kind == "helmet":
        glass = mt("topper_glass", "#e8f2ff", 0.05, alpha=0.22)
        sph(g, (0, 0, HEAD_Z + 0.01), 0.42, glass, seg=36, rings=24)
        ring(g, (0, 0, 1.36), 0.27, 0.045, b, sc=(1, 0.95, 1))
        for sx in (-1, 1):
            sph(g, (0.27 * sx, -0.02, 1.37), 0.03, mt("topper_w", "#ffffff", 0.4))
    return g


def build(name, d):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _M.clear()
    root = node("doll")
    body(root, d)
    faces(root, d)
    make_hair(root, d)
    make_outfit(root, d)
    make_shoes(root, d)
    make_makeup(root, d)
    make_accessory(root, d)
    make_topper(root, d)
    os.makedirs(OUTDIR, exist_ok=True)
    path = os.path.join(OUTDIR, f"panenka-{name}.glb")
    kw = dict(filepath=path, export_format="GLB", use_selection=False, export_apply=True, export_yup=True, export_materials="EXPORT")
    try:
        bpy.ops.export_scene.gltf(**kw, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    except Exception as e:  # bez Dracа vyexportuje obyčejnou GLB
        print("draco selhalo:", e)
        bpy.ops.export_scene.gltf(**kw)
    print("OK", path, os.path.getsize(path))


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["all"]
    for key in (DOLLS if argv[0] == "all" else [argv[0]]):
        build(key, DOLLS[key])
