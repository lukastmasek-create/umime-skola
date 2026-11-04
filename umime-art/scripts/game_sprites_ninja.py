"""Sprity pro hru Stínový bojovník (src/lib/ninja-engine.ts).

Vykreslí public/game-sprites/ninja/ovoce.webp (celé + rozkrojené ovoce, 8×2 mřížka)
a public/game-sprites/ninja/cepel.webp (katana / čepel), a zapíše ninja.json.

Kreslí se v 4× supersamplingu (buňka 768 px) a stahuje na 192 px, takže hrany jsou hladké.
Spuštění:  python3 umime-art/scripts/game_sprites_ninja.py [výstupní_složka]
Závislosti: numpy, Pillow.
"""

import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SS = 4                 # supersampling
FINAL = 192            # velikost buňky ve hře (2× větší než vykreslení, jako dřív)
CELL = FINAL * SS      # 768
C = CELL / 2
R = 330                # poloměr plodu v pixelech supersamplingu
OUTLINE = (22, 12, 30, 255)
OUTLINE_PX = 12        # tloušťka obrysu (v supersamplingu, ~3 px ve finále)
RNG = np.random.default_rng(7)


# ---------- pomocné funkce ----------

def shade(rgb, nx, ny, nz, strength=1.0):
    """Lambertovo stínování + lesk. rgb je (H,W,3) v rozsahu 0..1."""
    L = np.array([-0.45, -0.55, 0.70])
    L = L / np.linalg.norm(L)
    H = L + np.array([0.0, 0.0, 1.0])
    H = H / np.linalg.norm(H)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    spec = np.clip(nx * H[0] + ny * H[1] + nz * H[2], 0, 1) ** 40
    lit = 0.30 + 0.70 * diff
    out = rgb * lit[..., None] * (0.80 + 0.20 * nz[..., None]) ** strength
    out += (0.55 * spec)[..., None]
    return np.clip(out, 0, 1)


def to_rgba(rgb, alpha):
    arr = np.dstack([rgb * 255, alpha * 255]).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def grid():
    y, x = np.mgrid[0:CELL, 0:CELL].astype(np.float64)
    return x - C, y - C  # relativně ke středu


def compose(layers):
    """Složí vrstvy (RGBA, odspodu nahoru) a přidá tmavý obrys podle alfy všeho dohromady."""
    base = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    for layer in layers:
        base.alpha_composite(layer)
    alpha = base.getchannel("A")
    dil = alpha.filter(ImageFilter.MaxFilter(OUTLINE_PX * 2 + 1))
    outline = Image.new("RGBA", (CELL, CELL), OUTLINE)
    outline.putalpha(dil)
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.alpha_composite(outline)
    out.alpha_composite(base)
    return out


def poly_ellipse(cx, cy, a, b, ang=0.0, n=48):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y = a * math.cos(t), b * math.sin(t)
        pts.append((cx + x * math.cos(ang) - y * math.sin(ang), cy + x * math.sin(ang) + y * math.cos(ang)))
    return pts


def circle_layer(r, color, cx=C, cy=C):
    img = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ImageDraw.Draw(img).ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    return img


def highlight(img, strength=0.35):
    """Měkký bílý lesk nahoře vlevo, jen na tělese (podle alfy)."""
    alpha = img.getchannel("A")
    glow = Image.new("L", (CELL, CELL), 0)
    ImageDraw.Draw(glow).ellipse([C - R * 0.75, C - R * 0.95, C - R * 0.05, C - R * 0.25], fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(R * 0.12))
    glow = Image.eval(glow, lambda v: int(v * strength))
    glow = Image.composite(glow, Image.new("L", (CELL, CELL), 0), alpha)
    white = Image.new("RGBA", (CELL, CELL), (255, 255, 255, 0))
    white.putalpha(glow)
    out = img.copy()
    out.alpha_composite(white)
    return out


