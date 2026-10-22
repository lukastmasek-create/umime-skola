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
