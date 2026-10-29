"""Tělo, hlava (s morph targety nálad), oči, řasy a ruce realistické panenky. Viz panenky_lib.py pro konvence."""
import math
import random

from panenky_lib import *  # noqa: F401,F403

CZ0, CY = 1.82, 0.005  # střed hlavy v lokálním (nezvětšeném) souřadnicovém systému
DZ = 0.075  # posun zvětšené hlavy nahoru, aby brada zůstala nad krkem
CZ = CZ0 + DZ  # střed hlavy ve výsledné scéně
HA, HB, HC = 0.098, 0.113, 0.134  # poloosy lebky
EYE_X, EYE_Z = 0.041, 1.824
BROW_Z = 1.874
EYE_R = 0.0262
MOUTH_Z, MOUTH_HW = 1.738, 0.022
HS = 1.42  # zvětšení hlavy kolem jejího středu (styl animovaného filmu)
HR = HS / 1.14  # poměr vůči původním pevným rozměrům pokrývek hlavy
EYE_INFO = {}
S = 1024  # textura obličeje
TEXW = 0.28


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
    sx = 1 - 0.22 * t ** 1.3 + 0.05 * gauss((dz + 0.1) / 0.35)
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
    # čelo a lícní kosti
    d -= 0.010 * gauss((fz - 1.765) / 0.036) * gauss((np.abs(fx) - 0.058) / 0.034)
    # oční důlky
    for s in (-1, 1):
        r = np.sqrt((fx - s * EYE_X) ** 2 + (fz - EYE_Z) ** 2)
        d += 0.0085 * gauss(r / 0.036)
    d -= 0.004 * gauss((fz - BROW_Z) / 0.012) * gauss((np.abs(fx) - 0.045) / 0.035)  # obočí
    # nos
    hz = 0.55 * np.interp(fz, [1.70, 1.76, 1.775, 1.788, 1.80, 1.82, 1.84, 1.86], [0, 0.004, 0.015, 0.027, 0.023, 0.015, 0.008, 0.001])
    wz = np.interp(fz, [1.77, 1.79, 1.82, 1.85], [0.020, 0.016, 0.010, 0.013])
    d -= hz * gauss(fx / wz)
    for s in (-1, 1):
        d -= 0.005 * gauss(np.sqrt((fx - s * 0.013) ** 2 + (fz - 1.775) ** 2) / 0.0075)
    # rty
    d -= 0.0050 * gauss((fz - 1.7445) / 0.0055) * gauss(fx / 0.020)  # horní ret
    d -= 0.0060 * gauss((fz - 1.731) / 0.0065) * gauss(fx / 0.018)  # dolní ret
    d += 0.0025 * gauss((fz - 1.7378) / 0.0016) * gauss(fx / 0.026)  # linie úst
    d -= 0.004 * gauss((fz - 1.685) / 0.014) * gauss(fx / 0.02)  # brada
    d += 0.0015 * gauss((fz - 1.752) / 0.004) * gauss(fx / 0.006)  # důlek nad rtem
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


def head_mesh(name, mat, parent, off=0.0, n=80, m=60, moods=("happy", "sad")):
    th = math.pi + np.arange(n) * 2 * math.pi / n
    ph = np.linspace(-math.pi / 2 + 0.035, math.pi / 2 - 0.035, m)
    TH, PH = np.meshgrid(th, ph)
    R = head_points(TH, PH, off)
    cap0 = head_points(np.array([0.0]), np.array([-math.pi / 2]), off)[0]
    cap1 = head_points(np.array([0.0]), np.array([math.pi / 2]), off)[0]
    V, F, _ = ring_grid(R, True, cap0=cap0, cap1=cap1)
    # frontální UV (obličej se mapuje jako z fotky zepředu)
    uv = np.stack([0.5 + V[:, 0] / TEXW, 0.5 + (V[:, 2] - CZ0) / TEXW], axis=1)
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


def px(x, z):
    return (0.5 + x / TEXW) * S, (1 - (0.5 + (z - CZ0) / TEXW)) * S


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


def brow_poly(s, thick=1.0):
    ts = np.linspace(0, 1, 14)
    xs = s * (0.016 + ts * 0.062)
    zs = BROW_Z + 0.013 * np.sin(ts * math.pi * 0.85) - 0.012 * ts ** 2
    th = (0.0058 - 0.0040 * ts) * thick
    top = [(x, z + t) for x, z, t in zip(xs, zs, th)]
    bot = [(x, z - t) for x, z, t in zip(xs[::-1], zs[::-1], th[::-1])]
    return top + bot


