"""Motýl: mává křídly a plachtí po osmičce (plynulá smyčka, 48 snímků)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

FRAMES = 48
PREVIEW = "--preview" in args()
sc = reset(256, 256, FRAMES, samples=20, name="motyl")

orange = material("w1", "#ff9f2e", roughness=0.4)
yellow = material("w2", "#ffd34d", roughness=0.4)
pink = material("w3", "#ff6f91", roughness=0.4)
ink = material("ink", "#2b1a4a", roughness=0.5)
white = material("dot", "#fff6e0", roughness=0.4)

root = bpy.data.objects.new("root", None); sc.collection.objects.link(root)

def sphere(loc, scale, mat, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=28, ring_count=18, location=loc)
    o = bpy.context.object
    o.scale = scale
    o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    o.parent = parent
    return o

# tělo svisle po ose Z, hlava nahoře
sphere((0, 0, 0), (0.07, 0.07, 0.42), ink, root)
sphere((0, 0, 0.46), (0.085, 0.085, 0.085), ink, root)
for sx in (-1, 1):
    bpy.ops.curves.primitive_bezier_curve_add() if False else None

wings = {}
for side in (-1, 1):
    pivot = bpy.data.objects.new(f"pv{side}", None); sc.collection.objects.link(pivot); pivot.parent = root
    # horní velké křídlo + dolní menší, každé s pivotem v těle
    up = sphere((side * 0.40, 0, 0.17), (0.43, 0.022, 0.37), orange, pivot)
    low = sphere((side * 0.27, 0, -0.24), (0.27, 0.022, 0.25), yellow, pivot)
    for dx, dz, r, m in ((0.52, 0.28, 0.07, white), (0.36, 0.08, 0.05, white), (0.3, -0.30, 0.05, pink)):
        sphere((side * dx, -0.02, dz), (r, 0.016, r), m, pivot)
    wings[side] = pivot

add_sun((math.radians(55), math.radians(10), math.radians(-20)), energy=3.2)
add_area((-2, -5, 3), (0, 0, 0), energy=200, size=4, color="#fff7ea")
add_camera((0, -8, 0), (0, 0, 0), ortho_scale=2.2)

def update(t):
    flap = math.sin(t * math.tau * 3)  # 3 mávnutí za smyčku
    angle = math.radians(52 + 42 * flap)  # křídla se skládají dopředu až o ~94°
    # mávání = otáčení křídel kolem svislé osy těla (Z)
    wings[-1].rotation_euler = (0, 0, -angle)
    wings[1].rotation_euler = (0, 0, angle)
    # náklon těla a plachtění po osmičce
    root.location = (0.14 * math.sin(t * math.tau), 0, 0.10 * math.sin(t * math.tau * 2))
    root.rotation_euler = (math.radians(-18), 0, math.radians(10 * math.sin(t * math.tau)))

if PREVIEW:
    render(update, only_frames=[1, 5, 9, 13])
else:
    render(update)
