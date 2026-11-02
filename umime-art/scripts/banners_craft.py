"""Pozadí profilu z craftování (public/cosmetics/banners/<id>.webp, 1200 × 400), stejná technika jako banners.py.

    python umime-art/scripts/banners_craft.py <výstupní složka> [id]
    PUBLISH=1 python umime-art/scripts/banners_craft.py <výstupní složka>     (převede PNG na webp do public/)

Ids: craft-nebula, craft-comet-trail, craft-reef, craft-lagoon, craft-grove, craft-amber-forest, craft-forge,
craft-throne, craft-moonlight, craft-dragon-lair. Střed obrázku je klidnější (jméno a avatar), detaily po stranách.
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import banners as B  # noqa: E402  (nic se nespouští, jen pomocné funkce; ARGS se čtou stejně)
from banners import add, camera, lin, mat, render, reset  # noqa: E402


def world_gradient(stops, strength=1.0, stars=0.0, star_scale=900):
    """Svislý přechod v pozadí (stops: [(poloha 0..1 odspodu, barva)]); volitelně hvězdy."""
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = stops[0][0]
    ramp.color_ramp.elements[0].color = lin(stops[0][1])
    ramp.color_ramp.elements[1].position = stops[-1][0]
    ramp.color_ramp.elements[1].color = lin(stops[-1][1])
    for pos, col in stops[1:-1]:
        e = ramp.color_ramp.elements.new(pos)
        e.color = lin(col)
    nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    out = ramp.outputs["Color"]
    if stars:
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.inputs["Scale"].default_value = star_scale
        nt.links.new(tc.outputs["Generated"], vor.inputs["Vector"])
        sr = nt.nodes.new("ShaderNodeValToRGB")
        sr.color_ramp.elements[0].position = 0.0
        sr.color_ramp.elements[0].color = (stars * 3, stars * 3, stars * 3, 1)
        sr.color_ramp.elements[1].position = 0.07
        sr.color_ramp.elements[1].color = (0, 0, 0, 1)
        nt.links.new(vor.outputs["Distance"], sr.inputs[0])
        add_n = nt.nodes.new("ShaderNodeMix")
        add_n.data_type = "RGBA"
        add_n.blend_type = "ADD"
        add_n.inputs[0].default_value = 1.0
        nt.links.new(out, add_n.inputs[6])
        nt.links.new(sr.outputs["Color"], add_n.inputs[7])
        out = add_n.outputs[2]
    nt.links.new(out, bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def banded(c1, c2, scale=4.0, rough=0.7):
    m = bpy.data.materials.new("pas")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "Z"
    wv.inputs["Scale"].default_value = scale
    wv.inputs["Distortion"].default_value = 3.0
    wv.inputs["Detail"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = lin(c1)
    cr.color_ramp.elements[1].color = lin(c2)
    nt.links.new(wv.outputs["Fac"], cr.inputs[0])
    nt.links.new(cr.outputs["Color"], b.inputs["Base Color"])
    return m


def sphere(loc, r, m, scale=(1, 1, 1), rot=(0, 0, 0), seg=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=rings, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    return add(o, m)


def box(loc, size, m, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = size
    if bevel:
        bv = o.modifiers.new("b", "BEVEL")
        bv.width = bevel
        bv.segments = 3
    return add(o, m)


def cyl(loc, r, h, m, rot=(0, 0, 0), r2=None, verts=48):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, vertices=verts, location=loc, rotation=rot)
    return add(bpy.context.active_object, m)


def ground(size, m, z=0.0, subdiv=0, strength=0.0, scale=4.0, seed=0):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=subdiv or 2, y_subdivisions=subdiv or 2, size=size, location=(0, 0, z))
    o = bpy.context.active_object
    add(o, m)
    if strength:
        tex = bpy.data.textures.new("t", "CLOUDS")
        tex.noise_scale = scale
        tex.noise_depth = 6
        d = o.modifiers.new("d", "DISPLACE")
        d.texture = tex
        d.strength = strength
        d.mid_level = 0.45
    return o


def sun(rot, energy=4.0, color="#ffffff", size=0.02):
    ld = bpy.data.lights.new("sun", "SUN")
    ld.energy = energy
    ld.color = lin(color)[:3]
    ld.angle = size
    lo = bpy.data.objects.new("sun", ld)
    bpy.context.collection.objects.link(lo)
    lo.rotation_euler = tuple(math.radians(a) for a in rot)
    return lo


def point(loc, energy, color="#ffffff", radius=0.2):
    ld = bpy.data.lights.new("p", "POINT")
    ld.energy = energy
    ld.color = lin(color)[:3]
    ld.shadow_soft_size = radius
    lo = bpy.data.objects.new("p", ld)
    bpy.context.collection.objects.link(lo)
    lo.location = loc
    return lo


def emit(color, strength):
    return mat(color, rough=0.5, emit=strength)


def fog(density, color):
    w = bpy.context.scene.world
    nt = w.node_tree
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Density"].default_value = density
    vol.inputs["Color"].default_value = lin(color)
    nt.links.new(vol.outputs["Volume"], nt.nodes["World Output"].inputs["Volume"])


def look(loc=(0, -14, 2.0), at=(0, 0, 2.0), lens=30):
    camera(loc, at, lens)


def stars_fields(rnd, n, x, y, z, size, col="#ffffff", strength=8.0):
    for _ in range(n):
        sphere((rnd.uniform(*x), rnd.uniform(*y), rnd.uniform(*z)), rnd.uniform(*size), emit(col, strength), seg=8, rings=6)


# --------------------------------------------------------------------------------------------- scény
def craft_nebula():
    reset(48)
    w = world_gradient([(0.0, "#080520"), (0.5, "#1a1050"), (1.0, "#080520")], 1.0, stars=1.4)
    nt = w.node_tree
    tc = nt.nodes["Texture Coordinate"]
    prev = [l for l in nt.links if l.to_node.name == "Background"][0].from_socket
    for scale, col, mixv, lo, hi in [(2.6, "#c84fd0", 0.55, 0.5, 0.82), (3.4, "#3f7cff", 0.5, 0.52, 0.85)]:
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = scale
        nz.inputs["Detail"].default_value = 12
        nt.links.new(tc.outputs["Generated"], nz.inputs["Vector"])
        cr = nt.nodes.new("ShaderNodeValToRGB")
        cr.color_ramp.elements[0].position = lo
        cr.color_ramp.elements[0].color = (0, 0, 0, 1)
        cr.color_ramp.elements[1].position = hi
        cr.color_ramp.elements[1].color = lin(col)
        nt.links.new(nz.outputs["Fac"], cr.inputs[0])
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "ADD"
        mix.inputs[0].default_value = mixv
        nt.links.new(prev, mix.inputs[6])
        nt.links.new(cr.outputs["Color"], mix.inputs[7])
        prev = mix.outputs[2]
    nt.links.new(prev, nt.nodes["Background"].inputs["Color"])
    look((0, -14, 2.0), (0, 0, 2.0), 30)
    sun((55, 0, -35), 4.0, "#fff0e0")
    # planeta s prstencem vpravo, měsíc vlevo
    sphere((7.6, 6, 3.0), 1.5, banded("#d98a5a", "#f6d8a8", 1.6))
    bpy.ops.mesh.primitive_torus_add(major_radius=2.3, minor_radius=0.3, location=(7.6, 6, 3.0), rotation=(math.radians(72), math.radians(10), 0), major_segments=96)
    ring = bpy.context.active_object
    ring.scale = (1, 1, 0.05)
    add(ring, mat("#d9b88a", rough=0.6))
    sphere((-8.4, 4, 0.9), 0.8, banded("#7a8cc0", "#b8c4e8", 2.5, 0.9))
    render("craft-nebula")


def craft_comet_trail():
    reset(48)
    world_gradient([(0.0, "#030a2a"), (0.55, "#0d1f6a"), (1.0, "#020618")], 1.0, stars=1.6)
    look((0, -14, 2.0), (0, 0, 2.0), 30)
    sun((55, 0, -35), 2.0, "#cfe0ff")
    rnd = random.Random(8)
    hx, hz = 8.4, 5.0
    # jádro a záře
    sphere((hx, 5, hz), 0.5, emit("#ffffff", 14.0))
    sphere((hx, 5, hz), 0.9, emit("#9fd8ff", 1.6), scale=(1, 0.6, 1))
    # ohon: stovky malých zářících částic kolem lehce zakřivené osy; dál od hlavy řidší a slabší
    blue = ["#8fd0ff", "#cfe8ff", "#6aa8ff", "#ffffff"]
    for _ in range(900):
        t = rnd.random() ** 1.5
        x = hx - 0.6 - t * 19
        z = hz - t * 1.6 + 0.25 * math.sin(t * 5)
        spread = 0.1 + t * 0.9
        px, pz = x + rnd.gauss(0, 0.12), z + rnd.gauss(0, spread * 0.6)
        r = rnd.uniform(0.025, 0.09) * (1.1 - t * 0.6)
        sphere((px, 5 + rnd.gauss(0, 0.4), pz), r, emit(rnd.choice(blue), 5.0 * (1 - t) + 0.4), seg=8, rings=6)
    for _ in range(70):
        sphere((rnd.uniform(-14, 9), rnd.uniform(0, 8), rnd.uniform(-0.5, 7)), rnd.uniform(0.02, 0.05), emit("#ffffff", 9.0), seg=8, rings=6)
    sphere((-8.6, 3, 0.7), 0.7, mat("#7a8cc0", rough=0.9))
    render("craft-comet-trail")


def craft_reef():
    reset(48)
    rnd = random.Random(5)
    w = world_gradient([(0.0, "#0b5f8a"), (0.5, "#1aa3d6"), (1.0, "#7fe3ff")], 1.0)
    look((0, -14, 2.4), (0, 0, 2.2), 30)
    sun((35, 0, -20), 6.0, "#e8fbff", 0.05)
    fog(0.004, "#7fe3ff")
    ground(80, mat("#e8d3a0", rough=0.9), z=0.0, subdiv=200, strength=0.6, scale=5)
    cols = ["#ff7a8a", "#ffb25c", "#c86bff", "#ff5d9a", "#ffd24d"]
    for side in (-1, 1):
        for k in range(9):
            x = side * rnd.uniform(4.2, 11)
            y = rnd.uniform(-2, 5)
            c = rnd.choice(cols)
            m = mat(c, rough=0.45, subsurface=0.3)
            h = rnd.uniform(1.2, 3.2)
            if rnd.random() < 0.5:
                # větvený korál: kmen a pár větví
                cyl((x, y, h / 2), 0.2, h, m, r2=0.12)
                for b in range(4):
                    a = rnd.uniform(0, math.tau)
                    cyl((x + math.cos(a) * 0.5, y + math.sin(a) * 0.5, h * 0.7 + b * 0.2), 0.1, 1.0, m, rot=(math.sin(a) * 0.9, -math.cos(a) * 0.9, 0), r2=0.06)
            else:
                # mozkový korál
                sphere((x, y, 0.3), rnd.uniform(0.7, 1.3), m, scale=(1, 1, 0.7))
    # ryby ve středu výš (klidné pozadí dole)
    for k in range(7):
        x, z = rnd.uniform(-9, 9), rnd.uniform(3.2, 5.4)
        c = rnd.choice(["#ffd24d", "#ff8a3d", "#4da3ff"])
        m = mat(c, rough=0.35, coat=0.5)
        sphere((x, 3, z), 0.3, m, scale=(1.7, 0.55, 1.0))
        cyl((x - 0.5, 3, z), 0.2, 0.3, m, rot=(0, math.radians(90), 0), r2=0.02)
    render("craft-reef")


def craft_lagoon():
    reset(48)
    B.sky(18, 200, strength=1.0, dust=1.5)
    look((0, -14, 1.6), (0, 0, 1.6), 30)
    # moře
    sea = ground(300, B.wave_material("#0aa8a8", "#5fe0d0", 0.03), z=0.0, subdiv=300, strength=0.12, scale=2.5)
    # písčité ostrůvky po stranách s palmami
    sand = mat("#f2dfa8", rough=0.9)
    for side in (-1, 1):
        sphere((side * 9, 3, -0.4), 4.0, sand, scale=(1.5, 1, 0.35))
        for k in range(2):
            x = side * (7.4 + k * 2.4)
            cyl((x, 3 + k, 2.0), 0.18, 4.2, mat("#8a5a2b", rough=0.8), rot=(0, math.radians(side * 8), 0), r2=0.12)
            for lf in range(8):
                a = lf * math.tau / 8
                sphere((x + math.cos(a) * 1.0, 3 + k + math.sin(a) * 1.0, 4.1 - 0.25), 0.9, mat("#3f9c3a" if lf % 2 else "#58b947", rough=0.6), scale=(1.4, 0.18, 0.1), rot=(0, math.radians(-12), a))
    # vzdálený ostrov
    sphere((1, 30, -2), 8, mat("#4a8a5a", rough=0.9), scale=(2.4, 1, 0.5))
    render("craft-lagoon")


def _trees(rnd, cols, n, xr, yr, hr):
    for _ in range(n):
        x = rnd.choice([-1, 1]) * rnd.uniform(*xr)
        y = rnd.uniform(*yr)
        h = rnd.uniform(*hr)
        B.round_tree(x, y, 0, h, rnd, rnd.choice(cols))


def craft_grove():
    reset(48)
    rnd = random.Random(11)
    B.sky(9, 180, strength=1.0, dust=4.0)
    B.haze(0.004, "#fff2c0", 0.5)
    look((0, -14, 2.4), (0, 0, 2.6), 30)
    ground(200, mat("#2f8f55", rough=0.95), z=0.0, subdiv=200, strength=0.5, scale=6)
    _trees(rnd, ["#2f8f55", "#3f9a52", "#5ab86a"], 22, (4.5, 16), (-1, 18), (4, 9))
    # prastarý strom vlevo: tlustý kmen, kořeny, koruna
    cyl((-7.4, 3, 3.5), 1.1, 7.0, mat("#5a4030", rough=0.9), r2=0.7)
    for k in range(5):
        a = k * math.tau / 5
        cyl((-7.4 + math.cos(a) * 1.2, 3 + math.sin(a) * 1.2, 0.35), 0.35, 1.6, mat("#5a4030", rough=0.9), rot=(math.sin(a) * 1.2, -math.cos(a) * 1.2, 0), r2=0.12)
    for (dx, dz, r) in [(0, 8.0, 3.0), (-1.8, 7.0, 2.2), (1.9, 7.2, 2.4)]:
        sphere((-7.4 + dx, 3, dz), r, mat("#3f9c3a", rough=0.7), scale=(1, 1, 0.8))
    # světlušky a zlatý prach ve vzduchu
    for _ in range(40):
        sphere((rnd.uniform(-11, 11), rnd.uniform(-2, 8), rnd.uniform(0.6, 6.0)), rnd.uniform(0.03, 0.06), emit("#fff2a0", 12.0), seg=8, rings=6)
    render("craft-grove")


def craft_amber_forest():
    reset(48)
    rnd = random.Random(21)
    B.sky(6, 200, strength=0.9, dust=7.0)
    B.haze(0.006, "#ffcf80", 0.5)
    look((0, -14, 2.4), (0, 0, 2.6), 30)
    ground(200, mat("#9a6a2a", rough=0.95), z=0.0, subdiv=200, strength=0.5, scale=6)
    _trees(rnd, ["#e8a830", "#d9822b", "#c0602a", "#f2c05a"], 26, (4.2, 16), (-1, 18), (4, 9))
    # spadané listí na zemi a ve vzduchu
    for _ in range(140):
        x, y = rnd.uniform(-14, 14), rnd.uniform(-3, 9)
        z = 0.08 if rnd.random() < 0.6 else rnd.uniform(0.5, 6)
        sphere((x, y, z), 0.14, mat(rnd.choice(["#e8a830", "#d9822b", "#c0602a"]), rough=0.6), scale=(1, 0.7, 0.12), rot=(rnd.uniform(0, 1), rnd.uniform(0, 1), rnd.uniform(0, 6)), seg=12, rings=8)
    # kus jantaru vpravo dole se světlem uvnitř
    sphere((7.6, 0.4, 0.8), 0.9, mat("#ffb02a", rough=0.15, coat=1.0, transmission=0.6, emit=0.8, emit_color="#ff9a1a"), scale=(1.1, 0.9, 1.0))
    render("craft-amber-forest")


def craft_forge():
    reset(48)
    rnd = random.Random(4)
    world_gradient([(0.0, "#0a0508"), (1.0, "#1a0e0e")], 0.4)
    look((0, -12, 2.2), (0, 0, 2.2), 30)
    stone = mat("#4a3a3a", rough=0.9)
    # zadní zeď z kamenů a podlaha
    for row in range(7):
        for col in range(18):
            ox = (0.55 if row % 2 else 0.0)
            box((-12 + col * 1.4 + ox, 6, 0.4 + row * 0.8), (1.3, 0.5, 0.74), mat(rnd.choice(["#4a3a3a", "#5a4444", "#3a2e2e"]), rough=0.95), bevel=0.04)
    ground(60, mat("#2a2020", rough=0.8), z=0.0)
    # výheň vpravo, kovadlina vlevo
    box((8.0, 3.5, 1.4), (3.0, 2.0, 2.8), stone, bevel=0.1)
    box((8.0, 2.4, 1.0), (1.8, 0.2, 1.1), emit("#ff7a1a", 14.0))
    sphere((8.0, 2.3, 1.0), 0.9, emit("#ffd24d", 20.0), scale=(1.4, 0.3, 0.9))
    point((8.0, 1.5, 1.2), 600, "#ff8a2a", 0.8)
    box((-8.2, 3, 0.55), (1.5, 1.0, 1.1), mat("#3a2a20", rough=0.8), bevel=0.05)
    iron = mat("#2c2a33", rough=0.35, metal=0.9)
    box((-8.2, 3, 1.35), (2.3, 0.8, 0.5), iron, bevel=0.07)
    box((-9.5, 3, 1.5), (0.9, 0.5, 0.25), iron, rot=(0, 0, 0), bevel=0.05)
    cyl((-8.0, 2.4, 1.65), 0.05, 1.2, mat("#ff8a2a", rough=0.4, emit=4.0), rot=(0, math.radians(75), 0))
    # jiskry
    for _ in range(60):
        sphere((rnd.uniform(-10, 10), rnd.uniform(0, 5), rnd.uniform(0.8, 6)), rnd.uniform(0.02, 0.05), emit("#ffb84d", 18.0), seg=8, rings=6)
    point((-8.0, 2.0, 2.0), 120, "#ff9a3a", 0.5)
    render("craft-forge")


def craft_throne():
    reset(48)
    rnd = random.Random(2)
    world_gradient([(0.0, "#1a0a14"), (1.0, "#2a1020")], 0.5)
    look((0, -14, 3.0), (0, 0, 3.0), 28)
    marble = mat("#d8d0e0", rough=0.25, coat=0.4)
    ground(80, mat("#6a2030", rough=0.5, coat=0.3), z=0.0)
    box((0, 3, 0.02), (4.0, 40, 0.04), mat("#a8182e", rough=0.7))
    box((0, 3, 0.05), (4.4, 40, 0.01), mat("#ffc933", rough=0.4, metal=0.8))
    # sloupy po stranách a červené prapory
    for side in (-1, 1):
        for k in range(4):
            x, y = side * (6.5 + k * 1.2), 1.5 + k * 4.5
            cyl((x, y, 3.5), 0.7, 7.0, marble)
            cyl((x, y, 0.2), 0.95, 0.4, marble)
            cyl((x, y, 7.0), 0.95, 0.4, marble)
            box((x - side * 0.1, y - 0.8, 4.4), (0.08, 0.1, 3.0), mat("#c0192e", rough=0.8))
    # trůn vzadu vpravo, vitráž světlo zleva
    box((6.4, 14, 1.2), (3.2, 2.2, 2.4), marble, bevel=0.08)
    box((6.4, 14.8, 3.6), (2.0, 0.5, 3.6), mat("#c0192e", rough=0.5, coat=0.3), bevel=0.1)
    box((6.4, 14.8, 5.6), (2.4, 0.5, 0.5), mat("#ffc933", rough=0.3, metal=0.9), bevel=0.05)
    sun((60, 0, 40), 5.0, "#ffe4b0", 0.1)
    point((0, 4, 6.5), 500, "#ffd9a0", 0.6)
    render("craft-throne")


def craft_moonlight():
    reset(48)
    rnd = random.Random(13)
    w = world_gradient([(0.0, "#8a5acf"), (0.4, "#4a2a8a"), (1.0, "#0a0838")], 1.0, stars=1.5)
    look((0, -14, 1.8), (0, 0, 3.2), 30)
    sun((60, 0, -50), 1.2, "#cfd8ff")
    fog(0.003, "#8a6acf")
    # měsíc vpravo nahoře se září
    sphere((9.0, 40, 12.0), 4.2, emit("#fffbe0", 9.0))
    sphere((9.0, 39, 12.0), 7.0, emit("#c8b8ff", 0.6), scale=(1, 0.2, 1))
    ground(300, mat("#1a1040", rough=0.9), z=-0.4, subdiv=260, strength=2.6, scale=9)
    for side in (-1, 1):
        for k in range(7):
            sphere((side * rnd.uniform(5, 16), rnd.uniform(4, 26), 0), rnd.uniform(2, 5), mat("#1c1448", rough=0.9), scale=(1.4, 1, 1.0))
    # věž s čarodějným kloboukem vlevo
    cyl((-8.2, 7, 4.0), 0.9, 8.0, mat("#2a1c58", rough=0.8))
    cyl((-8.2, 7, 9.6), 1.5, 3.2, mat("#3a2a7a", rough=0.7), r2=0.0)
    sphere((-8.2, 6.2, 5.2), 0.22, emit("#ffd24d", 12.0))
    for _ in range(26):
        sphere((rnd.uniform(-13, 13), rnd.uniform(1, 10), rnd.uniform(1, 8)), rnd.uniform(0.03, 0.07), emit("#e8e0ff", 14.0), seg=8, rings=6)
    render("craft-moonlight")


def craft_dragon_lair():
    reset(48)
    rnd = random.Random(7)
    world_gradient([(0.0, "#080208"), (1.0, "#140612")], 0.3)
    look((0, -14, 2.4), (0, 0, 2.4), 30)
    rock = mat("#2c2030", rough=0.95)
    # jeskyně: hrubé skály ze šumu kolem dokola
    for (loc, sz, rot) in [((0, 14, 5), 40, (math.radians(90), 0, 0)), ((-16, 4, 5), 40, (0, math.radians(90), 0)), ((16, 4, 5), 40, (0, math.radians(90), 0)), ((0, 4, 16), 40, (0, 0, 0))]:
        bpy.ops.mesh.primitive_grid_add(x_subdivisions=200, y_subdivisions=200, size=sz, location=loc, rotation=rot)
        o = bpy.context.active_object
        add(o, rock)
        tex = bpy.data.textures.new("t", "CLOUDS")
        tex.noise_scale = 2.4
        tex.noise_depth = 8
        d = o.modifiers.new("d", "DISPLACE")
        d.texture = tex
        d.strength = 3.0
        d.mid_level = 0.45
    # láva na podlaze
    lava = bpy.data.materials.new("lava")
    lava.use_nodes = True
    nt = lava.node_tree
    b = nt.nodes["Principled BSDF"]
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.6
    nz.inputs["Detail"].default_value = 10
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.42
    cr.color_ramp.elements[0].color = lin("#1a0a0a")
    cr.color_ramp.elements[1].position = 0.6
    cr.color_ramp.elements[1].color = lin("#ff7a1a")
    nt.links.new(nz.outputs["Fac"], cr.inputs[0])
    nt.links.new(cr.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(cr.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 4.0
    ground(60, lava, z=0.05, subdiv=2)
    # hromada zlata a drahokamů vpravo
    gold = mat("#ffc933", rough=0.25, metal=1.0)
    for _ in range(90):
        a, r = rnd.uniform(0, math.tau), abs(rnd.gauss(0, 1.8))
        sphere((7.6 + math.cos(a) * r, 2 + math.sin(a) * r * 0.7, 0.3 + max(0, 1.6 - r) * 0.6 + rnd.uniform(0, 0.2)), rnd.uniform(0.2, 0.34), gold if rnd.random() < 0.8 else mat(rnd.choice(["#e5484d", "#4da3ff", "#3ddc97"]), rough=0.1, coat=1.0), scale=(1, 1, 0.45), seg=16, rings=10)
    # dračí oči ve tmě vlevo
    for ex in (-8.6, -7.4):
        sphere((ex, 5.2, 3.6), 0.35, emit("#ffd24d", 30.0), scale=(1.0, 0.5, 1.0))
        sphere((ex, 4.9, 3.6), 0.1, mat("#000000", rough=0.5), scale=(0.35, 0.4, 1.0))
    point((7.6, 1.5, 1.6), 700, "#ffb02a", 0.8)
    point((0, 2, 0.8), 400, "#ff6a1a", 1.0)
    render("craft-dragon-lair")


SCENES = {
    "craft-nebula": craft_nebula,
    "craft-comet-trail": craft_comet_trail,
    "craft-reef": craft_reef,
    "craft-lagoon": craft_lagoon,
    "craft-grove": craft_grove,
    "craft-amber-forest": craft_amber_forest,
    "craft-forge": craft_forge,
    "craft-throne": craft_throne,
    "craft-moonlight": craft_moonlight,
    "craft-dragon-lair": craft_dragon_lair,
}


def publish(src):
    from PIL import Image

    dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "cosmetics", "banners")
    for name in SCENES:
        path = os.path.join(src, name + ".png")
        if os.path.exists(path):
            Image.open(path).convert("RGB").resize((1200, 400), Image.LANCZOS).save(os.path.join(dst, name + ".webp"), quality=88, method=6)
            print("published", name)


if __name__ == "__main__":
    args = [a for a in sys.argv[sys.argv.index("--") + 1 :]] if "--" in sys.argv else sys.argv[1:]
    if os.environ.get("PUBLISH"):
        publish(args[0])
    else:
        only = args[1] if len(args) > 1 else None
        for k, fn in SCENES.items():
            if only and only != k:
                continue
            fn()
