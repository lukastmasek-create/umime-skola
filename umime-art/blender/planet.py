"""Planeta s prstencem a dvěma měsíci, plynulá smyčka (otáčení planety i oběh měsíců).

Plynný obr: zvlněné pásy v několika měřítcích, jemná vlákna mraků, velká bouře, reliéf mraků,
atmosférická záře na okraji, prsten s Cassiniho mezerou a jemným zrnem, který vrhá stín na planetu
(a planeta na něj), a měsíce s krátery. Spuštění: python umime-art/blender/planet.py [--preview]
"""
import math
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

# FRAMES=180 dá 60 fps při smyčce 3 s; SAMPLES a velikost jdou přepsat proměnnými prostředí.
FRAMES = int(os.environ.get("FRAMES", 72))
PREVIEW = "--preview" in args()
W, H = int(os.environ.get("WIDTH", 672)), int(os.environ.get("HEIGHT", 446))
sc = reset(W, H, FRAMES, fps=int(os.environ.get("FPS", 24)), samples=int(os.environ.get("SAMPLES", 48)) if not PREVIEW else 20, name="planeta", world=("#3a2f7a", 0.02))
sc.cycles.max_bounces = 6
sc.cycles.transparent_max_bounces = 16


class NT:
    """Malá pomůcka na skládání shaderových uzlů."""

    def __init__(self, mat):
        mat.use_nodes = True
        self.nt = mat.node_tree
        self.nt.nodes.clear()

    def node(self, kind, **props):
        n = self.nt.nodes.new(kind)
        for k, v in props.items():
            if k in ("operation", "blend_type", "data_type", "feature"):
                setattr(n, k, v)
            else:
                n.inputs[k].default_value = v
        return n

    def connect(self, src, dst, out=0, inp=0):
        self.nt.links.new(src.outputs[out], dst.inputs[inp])

    def _feed(self, node, idx, v):
        if hasattr(v, "outputs"):
            self.nt.links.new(v.outputs[0], node.inputs[idx])
        elif v is not None:
            node.inputs[idx].default_value = v

    def math(self, op, a=None, b=None, c=None, clamp=False):
        n = self.nt.nodes.new("ShaderNodeMath")
        n.operation = op
        n.use_clamp = clamp
        for i, v in enumerate((a, b, c)):
            self._feed(n, i, v)
        return n

    def ramp(self, fac, stops):
        r = self.nt.nodes.new("ShaderNodeValToRGB")
        els = r.color_ramp.elements
        while len(els) < len(stops):
            els.new(0.5)
        for e, (pos, col) in zip(els, stops):
            e.position = pos
            e.color = hex_rgba(col)
        self.nt.links.new(fac.outputs[0], r.inputs[0])
        return r

    def gray(self, value_node):
        """Skalár na šedou barvu (kvůli násobení barev)."""
        c = self.node("ShaderNodeCombineColor")
        for ch in ("Red", "Green", "Blue"):
            self.nt.links.new(value_node.outputs[0], c.inputs[ch])
        return c

    def multiply_color(self, color_node, gray_node):
        m = self.node("ShaderNodeMix", data_type="RGBA", blend_type="MULTIPLY")
        m.inputs[0].default_value = 1.0
        self.nt.links.new(color_node.outputs[0], m.inputs[6])
        self.nt.links.new(self.gray(gray_node).outputs[0], m.inputs[7])
        return m


# --- planeta -----------------------------------------------------------------------------
pm = bpy.data.materials.new("planet")
T = NT(pm)
coord = T.node("ShaderNodeTexCoord")
sep = T.node("ShaderNodeSeparateXYZ")
T.connect(coord, sep, "Object", 0)
n_big = T.node("ShaderNodeTexNoise", Scale=1.9, Detail=6.0, Roughness=0.55, Distortion=0.5)
n_fine = T.node("ShaderNodeTexNoise", Scale=11.0, Detail=9.0, Roughness=0.6, Distortion=0.3)
n_grain = T.node("ShaderNodeTexNoise", Scale=38.0, Detail=5.0, Roughness=0.6)
for nn in (n_big, n_fine, n_grain):
    T.connect(coord, nn, "Object", "Vector")

