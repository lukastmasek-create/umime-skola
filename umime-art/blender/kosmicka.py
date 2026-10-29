"""Vesmírná stanice pro uživatelský obchod: promenáda s pěti kapslemi (avatary, tituly, rámečky, pozadí, mazlíčci),
panoramatické okno bez skla (hvězdy a planety kreslí web), sloupy se světelnými prstenci, kontejnery a stromky v
trubicích. Dvě průhledné vrstvy jako u přístavu: ZADNÍ (podlaha, okno, zadní stěny kapslí) a PŘEDNÍ (pulty, kontejnery).
Spuštění: python kosmicka.py -- zadni | predni [--preview]     Výstup: out/kosmicka_<vrstva>/f_0001.png a kotvy.json
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
W, H = (1300, 585) if PREVIEW else (2600, 1170)
UNITS = 16.0
PPU = W / UNITS
EL = math.radians(26)
TZ = 1.3
CAM_D = 60.0
LAYER = [a for a in args() if a in ("zadni", "predni")][0] if any(a in ("zadni", "predni") for a in args()) else "zadni"
_M = {}


def M(name, color, roughness=0.5, metallic=0.0):
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


WHITE, GREY, DARK = "#e8edf5", "#9aa6c0", "#2b3350"
GROUPS = {"zadni": [], "predni": []}


class grp:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.before = set(bpy.data.objects)

    def __exit__(self, *a):
        GROUPS[self.name] += [o for o in bpy.data.objects if o not in self.before]


DECK = 0.3


def pillar(x, y, h=4.6, col="#46d6ff"):
    cyl((x, y, DECK + h / 2), 0.16, h, M("sloup", WHITE, 0.35, 0.4), verts=18)
    for k in range(4):
        torus((x, y, DECK + 0.6 + k * 1.1), 0.2, 0.035, G("prsten" + col, col, 5.0))
    cyl((x, y, DECK + 0.1), 0.3, 0.2, M("sloup_p", GREY, 0.4, 0.5), verts=18)


def container(x, y, z=DECK, c="#ff7a3c", rot=0.0, s=1.0):
    box((x, y, z + 0.3 * s), (0.9 * s, 0.5 * s, 0.6 * s), M("kont" + c, c, 0.55, 0.2), rot=(0, 0, rot), bevel=0.02)
    for k in range(5):
        box((x - 0.36 * s + k * 0.18 * s, y - 0.26 * s, z + 0.3 * s), (0.02, 0.01, 0.56 * s), M("kont_l", DARK, 0.6), rot=(0, 0, rot), bevel=0)


def tube_plant(x, y, h=1.6):
    glass = M("sklotruba", "#bfe8ff", 0.05, 0.1)
    cyl((x, y, DECK + h / 2), 0.28, h, glass, verts=18)
    cyl((x, y, DECK + 0.08), 0.34, 0.16, M("trubaZ", GREY, 0.4, 0.5), verts=18)
    cyl((x, y, DECK + h), 0.34, 0.12, M("trubaZ", GREY, 0.4, 0.5), verts=18)
    sphere((x, y, DECK + 0.4), 0.2, M("pudaS", "#5a3a22", 0.9), scale=(1, 1, 0.5), seg=10, rings=8)
    for k in range(5):
        a = k * math.tau / 5
        sphere((x + 0.1 * math.cos(a), y + 0.1 * math.sin(a), DECK + 0.65 + 0.15 * (k % 3)), 0.1, M("listS", "#4fe08a" if k % 2 else "#2fb870", 0.6), scale=(0.5, 0.5, 1.4), seg=8, rings=6)
    sphere((x, y, DECK + 0.95), 0.07, G("kvetS", "#ff6fd0", 3.0), seg=8, rings=6)


def capsule(cx, c, key):
    """Obchodní kapsle: zadní stěna, střecha jako zaoblený hranol a zářící obruč."""
    with grp("zadni"):
        for sx in (-1, 1):
            box((cx + sx * 1.2, 0.55, DECK + 1.4), (0.14, 0.9, 2.8), M("kapsle_s", WHITE, 0.4, 0.3), bevel=0.05)
        box((cx, 0.95, DECK + 1.3), (2.4, 0.1, 2.6), M("kapsle_z", DARK, 0.5, 0.2), bevel=0.03)
        for k in range(4):
            box((cx, 0.88, DECK + 0.6 + k * 0.6), (2.2, 0.03, 0.04), G("zaclona" + c, c, 3.0), bevel=0)
        # střecha
        box((cx, 0.1, DECK + 2.85), (2.7, 1.9, 0.28), M("kapsle_r" + c, c, 0.35, 0.2), bevel=0.12)
        box((cx, -0.85, DECK + 2.82), (2.7, 0.06, 0.07), G("rim" + c, "#ffffff", 4.0), bevel=0)
        sphere((cx, 0.1, DECK + 3.1), 0.32, M("kapsle_k", WHITE, 0.3, 0.3), scale=(1.5, 1.2, 0.7), seg=14, rings=8)
        # cedule: svítící tabule nad pultem
        box((cx, -0.88, DECK + 2.45), (1.6, 0.04, 0.34), G("tabule" + c, c, 2.2), bevel=0.01)


def counter(cx, w=2.1, y=-0.75):
    with grp("predni"):
        box((cx, y, DECK + 0.3), (w, 0.55, 0.6), M("pult", WHITE, 0.35, 0.4), bevel=0.06)
        box((cx, y, DECK + 0.62), (w + 0.1, 0.62, 0.07), M("pult_d", DARK, 0.4, 0.4), bevel=0.02)
        box((cx, y - 0.29, DECK + 0.3), (w - 0.3, 0.02, 0.06), G("pultcara", "#46d6ff", 4.0), bevel=0)


def build(layer):
    sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name="kosmicka_" + layer, world=("#1a2250", 0.5), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.45
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=3.0, color="#d6e4ff", angle=0.3)
    add_area((6, -9, 8), (0, 0, 1), energy=600, size=10, color="#a8c4ff")
    add_area((-6, -6, 3), (0, 0, 1), energy=250, size=8, color="#ff9ad8")
    out = {"w": W, "h": H, "ppu": PPU}
    anchors = {}

    # ------------------------------------------------------------ podlaha stanice
    with grp("zadni"):
        box((0, -0.5, DECK - 0.1), (17.4, 3.0, 0.2), M("podlaha", "#3a4468", 0.45, 0.4), bevel=0.02)
        for k in range(24):
            box((-8.3 + k * 0.72, -0.5, DECK + 0.005), (0.035, 2.95, 0.012), G("sparaP", "#46d6ff", 1.6), bevel=0)
        for k in range(5):
            box((0, -1.7 + k * 0.65, DECK + 0.005), (17.3, 0.03, 0.012), G("sparaP", "#46d6ff", 1.2), bevel=0)
        box((0, -2.08, DECK - 0.35), (17.4, 0.14, 0.7), M("hrana", WHITE, 0.4, 0.4), bevel=0.04)
        box((0, -2.1, DECK - 0.1), (17.0, 0.04, 0.05), G("hranaS", "#46d6ff", 5.0), bevel=0)
        for k in range(10):  # podpěry pod plošinou
            bar((-8.0 + k * 1.8, -1.9, DECK - 0.7), (-8.0 + k * 1.8 + 0.5, -1.8, DECK - 2.0), 0.07, M("podpera", GREY, 0.4, 0.6), verts=8)
        # panoramatické okno: rám nahoře, svislé meziokenní sloupky, parapet
        box((0, 1.15, DECK + 4.7), (17.6, 0.3, 0.45), M("okno_r", WHITE, 0.4, 0.4), bevel=0.05)
        box((0, 1.15, DECK + 3.6), (17.6, 0.3, 0.22), M("okno_p", WHITE, 0.4, 0.4), bevel=0.04)
        for k in range(9):
            box((-8.0 + k * 2.0, 1.15, DECK + 4.1), (0.18, 0.28, 1.1), M("okno_s", GREY, 0.4, 0.5), bevel=0.04)
        for k in range(9):
            box((-8.0 + k * 2.0, 1.12, DECK + 4.6), (0.1, 0.1, 0.1), G("okno_l", "#ff6fd0", 4.0), bevel=0)
        box((0, 1.1, DECK + 3.4), (17.6, 0.16, 0.04), G("okno_c", "#46d6ff", 4.0), bevel=0)
        # zadní stěna pod oknem (pod pultovými kapslemi je skrytá)
        box((0, 1.1, DECK + 1.7), (17.6, 0.2, 3.4), M("stena", "#2b3350", 0.6, 0.3), bevel=0.02)
        for k in range(8):
            box((-7.4 + k * 2.1, 1.0, DECK + 2.3), (0.9, 0.04, 0.5), G("panelS", ["#46d6ff", "#ff6fd0", "#ffd76b", "#7ee0b0"][k % 4], 1.1), bevel=0)

    stalls = [("avatary", -6.4, "#d6362b"), ("tituly", -3.2, "#2f6fd8"), ("ramecky", 0.0, "#2fa070"), ("pozadi", 3.2, "#ff9a3c"), ("mazlicci", 6.4, "#8a3ffc")]
    for key, cx, c in stalls:
        capsule(cx, c, key)
        counter(cx)
        anchors[key] = {"npc": norm(cx - 0.1, -0.05, DECK), "pult": norm(cx, -0.75, DECK + 0.66), "strecha": norm(cx, -0.4, DECK + 3.0),
                        "bublina": norm(cx, -0.2, DECK + 3.3), "nazev": norm(cx, -0.88, DECK + 2.45)}

    # ------------------------------------------------------------ obsah kapslí
    with grp("zadni"):
        # avatary: figuríny ve skafandrech
        for k in range(3):
            mx = -7.2 + k * 0.7
            sphere((mx, 0.55, DECK + 1.5), 0.15, M("manekyn", WHITE, 0.3, 0.2), seg=14, rings=10)
            sphere((mx, 0.55, DECK + 1.15), 0.2, M("skaf" + str(k), ["#ff7a3c", "#46d6ff", "#ffd76b"][k], 0.5), scale=(1, 0.8, 1.3), seg=14, rings=10)
            bar((mx, 0.55, DECK), (mx, 0.55, DECK + 0.9), 0.025, M("stojan", GREY, 0.4, 0.6), verts=8)
        # tituly: holografická obrazovka a medaile
        cx = -3.2
        box((cx - 0.5, 0.5, DECK + 1.5), (1.0, 0.03, 0.7), G("holo", "#46d6ff", 2.4), bevel=0.01)
        box((cx - 0.5, 0.48, DECK + 1.5), (0.8, 0.02, 0.5), G("holo2", "#9fe8ff", 3.2), bevel=0)
        for k in range(3):
            sphere((cx + 0.55, 0.5, DECK + 1.2 + k * 0.28), 0.1, M("medaileS", "#ffc933", 0.3, 0.9), scale=(1, 0.25, 1), seg=10, rings=8)
        # rámečky: robotické rameno s velkým rámem
        cx = 0.0
        bar((cx - 0.5, 0.5, DECK), (cx - 0.5, 0.5, DECK + 1.0), 0.09, M("rameno", GREY, 0.4, 0.6), verts=10)
        sphere((cx - 0.5, 0.5, DECK + 1.0), 0.13, M("klub", "#ff9a3c", 0.4, 0.4), seg=12, rings=8)
        bar((cx - 0.5, 0.5, DECK + 1.0), (cx + 0.1, 0.5, DECK + 1.7), 0.07, M("rameno", GREY, 0.4, 0.6), verts=10)
        torus((cx + 0.55, 0.48, DECK + 1.55), 0.38, 0.05, M("ramS", "#ffd76b", 0.3, 0.8), rot=(math.pi / 2, 0, 0))
        torus((cx + 0.55, 0.48, DECK + 1.55), 0.26, 0.025, G("ramSz", "#46d6ff", 3.0), rot=(math.pi / 2, 0, 0))
        # pozadí: galerie mlhovin
        cx = 3.2
        for k, (c1, w_, h_) in enumerate((("#ff6fd0", 0.55, 0.7), ("#46d6ff", 0.55, 0.55), ("#8a3ffc", 0.5, 0.65), ("#ffd76b", 0.45, 0.5))):
            box((cx - 0.9 + k * 0.6, 0.5, DECK + 1.45 + 0.12 * (k % 2)), (w_ + 0.08, 0.04, h_ + 0.08), M("ramNeb", WHITE, 0.4, 0.4), bevel=0.01)
            box((cx - 0.9 + k * 0.6, 0.47, DECK + 1.45 + 0.12 * (k % 2)), (w_, 0.02, h_), G("neb" + c1, c1, 2.6), bevel=0)
        # mazlíčci: skleněný kokon s plovoucími blobem
        cx = 6.4
        sphere((cx + 0.6, 0.45, DECK + 1.15), 0.6, M("kokon", "#bfe8ff", 0.05, 0.1), seg=20, rings=14)
        sphere((cx + 0.6, 0.45, DECK + 0.3), 0.5, M("kokonZ", GREY, 0.4, 0.5), scale=(1, 1, 0.3), seg=16, rings=8)
        sphere((cx + 0.6, 0.45, DECK + 1.0), 0.2, G("blobK", "#7ee0b0", 2.0), seg=14, rings=10)
        for sx in (-1, 1):
            sphere((cx + 0.6 + sx * 0.07, 0.35, DECK + 1.05), 0.03, M("oko", "#16132b", 0.3), seg=6, rings=4)
        # sloupy se světelnými prstenci mezi kapslemi
        for px_, col in ((-8.2, "#46d6ff"), (-4.8, "#ff6fd0"), (-1.6, "#ffd76b"), (1.6, "#46d6ff"), (4.8, "#ff6fd0"), (8.2, "#ffd76b")):
            pillar(px_, 0.35 if abs(px_) > 8 else -1.45, h=4.4 if abs(px_) > 8 else 2.9, col=col)
        tube_plant(-8.0, -1.2)
        tube_plant(8.0, -1.4)
        # anténa a radar nahoře na okně
        bar((-6.0, 1.15, DECK + 4.9), (-6.0, 1.15, DECK + 5.5), 0.03, M("anten", GREY, 0.4, 0.6), verts=8)
        sphere((-6.0, 1.15, DECK + 5.55), 0.07, G("antenS", "#ff6fd0", 5.0), seg=8, rings=6)
        # kontejnery
        container(7.7, 0.1, c="#ff7a3c", rot=0.1)
        container(-8.0, 0.2, c="#46a6ff", rot=-0.1)
    with grp("predni"):
        container(-5.0, -1.55, c="#ffd76b", rot=0.12, s=0.8)
        container(5.0, -1.65, c="#7ee0b0", rot=-0.15, s=0.7)
        container(5.3, -1.6, z=DECK + 0.42, c="#ff6fd0", rot=0.3, s=0.5)
        # roboúklízeč: kruhový terč na podlaze (web nad něj dá sprite)
        # předměty na pultech
        cx = -6.4
        for k in range(2):
            sphere((cx - 0.6 + k * 0.45, -0.75, DECK + 0.82), 0.16, M("helma" + str(k), WHITE, 0.25, 0.2), seg=16, rings=12)
            sphere((cx - 0.6 + k * 0.45, -0.88, DECK + 0.84), 0.11, G("vizor" + str(k), "#46d6ff", 2.0), scale=(1, 0.4, 0.8), seg=10, rings=8)
        cx = -3.2
        box((cx, -0.75, DECK + 0.72), (0.6, 0.3, 0.1), M("tlacitko", DARK, 0.4, 0.4), bevel=0.02)
        for k in range(3):
            sphere((cx - 0.15 + k * 0.15, -0.8, DECK + 0.8), 0.04, G("tl" + str(k), ["#ff6fd0", "#46d6ff", "#ffd76b"][k], 4.0), seg=8, rings=6)
        cx = 0.0
        bar((cx + 0.4, -0.75, DECK + 0.7), (cx + 0.6, -0.65, DECK + 1.0), 0.02, M("klic", GREY, 0.3, 0.8), verts=6)
        torus((cx + 0.62, -0.64, DECK + 1.03), 0.07, 0.02, M("klic", GREY, 0.3, 0.8), rot=(math.pi / 2, 0, 0))
        cx = 3.2
        cyl((cx + 0.5, -0.75, DECK + 0.78), 0.1, 0.34, M("dalekohled", GREY, 0.3, 0.7), verts=14, rot=(0, math.radians(70), 0))
        cx = 6.4
        for k in range(2):
            sphere((cx - 0.5 + k * 0.3, -0.75, DECK + 0.75), 0.1, G("kapsleP" + str(k), ["#7ee0b0", "#ff9ad8"][k], 2.0), scale=(1, 1, 1.4), seg=10, rings=8)
    out["kotvy"] = anchors
    out["lod"] = [0.72, 0.065]               # raketa letí za horním oknem stanice
    out["lampy"] = [norm(x, -1.45 if abs(x) < 8 else 0.35, DECK + 2.6) for x in (-4.8, -1.6, 1.6, 4.8)]
    out["bot"] = norm(-1.4, -1.5, DECK)        # roboúklízeč na podlaze
    out["pet"] = norm(6.9, 0.2, DECK + 1.5)    # plovoucí mazlíček u kokonu
    out["sonda"] = [0.03, 0.66]  # interaktivní bod: sonda u levého okraje
    out["pena"] = []

    for lay, objs in GROUPS.items():
        if lay != layer:
            for o in objs:
                o.hide_render = True
    os.makedirs(os.path.join(OUT, "kosmicka_" + layer), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "kosmicka_" + layer, "kotvy.json"), "w"))
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, "kosmicka_" + layer)


build(LAYER)
