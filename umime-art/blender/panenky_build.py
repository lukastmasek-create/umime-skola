"""Sestavení realistické panenky (krok 1: tělo, hlava, oči). Spuštění: python panenky_build.py -- <id>"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from panenky_wear2 import *  # noqa: E402,F401,F403
import panenky3d as legacy  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUTDIR = os.path.join(REPO, "public", "dolls")


def materials(doll):
    skin = doll["skin"]
    hair = doll["hair"][1]
    m = {}
    m["skin_body"] = make_mat("body_skin", "#ffffff", 0.55, tex=skin_body_texture(skin), sheen=0.25, sheen_rough=0.6)
    m["skin_face"] = make_mat("face_skin", "#ffffff", 0.5, tex=skin_face_texture(skin, hair, "face_" + doll["id"] + ".jpg"), sheen=0.2, sheen_rough=0.6)
    m["lid"] = m["skin_body"]
    m["eye"] = make_mat("eye", "#ffffff", 0.3, tex=eye_texture(doll["eye"], "eye_" + doll["id"] + ".png"))
    m["cornea"] = make_mat("cornea", "#ffffff", 0.02, alpha=0.1, spec=1.0, coat=1.0, coat_rough=0.02)
    m["lash"] = make_mat("lash", "#1b1519", 0.45)
    m["hair"] = make_mat("hair_a", hair, 0.36, tex=strand_texture(), sheen=0.5, sheen_rough=0.35, coat=0.15, coat_rough=0.3)
    m["hair_root"] = make_mat("hair_root", tuple(c * 0.55 for c in hex_lin(hair)[:3]) + (1.0,), 0.55)
    m["accessory_a"] = make_mat("accessory_a", doll["acc"][1], 0.4)
    shoe_a, shoe_b = doll["shoes"][1], doll["shoes"][2]
    oa, ob = doll["outfit"][1], doll["outfit"][2]
    m["under_grey"] = make_mat("under_grey", "#8f95a3", 0.85, normal=nrm_ribs("under_ribs.png"), sheen=0.4, sheen_rough=0.7)
    m["under_dark"] = make_mat("under_dark", "#6f7585", 0.8)
    m["outfit_a"] = make_mat("outfit_a", oa, 0.38, normal=nrm_weave(), sheen=1.0, sheen_rough=0.3, coat=0.25, coat_rough=0.25)
    m["outfit_b"] = make_mat("outfit_b", ob, 0.4, normal=nrm_weave("weave_b.png", 0.6), sheen=0.8, sheen_rough=0.35, coat=0.15)
    m["tulle"] = make_mat("outfit_tulle", "#ffffff", 0.6, tex=tex_net(), alpha=0.5, sheen=0.6)
    m["pearl"] = make_mat("pearl", "#fbf4ee", 0.18, coat=1.0, coat_rough=0.05, sheen=0.5)
    m["gold"] = make_mat("gold", "#e6b84a", 0.24, metal=1.0)
    m["gem_blue"] = make_mat("gem_blue", "#59c3ff", 0.06, coat=1.0, coat_rough=0.02, spec=1.0, emission="#59c3ff", emission_strength=0.25)
    m["gem_pink"] = make_mat("gem_pink", "#ff4f9a", 0.06, coat=1.0, coat_rough=0.02, spec=1.0, emission="#ff4f9a", emission_strength=0.25)
    m["shoes_a"] = make_mat("shoes_a", shoe_a, 0.4, sheen=0.15, coat=0.25, coat_rough=0.25)
    m["shoes_b"] = make_mat("shoes_b", shoe_b, 0.45, sheen=0.4)
    m["lace"] = make_mat("lace", "#f4f4f8", 0.7)
    m["ribbon"] = make_mat("ribbon", "#2a8cff", 0.45, sheen=0.8)
    m["gold_dark"] = make_mat("gold_dark", "#b8892f", 0.35, metal=1.0)
    m["topper_a"] = make_mat("topper_a", doll["topper"][1], 0.55, normal=nrm_weave("weave_t.png", 0.8), sheen=0.8)
    m["topper_b"] = make_mat("topper_b", doll["topper"][2], 0.5, sheen=0.6)
    m["silver"] = make_mat("silver", "#d6dae4", 0.28, metal=1.0)
    m["dark"] = make_mat("dark", "#18151c", 0.6)
    m["white"] = make_mat("white", "#fffaf5", 0.5)
    m["wood"] = make_mat("wood", "#8a5a2e", 0.6)
    m["steel"] = make_mat("steel", "#c9ced8", 0.22, metal=1.0)
    m["soup"] = make_mat("soup", "#d9822b", 0.15, coat=1.0)
    m["star_glow"] = make_mat("star_glow", "#ffe36e", 0.3, emission="#ffd23f", emission_strength=1.2)
    m["outfit_leaf"] = make_mat("outfit_leaf", "#4fb06b", 0.45, sheen=0.7)
    m["wing"] = make_mat("wing", "#ffffff", 0.12, tex=tex_wing(), alpha=1.0, coat=0.8)
    m["leather"] = make_mat("leather", "#17141c", 0.42, normal=nrm_leather(), coat=0.3, coat_rough=0.3)
    m["outfit_plaid"] = make_mat("outfit_plaid", ob, 0.6, tex=tex_plaid_gray("plaid.png"), sheen=0.3)
    m["fishnet"] = make_mat("outfit_net", "#0d0c11", 0.55, tex=tex_net("net_b.png"), alpha=1.0)
    m["lens"] = make_mat("accessory_lens", "#8a4bd0", 0.05, alpha=0.6, coat=1.0, coat_rough=0.02, spec=1.0)
    m["outfit_check"] = make_mat("outfit_check", ob, 0.62, tex=tex_check_gray("check.png"), sheen=0.5)
    m["suit_glove"] = make_mat("outfit_glove", "#f2f4ff", 0.5, normal=nrm_quilt())
    m["suit_pack"] = make_mat("suit_pack", "#d9deef", 0.45, normal=nrm_quilt("pack_n.png"))
    m["screen"] = make_mat("screen", "#59e0ff", 0.2, emission="#59e0ff", emission_strength=1.5)
    m["button_r"] = make_mat("button_r", "#ff3b3b", 0.3, emission="#ff3b3b", emission_strength=0.6)
    m["button_g"] = make_mat("button_g", "#3bff70", 0.3, emission="#3bff70", emission_strength=0.6)
    m["button_y"] = make_mat("button_y", "#ffd23f", 0.3, emission="#ffd23f", emission_strength=0.6)
    m["visor"] = make_mat("visor", "#e0b24a", 0.04, metal=1.0, alpha=0.5, coat=1.0, coat_rough=0.02)
    if doll["id"] == "rocker":
        m["shoes_a"] = make_mat("shoes_a", shoe_a, 0.45, normal=nrm_leather("boot_n.png"), coat=0.2, coat_rough=0.3)
        m["topper_a"] = make_mat("topper_a", doll["topper"][1], 0.4, normal=nrm_leather("jacket_n.png"), coat=0.35, coat_rough=0.3)
    if doll["id"] == "astronaut":
        m["topper_a"] = make_mat("topper_a", "#dfeeff", 0.03, alpha=0.14, coat=1.0, coat_rough=0.02, spec=1.0)
        m["topper_b"] = make_mat("topper_b", "#aab4cf", 0.3, metal=0.8)
        m["outfit_a"] = make_mat("outfit_a", oa, 0.5, normal=nrm_quilt("suit_n.png"), sheen=0.5)
    if doll["id"] == "chef":
        m["topper_a"] = make_mat("topper_a", doll["topper"][1], 0.7, normal=nrm_weave("weave_h.png", 0.8), sheen=0.7)
    m["makeup"] = make_mat("makeup_face", "#ffffff", 0.45, tex=makeup_texture(doll, "makeup_" + doll["id"] + ".png"), alpha=1.0)
    return m


def bake_scene_ao():
    """Ambient occlusion do vrcholových barev všech sítí (kontaktní stíny ve švech a pod oblečením)."""
    bpy.context.view_layer.update()
    skip = ("cornea", "eyeball", "lid", "lash", "makeup_face", "wing", "helmet_glass", "visor", "tulle", "lens")
    objs = [o for o in bpy.data.objects if o.type == "MESH"]
    tree = bvh_of([o for o in objs if not any(k in o.name for k in ("cornea", "wing", "helmet_glass", "visor", "tulle", "lens", "makeup_face"))])
    import time
    t0 = time.time()
    for o in objs:
        if any(k in o.name for k in skip):
            continue
        bake_ao(o, tree, rays=10, dist=0.045, strength=0.62)
    print("AO", round(time.time() - t0, 1), "s")


def build(did):
    d = dict(legacy.DOLLS[did])
    d["id"] = did
    d["eye"] = {"princess": "#4aa3d9", "athlete": "#7a5a2e", "rocker": "#8a4bd0", "fairy": "#3fa86b", "chef": "#5b3a22", "astronaut": "#3a2a1c"}[did]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = node("doll")
    mats = materials(d)
    body = build_body(root, d, mats)
    hg, head, tree = build_head(root, d, mats)
    build_face_parts(root, d, mats, tree)
    build_hair(root, d, mats)
    underwear(root, mats)
    parts = {
        "princess": (princess_outfit, princess_shoes, princess_accessory, princess_topper),
        "athlete": (athlete_outfit, athlete_shoes, athlete_accessory, athlete_topper),
        "rocker": (rocker_outfit, rocker_shoes, rocker_accessory, rocker_topper),
        "fairy": (fairy_outfit, fairy_shoes, fairy_accessory, fairy_topper),
        "chef": (chef_outfit, chef_shoes, chef_accessory, chef_topper),
        "astronaut": (astro_outfit, astro_shoes, astro_accessory, astro_topper),
    }[did]
    for fn in parts:
        fn(root, d, mats)
    mk = node("slot_makeup", root)
    head_mesh("makeup_face", mats["makeup"], mk, off=0.0012)
    bake_scene_ao()
    os.makedirs(OUTDIR, exist_ok=True)
    path = os.path.join(OUTDIR, f"panenka-{did}.glb")
    kw = dict(filepath=path, export_format="GLB", use_selection=False, export_apply=False, export_yup=True, export_materials="EXPORT", export_morph=True,
              export_image_format="JPEG", export_vertex_color="ACTIVE", export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7)
    bpy.ops.export_scene.gltf(**kw)
    print("OK", path, os.path.getsize(path))


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["princess"]
    build(argv[0])
