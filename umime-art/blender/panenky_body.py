"""Tělo, hlava (s morph targety nálad), oči, řasy a ruce realistické panenky. Viz panenky_lib.py pro konvence."""
import math
import random

from panenky_lib import *  # noqa: F401,F403

CZ0, CY = 1.82, 0.005  # střed hlavy v lokálním (nezvětšeném) souřadnicovém systému
DZ = 0.075  # posun zvětšené hlavy nahoru, aby brada zůstala nad krkem
CZ = CZ0 + DZ  # střed hlavy ve výsledné scéně
HA, HB, HC = 0.108, 0.118, 0.124  # poloosy lebky
EYE_X, EYE_Z = 0.046, 1.818
BROW_Z = 1.868
EYE_R = 0.0305
MOUTH_Z, MOUTH_HW = 1.733, 0.019
HS = 1.42  # zvětšení hlavy kolem jejího středu (styl animovaného filmu)
HR = HS / 1.14  # poměr vůči původním pevným rozměrům pokrývek hlavy
EYE_INFO = {}
LID_UP_A0, LID_DN_A0 = 0.66, 0.78  # úhel okraje horního a dolního víčka od předního pólu oka
S = 1536  # textura obličeje
TEXW = 0.30


# ---------------------------------------------------------------- hlava
def hs(P):
    C = np.array([0.0, CY, CZ0])
    return C + (np.asarray(P, dtype=float) - C) * HS + np.array([0.0, 0.0, DZ])


def head_points(TH, PH, off=0.0, mood=None):
    """Body povrchu hlavy pro úhly (TH kolem z, 0 = dopředu; PH výška -π/2..π/2). mood: None | 'happy' | 'sad'."""
    dx = np.cos(PH) * np.sin(TH)
    dy = -np.cos(PH) * np.cos(TH)
    dz = np.sin(PH)
    t = smooth(0.25, -0.85, dz)
    sx = 1 - 0.15 * t ** 1.3 + 0.07 * gauss((dz + 0.12) / 0.38) + 0.07 * gauss((dz + 0.58) / 0.28)
    back = smooth(0.0, 0.9, dy)
    x = HA * dx * sx
    y = CY + HB * dy * (1 + 0.07 * back) * (1 - 0.06 * t)
    z = CZ0 + HC * dz
    # brada vpřed, plošší spodek čelisti
    front = smooth(-0.1, -0.55, dy)
    y -= 0.004 * smooth(-0.35, -0.85, dz) * front
    fx, fz = x, z
    wf = front
    d = np.zeros_like(x)  # posun po y (záporné = ven)
    # čelo a plné tváře
    d -= 0.006 * gauss((fz - 1.765) / 0.040) * gauss((np.abs(fx) - 0.060) / 0.034)
    d -= 0.005 * gauss((fz - 1.755) / 0.030) * gauss((np.abs(fx) - 0.066) / 0.026)
    # oční důlky (velké kulaté oči)
    for s in (-1, 1):
        r = np.sqrt((fx - s * EYE_X) ** 2 + (fz - EYE_Z) ** 2)
        d += 0.0095 * gauss(r / 0.046)
    d -= 0.004 * gauss((fz - BROW_Z) / 0.012) * gauss((np.abs(fx) - 0.045) / 0.035)  # obočí
    # malý, jemně zahnutý nos
    hz = 0.34 * np.interp(fz, [1.70, 1.74, 1.755, 1.768, 1.78, 1.80, 1.82, 1.84], [0, 0.003, 0.012, 0.020, 0.018, 0.012, 0.006, 0.001])
    wz = np.interp(fz, [1.74, 1.76, 1.80, 1.84], [0.015, 0.012, 0.009, 0.011])
    d -= hz * gauss(fx / wz)
    for s in (-1, 1):
        d -= 0.0030 * gauss(np.sqrt((fx - s * 0.010) ** 2 + (fz - 1.757) ** 2) / 0.0055)
    # rty (plné, měkké)
    d -= 0.0052 * gauss((fz - 1.7385) / 0.0055) * gauss(fx / 0.018)  # horní ret
    d -= 0.0066 * gauss((fz - 1.7255) / 0.0068) * gauss(fx / 0.017)  # dolní ret
    d += 0.0022 * gauss((fz - 1.7325) / 0.0015) * gauss(fx / 0.022)  # linie úst
    d -= 0.0030 * gauss((fz - 1.686) / 0.012) * gauss(fx / 0.016)  # drobná brada
    d += 0.0012 * gauss((fz - 1.746) / 0.004) * gauss(fx / 0.005)  # důlek nad rtem
    y = y + d * wf
    # nálady
    dz_m = np.zeros_like(x)
    dx_m = np.zeros_like(x)
    dy_m = np.zeros_like(x)
    if mood == "happy":
        corner = gauss((np.abs(fx) - 0.022) / 0.010) * gauss((fz - MOUTH_Z) / 0.013) * wf
        dz_m += 0.0125 * corner + 0.004 * gauss((np.abs(fx) - 0.055) / 0.02) * gauss((fz - 1.768) / 0.02) * wf
        dx_m += np.sign(fx) * 0.0045 * corner
        dy_m += 0.002 * gauss(fx / 0.03) * gauss((fz - MOUTH_Z) / 0.012) * wf  # úsměv: ústa se mírně vyboulí
        dz_m -= 0.002 * gauss(fx / 0.02) * gauss((fz - (MOUTH_Z - 0.006)) / 0.008) * wf
        dz_m += 0.0035 * gauss((np.abs(fx) - 0.045) / 0.02) * gauss((fz - (BROW_Z - 0.004)) / 0.012) * wf  # obočí nahoru
    elif mood == "sad":
        corner = gauss((np.abs(fx) - 0.022) / 0.010) * gauss((fz - MOUTH_Z) / 0.013) * wf
        dz_m -= 0.011 * corner
        dz_m += 0.003 * gauss(fx / 0.02) * gauss((fz - (MOUTH_Z - 0.006)) / 0.008) * wf
        dz_m += 0.0155 * gauss((np.abs(fx) - 0.018) / 0.013) * gauss((fz - (BROW_Z + 0.001)) / 0.013) * wf  # vnitřní obočí nahoru
        dz_m -= 0.006 * gauss((np.abs(fx) - 0.062) / 0.016) * gauss((fz - BROW_Z) / 0.013) * wf  # vnější dolů
        dz_m -= 0.003 * gauss(fx / 0.02) * gauss((fz - 1.685) / 0.012) * wf  # brada se krčí
    P = np.stack([x + dx_m, y + dy_m, z + dz_m], axis=-1)
    if np.any(off):
        off = np.asarray(off, dtype=float)
        if off.ndim:
            off = off[..., None]
        nrm = np.stack([dx / HA, dy / HB, dz / HC], axis=-1)
        nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
        P = P + nrm * off
    return P


