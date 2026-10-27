"""Render hráčského pokoje: 12 kusů nábytku (průhledné sprity) a pozadí pokoje.

    python umime-art/scripts/room.py <výstupní složka> [skupina]      (skupiny: furniture, background)
    ONLY=sofa,piano python umime-art/scripts/room.py <složka> furniture

Výstup: furniture/<id>.png (256 × 256, průhledné, s měkkým stínem) a background.png (1600 × 1000).
Na weby je převede `room_publish.py` do `public/room/`. Id nábytku odpovídají `src/lib/room.ts`.
Pomocné funkce jsou ze `farm.py`.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import farm as FM  # noqa: E402
from farm import M, TAU, box, camera, catcher, cone, cyl, lights, render, reset, sph  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "room_out"
GROUP = ARGS[1] if len(ARGS) > 1 else None
ONLY = set(filter(None, os.environ.get("ONLY", "").split(",")))
INK = "#16132b"


def want(name):
    return not ONLY or name in ONLY


def glass(tint=(0.85, 0.95, 1.0, 1.0), rough=0.03):
    m = bpy.data.materials.new("glass")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = tint
    b.inputs["Roughness"].default_value = rough
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["IOR"].default_value = 1.15
    return m


# ------------------------------------------------------------------------------------------
# Nábytek (počátek uprostřed podlahy, přední strana míří k -y)
# ------------------------------------------------------------------------------------------


def f_plant():
    cyl((0, 0, 0.3), 0.42, 0.6, M("#d9744a", 0.7), r2=0.3)
    cyl((0, 0, 0.62), 0.44, 0.08, M("#c4623a", 0.7))
    cyl((0, 0, 0.58), 0.36, 0.05, M("#4a2f1e", 0.95))
    for i in range(9):
        a = TAU * i / 9
        r = 0.18
        sph((math.cos(a) * (r + 0.28), math.sin(a) * (r + 0.28), 1.05 + 0.12 * (i % 3)), 0.3, M("#3f9c3a" if i % 2 else "#58b947", 0.5),
            (0.35, 0.9, 0.12), rot=(0, 25, math.degrees(a) + 90))
    for i in range(5):
        a = TAU * i / 5 + 0.3
        sph((math.cos(a) * 0.12, math.sin(a) * 0.12, 1.3 + 0.07 * i), 0.26, M("#6fcf5a", 0.5), (0.3, 0.8, 0.12), rot=(0, 10, math.degrees(a) + 90))
    cyl((0, 0, 0.9), 0.025, 0.7, M("#3f8f2f", 0.6))


def f_sofa():
    C = M("#2fa89a", 0.8)
    D = M("#23877b", 0.8)
    box((0, 0, 0.32), (2.0, 0.9, 0.34), D, bevel=0.1)
    for sx in (-0.5, 0.5):
        box((sx * 0.9, -0.05, 0.62), (0.9, 0.78, 0.26), C, bevel=0.1)
    box((0, 0.35, 0.95), (2.0, 0.28, 0.62), D, bevel=0.1)
    for sx in (-0.5, 0.5):
        box((sx * 0.9, 0.2, 0.98), (0.88, 0.3, 0.5), C, rot=(-8, 0, 0), bevel=0.1)
    for sx in (-1, 1):
        box((sx * 0.95, 0, 0.62), (0.22, 0.9, 0.62), D, bevel=0.09)
    for sx in (-0.85, 0.85):
        for sy in (-0.3, 0.3):
            cyl((sx, sy, 0.08), 0.05, 0.16, M("#5a3a1a", 0.6))
    sph((0.6, -0.1, 0.9), 0.2, M("#ffcf4a", 0.8), (1, 0.4, 1), rot=(0, 15, 10))


def f_desk():
    W = M("#c68a54", 0.55)
    box((0, 0, 0.75), (1.7, 0.8, 0.07), W, bevel=0.03)
    for sx in (-0.78, 0.78):
        box((sx, 0, 0.37), (0.07, 0.72, 0.74), W, bevel=0.02)
    box((0.5, 0, 0.5), (0.58, 0.7, 0.5), M("#b0773f", 0.55), bevel=0.03)
    for z in (0.38, 0.55):
        box((0.5, -0.36, z), (0.46, 0.03, 0.12), M("#e8c89a", 0.5), bevel=0.01)
    box((-0.2, 0.15, 1.2), (0.95, 0.07, 0.6), M("#2c2a33", 0.4), bevel=0.03)
    box((-0.2, 0.11, 1.2), (0.85, 0.02, 0.5), M("#3b82f6", 0.2, emit=2.2), bevel=0.0)
    box((-0.2, 0.15, 0.93), (0.25, 0.16, 0.05), M("#2c2a33", 0.4), bevel=0.01)
    cyl((-0.2, 0.15, 0.85), 0.04, 0.2, M("#2c2a33", 0.4))
    box((-0.2, -0.2, 0.8), (0.7, 0.22, 0.03), M("#dfe4ea", 0.4), bevel=0.01)
    sph((0.2, -0.2, 0.81), 0.06, M("#dfe4ea", 0.4), (1, 1.4, 0.6))
    cyl((0.1, 0.3, 0.95), 0.07, 0.25, M("#e5484d", 0.5))


def f_bookshelf():
    W = M("#a9703c", 0.6)
    for a in ((0, 0, 0.9, 1.1, 0.04, 1.8), ):
        pass
    box((-0.55, 0, 0.9), (0.06, 0.38, 1.8), W, bevel=0.015)
    box((0.55, 0, 0.9), (0.06, 0.38, 1.8), W, bevel=0.015)
    box((0, 0, 1.8), (1.16, 0.38, 0.06), W, bevel=0.015)
    box((0, 0, 0.03), (1.16, 0.38, 0.06), W, bevel=0.015)
    box((0, 0.17, 0.9), (1.1, 0.03, 1.7), M("#7a4a22", 0.7), bevel=0.0)
    cols = ["#e5484d", "#3b82f6", "#ffc933", "#2fa89a", "#8e44ad", "#f08a1c", "#4caf3a", "#ec6fa8"]
    for row, z in enumerate((0.06, 0.62, 1.2)):
        box((0, 0, z + 0.55), (1.1, 0.36, 0.04), W, bevel=0.01) if row < 2 else None
        x = -0.5
        i = row * 3
        while x < 0.46:
            w = 0.07 + (i * 5 % 4) * 0.012
            h = 0.38 + (i * 7 % 5) * 0.035
            box((x + w / 2, -0.02, z + h / 2 + 0.02), (w, 0.26, h), M(cols[i % len(cols)], 0.55), bevel=0.008)
            x += w + 0.008
            i += 1
        if row == 1:
            sph((0.3, -0.02, z + 0.12), 0.1, M("#ffc933", 0.4))


def f_globe():
    cyl((0, 0, 0.05), 0.36, 0.1, M("#7a4a22", 0.6))
    cyl((0, 0, 0.45), 0.04, 0.8, M("#c9a46a", 0.3, metal=0.8))
    sph((0, 0, 1.0), 0.45, M("#3b82f6", 0.3))
    for (dx, dy, dz, sx, sy) in ((0.22, -0.3, 0.12, 0.26, 0.18), (-0.25, -0.25, -0.1, 0.2, 0.28), (0.05, -0.4, -0.25, 0.14, 0.1), (-0.05, 0.42, 0.2, 0.22, 0.14)):
        sph((dx, dy, 1.0 + dz), 0.9 * 0.5, M("#4caf3a", 0.6), (sx, 0.1, sy))
    FM.bpy.ops.mesh.primitive_torus_add(major_radius=0.52, minor_radius=0.025, major_segments=64, minor_segments=12, location=(0, 0, 1.0))
    t = bpy.context.active_object
    t.rotation_euler = (math.radians(70), math.radians(-23), 0)
    t.data.materials.append(M("#c9a46a", 0.3, metal=0.8))


def f_guitar():
    W = M("#d9923a", 0.35)
    D = M("#6b3a1a", 0.5)
    sph((0, 0, 0.45), 0.34, W, (1, 0.28, 1.12))
    sph((0, 0, 0.88), 0.25, W, (1, 0.28, 1.0))
    cyl((0, -0.1, 0.5), 0.1, 0.02, M("#1c1624", 0.5), rot=(90, 0, 0))
    box((0, -0.095, 0.3), (0.2, 0.03, 0.05), D, bevel=0.01)
    box((0, 0, 1.45), (0.1, 0.06, 1.0), D, bevel=0.01)
    box((0, 0, 1.97), (0.17, 0.05, 0.22), M("#3a2410", 0.5), bevel=0.02)
    for sx in (-0.03, 0, 0.03):
        cyl((sx, -0.04, 1.35), 0.004, 1.3, M("#e8e8e8", 0.2, metal=0.9))
    for z in (1.9, 1.98, 2.06):
        sph((-0.1, -0.03, z), 0.018, M("#e8e8e8", 0.2, metal=0.9))
        sph((0.1, -0.03, z), 0.018, M("#e8e8e8", 0.2, metal=0.9))
    for sx in (-1, 1):
        cyl((sx * 0.22, 0.25, 0.1), 0.02, 0.9, M("#2c2a33", 0.4), rot=(25, sx * 12, 0))
    cyl((0, -0.3, 0.1), 0.02, 0.9, M("#2c2a33", 0.4), rot=(-25, 0, 0))


def f_aquarium():
    box((0, 0, 0.35), (1.5, 0.7, 0.7), M("#8a5a38", 0.6), bevel=0.04)
    box((0, 0, 0.72), (1.55, 0.75, 0.04), M("#5a3a1a", 0.6), bevel=0.01)
    box((0, 0, 1.15), (1.4, 0.62, 0.8), glass((0.7, 0.9, 1.0, 1.0)), bevel=0.0)
    box((0, 0, 1.05), (1.36, 0.58, 0.58), M("#79c9e8", 0.1), bevel=0.0).hide_render = False
    box((0, 0, 0.8), (1.36, 0.58, 0.1), M("#e8d29a", 0.9), bevel=0.0)
    for (x, h, c) in ((-0.4, 0.4, "#2fa84a"), (-0.3, 0.3, "#3fc85a"), (0.45, 0.45, "#2fa84a"), (0.35, 0.28, "#3fc85a")):
        cone((x, 0.12, 0.85 + h / 2), 0.07, h, M(c, 0.5))
    for (x, y, z, c) in ((0.0, -0.05, 1.15, "#ff8a2a"), (-0.3, 0.05, 1.3, "#ffd23a"), (0.3, -0.1, 1.0, "#ff5a8a")):
        sph((x, y, z), 0.09, M(c, 0.35), (1.6, 0.6, 1.0))
        cone((x + 0.15, y, z), 0.06, 0.12, M(c, 0.35), rot=(0, 90, 0))
    for (x, z) in ((-0.1, 1.45), (-0.05, 1.3), (0.5, 1.4)):
        sph((x, -0.05, z), 0.03, M("#e8f6ff", 0.1))
    box((0, 0, 1.6), (1.45, 0.66, 0.05), M("#2c2a33", 0.4), bevel=0.02)
    box((0, -0.2, 1.58), (1.2, 0.05, 0.03), M("#fff6c0", 0.4, emit=6.0), bevel=0.0)


def f_telescope():
    for a in (0, 120, 240):
        r = math.radians(a)
        cyl((math.cos(r) * 0.28, math.sin(r) * 0.28, 0.55), 0.025, 1.15, M("#6b5a43", 0.5), rot=(-math.degrees(math.sin(r)) * 0.4 * 2, math.degrees(math.cos(r)) * 0.4 * 2, 0))
    cyl((0, 0, 1.1), 0.1, 0.12, M("#2c2a33", 0.4))
    tube = cyl((0.0, -0.1, 1.45), 0.14, 1.05, M("#f4f6fa", 0.3), rot=(50, 0, 0))
    cyl((0.0, -0.45, 1.8), 0.17, 0.12, M("#c9a46a", 0.3, metal=0.8), rot=(50, 0, 0))
    cyl((0.0, 0.17, 1.07), 0.06, 0.3, M("#2c2a33", 0.4), rot=(50, 0, 0))
    sph((0.0, 0.3, 0.97), 0.055, M("#2c2a33", 0.3))
    cyl((0.0, -0.33, 1.2), 0.06, 0.34, M("#3b82f6", 0.3), rot=(50, 0, 0))


def f_trophy():
    W = M("#7a4a22", 0.55)
    box((0, 0, 0.05), (1.1, 0.45, 0.1), W, bevel=0.015)
    for sx in (-0.52, 0.52):
        box((sx, 0, 0.9), (0.06, 0.45, 1.7), W, bevel=0.015)
    box((0, 0, 1.76), (1.1, 0.45, 0.08), W, bevel=0.015)
    box((0, 0.2, 0.9), (1.0, 0.04, 1.6), M("#5a3a1a", 0.7), bevel=0.0)
    for z in (0.62, 1.2):
        box((0, 0, z), (1.0, 0.4, 0.04), M("#d9c4a0", 0.5), bevel=0.01)
    def cup(x, z, s, col):
        cyl((x, 0, z + 0.03 * s), 0.1 * s, 0.06 * s, M("#5a3a1a", 0.5))
        cyl((x, 0, z + 0.15 * s), 0.025 * s, 0.2 * s, M(col, 0.25, metal=0.9))
        cyl((x, 0, z + 0.33 * s), 0.12 * s, 0.2 * s, M(col, 0.25, metal=0.9), r2=0.07 * s)
        for sx in (-1, 1):
            FM.bpy.ops.mesh.primitive_torus_add(major_radius=0.06 * s, minor_radius=0.012 * s, location=(x + sx * 0.13 * s, 0, z + 0.34 * s))
            t = bpy.context.active_object
            t.rotation_euler = (math.radians(90), 0, 0)
            t.data.materials.append(M(col, 0.25, metal=0.9))
    cup(-0.25, 0.66, 1.0, "#ffc933")
    cup(0.25, 0.66, 0.8, "#c0c8d4")
    cup(0.0, 1.24, 1.15, "#ffc933")
    cup(-0.3, 0.1, 0.9, "#d9824a")
    cup(0.28, 0.1, 1.0, "#ffc933")
    box((0, -0.215, 0.9), (1.0, 0.02, 1.6), glass((0.9, 0.96, 1.0, 1.0)), bevel=0.0)


def f_arcade():
    B = M("#4b3fbf", 0.45)
    box((0, 0.1, 0.9), (0.85, 0.65, 1.8), B, bevel=0.05)
    box((0, -0.3, 0.5), (0.85, 0.2, 0.2), M("#2c2a33", 0.4), bevel=0.02)
    box((0, -0.34, 1.05), (0.72, 0.05, 0.6), M("#1c1624", 0.3), rot=(-12, 0, 0), bevel=0.0)
    box((0, -0.37, 1.05), (0.64, 0.02, 0.5), M("#0e1a3a", 0.2, emit=1.0), rot=(-12, 0, 0), bevel=0.0)
    cols = ["#7ee0b0", "#ff5a8a", "#ffd23a", "#5be7ff"]
    for i in range(5):
        for j in range(2):
            box((-0.2 + i * 0.1, -0.385 - 0.0, 1.17 - j * 0.1), (0.07, 0.015, 0.06), M(cols[(i + j) % 4], 0.3, emit=4.0), rot=(-12, 0, 0), bevel=0.0)
    box((0, -0.4, 0.88), (0.18, 0.02, 0.08), M("#ff5a3c", 0.3, emit=4.0), bevel=0.0)
    box((0, -0.38, 0.62), (0.8, 0.22, 0.05), M("#16132b", 0.4), rot=(-15, 0, 0), bevel=0.01)
    cyl((-0.2, -0.38, 0.72), 0.015, 0.15, M("#cfd8e3", 0.3, metal=0.8))
    sph((-0.2, -0.38, 0.8), 0.045, M("#e5484d", 0.3))
    for x, c in ((0.05, "#ffd23a"), (0.17, "#3b82f6"), (0.29, "#ff5a8a")):
        cyl((x, -0.39, 0.64), 0.04, 0.03, M(c, 0.3), rot=(75, 0, 0))
    box((0, -0.22, 1.7), (0.85, 0.12, 0.2), M("#ffd23a", 0.3, emit=3.0), bevel=0.02)
    box((0.43, 0.1, 0.9), (0.03, 0.66, 1.7), M("#ff5a8a", 0.4), bevel=0.0)


def f_piano():
    D = M("#2a2433", 0.35)
    box((0, 0.1, 0.65), (1.7, 0.55, 1.3), D, bevel=0.04)
    box((0, -0.18, 0.7), (1.76, 0.4, 0.1), D, bevel=0.03)
    box((0, -0.24, 0.76), (1.5, 0.28, 0.04), M("#f4f1e8", 0.3), bevel=0.0)
    for i in range(14):
        box((-0.69 + i * 0.106, -0.32, 0.775), (0.004, 0.14, 0.03), M("#8a8478", 0.5), bevel=0.0)
    for i in range(14):
        if (i % 7) in (2, 6):
            continue
        box((-0.69 + i * 0.106 + 0.053, -0.31, 0.8), (0.06, 0.16, 0.05), M("#16132b", 0.3), bevel=0.0)
    box((0, -0.05, 1.08), (1.4, 0.04, 0.34), M("#3c3447", 0.4), bevel=0.0)
    box((0, 0.1, 1.33), (1.74, 0.6, 0.06), D, bevel=0.03)
    for sx in (-0.78, 0.78):
        cyl((sx, -0.1, 0.2), 0.05, 0.4, D)
    cyl((0.0, -0.35, 0.05), 0.4, 0.04, M("#c9a46a", 0.3, metal=0.8)).scale = (0.2, 0.05, 1) if False else (1, 1, 1)
    box((0, -0.75, 0.33), (0.7, 0.3, 0.07), M("#e5484d", 0.6), bevel=0.04)
    for sx in (-0.28, 0.28):
        for sy in (-0.65, -0.85):
            cyl((sx, sy, 0.15), 0.03, 0.3, D)


def f_rocketbed():
    W = M("#f4f6fa", 0.3)
    R = M("#e5484d", 0.4)
    sph((0, 0.0, 0.62), 0.55, W, (1.0, 1.9, 0.9))
    cone((0, -1.18, 0.62), 0.5, 0.75, R, rot=(90, 0, 0))
    for sx in (-1, 1):
        box((sx * 0.55, 0.85, 0.35), (0.06, 0.55, 0.7), R, rot=(0, 0, sx * 12), bevel=0.03)
    box((0, 1.1, 0.3), (0.06, 0.5, 0.7), R, bevel=0.03)
    box((0, 0.0, 0.96), (0.78, 1.5, 0.12), M("#4da3ff", 0.7), bevel=0.05)
    sph((0, 0.62, 1.1), 0.22, M("#fff3c0", 0.7), (1.2, 0.6, 0.55))
    for y in (-0.45, 0.1):
        FM.bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.022, location=(0.0, y, 0.0))
    for sx in (-1, 1):
        for y in (-0.35, 0.05, 0.45):
            FM.bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.022, location=(sx * 0.5, y, 0.58))
            t = bpy.context.active_object
            t.rotation_euler = (0, math.radians(90), 0)
            t.data.materials.append(M("#8a93a6", 0.3, metal=0.8))
            sph((sx * 0.51, y, 0.58), 0.085, M("#7bd0ff", 0.1, emit=1.5), (0.3, 1, 1))
    for sx in (-0.4, 0.4):
        cyl((sx, 0.6, 0.12), 0.05, 0.24, M("#8a93a6", 0.3, metal=0.8))


FURNITURE = dict(plant=(f_plant, 2.6), sofa=(f_sofa, 3.2), desk=(f_desk, 3.0), bookshelf=(f_bookshelf, 3.2), globe=(f_globe, 2.6),
                 guitar=(f_guitar, 3.15), aquarium=(f_aquarium, 3.0), telescope=(f_telescope, 2.95), trophy=(f_trophy, 3.0),
                 arcade=(f_arcade, 3.2), piano=(f_piano, 3.3), rocketbed=(f_rocketbed, 3.9))


# Natočení kolem svislé osy ve stupních, aby byl dobře vidět tvar.
YAW = dict(rocketbed=-62)


def do_furniture():
    for name, (fn, scale) in FURNITURE.items():
        if not want(name):
            continue
        sc = reset()
        lights(sc, 3.4)
        camera(sc, (3.3, -6.2, 3.6), (0, 0, scale * 0.17), scale)
        catcher(9)
        fn()
        yaw = YAW.get(name)
        if yaw:  # natočení kolem svislé osy (nábytek se skládá čelem k -y)
            pivot = bpy.data.objects.new("pivot", None)
            sc.collection.objects.link(pivot)
            for o in list(bpy.data.objects):
                if o.type == "MESH" and not o.is_shadow_catcher:
                    o.parent = pivot
            pivot.rotation_euler = (0, 0, math.radians(yaw))
        render(f"{OUT}/furniture/{name}.png")


# ------------------------------------------------------------------------------------------
# Pozadí pokoje
# ------------------------------------------------------------------------------------------


def plank_mat():
    m = bpy.data.materials.new("planks")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.45
    tex = nt.nodes.new("ShaderNodeTexBrick")
    tex.inputs["Color1"].default_value = FM.rgb("#b97f4a")
    tex.inputs["Color2"].default_value = FM.rgb("#a96f3f")
    tex.inputs["Mortar"].default_value = FM.rgb("#6f4426")
    tex.inputs["Scale"].default_value = 5.0
    tex.inputs["Mortar Size"].default_value = 0.006
    tex.inputs["Brick Width"].default_value = 1.6
    tex.inputs["Row Height"].default_value = 0.16
    tex.offset = 0.5
    nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    return m


def do_background():
    sc = reset((1600, 1000), 64, False)
    w = sc.world
    w.node_tree.nodes["Background"].inputs[0].default_value = (1.0, 0.95, 0.9, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.3
    box((0, -1.5, 6.1), (16, 9.0, 0.2), M("#f6e9dc", 0.9), bevel=0)
    # podlaha, stěny
    FM.bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    fl = bpy.context.active_object
    fl.scale = (16, 12, 1)
    fl.data.materials.append(plank_mat())
    wall = M("#f3d9c4", 0.9)
    box((0, 3.0, 3.0), (16, 0.3, 6.0), wall, bevel=0)
    box((-8.0, -1.5, 3.0), (0.3, 9.0, 6.0), M("#efcfb8", 0.9), bevel=0)
    box((8.0, -1.5, 3.0), (0.3, 9.0, 6.0), M("#efcfb8", 0.9), bevel=0)
    box((0, 2.82, 0.15), (16, 0.08, 0.3), M("#ffffff", 0.5), bevel=0.01)
    # pruh tapety
    for x in range(-7, 8, 2):
        box((x, 2.84, 3.4), (0.7, 0.02, 4.4), M("#eec3a3", 0.9), bevel=0)
    # okno
    box((2.6, 2.8, 3.4), (3.0, 0.1, 2.6), M("#ffffff", 0.4), bevel=0.04)
    box((2.6, 2.78, 3.4), (2.7, 0.06, 2.3), M("#8ccfff", 0.2, emit=1.4), bevel=0)
    box((2.6, 2.74, 3.4), (0.07, 0.06, 2.4), M("#ffffff", 0.4), bevel=0)
    box((2.6, 2.74, 3.4), (2.8, 0.06, 0.07), M("#ffffff", 0.4), bevel=0)
    box((2.6, 2.55, 2.15), (3.3, 0.35, 0.1), M("#ffffff", 0.4), bevel=0.02)
    for sx in (-1, 1):
        box((2.6 + sx * 1.8, 2.6, 3.4), (0.7, 0.2, 3.0), M("#f08aa8", 0.8), bevel=0.1)
    # obrazy a polička
    box((-3.6, 2.8, 3.8), (1.6, 0.08, 1.2), M("#ffffff", 0.4), bevel=0.02)
    box((-3.6, 2.76, 3.8), (1.4, 0.04, 1.0), M("#7ec8e3", 0.5), bevel=0)
    sph((-3.9, 2.74, 3.7), 0.22, M("#ffd23a", 0.4, emit=0.6), (1, 0.1, 1))
    box((-5.3, 2.8, 3.5), (1.0, 0.08, 1.4), M("#ffffff", 0.4), bevel=0.02)
    box((-5.3, 2.76, 3.5), (0.84, 0.04, 1.24), M("#ff9d6e", 0.5), bevel=0)
    box((-1.2, 2.7, 2.7), (1.6, 0.35, 0.07), M("#a9703c", 0.5), bevel=0.01)
    for i, c in enumerate(("#3b82f6", "#e5484d", "#ffc933")):
        box((-1.8 + i * 0.12, 2.68, 2.95), (0.09, 0.2, 0.4), M(c, 0.5), bevel=0.01)
    # koberec
    cyl((0, -0.5, 0.012), 3.1, 0.03, M("#e0705a", 0.9)).scale = (1.0, 0.62, 1.0)
    cyl((0, -0.5, 0.02), 2.6, 0.03, M("#f6cfa0", 0.9)).scale = (1.0, 0.62, 1.0)
    cyl((0, -0.5, 0.028), 1.9, 0.03, M("#e0705a", 0.9)).scale = (1.0, 0.62, 1.0)
    # světla
    d = bpy.data.lights.new("s", "SUN")
    d.energy = 1.6
    d.angle = math.radians(6)
    o = bpy.data.objects.new("s", d)
    sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(58), math.radians(8), math.radians(-18))
    a = bpy.data.lights.new("a", "AREA")
    a.energy = 260
    a.size = 8
    ao = bpy.data.objects.new("a", a)
    sc.collection.objects.link(ao)
    ao.location = (0, -2, 5.8)
    ao.rotation_euler = (0, 0, 0)
    camera(sc, (0, -9.6, 3.6), (0, 0, 1.9), 1, ortho=False)
    sc.camera.data.lens = 24
    render(f"{OUT}/background.png")


if __name__ == "__main__":
    for g, fn in (("furniture", do_furniture), ("background", do_background)):
        if GROUP and GROUP != g:
            continue
        fn()
