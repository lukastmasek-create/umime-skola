"""Plachetnice pro mapu kurzů (souostroví): pohled z boku, míří doprava, plachty se nadouvají (12 snímků)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

S = 256
reset(S, S, 12, samples=96, name="svet_lod", world=("#9fb4ff", 0.5))
bpy.context.scene.render.film_transparent = True
add_sun((math.radians(52), math.radians(12), math.radians(-40)), energy=3.4)
add_area((-3, -6, 4), (0, 0, 0.5), energy=300, size=6, color="#fff1e2")
add_camera((0, -10, 2.2), (0, 0, 0.75), ortho_scale=2.6)

hull_w, hull_r, wood, rope = material("trup", "#f4f1e8", roughness=0.4), material("pas", "#d7392b", roughness=0.4), material("drevo", "#8a5a34", roughness=0.6), material("lano", "#c9b48a", roughness=0.8)
sail_m = material("plachta", "#fffaf0", roughness=0.7)
sail_r = material("plachta2", "#ff5a3c", roughness=0.7)
blue = material("modra", "#3b7be0", roughness=0.45)

# trup: protáhlý ellipsoid přeříznutý palubou
sphere((0, 0, 0.05), 0.5, hull_w, scale=(1.7, 0.55, 0.42), seg=48, rings=24)
box((0, 0, 0.18), (1.7, 0.78, 0.05), wood, bevel=0.02)                         # paluba
for k in range(7):
    box((-0.65 + k * 0.22, 0, 0.215), (0.012, 0.74, 0.012), material("pr", "#6b4a2d"), bevel=0)  # prkna
torus((0, 0, 0.0), 0.43, 0.025, hull_r, rot=(0, 0, 0))
cyl((0, 0, 0.02), 0.5, 0.05, hull_r, verts=40).scale = (1.7, 0.55, 1)
box((0.28, 0, 0.3), (0.42, 0.34, 0.2), hull_w, bevel=0.03)                     # kajuta
for k in range(3):
    cyl((0.18 + k * 0.14, -0.175, 0.3), 0.035, 0.02, blue, verts=16, rot=(math.radians(90), 0, 0))
bar((0.0, 0, 0.2), (0.0, 0, 1.55), 0.025, wood, verts=10)                       # stěžeň
sphere((0.0, 0, 1.58), 0.04, material("zlato", "#ffc933", roughness=0.3, metallic=0.9), seg=12, rings=8)
bar((0.0, 0, 0.45), (-0.62, 0, 0.45), 0.018, wood, verts=8)                     # ráhno
bar((0.0, 0, 0.2), (0.75, 0, 0.55), 0.012, rope, verts=6)                       # lano k přídi
bar((0.0, 0, 1.5), (-0.85, 0, 0.22), 0.01, rope, verts=6)
bar((0.0, 0, 1.5), (0.85, 0, 0.22), 0.01, rope, verts=6)
# plachty: dvě pole látky, které se nadouvají a lehce vlají (periodicky)
main = Flag((0.0, 0, 1.45), 0.0, 0.0, [sail_m], lambda u, v: 0, cols=2, rows=2) if False else None


class Sail:
    def __init__(self, pts, mat, name):
        self.pts = pts
        me = bpy.data.meshes.new(name)
        cols, rows = 16, 16
        self.cols, self.rows = cols, rows
        faces = [(j * (cols + 1) + i, j * (cols + 1) + i + 1, (j + 1) * (cols + 1) + i + 1, (j + 1) * (cols + 1) + i) for j in range(rows) for i in range(cols)]
        me.from_pydata([(0, 0, 0)] * ((cols + 1) * (rows + 1)), [], faces)
        me.materials.append(mat)
        for p in me.polygons:
            p.use_smooth = True
        self.me = me
        o = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(o)
        s = o.modifiers.new("solid", "SOLIDIFY")
        s.thickness = 0.012
        self.update(0)

    def update(self, t):
        ph = t * math.tau
        tl, tr, bl, br = self.pts  # roh nahoře u stěžně, nahoře vzadu, dole u stěžně, dole vzadu
        for j in range(self.rows + 1):
            v = j / self.rows
            for i in range(self.cols + 1):
                u = i / self.cols
                base = [tl[k] * (1 - u) * (1 - v) + tr[k] * u * (1 - v) + bl[k] * (1 - u) * v + br[k] * u * v for k in range(3)]
                belly = 0.16 * math.sin(u * math.pi) * math.sin(v * math.pi) * (1 + 0.15 * math.sin(ph))
                flutter = 0.03 * math.sin(ph - u * 5 + v * 2) * u
                self.me.vertices[j * (self.cols + 1) + i].co = (base[0], base[1] + belly + flutter, base[2])
        self.me.update()


main = Sail([(-0.03, 0, 1.45), (-0.78, 0, 0.5), (-0.03, 0, 0.48), (-0.62, 0, 0.48)], sail_m, "hlavni")
fore = Sail([(0.03, 0, 1.4), (0.03, 0, 0.5), (0.03, 0, 0.5), (0.74, 0, 0.5)], sail_r, "predni")
fore.pts = [(0.04, 0, 1.38), (0.04, 0, 0.5), (0.04, 0, 0.5), (0.8, 0, 0.5)]
flag = Flag((0.01, 0, 1.55), 0.3, 0.17, [material("v1", "#3b7be0"), material("v2", "#ffd24d")], lambda u, v: 1 if u > 0.5 else 0, cols=12, rows=6, amp=0.05, waves=1.5, droop=0.01)
foam = [sphere((0, 0, 0), 0.05, material("pena", "#ffffff", roughness=1.0), scale=(1.4, 1, 0.5), seg=10, rings=8) for _ in range(6)]


def update(t):
    main.update(t)
    fore.update(t + 0.2)
    flag.update(t)
    for i, f in enumerate(foam):
        u = (t + i / 6.0) % 1.0
        f.location = (-0.85 - 0.5 * u, 0.0, 0.02)
        q = 1 - u
        f.scale = (1.4 * q + 0.1, q + 0.1, 0.4)


run(update, "svet_lod")
