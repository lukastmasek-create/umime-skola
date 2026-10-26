"""Realistická pozadí profilu (public/cosmetics/banners/<id>.webp, 1200 × 400).

    blender -b --python umime-art/scripts/banners.py -- <výstupní složka> [id]
    python umime-art/scripts/banners.py <výstupní složka> [id]

Fyzikální obloha (Nishita), vlny z modifikátoru Ocean, terén s šumem, mlha a skutečné odrazy.
Střed obrázku je klidnější (jméno a avatar), detaily jsou po stranách.
"""

import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "banners_out"
ONLY = ARGS[1] if len(ARGS) > 1 else None
os.makedirs(OUT, exist_ok=True)

W, H = 1800, 600


def lin(h, a=1.0):
    h = h.lstrip("#")
    return tuple(pow(int(h[i : i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (a,)


def reset(samples=64):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8
    sc.view_settings.view_transform = "Standard"
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.film_transparent = False
    return sc


def camera(loc, look_at, lens=32, roll=0.0):
    cam = bpy.data.cameras.new("c")
    cam.lens = lens
    cam.sensor_width = 36
    cam.sensor_fit = "HORIZONTAL"
    cam.clip_end = 5000
    co = bpy.data.objects.new("c", cam)
    co.location = loc
    bpy.context.collection.objects.link(co)
    d = Vector(look_at) - Vector(loc)
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = co
    return co


def mat(color, rough=0.5, metal=0.0, emit=0.0, coat=0.0, transmission=0.0, ior=1.45, subsurface=0.0, emit_color=None):
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["IOR"].default_value = ior
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.04
    if transmission:
        b.inputs["Transmission Weight"].default_value = transmission
    if subsurface:
        b.inputs["Subsurface Weight"].default_value = subsurface
        b.inputs["Subsurface Radius"].default_value = (0.5, 0.35, 0.25)
    if emit:
        c = emit_color or color
        b.inputs["Emission Color"].default_value = lin(c) if isinstance(c, str) else c
        b.inputs["Emission Strength"].default_value = emit
    return m


def add(o, m=None, smooth=True):
    if o.name not in bpy.context.collection.objects:
        bpy.context.collection.objects.link(o)
    if m is not None:
        o.data.materials.append(m)
    if smooth and o.type == "MESH":
        for p in o.data.polygons:
            p.use_smooth = True
    return o


def active(m=None, smooth=True):
    o = bpy.context.active_object
    if m is not None:
        o.data.materials.append(m)
    if smooth:
        bpy.ops.object.shade_smooth()
    return o


def sky(elevation_deg, rotation_deg, strength=1.0, dust=2.0, air=1.0, sun_size_deg=0.6, sun_intensity=1.0):
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    s = nt.nodes.new("ShaderNodeTexSky")
    try:
        s.sky_type = "NISHITA"  # Blender 4.x
    except TypeError:
        s.sky_type = "MULTIPLE_SCATTERING"  # Blender 5.x
    s.sun_elevation = math.radians(elevation_deg)
    s.sun_rotation = math.radians(rotation_deg)
    if hasattr(s, "dust_density"):
        s.dust_density = dust
    else:
        s.aerosol_density = dust  # Blender 5.x
    s.air_density = air
    s.sun_size = math.radians(sun_size_deg)
    s.sun_intensity = sun_intensity
    nt.links.new(s.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def haze(density=0.0015, color="#c8d6e8", anisotropy=0.3):
    w = bpy.context.scene.world
    nt = w.node_tree
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Density"].default_value = density
    vol.inputs["Color"].default_value = lin(color)
    vol.inputs["Anisotropy"].default_value = anisotropy
    nt.links.new(vol.outputs["Volume"], nt.nodes["World Output"].inputs["Volume"])


def displaced_plane(size, subdiv, scale, strength, m, loc=(0, 0, 0), seed=0, octaves=8, ridge=False):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=subdiv, y_subdivisions=subdiv, size=size, location=loc)
    o = active(m)
    tex = bpy.data.textures.new("t", "MUSGRAVE" if False else "CLOUDS")
    tex.noise_scale = scale
    tex.noise_depth = octaves
    d = o.modifiers.new("d", "DISPLACE")
    d.texture = tex
    d.strength = strength
    d.mid_level = 0.45
    return o


def render(name):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("OK", name, flush=True)


# --------------------------------------------------------------------------------------------


def pine(x, y, z, h, rnd, col="#1f3d2a", snow=False):
    """Smrk z několika zkosených kuželů s hrubou kůrou."""
    trunk_m = mat("#4a3322", rough=0.9)
    bpy.ops.mesh.primitive_cylinder_add(radius=h * 0.035, depth=h * 0.25, location=(x, y, z + h * 0.1))
    active(trunk_m)
    leaf = mat(col, rough=0.8, subsurface=0.1)
    snow_m = mat("#f4f8ff", rough=0.7, subsurface=0.3)
    layers = 5
    for k in range(layers):
        t = k / (layers - 1)
        r = h * 0.28 * (1 - t * 0.78)
        zc = z + h * (0.2 + t * 0.62)
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r * 0.05, depth=h * 0.32, location=(x, y, zc), vertices=18)
        c = active(leaf)
        if snow:
            bpy.ops.mesh.primitive_cone_add(radius1=r * 0.92, radius2=r * 0.04, depth=h * 0.26, location=(x, y, zc + h * 0.04), vertices=18)
            active(snow_m)


def round_tree(x, y, z, h, rnd, col=None):
    trunk_m = mat("#5a3d28", rough=0.9)
    bpy.ops.mesh.primitive_cylinder_add(radius=h * 0.05, depth=h * 0.5, location=(x, y, z + h * 0.25))
    active(trunk_m)
    greens = ["#3f8f3a", "#4ea044", "#2f7a35", "#5bab4a"]
    leaf = mat(col or rnd.choice(greens), rough=0.75, subsurface=0.15)
    for dx, dy, dz, r in ((0, 0, 0.62, 0.34), (-0.18, 0.05, 0.5, 0.26), (0.2, -0.04, 0.52, 0.27), (0.04, 0.1, 0.8, 0.24)):
        bpy.ops.mesh.primitive_ico_sphere_add(radius=h * r, subdivisions=3, location=(x + dx * h, y + dy * h, z + dz * h))
        o = active(leaf)
        tex = bpy.data.textures.new("n", "CLOUDS")
        tex.noise_scale = 0.5
        mod = o.modifiers.new("d", "DISPLACE")
        mod.texture = tex
        mod.strength = h * 0.06


def banner_sunset():
    reset(72)
    sky(1.8, 24, strength=0.10, dust=10.0, sun_size_deg=2.0)
    camera((0, -40, 4.2), (0, 40, 8.0), lens=30)
    rnd = random.Random(3)
    ground = mat("#22101c", rough=0.95)
    # tři hřebeny kopců za sebou, vzdálenější světlejší (vzdušná perspektiva přes mlhu)
    for dist, amp, scale, col in ((420, 44, 160, "#4a2540"), (250, 34, 100, "#34172e"), (140, 26, 70, "#241024")):
        bpy.ops.mesh.primitive_grid_add(x_subdivisions=220, y_subdivisions=40, size=1, location=(0, dist, 0))
        o = active(mat(col, rough=0.95))
        o.scale = (900, 90, 1)
        tex = bpy.data.textures.new("h", "CLOUDS")
        tex.noise_scale = scale / 900
        tex.noise_depth = 6
        d = o.modifiers.new("d", "DISPLACE")
        d.texture = tex
        d.strength = amp / 1.0 * 1.0
        d.mid_level = 0.35
    # jezero s odrazem
    bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 300, 0.05))
    water = mat("#1b2c46", rough=0.02, metal=0.0, ior=1.33)
    active(water)
    # stromy v popředí po stranách
    for side in (-1, 1):
        for i in range(7):
            x = side * (22 + rnd.uniform(0, 60))
            y = 30 + rnd.uniform(0, 60)
            pine(x, y, 0, rnd.uniform(14, 26), rnd, col="#0e1a14")
    render("sunset")


def wave_material(deep="#0a8ba8", shallow="#2aa6b8", rough=0.03):
    """Voda: hluboká tyrkysová, odrazy oblohy a vlnky z několika šumů natažených po směru větru."""
    m = bpy.data.materials.new("water")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(deep)
    b.inputs["Roughness"].default_value = rough
    b.inputs["IOR"].default_value = 1.33
    b.inputs["Specular IOR Level"].default_value = 0.5
    b.inputs["Subsurface Weight"].default_value = 0.35
    b.inputs["Subsurface Radius"].default_value = (0.2, 0.7, 1.0)
    b.inputs["Subsurface Scale"].default_value = 0.6
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.0, 5.0, 1.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    outs = []
    for sc_, st in ((0.35, 0.5), (1.2, 0.35), (4.0, 0.22), (14.0, 0.12)):
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = sc_
        n.inputs["Detail"].default_value = 6
        n.inputs["Roughness"].default_value = 0.55
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
        mul = nt.nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = st
        nt.links.new(n.outputs["Fac"], mul.inputs[0])
        outs.append(mul)
    acc = outs[0]
    for o in outs[1:]:
        add_ = nt.nodes.new("ShaderNodeMath")
        add_.operation = "ADD"
        nt.links.new(acc.outputs["Value"], add_.inputs[0])
        nt.links.new(o.outputs["Value"], add_.inputs[1])
        acc = add_
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.0
    bump.inputs["Distance"].default_value = 2.0
    nt.links.new(acc.outputs["Value"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def sailboat(x, y, rot=0.0, scale=1.0):
    hull = mat("#f4f1ea", rough=0.3, coat=0.5)
    deck = mat("#8b5e3c", rough=0.7)
    sailm = mat("#ffffff", rough=0.85, subsurface=0.15)
    bm = bmesh.new()
    pts = [(-3.2, 0.0), (-2.0, 1.05), (1.8, 1.05), (3.6, 0.0), (1.8, -1.05), (-2.0, -1.05)]
    bot = [bm.verts.new((px_, py_ * 0.6, -0.5)) for px_, py_ in pts]
    top = [bm.verts.new((px_ * 1.0, py_, 0.55)) for px_, py_ in pts]
    bm.faces.new(top)
    bm.faces.new(bot[::-1])
    for i in range(6):
        j = (i + 1) % 6
        bm.faces.new((top[i], top[j], bot[j], bot[i]))
    me = bpy.data.meshes.new("h")
    bm.to_mesh(me)
    bm.free()
    h = bpy.data.objects.new("h", me)
    add(h, hull)
    bv = h.modifiers.new("b", "BEVEL")
    bv.width = 0.12
    bv.segments = 3
    h.location = (x, y, 0.1)
    h.rotation_euler = (0, 0, rot)
    h.scale = (scale,) * 3
    # stožár a plachta jako trojúhelník
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=9.5, location=(0, 0, 5.0))
    mast = active(mat("#d0d0d0", rough=0.3, metal=0.9))
    bm = bmesh.new()
    v = [bm.verts.new(c) for c in ((0.12, 0, 0.9), (0.12, 0, 9.0), (-3.4, 0, 1.0))]
    bm.faces.new(v)
    me = bpy.data.meshes.new("s")
    bm.to_mesh(me)
    bm.free()
    sail = bpy.data.objects.new("s", me)
    add(sail, sailm)
    so = sail.modifiers.new("s", "SOLIDIFY")
    so.thickness = 0.04
    for o in (mast, sail):
        o.parent = h
    jib = bmesh.new()
    v = [jib.verts.new(c) for c in ((0.12, 0, 0.9), (0.12, 0, 7.5), (3.3, 0, 0.9))]
    jib.faces.new(v)
    me = bpy.data.meshes.new("j")
    jib.to_mesh(me)
    jib.free()
    j = bpy.data.objects.new("j", me)
    add(j, sailm)
    j.modifiers.new("s", "SOLIDIFY").thickness = 0.04
    j.parent = h


def banner_ocean():
    reset(80)
    sky(16, 48, strength=0.04, dust=1.2, sun_size_deg=0.8, sun_intensity=0.1)
    camera((0, -60, 8.5), (0, 40, 5.5), lens=30)
    bpy.ops.mesh.primitive_plane_add(size=6000, location=(0, 1000, 0))
    active(wave_material())
    # ostrov s pláží a palmami
    sand = mat("#e8d09a", rough=0.9)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=96, ring_count=48, location=(-52, 90, -1.4))
    isl = active(sand)
    isl.scale = (26, 17, 4.6)
    tex = bpy.data.textures.new("n", "CLOUDS")
    tex.noise_scale = 0.7
    d = isl.modifiers.new("d", "DISPLACE")
    d.texture = tex
    d.strength = 0.6
    # nízká zeleň na ostrově
    bush = mat("#2f7d38", rough=0.8, subsurface=0.15)
    rnd = random.Random(2)
    for _ in range(14):
        bpy.ops.mesh.primitive_ico_sphere_add(radius=rnd.uniform(1.0, 2.2), subdivisions=3, location=(-52 + rnd.uniform(-12, 12), 90 + rnd.uniform(-6, 6), 2.6))
        active(bush)
    bark = mat("#6b4a2c", rough=0.85)
    frond = mat("#2d8f3c", rough=0.55, subsurface=0.2)
    for px_, py_, ph in ((-58, 88, 15), (-49, 92, 12), (-54, 82, 10), (-44, 86, 13)):
        bpy.ops.mesh.primitive_cone_add(radius1=0.65, radius2=0.28, depth=ph, location=(px_, py_, ph / 2 + 2.2), vertices=14)
        t = active(bark)
        t.rotation_euler = (rnd.uniform(-0.12, 0.12), rnd.uniform(-0.14, 0.14), 0)
        for k in range(11):
            a = k * 2 * math.pi / 11 + rnd.uniform(-0.1, 0.1)
            bpy.ops.mesh.primitive_cube_add(size=1, location=(px_, py_, ph + 2.2))
            f = active(frond)
            f.scale = (5.6, 0.95, 0.07)
            f.rotation_euler = (0, math.radians(22 + rnd.uniform(-6, 8)), a)
            f.location = (px_ + math.cos(a) * 2.5, py_ + math.sin(a) * 2.5, ph + 2.6)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(px_, py_, ph + 1.9))
        active(mat("#5a3d28", rough=0.6))
    sailboat(40, 38, rot=math.radians(80), scale=1.6)
    sailboat(8, 120, rot=math.radians(70), scale=2.2)
    render("ocean")


