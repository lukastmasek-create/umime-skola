"""Stavebnice pro bannery profilu: obloha, kopce, stromy, mraky, hvězdy, voda, budovy.

Všechny scény používají stejný pohled: ortografická kamera zepředu, šířka 30 jednotek (x od -15 do 15),
výška 10 (z od -5 do 5), hloubka y roste od kamery. Střed (x kolem 0) nechávají scény klidnější,
protože přes něj leží avatar a jméno hráče.
"""
import math
import random

import bpy
from mathutils import Matrix

import common as C

TAU = math.tau


def solid(o):
    """Zapeče měřítko do sítě, aby pozdější o.scale násobilo velikost, a ne ji přepsalo."""
    sx, sy, sz = o.scale
    o.data.transform(Matrix.Diagonal((sx, sy, sz, 1.0)))
    o.scale = (1, 1, 1)
    return o


def box(loc, size, m, name="box"):
    return solid(C.box(loc, size, m, name=name))


def plane(loc, size, m, name="plane", rot=(math.pi / 2, 0, 0)):
    return solid(C.plane(loc, size, m, name=name, rot=rot))


def setup(sky_stops, ambient="#ffffff", ambient_strength=0.6, sun_rot=(0.95, 0.15, 0.5), sun_strength=2.6, sun_color="#fff2dc"):
    """Kamera, obloha (emisní přechod úplně vzadu), okolní světlo a slunce."""
    C.camera((0, -40, 0), (0, 0, 0), ortho=30)
    C.world(ambient, ambient_strength)
    sky = C.plane((0, 60, 0), (80, 30), C.gradient_mat(sky_stops, "Y", 1.0), name="sky")
    if sun_strength:
        C.sun(sun_rot, sun_strength, sun_color, angle=0.3)
    return sky


def lit(color, rough=0.7):
    return C.mat(color, rough=rough)


def glow(color, strength=2.0):
    return C.mat(color, emit=strength)


def hill(x, y, z, sx, sz, m, sy=3.0, seg=40):
    h = C.sphere((x, y, z), 1.0, m, seg=seg, name="hill")
    h.scale = (sx, sy, sz)
    return h


def ground(z, m, y=4.0, depth=20.0):
    return box((0, y + depth / 2, z - 2), (80, depth, 4), m, name="ground")


def round_tree(x, y, z, h, leaf, trunk, rnd=None):
    """Listnatý strom ze tří koulí na kmeni; vrací pivot u paty (pro kývání)."""
    rnd = rnd or random.Random(int(x * 100 + y))
    piv = C.empty((0, 0, 0), "tree")
    C.cylinder((0, 0, h * 0.25), h * 0.06, h * 0.5, trunk, verts=7).parent = piv
    for (dx, dz, r) in [(0, 0.72, 0.36), (-0.2, 0.55, 0.26), (0.22, 0.58, 0.27)]:
        C.sphere((dx * h, 0, dz * h), r * h * (0.9 + 0.2 * rnd.random()), leaf, seg=14).parent = piv
    piv.location = (x, y, z)
    return piv


def pine(x, y, z, h, leaf, trunk, snow=None):
    piv = C.empty((0, 0, 0), "pine")
    C.cylinder((0, 0, h * 0.1), h * 0.05, h * 0.2, trunk, verts=6).parent = piv
    for k, (zz, r) in enumerate([(0.32, 0.34), (0.55, 0.27), (0.76, 0.19)]):
        C.cone((0, 0, zz * h), r * h, 0.0, h * 0.34, leaf, verts=9).parent = piv
        if snow is not None:
            C.cone((0, 0, zz * h + h * 0.1), r * h * 0.55, 0.0, h * 0.15, snow, verts=9).parent = piv
    piv.location = (x, y, z)
    return piv


def cloud(x, y, z, s, m, flat=0.62):
    parts = []
    for (px, pz, r) in [(-0.9, -0.1, 0.7), (-0.2, 0.25, 0.95), (0.7, 0.1, 0.8), (1.4, -0.1, 0.55)]:
        o = C.sphere((x + px * s, y, z + pz * s), r * s, m, seg=16, name="cloud")
        o.scale.z = flat
        parts.append((o, o.location.x))
    return parts


