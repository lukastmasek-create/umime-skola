"""Spirálová galaxie (ikona „Střední škola“): zářící ramena, prachové pruhy, tisíce hvězd a jasné jádro."""
import math
import random
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import bmesh

PREVIEW = "--preview" in args()
RES = 640 if PREVIEW else 1024
sc = reset(RES, RES, 1, samples=40 if PREVIEW else 160, name="sekce_stredni", world=("#000000", 0.0), view="AgX", look="AgX - Punchy")
rnd = random.Random(7)
ARMS, PITCH, R_MAX = 2, 2.6, 2.25


def nodes(mat):
    mat.use_nodes = True
    mat.node_tree.nodes.clear()
    return mat.node_tree


def spiral_field(nt, scale=1.0):
    """Vrací výstupy (r, arm) v souřadnicích disku; arm = 0..1 hustota ramen."""
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], ln.inputs[0])
    at = nt.nodes.new("ShaderNodeMath"); at.operation = "ARCTAN2"
    nt.links.new(sep.outputs["Y"], at.inputs[0]); nt.links.new(sep.outputs["X"], at.inputs[1])
    lg = nt.nodes.new("ShaderNodeMath"); lg.operation = "LOGARITHM"; lg.inputs[1].default_value = math.e
    rmin = nt.nodes.new("ShaderNodeMath"); rmin.operation = "MAXIMUM"; rmin.inputs[1].default_value = 0.02
    nt.links.new(ln.outputs["Value"], rmin.inputs[0]); nt.links.new(rmin.outputs[0], lg.inputs[0])
    kl = nt.nodes.new("ShaderNodeMath"); kl.operation = "MULTIPLY"; kl.inputs[1].default_value = PITCH
    nt.links.new(lg.outputs[0], kl.inputs[0])
    # šum, který ramena zvlní a rozbije
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 3.0; noise.inputs["Detail"].default_value = 8; noise.inputs["Roughness"].default_value = 0.6
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nm = nt.nodes.new("ShaderNodeMath"); nm.operation = "MULTIPLY_ADD"; nm.inputs[1].default_value = 0.9; nm.inputs[2].default_value = -0.45
    nt.links.new(noise.outputs["Fac"], nm.inputs[0])
    ph = nt.nodes.new("ShaderNodeMath"); ph.operation = "SUBTRACT"
    nt.links.new(at.outputs[0], ph.inputs[0]); nt.links.new(kl.outputs[0], ph.inputs[1])
    ph2 = nt.nodes.new("ShaderNodeMath"); ph2.operation = "ADD"
    nt.links.new(ph.outputs[0], ph2.inputs[0]); nt.links.new(nm.outputs[0], ph2.inputs[1])
    mc = nt.nodes.new("ShaderNodeMath"); mc.operation = "MULTIPLY"; mc.inputs[1].default_value = ARMS
    nt.links.new(ph2.outputs[0], mc.inputs[0])
    cs = nt.nodes.new("ShaderNodeMath"); cs.operation = "COSINE"
    nt.links.new(mc.outputs[0], cs.inputs[0])
    arm = nt.nodes.new("ShaderNodeMath"); arm.operation = "MULTIPLY_ADD"; arm.inputs[1].default_value = 0.5; arm.inputs[2].default_value = 0.5
    nt.links.new(cs.outputs[0], arm.inputs[0])
    return ln.outputs["Value"], arm.outputs[0], noise.outputs["Fac"], ph2.outputs[0], tc