def banner_forest():
    reset(72)
    sky(34, 150, strength=0.07, dust=2.5, sun_size_deg=1.5)
    camera((0, -50, 3.2), (0, 40, 9.5), lens=32)
    rnd = random.Random(8)
    grass = mat("#3b7a2e", rough=0.95, subsurface=0.1)
    nt = grass.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 0.08
    n.inputs["Detail"].default_value = 6
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#2f6a28")
    ramp.color_ramp.elements[1].color = lin("#6fae3d")
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    g = displaced_plane(3000, 320, 0.04, 9.0, grass, loc=(0, 600, -3.5))
    # lesní stezka uprostřed pohledu zůstane volná, stromy po stranách a ve vzdálenosti
    for _ in range(190):
        side = rnd.choice((-1, 1))
        x = side * (14 + abs(rnd.gauss(0, 60)))
        y = rnd.uniform(25, 420)
        if abs(x) < 14:
            continue
        h = rnd.uniform(14, 30) * (1 + (y / 600))
        if rnd.random() < 0.45:
            pine(x, y, -0.2, h, rnd, col=rnd.choice(["#1f4a2c", "#285a34", "#1a3f26"]))
        else:
            round_tree(x, y, -0.2, h * 0.8, rnd)
    # keře a květiny v popředí
    for _ in range(40):
        x = rnd.choice((-1, 1)) * rnd.uniform(6, 30)
        y = rnd.uniform(-10, 40)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=rnd.uniform(0.6, 1.6), subdivisions=2, location=(x, y, -0.4))
        active(mat(rnd.choice(["#2f7a35", "#3a8a3c", "#497f2c"]), rough=0.8, subsurface=0.1))
    for _ in range(80):
        x = rnd.uniform(-30, 30)
        y = rnd.uniform(-6, 40)
        c = rnd.choice(["#ffffff", "#ffd24d", "#ff6f91", "#c9a0ff"])
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(x, y, -0.2))
        active(mat(c, rough=0.4))
    # mlha mezi stromy: omezený objem s rozptylem
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 200, 6))
    fog = active(smooth=False)
    fog.scale = (500, 420, 14)
    fm = bpy.data.materials.new("fog")
    fm.use_nodes = True
    ft = fm.node_tree
    for nd in list(ft.nodes):
        if nd.type != "OUTPUT_MATERIAL":
            ft.nodes.remove(nd)
    sc_ = ft.nodes.new("ShaderNodeVolumeScatter")
    sc_.inputs["Density"].default_value = 0.0035
    sc_.inputs["Color"].default_value = lin("#e6f0ff")
    ft.links.new(sc_.outputs["Volume"], [nd for nd in ft.nodes if nd.type == "OUTPUT_MATERIAL"][0].inputs["Volume"])
    fog.data.materials.append(fm)
    render("forest")


