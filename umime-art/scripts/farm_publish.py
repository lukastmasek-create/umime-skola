"""Převede rendery z `farm.py` do `public/farm/`.

    python umime-art/scripts/farm_publish.py <složka z farm.py>

crops/<plodina>_<stadium>.webp a soil.webp (256 × 256), animals/<zvíře>.webp (256 × 256),
icons/<surovina>.webp (128 × 128), hero.webp (1600 × 520); vše průhledné kromě hero.
"""

import os
import sys

from PIL import Image

src = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "farm")


def save(rel, size=None, rgba=True, q=88):
    im = Image.open(os.path.join(src, rel + ".png")).convert("RGBA" if rgba else "RGB")
    if size:
        im = im.resize(size, Image.LANCZOS)
    out = os.path.join(root, rel + ".webp")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, quality=q, method=6)


for group, size in (("crops", (256, 256)), ("animals", (256, 256)), ("icons", (128, 128))):
    d = os.path.join(src, group)
    for f in sorted(os.listdir(d)):
        if f.endswith(".png"):
            save(f"{group}/{f[:-4]}", size)
save("soil", (256, 256))
save("hero", None, rgba=False, q=84)
print("published farm")
