"""Německo / němčina: Braniborská brána. Vlají vlajky, čtyřspřeží se pohupuje, zlaté jiskry."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_nemcina", world=("#d0d8f2", 0.6), ortho=4.6, target_z=1.35)
plinth("#86cf78", "#fff2d6")

stone = stone_material("stone", "#dac9a0", scale=36, strength=0.18)
stone_d = stone_material("stone_d", "#bda877", scale=36, strength=0.2)
patina = material("patina", "#58a88f", roughness=0.4, metallic=0.5)
patina_d = material("patina_d", "#3d7f6c", roughness=0.4, metallic=0.5)
goldm = material("goldm", "#ffc933", roughness=0.25, metallic=0.9)
dark = material("dark", "#2b2640", roughness=0.8)

# stupně a podstavec
box((0, 0, 0.05), (2.5, 1.05, 0.1), stone_d)
box((0, 0, 0.14), (2.4, 0.95, 0.08), stone)
Z0 = 0.18
# 2 × 6 sloupů: čelní a zadní řada, mezi nimi průchody
COLS_X = [-0.95 + i * 0.38 for i in range(6)]
for y in (-0.38, 0.38):
    for x in COLS_X:
        box((x, y, Z0 + 0.04), (0.17, 0.17, 0.08), stone_d)
        cone((x, y, Z0 + 0.62), 0.075, 0.062, 1.08, stone, verts=20)
        box((x, y, Z0 + 1.2), (0.17, 0.17, 0.07), stone_d)
# podélné zdi mezi sloupy (jen dva krajní průchody vyplněné)
for x in (-1.15, 1.15):
    box((x, 0, Z0 + 0.62), (0.08, 0.8, 1.15), stone)
# kladí s triglyfy
box((0, 0, Z0 + 1.38), (2.45, 0.9, 0.18), stone)
for i in range(31):
    x = -1.12 + i * 0.075
    box((x, -0.455, Z0 + 1.4), (0.035, 0.02, 0.11), stone_d, bevel=0)
box((0, 0, Z0 + 1.5), (2.5, 0.95, 0.05), stone_d)
# atika s reliéfem
box((0, 0, Z0 + 1.76), (2.4, 0.7, 0.46), stone)
for i in range(7):
    box((-0.96 + i * 0.32, -0.355, Z0 + 1.76), (0.22, 0.02, 0.26), stone_d)
box((0, 0, Z0 + 2.02), (2.48, 0.78, 0.06), stone_d)

# kvadriga: vůz, vítězka a čtyři koně
chariot = bpy.data.objects.new("chariot", None)
bpy.context.scene.collection.objects.link(chariot)
Z1 = Z0 + 2.07
parts = [
    box((0, 0.12, Z1 + 0.14), (0.3, 0.26, 0.2), patina),
    box((0, 0.12, Z1 + 0.28), (0.34, 0.3, 0.03), patina_d),
    cone((0, 0.12, Z1 + 0.5), 0.1, 0.03, 0.34, patina, verts=14),
    sphere((0, 0.12, Z1 + 0.72), 0.058, patina),
    torus((0.0, 0.12, Z1 + 0.95), 0.1, 0.012, goldm, rot=(0, 0, 0)),
    bar((0, 0.12, Z1 + 0.5), (0, 0.12, Z1 + 1.0), 0.01, goldm),
    sphere((0, 0.12, Z1 + 1.05), 0.04, patina, scale=(1, 1, 0.8)),
]
for side in (-1, 1):
    parts.append(sphere((side * 0.13, 0.15, Z1 + 0.58), 0.08, patina_d, scale=(0.3, 0.8, 1.0)))
horses = []
for i, x in enumerate((-0.3, -0.1, 0.1, 0.3)):
    h = bpy.data.objects.new("horse", None)
    bpy.context.scene.collection.objects.link(h)
    hp = [
        sphere((0, 0, 0.18), 0.1, patina, scale=(0.75, 1.5, 0.95)),
        sphere((0, -0.2, 0.3), 0.06, patina, scale=(0.8, 1.0, 1.4)),
        sphere((0, -0.26, 0.4), 0.055, patina, scale=(0.75, 1.5, 0.9)),
        cone((0, -0.34, 0.37), 0.03, 0.02, 0.1, patina, verts=8, rot=(math.radians(90) - 0.5, 0, 0)),
    ]
    for lx, ly in ((-0.045, -0.1), (0.045, -0.1), (-0.045, 0.12), (0.045, 0.12)):
        hp.append(bar((lx, ly, 0.17), (lx * 1.1, ly - 0.02, 0.0), 0.022, patina, verts=8))
    for o in hp:
        loc = o.location.copy()
        o.parent = h
        o.location = loc
    h.location = (x, -0.12, Z1)
    horses.append((h, i))
    parts.append(h)
for o in parts:
    loc = o.location.copy()
    o.parent = chariot
    o.location = loc
# jiskry na atice
sparks_m = [glow("spark%d" % i, "#ffd24d", 0.0) for i in range(8)]
sparks = []
for i in range(8):
    a = i * math.tau / 8
    sparks.append(sphere((1.6 * math.cos(a), 0.9 * math.sin(a), Z1 + 0.4 + 0.2 * math.sin(a * 2)), 0.028, sparks_m[i], seg=8, rings=6))

# vlajky na rozích atiky
colors = [material("f_black", "#161616"), material("f_red", "#d7141a"), material("f_gold", "#ffcc00")]
flags = []
for sx in (-1, 1):
    x, y = sx * 1.1, -0.33
    pole((x, y, Z0 + 2.05), (x, y, Z0 + 2.75), r=0.014)
    flags.append(Flag((x + 0.012, y, Z0 + 2.72), 0.42, 0.27, colors, lambda u, v: 0 if v < 1 / 3 else (1 if v < 2 / 3 else 2), amp=0.09, waves=1.6, droop=0.02))
flags[1].origin = Vector((1.112, -0.33, Z0 + 2.72))

doves = [Bird(material("dv%d" % i, "#ffffff", roughness=0.6), material("dvw%d" % i, "#f3f3ff", roughness=0.6), s=0.65) for i in range(2)]


def update(t):
    ph = t * math.tau
    for f in flags:
        f.update(t)
    for h, i in horses:
        h.rotation_euler = (0.05 * math.sin(ph + i * 0.8), 0, 0)
        h.location.z = Z1 + 0.012 * math.sin(2 * ph + i)
    for i, m in enumerate(sparks_m):
        set_glow(m, 8 * max(0.0, math.sin(ph * 2 + i * 0.9)) ** 2)
    for i, d in enumerate(doves):
        a = ph + i * math.pi
        d.place((1.7 * math.cos(a), 0.7 * math.sin(a) + 0.1, 2.9 + 0.12 * math.sin(2 * a)), a + math.pi / 2 + 0.3, 0.7 * math.sin(ph * 4 + i))


run(update, "znacka_nemcina")
