"""Oblečení realistické panenky: textury látek, střihy podle těla (výstřihy, záhyby, švy), boty, doplňky a pokrývky hlavy."""
from panenky_hair import *  # noqa: F401,F403


# ---------------------------------------------------------------- textury látek
def tex_net(name="net.png"):
    S2 = 256
    img = Image.new("RGBA", (S2, S2), (255, 255, 255, 40))
    d = ImageDraw.Draw(img)
    step = 32
    for r in range(-2, S2 // step + 2):
        for c in range(-2, S2 // step + 2):
            cx = c * step + (step // 2 if r % 2 else 0)
            cy = r * step * 0.87
            pts = [(cx + step * 0.5 * math.cos(math.radians(60 * k + 30)), cy + step * 0.5 * math.sin(math.radians(60 * k + 30))) for k in range(6)]
            d.line(pts + [pts[0]], fill=(255, 255, 255, 200), width=2)
    path = os.path.join(TEXDIR, name)
    img.save(path)
    return path


def nrm_weave(name="weave_n.png", scale=1.0):
    S2 = 256
    y, x = np.mgrid[0:S2, 0:S2] / S2
    h = np.sin(x * 2 * math.pi * 24) * 0.5 + np.sin(y * 2 * math.pi * 24) * 0.5
    return save_png(normal_from_height(h * 1.0, 0.3 * scale), name)


def nrm_ribs(name="ribs_n.png"):
    S2 = 256
    y, x = np.mgrid[0:S2, 0:S2] / S2
    h = np.sin(x * 2 * math.pi * 12) * 0.9 + 0.1 * np.sin(y * 2 * math.pi * 3)
    return save_png(normal_from_height(h, 0.7), name)


def nrm_leather(name="leather_n.png"):
    h = noise_field(256, 3, 5) * 0.6 + noise_field(256, 8, 6) * 0.4
    return save_png(normal_from_height(h, 0.9), name)


def nrm_quilt(name="quilt_n.png"):
    S2 = 256
    y, x = np.mgrid[0:S2, 0:S2] / S2
    h = -np.abs(np.sin((x + y) * math.pi * 6)) * np.abs(np.sin((x - y) * math.pi * 6)) * 1.0
    return save_png(normal_from_height(-h, 2.5), name)


def tex_plaid(c1, c2, name):
    S2 = 512
    a = np.array(hex_rgb(c1)) * 255
    b = np.array(hex_rgb(c2)) * 255
    t = np.arange(S2) / S2
    band = (0.5 + 0.5 * np.sin(t * 2 * math.pi * 4)) ** 2
    thin = np.exp(-(((t * 8) % 1 - 0.5) / 0.05) ** 2)
    w = np.clip(band[None, :] * 0.6 + band[:, None] * 0.6, 0, 1)
    img = a[None, None, :] * (1 - w[..., None]) + b[None, None, :] * w[..., None]
    line = np.maximum(thin[None, :], thin[:, None])
    img = img * (1 - 0.5 * line[..., None]) + np.array([245, 245, 245]) * 0.5 * line[..., None] * 0.6
    return save_png(img, name)


def tex_check(c1, c2, name):
    S2 = 256
    y, x = np.mgrid[0:S2, 0:S2]
    m = ((x // 32 + y // 32) % 2).astype(np.float32)
    a, b = np.array(hex_rgb(c1)) * 255, np.array(hex_rgb(c2)) * 255
    return save_png(a[None, None, :] * (1 - m[..., None]) + b[None, None, :] * m[..., None], name)


# ---------------------------------------------------------------- střihy podle trupu
def torso_rows(zs, off, n=144, sy=1.0):
    rx, ry, cy = torso_profile(zs).T
    rows = []
    for j, z in enumerate(zs):
        ring = elliptic_ring(0.0, cy[j], z, rx[j] + off, (ry[j] + off) * sy, n)
        d = torso_bump(ring[:, 0], ring[:, 1], ring[:, 2])
        ring = ring + np.stack(d, axis=-1)
        rows.append(ring)
    return np.array(rows)


def edge_points(R, keep):
    """Horní hrana ořezaného pláště: pro každý sloupec nejvyšší ponechaná plocha."""
    m, n, _ = R.shape
    pts = []
    for i in range(n):
        i2 = (i + 1) % n
        top = None
        for j in range(m - 1):
            ctr = (R[j, i] + R[j, i2] + R[j + 1, i2] + R[j + 1, i]) / 4
            if keep(ctr):
                top = j + 1
        pts.append(R[top if top is not None else m - 1, i])
    return np.array(pts)


def closed_tube(g, pts, r, mat, n=6, name="trim"):
    pts = np.vstack([pts, pts[:1]])
    return tube(pts, r, r, n=n, mat=mat, name=name, parent=g, cap=False)


def folds(R, k, amp, phase=0.0, power=1.0, center=(0.0, 0.0), t_from=0.0):
    """Radiální záhyby sukně: poloměr v rovině xy se mění sinem; amplituda roste směrem k lemu."""
    m, n, _ = R.shape
    out = R.copy()
    ang = np.arctan2(R[..., 1] - center[1], R[..., 0] - center[0])
    for j in range(m):
        t = j / (m - 1)
        a = amp * smooth(t_from, 1.0, t) ** power
        f = 1 + a * np.sin(k * ang[j] + phase + 0.6 * np.sin(2.3 * ang[j] + j * 0.2))
        out[j, :, 0] = center[0] + (R[j, :, 0] - center[0]) * f
        out[j, :, 1] = center[1] + (R[j, :, 1] - center[1]) * f
    return out


def pearls(g, pts, r, mat, name="pearl", n=8, m=6):
    for p in pts:
        ellipsoid(p, (r, r, r), n=n, m=m, mat=mat, name=name, parent=g)


def bow(g, c, size, mat, knot_mat=None, tilt=0.0, facing=(0, 1.0, 0)):
    """Mašle: dvě smyčky, uzel a stuhy; facing = směr ven od těla."""
    f = np.asarray(facing, dtype=float)
    f /= np.linalg.norm(f)
    side = np.array([f[1] * -1, f[0], 0.0]) if abs(f[2]) < 0.9 else np.array([1.0, 0, 0])
    side /= np.linalg.norm(side)
    up = np.array([0, 0, 1.0])
    for sg in (-1, 1):
        p = c + side * sg * size * 1.0 + f * size * 0.1
        ellipsoid(p, (size * 0.95, size * 0.28, size * 0.62), rot_z=math.atan2(f[1], f[0]) + math.pi / 2 + sg * 0.15 * 0, n=18, m=10, mat=mat, name="bow_loop", parent=g)
    ellipsoid(c + f * size * 0.15, (size * 0.32, size * 0.3, size * 0.32), n=14, m=8, mat=knot_mat or mat, name="bow_knot", parent=g)
    for sg in (-1, 1):
        pts = [c + f * size * 0.1, c + f * size * 0.25 + side * sg * size * 0.35 - up * size * 0.9, c + f * size * 0.35 + side * sg * size * 0.55 - up * size * 1.9]
        tube(pts, [size * 0.28, size * 0.30, size * 0.26], [size * 0.07] * 3, n=8, mat=mat, name="bow_tail", parent=g, cap=True)


# ---------------------------------------------------------------- princezna
# čtyři střihy šatů princezny: bálový, koktejlové, večerní s mořskou vílou a letní
OUTFIT_SPECS = [
    dict(hem=0.115, R=(0.60, 0.538), flare=0.88, tulle=True, sleeves="puff", neck="heart", bow=True, pearls=True, folds=(17, 0.052)),
    dict(hem=0.60, R=(0.36, 0.33), flare=0.9, tulle=True, sleeves="puff", neck="round", bow=True, pearls=True, folds=(15, 0.06)),
    dict(hem=0.13, R=(0.27, 0.24), flare=1.9, tulle=False, sleeves="none", neck="heart", bow=False, pearls=True, folds=(11, 0.035)),
    dict(hem=0.50, R=(0.31, 0.285), flare=0.85, tulle=False, sleeves="none", neck="straps", bow=True, pearls=False, folds=(13, 0.05)),
]


def princess_outfit(root, d, M, name=None, spec=None):
    spec = spec or OUTFIT_SPECS[0]
    g = node(name or "slot_outfit", root)
    a, b, tul = M["outfit_a"], M["outfit_b"], M["tulle"]
    # korzet s výstřihem
    zs = np.linspace(1.14, 1.50, 72)
    R = torso_rows(zs, 0.006)

    def zcut(x, y):
        front = y < 0.0
        if spec["neck"] == "heart":
            fz = 1.445 - 0.030 * gauss(x / 0.05) + 0.020 * (np.abs(x) / 0.14) ** 2
        elif spec["neck"] == "round":
            fz = 1.470 - 0.045 * gauss(x / 0.075)
        else:
            fz = 1.455 - 0.035 * gauss(x / 0.07)
        return np.where(front, fz, 1.455)

    keep = lambda c: c[2] < zcut(c[0], c[1])
    ring_mesh(R, True, keep, (0.12, 0.12), "bodice", a, g)
    edge = edge_points(R, keep)
    closed_tube(g, edge + np.array([0, 0, 0.002]), 0.0042, b, name="neckline_trim")
    if spec["pearls"]:
        pearls(g, edge[::3] + np.array([0, -0.002, 0.004]), 0.0042, M["pearl"], n=6, m=4)
    if spec["neck"] == "straps":
        for s in (-1, 1):
            tube(strap_path(s * 0.075, 1.46, 1.44, 0.008), 0.0085, 0.003, n=8, mat=b, name="strap", parent=g, cap=True, n0=np.array([1.0, 0, 0]))
    ring_mesh(torso_rows(np.linspace(1.15, 1.215, 6), 0.013), True, None, (0.1, 0.1), "sash", b, g)
    # sukně: zvon se záhyby a vlnkami na lemu
    hem = spec["hem"]
    R0, R1 = spec["R"]
    k_f, a_f = spec["folds"]
    mrows = 44
    zs3 = np.linspace(1.17, hem, mrows)
    t = (1.17 - zs3) / (1.17 - hem)
    rx = 0.138 + (R0 - 0.138) * t ** spec["flare"]
    ry = 0.112 + (R1 - 0.112) * t ** spec["flare"]
    # sukně nesmí zajet do nohou (úzké střihy): dolní mez podle obrysu boků a nohou
    rx = np.maximum(rx, np.interp(zs3, [0.0, 0.09, 0.535, 0.80, 1.0, 1.06, 1.17], [0.10, 0.105, 0.14, 0.165, 0.18, 0.19, 0.16]) + 0.016)
    ry = np.maximum(ry, np.interp(zs3, [0.09, 0.535, 1.0, 1.17], [0.06, 0.078, 0.108, 0.108]) + 0.014)
    rows = np.array([ring_path((0, 0.002), rx[j], ry[j], zs3[j], 120) for j in range(mrows)])
    rows = folds(rows, k_f, a_f, 0.4, 1.1, (0, 0.002), 0.12)
    ang = np.arctan2(rows[..., 1], rows[..., 0])
    rows[:, :, 2] += 0.012 * np.cos(2 * k_f * ang) * smooth(0.82, 1.0, t)[:, None]
    ring_mesh(rows, True, None, (0.12, 0.12), "skirt", a, g)
    if spec["tulle"]:
        zs4 = np.linspace(1.15, hem + 0.05, 40)
        t4 = (1.15 - zs4) / (1.15 - hem - 0.05)
        rx4 = 0.148 + (R0 * 1.08 - 0.148) * t4 ** (spec["flare"] + 0.02)
        ry4 = 0.122 + (R1 * 1.08 - 0.122) * t4 ** (spec["flare"] + 0.02)
        rows4 = np.array([ring_path((0, 0.002), rx4[j], ry4[j], zs4[j], 120) for j in range(40)])
        rows4 = folds(rows4, 29, 0.030, 1.3, 1.2, (0, 0.002), 0.1)
        ring_mesh(rows4, True, None, (0.12, 0.12), "tulle", tul, g)
    # lem
    hr = ring_path((0, 0.002), R0, R1, hem + 0.013, 90)
    hr = folds(np.array([hr, hr]), k_f, a_f, 0.4, 1.1, (0, 0.002), 0.0)[0]
    ang = np.arctan2(hr[:, 1], hr[:, 0])
    hr[:, 2] += 0.012 * np.cos(2 * k_f * ang)
    closed_tube(g, hr, 0.011, b, 8, "hem_trim")
    if spec["pearls"]:
        pearls(g, hr[::2], 0.0095, M["pearl"], n=8, m=6)
    if spec["sleeves"] == "puff":
        for s in (-1, 1):
            ellipsoid((s * 0.172, 0.0, 1.50), (0.066, 0.060, 0.050), rot_z=0, n=22, m=14, mat=a, name="puff", parent=g)
            ellipsoid((s * 0.178, 0.0, 1.47), (0.060, 0.056, 0.034), n=22, m=12, mat=b, name="puff_trim", parent=g)
    if spec["bow"]:
        bow(g, np.array([0.0, 0.118, 1.185]), 0.050, b, facing=(0, 1.0, 0))
    return g


def foot_shell(g, s, kind, mats):
    """Botička nad tvarem chodidla (boty sedí na noze) — výška, ořez a podrážka podle druhu."""
    pts, vr, hr = foot_geo(s)
    a, b = mats["shoes_a"], mats["shoes_b"]
    off = {"flat": 0.0035, "sneaker": 0.006, "boots": 0.0055, "ballet": 0.0025, "clog": 0.0085, "moon": 0.010}[kind]
    # bota je trubice po cestě chodidla se zvětšeným průřezem; nahoře pokračuje na kotník / holeň
    ext = {"flat": 0.0, "sneaker": 0.04, "boots": 0.20, "ballet": 0.025, "clog": 0.045, "moon": 0.30}[kind]
    p0 = pts.copy()
    ankle_top = np.array([s * 0.070, 0.012, 0.088 + ext])
    path = np.vstack([ankle_top + np.array([0, 0.004, 0.0]), pts[0] + np.array([0, 0.008, 0.012]), pts[1], pts[2], pts[3], pts[4] + np.array([0, -0.004, 0])])
    # průřezy: [svislý poloměr, vodorovný poloměr] — vyšší kotník nahoře užší
    k0 = 0.031 + off if ext > 0 else 0.0
    vrad = np.array([0.034 + off, 0.056 + off, 0.050 + off, 0.038 + off, 0.030 + off, 0.022 + off])
    hrad = np.array([0.034 + off, 0.036 + off, 0.043 + off, 0.045 + off, 0.043 + off, 0.034 + off])
    if ext > 0:
        vrad[0] = hrad[0] = 0.0345 + off if kind != "moon" else 0.052
    ycent = path[:, 1]
    # střed průřezu ve svislém směru posuneme, aby spodek ležel těsně nad podlahou
    ctr = path.copy()
    ctr[1:, 2] = np.maximum(ctr[1:, 2], vrad[1:] * 0.9 + 0.003)
    if kind in ("flat", "ballet"):
        cut = lambda c: (c[2] > 0.052 and -0.115 < c[1] < 0.018 and abs(c[0] - s * 0.073) < 0.07)
        keep = lambda c: not cut(c)
    else:
        keep = None
    T, N, B = frames(ctr, n0=np.array([0, 0, 1.0]))
    n_ring = 22
    rings = []
    for i in range(len(ctr)):
        t = np.arange(n_ring) * 2 * math.pi / n_ring
        rings.append(ctr[i] + N[i] * (vrad[i] * np.cos(t))[:, None] + B[i] * (hrad[i] * np.sin(t))[:, None])
    ring_mesh(np.array(rings), True, keep, (0.1, 0.1), "shoe", a, g)
    if ext >= 0.1:
        lp, lw, lt = leg_geo(s)
        idx = [i for i in range(len(lp)) if lp[i][2] <= 0.088 + ext + 0.02]
        i0 = idx[0]
        tube(lp[i0:], lw[i0:] + off + 0.003, lt[i0:] + off + 0.003, n=28, mat=a, name="shaft", parent=g, cap=True, uscale=2.0)
    # podrážka: zploštělá trubice při zemi
    sole_path = np.array([[s * 0.071, 0.058, 0.006], [s * 0.072, 0.0, 0.006], [s * 0.074, -0.08, 0.006], [s * 0.076, -0.15, 0.006], [s * 0.076, -0.205, 0.006]])
    solew = {"flat": 0.004, "sneaker": 0.013, "boots": 0.016, "ballet": 0.003, "clog": 0.018, "moon": 0.022}[kind]
    soleh = hrad[1:5].mean() + 0.003
    sp = np.array([[s * 0.071, 0.060, solew], [s * 0.071, 0.0, solew], [s * 0.073, -0.08, solew], [s * 0.075, -0.15, solew], [s * 0.076, -0.208, solew]])
    tube(sp, solew, [0.040 + off, 0.046 + off, 0.048 + off, 0.046 + off, 0.034 + off], n=18, mat=b, name="sole", parent=g, cap=True, n0=np.array([0, 0, 1.0]), power=2.5)
    return dict(ctr=ctr, vrad=vrad, hrad=hrad, off=off)


def princess_shoes(root, d, M, name=None):
    g = node(name or "slot_shoes", root)
    for s in (-1, 1):
        foot_shell(g, s, "flat", M)
        # pásek přes nárt a mašlička
        z = 0.046
        strap = [np.array([s * 0.036, 0.0, z]), np.array([s * 0.073, -0.012, z + 0.036]), np.array([s * 0.110, 0.0, z])]
        tube(strap, 0.004, 0.0015, n=6, mat=M["shoes_b"], name="strap", parent=g, cap=True)
        bow(g, np.array([s * 0.073, -0.100, 0.052]), 0.016, M["shoes_b"], facing=(0, -1.0, 0))
    return g


def princess_accessory(root, d, M, name=None):
    g = node(name or "slot_accessory", root)
    # řetízek kolem krku s přívěskem
    # přední závěs
    chain = []
    for a in np.linspace(-1.35, 1.35, 30):
        chain.append(np.array([0.060 * math.sin(a), -0.044 * math.cos(a) - 0.003, 1.585 - 0.052 * (1 - math.cos(a)) * 1.0]))
    tube(np.array(chain), 0.0022, 0.0022, n=6, mat=M["gold"], name="chain", parent=g, cap=True)
    back = []
    for a in np.linspace(1.35, 2 * math.pi - 1.35, 24):
        back.append(np.array([0.052 * math.sin(a), -0.040 * math.cos(a) + 0.008, 1.600]))
    tube(np.array(back), 0.0022, 0.0022, n=6, mat=M["gold"], name="chain_back", parent=g, cap=True)
    c = np.array([0, -0.060, 1.510])
    ellipsoid(c, (0.020, 0.008, 0.026), n=20, m=12, mat=M["gold"], name="pendant_frame", parent=g)
    ellipsoid(c + np.array([0, -0.004, 0]), (0.014, 0.006, 0.020), n=20, m=12, mat=M["gem_blue"], name="pendant_gem", parent=g)
    for k in range(8):
        a = k * math.tau / 8
        ellipsoid(c + np.array([0.022 * math.cos(a), -0.002, 0.029 * math.sin(a)]), (0.0045, 0.0045, 0.0045), n=8, m=6, mat=M["pearl"], name="pendant_pearl", parent=g)
    return g


def princess_topper(root, d, M, name=None):
    g = node(name or "slot_topper", root)
    zt = CZ + HC * HS * 0.64
    # obruč
    ringp = ring_path((0, CY + 0.004), 0.108 * HR, 0.124 * HR, zt, 56)
    tube(np.vstack([ringp, ringp[:1]]), 0.008, 0.0045, n=8, mat=M["gold"], name="tiara_band", parent=g, cap=False)
    # zuby koruny (zlaté špice s drahokamy)
    for k, a in enumerate(np.linspace(-1.35, 1.35, 9)):
        base = np.array([0.108 * HR * math.sin(a), CY + 0.004 - 0.124 * HR * math.cos(a), zt])
        h = HR * (0.050 * (1.0 - 0.45 * abs(a) / 1.35) + (0.012 if k % 2 == 0 else 0))
        tube([base, base + np.array([0, 0, h * 0.55]), base + np.array([0, 0, h])], [0.012, 0.0075, 0.002], [0.0045, 0.0035, 0.0015], n=8, mat=M["gold"], name="tiara_spike", parent=g, cap=True)
        ellipsoid(base + np.array([0, 0, h + 0.003]), (0.0065, 0.0065, 0.0075), n=12, m=8, mat=M["pearl"] if k % 2 else M["gem_pink"], name="tiara_gem", parent=g)
    ellipsoid(np.array([0, CY - 0.115 * HR, zt + 0.004]), (0.014 * HR, 0.008, 0.016 * HR), n=14, m=10, mat=M["gem_pink"], name="tiara_centre", parent=g)
    return g


def strap_path(x0, z_front, z_back, off=0.005, n=26):
    """Ramínko přes rameno po povrchu trupu: nahoru vpředu, přes hřbet ramene, dolů vzadu."""
    pts = []
    zt = 1.592
    for k in range(n):
        u = k / (n - 1)
        if u < 0.5:
            z = z_front + (zt - z_front) * smooth(0, 1, u * 2)
            sgn = -1
        else:
            z = zt - (zt - z_back) * smooth(0, 1, (u - 0.5) * 2)
            sgn = 1
        rx, ry, cy = torso_profile(np.array([z]))[0]
        e = max(1 - (abs(x0) / (rx + off)) ** 2, 0.0)
        pts.append([x0, cy + sgn * (ry + off) * math.sqrt(e), z])
    return np.array(pts)


# ---------------------------------------------------------------- spodní prádlo
def underwear(root, M):
    g = node("underwear", root)
    gm, gd = M["under_grey"], M["under_dark"]
    # sportovní podprsenka: kulatý výstřih, široká spodní guma
    zs = np.linspace(1.325, 1.475, 52)
    R = torso_rows(zs, 0.0035)
    keep = lambda c: c[2] < (1.462 - 0.045 * gauss(c[0] / 0.07) if c[1] < 0 else 1.40)
    ring_mesh(R, True, keep, (0.1, 0.1), "bra", gm, g)
    ring_mesh(torso_rows(np.linspace(1.322, 1.352, 4), 0.006), True, None, (0.1, 0.1), "bra_band", gd, g)
    for s in (-1, 1):
        tube(strap_path(s * 0.086, 1.45, 1.43, 0.004), 0.0095, 0.0024, n=8, mat=gm, name="bra_strap", parent=g, cap=True, n0=np.array([1.0, 0, 0]))
    # kraťasy: pas + nohavičky do půli stehen
    zs2 = np.linspace(0.90, 1.07, 10)
    ring_mesh(torso_rows(zs2, 0.004), True, None, (0.1, 0.1), "shorts", gm, g)
    ring_mesh(torso_rows(np.linspace(1.05, 1.085, 4), 0.007), True, None, (0.1, 0.1), "waistband", gd, g)
    for s in (-1, 1):
        path, wid, thk = leg_geo(s)
        k = 3
        tube(path[: k + 1], wid[: k + 1] + 0.0045, thk[: k + 1] + 0.0045, n=24, mat=gm, name="shorts_leg", parent=g, cap=True)
    return g


def shoe_top(info, y):
    """Svislá poloha horního povrchu boty a polovina šířky ve vzdálenosti y od paty (podél chodidla)."""
    ys = info["ctr"][:, 1][::-1]
    zt = (info["ctr"][:, 2] + info["vrad"])[::-1]
    hw = info["hrad"][::-1]
    return float(np.interp(y, ys, zt[:])), float(np.interp(y, ys, hw[:]))


def sleeve(g, s, i0, i1, off, mat, name="sleeve", n=22, taper=None):
    path, rad = arm_geo(s)
    seg = slice(i0, i1 + 1)
    r = rad[seg] + off
    tube(path[seg], r, r * 0.95, n=n, mat=mat, name=name, parent=g, cap=True, uscale=5.0, vlen=max(1.0, (i1 - i0) * 0.8))


def leg_sleeve(g, s, i0, i1, off, mat, name="legwear", n=26, uscale=7.0, vlen=None):
    path, wid, thk = leg_geo(s)
    seg = slice(i0, i1 + 1)
    tube(path[seg], wid[seg] + off, thk[seg] + off, n=n, mat=mat, name=name, parent=g, cap=True, uscale=uscale, vlen=vlen or max(1.0, (i1 - i0) * 0.9))


# ---------------------------------------------------------------- sportovkyně
def athlete_outfit(root, d, M, name=None):
    g = node(name or "slot_outfit", root)
    a, b = M["outfit_a"], M["outfit_b"]
    # top: úzká sportovní halenka s lemem a bílým pruhem
    zs = np.linspace(1.185, 1.50, 64)
    R = torso_rows(zs, 0.0075)
    keep = lambda c: c[2] < (1.485 - 0.050 * gauss(c[0] / 0.075) if c[1] < 0 else 1.505 - 0.03 * gauss(c[0] / 0.05))
    ring_mesh(R, True, keep, (0.08, 0.08), "top", a, g)
    for s in (-1, 1):
        tube(strap_path(s * 0.092, 1.47, 1.44, 0.010), 0.0105, 0.0032, n=8, mat=a, name="strap", parent=g, cap=True, n0=np.array([1.0, 0, 0]))
    # bílý pruh a lem
    ring_mesh(torso_rows(np.linspace(1.325, 1.375, 5), 0.0105), True, None, (0.08, 0.08), "stripe", b, g)
    ring_mesh(torso_rows(np.linspace(1.185, 1.215, 4), 0.0105), True, None, (0.08, 0.08), "hem", b, g)
    # šortky s postranním pruhem a pasem
    ring_mesh(torso_rows(np.linspace(0.90, 1.12, 12), 0.011), True, None, (0.1, 0.1), "shorts", a, g)
    ring_mesh(torso_rows(np.linspace(1.08, 1.125, 5), 0.0145), True, None, (0.1, 0.1), "waist", b, g)
    for s in (-1, 1):
        leg_sleeve(g, s, 0, 4, 0.0095, a, "shorts_leg")
        path, wid, thk = leg_geo(s)
        sp = path[0:5] + np.array([s * 0.0, 0.0, 0.0])
        edge = np.array([[p[0] + s * (w + 0.0125), p[1] + 0.0, p[2]] for p, w in zip(path[0:5], wid[0:5])])
        tube(edge, 0.0065, 0.0016, n=6, mat=b, name="side_stripe", parent=g, cap=True)
        # ponožky: žebrovaný nátah od kotníku po lýtko, pruh na okraji
        leg_sleeve(g, s, 11, 15, 0.006, b, "sock")
        leg_sleeve(g, s, 11, 12, 0.0085, a, "sock_cuff")
    # tkanička v pase
    for s in (-1, 1):
        tube([np.array([s * 0.012, -0.108, 1.105]), np.array([s * 0.028, -0.113, 1.075]), np.array([s * 0.035, -0.115, 1.02])], 0.0025, 0.0025, n=6, mat=b, name="cord", parent=g, cap=True)
    return g


def athlete_shoes(root, d, M, name=None):
    g = node(name or "slot_shoes", root)
    a, b = M["shoes_a"], M["shoes_b"]
    for s in (-1, 1):
        info = foot_shell(g, s, "sneaker", M)
        # špička a pata v kontrastní barvě
        ellipsoid((s * 0.074, -0.172, 0.027), (0.036, 0.040, 0.026), n=18, m=12, mat=b, name="toecap", parent=g)
        ellipsoid((s * 0.070, 0.064, 0.052), (0.034, 0.022, 0.044), n=16, m=10, mat=b, name="heelcounter", parent=g)
        # jazyk a tkaničky (kříž)
        for y in (-0.020, -0.045, -0.070, -0.095):
            zt, hw = shoe_top(info, y)
            ell = zt + 0.001
            pL = np.array([s * 0.073 - hw * 0.62, y, ell - 0.010])
            pR = np.array([s * 0.073 + hw * 0.62, y - 0.012, ell - 0.010])
            mid = np.array([s * 0.073, y - 0.006, ell + 0.004])
            tube([pL, mid, pR], 0.0022, 0.0022, n=6, mat=M["lace"], name="lace", parent=g, cap=True)
            tube([np.array([pR[0], y, pR[2]]), mid + np.array([0, 0.002, 0]), np.array([pL[0], y - 0.012, pL[2]])], 0.0022, 0.0022, n=6, mat=M["lace"], name="lace", parent=g, cap=True)
        zt, hw = shoe_top(info, 0.0)
        tube([np.array([s * 0.073, -0.006, zt]), np.array([s * 0.073, 0.012, zt + 0.032])], 0.020, 0.0025, n=10, mat=a, name="tongue", parent=g, cap=True)
        # nákolenky: logo (esíčko) po boku
        tube([np.array([s * (0.073 + hw), -0.030, 0.045]), np.array([s * (0.073 + hw + 0.002), -0.060, 0.050]), np.array([s * (0.073 + hw), -0.090, 0.040])], 0.012, 0.0012, n=6, mat=b, name="swoosh", parent=g, cap=True)
    return g


def athlete_accessory(root, d, M, name=None):
    g = node(name or "slot_accessory", root)
    # medaile na pruhované stuze
    for s in (-1, 1):
        tube([np.array([s * 0.034, -0.050, 1.595]), np.array([s * 0.042, -0.078, 1.545]), np.array([s * 0.014, -0.112, 1.455]), np.array([0, -0.122, 1.430])], 0.0085, 0.0014, n=8, mat=M["ribbon"], name="ribbon", parent=g, cap=True)
    back = [np.array([-0.034, -0.050, 1.595]), np.array([-0.040, 0.020, 1.600]), np.array([0.0, 0.050, 1.604]), np.array([0.040, 0.020, 1.600]), np.array([0.034, -0.050, 1.595])]
    tube(catmull(back, 14), 0.0085, 0.0014, n=8, mat=M["ribbon"], name="ribbon_back", parent=g, cap=True)
    c = np.array([0, -0.130, 1.395])
    ellipsoid(c, (0.027, 0.004, 0.027), n=28, m=14, mat=M["gold"], name="medal", parent=g)
    ellipsoid(c + np.array([0, -0.003, 0]), (0.021, 0.002, 0.021), n=28, m=12, mat=M["gold_dark"], name="medal_inner", parent=g)
    star(g, c + np.array([0, -0.0055, 0]), 0.0185, M["gold"], depth=0.002)
    return g


def star(g, c, r, mat, depth=0.004, name="star"):
    pts = []
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5
        rr = r if k % 2 == 0 else r * 0.42
        pts.append((c[0] + rr * math.cos(a), c[2] + rr * math.sin(a)))
    V, F = [], []
    V.append([c[0], c[1], c[2]])
    for x, z in pts:
        V.append([x, c[1], z])
    for k in range(10):
        F.append((0, 1 + k, 1 + (k + 1) % 10))
    V = np.array(V)
    V2 = V.copy()
    V2[:, 1] -= depth
    allv = np.vstack([V, V2])
    faces = [tuple(f) for f in F] + [tuple(np.array(f)[::-1] + 11) for f in F]
    for k in range(10):
        a_, b_ = 1 + k, 1 + (k + 1) % 10
        faces.append((a_, b_, b_ + 11, a_ + 11))
    return make_mesh(name, allv, faces, mat, None, g, shade=False)


def athlete_topper(root, d, M, name=None):
    g = node(name or "slot_topper", root)
    a, b = M["topper_a"], M["topper_b"]
    zr = CZ + HC * HS * 0.40
    R, rr = 0.1385 * HR, 0.1535 * HR
    # kšiltovka: kupole ze šesti panelů, vzadu otvor na culík
    rows = []
    for j in range(16):
        t = j / 15
        ph = t * (math.pi / 2 - 0.05)
        r = 1.0 * math.cos(ph)
        z = zr + 0.125 * HR * math.sin(ph) * 1.0 + 0.0
        rows.append(ring_path((0, CY + 0.004), (R + 0.004) * r + 0.0001, (rr + 0.004) * r + 0.0001, z + 0.0, 72))
    rows = np.array(rows)
    keep = lambda c: not (c[1] > CY + 0.07 and c[2] < zr + 0.055 and abs(c[0]) < 0.06)
    ring_mesh(rows, True, keep, (0.1, 0.1), "cap", a, g)
    # švy mezi panely
    for k in range(6):
        ang = k * math.pi / 3
        pts = []
        for j in range(16):
            t = j / 15
            ph = t * (math.pi / 2 - 0.05)
            pts.append([(R + 0.0055) * math.cos(ph) * math.cos(ang), CY + 0.004 + (rr + 0.0055) * math.cos(ph) * math.sin(ang), zr + 0.125 * HR * math.sin(ph)])
        if math.sin(ang) > 0.9 and False:
            continue
        tube(np.array(pts), 0.0016, 0.0016, n=5, mat=b, name="seam", parent=g, cap=True)
    ellipsoid((0, CY + 0.004, zr + 0.127 * HR), (0.011, 0.011, 0.008), n=12, m=8, mat=b, name="cap_button", parent=g)
    # kšilt
    brim = []
    for k in range(9):
        t = -1.15 + k * 2.3 / 8
        brim.append(np.array([ (R + 0.030) * math.sin(t) * 1.15, CY - (rr + 0.060) * math.cos(t) * 1.0 - 0.02, zr - 0.0 - 0.012 * (1 - math.cos(t)) ]))
    tube(np.array(brim), 0.0, 0.0, n=4, mat=a, name="dummy", parent=g, cap=False) if False else None
    rows2 = []
    for u in np.linspace(0, 1, 6):
        row = []
        for t in np.linspace(-0.95, 0.95, 22):
            x = (R + 0.004 + 0.016 * u) * math.sin(t) * (1.0 + 0.10 * u)
            y = CY - (rr + 0.004 + 0.012 * u) * math.cos(t) - 0.075 * HR * u
            z = zr - 0.004 - 0.030 * u * u + 0.003 * math.cos(t) * u
            row.append([x, y, z])
        rows2.append(row)
    rows2 = np.array(rows2)
    ring_mesh(rows2, False, None, (0.1, 0.1), "brim", a, g)
    ring_mesh(rows2 + np.array([0, 0, -0.0035]), False, None, (0.1, 0.1), "brim_under", b, g, flip=True)
    # pásek na čele
    band = ring_path((0, CY + 0.004), R + 0.0085, rr + 0.0085, zr + 0.002, 72)
    closed_tube(g, band, 0.0045, b, 6, "sweatband")
    return g