def banner_galaxy():
    reset(96)
    sc = bpy.context.scene
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    # hvězdy: velmi malé voronoi buňky, jas podle náhodné hodnoty
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "F1"
    vor.inputs["Scale"].default_value = 380
    vor.inputs["Randomness"].default_value = 1.0
    nt.links.new(mp.outputs["Vector"], vor.inputs["Vector"])
    star_ramp = nt.nodes.new("ShaderNodeValToRGB")
    star_ramp.color_ramp.elements[0].position = 0.0
    star_ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    star_ramp.color_ramp.elements[1].position = 0.045
    star_ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs["Distance"], star_ramp.inputs[0])
    star_mul = nt.nodes.new("ShaderNodeMix")
    star_mul.data_type = "RGBA"
    star_mul.blend_type = "MULTIPLY"
    star_mul.inputs[0].default_value = 1.0
    nt.links.new(star_ramp.outputs["Color"], star_mul.inputs[6])
    colv = nt.nodes.new("ShaderNodeTexVoronoi")
    colv.feature = "F1"
    colv.inputs["Scale"].default_value = 380
    nt.links.new(mp.outputs["Vector"], colv.inputs["Vector"])
    cramp = nt.nodes.new("ShaderNodeValToRGB")
    cramp.color_ramp.elements[0].color = lin("#ffd9b0")
    cramp.color_ramp.elements[1].color = lin("#a8c8ff")
    nt.links.new(colv.outputs["Color"], cramp.inputs[0])
    nt.links.new(cramp.outputs["Color"], star_mul.inputs[7])
    star_gain = nt.nodes.new("ShaderNodeMath")
    star_gain.operation = "MULTIPLY"
    star_gain.inputs[1].default_value = 6.0
    # mlhovina: dvě vrstvy šumu s barevným přechodem, maskované pásem přes obrázek
    neb = nt.nodes.new("ShaderNodeTexNoise")
    neb.inputs["Scale"].default_value = 5.0
    neb.inputs["Detail"].default_value = 12
    neb.inputs["Roughness"].default_value = 0.6
    nt.links.new(mp.outputs["Vector"], neb.inputs["Vector"])
    nramp = nt.nodes.new("ShaderNodeValToRGB")
    nramp.color_ramp.elements[0].position = 0.42
    nramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    nramp.color_ramp.elements[1].position = 0.66
    nramp.color_ramp.elements[1].color = lin("#7a3cff")
    e = nramp.color_ramp.elements.new(0.6)
    e.color = lin("#3a2a9a")
    e2 = nramp.color_ramp.elements.new(0.7)
    e2.color = lin("#d03c9a")
    nt.links.new(neb.outputs["Fac"], nramp.inputs[0])
    band = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Window"], band.inputs[0])
    tilt = nt.nodes.new("ShaderNodeMath")
    tilt.operation = "MULTIPLY_ADD"
    tilt.inputs[1].default_value = -0.22
    nt.links.new(band.outputs["X"], tilt.inputs[0])
    nt.links.new(band.outputs["Y"], tilt.inputs[2])
    bandm = nt.nodes.new("ShaderNodeMath")
    bandm.operation = "SUBTRACT"
    bandm.inputs[1].default_value = 0.46
    nt.links.new(tilt.outputs["Value"], bandm.inputs[0])
    absm = nt.nodes.new("ShaderNodeMath")
    absm.operation = "ABSOLUTE"
    nt.links.new(bandm.outputs["Value"], absm.inputs[0])
    inv = nt.nodes.new("ShaderNodeMapRange")
    inv.inputs["From Min"].default_value = 0.0
    inv.inputs["From Max"].default_value = 0.42
    inv.inputs["To Min"].default_value = 1.0
    inv.inputs["To Max"].default_value = 0.0
    inv.clamp = True
    nt.links.new(absm.outputs["Value"], inv.inputs["Value"])
    nmask = nt.nodes.new("ShaderNodeMix")
    nmask.data_type = "RGBA"
    nmask.blend_type = "MULTIPLY"
    nt.links.new(inv.outputs["Result"], nmask.inputs[0])
    nmask.inputs[0].default_value = 1.0
    nmask_in = nt.nodes.new("ShaderNodeMix")
    nmask_in.data_type = "RGBA"
    nmask_in.blend_type = "MULTIPLY"
    nmask_in.inputs[0].default_value = 1.0
    nt.links.new(nramp.outputs["Color"], nmask_in.inputs[6])
    nt.links.new(inv.outputs["Result"], nmask_in.inputs[7])
    add_ = nt.nodes.new("ShaderNodeMix")
    add_.data_type = "RGBA"
    add_.blend_type = "ADD"
    add_.inputs[0].default_value = 1.0
    sc_gain = nt.nodes.new("ShaderNodeMix")
    sc_gain.data_type = "RGBA"
    sc_gain.blend_type = "MULTIPLY"
    sc_gain.inputs[0].default_value = 1.0
    sc_gain.inputs[7].default_value = (5, 5, 5, 1)
    nt.links.new(star_mul.outputs[2], sc_gain.inputs[6])
    nt.links.new(sc_gain.outputs[2], add_.inputs[6])
    boost = nt.nodes.new("ShaderNodeMix")
    boost.data_type = "RGBA"
    boost.blend_type = "MULTIPLY"
    boost.inputs[0].default_value = 1.0
    boost.inputs[7].default_value = (2.6, 2.6, 2.6, 1)
    nt.links.new(nmask_in.outputs[2], boost.inputs[6])
    nt.links.new(boost.outputs[2], add_.inputs[7])
    nt.links.new(add_.outputs[2], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    sc.world = w
    camera((0, -30, 0), (0, 30, 1.0), lens=28)
    # planety: Saturn s prstencem, modrý plynný obr, měsíc
    def planet(loc, r, colors, band_scale, rot=0.0, ring=False):
        m = bpy.data.materials.new("pl")
        m.use_nodes = True
        t = m.node_tree
        b = t.nodes["Principled BSDF"]
        b.inputs["Roughness"].default_value = 0.7
        tcx = t.nodes.new("ShaderNodeTexCoord")
        mpx = t.nodes.new("ShaderNodeMapping")
        mpx.inputs["Scale"].default_value = (1.0, 1.0, band_scale)
        t.links.new(tcx.outputs["Object"], mpx.inputs["Vector"])
        wv = t.nodes.new("ShaderNodeTexWave")
        wv.wave_type = "BANDS"
        wv.bands_direction = "Z"
        wv.inputs["Scale"].default_value = 3.2
        wv.inputs["Distortion"].default_value = 3.0
        wv.inputs["Detail"].default_value = 4
        t.links.new(mpx.outputs["Vector"], wv.inputs["Vector"])
        rp = t.nodes.new("ShaderNodeValToRGB")
        rp.color_ramp.elements[0].color = lin(colors[0])
        rp.color_ramp.elements[1].color = lin(colors[1])
        t.links.new(wv.outputs["Fac"], rp.inputs[0])
        t.links.new(rp.outputs["Color"], b.inputs["Base Color"])
        lay = t.nodes.new("ShaderNodeLayerWeight")
        em = t.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = lin(colors[2] if len(colors) > 2 else "#88aaff")
        em.inputs["Strength"].default_value = 0.0
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=96, ring_count=48, location=loc)
        o = active(m)
        o.rotation_euler = (math.radians(rot), 0, math.radians(-20))
        if ring:
            rm = bpy.data.materials.new("ring")
            rm.use_nodes = True
            rt = rm.node_tree
            rb = rt.nodes["Principled BSDF"]
            rb.inputs["Roughness"].default_value = 0.8
            tcr = rt.nodes.new("ShaderNodeTexCoord")
            wr = rt.nodes.new("ShaderNodeTexWave")
            wr.wave_type = "RINGS"
            wr.inputs["Scale"].default_value = 9
            wr.inputs["Distortion"].default_value = 5
            wr.inputs["Detail"].default_value = 3
            rt.links.new(tcr.outputs["Object"], wr.inputs["Vector"])
            rr = rt.nodes.new("ShaderNodeValToRGB")
            rr.color_ramp.elements[0].color = lin("#8c7456")
            rr.color_ramp.elements[1].color = lin("#e9d8b6")
            rt.links.new(wr.outputs["Fac"], rr.inputs[0])
            rt.links.new(rr.outputs["Color"], rb.inputs["Base Color"])
            bpy.ops.mesh.primitive_torus_add(major_radius=r * 1.85, minor_radius=r * 0.42, major_segments=160, minor_segments=24, location=loc)
            ro = active(rm)
            ro.scale = (1.0, 1.0, 0.035)
            ro.rotation_euler = o.rotation_euler
        return o

    planet((-17, 40, 2.2), 5.2, ("#8a5a3a", "#e8c89a"), 1.0, rot=70, ring=True)
    planet((15, 55, -2.4), 3.6, ("#0f3a8a", "#4a8aff"), 1.3, rot=80)
    planet((3.5, 24, 5.4), 0.95, ("#9a9a9a", "#d8d8d8"), 6.0)
    # slunce jako směrové světlo zleva
    d = bpy.data.lights.new("sun", "SUN")
    d.energy = 4.0
    d.angle = math.radians(1.0)
    d.color = (1, 0.96, 0.9)
    o = bpy.data.objects.new("sun", d)
    o.rotation_euler = (math.radians(70), 0, math.radians(-120))
    bpy.context.collection.objects.link(o)
    render("galaxy")


