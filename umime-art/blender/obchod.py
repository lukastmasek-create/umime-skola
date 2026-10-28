"""Obchod a kolo štěstí: pouťové kolo (disk, popředí s žárovkami, stojan) a stánky trhu.
Spuštění: python obchod.py -- kolo_disk | kolo_predni | kolo_stojan | stanky ...   (každý job v samostatném procesu)
Kolo se kreslí zepředu (kamera míří podél +y, osa kola je y), geometrie disku sedí na web (WHEEL_LABEL_RADIUS).
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *
from unikovky import empty, child, rise
import bmesh

M = lambda n, c, **k: material(n, c, **k)
TAU = math.tau
PRIZE_COLORS = ["#3248f0", "#ff5a3c", "#ffc933", "#17a864", "#29a3ff", "#ff5a3c", "#3248f0", "#ffc933"]  # = WHEEL_PRIZES
GOLD = lambda n="g": M(n, "#ffc933", roughness=0.22, metallic=1.0)


def front_cam(name, w, h, ortho, cz=0.0, cx=0.0, frames=1, samples=96):
    sc = reset(w, h, frames, samples=samples, name=name, world=("#ffeed8", 0.55))
    add_camera((cx, -14, cz), (cx, 0, cz), ortho_scale=ortho)
    add_sun((math.radians(62), math.radians(0), math.radians(-24)), energy=3.0)
    add_area((-3, -6, 4), (0, 0, 0), energy=300, size=6, color="#fff1e2")
    add_area((4, -5, -1), (0, 0, 0), energy=60, size=5, color="#cfe0ff")
    return sc


def sector(r0, r1, a0, a1, y0, y1, mat, n=14, name="seg"):
    """Mezikruží (výseč) v rovině x–z, úhly po směru hodin od vrchu, tloušťka od y0 do y1."""
    vs, fs = [], []
    angs = [a0 + (a1 - a0) * k / n for k in range(n + 1)]
    for y in (y0, y1):
        for r in (r0, r1):
            for a in angs:
                vs.append((r * math.sin(a), y, r * math.cos(a)))
    m = n + 1

    def idx(layer, ring, k):
        return (layer * 2 + ring) * m + k

    for k in range(n):
        for layer, flip in ((0, True), (1, False)):  # přední a zadní plocha
            f = (idx(layer, 0, k), idx(layer, 1, k), idx(layer, 1, k + 1), idx(layer, 0, k + 1))
            fs.append(f[::-1] if flip else f)
        for ring in (0, 1):  # vnitřní a vnější stěna
            f = (idx(0, ring, k), idx(0, ring, k + 1), idx(1, ring, k + 1), idx(1, ring, k))
            fs.append(f if ring else f[::-1])
    for k in (0, n):  # boky výseče
        f = (idx(0, 0, k), idx(0, 1, k), idx(1, 1, k), idx(1, 0, k))
        fs.append(f if k else f[::-1])
    o = mesh_obj(name, vs, fs, mat)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return o


def star(r_out, r_in, mat, y, name="st", rot=0.0, thick=0.04):
    """Plochá pěticípá hvězda v rovině x–z s tloušťkou."""
    vs, fs = [], []
    pts = []
    for k in range(10):
        a = rot + k * math.pi / 5
        r = r_out if k % 2 == 0 else r_in
        pts.append((r * math.sin(a), r * math.cos(a)))
    for yy in (y, y + thick):
        for (x, z) in pts:
            vs.append((x, yy, z))
        vs.append((0, yy, 0))
    for layer in (0, 1):
        base = layer * 11
        for k in range(10):
            f = (base + 10, base + k, base + (k + 1) % 10)
            fs.append(f if layer else f[::-1])
    for k in range(10):
        a, b = k, (k + 1) % 10
        fs.append((a, b, b + 11, a + 11))
    o = mesh_obj(name, vs, fs, mat)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return o


def X(o, rot=(math.radians(90), 0, 0)):
    o.rotation_euler = rot
    return o


# ---------------------------------------------------------------- Disk (otáčí se na webu)
def kolo_disk():
    front_cam("obchod_kolo_disk", 512, 512, 2.45)
    gold = GOLD("kd_g")
    for i, c in enumerate(PRIZE_COLORS):
        a0, a1 = i * TAU / 8 + 0.012, (i + 1) * TAU / 8 - 0.012
        sector(0.19, 0.93, a0, a1, -0.05, 0.05, M("kd_s%d" % i, c, roughness=0.18), name="seg%d" % i)
        # světlejší vnitřní lem a drobné bodíky u okraje
        mid = (a0 + a1) / 2
        sector(0.80, 0.93, a0 + 0.03, a1 - 0.03, -0.054, 0.05, M("kd_l%d" % i, c, roughness=0.12, metallic=0.2), name="lem%d" % i)
        for d in (-0.35, 0, 0.35):
            aa = mid + d * (a1 - a0) * 0.6
            sphere((0.86 * math.sin(aa), -0.06, 0.86 * math.cos(aa)), 0.018, M("kd_d", "#fff7d0", roughness=0.2), seg=8, rings=6)
    # zlatý ráfek, pivo a kolíčky mezi políčky
    X(torus((0, 0, 0), 0.97, 0.07, gold))
    X(torus((0, 0, 0), 0.2, 0.035, gold))
    for k in range(8):
        a = k * TAU / 8
        bar((0.2 * math.sin(a), -0.045, 0.2 * math.cos(a)), (0.95 * math.sin(a), -0.045, 0.95 * math.cos(a)), 0.014, gold, verts=8)
        sphere((0.985 * math.sin(a), -0.07, 0.985 * math.cos(a)), 0.04, GOLD("kd_pg"), seg=12, rings=8)
    run(lambda t: None, "obchod_kolo_disk")


# ---------------------------------------------------------------- Popředí kola: žárovky, nába a ručička
def kolo_predni():
    front_cam("obchod_kolo_predni", 512, 512, 2.45, frames=24, samples=48)
    gold = GOLD("kp_g")
    # náboj s hvězdou
    sphere((0, -0.08, 0), 0.2, gold, scale=(1, 0.5, 1), seg=24, rings=14)
    star(0.12, 0.055, M("kp_s", "#ff5a3c", roughness=0.3), -0.2, "hubstar", thick=0.03)
    # ručička (hvězda – klapka) nahoře, míří dolů
    ptr = empty()
    ptr.location = (0, -0.16, 1.08)
    child(cone((0, 0, -0.12), 0.1, 0.0, 0.34, M("kp_p", "#ff3b4a", roughness=0.3), verts=20, rot=(math.radians(180), 0, 0)), ptr)
    child(sphere((0, 0, 0.02), 0.09, gold, seg=14, rings=10), ptr)
    child(sphere((0, -0.05, 0.02), 0.04, M("kp_pw", "#ffffff", roughness=0.3), seg=10, rings=8), ptr)
    # žárovkový prstenec kolem disku
    X(torus((0, -0.01, 0), 1.12, 0.03, gold))
    bulbs = []
    for k in range(24):
        a = k * TAU / 24
        bulbs.append(sphere((1.12 * math.sin(a), -0.06, 1.12 * math.cos(a)), 0.06, glow("kp_b%d" % k, "#fff0b0", 1.0), seg=12, rings=8))
    # drobné blýskání na ráfku (hvězdičky se rozsvítí a zhasnou)
    glints = [star(0.07, 0.03, glow("kp_gl%d" % k, "#ffffff", 8.0), -0.2, "glint%d" % k, rot=0.3 * k, thick=0.01) for k in range(5)]
    gpos = [(0.65, 0.78), (-0.9, 0.5), (0.95, -0.35), (-0.3, -0.95), (0.35, 0.9)]

    @anim
    def _kp(t):
        for i, b in enumerate(bulbs):
            phase = (i / 24 - t) % 1.0
            on = 1.0 if phase < 0.3 else 0.0
            set_glow(b.data.materials[0], 0.5 + 8.0 * on * (1 - phase / 0.3) ** 0.5 if on else 0.4)
        ptr.rotation_euler = (0, 0, 0.0)
        for i, (g, (gx, gz)) in enumerate(zip(glints, gpos)):
            q = (t * 2 + i / 5) % 1.0
            s = max(0.0, math.sin(math.pi * q)) ** 2
            g.location = (gx, 0.0, gz)
            g.scale = (s, s, s)

    run(lambda t: None, "obchod_kolo_predni")


# ---------------------------------------------------------------- Stojan (budka) kolem kola
def kolo_stojan():
    W, H = 900, 860
    OS = 4.9
    CZ = 0.33
    front_cam("obchod_kolo_stojan", W, H, OS, cz=CZ)
    gold = GOLD("ks_g")
    red, white = M("ks_r", "#e8453c", roughness=0.5), M("ks_w", "#fff6e6", roughness=0.5)
    wood, dark = M("ks_wd", "#8a5a34", roughness=0.6), M("ks_dk", "#2b3560", roughness=0.4, metallic=0.5)
    # zadní panel (hvězdičkový) a oblouk
    box((0, 0.5, 0.15), (3.5, 0.12, 3.5), M("ks_back", "#4a3fc4", roughness=0.7), bevel=0.04)
    cyl((0, 0.45, 0.15), 1.62, 0.1, M("ks_back2", "#6a5ae0", roughness=0.6), rot=(math.radians(90), 0, 0), verts=64)
    rnd = random.Random(7)
    for k in range(18):
        a = rnd.uniform(0, TAU)
        r = rnd.uniform(1.25, 1.7)
        s = rnd.uniform(0.05, 0.09)
        star(s, s * 0.45, glow("ks_st%d" % k, "#ffe27a", 2.0), 0.38, "bs%d" % k, rot=a, thick=0.02).location = (r * math.sin(a), 0.0, 0.15 + r * math.cos(a) * 0.8)
    # sloupy po stranách s hvězdnými hlavicemi
    for sx in (-1, 1):
        cyl((sx * 1.85, 0.2, 0.2), 0.16, 3.2, striped_material("ks_pil%d" % sx, "#e8453c", "#fff6e6", freq=7, roughness=0.5, axis="Z"), verts=24)
        cyl((sx * 1.85, 0.2, 1.85), 0.22, 0.1, gold, verts=24)
        star(0.28, 0.12, gold, 0.1, "fin%d" % sx, thick=0.1).location = (sx * 1.85, 0.0, 2.05)
        cyl((sx * 1.85, 0.2, -1.4), 0.24, 0.12, gold, verts=24)
    # stříška s volány a žárovkami
    box((0, 0.1, 2.0), (4.4, 0.8, 0.12), red, bevel=0.03)
    for k in range(11):
        x = -2.0 + k * 0.4
        cone((x, -0.28, 1.86), 0.21, 0.0, 0.26, red if k % 2 else white, verts=24, rot=(math.radians(180), 0, 0))
    for k in range(23):
        sphere((-2.1 + k * 0.19, -0.33, 2.07), 0.045, glow("ks_bl%d" % k, "#fff0b0", 3.0), seg=8, rings=6)
    # podstavec: tři stupně se zlatými lištami a šachovnicí
    for i, (w, z, c) in enumerate(((4.2, -1.55, "#2b3560"), (3.7, -1.38, "#3b4a9a"), (3.2, -1.22, "#4a5ac0"))):
        box((0, 0.0, z), (w, 1.0, 0.18), M("ks_pd%d" % i, c, roughness=0.5), bevel=0.04)
        box((0, -0.5, z + 0.07), (w, 0.03, 0.04), gold, bevel=0.005)
    for k in range(9):
        box((-1.6 + k * 0.4, -0.5, -1.22), (0.18, 0.03, 0.12), M("ks_ck%d" % (k % 2), "#fff6e6" if k % 2 else "#ff5a3c", roughness=0.5), bevel=0)
    # držák kola (zlatá osa) a stoličky po stranách
    cyl((0, 0.25, 0.0), 0.28, 0.5, gold, rot=(math.radians(90), 0, 0), verts=24)
    for sx in (-1, 1):
        cyl((sx * 1.35, -0.2, -1.05), 0.2, 0.4, M("ks_pl%d" % sx, "#ff9a3c", roughness=0.5), verts=24)
        sphere((sx * 1.35, -0.2, -0.78), 0.2, M("ks_ba%d" % sx, ["#ff5a7a", "#4ad0ff"][(sx + 1) // 2], roughness=0.3), seg=20, rings=14)
    os.makedirs(os.path.join(OUT, "obchod_kolo_stojan"), exist_ok=True)
    # střed kola na obrázku (podíly) a velikost disku
    cx_frac = 0.5
    cy_frac = 0.5 + CZ / (OS * H / W)
    with open(os.path.join(OUT, "obchod_kolo_stojan", "layout.json"), "w") as fh:
        json.dump({"w": W, "h": H, "cx": cx_frac, "cy": round(cy_frac, 4), "disk": round(2.45 / OS, 4)}, fh)
    run(lambda t: None, "obchod_kolo_stojan")


# ---------------------------------------------------------------- Stánky trhu (balíčky bodů)
def vendor(x, y, z, body, belly, kind="bunny", s=1.0, rot=0.0):
    """Prodavač zvířátko: tělo, hlava, uši (otočné), mávající ruka. Vrací (kořen, levé ucho, pravé ucho, ruka)."""
    root = empty()
    root.location = (x, y, z)
    root.rotation_euler = (0, 0, rot)
    b, bl = M("vd_b" + body, body, roughness=0.8), M("vd_l" + belly, belly, roughness=0.8)
    dk = M("vd_e", "#16132b", roughness=0.4)
    child(sphere((0, 0, 0.2 * s), 0.17 * s, b, scale=(0.95, 0.85, 1.1), seg=18, rings=12), root)
    child(sphere((0, -0.07 * s, 0.17 * s), 0.1 * s, bl, scale=(0.9, 0.5, 1.0), seg=12, rings=8), root)
    child(sphere((0, 0, 0.47 * s), 0.14 * s, b, seg=18, rings=12), root)
    child(sphere((0, -0.12 * s, 0.45 * s), 0.05 * s, bl, scale=(1.1, 0.7, 0.8), seg=10, rings=8), root)
    child(sphere((0, -0.16 * s, 0.46 * s), 0.018 * s, M("vd_n", "#ff7a9a"), seg=8, rings=6), root)
    for dx in (-0.05, 0.05):
        child(sphere((dx * s, -0.125 * s, 0.505 * s), 0.02 * s, dk, seg=8, rings=6), root)
    ears = []
    for side in (-1, 1):
        piv = empty()
        piv.parent = root
        piv.location = (side * 0.07 * s, 0, 0.58 * s)
        if kind == "bunny":
            e = sphere((0, 0, 0.12 * s), 0.045 * s, b, scale=(0.7, 0.45, 3.0), seg=12, rings=8)
        else:
            e = cone((0, 0, 0.07 * s), 0.07 * s, 0.0, 0.16 * s, b, verts=10)
        e.parent = piv
        e.location = (0, 0, 0.12 * s if kind == "bunny" else 0.07 * s)
        ears.append(piv)
    arm = empty()
    arm.parent = root
    arm.location = (0.15 * s, 0, 0.3 * s)
    a = cyl((0, 0, -0.06 * s), 0.035 * s, 0.14 * s, b, verts=10)
    a.parent = arm
    a.location = (0, 0, -0.06 * s)
    if kind == "fox":
        tail = sphere((0, 0.17 * s, 0.1 * s), 0.09 * s, b, scale=(0.7, 1.6, 0.7), seg=12, rings=8)
        tail.parent = root
        child(sphere((0, 0.27 * s, 0.1 * s), 0.05 * s, M("vd_tp", "#ffffff"), seg=8, rings=6), root)
    return root, ears[0], ears[1], arm


def awning(x, y, z, w, d, c1, c2, mat_prefix="aw"):
    """Pruhovaná stříška stánku se zubatým lemem."""
    st = striped_material(mat_prefix, c1, c2, freq=8, roughness=0.55, axis="X")
    box((x, y, z), (w, d, 0.07), st, rot=(0.0, 0.0, 0.0), bevel=0.01)
    n = int(w / 0.18)
    for k in range(n):
        xx = x - w / 2 + (k + 0.5) * w / n
        cone((xx, y - d / 2, z - 0.07), w / n / 2, 0.0, 0.12, M("%s_t%d" % (mat_prefix, k % 2), c1 if k % 2 else c2, roughness=0.55), verts=16, rot=(math.radians(180), 0, 0))


def stanek_mince():
    setup("obchod_stanek_mince", size=448, ortho=4.4, target_z=0.95, world=("#ffe9c9", 0.6))
    plinth("#e2b86a", "#fff0d2")
    wood, gold = M("sm_w", "#a86a38", roughness=0.6), GOLD("sm_g")
    box((0, 0.2, 0.3), (1.5, 0.7, 0.55), wood, bevel=0.03)
    box((0, 0.2, 0.6), (1.6, 0.8, 0.05), M("sm_t", "#ffe8b8", roughness=0.5), bevel=0.01)
    for dx in (-0.7, 0.7):
        bar((dx, -0.1, 0.0), (dx, -0.1, 1.5), 0.03, wood, verts=8)
        bar((dx, 0.5, 0.0), (dx, 0.5, 1.5), 0.03, wood, verts=8)
    awning(0, 0.2, 1.5, 1.7, 0.9, "#ffc933", "#fff6e0", "sm_aw")
    # hromádky mincí
    coin_m = M("sm_c", "#ffc933", roughness=0.25, metallic=1.0)
    for (cx, cy, n) in ((-0.45, 0.05, 6), (0.0, 0.1, 9), (0.45, 0.0, 4)):
        for k in range(n):
            cyl((cx, cy, 0.65 + 0.035 * k), 0.13, 0.03, coin_m, verts=20)
    sparks = [star(0.07, 0.03, glow("sm_sp%d" % k, "#ffffff", 8.0), 0.0, "sp%d" % k, rot=k, thick=0.01) for k in range(6)]
    bunny, bl, br, barm = vendor(-1.05, -0.2, 0.0, "#f7f3ee", "#ffd0dc", "bunny", s=1.4, rot=0.35)
    jar = cyl((-0.55, -0.55, 0.12), 0.16, 0.24, M("sm_j", "#bfe8ff", roughness=0.1), verts=24)
    flying = [cyl((0, 0, 0), 0.07, 0.015, coin_m, verts=16, rot=(90, 0, 0)) for _ in range(3)]
    bunting = []
    for k in range(9):
        t = box((-0.8 + 0.2 * k, -0.45, 1.34), (0, 0, 0), M("sm_f%d" % (k % 3), ["#ff5a7a", "#4ad0ff", "#7dff8a"][k % 3], roughness=0.6), bevel=0)
        t.scale = (0.16, 0.02, 0.16)
        t.rotation_euler = (0, math.radians(45), 0)
        bunting.append(t)

    @anim
    def _sm(t):
        ph = t * TAU
        barm.rotation_euler = (0, math.radians(-120) + 0.5 * math.sin(3 * ph), 0)
        bl.rotation_euler = (0.15 * math.sin(2 * ph), 0, 0.1 * math.sin(ph))
        br.rotation_euler = (0.15 * math.sin(2 * ph + 1), 0, -0.1 * math.sin(ph))
        bunny.location.z = 0.04 * abs(math.sin(2 * ph))
        for i, sp in enumerate(sparks):
            q = (t * 2 + i / 6) % 1.0
            sc_ = max(0.0, math.sin(math.pi * q)) ** 2
            sp.location = (-0.6 + 0.24 * i, -0.1 + 0.05 * math.sin(ph + i), 0.85 + 0.1 * (i % 2))
            sp.scale = (sc_, sc_, sc_)
        for i, c in enumerate(flying):
            q = (t + i / 3) % 1.0
            c.location = (-0.1 - 0.75 * q, -0.45, 0.8 + 1.1 * 4 * q * (1 - q))
            c.rotation_euler = (ph * 3, 0, 0)
        for i, b_ in enumerate(bunting):
            b_.rotation_euler = (0.3 * math.sin(2 * ph + i), math.radians(45), 0)

    run(lambda t: None, "obchod_stanek_mince")


def stanek_truhla():
    setup("obchod_stanek_truhla", size=448, ortho=4.4, target_z=0.95, world=("#ffe0d0", 0.6))
    plinth("#b9a0f0", "#f1e6ff")
    wood, gold = M("st_w", "#7a4a26", roughness=0.6), GOLD("st_g")
    box((0.0, 0.3, 0.25), (1.8, 0.8, 0.5), M("st_c", "#6a5ae0", roughness=0.5), bevel=0.03)
    box((0.0, 0.3, 0.52), (1.9, 0.9, 0.05), M("st_t", "#fff0d0", roughness=0.5), bevel=0.01)
    for dx in (-0.85, 0.85):
        bar((dx, -0.1, 0.0), (dx, -0.1, 1.7), 0.035, wood, verts=8)
        bar((dx, 0.7, 0.0), (dx, 0.7, 1.7), 0.035, wood, verts=8)
    awning(0, 0.3, 1.7, 2.0, 1.0, "#e8453c", "#fff6e0", "st_aw")
    # otevřená truhla se zářícím obsahem
    box((0.0, 0.2, 0.72), (0.7, 0.45, 0.28), wood, bevel=0.03)
    box((0.0, 0.2, 0.72), (0.72, 0.1, 0.3), gold, bevel=0.01)
    glow_m = glow("st_gl", "#ffd86a", 2.0)
    box((0.0, 0.2, 0.87), (0.62, 0.38, 0.02), glow_m, bevel=0)
    lid = empty()
    lid.location = (0.0, 0.42, 0.86)
    child(box((0.0, 0.2, 0.89), (0.72, 0.1, 0.34), M("st_ld", "#5a3416", roughness=0.6), bevel=0.03), lid).location = (0.0, -0.22, 0.03)
    gems = []
    for k, c in enumerate(("#ff3b5a", "#3b7bff", "#3bd68a", "#ffd23a", "#c9a8ff")):
        gems.append(sphere((0, 0, 0), 0.05, glow("st_gm%d" % k, c, 3.0), scale=(1, 1, 1.2), seg=8, rings=6))
    fox, fl, fr_, farm_ = vendor(-0.95, 0.15, 0.0, "#ff8a3c", "#ffffff", "fox", s=1.3, rot=0.3)
    lantern = empty()
    lantern.location = (0.9, -0.25, 1.62)
    child(bar((0, 0, 0), (0, 0, 0.12), 0.006, wood, verts=4), lantern)
    lg = glow("st_lan", "#ffb23a", 4.0)
    child(sphere((0, 0, -0.07), 0.1, lg, scale=(1, 1, 1.2), seg=12, rings=8), lantern)
    spark = [sphere((0, 0, 0), 0.015, glow("st_s%d" % k, "#fff2b0", 7.0), seg=6, rings=4) for k in range(8)]

    @anim
    def _st(t):
        ph = t * TAU
        o = 0.5 - 0.5 * math.cos(ph)
        lid.rotation_euler = (-math.radians(110) * (0.4 + 0.6 * o), 0, 0)
        set_glow(glow_m, 1.5 + 2.5 * o)
        for i, g in enumerate(gems):
            q = (t + i / 5) % 1.0
            a = q * TAU * 1.2 + i
            g.location = (0.35 * math.sin(a), 0.2 + 0.1 * math.cos(a), 0.9 + 0.8 * q)
            s_ = math.sin(math.pi * q) ** 0.6
            g.scale = (s_, s_, s_ * 1.2)
            g.rotation_euler = (0, 0, ph * 2)
        farm_.rotation_euler = (0, math.radians(-110) + 0.4 * math.sin(2 * ph), 0)
        fl.rotation_euler = (0.1 * math.sin(2 * ph), 0, 0)
        fr_.rotation_euler = (0.1 * math.sin(2 * ph + 1), 0, 0)
        lantern.rotation_euler = (0.18 * math.sin(ph), 0.12 * math.cos(ph), 0)
        set_glow(lg, 3.5 + 1.2 * math.sin(3 * ph))
        rise(spark, t, 0.0, 0.2, 1.0, 0.7, grow=1.0, drift=0.25)

    run(lambda t: None, "obchod_stanek_truhla")


def stanek_poklad():
    setup("obchod_stanek_poklad", size=448, ortho=4.4, target_z=1.0, world=("#ffd9c0", 0.5))
    plinth("#6b5a8a", "#e8dcf8")
    stone = stone_material("sp_s", "#9a8fb0", 14, 0.4, 0.9)
    gold = GOLD("sp_g")
    # kamenný oblouk jeskyně pokladů
    for sx in (-1, 1):
        box((sx * 0.95, 0.5, 0.8), (0.35, 0.9, 1.6), stone, bevel=0.03)
    box((0, 0.5, 1.7), (2.2, 0.9, 0.35), stone, bevel=0.03)
    box((0, 0.8, 0.8), (1.6, 0.2, 1.7), M("sp_b", "#2a1f4a", roughness=0.9), bevel=0)
    # hromada mincí a drahokamů, koruna a velká truhla
    coin = M("sp_c", "#ffc933", roughness=0.25, metallic=1.0)
    rnd = random.Random(11)
    for k in range(70):
        a, r = rnd.uniform(0, TAU), 0.65 * math.sqrt(rnd.uniform(0, 1))
        z = 0.08 + 0.55 * (1 - r / 0.65) ** 1.4
        cyl((0.1 + r * math.cos(a) * 0.9, 0.0 + r * math.sin(a) * 0.55, z), 0.1, 0.03, coin if k % 4 else GOLD("sp_g2"), rot=(rnd.uniform(-30, 30), rnd.uniform(-30, 30), 0), verts=14)
    box((-0.5, -0.1, 0.22), (0.55, 0.4, 0.32), M("sp_ch", "#7a4a26", roughness=0.6), bevel=0.03)
    box((-0.5, -0.1, 0.42), (0.58, 0.42, 0.1), M("sp_lid", "#5a3416", roughness=0.6), bevel=0.03)
    box((-0.5, -0.31, 0.3), (0.58, 0.04, 0.5), gold, bevel=0.01)
    crown = empty()
    crown.location = (0.1, 0.0, 0.8)
    child(cyl((0.1, 0.0, 0.8), 0.14, 0.12, gold, verts=20), crown)
    for k in range(5):
        a = k * TAU / 5
        child(cone((0.1 + 0.12 * math.cos(a), 0.12 * math.sin(a), 0.92), 0.035, 0.0, 0.1, gold, verts=8), crown)
        child(sphere((0.1 + 0.12 * math.cos(a), 0.12 * math.sin(a), 1.0), 0.025, glow("sp_cj%d" % k, ["#ff3b5a", "#3b7bff", "#3bd68a", "#ff9a3c", "#c9a8ff"][k], 4.0), seg=8, rings=6), crown)
    gem_m = []
    for k, (gx, gy, c) in enumerate(((0.65, -0.2, "#ff3b5a"), (0.8, -0.05, "#3b7bff"), (-0.2, -0.35, "#3bd68a"), (0.4, -0.4, "#c9a8ff"))):
        m_ = glow("sp_g%d" % k, c, 2.5)
        sphere((gx, gy, 0.1), 0.1, m_, scale=(1, 1, 1.3), seg=8, rings=6)
        gem_m.append(m_)
    # malý drak pokladník, dýchá a mrká
    drag = empty()
    drag.location = (-0.9, -0.4, 0.0)
    gm = M("sp_dg", "#3fbf6a", roughness=0.6)
    child(sphere((-0.9, -0.4, 0.25), 0.2, gm, scale=(1.1, 0.9, 1.0), seg=16, rings=12), drag)
    child(sphere((-0.9, -0.6, 0.5), 0.14, gm, seg=14, rings=10), drag)
    child(sphere((-0.9, -0.55, 0.22), 0.14, M("sp_db", "#d8f5a8", roughness=0.7), scale=(0.9, 0.5, 1.1), seg=12, rings=8), drag)
    eyes = [sphere((-0.9 + dx, -0.72, 0.54), 0.03, M("sp_de", "#16132b"), seg=8, rings=6) for dx in (-0.06, 0.06)]
    for e in eyes:
        e.parent = drag
        e.location = (e.location.x, e.location.y, e.location.z)
    for dx in (-0.08, 0.08):
        child(cone((-0.9 + dx, -0.58, 0.64), 0.03, 0.0, 0.1, M("sp_dh", "#ff9a3c"), verts=8), drag)
    wing = []
    for side in (-1, 1):
        w = empty()
        w.parent = drag
        w.location = (-0.9 + side * 0.15, -0.32, 0.33)
        wn = box((side * 0.12, 0, 0.1), (0.2, 0.02, 0.28), M("sp_dw", "#2f9a54", roughness=0.7), bevel=0)
        wn.parent = w
        wn.location = (side * 0.12, 0, 0.1)
        wing.append((w, side))
    torch_m = glow("sp_tr", "#ff9a2b", 6.0)
    flames = []
    for sx in (-1, 1):
        bar((sx * 1.2, -0.2, 0.3), (sx * 1.2, -0.2, 1.1), 0.02, M("sp_tp", "#4b3220", roughness=0.8), verts=6)
        flames.append(cone((sx * 1.2, -0.2, 1.2), 0.07, 0.0, 0.2, torch_m, verts=10))
    spark = [sphere((0, 0, 0), 0.016, glow("sp_s%d" % k, "#fff2b0", 7.0), seg=6, rings=4) for k in range(12)]
    srnd = random.Random(2)
    sp_pos = [(srnd.uniform(-0.5, 0.7), srnd.uniform(-0.3, 0.3)) for _ in spark]

    @anim
    def _sp(t):
        ph = t * TAU
        crown.rotation_euler = (0, 0, ph)
        crown.location.z = 0.05 * math.sin(ph)
        for i, m_ in enumerate(gem_m):
            set_glow(m_, 1.5 + 2.5 * max(0, math.sin(2 * ph + i * 1.7)))
        drag.scale = (1, 1, 1 + 0.03 * math.sin(2 * ph))
        blink = 0.1 if (t % 0.5) < 0.05 else 1.0
        for e in eyes:
            e.scale = (1, 1, blink)
        for w, side in wing:
            w.rotation_euler = (0, side * 0.35 * math.sin(2 * ph), 0)
        for i, f in enumerate(flames):
            f.scale = (1 + 0.1 * math.sin(3 * ph + i), 1 + 0.1 * math.sin(3 * ph + i), 1 + 0.3 * math.sin(4 * ph + i * 2))
        set_glow(torch_m, 4.5 + 2.0 * math.sin(3 * ph) * math.cos(ph))
        for i, (s_, (x, y)) in enumerate(zip(spark, sp_pos)):
            q = (t * 2 + i / len(spark)) % 1.0
            s_.location = (x + 0.1 * math.sin(ph + i), y, 0.7 + 1.0 * q)
            k_ = math.sin(math.pi * q)
            s_.scale = (k_, k_, k_)

    run(lambda t: None, "obchod_stanek_poklad")


JOBS = {"kolo_disk": kolo_disk, "kolo_predni": kolo_predni, "kolo_stojan": kolo_stojan, "stanek_mince": stanek_mince, "stanek_truhla": stanek_truhla, "stanek_poklad": stanek_poklad}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
