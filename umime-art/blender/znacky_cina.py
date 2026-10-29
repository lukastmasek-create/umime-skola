"""Čína (Peking) / chemie: laboratoř pod červeným pavilonem. Bublající baňka, destilace přes skleněné
trubičky, zkumavky měnící barvu a otáčející se model molekuly."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_chemie", world=("#e9dcf5", 0.65), ortho=3.9, target_z=1.1)
plinth("#d9c7e8", "#ffffff")

red = material("red", "#c92b2b", roughness=0.45)
red_d = material("red_d", "#9b1d1d", roughness=0.5)
roof = material("roof", "#2f8f8a", roughness=0.4, metallic=0.1)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
steel = material("steel", "#c9ced8", roughness=0.25, metallic=0.9)
wood = material("wood", "#8a5a34", roughness=0.7)
dark = material("dark", "#2c2540", roughness=0.8)
glass = bpy.data.materials.new("glass")
glass.use_nodes = True
gb = glass.node_tree.nodes["Principled BSDF"]
gb.inputs["Base Color"].default_value = hex_rgba("#dff4ff")
gb.inputs["Roughness"].default_value = 0.05
for k, v in (("Transmission Weight", 0.85), ("IOR", 1.4)):
    if k in gb.inputs:
        gb.inputs[k].default_value = v
liq_a = glow("liq_a", "#7cff8a", 2.4)
liq_b = glow("liq_b", "#ff77d6", 2.2)
liq_c = glow("liq_c", "#6fd5ff", 2.2)
liq_d = glow("liq_d", "#ffd84d", 2.0)

# --- pavilon vzadu: čtyři sloupy, dvoupatrová střecha se zahnutými okapy ---
PX, PY = 0.05, 0.85
box((PX, PY, 0.12), (1.6, 1.1, 0.12), material("base", "#e8ddc9", roughness=0.8), bevel=0.02)
for sx in (-0.65, 0.65):
    for sy in (-0.4, 0.4):
        cyl((PX + sx, PY + sy, 0.62), 0.06, 0.9, red, verts=16)
box((PX, PY, 1.1), (1.6, 1.1, 0.1), red_d, bevel=0.01)
cone((PX, PY, 1.4), 1.05, 0.5, 0.5, roof, verts=4, rot=(0, 0, math.pi / 4))
cone((PX, PY, 1.85), 0.6, 0.16, 0.4, roof, verts=4, rot=(0, 0, math.pi / 4))
for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):  # zahnuté špičky okapů
    cone((PX + sx * 0.74, PY + sy * 0.56, 1.2), 0.06, 0.0, 0.2, gold, verts=8, rot=(sy * 0.4, -sx * 0.4, 0))
sphere((PX, PY, 2.12), 0.07, gold, seg=12, rings=8)
box((PX, PY - 0.56, 0.55), (0.5, 0.02, 0.8), dark)  # dveře
lantern_m = glow("lantern", "#ff8a4c", 4.0)
lanterns = [sphere((PX + sx * 0.62, PY - 0.52, 1.0), 0.08, lantern_m, scale=(1, 1, 1.2), seg=12, rings=8) for sx in (-1, 1)]

# --- pracovní stůl ---
TX0, TY0 = 0.0, -0.25
box((TX0, TY0, 0.38), (1.9, 0.7, 0.07), wood, bevel=0.015)
for dx in (-0.85, 0.85):
    for dy in (-0.28, 0.28):
        box((TX0 + dx, TY0 + dy, 0.18), (0.07, 0.07, 0.36), wood, bevel=0.005)

# velká Erlenmeyerova baňka s bublinami
FX, FY = -0.45, -0.25
ez = 0.42
cone((FX, FY, ez + 0.2), 0.28, 0.07, 0.4, glass, verts=32)
cyl((FX, FY, ez + 0.49), 0.07, 0.2, glass, verts=24)
liq_flask = cone((FX, FY, ez + 0.13), 0.26, 0.17, 0.25, liq_a, verts=32)
bubbles = [sphere((FX, FY, ez + 0.3), 0.03, glass, seg=10, rings=6) for _ in range(6)]
steam = [sphere((FX, FY, ez + 0.6), 0.05, material("steam%d" % i, "#ffffff", roughness=1.0), seg=10, rings=6) for i in range(4)]

# kulatá baňka nad kahanem + trubička do kádinky (destilace)
KX, KY = 0.4, -0.2
box((KX, KY, 0.5), (0.2, 0.2, 0.12), steel, bevel=0.008)  # kahan
flame_m = glow("flame", "#6fb6ff", 8.0)
flame = sphere((KX, KY, 0.6), 0.05, flame_m, scale=(1, 1, 1.8), seg=10, rings=8)
sphere((KX, KY, 0.9), 0.2, glass, seg=24, rings=16)
sphere((KX, KY, 0.82), 0.17, liq_b, scale=(1, 1, 0.55), seg=20, rings=10)
cyl((KX, KY, 1.12), 0.05, 0.14, glass, verts=16)
bar((KX, KY, 1.19), (KX + 0.45, KY, 1.19), 0.03, glass, verts=12)
bar((KX + 0.45, KY, 1.19), (KX + 0.62, KY, 0.78), 0.03, glass, verts=12)
cyl((KX + 0.62, KY, 0.54), 0.1, 0.2, glass, verts=20)
liq_beaker = cyl((KX + 0.62, KY, 0.5), 0.085, 0.1, liq_c, verts=20)
# stojan
bar((KX - 0.3, KY + 0.25, 0.4), (KX - 0.3, KY + 0.25, 1.35), 0.018, steel, verts=10)
bar((KX - 0.3, KY + 0.25, 1.25), (KX - 0.04, KY, 1.15), 0.012, steel, verts=8)
drip = sphere((KX + 0.62, KY, 0.8), 0.025, liq_c, seg=8, rings=6)

# stojánek se zkumavkami
RX, RY = -1.05, -0.2
box((RX, RY, 0.44), (0.55, 0.14, 0.04), wood, bevel=0.005)
tubes = []
tube_mats = [liq_a, liq_b, liq_c, liq_d]
for i in range(4):
    x = RX - 0.2 + i * 0.133
    cyl((x, RY, 0.62), 0.035, 0.34, glass, verts=14)
    tubes.append(cyl((x, RY, 0.55), 0.028, 0.2, tube_mats[i], verts=14))

# model molekuly (voda + vítr): kuličky a tyčinky na otáčivé ose nad stolem
mol = bpy.data.objects.new("mol", None)
bpy.context.scene.collection.objects.link(mol)
mol.location = (0.75, -0.7, 1.35)
atoms = [((0, 0, 0), 0.13, "#ff5a5a"), ((0.22, 0, 0.15), 0.08, "#ffffff"), ((-0.22, 0, 0.15), 0.08, "#ffffff"), ((0, 0.22, -0.15), 0.1, "#4a86ff"), ((0, -0.22, -0.15), 0.1, "#4a86ff")]
for loc, r, col in atoms:
    s = sphere(loc, r, material("at" + col, col, roughness=0.3), seg=18, rings=12)
    s.parent = mol
    s.location = loc
for loc in ((0.22, 0, 0.15), (-0.22, 0, 0.15), (0, 0.22, -0.15), (0, -0.22, -0.15)):
    b = bar((0, 0, 0), loc, 0.02, steel, verts=8)
    b.parent = mol

# kolem se vznáší chemické značky? jen bubliny a jiskry v obou barvách
rnd = random.Random(2)
sparks = [sphere((0, 0, 0), 0.03, glow("sp%d" % i, ["#7cff8a", "#ff77d6", "#6fd5ff", "#ffd84d"][i % 4], 3.0), seg=8, rings=6) for i in range(8)]
SP = [(rnd.uniform(0, math.tau), rnd.uniform(1.0, 1.25), rnd.uniform(0.6, 1.5)) for _ in sparks]


@anim
def _cina_more(t):
    ph = t * math.tau
    # bubliny stoupají v baňce a pára stoupá nad ni; každá se vrací přesně za jednu smyčku
    for i, b in enumerate(bubbles):
        u = (t * 2 + i / len(bubbles)) % 1.0
        b.location = (FX + 0.07 * math.sin(u * 9 + i * 2), FY + 0.05 * math.cos(u * 7 + i), ez + 0.14 + u * 0.3)
        b.scale = [0.5 + 0.8 * u] * 3
    for i, s in enumerate(steam):
        u = (t + i / len(steam)) % 1.0
        s.location = (FX + 0.05 * math.sin(u * 6 + i), FY, ez + 0.6 + u * 0.55)
        k = 0.4 + u * 1.3
        s.scale = (k, k, k * 0.8)
        s.hide_render = u > 0.92 or u < 0.04
    set_glow(liq_a, 2.4 + 1.2 * math.sin(2 * ph))
    set_glow(liq_b, 2.2 + 1.0 * math.sin(2 * ph + 1.0))
    set_glow(liq_c, 2.2 + 1.0 * math.sin(2 * ph + 2.0))
    set_glow(flame_m, 8.0 + 3.0 * math.sin(3 * ph))
    set_glow(lantern_m, 4.0 + 1.2 * math.sin(2 * ph + 0.7))
    flame.scale = (1 + 0.15 * math.sin(3 * ph), 1 + 0.15 * math.cos(3 * ph), 1.8 + 0.3 * math.sin(2 * ph))
    # kapka stéká z trubičky do kádinky
    u = (t * 3) % 1.0
    drip.location = (KX + 0.62, KY, 0.82 - u * 0.2)
    drip.hide_render = False
    mol.rotation_euler = (0.4, ph, 0.2)
    mol.location.z = 1.35 + 0.05 * math.sin(2 * ph)
    for k, (tube, base) in enumerate(zip(tubes, (0.2, 0.22, 0.18, 0.21))):
        tube.scale = (1, 1, 1 + 0.12 * math.sin(2 * ph + k * 1.4))
    for i, s in enumerate(sparks):
        a0, rr, h = SP[i]
        a = a0 + ph
        s.location = (rr * math.cos(a) * 0.95, rr * math.sin(a) * 0.8 - 0.1, 0.5 + h * 0.6 + 0.12 * math.sin(2 * ph + i))
        k = 0.7 + 0.6 * abs(math.sin(2 * ph + i))
        s.scale = (k, k, k)
    for l in lanterns:
        l.rotation_euler = (0, 0.08 * math.sin(ph), 0)


def update(t):
    pass


run(update, "znacka_chemie")