def head_mesh(name, mat, parent, off=0.0, n=128, m=104, moods=("happy", "sad")):
    th = math.pi + np.arange(n) * 2 * math.pi / n
    ph = np.linspace(-math.pi / 2 + 0.035, math.pi / 2 - 0.035, m)
    TH, PH = np.meshgrid(th, ph)
    R = head_points(TH, PH, off)
    cap0 = head_points(np.array([0.0]), np.array([-math.pi / 2]), off)[0]
    cap1 = head_points(np.array([0.0]), np.array([math.pi / 2]), off)[0]
    V, F, _ = ring_grid(R, True, cap0=cap0, cap1=cap1)
    # frontální UV (obličej se mapuje jako z fotky zepředu)
    uv = np.stack([face_u(V[:, 0], V[:, 2]), 0.5 + (V[:, 2] - CZ0) / TEXW], axis=1)
    loop_uv = []
    for f in F:
        loop_uv += [tuple(uv[i]) for i in f]
    o = make_mesh(name, hs(V), F, mat, loop_uv, parent)
    if moods:
        o.shape_key_add(name="Basis")
        for mood in moods:
            Rm = head_points(TH, PH, off, mood)
            c0 = head_points(np.array([0.0]), np.array([-math.pi / 2]), off, mood)[0]
            c1 = head_points(np.array([0.0]), np.array([math.pi / 2]), off, mood)[0]
            Vm = np.vstack([Rm.reshape(-1, 3), c0[None], c1[None]])
            sk = o.shape_key_add(name=mood)
            sk.data.foreach_set("co", hs(Vm).reshape(-1).tolist())
    return o


def face_u(x, z):
    """U souřadnice textury obličeje: oblouková délka kolem hlavy (válcová projekce), takže se make-up na bocích neroztahuje."""
    x = np.asarray(x, dtype=float)
    z = np.asarray(z, dtype=float)
    t = smooth(0.25, -0.85, (z - CZ0) / HC)
    rho = HA * (1 - 0.15 * t ** 1.3 + 0.07 * gauss(((z - CZ0) / HC + 0.12) / 0.38) + 0.07 * gauss(((z - CZ0) / HC + 0.58) / 0.28))
    return 0.5 + HA * np.arcsin(np.clip(x / rho, -0.97, 0.97)) / TEXW


def px(x, z):
    return float(face_u(x, z)) * S, (1 - (0.5 + (z - CZ0) / TEXW)) * S


def lip_polygon(scale=1.0):
    """Obrys rtů v souřadnicích (x, z) — horní ret s kupidovým lukem a plnější dolní ret."""
    xs = np.linspace(-MOUTH_HW, MOUTH_HW, 40)
    u = xs / MOUTH_HW
    top = MOUTH_Z + 0.0085 * scale * (1 - u ** 2) ** 0.7 + 0.0022 * scale * gauss(np.abs(u) - 0.18, 0.2) - 0.0
    bot = MOUTH_Z - 0.0105 * scale * (1 - u ** 2) ** 0.8
    top_pts = list(zip(xs, top))
    bot_pts = list(zip(xs[::-1], bot[::-1]))
    return top_pts + bot_pts


def draw_poly(layer, pts, fill, blur=0):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(im).polygon([px(x, z) for x, z in pts], fill=fill)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(im)


def draw_ellipse(layer, cx, cz, rx, rz, fill, blur=6):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    x0, y0 = px(cx - rx, cz + rz)
    x1, y1 = px(cx + rx, cz - rz)
    ImageDraw.Draw(im).ellipse([x0, y0, x1, y1], fill=fill)
    im = im.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(im)