def skin_face_texture(skin, hair, name):
    rng = np.random.default_rng(7)
    base = np.array(hex_rgb(skin)) * 255
    nz = noise_field(S, 24, 3) * 0.6 + noise_field(S, 6, 4) * 0.4
    arr = base[None, None, :] * (0.995 + 0.01 * nz[..., None])
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")
    sk = np.array(hex_rgb(skin))
    warm = tuple(int(c) for c in np.clip(sk * 255 * np.array([1.0, 0.72, 0.72]), 0, 255))
    # tváře, špička nosu, kruhy pod očima
    draw_ellipse(img, 0.060, 1.765, 0.030, 0.020, warm + (150,), 12)
    draw_ellipse(img, -0.060, 1.765, 0.030, 0.020, warm + (150,), 12)
    draw_ellipse(img, 0.0, 1.778, 0.010, 0.008, warm + (110,), 5)
    dark = tuple(int(c) for c in np.clip(sk * 255 * 0.82, 0, 255))
    for s in (-1, 1):
        draw_ellipse(img, s * EYE_X, EYE_Z - 0.0245, 0.028, 0.006, dark + (60,), 6)
        draw_ellipse(img, s * EYE_X, EYE_Z + 0.022, 0.030, 0.005, dark + (80,), 5)  # řasová linie / záhyb víčka
    lip = tuple(int(c) for c in np.clip(sk * 255 * np.array([1.0, 0.55, 0.58]) + np.array([10, 0, 5]), 0, 255))
    draw_poly(img, lip_polygon(), lip + (235,), 2)
    ln = tuple(int(c) for c in np.clip(sk * 255 * 0.55, 0, 255))
    draw_poly(img, [(x, MOUTH_Z + 0.0004) for x in np.linspace(-MOUTH_HW, MOUTH_HW, 20)] + [(x, MOUTH_Z - 0.0006) for x in np.linspace(MOUTH_HW, -MOUTH_HW, 20)], ln + (210,), 1.2)
    hc = tuple(int(c * 255 * 0.8) for c in hex_rgb(hair))
    for s in (-1, 1):
        draw_poly(img, brow_poly(s), hc + (225,), 1.8)
    path = os.path.join(TEXDIR, name)
    img.convert("RGB").save(path, quality=92)
    return path


def makeup_texture(doll, name):
    lips, shadow, blush = doll["makeup"]
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sh = tuple(int(c * 255) for c in hex_rgb(shadow))
    bl = tuple(int(c * 255) for c in hex_rgb(blush))
    lp = tuple(int(c * 255) for c in hex_rgb(lips))
    for s in (-1, 1):
        draw_ellipse(img, s * (EYE_X + 0.002), EYE_Z + 0.018, 0.034, 0.014, sh + (165,), 5)
        draw_ellipse(img, s * (EYE_X + 0.020), EYE_Z + 0.014, 0.016, 0.010, tuple(int(c * 0.65) for c in sh) + (120,), 4)
        draw_ellipse(img, s * 0.064, 1.762, 0.028, 0.018, bl + (150,), 11)
        # oční linka s křidélkem
        xs = np.linspace(-0.027, 0.031, 16)
        line = [(s * (EYE_X + x), EYE_Z + 0.0125 + 0.006 * (1 - ((x - 0.002) / 0.029) ** 2) + max(0, x - 0.023) * 0.9) for x in xs]
        poly = [(x, z + 0.0014) for x, z in line] + [(x, z - 0.0009) for x, z in line[::-1]]
        draw_poly(img, poly, (25, 18, 35, 235), 1.0)
    rnd = random.Random(5)
    d = ImageDraw.Draw(img)
    for _ in range(10):
        sgn = rnd.choice((-1, 1))
        x = sgn * (EYE_X + rnd.uniform(-0.028, 0.036))
        z = EYE_Z + rnd.uniform(0.008, 0.034)
        cx, cy = px(x, z)
        d.ellipse([cx - 1.0, cy - 1.0, cx + 1.0, cy + 1.0], fill=(255, 255, 255, 150))
    draw_poly(img, lip_polygon(1.02), lp + (245,), 1.6)
    hl = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw_ellipse(hl, 0.0, MOUTH_Z - 0.0075, 0.012, 0.0022, (255, 255, 255, 120), 3)
    img.alpha_composite(hl)
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
    W, H = 512, 256
    img = np.zeros((H, W, 3), dtype=np.float32)
    ic = np.array(hex_rgb(iris)) * 255
    rng = np.random.default_rng(2)
    yy = np.arange(H)[:, None] / H  # 0 = přední pól
    xx = np.arange(W)[None, :] / W
    sclera = np.array([246, 244, 244], dtype=np.float32)
    img[:] = sclera
    rad = yy * 2.0  # 0..1 až do rovníku
    streak = 0.75 + 0.25 * np.sin(xx * 2 * math.pi * 38 + rng.random() * 6) * np.sin(xx * 2 * math.pi * 11)
    iris_mask = (rad < 0.50).astype(np.float32)
    ring = smooth(0.42, 0.51, rad)
    col = ic[None, None, :] * (0.55 + 0.6 * streak[..., None]) * (1 - 0.65 * ring[..., None]) * (0.7 + 0.5 * smooth(0.05, 0.2, rad)[..., None] * 0.6)
    pupil = (rad < 0.20).astype(np.float32)
    img = img * (1 - iris_mask[..., None]) + col * iris_mask[..., None]
    img = img * (1 - pupil[..., None]) + 8 * pupil[..., None]
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
        for vi in f:
            if vi >= m * n:
                uvs.append((0.5, 1.0))
            else:
                j, i = divmod(vi, n)
                uvs.append((i / nb, 1 - al[j] / math.pi))
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


