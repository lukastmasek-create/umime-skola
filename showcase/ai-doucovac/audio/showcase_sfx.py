"""Sound-effects-only track for a showcase video (NO music). Reads 2d/<name>/scenes.json, writes public/<name>/sfx.wav.
usage: python audio/showcase_sfx.py <scenes.json> <out.wav>
scenes.json: { "seed": 123, "fps": 30, "frames": 450, "order": [ {"id": "katanaCut", "start": 4.2, "dur": 1.6, "extra": {"cut": 4.55}}, ... ] }
  start/dur in seconds; "extra" holds exact moments the picture decides (cut frame, click frame, spark launch...), all in seconds.
Which scenes get sound is random per video (seeded): mandatory ones always (katanaCut, clicks, sparkChat), the rest with p = 0.7.
"""
import os, sys, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, place, pan, st, write_wav, norm_to, integrated, true_peak
from sfx_real import KINDS

MANDATORY = {"katanaCut", "sparkChat", "logoSplitMenu", "pickItem"}
# per scene id: list of (offset from scene start in s, sound kind, gain, pan). "extra:<key>" uses a moment from scenes.json (seconds, absolute)
SCENE_SFX = {
    "logoMorph":     [(0.05, "whoosh", 0.7, -0.3), (0.9, "impact", 0.5, 0), (1.3, "tok", 0.4, 0.2)],
    "cards3":        [(0.1, "cloth", 0.5, -0.3), (0.35, "cloth", 0.45, 0.3), (0.6, "cloth", 0.45, 0), (0.9, "tok", 0.4, 0)],
    "katanaCut":     [("extra:cut-0.18", "katana", 1.0, 0.1), ("extra:cut+0.30", "chip", 0.6, 0.25), ("extra:cut+0.05", "debris", 0.45, 0)],
    "sparkChat":     [(0.0, "crackle", 0.5, 0), (0.15, "whoosh", 0.55, 0.3), ("extra:arrive0", "tok", 0.5, -0.3), ("extra:arrive1", "tok", 0.5, 0.3), ("extra:arrive2", "tok", 0.5, -0.1)],
    "logoSplitMenu": [(0.1, "swish", 0.7, 0), ("extra:click", "click", 0.9, 0), (0.0, "whoosh", 0.4, 0)],
    "pickItem":      [("extra:click", "click", 0.9, 0), ("extra:fly", "cloth", 0.6, 0.3), ("extra:fly+0.35", "impact", 0.35, 0)],
    "scrollDive":    [(0.0, "whoosh", 0.8, 0)],
    "statCounter":   [(0.1, "tok", 0.3, 0), (0.6, "impact", 0.4, 0)],
    "splitCompare":  [(0.2, "swish", 0.7, 0), (0.45, "thud", 0.45, 0)],
    "deck3D":        [(0.1, "cloth", 0.5, -0.2), (0.6, "cloth", 0.5, 0.2)],
    "deviceZoom":    [(0.2, "whoosh", 0.7, 0)],
    "feature":       [(0.3, "key", 0.5, 0), (0.37, "key", 0.45, 0), (0.45, "key", 0.5, 0), (1.2, "tok", 0.5, 0.2)],   # default for any feature_* scene
    "feature_photo": [("extra:click0", "click", 0.9, -0.2), ("extra:click1", "click", 0.9, 0.2), ("extra:fly", "whoosh", 0.4, 0.2), ("extra:land", "tok", 0.5, 0.1)],
    "feature_steps": [("extra:land0", "cloth", 0.5, -0.3), ("extra:land1", "cloth", 0.5, 0.3), ("extra:land2", "cloth", 0.5, 0), ("extra:type", "key", 0.5, 0), ("extra:type+0.1", "key", 0.45, 0), ("extra:type+0.2", "key", 0.5, 0), ("extra:ok", "tok", 0.6, 0.1)],
    "finale":        [(0.2, "impact", 0.8, 0), (0.9, "whoosh", 0.5, 0.2)],
}


def kind_of(sid): return "feature" if sid.startswith("feature") and sid not in SCENE_SFX else sid


def build(scn_path, out_path):
    S = json.load(open(scn_path, encoding="utf-8")); r = rng(int(S.get("seed", 1)))
    dur = S["frames"] / S.get("fps", 30); N = ns(dur + 1.0); buf = np.zeros((2, N)); n_events = 0
    for sc in S["order"]:
        sid = kind_of(sc["id"]); evs = SCENE_SFX.get(sid, [])
        if sc["id"] not in MANDATORY and r.random() > 0.7:
            continue                                                                  # random: this scene stays silent this time
        ex = sc.get("extra", {})
        for off, kind, g, p in evs:
            if isinstance(off, str):                                                  # "extra:cut-0.18" -> scenes.json extra["cut"] - 0.18
                key, delta = off[6:], 0.0
                for sgn in ("+", "-"):
                    if sgn in key[1:]:
                        key, d = key.rsplit(sgn, 1); delta = float(d) * (1 if sgn == "+" else -1); break
                if key not in ex: continue
                t = ex[key] + delta
            else:
                t = sc["start"] + off
            x = KINDS[kind](seed=int(r.integers(1, 10**6))) if kind not in ("katana",) else KINDS[kind](seed=int(r.integers(1, 10**6)))
            place(buf, pan(x, p + 0.1 * (r.random() - 0.5)), max(0.0, t), g); n_events += 1
    # global: camera moves between scenes also whoosh softly (random subset)
    for a, b in zip(S["order"][:-1], S["order"][1:]):
        if r.random() < 0.6:
            place(buf, pan(KINDS["whoosh"](0.8, 0.5, seed=int(r.integers(1, 10**6))), 0.4 * (1 if r.random() < 0.5 else -1)), b["start"] - 0.55, 0.45)
    buf = buf[:, : ns(dur)]
    pk = np.max(np.abs(buf)) + 1e-9; buf = buf / pk * 0.7                              # sfx only: peak -3 dBFS
    f = ns(0.25); buf[:, -f:] *= np.linspace(1, 0, f)[None, :]                         # tail fade (loop-friendly: starts at full level, ends at silence)
    write_wav(out_path, buf, bits=16)
    print(f"{n_events} events, {dur:.2f} s, integrated {integrated(buf):.1f} LUFS, true peak {true_peak(buf):.1f} dBTP -> {out_path}")


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
