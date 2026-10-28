"""Hrdina úvodní stránky: kosmická loď (pohled z boku, míří doprava) s mihotavým plamenem.

12 snímků plamene 512x256 (průhledné pozadí). Spuštění: python hrdina_lod.py [-- --preview]
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

FR = 12
sc = reset(512, 256, FR, samples=128, name="hrdina_lod", world=("#7a86d8", 0.5))

white = material("trup", "#f3f5ff", roughness=0.28, metallic=0.25)
red = material("cervena", "#ff4d3c", roughness=0.35, metallic=0.2)
blue = material("modra", "#3a58e8", roughness=0.35, metallic=0.3)
dark = material("tmava", "#2a2c46", roughness=0.4, metallic=0.6)
steel = material("ocel", "#aeb6c8", roughness=0.22, metallic=0.95)
gold = material("zlato", "#ffc933", roughness=0.25, metallic=0.9)
glass = material("sklo", "#8fd8ff", roughness=0.05)
glass.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 0.6
glass.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.3
glow_w = glow("p_bila", "#fff6d8", 9.0)
glow_y = glow("p_zluta", "#ffc21a", 6.0)
glow_o = glow("p_oranz", "#ff5a14", 4.5)
win_g = glow("okno", "#9fe8ff", 1.4)
led = glow("led", "#7dff9a", 2.5)

ROT = (0, math.radians(90), 0)  # válce a kužele leží podél osy x

# trup: protáhlý elipsoid, nos, pás barev
sphere((0, 0, 0), 0.5, white, scale=(2.2, 0.8, 0.8), seg=64, rings=40)
cone((1.4, 0, 0), 0.31, 0.04, 0.9, material("nos", "#ff5a46", roughness=0.3, metallic=0.2), verts=48, rot=ROT)  # nos
sphere((1.85, 0, 0), 0.045, steel, seg=16, rings=12)
for x, w in ((0.35, 0.05), (-0.25, 0.05)):  # barevné pásy kolem trupu
    z = 0.8 * 0.5 * math.sqrt(max(0.0, 1 - (x / 1.1) ** 2))
    torus((x, 0, 0), 0.4 * math.sqrt(max(0.0, 1 - (x / 1.1) ** 2)) + 0.03, 0.025, blue, rot=ROT)
cyl((-1.12, 0, 0), 0.27, 0.22, dark, verts=36, rot=ROT)         # těsnění motoru
cone((-1.38, 0, 0), 0.22, 0.34, 0.32, steel, verts=40, rot=ROT)   # tryska
torus((-1.52, 0, 0), 0.33, 0.03, gold, rot=ROT)

# kabina: skleněná kupole s pilotem
sphere((0.35, 0, 0.32), 0.3, glass, scale=(1.3, 0.9, 0.85), seg=36, rings=24)
sphere((0.35, 0, 0.27), 0.14, material("pilot", "#ffd5a8", roughness=0.6), seg=20, rings=14)
sphere((0.35, -0.1, 0.3), 0.032, material("oko", "#16132b"), seg=10, rings=8)
sphere((0.35, 0.1, 0.3), 0.032, material("oko2", "#16132b"), seg=10, rings=8)
cyl((0.35, 0, 0.14), 0.12, 0.1, dark, verts=20)
# boční okénka a svítící kontrolky
for k, x in enumerate((-0.15, -0.55, -0.85)):
    cyl((x, -0.395, 0.0), 0.1, 0.03, steel, verts=28, rot=(math.radians(90), 0, 0))
    cyl((x, -0.41, 0.0), 0.075, 0.03, win_g, verts=28, rot=(math.radians(90), 0, 0))
for k in range(5):
    sphere((0.75 + k * 0.07, -0.385, -0.08), 0.016, led if k % 2 else glow("led%d" % k, "#ff6a6a", 2.5), seg=8, rings=6)
# panely trupu: tenké rýhy kolem trupu přesně po jeho obrysu
for x in (-0.9, -0.45, 0.0, 0.55, 0.95):
    torus((x, 0, 0), 0.4 * math.sqrt(max(0.0, 1 - (x / 1.1) ** 2)) + 0.004, 0.006, dark, rot=ROT)
# křídla a stabilizátory
for sy in (-1, 1):
    mesh_obj("kridlo", [(-0.2, sy * 0.38, -0.1), (-1.25, sy * 1.15, -0.28), (-1.3, sy * 1.15, -0.28), (-1.0, sy * 0.4, -0.1)], [(0, 1, 2, 3)], red)
    mesh_obj("kridlo2", [(-0.2, sy * 0.38, -0.1), (-1.0, sy * 0.4, -0.1), (-1.3, sy * 1.15, -0.28), (-1.25, sy * 1.15, -0.28)], [(0, 1, 2, 3)], red)
    box((-1.15, sy * 1.12, -0.28), (0.18, 0.04, 0.12), blue, bevel=0.01)
    sphere((-1.28, sy * 1.15, -0.28), 0.04, glow("sv%d" % sy, "#ff5d73" if sy < 0 else "#5dff8a", 4.0), seg=10, rings=8)
box((-0.85, 0, 0.42), (0.55, 0.04, 0.45), red, rot=(0, math.radians(-26), 0), bevel=0.01)  # svislá ploutev
box((-0.98, 0, 0.66), (0.22, 0.05, 0.05), gold, bevel=0.01)
# anténa
bar((0.6, 0, 0.38), (0.4, 0, 0.78), 0.012, steel, verts=8)
sphere((0.4, 0, 0.8), 0.04, gold, seg=12, rings=8)

# plamen: tři vnořené svítící kužely, každý snímek se mírně mění
flame = [cone((-1.9, 0, 0), 0.19, 0.0, 1.0, glow_o, verts=32, rot=(0, math.radians(-90), 0)),
         cone((-1.75, 0, 0), 0.14, 0.0, 0.75, glow_y, verts=32, rot=(0, math.radians(-90), 0)),
         cone((-1.62, 0, 0), 0.085, 0.0, 0.5, glow_w, verts=32, rot=(0, math.radians(-90), 0))]
for k in range(10):  # jiskry za lodí
    flame.append(sphere((-2.6 - k * 0.1, 0, 0), 0.02, glow_y, seg=8, rings=6))

add_sun((math.radians(52), math.radians(12), math.radians(-40)), energy=3.4)
add_area((-3, -5, 4), (0, 0, 0), energy=300, size=6, color="#fff1e2")
add_area((3, 4, -2), (0, 0, 0), energy=120, size=5, color="#8fb0ff")
add_camera((0.0, -12, 3.0), (-0.2, 0, 0), ortho_scale=4.9)


def update(t):
    ph = t * math.tau
    for i, f in enumerate(flame[:3]):
        L = 1 + 0.18 * math.sin(2 * ph + i) + 0.07 * math.sin(5 * ph + i * 2)
        f.scale = (1, 1, L)
        f.location.x = -1.9 + (0.28 * i if False else 0.0)
    flame[0].location.x = -1.9 - 0.5 * (flame[0].scale.z - 1) - 0.0
    for i, s in enumerate(flame[3:]):
        k = (i / 10 + t) % 1.0
        s.location = (-2.1 - k * 1.2, 0.05 * math.sin(ph + i * 2.0), 0.04 * math.cos(ph * 2 + i))
        sc_ = 0.8 * (1 - k)
        s.scale = (sc_, sc_, sc_)
    set_glow(glow_o, 4.5 + 1.2 * math.sin(3 * ph))


run(update, "hrdina_lod")