# ---------- zářící disk ----------
gm = bpy.data.materials.new("zare"); nt = nodes(gm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
r, arm, noise, phase, tc = spiral_field(nt)
# hustota = exp(-r/0.7) * (0.12 + 1.4 * arm^3)  + jádro
rn = nt.nodes.new("ShaderNodeMath"); rn.operation = "MULTIPLY"; rn.inputs[1].default_value = -1 / 0.75
nt.links.new(r, rn.inputs[0])
ex = nt.nodes.new("ShaderNodeMath"); ex.operation = "EXPONENT"; nt.links.new(rn.outputs[0], ex.inputs[0])
a3 = nt.nodes.new("ShaderNodeMath"); a3.operation = "POWER"; a3.inputs[1].default_value = 2.6; nt.links.new(arm, a3.inputs[0])
a3b = nt.nodes.new("ShaderNodeMath"); a3b.operation = "MULTIPLY_ADD"; a3b.inputs[1].default_value = 1.5; a3b.inputs[2].default_value = 0.1
nt.links.new(a3.outputs[0], a3b.inputs[0])
nz = nt.nodes.new("ShaderNodeMath"); nz.operation = "MULTIPLY_ADD"; nz.inputs[1].default_value = 1.1; nz.inputs[2].default_value = 0.45
nt.links.new(noise, nz.inputs[0])
d1 = nt.nodes.new("ShaderNodeMath"); d1.operation = "MULTIPLY"
nt.links.new(a3b.outputs[0], d1.inputs[0]); nt.links.new(nz.outputs[0], d1.inputs[1])
d2 = nt.nodes.new("ShaderNodeMath"); d2.operation = "MULTIPLY"; nt.links.new(d1.outputs[0], d2.inputs[0]); nt.links.new(ex.outputs[0], d2.inputs[1])
# jádro
cr = nt.nodes.new("ShaderNodeMath"); cr.operation = "MULTIPLY"; cr.inputs[1].default_value = 1 / 0.2; nt.links.new(r, cr.inputs[0])
cr2 = nt.nodes.new("ShaderNodeMath"); cr2.operation = "POWER"; cr2.inputs[1].default_value = 2.0; nt.links.new(cr.outputs[0], cr2.inputs[0])
cr3 = nt.nodes.new("ShaderNodeMath"); cr3.operation = "MULTIPLY"; cr3.inputs[1].default_value = -1.0; nt.links.new(cr2.outputs[0], cr3.inputs[0])
core = nt.nodes.new("ShaderNodeMath"); core.operation = "EXPONENT"; nt.links.new(cr3.outputs[0], core.inputs[0])
core2 = nt.nodes.new("ShaderNodeMath"); core2.operation = "MULTIPLY"; core2.inputs[1].default_value = 3.2; nt.links.new(core.outputs[0], core2.inputs[0])
dens = nt.nodes.new("ShaderNodeMath"); dens.operation = "ADD"; nt.links.new(d2.outputs[0], dens.inputs[0]); nt.links.new(core2.outputs[0], dens.inputs[1])
# okraj disku do ztracena
edge = nt.nodes.new("ShaderNodeMath"); edge.operation = "MULTIPLY"; edge.inputs[1].default_value = 1 / R_MAX; nt.links.new(r, edge.inputs[0])
edge2 = nt.nodes.new("ShaderNodeMath"); edge2.operation = "SUBTRACT"; edge2.inputs[0].default_value = 1.0; nt.links.new(edge.outputs[0], edge2.inputs[1])
edge3 = nt.nodes.new("ShaderNodeMath"); edge3.operation = "MULTIPLY"; edge3.inputs[1].default_value = 3.0; nt.links.new(edge2.outputs[0], edge3.inputs[0])
edge4 = nt.nodes.new("ShaderNodeMath"); edge4.operation = "MINIMUM"; edge4.inputs[1].default_value = 1.0; nt.links.new(edge3.outputs[0], edge4.inputs[0])
edge5 = nt.nodes.new("ShaderNodeMath"); edge5.operation = "MAXIMUM"; edge5.inputs[1].default_value = 0.0; nt.links.new(edge4.outputs[0], edge5.inputs[0])
dens2 = nt.nodes.new("ShaderNodeMath"); dens2.operation = "MULTIPLY"; nt.links.new(dens.outputs[0], dens2.inputs[0]); nt.links.new(edge5.outputs[0], dens2.inputs[1])
alpha = nt.nodes.new("ShaderNodeMath"); alpha.operation = "MINIMUM"; alpha.inputs[1].default_value = 1.0; nt.links.new(dens2.outputs[0], alpha.inputs[0])
# barva: modrobílá ramena, teplé jádro, růžové HII oblasti
colr = nt.nodes.new("ShaderNodeValToRGB")
colr.color_ramp.elements[0].position = 0.0; colr.color_ramp.elements[0].color = hex_rgba("#ffe2b0")
colr.color_ramp.elements[1].position = 1.0; colr.color_ramp.elements[1].color = hex_rgba("#6f93ff")
e = colr.color_ramp.elements.new(0.25); e.color = hex_rgba("#ffdcc0")
e = colr.color_ramp.elements.new(0.5); e.color = hex_rgba("#b7c8ff")
rr = nt.nodes.new("ShaderNodeMath"); rr.operation = "MULTIPLY"; rr.inputs[1].default_value = 1 / R_MAX; nt.links.new(r, rr.inputs[0])
nt.links.new(rr.outputs[0], colr.inputs[0])
hn = nt.nodes.new("ShaderNodeTexNoise"); hn.inputs["Scale"].default_value = 22.0; hn.inputs["Detail"].default_value = 3
nt.links.new(tc.outputs["Object"], hn.inputs["Vector"])
hh = nt.nodes.new("ShaderNodeMath"); hh.operation = "SMOOTH_MINMAX" if False else "GREATER_THAN"; hh.inputs[1].default_value = 0.66; nt.links.new(hn.outputs["Fac"], hh.inputs[0])
hm = nt.nodes.new("ShaderNodeMath"); hm.operation = "MULTIPLY"; nt.links.new(hh.outputs[0], hm.inputs[0]); nt.links.new(arm, hm.inputs[1])
hm2 = nt.nodes.new("ShaderNodeMath"); hm2.operation = "MULTIPLY"; hm2.inputs[1].default_value = 0.7; nt.links.new(hm.outputs[0], hm2.inputs[0])
mixc = nt.nodes.new("ShaderNodeMix"); mixc.data_type = "RGBA"
nt.links.new(hm2.outputs[0], mixc.inputs[0]); nt.links.new(colr.outputs[0], mixc.inputs[6]); mixc.inputs[7].default_value = hex_rgba("#ff7fb0")
em = nt.nodes.new("ShaderNodeEmission"); nt.links.new(mixc.outputs[2], em.inputs["Color"]); em.inputs["Strength"].default_value = 3.6
tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(alpha.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2])
nt.links.new(mx.outputs[0], out.inputs[0])

