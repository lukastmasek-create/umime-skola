"""Vykreslí disk kola štěstí (public/home/obchod/kolo-disk.webp) pro N políček.
Použití: python3 tools/wheel-disk.py   (barvy musí odpovídat WHEEL_PRIZES v src/lib/wheel.ts)
Políčka jdou po směru hodin od horního okraje, stejně jako ve webu."""
import math
from PIL import Image, ImageDraw, ImageFilter

COLORS = ["#3248f0", "#ff5a3c", "#ffc933", "#17a864", "#29a3ff", "#9b5cf0"] * 2  # WHEEL_PRIZES, 12 políček
S, SS = 512, 4
W = S * SS
C = W / 2
R_OUT, R_RIM_IN, R_HUB = 216 * SS, 196 * SS, 35 * SS

def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def mix(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# zlatý okraj: soustředné vrstvy od tmavé po světlou
dark, light = hexrgb("#b07d0c"), hexrgb("#ffd84a")
steps = 24
for i in range(steps):
    r = R_OUT - (R_OUT - R_RIM_IN) * i / steps
    t = math.sin(math.pi * i / steps)
    d.ellipse([C - r, C - r, C + r, C + r], fill=mix(dark, light, t) + (255,))

n = len(COLORS)
step = 360 / n
bbox = [C - R_RIM_IN, C - R_RIM_IN, C + R_RIM_IN, C + R_RIM_IN]
for i, col in enumerate(COLORS):
    a0, a1 = -90 + i * step, -90 + (i + 1) * step
    base = hexrgb(col)
    d.pieslice(bbox, a0, a1, fill=mix(base, (0, 0, 0), 0.03) + (255,))
    # světlejší vnější pás
    r2 = 150 * SS
    band = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.pieslice(bbox, a0, a1, fill=mix(base, (255, 255, 255), 0.05) + (255,))
    bd.ellipse([C - r2, C - r2, C + r2, C + r2], fill=(0, 0, 0, 0))
    img.alpha_composite(band)
    # tři bílé tečky u okraje
    mid = math.radians(a0 + step / 2)
    for k in (-1, 0, 1):
        ang = mid + math.radians(k * min(7, step * 0.22))
        rr = 176 * SS
        x, y = C + rr * math.cos(ang), C + rr * math.sin(ang)
        d.ellipse([x - 3.2 * SS, y - 3.2 * SS, x + 3.2 * SS, y + 3.2 * SS], fill=(255, 255, 255, 255))

# dělicí linky a zlaté nýty na okraji
for i in range(n):
    ang = math.radians(-90 + i * step)
    d.line([C + R_HUB * math.cos(ang), C + R_HUB * math.sin(ang), C + R_RIM_IN * math.cos(ang), C + R_RIM_IN * math.sin(ang)], fill=hexrgb("#ffe27a") + (255,), width=3 * SS)
    rr = (R_OUT + R_RIM_IN) / 2
    x, y = C + rr * math.cos(ang), C + rr * math.sin(ang)
    d.ellipse([x - 6 * SS, y - 6 * SS, x + 6 * SS, y + 6 * SS], fill=hexrgb("#c58f10") + (255,))
    d.ellipse([x - 4 * SS, y - 4 * SS, x + 4 * SS, y + 4 * SS], fill=hexrgb("#ffd84a") + (255,))

# střed
d.ellipse([C - R_HUB - 5 * SS, C - R_HUB - 5 * SS, C + R_HUB + 5 * SS, C + R_HUB + 5 * SS], fill=hexrgb("#e0a916") + (255,))
d.ellipse([C - R_HUB, C - R_HUB, C + R_HUB, C + R_HUB], fill=(255, 255, 255, 255))

out = img.resize((S, S), Image.LANCZOS)
out.save("public/home/obchod/kolo-disk.webp", "WEBP", quality=92)
