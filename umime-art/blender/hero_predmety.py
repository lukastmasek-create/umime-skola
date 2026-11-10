"""Předměty pro hero: stejné modely jako scripts/predmety.py, ale ve vyšší kvalitě (víc vzorků, AgX s vyšším kontrastem).

    ../../.venv-art/bin/python hero_predmety.py -- <výstupní složka> [slug ...]

Výstup: <složka>/<slug>.webp 512 × 512 s průhledností (do public/home/hero3d/predmety/).
"""
import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else sys.argv[1:]
out = argv[0] if argv else "/tmp/hero-predmety"
only = argv[1:] or ["cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis"]
sys.argv = [sys.argv[0], out] + only

spec = importlib.util.spec_from_file_location("predmety", os.path.join(HERE, "..", "scripts", "predmety.py"))
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)

_setup = p.setup_scene


def setup_hq(res=1024):
    _setup(1152)
    sc = p.bpy.context.scene
    sc.cycles.samples = 170
    sc.cycles.max_bounces = 10
    sc.cycles.sample_clamp_indirect = 8
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.exposure = 0.45
    try:
        sc.view_settings.look = "AgX - Punchy"
    except TypeError:
        pass


p.setup_scene = setup_hq

os.makedirs(out, exist_ok=True)
p.render_all(p.BUILDERS, p.CAM, only, out, "")

# AgX je střídmé, tak po renderu barvy a kontrast mírně přidáme (alfa zůstane)
from PIL import Image, ImageEnhance

for slug in only:
    f = os.path.join(out, slug + ".webp")
    im = Image.open(f).convert("RGBA")
    a = im.getchannel("A")
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(im.convert("RGB")).enhance(1.3)).enhance(1.05)
    rgb.putalpha(a)
    rgb.save(f, quality=90, method=6)
    png = os.path.join(out, slug + ".png")
    if os.path.exists(png):
        os.remove(png)
