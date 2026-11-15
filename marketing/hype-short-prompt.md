# PROMPT: kinetic-type "hype promo" short in Remotion + three.js for ucimesehrou.org

Paste everything below into a fresh Claude Code session in this repo.

## Task
Build ONE vertical short (1080x1920, 30 fps, ~45-60 s) in the style of a fast kinetic-typography / motion-graphics hype promo, using Remotion 4 + three.js (@react-three/fiber, @react-three/postprocessing). Add it as composition `HypeShort` in `src/Root.tsx`, code in `src/videos/hype/`. Reuse the repo's post-FX engine from `src/videos/bridge/` where it fits (lens blur, grade, grain). Follow `SKILL.md` + `CLAUDE.md` + `AGENTS.md` (this repo's Next.js is non-standard, so read `node_modules/next/dist/docs/` before touching app code). Verify with stills (`scripts/bridge-stills.mjs`, `GL=swangle`, `post.kick`) and a clean `npx tsc --noEmit`. Do not render the full film in the cloud. If a path above does not exist in this repo, create the minimum needed and say so.

**Product = the real site: Učíme se hrou (ucimesehrou.org)**, a gamified learning site for kids (little town, 3D avatars, pets, shop, quizzes, code lessons, teacher page, 8 languages).
- Pitch: "Learning that feels like a game." Script ~100-140 words. Check `src/i18n/home.ts` and `src/i18n/home-showcase.ts` for real feature names and claims. Use only claims the site really makes (see `WEBSITE_CRITIQUE.md` for honesty fixes: no fake prices, no real-money offers, no invented stats).
- Pain-point gag ("old way") = boring homework, worksheets, timers, "STUDY. STUDY. STUDY." wall of text.
- Do NOT copy any brand, logo, face, handle or watermark from the reference video. The only logo is the real Učíme se hrou logo below.

## Voice (English, male, action-packed)
- **One steady English male voice**, movie-trailer / sports-hype energy: deep-to-mid pitch, fast, punchy, confident, slight rasp OK, shouts on slam words, short drops to a near-whisper before reveals ("...and then... everything changes."). Never robotic or newsreader flat.
- Script style: short sentences, 1-4 word bursts, imperatives, rhetorical questions. Example rhythm: "No way. Homework? Dead. Boring? Gone. Meet Učíme se hrou. Quizzes. Pets. Code. A whole town. All yours. Level up. Play now."
- Brand pronunciation: write phonetically in the TTS text ("OO-chee-meh seh HROHW", "oochimeseh-hroh dot org") and keep the on-screen text spelled correctly. Listen to the clip; fix before timing.
- Generate with `scripts/voice.py` (or the repo voice pipeline). If it offers voices, pick the most energetic male English one; if it supports style/speed params, use fast + high expressiveness. Otherwise use any available TTS (ElevenLabs-style "deep energetic male", OpenAI `onyx`/`ash` with "trailer voice, intense, fast" instructions, or Piper `en_US` male) and boost with light compression + a little saturation + short slap reverb on slam words.
- Get **word-level timestamps** (forced alignment / TTS word timings) and build the shot list from them. Every kinetic word lands on its voice word.
- Mix: voice always on top, music ducked ~-8 dB under voice, big impacts allowed to punch through on slam words. No burned-in captions beyond the designed kinetic words.

## Brand kit (use these, not the reference colours)
Source: `src/app/globals.css`, `public/brand/`.
- **Logo**: use the real SVGs: `public/brand/logo.svg` (light bg), `public/brand/logo-tmave.svg` (dark bg), `public/brand/ikona.svg` (icon only, 120x125). Load via `staticFile` or inline the SVG as a React component so tiles can be animated.
  - Icon = four chunky rounded tiles (rx ~30%) in a 2x2 grid with a darker "3D lip" under each: **blue `#3248f0`** (lip `#2433b8`) with a white smile and two eyes, **coral `#ff5a3c`** (lip `#d63f24`) tilted 12°, **yellow `#ffc933`** (lip `#dca200`), **green `#17a864`** (lip `#0e7d48`). A small yellow 4-point sparkle sits top right.
  - `LogoReveal`: tiles drop in one by one with a spring bounce (blue, coral tilts to 12°, yellow, green), smile draws on, sparkle pops, then the wordmark "učíme se hrou" tracks in. Tagline pill under it: `ucimesehrou.org`.
