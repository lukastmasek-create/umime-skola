"""Diorámata stálých her pro hero ve vyšší kvalitě: stejné scény jako stale_hry.py, ale AgX, víc vzorků a větší snímek.

    ../../.venv-art/bin/python hero_hry.py -- <výstupní složka> [farma mesto mazlicci ...] [--frame N] [--samples 64] [--size 512]

Snímky se renderují do umime-art/out/hra_<název>/ a pak se složí do pásu <název>.webp (24 snímků po 384 px)
a <název>-still.webp ve výstupní složce (public/home/hero3d/hry/).
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]


def opt(name, default):
    if name in argv:
        i = argv.index(name)
        v = argv[i + 1]
        del argv[i : i + 2]
        return type(default)(v)
    return default


SAMPLES = opt("--samples", 96)
SIZE = opt("--size", 512)
FRAME = opt("--frame", 0)
OUT = argv[0] if argv else "/tmp/hero-hry"
JOBS_WANTED = argv[1:] or ["farma", "mesto", "mazlicci"]
# stale_hry / znacky_lib si čtou vlastní argumenty (--frame, --preview), tak jim je předáme
sys.argv = [sys.argv[0], "--"] + (["--frame", str(FRAME)] if FRAME else [])

import bpy  # noqa: E402
import znacky_lib as z  # noqa: E402

_reset = z.reset


def reset_hq(width, height, frames, **k):
    k["samples"] = SAMPLES
    sc = _reset(SIZE, SIZE, frames, **k)
    sc.cycles.max_bounces = 10
    sc.cycles.caustics_reflective = False
    sc.cycles.sample_clamp_indirect = 8
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.exposure = 0.55
    try:
        sc.view_settings.look = "AgX - Punchy"
    except TypeError:
        pass
    return sc


z.reset = reset_hq
import stale_hry as s  # noqa: E402

for name in JOBS_WANTED:
    sys.argv = [sys.argv[0], "--", name] + (["--frame", str(FRAME)] if FRAME else [])
    z.ANIM.clear()  # animační funkce z předchozí scény by sahaly na smazané objekty
    s.JOBS[name]()
    if FRAME:
        continue
    from PIL import Image

    folder = os.path.join(z.OUT, "hra_" + name)
    files = sorted(f for f in os.listdir(folder) if f.endswith(".png"))
    px = 384
    from PIL import ImageEnhance

    def grade(im):
        """AgX je střídmé, tak barvy a kontrast mírně přidáme (alfa zůstane)."""
        a = im.getchannel("A")
        rgb = ImageEnhance.Contrast(ImageEnhance.Color(im.convert("RGB")).enhance(1.4)).enhance(1.06)
        rgb.putalpha(a)
        return rgb

    fr = [grade(Image.open(os.path.join(folder, f)).convert("RGBA").resize((px, px), Image.LANCZOS)) for f in files]
    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new("RGBA", (px * len(fr), px), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * px, 0))
    sheet.save(os.path.join(OUT, name + ".webp"), format="WEBP", quality=80, method=5, alpha_quality=88)
    fr[0].save(os.path.join(OUT, name + "-still.webp"), format="WEBP", quality=88, method=5, alpha_quality=92)
    print("hotovo:", name, len(fr), "snímků")
