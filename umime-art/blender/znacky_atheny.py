"""Řecko / matematika: Parthenon. Kolem chrámu kroužící zářící matematické značky."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_matematika", world=("#d6e6ff", 0.65), ortho=4.0, target_z=1.0)
plinth("#8fd9a8", "#ffffff")

marble = stone_material("marble", "#f1ead8", scale=20, strength=0.12, roughness=0.55)
marble_d = stone_material("marble_d", "#d8cfb6", scale=20, strength=0.14, roughness=0.6)
terra = material("terra", "#c9744b", roughness=0.6)
blue = material("blue", "#4a78c4", roughness=0.6)

# krepidoma: tři stupně
box((0, 0, 0.04), (1.35, 2.25, 0.08), marble_d)
box((0, 0, 0.11), (1.25, 2.1, 0.07), marble)
box((0, 0, 0.17), (1.15, 1.95, 0.06), marble_d)
Z0 = 0.2
COL_H = 0.95
fx = [-0.5 + i * (1.0 / 7) for i in range(8)]
sy = [-0.88 + i * (1.76 / 12) for i in range(13)]
for x in fx:
    for y in (-0.9, 0.9):
        cone((x, y, Z0 + COL_H / 2), 0.052, 0.04, COL_H, marble, verts=18)
        box((x, y, Z0 + COL_H + 0.025), (0.13, 0.13, 0.05), marble_d)
for x in (-0.5, 0.5):
    for y in sy[1:-1]:
        cone((x, y, Z0 + COL_H / 2), 0.052, 0.04, COL_H, marble, verts=18)
        box((x, y, Z0 + COL_H + 0.025), (0.13, 0.13, 0.05), marble_d)
# cela (vnitřní stěny) a kladí
box((0, 0, Z0 + COL_H / 2), (0.62, 1.4, COL_H), marble_d)
box((0, 0, Z0 + COL_H + 0.1), (1.14, 1.96, 0.14), marble)
for i in range(15):
    box((-0.5 + i * 0.0715, -0.985, Z0 + COL_H + 0.1), (0.03, 0.015, 0.1), marble_d, bevel=0)
box((0, 0, Z0 + COL_H + 0.19), (1.18, 2.0, 0.04), marble_d)
# štít s reliéfem
prism(-0.59, 0.59, -1.0, 1.0, Z0 + COL_H + 0.21, Z0 + COL_H + 0.52, marble)
tri = mesh_obj("tym", [(-0.45, -1.005, Z0 + COL_H + 0.22), (0.45, -1.005, Z0 + COL_H + 0.22), (0, -1.005, Z0 + COL_H + 0.46)], [(0, 1, 2)], terra)
for i in range(5):
    sphere((-0.3 + i * 0.15, -1.012, Z0 + COL_H + 0.27), 0.034, marble, scale=(0.8, 0.3, 1.5), seg=10, rings=8)
# akroteria
for x in (-0.58, 0.58):
    sphere((x, -1.0, Z0 + COL_H + 0.22), 0.04, marble_d, scale=(1, 1, 1.4), seg=10, rings=8)
sphere((0, -1.0, Z0 + COL_H + 0.54), 0.04, marble_d, scale=(1, 1, 1.4), seg=10, rings=8)


# --- detaily: Akropolis (skalní podstavec), kanelury, sochy ve štítu, olivovníky, sova ---
rockm = stone_material("rockm", "#b9a98c", scale=12, strength=0.4, roughness=0.9)
rnd = random.Random(4)
for k in range(26):  # skalní okraj Akropole kolem stupňů
    a = k * math.tau / 26 + rnd.uniform(-0.05, 0.05)
    r = rnd.uniform(1.0, 1.18)
    s_ = rnd.uniform(0.14, 0.26)
    sphere((r * 0.66 * math.cos(a) * 1.0, r * 1.05 * math.sin(a), 0.03), s_, rockm, scale=(1, 1, 0.6), seg=10, rings=6)
for x in fx:
    for y in (-0.9, 0.9):
        for k in range(4):
            torus((x, y, Z0 + 0.15 + k * 0.22), 0.05, 0.004, marble_d)
for x in (-0.5, 0.5):
    for y in sy[1:-1]:
        for k in range(2):
            torus((x, y, Z0 + 0.25 + k * 0.4), 0.05, 0.004, marble_d)
for i in range(7):  # postavy ve štítu (sloupkovité sochy s hlavou)
    x = -0.34 + i * 0.113
    h_ = 0.14 if i in (2, 3, 4) else 0.09
    cone((x, -1.02, Z0 + COL_H + 0.23 + h_ / 2), 0.03, 0.012, h_, marble_d, verts=8)
    sphere((x, -1.02, Z0 + COL_H + 0.25 + h_), 0.018, marble_d, seg=8, rings=6)
for (x, y) in ((-0.95, -1.1), (0.95, -1.15), (0.9, 0.9)):
    tree(x, y, 1.1, kind="round", leaf="#7a9a5a")     # olivovníky
cone((-0.7, 1.1, 0.35), 0.06, 0.0, 0.62, material("cyp", "#2f6a46", roughness=0.7), verts=10)
cone((0.65, 1.12, 0.35), 0.06, 0.0, 0.62, material("cyp2", "#2f6a46", roughness=0.7), verts=10)
# Athénina sova na soklu před chrámem
cyl((0.9, -1.15, 0.15), 0.07, 0.3, marble, verts=12)
owl = sphere((0.9, -1.15, 0.38), 0.06, material("owl", "#b8a07a", roughness=0.6), scale=(0.9, 0.7, 1.3), seg=12, rings=8)
sphere((0.88, -1.2, 0.42), 0.018, material("eye", "#ffffff"), seg=8, rings=6)
sphere((0.92, -1.2, 0.42), 0.018, material("eye2", "#ffffff"), seg=8, rings=6)
cobbles(1.1, 40, material("cob", "#c8d4c8", roughness=0.9), z=0.052)
lampm = [glow("lamp%d" % i, "#ffe2a0", 3.0) for i in range(2)]
for i, (x, y) in enumerate(((-0.75, -1.15), (0.45, -1.2))):
    lamp_post(x, y, lampm[i])


@anim
def _atheny_more(t):
    for i, m in enumerate(lampm):
        set_glow(m, 3.0 + 1.2 * math.sin(2 * t * math.tau + i * 2.0))

# zářící značky: plus, rovná se, krát, pí, kružnice, trojúhelník
SYM = []
cols = ["#7ee0b0", "#ffd24d", "#ff9ec7", "#8fd0ff", "#c9b8ff", "#ff8a6b"]


def symbol(kind, mat):
    root = bpy.data.objects.new("sym", None)
    bpy.context.scene.collection.objects.link(root)
    P = []
    if kind == "plus":
        P += [box((0, 0, 0), (0.2, 0.05, 0.05), mat, bevel=0.01), box((0, 0, 0), (0.05, 0.05, 0.2), mat, bevel=0.01)]
    elif kind == "equals":
        P += [box((0, 0, 0.05), (0.22, 0.05, 0.05), mat, bevel=0.01), box((0, 0, -0.05), (0.22, 0.05, 0.05), mat, bevel=0.01)]
    elif kind == "times":
        P += [box((0, 0, 0), (0.24, 0.05, 0.05), mat, rot=(0, math.radians(45), 0), bevel=0.01), box((0, 0, 0), (0.24, 0.05, 0.05), mat, rot=(0, math.radians(-45), 0), bevel=0.01)]
    elif kind == "pi":
        P += [box((0, 0, 0.1), (0.26, 0.05, 0.05), mat, bevel=0.01), box((-0.07, 0, -0.01), (0.05, 0.05, 0.2), mat, bevel=0.01), box((0.07, 0, -0.01), (0.05, 0.05, 0.2), mat, bevel=0.01)]
    elif kind == "circle":
        P += [torus((0, 0, 0), 0.12, 0.025, mat, rot=(math.radians(90), 0, 0))]
    else:
        for a in (0, 120, 240):
            ar = math.radians(a + 90)
            P.append(bar((0.13 * math.cos(ar), 0, 0.13 * math.sin(ar)), (0.13 * math.cos(ar + math.tau / 3), 0, 0.13 * math.sin(ar + math.tau / 3)), 0.025, mat))
    for o in P:
        loc = o.location.copy()
        o.parent = root
        o.location = loc
    return root


for i, k in enumerate(("plus", "equals", "times", "pi", "circle", "triangle")):
    SYM.append((symbol(k, glow("g%d" % i, cols[i], 0.9)), i))


def update(t):
    ph = t * math.tau
    for root, i in SYM:
        a = ph + i * math.tau / 6
        root.location = (1.45 * math.cos(a), 1.05 * math.sin(a), 1.75 + 0.2 * math.sin(2 * a + i))
        root.rotation_euler = (0.4 * math.sin(ph + i), 0, ph * 2 + i)
        s = 1.7 + 0.15 * math.sin(2 * ph + i)
        root.scale = (s, s, s)


run(update, "znacka_matematika")
