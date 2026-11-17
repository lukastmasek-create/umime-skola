# MONO – Cinematic VFX Engine
Remotion + three.js. 50 standalone 3D animations (9:16 + 16:9, 60 fps).

```bash
npm install
npm run studio                                   # browse compositions
npm run render -- --id MONO-01-ObsidianSlash --portrait
npm run render:katana                            # family batch (both formats)
npm run render:all
```
Windows/GPU machines: replace `swangle` with `angle` in remotion.config.ts, scripts/render.mjs, scripts/still.mjs.
See docs/ for architecture, catalog, status and known issues.
