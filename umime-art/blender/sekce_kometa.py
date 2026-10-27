"""Kometa (ikona „Přijímačky“): skalnatá ledová jádra, jasná kóma, modrý iontový ohon a zakřivený prachový ohon."""
import math
import random
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import bmesh
from mathutils import Matrix, Vector

PREVIEW = "--preview" in args()
RES = 640 if PREVIEW else 800
sc = reset(RES, RES, 1, samples=48 if PREVIEW else 90, name="sekce_prijimacky", world=("#000000", 0.0), view="AgX", look="AgX - Punchy")
sc.cycles.volume_bounces = 1
sc.cycles.volume_step_rate = 2.0
rnd = random.Random(11)

HEAD = Vector((1.1, 0, -1.05))
TAIL = Vector((-1.0, 0, 0.78)).normalized()  # směr ohonu (od Slunce pryč)


def nodes(mat):
    mat.use_nodes = True
    mat.node_tree.nodes.clear()
    return mat.node_tree


# ---------- jádro ----------
nm = bpy.data.materials.new("jadro"); nt = nodes(nm)
out = nt.nodes.new("ShaderNodeOutputMaterial"); bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
tc = nt.nodes.new("ShaderNodeTexCoord")
n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 4.0; n1.inputs["Detail"].default_value = 12; n1.inputs["Roughness"].default_value = 0.7
n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 11.0; n2.inputs["Detail"].default_value = 10
vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 6.0
nt.links.new(tc.outputs["Object"], n1.inputs["Vector"]); nt.links.new(tc.outputs["Object"], n2.inputs["Vector"]); nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
cr = nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].position = 0.42; cr.color_ramp.elements[0].color = hex_rgba("#17120f")
cr.color_ramp.elements[1].position = 0.62; cr.color_ramp.elements[1].color = hex_rgba("#6e6358")
e = cr.color_ramp.elements.new(0.8); e.color = hex_rgba("#dfe8ee")  # ledové skvrny
nt.links.new(n1.outputs["Fac"], cr.inputs[0]); nt.links.new(cr.outputs[0], bs.inputs["Base Color"])
rg = nt.nodes.new("ShaderNodeValToRGB"); rg.color_ramp.elements[0].color = (0.9, 0.9, 0.9, 1); rg.color_ramp.elements[1].color = (0.35, 0.35, 0.35, 1)
nt.links.new(n1.outputs["Fac"], rg.inputs[0]); nt.links.new(rg.outputs[0], bs.inputs["Roughness"])
add = nt.nodes.new("ShaderNodeMath"); add.operation = "ADD"
nt.links.new(vor.outputs["Distance"], add.inputs[0]); nt.links.new(n2.outputs["Fac"], add.inputs[1])
bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 1.0; bump.inputs["Distance"].default_value = 0.04
nt.links.new(add.outputs[0], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
nt.links.new(bs.outputs[0], out.inputs[0])

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=0.58, location=HEAD)
nuc = bpy.context.object
nuc.scale = (1.2, 0.88, 0.82)
nuc.rotation_euler = (0.4, 0.3, 0.9)
disp = nuc.modifiers.new("disp", "DISPLACE")
tex = bpy.data.textures.new("rock", "CLOUDS"); tex.noise_scale = 0.55; tex.noise_depth = 5
disp.texture = tex; disp.strength = 0.23; disp.mid_level = 0.5
nuc.data.materials.append(nm)
for p in nuc.data.polygons: p.use_smooth = True
# úlomky okolo
for i in range(7):
    a = rnd.uniform(0, math.tau); d = rnd.uniform(0.8, 1.45)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=rnd.uniform(0.04, 0.09), location=HEAD + Vector((math.cos(a) * d, rnd.uniform(-0.1, 0.1), math.sin(a) * d)))
    o = bpy.context.object; o.scale = (1.3, 1, 0.8); o.data.materials.append(nm)

