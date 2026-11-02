"""Obchod a kolo štěstí: pouťové kolo (disk, popředí s žárovkami, stojan) a stánky trhu.
Spuštění: python obchod.py -- kolo_disk | kolo_predni | kolo_stojan | stanky ...   (každý job v samostatném procesu)
Kolo se kreslí zepředu (kamera míří podél +y, osa kola je y), geometrie disku sedí na web (WHEEL_LABEL_RADIUS).
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *
from unikovky import empty, child, rise
import bmesh

M = lambda n, c, **k: material(n, c, **k)
TAU = math.tau
PRIZE_COLORS = ["#3248f0", "#ff5a3c", "#ffc933", "#17a864", "#29a3ff", "#9b5cf0"] * 2  # = WHEEL_PRIZES (12 políček)
N = len(PRIZE_COLORS)
GOLD = lambda n="g": M(n, "#ffc933", roughness=0.22, metallic=1.0)


def front_cam(name, w, h, ortho, cz=0.0, cx=0.0, frames=1, samples=96):
    sc = reset(w, h, frames, samples=samples, name=name, world=("#ffeed8", 0.55))
    add_camera((cx, -14, cz), (cx, 0, cz), ortho_scale=ortho)
    add_sun((math.radians(62), math.radians(0), math.radians(-24)), energy=3.0)
    add_area((-3, -6, 4), (0, 0, 0), energy=300, size=6, color="#fff1e2")
    add_area((4, -5, -1), (0, 0, 0), energy=60, size=5, color="#cfe0ff")
    return sc


def sector(r0, r1, a0, a1, y0, y1, mat, n=14, name="seg"):
    """Mezikruží (výseč) v rovině x–z, úhly po směru hodin od vrchu, tloušťka od y0 do y1."""
    vs, fs = [], []
    angs = [a0 + (a1 - a0) * k / n for k in range(n + 1)]
    for y in (y0, y1):
        for r in (r0, r1):
            for a in angs:
                vs.append((r * math.sin(a), y, r * math.cos(a)))
    m = n + 1

    def idx(layer, ring, k):
        return (layer * 2 + ring) * m + k

    for k in range(n):
        for layer, flip in ((0, True), (1, False)):  # přední a zadní plocha
            f = (idx(layer, 0, k), idx(layer, 1, k), idx(layer, 1, k + 1), idx(layer, 0, k + 1))
            fs.append(f[::-1] if flip else f)
        for ring in (0, 1):  # vnitřní a vnější stěna
            f = (idx(0, ring, k), idx(0, ring, k + 1), idx(1, ring, k + 1), idx(1, ring, k))
            fs.append(f if ring else f[::-1])
    for k in (0, n):  # boky výseče
        f = (idx(0, 0, k), idx(0, 1, k), idx(1, 1, k), idx(1, 0, k))
        fs.append(f if k else f[::-1])
    o = mesh_obj(name, vs, fs, mat)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return o


def star(r_out, r_in, mat, y, name="st", rot=0.0, thick=0.04):
    """Plochá pěticípá hvězda v rovině x–z s tloušťkou."""
    vs, fs = [], []
    pts = []
    for k in range(10):
        a = rot + k * math.pi / 5
        r = r_out if k % 2 == 0 else r_in
        pts.append((r * math.sin(a), r * math.cos(a)))
    for yy in (y, y + thick):
        for (x, z) in pts:
            vs.append((x, yy, z))
        vs.append((0, yy, 0))
    for layer in (0, 1):
        base = layer * 11
        for k in range(10):
            f = (base + 10, base + k, base + (k + 1) % 10)
            fs.append(f if layer else f[::-1])
    for k in range(10):
        a, b = k, (k + 1) % 10
        fs.append((a, b, b + 11, a + 11))
    o = mesh_obj(name, vs, fs, mat)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return o


def X(o, rot=(math.radians(90), 0, 0)):
    o.rotation_euler = rot
    return o


# ---------------------------------------------------------------- Disk (otáčí se na webu)
def disk_parts(gold, tag="kd"):
    """Postaví disk a vrátí pro každé políčko seznam objektů (výseč, lem, tečky, ráfek, kolík) a objekty středu."""
    groups = []
    for i, c in enumerate(PRIZE_COLORS):
        a0, a1 = i * TAU / N + 0.01, (i + 1) * TAU / N - 0.01
        mid = (a0 + a1) / 2
        g = [sector(0.19, 0.93, a0, a1, -0.05, 0.05, M("%s_s%d" % (tag, i), c, roughness=0.18), name="seg%d" % i),
             sector(0.80, 0.93, a0 + 0.025, a1 - 0.025, -0.054, 0.05, M("%s_l%d" % (tag, i), c, roughness=0.12, metallic=0.2), name="lem%d" % i),
             sector(0.93, 1.03, a0 - 0.01, a1 + 0.01, -0.07, 0.07, gold, name="rim%d" % i)]
        for d in (-0.35, 0, 0.35):
            aa = mid + d * (a1 - a0) * 0.6
            g.append(sphere((0.86 * math.sin(aa), -0.06, 0.86 * math.cos(aa)), 0.018, M("%s_d" % tag, "#fff7d0", roughness=0.2), seg=8, rings=6))
        a = i * TAU / N
        g.append(bar((0.2 * math.sin(a), -0.045, 0.2 * math.cos(a)), (0.95 * math.sin(a), -0.045, 0.95 * math.cos(a)), 0.014, gold, verts=8))
        g.append(sphere((1.0 * math.sin(a), -0.08, 1.0 * math.cos(a)), 0.045, GOLD("%s_pg" % tag), seg=12, rings=8))
        groups.append((mid, g))
    hub = [X(torus((0, 0, 0), 0.2, 0.035, gold)), sphere((0, -0.05, 0), 0.19, M("%s_hub" % tag, "#ffffff", roughness=0.25), scale=(1, 0.25, 1), seg=24, rings=10)]
    return groups, hub


def kolo_disk():
    front_cam("obchod_kolo_disk", 1024, 1024, 2.45, samples=128)
    disk_parts(GOLD("kd_g"))
    run(lambda t: None, "obchod_kolo_disk")


# ---------------------------------------------------------------- Rozpad kola: výseče se rozletí a zmizí
def kolo_rozpad():
    front_cam("obchod_kolo_rozpad", 640, 640, 4.0, frames=20, samples=40)
    groups, hub = disk_parts(GOLD("kr_g"), "kr")
    pivots = []
    for mid, g in groups:
        piv = empty()
        piv.location = (0, 0, 0)
        for o in g:
            child(o, piv)
        pivots.append((mid, piv))
    hub_piv = empty()
    for o in hub:
        child(o, hub_piv)
    sparks = [star(0.09, 0.04, glow("kr_sp%d" % k, "#ffe27a", 6.0), -0.2, "sp%d" % k, rot=0.5 * k, thick=0.01) for k in range(18)]

    def ease(x):
        return 1 - (1 - min(1.0, max(0.0, x))) ** 3

    @anim
    def _rozpad(t):
        k = ease((t - 0.1) / 0.8)
        shrink = max(0.0, (t - 0.8) / 0.2)
        for i, (mid, piv) in enumerate(pivots):
            d = 2.4 * k
            piv.location = (d * math.sin(mid), -0.3 * k, d * math.cos(mid))
            piv.rotation_euler = (math.radians(18) * k * (1 if i % 2 else -1), math.radians(25) * k * (1 if i % 3 else -1), math.radians(70) * k * (-1 if i % 2 else 1))
            sc = max(0.001, 1.0 - shrink)
            piv.scale = (sc, sc, sc)
        hs = max(0.001, 1.0 - max(0.0, (t - 0.3) / 0.4) ** 1.5)
        hub_piv.scale = (hs, hs, hs)
        for i, sp in enumerate(sparks):
            a = i * TAU / len(sparks) + 0.3
            q = max(0.0, (t - 0.12) / 0.8)
            r = 0.3 + 2.0 * ease(q)
            s_ = max(0.0, math.sin(math.pi * min(1.0, q))) * 1.4
            sp.location = (r * math.sin(a), -0.2, r * math.cos(a))
            sp.scale = (s_, s_, s_)

    run(lambda t: None, "obchod_kolo_rozpad")


# ---------------------------------------------------------------- Ikony výher (místo emoji na kole)
def ikona_cam(name, ortho=2.6):
    front_cam(name, 512, 512, ortho, samples=160)


def ell(loc, r, sc, mat, rot=(0, 0, 0), seg=20, rings=12):
    """Elipsoid (lístek, vlas, křídlo…) s rotací."""
    o = sphere(loc, r, mat, scale=sc, seg=seg, rings=rings)
    o.rotation_euler = rot
    return o


def ikona_titul():
    """Medaile: vroubkovaný zlatý ráfek, smaltovaná hvězda, vavřínový věnec, stuha s výřezem a očko."""
    ikona_cam("obchod_ikona_titul")
    gold, gold2 = GOLD("it_g"), M("it_g2", "#ffe27a", roughness=0.15, metallic=1.0)
    bronze = M("it_br", "#b97a1c", roughness=0.3, metallic=1.0)
    blue, red = M("it_b", "#3248f0", roughness=0.35), M("it_r", "#e8453c", roughness=0.35)
    cz = -0.22
    # stuha: dva pruhy se zlatým lemem a výřezem do V
    for sx, mat in ((-1, blue), (1, red)):
        box((sx * 0.3, 0.06, 0.62 + cz * 0.2), (0.4, 0.05, 1.15), mat, rot=(0, math.radians(sx * 20), 0), bevel=0.012)
        box((sx * 0.3 + sx * 0.0, 0.03, 0.62 + cz * 0.2), (0.05, 0.05, 1.12), gold2, rot=(0, math.radians(sx * 20), 0), bevel=0.005)
    # očko a kroužek
    X(torus((0, 0.0, 0.58), 0.13, 0.04, gold))
    # medaile: ráfek, vroubky, vnitřní disky
    X(cyl((0, 0.02, cz), 0.66, 0.13, bronze, verts=64, bevel=0.01))
    X(torus((0, -0.06, cz), 0.62, 0.05, gold))
    for k in range(28):
        a = k * TAU / 28
        sphere((0.69 * math.sin(a), -0.05, cz + 0.69 * math.cos(a)), 0.034, gold2, seg=10, rings=8)
    X(cyl((0, -0.07, cz), 0.52, 0.04, gold, verts=64))
    X(torus((0, -0.1, cz), 0.5, 0.018, gold2))
    X(cyl((0, -0.1, cz), 0.44, 0.03, M("it_en", "#2b3fd0", roughness=0.15), verts=64))
    # vavřínový věnec
    leaf = M("it_lf", "#ffe27a", roughness=0.2, metallic=1.0)
    for sx in (-1, 1):
        for k in range(8):
            a = 0.35 + k * 0.2
            r = 0.45
            x, z = sx * r * math.sin(a), cz - r * math.cos(a)
            th = math.atan2(sx * math.cos(a), math.sin(a))
            ell((x, -0.13, z), 0.075, (0.5, 0.18, 1.0), leaf, rot=(0, th + sx * 0.5, 0), seg=14, rings=8)
    # hvězda s lemem a drobné jiskry
    star(0.34, 0.15, gold2, -0.14, "medstar0", thick=0.07).location = (0, 0, cz + 0.02)
    star(0.27, 0.115, M("it_st", "#ff5a3c", roughness=0.2), -0.18, "medstar", thick=0.05).location = (0, 0, cz + 0.02)
    sphere((0, -0.22, cz + 0.02), 0.05, M("it_gem", "#ffffff", roughness=0.05), seg=14, rings=10)
    run(lambda t: None, "obchod_ikona_titul")


def ikona_avatar():
    """Detailní postavička-víla: vlasy s ofinou a drdoly, květinová korunka, oči s odlesky, uši, šaty, křídla se žilkami, hůlka."""
    ikona_cam("obchod_ikona_avatar")
    skin, skin2 = M("ia_sk", "#ffd2b4", roughness=0.45, subsurface=0.2), M("ia_sk2", "#ffb89a", roughness=0.5)
    hair, hair2 = M("ia_h", "#ff6fae", roughness=0.35), M("ia_h2", "#ff9cc8", roughness=0.3)
    wing, vein = M("ia_w", "#cdefff", roughness=0.1, metallic=0.15), M("ia_v", "#8fcdf0", roughness=0.3)
    dress, dress2 = M("ia_dr", "#9b5cf0", roughness=0.4), M("ia_dr2", "#c9a8ff", roughness=0.3)
    gold = GOLD("ia_g")
    # křídla: dva páry se žilkami
    for sx in (-1, 1):
        ell((sx * 0.72, 0.18, 0.3), 0.55, (0.55, 0.06, 1.0), wing, (0, math.radians(sx * 26), 0), seg=32, rings=18)
        ell((sx * 0.58, 0.19, -0.3), 0.36, (0.55, 0.06, 0.95), wing, (0, math.radians(-sx * 24), 0), seg=28, rings=16)
        for k in range(4):
            bar((sx * 0.35, 0.1, 0.1), (sx * (0.7 + 0.08 * k), 0.1, 0.6 - 0.18 * k - 0.1), 0.012, vein, verts=6)
        ell((sx * 0.9, 0.12, 0.2), 0.05, (1, 0.5, 1), glow("ia_sp%d" % sx, "#ffffff", 6.0), seg=10, rings=8)
    # tělo: šaty s volánem a šerpou
    ell((0, 0.05, -0.62), 0.46, (1.0, 0.6, 0.85), dress, seg=32, rings=18)
    ell((0, -0.0, -0.84), 0.5, (1.05, 0.55, 0.3), dress2, seg=32, rings=14)
    for k in range(9):
        sphere((-0.48 + k * 0.12, -0.14, -0.9 + 0.03 * math.sin(k * 1.7)), 0.075, dress2, seg=14, rings=10)
    X(torus((0, -0.13, -0.5), 0.33, 0.035, gold))
    ell((0, -0.2, -0.5), 0.07, (1, 0.6, 1), M("ia_gm", "#ff5a3c", roughness=0.2), seg=14, rings=10)
    # krk, hlava, uši
    ell((0, 0.02, -0.36), 0.14, (1, 1, 0.9), skin2)
    ell((0, 0.0, 0.1), 0.5, (1.0, 0.92, 1.0), skin, seg=40, rings=26)
    for sx in (-1, 1):
        ell((sx * 0.5, 0.0, 0.08), 0.09, (0.6, 0.4, 1.2), skin, (0, 0, math.radians(-sx * 20)), seg=14, rings=10)
    # vlasy: zadní objem, ofina, drdoly, pramínky
    ell((0, 0.14, 0.2), 0.58, (1.05, 0.7, 1.0), hair, seg=36, rings=22)
    for k in range(7):
        x = -0.4 + k * 0.133
        ell((x, -0.37, 0.4 - 0.05 * abs(k - 3) ** 1.2 * 0.5), 0.12, (0.62, 0.45, 1.05), hair2 if k % 2 else hair, (0, math.radians((k - 3) * 9), math.radians((k - 3) * -8)), seg=14, rings=10)
    for sx in (-1, 1):
        sphere((sx * 0.5, 0.0, 0.55), 0.2, hair2, seg=20, rings=14)
        sphere((sx * 0.5, -0.12, 0.55), 0.07, M("ia_bow", "#ffffff", roughness=0.3), seg=10, rings=8)
        ell((sx * 0.55, -0.1, -0.02), 0.07, (0.7, 0.6, 2.4), hair, (0, 0, math.radians(sx * 8)), seg=12, rings=8)
    # květinová korunka
    cols = ["#fff2a8", "#ff9aa8", "#7ee0b0", "#ffffff", "#c9b8ff"]
    for k in range(5):
        x = -0.4 + k * 0.2
        z = 0.66 - 0.06 * abs(k - 2) ** 1.5 * 0.35
        for p in range(5):
            pa = p * TAU / 5
            ell((x + 0.055 * math.sin(pa), -0.3, z + 0.055 * math.cos(pa)), 0.032, (1, 0.5, 1), M("ia_p%d" % (k % 5), cols[k], roughness=0.4), seg=10, rings=8)
        sphere((x, -0.32, z), 0.03, M("ia_c", "#ffb020", roughness=0.4), seg=10, rings=8)
    # obličej: oči (bělmo, duha, zornice, odlesk), obočí, nos, pusa, tváře
    for sx in (-1, 1):
        ell((sx * 0.19, -0.44, 0.08), 0.085, (1, 0.35, 1.2), M("ia_ew", "#ffffff", roughness=0.15), seg=16, rings=12)
        ell((sx * 0.19, -0.49, 0.07), 0.062, (1, 0.3, 1.2), M("ia_ei", "#3b6cf0", roughness=0.2), seg=14, rings=10)
        ell((sx * 0.19, -0.52, 0.07), 0.034, (1, 0.3, 1.2), M("ia_ep", "#1a1440", roughness=0.1), seg=12, rings=8)
        sphere((sx * 0.17, -0.55, 0.11), 0.018, glow("ia_eh", "#ffffff", 5.0), seg=8, rings=6)
        bar((sx * 0.29, -0.45, 0.255), (sx * 0.1, -0.46, 0.245), 0.009, M("ia_br", "#c0508a", roughness=0.4), verts=6)
        ell((sx * 0.31, -0.42, -0.06), 0.075, (1, 0.35, 0.65), M("ia_ch", "#ff8fa0", roughness=0.5), seg=12, rings=8)
    ell((0, -0.5, -0.03), 0.03, (1, 0.8, 1), skin2, seg=10, rings=8)
    pts = [(-0.1, -0.12), (-0.05, -0.17), (0.0, -0.185), (0.05, -0.17), (0.1, -0.12)]
    for p, q in zip(pts, pts[1:]):
        bar((p[0], -0.48, p[1]), (q[0], -0.48, q[1]), 0.016, M("ia_m", "#d94a5a", roughness=0.3), verts=8)
    # hůlka se zářící hvězdou a jiskřičky
    bar((0.55, -0.22, -0.9), (0.95, -0.22, -0.05), 0.024, M("ia_wd", "#f2d27a", roughness=0.3, metallic=0.6), verts=10)
    star(0.2, 0.09, gold, -0.28, "wand", thick=0.05).location = (0.95, 0, 0.0)
    star(0.34, 0.12, glow("ia_wg", "#ffe27a", 2.0), -0.14, "wandglow", thick=0.01).location = (0.95, 0, 0.0)
    for (x, z, sc) in ((-0.95, 0.75, 1.0), (-0.85, -0.2, 0.6), (0.7, 0.85, 0.7), (1.1, 0.5, 0.5)):
        star(0.09 * sc * 2, 0.04 * sc * 2, glow("ia_sk%d" % int(x * 10), "#fff7c0", 5.0), -0.3, "sk%d" % int(x * 10 + z * 100), thick=0.01).location = (x, 0, z)
    run(lambda t: None, "obchod_ikona_avatar")


def ikona_ramecek():
    """Zdobený rámeček: zlatý profil, vnitřní lišta, rohové ornamenty, korunka, pasparta a malovaná krajina."""
    ikona_cam("obchod_ikona_ramecek", 3.5)
    gold, gold2 = GOLD("ir_g"), M("ir_g2", "#ffe27a", roughness=0.15, metallic=1.0)
    dk = M("ir_dk", "#8a5a14", roughness=0.35, metallic=1.0)
    W, H = 0.92, 0.78  # polovina vnitřního okna
    # obraz: obloha s přechodem, slunce s paprsky, mraky, tři vrstvy kopců, stromy
    box((0, 0.2, 0), (2 * W + 0.1, 0.04, 2 * H + 0.1), M("ir_sky", "#5ad0ff", roughness=0.5), bevel=0)
    box((0, 0.19, 0.38), (2 * W + 0.1, 0.04, 0.6), M("ir_sky2", "#a8e6ff", roughness=0.5), bevel=0)
    sphere((0.42, 0.16, 0.3), 0.2, glow("ir_sun", "#ffd24d", 1.3), scale=(1, 0.2, 1), seg=24, rings=14)
    for k in range(12):
        a = k * TAU / 12
        bar((0.42 + 0.25 * math.sin(a), 0.14, 0.3 + 0.25 * math.cos(a)), (0.42 + 0.36 * math.sin(a), 0.14, 0.3 + 0.36 * math.cos(a)), 0.012, glow("ir_ry", "#ffe27a", 2.5), verts=6)
    for (x, z, s) in ((-0.5, 0.32, 1.0), (-0.1, 0.5, 0.7)):
        for dx, r in ((-0.1, 0.1), (0, 0.14), (0.12, 0.1)):
            ell((x + dx * s, 0.14, z), r * s, (1, 0.25, 0.8), M("ir_cl", "#ffffff", roughness=0.6), seg=16, rings=10)
    ell((-0.4, 0.12, -0.45), 0.6, (1.1, 0.15, 0.5), M("ir_h3", "#2f8f4a", roughness=0.6), seg=32, rings=16)
    ell((0.45, 0.1, -0.55), 0.6, (1.1, 0.15, 0.5), M("ir_h2", "#3fa752", roughness=0.6), seg=32, rings=16)
    ell((0.0, 0.08, -0.78), 0.8, (1.1, 0.15, 0.35), M("ir_h1", "#58c26a", roughness=0.6), seg=32, rings=16)
    for (x, z, s) in ((-0.55, -0.15, 1.0), (-0.3, -0.25, 0.75), (0.6, -0.3, 0.8)):
        cyl((x, 0.05, z - 0.14 * s), 0.025 * s, 0.2 * s, M("ir_tr", "#7a5636", roughness=0.6), verts=8)
        sphere((x, 0.04, z + 0.02 * s), 0.1 * s, M("ir_lf", "#2f8f4a", roughness=0.5), seg=14, rings=10)
    # pasparta (krémová) a vnitřní lišta
    for (cx, cz, w, h) in ((0, H + 0.06, 2 * W + 0.24, 0.12), (0, -H - 0.06, 2 * W + 0.24, 0.12), (-W - 0.06, 0, 0.12, 2 * H), (W + 0.06, 0, 0.12, 2 * H)):
        box((cx, -0.01, cz), (w, 0.05, h), M("ir_mat", "#fff3d6", roughness=0.7), bevel=0.0)
    # hlavní rám: dvě vrstvy s profilem
    OW, OH = W + 0.3, H + 0.3
    for layer, (g, grow, yy) in enumerate(((gold, 0.0, -0.04), (gold2, -0.11, -0.1))):
        ow, oh, t = OW + grow, OH + grow, 0.2 + grow * 0.4
        for (cx, cz, w, h) in ((0, oh - t / 2, 2 * ow, t), (0, -oh + t / 2, 2 * ow, t), (-ow + t / 2, 0, t, 2 * oh - 2 * t), (ow - t / 2, 0, t, 2 * oh - 2 * t)):
            box((cx, yy - 0.01 * layer * (w > h), cz), (w, 0.1, h), g if layer == 0 else gold2, bevel=0.025)
    for (cx, cz, w, h) in ((0, OH - 0.1, 2 * OW - 0.1, 0.03), (0, -OH + 0.1, 2 * OW - 0.1, 0.03), (-OW + 0.1, 0, 0.03, 2 * OH - 0.3), (OW - 0.1, 0, 0.03, 2 * OH - 0.3)):
        box((cx, -0.17, cz), (w, 0.03, h), dk, bevel=0.0)
    # rohové ornamenty (kulaté rozety s lístky) a korunka nahoře
    for sx in (-1, 1):
        for sz in (-1, 1):
            c = (sx * OW, -0.15, sz * OH)
            sphere(c, 0.17, gold, scale=(1, 0.5, 1), seg=24, rings=14)
            for k in range(8):
                a = k * TAU / 8
                ell((c[0] + 0.15 * math.sin(a), -0.17, c[2] + 0.15 * math.cos(a)), 0.05, (0.7, 0.4, 1.4), gold2, rot=(0, -a, 0), seg=10, rings=8)
            sphere((c[0], -0.2, c[2]), 0.06, M("ir_gem%d%d" % (sx, sz), ["#ff5a3c", "#3248f0"][(sx * sz + 1) // 2], roughness=0.1), seg=14, rings=10)
    ell((0, -0.15, OH + 0.05), 0.28, (1.3, 0.4, 0.7), gold, seg=28, rings=14)
    for k in range(5):
        ell(((k - 2) * 0.15, -0.2, OH + 0.2 - 0.03 * abs(k - 2)), 0.06, (0.8, 0.4, 1.5), gold2, rot=(0, 0, math.radians((k - 2) * -14)), seg=10, rings=8)
    sphere((0, -0.24, OH + 0.12), 0.07, M("ir_gem", "#ff5a3c", roughness=0.1), seg=14, rings=10)
    run(lambda t: None, "obchod_ikona_ramecek")


def ikona_banner():
    """Závěsný prapor: tyč s hlavicemi, šňůra s bambulemi, látka se švy, západ slunce nad mořem s lodí, třepení a cípy."""
    ikona_cam("obchod_ikona_banner", 2.9)
    gold, gold2 = GOLD("ib_g"), M("ib_g2", "#ffe27a", roughness=0.15, metallic=1.0)
    bw, top, bot = 0.82, 0.62, -0.78
    # tyč a hlavice
    cyl((0, -0.02, top + 0.1), 0.045, 2 * bw + 0.45, gold, rot=(0, math.radians(90), 0), verts=20)
    for sx in (-1, 1):
        sphere((sx * (bw + 0.25), -0.02, top + 0.1), 0.085, gold2, seg=16, rings=12)
        cone((sx * (bw + 0.35), -0.02, top + 0.1), 0.05, 0.0, 0.14, gold, verts=12, rot=(0, math.radians(sx * 90), 0))
    # šňůra se smyčkou a bambulemi
    for sx in (-1, 1):
        bar((sx * (bw - 0.1), -0.02, top + 0.1), (0, -0.02, top + 0.42), 0.012, M("ib_cd", "#c58f10", roughness=0.5), verts=6)
    sphere((0, -0.02, top + 0.45), 0.05, gold2, seg=12, rings=8)
    # látka: základ, pásy západu slunce, moře, slunce, loď
    box((0, 0.05, (top + bot) / 2 + 0.05), (2 * bw, 0.04, top - bot), M("ib_bg", "#ff8a4c", roughness=0.55), bevel=0)
    box((0, 0.03, 0.28), (2 * bw, 0.04, 0.26), M("ib_c1", "#ffb35c", roughness=0.55), bevel=0)
    box((0, 0.03, -0.0), (2 * bw, 0.04, 0.3), M("ib_c2", "#ff6f6a", roughness=0.55), bevel=0)
    box((0, 0.03, -0.26), (2 * bw, 0.04, 0.26), M("ib_c3", "#c94a9a", roughness=0.55), bevel=0)
    sphere((0, 0.0, 0.02), 0.32, glow("ib_sun", "#ffd24d", 1.2), scale=(1, 0.15, 1), seg=28, rings=16)
    for k in range(14):
        a = -math.pi / 2 + k * math.pi / 13
        bar((0.34 * math.sin(a), 0.0, 0.02 + 0.34 * math.cos(a)), (0.46 * math.sin(a), 0.0, 0.02 + 0.46 * math.cos(a)), 0.012, glow("ib_ry", "#fff0a0", 2.5), verts=6)
    box((0, 0.0, -0.4), (2 * bw, 0.05, 0.36), M("ib_sea", "#2b3fd0", roughness=0.25), bevel=0)
    for k in range(7):
        ell((-0.66 + k * 0.22, -0.03, -0.28 - 0.0), 0.1, (1, 0.3, 0.35), M("ib_wv", "#5a7cff", roughness=0.25), seg=14, rings=8)
        ell((-0.55 + k * 0.22, -0.03, -0.45), 0.1, (1, 0.3, 0.35), M("ib_wv2", "#3b56e8", roughness=0.25), seg=14, rings=8)
    box((0.05, -0.04, -0.2), (0.2, 0.04, 0.06), M("ib_bt", "#4a2a14", roughness=0.5), bevel=0.01)
    box((0.05, -0.04, -0.07), (0.015, 0.02, 0.2), M("ib_ms", "#4a2a14", roughness=0.5), bevel=0)
    cone((0.12, -0.05, -0.05), 0.09, 0.0, 0.17, M("ib_sl", "#fff6e6", roughness=0.5), verts=3, rot=(0, math.radians(90), 0))
    # obšití: zlatý lem po stranách a kroucené třepení dole
    for sx in (-1, 1):
        box((sx * bw, -0.01, (top + bot) / 2 + 0.05), (0.055, 0.06, top - bot), gold, bevel=0.01)
    box((0, -0.01, top + 0.0), (2 * bw, 0.06, 0.06), gold, bevel=0.01)
    for k in range(9):
        x = -bw + 0.09 + k * ((2 * bw - 0.18) / 8)
        cone((x, -0.02, bot - 0.1), 0.1, 0.0, 0.26, [M("ib_t1", "#ffd84a", roughness=0.4), M("ib_t2", "#e8453c", roughness=0.4)][k % 2], verts=4, rot=(math.radians(180), 0, 0))
        sphere((x, -0.03, bot - 0.26), 0.035, gold2, seg=10, rings=8)
    run(lambda t: None, "obchod_ikona_banner")


# ---------------------------------------------------------------- Popředí kola: žárovky, nába a ručička
def kolo_predni():
    front_cam("obchod_kolo_predni", 512, 512, 2.45, frames=24, samples=48)
    gold = GOLD("kp_g")
    # náboj s hvězdou
    sphere((0, -0.08, 0), 0.2, gold, scale=(1, 0.5, 1), seg=24, rings=14)
    star(0.12, 0.055, M("kp_s", "#ff5a3c", roughness=0.3), -0.2, "hubstar", thick=0.03)
    # ručička (hvězda – klapka) nahoře, míří dolů
    ptr = empty()
    ptr.location = (0, -0.16, 1.08)
    child(cone((0, 0, -0.12), 0.1, 0.0, 0.34, M("kp_p", "#ff3b4a", roughness=0.3), verts=20, rot=(math.radians(180), 0, 0)), ptr)
    child(sphere((0, 0, 0.02), 0.09, gold, seg=14, rings=10), ptr)
    child(sphere((0, -0.05, 0.02), 0.04, M("kp_pw", "#ffffff", roughness=0.3), seg=10, rings=8), ptr)
    # žárovkový prstenec kolem disku
    X(torus((0, -0.01, 0), 1.12, 0.03, gold))
    bulbs = []
    for k in range(24):
        a = k * TAU / 24
        bulbs.append(sphere((1.12 * math.sin(a), -0.06, 1.12 * math.cos(a)), 0.06, glow("kp_b%d" % k, "#fff0b0", 1.0), seg=12, rings=8))
    # drobné blýskání na ráfku (hvězdičky se rozsvítí a zhasnou)
    glints = [star(0.07, 0.03, glow("kp_gl%d" % k, "#ffffff", 8.0), -0.2, "glint%d" % k, rot=0.3 * k, thick=0.01) for k in range(5)]
    gpos = [(0.65, 0.78), (-0.9, 0.5), (0.95, -0.35), (-0.3, -0.95), (0.35, 0.9)]

    @anim
    def _kp(t):
        for i, b in enumerate(bulbs):
            phase = (i / 24 - t) % 1.0
            on = 1.0 if phase < 0.3 else 0.0
            set_glow(b.data.materials[0], 0.5 + 8.0 * on * (1 - phase / 0.3) ** 0.5 if on else 0.4)
        ptr.rotation_euler = (0, 0, 0.0)
        for i, (g, (gx, gz)) in enumerate(zip(glints, gpos)):
            q = (t * 2 + i / 5) % 1.0
            s = max(0.0, math.sin(math.pi * q)) ** 2
            g.location = (gx, 0.0, gz)
            g.scale = (s, s, s)

    run(lambda t: None, "obchod_kolo_predni")


# ---------------------------------------------------------------- Stojan (budka) kolem kola
def kolo_stojan():
    W, H = 900, 860
    OS = 3.8
    CZ = 0.33
    front_cam("obchod_kolo_stojan", W, H, OS, cz=CZ)
    gold = GOLD("ks_g")
    red, white = M("ks_r", "#e8453c", roughness=0.5), M("ks_w", "#fff6e6", roughness=0.5)
    wood, dark = M("ks_wd", "#8a5a34", roughness=0.6), M("ks_dk", "#2b3560", roughness=0.4, metallic=0.5)
    # zadní panel (hvězdičkový) a oblouk
    box((0, 0.5, 0.0), (3.0, 0.12, 3.2), M("ks_back", "#4a3fc4", roughness=0.7), bevel=0.04)
    cyl((0, 0.45, 0.0), 1.4, 0.1, M("ks_back2", "#6a5ae0", roughness=0.6), rot=(math.radians(90), 0, 0), verts=64)
    ray = M("ks_ray", "#8a78f0", roughness=0.7)
    for k in range(12):
        sector(0.3, 1.35, (2 * k) * TAU / 24 + 0.02, (2 * k + 1) * TAU / 24 - 0.02, 0.36, 0.38, ray, name="ray%d" % k).location = (0, 0, 0.0)
    rnd = random.Random(7)
    for k in range(18):
        a = rnd.uniform(0, TAU)
        r = rnd.uniform(1.25, 1.7)
        s = rnd.uniform(0.05, 0.09)
        star(s, s * 0.45, glow("ks_st%d" % k, "#ffe27a", 2.0), 0.38, "bs%d" % k, rot=a, thick=0.02).location = (r * math.sin(a), 0.0, 0.15 + r * math.cos(a) * 0.8)
    # sloupy po stranách s hvězdnými hlavicemi
    for sx in (-1, 1):
        cyl((sx * 1.62, 0.2, 0.2), 0.16, 3.2, striped_material("ks_pil%d" % sx, "#e8453c", "#fff6e6", freq=7, roughness=0.5, axis="Z"), verts=24)
        cyl((sx * 1.62, 0.2, 1.85), 0.22, 0.1, gold, verts=24)
        star(0.28, 0.12, gold, 0.1, "fin%d" % sx, thick=0.1).location = (sx * 1.62, 0.0, 2.05)
        cyl((sx * 1.62, 0.2, -1.4), 0.24, 0.12, gold, verts=24)
    # stříška s volány a žárovkami
    box((0, 0.1, 2.0), (3.7, 0.8, 0.12), red, bevel=0.03)
    for k in range(9):
        x = -1.6 + k * 0.4
        cone((x, -0.28, 1.86), 0.21, 0.0, 0.26, red if k % 2 else white, verts=24, rot=(math.radians(180), 0, 0))
    for k in range(19):
        sphere((-1.7 + k * 0.19, -0.33, 2.07), 0.045, glow("ks_bl%d" % k, "#fff0b0", 3.0), seg=8, rings=6)
    # podstavec: tři stupně se zlatými lištami a šachovnicí
    for i, (w, z, c) in enumerate(((3.7, -1.55, "#2b3560"), (3.25, -1.38, "#3b4a9a"), (2.8, -1.22, "#4a5ac0"))):
        box((0, 0.0, z), (w, 1.0, 0.18), M("ks_pd%d" % i, c, roughness=0.5), bevel=0.04)
        box((0, -0.5, z + 0.07), (w, 0.03, 0.04), gold, bevel=0.005)
    for k in range(7):
        box((-1.2 + k * 0.4, -0.5, -1.22), (0.18, 0.03, 0.12), M("ks_ck%d" % (k % 2), "#fff6e6" if k % 2 else "#ff5a3c", roughness=0.5), bevel=0)
    # držák kola (zlatá osa) a stoličky po stranách
    cyl((0, 0.25, 0.0), 0.28, 0.5, gold, rot=(math.radians(90), 0, 0), verts=24)
    for sx in (-1, 1):
        cyl((sx * 1.2, -0.2, -1.05), 0.2, 0.4, M("ks_pl%d" % sx, "#ff9a3c", roughness=0.5), verts=24)
        sphere((sx * 1.2, -0.2, -0.78), 0.2, M("ks_ba%d" % sx, ["#ff5a7a", "#4ad0ff"][(sx + 1) // 2], roughness=0.3), seg=20, rings=14)
    os.makedirs(os.path.join(OUT, "obchod_kolo_stojan"), exist_ok=True)
    # střed kola na obrázku (podíly) a velikost disku
    cx_frac = 0.5
    cy_frac = 0.5 + CZ / (OS * H / W)
    with open(os.path.join(OUT, "obchod_kolo_stojan", "layout.json"), "w") as fh:
        json.dump({"w": W, "h": H, "cx": cx_frac, "cy": round(cy_frac, 4), "disk": round(2.45 / OS, 4)}, fh)
    run(lambda t: None, "obchod_kolo_stojan")


# ---------------------------------------------------------------- Stánky trhu (balíčky bodů)
def vendor(x, y, z, body, belly, kind="bunny", s=1.0, rot=0.0):
    """Prodavač zvířátko: tělo, hlava, uši (otočné), mávající ruka. Vrací (kořen, levé ucho, pravé ucho, ruka)."""
    root = empty()
    root.location = (x, y, z)
    root.rotation_euler = (0, 0, rot)
    b, bl = M("vd_b" + body, body, roughness=0.8), M("vd_l" + belly, belly, roughness=0.8)
    dk = M("vd_e", "#16132b", roughness=0.4)
    child(sphere((0, 0, 0.2 * s), 0.17 * s, b, scale=(0.95, 0.85, 1.1), seg=18, rings=12), root)
    child(sphere((0, -0.07 * s, 0.17 * s), 0.1 * s, bl, scale=(0.9, 0.5, 1.0), seg=12, rings=8), root)
    child(sphere((0, 0, 0.47 * s), 0.14 * s, b, seg=18, rings=12), root)
    child(sphere((0, -0.12 * s, 0.45 * s), 0.05 * s, bl, scale=(1.1, 0.7, 0.8), seg=10, rings=8), root)
    child(sphere((0, -0.16 * s, 0.46 * s), 0.018 * s, M("vd_n", "#ff7a9a"), seg=8, rings=6), root)
    for dx in (-0.05, 0.05):
        child(sphere((dx * s, -0.125 * s, 0.505 * s), 0.02 * s, dk, seg=8, rings=6), root)
    ears = []
    for side in (-1, 1):
        piv = empty()
        piv.parent = root
        piv.location = (side * 0.07 * s, 0, 0.58 * s)
        if kind == "bunny":
            e = sphere((0, 0, 0.12 * s), 0.045 * s, b, scale=(0.7, 0.45, 3.0), seg=12, rings=8)
        else:
            e = cone((0, 0, 0.07 * s), 0.07 * s, 0.0, 0.16 * s, b, verts=10)
        e.parent = piv
        e.location = (0, 0, 0.12 * s if kind == "bunny" else 0.07 * s)
        ears.append(piv)
    arm = empty()
    arm.parent = root
    arm.location = (0.15 * s, 0, 0.3 * s)
    a = cyl((0, 0, -0.06 * s), 0.035 * s, 0.14 * s, b, verts=10)
    a.parent = arm
    a.location = (0, 0, -0.06 * s)
    if kind == "fox":
        tail = sphere((0, 0.17 * s, 0.1 * s), 0.09 * s, b, scale=(0.7, 1.6, 0.7), seg=12, rings=8)
        tail.parent = root
        child(sphere((0, 0.27 * s, 0.1 * s), 0.05 * s, M("vd_tp", "#ffffff"), seg=8, rings=6), root)
    return root, ears[0], ears[1], arm


def awning(x, y, z, w, d, c1, c2, mat_prefix="aw"):
    """Pruhovaná stříška stánku se zubatým lemem."""
    st = striped_material(mat_prefix, c1, c2, freq=8, roughness=0.55, axis="X")
    box((x, y, z), (w, d, 0.07), st, rot=(0.0, 0.0, 0.0), bevel=0.01)
    n = int(w / 0.18)
    for k in range(n):
        xx = x - w / 2 + (k + 0.5) * w / n
        cone((xx, y - d / 2, z - 0.07), w / n / 2, 0.0, 0.12, M("%s_t%d" % (mat_prefix, k % 2), c1 if k % 2 else c2, roughness=0.55), verts=16, rot=(math.radians(180), 0, 0))


def stanek_mince():
    setup("obchod_stanek_mince", size=448, ortho=4.4, target_z=0.95, world=("#ffe9c9", 0.6))
    plinth("#e2b86a", "#fff0d2")
    wood, gold = M("sm_w", "#a86a38", roughness=0.6), GOLD("sm_g")
    box((0, 0.2, 0.3), (1.5, 0.7, 0.55), wood, bevel=0.03)
    box((0, 0.2, 0.6), (1.6, 0.8, 0.05), M("sm_t", "#ffe8b8", roughness=0.5), bevel=0.01)
    for dx in (-0.7, 0.7):
        bar((dx, -0.1, 0.0), (dx, -0.1, 1.5), 0.03, wood, verts=8)
        bar((dx, 0.5, 0.0), (dx, 0.5, 1.5), 0.03, wood, verts=8)
    awning(0, 0.2, 1.5, 1.7, 0.9, "#ffc933", "#fff6e0", "sm_aw")
    # hromádky mincí
    coin_m = M("sm_c", "#ffc933", roughness=0.25, metallic=1.0)
    for (cx, cy, n) in ((-0.45, 0.05, 6), (0.0, 0.1, 9), (0.45, 0.0, 4)):
        for k in range(n):
            cyl((cx, cy, 0.65 + 0.035 * k), 0.13, 0.03, coin_m, verts=20)
    sparks = [star(0.07, 0.03, glow("sm_sp%d" % k, "#ffffff", 8.0), 0.0, "sp%d" % k, rot=k, thick=0.01) for k in range(6)]
    bunny, bl, br, barm = vendor(-1.05, -0.2, 0.0, "#f7f3ee", "#ffd0dc", "bunny", s=1.4, rot=0.35)
    jar = cyl((-0.55, -0.55, 0.12), 0.16, 0.24, M("sm_j", "#bfe8ff", roughness=0.1), verts=24)
    flying = [cyl((0, 0, 0), 0.07, 0.015, coin_m, verts=16, rot=(90, 0, 0)) for _ in range(3)]
    bunting = []
    for k in range(9):
        t = box((-0.8 + 0.2 * k, -0.45, 1.34), (0, 0, 0), M("sm_f%d" % (k % 3), ["#ff5a7a", "#4ad0ff", "#7dff8a"][k % 3], roughness=0.6), bevel=0)
        t.scale = (0.16, 0.02, 0.16)
        t.rotation_euler = (0, math.radians(45), 0)
        bunting.append(t)

    @anim
    def _sm(t):
        ph = t * TAU
        barm.rotation_euler = (0, math.radians(-120) + 0.5 * math.sin(3 * ph), 0)
        bl.rotation_euler = (0.15 * math.sin(2 * ph), 0, 0.1 * math.sin(ph))
        br.rotation_euler = (0.15 * math.sin(2 * ph + 1), 0, -0.1 * math.sin(ph))
        bunny.location.z = 0.04 * abs(math.sin(2 * ph))
        for i, sp in enumerate(sparks):
            q = (t * 2 + i / 6) % 1.0
            sc_ = max(0.0, math.sin(math.pi * q)) ** 2
            sp.location = (-0.6 + 0.24 * i, -0.1 + 0.05 * math.sin(ph + i), 0.85 + 0.1 * (i % 2))
            sp.scale = (sc_, sc_, sc_)
        for i, c in enumerate(flying):
            q = (t + i / 3) % 1.0
            c.location = (-0.1 - 0.75 * q, -0.45, 0.8 + 1.1 * 4 * q * (1 - q))
            c.rotation_euler = (ph * 3, 0, 0)
        for i, b_ in enumerate(bunting):
            b_.rotation_euler = (0.3 * math.sin(2 * ph + i), math.radians(45), 0)

    run(lambda t: None, "obchod_stanek_mince")


def stanek_truhla():
    setup("obchod_stanek_truhla", size=448, ortho=4.4, target_z=0.95, world=("#ffe0d0", 0.6))
    plinth("#b9a0f0", "#f1e6ff")
    wood, gold = M("st_w", "#7a4a26", roughness=0.6), GOLD("st_g")
    box((0.0, 0.3, 0.25), (1.8, 0.8, 0.5), M("st_c", "#6a5ae0", roughness=0.5), bevel=0.03)
    box((0.0, 0.3, 0.52), (1.9, 0.9, 0.05), M("st_t", "#fff0d0", roughness=0.5), bevel=0.01)
    for dx in (-0.85, 0.85):
        bar((dx, -0.1, 0.0), (dx, -0.1, 1.7), 0.035, wood, verts=8)
        bar((dx, 0.7, 0.0), (dx, 0.7, 1.7), 0.035, wood, verts=8)
    awning(0, 0.3, 1.7, 2.0, 1.0, "#e8453c", "#fff6e0", "st_aw")
    # otevřená truhla se zářícím obsahem
    box((0.0, 0.2, 0.72), (0.7, 0.45, 0.28), wood, bevel=0.03)
    box((0.0, 0.2, 0.72), (0.72, 0.1, 0.3), gold, bevel=0.01)
    glow_m = glow("st_gl", "#ffd86a", 2.0)
    box((0.0, 0.2, 0.87), (0.62, 0.38, 0.02), glow_m, bevel=0)
    lid = empty()
    lid.location = (0.0, 0.42, 0.86)
    child(box((0.0, 0.2, 0.89), (0.72, 0.1, 0.34), M("st_ld", "#5a3416", roughness=0.6), bevel=0.03), lid).location = (0.0, -0.22, 0.03)
    gems = []
    for k, c in enumerate(("#ff3b5a", "#3b7bff", "#3bd68a", "#ffd23a", "#c9a8ff")):
        gems.append(sphere((0, 0, 0), 0.05, glow("st_gm%d" % k, c, 3.0), scale=(1, 1, 1.2), seg=8, rings=6))
    fox, fl, fr_, farm_ = vendor(-0.95, 0.15, 0.0, "#ff8a3c", "#ffffff", "fox", s=1.3, rot=0.3)
    lantern = empty()
    lantern.location = (0.9, -0.25, 1.62)
    child(bar((0, 0, 0), (0, 0, 0.12), 0.006, wood, verts=4), lantern)
    lg = glow("st_lan", "#ffb23a", 4.0)
    child(sphere((0, 0, -0.07), 0.1, lg, scale=(1, 1, 1.2), seg=12, rings=8), lantern)
    spark = [sphere((0, 0, 0), 0.015, glow("st_s%d" % k, "#fff2b0", 7.0), seg=6, rings=4) for k in range(8)]

    @anim
    def _st(t):
        ph = t * TAU
        o = 0.5 - 0.5 * math.cos(ph)
        lid.rotation_euler = (-math.radians(110) * (0.4 + 0.6 * o), 0, 0)
        set_glow(glow_m, 1.5 + 2.5 * o)
        for i, g in enumerate(gems):
            q = (t + i / 5) % 1.0
            a = q * TAU * 1.2 + i
            g.location = (0.35 * math.sin(a), 0.2 + 0.1 * math.cos(a), 0.9 + 0.8 * q)
            s_ = math.sin(math.pi * q) ** 0.6
            g.scale = (s_, s_, s_ * 1.2)
            g.rotation_euler = (0, 0, ph * 2)
        farm_.rotation_euler = (0, math.radians(-110) + 0.4 * math.sin(2 * ph), 0)
        fl.rotation_euler = (0.1 * math.sin(2 * ph), 0, 0)
        fr_.rotation_euler = (0.1 * math.sin(2 * ph + 1), 0, 0)
        lantern.rotation_euler = (0.18 * math.sin(ph), 0.12 * math.cos(ph), 0)
        set_glow(lg, 3.5 + 1.2 * math.sin(3 * ph))
        rise(spark, t, 0.0, 0.2, 1.0, 0.7, grow=1.0, drift=0.25)

    run(lambda t: None, "obchod_stanek_truhla")


def stanek_poklad():
    setup("obchod_stanek_poklad", size=448, ortho=4.4, target_z=1.0, world=("#ffd9c0", 0.5))
    plinth("#6b5a8a", "#e8dcf8")
    stone = stone_material("sp_s", "#9a8fb0", 14, 0.4, 0.9)
    gold = GOLD("sp_g")
    # kamenný oblouk jeskyně pokladů
    for sx in (-1, 1):
        box((sx * 0.95, 0.5, 0.8), (0.35, 0.9, 1.6), stone, bevel=0.03)
    box((0, 0.5, 1.7), (2.2, 0.9, 0.35), stone, bevel=0.03)
    box((0, 0.8, 0.8), (1.6, 0.2, 1.7), M("sp_b", "#2a1f4a", roughness=0.9), bevel=0)
    # hromada mincí a drahokamů, koruna a velká truhla
    coin = M("sp_c", "#ffc933", roughness=0.25, metallic=1.0)
    rnd = random.Random(11)
    for k in range(70):
        a, r = rnd.uniform(0, TAU), 0.65 * math.sqrt(rnd.uniform(0, 1))
        z = 0.08 + 0.55 * (1 - r / 0.65) ** 1.4
        cyl((0.1 + r * math.cos(a) * 0.9, 0.0 + r * math.sin(a) * 0.55, z), 0.1, 0.03, coin if k % 4 else GOLD("sp_g2"), rot=(rnd.uniform(-30, 30), rnd.uniform(-30, 30), 0), verts=14)
    box((-0.5, -0.1, 0.22), (0.55, 0.4, 0.32), M("sp_ch", "#7a4a26", roughness=0.6), bevel=0.03)
    box((-0.5, -0.1, 0.42), (0.58, 0.42, 0.1), M("sp_lid", "#5a3416", roughness=0.6), bevel=0.03)
    box((-0.5, -0.31, 0.3), (0.58, 0.04, 0.5), gold, bevel=0.01)
    crown = empty()
    crown.location = (0.1, 0.0, 0.8)
    child(cyl((0.1, 0.0, 0.8), 0.14, 0.12, gold, verts=20), crown)
    for k in range(5):
        a = k * TAU / 5
        child(cone((0.1 + 0.12 * math.cos(a), 0.12 * math.sin(a), 0.92), 0.035, 0.0, 0.1, gold, verts=8), crown)
        child(sphere((0.1 + 0.12 * math.cos(a), 0.12 * math.sin(a), 1.0), 0.025, glow("sp_cj%d" % k, ["#ff3b5a", "#3b7bff", "#3bd68a", "#ff9a3c", "#c9a8ff"][k], 4.0), seg=8, rings=6), crown)
    gem_m = []
    for k, (gx, gy, c) in enumerate(((0.65, -0.2, "#ff3b5a"), (0.8, -0.05, "#3b7bff"), (-0.2, -0.35, "#3bd68a"), (0.4, -0.4, "#c9a8ff"))):
        m_ = glow("sp_g%d" % k, c, 2.5)
        sphere((gx, gy, 0.1), 0.1, m_, scale=(1, 1, 1.3), seg=8, rings=6)
        gem_m.append(m_)
    # malý drak pokladník, dýchá a mrká
    drag = empty()
    drag.location = (-0.9, -0.4, 0.0)
    gm = M("sp_dg", "#3fbf6a", roughness=0.6)
    child(sphere((-0.9, -0.4, 0.25), 0.2, gm, scale=(1.1, 0.9, 1.0), seg=16, rings=12), drag)
    child(sphere((-0.9, -0.6, 0.5), 0.14, gm, seg=14, rings=10), drag)
    child(sphere((-0.9, -0.55, 0.22), 0.14, M("sp_db", "#d8f5a8", roughness=0.7), scale=(0.9, 0.5, 1.1), seg=12, rings=8), drag)
    eyes = [sphere((-0.9 + dx, -0.72, 0.54), 0.03, M("sp_de", "#16132b"), seg=8, rings=6) for dx in (-0.06, 0.06)]
    for e in eyes:
        e.parent = drag
        e.location = (e.location.x, e.location.y, e.location.z)
    for dx in (-0.08, 0.08):
        child(cone((-0.9 + dx, -0.58, 0.64), 0.03, 0.0, 0.1, M("sp_dh", "#ff9a3c"), verts=8), drag)
    wing = []
    for side in (-1, 1):
        w = empty()
        w.parent = drag
        w.location = (-0.9 + side * 0.15, -0.32, 0.33)
        wn = box((side * 0.12, 0, 0.1), (0.2, 0.02, 0.28), M("sp_dw", "#2f9a54", roughness=0.7), bevel=0)
        wn.parent = w
        wn.location = (side * 0.12, 0, 0.1)
        wing.append((w, side))
    torch_m = glow("sp_tr", "#ff9a2b", 6.0)
    flames = []
    for sx in (-1, 1):
        bar((sx * 1.2, -0.2, 0.3), (sx * 1.2, -0.2, 1.1), 0.02, M("sp_tp", "#4b3220", roughness=0.8), verts=6)
        flames.append(cone((sx * 1.2, -0.2, 1.2), 0.07, 0.0, 0.2, torch_m, verts=10))
    spark = [sphere((0, 0, 0), 0.016, glow("sp_s%d" % k, "#fff2b0", 7.0), seg=6, rings=4) for k in range(12)]
    srnd = random.Random(2)
    sp_pos = [(srnd.uniform(-0.5, 0.7), srnd.uniform(-0.3, 0.3)) for _ in spark]

    @anim
    def _sp(t):
        ph = t * TAU
        crown.rotation_euler = (0, 0, ph)
        crown.location.z = 0.05 * math.sin(ph)
        for i, m_ in enumerate(gem_m):
            set_glow(m_, 1.5 + 2.5 * max(0, math.sin(2 * ph + i * 1.7)))
        drag.scale = (1, 1, 1 + 0.03 * math.sin(2 * ph))
        blink = 0.1 if (t % 0.5) < 0.05 else 1.0
        for e in eyes:
            e.scale = (1, 1, blink)
        for w, side in wing:
            w.rotation_euler = (0, side * 0.35 * math.sin(2 * ph), 0)
        for i, f in enumerate(flames):
            f.scale = (1 + 0.1 * math.sin(3 * ph + i), 1 + 0.1 * math.sin(3 * ph + i), 1 + 0.3 * math.sin(4 * ph + i * 2))
        set_glow(torch_m, 4.5 + 2.0 * math.sin(3 * ph) * math.cos(ph))
        for i, (s_, (x, y)) in enumerate(zip(spark, sp_pos)):
            q = (t * 2 + i / len(spark)) % 1.0
            s_.location = (x + 0.1 * math.sin(ph + i), y, 0.7 + 1.0 * q)
            k_ = math.sin(math.pi * q)
            s_.scale = (k_, k_, k_)

    run(lambda t: None, "obchod_stanek_poklad")


JOBS = {"kolo_disk": kolo_disk, "kolo_rozpad": kolo_rozpad, "ikona_titul": ikona_titul, "ikona_avatar": ikona_avatar, "ikona_ramecek": ikona_ramecek, "ikona_banner": ikona_banner, "kolo_predni": kolo_predni, "kolo_stojan": kolo_stojan, "stanek_mince": stanek_mince, "stanek_truhla": stanek_truhla, "stanek_poklad": stanek_poklad}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
