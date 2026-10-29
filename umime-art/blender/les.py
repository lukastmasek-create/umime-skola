"""Pohádkový les pro uživatelský obchod: dřevěná promenáda na mýtině, pět houbových domků (avatary, tituly, rámečky,
pozadí, mazlíčci), obří kmeny za nimi, girlandy světlušek, lucerny a pařezové pulty. Moře koruny, mlhu a světlušky kreslí web.
Spuštění: python les.py -- zadni | predni [--preview]     Výstup: out/les_<vrstva>/f_0001.png a kotvy.json
"""
from svet_lib import *

DECK = 0.3
BARK = "#6b4a33"
CAPS = ["#e0453a", "#3b82e0", "#ff9a3c", "#9a4de0", "#2fae6a"]


def bark(name="kura", color=BARK):
    return stone_material(name, color, scale=16, strength=0.55, roughness=0.9)


def trunk(x, y, r=1.0, h=9.0, lean=0.0):
    cyl((x, y, h / 2), r, h, bark("kura" + str(int(r * 10))), verts=24, rot=(lean, 0, 0))
    for k in range(5):  # kořenové náběhy
        a = k * math.tau / 5 + x
        cone((x + (r + 0.15) * math.cos(a), y + (r + 0.1) * math.sin(a), 0.5), 0.45, 0.0, 1.5, bark("koren"), verts=8, rot=(math.sin(a) * 0.35, -math.cos(a) * 0.35, 0))
    # světle zelený mech na jedné straně
    sphere((x - r * 0.7, y - r * 0.4, 0.9), 0.55, M("mech", "#58b84a", 0.9), scale=(1, 0.6, 0.8), seg=10, rings=6)


def fern(x, y, s=1.0, z=DECK):
    for k in range(7):
        a = k * math.tau / 7
        cone((x + 0.18 * s * math.cos(a), y + 0.18 * s * math.sin(a), z + 0.28 * s), 0.07 * s, 0.0, 0.7 * s, M("kapra" + str(k % 2), ["#3fa752", "#59c460"][k % 2], 0.7), verts=5, rot=(math.sin(a) * 0.7, -math.cos(a) * 0.7, 0))


def toadstool(x, y, s=1.0, c="#e0453a", z=DECK, glow_=False):
    cyl((x, y, z + 0.18 * s), 0.07 * s, 0.36 * s, M("noha_h", "#f4ecd8", 0.6), verts=10)
    cap = sphere((x, y, z + 0.38 * s), 0.2 * s, G("houba_z" + c, c, 1.6) if glow_ else M("klobouk" + c, c, 0.45), scale=(1, 1, 0.6), seg=14, rings=8)
    for k in range(4):
        a = k * 1.7
        sphere((x + 0.11 * s * math.cos(a), y + 0.11 * s * math.sin(a), z + 0.46 * s), 0.025 * s, M("tecka", "#ffffff", 0.5), seg=6, rings=4)


def post(x, y, h=3.0):
    cyl((x, y, DECK + h / 2), 0.1, h, bark("kura_s"), verts=10)


