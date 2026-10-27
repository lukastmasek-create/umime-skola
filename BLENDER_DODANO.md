# Dodaná 3D grafika (Blender)

Co je hotové ze zadání `SHOP_ASSETS.md` a `ASSETS_3D.md`. Zdrojové skripty jsou v `umime-art/scripts/`,
takže jde všechno kdykoli přerenderovat. Soubory v `public/` jsou připravené k použití.

## Město: speciální budovy (`public/city/sprites/`)

| id | soubor | rozměr | půdorys |
|---|---|---|---|
| `christmas_tree` | `christmas_tree.png` | 256 × 298 | 2 × 2 |
| `windmill` | `windmill.png` | 256 × 286 | 2 × 2 |
| `ferris_wheel` | `ferris_wheel.png` | 384 × 362 | 3 × 3 |

- Všechny tři id jsou zapsané v `manifest.json`, hra je tedy už kreslí místo budov kreslených kódem.
  Ověřeno v prohlížeči: sedí přesně na dlaždice.
- Postup přesně podle `SHOP_ASSETS.md`: ortografická kamera X 60° / Z 45°, šířka (w + h) × 64 px,
  kotva v dolním rohu půdorysu. Skript je `city.py`, náhled na mřížce dělá `city_check.mjs`.
- **Pozor u budov s nesouměrným půdorysem (třeba 3 × 2):** `drawImage` v `city-render.ts` vystředí obrázek
  na blízký roh. Pro w ≠ h ale blízký roh není uprostřed diamantu (ten je o (w − h) × 16 px vedle), takže
  takový sprite by byl posunutý. U čtvercových budov to nevadí. Než se budou dělat nádraží, škola a další,
  je potřeba buď upravit kreslení, nebo se domluvit na kotvě.
- V noci se sprite neztmavuje. Kódem kreslené budovy na noc reagují, sprity zatím ne.

### Celé město (druhá sada)

Vyrenderované jsou všechny položky z `CITY_ITEMS` kromě zábradlí (to se napojuje na sousedy a kreslí ho dál
kód). Dále jsou hotové dlaždice silnic (16 tvarů podle sousedů), kolejí a přejezdů, tráva a auta a vlaky.
Popis názvů je v hlavičce `city-render.ts`, render dělá `umime-art/scripts/city2.py`.

- `city-render.ts` teď sprite umisťuje podle levého rohu půdorysu, takže sedí i budovy 3 × 2 a podobně.
- Pro otočené budovy (`rot = 1`, w ≠ h) bere `<id>_r` a v noci přimíchá `<id>_noc` s rozsvícenými okny.
- Upozornění o kotvě výše tím odpadá.

## 3D mazlíčci (`public/pets/<druh>.glb`)

Pro `cat`, `dog`, `bunny`, `fox` a `dragon` jsou hotové 3D modely s animacemi `klid`, `jedeni`, `hrani` a `radost`.
Výrazy podle nálady jsou uzly `nalada_<happy|ok|sad|hungry>_*`. Doplněk z obchodu se připíná na kotvy `kotva_hlava`,
`kotva_ucho`, `kotva_oci` a `kotva_krk`.

- Hra je zobrazuje přes `PetView` a `Pet3D` (`src/components/idle/`). Fáze růstu řeší měřítkem.
- Po krmení, hraní a pamlsku se přehraje příslušná animace, kliknutí na mazlíčka ho rozradostní.
- 2D `PetArt` zůstává jako záloha bez WebGL a pro malé náhledy.
- Statické náhledy jsou v `public/pets/<druh>-<nálada>.webp`.

## Doplňky mazlíčků (`public/pets/accessories/`)

`bow`, `flower`, `party`, `glasses`, `scarf`, `crown`: každý jako `<id>.glb` (Draco, 18–130 kB) a náhled
`<id>.png` (512 × 512, průhledné pozadí).

- Měřítko odpovídá hlavě mazlíčka širokou zhruba 1 jednotku. Přední strana je +Z (v glTF), nahoře je +Y.
- Počátek modelu leží v kotvě:
  - mašle a kytička: střed uzlu nebo květu
  - čepice a koruna: střed spodku
  - brýle: střed můstku, ve výšce očí
  - šála: střed kruhu kolem krku

## Avatary (`public/avatars-3d/`)

Všech 17 avatarů z `src/lib/avatars.ts`: `robot`, `cat`, `alien`, `ghost`, `fox`, `owl`, `panda`, `dragon`,
`ninja`, `king`, `founder`, `chemik`, `winter`, `astronaut`, `pirate`, `wizard`, `pumpkin`.
Každý má stejnou sadu jako kočka a robot:

- `<id>.glb`: Draco, animace `klid` a `radost`
- `<id>-portret.webp`: 256 × 256
- `<id>-postava.webp`: výška 256

Napojené jsou v `src/lib/avatars3d.ts`, takže je profilovka, žebříček, podium i živá 3D postava v profilu
použijí samy. V prohlížeči jsem ověřil, že se všech 15 nových modelů načte a hraje animace.