def brow_strokes(layer, s, color, strength=1.0):
    """Obočí z jemných tahů: elegantní oblouk, vnitřní část hustší a světlejší, konec se zužuje."""
    rng = np.random.default_rng(31 + int(s))
    ts = np.linspace(0, 1, 60)
    xs = s * (0.012 + ts * 0.066)
    zs = BROW_Z + 0.0125 * np.sin(ts * math.pi * 0.80) - 0.011 * ts ** 2.2
    th = (0.0050 - 0.0034 * ts ** 1.3)
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for _ in range(420):
        k = int(rng.integers(0, len(ts) - 3))
        off = rng.uniform(-1, 1) * th[k]
        ang = 0.55 * (1 - ts[k]) + rng.normal(0, 0.12)
        L = rng.uniform(0.006, 0.011)
        x0, z0 = xs[k], zs[k] + off
        x1, z1 = x0 + s * L * math.cos(ang), z0 + L * math.sin(ang) * 0.6 - L * 0.25 * ts[k]
        a = int(np.clip(rng.uniform(70, 150) * (1.0 - 0.45 * (1 - ts[k]) * 0), 0, 255) * strength)
        d.line([px(x0, z0), px(x1, z1)], fill=color + (a,), width=2)
    im = im.filter(ImageFilter.GaussianBlur(0.7))
    layer.alpha_composite(im)
    # měkký podklad
    top = [(x, z + t * 0.85) for x, z, t in zip(xs, zs, th)]
    bot = [(x, z - t * 0.85) for x, z, t in zip(xs[::-1], zs[::-1], th[::-1])]
    draw_poly(layer, top + bot, color + (int(70 * strength),), 2.2)


def mix(a, b, k):
    return tuple(int(x * (1 - k) + y * k) for x, y in zip(a, b))


def skin_face_texture(skin, hair, name):
    rng = np.random.default_rng(7)
    base = np.array(hex_rgb(skin)) * 255
    nz = noise_field(S, 48, 3) * 0.6 + noise_field(S, 12, 4) * 0.4
    arr = base[None, None, :] * (0.99 + 0.02 * nz[..., None])
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")
    sk = tuple(int(c) for c in base)
    rose = mix(sk, (236, 120, 118), 0.55)
    warm = mix(sk, (214, 140, 110), 0.45)
    shade = mix(sk, (150, 96, 80), 0.5)
    hi = mix(sk, (255, 246, 236), 0.6)
    # tváře: široké měkké červeň pod očima; čelo a nos mají jemné světlo
    for s in (-1, 1):
        draw_ellipse(img, s * 0.064, 1.757, 0.036, 0.024, rose + (88,), 22)
        draw_ellipse(img, s * 0.070, 1.773, 0.022, 0.012, hi + (48,), 10)  # lícní kost
        draw_ellipse(img, s * 0.082, 1.735, 0.014, 0.026, shade + (46,), 14)  # jemný kontur pod lícní kostí
        draw_ellipse(img, s * EYE_X, EYE_Z + 0.002, 0.052, 0.046, warm + (50,), 20)  # důlek kolem oka
    draw_ellipse(img, 0.0, 1.776, 0.011, 0.0085, rose + (80,), 5)  # špička nosu
    draw_ellipse(img, 0.0, 1.805, 0.007, 0.022, hi + (46,), 5)  # hřbet nosu
    draw_ellipse(img, 0.0, 1.912, 0.050, 0.020, hi + (36,), 16)  # čelo
    draw_ellipse(img, 0.0, 1.706, 0.026, 0.0075, shade + (46,), 7)  # stín pod spodním rtem
    draw_ellipse(img, 0.0, 1.683, 0.014, 0.010, rose + (30,), 7)  # brada
    # nozdry a stín pod nosem
    for s in (-1, 1):
        draw_ellipse(img, s * 0.0105, 1.7585, 0.0036, 0.0022, shade + (92,), 2)
    draw_ellipse(img, 0.0, 1.7525, 0.012, 0.0030, shade + (60,), 3)
    # přirozené rty s gradientem a světlem
    lip = mix(sk, (206, 98, 104), 0.62)
    lip_d = mix(lip, (120, 40, 52), 0.35)
    draw_poly(img, lip_polygon(), lip + (240,), 1.4)
    inner = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw_ellipse(inner, 0.0, MOUTH_Z - 0.0075, 0.013, 0.0042, mix(lip, (255, 190, 190), 0.55) + (120,), 4)  # lesk dolního rtu
    img.alpha_composite(inner)
    line_pts = [(x, MOUTH_Z + 0.0003 + 0.0008 * (1 - (x / MOUTH_HW) ** 2)) for x in np.linspace(-MOUTH_HW, MOUTH_HW, 24)] + [(x, MOUTH_Z - 0.0006) for x in np.linspace(MOUTH_HW, -MOUTH_HW, 24)]
    draw_poly(img, line_pts, lip_d + (230,), 1.0)
    brow = tuple(int(c * 255 * 0.62) for c in hex_rgb(hair))
    for s in (-1, 1):
        brow_strokes(img, s, brow)
    path = os.path.join(TEXDIR, name)
    img.convert("RGB").save(path, quality=93)
    return path


