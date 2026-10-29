"""Sekce „Jak to funguje“: pohádkové městečko za soumraku. Tři hlavní budovy = tři kroky
(1 škola s knihovnou, 2 herna s neonem, 3 věž s pohárem a rostoucím stromem), kolem menší domky,
náměstí s fontánou, mlýn, trh, říčka s mostem, ohrady a stromy. Pohoří a sopku skládá web
z vlastních vrstev, městečko je jeden průhledný obrázek s kopcovitým zadním okrajem.

Spuštění: python mestecko.py [-- scena] [--preview]   (potřebuje bpy, viz BLENDER_ANIM.md)
Výstup: out/mesto_scena/f_0001.png a out/mesto_scena/paths.json (polohy pro web, normalizované)
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
W, H = (1000, 450) if PREVIEW else (2000, 900)
UNITS = 16.0
PPU = W / UNITS
EL = math.radians(26)
TZ = 1.3
CAM_D = 60.0
_M = {}


def M(name, color, roughness=0.65, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def G(name, color, strength=4.0):
    if name not in _M:
        _M[name] = glow(name, color, strength)
    return _M[name]


def project(x, y, z):
    return (W / 2 + PPU * x, H / 2 - PPU * (y * math.sin(EL) + (z - TZ) * math.cos(EL)))


def norm(x, y, z=0.0):
    px, py = project(x, y, z)
    return [round(px / W, 5), round(py / H, 5)]


# ------------------------------------------------------------------ stavební prvky
def gable(cx, cy, z0, w, d, h, mat, over=0.12, along="x", thick=0.05):
    """Sedlová střecha s přesahem; hřeben vede podél osy `along`."""
    hw, hd = w / 2 + over, d / 2 + over
    if along == "x":
        v = [(cx - hw, cy - hd, z0), (cx + hw, cy - hd, z0), (cx + hw, cy, z0 + h), (cx - hw, cy, z0 + h), (cx - hw, cy + hd, z0), (cx + hw, cy + hd, z0)]
        f = [(0, 1, 2, 3), (3, 2, 5, 4)]
        ends = [(0, 3, 4), (1, 5, 2)]
    else:
        v = [(cx - hw, cy - hd, z0), (cx - hw, cy + hd, z0), (cx, cy + hd, z0 + h), (cx, cy - hd, z0 + h), (cx + hw, cy - hd, z0), (cx + hw, cy + hd, z0)]
        f = [(1, 0, 3, 2), (2, 3, 4, 5)]
        ends = [(0, 1, 3), (4, 5, 2)]
    o = mesh_obj("strecha", v, f + [], mat)
    s = o.modifiers.new("s", "SOLIDIFY")
    s.thickness = thick
    s.offset = 1
    return o


def gable_wall(cx, cy, z0, w, d, h, mat, along="x"):
    """Trojúhelníkové štíty pod střechou (zeď po obou stranách hřebene)."""
    hw, hd = w / 2, d / 2
    if along == "x":
        for sx in (-1, 1):
            mesh_obj("stit", [(cx + sx * hw, cy - hd, z0), (cx + sx * hw, cy + hd, z0), (cx + sx * hw, cy, z0 + h)], [(0, 1, 2)], mat)
    else:
        for sy in (-1, 1):
            mesh_obj("stit", [(cx - hw, cy + sy * hd, z0), (cx + hw, cy + sy * hd, z0), (cx, cy + sy * hd, z0 + h)], [(0, 1, 2)], mat)


def window(x, y, z, w=0.26, h=0.32, glow_c="#ffd98a", strength=3.5, trim="#fff6e6", shutters=None, face=-1):
    """Okno na přední (nebo zadní) straně: rám, zářící tabulka, kříž a parapet."""
    yy = y + face * 0.005
    box((x, yy, z), (w + 0.08, 0.04, h + 0.08), M("okr", trim, roughness=0.5), bevel=0.008)
    box((x, yy + face * 0.015, z), (w, 0.02, h), G("ok" + glow_c, glow_c, strength), bevel=0)
    box((x, yy + face * 0.03, z), (0.025, 0.012, h), M("okr", trim, roughness=0.5), bevel=0)
    box((x, yy + face * 0.03, z), (w, 0.012, 0.025), M("okr", trim, roughness=0.5), bevel=0)
    box((x, yy + face * 0.04, z - h / 2 - 0.05), (w + 0.14, 0.07, 0.03), M("okr", trim, roughness=0.5), bevel=0.006)
    if shutters:
        for sx in (-1, 1):
            box((x + sx * (w / 2 + 0.1), yy + face * 0.01, z), (0.09, 0.025, h + 0.06), M("zaluz" + shutters, shutters, roughness=0.6), bevel=0.004)


def door(x, y, z0, w=0.34, h=0.55, color="#8a5a34", trim="#fff6e6", arch=True, knob="#ffd24d"):
    box((x, y - 0.005, z0 + h / 2), (w + 0.1, 0.05, h + 0.06), M("dvr", trim, roughness=0.5), bevel=0.01)
    box((x, y - 0.025, z0 + h / 2), (w, 0.03, h), M("dv" + color, color, roughness=0.6), bevel=0.01)
    if arch:
        cyl((x, y - 0.025, z0 + h), w / 2, 0.03, M("dv" + color, color, roughness=0.6), verts=20, rot=(math.radians(90), 0, 0), smooth=False)
        cyl((x, y - 0.012, z0 + h), w / 2 + 0.05, 0.05, M("dvr", trim, roughness=0.5), verts=20, rot=(math.radians(90), 0, 0), smooth=False)
    sphere((x + w * 0.32, y - 0.05, z0 + h * 0.48), 0.022, M("kl", knob, roughness=0.3, metallic=0.6), seg=8, rings=6)
    box((x, y - 0.06, z0 + 0.01), (w + 0.2, 0.18, 0.03), M("pra", "#c9c2d6", roughness=0.8), bevel=0.006)


def chimney(x, y, z, h=0.45, color="#a8574a", cap="#6e6a78"):
    box((x, y, z + h / 2), (0.16, 0.16, h), M("kom" + color, color, roughness=0.8), bevel=0.01)
    box((x, y, z + h + 0.015), (0.21, 0.21, 0.04), M("kmc", cap, roughness=0.7), bevel=0.006)
    return norm(x, y, z + h + 0.05)


def house(x, y, w, d, h, wall, roof, rh=0.55, along="x", chim=None, wins=2, door_x=0.0, shutter=None, name="d", stone_base=True, floors=1):
    """Hračkový domek: zeď, sokl, střecha, komín, okna, dveře. Vrací polohu komína pro web."""
    wm = M("zd" + wall, wall, roughness=0.75)
    box((x, y, h / 2), (w, d, h), wm, bevel=0.012)
    if stone_base:
        box((x, y, 0.07), (w + 0.04, d + 0.04, 0.14), stone_material("sokl", "#a79fb4", scale=26, strength=0.3), bevel=0.01)
    gable_wall(x, y, h, w, d, rh, wm, along)
    gable(x, y, h, w, d, rh, M("st" + roof, roof, roughness=0.55), along=along)
    out = None
    if chim is not None:
        out = chimney(x + chim[0], y + chim[1], h + rh * 0.45, h=0.38)
    fy = y - d / 2
    for k in range(wins):
        wx = x + (-w / 2 + w * (k + 1) / (wins + 1)) * (0.92) + (0.0 if wins > 1 else 0.28)
        if wins == 1:
            wx = x + w * 0.22
        window(wx, fy, h * 0.58, shutters=shutter)
        if floors > 1:
            window(wx, fy, h * 0.58 + h * 0.45, shutters=shutter)
    door(x + door_x, fy, 0.0)
    return out


def fence(x0, y0, x1, y1, h=0.22, mat=None, step=0.22):
    m = mat or M("plot", "#c79a5e", roughness=0.8)
    L = math.hypot(x1 - x0, y1 - y0)
    n = max(2, int(L / step))
    for i in range(n + 1):
        u = i / n
        box((x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, h / 2), (0.04, 0.04, h), m, bevel=0.005)
    for zz in (h * 0.35, h * 0.75):
        bar((x0, y0, zz), (x1, y1, zz), 0.012, m, verts=6)


def rocks(x, y, n=3, s=1.0, seed=1):
    r = random.Random(seed)
    for i in range(n):
        sphere((x + r.uniform(-0.18, 0.18) * s, y + r.uniform(-0.12, 0.12) * s, 0.04 * s), r.uniform(0.05, 0.11) * s, M("kam", "#8a8494", roughness=0.9), scale=(1, 1, 0.65), seg=8, rings=6)


def flowers(x, y, w, d, n, seed=2):
    r = random.Random(seed)
    cols = ["#ff5fa2", "#ffd24d", "#ffffff", "#ff8a3c", "#b78cff"]
    for i in range(n):
        c = cols[i % len(cols)]
        px, py = x + r.uniform(-w / 2, w / 2), y + r.uniform(-d / 2, d / 2)
        bar((px, py, 0.0), (px, py, 0.07), 0.006, M("stonek", "#3f8f4a"), verts=5)
        sphere((px, py, 0.085), 0.026, M("kv" + c, c, roughness=0.5), seg=8, rings=6)


def lamp(x, y, strength=6.0):
    """Pouliční lampa se zářící baňkou."""
    m = M("lampa", "#3b3a4a", roughness=0.4, metallic=0.7)
    bar((x, y, 0), (x, y, 0.55), 0.014, m, verts=8)
    box((x, y, 0.57), (0.07, 0.07, 0.025), m, bevel=0.004)
    sphere((x, y, 0.62), 0.045, G("lampa_sv", "#ffd98a", strength), seg=10, rings=8)
    cone((x, y, 0.68), 0.06, 0.0, 0.05, m, verts=8)
    return norm(x, y, 0.62)


def pine(x, y, s=1.0, leaf="#2f7a5a"):
    tree(x, y, s * 1.5, kind="cone", leaf=leaf)


def roundtree(x, y, s=1.0, leaf="#4fb560"):
    tree(x, y, s * 1.5, kind="round", leaf=leaf)


def road_ribbon(pts, width, mat, z=0.012):
    """Pás cesty podél vyhlazené křivky."""
    verts, faces = [], []
    n = len(pts)
    for i, (px, py) in enumerate(pts):
        a = pts[max(0, i - 1)]
        b = pts[min(n - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        verts += [(px + nx * width / 2, py + ny * width / 2, z), (px - nx * width / 2, py - ny * width / 2, z)]
        if i:
            k = 2 * (i - 1)
            faces.append((k, k + 1, k + 3, k + 2))
    return mesh_obj("cesta", verts, faces, mat, smooth=False)


def build_world():
    sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name="mesto_scena", world=("#8c84d8", 0.95), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.5
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    # soumrak: studené měsíční světlo zleva shora, teplé z pravé strany od sopky, jemná výplň
    add_sun((math.radians(52), math.radians(8), math.radians(-48)), energy=3.4, color="#c8d4ff", angle=0.2)
    add_sun((math.radians(78), math.radians(0), math.radians(112)), energy=2.4, color="#ffa66a", angle=0.3)
    add_area((-6, -10, 8), (0, 0, 1), energy=1100, size=10, color="#9fa8ff")
    out = {"w": W, "h": H, "ppu": PPU}

    # ---------------------------------------------------------- terén
    grass = M("trava", "#5db566", roughness=0.85)
    grass2 = M("trava2", "#6cc472", roughness=0.85)
    box((0, 0.6, -0.5), (22, 7.2, 1.0), grass, bevel=0)           # town: y -3.0 .. 4.2 (po řeku)
    box((0, -6.2, -0.5), (22, 6.6, 1.0), grass2, bevel=0)         # louka před řekou y -9.5 .. -2.9
    # říčka
    water = bpy.data.materials.new("voda")
    water.use_nodes = True
    wb = water.node_tree.nodes["Principled BSDF"]
    wb.inputs["Base Color"].default_value = hex_rgba("#59b8ff")
    wb.inputs["Roughness"].default_value = 0.08
    wb.inputs["Emission Color"].default_value = hex_rgba("#5fd0ff")
    wb.inputs["Emission Strength"].default_value = 0.8
    box((0, -2.55, -0.1), (22, 0.62, 0.1), water, bevel=0)
    box((0, -2.55, -0.45), (22, 0.62, 0.7), M("dno", "#3a6a9a"), bevel=0)
    for sy in (-2.86, -2.24):  # břehy
        box((0, sy, 0.0), (22, 0.12, 0.1), M("breh", "#8a8494", roughness=0.9), bevel=0.02)
    # zadní kopce (schovají patu sopky a pohoří)
    for i, (hx, hy, hr, hz) in enumerate([(-8.5, 3.6, 2.8, 0.9), (-5, 4.1, 2.6, 0.75), (-1.8, 4.3, 3.0, 0.9), (1.8, 4.4, 3.4, 1.0), (5.5, 4.1, 2.8, 0.85), (8.6, 3.7, 2.6, 0.95)]):
        sphere((hx, hy, 0.0), hr, M("kopec%d" % (i % 2), ["#4aa060", "#58b068"][i % 2], roughness=0.85), scale=(1.5, 0.9, hz / hr * 0.55), seg=40, rings=20)
    for i in range(16):  # stromy na kopcích
        x = -9.5 + i * 1.25 + (0.3 if i % 2 else 0)
        pine(x, 3.6 + 0.3 * math.sin(i), 1.1 + 0.3 * (i % 3), leaf=["#2a6a4a", "#2f7a5a", "#3a8a60"][i % 3])

    # ---------------------------------------------------------- cesta
    way = [(-6.9, -2.9), (-6.9, -2.0), (-6.4, -1.3), (-5.3, -0.75), (-3.9, -0.95), (-2.6, -1.35), (-1.2, -0.95), (0.4, -0.15), (2.0, -0.8), (3.6, -0.8), (5.3, -0.25), (6.2, 0.3)]
    # Catmull-Rom
    P = [way[0]] + way + [way[-1]]
    road = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(12):
            t = k / 12
            road.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in range(2)))
    road.append(way[-1])
    road_ribbon(road, 0.62, M("cesta_o", "#a08c70", roughness=0.95), z=0.008)
    road_ribbon(road, 0.5, M("cesta_s", "#d8c49c", roughness=0.9), z=0.016)
    rnd = random.Random(4)
    for (px, py) in road[::2]:
        box((px + rnd.uniform(-0.18, 0.18), py + rnd.uniform(-0.18, 0.18), 0.022), (rnd.uniform(0.06, 0.1), rnd.uniform(0.05, 0.08), 0.01), M("dlazba", "#bfa883", roughness=0.9), rot=(0, 0, rnd.uniform(0, 3)), bevel=0.002)
    out["road"] = [norm(px, py, 0.05) for px, py in road]
    out["stops"] = [norm(-5.3, -0.55), norm(0.45, -0.1), norm(5.35, -0.15)]

    # ---------------------------------------------------------- most
    bx = -6.9
    for k in range(9):  # oblouk z prken
        u = k / 8
        yy = -2.95 + 0.9 * u
        zz = 0.04 + 0.26 * math.sin(u * math.pi)
        box((bx, yy, zz), (0.7, 0.14, 0.05), M("most", "#9a6a3e", roughness=0.8), bevel=0.006)
    for sx in (-1, 1):
        bar((bx + sx * 0.36, -2.95, 0.07), (bx + sx * 0.36, -2.05, 0.07), 0.02, M("mostr", "#7a4a2e"), verts=6)
        for k in range(5):
            u = k / 4
            yy = -2.95 + 0.9 * u
            zz = 0.04 + 0.26 * math.sin(u * math.pi)
            bar((bx + sx * 0.36, yy, zz), (bx + sx * 0.36, yy, zz + 0.2), 0.014, M("mostr", "#7a4a2e"), verts=6)
        bar((bx + sx * 0.36, -2.95, 0.23), (bx + sx * 0.36, -2.05, 0.23), 0.014, M("mostr", "#7a4a2e"), verts=6)
    out["bridge"] = norm(bx, -2.5, 0.3)

    # ---------------------------------------------------------- budova 1: škola a knihovna
    sx0, sy0 = -5.3, 1.05
    wall1 = M("skola", "#f6dca0", roughness=0.8)
    box((sx0, sy0, 0.07), (3.0, 1.7, 0.14), stone_material("sokl", "#a79fb4", scale=26, strength=0.3), bevel=0.01)
    box((sx0, sy0, 0.75), (2.9, 1.6, 1.3), wall1, bevel=0.012)
    box((sx0 - 1.45, sy0, 0.7), (0.0001, 1, 1), wall1)  # drobnost: nic
    gable_wall(sx0, sy0, 1.4, 2.9, 1.6, 0.6, wall1, "x")
    gable(sx0, sy0, 1.4, 2.9, 1.6, 0.6, M("strecha1", "#d6453a", roughness=0.5), along="x", over=0.14)
    # hodinová věž uprostřed
    box((sx0, sy0 - 0.25, 1.85), (0.8, 0.8, 1.0), M("zd_veze1", "#fbe6b4", roughness=0.8), bevel=0.012)
    cone((sx0, sy0 - 0.25, 2.65), 0.62, 0.0, 0.85, M("st_veze1", "#d6453a", roughness=0.5), verts=4, rot=(0, 0, math.pi / 4))
    sphere((sx0, sy0 - 0.25, 3.1), 0.05, M("kl", "#ffd24d", roughness=0.3, metallic=0.6), seg=10, rings=8)
    cyl((sx0, sy0 - 0.66, 2.0), 0.24, 0.05, M("cifer", "#fff8e8", roughness=0.4), rot=(math.radians(90), 0, 0))
    bar((sx0, sy0 - 0.7, 2.0), (sx0, sy0 - 0.7, 2.16), 0.012, M("rucka", "#2a2438"), verts=6)
    bar((sx0, sy0 - 0.7, 2.0), (sx0 + 0.1, sy0 - 0.7, 2.0), 0.012, M("rucka", "#2a2438"), verts=6)
    window(sx0, sy0 - 0.66 - 0.0, 2.38, w=0.18, h=0.24, face=-1)
    # velké obloukové dveře a okna se záclonami
    door(sx0, sy0 - 0.8, 0.0, w=0.5, h=0.72, color="#7a4a8a", trim="#fff6e6")
    for k, wx in enumerate((-1.05, -0.5, 0.5, 1.05)):
        window(sx0 + wx, sy0 - 0.8, 0.8, w=0.28, h=0.42, shutters="#4aa9d6")
    # nápis: knihy nad dveřmi (otevřená kniha na štítku)
    box((sx0, sy0 - 0.84, 1.18), (0.78, 0.05, 0.22), M("stitek", "#7a4a8a", roughness=0.6), bevel=0.01)
    box((sx0 - 0.1, sy0 - 0.88, 1.18), (0.16, 0.02, 0.15), M("kniha_s", "#fff6e0"), bevel=0, rot=(0, 0.12, 0))
    box((sx0 + 0.1, sy0 - 0.88, 1.18), (0.16, 0.02, 0.15), M("kniha_s", "#fff6e0"), bevel=0, rot=(0, -0.12, 0))
    # rozcestník s předměty (krok 1: Vyber kurz)
    px_, py_ = sx0 + 1.75, sy0 - 1.05
    bar((px_, py_, 0), (px_, py_, 0.85), 0.03, M("rozc", "#7a4a2e"), verts=8)
    for k, (c, off, rot) in enumerate((("#ffc933", 0.7, 0.1), ("#ff6f91", 0.52, -0.12), ("#3b9bff", 0.34, 0.08))):
        box((px_ + 0.12, py_ - 0.03, off), (0.34, 0.03, 0.13), M("rz" + c, c, roughness=0.55), rot=(0, 0, rot), bevel=0.01)
    # hromádka knih a globus před školou
    for k, c in enumerate(("#ff5a3c", "#3b9bff", "#ffd24d")):
        box((sx0 - 1.75, sy0 - 0.95 + 0.0, 0.06 + k * 0.07), (0.3 - k * 0.03, 0.2, 0.065), M("kn" + c, c, roughness=0.6), rot=(0, 0, 0.2 * k), bevel=0.006)
    sphere((sx0 - 1.45, sy0 - 1.0, 0.2), 0.16, M("glob", "#3b9bff", roughness=0.4), seg=20, rings=14)
    torus((sx0 - 1.45, sy0 - 1.0, 0.2), 0.19, 0.012, M("glob_o", "#c9922e", roughness=0.35, metallic=0.6), rot=(0.4, 0, 0.3))
    cyl((sx0 - 1.45, sy0 - 1.0, 0.04), 0.1, 0.06, M("glob_p", "#7a4a2e"))
    c1 = chimney(sx0 + 1.05, sy0 + 0.1, 1.55, h=0.35)
    out["chimneys"] = [c1]
    out["b1_door"] = norm(sx0, sy0 - 0.85, 0.3)

    # ---------------------------------------------------------- budova 2: herna / arkáda
    ax, ay = 0.45, 1.35
    wall2 = M("herna", "#5b3fc8", roughness=0.6)
    box((ax, ay, 0.07), (2.8, 1.6, 0.14), stone_material("sokl", "#a79fb4", scale=26, strength=0.3), bevel=0.01)
    box((ax, ay, 0.8), (2.7, 1.5, 1.4), wall2, bevel=0.015)
    # zaoblená střecha: půlválec přes celou šířku
    cyl((ax, ay, 1.5), 0.78, 2.78, M("herna_s", "#4a43b0", roughness=0.5), verts=32, rot=(0, math.radians(90), 0))
    # neonový obrys a velké play
    for k in range(2):
        bar((ax - 1.35, ay - 0.78, 1.52 - k * 0.0), (ax + 1.35, ay - 0.78, 1.52), 0.025, G("neon_r", "#ff5fa2", 7.0), verts=8)
    for sx in (-1, 1):
        bar((ax + sx * 1.34, ay - 0.78, 0.15), (ax + sx * 1.34, ay - 0.78, 1.5), 0.022, G("neon_c", "#35d0ff", 7.0), verts=8)
    box((ax, ay - 0.79, 1.16), (1.4, 0.04, 0.28), M("tabule", "#1a123a", roughness=0.4), bevel=0.01)
    for k, c in enumerate(("#ff5fa2", "#ffd24d", "#35d0ff", "#7ee0b0", "#ff8a3c")):  # blikající žárovky
        sphere((ax - 0.56 + k * 0.28, ay - 0.82, 1.16), 0.045, G("zar%d" % k, c, 9.0), seg=10, rings=8)
    # trojúhelník play na střeše + joystick
    cone((ax - 0.55, ay - 0.4, 2.15), 0.34, 0.34, 0.1, G("play", "#35d0ff", 6.0), verts=3, rot=(math.radians(90), 0, math.radians(90)))
    # (joystick)
    cyl((ax + 0.55, ay - 0.4, 2.0), 0.26, 0.12, M("js_z", "#2a2a3e", roughness=0.4), verts=24)
    bar((ax + 0.55, ay - 0.4, 2.02), (ax + 0.62, ay - 0.4, 2.55), 0.045, M("js_t", "#cfd6ee", roughness=0.3, metallic=0.5), verts=10)
    sphere((ax + 0.63, ay - 0.4, 2.62), 0.15, M("js_k", "#e8383d", roughness=0.25), seg=20, rings=14)
    # vchod: dveře s okny a automaty vevnitř
    door(ax, ay - 0.78, 0.0, w=0.62, h=0.72, color="#ff5fa2", trim="#ffffff", arch=False, knob="#ffffff")
    for sx in (-1, 1):
        window(ax + sx * 1.0, ay - 0.78, 0.62, w=0.4, h=0.5, glow_c="#8fe8ff", strength=5.0, trim="#2d2a6e")
    # automaty před budovou
    for k, c in enumerate(("#ff3b6a", "#35d0ff")):
        px_ = ax - 1.62 - k * 0.0 + (0 if k == 0 else 3.2)
        box((px_, ay - 1.15, 0.4), (0.34, 0.3, 0.8), M("aut" + c, c, roughness=0.45), bevel=0.015)
        box((px_, ay - 1.31, 0.52), (0.26, 0.02, 0.2), G("aut_s" + c, "#d6fff2", 4.0), bevel=0)
        box((px_, ay - 1.3, 0.34), (0.26, 0.04, 0.07), M("aut_p", "#1a123a"), bevel=0)
        sphere((px_ - 0.06, ay - 1.34, 0.34), 0.025, M("aut_t", "#ffd24d"), seg=8, rings=6)
    # lampiony nad vchodem
    pts = [(ax - 1.3 + 2.6 * i / 9, ay - 0.95, 1.38 - 0.07 * math.sin(i / 9 * math.pi)) for i in range(10)]
    for i, p in enumerate(pts):
        sphere(p, 0.03, G("lam%d" % (i % 3), ["#ffd24d", "#ff5fa2", "#35d0ff"][i % 3], 8.0), seg=8, rings=6)
    out["b2_door"] = norm(ax, ay - 0.8, 0.3)
    out["neon"] = [norm(ax, ay - 0.9, 1.3)]

    # ---------------------------------------------------------- budova 3: věž s pohárem + strom růstu
    tx, ty = 5.45, 1.0
    cyl((tx, ty, 0.07), 1.0, 0.14, stone_material("sokl", "#a79fb4", scale=26, strength=0.3), verts=40)
    tower = stone_material("veze_k", "#e8d9c4", scale=30, strength=0.3, roughness=0.8)
    cyl((tx, ty, 1.35), 0.78, 2.5, tower, verts=40)
    for k in range(6):  # pásy kamenů
        torus((tx, ty, 0.5 + k * 0.4), 0.785, 0.012, M("kampas", "#bfae98", roughness=0.9))
    cyl((tx, ty, 2.7), 0.92, 0.12, M("vez_pr", "#c9b8a0", roughness=0.8), verts=40)
    cone((tx, ty, 3.35), 0.95, 0.0, 1.2, M("vez_st", "#1fb8a8", roughness=0.45), verts=40)
    for k in range(8):
        a = k * math.tau / 8
        bar((tx + 0.62 * math.cos(a), ty + 0.62 * math.sin(a), 2.72), (tx, ty, 3.95), 0.008, M("vez_zebro", "#14867a"), verts=5)
    # pohár na špici
    pts = [(0, 0), (0.1, 0.02), (0.11, 0.07), (0.04, 0.1), (0.035, 0.2), (0.12, 0.26), (0.19, 0.46), (0.17, 0.47), (0.1, 0.44), (0.04, 0.34)]
    cup = bpy.data.meshes.new("pohar")
    bm = bmesh.new()
    prof = [bm.verts.new((x, 0, z)) for x, z in pts]
    for i in range(len(prof) - 1):
        bm.edges.new((prof[i], prof[i + 1]))
    bmesh.ops.spin(bm, geom=list(bm.verts) + list(bm.edges), cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=28)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bm.to_mesh(cup)
    bm.free()
    co = bpy.data.objects.new("pohar", cup)
    sc.collection.objects.link(co)
    co.location = (tx, ty, 3.97)
    co.data.materials.append(M("pohar_z", "#ffc933", roughness=0.2, metallic=0.85))
    for p in cup.polygons:
        p.use_smooth = True
    for sx in (-1, 1):  # uši poháru
        torus((tx + sx * 0.17, ty, 4.27), 0.07, 0.014, M("pohar_z", "#ffc933", roughness=0.2, metallic=0.85), rot=(math.radians(90), 0, 0))
    out["pohar"] = norm(tx, ty, 4.2)
    # okna věže (lomená) + dveře
    for k, zz in enumerate((1.3, 2.05)):
        for a_ in (-0.35, 0.35):
            window(tx + math.sin(a_) * 0.77, ty - math.cos(a_) * 0.77, zz, w=0.2, h=0.36, strength=4.0)
    door(tx, ty - 0.78, 0.0, w=0.46, h=0.7, color="#1f5c6e", trim="#fff6e6")
    # schody z kamenných stupňů s rostoucími rostlinami (růst = krok 3)
    for k in range(4):
        box((tx, ty - 1.0 - k * 0.0, 0.07 + k * 0.0), (0.1, 0.1, 0.01), M("kam", "#8a8494"), bevel=0)
    for k in range(3):
        px_ = tx - 1.55 + k * 0.38
        py_ = ty - 1.3
        cyl((px_, py_, 0.07), 0.11 - 0.0, 0.14, M("kvetn", "#d8744a", roughness=0.7), verts=14)
        n = k + 1
        bar((px_, py_, 0.14), (px_, py_, 0.14 + 0.1 * n), 0.014, M("stonek", "#3f8f4a"), verts=6)
        for j in range(n + 1):
            a = j * math.tau / (n + 1)
            sphere((px_ + 0.1 * math.cos(a) * (0.6 + 0.2 * n), py_ + 0.1 * math.sin(a) * (0.6 + 0.2 * n), 0.2 + 0.1 * n), 0.06 + 0.02 * n, M("list" + str(j % 2), ["#4fb560", "#69cf72"][j % 2], roughness=0.6), scale=(1, 0.6, 0.5), seg=10, rings=8)
        if k == 2:
            sphere((px_, py_, 0.2 + 0.1 * n + 0.06), 0.05, G("hvezda", "#ffd24d", 5.0), seg=10, rings=8)
    # velký strom růstu se zlatými plody vedle věže
    gx, gy = tx + 1.7, ty - 0.6
    cyl((gx, gy, 0.5), 0.1, 1.0, M("kmen", "#7a5636", roughness=0.9), verts=14)
    for k, (dx, dy, dz, r, c) in enumerate(((0, 0, 1.25, 0.65, "#3fa752"), (0.38, 0.1, 1.05, 0.46, "#59c460"), (-0.38, 0.0, 1.1, 0.5, "#4fb560"), (0.05, 0.15, 1.7, 0.45, "#69cf72"))):
        sphere((gx + dx, gy + dy, dz), r, M("korun%d" % k, c, roughness=0.6), seg=24, rings=16)
    r_ = random.Random(9)
    for k in range(10):
        a = r_.uniform(0, math.tau)
        sphere((gx + 0.55 * math.cos(a), gy - 0.4 - 0.1 * abs(math.sin(a)), 1.1 + r_.uniform(0, 0.7)), 0.05, G("plod", "#ffd24d", 4.0), seg=10, rings=8)
    out["strom"] = norm(gx, gy, 1.5)
    # vlajky na věži
    for k, (a_, c) in enumerate(((0.9, "#ff4d5e"), (-0.9, "#3b9bff"))):
        px_, py_ = tx + math.sin(a_) * 0.95, ty - 0.4
        pole((px_, py_, 2.7), (px_, py_, 3.45), r=0.012)
        box((px_ + 0.15, py_, 3.3), (0.28, 0.01, 0.18), M("vl" + c, c, roughness=0.5), bevel=0)
    out["b3_door"] = norm(tx, ty - 0.8, 0.3)
    out["flags"] = [norm(tx + 0.7, ty - 0.4, 3.4), norm(tx - 0.7, ty - 0.4, 3.4)]

    # ---------------------------------------------------------- menší domky
    chims = []
    specs = [
        (-7.9, 1.9, 1.3, 1.0, 0.75, "#f7a8a0", "#b8453a", 0.5, "x", (0.3, 0.1), 2),
        (-3.1, 2.15, 1.45, 1.1, 0.85, "#cfe8a8", "#7a4a8a", 0.55, "y", (-0.3, 0.1), 2),
        (-1.45, 2.55, 1.2, 0.95, 0.7, "#ffe6a8", "#d6453a", 0.5, "x", None, 2),
        (3.0, 2.35, 1.3, 1.0, 0.8, "#b8d8f7", "#3b6fd8", 0.55, "x", (0.35, 0.0), 2),
        (7.5, 0.55, 1.4, 1.1, 0.85, "#f7d0a0", "#b8453a", 0.55, "y", (-0.3, 0.05), 2),
        (7.2, 2.1, 1.2, 0.95, 0.7, "#e6c8f7", "#5b3fc8", 0.5, "x", None, 2),
        (-6.3, 3.0, 1.1, 0.9, 0.65, "#ffd1b8", "#c95a3a", 0.45, "x", (0.25, 0.0), 1),
    ]
    for (hx, hy, hw, hd, hh, wc, rc, rh, al, ch, nw) in specs:
        r = house(hx, hy, hw, hd, hh, wc, rc, rh=rh, along=al, chim=ch, wins=nw, shutter="#5fb0c9" if rc[1] in "5b" else "#ffffff")
        if r:
            chims.append(r)
    # pekárna s komínem (pekař) vedle náměstí
    bx_, by_ = -2.2, 0.85
    r = house(bx_, by_, 1.5, 1.1, 0.85, "#ffe0b0", "#a8574a", rh=0.5, along="x", chim=(0.45, 0.2), wins=1, door_x=-0.35)
    chims.append(r)
    box((bx_ + 0.3, by_ - 0.6, 0.55), (0.5, 0.05, 0.28), M("pek_ot", "#fff2cc"), bevel=0.01)
    # pečivo: bochník nad dveřmi
    sphere((bx_ - 0.35, by_ - 0.62, 0.7), 0.07, M("chleb", "#d8944a", roughness=0.5), scale=(1.5, 0.8, 0.8), seg=10, rings=8)
    out["chimneys"] += chims

    # ---------------------------------------------------------- mlýn (lopatky kreslí web)
    mx, my = -0.9, 3.1
    cyl((mx, my, 0.65), 0.45, 1.2, M("mlyn", "#f3d9a2", roughness=0.8), verts=24)
    cone((mx, my, 1.55), 0.5, 0.0, 0.7, M("mlyn_s", "#8a4a2e", roughness=0.6), verts=24)
    sphere((mx, my - 0.42, 1.25), 0.07, M("mlyn_h", "#4a3a2a"), seg=10, rings=8)
    door(mx, my - 0.44, 0.0, w=0.3, h=0.46, color="#8a5a34")
    window(mx, my - 0.43, 0.85, w=0.18, h=0.24)
    out["mlyn"] = norm(mx, my - 0.5, 1.25)

    # ---------------------------------------------------------- náměstí s fontánou
    fx, fy = -2.7, -0.15
    cyl((fx, fy, 0.05), 0.6, 0.1, M("fon_n", "#bfae98", roughness=0.85), verts=36)
    cyl((fx, fy, 0.16), 0.45, 0.14, stone_material("fon_k", "#c9c2d6", scale=24, strength=0.25), verts=36)
    cyl((fx, fy, 0.2), 0.38, 0.1, water, verts=36)
    cyl((fx, fy, 0.45), 0.09, 0.5, stone_material("fon_k", "#c9c2d6", scale=24, strength=0.25), verts=16)
    cyl((fx, fy, 0.74), 0.24, 0.07, stone_material("fon_k", "#c9c2d6", scale=24, strength=0.25), verts=28)
    cyl((fx, fy, 0.76), 0.2, 0.05, water, verts=28)
    sphere((fx, fy, 0.9), 0.07, M("fon_b", "#e8e4f4", roughness=0.3), seg=14, rings=10)
    out["fontana"] = norm(fx, fy, 0.9)

    # ---------------------------------------------------------- trh
    for k, (sx_, c1_, c2_) in enumerate(((2.15, "#ff5a3c", "#ffffff"), (3.15, "#3b9bff", "#ffffff"))):
        sy_ = -0.35 - 0.0 * k
        for dx in (-0.34, 0.34):
            for dy in (-0.2, 0.2):
                bar((sx_ + dx, sy_ + dy, 0), (sx_ + dx, sy_ + dy, 0.6), 0.015, M("trh_t", "#7a4a2e"), verts=6)
        box((sx_, sy_, 0.32), (0.78, 0.42, 0.06), M("trh_d", "#c79a5e"), bevel=0.008)
        for i in range(6):  # pruhovaná stříška
            box((sx_ - 0.325 + i * 0.13, sy_, 0.66 + 0.01 * (i % 2)), (0.13, 0.55, 0.03), M("pr" + c1_ + str(i % 2), c1_ if i % 2 == 0 else c2_, roughness=0.6), rot=(0.18, 0, 0), bevel=0)
        for i in range(3):
            sphere((sx_ - 0.22 + i * 0.22, sy_ - 0.02, 0.4), 0.07, M("ovoce%d%d" % (k, i), ["#ff5a3c", "#ffd24d", "#7ee0b0"][(i + k) % 3], roughness=0.4), seg=10, rings=8)
    # sudy a bedny
    cyl((1.55, -0.55, 0.14), 0.13, 0.28, M("sud", "#8a5a34", roughness=0.7), verts=16)
    box((3.85, -0.5, 0.1), (0.22, 0.22, 0.2), M("bedna", "#c79a5e"), rot=(0, 0, 0.3))

    # ---------------------------------------------------------- ohrady, pastviny, louka před řekou
    fence(2.4, -3.2, 7.4, -3.2)
    fence(2.4, -3.2, 2.4, -5.2)
    fence(7.4, -3.2, 7.4, -5.2)
    fence(2.4, -5.2, 7.4, -5.2)
    cyl((4.6, -4.2, 0.05), 0.55, 0.06, M("louze", "#3b9bff", roughness=0.1), verts=24)  # napajedlo/jezírko
    box((6.8, -3.7, 0.17), (0.5, 0.3, 0.34), M("seno", "#f2c14a", roughness=0.95), bevel=0.02)
    for k in range(4):
        box((-3.5 + k * 0.36, -3.6, 0.05), (0.3, 0.32, 0.1), M("zahon", "#7a4a2a", roughness=1.0), bevel=0.01)
        for j in range(4):
            sphere((-3.62 + k * 0.36 + j * 0.08, -3.6, 0.13), 0.04, M("zel", "#4fb560"), seg=8, rings=6)
    # stromy a keře po městečku
    for (x, y, kind) in ((-9.2, -0.4, "r"), (-8.3, 0.6, "p"), (8.8, -0.2, "r"), (9.3, 1.2, "p"), (-4.4, 3.0, "r"), (1.9, 3.2, "p"), (-9, -3.8, "r"), (9, -4.6, "r"), (0.2, -4.6, "r"), (-6, -4.6, "p")):
        (roundtree if kind == "r" else pine)(x, y, 1.0 + 0.2 * ((int(x * 3) % 3)))
    for (x, y) in ((-7.1, 1.0), (-3.7, 0.7), (1.8, 0.3), (4.1, 2.0), (6.9, 1.2), (-0.1, 0.1)):
        bush(x, y, 1.3)
    flowers(-5.3, -1.5, 3.0, 0.5, 14, seed=2)
    flowers(0.45, -1.0, 3.0, 0.4, 12, seed=3)
    flowers(5.3, -1.2, 3.0, 0.5, 12, seed=5)
    rocks(-8.3, -1.4, 4, 1.3, seed=1)
    rocks(8.2, -2.0, 3, 1.0, seed=2)
    rocks(-8.0, -2.3, 3, 1.0, seed=3)
    # lampy podél cesty
    lamps = []
    for (x, y) in ((-6.3, -0.8), (-4.0, -1.5), (-1.6, -1.55), (1.2, -0.9), (3.0, -1.35), (4.5, -0.9), (6.5, 0.0)):
        lamps.append(lamp(x, y))
    out["lamps"] = lamps
    # sloupek s tabulí „VÍTEJTE“ u mostu: tabule bez textu, šipka
    bar((-7.6, -1.5, 0), (-7.6, -1.5, 0.7), 0.025, M("rozc", "#7a4a2e"), verts=8)
    box((-7.45, -1.52, 0.65), (0.4, 0.03, 0.14), M("rz#ffc933", "#ffc933", roughness=0.55), bevel=0.01)
    # kotvy pro web (polohy zvířat, lavičky, hnízda, špičky střech)
    out["pastvina"] = [norm(3.4, -4.3), norm(5.4, -4.5), norm(6.3, -3.9), norm(4.2, -3.6)]
    out["louka"] = [norm(-8.5, -4.6), norm(-4.5, -5.0), norm(0.0, -5.6), norm(-2.5, -4.2)]
    out["strechy"] = [norm(sx0 - 1.0, sy0 + 0.0, 2.0), norm(sx0 + 1.2, sy0, 2.0), norm(-3.1, 2.15, 1.6), norm(7.5, 0.55, 1.6), norm(3.0, 2.35, 1.6), norm(ax - 1.0, ay, 2.1)]
    out["sopka"] = norm(2.6, 3.9, 0.0)
    out["mraky_y"] = [0.06, 0.12, 0.2]

    os.makedirs(os.path.join(OUT, "mesto_scena"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "mesto_scena", "paths.json"), "w"))
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, "mesto_scena")


JOBS = {"scena": build_world}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS] or ["scena"]:
        JOBS[w]()
