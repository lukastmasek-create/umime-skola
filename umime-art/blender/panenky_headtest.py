"""Rychlý test hlavy: tělo, hlava, oči, vlasy a make-up bez kostry. python panenky_headtest.py -- <id> <out.glb>"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from panenky_build import *  # noqa: E402,F401,F403

if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:]
    did, out = argv[0], argv[1]
    d = dict(legacy.DOLLS[did])
    d["id"] = did
    d["eye"] = {"princess": "#4aa3d9", "athlete": "#7a5a2e", "rocker": "#8a4bd0", "fairy": "#3fa86b", "chef": "#5b3a22", "astronaut": "#3a2a1c"}[did]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = node("doll")
    mats = materials(d)
    build_body(root, d, mats)
    hg, head, tree = build_head(root, d, mats)
    build_face_parts(root, d, mats, tree)
    underwear(root, mats)
    if "--nohair" not in argv:
        build_hair(root, d, mats, name="slot_hair_v0")
    mk = node("slot_makeup_v0", root)
    head_mesh("makeup_face", mats["makeup"], mk, off=0.0012)
    makeup_lids(mk, d, "makeup_lid_" + did, glitter=8)
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=False, export_yup=True, export_materials="EXPORT", export_morph=True, export_image_format="JPEG")
    print("OK", out)