def lid_texture(skin, name, kind="up", shadow=None, liner=(34, 24, 38), glitter=0):
    """Víčko (sférický pás: u = 0..1 přes šířku víčka, v = 1 − α/π). Bez `shadow` neprůhledná kůže s linkou, se `shadow` průhledný make-up."""
    W, H = 256, 512
    u = (np.arange(W)[None, :] + 0.5) / W * np.ones((H, 1))
    v = 1 - (np.arange(H)[:, None] + 0.5) / H
    al = (1 - v) * math.pi * np.ones((1, W))
    up = kind == "up"
    edge = LID_UP_A0 if up else LID_DN_A0
    rel = al - edge  # vzdálenost od okraje víčka
    corner = np.sin(np.pi * u) ** 0.6
    sk = np.array(hex_rgb(skin)) * 255
    if shadow is None:
        rose = sk * np.array([1.0, 0.80, 0.78])
        col = np.broadcast_to(sk, (H, W, 3)).astype(np.float32).copy()
        k = np.exp(-np.clip(rel, 0, None) / 0.16)[..., None]
        col = col * (1 - 0.5 * k) + rose * 0.5 * k
        if up:
            crease = np.exp(-((rel - 0.50) / 0.06) ** 2)
            col = col * (1 - 0.20 * crease[..., None]) + sk * 0.50 * 0.20 * crease[..., None]
            ln = (rel >= -0.003) * np.clip(1.0 - (rel / (0.045 + 0.075 * corner)) ** 3, 0, 1)
            ln = ln * (0.7 + 0.3 * corner)
        else:
            ln = (rel >= -0.003) * (rel < 0.03) * 0.5 * corner
            col = col * (1 - 0.3 * (rel >= -0.003)[..., None] * (rel < 0.02)[..., None]) + np.array([225, 120, 120]) * 0.3 * ((rel >= -0.003) * (rel < 0.02))[..., None]
        ln = np.clip(ln, 0, 1)
        col = col * (1 - ln[..., None]) + np.array(liner, dtype=np.float32) * ln[..., None]
        arr = col
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")
    else:
        sh = np.array(shadow[0], dtype=np.float32)
        deep = np.array(shadow[1], dtype=np.float32)
        lite = np.array(shadow[2], dtype=np.float32)
        a_base = np.clip(1 - rel / 0.70, 0, 1) ** 1.1 * (rel >= 0) * corner
        a_deep = np.exp(-((rel - 0.50) / 0.15) ** 2) * corner
        a_lite = np.exp(-((rel - 0.95) / 0.20) ** 2) * corner
        a1 = np.clip(a_base * 0.62, 0, 1)
        a2 = a_deep * 0.45
        a3 = a_lite * 0.28
        tot = a1 + a2 + a3 + 1e-5
        col = (sh * a1[..., None] + deep * a2[..., None] + lite * a3[..., None]) / tot[..., None]
        alpha = np.clip(tot, 0, 1) * 255 if up else np.zeros((H, W))
        if glitter and up:
            r = np.random.default_rng(3)
            for pu, pv in r.random((glitter * 12, 2)):
                x, y = int(pu * (W - 1)), int(pv * (H - 1))
                if alpha[y, x] > 70:
                    alpha[y, x] = 255
                    col[y, x] = (255, 255, 255)
        arr = np.concatenate([col, alpha[..., None]], axis=-1)
        img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    path = os.path.join(TEXDIR, name)
    img.save(path)
    return path


def makeup_texture(doll, name, glitter=10, strength=1.0):
    """Realistický make-up (překrývá obličej): měkké stínování, jemná lícenka, přirozený lesk rtů, tenká linka s křidélkem."""
    lips, shadow, blush = doll["makeup"]
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sh = tuple(int(c * 255) for c in hex_rgb(shadow))
    bl = tuple(int(c * 255) for c in hex_rgb(blush))
    lp = tuple(int(c * 255) for c in hex_rgb(lips))
    deep = mix(sh, (40, 20, 40), 0.45)
    for s in (-1, 1):
        # stíny nad víčkem (pokračování stínů z víček pod obočí)
        draw_ellipse(img, s * (EYE_X + 0.006), EYE_Z + 0.040, 0.040, 0.010, sh + (70,), 14)
        draw_ellipse(img, s * (EYE_X + 0.016), EYE_Z + 0.031, 0.020, 0.008, deep + (55,), 9)
        draw_ellipse(img, s * (EYE_X - 0.002), EYE_Z + 0.050, 0.030, 0.006, (255, 250, 245, 50), 9)
        # spodní stín (smoky) při vnějším koutku
        draw_ellipse(img, s * (EYE_X + 0.020), EYE_Z - 0.030, 0.024, 0.006, deep + (55,), 7)
        # lícenka: široká, velmi jemná
        draw_ellipse(img, s * 0.063, 1.758, 0.028, 0.019, bl + (74,), 20)
        draw_ellipse(img, s * 0.068, 1.774, 0.022, 0.009, (255, 244, 236, 64), 10)  # highlighter
        # křidélko linky
        x0 = EYE_X + 0.026
        pts = [(s * x0, EYE_Z + 0.0075), (s * (x0 + 0.020), EYE_Z + 0.019), (s * (x0 + 0.021), EYE_Z + 0.0205), (s * (x0 + 0.003), EYE_Z + 0.0045)]
        draw_poly(img, pts, (24, 16, 30, 235), 0.9)
    rnd = random.Random(5)
    d = ImageDraw.Draw(img)
    for _ in range(glitter):
        sgn = rnd.choice((-1, 1))
        x = sgn * (EYE_X + rnd.uniform(-0.01, 0.045))
        z = EYE_Z + rnd.uniform(0.026, 0.046)
        cx, cy = px(x, z)
        d.ellipse([cx - 1.2, cy - 1.2, cx + 1.2, cy + 1.2], fill=(255, 255, 255, 140))
    # rty: sytá barva s tmavším obrysem a lesklým středem
    outline = mix(lp, (60, 10, 30), 0.35)
    draw_poly(img, lip_polygon(1.05), outline + (150,), 1.6)
    draw_poly(img, lip_polygon(0.97), lp + (235,), 1.4)
    gloss = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw_ellipse(gloss, 0.0, MOUTH_Z - 0.0072, 0.011, 0.0030, (255, 255, 255, 150), 3)
    draw_ellipse(gloss, -0.006, MOUTH_Z + 0.0045, 0.006, 0.0018, (255, 255, 255, 70), 2)
    img.alpha_composite(gloss)
    if strength != 1.0:
        arr = np.array(img)
        arr[..., 3] = (arr[..., 3] * strength).astype(np.uint8)
        img = Image.fromarray(arr, "RGBA")
    path = os.path.join(TEXDIR, name)
    img.save(path)
    return path


