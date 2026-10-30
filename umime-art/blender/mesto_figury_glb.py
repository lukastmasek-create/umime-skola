"""3D modely obyvatel městečka pro web (živé postavy v TownHub, src/lib/town3d/folk.ts).

Stejné postavy a pohyby jako mesto_figury.py, jen se místo renderu snímků pohyb „zapeče“ do klíčových snímků
(poloha, otočení a měřítko každého dílu) a celá scéna se uloží jako GLB i s animací. Kamera a světla se neukládají;
web snímá postavu stejnou ortografickou kamerou (šířka záběru a výška cíle jsou v SPR v TownHub).

Spuštění: python mesto_figury_glb.py -- [<práce> …]   (bez prací všechny; výstup public/home/mesto3d/<práce>.glb)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import bpy  # noqa: E402
import znacky_lib  # noqa: E402
import mesto_figury as mf  # noqa: E402

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "home", "mesto3d"))


def bake_run(update, name):
    sc = bpy.context.scene
    total = sc.frame_end - sc.frame_start + 1
    objs = [o for o in sc.objects if o.type in ("MESH", "EMPTY")]
    # o snímek víc: poslední klíč = první, smyčka na webu navazuje
    for f in range(sc.frame_start, sc.frame_end + 2):
        t = ((f - sc.frame_start) % total) / total
        sc.frame_set(f)
        update(t)
        for g in znacky_lib.ANIM:
            g(t)
        for o in objs:
            o.keyframe_insert("location", frame=f)
            o.keyframe_insert("rotation_euler", frame=f)
            o.keyframe_insert("scale", frame=f)
    sc.frame_end = sc.frame_end + 1
    for o in [o for o in sc.objects if o.type in ("CAMERA", "LIGHT")]:
        bpy.data.objects.remove(o, do_unlink=True)
    # husté koule a válce zjednodušit (na webu jsou postavy malé), soubory jsou pak zhruba poloviční
    for o in [o for o in sc.objects if o.type == "MESH" and len(o.data.polygons) > 120]:
        m = o.modifiers.new("decimate", "DECIMATE")
        m.ratio = 0.45
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name.removeprefix("mf_") + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_animations=True,
        export_animation_mode="SCENE",
        export_force_sampling=True,
        export_optimize_animation_size=True,
        export_cameras=False,
        export_lights=False,
        export_yup=True,
        export_texcoords=False,  # postavy nemají textury
    )
    print("GLB", path, os.path.getsize(path) // 1024, "KB", flush=True)


mf.run = bake_run

JOBS = ["knihovnice", "knihovnice_chuze", "pekar", "pekar_chuze", "kluk", "kluk_chuze", "farmar", "babicka", "pes_bezi", "pes_sedi", "kocka", "ovce", "slepice",
        "hrdina_chuze", "hrdina_stoji", "hrdina_radost"] + [f"hrdina_{a}_{k}" for k in range(1, len(mf.HERO_LOOKS)) for a in ("chuze", "stoji", "radost")]

if __name__ == "__main__":
    want = [a for a in znacky_lib.args() if a in mf.JOBS] or JOBS
    for w in want:
        mf.JOBS[w]()
