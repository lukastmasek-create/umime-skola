"""Izometrický pokoj (řez pokojem: podlaha se dvěma stěnami) pro RoomView.

    python umime-art/scripts/room_iso.py <výstupní složka>

Kamera míří stejným směrem jako kamera sprajtů nábytku (room.py: 3.3, -6.2, 3.6), takže existující
sprajty sedí do scény. Výstup: <složka>/room_iso.png a <složka>/layout.json (polohy slotů a kotvy
nábytku v poměrech obrázku; `room_iso_publish.py` je zapíše do public/room a src/lib).
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import farm as FM  # noqa: E402
from farm import M, TAU, box, cone, cyl, reset, sph, render  # noqa: E402
import room as R  # noqa: E402  (jen kvůli FURNITURE a plank_mat; nic se nespouští)

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "room_iso_out"

H = 4.0  # výška stěn
HALF = 4.6  # polovina podlahy
DIR = Vector((3.3, -6.2, 3.0)).normalized()
TARGET = Vector((0.0, 0.0, 1.3))
W_PX = 1800

# Sloty (4 sloupce × 3 řady), světové souřadnice středu na podlaze; indexy jako ROOM_SLOT_POS: řada po řadě.
SLOT_X = [-3.1, -1.05, 1.05, 3.1]
SLOT_Y = [2.5, 0.15, -2.2]  # zadní řada, střed, přední


def glass_win():
    return M("#8fd0ff", 0.1, emit=0.9)


def build():
    sc = reset((W_PX, 1300), 128, True)
    w = sc.world.node_tree.nodes["Background"]
    w.inputs[0].default_value = (1.0, 0.95, 0.9, 1)
    w.inputs[1].default_value = 0.55
    sc.cycles.max_bounces = 6
    # --- podlaha (deska s hranou) a koberec
    box((0, 0, -0.22), (2 * HALF + 0.3, 2 * HALF + 0.3, 0.44), M("#8a5a38", 0.6), bevel=0.06)
    FM.bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.001))
    fl = bpy.context.active_object
    fl.scale = (2 * HALF, 2 * HALF, 1)
    fl.data.materials.append(R.plank_mat())
    cyl((0.2, 0.1, 0.012), 3.4, 0.03, M("#e0705a", 0.9)).scale = (1.0, 0.72, 1.0)
    cyl((0.2, 0.1, 0.022), 2.9, 0.03, M("#f6cfa0", 0.9)).scale = (1.0, 0.72, 1.0)
    cyl((0.2, 0.1, 0.03), 2.2, 0.03, M("#e0705a", 0.9)).scale = (1.0, 0.72, 1.0)
    # --- stěny (zadní y+ a levá x-), horní hrany s čepičkou
    wall_b, wall_l = M("#f3d9c4", 0.9), M("#e9c9b0", 0.9)
    box((0, HALF + 0.05, H / 2), (2 * HALF + 0.3, 0.3, H), wall_b, bevel=0.03)
    box((-HALF - 0.05, 0, H / 2), (0.3, 2 * HALF + 0.3, H), wall_l, bevel=0.03)
    cap = M("#fff6ea", 0.6)
    box((0, HALF + 0.05, H + 0.04), (2 * HALF + 0.34, 0.34, 0.1), cap, bevel=0.03)
    box((-HALF - 0.05, 0, H + 0.04), (0.34, 2 * HALF + 0.34, 0.1), cap, bevel=0.03)
    # tapeta: svislé pruhy na obou stěnách + lišta u země
    stripe = M("#eec3a3", 0.9)
    for x in range(-4, 5, 2):
        box((x, HALF - 0.11, 2.2), (0.6, 0.02, 3.2), stripe, bevel=0)
    for y in range(-4, 5, 2):
        box((-HALF + 0.11, y, 2.2), (0.02, 0.6, 3.2), M("#e2b090", 0.9), bevel=0)
    skirt = M("#ffffff", 0.5)
    box((0, HALF - 0.12, 0.17), (2 * HALF, 0.1, 0.34), skirt, bevel=0.01)
    box((-HALF + 0.12, 0, 0.17), (0.1, 2 * HALF, 0.34), skirt, bevel=0.01)
    # dřevěný lambris dole
    box((0, HALF - 0.1, 0.62), (2 * HALF, 0.06, 0.6), M("#d9a27c", 0.7), bevel=0.01)
    box((-HALF + 0.1, 0, 0.62), (0.06, 2 * HALF, 0.6), M("#cf977a", 0.7), bevel=0.01)
    # --- okno na zadní stěně s záclonami a parapetem
    wx, wz = 1.6, 2.35
    white = M("#ffffff", 0.4)
    box((wx, HALF - 0.1, wz), (2.8, 0.14, 2.4), white, bevel=0.04)
    box((wx, HALF - 0.16, wz), (2.5, 0.06, 2.1), glass_win(), bevel=0)
    box((wx, HALF - 0.24, wz), (0.1, 0.06, 2.3), white, bevel=0)
    box((wx, HALF - 0.24, wz), (2.7, 0.06, 0.1), white, bevel=0)
    box((wx, HALF - 0.32, wz - 1.25), (3.1, 0.32, 0.1), white, bevel=0.02)
    for sx in (-1, 1):
        box((wx + sx * 1.65, HALF - 0.34, wz + 0.1), (0.62, 0.2, 2.9), M("#f08aa8", 0.8), bevel=0.1)
    box((wx, HALF - 0.34, wz + 1.45), (3.9, 0.12, 0.1), M("#c9a46a", 0.3, metal=0.8), bevel=0.03)
    # květina na parapetu
    cyl((wx + 0.9, HALF - 0.35, wz - 1.02), 0.16, 0.26, M("#d9744a", 0.7), r2=0.12)
    for k in range(5):
        a = TAU * k / 5
        sph((wx + 0.9 + math.cos(a) * 0.1, HALF - 0.35 + math.sin(a) * 0.05, wz - 0.75 + 0.03 * k), 0.12, M("#4caf3a", 0.5), (0.5, 0.5, 1.1))
    # --- obrazy a polička na zadní stěně
    for x, c, wd, ht in ((-3.4, "#7ec8e3", 1.4, 1.1), (-1.8, "#ff9d6e", 0.9, 1.3)):
        box((x, HALF - 0.1, 2.9), (wd + 0.2, 0.08, ht + 0.2), white, bevel=0.02)
        box((x, HALF - 0.15, 2.9), (wd, 0.04, ht), M(c, 0.5), bevel=0)
    sph((-3.7, HALF - 0.18, 2.8), 0.2, M("#ffd23a", 0.4, emit=0.6), (1, 0.15, 1))
    box((-0.6, HALF - 0.28, 2.45), (1.6, 0.35, 0.07), M("#a9703c", 0.5), bevel=0.01)
    for i, c in enumerate(("#3b82f6", "#e5484d", "#ffc933")):
        box((-1.15 + i * 0.13, HALF - 0.28, 2.72), (0.1, 0.22, 0.4), M(c, 0.5), bevel=0.01)
    sph((-0.1, HALF - 0.28, 2.65), 0.13, M("#2fa89a", 0.5))
    # --- levá stěna: hodiny, vlajková girlanda, plakát s raketou, nástěnná lampa
    cx = -HALF + 0.12
    cyl((cx, 1.2, 3.0), 0.5, 0.08, M("#ffffff", 0.4), rot=(0, 90, 0))
    cyl((cx + 0.05, 1.2, 3.0), 0.44, 0.04, M("#fff6e0", 0.5), rot=(0, 90, 0))
    box((cx + 0.09, 1.2, 3.12), (0.02, 0.05, 0.3), M("#16132b", 0.5), bevel=0)
    box((cx + 0.09, 1.28, 3.0), (0.02, 0.26, 0.05), M("#16132b", 0.5), bevel=0)
    box((cx + 0.04, -1.5, 2.6), (0.08, 1.2, 1.6), white, bevel=0.03)
    box((cx + 0.09, -1.5, 2.6), (0.03, 1.0, 1.4), M("#2c2a5a", 0.5), bevel=0)
    cone((cx + 0.13, -1.5, 2.55), 0.16, 0.7, M("#ff5a3c", 0.4), rot=(0, 0, 0))
    for sy, sz in ((-1.9, 3.1), (-1.1, 3.0), (-1.4, 2.0)):
        sph((cx + 0.13, sy, sz), 0.04, M("#fff6b0", 0.3, emit=3.0))
    for k in range(9):  # girlanda
        y = -3.8 + k * 0.85
        z = 3.6 - 0.2 * math.sin(math.pi * (k / 8)) * 1.0
        box((cx + 0.08, y, z), (0.04, 0.34, 0.3), M(["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a"][k % 4], 0.6), rot=(0, 0, 0), bevel=0)
    bar_l = M("#3b3a4a", 0.4, metal=0.7)
    box((cx + 0.1, 3.2, 2.5), (0.1, 0.1, 0.5), bar_l, bevel=0.01)
    sph((cx + 0.25, 3.2, 2.8), 0.22, M("#fff2c0", 0.3, emit=5.0), (0.8, 1, 1))
    # kalendář a ptačí budka místo dveří
    box((-3.2, HALF - 0.1, 1.6), (0.9, 0.06, 1.1), white, bevel=0.02)
    box((-3.2, HALF - 0.14, 1.45), (0.78, 0.04, 0.8), M("#f7e7a8", 0.6), bevel=0)
    box((-3.2, HALF - 0.14, 2.0), (0.78, 0.04, 0.2), M("#e5484d", 0.6), bevel=0)
    # --- světla
    d = bpy.data.lights.new("s", "SUN")
    d.energy = 3.0
    d.angle = math.radians(5)
    o = bpy.data.objects.new("s", d)
    sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(52), math.radians(6), math.radians(25))
    a = bpy.data.lights.new("a", "AREA")
    a.energy = 900
    a.size = 8
    ao = bpy.data.objects.new("a", a)
    sc.collection.objects.link(ao)
    ao.location = (3, -4, 7.5)
    ao.rotation_euler = (math.radians(20), 0, math.radians(20))
    # --- kamera: ortho, rozměr podle promítnutých rohů
    cam = bpy.data.objects.new("c", bpy.data.cameras.new("c"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.data.type = "ORTHO"
    cam.location = TARGET + DIR * 40
    cam.rotation_euler = (-DIR).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()
    rot = cam.matrix_world.to_3x3()
    right, up = rot @ Vector((1, 0, 0)), rot @ Vector((0, 1, 0))
    corners = [Vector((sx * (HALF + 0.15), sy * (HALF + 0.15), z)) for sx in (-1, 1) for sy in (-1, 1) for z in (-0.44, H + 0.1)]
    xs = [(p - TARGET).dot(right) for p in corners]
    ys = [(p - TARGET).dot(up) for p in corners]
    minx, maxx, miny, maxy = min(xs) - 0.3, max(xs) + 0.3, min(ys) - 0.3, max(ys) + 0.3
    width = maxx - minx
    height = maxy - miny
    px_h = round(W_PX * height / width)
    sc.render.resolution_y = px_h
    cam.data.ortho_scale = width
    # posun kamery, aby byl obsah vystředěný
    shift = ((maxx + minx) / 2) * right + ((maxy + miny) / 2) * up
    cam.location = TARGET + shift + DIR * 40
    center = TARGET + shift
    return sc, right, up, center, width, height


def frac(p, right, up, center, width, height):
    d = p - center
    return 0.5 + d.dot(right) / width, 0.5 - d.dot(up) / height


def main():
    sc, right, up, center, width, height = build()
    render(f"{OUT}/room_iso.png")
    slots = []
    for y in SLOT_Y:
        for x in SLOT_X:
            fx, fy = frac(Vector((x, y, 0.0)), right, up, center, width, height)
            slots.append([round(fx * 100, 3), round(fy * 100, 3)])
    # kotva a velikost každého sprajtu nábytku: sprajt je čtverec o straně `scale` světových jednotek,
    # kamera míří na (0, 0, 0.17 * scale) pod stejným úhlem; počátek nábytku je tedy níž než střed.
    furn = {}
    for name, (_, s) in R.FURNITURE.items():
        t = Vector((0.0, 0.0, 0.17 * s))
        dirv = Vector((3.3, -6.2, 3.6 - 0.17 * s)).normalized()
        q = (-dirv).to_track_quat("-Z", "Y")
        r2, u2 = q @ Vector((1, 0, 0)), q @ Vector((0, 1, 0))
        o = Vector((0.0, 0.0, 0.0)) - t
        oy = 0.5 - o.dot(u2) / s
        furn[name] = {"w": round(s / width * 100, 3), "o": round(oy, 4)}
    def pt(x, y, z):
        fx, fy = frac(Vector((x, y, z)), right, up, center, width, height)
        return [round(fx * 100, 3), round(fy * 100, 3)]

    wx, wz, wy = 1.6, 2.35, HALF - 0.13
    pane = [pt(wx - 1.25, wy, wz + 1.05), pt(wx + 1.25, wy, wz + 1.05), pt(wx + 1.25, wy, wz - 1.05), pt(wx - 1.25, wy, wz - 1.05)]
    # sluneční paprsek z okna na podlahu (světlo jde dolů a dopředu)
    beam = []
    for (bx, bz) in ((wx - 1.25, wz + 1.05), (wx + 1.25, wz + 1.05), (wx + 1.25, wz - 1.05), (wx - 1.25, wz - 1.05)):
        t = bz / 0.85
        beam.append(pt(bx - 0.45 * t, wy - 1.0 * t, 0.02))
    lamp = pt(-HALF + 0.37, 3.2, 2.8)
    json.dump({"aspect": round(width / height, 4), "slots": slots, "furn": furn, "pane": pane, "beam": beam, "lamp": lamp}, open(f"{OUT}/layout.json", "w"))
    print("LAYOUT", OUT, flush=True)


main()
