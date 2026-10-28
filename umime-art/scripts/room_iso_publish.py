"""Zapíše izometrický pokoj z `room_iso.py` do `public/room/iso.webp` a `src/lib/room-layout.json`.

    python umime-art/scripts/room_iso_publish.py <složka z room_iso.py>
"""
import json
import os
import shutil
import sys

from PIL import Image

src = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
Image.open(os.path.join(src, "room_iso.png")).convert("RGBA").save(os.path.join(root, "public", "room", "iso.webp"), quality=86, method=6, alpha_quality=92)
shutil.copy(os.path.join(src, "layout.json"), os.path.join(root, "src", "lib", "room-layout.json"))
print("published iso room", round(os.path.getsize(os.path.join(root, "public", "room", "iso.webp")) / 1024), "kB")
