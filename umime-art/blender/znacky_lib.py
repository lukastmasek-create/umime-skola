"""Pomůcky pro památky předmětů na globusu (znacky_*.py).

Každá památka je malá hračková scéna na kulatém podstavci, snímaná ortografickou kamerou mírně
shora. Scéna dodá funkci update(t), kde t = 0..1 je poloha ve smyčce; vše se musí v t = 1 vrátit
do stavu v t = 0 (proto jen sinusy s celým počtem period, kruhové dráhy a pád s modulem).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa: E402,F401,F403
import bmesh  # noqa: E402

FRAMES = 24
SIZE = 448
ORTHO = 4.2  # šířka záběru ve scéně; podstavec (poloměr 1.2) se vejde i s vlajkami
TARGET_Z = 1.3  # kam kamera míří: podstavec je pak ve spodní čtvrtině obrázku


def setup(name, samples=96, size=SIZE, frames=FRAMES, az=-28, el=19, ortho=ORTHO, target_z=TARGET_Z, world=("#bcd0ff", 0.65)):
    sc = reset(size, size, frames, samples=samples, name=name, world=world)
    a, e, d = math.radians(az), math.radians(el), 14.0
    add_camera((math.sin(a) * math.cos(e) * d, -math.cos(a) * math.cos(e) * d, math.sin(e) * d + target_z), (0, 0, target_z), ortho_scale=ortho)
    add_sun((math.radians(48), math.radians(12), math.radians(-38)), energy=3.6)
    add_area((-4, -5, 4), (0, 0, 1), energy=260, size=6, color="#fff1e2")
    add_area((5, 3, 3), (0, 0, 1), energy=70, size=5, color="#9fb8ff")
    return sc


def _finish(obj, mat, smooth=True, bevel=0.0):
    if mat is not None:
        obj.data.materials.append(mat)
    if smooth and obj.type == "MESH":
        for p in obj.data.polygons:
            p.use_smooth = True
    if bevel:
        m = obj.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = 2
        m.limit_method = "ANGLE"
    return obj


def box(loc, size, mat, rot=(0, 0, 0), bevel=0.012, smooth=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.scale = size
    o.rotation_euler = rot
    return _finish(o, mat, smooth, bevel)


def cyl(loc, r, h, mat, verts=28, rot=(0, 0, 0), smooth=True, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc)
    o = bpy.context.object
    o.rotation_euler = rot
    return _finish(o, mat, smooth, bevel)


def cone(loc, r1, r2, h, mat, verts=28, rot=(0, 0, 0), smooth=True):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=h, location=loc)
    o = bpy.context.object
    o.rotation_euler = rot
    return _finish(o, mat, smooth)


def sphere(loc, r, mat, scale=(1, 1, 1), seg=24, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=rings)
    o = bpy.context.object
    o.scale = scale
    return _finish(o, mat)


def torus(loc, R, r, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=R, minor_radius=r, major_segments=40, minor_segments=12)
    o = bpy.context.object
    o.rotation_euler = rot
    return _finish(o, mat)


def bar(p1, p2, r, mat, verts=8):
    """Válcová tyč mezi dvěma body (pro příhradové konstrukce)."""
    a, b = Vector(p1), Vector(p2)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.object
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    return _finish(o, mat, smooth=False)


def mesh_obj(name, verts, faces, mat, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    if mat is not None:
        me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = smooth
    return o


def prism(x0, x1, y0, y1, z0, zpeak, mat):
    """Sedlová střecha: obdélníkový půdorys x0..x1, y0..y1, hřeben nad středem v ose x."""
    xm = (x0 + x1) / 2
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (xm, y0, zpeak), (xm, y1, zpeak)]
    f = [(0, 1, 4), (3, 5, 2), (0, 4, 5, 3), (1, 2, 5, 4), (0, 3, 2, 1)]
    return mesh_obj("strecha", v, f, mat)


def plinth(top="#7fcf7a", ring="#ffffff", radius=1.25):
    """Kulatý podstavec s trávou a světlým okrajem; každá památka stojí na stejném."""
    cyl((0, 0, -0.14), radius + 0.07, 0.22, material("pl_ring", ring, roughness=0.5), verts=64)
    cyl((0, 0, -0.02), radius, 0.12, material("pl_top", top, roughness=0.75), verts=64)


def stone_material(name, color, scale=22.0, strength=0.22, roughness=0.8):
    """Kámen s jemným šumem v barvě a drsnosti (bez textur ze souboru)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 6
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = strength
    mix.inputs["Color1"].default_value = hex_rgba(color)
    nt.links.new(noise.outputs["Color"], mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = roughness
    return m


def striped_material(name, c1, c2, freq=14.0, roughness=0.4, metallic=0.0, axis="Z", twist=0.0):
    """Pruhy podél osy objektu (cibulové kopule apod.)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = axis
    wave.inputs["Scale"].default_value = freq
    wave.inputs["Distortion"].default_value = twist
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.45
    ramp.color_ramp.elements[1].position = 0.55
    ramp.color_ramp.elements[0].color = hex_rgba(c1)
    ramp.color_ramp.elements[1].color = hex_rgba(c2)
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Color"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    return m


def glow(name, color, strength=6.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hex_rgba(color)
    b.inputs["Emission Color"].default_value = hex_rgba(color)
    b.inputs["Emission Strength"].default_value = strength
    return m


def set_glow(mat, strength):
    mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = strength


class Flag:
    """Vlající vlajka na tyči: mřížka, každé buňce se přiřadí materiál podle (u, v) a vlna se
    počítá analyticky (smyčka s celým počtem period). `pick(u, v)` vrací index materiálu."""

    def __init__(self, origin, width, height, mats, pick, cols=28, rows=14, amp=0.14, waves=2.0, droop=0.04, name="flag"):
        self.origin, self.w, self.h, self.cols, self.rows = Vector(origin), width, height, cols, rows
        self.amp, self.waves, self.droop = amp, waves, droop
        me = bpy.data.meshes.new(name)
        faces, idx = [], []
        for j in range(rows):
            for i in range(cols):
                a = j * (cols + 1) + i
                faces.append((a, a + 1, a + cols + 2, a + cols + 1))
                idx.append(pick((i + 0.5) / cols, (j + 0.5) / rows))
        me.from_pydata([(0, 0, 0)] * ((cols + 1) * (rows + 1)), [], faces)
        for m in mats:
            me.materials.append(m)
        for p, mi in zip(me.polygons, idx):
            p.material_index = mi
            p.use_smooth = True
        self.me = me
        self.obj = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(self.obj)
        s = self.obj.modifiers.new("solid", "SOLIDIFY")
        s.thickness = 0.012
        self.update(0.0)

    def update(self, t):
        ph = t * math.tau
        o = self.origin
        for j in range(self.rows + 1):
            for i in range(self.cols + 1):
                u, v = i / self.cols, j / self.rows
                y = self.amp * (u ** 1.1) * math.sin(u * self.waves * math.tau - ph)
                z = -v * self.h - self.droop * u * u * (1 + 0.4 * math.sin(ph - u * 3))
                x = u * self.w * (1 - 0.05 * abs(y) / max(self.amp, 1e-3))
                self.me.vertices[j * (self.cols + 1) + i].co = (o.x + x, o.y + y, o.z + z)
        self.me.update()


def pole(base, top, r=0.018, mat=None, ball=True):
    m = mat or material("pole", "#e9e4f7", roughness=0.35, metallic=0.3)
    bar(base, top, r, m, verts=12)
    if ball:
        sphere(top, r * 2.4, material("ball", "#ffc933", roughness=0.3, metallic=0.5), seg=12, rings=8)


ANIM = []


def anim(fn):
    """Zaregistruje další animaci (funkce t -> None), kterou run() zavolá spolu s update()."""
    ANIM.append(fn)
    return fn


def run(update, name):
    """--preview vykreslí čtyři snímky, jinak celou smyčku; --frame N jediný snímek."""
    base = update

    def update(t):
        base(t)
        for f in ANIM:
            f(t)

    a = args()
    sc = bpy.context.scene
    total = sc.frame_end - sc.frame_start + 1
    if "--frame" in a:
        n = int(a[a.index("--frame") + 1])
        render(update, only_frames=[n])
    elif "--preview" in a:
        render(update, only_frames=[1, total // 4 + 1, total // 2 + 1, 3 * total // 4 + 1])
    else:
        render(update)


class Bird:
    """Jednoduchý pták: tělo, hlava, zobák a dvě mávající křídla. Směřuje podél +x."""

    def __init__(self, body_mat, wing_mat, beak_mat=None, s=1.0, beak_len=0.05):
        self.s = s
        self.root = bpy.data.objects.new("bird", None)
        bpy.context.scene.collection.objects.link(self.root)
        parts = [sphere((0, 0, 0), 0.09 * s, body_mat, scale=(1.5, 0.75, 0.75), seg=16, rings=10)]
        parts.append(sphere((0.12 * s, 0, 0.02 * s), 0.05 * s, body_mat, seg=12, rings=8))
        if beak_mat is not None:
            parts.append(cone((0.19 * s + beak_len * s / 2, 0, 0.02 * s), 0.025 * s, 0.004 * s, beak_len * s, beak_mat, verts=10, rot=(0, math.radians(90), 0)))
        tail = box((-0.15 * s, 0, 0), (0.1 * s, 0.05 * s, 0.01 * s), wing_mat, bevel=0)
        parts.append(tail)
        for o in parts:
            loc = o.location.copy()
            o.parent = self.root
            o.location = loc
        self.pivots = []
        for side in (-1, 1):
            piv = bpy.data.objects.new("piv", None)
            bpy.context.scene.collection.objects.link(piv)
            piv.parent = self.root
            piv.location = (0.0, side * 0.05 * s, 0.03 * s)
            w = box((0, side * 0.12 * s, 0), (0.11 * s, 0.26 * s, 0.012 * s), wing_mat, bevel=0)
            w.parent = piv
            w.location = (0, side * 0.12 * s, 0)
            self.pivots.append((piv, side))

    def place(self, pos, yaw, flap):
        self.root.location = pos
        self.root.rotation_euler = (0, 0, yaw)
        for piv, side in self.pivots:
            piv.rotation_euler = (side * flap, 0, 0)


def flat(obj):
    """Vypne hladké stínování (hranatější stavby)."""
    for p in obj.data.polygons:
        p.use_smooth = False
    return obj


# --- scenérie kolem památek: stromy, keře, lampy, dlažba ---

def bush(x, y, s=1.0, mats=None, z=0.0):
    mats = mats or [material("bu1", "#3fa752", roughness=0.7), material("bu2", "#59c460", roughness=0.7)]
    for k, (dx, dy, r) in enumerate(((0, 0, 0.11), (0.09, 0.03, 0.08), (-0.08, 0.04, 0.085), (0.02, -0.08, 0.075))):
        sphere((x + dx * s, y + dy * s, z + 0.06 * s + r * s * 0.5), r * s, mats[k % len(mats)], seg=12, rings=8)


def tree(x, y, s=1.0, z=0.0, kind="round", leaf="#3fa752", trunk="#7a5636"):
    tm = material("trk", trunk, roughness=0.9)
    lm = material("lf" + leaf, leaf, roughness=0.65)
    lm2 = material("lf2" + leaf, "#59c460", roughness=0.65)
    cyl((x, y, z + 0.12 * s), 0.025 * s, 0.24 * s, tm, verts=8)
    if kind == "cone":
        for k in range(3):
            cone((x, y, z + (0.22 + 0.13 * k) * s), (0.13 - 0.03 * k) * s, 0.0, 0.2 * s, lm if k % 2 else lm2, verts=12)
    else:
        sphere((x, y, z + 0.3 * s), 0.13 * s, lm, seg=14, rings=10)
        sphere((x + 0.06 * s, y + 0.02 * s, z + 0.36 * s), 0.09 * s, lm2, seg=12, rings=8)


def lamp_post(x, y, mat, z=0.0, h=0.42):
    m = material("lamp_pole", "#3b3a4a", roughness=0.4, metallic=0.7)
    bar((x, y, z), (x, y, z + h), 0.012, m, verts=8)
    sphere((x, y, z + h + 0.025), 0.035, mat, seg=10, rings=8)


def cobbles(radius, count, mat, seed=3, z=0.045):
    """Dlažba: drobné ploché kameny roztroušené po podstavci."""
    rnd = random.Random(seed)
    for _ in range(count):
        a, r = rnd.uniform(0, math.tau), radius * math.sqrt(rnd.uniform(0.15, 1))
        box((r * math.cos(a), r * math.sin(a), z), (rnd.uniform(0.05, 0.09), rnd.uniform(0.05, 0.09), 0.012), mat, rot=(0, 0, rnd.uniform(0, 3)), bevel=0.004)


def pointed_window(x, y, z, w, h, mat, rot=0.0, depth=0.02):
    """Gotické okno: obdélník s lomeným obloukem nahoře (jen přední plocha)."""
    c, sn = math.cos(rot), math.sin(rot)
    box((x, y, z), (w, depth, h * 0.7), mat, rot=(0, 0, rot), bevel=0)
    cone((x, y, z + h * 0.35 + w * 0.3), w * 0.72, 0.0, w * 0.9, mat, verts=3, rot=(math.radians(90), 0, rot))
