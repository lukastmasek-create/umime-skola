"""UčímePRO sound track: realistic one-shots only (audio/sfx_real.py) placed at the exact moments in scenes.json["events"], plus a very quiet
room-tone bed (filtered noise, no music) so there is no digital silence. usage: python audio/ucimepro_sfx.py scenes.json out.wav"""
import os, sys, json
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import SR, ns, rng, place, pan, write_wav, integrated, true_peak, lp, colored
from sfx_real import KINDS
S = json.load(open(sys.argv[1], encoding="utf-8")); r = rng(int(S["seed"]))
dur = S["frames"] / S["fps"]; buf = np.zeros((2, ns(dur + 1.0)))
for e in S["events"]:
    k = e["kind"]; x = KINDS[k](seed=int(r.integers(1, 10**6)))
    place(buf, pan(x, e["pan"]), max(0.0, e["t"]), e["gain"])
n = buf.shape[1]; bed = lp(colored(n, rng(5), 1.0), 900); bed = bed / (np.max(np.abs(bed)) + 1e-9)
buf[0] += bed * 0.012; buf[1] += np.roll(bed, 997) * 0.012                       # about -45 dBFS room tone
buf = buf[:, : ns(dur)]; buf = buf / (np.max(np.abs(buf)) + 1e-9) * 0.7          # peak -3 dBFS
f = ns(0.25); buf[:, -f:] *= np.linspace(1, 0, f)[None, :]
write_wav(sys.argv[2], buf, bits=16)
print(f"{len(S['events'])} events, {dur:.2f}s, {integrated(buf):.1f} LUFS, peak {true_peak(buf):.1f} dBTP")
m = np.abs(buf).max(0)
for s in range(int(dur)): print(s, f"rms {20*np.log10(np.sqrt(np.mean(buf[:, s*SR:(s+1)*SR]**2))+1e-9):.1f} dB")
# loudest events (measured on the one-shot level * gain)
lv = sorted(((float(np.max(np.abs(buf[:, int(e['t']*SR):int(e['t']*SR)+int(0.15*SR)]))), e['kind'], e['t']) for e in S['events'] if e['t'] < dur - 0.2), reverse=True)
print("loudest:", [(round(20*np.log10(a+1e-9),1), k, t) for a, k, t in lv[:4]])
