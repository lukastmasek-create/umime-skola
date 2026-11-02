"""Přidá všem 3D avatarům další animace (NLA stopy vedle „klid“ a „radost“) přes bpy.

    python umime-art/blender/avatary_animace.py -- all
    python umime-art/blender/avatary_animace.py -- astronaut fox

Postup pro každý public/avatars-3d/<id>.glb:
  1. gltf-transform copy rozbalí Draco (importér v bpy ho nezná),
  2. bpy model naimportuje a do uzlů <id>_telo, <id>_hlava, <id>_rameno_leva/prava a <id>_ocas nahraje nové klipy,
  3. export GLB (stopy NLA = klipy) a gltf-transform draco ho znovu zkomprimuje.
Skript je idempotentní: klip, který model už má, se přeskočí. Proměnná GLTF_TRANSFORM určuje cestu k nástroji.

Klipy (24 snímků/s), podle toho, k čemu se na webu hodí:
  pozdrav, tanec, tleskani, fandeni   – oslavy (stupně vítězů, fanoušci u stolů)
  salto                               – skok s přemetem pro 1. místo
  premysleni, psani, cteni            – klidné činnosti (notebook, kniha)
  jedeni, piti                        – občerstvení u stolů
  fotka                               – focení s fotoaparátem
  smutek, unava                       – prohra a ospalost
Postavy se dívají do -Y, paže visí dolů a otáčejí se kolem ramen: rotace kolem X je předpažení (záporná = dopředu),
kolem Y upažení (záporná u pravé ruky = nahoru stranou), viz klip „radost“ v avatary3d.py.
"""
import math
import os
import subprocess
import sys

import bpy
from mathutils import Euler, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "..", "public", "avatars-3d"))
TMP = os.environ.get("AVATAR_TMP", "/tmp/avatary-animace")
TOOL = os.environ.get("GLTF_TRANSFORM", "gltf-transform")
FPS = 24
PI = math.pi

# --------------------------------------------------------------------------------------------- pózy
# Póza = {role: {"r": (x, y, z) otočení, "l": (x, y, z) posun, "s": (x, y, z) měřítko}}; vše relativně k základní poloze.
# Role: telo, hlava, pl (paže levá), pp (paže pravá), ocas.


def sampled(frames, fn, step=2):
    """Vzorkuje funkci fn(u) (u = 0..1) po `step` snímcích; první a poslední snímek se musí rovnat klidové póze."""
    out = []
    f = 1
    while f < frames:
        out.append((f, fn((f - 1) / (frames - 1))))
        f += step
    out.append((frames, fn(1.0)))
    return out


def env(u, a=0.12, b=0.12):
    """Náběh a doběh 0..1..0, ať klip navazuje na klid bez skoku."""
    return min(1.0, u / a, (1 - u) / b)


def s(x):
    return math.sin(x)


