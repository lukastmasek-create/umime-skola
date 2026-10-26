"""Složí vyrenderované PNG snímky z out/ do webp souborů v public/home/anim (spouští se pythonem s Pillow)."""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(ROOT, "..", "public", "home", "anim")
os.makedirs(DEST, exist_ok=True)


def frames(name, size=None):
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, "out", name, "f_*.png"))):
        im = Image.open(f).convert("RGBA")
        if size:
            im = im.resize(size, Image.LANCZOS)
        out.append(im)
    return out


def animated(name, dest, fps=24, quality=70, size=None, loop=0):
    fr = frames(name, size)
    path = os.path.join(DEST, dest)
    fr[0].save(path, format="WEBP", save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=loop,
               quality=quality, method=5, alpha_quality=85)
    print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


def strip(name, dest, size, quality=72):
    """Pás snímků vedle sebe (pro CSS steps())."""
    fr = frames(name, size)
    sheet = Image.new("RGBA", (size[0] * len(fr), size[1]), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * size[0], 0))
    path = os.path.join(DEST, dest)
    sheet.save(path, format="WEBP", quality=quality, method=5, alpha_quality=85)
    print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)


def still(name, dest, size=None, quality=86):
    path = os.path.join(DEST, dest)
    fr = frames(name, size)
    fr[0].save(path, format="WEBP", quality=quality, method=5, alpha_quality=90)
    print(dest, round(os.path.getsize(path) / 1024), "kB", fr[0].size)


def icons():
    """Čtyři realistické ikony sekcí (1024 px z Blenderu) zmenšené na 512 px do public/home."""
    for name, dest in (("sekce_zakladni", "sekce-zakladni.webp"), ("sekce_stredni", "sekce-stredni.webp"),
                       ("sekce_prijimacky", "sekce-prijimacky.webp"), ("sekce_maturita", "sekce-maturita.webp")):
        fr = frames(name, (512, 512))
        path = os.path.join(DEST, "..", dest)
        fr[0].save(path, format="WEBP", quality=90, method=5, alpha_quality=95)
        print(dest, round(os.path.getsize(path) / 1024), "kB")


def stills():
    """První snímek animací jako statický obrázek pro lidi s vypnutými animacemi."""
    for name, dest in (("motyl", "motyl-still.webp"), ("vlajka", "vlajka-still.webp"), ("raketa", "raketa-still.webp")):
        still(name, dest, quality=82)


if __name__ == "__main__":
    what = sys.argv[1:] or ["planeta", "motyl", "vlajka", "raketa", "liana", "kvetina", "hory", "stills", "icons"]
    if "icons" in what: icons()
    if "stills" in what: stills()
    if "planeta" in what: animated("planeta", "planeta.webp", fps=24, quality=68)
    if "motyl" in what: animated("motyl", "motyl.webp", fps=24, quality=72)
    if "vlajka" in what: animated("vlajka", "vlajka.webp", fps=24, quality=72)
    if "raketa" in what: animated("raketa", "raketa.webp", fps=24, quality=72)
    if "liana" in what: strip("liana", "liana-strip.webp", (288, 288))
    if "kvetina" in what: strip("kvetina", "kvetina-strip.webp", (192, 192))
    if "hory" in what:
        for n in ("zadni", "stredni", "predni"):
            still(f"hory_{n}", f"hory-{n}.webp")
