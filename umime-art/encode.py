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


def animated(name, dest, fps=24, quality=70, size=None, loop=0, clean=False, step=1):
    fr = frames(name, size, step)
    if clean:  # slabý šum v průhlednosti by na tmavé obloze dělal viditelný obdélník
        fr = [Image.merge("RGBA", (*im.split()[:3], im.getchannel("A").point(lambda a: 0 if a < 14 else a))) for im in fr]
    path = os.path.join(DEST, dest)
    fr[0].save(path, format="WEBP", save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=loop,
               quality=quality, method=5, alpha_quality=80 if clean else 85)
    print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


def video(name, dest, fps=60, size=None, crf=24):
    """Smyčka jako WebM VP9 s průhledností (yuva420p); 60 fps je při video kodeku malý soubor."""
    import subprocess
    src = os.path.join(ROOT, "out", name, "f_%04d.png")
    path = os.path.join(DEST, dest)
    vf = ["-vf", f"scale={size[0]}:{size[1]}:flags=lanczos"] if size else []
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", src, *vf, "-c:v", "libvpx-vp9",
                    "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", str(crf), "-auto-alt-ref", "0", "-row-mt", "1", path], check=True)
    print(dest, round(os.path.getsize(path) / 1024), "kB")


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


def hero():
    """Hrdina úvodní scény: loď z Blenderu (12 snímků plamene vedle sebe) do public/home/hero."""
    dest_dir = os.path.join(DEST, "..", "hero")
    os.makedirs(dest_dir, exist_ok=True)
    fr = frames("hrdina_lod")
    w, h = fr[0].size
    sheet = Image.new("RGBA", (w * len(fr), h), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * w, 0))
    path = os.path.join(dest_dir, "lod-strip.webp")
    sheet.save(path, format="WEBP", quality=88, method=5, alpha_quality=92)
    print("lod-strip", len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)
    if glob.glob(os.path.join(ROOT, "out", "kometa_let", "f_*.png")):
        strip("kometa_let", "../hero/kometa-strip.webp", (384, 384), quality=74)


def tech():
    """Deska plošného spoje a čtyři animované předměty pro TechBoard do public/home/tech (+ polohy do JSON)."""
    import json
    dest_dir = os.path.join(DEST, "..", "tech")
    os.makedirs(dest_dir, exist_ok=True)
    board = frames("tech_deska")[0]
    board.save(os.path.join(dest_dir, "deska.webp"), format="WEBP", quality=88, method=5, alpha_quality=92)
    print("deska", round(os.path.getsize(os.path.join(dest_dir, "deska.webp")) / 1024), "kB", board.size)
    for name, dest in (("kniha", "kniha"), ("joystick", "joystick"), ("dvere", "dvere"), ("pohar", "pohar")):
        fr = frames("tech_" + name)
        w, h = fr[0].size
        sheet = Image.new("RGBA", (w * len(fr), h), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * w, 0))
        path = os.path.join(dest_dir, dest + ".webp")
        sheet.save(path, format="WEBP", quality=80, method=5, alpha_quality=85)
        print(dest, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)
    meta = json.load(open(os.path.join(ROOT, "out", "tech_deska", "paths.json")))
    import math
    ppu, bw, bh, el, n = meta["ppu"], meta["w"], meta["h"], math.radians(54), 384
    ped_x, ped_y = [-5.1, -1.7, 1.7, 5.1], -0.55
    meta["sprites"] = []
    for px in ped_x:
        ox, oy = bw / 2 + ppu * px, bh / 2 - ppu * (ped_y * math.sin(el))
        meta["sprites"].append({"x": (ox - n / 2) / bw, "y": (oy - (n / 2 + ppu * 0.9 * math.cos(el))) / bh, "w": n / bw})
    json.dump(meta, open(os.path.join(ROOT, "..", "src", "components", "tech-board.json"), "w"))


