# Zadání: „Jak to funguje“ jako živé městečko (náhrada hory)

Tohle je zadání pro novou session. Cíl: nahradit sekci **Jak to funguje** na homepage (dnes `MountainTrek`: realistická hora se stezkou a turistou) hravým **městečkem s pohořím v pozadí**. Vlastník (česky, neformálně) se mu hora „moc nelíbí“, chce víc hravosti a „pokročilé animace“.

## Přesné přání vlastníka
- Městečko s pohořím v pozadí, zakomponované do „jak to funguje“ (3 kroky).
- **Obyvatelé a zvířátka, všechno vymodelované (Blender/bpy) s pokročilými animacemi.**
- **Zakomponovat naši sopku** (už máme hotovou animovanou: `public/home/anim/sopka.webp`, 600×675, 84 snímků, průhledné pozadí, zdroj `umime-art/blender/sopka.py`) do městečka.
- Oživit: **mraky a ptáky, zvířátka, počasí** (sníh/déšť/slunce, apod.).
- Styl: hravý, pohádkový, žádný „AI slop“ – detailní ručně působící modely jako památky na globusu (`znacky_*.py`).
- Odpovídat česky. PR vytvářet/mergovat jen když to vlastník řekne („mergni to na main“).

## Co dnes existuje (nahrazuje se)
- `src/components/MountainTrek.tsx` – klientská komponenta; props `steps: {title,text}[]` (3 kroky z `src/i18n/home.ts`: Vyber kurz / Procvičuj hrou / Rosteš). Turista jde po stezce podle scrollu (rAF, `progress()` z `getBoundingClientRect`), za sebou zlatá stopa (canvas), v táborech se zapálí oheň (`ohen.webp` sprite), na vrcholu vlajka + konfeta, kroky vlevo se odemykají (`reached`). Stránka: `src/app/[locale]/page.tsx` (sekce s `🏔️ {h.stepsTitle}` → `<MountainTrek steps={h.steps} />`).
- Obrázky `public/home/hory/*` (hora.webp, turista.webp 12 snímků 256px, ohen.webp, vlajka.webp), JSON s polohami `src/components/hory-stezka.json`, Blender `umime-art/blender/hory_stezka.py` (hora, turista – kostra postavy na základě `limb()` kyvadel, oheň, vlajka). Dá se použít jako vzor postavy.
- Podobné komponenty k inspiraci: `TechBoard.tsx` (+`tech-board.json`, projekce Blender→web ortografickou kamerou), `SubjectGlobe.tsx`, `CourseWorld.tsx`.

## Doporučená architektura
1. **Blender scéna `umime-art/blender/mestecko.py`** (nová) – statické městečko na široké scéně, ortografická kamera (jako `hory_stezka.py` / `tech_deska.py`), průhledné pozadí:
   - Tři hlavní budovy = tři kroky: **1 Škola/knihovna** (Vyber kurz, cedule s předměty), **2 Herna/arkáda** (Procvičuj hrou, joystick, blikající světla), **3 Věž s pohárem/stromem růstu** (Rosteš, XP, vlajky). Plus 6–10 menších domků, náměstí s fontánou, mlýn, trh, most přes říčku, plot, stromy, lampy, klikatá dlážděná cesta spojující tři budovy.
   - **Sopka** vpravo vzadu: buď jí přidat jako samostatnou vrstvu (sprite `sopka.webp` pod/za městečkem, zarovnat osvětlení – sopka má fialový soumrak `world=("#6a58b8", 0.42)`), nebo do scény vymodelovat patu svahu, aby sopka „vyrůstala“ z pohoří. Nejjednodušší a nejlepší vzhled: pohoří + pata sopky v Blenderu, sopka jako animovaný sprite nad ním; v komponentě ji lze přepnout na „vybuchne“ při dokončení 3. kroku (synchronizace není možná u webp animace, ale lze přidat extra částice/záblesk v canvasu).
   - Samostatná vrstva **pohoří v pozadí** (několik řad pastelových hor se sněhem, vzdálené modřejší → hloubka; parallax), exportovat jako 2–3 pruhy webp (jako `hory-zadni/stredni/predni.webp` v `encode.py`).
