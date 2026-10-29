"""Obchodníci tří dalších světů obchodu (pohádkový les, hrad a tržiště, podmořské město): 15 postav stejného střihu jako
v mesto_figury.py, smyčka 24 snímků po 256 px. Spuštění: python mesto_figury2.py -- <jmeno> [--preview]
Jména: vila hajny rezbar malirka bylinkarka  krejci kral kovar tkadlena sokolnik  perla potapec perlar mag delfinka
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from mesto_figury import *


def wings(P, c1="#c8f0ff", c2="#ffd0f0"):
    """Víly: dvě průsvitná křídla na zádech, mávají."""
    ws = []
    for k, (c, sy) in enumerate(((c1, -1), (c2, 1))):
        piv = empty(P["torso"], (-0.16, sy * 0.05, 0.22))
        put(sphere((0, 0, 0), 0.2, glow("kridlo" + c, c, 1.3), scale=(0.08, 1.0, 1.8), seg=16, rings=10), piv, (-0.03, sy * 0.2, 0.12))
        ws.append((piv, sy))
    return ws


def hold(P, arm, obj_fn):
    """Předmět v ruce (arm 0/1): obj_fn vytvoří objekt a vrátí ho."""
    o = obj_fn()
    put(o, P["arms"][arm][2], (0.1, 0, 0.0))
    return o


def pose_idle_wave(P, t, wave_arm=0, other=(-0.8, -0.7)):
    ph = t * math.tau
    idle(P, t)
    sh, el, _ = P["arms"][wave_arm]
    w = max(0.0, math.sin(2 * ph))
    sh.rotation_euler = (0, -0.6 - 1.6 * w, 0)
    el.rotation_euler = (0, -0.4 - 0.9 * w, 0)
    sh1, el1, _ = P["arms"][1 - wave_arm]
    sh1.rotation_euler = (0, other[0], 0)
    el1.rotation_euler = (0, other[1], 0)


def pose_work(P, t, arm=1, rate=3, base=-1.2, amp=0.25, other=(-0.8, -0.7)):
    ph = t * math.tau
    idle(P, t)
    sh, el, _ = P["arms"][arm]
    k = math.sin(rate * ph)
    sh.rotation_euler = (0, base - amp * k, 0)
    el.rotation_euler = (0, -0.6 - 0.5 * k, 0)
    sh0, el0, _ = P["arms"][1 - arm]
    sh0.rotation_euler = (0, other[0], 0)
    el0.rotation_euler = (0, other[1], 0)
    P["torso"].rotation_euler = (0, 0.08, 0.04 * k)


def job_npc(name, kw, style="wave", prop=None, fairy=False, blinkat=0.5, **opts):
    stage("mf_" + name, 24, ortho=1.9, target_z=0.62)
    P = person(**kw)
    ws = wings(P, *opts.get("wingc", ())) if fairy else []
    if prop:
        prop(P)

    def u(t):
        ph = t * math.tau
        if style == "wave":
            pose_idle_wave(P, t, opts.get("arm", 0))
        elif style == "work":
            pose_work(P, t, opts.get("arm", 1), opts.get("rate", 3), opts.get("base", -1.2), opts.get("amp", 0.25))
        P["head"].rotation_euler = (0, 0.04, 0.1 * math.sin(ph))
        for piv, sy in ws:
            piv.rotation_euler = (sy * (0.35 + 0.3 * math.sin(6 * ph)), 0, 0)
        blink(P, t, blinkat, 2)
    run(u, "mf_" + name)


# ---------------------------------------------------------------- pohádkový les
def job_vila():
    job_npc("vila", dict(skin="#ffe0c8", top="#ff8ad8", bottom="#ff8ad8", skirt="#ff8ad8", hair="#c77dff", hat="crown", scale=0.95), "wave", fairy=True)


def job_hajny():
    def p(P):
        hold(P, 1, lambda: bar((0, 0, -0.1), (0, 0, 0.5), 0.02, M("hul_h", "#7a5636", 0.7), verts=8))
    job_npc("hajny", dict(skin="#e8b890", top="#3f7a45", bottom="#6a4a2a", hair="#e8e0d0", hat="cap", hat_c="#2f6a3a", beard="#e8e0d0", scarf="#c79256", scale=0.98), "wave", p, arm=0)


def job_rezbar():
    def p(P):
        hold(P, 1, lambda: box((0, 0, 0), (0.05, 0.05, 0.24), M("dlato", "#9aa6c0", 0.3, 0.8), bevel=0.005))
    job_npc("rezbar", dict(skin="#e0b080", top="#c9b08a", bottom="#5a3c24", hair="#4a2e1a", hat="cap", hat_c="#8a5a34", apron="#8a5a34", scale=0.97), "work", p, rate=4)


def job_malirka():
    def p(P):
        hold(P, 1, lambda: bar((0, 0, -0.05), (0, 0, 0.35), 0.015, M("stetec_m", "#c79256", 0.6), verts=8))
    job_npc("malirka", dict(skin="#ffd5a8", top="#ffd24d", bottom="#ff8a3c", skirt="#ff8a3c", hair="#3a2a22", hat="kerchief", hat_c="#46a6ff", scale=0.95), "work", p, rate=3, base=-1.3)


def job_bylinkarka():
    job_npc("bylinkarka", dict(skin="#f0c8a0", top="#7ee0b0", bottom="#4a9a5a", skirt="#4a9a5a", hair="#8a4a2a", hat="flower", hat_c="#ff6fa8", apron="#fff1d6", scale=0.96), "wave", arm=1)


# ---------------------------------------------------------------- hrad a tržiště
def job_krejci():
    def p(P):
        hold(P, 1, lambda: box((0, 0, 0), (0.3, 0.02, 0.2), M("latka_k", "#ff6f91", 0.8), bevel=0))
    job_npc("krejci", dict(skin="#f0c8a0", top="#8a3ffc", bottom="#2c2540", hair="#3a2a22", glasses=True, scarf="#ffd24d", scale=0.97), "work", p, arm=1, rate=2, base=-1.0)


def job_kral():
    job_npc("kral", dict(skin="#f0c8a0", top="#a8203a", bottom="#7a1228", hair="#e8e0d0", hat="crown", beard="#e8e0d0", coat="#a8203a", scale=1.0), "wave", arm=0)


def job_kovar():
    def p(P):
        hold(P, 1, lambda: cyl((0, 0, 0), 0.05, 0.3, M("kladivo", "#4a4a58", 0.3, 0.8), verts=8))
    job_npc("kovar", dict(skin="#d8a070", top="#c96a3a", bottom="#3a2a22", hair="#2a1a12", beard="#2a1a12", apron="#3a2a22", scale=1.02), "work", p, rate=4, base=-1.4, amp=0.5)


def job_tkadlena():
    job_npc("tkadlena", dict(skin="#ffd5a8", top="#ff6f91", bottom="#3b7be0", skirt="#3b7be0", hair="#6a3b22", hat="kerchief", hat_c="#ff6f91", apron="#fff1d6", scale=0.95), "work", rate=2, base=-1.0)


def job_sokolnik():
    def p(P):
        hold(P, 1, lambda: bar((0, 0, -0.05), (0.0, 0, 0.12), 0.03, M("rukavice", "#7a5636", 0.7), verts=8))
        sokol = hold(P, 1, lambda: sphere((0, 0, 0.14), 0.1, M("sokolT", "#8a6a4a", 0.7), scale=(0.8, 0.8, 1.2), seg=12, rings=8))
        put(cone((0, 0, 0), 0.04, 0.0, 0.1, M("zobak", "#ffc933", 0.4), verts=8, rot=(0, math.radians(90), 0)), sokol, (0.1, 0, 0.05))
    job_npc("sokolnik", dict(skin="#e0b080", top="#5a7a3a", bottom="#4a3a2a", hair="#6a3b22", hat="cap", hat_c="#3a5a2a", scarf="#c9a23a", scale=0.98), "wave", p, arm=0)


# ---------------------------------------------------------------- podmořské město
def job_perla():
    job_npc("perla", dict(skin="#ffd9c4", top="#ff9ad8", bottom="#46d6c8", skirt="#46d6c8", hair="#46d6ff", hat="flower", hat_c="#ffd24d", scale=0.95), "wave", arm=1)


def job_potapec():
    job_npc("potapec", dict(skin="#e0b080", top="#ffd24d", bottom="#c9a23a", hair="#3a2a22", hat="diver", hat_c="#c9a23a", scale=1.0), "wave", arm=0)


def job_perlar():
    def p(P):
        hold(P, 1, lambda: sphere((0, 0, 0.0), 0.07, glow("perlaH", "#ffffff", 3.0), seg=12, rings=8))
    job_npc("perlar", dict(skin="#f0c8a0", top="#ff7aa8", bottom="#2c2540", hair="#e8e0d0", hat="cap", hat_c="#ff7aa8", apron="#fff1d6", glasses=True, scale=0.97), "work", p, rate=2, base=-1.0)


def job_mag():
    job_npc("mag", dict(skin="#e8c8a0", top="#46b6e0", bottom="#2a4a8a", hair="#e8e0d0", hat="wizard", hat_c="#2f9aa8", beard="#f4f1ea", coat="#46b6e0", scale=1.0), "wave", arm=1)


def job_delfinka():
    job_npc("delfinka", dict(skin="#ffd5a8", top="#46a6ff", bottom="#2f6fd8", hair="#2a1a12", hat="cap", hat_c="#46a6ff", scale=0.96), "wave", arm=0)


JOBS2 = {k[4:]: v for k, v in globals().items() if k.startswith("job_") and k not in ("job_npc",)}
JOBS2 = {n: f for n, f in JOBS2.items() if n in ("vila hajny rezbar malirka bylinkarka krejci kral kovar tkadlena sokolnik perla potapec perlar mag delfinka".split())}

if __name__ == "__main__":
    for w in [a for a in args() if a in JOBS2]:
        JOBS2[w]()