- **Light palette**: bg cream `#f6f4ee`, ink `#16132b`, muted `#4f4a66`, surface `#ffffff`, border `#e0dccf`.
- **Dark palette**: bg `#12102a` (deep `#0c0a24`), text `#f6f1e4`, surface `#1c1936`, border `#35305f`, brand glow `#5a6cff`.
- **Accents**: brand blue `#3248f0` (hero), coral `#ff5a3c` (energy, hit flashes, highlight chips), yellow `#ffc933` (CTA + sparkles), green `#17a864` (success), sky `#29a3ff`, violet `#6250d6`. Prompt/chat box gradient: `#3248f0 -> #6250d6`.
- **Rules**: flat blue, flat cream, flat coral and deep-indigo (`#12102a`) backgrounds alternate hard every 1-3 beats. Mixed-colour tile confetti. Punchline full stop `.` in coral. Keep contrast high (cream text on indigo, ink on cream/yellow, white on blue).
- **Type** (same as the site, via `@remotion/google-fonts`): **Unbounded 800** for big kinetic words (wide, heavy, all caps, cropped by frame edge; supports latin-ext so Czech diacritics work), **Onest** for body/UI text, **Pangolin** (handwritten) for the one irony line (e.g. "the boring way"), small mono (JetBrains Mono) for code-lesson UI with coral highlight chips.
- **Shape language**: everything is a rounded, chunky tile with a hard offset "lip" shadow (flat, no soft blur): cards, buttons, wires, chips. Echo copies of text use brand colours in sequence (blue -> coral -> yellow -> green).
- **Texture**: film grain, vignette, light scanlines, bloom on blue/coral, chromatic aberration on hits. Friendlier than the reference: playful, not grim.

## Element library (small reusable components)
1. `KineticWord`: per-letter stagger, props: color, bg, align, crop, tracking, mode (`slam | stretch | scramble | extrude | outline-echo | tracking-in`).
2. `Slam`: scale 1.5 -> 1 + motion blur + 2-4 frame overshoot, lands on a voice word.
3. `Stretch`: letters scaleX/skew warp, tracking widens then snaps.
4. `Extruded3DText`: real 3D text (drei `Text3D`/troika, Unbounded), lit from side, camera dolly through it.
5. `Starburst` / `Blob`: coral 12-point burst and circle that morphs.
6. `QuestionMarks`: giant coral / ink / outline `?` popping with bounce.
7. `Laser`: thin coral line that sweeps, slices the frame, draws an X over the crossed-out "old way".
8. `ParticleField`: tile-confetti (small rounded squares in the 4 brand colours) + dot-grid, slow parallax, radial burst from centre.
9. `NodeGraph`: rounded tiles (Kid -> Game -> Lesson, or Quiz -> Pet -> Shop) joined by glowing wires with travelling pulses and pill labels.
10. `LogoReveal`: see Brand kit.
11. `PromptBox`: blue-violet rounded box, typewriter text + blinking cursor, coral chips on keywords, enter button.
12. `HomeworkMock`: boring worksheet / timetable mock with checkboxes, mouse cursor clicking, later crossed out by `Laser`.
13. `PlayerMock` + `FilmStrip`: card whose play triangle morphs -> diamond -> rounded square (the logo tile); strip of game screenshots/sprites scrolling beside it (assets in `public/home`, `public/game-sprites`, `public/room`, `public/pets`, `public/rewards`; inspect first, use only what exists).
14. `Viewfinder`: corner brackets, label, orb with tick ring (e.g. "LEVEL UP").
15. `Tile3D`: rounded 3D tile in blue/coral/yellow/green, soft contact shadow, slow orbit. Optionally real models from `public/game-models`, `public/avatars-3d`, `public/mestecko3d`, `public/pets` via drei `useGLTF` (check formats and draco in `public/draco`; keep poly count low).
16. `TimerGag`: checkerboard "HOMEWORK" word + hourglass + ETA `03:30:10` counting.
17. `StackedList`: "QUIZZES. PETS. CODE. SHOP." (real feature names) repeated and stacked into a wall of text.
18. `CTA`: yellow `#ffc933` rounded card, ink text, "PLAY FREE AT ucimesehrou.org" (only if the site is free; verify), then end card with logo on indigo.