2. **Postavy a zvířata jako samostatné smyčky (průhledné pásy snímků, 12–24 snímků, 256 px)** renderované stejnou kamerou, aby seděla perspektiva: 
   - Obyvatelé: dítě s batohem (hlavní hrdina – místo turisty, kroky: chůze + idle + radost), učitelka/knihovnice, kuchař/pekař, farmář, stařenka s košíkem, kluk s míčem – chůze, mávání, práce.
   - Zvířata: pes (běh, vrtění ocasem), kočka (sedí, mývá se, protahuje), kráva/ovce (pasou se), slepice (klují), králík (skáče), ptáci (let, sedí na střeše), ryby v říčce, motýli, kozy na horském svahu.
   - Efekty: kouř z komínů, praskající oheň, vlající vlajky, rotující větrník, tekoucí fontána, blikající okna/neon herny.
   Každou smyčku renderovat v samostatném procesu (viz pasti níže).
3. **Komponenta `src/components/TownLife.tsx`** (nová, nahrazuje `MountainTrek`; zachovat props `steps`, UI s kroky vlevo, odemykání dle scrollu): 
   - Vrstvy: pohoří (parallax při scrollu), sopka (sprite), městečko (statický obrázek), obyvatelé a zvířata (CSS `steps()` sprity – třída `.globe-sprite` v `globals.css`, 24 snímků: `background-size:2400% 100%`, `@keyframes globe-sprite`), pohyb po cestách přes JS (rAF) podél křivek z JSON exportu z Blenderu (jako `hory-stezka.json`).
   - Hlavní hrdina jde po cestě mezi 3 budovami podle scrollu (stejné `progress()`), budova se při dosažení rozsvítí (okna glow, kouř z komína, zazvoní vlajka), krok vlevo se odemkne; na konci oslava (konfeta + sopka vybuchne – např. zvýšit jiskry/záblesk).
   - Počasí: canvas částice (sníh na pohoří, déšť, slunce/mraky), cyklicky se střídá nebo reaguje na scroll. Mraky = vrstva posouvajících se sprite obrázků (render z Blenderu). Ptáci = sprite letu po drahách.
   - Výkon: `IntersectionObserver` – pauzovat mimo viewport; respektovat `prefers-reduced-motion` (statický snímek, hrdina u cíle). Neblokovat render: obrázky `loading="lazy"`.
4. **Assety** do `public/home/mesto/` (nová složka), `umime-art/encode.py` doplnit o funkci `mesto()` a zaregistrovat ji (vzor `hry()`, `unikovky()`, `hory()`). Poloha budov/cest do `src/components/mesto-scena.json` (export z Blenderu přes `paths.json` v `out/<scéna>/`, vzor `tech()` v `encode.py` – ortografická projekce `ppu`, elevace kamery).
5. i18n: texty kroků už jsou v `src/i18n/home.ts` (cs/en/de/ru). Popisky pro čtečky (aria) držet v komponentě nebo doplnit do všech 4 jazyků.

## Pracovní prostředí (důležité)
- Next.js 16 – podle `AGENTS.md` nejdřív číst relevantní příručku v `node_modules/next/dist/docs/`; Tailwind 4, React 19; eslint pravidla `react-hooks` (žádné `setState` v efektu bez důvodu, refy neměnit při renderu).
- **Blender jako Python modul:** `/tmp/claude-0/bpyenv/bin/python` (pokud neexistuje, vytvořit venv a `pip install bpy`; viz `umime-art/BLENDER_ANIM.md`). Cycles na CPU, průhledné filmové pozadí.
- Knihovna: `umime-art/blender/znacky_lib.py` (setup, plinth, box/cyl/cone/sphere/torus/bar, prism, stone_material, glow/set_glow, Flag, Bird, tree/bush/lamp_post/cobbles/pointed_window, `@anim` + `run()`); `common.py` (reset, add_camera, add_sun, add_area, material, args, render). Vzory scén: `stale_hry.py` (4 diorámata, zvířátka `animal()` – pes/kočka/liška/králík), `unikovky.py` (9 místností), `hory_stezka.py` (turista, oheň, vlajka), `tech_deska.py`, `svet_lod.py`.
- Smyčky se musí plynule opakovat: vše z fáze `t` (0..1) pomocí sinů s **celým** počtem period, kruhové dráhy, `(t + i/n) % 1` pro stoupající částice.
- Spuštění: `python umime-art/blender/<skript>.py -- <job> [--preview|--frame N]`; výstup `umime-art/out/<jméno>/f_0001.png…`. Kontrolní náhled: `umime-art/scripts/montage.py <jméno> <out.png>` (jen čerstvé snímky).
- Zakódování: `python3 umime-art/encode.py <cíl>` (Pillow) → webp do `public/home/…`.
- Dev server: port 3123; screenshoty přes Playwright (`require('playwright')`, `chromium.launch()`, `--use-gl=swiftshader` pro WebGL). Zabíjet přes `fuser -k 3123/tcp` (ne `pkill`/`ps|grep` – zabije shell).

