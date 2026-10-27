"""Sopka v sekci „Jak to funguje“: detailní kužel s lávovými řekami, kráter s lávovou fontánou,
exploze s rázovou vlnou, létající lávové pumy, žhavé jiskry a stoupající oblak popela.

Smyčka je plynulá: všechno se počítá z fáze t (0..1) periodickými funkcemi, žádná simulace.
Spuštění: python umime-art/blender/sopka.py [--preview]   (potřebuje bpy, viz BLENDER_ANIM.md)
"""
import math
import random
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import bmesh
from mathutils import Vector, noise

PREVIEW = "--preview" in args()
FRAMES = 84
W, H = (480, 540) if PREVIEW else (600, 675)
sc = reset(W, H, FRAMES, fps=18, samples=24 if PREVIEW else 36, name="sopka", world=("#6a58b8", 0.42), view="AgX", look="AgX - Punchy")
sc.cycles.max_bounces = 3
sc.cycles.transparent_max_bounces = 12
rnd = random.Random(7)

HC = 5.8          # výška okraje kráteru
R0 = 6.2          # poloměr paty
RC = 1.1         # poloměr okraje kráteru
FLOOR = HC - 0.9  # hladina lávy v kráteru
TAU = math.tau


def smooth(a, b, x):
    x = min(1, max(0, (x - a) / (b - a)))
    return x * x * (3 - 2 * x)


def cyc(t, t0):
    """Vzdálenost fáze od t0 na kružnici 0..1 (kvůli plynulé smyčce)."""
    d = abs(t - t0) % 1.0
    return min(d, 1 - d)


def erupt(t):
    """Intenzita erupce: hlavní výbuch kolem t = 0.04, doznívání, slabší druhý výron kolem 0.55."""
    return min(1.0, math.exp(-(cyc(t, 0.04) / 0.07) ** 2) + 0.55 * math.exp(-(cyc(t, 0.55) / 0.06) ** 2) + 0.18)


def curve(t):
    """Vyhlazená verze pro záři (doznívá pomaleji než výbuch)."""
    return 0.25 + 0.75 * (math.exp(-(cyc(t, 0.1) / 0.2) ** 2) * 0.9 + 0.55 * math.exp(-(cyc(t, 0.58) / 0.14) ** 2))


# ───────────────────────── Kužel ─────────────────────────
def profile(u):
    """u = 0 u kráteru … 1 u paty → výška na svahu."""
    return HC * (1 - u) ** 1.45 - 0.9 * u ** 10


ROWS, SEG = 96, 160
bm = bmesh.new()
grid = []
# vnější svah od paty ke kráteru, pak dovnitř kráteru dolů k lávě
pts = []
for i in range(ROWS + 1):
    u = 1 - i / ROWS
    pts.append((RC + (R0 - RC) * u, profile(u), u))
for k in range(1, 9):  # stěna kráteru
    f = k / 8
    pts.append((RC - 0.5 * f, HC - (HC - FLOOR) * math.sin(f * math.pi / 2) ** 0.8, 0.0))
for r, z, u in pts:
    ring = []
    for j in range(SEG):
        a = j / SEG * TAU
        ca, sa = math.cos(a), math.sin(a)
        n1 = noise.noise(Vector((ca * 1.7 + 3, sa * 1.7, z * 0.55)))
        n2 = noise.noise(Vector((ca * 4.0, sa * 4.0 + 9, z * 1.4)))
        gully = math.sin(a * 13 + n1 * 5.0) * 0.5 + 0.5
        slope = smooth(0.05, 0.5, u) * (1 - smooth(0.9, 1.0, u))
        dr = (n1 * 0.55 + n2 * 0.16) * slope + (gully - 0.5) * 0.28 * slope
        rr = max(0.2, r + dr)
        dz = n2 * 0.1 * slope - gully * 0.05 * slope
        # rozeklaný okraj kráteru
        if u < 0.04:
            dz += noise.noise(Vector((ca * 5, sa * 5, 2))) * 0.14
        ring.append(bm.verts.new((ca * rr, sa * rr, z + dz)))
    grid.append(ring)
for i in range(len(grid) - 1):
    for j in range(SEG):
        bm.faces.new((grid[i][j], grid[i][(j + 1) % SEG], grid[i + 1][(j + 1) % SEG], grid[i + 1][j]))
