"""Společný základ scén světů uživatelského obchodu (les.py, hrad.py, more.py): ortografická kamera jako u přístavu a
vesmírné stanice, dvě vrstvy (zadní a přední), kotvy pro web a pomůcky pro stánky.
Spuštění scény: python <scena>.py -- zadni | predni [--preview]   Výstup: out/<jmeno>_<vrstva>/f_0001.png a kotvy.json
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
STALL_X = [-6.4, -3.2, 0.0, 3.2, 6.4]
STALL_KEYS = ["avatary", "tituly", "ramecky", "pozadi", "mazlicci"]
_M = {}


def M(name, color, roughness=0.6, metallic=0.0):
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


GROUPS = {"zadni": [], "predni": []}


class grp:
    """Co se v bloku vytvoří, patří do dané vrstvy."""

    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.before = set(bpy.data.objects)

    def __exit__(self, *a):
        GROUPS[self.name] += [o for o in bpy.data.objects if o not in self.before]


def begin(name, world_color, sun_color="#fff0d8", sun_energy=3.6, fill="#bcd4ff", exposure=0.4, extra=None):
    sc = reset(W, H, 1, samples=24 if PREVIEW else 96, name=name + "_" + LAYER, world=(world_color, 0.6), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = exposure
    sc.cycles.max_bounces = 4
    sc.render.film_transparent = True
    add_camera((0, -CAM_D * math.cos(EL), CAM_D * math.sin(EL) + TZ), (0, 0, TZ), ortho_scale=UNITS)
    add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=sun_energy, color=sun_color, angle=0.3)
    add_area((6, -9, 8), (0, 0, 1), energy=600, size=10, color=fill)
    for e in extra or []:
        add_area(*e[:2], energy=e[2], size=e[3], color=e[4])
    return {"w": W, "h": H, "ppu": PPU}


def stall_anchors(cx, deck, name_z=2.45, roof_z=3.0, npc_y=-0.05, counter_y=-0.75, counter_z=0.66):
    return {"npc": norm(cx - 0.1, npc_y, deck), "pult": norm(cx, counter_y, deck + counter_z), "strecha": norm(cx, -0.4, deck + roof_z),
            "bublina": norm(cx, -0.2, deck + roof_z + 0.3), "nazev": norm(cx, -0.88, deck + name_z)}


def finish(name, out):
    for lay, objs in GROUPS.items():
        if lay != LAYER:
            for o in objs:
                o.hide_render = True
    os.makedirs(os.path.join(OUT, name + "_" + LAYER), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, name + "_" + LAYER, "kotvy.json"), "w"))
    sys.argv += ["--frame", "1"] if "--frame" not in sys.argv else []
    run(lambda t: None, name + "_" + LAYER)


def catenary(p0, p1, sag, n=14, r=0.012, mat=None, beads=None, bead_r=0.04, every=2):
    """Girlanda mezi dvěma body: lano a po něm světýlka (beads = materiál zářících kuliček)."""
    prev = None
    for i in range(n + 1):
        u = i / n
        p = (p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u, p0[2] + (p1[2] - p0[2]) * u - sag * 4 * u * (1 - u))
        if prev and mat:
            bar(prev, p, r, mat, verts=5)
        if beads is not None and i % every == 0:
            sphere(p, bead_r, beads, seg=8, rings=6)
        prev = p
