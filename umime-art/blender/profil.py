"""Profil hrdiny: pohádkový podstavec pro 3D avatara (smyčka 24 snímků) a vitrína odměn (statický snímek).
Spuštění: python profil.py -- podstavec | vitrina | vesmir | more | les | hrad | kouzla        (každé ve vlastním procesu; --preview jen pár snímků)
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *
from unikovky import empty, child, rise

M = lambda n, c, **k: material(n, c, **k)
TAU = math.tau


def star_mesh(r_out, r_in, mat, z, name="star"):
    verts, faces = [(0, 0, z)], []
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5
        r = r_out if k % 2 == 0 else r_in
        verts.append((r * math.cos(a), r * math.sin(a), z))
    for k in range(10):
        faces.append((0, 1 + k, 1 + (k + 1) % 10))
    return mesh_obj(name, verts, faces, mat)


# ---------------------------------------------------------------- Podstavec
def podstavec():
    setup("profil_podstavec", size=512, ortho=3.9, target_z=0.55, el=17, world=("#ffe9d0", 0.6))
    stone, gold = M("pd_s", "#f2dcb4", roughness=0.55), M("pd_g", "#ffc933", roughness=0.25, metallic=0.9)
    cyl((0, 0, -0.12), 1.42, 0.26, stone, verts=64)
    cyl((0, 0, 0.09), 1.2, 0.2, M("pd_s2", "#e7b97a", roughness=0.55), verts=64)
    cyl((0, 0, 0.24), 1.0, 0.1, M("pd_t", "#fff4de", roughness=0.4), verts=64)
    for z, r in ((0.0, 1.43), (0.2, 1.21), (0.29, 1.01)):
        torus((0, 0, z), r, 0.022, gold)
    inl = glow("pd_star", "#ffd23a", 1.6)
    star_mesh(0.72, 0.3, inl, 0.296)
    star_mesh(0.5, 0.2, M("pd_star2", "#ff8a5a", roughness=0.5), 0.3, "star2")
    # lampičky na obvodu (běžící světla)
    lamps = []
    for k in range(20):
        a = k * TAU / 20
        lamps.append(sphere((1.43 * math.cos(a), 1.43 * math.sin(a), 0.0), 0.05, glow("pd_l%d" % k, "#fff0b8", 1.0), seg=10, rings=8))
    # prstenec s hvězdičkami, který se otáčí kolem
    ring = empty()
    ring.location = (0, 0, 0.55)
    torus((0, 0, 0), 1.62, 0.014, glow("pd_ring", "#ff8ac0", 0.7)).parent = ring
    orbs = []
    for k in range(6):
        a = k * TAU / 6
        o = star_mesh(0.13, 0.06, glow("pd_o%d" % k, ["#ff7aa6", "#ffd23a", "#7ad7ff"][k % 3], 4.0), 0.0, "orb%d" % k)
        o.parent = ring
        o.location = (1.62 * math.cos(a), 1.62 * math.sin(a), 0)
        o.rotation_euler = (math.radians(70), 0, a)
        orbs.append(o)
    spark = [sphere((0, 0, 0), 0.03, glow("pd_sp%d" % k, "#fff3b0", 7.0), seg=6, rings=4) for k in range(14)]
    rnd = random.Random(5)
    sp = [(rnd.uniform(-0.9, 0.9), rnd.uniform(-0.9, 0.9)) for _ in spark]
    # prapůrky kolem podstavce
    cols = ["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a"]
    flags = []
    for k in range(10):
        a = math.radians(200 + k * 14)
        f = box((1.52 * math.cos(a), 1.52 * math.sin(a), 0.14), (0.0, 0.0, 0.0), M("pd_f%d" % k, cols[k % 4], roughness=0.6), bevel=0)
        f.scale = (0.01, 0.2, 0.2)
        f.rotation_euler = (0.4, 0, a)
        flags.append(f)

    @anim
    def _p(t):
        ph = t * TAU
        set_glow(inl, 1.3 + 0.8 * math.sin(ph))
        for i, l in enumerate(lamps):
            set_glow(l.data.materials[0], 0.6 + 6.0 * max(0.0, math.cos(TAU * (i / 20 - t) * 1.0)) ** 6)
        ring.rotation_euler = (0, 0, ph)
        for i, o in enumerate(orbs):
            o.rotation_euler = (math.radians(70), ph * 2, o.rotation_euler.z)
        rise(spark, t, 0, 0, 0.35, 1.7, grow=1.0, drift=0.0)
        for i, (s, (x, y)) in enumerate(zip(spark, sp)):
            z = s.location.z
            s.location = (x * (0.6 + 0.4 * math.sin(ph + i)), y * (0.6 + 0.4 * math.cos(ph + i)), z)
        for i, f in enumerate(flags):
            f.rotation_euler = (0.4 + 0.25 * math.sin(2 * ph + i), 0, f.rotation_euler.z)

    run(lambda t: None, "profil_podstavec")


# ---------------------------------------------------------------- Tematické podstavce
# Podstavec podle tématu avatara (lib/avatar-pedestal.ts): vesmír, moře, les, hrad, kouzla. Stejný rámec jako
# pohádkový podstavec: deska o poloměru ~1,4, nad ní točící se prstenec s ozdobami a stoupající jiskry, 24 snímků.
def _pedestal_base(name, world):
    setup(name, samples=40, size=512, ortho=3.9, target_z=0.55, el=17, world=world)


def _spin_ring(radius, z, mat, items):
    ring = empty()
    ring.location = (0, 0, z)
    torus((0, 0, 0), radius, 0.014, mat).parent = ring
    for k, make in enumerate(items):
        a = k * TAU / len(items)
        o = make()
        o.parent = ring
        o.location = (radius * math.cos(a), radius * math.sin(a), 0)
    return ring


def _sparks(n, color, seed=5):
    spark = [sphere((0, 0, 0), 0.03, glow("sp_%s_%d" % (color, k), color, 7.0), seg=6, rings=4) for k in range(n)]
    rnd = random.Random(seed)
    return spark, [(rnd.uniform(-0.9, 0.9), rnd.uniform(-0.9, 0.9)) for _ in spark]


def _animate(ring, spark, sp, lamps=(), extra=None, speed=1):
    @anim
    def _p(t):
        ph = t * TAU
        ring.rotation_euler = (0, 0, ph * speed)
        for i, l in enumerate(lamps):
            set_glow(l.data.materials[0], 0.6 + 6.0 * max(0.0, math.cos(TAU * (i / len(lamps) - t))) ** 6)
        rise(spark, t, 0, 0, 0.35, 1.7, grow=1.0, drift=0.0)
        for i, (s, (x, y)) in enumerate(zip(spark, sp)):
            s.location = (x * (0.6 + 0.4 * math.sin(ph + i)), y * (0.6 + 0.4 * math.cos(ph + i)), s.location.z)
        if extra:
            extra(t)


def podstavec_vesmir():
    _pedestal_base("profil_podstavec_vesmir", ("#1a1f4a", 0.6))
    metal, dark = M("pv_m", "#c8d0e0", roughness=0.25, metallic=0.85), M("pv_d", "#2a3050", roughness=0.4, metallic=0.5)
    cyl((0, 0, -0.12), 1.42, 0.26, dark, verts=64)
    cyl((0, 0, 0.09), 1.2, 0.2, metal, verts=64)
    cyl((0, 0, 0.24), 1.0, 0.1, M("pv_t", "#eef2f8", roughness=0.3, metallic=0.3), verts=64)
    neon = glow("pv_n", "#4fd8ff", 3.0)
    for z, r in ((0.0, 1.43), (0.2, 1.21), (0.29, 1.01)):
        torus((0, 0, z), r, 0.022, neon)
    star_mesh(0.6, 0.25, glow("pv_s", "#b06bff", 1.8), 0.296)
    lamps = [sphere((1.43 * math.cos(k * TAU / 20), 1.43 * math.sin(k * TAU / 20), 0.0), 0.05, glow("pv_l%d" % k, "#6fe8ff", 1.0), seg=10, rings=8) for k in range(20)]
    cols = ["#ffb36b", "#6fe8ff", "#c08cff", "#7ee0b0", "#ff7aa6"]
    items = [(lambda c=c, r=r: sphere((0, 0, 0), r, M("pv_p" + c, c, roughness=0.6), seg=16, rings=12)) for c, r in zip(cols, (0.16, 0.11, 0.14, 0.09, 0.12))]
    ring = _spin_ring(1.62, 0.6, glow("pv_r", "#4fd8ff", 0.8), items)
    spark, sp = _sparks(16, "#e0f4ff")
    _animate(ring, spark, sp, lamps, speed=1)
    run(lambda t: None, "profil_podstavec_vesmir")


def podstavec_more():
    _pedestal_base("profil_podstavec_more", ("#cfefff", 0.6))
    rock = M("pm_r", "#d8c8a8", roughness=0.8)
    cyl((0, 0, -0.12), 1.42, 0.26, M("pm_w", "#3a9ad8", roughness=0.2), verts=64)
    cyl((0, 0, 0.09), 1.2, 0.2, rock, verts=64)
    cyl((0, 0, 0.24), 1.0, 0.1, M("pm_s", "#f4e8c8", roughness=0.6), verts=64)
    for z, r in ((0.0, 1.43), (0.2, 1.21), (0.29, 1.01)):
        torus((0, 0, z), r, 0.022, M("pm_p", "#fff4fa", roughness=0.2))
    rnd = random.Random(3)
    corals = ["#ff6f91", "#ffb347", "#c08cff", "#6fe0c0"]
    for k in range(14):
        a = k * TAU / 14 + 0.2
        x, y = 1.25 * math.cos(a), 1.25 * math.sin(a)
        c = corals[k % 4]
        if k % 3 == 0:
            for j in range(3):
                bar((x, y, 0.15), (x + rnd.uniform(-0.12, 0.12), y + rnd.uniform(-0.12, 0.12), 0.45 + rnd.uniform(0, 0.15)), 0.03, M("pm_c" + c, c, roughness=0.5), verts=6)
        else:
            sphere((x, y, 0.22), 0.09, M("pm_c" + c, c, roughness=0.5), seg=10, rings=8)
    sphere((0, 0, 0.34), 0.12, glow("pm_pearl", "#f4f0ff", 1.2), seg=16, rings=12)
    cyl((0, 0, 0.3), 0.22, 0.04, M("pm_sh", "#ffd8e8", roughness=0.4), verts=24)
    items = [(lambda c=c: sphere((0, 0, 0), 0.07, M("pm_b", "#dff8ff", roughness=0.05), seg=12, rings=8)) for c in range(8)]
    ring = _spin_ring(1.62, 0.55, glow("pm_r2", "#7fe8ff", 0.6), items)
    spark, sp = _sparks(18, "#dff8ff")
    _animate(ring, spark, sp, speed=-1)
    run(lambda t: None, "profil_podstavec_more")


def podstavec_les():
    _pedestal_base("profil_podstavec_les", ("#e0f4d8", 0.6))
    bark, ringw = M("pl_b", "#7a4a2a", roughness=0.9), M("pl_w", "#d8b080", roughness=0.8)
    cyl((0, 0, -0.12), 1.42, 0.26, M("pl_g", "#4eaa58", roughness=0.9), verts=64)
    cyl((0, 0, 0.1), 1.1, 0.24, bark, verts=32)
    cyl((0, 0, 0.23), 1.09, 0.02, ringw, verts=48)
    for r in (0.35, 0.65, 0.9):
        torus((0, 0, 0.245), r, 0.012, M("pl_r", "#a8784a", roughness=0.8))
    for k in range(10):
        a = k * TAU / 10
        bar((1.05 * math.cos(a), 1.05 * math.sin(a), 0.2), (1.35 * math.cos(a + 0.1), 1.35 * math.sin(a + 0.1), -0.05), 0.07, bark, verts=6)
    for k in range(7):
        a = k * TAU / 7 + 0.4
        x, y = 1.3 * math.cos(a), 1.3 * math.sin(a)
        cyl((x, y, 0.05), 0.05, 0.16, M("pl_st", "#f4ead8", roughness=0.7), verts=8)
        c = ["#e5484d", "#ff9f43", "#b88cff"][k % 3]
        sphere((x, y, 0.15), 0.12, glow("pl_m" + c, c, 0.6), scale=(1, 1, 0.5), seg=12, rings=8)
    lamps = [sphere((1.43 * math.cos(k * TAU / 16), 1.43 * math.sin(k * TAU / 16), 0.02), 0.04, glow("pl_l%d" % k, "#fff59a", 1.0), seg=8, rings=6) for k in range(16)]
    items = [(lambda c=c: sphere((0, 0, 0), 0.08, M("pl_leaf" + c, c, roughness=0.6), scale=(1.6, 0.4, 0.8), seg=10, rings=6)) for c in ("#3fb060", "#69cf72", "#ffb347", "#3fb060", "#69cf72", "#e5484d")]
    ring = _spin_ring(1.62, 0.55, glow("pl_ring", "#b8ff9a", 0.5), items)
    spark, sp = _sparks(16, "#fff59a")
    _animate(ring, spark, sp, lamps, speed=0.5)
    run(lambda t: None, "profil_podstavec_les")


def podstavec_hrad():
    _pedestal_base("profil_podstavec_hrad", ("#f0e8ff", 0.6))
    stone, gold = M("ph_s", "#d8d2c4", roughness=0.85), M("ph_g", "#ffc933", roughness=0.25, metallic=0.9)
    cyl((0, 0, -0.12), 1.42, 0.26, stone, verts=12)
    cyl((0, 0, 0.09), 1.2, 0.2, M("ph_s2", "#c8c0b0", roughness=0.85), verts=12)
    cyl((0, 0, 0.24), 1.0, 0.1, M("ph_v", "#7a3aa8", roughness=0.6), verts=48)
    for k in range(12):
        a = k * TAU / 12
        box((1.33 * math.cos(a), 1.33 * math.sin(a), 0.1), (0.22, 0.22, 0.2), stone, rot=(0, 0, a))
    for z, r in ((0.2, 1.21), (0.29, 1.01)):
        torus((0, 0, z), r, 0.022, gold)
    cyl((0, 0, 0.3), 0.3, 0.03, gold, verts=6)
    lamps = [sphere((1.43 * math.cos(k * TAU / 12 + 0.26), 1.43 * math.sin(k * TAU / 12 + 0.26), 0.12), 0.05, glow("ph_l%d" % k, "#ffc46b", 1.0), seg=10, rings=8) for k in range(12)]
    cols = ["#c0392b", "#2e5aa8"]
    flags = []
    for k in range(6):
        a = k * TAU / 6
        x, y = 1.33 * math.cos(a), 1.33 * math.sin(a)
        cyl((x, y, 0.5), 0.02, 0.6, M("ph_pole", "#5a4a3a", roughness=0.6), verts=6)
        f = box((x, y, 0.7), (0.01, 0.22, 0.14), M("ph_f%d" % (k % 2), cols[k % 2], roughness=0.6), bevel=0)
        f.rotation_euler = (0, 0, a)
        flags.append(f)
    items = [(lambda: cone((0, 0, 0), 0.09, 0.0, 0.14, gold, verts=5)) for _ in range(6)]
    ring = _spin_ring(1.62, 0.95, glow("ph_r", "#ffd23a", 0.6), items)
    spark, sp = _sparks(14, "#fff3b0")

    def wave(t):
        for i, f in enumerate(flags):
            f.rotation_euler = (0.3 * math.sin(2 * t * TAU + i), 0, f.rotation_euler.z)

    _animate(ring, spark, sp, lamps, extra=wave, speed=0.5)
    run(lambda t: None, "profil_podstavec_hrad")


def podstavec_kouzla():
    _pedestal_base("profil_podstavec_kouzla", ("#2a1a4a", 0.55))
    crystal = M("pk_c", "#b8a0ff", roughness=0.1)
    cyl((0, 0, -0.12), 1.42, 0.26, M("pk_d", "#3a2a6a", roughness=0.5), verts=64)
    cyl((0, 0, 0.09), 1.2, 0.2, M("pk_m", "#5a3aa8", roughness=0.4), verts=64)
    cyl((0, 0, 0.24), 1.0, 0.1, M("pk_t", "#e8e0ff", roughness=0.3), verts=64)
    rune = glow("pk_rune", "#ff8ad8", 2.0)
    for z, r in ((0.0, 1.43), (0.2, 1.21), (0.29, 1.01)):
        torus((0, 0, z), r, 0.022, rune)
    star_mesh(0.7, 0.28, glow("pk_s", "#ffd23a", 1.4), 0.296)
    for k in range(8):
        a = k * TAU / 8 + 0.2
        cone((1.3 * math.cos(a), 1.3 * math.sin(a), 0.1), 0.08, 0.0, 0.35 + 0.15 * (k % 2), crystal, verts=6)
    lamps = [sphere((1.43 * math.cos(k * TAU / 20), 1.43 * math.sin(k * TAU / 20), 0.0), 0.05, glow("pk_l%d" % k, "#ffb8f0", 1.0), seg=10, rings=8) for k in range(20)]
    cols = ["#ff7aa6", "#7ad7ff", "#ffd23a", "#b88cff"]
    items = [(lambda c=c: cone((0, 0, 0), 0.08, 0.0, 0.2, glow("pk_g" + c, c, 3.0), verts=6)) for c in cols * 2]
    ring = _spin_ring(1.62, 0.65, glow("pk_r", "#c08cff", 0.8), items)
    spark, sp = _sparks(20, "#ffe8ff")
    _animate(ring, spark, sp, lamps, speed=1)
    run(lambda t: None, "profil_podstavec_kouzla")


# ---------------------------------------------------------------- Vitrína
def vitrina():
    W, H = 1400, 900
    sc = reset(W, H, 1, samples=96, name="profil_vitrina", world=("#d9c9f0", 0.3))
    sc.render.film_transparent = True
    OS, TZ = 7.8, 2.4
    add_camera((0, -14, TZ), (0, 0, TZ), ortho_scale=OS)
    add_sun((math.radians(48), math.radians(12), math.radians(-20)), energy=1.5)
    add_area((0, -5, 6), (0, 0, 2.2), energy=200, size=7, color="#fff1e2")
    wood, dark, gold = M("vt_w", "#9a6234", roughness=0.5), M("vt_d", "#6a3f20", roughness=0.55), M("vt_g", "#ffc933", roughness=0.25, metallic=0.9)
    back = M("vt_b", "#c9a8e8", roughness=0.8)
    # skříň: zadní stěna, boky, dno, římsa
    box((0, 0.35, 2.3), (6.4, 0.1, 4.6), back, bevel=0)
    box((0, 0.28, 2.3), (6.0, 0.02, 4.0), M("vt_b2", "#e3cdf5", roughness=0.9), bevel=0)
    for sx in (-1, 1):
        box((sx * 3.0, 0, 2.2), (0.3, 0.9, 4.4), wood, bevel=0.04)
        box((sx * 3.0, -0.3, 2.2), (0.12, 0.3, 4.2), dark, bevel=0.02)
    for sx in (-1, 1):
        box((sx * 2.86, 0, 2.3), (0.1, 0.8, 4.0), wood, bevel=0.01)
    box((0, 0, 0.3), (6.3, 0.95, 0.6), wood, bevel=0.04)
    for k in range(3):
        box((-2.0 + k * 2.0, -0.49, 0.3), (1.8, 0.04, 0.45), dark, bevel=0.03)
        sphere((-2.0 + k * 2.0, -0.53, 0.3), 0.07, gold, seg=10, rings=8)
    box((0, 0, 4.35), (6.5, 1.0, 0.3), wood, bevel=0.05)
    box((0, -0.02, 4.55), (5.6, 0.9, 0.14), dark, bevel=0.03)
    box((0, -0.5, 4.2), (6.0, 0.05, 0.08), gold, bevel=0.01)
    # prapůrky na římse
    for k in range(13):
        x = -2.9 + k * 0.48
        t = box((x, -0.52, 4.05), (0.0, 0.0, 0.0), M("vt_f%d" % k, ["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a"][k % 4], roughness=0.6), bevel=0)
        t.scale = (0.3, 0.02, 0.3)
        t.rotation_euler = (0, math.radians(45), 0)
    # police s měkkým podsvícením
    shelves = [1.15, 2.25, 3.35]
    for z in shelves:
        box((0, 0, z - 0.06), (5.7, 0.8, 0.12), M("vt_s", "#d9a066", roughness=0.4), bevel=0.02)
        box((0, -0.38, z - 0.18), (5.7, 0.05, 0.1), glow("vt_l", "#ffd98a", 0.8), bevel=0)
    # skleněné dveře: dva průhledné panely s rámem a odleskem
    gl = bpy.data.materials.new("vt_gl")
    gl.use_nodes = True
    b = gl.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hex_rgba("#e8f4ff")
    b.inputs["Roughness"].default_value = 0.05
    b.inputs["Alpha"].default_value = 0.1
    for sx in (-1, 1):
        box((sx * 1.45, -0.46, 2.4), (2.8, 0.03, 3.6), gl, bevel=0)
        box((sx * 1.45, -0.46, 4.18), (2.9, 0.06, 0.07), dark, bevel=0)
        box((sx * 1.45, -0.46, 0.62), (2.9, 0.06, 0.07), dark, bevel=0)
    box((0, -0.5, 2.4), (0.09, 0.07, 3.7), gold, bevel=0.01)
    sphere((-0.12, -0.55, 2.4), 0.05, gold, seg=8, rings=6)
    sphere((0.12, -0.55, 2.4), 0.05, gold, seg=8, rings=6)
    # sloty pro odměny: střed každé police na x = -1.9, 0, 1.9; úroveň = vršek police
    slots = []
    for z in shelves:
        row = []
        for x in (-1.9, 0.0, 1.9):
            row.append([round(0.5 + x / OS, 4), round(0.5 - (z - TZ) / (OS * H / W), 4)])
        slots.append(row)
    os.makedirs(os.path.join(OUT, "profil_vitrina"), exist_ok=True)
    with open(os.path.join(OUT, "profil_vitrina", "layout.json"), "w") as fh:
        json.dump({"w": W, "h": H, "slots": slots, "item": round(1.15 / OS, 4)}, fh)
    run(lambda t: None, "profil_vitrina")


JOBS = {"podstavec": podstavec, "vitrina": vitrina, "vesmir": podstavec_vesmir, "more": podstavec_more, "les": podstavec_les, "hrad": podstavec_hrad, "kouzla": podstavec_kouzla}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
