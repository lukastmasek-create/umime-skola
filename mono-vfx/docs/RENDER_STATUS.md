# Render status
Verified full render: MONO-01-ObsidianSlash 9:16 high (1080x1920, 60fps, 840 frames, h264) – checked with ffprobe.
Pipeline smoke test: `--preview --frames` render of MONO-49 produced a valid 540x960 60fps mp4.
All other effects: stills only (preview quality). No full MP4 rendered in this container.
Render time reference (software GL, 4 cores): ~12 min for 840 frames at high quality, one format. On a GPU machine use `angle` instead of `swangle`.

Commands (from mono-vfx/):
- `npm run render -- --id MONO-07-GlassExplosion [--portrait|--landscape] [--quality preview|high|ultra]`
- `npm run render:katana|fracture|liquid|depth|portal|assembly|hyperspeed|gravity|typography|micro`
- `npm run render:all`  (50 effects x 2 formats = 100 videos; very long)
- `npm run preview -- --id ...` (quality=preview, scale 0.5 -> previews/)
- `node scripts/check.mjs MONO-xx-Name=frame,frame,... [--landscape]` -> previews/check/<id>/sheet.png
Outputs: renders/<family>/<id>[-16x9]_<quality>.mp4