Skripty: `avatars.py` (kočka, robot, společný rig a pečení), `avatar_chars.py` (avatary z obchodu)
a `avatar_chars2.py` (ostatní). Spouští se příkazem `blender -b --python avatar_chars2.py -- <id> render`
a pak `avatar_stills.mjs`.

## Rámečky profilovky (`public/cosmetics/frames/`)

`gold`, `rainbow`, `neon`, `leaf`, `stars`, `fire` jako `<id>.webp`, 512 × 512, průhledné.

- Obrázek má stejnou geometrii jako SVG v `AvatarFrame.tsx`: je 1,2× větší než avatar a kolečko avataru
  končí na 1/1,2 poloviny šířky.
- Stačí ho položit přes avatar stejně jako dnešní SVG: `left/top = −size × 0,1`, šířka `size × 1,2`.

## Pozadí profilu (`public/cosmetics/banners/`)

`sunset`, `ocean`, `forest`, `galaxy`, `candy`, `night-city`, `snow` jako `<id>.webp`, 1200 × 400.

- Střed obrázku je klidnější (jméno a avatar), detaily jsou po stranách.
- CSS přechody v `cosmetics.ts` můžou zůstat jako záloha (`background: url(...) center / cover, <přechod>`).

## Hry u kurzů (`public/game-sprites/<hra>/`, `public/game-models/<hra>/`)

Pro všech 8 her: `space`, `mario`, `pacman`, `snake`, `breakout` (Pong), `tetris`, `kong`, `centipede`.

- **Sprity (pro dnešní canvas 640 × 420):** každá skupina je jeden `.webp` list se snímky v mřížce (nejvýš 8 v řádku).
  Popis je v `<hra>.json`:
  ```json
  { "groups": { "lod": { "file": "lod.webp", "cell": [96, 96], "cols": 8, "frames": { "klid": [0, 0], "vlevo": [4, 0] } } } }
  ```
  - Snímek se kreslí jako `drawImage(list, col * w, row * h, w, h, x, y, w, h)`.
  - Velikost buňky je 2× velikost, jakou má věc ve hře, takže je ostrá i na retině. Ve hře ji stačí kreslit poloviční.
  - Postavy a předměty mají tenký inkoustový obrys, dlaždice a pozadí ne.
- **3D modely (pro budoucí 3D režim):** `.glb` (Draco) s jednoduchými PBR materiály, každý model zvlášť. Měřítko je
  zhruba „1 jednotka = 1 buňka“, přední strana je −Y v Blenderu (+Z v glTF).
- Skript je `umime-art/scripts/game_sprites.py` (render) a `game_sheets.mjs` (balení listů).
- Do kódu her jsem nesahal. Napojení (nahrazení kreslení kódem) nechávám na tobě, kódem kreslený vzhled ať zůstane
  jako záloha, kdyby se list nenačetl.

Co je v jednotlivých hrách, je vidět v `<hra>.json` (názvy skupin a snímků).

## Proxy

`src/proxy.ts`: do výjimek přibyly `city/`, `pets/` a `cosmetics/`, aby se statické soubory nepřesměrovávaly
na jazykovou verzi. Bez toho hra nenačetla `manifest.json`.

## Hlavní stránka (`public/home/`)

3D náhrady emoji a SVG ozdob na hlavní stránce. Vše je WebP s průhledností, ikony jsou ve 2× rozlišení
(kreslit poloviční). Render dělá `umime-art/scripts/home_assets.py`, kopírování na web `home_publish.mjs`.

| Soubory | Rozměr | Kam |
|---|---|---|
| `predmet-<slug>.webp` (9, slugy z `taxonomy.ts`) | 256 × 256 | dlaždice předmětů místo emoji |
| `funkce-kurzy`, `-hry`, `-unikovky`, `-zebricky` | 256 × 256 | karty „Co tu najdeš“ |
| `sekce-zakladni`, `-stredni`, `-prijimacky`, `-maturita` | 256 × 256 | karty sekcí (planeta, galaxie, kometa, raketa) |
| `planeta.webp` | 1024 × 680 | velká planeta v hero (místo `pozadi_planeta`) |
| `raketa.webp` | 256 × 256 | letící raketa (`Rocket`) |
| `list`, `motyl`, `kapradi`, `houba`, `beruska` | 192 × 192 | ozdoby přírodní části (`NatureDecor`) |
| `oblak-1`, `oblak-2` | 256 × 160 | mraky v části s horami |
| `vlajka.webp` | 192 × 192 | vlajka na vrcholu |
| `krok-1`, `-2`, `-3` | 128 × 128 | čísla kroků „Jak to funguje“ |
| `hory.webp` | 1440 × 260 | hřeben hor se sněhem místo SVG `Mountains` (spodní okraj) |

`src/proxy.ts`: přidána výjimka `home/`.

## Nová sada z obchodu a her (avatary, městečko, mazlíčci, únikovky, hry)

