"""Čtyři varianty každého kusu oblečení pro každou panenku (vlasy, šaty, boty, make-up, doplněk, čepice).
Tvary a barvy jsou v panenky_sets.py; tady se z nich staví uzly slot_<slot>_v<k>."""
from panenky_wear2 import *  # noqa: F401,F403
import panenky_sets as SETS

SLOT_NAMES = SETS.SLOTS

OUTFIT_FN = {
    "gown": (lambda *a, **k: princess_outfit(*a, spec=OUTFIT_SPECS[0], **k)),
    "short": (lambda *a, **k: princess_outfit(*a, spec=OUTFIT_SPECS[1], **k)),
    "mermaid": (lambda *a, **k: princess_outfit(*a, spec=OUTFIT_SPECS[2], **k)),
    "summer": (lambda *a, **k: princess_outfit(*a, spec=OUTFIT_SPECS[3], **k)),
    "sport": athlete_outfit,
    "rock": rocker_outfit,
    "fairy": fairy_outfit,
    "chef": chef_outfit,
    "astro": astro_outfit,
}
SHOES_FN = {"heels": princess_shoes, "sneaker": athlete_shoes, "boots": rocker_shoes, "ballet": fairy_shoes, "clog": chef_shoes, "moon": astro_shoes}
ACC_FN = {
    "necklace": princess_accessory, "glasses": rocker_accessory, "bag": princess_bag, "wand": fairy_accessory,
    "medal": athlete_accessory, "ladle": chef_accessory, "badge": astro_accessory,
}
TOP_FN = {
    "crown": princess_topper, "headband": princess_headband, "hat": princess_hat, "flowers": fairy_topper,
    "cap": athlete_topper, "jacket": rocker_topper, "chefhat": chef_topper, "helmet": astro_topper,
}


def darker(h, k=0.55):
    return tuple(c * k for c in hex_lin(h)[:3]) + (1.0,)


def outfit_mats(Mv, kind, a, b, v):
    n = f"_v{v}"
    if kind == "astro":
        Mv["outfit_a"] = make_mat("outfit_a" + n, a, 0.5, normal=nrm_quilt("suit_n.png"), sheen=0.5)
    else:
        Mv["outfit_a"] = make_mat("outfit_a" + n, a, 0.38, normal=nrm_weave(), sheen=1.0, sheen_rough=0.3, coat=0.25, coat_rough=0.25)
    Mv["outfit_b"] = make_mat("outfit_b" + n, b, 0.4, normal=nrm_weave("weave_b.png", 0.6), sheen=0.8, sheen_rough=0.35, coat=0.15)
    Mv["tulle"] = make_mat("outfit_tulle" + n, "#ffffff", 0.6, tex=tex_net(), alpha=0.5, sheen=0.6)
    Mv["outfit_plaid"] = make_mat("outfit_plaid" + n, b, 0.6, tex=tex_plaid_gray("plaid.png"), sheen=0.3)
    Mv["outfit_check"] = make_mat("outfit_check" + n, b, 0.62, tex=tex_check_gray("check.png"), sheen=0.5)
    Mv["outfit_leaf"] = make_mat("outfit_leaf" + n, "#4fb06b", 0.45, sheen=0.7)


def shoe_mats(Mv, kind, a, b, v):
    n = f"_v{v}"
    Mv["shoes_a"] = make_mat("shoes_a" + n, a, 0.45 if kind == "boots" else 0.4, normal=nrm_leather("boot_n.png") if kind == "boots" else None, sheen=0.15, coat=0.25, coat_rough=0.25)
    Mv["shoes_b"] = make_mat("shoes_b" + n, b, 0.45, sheen=0.4)


def acc_mats(Mv, kind, a, b, v):
    n = f"_v{v}"
    Mv["accessory_a"] = make_mat("accessory_a" + n, a, 0.3 if kind in ("glasses", "necklace") else 0.4, metal=1.0 if kind in ("glasses",) else 0.0, coat=0.3, coat_rough=0.3)
    Mv["ribbon"] = make_mat("accessory_ribbon" + n, a, 0.45, sheen=0.8)
    Mv["lens"] = make_mat("accessory_lens" + n, b, 0.05, alpha=0.5, coat=1.0, coat_rough=0.02, spec=1.0)
    Mv["gem_blue"] = make_mat("gem_" + n, b, 0.06, coat=1.0, coat_rough=0.02, spec=1.0, emission=b, emission_strength=0.25)