mesh = bpy.data.meshes.new("kuzel")
bm.to_mesh(mesh)
bm.free()
cone = bpy.data.objects.new("kuzel", mesh)
bpy.context.scene.collection.objects.link(cone)
for p in mesh.polygons:
    p.use_smooth = True


def nodes(m):
    m.use_nodes = True
    m.node_tree.nodes.clear()
    return m.node_tree


# materiál: čedič s popelem nahoře + žhavé praskliny, kterými po svahu putuje puls lávy
rock = bpy.data.materials.new("cedic")
nt = nodes(rock)
out = nt.nodes.new("ShaderNodeOutputMaterial")
bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
bs.inputs["Roughness"].default_value = 0.9
tc = nt.nodes.new("ShaderNodeTexCoord")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(tc.outputs["Object"], sep.inputs[0])
# barva horniny
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 3.2; nz.inputs["Detail"].default_value = 9; nz.inputs["Roughness"].default_value = 0.62
nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
rr = nt.nodes.new("ShaderNodeValToRGB")
rr.color_ramp.elements[0].position = 0.35; rr.color_ramp.elements[0].color = hex_rgba("#1d1430")
rr.color_ramp.elements[1].position = 0.7; rr.color_ramp.elements[1].color = hex_rgba("#5b4268")
mid = rr.color_ramp.elements.new(0.52); mid.color = hex_rgba("#34264a")
nt.links.new(nz.outputs["Fac"], rr.inputs[0])
# světlejší popel u kráteru a tmavší zem na patě
zr = nt.nodes.new("ShaderNodeMapRange"); zr.inputs["From Min"].default_value = 2.2; zr.inputs["From Max"].default_value = HC
nt.links.new(sep.outputs["Z"], zr.inputs["Value"])
ash = nt.nodes.new("ShaderNodeMix"); ash.data_type = "RGBA"
ash.inputs[7].default_value = hex_rgba("#8a7aa8")
nt.links.new(zr.outputs["Result"], ash.inputs[0]); nt.links.new(rr.outputs[0], ash.inputs[6])
nt.links.new(ash.outputs[2], bs.inputs["Base Color"])
bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.8; bump.inputs["Distance"].default_value = 0.08
nz2 = nt.nodes.new("ShaderNodeTexNoise"); nz2.inputs["Scale"].default_value = 14.0; nz2.inputs["Detail"].default_value = 10
nt.links.new(tc.outputs["Object"], nz2.inputs["Vector"]); nt.links.new(nz2.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
# praskliny: Voronoi vzdálenost k hraně v souřadnicích (úhel, výška natažená), jen vybrané buňky
ang = nt.nodes.new("ShaderNodeMath"); ang.operation = "ARCTAN2"
nt.links.new(sep.outputs["Y"], ang.inputs[0]); nt.links.new(sep.outputs["X"], ang.inputs[1])
vc = nt.nodes.new("ShaderNodeCombineXYZ")
am = nt.nodes.new("ShaderNodeMath"); am.operation = "MULTIPLY"; am.inputs[1].default_value = 2.1
nt.links.new(ang.outputs[0], am.inputs[0])
rad = nt.nodes.new("ShaderNodeVectorMath"); rad.operation = "LENGTH"
xy = nt.nodes.new("ShaderNodeCombineXYZ")
nt.links.new(sep.outputs["X"], xy.inputs["X"]); nt.links.new(sep.outputs["Y"], xy.inputs["Y"])
nt.links.new(xy.outputs[0], rad.inputs[0])
zm = nt.nodes.new("ShaderNodeMath"); zm.operation = "MULTIPLY"; zm.inputs[1].default_value = 0.2
nt.links.new(rad.outputs["Value"], zm.inputs[0])
nt.links.new(am.outputs[0], vc.inputs["X"]); nt.links.new(zm.outputs[0], vc.inputs["Z"])
# jemné křivení praskliny šumem
wz = nt.nodes.new("ShaderNodeTexNoise"); wz.inputs["Scale"].default_value = 2.5; wz.inputs["Detail"].default_value = 3
nt.links.new(tc.outputs["Object"], wz.inputs["Vector"])
wm = nt.nodes.new("ShaderNodeMath"); wm.operation = "MULTIPLY_ADD"; wm.inputs[1].default_value = 0.9;
nt.links.new(wz.outputs["Fac"], wm.inputs[0]); nt.links.new(wm.outputs[0], vc.inputs["Y"])
vo = nt.nodes.new("ShaderNodeTexVoronoi"); vo.feature = "DISTANCE_TO_EDGE"; vo.inputs["Scale"].default_value = 1.0
nt.links.new(vc.outputs[0], vo.inputs["Vector"])
vo2 = nt.nodes.new("ShaderNodeTexVoronoi"); vo2.inputs["Scale"].default_value = 1.0
nt.links.new(vc.outputs[0], vo2.inputs["Vector"])
vcell = nt.nodes.new("ShaderNodeTexNoise"); vcell.inputs["Scale"].default_value = 1.4
nt.links.new(vo2.outputs["Position"], vcell.inputs["Vector"])
pick = nt.nodes.new("ShaderNodeMapRange"); pick.inputs["From Min"].default_value = 0.5; pick.inputs["From Max"].default_value = 0.58
nt.links.new(vcell.outputs["Fac"], pick.inputs["Value"])
# šířka praskliny se k patě zužuje, nahoře je široká
wid = nt.nodes.new("ShaderNodeMapRange"); wid.inputs["From Min"].default_value = 0.0; wid.inputs["From Max"].default_value = HC
wid.inputs["To Min"].default_value = 0.03; wid.inputs["To Max"].default_value = 0.1
nt.links.new(sep.outputs["Z"], wid.inputs["Value"])
cr = nt.nodes.new("ShaderNodeMath"); cr.operation = "LESS_THAN"
nt.links.new(vo.outputs["Distance"], cr.inputs[0]); nt.links.new(wid.outputs["Result"], cr.inputs[1])
crm = nt.nodes.new("ShaderNodeMath"); crm.operation = "MULTIPLY"
nt.links.new(cr.outputs[0], crm.inputs[0]); nt.links.new(pick.outputs["Result"], crm.inputs[1])
# nad prasklinami se nesmí svítit až u paty a pod kráterem
zmask = nt.nodes.new("ShaderNodeMapRange"); zmask.inputs["From Min"].default_value = 1.0; zmask.inputs["From Max"].default_value = 2.8
nt.links.new(sep.outputs["Z"], zmask.inputs["Value"])
crm2 = nt.nodes.new("ShaderNodeMath"); crm2.operation = "MULTIPLY"
nt.links.new(crm.outputs[0], crm2.inputs[0]); nt.links.new(zmask.outputs["Result"], crm2.inputs[1])
# puls po svahu dolů
zk = nt.nodes.new("ShaderNodeMath"); zk.operation = "MULTIPLY"; zk.inputs[1].default_value = 0.75
nt.links.new(sep.outputs["Z"], zk.inputs[0])
tnode = nt.nodes.new("ShaderNodeValue"); tnode.outputs[0].default_value = 0.0
ph = nt.nodes.new("ShaderNodeMath"); ph.operation = "ADD"
nt.links.new(zk.outputs[0], ph.inputs[0]); nt.links.new(tnode.outputs[0], ph.inputs[1])
tw = nt.nodes.new("ShaderNodeMath"); tw.operation = "MULTIPLY"; tw.inputs[1].default_value = TAU
nt.links.new(ph.outputs[0], tw.inputs[0])
sn = nt.nodes.new("ShaderNodeMath"); sn.operation = "SINE"
nt.links.new(tw.outputs[0], sn.inputs[0])
pu = nt.nodes.new("ShaderNodeMath"); pu.operation = "MULTIPLY_ADD"; pu.inputs[1].default_value = 0.35; pu.inputs[2].default_value = 0.65
nt.links.new(sn.outputs[0], pu.inputs[0])
# barva lávy podle pulsu
lr = nt.nodes.new("ShaderNodeValToRGB")
lr.color_ramp.elements[0].position = 0.25; lr.color_ramp.elements[0].color = hex_rgba("#c01c06")
lr.color_ramp.elements[1].position = 1.0; lr.color_ramp.elements[1].color = hex_rgba("#ff9a22")
lm = nt.nodes.new("ShaderNodeMath"); lm.operation = "MULTIPLY"
nt.links.new(pu.outputs[0], lr.inputs[0])
estr = nt.nodes.new("ShaderNodeValue"); estr.outputs[0].default_value = 6.0
em = nt.nodes.new("ShaderNodeMath"); em.operation = "MULTIPLY"
nt.links.new(crm2.outputs[0], em.inputs[0]); nt.links.new(estr.outputs[0], em.inputs[1])
nt.links.new(lr.outputs[0], bs.inputs["Emission Color"])
nt.links.new(em.outputs[0], bs.inputs["Emission Strength"])
nt.links.new(bs.outputs[0], out.inputs[0])
cone.data.materials.append(rock)
ESTR = estr.outputs[0]
TNODE = tnode.outputs[0]

# ───────────────────────── Kráter: láva a fontána ─────────────────────────
def glow_mat(name, color):
    """Zářivý materiál s průhledností řízenou hodnotou fac (0 = neviditelný, 1 = plná záře)."""
    m = bpy.data.materials.new(name)
    t = nodes(m)
    o = t.nodes.new("ShaderNodeOutputMaterial")
    e = t.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = hex_rgba(color)
    e.inputs["Strength"].default_value = 5.0
    tr = t.nodes.new("ShaderNodeBsdfTransparent")
    mx = t.nodes.new("ShaderNodeMixShader")
    t.links.new(tr.outputs[0], mx.inputs[1]); t.links.new(e.outputs[0], mx.inputs[2]); t.links.new(mx.outputs[0], o.inputs[0])
    return m, mx.inputs[0], e.inputs["Color"], e.inputs["Strength"]


# lávové jezero
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=0.62, fill_type="NGON", location=(0, 0, FLOOR + 0.04))
lake = bpy.context.object
lm_, lfac, lcol, lstr = glow_mat("jezero", "#ff7a1c")
lfac.default_value = 1.0
lake.data.materials.append(lm_)
# kůra a bubliny na jezeře
nlk = lm_.node_tree
ntx = nlk.nodes.new("ShaderNodeTexNoise"); ntx.inputs["Scale"].default_value = 5.0; ntx.inputs["Detail"].default_value = 4
tcl = nlk.nodes.new("ShaderNodeTexCoord")
nlk.links.new(tcl.outputs["Object"], ntx.inputs["Vector"])
rampl = nlk.nodes.new("ShaderNodeValToRGB")
rampl.color_ramp.elements[0].color = hex_rgba("#ff3a0a"); rampl.color_ramp.elements[1].color = hex_rgba("#ffe27a")
nlk.links.new(ntx.outputs["Fac"], rampl.inputs[0])
for n in nlk.nodes:
    if n.bl_idname == "ShaderNodeEmission":
        nlk.links.new(rampl.outputs[0], n.inputs["Color"])

