"""Česko / čeština: katedrála sv. Víta. Vlající vlajka, houpající se zvony, blikající vitráže a lampy, kroužící ptáci."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_cestina", ortho=4.3, target_z=1.4)
plinth("#8fd36f", "#fff4d0")

stone = stone_material("stone", "#d9cfbb", scale=34, strength=0.28)
stone_d = stone_material("stone_d", "#b9ae98", scale=34, strength=0.3)
stone_l = stone_material("stone_l", "#ece4d2", scale=30, strength=0.2)
roof = material("roof", "#46796f", roughness=0.45, metallic=0.3)
roof_d = material("roof_d", "#2f5a52", roughness=0.5, metallic=0.3)
copper = material("copper", "#5fb49a", roughness=0.4, metallic=0.5)
goldm = material("goldm", "#ffc933", roughness=0.25, metallic=0.8)
dark = material("dark", "#2c2540", roughness=0.8)
cobble = material("cobble", "#a9a395", roughness=0.9)
wood = material("wood", "#7a5636", roughness=0.8)
# vitráže: tři barvy, každá mění jas v jiné fázi
glass = [glow("gl_a", "#ffb347", 2.5), glow("gl_b", "#6fb2ff", 2.2), glow("gl_c", "#ff6f91", 2.2), glow("gl_d", "#8dff9a", 2.0)]
lampm = [glow("lamp%d" % i, "#ffe2a0", 4.0) for i in range(3)]

# --- terén: dlažba, schody, stromy, lampy ---
cobbles(1.1, 90, cobble)
for i in range(4):
    box((0, -0.86 - i * 0.07, 0.04 + 0.025 * (3 - i)), (0.62 - i * 0.02, 0.14, 0.05), stone_l, bevel=0.006)
for sx in (-1, 1):
    tree(sx * 1.0, -0.4, 1.1, kind="round")
    tree(sx * 0.95, 0.5, 0.95, kind="cone", leaf="#2f8f4f")
    bush(sx * 0.62, -0.97, 1.0)
for i, (x, y) in enumerate(((-0.45, -1.0), (0.45, -1.0), (-1.0, 0.1))):
    lamp_post(x, y, lampm[i % 3])

# --- hlavní loď, střecha, hřeben ---
box((0, 0.5, 0.58), (0.98, 1.95, 1.16), stone)
prism(-0.54, 0.54, -0.5, 1.5, 1.16, 1.66, roof)
box((0, 0.5, 1.665), (0.03, 2.0, 0.03), goldm, bevel=0)
for i in range(7):  # pásy střešní krytiny
    y = -0.4 + i * 0.28
    box((-0.27, y, 1.41), (0.55, 0.018, 0.012), roof_d, rot=(0, math.radians(-26), 0), bevel=0)
    box((0.27, y, 1.41), (0.55, 0.018, 0.012), roof_d, rot=(0, math.radians(26), 0), bevel=0)
for i in range(6):
    cone((0, -0.3 + i * 0.34, 1.7), 0.03, 0.0, 0.1, goldm, verts=6)
# štíhlý vikýř se střešní věžičkou uprostřed lodi
box((0, 0.5, 1.7), (0.16, 0.16, 0.14), stone_d)
cone((0, 0.5, 1.98), 0.11, 0.0, 0.5, roof, verts=8)
sphere((0, 0.5, 2.25), 0.025, goldm, seg=8, rings=6)

# --- boční stěny: okna s vitráží, opěrné pilíře a oblouky ---
for sx in (-1, 1):
    for i in range(5):
        y = -0.2 + i * 0.4
        # lomené okno s vitráží
        win = glass[(i + (0 if sx < 0 else 2)) % 4]
        pointed_window(sx * 0.498, y + 0.2, 0.62, 0.15, 0.55, win, rot=math.radians(90))
        # opěrný pilíř, pinákl s krabami a opěrný oblouk (pět tyčí po křivce)
        px = sx * 0.78
        box((px, y, 0.42), (0.14, 0.12, 0.84), stone_d, bevel=0.008)
        cone((px, y, 0.98), 0.075, 0.0, 0.3, roof, verts=6)
        for k in range(3):
            cone((px + sx * 0.0, y + (0.06 if k == 1 else -0.06 if k == 0 else 0), 0.86 + k * 0.0), 0.0, 0.0, 0.0, roof, verts=3) if False else None
        for k in range(5):
            u0, u1 = k / 5, (k + 1) / 5
            f = lambda u: (sx * (0.52 + 0.24 * u), y, 1.02 - 0.34 * u + 0.17 * math.sin(u * math.pi))
            bar(f(u0), f(u1), 0.028, stone_d, verts=8)
        # chrliče
        cone((px + sx * 0.09, y, 0.76), 0.03, 0.012, 0.14, stone_d, verts=6, rot=(0, math.radians(90) * sx, 0))
    # drobné krabí ozdoby na hřebenech pinákl
    for i in range(5):
        y = -0.2 + i * 0.4
        for k in range(4):
            sphere((sx * 0.78 + sx * 0.0, y + (-0.045 if k % 2 else 0.045), 0.98 + 0.07 * k * 0), 0.0, stone_d) if False else None

# --- západní průčelí ---
box((0, -0.52, 0.98), (0.66, 0.36, 1.96), stone)
box((0, -0.52, 1.5), (0.7, 0.4, 0.05), stone_d)
for sx in (-1, 1):
    x = sx * 0.45
    box((x, -0.52, 0.8), (0.42, 0.42, 1.6), stone_d)
    for z in (0.35, 0.78, 1.2):
        box((x, -0.52, z), (0.46, 0.46, 0.035), stone, bevel=0.006)
    box((x, -0.52, 1.62), (0.46, 0.46, 0.07), stone)
    # osmiboká horní část věže a dutá špice
    cyl((x, -0.52, 1.82), 0.2, 0.34, stone, verts=8)
    for k in range(8):
        a = k * math.tau / 8 + math.radians(22.5)
        box((x + 0.19 * math.cos(a), -0.52 + 0.19 * math.sin(a), 1.82), (0.04, 0.04, 0.34), stone_d, rot=(0, 0, a), bevel=0)
    cone((x, -0.52, 2.35), 0.2, 0.0, 0.78, roof, verts=8)
    for k in range(7):  # krabí na hranách špice
        z = 2.05 + k * 0.1
        r = 0.18 * (1 - (z - 2.0) / 0.74)
        for a in range(0, 360, 45):
            ar = math.radians(a + 22)
            sphere((x + r * math.cos(ar), -0.52 + r * math.sin(ar), z), 0.018, roof_d, seg=6, rings=4)
    sphere((x, -0.52, 2.76), 0.03, goldm, seg=8, rings=6)
    # okna věží
    pointed_window(x, -0.745, 1.18, 0.1, 0.34, glass[(2 if sx < 0 else 3)])
    pointed_window(x, -0.745, 0.55, 0.1, 0.34, glass[(1 if sx < 0 else 0)])
    for a in (0, 90, 180, 270):  # chrliče v rozích
        ar = math.radians(a + 45)
        cone((x + 0.28 * math.cos(ar), -0.52 + 0.28 * math.sin(ar), 1.6), 0.03, 0.01, 0.15, stone_d, verts=6, rot=(0, 0, ar))
# štít uprostřed průčelí s růžicí a galerií
box((0, -0.52, 1.82), (0.4, 0.3, 0.5), stone)
cone((0, -0.52, 2.2), 0.3, 0.0, 0.5, stone, verts=4, rot=(0, 0, math.radians(45)))
torus((0, -0.72, 1.3), 0.21, 0.035, stone_d, rot=(math.radians(90), 0, 0))
cyl((0, -0.724, 1.3), 0.195, 0.02, glass[0], verts=28, rot=(math.radians(90), 0, 0))
for k in range(12):
    a = k * math.tau / 12
    bar((0.195 * math.cos(a) * 0.1, -0.74, 1.3 + 0.195 * math.sin(a) * 0.1), (0.19 * math.cos(a), -0.74, 1.3 + 0.19 * math.sin(a)), 0.01, stone_d, verts=6)
for i in range(7):  # galerie lomených arkád
    box((-0.27 + i * 0.09, -0.735, 1.66), (0.05, 0.02, 0.1), glass[i % 4] if False else dark, bevel=0)
    cone((-0.27 + i * 0.09, -0.735, 1.73), 0.032, 0.0, 0.05, dark, verts=3, rot=(math.radians(90), 0, math.radians(90)))
# tři portály s tympanony a sochami
for dx, wd in ((-0.2, 0.13), (0.0, 0.17), (0.2, 0.13)):
    box((dx, -0.7, 0.3), (wd, 0.04, 0.5), dark, bevel=0)
    cone((dx, -0.7, 0.6), wd * 0.6, 0.0, 0.18, dark, verts=3, rot=(math.radians(90), 0, math.radians(90)))
    box((dx, -0.715, 0.7), (wd * 0.7, 0.01, 0.1), glass[(int(dx * 10) + 2) % 4], bevel=0)
for dx in (-0.3, -0.1, 0.1, 0.3):  # sochy v nikách
    cyl((dx, -0.71, 0.92), 0.018, 0.1, stone_l, verts=8)
    sphere((dx, -0.71, 0.99), 0.022, stone_l, seg=8, rings=6)

# --- Velká jižní věž: renesanční helmice, zvony, hodiny, vlajka ---
TX, TY = 0.88, 0.42
box((TX, TY, 0.9), (0.54, 0.54, 1.8), stone)
for z in (0.4, 0.9, 1.4):
    box((TX, TY, z), (0.6, 0.6, 0.04), stone_d, bevel=0.008)
for k in range(5):
    pointed_window(TX, TY - 0.275, 0.5 + k * 0.22, 0.07, 0.15, glass[k % 4])
# hodiny
hands = []
for ang in (0, 90):
    ar = math.radians(ang)
    nx, ny = math.sin(ar) * 1, -math.cos(ar)
    c = (TX + nx * 0.29, TY + ny * 0.29, 1.5)
    cyl(c, 0.16, 0.03, goldm, verts=32, rot=(math.radians(90), 0, ar))
    cyl((TX + nx * 0.305, TY + ny * 0.305, 1.5), 0.145, 0.02, material("dial", "#fffdf2", roughness=0.4), verts=32, rot=(math.radians(90), 0, ar))
    for h in range(12):
        ha = h * math.tau / 12
        box((TX + nx * 0.32 + math.cos(ar) * math.sin(ha) * 0.12, TY + ny * 0.32 + math.sin(ar) * math.sin(ha) * 0.12, 1.5 + 0.12 * math.cos(ha)), (0.014, 0.01, 0.014), dark, rot=(0, 0, ar), bevel=0)
    for length, wid in ((0.12, 0.014), (0.08, 0.02)):
        piv = bpy.data.objects.new("hp", None)
        sc.collection.objects.link(piv)
        piv.location = (TX + nx * 0.325, TY + ny * 0.325, 1.5)
        hand = box((0, 0, 0), (wid, 0.008, length), dark, bevel=0)
        hand.parent = piv
        hand.location = (0, 0, length / 2)
        hands.append((piv, ar, length > 0.1))
# zvonice s houpajícími se zvony
box((TX, TY, 1.9), (0.5, 0.5, 0.32), stone_d)
bells = []
for k, (bx, by) in enumerate(((0.0, 0.0), (0.12, 0.0), (-0.12, 0.0))):
    piv = bpy.data.objects.new("bell", None)
    sc.collection.objects.link(piv)
    piv.location = (TX + bx, TY, 2.02)
    b = cone((0, 0, -0.07), 0.07, 0.03, 0.12, goldm, verts=16)
    b.parent = piv
    b.location = (0, 0, -0.07)
    bells.append((piv, k))
for sx in (-0.25, 0.25):
    box((TX + sx, TY - 0.2, 1.9), (0.04, 0.06, 0.3), stone_l, bevel=0)
box((TX, TY, 2.1), (0.58, 0.58, 0.05), stone_l, bevel=0.008)
for k in range(12):  # zábradlí
    a = k * math.tau / 12
    bar((TX + 0.28 * math.cos(a), TY + 0.28 * math.sin(a), 2.14), (TX + 0.28 * math.cos(a), TY + 0.28 * math.sin(a), 2.22), 0.01, goldm, verts=6)
box((TX, TY, 2.2), (0.4, 0.4, 0.14), stone)
cyl((TX, TY, 2.34), 0.22, 0.14, copper, verts=24)
cone((TX, TY, 2.5), 0.22, 0.09, 0.2, copper, verts=24)
cyl((TX, TY, 2.66), 0.09, 0.14, goldm, verts=16)
cone((TX, TY, 2.82), 0.09, 0.0, 0.18, goldm, verts=12)
bar((TX, TY, 2.9), (TX, TY, 3.1), 0.012, goldm, verts=6)
bar((TX - 0.05, TY, 3.04), (TX + 0.05, TY, 3.04), 0.01, goldm, verts=6)
for k in range(4):
    a = k * math.tau / 4 + 0.4
    cone((TX + 0.3 * math.cos(a), TY + 0.3 * math.sin(a), 2.3), 0.05, 0.0, 0.24, copper, verts=8)
# vlajka na pomocném stožáru
pole((TX + 0.0, TY - 0.0, 3.1), (TX, TY, 3.3), r=0.01, ball=False)
flag = Flag((TX + 0.01, TY, 3.28), 0.5, 0.32, [material("f_w", "#ffffff"), material("f_r", "#d7141a"), material("f_b", "#11457e")],
            lambda u, v: 2 if u < 0.5 * (1 - abs(v - 0.5) * 2) else (0 if v < 0.5 else 1), amp=0.1, waves=1.6, droop=0.02, cols=34, rows=18)
# praporky na špicích věží
pens = []
for sx in (-1, 1):
    pole((sx * 0.45, -0.52, 2.76), (sx * 0.45, -0.52, 2.98), r=0.008, ball=False)
    pens.append(Flag((sx * 0.45 + 0.008, -0.52, 2.97), 0.2, 0.1, [material("pn%d" % sx, "#d7141a")], lambda u, v: 0, cols=10, rows=4, amp=0.04, waves=1.4, droop=0.01))

birds = [Bird(material("bird_b%d" % i, c, roughness=0.6), material("bird_w%d" % i, c, roughness=0.6), s=0.7) for i, c in enumerate(("#fff4e8", "#fff4e8", "#ffe6c8", "#ffffff"))]


def update(t):
    ph = t * math.tau
    flag.update(t)
    for pf in pens:
        pf.update(t)
    for i, m in enumerate(glass):
        set_glow(m, 2.6 + 1.2 * math.sin(ph + i * 1.6))
    for i, m in enumerate(lampm):
        set_glow(m, 4.0 + 1.6 * math.sin(2 * ph + i * 2.1))
    for piv, k in bells:
        piv.rotation_euler = (0, 0.5 * math.sin(ph * 2 + k * 1.1), 0)
    for piv, ar, longer in hands:
        n = Vector((math.sin(ar), -math.cos(ar), 0))
        ang = ph if longer else ph / 12 + 0.6
        piv.rotation_mode = "QUATERNION"
        piv.rotation_quaternion = Quaternion(n, -ang) @ Euler((0, 0, ar)).to_quaternion()
    for i, b in enumerate(birds):
        a = ph + i * math.tau / 4
        r = 1.45 + 0.06 * math.sin(2 * ph + i)
        b.place((r * math.cos(a), 0.2 + 0.66 * math.sin(a), 2.55 + 0.2 * math.sin(a * 2 + i) + 0.08 * i), a + math.pi / 2, 0.7 * math.sin(ph * 4 + i * 1.7))


from mathutils import Quaternion  # noqa: E402
run(update, "znacka_cestina")
