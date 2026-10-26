"""Převede rendery z `banners.py` do `public/cosmetics/banners/<id>.webp` (1200 × 400).

    python umime-art/scripts/banners_publish.py <složka z banners.py>
"""

import os
import sys

from PIL import Image

src = sys.argv[1]
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "cosmetics", "banners")
os.makedirs(dst, exist_ok=True)
for name in ("sunset", "ocean", "forest", "galaxy", "candy", "night-city", "snow"):
    path = os.path.join(src, name + ".png")
    if not os.path.exists(path):
        continue
    Image.open(path).convert("RGB").resize((1200, 400), Image.LANCZOS).save(os.path.join(dst, name + ".webp"), quality=88, method=6)
    print("published", name)
