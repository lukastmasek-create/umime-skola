"""„Co tu najdeš“ jako čtyři létající ostrovy: Škola (kurzy), Herna (hry), Věž únikovek a Síň slávy (žebříčky).
Každý ostrov je detailní animovaná diorama s postavičkami, 24 snímků smyčky, průhledné pozadí.
Spuštění: python namesti.py -- skola   (každá ve vlastním procesu; --preview pro čtyři snímky)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *
from unikovky import empty, child, rise

M = lambda n, c, **k: material(n, c, **k)
SIZE_PX = 512
TAU = math.tau


CYAN, VIOLET = "#35d0ff", "#b05cff"
TECH = {}


def island(grass="#6fd06a", rock="#8a6a52", r=1.3):
    """Technoostrov: kovová deska s neonovým okrajem a světelnými segmenty, trávník uprostřed,
    dole kovový trup s fialovými světelnými prstenci a tryskou. Pohádková scéna je pořád nahoře."""
    metal, dark = M("is_m", "#2b3560", roughness=0.32, metallic=0.85), M("is_d", "#161b38", roughness=0.4, metallic=0.75)
    cyl((0, 0, -0.06), r, 0.18, metal, verts=64)
    TECH["rim"] = glow("is_rim", CYAN, 5.0)
    torus((0, 0, 0.028), r, 0.022, TECH["rim"])
    cyl((0, 0, 0.03), r - 0.13, 0.01, M("is_g", grass, roughness=0.8), verts=64)
    seg_m = glow("is_seg", CYAN, 3.0)
    TECH["seg"] = seg_m
    for k in range(18):
        a = k * TAU / 18
        box(((r + 0.004) * math.cos(a), (r + 0.004) * math.sin(a), -0.06), (0.16, 0.035, 0.05), seg_m if k % 3 else glow("is_sv", VIOLET, 4.0), rot=(0, 0, a + math.pi / 2), bevel=0.006)
    cone((0, 0, -0.62), r, 0.55, 1.0, dark, verts=48, smooth=False)
    for z, rad, c in ((-0.33, 1.13, CYAN), (-0.58, 0.95, VIOLET), (-0.83, 0.77, CYAN)):
        torus((0, 0, z), rad + 0.012, 0.018, glow("is_t%d" % int(-z * 100), c, 3.5))
    cone((0, 0, -1.3), 0.55, 0.14, 0.7, metal, verts=24, smooth=False)
    TECH["thr"] = glow("is_th", "#9be8ff", 8.0)
    TECH["thruster"] = sphere((0, 0, -1.72), 0.12, TECH["thr"], scale=(1, 1, 1.5), seg=14, rings=10)
    rnd = random.Random(4)
    for k in range(4):  # antény / krystaly na hraně
        a = rnd.uniform(0, TAU)
        cone(((r - 0.04) * math.cos(a), (r - 0.04) * math.sin(a), 0.05), 0.035, 0.0, 0.22, glow("is_c%d" % k, [CYAN, VIOLET][k % 2], 2.5), verts=5)


def robot(x, y, z, body, pants="#2b3560", hair="#ffffff", s=1.0, rot=0.0):
    """Roboti pomocníci: krabicová postavička s vizírem a anténou; stejné rozhraní jako kid()."""
    root = empty()
    root.location = (x, y, z)
    root.rotation_euler = (0, 0, rot)
    b, d = M("rb_b" + body, body, roughness=0.3, metallic=0.5), M("rb_d", pants, roughness=0.35, metallic=0.7)
    for dx in (-0.045, 0.045):
        child(box((dx * s, 0, 0.065 * s), (0.05 * s, 0.05 * s, 0.13 * s), d, bevel=0.008), root)
        child(box((dx * s, 0.015 * s, 0.015 * s), (0.07 * s, 0.1 * s, 0.03 * s), d, bevel=0.008), root)
    child(box((0, 0, 0.22 * s), (0.2 * s, 0.14 * s, 0.2 * s), b, bevel=0.025), root)
    child(box((0, -0.072 * s, 0.23 * s), (0.1 * s, 0.01 * s, 0.06 * s), glow("rb_pn", VIOLET, 3.0), bevel=0), root)
    child(box((0, 0, 0.395 * s), (0.17 * s, 0.14 * s, 0.13 * s), b, bevel=0.03), root)
    child(box((0, -0.072 * s, 0.4 * s), (0.13 * s, 0.01 * s, 0.05 * s), glow("rb_vz", CYAN, 6.0), bevel=0), root)
    child(bar((0, 0, 0.455 * s), (0, 0, 0.51 * s), 0.006 * s, d, verts=6), root)
    child(sphere((0, 0, 0.52 * s), 0.016 * s, glow("rb_an", "#ff5ad8", 6.0), seg=8, rings=6), root)
    arms = []
    for side in (-1, 1):
        piv = empty()
        piv.parent = root
        piv.location = (side * 0.12 * s, 0, 0.29 * s)
        a = cyl((0, 0, -0.07 * s), 0.025 * s, 0.14 * s, d, verts=10)
        a.parent = piv
        a.location = (0, 0, -0.07 * s)
        h = sphere((0, 0, -0.15 * s), 0.035 * s, b, seg=8, rings=6)
        h.parent = piv
        h.location = (0, 0, -0.15 * s)
        arms.append(piv)
    return root, arms[0], arms[1]


def tech_extras(cx, cy, cz, orbit=0.9, holo_at=None, color=CYAN):
    """Dron kroužící nad ostrovem, hologramové prstence, pulzující neon a tryska."""
    drone = empty()
    white, dk = M("dr_w", "#e8ecf8", roughness=0.3, metallic=0.4), M("dr_d", "#2b3560", roughness=0.35, metallic=0.7)
    child(sphere((0, 0, 0), 0.07, white, scale=(1.2, 1.0, 0.7), seg=14, rings=10), drone)
    child(sphere((0.07, 0, 0.0), 0.028, glow("dr_e", "#ff5ad8", 8.0), seg=8, rings=6), drone)
    rotors = []
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        bar((0, 0, 0), (sx * 0.1, sy * 0.1, 0.03), 0.006, dk, verts=6).parent = drone
        rot_ = empty()
        rot_.parent = drone
        rot_.location = (sx * 0.1, sy * 0.1, 0.04)
        d = cyl((0, 0, 0), 0.075, 0.004, glow("dr_r", color, 2.0), verts=20)
        d.parent = rot_
        rotors.append(rot_)
    holo = empty()
    hx, hy, hz = holo_at or (cx, cy, cz)
    holo.location = (hx, hy, hz)
    rings = []
    for k, c in enumerate((CYAN, VIOLET)):
        t_ = torus((0, 0, 0), 0.38 - 0.09 * k, 0.012, glow("ho_%d" % k, c, 5.0), rot=(math.radians(70 - 40 * k), 0, 0))
        t_.parent = holo
        rings.append(t_)

    @anim
    def _te(t):
        ph = t * TAU
        drone.location = (cx + orbit * math.cos(ph), cy + 0.7 * orbit * math.sin(ph), cz + 0.06 * math.sin(2 * ph))
        drone.rotation_euler = (0.1 * math.sin(ph * 2), 0.08 * math.cos(ph * 2), ph + math.pi / 2)
        for r_ in rotors:
            r_.rotation_euler = (0, 0, ph * 12)
        holo.rotation_euler = (0, 0, ph)
        for i, r_ in enumerate(rings):
            r_.rotation_euler = (math.radians(70 - 40 * i) + 0.3 * math.sin(ph + i * 2), 0, 0)
        set_glow(TECH["rim"], 4.0 + 2.0 * math.sin(ph))
        set_glow(TECH["seg"], 2.5 + 1.5 * math.sin(2 * ph))
        s_ = 1.0 + 0.25 * math.sin(6 * ph)
        TECH["thruster"].scale = (s_, s_, 1.5 * s_)
        set_glow(TECH["thr"], 7.0 + 3.0 * math.sin(6 * ph))


def kid(x, y, z, shirt, pants, hair, s=1.0, rot=0.0):
    """Postavička: nohy, tělo, hlava s vlasy a očima, dvě otočné ruce. Vrací (kořen, levá, pravá)."""
    root = empty()
    root.location = (x, y, z)
    root.rotation_euler = (0, 0, rot)
    skin = M("kd_sk", "#ffd5a8", roughness=0.6)
    sh, pa, ha = M("kd_s" + shirt, shirt, roughness=0.6), M("kd_p" + pants, pants, roughness=0.6), M("kd_h" + hair, hair, roughness=0.7)
    for dx in (-0.045, 0.045):
        child(cyl((dx * s, 0, 0.07 * s), 0.035 * s, 0.14 * s, pa, verts=10), root)
        child(box((dx * s, 0.02 * s, 0.015 * s), (0.06 * s, 0.1 * s, 0.03 * s), M("kd_b", "#3a2a22", roughness=0.7), bevel=0.005), root)
    child(sphere((0, 0, 0.23 * s), 0.1 * s, sh, scale=(0.9, 0.75, 1.15), seg=16, rings=12), root)
    child(sphere((0, 0, 0.42 * s), 0.085 * s, skin, seg=16, rings=12), root)
    child(sphere((0, 0.005 * s, 0.455 * s), 0.09 * s, ha, scale=(1.0, 1.0, 0.7), seg=16, rings=10), root)
    for dx in (-0.032, 0.032):
        child(sphere((dx * s, -0.075 * s, 0.425 * s), 0.014 * s, M("kd_e", "#16132b"), seg=8, rings=6), root)
    child(sphere((0, -0.08 * s, 0.395 * s), 0.012 * s, M("kd_m", "#d9604a"), scale=(2, 1, 1), seg=8, rings=6), root)
    arms = []
    for side in (-1, 1):
        piv = empty()
        piv.parent = root
        piv.location = (side * 0.1 * s, 0, 0.29 * s)
        a = cyl((0, 0, -0.07 * s), 0.028 * s, 0.14 * s, sh, verts=10)
        a.parent = piv
        a.location = (0, 0, -0.07 * s)
        h = sphere((0, 0, -0.15 * s), 0.032 * s, skin, seg=8, rings=6)
        h.parent = piv
        h.location = (0, 0, -0.15 * s)
        arms.append(piv)
    return root, arms[0], arms[1]


def confetti(n, name="cf"):
    cols = ["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a", "#c9a8ff", "#ff9a3c"]
    return [box((0, 0, 0), (0.03, 0.015, 0.003), glow("%s%d" % (name, k), cols[k % 6], 2.0), bevel=0) for k in range(n)]


# ---------------------------------------------------------------- Škola
def skola():
    setup("nam_skola", size=SIZE_PX, ortho=5.1, target_z=0.55, world=("#cfe4ff", 0.6))
    island("#74d36c", "#8a6a52")
    wall, roof, wood, trim = M("sk_w", "#fff0cf", roughness=0.7), M("sk_r", "#d9473d", roughness=0.55), M("sk_wd", "#8a5a34", roughness=0.7), M("sk_t", "#ffffff", roughness=0.5)
    win, gold = glow("sk_win", "#ffe9a0", 2.2), M("sk_g", "#ffc933", roughness=0.3, metallic=0.9)
    # budova
    box((-0.05, 0.45, 0.38), (1.3, 0.62, 0.7), wall, bevel=0.03)
    prism(-0.7, 0.6, 0.12, 0.78, 0.73, 1.05, roof)
    box((-0.05, 0.12, 0.2), (0.28, 0.06, 0.44), wood, bevel=0.01)
    box((-0.05, 0.1, 0.46), (0.36, 0.05, 0.05), trim, bevel=0.005)
    for dx in (-0.45, -0.25, 0.25, 0.45):
        box((dx - 0.05, 0.12, 0.42), (0.14, 0.04, 0.2), win, bevel=0.005)
        box((dx - 0.05, 0.105, 0.42), (0.17, 0.02, 0.02), trim, bevel=0)
    # zvonice s hodinami a zvonem
    box((0.38, 0.45, 0.95), (0.34, 0.34, 0.55), wall, bevel=0.02)
    cone((0.38, 0.45, 1.46), 0.3, 0.0, 0.34, roof, verts=4, rot=(0, 0, math.radians(45)), smooth=False)
    cyl((0.38, 0.27, 1.0), 0.1, 0.03, trim, verts=24, rot=(math.radians(90), 0, 0))
    hand = empty()
    hand.location = (0.38, 0.255, 1.0)
    bar((0, 0, 0), (0, 0, 0.075), 0.007, M("sk_h", "#222222", roughness=0.4), verts=6).parent = hand
    bell = empty()
    bell.location = (0.38, 0.45, 1.18)
    child(cone((0, 0, -0.08), 0.07, 0.04, 0.1, gold, verts=16), bell)
    pole((0.38, 0.45, 1.62), (0.38, 0.45, 1.85), mat=wood, ball=False)
    fl = Flag((0.38, 0.45, 1.85), 0.38, 0.22, [M("sk_f1", "#3b9bff", roughness=0.6), M("sk_f2", "#ffd23a", roughness=0.6)], lambda u, v: 0 if v < 0.5 else 1, amp=0.07, waves=1.6)
    # tabule na stojanu s křídou
    for dx in (-0.14, 0.14):
        bar((-0.75 + dx, -0.35, 0.0), (-0.75 + dx * 0.8, -0.35, 0.5), 0.015, wood, verts=6)
    box((-0.75, -0.37, 0.5), (0.42, 0.03, 0.3), M("sk_bd", "#2b5a45", roughness=0.9), bevel=0.01)
    for k, c in enumerate(("#ff7aa6", "#ffe27a", "#7ad7ff", "#ffffff")):
        box((-0.88 + 0.08 * k, -0.395, 0.5 + 0.05 * (k % 2)), (0.05, 0.01, 0.05), M("sk_cl%d" % k, c, roughness=0.5), bevel=0)
    # strom, lavička, plot z pastelek
    tree(0.9, -0.2, 1.7, kind="round")
    box((0.25, -0.65, 0.12), (0.5, 0.14, 0.04), wood, bevel=0.008)
    box((0.25, -0.58, 0.2), (0.5, 0.03, 0.14), wood, bevel=0.008)
    for dx in (-0.2, 0.2):
        box((0.25 + dx, -0.65, 0.05), (0.04, 0.12, 0.1), wood)
    for k in range(7):
        a = M("sk_pc%d" % k, ["#ff5a5a", "#ffb02e", "#ffe03a", "#5ad07a", "#4ab0ff", "#a07aff", "#ff7ac8"][k], roughness=0.5)
        cyl((-1.05 + 0.1 * k, 0.1 - 0.02 * k, 0.1), 0.028, 0.2, a, verts=6)
        cone((-1.05 + 0.1 * k, 0.1 - 0.02 * k, 0.225), 0.028, 0.0, 0.05, M("sk_pw", "#f0d6a8", roughness=0.7), verts=6)
    # děti
    k1, k1a, k1b = kid(-0.3, -0.45, 0.0, "#ff5a7a", "#2f3c6e", "#5a3a22", rot=-0.6)
    k2, k2a, k2b = kid(0.5, -0.38, 0.0, "#3b9bff", "#4a4a6a", "#e8b03a", rot=0.4)
    k3, k3a, k3b = robot(1.0, -0.65, 0.0, "#35d0ff", s=1.1, rot=0.9)
    # létající knihy a papírové vlaštovky
    bk_cols = ["#e8553f", "#3b7be0", "#f2b93a"]
    books_ = []
    for k, c in enumerate(bk_cols):
        b = empty()
        child(box((0, 0, 0), (0.14, 0.18, 0.04), M("sk_bk%d" % k, c, roughness=0.6), bevel=0.008), b)
        child(box((0.005, 0, 0), (0.12, 0.16, 0.03), M("sk_pg", "#fff8e6", roughness=0.9), bevel=0), b)
        books_.append(b)
    planes = [Bird(M("sk_pp%d" % k, "#ffffff", roughness=0.8), M("sk_pw%d" % k, "#cfe4ff", roughness=0.8), None, s=0.9) for k in range(2)]
    stars = [sphere((0, 0, 0), 0.02, glow("sk_st%d" % k, "#ffe27a", 6.0), seg=6, rings=4) for k in range(8)]

    @anim
    def _s(t):
        ph = t * TAU
        fl.update(t)
        bell.rotation_euler = (0, 0.55 * math.sin(2 * ph), 0)
        hand.rotation_euler = (0, -ph, 0)
        k1.location.z = 0.12 * abs(math.sin(2 * ph))
        k1a.rotation_euler = (0, math.radians(140) + 0.3 * math.sin(4 * ph), 0)
        k1b.rotation_euler = (0, -math.radians(140) - 0.3 * math.sin(4 * ph), 0)
        k2a.rotation_euler = (0, math.radians(110) + 0.5 * math.sin(2 * ph), 0)
        k2.rotation_euler = (0, 0, 0.4 + 0.1 * math.sin(2 * ph))
        k3.location = (1.0 + 0.1 * math.sin(ph), -0.65 + 0.05 * math.cos(ph), 0.02 * abs(math.sin(3 * ph)))
        k3a.rotation_euler = (0.5 * math.sin(2 * ph), 0, 0)
        k3b.rotation_euler = (-0.5 * math.sin(2 * ph), 0, 0)
        for i, b in enumerate(books_):
            a = ph + i * TAU / 3
            b.location = (-0.05 + 0.85 * math.cos(a), 0.6 + 0.3 * math.sin(a), 1.35 + 0.12 * math.sin(2 * a + i))
            b.rotation_euler = (0.2 * math.sin(a), 0.3, a)
        for i, p in enumerate(planes):
            a = ph + i * math.pi
            p.place((0.0 + 1.0 * math.cos(a), -0.4 + 0.5 * math.sin(a), 1.7 + 0.1 * math.sin(2 * a)), a + math.pi / 2, 0.0)
        rise(stars, t, 0.0, 0.5, 1.2, 0.6, grow=1.0, drift=0.6)

    tech_extras(-0.05, 0.4, 1.9, orbit=1.0, holo_at=(-0.75, -0.3, 1.0))
    run(lambda t: None, "nam_skola")


# ---------------------------------------------------------------- Herna
def herna():
    setup("nam_herna", size=SIZE_PX, ortho=5.1, target_z=0.6, world=("#d9d0ff", 0.55))
    island("#a58cf0", "#6a5a8a")
    body, dark, steel = M("hn_b", "#6a3fd0", roughness=0.35), M("hn_d", "#1c1a3a", roughness=0.4), M("hn_s", "#cfd5df", roughness=0.25, metallic=0.9)
    screen = glow("hn_scr", "#5fffd0", 2.4)
    # velký arkádový automat
    box((0.0, 0.3, 0.55), (0.75, 0.55, 1.1), body, bevel=0.03)
    box((0.0, 0.0, 0.7), (0.62, 0.02, 0.4), screen, bevel=0)
    box((0.0, -0.02, 0.48), (0.7, 0.2, 0.08), M("hn_p", "#8a5af0", roughness=0.35), bevel=0.01, rot=(-0.25, 0, 0))
    box((0.0, 0.3, 1.18), (0.75, 0.4, 0.22), glow("hn_mq", "#ff5ad8", 3.0), bevel=0.02)
    joy = empty()
    joy.location = (-0.15, -0.03, 0.52)
    bar((0, 0, 0), (0, 0, 0.14), 0.014, steel, verts=8).parent = joy
    sphere((0, 0, 0.16), 0.045, M("hn_j", "#ff3b4a", roughness=0.3), seg=14, rings=10).parent = joy
    btns = [sphere((0.07 + 0.09 * k, -0.04, 0.5), 0.03, glow("hn_bt%d" % k, c, 3.0), scale=(1, 1, 0.5), seg=10, rings=8) for k, c in enumerate(("#ff3b4a", "#ffd23a", "#4ad0ff"))]
    # pixelový mimozemšťan na obrazovce
    alien = empty()
    alien.location = (0.0, -0.03, 0.72)
    ap = M("hn_al", "#0b1030", roughness=0.9)
    for (x, z) in ((-2, 1), (-1, 2), (0, 2), (1, 2), (2, 1), (-1, 0), (1, 0), (-2, -1), (2, -1), (-3, 0), (3, 0)):
        child(box((x * 0.03, -0.01, z * 0.03), (0.028, 0.01, 0.028), ap, bevel=0), alien)
    # cirkusový stan
    tent = cone((0.78, -0.35, 0.34), 0.42, 0.04, 0.55, striped_material("hn_tent", "#ff4d6a", "#ffffff", freq=10, roughness=0.6, axis="Z"), verts=24)
    cone((0.78, -0.35, 0.72), 0.1, 0.0, 0.14, M("hn_tr", "#ff4d6a", roughness=0.5), verts=16)
    pole((0.78, -0.35, 0.8), (0.78, -0.35, 1.0), mat=M("hn_pl", "#e9e4f7", roughness=0.4), ball=False)
    fl = Flag((0.78, -0.35, 1.0), 0.28, 0.16, [M("hn_f1", "#ffd23a", roughness=0.5)], lambda u, v: 0, amp=0.06, waves=1.4)
    # kolo
    wheel = empty()
    wheel.location = (-0.8, -0.2, 0.62)
    torus((0, 0, 0), 0.44, 0.02, M("hn_w", "#ffffff", roughness=0.4), rot=(math.radians(90), 0, 0)).parent = wheel
    gond = []
    for k in range(8):
        a = k * TAU / 8
        bar((0, 0, 0), (0.44 * math.cos(a), 0, 0.44 * math.sin(a)), 0.01, M("hn_sp", "#e9e4f7", roughness=0.4), verts=6).parent = wheel
        g = empty()
        child(box((0, 0, -0.06), (0.1, 0.08, 0.09), M("hn_g%d" % k, ["#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a"][k % 4], roughness=0.5), bevel=0.01), g)
        g.location = (0, 0, 0)
        gond.append((g, a))
    box((-0.8, -0.2, 0.15), (0.1, 0.1, 0.3), steel, bevel=0.01)
    # balónky, popcorn vozík
    balloons = []
    for k, c in enumerate(("#ff5a7a", "#ffd23a", "#4ad0ff", "#7dff8a", "#c9a8ff")):
        b = empty()
        b.location = (0.2 + 0.1 * k, -0.7, 0.2)
        child(sphere((0, 0, 0.7 + 0.08 * (k % 2)), 0.1, M("hn_ba%d" % k, c, roughness=0.25), scale=(1, 1, 1.15), seg=16, rings=12), b)
        bar((0, 0, 0), (0, 0, 0.6), 0.004, M("hn_str", "#ffffff", roughness=0.8), verts=4).parent = b
        balloons.append(b)
    box((-0.2, -0.75, 0.2), (0.3, 0.2, 0.2), M("hn_cart", "#f2b93a", roughness=0.5), bevel=0.02)
    sphere((-0.2, -0.75, 0.38), 0.14, M("hn_pop", "#fff3c4", roughness=0.8), scale=(1.1, 0.8, 0.8), seg=14, rings=10)
    # hráči
    p1, p1a, p1b = kid(-0.45, -0.55, 0.0, "#ff9a3c", "#2f3c6e", "#222222", rot=0.4)
    p2, p2a, p2b = robot(0.3, -0.5, 0.0, "#b05cff", s=1.1, rot=-0.3)
    cf = confetti(18, "hncf")
    rnd = random.Random(8)
    cfp = [(rnd.uniform(-0.9, 0.9), rnd.uniform(-0.6, 0.5), rnd.uniform(0, 6)) for _ in cf]
    mats = [btn.data.materials[0] for btn in btns]

    @anim
    def _h(t):
        ph = t * TAU
        fl.update(t)
        joy.rotation_euler = (0.35 * math.sin(3 * ph), 0.35 * math.cos(3 * ph), 0)
        for i, m in enumerate(mats):
            set_glow(m, 0.8 + 3.2 * max(0, math.sin(3 * ph + i * 2.1)))
        set_glow(screen, 1.8 + 1.0 * math.sin(2 * ph))
        alien.location = (0.1 * math.sin(ph), -0.03, 0.72 + 0.06 * abs(math.sin(2 * ph)))
        wheel.rotation_euler = (0, ph * -1, 0)
        for g, a in gond:
            g.location = (-0.8 + 0.44 * math.cos(a + ph), -0.2, 0.62 + 0.44 * math.sin(a + ph))
        for i, b in enumerate(balloons):
            b.rotation_euler = (0.1 * math.sin(ph + i), 0.1 * math.cos(ph + i * 2), 0)
            b.location.z = 0.2 + 0.03 * math.sin(2 * ph + i)
        p1.location.z = 0.1 * abs(math.sin(2 * ph))
        p1a.rotation_euler = (0, math.radians(150) + 0.3 * math.sin(4 * ph), 0)
        p1b.rotation_euler = (0, -math.radians(150) - 0.3 * math.sin(4 * ph), 0)
        p2a.rotation_euler = (0.9 + 0.3 * math.sin(3 * ph), 0, 0)
        p2b.rotation_euler = (0.9 - 0.3 * math.sin(3 * ph), 0, 0)
        for i, (c, (x, y, o)) in enumerate(zip(cf, cfp)):
            q = (t + i / len(cf)) % 1.0
            c.location = (x + 0.08 * math.sin(ph * 2 + o), y, 1.9 - 1.7 * q)
            c.rotation_euler = (ph * 2 + o, ph * 3, o)
            s = math.sin(math.pi * min(1.0, q * 1.1))
            c.scale = (0.03 * s, 0.015 * s, 0.003 * s)

    tech_extras(0.0, 0.0, 1.8, orbit=1.0, holo_at=(0.78, -0.35, 1.45))
    run(lambda t: None, "nam_herna")


# ---------------------------------------------------------------- Věž únikovek
def vez():
    setup("nam_vez", size=SIZE_PX, ortho=5.1, target_z=0.7, world=("#c8d4f5", 0.5))
    island("#5aa660", "#6a6a7a")
    stone = stone_material("vz_s", "#9aa0b8", 16, 0.4, 0.9)
    moss, wood = M("vz_m", "#4c8f4c", roughness=0.9), M("vz_w", "#7a4a26", roughness=0.7)
    roof = M("vz_r", "#5a3fb0", roughness=0.5)
    # věž
    cyl((0, 0.3, 0.7), 0.55, 1.4, stone, verts=32)
    for k in range(4):
        torus((0, 0.3, 0.35 + 0.35 * k), 0.57, 0.015, M("vz_rg", "#7a7f98", roughness=0.6))
    cone((0, 0.3, 1.65), 0.68, 0.0, 0.75, roof, verts=32)
    sphere((0, 0.3, 2.05), 0.06, M("vz_go", "#ffc933", roughness=0.3, metallic=0.9), seg=12, rings=8)
    for a in (0.6, 2.4, 4.0):
        box((0.55 * math.cos(a), 0.3 + 0.55 * math.sin(a), 1.2), (0.1, 0.04, 0.24), glow("vz_win%d" % int(a * 10), "#ffd86a", 2.0), rot=(0, 0, a + 1.57), bevel=0.005)
    # velké dveře, které se otevírají
    box((0, -0.24, 0.3), (0.62, 0.1, 0.6), M("vz_fr", "#2a2438", roughness=0.8), bevel=0.01)
    cyl((0, -0.24, 0.6), 0.31, 0.1, M("vz_fr2", "#2a2438", roughness=0.8), verts=24, rot=(math.radians(90), 0, 0))
    light_m = glow("vz_lt", "#ffe9a0", 0.0)
    box((0, -0.275, 0.32), (0.5, 0.02, 0.62), light_m, bevel=0)
    door = empty()
    door.location = (-0.25, -0.29, 0.0)
    child(box((0.0, 0.0, 0.0), (0.5, 0.06, 0.62), wood, bevel=0.01), door).location = (0.25, 0.0, 0.31)
    child(box((0.25, -0.04, 0.31), (0.44, 0.03, 0.05), M("vz_hn", "#3a3a48", roughness=0.4, metallic=0.8), bevel=0), door)
    child(sphere((0.42, -0.04, 0.3), 0.03, M("vz_kn", "#ffc933", roughness=0.3, metallic=0.9), seg=8, rings=6), door)
    # schody
    for k in range(3):
        box((0, -0.45 - 0.1 * k, 0.04 + 0.0 - 0.03 * k + 0.03), (0.6 + 0.1 * k, 0.14, 0.06), stone, bevel=0.01)
    # pochodně
    tm = glow("vz_tf", "#ff9a2b", 6.0)
    tfs = []
    for x in (-0.55, 0.55):
        bar((x, -0.3, 0.2), (x, -0.3, 0.55), 0.015, wood, verts=6)
        tfs.append(cone((x, -0.3, 0.6), 0.05, 0.0, 0.16, tm, verts=10))
    # klíče a zámek
    gold = M("vz_k", "#ffc933", roughness=0.28, metallic=0.95)
    keys = []
    for k in range(3):
        o = empty()
        child(torus((0, 0, 0.0), 0.05, 0.015, gold, rot=(math.radians(90), 0, 0)), o)
        child(bar((0.05, 0, 0), (0.22, 0, 0), 0.012, gold, verts=8), o)
        child(box((0.2, 0, -0.03), (0.02, 0.02, 0.05), gold, bevel=0), o)
        child(box((0.16, 0, -0.03), (0.02, 0.02, 0.05), gold, bevel=0), o)
        keys.append(o)
    lock = empty()
    child(box((0, 0, 0), (0.2, 0.08, 0.16), M("vz_lk", "#4a4f6a", roughness=0.35, metallic=0.8), bevel=0.015), lock)
    child(torus((0, 0, 0.08), 0.06, 0.016, M("vz_ls", "#cfd5df", roughness=0.25, metallic=0.9), rot=(math.radians(90), 0, 0)), lock)
    child(cyl((0, -0.05, 0.0), 0.025, 0.01, glow("vz_kh", "#ffd23a", 3.0), verts=10, rot=(math.radians(90), 0, 0)), lock)
    # sova na střeše
    owl = empty()
    owl.location = (0.5, 0.3, 1.55)
    ob = M("vz_ow", "#8a6a4a", roughness=0.9)
    child(sphere((0, 0, 0.1), 0.1, ob, scale=(0.9, 0.8, 1.2), seg=14, rings=10), owl)
    eye_m = glow("vz_oe", "#ffe27a", 3.0)
    eyes = [sphere((dx, -0.07, 0.13), 0.03, eye_m, seg=8, rings=6) for dx in (-0.04, 0.04)]
    for e in eyes:
        e.parent = owl
    child(cone((0, -0.09, 0.1), 0.015, 0.0, 0.04, M("vz_ob", "#ffb02e"), verts=6, rot=(math.radians(-90), 0, 0)), owl)
    # bedny a truhla
    box((0.85, -0.3, 0.12), (0.3, 0.26, 0.2), wood, bevel=0.015)
    chest = box((-0.85, -0.3, 0.1), (0.3, 0.2, 0.15), wood, bevel=0.015)
    lid = empty()
    lid.location = (-0.85, -0.2, 0.18)
    child(box((-0.85, -0.3, 0.205), (0.3, 0.2, 0.04), M("vz_ld", "#6a3a1a", roughness=0.7), bevel=0.015), lid)
    gl = glow("vz_gem", "#7fffd6", 2.0)
    sphere((-0.85, -0.3, 0.2), 0.05, gl, seg=10, rings=8)
    kid1, k1a, k1b = robot(0.4, -0.7, 0.0, "#35d0ff", s=1.1, rot=0.3)
    sparks = [sphere((0, 0, 0), 0.015, glow("vz_sp%d" % k, "#fff2b0", 6.0), seg=6, rings=4) for k in range(10)]

    @anim
    def _v(t):
        ph = t * TAU
        o = 0.5 - 0.5 * math.cos(ph)
        door.rotation_euler = (0, 0, -math.radians(105) * o)
        set_glow(light_m, 5.0 * o)
        for i, f in enumerate(tfs):
            f.scale = (1 + 0.1 * math.sin(3 * ph + i), 1 + 0.1 * math.sin(3 * ph + i), 1 + 0.3 * math.sin(4 * ph + i * 2))
        set_glow(tm, 4.5 + 2.0 * math.sin(3 * ph) * math.cos(ph))
        for i, k in enumerate(keys):
            a = ph + i * TAU / 3
            k.location = (0.95 * math.cos(a), 0.3 + 0.6 * math.sin(a), 1.0 + 0.15 * math.sin(2 * a + i))
            k.rotation_euler = (a * 2, 0.3, a)
        lock.location = (-0.0, -0.1, 1.6 + 0.06 * math.sin(2 * ph))
        lock.rotation_euler = (0, 0.25 * math.sin(2 * ph), 0)
        blink = 1.0 if (t % 0.5) > 0.06 else 0.1
        for e in eyes:
            e.scale = (1, 1, blink)
        owl.rotation_euler = (0, 0, 0.5 * math.sin(ph))
        lid.rotation_euler = (-math.radians(60) * (0.5 + 0.5 * math.sin(ph)), 0, 0)
        set_glow(gl, 1.5 + 1.5 * math.sin(2 * ph))
        k1a.rotation_euler = (0, math.radians(120) + 0.4 * math.sin(3 * ph), 0)
        kid1.rotation_euler = (0, 0, 0.3 + 0.2 * math.sin(ph))
        rise(sparks, t, -0.85, -0.3, 0.25, 0.7, grow=1.0, drift=0.1)

    tech_extras(0.0, 0.3, 2.25, orbit=0.9, holo_at=(0.0, 0.3, 2.3), color=VIOLET)
    run(lambda t: None, "nam_vez")


# ---------------------------------------------------------------- Síň slávy
def sin():
    setup("nam_sin", size=SIZE_PX, ortho=5.1, target_z=0.8, world=("#ffe9c9", 0.5))
    island("#f0c860", "#9a7a52")
    gold, silver, bronze = M("sn_g", "#ffc933", roughness=0.22, metallic=1.0), M("sn_s", "#dfe4ee", roughness=0.25, metallic=1.0), M("sn_b", "#cd7f3a", roughness=0.3, metallic=1.0)
    marble = stone_material("sn_m", "#f4efe4", 14, 0.1, 0.3)
    red = M("sn_r", "#c4283a", roughness=0.8)
    # koberec a stupně vítězů
    box((0, -0.55, 0.0), (0.8, 1.0, 0.03), red, bevel=0.005, rot=(0, 0, 0))
    box((0, 0.2, 0.3), (0.5, 0.5, 0.6), marble, bevel=0.02)
    box((-0.52, 0.2, 0.2), (0.5, 0.5, 0.4), marble, bevel=0.02)
    box((0.52, 0.2, 0.14), (0.5, 0.5, 0.28), marble, bevel=0.02)
    for x, h, c in ((0, 0.6, gold), (-0.52, 0.4, silver), (0.52, 0.28, bronze)):
        cyl((x, 0.0, h - 0.06), 0.09, 0.02, c, verts=24, rot=(math.radians(90), 0, 0))
    # velký pohár
    cup = empty()
    cup.location = (0, 0.2, 0.72)
    child(cyl((0, 0.2, 0.74), 0.07, 0.04, M("sn_bs", "#4a2c16", roughness=0.5), verts=20), cup)
    child(cone((0, 0.2, 0.86), 0.04, 0.02, 0.2, gold, verts=20), cup)
    child(cone((0, 0.2, 1.1), 0.05, 0.2, 0.3, gold, verts=28), cup)
    child(torus((0, 0.2, 1.0), 0.0, 0.0, gold), cup) if False else None
    for s in (-1, 1):
        child(torus((s * 0.19, 0.2, 1.06), 0.07, 0.015, gold, rot=(math.radians(90), 0, 0)), cup)
    child(sphere((0, 0.2, 1.28), 0.04, glow("sn_cs", "#fff2b0", 4.0), seg=10, rings=8), cup)
    # vítězové
    w1, w1a, w1b = kid(0.0, 0.2, 0.6, "#ff5a7a", "#2f3c6e", "#5a3a22", s=0.9, rot=0.0)
    w2, w2a, w2b = kid(-0.52, 0.2, 0.4, "#3b9bff", "#4a4a6a", "#e8b03a", s=0.9, rot=0.2)
    w3, w3a, w3b = robot(0.52, 0.2, 0.28, "#b05cff", s=1.1, rot=-0.2)
    # medaile na stojanu
    for dx in (-0.1, 0.1):
        bar((-0.95 + dx, -0.3, 0.0), (-0.95 + dx, -0.3, 0.75), 0.015, M("sn_pl", "#4a4f6a", roughness=0.4, metallic=0.7), verts=8)
    bar((-1.05, -0.3, 0.72), (-0.85, -0.3, 0.72), 0.012, M("sn_pl2", "#4a4f6a", roughness=0.4, metallic=0.7), verts=8)
    meds = []
    for k, c in enumerate((gold, silver, bronze)):
        o = empty()
        o.location = (-1.0 + 0.1 * k, -0.3, 0.72)
        bar((0, 0, 0), (0, 0, -0.1), 0.004, M("sn_rb%d" % k, ["#ff5a7a", "#4ab0ff", "#7dff8a"][k], roughness=0.6), verts=4).parent = o
        m = cyl((0, 0, -0.14), 0.045, 0.012, c, verts=24, rot=(math.radians(90), 0, 0))
        m.parent = o
        m.location = (0, 0, -0.14)
        meds.append(o)
    # vlajky a světlomety
    fl1 = None
    pole((0.95, 0.5, 0.0), (0.95, 0.5, 1.5), mat=M("sn_fp", "#e9e4f7", roughness=0.4), ball=False)
    fl1 = Flag((0.95, 0.5, 1.5), 0.4, 0.24, [M("sn_f1", "#ff5a7a", roughness=0.6), M("sn_f2", "#ffd23a", roughness=0.6)], lambda u, v: 0 if v < 0.5 else 1, amp=0.07, waves=1.6)
    pole((-0.95, 0.5, 0.0), (-0.95, 0.5, 1.3), mat=M("sn_fp2", "#e9e4f7", roughness=0.4), ball=False)
    fl2 = Flag((-0.95, 0.5, 1.3), 0.38, 0.22, [M("sn_f3", "#3b9bff", roughness=0.6), M("sn_f4", "#ffffff", roughness=0.6)], lambda u, v: 0 if v < 0.5 else 1, amp=0.07, waves=1.6)
    lamps = []
    for x in (-0.9, 0.9):
        bar((x, -0.6, 0.0), (x, -0.6, 0.45), 0.02, M("sn_lp", "#3b3a4a", roughness=0.4, metallic=0.7), verts=8)
        l = glow("sn_lm%d" % int(x * 10), "#fff2b0", 5.0)
        sphere((x, -0.6, 0.5), 0.06, l, seg=12, rings=8)
        lamps.append(l)
    # konfety a ohňostroj
    cf = confetti(26, "sncf")
    rnd = random.Random(12)
    cfp = [(rnd.uniform(-1.0, 1.0), rnd.uniform(-0.3, 0.8), rnd.uniform(0, 6)) for _ in cf]
    fw = []
    for k in range(3):
        burst = [sphere((0, 0, 0), 0.025, glow("sn_fw%d_%d" % (k, j), ["#ff5a7a", "#ffd23a", "#4ad0ff"][k], 8.0), seg=6, rings=4) for j in range(10)]
        fw.append(burst)

    @anim
    def _sn(t):
        ph = t * TAU
        fl1.update(t)
        fl2.update(t + 0.3)
        cup.rotation_euler = (0, 0, ph)
        cup.location.z = 0.72 + 0.03 * math.sin(ph)
        for w, a, b in ((w1, w1a, w1b), (w2, w2a, w2b), (w3, w3a, w3b)):
            idx = 0
        w1.location.z = 0.6 + 0.08 * abs(math.sin(2 * ph))
        w1a.rotation_euler = (0, math.radians(160) + 0.2 * math.sin(4 * ph), 0)
        w1b.rotation_euler = (0, -math.radians(160) - 0.2 * math.sin(4 * ph), 0)
        w2.location.z = 0.4 + 0.05 * abs(math.sin(2 * ph + 1))
        w2a.rotation_euler = (0, math.radians(120) + 0.3 * math.sin(3 * ph), 0)
        w2b.rotation_euler = (0, -math.radians(40), 0)
        w3.location.z = 0.28 + 0.05 * abs(math.sin(2 * ph + 2))
        w3b.rotation_euler = (0, -math.radians(120) - 0.3 * math.sin(3 * ph), 0)
        for i, m in enumerate(meds):
            m.rotation_euler = (0, 0.3 * math.sin(2 * ph + i), 0.5 * math.sin(2 * ph + i))
        for i, l in enumerate(lamps):
            set_glow(l, 3.5 + 2.5 * math.sin(2 * ph + i * math.pi))
        for i, (c, (x, y, o)) in enumerate(zip(cf, cfp)):
            q = (t + i / len(cf)) % 1.0
            c.location = (x + 0.1 * math.sin(ph * 2 + o), y, 2.0 - 1.9 * q)
            c.rotation_euler = (ph * 2 + o, ph * 3, o)
            s = math.sin(math.pi * min(1.0, q * 1.1))
            c.scale = (0.035 * s, 0.017 * s, 0.003 * s)
        for k, burst in enumerate(fw):
            q = (t * 1 + k / 3.0) % 1.0
            cx, cz = (-0.6 + 0.6 * k, 1.9 + 0.15 * (k % 2))
            r = 0.35 * q
            s = max(0.0, 1.0 - q) ** 0.7
            for j, sp in enumerate(burst):
                a = j * TAU / len(burst)
                sp.location = (cx + r * math.cos(a), 0.4 + 0.1 * math.sin(a), cz + r * math.sin(a) - 0.1 * q * q)
                sp.scale = (s, s, s)

    tech_extras(0.0, 0.2, 1.75, orbit=0.8, holo_at=(0.0, 0.2, 1.65))
    run(lambda t: None, "nam_sin")


JOBS = {"skola": skola, "herna": herna, "vez": vez, "sin": sin}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
