"""Vlasy z jednotlivých pramenů: lebeční čepice, záclona vzadu a stovky zploštělých pramenů se zvlněním a tenčením ke konci."""
from panenky_body import *  # noqa: F401,F403

LAY = np.random.default_rng(11)


def surf(th, ph, off):
    return hs(head_points(np.asarray(th, dtype=float), np.asarray(ph, dtype=float), off))


def surf_normal(th, ph, off):
    p = surf(th, ph, off)
    q = surf(th, ph, off + 0.01)
    n = q - p
    return n / (np.linalg.norm(n, axis=-1, keepdims=True) + 1e-9)


def hairline(th):
    a = np.abs(((np.asarray(th) + math.pi) % (2 * math.pi)) - math.pi)
    return np.maximum(0.80 - 1.15 * smooth(0.25, 1.55, a) - 0.25 * smooth(1.6, 2.6, a), -0.55)


def strand_texture(name="hair_strand.png"):
    """Hladký pramen z animovaného filmu: jemné proužky, měkký lesklý pás a ztmavení u kořene."""
    W, H = 128, 256
    rng = np.random.default_rng(4)
    u = (np.arange(W)[None, :] + 0.5) / W
    v = (np.arange(H)[:, None] + 0.5) / H
    ridges = 0.93 + 0.045 * np.sin(u * 2 * math.pi * 9 + rng.random() * 6) + 0.025 * np.sin(u * 2 * math.pi * 23 + 2)
    band = 1.0 + 0.30 * np.exp(-((u - 0.34) / 0.13) ** 2) + 0.10 * np.exp(-((u - 0.74) / 0.10) ** 2)
    edge = 0.80 + 0.20 * smooth(0.0, 0.18, u) * smooth(1.0, 0.82, u)
    along = 0.74 + 0.26 * smooth(0.0, 0.30, v) + 0.10 * np.exp(-((v - 0.55) / 0.2) ** 2)
    arr = np.clip(ridges * band * edge * along, 0, 1.3) / 1.3 * 255
    return save_png(np.stack([arr, arr, arr], axis=-1), name)


def avoid_body(P):
    """Posune bod vlasu mimo trup (ramena, hruď, záda) — vlasy leží na těle, ne v něm."""
    P = np.array(P, dtype=float)
    # nadýchané rukávy (princeznovské šaty) i ramínka: vlasy se jim vyhnou, ať jimi neprorůstají
    for sx in (-1, 1):
        c = np.array([sx * 0.176, 0.0, 1.492])
        rad = np.array([0.078, 0.074, 0.062]) + 0.010
        d = (P - c) / rad
        r2 = np.einsum("ij,ij->i", d, d)
        inside = r2 < 1.0
        if inside.any():
            d[inside] /= np.sqrt(r2[inside])[:, None]
            P[inside] = c + d[inside] * rad * 1.01
    z = P[:, 2]
    low = z < 1.66
    if not low.any():
        return P
    rx, ry, cy = torso_profile(np.clip(z, 0.90, 1.68)).T
    for i in np.where(low)[0]:
        x, y = P[i, 0], P[i, 1]
        e = ((x / (rx[i] + 0.016)) ** 2 + ((y - cy[i]) / (ry[i] + 0.016)) ** 2)
        if e < 1.0:
            ang = math.atan2((y - cy[i]) / (ry[i] + 0.016), x / (rx[i] + 0.016))
            P[i, 0] = math.cos(ang) * (rx[i] + 0.016) * 1.02
            P[i, 1] = cy[i] + math.sin(ang) * (ry[i] + 0.016) * 1.02
    return P


def lock(g, path, w, t, mat, n0=None, taper=0.25, wave=0.0, wave_f=2.0, phase=0.0, name="lock"):
    P = np.asarray(path, dtype=float)
    k = len(P)
    s = np.linspace(0, 1, k)
    wid = w * (1 - (1 - taper) * smooth(0.55, 1.0, s) * 0 ) * (1 - 0.85 * smooth(0.6, 1.0, s))
    wid = np.maximum(wid * (0.30 + 0.70 * smooth(0.0, 0.22, s)), 0.0012)
    thk = np.maximum(t * (1 - 0.6 * smooth(0.7, 1.0, s)), 0.0008)
    if wave:
        T, N, B = frames(P, n0)
        P = P + N * (wave * np.sin(s * wave_f * 2 * math.pi + phase) * smooth(0.0, 0.4, s))[:, None]
    return tube(P, wid, thk, n=8, mat=mat, name=name, parent=g, cap=True, power=1.7, n0=n0)


def hang_from(E, nrm, length, steps, side_out=0.012, wave=0.0, front_bias=0.0, curl=0.0, z_floor=0.5):
    """Prameny padají od konce pružiny po hlavě: dolů, mírně ven a po těle."""
    pts = []
    out = np.array([E[0], E[1] - CY, 0.0])
    out /= np.linalg.norm(out) + 1e-9
    for k in range(1, steps + 1):
        u = k / steps
        p = E + np.array([0, 0, -length * u]) + out * side_out * math.sin(u * math.pi * 0.7) + np.array([0, -front_bias * u, 0])
        p = p + (-out) * curl * u * u
        pts.append(p)
    return np.array(pts)


