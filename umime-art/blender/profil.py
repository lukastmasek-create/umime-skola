"""Profil hrdiny: pohádkový podstavec pro 3D avatara (smyčka 24 snímků) a vitrína odměn (statický snímek).
Spuštění: python profil.py -- podstavec | vitrina        (každé ve vlastním procesu; --preview jen pár snímků)
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


JOBS = {"podstavec": podstavec, "vitrina": vitrina}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
