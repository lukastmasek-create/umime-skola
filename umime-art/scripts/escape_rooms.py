"""Render osmi únikových místností: museum, expedition, jungle, pirate, kitchen, library, observatory, castle.

    blender -b --python umime-art/scripts/escape_rooms.py -- <výstupní složka> [místnost]
    python umime-art/scripts/escape_rooms.py <výstupní složka> [místnost]

Všechny místnosti sdílejí kostru z `src/lib/escape/rooms/kit.ts`, takže klikací místa mají stejné
obdélníky (SVG 800 × 450, viz `RoomScene.tsx`):
    a 70,70,190×140 · b 300,110,130×190 · c 80,290,210×100 · d 470,20,120×70
    e 470,250,120×100 · door 640,120,120×270 · examine 595,220,40×100 · robot 305,330,90×90

Výstup do `<složka>/<místnost>/`: `bg.png`, `st_<stav>.png` (b_open, d_used, e_on, door_open)
a `it_<id>.png` (key, note1..4, partB, partC, tool, card). Na weby je převede `escape_publish.py`.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lab as L  # noqa: E402  (sdílené pomocné funkce: box, cyl, sphere, mat, světla, kamera)
from lab import (  # noqa: E402
    box, cyl, sphere, cone, mat, px, pz, light, camera_front, world, brick_mat, checker_mat, reset,
    render, icon_scene, flask,
)

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "escape_out"
ONLY_ROOM = ARGS[1] if len(ARGS) > 1 else os.environ.get("ROOM_ONLY")

DEFAULT = dict(b_open=False, d_used=False, e_on=False, door_open=False)
STATES = {k: {**DEFAULT, k: True} for k in DEFAULT}
STATES["door_open"] = {**DEFAULT, "e_on": True, "door_open": True}

INK = "#16132b"


def M(c, **k):
    return mat(c, **k)


def torus(cx, cy, R, r, m, rot=(90, 0, 0), front=0.0):
    bpy.ops.mesh.primitive_torus_add(major_radius=R / 100, minor_radius=r / 100, major_segments=48, minor_segments=16)
    o = bpy.context.active_object
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.location = (px(cx), -(front + r / 100 + 0.0), pz(cy))
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def rotated(o, x=0.0, y=0.0, z=0.0):
    o.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))
    return o


def base(wall, floor, sun="#fff1dc"):
    reset()
    L._mats.clear()
    world("#cfd8e3", 0.32)
    camera_front()
    box(-40, -40, 840, 386, 0.25, brick_mat(*wall), front=-0.25, bevel=0)
    box(-40, 386, 840, 500, 0.9, checker_mat(*floor), front=-0.25, bevel=0)
    box(-40, 378, 840, 392, 0.12, M("#5b4a3a", rough=0.6), front=0.0, bevel=0.02)  # lišta
    s = light("SUN", (0, -6, 6), 3.8, 0, sun, (math.radians(52), 0, math.radians(22)))
    s.data.angle = math.radians(5)
    light("AREA", (-3, -6, 4), 140, 6.0, "#cfe6ff", (math.radians(80), 0, math.radians(-30)))
    box(-40, 386, 840, 392, 0.4, M("#6f6250", rough=0.9), front=0.0, bevel=0)


def robot():
    cyl(350, 372, 30, 28, M("#8fd0ff", rough=0.3), front=0.0, bevel=0.01)
    sphere(350, 340, 24, M("#d9e2ee", rough=0.25), front=0.0, sz=0.85)
    sphere(341, 338, 4, M(INK, rough=0.3), front=0.42)
    sphere(359, 338, 4, M(INK, rough=0.3), front=0.42)
    cyl(350, 312, 1.8, 14, M(INK), front=0.0)
    sphere(350, 304, 5, M("#ff5a3c", emit=1.5, rough=0.2), front=0.2)


def door(panel, frame, s, kind="plain", light_col="#fff0b0", trim="#c9a46a"):
    """Dveře v obdélníku 640..760 × 120..390; `kind` přidá výzdobu."""
    fm = M(frame, metal=0.2, rough=0.5)
    box(632, 112, 768, 122, 0.16, fm, bevel=0.015)
    box(632, 112, 642, 392, 0.16, fm, bevel=0.015)
    box(758, 112, 768, 392, 0.16, fm, bevel=0.015)
    pm = M(panel, rough=0.5)
    if s["door_open"]:
        box(642, 122, 758, 392, 0.02, M(light_col, emit=5.0), front=0.0, bevel=0)
        d = box(642, 122, 758, 392, 0.08, pm, front=0.0, bevel=0.012)
        th = math.radians(48)
        d.location = (px(642) + 0.58 * math.cos(th), -0.16 - 0.58 * math.sin(th), pz(257))
        d.rotation_euler = (0, 0, -th)
        return
    box(642, 122, 758, 392, 0.08, pm, front=0.08, bevel=0.012)
    t = M(trim, metal=0.5, rough=0.35)
    if kind == "double":
        box(698, 122, 702, 392, 0.04, t, front=0.16, bevel=0.004)
        sphere(688, 255, 6, t, front=0.17)
        sphere(712, 255, 6, t, front=0.17)
        for yy in (150, 340):
            box(650, yy, 750, yy + 6, 0.03, t, front=0.16, bevel=0.003)
    elif kind == "plank":
        for xx in (667, 692, 717, 742):
            box(xx - 1, 124, xx + 1, 390, 0.02, M("#000000", rough=0.9), front=0.16, bevel=0)
        sphere(745, 258, 6, t, front=0.18)
    elif kind == "flap":
        for yy in range(140, 380, 24):
            box(646, yy, 754, yy + 3, 0.02, M("#6b4a2a"), front=0.16, bevel=0)
            sphere(650, yy + 1, 3, M("#6b4a2a"), front=0.17)
            sphere(750, yy + 1, 3, M("#6b4a2a"), front=0.17)
    elif kind == "stone":
        torus(700, 230, 30, 4, M("#6f8a5a", rough=0.9), front=0.1)
        sphere(700, 230, 12, M("#d9c08a", rough=0.5, metal=0.4), front=0.14)
        for yy in (160, 320):
            box(655, yy, 745, yy + 10, 0.05, M("#7d8b6a", rough=0.9), front=0.15, bevel=0.01)
    elif kind == "porthole":
        torus(700, 190, 24, 5, t, front=0.1)
        sphere(700, 190, 20, M("#8fd0ff", glass=True), front=0.1, sz=0.2)
        sphere(745, 270, 6, t, front=0.17)
    elif kind == "window":
        torus(700, 190, 24, 5, M("#cfd8e3", metal=0.6, rough=0.3), front=0.1)
        sphere(700, 190, 20, M("#bfe8ff", glass=True), front=0.1, sz=0.2)
        box(746, 240, 752, 290, 0.06, M("#cfd8e3", metal=0.8, rough=0.25), front=0.17, bevel=0.01)


def cabinet(s, body, doorc, knob, inner, contents, hinge_open=True):
    """Skříň 300..430 × 110..300 s dvířky; po otevření dutá s policemi."""
    wood = M(body, rough=0.5)
    dm = M(doorc, rough=0.5)
    if s["b_open"]:
        for a in ((300, 110, 308, 300), (422, 110, 430, 300), (300, 110, 430, 118), (300, 292, 430, 300)):
            box(*a, 0.32, wood, bevel=0.01)
        box(308, 118, 422, 292, 0.04, M(inner, rough=0.9), front=0.0, bevel=0)
        for sy in (170, 232):
            box(308, sy, 422, sy + 6, 0.26, dm, front=0.05, bevel=0.01)
        for i, (bx, by) in enumerate([(328, 170), (352, 170), (394, 170), (330, 232), (360, 232), (398, 232)]):
            c = contents[i % len(contents)]
            cyl(bx, by - 15, 9, 30, M(c, rough=0.25), front=0.1)
            cyl(bx, by - 33, 4, 8, M(INK), front=0.14)
        if hinge_open:
            box(282, 114, 300, 296, 0.06, dm, front=0.28, bevel=0.01)
            box(430, 114, 448, 296, 0.06, dm, front=0.28, bevel=0.01)
    else:
        box(300, 110, 430, 300, 0.32, wood, bevel=0.02)
        box(306, 118, 362, 292, 0.05, dm, front=0.32, bevel=0.012)
        box(368, 118, 424, 292, 0.05, dm, front=0.32, bevel=0.012)
        k = M(knob, rough=0.25, metal=0.8)
        sphere(352, 230, 8, k, front=0.37)
        sphere(378, 230, 8, k, front=0.37)
        box(358, 232, 372, 250, 0.04, M("#444a58", metal=0.8, rough=0.35), front=0.37, bevel=0.006)


def desk(x0, x1, top, col, depth=0.62, legs=True):
    w = M(col, rough=0.5)
    box(x0, top, x1, top + 14, depth, w, bevel=0.02)
    if legs:
        box(x0 + 10, top + 14, x0 + 26, 386, 0.5, w, front=0.05, bevel=0.01)
        box(x1 - 26, top + 14, x1 - 10, 386, 0.5, w, front=0.05, bevel=0.01)
    else:
        box(x0 + 12, top + 14, x1 - 12, 386, 0.5, w, front=0.05, bevel=0.015)


def barrel(cx, col, band="#444a58"):
    cyl(cx, 275, 18, 92, M(col, rough=0.55), front=0.0, bevel=0.01)
    for yy in (245, 275, 305):
        cyl(cx, yy, 19.5, 5, M(band, metal=0.7, rough=0.4), front=-0.015)


# ------------------------------------------------------------------------------------------
# Místnosti
# ------------------------------------------------------------------------------------------


def museum(s):
    base(("#efe3cc", "#d9c9a8", 4.0), ("#b59a73", "#a58a65", 14.0))
    # a: hieroglyfový vlys a sarkofág
    box(70, 70, 260, 140, 0.05, M("#d9b77a", rough=0.7), bevel=0.01)
    cols = ["#3248f0", "#c0392b", "#17a864", "#16132b"]
    for i in range(12):
        box(80 + i * 15, 82 + (i % 3) * 14, 90 + i * 15, 92 + (i % 3) * 14, 0.02, M(cols[i % 4], rough=0.5), front=0.05, bevel=0.002)
    box(85, 192, 245, 212, 0.55, M("#9c9486", rough=0.8), bevel=0.01)
    box(95, 150, 235, 192, 0.45, M("#d9a54a", rough=0.3, metal=0.6), front=0.04, bevel=0.03)
    sphere(228, 158, 24, M("#d9a54a", rough=0.3, metal=0.6), front=0.04, sz=1.2)
    for e in (220, 236):
        sphere(e, 154, 3.5, M(INK), front=0.45)
    for xx in (110, 135, 160, 185):
        box(xx, 152, xx + 8, 190, 0.03, M("#3248f0", rough=0.4), front=0.49, bevel=0.003)
    # b: vitrína
    box(300, 270, 430, 300, 0.34, M("#4a2a1a", rough=0.5), bevel=0.02)
    box(308, 118, 422, 270, 0.04, M("#6b2a2a", rough=0.8), front=0.0, bevel=0)
    gold = M("#c9a46a", metal=0.7, rough=0.3)
    for a in ((300, 110, 430, 118), (300, 110, 308, 270), (422, 110, 430, 270)):
        box(*a, 0.34, gold, bevel=0.01)
    cyl(340, 238, 14, 44, M("#d98e4a", rough=0.3), front=0.1)
    sphere(340, 212, 8, M("#d98e4a", rough=0.3), front=0.1)
    sphere(392, 226, 22, M("#cfc8b8", rough=0.6), front=0.1)
    box(380, 244, 404, 268, 0.2, M("#9c9486", rough=0.8), front=0.06, bevel=0.01)
    if s["b_open"]:
        box(430, 118, 446, 270, 0.02, M("#d8f1ff", glass=True), front=0.3, bevel=0)
    else:
        box(308, 118, 422, 270, 0.03, M("#d8f1ff", glass=True), front=0.32, bevel=0)
        sphere(365, 240, 7, gold, front=0.36)
    # c: stély časové osy
    desk(80, 290, 336, "#7a5535")
    heights = [30, 42, 54, 66, 78]
    stone = ["#cfc8b8", "#c4bba6", "#b9b09a", "#aea58f", "#a39a85"]
    for i, h in enumerate(heights):
        x = 100 + i * 38
        box(x, 336 - h, x + 26, 336, 0.16, M(stone[i], rough=0.8), front=0.15, bevel=0.012)
        for j in range(2):
            box(x + 6, 336 - h + 8 + j * 8, x + 20, 336 - h + 11 + j * 8, 0.02, M("#6b6254", rough=0.9), front=0.31, bevel=0)
    # d: římsa nad vchodem
    box(466, 70, 594, 92, 0.34, M("#9c9486", rough=0.8), bevel=0.015)
    for xx in (480, 570):
        cyl(xx, 58, 5, 24, M("#f6f0e0", rough=0.6), front=0.1)
        sphere(xx, 42, 4, M("#ffb347", emit=6.0), front=0.1, sz=1.4)
    if not s["d_used"]:
        cyl(530, 58, 15, 0.06, M("#ffd24d", rough=0.25, metal=0.9), axis="y", front=0.12)
        cyl(530, 58, 9, 0.07, M("#c9a46a", rough=0.3, metal=0.8), axis="y", front=0.12)
    # e: strážní automat
    box(482, 258, 578, 350, 0.35, M("#444a58", metal=0.6, rough=0.4), bevel=0.02)
    box(494, 270, 566, 312, 0.03, M("#0f5132" if s["e_on"] else "#0e1a3a", rough=0.2), front=0.35, bevel=0)
    if s["e_on"]:
        for i, yy in enumerate((278, 290, 302)):
            box(500, yy, 500 + 56 - i * 10, yy + 4, 0.012, M("#7ee0b0", emit=3.0), front=0.38, bevel=0)
    box(504, 322, 556, 332, 0.04, M("#16132b"), front=0.35, bevel=0.004)
    sphere(560, 268, 4, M("#3ddc97" if s["e_on"] else "#ff5a3c", emit=5.0), front=0.35)
    # examine: busta
    box(598, 272, 632, 322, 0.3, M("#9c9486", rough=0.8), bevel=0.01)
    sphere(615, 252, 17, M("#cfc8b8", rough=0.6), front=0.0, sz=1.15)
    cone(615, 254, 3, 8, M("#bfb6a2", rough=0.6), front=0.2)
    door("#6b3f23", "#c9a46a", s, "double")
    robot()


def expedition(s):
    base(("#e8d9b5", "#cdb98a", 3.0), ("#d9c08a", "#cdb27a", 16.0), "#fff4d0")
    # a: kompas na desce
    box(80, 70, 250, 190, 0.08, M("#8b5e3c", rough=0.6), bevel=0.03)
    cyl(165, 130, 46, 0.1, M("#c9a24a", metal=0.8, rough=0.3), axis="y", front=0.08)
    cyl(165, 130, 38, 0.03, M("#fffaf0", rough=0.5), axis="y", front=0.18)
    for ang, c in ((0, "#16132b"), (90, "#16132b"), (180, "#16132b"), (270, "#16132b")):
        r = math.radians(ang)
        box(163, 130 - 34, 167, 130 - 26, 0.02, M(c), front=0.21, bevel=0).location = (px(165) + 0.3 * math.sin(r), -0.22, pz(130) + 0.3 * math.cos(r))
    n = cone(165, 112, 6, 34, M("#ff5a3c", rough=0.3), front=0.22)
    n.location = (px(165), -0.25, pz(114))
    sp = cone(165, 148, 6, 34, M("#f6f4ee", rough=0.3), front=0.22)
    sp.location = (px(165), -0.25, pz(146))
    sp.rotation_euler = (0, math.radians(180), 0)
    sphere(165, 130, 4, M("#c9a24a", metal=0.8), front=0.24)
    # b: vojenská skříň
    cabinet(s, "#4a6b3a", "#6b8a4f", "#d9c08a", "#2f4a28", ["#d98e4a", "#f6f4ee", "#ffc933", "#3b82f6"])
    # c: atlas a mapy
    desk(80, 290, 336, "#8b5e3c")
    for i, c in enumerate(["#3248f0", "#c0392b", "#17a864", "#ffc933"]):
        box(92 + i * 16, 336 - 34 + (i % 2) * 6, 106 + i * 16, 336, 0.3, M(c, rough=0.6), front=0.15, bevel=0.008)
    for i, xx in enumerate((190, 214, 238)):
        cyl(xx, 304, 9, 64, M("#efe3cc", rough=0.7), front=0.2)
        cyl(xx, 276, 9.5, 5, M(["#c0392b", "#3248f0", "#17a864"][i], rough=0.5), front=0.19)
    # d: větev s vysílačkou
    br = box(466, 42, 604, 58, 0.14, M("#6b4a2a", rough=0.8), front=0.04, bevel=0.04)
    for i, (lx, rot) in enumerate(((480, -25), (510, 15), (555, -10), (590, 25), (500, 40), (575, -35))):
        lf = box(lx - 34, 28, lx + 34, 40, 0.02, M("#3d9a4a", rough=0.5), front=0.09, bevel=0.003)
        lf.location = (px(lx), -0.1, pz(40))
        lf.rotation_euler = (0, math.radians(rot), math.radians(rot * 0.3))
    if not s["d_used"]:
        cyl(555, 62, 1.2, 12, M("#6b4a2a"), front=0.1)
        box(540, 70, 572, 92, 0.12, M("#4a5a3a", rough=0.5), front=0.07, bevel=0.01)
        cyl(566, 62, 1.2, 14, M("#16132b"), front=0.1)
    # e: vysílačka
    box(480, 266, 580, 346, 0.3, M("#4a5a3a", rough=0.45, metal=0.3), bevel=0.02)
    cyl(500, 296, 14, 0.05, M("#16132b", rough=0.3), axis="y", front=0.3)
    cyl(500, 296, 10, 0.05, M("#ffc933" if s["e_on"] else "#6b6254", emit=2.5 if s["e_on"] else 0), axis="y", front=0.34)
    for yy in range(280, 322, 8):
        box(530, yy, 572, yy + 3, 0.02, M("#16132b"), front=0.3, bevel=0)
    sphere(520, 332, 4, M("#ff5a3c" if not s["e_on"] else "#3ddc97", emit=5.0), front=0.3)
    cyl(566, 248, 1.8, 36, M("#cfd8e3", metal=0.8, rough=0.3), front=0.1)
    # examine: sud
    barrel(615, "#8b5e3c")
    door("#d9c08a", "#8b5e3c", s, "flap", "#bfe8ff", "#6b4a2a")
    robot()


def jungle(s):
    base(("#b8dba0", "#8fbf7a", 4.0), ("#6b8f4a", "#5f8242", 16.0), "#f4ffd8")
    leaf = M("#3d9a4a", rough=0.5)
    # a: kmen s lístkem
    cyl(165, 140, 30, 160, M("#7a5230", rough=0.85), front=0.0)
    for dx in (-26, 26):
        cyl(165 + dx, 214, 12, 40, M("#7a5230", rough=0.85), front=0.0)
    for (lx, ly, r) in ((130, 72, 34), (165, 62, 40), (205, 74, 32)):
        sphere(lx, ly, r, M("#2f8f4a", rough=0.55), front=0.0)
    box(148, 118, 184, 160, 0.03, M("#fff7e0", rough=0.8), front=0.6, bevel=0.003)
    sphere(166, 120, 3, M("#ff5a3c"), front=0.62)
    for yy in (130, 138, 146):
        box(153, yy, 179, yy + 2, 0.01, M("#9c8c6d"), front=0.64, bevel=0)
    # b: kořenová schránka
    cabinet(s, "#7a5230", "#5f8242", "#ffc933", "#3a2a1a", ["#7ee0b0", "#ffd24d", "#e3d4ff", "#ff8fb3"])
    for xx in (312, 345, 392, 418):
        cyl(xx, 290, 6, 30, M("#7a5230", rough=0.85), front=0.0)
    # c: pařez s kokonem
    cyl(185, 355, 85, 70, M("#8b5e3c", rough=0.8), front=0.0, bevel=0.0)
    cyl(185, 320, 86, 6, M("#b98a5a", rough=0.7), front=0.0)
    cyl(185, 304, 1.2, 36, M("#6f8a5a"), front=0.2)
    sphere(185, 296, 14, M("#efe3cc", rough=0.7), front=0.2, sz=1.6)
    for i, xx in enumerate((130, 235)):
        box(xx - 8, 318 - i * 8, xx + 8, 330 - i * 8, 0.02, M("#ffc933" if i else "#3b82f6", rough=0.4), front=0.2, bevel=0.003)
    # d: koruna stromu s amuletem
    for (lx, ly, r) in ((480, 30, 30), (520, 22, 34), (560, 28, 32), (592, 40, 26), (500, 62, 24), (575, 66, 22)):
        sphere(lx, ly, r, M("#2f8f4a", rough=0.55), front=0.0)
    cyl(540, 90, 1.5, 40, M("#3d9a4a"), front=0.15)
    if not s["d_used"]:
        torus(540, 86, 9, 2.5, M("#ffd24d", metal=0.8, rough=0.3), front=0.18)
        sphere(540, 98, 9, M("#5be7ff", emit=4.0, rough=0.1), front=0.15)
    # e: sova strážce
    sphere(530, 318, 38, M("#8b5e3c", rough=0.7), front=0.0, sz=1.2)
    sphere(530, 270, 26, M("#a0714d", rough=0.7), front=0.0)
    cone(512, 244, 8, 16, M("#8b5e3c"), front=0.12)
    cone(548, 244, 8, 16, M("#8b5e3c"), front=0.12)
    for ex in (518, 542):
        sphere(ex, 268, 10, M("#ffd24d" if s["e_on"] else "#f6f4ee", emit=3.5 if s["e_on"] else 0, rough=0.3), front=0.45)
        sphere(ex, 268, 4, M(INK), front=0.62)
    cone(530, 280, 5, 12, M("#ff9d3d"), front=0.5)
    # examine: houba
    cyl(615, 296, 8, 50, M("#f6f0e0", rough=0.6), front=0.0)
    sphere(615, 268, 24, M("#e5484d", rough=0.45), front=0.0, sz=0.6)
    for (dx, dy) in ((-12, 0), (8, -6), (14, 4), (-2, 6)):
        sphere(615 + dx, 266 + dy, 3, M("#ffffff"), front=0.38)
    door("#8f9a82", "#6f7a62", s, "stone", "#d8ffb0")
    robot()


def pirate(s):
    base(("#a97c52", "#6b4a2a", 4.0), ("#8a5a35", "#7a4d2c", 12.0), "#ffe9c4")
    # okénko lodi
    torus(350, 70, 30, 6, M("#c9a24a", metal=0.7, rough=0.3), front=0.0)
    sphere(350, 70, 28, M("#5bb8ff", rough=0.15), front=0.0, sz=0.12)
    # a: mapa pokladů
    box(90, 80, 240, 200, 0.03, M("#e8d5a0", rough=0.8), bevel=0.003)
    for yy in (80, 200):
        cyl(165, yy, 5, 150, M("#8b5e3c", rough=0.6), axis="z", front=0.0).rotation_euler = (0, math.radians(90), 0)
    box(105, 100, 150, 125, 0.01, M("#3d9a4a", rough=0.6), front=0.05, bevel=0)
    for i in range(7):
        box(150 + i * 12, 130 + (i % 2) * 8, 156 + i * 12, 135 + (i % 2) * 8, 0.01, M("#6b3f23"), front=0.05, bevel=0)
    for d in (-1, 1):
        r = box(218, 170, 222, 192, 0.01, M("#c0392b"), front=0.05, bevel=0)
        r.location = (px(220), r.location.y, pz(181))
        r.rotation_euler = (0, math.radians(45 * d), 0)
    # b: truhla s pokladem
    chest = M("#6b3f23", rough=0.55)
    metal = M("#444a58", metal=0.7, rough=0.4)
    gold = M("#ffd24d", rough=0.25, metal=0.9)
    box(300, 228, 430, 300, 0.36, chest, bevel=0.02)
    for xx in (312, 408):
        box(xx, 228, xx + 10, 300, 0.38, metal, bevel=0.005)
    if s["b_open"]:
        box(304, 150, 426, 224, 0.05, chest, bevel=0.02)
        box(300, 218, 430, 232, 0.38, chest, bevel=0.01)
        for i in range(14):
            sphere(312 + (i * 17) % 110, 218 - (i % 3) * 6, 9, gold, front=0.1)
        sphere(365, 205, 9, M("#ff3d6e", rough=0.1, emit=0.6), front=0.2)
    else:
        box(300, 200, 430, 232, 0.4, chest, bevel=0.03)
        box(300, 212, 430, 218, 0.41, metal, bevel=0.004)
        box(355, 216, 375, 244, 0.05, gold, front=0.38, bevel=0.01)
    # c: kapitánův stůl
    desk(80, 290, 336, "#5a3d27")
    box(110, 318, 210, 336, 0.3, M("#efe3cc", rough=0.8), front=0.12, bevel=0.01)
    cyl(250, 322, 6, 28, M("#f6f0e0", rough=0.6), front=0.2)
    sphere(250, 304, 4, M("#ffb347", emit=6.0), front=0.2, sz=1.5)
    cyl(160, 296, 8, 20, M("#16132b", rough=0.3), front=0.25)
    # d: ráhno se stěžně
    box(466, 40, 594, 50, 0.1, M("#8b5e3c", rough=0.7), front=0.05, bevel=0.01)
    box(476, 18, 584, 40, 0.03, M("#f1ead8", rough=0.9), front=0.08, bevel=0)
    box(556, 52, 586, 74, 0.02, M("#16132b"), front=0.1, bevel=0)
    sphere(571, 61, 5, M("#f6f4ee"), front=0.12)
    cyl(520, 62, 1.2, 28, M("#8b5e3c"), front=0.1)
    if not s["d_used"]:
        cyl(520, 84, 14, 0.06, M("#ffd24d", metal=0.9, rough=0.25), axis="y", front=0.12)
        cyl(520, 84, 10, 0.07, M("#fffaf0", rough=0.5), axis="y", front=0.13)
        cone(520, 84, 2, 14, M("#c0392b"), front=0.16)
    # e: papoušek
    box(488, 332, 572, 338, 0.14, M("#8b5e3c", rough=0.7), front=0.05, bevel=0.01)
    box(520, 338, 540, 386, 0.1, M("#8b5e3c", rough=0.7), front=0.06, bevel=0.01)
    sphere(530, 300, 30, M("#e5484d", rough=0.4), front=0.0, sz=1.15)
    sphere(544, 264, 17, M("#e5484d", rough=0.4), front=0.0)
    sphere(551, 260, 5, M("#f6f4ee"), front=0.22)
    sphere(553, 260, 2.5, M(INK), front=0.3)
    cone(560, 268, 5, 14, M("#ffb347"), front=0.1)
    wy = 282 if s["e_on"] else 300
    sphere(506, wy, 14, M("#3b82f6", rough=0.4), front=0.28, sz=1.6)
    sphere(556, wy, 14, M("#ffc933", rough=0.4), front=0.28, sz=1.6)
    for i, c in enumerate(("#3b82f6", "#ffc933", "#3d9a4a")):
        box(522 + i * 8, 318, 530 + i * 8, 336, 0.05, M(c, rough=0.4), front=0.0, bevel=0.004)
    if s["e_on"]:
        sphere(573, 267, 4, M("#ffd24d", emit=6.0), front=0.2)
    barrel(615, "#5a3d27")
    door("#4a3322", "#2a1d12", s, "porthole", "#fff0c0", "#c9a24a")
    robot()


def kitchen(s):
    base(("#fff0d6", "#e8dcc0", 6.0), ("#c9b49a", "#b8a388", 14.0), "#fff8ec")
    # a: recept na zdi
    box(80, 70, 250, 205, 0.06, M("#b98a5a", rough=0.6), bevel=0.02)
    box(90, 80, 240, 195, 0.03, M("#fffaf0", rough=0.8), front=0.05, bevel=0.003)
    for i in range(7):
        box(100, 96 + i * 14, 100 + 120 - (i % 3) * 22, 100 + i * 14, 0.01, M("#9c8c6d" if i else "#e5484d"), front=0.08, bevel=0)
    sphere(165, 84, 5, M("#e5484d"), front=0.1)
    # b: spižírna
    cabinet(s, "#f6f0e0", "#e8d2a8", "#b8863b", "#7a5535", ["#e5484d", "#ffc933", "#3d9a4a", "#ff8a6b", "#e3d4ff"])
    # c: pracovní deska
    box(80, 320, 290, 336, 0.62, M("#cfd8e3", metal=0.5, rough=0.3), bevel=0.02)
    box(88, 336, 282, 386, 0.58, M("#f6f0e0", rough=0.5), front=0.02, bevel=0.015)
    box(100, 346, 180, 380, 0.03, M("#e8d2a8", rough=0.5), front=0.6, bevel=0.006)
    box(190, 346, 270, 380, 0.03, M("#e8d2a8", rough=0.5), front=0.6, bevel=0.006)
    sphere(130, 308, 22, M("#ffffff", rough=0.3), front=0.15, sz=0.6)
    for i, xx in enumerate((200, 216, 232)):
        sphere(xx, 312, 8, M("#fff4d6", rough=0.4), front=0.2, sz=1.2)
    cyl(258, 304, 4, 30, M("#8b5e3c"), front=0.2)
    box(250, 306, 270, 318, 0.04, M("#d9a54a"), front=0.3, bevel=0.004)
    # d: horní police s kartou
    box(466, 78, 594, 88, 0.3, M("#8b5e3c", rough=0.6), bevel=0.01)
    for xx in (476, 574):
        box(xx, 88, xx + 6, 104, 0.1, M("#6b4a2a"), bevel=0.003)
    for xx, c in ((486, "#d98e4a"), (572, "#7ee0b0")):
        cyl(xx, 64, 11, 28, M(c, glass=True), front=0.1)
        cyl(xx, 48, 11.5, 5, M("#f6f0e0", rough=0.5), front=0.1)
    if not s["d_used"]:
        c = box(520, 40, 556, 78, 0.02, M("#ffffff", rough=0.4), front=0.12, bevel=0.004)
        box(524, 46, 552, 50, 0.01, M("#3248f0"), front=0.14, bevel=0)
        sphere(534, 62, 6, M("#f6f0e0", rough=0.6), front=0.14, sz=0.6)
        c.rotation_euler = (0, math.radians(8), 0)
    # e: digitální trouba
    box(476, 256, 584, 350, 0.4, M("#cfd8e3", metal=0.7, rough=0.3), bevel=0.02)
    box(490, 292, 570, 340, 0.03, M("#ff8a3c" if s["e_on"] else "#1c1b33", emit=2.5 if s["e_on"] else 0, rough=0.15), front=0.4, bevel=0.004)
    box(490, 264, 540, 282, 0.03, M("#0e1a3a" if not s["e_on"] else "#0f5132", rough=0.2), front=0.4, bevel=0)
    if s["e_on"]:
        box(496, 270, 530, 276, 0.012, M("#7ee0b0", emit=4.0), front=0.43, bevel=0)
    for i, xx in enumerate((552, 562, 572)):
        sphere(xx, 273, 4, M("#16132b", rough=0.3), front=0.4)
    # examine: kastrol
    cyl(615, 296, 22, 48, M("#b8c4d6", metal=0.9, rough=0.25), front=0.0)
    sphere(615, 270, 22, M("#b8c4d6", metal=0.9, rough=0.25), front=0.0, sz=0.3)
    sphere(615, 262, 4, M("#16132b"), front=0.1)
    box(586, 292, 596, 298, 0.05, M("#16132b"), front=0.1, bevel=0.002)
    box(634, 292, 644, 298, 0.05, M("#16132b"), front=0.1, bevel=0.002)
    door("#f6f0e0", "#b8c4d6", s, "window", "#fff4d0", "#cfd8e3")
    robot()


def library(s):
    base(("#e6d2b0", "#c9b08a", 4.0), ("#8a6a48", "#7a5c3c", 14.0), "#ffe9c4")
    wood = M("#5a3a24", rough=0.55)
    pal = ["#c0392b", "#3248f0", "#17a864", "#ffc933", "#8e44ad", "#e67e22", "#16a085", "#d35490"]
    # a: regál s klasiky
    for a in ((70, 70, 260, 78), (70, 202, 260, 210), (70, 70, 78, 210), (252, 70, 260, 210)):
        box(*a, 0.42, wood, bevel=0.01)
    box(78, 78, 252, 202, 0.04, M("#2a1a10", rough=0.9), front=0.0, bevel=0)
    for row, yy in enumerate((78, 124, 170)):
        box(76, yy + 38, 254, yy + 46, 0.4, M("#7a4b2a", rough=0.5), bevel=0.008)
        x = 84
        i = row * 3
        while x < 240:
            w = 9 + (i * 7) % 8
            h = 26 + (i * 11) % 12
            box(x, yy + 38 - h, x + w, yy + 38, 0.28, M(pal[i % len(pal)], rough=0.55), front=0.08, bevel=0.006)
            x += w + 2
            i += 1
    # b: zamčená skříň
    cabinet(s, "#5a3a24", "#7a4b2a", "#d9a54a", "#2a1a10", ["#c0392b", "#3248f0", "#17a864", "#ffc933", "#8e44ad"])
    # c: čtenářský stůl s knihou a lampou
    desk(80, 290, 336, "#7a5535")
    box(110, 322, 172, 336, 0.34, M("#f6f0e0", rough=0.7), front=0.12, bevel=0.01)
    box(172, 322, 234, 336, 0.34, M("#f6f0e0", rough=0.7), front=0.12, bevel=0.01)
    box(170, 322, 174, 336, 0.34, M("#8e44ad", rough=0.6), front=0.12, bevel=0.003)
    for yy in (326, 330):
        box(118, yy, 164, yy + 1.5, 0.01, M("#9c8c6d"), front=0.47, bevel=0)
        box(180, yy, 226, yy + 1.5, 0.01, M("#9c8c6d"), front=0.47, bevel=0)
    cyl(262, 300, 3, 26, M("#c9a46a", metal=0.8, rough=0.3), front=0.25)
    sphere(262, 288, 14, M("#17a864", rough=0.3, emit=0.4), front=0.2, sz=0.7)
    box(252, 330, 274, 336, 0.16, M("#c9a46a", metal=0.8, rough=0.3), front=0.18, bevel=0.01)
    # d: nejvyšší police s průkazem
    box(466, 70, 594, 90, 0.34, wood, bevel=0.012)
    for i, xx in enumerate((470, 482, 494, 508)):
        box(xx, 40, xx + 11, 70, 0.26, M(pal[(i + 3) % len(pal)], rough=0.55), front=0.04, bevel=0.005)
    for i, xx in enumerate((574, 560, 548)):
        box(xx, 44, xx + 11, 70, 0.26, M(pal[(i + 1) % len(pal)], rough=0.55), front=0.04, bevel=0.005)
    if not s["d_used"]:
        c = box(520, 40, 548, 76, 0.02, M("#ffffff", rough=0.4), front=0.14, bevel=0.004)
        box(523, 46, 545, 50, 0.01, M("#3248f0"), front=0.16, bevel=0)
        sphere(528, 62, 5, M("#f6f0e0", rough=0.6), front=0.16, sz=0.6)
        c.rotation_euler = (0, math.radians(-8), 0)
    # e: katalogový počítač
    box(476, 292, 584, 350, 0.4, M("#6f6250", rough=0.5), bevel=0.02)
    box(486, 252, 574, 306, 0.14, M("#cfd8e3", metal=0.4, rough=0.35), bevel=0.02)
    box(494, 260, 566, 298, 0.03, M("#0f5132" if s["e_on"] else "#0e1a3a", rough=0.2, emit=0.8 if s["e_on"] else 0), front=0.14, bevel=0)
    if s["e_on"]:
        for i, yy in enumerate((266, 276, 286)):
            box(500, yy, 500 + 56 - i * 12, yy + 4, 0.012, M("#7ee0b0", emit=3.0), front=0.17, bevel=0)
    box(490, 318, 570, 332, 0.1, M("#444a58", rough=0.5), front=0.4, bevel=0.01)
    sphere(560, 268, 0.01, M("#16132b"), front=0.0)
    # examine: globus
    cyl(615, 322, 3, 40, M("#c9a46a", metal=0.8, rough=0.3), front=0.18)
    box(603, 318, 627, 324, 0.2, M("#5a3a24", rough=0.5), front=0.1, bevel=0.01)
    sphere(615, 268, 17, M("#3b82f6", rough=0.35), front=0.18)
    torus(615, 268, 21, 2, M("#c9a46a", metal=0.8, rough=0.3), rot=(90, 0, 0), front=0.14)
    door("#6b3f23", "#5a3a24", s, "double")
    robot()


def observatory(s):
    base(("#27305e", "#1c2347", 4.0), ("#434a7d", "#3a4070", 14.0), "#cfd8ff")
    # a: hvězdná mapa s Merkurem
    box(80, 70, 250, 200, 0.06, M("#10163a", rough=0.7), bevel=0.02)
    box(88, 78, 242, 192, 0.03, M("#1a2250", rough=0.5), front=0.06, bevel=0.004)
    stars = [(104, 100), (130, 92), (150, 118), (178, 100), (205, 128), (226, 104), (118, 150), (160, 166), (196, 172), (232, 150), (140, 134)]
    for i, (sx, sy) in enumerate(stars):
        sphere(sx, sy, 2.4 + (i % 3), M("#fff4c0", emit=5.0), front=0.09)
    torus(118, 150, 12, 2, M("#ff5a3c", emit=2.5), front=0.1)
    sphere(118, 150, 6, M("#b8b0a0", rough=0.6), front=0.1)
    # b: skříňka s čočkami
    cabinet(s, "#3a3f6b", "#4a5088", "#ffd24d", "#171b38", ["#5be7ff", "#ffd24d", "#ff8fb3", "#7ee0b0"])
    # c: stůl s planetami
    desk(80, 290, 336, "#5a4a7a")
    for (xx, r, col) in ((112, 9, "#b8b0a0"), (146, 13, "#f0c070"), (184, 15, "#3b82f6"), (222, 11, "#e5484d"), (262, 20, "#e0a870")):
        cyl(xx, 336 - r * 2, 1.6, r * 2 + 4, M("#cfd8e3", metal=0.8, rough=0.3), front=0.2)
        sphere(xx, 336 - r * 2 - r + 2, r, M(col, rough=0.45), front=0.2)
    torus(262, 288, 28, 3, M("#e8d2a0", rough=0.5), rot=(90, 0, 0), front=0.16).scale = (1, 1, 0.35)
    # d: vysoká police
    box(466, 70, 594, 90, 0.34, M("#5a4a7a", rough=0.6), bevel=0.012)
    for xx, c in ((476, "#5be7ff"), (570, "#ffd24d")):
        cyl(xx, 58, 9, 28, M(c, glass=True), front=0.1)
    box(494, 54, 520, 70, 0.2, M("#10163a", rough=0.6), front=0.08, bevel=0.01)
    if not s["d_used"]:
        c = box(526, 40, 556, 78, 0.02, M("#ffffff", rough=0.4), front=0.14, bevel=0.004)
        box(530, 46, 552, 50, 0.01, M("#3248f0"), front=0.16, bevel=0)
        sphere(538, 62, 5, M("#ffd24d", metal=0.8, rough=0.3), front=0.16, sz=0.6)
        c.rotation_euler = (0, math.radians(8), 0)
    # e: velký dalekohled
    box(482, 308, 578, 350, 0.4, M("#434a7d", metal=0.4, rough=0.4), bevel=0.02)
    for lx in (510, 550):
        cyl(lx, 290, 3, 60, M("#cfd8e3", metal=0.8, rough=0.3), front=0.2)
    tube = cyl(530, 280, 18, 110, M("#e8ecf4", metal=0.5, rough=0.3), front=0.1)
    tube.rotation_euler = (0, math.radians(38), 0)
    ring = torus(500, 306, 19, 3, M("#ffd24d", metal=0.8, rough=0.3), rot=(90, 38, 0), front=0.12)
    sphere(566, 256, 7, M("#16132b", rough=0.3), front=0.22)
    sphere(493, 318, 12, M("#5be7ff" if s["e_on"] else "#2a3a5a", emit=4.0 if s["e_on"] else 0, rough=0.1), front=0.22)
    sphere(498, 330, 4, M("#3ddc97" if s["e_on"] else "#ff5a3c", emit=5.0), front=0.4)
    # examine: glóbus oblohy
    cyl(615, 322, 3, 40, M("#ffd24d", metal=0.8, rough=0.3), front=0.18)
    box(603, 318, 627, 324, 0.2, M("#434a7d", rough=0.5), front=0.1, bevel=0.01)
    sphere(615, 268, 17, M("#10163a", rough=0.4), front=0.18)
    for (dx, dy) in ((-6, -6), (7, -2), (-2, 6), (6, 9), (-9, 4)):
        sphere(615 + dx, 268 + dy, 1.6, M("#fff4c0", emit=5.0), front=0.19)
    door("#2a2f55", "#ffd24d", s, "porthole", "#cfe8ff", "#ffd24d")
    robot()


def castle(s):
    base(("#cfc7b8", "#a39b8c", 5.0), ("#8a8579", "#7a7569", 14.0), "#fff1d0")
    stone = M("#9c9486", rough=0.8)
    # a: erb na zdi
    box(120, 74, 220, 150, 0.1, M("#c0392b", rough=0.55), bevel=0.02)
    box(120, 74, 170, 112, 0.04, M("#f6f0e0", rough=0.55), front=0.1, bevel=0.004)
    box(170, 112, 220, 150, 0.04, M("#f6f0e0", rough=0.55), front=0.1, bevel=0.004)
    cone(170, 168, 50, 36, M("#c0392b", rough=0.55), front=0.0).rotation_euler = (math.radians(180), 0, 0)
    for (dx, dy) in ((145, 93), (195, 131)):
        sphere(dx, dy, 8, M("#ffc933", metal=0.7, rough=0.3), front=0.14, sz=0.5)
    cyl(170, 66, 20, 6, M("#ffc933", metal=0.8, rough=0.3), front=0.04)
    for xx in (82, 258):
        box(xx - 8, 72, xx + 8, 180, 0.04, M("#3248f0", rough=0.6), front=0.06, bevel=0.004)
        cone(xx, 198, 8, 22, M("#3248f0", rough=0.6), front=0.0).rotation_euler = (math.radians(180), 0, 0)
    # b: zbrojnice
    cabinet(s, "#4a3a2a", "#5f4a36", "#c9a46a", "#2a2018", ["#b8c4d6", "#c0392b", "#3b82f6", "#ffc933"])
    # c: rytířský stůl
    desk(80, 290, 336, "#6b4a2a")
    box(112, 326, 210, 336, 0.34, M("#f3e4c0", rough=0.8), front=0.12, bevel=0.01)
    cyl(112, 331, 5, 0.3, M("#e0c890", rough=0.8), axis="y", front=0.12)
    box(124, 329, 196, 331, 0.01, M("#9c8c6d"), front=0.47, bevel=0)
    cyl(250, 306, 6, 26, M("#fff4d6", rough=0.6), front=0.22)
    sphere(250, 292, 4, M("#ffb347", emit=6.0), front=0.22, sz=1.3)
    box(238, 330, 262, 336, 0.16, M("#444a58", metal=0.7, rough=0.4), front=0.18, bevel=0.01)
    # d: vysoký výklenek s pečetí
    for a in ((464, 14, 596, 24), (464, 84, 596, 92), (464, 14, 474, 92), (586, 14, 596, 92)):
        box(*a, 0.34, M("#6f6a60", rough=0.9), bevel=0.01)
    box(474, 22, 586, 90, 0.04, M("#2a2622", rough=0.9), front=0.0, bevel=0)
    sphere(488, 34, 4, M("#ffb347", emit=6.0), front=0.1, sz=1.4)
    sphere(572, 34, 4, M("#ffb347", emit=6.0), front=0.1, sz=1.4)
    if not s["d_used"]:
        cyl(530, 66, 15, 0.08, M("#c9a46a", metal=0.7, rough=0.35), axis="y", front=0.12)
        cyl(530, 66, 10, 0.09, M("#c0392b", rough=0.4), axis="y", front=0.12)
    # e: kolo padacího mostu
    box(482, 270, 578, 350, 0.36, M("#6b4a2a", rough=0.65), bevel=0.02)
    torus(530, 306, 30, 5, M("#8b5e3c", rough=0.6), rot=(90, 0, 0), front=0.34)
    for a in (0, 45, 90, 135):
        r = math.radians(a)
        b = box(528, 276, 532, 336, 0.06, M("#8b5e3c", rough=0.6), front=0.34, bevel=0.004)
        b.rotation_euler = (0, r, 0)
    sphere(530, 306, 8, M("#c9a46a", metal=0.8, rough=0.3), front=0.4)
    sphere(494, 282, 5, M("#3ddc97" if s["e_on"] else "#ff5a3c", emit=5.0), front=0.36)
    # examine: rytířské brnění
    box(602, 268, 628, 322, 0.24, M("#b8c4d6", metal=0.9, rough=0.3), front=0.0, bevel=0.02)
    sphere(615, 250, 14, M("#b8c4d6", metal=0.9, rough=0.25), front=0.0, sz=1.15)
    box(606, 246, 624, 252, 0.04, M("#16132b"), front=0.22, bevel=0.002)
    cyl(615, 232, 3, 18, M("#c0392b", rough=0.5), front=0.1)
    door("#5a3a24", "#6f6a60", s, "plank", "#fff1c0", "#444a58")
    robot()


ROOMS = dict(museum=museum, expedition=expedition, jungle=jungle, pirate=pirate, kitchen=kitchen, library=library, observatory=observatory, castle=castle)


# ------------------------------------------------------------------------------------------
# Ikony předmětů (256 × 256, průhledné)
# ------------------------------------------------------------------------------------------


def i_key(col="#ffc933", head=None):
    g = M(col, rough=0.25, metal=0.9)
    cyl(-40, 0, 38, 0.1, g, axis="y")
    cyl(-40, 0, 16, 0.12, M("#f6f4ee", rough=0.9), axis="y")
    box(-8, -4, 120, 4, 0.1, g, bevel=0.01)
    box(86, -4, 96, 28, 0.1, g, bevel=0.01)
    box(104, -4, 114, 20, 0.1, g, bevel=0.01)
    if head == "skull":
        sphere(-40, 0, 14, M("#f6f4ee", rough=0.5), front=0.08)
    elif head == "hat":
        cyl(-40, -6, 16, 20, M("#ffffff", rough=0.6), front=0.08)
        sphere(-40, -20, 20, M("#ffffff", rough=0.6), front=0.08, sz=0.6)


def i_coil(col):
    for i, r in enumerate((52, 40, 28)):
        torus(0, 0, r, 9, M(col, rough=0.8), rot=(90, 0, 0), front=i * 0.02)
    cyl(60, 40, 4, 40, M(col, rough=0.8))


def i_stick(col, ln=130, tilt=-20):
    o = cyl(0, 0, 8, ln, M(col, rough=0.7))
    o.rotation_euler = (0, math.radians(tilt), 0)
    return o


def i_hook(col="#b8c4d6"):
    torus(0, 10, 34, 8, M(col, metal=0.9, rough=0.3), rot=(90, 0, 0))
    box(28, -60, 44, 10, 0.12, M(col, metal=0.9, rough=0.3), bevel=0.01)
    torus(36, -64, 10, 4, M(col, metal=0.9, rough=0.3), rot=(90, 0, 0))


def i_anchor(col="#444a58"):
    g = M(col, metal=0.8, rough=0.35)
    box(-5, -70, 5, 50, 0.1, g, bevel=0.01)
    box(-45, -45, 45, -35, 0.1, g, bevel=0.01)
    torus(0, 20, 55, 6, g, rot=(90, 0, 0)).scale = (1, 1, 0.5)
    torus(0, -76, 10, 4, g, rot=(90, 0, 0))


def i_tool(stick_col, hook=True):
    i_stick(stick_col, 150, -35)
    torus(40, 80, 12, 3, M("#d9c08a", rough=0.8), rot=(90, 0, 0), front=0.04)
    box(48, 40, 52, 80, 0.04, M("#d9c08a", rough=0.8), front=0.05, bevel=0)
    if hook:
        torus(48, 94, 14, 5, M("#b8c4d6", metal=0.9, rough=0.3), rot=(90, 0, 0), front=0.04)


def i_disc(col, inner, detail=None):
    cyl(0, 0, 60, 0.12, M(col, rough=0.25, metal=0.9), axis="y")
    cyl(0, 0, 46, 0.13, M(inner, rough=0.4), axis="y", front=0.0)
    if detail == "star":
        for a in range(0, 360, 72):
            b = box(-4, -36, 4, 0, 0.02, M("#c9a46a", metal=0.8, rough=0.3), front=0.14, bevel=0)
            r = math.radians(a)
            b.location = (px(0) + 0.18 * math.sin(r), b.location.y, pz(0) + 0.18 * math.cos(r))
            b.rotation_euler = (0, -r, 0)
    elif detail == "compass":
        cone(0, -16, 7, 38, M("#e5484d"), front=0.14)
        n = cone(0, 16, 7, 38, M("#f6f4ee"), front=0.14)
        n.rotation_euler = (0, math.radians(180), 0)


def i_radio():
    box(-70, -30, 70, 60, 0.3, M("#4a5a3a", rough=0.45), bevel=0.03)
    cyl(-36, 15, 20, 0.05, M("#16132b", rough=0.3), axis="y", front=0.3)
    cyl(-36, 15, 12, 0.05, M("#ffc933", emit=2.0), axis="y", front=0.34)
    for yy in (-10, 4, 18, 32):
        box(0, yy, 52, yy + 4, 0.02, M("#16132b"), front=0.3, bevel=0)
    cyl(56, -70, 2.2, 80, M("#cfd8e3", metal=0.8, rough=0.3), front=0.1)


def i_amulet():
    torus(0, 0, 44, 8, M("#ffd24d", metal=0.9, rough=0.3), rot=(90, 0, 0))
    sphere(0, 0, 30, M("#5be7ff", emit=4.0, rough=0.1), front=0.05)
    torus(0, -52, 12, 3, M("#ffd24d", metal=0.9, rough=0.3), rot=(90, 0, 0))


def i_spoon():
    g = M("#d9a54a", rough=0.5)
    sphere(-50, 0, 30, g, front=0.0, sz=1.25)
    box(-30, -5, 110, 5, 0.1, g, bevel=0.01)


def i_fork():
    g = M("#b8c4d6", metal=0.9, rough=0.3)
    box(-70, -4, 50, 4, 0.1, g, bevel=0.01)
    for yy in (-22, -8, 6, 20):
        box(40, yy, 112, yy + 5, 0.1, g, bevel=0.005)
    box(40, -22, 52, 26, 0.1, g, bevel=0.005)


def i_card(col="#ffffff"):
    box(-82, -52, 82, 52, 0.04, M(col, rough=0.35), bevel=0.014)
    box(-82, -30, 82, -6, 0.012, M("#16132b"), front=0.04, bevel=0)
    box(-66, 14, -30, 40, 0.012, M("#ffc933", metal=0.8, rough=0.3), front=0.04, bevel=0.004)
    box(-6, 18, 62, 24, 0.012, M("#3248f0"), front=0.04, bevel=0)
    box(-6, 30, 40, 36, 0.012, M("#9c9486"), front=0.04, bevel=0)


def i_ladder(col, ln=150):
    g = M(col, rough=0.6)
    for xx in (-22, 22):
        box(xx - 5, -ln / 2, xx + 5, ln / 2, 0.1, g, bevel=0.008)
    for yy in range(int(-ln / 2) + 20, int(ln / 2) - 10, 32):
        box(-22, yy, 22, yy + 7, 0.1, M("#c9a46a", rough=0.6), front=0.0, bevel=0.005)


def i_magnet():
    g = M("#b8c4d6", metal=0.9, rough=0.3)
    box(-44, -50, -22, 40, 0.12, M("#c0392b", rough=0.4), bevel=0.01)
    box(22, -50, 44, 40, 0.12, M("#3b82f6", rough=0.4), bevel=0.01)
    box(-44, 40, 44, 62, 0.12, M("#d9a54a", metal=0.8, rough=0.3), bevel=0.01)
    box(-44, -62, -22, -50, 0.12, g, bevel=0.005)
    box(22, -62, 44, -50, 0.12, g, bevel=0.005)


def i_magtool():
    i_stick("#cfd8e3", 150, -35)
    box(40, 82, 82, 104, 0.12, M("#c0392b", rough=0.4), front=0.04, bevel=0.01)
    box(40, 100, 82, 112, 0.12, M("#b8c4d6", metal=0.9, rough=0.3), front=0.04, bevel=0.005)


def i_seal():
    cyl(0, 0, 54, 0.12, M("#c9a46a", metal=0.7, rough=0.35), axis="y")
    cyl(0, 0, 42, 0.13, M("#c0392b", rough=0.4), axis="y", front=0.0)
    for a in range(0, 360, 72):
        b = box(-4, -30, 4, 0, 0.02, M("#ffd24d", metal=0.8, rough=0.3), front=0.14, bevel=0)
        r = math.radians(a)
        b.location = (px(0) + 0.15 * math.sin(r), b.location.y, pz(0) + 0.15 * math.cos(r))
        b.rotation_euler = (0, -r, 0)


NOTES = {i: i for i in (1, 2, 3, 4)}


def i_note(n):
    p = box(-70, -90, 70, 90, 0.04, M("#fff4d6", rough=0.8), bevel=0.01)
    p.rotation_euler = (0, math.radians(8), math.radians(-6))
    bpy.ops.object.text_add(location=(px(0), -0.05, pz(0)), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object
    t.data.body = str(n)
    t.data.size = 1.0
    t.data.align_x = "CENTER"
    t.data.align_y = "CENTER"
    t.data.extrude = 0.02
    t.location = (px(0), -0.1, pz(0) - 0.05)
    t.data.materials.append(M("#3248f0", rough=0.4))
    for yy in (-60, 60):
        box(-52, yy, 52, yy + 4, 0.012, M("#c9b8a0", rough=0.9), front=0.04, bevel=0)


ICONS = {
    "museum": dict(
        key=lambda: i_key("#c0c8d4"),
        partB=lambda: i_coil("#d9c08a"),
        partC=lambda: i_hook(),
        tool=lambda: i_tool("#8b5e3c"),
        card=lambda: i_disc("#ffd24d", "#c9a46a", "star"),
    ),
    "expedition": dict(
        key=lambda: i_key("#c9a24a"),
        partB=lambda: i_coil("#b98a5a"),
        partC=lambda: i_anchor(),
        tool=lambda: i_tool("#6b4a2a"),
        card=lambda: i_radio(),
    ),
    "jungle": dict(
        key=lambda: i_key("#8b5e3c"),
        partB=lambda: i_coil("#3d9a4a"),
        partC=lambda: i_stick("#7a5230", 150, -25),
        tool=lambda: i_tool("#7a5230", hook=True),
        card=lambda: i_amulet(),
    ),
    "pirate": dict(
        key=lambda: i_key("#9c8c6d", "skull"),
        partB=lambda: i_coil("#d9c08a"),
        partC=lambda: i_hook("#444a58"),
        tool=lambda: i_tool("#5a3d27"),
        card=lambda: i_disc("#ffd24d", "#fffaf0", "compass"),
    ),
    "library": dict(
        key=lambda: i_key("#c9a24a"),
        partB=lambda: i_ladder("#7a4b2a", 110),
        partC=lambda: i_ladder("#8b5e3c", 110),
        tool=lambda: i_ladder("#7a4b2a", 170),
        card=lambda: i_card("#ffffff"),
    ),
    "observatory": dict(
        key=lambda: i_key("#c0c8d4"),
        partB=lambda: i_magnet(),
        partC=lambda: i_stick("#cfd8e3", 150, -25),
        tool=lambda: i_magtool(),
        card=lambda: i_card("#dfe8ff"),
    ),
    "castle": dict(
        key=lambda: i_key("#444a58"),
        partB=lambda: i_hook("#6f6a60"),
        partC=lambda: i_coil("#b98a5a"),
        tool=lambda: i_tool("#b98a5a", hook=True),
        card=lambda: i_seal(),
    ),
    "kitchen": dict(
        key=lambda: i_key("#c0c8d4", "hat"),
        partB=lambda: i_spoon(),
        partC=lambda: i_fork(),
        tool=lambda: i_tool("#8b5e3c", hook=False),
        card=lambda: i_card("#ffffff"),
    ),
}


def run_room(name):
    out = os.path.join(OUT, name)
    os.makedirs(out, exist_ok=True)
    only = os.environ.get("PART")
    jobs = [("bg", DEFAULT)] + [("st_" + k, v) for k, v in STATES.items()]
    for job, state in jobs:
        if only and only != job:
            continue
        ROOMS[name](state)
        render(os.path.join(out, job + ".png"))
        print("OK", name, job, flush=True)
    if only and only != "icons":
        return
    for iid, fn in ICONS[name].items():
        icon_scene()
        fn()
        render(os.path.join(out, "it_" + iid + ".png"), 256, 256)
        print("OK", name, "icon", iid, flush=True)
    if name == "museum":  # poznámky jsou ve všech místnostech stejné, vyrenderují se jednou
        for n in (1, 2, 3, 4):
            icon_scene()
            i_note(n)
            render(os.path.join(out, f"it_note{n}.png"), 256, 256)
            print("OK note", n, flush=True)


if __name__ == "__main__":
    for r in ROOMS:
        if ONLY_ROOM and ONLY_ROOM != r:
            continue
        run_room(r)