def clips():
    c = {}

    # Pozdrav: pravá ruka nahoře mává, hlava se mírně nakloní.
    def wave(u):
        k = env(u, 0.15, 0.15)
        return {
            "pp": {"r": (0.0, -2.45 * k, 0.35 * k * s(u * PI * 10))},
            "hlava": {"r": (0, 0.05 * k, 0.12 * k)},
            "telo": {"r": (0, 0, -0.04 * k)},
        }
    c["pozdrav"] = (40, wave)

    # Tanec: houpání boky, střídavě paže nahoru, poskakování, hlava do rytmu (smyčka 2 s).
    def dance(u):
        k = env(u, 0.08, 0.08)
        t = u * PI * 8
        return {
            "telo": {"r": (0, 0.18 * s(t / 2) * k, 0.14 * s(t) * k), "l": (0, 0, 0.07 * abs(s(t)) * k), "s": (1 + 0.02 * s(t * 2) * k, 1 + 0.02 * s(t * 2) * k, 1 - 0.03 * s(t * 2) * k)},
            "hlava": {"r": (0.05 * s(t * 2) * k, 0.12 * s(t / 2) * k, -0.1 * s(t) * k)},
            "pl": {"r": (0, 1.6 * k * (0.5 + 0.5 * s(t)), 0.2 * s(t * 2) * k)},
            "pp": {"r": (0, -1.6 * k * (0.5 - 0.5 * s(t)), 0.2 * s(t * 2) * k)},
            "ocas": {"r": (0, 0, 0.4 * s(t * 2) * k)},
        }
    c["tanec"] = (48, dance)

    # Tleskání: obě paže před tělem, ruce se rytmicky potkávají, tělo lehce poskakuje.
    def clap(u):
        k = env(u, 0.1, 0.1)
        t = u * PI * 12
        hit = 0.5 + 0.5 * s(t)
        return {
            "pl": {"r": (-1.35 * k, 0.55 * k * hit - 0.15 * k, 0)},
            "pp": {"r": (-1.35 * k, -0.55 * k * hit + 0.15 * k, 0)},
            "telo": {"l": (0, 0, 0.04 * abs(s(t / 2)) * k), "r": (0.04 * k * s(t), 0, 0)},
            "hlava": {"r": (-0.06 * k, 0, 0.05 * s(t / 2) * k)},
        }
    c["tleskani"] = (36, clap)

    # Fandění: obě ruce nahoře pumpují, postava poskakuje a vykřikuje (náklon dozadu).
    def cheer(u):
        k = env(u, 0.1, 0.1)
        t = u * PI * 8
        up = 0.5 + 0.5 * s(t)
        return {
            "pl": {"r": (0, 2.3 * k + 0.4 * k * up, 0.1 * s(t) * k)},
            "pp": {"r": (0, -2.3 * k - 0.4 * k * (1 - up), -0.1 * s(t) * k)},
            "telo": {"l": (0, 0, 0.11 * abs(s(t / 2)) * k), "s": (1, 1, 1 - 0.05 * (1 - abs(s(t / 2))) * k)},
            "hlava": {"r": (-0.18 * k, 0, 0.08 * s(t) * k)},
        }
    c["fandeni"] = (36, cheer)

    # Salto: přikrčení, odraz, přemet vzad o 360° a dopad, ruce při výskoku vzhůru.
    def flip(u):
        crouch = max(0.0, 1 - abs(u - 0.12) / 0.12) if u < 0.24 else 0.0
        air = max(0.0, min(1.0, (u - 0.22) / 0.56))
        land = max(0.0, 1 - abs(u - 0.86) / 0.1) if u > 0.78 else 0.0
        return {
            "telo": {"r": (-2 * PI * air * air * (3 - 2 * air) if air < 1 else 0, 0, 0), "l": (0, 0, 0.55 * s(air * PI)), "s": (1 + 0.05 * crouch + 0.07 * land, 1 + 0.05 * crouch + 0.07 * land, 1 - 0.12 * crouch - 0.1 * land)},
            "pl": {"r": (0, 2.4 * (air > 0) * s(air * PI), 0)},
            "pp": {"r": (0, -2.4 * (air > 0) * s(air * PI), 0)},
            "hlava": {"r": (0.2 * s(air * PI), 0, 0)},
        }
    c["salto"] = (30, flip)

    # Přemýšlení: pravá ruka u brady, hlava nakloněná, tělo mírně se kolébá.
    def think(u):
        k = env(u, 0.2, 0.2)
        return {
            "pp": {"r": (-2.35 * k, -0.35 * k, 0.0)},
            "hlava": {"r": (0.1 * k, 0.28 * k * s(u * PI * 2), 0.16 * k)},
            "telo": {"r": (0, 0, 0.04 * k * s(u * PI * 2)), "s": (1, 1, 1 + 0.01 * s(u * PI * 4) * k)},
            "pl": {"r": (-0.5 * k, 0.05 * k, 0)},
        }
    c["premysleni"] = (72, think)

    # Psaní: obě paže dopředu, drobné klepání a pohledy na obrazovku.
    def typing(u):
        k = env(u, 0.1, 0.1)
        t = u * PI * 24
        return {
            "pl": {"r": (-1.15 * k + 0.07 * k * s(t), 0.12 * k, 0)},
            "pp": {"r": (-1.15 * k + 0.07 * k * s(t + 1.7), -0.12 * k, 0)},
            "hlava": {"r": (0.14 * k, 0.1 * k * s(u * PI * 4), 0)},
            "telo": {"r": (0.06 * k, 0, 0)},
        }
    c["psani"] = (48, typing)

    # Čtení: paže drží knihu před tělem, hlava skloněná, občas se otočí stránka (kývnutí).
    def read(u):
        k = env(u, 0.15, 0.15)
        return {
            "pl": {"r": (-1.25 * k, 0.45 * k, 0)},
            "pp": {"r": (-1.25 * k, -0.45 * k, 0)},
            "hlava": {"r": (0.3 * k + 0.05 * k * s(u * PI * 6), 0.12 * k * s(u * PI * 2), 0)},
            "telo": {"r": (0.05 * k, 0, 0)},
        }
    c["cteni"] = (60, read)

    # Jedení: pravá ruka opakovaně k puse, tělo se předkloní, žvýkání (drobné stlačení hlavy).
    def eat(u):
        k = env(u, 0.1, 0.1)
        cyc = (u * 2) % 1
        to_mouth = s(min(1.0, cyc / 0.5) * PI) if cyc < 0.5 else 0.0
        chew = s(u * PI * 20) if cyc >= 0.5 else 0.0
        return {
            "pp": {"r": (-2.2 * to_mouth * k, -0.3 * to_mouth * k, 0)},
            "hlava": {"r": (0.12 * to_mouth * k + 0.03 * chew * k, 0, 0), "s": (1 + 0.015 * chew * k, 1 + 0.015 * chew * k, 1 - 0.02 * chew * k)},
            "telo": {"r": (0.07 * to_mouth * k, 0, 0)},
        }
    c["jedeni"] = (60, eat)

    # Pití: ruka zvedne sklenici, hlava se zaklání, po loku spokojené zakývání.
    def drink(u):
        k = env(u, 0.1, 0.1)
        lift = s(max(0.0, min(1.0, (u - 0.1) / 0.55)) * PI) if u < 0.65 else 0.0
        return {
            "pp": {"r": (-2.1 * lift * k, -0.3 * lift * k, 0)},
            "hlava": {"r": (-0.28 * lift * k + 0.06 * k * s(max(0.0, u - 0.7) * PI * 6), 0, 0)},
            "telo": {"r": (-0.05 * lift * k, 0, 0)},
        }
    c["piti"] = (60, drink)

    # Focení: obě ruce před obličejem s fotoaparátem, v okamžiku blesku cuknutí, pak se rozhlédne.
    def photo(u):
        k = env(u, 0.12, 0.12)
        flash = max(0.0, 1 - abs(u - 0.55) / 0.05)
        return {
            "pl": {"r": (-2.0 * k, 0.55 * k, 0)},
            "pp": {"r": (-2.0 * k, -0.55 * k, 0)},
            "hlava": {"r": (-0.04 * k - 0.08 * flash, 0.18 * k * s(u * PI * 3), 0)},
            "telo": {"r": (0.05 * k - 0.07 * flash, 0, 0), "l": (0, 0, 0.03 * flash)},
        }
    c["fotka"] = (48, photo)

    # Smutek: sklopená hlava, svěšená ramena, pomalé povzdechnutí.
    def sad(u):
        k = env(u, 0.25, 0.25)
        sigh = s(u * PI * 3)
        return {
            "hlava": {"r": (0.42 * k + 0.03 * sigh * k, 0.1 * k * s(u * PI * 2), 0)},
            "telo": {"r": (0.12 * k, 0, 0), "s": (1, 1, 1 - 0.04 * k + 0.012 * sigh * k)},
            "pl": {"r": (0.12 * k, -0.18 * k, 0)},
            "pp": {"r": (0.12 * k, 0.18 * k, 0)},
            "ocas": {"r": (0, 0, 0.05 * k)},
        }
    c["smutek"] = (72, sad)

    # Únava: zívnutí (roztažení, zaklonění), pak hlava klesá a trhne se zpátky.
    def sleepy(u):
        k = env(u, 0.12, 0.12)
        yawn = s(max(0.0, min(1.0, u / 0.4)) * PI)
        nod = s(max(0.0, (u - 0.45) / 0.4) * PI * 2) if u > 0.45 else 0.0
        return {
            "hlava": {"r": (-0.22 * yawn * k + 0.3 * nod * k, 0, 0.06 * nod * k)},
            "pl": {"r": (0, 1.1 * yawn * k, 0)},
            "pp": {"r": (0, -1.1 * yawn * k, 0)},
            "telo": {"s": (1 + 0.03 * yawn * k, 1 + 0.03 * yawn * k, 1 + 0.06 * yawn * k - 0.03 * nod * k), "r": (0.06 * nod * k, 0, 0)},
        }
    c["unava"] = (72, sleepy)
    return c


