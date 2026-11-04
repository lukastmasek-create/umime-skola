"""Had do hry Had (public/game-sprites/snake/had.webp): hlava, tělo, ocas a zatáčka.

Modeluje se přes bpy jako tubusy (Bezierovy křivky s hranou) a elipsoidy, vykreslí se ortografickou
kamerou shora a Freestyle obrysem v barvě inkoustu. Každý díl vyplní celou buňku od okraje k okraji,
aby na sebe navazovaly bez mezer. Tělo, ocas a zatáčka jdou za okraj buňky a ořez je přesně na hraně,
takže se na spojích neobjeví čára.

    cd umime-art/blender
    ../../.venv-art/bin/python had.py            # vyrenderuje díly do ../out/had/ a složí list

List se skládá přes existující soubor: jídlo a jablka (sloupce 4 až 7 v první řadě a první sloupec druhé řady)
zůstávají beze změny. Před přepsáním se původní list uloží do ../out/had/puvodni.webp.
"""
import math
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa: E402,F403  (bpy, reset, material, hex_rgba, add_camera, add_sun, add_area)

from PIL import Image  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHEET = os.path.join(ROOT, "public", "game-sprites", "snake", "had.webp")
OUT_DIR = os.path.join(OUT, "had")
RENDER = 160  # 4× buňka 40 px, pak se zmenší (antialias)
CELL = 40
INK = "#16132b"
GREEN = "#1fa35f"
HEAD_GREEN = "#2fbf71"
SPOT = "#16864d"

sc = reset(RENDER, RENDER, 1, samples=32, name="had", world=("#ffffff", 0.0))
os.makedirs(OUT_DIR, exist_ok=True)

# Freestyle: obrys jen u vnějšího siluetu (ne u okraje buňky, ten se nesmí objevit na spojích)
sc.render.use_freestyle = True
sc.render.line_thickness_mode = "ABSOLUTE"
sc.render.line_thickness = 3
vl = sc.view_layers[0]
vl.use_freestyle = True
ls = vl.freestyle_settings.linesets.new("obrys")
ls.select_silhouette = True
ls.select_border = False
ls.select_crease = False
ls.linestyle.color = hex_rgba(INK)[:3]
ls.linestyle.thickness = 3

ink_mat = material("ink", INK, roughness=0.5)
body_mat = material("telo", GREEN, roughness=0.6)
head_mat = material("hlava", HEAD_GREEN, roughness=0.6)
spot_mat = material("tecka", SPOT, roughness=0.45)
white = material("oko", "#ffffff", roughness=0.25)
pupil = material("zornicka", INK, roughness=0.3)

# Kamera shora: buňka má rozměr 1 × 1, šipka +X doprava, +Y nahoru (obrázek: v dolů, proto Y = 0,5 − v)
cam = add_camera((0, 0, 5), (0, 0, 0), ortho_scale=1.0)
add_sun((0.7, 0.25, 0.0), energy=1.6, angle=0.25)
add_area((-1.2, 1.4, 3.0), (0, 0, 0), energy=90, size=3)


def to_world(u, v):
    return (u - 0.5, 0.5 - v, 0.0)


def clear(names):
    for n in names:
        o = bpy.data.objects.get(n)
        if o is not None:
            bpy.data.objects.remove(o, do_unlink=True)


