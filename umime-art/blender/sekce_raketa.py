"""Realistická raketa (ikona „Maturita“): lakovaný trup s panely, okénko se sklem, žebra, tryska a plamen."""
import math
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import bmesh
from mathutils import Matrix, Vector

PREVIEW = "--preview" in args()
RES = 640 if PREVIEW else 1024
sc = reset(RES, RES, 1, samples=64 if PREVIEW else 220, name="sekce_maturita", world=("#0b1033", 0.35), view="AgX", look="AgX - Punchy")
sc.cycles.volume_bounces = 1
sc.cycles.glossy_bounces = 6
sc.cycles.transmission_bounces = 8


def nodes(mat):
    mat.use_nodes = True
    mat.node_tree.nodes.clear()
    return mat.node_tree


def lathe(profile, segments=96, name="lathe", smooth=True):
    """Rotační těleso kolem osy Z z profilu [(poloměr, z), ...]."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        ring = [bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for a in (i / segments * math.tau for i in range(segments))]
        rings.append(ring)
    for k in range(len(rings) - 1):
        for i in range(segments):
            j = (i + 1) % segments
            try:
                bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
            except ValueError:
                pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    o = bpy.data.objects.new(name, mesh); sc.collection.objects.link(o)
    for p in mesh.polygons: p.use_smooth = smooth
    return o


# ---------- materiály ----------
def paint(name, color, rough=0.28, coat=0.9, panels=True):
    m = bpy.data.materials.new(name); nt = nodes(m)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = hex_rgba(color); b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat; b.inputs["Coat Roughness"].default_value = 0.05
    b.inputs["Metallic"].default_value = 0.25
    if panels:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        brick = nt.nodes.new("ShaderNodeTexBrick")
        brick.inputs["Scale"].default_value = 3.0; brick.inputs["Mortar Size"].default_value = 0.006; brick.inputs["Mortar Smooth"].default_value = 0.3
        brick.inputs["Bias"].default_value = 0.0; brick.inputs["Brick Width"].default_value = 1.2; brick.inputs["Row Height"].default_value = 0.55
        brick.inputs["Color1"].default_value = (1, 1, 1, 1); brick.inputs["Color2"].default_value = (1, 1, 1, 1); brick.inputs["Mortar"].default_value = (0, 0, 0, 1)
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], brick.inputs["Vector"])
        bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.6; bump.inputs["Distance"].default_value = 0.01
        nt.links.new(brick.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    nt.links.new(b.outputs[0], out.inputs[0])
    return m


def metal(name, color, rough=0.25):
    m = bpy.data.materials.new(name); nt = nodes(m)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = hex_rgba(color); b.inputs["Metallic"].default_value = 1.0; b.inputs["Roughness"].default_value = rough
    nt.links.new(b.outputs[0], out.inputs[0])
    return m


white = paint("bily", "#f4f4f7")
red = paint("cerveny", "#e8402a", coat=1.0)
orange = paint("oranzovy", "#ff7a2f", coat=1.0, panels=False)
dark = paint("tmavy", "#23232e", rough=0.4, coat=0.2, panels=False)
steel = metal("ocel", "#b7bcc7", 0.22)
darksteel = metal("tmava_ocel", "#4b4f5a", 0.35)

# ---------- trup z profilu ----------
L = 2.2
profile = [
    (0.0, 1.55), (0.05, 1.52), (0.12, 1.44), (0.2, 1.33), (0.29, 1.18), (0.38, 1.0), (0.46, 0.8), (0.52, 0.6), (0.55, 0.4),
    (0.56, 0.0), (0.56, -0.5), (0.555, -0.8), (0.53, -1.02),
]
body = lathe(profile, name="trup")
# materiály po pásech: špička červená, horní trup bílý, dolní pás oranžový
body.data.materials.append(white); body.data.materials.append(red); body.data.materials.append(orange); body.data.materials.append(dark)
for poly in body.data.polygons:
    z = sum(body.data.vertices[v].co.z for v in poly.vertices) / len(poly.vertices)
    poly.material_index = 1 if z > 1.2 else 2 if -0.97 < z < -0.78 else 3 if z <= -0.97 else 0
# prstencové pásky (tmavé linky) a spoje
for z, w in ((0.55, 0.012), (-0.2, 0.012), (-0.55, 0.012)):
    band = lathe([(0.558, z - w), (0.563, z - w), (0.563, z + w), (0.558, z + w)], name="pasek")
    band.data.materials.append(dark)

# ---------- okénko ----------
WZ = 0.28
ring = bpy.data.objects.new("okno_prsten", None)
bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.04, major_segments=64, minor_segments=24, location=(0, -0.55, WZ), rotation=(math.pi / 2, 0, 0))
ring = bpy.context.object; ring.data.materials.append(steel)
for p in ring.data.polygons: p.use_smooth = True
for i in range(10):
    a = i / 10 * math.tau
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, segments=16, ring_count=10, location=(0.275 * math.cos(a), -0.545, WZ + 0.275 * math.sin(a)))
    bpy.context.object.data.materials.append(steel)
# sklo: průhledný disk, uvnitř tmavá kabina s modrým odrazem Země
gm = bpy.data.materials.new("sklo"); nt = nodes(gm)
out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
b.inputs["Base Color"].default_value = hex_rgba("#7fc2ff"); b.inputs["Roughness"].default_value = 0.02
b.inputs["Transmission Weight"].default_value = 0.85; b.inputs["IOR"].default_value = 1.45
b.inputs["Emission Color"].default_value = hex_rgba("#3d8bff"); b.inputs["Emission Strength"].default_value = 0.9
nt.links.new(b.outputs[0], out.inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.19, segments=48, ring_count=32, location=(0, -0.5, WZ))
glass = bpy.context.object; glass.scale = (1, 0.33, 1); glass.data.materials.append(gm)
for p in glass.data.polygons: p.use_smooth = True
# kabina uvnitř
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17, segments=32, ring_count=20, location=(0, -0.46, WZ))
cab = bpy.context.object; cab.scale = (1, 0.2, 1)
cm = bpy.data.materials.new("kabina"); nt = nodes(cm)
co = nt.nodes.new("ShaderNodeOutputMaterial"); cg = nt.nodes.new("ShaderNodeTexGradient"); cgc = nt.nodes.new("ShaderNodeTexCoord")
gr = nt.nodes.new("ShaderNodeValToRGB"); gr.color_ramp.elements[0].color = hex_rgba("#07122e"); gr.color_ramp.elements[1].color = hex_rgba("#3b86d8")
nt.links.new(cgc.outputs["Object"], cg.inputs["Vector"]); nt.links.new(cg.outputs["Fac"], gr.inputs[0])
ce = nt.nodes.new("ShaderNodeEmission"); ce.inputs["Strength"].default_value = 0.8; nt.links.new(gr.outputs[0], ce.inputs["Color"]); nt.links.new(ce.outputs[0], co.inputs[0])
cab.data.materials.append(cm)

# ---------- žebra (3 kusy, tvarovaná deska s fasetou) ----------
fin_pts = [(0.0, 0.0), (0.62, -0.18), (0.62, -0.7), (0.0, -0.25)]  # (dopředu od trupu, výška)


def make_fin(angle):
    bm = bmesh.new()
    th = 0.035
    top = [bm.verts.new((0.5 + x, -th / 2, 0.0 + z - 0.28)) for x, z in [(0.0, 0.62), (0.0, -0.18)]]
    pts = [(0.0, -0.1), (0.66, -0.78), (0.66, -1.18), (0.0, -1.02)]
    for sgn in (-1, 1):
        pass
    vs_a = [bm.verts.new((0.52 + x, -th / 2, z)) for x, z in pts]
    vs_b = [bm.verts.new((0.52 + x, th / 2, z)) for x, z in pts]
    bm.faces.new(vs_a[::-1]); bm.faces.new(vs_b)
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((vs_a[i], vs_a[j], vs_b[j], vs_b[i]))
    mesh = bpy.data.meshes.new("zebro"); bm.to_mesh(mesh); bm.free()
    o = bpy.data.objects.new("zebro", mesh); sc.collection.objects.link(o)
    bev = o.modifiers.new("bevel", "BEVEL"); bev.width = 0.014; bev.segments = 3
    o.data.materials.append(red)
    for p in o.data.polygons: p.use_smooth = True
    o.rotation_euler = (0, 0, angle)
    o.location = (0, 0, 0.0)
    return o


for a in (0, math.radians(120), math.radians(240)):
    make_fin(a)

# ---------- tryska ----------
nz = lathe([(0.34, -1.0), (0.3, -1.12), (0.3, -1.22), (0.36, -1.45), (0.43, -1.62), (0.44, -1.64), (0.40, -1.64), (0.33, -1.5), (0.26, -1.25), (0.26, -1.1)], name="tryska")
nz.data.materials.append(darksteel)
glow_in = lathe([(0.0, -1.3), (0.24, -1.3), (0.37, -1.6), (0.0, -1.6)], name="zar_tryska", smooth=True)
gl = bpy.data.materials.new("zar_tryska"); nt = nodes(gl)
go = nt.nodes.new("ShaderNodeOutputMaterial"); ge = nt.nodes.new("ShaderNodeEmission"); ge.inputs["Color"].default_value = hex_rgba("#ffb25a"); ge.inputs["Strength"].default_value = 5.0
nt.links.new(ge.outputs[0], go.inputs[0]); glow_in.data.materials.append(gl)

# ---------- plamen: tři vnořené zářivé kužely, průhledné k okrajům a ke špičce ----------
def flame_layer(name, radius, length, color, strength, edge_pow, tip_pow, z0):
    m = bpy.data.materials.new(name); nt = nodes(m)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; nt.links.new(lw.outputs["Facing"], inv.inputs[1])
    ep = nt.nodes.new("ShaderNodeMath"); ep.operation = "POWER"; ep.inputs[1].default_value = edge_pow; nt.links.new(inv.outputs[0], ep.inputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    zi = nt.nodes.new("ShaderNodeMath"); zi.operation = "SUBTRACT"; zi.inputs[0].default_value = 1.0; nt.links.new(sep.outputs["Z"], zi.inputs[1])
    zp = nt.nodes.new("ShaderNodeMath"); zp.operation = "POWER"; zp.inputs[1].default_value = tip_pow; nt.links.new(zi.outputs[0], zp.inputs[0])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 9.0; nz.inputs["Detail"].default_value = 5
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.5, 1.5, 0.7); nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
    nzm = nt.nodes.new("ShaderNodeMath"); nzm.operation = "MULTIPLY_ADD"; nzm.inputs[1].default_value = 0.7; nzm.inputs[2].default_value = 0.55; nt.links.new(nz.outputs["Fac"], nzm.inputs[0])
    f1 = nt.nodes.new("ShaderNodeMath"); f1.operation = "MULTIPLY"; nt.links.new(ep.outputs[0], f1.inputs[0]); nt.links.new(zp.outputs[0], f1.inputs[1])
    f2 = nt.nodes.new("ShaderNodeMath"); f2.operation = "MULTIPLY"; nt.links.new(f1.outputs[0], f2.inputs[0]); nt.links.new(nzm.outputs[0], f2.inputs[1])
    f3 = nt.nodes.new("ShaderNodeMath"); f3.operation = "MINIMUM"; f3.inputs[1].default_value = 1.0; nt.links.new(f2.outputs[0], f3.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = hex_rgba(color); em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(f3.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=radius, radius2=0.0, depth=length, location=(0, 0, z0 - length / 2))
    o = bpy.context.object; o.rotation_euler = (math.pi, 0, 0); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o


flame_layer("fl_out", 0.43, 2.5, "#ff4a0c", 4.6, 1.3, 0.9, -1.55)
flame_layer("fl_mid", 0.3, 1.9, "#ff9220", 6.2, 1.1, 0.9, -1.55)
flame_layer("fl_in", 0.18, 1.3, "#ffe9a0", 9.0, 0.9, 0.8, -1.55)

# ---------- celá raketa: sklon 45° doprava nahoru, lehké natočení ke kameře ----------
rocket_parts = [o for o in sc.collection.objects if o.type in {"MESH"} and o.name != ""]
pivot = bpy.data.objects.new("raketa", None); sc.collection.objects.link(pivot)
for o in rocket_parts:
    o.parent = pivot
pivot.rotation_euler = (math.radians(-12), math.radians(40), math.radians(0))
pivot.location = (0.0, 0, 0.2)

# ---------- světla: softboxy pro odlesky + teplé světlo plamene ----------
add_sun((math.radians(50), math.radians(-18), math.radians(-60)), energy=5.5, color="#fff2e2", angle=0.1)
add_area((-4, -5, 4), (0, 0, 0), energy=520, size=3.5, color="#dfe8ff")
add_area((5, -4, -1), (0, 0, 0), energy=300, size=2.5, color="#9db8ff")
pl = bpy.data.lights.new("plamen", "POINT"); pl.energy = 260; pl.color = (1.0, 0.62, 0.25); pl.shadow_soft_size = 0.3
plo = bpy.data.objects.new("plamen", pl); sc.collection.objects.link(plo); plo.location = (0.2, -0.7, -1.9); plo.parent = pivot

add_camera((0, -10.5, 0), (0, 0, 0), lens=70)
render(lambda t: None)