def skin_body_texture(skin, name="skin_body.jpg"):
    base = np.array(hex_rgb(skin)) * 255
    nz = noise_field(256, 16, 11) * 0.5 + noise_field(256, 4, 12) * 0.5
    arr = base[None, None, :] * (0.96 + 0.08 * nz[..., None])
    path = os.path.join(TEXDIR, name)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path, quality=90)
    return path


def eye_texture(iris, name):
    """Velké oko z animovaného filmu: tmavý limbální kroužek, vlákna duhovky, světlejší spodek, dva odlesky."""
    W, H = 1024, 512
    ic = np.array(hex_rgb(iris)) * 255
    rng = np.random.default_rng(2)
    yy = (np.arange(H)[:, None] + 0.5) / H
    xx = (np.arange(W)[None, :] + 0.5) / W
    rad = yy * 2.0 * np.ones_like(xx)
    beta = xx * 2 * math.pi * np.ones_like(yy)
    sclera = np.array([248, 245, 244], dtype=np.float32)
    img = np.broadcast_to(sclera, (H, W, 3)).astype(np.float32).copy()
    iris_r = 0.455
    mask = smooth(iris_r + 0.012, iris_r - 0.012, rad)
    fib = 0.72 + 0.28 * np.sin(beta * 46 + 3 * np.sin(beta * 5)) * np.sin(beta * 13 + 1.0)
    t = np.clip(rad / iris_r, 0, 1)
    inner = np.array([min(255, c * 1.45 + 30) for c in ic])
    outer = ic * 0.42
    col = inner * (1 - smooth(0.12, 0.85, t))[..., None] + ic * (smooth(0.12, 0.85, t) * (1 - smooth(0.82, 1.0, t)))[..., None] + outer * smooth(0.82, 1.0, t)[..., None]
    col = col * (0.78 + 0.34 * fib)[..., None]
    shade_top = (0.62 + 0.38 * (1 - np.clip(np.sin(beta + math.pi), 0, 1) * smooth(0.0, 0.8, t)))  # horní část duhovky tmavší (stín víčka)
    col = col * shade_top[..., None]
    img = img * (1 - mask[..., None]) + col * mask[..., None]
    pupil = smooth(0.175, 0.15, rad)
    img = img * (1 - pupil[..., None]) + np.array([6, 6, 10]) * pupil[..., None]
    # odlesky: velký vlevo nahoře, malý vpravo dole (úhel β: e1 = vlevo, e2 = dolů)
    X = rad * np.cos(beta)
    Y = rad * np.sin(beta)
    for (cx, cy, r, a) in ((0.22 * math.cos(math.radians(-48)), 0.22 * math.sin(math.radians(-48)), 0.085, 1.0), (0.26 * math.cos(math.radians(140)), 0.26 * math.sin(math.radians(140)), 0.036, 0.85)):
        dd = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
        hl = smooth(r, r * 0.55, dd) * a
        img = img * (1 - hl[..., None]) + 255 * hl[..., None]
    img_pil = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    path = os.path.join(TEXDIR, name)
    img_pil.save(path)  # řádek 0 obrázku = v 1 = přední pól
    return path


# ---------------------------------------------------------------- oči, uši, řasy
def add_blink(o, c, theta):
    """Shape key mrknutí: víčko se otočí kolem vodorovné osy oka přes oční bulvu."""
    o.shape_key_add(name="Basis")
    sk = o.shape_key_add(name="blink")
    P = np.array([tuple(v.co) for v in o.data.vertices]) - np.asarray(c)
    y = P[:, 1] * math.cos(theta) - P[:, 2] * math.sin(theta)
    z = P[:, 1] * math.sin(theta) + P[:, 2] * math.cos(theta)
    Q = np.stack([P[:, 0], y, z], axis=1) + np.asarray(c)
    sk.data.foreach_set("co", Q.reshape(-1).tolist())


