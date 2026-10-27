"""Realističtější 3D dekorace přírodní zóny úvodní stránky (public/home/{motyl,list,beruska,houba,kapradi}.webp).

    python umime-art/scripts/dekor.py <výstupní složka> [slug ...]

Používá pomocné funkce z predmety.py (modul bpy, Cycles, průhledné pozadí, ořez na čtverec 512 × 512).
"""

import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Vector  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/dekor"
ONLY = sys.argv[2:]
sys.argv = sys.argv[:1]  # predmety.py čte argv při importu
import predmety as P  # noqa: E402

os.makedirs(OUT, exist_ok=True)
random.seed(11)
mat, finish, sph, cyl, box, curve_tube, noise_bump = P.mat, P.finish, P.sph, P.cyl, P.box, P.curve_tube, P.noise_bump


def mesh_obj(name, verts, faces, m, subsurf=0, solid=0.0):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if solid:
        s = o.modifiers.new("solid", "SOLIDIFY")
        s.thickness = solid
    finish(o, m, subsurf=subsurf)
    return o


def leaf_mesh(name, length, width, m, curl=0.12, fold=0.25, nx=14, ny=24, solid=0.012, droop=0.0):
    """List: hladká plocha s osovým záhybem; osa listu je +Y, špička v y = length."""
    verts, faces = [], []
    for j in range(ny + 1):
        t = j / ny
        w = width * (math.sin(math.pi * min(t * 0.98 + 0.01, 1)) ** 0.8) * (1 - 0.45 * t)
        for i in range(nx + 1):
            u = i / nx * 2 - 1
            x = u * w
            z = abs(u) * w * fold - curl * (t - 0.4) ** 2 - droop * t * t
            verts.append((x, t * length, z))
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + 1, a + nx + 2, a + nx + 1))
    return mesh_obj(name, verts, faces, m, subsurf=1, solid=solid)


