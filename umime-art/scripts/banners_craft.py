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


_emit_cache = {}


def emit(color, strength):
    key = (bpy.context.scene.name, color, round(strength, 1))
    m = _emit_cache.get(key)
    if m is None or m.name not in bpy.data.materials:
        m = _emit_cache[key] = mat(color, rough=0.5, emit=strength)
    return m


def blob_mesh(name, pts, m):
    """Tisíce malých koulí jako jeden objekt (pts: [(x, y, z, r)]); bpy.ops po jedné by trvalo hodiny."""
    import bmesh
    from mathutils import Matrix

    bm = bmesh.new()
    for (x, y, z, r) in pts:
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r, matrix=Matrix.Translation((x, y, z)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return add(o, m)


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


# --------------------------------------------------------------------------------------------- pomocné objekty
# 1800 × 600; publikuje se zmenšené na 1200 × 400 (supersampling). DEBUG=1 = rychlý náhled.
DEBUG = bool(os.environ.get("DEBUG"))
B.W, B.H = (900, 300) if DEBUG else (1800, 600)
SAMPLES = 10 if DEBUG else 56


def rock(x, y, z, r, col="#6a6a72", squash=0.7, rnd=None):
    rnd = rnd or random
    o = sphere((x, y, z), r, mat(col, rough=0.95), scale=(rnd.uniform(0.9, 1.4), rnd.uniform(0.8, 1.2), squash), rot=(0, 0, rnd.uniform(0, 6)), seg=20, rings=12)
    tex = bpy.data.textures.new("t", "CLOUDS")
    tex.noise_scale = 0.6
    d = o.modifiers.new("d", "DISPLACE")
    d.texture = tex
    d.strength = r * 0.35
    return o


def mushroom(x, y, s, cap="#e5484d", glow=0.0):
    cyl((x, y, 0.35 * s), 0.12 * s, 0.7 * s, mat("#f2ead8", rough=0.7), r2=0.16 * s)
    m = mat(cap, rough=0.5, emit=glow, emit_color=cap) if glow else mat(cap, rough=0.5)
    sphere((x, y, 0.72 * s), 0.38 * s, m, scale=(1, 1, 0.6))
    if not glow:
        for k in range(5):
            a = k * math.tau / 5
            sphere((x + math.cos(a) * 0.2 * s, y + math.sin(a) * 0.2 * s, 0.88 * s), 0.05 * s, mat("#ffffff", rough=0.6), scale=(1, 1, 0.5), seg=10, rings=6)


def fern(x, y, s, col="#3f9c3a"):
    for k in range(9):
        a = k * math.tau / 9
        sphere((x + math.cos(a) * 0.5 * s, y + math.sin(a) * 0.5 * s, 0.35 * s), 0.55 * s, mat(col, rough=0.7), scale=(1.0, 0.12, 0.05), rot=(0, math.radians(-30), a), seg=12, rings=8)


def crystal(x, y, z, h, col, glow=3.0, tilt=0.0):
    m = mat(col, rough=0.1, coat=1.0, emit=glow)
    cyl((x, y, z), 0.18 * h, h, m, rot=(tilt, 0, 0), r2=0.0, verts=6)
    cyl((x + 0.25 * h, y + 0.1, z - 0.2 * h), 0.12 * h, 0.7 * h, m, rot=(tilt, 0.4, 0), r2=0.0, verts=6)


def flare(x, y, z, r, col="#ffffff"):
    sphere((x, y, z), r, emit(col, 20.0), seg=12, rings=8)
    sphere((x, y, z), r * 3.2, emit(col, 0.7), scale=(1, 0.3, 1), seg=12, rings=8)


# --------------------------------------------------------------------------------------------- scény
def craft_nebula():
    reset(SAMPLES)
    rnd = random.Random(3)
    w = world_gradient([(0.0, "#080520"), (0.5, "#1a1050"), (1.0, "#080520")], 1.0, stars=1.6, star_scale=1400)
    nt = w.node_tree
    tc = nt.nodes["Texture Coordinate"]
    prev = [l for l in nt.links if l.to_node.name == "Background"][0].from_socket
    for scale, col, mixv, lo, hi in [(2.6, "#c84fd0", 0.55, 0.5, 0.82), (3.4, "#3f7cff", 0.5, 0.52, 0.85), (7.0, "#ffb070", 0.35, 0.58, 0.8)]:
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = scale
        nz.inputs["Detail"].default_value = 14
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
    # planeta s prstencem a atmosférou vpravo, měsíc vlevo, vzdálené planetky
    sphere((7.6, 6, 3.0), 1.5, banded("#d98a5a", "#f6d8a8", 1.6))
    sphere((7.6, 5.9, 3.0), 1.62, emit("#ffb070", 0.5), scale=(1, 0.9, 1))
    bpy.ops.mesh.primitive_torus_add(major_radius=2.3, minor_radius=0.3, location=(7.6, 6, 3.0), rotation=(math.radians(72), math.radians(10), 0), major_segments=128)
    ring = bpy.context.active_object
    ring.scale = (1, 1, 0.05)
    add(ring, mat("#d9b88a", rough=0.6))
    sphere((-8.4, 4, 0.9), 0.8, banded("#7a8cc0", "#b8c4e8", 2.5, 0.9))
    sphere((-5.2, 12, 4.6), 0.35, banded("#6ad0c0", "#e8fff0", 3.0))
    sphere((-11.5, 10, 3.2), 0.5, banded("#c86a8a", "#ffd0e0", 2.0))
    # pás asteroidů
    for _ in range(46):
        a = rnd.uniform(-1.2, 1.2)
        rock(-12 + rnd.random() * 24, rnd.uniform(1, 9), -0.4 + math.sin(a) * 0.7 + rnd.random() * 0.8, rnd.uniform(0.06, 0.2), "#8a7a8a", 0.8, rnd)
    for x, z, r, c in [(-2.0, 5.8, 0.09, "#ffffff"), (3.5, 6.2, 0.07, "#ffd8a0"), (-6.2, 6.4, 0.08, "#a8c8ff"), (10.8, 0.6, 0.1, "#ffffff")]:
        flare(x, 14, z, r, c)
    render("craft-nebula")


def craft_comet_trail():
    reset(SAMPLES)
    world_gradient([(0.0, "#030a2a"), (0.55, "#0d1f6a"), (1.0, "#020618")], 1.0, stars=1.8, star_scale=1400)
    look((0, -14, 2.0), (0, 0, 2.0), 30)
    sun((55, 0, -35), 2.0, "#cfe0ff")
    rnd = random.Random(8)
    hx, hz = 8.4, 5.0
    sphere((hx, 5, hz), 0.5, emit("#ffffff", 14.0))
    sphere((hx, 5, hz), 0.9, emit("#9fd8ff", 1.6), scale=(1, 0.6, 1))
    sphere((hx, 5, hz), 1.5, emit("#5aa0ff", 0.35), scale=(1, 0.5, 1))
    blue = ["#8fd0ff", "#cfe8ff", "#6aa8ff", "#ffffff"]
    buckets = {}
    for _ in range(4000):
        t = rnd.random() ** 1.5
        x = hx - 0.6 - t * 19
        z = hz - t * 1.6 + 0.25 * math.sin(t * 5)
        spread = 0.1 + t * 0.9
        r = rnd.uniform(0.02, 0.08) * (1.1 - t * 0.6)
        key = (rnd.choice(blue), min(4, int(t * 5)))
        buckets.setdefault(key, []).append((x + rnd.gauss(0, 0.12), 5 + rnd.gauss(0, 0.4), z + rnd.gauss(0, spread * 0.6), r))
    for (col, lvl), pts in buckets.items():
        blob_mesh("ohon", pts, emit(col, 5.0 * (1 - lvl / 5) + 0.4))
    # druhá, menší kometa nahoře a planeta s horizontem dole
    sphere((-4.5, 8, 6.4), 0.18, emit("#ffe8c0", 12.0))
    pts = [(-4.5 + 0.4 + t * 3.0, 8, 6.4 + t * 0.4 + rnd.gauss(0, 0.05), 0.035 * (1 - t * 0.6)) for t in (rnd.random() for _ in range(300))]
    blob_mesh("ohon2", pts, emit("#ffd8a0", 1.5))
    sphere((0, 30, -22), 24, banded("#2a4a9a", "#6a9aff", 1.2, 0.8))
    sphere((0, 29, -21.5), 24.6, emit("#5aa0ff", 0.25), scale=(1, 0.5, 1))
    for _ in range(40):
        rock(rnd.uniform(-14, 14), rnd.uniform(1, 9), rnd.uniform(-0.6, 1.2), rnd.uniform(0.05, 0.16), "#7a8cc0", 0.8, rnd)
    blob_mesh("hvezdy", [(rnd.uniform(-14, 9), rnd.uniform(0, 8), rnd.uniform(-0.5, 7), rnd.uniform(0.02, 0.05)) for _ in range(120)], emit("#ffffff", 9.0))
    render("craft-comet-trail")


def craft_reef():
    reset(SAMPLES)
    rnd = random.Random(5)
    # Bez mlhy ve světě: nekonečný objem pohltí pozadí; hloubku vody nahradí přechod barvy.
    world_gradient([(0.0, "#0b6f9a"), (0.5, "#2ab8e8"), (1.0, "#9fefff")], 1.6)
    look((0, -14, 2.4), (0, 0, 2.2), 30)
    sun((35, 0, -20), 2.6, "#e8fbff", 0.05)
    point((0, -4, 7), 260, "#bff4ff", 2.0)
    ground(120, mat("#c9a672", rough=0.95), z=0.0, subdiv=260, strength=0.6, scale=5)
    cols = ["#ff7a8a", "#ffb25c", "#c86bff", "#ff5d9a", "#ffd24d", "#5de0c0"]
    for side in (-1, 1):
        for k in range(15):
            x = side * rnd.uniform(3.6, 12)
            y = rnd.uniform(-2, 7)
            c = rnd.choice(cols)
            m = mat(c, rough=0.45, subsurface=0.3)
            h = rnd.uniform(1.0, 3.4)
            kind = rnd.random()
            if kind < 0.4:
                cyl((x, y, h / 2), 0.2, h, m, r2=0.12)
                for b in range(5):
                    a = rnd.uniform(0, math.tau)
                    cyl((x + math.cos(a) * 0.5, y + math.sin(a) * 0.5, h * 0.6 + b * 0.2), 0.1, 1.1, m, rot=(math.sin(a) * 0.9, -math.cos(a) * 0.9, 0), r2=0.05)
            elif kind < 0.7:
                sphere((x, y, 0.3), rnd.uniform(0.7, 1.3), m, scale=(1, 1, 0.7))
            else:
                # sasanka: kmen s věncem chapadel
                cyl((x, y, 0.4), 0.3, 0.8, m, r2=0.22)
                for b in range(14):
                    a = b * math.tau / 14
                    cyl((x + math.cos(a) * 0.25, y + math.sin(a) * 0.25, 0.95), 0.035, 0.7, mat("#ffe08a", rough=0.5, emit=0.4), rot=(math.sin(a) * 0.5, -math.cos(a) * 0.5, 0), r2=0.01, verts=8)
    # řasy
    for _ in range(46):
        x = rnd.choice([-1, 1]) * rnd.uniform(2.6, 13)
        y = rnd.uniform(-1, 8)
        for b in range(3):
            sphere((x + b * 0.15, y, 0.9 + b * 0.1), 0.12, mat("#2faa5a", rough=0.6), scale=(0.35, 0.12, rnd.uniform(5, 9)), rot=(0, rnd.uniform(-0.25, 0.25), rnd.uniform(0, 3)), seg=10, rings=6)
    for _ in range(12):
        rock(rnd.choice([-1, 1]) * rnd.uniform(3, 12), rnd.uniform(-1, 6), 0.3, rnd.uniform(0.4, 0.9), "#5a6a7a", 0.8, rnd)
    # hvězdice na písku
    for _ in range(8):
        x, y = rnd.choice([-1, 1]) * rnd.uniform(2.4, 11), rnd.uniform(-2, 3)
        for b in range(5):
            a = b * math.tau / 5
            sphere((x + math.cos(a) * 0.18, y + math.sin(a) * 0.18, 0.08), 0.1, mat("#ff8a3d", rough=0.7), scale=(1.6, 0.5, 0.35), rot=(0, 0, a), seg=10, rings=6)
    # hejna ryb a bubliny
    for school in range(3):
        cx, cz = rnd.choice([-7, -3, 6, 9]), rnd.uniform(3.4, 5.6)
        c = rnd.choice(["#ffd24d", "#ff8a3d", "#4da3ff"])
        for _ in range(9):
            x, z = cx + rnd.gauss(0, 1.0), cz + rnd.gauss(0, 0.5)
            m = mat(c, rough=0.35, coat=0.5)
            sphere((x, 3 + rnd.gauss(0, 0.8), z), 0.22, m, scale=(1.7, 0.55, 1.0), seg=16, rings=10)
            cyl((x - 0.42, 3, z), 0.16, 0.25, m, rot=(0, math.radians(90), 0), r2=0.02, verts=12)
    for _ in range(45):
        sphere((rnd.choice([-1, 1]) * rnd.uniform(2, 12), rnd.uniform(0, 7), rnd.uniform(0.6, 6.5)), rnd.uniform(0.04, 0.12), mat("#dff8ff", rough=0.05, coat=1.0, transmission=0.9), seg=12, rings=8)
    render("craft-reef")


def craft_lagoon():
    reset(SAMPLES)
    rnd = random.Random(9)
    B.sky(18, 200, strength=0.04, dust=1.5, sun_intensity=0.1)
    look((0, -14, 1.6), (0, 0, 1.6), 30)
    ground(400, B.wave_material("#0aa8a8", "#5fe0d0", 0.03), z=0.0, subdiv=400, strength=0.12, scale=2.5)
    sand = mat("#f2dfa8", rough=0.9)
    for side in (-1, 1):
        isl = sphere((side * 9, 3, -0.4), 4.0, sand, scale=(1.5, 1, 0.35))
        for k in range(4):
            x = side * (6.8 + k * 1.8) + rnd.uniform(-0.3, 0.3)
            ph = 3.4 + rnd.uniform(0, 1.6)
            lean = rnd.uniform(-10, 10)
            cyl((x, 3 + k * 0.8, ph / 2 + 0.1), 0.18, ph, mat("#8a5a2b", rough=0.8), rot=(0, math.radians(lean), 0), r2=0.12)
            for lf in range(10):
                a = lf * math.tau / 10
                sphere((x + math.cos(a) * 1.0, 3 + k * 0.8 + math.sin(a) * 1.0, ph + 0.05), 0.95, mat("#3f9c3a" if lf % 2 else "#58b947", rough=0.6), scale=(1.4, 0.18, 0.08), rot=(0, math.radians(-14), a), seg=12, rings=8)
            for c in range(3):
                sphere((x + 0.15 * c, 3 + k * 0.8 + 0.15, ph - 0.25), 0.12, mat("#6a4a2a", rough=0.7))
        for _ in range(14):
            rock(side * rnd.uniform(5, 12), rnd.uniform(0.5, 5), 0.0, rnd.uniform(0.18, 0.45), "#8a8a8a", 0.7, rnd)
        for _ in range(26):
            sphere((side * rnd.uniform(4.6, 12.4), rnd.uniform(0.2, 5.5), 0.08), 0.07, mat(rnd.choice(["#ffb0c0", "#ffffff", "#ffd0a0"]), rough=0.5), scale=(1, 0.8, 0.5), seg=10, rings=6)
    sphere((1, 34, -2), 9, mat("#4a8a5a", rough=0.9), scale=(2.6, 1, 0.5))
    # pěna u břehu
    for side in (-1, 1):
        for _ in range(26):
            sphere((side * rnd.uniform(3.2, 7.6), rnd.uniform(-0.8, 0.6), 0.02), rnd.uniform(0.15, 0.4), emit("#ffffff", 0.6), scale=(2.4, 0.5, 0.05), seg=10, rings=6)
    render("craft-lagoon")


def _trees(rnd, cols, n, xr, yr, hr):
    for _ in range(n):
        x = rnd.choice([-1, 1]) * rnd.uniform(*xr)
        y = rnd.uniform(*yr)
        h = rnd.uniform(*hr)
        B.round_tree(x, y, 0, h, rnd, rnd.choice(cols))


def craft_grove():
    reset(SAMPLES)
    rnd = random.Random(11)
    B.sky(26, 180, strength=0.07, dust=4.0, sun_intensity=0.2)
    sun((52, 0, 150), 3.5, "#ffe9b0", 0.05)
    B.haze(0.0012, "#fff2c0", 0.5)
    look((0, -14, 2.4), (0, 0, 2.6), 30)
    ground(240, mat("#2f8f55", rough=0.95), z=0.0, subdiv=260, strength=0.5, scale=6)
    _trees(rnd, ["#2f8f55", "#3f9a52", "#5ab86a"], 34, (4.5, 18), (-1, 22), (4, 10))
    cyl((-7.4, 3, 3.5), 1.1, 7.0, mat("#5a4030", rough=0.9), r2=0.7)
    for k in range(6):
        a = k * math.tau / 6
        cyl((-7.4 + math.cos(a) * 1.2, 3 + math.sin(a) * 1.2, 0.35), 0.35, 1.6, mat("#5a4030", rough=0.9), rot=(math.sin(a) * 1.2, -math.cos(a) * 1.2, 0), r2=0.12)
    for (dx, dz, r) in [(0, 8.0, 3.0), (-1.8, 7.0, 2.2), (1.9, 7.2, 2.4), (0.4, 9.2, 1.8)]:
        sphere((-7.4 + dx, 3, dz), r, mat("#3f9c3a", rough=0.7), scale=(1, 1, 0.8))
    # kmen s houbami, kapradiny, kameny s mechem, kytky
    for _ in range(12):
        mushroom(rnd.choice([-1, 1]) * rnd.uniform(3.4, 11), rnd.uniform(-1.5, 4), rnd.uniform(0.35, 0.8), rnd.choice(["#e5484d", "#ffb25c", "#c86bff"]))
    for _ in range(22):
        fern(rnd.choice([-1, 1]) * rnd.uniform(3, 12.5), rnd.uniform(-2, 7), rnd.uniform(0.7, 1.3), rnd.choice(["#3f9c3a", "#58b947", "#2f7a3a"]))
    for _ in range(9):
        rock(rnd.choice([-1, 1]) * rnd.uniform(3, 11), rnd.uniform(-1, 5), 0.2, rnd.uniform(0.4, 0.9), "#7a8a6a", 0.8, rnd)
    for _ in range(60):
        x, y = rnd.choice([-1, 1]) * rnd.uniform(2.8, 13), rnd.uniform(-2, 8)
        cyl((x, y, 0.15), 0.01, 0.3, mat("#3f8f2f", rough=0.6))
        sphere((x, y, 0.32), 0.07, mat(rnd.choice(["#ffd24d", "#ffffff", "#ff8fd0", "#a87bff"]), rough=0.5), seg=10, rings=6)
    for _ in range(70):
        sphere((rnd.uniform(-12, 12), rnd.uniform(-2, 9), rnd.uniform(0.6, 6.0)), rnd.uniform(0.03, 0.06), emit("#fff2a0", 12.0), seg=8, rings=6)
    render("craft-grove")


def craft_amber_forest():
    reset(SAMPLES)
    rnd = random.Random(21)
    B.sky(14, 200, strength=0.06, dust=6.0, sun_intensity=0.2)
    sun((62, 0, 200), 3.5, "#ffc878", 0.05)
    B.haze(0.0015, "#ffcf80", 0.5)
    look((0, -14, 2.4), (0, 0, 2.6), 30)
    ground(240, mat("#9a6a2a", rough=0.95), z=0.0, subdiv=260, strength=0.5, scale=6)
    _trees(rnd, ["#e8a830", "#d9822b", "#c0602a", "#f2c05a"], 38, (4.2, 18), (-1, 22), (4, 10))
    for _ in range(300):
        x, y = rnd.uniform(-14, 14), rnd.uniform(-3, 9)
        z = 0.08 if rnd.random() < 0.6 else rnd.uniform(0.5, 6)
        sphere((x, y, z), 0.14, mat(rnd.choice(["#e8a830", "#d9822b", "#c0602a"]), rough=0.6), scale=(1, 0.7, 0.12), rot=(rnd.uniform(0, 1), rnd.uniform(0, 1), rnd.uniform(0, 6)), seg=12, rings=8)
    sphere((7.6, 0.4, 0.8), 0.9, mat("#ffb02a", rough=0.15, coat=1.0, transmission=0.6, emit=0.8, emit_color="#ff9a1a"), scale=(1.1, 0.9, 1.0))
    sphere((7.3, 0.3, 0.55), 0.12, mat("#3a2a10", rough=0.4))  # zalitý hmyz
    # padlý kmen se mechem, houby a pařezy
    cyl((-7.0, 1.0, 0.45), 0.5, 5.0, mat("#5a3a20", rough=0.9), rot=(0, math.radians(90), math.radians(15)))
    sphere((-7.0, 0.9, 0.9), 0.6, mat("#4a8a3a", rough=0.9), scale=(3.0, 0.7, 0.3))
    for _ in range(9):
        mushroom(rnd.choice([-1, 1]) * rnd.uniform(3.5, 11), rnd.uniform(-1.5, 4), rnd.uniform(0.35, 0.7), rnd.choice(["#d9822b", "#f2c05a", "#c0602a"]))
    for _ in range(6):
        x, y = rnd.choice([-1, 1]) * rnd.uniform(4, 11), rnd.uniform(0, 5)
        cyl((x, y, 0.3), 0.45, 0.6, mat("#6a4a2a", rough=0.9), r2=0.52)
        cyl((x, y, 0.61), 0.4, 0.02, mat("#d9b878", rough=0.8))
    for _ in range(10):
        rock(rnd.choice([-1, 1]) * rnd.uniform(3, 11), rnd.uniform(-1, 5), 0.2, rnd.uniform(0.3, 0.8), "#8a7a5a", 0.8, rnd)
    for _ in range(80):
        sphere((rnd.uniform(-12, 12), rnd.uniform(-2, 9), rnd.uniform(0.5, 6.0)), rnd.uniform(0.02, 0.05), emit("#ffd080", 10.0), seg=8, rings=6)
    render("craft-amber-forest")


def craft_forge():
    reset(SAMPLES)
    rnd = random.Random(4)
    world_gradient([(0.0, "#0a0508"), (1.0, "#1a0e0e")], 0.4)
    look((0, -12, 2.2), (0, 0, 2.2), 30)
    stone = mat("#4a3a3a", rough=0.9)
    for row in range(8):
        for col in range(20):
            ox = (0.55 if row % 2 else 0.0)
            box((-13 + col * 1.4 + ox, 6, 0.4 + row * 0.8), (1.3, 0.5, 0.74), mat(rnd.choice(["#4a3a3a", "#5a4444", "#3a2e2e", "#443030"]), rough=0.95), bevel=0.04)
    ground(60, mat("#2a2020", rough=0.8), z=0.0)
    # výheň s komínem a žhavým uhlím
    box((8.0, 3.5, 1.4), (3.2, 2.2, 2.8), stone, bevel=0.1)
    cyl((8.0, 4.4, 5.0), 0.7, 5.0, stone, r2=0.5)
    box((8.0, 2.4, 1.0), (1.9, 0.2, 1.2), emit("#ff7a1a", 14.0))
    sphere((8.0, 2.3, 1.0), 0.95, emit("#ffd24d", 20.0), scale=(1.4, 0.3, 0.9))
    for _ in range(14):
        sphere((8.0 + rnd.uniform(-0.8, 0.8), 2.25, 0.5 + rnd.uniform(0, 0.4)), rnd.uniform(0.08, 0.16), emit("#ff5a1a", 12.0), seg=10, rings=6)
    point((8.0, 1.5, 1.2), 700, "#ff8a2a", 0.8)
    # kovadlina, kladivo, kleště, sud s vodou
    iron = mat("#2c2a33", rough=0.35, metal=0.9)
    box((-8.2, 3, 0.55), (1.5, 1.0, 1.1), mat("#3a2a20", rough=0.8), bevel=0.05)
    box((-8.2, 3, 1.35), (2.3, 0.8, 0.5), iron, bevel=0.07)
    box((-9.5, 3, 1.5), (0.9, 0.5, 0.25), iron, bevel=0.05)
    cyl((-8.0, 2.4, 1.65), 0.05, 1.2, mat("#ff8a2a", rough=0.4, emit=4.0), rot=(0, math.radians(75), 0))
    cyl((-6.2, 2.4, 0.5), 0.05, 1.0, mat("#6b3a1a", rough=0.6), rot=(0, math.radians(70), 0))
    box((-5.7, 2.4, 0.95), (0.35, 0.2, 0.22), iron, bevel=0.02)
    cyl((-4.3, 4.6, 0.6), 0.55, 1.2, mat("#6b4a2a", rough=0.7), r2=0.6)
    for z in (0.3, 0.9):
        cyl((-4.3, 4.6, z), 0.62, 0.05, iron, r2=0.62)
    cyl((-4.3, 4.6, 1.19), 0.5, 0.02, mat("#2a6a9a", rough=0.1, coat=1.0))
    # stojan s meči na zdi, řetězy, měch
    box((-1.0, 5.6, 4.2), (4.6, 0.12, 0.2), mat("#4a2f1e", rough=0.7))
    for k in range(4):
        x = -2.6 + k * 1.1
        box((x, 5.5, 3.1), (0.14, 0.05, 2.2), mat("#d8dde8", rough=0.2, metal=0.95), bevel=0.01)
        box((x, 5.5, 2.0), (0.6, 0.07, 0.12), mat("#d9a43a", rough=0.3, metal=0.8))
    for x in (4.2, 5.0):
        for z in range(9):
            _ = z
            bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.025, location=(x, 5.4, 6.0 - z * 0.22), rotation=(math.radians(90 * (z % 2)), 0, 0))
            add(bpy.context.active_object, iron)
    box((0.0, 2.4, 0.3), (1.6, 0.9, 0.5), mat("#5a3a20", rough=0.8), bevel=0.05)
    for _ in range(110):
        sphere((rnd.uniform(-10, 10), rnd.uniform(0, 5), rnd.uniform(0.8, 6.5)), rnd.uniform(0.02, 0.05), emit("#ffb84d", 18.0), seg=8, rings=6)
    point((-8.0, 2.0, 2.0), 140, "#ff9a3a", 0.5)
    render("craft-forge")


