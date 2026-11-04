"""Mrak nad zamčeným světem (uživatelský obchod) v živém městečku → public/mestecko3d/oblak.glb

    python umime-art/blender/mestecko_oblak.py [--preview]

Jeden model pro všechny zamčené světy: kupa měkkých kulí, spodek v lavendrovém stínu, průhledné pozadí se nerenderuje.
Měřítko ve hře řeší `cloudScale()` v src/lib/town3d/layout.ts (model je 14 m široký, dno na zemi, střed v (0, 0)).
Draco komprese jde přes gltf-transform, cestu lze přepsat proměnnou prostředí GLTF_TRANSFORM.
Náhled (volitelný) se uloží do PREVIEW_DIR (výchozí: aktuální složka), ne do /tmp.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from mestecko3d_lib import *  # noqa: E402,F401,F403

# (x, y, z, poloměr) v metrech. Mrak je široký i hluboký (y = hloubka), aby zakryl i velké budovy (hrad, stanice)
# z kamery šikmo zepředu. Spodní řada je plochá, nahoře se kupa zvedá do středu.
def _puffs():
    out = []
    for x in (-6.6, -4.4, -2.2, 0.0, 2.2, 4.4, 6.6):
        for y in (-4.6, 0.0, 4.6):
            out.append((x, y * 0.9 + (0.3 if x > 0 else -0.3), 2.3, 2.3))
    out += [(-7.4, 0.0, 3.1, 1.9), (7.5, 0.0, 3.0, 1.9)]
    for y in (-3.6, 3.6):
        out += [(-4.2, y, 4.6, 2.7), (3.4, -y, 4.9, 2.9), (-0.6, y * 0.5, 5.8, 3.2)]
    out += [(-1.9, 0.0, 8.0, 2.6), (1.6, 0.0, 8.5, 2.8), (0.0, 0.0, 10.6, 2.6), (-1.5, 3.2, 8.2, 2.4), (2.0, -3.4, 8.0, 2.4)]
    return out


PUFFS = _puffs()
SHADE_BELOW = 3.2  # kulky s nižším středem jsou ve stínu


def build():
    reset()
    white = mat("#ffffff", 0.95, name="oblak_bila")
    shade = mat("#dcd6f4", 0.95, name="oblak_stin")
    for x, y, z, r in PUFFS:
        sphere((x, y, z), r, shade if z < SHADE_BELOW else white, seg=20)
    finish_and_export("oblak")


def preview():
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 32
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 640, 420
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#8fd0ff")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    sc.world = w
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = 22
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    co.location = (0, -30, 7)
    co.rotation_euler = (math.radians(80), 0, 0)
    sc.camera = co
    s = bpy.data.lights.new("s", "SUN")
    s.energy = 3.5
    so = bpy.data.objects.new("s", s)
    sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-40))
    out_dir = os.environ.get("PREVIEW_DIR", os.getcwd())
    os.makedirs(out_dir, exist_ok=True)
    sc.render.filepath = os.path.join(out_dir, "oblak.png")
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
    if "--preview" in sys.argv:
        preview()