# zeměpisná šířka zvlněná šumem: z + 0.34 * velký šum + 0.07 * jemný šum
big = T.math("SUBTRACT", n_big, 0.5)
fine = T.math("SUBTRACT", n_fine, 0.5)
zadd = T.math("ADD", None, T.math("MULTIPLY", big, 0.34))
T.nt.links.new(sep.outputs["Z"], zadd.inputs[0])
warp = T.math("ADD", zadd, T.math("MULTIPLY", fine, 0.07))
b1 = T.math("SINE", T.math("MULTIPLY", warp, 9.5))
b2 = T.math("MULTIPLY", T.math("SINE", T.math("MULTIPLY_ADD", warp, 27.0, 1.3)), 0.32)
b3 = T.math("MULTIPLY", T.math("SINE", T.math("MULTIPLY", warp, 61.0)), 0.1)
band = T.math("MULTIPLY_ADD", T.math("ADD", T.math("ADD", b1, b2), b3), 0.4, 0.5, clamp=True)
base = T.ramp(band, [(0.0, "#1a1560"), (0.3, "#4a3fc9"), (0.5, "#8e66cf"), (0.72, "#e07aa8"), (1.0, "#f6c3cf")])

# velká bouře: oválná skvrna na jižní polokouli, okraj roztřepený šumem
center = T.node("ShaderNodeCombineXYZ", X=0.52, Y=-0.62, Z=-0.32)
vsub = T.node("ShaderNodeVectorMath", operation="SUBTRACT")
T.connect(coord, vsub, "Object", 0)
T.connect(center, vsub, 0, 1)
vscale = T.node("ShaderNodeVectorMath", operation="MULTIPLY")
vscale.inputs[1].default_value = (1.0, 1.0, 1.9)
T.connect(vsub, vscale, 0, 0)
dist = T.node("ShaderNodeVectorMath", operation="LENGTH")
T.connect(vscale, dist, 0, 0)
swirl = T.math("ADD", None, T.math("MULTIPLY", fine, 0.35))
T.nt.links.new(dist.outputs["Value"], swirl.inputs[0])
storm = T.math("POWER", T.math("SUBTRACT", 1.0, T.math("DIVIDE", swirl, 0.34, clamp=True), clamp=True), 0.8)
storm_col = T.ramp(storm, [(0.0, "#e07aa8"), (0.5, "#f6b3c4"), (1.0, "#ffe3dc")])
mixed = T.node("ShaderNodeMix", data_type="RGBA")
T.connect(storm, mixed, 0, 0)
T.connect(base, mixed, 0, 6)
T.connect(storm_col, mixed, 0, 7)
grain = T.math("MULTIPLY_ADD", n_grain, 0.22, 0.89)
tint = T.multiply_color(mixed, grain)  # mixed má výstup Result (index 2)
T.nt.links.new(mixed.outputs[2], tint.inputs[6])

height = T.math("ADD", T.math("MULTIPLY", band, 0.6), T.math("MULTIPLY", n_fine, 0.5))
bump = T.node("ShaderNodeBump", Strength=0.45, Distance=0.035)
T.connect(height, bump, 0, "Height")
bsdf = T.node("ShaderNodeBsdfPrincipled", Roughness=0.5)
T.nt.links.new(tint.outputs[2], bsdf.inputs["Base Color"])
T.connect(bump, bsdf, 0, "Normal")
bsdf.inputs["Specular IOR Level"].default_value = 0.35
# atmosférická záře při okraji
lw = T.node("ShaderNodeLayerWeight", Blend=0.12)
fres = T.math("POWER", None, 5.0)
T.nt.links.new(lw.outputs["Fresnel"], fres.inputs[0])
emit = T.node("ShaderNodeEmission")
emit.inputs["Color"].default_value = hex_rgba("#9a86ff")
T.nt.links.new(T.math("MULTIPLY", fres, 1.1).outputs[0], emit.inputs["Strength"])
add = T.node("ShaderNodeAddShader")
T.connect(bsdf, add, 0, 0)
T.connect(emit, add, 0, 1)
T.connect(add, T.node("ShaderNodeOutputMaterial"), 0, 0)

bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=160, ring_count=96)
planet = bpy.context.object
planet.data.materials.append(pm)
for p_ in planet.data.polygons:
    p_.use_smooth = True

# atmosféra: průsvitná slupka s hranovou září (nevrhá stín)
am = bpy.data.materials.new("atmo")
A = NT(am)
alw = A.node("ShaderNodeLayerWeight", Blend=0.25)
apow = A.math("POWER", None, 8.0)
A.nt.links.new(alw.outputs["Fresnel"], apow.inputs[0])
aem = A.node("ShaderNodeEmission", Strength=0.45)
aem.inputs["Color"].default_value = hex_rgba("#a99bff")
atr = A.node("ShaderNodeBsdfTransparent")
amix = A.node("ShaderNodeMixShader")
A.connect(apow, amix, 0, 0)
A.connect(atr, amix, 0, 1)
A.connect(aem, amix, 0, 2)
A.connect(amix, A.node("ShaderNodeOutputMaterial"), 0, 0)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.03, segments=96, ring_count=48)
atmo = bpy.context.object
atmo.data.materials.append(am)
atmo.visible_shadow = False
for p_ in atmo.data.polygons:
    p_.use_smooth = True

# --- prsten ------------------------------------------------------------------------------
rm = bpy.data.materials.new("ring")
R = NT(rm)
rcoord = R.node("ShaderNodeTexCoord")
rlen = R.node("ShaderNodeVectorMath", operation="LENGTH")
R.connect(rcoord, rlen, "Object", 0)
IN, OUTR = 1.42, 2.4
sub = R.math("SUBTRACT", None, IN)
R.nt.links.new(rlen.outputs["Value"], sub.inputs[0])
t = R.math("DIVIDE", sub, OUTR - IN, clamp=True)
rn1 = R.node("ShaderNodeTexNoise", Scale=60.0, Detail=2.0, Roughness=0.5)
R.connect(rcoord, rn1, "Object", "Vector")
fine_rings = R.math("MULTIPLY_ADD", R.math("SINE", R.math("MULTIPLY", t, 150.0)), 0.5, 0.5)
mid_rings = R.math("MULTIPLY_ADD", R.math("SINE", R.math("MULTIPLY", t, 46.0)), 0.5, 0.5)
dens = R.math("MULTIPLY_ADD", fine_rings, 0.35, mid_rings)
dens = R.math("MULTIPLY", dens, R.math("MULTIPLY_ADD", rn1, 0.4, 0.4))
rcol = R.ramp(t, [(0.0, "#8d6f45"), (0.25, "#d9b45e"), (0.5, "#f1d795"), (0.75, "#c79e57"), (1.0, "#e6cf9f")])
rshade = R.multiply_color(rcol, R.math("MULTIPLY_ADD", dens, 0.7, 0.55, clamp=True))
# průhlednost: Cassiniho mezera (t ≈ 0.50), slabý vnitřní a vnější okraj
aramp = R.ramp(t, [(0.0, "#000000"), (0.06, "#707070"), (0.44, "#e8e8e8"), (0.47, "#101010"), (0.53, "#101010"), (0.56, "#dcdcdc"), (0.93, "#cfcfcf"), (1.0, "#000000")])
asep = R.node("ShaderNodeSeparateColor")
R.connect(aramp, asep, 0, 0)
alpha = R.nt.nodes.new("ShaderNodeMath")
alpha.operation = "MULTIPLY"
alpha.use_clamp = True
R.nt.links.new(asep.outputs["Red"], alpha.inputs[0])
R.nt.links.new(R.math("MULTIPLY_ADD", dens, 0.9, 0.35, clamp=True).outputs[0], alpha.inputs[1])
rb = R.node("ShaderNodeBsdfPrincipled", Roughness=0.7)
R.nt.links.new(rshade.outputs[2], rb.inputs["Base Color"])
rtr = R.node("ShaderNodeBsdfTransparent")
rmix = R.node("ShaderNodeMixShader")
R.connect(alpha, rmix, 0, 0)
R.connect(rtr, rmix, 0, 1)
R.connect(rb, rmix, 0, 2)
R.connect(rmix, R.node("ShaderNodeOutputMaterial"), 0, 0)
bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=OUTR, depth=0.012)
ring = bpy.context.object
ring.data.materials.append(rm)