# fontána: svislé protažené těleso, které při výbuchu vystřelí
jet_m, jet_fac, _, jet_str = glow_mat("fontana", "#ffb23a")
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=1, location=(0, 0, FLOOR))
jet = bpy.context.object
jet.data.materials.append(jet_m)
for p in jet.data.polygons: p.use_smooth = True
core_m, core_fac, _, core_str = glow_mat("jadro", "#fff2b0")
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=1, location=(0, 0, FLOOR))
core = bpy.context.object
core.data.materials.append(core_m)

# rázová vlna
ring_m, ring_fac, _, ring_str = glow_mat("vlna", "#ffd9a0")
bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.05, major_segments=96, minor_segments=8, location=(0, 0, HC + 0.1))
ring = bpy.context.object
ring.data.materials.append(ring_m)

# záblesk výbuchu
ex_m, ex_fac, _, ex_str = glow_mat("zablesk", "#ffc47a")
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=1, location=(0, 0, HC + 0.2))
flash = bpy.context.object
flash.data.materials.append(ex_m)

# světlo z kráteru
ld = bpy.data.lights.new("kraterlight", "POINT")
ld.color = hex_rgba("#ff7a2a")[:3]
ld.shadow_soft_size = 1.2
lo = bpy.data.objects.new("kraterlight", ld)
bpy.context.scene.collection.objects.link(lo)
lo.location = (0, -0.6, HC + 1.4)

