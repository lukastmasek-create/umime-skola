# Quality report (honest)
Inspection method so far: contact sheets of 6–8 stills per effect at preview quality, 9:16. No playback review; no 16:9 check except a few stills (49, 12, 41, 21 looked fine).

## Known issues (all effects, first pass)
- Glass is a faked fresnel/transparent material (software GL transmission looked milky). Try real transmission on a GPU.
- Several metal scenes read grey/flat; env contrast needs per-scene tuning.
- Motion blur is an SVG gaussian blur (33, 31, 34, 35) – not physically correct blur.
- Floor reflection = mirrored copy of the scene, lighting not mirrored.
- Black-hole lensing is faked (disc + photon ring); no true gravitational lensing.
- Liquid-metal effects are CPU marching cubes: low-res faceting visible at preview; use high/ultra.
- 22 tunnel rings thin/sparse; 24 folds use simple hinge folds, can self-intersect; 39 collapse uses simplified corner-vs-box contacts (may interpenetrate slightly); 37 dominoes use analytic toppling, not rigid-body contact.
- 28 final cube and 26 cube tonality are plain; 32 macro plate lacks visible brushing at preview; 35 zones are simple.
- 12 crown spikes look sharp/crystalline.
- Some portrait framings still tight (check 02, 31, 37, 38).
- Determinism: all motion is a pure function of frame; physics precomputed with fixed timesteps and seeded RNG. Not yet verified by frame-hash comparison.
