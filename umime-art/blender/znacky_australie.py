"""Austrálie (Sydney) / hudební výchova: operní dům s bílými plachtami u přístavu. Plachty hrají barvami,
nad přístavem plavou noty, houpe se plachetnice a poskakuje vodní hladina."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_hudebka", world=("#cfe9ff", 0.7), ortho=4.0, target_z=0.95)

water = material("water", "#2f9fd8", roughness=0.15)
water_l = material("water_l", "#7fd6f5", roughness=0.2)
shell = material("shell", "#fff8ec", roughness=0.28)
shell_d = material("shell_d", "#e9dcc4", roughness=0.35)
base_m = stone_material("obase", "#d9b98a", scale=26, strength=0.2)
glass = glow("glassw", "#3fb2f0", 0.5)
dark = material("dark", "#2c2540", roughness=0.8)
hull = material("hull", "#c9302c", roughness=0.4)
sail_m = material("sailm", "#ffffff", roughness=0.7)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)

# podstavec: moře s pobřežním chodníkem
cyl((0, 0, -0.14), 1.32, 0.22, material("pl_ring", "#ffffff", roughness=0.5), verts=64)
cyl((0, 0, -0.02), 1.25, 0.12, water, verts=64)
cyl((0, 0.15, 0.02), 1.0, 0.1, base_m, verts=64).scale = (1.0, 0.75, 1)  # nábřeží
waves = []
for i in range(7):
    a = i * math.tau / 7
    waves.append(torus((1.0 * math.cos(a), 1.0 * math.sin(a) * 0.9 - 0.35, 0.05), 0.12, 0.012, water_l))


def sail(cx, cy, w, d, h, yaw, lean, mat, theta=34):
    """Plachta opery: „měsíček“ koule (kus od pólu k rovníku mezi dvěma poledníky) je zakřivený trojúhelník
    s hrotem nahoře. w = šířka paty, d = hloubka, h = výška; yaw otočí plachtu, lean ji nakloní dozadu."""
    me = bpy.data.meshes.new("sail")
    N, M = 14, 10
    verts, faces = [], []
    for i in range(N + 1):
        lat = (i / N) * (math.pi / 2)  # od rovníku (0) k pólu (π/2)
        for j in range(M + 1):
            lon = math.radians(-theta + 2 * theta * j / M)
            verts.append((math.cos(lat) * math.cos(lon) * d, math.cos(lat) * math.sin(lon) * w, math.sin(lat) * h))
    for i in range(N):
        for j in range(M):
            a = i * (M + 1) + j
            faces.append((a, a + 1, a + M + 2, a + M + 1))
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new("sail", me)
    bpy.context.scene.collection.objects.link(o)
    o.location = (cx, cy, 0.12)
    o.rotation_euler = (0, math.radians(-lean), math.radians(yaw))
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    m = o.modifiers.new("solid", "SOLIDIFY")
    m.thickness = 0.025
    return o


sails = []
# velká sada: tři plachty za sebou, každá menší; malá sada vpravo vpředu
for k, (dx, w, d, h) in enumerate(((-0.62, 0.7, 0.55, 1.0), (-0.12, 0.62, 0.5, 0.88), (0.36, 0.52, 0.44, 0.72))):
    sails.append(sail(dx, 0.3, w, d, h, 0, 8, shell if k % 2 == 0 else shell_d))
    sails.append(sail(dx + 0.12, 0.3, w * 0.85, d * 0.7, h * 0.78, 180, 8, shell_d if k % 2 == 0 else shell))
for k, (dx, w, d, h) in enumerate(((0.55, 0.42, 0.34, 0.6), (0.9, 0.34, 0.3, 0.46))):
    sails.append(sail(dx, -0.25, w, d, h, 0, 8, shell if k % 2 == 0 else shell_d))
box((-0.1, 0.3, 0.09), (1.7, 0.8, 0.12), base_m, bevel=0.02)
box((0.7, -0.25, 0.09), (1.0, 0.6, 0.1), base_m, bevel=0.02)
# skleněná fasáda
fac = box((-0.1, -0.12, 0.26), (1.5, 0.03, 0.3), glass, bevel=0)

# schodiště před operou
for k in range(5):
    box((-0.1, -0.2 - k * 0.05, 0.09 - k * 0.012), (1.2 - k * 0.04, 0.05, 0.03), base_m, bevel=0.003)

# plachetnice na vodě
SBX, SBY = 0.7, -0.78
boat = bpy.data.objects.new("boat", None)
bpy.context.scene.collection.objects.link(boat)
boat.location = (SBX, SBY, 0.07)
h_ = box((0, 0, 0.05), (0.3, 0.1, 0.08), hull, bevel=0.01)
h_.parent = boat
mast = bar((0, 0, 0.05), (0, 0, 0.5), 0.008, material("mast", "#6b4a2d", roughness=0.7), verts=6)
mast.parent = boat
sl = cone((0.0, 0.0, 0.3), 0.18, 0.0, 0.4, sail_m, verts=3, rot=(math.pi / 2, 0, math.pi / 2))
sl.parent = boat

# noty: hlavička + nožička + praporek, každá jiné barvy
notes = []
note_cols = ["#ff6f91", "#ffc933", "#7fd6f5", "#b6e36a", "#c9b8ff"]
for i in range(5):
    m = material("nt%d" % i, note_cols[i], roughness=0.35)
    root = bpy.data.objects.new("note", None)
    bpy.context.scene.collection.objects.link(root)
    head = sphere((0, 0, 0), 0.07, m, scale=(1.25, 0.8, 0.9), seg=14, rings=8)
    head.parent = root
    stem = bar((0.075, 0, 0), (0.075, 0, 0.3), 0.012, m, verts=8)
    stem.parent = root
    flag = box((0.12, 0, 0.27), (0.08, 0.012, 0.1), m, rot=(0, math.radians(-28), 0), bevel=0)
    flag.parent = root
    if i % 2:
        f2 = box((0.12, 0, 0.2), (0.08, 0.012, 0.08), m, rot=(0, math.radians(-28), 0), bevel=0)
        f2.parent = root
    notes.append(root)
sail_glow = [glow("sg%d" % i, c, 0.0) for i, c in enumerate(("#ff6f91", "#ffc933", "#7fd6f5"))]


@anim
def _aus_more(t):
    ph = t * math.tau
    for i, n in enumerate(notes):
        a = ph + i * math.tau / 5
        n.location = (-0.15 + 1.0 * math.cos(a), 0.15 + 0.55 * math.sin(a), 1.4 + 0.25 * math.sin(2 * a + i) + 0.15 * math.sin(ph * 3 + i))
        n.rotation_euler = (0, 0.25 * math.sin(2 * ph + i), 0.3 * math.sin(ph * 2 + i * 0.9))
        s = 0.9 + 0.12 * math.sin(3 * ph + i)
        n.scale = (s, s, s)
    boat.location = (SBX + 0.18 * math.sin(ph), SBY + 0.05 * math.sin(2 * ph), 0.07 + 0.015 * math.sin(3 * ph))
    boat.rotation_euler = (0.06 * math.sin(2 * ph), 0.05 * math.sin(3 * ph), 0.2 * math.sin(ph) * 0.2)
    for i, w in enumerate(waves):
        u = (t * 2 + i / 7) % 1.0
        k = 0.7 + 0.5 * u
        w.scale = (k, k * 0.7, k)
        w.location.z = 0.05
    for i, s in enumerate(sails):
        pass


def update(t):
    pass


run(update, "znacka_hudebka")