# ───────────────────────── Lávové pumy ─────────────────────────
class Bomb:
    pass


bombs = []
bm_mesh = None
for i in range(56):
    b = Bomb()
    u = rnd.random()
    b.t0 = 0.0 + 0.55 * u ** 1.7
    b.phi = rnd.uniform(0, TAU)
    b.vh = rnd.uniform(0.9, 3.6) * (0.6 + 0.8 * rnd.random())
    b.vz = rnd.uniform(6.5, 12.5)
    b.T = rnd.uniform(0.3, 0.5)
    b.g = 2 * b.vz / b.T
    b.size = rnd.uniform(0.1, 0.3)
    m, fac, col, st = glow_mat(f"puma{i}", "#ffcc44")
    b.fac, b.col, b.st = fac, col, st
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=(0, 0, 0))
    o = bpy.context.object
    o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    b.obj = o
    bombs.append(b)

# žhavé jiskry unášené vzhůru
sparks = []
for i in range(40):
    s = Bomb()
    s.t0 = rnd.random()
    s.phi = rnd.uniform(0, TAU)
    s.r = rnd.uniform(0.0, 1.4)
    s.rise = rnd.uniform(5.5, 9.0)
    s.drift = rnd.uniform(-1.8, 1.8)
    s.size = rnd.uniform(0.03, 0.07)
    m, fac, col, st = glow_mat(f"jiskra{i}", "#ffb040")
    s.fac = fac
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=(0, 0, 0))
    o = bpy.context.object
    o.data.materials.append(m)
    s.obj = o
    sparks.append(s)

