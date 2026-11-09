"""Tužka jako jezdec vlastního posuvníku (jeden statický snímek, průhledné pozadí).

Model: šestihranné tělo ve žluté, dřevěný hrot s grafitem, kovová objímka a růžová guma.
Tužka stojí svisle, hrot dolů. Web ji zmenší na ~12×72 px a posouvá podle polohy stránky.

Spuštění: python umime-art/blender/tuzka_posuvnik.py  (potřebuje bpy, viz BLENDER_ANIM.md)
Výstup: umime-art/out/tuzka/f_0001.png (složí se do public/scroll/tuzka.webp přes encode.py)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

import bpy
import bmesh
from common import add_area, add_camera, add_sun, link, material, render, reset

W, H = 96, 576  # render 2×; encode.py ho zmenší na 48×288 (lepší hrany)
sc = reset(W, H, 1, samples=160, name="tuzka", world=("#ffffff", 0.6))  # neutrální světlo, aby kov neměl fialový nádech

# Materiály (barvy odpovídají paletě webu: žlutá, korál, inkoust)
yellow = material("lak", "#ffc933", roughness=0.28)
yellow.node_tree.nodes["Principled BSDF"].inputs["Coat Weight"].default_value = 0.6  # lesklý lak
wood = material("drevo", "#d9ad72", roughness=0.5)
graphite = material("grafit", "#2a2a33", roughness=0.35, metallic=0.2)
metal = material("kov", "#c9ccd3", roughness=0.22, metallic=1.0)
eraser = material("guma", "#f29aa8", roughness=0.7)

# Rozměry (celková délka 1.0, osa Z, hrot dolů)
R = 0.075  # poloměr těla (šestihran)


def part(name, segments, r_bottom, r_top, z0, z1, mat, smooth=True):
    """Válec nebo kužel mezi výškami z0 (dole) a z1 (nahoře)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=r_bottom,
        radius2=r_top,
        depth=z1 - z0,
    )
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, (z0 + z1) / 2 - 0.5))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    return link(obj, mat, smooth=smooth)


part("grafit", 12, 0.004, 0.02, 0.0, 0.06, graphite)          # hrot grafitu
part("dreveny_hrot", 6, 0.02, R, 0.06, 0.20, wood, smooth=False)  # naostřené dřevo, šestihran
part("telo", 6, R, R, 0.20, 0.80, yellow, smooth=False)         # hranaté tělo
part("objimka", 16, 0.078, 0.078, 0.80, 0.88, metal)            # kovová objímka
part("guma", 16, 0.07, 0.07, 0.88, 1.00, eraser)                # gumová koncovka

# Světlo a kamera: tlaková světla shora, měkký odraz z boku, ortografická kamera zepředu
add_sun((0.9, 0.2, -0.6), energy=1.1)
add_area((-1.2, -3.0, 1.2), (0, 0, 0), energy=70, size=2.5, color="#fff8ec")
add_area((1.6, -2.0, -0.2), (0, 0, 0), energy=30, size=2.0, color="#e3ecff")
add_camera((0, -8, 0), (0, 0, 0), ortho_scale=1.2)

render(lambda t: None, only_frames=[1])
print("hotovo:", os.path.join(sc.render.filepath.rsplit("/", 1)[0], "f_0001.png"))