def tube(path, radii, mat, name, bevel=1.0):
    """Křivka po bodech v buňkách (u, v), poloměr trubky v každém bodě (v jednotkách buňky)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = bevel
    cu.bevel_resolution = 8
    cu.fill_mode = "FULL"
    sp = cu.splines.new("POLY")
    sp.points.add(len(path) - 1)
    sp.use_smooth = True
    for pt, p, r in zip(sp.points, path, radii):
        x, y, z = to_world(*p)
        pt.co = (x, y, z, 1)
        pt.radius = r
    cu.materials.append(mat)
    ob = bpy.data.objects.new(name, cu)
    sc.collection.objects.link(ob)
    return ob


def sphere(center, scale, mat, name):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=40, ring_count=24, location=to_world(*center))
    o = bpy.context.object
    o.name = name
    o.scale = scale
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def lerp_path(a, b, n):
    return [(a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)) for i in range(n)]


R = 0.43  # poloviční šířka těla: těsně přes celou buňku, s tenkou mezerou kvůli obrysu


def render_part(name, objects):
    sc.render.filepath = os.path.join(OUT_DIR, name + ".png")
    bpy.ops.render.render(write_still=True)
    clear([o.name for o in objects])
    print("hotovo", name, flush=True)


# --- tělo: rovná trubka přes celou buňku, s tečkou uprostřed hřbetu (vodorovně, +X)
path = lerp_path((-0.35, 0.5), (1.35, 0.5), 60)
body = tube(path, [R] * len(path), body_mat, "telo_trubka")
dot = sphere((0.5, 0.5), (0.12, 0.12, 0.12), spot_mat, "telo_tecka")
dot.location.z = 0.38
render_part("telo", [body, dot])

# --- zatáčka: čtvrtkruh se středem v pravém dolním rohu, spojuje východ (+X) a jih (+Y v obrazu).
#     Trubka se na obou koncích prodlouží rovně přes hranu buňky, takže na spojích navazuje.
arc = []
for i in range(41):
    a = 1.5 * math.pi - (math.pi / 2) * i / 40  # od východu (1, 0.5) přes střed k jihu (0.5, 1)
    arc.append((1 + 0.5 * math.cos(a), 1 + 0.5 * math.sin(a)))
corner = [(1.35, 0.5), (1.15, 0.5)] + arc + [(0.5, 1.15), (0.5, 1.35)]
corner_obj = tube(corner, [R] * len(corner), body_mat, "zatacka_trubka")
render_part("zatacka", [corner_obj])

# --- ocas: tenká špička vlevo (−X), plné tělo u pravého okraje. Engine ho otáčí podle směru k předchozímu článku.
# poloměr je R až k pravému okraji (u = 1), pak se zužuje k špičce (u = 0,04), aby navazoval na tělo
tail_path = lerp_path((1.35, 0.5), (0.04, 0.5), 40)
tail_r = []
for u, _ in tail_path:
    if u >= 1:
        tail_r.append(R)
    else:
        k = (u - 0.04) / 0.96
        tail_r.append(R * (0.1 + 0.9 * k ** 0.6))
tail = tube(tail_path, tail_r, body_mat, "ocas_trubka")
render_part("ocas", [tail])

# --- hlava: vejčitý tvar s nosem v +X, dvě oči nahoře, jeden pár zornic dopředu
head = sphere((0.5, 0.5), (0.48, R + 0.01, 0.42), head_mat, "hlava_tvar")
parts = [head]
for s in (-1, 1):
    # oči sedí na povrchu hlavy (výška ~0,34 v těchto souřadnicích), půlka vyčnívá
    eye = sphere((0.70, 0.5 + s * 0.17), (0.12, 0.12, 0.12), white, f"oko_{s}")
    eye.location.z = 0.33
    pup = sphere((0.74, 0.5 + s * 0.175), (0.062, 0.062, 0.062), pupil, f"zornicka_{s}")
    pup.location.z = 0.40
    parts += [eye, pup]
render_part("hlava", parts)


# --- složení listu: 40px buňky, zmenšeno z 160 px (LANCZOS), jídlo a jablka se nemění
def load_cell(name):
    return Image.open(os.path.join(OUT_DIR, name + ".png")).convert("RGBA").resize((CELL, CELL), Image.LANCZOS)


sheet = Image.open(SHEET).convert("RGBA")
backup = os.path.join(OUT_DIR, "puvodni.webp")
if not os.path.exists(backup):
    shutil.copy(SHEET, backup)

for col, name in ((0, "hlava"), (1, "telo"), (2, "ocas"), (3, "zatacka")):
    tile = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    tile.alpha_composite(load_cell(name))
    sheet.paste(tile, (col * CELL, 0))

sheet.save(SHEET, "WEBP", lossless=False, quality=92, method=6)
print("list uložen:", SHEET, sheet.size, flush=True)
