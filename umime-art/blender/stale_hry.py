"""Stálé hry jako dioramata: Základna (vesmírná stanice), Mazlíčci (domek se zvířátky), Farma a Město.
Každé je malá scéna na podstavci (jako památky na globusu), 24 snímků smyčky, průhledné pozadí.
Spuštění: python stale_hry.py [-- zakladna mazlicci farma mesto]   (každé ve vlastním procesu)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

M = lambda n, c, **k: material(n, c, **k)


def pedestal(top, ring):
    plinth(top, ring)


# ---------------------------------------------------------------- Základna
def zakladna():
    setup("hra_zakladna", ortho=4.4, target_z=1.2, world=("#8fa2ff", 0.45))
    plinth("#2b3a78", "#7fd0ff")
    metal, dark, panel, glass = M("zm", "#d5dbea", roughness=0.28, metallic=0.85), M("zd", "#3a3f62", roughness=0.4, metallic=0.6), M("zp", "#2a4fb8", roughness=0.3, metallic=0.4), M("zg", "#8fe6ff", roughness=0.1)
    gold = M("zgo", "#ffc933", roughness=0.3, metallic=0.9)
    win = glow("zw", "#fff3b0", 2.4)
    red_l, green_l = glow("zr", "#ff4d5e", 4.0), glow("zgr", "#4dff88", 4.0)
    # povrch plošiny: kruhové značky
    for r in (0.6, 0.95):
        torus((0, 0, 0.045), r, 0.012, glow("zn%d" % int(r * 10), "#7fd0ff", 1.4))
    # velitelský modul
    cyl((0, 0, 0.55), 0.38, 0.9, metal, verts=32)
    sphere((0, 0, 1.05), 0.38, metal, scale=(1, 1, 0.6), seg=32, rings=16)
    torus((0, 0, 0.5), 0.395, 0.035, gold)
    for k in range(10):
        a = k * math.tau / 10
        box((0.385 * math.cos(a), 0.385 * math.sin(a), 0.7), (0.07, 0.05, 0.12), win, rot=(0, 0, a), bevel=0.005)
    cyl((0, 0, 1.4), 0.04, 0.5, dark, verts=12)
    ant = sphere((0, 0, 1.68), 0.06, gold, seg=14, rings=10)
    # prstenec ubytovací jednotky, který se otáčí
    ring = bpy.data.objects.new("ring", None)
    bpy.context.scene.collection.objects.link(ring)
    torus((0, 0, 0), 0.95, 0.12, metal, rot=(0, 0, 0)).parent = ring
    for k in range(8):
        a = k * math.tau / 8
        o = box((0.95 * math.cos(a), 0.95 * math.sin(a), 0.1), (0.1, 0.1, 0.12), win, rot=(0, 0, a), bevel=0.005)
        o.parent = ring
        bar((0.95 * math.cos(a), 0.95 * math.sin(a), 0.0), (0.38 * math.cos(a), 0.38 * math.sin(a), -0.2), 0.03, dark, verts=6).parent = ring
    ring.location = (0, 0, 0.75)
    # solární panely na dlouhých ramenech
    panels = []
    for sx, sy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        arm = bpy.data.objects.new("arm", None)
        bpy.context.scene.collection.objects.link(arm)
        arm.location = (sx * 0.42, sy * 0.42, 0.55)
        arm.rotation_euler = (0, 0, math.atan2(sy, sx))
        bar((0, 0, 0), (1.05, 0, 0), 0.03, dark, verts=8).parent = arm
        pl = box((1.1, 0, 0), (0.42, 0.5, 0.025), panel, bevel=0.005)
        pl.parent = arm
        for k in range(1, 4):
            box((1.1 - 0.21 + k * 0.105, 0, 0.016), (0.008, 0.5, 0.004), M("zl", "#8fb4ff"), bevel=0).parent = arm
        panels.append(arm)
    # radar a světla
    dish = bpy.data.objects.new("dish", None)
    bpy.context.scene.collection.objects.link(dish)
    dish.location = (0.55, -0.55, 0.12)
    cyl((0, 0, 0.15), 0.025, 0.3, dark, verts=8).parent = dish
    d = cone((0, 0, 0.34), 0.2, 0.02, 0.1, metal, verts=24, rot=(math.radians(180), 0, 0))
    d.parent = dish
    sphere((0, 0, 0.36), 0.03, gold, seg=8, rings=6).parent = dish
    beacons = [sphere((x, y, 0.1), 0.04, m, seg=10, rings=8) for (x, y, m) in ((0.8, 0.8, red_l), (-0.8, 0.8, green_l), (-0.8, -0.8, red_l), (0.8, -0.8, green_l))]
    # raketoplán kroužící po oběžné dráze
    shuttle = bpy.data.objects.new("shuttle", None)
    bpy.context.scene.collection.objects.link(shuttle)
    sp = [sphere((0, 0, 0), 0.07, metal, scale=(2, 0.7, 0.7), seg=16, rings=10), cone((0.15, 0, 0), 0.05, 0.0, 0.14, M("zn", "#ff5a3c"), verts=12, rot=(0, math.radians(90), 0)),
          box((-0.05, 0, 0), (0.1, 0.22, 0.015), M("zk", "#ff5a3c"), bevel=0), sphere((-0.15, 0, 0), 0.03, glow("zf", "#ffb347", 6.0), seg=8, rings=6)]
    for o in sp:
        loc = o.location.copy(); o.parent = shuttle; o.location = loc
    stars = [sphere((0, 0, 0), 0.015, glow("zst%d" % k, "#ffffff", 5.0), seg=6, rings=4) for k in range(14)]
    rnd = random.Random(3)
    sp_pos = [(rnd.uniform(-1.8, 1.8), rnd.uniform(-1.0, 1.4), rnd.uniform(0.2, 2.8)) for _ in stars]

    @anim
    def _z(t):
        ph = t * math.tau
        ring.rotation_euler = (0, 0, ph)
        for i, a in enumerate(panels):
            a.rotation_euler = (0.18 * math.sin(ph + i), 0, a.rotation_euler.z)
        dish.rotation_euler = (0, 0, ph * 2)
        for i, b in enumerate(beacons):
            set_glow(b.data.materials[0], 1.0 + 4.0 * max(0.0, math.sin(2 * ph + i * 1.57)))
        a = ph * 1.0
        shuttle.location = (1.45 * math.cos(a), 1.0 * math.sin(a) + 0.1, 1.55 + 0.25 * math.sin(2 * a))
        shuttle.rotation_euler = (0, 0, a + math.pi / 2)
        ant.scale = (1 + 0.2 * math.sin(3 * ph),) * 3
        for i, (s, (x, y, z)) in enumerate(zip(stars, sp_pos)):
            q = 0.5 + 0.5 * math.sin(ph * 2 + i)
            s.location = (x, y, z)
            s.scale = (q, q, q)

    run(lambda t: None, "hra_zakladna")


# ---------------------------------------------------------------- Mazlíčci
def mazlicci():
    setup("hra_mazlicci", ortho=4.3, target_z=1.0, world=("#ffe2c4", 0.6))
    plinth("#8fd36f", "#ffe3f0")
    roof, wall, wood, brick = M("mr", "#d9543c", roughness=0.5), M("mw", "#fff0d8", roughness=0.7), M("mwo", "#8a5a34", roughness=0.7), M("mb", "#b8643c", roughness=0.8)
    win = glow("mwi", "#ffe2a0", 2.4)
    box((0, 0.35, 0.45), (1.3, 1.0, 0.9), wall, bevel=0.03)
    prism(-0.7, 0.7, -0.2, 0.9, 0.9, 1.45, roof)
    box((0.45, 0.6, 1.3), (0.2, 0.2, 0.5), brick, bevel=0.01)                  # komín
    box((0, -0.16, 0.3), (0.3, 0.05, 0.55), wood, bevel=0.01)                  # dveře
    sphere((0.08, -0.2, 0.3), 0.025, M("mk", "#ffc933", metallic=0.9), seg=8, rings=6)
    for sx in (-1, 1):
        box((sx * 0.45, -0.16, 0.5), (0.25, 0.04, 0.25), win, bevel=0.01)
        box((sx * 0.45, -0.18, 0.5), (0.3, 0.02, 0.03), wood, bevel=0)
        box((sx * 0.45, -0.18, 0.5), (0.03, 0.02, 0.3), wood, bevel=0)
    # psí bouda, miska, kostka
    box((-1.0, -0.5, 0.18), (0.45, 0.45, 0.36), M("mbd", "#c9744b", roughness=0.7), bevel=0.02)
    prism(-1.28, -0.72, -0.76, -0.26, 0.36, 0.58, roof)
    box((-1.0, -0.73, 0.14), (0.16, 0.03, 0.2), M("mdr", "#2a1a12"), bevel=0)
    cyl((0.8, -0.75, 0.07), 0.12, 0.08, M("mbo", "#3b7be0", roughness=0.4), verts=20)
    cyl((0.8, -0.75, 0.115), 0.09, 0.02, M("mfo", "#8a5a34"), verts=20)
    # zvířátka: pes, kočka, liška, králík
    def animal(x, y, body, belly, ear, s=1.0, tail=True):
        root = bpy.data.objects.new("zv", None)
        bpy.context.scene.collection.objects.link(root)
        root.location = (x, y, 0.07)
        parts = [sphere((0, 0, 0.14 * s), 0.12 * s, body, scale=(1.2, 0.9, 0.95), seg=16, rings=12), sphere((0.15 * s, 0, 0.26 * s), 0.085 * s, body, seg=14, rings=10),
                 sphere((0.2 * s, 0, 0.22 * s), 0.03 * s, belly, seg=8, rings=6), sphere((0.17 * s, -0.04 * s, 0.29 * s), 0.016 * s, M("oko", "#16132b"), seg=6, rings=4), sphere((0.17 * s, 0.04 * s, 0.29 * s), 0.016 * s, M("oko2", "#16132b"), seg=6, rings=4),
                 cone((0.13 * s, -0.05 * s, 0.35 * s), 0.035 * s, 0.0, 0.09 * s, ear, verts=6), cone((0.13 * s, 0.05 * s, 0.35 * s), 0.035 * s, 0.0, 0.09 * s, ear, verts=6)]
        for lx in (-0.07, 0.08):
            for ly in (-0.05, 0.05):
                parts.append(cyl((lx * s, ly * s, 0.04 * s), 0.025 * s, 0.08 * s, body, verts=8))
        tl = bpy.data.objects.new("tl", None)
        bpy.context.scene.collection.objects.link(tl)
        tl.parent = root
        tl.location = (-0.14 * s, 0, 0.17 * s)
        t_ = sphere((-0.06 * s, 0, 0.04 * s), 0.05 * s, belly, scale=(1.5, 0.7, 0.7), seg=10, rings=8)
        t_.parent = tl
        t_.location = (-0.06 * s, 0, 0.04 * s)
        for o in parts:
            loc = o.location.copy(); o.parent = root; o.location = loc
        return root, tl
    dog, dtail = animal(-0.55, -0.7, M("dg", "#c98a4a", roughness=0.8), M("dgb", "#f3dcc0", roughness=0.8), M("dge", "#8a5a34", roughness=0.8))
    cat, ctail = animal(0.4, -0.95, M("kc", "#9aa0b0", roughness=0.8), M("kcb", "#f3f3f8", roughness=0.8), M("kce", "#6a7088", roughness=0.8), s=0.9)
    fox, ftail = animal(1.0, -0.2, M("lf", "#ff8a3c", roughness=0.8), M("lfb", "#ffffff", roughness=0.8), M("lfe", "#7a3a14", roughness=0.8))
    bun, btail = animal(-1.1, 0.35, M("kr", "#f7f3ee", roughness=0.9), M("krb", "#ffd0dc", roughness=0.9), M("kre", "#ffb0c4", roughness=0.9), s=0.8)
    # míček, který poskakuje
    ball = sphere((0, 0, 0), 0.07, M("mi", "#ff5a7a", roughness=0.4), seg=16, rings=10)
    # srdíčka, která stoupají
    hearts = [sphere((0, 0, 0), 0.04, glow("sr%d" % k, "#ff6a9a", 2.5), scale=(1, 0.5, 1), seg=8, rings=6) for k in range(6)]
    # kouř z komína
    smoke = [sphere((0, 0, 0), 0.07, M("ko%d" % k, "#ffffff", roughness=1.0), seg=10, rings=8) for k in range(6)]
    for (x, y) in ((1.2, 0.7), (-1.25, -0.0), (0.9, 0.85)):
        tree(x, y, 1.3, kind="round", leaf="#58c460")
    bush(-0.2, -0.4)
    for k in range(6):  # květiny
        a = k * 1.1
        sphere((-0.3 + 0.28 * math.cos(a) * (1 + k * 0.05), -1.0 + 0.1 * math.sin(a * 2), 0.1), 0.03, M("fl%d" % k, ["#ff5fa2", "#ffd24d", "#ffffff"][k % 3], roughness=0.5), seg=8, rings=6)

    @anim
    def _m(t):
        ph = t * math.tau
        for tl, i in ((dtail, 0), (ctail, 1), (ftail, 2), (btail, 3)):
            tl.rotation_euler = (0, 0, 0.5 * math.sin(3 * ph + i))
        for r, i in ((dog, 0), (cat, 1), (fox, 2), (bun, 3)):
            r.scale = (1, 1, 1 + 0.03 * math.sin(2 * ph + i))
        dog.location.z = 0.07 + 0.03 * max(0.0, math.sin(4 * ph)) ** 2
        u = (t * 2) % 1.0
        ball.location = (0.15 + 0.45 * u, -1.05 + 0.1 * u, 0.1 + 0.4 * 4 * u * (1 - u))
        for k, h in enumerate(hearts):
            v = (t + k / 6.0) % 1.0
            h.location = (-0.4 + 0.35 * (k % 3) + 0.05 * math.sin(ph + k), -0.4 - 0.2 * (k % 2), 0.5 + 0.9 * v)
            q = math.sin(v * math.pi)
            h.scale = (q, q * 0.5, q)
        for k, s in enumerate(smoke):
            v = (t + k / 6.0) % 1.0
            s.location = (0.45 + 0.2 * v + 0.05 * math.sin(ph + k), 0.6, 1.6 + 0.9 * v)
            q = 0.4 + 0.9 * v
            s.scale = (q, q, q)
            
    run(lambda t: None, "hra_mazlicci")


# ---------------------------------------------------------------- Farma
def farma():
    setup("hra_farma", ortho=4.4, target_z=1.0, world=("#cfe6ff", 0.6))
    plinth("#8fd36f", "#fff4d0")
    red, wht, wood, hay, soil = M("fr", "#d9402e", roughness=0.55), M("fw", "#fff6e6", roughness=0.7), M("fwo", "#8a5a34", roughness=0.7), M("fh", "#f2c14a", roughness=0.9), M("fs", "#7a4a2a", roughness=0.95)
    # stodola
    box((-0.55, 0.65, 0.4), (1.0, 0.8, 0.8), red, bevel=0.02)
    prism(-1.05, -0.05, 0.22, 1.08, 0.8, 1.25, M("fro", "#b83020", roughness=0.5))
    box((-0.55, 0.24, 0.3), (0.34, 0.03, 0.55), wht, bevel=0)
    bar((-0.72, 0.235, 0.05), (-0.38, 0.235, 0.55), 0.015, wht, verts=6)
    bar((-0.72, 0.235, 0.55), (-0.38, 0.235, 0.05), 0.015, wht, verts=6)
    # silo
    cyl((0.25, 0.9, 0.55), 0.22, 1.1, M("fsi", "#c9ced6", roughness=0.35, metallic=0.7), verts=24)
    sphere((0.25, 0.9, 1.1), 0.22, M("fsi2", "#aeb6c4", roughness=0.35, metallic=0.7), scale=(1, 1, 0.6), seg=20, rings=10)
    # větrný mlýn s otáčejícími se lopatkami
    cone((1.0, 0.7, 0.55), 0.2, 0.12, 1.1, wht, verts=16)
    cone((1.0, 0.7, 1.15), 0.14, 0.0, 0.2, red, verts=16)
    mill = bpy.data.objects.new("mill", None)
    bpy.context.scene.collection.objects.link(mill)
    mill.location = (1.0, 0.5, 1.0)
    for k in range(4):
        a = k * math.pi / 2
        b = box((0, 0, 0.3), (0.07, 0.01, 0.55), wood, bevel=0)
        b.parent = mill
        b.location = (0, 0, 0)
        b.location = (0.3 * -math.sin(a) * 0, 0, 0)
    blades = []
    for k in range(4):
        piv = bpy.data.objects.new("bl", None)
        bpy.context.scene.collection.objects.link(piv)
        piv.parent = mill
        piv.rotation_euler = (0, k * math.pi / 2, 0)
        sl = box((0, 0, 0.3), (0.08, 0.012, 0.6), wood, bevel=0)
        sl.parent = piv
        sl.location = (0, 0, 0.3)
        pl = box((0.07, 0, 0.35), (0.12, 0.01, 0.4), wht, bevel=0)
        pl.parent = piv
        pl.location = (0.07, 0, 0.35)
        blades.append(piv)
    sphere((0, 0, 0), 0.05, M("fh2", "#2a2a35"), seg=10, rings=8).parent = mill
    # pole s řádky plodin
    crops = []
    for r in range(5):
        box((0.1, -0.7 + r * 0.22, 0.07), (1.4, 0.12, 0.05), soil, bevel=0.01)
        for c in range(9):
            col = M("cr%d" % (r % 3), ["#58c460", "#ff8a3c", "#ffd24d"][r % 3], roughness=0.6)
            crops.append((sphere((-0.5 + c * 0.16 + 0.1, -0.7 + r * 0.22, 0.14), 0.05, col, seg=8, rings=6), c, r))
    # kráva s pohyblivou hlavou, kuřata, strašák
    cow = bpy.data.objects.new("cow", None)
    bpy.context.scene.collection.objects.link(cow)
    cow.location = (-1.0, -0.4, 0.07)
    cp = [sphere((0, 0, 0.2), 0.2, wht, scale=(1.4, 0.85, 0.9), seg=20, rings=14), sphere((0.05, -0.07, 0.25), 0.09, M("kv", "#2a2a35"), scale=(1, 0.5, 0.8), seg=8, rings=6), sphere((-0.12, 0.08, 0.25), 0.08, M("kv2", "#2a2a35"), scale=(1, 0.4, 0.8), seg=8, rings=6)]
    for lx in (-0.16, 0.16):
        for ly in (-0.07, 0.07):
            cp.append(cyl((lx, ly, 0.07), 0.03, 0.14, wht, verts=8))
    for o in cp:
        loc = o.location.copy(); o.parent = cow; o.location = loc
    head = bpy.data.objects.new("hd", None)
    bpy.context.scene.collection.objects.link(head)
    head.parent = cow
    head.location = (0.27, 0, 0.3)
    hs = [sphere((0.07, 0, 0), 0.09, wht, scale=(1.1, 0.9, 0.9), seg=14, rings=10), sphere((0.15, 0, -0.02), 0.045, M("kn", "#ffb0c4", roughness=0.7), seg=8, rings=6), cone((0.02, -0.06, 0.1), 0.02, 0.0, 0.06, hay, verts=6), cone((0.02, 0.06, 0.1), 0.02, 0.0, 0.06, hay, verts=6)]
    for o in hs:
        loc = o.location.copy(); o.parent = head; o.location = loc
    chickens = []
    for k, (x, y) in enumerate(((0.9, -0.3), (1.1, -0.55), (0.7, -0.7))):
        ch = bpy.data.objects.new("ch", None)
        bpy.context.scene.collection.objects.link(ch)
        ch.location = (x, y, 0.07)
        for o in (sphere((0, 0, 0.07), 0.06, wht, scale=(1.2, 0.8, 1), seg=10, rings=8), sphere((0.06, 0, 0.13), 0.035, wht, seg=8, rings=6), cone((0.1, 0, 0.13), 0.015, 0.0, 0.04, M("sn", "#ffb020"), verts=6, rot=(0, math.radians(90), 0)), sphere((0.06, 0, 0.17), 0.015, red, seg=6, rings=4)):
            loc = o.location.copy(); o.parent = ch; o.location = loc
        chickens.append((ch, k))
    # traktor jezdí po kruhu kolem pole
    tractor = bpy.data.objects.new("tr", None)
    bpy.context.scene.collection.objects.link(tractor)
    for o in (box((0, 0, 0.18), (0.32, 0.18, 0.14), M("tg", "#3fa752", roughness=0.5), bevel=0.02), box((-0.06, 0, 0.3), (0.14, 0.15, 0.14), M("tg2", "#2f8f4f"), bevel=0.02),
              cyl((-0.1, -0.1, 0.1), 0.09, 0.05, M("tw", "#2a2a35"), verts=16, rot=(math.radians(90), 0, 0)), cyl((-0.1, 0.1, 0.1), 0.09, 0.05, M("tw2", "#2a2a35"), verts=16, rot=(math.radians(90), 0, 0)),
              cyl((0.12, -0.09, 0.06), 0.055, 0.04, M("tw3", "#2a2a35"), verts=16, rot=(math.radians(90), 0, 0)), cyl((0.12, 0.09, 0.06), 0.055, 0.04, M("tw4", "#2a2a35"), verts=16, rot=(math.radians(90), 0, 0))):
        loc = o.location.copy(); o.parent = tractor; o.location = loc
    # kapky vody a sluníčko
    drops = [sphere((0, 0, 0), 0.02, glow("kp%d" % k, "#9fd8ff", 1.5), seg=6, rings=4) for k in range(10)]
    for (x, y) in ((-1.2, 0.2), (1.2, 0.2)):
        tree(x, y, 1.1, kind="round", leaf="#58c460")
    # strašák
    bar((-0.2, -1.0, 0.07), (-0.2, -1.0, 0.55), 0.02, wood, verts=6)
    bar((-0.35, -1.0, 0.42), (-0.05, -1.0, 0.42), 0.02, wood, verts=6)
    sphere((-0.2, -1.0, 0.6), 0.06, hay, seg=10, rings=8)
    cone((-0.2, -1.0, 0.68), 0.09, 0.0, 0.08, M("hat", "#7a4a2a"), verts=12)

    @anim
    def _f(t):
        ph = t * math.tau
        for k, b in enumerate(blades):
            b.rotation_euler = (0, k * math.pi / 2 + ph, 0)
        head.rotation_euler = (0, 0.25 * math.sin(2 * ph) + 0.15, 0)
        for ch, k in chickens:
            ch.rotation_euler = (0, 0.35 * max(0.0, math.sin(3 * ph + k * 2.0)) ** 2, 0)
        a = -ph
        tractor.location = (0.1 + 1.0 * math.cos(a), -0.2 + 0.9 * math.sin(a), 0.07)
        tractor.rotation_euler = (0, 0, a - math.pi / 2)
        for s, c, r in crops:
            q = 1 + 0.12 * math.sin(ph + c * 0.6 + r)
            s.scale = (q, q, q)
        for k, d in enumerate(drops):
            u = (t * 2 + k / 10.0) % 1.0
            d.location = (-1.2 + 0.4 * u, 0.2 + 0.1 * math.sin(k), 0.6 * (1 - (2 * u - 1) ** 2) + 0.1)
            d.scale = ((math.sin(u * math.pi)),) * 3

    run(lambda t: None, "hra_farma")


# ---------------------------------------------------------------- Město
def mesto():
    setup("hra_mesto", ortho=4.5, target_z=1.25, world=("#cfd8ff", 0.6))
    plinth("#9aa3b8", "#ffffff")
    road, line = M("mro", "#4a4a5a", roughness=0.85), M("mli", "#ffd24d", roughness=0.6)
    glass, concrete = M("mgl", "#8fd0ff", roughness=0.1, metallic=0.4), M("mco", "#d8dbe6", roughness=0.6)
    box((0, 0, 0.06), (2.2, 2.2, 0.04), M("mpa", "#7fcf7a", roughness=0.8), bevel=0.01)
    box((0, -0.35, 0.075), (2.2, 0.36, 0.02), road, bevel=0)
    box((0.4, 0, 0.075), (0.36, 2.2, 0.02), road, bevel=0)
    for k in range(7):
        box((-1.0 + k * 0.32, -0.35, 0.09), (0.14, 0.03, 0.004), line, bevel=0)
    # věžáky, domy, obchody (barvy dodávají oknům život)
    rnd = random.Random(2)
    wins = []
    specs = [(-0.75, 0.55, 0.4, 0.4, 1.9, "#9fb0e0"), (-0.2, 0.7, 0.36, 0.36, 1.5, "#e0a0b8"), (-0.85, -0.1, 0.34, 0.34, 0.9, "#f0d08a"), (0.95, 0.75, 0.42, 0.42, 1.2, "#a0d8c0"), (1.0, 0.1, 0.34, 0.34, 0.7, "#f2b27a"), (-0.35, 0.05, 0.3, 0.3, 0.6, "#c9b8ff")]
    for i, (x, y, w, d, h, c) in enumerate(specs):
        box((x, y, h / 2 + 0.07), (w, d, h), M("mb%d" % i, c, roughness=0.45, metallic=0.2), bevel=0.02)
        box((x, y, h + 0.1), (w + 0.04, d + 0.04, 0.04), concrete, bevel=0.01)
        rows = int(h / 0.18)
        for r in range(rows):
            for cc in range(3):
                wm = glow("w%d_%d_%d" % (i, r, cc), "#ffe9a8", 0.0)
                wx = x - w / 2 + (cc + 0.5) * w / 3
                box((wx, y - d / 2 - 0.005, 0.2 + r * 0.17), (w / 3 - 0.07, 0.01, 0.09), wm, bevel=0)
                wins.append((wm, rnd.random() * math.tau, rnd.random()))
    # anténa na nejvyšší budově, jeřáb, ruské kolo, fontána
    bar((-0.75, 0.55, 2.0), (-0.75, 0.55, 2.45), 0.015, M("an", "#c9ced6", metallic=0.9), verts=8)
    beac = sphere((-0.75, 0.55, 2.47), 0.04, glow("bk", "#ff4d5e", 4.0), seg=10, rings=8)
    crane = bpy.data.objects.new("crane", None)
    bpy.context.scene.collection.objects.link(crane)
    crane.location = (0.95, -0.9, 0.07)
    bar((0, 0, 0), (0, 0, 1.0), 0.03, M("cr", "#ffc933", roughness=0.5), verts=8).parent = crane
    arm = bpy.data.objects.new("arm", None)
    bpy.context.scene.collection.objects.link(arm)
    arm.parent = crane
    arm.location = (0, 0, 1.0)
    bar((-0.25, 0, 0), (0.75, 0, 0), 0.025, M("cr2", "#ffc933", roughness=0.5), verts=8).parent = arm
    box((0.55, 0, -0.18), (0.14, 0.14, 0.1), M("kb", "#ff5a3c"), bevel=0.01).parent = arm
    bar((0.55, 0, 0), (0.55, 0, -0.14), 0.008, M("lano", "#2a2a35"), verts=6).parent = arm
    EYE = Vector((-1.0, -0.95, 0.65))
    eye = bpy.data.objects.new("eye", None)
    bpy.context.scene.collection.objects.link(eye)
    eye.location = tuple(EYE)
    torus((0, 0, 0), 0.5, 0.015, M("ew", "#ffffff", roughness=0.4), rot=(math.radians(90), 0, 0)).parent = eye
    cabs = []
    for k in range(8):
        c = box((0, 0, 0), (0.1, 0.07, 0.08), M("ec%d" % (k % 3), ["#ff5a3c", "#3b9bff", "#ffd24d"][k % 3], roughness=0.5), bevel=0.01)
        c.parent = eye
        cabs.append((c, k))
    for k in range(4):
        sp = box((0, 0, 0), (1.0, 0.008, 0.008), M("es", "#ffffff"), bevel=0)
        sp.parent = eye
        sp.rotation_euler = (0, k * math.pi / 4, 0)
    bar((-0.12, 0, -0.65), (0, 0, 0), 0.02, M("ef", "#ffffff"), verts=6).parent = eye
    bar((0.12, 0, -0.65), (0, 0, 0), 0.02, M("ef2", "#ffffff"), verts=6).parent = eye
    cyl((0.1, 0.55, 0.1), 0.2, 0.06, M("fo", "#c9ced6", roughness=0.4, metallic=0.6), verts=24)
    jets = [sphere((0, 0, 0), 0.025, glow("fj%d" % k, "#9fd8ff", 1.8), seg=6, rings=4) for k in range(12)]
    # auta jezdí po silnicích, tramvaj
    cars = []
    for k, c in enumerate(("#ff5a3c", "#3b9bff", "#ffd24d", "#7ee0b0")):
        car = bpy.data.objects.new("car", None)
        bpy.context.scene.collection.objects.link(car)
        for o in (box((0, 0, 0.1), (0.2, 0.1, 0.07), M("ca%d" % k, c, roughness=0.35), bevel=0.02), box((0, 0, 0.16), (0.1, 0.08, 0.05), glass, bevel=0.01),
                  cyl((-0.06, 0.05, 0.05), 0.03, 0.02, M("tw", "#16132b"), verts=10, rot=(math.radians(90), 0, 0)), cyl((0.06, 0.05, 0.05), 0.03, 0.02, M("tw", "#16132b"), verts=10, rot=(math.radians(90), 0, 0)),
                  cyl((-0.06, -0.05, 0.05), 0.03, 0.02, M("tw", "#16132b"), verts=10, rot=(math.radians(90), 0, 0)), cyl((0.06, -0.05, 0.05), 0.03, 0.02, M("tw", "#16132b"), verts=10, rot=(math.radians(90), 0, 0))):
            loc = o.location.copy(); o.parent = car; o.location = loc
        cars.append((car, k))
    for (x, y) in ((-0.2, -0.8), (0.9, -0.95), (-1.0, 0.95)):
        tree(x, y, 1.1, kind="round")
    lamps = [glow("ll%d" % i, "#ffe2a0", 3.0) for i in range(3)]
    for i, (x, y) in enumerate(((-0.4, -0.58), (0.2, -0.58), (0.62, 0.4))):
        lamp_post(x, y, lamps[i], z=0.07, h=0.35)

    @anim
    def _c(t):
        ph = t * math.tau
        for wm, p, th in wins:
            set_glow(wm, 2.2 if (th + 0.4 * math.sin(ph + p)) > 0.55 else 0.0)
        set_glow(beac.data.materials[0], 1.0 + 4.0 * max(0.0, math.sin(2 * ph)))
        arm.rotation_euler = (0, 0, 0.7 * math.sin(ph))
        eye.rotation_euler = (0, -ph, 0)
        for c, k in cabs:
            a = ph + k * math.tau / 8
            c.location = (0.5 * math.sin(a), 0, 0.5 * math.cos(a))
            c.rotation_euler = (0, 0, 0)
        for car, k in cars:
            u = (t + k * 0.25) % 1.0
            if k % 2 == 0:
                car.location = (-1.05 + 2.1 * u, -0.42 if k == 0 else -0.28, 0.0)
                car.rotation_euler = (0, 0, 0 if k == 0 else math.pi)
                if k == 2:
                    car.location.x = 1.05 - 2.1 * u
            else:
                car.location = (0.46 if k == 1 else 0.34, -1.0 + 2.0 * u, 0.0)
                car.rotation_euler = (0, 0, math.pi / 2)
        for k, j in enumerate(jets):
            u = (t * 2 + k / 12.0) % 1.0
            a = k * 2.4
            j.location = (0.1 + 0.07 * math.cos(a) * u, 0.55 + 0.07 * math.sin(a) * u, 0.15 + 0.35 * 4 * u * (1 - u) * 1.0)
            j.scale = ((math.sin(u * math.pi)),) * 3
        for i, m in enumerate(lamps):
            set_glow(m, 3.0 + 1.4 * math.sin(2 * ph + i * 2))

    run(lambda t: None, "hra_mesto")


JOBS = {"zakladna": zakladna, "mazlicci": mazlicci, "farma": farma, "mesto": mesto}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
