# NEXT STEPS
1. `npm run preview:intro`, `preview:home`... inspect each; tune `shots`, `cursor`, `highlights` in `src/film/defs/*.ts` (all in page px; screen = 1920x1080).
2. Capture real interactions: extend `capture/` with Playwright flows (login via `capture/login.mjs`), record frame sequences (e.g. 30 screenshots at 60 ms) and add a `SequenceLayer`. Priorities: quiz answering, multiplayer with 4 demo players (teacher + 3 student contexts), farma planting, mesto building, základna upgrade, team assignment.
3. Audio: add `public/audio/*`, `<Audio>` per section (Artlist MCP has SFX/music search; check licence).
4. Hero polish: neck colour, glass haze, vertical framing.
5. More modules from ROUTE_INVENTORY: zebricky, obchod, trziste, mazlicci, unikovky, materialy, pro, code.
## Re-capturing
Public: `npm run capture:strips` (needs python3 + Pillow), then `python3 capture/compress.py`.
Gated: start Postgres, `.env` with local DATABASE_URL, `npx prisma migrate deploy`, `psql -f prisma/sql/all-courses.sql`, `node showcase/demo/seed.mjs`, `next dev`, then `npm run capture:gated` (hides the Next dev badge). Never run against production data.
