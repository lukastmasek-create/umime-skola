"""Realistická planeta s prstencem (ikona „Základní škola“): pruhované mraky, atmosféra, vržené stíny prstence."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

PREVIEW = "--preview" in args()
RES = 640 if PREVIEW else 1024
sc = reset(RES, RES, 1, samples=48 if PREVIEW else 200, name="sekce_zakladni", world=("#0b1033", 0.25), view="AgX", look="AgX - Punchy")


def nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    return nt


# ---------- planeta ----------
pm = bpy.data.materials.new("planeta")
nt = nodes(pm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Roughness"].default_value = 0.62
bsdf.inputs["Specular IOR Level"].default_value = 0.25
tc = nt.nodes.new("ShaderNodeTexCoord")
mapn = nt.nodes.new("ShaderNodeMapping")
mapn.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 2.4; n1.inputs["Detail"].default_value = 10; n1.inputs["Roughness"].default_value = 0.62; n1.inputs["Distortion"].default_value = 0.9
# pruhy: šum natažený podél rovnoběžek
stretch = nt.nodes.new("ShaderNodeMapping"); stretch.inputs["Scale"].default_value = (1.2, 1.2, 9.0)
n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 5.0; n2.inputs["Detail"].default_value = 14; n2.inputs["Roughness"].default_value = 0.7
nt.links.new(tc.outputs["Object"], mapn.inputs["Vector"])
nt.links.new(mapn.outputs["Vector"], sep.inputs[0])
nt.links.new(tc.outputs["Object"], n1.inputs["Vector"])
nt.links.new(tc.outputs["Object"], stretch.inputs["Vector"])
nt.links.new(stretch.outputs["Vector"], n2.inputs["Vector"])
# lat = z + 0.16*(n1-0.5) + 0.10*(n2-0.5)
sub1 = nt.nodes.new("ShaderNodeMath"); sub1.operation = "SUBTRACT"; sub1.inputs[1].default_value = 0.5
m1 = nt.nodes.new("ShaderNodeMath"); m1.operation = "MULTIPLY"; m1.inputs[1].default_value = 0.2
sub2 = nt.nodes.new("ShaderNodeMath"); sub2.operation = "SUBTRACT"; sub2.inputs[1].default_value = 0.5
m2 = nt.nodes.new("ShaderNodeMath"); m2.operation = "MULTIPLY"; m2.inputs[1].default_value = 0.12
add1 = nt.nodes.new("ShaderNodeMath"); add1.operation = "ADD"
add2 = nt.nodes.new("ShaderNodeMath"); add2.operation = "ADD"
nt.links.new(n1.outputs["Fac"], sub1.inputs[0]); nt.links.new(sub1.outputs[0], m1.inputs[0])
nt.links.new(n2.outputs["Fac"], sub2.inputs[0]); nt.links.new(sub2.outputs[0], m2.inputs[0])
nt.links.new(sep.outputs["Z"], add1.inputs[0]); nt.links.new(m1.outputs[0], add1.inputs[1])
nt.links.new(add1.outputs[0], add2.inputs[0]); nt.links.new(m2.outputs[0], add2.inputs[1])
# pásy: sin(lat * 13) + jemnější sin(lat * 31)
s1 = nt.nodes.new("ShaderNodeMath"); s1.operation = "MULTIPLY"; s1.inputs[1].default_value = 13.0
sn1 = nt.nodes.new("ShaderNodeMath"); sn1.operation = "SINE"
s2 = nt.nodes.new("ShaderNodeMath"); s2.operation = "MULTIPLY"; s2.inputs[1].default_value = 31.0
sn2 = nt.nodes.new("ShaderNodeMath"); sn2.operation = "SINE"; 
w2 = nt.nodes.new("ShaderNodeMath"); w2.operation = "MULTIPLY_ADD"; w2.inputs[1].default_value = 0.35
mix = nt.nodes.new("ShaderNodeMath"); mix.operation = "ADD"
norm = nt.nodes.new("ShaderNodeMath"); norm.operation = "MULTIPLY_ADD"; norm.inputs[1].default_value = 0.37; norm.inputs[2].default_value = 0.5
nt.links.new(add2.outputs[0], s1.inputs[0]); nt.links.new(s1.outputs[0], sn1.inputs[0])
nt.links.new(add2.outputs[0], s2.inputs[0]); nt.links.new(s2.outputs[0], sn2.inputs[0])
nt.links.new(sn2.outputs[0], w2.inputs[0])
nt.links.new(sn1.outputs[0], mix.inputs[0]); nt.links.new(w2.outputs[0], mix.inputs[1])
nt.links.new(mix.outputs[0], norm.inputs[0])
ramp = nt.nodes.new("ShaderNodeValToRGB")
cols = [(0.0, "#8f3f1c"), (0.28, "#c4622a"), (0.5, "#e8975a"), (0.72, "#f3c680"), (1.0, "#fbe6b4")]
ramp.color_ramp.elements[0].position = cols[0][0]; ramp.color_ramp.elements[0].color = hex_rgba(cols[0][1])
ramp.color_ramp.elements[1].position = cols[-1][0]; ramp.color_ramp.elements[1].color = hex_rgba(cols[-1][1])
for pos, c in cols[1:-1]:
    e = ramp.color_ramp.elements.new(pos); e.color = hex_rgba(c)
nt.links.new(norm.outputs[0], ramp.inputs[0])
nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
# reliéf mraků
bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.25; bump.inputs["Distance"].default_value = 0.02
nt.links.new(n2.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
# atmosférická záře na okraji
lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
glow = nt.nodes.new("ShaderNodeEmission"); glow.inputs["Color"].default_value = hex_rgba("#ffd9a0"); glow.inputs["Strength"].default_value = 0.9
mixsh = nt.nodes.new("ShaderNodeMixShader")
rim = nt.nodes.new("ShaderNodeMath"); rim.operation = "POWER"; rim.inputs[1].default_value = 3.0
nt.links.new(lw.outputs["Facing"], rim.inputs[0])
inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
nt.links.new(lw.outputs["Facing"], inv.inputs[1])
pw = nt.nodes.new("ShaderNodeMath"); pw.operation = "POWER"; pw.inputs[1].default_value = 3.5
nt.links.new(inv.outputs[0], pw.inputs[0])
rimscale = nt.nodes.new("ShaderNodeMath"); rimscale.operation = "MULTIPLY"; rimscale.inputs[1].default_value = 0.35
nt.links.new(pw.outputs[0], rimscale.inputs[0])
nt.links.new(rimscale.outputs[0], mixsh.inputs[0])
nt.links.new(bsdf.outputs[0], mixsh.inputs[1]); nt.links.new(glow.outputs[0], mixsh.inputs[2])
nt.links.new(mixsh.outputs[0], out.inputs[0])

bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=160, ring_count=96)
planet = bpy.context.object
planet.data.materials.append(pm)
for p in planet.data.polygons: p.use_smooth = True
planet.rotation_euler = (math.radians(8), 0, math.radians(-14))

# ---------- prsten ----------
rm = bpy.data.materials.new("prsten")
nt = nodes(rm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
bs = nt.nodes.new("ShaderNodeBsdfPrincipled"); bs.inputs["Roughness"].default_value = 0.75
tr = nt.nodes.new("ShaderNodeBsdfTransparent")
mixs = nt.nodes.new("ShaderNodeMixShader")
tcr = nt.nodes.new("ShaderNodeTexCoord")
ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
nt.links.new(tcr.outputs["Object"], ln.inputs[0])
# radiální struktura: pásy (C, B, A) a mezera Cassini
fine = nt.nodes.new("ShaderNodeTexNoise"); fine.inputs["Scale"].default_value = 60.0; fine.inputs["Detail"].default_value = 3; fine.noise_dimensions = "1D"
mulf = nt.nodes.new("ShaderNodeMath"); mulf.operation = "MULTIPLY"; mulf.inputs[1].default_value = 1.0
nt.links.new(ln.outputs["Value"], fine.inputs["W"])
dens = nt.nodes.new("ShaderNodeValToRGB")
dens.color_ramp.interpolation = "LINEAR"
# poloměr 1.35..2.25 (objektové souřadnice válce 1x1 -> násobíme scale 2.25): radius normalizovaný 0..1 -> 0.6 až 1
rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["From Min"].default_value = 0.0; rr.inputs["From Max"].default_value = 1.0
nt.links.new(ln.outputs["Value"], rr.inputs["Value"])
prof = nt.nodes.new("ShaderNodeValToRGB"); prof.color_ramp.interpolation = "LINEAR"
pts = [(0.0, 0.0), (0.58, 0.0), (0.60, 0.30), (0.66, 0.42), (0.72, 0.55), (0.78, 0.9), (0.86, 0.95), (0.885, 0.04), (0.905, 0.04), (0.92, 0.8), (0.97, 0.7), (1.0, 0.0)]
prof.color_ramp.elements[0].position = pts[0][0]; prof.color_ramp.elements[0].color = (pts[0][1],) * 3 + (1,)
prof.color_ramp.elements[1].position = pts[1][0]; prof.color_ramp.elements[1].color = (pts[1][1],) * 3 + (1,)
for pos, v in pts[2:]:
    e = prof.color_ramp.elements.new(pos); e.color = (v, v, v, 1)
nt.links.new(ln.outputs["Value"], prof.inputs[0])
# alfa = profil * (0.65 + 0.7*jemný šum)
mfine = nt.nodes.new("ShaderNodeMath"); mfine.operation = "MULTIPLY_ADD"; mfine.inputs[1].default_value = 0.9; mfine.inputs[2].default_value = 0.35
nt.links.new(fine.outputs["Fac"], mfine.inputs[0])
alpha = nt.nodes.new("ShaderNodeMath"); alpha.operation = "MULTIPLY"
nt.links.new(prof.outputs[0], alpha.inputs[0]); nt.links.new(mfine.outputs[0], alpha.inputs[1])
clampa = nt.nodes.new("ShaderNodeMath"); clampa.operation = "MINIMUM"; clampa.inputs[1].default_value = 1.0
nt.links.new(alpha.outputs[0], clampa.inputs[0])
# barva: béžová až hnědošedá podle šumu
cr = nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].color = hex_rgba("#8a7456"); cr.color_ramp.elements[1].color = hex_rgba("#e7d3a6")
nt.links.new(fine.outputs["Fac"], cr.inputs[0])
nt.links.new(cr.outputs[0], bs.inputs["Base Color"])
inva = nt.nodes.new("ShaderNodeMath"); inva.operation = "SUBTRACT"; inva.inputs[0].default_value = 1.0
nt.links.new(clampa.outputs[0], inva.inputs[1])
nt.links.new(inva.outputs[0], mixs.inputs[0])
nt.links.new(bs.outputs[0], mixs.inputs[1]); nt.links.new(tr.outputs[0], mixs.inputs[2])
nt.links.new(mixs.outputs[0], out.inputs[0])

bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=2.3, depth=0.012)
ring = bpy.context.object
ring.data.materials.append(rm)
# Object souřadnice válce o poloměru 2.3: length 0..2.3 -> normalizace na 0..1 dělením (mapping)
rm.node_tree.nodes["Math"] if False else None
# normalizace poloměru: vynásobíme délku 1/2.3
norm_len = rm.node_tree.nodes.new("ShaderNodeMath"); norm_len.operation = "MULTIPLY"; norm_len.inputs[1].default_value = 1 / 2.3
rm.node_tree.links.new(ln.outputs["Value"], norm_len.inputs[0])
rm.node_tree.links.new(norm_len.outputs[0], prof.inputs[0])
rm.node_tree.links.new(norm_len.outputs[0], fine.inputs["W"])

pivot = bpy.data.objects.new("pivot", None); sc.collection.objects.link(pivot)
pivot.rotation_euler = (math.radians(23), math.radians(-18), 0)
ring.parent = pivot

# ---------- měsíc s krátery ----------
mm = bpy.data.materials.new("mesic"); nt = nodes(mm)
mo = nt.nodes.new("ShaderNodeOutputMaterial"); mb = nt.nodes.new("ShaderNodeBsdfPrincipled"); mb.inputs["Roughness"].default_value = 0.9
mv = nt.nodes.new("ShaderNodeTexVoronoi"); mv.inputs["Scale"].default_value = 7.0
mn = nt.nodes.new("ShaderNodeTexNoise"); mn.inputs["Scale"].default_value = 8.0; mn.inputs["Detail"].default_value = 10
mt = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(mt.outputs["Object"], mv.inputs["Vector"]); nt.links.new(mt.outputs["Object"], mn.inputs["Vector"])
mbump = nt.nodes.new("ShaderNodeBump"); mbump.inputs["Strength"].default_value = 0.8; mbump.inputs["Distance"].default_value = 0.03
mcomb = nt.nodes.new("ShaderNodeMath"); mcomb.operation = "ADD"
nt.links.new(mv.outputs["Distance"], mcomb.inputs[0]); nt.links.new(mn.outputs["Fac"], mcomb.inputs[1])
nt.links.new(mcomb.outputs[0], mbump.inputs["Height"]); nt.links.new(mbump.outputs["Normal"], mb.inputs["Normal"])
mr = nt.nodes.new("ShaderNodeValToRGB"); mr.color_ramp.elements[0].color = hex_rgba("#6d6a72"); mr.color_ramp.elements[1].color = hex_rgba("#c9c5cc")
nt.links.new(mn.outputs["Fac"], mr.inputs[0]); nt.links.new(mr.outputs[0], mb.inputs["Base Color"])
nt.links.new(mb.outputs[0], mo.inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=96, ring_count=64, location=(1.95, -1.4, -1.0))
moon = bpy.context.object; moon.data.materials.append(mm)
for p in moon.data.polygons: p.use_smooth = True

# ---------- světla: slunce zleva shora + slabý modrý kontrast zprava ----------
add_sun((math.radians(62), math.radians(-12), math.radians(-72)), energy=7.5, color="#fff0dc", angle=0.12)
add_sun((math.radians(115), math.radians(10), math.radians(135)), energy=0.45, color="#6f8bff", angle=0.6)
add_camera((0, -10, 0.6), (0, 0, 0), ortho_scale=5.5)

render(lambda t: None)
