"""Složí snímky z /tmp/banner-frames/<scena>/ do animovaného WebP (volitelně s jemnou září)."""
import argparse
import glob
import os

import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("scene")
ap.add_argument("--fps", type=int, default=15)
ap.add_argument("--glow", type=float, default=0.0)
ap.add_argument("--quality", type=int, default=70)
ap.add_argument("--src", default="")
ap.add_argument("--out", default="")
a = ap.parse_args()

src = a.src or f"/tmp/banner-frames/{a.scene}"
out = a.out or f"public/cosmetics/banners/anim/{a.scene}.webp"
files = sorted(glob.glob(os.path.join(src, "f*.png")))
frames = []
for f in files:
    im = Image.open(f).convert("RGB")
    if a.glow:
        arr = np.asarray(im).astype(np.float32) / 255
        lum = arr.max(axis=2, keepdims=True)
        bright = arr * np.clip((lum - 0.7) / 0.3, 0, 1)
        b = Image.fromarray((bright * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
        arr = np.clip(arr + np.asarray(b).astype(np.float32) / 255 * a.glow, 0, 1)
        im = Image.fromarray((arr * 255).astype(np.uint8))
    frames.append(im)
os.makedirs(os.path.dirname(out), exist_ok=True)
frames[0].save(out, save_all=True, append_images=frames[1:], duration=int(1000 / a.fps), loop=0, quality=a.quality, method=4)
print(out, len(frames), "frames", os.path.getsize(out) // 1024, "kB")