# ───────────────────────── Oblak popela ─────────────────────────
puff_mesh = bpy.data.meshes.new("puff")
pb = bmesh.new()
bmesh.ops.create_icosphere(pb, subdivisions=4, radius=1.0)
for v in pb.verts:
    n = noise.noise(v.co * 1.6 + Vector((5, 5, 5)))
    v.co *= 1.0 + 0.32 * n + 0.1 * noise.noise(v.co * 4.0)
pb.to_mesh(puff_mesh)
pb.free()
for p in puff_mesh.polygons: p.use_smooth = True

puffs = []
NP = 52
for i in range(NP):
    p = Bomb()
    p.b = i / NP
    p.phi = rnd.uniform(0, TAU)
    p.spread = rnd.uniform(0.0, 1.0)
    p.size = rnd.uniform(0.75, 1.25)
    p.rot = (rnd.uniform(0, 3), rnd.uniform(0, 3), rnd.uniform(0, 3))
    m = bpy.data.materials.new(f"dym{i}")
    t = nodes(m)
    o_ = t.nodes.new("ShaderNodeOutputMaterial")
    bsd = t.nodes.new("ShaderNodeBsdfPrincipled")
    bsd.inputs["Base Color"].default_value = hex_rgba("#6c5a8c")
    bsd.inputs["Roughness"].default_value = 1.0
    bsd.inputs["Emission Color"].default_value = hex_rgba("#ff6a1f")
    bsd.inputs["Emission Strength"].default_value = 0.0
    t.links.new(bsd.outputs[0], o_.inputs[0])
    p.bsdf = bsd
    ob = bpy.data.objects.new(f"dym{i}", puff_mesh)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(m) if len(ob.data.materials) == 0 else None
    # každý obláček má vlastní materiál přes slot na objektu
    ob.material_slots[0].link = "OBJECT"
    ob.material_slots[0].material = m
    p.obj = ob
    puffs.append(p)

# ───────────────────────── Prostředí: světlo a zem ─────────────────────────
add_sun((math.radians(62), math.radians(10), math.radians(-120)), energy=3.2, color="#ffb27a", angle=0.12)  # zapadající slunce zprava
add_area((-9, -9, 8), (0, 0, 4), energy=700, size=9, color="#9a8cff")  # chladné světlo oblohy zleva
add_camera((0, -34, 9.0), target=(0, 0, 7.9), lens=68)

