"""USA / fyzika: Saturn V na rampě Kennedyho vesmírného střediska. Motory žhnou a pulzují, kolem rampy se valí
pára a kouř, ramena věže se chvějí, majáky odpočtu blikají, vlaje americká vlajka a kolem krouží racci."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_fyzika", ortho=4.6, target_z=1.5)
plinth("#8fd36f", "#fff4d0")

white = material("sw", "#f6f4ee", roughness=0.4)
white_d = material("sw_d", "#dcd8cf", roughness=0.45)
black = material("sb", "#25222e", roughness=0.5)
steel = material("steel", "#9aa3b2", roughness=0.35, metallic=0.7)
steel_d = material("steel_d", "#6c7486", roughness=0.4, metallic=0.6)
concrete = stone_material("conc", "#c5c0b6", scale=30, strength=0.25)
concrete_d = stone_material("conc_d", "#9a958c", scale=30, strength=0.3)
red = material("sred", "#d6453a", roughness=0.45)
rust = material("srust", "#e0623a", roughness=0.5)
glassw = glow("sglass", "#ffe2a0", 3.0)
beacon_a, beacon_b = glow("bea", "#ff3b3b", 8.0), glow("beb", "#ff3b3b", 8.0)
flame_o, flame_y, flame_w = glow("fl_o", "#ff6a14", 6.0), glow("fl_y", "#ffc21a", 8.0), glow("fl_w", "#fff3c0", 10.0)

# ---------------------------------------------------------------- rampa a dlažba
cyl((0, 0, 0.09), 0.72, 0.18, concrete, verts=8, rot=(0, 0, math.radians(22.5)))
cyl((0, 0, 0.185), 0.5, 0.03, concrete_d, verts=8, rot=(0, 0, math.radians(22.5)))
box((0, 0, 0.23), (0.62, 0.62, 0.1), steel_d, bevel=0.01)          # pojízdná rampa pod raketou
for sx in (-1, 1):
    box((sx * 0.38, 0, 0.2), (0.07, 0.5, 0.06), concrete_d, bevel=0.004)
# cesta pro pásový transportér od montážní haly
road = material("road", "#a9a395", roughness=0.9)
box((0.45, -0.85, 0.05), (0.5, 0.4, 0.022), road, rot=(0, 0, 0.5), bevel=0.003)
for i in range(7):
    box((-0.45 + i * 0.1, -0.95 + 0.0, 0.052), (0.05, 0.015, 0.012), concrete_d, rot=(0, 0, 0.5), bevel=0)

# ---------------------------------------------------------------- Saturn V (kořen kvůli vibracím)
rocket = bpy.data.objects.new("rocket", None)
bpy.context.scene.collection.objects.link(rocket)
parts = []
R = 0.1
z = 0.28


def seg(h, mat, r=R):
    global z
    o = cyl((0, 0, z + h / 2), r, h, mat, verts=32)
    parts.append(o)
    z += h
    return o


# 1. stupeň S-IC: bílý s černými pásy, dole čtyři stabilizátory a pět motorů
seg(0.1, black)
seg(0.3, white)
seg(0.06, black)
seg(0.3, white)
seg(0.03, black)
seg(0.04, white_d, R * 1.05)  # mezistupeň
seg(0.1, black, R * 1.02)
seg(0.4, white)           # S-II
seg(0.06, black)
seg(0.24, white)          # S-IVB
seg(0.04, black)          # přístrojová jednotka
seg(0.2, white_d, 0.082)  # servisní modul
parts.append(cone((0, 0, z + 0.06), 0.082, 0.025, 0.12, steel, verts=28)); z += 0.12   # velitelský modul
parts.append(sphere((0, 0, z + 0.012), 0.025, steel, seg=12, rings=8))
parts.append(cyl((0, 0, z + 0.07), 0.016, 0.14, white, verts=14))                      # záchranná věž
parts.append(cyl((0, 0, z + 0.2), 0.03, 0.14, white, verts=14))                        # záchranný motor
parts.append(cone((0, 0, z + 0.31), 0.03, 0.0, 0.1, red, verts=14))
TOP = z + 0.36
for k in range(4):
    a = math.radians(45 + 90 * k)
    parts.append(box((0.13 * math.cos(a), 0.13 * math.sin(a), 0.4), (0.16, 0.012, 0.24), black, rot=(0, 0, a), bevel=0.002))   # stabilizátory
    parts.append(cone((0.095 * math.cos(a), 0.095 * math.sin(a), 0.35), 0.035, 0.012, 0.1, steel_d, verts=10))
    parts.append(cyl((0.095 * math.cos(a), 0.095 * math.sin(a), 0.54), 0.034, 0.1, white_d, verts=12))              # kryty motorů
parts.append(cone((0, 0, 0.32), 0.05, 0.02, 0.09, steel_d, verts=12))
for o in parts:
    loc = o.location.copy()
    o.parent = rocket
    o.location = loc

# žhavé trysky: pět výfukových kuželů dolů do žlabu + deflektor
nozz = []
for (dx, dy) in ((0, 0), (0.06, 0.06), (-0.06, 0.06), (0.06, -0.06), (-0.06, -0.06)):
    nozz.append(cone((dx, dy, 0.27), 0.028, 0.0, 0.2, flame_o, verts=12, rot=(math.pi, 0, 0)))
cores = [cone((dx, dy, 0.27), 0.018, 0.0, 0.14, flame_y, verts=10, rot=(math.pi, 0, 0)) for (dx, dy) in ((0, 0), (0.06, 0.06), (-0.06, 0.06), (0.06, -0.06), (-0.06, -0.06))]
for o in nozz + cores:
    o.parent = rocket
# plameny šikmo po stranách (výfuk se rozlévá do žlabu)
sides = []
for k in range(4):
    a = math.radians(45 + 90 * k)
    c = cone((0.2 * math.cos(a), 0.2 * math.sin(a), 0.255), 0.07, 0.0, 0.36, flame_o, verts=14, rot=(math.radians(100) * (1 if True else -1), 0, 0))
    c.rotation_euler = Euler((0, 0, 0))
    c.rotation_mode = "XYZ"
    c.rotation_euler = (math.radians(90) * math.sin(a) * -1 if False else 0, 0, 0)
    c.rotation_mode = "QUATERNION"
    c.rotation_quaternion = Vector((math.cos(a), math.sin(a), -0.7)).normalized().to_track_quat("Z", "Y") if False else (Vector((0, 0, 1)).rotation_difference(Vector((math.cos(a), math.sin(a), -0.55)).normalized()))
    sides.append(c)

# ---------------------------------------------------------------- věž s rameny
TX, TY = -0.45, 0.06
H = 2.2
tower = []
for (sx, sy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
    tower.append(bar((TX + sx * 0.07, TY + sy * 0.07, 0.2), (TX + sx * 0.07, TY + sy * 0.07, 0.2 + H), 0.012, steel))
for k in range(11):
    zz = 0.2 + k * H / 10
    for s in (-1, 1):
        bar((TX - 0.07, TY + s * 0.07, zz), (TX + 0.07, TY + s * 0.07, zz), 0.008, steel)
        bar((TX + s * 0.07, TY - 0.07, zz), (TX + s * 0.07, TY + 0.07, zz), 0.008, steel)
    if k < 10:
        z2 = 0.2 + (k + 1) * H / 10
        bar((TX - 0.07, TY - 0.07, zz), (TX + 0.07, TY - 0.07, z2), 0.007, steel_d)
        bar((TX + 0.07, TY - 0.07, zz), (TX - 0.07, TY - 0.07, z2), 0.007, steel_d)
        bar((TX - 0.07, TY + 0.07, zz), (TX - 0.07, TY - 0.07, z2), 0.007, steel_d)
box((TX, TY, 0.2 + H + 0.05), (0.2, 0.2, 0.08), red, bevel=0.01)                      # strojovna jeřábu nahoře
box((TX + 0.12, TY, 0.2 + H + 0.1), (0.3, 0.04, 0.03), steel, bevel=0.004)
bar((TX + 0.25, TY, 0.2 + H + 0.08), (TX + 0.25, TY, 0.2 + H - 0.15), 0.004, black, verts=5)
# výsuvná ramena k raketě: pevné desky + okénka
arms = []
for zz in (0.62, 0.98, 1.38, 1.78):
    a = box(((TX + 0.07) / 2 - 0.0, TY, zz), (0.35, 0.05, 0.04), steel_d, bevel=0.004)
    a.location = (TX + 0.07 + 0.17, TY, zz)
    arms.append((a, zz))
    box((TX + 0.07 + 0.35, TY, zz), (0.04, 0.08, 0.07), red, bevel=0.004)
# majáky
sphere((TX, TY, 0.2 + H + 0.14), 0.03, beacon_a, seg=10, rings=8)
sphere((TX + 0.25, TY, 0.2 + H + 0.1), 0.02, beacon_b, seg=10, rings=8)
# reflektory se zářivým kuželem
for i, (x, y) in enumerate(((0.62, 0.62), (-0.62, -0.62), (0.7, -0.4))):
    bar((x, y, 0.2), (x, y, 0.62), 0.012, steel_d, verts=8)
    sphere((x, y, 0.66), 0.04, glassw, seg=10, rings=8)

# ---------------------------------------------------------------- montážní hala, vlajka, palmy
vx, vy = 1.18, 0.85
box((vx, vy, 0.55), (0.62, 0.46, 1.1), white, bevel=0.01)
box((vx, vy - 0.235, 0.7), (0.3, 0.01, 0.7), steel_d, bevel=0)
for i in range(6):
    box((vx - 0.25 + i * 0.1, vy - 0.236, 0.3), (0.02, 0.01, 0.4), concrete_d, bevel=0)
box((vx, vy, 1.12), (0.66, 0.5, 0.04), steel_d, bevel=0.004)
for k in range(5):
    box((vx - 0.24 + k * 0.12, vy - 0.236, 0.92), (0.07, 0.01, 0.1), glassw, bevel=0)
pole((vx - 0.27, vy - 0.24, 1.12), (vx - 0.27, vy - 0.24, 1.62), r=0.012)
fr, fw, fb = material("us_r", "#cf2b3b"), material("us_w", "#ffffff"), material("us_b", "#233a8a")


def us_flag(u, v):
    if u < 0.4 and v < 0.54:
        return 1 if (int(u * 24) % 2 == 0 and int(v * 24) % 2 == 0 and u > 0.03 and v > 0.04) else 2
    return 0 if int(v * 13) % 2 == 0 else 1


usf = Flag((vx - 0.258, vy - 0.24, 1.6), 0.42, 0.25, [fr, fw, fb], us_flag, cols=40, rows=20, amp=0.1, waves=1.6, droop=0.02)


def palm(x, y, s=1.0, lean=0.2):
    trunk = material("palm_t", "#9a6c3e", roughness=0.9)
    pts = []
    for k in range(6):
        t = k / 5
        pts.append((x + lean * t * t * s, y, 0.05 + 0.5 * s * t))
    for a, b in zip(pts[:-1], pts[1:]):
        bar(a, b, 0.018 * s, trunk, verts=8)
    top = pts[-1]
    leaf = material("palm_l", "#2f9f55", roughness=0.6)
    for k in range(7):
        a = k * math.tau / 7
        c = cone((top[0] + 0.1 * s * math.cos(a), top[1] + 0.1 * s * math.sin(a), top[2] - 0.02 * s), 0.035 * s, 0.0, 0.25 * s, leaf, verts=4)
        c.rotation_euler = Euler((0, 0, 0))
        tgt = Vector((math.cos(a), math.sin(a), -0.35))
        c.rotation_mode = "QUATERNION"
        c.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(tgt.normalized())


palm(-1.0, -0.65, 1.15, 0.22)
palm(1.05, -0.5, 0.95, -0.2)
palm(-0.2, 0.95, 0.9, 0.15)
for (x, y) in ((-0.85, 0.2), (0.75, 0.15), (0.3, -0.95), (-0.6, -0.95)):
    bush(x, y, 1.1)
cobbles(1.0, 40, material("cobu", "#a9a395", roughness=0.9), z=0.052)

# ---------------------------------------------------------------- animované prvky
puffs = [sphere((0, 0, 0), 0.1, material("pf%d" % i, "#f2efff", roughness=1.0), seg=12, rings=8) for i in range(14)]
vent = [sphere((0, 0, 0), 0.04, material("vn%d" % i, "#ffffff", roughness=1.0), seg=10, rings=8) for i in range(8)]
sparks = [sphere((0, 0, 0), 0.016, glow("sp%d" % i, "#ffd24d", 9.0), seg=6, rings=4) for i in range(12)]
gulls = [Bird(material("gl%d" % i, "#ffffff", roughness=0.6), material("glw%d" % i, "#d7dce8", roughness=0.6), material("glb%d" % i, "#ffb02e", roughness=0.5), s=0.9, beak_len=0.07) for i in range(3)]


@anim
def _anim(t):
    ph = t * math.tau
    # raketa se mírně chvěje a nad ní se vlní horký vzduch (jemný náklon)
    rocket.location = (0.004 * math.sin(6 * ph), 0.003 * math.sin(5 * ph + 1), 0.0)
    rocket.rotation_euler = (0.004 * math.sin(4 * ph), 0.004 * math.cos(3 * ph), 0)
    # motory: plamen pulzuje, jádro bliká
    L = 1 + 0.18 * math.sin(6 * ph) + 0.08 * math.sin(12 * ph + 1)
    for i, c in enumerate(nozz):
        k = L + 0.1 * math.sin(4 * ph + i)
        c.scale = (1 + 0.1 * math.sin(6 * ph + i), 1 + 0.1 * math.cos(6 * ph + i), k)
    for i, c in enumerate(cores):
        c.scale = (1, 1, L * 1.1 + 0.15 * math.sin(12 * ph + i))
    for i, c in enumerate(sides):
        k = 1 + 0.2 * math.sin(6 * ph + i * 1.3)
        c.scale = (1, 1, k)
    set_glow(flame_o, 5 + 2.5 * math.sin(6 * ph))
    set_glow(flame_y, 7 + 3 * math.sin(12 * ph))
    # oblak páry a kouře: valí se od základny ven a stoupá
    for i, p in enumerate(puffs):
        u = (t + i / 14.0) % 1.0
        a = i * 2.399 + 0.6
        r = 0.18 + 0.75 * u
        p.location = (r * math.cos(a), r * math.sin(a) * 0.9, 0.3 + 0.28 * u + 0.05 * math.sin(ph + i))
        s = (0.35 + 1.4 * u) * math.sin(math.pi * min(1.0, u * 1.05 + 0.02)) ** 0.6
        p.scale = (s, s, s * 0.8)
    # odpouštění kyslíku z boku rakety
    for i, v in enumerate(vent):
        u = (t * 2 + i / 8.0) % 1.0
        v.location = (-0.12 - 0.22 * u + 0.02 * math.sin(ph * 2 + i), 0.06 * math.sin(i), 1.08 + 0.12 * u)
        s = math.sin(math.pi * u) * (0.5 + 0.9 * u)
        v.scale = (s, s, s)
    # jiskry a odlétávající žhavé částice u země
    for i, s_ in enumerate(sparks):
        u = (t * 2 + i / 12.0) % 1.0
        a = i * 1.3
        s_.location = ((0.1 + 0.55 * u) * math.cos(a), (0.1 + 0.55 * u) * math.sin(a), 0.29 + 0.45 * u * (1 - u) * 2)
        q = math.sin(math.pi * u)
        s_.scale = (q, q, q)
    # majáky střídavě blikají, ramena se jemně třesou
    set_glow(beacon_a, 9 if math.sin(2 * ph) > 0 else 0.5)
    set_glow(beacon_b, 0.5 if math.sin(2 * ph) > 0 else 9)
    for k, (a, zz) in enumerate(arms):
        a.location.z = zz + 0.004 * math.sin(6 * ph + k * 1.5)
    usf.update(t)
    # racci krouží kolem věže
    for i, g in enumerate(gulls):
        aa = ph + i * math.tau / 3
        rr = 1.55 + 0.12 * i
        g.place((rr * math.cos(aa) * 0.9, rr * math.sin(aa) * 0.7 + 0.2, 1.9 + 0.3 * i + 0.1 * math.sin(2 * aa)), aa + math.pi / 2, 0.6 * math.sin(ph * 6 + i))


run(lambda t: None, "znacka_fyzika")
