"""Vlajka na vrcholu: látka se vlní po délce (čistě analytická vlna, plynulá smyčka, 48 snímků)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
import bmesh

FRAMES = 48
PREVIEW = "--preview" in args()
sc = reset(256, 256, FRAMES, samples=24, name="vlajka")

pole_m = material("pole", "#e9e4f7", roughness=0.35, metallic=0.2)
gold = material("gold", "#ffc933", roughness=0.3, metallic=0.4)
coral = material("coral", "#ff5a3c", roughness=0.55)
yellow = material("yel", "#ffd24d", roughness=0.55)
rock = material("rock", "#5a4d86", roughness=0.7)

# skála
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1)
r = bpy.context.object; r.scale = (0.8, 0.5, 0.28); r.location = (-0.05, 0, -0.9)
r.data.materials.append(rock)
# stožár a koule
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.03, depth=1.9, location=(-0.3, 0, 0.0))
pole = bpy.context.object; pole.data.materials.append(pole_m)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.065, location=(-0.3, 0, 0.98)); b = bpy.context.object
b.data.materials.append(gold)
for p in b.data.polygons: p.use_smooth = True

# látka: mřížka COLS x ROWS, upevněná na stožáru
COLS, ROWS = 30, 14
W, H = 1.1, 0.7
x0, ztop = -0.27, 0.9
mesh = bpy.data.meshes.new("cloth")
verts = [(0, 0, 0)] * ((COLS + 1) * (ROWS + 1))
faces, mats = [], []
for j in range(ROWS):
    for i in range(COLS):
        a = j * (COLS + 1) + i
        faces.append((a, a + 1, a + COLS + 2, a + COLS + 1))
        mats.append(0 if j < ROWS * 0.62 else 1)
mesh.from_pydata(verts, [], faces)
mesh.update()
cloth = bpy.data.objects.new("cloth", mesh); sc.collection.objects.link(cloth)
mesh.materials.append(coral); mesh.materials.append(yellow)
for p, mi in zip(mesh.polygons, mats):
    p.material_index = mi; p.use_smooth = True
solid = cloth.modifiers.new("solid", "SOLIDIFY"); solid.thickness = 0.012

def update(t):
    ph = t * math.tau
    for j in range(ROWS + 1):
        for i in range(COLS + 1):
            u, v = i / COLS, j / ROWS
            amp = 0.3 * (u ** 1.15)
            y = amp * math.sin(u * 7.0 - ph) + 0.03 * u * math.sin(v * 3 + ph * 2)
            sag = -0.07 * (u ** 2) * (1 + 0.4 * math.sin(ph - u * 3))
            lift = 0.06 * (u ** 1.2) * math.sin(u * 7.0 - ph + 1.4)
            mesh.vertices[j * (COLS + 1) + i].co = (x0 + u * W * (1 - 0.06 * abs(y)), y, ztop - v * H + sag + lift)
    mesh.update()

add_sun((math.radians(50), math.radians(15), math.radians(-30)), energy=3.4)
add_area((-3, -5, 3), (0, 0, 0), energy=220, size=5, color="#fff3e8")
add_camera((1.6, -7.4, 2.4), (0.1, 0, 0), ortho_scale=2.6)

if PREVIEW:
    render(update, only_frames=[1, 9, 17, 25])
else:
    render(update)
