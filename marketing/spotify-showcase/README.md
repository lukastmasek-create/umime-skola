# Spotify — 3D showcase (Remotion + React Three Fiber)

1080×1920, 60 fps, 1500 frames (25 s), H.264.

```bash
cd marketing/spotify-showcase
npm install
npm start            # Remotion Studio
npm run still        # QC frame -> out/frame.jpg
npm run render       # GPU machine -> out/spotify-showcase.mp4
npm run render:cpu   # headless Linux / no GPU (software GL, ~3-4 s/frame)
```

Headless Linux has no GPU: plain `--gl=angle` fails with "Error creating WebGL context".
Use `--gl=swangle` (`render:cpu`). Full render on CPU takes roughly 1.5 h.

Artwork is procedural (see `src/utils/textures.ts`); swap in licensed images if available.
