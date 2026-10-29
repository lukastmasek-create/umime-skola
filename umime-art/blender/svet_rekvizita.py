"""Hlavní rekvizity tří světů (smyčka 12 snímků, 640 × 384, 100 px na jednotku): domek v koruně obřího stromu (les),
hlavní věž hradu s vlajkami (hrad) a ponorka (moře). Spuštění: python svet_rekvizita.py -- domek | vez | ponorka [--preview]
Výstup: out/svet_<jmeno>/f_00NN.png (domek 640×704, věž 512×800, ponorka 640×384)"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
PPU = 100.0
EL = math.radians(26)
KEY = [a for a in args() if a in ("domek", "vez", "ponorka")][0]
# rozměr snímku a výška středu záběru podle rekvizity (strom a věž jsou vysoké)
W, H, TZC = {"domek": (640, 704, 1.25), "vez": (512, 800, 2.55), "ponorka": (640, 384, 0.0)}[KEY]
N = 12
_M = {}


def M(name, color, roughness=0.55, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


sc = reset(W, H, N, samples=24 if PREVIEW else 96, name="svet_" + KEY, world=("#cfe8ff", 0.8), view="AgX", look="AgX - Punchy")
sc.view_settings.exposure = 0.4
sc.render.film_transparent = True
add_camera((0, -60 * math.cos(EL), 60 * math.sin(EL) + TZC), (0, 0, TZC), ortho_scale=W / PPU)
add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=3.6, color="#fff0d8", angle=0.3)
add_area((6, -9, 8), (0, 0, 1), energy=500, size=10, color="#bcd4ff")
root = bpy.data.objects.new("rekv", None)
bpy.context.scene.collection.objects.link(root)
anim_parts = []


def part(o):
    o.parent = root
    return o


def flag(x, y, z, w, h, c, phase):
    f = Flag((x, y, z), w, h, [M("vl" + c, c, 0.5)], lambda u, v: 0, cols=10, rows=6, amp=0.07, waves=1.5, droop=0.0, name="vlajka")
    f.obj.parent = root
    anim_parts.append((f, phase))


if KEY == "domek":
    # obří strom s domkem v koruně: kmen, větve, domek se světly, žebřík, vlajky, kouř z komína
    part(cyl((0, 0, -0.6), 0.55, 2.4, stone_material("kura", "#6b4a33", scale=14, strength=0.5), verts=20))
    for k in range(5):
        a = k * math.tau / 5
        part(cone((0.6 * math.cos(a), 0.4 * math.sin(a), -1.6), 0.38, 0.0, 1.2, M("koren", "#5a3c24", 0.9), verts=8, rot=(0.3 * math.sin(a), -0.3 * math.cos(a), 0)))
    for k, (dx, dz, r, c) in enumerate(((-1.25, 2.2, 1.0, "#2f9a52"), (1.25, 2.1, 1.1, "#3fb060"), (0, 3.0, 1.2, "#4fc070"), (0, 2.0, 1.5, "#2f8a4a"))):
        part(sphere((dx, 0.9, dz), r, M("koruna" + str(k), c, 0.6), seg=24, rings=14))
    part(cyl((0, 0.3, 1.0), 0.5, 2.6, stone_material("kura", "#6b4a33", scale=14, strength=0.5), verts=16))
    part(box((0, -0.5, 0.82), (1.7, 0.7, 0.1), M("plosina", "#9a6a3c", 0.8), bevel=0.02))
    part(box((0, -0.35, 1.35), (1.2, 0.8, 0.9), M("stena_d", "#c79256", 0.8), bevel=0.03))
    part(cone((0, -0.35, 2.2), 1.0, 0.0, 0.85, M("strecha_d", "#c0392b", 0.5), verts=4, rot=(0, 0, math.pi / 4)))
    part(box((0.25, -0.77, 1.4), (0.3, 0.04, 0.36), glow("okno_d", "#ffd98a", 4.0), bevel=0))
    part(box((-0.3, -0.77, 1.4), (0.22, 0.04, 0.3), glow("okno_d", "#ffd98a", 4.0), bevel=0))
    for k in range(6):
        part(box((0.75, -0.8, 0.2 + k * 0.1), (0.12, 0.03, 0.04), M("zebrik", "#7a5636", 0.8), bevel=0))
    for sx in (-1, 1):
        part(bar((0.75 + sx * 0.0, -0.8, 0.15), (0.75, -0.8, 0.8), 0.02, M("zebrik", "#7a5636", 0.8), verts=6))
    part(box((-0.4, -0.3, 2.3), (0.14, 0.14, 0.4), M("komin_d", "#8a574a", 0.8), bevel=0.01))
    smoke = [part(sphere((-0.4, -0.3, 2.6), 0.08, M("kour", "#f4f1ea", 0.9), seg=8, rings=6)) for _ in range(3)]
    flag(0.0, -0.35, 2.95, 0.5, 0.28, "#ffd24d", 0.0)
    for k in range(6):
        x_ = -0.5 + k * 0.2
        part(sphere((x_, -0.8, 0.9 + 0.03 * math.sin(k)), 0.04, glow("lampicek", ["#ff8ad8", "#ffd24d", "#7ee0b0"][k % 3], 5.0), seg=8, rings=6))

    def upd(t):
        ph = t * math.tau
        for i, s in enumerate(smoke):
            u = (t + i / 3) % 1.0
            s.location = (-0.4 + 0.25 * u, -0.3, 2.6 + 0.7 * u)
            s.scale = [0.5 + 1.6 * u] * 3
elif KEY == "vez":
    # hlavní věž hradu: štíhlá věž s hrotitou střechou, cimbuří a třemi vlajkami
    part(cyl((0, 0, 0.7), 0.75, 2.8, stone_material("zdivo", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), verts=28))
    part(cyl((0, 0, 2.2), 0.88, 0.3, stone_material("zdivo2", "#a8a094", scale=22, strength=0.4, roughness=0.9), verts=28))
    for k in range(10):
        a = k * math.tau / 10
        part(box((0.84 * math.cos(a), 0.84 * math.sin(a), 2.5), (0.26, 0.2, 0.3), stone_material("zdivo2", "#a8a094", scale=22, strength=0.4, roughness=0.9), rot=(0, 0, a), bevel=0.01))
    part(cyl((0, 0, 3.3), 0.55, 1.3, stone_material("zdivo", "#b8b0a4", scale=22, strength=0.4, roughness=0.9), verts=24))
    part(cone((0, 0, 4.4), 0.72, 0.0, 1.5, M("strecha_v", "#2f6fd8", 0.45), verts=28))
    part(bar((0, 0, 5.1), (0, 0, 5.9), 0.025, M("tyc", "#5a3c24", 0.8), verts=6))
    for k in range(4):
        part(box((0, -0.74, 0.5 + k * 0.7), (0.2, 0.04, 0.42), glow("strelnice", "#ffd98a", 2.8), bevel=0))
    part(box((0, -0.76, 0.3), (0.5, 0.05, 0.6), M("brana_v", "#4a2e1a", 0.7), bevel=0.02))
    part(cyl((0, -0.78, 0.6), 0.25, 0.06, M("brana_v", "#4a2e1a", 0.7), verts=16, rot=(math.pi / 2, 0, 0)))
    flag(0.0, 0.0, 5.7, 0.7, 0.4, "#d6362b", 0.0)
    for sx in (-1, 1):
        part(bar((sx * 0.84, 0, 2.6), (sx * 0.84, 0, 3.4), 0.02, M("tyc", "#5a3c24", 0.8), verts=6))
        flag(sx * 0.84, 0.0, 3.25, 0.4, 0.24, ["#2fa070", "#ffc933"][(sx + 1) // 2], 0.4 + sx * 0.2)

    def upd(t):
        pass
else:
    # ponorka: žlutý trup, periskop, okna, vrtule a bubliny
    part(sphere((0, 0, 0), 1.0, M("trup_p", "#ffc933", 0.35, 0.2), scale=(2.2, 0.8, 0.8), seg=32, rings=20))
    part(cyl((0.2, 0, 0.7), 0.4, 0.4, M("veza_p", "#ffb000", 0.4, 0.2), verts=20))
    part(bar((0.3, 0, 0.9), (0.3, 0, 1.5), 0.04, M("peri", "#9aa6c0", 0.3, 0.7), verts=8))
    part(bar((0.3, 0, 1.5), (0.55, 0, 1.5), 0.04, M("peri", "#9aa6c0", 0.3, 0.7), verts=8))
    for k in range(4):
        x_ = -0.9 + k * 0.6
        part(sphere((x_, -0.68, 0.05), 0.2, M("okno_p", "#46d6ff", 0.05, 0.1), scale=(1, 0.35, 1), seg=14, rings=10))
        part(torus((x_, -0.72, 0.05), 0.2, 0.035, M("okno_k", "#c9a23a", 0.3, 0.7), rot=(math.pi / 2, 0, 0)))
    part(box((-1.9, 0, 0.35), (0.5, 0.05, 0.7), M("ploutev_p", "#ff8a1c", 0.4), rot=(0, 0.3, 0), bevel=0.02))
    part(box((-1.9, 0, -0.35), (0.5, 0.05, 0.6), M("ploutev_p", "#ff8a1c", 0.4), rot=(0, -0.3, 0), bevel=0.02))
    prop = bpy.data.objects.new("vrtule", None)
    bpy.context.scene.collection.objects.link(prop)
    prop.parent = root
    prop.location = (-2.25, 0, 0)
    for k in range(3):
        a = k * math.tau / 3
        b = box((0, 0, 0), (0.08, 0.1, 0.5), M("vrtule_p", "#9aa6c0", 0.3, 0.7), rot=(a, 0, 0), bevel=0.01)
        b.parent = prop
        b.location = (0, -0.25 * math.sin(a), 0.25 * math.cos(a))
    bubbles = [part(sphere((-2.4, 0, 0), 0.06, M("bublina", "#e8fbff", 0.1), seg=8, rings=6)) for _ in range(4)]
    part(sphere((1.7, 0, 0), 0.14, glow("svetlo_p", "#fff1a8", 5.0), seg=10, rings=8))

    def upd(t):
        ph = t * math.tau
        prop.rotation_euler = (4 * ph, 0, 0)
        for i, b in enumerate(bubbles):
            u = (t + i / 4) % 1.0
            b.location = (-2.4 - 0.5 * u, 0.1 * math.sin(6 * u + i), 0.0 + 0.9 * u)
            b.scale = [0.6 + 0.8 * u] * 3


def update(t):
    ph = t * math.tau
    root.location = (0, 0, 0.05 * math.sin(ph) if KEY != "vez" else 0)
    if KEY == "ponorka":
        root.rotation_euler = (0.02 * math.sin(ph), 0.04 * math.sin(ph + 1), 0)
    for f, off in anim_parts:
        f.update((t + off) % 1.0)
    upd(t)


run(update, "svet_" + KEY)
