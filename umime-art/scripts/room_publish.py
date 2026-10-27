"""Převede rendery z `room.py` do `public/room/`.

    python umime-art/scripts/room_publish.py <složka z room.py>

furniture/<id>.webp (256 × 256, průhledné; místo, kde nábytek stojí na podlaze, je ve 65 % výšky obrázku)
a background.webp (1600 × 1000).
"""

import os
import sys

from PIL import Image

src = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "room")
os.makedirs(os.path.join(root, "furniture"), exist_ok=True)

d = os.path.join(src, "furniture")
for f in sorted(os.listdir(d)):
    if f.endswith(".png"):
        Image.open(os.path.join(d, f)).convert("RGBA").resize((256, 256), Image.LANCZOS).save(
            os.path.join(root, "furniture", f[:-4] + ".webp"), quality=88, method=6
        )
Image.open(os.path.join(src, "background.png")).convert("RGB").save(os.path.join(root, "background.webp"), quality=84, method=6)
print("published room")
