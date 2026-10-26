"""Převede rendery z `frames.py` do `public/cosmetics/frames/<id>.webp` (512 × 512) a přidá záři neonu a ohně.

    python umime-art/scripts/frames_publish.py <složka z frames.py>
"""

import os
import sys

from PIL import Image, ImageChops, ImageFilter

src = sys.argv[1]
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "cosmetics", "frames")
os.makedirs(dst, exist_ok=True)

# poloměr rozostření a síla záře; zbylé rámečky se jen zmenší
GLOW = {"neon": (14, 1.1), "fire": (10, 0.9)}


def add_glow(im: Image.Image, radius: float, strength: float) -> Image.Image:
    # záře je rozostřená kopie obrázku; sčítá se s původním přes alfu
    glow = im.filter(ImageFilter.GaussianBlur(radius))
    r, g, b, a = glow.split()
    a = a.point(lambda v: min(255, int(v * strength * 1.6)))
    glow = Image.merge("RGBA", (r, g, b, a))
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out = Image.alpha_composite(out, glow)
    out = Image.alpha_composite(out, im)
    # záře se na okraji obrázku vytratí, aby nebyl vidět čtverec
    w, h = im.size
    mask = Image.new("L", im.size, 0)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            d = ((x - w / 2) ** 2 + (y - h / 2) ** 2) ** 0.5
            px[x, y] = 255 if d < w * 0.465 else max(0, int(255 * (1 - (d - w * 0.465) / (w * 0.035))))
    out.putalpha(ImageChops.multiply(out.getchannel("A"), mask))
    return out


for name in ("gold", "rainbow", "neon", "leaf", "stars", "fire"):
    path = os.path.join(src, name + ".png")
    if not os.path.exists(path):
        continue
    im = Image.open(path).convert("RGBA").resize((512, 512), Image.LANCZOS)
    if name in GLOW:
        im = add_glow(im, *GLOW[name])
    im.save(os.path.join(dst, name + ".webp"), quality=92, method=6)
    print("published", name)
