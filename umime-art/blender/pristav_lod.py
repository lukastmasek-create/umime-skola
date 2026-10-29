"""Pirátská galéra u mola (smyčka 12 snímků, 640 × 512): hupkání na vlnách, plachty a vlajka se vlní.
Stejná ortografická projekce jako pristav.py (PPU 125, náklon 26°), vodoryska je v obrázku na řádku 400 z 512 (100 px na jednotku, scéna má 125),
střed lodi uprostřed šířky, takže web ji kotví na stejné místo bez dalších přepočtů.
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
W, H, N = 640, 512, 12
PPU = 100.0
EL = math.radians(26)
TZ = 1.6
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
# záď: nástavba se zadními okny a lucernami
adopt(box((-1.95, 0, 1.12), (0.7, 1.15, 0.6), M("zad", WOOD, 0.75), bevel=0.02))
adopt(box((-1.95, 0, 1.46), (0.78, 1.25, 0.06), M("zad_s", WOOD_D, 0.8), bevel=0.01))
for sy in (-1, 0, 1):
    adopt(box((-2.31, sy * 0.35, 1.18), (0.03, 0.2, 0.2), G("zad_okno", "#ffd76b", 3.0), bevel=0))
for sy in (-1, 1):
    adopt(sphere((-2.34, sy * 0.62, 1.4), 0.07, G("zad_lucerna", "#ffcf6b", 5.0), seg=10, rings=8))
# příď: bukspryt, příďová figura
adopt(bar((2.0, 0, 0.95), (3.05, 0, 1.55), 0.045, M("bukspryt", WOOD_D, 0.8), verts=8))
adopt(sphere((2.38, 0, 0.75), 0.13, M("figura", "#ffc933", 0.3, 0.9), scale=(1.3, 0.5, 1), seg=12, rings=8))


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
for mx, hgt, sw in ((-0.15, 3.35, 1.9), (0.95, 2.8, 1.5), (-1.25, 2.4, 1.2)):
    adopt(bar((mx, 0, 0.7), (mx, 0, hgt), 0.05, M("stozar", WOOD_D, 0.8), verts=10))
mx = -0.15
sail_on(mx, 3.05, 1.9, 1.15, 0.5, cloth, phase=0.0)
sail_on(mx, 1.75, 2.2, 1.2, 0.5, cloth, phase=0.7)
sail_on(0.95, 2.55, 1.5, 0.95, 0.5, cloth, phase=1.4)
sail_on(0.95, 1.5, 1.7, 0.8, 0.5, cloth, phase=2.1)
sail_on(-1.25, 2.1, 1.2, 0.8, 0.5, cloth, phase=2.8)
# jednoduchý lodní výložník (kosatka) nad přídí
tri = mesh_obj("kosatka", [(2.0, 0, 1.0), (3.0, 0, 1.52), (1.2, 0, 2.5)], [(0, 1, 2)], M("kosatka", "#fbf4e0", 0.85))
adopt(tri)
tri.rotation_euler = (0, 0, 0.4)
# vraní hnízdo
adopt(cyl((-0.15, 0, 3.3), 0.2, 0.12, M("hnizdo", WOOD_D, 0.8), verts=16))
adopt(torus((-0.15, 0, 3.4), 0.2, 0.02, M("hnizdo", WOOD_D, 0.8)))
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


flag = Flag((-0.15, 0, 3.75), 0.8, 0.5, [black, white], skull, cols=24, rows=14, amp=0.1, waves=2.0, droop=0.02, name="vlajka")
flag.obj.parent = ship
adopt(bar((-0.15, 0, 3.3), (-0.15, 0, 3.8), 0.02, M("stozar", WOOD_D, 0.8), verts=8))
# lana z oken stěžně na palubu
for sy in (-1, 1):
    for (mxx, zz) in ((-0.15, 3.0), (0.95, 2.5)):
        adopt(bar((mxx, 0, zz), (mxx + 0.15, sy * 0.72, 0.8), 0.012, M("lano", "#d8b878", 0.9), verts=5))
# sudy a bedny na palubě
for (x, y) in ((0.4, -0.35), (-0.7, 0.3), (1.5, 0.2)):
    adopt(cyl((x, y, 0.95), 0.12, 0.24, M("sud", WOOD, 0.8), verts=14))
adopt(box((0.2, 0.35, 0.92), (0.26, 0.26, 0.2), M("bedna", "#c79256", 0.8), bevel=0.01))


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