def sphere_axis(center, r, n=40, m=28, axis=(0, -1, 0), a0=0.0, a1=math.pi, b0=0.0, b1=2 * math.pi, closed=True, mat=None, name="sph", parent=None, offr=0.0):
    """Kulový pás s pólem ve směru axis (α od pólu, β kolem osy). v = 1 - α/π (přední pól nahoře v textuře)."""
    ax = np.asarray(axis, dtype=float)
    ax /= np.linalg.norm(ax)
    up = np.array([0, 0, 1.0])
    e1 = np.cross(ax, up)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(ax, e1)
    al = np.linspace(max(a0, 0.0001), min(a1, math.pi - 0.0001), m)
    be = np.linspace(b0, b1, n, endpoint=not closed)
    A, Bt = np.meshgrid(al, be, indexing="ij")
    dirs = np.cos(A)[..., None] * ax + np.sin(A)[..., None] * (np.cos(Bt)[..., None] * e1 + np.sin(Bt)[..., None] * e2)
    R = np.asarray(center) + (r + offr) * dirs
    V, F, _ = ring_grid(R, closed, cap0=(np.asarray(center) + (r + offr) * ax) if a0 <= 0.001 else None)
    nb = n if closed else n - 1
    uvs = []
    for f in F:
        wrap = closed and any(vi < m * n and vi % n == 0 for vi in f) and any(vi < m * n and vi % n == n - 1 for vi in f)
        for vi in f:
            if vi >= m * n:
                uvs.append((0.5, 1.0))
            else:
                j, i = divmod(vi, n)
                u = i / nb
                if wrap and i == 0:
                    u = 1.0
                uvs.append((u, 1 - al[j] / math.pi))
    return make_mesh(name, V, F, mat, uvs, parent)


def ellipsoid(center, radii, rot_z=0.0, n=24, m=16, mat=None, name="ell", parent=None):
    th = np.linspace(0, 2 * math.pi, n, endpoint=False)
    ph = np.linspace(-math.pi / 2 + 0.05, math.pi / 2 - 0.05, m)
    TH, PH = np.meshgrid(th, ph)
    x = radii[0] * np.cos(PH) * np.cos(TH)
    y = radii[1] * np.cos(PH) * np.sin(TH)
    z = radii[2] * np.sin(PH)
    c, s = math.cos(rot_z), math.sin(rot_z)
    R = np.stack([c * x - s * y, s * x + c * y, z], axis=-1) + np.asarray(center)
    V, F, UV = ring_grid(R, True, cap0=np.asarray(center) + [0, 0, -radii[2]], cap1=np.asarray(center) + [0, 0, radii[2]])
    return make_mesh(name, V, F, mat, UV, parent)


def head_surface_y(tree, x, z):
    hit = tree.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)), 2.0)
    return hit[0].y if hit[0] is not None else -0.1


def eyelids(parent, c, R, mat_up, mat_dn, offr=0.0, name="lid", lashes=None, blink=True, axis=(0, -1, 0), dn=True):
    """Horní a dolní víčko jako sférické pásy kolem oka; mrknutí je shape key. Řasy se spojí s horním víčkem, aby se zavíraly s ním."""
    lid = R + 0.0016 + offr
    lu = sphere_axis(c, lid, n=34, m=18, a0=LID_UP_A0, a1=1.10, b0=math.pi - 0.28, b1=2 * math.pi + 0.28, closed=False, axis=axis, mat=mat_up, name=name + "_up", parent=parent)
    ld = sphere_axis(c, lid, n=34, m=14, a0=LID_DN_A0, a1=1.10, b0=0.28, b1=math.pi - 0.28, closed=False, axis=axis, mat=mat_dn, name=name + "_dn", parent=parent) if dn else None
    if lashes:
        bpy.ops.object.select_all(action="DESELECT")
        for o in [lu] + lashes:
            o.select_set(True)
        bpy.context.view_layer.objects.active = lu
        bpy.ops.object.join()
        lu = bpy.context.view_layer.objects.active
    if blink:
        add_blink(lu, c, 0.86)
        if ld is not None:
            add_blink(ld, c, -0.64)
    return lu, ld


def eye_axis(s):
    ax = np.array([s * 0.30, -1.0, 0.0])
    return ax / np.linalg.norm(ax)


def make_lashes(c, R, s, mat, parent, count=17):
    """Dlouhé zahnuté řasy z okraje horního víčka; delší a rozevřenější k vnějšímu koutku."""
    ax = eye_axis(s)
    up = np.array([0, 0, 1.0])
    e1 = np.cross(ax, up)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(ax, e1)  # dolů
    out = []
    lid = R + 0.0016
    for k in range(count):
        w = k / (count - 1)  # 0 = vnitřní koutek, 1 = vnější
        be = (2 * math.pi - 0.10) - w * (math.pi - 0.20) if s > 0 else (math.pi + 0.10) + w * (math.pi - 0.20)
        a = LID_UP_A0 + 0.005
        d0 = math.cos(a) * ax + math.sin(a) * (math.cos(be) * e1 + math.sin(be) * e2)
        L = (0.010 + 0.017 * w ** 1.5) * HS * (0.88 + 0.12 * math.sin(math.pi * w))
        base = np.asarray(c) + lid * d0
        sideward = np.array([s * 1.0, 0, 0]) * (0.10 + 0.70 * w)
        tdir = ax * 0.50 + d0 * 0.60 - e2 * 0.45 + sideward
        tdir /= np.linalg.norm(tdir)
        pts = [base + (tdir - e2 * 0.95 * u * u) * L * u for u in np.linspace(0, 1, 6)]
        wd = [0.0015, 0.0014, 0.0012, 0.0009, 0.0005, 0.0001]
        out.append(tube(pts, wd, [0.0005] * 6, n=4, mat=mat, name="lash", parent=parent, cap=False))
    return out


