"""Planeta s prstencem a obíhajícím měsícem, plynulá smyčka (otáčení planety i oběh měsíce)."""
import math
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

FRAMES = 72
PREVIEW = "--preview" in args()
sc = reset(560, 372, FRAMES, samples=20 if not PREVIEW else 16, name="planeta")

# --- planeta: pruhy zvlněné šumem; otáčení kolem svislé osy je kvůli šumu dobře vidět
planet_mat = bpy.data.materials.new("planet")
planet_mat.use_nodes = True
nt = planet_mat.node_tree
nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Roughness"].default_value = 0.5
coord = nt.nodes.new("ShaderNodeTexCoord")
noise = nt.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 3.0
noise.inputs["Detail"].default_value = 3
noise.inputs["Distortion"].default_value = 0.4
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
mathadd = nt.nodes.new("ShaderNodeMath"); mathadd.operation = "MULTIPLY_ADD"
mathadd.inputs[1].default_value = 1.0; mathadd.inputs[2].default_value = 0.0
mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 12.0
sinn = nt.nodes.new("ShaderNodeMath"); sinn.operation = "SINE"
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.35
ramp.color_ramp.elements[0].color = hex_rgba("#6f63ff")
ramp.color_ramp.elements[1].position = 0.65
ramp.color_ramp.elements[1].color = hex_rgba("#f58bb0")
nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
nt.links.new(coord.outputs["Object"], sep.inputs[0])
# z + 0.35 * (šum - 0.5) -> sin(5 z) -> ramp
shift = nt.nodes.new("ShaderNodeMath"); shift.operation = "SUBTRACT"; shift.inputs[1].default_value = 0.5
nt.links.new(noise.outputs["Fac"], shift.inputs[0])
warp = nt.nodes.new("ShaderNodeMath"); warp.operation = "MULTIPLY_ADD"; warp.inputs[1].default_value = 0.55
nt.links.new(shift.outputs[0], warp.inputs[0])
nt.links.new(sep.outputs["Z"], warp.inputs[2])
nt.links.new(warp.outputs[0], mul.inputs[0])
nt.links.new(mul.outputs[0], sinn.inputs[0])
half = nt.nodes.new("ShaderNodeMath"); half.operation = "MULTIPLY_ADD"; half.inputs[1].default_value = 0.5; half.inputs[2].default_value = 0.5
nt.links.new(sinn.outputs[0], half.inputs[0])
nt.links.new(half.outputs[0], ramp.inputs[0])
nt.links.new(ramp.outputs[0], bsdf.inputs["Base Color"])
nt.links.new(bsdf.outputs[0], out.inputs[0])

bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=96, ring_count=64)
planet = bpy.context.object
planet.data.materials.append(planet_mat)
for p_ in planet.data.polygons: p_.use_smooth = True

# --- prsten: plochý disk s radiálními pruhy
bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=2.0, depth=0.02)
ring = bpy.context.object
ring.scale = (1, 1, 1)
rm = bpy.data.materials.new("ring"); rm.use_nodes = True
rn = rm.node_tree; rn.nodes.clear()
ro = rn.nodes.new("ShaderNodeOutputMaterial"); rb = rn.nodes.new("ShaderNodeBsdfPrincipled")
rb.inputs["Roughness"].default_value = 0.6
rc = rn.nodes.new("ShaderNodeTexCoord"); rv = rn.nodes.new("ShaderNodeVectorMath"); rv.operation = "LENGTH"
rr = rn.nodes.new("ShaderNodeMath"); rr.operation = "MULTIPLY"; rr.inputs[1].default_value = 22.0
rs = rn.nodes.new("ShaderNodeMath"); rs.operation = "SINE"
rh = rn.nodes.new("ShaderNodeMath"); rh.operation = "MULTIPLY_ADD"; rh.inputs[1].default_value = 0.5; rh.inputs[2].default_value = 0.5
rramp = rn.nodes.new("ShaderNodeValToRGB")
rramp.color_ramp.elements[0].color = hex_rgba("#d9b45e"); rramp.color_ramp.elements[1].color = hex_rgba("#f6dc9a")
# průhledná mezera mezi planetou a prstencem: alfa podle poloměru
mix = rn.nodes.new("ShaderNodeMixShader"); tr = rn.nodes.new("ShaderNodeBsdfTransparent")
cmp_in = rn.nodes.new("ShaderNodeMath"); cmp_in.operation = "LESS_THAN"; cmp_in.inputs[1].default_value = 1.35
rn.links.new(rc.outputs["Object"], rv.inputs[0])
rn.links.new(rv.outputs["Value"], rr.inputs[0])
rn.links.new(rr.outputs[0], rs.inputs[0]); rn.links.new(rs.outputs[0], rh.inputs[0]); rn.links.new(rh.outputs[0], rramp.inputs[0])
rn.links.new(rramp.outputs[0], rb.inputs["Base Color"])
rn.links.new(rv.outputs["Value"], cmp_in.inputs[0])
rn.links.new(cmp_in.outputs[0], mix.inputs[0])
rn.links.new(rb.outputs[0], mix.inputs[1]); rn.links.new(tr.outputs[0], mix.inputs[2])
rn.links.new(mix.outputs[0], ro.inputs[0])
ring.data.materials.append(rm)
ring.rotation_euler = (math.radians(-14), 0, math.radians(0))

# naklonění celé soustavy jako na dosavadním obrázku
pivot = bpy.data.objects.new("pivot", None); sc.collection.objects.link(pivot)
pivot.rotation_euler = (math.radians(20), math.radians(-16), 0)
ring.parent = pivot; planet.parent = pivot
ring.rotation_euler = (0, 0, 0)

# --- měsíc
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=48, ring_count=32)
moon = bpy.context.object
moon.data.materials.append(material("moon", "#cfc8ff", roughness=0.3))
for p in moon.data.polygons: p.use_smooth = True
moon.parent = pivot

add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=3.2)
add_area((-4, -6, 3), (0, 0, 0), energy=260, size=5, color="#cfd4ff")
add_camera((0, -9, 0.0), (0, 0, 0), ortho_scale=5.9)

def update(t):
    planet.rotation_euler = (0, 0, t * math.tau)
    a = t * math.tau
    moon.location = (2.5 * math.cos(a), 2.5 * math.sin(a), 0.0)

if PREVIEW:
    render(update, only_frames=[1, 19, 37])
else:
    render(update)
