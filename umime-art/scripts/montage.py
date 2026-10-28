"""Složí vybrané snímky z umime-art/out/<jméno>/ vedle sebe na tmavém pozadí (kontrola vzhledu)."""
import glob, os, sys
from PIL import Image
name, outp = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(os.path.dirname(__file__), "..", "out", name, "f_*.png")))[:6]
ims = [Image.open(f).convert("RGBA") for f in files]
w, h = ims[0].size
sheet = Image.new("RGB", (w * len(ims), h), (40, 90, 150))
for i, im in enumerate(ims):
    sheet.paste(im, (i * w, 0), im)
sheet.save(outp)