# --------------------------------------------------------------------------------------------- Blender
def find(aid):
    """Uzly postavy podle role; chybějící (např. ocas) se přeskočí."""
    n = bpy.data.objects
    # Předpona uzlů bývá jiná než název souboru (kočka je „kocka“): bere se z kořene avatar_<předpona>.
    root = next((o.name for o in n if o.parent is None and o.name.startswith("avatar_")), None)
    if root:
        aid = root[len("avatar_"):]
    names = {"telo": f"{aid}_telo", "hlava": f"{aid}_hlava", "pl": f"{aid}_rameno_leva", "pp": f"{aid}_rameno_prava", "ocas": f"{aid}_ocas"}
    return {role: n[name] for role, name in names.items() if name in n}


def add_clip(nodes, base, name, frames, fn):
    """Vytvoří akci se stopou NLA `name`; póza se nastaví na každém vzorku a klíčuje (rotace jako kvaternion jako při importu)."""
    acts = {}
    for role, obj in nodes.items():
        if obj.animation_data is None:
            obj.animation_data_create()
        acts[role] = bpy.data.actions.new(f"{obj.name}_{name}")
        obj.animation_data.action = acts[role]
    for frame, pose in sampled(frames, fn):
        for role, obj in nodes.items():
            b = base[role]
            p = pose.get(role, {})
            rot = Euler(p.get("r", (0, 0, 0)), "XYZ").to_quaternion()
            obj.rotation_mode = "QUATERNION"
            obj.rotation_quaternion = b["q"] @ rot
            obj.location = b["l"] + Vector(p.get("l", (0, 0, 0)))
            ps = p.get("s", (1, 1, 1))
            obj.scale = (b["s"][0] * ps[0], b["s"][1] * ps[1], b["s"][2] * ps[2])
            for path in ("rotation_quaternion", "location", "scale"):
                obj.keyframe_insert(data_path=path, frame=frame)
    for role, obj in nodes.items():
        track = obj.animation_data.nla_tracks.new()
        track.name = name
        track.strips.new(name, 1, acts[role])
        obj.animation_data.action = None
        b = base[role]
        obj.rotation_quaternion, obj.location, obj.scale = b["q"], b["l"], b["s"]


