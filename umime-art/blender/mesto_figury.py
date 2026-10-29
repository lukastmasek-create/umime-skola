"""Obyvatelé, zvířata a drobnosti pro městečko „Jak to funguje“ (smyčky snímků 256 px, průhledné pozadí).

Každá postava je malá hračková kostra z pivotů (kyčel–koleno, rameno–loket), všechny pohyby se počítají
z fáze t (0..1) sinusy s celým počtem period, takže smyčka je plynulá. Postavy hledí doprava (+x), kamera
je ortografická z boku s malým náklonem; web je případně zrcadlí.

Spuštění: python mesto_figury.py -- <práce> [--preview]   (každá práce ve vlastním procesu, viz BLENDER_ANIM.md)
Práce: hrdina_chuze hrdina_stoji hrdina_radost knihovnice pekar farmar babicka kluk
       pes_bezi pes_sedi kocka ovce slepice kralik ptak ryba mlyn
Výstup: out/mf_<práce>/f_0001.png …
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from znacky_lib import *

PREVIEW = "--preview" in args()
S = 256
_M = {}


def M(name, color, roughness=0.6, metallic=0.0):
    if name not in _M:
        _M[name] = material(name, color, roughness=roughness, metallic=metallic)
    return _M[name]


def stage(name, frames, ortho=2.0, target_z=0.62, samples=None, el=9):
    """Průhledné jeviště se stejným soumrakovým světlem jako městečko."""
    sc = reset(S, S, frames, samples=samples or (24 if PREVIEW else 72), name=name, world=("#8c84d8", 0.95), view="AgX", look="AgX - Punchy")
    sc.view_settings.exposure = 0.5
    sc.render.film_transparent = True
    e = math.radians(el)
    add_camera((0, -12 * math.cos(e), 12 * math.sin(e) + target_z), (0, 0, target_z), ortho_scale=ortho)
    add_sun((math.radians(52), math.radians(8), math.radians(-48)), energy=3.4, color="#c8d4ff", angle=0.2)
    add_sun((math.radians(78), math.radians(0), math.radians(112)), energy=2.0, color="#ffa66a", angle=0.3)
    add_area((-4, -8, 5), (0, 0, 0.6), energy=500, size=8, color="#9fa8ff")
    return sc


def empty(parent=None, loc=(0, 0, 0)):
    o = bpy.data.objects.new("p", None)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent
    o.location = loc
    return o


def put(o, parent, loc=None, scale=None):
    """Připojí hotový objekt k pivotu (souřadnice jsou pak lokální vůči pivotu)."""
    o.parent = parent
    if loc is not None:
        o.location = loc
    if scale is not None:
        o.scale = scale
    return o


def limb(parent, loc, length, r, mat, end_mat=None, end_r=None):
    """Končetina: pivot v kloubu, válec dolů a koule na konci. Vrací (pivot, konec)."""
    piv = empty(parent, loc)
    put(cyl((0, 0, 0), r, length, mat, verts=14), piv, (0, 0, -length / 2))
    put(sphere((0, 0, 0), r * 1.02, mat, seg=14, rings=10), piv, (0, 0, 0))
    tip = empty(piv, (0, 0, -length))
    put(sphere((0, 0, 0), end_r or r * 1.02, end_mat or mat, seg=14, rings=10), tip)
    return piv, tip


# ---------------------------------------------------------------- člověk
def person(skin="#ffd5a8", top="#ff5a3c", bottom="#2f3c6e", shoes="#3a2a22", hair="#6a3b22", hat=None, hat_c="#ffc933",
           skirt=None, scale=1.0, cheeks=True, glasses=False, apron=None, scarf=None, pack=None, beard=None, patch=False, coat=None):
    root = empty()
    pivot_y = empty(root)  # celé tělo (kolébání)
    sk = M("kuze" + skin, skin, 0.55)
    topm, botm, shm = M("top" + top, top, 0.6), M("dno" + bottom, bottom, 0.6), M("boty" + shoes, shoes, 0.7)
    # trup
    torso = empty(pivot_y, (0, 0, 0.62))
    put(sphere((0, 0, 0), 0.19, topm, scale=(0.82, 0.78, 1.2), seg=24, rings=16), torso, (0, 0, 0.08))
    if skirt:
        put(cone((0, 0, 0), 0.3, 0.17, 0.42, M("sukne" + skirt, skirt, 0.65), verts=28), torso, (0, 0, -0.13))
    else:
        put(sphere((0, 0, 0), 0.17, botm, scale=(0.85, 0.78, 0.7), seg=20, rings=12), torso, (0, 0, -0.1))
    if apron:
        put(box((0, 0, 0), (0.27, 0.05, 0.36), M("zastera" + apron, apron, 0.7), bevel=0.02), torso, (0.1, -0.15, 0.0), None)
    if scarf:
        put(torus((0, 0, 0), 0.14, 0.04, M("satek" + scarf, scarf, 0.7), rot=(0, 0, 0)), torso, (0, 0, 0.27))
        put(box((0, 0, 0), (0.07, 0.04, 0.2), M("satek" + scarf, scarf, 0.7), rot=(0, 0.2, 0), bevel=0.01), torso, (-0.12, -0.1, 0.17))
    if pack:
        put(box((0, 0, 0), (0.2, 0.3, 0.38), M("batoh" + pack, pack, 0.55), bevel=0.05), torso, (-0.21, 0, 0.08))
        put(box((0, 0, 0), (0.07, 0.24, 0.16), M("batoh2", "#ffd24d", 0.55), bevel=0.02), torso, (-0.31, 0, 0.04))
        for sy in (-1, 1):
            put(box((0, 0, 0), (0.06, 0.035, 0.34), M("popruh", "#2a3550", 0.7), bevel=0.01), torso, (0.0, sy * 0.1, 0.1))
    # hlava
    head = empty(torso, (0.02, 0, 0.4))
    put(sphere((0, 0, 0), 0.2, sk, scale=(1.0, 0.95, 0.98), seg=28, rings=20), head, (0, 0, 0.08))
    eyes = []
    for sy in (-1, 1):
        e = empty(head, (0.17, sy * 0.075, 0.115))
        put(sphere((0, 0, 0), 0.05, M("oko_b", "#ffffff", 0.3), scale=(0.7, 1, 1.15), seg=12, rings=8), e)
        put(sphere((0, 0, 0), 0.031, M("oko_c", "#16132b", 0.3), seg=10, rings=8), e, (0.026, 0, 0))
        eyes.append(e)
        if cheeks:
            put(sphere((0, 0, 0), 0.04, M("tvare", "#ff9a9a", 0.6), scale=(0.4, 1, 0.7), seg=8, rings=6), head, (0.17, sy * 0.115, 0.03))
        if glasses:
            put(torus((0, 0, 0), 0.052, 0.008, M("bryle", "#2a2438", 0.4), rot=(0, math.radians(90), 0)), head, (0.19, sy * 0.075, 0.115))
    put(sphere((0, 0, 0), 0.028, M("nos", "#ffb890", 0.5), seg=10, rings=8), head, (0.2, 0, 0.065))
    # úsměv: tenký oblouk
    put(sphere((0, 0, 0), 0.03, M("usta", "#b8383a", 0.5), scale=(0.3, 1.2, 0.4), seg=10, rings=8), head, (0.19, 0, 0.0))
    # vlasy / klobouky
    hm = M("vlasy" + hair, hair, 0.7)
    if hat is None or hat in ("cap", "bun", "kerchief", "tricorn", "captain", "crown", "wizard", "diver", "flower"):
        put(sphere((0, 0, 0), 0.205, hm, scale=(1.0, 1.0, 0.8), seg=24, rings=14), head, (-0.06, 0, 0.17))
        put(sphere((0, 0, 0), 0.19, hm, scale=(0.7, 1.0, 0.9), seg=16, rings=10), head, (-0.14, 0, 0.05))
    if hat == "cap":
        hc = M("ciapka" + hat_c, hat_c, 0.55)
        put(sphere((0, 0, 0), 0.22, hc, scale=(1.0, 1.0, 0.55), seg=24, rings=12), head, (-0.01, 0, 0.2))
        put(box((0, 0, 0), (0.16, 0.2, 0.025), hc, bevel=0.01), head, (0.2, 0, 0.19))
    elif hat == "bun":
        put(sphere((0, 0, 0), 0.085, hm, seg=14, rings=10), head, (-0.1, 0, 0.3))
    elif hat == "straw":
        hc = M("slamak", "#f2d27a", 0.8)
        put(cyl((0, 0, 0), 0.34, 0.035, hc, verts=32), head, (0, 0, 0.2))
        put(cyl((0, 0, 0), 0.19, 0.16, hc, verts=24), head, (0, 0, 0.27))
        put(cyl((0, 0, 0), 0.195, 0.035, M("slamak_p", "#d6453a", 0.6), verts=24), head, (0, 0, 0.24))
    elif hat == "chef":
        hc = M("kuchar", "#ffffff", 0.6)
        put(cyl((0, 0, 0), 0.17, 0.12, hc, verts=24), head, (0, 0, 0.25))
        put(sphere((0, 0, 0), 0.2, hc, scale=(1, 1, 0.7), seg=24, rings=12), head, (0, 0, 0.36))
    elif hat == "kerchief":
        hc = M("satek_h" + hat_c, hat_c, 0.65)
        put(sphere((0, 0, 0), 0.225, hc, scale=(1.0, 1.0, 0.7), seg=24, rings=12), head, (-0.02, 0, 0.17))
        put(cone((0, 0, 0), 0.07, 0.0, 0.2, hc, verts=10, rot=(0, math.radians(90), 0)), head, (-0.25, 0, 0.13))
    elif hat == "tricorn":
        hc = M("tricorn" + hat_c, hat_c, 0.6)
        put(cyl((0, 0, 0), 0.3, 0.03, hc, verts=24), head, (0, 0, 0.21))
        put(cyl((0, 0, 0), 0.17, 0.14, hc, verts=20), head, (0, 0, 0.29))
        for k, a in enumerate((0, 120, 240)):
            r = math.radians(a + 90)
            put(box((0, 0, 0), (0.26, 0.09, 0.05), hc, rot=(0, 0.45, r), bevel=0.01), head, (0.2 * math.cos(r), 0.2 * math.sin(r), 0.26))
        put(torus((0, 0, 0), 0.17, 0.012, M("trim", "#ffc933", 0.3, 0.9)), head, (0, 0, 0.23))
    elif hat == "captain":
        hc = M("captain" + hat_c, hat_c, 0.6)
        put(sphere((0, 0, 0), 0.24, hc, scale=(0.75, 1.55, 0.5), seg=24, rings=12), head, (0, 0, 0.26))
        put(sphere((0, 0, 0), 0.17, hc, scale=(1, 1, 0.8), seg=20, rings=10), head, (0, 0, 0.22))
        put(sphere((0, 0, 0), 0.05, M("pirko", "#ffffff", 0.7), scale=(0.7, 2.2, 0.35), seg=10, rings=6), head, (-0.06, 0.2, 0.36))
    elif hat == "helmet":
        gm = bpy.data.materials.get("helma_sklo")
        if gm is None:
            gm = bpy.data.materials.new("helma_sklo")
            gm.use_nodes = True
            gb = gm.node_tree.nodes["Principled BSDF"]
            gb.inputs["Base Color"].default_value = hex_rgba("#cfeaff")
            gb.inputs["Roughness"].default_value = 0.05
            for k_, v_ in (("Transmission Weight", 0.9), ("Alpha", 0.35)):
                if k_ in gb.inputs:
                    gb.inputs[k_].default_value = v_
        put(sphere((0, 0, 0), 0.31, gm, scale=(1.0, 1.0, 1.05), seg=28, rings=18), head, (0, 0, 0.1))
        put(torus((0, 0, 0), 0.3, 0.03, M("helma_kr" + hat_c, hat_c, 0.35, 0.4), rot=(0, 0, 0)), head, (0, 0, -0.14))
    elif hat == "antenna":
        am = M("anten_t" + hat_c, hat_c, 0.5)
        for sy in (-1, 1):
            put(bar((0, 0, 0), (0.0, sy * 0.06, 0.2), 0.012, M("anten_k", "#c9ced8", 0.4, 0.6), verts=6), head, (0.0, sy * 0.08, 0.26))
            put(sphere((0, 0, 0), 0.05, am, seg=10, rings=8), head, (0.0, sy * 0.14, 0.47))
    elif hat == "wizard":
        hc = M("kouzelnik" + hat_c, hat_c, 0.55)
        put(cyl((0, 0, 0), 0.3, 0.03, hc, verts=28), head, (0, 0, 0.2))
        put(cone((0, 0, 0), 0.2, 0.0, 0.55, hc, verts=24), head, (-0.02, 0, 0.5))
        put(torus((0, 0, 0), 0.2, 0.014, M("kouzelnik_p", "#ffd24d", 0.3, 0.8)), head, (0, 0, 0.24))
        put(sphere((0, 0, 0), 0.05, glow("kouzelnik_h", "#ffe58a", 4.0), seg=8, rings=6), head, (0.05, 0, 0.36))
    elif hat == "crown":
        gm = M("koruna", "#ffc933", 0.25, 0.9)
        put(torus((0, 0, 0), 0.17, 0.035, gm), head, (0, 0, 0.27))
        for k in range(5):
            a = k * math.tau / 5
            put(cone((0, 0, 0), 0.04, 0.0, 0.11, gm, verts=8), head, (0.17 * math.cos(a), 0.17 * math.sin(a), 0.34))
            put(sphere((0, 0, 0), 0.022, M("koruna_k" + str(k % 2), ["#e0453a", "#46a6ff"][k % 2], 0.2), seg=8, rings=6), head, (0.17 * math.cos(a), 0.17 * math.sin(a), 0.4))
    elif hat == "diver":
        gm = bpy.data.materials.get("helma_sklo")
        if gm is None:
            gm = bpy.data.materials.new("helma_sklo")
            gm.use_nodes = True
            gb = gm.node_tree.nodes["Principled BSDF"]
            gb.inputs["Base Color"].default_value = hex_rgba("#cfeaff")
            gb.inputs["Roughness"].default_value = 0.05
            for k_, v_ in (("Transmission Weight", 0.9), ("Alpha", 0.3)):
                if k_ in gb.inputs:
                    gb.inputs[k_].default_value = v_
        put(sphere((0, 0, 0), 0.33, gm, scale=(1.0, 1.0, 1.05), seg=28, rings=18), head, (0, 0, 0.1))
        put(torus((0, 0, 0), 0.31, 0.04, M("potapec_k" + hat_c, hat_c, 0.35, 0.7), rot=(0, 0, 0)), head, (0, 0, -0.16))
        put(sphere((0, 0, 0), 0.05, M("potapec_v", "#c9a23a", 0.3, 0.8), seg=8, rings=6), head, (-0.3, 0, 0.0))
    elif hat == "flower":
        for k in range(5):
            a = k * math.tau / 5
            put(sphere((0, 0, 0), 0.055, M("kvetH" + str(k % 2), [hat_c, "#ffffff"][k % 2], 0.5), scale=(1, 1, 0.5), seg=8, rings=6), head, (-0.05 + 0.1 * math.cos(a), 0.1 * math.sin(a), 0.3))
        put(sphere((0, 0, 0), 0.04, M("kvetS", "#ffd24d", 0.5), seg=8, rings=6), head, (-0.05, 0, 0.31))
    elif hat == "visor":
        put(box((0, 0, 0), (0.1, 0.4, 0.09), M("vizorS" + hat_c, hat_c, 0.2), bevel=0.02), head, (0.17, 0, 0.12))
    if beard:
        bm = M("vous" + beard, beard, 0.8)
        put(sphere((0, 0, 0), 0.13, bm, scale=(0.7, 1.0, 1.1), seg=14, rings=10), head, (0.13, 0, -0.04))
        put(sphere((0, 0, 0), 0.07, bm, scale=(0.6, 2.2, 0.5), seg=10, rings=8), head, (0.2, 0, 0.04))
    if patch:
        pm = M("zaplata", "#16132b", 0.5)
        put(sphere((0, 0, 0), 0.062, pm, scale=(0.4, 1.0, 1.1), seg=12, rings=8), head, (0.18, 0.075, 0.115))
    if coat:
        cm = M("kabat" + coat, coat, 0.6)
        put(sphere((0, 0, 0), 0.215, cm, scale=(0.9, 0.9, 1.05), seg=24, rings=14), torso, (0, 0, 0.07))
        put(box((0, 0, 0), (0.05, 0.04, 0.34), M("knofl", "#ffc933", 0.3, 0.9), bevel=0.01), torso, (0.2, 0, 0.08))
    # paže: rameno–loket–ruka
    arms = []
    for sy in (-1, 1):
        sh, tip1 = limb(torso, (0.0, sy * 0.2, 0.26), 0.2, 0.05, topm)
        el, tip2 = limb(tip1, (0, 0, 0), 0.2, 0.045, topm, end_mat=sk, end_r=0.055)
        arms.append((sh, el, tip2))
    # nohy: kyčel–koleno
    legs = []
    for sy in (-1, 1):
        hp, k1 = limb(pivot_y, (0, sy * 0.09, 0.5), 0.23, 0.065, botm)
        kn, k2 = limb(k1, (0, 0, 0), 0.22, 0.058, botm, end_mat=botm)
        put(sphere((0, 0, 0), 0.075, shm, scale=(1.55, 1.0, 0.7), seg=14, rings=10), k2, (0.05, 0, -0.02))
        legs.append((hp, kn))
    root.scale = (scale,) * 3
    root.rotation_euler = (0, 0, math.radians(-18))
    return {"root": root, "body": pivot_y, "torso": torso, "head": head, "eyes": eyes, "arms": arms, "legs": legs}


def blink(P, t, at=0.62, n=1):
    """Mrknutí: oči se na chvíli zploští (n mrknutí za smyčku)."""
    k = 1.0
    for i in range(n):
        d = abs(((t - at - i / n + 0.5) % 1.0) - 0.5)
        if d < 0.025:
            k = 0.1 + 0.9 * (d / 0.025)
    for e in P["eyes"]:
        e.scale = (1, 1, k)


def walk(P, t, speed=1.0, swing=0.55, bob=0.035, arms_swing=0.5, lean=0.06):
    ph = t * math.tau
    for i, (hp, kn) in enumerate(P["legs"]):
        p = ph + i * math.pi
        hp.rotation_euler = (0, -swing * math.sin(p), 0)
        kn.rotation_euler = (0, 0.95 * max(0.0, math.cos(p)) ** 1.3, 0)
    for i, (sh, el, _) in enumerate(P["arms"]):
        p = ph + i * math.pi
        sh.rotation_euler = (0, arms_swing * math.sin(p), 0)
        el.rotation_euler = (0, -0.25 - 0.3 * max(0.0, math.sin(p)), 0)
    P["body"].location.z = bob * abs(math.sin(ph)) * 1.0 - 0.01
    P["torso"].rotation_euler = (0, lean + 0.03 * math.sin(2 * ph), 0.05 * math.sin(ph))
    P["head"].rotation_euler = (0, -lean * 0.6 + 0.03 * math.sin(2 * ph + 1), -0.06 * math.sin(ph))


def idle(P, t, sway=0.012):
    ph = t * math.tau
    P["torso"].scale = (1, 1, 1 + 0.025 * math.sin(ph))
    P["torso"].rotation_euler = (0, 0.02 * math.sin(ph), 0.03 * math.sin(ph))
    P["head"].rotation_euler = (0, 0.04 * math.sin(ph + 0.8), 0.18 * math.sin(ph) * (1 if math.sin(2 * ph) > -0.2 else 0.5))
    for i, (sh, el, _) in enumerate(P["arms"]):
        sh.rotation_euler = (0.04 * math.sin(ph + i), 0.05 * math.sin(ph + i * 1.5), 0)
        el.rotation_euler = (0, -0.12, 0)
    P["body"].location.z = sway * math.sin(ph)
    for hp, kn in P["legs"]:
        hp.rotation_euler = (0, 0, 0)
        kn.rotation_euler = (0, 0, 0)


# --- hrdina: dítě s batohem ---------------------------------------------------------
def hero():
    return person(skin="#ffd5a8", top="#3b9bff", bottom="#2f3c6e", shoes="#ff5a3c", hair="#6a3b22", hat=None, scarf="#ff5a3c", pack="#ffc933", scale=0.92)


def job_hrdina_chuze():
    stage("mf_hrdina_chuze", 16, ortho=1.6, target_z=0.55)
    P = hero()
    run(lambda t: (walk(P, t), blink(P, t, 0.5)), "mf_hrdina_chuze")


def job_hrdina_stoji():
    stage("mf_hrdina_stoji", 24, ortho=1.6, target_z=0.55)
    P = hero()
    run(lambda t: (idle(P, t), blink(P, t, 0.6, 2)), "mf_hrdina_stoji")


def job_hrdina_radost():
    stage("mf_hrdina_radost", 24, ortho=1.9, target_z=0.7)
    P = hero()

    def u(t):
        ph = t * math.tau
        j = max(0.0, math.sin(ph)) ** 0.9            # skok
        land = max(0.0, -math.sin(ph))                # dřep po dopadu
        P["body"].location.z = 0.34 * j - 0.05 * land
        P["body"].scale = (1 + 0.1 * land - 0.05 * j, 1 + 0.1 * land - 0.05 * j, 1 - 0.14 * land + 0.1 * j)
        for i, (sh, el, _) in enumerate(P["arms"]):
            sh.rotation_euler = (0.0, math.pi * (0.8 + 0.2 * math.sin(ph + i)) * (0.45 + 0.55 * j) * -1 + 0.2, 0)
            el.rotation_euler = (0, -0.2, 0)
        for hp, kn in P["legs"]:
            hp.rotation_euler = (0, -0.25 * j, 0)
            kn.rotation_euler = (0, 0.55 * j + 0.5 * land, 0)
        P["head"].rotation_euler = (0, -0.15 * j, 0.08 * math.sin(ph))
        P["torso"].rotation_euler = (0, -0.05 * j, 0)
    run(u, "mf_hrdina_radost")


# --- obyvatelé -------------------------------------------------------------------------
def job_knihovnice():
    stage("mf_knihovnice", 24, ortho=1.7, target_z=0.62)
    P = person(skin="#ffd5a8", top="#a45ad6", bottom="#7a3aa0", skirt="#7a3aa0", hair="#8a8aa8", hat="bun", glasses=True, scale=0.95)
    book = box((0, 0, 0), (0.24, 0.05, 0.3), M("kniha_r", "#d6453a", 0.5), bevel=0.012)
    put(book, P["arms"][1][2], (0.08, 0, -0.02))
    P["arms"][1][2].rotation_euler = (0, 0.3, 0)

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][0]
        w = 0.5 + 0.5 * math.sin(3 * ph)
        sh.rotation_euler = (0, -2.45 + 0.1 * math.sin(ph), 0)         # paže vzhůru
        el.rotation_euler = (0, 0.5 * math.sin(3 * ph) - 0.2, 0.0)     # mávnutí předloktím
        sh0, el0, _ = P["arms"][1]
        sh0.rotation_euler = (0, -0.9, 0)
        el0.rotation_euler = (0, -1.1, 0)
        blink(P, t, 0.4, 2)
    run(u, "mf_knihovnice")


def job_pekar():
    stage("mf_pekar", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#ffd5a8", top="#ffffff", bottom="#8a6a4a", hat="chef", apron="#f3e6c8", scale=0.95, hair="#4a2a1a")
    # stůl s těstem
    box((0.38, 0, 0.36), (0.62, 0.5, 0.05), M("stul", "#c79a5e", 0.8), bevel=0.01)
    for sx in (0.12, 0.64):
        for sy in (-0.2, 0.2):
            bar((sx, sy, 0), (sx, sy, 0.36), 0.025, M("stul", "#c79a5e", 0.8), verts=8)
    dough = sphere((0.4, 0, 0.45), 0.1, M("testo", "#f6dfae", 0.9), scale=(1.5, 1.0, 0.7), seg=16, rings=10)
    for k in range(3):
        sphere((0.58 + 0.0 * k, -0.14 + k * 0.14, 0.43), 0.055, M("rohl", "#d8944a", 0.5), scale=(1.6, 0.9, 0.8), seg=12, rings=8)

    def u(t):
        ph = t * math.tau
        idle(P, t)
        for i, (sh, el, _) in enumerate(P["arms"]):
            k = math.sin(2 * ph + i * 0.8)
            sh.rotation_euler = (0, -0.75 - 0.15 * k, 0)
            el.rotation_euler = (0, -0.6 - 0.35 * k, 0)
        P["torso"].rotation_euler = (0, 0.12 + 0.05 * math.sin(2 * ph), 0.04 * math.sin(ph))
        dough.scale = (1.5 * (1 + 0.08 * math.sin(2 * ph)), 1.0, 0.7 * (1 - 0.1 * math.sin(2 * ph)))
        blink(P, t, 0.3, 2)
    run(u, "mf_pekar")


def job_farmar():
    stage("mf_farmar", 16, ortho=1.9, target_z=0.62)
    P = person(skin="#f2c9a0", top="#d6453a", bottom="#3b6fd8", hat="straw", hair="#a8743a", scale=0.95)
    sh, el, tip = P["arms"][1]
    put(bar((0, 0, 0.25), (0, 0, -0.55), 0.016, M("vidle_k", "#8a5a34", 0.8), verts=8), tip, (0.0, 0, 0.0))
    for k in (-1, 0, 1):
        put(bar((0.0, k * 0.05, -0.55), (0.0, k * 0.05, -0.75), 0.01, M("vidle", "#b8bcc8", 0.3, 0.7), verts=6), tip)
    put(bar((0, -0.05, -0.55), (0, 0.05, -0.55), 0.012, M("vidle", "#b8bcc8", 0.3, 0.7), verts=6), tip)

    def u(t):
        walk(P, t, swing=0.45, arms_swing=0.35)
        P["arms"][1][0].rotation_euler = (0, -0.5, 0)
        P["arms"][1][1].rotation_euler = (0, -0.5, 0)
        P["arms"][1][2].rotation_euler = (0, 0.3, 0)
    run(u, "mf_farmar")


def job_babicka():
    stage("mf_babicka", 16, ortho=1.7, target_z=0.55)
    P = person(skin="#f2c9a0", top="#7ee0b0", bottom="#7a5a8a", skirt="#7a5a8a", hair="#e8e8f0", hat="kerchief", hat_c="#ff8a8a", scale=0.88, scarf=None)
    sh, el, tip = P["arms"][0]
    basket = cyl((0, 0, 0), 0.13, 0.12, M("kos", "#c79a5e", 0.8), verts=18)
    put(basket, tip, (0.0, 0, -0.09))
    put(torus((0, 0, 0), 0.12, 0.012, M("kos", "#c79a5e", 0.8), rot=(math.radians(90), 0, 0)), tip, (0, 0, 0.0))
    put(sphere((0, 0, 0), 0.07, M("bochnik", "#d8944a", 0.5), scale=(1.4, 1, 0.8), seg=10, rings=8), tip, (0.0, 0, -0.04))

    def u(t):
        walk(P, t, swing=0.32, bob=0.02, arms_swing=0.25, lean=0.14)
        P["arms"][0][0].rotation_euler = (0, -0.3, 0)
        P["arms"][0][1].rotation_euler = (0, -0.85, 0)
    run(u, "mf_babicka")


def job_kluk():
    stage("mf_kluk", 24, ortho=1.7, target_z=0.55)
    P = person(skin="#f2c9a0", top="#ffd24d", bottom="#3b6fd8", hat="cap", hat_c="#d6453a", hair="#3a2a22", scale=0.78)
    ball = sphere((0, 0, 0), 0.09, M("mic", "#ff5a7a", 0.4), seg=20, rings=14)

    def u(t):
        ph = t * math.tau
        idle(P, t)
        b = abs(math.sin(ph))                       # míč odskakuje od země, zpět do ruky
        ball.location = (0.28 + 0.02 * math.sin(ph), -0.04, 0.09 + 0.55 * b)
        sh, el, _ = P["arms"][1]
        k = max(0.0, math.cos(ph / 2 * 2 - 0.0))
        sh.rotation_euler = (0, -0.55 + 0.2 * math.sin(ph + 1.5), 0)
        el.rotation_euler = (0, -0.55 - 0.15 * math.sin(ph + 1.5), 0)
        P["body"].location.z = 0.02 * abs(math.sin(ph))
        hp, kn = P["legs"][1]
        hp.rotation_euler = (0, -0.2 * max(0.0, math.sin(ph - 1.2)), 0)
        kn.rotation_euler = (0, 0.3 * max(0.0, math.sin(ph - 1.2)), 0)
        blink(P, t, 0.7, 2)
    run(u, "mf_kluk")


# ---------------------------------------------------------------- zvířata
def job_pes_bezi():
    stage("mf_pes_bezi", 16, ortho=1.3, target_z=0.28)
    root = empty()
    fur, light, dark = M("pes", "#c98a4a", 0.8), M("pes_b", "#f3dcc0", 0.8), M("pes_u", "#8a5a34", 0.8)
    body = empty(root, (0, 0, 0.3))
    put(sphere((0, 0, 0), 0.2, fur, scale=(1.55, 0.78, 0.8), seg=24, rings=16), body)
    put(sphere((0, 0, 0), 0.12, light, scale=(1.3, 0.8, 0.5), seg=14, rings=10), body, (0.04, 0, -0.09))
    head = empty(body, (0.33, 0, 0.14))
    put(sphere((0, 0, 0), 0.14, fur, scale=(1.0, 0.9, 0.9), seg=20, rings=14), head)
    put(sphere((0, 0, 0), 0.075, light, scale=(1.4, 0.9, 0.8), seg=12, rings=8), head, (0.12, 0, -0.04))
    put(sphere((0, 0, 0), 0.035, M("nos_p", "#2a2438", 0.4), seg=10, rings=8), head, (0.2, 0, -0.01))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.026, M("oko_c", "#16132b", 0.3), seg=8, rings=6), head, (0.1, sy * 0.075, 0.06))
        ear = empty(head, (-0.02, sy * 0.1, 0.1))
        put(sphere((0, 0, 0), 0.07, dark, scale=(0.5, 0.4, 1.3), seg=12, rings=8), ear, (0, sy * 0.01, -0.06))
    tail = empty(body, (-0.3, 0, 0.1))
    put(cyl((0, 0, 0), 0.03, 0.24, fur, verts=10), tail, (-0.08, 0, 0.09), None)
    tail.children[0].rotation_euler = (0, math.radians(-40), 0)
    legs = []
    for lx, sy in ((0.22, -1), (0.22, 1), (-0.2, -1), (-0.2, 1)):
        hp, t1 = limb(body, (lx, sy * 0.09, -0.08), 0.15, 0.04, fur)
        kn, t2 = limb(t1, (0, 0, 0), 0.14, 0.035, fur)
        put(sphere((0, 0, 0), 0.045, light, scale=(1.3, 1, 0.8), seg=10, rings=8), t2, (0.02, 0, -0.01))
        legs.append((hp, kn))
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        for i, (hp, kn) in enumerate(legs):
            p = ph + (0 if i in (0, 3) else math.pi)
            hp.rotation_euler = (0, -0.7 * math.sin(p), 0)
            kn.rotation_euler = (0, 0.8 * max(0.0, math.cos(p)), 0)
        body.location.z = 0.3 + 0.045 * math.sin(2 * ph + 0.6)
        body.rotation_euler = (0, 0.06 * math.sin(2 * ph), 0)
        head.rotation_euler = (0, -0.06 * math.sin(2 * ph) - 0.04, 0)
        tail.rotation_euler = (0.5 * math.sin(2 * ph), 0, 0.4 * math.sin(2 * ph))
    run(u, "mf_pes_bezi")


def job_pes_sedi():
    stage("mf_pes_sedi", 24, ortho=1.3, target_z=0.3)
    root = empty()
    fur, light, dark = M("pes", "#c98a4a", 0.8), M("pes_b", "#f3dcc0", 0.8), M("pes_u", "#8a5a34", 0.8)
    body = empty(root, (0, 0, 0.22))
    put(sphere((0, 0, 0), 0.2, fur, scale=(1.1, 0.8, 1.0), seg=24, rings=16), body, (0, 0, 0.12), (1.1, 0.8, 1.0))
    put(sphere((0, 0, 0), 0.12, light, scale=(0.8, 0.8, 1.2), seg=14, rings=10), body, (0.1, 0, 0.12))
    head = empty(body, (0.12, 0, 0.45))
    put(sphere((0, 0, 0), 0.14, fur, scale=(1.0, 0.9, 0.9), seg=20, rings=14), head)
    put(sphere((0, 0, 0), 0.075, light, scale=(1.4, 0.9, 0.8), seg=12, rings=8), head, (0.12, 0, -0.04))
    put(sphere((0, 0, 0), 0.035, M("nos_p", "#2a2438", 0.4), seg=10, rings=8), head, (0.2, 0, -0.01))
    tongue = put(sphere((0, 0, 0), 0.03, M("jazyk", "#ff7a9a", 0.5), scale=(1.2, 0.8, 1.5), seg=10, rings=8), head, (0.17, 0, -0.1))
    eyes = []
    for sy in (-1, 1):
        e = empty(head, (0.1, sy * 0.075, 0.06))
        put(sphere((0, 0, 0), 0.026, M("oko_c", "#16132b", 0.3), seg=8, rings=6), e)
        eyes.append(e)
        ear = empty(head, (-0.02, sy * 0.1, 0.1))
        put(sphere((0, 0, 0), 0.07, dark, scale=(0.5, 0.4, 1.3), seg=12, rings=8), ear, (0, sy * 0.01, -0.06))
    for sy in (-1, 1):
        put(cyl((0, 0, 0), 0.04, 0.2, fur, verts=10), body, (0.12, sy * 0.1, -0.06))
        put(sphere((0, 0, 0), 0.05, light, scale=(1.4, 1, 0.8), seg=10, rings=8), body, (0.15, sy * 0.1, -0.16))
    tail = empty(body, (-0.2, 0, 0.02))
    put(cyl((0, 0, 0), 0.03, 0.22, fur, verts=10), tail, (-0.1, 0, 0.0))
    tail.children[0].rotation_euler = (0, math.radians(90), 0)
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        tail.rotation_euler = (0, 0, 0.55 * math.sin(4 * ph))
        head.rotation_euler = (0, 0.04 * math.sin(2 * ph), 0.1 * math.sin(ph))
        tongue.scale = (1.2, 0.8, 1.5 * (0.75 + 0.25 * math.sin(4 * ph)))
        body.scale = (1, 1, 1 + 0.02 * math.sin(2 * ph))
        k = 1.0
        d = abs(((t - 0.55 + 0.5) % 1.0) - 0.5)
        if d < 0.03:
            k = 0.1 + 0.9 * d / 0.03
        for e in eyes:
            e.scale = (1, 1, k)
    run(u, "mf_pes_sedi")


def job_kocka():
    stage("mf_kocka", 24, ortho=1.2, target_z=0.27)
    root = empty()
    fur, light, dark = M("kocka", "#9aa0b0", 0.8), M("kocka_b", "#f3f3f8", 0.8), M("kocka_u", "#6a7088", 0.8)
    body = empty(root, (0, 0, 0.0))
    put(sphere((0, 0, 0), 0.22, fur, scale=(1.0, 0.8, 1.1), seg=24, rings=16), body, (-0.04, 0, 0.2))
    put(sphere((0, 0, 0), 0.13, light, scale=(0.7, 0.8, 1.2), seg=14, rings=10), body, (0.08, 0, 0.18))
    head = empty(body, (0.1, 0, 0.5))
    put(sphere((0, 0, 0), 0.15, fur, scale=(1.0, 1.05, 0.92), seg=22, rings=16), head)
    put(sphere((0, 0, 0), 0.04, M("nos_k", "#ff9ab0", 0.5), seg=8, rings=6), head, (0.14, 0, -0.01))
    eyes = []
    for sy in (-1, 1):
        e = empty(head, (0.12, sy * 0.075, 0.04))
        put(sphere((0, 0, 0), 0.03, M("oko_k", "#9be86a", 0.3), scale=(0.6, 1, 1.2), seg=10, rings=8), e)
        put(sphere((0, 0, 0), 0.015, M("oko_c", "#16132b", 0.3), scale=(0.5, 0.5, 1.4), seg=8, rings=6), e, (0.012, 0, 0))
        eyes.append(e)
        put(cone((0, 0, 0), 0.07, 0.0, 0.14, dark, verts=4, rot=(0, 0, math.pi / 4)), head, (-0.02, sy * 0.08, 0.17))
        for k in (-1, 0, 1):
            bar((0.13, sy * 0.05, -0.02 + k * 0.015), (0.13, sy * 0.2, -0.02 + k * 0.04), 0.003, M("vous", "#ffffff"), verts=4)
    paw = empty(body, (0.14, -0.08, 0.2))
    put(cyl((0, 0, 0), 0.04, 0.2, fur, verts=10), paw, (0, 0, -0.1))
    put(sphere((0, 0, 0), 0.05, light, seg=10, rings=8), paw, (0, 0, -0.2))
    put(cyl((0, 0, 0), 0.04, 0.2, fur, verts=10), body, (0.14, 0.09, 0.1))
    tail = empty(body, (-0.22, 0, 0.1))
    tseg = []
    prev = tail
    for k in range(5):
        j = empty(prev, (0, 0, 0) if k == 0 else (-0.07, 0, 0))
        put(sphere((0, 0, 0), 0.04 - 0.002 * k, fur if k < 4 else dark, seg=10, rings=8), j)
        tseg.append(j)
        prev = j
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        for k, j in enumerate(tseg):
            j.rotation_euler = (0, 0.18 * math.sin(ph - k * 0.7) * (k + 1) * 0.35 - 0.25, 0.22 * math.sin(2 * ph - k * 0.8))
        lick = max(0.0, math.sin(2 * ph - 0.4)) if t < 0.5 else 0.0   # první půlku smyčky si myje packu
        paw.rotation_euler = (0, -1.6 * lick - 0.0, 0.1 * math.sin(8 * ph) * lick)
        head.rotation_euler = (0, 0.35 * lick + 0.03 * math.sin(2 * ph), 0.12 * math.sin(ph) * (1 - lick))
        body.scale = (1, 1, 1 + 0.025 * math.sin(2 * ph))
        k = 1.0
        d = abs(((t - 0.8 + 0.5) % 1.0) - 0.5)
        if d < 0.03:
            k = 0.1 + 0.9 * d / 0.03
        for e in eyes:
            e.scale = (1, 1, k * (0.6 if lick > 0.2 else 1.0))
    run(u, "mf_kocka")


def job_ovce():
    stage("mf_ovce", 24, ortho=1.4, target_z=0.33)
    root = empty()
    wool, skin, dark = M("vlna", "#f7f3ee", 0.95), M("ovce_h", "#3a3a4a", 0.7), M("ovce_n", "#2a2a38", 0.7)
    body = empty(root, (0, 0, 0.3))
    r = random.Random(3)
    for k in range(22):
        a, b = r.uniform(0, math.tau), r.uniform(-0.5, 0.5)
        put(sphere((0, 0, 0), r.uniform(0.11, 0.16), wool, seg=12, rings=8), body, (0.23 * math.cos(a) * 1.15, 0.13 * math.sin(a), 0.09 * math.sin(a + b) + 0.02))
    put(sphere((0, 0, 0), 0.2, wool, scale=(1.3, 0.85, 0.85), seg=20, rings=14), body)
    head = empty(body, (0.3, 0, 0.0))
    neck = put(sphere((0, 0, 0), 0.07, skin, seg=10, rings=8), head, (0, 0, 0))
    hh = empty(head, (0.03, 0, 0.0))
    put(sphere((0, 0, 0), 0.1, skin, scale=(1.1, 0.8, 1.0), seg=16, rings=12), hh, (0.07, 0, 0))
    put(sphere((0, 0, 0), 0.09, wool, scale=(0.9, 1.0, 0.5), seg=12, rings=8), hh, (0.03, 0, 0.1))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.025, M("oko_w", "#fff6e0", 0.3), seg=8, rings=6), hh, (0.12, sy * 0.05, 0.03))
        put(sphere((0, 0, 0), 0.012, M("oko_c", "#16132b", 0.3), seg=6, rings=4), hh, (0.138, sy * 0.05, 0.03))
        put(sphere((0, 0, 0), 0.05, skin, scale=(0.6, 1.4, 0.5), seg=10, rings=8), hh, (0.0, sy * 0.1, 0.03))
    legs = []
    for lx, sy in ((0.2, -1), (0.2, 1), (-0.2, -1), (-0.2, 1)):
        put(cyl((0, 0, 0), 0.028, 0.2, skin, verts=10), body, (lx, sy * 0.09, -0.19))
        put(sphere((0, 0, 0), 0.04, dark, scale=(1.2, 1, 0.8), seg=8, rings=6), body, (lx, sy * 0.09, -0.29))
    put(sphere((0, 0, 0), 0.07, wool, seg=10, rings=8), body, (-0.3, 0, 0.05))
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        dip = 0.5 - 0.5 * math.cos(ph)              # hlava klesne k trávě a zvedne se
        head.rotation_euler = (0, 0.9 * dip, 0)
        hh.rotation_euler = (0, 0.25 * dip + 0.08 * math.sin(6 * ph) * dip, 0)
        body.location.z = 0.3 - 0.01 * dip
        body.rotation_euler = (0, 0.03 * dip, 0)
    run(u, "mf_ovce")


def job_slepice():
    stage("mf_slepice", 16, ortho=0.9, target_z=0.2)
    root = empty()
    feather, comb, beak, tail_m = M("slep", "#fff6e6", 0.8), M("hreben", "#e8383d", 0.5), M("zobak", "#ffb02e", 0.5), M("slep_o", "#d8a05a", 0.8)
    body = empty(root, (0, 0, 0.16))
    put(sphere((0, 0, 0), 0.16, feather, scale=(1.2, 0.85, 1.0), seg=22, rings=16), body)
    put(sphere((0, 0, 0), 0.1, tail_m, scale=(1.0, 0.25, 0.6), seg=12, rings=8), body, (-0.04, -0.12, 0.0))
    put(sphere((0, 0, 0), 0.1, tail_m, scale=(1.0, 0.25, 0.6), seg=12, rings=8), body, (-0.04, 0.12, 0.0))
    tail = empty(body, (-0.17, 0, 0.1))
    put(sphere((0, 0, 0), 0.09, tail_m, scale=(0.5, 0.4, 1.4), seg=12, rings=8), tail, (-0.03, 0, 0.07))
    head = empty(body, (0.17, 0, 0.1))
    put(sphere((0, 0, 0), 0.07, feather, seg=16, rings=12), head, (0.02, 0, 0.05))
    put(cone((0, 0, 0), 0.03, 0.0, 0.08, beak, verts=10, rot=(0, math.radians(90), 0)), head, (0.11, 0, 0.04))
    put(sphere((0, 0, 0), 0.035, comb, scale=(1.2, 0.4, 1.0), seg=10, rings=8), head, (0.02, 0, 0.13))
    put(sphere((0, 0, 0), 0.02, comb, scale=(0.6, 0.5, 1.4), seg=8, rings=6), head, (0.09, 0, -0.02))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.014, M("oko_c", "#16132b", 0.3), seg=6, rings=4), head, (0.07, sy * 0.045, 0.07))
    for sy in (-1, 1):
        put(cyl((0, 0, 0), 0.012, 0.12, beak, verts=6), body, (0.0, sy * 0.05, -0.2))
        put(sphere((0, 0, 0), 0.025, beak, scale=(1.8, 1.0, 0.4), seg=8, rings=6), body, (0.02, sy * 0.05, -0.26))
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        peck = max(0.0, math.sin(2 * ph)) ** 2
        head.rotation_euler = (0, 1.0 * peck - 0.1, 0)
        body.rotation_euler = (0, 0.35 * peck, 0)
        body.location.z = 0.16 - 0.02 * peck
        tail.rotation_euler = (0, -0.3 * peck + 0.05 * math.sin(4 * ph), 0)
    run(u, "mf_slepice")


def job_kralik():
    stage("mf_kralik", 16, ortho=1.2, target_z=0.28)
    root = empty()
    fur, pink = M("kralik", "#f7f3ee", 0.9), M("kralik_u", "#ffb0c4", 0.7)
    body = empty(root, (0, 0, 0.15))
    put(sphere((0, 0, 0), 0.17, fur, scale=(1.3, 0.85, 0.95), seg=22, rings=16), body, (0, 0, 0.08))
    put(sphere((0, 0, 0), 0.06, fur, seg=10, rings=8), body, (-0.26, 0, 0.1))
    head = empty(body, (0.24, 0, 0.2))
    put(sphere((0, 0, 0), 0.11, fur, scale=(1.1, 0.9, 0.95), seg=18, rings=12), head)
    put(sphere((0, 0, 0), 0.025, pink, seg=8, rings=6), head, (0.12, 0, 0.0))
    ears = []
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.02, M("oko_c", "#16132b", 0.3), seg=6, rings=4), head, (0.08, sy * 0.065, 0.04))
        e = empty(head, (-0.02, sy * 0.045, 0.08))
        put(sphere((0, 0, 0), 0.05, fur, scale=(0.35, 0.5, 2.3), seg=12, rings=8), e, (0, 0, 0.1))
        put(sphere((0, 0, 0), 0.03, pink, scale=(0.25, 0.4, 2.0), seg=8, rings=6), e, (0.012, 0, 0.1))
        ears.append(e)
    hind = empty(body, (-0.12, 0, 0.0))
    put(sphere((0, 0, 0), 0.09, fur, scale=(1.4, 0.7, 0.9), seg=12, rings=8), hind, (0, 0.0, -0.03))
    put(sphere((0, 0, 0), 0.06, fur, scale=(1.8, 1.0, 0.6), seg=10, rings=8), hind, (0.07, 0, -0.1))
    fore = empty(body, (0.17, 0, 0.0))
    put(cyl((0, 0, 0), 0.03, 0.14, fur, verts=10), fore, (0, 0, -0.07))
    root.rotation_euler = (0, 0, math.radians(-14))

    def u(t):
        ph = t * math.tau
        j = max(0.0, math.sin(ph)) ** 0.8            # skok
        sq = max(0.0, -math.sin(ph))                 # dřep
        body.location = (0.0, 0, 0.0 + 0.3 * j - 0.03 * sq)
        body.scale = (1 + 0.15 * j + 0.1 * sq, 1, 1 - 0.1 * j - 0.12 * sq)
        body.rotation_euler = (0, -0.35 * j + 0.15 * sq, 0)
        hind.rotation_euler = (0, 0.7 * j, 0)
        fore.rotation_euler = (0, -0.5 * j, 0)
        for i, e in enumerate(ears):
            e.rotation_euler = (0.1 * (1 if i else -1), 0.35 * (1 - j) + 0.8 * j + 0.1 * math.sin(2 * ph + i), 0)
    run(u, "mf_kralik")


def job_ptak():
    stage("mf_ptak", 12, ortho=1.0, target_z=0.0, el=6)
    root = empty()
    body_m, wing_m, beak_m, belly = M("ptak", "#4aa9d6", 0.6), M("ptak_k", "#2f7fb0", 0.6), M("ptak_z", "#ffb02e", 0.5), M("ptak_b", "#f3f3f8", 0.7)
    put(sphere((0, 0, 0), 0.12, body_m, scale=(1.5, 0.8, 0.85), seg=20, rings=14), root)
    put(sphere((0, 0, 0), 0.085, belly, scale=(1.2, 0.8, 0.6), seg=12, rings=8), root, (0.02, 0, -0.05))
    head = empty(root, (0.17, 0, 0.04))
    put(sphere((0, 0, 0), 0.07, body_m, seg=14, rings=10), head)
    put(cone((0, 0, 0), 0.025, 0.0, 0.07, beak_m, verts=10, rot=(0, math.radians(90), 0)), head, (0.095, 0, -0.005))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.014, M("oko_c", "#16132b", 0.3), seg=6, rings=4), head, (0.045, sy * 0.045, 0.02))
    put(box((0, 0, 0), (0.16, 0.08, 0.012), wing_m, rot=(0, -0.2, 0), bevel=0), root, (-0.2, 0, 0.0))
    wings = []
    for sy in (-1, 1):
        piv = empty(root, (0.0, sy * 0.06, 0.05))
        put(sphere((0, 0, 0), 0.12, wing_m, scale=(0.55, 1.6, 0.12), seg=14, rings=8), piv, (-0.02, sy * 0.19, 0))
        put(sphere((0, 0, 0), 0.07, wing_m, scale=(0.5, 1.4, 0.1), seg=10, rings=6), piv, (-0.1, sy * 0.3, 0))
        wings.append((piv, sy))
    root.rotation_euler = (0, 0, math.radians(-12))

    def u(t):
        ph = t * math.tau
        f = math.sin(ph)
        for piv, sy in wings:
            piv.rotation_euler = (sy * 0.9 * f * -1, 0, 0)
        root.location.z = 0.04 * math.sin(ph - 1.0)
        head.rotation_euler = (0, 0.05 * math.sin(ph), 0)
    run(u, "mf_ptak")


def job_ryba():
    stage("mf_ryba", 16, ortho=1.3, target_z=0.2, el=4)
    root = empty()
    body_m, fin, belly = M("ryba", "#ff8a3c", 0.4), M("ryba_p", "#ffd24d", 0.5), M("ryba_b", "#fff0d0", 0.5)
    seg = []
    prev = root
    # tělo z článků, aby se dalo ohnout do skoku
    for k in range(6):
        j = empty(prev, (0, 0, 0) if k == 0 else (-0.07, 0, 0))
        r = [0.1, 0.12, 0.11, 0.09, 0.065, 0.045][k]
        put(sphere((0, 0, 0), r, body_m if k < 5 else fin, scale=(0.9, 0.55, 1.0), seg=14, rings=10), j)
        seg.append(j)
        prev = j
    put(sphere((0, 0, 0), 0.02, M("oko_c", "#16132b", 0.3), seg=8, rings=6), seg[0], (0.05, -0.05, 0.03))
    put(sphere((0, 0, 0), 0.04, belly, scale=(1.4, 0.7, 0.5), seg=10, rings=8), seg[1], (0.0, 0, -0.07))
    put(cone((0, 0, 0), 0.1, 0.0, 0.14, fin, verts=3, rot=(math.radians(90), 0, math.radians(90))), seg[5], (-0.07, 0, 0))
    put(cone((0, 0, 0), 0.08, 0.0, 0.14, fin, verts=3, rot=(0, 0, 0)), seg[1], (0.0, 0, 0.11))

    def u(t):
        ph = t * math.tau
        arc = math.sin(ph / 2) if False else math.sin(ph * 0.5)
        root.location = (-0.35 + 0.7 * t, 0, 0.3 * 4 * t * (1 - t))
        pitch = -0.9 + 1.8 * t                       # nos nahoru, ve vrcholu vodorovně, dolů
        root.rotation_euler = (0, pitch * -1, 0)
        for k, j in enumerate(seg):
            j.rotation_euler = (0, 0, 0.28 * math.sin(3 * ph - k * 0.9) * (k + 1) * 0.35)
    run(u, "mf_ryba")


def job_mlyn():
    stage("mf_mlyn", 1, ortho=2.2, target_z=0.0, el=0)
    root = empty()
    wood, cloth = M("mlyn_d", "#8a5a34", 0.8), M("mlyn_p", "#fff6e0", 0.8)
    put(sphere((0, 0, 0), 0.1, M("mlyn_h", "#4a3a2a", 0.6), seg=14, rings=10), root)
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        arm = empty(root, (0, 0, 0))
        arm.rotation_euler = (0, a, 0)
        put(box((0, 0, 0), (0.06, 0.05, 0.95), wood, bevel=0.008), arm, (0, 0, 0.5))
        put(box((0, 0, 0), (0.24, 0.02, 0.62), cloth, bevel=0.004), arm, (0.14, -0.01, 0.62))
        for r in range(4):
            put(box((0, 0, 0), (0.24, 0.025, 0.012), wood, bevel=0), arm, (0.14, -0.012, 0.36 + r * 0.17))
    run(lambda t: None, "mf_mlyn")


# ---------------------------------------------------------------- pirátský přístav (uživatelský obchod)
def job_kapitan():
    stage("mf_kapitan", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#f2c9a0", top="#d6362b", bottom="#2c2540", shoes="#3a2a22", hair="#3a2a22", hat="captain", hat_c="#16132b", beard="#3a2a22", coat="#d6362b", scale=0.97)
    glass = empty(P["arms"][0][2])
    put(cyl((0, 0, 0), 0.03, 0.34, M("dalekohled", "#c79256", 0.4, 0.5), verts=12, rot=(0, math.radians(90), 0)), glass, (0.18, 0, 0))
    put(cyl((0, 0, 0), 0.04, 0.06, M("dalekohled_k", "#ffc933", 0.3, 0.9), verts=12, rot=(0, math.radians(90), 0)), glass, (0.36, 0, 0))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, tip = P["arms"][0]
        up = max(0.0, math.sin(ph - 0.3)) ** 0.6          # dalekohled k oku a zpět
        sh.rotation_euler = (0, -0.35 - 1.2 * up, 0)
        el.rotation_euler = (0, -0.4 - 1.0 * up, 0)
        P["head"].rotation_euler = (0, -0.15 * up, 0.35 * math.sin(ph) * (1 - up))
        sh1, el1, _ = P["arms"][1]
        sh1.rotation_euler = (0, -0.2, 0)
        el1.rotation_euler = (0, -0.3, 0)
        blink(P, t, 0.8, 1)
    run(u, "mf_kapitan")


def job_kvartyrmistr():
    stage("mf_kvartyrmistr", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#e8b890", top="#2f6fd8", bottom="#2c2540", hair="#7a3a22", hat="kerchief", hat_c="#d6362b", patch=True, coat="#2f6fd8", skirt="#2c2540", scale=0.95)
    quill = bar((0, 0, 0), (0.08, 0, 0.22), 0.012, M("brk", "#ffffff", 0.5), verts=6)
    put(quill, P["arms"][0][2], (0.04, 0, 0.0))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][0]
        w = math.sin(3 * ph)
        sh.rotation_euler = (0, -0.85 + 0.05 * w, 0)
        el.rotation_euler = (0, -0.9 - 0.2 * w, 0.0)
        sh1, el1, _ = P["arms"][1]
        sh1.rotation_euler = (0, -0.7, 0)
        el1.rotation_euler = (0, -0.9, 0)
        P["head"].rotation_euler = (0, 0.12, 0.1 * math.sin(ph))
        blink(P, t, 0.5, 2)
    run(u, "mf_kvartyrmistr")


def job_tesar():
    stage("mf_tesar", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#e0ae80", top="#8a5a34", bottom="#4a3a2a", hair="#2a1a12", hat="kerchief", hat_c="#ffc933", apron="#c79256", beard="#2a1a12", scale=0.97)
    ham = empty(P["arms"][1][2])
    put(bar((0, 0, 0), (0.0, 0, 0.3), 0.018, M("kladivo", "#7a4a2e", 0.8), verts=8), ham, (0.0, 0, -0.05))
    put(box((0, 0, 0), (0.14, 0.07, 0.07), M("kladivo_h", "#9aa0b0", 0.3, 0.8), bevel=0.01), ham, (0.0, 0, 0.28))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        k = max(0.0, math.sin(2 * ph)) ** 2
        sh.rotation_euler = (0, -1.2 - 0.9 * k, 0)
        el.rotation_euler = (0, -0.5 - 0.6 * k, 0)
        P["torso"].rotation_euler = (0, 0.1 + 0.06 * k, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.8, 0)
        el0.rotation_euler = (0, -0.7, 0)
        blink(P, t, 0.3, 2)
    run(u, "mf_tesar")


def job_plachtarka():
    stage("mf_plachtarka", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#f2c9a0", top="#ffc933", bottom="#6a3a8a", skirt="#6a3a8a", hair="#d6453a", hat="tricorn", hat_c="#6a3a8a", scale=0.94)
    cloth = box((0, 0, 0), (0.3, 0.22, 0.02), M("platno_s", "#ffffff", 0.8), bevel=0)
    put(cloth, P["arms"][0][2], (0.1, 0, 0.0))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        w = 0.5 + 0.5 * math.sin(4 * ph)
        sh.rotation_euler = (0, -0.9 - 0.2 * w, 0)
        el.rotation_euler = (0, -0.9 - 0.5 * w, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.85, 0)
        el0.rotation_euler = (0, -0.8, 0)
        P["head"].rotation_euler = (0, 0.18, 0.08 * math.sin(ph))
        blink(P, t, 0.45, 2)
    run(u, "mf_plachtarka")


def job_chovatel():
    stage("mf_chovatel", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#e8b890", top="#8a3ffc", bottom="#2f3c6e", hair="#4a2a1a", hat="straw", scale=0.95)
    fish = sphere((0, 0, 0), 0.07, M("ryba_o", "#ff8a3c", 0.5), scale=(1.6, 0.7, 0.8), seg=12, rings=8)
    put(fish, P["arms"][1][2], (0.1, 0, -0.04))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        h = 0.5 + 0.5 * math.sin(ph)                      # nabízí rybu papouškovi a stahuje ji zpět
        sh.rotation_euler = (0, -0.7 - 0.5 * h, 0)
        el.rotation_euler = (0, -0.5 - 0.3 * h, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.2, 0)
        el0.rotation_euler = (0, -0.3, 0)
        P["head"].rotation_euler = (0, 0.05, 0.1 * math.sin(ph))
        blink(P, t, 0.7, 2)
    run(u, "mf_chovatel")


def job_papousek():
    stage("mf_papousek", 24, ortho=1.15, target_z=0.2, el=6)
    root = empty()
    red, blue, yellow, beak_m = M("pap_c", "#d6362b", 0.5), M("pap_m", "#2f6fd8", 0.5), M("pap_z", "#ffc933", 0.5), M("pap_n", "#2a2a38", 0.4)
    body = empty(root, (0, 0, 0.3))
    put(sphere((0, 0, 0), 0.16, red, scale=(0.8, 0.75, 1.3), seg=20, rings=14), body)
    put(sphere((0, 0, 0), 0.1, yellow, scale=(0.6, 0.7, 0.9), seg=12, rings=8), body, (0.06, 0, -0.04))
    head = empty(body, (0.03, 0, 0.23))
    put(sphere((0, 0, 0), 0.1, red, seg=16, rings=10), head)
    put(sphere((0, 0, 0), 0.085, M("pap_o", "#ffffff", 0.6), scale=(0.35, 1.0, 0.9), seg=10, rings=8), head, (0.07, 0, 0.01))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.022, M("oko_c", "#16132b", 0.3), seg=8, rings=6), head, (0.075, sy * 0.06, 0.03))
    put(sphere((0, 0, 0), 0.06, beak_m, scale=(1.0, 0.7, 1.1), seg=12, rings=8), head, (0.12, 0, -0.02))
    wings = []
    for sy in (-1, 1):
        piv = empty(body, (-0.02, sy * 0.13, 0.08))
        put(sphere((0, 0, 0), 0.1, blue, scale=(0.4, 0.4, 1.7), seg=12, rings=8), piv, (-0.03, sy * 0.03, -0.12))
        wings.append((piv, sy))
    tail = empty(body, (-0.1, 0, -0.18))
    put(sphere((0, 0, 0), 0.06, blue, scale=(0.5, 0.5, 2.6), seg=12, rings=8), tail, (-0.03, 0, -0.14))
    put(sphere((0, 0, 0), 0.05, yellow, scale=(0.4, 0.4, 2.2), seg=10, rings=6), tail, (-0.06, 0.04, -0.12))
    for sy in (-1, 1):
        put(bar((0, 0, 0), (0.02, 0, -0.1), 0.012, beak_m, verts=6), body, (0.02, sy * 0.05, -0.25))

    def u(t):
        ph = t * math.tau
        f = max(0.0, math.sin(2 * ph)) ** 6 if t < 0.5 else 0.0   # jednou za smyčku zatřepe křídly
        for piv, sy in wings:
            piv.rotation_euler = (sy * (0.12 * math.sin(ph) + 1.0 * f) * -1, 0, 0)
        head.rotation_euler = (0, 0.12 * math.sin(ph + 0.5), 0.35 * math.sin(ph) * (1 if t < 0.6 else 0.2))
        body.rotation_euler = (0, 0.04 * math.sin(2 * ph), 0)
        tail.rotation_euler = (0, 0.1 * math.sin(ph), 0)
    run(u, "mf_papousek")


def job_krab():
    stage("mf_krab", 24, ortho=0.9, target_z=0.12, el=6)
    root = empty()
    sh = M("krab", "#e8452e", 0.45)
    root.rotation_euler = (0, 0, math.radians(-40))
    put(sphere((0, 0, 0), 0.16, sh, scale=(1.4, 1.0, 0.6), seg=20, rings=12), root, (0, 0, 0.14))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.03, M("oko_c", "#16132b", 0.3), seg=8, rings=6), root, (0.14, sy * 0.07, 0.3))
        put(bar((0, 0, 0), (0.0, 0, 0.1), 0.012, sh, verts=6), root, (0.14, sy * 0.07, 0.2))
    claws = []
    for sy in (-1, 1):
        a = empty(root, (0.1, sy * 0.22, 0.14))
        put(sphere((0, 0, 0), 0.07, sh, scale=(1.3, 0.8, 0.8), seg=12, rings=8), a, (0.08, sy * 0.04, 0.02))
        put(sphere((0, 0, 0), 0.04, sh, scale=(1.6, 0.6, 0.6), seg=10, rings=6), a, (0.17, sy * 0.05, 0.0))
        claws.append((a, sy))
    legs = []
    for sy in (-1, 1):
        for k in range(3):
            l = empty(root, (-0.06 + k * 0.07, sy * 0.19, 0.1))
            put(bar((0, 0, 0), (0.0, sy * 0.15, -0.08), 0.012, sh, verts=6), l)
            legs.append((l, sy, k))

    def u(t):
        ph = t * math.tau
        for a, sy in claws:
            a.rotation_euler = (0, 0.2 * math.sin(2 * ph + sy), 0.35 * math.sin(2 * ph + (1.2 if sy > 0 else 0)))
        for l, sy, k in legs:
            l.rotation_euler = (0.25 * math.sin(4 * ph + k * 1.3 + sy), 0, 0)
        root.location.x = 0.08 * math.sin(ph)
        root.rotation_euler = (0, 0, math.radians(-40) + 0.1 * math.sin(ph))
    run(u, "mf_krab")



# ---------------------------------------------------------------- vesmírná stanice (uživatelský obchod)
def job_admiral():
    stage("mf_admiral", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#f2c9a0", top="#f4f6fb", bottom="#d8dde8", shoes="#46d6ff", hair="#8a8aa8", hat="helmet", hat_c="#ff7a3c", coat="#f4f6fb", scale=0.97)
    pad = box((0, 0, 0), (0.22, 0.03, 0.3), M("tablet", "#16132b", 0.3), bevel=0.01)
    put(pad, P["arms"][1][2], (0.1, 0, 0.0))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][0]
        w = max(0.0, math.sin(2 * ph))
        sh.rotation_euler = (0, -0.6 - 1.7 * w, 0)            # salutuje a pozdravuje
        el.rotation_euler = (0, -0.5 - 0.8 * w, 0)
        sh1, el1, _ = P["arms"][1]
        sh1.rotation_euler = (0, -0.7, 0)
        el1.rotation_euler = (0, -0.8, 0)
        blink(P, t, 0.4, 1)
    run(u, "mf_admiral")


def job_robot_obch():
    stage("mf_robot_obch", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#c9ced8", top="#46d6ff", bottom="#6a7a9a", shoes="#2b3350", hair="#c9ced8", hat="antenna", hat_c="#ff6fd0", scale=0.95, cheeks=False)

    def u(t):
        ph = t * math.tau
        idle(P, t)
        for i, (sh, el, _) in enumerate(P["arms"]):
            k = math.sin(3 * ph + i * 2.1)
            sh.rotation_euler = (0, -0.9 - 0.3 * k, 0)
            el.rotation_euler = (0, -0.7 + 0.25 * k, 0)
        P["head"].rotation_euler = (0, 0.05, 0.3 * math.sin(ph) * (1 if t < 0.7 else 0.1))
        blink(P, t, 0.55, 3)
    run(u, "mf_robot_obch")


def job_inzenyr():
    stage("mf_inzenyr", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#e0ae80", top="#ff9a3c", bottom="#2c2540", hair="#3a2a22", hat="cap", hat_c="#ffd76b", apron="#c9ced8", scale=0.97)
    tool = empty(P["arms"][1][2])
    put(bar((0, 0, 0), (0.0, 0, 0.3), 0.02, M("klic_m", "#9aa6c0", 0.3, 0.8), verts=8), tool, (0.0, 0, -0.04))
    put(torus((0, 0, 0), 0.06, 0.02, M("klic_m", "#9aa6c0", 0.3, 0.8), rot=(math.radians(90), 0, 0)), tool, (0.0, 0, 0.32))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        k = math.sin(3 * ph)
        sh.rotation_euler = (0, -1.2 - 0.2 * k, 0)
        el.rotation_euler = (0, -0.6 - 0.5 * k, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.8, 0)
        el0.rotation_euler = (0, -0.7, 0)
        P["torso"].rotation_euler = (0, 0.1, 0.04 * k)
        blink(P, t, 0.3, 2)
    run(u, "mf_inzenyr")


def job_mimozemstan():
    stage("mf_mimozemstan", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#9be15d", top="#8a3ffc", bottom="#5a2ab8", skirt="#8a3ffc", hair="#6fcf3a", hat="antenna", hat_c="#ffd76b", scale=0.95)
    cloth = box((0, 0, 0), (0.3, 0.2, 0.02), M("latka_k", "#ff6fd0", 0.8), bevel=0)
    put(cloth, P["arms"][0][2], (0.1, 0, 0.0))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        w = 0.5 + 0.5 * math.sin(4 * ph)
        sh.rotation_euler = (0, -0.9 - 0.2 * w, 0)
        el.rotation_euler = (0, -0.9 - 0.5 * w, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.85, 0)
        el0.rotation_euler = (0, -0.8, 0)
        P["head"].rotation_euler = (0, 0.15, 0.1 * math.sin(ph))
        blink(P, t, 0.45, 2)
    run(u, "mf_mimozemstan")


def job_biolog():
    stage("mf_biolog", 24, ortho=1.9, target_z=0.62)
    P = person(skin="#f6a8d8", top="#7ee0b0", bottom="#2f6a9a", hair="#46d6ff", hat="visor", hat_c="#46d6ff", glasses=False, scale=0.95)
    jar = cyl((0, 0, 0), 0.09, 0.2, M("sklenice_b", "#bfe8ff", 0.05, 0.1), verts=16)
    put(jar, P["arms"][1][2], (0.1, 0, -0.02))
    put(sphere((0, 0, 0), 0.06, M("blobMini", "#7ee0b0", 0.3), seg=10, rings=8), jar, (0, 0, 0.02))

    def u(t):
        ph = t * math.tau
        idle(P, t)
        sh, el, _ = P["arms"][1]
        h = 0.5 + 0.5 * math.sin(ph)
        sh.rotation_euler = (0, -0.8 - 0.4 * h, 0)
        el.rotation_euler = (0, -0.6 - 0.3 * h, 0)
        sh0, el0, _ = P["arms"][0]
        sh0.rotation_euler = (0, -0.3, 0)
        el0.rotation_euler = (0, -0.4, 0)
        P["head"].rotation_euler = (0, 0.05, 0.12 * math.sin(ph))
        blink(P, t, 0.7, 2)
    run(u, "mf_biolog")


def job_blob():
    stage("mf_blob", 24, ortho=0.9, target_z=0.2, el=6)
    root = empty()
    body = M("blob_t", "#7ee0b0", 0.25)
    b = put(sphere((0, 0, 0), 0.2, body, seg=20, rings=14), root, (0, 0, 0.25))
    for sy in (-1, 1):
        put(sphere((0, 0, 0), 0.045, M("oko_b", "#ffffff", 0.3), seg=10, rings=8), root, (0.16, sy * 0.07, 0.3))
        put(sphere((0, 0, 0), 0.025, M("oko_c", "#16132b", 0.3), seg=8, rings=6), root, (0.2, sy * 0.07, 0.3))
        put(bar((0, 0, 0), (0.0, sy * 0.08, 0.12), 0.012, body, verts=6), root, (0.0, sy * 0.1, 0.42))
        put(sphere((0, 0, 0), 0.04, M("blob_k", "#ff6fd0", 0.3), seg=8, rings=6), root, (0.0, sy * 0.18, 0.56))

    def u(t):
        ph = t * math.tau
        root.location.z = 0.06 * math.sin(ph)
        sq = 1 + 0.08 * math.sin(2 * ph)
        b.scale = (1 / sq ** 0.5, 1 / sq ** 0.5, sq)
        root.rotation_euler = (0, 0.06 * math.sin(ph), 0.2 * math.sin(ph))
    run(u, "mf_blob")


def job_uklizec():
    stage("mf_uklizec", 24, ortho=0.9, target_z=0.1, el=6)
    root = empty()
    put(cyl((0, 0, 0), 0.22, 0.1, M("ukl_t", "#e8edf5", 0.3, 0.3), verts=24), root, (0, 0, 0.08))
    put(torus((0, 0, 0), 0.22, 0.015, M("ukl_k", "#46d6ff", 0.3), rot=(0, 0, 0)), root, (0, 0, 0.1))
    led = put(sphere((0, 0, 0), 0.04, M("ukl_l", "#ff6fd0", 0.3), seg=8, rings=6), root, (0.15, 0, 0.14))
    put(sphere((0, 0, 0), 0.06, M("ukl_o", "#16132b", 0.3), scale=(0.5, 1, 0.6), seg=8, rings=6), root, (0.2, 0, 0.1))

    def u(t):
        ph = t * math.tau
        root.location.x = 0.1 * math.sin(ph)
        root.rotation_euler = (0, 0, 0.5 * math.sin(ph))
        led.scale = [0.7 + 0.5 * abs(math.sin(2 * ph))] * 3
    run(u, "mf_uklizec")



# --- chůze obyvatel po městečku (hub): stejné postavy jako stojící, ale s krokem
def job_knihovnice_chuze():
    stage("mf_knihovnice_chuze", 16, ortho=1.7, target_z=0.62)
    P = person(skin="#ffd5a8", top="#a45ad6", bottom="#7a3aa0", skirt="#7a3aa0", hair="#8a8aa8", hat="bun", glasses=True, scale=0.95)
    book = box((0, 0, 0), (0.24, 0.05, 0.3), M("kniha_r", "#d6453a", 0.5), bevel=0.012)
    put(book, P["arms"][1][2], (0.08, 0, -0.02))

    def u(t):
        walk(P, t, swing=0.38, arms_swing=0.3, lean=0.05)
        P["arms"][1][0].rotation_euler = (0, -0.9, 0)
        P["arms"][1][1].rotation_euler = (0, -1.1, 0)
    run(u, "mf_knihovnice_chuze")


def job_pekar_chuze():
    stage("mf_pekar_chuze", 16, ortho=1.9, target_z=0.62)
    P = person(skin="#ffd5a8", top="#ffffff", bottom="#8a6a4a", hat="chef", apron="#f3e6c8", scale=0.95, hair="#4a2a1a")
    loaf = sphere((0, 0, 0), 0.07, M("bochnik", "#d8944a", 0.5), scale=(1.6, 1, 0.8), seg=10, rings=8)
    put(loaf, P["arms"][1][2], (0.0, 0, -0.04))

    def u(t):
        walk(P, t, swing=0.4, arms_swing=0.3)
        P["arms"][1][0].rotation_euler = (0, -0.6, 0)
        P["arms"][1][1].rotation_euler = (0, -0.9, 0)
    run(u, "mf_pekar_chuze")


def job_kluk_chuze():
    stage("mf_kluk_chuze", 16, ortho=1.7, target_z=0.55)
    P = person(skin="#f2c9a0", top="#ffd24d", bottom="#3b6fd8", hat="cap", hat_c="#d6453a", hair="#3a2a22", scale=0.78)

    def u(t):
        walk(P, t, swing=0.65, arms_swing=0.6, bob=0.05, lean=0.1)
    run(u, "mf_kluk_chuze")


JOBS = {k[4:]: v for k, v in globals().items() if k.startswith("job_")}
JOBS = {"hrdina_chuze": job_hrdina_chuze, "hrdina_stoji": job_hrdina_stoji, "hrdina_radost": job_hrdina_radost, "knihovnice": job_knihovnice,
        "pekar": job_pekar, "farmar": job_farmar, "babicka": job_babicka, "kluk": job_kluk, "pes_bezi": job_pes_bezi, "pes_sedi": job_pes_sedi,
        "kocka": job_kocka, "ovce": job_ovce, "slepice": job_slepice, "kralik": job_kralik, "ptak": job_ptak, "ryba": job_ryba, "mlyn": job_mlyn,
        "kapitan": job_kapitan, "kvartyrmistr": job_kvartyrmistr, "tesar": job_tesar, "plachtarka": job_plachtarka, "chovatel": job_chovatel, "papousek": job_papousek, "krab": job_krab,
        "admiral": job_admiral, "robot_obch": job_robot_obch, "inzenyr": job_inzenyr, "mimozemstan": job_mimozemstan, "biolog": job_biolog, "blob": job_blob, "uklizec": job_uklizec,
        "knihovnice_chuze": job_knihovnice_chuze, "pekar_chuze": job_pekar_chuze, "kluk_chuze": job_kluk_chuze}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS]:
        JOBS[w]()
