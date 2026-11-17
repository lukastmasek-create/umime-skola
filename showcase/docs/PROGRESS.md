# PROGRESS
## Done
- Audit of route tree; live capture of public pages; local seeded demo env (embedded Postgres + `next dev`, fake users `demo.*@example.test`) to capture login-gated pages.
- Engine: Monitor3D, Studio, CameraRig + `frameScreen` (page-px framing, per-aspect overrides), ScreenContent (scrolling page strips, images, cursor, click ripple, highlight ring), Film (data-driven section renderer), MasterFilm (chained sections, no duplicated frames), render + verify scripts.
- 13 section defs in `src/film/defs/`: intro, home, courses, lessons, multiplayer, hub, farma, mesto, zakladna, economy, teams, teachers, finale. Master = all in order.
## Known limitations (be honest)
- Game pages are static UI captures + tab-state crossfades. No in-game gameplay clips (answering a quiz, a live multiplayer game with several players, upgrading buildings) - those need scripted captures (see NEXT_STEPS).
- Section lengths are shorter than the brief's targets where real content is limited (multiplayer 30 s, hub 26 s, ...). Master ~7 min.
- Nothing except the hero stills and 3 intro stills has been looked at. Expect to tune camera shots / cursor coordinates after first previews.
- No sound design yet. Silent renders.
- Cursor coordinates are estimated from screenshots (page px of 1920x1080). Verify in previews.
- Tymy, Základna "Pošta" tab and teacher assignment views not captured (selectors missed).