pivot = bpy.data.objects.new("pivot", None)
sc.collection.objects.link(pivot)
pivot.rotation_euler = (math.radians(22), math.radians(-16), 0)
for o in (ring, planet, atmo):
    o.parent = pivot


# --- měsíce s krátery -----------------------------------------------------------------------
def moon_mat(name, color):
    m = bpy.data.materials.new(name)
    M_ = NT(m)
    c = M_.node("ShaderNodeTexCoord")
    v = M_.node("ShaderNodeTexVoronoi", feature="F1", Scale=6.0, Randomness=0.9)
    M_.connect(c, v, "Object", "Vector")
    crater = M_.ramp(v, [(0.0, "#ffffff"), (0.45, "#9a9a9a"), (0.7, "#e0e0e0"), (1.0, "#ffffff")])
    csep = M_.node("ShaderNodeSeparateColor")
    M_.connect(crater, csep, 0, 0)
    nz = M_.node("ShaderNodeTexNoise", Scale=5.0, Detail=6.0)
    M_.connect(c, nz, "Object", "Vector")
    h = M_.math("ADD", None, nz)
    M_.nt.links.new(csep.outputs["Red"], h.inputs[0])
    bp = M_.node("ShaderNodeBump", Strength=0.55, Distance=0.03)
    M_.connect(h, bp, 0, "Height")
    base_c = M_.node("ShaderNodeRGB")
    base_c.outputs[0].default_value = hex_rgba(color)
    shade = M_.math("MULTIPLY_ADD", None, 0.35, 0.68)
    M_.nt.links.new(csep.outputs["Red"], shade.inputs[0])
    col = M_.multiply_color(base_c, shade)
    b = M_.node("ShaderNodeBsdfPrincipled", Roughness=0.7)
    M_.nt.links.new(col.outputs[2], b.inputs["Base Color"])
    M_.connect(bp, b, 0, "Normal")
    M_.connect(b, M_.node("ShaderNodeOutputMaterial"), 0, 0)
    return m


def make_moon(r, color):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=64, ring_count=40)
    o = bpy.context.object
    o.data.materials.append(moon_mat("moon", color))
    for p_ in o.data.polygons:
        p_.use_smooth = True
    o.parent = pivot
    return o


moon1 = make_moon(0.21, "#d9d2ff")
moon2 = make_moon(0.1, "#ffd6c4")

# --- světla ---------------------------------------------------------------------------------
add_sun((math.radians(80), math.radians(0), math.radians(-98)), energy=9.0, color="#fff0e0", angle=0.08)
add_area((1, -7, 1.5), (0, 0, 0), energy=26, size=6, color="#7f8dff")
add_area((6, 3, 1.0), (0, 0, 0), energy=55, size=4, color="#c07bff")
add_camera((0, -9, 0.0), (0, 0, 0), ortho_scale=6.5)


def update(t):
    planet.rotation_euler = (0, 0, t * math.tau)
    a = t * math.tau
    moon1.location = (2.55 * math.cos(a), 2.55 * math.sin(a), 0.0)
    b = t * math.tau * 2 + 1.7
    moon2.location = (3.0 * math.cos(b), 3.0 * math.sin(b), 0.25 * math.sin(b))


if PREVIEW:
    render(update, only_frames=[1, 19, 37])
else:
    render(update)