def craft_throne():
    reset(SAMPLES)
    rnd = random.Random(2)
    world_gradient([(0.0, "#1a0a14"), (1.0, "#2a1020")], 0.5)
    look((0, -14, 3.0), (0, 0, 3.0), 28)
    marble = mat("#d8d0e0", rough=0.25, coat=0.4)
    gold = mat("#ffc933", rough=0.3, metal=0.9)
    # šachovnicová podlaha a koberec
    fl = bpy.data.materials.new("podlaha")
    fl.use_nodes = True
    fnt = fl.node_tree
    fb = fnt.nodes["Principled BSDF"]
    ck = fnt.nodes.new("ShaderNodeTexChecker")
    ck.inputs["Scale"].default_value = 22.0
    ck.inputs["Color1"].default_value = lin("#d8d0e0")
    ck.inputs["Color2"].default_value = lin("#4a3a5a")
    ftc = fnt.nodes.new("ShaderNodeTexCoord")
    fnt.links.new(ftc.outputs["Generated"], ck.inputs["Vector"])
    fnt.links.new(ck.outputs["Color"], fb.inputs["Base Color"])
    fb.inputs["Roughness"].default_value = 0.2
    fb.inputs["Coat Weight"].default_value = 0.4
    ground(60, fl, z=0.0, subdiv=2)
    box((0, 7, 0.06), (4.0, 40, 0.04), mat("#a8182e", rough=0.7))
    box((0, 7, 0.09), (4.4, 40, 0.01), gold)
    for side in (-1, 1):
        for k in range(5):
            x, y = side * (6.5 + k * 1.1), 1.2 + k * 3.6
            cyl((x, y, 3.5), 0.7, 7.0, marble)
            cyl((x, y, 0.2), 0.95, 0.4, marble)
            cyl((x, y, 7.0), 0.95, 0.4, marble)
            box((x - side * 0.1, y - 0.8, 4.4), (0.08, 0.1, 3.0), mat("#c0192e", rough=0.8))
            sphere((x - side * 0.1, y - 0.86, 5.2), 0.2, gold, scale=(1, 0.3, 1))
            # lustr s plamínky
            if k % 2 == 0:
                bpy.ops.mesh.primitive_torus_add(major_radius=0.7, minor_radius=0.04, location=(x * 0.35, y, 6.6))
                add(bpy.context.active_object, gold)
                cyl((x * 0.35, y, 7.4), 0.02, 1.6, gold)
                for c in range(8):
                    a = c * math.tau / 8
                    cyl((x * 0.35 + math.cos(a) * 0.7, y + math.sin(a) * 0.7, 6.85), 0.04, 0.25, mat("#f6f0e0", rough=0.6))
                    sphere((x * 0.35 + math.cos(a) * 0.7, y + math.sin(a) * 0.7, 7.05), 0.06, emit("#ffb84d", 25.0), scale=(1, 1, 1.5), seg=10, rings=6)
    # oblouky v zadní zdi s okny a světlem
    for k in range(-3, 4):
        box((k * 4.2, 22, 4.5), (0.9, 1.0, 9.0), marble, bevel=0.05)
        box((k * 4.2 + 2.1, 21.9, 5.5), (2.2, 0.2, 5.0), emit("#ffd9a0" if k % 2 else "#ffb8c8", 0.55))
    # stupně k trůnu, trůn, prapory
    for s in range(4):
        box((6.4, 14 - s * 0.5, 0.2 + s * 0.3), (3.6 + s * 0.2, 2.6 + s * 0.5, 0.3), marble, bevel=0.04)
    box((6.4, 14, 1.8), (2.4, 1.6, 1.0), marble, bevel=0.08)
    box((6.4, 14.7, 3.8), (2.0, 0.5, 3.6), mat("#c0192e", rough=0.5, coat=0.3), bevel=0.1)
    box((6.4, 14.7, 5.8), (2.4, 0.5, 0.5), gold, bevel=0.05)
    for sx in (-1, 1):
        box((6.4 + sx * 1.1, 14, 2.6), (0.3, 1.4, 1.4), gold, bevel=0.05)
    sun((60, 0, 40), 5.0, "#ffe4b0", 0.1)
    point((0, 4, 6.5), 500, "#ffd9a0", 0.6)
    render("craft-throne")


