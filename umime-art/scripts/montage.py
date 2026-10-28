"""Složí vybrané snímky z umime-art/out/<jméno>/ vedle sebe na tmavém pozadí (kontrola vzhledu)."""
import glob, os, sys
from PIL import Image
name, outp = sys.argv[1], sys.argv[2]
files = glob.glob(os.path.join(os.path.dirname(__file__), "..", "out", name, "f_*.png"))
newest = max(os.path.getmtime(f) for f in files)
files = sorted(f for f in files if newest - os.path.getmtime(f) < 300)[:6]  # jen čerstvě vykreslené snímky
ims = [Image.open(f).convert("RGBA") for f in files]
w, h = ims[0].size
sheet = Image.new("RGB", (w * len(ims), h), (40, 90, 150))
for i, im in enumerate(ims):
    sheet.paste(im, (i * w, 0), im)
sheet.save(outp)
