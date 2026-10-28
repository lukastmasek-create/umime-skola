"""Únikové místnosti jako dioramata: muzeum, expedice, džungle, pirátská loď, kuchyně, knihovna,
observatoř, hrad a laboratoř. Malá scéna na podstavci, 24 snímků smyčky, průhledné pozadí.
Spuštění: python unikovky.py -- muzeum   (každá ve vlastním procesu)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

M = lambda n, c, **k: material(n, c, **k)


def empty():
    o = bpy.data.objects.new("grp", None)
    bpy.context.scene.collection.objects.link(o)
    return o


def child(o, p):
    loc = o.location.copy()
    o.parent = p
    o.location = loc
    return o


def rise(objs, t, x, y, z0, h, grow=1.0, drift=0.0):
    """Částice (pára, jiskry, bubliny) stoupají smyčkou a zmenšují se na konci."""
    n = len(objs)
    for i, o in enumerate(objs):
        q = (t + i / n) % 1.0
        o.location = (x + drift * math.sin(q * 6 + i), y, z0 + q * h)
        s = grow * math.sin(math.pi * q) ** 0.6
        o.scale = (s, s, s)


def books(x, y, z, n, mats, w=0.07, h=0.2, d=0.12, along="y"):
    for k in range(n):
        hh = h * (0.8 + 0.2 * ((k * 7) % 3) / 2)
        loc = (x, y + k * w, z + hh / 2) if along == "y" else (x + k * w, y, z + hh / 2)
        box(loc, (d, w * 0.92, hh) if along == "y" else (w * 0.92, d, hh), mats[k % len(mats)], bevel=0.004)


# ---------------------------------------------------------------- Muzeum
def muzeum():
    setup("uni_muzeum", ortho=4.4, target_z=1.1, world=("#ffe9c9", 0.6))
    plinth("#8a5a3a", "#f1e3c6")
    marble, gold, wood = stone_material("mu_m", "#efe8da", 14, 0.12, 0.35), M("mu_g", "#ffc933", roughness=0.28, metallic=0.9), M("mu_w", "#6b3f25", roughness=0.6)
    red = M("mu_r", "#a3262f", roughness=0.8)
    box((0, 0, 0.05), (2.0, 2.0, 0.05), M("mu_f", "#b8864f", roughness=0.5), bevel=0.01)
    box((0, 0.98, 0.05), (2.0, 0.08, 0.05), red, bevel=0.005)  # koberec
    # zadní stěna s obrazy
    wall = M("mu_wall", "#8f2f3d", roughness=0.9)
    box((0, 0.98, 0.7), (2.0, 0.06, 1.3), wall, bevel=0.01)
    box((-0.98, 0, 0.7), (0.06, 2.0, 1.3), wall, bevel=0.01)
    for x, c in ((-0.55, "#4a7fd6"), (0.1, "#e6a43b"), (0.7, "#4fb57a")):
        box((x, 0.94, 0.85), (0.4, 0.03, 0.5), gold, bevel=0.01)
        box((x, 0.925, 0.85), (0.33, 0.02, 0.43), M("mu_p" + c, c, roughness=0.6), bevel=0)
    for y, c in ((-0.3, "#d6634a"), (0.35, "#9b6bd6")):
        box((-0.94, y, 0.85), (0.03, 0.4, 0.5), gold, bevel=0.01)
        box((-0.925, y, 0.85), (0.02, 0.33, 0.43), M("mu_q" + c, c, roughness=0.6), bevel=0)
    # sloupy
    for x in (-0.8, 0.8):
        cyl((x, 0.75, 0.16), 0.13, 0.1, marble, verts=24)
        cyl((x, 0.75, 0.62), 0.09, 0.8, marble, verts=24)
        cyl((x, 0.75, 1.07), 0.13, 0.1, marble, verts=24)
    # podstavec s artefaktem pod sklem
    cyl((0, 0, 0.3), 0.3, 0.5, marble, verts=32)
    cyl((0, 0, 0.58), 0.33, 0.06, gold, verts=32)
    glass = M("mu_gl", "#d8f4ff", roughness=0.05, alpha=0.22) if False else M("mu_gl", "#d8f4ff", roughness=0.05)
    gem_mat = glow("mu_gem", "#6fe9ff", 3.0)
    gem = bpy.data.objects.new("gem", None)
    bpy.context.scene.collection.objects.link(gem)
    gem.location = (0, 0, 0.9)
    child(sphere((0, 0, 0.9), 0.13, gem_mat, scale=(0.8, 0.8, 1.3), seg=6, rings=4), gem)
    cyl((0, 0, 0.78), 0.02, 0.2, gold, verts=10)
    # amfora na druhém podstavci
    box((0.55, -0.2, 0.25), (0.34, 0.34, 0.4), marble, bevel=0.01)
    amph = M("mu_am", "#c8642f", roughness=0.55)
    sphere((0.55, -0.2, 0.62), 0.14, amph, scale=(1, 1, 1.15), seg=20, rings=14)
    cyl((0.55, -0.2, 0.84), 0.05, 0.14, amph, verts=16)
    for s in (-1, 1):
        torus((0.55 + s * 0.14, -0.2, 0.68), 0.05, 0.012, amph, rot=(math.radians(90), 0, 0))
    # lano a kužely světla
    beam = glow("mu_beam", "#fff2b8", 0.6)
    spot = cone((0, 0, 0.7), 0.5, 0.05, 1.4, beam, verts=32)
    for o in (spot,):
        o.hide_render = True  # jen měkký nádech, bez kužele (bylo by plné)
    dust = [sphere((0, 0, 0), 0.012, glow("mu_d%d" % k, "#fff6cf", 4.0), seg=6, rings=4) for k in range(12)]
    rnd = random.Random(2)
    dp = [(rnd.uniform(-0.45, 0.45), rnd.uniform(-0.4, 0.4)) for _ in dust]

    @anim
    def _m(t):
        ph = t * math.tau
        gem.rotation_euler = (0, 0, ph)
        gem.location.z = 0.9 + 0.035 * math.sin(ph)
        set_glow(gem_mat, 2.4 + 1.2 * math.sin(2 * ph))
        for i, (d, (x, y)) in enumerate(zip(dust, dp)):
            q = (t + i / len(dust)) % 1.0
            d.location = (x + 0.05 * math.sin(ph + i), y, 0.7 + 0.9 * q)
            s = math.sin(math.pi * q)
            d.scale = (s, s, s)

    run(lambda t: None, "uni_muzeum")


# ---------------------------------------------------------------- Expedice
def expedice():
    setup("uni_expedice", ortho=4.4, target_z=1.0, world=("#ffe0b0", 0.65))
    plinth("#e3c079", "#f6e6bf")
    canvas, red, wood = M("ex_c", "#f0e2bf", roughness=0.9), M("ex_r", "#c4452f", roughness=0.8), M("ex_w", "#6b4a2b", roughness=0.8)
    stone = stone_material("ex_s", "#c9a56a", 12, 0.3, 0.9)
    # pyramida v pozadí
    pyr = cone((0.35, 0.65, 0.4), 0.7, 0.0, 0.8, stone, verts=4, rot=(0, 0, math.radians(45)), smooth=False)
    cone((-0.7, 0.55, 0.22), 0.4, 0.0, 0.45, stone, verts=4, rot=(0, 0, math.radians(20)), smooth=False)
    # stan
    tent = prism(-0.45, 0.45, -0.38, 0.38, 0.03, 0.62, canvas)
    tent.location = (-0.55, -0.25, 0.0)
    tent.rotation_euler = (0, 0, math.radians(20))
    box((-0.55, -0.62, 0.26), (0.02, 0.02, 0.5), wood)
    # vlajka na tyči
    pole((-0.2, -0.05, 0.03), (-0.2, -0.05, 1.05), mat=wood, ball=False)
    fl = Flag((-0.2, -0.05, 1.04), 0.4, 0.24, [red, M("ex_f2", "#ffc933", roughness=0.6)], lambda u, v: 0 if v < 0.6 else 1, amp=0.07, waves=1.6)
    # oheň
    for k in range(6):
        a = k * math.tau / 6
        box((0.5 + 0.13 * math.cos(a), -0.35 + 0.13 * math.sin(a), 0.06), (0.2, 0.05, 0.05), M("ex_lg", "#4b3220", roughness=0.9), rot=(0, 0, a + 1.57), bevel=0.01)
    fire_m = glow("ex_fire", "#ff9a2b", 6.0)
    flames = [cone((0.5, -0.35, 0.09), 0.1 - 0.015 * k, 0.0, 0.26 + 0.05 * k, glow("ex_fl%d" % k, ["#ff6a1f", "#ffb02e", "#ffe27a"][k % 3], 5.0), verts=10) for k in range(3)]
    sparks = [sphere((0, 0, 0), 0.012, fire_m, seg=6, rings=4) for k in range(8)]
    # kaktusy a palma
    green = M("ex_g", "#3f9a54", roughness=0.7)
    for x, y, s in ((0.95, -0.2, 1.0), (0.8, 0.1, 0.7)):
        cyl((x, y, 0.03 + 0.17 * s), 0.05 * s, 0.34 * s, green, verts=12)
        sphere((x, y, 0.2 * s + 0.2), 0.05 * s, green, seg=10, rings=8)
        bar((x, y, 0.2 * s), (x + 0.1 * s, y, 0.28 * s), 0.025 * s, green, verts=8)
        bar((x + 0.1 * s, y, 0.28 * s), (x + 0.1 * s, y, 0.38 * s), 0.025 * s, green, verts=8)
    # stůl s mapou a kompas
    box((0.1, -0.6, 0.21), (0.5, 0.34, 0.03), wood, bevel=0.008)
    for dx, dy in ((-0.2, -0.13), (0.2, -0.13), (-0.2, 0.13), (0.2, 0.13)):
        box((0.1 + dx, -0.6 + dy, 0.1), (0.03, 0.03, 0.2), wood)
    box((0.02, -0.6, 0.232), (0.3, 0.22, 0.006), M("ex_map", "#e7d5a2", roughness=0.9), rot=(0, 0, 0.2), bevel=0)
    cyl((0.28, -0.58, 0.24), 0.07, 0.02, M("ex_cb", "#c9a03a", roughness=0.3, metallic=0.9), verts=24)
    need = empty()
    need.location = (0.28, -0.58, 0.255)
    bar((-0.045, 0, 0), (0.045, 0, 0), 0.008, red, verts=6).parent = need

    @anim
    def _e(t):
        ph = t * math.tau
        fl.update(t)
        need.rotation_euler = (0, 0, 0.5 * math.sin(ph) + 3 * math.sin(2 * ph) * 0.1)
        for i, f in enumerate(flames):
            s = 1 + 0.18 * math.sin(2 * ph + i * 2)
            f.scale = (1 - 0.1 * math.sin(2 * ph + i), 1 - 0.1 * math.sin(2 * ph + i), s)
        rise(sparks, t, 0.5, -0.35, 0.3, 0.9, grow=1.0, drift=0.08)

    run(lambda t: None, "uni_expedice")


# ---------------------------------------------------------------- Džungle
def dzungle():
    setup("uni_dzungle", ortho=4.4, target_z=1.1, world=("#d6f5c8", 0.6))
    plinth("#3f8f4a", "#d9f0c4")
    stone = stone_material("dz_s", "#8a9a7c", 14, 0.4, 0.95)
    moss = M("dz_m", "#3f8a3f", roughness=0.9)
    trunk, leaf, leaf2 = M("dz_t", "#6a4a2e", roughness=0.9), M("dz_l", "#2f9c4a", roughness=0.7), M("dz_l2", "#52c05a", roughness=0.7)
    # chrám
    for k in range(3):
        box((0.3, 0.2, 0.08 + 0.17 * k), (1.1 - 0.28 * k, 0.9 - 0.24 * k, 0.17), stone, bevel=0.012)
    box((0.3, 0.2, 0.68), (0.4, 0.34, 0.3), stone, bevel=0.012)
    box((0.3, 0.02, 0.67), (0.16, 0.04, 0.2), M("dz_d", "#1d2a1a", roughness=0.9), bevel=0)
    for dx in (-0.4, 0.4):
        box((0.3 + dx, 0.2, 0.2), (0.12, 0.12, 0.35), moss, bevel=0.01)
    # idol se zářícíma očima
    idol_m = glow("dz_eye", "#7dff5a", 3.0)
    box((-0.65, -0.35, 0.3), (0.3, 0.3, 0.55), stone, bevel=0.02)
    sphere((-0.65, -0.35, 0.68), 0.19, stone, seg=16, rings=12)
    for dx in (-0.07, 0.07):
        sphere((-0.65 + dx, -0.52, 0.7), 0.03, idol_m, seg=10, rings=8)
    box((-0.65, -0.53, 0.6), (0.14, 0.04, 0.04), M("dz_mo", "#2b3a2a", roughness=0.9), bevel=0)
    # strom s lianami
    cyl((0.95, -0.4, 0.55), 0.09, 1.1, trunk, verts=12)
    for a in (0, 2.1, 4.2):
        sphere((0.95 + 0.25 * math.cos(a), -0.4 + 0.25 * math.sin(a), 1.25), 0.3, leaf if a else leaf2, scale=(1, 1, 0.7), seg=14, rings=10)
    vines = []
    for k, (x, y) in enumerate(((0.8, -0.5), (1.1, -0.3), (0.9, -0.2))):
        v = empty()
        v.location = (x, y, 1.2)
        bar((0, 0, 0), (0, 0, -0.7 - 0.12 * k), 0.012, M("dz_v", "#2f7a35", roughness=0.8), verts=6).parent = v
        child(sphere((x, y, 0.5 - 0.12 * k), 0.03, leaf2, seg=8, rings=6), v)
        vines.append(v)
    for x, y, s in ((-0.2, -0.7, 1.2), (0.0, -0.4, 0.9), (-1.0, 0.1, 1.0)):
        for a in range(5):
            r = a * math.tau / 5
            cone((x + 0.1 * s * math.cos(r), y + 0.1 * s * math.sin(r), 0.14 * s), 0.06 * s, 0.0, 0.3 * s, leaf if a % 2 else leaf2, verts=8, rot=(0.5 * math.sin(r), -0.5 * math.cos(r), 0))
    # papoušek
    bird = Bird(M("dz_pb", "#e8393f", roughness=0.6), M("dz_pw", "#2f6fe0", roughness=0.6), M("dz_pk", "#ffc933"), s=1.3)
    # světlušky
    flies = [sphere((0, 0, 0), 0.014, glow("dz_fl%d" % k, "#d6ff7a", 6.0), seg=6, rings=4) for k in range(10)]
    rnd = random.Random(5)
    fp = [(rnd.uniform(-1, 1), rnd.uniform(-0.6, 0.8), rnd.uniform(0.2, 1.0), rnd.uniform(0, 6)) for _ in flies]

    @anim
    def _d(t):
        ph = t * math.tau
        for i, v in enumerate(vines):
            v.rotation_euler = (0.18 * math.sin(ph + i * 2), 0.15 * math.cos(ph + i), 0)
        set_glow(idol_m, 2.2 + 2.0 * max(0, math.sin(ph)))
        a = ph
        bird.place((-0.1 + 0.55 * math.cos(a), -0.1 + 0.4 * math.sin(a), 1.2 + 0.08 * math.sin(2 * a)), a + math.pi / 2, 0.7 * math.sin(ph * 4))
        for i, (f, (x, y, z, o)) in enumerate(zip(flies, fp)):
            f.location = (x + 0.1 * math.sin(ph + o), y + 0.1 * math.cos(ph * 2 + o), z + 0.08 * math.sin(ph * 3 + o))
            s = 0.4 + 0.6 * max(0, math.sin(ph * 2 + o)) ** 2
            f.scale = (s, s, s)

    run(lambda t: None, "uni_dzungle")


# ---------------------------------------------------------------- Pirátská loď
def pirati():
    setup("uni_pirati", ortho=4.4, target_z=1.15, world=("#bfe6ff", 0.65))
    plinth("#2d7fc0", "#d9efff")
    wood, dark, sail = M("pi_w", "#7a4a26", roughness=0.7), M("pi_d", "#4a2c16", roughness=0.8), M("pi_s", "#f4ecd6", roughness=0.9)
    sand = M("pi_sand", "#f0d08a", roughness=0.9)
    # vlny
    waves = []
    for k in range(3):
        waves.append(torus((0, 0, 0.06), 0.85 + 0.15 * k, 0.025, glow("pi_wv%d" % k, "#d9f3ff", 0.6), rot=(0, 0, 0)))
    # trup lodi
    hull = box((-0.1, 0, 0.3), (1.2, 0.5, 0.26), wood, bevel=0.05)
    cone((0.62, 0, 0.3), 0.25, 0.0, 0.34, wood, verts=4, rot=(0, math.radians(90), math.radians(45)), smooth=False)
    box((-0.1, 0, 0.18), (1.1, 0.42, 0.12), dark, bevel=0.03)
    box((-0.55, 0, 0.5), (0.4, 0.44, 0.18), wood, bevel=0.02)
    for k in range(5):
        sphere((-0.3 + 0.18 * k, 0.26, 0.34), 0.035, M("pi_c", "#1e1e24", roughness=0.4, metallic=0.6), seg=10, rings=8)
    # stožáry a plachty
    for x, h in ((-0.2, 1.4), (0.3, 1.2)):
        cyl((x, 0, 0.3 + h / 2), 0.03, h, dark, verts=10)
        for yy, w in ((0.0, 0.5),):
            bar((x, -w, 0.3 + h * 0.85), (x, w, 0.3 + h * 0.85), 0.015, dark, verts=6)
    s1 = box((-0.2, 0, 1.0), (0.04, 0.88, 0.5), sail, bevel=0.01)
    s2 = box((0.3, 0, 0.88), (0.04, 0.8, 0.44), sail, bevel=0.01)
    pole((-0.2, 0, 1.52), (-0.2, 0, 1.68), mat=dark, ball=False)
    fl = Flag((-0.2, 0, 1.68), 0.42, 0.24, [M("pi_fb", "#18181f", roughness=0.8), M("pi_fw", "#f4f4f4", roughness=0.8)],
              lambda u, v: 1 if (abs(u - 0.4) < 0.17 and abs(v - 0.45) < 0.2) else 0, amp=0.07, waves=1.6)
    # truhla s pokladem na ostrůvku
    sand_i = cyl((0.65, -0.62, 0.05), 0.32, 0.1, sand, verts=24)
    tree(0.85, -0.7, 0.9, z=0.1, kind="round", leaf="#2f9c4a")
    box((0.55, -0.6, 0.18), (0.26, 0.16, 0.12), wood, bevel=0.015)
    lid = empty()
    lid.location = (0.55, -0.68, 0.24)
    lidm = box((0, 0.08, 0.025), (0.26, 0.16, 0.05), wood, bevel=0.015)
    lidm.location = (0, 0.08, 0.02)
    lidm.parent = lid
    gold_m = glow("pi_gold", "#ffd23a", 2.6)
    coins = [cyl((0, 0, 0), 0.025, 0.008, gold_m, verts=12) for _ in range(8)]
    # racek
    gull = Bird(M("pi_gb", "#ffffff", roughness=0.6), M("pi_gw", "#d9dde8", roughness=0.6), M("pi_gk", "#ffb02e"), s=1.2)

    @anim
    def _p(t):
        ph = t * math.tau
        fl.update(t)
        bob = 0.03 * math.sin(ph)
        for k, w in enumerate(waves):
            w.scale = (1 + 0.03 * math.sin(ph + k * 2), 1 + 0.03 * math.sin(ph + k * 2), 1)
        lid.rotation_euler = (-math.radians(55) * (0.5 + 0.5 * math.sin(ph)), 0, 0)
        set_glow(gold_m, 2.0 + 1.4 * math.sin(2 * ph))
        rise(coins, t, 0.55, -0.62, 0.22, 0.45, grow=1.0, drift=0.05)
        gull.place((0.1 + 0.9 * math.cos(ph), 0.0 + 0.7 * math.sin(ph), 1.7 + 0.1 * math.sin(2 * ph)), ph + math.pi / 2, 0.7 * math.sin(ph * 4))

    run(lambda t: None, "uni_pirati")


# ---------------------------------------------------------------- Kuchyně
def kuchyne():
    setup("uni_kuchyne", ortho=4.4, target_z=1.05, world=("#ffeccc", 0.65))
    plinth("#e8845e", "#fff0e0")
    tile, steel = M("ku_t", "#f8f3ea", roughness=0.25), M("ku_s", "#cfd5df", roughness=0.25, metallic=0.9)
    red, wood = M("ku_r", "#d9473d", roughness=0.5), M("ku_w", "#a56a3a", roughness=0.6)
    box((0, 0, 0.05), (2.0, 2.0, 0.05), M("ku_fl", "#d8a066", roughness=0.4), bevel=0.01)
    box((0, 0.98, 0.7), (2.0, 0.06, 1.3), M("ku_wall", "#6fb5c9", roughness=0.4), bevel=0.01)
    box((-0.98, 0, 0.7), (0.06, 2.0, 1.3), M("ku_wall2", "#8fc9d6", roughness=0.4), bevel=0.01)
    # linka
    box((0, 0.65, 0.36), (1.6, 0.5, 0.6), red, bevel=0.02)
    box((0, 0.65, 0.68), (1.64, 0.54, 0.05), M("ku_top", "#3d3d46", roughness=0.3), bevel=0.01)
    for x in (-0.35, 0.35, -0.7, 0.7):
        box((x, 0.38, 0.38), (0.26, 0.02, 0.4), M("ku_dr", "#e25a50", roughness=0.4), bevel=0.01)
        sphere((x, 0.365, 0.46), 0.018, steel, seg=8, rings=6)
    # sporák s hrncem
    box((0.1, 0.65, 0.72), (0.6, 0.46, 0.02), steel, bevel=0.005)
    flame_m = glow("ku_fl2", "#6ec6ff", 5.0)
    ring = torus((0.1, 0.65, 0.745), 0.12, 0.012, flame_m)
    pot = cyl((0.1, 0.65, 0.84), 0.15, 0.2, steel, verts=28)
    cyl((0.1, 0.65, 0.945), 0.16, 0.02, steel, verts=28)
    for s in (-1, 1):
        bar((0.1 + s * 0.15, 0.65, 0.88), (0.1 + s * 0.24, 0.65, 0.88), 0.014, M("ku_bl", "#222228", roughness=0.4), verts=6)
    steam = [sphere((0, 0, 0), 0.07, M("ku_st%d" % k, "#ffffff", roughness=1.0), seg=12, rings=8) for k in range(6)]
    # závěsné pánve
    for x, c in ((-0.55, "#2a2a32"), (-0.25, "#b87333")):
        bar((x, 0.93, 1.05), (x, 0.9, 0.82), 0.012, steel, verts=6)
        cyl((x, 0.86, 0.78), 0.12, 0.025, M("ku_pn" + c, c, roughness=0.3, metallic=0.8), verts=24, rot=(math.radians(90), 0, 0))
    # kuchařská čepice a pizza na stole
    box((-0.1, -0.35, 0.22), (0.6, 0.4, 0.04), wood, bevel=0.01)
    for dx, dy in ((-0.26, -0.16), (0.26, -0.16), (-0.26, 0.16), (0.26, 0.16)):
        box((-0.1 + dx, -0.35 + dy, 0.1), (0.04, 0.04, 0.2), wood)
    cyl((-0.1, -0.35, 0.255), 0.17, 0.02, M("ku_pz", "#f2b24a", roughness=0.7), verts=32)
    for k in range(7):
        a = k * 0.9
        cyl((-0.1 + 0.09 * math.cos(a), -0.35 + 0.09 * math.sin(a), 0.275), 0.028, 0.012, M("ku_pe", "#c43a34", roughness=0.7), verts=12)
    hat = M("ku_h", "#ffffff", roughness=0.8)
    hat_o = empty()
    hat_o.location = (0.6, -0.3, 0.1)
    child(cyl((0.6, -0.3, 0.2), 0.12, 0.2, hat, verts=20), hat_o)
    child(sphere((0.6, -0.3, 0.35), 0.17, hat, scale=(1, 1, 0.7), seg=18, rings=12), hat_o)

    @anim
    def _k(t):
        ph = t * math.tau
        set_glow(flame_m.node_tree.nodes["Principled BSDF"].id_data, 4.0 + 1.5 * math.sin(3 * ph))
        rise(steam, t, 0.1, 0.65, 0.98, 0.85, grow=1.0, drift=0.07)
        hat_o.location.z = 0.1 + 0.05 * abs(math.sin(ph))
        hat_o.rotation_euler = (0, 0, 0.2 * math.sin(ph))

    run(lambda t: None, "uni_kuchyne")


# ---------------------------------------------------------------- Knihovna
def knihovna():
    setup("uni_knihovna", ortho=4.4, target_z=1.1, world=("#ffe3c0", 0.55))
    plinth("#6b3f25", "#e8d5b0")
    wood, dark = M("kn_w", "#7a4a26", roughness=0.55), M("kn_d", "#4d2d17", roughness=0.6)
    box((0, 0, 0.05), (2.0, 2.0, 0.05), M("kn_f", "#b8864f", roughness=0.5), bevel=0.01)
    box((0, 0.2, 0.052), (1.2, 1.0, 0.012), M("kn_rug", "#a33a4a", roughness=0.9), bevel=0)
    colors = [M("kn_b%d" % k, c, roughness=0.7) for k, c in enumerate(["#c4452f", "#2f6fb5", "#e0a93b", "#3f8f5a", "#7a4aa8", "#e8e0cc"])]
    # police podél dvou stěn
    box((0, 0.95, 0.65), (2.0, 0.14, 1.2), dark, bevel=0.01)
    box((-0.95, 0, 0.65), (0.14, 2.0, 1.2), dark, bevel=0.01)
    for z in (0.28, 0.62, 0.96):
        box((0, 0.93, z - 0.12), (1.9, 0.18, 0.03), wood, bevel=0.005)
        box((-0.93, 0, z - 0.12), (0.18, 1.9, 0.03), wood, bevel=0.005)
        books(-0.8, 0.9, z - 0.1, 22, colors, w=0.075, h=0.22, d=0.12, along="x")
        books(-0.9, -0.8, z - 0.1, 22, colors, w=0.075, h=0.22, d=0.12, along="y")
    # žebřík
    for dy in (-0.07, 0.07):
        bar((0.75 + dy, 0.8, 0.05), (0.75 + dy, 0.62, 1.1), 0.018, wood, verts=8)
    for k in range(6):
        z = 0.2 + 0.16 * k
        bar((0.68, 0.8 - 0.17 * (z - 0.05) / 1.05, z), (0.82, 0.8 - 0.17 * (z - 0.05) / 1.05, z), 0.012, wood, verts=6)
    # čtecí stůl s lampou a svíčkou
    box((0.0, -0.3, 0.32), (0.7, 0.45, 0.04), wood, bevel=0.01)
    for dx, dy in ((-0.3, -0.18), (0.3, -0.18), (-0.3, 0.18), (0.3, 0.18)):
        box((dx, -0.3 + dy, 0.17), (0.05, 0.05, 0.3), wood)
    candle_m, flame_m = M("kn_ca", "#f6f0dc", roughness=0.6), glow("kn_fl", "#ffb23a", 7.0)
    cyl((-0.25, -0.3, 0.42), 0.035, 0.16, candle_m, verts=12)
    flame = cone((-0.25, -0.3, 0.52), 0.03, 0.0, 0.08, flame_m, verts=10)
    # létající otevřená kniha
    bk = empty()
    bk.location = (0.05, -0.3, 0.9)
    lp = box((-0.1, 0, 0), (0.18, 0.24, 0.02), colors[1], bevel=0.004)
    rp = box((0.1, 0, 0), (0.18, 0.24, 0.02), colors[1], bevel=0.004)
    lp.parent, rp.parent = bk, bk
    # lítající stránky
    pages = [box((0, 0, 0), (0.12, 0.17, 0.004), M("kn_pg", "#fdf8e8", roughness=0.9), bevel=0) for _ in range(6)]
    glowing = [sphere((0, 0, 0), 0.012, glow("kn_g%d" % k, "#ffe9a0", 6.0), seg=6, rings=4) for k in range(10)]

    @anim
    def _kn(t):
        ph = t * math.tau
        bk.location.z = 0.9 + 0.05 * math.sin(ph)
        bk.rotation_euler = (0, 0, 0.3 * math.sin(ph))
        lp.rotation_euler = (0, 0.18 + 0.05 * math.sin(2 * ph), 0)
        rp.rotation_euler = (0, -0.18 - 0.05 * math.sin(2 * ph), 0)
        set_glow(flame_m, 5.0 + 2.5 * math.sin(3 * ph) * math.cos(ph))
        flame.scale = (1 + 0.1 * math.sin(3 * ph), 1 + 0.1 * math.sin(3 * ph), 1 + 0.25 * math.sin(4 * ph))
        for i, p in enumerate(pages):
            q = (t + i / len(pages)) % 1.0
            a = q * math.tau
            p.location = (0.05 + 0.5 * math.cos(a + i), -0.3 + 0.35 * math.sin(a + i), 0.7 + 0.5 * q)
            p.rotation_euler = (ph + i, 0.4, a)
            s = math.sin(math.pi * q) ** 0.5
            p.scale = (s, s, s)
        rise(glowing, t, 0.05, -0.3, 0.85, 0.7, grow=1.0, drift=0.2)

    run(lambda t: None, "uni_knihovna")


# ---------------------------------------------------------------- Observatoř
def observator():
    setup("uni_observator", ortho=4.4, target_z=1.2, world=("#5a68c8", 0.35))
    plinth("#2b2f6b", "#8fa2ff")
    white, dark, gold = M("ob_w", "#e8ecf8", roughness=0.35), M("ob_d", "#3b3f66", roughness=0.4, metallic=0.5), M("ob_g", "#ffc933", roughness=0.3, metallic=0.9)
    # věž
    cyl((0, 0, 0.5), 0.62, 0.9, M("ob_t", "#c8cfe8", roughness=0.4), verts=40)
    torus((0, 0, 0.96), 0.64, 0.035, gold)
    # otáčivá kopule s průzorem
    dome = empty()
    dome.location = (0, 0, 0.96)
    mesh = sphere((0, 0, 0), 0.62, white, seg=40, rings=22)
    mesh.parent = dome
    slit = box((0.5, 0, 0.3), (0.3, 0.2, 0.7), glow("ob_slit", "#101540", 0.0), bevel=0)
    slit.parent = dome
    slit.rotation_euler = (0, math.radians(38), 0)
    slit.location = (0.38, 0, 0.38)
    cyl((0, 0, 0.0), 0.02, 0.03, gold, verts=8).parent = dome
    # dalekohled v průzoru
    tel = empty()
    tel.location = (0, 0, 1.15)
    child(cyl((0.12, 0, 0.12), 0.07, 0.6, M("ob_te", "#d94a4a", roughness=0.4), rot=(0, math.radians(50), 0)), tel)
    # okna věže
    win = glow("ob_win", "#ffe9a0", 2.0)
    for k in range(6):
        a = k * math.tau / 6 + 0.3
        box((0.62 * math.cos(a), 0.62 * math.sin(a), 0.5), (0.1, 0.04, 0.24), win, rot=(0, 0, a - 1.57), bevel=0.005)
    # měsíc a hvězdy
    moon_m = glow("ob_moon", "#fff4c8", 1.5)
    moon = sphere((1.2, 0.8, 1.9), 0.25, moon_m, seg=24, rings=16)
    stars = [sphere((0, 0, 0), 0.02, glow("ob_st%d" % k, "#ffffff", 8.0), seg=6, rings=4) for k in range(18)]
    rnd = random.Random(9)
    sp = [(rnd.uniform(-1.8, 1.8), rnd.uniform(-1.0, 1.4), rnd.uniform(1.0, 2.8), rnd.uniform(0, 6)) for _ in stars]
    # padající hvězda
    shoot = sphere((0, 0, 0), 0.03, glow("ob_sh", "#fff", 10.0), scale=(4, 1, 1), seg=8, rings=6)
    # planeta s prstencem
    pl = sphere((-1.3, 0.6, 1.5), 0.22, M("ob_pl", "#e8845e", roughness=0.6), seg=20, rings=14)
    torus((-1.3, 0.6, 1.5), 0.36, 0.015, M("ob_rg", "#f0d0a0", roughness=0.5), rot=(math.radians(75), 0, 0.3))

    @anim
    def _o(t):
        ph = t * math.tau
        dome.rotation_euler = (0, 0, 0.5 * math.sin(ph))
        tel.rotation_euler = (0, 0, 0.5 * math.sin(ph))
        for s, (x, y, z, o) in zip(stars, sp):
            q = 0.3 + 0.7 * max(0, math.sin(ph * 2 + o)) ** 2
            s.location = (x, y, z)
            s.scale = (q, q, q)
        q = (t * 2) % 1.0
        shoot.location = (1.8 - 2.6 * q, 0.6, 2.6 - 1.2 * q)
        shoot.rotation_euler = (0, math.radians(25), 0)
        k = math.sin(math.pi * q)
        shoot.scale = (4 * k, k, k)
        pl.rotation_euler = (0, 0, ph)
        set_glow(moon_m, 1.3 + 0.3 * math.sin(ph))

    run(lambda t: None, "uni_observator")


# ---------------------------------------------------------------- Hrad
def hrad():
    setup("uni_hrad", ortho=4.4, target_z=1.2, world=("#cfd8ff", 0.6))
    plinth("#5a8f4a", "#d8dcea")
    stone = stone_material("hr_s", "#aab0c4", 18, 0.35, 0.9)
    roof = M("hr_r", "#c4452f", roughness=0.6)
    # hradba
    box((0, 0.1, 0.4), (1.6, 1.1, 0.7), stone, bevel=0.015)
    for k in range(9):
        box((-0.72 + 0.18 * k, -0.43, 0.82), (0.1, 0.08, 0.14), stone, bevel=0.008)
    # věže
    towers = [(-0.8, -0.4, 1.0, 0.2), (0.8, -0.4, 1.0, 0.2), (-0.8, 0.6, 1.2, 0.22), (0.8, 0.6, 1.2, 0.22)]
    for x, y, h, r in towers:
        cyl((x, y, h / 2), r, h, stone, verts=20)
        cone((x, y, h + 0.17), r * 1.35, 0.0, 0.4, roof, verts=20)
        pointed_window(x, y - r + 0.0, h * 0.6, 0.07, 0.16, M("hr_w", "#1e2240", roughness=0.8))
    # hlavní věž s vlajkou
    cyl((0, 0.35, 0.8), 0.28, 1.6, stone, verts=24)
    cone((0, 0.35, 1.8), 0.36, 0.0, 0.5, roof, verts=24)
    pole((0, 0.35, 2.0), (0, 0.35, 2.25), mat=M("hr_p", "#3b3a4a", roughness=0.4), ball=False)
    fl = Flag((0, 0.35, 2.25), 0.45, 0.26, [M("hr_f1", "#2f6fe0", roughness=0.6), M("hr_f2", "#ffc933", roughness=0.6)], lambda u, v: 0 if u < 0.5 else 1, amp=0.07, waves=1.6)
    # brána a padací most
    dark = M("hr_dk", "#1a1424", roughness=0.9)
    box((0, -0.43, 0.3), (0.34, 0.06, 0.5), dark, bevel=0)
    cyl((0, -0.46, 0.55), 0.17, 0.05, dark, verts=20, rot=(math.radians(90), 0, 0))
    bridge = empty()
    bridge.location = (0, -0.48, 0.07)
    child(box((0, -0.28, 0.0), (0.34, 0.5, 0.03), M("hr_br", "#7a4a26", roughness=0.7), bevel=0.005), bridge)
    for dx in (-0.14, 0.14):
        bar((dx, -0.48, 0.5), (dx, -0.5, 0.07), 0.008, M("hr_ch", "#444", roughness=0.4, metallic=0.8), verts=6)
    # voda v příkopu
    torus((0, 0.1, 0.03), 1.02, 0.06, M("hr_wt", "#4aa8e8", roughness=0.15))
    # pochodně
    torch_m = glow("hr_tr", "#ff9a2b", 6.0)
    tfs = []
    for x in (-0.3, 0.3):
        bar((x, -0.5, 0.3), (x, -0.5, 0.62), 0.012, M("hr_tp", "#4b3220", roughness=0.8), verts=6)
        tfs.append(cone((x, -0.5, 0.66), 0.045, 0.0, 0.14, torch_m, verts=10))
    # drak? raději netopýři
    bats = []
    for k in range(3):
        b = empty()
        child(sphere((0, 0, 0), 0.03, M("hr_bt", "#2a2438", roughness=0.8), seg=8, rings=6), b)
        wings = []
        for s in (-1, 1):
            w = empty()
            w.parent = b
            box((s * 0.06, 0, 0), (0.12, 0.05, 0.005), M("hr_bw", "#2a2438", roughness=0.8), bevel=0).parent = w
            wings.append((w, s))
        bats.append((b, wings))
    # rytíř (obrněná socha) vedle brány
    arm = M("hr_ar", "#c8d0e0", roughness=0.3, metallic=0.9)
    cyl((0.62, -0.62, 0.22), 0.06, 0.34, arm, verts=12)
    sphere((0.62, -0.62, 0.45), 0.065, arm, seg=12, rings=8)
    bar((0.7, -0.62, 0.1), (0.7, -0.62, 0.6), 0.01, M("hr_sp", "#7a4a26", roughness=0.7), verts=6)
    cone((0.7, -0.62, 0.65), 0.02, 0.0, 0.1, arm, verts=8)

    @anim
    def _h(t):
        ph = t * math.tau
        fl.update(t)
        bridge.rotation_euler = (-0.08 + 0.05 * math.sin(ph), 0, 0)
        for i, f in enumerate(tfs):
            set_glow(torch_m, 4.5 + 2.0 * math.sin(3 * ph) * math.cos(ph))
            f.scale = (1 + 0.1 * math.sin(3 * ph + i), 1 + 0.1 * math.sin(3 * ph + i), 1 + 0.3 * math.sin(4 * ph + i * 2))
        for i, (b, wings) in enumerate(bats):
            a = ph + i * 2.1
            b.location = (0.8 * math.cos(a), 0.3 + 0.7 * math.sin(a), 2.0 + 0.15 * math.sin(2 * a))
            b.rotation_euler = (0, 0, a + math.pi / 2)
            for w, s in wings:
                w.rotation_euler = (s * 0.7 * math.sin(ph * 4 + i), 0, 0)

    run(lambda t: None, "uni_hrad")


# ---------------------------------------------------------------- Laboratoř
def laborator():
    setup("uni_laborator", ortho=4.4, target_z=1.05, world=("#d4f0ff", 0.6))
    plinth("#3b4f7a", "#bfe8ff")
    tile, steel = M("lb_t", "#eef4f8", roughness=0.2), M("lb_s", "#cfd5df", roughness=0.25, metallic=0.9)
    box((0, 0, 0.05), (2.0, 2.0, 0.05), M("lb_f", "#a9bfd6", roughness=0.25), bevel=0.01)
    box((0, 0.98, 0.7), (2.0, 0.06, 1.3), M("lb_w", "#6a8fc4", roughness=0.4), bevel=0.01)
    box((-0.98, 0, 0.7), (0.06, 2.0, 1.3), M("lb_w2", "#86a6d6", roughness=0.4), bevel=0.01)
    # pult
    box((0, 0.6, 0.34), (1.7, 0.6, 0.5), M("lb_c", "#e8ecf4", roughness=0.3), bevel=0.02)
    box((0, 0.6, 0.62), (1.74, 0.64, 0.05), M("lb_top", "#2c3550", roughness=0.25), bevel=0.01)
    glass = M("lb_gl", "#cfeeff", roughness=0.08)
    liq_cols = ["#7dff6a", "#ff5ad8", "#4ad0ff"]
    liqs, bubs = [], []
    for k, x in enumerate((-0.6, -0.2, 0.2)):
        lm = glow("lb_lq%d" % k, liq_cols[k], 1.6)
        liqs.append(lm)
        sphere((x, 0.6, 0.82), 0.14, lm, seg=20, rings=14)
        sphere((x, 0.6, 0.86), 0.17, glass, seg=20, rings=14) if False else None
        cyl((x, 0.6, 0.98), 0.04, 0.18, glass, verts=14)
        for j in range(3):
            bubs.append((k, sphere((0, 0, 0), 0.018, M("lb_bb", "#ffffff", roughness=0.1), seg=8, rings=6), x))
    # zkumavky
    rack = box((0.65, 0.6, 0.66), (0.4, 0.12, 0.03), M("lb_rk", "#8a5a3a", roughness=0.6), bevel=0.005)
    for k, c in enumerate(("#ff5a5a", "#ffd23a", "#6aff8a")):
        cyl((0.53 + 0.12 * k, 0.6, 0.76), 0.03, 0.18, glass, verts=10)
        cyl((0.53 + 0.12 * k, 0.6, 0.72), 0.024, 0.1, glow("lb_tb%d" % k, c, 1.5), verts=10)
    # Teslova cívka
    cyl((-0.55, -0.35, 0.1), 0.2, 0.1, M("lb_tb", "#4a4f6a", roughness=0.4, metallic=0.6), verts=24)
    cone((-0.55, -0.35, 0.55), 0.12, 0.05, 0.8, M("lb_tc", "#c47a3a", roughness=0.35, metallic=0.9), verts=24)
    ball = sphere((-0.55, -0.35, 1.05), 0.14, glow("lb_ball", "#a8e8ff", 3.0), seg=20, rings=14)
    arcs = []
    for k in range(5):
        a = k * math.tau / 5
        arcs.append(bar((-0.55, -0.35, 1.05), (-0.55 + 0.45 * math.cos(a), -0.35 + 0.45 * math.sin(a), 1.1 + 0.18 * math.sin(a * 2)), 0.012, glow("lb_ar%d" % k, "#d6f6ff", 10.0), verts=6))
    # mikroskop
    box((0.55, -0.35, 0.1), (0.3, 0.2, 0.05), steel, bevel=0.01)
    bar((0.65, -0.35, 0.12), (0.65, -0.35, 0.6), 0.03, steel, verts=10)
    bar((0.65, -0.35, 0.58), (0.52, -0.35, 0.35), 0.035, M("lb_mi", "#2a2a32", roughness=0.4), verts=10)
    # tabule s molekulou
    box((0.1, 0.94, 1.0), (0.9, 0.03, 0.5), M("lb_bd", "#2b4a3a", roughness=0.9), bevel=0.01)
    atoms = empty()
    atoms.location = (0.1, 0.9, 1.0)
    for k, (dx, dz, c) in enumerate(((0, 0, "#ff6a6a"), (0.15, 0.1, "#ffffff"), (-0.15, 0.1, "#ffffff"))):
        child(sphere((0.1 + dx, 0.9, 1.0 + dz), 0.06 if k == 0 else 0.04, M("lb_at%d" % k, c, roughness=0.4), seg=14, rings=10), atoms)

    @anim
    def _l(t):
        ph = t * math.tau
        for i, lm in enumerate(liqs):
            set_glow(lm, 1.2 + 0.8 * math.sin(ph + i * 2))
        for j, (k, b, x) in enumerate(bubs):
            q = (t * 2 + j * 0.31) % 1.0
            b.location = (x + 0.03 * math.sin(ph * 3 + j), 0.6, 0.86 + 0.5 * q)
            s = math.sin(math.pi * q)
            b.scale = (s, s, s)
        set_glow(ball.data.materials[0], 2.0 + 2.0 * max(0, math.sin(3 * ph)))
        for i, a in enumerate(arcs):
            on = max(0.0, math.sin(3 * ph + i * 1.3))
            s = 1.0 if on > 0.3 else 0.001
            a.scale = (s, s, s)
        atoms.rotation_euler = (0, ph, 0)

    run(lambda t: None, "uni_laborator")


JOBS = {"muzeum": muzeum, "expedice": expedice, "dzungle": dzungle, "pirati": pirati, "kuchyne": kuchyne,
        "knihovna": knihovna, "observator": observator, "hrad": hrad, "laborator": laborator}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
