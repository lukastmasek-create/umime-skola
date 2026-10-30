"""Pirátská galéra u mola (smyčka 12 snímků, 1024 × 820): hupkání na vlnách, plachty a vlajka se vlní.
Stejná ortografická projekce jako pristav.py (náklon 26°), ale 160 px na jednotku (1,6krát ostřeji než dřív): vodoryska je na řádku 830 z 1010 (horní 190 px je rezerva pro stěžně),
střed lodi uprostřed šířky. Web snímky zmenší na 640 × 512 (původní měřítko, 100 px na jednotku) nebo je kreslí ve vysokém rozlišení.
Kotva, kormidlo a rumpál se kreslí na webu zvlášť, aby se mohly hýbat.
Spuštění: python pristav_lod.py [--preview]     Výstup: out/pristav_lod/f_00NN.png
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
# vrstvy: all = celá loď, hull = trup bez plachet, sails = jen plachty (klidné), wind = jen plachty naplněné větrem
_A = args()
LAYER = _A[_A.index("--layer") + 1] if "--layer" in _A else "all"
BILLOW = 0.30 if LAYER == "wind" else 0.09
W, H, N = 1024, 1010, 12
PPU = 160.0
EL = math.radians(26)
TZ = 2.26   # vodoryska na řádku 830 z 1010 (nahoře rezerva pro vlajku)
WOOD, WOOD_D = "#8a5a34", "#5a3a22"
_M = {}


def M(name, color, roughness=0.7, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def G(name, color, strength=4.0):
    if name not in _M:
        _M[name] = glow(name, color, strength)
    return _M[name]


sc = reset(W, H, N, samples=24 if PREVIEW else 96, name="pristav_lod" if LAYER == "all" else f"pristav_lod_{LAYER}", world=("#cfe8ff", 0.9), view="AgX", look="AgX - Punchy")
sc.view_settings.exposure = 0.35
sc.render.film_transparent = True
add_camera((0, -60 * math.cos(EL), 60 * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=W / PPU)
add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=4.2, color="#fff0d8", angle=0.25)
add_area((6, -9, 8), (0, 0, 1), energy=500, size=10, color="#bcd4ff")


def empty(parent=None, loc=(0, 0, 0)):
    o = bpy.data.objects.new("p", None)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    o.location = loc
    return o


ship = empty()


def adopt(o, loc=None):
    o.parent = ship
    return o


# ------------------------------------------------------------------ trup z řezů
def profile(x):
    """Půdorysný tvar: 0..1 podél délky lodi (-2.3 zádi … 2.4 přídi)."""
    if x > 1.0:
        return max(0.0, math.sqrt(max(0.0, 1 - ((x - 1.0) / 1.45) ** 2)))
    if x < -1.8:
        return 0.75 + 0.25 * (x + 2.3) / 0.5
    return 1.0


def sheer(x):
    return 0.78 + (0.25 * ((x - 1.2) / 1.2) ** 2 if x > 1.2 else 0) + (0.3 * ((-1.2 - x) / 1.1) ** 2 if x < -1.2 else 0)


xs = [-2.3 + 0.19 * k for k in range(26)]
verts, faces = [], []
for x in xs:
    p = max(profile(x), 0.02)
    w = 0.7 * p
    top = sheer(x)
    for s in (-1, 1):
        pass
    # pět bodů okolo řezu: levý okraj paluby, levý bok dole, kýl, pravý bok dole, pravý okraj paluby
    verts += [(x, -w, top), (x, -w * 0.95, 0.25), (x, 0.0, 0.0 + 0.05 * (1 - p)), (x, w * 0.95, 0.25), (x, w, top)]
for i in range(len(xs) - 1):
    a = i * 5
    b = (i + 1) * 5
    for k in range(4):
        faces.append((a + k, a + k + 1, b + k + 1, b + k))
hull = mesh_obj("trup", verts, faces, M("trup", WOOD, 0.7), smooth=True)
adopt(hull)
# paluba
deck_pts = [(x, -0.7 * max(profile(x), 0.02) * 0.98, sheer(x) - 0.02) for x in xs] + [(x, 0.7 * max(profile(x), 0.02) * 0.98, sheer(x) - 0.02) for x in reversed(xs)]
deck = mesh_obj("paluba", deck_pts, [tuple(range(len(deck_pts)))], M("paluba", "#c79256", 0.8))
adopt(deck)
# bílý pruh a střílny
for x in [-1.4 + 0.5 * k for k in range(8)]:
    w = 0.7 * profile(x)
    for s in (-1,):
        adopt(box((x, s * (w * 0.96 + 0.0), 0.55), (0.2, 0.04, 0.17), M("strilna", "#2a1a12", 0.7), bevel=0))
        adopt(sphere((x + 0.2, s * (w * 0.98), 0.55), 0.045, M("kanon", "#2c2c38", 0.35, 0.8), seg=8, rings=6))
for s in (-1, 1):
    pts = [(x, s * 0.7 * max(profile(x), 0.02) * 0.995, 0.38) for x in xs]
    for a, b in zip(pts, pts[1:]):
        adopt(bar(a, b, 0.03, M("pruh", "#f3ecd8", 0.6), verts=6))
    top = [(x, s * 0.7 * max(profile(x), 0.02), sheer(x)) for x in xs]
    for a, b in zip(top, top[1:]):
        adopt(bar(a, b, 0.035, M("zabradli", WOOD_D, 0.8), verts=6))
# záď: nízká nástavba (zrcadlo) se zadními okny, držáky lucerny a zadní zábradlí
adopt(box((-2.22, 0, 1.0), (0.12, 1.12, 0.46), M("zad", WOOD, 0.75), bevel=0.02))
adopt(box((-2.22, 0, 1.26), (0.2, 1.2, 0.06), M("zad_s", WOOD_D, 0.8), bevel=0.01))
for sy in (-1, 0, 1):
    adopt(box((-2.29, sy * 0.33, 1.02), (0.03, 0.2, 0.2), G("zad_okno", "#ffd76b", 3.0), bevel=0))
    adopt(torus((-2.3, sy * 0.33, 1.02), 0.11, 0.015, M("zad_ram", WOOD_D, 0.8), rot=(0, math.pi / 2, 0)))
for sy in (-1, 1):
    adopt(bar((-2.2, sy * 0.58, 1.28), (-2.2, sy * 0.58, 1.6), 0.02, M("zad_tyc", WOOD_D, 0.8), verts=6))
    adopt(sphere((-2.2, sy * 0.58, 1.66), 0.08, G("zad_lucerna", "#ffcf6b", 5.0), seg=10, rings=8))
# podpalubní poklop s mřížkou, cívky lan a děla u zábradlí
adopt(box((0.35, 0.33, 0.8), (0.55, 0.42, 0.07), M("poklop", WOOD_D, 0.8), bevel=0.01))
for k in range(4):
    adopt(bar((0.12 + 0.15 * k, 0.12, 0.85), (0.12 + 0.15 * k, 0.54, 0.85), 0.012, M("mrizka", "#2a1a12", 0.8), verts=5))
for k in range(8):  # spáry mezi prkny paluby
    adopt(bar((-1.95, -0.52 + 0.15 * k, 0.805), (2.0, -0.52 + 0.15 * k, 0.805), 0.006, M("sparka", "#8a5e34", 0.9), verts=4))
for x in (-0.55, 0.35, 1.1):
    adopt(cyl((x, -0.54, 0.98), 0.065, 0.42, M("kanon", "#2c2c38", 0.35, 0.8), verts=12, rot=(math.pi / 2, 0, 0)))
    adopt(box((x, -0.46, 0.88), (0.2, 0.12, 0.12), M("lafeta", WOOD_D, 0.8), bevel=0.01))
adopt(torus((-0.55, 0.45, 0.83), 0.1, 0.03, M("lano_c", "#d8b878", 0.9)))
adopt(torus((1.65, 0.1, 0.83), 0.11, 0.03, M("lano_c", "#d8b878", 0.9)))
# příď: bukspryt, příďová figura
adopt(bar((2.0, 0, 0.95), (3.05, 0, 1.55), 0.045, M("bukspryt", WOOD_D, 0.8), verts=8))
adopt(sphere((2.38, 0, 0.75), 0.13, M("figura", "#ffc933", 0.3, 0.9), scale=(1.3, 0.5, 1), seg=12, rings=8))
adopt(cyl((2.02, -0.505, 0.62), 0.07, 0.04, M("klusa", "#16110c", 0.6), verts=16, rot=(math.pi / 2, 0, 0)))
adopt(torus((2.02, -0.51, 0.62), 0.075, 0.016, M("klusa_r", "#3a3a48", 0.4, 0.7), rot=(math.pi / 2, 0, 0)))
adopt(bar((1.7, -0.36, 0.95), (2.15, -0.8, 0.9), 0.04, M("kotevni_tram", WOOD_D, 0.8), verts=8))


# ------------------------------------------------------------------ stěžně a plachty
sails = []


def sail_on(mast_x, z_top, w, h, yaw, mat, billow=None, phase=0.0):
    billow = BILLOW if billow is None else billow
    piv = empty(ship, (mast_x, 0, z_top))
    piv.rotation_euler = (0, 0, yaw)
    f = Flag((-w / 2, 0, 0), w, h, [mat], lambda u, v: 0, cols=16, rows=10, amp=billow, waves=1.0, droop=0.0, name="plachta")
    f.obj.parent = piv
    adopt(bar((mast_x - w / 2 * math.cos(yaw), -w / 2 * math.sin(yaw), z_top), (mast_x + w / 2 * math.cos(yaw), w / 2 * math.sin(yaw), z_top), 0.03, M("ryna", WOOD_D, 0.8), verts=8))
    sails.append((f, phase))


cloth = M("platno", "#fbf4e0", 0.85)
for mx, hgt in ((-0.15, 4.6), (0.95, 4.0), (-1.25, 3.4)):
    adopt(bar((mx, 0, 0.7), (mx, 0, hgt), 0.055, M("stozar", WOOD_D, 0.8), verts=10))
mx = -0.15
sail_on(mx, 4.25, 1.5, 0.95, 0.5, cloth, phase=0.0)
sail_on(mx, 3.15, 2.2, 1.05, 0.5, cloth, phase=0.7)
sail_on(0.95, 3.7, 1.2, 0.8, 0.5, cloth, phase=1.4)
sail_on(0.95, 2.8, 1.7, 0.75, 0.5, cloth, phase=2.1)
sail_on(-1.25, 3.05, 1.3, 0.75, 0.5, cloth, phase=2.8)
# jednoduchý lodní výložník (kosatka) nad přídí
tri = mesh_obj("kosatka", [(2.05, 0, 1.4), (3.0, 0, 1.6), (1.35, 0, 3.3)], [(0, 1, 2)], M("kosatka", "#fbf4e0", 0.85))
adopt(tri)
tri.rotation_euler = (0, 0, 0.4)
# vraní hnízdo
adopt(cyl((-0.15, 0, 4.5), 0.22, 0.14, M("hnizdo", WOOD_D, 0.8), verts=16))
adopt(torus((-0.15, 0, 4.6), 0.22, 0.022, M("hnizdo", WOOD_D, 0.8)))
# vlajka s lebkou
black = M("cerna", "#16132b", 0.7)
white = M("bila", "#ffffff", 0.6)


def skull(u, v):
    cu, cv = 0.45, 0.4
    if ((u - cu) / 0.17) ** 2 + ((v - cv) / 0.22) ** 2 < 1:
        return 1
    if abs(u - cu) < 0.1 and 0.55 < v < 0.66:
        return 1
    for sx in (-1, 1):
        if abs(v - (0.78 + 0.0)) < 0.045 and abs(u - (cu + sx * 0.18) - 0.0) < 0.2 and False:
            return 1
    d1 = abs((v - 0.72) - (u - 0.3) * 0.5) < 0.04 and 0.2 < u < 0.7
    d2 = abs((v - 0.72) + (u - 0.3) * 0.5 - 0.0 + 0.2) < 0.04 and 0.2 < u < 0.7
    return 1 if (d1 or d2) else 0


flag = Flag((-0.15, 0, 5.05), 0.8, 0.5, [black, white], skull, cols=24, rows=14, amp=0.1, waves=2.0, droop=0.02, name="vlajka")
flag.obj.parent = ship
adopt(bar((-0.15, 0, 4.5), (-0.15, 0, 5.1), 0.02, M("stozar", WOOD_D, 0.8), verts=8))
# vanty s příčkami z boků lodi ke stěžňům a lana na výložník
rung = M("lano", "#d8b878", 0.9)
for sy in (-1, 1):
    for (mxx, ztop) in ((-0.15, 4.0), (0.95, 3.5), (-1.25, 2.9)):
        for off in (-0.16, 0.0, 0.16):
            a_ = (mxx + off, sy * 0.66, 0.9)
            b_ = (mxx, 0, ztop)
            adopt(bar(a_, b_, 0.011, rung, verts=5))
        for k in range(1, 7):
            u = k / 7.5
            for (o1, o2) in ((-0.16, 0.0), (0.0, 0.16)):
                p1 = (mxx + o1 * (1 - u), sy * 0.66 * (1 - u), 0.9 + (ztop - 0.9) * u)
                p2 = (mxx + o2 * (1 - u), sy * 0.66 * (1 - u), 0.9 + (ztop - 0.9) * u)
                adopt(bar(p1, p2, 0.008, rung, verts=4))
adopt(bar((0.95, 0, 3.45), (3.0, 0, 1.58), 0.012, rung, verts=5))
adopt(bar((-0.15, 0, 4.0), (0.95, 0, 3.45), 0.012, rung, verts=5))
# sudy a bedny na palubě u zadního zábradlí (ulička hrdiny je volná)
for (x, y) in ((-0.9, 0.42), (0.9, 0.44), (1.45, 0.38)):
    adopt(cyl((x, y, 0.95), 0.12, 0.24, M("sud", WOOD, 0.8), verts=14))
adopt(box((-0.2, 0.46, 0.92), (0.26, 0.26, 0.2), M("bedna", "#c79256", 0.8), bevel=0.01))


# vrstvy: plachty (včetně kosatky) se oddělí od trupu
sail_objs = [f.obj for f, _ in sails] + [tri]
if LAYER == "hull":
    for o in sail_objs:
        o.hide_render = True
elif LAYER in ("sails", "wind"):
    for o in bpy.data.objects:
        if o.type == "MESH" and o not in sail_objs:
            o.hide_render = True


def update(t):
    ph = t * math.tau
    ship.location.z = 0.05 * math.sin(ph + 0.5)
    ship.rotation_euler = (0.035 * math.sin(ph), 0.025 * math.sin(ph + 1.2), 0)
    for f, off in sails:
        f.update(t)
    flag.update(t)


run(update, "pristav_lod" if LAYER == "all" else f"pristav_lod_{LAYER}")
