"""Doplňky z craftování: pro mazlíčky (kotvy hlava/krk) a pro avatary (souřadnice avatara, počátek u chodidel).

    python umime-art/blender/craft_doplnky.py -- all [--stills]
    python umime-art/blender/craft_doplnky.py -- pet-spacesuit cape-of-stars --stills

Výstup:
  public/pets/accessories/<ref>.glb + <ref>.png        (ref bez "pet-": spacesuit, sailor-collar, acorn-cap, ...)
  public/avatars-3d/accessories/<id>.glb + <id>.png    (id receptu bez "craft-": antenna-helmet, cape-of-stars, ...)
Pohled: předek je -Y v Blenderu (+Z v glTF), nahoře +Z (+Y v glTF). Mazlíček: počátek v kotvě, hlava široká ~1.
Avatar: stejné souřadnice jako avatary3d.py (hlava ve výšce 1,0–1,9, ramena 0,88).
"""
import math
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import avatary3d as A  # noqa: E402
from avatary3d import _new, box, cone, cyl, hexc, mat, sphere, torus  # noqa: E402

TAU = math.tau
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_PET = os.path.join(ROOT, "public", "pets", "accessories")
OUT_AV = os.path.join(ROOT, "public", "avatars-3d", "accessories")
TMP = "/tmp/claude-0/doplnky"


def join(objs, name):
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(objs) > 1:
        bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    o.data.name = name
    return o