def mushroom_house(cx, c, key):
    with grp("zadni"):
        post(cx - 1.25, 0.1)
        post(cx + 1.25, 0.1)
        # zadní stěna z prken a kulaté okno do kmene
        box((cx, 0.95, DECK + 1.3), (2.6, 0.12, 2.6), M("prkna", "#8a5e3c", 0.8), bevel=0.03)
        for k in range(6):
            box((cx - 1.0 + k * 0.4, 0.88, DECK + 1.3), (0.02, 0.02, 2.5), M("prkna_s", "#5a3c24", 0.8), bevel=0)
        # klobouk: velká houba
        sphere((cx, 0.1, DECK + 2.9), 1.5, M("klobouk" + c, c, 0.4), scale=(1.0, 0.85, 0.55), seg=32, rings=16)
        for k in range(9):
            a = k * 0.9 + cx
            sphere((cx + 1.1 * math.cos(a) * 0.9, -0.4 + 0.55 * math.sin(a) - 0.5 * (k % 2) * 0.3, DECK + 3.25 + 0.08 * math.sin(k)), 0.13 + 0.05 * (k % 3), M("tecka", "#fff8ee", 0.5), scale=(1, 0.4, 0.5), seg=8, rings=6)
        # spodek klobouku svítí teple
        cyl((cx, 0.1, DECK + 2.66), 1.25, 0.06, G("pod_klobouku" + c, "#ffe0a0", 1.4), verts=28)
        # lucerničky na háčcích
        for sx in (-1, 1):
            bar((cx + sx * 1.0, -0.55, DECK + 2.6), (cx + sx * 1.0, -0.55, DECK + 2.3), 0.012, M("lano_l", "#5a3c24", 0.8), verts=5)
            sphere((cx + sx * 1.0, -0.55, DECK + 2.22), 0.1, G("lucerna_l", "#ffd98a", 4.0), seg=10, rings=8)
        # cedule
        box((cx, -0.88, DECK + 2.45), (1.7, 0.06, 0.36), M("cedule", "#4a2e1a", 0.7), bevel=0.02)
        box((cx, -0.92, DECK + 2.45), (1.6, 0.02, 0.28), G("cedule_s" + c, "#ffdca0", 0.7), bevel=0)
        for sx in (-1, 1):
            bar((cx + sx * 0.8, -0.88, DECK + 2.62), (cx + sx * 0.8, -0.2, DECK + 2.85), 0.012, M("lano_l", "#5a3c24", 0.8), verts=5)
        # liány
        for sx in (-1, 1):
            for k in range(6):
                sphere((cx + sx * (1.3 - 0.02 * k), -0.1, DECK + 2.6 - 0.28 * k), 0.07, M("liana", "#3fa752", 0.7), seg=8, rings=6)


def stump_counter(cx, w=2.1):
    with grp("predni"):
        box((cx, -0.75, DECK + 0.3), (w, 0.55, 0.6), bark("kura_p", "#7a5636"), bevel=0.06)
        box((cx, -0.75, DECK + 0.64), (w + 0.12, 0.64, 0.08), M("pult_d", "#c79256", 0.55), bevel=0.03)
        for sx in (-1, 1):
            sphere((cx + sx * (w / 2 + 0.05), -0.75, DECK + 0.34), 0.28, M("mech", "#58b84a", 0.9), scale=(0.7, 1.0, 0.9), seg=10, rings=6)
        for k in range(3):
            sphere((cx - 0.6 + k * 0.6, -1.05, DECK + 0.08), 0.06, M("kvet" + str(k), ["#ff6fa8", "#ffd24d", "#ffffff"][k], 0.5), seg=8, rings=6)


