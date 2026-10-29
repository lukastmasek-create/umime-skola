"""Oblečení: rockerka, víla, kuchařka, astronautka (navazuje na panenky_wear.py)."""
from panenky_wear import *  # noqa: F401,F403

X = np.array([1.0, 0, 0])
Z = np.array([0, 0, 1.0])


def eye_center(s):
    ex, ez = s * EYE_X * HS, CZ + (EYE_Z - CZ) * HS
    return ex, ez


def hand_point(s):
    """Střed dlaně (kam se dává předmět)."""
    path, rad = arm_geo(s)
    wr = path[-1]
    d = np.array([-s * 0.10, 0.0, -1.0])
    d /= np.linalg.norm(d)
    return wr + d * 0.045, d


def tex_plaid_gray(name):
    S2 = 512
    t = np.arange(S2) / S2
    band = (0.5 + 0.5 * np.sin(t * 2 * math.pi * 4)) ** 2
    thin = np.exp(-(((t * 8) % 1 - 0.5) / 0.045) ** 2)
    w = np.clip(band[None, :] * 0.5 + band[:, None] * 0.5, 0, 1)
    v = 0.58 + 0.42 * w
    line = np.maximum(thin[None, :], thin[:, None])
    v = v * (1 - 0.55 * line) + 0.35 * line
    return save_png(np.stack([v * 255] * 3, axis=-1), name)