def banner_candy():
    reset(80)
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Window"], sep.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = lin("#ffe9f1")
    ramp.color_ramp.elements[1].color = lin("#bfe3ff")
    nt.links.new(sep.outputs["Y"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.9
    bpy.context.scene.world = w
    sun = bpy.data.lights.new("s", "SUN")
    sun.energy = 3.0
    sun.angle = math.radians(4)
    so = bpy.data.objects.new("s", sun)
    so.rotation_euler = (math.radians(50), 0, math.radians(30))
    bpy.context.collection.objects.link(so)
    camera((0, -20, 5.0), (0, 40, 6.5), lens=34)
    rnd = random.Random(21)
    # polevová hladina: lesklá růžová poleva s hrbolky
    icing = mat("#ffb6d2", rough=0.38, coat=0.6, subsurface=0.35)
    displaced_plane(2400, 260, 0.025, 1.2, icing, loc=(0, 500, -0.2))
    # sypání
    sprinkle_cols = ["#ff4d6d", "#ffd24d", "#4dd2ff", "#7cff6b", "#ffffff", "#c07cff"]
    for _ in range(420):
        x, y = rnd.uniform(-45, 45), rnd.uniform(-8, 90)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, segments=16, ring_count=8, location=(x, y, 0.25))
        o = active(mat(rnd.choice(sprinkle_cols), rough=0.3, coat=0.6))
        o.scale = (1, 1, 2.6)
        o.rotation_euler = (math.pi / 2, 0, rnd.uniform(0, math.pi))
    # lízátka
    def lolly(x, y, h, r, cols):
        stick = mat("#ffffff", rough=0.3, coat=0.8)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=h, location=(x, y, h / 2))
        active(stick)
        m = bpy.data.materials.new("sw")
        m.use_nodes = True
        t = m.node_tree
        b = t.nodes["Principled BSDF"]
        b.inputs["Roughness"].default_value = 0.08
        b.inputs["Coat Weight"].default_value = 1.0
        b.inputs["Subsurface Weight"].default_value = 0.3
        tcx = t.nodes.new("ShaderNodeTexCoord")
        sp = t.nodes.new("ShaderNodeSeparateXYZ")
        t.links.new(tcx.outputs["Object"], sp.inputs[0])
        atan = t.nodes.new("ShaderNodeMath")
        atan.operation = "ARCTAN2"
        t.links.new(sp.outputs["Y"], atan.inputs[0])
        t.links.new(sp.outputs["X"], atan.inputs[1])
        dist = t.nodes.new("ShaderNodeVectorMath")
        dist.operation = "LENGTH"
        t.links.new(tcx.outputs["Object"], dist.inputs[0])
        spiral = t.nodes.new("ShaderNodeMath")
        spiral.operation = "MULTIPLY_ADD"
        spiral.inputs[1].default_value = 5.0
        t.links.new(dist.outputs["Value"], spiral.inputs[0])
        ang = t.nodes.new("ShaderNodeMath")
        ang.operation = "MULTIPLY"
        ang.inputs[1].default_value = 3.0 / (2 * math.pi)
        t.links.new(atan.outputs["Value"], ang.inputs[0])
        t.links.new(ang.outputs["Value"], spiral.inputs[2])
        fr = t.nodes.new("ShaderNodeMath")
        fr.operation = "FRACT"
        t.links.new(spiral.outputs["Value"], fr.inputs[0])
        st = t.nodes.new("ShaderNodeMath")
        st.operation = "GREATER_THAN"
        st.inputs[1].default_value = 0.5
        t.links.new(fr.outputs["Value"], st.inputs[0])
        mixc = t.nodes.new("ShaderNodeMix")
        mixc.data_type = "RGBA"
        mixc.inputs[6].default_value = lin(cols[0])
        mixc.inputs[7].default_value = lin(cols[1])
        t.links.new(st.outputs["Value"], mixc.inputs[0])
        t.links.new(mixc.outputs[2], b.inputs["Base Color"])
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=r * 0.32, location=(x, y - 0.1, h + r * 0.8), vertices=96)
        d = active(m)
        d.rotation_euler = (math.pi / 2, 0, 0)
        bv = d.modifiers.new("b", "BEVEL")
        bv.width = r * 0.14
        bv.segments = 4
    for x, y, h, r, cols in ((-24, 40, 9, 3.4, ("#ff4d7a", "#ffffff")), (-13, 58, 12, 4.2, ("#ffb347", "#ffffff")), (23, 38, 10, 3.6, ("#6a5cff", "#ffffff")), (34, 56, 12.5, 4.6, ("#2fd0ff", "#ffffff"))):
        lolly(x, y, h, r, cols)
    # cukrové hole: zahnutá trubka s pruhy
    def cane(x, y, h, col):
        curve = bpy.data.curves.new("c", "CURVE")
        curve.dimensions = "3D"
        sp = curve.splines.new("BEZIER")
        sp.bezier_points.add(3)
        pts = [(x, y, 0), (x, y, h * 0.7), (x + h * 0.12, y, h * 0.95), (x + h * 0.3, y, h * 0.82)]
        for bp, p in zip(sp.bezier_points, pts):
            bp.co = p
            bp.handle_left_type = bp.handle_right_type = "AUTO"
        curve.bevel_depth = h * 0.045
        curve.bevel_resolution = 8
        o = bpy.data.objects.new("c", curve)
        bpy.context.collection.objects.link(o)
        m = bpy.data.materials.new("cane")
        m.use_nodes = True
        t = m.node_tree
        b = t.nodes["Principled BSDF"]
        b.inputs["Roughness"].default_value = 0.08
        b.inputs["Coat Weight"].default_value = 1.0
        tcx = t.nodes.new("ShaderNodeTexCoord")
        wv = t.nodes.new("ShaderNodeTexWave")
        wv.wave_type = "BANDS"
        wv.bands_direction = "DIAGONAL"
        wv.wave_profile = "SAW"
        wv.inputs["Scale"].default_value = 3.2
        t.links.new(tcx.outputs["Object"], wv.inputs["Vector"])
        st = t.nodes.new("ShaderNodeMath")
        st.operation = "GREATER_THAN"
        st.inputs[1].default_value = 0.5
        t.links.new(wv.outputs["Fac"], st.inputs[0])
        mixc = t.nodes.new("ShaderNodeMix")
        mixc.data_type = "RGBA"
        mixc.inputs[6].default_value = lin(col)
        mixc.inputs[7].default_value = lin("#ffffff")
        t.links.new(st.outputs["Value"], mixc.inputs[0])
        t.links.new(mixc.outputs[2], b.inputs["Base Color"])
        o.data.materials.append(m)
    cane(-5, 48, 9, "#e8213f")
    cane(11, 62, 11, "#2fa84f")
    # gumové bonbóny: průsvitné polokoule
    for _ in range(40):
        x = rnd.choice((-1, 1)) * rnd.uniform(8, 36)
        y = rnd.uniform(5, 70)
        c = rnd.choice(["#ff3b6b", "#ffd24d", "#3bd1ff", "#7be86b", "#b66dff", "#ff8a3d"])
        r = rnd.uniform(0.6, 1.5)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24, location=(x, y, 0.1))
        o = active(mat(c, rough=0.1, coat=1.0, transmission=0.35, subsurface=0.6, ior=1.4))
        o.scale = (1, 1, 0.72)
    # makronky
    for x, y in ((-30, 20), (30, 22), (16, 30)):
        for k, (c, z) in enumerate((("#ff9ec7", 0.4), ("#fff1d6", 1.1), ("#ff9ec7", 1.8))):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=2.2 if k != 1 else 1.9, segments=48, ring_count=24, location=(x, y, z + 0.6))
            o = active(mat(c, rough=0.7, subsurface=0.2))
            o.scale = (1, 1, 0.42)
    # vata: bílé nadýchané oblaky
    wool = mat("#fff6fb", rough=0.9, subsurface=0.5)
    for cx, cy, cz in ((-80, 260, 62), (70, 300, 70), (5, 340, 78)):
        for _ in range(9):
            bpy.ops.mesh.primitive_ico_sphere_add(radius=rnd.uniform(8, 16), subdivisions=3, location=(cx + rnd.uniform(-20, 20), cy, cz + rnd.uniform(-5, 5)))
            o = active(wool)
            tex = bpy.data.textures.new("n", "CLOUDS")
            tex.noise_scale = 0.8
            d = o.modifiers.new("d", "DISPLACE")
            d.texture = tex
            d.strength = 1.2
    render("candy")


