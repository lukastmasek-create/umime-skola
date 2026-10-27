"""Složí snímky z `home_anim.py` do vodorovných pásů `public/home/anim/<id>.webp` a vypíše rozměry pro web.

    python umime-art/scripts/home_anim_publish.py <složka se snímky> [id …]

Všechny snímky jednoho pohybu se ořežou na společný obdélník (aby se neposouvaly) a zmenší na výšku `H`.
"""

import glob
import os
import re
import sys

from PIL import Image

SRC = sys.argv[1]
ONLY = set(sys.argv[2:])
DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "home", "anim")
H = 256
os.makedirs(DEST, exist_ok=True)

names = sorted({re.sub(r"_\d+\.png$", "", os.path.basename(f)) for f in glob.glob(os.path.join(SRC, "*_*.png"))})
for name in names:
    if ONLY and name not in ONLY:
        continue
    files = sorted(glob.glob(os.path.join(SRC, f"{name}_[0-9][0-9].png")))
    ims = [Image.open(f).convert("RGBA") for f in files]
    box = None
    for im in ims:
        b = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
        if b:
            box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    pad = 6
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(ims[0].width, box[2] + pad), min(ims[0].height, box[3] + pad))
    w, h = box[2] - box[0], box[3] - box[1]
    fw = round(w * H / h)
    strip = Image.new("RGBA", (fw * len(ims), H))
    for i, im in enumerate(ims):
        strip.paste(im.crop(box).resize((fw, H), Image.LANCZOS), (i * fw, 0))
    out = os.path.join(DEST, f"{name}.webp")
    strip.save(out, "WEBP", quality=88, method=6)
    print(f"{name}: {len(ims)} snímků, snímek {fw}x{H}, poměr {fw / H:.3f}, {os.path.getsize(out) // 1024} kB")
