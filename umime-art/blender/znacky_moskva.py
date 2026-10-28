"""Rusko / ruština: chrám Vasila Blaženého. Cibulové kopule se třpytí, sněží."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_rustina", world=("#c9d4ff", 0.7))
plinth("#f4f8ff", "#ffffff")  # sněhový podstavec

brick = stone_material("brick", "#c2443a", scale=40, strength=0.3)
brick_l = stone_material("brick_l", "#e9dcc2", scale=40, strength=0.2)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
snow = material("snow", "#ffffff", roughness=0.9)
dark = material("dark", "#2c2540", roughness=0.8)
win = glow("win", "#ffd98a", 3.0)
domes = [
    striped_material("d_red", "#d6362b", "#fff0d6", freq=7, metallic=0.2, axis="DIAGONAL"),
    striped_material("d_green", "#2f9e5b", "#ffe38a", freq=6, metallic=0.2, axis="DIAGONAL"),
    striped_material("d_blue", "#3b7be0", "#fff2c2", freq=8, metallic=0.2, axis="DIAGONAL"),
    striped_material("d_pink", "#ff7aa6", "#fff2c2", freq=7, metallic=0.2, axis="DIAGONAL"),
    striped_material("d_gold", "#ffc933", "#ff8a3c", freq=6, metallic=0.5, axis="DIAGONAL"),
]


def onion(loc, r, h, mat, cross=True):
    """Cibulová kopule: zploštělá koule s protaženou špičkou a zlatým křížkem."""
    x, y, z = loc
    sphere((x, y, z + r * 0.9), r, mat, scale=(1, 1, 1.25), seg=28, rings=18)
    cone((x, y, z + r * 1.9 + h * 0.2), r * 0.62, 0.0, h * 0.6, mat, verts=28)
    if cross:
        bar((x, y, z + r * 2.35 + h * 0.2), (x, y, z + r * 2.35 + h * 0.2 + 0.16), 0.012, gold, verts=8)
        bar((x - 0.045, y, z + r * 2.35 + h * 0.2 + 0.1), (x + 0.045, y, z + r * 2.35 + h * 0.2 + 0.1), 0.01, gold, verts=8)


# společný sokl a hlavní stan
cyl((0, 0, 0.12), 1.08, 0.24, brick_l, verts=32)
cyl((0, 0, 0.7), 0.48, 0.9, brick, verts=8)
cyl((0, 0, 1.4), 0.36, 0.6, brick_l, verts=8)
cone((0, 0, 1.95), 0.36, 0.0, 0.58, brick, verts=8)
box((0, 0, 1.17), (0.5, 0.5, 0.05), gold)
cyl((0, 0, 2.2), 0.1, 0.1, gold, verts=16)
onion((0, 0, 2.25), 0.12, 0.3, domes[4])
# okna hlavní věže
for k in range(8):
    a = k * math.tau / 8 + math.radians(22.5)
    box((0.485 * math.cos(a), 0.485 * math.sin(a), 0.75), (0.1, 0.1, 0.34), win if k % 2 else dark, rot=(0, 0, a))

# osm kaplí kolem hlavní věže: čtyři velké a čtyři malé
pos_big = [(0.78, 0, 0), (-0.78, 0, 1), (0, 0.78, 2), (0, -0.78, 3)]
for (x, y, mi) in [(p[0], p[1], p[2]) for p in pos_big]:
    cyl((x, y, 0.55), 0.26, 0.62, brick, verts=12)
    cyl((x, y, 0.95), 0.2, 0.2, brick_l, verts=12)
    onion((x, y, 1.05), 0.2, 0.34, domes[mi % 4])
    for k in range(6):
        a = k * math.tau / 6
        box((x + 0.255 * math.cos(a), y + 0.255 * math.sin(a), 0.5), (0.07, 0.07, 0.26), win if k % 2 else dark, rot=(0, 0, a))
pos_small = [(0.6, 0.6), (-0.6, 0.6), (0.6, -0.6), (-0.6, -0.6)]
for i, (x, y) in enumerate(pos_small):
    cyl((x, y, 0.45), 0.17, 0.42, brick_l, verts=10)
    onion((x, y, 0.62), 0.14, 0.24, domes[(i + 1) % 4])

# sněhová čepička a závěje
sphere((0, 0, 0.25), 1.0, snow, scale=(1, 1, 0.06))

rnd = random.Random(5)
flakes = []
for i in range(46):
    s = sphere((0, 0, 0), rnd.uniform(0.018, 0.04), snow, seg=8, rings=6)
    flakes.append((s, rnd.uniform(-1.5, 1.5), rnd.uniform(-1.3, 1.3), rnd.uniform(0, 1), rnd.uniform(0.04, 0.12), rnd.uniform(0, math.tau)))
FALL_TOP, FALL_H = 3.1, 3.1


def update(t):
    ph = t * math.tau
    for s, x, y, off, drift, p in flakes:
        k = (off - t) % 1.0
        s.location = (x + drift * math.sin(ph + p), y + drift * math.cos(ph + p), FALL_TOP - k * FALL_H)
    set_glow(win, 3.0 + 1.5 * math.sin(ph))
    for m in domes:
        m.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.3 + 0.12 * math.sin(ph)
    gold.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.22 + 0.1 * math.sin(ph + 1)


run(update, "znacka_rustina")
