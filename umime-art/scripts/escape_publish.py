"""Převede rendery z `escape_rooms.py` do `public/escape/<místnost>/`.

    python umime-art/scripts/escape_publish.py <složka z escape_rooms.py> [místnost]

Pro každou místnost vznikne:
- `bg.webp` (1600 × 900), celá místnost ve výchozím stavu
- `b_open.webp`, `d_used.webp`, `e_on.webp`, `door_open.webp`: výřezy změněných částí
  (obdélníky musí odpovídat `ART_PATCHES` v `src/lib/escape/art.ts`)
- `items/<id>.webp` (128 × 128, průhledné)
"""

import os
import sys

from PIL import Image

src = sys.argv[1]
only = sys.argv[2] if len(sys.argv) > 2 else None
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "escape")

# Obdélníky v jednotkách SVG 800 × 450 (x0, y0, x1, y1); stejné jako ART_PATCHES.
REGIONS = {
    "b_open": (268, 88, 462, 312),
    "d_used": (462, 10, 610, 110),
    "e_on": (470, 228, 600, 360),
    "door_open": (626, 98, 774, 396),
}

for room in sorted(os.listdir(src)):
    if only and room != only:
        continue
    d = os.path.join(src, room)
    if not os.path.isdir(d):
        continue
    dst = os.path.join(root, room)
    os.makedirs(os.path.join(dst, "items"), exist_ok=True)
    bg = Image.open(os.path.join(d, "bg.png")).convert("RGB")
    bg.save(os.path.join(dst, "bg.webp"), quality=86, method=6)
    k = bg.size[0] / 800
    for name, (x0, y0, x1, y1) in REGIONS.items():
        im = Image.open(os.path.join(d, "st_" + name + ".png")).convert("RGB")
        im.crop((round(x0 * k), round(y0 * k), round(x1 * k), round(y1 * k))).save(
            os.path.join(dst, name + ".webp"), quality=88, method=6
        )
    for f in sorted(os.listdir(d)):
        if f.startswith("it_"):
            im = Image.open(os.path.join(d, f)).convert("RGBA").resize((128, 128), Image.LANCZOS)
            im.save(os.path.join(dst, "items", f[3:-4] + ".webp"), quality=90, method=6)
    print("published", room)