def build():
    out = begin("les", "#2c4a3a", sun_color="#fff0b8", sun_energy=3.2, fill="#a8d4b0", exposure=0.6, extra=[((-6, -6, 3), (0, 0, 1), 250, 8, "#ffe08a")])
    anchors = {}
    with grp("zadni"):
        # promenáda z prken
        box((0, -0.45, DECK - 0.1), (17.6, 3.1, 0.2), M("podlaha_p", "#9a6a3c", 0.8), bevel=0.02)
        for k in range(36):
            box((-8.6 + k * 0.5, -0.45, DECK + 0.002), (0.02, 3.05, 0.012), M("spara_p", "#5a3c24", 0.8), bevel=0)
        box((0, -2.05, DECK - 0.3), (17.6, 0.2, 0.6), bark("kura_h", "#7a5636"), bevel=0.05)
        for k in range(8):
            sphere((-8.0 + k * 2.3, -2.12, DECK - 0.3), 0.3, M("mech", "#58b84a", 0.9), scale=(1, 0.5, 0.6), seg=10, rings=6)
        for k in range(10):  # kořeny pod plošinou
            cone((-8.2 + k * 1.8, -1.9, DECK - 0.9), 0.35, 0.0, 1.3, bark("koren"), verts=8, rot=(0.4, 0.2 * (k % 3 - 1), 0))
        # obří kmeny za domky (mezi nimi je vidět mýtina s mlhou)
        for k, (tx, ty, r) in enumerate(((-8.2, 2.3, 1.0), (-4.8, 2.9, 1.25), (-1.6, 2.6, 0.9), (1.6, 3.0, 1.3), (4.8, 2.5, 1.0), (8.2, 2.9, 1.15))):
            trunk(tx, ty, r)
        # tabulka kouzelné cesty a lucerny u okraje
        for px_ in (-8.2, 8.2):
            post(px_, -1.7, 1.8)
            sphere((px_, -1.7, DECK + 1.9), 0.16, G("lucerna_l", "#ffd98a", 4.0), seg=10, rings=8)
        for k in range(14):
            fern(-8.5 + k * 1.3 + 0.2 * (k % 3), 1.2 + 0.3 * (k % 2), 0.9)
    for i, (key, cx, c) in enumerate(zip(STALL_KEYS, STALL_X, CAPS)):
        mushroom_house(cx, c, key)
        stump_counter(cx)
        anchors[key] = stall_anchors(cx, DECK)
    with grp("zadni"):
        # obsah domků
        # avatary: lesní kostýmy: listové šaty na panně
        for k in range(3):
            mx = -7.2 + k * 0.7
            sphere((mx, 0.55, DECK + 1.5), 0.14, M("manekyn_l", "#e8c8a0", 0.6), seg=12, rings=8)
            cone((mx, 0.55, DECK + 1.0), 0.32, 0.12, 0.7, M("listsat" + str(k), ["#4fb560", "#e8a23c", "#e0453a"][k], 0.6), verts=12)
            bar((mx, 0.55, DECK), (mx, 0.55, DECK + 0.9), 0.025, M("stojan_l", "#5a3c24", 0.8), verts=6)
        # tituly: police se svitky a zářícím žaludem
        cx = -3.2
        for k in range(3):
            box((cx - 0.55, 0.6, DECK + 1.1 + k * 0.5), (1.1, 0.25, 0.04), M("police_l", "#7a5636", 0.8), bevel=0.01)
        for k in range(3):
            cyl((cx - 0.5 + k * 0.3, 0.6, DECK + 1.28 + 0.5 * (k % 2)), 0.06, 0.45, M("svitek_l", "#f4e6c0", 0.7), verts=10, rot=(0, math.radians(90), 0))
        sphere((cx + 0.6, 0.55, DECK + 1.45), 0.13, G("zalud", "#ffd24d", 3.0), seg=10, rings=8)
        # rámečky: rámy z větví opřené o zeď
        cx = 0.0
        for k, rr in enumerate((0.34, 0.26)):
            torus((cx - 0.55 + k * 0.85, 0.7, DECK + 1.5 - 0.1 * k), rr, 0.045, M("ram_l", "#7a5636", 0.8), rot=(math.pi / 2, 0, 0))
            torus((cx - 0.55 + k * 0.85, 0.68, DECK + 1.5 - 0.1 * k), rr - 0.1, 0.02, G("ram_lz", "#9fffa8", 2.0), rot=(math.pi / 2, 0, 0))
        # pozadí: malířský stojan s plátny
        cx = 3.2
        for k, (c1, w_, h_) in enumerate((("#ffd24d", 0.55, 0.7), ("#46d68a", 0.55, 0.55), ("#ff8ad0", 0.5, 0.65), ("#6ec6ff", 0.45, 0.5))):
            box((cx - 0.9 + k * 0.6, 0.55, DECK + 1.45 + 0.12 * (k % 2)), (w_ + 0.08, 0.04, h_ + 0.08), M("ram_p", "#7a5636", 0.7), bevel=0.01)
            box((cx - 0.9 + k * 0.6, 0.52, DECK + 1.45 + 0.12 * (k % 2)), (w_, 0.02, h_), G("platno" + c1, c1, 1.1), bevel=0)
        # mazlíčci: dřevěná klec se světluškou a miska
        cx = 6.4
        for k in range(5):
            bar((cx + 0.2 + k * 0.17, 0.55, DECK + 0.4), (cx + 0.2 + k * 0.17, 0.55, DECK + 1.6), 0.02, M("klec_l", "#7a5636", 0.7), verts=6)
        box((cx + 0.55, 0.55, DECK + 1.62), (0.9, 0.12, 0.05), M("klec_l", "#7a5636", 0.7), bevel=0.01)
        sphere((cx + 0.55, 0.5, DECK + 0.95), 0.18, G("svetluska", "#c8ff7a", 3.2), seg=12, rings=8)
        # girlandy světlušek mezi domky
        for k in range(4):
            x0, x1 = -4.8 + k * 3.2, -1.6 + k * 3.2
            catenary((x0, -0.9, DECK + 3.25), (x1, -0.9, DECK + 3.25), 0.45, mat=M("lano_l", "#5a3c24", 0.8), beads=G("sv_g", "#ffe58a", 6.0), bead_r=0.05)
        # pařezy, houby a kameny po okrajích
        toadstool(-8.3, -0.5, 1.6, "#e0453a")
        toadstool(-7.9, -0.9, 1.0, "#ff9a3c")
        toadstool(8.3, -0.7, 1.5, "#9a4de0", glow_=True)
        toadstool(7.9, -1.0, 0.9, "#e0453a")
    with grp("predni"):
        for k in range(8):
            fern(-8.6 + k * 2.4, -1.85, 0.8, z=DECK - 0.1)
        for k in range(5):
            sphere((-8.4 + k * 4.2, -1.95, DECK + 0.05), 0.2, M("kamen_l", "#8a9a8a", 0.9), scale=(1.2, 0.8, 0.6), seg=10, rings=6)
        # květiny a houby v popředí
        toadstool(-4.9, -1.75, 0.9, "#e0453a", z=DECK - 0.05)
        toadstool(2.0, -1.8, 0.8, "#3b82e0", z=DECK - 0.05, glow_=True)
        # pařez s hrnkem
        cyl((-1.4, -1.55, DECK + 0.16), 0.25, 0.32, bark("kura_p", "#7a5636"), verts=14)
        # předměty na pultech
        cx = -6.4
        for k in range(2):
            sphere((cx - 0.6 + k * 0.45, -0.75, DECK + 0.82), 0.14, M("klobouk_m" + str(k), ["#4fb560", "#e8a23c"][k], 0.5), scale=(1, 1, 0.7), seg=12, rings=8)
        cx = -3.2
        box((cx, -0.75, DECK + 0.72), (0.5, 0.32, 0.1), M("kniha_l", "#8a3ffc", 0.5), bevel=0.02)
        for k in range(3):
            sphere((cx - 0.15 + k * 0.15, -0.8, DECK + 0.8), 0.04, G("hv" + str(k), ["#ffd24d", "#ff8ad0", "#7ee0b0"][k], 3.5), seg=8, rings=6)
        cx = 0.0
        box((cx + 0.5, -0.75, DECK + 0.72), (0.34, 0.1, 0.34), M("ram_m", "#7a5636", 0.6), rot=(0.3, 0, 0), bevel=0.02)
        cx = 3.2
        for k in range(3):
            cyl((cx + 0.35 + k * 0.14, -0.75, DECK + 0.78), 0.035, 0.34, M("stetec", "#c79256", 0.6), verts=8, rot=(0, math.radians(18 * (k - 1)), 0))
            sphere((cx + 0.35 + k * 0.14 + 0.05 * (k - 1), -0.75, DECK + 0.97), 0.05, M("stetec_h" + str(k), ["#ff6fa8", "#ffd24d", "#46d6ff"][k], 0.4), seg=8, rings=6)
        cx = 6.4
        cyl((cx - 0.5, -0.75, DECK + 0.72), 0.14, 0.1, M("miska_l", "#c79256", 0.6), verts=14)
        sphere((cx - 0.5, -0.75, DECK + 0.78), 0.1, M("zrni", "#e8c46a", 0.7), scale=(1, 1, 0.5), seg=10, rings=6)
    out["kotvy"] = anchors
    out["lod"] = [0.72, 0.07]                                # domek na stromě v koruně za mýtinou
    out["lampy"] = [norm(x, -0.55, DECK + 2.22) for x in (-7.4, -5.4, -4.2, -2.2, -1.0, 1.0, 2.2, 4.2, 5.4, 7.4)]
    out["kralik"] = norm(-1.7, -1.35, DECK)
    out["kocka"] = norm(7.5, -1.45, DECK)
    out["hul"] = norm(-8.1, -1.3, DECK + 0.6)               # interaktivní kouzelná hůlka u kmene
    out["pena"] = []
    finish("les", out)


build()