def craft_moonlight():
    reset(SAMPLES)
    rnd = random.Random(13)
    world_gradient([(0.0, "#8a5acf"), (0.4, "#4a2a8a"), (1.0, "#0a0838")], 1.0, stars=1.6, star_scale=1400)
    look((0, -14, 1.8), (0, 0, 3.2), 30)
    sun((60, 0, -50), 1.2, "#cfd8ff")
    fog(0.003, "#8a6acf")
    sphere((9.0, 40, 12.0), 4.2, banded("#e8e0c0", "#fffbe0", 6.0, 0.9))
    sphere((9.0, 40, 12.0), 4.2, emit("#fffbe0", 4.0))
    sphere((9.0, 39, 12.0), 7.5, emit("#c8b8ff", 0.5), scale=(1, 0.2, 1))
    ground(300, mat("#1a1040", rough=0.9), z=-0.4, subdiv=300, strength=2.6, scale=9)
    for side in (-1, 1):
        for k in range(8):
            sphere((side * rnd.uniform(5, 16), rnd.uniform(4, 26), 0), rnd.uniform(2, 5), mat("#1c1448", rough=0.9), scale=(1.4, 1, 1.0))
    # jezírko s odrazem měsíce uprostřed dole (klidné)
    for _ in range(26):
        B.pine(rnd.choice([-1, 1]) * rnd.uniform(5, 15), rnd.uniform(3, 20), 0, rnd.uniform(3, 7), rnd, "#150f38")
    # věž s kloboukem, svítící okna a netopýři
    cyl((-8.2, 7, 4.0), 0.9, 8.0, mat("#2a1c58", rough=0.8))
    cyl((-8.2, 7, 9.6), 1.5, 3.2, mat("#3a2a7a", rough=0.7), r2=0.0)
    for z in (3.0, 5.2, 7.0):
        sphere((-8.2, 6.15, z), 0.2, emit("#ffd24d", 14.0), scale=(0.8, 0.3, 1.4))
    for _ in range(7):
        x, z = rnd.uniform(-10, 11), rnd.uniform(4.5, 8)
        sphere((x, 6, z), 0.1, mat("#0a0820", rough=0.9))
        for s in (-1, 1):
            sphere((x + s * 0.2, 6, z + 0.03), 0.16, mat("#0a0820", rough=0.9), scale=(1.6, 0.1, 0.5), rot=(0, s * 0.3, 0), seg=10, rings=6)
    # mraky
    for _ in range(14):
        x, z = rnd.uniform(-16, 16), rnd.uniform(5.5, 9.5)
        for b in range(5):
            sphere((x + b * 0.9 + rnd.uniform(-0.3, 0.3), 24, z + rnd.uniform(-0.2, 0.2)), rnd.uniform(1.0, 1.9), emit("#8a7acf", 0.18), scale=(2.0, 0.6, 0.55), seg=16, rings=10)
    for _ in range(40):
        sphere((rnd.uniform(-13, 13), rnd.uniform(1, 10), rnd.uniform(1, 8)), rnd.uniform(0.03, 0.07), emit("#e8e0ff", 14.0), seg=8, rings=6)
    render("craft-moonlight")


