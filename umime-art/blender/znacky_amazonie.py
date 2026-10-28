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
