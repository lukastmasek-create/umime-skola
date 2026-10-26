"""Opraví snímky spritů, jejichž obsah zasahuje až na okraj buňky (oříznuté drápy, výbuchy, plameny).

    python umime-art/scripts/fix_sprite_edges.py [--dry]

Snímek se zmenší na 90 % kolem středu a u okrajů buňky se průhlednost zjemní, aby nezůstala ostrá
oříznutá hrana. Dlaždice, pozadí a články, které na sebe navazují přes okraj buňky, se nemění.
"""

import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "game-sprites")
DRY = "--dry" in sys.argv

# skupiny, které mají zasahovat až na okraj (dlaždice, pozadí, díly navazující na sousední buňku)
KEEP = {
    ("breakout", "cihly"), ("breakout", "odpovedi"), ("breakout", "palka"), ("breakout", "micek"),
    ("centipede", "clanky"), ("centipede", "houby"), ("flappy", "zed_hlavice"), ("flappy", "zed_telo"),
    ("kong", "dlazdice"), ("kong", "zebrik"), ("mario", "kopce_blizke"), ("mario", "kopce_daleke"),
    ("mario", "nebe"), ("mario", "nebe_boss"), ("mario", "zem"), ("mole", "dira"), ("mole", "krtek"),
    ("pacman", "bludiste"), ("snake", "had"), ("space", "pozadi_mlhovina"), ("tetris", "kostky"),
}
FIT = 0.9
FEATHER = 3


def edge_pixels(cell):
    a = cell[:, :, 3]
    return int((a[0] > 60).sum() + (a[-1] > 60).sum() + (a[:, 0] > 60).sum() + (a[:, -1] > 60).sum())


def fix(cell: Image.Image) -> Image.Image:
    w, h = cell.size
    small = cell.resize((round(w * FIT), round(h * FIT)), Image.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(small, ((w - small.width) // 2, (h - small.height) // 2))
    arr = np.array(out).astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy]).astype(np.float32)
    arr[:, :, 3] *= np.clip(d / FEATHER, 0, 1)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


total = 0
for game in sorted(os.listdir(ROOT)):
    jp = os.path.join(ROOT, game, game + ".json")
    if not os.path.exists(jp):
        continue
    meta = json.load(open(jp))
    for gname, g in meta["groups"].items():
        if (game, gname) in KEEP:
            continue
        path = os.path.join(ROOT, game, g["file"])
        sheet = Image.open(path).convert("RGBA")
        cw, ch = g["cell"]
        changed = []
        for fname, (c, r) in g["frames"].items():
            box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            cell = sheet.crop(box)
            if edge_pixels(np.array(cell)) > 8:
                sheet.paste(fix(cell), box[:2])
                changed.append(fname)
        if changed:
            total += len(changed)
            print(game, gname, changed)
            if not DRY:
                sheet.save(path, quality=92, method=6)
print("snímků:", total)
