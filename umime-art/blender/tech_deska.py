"""Sekce „Co tu najdeš“: deska plošného spoje jako diorama (statický podklad) a čtyři animované
předměty na podstavcích (kniha, joystick, dveře únikovky, pohár). Podklad a předměty se skládají
na webu; po vodivých cestách mezi procesorem a podstavci běží elektrony kreslené v plátně.

Spuštění: python tech_deska.py [-- deska kniha joystick dvere pohar]   (bez jmen vše)
Výstup: umime-art/out/tech_* a out/tech_deska/paths.json (cesty a polohy v poměru k obrázku).
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

BW, BH = 2400, 1100          # obrázek desky
BOARD_W = 15.2              # šířka záběru ve scéně
PPU = BW / BOARD_W          # pixelů na jednotku
EL = math.radians(54)
AZ = 0.0
OBJ_N = 384                 # předmět: čtvercový snímek
OBJ_FRAMES = 24
PED_X = [-5.1, -1.7, 1.7, 5.1]
PED_Y = -0.55
CPU = (0.0, 1.25)
FEATURE_COLORS = ["#8fd0ff", "#c9b8ff", "#7ee0b0", "#ffc933"]   # kurzy, hry, únikovky, žebříčky


def project(x, y, z=0.0):
    """Pixel v obrázku desky pro bod scény (kamera míří na počátek, pohled shora pod úhlem EL)."""
    return (BW / 2 + PPU * x, BH / 2 - PPU * (y * math.sin(EL) + z * math.cos(EL)))


def cam(w, h, ortho, target=(0, 0, 0)):
    d = 40.0
    loc = (target[0], target[1] - d * math.cos(EL), target[2] + d * math.sin(EL))
    add_camera(loc, target, ortho_scale=ortho)


def lights():
    add_sun((math.radians(50), math.radians(15), math.radians(-35)), energy=3.2)
    add_area((-6, -8, 8), (0, 0, 0), energy=900, size=9, color="#ffe9d6")
    add_area((7, 3, 5), (0, 0, 0), energy=300, size=8, color="#7fb0ff")


def chip(x, y, w, d, h, mat, pins=6, label=None):
    box((x, y, 0.075 + h / 2), (w, d, h), mat, bevel=0.015)
    pm = material("pin", "#c9ced6", roughness=0.3, metallic=0.9)
    for i in range(pins):
        px = x - w / 2 + (i + 0.5) * w / pins
        for sy in (-1, 1):
            box((px, y + sy * (d / 2 + 0.04), 0.09), (0.06, 0.12, 0.025), pm, bevel=0)


def trace_path(points, mat, z=0.082, width=0.07):
    for a, b in zip(points[:-1], points[1:]):
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        box((mx, my, z), (L + width, width, 0.012), mat, rot=(0, 0, ang), bevel=0)


def route(start, end, bend=0.5):
    """Cesta s osmičkovým zalomením: svisle k polovině, šikmo a zase svisle."""
    sx, sy = start
    ex, ey = end
    my = sy + (ey - sy) * bend
    dx = ex - sx
    d = min(abs(dx), abs(my - sy))
    pts = [(sx, sy), (sx, my - d if ey < sy else my + d)] if False else [(sx, sy), (sx, sy + (ey - sy) * 0.35)]
    pts.append((ex, sy + (ey - sy) * 0.35 + (ey - sy) * 0.0))
    pts.append((ex, ey))
    return pts


def build_board():
    reset(BW, BH, 1, samples=160, name="tech_deska", world=("#9fb4ff", 0.35))
    sc = bpy.context.scene
    sc.render.film_transparent = True
    lights()
    cam(BW, BH, BOARD_W)
    pcb = material("pcb", "#0e5f5a", roughness=0.35, metallic=0.1)
    pcb_d = material("pcb_d", "#0a4a47", roughness=0.4)
    gold = material("gold", "#e8b84a", roughness=0.25, metallic=0.95)
    cu = material("cu", "#c98a3c", roughness=0.3, metallic=0.9)
    blk = material("blk", "#16162a", roughness=0.35, metallic=0.3)
    gry = material("gry", "#3a3d52", roughness=0.4, metallic=0.5)
    sil = material("sil", "#aab2c4", roughness=0.25, metallic=0.9)
    white = material("white", "#f2f4ff", roughness=0.5)
    # deska se zaoblenými rohy a zlatým okrajem
    box((0, 0.0, 0.0), (14.2, 5.7, 0.15), pcb, bevel=0.12)
    box((0, 0.0, -0.09), (14.34, 5.84, 0.06), gold, bevel=0.05)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl((sx * 6.8, sy * 2.6, 0.12), 0.17, 0.06, sil, verts=24)
            cyl((sx * 6.8, sy * 2.6, 0.15), 0.07, 0.04, blk, verts=8)
    # vodivé cesty: měděné pozadí a svítivé jádro k podstavcům
    glow_mats = [glow("tr%d" % i, FEATURE_COLORS[i], 1.1) for i in range(4)]
    paths = []
    for i, px in enumerate(PED_X):
        start = (CPU[0] + (i - 1.5) * 0.5, CPU[1] - 0.62)
        mid_y = (0.78, 0.42, 0.42, 0.78)[i]
        pts = [start, (start[0], mid_y), (px, mid_y), (px, PED_Y + 0.95)]
        trace_path(pts, cu, z=0.084, width=0.2)
        trace_path(pts, glow_mats[i], z=0.095, width=0.06)
        for p in pts[1:-1]:
            cyl((p[0], p[1], 0.093), 0.1, 0.012, gold, verts=16)
        paths.append(pts)
    # ostatní cesty (pozadí), tenké zlaté
    rnd = random.Random(9)
    for k in range(14):
        x0 = rnd.uniform(-6.4, 6.4)
        y0 = rnd.choice((rnd.uniform(1.9, 2.5), rnd.uniform(-2.5, -1.7)))
        pts = [(x0, y0), (x0 + rnd.uniform(-1.6, 1.6), y0), (x0 + rnd.uniform(-1.6, 1.6), y0 + rnd.uniform(-0.5, 0.5))]
        trace_path(pts, cu if k % 2 else gold, z=0.081, width=0.05)
    # procesor uprostřed
    box((CPU[0], CPU[1], 0.16), (1.7, 1.2, 0.18), gry, bevel=0.03)
    box((CPU[0], CPU[1], 0.265), (1.25, 0.8, 0.04), sil, bevel=0.02)
    cpu_core = glow("core", "#7fe8ff", 1.4)
    box((CPU[0], CPU[1], 0.29), (0.85, 0.5, 0.02), cpu_core, bevel=0.01)
    for i in range(10):
        for sy in (-1, 1):
            box((CPU[0] - 0.8 + i * 0.178, CPU[1] + sy * 0.64, 0.1), (0.06, 0.14, 0.03), gold, bevel=0)
        for sx in (-1, 1):
            if i < 6:
                box((CPU[0] + sx * 0.9, CPU[1] - 0.5 + i * 0.2, 0.1), (0.14, 0.06, 0.03), gold, bevel=0)
    # čipy, kondenzátory, odpory, LED
    chip(-5.2, 1.9, 1.3, 0.7, 0.14, blk, pins=7)
    chip(-3.2, 2.0, 1.1, 0.6, 0.12, blk, pins=6)
    chip(3.2, 2.0, 1.1, 0.6, 0.12, blk, pins=6)
    chip(5.2, 1.85, 1.4, 0.8, 0.15, blk, pins=8)
    chip(-6.0, -1.9, 1.0, 0.55, 0.12, blk, pins=5)
    chip(6.0, -1.9, 1.0, 0.55, 0.12, blk, pins=5)
    for i in range(7):
        cyl((-3.6 + i * 0.35, -2.2, 0.2), 0.13, 0.26, material("cap%d" % i, ["#3b7be0", "#ff5a3c", "#ffc933"][i % 3], roughness=0.35, metallic=0.4), verts=20)
        cyl((-3.6 + i * 0.35, -2.2, 0.34), 0.115, 0.02, sil, verts=20)
    for i in range(6):
        box((2.4 + i * 0.32, -2.2, 0.12), (0.3, 0.1, 0.07), material("res", "#d9b070", roughness=0.5), bevel=0.01)
        for sx in (-1, 1):
            box((2.4 + i * 0.32 + sx * 0.15, -2.2, 0.11), (0.06, 0.12, 0.05), sil, bevel=0)
    leds = []
    for i, c in enumerate(("#7dff9a", "#ff6a6a", "#ffc933", "#7fe8ff", "#7dff9a")):
        leds.append(sphere((-1.1 + i * 0.55, -2.3, 0.14), 0.07, glow("led%d" % i, c, 2.0), seg=12, rings=8))
    # chladič s lamelami
    for k in range(9):
        box((-6.1 + k * 0.1, 1.55, 0.5), (0.05, 0.8, 0.8 - 0.04 * abs(k - 4)), sil, bevel=0)
    box((-5.7, 1.55, 0.1), (1.1, 0.9, 0.04), sil, bevel=0.01)
    # konektory
    for k in range(5):
        box((6.6, 0.9 - k * 0.45, 0.25), (0.8, 0.32, 0.3), material("conn", "#2a2d44", roughness=0.4), bevel=0.02)
        box((6.85, 0.9 - k * 0.45, 0.25), (0.3, 0.2, 0.18), gold, bevel=0.01)
    # podstavce: šestiúhelníky se svítícím prstencem
    for i, px in enumerate(PED_X):
        cyl((px, PED_Y, 0.2), 0.95, 0.22, material("ped", "#2a2e52", roughness=0.35, metallic=0.5), verts=6)
        cyl((px, PED_Y, 0.33), 0.84, 0.06, material("ped2", "#3a4072", roughness=0.3, metallic=0.5), verts=6)
        torus((px, PED_Y, 0.36), 0.78, 0.025, glow("ring%d" % i, FEATURE_COLORS[i], 1.6))
        for k in range(6):
            a = k * math.tau / 6
            sphere((px + 0.92 * math.cos(a), PED_Y + 0.92 * math.sin(a), 0.2), 0.045, glow("pip%d_%d" % (i, k), FEATURE_COLORS[i], 1.4), seg=8, rings=6)
    # popisky na desce
    for t, x, y in (("CPU", CPU[0] - 0.55, CPU[1] + 0.95), ("LEARN.v1", 3.3, -1.7)):
        bpy.ops.object.text_add(location=(x, y, 0.09))
        o = bpy.context.object
        o.data.body = t
        o.data.size = 0.22
        o.data.extrude = 0.005
        o.data.materials.append(white)

    out = {"w": BW, "h": BH, "ppu": PPU, "cpu": [c / s for c, s in zip(project(CPU[0], CPU[1], 0.3), (BW, BH))], "pedestals": [], "paths": [], "leds": [], "colors": FEATURE_COLORS}
    for i, px in enumerate(PED_X):
        x, y = project(px, PED_Y, 0.36)
        out["pedestals"].append([x / BW, y / BH])
    for pts in paths:
        out["paths"].append([[project(p[0], p[1], 0.1)[0] / BW, project(p[0], p[1], 0.1)[1] / BH] for p in pts])
    os.makedirs(os.path.join(OUT, "tech_deska"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "tech_deska", "paths.json"), "w"))
    run(lambda t: None, "tech_deska")


def obj_scene(name):
    reset(OBJ_N, OBJ_N, OBJ_FRAMES, samples=96, name=name, world=("#9fb4ff", 0.35))
    bpy.context.scene.render.film_transparent = True
    lights()
    cam(OBJ_N, OBJ_N, OBJ_N / PPU, target=(0, 0, 0.9))
    # podstavec (stejný jako na desce, jen jeho horní část, aby předmět „stál“ na něm)


def build_book():
    obj_scene("tech_kniha")
    cov, pg, spine = material("kc", "#3b7be0", roughness=0.45), material("kp", "#fff7e4", roughness=0.8), material("ks", "#2a58b8", roughness=0.4)
    gold = material("kg", "#ffc933", roughness=0.3, metallic=0.8)
    box((0, 0, 0.42), (0.9, 0.6, 0.04), cov, bevel=0.015)           # spodní deska
    pages = []
    # levá a pravá strana rozevřené knihy se silou listů
    for sx in (-1, 1):
        box((sx * 0.22, 0, 0.5), (0.4, 0.55, 0.1), pg, bevel=0.008)
    for i in range(6):
        sx = 1 if i % 2 else -1
        p = box((0, 0, 0), (0.4, 0.55, 0.008), pg, bevel=0)
        pages.append((p, i))
    # záložka, ozdoby a hlavičky řádků
    box((0, -0.3, 0.44), (0.05, 0.02, 0.14), material("zal", "#ff5a3c"), bevel=0)
    for k in range(5):
        box((-0.22, -0.28, 0.555 + k * 0.0), (0.3 - 0.03 * (k % 2), 0.008, 0.012), material("t%d" % k, "#6a7aa0"), bevel=0) if False else None
    for sx in (-1, 1):
        for k in range(6):
            box((sx * 0.22, -0.2 + k * 0.08, 0.556), (0.3, 0.012, 0.004), material("ln", "#7a86a8"), bevel=0)
    glow_o = glow("zaz", "#bfe0ff", 1.8)
    for k in range(7):
        pass
    sparks = [sphere((0, 0, 0), 0.02, glow("sp%d" % k, "#ffe9a0", 3.0), seg=8, rings=6) for k in range(10)]

    def update(t):
        ph = t * math.tau
        for p, i in pages:
            # list se přetáčí zleva doprava, každý s posunem fáze
            u = (t * 2.0 + i / 6.0) % 1.0
            ang = math.pi * u
            p.location = (0, 0, 0.56)
            p.rotation_euler = (0, -ang, 0)
            p.scale = (1, 1, 1)
            # list je zavěšený za hřbet: posun jeho středu o půl šířky ve směru natočení
            p.location = (0.2 * math.cos(ang), 0, 0.56 + 0.2 * math.sin(ang))
            p.rotation_euler = (0, -ang, 0)
        for k, s in enumerate(sparks):
            u = (t + k / 10.0) % 1.0
            s.location = (0.35 * math.sin(k * 2.3 + ph), 0.2 * math.cos(k * 1.7), 0.6 + 0.8 * u)
            q = 1.0 - u
            s.scale = (q, q, q)
    run(update, "tech_kniha")


def build_joystick():
    obj_scene("tech_joystick")
    base, red, blk = material("jb", "#3a3f72", roughness=0.35, metallic=0.5), material("jr", "#ff4d5e", roughness=0.25), material("jk", "#1a1a2e", roughness=0.4)
    sil = material("js", "#c9ced6", roughness=0.25, metallic=0.9)
    box((0, 0, 0.5), (1.15, 0.8, 0.22), base, bevel=0.07)
    box((0, 0, 0.62), (1.05, 0.7, 0.04), material("jt", "#4a5092", roughness=0.35, metallic=0.4), bevel=0.02)
    cyl((-0.25, 0, 0.66), 0.17, 0.03, blk, verts=28)                     # patka páky
    btns = []
    for k, (bx, by, c) in enumerate(((0.28, -0.1, "#ffd24d"), (0.43, 0.08, "#7ee0b0"), (0.15, 0.12, "#8fd0ff"), (0.5, -0.15, "#ff9ec7"))):
        cyl((bx, by, 0.66), 0.075, 0.05, glow("jb%d" % k, c, 0.8), verts=24)
        btns.append(bpy.context.object)
    piv = bpy.data.objects.new("piv", None)
    bpy.context.scene.collection.objects.link(piv)
    piv.location = (-0.25, 0, 0.67)
    stick = cyl((0, 0, 0.3), 0.04, 0.6, sil, verts=14)
    ball = sphere((0, 0, 0.62), 0.14, red, seg=28, rings=20)
    for o in (stick, ball):
        loc = o.location.copy()
        o.parent = piv
        o.location = loc

    def update(t):
        ph = t * math.tau
        # páka kruží do všech stran
        piv.rotation_euler = (0.32 * math.sin(ph), 0.32 * math.cos(ph), 0)
        for k, b in enumerate(btns):
            b.scale = (1, 1, 1 - 0.5 * max(0.0, math.sin(ph * 2 + k * 1.6)) ** 6)
    run(update, "tech_joystick")


def build_door():
    obj_scene("tech_dvere")
    wood, frame, gold = material("dw", "#8a5a34", roughness=0.55), material("df", "#d7c7a8", roughness=0.5), material("dg", "#ffc933", roughness=0.3, metallic=0.9)
    light = glow("dl", "#ffe9a8", 6.0)
    # rám a světlo za dveřmi
    box((-0.52, 0, 1.0), (0.1, 0.18, 1.55), frame, bevel=0.02)
    box((0.52, 0, 1.0), (0.1, 0.18, 1.55), frame, bevel=0.02)
    box((0, 0, 1.8), (1.14, 0.18, 0.12), frame, bevel=0.02)
    box((0, 0.06, 1.0), (0.95, 0.04, 1.5), light, bevel=0)
    for k in range(5):  # světelné paprsky
        pass
    # dveřní křídlo se závěsem na levé straně
    hinge = bpy.data.objects.new("hinge", None)
    bpy.context.scene.collection.objects.link(hinge)
    hinge.location = (-0.46, -0.06, 0.0)
    leaf = box((0.46, 0, 1.0), (0.92, 0.07, 1.46), wood, bevel=0.015)
    knob = sphere((0.8, -0.06, 0.95), 0.05, gold, seg=14, rings=10)
    lock = box((0.82, -0.045, 1.05), (0.1, 0.02, 0.18), gold, bevel=0)
    for k in range(3):
        box((0.1 + 0, -0.04, 0.5 + k * 0.45), (0.1, 0.02, 0.1), gold, bevel=0)
    for o in (leaf, knob, lock):
        loc = o.location.copy()
        o.parent = hinge
        o.location = loc
    sc = bpy.context.scene
    # záře na podlaze a pohybující se prach ve svazku světla
    dust = [sphere((0, 0, 0), 0.018, glow("du%d" % k, "#fff3c2", 3.0), seg=6, rings=4) for k in range(12)]

    def update(t):
        ph = t * math.tau
        # dveře se pomalu otevírají a zavírají (plynulý sinus)
        open_ = 0.5 - 0.5 * math.cos(ph)
        hinge.rotation_euler = (0, 0, math.radians(-70) * open_)
        light.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 3.0 + 4.0 * open_
        for k, d in enumerate(dust):
            u = (t + k / 12.0) % 1.0
            d.location = (-0.3 + 0.7 * ((k * 0.37) % 1.0), -0.2 - 0.5 * u, 0.2 + 0.4 * ((k * 0.61) % 1.0) + 0.3 * u)
            d.scale = (open_, open_, open_)
    run(update, "tech_dvere")


def build_cup():
    obj_scene("tech_pohar")
    gold = material("pg", "#ffc933", roughness=0.22, metallic=1.0)
    gold2 = material("pg2", "#ff9f1a", roughness=0.25, metallic=1.0)
    base = material("pb", "#3a3f72", roughness=0.35, metallic=0.4)
    root = bpy.data.objects.new("cup", None)
    bpy.context.scene.collection.objects.link(root)
    P = [cone((0, 0, 0.78), 0.34, 0.22, 0.46, gold, verts=48), cyl((0, 0, 1.12), 0.38, 0.14, gold, verts=48), torus((0, 0, 1.2), 0.38, 0.03, gold2),
         cyl((0, 0, 0.5), 0.06, 0.24, gold2, verts=24), cone((0, 0, 0.42), 0.2, 0.1, 0.1, gold, verts=32), cyl((0, 0, 0.34), 0.28, 0.1, base, verts=6),
         sphere((0, 0, 0.7), 0.1, gold2, scale=(1, 1, 0.8), seg=20, rings=14)]
    for sx in (-1, 1):
        torus((sx * 0.42, 0, 1.0), 0.17, 0.035, gold2, rot=(math.radians(90), 0, 0))
    star = bpy.data.objects.new("star", None)
    bpy.context.scene.collection.objects.link(star)
    for k in range(5):
        a = k * math.tau / 5
        s = cone((0.0, 0.0, 0), 0.07, 0.0, 0.17, material("st%d" % k, "#fff3b0", roughness=0.3, metallic=0.5), verts=3)
        s.location = (0.1 * math.cos(a + math.pi / 2), -0.37, 0.95 + 0.1 * math.sin(a + math.pi / 2))
        s.rotation_euler = (0, 0, 0)
        s.parent = root
    for o in P:
        o.parent = root
    # ohlazené kopie: stany se vyrovnají na jednu rovinu (hvězda na boku poháru)
    sparks = [sphere((0, 0, 0), 0.03, glow("ps%d" % k, "#fff0a0", 5.0), seg=8, rings=6) for k in range(10)]

    def update(t):
        ph = t * math.tau
        root.rotation_euler = (0, 0, ph)
        root.location = (0, 0, 0.04 * math.sin(2 * ph))
        for k, s in enumerate(sparks):
            u = (t * 2 + k / 10.0) % 1.0
            a = k * 2.4
            s.location = (0.55 * math.cos(a + ph), 0.4 * math.sin(a + ph), 0.6 + 0.9 * u)
            q = math.sin(u * math.pi)
            s.scale = (q, q, q)
    run(update, "tech_pohar")


JOBS = {"deska": build_board, "kniha": build_book, "joystick": build_joystick, "dvere": build_door, "pohar": build_cup}

if __name__ == "__main__":
    wanted = [a for a in args() if a in JOBS]
    if not wanted:
        raise SystemExit("zadej: deska kniha joystick dvere pohar (každý v samostatném procesu)")
    for w in wanted:
        JOBS[w]()
