"""Uloží scénu jiného skriptu jako GLB pro 3D scény na webu (src/lib/town3d) místo renderu snímků.

Spuštění: python export_glb.py -- <skript.py> <výstup> [argumenty skriptu …]
Příklad:  python export_glb.py -- pristav_lod.py lod     → public/home/mesto3d/lod.glb
Skript postaví scénu a zavolá run(update, …); tady se místo renderu nastaví klidová poloha (t = 0), smažou se
kamera a světla, husté sítě se zjednoduší a scéna se vyexportuje (bez animace; pohyb dělá web).
"""
import os
import runpy
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bpy  # noqa: E402
import znacky_lib  # noqa: E402

OUT = os.path.abspath(os.path.join(HERE, "..", "..", "public", "home", "mesto3d"))
argv = znacky_lib.args()
script, outname, rest = argv[0], argv[1], argv[2:]


def export_run(update, name):
    update(0.0)
    for o in [o for o in bpy.context.scene.objects if o.type in ("CAMERA", "LIGHT")]:
        bpy.data.objects.remove(o, do_unlink=True)
    for o in [o for o in bpy.context.scene.objects if o.type == "MESH" and len(o.data.polygons) > 160]:
        m = o.modifiers.new("decimate", "DECIMATE")
        m.ratio = 0.5
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, outname + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, export_animations=False, export_cameras=False, export_lights=False, export_texcoords=False, export_yup=True)
    print("GLB", path, os.path.getsize(path) // 1024, "KB", flush=True)


znacky_lib.run = export_run
os.makedirs(os.path.join(HERE, "..", "out", os.path.splitext(script)[0] + "_" + (rest[0] if rest else "")), exist_ok=True)
sys.argv = [script, "--", *rest]
try:
    runpy.run_path(os.path.join(HERE, script), run_name="__main__")
except FileNotFoundError:
    pass  # skript po exportu ještě zapisuje kotvy do out/, ty tady nepotřebujeme
