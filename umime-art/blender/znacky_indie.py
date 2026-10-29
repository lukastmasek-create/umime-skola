"""Indie (Dillí) / občanská výchova: kruhový parlament se sloupořadím, vlající vlajky, volební urna,
do které padají hlasovací lístky, a váhy spravedlnosti. Nad budovou krouží holubice."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_obcanka", world=("#fbe3c7", 0.65), ortho=3.9, target_z=1.05)
plinth("#8ccf6a", "#fff1d6")

sand = stone_material("sand", "#e9cf9a", scale=30, strength=0.25)
sand_d = stone_material("sand_d", "#cfae72", scale=30, strength=0.25)
rose = stone_material("rose", "#d9825f", scale=30, strength=0.25)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
dark = material("dark", "#2c2540", roughness=0.8)
saff = material("saff", "#ff9933", roughness=0.5)
white = material("white", "#ffffff", roughness=0.5)
green = material("green", "#138808", roughness=0.5)
blue = material("blue", "#1d3f9e", roughness=0.4)
paper = material("paper", "#fff7e0", roughness=0.8)
box_m = material("urna", "#3b7be0", roughness=0.35)
steel = material("steel", "#c9ced8", roughness=0.25, metallic=0.9)

# --- kruhový parlament: tři patra sloupoří, nízká kopule uprostřed ---
CX, CY = 0.0, 0.45
cyl((CX, CY, 0.12), 1.0, 0.18, sand_d, verts=48)
cyl((CX, CY, 0.58), 0.78, 0.74, sand, verts=48)
cyl((CX, CY, 0.96), 0.86, 0.06, sand_d, verts=48)  # římsa
N = 28
for i in range(N):
    a = i * math.tau / N
    x, y = CX + 0.86 * math.cos(a), CY + 0.86 * math.sin(a)
    cyl((x, y, 0.58), 0.035, 0.76, white, verts=10)
    # druhé patro menšího průměru
for i in range(N):
    a = i * math.tau / N + math.tau / (2 * N)
    x, y = CX + 0.6 * math.cos(a), CY + 0.6 * math.sin(a)
    cyl((x, y, 1.18), 0.03, 0.38, white, verts=10)
cyl((CX, CY, 1.0 + 0.02), 0.66, 0.04, sand_d, verts=48)
cyl((CX, CY, 1.2), 0.5, 0.36, sand, verts=48)
cyl((CX, CY, 1.4), 0.66, 0.05, sand_d, verts=48)
sphere((CX, CY, 1.42), 0.42, rose, scale=(1, 1, 0.62), seg=40, rings=20)
cone((CX, CY, 1.82), 0.07, 0.0, 0.2, gold, verts=12)
# vstup s předsíní
box((CX, CY - 0.88, 0.3), (0.62, 0.3, 0.42), sand, bevel=0.01)
box((CX, CY - 1.04, 0.25), (0.26, 0.02, 0.3), dark, bevel=0)
for dx in (-0.25, 0.25):
    cyl((CX + dx, CY - 1.02, 0.3), 0.03, 0.5, white, verts=10)
# čtyři malé chhatri (věžičky se zlatou kopulkou)
for k in range(4):
    a = math.radians(45 + 90 * k)
    x, y = CX + 0.98 * math.cos(a), CY + 0.98 * math.sin(a)
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        cyl((x + sx * 0.04, y + sy * 0.04, 1.06), 0.012, 0.18, white, verts=6)
    sphere((x, y, 1.19), 0.07, gold, scale=(1, 1, 0.8), seg=14, rings=8)

# --- vlajky ---
flags = []
flag_m = [saff, white, green]
for (fx, fy, fz) in ((CX - 0.9, CY - 0.55, 1.05), (CX + 0.9, CY - 0.55, 1.05)):
    pole((fx, fy, 0.05), (fx, fy, fz + 0.9), r=0.014, ball=True)
    flags.append(Flag((fx + 0.01, fy, fz + 0.88), 0.46, 0.3, flag_m, lambda u, v: 0 if v < 0.333 else (1 if v < 0.667 else 2), cols=24, rows=12, amp=0.07, waves=1.5, droop=0.015))
# kolo (chakra) na střední bílé části (aproximováno modrým kroužkem u každé vlajky, pohybuje se s ní)
chakras = [torus((0, 0, 0), 0.035, 0.007, blue, rot=(math.pi / 2, 0, 0)) for _ in flags]

# --- volební urna s padajícími lístky ---
UX, UY = 1.0, -0.65
box((UX, UY, 0.3), (0.5, 0.5, 0.5), box_m, bevel=0.02)
box((UX, UY, 0.57), (0.36, 0.06, 0.03), dark, bevel=0)
box((UX, UY - 0.26, 0.3), (0.2, 0.02, 0.2), paper, bevel=0)
star = cone((UX, UY - 0.27, 0.3), 0.05, 0.05, 0.01, saff, verts=5, rot=(math.pi / 2, 0, 0))
ballots = [box((UX, UY, 0.9), (0.22, 0.015, 0.3), paper, bevel=0) for _ in range(3)]

# --- váhy spravedlnosti ---
WX, WY = -1.0, -0.6
cyl((WX, WY, 0.12), 0.16, 0.12, sand_d, verts=20)
bar((WX, WY, 0.15), (WX, WY, 0.88), 0.02, gold, verts=10)
beam = bpy.data.objects.new("beam", None)
bpy.context.scene.collection.objects.link(beam)
beam.location = (WX, WY, 0.88)
bar((-0.33, 0, 0), (0.33, 0, 0), 0.016, gold, verts=10).parent = beam
pans = []
for sx in (-1, 1):
    p = bpy.data.objects.new("pan", None)
    bpy.context.scene.collection.objects.link(p)
    p.parent = beam
    p.location = (sx * 0.33, 0, 0)
    for dx in (-0.1, 0.1):
        bar((0, 0, 0), (dx, 0, -0.22), 0.004, gold, verts=4).parent = p
    cyl((0, 0, -0.24), 0.12, 0.025, gold, verts=20).parent = p
    pans.append((p, sx))

# --- stromy, keře, holubice ---
rnd = random.Random(11)
for (x, y) in ((-1.05, 0.25), (1.1, 0.55), (-0.5, 1.25), (0.6, 1.2)):
    tree(x, y, 0.95, kind="round", leaf="#2f9e55")
for k in range(10):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(1.0, 1.15)
    bush(r * math.cos(a), r * math.sin(a), rnd.uniform(0.7, 1.0))
doves = [Bird(material("dv%d" % i, "#ffffff", roughness=0.6), material("dvw%d" % i, "#eef0ff", roughness=0.6), s=0.65) for i in range(3)]


@anim
def _indie_more(t):
    ph = t * math.tau
    # lístky padají do urny: každý jiná fáze, na konci se schovají do štěrbiny
    for i, b in enumerate(ballots):
        u = (t * 2 + i / 3) % 1.0
        b.location = (UX, UY, 1.05 - u * 0.5)
        b.rotation_euler = (0.2 * math.sin(ph * 2 + i), 0, 0.3 * math.sin(ph * 2 + i * 1.7))
        b.hide_render = u > 0.9
    # váhy se pomalu kývou
    tilt = 0.12 * math.sin(ph)
    beam.rotation_euler = (0, tilt, 0)
    for p, sx in pans:
        p.rotation_euler = (0, -tilt, 0)
    for f, c in zip(flags, chakras):
        c.location = (f.origin.x + f.w * 0.46, f.origin.y + f.amp * 0.6 * math.sin(0.46 * f.waves * math.tau - ph), f.origin.z - f.h * 0.5)
    star.rotation_euler = (math.pi / 2, 0, ph)
    for i, d in enumerate(doves):
        a = ph + i * math.tau / 3
        d.place((CX + 0.95 * math.cos(a), CY + 0.8 * math.sin(a), 2.0 + 0.1 * math.sin(2 * a + i)), a + math.pi / 2, 0.7 * math.sin(ph * 4 + i * 1.4))


def update(t):
    for f in flags:
        f.update(t)


run(update, "znacka_obcanka")
