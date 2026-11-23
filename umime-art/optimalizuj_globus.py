"""Zmenší a znovu zakóduje obrázky globusu v public/home/globe (spouští se pythonem s Pillow).
Památky jsou pásy 24 snímků: 448 px na snímek je na 150–190 px zobrazení zbytečně moc (a pás se rozbaluje na ~19 MB),
proto 320 px. Textura dat (reliéf, mraky) je hladká, stačí 2048×1024; albedo a mapa zemí zůstávají v plné velikosti."""
import glob
import os

from PIL import Image

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "home", "globe")
FRAMES, FRAME = 24, 320
LANDMARKS = ["cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis",
             "prirodopis", "fyzika", "chemie", "obcanka", "hudebka", "francouzstina", "spanelstina"]


def save(im, name, **kw):
    path = os.path.join(DIR, name)
    before = os.path.getsize(path)
    im.save(path, format="WEBP", method=6, **kw)
    print(name, round(before / 1024), "→", round(os.path.getsize(path) / 1024), "kB", im.size)


for slug in LANDMARKS:
    sheet = Image.open(os.path.join(DIR, slug + ".webp")).convert("RGBA")
    w = sheet.width // FRAMES
    out = Image.new("RGBA", (FRAME * FRAMES, FRAME), (0, 0, 0, 0))
    for i in range(FRAMES):
        f = sheet.crop((i * w, 0, (i + 1) * w, sheet.height)).resize((FRAME, FRAME), Image.LANCZOS)
        out.paste(f, (i * FRAME, 0))
    save(out, slug + ".webp", quality=74, alpha_quality=80)

data = Image.open(os.path.join(DIR, "data.webp")).convert("RGB")
save(data.resize((2048, 1024), Image.LANCZOS), "data.webp", quality=82)
