"""Render druhých místností únikovek (kostra `src/lib/escape/rooms/inner.ts`).

    blender -b --python umime-art/scripts/escape_inner.py -- <výstupní složka> [místnost]
    python umime-art/scripts/escape_inner.py <výstupní složka> [místnost]        (modul bpy)

Místností je devět: muzeum, expedice, džungle, pirát, kuchyně, knihovna, observatoř, hrad a laboratoř.
Každá vznikne ve složce `<výstupní složka>/<místnost>-2/` (stejné id jako `room.id` ve hře):
    bg.png           celá místnost ve výchozím stavu, 1600 × 900
    st_<stav>.png    stavy po vyřešení: b_open (zámek s přihrádkou), d_used (panel s kartou), door_open
    it_<id>.png      předměty do inventáře: key, card, note1, note2, note3 (256 × 256, průhledné)

Převod do `public/escape/<místnost>-2/` dělá `escape_inner_publish.py`.

Souřadnice odpovídají SVG 800 × 450 (1 jednotka = 100 px v Blenderu, jako u `escape_rooms.py`).
Každé klikací místo má obdélník z `inner.ts`, předměty do něj sedí:
    a 50,50 180×130 · b 270,160 150×150 · c 50,250 200×120 · d 455,50 145×125
    door 640,110 125×275 · examine 470,240 115×120 · robot 300,330 90×90
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import escape_rooms as E  # noqa: E402  (base, door, desk, robot, ikony předmětů a poznámek z první místnosti)
import lab as L  # noqa: E402  (mat, box, cyl, sphere, cone, flask, render, icon_scene; ikony klíče a karty laboratoře)
from lab import box, cyl, sphere, cone, mat, px, pz, flask  # noqa: E402
torus = E.torus

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "escape_inner_out"
ONLY_ROOM = set(filter(None, (ARGS[1] if len(ARGS) > 1 else os.environ.get("ROOM_ONLY", "")).split(",")))
ONLY_JOB = os.environ.get("PART")
SAMPLES = int(os.environ.get("SAMPLES", "40"))

INK = "#16132b"
FLOOR = 384  # horní hrana podlahy (px), na kterou stojí předměty u země
STATES = ("b_open", "d_used", "door_open")
DEFAULT = dict(b_open=False, d_used=False, door_open=False)


def M(c, **k):
    return mat(c, **k)


def shoot(path, w=1600, h=900):
    bpy.context.scene.cycles.samples = SAMPLES
    L.render(path, w, h)


# --------------------------------------------------------------------------------------------
# Pomocné tvary (souřadnice v px SVG)
# --------------------------------------------------------------------------------------------


def plate(x0, y0, x1, y1, col, depth=0.08, front=0.0, rough=0.5, bevel=0.01, metal=0.0):
    return box(x0, y0, x1, y1, depth, M(col, rough=rough, metal=metal), front=front, bevel=bevel)


def frame(x0, y0, x1, y1, col, t=8, depth=0.1, front=0.0):
    for a in ((x0, y0, x1, y0 + t), (x0, y1 - t, x1, y1), (x0, y0, x0 + t, y1), (x1 - t, y0, x1, y1)):
        box(*a, depth, M(col, rough=0.45, metal=0.3), front=front, bevel=0.005)


def chest(s, x0, y0, x1, y1, body, trim, inside, contents, lock="#ffc933"):
    """Zamčená schránka (truhla, trezor, skříňka). Zavřená má zámek, otevřená ukazuje vnitřek s obsahem."""
    b = M(body, rough=0.55)
    t = M(trim, rough=0.35, metal=0.6)
    my = (y0 + y1) / 2
    mx = (x0 + x1) / 2
    if not s["b_open"]:
        box(x0, y0, x1, y1, 0.34, b, bevel=0.02)
        box(x0, my - 5, x1, my + 5, 0.36, t, front=0.0, bevel=0.004)
        box(mx - 9, my - 14, mx + 9, my + 8, 0.05, t, front=0.34, bevel=0.004)
        sphere(mx, my - 4, 4, M(lock, metal=0.8, rough=0.3), front=0.39)
    else:
        box(x0, y0 + 26, x1, y1, 0.32, b, bevel=0.02)
        box(x0 + 8, y0 + 40, x1 - 8, y1 - 8, 0.02, M(inside, rough=0.9), front=0.31, bevel=0)
        box(x0 - 4, y0 - 34, x1 + 4, y0 + 26, 0.05, b, front=0.0, bevel=0.01)  # víko odklopené vzadu
        n = len(contents)
        for i, c in enumerate(contents):
            cx = x0 + 26 + (i * (x1 - x0 - 52)) / max(1, n - 1)
            cy = y0 + 62 + (i % 2) * 22
            sphere(cx, cy, 9, M(c, metal=0.6, rough=0.3), front=0.3)


def stand(cx, base_y, r, h, m):
    """Válec stojící na zemi nebo na ploše v px (base_y je spodní hrana)."""
    return cyl(cx, base_y - h / 2, r, h, m, front=0.0, bevel=0.005)


def shelf(x0, x1, y, col="#7a6f60", depth=0.4):
    box(x0, y, x1, y + 10, depth, M(col, rough=0.7), front=0.0, bevel=0.01)


def screen(x0, y0, x1, y1, on, col_off="#1b2b4a", col_on="#3ddc97", front=0.14):
    box(x0, y0, x1, y1, 0.02, M(col_on if on else col_off, rough=0.2, emit=2.5 if on else 0.0), front=front, bevel=0)


def dial_lines(cx, cy, r, col=INK, n=12, front=0.12):
    for i in range(n):
        a = math.radians(i * 360 / n)
        b = box(-1.5, -r * 0.16, 1.5, 0, 0.012, M(col), front=front, bevel=0)
        b.location = (px(cx) + (r * 0.84) / 100 * math.sin(a), b.location.y, pz(cy) + (r * 0.84) / 100 * math.cos(a))
        b.rotation_euler = (0, -a, 0)


def scene(wall, floor, mortar_w, mortar_f, sun="#fff1dc"):
    E.base((wall, mortar_w, 4.0), (floor, mortar_f, 14.0), sun)


# --------------------------------------------------------------------------------------------
# Místnosti (každá má a, b, c, d, examine, dveře a robota v obdélnících z inner.ts)
# --------------------------------------------------------------------------------------------


def museum(s):
    scene("#ddd6c8", "#9a8f7c", "#c8bda9", "#877c6b")
    # a: kamenná deska s vytesaným textem
    plate(56, 58, 224, 176, "#cfc8b8", depth=0.1, rough=0.8)
    for i in range(4):
        box(74, 80 + i * 22, 206 - (i % 2) * 40, 88 + i * 22, 0.015, M("#5e5548", rough=0.9), front=0.1, bevel=0)
    sphere(200, 160, 5, M("#a8865a", metal=0.5, rough=0.4), front=0.1)
    # b: kamenná truhla na polici
    shelf(262, 428, 300, depth=0.4)
    chest(s, 278, 188, 414, 300, "#9c9486", "#c9a46a", "#2c2620", ["#ffd24d", "#e8c47a", "#f6f0e0"])
    # c: sochy panovníků na stole
    E.desk(52, 248, 300, "#7a7166", depth=0.6)
    for i, c in enumerate(["#cfc8b8", "#c4bba6", "#b9b09a"]):
        x = 92 + i * 56
        stand(x, 300, 14, 46, M(c, rough=0.8))
        sphere(x, 240, 13, M(c, rough=0.8), front=0.15)
    # d: model orloje s otvorem pro medaili
    frame(452, 48, 604, 178, "#c9a46a", t=8, depth=0.1)
    plate(462, 58, 594, 168, "#3a3f5a", depth=0.06, rough=0.6)
    cyl(527, 110, 46, 0.05, M("#f6f0e0", rough=0.5), axis="y", front=0.08)
    dial_lines(527, 110, 46, n=12, front=0.14)
    box(525, 84, 529, 110, 0.012, M(INK), front=0.16, bevel=0)
    box(527, 108, 546, 112, 0.012, M(INK), front=0.16, bevel=0)
    plate(515, 158, 539, 170, "#2a2f45", depth=0.04, front=0.12)
    if s["d_used"]:
        cyl(527, 164, 10, 0.05, M("#ffd24d", rough=0.25, metal=0.9, emit=1.5), axis="y", front=0.16)
    # examine: vyschlá studna
    stand(527, FLOOR, 44, 80, M("#a39a88", rough=0.85))
    cyl(527, 344, 36, 4, M("#2a3a4a", rough=0.2), front=0.0)
    for x in (497, 557):
        box(x - 3, 280, x + 3, 344, 0.1, M("#6b4a2a", rough=0.7), front=0.0, bevel=0)
    box(486, 262, 568, 280, 0.14, M("#8b5e3c", rough=0.6), front=0.0, bevel=0.01)
    E.door("#6b3f23", "#c9a46a", s, "double")
    E.robot()


def expedition(s):
    scene("#f1d7a6", "#8b6b3e", "#e0c48c", "#7a5c33", "#fff4d0")
    # a: palubní deska s kompasem
    plate(50, 50, 230, 180, "#4a3a2a", depth=0.12, rough=0.6)
    cyl(140, 115, 50, 0.06, M("#c9a24a", metal=0.8, rough=0.3), axis="y", front=0.12)
    cyl(140, 115, 42, 0.03, M("#fffaf0", rough=0.5), axis="y", front=0.18)
    cone(140, 88, 6, 30, M("#ff5a3c", rough=0.3), front=0.22)
    sp = cone(140, 142, 6, 30, M("#f6f4ee", rough=0.3), front=0.22)
    sp.rotation_euler = (0, math.radians(180), 0)
    # b: zamčená přihrádka v palubní desce
    chest(s, 278, 188, 414, 300, "#5a6b3a", "#c9a24a", "#2a3a1f", ["#d98e4a", "#f6f4ee", "#ffc933"])
    shelf(262, 428, 300, col="#4a3a2a")
    # c: mapy na sedadle
    E.desk(52, 248, 300, "#8b5e3c", depth=0.6)
    for i, c in enumerate(["#3248f0", "#c0392b", "#17a864", "#ffc933"]):
        box(70 + i * 22, 262 + (i % 2) * 8, 110 + i * 22, 300, 0.3, M(c, rough=0.6), front=0.15, bevel=0.008)
    # d: navigace s mapami
    plate(455, 50, 600, 172, "#2a3440", depth=0.14, rough=0.4)
    screen(468, 64, 586, 132, s["d_used"], front=0.14)
    for i, c in enumerate(["#ffc933", "#ff5a3c", "#3b82f6"]):
        sphere(494 + i * 26, 152, 6, M(c, rough=0.3), front=0.14)
    # examine: kanystr s benzínem
    box(490, 300, 566, FLOOR, 0.3, M("#d9534f", rough=0.5), bevel=0.03)
    box(516, 284, 540, 300, 0.12, M("#c0443f", rough=0.5), bevel=0.01)
    E.door("#7a5a3a", "#c9a24a", s, "plank", "#fff0b0", "#6b4a2a")
    E.robot()


def jungle(s):
    scene("#b7cfa0", "#5f6f4a", "#a1bb8a", "#4d5d3b")
    # a: nástěnná malba s netopýry
    plate(56, 58, 224, 176, "#e2c48a", depth=0.06, rough=0.7)
    frame(56, 58, 224, 176, "#6b4a2a", t=6, depth=0.1)
    for (x, y, r) in ((110, 110, 22), (176, 96, 17), (150, 146, 19)):
        sphere(x, y, r, M("#16132b", rough=0.7), front=0.1, sz=0.35)
        sphere(x - r * 0.9, y, r * 0.8, M("#16132b", rough=0.7), front=0.1, sz=0.3)
        sphere(x + r * 0.9, y, r * 0.8, M("#16132b", rough=0.7), front=0.1, sz=0.3)
    # b: kamenná truhla na podstavci
    shelf(262, 428, 300, col="#6f6a5f", depth=0.4)
    chest(s, 278, 188, 414, 300, "#8a8a7a", "#c9a13d", "#2f2a20", ["#7ee0b0", "#ffd24d", "#e3d4ff"])
    # c: kamenný reliéf s potravním řetězcem (deska na stole)
    E.desk(52, 248, 300, "#6f6a5f", depth=0.6)
    box(60, 262, 240, 300, 0.12, M("#9c9486", rough=0.85), front=0.15, bevel=0.01)
    for i, c in enumerate(["#3d9a4a", "#ffc933", "#8b5e3c", "#e5484d"]):
        sphere(84 + i * 46, 280, 9, M(c, rough=0.5), front=0.28)
    # d: oltář s prázdným místem na brouka
    plate(466, 104, 590, 124, "#8f8a7a", depth=0.2, front=0.0, rough=0.8)
    plate(478, 124, 578, FLOOR - 40, "#7d7868", depth=0.3, front=0.0, rough=0.85)
    cyl(527, 112, 14, 0.02, M(INK, rough=0.8), axis="y", front=0.2)
    if s["d_used"]:
        sphere(527, 112, 12, M("#ffd24d", metal=0.9, rough=0.25, emit=1.2), front=0.2, sz=0.6)
    # examine: socha jaguára
    sphere(527, 330, 38, M("#9c8c6d", rough=0.7), front=0.0, sz=1.25)
    sphere(527, 280, 24, M("#9c8c6d", rough=0.7), front=0.0)
    cone(512, 258, 7, 16, M("#9c8c6d", rough=0.7), front=0.12)
    cone(542, 258, 7, 16, M("#9c8c6d", rough=0.7), front=0.12)
    for ex in (518, 536):
        sphere(ex, 280, 4, M("#ffd24d", emit=2.5), front=0.24)
    E.door("#8f9a82", "#6f7a62", s, "stone", "#d8ffb0")
    E.robot()


def pirate(s):
    scene("#a9d4ef", "#9c6b3f", "#8fc1e2", "#7a4d2c", "#ffe9c4")
    # a: černá vlajka s pirátským znakem
    cyl(56, 138, 4, 160, M("#8b5e3c", rough=0.6), front=0.0)
    plate(66, 62, 220, 150, "#16132b", depth=0.03, front=0.06, rough=0.7, bevel=0)
    box(118, 92, 168, 100, 0.01, M("#fffaf0", rough=0.5), front=0.1, bevel=0).rotation_euler = (0, math.radians(35), 0)
    box(118, 92, 168, 100, 0.01, M("#fffaf0", rough=0.5), front=0.1, bevel=0).rotation_euler = (0, math.radians(-35), 0)
    sphere(143, 124, 15, M("#fffaf0", rough=0.5), front=0.1, sz=1.0)
    # b: bedna se zásobami
    shelf(262, 428, 300, col="#5a3d27", depth=0.4)
    chest(s, 278, 188, 414, 300, "#8b5a2b", "#444a58", "#2a1d12", ["#ffd24d", "#c0392b", "#f6f0e0"])
    # c: kapitánův deník na stole
    E.desk(52, 248, 300, "#5a3d27", depth=0.6)
    box(74, 270, 226, 300, 0.1, M("#efe3cc", rough=0.8), front=0.15, bevel=0.01)
    box(146, 270, 150, 300, 0.12, M("#8b5e3c", rough=0.6), front=0.15, bevel=0)
    box(96, 276, 134, 282, 0.01, M("#16132b"), front=0.27, bevel=0)
    box(160, 276, 210, 282, 0.01, M("#16132b"), front=0.27, bevel=0)
    cyl(230, 286, 8, 24, M("#c0392b", rough=0.4), front=0.2)
    # d: kormidlo
    plate(470, 58, 586, 66, "#8b5e3c", depth=0.06, front=0.0, rough=0.7)
    cyl(527, 116, 4, 0.12, M("#6b4a2a", rough=0.6), axis="y", front=0.02)
    torus(527, 112, 50, 6, M("#8b5e3c", rough=0.6), rot=(90, 0, 0), front=0.1)
    for a in (0, 60, 120):
        r = math.radians(a)
        b = box(-40, -4, 40, 4, 0.08, M("#8b5e3c", rough=0.6), front=0.1, bevel=0.003)
        b.location = (px(527), b.location.y, pz(112))
        b.rotation_euler = (0, r, 0)
    cyl(527, 112, 10, 0.1, M("#ffd24d" if s["d_used"] else "#6b4a2a", metal=0.8, rough=0.3, emit=2.0 if s["d_used"] else 0.0), axis="y", front=0.14)
    # examine: kotva opřená o zeď
    cyl(527, 300, 6, 120, M("#444a58", metal=0.8, rough=0.35), front=0.0)
    box(495, 290, 559, 298, 0.08, M("#444a58", metal=0.8, rough=0.35), front=0.0, bevel=0.005)
    torus(527, 350, 22, 6, M("#444a58", metal=0.8, rough=0.35), rot=(90, 0, 0), front=0.0)
    E.door("#4a3322", "#c9a46a", s, "porthole", "#fff0c0", "#c9a24a")
    E.robot()


def kitchen(s):
    scene("#f6e3d3", "#a8705a", "#e6cdb9", "#8f5e4a")
    # a: tabule s jídelním lístkem
    frame(54, 56, 226, 178, "#8b5e3c", t=8, depth=0.08)
    plate(62, 64, 218, 170, "#2f3a33", depth=0.05, front=0.0, rough=0.7)
    for i, w in enumerate((120, 96, 130, 80)):
        box(80, 80 + i * 22, 80 + w, 88 + i * 22, 0.01, M("#f6f4ee", rough=0.6), front=0.06, bevel=0)
    # b: pokladna
    shelf(262, 428, 300, col="#7a7166", depth=0.4)
    chest(s, 278, 188, 414, 300, "#c0c8d4", "#d9534f", "#2a2f38", ["#ffd24d", "#f6f4ee", "#d9534f"])
    box(300, 212, 392, 232, 0.02, M("#0e1a3a", rough=0.3), front=0.36, bevel=0)
    # c: stůl s dortem
    E.desk(52, 248, 300, "#8b5e3c", depth=0.6)
    stand(150, 300, 52, 14, M("#f6f0e0", rough=0.5))
    stand(150, 286, 42, 12, M("#8a3b2e", rough=0.6))
    stand(150, 274, 30, 10, M("#f6f0e0", rough=0.5))
    cyl(150, 262, 6, 6, M("#ff8fb3", rough=0.4), front=0.0)
    for i, c in enumerate(["#f6f0e0", "#ffc2d6", "#f6f0e0"]):
        box(200 + i * 14, 286, 210 + i * 14, 300, 0.12, M(c, rough=0.5), front=0.15, bevel=0.005)
    # d: automat u dveří
    plate(470, 56, 586, 172, "#3b82f6", depth=0.18, rough=0.4)
    screen(486, 72, 570, 112, s["d_used"], col_off="#0e1a3a", front=0.2)
    for i in range(3):
        sphere(496 + i * 26, 136, 6, M(["#ffc933", "#ff5a3c", "#17a864"][i], rough=0.3), front=0.2)
    box(500, 150, 556, 158, 0.02, M("#16132b"), front=0.2, bevel=0)
    # examine: fíkus v květináči
    stand(527, FLOOR, 34, 52, M("#d9744a", rough=0.7))
    cyl(527, 300, 2.5, 60, M("#6b4a2a", rough=0.8), front=0.0)
    for (dx, dy, r) in ((-22, 280, 18), (0, 268, 22), (22, 280, 18), (-10, 250, 16), (12, 248, 16)):
        sphere(527 + dx, dy, r, M("#3f9c3a", rough=0.55), front=0.0, sz=0.8)
    E.door("#7a4b2a", "#c0c8d4", s, "window", "#bfe8ff", "#8b5e3c")
    E.robot()


def library(s):
    scene("#d9c9b0", "#6e5640", "#c9b89d", "#5a4532")
    # a: rukopis na pultku
    box(96, 150, 190, 180, 0.12, M("#8b5e3c", rough=0.6), front=0.0, bevel=0.01).rotation_euler = (math.radians(-18), 0, 0)
    plate(92, 96, 214, 172, "#7a5a3a", depth=0.03, front=0.0, rough=0.7)
    plate(104, 104, 202, 160, "#f4ead2", depth=0.02, front=0.1, rough=0.85, bevel=0)
    for i in range(5):
        box(114, 112 + i * 9, 190 - (i % 2) * 22, 116 + i * 9, 0.01, M("#3a2a1a", rough=0.9), front=0.12, bevel=0)
    # b: truhla s rukopisy
    shelf(262, 428, 300, col="#4a3322", depth=0.4)
    chest(s, 278, 188, 414, 300, "#6b4a2a", "#c9a46a", "#2a1d12", ["#e8d5a0", "#f4ead2", "#c9a24a"])
    # c: rozsypané kartičky na stole
    E.desk(52, 248, 300, "#5a3d27", depth=0.6)
    for i in range(6):
        x = 70 + (i % 3) * 58
        y = 262 + (i // 3) * 16
        box(x, y, x + 46, y + 10, 0.06, M("#ffffff", rough=0.5), front=0.15, bevel=0.003).rotation_euler = (0, 0, math.radians(-8 + i * 4))
    # d: čtecí lampa na zdi
    plate(590, 180, 600, 260, "#3a2a1a", depth=0.04, front=0.0)
    cone(528, 120, 34, 40, M("#3a2a1a", rough=0.6), front=0.18, r_top=18)
    cyl(528, 150, 2, 20, M("#16132b"), front=0.12)
    sphere(528, 145, 8, M("#fff7d6", emit=4.0 if s["d_used"] else 0.0, rough=0.3), front=0.2)
    box(470, 118, 586, 128, 0.02, M("#f4ead2" if not s["d_used"] else "#fff7d6", emit=2.0 if s["d_used"] else 0.0), front=0.3, bevel=0)
    # examine: pavouk v rohu
    cyl(540, 240, 0.6, 60, M("#e8e8e8", rough=0.9), front=0.1)
    sphere(540, 304, 12, M("#16132b", rough=0.6), front=0.12)
    for i in range(4):
        a = math.radians(-60 + i * 40)
        box(540 - 20, 300 + i * 4, 540 + 20, 302 + i * 4, 0.01, M("#16132b", rough=0.7), front=0.12, bevel=0).rotation_euler = (0, 0, a)
    E.door("#5a3d27", "#c9a46a", s, "double")
    E.robot()


def observatory(s):
    scene("#8e9ad8", "#4a4f6a", "#7c88c8", "#3d4259", "#e8ecff")
    # a: plakát kosmonauta
    plate(56, 58, 224, 176, "#ff8a3d", depth=0.05, rough=0.5)
    frame(56, 58, 224, 176, "#f6f4ee", t=6, depth=0.07)
    sphere(140, 116, 34, M("#f6f4ee", rough=0.3), front=0.1)
    plate(120, 106, 160, 128, "#16132b", depth=0.02, front=0.14, rough=0.1, bevel=0)
    box(96, 150, 184, 170, 0.14, M("#f6f4ee", rough=0.5), front=0.05, bevel=0.01)
    # b: skříňka se skafandry
    shelf(262, 428, 300, col="#8f9aaa", depth=0.4)
    chest(s, 278, 188, 414, 300, "#cfd8e3", "#ff8a3d", "#2a2f45", ["#ff8a3d", "#f6f4ee", "#3b82f6"])
    # c: fotky Měsíce na stole
    E.desk(52, 248, 300, "#6f7a95", depth=0.6)
    for i in range(4):
        box(70 + i * 16, 262 + i * 4, 110 + i * 16, 300, 0.05, M("#dfe3ea", rough=0.6), front=0.15 + i * 0.01, bevel=0.003)
    sphere(218, 270, 22, M("#c9c9c4", rough=0.9), front=0.15)
    # d: řídicí pult
    plate(455, 56, 600, 172, "#2a2f45", depth=0.16, rough=0.4)
    screen(468, 68, 586, 118, s["d_used"], col_off="#16244a", col_on="#ff8a3d", front=0.16)
    for i in range(4):
        sphere(478 + i * 28, 140, 6, M(["#ff5a3c", "#ffc933", "#3ddc97", "#3b82f6"][i], rough=0.3, emit=1.5 if s["d_used"] and i == 0 else 0.0), front=0.16)
    box(470, 158, 586, 164, 0.02, M("#5a6a8a", rough=0.5), front=0.16, bevel=0)
    # examine: meteorit na podstavci
    stand(527, FLOOR, 48, 36, M("#6f6a60", rough=0.8))
    sphere(527, FLOOR - 66, 42, M("#4a4038", rough=0.9), front=0.0, sz=0.82)
    sphere(514, FLOOR - 78, 9, M("#8f8478", rough=0.9), front=0.05)
    E.door("#e9eef5", "#8f9aaa", s, "porthole", "#bfe8ff", "#ff8a3d")
    E.robot()


def castle(s):
    scene("#bdb5a6", "#6f6a5f", "#aca496", "#5f5a50", "#ffe7c0")
    # a: tapiserie s bitvou
    plate(56, 58, 224, 176, "#8a3b2e", depth=0.04, rough=0.9)
    frame(56, 58, 224, 176, "#c9a46a", t=8, depth=0.07)
    for i in range(3):
        box(90 + i * 42, 96, 110 + i * 42, 152, 0.01, M("#d9a54a", rough=0.8), front=0.06, bevel=0)
    box(70, 160, 210, 166, 0.01, M("#c9a46a", metal=0.5, rough=0.4), front=0.06, bevel=0)
    # b: truhla s listinami
    shelf(262, 428, 300, col="#4a3322", depth=0.4)
    chest(s, 278, 188, 414, 300, "#5a3d27", "#c9a46a", "#2a1d12", ["#f6f0e0", "#e8d5a0", "#ffc933"])
    # c: rodokmen na stole (svitek)
    E.desk(52, 248, 300, "#6b4a2a", depth=0.6)
    cyl(120, 284, 12, 56, M("#f1e3bd", rough=0.8), axis="z", front=0.0).rotation_euler = (0, math.radians(90), 0)
    cyl(200, 290, 10, 40, M("#f1e3bd", rough=0.8), axis="z", front=0.0).rotation_euler = (0, math.radians(90), 0)
    box(70, 262, 226, 274, 0.12, M("#f1e3bd", rough=0.8), front=0.15, bevel=0.005)
    # d: kamenný reliéf s prstenem
    plate(452, 52, 604, 176, "#a39d8e", depth=0.16, rough=0.85)
    torus(527, 112, 40, 6, M("#7d7868", rough=0.85), rot=(90, 0, 0), front=0.16)
    cyl(527, 112, 26, 0.03, M("#3a362e", rough=0.9), axis="y", front=0.16)
    if s["d_used"]:
        torus(527, 112, 30, 5, M("#ffd24d", metal=0.9, rough=0.25, emit=1.2), rot=(90, 0, 0), front=0.2)
    # examine: krb
    box(470, 296, 586, FLOOR, 0.36, M("#8a8378", rough=0.9), bevel=0.02)
    box(494, 318, 562, FLOOR - 2, 0.04, M("#2a1d12", rough=0.9), front=0.34, bevel=0)
    for i, (dx, c) in enumerate(((-16, "#ff8a3d"), (0, "#ffc933"), (16, "#ff5a3c"))):
        cone(527 + dx, 350, 6, 22, M(c, emit=5.0), front=0.3)
    E.door("#4a3322", "#6f6a5f", s, "stone", "#ffb347", "#8a8a7a")
    E.robot()


def lab(s):
    scene("#d3e4ea", "#6f7f8a", "#b6cad3", "#5a6973", "#fff1dc")
    # a: výstražné značky
    plate(60, 66, 220, 170, "#ffc933", depth=0.04, rough=0.4)
    frame(60, 66, 220, 170, "#16132b", t=6, depth=0.05)
    cone(140, 120, 40, 60, M("#ffc933", rough=0.4), front=0.07, r_top=0.0)
    sphere(140, 132, 9, M("#ff5a3c", emit=3.0, rough=0.3), front=0.12)
    # b: trezor s chemikáliemi
    shelf(262, 428, 300, col="#7f8c96", depth=0.4)
    chest(s, 278, 188, 414, 300, "#4a5a66", "#3fb6a8", "#1d2a33", ["#ffc933", "#d9dde2", "#ff8a3d"])
    # c: stůl s pH papírky a lahvemi
    E.desk(52, 248, 300, "#7f8c96", depth=0.6)
    for i, (c, h) in enumerate((("#ff5a3c", 36), ("#9be15d", 30), ("#d8f1ff", 40), ("#3fb6a8", 34), ("#ffc933", 28))):
        flask(86 + i * 38, 300, 12, h, c)
    # d: ventilační panel
    plate(455, 52, 600, 172, "#8b99a4", depth=0.16, rough=0.4, metal=0.5)
    for yy in range(70, 160, 12):
        box(470, yy, 586, yy + 4, 0.02, M("#4a5a66", rough=0.5), front=0.16, bevel=0)
    if s["d_used"]:
        sphere(527, 112, 14, M("#3ddc97", emit=4.0, rough=0.2), front=0.18)
    else:
        sphere(527, 112, 14, M("#ff5a3c", emit=2.0, rough=0.2), front=0.18)
    # examine: hasicí přístroj
    cyl(527, FLOOR - 50, 20, 100, M("#c0443f", rough=0.4, metal=0.2), front=0.0, bevel=0.01)
    cyl(527, FLOOR - 104, 8, 10, M("#16132b", rough=0.4), front=0.0)
    box(512, FLOOR - 120, 542, FLOOR - 104, 0.04, M("#16132b", rough=0.4), front=0.0, bevel=0.005)
    cyl(540, FLOOR - 114, 2.5, 22, M("#16132b", rough=0.4), front=0.02)
    E.door("#8f9aa8", "#5a6772", s, "plain", "#bfe8ff", "#3fb6a8")
    E.robot()


ROOMS = dict(
    museum=museum,
    expedition=expedition,
    jungle=jungle,
    pirate=pirate,
    kitchen=kitchen,
    library=library,
    observatory=observatory,
    castle=castle,
    lab=lab,
)


# --------------------------------------------------------------------------------------------
# Ikony předmětů do inventáře (klíč, karta, poznámky 1 až 3)
# --------------------------------------------------------------------------------------------


def i_beetle(col="#ffd24d"):
    g = M(col, rough=0.25, metal=0.8)
    sphere(0, 0, 60, g, front=0.0, sz=0.45)
    sphere(0, -54, 40, M(col, rough=0.25, metal=0.8), front=0.0, sz=0.8)
    for i, dy in enumerate((-30, 0, 30)):
        for side in (-1, 1):
            box(side * 56, dy - 4, side * 84, dy + 4, 0.05, M("#16132b"), front=0.0, bevel=0)


def i_bulb():
    sphere(0, -10, 56, M("#fff7d6", rough=0.15, emit=1.2), front=0.0, sz=1.1)
    cyl(0, 62, 26, 34, M("#9ca8bb", metal=0.8, rough=0.3), front=0.0)
    for yy in (52, 66, 80):
        box(-24, yy, 24, yy + 4, 0.05, M("#6b7585", metal=0.6, rough=0.4), front=0.0, bevel=0)


def i_memory():
    box(-74, -58, 74, 58, 0.04, M("#cfd8e3", rough=0.3, metal=0.4), bevel=0.012)
    box(-48, -58, 48, -18, 0.05, M("#16132b"), front=0.04, bevel=0)
    box(-34, 18, 34, 46, 0.03, M("#ffc933", metal=0.8, rough=0.3), front=0.04, bevel=0)


def i_disc_star():
    E.i_disc("#ffd24d", "#c9a46a", "star")


ICONS = {
    "museum": dict(key=lambda: E.i_key("#b98a5a"), card=i_disc_star),
    "expedition": dict(key=lambda: E.i_key("#c9a24a"), card=i_memory),
    "jungle": dict(key=lambda: E.i_key("#9c8c6d"), card=i_beetle),
    "pirate": dict(key=lambda: E.i_key("#9c8c6d", "skull"), card=lambda: E.i_card("#e8d5a0")),
    "kitchen": dict(key=lambda: E.i_key("#c0c8d4"), card=lambda: E.i_card("#ffffff")),
    "library": dict(key=lambda: E.i_key("#c9a24a"), card=i_bulb),
    "observatory": dict(key=lambda: E.i_key("#c0c8d4"), card=lambda: E.i_key("#ff5a3c")),
    "castle": dict(key=lambda: E.i_key("#444a58"), card=lambda: E.i_seal()),
    "lab": dict(key=L.icon_key, card=L.icon_card),
}


def run_room(name):
    out = os.path.join(OUT, name + "-2")
    os.makedirs(out, exist_ok=True)
    jobs = [("bg", DEFAULT)] + [("st_" + k, {**DEFAULT, k: True}) for k in STATES]
    for job, state in jobs:
        if ONLY_JOB and ONLY_JOB != job:
            continue
        ROOMS[name](state)
        shoot(os.path.join(out, job + ".png"))
        print("OK", name + "-2", job, flush=True)
    if ONLY_JOB and ONLY_JOB != "icons":
        return
    for iid, fn in ICONS[name].items():
        L.icon_scene()
        fn()
        L.render(os.path.join(out, "it_" + iid + ".png"), 256, 256)
        print("OK", name + "-2", "icon", iid, flush=True)
    for n in (1, 2, 3):
        L.icon_scene()
        E.i_note(n)
        L.render(os.path.join(out, f"it_note{n}.png"), 256, 256)
        print("OK", name + "-2", "note", n, flush=True)


if __name__ == "__main__":
    for r in ROOMS:
        if ONLY_ROOM and r not in ONLY_ROOM:
            continue
        run_room(r)