bpy.ops.mesh.primitive_circle_add(vertices=256, radius=R_MAX, fill_type="TRIFAN")
disc = bpy.context.object; disc.data.materials.append(gm)

# ---------- prachové pruhy ----------
dm = bpy.data.materials.new("prach"); nt = nodes(dm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
r, arm, noise, phase, tc = spiral_field(nt)
# prach leží těsně vedle ramene: posunutá fáze
pc = nt.nodes.new("ShaderNodeMath"); pc.operation = "ADD"; pc.inputs[1].default_value = 0.55; nt.links.new(phase, pc.inputs[0])
pc2 = nt.nodes.new("ShaderNodeMath"); pc2.operation = "MULTIPLY"; pc2.inputs[1].default_value = ARMS; nt.links.new(pc.outputs[0], pc2.inputs[0])
pc3 = nt.nodes.new("ShaderNodeMath"); pc3.operation = "COSINE"; nt.links.new(pc2.outputs[0], pc3.inputs[0])
pc4 = nt.nodes.new("ShaderNodeMath"); pc4.operation = "MULTIPLY_ADD"; pc4.inputs[1].default_value = 0.5; pc4.inputs[2].default_value = 0.5; nt.links.new(pc3.outputs[0], pc4.inputs[0])
pc5 = nt.nodes.new("ShaderNodeMath"); pc5.operation = "POWER"; pc5.inputs[1].default_value = 5.0; nt.links.new(pc4.outputs[0], pc5.inputs[0])
dn = nt.nodes.new("ShaderNodeTexNoise"); dn.inputs["Scale"].default_value = 9.0; dn.inputs["Detail"].default_value = 10
nt.links.new(tc.outputs["Object"], dn.inputs["Vector"])
dmul = nt.nodes.new("ShaderNodeMath"); dmul.operation = "MULTIPLY"; nt.links.new(pc5.outputs[0], dmul.inputs[0]); nt.links.new(dn.outputs["Fac"], dmul.inputs[1])
rf = nt.nodes.new("ShaderNodeMath"); rf.operation = "MULTIPLY"; rf.inputs[1].default_value = -1 / 1.1; nt.links.new(r, rf.inputs[0])
rf2 = nt.nodes.new("ShaderNodeMath"); rf2.operation = "EXPONENT"; nt.links.new(rf.outputs[0], rf2.inputs[0])
# žádný prach v samotném jádru
cc = nt.nodes.new("ShaderNodeMath"); cc.operation = "SUBTRACT"; cc.inputs[1].default_value = 0.15; nt.links.new(r, cc.inputs[0])
cc2 = nt.nodes.new("ShaderNodeMath"); cc2.operation = "MULTIPLY"; cc2.inputs[1].default_value = 4.0; nt.links.new(cc.outputs[0], cc2.inputs[0])
cc3 = nt.nodes.new("ShaderNodeMath"); cc3.operation = "MINIMUM"; cc3.inputs[1].default_value = 1.0; nt.links.new(cc2.outputs[0], cc3.inputs[0])
cc4 = nt.nodes.new("ShaderNodeMath"); cc4.operation = "MAXIMUM"; cc4.inputs[1].default_value = 0.0; nt.links.new(cc3.outputs[0], cc4.inputs[0])
da = nt.nodes.new("ShaderNodeMath"); da.operation = "MULTIPLY"; nt.links.new(dmul.outputs[0], da.inputs[0]); nt.links.new(rf2.outputs[0], da.inputs[1])
da2 = nt.nodes.new("ShaderNodeMath"); da2.operation = "MULTIPLY"; nt.links.new(da.outputs[0], da2.inputs[0]); nt.links.new(cc4.outputs[0], da2.inputs[1])
da3 = nt.nodes.new("ShaderNodeMath"); da3.operation = "MULTIPLY"; da3.inputs[1].default_value = 3.2; nt.links.new(da2.outputs[0], da3.inputs[0])
da4 = nt.nodes.new("ShaderNodeMath"); da4.operation = "MINIMUM"; da4.inputs[1].default_value = 0.92; nt.links.new(da3.outputs[0], da4.inputs[0])
dd = nt.nodes.new("ShaderNodeBsdfDiffuse"); dd.inputs["Color"].default_value = hex_rgba("#150a1c")
dt = nt.nodes.new("ShaderNodeBsdfTransparent"); dx = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(da4.outputs[0], dx.inputs[0]); nt.links.new(dt.outputs[0], dx.inputs[1]); nt.links.new(dd.outputs[0], dx.inputs[2])
nt.links.new(dx.outputs[0], out.inputs[0])
bpy.ops.mesh.primitive_circle_add(vertices=256, radius=R_MAX, fill_type="TRIFAN", location=(0, 0, 0.006))
dust = bpy.context.object; dust.data.materials.append(dm)

# ---------- hvězdy ----------
em_m = bpy.data.materials.new("hvezdy"); nt = nodes(em_m)
out = nt.nodes.new("ShaderNodeOutputMaterial")
attr = nt.nodes.new("ShaderNodeAttribute"); attr.attribute_name = "Col"
emn = nt.nodes.new("ShaderNodeEmission"); emn.inputs["Strength"].default_value = 3.6
nt.links.new(attr.outputs["Color"], emn.inputs["Color"]); nt.links.new(emn.outputs[0], out.inputs[0])

bm = bmesh.new()
col_layer = bm.verts.layers.float_color.new("Col")
palette = [(1.0, 0.85, 0.65), (0.6, 0.75, 1.0), (0.45, 0.62, 1.0), (1.0, 0.6, 0.8), (1.0, 0.75, 0.4)]


def star(x, y, z, size, color):
    res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=size, matrix=__import__("mathutils").Matrix.Translation((x, y, z)))
    for v in res["verts"]:
        v[col_layer] = (color[0], color[1], color[2], 1.0)


