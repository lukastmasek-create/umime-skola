"""Animované 3D ozdoby přírodní části úvodní stránky, vyrenderované po snímcích.

    blender -b --python umime-art/scripts/home_anim.py -- <výstupní složka> [id [id …]]
    python umime-art/scripts/home_anim.py <výstupní složka> [id [id …]]

Každá ozdoba je detailní model s pohybem (mávání křídel, kroky, švihání ocasu, mrknutí, otáčení paprsků …),
vyrenderovaný do `<id>_<snímek>.png` (průhledné, 512 × 512). `home_anim_publish.py` je poskládá do pásů
`public/home/anim/<id>.webp`; web je přehrává přes CSS `steps()` (komponenta AnimatedArt).
"""

import math
import os
import random
import sys

import bpy
import bmesh  # noqa: E402  (v pip balíčku bpy až po importu bpy)
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import frames as F  # noqa: E402  (mat, studio, reset: stejné fyzikální materiály a studiové světlo)
from frames import lin, mat  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
OUT = ARGS[0] if ARGS else "anim_out"
ONLY = set(ARGS[1:])
os.makedirs(OUT, exist_ok=True)

TAU = 2 * math.pi
SIZE = 512


def scene(cam_loc=(0, -8, 1.2), look=(0, 0, 1.0), lens=60, samples=40):
    F.reset()
    sc = bpy.context.scene
    sc.cycles.samples = samples
    sc.render.resolution_x = sc.render.resolution_y = SIZE
    for o in list(bpy.data.objects):
        if o.type == "CAMERA":
            bpy.data.objects.remove(o)
    cam = bpy.data.cameras.new("c")
    cam.lens = lens
    co = bpy.data.objects.new("c", cam)
    co.location = cam_loc
    bpy.context.collection.objects.link(co)
    co.rotation_euler = (Vector(look) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = co


def sph(loc, r, m, scale=(1, 1, 1), rot=(0, 0, 0), seg=40):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=seg // 2, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    o.rotation_euler = tuple(math.radians(a) for a in rot)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def cone(loc, r1, r2, depth, m, direction=None, verts=16):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=depth, vertices=verts, location=loc)
    o = bpy.context.active_object
    if direction is not None:
        o.rotation_euler = Vector(direction).normalized().to_track_quat("Z", "Y").to_euler()
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def cyl(loc, r, depth, m, direction=(0, 0, 1), verts=12):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, vertices=verts, location=loc)
    o = bpy.context.active_object
    o.rotation_euler = Vector(direction).normalized().to_track_quat("Z", "Y").to_euler()
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def pivot(loc):
    p = bpy.data.objects.new("pivot", None)
    p.location = loc
    bpy.context.collection.objects.link(p)
    return p


def attach(child, parent):
    bpy.context.view_layer.update()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def eye(loc, r=0.1, closed=0.0):
    """Lesklé oko s odleskem; `closed` 0..1 je přivřené víčko (zploštění)."""
    e = sph(loc, r, mat("#16132b", rough=0.08, coat=1.0), (1, 0.8, max(0.08, 1 - closed)))
    h = sph(loc + Vector((r * 0.28, -r * 0.75, r * 0.3)), r * 0.3, mat("#ffffff", rough=0.1, emit=2.0))
    h.scale.z = max(0.1, 1 - closed)
    return e, h


def hair(obj, count, length, color, children=6, radius=0.0035, rnd=0.35):
    """Srst: vlasový particle systém s dětmi, materiál podle barvy."""
    ps_mod = obj.modifiers.new("fur", "PARTICLE_SYSTEM")
    ps = ps_mod.particle_system
    st = ps.settings
    st.type = "HAIR"
    st.count = count
    st.hair_length = length
    st.child_type = "INTERPOLATED"
    st.child_percent = children * 10
    st.rendered_child_count = children
    st.child_length = 0.9
    st.child_radius = 0.15
    st.child_roundness = 0.4
    st.clump_factor = 0.4
    st.use_advanced_hair = False
    st.root_radius = radius * 1.6
    st.tip_radius = radius * 0.3
    st.brownian_factor = rnd * 0.2
    st.material = len(obj.data.materials)
    obj.data.materials.append(mat(color, rough=0.75, subsurface_Weight=0.2))
    return ps


