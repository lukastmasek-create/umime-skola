"""Nepál / zeměpis: Mount Everest. Vítr odfukuje sníh z vrcholu, vlají vlajky, modlitební praporky na lanku."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_zemepis", world=("#cfe6ff", 0.7), ortho=5.0, target_z=1.55)
plinth("#d8e8ef", "#ffffff")

# výšková mapa: hlavní štít (Everest), Lhotse, Nuptse a skalní hřebeny
N = 130
SIZE = 2.5


def peak(x, y, cx, cy, h, w, sharp):
    d = math.hypot(x - cx, y - cy) / w
    return h * math.exp(-(d ** sharp))


def ridge(x, y):
    return 0.5 * math.sin(x * 9.0 + 1.3) * math.sin(y * 7.5) + 0.3 * math.sin(x * 17 - y * 11) + 0.18 * math.sin(x * 29 + y * 23)


def height(x, y):
    r = math.hypot(x, y)
    h = peak(x, y, 0.05, 0.0, 2.45, 0.55, 1.15) + peak(x, y, 0.62, 0.3, 1.7, 0.4, 1.3) + peak(x, y, -0.55, 0.35, 1.45, 0.42, 1.3)
    h += peak(x, y, 0.1, -0.5, 0.7, 0.6, 1.6) + 0.3 * ridge(x, y) * (0.25 + h / 2.0)
    mask = max(0.0, min(1.0, (1.18 - r) / 0.45))
    mask = mask * mask * (3 - 2 * mask)
    return max(0.0, h) * mask


verts, cols_v = [], []
H = [[height((i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE) for i in range(N + 1)] for j in range(N + 1)]
for j in range(N + 1):
    for i in range(N + 1):
        x, y, z = (i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE, H[j][i]
        verts.append((x, y, z + 0.02))
        # sklon z rozdílu sousedních výšek
        dx = (H[j][min(N, i + 1)] - H[j][max(0, i - 1)]) / (2 * SIZE / N)
        dy = (H[min(N, j + 1)][i] - H[max(0, j - 1)][i]) / (2 * SIZE / N)
        slope = math.hypot(dx, dy)
        snow_line = 0.95 + 0.25 * math.sin(x * 6 + y * 5)
        snow = max(0.0, min(1.0, (z - snow_line) / 0.2)) * max(0.0, min(1.0, 2.4 - slope * 0.9))
        ice = max(0.0, min(1.0, (z - 0.55) / 0.3)) * max(0.0, min(1.0, 1.3 - slope * 1.2)) * (1 - snow)
        rock = (0.30, 0.26, 0.27) if slope > 0.8 else (0.50, 0.41, 0.34)
        rock = tuple(rock[k] * (1 - 0.7 * ice) + (0.62, 0.8, 0.9)[k] * 0.7 * ice for k in range(3))
        green = max(0.0, min(1.0, (0.55 - z) / 0.35))
        c = [rock[k] * (1 - green) + (0.38, 0.6, 0.32)[k] * green for k in range(3)]
        c = [c[k] * (1 - snow) + (0.97, 0.98, 1.0)[k] * snow for k in range(3)]
        cols_v.append((c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2, 1.0))
def inside(i, j):
    return math.hypot((i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE) <= 1.2


faces = [(j * (N + 1) + i, j * (N + 1) + i + 1, (j + 1) * (N + 1) + i + 1, (j + 1) * (N + 1) + i) for j in range(N) for i in range(N)
         if inside(i, j) and inside(i + 1, j) and inside(i, j + 1) and inside(i + 1, j + 1)]
me = bpy.data.meshes.new("hora")
me.from_pydata(verts, [], faces)
me.update()
attr = me.color_attributes.new("col", "FLOAT_COLOR", "POINT")
for k, c in enumerate(cols_v):
    attr.data[k].color = c
mat = bpy.data.materials.new("hora_m")
mat.use_nodes = True
nt = mat.node_tree
b = nt.nodes["Principled BSDF"]
va = nt.nodes.new("ShaderNodeVertexColor")
va.layer_name = "col"
nt.links.new(va.outputs["Color"], b.inputs["Base Color"])
b.inputs["Roughness"].default_value = 0.85
me.materials.append(mat)
for p in me.polygons:
    p.use_smooth = True
mountain = bpy.data.objects.new("hora", me)
sc.collection.objects.link(mountain)

summit = max(((H[j][i], (i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE) for j in range(N + 1) for i in range(N + 1)))
sz, sx0, sy0 = summit[0], summit[1], summit[2]

snow_m = material("snowm", "#ffffff", roughness=0.9)
pole((sx0, sy0, sz), (sx0, sy0, sz + 0.34), r=0.012)
red = material("red", "#dc143c", roughness=0.5)
blue = material("blue", "#003893", roughness=0.5)
flag = Flag((sx0 + 0.01, sy0, sz + 0.32), 0.26, 0.2, [red, blue], lambda u, v: 0 if u < 0.85 - 0.5 * abs(v - 0.5) else 1, cols=14, rows=8, amp=0.06, waves=1.5, droop=0.01)

# stany základního tábora
tent_cols = ["#ff7a3c", "#ffd24d", "#3b9bff"]
for i, (tx, ty) in enumerate(((-0.5, -0.78), (-0.25, -0.88), (0.0, -0.8))):
    cone((tx, ty, 0.1), 0.1, 0.0, 0.2, material("tent%d" % i, tent_cols[i], roughness=0.6), verts=4, rot=(0, 0, math.radians(45)))

# modlitební praporky na lanku mezi dvěma tyčemi
P1, P2 = Vector((-0.95, -0.55, 0.0)), Vector((0.75, -0.95, 0.0))
pole((P1.x, P1.y, 0.0), (P1.x, P1.y, 0.55), r=0.012, ball=False)
pole((P2.x, P2.y, 0.0), (P2.x, P2.y, 0.5), r=0.012, ball=False)
pray_cols = ["#3b9bff", "#ffffff", "#ff4d4d", "#4ccf6a", "#ffd24d"]
pray = []
for i in range(11):
    u = (i + 0.5) / 11
    p = P1 + (P2 - P1) * u
    z = 0.55 + (0.5 - 0.55) * u - 0.1 * math.sin(u * math.pi)
    m = bpy.data.objects.new("pf", None)
    sc.collection.objects.link(m)
    box((0, 0, 0), (0.09, 0.012, 0.09), material("pr%d" % i, pray_cols[i % 5], roughness=0.6), bevel=0)
    o = bpy.context.object
    o.location = (p.x, p.y, z - 0.05)
    pray.append((o, i, p, z))
bar((P1.x, P1.y, 0.55), (P2.x, P2.y, 0.5), 0.004, material("rope", "#6b4a2d"), verts=4) if False else None


# --- detaily: stúpa se zlatým hrotem, jaci, kameny, oblačné věnce, horolezci ---
wht = material("stupa", "#f5f1e6", roughness=0.7)
gld = material("gld", "#ffc933", roughness=0.3, metallic=0.8)
sx_, sy_ = 0.45, -0.85
cyl((sx_, sy_, 0.07), 0.12, 0.08, wht, verts=16)
sphere((sx_, sy_, 0.16), 0.1, wht, scale=(1, 1, 0.9), seg=16, rings=10)
box((sx_, sy_, 0.26), (0.07, 0.07, 0.06), gld, bevel=0.005)
cone((sx_, sy_, 0.36), 0.045, 0.0, 0.16, gld, verts=12)
for k in range(5):
    torus((sx_, sy_, 0.3 + k * 0.01), 0.04 - 0.005 * k, 0.004, gld)
yak_m = material("yak", "#3a2a22", roughness=0.9)
for k, (yx, yy, rot) in enumerate(((-0.1, -0.95, 0.3), (0.15, -1.0, -0.2))):
    root = bpy.data.objects.new("yak", None)
    sc.collection.objects.link(root)
    parts = [sphere((0, 0, 0.1), 0.08, yak_m, scale=(1.4, 0.8, 0.8)), sphere((-0.12, 0, 0.12), 0.05, yak_m, seg=10, rings=8)]
    for lx in (-0.07, 0.07):
        for ly in (-0.04, 0.04):
            parts.append(bar((lx, ly, 0.07), (lx, ly, 0.0), 0.012, yak_m, verts=6))
    for o in parts:
        loc = o.location.copy(); o.parent = root; o.location = loc
    root.location = (yx, yy, 0.0)
    root.rotation_euler = (0, 0, rot)
rnd = random.Random(2)
for _ in range(14):  # kameny
    a = rnd.uniform(0, math.tau); r = rnd.uniform(0.75, 1.1)
    sphere((r * math.cos(a), r * math.sin(a), 0.06), rnd.uniform(0.03, 0.07), material("kam", "#7a6f66", roughness=0.9), scale=(1, 1, 0.7), seg=8, rings=6)
def puff(i):
    root = bpy.data.objects.new("puff", None)
    sc.collection.objects.link(root)
    m = material("cl%d" % i, "#ffffff", roughness=1.0)
    for dx, dz, r in ((0, 0, 0.11), (0.1, -0.01, 0.08), (-0.1, -0.01, 0.075), (0.04, 0.05, 0.07)):
        o = sphere((dx, 0, dz), r, m, scale=(1.2, 1.0, 0.85), seg=12, rings=8)
        o.parent = root
        o.location = (dx, 0, dz)
    return root


clouds = [(puff(i), i) for i in range(5)]
climbers = []
for k, c in enumerate(("#ff4d4d", "#ffd24d", "#3b9bff")):
    climbers.append((sphere((0, 0, 0), 0.025, material("cli%d" % k, c, roughness=0.6), seg=8, rings=6), k))
heli_pos = None


@anim
def _everest_more(t):
    ph = t * math.tau
    for c, i in clouds:
        a = ph + i * math.tau / 5
        r = 0.95 + 0.06 * math.sin(2 * ph + i)
        c.location = (r * math.cos(a), r * math.sin(a), 1.15 + 0.35 * math.sin(i * 2.1) + 0.04 * math.sin(3 * ph + i))
        c.rotation_euler = (0, 0, a)
    for cl, k in climbers:
        u = 0.5 + 0.5 * math.sin(ph + k * 1.1)
        # trasa k vrcholu: od základního tábora po hřebeni
        x = -0.5 + u * (sx0 + 0.5) * 0.85
        y = -0.78 + u * (sy0 + 0.78) * 0.85
        cl.location = (x, y, height(x, y) + 0.05)

# sněhová vichřice: oblak sněhu odfukovaný z vrcholu
rnd = random.Random(7)
plume = []
for i in range(16):
    plume.append((sphere((0, 0, 0), rnd.uniform(0.05, 0.1), snow_m, scale=(1.5, 1, 0.8), seg=10, rings=8), rnd.uniform(0, 1), rnd.uniform(-0.05, 0.05)))


def update(t):
    ph = t * math.tau
    flag.update(t)
    for o, i, p, z in pray:
        o.location = (p.x, p.y, z - 0.05 + 0.012 * math.sin(ph * 2 + i * 0.7))
        o.rotation_euler = (0.25 * math.sin(ph * 2 + i * 0.7), 0.3 * math.sin(ph * 2 + i), 0)
    for s, off, jy in plume:
        k = (off + t) % 1.0
        grow = math.sin(k * math.pi) ** 0.7
        s.location = (sx0 + 0.15 + k * 1.1, sy0 + jy * 2 + 0.1 * math.sin(ph + off * 6), sz - 0.05 + k * 0.25)
        sc_ = 0.15 + 1.0 * grow
        s.scale = (1.6 * sc_, sc_, 0.8 * sc_)


run(update, "znacka_zemepis")