def top_mats(Mv, kind, a, b, v):
    n = f"_v{v}"
    if kind == "helmet":
        Mv["topper_a"] = make_mat("topper_a" + n, "#dfeeff", 0.03, alpha=0.14, coat=1.0, coat_rough=0.02, spec=1.0)
        Mv["topper_b"] = make_mat("topper_b" + n, b, 0.3, metal=0.8)
    elif kind == "jacket":
        Mv["topper_a"] = make_mat("topper_a" + n, a, 0.4, normal=nrm_leather("jacket_n.png"), coat=0.35, coat_rough=0.3)
        Mv["topper_b"] = make_mat("topper_b" + n, b, 0.5, sheen=0.6)
    elif kind == "chefhat":
        Mv["topper_a"] = make_mat("topper_a" + n, a, 0.7, normal=nrm_weave("weave_h.png", 0.8), sheen=0.7)
        Mv["topper_b"] = make_mat("topper_b" + n, b, 0.5, sheen=0.6)
    else:
        Mv["topper_a"] = make_mat("topper_a" + n, a, 0.85 if kind == "hat" else 0.55, normal=nrm_weave("weave_t.png", 0.8), sheen=0.8)
        Mv["topper_b"] = make_mat("topper_b" + n, b, 0.5, sheen=0.6)


def build_variants(root, d, M):
    did = d["id"]
    S = SETS
    for v in range(4):
        Mv = dict(M)
        # vlasy
        kind, col = S.HAIR[did][v]
        Mv["hair"] = make_mat(f"hair_a_v{v}", col, 0.36, tex=strand_texture(), sheen=0.5, sheen_rough=0.35, coat=0.15, coat_rough=0.3)
        Mv["hair_root"] = make_mat(f"hair_root_v{v}", darker(col), 0.55)
        Mv["accessory_a"] = make_mat(f"hair_tie_v{v}", "#ff7eb6" if v % 2 else "#e6b84a", 0.4)
        build_hair(root, dict(d, hair=(kind, col)), Mv, name=f"slot_hair_v{v}")
        # šaty
        kind, a, b = S.OUTFIT[did][v]
        outfit_mats(Mv, kind, a, b, v)
        OUTFIT_FN[kind](root, d, Mv, name=f"slot_outfit_v{v}")
        # boty
        kind, a, b = S.SHOES[did][v]
        shoe_mats(Mv, kind, a, b, v)
        SHOES_FN[kind](root, d, Mv, name=f"slot_shoes_v{v}")
        # doplněk
        kind, a, b = S.ACCESSORY[did][v]
        acc_mats(Mv, kind, a, b, v)
        ACC_FN[kind](root, d, Mv, name=f"slot_accessory_v{v}")
        # čepice, přilba, bunda
        kind, a, b = S.TOPPER[did][v]
        top_mats(Mv, kind, a, b, v)
        TOP_FN[kind](root, d, Mv, name=f"slot_topper_v{v}")
        # make-up: překrývací hlava s texturou + horní víčka
        lips, shadow, blush = S.MAKEUP[did][v]
        dm = dict(d, makeup=(lips, shadow, blush))
        glitter = (22 if v == 3 else 6 if v == 0 else 0)
        Mv["makeup"] = make_mat(f"makeup_face_v{v}", "#ffffff", 0.45, tex=makeup_texture(dm, f"makeup_{did}_v{v}.png", glitter=glitter, strength=1.0), alpha=1.0)
        n = node(f"slot_makeup_v{v}", root)
        head_mesh("makeup_face", Mv["makeup"], n, off=0.0012)
        makeup_lids(n, dm, f"makeup_lid_{did}_v{v}", glitter=glitter)
