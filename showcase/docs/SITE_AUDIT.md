# SITE AUDIT (Phase 1, partial)
Source of truth: repo `src/app/[locale]/` + live capture of https://ucimesehrou.org (reachable, HTTP 200, 2026-11-17).
Stack: Next.js 16 App Router, React, TS, Tailwind 4, Prisma/Postgres, Auth.js, Cloudflare Workers (OpenNext). 8 locales (cs default).
Capture: `capture/capture.mjs` (Playwright, 1920x1080 @2x -> `public/shots/*.png`, 3840x2160).

## Key finding: login gate
Live pages `farma`, `mesto`, `zakladna`, `ekonomika`, `tymy` show only "log in to start" cards when logged out.
Public & usable as-is: home, kurzy, hrat-spolecne (lobby: join code + create game), ucitele, stale-hry hub, zebricky, pro, obchod(?), materialy, mapa, unikovky.
=> game/team modules need a seeded local demo account (run app + Postgres + sample data). NOT done yet. See NEXT_STEPS.md.

## Real home hero (captured)
Dark default theme, neon Pangolin heading, glass cards ("Tvůj postup", "Bez reklam", "Tvoje předměty" 9 subject tiles, "Třída 5. A" leaderboard demo), CTAs "Jsem žák: začni hrát" / "Jsem učitel: založ třídu".
