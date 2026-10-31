"""Složí snímky tematických podstavců (out/profil_podstavec_<téma>/f_0001.png …) do pásu 24 × 448 px pro web
(public/home/profil/podstavec-<téma>.webp, animuje ho třída .globe-sprite).
Spuštění: python podstavce_publish.py [vesmir more les hrad kouzla]"""
import os
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUB = os.path.abspath(os.path.join(ROOT, "..", "public", "home", "profil"))
SIZE, N = 448, 24

for theme in sys.argv[1:] or ["vesmir", "more", "les", "hrad", "kouzla"]:
    src = os.path.join(ROOT, "out", f"profil_podstavec_{theme}")
    strip = Image.new("RGBA", (SIZE * N, SIZE))
    for i in range(N):
        f = Image.open(os.path.join(src, "f_%04d.png" % (i + 1))).convert("RGBA").resize((SIZE, SIZE), Image.LANCZOS)
        strip.paste(f, (i * SIZE, 0))
    out = os.path.join(PUB, f"podstavec-{theme}.webp")
    strip.save(out, "WEBP", quality=80, method=6)
    print(out, os.path.getsize(out) // 1024, "kB")