def drifting_clouds(m, rows, period=30.0, y=30.0):
    """Mraky v řadách [(z, scale), ...], dvojnásobně opakované, aby se smyčka navázala."""
    out = []
    for (z, s, x0) in rows:
        for n in (-1, 0, 1):
            out.extend(cloud(x0 + n * period, y, z, s, m))
    return out, period


def move_clouds(parts, period, t, speed=1.0):
    span = period * 3
    for (o, x0) in parts:
        o.location.x = C.wrap(x0 + period * t * speed, span)


def stars(n, rnd, zmin=-1.0, zmax=5.0, y=50.0, size=(0.03, 0.08), color="#ffffff"):
    m = glow(color, 3.0)
    out = []
    for _ in range(n):
        r = rnd.uniform(*size)
        o = C.sphere((rnd.uniform(-15.5, 15.5), y, rnd.uniform(zmin, zmax)), r, m, seg=6, smooth=False, name="star")
        out.append((o, rnd.random(), r))
    return out


def twinkle(star_list, t, speed=2):
    for (o, ph, r) in star_list:
        s = 0.55 + 0.45 * math.sin(TAU * (t * speed + ph))
        o.scale = (s, s, s)


def sway(pivots, t, amp_deg=3.0, speed=1):
    for i, p in enumerate(pivots):
        p.rotation_euler = (0, math.radians(amp_deg) * math.sin(TAU * (t * speed + i * 0.37)), 0)


def bob(objs, t, amp=0.15, speed=1, axis=2):
    for i, (o, base) in enumerate(objs):
        loc = list(base)
        loc[axis] += amp * math.sin(TAU * (t * speed + i * 0.29))
        o.location = loc


def water(z, m, y=3.0, depth=30.0):
    """Hladina v z, voda sahá až pod spodní okraj obrázku."""
    return box((0, y + depth / 2, z - 5.0), (80, depth, 10.0), m, name="water")


def wave_mat(deep, light, scale=6.0):
    """Vodní hladina: emisní přechod do dálky a pruhy vlnek z vlnové textury (posouvá se fází)."""
    m = bpy.data.materials.new("wave")
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "Z"
    wave.inputs["Scale"].default_value = scale
    wave.inputs["Distortion"].default_value = 3.0
    wave.inputs["Detail"].default_value = 0.5
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.8
    ramp.color_ramp.elements[0].color = C.rgb(deep)
    ramp.color_ramp.elements[1].position = 0.98
    ramp.color_ramp.elements[1].color = C.rgb(light)
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], out.inputs[0])
    m["wave"] = wave.name
    return m


def wave_phase(m, t, cycles=1.0):
    wave = m.node_tree.nodes[m["wave"]]
    wave.inputs["Phase Offset"].default_value = TAU * t * cycles


def house(x, y, z, w, h, wall, roof, win=None, door=None):
    piv = C.empty((0, 0, 0), "house")
    box((0, 0, h / 2), (w, w * 0.8, h), wall).parent = piv
    r = C.cone((0, 0, h + w * 0.32), w * 0.78, 0.0, w * 0.64, roof, verts=4)
    r.rotation_euler = (0, 0, math.pi / 4)
    r.parent = piv
    lights = []
    if win is not None:
        for dx in (-w * 0.22, w * 0.22):
            lights.append(box((dx, -w * 0.41, h * 0.62), (w * 0.2, 0.05, w * 0.2), win))
            lights[-1].parent = piv
    if door is not None:
        box((0, -w * 0.41, h * 0.2), (w * 0.22, 0.05, h * 0.4), door).parent = piv
    piv.location = (x, y, z)
    return piv, lights


