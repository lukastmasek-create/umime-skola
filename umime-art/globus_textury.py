"""Textury živého globusu (SubjectGlobe.tsx) do public/home/globe.

Země se kreslí z reálných hranic (npm balíček world-atlas, 50m): deseti zemím předmětů patří
barva předmětu, ostatní země jsou tlumenější. K tomu pohoří (Himálaj, Alpy, Andy…), pouště,
deštné lesy a tajga podle oblastí, jezera, hranice všech států a světla velkých měst.
Vzniká:
  albedo.webp  barva povrchu (RGB, rovnoúhlá projekce)
  data.webp    R = oceán (pro odlesk), G = výška (pro reliéf), B = oblačnost
  id.png       R = index předmětu v zemi (0 = žádný), G = světla měst; čte se bez vyhlazování
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

W, H = 3072, 1536
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
    ("fyzika", "#f58fa0", "840"),
]

# oblasti: (délka, šířka, poloměr v délce, poloměr v šířce)
DESERTS = [(12, 24, 26, 8), (45, 23, 10, 6), (105, 42, 14, 5), (134, -25, 13, 7), (22, -23, 7, 5), (71, 27, 5, 3), (-70, -23, 3, 6), (-113, 33, 6, 4), (58, 30, 8, 4), (-5, 25, 8, 4)]
RAINFOREST = [(-62, -4, 14, 8), (22, 0, 9, 6), (108, 3, 12, 6), (118, -1, 9, 4), (-76, 5, 5, 6), (-84, 10, 4, 3)]
TAIGA = [(100, 62, 45, 7), (-100, 57, 30, 7), (18, 63, 8, 5), (40, 62, 14, 5)]
SAVANNA = [(35, -5, 11, 11), (-55, -14, 8, 6), (20, 11, 22, 4), (28, -15, 9, 5), (78, 20, 7, 5)]
STEPPE = [(65, 48, 25, 5), (-102, 42, 12, 6), (-62, -35, 7, 5), (110, 47, 9, 3)]
# pohoří: lomená čára (délka, šířka), šířka v ° a výška 0..1
RANGES = [
    ([(70, 36), (78, 34), (88, 28), (96, 28.5), (100, 27)], 3.0, 1.0),
    ([(6, 45), (10, 46.5), (14, 47)], 1.6, 0.62),
    ([(-72, 10), (-77, 0), (-70, -20), (-72, -40), (-73, -52)], 2.2, 0.85),
    ([(-115, 58), (-110, 48), (-106, 38), (-107, 30)], 3.2, 0.62),
    ([(60, 68), (59, 55)], 1.6, 0.4),
    ([(76, 41), (88, 44), (96, 48)], 3.0, 0.7),
    ([(40, 43.5), (48, 41)], 1.4, 0.62),
    ([(21, 50), (26, 47), (24, 45)], 1.4, 0.4),
    ([(-8, 31), (-2, 33), (5, 35)], 1.6, 0.5),
    ([(6, 62), (13, 66), (19, 69)], 1.8, 0.45),
    ([(-82, 36), (-77, 41)], 1.8, 0.3),
    ([(145, -38), (149, -30), (146, -18)], 1.6, 0.3),
    ([(-1, 42.7), (3, 42.5)], 0.8, 0.5),
    ([(36, 10), (40, 6)], 3.0, 0.55),
    ([(48, 33), (55, 28)], 2.2, 0.5),
]
BLOBS_HIGH = [(88, 33, 12, 4, 0.55)]  # Tibetská plošina
# jezera: (délka, šířka, půlosa v délce, půlosa v šířce, sklon °)
LAKES = [(-87.5, 47.7, 3.2, 1.1, 0), (-87, 44, 0.8, 2.0, 0), (-82, 45, 1.5, 1.0, 0), (-81, 42.2, 1.8, 0.5, 0), (-77.8, 43.7, 1.4, 0.5, 0),
         (33, -1, 1.6, 1.6, 0), (108, 53.5, 0.9, 2.6, 30), (31, 60.8, 1.4, 0.7, 0), (-111, 41.2, 0.6, 0.5, 0)]
# velká města (délka, šířka, váha) pro světla na noční straně
CITIES = [(-74, 40.7, 1), (-118, 34, 0.9), (-87.6, 41.9, 0.7), (-99, 19.4, 0.9), (-46.6, -23.5, 1), (-58.4, -34.6, 0.8), (-70.6, -33.4, 0.5), (-77, -12, 0.6),
          (0, 51.5, 1), (2.3, 48.9, 0.9), (13.4, 52.5, 0.8), (14.4, 50.1, 0.6), (12.5, 41.9, 0.7), (-3.7, 40.4, 0.7), (37.6, 55.7, 1), (30, 59.9, 0.6), (28.9, 41, 0.8),
          (31.2, 30, 0.9), (3.4, 6.5, 0.8), (28, -26, 0.7), (36.8, -1.3, 0.5), (46.7, 24.7, 0.6), (51.4, 35.7, 0.8), (77.2, 28.6, 1), (72.8, 19, 1), (88.4, 22.6, 0.8),
          (90.4, 23.8, 0.8), (67, 24.9, 0.7), (100.5, 13.7, 0.7), (106.8, -6.2, 0.9), (121, 14.6, 0.7), (116.4, 39.9, 1), (121.5, 31.2, 1), (113.3, 23.1, 0.9),
          (114.2, 22.3, 0.7), (126.9, 37.6, 0.9), (139.7, 35.7, 1), (135.5, 34.7, 0.7), (151.2, -33.9, 0.6), (144.9, -37.8, 0.5), (-123, 49, 0.4), (-79.4, 43.7, 0.5)]


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
    return (np.cos(lat) * np.cos(lon)).astype(np.float32), (np.cos(lat) * np.sin(lon)).astype(np.float32), np.sin(lat).astype(np.float32), lon.astype(np.float32), lat.astype(np.float32)


def blob(lon_deg, lat_deg, cx, cy, rx, ry):
    """Gaussovská skvrna v ° (zalomení délky přes datovou hranici ošetřeno)."""
    dx = (lon_deg - cx + 180) % 360 - 180
    dy = lat_deg - cy
    return np.exp(-((dx / rx) ** 2 + (dy / ry) ** 2))


def seg_dist(lon_deg, lat_deg, a, b):
    """Vzdálenost bodů od úsečky a-b v ° (s ohledem na zkrácení délky podle šířky)."""
    k = np.cos(np.radians(lat_deg))
    px, py = lon_deg * k, lat_deg
    ax, ay = a[0] * np.cos(np.radians(a[1])), a[1]
    bx, by = b[0] * np.cos(np.radians(b[1])), b[1]
    vx, vy = bx - ax, by - ay
    L = vx * vx + vy * vy + 1e-9
    t = np.clip(((px - ax) * vx + (py - ay) * vy) / L, 0, 1)
    return np.hypot(px - (ax + t * vx), py - (ay + t * vy))


# --- hranice zemí ---

def project(lon, lat, w, h):
    return ((np.asarray(lon) + 180.0) / 360.0 * w, (90.0 - np.asarray(lat)) / 180.0 * h)


def rings_of(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    for poly in polys:
        for ring_i, ring in enumerate(poly):
            # přes datovou hranici (±180°) se délka zalomí: rozvineme ji do souvislé řady
            lons = [ring[0][0]]
            for p in ring[1:]:
                lon = p[0]
                while lon - lons[-1] > 180:
                    lon -= 360
                while lon - lons[-1] < -180:
                    lon += 360
                lons.append(lon)
            yield poly, ring_i, lons, [p[1] for p in ring]


def draw_geometry(draw, geom, value, w, h, skip=None, outline=0):
    for poly, ring_i, lons, lats in rings_of(geom):
        if skip and skip(lons):
            continue
        for shift in (-360.0, 0.0, 360.0):
            xs, ys = project([x + shift for x in lons], lats, w, h)
            pts = list(zip(xs.tolist(), ys.tolist()))
            if len(pts) < 3 or not (max(xs) >= 0 and min(xs) <= w):
                continue
            if outline:
                draw.line(pts, fill=value, width=outline)
            else:
                draw.polygon(pts, fill=value if ring_i == 0 else 0)


def build_masks(countries):
    big = (W * SS, H * SS)
    land = Image.new("L", big, 0)
    ids = Image.new("L", big, 0)
    border = Image.new("L", big, 0)
    dl, di, db = ImageDraw.Draw(land), ImageDraw.Draw(ids), ImageDraw.Draw(border)
    by_iso = {str(c["id"]): c for c in countries if c.get("id")}
    greenland = Image.new("L", big, 0)
    dg = ImageDraw.Draw(greenland)
    for c in countries:
        if c["name"] == "Antarctica":
            continue
        draw_geometry(dl, c["geometry"], 255, *big)
        draw_geometry(db, c["geometry"], 255, *big, outline=SS)
        if c["name"] == "Greenland":
            draw_geometry(dg, c["geometry"], 255, *big)
    dl.rectangle([0, int((90 + 62) / 180 * big[1]), big[0], big[1]], fill=255)
    for lon, lat, rx, ry, tilt in LAKES:
        pts = []
        for k in range(40):
            a = k / 40 * math.tau
            x, y = rx * math.cos(a), ry * math.sin(a)
            t = math.radians(tilt)
            pts.append(project(lon + x * math.cos(t) - y * math.sin(t), lat + (x * math.sin(t) + y * math.cos(t)), *big))
        dl.polygon([(float(p[0]), float(p[1])) for p in pts], fill=0)
    for i, (_, _, iso) in enumerate(SUBJECTS, start=1):
        # Francie: bez zámořských území (Guyana, ostrovy), jen evropská pevnina
        skip = (lambda lons: np.mean(lons) < -20 or np.mean(lons) > 30) if iso == "250" else None
        if iso == "840":  # USA: jen souvislé státy, bez Aljašky a Havaje (ať neleží půl země v Pacifiku)
            skip = lambda lons: np.mean(lons) < -128 or np.mean(lons) > 0
        draw_geometry(di, by_iso[iso]["geometry"], i * 20, *big, skip=skip)
    return land, ids, greenland, border


def down(im, resample=Image.LANCZOS):
    return im.resize((W, H), resample)


def main(path):
    countries = json.load(open(path))
    land_hi, ids_hi, green_hi, border_hi = build_masks(countries)
    land = np.asarray(down(land_hi), dtype=np.float32) / 255.0
    greenland = np.asarray(down(green_hi), dtype=np.float32) / 255.0
    border = np.asarray(down(border_hi), dtype=np.float32) / 255.0
    ids = np.asarray(ids_hi.resize((W, H), Image.NEAREST), dtype=np.uint8)

    x, y, z, lon, lat = sphere_points(W, H)
    lon_d, lat_d = np.degrees(lon), np.degrees(lat)
    absl = np.abs(lat_d)

    near = np.asarray(down(land_hi).filter(ImageFilter.GaussianBlur(7)), dtype=np.float32) / 255.0
    far = np.asarray(down(land_hi).filter(ImageFilter.GaussianBlur(36)), dtype=np.float32) / 255.0

    n_big = fbm(x, y, z, 11, octaves=5, base=2.2)
    n_mid = fbm(x, y, z, 29, octaves=6, base=6.0)
    n_fine = fbm(x, y, z, 53, octaves=6, base=26.0)
    n_micro = fbm(x, y, z, 77, octaves=3, base=90.0)

    # biomy a výška
    desert = np.zeros_like(n_big)
    for cx, cy, rx, ry in DESERTS:
        desert = np.maximum(desert, blob(lon_d, lat_d, cx, cy, rx, ry))
    desert = np.clip(desert * (1.0 + 0.5 * n_mid) * 1.35 - 0.12, 0, 1)
    rain = np.zeros_like(n_big)
    for cx, cy, rx, ry in RAINFOREST:
        rain = np.maximum(rain, blob(lon_d, lat_d, cx, cy, rx, ry))
    taiga = np.zeros_like(n_big)
    for cx, cy, rx, ry in TAIGA:
        taiga = np.maximum(taiga, blob(lon_d, lat_d, cx, cy, rx, ry))
    savanna = np.zeros_like(n_big)
    for cx, cy, rx, ry in SAVANNA:
        savanna = np.maximum(savanna, blob(lon_d, lat_d, cx, cy, rx, ry))
    steppe = np.zeros_like(n_big)
    for cx, cy, rx, ry in STEPPE:
        steppe = np.maximum(steppe, blob(lon_d, lat_d, cx, cy, rx, ry))

    mount = np.zeros_like(n_big)
    for line, width, h in RANGES:
        d = np.full_like(n_big, 99.0)
        for a, b in zip(line[:-1], line[1:]):
            d = np.minimum(d, seg_dist(lon_d, lat_d, a, b))
        mount = np.maximum(mount, h * np.exp(-((d / width) ** 2)))
    for cx, cy, rx, ry, h in BLOBS_HIGH:
        mount = np.maximum(mount, h * blob(lon_d, lat_d, cx, cy, rx, ry))
    ridge = 1 - np.abs(n_mid * 2 - 1)
    height = np.clip(0.18 + 0.32 * n_big + 0.5 * mount * (0.55 + 0.7 * ridge) + 0.12 * n_fine, 0, 1) * land

    # oceán: od tmavé modré přes tyrkys u pobřeží, s jemnými vlnami a šelfem
    deep, mid, shallow = rgb("#0e2c7a"), rgb("#1b64bd"), rgb("#4fd2e6")
    depth = np.clip(far * 2.4, 0, 1)[..., None]
    coast = np.clip(near * 1.8, 0, 1)[..., None]
    ocean = deep * (1 - depth) + mid * depth
    ocean = ocean * (1 - coast) + shallow * coast
    ocean = ocean * (0.93 + 0.1 * n_mid[..., None] + 0.04 * n_micro[..., None])

    # pevnina: základ podle šířky, pak biomy
    tropic, temperate, desert_c, tundra, snow = rgb("#3f9d57"), rgb("#79bd62"), rgb("#dcc37e"), rgb("#9db08a"), rgb("#f3f8ff")
    forest_c, taiga_c, sav_c, steppe_c, rock_c = rgb("#1f7a42"), rgb("#2f6a52"), rgb("#b9c45f"), rgb("#c7c77a"), rgb("#8a7a6a")
    t_trop = np.clip(1 - absl / 26, 0, 1)
    t_tun = np.clip((absl - 55) / 12, 0, 1)
    t_snow = np.clip((absl - 68) / 8, 0, 1)
    base = temperate[None, None, :] * (1 - t_trop[..., None]) + tropic[None, None, :] * t_trop[..., None]

    def mix(base, color, amount):
        a = np.clip(amount, 0, 1)[..., None]
        return base * (1 - a) + color * a

    base = mix(base, steppe_c, steppe * 0.8)
    base = mix(base, sav_c, savanna * 0.75)
    base = mix(base, forest_c, rain * 0.9)
    base = mix(base, taiga_c, taiga * 0.7)
    base = mix(base, desert_c, desert)
    base = mix(base, tundra, t_tun)
    base = mix(base, rock_c, np.clip((height - 0.4) * 2.4, 0, 1) * 0.9)
    # sníh na vysokých horách a u pólů, Grónsko
    snow_amt = np.clip((height - 0.8) * 6.0, 0, 1) * np.clip(n_fine * 2.2 - 0.4, 0, 1)
    base = mix(base, snow, np.maximum(np.clip(snow_amt, 0, 1), t_snow))
    base = mix(base, snow, greenland * 0.88)
    base = base * (0.84 + 0.3 * n_fine[..., None] + 0.04 * n_micro[..., None])
    base = base * (0.92 + 0.28 * height[..., None])
    land_rgb = base

    # země předmětů: vlastní barva předmětu (s detailem terénu), ostatní tlumenější
    subject_rgb = land_rgb.copy()
    for i, (_, color, _) in enumerate(SUBJECTS, start=1):
        m = ids == i * 20
        c = rgb(color)
        shade = (0.8 + 0.3 * n_fine + 0.28 * height + 0.05 * n_micro)[..., None]
        subject_rgb = np.where(m[..., None], np.clip(c * shade, 0, 1), subject_rgb)
    is_subject = (ids > 0)[..., None]
    muted = land_rgb * 0.82 + 0.18 * np.array([0.55, 0.6, 0.55], dtype=np.float32)
    land_final = np.where(is_subject, subject_rgb, muted)
    # hranice států: jemně ztmavit
    land_final = land_final * (1 - 0.28 * border[..., None])

    land_a = np.clip(land, 0, 1)[..., None]
    albedo = ocean * (1 - land_a) + land_final * land_a
    Image.fromarray((np.clip(albedo, 0, 1) * 255).astype(np.uint8), "RGB").save(os.path.join(DEST, "albedo.webp"), quality=87, method=6)

    # data: R oceán, G výška (v zemích předmětů o něco výraznější), B oblačnost s pásy
    c1 = fbm(x, y, z, 71, octaves=6, base=3.0)
    c2 = fbm(x + 0.31 * np.sin(z * 5), y, z, 97, octaves=6, base=7.0)
    bands = 0.5 + 0.5 * np.sin(lat * 9.0 + 2.0 * n_big)
    clouds = np.clip((c1 * 0.65 + c2 * 0.5 + 0.12 * bands - 0.62) * 3.4, 0, 1)
    clouds = np.clip(clouds * (1 - 0.65 * np.clip(absl / 90 - 0.78, 0, 1)), 0, 1)
    height_out = np.clip(height + 0.06 * (ids > 0), 0, 1)
    data = np.stack([1 - land_a[..., 0], height_out, clouds], axis=-1)
    Image.fromarray((np.clip(data, 0, 1) * 255).astype(np.uint8), "RGB").save(os.path.join(DEST, "data.webp"), quality=85, method=6)

    # id.png: R = předmět, G = světla měst (hustší kolem velkých měst a podél pobřeží)
    rng = np.random.default_rng(5)
    dens = np.zeros_like(n_big)
    for lo, la, wgt in CITIES:
        dens = np.maximum(dens, wgt * blob(lon_d, lat_d, lo, la, 2.6 / max(0.3, math.cos(math.radians(la))), 2.4))
    dens = dens * (0.5 + 0.8 * (1 - far * 0.6)) * np.clip(land, 0, 1) * (0.55 + 0.9 * n_mid)
    pts = rng.random((H, W), dtype=np.float32) < np.clip(dens * 0.22, 0, 0.9)
    lights = (pts * rng.integers(150, 256, size=(H, W))).astype(np.uint8)
    rgb_id = np.stack([ids, lights, np.zeros_like(ids)], axis=-1)
    Image.fromarray(rgb_id, "RGB").save(os.path.join(DEST, "id.png"), optimize=True)

    still_image(albedo, data, ids)


def still_image(albedo, data, ids_f, size=720, lon0=14.0, lat0=34.0):
    """Ortografický pohled na Evropu s osvětlením (náhrada živého globusu bez WebGL)."""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    dx, dy = (xx + 0.5 - size / 2) / (size * 0.42), -(yy + 0.5 - size / 2) / (size * 0.42)
    r2 = dx * dx + dy * dy
    inside = r2 < 1
    nz = np.sqrt(np.clip(1 - r2, 0, 1))
    la0, lo0 = math.radians(lat0), math.radians(lon0)
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
    r = np.sqrt(r2)
    glow = np.clip(1 - (r - 1) / 0.12, 0, 1) ** 2 * (r >= 1)
    rgba = np.zeros((size, size, 4), dtype=np.float32)
    rgba[..., :3] = np.where(inside[..., None], lit, np.array([0.35, 0.65, 1.0]) * glow[..., None])
    rgba[..., 3] = np.where(inside, 1.0, glow * 0.6)
    Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA").save(os.path.join(DEST, "still.webp"), quality=88, method=6, alpha_quality=90)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "countries.json")
