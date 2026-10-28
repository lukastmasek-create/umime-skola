"""Školní předměty pro prstenec kolem globusu a pozadí sekce: knihy, tužka, baňka, atom, kalkulačka,
pravítko, maturitní čepice, žárovka, lupa, glóbus, kostky, svitek; navíc papírové letadlo a raketa.
Každý předmět je jeden snímek 192 px (průhledné pozadí); pohyb obstarává web.

Spuštění: python znacky_predmety.py [-- jméno ...]  (bez jmen vykreslí všechny)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *


def scene(name, el=24, az=-30, ortho=2.5, target=(0, 0, 0)):
    sc = setup(name, samples=128, size=256, frames=1, az=az, el=el, ortho=ortho, target_z=target[2], world=("#ffffff", 0.9))
    return sc


def finish(name):
    run(lambda t: None, name)


M = lambda n, c, **k: material(n, c, **k)


def kniha():
    cols = ["#e8453c", "#3b7be0", "#ffc933"]
    z = -0.55
    for i, (c, w, off) in enumerate(zip(cols, (1.5, 1.3, 1.1), (0.0, 0.08, -0.06))):
        m = M("kn%d" % i, c, roughness=0.5)
        box((off, 0, z + 0.14), (w, 0.95, 0.28), M("pg%d" % i, "#fff6e0", roughness=0.8), bevel=0.02)
        box((off, -0.02, z + 0.14), (w + 0.04, 0.95, 0.07), m, bevel=0.02)       # spodní deska
        box((off, -0.02, z + 0.27), (w + 0.04, 0.95, 0.06), m, bevel=0.02)       # horní deska
        box((off - w / 2, 0, z + 0.14), (0.07, 0.95, 0.3), m, bevel=0.02)         # hřbet
        box((off + 0.1, -0.48, z + 0.27), (0.3, 0.01, 0.015), M("lb%d" % i, "#ffd24d", metallic=0.8, roughness=0.3), bevel=0)
        z += 0.3


def tuzka():
    yellow, wood, lead, pink, metal = M("y", "#ffc933", roughness=0.4), M("w", "#f0c99a", roughness=0.7), M("l", "#2a2a35", roughness=0.4), M("p", "#ff8fb0", roughness=0.6), M("mt", "#c9ced6", roughness=0.25, metallic=0.9)
    rot = (0, math.radians(90), math.radians(35))
    parts = [cyl((0, 0, 0), 0.13, 1.5, yellow, verts=6, rot=(0, 0, 0)),
             cone((0, 0, 0.88), 0.13, 0.03, 0.26, wood, verts=6),
             cone((0, 0, 1.07), 0.04, 0.0, 0.12, lead, verts=12),
             cyl((0, 0, -0.8), 0.14, 0.12, metal, verts=14), cyl((0, 0, -0.93), 0.13, 0.16, pink, verts=14)]
    root = bpy.data.objects.new("r", None)
    bpy.context.scene.collection.objects.link(root)
    for o in parts:
        loc = o.location.copy(); o.parent = root; o.location = loc
    root.rotation_euler = (math.radians(15), math.radians(55), 0)
    root.location = (0, 0, 0)


def banka():
    glass = M("gl", "#cfe9ff", roughness=0.05)
    glass.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1.0
    glass.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.2
    liquid = glow("liq", "#4cff9a", 1.2)
    cone((0, 0, -0.35), 0.62, 0.2, 0.8, liquid, verts=40)
    cyl((0, 0, 0.32), 0.2, 0.7, glass, verts=32)
    torus((0, 0, 0.68), 0.21, 0.035, glass)
    gl2 = M("glo", "#bfe3ff", roughness=0.05)
    gl2.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1.0
    gl2.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.2
    cone((0, 0, -0.35), 0.66, 0.24, 0.84, gl2, verts=40)
    for i, (x, y, r) in enumerate(((0.12, 0.05, 0.08), (-0.18, -0.1, 0.06), (0.0, -0.18, 0.05))):
        sphere((x, y, -0.05 + i * 0.12), r, glow("bub%d" % i, "#d9ffe9", 1.0), seg=12, rings=8)


def atom():
    core = glow("core", "#ff6a6a", 1.5)
    for i, c in enumerate(("#ff6a6a", "#ffd24d", "#6ab6ff", "#7dff9a")):
        a = math.radians(i * 40 + 20)
        sphere((0.15 * math.cos(a), 0.15 * math.sin(a), 0.1 * math.cos(a * 2)), 0.16, glow("n%d" % i, c, 1.3), seg=16, rings=10)
    ring_m = M("ring", "#5d7cff", roughness=0.3, metallic=0.4)
    for k, (rx, rz) in enumerate(((0.0, 0.0), (math.radians(60), 0), (math.radians(-60), 0))):
        torus((0, 0, 0), 0.82, 0.022, ring_m, rot=(math.radians(90) + rx, 0, math.radians(60 * k)))
        a = math.radians(70 + 120 * k)
        e = sphere((0.82 * math.cos(a), 0.0, 0.82 * math.sin(a)), 0.085, glow("el%d" % k, "#ffffff", 2.0), seg=12, rings=8)
        e.parent = None


def kalkulacka():
    body = M("cb", "#ff8a6b", roughness=0.5)
    box((0, 0, 0), (1.0, 0.18, 1.45), body, bevel=0.06, smooth=False)
    box((0, -0.095, 0.45), (0.82, 0.02, 0.38), glow("scr", "#9dffcf", 0.9), bevel=0.01)
    keys = ["#ffffff", "#ffffff", "#ffd24d"]
    for r in range(4):
        for c in range(3):
            box((-0.27 + c * 0.27, -0.1, 0.05 - r * 0.25), (0.2, 0.04, 0.17), M("k%d%d" % (r, c), keys[2 if c == 2 else 0], roughness=0.4), bevel=0.02)
    root = None


def pravitko():
    wood = M("rw", "#ffd24d", roughness=0.4)
    t = M("tri", "#7ee0b0", roughness=0.15)
    rul = box((0, 0, 0), (1.9, 0.07, 0.38), wood, rot=(0, math.radians(-20), 0), bevel=0.02)
    for i in range(14):
        h = 0.14 if i % 5 == 0 else 0.08
        a = math.radians(-20)
        x = -0.85 + i * 0.13
        box((x * math.cos(a), -0.045, -x * math.sin(a) + 0.19 * math.cos(a) - h / 2), (0.012, 0.01, h), M("tk", "#2a2a35"), rot=(0, a, 0), bevel=0)
    mesh_obj("tr", [(-0.5, -0.04, -0.55), (0.75, -0.04, -0.55), (-0.5, -0.04, 0.7)], [(0, 1, 2)], t)
    box((0.1, 0.0, -0.5), (1.3, 0.05, 0.1), t, bevel=0.01)


def cepice():
    black, gold = M("cap", "#2b2a4a", roughness=0.5), M("tas", "#ffc933", roughness=0.3, metallic=0.7)
    cyl((0, 0, -0.22), 0.52, 0.48, black, verts=32)
    box((0, 0, 0.18), (1.5, 1.5, 0.08), black, rot=(0, 0, math.radians(45)), bevel=0.02)
    sphere((0, 0, 0.24), 0.06, gold, seg=12, rings=8)
    bar((0, 0, 0.24), (0.62, 0.62, 0.15), 0.018, gold, verts=8)
    bar((0.62, 0.62, 0.15), (0.64, 0.64, -0.15), 0.018, gold, verts=8)
    cyl((0.65, 0.65, -0.24), 0.06, 0.2, gold, verts=12)


def zarovka():
    glass = glow("bulb", "#ffe27a", 0.45)
    sphere((0, 0, 0.35), 0.56, glass, seg=36, rings=24)
    cone((0, 0, -0.32), 0.3, 0.22, 0.3, M("neck", "#e8e2c8", roughness=0.3, metallic=0.4), verts=24)
    cyl((0, 0, -0.55), 0.24, 0.26, M("scr", "#9aa0ac", roughness=0.35, metallic=0.9), verts=24)
    for i in range(3):
        torus((0, 0, -0.5 - i * 0.07), 0.245, 0.018, M("sc%d" % i, "#7a808c", roughness=0.4, metallic=0.9))
    bar((-0.1, 0, -0.1), (-0.1, 0, 0.3), 0.012, M("fil", "#ff9a3c"), verts=6)
    bar((0.1, 0, -0.1), (0.1, 0, 0.3), 0.012, M("fil2", "#ff9a3c"), verts=6)
    bar((-0.1, 0, 0.3), (0.1, 0, 0.3), 0.014, glow("fl", "#ffb347", 4.0), verts=6)


def lupa():
    handle, rim, glass = M("h", "#ff5a3c", roughness=0.4), M("rm", "#ffc933", roughness=0.3, metallic=0.8), M("lg", "#bfe3ff", roughness=0.05)
    cyl((0.0, 0, 0.18), 0.5, 0.06, glass, verts=40, rot=(math.radians(90), 0, 0))
    torus((0.0, 0, 0.18), 0.5, 0.075, rim, rot=(math.radians(90), 0, 0))
    bar((0.36, 0, -0.18), (0.82, 0, -0.78), 0.1, handle, verts=14)
    sphere((0.84, 0, -0.8), 0.1, handle, seg=14, rings=10)


def glob():
    ocean, land = M("oc", "#3b8be0", roughness=0.3), M("ld", "#6fd06a", roughness=0.6)
    sphere((0, 0, 0.1), 0.6, ocean, seg=40, rings=28)
    for (x, y, z, sx, sy, sz) in ((0.2, -0.42, 0.35, 0.22, 0.1, 0.28), (-0.25, -0.45, 0.0, 0.2, 0.1, 0.2), (0.35, -0.3, -0.2, 0.16, 0.08, 0.2), (-0.5, -0.1, 0.4, 0.1, 0.08, 0.15)):
        sphere((x, y, z + 0.1), 1.0, land, scale=(sx, sy, sz), seg=16, rings=10)
    torus((0, 0, 0.1), 0.7, 0.03, M("mer", "#ffc933", metallic=0.8, roughness=0.3), rot=(math.radians(90), 0, math.radians(20)))
    cyl((0, 0, -0.65), 0.07, 0.35, M("st", "#6b4a2d", roughness=0.6), verts=14)
    cyl((0, 0, -0.85), 0.35, 0.08, M("bs", "#6b4a2d", roughness=0.6), verts=28)


def kostky():
    cols = ["#ff5a3c", "#3b9bff", "#ffd24d"]
    spots = [((-0.45, 0.0, -0.3), 0.7, 12), ((0.4, 0.05, -0.3), 0.7, -8), ((0.0, 0.1, 0.35), 0.7, 25)]
    for i, ((x, y, z), s, rot) in enumerate(spots):
        box((x, y, z), (s, s, s), M("kb%d" % i, cols[i], roughness=0.45), rot=(0, 0, math.radians(rot)), bevel=0.06)
        # písmeno na přední straně z tyčinek
        a = math.radians(rot)
        ox, oy = math.sin(a) * -0.355, -math.cos(a) * 0.355
        wm = M("kl%d" % i, "#ffffff", roughness=0.4)
        cx, cy = x + ox, y + oy
        if i == 0:
            box((cx, cy, z - 0.02), (0.06, 0.02, 0.38), wm, rot=(0, 0, a), bevel=0)
            box((cx, cy, z + 0.16), (0.24, 0.02, 0.06), wm, rot=(0, 0, a), bevel=0)
            box((cx, cy, z), (0.2, 0.02, 0.06), wm, rot=(0, 0, a), bevel=0)
        elif i == 1:
            for dz in (-0.14, 0.0, 0.14):
                box((cx, cy, z + dz), (0.22, 0.02, 0.05), wm, rot=(0, 0, a), bevel=0)
            box((cx, cy, z), (0.05, 0.02, 0.33), wm, rot=(0, 0, a), bevel=0)
        else:
            for dz in (-0.14, 0.14):
                box((cx, cy, z + dz), (0.22, 0.02, 0.05), wm, rot=(0, 0, a), bevel=0)
            box((cx, cy, z), (0.05, 0.02, 0.33), wm, rot=(0, 0, a), bevel=0)


def svitek():
    paper = M("sv", "#f5e3b5", roughness=0.8)
    for z in (-0.5, 0.5):
        cyl((0, 0, z * 0.0 + 0.0), 0.2, 0.01, paper, verts=4)
    cyl((0, 0, 0), 0.34, 1.35, paper, verts=32, rot=(0, math.radians(90), 0))
    for x in (-0.7, 0.7):
        cyl((x, 0, 0), 0.4, 0.14, M("sw", "#a86b3a", roughness=0.6), verts=24, rot=(0, math.radians(90), 0))
        sphere((x * 1.15, 0, 0), 0.1, M("kn", "#ffc933", metallic=0.8, roughness=0.3), seg=12, rings=8)
    for i, w in enumerate((0.8, 0.6, 0.7)):
        box((0, -0.345, 0.12 - i * 0.14), (w, 0.01, 0.04), M("li", "#6b4a2d"), bevel=0)
    seal = sphere((0.35, -0.32, -0.2), 0.1, M("seal", "#e53935", roughness=0.4), scale=(1, 0.4, 1))


def letadlo():
    paper = M("pap", "#dfe7f8", roughness=0.8)
    shade = M("pap2", "#a9bcea", roughness=0.8)
    pink = M("pap3", "#ffb6d5", roughness=0.8)
    # papírové letadlo míří doprava (+x): trup, dvě křídla a kýl
    mesh_obj("kridlo_l", [(1.0, 0, 0.0), (-0.8, 0.0, 0.05), (-0.8, -0.75, 0.32), (0.0, -0.03, 0.0)], [(0, 1, 2), (0, 2, 3)], paper)
    mesh_obj("kridlo_r", [(1.0, 0, 0.0), (-0.8, 0.0, 0.05), (-0.8, 0.75, 0.32), (0.0, 0.03, 0.0)], [(0, 2, 1), (0, 3, 2)], shade)
    mesh_obj("kil", [(1.0, 0, 0.0), (-0.8, 0.0, 0.05), (-0.8, 0.0, -0.28), (0.1, 0.0, -0.06)], [(0, 1, 2), (0, 2, 3)], pink)
    mesh_obj("kil2", [(1.0, 0, 0.0), (-0.8, 0.0, 0.05), (-0.8, 0.0, -0.28), (0.1, 0.0, -0.06)], [(0, 2, 1), (0, 3, 2)], pink)
    tipm = M("tip", "#ff7ab0", roughness=0.7)
    mesh_obj("hrot_l", [(1.0, 0, 0.006), (0.55, -0.02, 0.006), (0.55, -0.2, 0.09)], [(0, 1, 2)], tipm)
    mesh_obj("hrot_r", [(1.0, 0, -0.006), (0.55, 0.02, -0.006), (0.55, 0.2, 0.07)], [(0, 2, 1)], tipm)
    crease = M("crease", "#8aa0d0", roughness=0.8)
    bar((1.0, 0, 0.003), (-0.8, 0, 0.055), 0.012, crease, verts=6)
    bar((0.1, -0.02, 0.0), (-0.8, -0.5, 0.2), 0.006, crease, verts=4)
    bar((0.1, 0.02, 0.0), (-0.8, 0.5, 0.2), 0.006, crease, verts=4)


def raketa():
    body, red, win, gold = M("rb", "#f4f6ff", roughness=0.35, metallic=0.2), M("rr", "#ff5a3c", roughness=0.4), glow("rw", "#8fd0ff", 1.5), M("rg", "#ffc933", roughness=0.3, metallic=0.6)
    root = bpy.data.objects.new("rk", None)
    bpy.context.scene.collection.objects.link(root)
    P = [cyl((0, 0, 0), 0.3, 1.2, body, verts=32), cone((0, 0, 0.9), 0.3, 0.0, 0.6, red, verts=32),
         torus((0, -0.0, 0.18), 0.305, 0.035, gold, rot=(0, 0, 0)),
         cyl((0, -0.29, 0.25), 0.12, 0.05, M("rwr", "#2a4a8a", roughness=0.3, metallic=0.5), verts=24, rot=(math.radians(90), 0, 0)),
         cyl((0, -0.31, 0.25), 0.095, 0.04, win, verts=24, rot=(math.radians(90), 0, 0)),
         cone((0, 0, -0.75), 0.25, 0.15, 0.3, M("nz", "#7a808c", metallic=0.8, roughness=0.3), verts=24)]
    for a in (0, 120, 240):
        ar = math.radians(a)
        P.append(box((0.32 * math.cos(ar), 0.32 * math.sin(ar), -0.45), (0.28, 0.05, 0.5), red, rot=(0, math.radians(-10), ar), bevel=0.02))
    for o in P:
        loc = o.location.copy(); o.parent = root; o.location = loc
    # rovnou nakloněná doprava (míří +x)
    root.rotation_euler = (0, math.radians(90), 0)


def mikroskop():
    body, metal, dark, glass_m = M("mb", "#3b7be0", roughness=0.35), M("mm", "#c9ced6", roughness=0.25, metallic=0.9), M("md", "#2a2a35", roughness=0.5), glow("ml", "#fff2a8", 1.0)
    cyl((0, 0, -0.78), 0.42, 0.1, dark, verts=28)
    box((0.0, 0.18, -0.2), (0.14, 0.14, 1.1), body, bevel=0.03)
    root = bpy.data.objects.new("tube", None)
    bpy.context.scene.collection.objects.link(root)
    tube = cyl((0, 0, 0), 0.085, 0.8, metal, verts=20)
    eye = cyl((0, 0, 0.45), 0.055, 0.14, dark, verts=16)
    obj = cone((0, 0, -0.5), 0.07, 0.03, 0.18, dark, verts=16)
    for o in (tube, eye, obj):
        loc = o.location.copy(); o.parent = root; o.location = loc
    root.location = (0, -0.05, 0.3)
    root.rotation_euler = (math.radians(-28), 0, 0)
    box((0, -0.14, -0.55), (0.46, 0.34, 0.05), metal, bevel=0.01)
    sphere((0.18, 0.26, -0.22), 0.07, metal, seg=12, rings=8)
    sphere((-0.18, 0.26, -0.22), 0.07, metal, seg=12, rings=8)
    cyl((0, -0.14, -0.62), 0.05, 0.12, body, verts=12)
    sphere((0, -0.14, -0.48), 0.04, glass_m, seg=10, rings=8)


def kruzitko():
    metal, tip, pen = M("km", "#c9ced6", roughness=0.25, metallic=0.9), M("kt", "#2a2a35", roughness=0.4), M("kp", "#ff5a3c", roughness=0.4)
    cyl((0, 0, 0.72), 0.07, 0.16, pen, verts=14)
    sphere((0, 0, 0.82), 0.075, metal, seg=12, rings=8)
    bar((0, 0.0, 0.7), (-0.5, 0, -0.75), 0.05, metal, verts=10)
    bar((0, 0.0, 0.7), (0.5, 0, -0.75), 0.05, metal, verts=10)
    cone((-0.5, 0, -0.8), 0.04, 0.0, 0.14, tip, verts=10, rot=(math.radians(180), 0, 0))
    cone((0.5, 0, -0.8), 0.045, 0.0, 0.16, M("kl", "#ff9a3c"), verts=10, rot=(math.radians(180), 0, 0))
    bar((-0.22, 0, 0.0), (0.22, 0, 0.0), 0.025, metal, verts=8)


def sesit():
    cov, pg, ring = M("sc", "#7ee0b0", roughness=0.5), M("sp", "#fffdf2", roughness=0.8), M("sr", "#9aa0ac", roughness=0.3, metallic=0.9)
    box((0, 0, 0), (1.15, 0.12, 1.5), cov, rot=(0, math.radians(8), 0), bevel=0.04)
    box((0.03, -0.075, 0.0), (1.0, 0.03, 1.38), pg, rot=(0, math.radians(8), 0), bevel=0.008)
    for i in range(7):
        box((0.03, -0.095, 0.55 - i * 0.17), (0.9, 0.006, 0.01), M("sl%d" % i, "#6ab6ff"), rot=(0, math.radians(8), 0), bevel=0)
    for i in range(5):
        torus((-0.5, -0.08, 0.5 - i * 0.25), 0.045, 0.012, ring, rot=(0, math.radians(90), 0))
    box((0.0, -0.1, 0.78), (0.5, 0.004, 0.1), M("sh", "#ffd24d"), rot=(0, math.radians(8), 0), bevel=0)


def dna():
    cols = ["#ff5a7a", "#6ab6ff", "#ffd24d", "#7dff9a"]
    prev1 = prev2 = None
    N = 14
    for i in range(N + 1):
        t = i / N
        z = -0.85 + 1.7 * t
        a = t * math.tau * 1.6
        p1 = (0.32 * math.cos(a), 0.32 * math.sin(a), z)
        p2 = (-0.32 * math.cos(a), -0.32 * math.sin(a), z)
        if prev1:
            bar(prev1, p1, 0.04, M("d1", "#ff5a7a", roughness=0.4), verts=8)
            bar(prev2, p2, 0.04, M("d2", "#6ab6ff", roughness=0.4), verts=8)
        if i % 1 == 0 and 0 < i < N:
            bar(p1, p2, 0.022, M("dr%d" % (i % 4), cols[i % 4], roughness=0.4), verts=6)
        sphere(p1, 0.055, M("dn1", "#ff5a7a", roughness=0.4), seg=10, rings=8)
        sphere(p2, 0.055, M("dn2", "#6ab6ff", roughness=0.4), seg=10, rings=8)
        prev1, prev2 = p1, p2


def pero():
    ink, nib, feather = M("ik", "#2a2a5a", roughness=0.2), M("nb", "#ffc933", roughness=0.25, metallic=0.9), M("fe", "#ffffff", roughness=0.7)
    cyl((0.0, 0.0, -0.55), 0.38, 0.5, ink, verts=28)
    cyl((0.0, 0.0, -0.25), 0.16, 0.12, ink, verts=20)
    torus((0, 0, -0.19), 0.17, 0.025, M("ikc", "#c9ced6", metallic=0.8, roughness=0.3))
    cyl((0, 0, -0.5), 0.395, 0.05, glow("ikl", "#5b7cff", 0.6), verts=28)
    # brk: tělo, hrot a prapor
    root = bpy.data.objects.new("pen", None)
    bpy.context.scene.collection.objects.link(root)
    parts = [bar((0, 0, 0), (0.0, 0, 1.2), 0.025, M("qs", "#f0e8d0"), verts=8)]
    for k in range(10):
        z = 0.3 + k * 0.095
        w = 0.28 * math.sin((k + 1) / 11 * math.pi) ** 0.7
        parts.append(box((w / 2, 0, z), (w, 0.01, 0.1), feather, rot=(0, math.radians(-18), 0), bevel=0))
        parts.append(box((-w * 0.4, 0, z), (w * 0.8, 0.01, 0.1), feather, rot=(0, math.radians(18), 0), bevel=0))
    parts.append(cone((0, 0, -0.04), 0.03, 0.0, 0.14, nib, verts=8, rot=(math.radians(180), 0, 0)))
    for o in parts:
        loc = o.location.copy(); o.parent = root; o.location = loc
    root.location = (0.05, 0, -0.1)
    root.rotation_euler = (0, math.radians(32), math.radians(10))


def rostlina():
    pot, soil, stem, leaf = M("pt", "#e07a4a", roughness=0.6), M("so", "#5a3d28", roughness=0.9), M("st", "#3fa752", roughness=0.6), [M("lf%d" % i, c, roughness=0.55) for i, c in enumerate(("#3fbf5c", "#58cf63", "#2f9e4f"))]
    cone((0, 0, -0.6), 0.36, 0.26, 0.5, pot, verts=24)
    torus((0, 0, -0.35), 0.3, 0.05, pot)
    cyl((0, 0, -0.36), 0.28, 0.03, soil, verts=24)
    bar((0, 0, -0.35), (0.03, 0.02, 0.4), 0.03, stem, verts=8)
    for k in range(6):
        a = k * math.tau / 6
        h = -0.05 + 0.12 * k
        sphere((0.22 * math.cos(a), 0.22 * math.sin(a), h), 0.2, leaf[k % 3], scale=(1.0, 0.45, 0.12), seg=14, rings=8).rotation_euler = (0.5 * math.sin(a), 0.5 * math.cos(a), a)
    sphere((0.03, 0.02, 0.55), 0.14, leaf[0], scale=(1, 1, 0.8), seg=14, rings=10)
    for k in range(5):  # květ
        pa = k * math.tau / 5
        sphere((0.12 * math.cos(pa), 0.12 * math.sin(pa), 0.78), 0.07, M("pe%d" % k, "#ff7ab0", roughness=0.5), scale=(1, 1, 0.6), seg=10, rings=6)
    sphere((0.0, 0.0, 0.8), 0.05, M("pc", "#ffd24d"), seg=10, rings=8)


ALL = {"kniha": kniha, "tuzka": tuzka, "banka": banka, "atom": atom, "kalkulacka": kalkulacka, "pravitko": pravitko, "cepice": cepice,
       "zarovka": zarovka, "lupa": lupa, "glob": glob, "kostky": kostky, "svitek": svitek, "letadlo": letadlo, "raketa": raketa,
       "mikroskop": mikroskop, "kruzitko": kruzitko, "sesit": sesit, "dna": dna, "pero": pero, "rostlina": rostlina}

if __name__ == "__main__":
    wanted = [a for a in args() if a in ALL] or list(ALL)
    for name in wanted:
        ortho = 2.6 if name in ("letadlo",) else 2.5
        scene("pr_" + name, el=22 if name != "letadlo" else 38, az=-30 if name != "letadlo" else -50, ortho=ortho)
        ALL[name]()
        finish("pr_" + name)
