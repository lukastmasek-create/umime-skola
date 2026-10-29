"""Raketoplán parkující za oknem vesmírné stanice (smyčka 12 snímků, 512 × 384, 125 px na jednotku):
jemně se vznáší, z trysky šlehá plamen a bliká signální světlo. Střed trupu je ve středu obrázku."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
W, H, N = 640, 384, 12
PPU = 125.0
EL = math.radians(26)
_M = {}


def M(name, color, roughness=0.4, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


sc = reset(W, H, N, samples=24 if PREVIEW else 96, name="kosmicka_raketa", world=("#1a2250", 0.6), view="AgX", look="AgX - Punchy")
sc.view_settings.exposure = 0.4
sc.render.film_transparent = True
add_camera((0, -60 * math.cos(EL), 60 * math.sin(EL)), (0, 0, 0), ortho_scale=W / PPU)
add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=3.4, color="#d6e4ff", angle=0.3)
add_area((6, -9, 8), (0, 0, 1), energy=500, size=10, color="#a8c4ff")
add_area((-6, -6, 3), (0, 0, 1), energy=200, size=8, color="#ff9ad8")

root = bpy.data.objects.new("raketa", None)
bpy.context.scene.collection.objects.link(root)


def part(o, loc=None):
    o.parent = root
    return o


body = part(cyl((0, 0, 0), 0.5, 2.6, M("trup", "#f4f6fb", 0.3, 0.3), verts=32, rot=(0, math.pi / 2, 0)))
part(cone((1.55, 0, 0), 0.5, 0.0, 0.9, M("nos", "#d6362b", 0.35, 0.2), verts=32, rot=(0, math.radians(-90), 0)))
part(sphere((0.75, -0.42, 0.18), 0.24, M("okno_r", "#46d6ff", 0.08, 0.1), scale=(1, 0.45, 1), seg=16, rings=10))
part(torus((0.75, -0.46, 0.18), 0.24, 0.035, M("okno_k", "#9aa6c0", 0.3, 0.6), rot=(math.pi / 2, 0, 0)))
for s in (-1, 1):
    part(box((-0.9, s * 0.62, 0), (0.9, 0.08, 0.5), M("kridlo", "#d6362b", 0.4, 0.2), rot=(0, 0, s * 0.25), bevel=0.02))
part(box((-1.0, 0, 0.62), (0.7, 0.06, 0.65), M("kridlo", "#d6362b", 0.4, 0.2), bevel=0.02))
part(cyl((-1.45, 0, 0), 0.34, 0.25, M("tryska", "#4a5578", 0.3, 0.7), verts=24, rot=(0, math.pi / 2, 0)))
flame = part(cone((-1.9, 0, 0), 0.3, 0.0, 0.7, glow("plamen", "#ffb347", 8.0), verts=20, rot=(0, math.radians(90), 0)))
core = part(cone((-1.75, 0, 0), 0.16, 0.0, 0.45, glow("plamenJ", "#fff1a8", 12.0), verts=16, rot=(0, math.radians(90), 0)))
beacon = part(sphere((0.2, 0, 0.55), 0.06, glow("maják", "#ff6fd0", 8.0), seg=10, rings=8))
for k in range(3):
    part(torus((-0.2 + k * 0.55, 0, 0), 0.51, 0.02, M("pruh", "#d6362b" if k == 1 else "#9aa6c0", 0.4, 0.4), rot=(0, math.pi / 2, 0)))
root.rotation_euler = (0, 0, math.radians(-8))


def update(t):
    ph = t * math.tau
    root.location = (0.35, 0, 0.07 * math.sin(ph))
    root.rotation_euler = (0.03 * math.sin(ph + 1.0), 0.03 * math.sin(ph), math.radians(-8))
    f = 1 + 0.18 * math.sin(6 * ph) + 0.1 * math.sin(11 * ph)
    flame.scale = (f, 1, 1)
    core.scale = (1.15 - 0.15 * f, 1, 1)
    set_glow(beacon.data.materials[0], 2.0 + 7.0 * max(0.0, math.sin(2 * ph)))


run(update, "kosmicka_raketa")
