"""Složí vyrenderované PNG snímky z out/ do webp souborů v public/home/anim (spouští se pythonem s Pillow)."""
import glob
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(ROOT, "..", "public", "home", "anim")
os.makedirs(DEST, exist_ok=True)


def frames(name, size=None, step=1):
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, "out", name, "f_*.png")))[::step]:
        im = Image.open(f).convert("RGBA")
        if size:
            im = im.resize(size, Image.LANCZOS)
        out.append(im)
    return out


def animated(name, dest, fps=24, quality=70, size=None, loop=0, step=1):
    fr = frames(name, size, step)
    path = os.path.join(DEST, dest)
    fr[0].save(path, format="WEBP", save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=loop,
               quality=quality, method=5, alpha_quality=60 if dest.startswith("sopka") else 85)
    print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


def strip(name, dest, size, quality=72):
    """Pás snímků vedle sebe (pro CSS steps())."""
    fr = frames(name, size)
    sheet = Image.new("RGBA", (size[0] * len(fr), size[1]), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * size[0], 0))
    path = os.path.join(DEST, dest)
    sheet.save(path, format="WEBP", quality=quality, method=5, alpha_quality=60 if dest.startswith("sopka") else 85)
    print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)


def still(name, dest, size=None, quality=86):
    path = os.path.join(DEST, dest)
    fr = frames(name, size)
    fr[0].save(path, format="WEBP", quality=quality, method=5, alpha_quality=90)
    print(dest, round(os.path.getsize(path) / 1024), "kB", fr[0].size)


def icons():
    """Čtyři realistické ikony sekcí (1024 px z Blenderu): ořez na obsah, na čtverec 512 px do public/home."""
    for name, dest in (("sekce_zakladni", "sekce-zakladni.webp"), ("sekce_stredni", "sekce-stredni.webp"),
                       ("sekce_prijimacky", "sekce-prijimacky.webp"), ("sekce_maturita", "sekce-maturita.webp")):
        im = frames(name)[0]
        alpha = im.getchannel("A").point(lambda a: 255 if a > 24 else 0)
        box = alpha.getbbox()
        im = im.crop(box)
        side = int(max(im.size) * 1.1)
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
        canvas = canvas.resize((512, 512), Image.LANCZOS)
        path = os.path.join(DEST, "..", dest)
        canvas.save(path, format="WEBP", quality=90, method=5, alpha_quality=95)
        print(dest, round(os.path.getsize(path) / 1024), "kB")


def planet_live():
    """Vrstvy planet pro živé vykreslení ve WebGL (PlanetLive.tsx): dolní oranžová (pv_) a horní fialová (hv_)."""
    for prefix, folder in (("pv_", "planet-live"), ("hv_", "planet-hero")):
        dest_dir = os.path.join(DEST, "..", folder)
        os.makedirs(dest_dir, exist_ok=True)
        for name, dest, quality in (("albedo", "albedo.webp", 88), ("stin", "stin.webp", 94), ("halo", "halo.webp", 88),
                                    ("prsten_zadni", "prsten-zadni.webp", 90), ("prsten_predni", "prsten-predni.webp", 90),
                                    ("mesic1", "mesic1.webp", 92), ("mesic2", "mesic2.webp", 92)):
            if not glob.glob(os.path.join(ROOT, "out", prefix + name, "f_*.png")):
                continue
            im = frames(prefix + name)[0]
            path = os.path.join(dest_dir, dest)
            im.save(path, format="WEBP", quality=quality, method=5, alpha_quality=96)
            print(folder, dest, round(os.path.getsize(path) / 1024), "kB", im.size)


def globe():
    """Památky předmětů (pás 20 snímků) a školní předměty prstence pro SubjectGlobe do public/home/globe."""
    dest_dir = os.path.join(DEST, "..", "globe")
    os.makedirs(dest_dir, exist_ok=True)
    for subject in ("cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis"):
        fr = frames("znacka_" + subject)
        w, h = fr[0].size
        sheet = Image.new("RGBA", (w * len(fr), h), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * w, 0))
        path = os.path.join(dest_dir, subject + ".webp")
        sheet.save(path, format="WEBP", quality=74, method=5, alpha_quality=80)
        print(subject, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)
    for name in ("kniha", "tuzka", "banka", "atom", "kalkulacka", "pravitko", "cepice", "zarovka", "lupa", "glob", "kostky", "svitek", "letadlo", "raketa", "mikroskop", "kruzitko", "sesit", "dna", "pero", "rostlina"):
        im = frames("pr_" + name)[0]
        path = os.path.join(dest_dir, "obj-" + name + ".webp")
        im.save(path, format="WEBP", quality=86, method=5, alpha_quality=92)
        print("obj-" + name, round(os.path.getsize(path) / 1024), "kB", im.size)


def stills():
    """První snímek animací jako statický obrázek pro lidi s vypnutými animacemi."""
    for name, dest in (("motyl", "motyl-still.webp"), ("vlajka", "vlajka-still.webp"), ("raketa", "raketa-still.webp")):
        still(name, dest, quality=82)


if __name__ == "__main__":
    what = sys.argv[1:] or ["planeta", "motyl", "vlajka", "raketa", "liana", "kvetina", "hory", "stills", "icons", "planeta_live", "globe"]
    if "icons" in what: icons()
    if "stills" in what: stills()
    # Planeta má hodně jemného detailu: každý druhý snímek a menší rozměr drží soubor pod 1 MB.
    if "planeta" in what: animated("planeta", "planeta.webp", fps=12, quality=55, size=(616, 409), step=2)
    if "planeta_live" in what: planet_live()
    if "globe" in what: globe()
    if "motyl" in what: animated("motyl", "motyl.webp", fps=24, quality=72)
    if "vlajka" in what: animated("vlajka", "vlajka.webp", fps=24, quality=72)
    if "raketa" in what: animated("raketa", "raketa.webp", fps=24, quality=72)
    if "sopka" in what:
        animated("sopka", "sopka.webp", fps=18, quality=36, size=(520, 585))
        fr = frames("sopka")
        fr[30].save(os.path.join(DEST, "sopka-still.webp"), format="WEBP", quality=82, method=5, alpha_quality=90)
    if "liana" in what: strip("liana", "liana-strip.webp", (288, 288))
    if "kvetina" in what: strip("kvetina", "kvetina-strip.webp", (192, 192))
    if "hory" in what:
        for n in ("zadni", "stredni", "predni"):
            still(f"hory_{n}", f"hory-{n}.webp")