# ---------- kóma ----------
cm = bpy.data.materials.new("koma"); nt = nodes(cm)
out = nt.nodes.new("ShaderNodeOutputMaterial")
pv = nt.nodes.new("ShaderNodeVolumePrincipled")
tcc = nt.nodes.new("ShaderNodeTexCoord"); ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"
nt.links.new(tcc.outputs["Object"], ln.inputs[0])
fall = nt.nodes.new("ShaderNodeMapRange"); fall.inputs["From Min"].default_value = 0.1; fall.inputs["From Max"].default_value = 1.0; fall.inputs["To Min"].default_value = 1.0; fall.inputs["To Max"].default_value = 0.0
fall.clamp = True
nt.links.new(ln.outputs["Value"], fall.inputs["Value"])
sq = nt.nodes.new("ShaderNodeMath"); sq.operation = "POWER"; sq.inputs[1].default_value = 2.4; nt.links.new(fall.outputs["Result"], sq.inputs[0])
cn = nt.nodes.new("ShaderNodeTexNoise"); cn.inputs["Scale"].default_value = 4.0; cn.inputs["Detail"].default_value = 6
nt.links.new(tcc.outputs["Object"], cn.inputs["Vector"])
cm1 = nt.nodes.new("ShaderNodeMath"); cm1.operation = "MULTIPLY_ADD"; cm1.inputs[1].default_value = 0.8; cm1.inputs[2].default_value = 0.4
nt.links.new(cn.outputs["Fac"], cm1.inputs[0])
cm2 = nt.nodes.new("ShaderNodeMath"); cm2.operation = "MULTIPLY"; nt.links.new(sq.outputs[0], cm2.inputs[0]); nt.links.new(cm1.outputs[0], cm2.inputs[1])
dn = nt.nodes.new("ShaderNodeMath"); dn.operation = "MULTIPLY"; dn.inputs[1].default_value = 0.12; nt.links.new(cm2.outputs[0], dn.inputs[0])
es = nt.nodes.new("ShaderNodeMath"); es.operation = "MULTIPLY"; es.inputs[1].default_value = 3.6; nt.links.new(cm2.outputs[0], es.inputs[0])
pv.inputs["Color"].default_value = hex_rgba("#bfe6ff"); pv.inputs["Emission Color"].default_value = hex_rgba("#9fd8ff")
nt.links.new(dn.outputs[0], pv.inputs["Density"]); nt.links.new(es.outputs[0], pv.inputs["Emission Strength"])
nt.links.new(pv.outputs[0], out.inputs["Volume"])
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.5, segments=48, ring_count=32, location=HEAD)
coma = bpy.context.object; coma.data.materials.append(cm)

# ---------- iontový ohon (modrý, paprskovitý) ----------
def tail_volume(name, length, radius, color, emit, density, streak_scale, seed_offset, bend=0.0):
    m = bpy.data.materials.new(name); nt = nodes(m)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); pv = nt.nodes.new("ShaderNodeVolumePrincipled")
    tcg = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tcg.outputs["Generated"], sep.inputs[0])
    # radiální (0 střed .. 1 okraj) a osová (0 hlava .. 1 špička) souřadnice
    cx = nt.nodes.new("ShaderNodeMath"); cx.operation = "SUBTRACT"; cx.inputs[1].default_value = 0.5; nt.links.new(sep.outputs["X"], cx.inputs[0])
    cy = nt.nodes.new("ShaderNodeMath"); cy.operation = "SUBTRACT"; cy.inputs[1].default_value = 0.5; nt.links.new(sep.outputs["Y"], cy.inputs[0])
    cxy = nt.nodes.new("ShaderNodeCombineXYZ"); nt.links.new(cx.outputs[0], cxy.inputs["X"]); nt.links.new(cy.outputs[0], cxy.inputs["Y"])
    rad = nt.nodes.new("ShaderNodeVectorMath"); rad.operation = "LENGTH"; nt.links.new(cxy.outputs[0], rad.inputs[0])
    rad2 = nt.nodes.new("ShaderNodeMath"); rad2.operation = "MULTIPLY"; rad2.inputs[1].default_value = 2.0; nt.links.new(rad.outputs["Value"], rad2.inputs[0])
    # kužel se zužuje ke špičce: poloměr(z) = 1 - z
    z = sep.outputs["Z"]
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; nt.links.new(z, inv.inputs[1])
    relr = nt.nodes.new("ShaderNodeMath"); relr.operation = "DIVIDE"; nt.links.new(rad2.outputs[0], relr.inputs[0])
    invm = nt.nodes.new("ShaderNodeMath"); invm.operation = "MAXIMUM"; invm.inputs[1].default_value = 0.05; nt.links.new(inv.outputs[0], invm.inputs[0]); nt.links.new(invm.outputs[0], relr.inputs[1])
    rf = nt.nodes.new("ShaderNodeMapRange"); rf.inputs["From Min"].default_value = 0.0; rf.inputs["From Max"].default_value = 1.0; rf.inputs["To Min"].default_value = 1.0; rf.inputs["To Max"].default_value = 0.0; rf.clamp = True
    nt.links.new(relr.outputs[0], rf.inputs["Value"])
    rfp = nt.nodes.new("ShaderNodeMath"); rfp.operation = "POWER"; rfp.inputs[1].default_value = 1.6; nt.links.new(rf.outputs["Result"], rfp.inputs[0])
    af = nt.nodes.new("ShaderNodeMath"); af.operation = "POWER"; af.inputs[1].default_value = 1.35; nt.links.new(inv.outputs[0], af.inputs[0])
    # podélné pruhy: šum natažený podél osy
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (streak_scale, streak_scale, 0.9); mp.inputs["Location"].default_value = (seed_offset, 0, 0)
    nt.links.new(tcg.outputs["Generated"], mp.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2.0; nz.inputs["Detail"].default_value = 9; nz.inputs["Roughness"].default_value = 0.65
    nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
    nzr = nt.nodes.new("ShaderNodeMapRange"); nzr.inputs["From Min"].default_value = 0.3; nzr.inputs["From Max"].default_value = 0.75; nzr.clamp = True
    nt.links.new(nz.outputs["Fac"], nzr.inputs["Value"])
    prod = nt.nodes.new("ShaderNodeMath"); prod.operation = "MULTIPLY"; nt.links.new(rfp.outputs[0], prod.inputs[0]); nt.links.new(af.outputs[0], prod.inputs[1])
    prod2 = nt.nodes.new("ShaderNodeMath"); prod2.operation = "MULTIPLY"; nt.links.new(prod.outputs[0], prod2.inputs[0]); nt.links.new(nzr.outputs["Result"], prod2.inputs[1])
    dsc = nt.nodes.new("ShaderNodeMath"); dsc.operation = "MULTIPLY"; dsc.inputs[1].default_value = density; nt.links.new(prod2.outputs[0], dsc.inputs[0])
    esc = nt.nodes.new("ShaderNodeMath"); esc.operation = "MULTIPLY"; esc.inputs[1].default_value = emit; nt.links.new(prod2.outputs[0], esc.inputs[0])
    col = nt.nodes.new("ShaderNodeValToRGB")
    col.color_ramp.elements[0].color = hex_rgba(color[0]); col.color_ramp.elements[1].color = hex_rgba(color[1])
    nt.links.new(z, col.inputs[0])
    nt.links.new(col.outputs[0], pv.inputs["Emission Color"]); nt.links.new(col.outputs[0], pv.inputs["Color"])
    nt.links.new(dsc.outputs[0], pv.inputs["Density"]); nt.links.new(esc.outputs[0], pv.inputs["Emission Strength"])
    nt.links.new(pv.outputs[0], out.inputs["Volume"])
    # kužel s osou Z, základna u hlavy
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=radius, radius2=0.0, depth=length, location=(0, 0, 0))
    o = bpy.context.object
    o.data.materials.append(m)
    # Generated souřadnice: z=0 je spodek kuželu (základna, radius1) → tam má být hlava
    return o


