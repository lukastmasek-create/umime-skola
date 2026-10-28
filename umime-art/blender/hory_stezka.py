"""Sekce „Jak to funguje“: hora s klikatou stezkou, třemi tábory a vrcholem; turista s batohem
(cyklus chůze), plápolající oheň a vlajky. Hora je jeden obrázek, turista a vlajky se na webu
posouvají po stezce podle rolování stránky.

Spuštění: python hory_stezka.py [-- hora turista oheň vlajka] (každé ve vlastním procesu)
Výstup: out/hory_hora (+ paths JSON), out/hory_turista, out/hory_ohen, out/hory_vlajka
"""
import json
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

W, H = 1500, 1650
UNITS = 8.0                 # šířka záběru
PPU = W / UNITS
EL = math.radians(14)
SIZE = 6.4                  # velikost terénu
N = 170
PEAK = (0.1, 0.2)
CAMP_T = [0.2, 0.56, 0.92]  # kde na stezce stojí tábory (0..1)


def peak(x, y, cx, cy, h, w, sharp=1.2):
    d = math.hypot(x - cx, y - cy) / w
    return h * math.exp(-(d ** sharp))


def ridge(x, y):
    return 0.5 * math.sin(x * 7.3 + 1.1) * math.sin(y * 6.1 + 0.4) + 0.3 * math.sin(x * 13 - y * 9) + 0.16 * math.sin(x * 27 + y * 21)


def height(x, y):
    r = math.hypot(x, y)
    h = peak(x, y, *PEAK, 4.7, 1.25, 1.1) + peak(x, y, -1.75, -0.2, 2.6, 0.95, 1.3) + peak(x, y, 1.9, -0.3, 2.2, 0.85, 1.3) + peak(x, y, -0.5, 1.0, 3.4, 1.1, 1.2)
    h += peak(x, y, 0.0, -1.7, 0.6, 1.6, 1.8)
    h += 0.32 * ridge(x, y) * (0.25 + h / 4.5)
    mask = max(0.0, min(1.0, (3.1 - r) / 0.9))
    mask = mask * mask * (3 - 2 * mask)
    return max(0.0, h) * mask


# stezka: serpentiny po jižní straně hory; waypointy (x, y) a vyhlazení Catmull-Romem
WAY = [(-1.9, -2.5), (1.1, -2.2), (-1.3, -1.8), (1.25, -1.4), (-1.0, -1.05), (0.95, -0.7), (-0.75, -0.4), (0.65, -0.12), (-0.35, 0.1), (0.2, 0.22), PEAK]


def catmull(pts, per=14):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(per):
            t = k / per
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    out.append(pts[-1])
    return out


TRAIL = catmull(WAY)


def trail_dist(x, y):
    best = 99.0
    for a, b in zip(TRAIL[:-1], TRAIL[1:]):
        vx, vy = b[0] - a[0], b[1] - a[1]
        L = vx * vx + vy * vy + 1e-9
        t = max(0.0, min(1.0, ((x - a[0]) * vx + (y - a[1]) * vy) / L))
        best = min(best, math.hypot(x - (a[0] + t * vx), y - (a[1] + t * vy)))
    return best


def trail_height(i):
    x, y = TRAIL[i]
    # hladký výškový profil po stezce: průměr okolí, ať je stezka průchozí
    ks = range(max(0, i - 6), min(len(TRAIL), i + 7))
    return sum(height(*TRAIL[k]) for k in ks) / len(ks)


TH = [trail_height(i) for i in range(len(TRAIL))]


def carved(x, y):
    """Terén s vyříznutou římsou, po které vede stezka."""
    h = height(x, y)
    d = trail_dist(x, y)
    if d < 0.2:
        # výška nejbližšího bodu stezky
        j = min(range(len(TRAIL)), key=lambda k: (TRAIL[k][0] - x) ** 2 + (TRAIL[k][1] - y) ** 2)
        k = max(0.0, 1 - d / 0.2)
        k = k * k * (3 - 2 * k)
        h = h * (1 - k) + TH[j] * k
    return h


def project(x, y, z):
    return (W / 2 + PPU * x, H * 0.82 - PPU * (y * math.sin(EL) + z * math.cos(EL)))


