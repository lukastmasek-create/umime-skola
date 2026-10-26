"""Render Laboratoře doktora Atoma (únikovka, chemie).

Spuštění v Blenderu (4.x nebo 5.x):
    blender -b --python umime-art/scripts/lab.py -- <výstupní složka>

Nebo přes modul bpy (pip install bpy):
    python umime-art/scripts/lab.py <výstupní složka>

Výstup je sada PNG, kterou pak převede `lab_publish.py` do `public/escape/lab/`:
    bg.png          celá místnost ve výchozím stavu, 1600 × 900
    st_<stav>.png   celá místnost ve změněném stavu (výřezy dělá lab_publish.py)
    it_<id>.png     ikony předmětů do inventáře, 256 × 256, průhledné

Souřadnice scény odpovídají SVG 800 × 450 v `LabScene.tsx` (1 jednotka v Blenderu = 100 px SVG),
takže klikací místa v `rooms/lab.ts` sedí na vyrenderované předměty.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

OUT = (sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else (sys.argv[1] if len(sys.argv) > 1 else "lab_out"))
os.makedirs(OUT, exist_ok=True)

INK = "#16132b"

# Stavy, které se dají kliknutím změnit. Všechno ostatní je ve všech snímcích stejné.
DEFAULT = dict(cabinet_open=False, vent_card=True, pc_on=False, door_open=False, reactor="calm")
STATES = {
    "cabinet_open": dict(cabinet_open=True),
    "vent_used": dict(vent_card=False),
    "pc_on": dict(pc_on=True, reactor="calm"),
    "door_open": dict(door_open=True, pc_on=True),
    "reactor_warn": dict(reactor="warn"),
    "reactor_crit": dict(reactor="crit"),
}


def hexrgb(h, a=1.0):
    h = h.lstrip("#")
    return tuple(pow(int(h[i : i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (a,)


def px(x):
    return (x - 400) / 100


def pz(y):
    return (450 - y) / 100


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 40
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    scene.view_settings.view_transform = "Standard"
    scene.render.image_settings.file_format = "PNG"
    return scene


_mats = {}


def mat(color, rough=0.45, metal=0.0, emit=0.0, glass=False, alpha=1.0):
    key = (color, rough, metal, emit, glass, alpha)
    if key in _mats and _mats[key].name in bpy.data.materials:
        return _mats[key]
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexrgb(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = hexrgb(color)
        b.inputs["Emission Strength"].default_value = emit
    if glass:
        b.inputs["Transmission Weight"].default_value = 0.9
        b.inputs["Roughness"].default_value = 0.08
    _mats[key] = m
    return m


def finish(o, m, bevel=0.0):
    o.data.materials.append(m)
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width = bevel
        bv.segments = 3
        bv.limit_method = "ANGLE"
    return o


def box(x0, y0, x1, y1, depth, m, front=0.0, bevel=0.015):
    """Kvádr podle obdélníku v px SVG; `front` je vzdálenost zadní strany od stěny."""
    o = bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.scale = ((x1 - x0) / 100, depth, (y1 - y0) / 100)
    o.location = (px((x0 + x1) / 2), -(front + depth / 2), pz((y0 + y1) / 2))
    return finish(o, m, bevel)


def cyl(cx, cy, r_px, h_px_or_depth, m, axis="z", front=0.0, bevel=0.0, verts=48):
    """Válec: axis 'z' stojí nahoru (výška v px), axis 'y' míří ke kameře (hloubka v jednotkách)."""
    bpy.ops.mesh.primitive_cylinder_add(radius=r_px / 100, depth=1, vertices=verts)
    o = bpy.context.active_object
    if axis == "z":
        o.scale = (1, 1, h_px_or_depth / 100)
        o.location = (px(cx), -(front + r_px / 100), pz(cy))
    else:
        o.rotation_euler = (math.pi / 2, 0, 0)
        o.scale = (1, 1, h_px_or_depth)
        o.location = (px(cx), -(front + h_px_or_depth / 2), pz(cy))
    return finish(o, m, bevel)


def sphere(cx, cy, r_px, m, front=0.0, sz=1.0):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r_px / 100, segments=40, ring_count=24)
    o = bpy.context.active_object
    o.scale = (1, 1, sz)
    o.location = (px(cx), -(front + r_px / 100), pz(cy))
    bpy.ops.object.shade_smooth()
    return finish(o, m)


def cone(cx, cy, r_px, h_px, m, front=0.0, r_top=0.0):
    bpy.ops.mesh.primitive_cone_add(radius1=r_px / 100, radius2=r_top / 100, depth=h_px / 100, vertices=40)
    o = bpy.context.active_object
    o.location = (px(cx), -(front + r_px / 100), pz(cy))
    return finish(o, m)


def flask(cx, base_y, r, h, color, front=0.0):
    """Erlenmeyerova baňka s tekutinou: kužel + hrdlo, sklo a barevná náplň."""
    glass = mat("#d8f1ff", glass=True)
    cone(cx, base_y - h / 2, r, h * 0.7, glass, front=front, r_top=r * 0.22)
    cyl(cx, base_y - h * 0.82, r * 0.22, h * 0.34, glass, front=front + r * 0.78 / 100)
    cone(cx, base_y - h * 0.18, r * 0.82, h * 0.34, mat(color, rough=0.2), front=front + 0.02, r_top=r * 0.55)


def light(kind, loc, energy, size, color="#ffffff", rot=(0, 0, 0)):
    d = bpy.data.lights.new("l", kind)
    d.energy = energy
    if kind == "AREA":
        d.size = size
    ob = bpy.data.objects.new("l", d)
    ob.location = loc
    ob.rotation_euler = rot
    d.color = hexrgb(color)[:3]
    bpy.context.collection.objects.link(ob)
    return ob


def camera_front(w=1600, h=900):
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 8.0
    co = bpy.data.objects.new("c", cam)
    co.location = (0, -12, 2.25)
    co.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    r = bpy.context.scene.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = w, h, 100
    r.film_transparent = False


def world(color="#cfd8e3", strength=0.7):
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = hexrgb(color)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w


def brick_mat(base, mortar, scale, rough=0.4):
    m = bpy.data.materials.new("tile")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    tex = nt.nodes.new("ShaderNodeTexBrick")
    tex.inputs["Color1"].default_value = hexrgb(base)
    tex.inputs["Color2"].default_value = hexrgb(base)
    tex.inputs["Mortar"].default_value = hexrgb(mortar)
    tex.inputs["Scale"].default_value = scale
    tex.inputs["Mortar Size"].default_value = 0.012
    tex.inputs["Brick Width"].default_value = 0.5
    tex.inputs["Row Height"].default_value = 0.25
    tex.offset = 0.0
    nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    tc = nt.nodes.new("ShaderNodeNewGeometry")
    nt.links.new(tc.outputs["Position"], tex.inputs["Vector"])
    return m


def checker_mat(c1, c2, scale):
    m = bpy.data.materials.new("floor")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.3
    ch = nt.nodes.new("ShaderNodeTexChecker")
    ch.inputs["Color1"].default_value = hexrgb(c1)
    ch.inputs["Color2"].default_value = hexrgb(c2)
    ch.inputs["Scale"].default_value = scale
    nt.links.new(ch.outputs["Color"], b.inputs["Base Color"])
    tc = nt.nodes.new("ShaderNodeNewGeometry")
    nt.links.new(tc.outputs["Position"], ch.inputs["Vector"])
    return m


# --------------------------------------------------------------------------------------------
# Místnost
# --------------------------------------------------------------------------------------------


def build_room(s):
    reset()
    _mats.clear()
    world("#cfd8e3", 0.32)
    camera_front()

    # Stěna s kachlíky a podlaha s šachovnicí.
    box(-40, -40, 840, 386, 0.25, brick_mat("#c6d6e8", "#9fb3c8", 5.0), front=-0.25, bevel=0)
    box(-40, 386, 840, 500, 0.9, checker_mat("#b9a98a", "#a8987a", 18.0), front=-0.25, bevel=0)
    box(-40, 378, 840, 392, 0.12, mat("#6b7a8f", rough=0.4), front=0.0, bevel=0.02)  # lišta

    sun = light("SUN", (0, -6, 6), 3.8, 0, "#fff1dc", (math.radians(52), 0, math.radians(22)))
    sun.data.angle = math.radians(5)
    light("AREA", (-3, -6, 4), 140, 6.0, "#cfe6ff", (math.radians(80), 0, math.radians(-30)))

    # --- Periodická tabulka (70..260 × 70..210) ---
    box(70, 70, 260, 210, 0.05, mat("#f4efe2", rough=0.6), bevel=0.02)
    box(66, 66, 264, 74, 0.08, mat("#16132b", rough=0.4), bevel=0.01)
    box(66, 206, 264, 214, 0.08, mat("#16132b", rough=0.4), bevel=0.01)
    box(66, 66, 74, 214, 0.08, mat("#16132b", rough=0.4), bevel=0.01)
    box(256, 66, 264, 214, 0.08, mat("#16132b", rough=0.4), bevel=0.01)
    box(98, 74, 232, 88, 0.07, mat("#3248f0", rough=0.5), bevel=0.01)  # nadpis
    colors = ["#ffb877", "#7fc4ff", "#8fe08a", "#ff8fb3", "#bfa3ff"]
    for row in range(5):
        for col in range(10):
            x0 = 78 + col * 17.4
            y0 = 96 + row * 21
            if row == 2 and col == 6:  # chybějící čtvereček: zlato (Au)
                box(x0, y0, x0 + 15, y0 + 18, 0.02, mat("#8a7a60", rough=0.9), front=0.05, bevel=0.003)
                continue
            box(x0, y0, x0 + 15, y0 + 18, 0.04, mat(colors[(row + col) % 5], rough=0.35), front=0.05, bevel=0.006)

    # --- Skříňka s chemikáliemi (300..430 × 110..300) ---
    wood = mat("#8b5e3c", rough=0.5)
    light_wood = mat("#d6b48a", rough=0.5)
    if s["cabinet_open"]:
        # Dutá skříňka: čtyři stěny a zadní panel, aby byl vidět vnitřek.
        box(300, 110, 308, 300, 0.32, wood, bevel=0.01)
        box(422, 110, 430, 300, 0.32, wood, bevel=0.01)
        box(300, 110, 430, 118, 0.32, wood, bevel=0.01)
        box(300, 292, 430, 300, 0.32, wood, bevel=0.01)
        box(308, 118, 422, 292, 0.04, mat("#5a3d27", rough=0.9), front=0.0, bevel=0.0)
        for sy in (170, 232):
            box(308, sy, 422, sy + 6, 0.26, light_wood, front=0.05, bevel=0.01)
        bottle_cols = ["#7ee0b0", "#ff8a6b", "#bfe3ff", "#ffd24d", "#e3d4ff", "#ffc2d6"]
        for i, (bx, by) in enumerate([(328, 170), (352, 170), (394, 170), (330, 232), (360, 232), (398, 232)]):
            cyl(bx, by - 15, 9, 30, mat(bottle_cols[i], rough=0.2), front=0.1)
            cyl(bx, by - 33, 4, 8, mat("#16132b"), front=0.14)
        # Otevřená dvířka: otočená o ~105° kolem pantů, vidět ze strany jako úzké pásy.
        box(282, 114, 300, 296, 0.06, light_wood, front=0.28, bevel=0.01)
        box(430, 114, 448, 296, 0.06, light_wood, front=0.28, bevel=0.01)
    else:
        box(300, 110, 430, 300, 0.32, wood, bevel=0.02)
        box(306, 118, 362, 292, 0.05, light_wood, front=0.32, bevel=0.012)
        box(368, 118, 424, 292, 0.05, light_wood, front=0.32, bevel=0.012)
        sphere(352, 230, 8, mat("#ffc933", rough=0.25, metal=0.8), front=0.37)
        sphere(378, 230, 8, mat("#ffc933", rough=0.25, metal=0.8), front=0.37)
        # Zámek
        box(358, 232, 372, 250, 0.04, mat("#444a58", metal=0.8, rough=0.35), front=0.37, bevel=0.006)
    # Baňky na skříňce
    flask(334, 110, 14, 34, "#7ee0b0")
    flask(398, 110, 15, 40, "#ff8a6b")

    # --- Pracovní stůl (80..290 × 290..390) ---
    desk = mat("#a0714d", rough=0.45)
    box(80, 320, 290, 336, 0.62, desk, bevel=0.02)
    box(92, 336, 280, 386, 0.5, mat("#8b5e3c", rough=0.5), front=0.05, bevel=0.015)
    box(122, 346, 250, 376, 0.04, desk, front=0.55, bevel=0.01)
    sphere(185, 361, 5, mat("#ffc933", rough=0.25, metal=0.8), front=0.58)
    flask(118, 320, 17, 42, "#bfe3ff", front=0.15)
    cyl(209, 309, 11, 22, mat("#c8f0c0", glass=True), front=0.2)
    cyl(245, 306, 6, 28, mat("#ffc2d6", glass=True), front=0.22)
    # Mikroskop
    box(150, 308, 176, 320, 0.2, mat("#444a58", metal=0.7, rough=0.35), front=0.15, bevel=0.01)
    cyl(163, 296, 4, 26, mat("#d9e2ee", metal=0.5, rough=0.3), front=0.22)

    # --- Větrací mřížka a ventilátor (470..590 × 20..90) ---
    metal = mat("#cfd8e3", metal=0.6, rough=0.4)
    box(470, 20, 590, 90, 0.12, metal, bevel=0.02)
    box(478, 28, 582, 82, 0.03, mat("#2a2f3d", rough=0.8), front=0.1, bevel=0.0)
    cyl(530, 55, 20, 0.04, mat("#8794a8", metal=0.5), axis="y", front=0.11)
    for a in range(0, 360, 90):  # lopatky ventilátoru
        o = box(529, 36, 531, 55, 0.02, mat("#cfd8e3", metal=0.6), front=0.13, bevel=0.002)
        o.location = (px(530) + 0.095 * math.sin(math.radians(a)), o.location.y, pz(55) + 0.095 * math.cos(math.radians(a)))
        o.rotation_euler = (0, math.radians(-a), 0)
    for yy in (34, 46, 58, 70):
        box(480, yy - 1.5, 580, yy + 1.5, 0.06, metal, front=0.12, bevel=0.004)
    if s["vent_card"]:
        # Přístupová karta zaklíněná v mřížce.
        c = box(520, 62, 548, 86, 0.02, mat("#ffffff", rough=0.4), front=0.16, bevel=0.004)
        box(522, 70, 546, 74, 0.01, mat("#16132b"), front=0.18, bevel=0.0)
        box(523, 64, 533, 68, 0.01, mat("#ffc933", metal=0.8, rough=0.3), front=0.18, bevel=0.0)

    # --- Počítač (470..590 × 250..350) ---
    box(470, 330, 590, 352, 0.5, desk, bevel=0.02)
    box(486, 352, 574, 388, 0.4, mat("#8b5e3c"), front=0.05, bevel=0.012)
    box(480, 255, 580, 325, 0.16, mat("#1c1b33", rough=0.35), front=0.1, bevel=0.03)
    box(530, 325, 540, 332, 0.1, mat("#1c1b33"), front=0.15, bevel=0.0)
    if s["pc_on"]:
        box(488, 263, 572, 317, 0.01, mat("#0f5132", rough=0.2), front=0.265, bevel=0.0)
        for i, yy in enumerate((272, 284, 296, 308)):
            box(494, yy, 494 + 60 - i * 6, yy + 4, 0.012, mat("#7ee0b0", emit=3.0), front=0.274, bevel=0.0)
    else:
        box(488, 263, 572, 317, 0.01, mat("#0e1a3a", rough=0.15), front=0.265, bevel=0.0)
        for i, yy in enumerate((272, 284, 296, 308)):
            box(494, yy, 494 + 40 - i * 6, yy + 4, 0.012, mat("#3b4a7a", rough=0.4), front=0.274, bevel=0.0)
    box(495, 334, 565, 346, 0.2, mat("#d9e2ee", rough=0.4), front=0.2, bevel=0.01)  # klávesnice

    # --- Dveře (640..760 × 120..390) ---
    frame = mat("#444a58", metal=0.7, rough=0.4)
    box(632, 112, 768, 122, 0.16, frame, bevel=0.015)  # zárubeň
    box(632, 112, 642, 392, 0.16, frame, bevel=0.015)
    box(758, 112, 768, 392, 0.16, frame, bevel=0.015)
    if s["door_open"]:
        box(642, 122, 758, 392, 0.02, mat("#fff0b0", emit=5.0), front=0.0, bevel=0.0)  # světlo za dveřmi
        width = 1.16
        d = box(642, 122, 758, 392, 0.08, mat("#8794a8", metal=0.6, rough=0.4), front=0.0, bevel=0.012)
        theta = math.radians(48)
        d.location = (px(642) + width / 2 * math.cos(theta), -0.16 - width / 2 * math.sin(theta), pz(257))
        d.rotation_euler = (0, 0, -theta)
        led = "#3ddc97"
    else:
        box(642, 122, 758, 390, 0.08, mat("#8794a8", metal=0.6, rough=0.4), front=0.08, bevel=0.012)
        box(652, 132, 748, 378, 0.03, mat("#9ca8bb", metal=0.5, rough=0.35), front=0.15, bevel=0.01)
        sphere(745, 250, 6, mat("#ffc933", metal=0.8, rough=0.25), front=0.17)  # klika
        led = "#ff5a3c" if not s["pc_on"] else "#ffc933"
    box(658, 224, 692, 276, 0.06, mat("#1c1b33", rough=0.3), front=0.17, bevel=0.01)  # klávesnice na kód
    for r in range(4):
        for c in range(3):
            box(662 + c * 10, 240 + r * 8, 668 + c * 10, 245 + r * 8, 0.015, mat("#cfd8e3"), front=0.23, bevel=0.0)
    sphere(675, 232, 4, mat(led, emit=5.0), front=0.23)
    # Výstražná tabulka nad dveřmi
    box(670, 100, 730, 112, 0.04, mat("#ffc933", rough=0.5), front=0.03, bevel=0.006)

    # --- Reaktor (598..632 × 230..320) ---
    rc = {"calm": "#9be15d", "warn": "#ffc933", "crit": "#ff3d2e"}[s["reactor"]]
    cyl(615, 275, 17, 90, mat("#2f8f6b", rough=0.3), front=0.05, bevel=0.01)
    cyl(615, 230, 20, 6, mat("#444a58", metal=0.7, rough=0.35), front=0.03)
    sphere(615, 222, 16, mat(rc, emit={"calm": 2.5, "warn": 5.0, "crit": 9.0}[s["reactor"]], rough=0.15), front=0.04)
    for i in range(3):
        sphere(615, 255 + i * 18, 4, mat(rc if i == 0 else "#1c1b33", emit=4.0 if i == 0 else 0, rough=0.3), front=0.3)
    cyl(615, 322, 20, 6, mat("#444a58", metal=0.7, rough=0.35), front=0.03)
    # Žádné dodatečné světlo: výřez stavu reaktoru pak zahrnuje jen reaktor a nepřepíše okolí.

    # --- Robot Atom (320..380 × 308..386) ---
    cyl(350, 372, 30, 28, mat("#8fd0ff", rough=0.3), front=0.0, bevel=0.01)
    sphere(350, 340, 24, mat("#d9e2ee", rough=0.25), front=0.0, sz=0.85)
    sphere(341, 338, 4, mat(INK, rough=0.3), front=0.42)
    sphere(359, 338, 4, mat(INK, rough=0.3), front=0.42)
    cyl(350, 312, 1.8, 14, mat(INK), front=0.0)
    sphere(350, 304, 5, mat("#ff5a3c", emit=1.5, rough=0.2), front=0.2)

    # Stíny pod předměty: tmavý podlahový pás
    box(-40, 386, 840, 392, 0.4, mat("#8a7a60", rough=0.9), front=0.0, bevel=0)


def render(path, w=1600, h=900):
    bpy.context.scene.render.resolution_x = w
    bpy.context.scene.render.resolution_y = h
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


# --------------------------------------------------------------------------------------------
# Ikony předmětů (256 × 256, průhledné)
# --------------------------------------------------------------------------------------------


def icon_scene():
    reset()
    _mats.clear()
    world("#ffffff", 0.9)
    bpy.context.scene.render.film_transparent = True
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 2.7
    co = bpy.data.objects.new("c", cam)
    co.location = (px(0), -6, pz(0) + 1.2)
    co.rotation_euler = (math.radians(78), 0, 0)
    bpy.context.collection.objects.link(co)
    bpy.context.scene.camera = co
    light("AREA", (px(0) - 2, -4, pz(0) + 5), 600, 5.0, "#fff4e0", (math.radians(30), 0, math.radians(-15)))
    light("AREA", (px(0) + 3, -3, pz(0) + 2), 150, 4.0, "#cfe6ff", (math.radians(70), 0, math.radians(40)))


def tilt(o, x=0, z=0):
    o.rotation_euler = (math.radians(x), 0, math.radians(z))
    return o


def icon_key():
    g = mat("#ffc933", rough=0.25, metal=0.9)
    cyl(-40, 0, 38, 0.1, g, axis="y")
    cyl(-40, 0, 16, 0.12, mat("#f6f4ee", rough=0.9), axis="y")
    box(-8, -4, 120, 4, 0.1, g, bevel=0.01)
    box(86, -4, 96, 28, 0.1, g, bevel=0.01)
    box(104, -4, 114, 20, 0.1, g, bevel=0.01)


def icon_note(n):
    p = box(-70, -90, 70, 90, 0.04, mat("#fff4d6", rough=0.8), bevel=0.01)
    p.rotation_euler = (0, math.radians(8), math.radians(-6))
    bpy.ops.object.text_add(location=(px(0), -0.05, pz(0)), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object
    t.data.body = str(n)
    t.data.size = 1.0
    t.data.align_x = "CENTER"
    t.data.align_y = "CENTER"
    t.data.extrude = 0.02
    t.location = (px(0), -0.1, pz(0) - 0.05)
    finish(t, mat("#3248f0", rough=0.4))
    for yy in (-60, 60):
        box(-52, yy, 52, yy + 4, 0.012, mat("#c9b8a0", rough=0.9), front=0.04, bevel=0.0)


def icon_acid():
    glass = mat("#d8f1ff", glass=True)
    cyl(0, 20, 52, 104, glass, front=0.0)
    cyl(0, 20, 44, 82, mat("#9be15d", rough=0.1), front=0.04)
    cyl(0, -50, 17, 36, glass)
    cyl(0, -76, 20, 14, mat("#ff5a3c", rough=0.35))
    box(-30, 8, 30, 38, 0.04, mat("#fffaf0", rough=0.7), front=0.54, bevel=0.005)
    box(-14, 12, 14, 20, 0.01, mat("#ff5a3c"), front=0.58, bevel=0.0)


def icon_zinc():
    p = box(-70, -45, 70, 45, 0.1, mat("#b8c4d6", rough=0.22, metal=1.0), bevel=0.02)
    p.rotation_euler = (math.radians(8), math.radians(6), math.radians(-12))
    box(-40, 8, 40, 12, 0.012, mat("#e8eef7", rough=0.2, metal=1.0), front=0.1, bevel=0.0).rotation_euler = (math.radians(8), math.radians(6), math.radians(-12))


def icon_balloon():
    sphere(0, -16, 60, mat("#ff5a3c", rough=0.15), sz=1.12)
    cone(0, 78, 8, 14, mat("#ff5a3c", rough=0.2), front=0.07, r_top=2)
    for i in range(6):
        cyl(math.sin(i) * 6, 92 + i * 12, 1.2, 14, mat("#16132b"), front=0.07)


def icon_card():
    box(-82, -52, 82, 52, 0.04, mat("#ffffff", rough=0.35), bevel=0.014)
    box(-82, -30, 82, -6, 0.012, mat("#16132b"), front=0.04, bevel=0.0)
    box(-66, 14, -30, 40, 0.012, mat("#ffc933", metal=0.8, rough=0.3), front=0.04, bevel=0.004)
    box(-6, 18, 62, 24, 0.012, mat("#3248f0"), front=0.04, bevel=0.0)
    box(-6, 30, 40, 36, 0.012, mat("#9ca8bb"), front=0.04, bevel=0.0)


ICONS = {
    "key": icon_key,
    "note1": lambda: icon_note(1),
    "note2": lambda: icon_note(2),
    "note3": lambda: icon_note(3),
    "note4": lambda: icon_note(4),
    "acid": icon_acid,
    "zinc": icon_zinc,
    "hydrogen": icon_balloon,
    "card": icon_card,
}


def main():
    only = os.environ.get("LAB_ONLY")
    jobs = [("bg", DEFAULT)] + [("st_" + k, {**DEFAULT, **v}) for k, v in STATES.items()]
    for name, state in jobs:
        if only and only != name:
            continue
        build_room(state)
        render(os.path.join(OUT, name + ".png"))
        print("OK", name, flush=True)
    for name, fn in ICONS.items():
        if only and only != "icons":
            continue
        icon_scene()
        fn()
        render(os.path.join(OUT, "it_" + name + ".png"), 256, 256)
        print("OK icon", name, flush=True)


if __name__ == "__main__":
    main()
