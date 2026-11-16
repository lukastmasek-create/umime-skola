"""Sound-effects-only track for a /tymy showcase part. Explicit cues from 2d/<part>/scenes.json (extra.cues, seconds, same timeline as the picture).
usage: python3 audio/tymy_sfx.py 2d/tymy-01/scenes.json public/tymy-01/sfx.wav
Every cue is rendered deterministically (no random drops); the seed only varies pan jitter, sample texture and gap-filler position.
Level: loudest event = hero hit, overall peak -3 dBFS; gaps > 0.35 s of digital silence are filled with a quiet cloth/air texture (approved effects only)."""
import os, sys, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, place, pan, write_wav, true_peak
from sfx_real import KINDS

DUR = {"whoosh": dict(dur=0.7), "cloth": dict(dur=0.45)}


def build(scn_path, out_path):
    S = json.load(open(scn_path, encoding="utf-8")); r = rng(int(S["seed"]))
    dur = S["frames"] / S["fps"]; N = ns(dur); buf = np.zeros((2, N + ns(1.5)))
    cues = [c for sc in S["order"] for c in sc["extra"].get("cues", [])]
    events = []
    for c in cues:
        kw = dict(DUR.get(c["kind"], {})); kw["seed"] = int(r.integers(1, 10**6))
        x = KINDS[c["kind"]](**kw)
        p = c.get("pan", 0) + 0.04 * (r.random() - 0.5)
        y = pan(x, p) * c["gain"]
        t0 = max(0.0, c["t"] - (0.0 if c["kind"] != "whoosh" else 0.0))
        place(buf, y, t0, 1.0)
        events.append(dict(kind=c["kind"], t=t0, peak=float(np.max(np.abs(y))), note=c.get("note", "")))
    # fill digital silence (> 0.35 s, except the last 0.3 s) with a quiet cloth texture
    fills = 0
    for _ in range(40):
        mag = np.max(np.abs(buf[:, :N]), axis=0) > 1e-4
        idx = np.flatnonzero(mag); edges = np.concatenate([[0], idx, [N - 1]])
        lim = N - int(0.3 * SR)
        gaps = [(a, min(b, lim)) for a, b in zip(edges[:-1], edges[1:]) if (min(b, lim) - a) / SR > 0.35]
        if not gaps: break
        a, b = max(gaps, key=lambda g: g[1] - g[0])
        mid = (a + b) / 2 / SR
        place(buf, pan(KINDS["cloth"](dur=0.5, seed=int(r.integers(1, 10**6))), 0.2 * (r.random() - 0.5)), max(0.0, mid - 0.25), 0.10); fills += 1
    buf = buf[:, :N]
    hero = max(events, key=lambda e: e["peak"]); others = sorted([e["peak"] for e in events if e is not hero], reverse=True)
    scale = 10 ** (-3 / 20) / (np.max(np.abs(buf)) + 1e-9); buf = buf * scale
    f = ns(0.25); buf[:, -f:] *= np.linspace(1, 0, f)[None, :]
    write_wav(out_path, buf, bits=16)
    pk = 20 * np.log10(np.max(np.abs(buf)) + 1e-12)
    margin = 20 * np.log10(hero["peak"] / others[0]) if others else 0
    rms = [20 * np.log10(np.sqrt(np.mean(buf[:, int(i * SR):int((i + 1) * SR)] ** 2)) + 1e-12) for i in range(int(np.ceil(dur)))]
    rep = dict(events=len(events), fills=fills, duration=dur, peak_dbfs=round(float(pk), 2), true_peak=round(float(true_peak(buf)), 2),
               hero=dict(kind=hero["kind"], t=round(hero["t"], 3), note=hero["note"], margin_db=round(float(margin), 2)),
               rms_per_second=[round(float(v), 1) for v in rms])
    json.dump(rep, open(os.path.join(os.path.dirname(scn_path), "sfx_report.json"), "w"), indent=1)
    print(json.dumps(rep))


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