def veined_leaf_mat(name, base, light, vein_scale=22, strength=0.35):
    m = mat(name, base, rough=0.45, coat=0.25, coat_rough=0.3, sss=0.25)
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.inputs["Scale"].default_value = vein_scale
    wv.inputs["Distortion"].default_value = 3
    wv.inputs["Detail"].default_value = 2
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (*base, 1)
    r.color_ramp.elements[1].color = (*light, 1)
    r.color_ramp.elements[0].position = 0.35
    r.color_ramp.elements[1].position = 0.55
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(tc.outputs["Object"], mp.inputs[0])
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(70))
    nt.links.new(mp.outputs[0], wv.inputs["Vector"])
    nt.links.new(wv.outputs["Fac"], r.inputs[0])
    nt.links.new(wv.outputs["Fac"], bump.inputs["Height"])
    b = nt.nodes["Principled BSDF"]
    nt.links.new(r.outputs[0], b.inputs["Base Color"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def list_():
    m = veined_leaf_mat("list", (0.1, 0.38, 0.08), (0.28, 0.62, 0.14))
    lf = leaf_mesh("list", 2.2, 0.8, m, curl=0.25, fold=0.22, droop=0.1)
    rib = mat("zilka", (0.35, 0.6, 0.2), rough=0.5)
    curve_tube("zilka", [(0, 0.0, 0.0), (0, 1.1, 0.07), (0, 2.1, 0.0)], 0.018, rib)
    stem = curve_tube("stopka", [(0, -0.45, -0.12), (0.05, -0.2, -0.05), (0, 0.0, 0.0)], 0.035, mat("stopka", (0.2, 0.45, 0.12), rough=0.5))
    # kapka rosy
    dew = mat("rosa", (1, 1, 1), rough=0.02, coat=1.0)
    dew.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1.0
    dew.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.33
    for x, y in ((0.12, 1.0), (-0.2, 1.4), (0.1, 0.6)):
        sph("rosa", 0.045, (x, y, 0.12), dew, scale=(1, 1, 0.6), seg=24)


def motyl():
    wing_o = mat("kridlo", (0.95, 0.4, 0.05), rough=0.55, sss=0.1)
    nt = wing_o.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 9
    vor.feature = "DISTANCE_TO_EDGE"
    gr = nt.nodes.new("ShaderNodeTexGradient")
    gr.gradient_type = "SPHERICAL"
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Location"].default_value = (-0.5, -0.5, 0)
    r = nt.nodes.new("ShaderNodeValToRGB")
    es = r.color_ramp.elements
    es[0].position = 0.0
    es[0].color = (0.03, 0.015, 0.01, 1)
    es[1].position = 0.6
    es[1].color = (1.0, 0.68, 0.1, 1)
    e = es.new(0.12)
    e.color = (0.15, 0.05, 0.01, 1)
    e = es.new(0.28)
    e.color = (0.9, 0.28, 0.02, 1)
    nt.links.new(tc.outputs["Generated"], mp.inputs[0])
    nt.links.new(mp.outputs[0], gr.inputs[0])
    nt.links.new(gr.outputs["Fac"], r.inputs[0])
    nt.links.new(r.outputs[0], nt.nodes["Principled BSDF"].inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.2
    nt.links.new(vor.outputs["Distance"], bump.inputs["Height"])
    nt.links.new(tc.outputs["Generated"], vor.inputs["Vector"])
    nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    dark = mat("telo", (0.05, 0.03, 0.02), rough=0.7)
    white = mat("tecky", (0.97, 0.95, 0.9), rough=0.5)

    def wing(name, sx, upper):
        N = 28
        pts = []
        # obrys křídla v polárních souřadnicích
        for k in range(N):
            a = k / N * 2 * math.pi
            if upper:
                r_ = 1.0 + 0.12 * math.cos(2 * (a - 0.4))
                x, y = math.cos(a) * 0.95 * r_ + 0.95, math.sin(a) * 0.85 * r_ + 0.4
            else:
                r_ = 1.0 + 0.1 * math.cos(3 * a)
                x, y = math.cos(a) * 0.62 * r_ + 0.62, math.sin(a) * 0.6 * r_ - 0.45
            pts.append((x, y))
        verts = [(0.0 if upper else 0.0, 0.0 if upper else -0.05, 0.0)] + [(sx * px, py, 0.0) for px, py in pts]
        # střed křídla uprostřed obrysu
        cx = sum(p[0] for p in pts) / N
        cy = sum(p[1] for p in pts) / N
        verts[0] = (sx * cx, cy, 0.0)
        faces = []
        for k in range(N):
            faces.append((0, 1 + k, 1 + (k + 1) % N) if sx > 0 else (0, 1 + (k + 1) % N, 1 + k))
        o = mesh_obj(name, verts, faces, wing_o, subsurf=2, solid=0.01)
        # zvednutí křídel do V
        for v in o.data.vertices:
            v.co.z = abs(v.co.x) * 0.28
        # zcela rovný UV pro Generated souřadnice je dán bounding boxem
        return o

    for sx in (1, -1):
        wing(f"horni_{sx}", sx, True)
        wing(f"dolni_{sx}", sx, False)
        for px, py in ((0.95, 0.75), (1.3, 0.35), (0.95, 0.1), (0.7, -0.6), (0.9, -0.35)):
            sph("tecka", 0.07 if py > 0 else 0.05, (sx * px, py, abs(px) * 0.28 + 0.04), white, scale=(1, 1, 0.3), seg=16)
    sph("hrudnik", 0.1, (0, 0.55, 0.1), dark, scale=(1, 1.8, 1))
    sph("bricho", 0.09, (0, -0.4, 0.06), dark, scale=(1, 5.0, 1))
    sph("hlava", 0.11, (0, 0.95, 0.12), dark)
    for sx in (-1, 1):
        sph("oko", 0.05, (sx * 0.08, 1.0, 0.16), mat("oko", (0.02, 0.02, 0.02), rough=0.05, coat=1), seg=16)
        curve_tube("tykadlo", [(sx * 0.04, 1.02, 0.18), (sx * 0.3, 1.5, 0.3), (sx * 0.52, 1.8, 0.28)], 0.012, dark)
        sph("tykadlo_k", 0.035, (sx * 0.52, 1.8, 0.28), dark, seg=12)


def beruska():
    red = mat("lak", (0.85, 0.03, 0.02), rough=0.12, coat=1.0, coat_rough=0.03)
    black = mat("cerna", (0.015, 0.015, 0.02), rough=0.45)
    white = mat("bila", (0.95, 0.95, 0.95), rough=0.2)
    leg = mat("noha", (0.03, 0.03, 0.03), rough=0.4)
    sph("krovky", 1.0, (0, 0, 0.35), red, scale=(0.95, 1.18, 0.68), seg=96)
    # škvíra mezi krovkami
    pts = [(-0.45, 0.35, 0.6), (0.45, 0.35, 0.6), (-0.58, -0.25, 0.55), (0.58, -0.25, 0.55), (-0.3, -0.75, 0.44), (0.3, -0.75, 0.44), (0.0, 0.8, 0.3)]
    for x, y, r in pts[:6]:
        # tečka přilepená na povrch kopule
        d = Vector((x / 0.95, y / 1.18, 0))
        zz = math.sqrt(max(0.0, 1 - d.x ** 2 - d.y ** 2)) * 0.68 + 0.35
        sph("tecka", 0.15, (x, y, zz - 0.015), black, scale=(1, 1, 0.3), seg=32)
    sph("stit", 0.62, (0, 1.02, 0.3), black, scale=(0.85, 0.5, 0.55), seg=48)
    sph("hlava", 0.3, (0, 1.3, 0.2), black, scale=(1.1, 0.8, 0.8), seg=48)
    for sx in (-1, 1):
        sph("oko", 0.08, (sx * 0.15, 1.5, 0.26), white, scale=(1, 0.6, 1.2), seg=24)
        sph("zornice", 0.035, (sx * 0.15, 1.56, 0.26), black, seg=12)
        curve_tube("tykadlo", [(sx * 0.1, 1.55, 0.3), (sx * 0.22, 1.85, 0.4), (sx * 0.42, 2.0, 0.38)], 0.014, leg)
        for k, y in enumerate((0.75, 0.2, -0.45)):
            curve_tube("noha", [(sx * 0.7, y, 0.3), (sx * 1.0, y + 0.1 * (1 - k), 0.35), (sx * 1.2, y + 0.18 * (1 - k), 0.0)], 0.03, leg)
    # list pod beruškou
    lf = leaf_mesh("podklad", 3.4, 1.2, veined_leaf_mat("podklad", (0.1, 0.4, 0.1), (0.25, 0.6, 0.15)), curl=0.0, fold=0.0, solid=0.02)
    lf.location = (0, -1.5, 0.0)
    lf.rotation_euler = (0, 0, 0)


def houba():
    red = mat("klobouk", (0.75, 0.05, 0.04), rough=0.28, coat=0.5, coat_rough=0.2, sss=0.15)
    noise_bump(red, 18, 0.1)
    white = mat("tecky", (0.97, 0.95, 0.9), rough=0.55)
    cream = mat("noha", (0.92, 0.86, 0.72), rough=0.6, sss=0.3)
    noise_bump(cream, 30, 0.2)
    gills = mat("lupeny", (0.85, 0.75, 0.6), rough=0.7)
    cap = [(0.0, 1.9), (0.35, 1.88), (0.75, 1.75), (1.05, 1.48), (1.2, 1.22), (1.22, 1.05), (1.12, 0.98), (0.5, 1.02), (0.0, 1.02)]
    P.lathe("klobouk", cap, (0, 0, 0), red, 96)
    P.lathe("noha", [(0.0, 0.0), (0.5, 0.0), (0.42, 0.15), (0.3, 0.6), (0.27, 1.0), (0.3, 1.1)], (0, 0, 0), cream, 64)
    P.lathe("lupeny", [(0.0, 1.03), (1.1, 1.0), (1.12, 0.98)], (0, 0, 0), gills, 64)
    ring = P.lathe("manzeta", [(0.28, 0.85), (0.6, 0.66), (0.62, 0.64), (0.28, 0.67)], (0, 0, 0), cream, 64)
    for _ in range(18):
        a = random.random() * math.tau
        rr = random.uniform(0.0, 1.0) ** 0.6 * 0.95
        # souřadnice na povrchu klobouku (aproximace profilu)
        zz = 1.9 - (rr / 1.2) ** 2 * 0.95 - 0.02 if rr < 1.1 else 1.2
        s = random.uniform(0.06, 0.15)
        sph("tecka", s, (rr * math.cos(a), rr * math.sin(a), zz + 0.01), white, scale=(1, 1, 0.3), seg=24)
    # tráva kolem
    grass = mat("trava", (0.15, 0.5, 0.12), rough=0.5, sss=0.2)
    for i in range(16):
        a = random.random() * math.tau
        r_ = random.uniform(0.6, 1.2)
        h = random.uniform(0.15, 0.35)
        x, y = r_ * math.cos(a), r_ * math.sin(a)
        curve_tube("stebla", [(x, y, 0), (x + random.uniform(-0.1, 0.1), y + random.uniform(-0.1, 0.1), h * 0.6), (x + random.uniform(-0.15, 0.15), y + random.uniform(-0.15, 0.15), h)], 0.012, grass, taper=[(0, 1), (1, 0.05)])


def kapradi():
    gm = mat("kapradi", (0.1, 0.45, 0.1), rough=0.45, sss=0.3, coat=0.15)
    gm2 = mat("kapradi2", (0.2, 0.6, 0.15), rough=0.45, sss=0.3, coat=0.15)
    stem = mat("stopka", (0.15, 0.38, 0.1), rough=0.5)
    pairs = 15
    for f in range(7):
        ang = (f / 6 - 0.5) * math.radians(150)
        L = 2.4 - abs(f - 3) * 0.2
        tilt = 0.55 + abs(f - 3) * 0.04
        # oblouk stopky
        pts = []
        for k in range(8):
            t = k / 7
            x = math.sin(ang) * t * L * 0.9
            y = math.cos(ang) * t * L * 0.9 - 0.3
            z = math.sin(t * math.pi * 0.75) * L * tilt - t * t * 0.6
            pts.append((x, y, max(z, 0.0)))
        curve_tube("stopka", pts, 0.028, stem, taper=[(0, 1), (1, 0.15)])
        # lístky podél stopky (Catmull-Rom z pts přes jednoduchou interpolaci)
        def at(t):
            tt = t * (len(pts) - 1)
            i = min(int(tt), len(pts) - 2)
            u = tt - i
            a, b = Vector(pts[i]), Vector(pts[i + 1])
            return a.lerp(b, u), (b - a).normalized()
        for k in range(pairs):
            t = 0.1 + 0.88 * k / pairs
            pos, tan = at(t)
            size = (1 - t) ** 0.8 * 0.6 + 0.07
            side = tan.cross(Vector((0, 0, 1))).normalized()
            if side.length < 0.1:
                side = Vector((1, 0, 0))
            for sx in (-1, 1):
                pin = leaf_mesh("listek", 0.62 * size + 0.05, 0.11 * size + 0.02, gm if k % 2 else gm2, curl=0.02, fold=0.4, nx=4, ny=8, solid=0.006)
                d = (side * sx + tan * 0.55).normalized()
                pin.location = pos
                pin.rotation_euler = d.to_track_quat("Y", "Z").to_euler()
                pin.rotation_euler.x += random.uniform(-0.08, 0.08)


BUILDERS = {"list": list_, "motyl": motyl, "beruska": beruska, "houba": houba, "kapradi": kapradi}
CAM = {"list": (-12, 55), "motyl": (-8, 58), "beruska": (-22, 40), "houba": (-18, 9), "kapradi": (-14, 38)}

if __name__ == "__main__":
    P.render_all(BUILDERS, CAM, ONLY, OUT, "")
