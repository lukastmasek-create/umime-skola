"""Španělsko / španělština (Madrid): panoramatická náměstí s arkádou (Plaza Mayor), dvě mozaikové věže,
pomerančovníky, vlající španělské vlajky a slunce, které pulzuje a kolem něj se točí paprsky.
Záběr je širší než u ostatních památek (panorama), aby se na globusu vešla celá scéna."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_spanelstina", ortho=4.0, target_z=1.15, world=("#ffe9c9", 0.7))
plinth("#e8b04a", "#fff3dc")

stucco = stone_material("stucco", "#f4e3c1", scale=30, strength=0.2)
stucco_d = stone_material("stucco_d", "#e2c79c", scale=30, strength=0.22)
tile = material("tile", "#c8553d", roughness=0.5)
tile_d = material("tile_d", "#a8432f", roughness=0.5)
dark = material("dark", "#3a2c4a", roughness=0.8)
teal = material("teal", "#2f9fb0", roughness=0.35, metallic=0.2)
mosaic = material("mosaic", "#ffb347", roughness=0.35, metallic=0.1)
gold = material("gold", "#ffc933", roughness=0.25, metallic=0.9)
cobble = material("cobble", "#c9a77a", roughness=0.9)
wood = material("wood", "#7a5636", roughness=0.8)
orange = material("orange", "#ff8c1a", roughness=0.4)
red = material("red", "#c60b1e", roughness=0.6)
yellow = material("yellow", "#ffc400", roughness=0.6)
pole_m = material("pole", "#d9d4c7", roughness=0.4, metallic=0.5)
sun_m = glow("sun", "#ffd34d", 5.0)
win = [glow("win%d" % i, "#ffd98a", 3.0) for i in range(5)]
Z0 = 0.04  # horní hrana podstavce, na které stojí všechno

# --- terén: dlažba a schody před arkádou ---
cobbles(1.05, 80, cobble, z=Z0 + 0.01)
for i in range(3):
    box((0, -0.78 - i * 0.07, Z0 + 0.025 * (2 - i) + 0.02), (0.9 - i * 0.04, 0.12, 0.05), stucco_d, bevel=0.006)

# --- arkáda náměstí: hlavní hmota, pět oblouků, okna a střešní pás ---
box((0, 0.2, Z0 + 0.3), (1.9, 0.36, 0.6), stucco, bevel=0.01)
box((0, 0.2, Z0 + 0.66), (1.98, 0.42, 0.07), tile, bevel=0.01)
box((0, 0.2, Z0 + 0.72), (2.0, 0.46, 0.03), tile_d, bevel=0.005)
for k, x in enumerate((-0.72, -0.36, 0.0, 0.36, 0.72)):
    box((x, -0.0, Z0 + 0.2), (0.18, 0.05, 0.36), dark, bevel=0.01)
    sphere((x, -0.0, Z0 + 0.38), 0.09, dark, scale=(1, 0.5, 1), seg=12, rings=8)  # oblouk nad vchodem
    box((x, -0.0, Z0 + 0.04), (0.2, 0.06, 0.06), stucco_d, bevel=0.004)  # schod / patka sloupu
    box((x, -0.02, Z0 + 0.5), (0.14, 0.03, 0.12), win[k], bevel=0.0)  # okénko v patře
# balkóny v patře
bar((-0.9, -0.12, Z0 + 0.47), (0.9, -0.12, Z0 + 0.47), 0.012, gold, verts=6)

# --- dvě mozaikové věže v pozadí (tvar jako u katedrál s kupolemi) ---
TOWERS = (-0.62, 0.62)
for x in TOWERS:
    # cone/cyl/sphere jsou středem v loc: tělo věže od Z0 do Z0+1.0 má střed v Z0+0.5
    cone((x, 0.55, Z0 + 0.5), 0.15, 0.08, 1.0, stucco_d, verts=10)
    cyl((x, 0.55, Z0 + 0.98), 0.09, 0.14, teal, verts=10)
    for k in range(3):
        box((x, 0.55 - 0.1, Z0 + 0.3 + k * 0.26), (0.04, 0.02, 0.05), mosaic, bevel=0.0)
    cone((x, 0.55, Z0 + 1.3), 0.085, 0.0, 0.6, mosaic, verts=8)  # špička od Z0+1.0 do Z0+1.6
    sphere((x, 0.55, Z0 + 1.62), 0.03, gold, seg=8, rings=6)
    bar((x, 0.55, Z0 + 1.66), (x, 0.55, Z0 + 1.8), 0.008, gold, verts=6)
    bar((x - 0.03, 0.55, Z0 + 1.73), (x + 0.03, 0.55, Z0 + 1.73), 0.007, gold, verts=6)

# --- pomerančovníky s plody po obou stranách ---
for sx, sy in ((-1, -0.42), (1, -0.42), (-1.04, 0.45)):
    tree(sx * 0.93, sy, 1.0, z=Z0, kind="round", leaf="#2f8f4f", trunk="#7a5636")
    for dx, dy, dz in ((0.07, 0.04, 0.46), (-0.06, -0.03, 0.4), (0.02, 0.07, 0.34)):
        sphere((sx * 0.93 + dx, sy + dy, Z0 + dz), 0.03, orange, seg=8, rings=6)

# --- dvě vlající španělské vlajky (červená, žlutá, červená) na tyčích ---
flags = []
for x in (-1.02, 1.0):
    pole((x, -0.5, Z0), (x, -0.5, Z0 + 0.6), r=0.012, ball=False)
    flags.append(Flag((x + 0.01, -0.5, Z0 + 0.56), 0.3, 0.2, [red, yellow], lambda u, v: 0 if v < 0.25 or v > 0.75 else 1, cols=16, rows=8, amp=0.05, waves=1.5, droop=0.01))

# --- slunce nad náměstím s rotujícími paprsky ---
SUN = (0.95, 0.75, 1.5)
sphere(SUN, 0.13, sun_m, seg=16, rings=10)
RAYS = []
for k in range(10):
    RAYS.append(cone(SUN, 0.012, 0.0, 0.22, sun_m, verts=6))


def update(t):
    ph = t * math.tau
    # pulzující slunce a paprsky, které se točí kolem něj
    set_glow(sun_m, 4.0 + 2.0 * math.sin(ph * 2) ** 2)
    for k, ray in enumerate(RAYS):
        a = ph + k * math.tau / len(RAYS)
        d = 0.2 + 0.11  # paprsek (délka 0.22) stojí ven od slunce, jeho střed je ve vzdálenosti d
        ray.location = (SUN[0] + d * math.cos(a), SUN[1] + d * math.sin(a), SUN[2])
        ray.rotation_euler = (-math.pi / 2, 0, a - math.pi / 2)  # osa kužele leží ve vodorovné rovině ven
    # okna arkády blikají v různé fázi (smyčka: celý počet period)
    for i, w in enumerate(win):
        set_glow(w, 1.5 + 1.8 * max(0.0, math.sin(ph * (1 + i % 2) + i * 1.3)) ** 2)
    for f in flags:
        f.update(t)


run(update, "znacka_spanelstina")
