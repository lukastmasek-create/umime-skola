"""Česko / čeština: katedrála sv. Víta. Vlající česká vlajka, blikající okna, kroužící ptáci."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

sc = setup("znacka_cestina")
plinth("#8fd36f", "#fff4d0")

stone = stone_material("stone", "#d6ccb8", scale=30)
stone_d = stone_material("stone_d", "#b9ae98", scale=30)
roof = material("roof", "#46796f", roughness=0.5, metallic=0.25)
copper = material("copper", "#5fb49a", roughness=0.4, metallic=0.5)
goldm = material("goldm", "#ffc933", roughness=0.3, metallic=0.6)
dark = material("dark", "#2c2540", roughness=0.8)
win_a = glow("win_a", "#ffd98a", 3.0)
win_b = glow("win_b", "#ffc46b", 3.0)

# hlavní loď a střecha
box((0, 0.5, 0.55), (0.95, 1.9, 1.1), stone)
prism(-0.52, 0.52, -0.46, 1.46, 1.1, 1.62, roof)
# průčelí: štít, dvě věže se špicemi
box((0, -0.5, 0.95), (0.62, 0.34, 1.9), stone)
cone((0, -0.5, 2.06), 0.28, 0.0, 0.5, roof, verts=4, rot=(0, 0, math.radians(45)))
for sx in (-1, 1):
    x = sx * 0.44
    box((x, -0.5, 0.78), (0.4, 0.4, 1.56), stone_d)
    box((x, -0.5, 1.58), (0.46, 0.46, 0.07), stone)
    cone((x, -0.5, 2.02), 0.27, 0.0, 0.9, roof, verts=8)
    for cx in (-1, 1):
        for cy in (-1, 1):
            cone((x + cx * 0.2, -0.5 + cy * 0.2, 1.78), 0.045, 0.0, 0.34, roof, verts=6)
    # okna věží
    box((x, -0.715, 1.2), (0.09, 0.02, 0.3), win_a if sx < 0 else win_b)
    box((x, -0.715, 0.55), (0.09, 0.02, 0.3), win_b if sx < 0 else win_a)
# růžice a portály
torus((0, -0.678, 1.25), 0.2, 0.035, stone_d, rot=(math.radians(90), 0, 0))
cyl((0, -0.682, 1.25), 0.185, 0.02, win_a, verts=24, rot=(math.radians(90), 0, 0))
for dx in (-0.2, 0, 0.2):
    box((dx, -0.69, 0.28), (0.12, 0.03, 0.46), dark)
    cone((dx, -0.69, 0.55), 0.06, 0.0, 0.14, dark, verts=3, rot=(math.radians(90), 0, math.radians(90)))
# Velká jižní věž s barokní helmicí
box((0.78, 0.4, 0.82), (0.5, 0.5, 1.64), stone)
box((0.78, 0.4, 1.66), (0.56, 0.56, 0.06), stone_d)
box((0.78, 0.4, 1.82), (0.36, 0.36, 0.26), stone)
cyl((0.78, 0.4, 2.04), 0.2, 0.18, copper, verts=20)
cone((0.78, 0.4, 2.26), 0.2, 0.08, 0.26, copper, verts=20)
cyl((0.78, 0.4, 2.46), 0.07, 0.16, goldm, verts=16)
cone((0.78, 0.4, 2.62), 0.07, 0.0, 0.16, goldm, verts=12)
for k in range(4):
    box((0.78, 0.585 - (0.0 if k % 2 else 0), 0.95 + k * 0.17), (0.12, 0.02, 0.1), win_a if k % 2 else win_b)
# opěrné oblouky a pinákly podél lodi
for sx in (-1, 1):
    for i in range(4):
        y = -0.15 + i * 0.5
        box((sx * 0.68, y, 0.62), (0.2, 0.09, 0.72), stone_d, rot=(0, sx * math.radians(-18), 0))
        box((sx * 0.8, y, 0.45), (0.1, 0.1, 0.9), stone_d)
        cone((sx * 0.8, y, 1.0), 0.07, 0.0, 0.3, roof, verts=6)
        box((sx * 0.502, y + 0.25, 0.62), (0.02, 0.1, 0.42), win_a if (i + sx) % 2 else win_b)
# vlajka na helmici
fpole_top = (0.78, 0.4, 3.0)
pole((0.78, 0.4, 2.7), fpole_top, r=0.014)
flag = Flag((0.79, 0.4, 2.98), 0.5, 0.32, [material("f_w", "#ffffff"), material("f_r", "#d7141a"), material("f_b", "#11457e")],
            lambda u, v: 2 if u < 0.5 * (1 - abs(v - 0.5) * 2) else (0 if v < 0.5 else 1), amp=0.1, waves=1.6, droop=0.02)

birds = [Bird(material("bird_b%d" % i, c, roughness=0.6), material("bird_w%d" % i, c, roughness=0.6), s=0.7) for i, c in enumerate(("#fff4e8", "#fff4e8", "#ffe6c8"))]


def update(t):
    ph = t * math.tau
    flag.update(t)
    set_glow(win_a, 3.2 + 1.4 * math.sin(ph))
    set_glow(win_b, 3.2 + 1.4 * math.sin(ph + math.pi))
    for i, b in enumerate(birds):
        a = ph + i * math.tau / 3
        r = 1.4 + 0.06 * math.sin(2 * ph + i)
        pos = (r * math.cos(a), 0.2 + 1.2 * math.sin(a) * 0.55, 2.2 + 0.2 * math.sin(a * 2 + i) + 0.08 * i)
        b.place(pos, a + math.pi / 2 + math.atan2(-0.55 * 0.0, 1), 0.7 * math.sin(ph * 4 + i * 1.7))


run(update, "znacka_cestina")