for i in range(9500):
    r = rnd.expovariate(1 / 0.62)
    while r > R_MAX * 0.92:
        r = rnd.expovariate(1 / 0.62)
    if rnd.random() < 0.72:
        arm_i = rnd.randrange(ARMS)
        th = PITCH * math.log(max(r, 0.03)) + arm_i * math.tau / ARMS + rnd.gauss(0, 0.28 + 0.1 / (r + 0.2))
    else:
        th = rnd.uniform(0, math.tau)
    x, y = r * math.cos(th), r * math.sin(th)
    z = rnd.gauss(0, 0.012 + 0.02 * math.exp(-r))
    c = palette[1 if r > 0.9 and rnd.random() < 0.6 else rnd.randrange(len(palette))]
    b = rnd.uniform(0.45, 1.0)
    star(x, y, z, rnd.choice((0.005, 0.006, 0.0075, 0.009, 0.013)), (c[0] * b, c[1] * b, c[2] * b))
for i in range(2600):  # výduť v jádru
    r = abs(rnd.gauss(0, 0.17)); th = rnd.uniform(0, math.tau); ph = rnd.gauss(0, 0.45)
    star(r * math.cos(th), r * math.sin(th), r * ph * 0.6, rnd.choice((0.005, 0.007, 0.01)), (1.0, 0.7 + rnd.uniform(0, 0.12), 0.38 + rnd.uniform(0, 0.2)))
