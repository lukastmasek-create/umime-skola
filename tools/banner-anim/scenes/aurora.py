"""Polární záře: barevné pásy se vlní nad zasněženými horami, hvězdy blikají a padá hvězda."""
import math
import random

import bpy

import common as C
import kit as K

rnd = random.Random(78)


def build():
    K.setup([(0.0, "#1a3a5a"), (0.5, "#0e1e3e"), (1.0, "#050a1e")], ambient="#2a4a7a", ambient_strength=0.35, sun_rot=(1.1, 0.2, -0.4), sun_strength=0.6, sun_color="#a8c8ff")
    st = K.stars(90, rnd, zmin=-1, zmax=5)
    # Pásy záře: síť po délce x, horní řada bodů se v každém snímku vlní.
    bands = []
    N = 160
    # každý pás v jiné hloubce: průhledné plochy ve stejné rovině dělají v Cycles střepy
    for (z0, col, ph, dy) in [(2.2, "#3dff9a", 0.0, 0.0), (2.9, "#3ad8ff", 0.3, 0.8), (1.5, "#b06bff", 0.6, 1.6)]:
        verts = []
        for k in range(N):
            x = -16 + 32 * k / (N - 1)
            verts += [(x, 0, -0.8), (x, 0, 0.8)]
        faces = [(2 * k, 2 * k + 2, 2 * k + 3, 2 * k + 1) for k in range(N - 1)]
        me = bpy.data.meshes.new("aurora")
        me.from_pydata(verts, [], faces)
        me.update()
        o = bpy.data.objects.new("aurora", me)
        bpy.context.collection.objects.link(o)
        o.location = (0, 45 + dy, z0)
        o.data.materials.append(C.alpha_mat(col, 1.8, 0.4))
        bands.append((o, z0, ph))
    snow = K.lit("#e8f0ff", 0.8)
    rockm = K.lit("#3a4a6a", 0.9)
    for (x, y, w, h) in [(-11, 30, 9, 6.0), (-4, 34, 8, 4.6), (4.5, 34, 9, 5.0), (11, 30, 10, 6.4)]:
        K.mountain(x, y, -5.0, w, h, rockm, cap=snow)
    K.ground(-4.3, snow, y=6)
    trees = [K.pine(x, 9, -4.3, h, K.lit("#1f3a3a"), K.lit("#2a2020"), snow=snow) for (x, h) in [(-13.5, 2.8), (-11.8, 2.2), (-10.2, 2.6), (10.5, 2.4), (12.2, 3.0), (13.8, 2.2)]]
    shoot = K.box((0, 50, 0), (1.4, 0.05, 0.06), C.mat("#ffffff", emit=6.0))
    shoot.rotation_euler = (0, -0.35, 0)

    def update(t):
        K.twinkle(st, t, 2)
        for (o, z0, ph) in bands:
            vs = o.data.vertices
            for k in range(len(vs) // 2):
                x = vs[2 * k].co.x
                w = math.sin(x * 0.35 + C.TAU * (t + ph)) + 0.5 * math.sin(x * 0.8 - C.TAU * (2 * t + ph))
                h = 1.0 + 0.5 * math.sin(x * 0.5 + C.TAU * (t + ph))
                vs[2 * k].co.z = 0.6 * w - 0.4 * h
                vs[2 * k + 1].co.z = 0.6 * w + 0.9 * h
            o.data.update()
        k = (t * 2) % 1.0
        shoot.hide_render = not (k < 0.25)
        shoot.location = (-6 + 22 * k, 50, 4.6 - 7 * k)

    return update
