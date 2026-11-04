"""Grafika hry Krtek (public/game-sprites/mole/): krtek v osmi pózách, kladivo ve třech fázích úderu,
díra, hrudky hlíny a úderová hvězda.

    .venv-art/bin/python umime-art/scripts/mole_sprites.py <pracovní složka>

Skript je dvoukrokový:
  1. render přes bpy (Cycles, CPU) -> PNG snímky do <pracovní složka>/frames/,
  2. složení listů (PIL) -> public/game-sprites/mole/*.webp a mole.json.
Pokud už snímky v <pracovní složka>/frames/ jsou, lze render přeskočit: přidej --pack-only.
Snímky jsou průhledné; hra je kreslí přes Sprites (src/lib/sprites.ts).
"""

import json
import math
import os
import random
import sys

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
PACK_ONLY = "--pack-only" in ARGS
ARGS = [a for a in ARGS if not a.startswith("--")]
WORK = os.path.abspath(ARGS[0] if ARGS else "mole_work")
FRAMES = os.path.join(WORK, "frames")
PUBLIC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "game-sprites", "mole"))
os.makedirs(FRAMES, exist_ok=True)

# Rozměry buněk listů (2× větší než se kreslí ve hře, aby byl krtek ostrý i na retině).
KRTEK_CELL = (224, 240)
KLADIVO_CELL = (128, 224)
DIRA_CELL = (256, 104)
HLINA_CELL = (64, 64)
BUM_CELL = (128, 128)

# Póza = úhly kloubů. hx/hy/hz: natočení hlavy (x = kývnutí, y = naklonění, z = otočení),
# bs: měřítko těla (squash/stretch), up/fwd: zvednutí a předklon paží, eyes: stav očí, mouth: ústa.
POSES = {
    "nahoru_1": dict(bs=(1.0, 1.0, 1.02), eyes="open"),
    "nahoru_2": dict(bs=(1.0, 1.0, 1.02), eyes="blink"),
    "nahoru_3": dict(hy=9, bs=(1.0, 1.0, 1.02), eyes="open", up_r=100, up_l=30, fwd=0, mouth="smile"),
    "vykukuje": dict(hx=-14, bs=(1.0, 1.0, 0.98), eyes="squint", fwd=-72, up=0),
    "zasah": dict(hx=24, bs=(1.14, 1.04, 0.8), eyes="x", mouth="o", up=62, fwd=-42),
    "omamen": dict(hy=20, hx=6, bs=(1.02, 1.0, 0.96), eyes="spiral", mouth="o", up=35, fwd=-30),
    "vitez_1": dict(hx=-6, bs=(0.96, 0.96, 1.08), eyes="happy", mouth="smile", up=150, fwd=0),
    "vitez_2": dict(hy=-7, bs=(1.02, 1.0, 1.03), eyes="happy", mouth="smile", up=70, fwd=0),
}
# Pózy 'nahoru_3' a 'vitez_*' mají různé zvednutí levé/pravé paže (up_l / up_r jsou volitelné).

KRTEK_LAYOUT = [
    ["nahoru_1", "nahoru_2", "nahoru_3", "vykukuje"],
    ["zasah", "omamen", "vitez_1", "vitez_2"],
]
KLADIVO_FRAMES = ["palka"]
HLINA_FRAMES = ["hlina_1", "hlina_2", "hlina_3"]


