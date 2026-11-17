# RENDER STATUS
No MP4 has been rendered in the authoring environment (4-core CPU, software WebGL: ~15-60 s per 1080p frame; a full 60 fps master would take days).
Rendering is intended to run on a machine with a GPU:

```bash
cd showcase && npm install
npm run typecheck
npm run preview:intro          # half-res, every 2nd frame -> previews/
npm run render:intro           # 1080p60, both 16:9 and 9:16 -> renders/
npm run render:all             # every module, both formats, then master (long)
npm run render:master          # master-showcase-16x9.mp4 and -9x16.mp4
npm run verify                 # ffprobe: codec h264, size, 60 fps, frame count
```
Single format: `node scripts/render.mjs home --vertical` (9:16) or without flag (16:9). Extra remotion flags pass through, e.g. `--concurrency=2`.
If Chrome has a real GPU you may drop `--gl=angle` (`node scripts/render.mjs home --gl=default`).

| Output | Status |
|---|---|
| previews/hero-16x9.png, hero-9x16.png | rendered + inspected |
| intro-16x9 frames 0/150/420 | still-checked early (edge sweep, logo) |
| everything else | defined, typechecked, NOT rendered, NOT visually inspected |