## Pasti z minulých prací
- `box(loc, size, …)` i `sphere(…, scale=…)` nastavují **scale objektu**; když v animaci přepíšeš `obj.scale = (s,s,s)`, ztratíš rozměr. Škáluj násobkem původních rozměrů.
- Barvy jen 6místné hex (`#ffffff`, ne `#fff`) – `hex_rgba` jinak spadne.
- Každou scénu/job renderovat **v samostatném procesu** (po `reset()` zůstává stav).
- Dlouhý render pouštět na pozadí (`setsid nohup … &`) a nečekat sleep-smyčkami; vlastník nemá rád dlouhé čekací příkazy. Po restartu workeru procesy umřou.
- Nikdy `head` v pipě u encode (SIGPIPE useká výstup).
- Velikost souborů držet rozumnou: pás 24 snímků 384 px ≈ 100–250 kB (webp quality 72–80, `alpha_quality` 85).
- Stránka lokálně nemá DB: `/zebricky` ukazuje chybu, to je v pořádku.
- Force-push na větev je zakázaný; po mergnutí PR začít větev znovu z `main` (`git fetch origin main && git checkout -B <větev> origin/main`) a před pushem sloučit starou vzdálenou větev strategií `-s ours`.

## Postup a kontrola kvality
1. Nejdřív náhledový render celé scény (`--preview`), kouknout na montáž, ladit kompozici (budovy čitelné, 3 kroky jasně rozlišené, sopka/pohoří v pozadí nezahlcují).
2. Postavy po jedné: chůze, idle, speciální akce; zkontrolovat smyčku bez poskoku.
3. Napojit komponentu, screenshoty desktop + mobil (šířka ~390), zkontrolovat rolování, odemykání kroků, `prefers-reduced-motion`, výkon (žádný jank, canvas jen když je sekce vidět).
4. `npx tsc --noEmit` + `npx eslint` na změněných souborech.
5. Commit (patička: `Co-Authored-By: …` + `Claude-Session: …` podle systémového připomenutí), push na určenou větev. PR/merge až na pokyn „mergni to na main“.

## Další otevřené body (zeptat se vlastníka, jen když je to nutné)
- Má hrdina zůstat (dítě s batohem místo turisty), nebo víc postav stejnou měrou?
- Mají se kroky odemykat jen scrollem, nebo i klikem na budovu (hover/klik na obyvatele → animace)?
- Tmavé téma (noc, svítící okna) vs. denní scéna – dnes je sekce na tmavém vesmírném pozadí `zone`, takže noční městečko s měsícem a sopkou by ladilo; počasí/den-noc může běžet cyklicky.

## Související rozpracované věci (neřešit, jen vědět)
- Únikovky: 9 diorámat (`unikovky.py`, render do `umime-art/out/uni_*`, encode `python3 umime-art/encode.py unikovky`, stránka `src/app/[locale]/unikovky/page.tsx` už čte `/home/unikovky/<id>.webp`). Hrad a laboratoř se renderovaly naposledy.
- Další grafická kola (vybráno vlastníkem): profil+pokoj+odměny, obchod+kolo štěstí, žebříčky+podium.