# ───────────────────────── Animace ─────────────────────────
def update(t):
    TNODE.default_value = t
    e = erupt(t)
    c = curve(t)
    ESTR.default_value = 2.6 + 5.5 * c

    # lávové jezero a fontána
    lstr.default_value = 4 + 6 * c
    lake.scale = (1 + 0.06 * math.sin(t * TAU * 4), 1 + 0.06 * math.cos(t * TAU * 3), 1)
    jh = 0.12 + 3.4 * e ** 1.3
    jet.scale = (0.22 + 0.5 * e + 0.05 * math.sin(t * TAU * 9), 0.22 + 0.5 * e + 0.05 * math.cos(t * TAU * 8), jh)
    jet.location = (0, 0, FLOOR + jh * 0.6)
    jet_fac.default_value = min(1.0, 0.15 + 1.1 * e)
    jet_str.default_value = 6 + 6 * e
    core.scale = (0.1 + 0.28 * e, 0.1 + 0.28 * e, 0.25 + 1.9 * e ** 1.3)
    core.location = (0, 0, FLOOR + core.scale[2] * 0.7)
    core_fac.default_value = min(1.0, 0.1 + e)
    core_str.default_value = 10 + 12 * e

    # rázová vlna: roste od výbuchu a mizí
    d = cyc(t, 0.04) if (t - 0.04) % 1.0 < 0.5 else 1.0
    age = ((t - 0.035) % 1.0)
    w_alive = age < 0.2
    r = 0.8 + age * 30
    ring.scale = (r, r, 1) if w_alive else (0.001, 0.001, 0.001)
    ring_fac.default_value = max(0.0, 1 - age / 0.2) if w_alive else 0.0
    ring_str.default_value = 2.5
    ring.location.z = HC + 0.1 + age * 6
    # záblesk
    fa = ((t - 0.03) % 1.0)
    fl = max(0.0, 1 - fa / 0.07) if fa < 0.07 else 0.0
    flash.scale = (0.7 + 1.6 * fa * 8, 0.7 + 1.6 * fa * 8, 0.6 + 1.4 * fa * 8) if fl > 0 else (0.001,) * 3
    ex_fac.default_value = fl * 0.7
    ex_str.default_value = 4
    ld.energy = 900 + 14000 * e ** 1.2 + 4000 * c

    # lávové pumy
    for b in bombs:
        age = (t - b.t0) % 1.0
        tau = age
        alive = tau < b.T and True
        if alive:
            x = math.cos(b.phi) * b.vh * tau * 2.2
            y = math.sin(b.phi) * b.vh * tau * 2.2
            z = FLOOR + 0.5 + b.vz * tau - 0.5 * b.g * tau * tau
            rho = math.hypot(x, y)
            surf = -1.0
            if RC < rho < R0:
                u = (rho - RC) / (R0 - RC)
                surf = profile(u)
            elif rho <= RC:
                surf = FLOOR - 1
            if tau > 0.1 and z < surf + 0.05:
                alive = False
        if alive:
            b.obj.location = (x, y, z)
            heat = 1 - tau / b.T
            b.obj.scale = (b.size,) * 3 if tau > 0.0 else (0.001,) * 3
            b.fac.default_value = 1.0
            b.col.default_value = (1.0, 0.12 + 0.42 * heat, 0.02 + 0.06 * heat, 1.0)
            b.st.default_value = 2 + 6 * heat
        else:
            b.obj.scale = (0.0001,) * 3
            b.fac.default_value = 0.0
    # jiskry
    for s in sparks:
        age = (t - s.t0) % 1.0
        s.obj.location = (
            math.cos(s.phi) * (s.r + age * s.drift * 0.6),
            math.sin(s.phi) * (s.r + age * s.drift * 0.6),
            HC + 0.5 + age * s.rise,
        )
        fade = math.sin(age * math.pi)
        s.obj.scale = (s.size * (0.4 + fade),) * 3
        s.fac.default_value = fade * (0.35 + 0.65 * e)

    # popel: obláčky vznikají v kráteru, stoupají, rostou a postupně mizí
    L = 0.85
    for p in puffs:
        age = (t - p.b) % 1.0
        a = age / L
        if a >= 1.0:
            p.obj.scale = (0.0001,) * 3
            continue
        burst = 0.55 + 1.0 * erupt(p.b) ** 1.2
        h = HC + 0.3 + 8.2 * (1 - (1 - a) ** 1.6) * (0.65 + 0.35 * burst)
        wob = 0.4 + 2.2 * a * (0.3 + 0.7 * p.spread) * burst
        px = math.cos(p.phi) * wob + 0.9 * a * 1.8  # vítr nese oblak doprava
        py = math.sin(p.phi) * wob * 0.5
        size = (0.4 + 1.7 * a ** 0.7) * p.size * (0.6 + 0.45 * burst)
        p.obj.location = (px, py, h)
        p.obj.rotation_euler = (p.rot[0] + a, p.rot[1], p.rot[2] + a * 0.5)
        p.obj.scale = (size * 1.1, size, size * 0.9)
        alpha = smooth(0.0, 0.08, a) * (1 - smooth(0.55, 1.0, a))
        p.bsdf.inputs["Alpha"].default_value = alpha * 0.8
        # dole žhne ohněm, nahoře je šedofialový
        glow = max(0.0, 1 - a * 4.0) * (0.5 + 0.9 * e)
        p.bsdf.inputs["Emission Strength"].default_value = 2.2 * glow
        mix = 0.55 + 0.45 * a
        p.bsdf.inputs["Base Color"].default_value = (0.16 + 0.2 * mix, 0.13 + 0.16 * mix, 0.2 + 0.22 * mix, 1)


if PREVIEW:
    render(update, only_frames=[4, 12, 30, 55])
else:
    render(update)
