"""Detailní lesní rekvizity pro cut scénu Kouzelného lesa → public/mestecko3d/les-<jméno>.glb

    python umime-art/blender/mestecko3d_les.py -- all [--preview]
    python umime-art/blender/mestecko3d_les.py -- houba-ruzova kapradi --preview

Každá rekvizita stojí na zemi v počátku (střed podstavy), 1 jednotka = 1 metr ve hře.
Web ji načte přes placeModel(...) a klonuje podél cesty (src/lib/town3d/films.ts).
Svítící části mají materiál „glow_…“, aby je hra v noci zesílila.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from mestecko3d_lib import *  # noqa: E402,F401,F403

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

random.seed(7)
TAU = math.tau
STEM = "#f4ead8"
MOSS = "#4f8a3a"
BARK = "#5a3a22"
STONE = "#8e8a84"
LEAF_A = "#3f8a3e"
LEAF_B = "#2f7a3a"


def export_prop(name, objs, preview=False):
    """Spojí části do jednoho objektu se středem na zemi a uloží GLB (bez Draco, Blender ho jako modul neumí)."""
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    path = os.path.join(OUT, f"les-{name}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_lights=False,
        export_cameras=False,
    )
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    print(f"EXPORT les-{name}: {os.path.getsize(path) // 1024} kB, {tris} trojúhelníků", flush=True)
    if preview:
        render_preview(f"les-{name}", o)


# ------------------------------------------------------------------------------------------ stavební kameny
def mushroom(x, y, s, cap, rot=0.0):
    """Houba: zúžená nožka, klobouk s tečkami; klobouk svítí (noční les)."""
    parts = []
    parts.append(cyl((x, y, 0.22 * s), 0.07 * s, 0.44 * s, mat(STEM, 0.7), verts=10, r2=0.045 * s))
    cap_m = glow(cap, 0.9)
    d = dome((x, y, 0.42 * s), 0.27 * s, cap_m, seg=18)
    d.scale = (1.0, 1.0, 0.62)
    parts.append(d)
    for k in range(6):
        a = rot + k * TAU / 6 + 0.3
        r = 0.16 * s
        parts.append(sphere((x + math.cos(a) * r, y + math.sin(a) * r, 0.5 * s), 0.035 * s, mat("#fff6ec", 0.6), seg=8))
    return parts


def fern_frond(base, ang, L, bend, m_a, m_b, n=9):
    """Listnatá kapradina: páteř se prohýbá, po stranách trojúhelníkové lístky."""
    dx, dy = math.cos(ang), math.sin(ang)
    sx, sy = -dy, dx  # kolmo k páteři (vodorovně)
    verts, faces = [], []
    spine = []
    for k in range(n + 1):
        t = k / n
        p = (base[0] + dx * L * t, base[1] + dy * L * t, 0.06 + 0.5 * L * math.sin(t * 1.3) * bend * (0.6 + 0.4 * t))
        spine.append(p)
    for k in range(1, n):
        P = spine[k]
        t = k / n
        ll = L * 0.34 * (1.0 - 0.5 * t)
        for side in (-1, 1):
            ex, ey = sx * side, sy * side
            tip = (P[0] + ex * ll + dx * ll * 0.35, P[1] + ey * ll + dy * ll * 0.35, P[2] + 0.5 * ll)
            fwd = (P[0] + dx * 0.035, P[1] + dy * 0.035, P[2] + 0.02)
            i0 = len(verts)
            verts += [P, tip, fwd]
            faces.append((i0, i0 + 1, i0 + 2))
    return verts, faces


def fern_clump(x, y, n=9):
    allv, allf = [], []
    for i in range(n):
        ang = i * TAU / n + random.uniform(-0.2, 0.2)
        L = random.uniform(0.42, 0.62)
        v, f = fern_frond((x, y), ang, L, random.uniform(0.8, 1.2), None, None, n=8)
        off = len(allv)
        allv += v
        allf += [(a + off, b + off, c + off) for a, b, c in f]
    obj = mesh(allv, allf, mat(LEAF_A, 0.8), name="kapradi")
    return [obj]


def flower(x, y, s, petal):
    parts = [cyl((x, y, 0.2 * s), 0.012 * s, 0.4 * s, mat(LEAF_B, 0.8), verts=5)]
    hx, hy, hz = x, y, 0.4 * s
    for k in range(5):
        a = k * TAU / 5 + 0.2
        px, py = hx + math.cos(a) * 0.05 * s, hy + math.sin(a) * 0.05 * s
        parts.append(sphere((px, py, hz), 0.045 * s, mat(petal, 0.5), seg=8, scale=(1.0, 1.0, 0.45)))
    parts.append(sphere((hx, hy, hz + 0.01), 0.028 * s, glow("#ffe27a", 2.0), seg=8))
    return parts


def boulder(x, y, s):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=s, location=(x, y, 0.5 * s))
    o = bpy.context.object
    bm = bmesh_from(o)
    for v in bm.verts:
        v.co *= 1.0 + random.uniform(-0.14, 0.14)
    bm.to_mesh(o.data)
    bm.free()
    o.scale = (1.15, 0.95, 0.7)
    o.data.materials.append(mat(STONE, 0.95))
    for p in o.data.polygons:
        p.use_smooth = False
    moss = dome((x + 0.02 * s, y, 0.5 * s + 0.2 * s), 0.6 * s, mat(MOSS, 0.9), seg=14)
    moss.scale = (1.0, 0.9, 0.42)
    return [o, moss]


def bmesh_from(o):
    import bmesh

    bm = bmesh.new()
    bm.from_mesh(o.data)
    return bm


def lantern_post(x, y, h=2.2):
    parts = [cyl((x, y, h / 2), 0.05, h, mat(BARK, 0.85), verts=8, bevel=0.01)]
    parts.append(box((x, y, h - 0.12), (0.2, 0.2, 0.2), glow("#ffd98a", 3.0), bevel=0.02))
    parts.append(cone((x, y, h + 0.02), 0.16, 0.14, mat("#2b2a40", 0.6), verts=4, rot=(0, 0, math.pi / 4)))
    parts.append(box((x, y, 0.45), (0.12, 0.12, 0.9), mat(BARK, 0.85), bevel=0.01))
    return parts


def fallen_log(x, y, L=2.6, r=0.22):
    parts = [cyl((x, y, r), r, L, mat(BARK, 0.9), verts=10, rot=(0, math.pi / 2, 0))]
    parts.append(dome((x, y, r * 1.85), r * 0.95, mat(MOSS, 0.9), seg=12))
    parts[-1].scale = (L * 0.36, 1.0, 0.5)
    parts += mushroom(x - 0.6, y - r - 0.08, 0.8, "#ff6fd8", rot=0.4)
    parts += mushroom(x + 0.5, y - r - 0.05, 0.6, "#b88cff", rot=1.2)
    return parts


# ------------------------------------------------------------------------------------------ rekvizity
def p_houba(cap):
    def build():
        parts = []
        parts += mushroom(0.0, 0.0, 1.0, cap, rot=0.0)
        parts += mushroom(0.34, 0.12, 0.62, cap, rot=1.0)
        parts += mushroom(-0.24, 0.18, 0.46, cap, rot=2.1)
        return parts

    return build


def p_kapradi():
    return fern_clump(0.0, 0.0, n=9)


def p_kvetiny():
    parts = []
    cols = ["#ff8fd0", "#ffd24d", "#9fd8ff", "#ffffff", "#d7a6ff"]
    for k in range(7):
        a = k * 2.4
        r = 0.12 + 0.1 * (k % 3)
        parts += flower(math.cos(a) * r, math.sin(a) * r, random.uniform(0.8, 1.2), cols[k % len(cols)])
    return parts


def p_balvan():
    return boulder(0.0, 0.0, 0.42)


def p_lampa():
    return lantern_post(0.0, 0.0)


def p_padly_kmen():
    return fallen_log(0.0, 0.0)


PROPS = {
    "houba-ruzova": p_houba("#ff6fd8"),
    "houba-modra": p_houba("#6ff0ff"),
    "houba-fialova": p_houba("#b88cff"),
    "kapradi": p_kapradi,
    "kvetiny": p_kvetiny,
    "balvan": p_balvan,
    "lampa": p_lampa,
    "padly-kmen": p_padly_kmen,
}


def run_all(names, preview):
    for name in names:
        reset()
        parts = PROPS[name]()
        objs = [o for o in parts if o is not None and o.type == "MESH"]
        export_prop(name, objs, preview=preview)


if __name__ == "__main__":
    names, preview = args()
    if not names or names == ["all"]:
        names = list(PROPS)
    unknown = [n for n in names if n not in PROPS]
    if unknown:
        raise SystemExit(f"neznámá rekvizita: {unknown}; k dispozici: {list(PROPS)}")
    run_all(names, preview)