def process(aid):
    src = os.path.join(OUT, f"{aid}.glb")
    os.makedirs(TMP, exist_ok=True)
    raw_in, raw_out = f"{TMP}/{aid}-in.glb", f"{TMP}/{aid}-out.glb"
    subprocess.run([TOOL, "copy", src, raw_in], check=True, capture_output=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS
    bpy.ops.import_scene.gltf(filepath=raw_in)
    nodes = find(aid)
    if "telo" not in nodes or "hlava" not in nodes:
        print(f"PŘESKOČENO {aid}: chybí tělo nebo hlava", flush=True)
        return False
    have = {t.name for o in nodes.values() if o.animation_data for t in o.animation_data.nla_tracks}
    base = {}
    for role, obj in nodes.items():
        obj.rotation_mode = "QUATERNION"
        base[role] = {"q": obj.rotation_quaternion.copy(), "l": obj.location.copy(), "s": obj.scale.copy()}
    todo = {k: v for k, v in clips().items() if k not in have}
    if not todo:
        print(f"HOTOVO {aid}: všechny klipy už jsou", flush=True)
        return False
    for name, (frames, fn) in todo.items():
        add_clip(nodes, base, name, frames, fn)
    sc.frame_start, sc.frame_end = 1, 80
    bpy.ops.export_scene.gltf(filepath=raw_out, export_format="GLB", export_apply=True, export_yup=True, export_animations=True, export_animation_mode="NLA_TRACKS", export_lights=False, export_cameras=False)
    subprocess.run([TOOL, "draco", raw_out, src], check=True, capture_output=True)
    print(f"OK {aid}: +{len(todo)} klipů, {os.path.getsize(src) // 1024} kB", flush=True)
    return True


if __name__ == "__main__":
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ids = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".glb")) if a == ["all"] else a
    for aid in ids:
        process(aid)
