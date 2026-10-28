"""Itálie (Řím) / dějepis: Koloseum. Praporky vlají, pochodně plápolají, nad arénou krouží holubi."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_dejepis", world=("#f0dcc4", 0.6), ortho=3.5, target_z=0.82)
plinth("#d9c58f", "#fff1d2")

trav = stone_material("trav", "#e6d2a2", scale=30, strength=0.25)
trav_d = stone_material("trav_d", "#c9b283", scale=30, strength=0.25)
arch_m = material("arch", "#4a3a2c", roughness=0.9)
sand = material("sand", "#e4c887", roughness=0.95)
flame_m = glow("flame", "#ff9a3c", 10.0)
pole_m = material("pole", "#6b4a2d", roughness=0.7)
red = material("red", "#c2181f", roughness=0.5)
gold = material("gold", "#ffc933", roughness=0.3, metallic=0.8)

A, B = 1.04, 0.82  # poloosy elipsy
N = 56
TIER_H = 0.3
GAP = (math.radians(285), math.radians(350))  # zřícená část stěny na pravé zadní straně


def broken(a):
    return GAP[0] < a % math.tau < GAP[1]


# aréna
cyl((0, 0, 0.1), 1.0, 0.04, sand, verts=48).scale = (0.62 * A, 0.62 * B, 1)
# hlediště: stupňovité eliptické valce uvnitř
for i, (k, h) in enumerate(((0.9, 0.34), (0.8, 0.5), (0.7, 0.66))):
    o = cyl((0, 0, h / 2 + 0.05), 1.0, h, trav_d if i % 2 else trav, verts=48)
    o.scale = (A * k, B * k, 1)
# vnitřní prstenec stupňů se vykrojí arénou
cyl((0, 0, 0.36), 1.0, 0.7, sand, verts=48).scale = (0.6 * A * 0.95, 0.6 * B * 0.95, 1)

# obvodová stěna po segmentech: tři patra oblouků + atika
for i in range(N):
    a = (i + 0.5) * math.tau / N
    x, y = A * math.cos(a), B * math.sin(a)
    tx, ty = -A * math.sin(a), B * math.cos(a)
    yaw = math.atan2(ty, tx)
    seg = math.tau / N * math.hypot(tx, ty) * 1.02
    tiers = 4 if not broken(a) else (2 if (a % math.tau) > math.radians(305) and (a % math.tau) < math.radians(335) else 3)
    for tier in range(tiers):
        z = 0.08 + tier * TIER_H + TIER_H / 2
        att = tier == 3
        box((x, y, z), (seg, 0.14, TIER_H * (0.95 if not att else 0.85)), trav if tier % 2 == 0 else trav_d, rot=(0, 0, yaw), bevel=0.006)
        nx, ny = math.sin(yaw), -math.cos(yaw)
        # směr ven z elipsy
        ox, oy = x / A, y / B
        ln = math.hypot(ox, oy)
        ox, oy = ox / ln, oy / ln
        if not att:
            box((x + ox * 0.072, y + oy * 0.072, z - 0.02), (seg * 0.46, 0.02, TIER_H * 0.55), arch_m, rot=(0, 0, yaw), bevel=0)
            cyl((x + ox * 0.072, y + oy * 0.072, z + TIER_H * 0.255), seg * 0.23, 0.02, arch_m, verts=12, rot=(math.radians(90), 0, yaw), smooth=False)
        else:
            box((x + ox * 0.072, y + oy * 0.072, z), (seg * 0.2, 0.02, 0.12), arch_m, rot=(0, 0, yaw), bevel=0)
    # římsy mezi patry
    for tier in range(tiers):
        box((x, y, 0.08 + (tier + 1) * TIER_H - 0.005), (seg * 1.02, 0.17, 0.025), trav_d, rot=(0, 0, yaw), bevel=0)

# praporky na stožárech nad atikou
flags = []
for k, ang in enumerate((200, 250, 300, 340)):
    a = math.radians(ang)
    x, y = A * math.cos(a) * 0.985, B * math.sin(a) * 0.985
    top = 0.08 + 4 * TIER_H
    pole((x, y, top), (x, y, top + 0.55), r=0.012, mat=pole_m, ball=False)
    flags.append(Flag((x + 0.01, y, top + 0.54), 0.26, 0.15, [red, gold], lambda u, v: 1 if v > 0.78 else 0, cols=14, rows=6, amp=0.06, waves=1.4, droop=0.01))

# pochodně v aréně
torches = []
for ang in (30, 150, 210, 330):
    a = math.radians(ang)
    x, y = 0.42 * A * math.cos(a), 0.42 * B * math.sin(a)
    bar((x, y, 0.12), (x, y, 0.5), 0.014, pole_m, verts=8)
    torches.append(sphere((x, y, 0.55), 0.045, flame_m, scale=(1, 1, 1.5), seg=10, rings=8))

doves = [Bird(material("dv%d" % i, "#ffffff", roughness=0.6), material("dvw%d" % i, "#eef0ff", roughness=0.6), s=0.65) for i in range(3)]


def update(t):
    ph = t * math.tau
    for f in flags:
        f.update(t)
    for i, o in enumerate(torches):
        s = 1 + 0.25 * math.sin(2 * ph + i * 1.3) + 0.1 * math.sin(3 * ph + i)
        o.scale = (s, s, 1.5 * s)
    set_glow(flame_m, 9 + 3 * math.sin(2 * ph))
    for i, d in enumerate(doves):
        a = ph + i * math.tau / 3
        d.place((0.8 * math.cos(a), 0.6 * math.sin(a), 1.55 + 0.15 * math.sin(2 * a + i)), a + math.pi / 2, 0.7 * math.sin(ph * 4 + i * 1.4))


run(update, "znacka_dejepis")