def noise_field(scale=6.0):
    n = RNG.random((CELL // SS, CELL // SS)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((CELL, CELL), Image.BICUBIC)
    im = im.filter(ImageFilter.GaussianBlur(scale))
    a = np.asarray(im).astype(np.float64) / 255.0
    a = (a - a.mean()) / (a.std() + 1e-6)
    return a


# ---------- celé ovoce (3D koule / elipsa) ----------

def body(rx, ry, cy_off=0.0):
    X, Y = grid()
    u = X / rx
    v = (Y - cy_off) / ry
    r2 = u * u + v * v
    mask = r2 <= 1.0
    nz = np.sqrt(np.clip(1 - r2, 0, 1))
    return mask, u, v, nz


def whole_melon():
    mask, u, v, nz = body(R, R)
    lon = np.arctan2(u, np.maximum(nz, 1e-3))
    stripe = np.sin(lon * 7.0)
    base = np.array([0.20, 0.58, 0.22])
    dark = np.array([0.04, 0.26, 0.08])
    pale = np.array([0.55, 0.85, 0.40])
    s = np.clip((stripe - 0.25) * 4, 0, 1)[..., None]
    col = base * (1 - s) + dark * s
    col = col * (1 - 0.15 * np.clip(-v, 0, 1))[..., None] + pale * (0.08 * np.clip(stripe, 0, 1))[..., None]
    rgb = shade(np.clip(col, 0, 1), u, v, nz)
    alpha = mask.astype(np.float64)
    return to_rgba(rgb, alpha)


def whole_apple():
    rx, ry = R * 0.98, R * 0.92
    mask, u, v, nz = body(rx, ry, cy_off=R * 0.05)
    base = np.array([1.00, 0.26, 0.24])
    col = base[None, None, :] * (0.85 + 0.15 * (v[..., None] * -1 + 1) / 2)
    dimple = np.exp(-((u ** 2) + (v + 0.82) ** 2) / 0.03)
    col = col * (1 - 0.45 * dimple[..., None])
    rgb = shade(np.clip(col, 0, 1), u, v, nz)
    layer = to_rgba(rgb, mask.astype(np.float64))
    layer = highlight(layer, 0.45)
    d = ImageDraw.Draw(layer)
    top = C - ry * 0.85 + R * 0.05
    d.line([(C, top), (C + 18, top - 78)], fill=(96, 58, 28, 255), width=22)
    d.polygon([(C + 22, top - 56), (C + 100, top - 100), (C + 56, top - 14)], fill=(70, 170, 60, 255))
    d.line([(C + 25, top - 48), (C + 74, top - 78)], fill=(40, 110, 40, 255), width=6)
    return layer


def whole_orange():
    mask, u, v, nz = body(R, R)
    base = np.array([1.00, 0.56, 0.09])
    n = noise_field(2.2)
    col = base[None, None, :] * (1 + 0.06 * n)[..., None]
    rgb = shade(np.clip(col, 0, 1), u, v, nz)
    layer = to_rgba(rgb, mask.astype(np.float64))
    layer = highlight(layer, 0.4)
    d = ImageDraw.Draw(layer)
    top = C - R * 0.95
    d.polygon([(C - 26, top + 40), (C + 26, top + 40), (C, top - 10)], fill=(120, 80, 30, 255))
    d.polygon([(C + 6, top + 10), (C + 95, top - 45), (C + 40, top + 40)], fill=(70, 170, 60, 255))
    return layer


def whole_pineapple():
    rx, ry = R * 0.70, R * 0.85
    cy = R * 0.15
    mask, u, v, nz = body(rx, ry, cy_off=cy)
    X, Y = grid()
    t1 = ((X + Y) / 58.0) % 1.0
    t2 = ((X - Y) / 58.0) % 1.0
    lattice = (np.abs(t1 - 0.5) > 0.43) | (np.abs(t2 - 0.5) > 0.43)
    gold = np.array([0.98, 0.74, 0.16])
    brown = np.array([0.52, 0.32, 0.07])
    col = np.where(lattice[..., None], brown, gold)
    rgb = shade(np.clip(col, 0, 1), u, (v), nz)
    layer = to_rgba(rgb, mask.astype(np.float64))
    layer = highlight(layer, 0.4)
    leaves = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaves)
    top = C + cy - ry
    for dx, length, lean in [(-40, 100, -40), (-18, 112, -14), (0, 118, 0), (18, 112, 14), (40, 100, 40), (-62, 84, -80), (62, 84, 80)]:
        tip = (C + dx + lean, top - length)
        ld.polygon([(C + dx - 26, top + 20), (C + dx + 26, top + 20), tip], fill=(70, 175, 60, 255))
        ld.line([(C + dx, top + 20), tip], fill=(40, 115, 40, 255), width=6)
    leaves.alpha_composite(layer)
    return leaves


def whole_kiwi():
    rx, ry = R * 0.86, R * 0.78
    mask, u, v, nz = body(rx, ry)
    n = noise_field(1.6)
    base = np.array([0.46, 0.31, 0.15])
    col = base[None, None, :] * (0.82 + 0.25 * n)[..., None]
    rgb = shade(np.clip(col, 0, 1), u, v, nz)
    layer = to_rgba(rgb, mask.astype(np.float64))
    return highlight(layer, 0.35)


# ---------- rozkrojené ovoce (plošný řez, hraje se levá a pravá polovina) ----------

def cut_melon():
    img = circle_layer(R, (36, 107, 41, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([C - R * 0.92, C - R * 0.92, C + R * 0.92, C + R * 0.92], fill=(214, 236, 180, 255))
    d.ellipse([C - R * 0.84, C - R * 0.84, C + R * 0.84, C + R * 0.84], fill=(236, 70, 88, 255))
    d.ellipse([C - R * 0.42, C - R * 0.42, C + R * 0.42, C + R * 0.42], fill=(246, 104, 116, 255))
    for k in range(14):
        a = 2 * math.pi * k / 14
        cx, cy = C + math.cos(a) * R * 0.55, C + math.sin(a) * R * 0.55
        pts = poly_ellipse(cx, cy, R * 0.045, R * 0.022, a)
        d.polygon(pts, fill=(38, 18, 22, 255))
    return highlight(img, 0.3)


def cut_apple():
    img = circle_layer(R, (190, 30, 40, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([C - R * 0.91, C - R * 0.91, C + R * 0.91, C + R * 0.91], fill=(250, 242, 206, 255))
    d.ellipse([C - R * 0.5, C - R * 0.5, C + R * 0.5, C + R * 0.5], fill=(246, 236, 190, 255))
    star = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = R * (0.42 if i % 2 == 0 else 0.2)
        star.append((C + rr * math.cos(a), C + rr * math.sin(a)))
    d.polygon(star, fill=(232, 210, 140, 255))
    for k in range(5):
        a = -math.pi / 2 + (k + 0.5) * 2 * math.pi / 5
        cx, cy = C + math.cos(a) * R * 0.2, C + math.sin(a) * R * 0.2
        d.polygon(poly_ellipse(cx, cy, R * 0.045, R * 0.075, a + math.pi / 2), fill=(92, 54, 26, 255))
    return highlight(img, 0.3)


def cut_orange():
    img = circle_layer(R, (240, 128, 24, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([C - R * 0.92, C - R * 0.92, C + R * 0.92, C + R * 0.92], fill=(255, 244, 214, 255))
    seg_r = R * 0.86
    for k in range(10):
        a0 = 2 * math.pi * k / 10 + 0.035
        a1 = 2 * math.pi * (k + 1) / 10 - 0.035
        pts = [(C, C)]
        for i in range(13):
            a = a0 + (a1 - a0) * i / 12
            pts.append((C + seg_r * math.cos(a), C + seg_r * math.sin(a)))
        col = (255, 176, 58, 255) if k % 2 == 0 else (255, 160, 44, 255)
        d.polygon(pts, fill=col)
    d.ellipse([C - R * 0.09, C - R * 0.09, C + R * 0.09, C + R * 0.09], fill=(255, 246, 220, 255))
    return highlight(img, 0.3)


def cut_pineapple():
    img = circle_layer(R, (120, 74, 20, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([C - R * 0.93, C - R * 0.93, C + R * 0.93, C + R * 0.93], fill=(206, 146, 40, 255))
    d.ellipse([C - R * 0.87, C - R * 0.87, C + R * 0.87, C + R * 0.87], fill=(255, 226, 96, 255))
    d.ellipse([C - R * 0.2, C - R * 0.2, C + R * 0.2, C + R * 0.2], fill=(236, 186, 70, 255))
    for ring, count in [(0.62, 16), (0.76, 22)]:
        for k in range(count):
            a = 2 * math.pi * (k + (0.5 if ring > 0.7 else 0)) / count
            cx, cy = C + math.cos(a) * R * ring, C + math.sin(a) * R * ring
            d.polygon(poly_ellipse(cx, cy, R * 0.03, R * 0.022, a), fill=(196, 128, 36, 255))
    return highlight(img, 0.3)


def cut_kiwi():
    img = circle_layer(R, (96, 66, 30, 255))
    d = ImageDraw.Draw(img)
    d.ellipse([C - R * 0.9, C - R * 0.9, C + R * 0.9, C + R * 0.9], fill=(120, 196, 52, 255))
    d.ellipse([C - R * 0.84, C - R * 0.84, C + R * 0.84, C + R * 0.84], fill=(104, 184, 46, 255))
    d.ellipse([C - R * 0.3, C - R * 0.3, C + R * 0.3, C + R * 0.3], fill=(236, 244, 214, 255))
    for k in range(20):
        a = 2 * math.pi * k / 20
        cx, cy = C + math.cos(a) * R * 0.6, C + math.sin(a) * R * 0.6
        d.polygon(poly_ellipse(cx, cy, R * 0.035, R * 0.02, a), fill=(28, 22, 16, 255))
    return highlight(img, 0.3)


def cut_pineapple_ring():
    return cut_pineapple()


# ---------- čepel (katana) ----------

def blade():
    """Katana vodorovně (špička vlevo, rukojeť vpravo), pak otočená o 45° po směru hodin:
    špička vlevo nahoře, rukojeť vpravo dole — stejně jako původní sprite."""
    loc = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    d = ImageDraw.Draw(loc)
    cy = C
    ox = C - 330  # lokální x=0 (špička) položíme tak, aby byla čepel přibližně uprostřed

    def X(v):
        return ox + v

    # Čepel: vrchol vlevo, hřbet nahoře, ostří dole
    blade_len = 430
    tip = (X(0) + 5, cy)
    back = []
    edge = []
    for i in range(0, blade_len + 1, 6):
        t = i / blade_len
        half = (26 * (t ** 0.55)) + 2
        back.append((X(i) + 5, cy - half - 6))
        edge.append((X(i) + 5, cy + half * 0.35 + 6))
    poly = [tip] + back + list(reversed(edge))
    # tvar čepele
    d.polygon(poly, fill=(206, 214, 226, 255))
    # hřbet (světlý) a žilka (hamon) + brus
    d.line([(X(110), cy - 17), (X(blade_len - 10), cy - 13)], fill=(255, 255, 255, 255), width=7)
    d.line([(X(120), cy + 4), (X(blade_len - 40), cy + 8)], fill=(120, 132, 156, 255), width=6)
    d.line([(X(100), cy + 13), (X(blade_len - 20), cy + 17)], fill=(94, 104, 128, 255), width=5)
    # tsuba (záštita)
    gx = X(blade_len + 4)
    d.ellipse([gx - 16, cy - 58, gx + 16, cy + 58], fill=(46, 40, 60, 255), outline=(236, 186, 64, 255), width=8)
    # rukojeť (tsuka) s pletením
    hx0, hx1 = gx + 14, X(blade_len + 170)
    d.rectangle([hx0, cy - 22, hx1, cy + 22], fill=(34, 60, 150, 255))
    for k in range(0, int(hx1 - hx0), 22):
        xx = hx0 + k
        d.line([(xx, cy - 22), (xx + 14, cy + 22)], fill=(70, 110, 210, 255), width=5)
    # kašira (koncovka)
    px = hx1 + 6
    d.ellipse([px - 22, cy - 26, px + 22, cy + 26], fill=(236, 186, 64, 255), outline=(150, 100, 30, 255), width=5)

    # otočení a vystředění
    rot = loc.rotate(-45, resample=Image.BICUBIC, center=(C, C))
    bbox = rot.getbbox()
    if bbox:
        bx = (bbox[0] + bbox[2]) / 2
        by = (bbox[1] + bbox[3]) / 2
        rot = rot.transform(rot.size, Image.AFFINE, (1, 0, bx - C, 0, 1, by - C), resample=Image.BICUBIC)
    return rot


# ---------- sestavení ----------

def frame_images():
    return {
        "meloun_cele": compose([whole_melon()]),
        "meloun_pulky": compose([cut_melon()]),
        "jablko_cele": compose([whole_apple()]),
        "jablko_pulky": compose([cut_apple()]),
        "pomeranc_cele": compose([whole_orange()]),
        "pomeranc_pulky": compose([cut_orange()]),
        "ananas_cele": compose([whole_pineapple()]),
        "ananas_pulky": compose([cut_pineapple_ring()]),
        "kiwi_cele": compose([whole_kiwi()]),
        "kiwi_pulky": compose([cut_kiwi()]),
    }


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "..", "public", "game-sprites", "ninja")
    os.makedirs(out, exist_ok=True)

    order = [
        "meloun_cele", "meloun_pulky", "jablko_cele", "jablko_pulky",
        "pomeranc_cele", "pomeranc_pulky", "ananas_cele", "ananas_pulky",
        "kiwi_cele", "kiwi_pulky",
    ]
    frames = frame_images()
    sheet = Image.new("RGBA", (8 * FINAL, 2 * FINAL), (0, 0, 0, 0))
    meta_frames = {}
    for i, name in enumerate(order):
        col, row = i % 8, i // 8
        img = frames[name].resize((FINAL, FINAL), Image.LANCZOS)
        sheet.alpha_composite(img, (col * FINAL, row * FINAL))
        meta_frames[name] = [col, row]
    sheet.save(os.path.join(out, "ovoce.webp"), "WEBP", quality=92, method=6)

    cep = blade().resize((FINAL, FINAL), Image.LANCZOS)
    cep.save(os.path.join(out, "cepel.webp"), "WEBP", quality=92, method=6)

    meta = {
        "groups": {
            "cepel": {"file": "cepel.webp", "cell": [FINAL, FINAL], "cols": 1, "frames": {"cepel": [0, 0]}},
            "ovoce": {"file": "ovoce.webp", "cell": [FINAL, FINAL], "cols": 8, "frames": meta_frames},
        }
    }
    with open(os.path.join(out, "ninja.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("hotovo:", out)


if __name__ == "__main__":
    main()
