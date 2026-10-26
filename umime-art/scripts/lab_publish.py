"""Převede rendery z `lab.py` do `public/escape/lab/`.

    python umime-art/scripts/lab_publish.py <složka s PNG z lab.py> [<cílová složka>]

- `bg.png` -> `bg.webp` (1600 × 900)
- `st_<stav>.png` -> výřezy změněných částí (viz REGIONS) jako `<stav>.webp` + obdélníky v `lab.json`
  (souřadnice jsou v SVG jednotkách 800 × 450, aby šly rovnou do `<image x y width height>`)
- `it_<id>.png` -> `items/<id>.webp` (128 × 128, průhledné)
"""

import json
import os
import sys

from PIL import Image

src = sys.argv[1]
dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "..", "public", "escape", "lab")
os.makedirs(os.path.join(dst, "items"), exist_ok=True)

bg = Image.open(os.path.join(src, "bg.png")).convert("RGB")
bg.save(os.path.join(dst, "bg.webp"), quality=86, method=6)

W, H = bg.size
scale = W / 800

# Oblasti (v jednotkách SVG 800 × 450), které se v jednotlivých stavech mění. Každá je samostatný výřez,
# aby se výřezy různých stavů nepřekrývaly (například počítač nepřepíše otevřenou skříňku).
REGIONS = {
    "cabinet_open": [(268, 88, 462, 312)],
    "vent_used": [(505, 48, 560, 98)],
    "pc_on": [(474, 250, 586, 332), (650, 218, 700, 284)],
    "door_open": [(626, 98, 774, 396)],
    "reactor_warn": [(585, 196, 650, 332)],
    "reactor_crit": [(585, 196, 650, 332)],
}
manifest = {"size": [800, 450], "states": {}}

for f in sorted(os.listdir(src)):
    if f.startswith("st_"):
        name = f[3:-4]
        im = Image.open(os.path.join(src, f)).convert("RGB")
        patches = []
        for i, (x0, y0, x1, y1) in enumerate(REGIONS[name]):
            file = f"{name}{'' if len(REGIONS[name]) == 1 else '-' + str(i + 1)}.webp"
            im.crop((round(x0 * scale), round(y0 * scale), round(x1 * scale), round(y1 * scale))).save(
                os.path.join(dst, file), quality=88, method=6
            )
            patches.append({"file": file, "x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0})
        manifest["states"][name] = patches
    elif f.startswith("it_"):
        im = Image.open(os.path.join(src, f)).convert("RGBA").resize((128, 128), Image.LANCZOS)
        im.save(os.path.join(dst, "items", f[3:-4] + ".webp"), quality=90, method=6)

with open(os.path.join(dst, "lab.json"), "w") as fh:
    json.dump(manifest, fh, indent=2)
print(json.dumps(manifest, indent=2))