def craft_dragon_lair():
    reset(SAMPLES)
    rnd = random.Random(7)
    world_gradient([(0.0, "#080208"), (1.0, "#140612")], 0.3)
    look((0, -14, 2.4), (0, 0, 2.4), 30)
    rock_m = mat("#2c2030", rough=0.95)
    for (loc, sz, rot) in [((0, 14, 5), 50, (math.radians(90), 0, 0)), ((-18, 4, 5), 50, (0, math.radians(90), 0)), ((18, 4, 5), 50, (0, math.radians(90), 0)), ((0, 4, 17), 50, (0, 0, 0))]:
        bpy.ops.mesh.primitive_grid_add(x_subdivisions=260, y_subdivisions=260, size=sz, location=loc, rotation=rot)
        o = bpy.context.active_object
        add(o, rock_m)
        tex = bpy.data.textures.new("t", "CLOUDS")
        tex.noise_scale = 2.4
        tex.noise_depth = 8
        d = o.modifiers.new("d", "DISPLACE")
        d.texture = tex
        d.strength = 3.0
        d.mid_level = 0.45
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
    ground(70, lava, z=0.05, subdiv=2)
    # krápníky, krystaly, hromada zlata s truhlou
    for _ in range(40):
        x, y = rnd.uniform(-14, 14), rnd.uniform(1, 12)
        h = rnd.uniform(0.8, 3.2)
        cyl((x, y, 9.0 - h / 2), rnd.uniform(0.15, 0.4), h, rock_m, r2=0.0, verts=12)
    for _ in range(12):
        crystal(rnd.choice([-1, 1]) * rnd.uniform(5, 12), rnd.uniform(2, 8), 0.8, rnd.uniform(0.8, 1.8), rnd.choice(["#a87bff", "#3fc1ff", "#ff5d9a"]), 3.0, tilt=rnd.uniform(-0.3, 0.3))
    gold = mat("#ffc933", rough=0.25, metal=1.0)
    for _ in range(190):
        a, r = rnd.uniform(0, math.tau), abs(rnd.gauss(0, 1.9))
        sphere((7.6 + math.cos(a) * r, 2 + math.sin(a) * r * 0.7, 0.3 + max(0, 1.6 - r) * 0.6 + rnd.uniform(0, 0.2)), rnd.uniform(0.18, 0.32), gold if rnd.random() < 0.78 else mat(rnd.choice(["#e5484d", "#4da3ff", "#3ddc97"]), rough=0.1, coat=1.0), scale=(1, 1, 0.45), seg=16, rings=10)
    box((9.8, 1.2, 0.5), (1.3, 0.8, 0.8), mat("#6b3a1a", rough=0.6), rot=(0, 0, math.radians(20)), bevel=0.05)
    box((9.8, 1.2, 0.98), (1.35, 0.85, 0.2), gold, rot=(0, 0, math.radians(20)), bevel=0.05)
    # dračí hlava vlevo: lebka, čelist, rohy, zuby a zářící oči
    scale_m = mat("#3a1a2a", rough=0.5, coat=0.3)
    sphere((-8.0, 6.0, 3.0), 1.7, scale_m, scale=(1.3, 1.0, 0.95))
    sphere((-8.0, 4.6, 2.3), 1.0, scale_m, scale=(1.0, 1.7, 0.7))
    sphere((-8.0, 3.7, 1.7), 0.8, scale_m, scale=(1.0, 1.6, 0.4))
    for s in (-1, 1):
        cone((-8.0 + s * 1.2, 6.2, 4.4), 0.32, 2.0, mat("#d8c8a8", rough=0.5), rot=(math.radians(-20), s * math.radians(25), 0)) if False else cyl((-8.0 + s * 1.2, 6.2, 4.7), 0.3, 2.0, mat("#d8c8a8", rough=0.5), rot=(math.radians(-25), s * math.radians(20), 0), r2=0.0, verts=12)
        sphere((-8.0 + s * 0.6, 4.6, 2.9), 0.28, emit("#ffd24d", 40.0), scale=(1.0, 0.5, 1.0))
        sphere((-8.0 + s * 0.6, 4.35, 2.9), 0.09, mat("#000000", rough=0.5), scale=(0.35, 0.4, 1.0))
        sphere((-8.0 + s * 0.3, 3.1, 1.95), 0.07, emit("#ff6a1a", 6.0))
    for k in range(7):
        x = -8.0 - 0.7 + k * 0.23
        cyl((x, 3.5, 1.45), 0.05, 0.28, mat("#f2ead8", rough=0.4), r2=0.0, verts=8)
    point((7.6, 1.5, 1.6), 800, "#ffb02a", 0.8)
    point((0, 2, 0.8), 450, "#ff6a1a", 1.0)
    point((-8.0, 3.0, 3.0), 250, "#ffb02a", 0.6)
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
