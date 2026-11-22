# Promo video (Remotion)

30 s, 1920×1080, 30 fps. Samostatný balíček — mimo Next.js build.

```bash
cd video && npm install
npm run dev      # Remotion Studio
npm run render   # out/promo.mp4
```

Scény (`src/theme.ts` → `S`): NUDA → HRAJ (3D písmena) → město (GLB z `public/models`) → kvíz + XP → logo.
Audio: vlož `public/audio/voice.mp3` a `music.mp3`, pak v `src/Promo.tsx` přepni `HAS_VOICE` / `HAS_MUSIC`.
