"""Raketa (ogivální špička, žebra, dvě okénka) parkující za oknem vesmírné stanice (smyčka 12 snímků, 512 × 384, 125 px na jednotku):
jemně se vznáší, z trysky šlehá plamen a bliká signální světlo. Střed trupu je ve středu obrázku."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
W, H, N = 640, 384, 12
PPU = 125.0
EL = math.radians(26)
_M = {}


def M(name, color, roughness=0.4, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


sc = reset(W, H, N, samples=24 if PREVIEW else 96, name="kosmicka_raketa", world=("#1a2250", 0.6), view="AgX", look="AgX - Punchy")
sc.view_settings.exposure = 0.4
sc.render.film_transparent = True
add_camera((0, -60 * math.cos(EL), 60 * math.sin(EL)), (0, 0, 0), ortho_scale=W / PPU)
add_sun((math.radians(50), math.radians(10), math.radians(-35)), energy=3.4, color="#d6e4ff", angle=0.3)
add_area((6, -9, 8), (0, 0, 1), energy=500, size=10, color="#a8c4ff")
add_area((-6, -6, 3), (0, 0, 1), energy=200, size=8, color="#ff9ad8")

root = bpy.data.objects.new("raketa", None)
bpy.context.scene.collection.objects.link(root)


def lathe(profile, name, mat, segs=64):
    """Rotační těleso kolem osy X z profilu [(x, poloměr), ...] (špička míří do +x)."""
    bm = bmesh.new()
    rings = [[bm.verts.new((x, r * math.cos(i / segs * math.tau), r * math.sin(i / segs * math.tau))) for i in range(segs)] for x, r in profile]
    for k in range(len(rings) - 1):
        for i in range(segs):
            j = (i + 1) % segs
            try:
                bm.faces.new((rings[k][i], rings[k + 1][i], rings[k + 1][j], rings[k][j]))
            except ValueError:
                pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    o.parent = root
    return o


def part(o):
    o.parent = root
    return o


# Trup: válec s ostrou, plynule zaoblenou špičkou (tečná ogiva) a kuželem tryskové sekce vzadu. Špička míří do +x.
R, XT, XB, XN = 0.5, 1.83, 0.72, -1.55
LN = XT - XB
rho = (R * R + LN * LN) / (2 * R)
nose = [(XB + LN * k / 14, math.sqrt(max(0.0, rho * rho - (LN * k / 14) ** 2)) + R - rho) for k in range(15)]
nose[-1] = (XT, 0.0)
tail = [(XN - 0.1, 0.34), (XN, 0.36), (XN + 0.18, 0.43), (XN + 0.45, 0.5)]
body_mat, nose_mat = M("trup", "#f4f6fb", 0.28, 0.25), M("nos", "#e03a2c", 0.3, 0.15)
lathe([(x, R) for x in (-1.1, -0.6, 0.0, 0.5)] + nose[:1], "trup", body_mat)
lathe(nose, "nos", body_mat)
# červená špička (horních 38 %) a pásy: každý je tenká obálka kolem trupu
cap = [(x, r * 1.012) for x, r in nose if x > XT - 0.42] + [(XT, 0.0)]
lathe(cap, "spicka", nose_mat)
for x0, x1, col in ((-0.35, -0.2, "#e03a2c"), (0.28, 0.4, "#2f4a8a")):
    lathe([(x0, R * 1.012), (x1, R * 1.012)], "pas", M("pas" + col, col, 0.35, 0.1))
lathe([(XN - 0.1, 0.34), (XN, 0.36), (XN + 0.18, 0.43), (XN + 0.45, 0.5)], "tryskovy", M("tryska", "#434b6a", 0.3, 0.8))
lathe([(XN - 0.12, 0.30), (XN - 0.12, 0.34), (XN, 0.38)], "ret", M("ret", "#2a2f48", 0.4, 0.7))
part(sphere((0.65, -0.43, 0.06), 0.26, M("okno_r", "#46d6ff", 0.06, 0.1), scale=(1, 0.42, 1), seg=24, rings=14))
part(torus((0.65, -0.465, 0.06), 0.27, 0.045, M("okno_k", "#aab4cc", 0.25, 0.7), rot=(math.pi / 2, 0, 0)))
part(sphere((-0.3, -0.48, 0.04), 0.13, M("okno_m", "#46d6ff", 0.06, 0.1), scale=(1, 0.4, 1), seg=20, rings=12))
part(torus((-0.3, -0.495, 0.04), 0.14, 0.03, M("okno_k", "#aab4cc", 0.25, 0.7), rot=(math.pi / 2, 0, 0)))
# žebra: tři zakřivená křídla (dvě viditelná z boku, jedno nahoře) s fasetou
def fin(angle):
    bm = bmesh.new()
    pts = [(-0.55, 0.0), (-1.55, 0.1), (-1.72, 0.9), (-1.2, 0.72), (-0.75, 0.42)]
    th = 0.045
    va = [bm.verts.new((x, -th / 2, 0.48 + z)) for x, z in pts]
    vb = [bm.verts.new((x, th / 2, 0.48 + z)) for x, z in pts]
    bm.faces.new(va[::-1])
    bm.faces.new(vb)
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bm.faces.new((va[i], va[j], vb[j], vb[i]))
    me = bpy.data.meshes.new("zebro")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("zebro", me)
    bpy.context.scene.collection.objects.link(o)
    me.materials.append(M("kridlo", "#e03a2c", 0.35, 0.15))
    bev = o.modifiers.new("bevel", "BEVEL")
    bev.width = 0.02
    bev.segments = 3
    for p in me.polygons:
        p.use_smooth = True
    o.rotation_euler = (angle, 0, 0)
    return part(o)


for k in range(3):
    fin(math.radians(90 + 120 * k - 90))
flame = part(cone((XN - 0.45, 0, 0), 0.34, 0.0, 0.9, glow("plamen", "#ffb347", 8.0), verts=24, rot=(0, math.radians(90), 0)))
core = part(cone((XN - 0.3, 0, 0), 0.18, 0.0, 0.55, glow("plamenJ", "#fff1a8", 12.0), verts=16, rot=(0, math.radians(90), 0)))
beacon = part(sphere((0.2, 0, 0.55), 0.06, glow("maják", "#ff6fd0", 8.0), seg=10, rings=8))
root.rotation_euler = (0, 0, math.radians(-8))


def update(t):
    ph = t * math.tau
    root.location = (0.544, 0, 0.07 * math.sin(ph))
    root.rotation_euler = (0.03 * math.sin(ph + 1.0), 0.03 * math.sin(ph), math.radians(-8))
    f = 1 + 0.18 * math.sin(6 * ph) + 0.1 * math.sin(11 * ph)
    flame.scale = (f, 1, 1)
    core.scale = (1.15 - 0.15 * f, 1, 1)
    set_glow(beacon.data.materials[0], 2.0 + 7.0 * max(0.0, math.sin(2 * ph)))


run(update, "kosmicka_raketa")