def makeup_lids(parent, doll, mat_name, glitter=0, strength=1.0):
    """Překrývací horní víčka s make-upem (stíny od řasové linky ke záhybu); mrkají spolu s očima."""
    shadow = tuple(int(c * 255) for c in hex_rgb(doll["makeup"][1]))
    deep = mix(shadow, (40, 20, 40), 0.45)
    lite = mix(shadow, (255, 250, 245), 0.65)
    path = lid_texture(doll["skin"], mat_name + ".png", "up", shadow=(shadow, deep, lite), glitter=glitter)
    mat = make_mat(mat_name, "#ffffff", 0.45, tex=path, alpha=1.0)
    for s in (-1, 1):
        c = (s * EYE_X * HS, EYE_INFO["y"] + 0.0200 * HS, EYE_INFO["z"])
        R = EYE_R * HS
        eyelids(parent, c, R, mat, mat, offr=0.0006, name="makeup_lid", dn=False, axis=eye_axis(s))


def build_face_parts(root, doll, mats, tree):
    """Oči (bulbus + rohovka), víčka, řasy a uši. Vrací skupinu uzlů."""
    g = node("face_parts", root)
    for s in (-1, 1):
        ex, ez = s * EYE_X * HS, float(hs((0.0, CY, EYE_Z))[2])
        ys = head_surface_y(tree, ex, ez)
        EYE_INFO.update(y=ys, z=ez)
        R = EYE_R * HS
        c = (ex, ys + 0.0200 * HS, ez)
        sphere_axis(c, R, n=56, m=36, axis=eye_axis(s), mat=mats["eye"], name="eyeball", parent=g)
        sphere_axis(c, R, n=56, m=22, a1=1.0, axis=eye_axis(s), mat=mats["cornea"], name="cornea", parent=g, offr=0.0010)
        lashes = make_lashes(c, R, s, mats["lash"], g)
        eyelids(g, c, R, mats["lid_up"], mats["lid_dn"], lashes=lashes, axis=eye_axis(s))
        ellipsoid(hs((s * (HA - 0.003), 0.012, CZ0 - 0.004)), (0.0078 * HS, 0.016 * HS, 0.025 * HS), rot_z=-s * 0.35, n=20, m=12, mat=mats["skin_body"], name="ear", parent=g)
    return g


# ---------------------------------------------------------------- tělo
TORSO = [
    (0.90, 0.150, 0.094, 0.0), (0.95, 0.158, 0.099, 0.002), (1.00, 0.166, 0.105, 0.004), (1.04, 0.162, 0.104, 0.002), (1.10, 0.140, 0.095, 0.0), (1.17, 0.116, 0.083, -0.002),
    (1.25, 0.122, 0.086, -0.004), (1.33, 0.134, 0.092, -0.006), (1.41, 0.146, 0.100, -0.012), (1.47, 0.155, 0.093, -0.006), (1.52, 0.162, 0.082, 0.0),
    (1.56, 0.140, 0.074, 0.003), (1.595, 0.095, 0.064, 0.006), (1.63, 0.058, 0.054, 0.008), (1.68, 0.047, 0.050, 0.009),
]


def torso_profile(zs):
    return interp_prof(TORSO, zs)  # rx, ry, cy


def torso_bump(x, y, z):
    front = smooth(0.0, -0.05, y)
    bust = 0.030 * gauss((z - 1.405) / 0.042) * gauss((np.abs(x) - 0.062) / 0.040) * front
    glute = 0.020 * gauss((z - 1.0) / 0.06) * gauss((np.abs(x) - 0.07) / 0.05) * smooth(0.0, 0.05, y)
    return np.zeros_like(x), -bust + glute, np.zeros_like(x)


def arm_geo(s):
    sh, el, wr = np.array([s * 0.168, 0.0, 1.505]), np.array([s * 0.225, -0.012, 1.215]), np.array([s * 0.262, -0.02, 0.95])
    path = catmull([sh, sh * 0.5 + el * 0.5, el, el * 0.5 + wr * 0.5, wr], 12)
    t = np.linspace(0, 1, 12)
    rad = np.interp(t, [0, 0.12, 0.35, 0.5, 0.75, 1.0], [0.050, 0.047, 0.040, 0.034, 0.031, 0.022])
    return path, rad


def leg_geo(s):
    hip, kn, an = np.array([s * 0.083, 0.004, 1.06]), np.array([s * 0.080, -0.004, 0.535]), np.array([s * 0.070, 0.012, 0.088])
    path = catmull([hip, hip * 0.5 + kn * 0.5, kn, kn * 0.55 + an * 0.45 + np.array([0, 0.012, 0]), an], 16)
    t = np.linspace(0, 1, 16)
    wid = np.interp(t, [0, 0.2, 0.45, 0.52, 0.62, 0.8, 1.0], [0.098, 0.088, 0.068, 0.054, 0.056, 0.041, 0.031])
    thk = np.interp(t, [0, 0.2, 0.45, 0.52, 0.62, 0.8, 1.0], [0.094, 0.084, 0.066, 0.056, 0.062, 0.042, 0.032])
    return path, wid, thk


def foot_geo(s):
    pts = np.array([[s * 0.070, 0.050, 0.060], [s * 0.071, 0.004, 0.050], [s * 0.073, -0.07, 0.036], [s * 0.075, -0.14, 0.026], [s * 0.076, -0.196, 0.017]])
    return pts, np.array([0.052, 0.046, 0.034, 0.025, 0.016]), np.array([0.034, 0.040, 0.042, 0.040, 0.030])