for i in range(40):  # jasné popředí
    r = rnd.uniform(0.2, 2.0); th = rnd.uniform(0, math.tau)
    star(r * math.cos(th), r * math.sin(th), 0.0, rnd.uniform(0.016, 0.026), (1.0, 1.0, 1.0))
mesh = bpy.data.meshes.new("hvezdy"); bm.to_mesh(mesh); bm.free()
stars = bpy.data.objects.new("hvezdy", mesh); sc.collection.objects.link(stars)
stars.data.materials.append(em_m)

# ---------- záře kolem jádra (obrázková rovina čelem ke kameře) ----------
hm = bpy.data.materials.new("halo"); nt = nodes(hm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
tcc = nt.nodes.new("ShaderNodeTexCoord"); lnn = nt.nodes.new("ShaderNodeVectorMath"); lnn.operation = "LENGTH"
nt.links.new(tcc.outputs["Object"], lnn.inputs[0])
g1 = nt.nodes.new("ShaderNodeMath"); g1.operation = "MULTIPLY"; g1.inputs[1].default_value = -4.2; nt.links.new(lnn.outputs["Value"], g1.inputs[0])
g2 = nt.nodes.new("ShaderNodeMath"); g2.operation = "EXPONENT"; nt.links.new(g1.outputs[0], g2.inputs[0])
g3 = nt.nodes.new("ShaderNodeMath"); g3.operation = "MULTIPLY"; g3.inputs[1].default_value = 0.55; nt.links.new(g2.outputs[0], g3.inputs[0])
he = nt.nodes.new("ShaderNodeEmission"); he.inputs["Color"].default_value = hex_rgba("#ffd9a8"); he.inputs["Strength"].default_value = 1.6
ht = nt.nodes.new("ShaderNodeBsdfTransparent"); hx = nt.nodes.new("ShaderNodeMixShader")
nt.links.new(g3.outputs[0], hx.inputs[0]); nt.links.new(ht.outputs[0], hx.inputs[1]); nt.links.new(he.outputs[0], hx.inputs[2])
nt.links.new(hx.outputs[0], out.inputs[0])
bpy.ops.mesh.primitive_circle_add(vertices=128, radius=2.0, fill_type="TRIFAN")
halo = bpy.context.object; halo.data.materials.append(hm)
halo.rotation_euler = (math.pi / 2, 0, 0); halo.location = (0, 1.5, 0)  # těsně před kamerou

# ---------- sklon galaxie ----------
tilt = bpy.data.objects.new("tilt", None); sc.collection.objects.link(tilt)
tilt.rotation_euler = (math.radians(36), math.radians(-28), 0)
for o in (disc, dust, stars):
    o.parent = tilt

add_camera((0, -10, 0), (0, 0, 0), ortho_scale=4.5)
render(lambda t: None)