def banner_night_city():
    reset(96)
    sc = bpy.context.scene
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Window"], sep.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.45
    ramp.color_ramp.elements[0].color = lin("#ff7a6e")
    ramp.color_ramp.elements[1].position = 0.95
    ramp.color_ramp.elements[1].color = lin("#0c0a2a")
    e = ramp.color_ramp.elements.new(0.65)
    e.color = lin("#6a2f7a")
    nt.links.new(sep.outputs["Y"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.55
    sc.world = w
    camera((0, -170, 10), (0, 100, 34), lens=30)
    rnd = random.Random(31)
    # budovy: kvádry s okny z procedurální textury (některá svítí)
    def windows_mat(seed, warm):
        m = bpy.data.materials.new("bld")
        m.use_nodes = True
        t = m.node_tree
        b = t.nodes["Principled BSDF"]
        hue = ["#15152e", "#1b1a36", "#12182c", "#20203a"][seed % 4]
        b.inputs["Base Color"].default_value = lin(hue)
        b.inputs["Roughness"].default_value = 0.3
        b.inputs["Metallic"].default_value = 0.35
        geo = t.nodes.new("ShaderNodeNewGeometry")
        # okna na stěnách: vodorovná souřadnice = x + y, svislá = z (stěny budov jsou rovnoběžné s osami)
        sp = t.nodes.new("ShaderNodeSeparateXYZ")
        t.links.new(geo.outputs["Position"], sp.inputs[0])
        hx = t.nodes.new("ShaderNodeMath")
        hx.operation = "ADD"
        t.links.new(sp.outputs["X"], hx.inputs[0])
        t.links.new(sp.outputs["Y"], hx.inputs[1])
        cb = t.nodes.new("ShaderNodeCombineXYZ")
        t.links.new(hx.outputs["Value"], cb.inputs["X"])
        t.links.new(sp.outputs["Z"], cb.inputs["Y"])
        mp = t.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (0.2, 0.3, 1.0)
        t.links.new(cb.outputs["Vector"], mp.inputs["Vector"])
        br = t.nodes.new("ShaderNodeTexBrick")
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = 0.22
        br.inputs["Mortar Smooth"].default_value = 0.0
        br.inputs["Bias"].default_value = 0.0
        br.inputs["Brick Width"].default_value = 1.0
        br.inputs["Row Height"].default_value = 1.0
        br.offset = 0.0
        t.links.new(mp.outputs["Vector"], br.inputs["Vector"])
        br.inputs["Color1"].default_value = lin("#ffd98a" if warm else "#cfe6ff")
        br.inputs["Color2"].default_value = lin("#1a1a30")
        br.inputs["Mortar"].default_value = (0, 0, 0, 1)
        t.links.new(br.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = 1.6
        return m
    for layer, (y, count, hmax, spread) in enumerate(((520, 70, 130, 800), (400, 60, 105, 600), (310, 50, 85, 440), (230, 36, 62, 330))):
        for i in range(count):
            x = rnd.uniform(-spread, spread)
            bw = rnd.uniform(14, 34)
            bh = rnd.uniform(25, hmax)
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y + rnd.uniform(-20, 20), bh / 2 - 6))
            o = active(windows_mat(i, rnd.random() < 0.7), smooth=False)
            o.scale = (bw, bw * rnd.uniform(0.8, 1.2), bh)
    # řeka s odrazy
    bpy.ops.mesh.primitive_plane_add(size=4000, location=(0, 200, -6))
    active(mat("#0a0c22", rough=0.025, metal=0.0, ior=1.33))
    # měsíc
    bpy.ops.mesh.primitive_uv_sphere_add(radius=24, segments=64, ring_count=32, location=(-210, 800, 190))
    mm = mat("#fff2d6", rough=0.9, emit=1.1)
    nt2 = mm.node_tree
    tcm = nt2.nodes.new("ShaderNodeTexCoord")
    nz = nt2.nodes.new("ShaderNodeTexVoronoi")
    nz.inputs["Scale"].default_value = 5
    nt2.links.new(tcm.outputs["Object"], nz.inputs["Vector"])
    cr = nt2.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = lin("#d8c8a4")
    cr.color_ramp.elements[1].color = lin("#fff2d6")
    nt2.links.new(nz.outputs["Distance"], cr.inputs[0])
    nt2.links.new(cr.outputs["Color"], nt2.nodes["Principled BSDF"].inputs["Emission Color"])
    active(mm)
    # pouliční světla v popředí (rozostřená: bokeh)
    cam = bpy.context.scene.camera
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = 260
    cam.data.dof.aperture_fstop = 1.6
    lampm = mat("#ffc66b", emit=40.0)
    for x in (-60, -28, 30, 62, 95, -95):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(x, -90 + rnd.uniform(0, 30), 2.8 + rnd.uniform(0, 3)))
        active(lampm)
    # světelné stopy aut na nábřeží
    trail_r = mat("#ff2a2a", emit=18.0)
    trail_w = mat("#fff4d0", emit=18.0)
    for i in range(30):
        x = rnd.uniform(-120, 120)
        y = rnd.uniform(-60, -20)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, -3.5))
        o = active(trail_r if i % 2 else trail_w, smooth=False)
        o.scale = (rnd.uniform(4, 14), 0.25, 0.25)
    render("night-city")