def hry():
    """Čtyři diorámata stálých her jako pásy snímků do public/home/hry."""
    dest_dir = os.path.join(DEST, "..", "hry")
    os.makedirs(dest_dir, exist_ok=True)
    for name in ("zakladna", "mazlicci", "farma", "mesto"):
        fr = frames("hra_" + name, (384, 384))
        sheet = Image.new("RGBA", (384 * len(fr), 384), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * 384, 0))
        path = os.path.join(dest_dir, name + ".webp")
        sheet.save(path, format="WEBP", quality=78, method=5, alpha_quality=85)
        fr[0].save(os.path.join(dest_dir, name + "-still.webp"), format="WEBP", quality=84, method=5, alpha_quality=90)
        print(name, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)


def unikovky():
    """Dioramata únikových místností jako pásy snímků do public/home/unikovky (název souboru = id místnosti)."""
    dest_dir = os.path.join(DEST, "..", "unikovky")
    os.makedirs(dest_dir, exist_ok=True)
    for name, room in (("muzeum", "museum"), ("expedice", "expedition"), ("dzungle", "jungle"), ("pirati", "pirate"), ("kuchyne", "kitchen"),
                       ("knihovna", "library"), ("observator", "observatory"), ("hrad", "castle"), ("laborator", "lab")):
        fr = frames("uni_" + name, (384, 384))
        sheet = Image.new("RGBA", (384 * len(fr), 384), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * 384, 0))
        path = os.path.join(dest_dir, room + ".webp")
        sheet.save(path, format="WEBP", quality=76, method=5, alpha_quality=85)
        print(room, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


def namesti():
    """Čtyři létající ostrovy „Co tu najdeš“ jako pásy snímků do public/home/namesti."""
    dest_dir = os.path.join(DEST, "..", "namesti")
    os.makedirs(dest_dir, exist_ok=True)
    for name in ("skola", "herna", "vez", "sin"):
        fr = frames("nam_" + name, (448, 448))
        sheet = Image.new("RGBA", (448 * len(fr), 448), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * 448, 0))
        path = os.path.join(dest_dir, name + ".webp")
        sheet.save(path, format="WEBP", quality=76, method=5, alpha_quality=85)
        print(name, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


def profil():
    """Podstavec avatara (pás 24 snímků) a vitrína odměn do public/home/profil."""
    dest_dir = os.path.join(DEST, "..", "profil")
    os.makedirs(dest_dir, exist_ok=True)
    fr = frames("profil_podstavec", (448, 448))
    sheet = Image.new("RGBA", (448 * len(fr), 448), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * 448, 0))
    path = os.path.join(dest_dir, "podstavec.webp")
    sheet.save(path, format="WEBP", quality=78, method=5, alpha_quality=85)
    print("podstavec", len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")
    vit = frames("profil_vitrina")[0]
    path = os.path.join(dest_dir, "vitrina.webp")
    vit.save(path, format="WEBP", quality=86, method=5, alpha_quality=92)
    print("vitrina", round(os.path.getsize(path) / 1024), "kB", vit.size)


def obchod():
    """Pouťové kolo štěstí (stojan, disk, popředí se žárovkami) a stánky trhu do public/home/obchod."""
    import shutil
    dest_dir = os.path.join(DEST, "..", "obchod")
    os.makedirs(dest_dir, exist_ok=True)
    for src, dest, q in (("obchod_kolo_stojan", "kolo-stojan.webp", 88), ("obchod_kolo_disk", "kolo-disk.webp", 90)):
        im = frames(src)[0]
        path = os.path.join(dest_dir, dest)
        im.save(path, format="WEBP", quality=q, method=5, alpha_quality=92)
        print(dest, round(os.path.getsize(path) / 1024), "kB", im.size)
    shutil.copy(os.path.join(ROOT, "out", "obchod_kolo_stojan", "layout.json"), os.path.join(ROOT, "..", "src", "components", "kolo-stojan.json"))
    fr = frames("obchod_kolo_predni", (384, 384))
    sheet = Image.new("RGBA", (384 * len(fr), 384), (0, 0, 0, 0))
    for i, im in enumerate(fr):
        sheet.paste(im, (i * 384, 0))
    path = os.path.join(dest_dir, "kolo-predni.webp")
    sheet.save(path, format="WEBP", quality=80, method=5, alpha_quality=88)
    print("kolo-predni", len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")
    for name in STANKY:
        fr = frames("obchod_stanek_" + name, (384, 384))
        sheet = Image.new("RGBA", (384 * len(fr), 384), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * 384, 0))
        path = os.path.join(dest_dir, "stanek-" + name + ".webp")
        sheet.save(path, format="WEBP", quality=78, method=5, alpha_quality=85)
        print("stanek", name, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB")


STANKY = ("mince", "truhla", "poklad")


def hory():
    """Hora se stezkou, turista, oheň a vlajka pro MountainTrek do public/home/hory (+ stezka do JSON)."""
    import json
    dest_dir = os.path.join(DEST, "..", "hory")
    os.makedirs(dest_dir, exist_ok=True)
    im = frames("hory_hora")[0]
    path = os.path.join(dest_dir, "hora.webp")
    im.save(path, format="WEBP", quality=86, method=5, alpha_quality=92)
    print("hora", round(os.path.getsize(path) / 1024), "kB", im.size)
    for name, dest in (("hory_turista", "turista"), ("hory_ohen", "ohen"), ("hory_vlajka", "vlajka")):
        strip(name, "../hory/" + dest + ".webp", frames(name)[0].size, quality=82)
    shutil_json = os.path.join(ROOT, "out", "hory_hora", "trail.json")
    json.dump(json.load(open(shutil_json)), open(os.path.join(ROOT, "..", "src", "components", "hory-stezka.json"), "w"))


def mesto_chuze():
    """Chůze obyvatel pro hub městečka (úvodní scénu TownLife to nemění)."""
    dest_dir = os.path.join(DEST, "..", "mesto")
    os.makedirs(dest_dir, exist_ok=True)
    for job, dest in (("knihovnice_chuze", "knihovnice-chuze"), ("pekar_chuze", "pekar-chuze"), ("kluk_chuze", "kluk-chuze")):
        if glob.glob(os.path.join(ROOT, "out", "mf_" + job, "f_*.png")):
            strip("mf_" + job, "../mesto/" + dest + ".webp", (192, 192), quality=80)


def mesto_hrdinove():
    """Další vzhledy hrdiny (výběr v městečku): hrdina-<k>-chuze/stoji/radost.webp."""
    dest_dir = os.path.join(DEST, "..", "mesto")
    os.makedirs(dest_dir, exist_ok=True)
    for k in range(1, 6):
        for act in ("chuze", "stoji", "radost"):
            src = f"mf_hrdina_{k}_{act}"
            if glob.glob(os.path.join(ROOT, "out", src, "f_*.png")):
                strip(src, f"../mesto/hrdina-{k}-{act}.webp", (192, 192), quality=80)


def hub_vrstvy():
    """Vrstvy hloubky hubu: z hotového obrázku městečka se vyříznou budovy přední (a) a druhé řady (b) podle masky z Blenderu
    (mestecko_hub.py --masks). Web je kreslí nad hrdinou, když je za budovou."""
    from PIL import Image
    import numpy as np
    mask_path = os.path.join(ROOT, "out", "mesto_hub_maska", "f_0001.png")
    hub = Image.open(os.path.join(DEST, "..", "mesto", "hub.webp")).convert("RGBA")
    m = np.asarray(Image.open(mask_path).convert("RGB").resize(hub.size, Image.BILINEAR), dtype=np.float32) / 255.0
    base = np.asarray(hub, dtype=np.float32)
    for name, ch in (("a", 0), ("b", 1)):
        a = np.clip((m[..., ch] - 0.15) / 0.7, 0, 1)
        out = base.copy()
        out[..., 3] = base[..., 3] * a
        im = Image.fromarray(out.astype(np.uint8), "RGBA")
        path = os.path.join(DEST, "..", "mesto", f"hub-{name}.webp")
        im.save(path, format="WEBP", quality=82, method=5, alpha_quality=92)
        print(f"hub-{name}", round(os.path.getsize(path) / 1024), "kB")


def mesto():
    """Městečko (scéna), obyvatelé, zvířata a větrník pro TownLife do public/home/mesto (+ polohy do JSON)."""
    import json, math
    dest_dir = os.path.join(DEST, "..", "mesto")
    os.makedirs(dest_dir, exist_ok=True)
    im = frames("mesto_scena")[0]
    path = os.path.join(dest_dir, "scena.webp")
    im.save(path, format="WEBP", quality=82, method=5, alpha_quality=92)
    print("scena", round(os.path.getsize(path) / 1024), "kB", im.size)
    for job, dest in (("hrdina_chuze", "hrdina-chuze"), ("hrdina_stoji", "hrdina-stoji"), ("hrdina_radost", "hrdina-radost"),
                      ("knihovnice", "knihovnice"), ("pekar", "pekar"), ("farmar", "farmar"), ("babicka", "babicka"), ("kluk", "kluk"),
                      ("pes_bezi", "pes-bezi"), ("pes_sedi", "pes-sedi"), ("kocka", "kocka"), ("ovce", "ovce"), ("slepice", "slepice"),
                      ("kralik", "kralik"), ("ptak", "ptak"), ("ryba", "ryba")):
        if glob.glob(os.path.join(ROOT, "out", "mf_" + job, "f_*.png")):
            strip("mf_" + job, "../mesto/" + dest + ".webp", (192, 192), quality=80)
    if glob.glob(os.path.join(ROOT, "out", "mf_mlyn", "f_*.png")):
        frames("mf_mlyn", (256, 256))[0].save(os.path.join(dest_dir, "mlyn.webp"), format="WEBP", quality=84, method=5, alpha_quality=92)
    meta = json.load(open(os.path.join(ROOT, "out", "mesto_scena", "paths.json")))
    ppu, W, H, el, tz = meta["ppu"], meta["w"], meta["h"], math.radians(26), 1.3

    def norm(x, y, z=0.0):
        return [round((W / 2 + ppu * x) / W, 5), round((H / 2 - ppu * (y * math.sin(el) + (z - tz) * math.cos(el))) / H, 5)]

    meta["extra"] = {
        "b1_top": norm(-5.3, 0.8, 3.2), "b2_top": norm(0.45, 1.0, 2.85), "b3_top": norm(5.45, 1.0, 4.5), "b1_door": meta["b1_door"], "b2_door": meta["b2_door"], "b3_door": meta["b3_door"], "sopka": meta["sopka"],
        "knihovnice": norm(-4.15, -0.05), "pekar": norm(-1.35, 0.05), "kluk": norm(-3.55, -1.35), "kocka": norm(2.4, -3.2, 0.24),
        "ovce_a": norm(4.0, -4.2), "ovce_b": norm(6.3, -4.7), "slepice_a": norm(5.2, -3.7), "slepice_b": norm(3.1, -4.9),
        "farmar_a": norm(-3.2, -4.3), "farmar_b": norm(1.4, -3.9), "babicka_a": norm(-0.9, -1.15), "babicka_b": norm(1.7, -0.95),
        "jezek": norm(-1.6, -4.7), "veverka": norm(7.2, -0.35, 0.0), "kralik_a": norm(-8.4, -4.4), "kralik_b": norm(-4.9, -3.8), "rybnik": norm(0, -2.55, -0.1),
    }
    json.dump(meta, open(os.path.join(ROOT, "..", "src", "components", "mesto-scena.json"), "w"))


def svet():
    """Plachetnice (12 snímků) a statické náhledy ostrovů pro CourseWorld do public/home/svet a globe."""
    dest_dir = os.path.join(DEST, "..", "svet")
    os.makedirs(dest_dir, exist_ok=True)
    if glob.glob(os.path.join(ROOT, "out", "svet_lod", "f_*.png")):
        strip("svet_lod", "../svet/plachetnice.webp", frames("svet_lod")[0].size, quality=84)
    gdir = os.path.join(DEST, "..", "globe")
    for subject in ("cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis", "fyzika", "chemie", "obcanka", "hudebka", "francouzstina"):
        if not glob.glob(os.path.join(ROOT, "out", "znacka_" + subject, "f_*.png")):
            continue  # vykresleno jen to, co se právě mění
        im = frames("znacka_" + subject)[0].resize((320, 320), Image.LANCZOS)
        path = os.path.join(gdir, "still-" + subject + ".webp")
        im.save(path, format="WEBP", quality=86, method=5, alpha_quality=90)
    print("still-*", "ostrovy")


def globe():
    """Památky předmětů (pás 20 snímků) a školní předměty prstence pro SubjectGlobe do public/home/globe."""
    dest_dir = os.path.join(DEST, "..", "globe")
    os.makedirs(dest_dir, exist_ok=True)
    for subject in ("cestina", "literatura", "anglictina", "nemcina", "rustina", "matematika", "dejepis", "zemepis", "prirodopis", "fyzika", "chemie", "obcanka", "hudebka", "francouzstina"):
        if not glob.glob(os.path.join(ROOT, "out", "znacka_" + subject, "f_*.png")):
            continue  # vykresleno jen to, co se právě mění
        fr = frames("znacka_" + subject)
        w, h = fr[0].size
        sheet = Image.new("RGBA", (w * len(fr), h), (0, 0, 0, 0))
        for i, im in enumerate(fr):
            sheet.paste(im, (i * w, 0))
        path = os.path.join(dest_dir, subject + ".webp")
        sheet.save(path, format="WEBP", quality=74, method=5, alpha_quality=80)
        print(subject, len(fr), "snímků", round(os.path.getsize(path) / 1024), "kB", sheet.size)
    for name in ("kniha", "tuzka", "banka", "atom", "kalkulacka", "pravitko", "cepice", "zarovka", "lupa", "glob", "kostky", "svitek", "letadlo", "raketa", "mikroskop", "kruzitko", "sesit", "dna", "pero", "rostlina"):
        if not glob.glob(os.path.join(ROOT, "out", "pr_" + name, "f_*.png")):
            continue
        im = frames("pr_" + name)[0]
        path = os.path.join(dest_dir, "obj-" + name + ".webp")
        im.save(path, format="WEBP", quality=86, method=5, alpha_quality=92)
        print("obj-" + name, round(os.path.getsize(path) / 1024), "kB", im.size)


def pristav():
    """Pirátský přístav (uživatelský obchod): vrstvy mola, loď, obchodníci, papoušek a krab do public/home/pristav."""
    import json, math
    dest_dir = os.path.join(DEST, "..", "pristav")
    os.makedirs(dest_dir, exist_ok=True)
    for src, dest, q in (("pristav_zadni", "zadni.webp", 84), ("pristav_predni", "predni.webp", 84)):
        im = frames(src)[0]
        im.save(os.path.join(dest_dir, dest), format="WEBP", quality=q, method=5, alpha_quality=90)
        print(dest, round(os.path.getsize(os.path.join(dest_dir, dest)) / 1024), "kB", im.size)
    if glob.glob(os.path.join(ROOT, "out", "pristav_lod", "f_*.png")):
        strip("pristav_lod", "../pristav/lod.webp", (640, 512), quality=80)
    for src, dest in (("mf_kapitan", "kapitan"), ("mf_kvartyrmistr", "kvartyrmistr"), ("mf_tesar", "tesar"), ("mf_plachtarka", "plachtarka"),
                      ("mf_chovatel", "chovatel"), ("mf_papousek", "papousek"), ("mf_krab", "krab")):
        if glob.glob(os.path.join(ROOT, "out", src, "f_*.png")):
            strip(src, "../pristav/" + dest + ".webp", (256, 256), quality=80)
    meta = json.load(open(os.path.join(ROOT, "out", "pristav_zadni", "kotvy.json")))
    W, H, ppu, el, tz = meta["w"], meta["h"], meta["ppu"], math.radians(26), 1.3

    def norm(x, y, z=0.0):
        return [round((W / 2 + ppu * x) / W, 5), round((H / 2 - ppu * (y * math.sin(el) + (z - tz) * math.cos(el))) / H, 5)]

    for key, cx in (("avatary", -6.4), ("tituly", -3.2), ("ramecky", 0.0), ("pozadi", 3.2), ("mazlicci", 6.4)):
        meta["kotvy"][key]["nazev"] = norm(cx, -0.9, 2.78)   # cedule leží na pruhované plachtě stánku
    meta["lod"] = norm(-1.6, 4.7, 0.0)                      # vodoryska galéry za stánky
    meta["kanon"] = norm(8.0, -1.35, 0.65)
    meta["majak"] = norm(7.4, 5.6, 1.12)
    meta["papousek"] = norm(5.5, 0.35, 1.45)   # bidýlko v zvířecím koutku
    meta["krab"] = norm(4.6, -1.7, 0.3)         # na prknech před stánky
    json.dump(meta, open(os.path.join(ROOT, "..", "src", "components", "pristav-kotvy.json"), "w"))


def nastup():
    """Molo a lávka k pirátské galéře (nástup na loď ve filmovém přechodu z městečka)."""
    import json, shutil
    dest_dir = os.path.join(DEST, "..", "pristav")
    os.makedirs(dest_dir, exist_ok=True)
    for part in ("molo", "lavka"):
        im = frames("pristav_nastup_" + part)[0]
        im.save(os.path.join(dest_dir, "nastup-" + part + ".webp"), format="WEBP", quality=84, method=5, alpha_quality=90)
        print("nastup-" + part, im.size)
    shutil.copy(os.path.join(ROOT, "out", "pristav_nastup_molo", "kotvy.json"), os.path.join(ROOT, "..", "src", "components", "pristav-nastup.json"))


def kosmicka():
    """Vesmírná stanice (uživatelský obchod): vrstvy stanice, raketa a obchodníci do public/home/kosmicka."""
    import json, shutil
    dest_dir = os.path.join(DEST, "..", "kosmicka")
    os.makedirs(dest_dir, exist_ok=True)
    for src, dest in (("kosmicka_zadni", "zadni.webp"), ("kosmicka_predni", "predni.webp")):
        im = frames(src)[0]
        im.save(os.path.join(dest_dir, dest), format="WEBP", quality=84, method=5, alpha_quality=90)
        print(dest, round(os.path.getsize(os.path.join(dest_dir, dest)) / 1024), "kB", im.size)
    if glob.glob(os.path.join(ROOT, "out", "kosmicka_raketa", "f_*.png")):
        strip("kosmicka_raketa", "../kosmicka/raketa.webp", (640, 384), quality=80)
    for name in ("admiral", "robot_obch", "inzenyr", "mimozemstan", "biolog", "blob", "uklizec"):
        if glob.glob(os.path.join(ROOT, "out", "mf_" + name, "f_*.png")):
            strip("mf_" + name, "../kosmicka/" + name + ".webp", (256, 256), quality=80)
    shutil.copy(os.path.join(ROOT, "out", "kosmicka_zadni", "kotvy.json"), os.path.join(ROOT, "..", "src", "components", "kosmicka-kotvy.json"))


def svet(name, dirname, npcs, prop, prop_size):
    """Svět uživatelského obchodu (les, hrad, moře): vrstvy scény, rekvizita a obchodníci do public/home/<dirname>."""
    import json, shutil
    dest_dir = os.path.join(DEST, "..", dirname)
    os.makedirs(dest_dir, exist_ok=True)
    for lay in ("zadni", "predni"):
        im = frames(f"{name}_{lay}")[0]
        im.save(os.path.join(dest_dir, lay + ".webp"), format="WEBP", quality=84, method=5, alpha_quality=90)
        print(name, lay, round(os.path.getsize(os.path.join(dest_dir, lay + ".webp")) / 1024), "kB", im.size)
    if glob.glob(os.path.join(ROOT, "out", "svet_" + prop[0], "f_*.png")):
        strip("svet_" + prop[0], f"../{dirname}/{prop[1]}.webp", prop_size, quality=80)
    for n in npcs:
        if glob.glob(os.path.join(ROOT, "out", "mf_" + n, "f_*.png")):
            strip("mf_" + n, f"../{dirname}/{n}.webp", (256, 256), quality=80)
    shutil.copy(os.path.join(ROOT, "out", name + "_zadni", "kotvy.json"), os.path.join(ROOT, "..", "src", "components", name + "-kotvy.json"))


def hub():
    """Městečko jako hub (stránka /mestecko): obrázek scény do public/home/mesto/hub.webp a kotvy do src/components."""
    import json, shutil
    im = frames("mesto_hub")[0]
    path = os.path.join(DEST, "..", "mesto", "hub.webp")
    im.save(path, format="WEBP", quality=84, method=5, alpha_quality=90)
    print("hub.webp", round(os.path.getsize(path) / 1024), "kB", im.size)
    shutil.copy(os.path.join(ROOT, "out", "mesto_hub", "kotvy.json"), os.path.join(ROOT, "..", "src", "components", "mesto-hub-kotvy.json"))


def les():
    svet("les", "les", ["vila", "hajny", "rezbar", "malirka", "bylinkarka"], ("domek", "domek"), (640, 704))


def hrad():
    svet("hrad", "hrad", ["krejci", "kral", "kovar", "tkadlena", "sokolnik"], ("vez", "vez"), (512, 800))


def more():
    svet("more", "more", ["perla", "potapec", "perlar", "mag", "delfinka"], ("ponorka", "ponorka"), (640, 384))


def stills():
    """První snímek animací jako statický obrázek pro lidi s vypnutými animacemi."""
    for name, dest in (("motyl", "motyl-still.webp"), ("vlajka", "vlajka-still.webp"), ("raketa", "raketa-still.webp")):
        still(name, dest, quality=82)


if __name__ == "__main__":
    what = sys.argv[1:] or ["planeta", "motyl", "vlajka", "raketa", "liana", "kvetina", "hory", "stills", "icons", "planeta_live", "globe", "hero", "tech", "hory", "svet", "hry", "unikovky", "namesti", "profil", "obchod"]
    if "icons" in what: icons()
    if "pristav" in what: pristav()
    if "kosmicka" in what: kosmicka()
    if "nastup" in what: nastup()
    if "hub" in what: hub()
    if "les" in what: les()
    if "hrad" in what: hrad()
    if "more" in what: more()
    if "stills" in what: stills()
    # Planeta má hodně jemného detailu: každý druhý snímek a menší rozměr drží soubor pod 1 MB.
    if "planeta" in what: animated("planeta", "planeta.webp", fps=12, quality=55, size=(616, 409), step=2)
    # Plynulá verze (FRAMES=180 FPS=60 při renderu): video 60 fps, animované webp zůstává jako záloha.
    if "planeta-video" in what: video("planeta", "planeta.webm", fps=60, size=(616, 409))
    if "planeta_realna" in what:
        animated("planeta_realna", "planeta-realna.webp", fps=16, quality=58, size=(496, 329))
        still("planeta_realna", "planeta-realna-still.webp", size=(560, 372), quality=88)
    if "planeta_live" in what: planet_live()
    if "globe" in what: globe()
    if "hero" in what: hero()
    if "tech" in what: tech()
    if "hory" in what: hory()
    if "svet" in what: svet()
    if "mesto" in what: mesto()
    if "mesto_chuze" in what: mesto_chuze()
    if "mesto_hrdinove" in what: mesto_hrdinove()
    if "hub_vrstvy" in what: hub_vrstvy()
    if "hry" in what: hry()
    if "unikovky" in what: unikovky()
    if "namesti" in what: namesti()
    if "profil" in what: profil()
    if "obchod" in what: obchod()
    if "motyl" in what: animated("motyl", "motyl.webp", fps=24, quality=72)
    if "vlajka" in what: animated("vlajka", "vlajka.webp", fps=24, quality=72)
    if "raketa" in what: animated("raketa", "raketa.webp", fps=24, quality=72)
    if "sopka" in what:
        animated("sopka", "sopka.webp", fps=18, quality=32, size=(440, 495), clean=True)
        fr = frames("sopka")
        fr[30].save(os.path.join(DEST, "sopka-still.webp"), format="WEBP", quality=82, method=5, alpha_quality=90)
    if "liana" in what: strip("liana", "liana-strip.webp", (288, 288))
    if "kvetina" in what: strip("kvetina", "kvetina-strip.webp", (192, 192))
    if "hory" in what:
        for n in ("zadni", "stredni", "predni"):
            still(f"hory_{n}", f"hory-{n}.webp")
