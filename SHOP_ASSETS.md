# Uživatelský obchod a město: co potřebujeme z Blenderu

> Kompletní soupis všeho 3D pro celý web (kurzy, hry, únikovky, stálé hry, profil, obchod) je v **`ASSETS_3D.md`**.
> Tenhle soubor popisuje podrobně hlavně přesný postup renderu izometrických budov.

Tohle je zadání pro 3D session. Hra teď všechno kreslí kódem (náhradní vzhled), takže modely jdou
dodávat postupně, po jednom. Co je hotové, hra použije samo.

Katalog obchodu je v `src/lib/shop.ts` (pole `asset3d` u každé položky), budovy města v `src/lib/idle/city.ts`.

## 1. Speciální budovy města (nejdůležitější)

Hra je izometrická 2D mapa. 3D model se proto **vyrenderuje do průhledného PNG** a hra ho nakreslí
místo budovy kreslené kódem.

| id (název souboru) | půdorys (dlaždic) | co to je |
|---|---|---|
| `christmas_tree` | 2 × 2 | vánoční strom s ozdobami a hvězdou, dárky u paty |
| `windmill` | 2 × 2 | větrný mlýn, kamenná věž, červená kuželová střecha, lopatky |
| `ferris_wheel` | 3 × 3 | obří kolo s barevnými kabinami a podstavcem |

Chceš-li, můžeš stejným způsobem udělat i kteroukoli další budovu z katalogu (název souboru = její `id`,
třeba `house.png`, `factory.png`, `town_hall.png`). Stačí ji přidat do manifestu.

### Jak renderovat (důležité, aby to do mapy sedělo)

- **Ortografická kamera**, rotace **X = 60°, Y = 0°, Z = 45°** (poměr dlaždice 2 : 1, hra používá dlaždici 64 × 32 px).
- Pozadí **průhledné**, formát **PNG**. Měřítko plánuj na dvojnásobné rozlišení (retina).
- Šířka obrázku = `(w + h) × 64` px (při 2× rozlišení), kde `w × h` je půdorys z tabulky.
  Příklad: 3 × 3 budova → 384 px široký obrázek. Výšku určuje model.
- **Kotva:** spodní roh půdorysu (ten nejblíž ke kameře) musí být přesně **uprostřed dolního okraje obrázku**.
  Hra kreslí obrázek takto: `drawImage(img, spodniRohX - sirka/2, spodniRohY - vyska, sirka, vyska)`.
- Půdorys modelu má přesně vyplnit diamant `w × h` dlaždic, nic nesmí přesahovat do sousedních políček.
- Světlo zleva shora (levé stěny světlejší, pravé tmavší), jemné měkké stíny. Styl: čistý, plochý, barevný,
  tlusté tmavé obrysy nejsou potřeba. Barvy ladit s webem (modrá `#5a6cff`, žlutá `#ffd24d`, koralová `#ff7a5c`).
- Pohyblivé části (lopatky, kolo) vyrenderuj **ve výchozí poloze**. Hra je prozatím neanimuje.

### Kam to dát

1. PNG do `public/city/sprites/<id>.png`.
2. Id přidat do `public/city/sprites/manifest.json`, například `{ "sprites": ["windmill", "ferris_wheel"] }`.

Hra si manifest načte při otevření města. Id, které v manifestu nejsou, kreslí dál kódem.

## 2. Avatary z obchodu

Stejný postup jako u ostatních 3D avatarů (viz `BLENDER_HANDOFF.md` a `src/lib/avatars3d.ts`).
Nové avatary: `astronaut`, `pirate`, `wizard`, `pumpkin`. Zimní avatar `winter` už v obchodě je, model ještě nemá.

## 3. Doplňky pro mazlíčky

Mazlíčci jsou zatím 2D (SVG). Modely doplňků zatím do hry nepůjdou přímo, ale ať už jsou připravené:
`bow`, `flower`, `party`, `glasses`, `scarf`, `crown`. Dodej každý jako **GLB** (samostatný objekt, počátek
ve středu místa, kde se nasazuje na hlavu nebo krk) plus **náhledové PNG 512 × 512** s průhledným pozadím.

## 4. Pravidla

- Nic z hry nemaž ani nepřejmenovávej. Přidávej jen soubory do `public/`.
- Názvy souborů jen malými písmeny, čísly a podtržítky nebo pomlčkami, přesně podle `id`.
- Až budeš s nějakým modelem hotový, napiš, který to je, ať ho přepnu do hry a ověřím v prohlížeči.