- **Avatary (28)**: `public/avatars-3d/<id>.glb` + `-portret.webp` a `-postava.webp` pro frog, penguin, unicorn,
  koala, llama, octopus, capybara, yeti, doctor, chef, firefighter, detective, pilot, inventor, archaeologist,
  sailor, explorer, ranger, knight, fairy, elf, dwarf, vampire, mummy, mermaid, robot-dino, phoenix, cosmic.
  Zapsáno v `src/lib/avatars3d.ts` (MODELS), takže je `getAvatarModel` / `getAvatarStills` vrací samy.
  Render: `umime-art/scripts/avatar_chars3.py`.
- **Městečko (35 budov)**: `public/city/sprites/<id>.png` (+ `_noc` u budov s okny, `_r` u nesouměrných),
  v `manifest.json`. ID odpovídají `idle/city.ts`. Render: `city3.py`.
- **Mazlíčci (6 druhů)**: `public/pets/<druh>.glb` a `<druh>-<nálada>.webp` pro hamster, panda, penguin, frog,
  unicorn, robot; doplňky `public/pets/accessories/halo|headphones.glb/.png`. `src/lib/pets3d.ts`:
  druhy přidány do `PETS_WITH_3D`, oba doplňky ke `kotva_hlava`.
- **Únikovky** (`public/escape/<místnost>/`, místnosti museum, expedition, jungle, pirate, kitchen):
  `bg.webp` (800 × 450, stěna a podlaha), místa `a|b|c|d|e|door|examine.webp` (256 × 256)
  a předměty `items/key|partB|partC|tool|card.webp` (128 × 128). Klíče odpovídají `places` a `things`
  v `src/lib/escape/rooms/<místnost>.ts`. Render `escape_assets.py`, kopírování `escape_publish.mjs`.
- **Hry flappy, mole, ninja**: `public/game-sprites/<hra>/` a `public/game-models/<hra>/` (stejný formát
  jako u ostatních her). Render `game_sprites2.py`.

`src/proxy.ts`: přidána výjimka `escape/`.

## Animace úvodní stránky (`public/home/`)

Smyčky vyrenderované v Blenderu (zdrojové skripty jsou v `tools/blender/`, spouští se `python3 skript.py -- výstupní_složka počet_snímků`):

- `raketa-let.webp`: 3D raketa s hořícím plamenem a jiskrami, průhledné pozadí (`rocket.py`, 24 snímků). Letí po dráze z CSS (`rocket-path`).
- `planeta-tocici.webp`: otáčející se planeta s prstencem a obíhajícím měsícem, průhledné pozadí (`planet.py`, 48 snímků).
- `hvezdy.webm` / `hvezdy.mp4`: hvězdy ve třech vrstvách, barevný prach, bokeh a padající hvězdy na černém pozadí (`bg.py`, 180 snímků po 15 fps). Přes mlhovinu se skládá přes `mix-blend-mode: screen`.
- Při zapnutém „omezit pohyb“ se místo animací zobrazí statická `raketa.webp` a `planeta.webp` a video se skryje.

## Farma (`public/farm/`)

Grafika stálé hry Farma (zdrojové skripty `umime-art/scripts/farm.py` a `farm_publish.py`, Blender přes `bpy`):

- `crops/<plodina>_<stadium>.webp` (256 × 256): 10 plodin (pšenice, mrkev, kukuřice, brambor, rajče, jahoda, slunečnice, dýně, jablko, hrozny) ve třech stádiích (sazenice, roste, zralé), každý snímek i se záhonem; `soil.webp` je prázdný záhon.
- `animals/<zvíře>.webp` (256 × 256): slepice, kachna, ovce, koza, kráva, prase, včela.
- `icons/<surovina>.webp` (128 × 128): ikony plodin a výrobků zvířat (vejce, kachní vejce, vlna, sýr, mléko, lanýž, med).
- `hero.webp` (1600 × 520): panorama farmy se stodolou, silem, záhony a plotem.
- Herní logika je v `src/lib/idle/farm.ts`, API v `src/app/api/stale-hry/farma/route.ts`, rozhraní v `src/components/idle/FarmGame.tsx`. Chybí-li obrázek, hra zobrazí emoji.
- Složka `farm/` musí být ve výjimkách `matcher` v `src/proxy.ts`, jinak se obrázky přesměrují na jazykovou verzi.

## Pokoj (`public/room/`)

3D rendery pro hráčský pokoj (zdrojové skripty `umime-art/scripts/room.py` a `room_publish.py`):

- `furniture/<id>.webp` (256 × 256, průhledné): všech 12 kusů nábytku z `src/lib/room.ts` (květina, pohovka, počítač, knihovna, globus, kytara, akvárium, dalekohled, vitrína s poháry, herní automat, piano, postel-raketa). Místo, kde nábytek stojí na podlaze, je ve 65 % výšky obrázku.
- `background.webp` (1600 × 1000): pokoj s okny, obrazy, kobercem a prkennou podlahou.
- Sloty v pokoji jsou v `ROOM_SLOT_POS` (`src/lib/room.ts`) v procentech, zadní řada je menší než přední. Chybí-li obrázek, zobrazí se emoji.
- Složka `room/` je ve výjimkách `matcher` v `src/proxy.ts`.
