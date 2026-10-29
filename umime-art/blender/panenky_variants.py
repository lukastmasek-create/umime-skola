"""Čtyři varianty každého kusu oblečení (vlasy, šaty, boty, make-up, doplněk, čepice). Princezna má různé tvary, ostatní panenky mají
jedinou variantu (web jim nabídne čtyři barevné odstíny)."""
from panenky_wear2 import *  # noqa: F401,F403

SLOT_NAMES = ("hair", "outfit", "shoes", "makeup", "accessory", "topper")

HAIR = [("long", "#f4c542"), ("bob", "#b5532a"), ("pony", "#3a2418"), ("curly", "#e8a0c4")]
OUTFIT_COLORS = [("#ff7eb6", "#ffd1e8"), ("#6fb3ff", "#ffffff"), ("#8a4bd0", "#e6dcff"), ("#7ee0b0", "#ffe36e")]
SHOE_COLORS = [("#ff4f9a", "#ffd1e8"), ("#ffffff", "#ff7eb6"), ("#7a4a2a", "#e6b84a"), ("#d8b8ff", "#ffffff")]
MAKEUP = [
    dict(makeup=("#e0457b", "#c58bff", "#ff9ab8"), glitter=10, strength=1.0),
    dict(makeup=("#d98a7a", "#e8c9a0", "#f4b6a0"), glitter=0, strength=0.55),
    dict(makeup=("#b0102a", "#3a3a4a", "#d98a8a"), glitter=4, strength=1.0),
    dict(makeup=("#2ec4b6", "#59c3ff", "#b890ff"), glitter=34, strength=1.0),
]
TOPPER_COLORS = [None, ("#ff7eb6", "#ffffff"), ("#ff7eb6", "#ffe36e"), ("#e8c887", "#ff7eb6")]


def darker(h, k=0.55):
    r, g, b = hex_rgb(h)
    return tuple(c * k for c in hex_lin(h)[:3]) + (1.0,)


def princess_variants(root, d, M):
    for v in range(4):
        Mv = dict(M)
        # vlasy
        kind, col = HAIR[v]
        Mv["hair"] = make_mat(f"hair_a_v{v}", col, 0.36, tex=strand_texture(), sheen=0.5, sheen_rough=0.35, coat=0.15, coat_rough=0.3)
        Mv["hair_root"] = make_mat(f"hair_root_v{v}", darker(col), 0.55)
        build_hair(root, dict(d, hair=(kind, col)), Mv, name=f"slot_hair_v{v}")
        # šaty
        a, b = OUTFIT_COLORS[v]
        Mv["outfit_a"] = make_mat(f"outfit_a_v{v}", a, 0.38, normal=nrm_weave(), sheen=1.0, sheen_rough=0.3, coat=0.25, coat_rough=0.25)
        Mv["outfit_b"] = make_mat(f"outfit_b_v{v}", b, 0.4, normal=nrm_weave("weave_b.png", 0.6), sheen=0.8, sheen_rough=0.35, coat=0.15)
        Mv["tulle"] = make_mat(f"outfit_tulle_v{v}", "#ffffff", 0.6, tex=tex_net(), alpha=0.5, sheen=0.6)
        princess_outfit(root, d, Mv, name=f"slot_outfit_v{v}", spec=OUTFIT_SPECS[v])
        # boty
        sa, sb = SHOE_COLORS[v]
        Mv["shoes_a"] = make_mat(f"shoes_a_v{v}", sa, 0.45 if v == 2 else 0.4, normal=nrm_leather("boot_n.png") if v == 2 else None, sheen=0.15, coat=0.25, coat_rough=0.25)
        Mv["shoes_b"] = make_mat(f"shoes_b_v{v}", sb, 0.45, sheen=0.4)
        [princess_shoes, athlete_shoes, rocker_shoes, fairy_shoes][v](root, d, Mv, name=f"slot_shoes_v{v}")
        # doplněk
        if v == 1:
            Mv["lens"] = make_mat("accessory_lens_v1", "#ff7eb6", 0.05, alpha=0.5, coat=1.0, coat_rough=0.02, spec=1.0)
            Mv["accessory_a"] = make_mat("accessory_a_v1", "#e6b84a", 0.3, metal=1.0)
            rocker_accessory(root, d, Mv, name="slot_accessory_v1")
        elif v == 2:
            Mv["accessory_a"] = make_mat("accessory_a_v2", "#ff7eb6", 0.4, coat=0.3, coat_rough=0.3)
            princess_bag(root, d, Mv, name="slot_accessory_v2")
        elif v == 3:
            Mv["accessory_a"] = make_mat("accessory_a_v3", "#c9923a", 0.4)
            fairy_accessory(root, d, Mv, name="slot_accessory_v3")
        else:
            princess_accessory(root, d, Mv, name="slot_accessory_v0")
        # čepice
        if v == 0:
            princess_topper(root, d, Mv, name="slot_topper_v0")
        else:
            ta, tb = TOPPER_COLORS[v]
            Mv["topper_a"] = make_mat(f"topper_a_v{v}", ta, 0.55 if v != 3 else 0.85, sheen=0.6)
            Mv["topper_b"] = make_mat(f"topper_b_v{v}", tb, 0.5, sheen=0.6)
            [None, princess_headband, fairy_topper, princess_hat][v](root, d, Mv, name=f"slot_topper_v{v}")
        # make-up: samostatná překrývací hlava s texturou
        mk = MAKEUP[v]
        dm = dict(d, makeup=mk["makeup"])
        Mv["makeup"] = make_mat(f"makeup_face_v{v}", "#ffffff", 0.45, tex=makeup_texture(dm, f"makeup_{d['id']}_v{v}.png", glitter=mk["glitter"], strength=mk["strength"]), alpha=1.0)
        n = node(f"slot_makeup_v{v}", root)
        head_mesh("makeup_face", Mv["makeup"], n, off=0.0012)
