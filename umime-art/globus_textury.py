"""Textury živého globusu (SubjectGlobe.tsx) do public/home/globe.

Země se kreslí z reálných hranic (npm balíček world-atlas, 50m): deviti zemím předmětů
patří barva předmětu, ostatní země jsou tlumenější. Vzniká:
  albedo.webp  barva povrchu (RGB, 2048x1024, rovnoúhlá projekce)
  data.webp    R = oceán (pro odlesk), G = výška (pro reliéf), B = oblačnost
  id.png       index předmětu v zemi (0 = žádný), čte se bez vyhlazování
  still.webp   statický náhled pro prohlížeče bez WebGL a pro omezení animací

Spuštění: python umime-art/globus_textury.py <countries.json>
countries.json vznikne z world-atlas přes topojson-client (id = číselný kód ISO země).
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(ROOT, "..", "public", "home", "globe")
os.makedirs(DEST, exist_ok=True)

W, H = 2048, 1024
SS = 2  # nadvzorkování hran

# pořadí = SUBJECTS v src/lib/taxonomy.ts; barva předmětu a kód ISO země
SUBJECTS = [
    ("cestina", "#ffc933", "203"),
    ("literatura", "#ff9ec7", "250"),
    ("anglictina", "#8fd0ff", "826"),
    ("nemcina", "#ffb26b", "276"),
    ("rustina", "#ff8a6b", "643"),
    ("matematika", "#7ee0b0", "300"),
    ("dejepis", "#c9b8ff", "380"),
    ("zemepis", "#7fdbd8", "524"),
    ("prirodopis", "#b6e36a", "076"),
]


def rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255.0


# --- šum na kouli (bez švu a bez zkreslení u pólů) ---

def _hash(ix, iy, iz, seed):
    n = (ix * 374761393 + iy * 668265263 + iz * 2147483647 + seed * 1274126177) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    n = n ^ (n >> 16)
    return (n & 0xFFFF).astype(np.float32) / 65535.0


def value_noise(x, y, z, seed):
    xi, yi, zi = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64), np.floor(z).astype(np.int64)
    fx, fy, fz = x - xi, y - yi, z - zi
    sx, sy, sz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    out = 0.0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (sx if dx else 1 - sx) * (sy if dy else 1 - sy) * (sz if dz else 1 - sz)
                out = out + w * _hash(xi + dx, yi + dy, zi + dz, seed)
    return out


def fbm(px, py, pz, seed, octaves=6, lac=2.0, gain=0.5, base=2.0):
    total, amp, norm, f = 0.0, 1.0, 0.0, base
    for o in range(octaves):
        total = total + amp * value_noise(px * f, py * f, pz * f, seed + o * 17)
        norm += amp
        amp *= gain
        f *= lac
    return total / norm


def sphere_points(w, h):
    lon = (np.arange(w) + 0.5) / w * 2 * math.pi - math.pi
    lat = math.pi / 2 - (np.arange(h) + 0.5) / h * math.pi
    lon, lat = np.meshgrid(lon, lat)
    return np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat), lon, lat


# --- hranice zemí ---

def project(lon, lat, w, h):
    return ((np.asarray(lon) + 180.0) / 360.0 * w, (90.0 - np.asarray(lat)) / 180.0 * h)


def draw_geometry(draw, geom, value, w, h, skip=None):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        if skip and skip(poly[0]):
            continue
        for ring_i, ring in enumerate(poly):
            # přes datovou hranici (±180°) se délka zalomí: rozvineme ji do souvislé řady
            # a polygon nakreslíme ještě posunutý o celý obvod, aby se zbytek vykreslil na druhé straně
            lons = [ring[0][0]]
            for p in ring[1:]:
                lon = p[0]
                while lon - lons[-1] > 180:
                    lon -= 360
                while lon - lons[-1] < -180:
                    lon += 360
                lons.append(lon)
            for shift in (-360.0, 0.0, 360.0):
                xs, ys = project([x + shift for x in lons], [p[1] for p in ring], w, h)
                pts = list(zip(xs.tolist(), ys.tolist()))
                if len(pts) >= 3 and max(xs) >= 0 and min(xs) <= w:
                    draw.polygon(pts, fill=value if ring_i == 0 else 0)


def build_masks(countries):
    land = Image.new("L", (W * SS, H * SS), 0)
    ids = Image.new("L", (W * SS, H * SS), 0)
    dl, di = ImageDraw.Draw(land), ImageDraw.Draw(ids)
    by_iso = {str(c["id"]): c for c in countries if c.get("id")}
    greenland = Image.new("L", (W * SS, H * SS), 0)
    dg = ImageDraw.Draw(greenland)
    for c in countries:
        if c["name"] == "Antarctica":
            continue
        draw_geometry(dl, c["geometry"], 255, W * SS, H * SS)
        if c["name"] == "Greenland":
            draw_geometry(dg, c["geometry"], 255, W * SS, H * SS)
    # Antarktida: pás pod 60° j. š.
    dl.rectangle([0, int((90 + 62) / 180 * H * SS), W * SS, H * SS], fill=255)
    for i, (_, _, iso) in enumerate(SUBJECTS, start=1):
        # Francie: bez zámořských území (Guyana, ostrovy), jen evropská pevnina
        skip = (lambda ring: np.mean([p[0] for p in ring]) < -20 or np.mean([p[0] for p in ring]) > 30) if iso == "250" else None
        draw_geometry(di, by_iso[iso]["geometry"], i * 20, W * SS, H * SS, skip)
    return land, ids, greenland


def down(im, resample=Image.LANCZOS):
    return im.resize((W, H), resample)


def main(path):
    countries = json.load(open(path))
    land_hi, ids_hi, green_hi = build_masks(countries)
    land = np.asarray(down(land_hi), dtype=np.float32) / 255.0
    greenland = np.asarray(down(green_hi), dtype=np.float32) / 255.0
    ids = np.asarray(ids_hi.resize((W, H), Image.NEAREST), dtype=np.uint8)
    Image.fromarray(ids, "L").save(os.path.join(DEST, "id.png"), optimize=True)

    x, y, z, lon, lat = sphere_points(W, H)
    # vzdálenost od pobřeží: rozmazaná maska pevniny (hloubka moře, pobřežní záře)
    near = np.asarray(down(land_hi).filter(ImageFilter.GaussianBlur(5)), dtype=np.float32) / 255.0
    far = np.asarray(down(land_hi).filter(ImageFilter.GaussianBlur(26)), dtype=np.float32) / 255.0

    n_big = fbm(x, y, z, 11, octaves=5, base=2.2)
    n_mid = fbm(x, y, z, 29, octaves=6, base=6.0)
    n_fine = fbm(x, y, z, 53, octaves=5, base=24.0)

    # oceán: od tmavé modré přes tyrkys u pobřeží
    deep, mid, shallow = rgb("#12348a"), rgb("#1f6fc4"), rgb("#52d4e8")
    depth = np.clip(far * 2.2, 0, 1)[..., None]
    coast = np.clip(near * 1.7, 0, 1)[..., None]
    ocean = deep * (1 - depth) + mid * depth
    ocean = ocean * (1 - coast) + shallow * coast
    ocean = ocean * (0.94 + 0.12 * n_mid[..., None])

    # pevnina: pásma podle šířky + šum, pouště kolem 15–35°, led u pólů
    absl = np.abs(lat) * 180 / math.pi
    tropic, temperate, desert, tundra, snow = rgb("#3f9d57"), rgb("#79bd62"), rgb("#d9bf7c"), rgb("#9db08a"), rgb("#f3f8ff")
    t_trop = np.clip(1 - absl / 28, 0, 1)
    t_des = np.clip(1 - np.abs(absl - 25) / 10, 0, 1) * np.clip(n_big * 2.4 - 0.7, 0, 1)
    t_tun = np.clip((absl - 52) / 14, 0, 1)
    t_snow = np.clip((absl - 66) / 8, 0, 1)
    base = temperate[None, None, :] * (1 - t_trop[..., None]) + tropic[None, None, :] * t_trop[..., None]
    base = base * (1 - t_des[..., None]) + desert * t_des[..., None]
    base = base * (1 - t_tun[..., None]) + tundra * t_tun[..., None]
    base = base * (1 - t_snow[..., None]) + snow * t_snow[..., None]
    base = base * (1 - greenland[..., None] * 0.85) + snow * greenland[..., None] * 0.85
    ridge = 1 - np.abs(n_mid * 2 - 1)
    height = np.clip(0.25 + 0.5 * n_big + 0.35 * ridge ** 2 * n_big - 0.25, 0, 1) * land
    base = base * (0.86 + 0.28 * n_fine[..., None])
    # hory světlejší, nížiny tmavší
    base = base * (0.9 + 0.35 * height[..., None])
    land_rgb = base

    # země předmětů: vlastní barva předmětu, ostatní země o něco tlumenější
    ids_f = np.asarray(Image.fromarray(ids).resize((W, H), Image.NEAREST))
    subject_rgb = land_rgb.copy()
    for i, (_, color, _) in enumerate(SUBJECTS, start=1):
        m = (ids_f == i * 20)
        c = rgb(color)
        shade = (0.82 + 0.32 * n_fine + 0.18 * height)[..., None]
        subject_rgb = np.where(m[..., None], np.clip(c * shade, 0, 1), subject_rgb)
    is_subject = (ids_f > 0)[..., None]
    muted = land_rgb * 0.8 + 0.2 * np.array([0.55, 0.6, 0.55], dtype=np.float32)
    land_final = np.where(is_subject, subject_rgb, muted)

    land_a = np.clip(land, 0, 1)[..., None]
    albedo = ocean * (1 - land_a) + land_final * land_a
    Image.fromarray((np.clip(albedo, 0, 1) * 255).astype(np.uint8), "RGB").save(
        os.path.join(DEST, "albedo.webp"), quality=86, method=6)

    # data: R oceán, G výška (v zemích předmětů o něco výraznější), B oblačnost
    c1 = fbm(x * 1.0, y * 1.0, z * 1.0, 71, octaves=6, base=3.0)
    c2 = fbm(x + 0.31 * np.sin(z * 5), y, z, 97, octaves=5, base=7.0)
    clouds = np.clip((c1 * 0.7 + c2 * 0.5 - 0.62) * 3.2, 0, 1)
    clouds = np.clip(clouds * (1 - 0.65 * np.clip(absl / 90 - 0.78, 0, 1)), 0, 1)
    data = np.stack([1 - land_a[..., 0], height, clouds], axis=-1)
    Image.fromarray((np.clip(data, 0, 1) * 255).astype(np.uint8), "RGB").save(
        os.path.join(DEST, "data.webp"), quality=84, method=6)

    still_image(albedo, data, ids_f)


def still_image(albedo, data, ids_f, size=640, lon0=14.0, lat0=34.0):
    """Ortografický pohled na Evropu s osvětlením (náhrada živého globusu bez WebGL)."""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx, dy = (xx + 0.5 - size / 2) / (size * 0.42), -(yy + 0.5 - size / 2) / (size * 0.42)
    r2 = dx * dx + dy * dy
    inside = r2 < 1
    nz = np.sqrt(np.clip(1 - r2, 0, 1))
    la0, lo0 = math.radians(lat0), math.radians(lon0)
    # bod koule v souřadnicích pohledu -> zeměpisná poloha
    px = dx
    py = dy * math.cos(la0) + nz * math.sin(la0)
    pz = nz * math.cos(la0) - dy * math.sin(la0)
    lat = np.arcsin(np.clip(py, -1, 1))
    lon = lo0 + np.arctan2(px, pz)
    u = ((lon + math.pi) / (2 * math.pi)) % 1.0
    v = 0.5 - lat / math.pi
    ix = np.clip((u * W).astype(int), 0, W - 1)
    iy = np.clip((v * H).astype(int), 0, H - 1)
    col = albedo[iy, ix]
    ocean = data[iy, ix, 0][..., None]
    L = np.array([-0.5, 0.55, 0.65], dtype=np.float32)
    L /= np.linalg.norm(L)
    ndl = np.clip(dx * L[0] + dy * L[1] + nz * L[2], 0, 1)[..., None]
    lit = col * (0.28 + 0.95 * ndl)
    h = np.array([L[0], L[1], L[2] + 1]); h /= np.linalg.norm(h)
    spec = (np.clip(dx * h[0] + dy * h[1] + nz * h[2], 0, 1) ** 70)[..., None] * ocean
    cloud = data[iy, ix, 2][..., None]
    lit = lit * (1 - 0.8 * cloud) + cloud * (0.35 + 0.8 * ndl)
    lit = lit + spec * 0.7
    rim = np.clip(1 - nz, 0, 1)[..., None] ** 3
    lit = lit + rim * np.array([0.2, 0.45, 0.9]) * 0.8
    # atmosféra kolem koule
    r = np.sqrt(r2)
    glow = np.clip(1 - (r - 1) / 0.12, 0, 1) ** 2 * (r >= 1)
    rgba = np.zeros((size, size, 4), dtype=np.float32)
    rgba[..., :3] = np.where(inside[..., None], lit, np.array([0.35, 0.65, 1.0]) * glow[..., None])
    rgba[..., 3] = np.where(inside, 1.0, glow * 0.6)
    img = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA")
    img.save(os.path.join(DEST, "still.webp"), quality=88, method=6, alpha_quality=90)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "countries.json")
