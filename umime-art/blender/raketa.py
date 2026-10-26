"""Raketa míří nahoru (CSS ji otáčí po dráze letu); plamen plynule plápolá, raketa se jemně chvěje."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *

FRAMES = 36
PREVIEW = "--preview" in args()
sc = reset(256, 320, FRAMES, samples=24, name="raketa")

white = material("body", "#f1f0f8", roughness=0.3, metallic=0.1)
red = material("red", "#ff5a3c", roughness=0.45)
glass = material("glass", "#8fd0ff", roughness=0.1, emission="#8fd0ff", emission_strength=0.35)
dark = material("dark", "#2a2750", roughness=0.5)
flame_o = material("fo", "#ff5a1e", emission="#ff5a1e", emission_strength=1.4, roughness=0.6)
flame_y = material("fy", "#ffe27a", emission="#ffe27a", emission_strength=3.6, roughness=0.6)

root = bpy.data.objects.new("root", None); sc.collection.objects.link(root)

def prim(kind, loc=(0, 0, 0), scale=(1, 1, 1), mat=None, **kw):
    if kind == "sphere": bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=24, location=loc, **kw)
    elif kind == "cone": bpy.ops.mesh.primitive_cone_add(vertices=32, location=loc, **kw)
    elif kind == "cyl": bpy.ops.mesh.primitive_cylinder_add(vertices=32, location=loc, **kw)
    elif kind == "torus": bpy.ops.mesh.primitive_torus_add(location=loc, **kw)
    o = bpy.context.object
    o.scale = scale
    if mat: o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    o.parent = root
    return o

prim("sphere", (0, 0, 0), (0.36, 0.36, 0.68), white, radius=1)              # trup
prim("cone", (0, 0, 0.78), (0.17, 0.17, 0.3), red, radius1=1, radius2=0.0, depth=1)  # špička
prim("torus", (0, -0.345, 0.12), (1, 1, 1), dark, major_radius=0.125, minor_radius=0.03, rotation=(math.radians(90), 0, 0))
prim("sphere", (0, -0.335, 0.12), (0.115, 0.04, 0.115), glass, radius=1)     # okénko
prim("cyl", (0, 0, -0.62), (0.22, 0.22, 0.12), dark, radius=1, depth=1)     # tryska
for a in (0, 120, 240):
    f = prim("sphere", (math.cos(math.radians(a)) * 0.36, math.sin(math.radians(a)) * 0.36, -0.40), (0.035, 0.2, 0.26), red, radius=1)
    f.rotation_euler = (0, 0, math.radians(a))

flame1 = prim("cone", (0, 0, -1.0), (0.2, 0.2, 0.62), flame_o, radius1=1, radius2=0.0, depth=1)
flame1.rotation_euler = (math.pi, 0, 0)
flame2 = prim("cone", (0, 0, -0.9), (0.11, 0.11, 0.4), flame_y, radius1=1, radius2=0.0, depth=1)
flame2.rotation_euler = (math.pi, 0, 0)

add_sun((math.radians(50), math.radians(10), math.radians(-30)), energy=3.0)
add_area((-3, -5, 3), (0, 0, 0), energy=220, size=5, color="#fff3e8")
add_camera((0, -8, 0), (0, 0, -0.1), ortho_scale=2.9)

def update(t):
    ph = t * math.tau
    root.location = (0.012 * math.sin(ph * 3), 0, 0.02 * math.sin(ph * 2))
    root.rotation_euler = (0, math.radians(1.5 * math.sin(ph * 3)), math.radians(1.2 * math.sin(ph * 2)))
    # plamen: délka a šířka kolísají v několika nesouměrných vlnách (smyčka po celých periodách)
    k = 1 + 0.16 * math.sin(ph * 6) + 0.08 * math.sin(ph * 11 + 1)
    flame1.scale = (0.2 * (1.06 - 0.08 * math.sin(ph * 6)), 0.2, 0.62 * k)
    flame1.location = (0, 0, -0.69 - 0.31 * k)
    flame2.scale = (0.11, 0.11, 0.4 * (1.0 + 0.2 * math.sin(ph * 9 + 2)))
    flame2.location = (0, 0, -0.69 - 0.2 * (1.0 + 0.2 * math.sin(ph * 9 + 2)))

if PREVIEW:
    render(update, only_frames=[1, 4, 7, 10])
else:
    render(update)
