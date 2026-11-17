# ROUTE INVENTORY (from `find src/app/[locale] -name page.tsx`; prefix `/[locale]`)
| Route | Notes | Public live? | Module |
|---|---|---|---|
| `/` | homepage | yes | 01 home |
| `/kurzy`, `/kurzy/[category]`, `/kurzy/[category]/[course]`, `.../kurz/[difficulty]`, `.../hra/[game]`, `.../test/[difficulty]`, `/kurzy/sablony` | courses -> lessons/games/tests (DB driven) | list yes | 02 courses, 03 lessons |
| `/hrat-spolecne`, `/nova`, `/[pin]`, `/sady`, `/sady/[id]`, `/sady/[id]/hra/[game]` | live multiplayer (join code / create) | lobby yes | 04 multiplayer |
| `/stale-hry` + `/farma`,`/mesto`,`/zakladna`,`/ekonomika`,`/mazlicci` | persistent games | hub yes, games login-gated | 05-08 |
| `/tymy`, `/tymy/[id]`, `/tymy/[id]/zadani/[aid]` | teams/classes + assignments | gated | 09 |
| `/ucitele`, `/zaci`, `/skola`, `/rodina`, `/pro`, `/pro/[feature]` | audience pages / UčímePRO | yes | 10 + extras |
| `/zebricky`, `/obchod`, `/uzivatelsky-obchod`, `/trziste`, `/pokoj`, `/parta`, `/profil`, `/nastaveni` | leaderboards, shop, market, room, social, profile, settings | mixed | 11+ |
| `/denni-kviz`, `/opakovani`, `/unikovky`, `/unikovky/[room]`, `/mapa`, `/materialy/...`, `/code`, `/scratch` | daily quiz, review, escape rooms, map, materials, code, scratch | mostly yes | 11+ |
| `/ukazka-ui`, `/kontakt`, legal pages, `/prihlaseni`, `/registrace` | internal/legal/auth - excluded or grouped | - | none |
Verify per-module feature scope before storyboarding; not all verified yet.