def star(loc, r, m, thick=0.04, rot=None):
    """Pěticípá hvězda vytlačená do tloušťky; leží v rovině XZ a dívá se k -Y (předek)."""
    import bmesh

    me = bpy.data.meshes.new("star")
    bm = bmesh.new()
    pts = []
    for k in range(10):
        rad = r if k % 2 == 0 else r * 0.45
        a = k * math.pi / 5
        pts.append((math.sin(a) * rad, 0.0, math.cos(a) * rad))
    face = bm.faces.new([bm.verts.new(p) for p in pts])
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    bmesh.ops.translate(bm, vec=(0, -thick, 0), verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("star", me)
    bpy.context.scene.collection.objects.link(o)
    o.location = (loc[0], loc[1] + thick / 2, loc[2])
    bpy.context.view_layer.objects.active = o
    return [_new(o, m)]


# ------------------------------------------------------------------------------------------ mazlíčci
def pet_spacesuit():
    glass = mat("sklo", "#bfe8ff", rough=0.05, coat=1.0, alpha=0.25)
    metal = mat("kov", "#e8eef8", rough=0.3, metal=0.6)
    red = mat("svetylko", "#ff5d73", emit=3.0)
    return [
        sphere((0, 0, -0.34), 0.72, glass),
        torus((0, 0, -0.78), 0.55, 0.09, metal),
        cyl((0.36, 0.05, 0.42), 0.02, 0.3, metal, rot=(0, 0.3, 0)),
        sphere((0.42, 0.05, 0.58), 0.05, red),
    ]


def pet_sailor_collar():
    navy = mat("limec", "#2e5aa8", rough=0.6)
    white = mat("pruhy", "#ffffff", rough=0.6)
    red = mat("uzel", "#e5484d", rough=0.5)
    parts = [torus((0, 0, -0.18), 0.42, 0.08, navy), torus((0, 0, -0.1), 0.43, 0.025, white), torus((0, 0, -0.26), 0.41, 0.025, white)]
    parts.append(sphere((0, -0.45, -0.2), 0.08, red))
    parts.append(box((0.07, -0.46, -0.36), (0.07, 0.04, 0.18), red, rot=(0, 0.2, 0)))
    parts.append(box((-0.07, -0.46, -0.36), (0.07, 0.04, 0.18), red, rot=(0, -0.2, 0)))
    return parts


def pet_acorn_cap():
    brown = mat("cepicka", "#8a5a2b", rough=0.55)
    dark = mat("stopka", "#5a3a20", rough=0.5)
    parts = [sphere((0, 0, 0.0), 0.44, brown, scale=(1, 1, 0.62))]
    for k in range(3):
        parts.append(torus((0, 0, 0.02 + k * 0.07), 0.4 - k * 0.1, 0.02, dark))
    parts.append(cyl((0, 0, 0.3), 0.04, 0.14, dark))
    parts.append(sphere((0, 0, 0.38), 0.045, dark))
    return parts


def pet_knight_cape():
    red = mat("plast", "#c0392b", rough=0.55)
    gold = mat("spona", "#ffc933", rough=0.25, metal=0.9)
    parts = [torus((0, 0, -0.16), 0.4, 0.06, gold)]
    cape = box((0, 0.36, -0.55), (0.78, 0.05, 0.78), red, bevel=0.03)
    parts.append(cape)
    parts.append(box((0, 0.2, -0.2), (0.62, 0.06, 0.14), red, rot=(0.5, 0, 0)))
    parts.append(sphere((0, -0.42, -0.17), 0.07, gold))
    return parts


def pet_star_collar():
    ring = mat("obojek", "#5a6cff", rough=0.45)
    gold = mat("hvezda", "#ffd24d", rough=0.25, metal=0.8, emit=0.4)
    parts = [torus((0, 0, -0.18), 0.42, 0.06, ring)]
    parts += star((0, -0.47, -0.3), 0.16, gold)
    return parts


PETS = {
    "spacesuit": pet_spacesuit,
    "sailor-collar": pet_sailor_collar,
    "acorn-cap": pet_acorn_cap,
    "knight-cape": pet_knight_cape,
    "star-collar": pet_star_collar,
}


# -------------------------------------------------------------------------------------------- avatary
def av_antenna_helmet():
    steel = mat("helma", "#b9c4d8", rough=0.28, metal=0.7)
    dark = mat("pasek", "#4a5268", rough=0.4, metal=0.6)
    glow = mat("svetylko", "#4fd8ff", emit=3.5)
    parts = [sphere((0, 0.02, 1.62), 0.54, steel, scale=(1, 1, 0.82)), torus((0, 0, 1.58), 0.52, 0.045, dark)]
    for s in (-1, 1):
        parts.append(cyl((s * 0.22, 0.05, 2.06), 0.02, 0.32, dark, rot=(0, s * 0.25, 0)))
        parts.append(sphere((s * 0.28, 0.05, 2.23), 0.06, glow))
    return parts


def av_pearl_necklace():
    pearl = mat("perla", "#f6f2ff", rough=0.15, coat=1.0)
    gold = mat("spona", "#ffc933", rough=0.25, metal=0.9)
    parts = []
    n = 18
    for k in range(n):
        a = k * TAU / n
        # sklouzává před hrudník (vpředu níž)
        front = max(0.0, -math.cos(a))
        parts.append(sphere((math.sin(a) * 0.3, -math.cos(a) * 0.32, 0.93 - 0.1 * front), 0.05, pearl, seg=16, rings=10))
    parts.append(sphere((0, -0.33, 0.8), 0.08, gold))
    return parts


def av_leaf_wreath():
    leaf = mat("list", "#4fb85a", rough=0.5)
    leaf2 = mat("list2", "#8fd070", rough=0.5)
    berry = mat("bobule", "#e5484d", rough=0.35, coat=0.6)
    parts = []
    n = 14
    for k in range(n):
        a = k * TAU / n
        x, y = math.sin(a) * 0.47, 0.04 - math.cos(a) * 0.45
        parts.append(sphere((x, y, 1.76 + 0.03 * math.sin(k * 2.1)), 0.11, leaf if k % 2 else leaf2, scale=(1.0, 0.45, 0.28), rot=(0.4, 0, a + math.pi / 2), seg=16, rings=8))
    for k in range(5):
        a = k * TAU / 5 + 0.3
        parts.append(sphere((math.sin(a) * 0.48, 0.04 - math.cos(a) * 0.46, 1.82), 0.04, berry, seg=12, rings=8))
    parts.append(torus((0, 0.04, 1.74), 0.46, 0.025, mat("liana", "#5a8a3a"), seg=32))
    return parts


def av_knight_helmet():
    steel = mat("prilba", "#c9ced8", rough=0.25, metal=0.85)
    dark = mat("tmava", "#5a6275", rough=0.35, metal=0.7)
    plume = mat("chochol", "#c0392b", rough=0.6)
    parts = [sphere((0, 0.02, 1.64), 0.55, steel, scale=(1, 1, 0.86)), torus((0, 0, 1.62), 0.54, 0.05, dark)]
    parts.append(box((0, -0.5, 1.75), (0.14, 0.05, 0.3), dark, bevel=0.01))
    for s in (-1, 1):
        parts.append(box((s * 0.52, 0.0, 1.3), (0.08, 0.3, 0.5), steel, bevel=0.02))
    parts.append(box((0, 0.0, 2.2), (0.06, 0.34, 0.32), plume, rot=(0.15, 0, 0), bevel=0.02))
    parts.append(sphere((0, 0.05, 2.28), 0.14, plume, scale=(0.5, 1.2, 0.8)))
    return parts


def av_witch_hat():
    hat = mat("klobouk", "#3a2a6a", rough=0.6)
    band = mat("stuha", "#ffd24d", rough=0.4)
    gold = mat("spona", "#ffc933", rough=0.25, metal=0.9)
    parts = [cyl((0, 0, 1.8), 0.72, 0.045, hat), cone((0.02, 0.1, 2.3), 0.38, 1.0, hat, rot=(0.32, 0, 0.06)), torus((0, 0, 1.87), 0.37, 0.055, band)]
    parts.append(box((0, -0.38, 1.87), (0.14, 0.04, 0.14), gold))
    parts += star((0.12, -0.2, 2.38), 0.08, mat("hvezda", "#ffd24d", emit=1.5))
    return parts


def av_cape_of_stars():
    cape = mat("plast", "#1c2a6e", rough=0.65)
    star_m = mat("hvezda", "#ffd24d", rough=0.3, emit=1.8)
    gold = mat("spona", "#ffc933", rough=0.25, metal=0.9)
    parts = [box((0, 0.34, 0.5), (0.88, 0.06, 0.95), cape, rot=(-0.1, 0, 0), bevel=0.03)]
    parts.append(torus((0, 0, 0.9), 0.3, 0.06, cape))
    parts.append(sphere((-0.17, -0.3, 0.88), 0.055, gold))
    parts.append(sphere((0.17, -0.3, 0.88), 0.055, gold))
    for k, (x, z) in enumerate([(-0.25, 0.9), (0.2, 0.75), (-0.05, 0.55), (0.28, 0.4), (-0.28, 0.35), (0.0, 0.2)]):
        parts += star((x, 0.38, z), 0.07 + 0.01 * (k % 2), star_m)
    return parts


def bone(p1, p2, r, m):
    """Válec mezi dvěma body."""
    from mathutils import Vector

    a, b = Vector(p1), Vector(p2)
    d = b - a
    o = cyl(((a + b) / 2).to_tuple(), r, d.length, m, verts=12)
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    return o


def membrane(points, m, thick=0.03):
    """Plochá blána z polygonu (body v rovině kolmé k Y) vytlačená do tloušťky."""
    import bmesh

    me = bpy.data.meshes.new("blana")
    bm = bmesh.new()
    face = bm.faces.new([bm.verts.new(p) for p in points])
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    bmesh.ops.translate(bm, vec=(0, thick, 0), verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("blana", me)
    bpy.context.scene.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    return _new(o, m)


def av_dragon_wings():
    skin = mat("kridlo", "#8a4ae8", rough=0.5)
    bone_m = mat("kost", "#4a2090", rough=0.45)
    tip = mat("hrot", "#ffd24d", rough=0.4)
    y = 0.4
    parts = []
    for s in (-1, 1):
        sh = (s * 0.24, y, 1.0)  # rameno
        elbow = (s * 0.8, y, 1.62)  # loket (nejvyšší bod křídla)
        fingers = [(s * 1.45, y, 1.75), (s * 1.55, y, 1.12), (s * 1.25, y, 0.5)]
        low = (s * 0.3, y, 0.42)
        # blána: rameno, loket, špičky prstů se zubatým okrajem mezi nimi, dolní úchyt
        poly = [sh, elbow, fingers[0], ((fingers[0][0] + fingers[1][0]) / 2 - s * 0.3, y, (fingers[0][2] + fingers[1][2]) / 2 - 0.12), fingers[1],
                ((fingers[1][0] + fingers[2][0]) / 2 - s * 0.3, y, (fingers[1][2] + fingers[2][2]) / 2 - 0.12), fingers[2], low]
        if s < 0:
            poly = poly[::-1]
        parts.append(membrane(poly, skin))
        yb = y + 0.05  # kosti jsou na zadní straně blány, aby je bylo vidět
        up = lambda p: (p[0], yb, p[2])  # noqa: E731
        parts.append(bone(up(sh), up(elbow), 0.045, bone_m))
        parts.append(sphere(up(elbow), 0.065, bone_m))
        for f in fingers:
            parts.append(bone(up(elbow), up(f), 0.03, bone_m))
            parts.append(sphere(up(f), 0.05, tip))
    return parts


AVATARS = {
    "antenna-helmet": av_antenna_helmet,
    "pearl-necklace": av_pearl_necklace,
    "leaf-wreath": av_leaf_wreath,
    "knight-helmet": av_knight_helmet,
    "witch-hat": av_witch_hat,
    "cape-of-stars": av_cape_of_stars,
    "dragon-wings": av_dragon_wings,
}


# ------------------------------------------------------------------------------------------- export
def export(parts, name, outdir, ref):
    obj = join(parts, ref)
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(outdir, exist_ok=True)
    raw = f"{TMP}/{ref}.glb"
    bpy.ops.export_scene.gltf(filepath=raw, export_format="GLB", export_apply=True, export_yup=True, export_animations=False, export_lights=False, export_cameras=False)
    out = os.path.join(outdir, f"{ref}.glb")
    tool = os.environ.get("GLTF_TRANSFORM", "gltf-transform")
    subprocess.run([tool, "draco", raw, out], check=True, capture_output=True)
    print(f"EXPORT {name}: {os.path.getsize(out) // 1024} kB", flush=True)
    return obj


def preview(path, avatar, center, size):
    """Náhled 512 × 512 s průhledným pozadím (Cycles); kamera se řídí rozměrem modelu."""
    from mathutils import Vector

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = 40
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "AgX"
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = hexc("#e8eeff")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
    sc.world = w
    for (rot, en) in [((math.radians(55), 0, math.radians(-30)), 3.0), ((math.radians(70), 0, math.radians(140)), 1.2)]:
        ld = bpy.data.lights.new("s", "SUN")
        ld.energy = en
        lo = bpy.data.objects.new("s", ld)
        sc.collection.objects.link(lo)
        lo.rotation_euler = rot
    cam = bpy.data.cameras.new("c")
    cam.type = "ORTHO"
    cam.ortho_scale = size * 1.35
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    # pohled zpředu (mazlíček) nebo šikmo zezadu (plášť, křídla)
    d = Vector((0.55, 0.8, 0.25)) if avatar else Vector((0.25, -1.0, 0.18))
    d.normalize()
    co.location = Vector(center) + d * 10
    co.rotation_euler = (Vector(center) - co.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.resolution_x = sc.render.resolution_y = 512
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    want = [x for x in a if not x.startswith("--")]
    stills = "--stills" in a
    jobs = [(f"pet-{k}", f, OUT_PET, k, False) for k, f in PETS.items()] + [(k, f, OUT_AV, k, True) for k, f in AVATARS.items()]
    for name, fn, outdir, ref, avatar in jobs:
        if want != ["all"] and name not in want:
            continue
        A.reset()
        obj = export(fn(), name, outdir, ref)
        if stills:
            from PIL import Image

            png = os.path.join(outdir, f"{ref}.png")
            raw = f"{TMP}/{ref}.png"
            vs = [v.co for v in obj.data.vertices]
            mn = [min(v[i] for v in vs) for i in range(3)]
            mx = [max(v[i] for v in vs) for i in range(3)]
            preview(raw, avatar, [(mn[i] + mx[i]) / 2 for i in range(3)], max(mx[i] - mn[i] for i in range(3)))
            im = Image.open(raw)
            bb = im.getbbox()
            if bb:
                im = im.crop(bb)
                s = 480 / max(im.size)
                im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
                canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
                canvas.paste(im, ((512 - im.width) // 2, (512 - im.height) // 2))
                canvas.save(png)
            print(f"STILLS {name}", flush=True)