def build_mountain():
    reset(W, H, 1, samples=128, name="hory_hora", world=("#b8c6ff", 0.55))
    sc = bpy.context.scene
    sc.render.film_transparent = True
    add_sun((math.radians(55), math.radians(10), math.radians(-50)), energy=3.8)
    add_area((-5, -9, 7), (0, 0, 2), energy=900, size=10, color="#ffe3cc")
    add_area((6, 3, 4), (0, 0, 2), energy=250, size=8, color="#8fb0ff")
    d = 60.0
    add_camera((0, -d * math.cos(EL), d * math.sin(EL) + 1.5), (0, 0, 1.5), ortho_scale=UNITS * (H / W) * (W / H) if False else UNITS)
    # --- terén s barvami po vrcholech ---
    verts, cols, faces = [], [], []
    for j in range(N + 1):
        for i in range(N + 1):
            x, y = (i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE
            z = carved(x, y)
            verts.append((x, y, z))
    def hz(i, j):
        return verts[min(N, max(0, j)) * (N + 1) + min(N, max(0, i))][2]
    for j in range(N + 1):
        for i in range(N + 1):
            x, y, z = verts[j * (N + 1) + i]
            dx = (hz(i + 1, j) - hz(i - 1, j)) / (2 * SIZE / N)
            dy = (hz(i, j + 1) - hz(i, j - 1)) / (2 * SIZE / N)
            slope = math.hypot(dx, dy)
            snow_line = 3.1 + 0.35 * math.sin(x * 5 + y * 4)
            snow = max(0.0, min(1.0, (z - snow_line) / 0.45)) * max(0.0, min(1.0, 2.4 - slope * 0.8))
            green = max(0.0, min(1.0, (1.0 - z) / 0.7))
            forest = max(0.0, min(1.0, (1.9 - z) / 0.9)) * 0.45
            rock = (0.30, 0.27, 0.32) if slope > 0.9 else (0.50, 0.42, 0.38)
            c = [rock[k] * (1 - green) + (0.34, 0.62, 0.30)[k] * green for k in range(3)]
            c = [c[k] * (1 - forest) + (0.16, 0.42, 0.26)[k] * forest for k in range(3)]
            td = trail_dist(x, y)
            if td < 0.075:
                tk = 1 - td / 0.075
                c = [c[k] * (1 - tk) + (0.92, 0.82, 0.62)[k] * tk for k in range(3)]
            c = [c[k] * (1 - snow) + (0.97, 0.98, 1.0)[k] * snow for k in range(3)]
            cols.append((c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2, 1.0))
    for j in range(N):
        for i in range(N):
            if math.hypot((i / N - 0.5) * SIZE, (j / N - 0.5) * SIZE) <= 3.05:
                faces.append((j * (N + 1) + i, j * (N + 1) + i + 1, (j + 1) * (N + 1) + i + 1, (j + 1) * (N + 1) + i))
    me = bpy.data.meshes.new("hora")
    me.from_pydata(verts, [], faces)
    me.update()
    attr = me.color_attributes.new("col", "FLOAT_COLOR", "POINT")
    for k, c in enumerate(cols):
        attr.data[k].color = c
    mat = bpy.data.materials.new("hm")
    mat.use_nodes = True
    nt = mat.node_tree
    b = nt.nodes["Principled BSDF"]
    va = nt.nodes.new("ShaderNodeVertexColor")
    va.layer_name = "col"
    nt.links.new(va.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.88
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("hora", me)
    sc.collection.objects.link(ob)
    # --- stromy, kameny, tábory ---
    rnd = random.Random(5)
    for _ in range(140):
        x, y = rnd.uniform(-2.8, 2.8), rnd.uniform(-2.8, 0.4)
        z = carved(x, y)
        if z > 1.9 or trail_dist(x, y) < 0.16:
            continue
        tree(x, y, rnd.uniform(0.7, 1.4) * 1.5, z=z, kind="cone", leaf=rnd.choice(("#2f6f55", "#2a6a4a", "#3a7a58")))
    for _ in range(46):
        x, y = rnd.uniform(-2.9, 2.9), rnd.uniform(-2.8, 0.2)
        z = carved(x, y)
        if trail_dist(x, y) < 0.12:
            continue
        sphere((x, y, z + 0.03), rnd.uniform(0.04, 0.12), material("kam", "#7a7078", roughness=0.9), scale=(1, 1, 0.7), seg=8, rings=6)
    camps = []
    for ci, t in enumerate(CAMP_T):
        idx = int(t * (len(TRAIL) - 1))
        x, y = TRAIL[idx]
        z = TH[idx]
        camps.append((x, y, z))
        cyl((x, y, z + 0.015), 0.3, 0.05, material("platf", "#b9a07a", roughness=0.9), verts=24)
        col = ["#ff5a3c", "#ffc933", "#3b9bff"][ci]
        for k in range(2):
            a = k * math.tau / 2 + 0.7
            cone((x + 0.14 * math.cos(a), y + 0.14 * math.sin(a), z + 0.14), 0.11, 0.0, 0.26, material("tent%d_%d" % (ci, k), col if k == 0 else "#f3f0e6", roughness=0.6), verts=4, rot=(0, 0, a + math.pi / 4))
        for k in range(5):  # polínka na ohni
            a = k * math.tau / 5
            bar((x - 0.2 + 0.05 * math.cos(a), y - 0.12 + 0.05 * math.sin(a), z + 0.06), (x - 0.2, y - 0.12, z + 0.1), 0.012, material("wd", "#6b4a2d"), verts=6)
        # cedule s číslem kroku
        bar((x + 0.22, y - 0.16, z + 0.02), (x + 0.22, y - 0.16, z + 0.3), 0.012, material("pl", "#6b4a2d"), verts=6)
        box((x + 0.22, y - 0.17, z + 0.32), (0.16, 0.02, 0.1), material("cd", "#f3d9a2", roughness=0.7), bevel=0.005)
        bpy.ops.object.text_add(location=(x + 0.2, y - 0.185, z + 0.3), rotation=(math.radians(90), 0, 0))
        tx = bpy.context.object
        tx.data.body = str(ci + 1)
        tx.data.size = 0.09
        tx.data.extrude = 0.005
        tx.data.materials.append(material("txt", "#3a2a1a"))
    # varhaní kámen a vlajková tyč na vrcholu (vlajku kreslí web)
    sx, sy = TRAIL[-1]
    sz = height(sx, sy)
    for k in range(6):
        sphere((sx + 0.06 * math.cos(k), sy + 0.06 * math.sin(k), sz + 0.03 + 0.03 * (k % 3)), 0.07 - 0.008 * k, material("kc", "#8a8088", roughness=0.9), scale=(1, 1, 0.75), seg=8, rings=6)
    # vlajkové praporky (modlitební) kolem vrcholu
    out = {"w": W, "h": H, "trail": [], "camps": [], "summit": None, "ppu": PPU}
    for i, (x, y) in enumerate(TRAIL):
        px, py = project(x, y, TH[i] + 0.04)
        out["trail"].append([px / W, py / H])
    for x, y, z in camps:
        px, py = project(x, y, z + 0.06)
        out["camps"].append([px / W, py / H])
    px, py = project(sx, sy, sz + 0.05)
    out["summit"] = [px / W, py / H]
    os.makedirs(os.path.join(OUT, "hory_hora"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "hory_hora", "trail.json"), "w"))
    run(lambda t: None, "hory_hora")


# --- turista: pohled z boku, míří doprava, 12 snímků cyklu chůze ---
def build_hiker():
    S = 256
    reset(S, S, 12, samples=96, name="hory_turista", world=("#b8c6ff", 0.55))
    bpy.context.scene.render.film_transparent = True
    add_sun((math.radians(50), math.radians(12), math.radians(-40)), energy=3.4)
    add_area((-4, -6, 5), (0, 0, 0.6), energy=300, size=6, color="#fff1e2")
    add_camera((0, -10, 1.6), (0, 0, 0.85), ortho_scale=2.1)
    skin, jacket, pants, boot, pack, hat = material("sk", "#ffd5a8", roughness=0.6), material("ja", "#ff5a3c", roughness=0.55), material("pa", "#2f3c6e", roughness=0.6), material("bo", "#3a2a22", roughness=0.7), material("ba", "#3b9bff", roughness=0.55), material("hat", "#ffc933", roughness=0.5)
    root = bpy.data.objects.new("root", None)
    bpy.context.scene.collection.objects.link(root)

    def part(o, parent=None):
        o.parent = parent or root
        return o

    torso = part(sphere((0, 0, 0.78), 0.2, jacket, scale=(0.85, 0.7, 1.35), seg=24, rings=16))
    part(sphere((0.0, 0, 1.12), 0.14, skin, seg=20, rings=14))              # hlava
    part(sphere((0.0, 0, 1.2), 0.145, hat, scale=(1.05, 1.0, 0.55), seg=20, rings=10))  # čepice
    part(box((0.1, 0, 1.17), (0.14, 0.12, 0.025), hat, bevel=0))            # kšilt
    part(sphere((0.07, -0.05, 1.12), 0.02, material("oko", "#16132b"), seg=8, rings=6))
    part(box((-0.2, 0, 0.82), (0.2, 0.3, 0.42), pack, bevel=0.05))        # batoh
    part(sphere((-0.25, 0, 1.02), 0.09, material("rol", "#ff7aa6"), scale=(1, 1.5, 0.7), seg=12, rings=8))  # karimatka
    # končetiny jako kyvadla s kloubem v rameni / kyčli
    def limb(x, z, length, r, mat, name):
        piv = bpy.data.objects.new(name, None)
        bpy.context.scene.collection.objects.link(piv)
        piv.parent = root
        piv.location = (x, 0, z)
        seg = cyl((0, 0, -length / 2), r, length, mat, verts=12)
        seg.parent = piv
        seg.location = (0, 0, -length / 2)
        return piv

    armF, armB = limb(0.02, 0.92, 0.42, 0.05, jacket, "armF"), limb(0.02, 0.92, 0.42, 0.05, jacket, "armB")
    legF, legB = limb(0.0, 0.58, 0.5, 0.075, pants, "legF"), limb(0.0, 0.58, 0.5, 0.075, pants, "legB")
    for lg in (legF, legB):
        b = box((0.05, 0, -0.52), (0.2, 0.12, 0.09), boot, bevel=0.02)
        b.parent = lg
        b.location = (0.05, 0, -0.52)
    for ar in (armF, armB):
        h = sphere((0, 0, -0.43), 0.055, skin, seg=10, rings=8)
        h.parent = ar
        h.location = (0, 0, -0.43)
    # hůl
    stick = bar((0, 0, 0), (0.0, 0, -0.9), 0.012, material("hul", "#8a5a34"), verts=6)
    stick.parent = armF
    stick.location = (0.05, 0.0, -0.42)

    def update(t):
        ph = t * math.tau
        s = math.sin(ph)
        legF.rotation_euler = (0, 0.55 * s, 0)
        legB.rotation_euler = (0, -0.55 * s, 0)
        armF.rotation_euler = (0, -0.5 * s, 0)
        armB.rotation_euler = (0, 0.5 * s, 0)
        root.location = (0, 0, 0.035 * abs(math.cos(ph)))
        root.rotation_euler = (0, 0.06, 0)
        torso.rotation_euler = (0, 0.04 * s, 0)
    run(update, "hory_turista")


def build_fire():
    S = 128
    reset(S, S, 12, samples=64, name="hory_ohen", world=("#8090d0", 0.4))
    bpy.context.scene.render.film_transparent = True
    add_sun((math.radians(50), math.radians(12), math.radians(-40)), energy=2.0)
    add_camera((0, -8, 0.4), (0, 0, 0.35), ortho_scale=0.9)
    fl = [cone((0, 0, 0.16), 0.15, 0.0, 0.4, glow("f1", "#ff6a14", 4.5), verts=24), cone((0, 0, 0.14), 0.1, 0.0, 0.3, glow("f2", "#ffc21a", 6.0), verts=24), cone((0, 0, 0.12), 0.055, 0.0, 0.2, glow("f3", "#fff3c0", 9.0), verts=24)]
    for k in range(5):
        a = k * math.tau / 5
        bar((0.12 * math.cos(a), 0.12 * math.sin(a), 0.03), (0.0, 0.0, 0.07), 0.025, material("wd%d" % k, "#6b4a2d"), verts=8)
    sp = [sphere((0, 0, 0), 0.012, glow("sp%d" % k, "#ffd24d", 8.0), seg=6, rings=4) for k in range(8)]

    def update(t):
        ph = t * math.tau
        for i, f in enumerate(fl):
            L = 1 + 0.2 * math.sin(2 * ph + i * 1.7) + 0.08 * math.sin(5 * ph + i)
            f.scale = (1 + 0.1 * math.sin(3 * ph + i), 1 + 0.1 * math.cos(3 * ph + i), L)
        for k, s in enumerate(sp):
            u = (t + k / 8.0) % 1.0
            s.location = (0.07 * math.sin(k * 2.1 + ph), 0.05 * math.cos(k * 1.3), 0.25 + 0.5 * u)
            q = 1 - u
            s.scale = (q, q, q)
    run(update, "hory_ohen")


def build_flag():
    reset(256, 256, 12, samples=48, name="hory_vlajka", world=("#8090d0", 0.5))
    bpy.context.scene.render.film_transparent = True
    add_sun((math.radians(50), math.radians(12), math.radians(-40)), energy=3.2)
    add_area((-3, -5, 3), (0, 0, 0), energy=200, size=5, color="#fff3e8")
    add_camera((0, -9, 0.4), (0.35, 0, 0.3), ortho_scale=1.6)
    pole((0, 0, -0.5), (0, 0, 0.85), r=0.018)
    fl = Flag((0.012, 0, 0.82), 0.7, 0.45, [material("vl1", "#ff4d5e"), material("vl2", "#ffd24d")], lambda u, v: 1 if v > 0.55 else 0, cols=30, rows=16, amp=0.1, waves=1.6, droop=0.02)
    run(lambda t: fl.update(t), "hory_vlajka")


JOBS = {"hora": build_mountain, "turista": build_hiker, "ohen": build_fire, "vlajka": build_flag}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
