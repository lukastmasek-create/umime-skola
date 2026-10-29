"""Městečko jako hub (stránka /mestecko): větší denní městečko s hlavní ulicí, druhou řadou domů, parkem, schody na kopec
s vchody do pohádkového lesa a hradu, přístavem a lagunou dole a startovací rampou rakety. Domovní štíty (prázdné desky) vykreslí
web s názvy sekcí. Stavební prvky bere z mestecko.py (úvodní městečko se nemění). Průhledný obrázek 2000 × 2100.
Spuštění: python mestecko_hub.py [--preview]    Výstup: out/mesto_hub/f_0001.png a out/mesto_hub/kotvy.json
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mestecko import *

W, H = (1000, 1050) if PREVIEW else (2000, 2100)
PPU = W / UNITS


def project(x, y, z):
    return (W / 2 + PPU * x, H / 2 - PPU * (y * math.sin(EL) + (z - TZ) * math.cos(EL)))


def norm(x, y, z=0.0):
    px, py = project(x, y, z)
    return [round(px / W, 5), round(py / H, 5)]


TZ = 3.7   # střed záběru: hlavní ulice uprostřed, louka s přístavem dole, terasa s vchody nahoře


_orig_house = house
KOMINY = []
LAMPY = []


def house(x, y, w, d, h, wall, roof, rh=0.55, along="x", chim=None, **kw):
    """Domek z mestecko.py; navíc si pamatuje polohu komína pro kouř na webu."""
    r = _orig_house(x, y, w, d, h, wall, roof, rh=rh, along=along, chim=chim, **kw)
    if chim is not None:
        KOMINY.append(norm(x + chim[0], y + chim[1], h + rh * 0.45 + 0.42))
    return r


def lamp(x, y, strength=6.0):
    """Pouliční lampa; kotvu světla si pamatuje pro noc na webu."""
    from mestecko import lamp as _lamp
    _lamp(x, y, strength)
    LAMPY.append(norm(x, y, 0.62))


def sign(x, y, z, w=1.1, h=0.34, rot=0.0, color="#7a4a2e", face=-1):
    """Prázdná dřevěná cedule (text doplní web); vrací kotvu středu."""
    box((x, y, z), (w + 0.1, 0.07, h + 0.1), M("cedule_ram", "#4a2e1a", 0.7), rot=(0, 0, rot), bevel=0.02)
    box((x, y + face * 0.045, z), (w, 0.03, h), M("cedule_" + color, color, 0.6), rot=(0, 0, rot), bevel=0.01)
    return norm(x, y + face * 0.07, z)


def build_world():
    sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name="mesto_hub", world=("#cfe3ff", 1.0), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.55
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    add_sun((math.radians(52), math.radians(8), math.radians(-40)), energy=4.2, color="#fff0d8", angle=0.2)
    add_area((-6, -10, 8), (0, 0, 1), energy=900, size=12, color="#bcd4ff")
    add_area((8, 4, 10), (0, 0, 1), energy=300, size=10, color="#ffe8c0")
    out = {"w": W, "h": H, "ppu": PPU, "tz": TZ}
    out["places"] = {}
    places = out["places"]

    # ---------------------------------------------------------- terén
    grass = M("trava", "#5db566", roughness=0.85)
    grass2 = M("trava2", "#6cc472", roughness=0.85)
    water = bpy.data.materials.new("voda")
    water.use_nodes = True
    wb = water.node_tree.nodes["Principled BSDF"]
    wb.inputs["Base Color"].default_value = hex_rgba("#59b8ff")
    wb.inputs["Roughness"].default_value = 0.08
    wb.inputs["Emission Color"].default_value = hex_rgba("#5fd0ff")
    wb.inputs["Emission Strength"].default_value = 0.8
    stone_m = stone_material("zdi_h", "#a79fb4", scale=26, strength=0.3)
    box((0, 8.2, -0.5), (26, 20.8, 1.0), grass, bevel=0)             # městečko: y -2.2 .. 18.6
    box((0, -4.45, -0.5), (26, 3.1, 1.0), grass2, bevel=0)           # louka pod řekou: y -6.0 .. -2.9
    box((5.5, -8.6, -0.5), (15, 5.2, 1.0), grass2, bevel=0)          # louka vpravo od zátoky (y -11.2 .. -6.0)
    # řeka
    box((0, -2.55, -0.12), (26, 0.7, 0.12), water, bevel=0)
    box((0, -2.55, -0.45), (26, 0.7, 0.5), M("dno", "#3a6a9a"), bevel=0)
    for sy in (-2.9, -2.2):
        box((0, sy, 0.0), (26, 0.12, 0.12), stone_m, bevel=0.02)
    # zátoka vlevo dole (přístav) a její kamenná hráz
    box((-7.5, -8.6, -0.12), (11, 5.2, 0.12), water, bevel=0)
    box((-7.5, -8.6, -0.5), (11, 5.2, 0.6), M("dno", "#3a6a9a"), bevel=0)
    box((-2.0, -8.6, -0.15), (0.3, 5.2, 0.3), stone_m, bevel=0.02)
    box((-7.5, -6.0, -0.15), (11, 0.3, 0.3), stone_m, bevel=0.02)
    # terasa nahoře s vchody do lesa a hradu, schody k ní
    box((0, 12.2, 0.4), (26, 3.2, 0.8), grass2, bevel=0.02)
    box((0, 15.4, 0.9), (26, 3.2, 1.8), grass, bevel=0.02)
    for sx in (-3.6, 3.6):
        box((sx, 10.15, 0.4), (1.7, 1.25, 0.1), stone_m, rot=(0.7, 0, 0), bevel=0.01)
        for k in range(5):
            box((sx, 9.6 + 0.2 * k, 0.08 * (k + 1)), (1.8, 0.2, 0.04), M("stupen", "#c9c2d6", 0.8), bevel=0.005)
        for s2 in (-1, 1):
            bar((sx + s2 * 0.9, 9.45, 0.05), (sx + s2 * 0.9, 10.65, 0.8), 0.03, M("zabr", "#7a4a2e"), verts=6)
    for i in range(18):  # stromy a keře na terase a za ní
        x = -11 + i * 1.3 + (0.3 if i % 2 else 0)
        (pine if i % 3 else roundtree)(x, 16.4 + 0.5 * math.sin(i * 2), 1.2 + 0.3 * (i % 3), leaf=["#2a6a4a", "#2f7a5a", "#3a8a60"][i % 3]) if i % 3 else roundtree(x, 16.2 + 0.4 * math.sin(i), 1.3)

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
    # ---------------------------------------------------------- cesty a mosty (graf pro hrdinu na webu)
    graph = {"nodes": {}, "edges": []}

    def node(name, x, y, z=0.0):
        graph["nodes"][name] = norm(x, y, z)
        graph.setdefault("world", {})[name] = [x, y]

    def link(*names):
        for a, b in zip(names, names[1:]):
            graph["edges"].append([a, b])

    def trail(pts, width=0.5, z=0.01):
        P = [pts[0]] + list(pts) + [pts[-1]]
        r = []
        for i in range(1, len(P) - 2):
            p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
            for k in range(8):
                t = k / 8
                r.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in range(2)))
        r.append(pts[-1])
        # souvislé pásky (obrys a povrch) s jednotnou orientací ploch
        def ribbon(w, zz, mat, name):
            pts_ = [r[0]] + [q for k, q in enumerate(r[1:], 1) if math.hypot(q[0] - r[k - 1][0], q[1] - r[k - 1][1]) > 1e-4]
            left, right = [], []
            for i, (x, y) in enumerate(pts_):
                a_ = pts_[max(i - 1, 0)]
                b_ = pts_[min(i + 1, len(pts_) - 1)]
                tx, ty = b_[0] - a_[0], b_[1] - a_[1]
                ln = math.hypot(tx, ty) or 1.0
                nx, ny = -ty / ln, tx / ln
                left.append((x + nx * w / 2, y + ny * w / 2, zz))
                right.append((x - nx * w / 2, y - ny * w / 2, zz))
            verts = left + right
            n_ = len(pts_)
            faces = [(i, n_ + i, n_ + i + 1, i + 1) for i in range(n_ - 1)]
            return mesh_obj(name, verts, faces, mat, smooth=False)

        ribbon(width + 0.12, z + 0.014, M("cesta_o", "#a08c70", roughness=0.95), "trail_o")
        ribbon(width, z + 0.022, M("cesta_s", "#d8c49c", roughness=0.9), "trail_s")
        return r

    # hlavní ulice (jako na úvodní stránce) a uzly před budovami
    node("most_z", -6.9, -2.2)
    node("m1", -6.4, -1.3)
    node("m2", -5.3, -0.75)
    node("kurzy", -5.3, 0.15)
    node("m3", -3.9, -0.95)
    node("m4", -2.6, -1.35)
    node("m5", -1.2, -0.95)
    node("hub", 0.4, -0.15)
    node("hry", 0.45, 0.45)
    node("m7", 2.0, -0.8)
    node("obchod", 2.65, -0.85)
    node("m8", 3.6, -0.8)
    node("m9", 5.3, -0.25)
    node("zebricky", 5.45, 0.2)
    node("c1", 4.05, -0.5)
    link("most_z", "m1", "m2", "m3", "m4", "m5", "hub", "m7", "obchod", "m8", "m9")
    link("m2", "kurzy")
    link("hub", "hry")
    link("m9", "zebricky")
    link("m8", "c1")
    trail([(-6.9, -2.9), (-6.9, -2.0), (-6.4, -1.3), (-5.3, -0.75), (-3.9, -0.95), (-2.6, -1.35), (-1.2, -0.95), (0.4, -0.15), (2.0, -0.8), (3.6, -0.8), (5.3, -0.25), (6.2, 0.3)], 0.62)
    # horní ulice za domy, schody na terasu
    node("c2", 4.05, 3.9)
    node("u4", 4.05, 4.9)
    node("u3", 0.2, 5.1)
    node("u2", -3.6, 4.9)
    node("u1", -6.6, 4.9)
    node("u5", 7.0, 4.7)
    link("c1", "c2", "u4", "u3", "u2", "u1")
    link("u4", "u5")
    trail([(4.05, -0.5), (4.05, 1.5), (4.05, 3.9), (4.05, 4.9)], 0.5)
    trail([(-7.2, 4.8), (-6.6, 4.9), (-3.6, 4.9), (0.2, 5.1), (4.05, 4.9), (7.4, 4.7)], 0.55)
    # druhá řada: observatoř (studovna), pokojík, domek na stromě
    node("uceni", -5.0, 6.5)
    node("pokoj", -1.7, 6.3)
    node("profil", 7.4, 6.6)
    link("u1", "uceni")
    link("u3", "pokoj")
    link("u5", "profil")
    trail([(-6.6, 4.9), (-5.9, 5.6), (-5.0, 6.5)], 0.45)
    trail([(0.2, 5.1), (-0.6, 5.7), (-1.7, 6.3)], 0.45)
    trail([(7.0, 4.7), (7.3, 5.6), (7.4, 6.6)], 0.45)
    # schody na terasu a vchody do lesa a hradu
    node("s1", -3.6, 8.2)
    node("t1", -3.6, 11.3)
    node("t2", 3.6, 11.3)
    node("s2", 3.6, 8.2)
    node("les", -6.0, 11.2)
    node("hrad", 5.8, 11.2)
    link("u2", "s1", "t1", "les")
    link("u4", "s2", "t2", "hrad")
    link("t1", "t2")
    trail([(-3.6, 4.9), (-3.6, 8.2), (-3.6, 11.3)], 0.55)
    trail([(3.6, 4.9), (3.6, 8.2), (3.6, 11.3)], 0.55)
    trail([(-3.6, 11.3), (-6.0, 11.2)], 0.5, z=0.82)
    trail([(3.6, 11.3), (5.8, 11.2)], 0.5, z=0.82)
    trail([(-3.6, 11.3), (3.6, 11.3)], 0.5, z=0.82)
    # nástěnka s úkoly u rozcestí
    node("ukoly", -3.7, -1.25)
    link("m3", "ukoly")
    # druhý most k louce dole, přístav, laguna a raketová rampa
    node("most", 0.4, -2.55)
    node("l1", 0.4, -4.3)
    node("l2", -2.0, -6.8)
    node("pristav", -2.6, -8.3)
    node("molo", -5.4, -8.3)
    node("l3", 3.0, -6.6)
    node("stanice", 6.0, -7.1)
    node("more", 0.2, -7.4)
    link("hub", "most", "l1", "l2", "pristav", "molo")
    link("l1", "l3", "stanice")
    link("l1", "more")
    trail([(0.4, -0.15), (0.4, -1.3), (0.4, -2.2), (0.4, -3.2), (0.4, -4.3), (-0.8, -5.6), (-2.0, -6.8), (-2.6, -8.3), (-5.4, -8.3)], 0.55)
    trail([(0.4, -4.3), (1.5, -5.6), (3.0, -6.6), (6.0, -7.1)], 0.5)
    trail([(0.4, -4.3), (0.3, -5.8), (0.2, -7.4)], 0.5)
    for k in range(9):  # prkna mostu
        u = k / 8
        yy = -2.95 + 0.9 * u
        box((0.4, yy, 0.04 + 0.2 * math.sin(u * math.pi)), (0.8, 0.14, 0.05), M("most", "#9a6a3e", roughness=0.8), bevel=0.006)
    for sx in (-1, 1):
        for k in range(5):
            u = k / 4
            yy = -2.95 + 0.9 * u
            bar((0.4 + sx * 0.42, yy, 0.05 + 0.2 * math.sin(u * math.pi)), (0.4 + sx * 0.42, yy, 0.28 + 0.2 * math.sin(u * math.pi)), 0.014, M("mostr", "#7a4a2e"), verts=6)
        bar((0.4 + sx * 0.42, -2.95, 0.28), (0.4 + sx * 0.42, -2.05, 0.28), 0.014, M("mostr", "#7a4a2e"), verts=6)
    out["graf"] = graph

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
    # ====================================================================== nové části městečka
    # ---------------------------------------------------------- cedule hlavních budov (kotvy pro popisky)
    places["kurzy"] = {"door": norm(sx0, sy0 - 0.85, 0.3), "sign": norm(sx0, sy0 - 0.9, 1.18), "w": 0.8}
    places["hry"] = {"door": norm(ax, ay - 0.8, 0.3), "sign": norm(ax, ay - 0.83, 1.16), "w": 1.4}
    places["zebricky"] = {"door": norm(tx, ty - 0.8, 0.3), "sign": sign(tx, ty - 0.8, 1.2, w=1.0, h=0.28, color="#7a4a8a"), "w": 1.0}
    # obchod: stánky a sloup s cedulí
    bar((2.65, -1.15, 0), (2.65, -1.15, 1.15), 0.035, M("rozc", "#7a4a2e"), verts=8)
    places["obchod"] = {"door": norm(2.65, -0.85, 0.2), "sign": sign(2.65, -1.15, 1.1, w=1.3, h=0.34, color="#c0392b"), "w": 1.3}
    # nástěnka s úkoly
    for sx_ in (-1, 1):
        bar((-3.7 + sx_ * 0.62, -1.35, 0), (-3.7 + sx_ * 0.62, -1.35, 1.25), 0.04, M("rozc", "#7a4a2e"), verts=8)
    box((-3.7, -1.38, 0.82), (1.4, 0.06, 0.8), M("nastenka", "#b07d48", 0.8), bevel=0.02)
    for k, (c, dx, dz, r_) in enumerate((("#fff6e0", -0.4, 0.88, 0.1), ("#ffd24d", 0.0, 0.82, -0.08), ("#ff9ac0", 0.4, 0.86, 0.06), ("#9ad8ff", -0.2, 0.62, -0.05), ("#b8f0b0", 0.25, 0.64, 0.1))):
        box((-3.7 + dx, -1.43, dz - 0.1), (0.3, 0.015, 0.34), M("papir" + c, c, 0.8), rot=(0, r_, 0), bevel=0)
        sphere((-3.7 + dx, -1.45, dz + 0.06), 0.022, M("napich", "#e0453a", 0.4), seg=6, rings=4)
    places["ukoly"] = {"door": norm(-3.7, -1.2, 0.3), "sign": sign(-3.7, -1.38, 1.38, w=1.1, h=0.3, color="#ffc933"), "w": 1.1}

    # ---------------------------------------------------------- druhá řada: observatoř, pokojík, domek na stromě, domky
    ox, oy = -5.0, 7.6
    cyl((ox, oy, 0.9), 1.0, 1.8, M("obs_zed", "#efe0c8", 0.8), verts=32)
    box((ox, oy, 0.07), (2.3, 2.3, 0.14), stone_material("sokl", "#a79fb4", scale=26, strength=0.3), bevel=0.01)
    sphere((ox, oy, 1.8), 1.05, M("obs_kupole", "#3b6fd8", 0.35, 0.3), scale=(1, 1, 0.85), seg=32, rings=18)
    box((ox, oy - 0.55, 2.25), (0.42, 0.7, 0.9), M("obs_stin", "#16132b", 0.5), rot=(0.5, 0, 0), bevel=0.01)
    cyl((ox + 0.1, oy - 0.9, 2.55), 0.1, 1.0, M("dalekohled", "#c9ced8", 0.3, 0.8), verts=14, rot=(-0.9, 0, 0))
    door(ox, oy - 1.0, 0.0, w=0.5, h=0.72, color="#3b6fd8")
    for k in (-1, 1):
        window(ox + k * 0.7, oy - 0.75, 1.15, w=0.24, h=0.34, shutters="#ffd24d")
    for a_ in range(6):
        sphere((ox + 1.25 * math.cos(a_ * 1.05 + 0.4), oy - 1.1 + 0.2 * math.sin(a_), 0.1), 0.1, M("kv_h" + str(a_ % 3), ["#ff5fa2", "#ffd24d", "#ffffff"][a_ % 3], 0.5), seg=8, rings=6)
    places["uceni"] = {"door": norm(ox, oy - 1.05, 0.3), "sign": sign(ox, oy - 1.03, 1.55, w=1.2, h=0.3, color="#3b6fd8"), "w": 1.2}

    r_ = house(-1.7, 7.4, 1.7, 1.25, 0.95, "#ffd1b8", "#c95a3a", rh=0.6, along="x", chim=(0.5, 0.1), wins=2, shutter="#5fb0c9", name="pokoj")
    flowers(-1.7, 6.5, 1.8, 0.3, 10, seed=7)
    places["pokoj"] = {"door": norm(-1.7, 6.75, 0.3), "sign": sign(-1.7, 6.77, 1.42, w=1.1, h=0.28, color="#c95a3a"), "w": 1.1}

    tx2, ty2 = 7.4, 7.8   # domek na stromě
    cyl((tx2, ty2, 1.1), 0.5, 2.2, stone_material("kura_h", "#6b4a33", scale=14, strength=0.5), verts=18)
    for k, (dx, dz, rr, c) in enumerate(((-0.6, 2.9, 0.9, "#3fa752"), (0.7, 3.0, 1.0, "#59c460"), (0, 3.8, 1.0, "#4fb560"), (0, 3.0, 1.3, "#3a9a4a"))):
        sphere((tx2 + dx, ty2 + 0.4, dz), rr, M("korun" + str(k), c, 0.6), seg=24, rings=16)
    box((tx2, ty2 - 0.55, 2.0), (1.5, 0.7, 0.1), M("plosina_h", "#9a6a3c", 0.8), bevel=0.02)
    box((tx2, ty2 - 0.55, 2.55), (1.0, 0.6, 0.9), M("domek_h", "#c79256", 0.8), bevel=0.03)
    cone((tx2, ty2 - 0.55, 3.3), 0.9, 0.0, 0.75, M("strecha_h", "#c0392b", 0.5), verts=4, rot=(0, 0, math.pi / 4))
    box((tx2 + 0.2, ty2 - 0.88, 2.6), (0.28, 0.03, 0.34), G("okno_th", "#ffd98a", 4.0), bevel=0)
    for k in range(9):
        box((tx2 + 0.6, ty2 - 0.7, 0.15 + k * 0.2), (0.14, 0.04, 0.04), M("zebrik", "#7a5636", 0.8), bevel=0)
    for sx_ in (-1, 1):
        bar((tx2 + 0.6 + sx_ * 0.07, ty2 - 0.7, 0.1), (tx2 + 0.6 + sx_ * 0.07, ty2 - 0.7, 1.95), 0.02, M("zebrik", "#7a5636", 0.8), verts=6)
    for k in range(8):
        sphere((tx2 - 0.7 + k * 0.2, ty2 - 0.92, 2.1), 0.04, G("lamp_th", ["#ff8ad8", "#ffd24d", "#7ee0b0"][k % 3], 5.0), seg=8, rings=6)
    places["profil"] = {"door": norm(tx2 + 0.1, ty2 - 1.0, 0.3), "sign": sign(tx2 - 0.15, ty2 - 0.55, 1.55, w=1.35, h=0.32, color="#2f8a4a"), "w": 1.35}

    for (hx, hy, hw, hd, hh, wc, rc, rh, al, ch, nw) in [
        (-8.0, 7.2, 1.3, 1.0, 0.8, "#f7d0a0", "#b8453a", 0.5, "x", (0.3, 0.1), 2),
        (4.2, 7.0, 1.5, 1.1, 0.85, "#cfe8a8", "#7a4a8a", 0.55, "x", (-0.3, 0.1), 2),
        (-3.4, 9.2, 1.4, 1.0, 0.8, "#b8d8f7", "#3b6fd8", 0.55, "y", (0.3, 0.0), 2),
        (0.3, 9.6, 1.6, 1.1, 0.9, "#ffe6a8", "#d6453a", 0.55, "x", (0.4, 0.1), 2),
        (6.4, 9.6, 1.3, 1.0, 0.8, "#f7a8a0", "#b8453a", 0.5, "x", None, 2),
        (-7.0, 9.8, 1.2, 0.95, 0.7, "#e6c8f7", "#5b3fc8", 0.5, "x", (0.2, 0.0), 2),
        (2.8, 6.2, 1.1, 0.9, 0.65, "#ffd1b8", "#c95a3a", 0.45, "x", (0.25, 0.0), 1),
    ]:
        r2 = house(hx, hy, hw, hd, hh, wc, rc, rh=rh, along=al, chim=ch, wins=nw, shutter="#5fb0c9")
    # park s rybníčkem a lavičkami
    cyl((1.5, 8.0, 0.02), 0.95, 0.04, water, verts=28)
    cyl((1.5, 8.0, 0.0), 1.1, 0.04, M("breh", "#8a8494", 0.9), verts=28)
    for bx_, by_, bro in ((0.0, 8.0, 0.0), (3.0, 8.0, math.pi)):
        box((bx_, by_, 0.17), (0.7, 0.22, 0.05), M("lavicka", "#9a6a3c", 0.8), rot=(0, 0, bro), bevel=0.01)
        box((bx_, by_ + (0.1 if bro == 0 else -0.1), 0.32), (0.7, 0.04, 0.2), M("lavicka", "#9a6a3c", 0.8), bevel=0.01)
    for (x, y, kind) in ((-0.5, 8.6, "r"), (3.6, 8.7, "p"), (-9.0, 8.5, "r"), (8.8, 8.8, "p"), (-9.2, 5.6, "p"), (9.0, 5.4, "r"), (5.4, 5.7, "r")):
        (roundtree if kind == "r" else pine)(x, y, 1.1)
    for (x, y) in ((-6.5, 6.4), (3.6, 6.4), (7.0, 5.7), (-2.8, 7.9), (5.4, 8.4)):
        bush(x, y, 1.4)
    for (lx, ly) in ((-6.0, 5.2), (-2.4, 5.3), (1.8, 5.4), (5.6, 5.1)):
        lamp(lx, ly)

    # ---------------------------------------------------------- terasa: vchod do pohádkového lesa a do hradu
    fx_, fy_ = -6.0, 12.9
    cyl((fx_, fy_, 2.3), 1.15, 3.0, stone_material("kura_h", "#6b4a33", scale=14, strength=0.55), verts=24)
    for k in range(6):
        a_ = k * math.tau / 6 + 0.3
        cone((fx_ + 1.3 * math.cos(a_), fy_ + 1.0 * math.sin(a_) - 0.3, 1.3), 0.5, 0.0, 1.6, M("koren_h", "#5a3c24", 0.9), verts=8, rot=(math.sin(a_) * 0.4, -math.cos(a_) * 0.4, 0))
    for k, (dx, dy, dz, rr, c) in enumerate(((-1.1, 0.2, 4.2, 1.2, "#2f9a52"), (1.2, 0.0, 4.3, 1.3, "#3fb060"), (0, 0.5, 5.1, 1.4, "#4fc070"), (0, 0.3, 4.1, 1.7, "#2f8a4a"))):
        sphere((fx_ + dx, fy_ + dy, dz), rr, M("koruna_les" + str(k), c, 0.6), seg=24, rings=14)
    box((fx_, fy_ - 1.1, 1.35), (1.0, 0.1, 1.5), G("les_dvere", "#ffe58a", 3.5), bevel=0.02)
    cyl((fx_, fy_ - 1.1, 2.1), 0.5, 0.1, G("les_dvere", "#ffe58a", 3.5), verts=22, rot=(math.pi / 2, 0, 0))
    torus((fx_, fy_ - 1.15, 1.4), 0.62, 0.07, M("dvere_ram", "#6b4a33", 0.8), rot=(math.pi / 2, 0, 0))
    for k in range(12):
        a_ = k * 0.52
        sphere((fx_ + 0.9 * math.cos(a_) * (1 + 0.1 * (k % 2)), fy_ - 1.25, 1.35 + 0.9 * math.sin(a_) * 0.9 + 0.2), 0.045, G("sv_les", "#c8ff7a", 6.0), seg=8, rings=6)
    for k, (dx, c) in enumerate(((-1.6, "#e0453a"), (1.6, "#3b82e0"), (-2.1, "#ff9a3c"), (2.2, "#9a4de0"))):
        cyl((fx_ + dx, fy_ - 1.6 - 0.2 * (k % 2), 1.0 + 0.18), 0.07, 0.36, M("noha_h", "#f4ecd8", 0.6), verts=10)
        sphere((fx_ + dx, fy_ - 1.6 - 0.2 * (k % 2), 1.4), 0.24, M("klobouk_h" + c, c, 0.45), scale=(1, 1, 0.6), seg=14, rings=8)
    places["les"] = {"door": norm(fx_, fy_ - 1.5, 0.9), "sign": sign(fx_, fy_ - 1.15, 2.7, w=1.7, h=0.4, color="#2f7a3a"), "w": 1.7}

    cx_, cy_ = 6.0, 12.9   # hrad
    box((cx_, cy_, 1.8), (5.4, 1.1, 2.0), stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), bevel=0.03)
    for k in range(9):
        box((cx_ - 2.4 + k * 0.6, cy_ - 0.1, 3.0), (0.38, 0.6, 0.4), stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), bevel=0.02)
    for tx_, rc_ in ((cx_ - 2.9, "#c0392b"), (cx_ + 2.9, "#2f6fd8")):
        cyl((tx_, cy_, 2.3), 0.75, 3.0, stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), verts=24)
        cyl((tx_, cy_, 3.9), 0.9, 0.25, stone_material("hrad_zed2", "#a8a094", scale=22, strength=0.4, roughness=0.9), verts=24)
        cone((tx_, cy_, 4.8), 0.95, 0.0, 1.4, M("vez_s" + rc_, rc_, 0.45), verts=24)
        bar((tx_, cy_, 5.5), (tx_, cy_, 6.2), 0.02, M("tyc", "#5a3c24", 0.8), verts=6)
        box((tx_ + 0.3, cy_, 6.0), (0.5, 0.02, 0.3), M("prap" + rc_, rc_, 0.5), bevel=0)
        for k in range(2):
            box((tx_, cy_ - 0.73, 2.0 + k * 1.2), (0.16, 0.04, 0.4), G("strelnice", "#ffd98a", 2.5), bevel=0)
    cyl((cx_, cy_ - 0.55, 1.45), 0.8, 0.2, M("brana_h", "#2c2438", 0.7), verts=24, rot=(math.pi / 2, 0, 0))
    box((cx_, cy_ - 0.55, 0.9), (1.6, 0.2, 1.1), M("brana_h", "#2c2438", 0.7), bevel=0.02)
    for k in range(7):
        bar((cx_ - 0.7 + k * 0.23, cy_ - 0.68, 0.4), (cx_ - 0.7 + k * 0.23, cy_ - 0.68, 2.0), 0.03, M("mrize", "#3a3a48", 0.4, 0.7), verts=6)
    box((cx_, cy_ - 1.5, 0.5), (1.4, 1.6, 0.1), M("most_h", "#9a6a3e", 0.8), rot=(0.25, 0, 0), bevel=0.01)
    for sx_ in (-1, 1):
        bar((cx_ + sx_ * 0.68, cy_ - 0.8, 1.7), (cx_ + sx_ * 0.68, cy_ - 2.2, 0.8), 0.02, M("retez", "#4a4a58", 0.4, 0.7), verts=5)
    for sx_ in (-1.5, 1.5):
        box((cx_ + sx_, cy_ - 0.58, 2.5), (0.5, 0.03, 0.9), M("erb_h", ["#d6362b", "#ffc933"][int(sx_ > 0)], 0.5), bevel=0)
    places["hrad"] = {"door": norm(cx_, cy_ - 1.6, 0.9), "sign": sign(cx_, cy_ - 0.62, 2.55, w=1.7, h=0.4, color="#7a4a8a"), "w": 1.7}

    # ---------------------------------------------------------- přístav v zátoce (vlevo dole)
    for k in range(18):  # molo
        box((-2.2 - 0.25 * k, -8.3, 0.1), (0.22, 1.4, 0.07), M("molo" + str(k % 2), ["#9a6a3c", "#8a5e34"][k % 2], 0.8), bevel=0.008)
    for k in range(7):
        for sy_ in (-0.62, 0.62):
            cyl((-2.4 - 0.7 * k, -8.3 + sy_, -0.2), 0.08, 0.7, M("pilota", "#5a3a22", 0.9), verts=10)
    for k in range(3):
        cyl((-2.7 - 1.6 * k, -8.85, 0.35), 0.09, 0.45, M("pacholek", "#3b3a4a", 0.4, 0.7), verts=10)
    box((-4.2, -7.85, 0.3), (0.5, 0.4, 0.4), M("bedna_h", "#c79256", 0.8), rot=(0, 0, 0.2), bevel=0.02)
    cyl((-5.0, -7.8, 0.28), 0.2, 0.4, M("sud", "#8a5a34", 0.7), verts=14)
    cyl((-3.4, -9.2, 1.0), 0.04, 1.8, M("lampa", "#3b3a4a", 0.4, 0.7), verts=8)
    sphere((-3.4, -9.2, 1.95), 0.13, G("lampa_sv", "#ffd98a", 5.0), seg=10, rings=8)
    house(-0.5, -7.6, 1.6, 1.1, 0.9, "#f0e0c0", "#3b6fd8", rh=0.5, along="x", chim=(0.45, 0.1), wins=1, door_x=-0.35, shutter="#5fb0c9", name="pristav_d")
    places["pristav"] = {"door": norm(-2.0, -8.3, 0.2), "sign": sign(-0.5, -8.18, 1.55, w=1.2, h=0.3, color="#3b6fd8"), "w": 1.2, "lod": norm(-6.6, -9.4, 0.0)}

    # ---------------------------------------------------------- raketová rampa (vpravo dole)
    px_, py_ = 6.0, -8.0
    cyl((px_, py_, 0.08), 2.0, 0.16, stone_material("rampa", "#9aa0b0", scale=20, strength=0.3), verts=40)
    cyl((px_, py_, 0.17), 1.5, 0.02, M("rampa_k", "#3b3a4a", 0.5), verts=40)
    for k in range(16):
        a_ = k * math.tau / 16
        sphere((px_ + 1.75 * math.cos(a_), py_ + 1.75 * math.sin(a_) * 0.9, 0.2), 0.05, G("rampa_sv", ["#ff5fa2", "#35d0ff"][k % 2], 6.0), seg=8, rings=6)
    for sx_ in (-1, 1):  # kolébka pro raketu
        box((px_ + sx_ * 0.9, py_, 0.42), (0.14, 0.7, 0.55), M("kolebka", "#e0453a", 0.5), bevel=0.02)
    for sx_ in (-1, 1):  # věž
        box((px_ + sx_ * 1.9, py_ + 0.7, 1.9), (0.16, 0.16, 3.6), M("vez_r", "#c9ced8", 0.4, 0.5), bevel=0.01)
    box((px_ + 1.45, py_ + 0.7, 3.0), (1.0, 0.1, 0.1), M("vez_r", "#c9ced8", 0.4, 0.5), bevel=0.01)
    for k in range(6):
        bar((px_ + 1.9, py_ + 0.7, 0.5 + k * 0.5), (px_ + 2.3, py_ + 0.7, 0.75 + k * 0.5), 0.02, M("vez_r", "#c9ced8", 0.4, 0.5), verts=6)
    house(3.4, -8.8, 1.3, 1.0, 0.8, "#d8e0f0", "#e0453a", rh=0.4, along="x", chim=None, wins=1, door_x=-0.25, shutter="#46d6ff", name="ridici")
    cyl((3.4, -8.8, 1.4), 0.04, 1.2, M("anten", "#9aa6c0", 0.4, 0.6), verts=8)
    sphere((3.4, -8.8, 2.05), 0.07, G("antenS", "#ff6fd0", 6.0), seg=8, rings=6)
    places["stanice"] = {"door": norm(px_, py_ - 1.2, 0.2), "sign": sign(3.4, -9.33, 1.15, w=1.2, h=0.3, color="#e0453a"), "w": 1.2, "raketa": norm(px_, py_, 0.45)}

    # ---------------------------------------------------------- laguna s potápěčskou věží (podmořské město)
    lx_, ly_ = 0.9, -9.2
    cyl((lx_, ly_, -0.02), 2.4, 0.06, M("breh_l", "#e8d6a8", 0.9), verts=40, rot=(0, 0, 0))
    cyl((lx_, ly_, 0.03), 2.2, 0.05, water, verts=40)
    for k in range(10):
        a_ = k * math.tau / 10
        sphere((lx_ + 2.3 * math.cos(a_), ly_ + 2.3 * math.sin(a_), 0.1), 0.18, M("kamen_l", "#8a8494", 0.9), scale=(1.2, 1, 0.7), seg=8, rings=6)
    for k in range(4):
        a_ = k * math.tau / 4 + 0.78
        bar((lx_ - 0.9 + 0.5 * math.cos(a_), ly_ + 0.4 + 0.5 * math.sin(a_), -0.1), (lx_ - 0.9 + 0.3 * math.cos(a_), ly_ + 0.4 + 0.3 * math.sin(a_), 1.2), 0.05, M("pilota", "#5a3a22", 0.9), verts=8)
    box((lx_ - 0.9, ly_ + 0.4, 1.25), (1.2, 1.2, 0.1), M("molo0", "#9a6a3c", 0.8), bevel=0.01)
    box((lx_ - 0.1, ly_ + 0.4, 1.32), (1.0, 0.3, 0.05), M("prkno_s", "#c79256", 0.8), rot=(0, -0.05, 0), bevel=0.01)
    for k in range(8):
        box((lx_ - 1.5, ly_ + 0.4, 0.15 + k * 0.14), (0.14, 0.5, 0.03), M("zebrik", "#7a5636", 0.8), bevel=0)
    for k in range(5):
        sphere((lx_ + 1.1 + 0.12 * (k % 2), ly_ - 0.3 + 0.1 * k, 0.1 + 0.15 * k), 0.09, M("bublina_l", "#e8fbff", 0.1), seg=8, rings=6)
    places["more"] = {"door": norm(lx_ - 1.5, ly_ - 0.3, 0.1), "sign": sign(lx_ - 0.9, ly_ + 0.4 - 0.0, 1.95, w=1.5, h=0.34, color="#1f8ccc"), "w": 1.5, "ponorka": norm(lx_ + 0.9, ly_ - 0.4, 0.2)}

    # ---------------------------------------------------------- zahrádky, ohrady a louka dole
    fence(2.4, -3.3, 7.4, -3.3)
    fence(2.4, -3.3, 2.4, -5.3)
    fence(7.4, -3.3, 7.4, -5.3)
    fence(2.4, -5.3, 7.4, -5.3)
    cyl((4.6, -4.3, 0.05), 0.55, 0.06, M("louze", "#3b9bff", roughness=0.1), verts=24)
    box((6.8, -3.8, 0.17), (0.5, 0.3, 0.34), M("seno", "#f2c14a", roughness=0.95), bevel=0.02)
    for k in range(4):
        box((-4.5 + k * 0.36, -4.4, 0.05), (0.3, 0.32, 0.1), M("zahon", "#7a4a2a", roughness=1.0), bevel=0.01)
        for j in range(4):
            sphere((-4.62 + k * 0.36 + j * 0.08, -4.4, 0.13), 0.04, M("zel", "#4fb560"), seg=8, rings=6)
    for (x, y, kind) in ((-9.0, -4.2, "r"), (9.2, -6.0, "r"), (9.0, -10.0, "p"), (-9.3, -5.0, "p"), (7.5, -10.8, "r"), (3.2, -10.9, "p"), (-0.6, -11.0, "r"), (10.0, -8.0, "p")):
        (roundtree if kind == "r" else pine)(x, y, 1.2)
    for (x, y) in ((-1.5, -4.5), (4.0, -6.2), (-1.0, -6.0), (8.4, -7.0), (2.4, -10.6)):
        bush(x, y, 1.4)
    flowers(-1.5, -4.0, 3.0, 0.6, 12, seed=11)
    flowers(2.6, -7.3, 3.0, 0.5, 12, seed=12)
    flowers(8.4, -9.6, 2.0, 0.5, 10, seed=13)
    rocks(-8.8, -3.4, 4, 1.2, seed=5)
    rocks(9.0, -4.2, 3, 1.0, seed=6)
    for (lx2, ly2) in ((0.9, -3.6), (-1.6, -6.2), (3.2, -6.0), (5.0, -7.2), (-2.4, -7.2)):
        lamp(lx2, ly2)

    # hlavní ulice: lampy a komín školy
    for (lx3, ly3) in ((-6.3, -0.8), (-4.0, -1.5), (-1.6, -1.55), (1.2, -0.9), (3.0, -1.35), (4.5, -0.9), (6.5, 0.0)):
        lamp(lx3, ly3)
    KOMINY.append(norm(sx0 + 1.05, sy0 + 0.1, 1.95))

    # ---------------------------------------------------------- kotvy pro web
    out["lampy"] = LAMPY
    out["kominy"] = KOMINY
    out["npc"] = {
        "knihovnice": norm(-4.2, -0.2), "pekar": norm(-1.35, 0.1), "kluk": norm(-1.6, -1.9), "kocka": norm(3.1, -3.6), "babicka": norm(-6.2, -0.7),
        "ovce": norm(3.8, -4.4), "slepice": norm(6.2, -4.1), "farmar": norm(7.0, -4.7), "pes": norm(-2.0, -1.8),
    }
    out["voda"] = {
        "zatoka": [norm(-13, -6.0)[0], norm(-13, -6.0)[1], norm(-2.0, -14.5)[0], norm(-2.0, -14.5)[1]],
        "reka": [norm(-8, -2.2)[0], norm(-8, -2.2)[1], norm(8, -2.9)[0], norm(8, -2.9)[1]],
        "laguna": norm(0.9, -10.6) + [2.2 / 16, 2.2 * math.sin(EL) / (H / PPU)],
    }
    out["sber"] = [norm(x, y) for x, y in ((-6.2, -1.0), (-4.6, -1.8), (-1.8, -0.3), (1.0, -1.5), (3.2, -0.2), (5.0, 0.9), (2.0, 5.0), (-5.5, 5.6), (-0.5, 5.9),
                                            (5.4, 5.4), (-3.6, 9.0), (3.8, 9.0), (-2.0, -5.2), (1.2, -6.8), (4.8, -6.2), (-4.6, -7.4), (-1.0, 11.6), (1.5, 11.8))]
    out["hrdina"] = norm(0.45, -0.35, 0.0)

    for lay in ():
        pass
    os.makedirs(os.path.join(OUT, "mesto_hub"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "mesto_hub", "kotvy.json"), "w"))
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, "mesto_hub")


build_world()
