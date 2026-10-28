"""Francie / literatura: Eiffelova věž. Třpytivé světlo, otáčející se maják, kolem létají otevřené knihy."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_literatura", world=("#e2d4f2", 0.6), ortho=4.8, target_z=1.55)
plinth("#8fd36f", "#ffe3f0")

iron = material("iron", "#8a7766", roughness=0.5, metallic=0.55)
iron_d = material("iron_d", "#6a5a4c", roughness=0.5, metallic=0.55)
lampm = glow("lamp", "#ffd98a", 4.0)
beam_m = glow("beam", "#ffe08a", 1.4)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)


def hw(z):
    return 0.7 * math.exp(-1.55 * z / 2.5) + 0.03


LEVELS = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.2, 2.4]
corner = lambda z, sx, sy: (sx * hw(z), sy * hw(z), z)
for k in range(len(LEVELS) - 1):
    z0, z1 = LEVELS[k], LEVELS[k + 1]
    r = max(0.03, 0.075 * (1 - z0 / 3.2))
    for sx in (-1, 1):
        for sy in (-1, 1):
            bar(corner(z0, sx, sy), corner(z1, sx, sy), r, iron, verts=8)
    # vodorovné prstence a křížové ztužení
    for sx, sy, tx, ty in ((-1, -1, 1, -1), (1, -1, 1, 1), (1, 1, -1, 1), (-1, 1, -1, -1)):
        a0, a1 = corner(z0, sx, sy), corner(z0, tx, ty)
        b0, b1 = corner(z1, sx, sy), corner(z1, tx, ty)
        bar(a0, a1, 0.026, iron_d, verts=6)
        bar(a0, b1, 0.018, iron_d, verts=6)
        bar(a1, b0, 0.018, iron_d, verts=6)
# plošiny
box((0, 0, 1.0), (2 * hw(1.0) + 0.14, 2 * hw(1.0) + 0.14, 0.05), iron_d)
box((0, 0, 1.75), (2 * hw(1.75) + 0.1, 2 * hw(1.75) + 0.1, 0.04), iron_d)
box((0, 0, 2.4), (0.2, 0.2, 0.18), iron_d)
bar((0, 0, 2.48), (0, 0, 3.05), 0.025, iron, verts=8)
bar((0, 0, 3.05), (0, 0, 3.2), 0.006, iron, verts=6)

# třpytivá světla na konstrukci
rnd = random.Random(11)
LAMPS = []
for i in range(46):
    z = rnd.choice(LEVELS[1:])
    sx, sy = rnd.choice((-1, 1)), rnd.choice((-1, 1))
    u = rnd.random()
    x, y, _ = corner(z, sx, sy)
    tx, ty = (hw(z) * (1 if rnd.random() < 0.5 else -1) * u, hw(z) * sy)
    m = glow("lp%d" % i, "#ffd98a", 0.0)
    LAMPS.append((m, rnd.randrange(1, 4), rnd.random() * math.tau, sphere((tx if rnd.random() < 0.5 else x, ty if rnd.random() < 0.5 else y, z), 0.022, m, seg=8, rings=6)))

# maják s rotujícím paprskem
sphere((0, 0, 3.24), 0.04, lampm, seg=12, rings=8)
beam = cone((0.0, 0.0, 0), 0.01, 0.09, 0.5, beam_m, verts=16)
beam.rotation_euler = (math.radians(90), 0, 0)

# létající knihy
class Book:
    def __init__(self, cover, pages):
        self.root = bpy.data.objects.new("book", None)
        bpy.context.scene.collection.objects.link(self.root)
        spine = box((0, 0, 0), (0.025, 0.2, 0.022), cover, bevel=0)
        spine.parent = self.root
        self.piv = []
        for side in (-1, 1):
            pv = bpy.data.objects.new("pv", None)
            bpy.context.scene.collection.objects.link(pv)
            pv.parent = self.root
            page = box((side * 0.085, 0, 0), (0.17, 0.2, 0.014), pages, bevel=0)
            page.parent = pv
            page.location = (side * 0.085, 0, 0)
            cv = box((side * 0.085, 0, -0.012), (0.18, 0.21, 0.01), cover, bevel=0)
            cv.parent = pv
            cv.location = (side * 0.085, 0, -0.012)
            self.piv.append((pv, side))

    def place(self, pos, yaw, flap):
        self.root.location = pos
        self.root.rotation_euler = (0, 0, yaw)
        for pv, side in self.piv:
            pv.rotation_euler = (0, -side * flap, 0)


pages = material("pages", "#fffaf0", roughness=0.8)
books = [Book(material("bk%d" % i, c, roughness=0.5), pages) for i, c in enumerate(("#ff7aa6", "#7a8cff", "#ffc933"))]


def update(t):
    ph = t * math.tau
    for m, k, p0, _ in LAMPS:
        set_glow(m, 9.0 * max(0.0, math.sin(ph * k + p0)) ** 3)
    a = ph * 1.0
    beam.location = (0.27 * math.cos(a), 0.27 * math.sin(a), 3.24)
    beam.rotation_euler = (math.radians(90), 0, a + math.pi / 2)
    for i, b in enumerate(books):
        ang = ph + i * math.tau / 3
        b.place((1.5 * math.cos(ang), 1.0 * math.sin(ang), 1.2 + 0.7 * i * 0.5 + 0.18 * math.sin(2 * ang + i)), ang + math.pi / 2, 0.55 + 0.45 * math.sin(ph * 3 + i * 2))


run(update, "znacka_literatura")
