"""Detailní rekvizity pro cut scény hradu a podmořského města → public/mestecko3d/<jméno>.glb

    python umime-art/blender/mestecko3d_hrad_more.py -- all [--preview]
    python umime-art/blender/mestecko3d_hrad_more.py -- more-koral hrad-pochodne --preview

Hrad:  hrad-zidka (nízká zeď s cimbuřím), hrad-kvetouci-strom, hrad-pochodne (železný koš s plamenem),
       hrad-bedny (bedny a sud), hrad-skaly (balvany u příkopu).
Moře:  more-koral (větvený korál), more-muzle (obří mušle s perlou), more-medusa (svítící medúza),
       more-rasy (řasy), more-truhla (potopená truhla se zlatem).
Každá rekvizita stojí na zemi v počátku, 1 jednotka = 1 metr ve hře. Svítící části mají materiál „glow_…“.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from mestecko3d_lib import *  # noqa: E402,F401,F403
from mestecko3d_les import export_prop, boulder  # noqa: E402

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

random.seed(11)
TAU = math.tau
STONE = "#a8a094"
DARK_STONE = "#8a8478"
WOOD = "#8a5a34"
DARK_WOOD = "#6e4426"
IRON = "#3a3a44"
GOLD = "#ffd24d"


def seg(a, b, r, m, r2=None, verts=8):
    """Válec mezi dvěma body (větev korálu, stonek řasy…); osa jde od a k b."""
    va, vb = Vector(a), Vector(b)
    d = vb - va
    L = d.length
    mid = (va + vb) / 2
    rot = d.to_track_quat("Z", "Y").to_euler()
    return cyl((mid.x, mid.y, mid.z), r, L, m, verts=verts, rot=(rot.x, rot.y, rot.z), r2=r2)


# ------------------------------------------------------------------------------------------ hrad
def p_zidka():
    parts = [box((0, 0, 0.08), (2.5, 0.62, 0.16), mat(DARK_STONE, 0.95), bevel=0.02)]
    parts.append(box((0, 0, 0.55), (2.4, 0.5, 0.8), mat(STONE, 0.9), bevel=0.03))
    for x in (-1.0, -0.33, 0.33, 1.0):
        parts.append(box((x, 0, 1.05), (0.3, 0.5, 0.26), mat(STONE, 0.9), bevel=0.03))
    return parts


def p_kvetouci_strom():
    parts = [cyl((0, 0, 0.9), 0.13, 1.8, mat(DARK_WOOD, 0.9), verts=8, r2=0.08)]
    for (x, y, z, r, c) in [
        (0.0, 0.0, 2.3, 0.95, "#ffb3d1"),
        (0.45, 0.2, 2.0, 0.6, "#fff0f5"),
        (-0.4, -0.25, 2.05, 0.62, "#ffc2dc"),
        (0.1, -0.5, 2.7, 0.55, "#fff0f5"),
    ]:
        parts.append(sphere((x, y, z), r, mat(c, 0.8), seg=14))
    for k in range(10):
        a = k * TAU / 10
        parts.append(sphere((math.cos(a) * 0.9, math.sin(a) * 0.9, 0.05), 0.04, mat("#ffb3d1", 0.8), seg=6, scale=(1, 1, 0.4)))
    return parts


def p_pochodne():
    parts = [cyl((0, 0, 0.7), 0.05, 1.4, mat(IRON, 0.5, 0.6), verts=8)]
    parts.append(cyl((0, 0, 1.42), 0.2, 0.16, mat(IRON, 0.5, 0.6), verts=12, r2=0.13))
    parts.append(box((0, 0, 0.04), (0.36, 0.36, 0.08), mat(IRON, 0.5, 0.6), bevel=0.02))
    flame = sphere((0, 0, 1.75), 0.12, glow("#ffb347", 4.0), seg=10, scale=(1, 1, 1.5))
    core = sphere((0, 0, 1.66), 0.07, glow("#fff1c2", 6.0), seg=8)
    parts += [flame, core]
    return parts


def p_bedny():
    parts = []
    parts.append(box((0, 0, 0.4), (0.8, 0.8, 0.8), mat(WOOD, 0.85), bevel=0.02))
    parts.append(box((0.95, 0.1, 0.4), (0.8, 0.8, 0.8), mat(WOOD, 0.85), bevel=0.02, rot=(0, 0, 0.12)))
    parts.append(box((0.45, 0.05, 1.2), (0.8, 0.8, 0.8), mat(WOOD, 0.85), bevel=0.02, rot=(0, 0, -0.2)))
    barrel = cyl((-0.1, 1.2, 0.36), 0.36, 0.72, mat(DARK_WOOD, 0.85), verts=14, r2=0.3)
    parts.append(barrel)
    for z in (0.14, 0.58):
        parts.append(torus((-0.1, 1.2, z), 0.33, 0.025, mat(IRON, 0.5, 0.6), rot=(math.pi / 2, 0, 0)))
    return parts


def p_skaly():
    parts = boulder(0.0, 0.0, 0.55)
    parts += boulder(1.0, 0.45, 0.32)
    parts += boulder(-0.7, 0.7, 0.4)
    return parts


# ------------------------------------------------------------------------------------------ moře
def branch(origin, direction, length, depth, m, rnd):
    """Větvička korálu: válec, na konci se rozdělí nebo skončí polypem."""
    d = Vector(direction).normalized()
    end = Vector(origin) + d * length
    r0 = 0.035 + 0.05 * depth
    parts = [seg(origin, end, r0 * 0.7, m, r2=r0 * 0.4, verts=6)]
    if depth == 0:
        parts.append(sphere(end, 0.07, glow("#ffd0e8", 1.2), seg=8))
        return parts
    n = rnd.choice([2, 3])
    for _ in range(n):
        yaw = rnd.uniform(-0.9, 0.9)
        pitch = rnd.uniform(-0.6, 0.6)
        nd = Vector((d.x, d.y, d.z)).copy()
        nd.rotate(Euler_from(yaw, pitch))
        parts += branch(end, nd, length * rnd.uniform(0.6, 0.78), depth - 1, m, rnd)
    return parts


def Euler_from(yaw, pitch):
    from mathutils import Euler

    return Euler((pitch, 0.0, yaw), "XYZ")


def p_koral():
    rnd = random.Random(5)
    m = mat(rnd.choice(["#ff7a6a", "#ffa86b", "#c86bff"]), 0.6)
    return branch((0, 0, 0), (0, 0, 1), 0.9, 3, m, rnd)


def p_muzle():
    parts = []
    parts.append(dome((0, 0, 0), 0.62, mat("#c86bff", 0.55), seg=20))
    parts[-1].scale = (1.0, 0.8, 0.42)
    lid = dome((0, -0.42, 0.04), 0.6, mat("#b25ae6", 0.55), seg=20)
    lid.scale = (1.0, 0.8, 0.42)
    lid.rotation_euler = (math.radians(-38), 0, 0)
    parts.append(lid)
    parts.append(dome((0, 0, 0.02), 0.5, glow("#ff9fe0", 0.7), seg=16))
    parts[-1].scale = (1.0, 0.75, 0.2)
    parts.append(sphere((0, 0.05, 0.08), 0.11, glow("#ffe8ff", 2.5), seg=10))
    return parts


def p_medusa():
    parts = [dome((0, 0, 1.05), 0.45, glow("#9ef0ff", 0.9), seg=18)]
    parts[-1].scale = (1.0, 1.0, 0.7)
    rnd = random.Random(3)
    for k in range(9):
        a = k * TAU / 9
        r = 0.22 + rnd.uniform(-0.03, 0.03)
        top = (math.cos(a) * r, math.sin(a) * r, 0.95)
        bot = (math.cos(a) * r * 1.4 + rnd.uniform(-0.05, 0.05), math.sin(a) * r * 1.4, 0.05)
        parts.append(seg(top, bot, 0.012, glow("#9ef0ff", 0.9), r2=0.006, verts=4))
    return parts


def p_rasy():
    rnd = random.Random(9)
    parts = []
    m_a = mat("#2f8a4a", 0.7)
    m_b = mat("#3fa55a", 0.7)
    for k in range(5):
        ox = (k - 2) * 0.35 + rnd.uniform(-0.1, 0.1)
        oy = rnd.uniform(-0.25, 0.25)
        verts, faces = [], []
        N = 14
        h = rnd.uniform(3.0, 4.2)
        ph = rnd.uniform(0, 6)
        for i in range(N + 1):
            t = i / N
            cx = ox + 0.18 * math.sin(t * 2.4 + ph) * t
            z = t * h
            w = 0.1 * (1 - t * 0.85) + 0.012
            verts += [(cx - w, oy, z), (cx + w, oy, z)]
        for i in range(N):
            a, b, c, d = 2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2
            faces += [(a, b, c), (a, c, d)]
        me = mesh(verts, faces, m_a if k % 2 else m_b, name=f"rasa{k}")
        me.data.materials[0].use_backface_culling = False
        parts.append(me)
    return parts


def p_truhla():
    parts = [box((0, 0, 0.3), (0.9, 0.55, 0.5), mat(WOOD, 0.8), bevel=0.02)]
    parts.append(cyl((0, 0, 0.55), 0.275, 0.9, mat(WOOD, 0.8), verts=14, rot=(0, math.pi / 2, 0)))
    parts[-1].location = (0, 0, 0.55)
    for x in (-0.3, 0.3):
        parts.append(box((x, 0, 0.3), (0.06, 0.58, 0.52), mat(GOLD, 0.35, 0.9), bevel=0.005))
    parts.append(box((0, -0.29, 0.42), (0.14, 0.04, 0.16), mat(GOLD, 0.3, 0.9), bevel=0.005))
    rnd = random.Random(2)
    for _ in range(9):
        parts.append(sphere((rnd.uniform(-0.3, 0.3), rnd.uniform(-0.45, -0.2), 0.04), 0.05, mat(GOLD, 0.3, 0.9), seg=8, scale=(1, 1, 0.5)))
    return parts


PROPS = {
    "hrad-zidka": p_zidka,
    "hrad-kvetouci-strom": p_kvetouci_strom,
    "hrad-pochodne": p_pochodne,
    "hrad-bedny": p_bedny,
    "hrad-skaly": p_skaly,
    "more-koral": p_koral,
    "more-muzle": p_muzle,
    "more-medusa": p_medusa,
    "more-rasy": p_rasy,
    "more-truhla": p_truhla,
}


def run_all(names, preview):
    for name in names:
        reset()
        parts = PROPS[name]()
        objs = [o for o in parts if o is not None and o.type == "MESH"]
        export_prop(name, objs, preview=preview, file=name)


if __name__ == "__main__":
    names, preview = args()
    if not names or names == ["all"]:
        names = list(PROPS)
    unknown = [n for n in names if n not in PROPS]
    if unknown:
        raise SystemExit(f"neznámá rekvizita: {unknown}; k dispozici: {list(PROPS)}")
    run_all(names, preview)