def banner_snow():
    reset(80)
    sky(9, -35, strength=0.055, dust=6.0, sun_size_deg=2.5, sun_intensity=0.5)
    camera((0, -50, 3.6), (0, 40, 9.5), lens=32)
    rnd = random.Random(12)
    snow = mat("#f2f6ff", rough=0.55, subsurface=0.5)
    nt = snow.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Subsurface Radius"].default_value = (0.5, 0.7, 1.0)
    # sněhové pole s závějemi
    displaced_plane(3000, 340, 0.035, 5.5, snow, loc=(0, 560, -3.0))
    # smrky se sněhem
    for _ in range(120):
        side = rnd.choice((-1, 1))
        x = side * (12 + abs(rnd.gauss(0, 55)))
        y = rnd.uniform(20, 380)
        if abs(x) < 12:
            continue
        h = rnd.uniform(14, 30) * (1 + y / 700)
        pine(x, y, -0.5, h, rnd, col=rnd.choice(["#1f4a35", "#245540", "#193f2e"]), snow=True)
    # sněhulák vpravo
    sm = mat("#ffffff", rough=0.65, subsurface=0.5)
    x0, y0 = 20, 28
    for z, r in ((1.6, 1.9), (4.2, 1.4), (6.1, 1.0)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=64, ring_count=32, location=(x0, y0, z - 0.4))
        active(sm)
    bpy.ops.mesh.primitive_cone_add(radius1=0.16, radius2=0.01, depth=1.0, location=(x0, y0 - 1.15, 6.1))
    c = active(mat("#ff7a1f", rough=0.6))
    c.rotation_euler = (math.pi / 2, 0, 0)
    for dx in (-0.35, 0.35):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(x0 + dx, y0 - 0.92, 6.4))
        active(mat("#16132b", rough=0.3, coat=0.6))
    for k in range(5):
        a = (k - 2) * 0.22
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(x0 + math.sin(a) * 0.6, y0 - 0.82, 5.72 - abs(a) * 0.4))
        active(mat("#16132b", rough=0.3))
    # šála
    bpy.ops.mesh.primitive_torus_add(major_radius=1.05, minor_radius=0.22, location=(x0, y0, 5.1))
    active(mat("#e5484d", rough=0.8, subsurface=0.2))
    # čepice
    bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=0.9, location=(x0, y0, 7.3))
    active(mat("#2a2f4a", rough=0.5))
    bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=0.1, location=(x0, y0, 6.9))
    active(mat("#2a2f4a", rough=0.5))
    # padající sníh: drobné lesklé kuličky různé velikosti (hlubší jsou menší)
    flake = mat("#ffffff", rough=0.4, emit=2.0)
    for _ in range(700):
        y = rnd.uniform(-20, 220)
        x = rnd.uniform(-1, 1) * (30 + y * 0.9)
        z = rnd.uniform(-2, 55)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.06 + 0.0016 * (y + 30) * rnd.uniform(0.5, 1.2), subdivisions=1, location=(x, y, z))
        active(flake, smooth=False)
    # mlha
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 200, 8))
    fog = active(smooth=False)
    fog.scale = (500, 420, 22)
    fm = bpy.data.materials.new("fog")
    fm.use_nodes = True
    ft = fm.node_tree
    for nd in list(ft.nodes):
        if nd.type != "OUTPUT_MATERIAL":
            ft.nodes.remove(nd)
    sc_ = ft.nodes.new("ShaderNodeVolumeScatter")
    sc_.inputs["Density"].default_value = 0.006
    sc_.inputs["Color"].default_value = lin("#dfe9ff")
    ft.links.new(sc_.outputs["Volume"], [nd for nd in ft.nodes if nd.type == "OUTPUT_MATERIAL"][0].inputs["Volume"])
    fog.data.materials.append(fm)
    render("snow")


BANNERS = {
    "sunset": banner_sunset,
    "ocean": banner_ocean,
    "forest": banner_forest,
    "galaxy": banner_galaxy,
    "candy": banner_candy,
    "night-city": banner_night_city,
    "snow": banner_snow,
}

if __name__ == "__main__":
    for k, fn in BANNERS.items():
        if ONLY and ONLY != k:
            continue
        fn()
