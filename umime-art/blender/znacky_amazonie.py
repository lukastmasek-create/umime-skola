"""Brazílie / přírodopis: obří strom v Amazonii. Koruna se houpe, tukan a ara krouží, poletují motýli."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_prirodopis", world=("#d8f0d0", 0.65), ortho=4.5, target_z=1.4)
plinth("#5bbd5f", "#e8ffd8")

bark = stone_material("bark", "#7a5636", scale=18, strength=0.4, roughness=0.9)
greens = [material("leaf%d" % i, c, roughness=0.55) for i, c in enumerate(("#2f9e4f", "#3fbf5c", "#58cf63", "#7fd957", "#1f8546"))]
fern = material("fern", "#3fa752", roughness=0.6)
river = material("river", "#59c2e8", roughness=0.2)

# řeka přes podstavec
rv = cyl((0.2, -0.75, 0.04), 1.0, 0.03, river, verts=40)
rv.scale = (0.34, 0.9, 1)
rv.rotation_euler = (0, 0, math.radians(-38))

# kmen s opěrnými kořeny
cone((0, 0, 0.9), 0.3, 0.2, 1.8, bark, verts=18)
for k in range(6):
    a = k * math.tau / 6 + 0.3
    box((0.28 * math.cos(a), 0.28 * math.sin(a), 0.32), (0.5, 0.06, 0.62), bark, rot=(0, math.radians(-12), a), bevel=0.01)
# větve
for k in range(5):
    a = k * math.tau / 5 + 0.6
    bar((0, 0, 1.5), (0.55 * math.cos(a), 0.55 * math.sin(a), 2.0), 0.05, bark, verts=8)

# koruna: shluky koulí, které se houpou
crown = []
rnd = random.Random(21)
for i in range(22):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(0.1, 0.95)
    x, y = r * math.cos(a), r * math.sin(a)
    z = 2.0 + 0.45 * (1 - r) + rnd.uniform(-0.1, 0.25)
    rad = rnd.uniform(0.28, 0.46)
    crown.append((sphere((x, y, z), rad, greens[i % 5], scale=(1, 1, 0.78), seg=18, rings=12), (x, y, z), rnd.random() * math.tau))
# květy na koruně a lián
bloom_cols = ["#ff5fa2", "#ffd24d", "#ff8a3c", "#c77dff"]
for i in range(14):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(0.3, 1.0)
    sphere((r * math.cos(a), r * math.sin(a), 2.15 + 0.35 * (1 - r) + rnd.uniform(0, 0.3)), 0.045, material("bl%d" % i, bloom_cols[i % 4], roughness=0.5), seg=8, rings=6)
lianas = []
for i in range(7):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(0.35, 0.85)
    top = (r * math.cos(a), r * math.sin(a), 2.05)
    prev = top
    segs = []
    for k in range(1, 5):
        pt = (top[0] + 0.03 * math.sin(k + i), top[1] + 0.03 * math.cos(k), top[2] - 0.2 * k)
        segs.append(bar(prev, pt, 0.012, greens[4], verts=6))
        prev = pt
    lianas.append((segs, i))
# kapradiny a keře na zemi
for i in range(10):
    a = i * math.tau / 10 + 0.2
    r = rnd.uniform(0.75, 1.05)
    cone((r * math.cos(a), r * math.sin(a), 0.12), 0.13, 0.0, 0.28, fern, verts=7, rot=(0, 0, rnd.uniform(0, 3)))


# --- detaily: druhá vrstva koruny, orchideje, vodopád, lekníny, lenochod ---
crown2 = []
for i in range(26):
    a = rnd.uniform(0, math.tau)
    r = rnd.uniform(0.05, 1.05)
    x, y = r * math.cos(a), r * math.sin(a)
    z = 2.35 + 0.3 * (1 - r) + rnd.uniform(-0.1, 0.3)
    rad = rnd.uniform(0.13, 0.24)
    crown2.append((sphere((x, y, z), rad, greens[(i + 2) % 5], scale=(1, 1, 0.8), seg=14, rings=10), (x, y, z), rnd.random() * math.tau))
orch_cols = ["#ff5fa2", "#c77dff", "#ffd24d", "#ffffff"]
for i in range(10):  # orchideje a bromélie na kmeni a větvích
    a = rnd.uniform(0, math.tau)
    z = rnd.uniform(0.7, 1.7)
    x, y = 0.26 * math.cos(a) * (1 - z * 0.05), 0.26 * math.sin(a) * (1 - z * 0.05)
    for k in range(5):
        pa = k * math.tau / 5
        cone((x + 0.045 * math.cos(pa), y + 0.045 * math.sin(pa), z), 0.03, 0.0, 0.07, material("orc%d_%d" % (i, k), orch_cols[i % 4], roughness=0.5), verts=6, rot=(math.radians(60) * math.sin(pa), math.radians(60) * math.cos(pa), 0))
    sphere((x, y, z), 0.018, material("orcc", "#ffd24d"), seg=6, rings=4)
# vodopád po skalách vlevo vzadu
rock_m = stone_material("rockw", "#7a7468", scale=14, strength=0.4, roughness=0.9)
for (x, y, z, r) in ((-0.95, 0.6, 0.35, 0.3), (-0.8, 0.85, 0.55, 0.26), (-1.05, 0.35, 0.2, 0.22), (-0.7, 0.55, 0.15, 0.2)):
    sphere((x, y, z), r, rock_m, scale=(1, 1, 0.9), seg=12, rings=8)
water_f = bpy.data.materials.new("wf")
water_f.use_nodes = True
nt = water_f.node_tree
bsdf = nt.nodes["Principled BSDF"]
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
wv = nt.nodes.new("ShaderNodeTexWave")
wv.wave_type = "BANDS"
wv.bands_direction = "Z"
wv.inputs["Scale"].default_value = 1.5
wv.inputs["Distortion"].default_value = 2.0
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = hex_rgba("#3fa8e0")
ramp.color_ramp.elements[1].color = hex_rgba("#f2fbff")
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
nt.links.new(mp.outputs["Vector"], wv.inputs["Vector"])
nt.links.new(wv.outputs["Color"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
bsdf.inputs["Emission Strength"].default_value = 0.35
bsdf.inputs["Roughness"].default_value = 0.2
fall = box((-0.93, 0.3, 0.4), (0.22, 0.05, 0.62), water_f, rot=(0, 0, math.radians(-28)), bevel=0)
cyl((-0.8, 0.12, 0.06), 0.2, 0.02, river, verts=24)
for i, (x, y) in enumerate(((0.6, -0.95), (0.35, -0.75), (0.75, -0.7))):  # lekníny a žába
    cyl((x, y, 0.056), 0.07, 0.012, greens[i], verts=16)
frog = sphere((0.6, -0.95, 0.09), 0.03, material("frog", "#2fbf5f"), scale=(1, 1.2, 0.8), seg=8, rings=6)
# lenochod na větvi
sloth = bpy.data.objects.new("sloth", None)
sc.collection.objects.link(sloth)
parts = [sphere((0, 0, 0), 0.075, material("sl", "#8a6a4a", roughness=0.9), scale=(0.9, 0.9, 1.2), seg=12, rings=8),
         sphere((0, -0.01, 0.1), 0.045, material("sl2", "#e8d8b8", roughness=0.9), seg=10, rings=8)]
for ax in (-0.07, 0.07):
    parts.append(bar((ax, 0, 0.03), (ax * 1.5, 0, 0.17), 0.014, material("slp", "#6b4f35", roughness=0.9), verts=6))
for o in parts:
    loc = o.location.copy(); o.parent = sloth; o.location = loc
sloth.location = (0.38, 0.0, 1.62)


@anim
def _amazon_more(t):
    ph = t * math.tau
    for o, (x, y, z), p in crown2:
        o.location = (x + 0.035 * math.sin(ph + p), y + 0.03 * math.cos(ph + p), z + 0.02 * math.sin(2 * ph + p))
    mp.inputs["Location"].default_value[2] = -t * (2 * math.pi / (20 * 1.5))
    sloth.rotation_euler = (0.1 * math.sin(ph), 0.08 * math.sin(2 * ph), 0)
    frog.location.z = 0.09 + 0.02 * max(0.0, math.sin(3 * ph)) ** 3

toucan = Bird(material("tk_b", "#1b1830", roughness=0.5), material("tk_w", "#2a2640", roughness=0.5), material("tk_beak", "#ff9a1f", roughness=0.4), s=1.05, beak_len=0.14)
macaw = Bird(material("ma_b", "#e53935", roughness=0.5), material("ma_w", "#2f6fe0", roughness=0.5), material("ma_beak", "#f4e3c1", roughness=0.4), s=1.0, beak_len=0.05)


class Butterfly:
    def __init__(self, c):
        self.root = bpy.data.objects.new("bf", None)
        bpy.context.scene.collection.objects.link(self.root)
        m = material("bf_" + c, c, roughness=0.5)
        box((0, 0, 0), (0.05, 0.012, 0.012), material("bfb", "#222222"), bevel=0).parent = self.root
        self.pv = []
        for side in (-1, 1):
            pv = bpy.data.objects.new("pv", None)
            bpy.context.scene.collection.objects.link(pv)
            pv.parent = self.root
            w = box((0, side * 0.05, 0), (0.07, 0.09, 0.004), m, bevel=0)
            w.parent = pv
            w.location = (0, side * 0.05, 0)
            self.pv.append((pv, side))

    def place(self, pos, yaw, flap):
        self.root.location = pos
        self.root.rotation_euler = (0, 0, yaw)
        for pv, side in self.pv:
            pv.rotation_euler = (side * flap, 0, 0)


fly = [Butterfly("#3b8bff"), Butterfly("#ffb02e")]
leaf_m = greens[3]
falling = [(sphere((0, 0, 0), 0.03, leaf_m, scale=(1.5, 0.8, 0.3), seg=8, rings=6), rnd.random(), rnd.uniform(-1, 1), rnd.uniform(-1, 1)) for _ in range(7)]


def update(t):
    ph = t * math.tau
    for o, (x, y, z), p in crown:
        o.location = (x + 0.04 * math.sin(ph + p), y + 0.03 * math.cos(ph + p), z + 0.025 * math.sin(2 * ph + p))
    for segs, i in lianas:
        sw = 0.025 * math.sin(ph + i)
        for s in segs:
            s.rotation_euler.x += 0.0  # nehybné liány: jemný pohyb zajišťuje koruna
    a = ph
    toucan.place((1.25 * math.cos(a), 0.9 * math.sin(a), 2.5 + 0.12 * math.sin(2 * a)), a + math.pi / 2, 0.65 * math.sin(ph * 4))
    b = -ph * 1.0 + 1.2
    macaw.place((1.0 * math.cos(b), 0.75 * math.sin(b), 1.7 + 0.1 * math.sin(2 * b)), b - math.pi / 2, 0.7 * math.sin(ph * 4 + 1))
    for i, f in enumerate(fly):
        c = ph * 2 + i * math.pi
        f.place((0.9 * math.cos(c) + 0.1 * i, -0.4 + 0.5 * math.sin(c) * (1 if i else -1), 0.6 + 0.15 * math.sin(3 * c)), c + math.pi / 2, 0.6 + 0.5 * math.sin(ph * 8 + i))
    for o, off, x, y in falling:
        k = (off + t) % 1.0
        o.location = (0.9 * x + 0.12 * math.sin(ph * 2 + off * 6), 0.9 * y, 2.4 - k * 2.3)
        o.rotation_euler = (k * 6, k * 4, 0)


run(update, "znacka_prirodopis")