def render_all():
    import bpy

    scene = bpy.context.scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"

    def lin(h):
        h = h.lstrip("#")
        out = []
        for i in (0, 2, 4):
            c = int(h[i : i + 2], 16) / 255
            out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
        return (*out, 1.0)

    def new_material(name, color, rough=0.5, sss=0.0, coat=0.0, fur=0.0):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        b = nt.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = lin(color)
        b.inputs["Roughness"].default_value = rough
        if sss:
            b.inputs["Subsurface Weight"].default_value = sss
            b.inputs["Subsurface Radius"].default_value = (0.9, 0.4, 0.25)
        if coat:
            b.inputs["Coat Weight"].default_value = coat
            b.inputs["Coat Roughness"].default_value = 0.05
        if fur:
            # jemná textura srsti: šum -> bump, aby měl povrch strukturu místo plastu
            tex = nt.nodes.new("ShaderNodeTexNoise")
            tex.inputs["Scale"].default_value = 120.0
            tex.inputs["Detail"].default_value = 12.0
            bump = nt.nodes.new("ShaderNodeBump")
            bump.inputs["Strength"].default_value = fur
            bump.inputs["Distance"].default_value = 0.02
            nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
            nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
        return m

    def link(o):
        scene.collection.objects.link(o)
        return o

    def smooth(o):
        if o.type == "MESH":
            for p in o.data.polygons:
                p.use_smooth = True

    def attach(child, parent):
        # drží světovou polohu potomka, jen ho zavěsí na rodiče
        bpy.context.view_layer.update()
        child.parent = parent
        child.matrix_parent_inverse = parent.matrix_world.inverted()

    def empty(name, loc=(0, 0, 0), parent=None):
        o = bpy.data.objects.new(name, None)
        o.empty_display_type = "PLAIN_AXES"
        o.empty_display_size = 0.15
        o.location = loc
        link(o)
        if parent is not None:
            attach(o, parent)
        return o

    def part(kind, name, loc, scale, mat, rot=(0, 0, 0), parent=None, radius=1.0, minor=0.1):
        if kind == "sphere":
            bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=loc)
        elif kind == "cyl":
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1, depth=1, location=loc)
        elif kind == "cone":
            bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=1, radius2=0, depth=1, location=loc)
        elif kind == "torus":
            bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=minor, major_segments=56, minor_segments=14, location=loc)
        elif kind == "cube":
            bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        elif kind == "ico":
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=1, location=loc)
        o = bpy.context.active_object
        o.name = name
        if kind != "torus":
            o.scale = scale
        o.rotation_euler = rot
        if mat is not None:
            o.data.materials.append(mat)
        smooth(o)
        if parent is not None:
            attach(o, parent)
        return o

    def set_hidden(o, hidden):
        o.hide_render = hidden
        o.hide_viewport = hidden

    # ---------- kamery a světla ----------
    def ortho_cam(name, scale, center, elev_deg):
        cd = bpy.data.cameras.new(name)
        cd.type = "ORTHO"
        cd.ortho_scale = scale
        co = bpy.data.objects.new(name, cd)
        link(co)
        e = math.radians(elev_deg)
        # kamera stojí na ose pohledu tak, aby střed obrazu byl v bodě `center`
        co.location = (center[0], center[1] - 10 * math.cos(e), center[2] + 10 * math.sin(e))
        co.rotation_euler = (math.radians(90) - e, 0, 0)
        return co

    key = bpy.data.lights.new("key", "SUN")
    key.energy = 4.0
    key.angle = math.radians(12)
    ko = bpy.data.objects.new("key", key)
    link(ko)
    ko.rotation_euler = (math.radians(40), 0, math.radians(-22))

    rim = bpy.data.lights.new("rim", "SUN")
    rim.energy = 2.2
    rim.color = (1.0, 0.95, 0.85)
    ro = bpy.data.objects.new("rim", rim)
    link(ro)
    ro.rotation_euler = (math.radians(-38), 0, math.radians(160))

    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.92, 0.9, 0.95, 1.0)
    bg.inputs[1].default_value = 0.55
    scene.world = world

    def render(path, cam, w, h):
        scene.camera = cam
        scene.render.resolution_x = w
        scene.render.resolution_y = h
        scene.render.resolution_percentage = 100
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)

    # ---------- KRTEK ----------
    # krtek obecný: sametová tmavě šedá srst (bez lesku), šedé břicho, růžový čenich a tlapy
    fur = new_material("fur", "#4a4245", rough=0.9, sss=0.05, fur=0.1)
    belly = new_material("belly", "#6d6468", rough=0.85, sss=0.08, fur=0.06)
    pink = new_material("pink", "#e9a3a8", rough=0.4, sss=0.2)
    inner_ear = new_material("ear_in", "#f2a3b0", rough=0.6)
    white = new_material("white", "#d9d0c6", rough=0.35)
    black = new_material("black", "#17132a", rough=0.25, coat=0.3)
    claw = new_material("claw", "#efe4da", rough=0.4)
    mouth_m = new_material("mouth", "#5c1a2b", rough=0.4)

    mole = []
    body_e = empty("body")
    mole.append(body_e)
    body = part("sphere", "body", (0, 0, 0), (0.92, 0.84, 1.06), fur, parent=body_e)
    mole.append(body)
    belly_o = part("sphere", "belly", (0, -0.5, -0.28), (0.6, 0.4, 0.62), belly, parent=body_e)
    mole.append(belly_o)

    head_e = empty("head", parent=body_e)
    mole.append(head_e)
    # špičatý růžový čenich (krtčí rypáček)
    muzzle = part("sphere", "muzzle", (0, -0.92, 0.2), (0.26, 0.42, 0.25), pink, parent=head_e)
    nose = part("sphere", "nose", (0, -1.32, 0.22), (0.1, 0.08, 0.08), pink, parent=head_e)
    mole += [muzzle, nose]

    eyes = {}
    for side, sx in (("L", -1), ("R", 1)):
        ex = 0.25 * sx
        ew = part("sphere", f"eyeW_{side}", (ex, -0.8, 0.46), (0.075, 0.05, 0.075), white, parent=head_e)
        pu = part("sphere", f"pupil_{side}", (ex, -0.88, 0.44), (0.045, 0.03, 0.045), black, parent=head_e)
        sh = part("sphere", f"shine_{side}", (ex + 0.035 * sx, -0.915, 0.5), (0.032, 0.02, 0.032), white, parent=head_e)
        cl = part("sphere", f"closed_{side}", (ex, -0.9, 0.46), (0.15, 0.03, 0.03), black, parent=head_e)
        xa = part("cyl", f"xa_{side}", (ex, -0.92, 0.46), (0.03, 0.03, 0.28), black, rot=(math.radians(90), 0, math.radians(45)), parent=head_e)
        xb = part("cyl", f"xb_{side}", (ex, -0.92, 0.46), (0.03, 0.03, 0.28), black, rot=(math.radians(90), 0, math.radians(-45)), parent=head_e)
        sp = part("torus", f"spiral_{side}", (ex, -0.92, 0.46), (1, 1, 1), black, rot=(math.radians(90), 0, 0), parent=head_e, radius=0.09, minor=0.025)
        eyes[side] = dict(w=ew, p=pu, s=sh, c=cl, xa=xa, xb=xb, sp=sp)
        mole += [ew, pu, sh, cl, xa, xb, sp]

    for side, sx in (("L", -1), ("R", 1)):
        ear = part("sphere", f"ear_{side}", (0.72 * sx, -0.28, 0.6), (0.12, 0.09, 0.12), fur, parent=head_e)
        ein = part("sphere", f"earin_{side}", (0.72 * sx, -0.36, 0.6), (0.07, 0.05, 0.07), inner_ear, parent=head_e)
        mole += [ear, ein]

    # ústa: dvě varianty (otevřená ‚au‘ a úsměv); skryté, dokud je póza nepotřebuje
    mouth_o = part("sphere", "mouth_o", (0, -0.98, 0.0), (0.14, 0.07, 0.1), mouth_m, parent=head_e)
    mouth_s = part("sphere", "mouth_s", (0, -1.0, 0.1), (0.22, 0.05, 0.05), mouth_m, parent=head_e)
    mole += [mouth_o, mouth_s]

    # ruce s pracky a drápky (každá ruka má pivot v rameni)
    arms = {}
    for side, sx in (("L", -1), ("R", 1)):
        sh_e = empty(f"shoulder_{side}", (0.82 * sx, -0.05, 0.05), parent=body_e)
        arm = part("sphere", f"arm_{side}", (0.84 * sx, -0.04, -0.3), (0.2, 0.2, 0.36), fur, parent=sh_e)
        paw = part("sphere", f"paw_{side}", (0.92 * sx, -0.14, -0.66), (0.3, 0.26, 0.2), pink, parent=sh_e)
        claws = []
        for k, dx in enumerate((-0.1, 0.0, 0.1)):
            c = part("cone", f"claw_{side}{k}", (0.92 * sx + dx, -0.3, -0.84), (0.035, 0.035, 0.1), claw,
                     rot=(math.radians(180), 0, 0), parent=sh_e)
            claws.append(c)
        arms[side] = sh_e
        mole += [sh_e, arm, paw] + claws

    # ---------- KLADIVO (svisle, rukojeť dole; švih dělá hra rotací kolem spodního konce) ----------
    wood = new_material("wood", "#b07a4f", rough=0.55)
    hred = new_material("hred", "#e5484d", rough=0.22, coat=0.7)
    hammer_e = empty("hammer")
    handle = part("cyl", "handle", (0, 0, 0.7), (0.07, 0.07, 1.4), wood, parent=hammer_e)
    grip = part("cyl", "grip", (0, 0, 0.16), (0.09, 0.09, 0.3), black, parent=hammer_e)
    hhead = part("cube", "hhead", (0, 0, 1.6), (0.86, 0.42, 0.36), hred, parent=hammer_e)
    bev = hhead.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.08
    bev.segments = 5
    hammer = [hammer_e, handle, grip, hhead]

    # ---------- DÍRA ----------
    dirt = new_material("dirt", "#6b4a2b", rough=0.95, fur=0.25)
    dirt_light = new_material("dirt_l", "#8c6238", rough=0.9, fur=0.2)
    hole_dark = new_material("hole", "#24180e", rough=1.0)
    stone = new_material("stone", "#b8aa98", rough=0.6, coat=0.2)
    hole = []
    hole.append(part("cyl", "hole_in", (0, 0, -0.04), (0.95, 0.95, 0.03), hole_dark))
    hole.append(part("torus", "mound", (0, 0, 0.02), (1, 1, 1), dirt, radius=1.0, minor=0.24))
    rnd = random.Random(7)
    for k in range(10):
        a = k / 10 * math.tau + rnd.uniform(-0.12, 0.12)
        r = 1.2 + rnd.uniform(-0.05, 0.1)
        s = rnd.uniform(0.08, 0.14)
        hole.append(part("ico", f"pebble{k}", (math.cos(a) * r, math.sin(a) * r, 0.06), (s, s, s * 0.7),
                         stone if k % 3 == 0 else dirt_light))

    # ---------- HLÍNA (odlétající hrudky) ----------
    clods = []
    for k in range(3):
        c = part("ico", f"clod{k}", (0, 0, 0), (0.44, 0.36, 0.3), dirt_light if k % 2 else dirt)
        mesh = c.data
        rr = random.Random(20 + k)
        for v in mesh.vertices:
            f = 1 + rr.uniform(-0.2, 0.2)
            v.co *= f
        clods.append(c)

    def show(objs, flag=False):
        for o in objs:
            set_hidden(o, not flag)

    everything = mole + hammer + hole + clods
    for o in everything:
        set_hidden(o, True)

    def pose(p):
        head_e.rotation_euler = (math.radians(p.get("hx", 0)), math.radians(p.get("hy", 0)), math.radians(p.get("hz", 0)))
        body_e.scale = p.get("bs", (1, 1, 1))
        up = p.get("up", 0)
        fwd = p.get("fwd", 0)
        up_l = p.get("up_l", up)
        up_r = p.get("up_r", up)
        # levá ruka se zvedá kladnou otočkou kolem Y, pravá zápornou (zrcadlově, aby šla ven)
        arms["L"].rotation_euler = (math.radians(fwd), math.radians(up_l), 0)
        arms["R"].rotation_euler = (math.radians(fwd), math.radians(-up_r), 0)
        eye_mode = p.get("eyes", "open")
        for side, e in eyes.items():
            vis = {
                "open": dict(w=1, p=1, s=1, c=0, xa=0, xb=0, sp=0),
                "squint": dict(w=1, p=1, s=1, c=0, xa=0, xb=0, sp=0),
                "blink": dict(w=0, p=0, s=0, c=1, xa=0, xb=0, sp=0),
                "x": dict(w=1, p=0, s=0, c=0, xa=1, xb=1, sp=0),
                "spiral": dict(w=1, p=0, s=0, c=0, xa=0, xb=0, sp=1),
                "happy": dict(w=0, p=0, s=0, c=1, xa=0, xb=0, sp=0),
            }[eye_mode]
            for key, flag in vis.items():
                set_hidden(e[key], not flag)
            if eye_mode == "squint":
                e["w"].scale = (0.075, 0.05, 0.035)
                e["p"].scale = (0.045, 0.03, 0.025)
            else:
                e["w"].scale = (0.075, 0.05, 0.075)
                e["p"].scale = (0.045, 0.03, 0.045)
        m = p.get("mouth")
        set_hidden(mouth_o, m != "o")
        set_hidden(mouth_s, m != "smile")

    # 3D modely pro public/game-models/mole/ (klidová póza; hra je nepoužívá, jsou pro další práci v Blenderu)
    model_dir = os.path.abspath(os.path.join(PUBLIC, "..", "..", "game-models", "mole"))
    os.makedirs(model_dir, exist_ok=True)

    def export_glb(objs, path):
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True)
        print("glb", path)

    show(mole, True)
    pose(POSES["nahoru_1"])
    export_glb([o for o in mole if not o.hide_render], os.path.join(model_dir, "krtek.glb"))
    show(mole, False)
    show(hammer, True)
    export_glb(hammer, os.path.join(model_dir, "kladivo.glb"))
    show(hammer, False)

    # krtek: jeden snímek na pózu
    cam_mole = ortho_cam("cam_mole", 3.5, (0, 0, -1.0 + 1.75), 7)
    for name, p in POSES.items():
        show(mole, True)
        show(hammer + hole + clods, False)
        pose(p)
        render(os.path.join(FRAMES, f"krtek_{name}.png"), cam_mole, *KRTEK_CELL)
        show(mole, False)

    # kladivo: stejný kámen, tři fáze úderu (otáčí se kolem pivotu v rukojeti)
    cam_ham = ortho_cam("cam_ham", 2.5, (0, 0, 0.85), 0)
    show(hammer, True)
    render(os.path.join(FRAMES, "kladivo_palka.png"), cam_ham, *KLADIVO_CELL)
    show(hammer, False)

    # díra: nadhled 25°, ať je elipsa jako ve hře
    cam_hole = ortho_cam("cam_hole", 2.8, (0, 0, 0), 25)
    show(hole, True)
    render(os.path.join(FRAMES, "dira.png"), cam_hole, *DIRA_CELL)
    show(hole, False)

    # hrudky: každá v jiné poloze
    cam_clod = ortho_cam("cam_clod", 1.5, (0, 0, 0), 30)
    for k, c in enumerate(clods):
        show([c], True)
        c.rotation_euler = (0.4 * k, 0.9 + k * 0.7, 0.3 * k)
        render(os.path.join(FRAMES, f"hlina_{k + 1}.png"), cam_clod, *HLINA_CELL)
        show([c], False)


