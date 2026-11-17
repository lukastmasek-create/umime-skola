# Quality report — MONO-01 (pass 1)
Verified by stills: rounded obsidian cube with correct split geometry, thin seam, hot cap edge, mirrored floor reflection.
Known issues: cap interior texture only faintly visible; cut edge has no bevel; slash streak is 2D additive (no true motion blur); floor reflection is mirrored geometry (env lighting not mirrored); portrait framing tight in close-ups; no playback review beyond sampled frames; grain/vignette are CSS overlays.

## MONO-02..05 (pass 1, stills only)
- 02: sphere facets visible at preview quality (use high/ultra); camera orbit tight in portrait; chrome reads grey, needs env contrast tuning.
- 03: glass is a faked fresnel/transparent look (transmission looked milky under software GL); try transmission on a real GPU. Propagating front implemented via cap shader, unverified visually.
- 04: aluminium reads flat; shockwave ring is a flat additive disc; vibration amplitude tiny.
- 05: layer spread/twist works; close "between layers" camera shots look flat/grey; 16:9 unchecked.
