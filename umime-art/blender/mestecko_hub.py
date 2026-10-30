"""Městečko jako hub (stránka /mestecko): větší denní městečko s hlavní ulicí, druhou řadou domů, parkem, schody na kopec
s vchody do pohádkového lesa a hradu, přístavem a lagunou dole a startovací rampou rakety. Domovní štíty (prázdné desky) vykreslí
web s názvy sekcí. Stavební prvky bere z mestecko.py (úvodní městečko se nemění). Průhledný obrázek 2000 × 2100.
Spuštění: python mestecko_hub.py [--preview]    Výstup: out/mesto_hub/f_0001.png a out/mesto_hub/kotvy.json
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mestecko import *

UNITS = 18.0   # širší záběr, aby se vešla laguna vlevo dole i rampa rakety vpravo
QUICK = "--quick" in sys.argv  # rychlý náhled rozložení (malý, málo vzorků)
W, H = (500, 625) if QUICK else (1000, 1250) if PREVIEW else (2000, 2500)
EL = math.radians(38)  # vyšší nadhled než úvodní městečko: ulice mezi řadami domů jsou vidět a nikdo nechodí „po střechách“
PPU = W / UNITS


def project(x, y, z):
    return (W / 2 + PPU * x, H / 2 - PPU * (y * math.sin(EL) + (z - TZ) * math.cos(EL)))


def norm(x, y, z=0.0):
    px, py = project(x, y, z)
    return [round(px / W, 5), round(py / H, 5)]


TZ = 5.52   # střed záběru: spodní okraj obrázku je u zátoky (y = -11,2), nahoře terasa s lesem a hradem


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
    sc = reset(W, H, 1, samples=8 if QUICK else 24 if PREVIEW else 40, name="mesto_hub", world=("#cfe3ff", 1.0), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.55
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    cam = add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    cam.data.sensor_fit = "HORIZONTAL"  # šířka záběru = UNITS i u obrázku na výšku (jinak kotvy nesedí na render)
    add_sun((math.radians(52), math.radians(8), math.radians(-40)), energy=4.2, color="#fff0d8", angle=0.2)
    add_area((-6, -10, 8), (0, 0, 1), energy=900, size=12, color="#bcd4ff")
    add_area((8, 4, 10), (0, 0, 1), energy=300, size=10, color="#ffe8c0")
    out = {"w": W, "h": H, "ppu": PPU, "tz": TZ, "units": UNITS}
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
    hraz = M("hraz", "#a79fb4", roughness=0.8)
    box((-2.0, -8.6, -0.1), (0.3, 5.2, 0.3), hraz, bevel=0.02)
    box((-7.5, -6.0, -0.1), (11, 0.3, 0.3), hraz, bevel=0.02)
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
    # Graf vzniká přímo z vykreslených cestiček: každý vzorek křivky je uzel, takže hrdina i obyvatelé chodí
    # přesně po cestě a nikdy přes domy, ploty nebo vodu. Pojmenované uzly (dveře, rozcestí) leží na řídicích
    # bodech cest; cesty se potkávají ve stejném bodě, a tím se propojí.
    graph = {"nodes": {}, "edges": [], "world": {}}
    at_xy = {}

    def node(name, x, y, z=0.0):
        graph["nodes"][name] = norm(x, y, z)
        graph["world"][name] = [x, y]
        at_xy[(round(x, 3), round(y, 3))] = name
        return (x, y)

    def nid(x, y, z):
        key = (round(x, 3), round(y, 3))
        if key not in at_xy:
            node("w%d" % len(at_xy), x, y, z)
        return at_xy[key]

    def link(a, b):
        if a != b and [a, b] not in graph["edges"] and [b, a] not in graph["edges"]:
            graph["edges"].append([a, b])

    def walk(pts):
        """Neviditelná část cesty (schody, lávky): uzly s výškou (x, y, z)."""
        ids = [nid(x, y, z) for x, y, z in pts]
        for a, b in zip(ids, ids[1:]):
            link(a, b)

    lift_ = [0]

    def trail(pts, width=0.5, z=0.01, walkable=True):
        P = [pts[0]] + list(pts) + [pts[-1]]
        r = []
        for i in range(1, len(P) - 2):
            p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
            for k in range(8):
                t = k / 8
                r.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in range(2)))
        r.append(tuple(pts[-1]))
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

        # každá další cesta o kousek výš, ať se na křižovatkách plochy nepřekrývají ve stejné výšce (černé skvrny)
        lift_[0] += 1
        dz = 0.0025 * lift_[0]
        ribbon(width + 0.12, z + 0.014 + dz, M("cesta_o", "#a08c70", roughness=0.95), "trail_o")
        ribbon(width, z + 0.016 + dz + 0.0012, M("cesta_s", "#d8c49c", roughness=0.9), "trail_s")
        if walkable:
            # řídicí body přesně (kvůli pojmenovaným uzlům), mezi nimi vzorky křivky
            ids = [nid(x, y, z) for x, y in r]
            for a, b in zip(ids, ids[1:]):
                link(a, b)
        return r

    # pojmenované uzly (web je používá pro dveře, trasy obyvatel a start hrdiny)
    most_j = node("most_j", -6.9, -2.9)
    most_z = node("most_z", -6.9, -2.0)
    m1 = node("m1", -6.4, -1.3)
    m2 = node("m2", -5.3, -0.75)
    kurzy = node("kurzy", -5.3, 0.15)
    m3 = node("m3", -3.9, -0.95)
    ukoly = node("ukoly", -4.35, -0.62)
    m4 = node("m4", -2.6, -1.35)
    m5 = node("m5", -1.2, -0.95)
    hub = node("hub", 0.4, -0.15)
    hry = node("hry", 0.45, 0.45)
    m7 = node("m7", 2.0, -0.8)
    obchod = node("obchod", 2.65, -0.85)
    m8 = node("m8", 3.6, -0.8)
    c1 = node("c1", 4.05, -0.66)
    m9 = node("m9", 5.3, -0.25)
    zebricky = node("zebricky", 5.45, 0.2)
    c2 = node("c2", 4.05, 3.9)
    u1 = node("u1", -6.6, 4.9)
    u2 = node("u2", -3.6, 4.9)
    u3 = node("u3", 0.2, 5.1)
    u6 = node("u6", 3.6, 4.93)
    u4 = node("u4", 4.05, 4.9)
    u5 = node("u5", 7.0, 4.72)
    uceni = node("uceni", -5.0, 6.5)
    pokoj = node("pokoj", -1.7, 6.3)
    profil = node("profil", 7.4, 6.6)
    s1 = node("s1", -3.6, 9.3)
    s2 = node("s2", 3.6, 9.3)
    node("t1", -3.6, 11.3, 0.82)
    node("t2", 3.6, 11.3, 0.82)
    node("les", -6.0, 11.2, 0.82)
    node("hrad", 5.8, 11.75, 0.82)
    most = node("most", 0.4, -2.55)
    l1 = node("l1", 0.4, -4.3)
    l4 = node("l4", -0.8, -5.6)
    pj = node("pj", -1.75, -8.3)
    pristav = node("pristav", -2.6, -8.3)
    molo = node("molo", -5.4, -8.3)
    l3 = node("l3", 3.4, -6.5)
    stanice = node("stanice", 7.0, -7.1)
    lj = node("lj", 1.05, -6.6)
    node("more", 1.2, -8.1, 0.12)

    # hlavní ulice od mostu přes náměstí k věži slávy, odbočky ke dveřím
    trail([most_j, most_z, m1, m2, m3, m4, m5, hub, m7, obchod, m8, c1, m9, (6.2, 0.3)], 0.62)
    trail([m2, kurzy], 0.42)
    trail([hub, hry], 0.45)
    trail([m9, zebricky], 0.42)
    trail([m3, ukoly], 0.4)
    # ulička mezi náměstím a věží k horní ulici; horní ulice za první řadou domů
    trail([c1, (4.05, 1.5), c2, u4], 0.5)
    trail([(-7.2, 4.8), u1, u2, u3, u6, u4, u5, (7.4, 4.7)], 0.55)
    # druhá řada: observatoř (studovna), pokojík, domek na stromě
    trail([u1, (-5.9, 5.6), uceni], 0.45)
    trail([u3, (-0.6, 5.7), pokoj], 0.45)
    trail([u5, (7.3, 5.6), profil], 0.45)
    # k oběma schodištím na terasu; po schodech se jde neviditelnou částí grafu (s výškou)
    trail([u2, (-3.6, 7.0), s1], 0.55)
    trail([u6, (3.6, 7.0), s2], 0.55)
    walk([(-3.6, 9.3, 0.0), (-3.6, 9.9, 0.25), (-3.6, 10.5, 0.55), (-3.6, 10.85, 0.82), (-3.6, 11.3, 0.82)])
    walk([(3.6, 9.3, 0.0), (3.6, 9.9, 0.25), (3.6, 10.5, 0.55), (3.6, 10.85, 0.82), (3.6, 11.3, 0.82)])
    # terasa: vchody do lesa a hradu
    trail([(-3.6, 11.3), (-6.0, 11.2)], 0.5, z=0.82)
    trail([(3.6, 11.3), (4.5, 11.05), (5.3, 11.1), (5.8, 11.5), (5.8, 11.75)], 0.62, z=0.82)
    trail([(-3.6, 11.3), (3.6, 11.3)], 0.5, z=0.82)
    # druhý most k louce dole, přístav s molem, laguna, raketová rampa a cesta od levého mostu
    trail([hub, (0.4, -1.3), most, (0.4, -3.6), l1, (0.0, -5.0), l4, (-1.6, -6.6), (-1.6, -7.7), pj, pristav, molo], 0.55)
    trail([l1, (1.0, -4.95), (1.8, -5.5), l3, stanice], 0.5, z=0.016)
    trail([l1, (0.65, -5.1), (0.9, -5.9), lj], 0.5, z=0.022)
    trail([most_j, (-6.7, -3.8), (-5.6, -4.9), (-3.6, -5.3), (-2.2, -5.45), l4], 0.5, z=0.018)
    # lávka k potápěčské věži v laguně (prkna, po nich se chodí)
    walk([(1.05, -6.6, 0.0), (1.1, -7.3, 0.12), (1.2, -8.1, 0.12)])
    for k in range(9):
        u_ = k / 8
        box((1.05 + 0.15 * u_, -6.45 - 1.65 * u_, 0.1), (0.62, 0.2, 0.05), M("most", "#9a6a3e", roughness=0.8), bevel=0.006)
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
    # kontrola: graf musí být souvislý
    comp = {n: n for n in graph["nodes"]}

    def root_(n):
        while comp[n] != n:
            comp[n] = comp[comp[n]]
            n = comp[n]
        return n
    for a, b in graph["edges"]:
        comp[root_(a)] = root_(b)
    roots = {root_(n) for n in graph["nodes"]}
    print("GRAF", len(graph["nodes"]), "uzlů,", len(graph["edges"]), "hran, komponent:", len(roots), flush=True)
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
        px_ = tx + 0.75 + k * 0.36  # vpravo od věže, ať nestojí v uličce k horní ulici
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
    box((1.25, -0.4, 0.1), (0.22, 0.22, 0.2), M("bedna", "#c79a5e"), rot=(0, 0, 0.3))
    # ====================================================================== nové části městečka
    # ---------------------------------------------------------- cedule hlavních budov (kotvy pro popisky)
    places["kurzy"] = {"door": norm(sx0, sy0 - 0.85, 0.3), "sign": norm(sx0, sy0 - 0.9, 1.18), "w": 0.8}
    places["hry"] = {"door": norm(ax, ay - 0.8, 0.3), "sign": norm(ax, ay - 0.83, 1.16), "w": 1.4}
    places["zebricky"] = {"door": norm(tx, ty - 0.8, 0.3), "sign": sign(tx, ty - 0.8, 1.2, w=1.0, h=0.28, color="#7a4a8a"), "w": 1.0}
    # obchod: stánky a sloup s cedulí
    bar((2.65, -0.02, 0), (2.65, -0.02, 1.15), 0.035, M("rozc", "#7a4a2e"), verts=8)
    places["obchod"] = {"door": norm(2.65, -0.85, 0.2), "sign": sign(2.65, -0.02, 1.1, w=1.3, h=0.34, color="#c0392b"), "w": 1.3}
    # nástěnka s úkoly
    # nástěnka stojí u ulice mezi školou a fontánou, čelem k ulici (dřív stála přímo na cestě)
    nbx, nby = -4.4, -0.22
    for sx_ in (-1, 1):
        bar((nbx + sx_ * 0.62, nby, 0), (nbx + sx_ * 0.62, nby, 1.25), 0.04, M("rozc", "#7a4a2e"), verts=8)
    box((nbx, nby - 0.03, 0.82), (1.4, 0.06, 0.8), M("nastenka", "#b07d48", 0.8), bevel=0.02)
    for k, (c, dx, dz, r_) in enumerate((("#fff6e0", -0.4, 0.88, 0.1), ("#ffd24d", 0.0, 0.82, -0.08), ("#ff9ac0", 0.4, 0.86, 0.06), ("#9ad8ff", -0.2, 0.62, -0.05), ("#b8f0b0", 0.25, 0.64, 0.1))):
        box((nbx + dx, nby - 0.08, dz - 0.1), (0.3, 0.015, 0.34), M("papir" + c, c, 0.8), rot=(0, r_, 0), bevel=0)
        sphere((nbx + dx, nby - 0.1, dz + 0.06), 0.022, M("napich", "#e0453a", 0.4), seg=6, rings=4)
    places["ukoly"] = {"door": norm(-4.35, -0.62, 0.3), "sign": sign(nbx, nby - 0.03, 1.38, w=1.1, h=0.3, color="#ffc933"), "w": 1.1}

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
        (5.6, 7.2, 1.5, 1.1, 0.85, "#cfe8a8", "#7a4a8a", 0.55, "x", (-0.3, 0.1), 2),
        (-5.4, 9.8, 1.4, 1.0, 0.8, "#b8d8f7", "#3b6fd8", 0.55, "y", (0.3, 0.0), 2),
        (0.3, 9.6, 1.6, 1.1, 0.9, "#ffe6a8", "#d6453a", 0.55, "x", (0.4, 0.1), 2),
        (6.4, 9.6, 1.3, 1.0, 0.8, "#f7a8a0", "#b8453a", 0.5, "x", None, 2),
        (-7.0, 9.8, 1.2, 0.95, 0.7, "#e6c8f7", "#5b3fc8", 0.5, "x", (0.2, 0.0), 2),
        (2.4, 6.4, 1.1, 0.9, 0.65, "#ffd1b8", "#c95a3a", 0.45, "x", (0.25, 0.0), 1),
    ]:
        r2 = house(hx, hy, hw, hd, hh, wc, rc, rh=rh, along=al, chim=ch, wins=nw, shutter="#5fb0c9")
    # park s rybníčkem a lavičkami
    cyl((1.5, 8.0, 0.02), 0.95, 0.04, water, verts=28)
    cyl((1.5, 8.0, 0.0), 1.1, 0.04, M("breh", "#8a8494", 0.9), verts=28)
    for bx_, by_, bro in ((0.0, 8.0, 0.0), (3.0, 8.0, math.pi)):
        box((bx_, by_, 0.17), (0.7, 0.22, 0.05), M("lavicka", "#9a6a3c", 0.8), rot=(0, 0, bro), bevel=0.01)
        box((bx_, by_ + (0.1 if bro == 0 else -0.1), 0.32), (0.7, 0.04, 0.2), M("lavicka", "#9a6a3c", 0.8), bevel=0.01)
    for (x, y, kind) in ((-0.5, 8.6, "r"), (4.8, 8.9, "p"), (-9.0, 8.5, "r"), (8.8, 8.8, "p"), (-9.2, 5.6, "p"), (9.0, 5.4, "r"), (5.4, 5.75, "r")):
        (roundtree if kind == "r" else pine)(x, y, 1.1)
    for (x, y) in ((-6.5, 6.4), (2.9, 7.2), (6.4, 5.9), (-2.8, 7.9), (5.9, 8.4)):
        bush(x, y, 1.4)
    for (lx, ly) in ((-4.7, 5.35), (-2.4, 5.35), (1.8, 5.45), (5.6, 5.2)):
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

    # ---- les: hustší koruna, kůra, schodiště kolem kmene, okna, lucerny, kapradí, houby a mechové kameny
    bark = stone_material("kura_h2", "#5a3d28", scale=46, strength=0.75)
    greens = ["#2a7a45", "#2f9a52", "#3fb060", "#4fc070", "#2a6a3a", "#58cc78"]
    for k in range(18):
        a_ = k * 2.399
        rr_ = 0.7 + 0.55 * ((k * 7) % 5) / 5
        dd_ = 0.8 + 1.0 * ((k * 3) % 4) / 4
        sphere((fx_ + dd_ * math.cos(a_), fy_ + 0.2 + 0.6 * math.sin(a_), 3.7 + 0.32 * (k % 5) + 0.35 * ((k * 5) % 3)), rr_, M("kor2_" + str(k % 6), greens[k % 6], 0.65), seg=20, rings=12)
    for k in range(9):  # kůra: svislé žlábky na kmeni
        a_ = -0.3 - k * 0.38
        bar((fx_ + 1.17 * math.cos(a_ + 1.5), fy_ + 1.17 * math.sin(a_ + 1.5) - 0.0, 1.2), (fx_ + 1.12 * math.cos(a_ + 1.5), fy_ + 1.12 * math.sin(a_ + 1.5), 3.5), 0.035, bark, verts=6)
    for k in range(11):  # schodiště kolem kmene
        a_ = math.pi * 1.15 - k * 0.38
        box((fx_ + 1.35 * math.cos(a_), fy_ + 1.35 * math.sin(a_), 0.95 + 0.16 * k), (0.55, 0.3, 0.06), M("schod_les", "#8a6038", 0.8), rot=(0, 0, a_ + math.pi / 2), bevel=0.01)
    for sx_ in (-0.55, 0.55):  # kulatá okénka
        cyl((fx_ + sx_, fy_ - 1.02, 3.05), 0.2, 0.05, G("okno_les", "#ffe58a", 4.0), verts=18, rot=(math.pi / 2, 0, 0))
        torus((fx_ + sx_, fy_ - 1.03, 3.05), 0.21, 0.03, M("okno_ram", "#4a3020", 0.8), rot=(math.pi / 2, 0, 0))
    for k in range(5):  # girlanda světýlek přes vchod
        t_ = k / 4
        sphere((fx_ - 1.3 + 2.6 * t_, fy_ - 1.3, 2.7 - 0.3 * math.sin(t_ * math.pi)), 0.05, G("girl_les", ["#ffd98a", "#ff9ec4", "#9ee8ff", "#c8ff7a", "#ffd98a"][k], 6.0), seg=8, rings=6)
    for fx2, fy2, ss in ((-8.0, 11.6, 1.0), (-7.4, 13.8, 0.9), (-4.4, 13.6, 0.9), (-4.5, 11.9, 0.7), (-8.4, 12.8, 0.8)):  # kapradiny
        for k in range(7):
            a_ = k * math.tau / 7
            cone((fx2 + 0.18 * ss * math.cos(a_), fy2 + 0.18 * ss * math.sin(a_), 0.82), 0.1 * ss, 0.0, 0.5 * ss, M("kapradi", "#3aa05a", 0.7), verts=5, rot=(math.sin(a_) * 0.9, -math.cos(a_) * 0.9, 0))
    for rx_, ry_, rs_ in ((-7.7, 11.5, 0.45), (-4.5, 12.6, 0.35), (-8.6, 13.4, 0.55), (-3.9, 13.3, 0.3)):  # mechové kameny
        sphere((rx_, ry_, 0.85), rs_, stone_material("kamen_les", "#7d8a78", scale=18, strength=0.5), scale=(1.2, 1, 0.7), seg=14, rings=10)
        sphere((rx_, ry_, 0.85 + rs_ * 0.45), rs_ * 0.8, M("mech", "#4f8a3a", 0.95), scale=(1.1, 0.9, 0.35), seg=12, rings=8)
    for k in range(9):  # další houby v kruhu
        a_ = k * math.tau / 9
        hx_, hy_ = fx_ + 2.6 * math.cos(a_), fy_ - 1.5 + 0.9 * math.sin(a_)
        cyl((hx_, hy_, 0.85), 0.03, 0.14 + 0.04 * (k % 3), M("noha_h", "#f4ecd8", 0.6), verts=8)
        sphere((hx_, hy_, 1.0 + 0.04 * (k % 3)), 0.1 + 0.02 * (k % 3), M("klobouk_m" + str(k % 3), ["#e0453a", "#ff9a3c", "#c43cff"][k % 3], 0.45), scale=(1, 1, 0.6), seg=10, rings=6)
    for k in range(10):  # světlušky
        sphere((fx_ - 3.2 + 6.4 * ((k * 37) % 10) / 10, fy_ - 2.6 + 2.6 * ((k * 53) % 10) / 10, 1.3 + 1.2 * ((k * 17) % 7) / 7), 0.035, G("sv_les", "#c8ff7a", 8.0), seg=8, rings=6)

    cx_, cy_ = 5.8, 12.9   # hrad
    box((cx_, cy_, 1.8), (4.4, 1.1, 2.0), stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), bevel=0.03)
    for k in range(9):
        box((cx_ - 2.0 + k * 0.5, cy_ - 0.1, 3.0), (0.38, 0.6, 0.4), stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), bevel=0.02)
    for tx_, rc_ in ((cx_ - 2.4, "#c0392b"), (cx_ + 2.4, "#2f6fd8")):
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
    wood_h = M("most_h", "#9a6a3e", 0.8)
    for k in range(9):  # prkna padacího mostu přes příkop
        box((cx_, 10.75 + 0.19 * k, 0.9 + 0.012 * k), (1.3, 0.17, 0.06), M("most_h" + str(k % 2), ["#9a6a3e", "#85592f"][k % 2], 0.8), bevel=0.008)
    for sx_ in (-1, 1):
        bar((cx_ + sx_ * 0.68, 12.3, 1.75), (cx_ + sx_ * 0.68, 11.0, 1.0), 0.02, M("retez", "#4a4a58", 0.4, 0.7), verts=5)
        bar((cx_ + sx_ * 0.68, 10.75, 0.85), (cx_ + sx_ * 0.68, 12.4, 0.95), 0.025, wood_h, verts=6)
        for k in range(4):
            bar((cx_ + sx_ * 0.68, 10.9 + 0.5 * k, 0.88), (cx_ + sx_ * 0.68, 10.9 + 0.5 * k, 1.12), 0.025, wood_h, verts=6)
    # příkop před hradbami s kamennými obrubami
    moat = G("prikop", "#4aa8e0", 0.7)
    box((cx_, 11.95, 0.82), (5.6, 0.7, 0.05), moat, bevel=0)
    for yy_ in (11.58, 12.32):
        box((cx_, yy_, 0.86), (5.7, 0.14, 0.14), stone_material("hrad_obruba", "#a8a094", scale=26, strength=0.45), bevel=0.02)
    for sx_ in (-1.5, 1.5):
        box((cx_ + sx_, cy_ - 0.58, 2.5), (0.5, 0.03, 0.9), M("erb_h", ["#d6362b", "#ffc933"][int(sx_ > 0)], 0.5), bevel=0)
    brick = stone_material("hrad_cihla", "#a89e90", scale=34, strength=0.55, roughness=0.95)
    wall_m = stone_material("hrad_zed", "#b8b0a4", scale=22, strength=0.4, roughness=0.9)
    mort = M("spara_h", "#7d746a", 0.95)
    for k in range(8):  # spáry cihel na čelní zdi a na věžích
        zz_ = 1.0 + 0.22 * k
        box((cx_, cy_ - 0.56, zz_), (4.3, 0.012, 0.012), mort, bevel=0)
        for tx_ in (cx_ - 2.4, cx_ + 2.4):
            torus((tx_, cy_, zz_ + 0.15), 0.755, 0.008, mort)
    # hlavní věž (donjon) za hradbami s oblouky oken a střechou
    kx_, ky_ = cx_, cy_ + 0.7
    box((kx_, ky_, 3.4), (2.3, 1.9, 4.6), brick, bevel=0.03)
    for k in range(10):
        box((kx_ + (-1.0 + 0.222 * k), ky_ - 0.97, 5.85), (0.14, 0.14, 0.22), wall_m, bevel=0.01)
        box((kx_ + (-1.0 + 0.222 * k), ky_ + 0.97, 5.85), (0.14, 0.14, 0.22), wall_m, bevel=0.01)
    box((kx_, ky_, 5.7), (2.5, 2.1, 0.16), M("donjon_p", "#a8a094", 0.85), bevel=0.02)
    cone((kx_, ky_, 6.95), 1.3, 0.0, 1.9, M("donjon_s", "#8a3a9a", 0.4), verts=28)
    for k in range(7):
        torus((kx_, ky_, 6.15 + 0.22 * k), 1.3 * (1 - (0.15 + 0.22 * k) / 1.9) + 0.01, 0.012, M("donjon_pas", "#6a2a7a", 0.5))
    bar((kx_, ky_, 7.8), (kx_, ky_, 8.7), 0.02, M("tyc", "#5a3c24", 0.8), verts=6)
    box((kx_ + 0.4, ky_, 8.45), (0.75, 0.02, 0.4), M("prap_d", "#ffc933", 0.5), bevel=0)
    for zw, dxw in ((4.0, -0.5), (4.0, 0.5), (4.9, 0.0)):
        box((kx_ + dxw, ky_ - 0.96, zw), (0.26, 0.04, 0.46), G("okno_d", "#ffd98a", 3.0), bevel=0)
        cyl((kx_ + dxw, ky_ - 0.96, zw + 0.23), 0.13, 0.04, G("okno_d", "#ffd98a", 3.0), verts=14, rot=(math.pi / 2, 0, 0))
        box((kx_ + dxw, ky_ - 0.985, zw - 0.27), (0.4, 0.05, 0.05), wall_m, bevel=0.005)
    # cimbuří na věžích
    for tx_ in (cx_ - 2.4, cx_ + 2.4):
        for k in range(10):
            a2_ = k * math.tau / 10
            box((tx_ + 0.84 * math.cos(a2_), cy_ + 0.84 * math.sin(a2_), 4.14), (0.22, 0.2, 0.26), wall_m, rot=(0, 0, a2_), bevel=0.01)
        box((tx_ + 0.0, cy_ - 0.77, 3.3), (0.3, 0.04, 0.5), G("okno_v", "#ffd98a", 2.5), bevel=0)
    # oblouk brány z kamene, pochodně a břečťan
    torus((cx_, cy_ - 0.68, 1.45), 0.88, 0.1, wall_m, rot=(math.pi / 2, 0, 0))
    for sx_ in (-1, 1):
        box((cx_ + sx_ * 0.95, cy_ - 0.66, 0.95), (0.2, 0.2, 1.3), wall_m, bevel=0.02)
        bar((cx_ + sx_ * 1.25, cy_ - 0.7, 1.6), (cx_ + sx_ * 1.25, cy_ - 0.9, 1.6), 0.015, M("tyc", "#5a3c24", 0.8), verts=6)
        sphere((cx_ + sx_ * 1.25, cy_ - 0.95, 1.7), 0.09, G("pochoden", "#ff9a3c", 9.0), seg=10, rings=8)
        cone((cx_ + sx_ * 1.25, cy_ - 0.95, 1.6), 0.06, 0.02, 0.12, M("tyc", "#5a3c24", 0.8), verts=8)
    ivy = M("brecta", "#3f8a3a", 0.85)
    for k in range(14):
        sphere((cx_ - 1.8 + 0.1 * k + 0.3 * math.sin(k * 1.7), cy_ - 0.62, 1.1 + 0.55 * ((k * 5) % 4) / 1.5), 0.12 + 0.05 * (k % 3), ivy, scale=(1, 0.5, 1), seg=8, rings=6)
    for tx_ in (cx_ + 2.4,):
        for k in range(10):
            sphere((tx_ + 0.62 * math.cos(1.0 + k * 0.35), cy_ - 0.52 - 0.12 * (k % 2), 0.95 + 0.25 * k), 0.14, ivy, seg=8, rings=6)
    places["hrad"] = {"door": norm(cx_, cy_ - 1.15, 0.9), "sign": sign(cx_, cy_ - 0.62, 2.55, w=1.7, h=0.4, color="#7a4a8a"), "w": 1.7}


    # ---------------------------------------------------------- mezi lesem a hradem: rybníček s vodopádem, lávka, studna a tábor
    rock_m = stone_material("kamen_mezi", "#8f8a98", scale=16, strength=0.5)
    px2, py2 = -0.4, 12.75
    cyl((px2, py2, 0.8), 1.55, 0.05, G("rybnik", "#59b8ff", 0.8), verts=44)
    for k in range(16):  # obruba z balvanů
        a_ = k * math.tau / 16
        sphere((px2 + 1.62 * math.cos(a_) * 1.0, py2 + 1.62 * math.sin(a_) * 0.95, 0.88), 0.2 + 0.07 * (k % 3), rock_m, scale=(1.2, 1, 0.75), seg=12, rings=8)
    box((px2, 13.7, 1.3), (1.0, 0.12, 1.05), G("vodopad", "#bfe8ff", 2.2), bevel=0)
    for k in range(6):  # pruhy pěny ve vodopádu
        box((px2 - 0.38 + 0.15 * k, 13.64, 1.3 + 0.1 * ((k * 3) % 4)), (0.03, 0.03, 0.55), G("pena", "#ffffff", 3.0), bevel=0)
    for dx_ in (-0.7, 0.7):
        sphere((px2 + dx_, 13.7, 1.15), 0.4, rock_m, scale=(1, 0.8, 1.4), seg=12, rings=8)
    sphere((px2, 13.3, 0.9), 0.35, M("pena", "#ffffff", 0.3), scale=(2.2, 0.7, 0.3), seg=12, rings=8)
    for k in range(5):  # lekníny
        sphere((px2 - 0.9 + 0.5 * k + 0.2 * math.sin(k * 3), py2 - 0.3 + 0.4 * math.sin(k * 2), 0.85), 0.14, M("leknin", "#3fa05a", 0.6), scale=(1, 1, 0.12), seg=12, rings=6)
        if k % 2 == 0:
            sphere((px2 - 0.9 + 0.5 * k + 0.2 * math.sin(k * 3), py2 - 0.3 + 0.4 * math.sin(k * 2), 0.9), 0.05, M("leknin_k", "#ff9ec4", 0.5), seg=8, rings=6)
    for k in range(7):  # kamenná lávka přes rybníček
        u_ = k / 6
        box((px2 - 0.9 + 1.8 * u_, py2 - 0.05, 0.86 + 0.14 * math.sin(u_ * math.pi)), (0.3, 0.7, 0.07), rock_m, bevel=0.015)
    for sx_ in (-1, 1):
        bar((px2 - 0.95 * sx_, py2 - 0.4, 0.86), (px2 - 0.95 * sx_, py2 - 0.4, 1.15), 0.025, M("zabr_l", "#7a4a2e", 0.8), verts=6)
    # studna přání
    wx_, wy_ = 1.7, 12.4
    cyl((wx_, wy_, 1.0), 0.42, 0.45, stone_material("studna_k", "#a79fb4", scale=26, strength=0.4), verts=24)
    cyl((wx_, wy_, 1.25), 0.32, 0.04, G("studna_v", "#59b8ff", 0.8), verts=20)
    for sx_ in (-1, 1):
        bar((wx_ + sx_ * 0.4, wy_, 1.2), (wx_ + sx_ * 0.4, wy_, 1.95), 0.03, M("zabr_l", "#7a4a2e", 0.8), verts=6)
    box((wx_ - 0.22, wy_, 2.0), (0.6, 0.78, 0.04), M("stresni_s", "#c0392b", 0.5), rot=(0, 0.6, 0), bevel=0.01)
    box((wx_ + 0.22, wy_, 2.0), (0.6, 0.78, 0.04), M("stresni_s", "#c0392b", 0.5), rot=(0, -0.6, 0), bevel=0.01)
    bar((wx_, wy_, 1.82), (wx_, wy_, 1.4), 0.008, M("provaz", "#d8c8a0", 0.9), verts=4)
    cyl((wx_, wy_, 1.33), 0.07, 0.1, M("vedro", "#8a6038", 0.8), verts=10)
    # rozcestník
    sx0_, sy0_ = -2.5, 11.9
    bar((sx0_, sy0_, 0.8), (sx0_, sy0_, 1.7), 0.04, M("zabr_l", "#7a4a2e", 0.8), verts=6)
    for k, (zz_, rot_, cc_) in enumerate(((1.55, 0.12, "#2f7a3a"), (1.32, -0.1, "#7a4a8a"), (1.1, 0.08, "#2f6fd8"))):
        box((sx0_ + (0.28 if k != 1 else -0.28), sy0_, zz_), (0.62, 0.05, 0.17), M("sipka" + str(k), cc_, 0.6), rot=(0, 0, rot_), bevel=0.01)
    # rytířský tábor: dva stany, ohniště, praporky
    for tx3, ty3, tc_ in ((-3.3, 13.6, "#c0392b"), (-2.4, 14.4, "#2f6fd8")):
        cone((tx3, ty3, 0.8), 0.7, 0.0, 1.1, M("stan" + tc_, tc_, 0.7), verts=4, rot=(0, 0, math.pi / 4))
        box((tx3, ty3 - 0.5, 1.0), (0.3, 0.02, 0.5), M("stan_v", "#2c2438", 0.8), rot=(0.3, 0, 0), bevel=0)
        bar((tx3, ty3, 1.85), (tx3, ty3, 2.2), 0.012, M("tyc", "#5a3c24", 0.8), verts=5)
        box((tx3 + 0.15, ty3, 2.1), (0.3, 0.015, 0.16), M("prapor" + tc_, "#ffc933", 0.5), bevel=0)
    fx3, fy3 = -3.0, 12.5
    for k in range(7):
        a_ = k * math.tau / 7
        sphere((fx3 + 0.22 * math.cos(a_), fy3 + 0.22 * math.sin(a_), 0.86), 0.07, rock_m, seg=8, rings=6)
    for k in range(3):
        bar((fx3 - 0.12 + 0.12 * k, fy3 - 0.1, 0.84), (fx3 - 0.02 + 0.04 * k, fy3 + 0.06, 0.98), 0.025, M("poleno", "#5a3c24", 0.9), verts=6)
    sphere((fx3, fy3, 1.0), 0.12, G("ohen", "#ff8a2a", 12.0), scale=(1, 1, 1.5), seg=10, rings=8)
    # lucerny podél cesty po terase a trs květin
    for lx4, ly4 in ((-2.2, 10.85), (2.2, 10.85), (4.7, 10.7), (-4.8, 10.85)):
        bar((lx4, ly4, 0.8), (lx4, ly4, 1.35), 0.014, M("lampa", "#3b3a4a", 0.4, 0.7), verts=8)
        sphere((lx4, ly4, 1.42), 0.05, G("lampa_sv", "#ffd98a", 6.0), seg=10, rings=8)
    for fx4, fy4, cols in ((-1.5, 11.75, ["#ff7eb6", "#ffe36e"]), (2.8, 11.75, ["#ffffff", "#9a4de0"]), (-2.4, 12.6, ["#ff9a3c", "#ff7eb6"]), (1.0, 14.0, ["#ffe36e", "#9ee8ff"])):
        for k in range(9):
            a_ = k * 2.4
            ex_, ey_ = fx4 + 0.3 * math.cos(a_) * (0.4 + (k % 3) * 0.3), fy4 + 0.22 * math.sin(a_) * (0.4 + (k % 3) * 0.3)
            bar((ex_, ey_, 0.8), (ex_, ey_, 0.93), 0.008, M("stonek", "#3f8a3a", 0.8), verts=4)
            sphere((ex_, ey_, 0.95), 0.032, M("kvet" + cols[k % 2], cols[k % 2], 0.5), seg=8, rings=6)


    # ---------------------------------------------------------- kulisy za hradem a lesem: kopce, hory a hustý les
    def ptree(x, y, z0, sc, kind, leaf):
        bar((x, y, z0), (x, y, z0 + 0.5 * sc), 0.06 * sc, M("kmen_k", "#5a3c24", 0.9), verts=6)
        if kind == "p":
            for j in range(3):
                cone((x, y, z0 + (0.35 + 0.42 * j) * sc), (0.62 - 0.14 * j) * sc, 0.0, 0.85 * sc, M("jehl" + leaf, leaf, 0.7), verts=10)
        else:
            sphere((x, y, z0 + 0.95 * sc), 0.55 * sc, M("kor_k" + leaf, leaf, 0.65), seg=14, rings=9)
            sphere((x + 0.3 * sc, y, z0 + 0.75 * sc), 0.38 * sc, M("kor_k" + leaf, leaf, 0.65), seg=12, rings=8)
    for k, (hx, hy, hr, hc) in enumerate(((-9.0, 18.5, 4.2, "#5aa56a"), (-1.0, 19.5, 5.0, "#4f9a62"), (7.5, 18.8, 4.4, "#5aa56a"), (-5.0, 21.5, 5.5, "#7ab88a"), (4.0, 22.0, 6.0, "#86c196"))):
        sphere((hx, hy, 0.8), hr, M("kopec" + str(k), hc, 0.9), scale=(1.5, 1, 0.45), seg=28, rings=16)
    for k, (mx, my, mr, mh) in enumerate(((-7.0, 24.0, 3.2, 5.0), (0.5, 25.5, 3.8, 6.4), (8.0, 24.5, 3.0, 4.6))):
        cone((mx, my, 1.0), mr, 0.0, mh, M("hora" + str(k), "#8fa3c4", 0.85), verts=7)
        cone((mx, my, 1.0 + mh * 0.72), mr * 0.28, 0.0, mh * 0.3, M("snih_h", "#f4f8ff", 0.6), verts=7)
    for i in range(34):
        x = -12 + i * 0.72 + 0.3 * math.sin(i * 3)
        y = 14.6 + 1.6 * ((i * 7) % 5) / 5 + (0.7 if i % 2 else 0)
        if -2.5 < x < 3.5 and y < 15.4:
            continue
        ptree(x, y, 1.8, 1.0 + 0.4 * ((i * 3) % 4) / 4, "p" if i % 3 else "r", ["#2a6a4a", "#2f7a5a", "#3a8a60", "#4fb560"][i % 4])
    # klikatá pěšinka z hradu do kopců
    trail([(5.8, 13.5), (4.6, 14.6), (5.6, 16.0), (4.2, 17.8)], 0.5, z=1.82, walkable=False)

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
    house(-0.2, -7.6, 1.6, 1.1, 0.9, "#f0e0c0", "#3b6fd8", rh=0.5, along="x", chim=(0.45, 0.1), wins=1, door_x=-0.35, shutter="#5fb0c9", name="pristav_d")
    places["pristav"] = {"door": norm(-2.0, -8.3, 0.2), "sign": sign(-0.2, -8.18, 1.55, w=1.2, h=0.3, color="#3b6fd8"), "w": 1.2, "lod": norm(-6.6, -9.4, 0.0)}

    # ---------------------------------------------------------- raketová rampa (vpravo dole)
    px_, py_ = 7.0, -8.2
    cyl((px_, py_, 0.08), 2.0, 0.16, stone_material("rampa", "#9aa0b0", scale=20, strength=0.3), verts=40)
    cyl((px_, py_, 0.17), 1.5, 0.02, M("rampa_k", "#3b3a4a", 0.5), verts=40)
    for k in range(16):
        a_ = k * math.tau / 16
        sphere((px_ + 1.75 * math.cos(a_), py_ + 1.75 * math.sin(a_) * 0.9, 0.2), 0.05, G("rampa_sv", ["#ff5fa2", "#35d0ff"][k % 2], 6.0), seg=8, rings=6)
    for sx_ in (-1, 1):  # kolébka pro raketu
        box((px_ + sx_ * 0.9, py_, 0.42), (0.14, 0.7, 0.55), M("kolebka", "#e0453a", 0.5), bevel=0.02)
    house(10.2, -9.9, 1.3, 1.0, 0.8, "#d8e0f0", "#e0453a", rh=0.4, along="x", chim=None, wins=1, door_x=-0.25, shutter="#46d6ff", name="ridici")
    cyl((10.2, -9.9, 1.4), 0.04, 1.2, M("anten", "#9aa6c0", 0.4, 0.6), verts=8)
    sphere((10.2, -9.9, 2.05), 0.07, G("antenS", "#ff6fd0", 6.0), seg=8, rings=6)
    places["stanice"] = {"door": norm(px_, py_ - 1.2, 0.2), "sign": sign(10.2, -10.43, 1.15, w=1.2, h=0.3, color="#e0453a"), "w": 1.2, "raketa": norm(px_, py_, 0.45)}

    # ---------------------------------------------------------- laguna s potápěčskou věží (podmořské město)
    lx_, ly_ = 2.7, -8.8
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
    places["more"] = {"door": norm(1.2, -8.1, 0.12), "sign": sign(lx_ - 0.9, ly_ + 0.4 - 0.0, 1.95, w=1.5, h=0.34, color="#1f8ccc"), "w": 1.5, "ponorka": norm(lx_ + 0.9, ly_ - 0.4, 0.2)}

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
    for (x, y) in ((-1.5, -4.5), (4.3, -5.75), (0.3, -6.4), (8.4, -7.0), (2.4, -10.6)):
        bush(x, y, 1.4)
    flowers(-1.5, -4.0, 3.0, 0.6, 12, seed=11)
    flowers(5.6, -5.9, 2.0, 0.4, 12, seed=12)
    flowers(8.4, -9.6, 2.0, 0.5, 10, seed=13)
    rocks(-8.8, -3.4, 4, 1.2, seed=5)
    rocks(9.0, -4.2, 3, 1.0, seed=6)
    for (lx2, ly2) in ((0.9, -3.6), (-2.4, -5.85), (3.2, -5.75), (5.0, -7.5), (-1.0, -6.7)):
        lamp(lx2, ly2)

    # hlavní ulice: lampy a komín školy
    for (lx3, ly3) in ((-6.3, -0.8), (-4.0, -1.5), (-1.6, -1.55), (1.2, -0.9), (3.0, -1.35), (4.6, -1.2), (6.5, 0.0)):
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
        "laguna": norm(2.7, -10.2) + [2.2 / UNITS, 2.2 * math.sin(EL) / (H / PPU)],
    }
    # místa pokladů dne: vždy na cestě nebo vedle ní (ne ve vodě, v domě ani na stánku)
    out["sber"] = [norm(x, y) for x, y in ((-6.2, -1.0), (-4.6, -1.8), (-1.8, -0.3), (1.0, -1.5), (3.3, 0.35), (6.7, -0.4), (2.0, 5.0), (-5.5, 5.6), (-0.5, 5.9),
                                            (5.4, 5.4), (-3.9, 8.6), (3.9, 8.6), (-2.0, -5.2), (1.6, -6.4), (4.8, -6.2), (-4.6, -5.6), (-1.0, 11.6), (1.5, 11.8))]
    out["hrdina"] = norm(0.45, -0.35, 0.0)

    for lay in ():
        pass
    os.makedirs(os.path.join(OUT, "mesto_hub"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "mesto_hub", "kotvy.json"), "w"))
    if "--masks" in sys.argv:
        render_masks()
        return
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, "mesto_hub")


# Hranice hloubky (světové y) mezi první řadou domů (A), druhou řadou (B) a terasou za nimi; web podle toho řadí hrdinu a obyvatele
# před budovy nebo za ně. Z masky se vyřežou vrstvy z hotového obrázku městečka (viz encode.py hub_vrstvy).
DEPTH_A, DEPTH_B = 3.3, 9.0


def render_masks():
    """Rychlý plochý snímek (Workbench): R = budovy a stromy přední řady (y < DEPTH_A), G = druhá řada (DEPTH_A až DEPTH_B). Ostatní černě."""
    import mathutils
    hist = {}

    def flat(name, rgb):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (*rgb, 1.0)
        em.inputs["Strength"].default_value = 1.0
        nt.links.new(em.outputs[0], out.inputs[0])
        return m

    mats = {"none": flat("m_none", (0, 0, 0)), "A": flat("m_A", (1, 0, 0)), "B": flat("m_B", (0, 1, 0))}
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        pts = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        zs = [p.z for p in pts]
        xs = [p.x for p in pts]
        ys = [p.y for p in pts]
        height = max(zs)
        wide = max(xs) - min(xs) > 10 or max(ys) - min(ys) > 10
        cy = (min(ys) + max(ys)) / 2
        cls = "none"
        if height >= 0.7 and not wide:
            cls = "A" if cy < DEPTH_A else "B" if cy < DEPTH_B else "none"
            hist[round(cy)] = hist.get(round(cy), 0) + 1
        if not o.material_slots:
            o.data.materials.append(mats[cls])
        for slot in o.material_slots:
            slot.link = "OBJECT"
            slot.material = mats[cls]
    print("HIST", sorted(hist.items()))
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 16
    sc.cycles.use_denoising = False
    sc.cycles.max_bounces = 0
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    sc.render.film_transparent = False
    sc.world.use_nodes = False
    sc.world.color = (0, 0, 0)
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.resolution_percentage = 100
    os.makedirs(os.path.join(OUT, "mesto_hub_maska"), exist_ok=True)
    sc.render.filepath = os.path.join(OUT, "mesto_hub_maska", "f_0001.png")
    bpy.ops.render.render(write_still=True)


build_world()
