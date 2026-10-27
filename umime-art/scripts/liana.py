"""Popínavá rostlina s růžovými květy pro přírodní zónu úvodní stránky (public/home/liana.webp).

    python umime-art/scripts/liana.py <výstupní složka>

Na webu se zrcadlí (scaleX(-1)) pro druhou stranu karet. Používá pomocné funkce z predmety.py a dekor.py.
"""

import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/liana"
sys.argv = sys.argv[:1]
import predmety as P  # noqa: E402
import dekor as D  # noqa: E402

os.makedirs(OUT, exist_ok=True)
random.seed(5)
mat, sph, curve_tube = P.mat, P.sph, P.curve_tube


def flower(c, size, tilt_y=0.0, rot=0.0):
    pink = mat("lupen", (0.95, 0.35, 0.62), rough=0.35, coat=0.35, sss=0.3)
    deep = mat("lupen2", (0.85, 0.2, 0.5), rough=0.4, sss=0.3)
    yellow = mat("stred", (1.0, 0.8, 0.15), rough=0.4)
    for k in range(5):
        a = rot + k * math.tau / 5
        d = Vector((math.cos(a), 0, math.sin(a)))
        p = sph("lupen", size * 0.52, (c[0] + d.x * size * 0.55, c[1] - 0.01 + tilt_y, c[2] + d.z * size * 0.55), pink if k % 2 else deep, scale=(1, 0.28, 1), seg=24)
        p.rotation_euler = (0, -a + math.pi / 2, 0)
        p.scale = (0.8, 0.28, 1.25)
    sph("stred", size * 0.32, (c[0], c[1] - size * 0.12, c[2]), yellow, scale=(1, 0.7, 1), seg=24)
    for k in range(8):
        a = k * math.tau / 8
        sph("tycinka", size * 0.05, (c[0] + math.cos(a) * size * 0.2, c[1] - size * 0.28, c[2] + math.sin(a) * size * 0.2), mat("tyc", (0.6, 0.35, 0.05), rough=0.5), seg=8)


def liana():
    stem = mat("stonek", (0.12, 0.4, 0.1), rough=0.45, sss=0.2)
    leafm = D.veined_leaf_mat("listL", (0.08, 0.42, 0.12), (0.22, 0.65, 0.2))
    pts = [(0.0, 0.0, 0.0), (-0.35, 0.05, 0.9), (0.15, -0.05, 1.8), (1.0, 0.05, 2.45), (1.9, -0.05, 2.5), (2.5, 0.0, 1.9), (2.55, 0.05, 1.35), (2.25, 0.0, 1.0)]
    curve_tube("stonek", pts, 0.085, stem, taper=[(0, 1), (0.7, 0.6), (1, 0.2)])

    def at(t):
        tt = t * (len(pts) - 1)
        i = min(int(tt), len(pts) - 2)
        u = tt - i
        a, b = Vector(pts[i]), Vector(pts[i + 1])
        return a.lerp(b, u), (b - a).normalized()

    # listy
    for k in range(26):
        t = 0.05 + 0.92 * k / 26
        pos, tan = at(t)
        side = 1 if k % 2 else -1
        size = 0.95 - 0.3 * t
        lf = D.leaf_mesh("list", 0.55 * size / 0.5, 0.2 * size / 0.5, leafm, curl=0.05, fold=0.3, nx=6, ny=10, solid=0.01)
        n = Vector((0, -side * 0.35, 0))
        direction = (Vector((-tan.z, 0, tan.x)) * side * 0.9 + tan * 0.35 + n).normalized()
        lf.location = pos
        lf.rotation_euler = direction.to_track_quat("Y", "Z").to_euler()
        lf.rotation_euler.rotate_axis("Y", random.uniform(-0.4, 0.4))
    # květy
    for t, s, off in ((0.12, 0.4, (-0.3, 0)), (0.3, 0.34, (0.3, 0)), (0.5, 0.44, (0.0, 0.3)), (0.66, 0.36, (0.0, -0.32)), (0.82, 0.32, (-0.1, 0.25)), (0.95, 0.26, (0.1, 0.12))):
        pos, _ = at(t)
        flower((pos.x + off[0], pos.y - 0.12, pos.z + off[1]), s, rot=random.random())
    # poupata
    bud = mat("poupe", (0.92, 0.4, 0.62), rough=0.4)
    for t in (0.22, 0.4, 0.58, 0.74):
        pos, _ = at(t)
        sph("poupe", 0.07, (pos.x + 0.15, pos.y - 0.05, pos.z - 0.12), bud, scale=(1, 1, 1.4))
    # úponky: spirála
    for t, sgn in ((0.35, 1), (0.6, -1), (0.9, 1)):
        pos, tan = at(t)
        sp = []
        for k in range(22):
            a = k * 0.55
            r = 0.14 - k * 0.005
            sp.append((pos.x + sgn * (0.1 + 0.02 * k) + r * math.cos(a) * 0.2 * sgn, pos.y, pos.z - 0.05 * k + r * math.sin(a)))
        curve_tube("uponek", sp, 0.012, stem)


if __name__ == "__main__":
    P.render_all({"liana": liana}, {"liana": (0, 3)}, [], OUT, "", size=768)