def render_frames(name, n, pose, extra=None):
    sc = bpy.context.scene
    for i in range(n):
        t = i / n
        pose(t, i)
        sc.render.filepath = os.path.join(OUT, f"{name}_{i:02d}.png")
        bpy.ops.render.render(write_still=True)
    print("OK", name, n, flush=True)


# --------------------------------------------------------------------------------------------
# Motýl
# --------------------------------------------------------------------------------------------


def wing_mesh(points, m):
    """Křídlo z obrysu (x, z) s jemným prohnutím do hloubky."""
    bm = bmesh.new()
    center = bm.verts.new((0, 0, 0))
    ring = [bm.verts.new((x, -0.05 * (x * x + z * z) ** 0.5 * 0.35, z)) for x, z in points]
    for i in range(len(ring)):
        bm.faces.new((center, ring[i], ring[(i + 1) % len(ring)]))
    me = bpy.data.meshes.new("wing")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("wing", me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    sub = o.modifiers.new("s", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 3
    sol = o.modifiers.new("t", "SOLIDIFY")
    sol.thickness = 0.015
    for p in me.polygons:
        p.use_smooth = True
    return o


def butterfly():
    scene(cam_loc=(0, -8.5, 2.2), look=(0, 0, 0.1), lens=70)
    orange = mat("#ff8a1f", rough=0.5, subsurface_Weight=0.35, emit=0.15, emit_color="#ff7a10")
    yellow = mat("#ffd24d", rough=0.5, subsurface_Weight=0.3)
    ink = mat("#1a1226", rough=0.55)
    white = mat("#fff8ea", rough=0.4)
    fore = [(0.15, 0.1), (0.7, 0.55), (1.45, 1.05), (2.05, 1.0), (2.25, 0.55), (2.0, 0.05), (1.3, -0.2), (0.5, -0.1)]
    hind = [(0.1, -0.1), (0.8, -0.2), (1.45, -0.55), (1.55, -1.1), (1.1, -1.55), (0.5, -1.35), (0.15, -0.7)]
    parts = []
    for side in (-1, 1):
        piv = pivot((0, 0, 0))
        mirror = lambda pts: [(side * x, z) for x, z in pts]  # noqa: E731
        for pts, base in ((fore, orange), (hind, yellow)):
            border = wing_mesh([(x * 1.07, z * 1.07 + (0.02 if z > 0 else -0.02)) for x, z in mirror(pts)], ink)
            border.location.y = 0.03
            attach(border, piv)
            w = wing_mesh(mirror(pts), base)
            attach(w, piv)
            # žilky: tenké tmavé pruhy z kořene křídla
            for k in range(5):
                ang = math.radians(-35 + k * 24) if pts is fore else math.radians(-100 + k * 20)
                d = Vector((side * math.cos(ang), 0, math.sin(ang)))
                vein = cyl(d * (0.8 if pts is fore else 0.6) + Vector((0, -0.04, 0)), 0.015, 1.5 if pts is fore else 1.1, ink, direction=d)
                attach(vein, piv)
            # bílé tečky na okraji
            for k, (x, z) in enumerate(mirror(pts)[1:7]):
                dot = sph((x * 0.96, -0.06, z * 0.96), 0.05, white, (1, 0.4, 1))
                attach(dot, piv)
        parts.append((side, piv))
    # tělo
    cyl((0, 0, -0.05), 0.09, 1.3, mat("#2a1e1a", rough=0.6), direction=(0, 0, 1))
    sph((0, 0, 0.6), 0.2, mat("#2a1e1a", rough=0.6), (1, 1, 1.15))
    sph((0, -0.05, 0.9), 0.17, mat("#2a1e1a", rough=0.5))
    for sx in (-1, 1):
        eye(Vector((sx * 0.08, -0.15, 0.95)), 0.06)
        ant = cyl((sx * 0.1, -0.05, 1.3), 0.012, 0.8, ink, direction=(sx * 0.35, 0, 1))
        sph((sx * 0.1 + sx * 0.28 * 0.8, -0.05, 1.68), 0.04, ink)
        _ = ant
    for k in range(6):  # pruhy na zadečku
        sph((0, 0, -0.4 + k * 0.12), 0.1, mat("#ffd24d", rough=0.5), (1.05, 1.05, 0.25))

    def pose(t, i):
        a = math.radians(5 + 62 * (0.5 + 0.5 * math.cos(TAU * t)))
        for side, piv in parts:
            # mávání: otočení kolem svislé osy těla (Z) sklápí křídla k/od kamery
            piv.rotation_euler = (0, 0, side * a)

    render_frames("motyl", 10, pose)


# --------------------------------------------------------------------------------------------
# Beruška (kráčí doprava, boční pohled)
# --------------------------------------------------------------------------------------------


def ladybug():
    scene(cam_loc=(0.6, -7.0, 1.4), look=(0, 0, 0.45), lens=75)
    red = mat("#e5241f", rough=0.18, coat=1.0, subsurface_Weight=0.15)
    black = mat("#15121c", rough=0.3, coat=0.6)
    white = mat("#fff8ea", rough=0.3)
    body = pivot((0, 0, 0.55))
    # krovky: dvě poloviny elipsoidu (1.15, 0.52, 0.7) kolem středu (0, ±0.3, 0.65) s tečkami na povrchu
    for sx in (-1, 1):
        c = Vector((0, sx * 0.3, 0.65))
        attach(sph(c, 1.0, red, (1.15, 0.52, 0.7)), body)
        for nx, ny, nz in ((-0.55, -0.6, 0.55), (0.1, -0.5, 0.8), (0.55, -0.7, 0.4), (-0.15, -0.9, 0.2), (-0.7, -0.5, 0.1)):
            n = Vector((nx, sx * 0.0 + ny, nz)).normalized()
            d = Vector((1.15 * n.x, 0.52 * n.y * (1 if sx < 0 else -1), 0.7 * n.z))
            spot = sph(c + d * 0.99, 0.16, black, (1, 0.3, 1))
            attach(spot, body)
    attach(sph((0, 0, 1.3), 0.04, black, (13, 0.8, 0.5)), body)
    attach(sph((1.15, 0, 0.55), 0.5, black, (0.9, 1.0, 0.85)), body)
    for sy in (-1, 1):
        attach(sph((1.42, sy * 0.3, 0.75), 0.13, white, (1, 0.4, 1.1)), body)
        attach(sph((1.5, sy * 0.4, 0.55), 0.08, black, (1, 0.5, 1)), body)
        attach(cyl((1.55, sy * 0.15, 1.05), 0.02, 0.6, black, direction=(0.5, sy * 0.3, 0.6)), body)
    legs = []
    for k, x in enumerate((0.6, 0.0, -0.6)):
        for sy in (-1, 1):
            hip = pivot((x, sy * 0.45, 0.5))
            attach(hip, body)
            attach(cyl((x, sy * 0.7, 0.3), 0.05, 0.5, black, direction=(0, sy * 0.7, -0.7)), hip)
            attach(cyl((x, sy * 0.95, 0.02), 0.04, 0.45, black, direction=(0, sy * 0.15, -1)), hip)
            legs.append((hip, (k + (0 if sy > 0 else 1)) % 2))

    def pose(t, i):
        s = math.sin(TAU * t)
        body.location = (0, 0, 0.55 + 0.04 * abs(math.sin(TAU * t * 2)))
        body.rotation_euler = (0, math.radians(2.5 * s), math.radians(2 * math.sin(TAU * t * 2)))
        for hip, grp in legs:
            ph = s if grp == 0 else -s
            hip.rotation_euler = (0, math.radians(24 * ph), 0)

    render_frames("beruska", 8, pose)


# --------------------------------------------------------------------------------------------
# Světluška
# --------------------------------------------------------------------------------------------


def firefly():
    scene(cam_loc=(0, -6.5, 0.4), look=(0, 0, 0.5), lens=70)
    dark = mat("#2a2236", rough=0.35, coat=0.5)
    rust = mat("#8a3b1c", rough=0.4)
    glow = mat("#fff6a8", rough=0.2, emit=4.0, emit_color="#ffe65a")
    sph((0, 0, 0.7), 0.3, dark, (1, 1.25, 1.1))  # hruď
    sph((0, -0.02, 1.15), 0.22, dark)  # hlava
    sph((0, 0.08, 0.95), 0.2, rust, (1.1, 1.2, 0.6))  # štít
    abdomen = sph((0, 0.05, 0.0), 0.36, glow, (1, 1.1, 1.3))
    for k in range(4):
        sph((0, 0.0, 0.25 - k * 0.13), 0.33, dark, (1.02, 1.1, 0.12))
    for sx in (-1, 1):
        eye(Vector((sx * 0.1, -0.2, 1.2)), 0.07)
        a = cyl((sx * 0.1, -0.1, 1.55), 0.012, 0.5, dark, direction=(sx * 0.5, 0, 1))
        _ = a
        for k in range(3):
            leg = cyl((sx * 0.18, 0.0, 0.5 - k * 0.12), 0.016, 0.5, dark, direction=(sx * 1, 0.1 * (k - 1), -0.6))
            _ = leg
    wing_m = mat("#dff0ff", rough=0.1, transmission=0.85)
    wing_e = mat("#3b2d55", rough=0.3)
    wings = []
    for sx in (-1, 1):
        p = pivot((sx * 0.18, 0.1, 0.95))
        w = sph((sx * 0.18 + sx * 0.5, 0.1, 0.95), 0.42, wing_m, (1.1, 0.04, 0.55))
        attach(w, p)
        el = sph((sx * 0.18 + sx * 0.4, 0.15, 0.85), 0.3, wing_e, (1.2, 0.07, 0.4))
        attach(el, p)
        wings.append((sx, p))
    gl = abdomen.data.materials[0].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]

    def pose(t, i):
        flap = math.sin(TAU * t * 3)
        for sx, p in wings:
            p.rotation_euler = (0, math.radians(sx * 28 * flap), math.radians(-sx * 8 * flap))
        gl.default_value = 3.0 + 3.0 * (0.5 + 0.5 * math.sin(TAU * t))

    render_frames("svetluska", 12, pose)


# --------------------------------------------------------------------------------------------
# Slunce
# --------------------------------------------------------------------------------------------


def sun():
    scene(cam_loc=(0, -14, 0), look=(0, 0, 0), lens=70)
    gold = mat("#ffcf40", rough=0.22, emit=1.0, emit_color="#ffb52a", coat=0.5)
    ray_m = mat("#ffd24d", rough=0.3, emit=2.0, emit_color="#ffb020")
    core = sph((0, 0, 0), 1.35, gold)
    rays = pivot((0, 0, 0))
    for k in range(14):
        a = k * TAU / 14
        d = Vector((math.cos(a), 0, math.sin(a)))
        c = cone(d * 2.0, 0.3, 0.02, 0.95 if k % 2 else 0.7, ray_m, direction=d, verts=20)
        attach(c, rays)
    cheeks = []
    for sx in (-1, 1):
        cheeks.append(sph((sx * 0.8, -1.05, -0.2), 0.2, mat("#ff9a6b", rough=0.6, emit=0.4), (1, 0.4, 0.7)))
    brow = []
    for sx in (-1, 1):
        brow.append(sph((sx * 0.45, -1.28, 0.55), 0.04, mat("#7a3b10", rough=0.5), (4, 0.6, 0.8), rot=(0, sx * 12, 0)))
    smile = []
    for k in range(9):
        a = math.radians(205 + k * 16)
        smile.append(sph((math.cos(a) * 0.55, -1.3, -0.15 + math.sin(a) * 0.4), 0.06, mat("#7a3b10", rough=0.4)))
    eyes = [eye(Vector((sx * 0.45, -1.25, 0.25)), 0.14) for sx in (-1, 1)]
    _ = (core, cheeks, brow, smile)

    def pose(t, i):
        rays.rotation_euler = (0, TAU * t / 7, 0)
        blink = 0.0 if i not in (13, 14) else 0.85
        for e, h in eyes:
            e.scale.z = max(0.1, 1 - blink)
            h.scale.z = max(0.1, 1 - blink)
        core.scale = (1 + 0.02 * math.sin(TAU * t), 1, 1 + 0.02 * math.sin(TAU * t))

    render_frames("slunce", 16, pose)


# --------------------------------------------------------------------------------------------
# Měsíc se spícím obličejem
# --------------------------------------------------------------------------------------------


def moon():
    scene(cam_loc=(0, -12, 0), look=(0, 0, 0), lens=70)
    m = mat("#ece6bd", rough=0.6, emit=0.12, emit_color="#fff4c8", subsurface_Weight=0.2)
    sph((0, 0, 0), 1.6, m, seg=96)
    rnd = random.Random(2)
    crat = mat("#cfc9a0", rough=0.9)

    def on(x, z, off=0.0):
        """Bod na přední straně koule o poloměru 1.6 nad souřadnicemi (x, z)."""
        return (x, -math.sqrt(1.6**2 - x * x - z * z) + off, z)

    for _ in range(9):
        x, z = rnd.uniform(-1.1, 1.1), rnd.uniform(-1.1, 1.1)
        if x * x + z * z < 1.5 and abs(x) < 0.9 and -0.65 < z < 0.6:
            continue  # místo na obličej
        sph(on(x, z, 0.02), rnd.uniform(0.12, 0.26), crat, (1, 0.25, 1))
    dark = mat("#3a2a55", rough=0.4)
    for sx in (-1, 1):
        sph(on(sx * 0.5, 0.25, 0.01), 0.07, dark, (2.6, 0.5, 0.6), rot=(0, sx * -10, 0))  # zavřená oka
        sph(on(sx * 0.85, -0.2, 0.0), 0.12, mat("#ff9a6b", rough=0.6), (1.4, 0.4, 0.8))
    sph(on(0, -0.2, 0.0), 0.06, dark, (2.4, 0.5, 0.8))  # pusa
    stars = []
    for k in range(7):
        ang = rnd.uniform(0, TAU)
        r = rnd.uniform(2.1, 2.9)
        stars.append((sph((math.cos(ang) * r, 0, math.sin(ang) * r), 0.07, mat("#fff6c8", emit=6.0)), rnd.uniform(0, TAU)))
    zs = []
    for k in range(2):
        bpy.ops.object.text_add(location=(1.6, -1.6, 1.2), rotation=(math.pi / 2, 0, 0))
        z = bpy.context.active_object
        z.data.body = "z"
        z.data.size = 0.55
        z.data.extrude = 0.05
        z.data.materials.append(mat("#fff6c8", emit=3.0))
        zs.append((z, k * 0.5))

    def pose(t, i):
        for s, ph in stars:
            k = 1 + 0.9 * math.sin(TAU * t + ph)
            s.scale = (k, k, k)
        for z, off in zs:
            u = (t + off) % 1
            z.location = (1.3 + 0.4 * u, -1.7, 1.1 + 1.0 * u)
            sc = 0.5 + 0.7 * u
            z.scale = (sc, sc, sc) if u < 0.85 else (0.001, 0.001, 0.001)

    render_frames("mesic", 12, pose)


# --------------------------------------------------------------------------------------------
# List (padá a převrací se)
# --------------------------------------------------------------------------------------------


def leaf():
    scene(cam_loc=(0, -7, 0), look=(0, 0, 0), lens=60)
    lm = F.leaf_material()
    o = F.make_leaf(2.2, 0.62, lm, curl=0.3)
    o.location = (0, 0, -1.1)
    p = pivot((0, 0, 0))
    o.parent = p
    o.location = (0, 0, -1.1)

    def pose(t, i):
        p.rotation_euler = (math.radians(38 * math.sin(TAU * t)), math.radians(25 * math.sin(TAU * t * 2)), TAU * t)

    render_frames("list", 16, pose)


# --------------------------------------------------------------------------------------------
# Ježek
# --------------------------------------------------------------------------------------------


def hedgehog():
    scene(cam_loc=(0, -8.0, 1.6), look=(0, 0, 0.8))
    fur = mat("#6b4a2c", rough=0.9)
    belly = mat("#f1dcb8", rough=0.8, subsurface_Weight=0.3)
    spine_a = mat("#3a2a1c", rough=0.6)
    spine_b = mat("#b08a55", rough=0.6)
    body = pivot((0, 0.1, 0.75))
    sph((0, 0.1, 0.75), 1.0, fur, (1.25, 1.0, 0.95))
    rnd = random.Random(4)
    spines = []
    for k in range(520):
        u = rnd.uniform(0, TAU)
        v = rnd.uniform(0.05, 0.97)
        nx, ny, nz = math.cos(u) * math.sqrt(1 - v * v), math.sin(u) * math.sqrt(1 - v * v) * 0.9 + 0.3, v
        if ny < -0.1 and nz < 0.6:
            continue
        base = Vector((nx * 1.25, 0.1 + ny, 0.75 + nz * 0.95))
        d = Vector((nx, ny * 0.9, nz)).normalized()
        c = cone(base + d * 0.12, 0.05, 0.004, 0.5, spine_a if k % 3 else spine_b, direction=d, verts=8)
        attach(c, body)
        spines.append((c, rnd.uniform(0, TAU)))
    head = pivot((0.0, -0.95, 0.62))
    sph((0, -0.95, 0.62), 0.55, belly, (1.0, 1.0, 0.9))
    snout = cone((0.0, -1.55, 0.58), 0.38, 0.06, 0.8, belly, direction=(0, -1, 0), verts=32)
    nose = sph((0.0, -1.95, 0.6), 0.12, mat("#16132b", rough=0.15, coat=1.0))
    parts = [snout, nose]
    for p_ in parts:
        pass
    for sx in (-1, 1):
        e = eye(Vector((sx * 0.28, -1.28, 0.8)), 0.1)
        parts += list(e)
        ear = sph((sx * 0.42, -0.9, 1.05), 0.2, fur, (1, 0.5, 1))
        parts.append(ear)
    for o2 in [head]:
        pass
    # tělo a hlava jako dvě části: hlava se při čichání pohybuje
    head_children = [o for o in bpy.context.collection.objects if o.type == "MESH" and o.location.y < -0.9 and o.parent is None]
    for o2 in head_children:
        attach(o2, head)
    sph((0.35, -0.55, 0.55), 0.85, belly, (0.95, 0.8, 0.8))
    legs = []
    for sx in (-1, 1):
        for y in (-0.55, 0.6):
            lp = pivot((sx * 0.6, y, 0.4))
            leg = sph((sx * 0.6, y, 0.14), 0.26, belly, (1, 1.3, 0.6))
            attach(leg, lp)
            legs.append((lp, 0 if (sx > 0) == (y > 0) else 1))

    def pose(t, i):
        s = math.sin(TAU * t)
        head.rotation_euler = (math.radians(6 * math.sin(TAU * t * 2)), 0, math.radians(4 * s))
        head.location = (0, -0.95 + 0.06 * (0.5 + 0.5 * math.sin(TAU * t * 2)), 0.62 + 0.02 * s)
        body.scale = (1 + 0.012 * math.sin(TAU * t), 1, 1 + 0.018 * math.sin(TAU * t))
        for lp, grp in legs:
            lp.rotation_euler = (math.radians(14 * (s if grp == 0 else -s)), 0, 0)
        for c, ph in spines[::6]:
            c.scale = (1, 1, 1 + 0.06 * math.sin(TAU * t + ph))

    render_frames("jezek", 16, pose)


# --------------------------------------------------------------------------------------------
# Veverka
# --------------------------------------------------------------------------------------------


def squirrel():
    scene(cam_loc=(0, -9.0, 1.8), look=(0, 0, 1.2))
    fur = mat("#b8531f", rough=0.85, subsurface_Weight=0.2)
    fur2 = mat("#d9792e", rough=0.85)
    belly = mat("#f6e2c4", rough=0.8)
    dark = mat("#16132b", rough=0.2, coat=1.0)
    b1 = sph((0, 0.1, 0.9), 0.85, fur, (0.85, 0.85, 1.15))
    hair(b1, 1800, 0.18, "#c25a22", children=4)
    sph((0, -0.45, 0.8), 0.6, belly, (0.8, 0.45, 1.0))
    head = pivot((0, -0.15, 2.0))
    h = sph((0, -0.15, 2.0), 0.62, fur, (1, 1, 0.95))
    hair(h, 900, 0.1, "#c25a22", children=4)
    snout = sph((0, -0.55, 1.8), 0.32, belly, (1, 0.7, 0.7))
    nose = sph((0, -0.82, 1.92), 0.09, dark)
    eyes = [eye(Vector((sx * 0.27, -0.6, 2.12)), 0.1) for sx in (-1, 1)]
    ears = []
    for sx in (-1, 1):
        c = cone((sx * 0.36, -0.05, 2.7), 0.2, 0.02, 0.55, fur, verts=24)
        c.rotation_euler = (math.radians(-8), math.radians(sx * 12), 0)
        tuft = cyl((sx * 0.38, -0.08, 3.0), 0.025, 0.3, mat("#7a2f10", rough=0.8), direction=(sx * 0.3, 0, 1))
        inner = sph((sx * 0.38, -0.12, 2.62), 0.07, belly, (1, 0.4, 1.4))
        ears += [c, tuft, inner]
    for o in [h, snout, nose] + [x for e in eyes for x in e] + ears:
        attach(o, head)
    for sx in (-1, 1):
        sph((sx * 0.5, -0.4, 0.15), 0.3, fur2, (1, 1.5, 0.5))
    # ocas: řetěz koulí s hustou srstí, švihá
    tail = pivot((0, 0.6, 0.6))
    tail_parts = []
    for k in range(9):
        tt = k / 8
        x = math.sin(tt * 2.4) * 0.35
        y = 0.7 + tt * 0.55
        z = 0.5 + tt * 2.1
        s_ = sph((x, y, z), 0.3 + 0.22 * math.sin(tt * math.pi) + 0.1 * tt, fur if k % 2 else fur2, (1.1, 0.9, 1.2))
        hair(s_, 500, 0.22, "#d9792e" if k % 2 else "#b8531f", children=3)
        attach(s_, tail)
        tail_parts.append(s_)
    paws = []
    ac = sph((0.0, -0.78, 1.05), 0.2, mat("#c08a3e", rough=0.4, coat=0.6), (1, 1, 1.2))
    cap = sph((0.0, -0.78, 1.25), 0.2, mat("#6b4a2a", rough=0.7), (1.05, 1.05, 0.55))
    hand = pivot((0, -0.75, 1.1))
    for o in (ac, cap):
        attach(o, hand)
    for sx in (-1, 1):
        p_ = sph((sx * 0.18, -0.75, 1.1), 0.14, fur2)
        attach(p_, hand)
        paws.append(p_)

    def pose(t, i):
        s = math.sin(TAU * t)
        tail.rotation_euler = (0, math.radians(7 * s), math.radians(11 * math.sin(TAU * t + 0.6)))
        nib = max(0.0, math.sin(TAU * t * 2))
        head.rotation_euler = (math.radians(9 * nib), math.radians(3 * s), 0)
        hand.location = (0, -0.75, 1.1 + 0.05 * nib)
        blink = 0.9 if i in (11, 12) else 0.0
        for e, hl in eyes:
            e.scale.z = max(0.1, 1 - blink)
            hl.scale.z = max(0.1, 1 - blink)

    render_frames("veverka", 16, pose)


ITEMS = dict(motyl=butterfly, beruska=ladybug, svetluska=firefly, slunce=sun, mesic=moon, list=leaf, jezek=hedgehog, veverka=squirrel)

if __name__ == "__main__":
    for k, fn in ITEMS.items():
        if ONLY and k not in ONLY:
            continue
        fn()