def tower(x, y, z, r, h, wall, roof, flag=None):
    piv = C.empty((0, 0, 0), "tower")
    C.cylinder((0, 0, h / 2), r, h, wall, verts=12).parent = piv
    for k in range(8):
        a = k * TAU / 8
        box((math.cos(a) * r * 0.95, math.sin(a) * r * 0.95, h + 0.12), (r * 0.32, r * 0.32, 0.3), wall).parent = piv
    C.cone((0, 0, h + 0.3 + r * 0.9), r * 1.15, 0.0, r * 1.8, roof, verts=12).parent = piv
    fl = None
    if flag is not None:
        C.cylinder((0, 0, h + 0.3 + r * 1.8 + 0.35), 0.03, 0.7, wall, verts=5).parent = piv
        fl = box((0.22, 0, h + 0.3 + r * 1.8 + 0.55), (0.4, 0.03, 0.24), flag)
        fl.parent = piv
    piv.location = (x, y, z)
    return piv, fl


def flap(flags, t, speed=3):
    for i, f in enumerate(flags):
        if f is not None:
            f.scale.x = 1.0 + 0.18 * math.sin(TAU * (t * speed + i * 0.3))
            f.rotation_euler = (0, 0, 0.25 * math.sin(TAU * (t * speed + i * 0.3)))


def mountain(x, y, z, w, h, m, cap=None, verts=7):
    o = C.cone((x, y, z + h / 2), w / 2, 0.0, h, m, verts=verts, name="mountain")
    o.rotation_euler = (0, 0, 0.3)
    if cap is not None:
        c = C.cone((x, y - 0.05, z + h * 0.82), w * 0.18, 0.0, h * 0.36, cap, verts=verts, name="cap")
        c.rotation_euler = (0, 0, 0.3)
    return o


def fish(x, y, z, s, body, fin):
    piv = C.empty((0, 0, 0), "fish")
    b = C.sphere((0, 0, 0), 0.5 * s, body, seg=14)
    b.scale = (1.4, 0.55, 0.8)
    b.parent = piv
    tail = C.cone((-0.85 * s, 0, 0), 0.38 * s, 0.0, 0.5 * s, fin, verts=4)
    tail.rotation_euler = (0, math.pi / 2, 0)
    tail.parent = piv
    eye = C.sphere((0.45 * s, -0.22 * s, 0.1 * s), 0.08 * s, C.mat("#16132b", emit=1.0), seg=6)
    eye.parent = piv
    piv.location = (x, y, z)
    return piv, tail


def swim(fishes, t, period=34.0):
    span = period
    for i, (piv, tail, x0, z0, dirn, sp) in enumerate(fishes):
        x = C.wrap(x0 + dirn * period * t * sp, span)
        piv.location.x = x
        piv.location.z = z0 + 0.2 * math.sin(TAU * (t * 2 + i * 0.4))
        piv.rotation_euler = (0, 0, 0 if dirn > 0 else math.pi)
        tail.rotation_euler = (0, math.pi / 2, 0.4 * math.sin(TAU * (t * 8 + i * 0.3)))


def bubbles(n, rnd, m, x_range=(-15, 15), y=8.0):
    out = []
    for _ in range(n):
        r = rnd.uniform(0.05, 0.16)
        o = C.sphere((rnd.uniform(*x_range), y, -5), r, m, seg=10, name="bubble")
        out.append((o, rnd.uniform(*x_range), rnd.random(), rnd.choice([1, 1, 2])))
    return out


def rise(bubble_list, t, zmin=-5.5, zmax=5.5):
    for i, (o, x0, ph, sp) in enumerate(bubble_list):
        k = (ph + t * sp) % 1.0
        o.location = (x0 + 0.25 * math.sin(TAU * (k * 2 + ph)), o.location.y, zmin + (zmax - zmin) * k)


def fall(flakes, t, zmin=-5.5, zmax=5.5, drift=0.6):
    for i, (o, x0, ph, sp) in enumerate(flakes):
        k = (ph + t * sp) % 1.0
        o.location = (x0 + drift * math.sin(TAU * (k * 2 + ph)), o.location.y, zmax - (zmax - zmin) * k)