def build_hair(root, doll, mats, name=None):
    kind, color = doll["hair"]
    g = node(name or "slot_hair", root)
    hm, rootm = mats["hair"], mats["hair_root"]
    rng = np.random.default_rng(abs(hash(doll["id"])) % 1000)
    # --- lebeční čepice
    n, m = 72, 22
    th = math.pi + np.arange(n) * 2 * math.pi / n
    lo = hairline(th)
    hi = math.pi / 2 - 0.035
    R = []
    for j in range(m):
        t = j / (m - 1)
        R.append(surf(th, lo + (hi - lo) * t, 0.0045 + 0.004 * (1 - t) * 0))
    R = np.array(R)
    V, F, UV = ring_grid(R, True, cap1=surf(np.array([0.0]), np.array([math.pi / 2]), 0.0045)[0])
    make_mesh("hair_cap", V, F, rootm, UV, g)
    long_kinds = ("long", "bob", "curly")
    z_end = {"long": 1.26, "bob": 1.60, "curly": 1.36, "pony": 1.20, "bun": 1.7, "braids": 1.0}[kind]
    # --- záclona za hlavou (výplň mezi prameny)
    if False:
        zs = np.linspace(1.80, z_end + 0.02, 18)
        arc = np.linspace(math.radians(62), math.radians(298), 40)  # kolem zadní strany (0 = vpředu)
        rows = []
        for z in zs:
            u = (1.80 - z) / max(1.80 - z_end, 0.1)
            if kind == "bob":
                rho_x, rho_y = 0.116 * HS + 0.012 + 0.012 * math.sin(u * math.pi), 0.128 * HS + 0.014 + 0.012 * math.sin(u * math.pi)
            else:
                rho_x, rho_y = 0.116 * HS + 0.02 + 0.02 * math.sin(min(u * 1.2, 1) * math.pi * 0.6) * 0, 0.128 * HS + 0.012 + 0.018 * u
            row = np.stack([rho_x * np.sin(arc), CY + 0.02 - rho_y * np.cos(arc) * (1 if True else 1), np.full_like(arc, z)], axis=1)
            row = avoid_body(row)
            rows.append(row)
        V, F, UV = ring_grid(np.array(rows), False)
        make_mesh("hair_back", V, F, rootm, UV, g)
    # --- prameny
    streak = hm
    N = {"long": 170, "bob": 130, "curly": 100, "pony": 100, "bun": 90, "braids": 90}[kind]
    for i in range(N):
        thr = rng.uniform(0, 2 * math.pi)
        fronty = abs(((thr + math.pi) % (2 * math.pi)) - math.pi)  # 0 = vpředu
        ph0 = math.pi / 2 - 0.09 - rng.uniform(0.0, 0.16)  # všechny prameny vyrůstají z temene (cop), žádné useknuté konce na lebce
        # česání po lebce: vpředu přes čelo na stranu, jinak po poledníku dolů
        side = 1 if math.sin(thr) > 0 else -1
        if rng.random() < 0.0:
            side = -side
        th1 = thr
        ph1 = hairline(np.array([thr]))[0] - 0.1
        sw = 0.0
        if fronty < 1.25:
            sw = side * (1.30 - fronty + rng.uniform(0.0, 0.35))
            if kind in ("pony", "bun", "braids"):
                sw = side * (0.55 - 0.3 * fronty + rng.uniform(0.0, 0.3)) if fronty < 0.9 else 0.0
            th1 = thr + sw
            ph1 = rng.uniform(0.30, 0.58) if kind not in ("pony", "bun", "braids") else rng.uniform(0.55, 1.0)
        elif kind in ("pony", "bun"):
            ph1 = rng.uniform(0.9, 1.4)  # sbíhají do vrchu
        steps = 13
        s = np.linspace(0, 1, steps)
        ease = s ** 1.15
        THp = thr + (th1 - thr) * ease
        PHp = ph0 + (ph1 - ph0) * s
        off = rng.uniform(0.006, 0.022) * (0.7 + 0.8 * smooth(0.2, 1.3, PHp))
        P = surf(THp, PHp, off)
        nrm = surf_normal(THp, PHp, off)
        end = P[-1]
        n_end = nrm[-1]
        if kind in ("pony", "bun"):
            # prameny sbíhají do úponu
            anchor = np.array([rng.normal(0, 0.008), CY + (0.092 if kind == "pony" else 0.015) * HS + rng.normal(0, 0.004), CZ + HC * HS * (0.97 if kind == "pony" else 1.02) + rng.normal(0, 0.003)])
            P = np.concatenate([P[: steps - 3], np.array([P[steps - 3] * 0.45 + anchor * 0.55, P[steps - 3] * 0.15 + anchor * 0.85, anchor])])
            if kind == "pony":
                L = rng.uniform(0.38, 0.62)
                tail = np.array([anchor + np.array([rng.normal(0, 0.018) * (k / 8), 0.012 * (k / 8) + 0.03 * math.sin(k / 8 * 2.4), -L * k / 8]) for k in range(1, 9)])
                tail[:, 0] += 0.014 * np.sin(np.linspace(0, 3.3, 8) + rng.uniform(0, 6))
                P = np.concatenate([P, tail])
            else:
                continue
        elif kind == "braids":
            tail_anchor = np.array([side * (0.108 * HS + 0.01), 0.045, 1.70])
            P = np.concatenate([P[: steps - 3], np.array([P[steps - 3] * 0.4 + tail_anchor * 0.6, tail_anchor])])
            continue
        else:
            L = {"long": rng.uniform(0.40, 0.56), "bob": rng.uniform(0.17, 0.24), "curly": rng.uniform(0.32, 0.46)}[kind]
            if fronty < 1.0 and kind != "bob":
                L *= 0.9
            hang = hang_from(end, n_end, L, 10, side_out=0.02 + 0.028 * rng.random(), front_bias=0.0, curl=0.02 if kind == "bob" else 0.0)
            if kind in ("curly",):
                kk = np.arange(len(hang))
                ang = kk * 1.4 + rng.uniform(0, 6)
                hang = hang + np.stack([0.016 * np.cos(ang), 0.016 * np.sin(ang), 0.0 * ang], axis=1) * (kk / len(hang))[:, None]
            hang[:, 2] = np.maximum(hang[:, 2], z_end - 0.1)
            hang = avoid_body(hang)
            # jedna hladká křivka: po lebce, přes ohyb u spánku a dolů (žádný ostrý zlom mezi částmi)
            ctrl = np.concatenate([P[::3], P[-1:] if (len(P) - 1) % 3 else P[:0], hang[::2], hang[-1:]])
            P = catmull(ctrl, 22)
        T0 = P[1] - P[0]
        n0 = np.cross(T0, nrm[0])
        w = rng.uniform(0.032, 0.052) * (1.2 if kind == "curly" else 1.0)
        t = 0.0060 + 0.004 * rng.random()
        lock(g, P, w, t, streak, n0=n0, wave=rng.uniform(0.0, 0.006 if kind != "curly" else 0.0) * (1 if kind in ("long", "bob") else 0), wave_f=rng.uniform(1.5, 2.8), phase=rng.uniform(0, 6))
    # --- konec: gumička / drdol / copy
    if kind == "pony":
        anchor = np.array([0, CY + 0.092 * HS, CZ + HC * HS * 0.97])
        ring_t = tube([anchor + np.array([0, 0, 0.012]), anchor + np.array([0, 0, -0.012])], [0.034 * HR, 0.034 * HR], [0.026 * HR, 0.026 * HR], n=16, mat=mats["accessory_a"], name="tie", parent=g, cap=True)
    if kind == "bun":
        A = np.array([0.0, CY + 0.012, CZ + HC * HS * 1.10])
        for i in range(90):
            a0 = rng.uniform(0, 2 * math.pi)
            turns = rng.uniform(0.7, 1.5)
            pts = []
            for k in range(14):
                u = k / 13
                a = a0 + turns * 2 * math.pi * u
                rr = 0.052 * HR * (0.55 + 0.45 * math.sin(u * math.pi)) * rng.uniform(0.9, 1.1)
                zz = A[2] + 0.04 * math.cos(u * math.pi + a0 * 0.3) * 0.0 + rng.uniform(-0.01, 0.01) + 0.05 * (math.sin(a) * 0.5)
                pts.append([A[0] + rr * math.cos(a), A[1] + rr * math.sin(a) * 0.9, zz + 0.012 * math.sin(u * math.pi) * 2])
            lock(g, np.array(pts), rng.uniform(0.020, 0.030), 0.006, streak, n0=np.array([0, 0, 1.0]), taper=0.3)
        tube([A + np.array([0, 0, -0.03]), A + np.array([0, 0, -0.04])], [0.058 * HR, 0.058 * HR], [0.052 * HR, 0.052 * HR], n=20, mat=mats["accessory_a"], name="tie", parent=g, cap=True)
    if kind == "braids":
        for side in (-1, 1):
            a0 = np.array([side * (0.108 * HS + 0.012), 0.045, 1.70])
            for stand in range(3):
                pts = []
                for k in range(26):
                    u = k / 25
                    cx = a0[0] + side * 0.018 * u + 0.008 * math.sin(u * 4.0)
                    z = a0[2] - 0.55 * u
                    ph = stand * 2.094 + u * 24
                    pts.append([cx + 0.0125 * math.cos(ph) * (1 - 0.35 * u), a0[1] + 0.0125 * math.sin(ph) * (1 - 0.35 * u) + 0.03 * u * 0, z])
                pts = avoid_body(np.array(pts))
                tube(pts, 0.0125 * (1 - 0.4 * np.linspace(0, 1, 26) ** 2), 0.0125 * (1 - 0.4 * np.linspace(0, 1, 26) ** 2), n=8, mat=hm, name="braid", parent=g, cap=True)
            tube([a0 + np.array([0, 0, -0.55]), a0 + np.array([0.01 * side, 0, -0.575])], [0.020, 0.018], [0.018, 0.016], n=12, mat=mats["accessory_a"], name="braid_tie", parent=g, cap=True)
    return g