def tex_check_gray(name, cells=8):
    S2 = 256
    y, x = np.mgrid[0:S2, 0:S2]
    m = ((x // (S2 // cells) + y // (S2 // cells)) % 2).astype(np.float32)
    v = 0.62 + 0.38 * (1 - m)
    return save_png(np.stack([v * 255] * 3, axis=-1), name)


def tex_wing(name="wing.png"):
    W, H = 256, 512
    img = np.zeros((H, W, 4), dtype=np.float32)
    v = np.linspace(0, 1, H)[:, None]
    u = np.linspace(0, 1, W)[None, :]
    img[..., 0] = 190 + 50 * v
    img[..., 1] = 235 - 40 * u
    img[..., 2] = 255
    img[..., 3] = 90 + 40 * np.sin(u * 5 + v * 4)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGBA")
    d = ImageDraw.Draw(im)
    for k in range(9):
        a = 0.2 + k * 0.1
        d.line([(W * 0.08, H * 0.02), (W * (0.15 + a * 0.8), H * 0.55), (W * (0.1 + a * 0.5), H * 0.98)], fill=(255, 255, 255, 170), width=2)
    for k in range(5):
        y = H * (0.2 + k * 0.15)
        d.line([(W * 0.05, y), (W * 0.95, y + 20)], fill=(255, 255, 255, 80), width=1)
    path = os.path.join(TEXDIR, name)
    im.save(path)
    return path


def tex_flag(name="flag.png"):
    im = Image.new("RGB", (128, 80), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 128, 27], fill=(215, 20, 26))
    d.rectangle([0, 53, 128, 80], fill=(17, 69, 126))
    d.polygon([(0, 0), (60, 40), (0, 80)], fill=(17, 69, 126))
    path = os.path.join(TEXDIR, name)
    im.save(path)
    return path


# ---------------------------------------------------------------- rockerka
def rocker_outfit(root, d, M):
    g = node("slot_outfit", root)
    a, b = M["outfit_a"], M["outfit_b"]
    # černé tričko s krátkým rukávem a hvězdou
    zs = np.linspace(1.12, 1.58, 96)
    R = torso_rows(zs, 0.0085)
    keep = lambda c: c[2] < (1.585 - 0.058 * gauss(c[0] / 0.055) if c[1] < 0 else 1.592)
    ring_mesh(R, True, keep, (0.1, 0.1), "tee", a, g)
    for s in (-1, 1):
        sleeve(g, s, 0, 4, 0.0085, a, "tee_sleeve")
        ellipsoid((s * 0.168, 0.0, 1.505), (0.056, 0.052, 0.058), n=20, m=14, mat=a, name="tee_shoulder", parent=g)
    star(g, np.array([0.0, -0.108, 1.275]), 0.050, b, depth=0.004)
    # plisovaná kostkovaná minisukně
    mrows = 36
    zs2 = np.linspace(1.17, 0.72, mrows)
    t = (1.17 - zs2) / (1.17 - 0.72)
    rx = 0.138 + 0.215 * t
    ry = 0.110 + 0.190 * t
    rows = np.array([ring_path((0, 0.002), rx[j], ry[j], zs2[j], 144) for j in range(mrows)])
    ang = np.arctan2(rows[..., 1], rows[..., 0])
    k = 22
    pleat = np.abs(np.sin(k * ang / 2)) ** 0.7
    for j in range(mrows):
        f = 1 + (0.07 * (0.2 + 0.8 * t[j])) * (pleat[j] - 0.5)
        rows[j, :, 0] *= f
        rows[j, :, 1] = 0.002 + (rows[j, :, 1] - 0.002) * f
    ring_mesh(rows, True, None, (0.3, 0.3), "skirt", M["outfit_plaid"], g)
    # kožený pásek s cvočky a přezkou
    ring_mesh(torso_rows(np.linspace(1.135, 1.19, 6), 0.016), True, None, (0.1, 0.1), "belt", M["leather"], g)
    for ang_ in np.linspace(0, 2 * math.pi, 26, endpoint=False):
        rx_, ry_, cy_ = torso_profile(np.array([1.162]))[0]
        p = np.array([(rx_ + 0.0185) * math.cos(ang_), cy_ + (ry_ + 0.0185) * math.sin(ang_), 1.162])
        ellipsoid(p, (0.0045, 0.0045, 0.0045), n=8, m=6, mat=M["silver"], name="stud", parent=g)
    ellipsoid((0, -0.106, 1.163), (0.020, 0.006, 0.016), n=18, m=10, mat=M["silver"], name="buckle", parent=g)
    # síťované punčochy (průhledná síťka od sukně k botám)
    for s in (-1, 1):
        leg_sleeve(g, s, 4, 15, 0.0045, M["fishnet"], "fishnet")
    return g


def rocker_shoes(root, d, M):
    g = node("slot_shoes", root)
    a, b = M["shoes_a"], M["shoes_b"]
    for s in (-1, 1):
        info = foot_shell(g, s, "boots", M)
        # stehlá sňatá: knoflíky a přezky
        path, wid, thk = leg_geo(s)
        for idx, zb in ((14, 0.0), (13, 0.0), (12, 0.0)):
            p, w, t_ = path[idx], wid[idx] + 0.0095, thk[idx] + 0.0095
            tube(np.array([p + np.array([0, 0, 0.0035]), p + np.array([0, 0, -0.0035])]), [w + 0.0035, w + 0.0035], [t_ + 0.0035, t_ + 0.0035], n=24, mat=b, name="boot_strap", parent=g, cap=True)
            ellipsoid(p + np.array([s * -0.0, -(t_ + 0.0055), 0]), (0.0075, 0.0035, 0.0065), n=10, m=8, mat=M["silver"], name="buckle", parent=g)
        # šněrování na nártu
        for y in (-0.020, -0.045, -0.070, -0.095):
            zt, hw = shoe_top(info, y)
            tube([np.array([s * 0.073 - hw * 0.55, y, zt - 0.006]), np.array([s * 0.073, y - 0.004, zt + 0.003]), np.array([s * 0.073 + hw * 0.55, y, zt - 0.006])], 0.0020, 0.0020, n=5, mat=M["lace"], name="lace", parent=g, cap=True)
    return g


def rocker_accessory(root, d, M):
    g = node("slot_accessory", root)
    lens = M["lens"]
    for s in (-1, 1):
        ex, ez = eye_center(s)
        ys = EYE_INFO["y"]
        c = np.array([ex, ys - 0.004, ez])
        ellipsoid(c, (0.0285, 0.003, 0.0275), n=30, m=14, mat=lens, name="lens", parent=g)
        pts = ring_path((c[0], c[1]), 0.0292, 0.0, c[2] - 0.0292 * 0, 28)
        ring = np.array([[c[0] + 0.0295 * math.cos(t), c[1] - 0.001, c[2] + 0.0285 * math.sin(t)] for t in np.linspace(0, 2 * math.pi, 40)])
        tube(ring, 0.0030, 0.0030, n=6, mat=M["accessory_a"], name="frame", parent=g, cap=False)
        tube([np.array([c[0] + s * 0.029, c[1], c[2] + 0.003]), np.array([s * (HA * HS + 0.002), c[1] + 0.07, c[2] + 0.004]), np.array([s * (HA * HS + 0.004), c[1] + 0.125, c[2] - 0.004])], 0.0024, 0.0024, n=6, mat=M["accessory_a"], name="temple", parent=g, cap=True)
    tube([np.array([-0.0035, EYE_INFO["y"] - 0.0055, EYE_INFO["z"] + 0.005]), np.array([0.0035, EYE_INFO["y"] - 0.0055, EYE_INFO["z"] + 0.005])], 0.0024, 0.0024, n=6, mat=M["accessory_a"], name="bridge", parent=g, cap=True)
    return g


def rocker_topper(root, d, M):
    g = node("slot_topper", root)
    a, b = M["topper_a"], M["topper_b"]
    # kožená bunda: otevřená vpředu, límec, zip diagonálně, cvočky
    zs = np.linspace(0.98, 1.585, 110)
    R = torso_rows(zs, 0.024)
    keep = lambda c: not (c[1] < 0 and abs(c[0]) < 0.018 + 0.06 * smooth(1.30, 1.58, c[2])) and c[2] < 1.58 - 0.01 * 0
    ring_mesh(R, True, keep, (0.12, 0.12), "jacket", a, g)
    # lemy otevřené přední hrany
    edge_l, edge_r = [], []
    for z in np.linspace(0.99, 1.575, 40):
        rx, ry, cy = torso_profile(np.array([z]))[0]
        gap = 0.018 + 0.06 * float(smooth(1.30, 1.58, z))
        for s, lst in ((-1, edge_l), (1, edge_r)):
            x = s * gap
            e = max(1 - (x / (rx + 0.024)) ** 2, 0.0)
            lst.append([x, cy - (ry + 0.024) * math.sqrt(e), z])
    for lst in (edge_l, edge_r):
        tube(np.array(lst), 0.0065, 0.0065, n=6, mat=b, name="front_edge", parent=g, cap=True)
    for s in (-1, 1):
        sleeve(g, s, 0, 11, 0.0165, a, "jacket_sleeve")
        ellipsoid((s * 0.166, 0.0, 1.505), (0.062, 0.058, 0.064), n=22, m=14, mat=a, name="jacket_shoulder", parent=g)
        path, rad = arm_geo(s)
        tube(path[10:12], rad[10:12] + 0.021, (rad[10:12] + 0.021) * 0.95, n=22, mat=b, name="cuff", parent=g, cap=True)
        ellipsoid(path[0] + np.array([s * 0.0, -0.008, 0.045]), (0.011, 0.011, 0.007), n=8, m=6, mat=M["silver"], name="stud", parent=g)
        # límec: dva zahnuté klopy
        ring_pts = [np.array([s * 0.014, -0.074, 1.545]), np.array([s * 0.050, -0.068, 1.560]), np.array([s * 0.078, -0.040, 1.560]), np.array([s * 0.078, 0.0, 1.552])]
        tube(ring_pts, [0.020, 0.030, 0.032, 0.026], [0.006, 0.0065, 0.007, 0.006], n=8, mat=a, name="lapel", parent=g, cap=True, n0=Z)
        tube([np.array([s * 0.030, -0.090, 1.425]), np.array([s * 0.052, -0.078, 1.500]), np.array([s * 0.030, -0.074, 1.552])], [0.028, 0.034, 0.026], [0.005] * 3, n=8, mat=b, name="lapel_trim", parent=g, cap=True, n0=Z)
    # límec vzadu
    back = [np.array([-0.058, 0.043, 1.57]), np.array([0.0, 0.056, 1.585]), np.array([0.058, 0.043, 1.57])]
    tube(catmull(back, 12), 0.016, 0.007, n=8, mat=a, name="collar_back", parent=g, cap=True, n0=Z)
    # zip (šikmo přes hruď) a lem spodní
    for k in range(18):
        t = k / 17
        p = np.array([0.02 + 0.075 * t, -0.092 - 0.012 * t, 1.18 + 0.19 * t])
        ellipsoid(p, (0.0042, 0.0035, 0.0042), n=6, m=4, mat=M["silver"], name="zip_tooth", parent=g)
    ring_mesh(torso_rows(np.linspace(0.98, 1.025, 5), 0.0295), True, keep, (0.1, 0.1), "hem_band", b, g)
    return g


# ---------------------------------------------------------------- víla
def fairy_outfit(root, d, M):
    g = node("slot_outfit", root)
    a, b = M["outfit_a"], M["outfit_b"]
    zs = np.linspace(1.15, 1.50, 80)
    R = torso_rows(zs, 0.006)
    keep = lambda c: c[2] < (1.505 - 0.12 * gauss(c[0] / 0.05) if c[1] < 0 else 1.49)
    ring_mesh(R, True, keep, (0.1, 0.1), "bodice", a, g)
    edge = edge_points(R, keep)
    # listové lemování výstřihu
    for i in range(0, len(edge), 5):
        p = edge[i] + np.array([0, -0.004, 0.006])
        ellipsoid(p, (0.0095, 0.0025, 0.016), rot_z=0, n=10, m=8, mat=b, name="leaf_trim", parent=g)
    # ramínka z lián
    for s in (-1, 1):
        tube(strap_path(s * 0.088, 1.50, 1.47, 0.007), 0.005, 0.003, n=6, mat=M["outfit_leaf"], name="strap", parent=g, cap=True, n0=X)
    ring_mesh(torso_rows(np.linspace(1.14, 1.185, 6), 0.011), True, None, (0.1, 0.1), "waist", M["outfit_leaf"], g)
    # okvětní sukně: dvě vrstvy lupenů (zahnuté ploché trubice)
    def petals(count, length, spread, z0, ma, name, sway=0.0, wid_k=1.0):
        for k in range(count):
            th = k * 2 * math.pi / count + (0.18 if name == "petal2" else 0)
            ux, uy = math.cos(th), math.sin(th)
            pts = []
            for u in np.linspace(0, 1, 12):
                r = 0.128 + spread * math.sin(u * math.pi / 2) ** 0.9 + 0.06 * u * u * 0
                z = z0 - length * u ** 0.92 + 0.02 * math.sin(u * math.pi)
                pts.append([ux * r * 1.0, 0.002 + uy * r * 0.92, z])
            pts = np.array(pts)
            wid = np.maximum(0.003, 0.050 * wid_k * np.sin(np.linspace(0.12, 1.0, 12) * math.pi * 0.95) ** 0.8 + 0.01 * (1 - np.linspace(0, 1, 12)))
            wid[0] = 0.034 * wid_k
            tangent = np.array([-uy, ux, 0.0])
            tube(pts, wid, 0.0022, n=8, mat=ma, name=name, parent=g, cap=True, n0=tangent)

    petals(14, 0.52, 0.30, 1.16, a, "petal1", 0, 1.05)
    petals(14, 0.40, 0.20, 1.17, b, "petal2", 0, 0.95)
    # křídla
    wing = M["wing"]
    for s in (-1, 1):
        for (L, Wd, ang, z0, flip) in ((0.40, 0.17, 0.62, 1.36, 1), (0.27, 0.12, -0.35, 1.28, 1)):
            rows = []
            root_p = np.array([s * 0.028, 0.100, z0])
            dirv = np.array([s * math.cos(ang), 0.20, math.sin(ang)])
            dirv /= np.linalg.norm(dirv)
            side = np.cross(dirv, np.array([0, 1.0, 0]))
            side /= np.linalg.norm(side)
            for u in np.linspace(0, 1, 18):
                row = []
                for v in np.linspace(-1, 1, 12):
                    width = Wd * (math.sin(min(u, 1) * math.pi) ** 0.75) * (0.55 + 0.45 * u)
                    p = root_p + dirv * L * u + side * v * width + np.array([0, 0.05 * u * u + 0.012 * math.sin(v * 2), 0])
                    row.append(p)
                rows.append(row)
            m_ = ring_mesh(np.array(rows), False, None, (0.35, 0.35), "wing", wing, g)
    return g


def fairy_shoes(root, d, M):
    g = node("slot_shoes", root)
    b = M["shoes_b"]
    for s in (-1, 1):
        info = foot_shell(g, s, "ballet", M)
        path, wid, thk = leg_geo(s)
        # stuhy křížem kolem lýtka
        for ph0 in (0.0, math.pi):
            pts = []
            for k in range(0, 14):
                u = k / 13
                i = 15 - int(round(u * 3.0))
                p = path[min(15, 15 - int(u * 3))]
                z = 0.12 + u * 0.28
                idx = int(np.argmin(np.abs(path[:, 2] - z)))
                pc = path[idx]
                a_ = ph0 + u * 7.5
                pts.append([pc[0] + (wid[idx] + 0.0045) * math.cos(a_), pc[1] + (thk[idx] + 0.0045) * math.sin(a_), z])
            tube(np.array(pts), 0.0055, 0.0014, n=6, mat=b, name="ribbon", parent=g, cap=True)
    return g


def fairy_accessory(root, d, M):
    g = node("slot_accessory", root)
    hp, dd = hand_point(1)
    tip = np.array([hp[0] + 0.035, hp[1] - 0.26, hp[2] + 0.26])
    handle = [hp + np.array([0, 0.02, -0.04]), hp, tip]
    tube(catmull(handle, 10), 0.0068, 0.0068, n=8, mat=M["accessory_a"], name="wand", parent=g, cap=True)
    for k in range(10):
        t = k / 9
        p = hp + (tip - hp) * t
        ring = [p + np.array([0.008 * math.cos(t * 30 + q), 0.0, 0.008 * math.sin(t * 30 + q)]) for q in (0.0, 2.1, 4.2)]
        ellipsoid(ring[0], (0.0045, 0.0045, 0.0045), n=6, m=4, mat=M["gold"], name="twist", parent=g)
    star(g, tip + np.array([0, -0.012, 0.045]), 0.062, M["star_glow"], depth=0.012)
    for k, (dx, dz, r) in enumerate(((0.07, 0.07, 0.016), (-0.05, 0.10, 0.012), (0.09, -0.01, 0.010), (-0.06, 0.00, 0.009))):
        star(g, tip + np.array([dx, -0.012, 0.045 + dz]), r, M["star_glow"], depth=0.003)
    return g


def fairy_topper(root, d, M):
    g = node("slot_topper", root)
    a, b = M["topper_a"], M["topper_b"]
    zt = CZ + HC * HS * 0.80
    leaf = M["outfit_leaf"]
    for k, ang_ in enumerate(np.linspace(-2.2, 2.2, 11)):
        r_x, r_y = 0.122, 0.138
        c = np.array([r_x * math.sin(ang_), CY + 0.004 - r_y * math.cos(ang_), zt + 0.012 * math.cos(ang_)])
        nrm_ = np.array([math.sin(ang_), -math.cos(ang_), 0.0])
        for lf in (-1, 1):
            ellipsoid(c + np.array([lf * 0.02 * math.cos(ang_), lf * 0.02 * math.sin(ang_), -0.004]), (0.012, 0.004, 0.0045), rot_z=ang_ + lf * 0.6, n=10, m=6, mat=leaf, name="leaf", parent=g)
        size = 0.0225 if k % 2 == 0 else 0.0185
        petal_mat = a if k % 2 == 0 else M["white"]
        for p_ in range(6):
            pa = p_ * math.tau / 6
            pc = c + nrm_ * 0.012 + np.array([-math.sin(ang_), math.cos(ang_), 0.0]) * math.cos(pa) * size * 0.9 + Z * math.sin(pa) * size * 0.9
            ellipsoid(pc, (size * 0.48, size * 0.22, size * 0.48), rot_z=ang_, n=10, m=6, mat=petal_mat, name="petal", parent=g)
        ellipsoid(c + nrm_ * 0.016, (0.0085, 0.0085, 0.0085), n=10, m=8, mat=b, name="centre", parent=g)
    return g


# ---------------------------------------------------------------- kuchařka
def chef_outfit(root, d, M):
    g = node("slot_outfit", root)
    a, b = M["outfit_a"], M["outfit_b"]
    # kalhoty (kostičky)
    for s in (-1, 1):
        leg_sleeve(g, s, 0, 15, 0.0125, M["outfit_check"], "trousers")
    ring_mesh(torso_rows(np.linspace(0.90, 1.12, 14), 0.016), True, None, (0.16, 0.16), "trouser_top", M["outfit_check"], g)
    # dvouřadá blůza
    zs = np.linspace(0.90, 1.59, 90)
    R = torso_rows(zs, 0.022)
    ring_mesh(R, True, lambda c: c[2] < 1.585 - 0.035 * gauss(c[0] / 0.05) * (1 if c[1] < 0 else 0), (0.2, 0.2), "jacket", a, g)
    # překřížená přední klopa
    zs2 = np.linspace(0.93, 1.54, 70)
    R2 = torso_rows(zs2, 0.030)
    ring_mesh(R2, True, lambda c: c[1] < -0.04 and -0.115 < c[0] < 0.030 + 0.0 * c[2], (0.2, 0.2), "overlap", a, g)
    # knoflíky ve dvou řadách
    for xo in (-0.065, 0.065):
        for z in (1.15, 1.26, 1.37, 1.47):
            rx, ry, cy = torso_profile(np.array([z]))[0]
            e = max(1 - (xo / (rx + 0.034)) ** 2, 0)
            y = cy - (ry + 0.034) * math.sqrt(e) * 1.0
            ellipsoid((xo, y - 0.0015, z), (0.0095, 0.004, 0.0095), n=12, m=8, mat=b, name="button", parent=g)
    # rukávy se vyhrnutými manžetami
    for s in (-1, 1):
        sleeve(g, s, 0, 10, 0.020, a, "sleeve")
        ellipsoid((s * 0.167, 0.0, 1.505), (0.064, 0.060, 0.066), n=22, m=14, mat=a, name="shoulder", parent=g)
        path, rad = arm_geo(s)
        tube(path[9:12], rad[9:12] + 0.027, (rad[9:12] + 0.027) * 0.97, n=24, mat=a, name="cuff", parent=g, cap=True)
        tube(path[10:12], rad[10:12] + 0.029, (rad[10:12] + 0.029) * 0.97, n=24, mat=b, name="cuff_band", parent=g, cap=True)
    # stojáček a šátek
    ring_c = ring_path((0, 0.009), 0.058, 0.057, 1.605, 36)
    closed_tube(g, ring_c, 0.010, a, 8, "collar")
    tube([np.array([-0.050, -0.040, 1.590]), np.array([0, -0.074, 1.560]), np.array([0.050, -0.040, 1.590])], [0.014, 0.018, 0.014], [0.006] * 3, n=8, mat=b, name="scarf", parent=g, cap=True, n0=Z)
    ellipsoid((0, -0.090, 1.530), (0.026, 0.008, 0.032), n=14, m=10, mat=b, name="scarf_tip", parent=g)
    # zástěra: ohnutý pás látky od hrudi po kolena
    zs3 = np.linspace(1.26, 0.58, 44)
    rows3 = []
    for z in zs3:
        rx_, ry_, cy_ = torso_profile(np.array([max(z, 0.90)]))[0]
        k_ = max(0.0, (0.90 - z) / 0.32)
        rows3.append(ring_path((0, cy_), rx_ + 0.040 + 0.03 * k_, ry_ + 0.040 + 0.05 * k_, z, 120))
    ring_mesh(np.array(rows3), True, lambda c: c[1] < -0.025 and abs(c[0]) < 0.118 + 0.05 * smooth(1.2, 0.6, c[2]), (0.2, 0.2), "apron", b, g)
    tube(catmull([np.array([-0.118, -0.02, 1.2]), np.array([-0.16, 0.08, 1.2]), np.array([0, 0.115, 1.2]), np.array([0.16, 0.08, 1.2]), np.array([0.118, -0.02, 1.2])], 20), 0.005, 0.005, n=6, mat=b, name="apron_tie", parent=g, cap=True)
    return g


def chef_shoes(root, d, M):
    g = node("slot_shoes", root)
    b = M["shoes_b"]
    for s in (-1, 1):
        info = foot_shell(g, s, "clog", M)
        tube([np.array([s * 0.036, 0.0, 0.052]), np.array([s * 0.073, -0.008, 0.088]), np.array([s * 0.112, 0.0, 0.052])], 0.0085, 0.0028, n=6, mat=b, name="strap", parent=g, cap=True)
        for k in range(5):
            ellipsoid((s * (0.056 + 0.0045 * k), -0.07 - 0.012 * (k % 2), 0.075), (0.0035, 0.0035, 0.0035), n=6, m=4, mat=M["dark"], name="hole", parent=g)
    return g


def chef_accessory(root, d, M):
    g = node("slot_accessory", root)
    hp, dd = hand_point(1)
    tip = hp + np.array([0.03, -0.20, 0.22])
    tube(catmull([hp + np.array([0, 0.02, -0.05]), hp, tip], 10), 0.0085, 0.0075, n=10, mat=M["wood"], name="ladle_handle", parent=g, cap=True)
    bowl = tip + np.array([0.003, -0.012, 0.030])
    ellipsoid(bowl, (0.034, 0.034, 0.016), rot_z=0, n=22, m=12, mat=M["steel"], name="ladle_bowl", parent=g)
    ellipsoid(bowl + np.array([0, -0.003, 0.012]), (0.027, 0.027, 0.006), n=18, m=8, mat=M["soup"], name="ladle_soup", parent=g)
    return g


def chef_topper(root, d, M):
    g = node("slot_topper", root)
    a, b = M["topper_a"], M["topper_b"]
    z0 = CZ + HC * HS * 0.58
    zs = np.linspace(z0, z0 + 0.34, 46)
    t = (zs - z0) / 0.34
    prof = 0.123 + 0.02 * smooth(0.05, 0.5, t) + 0.045 * np.sin(np.clip((t - 0.35) / 0.65, 0, 1) * math.pi) ** 1.2 - 0.03 * smooth(0.9, 1.0, t)
    rows = []
    for j in range(len(zs)):
        ring = ring_path((0, CY + 0.004), prof[j], prof[j] * 1.1, zs[j], 112)
        ang = np.arctan2(ring[:, 1] - CY - 0.004, ring[:, 0])
        f = 1 + 0.045 * smooth(0.12, 0.6, t[j]) * np.sin(30 * ang)
        ring[:, 0] = (ring[:, 0]) * f
        ring[:, 1] = (CY + 0.004) + (ring[:, 1] - CY - 0.004) * f
        rows.append(ring)
    ring_mesh(np.array(rows), True, None, (0.15, 0.15), "toque", a, g)
    # spodní pás a vršek
    tube([np.array([0, CY + 0.004, z0 - 0.012]), np.array([0, CY + 0.004, z0 + 0.04])], [0.128, 0.128], [0.141, 0.141], n=40, mat=b, name="hat_band", parent=g, cap=True)
    ellipsoid((0, CY + 0.004, z0 + 0.335), (0.108, 0.118, 0.012), n=36, m=8, mat=a, name="hat_top", parent=g)
    return g


# ---------------------------------------------------------------- astronautka
def astro_outfit(root, d, M):
    g = node("slot_outfit", root)
    a, b = M["outfit_a"], M["outfit_b"]
    zs = np.linspace(0.90, 1.58, 90)
    R = torso_rows(zs, 0.024)
    ring_mesh(R, True, lambda c: c[2] < 1.585, (0.1, 0.1), "suit", a, g)
    # pás, segmenty a límec
    for z0, z1, mm in ((1.13, 1.18, b), (1.45, 1.48, b), (0.99, 1.02, b)):
        ring_mesh(torso_rows(np.linspace(z0, z1, 5), 0.030), True, None, (0.1, 0.1), "band", mm, g)
    closed_tube(g, ring_path((0, 0.009), 0.074, 0.069, 1.600, 40), 0.014, M["silver"], 8, "neck_ring")
    for s in (-1, 1):
        sleeve(g, s, 0, 11, 0.020, a, "suit_sleeve")
        ellipsoid((s * 0.167, 0.0, 1.505), (0.066, 0.062, 0.068), n=22, m=14, mat=a, name="suit_shoulder", parent=g)
        path, rad = arm_geo(s)
        for i in (5, 7):
            tube(path[i : i + 2], rad[i : i + 2] + 0.026, (rad[i : i + 2] + 0.026) * 0.97, n=22, mat=b, name="joint", parent=g, cap=True)
        hp, dd = hand_point(s)
        ellipsoid(hp + np.array([0, 0, -0.005]), (0.040, 0.030, 0.062), n=20, m=14, mat=M["suit_glove"], name="glove", parent=g)
        tube(path[10:12], rad[10:12] + 0.028, (rad[10:12] + 0.028) * 0.97, n=22, mat=M["silver"], name="glove_ring", parent=g, cap=True)
        leg_sleeve(g, s, 0, 15, 0.0165, a, "suit_leg")
        pl, wl, tl = leg_geo(s)
        ellipsoid(pl[8] + np.array([0, -(tl[8] + 0.012), 0]), (0.038, 0.014, 0.046), n=14, m=10, mat=b, name="knee_pad", parent=g)
        tube(pl[13:15], wl[13:15] + 0.024, tl[13:15] + 0.024, n=26, mat=M["silver"], name="ankle_ring", parent=g, cap=True)
    # panel s tlačítky a displejem, nášivky
    box_c = np.array([0.0, -0.119, 1.250])
    ellipsoid(box_c, (0.060, 0.012, 0.048), n=16, m=10, mat=b, name="panel", parent=g)
    ellipsoid(box_c + np.array([-0.020, -0.011, 0.012]), (0.022, 0.003, 0.016), n=12, m=8, mat=M["screen"], name="screen", parent=g)
    for k, col in enumerate(("button_r", "button_g", "button_y")):
        ellipsoid(box_c + np.array([-0.025 + 0.025 * k, -0.011, -0.022]), (0.0075, 0.0045, 0.0075), n=10, m=8, mat=M[col], name="btn", parent=g)
    # vlajka na rameni
    fl = np.array([[0.215 + 0.05 * u, -0.012 + 0.0, 1.43 + 0.032 * v] for v in (0, 1) for u in (0, 1)])
    sh = ring_mesh(np.array([[[0.150 - 0.034 * u, -0.012 - 0.05 * u * 0 - 0.060, 1.535 - 0.0 + 0.042 * 0] for u in (0, 1)] for v in (0, 1)]) * 0 + np.array([[[-0.138, -0.078, 1.530], [-0.138, -0.078, 1.570]], [[-0.100, -0.092, 1.530], [-0.100, -0.092, 1.570]]]), False, None, (0.05, 0.05), "flag", M["flag"], g) if False else None
    # batoh
    pack = ellipsoid((0, 0.152, 1.265), (0.108, 0.060, 0.178), n=26, m=16, mat=M["suit_pack"], name="backpack", parent=g)
    for s in (-1, 1):
        tube(catmull([np.array([s * 0.05, 0.095, 1.38]), np.array([s * 0.095, 0.02, 1.45]), np.array([s * 0.07, -0.085, 1.34]), np.array([s * 0.045, -0.115, 1.285])], 14), 0.008, 0.008, n=8, mat=M["silver"], name="hose", parent=g, cap=True)
    return g


def astro_shoes(root, d, M):
    g = node("slot_shoes", root)
    b = M["shoes_b"]
    for s in (-1, 1):
        info = foot_shell(g, s, "moon", M)
        path, wid, thk = leg_geo(s)
        for idx in (12, 13):
            tube(path[idx : idx + 2], wid[idx : idx + 2] + 0.025, thk[idx : idx + 2] + 0.025, n=28, mat=b, name="boot_ring", parent=g, cap=True)
    return g


def astro_accessory(root, d, M):
    g = node("slot_accessory", root)
    c = np.array([-0.075, -0.1065 - 0.018, 1.405])
    ellipsoid(c, (0.036, 0.004, 0.036), n=26, m=12, mat=M["gold"], name="patch", parent=g)
    ellipsoid(c + np.array([0, -0.003, 0]), (0.030, 0.0025, 0.030), n=26, m=10, mat=M["accessory_a"], name="patch_in", parent=g)
    star(g, c + np.array([0, -0.0055, 0]), 0.026, M["gold"], depth=0.003)
    return g


def astro_topper(root, d, M):
    g = node("slot_topper", root)
    glass, b = M["topper_a"], M["topper_b"]
    C = np.array([0.0, CY + 0.008, CZ + 0.012])
    ellipsoid(C, (0.205, 0.215, 0.215), n=56, m=32, mat=glass, name="helmet_glass", parent=g)
    # zlatý odrazivý štít v horní polovině přední strany
    sphere_axis(C, 0.2065, n=36, m=14, a0=0.0, a1=1.0, mat=M["visor"], name="visor", parent=g)
    ring_pts = ring_path((0, CY + 0.012), 0.098, 0.100, 1.620, 44)
    closed_tube(g, ring_pts, 0.018, b, 8, "helmet_ring")
    for s in (-1, 1):
        ellipsoid((s * 0.200, CY + 0.012, CZ + 0.02), (0.030, 0.040, 0.030), n=14, m=10, mat=b, name="helmet_lamp", parent=g)
        ellipsoid((s * 0.226, CY + 0.012, CZ + 0.02), (0.008, 0.026, 0.026), n=14, m=10, mat=M["screen"], name="helmet_light", parent=g)
    return g