def build_body(root, doll, mats):
    g = node("body", root)
    zs = np.linspace(0.90, 1.68, 46)
    rx, ry, cy = torso_profile(zs).T
    loft_profile(zs, rx, ry, None, cy, n=48, mat=mats["skin_body"], name="torso", parent=g, bump=torso_bump)
    # ruce
    for s in (-1, 1):
        sh, el, wr = np.array([s * 0.168, 0.0, 1.505]), np.array([s * 0.225, -0.012, 1.215]), np.array([s * 0.262, -0.02, 0.95])
        path = catmull([sh, sh * 0.5 + el * 0.5, el, el * 0.5 + wr * 0.5, wr], 12)
        t = np.linspace(0, 1, 12)
        rad = np.interp(t, [0, 0.12, 0.35, 0.5, 0.75, 1.0], [0.050, 0.047, 0.040, 0.034, 0.031, 0.022])
        tube(path, rad, rad * 0.93, n=18, mat=mats["skin_body"], name="arm", parent=g, cap=True)
        ellipsoid(sh + np.array([s * 0.004, 0, 0.0]), (0.054, 0.05, 0.056), n=20, m=14, mat=mats["skin_body"], name="deltoid", parent=g)
        # dlaň a prsty: visí dolů, dlaň k tělu
        d = np.array([-s * 0.10, 0.0, -1.0])
        d /= np.linalg.norm(d)
        inward = np.array([-s, 0, 0.0])
        front = np.array([0, -1.0, 0])
        palm_pts = [wr - d * 0.01, wr + d * 0.035, wr + d * 0.078]
        tube(palm_pts, [0.027, 0.03, 0.028], [0.0115, 0.0125, 0.011], n=14, mat=mats["skin_body"], name="palm", parent=g, cap=True)
        # tube() má šířku podél N (rámce) — pro dlaň je důležitá orientace, proto přidáme zploštění prsty níž
        for fi, (yo, lens, rr) in enumerate([(0.0125, (0.034, 0.022, 0.019), 0.0082), (0.0045, (0.038, 0.025, 0.02), 0.0086), (-0.0045, (0.035, 0.024, 0.019), 0.0082), (-0.0125, (0.029, 0.018, 0.015), 0.0068)]):
            p = wr + d * 0.08 + front * (-yo) * 1.0
            pts = [p]
            ang = 0.0
            cur = p.copy()
            dd = d.copy()
            for li, L in enumerate(lens):
                ang += (0.16, 0.34, 0.5)[li]
                dd = (d * math.cos(ang) + inward * math.sin(ang))
                cur = cur + dd * L
                pts.append(cur)
            tube(pts, [rr, rr * 0.95, rr * 0.88, rr * 0.7], [rr * 0.95, rr * 0.9, rr * 0.84, rr * 0.68], n=8, mat=mats["skin_body"], name="finger", parent=g, cap=True)
        p = wr + d * 0.025 + front * 0.017 + inward * 0.004
        tdir = (d * 0.7 + front * 0.55 + inward * 0.25)
        tdir /= np.linalg.norm(tdir)
        tp = [p, p + tdir * 0.022, p + tdir * 0.044 + inward * 0.004, p + tdir * 0.062 + inward * 0.01]
        tube(tp, [0.0105, 0.0095, 0.0085, 0.007], [0.0105, 0.0095, 0.0085, 0.007], n=8, mat=mats["skin_body"], name="thumb", parent=g, cap=True)
    # nohy
    for s in (-1, 1):
        hip, kn, an = np.array([s * 0.083, 0.004, 1.06]), np.array([s * 0.080, -0.004, 0.535]), np.array([s * 0.070, 0.012, 0.088])
        path = catmull([hip, hip * 0.5 + kn * 0.5, kn, kn * 0.55 + an * 0.45 + np.array([0, 0.012, 0]), an], 16)
        t = np.linspace(0, 1, 16)
        wid = np.interp(t, [0, 0.2, 0.45, 0.52, 0.62, 0.8, 1.0], [0.098, 0.088, 0.068, 0.054, 0.056, 0.041, 0.031])
        thk = np.interp(t, [0, 0.2, 0.45, 0.52, 0.62, 0.8, 1.0], [0.094, 0.084, 0.066, 0.056, 0.062, 0.042, 0.032])
        tube(path, wid, thk, n=24, mat=mats["skin_body"], name="leg", parent=g, cap=True)
        fp = [np.array([s * 0.070, 0.050, 0.060]), np.array([s * 0.071, 0.004, 0.050]), np.array([s * 0.073, -0.07, 0.036]), np.array([s * 0.075, -0.14, 0.026]), np.array([s * 0.076, -0.196, 0.017])]
        tube(fp, [0.052, 0.046, 0.034, 0.025, 0.016], [0.034, 0.040, 0.042, 0.040, 0.030], n=14, mat=mats["skin_body"], name="foot", parent=g, cap=True)
    # krk spojí hlavu s trupem
    neck = [np.array([0, 0.008, 1.58]), np.array([0, 0.010, 1.64]), np.array([0, 0.012, 1.70]), np.array([0, 0.016, 1.77])]
    tube(neck, [0.050, 0.044, 0.040, 0.040], [0.050, 0.044, 0.041, 0.041], n=20, mat=mats["skin_body"], name="neck", parent=g, cap=True)
    return g


def build_head(root, doll, mats):
    g = node("head", root)
    head = head_mesh("head_skin", mats["skin_face"], g)
    tree = bvh_of([head])
    return g, head, tree