## Transitions (the signature, custom, not stock fades)
Use `@remotion/transitions` `TransitionSeries` with custom presentations, plus `@remotion/motion-blur`.
- Whip-pan / directional smear (6-10 frames), zoom-through with radial blur, venetian-blind stripe wipe, glitch cut (block displacement + RGB split), flat-colour flash cut (one frame full blue / coral / cream), laser wipe (coral line reveals next scene), shape wipe (coral blob / tile scales up from a point and becomes next bg), and hard cuts on the beat (most common). Average shot 0.4-1.2 s, some single words 6-10 frames.
- Implement zoom/RGB/glitch/stripe as custom `postprocessing` `Effect`s (GLSL) driven by a `transition` uniform from `useCurrentFrame()`. Never `useFrame`.

## Animation rules
- Everything is a pure function of `useCurrentFrame()`. No CSS transitions, no `useFrame`, no random without `random(seed)`.
- Curves: `spring({damping: 10-14, stiffness: 180-260})` for slams, `Easing.out(Easing.exp)` for whips, `Easing.inOut(Easing.cubic)` for camera moves. Hold, snap, hold. Never linear.
- Build `story.ts`: array of `{from, dur, scene, text, bg, transitionIn}` from voice word times.
- Constant micro-motion on holds: scale 1 -> 1.04, 1-2 px jitter, confetti drift.
- Emphasis: coral chip highlight, strike-through, outline echo, 4-6 frame shake.

## Suggested structure (map to your own script)
1. 0-1.5 s: indigo, small coral dot, tile-confetti burst -> first slam word on cream ("NO WAY.").
2. 1.5-8 s: rapid single-word slams on blue / indigo / cream / coral, extruded-text zoom-through.
3. 8-14 s: "the boring way" - worksheet mock crossed out by laser X, whip to cream "AND BEFORE YOU ASK ?" with giant question marks.
4. 14-24 s: reveal - node graph, then **logo reveal** (tiles drop in, glow on indigo), subtitle "learning that feels like a game".
5. 24-34 s: "you just play" - phone-style UI card, typewriter quiz question, film strip of real game screens, morphing player shape.
6. 34-52 s: capability montage, one word per beat each with its own demo (real features, e.g. QUIZZES / PETS / CODE / 3D TOWN / SHOP / TEACHERS), each on its own brand colour.
7. Pain-point gag: starburst "ARE YOU ... KIDDING ME?", indigo grid "THINK ABOUT HOMEWORK the boring way" (Pangolin), stacked wall of text, TimerGag.
8. Last 5-8 s: yellow CTA card, end card with logo + `ucimesehrou.org` on indigo.

## Sound
Bass-heavy electronic / trailer-action beat ~124-130 bpm, cuts on beats; whoosh on every whip, riser into reveals, cinematic impact/boom on slams, glitch blips, keyboard clicks, record-stop at the gag. Bright "ding" on each tile landing in the logo reveal. Duck music under voice. Build with `audio/` scripts like `aging_mix.py`.

## Technical plan
- Layers per scene: (a) `<ThreeCanvas>` for 3D + particles + shader FX, (b) DOM/SVG overlay for UI mocks, logo and crisp text, (c) one global `EffectComposer` chain: bloom -> chromatic aberration -> grain -> vignette -> transition shader. Big words in DOM/SVG unless 3D needed.
- Fonts via `@remotion/google-fonts` (Unbounded, Onest, Pangolin, JetBrains Mono) + `delayRender` if using troika.
- Perf: ~2k instanced points max, reuse geometries, `dpr=1`. No-GPU box: `GL=swangle` + `post.kick`.
- Deliver: `story.ts`, `components/*`, `Hype.tsx`, `brand.ts` (all tokens above, single source of truth), voice script + generated audio + word-timing JSON, composition registered, 8-10 stills checked (one per scene type, incl. logo reveal on light and dark), short README on tweaking the shot list.

## Definition of done
Reference energy (constant motion, hard colour flips, every cut on a beat/word, visible custom transitions: whip, zoom-through, glitch, stripes, laser), but unmistakably Učíme se hrou: real logo tiles, blue/coral/yellow/green palette, Unbounded + Onest + Pangolin, ucimesehrou.org on end card, action-trailer English male voice with words landing on cuts. tsc clean, stills verified, no reference-video brands/faces/handles, no unverified site claims.