def pack():
    from PIL import Image, ImageDraw

    def load(name):
        return Image.open(os.path.join(FRAMES, name)).convert("RGBA")

    def sheet(cell, cols, frames, out):
        rows = math.ceil(len(frames) / cols)
        img = Image.new("RGBA", (cell[0] * cols, cell[1] * rows), (0, 0, 0, 0))
        names = {}
        for i, (name, src) in enumerate(frames):
            c, r = i % cols, i // cols
            im = load(src)
            if im.size != tuple(cell):
                im = im.resize(cell, Image.LANCZOS)
            img.paste(im, (c * cell[0], r * cell[1]))
            names[name] = [c, r]
        img.save(os.path.join(PUBLIC, out), "WEBP", quality=93, method=6, alpha_quality=100)
        return names

    os.makedirs(PUBLIC, exist_ok=True)

    krtek_frames = []
    for row in KRTEK_LAYOUT:
        for name in row:
            krtek_frames.append((name, f"krtek_{name}.png"))
    krtek_map = sheet(KRTEK_CELL, len(KRTEK_LAYOUT[0]), krtek_frames, "krtek.webp")

    kladivo_map = sheet(KLADIVO_CELL, 1, [("palka", "kladivo_palka.png")], "kladivo.webp")
    dira_map = sheet(DIRA_CELL, 1, [("dira", "dira.png")], "dira.webp")
    hlina_map = sheet(HLINA_CELL, 3, [(n, f"hlina_{i + 1}.png") for i, n in enumerate(HLINA_FRAMES)], "hlina.webp")

    # úderová hvězda: žlutý výbuch s bílým jádrem (kreslí se kódem, takže je jen jeden snímek)
    bum = Image.new("RGBA", (BUM_CELL[0] * 4, BUM_CELL[1] * 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(bum)
    cx, cy = bum.width / 2, bum.height / 2
    rnd = random.Random(3)
    pts = []
    spikes = 14
    for k in range(spikes * 2):
        a = k * math.pi / spikes + rnd.uniform(-0.05, 0.05)
        rad = (bum.width * 0.48) if k % 2 == 0 else (bum.width * rnd.uniform(0.25, 0.32))
        pts.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    d.polygon(pts, fill=(255, 196, 40, 255), outline=(255, 255, 255, 255))
    inner = []
    for k in range(18):
        a = k * math.pi / 9
        rad = bum.width * (0.2 if k % 2 == 0 else 0.1)
        inner.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    d.polygon(inner, fill=(255, 255, 255, 255))
    bum = bum.resize(BUM_CELL, Image.LANCZOS)
    bum.save(os.path.join(PUBLIC, "bum.webp"), "WEBP", quality=93, method=6, alpha_quality=100)

    groups = {
        "dira": {"file": "dira.webp", "cell": list(DIRA_CELL), "cols": 1, "frames": dira_map},
        "kladivo": {"file": "kladivo.webp", "cell": list(KLADIVO_CELL), "cols": 1, "frames": kladivo_map},
        "krtek": {"file": "krtek.webp", "cell": list(KRTEK_CELL), "cols": 4, "frames": krtek_map},
        "hlina": {"file": "hlina.webp", "cell": list(HLINA_CELL), "cols": 3, "frames": hlina_map},
        "bum": {"file": "bum.webp", "cell": list(BUM_CELL), "cols": 1, "frames": {"bum": [0, 0]}},
    }
    with open(os.path.join(PUBLIC, "mole.json"), "w", encoding="utf-8") as f:
        json.dump({"groups": groups}, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("zabaleno do", PUBLIC)


if __name__ == "__main__":
    if not PACK_ONLY:
        render_all()
    pack()
