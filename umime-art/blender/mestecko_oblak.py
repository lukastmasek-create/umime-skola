"""Mrak nad zamčeným světem (uživatelský obchod) v živém městečku → public/mestecko3d/oblak.glb

    python umime-art/blender/mestecko_oblak.py [--preview]

Jeden model pro všechny zamčené světy. Kupa z desítek různě velkých oblaků (ikosféry), povrch rozrušený šumem,
spodek plochý na zemi a obarvený do lavendrového stínu, vrchol je bílý (barva z vertexů, čte ji glTF export).
Měřítko ve hře řeší `cloudScale()` v src/lib/town3d/layout.ts (model je zhruba 21 m široký, dno na zemi, střed v (0, 0)).
Draco komprese jde přes gltf-transform, cestu lze přepsat proměnnou prostředí GLTF_TRANSFORM.
Náhled (volitelný) se uloží do PREVIEW_DIR (výchozí: aktuální složka), ne do /tmp.
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector, noise

sys.path.insert(0, os.path.dirname(__file__))
from mestecko3d_lib import *  # noqa: E402,F401,F403

SEED = 7
SHADE = hexc("#e4e1f3")  # spodek v měkkém fialovém stínu
LIGHT = hexc("#ffffff")  # vrchol
TOP_H = 9.0  # výška, při které je barva už čistě bílá


def puffs(rng):
    """Oblaky (x, y, z, poloměr): kupa s plochou spodní částí, širší než vyšší. Y je hloubka."""
    out = []
    # spodní pás: hodně malých oblaků podél základny, různě hluboko
    for i in range(26):
        x = rng.uniform(-8.0, 8.0)
        y = rng.uniform(-5.0, 5.0)
        out.append((x, y, rng.uniform(1.6, 2.6), rng.uniform(1.6, 2.4)))
    # střední a horní vrstva: menší oblaky směrem do středu a nahoru
    for i in range(34):
        u = rng.uniform(-1.0, 1.0)
        v = rng.uniform(-1.0, 1.0)
        dome = max(0.0, 1.0 - (u * u * 0.9 + v * v * 0.6))  # 0 na okraji, 1 uprostřed
        z = 2.5 + dome * 9.0 * rng.uniform(0.55, 1.0)
        x = u * 8.5 * (1 - 0.3 * dome)
        y = v * 5.5 * (1 - 0.2 * dome)
        r = 1.1 + 2.4 * dome * rng.uniform(0.6, 1.0) + rng.uniform(0.0, 0.6)
        out.append((x, y, z, r))
    return out


def fbm(p, octaves=3):
    """Jemný šum (fraktální součet) v prostoru, hodnoty zhruba −1..1."""
    total, amp, freq = 0.0, 0.5, 1.0
    for _ in range(octaves):
        total += amp * noise.noise(p * freq, noise_basis="PERLIN_ORIGINAL")
        amp *= 0.5
        freq *= 2.1
    return total


def build():
    reset()
    rng = random.Random(SEED)
    bm = bmesh.new()
    for x, y, z, r in puffs(rng):
        bmesh.ops.create_icosphere(bm, subdivisions=3, radius=r, matrix=Matrix.Translation((x, y, z)))
    # oblaky se prolínají: spojit a přepočítat normály
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bm.normal_update()
    # povrch: šum podél normály (kupa místo hladkých koulí), spodek srovnat na zem
    for v in bm.verts:
        d = fbm(v.co * 0.55 + Vector((SEED, 0.0, 0.0))) * 1.1
        d += fbm(v.co * 1.6) * 0.25
        d += fbm(v.co * 3.4) * 0.14
        v.co += v.normal * d
    for v in bm.verts:
        if v.co.z < 0.35:
            v.co.z = 0.0
        v.co.z = max(0.0, v.co.z)
    bm.normal_update()
    # barva z výšky: spodek lavendrový, vrchol bílý, mírné střídání světla a stínu uvnitř kupy
    col = bm.loops.layers.color.new("Col")
    for f in bm.faces:
        f.smooth = True
        for loop in f.loops:
            z = loop.vert.co.z
            t = min(1.0, max(0.0, z / TOP_H))
            t = t * t * (3 - 2 * t)  # hladký přechod
            shade_k = 0.9 + 0.1 * fbm(loop.vert.co * 0.9)
            c = [SHADE[i] * (1 - t) + LIGHT[i] * t for i in range(3)]
            loop[col] = tuple(max(0.0, min(1.0, x * shade_k)) for x in c) + (1.0,)
    mesh = bpy.data.meshes.new("oblak")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new("oblak", mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(cloud_material())
    for p in mesh.polygons:
        p.use_smooth = True
    finish_and_export("oblak")


def cloud_material():
    """Materiál s barvou z vertexů (glTF ji exportuje jako COLOR_0, hra ji použije přímo)."""
    m = bpy.data.materials.new("oblak_material")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    attr = nt.nodes.new("ShaderNodeVertexColor")
    attr.layer_name = "Col"
    nt.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.98
    bsdf.inputs["Specular IOR Level"].default_value = 0.1
    return m


def preview():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 720, 480
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#8fd0ff")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    sc.world = w
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 26
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    co.location = (-18, -24, 9)
    d = Vector((0, 0, 6)) - co.location
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    sc.camera = co
    s = bpy.data.lights.new("s", "SUN")
    s.energy = 4.0
    so = bpy.data.objects.new("s", s)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(55), math.radians(10), math.radians(-35))
    out_dir = os.environ.get("PREVIEW_DIR", os.getcwd())
    os.makedirs(out_dir, exist_ok=True)
    sc.render.filepath = os.path.join(out_dir, "oblak.png")
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
    if "--preview" in sys.argv:
        preview()
