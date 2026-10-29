"""Irsko (Dublin) / literatura: kulatá věž, keltský kříž, obří otevřená kniha s listujícími stránkami.
Kolem krouží létající knížky, přes okno věže probleskuje světlo a zelené kopce se kolébají v trávě."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_literatura", world=("#d9efe0", 0.65), ortho=3.9, target_z=1.1)
plinth("#5fc46a", "#f1ffe9")

stone = stone_material("stone", "#b8b3a6", scale=34, strength=0.28)
stone_d = stone_material("stone_d", "#8f8a7e", scale=34, strength=0.28)
slate = material("slate", "#4a5560", roughness=0.7)
thatch = material("thatch", "#d9b45b", roughness=0.95)
wall = material("wall", "#f4efe2", roughness=0.8)
wood = material("wood", "#7a4f2c", roughness=0.7)
paper = material("paper", "#fff7e0", roughness=0.8)
cover = material("cover", "#1f7a46", roughness=0.5)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
win = glow("win", "#ffd98a", 3.0)
dark = material("dark", "#2c2540", roughness=0.8)
clover = material("clover", "#2fae55", roughness=0.55)

# --- kulatá věž (zúžená, s kuželovou stříškou, vstupem ve výšce a okénky) ---
TX, TY = -0.45, 0.5
for i, (r, h) in enumerate(((0.4, 0.42), (0.37, 0.42), (0.34, 0.42), (0.31, 0.42))):
    cyl((TX, TY, 0.1 + h * i + h / 2), r, h, stone if i % 2 == 0 else stone_d, verts=28)
cone((TX, TY, 2.1), 0.32, 0.0, 0.7, slate, verts=28)
cyl((TX, TY, 1.78), 0.34, 0.05, stone_d, verts=28)
box((TX + 0.02, TY - 0.36, 0.55), (0.14, 0.06, 0.24), dark)  # vstup vysoko nad zemí
tower_win = []
for k in range(4):
    a = k * math.pi / 2 + math.radians(-60)
    tower_win.append(box((TX + 0.3 * math.cos(a), TY + 0.3 * math.sin(a), 1.5), (0.07, 0.07, 0.17), win, rot=(0, 0, a)))
bar((TX, TY, 2.4), (TX, TY, 2.62), 0.012, gold, verts=8)
bar((TX - 0.05, TY, 2.54), (TX + 0.05, TY, 2.54), 0.01, gold, verts=8)

# --- keltský kříž s kruhem ---
cx, cy = -1.0, -0.15
box((cx, cy, 0.4), (0.14, 0.1, 0.8), stone_d, bevel=0.01)
box((cx, cy, 0.58), (0.5, 0.1, 0.12), stone_d, bevel=0.01)
torus((cx, cy, 0.58), 0.19, 0.035, stone, rot=(math.pi / 2, 0, 0))
box((cx, cy, 0.05), (0.3, 0.22, 0.1), stone_d, bevel=0.01)

# --- chaloupka se slaměnou střechou ---
HX, HY = 0.65, 0.3
box((HX, HY, 0.25), (0.8, 0.5, 0.46), wall, bevel=0.01)
prism(HX - 0.46, HX + 0.46, HY - 0.3, HY + 0.3, 0.48, 0.9, thatch)
box((HX, HY - 0.255, 0.18), (0.14, 0.02, 0.3), wood, bevel=0)
box((HX + 0.28, HY - 0.255, 0.28), (0.12, 0.02, 0.12), win, bevel=0)
box((HX - 0.28, HY - 0.255, 0.28), (0.12, 0.02, 0.12), win, bevel=0)
box((HX + 0.2, HY + 0.05, 0.92), (0.1, 0.1, 0.28), stone_d)  # komín

# --- obří otevřená kniha s listujícími stránkami ---
BX, BY, BZ = 0.0, -0.78, 0.1
SC = 1.25
box((BX, BY, BZ), (1.0 * SC, 0.62 * SC, 0.06), cover, rot=(0, 0, math.radians(-8)), bevel=0.015)
box((BX - 0.24 * SC, BY, BZ + 0.06), (0.46 * SC, 0.54 * SC, 0.05), paper, rot=(0, math.radians(-6), math.radians(-8)), bevel=0.006)
box((BX + 0.24 * SC, BY, BZ + 0.06), (0.46 * SC, 0.54 * SC, 0.05), paper, rot=(0, math.radians(6), math.radians(-8)), bevel=0.006)
leaf_piv = bpy.data.objects.new("leaf_piv", None)
bpy.context.scene.collection.objects.link(leaf_piv)
leaf_piv.location = (BX, BY, BZ + 0.1)
leaf_piv.rotation_euler = (0, 0, math.radians(-8))
leaf = box((0.22 * SC, 0, 0), (0.44 * SC, 0.52 * SC, 0.012), paper, bevel=0)
leaf.parent = leaf_piv
leaf.location = (0.22 * SC, 0, 0)
for k in range(3):  # řádky textu na pravé straně
    box((BX + 0.26 * SC, BY - 0.12 * SC + k * 0.12 * SC, BZ + 0.1), (0.3 * SC, 0.015, 0.004), dark, rot=(0, 0, math.radians(-8)), bevel=0)

# --- zeleně zdobená zeď, ovce a koniklece ---
rnd = random.Random(5)
for k in range(20):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(0.95, 1.1)
    bush(r * math.cos(a), r * math.sin(a) * 0.9, rnd.uniform(0.7, 1.1))
for (x, y) in ((1.05, -0.35), (-0.95, 0.45), (0.2, 0.9)):
    tree(x, y, 0.9 + 0.2 * rnd.random(), kind="round", leaf="#2f9e55")
for (x, y) in ((-0.95, -0.7), (0.95, -0.75)):
    sphere((x, y, 0.14), 0.1, material("sheep", "#fffaf0", roughness=0.9), scale=(1.25, 0.8, 0.85), seg=12, rings=8)
    sphere((x + 0.12, y, 0.15), 0.045, dark, seg=8, rings=6)
# trojlístky na podstavci
for k in range(5):
    a = k * math.tau / 5 + 0.4
    x, y = 1.05 * math.cos(a), 1.05 * math.sin(a)
    for j in range(3):
        sphere((x + 0.035 * math.cos(j * 2.1), y + 0.035 * math.sin(j * 2.1), 0.1), 0.03, clover, scale=(1, 1, 0.5), seg=8, rings=6)

# --- létající knížky v oběžné dráze ---
books = []
bcols = ["#d6362b", "#3b7be0", "#ffc933", "#9b5de5"]
for i in range(4):
    m = material("bk%d" % i, bcols[i], roughness=0.5)
    b = box((0, 0, 0), (0.2, 0.14, 0.05), m, bevel=0.008)
    box((0, 0.0, 0.0), (0.19, 0.13, 0.04), paper, bevel=0).parent = b
    books.append(b)


@anim
def _irsko_more(t):
    ph = t * math.tau
    set_glow(win, 3.0 + 1.6 * math.sin(2 * ph))
    for k, b in enumerate(books):
        a = ph + k * math.tau / 4
        b.location = (1.15 * math.cos(a), 0.95 * math.sin(a), 1.2 + 0.12 * math.sin(2 * a + k))
        b.rotation_euler = (0.25 * math.sin(2 * ph + k), 0.25 * math.cos(2 * ph + k), a + math.pi / 2)
    # list se otáčí zleva doprava a zpátky: v t = 0 i t = 1 stejný stav
    ang = math.pi * (0.5 - 0.5 * math.cos(ph))
    leaf_piv.rotation_euler = (0, -ang * 0.96 + math.radians(4), math.radians(-8))


def update(t):
    pass


run(update, "znacka_literatura")