def build_face_parts(root, doll, mats, tree):
    """Oči (bulbus + rohovka), víčka, řasy a uši. Vrací skupinu uzlů."""
    g = node("face_parts", root)
    for s in (-1, 1):
        ex, ez = s * EYE_X * HS, float(hs((0.0, CY, EYE_Z))[2])
        ys = head_surface_y(tree, ex, ez)
        EYE_INFO.update(y=ys, z=ez)
        R = EYE_R * HS
        c = (ex, ys + 0.0105 * HS, ez)
        sphere_axis(c, R, n=44, m=30, mat=mats["eye"], name="eyeball", parent=g)
        sphere_axis(c, R, n=44, m=18, a1=1.2, mat=mats["cornea"], name="cornea", parent=g, offr=0.0009)
        lid = R + 0.0014
        lu = sphere_axis(c, lid, n=26, m=14, a0=0.42, a1=1.62, b0=math.pi + 0.10, b1=2 * math.pi - 0.10, closed=False, mat=mats["lid"], name="lid_up", parent=g)
        ld = sphere_axis(c, lid, n=26, m=14, a0=0.62, a1=1.62, b0=0.16, b1=math.pi - 0.16, closed=False, mat=mats["lid"], name="lid_dn", parent=g)
        add_blink(lu, c, 0.74)
        add_blink(ld, c, -0.22)
        # řasy: štíhlé zahnuté proužky podél horního víčka (jen z horní poloviny)
        ax = np.array([0, -1.0, 0])
        e1 = np.array([1.0, 0, 0])
        e2 = np.array([0, 0, 1.0])
        for k in range(9):
            b = 0.35 + k * (math.pi - 0.7) / 8
            a = 0.43
            d0 = math.cos(a) * ax + math.sin(a) * (math.cos(b) * e1 + math.sin(b) * e2)
            outer = s * math.cos(b) > 0.2  # vnější okraj oka: delší řasy
            L = (0.0105 if outer else 0.0075) * HS * 1.35 * (0.75 + 0.25 * math.sin(b))
            base = np.asarray(c) + lid * d0
            tdir = ax * 0.6 + d0 * 0.55 + e2 * 0.15
            pts = [base + (tdir + e2 * 0.55 * u * u) * L * u for u in np.linspace(0, 1, 5)]
            tube(pts, [0.0011, 0.0010, 0.0008, 0.0005, 0.0001], [0.0004] * 5, n=4, mat=mats["lash"], name="lash", parent=g, cap=False)
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
    neck = [np.array([0, 0.008, 1.58]), np.array([0, 0.010, 1.64]), np.array([0, 0.010, 1.70])]
    tube(neck, [0.050, 0.047, 0.045], [0.050, 0.047, 0.045], n=20, mat=mats["skin_body"], name="neck", parent=g, cap=True)
    return g


def build_head(root, doll, mats):
    g = node("head", root)
    head = head_mesh("head_skin", mats["skin_face"], g)
    tree = bvh_of([head])
    return g, head, tree