def aim(obj, direction, origin):
    """Osu Z objektu nasměruje po `direction` a základnu (-Z konec) umístí do `origin`."""
    q = Vector((0, 0, 1)).rotation_difference(direction)
    obj.rotation_mode = "QUATERNION"; obj.rotation_quaternion = q
    length = obj.dimensions.z
    obj.location = origin + direction * (length / 2)


ion = tail_volume("ion", 4.1, 0.62, ("#d6ebff", "#1b50ff"), 560.0, 10.0, 5.0, 3.0)
aim(ion, TAIL, HEAD + TAIL * 0.75)
ion2 = tail_volume("ion2", 3.3, 0.3, ("#ffffff", "#3a78ff"), 700.0, 10.0, 8.0, 11.0)
aim(ion2, (TAIL + Vector((0, 0, 0.05))).normalized(), HEAD + TAIL * 0.75)

# ---------- prachový ohon: zakřivený roj částic ----------
mat = bpy.data.materials.new("prach"); nt = nodes(mat)
out = nt.nodes.new("ShaderNodeOutputMaterial")
attr = nt.nodes.new("ShaderNodeAttribute"); attr.attribute_name = "Col"
em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 5.5
nt.links.new(attr.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs[0], out.inputs[0])
bm = bmesh.new(); layer = bm.verts.layers.float_color.new("Col")
for i in range(22000):
    t = rnd.random() ** 0.8
    L = 3.2 * t
    # zakřivení: osa se postupně stáčí k dolní straně
    ang = math.atan2(TAIL.z, TAIL.x) + 0.55 * t * t - 0.12
    pos = HEAD + Vector((math.cos(ang), 0, math.sin(ang))) * (0.25 + L)
    spread = 0.06 + 0.7 * t
    pos += Vector((rnd.gauss(0, spread * 0.35), rnd.gauss(0, 0.05), rnd.gauss(0, spread * 0.35)))
    fade = (1 - t) ** 1.7
    b = (0.15 + 0.85 * fade) * rnd.uniform(0.4, 1.0)
    warm = (1.0, 0.78 + 0.15 * (1 - t), 0.48 + 0.3 * (1 - t))
    r = rnd.choice((0.005, 0.007, 0.009, 0.012)) * (1.3 - 0.5 * t)
    res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r, matrix=Matrix.Translation(pos))
    for v in res["verts"]:
        v[layer] = (warm[0] * b, warm[1] * b, warm[2] * b, 1.0)
mesh = bpy.data.meshes.new("prach"); bm.to_mesh(mesh); bm.free()
dust = bpy.data.objects.new("prach", mesh); sc.collection.objects.link(dust); dust.data.materials.append(mat)

# ---------- světla ----------
sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 11.0; sun.color = (1.0, 0.95, 0.88); sun.angle = 0.08
so = bpy.data.objects.new("sun", sun); sc.collection.objects.link(so)
so.rotation_euler = TAIL.to_track_quat("-Z", "Y").to_euler()  # světlo svítí ve směru ohonu (ze Slunce k jádru)
fill = bpy.data.lights.new("fill", "SUN"); fill.energy = 0.2; fill.color = (0.5, 0.65, 1.0)
fo = bpy.data.objects.new("fill", fill); sc.collection.objects.link(fo); fo.rotation_euler = (math.radians(100), 0, math.radians(30))

add_camera((0, -10, 0), (0.0, 0, 0.1), ortho_scale=4.7)
render(lambda t: None)
