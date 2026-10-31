# Craftování: jména 3D modelů (zatím jen pojmenované)

Craftování je v profilu na záložce **Craftování** (`/profil#craftovani`). Katalog materiálů a receptů je v
`src/lib/craft.ts`, pole `asset3d` u receptu je název modelu, který má jednou dodat 3D tým.

**Zatím se nic nemodeluje.** Tenhle soubor jen drží jména, aby se později nemusela vymýšlet:

- Avatary a pozadí fungují už teď: avatar se kreslí jako SVG (`src/lib/avatars.ts`), pozadí jako CSS přechod
  (`src/lib/cosmetics.ts`). Model / obrázek z Blenderu je jen vylepšení, stejně jako u ostatních avatarů
  (`public/avatars-3d/<název>.glb`, rendery `-portret.webp` a `-postava.webp`; pozadí `public/cosmetics/banners/<id>.webp`).
- Doplňky na avatara, pro mazlíčky a do pokoje mají v receptu `ready: false`: hráč recept vidí, ale vyrobit ho
  nejde, dokud model není. Až model bude, přepne se `ready: true` a napojí se zobrazení.

Pravidlo receptů: každá věc se vyrábí jen z materiálů **svého světa** (vesmírná z vesmírných…), bonusy z obecných.

### Avatary

| název modelu | věc | svět | stav |
|---|---|---|---|
| `avatar-craft-star-wanderer` | Hvězdný poutník | Vesmír | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-coral-guardian` | Korálový strážce | Moře | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-forest-spirit` | Lesní duch | Les | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-blacksmith` | Hradní kovář | Hrad | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-moon-witch` | Měsíční čarodějka | Kouzla | funguje už teď (SVG / CSS), model je vylepšení |

### Doplňky na avatara

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-antenna-helmet` | Helma s anténkou | Vesmír | čeká na model, do té doby nejde vyrobit |
| `craft-pearl-necklace` | Perlový náhrdelník | Moře | čeká na model, do té doby nejde vyrobit |
| `craft-leaf-wreath` | Věnec z listí | Les | čeká na model, do té doby nejde vyrobit |
| `craft-knight-helmet` | Rytířská přilba | Hrad | čeká na model, do té doby nejde vyrobit |
| `craft-witch-hat` | Čarodějný klobouk | Kouzla | čeká na model, do té doby nejde vyrobit |
| `craft-cape-of-stars` | Hvězdný plášť | Vesmír | čeká na model, do té doby nejde vyrobit |
| `craft-dragon-wings` | Dračí křídla | Kouzla | čeká na model, do té doby nejde vyrobit |

### Doplňky pro mazlíčky

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-pet-spacesuit` | Skafandr pro mazlíčka | Vesmír | čeká na model, do té doby nejde vyrobit |
| `craft-pet-sailor-collar` | Námořnický obojek | Moře | čeká na model, do té doby nejde vyrobit |
| `craft-pet-acorn-cap` | Žaludová čepička | Les | čeká na model, do té doby nejde vyrobit |
| `craft-pet-knight-cape` | Rytířský plášť pro mazlíčka | Hrad | čeká na model, do té doby nejde vyrobit |
| `craft-pet-star-collar` | Hvězdný obojek | Kouzla | čeká na model, do té doby nejde vyrobit |

### Ozdoby profilu (pozadí)

| název modelu | věc | svět | stav |
|---|---|---|---|
| `banner-craft-nebula` | Pozadí: Mlhovina | Vesmír | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-reef` | Pozadí: Korálový útes | Moře | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-grove` | Pozadí: Prastarý háj | Les | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-forge` | Pozadí: Kovárna | Hrad | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-moonlight` | Pozadí: Měsíční svit | Kouzla | funguje už teď (SVG / CSS), model je vylepšení |

### Do pokoje

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-room-solar-system` | Model sluneční soustavy | Vesmír | čeká na model, do té doby nejde vyrobit |
| `craft-room-ship-wheel` | Lodní kormidlo | Moře | čeká na model, do té doby nejde vyrobit |
| `craft-room-bonsai` | Bonsaj | Les | čeká na model, do té doby nejde vyrobit |
| `craft-room-armor-stand` | Brnění na stojanu | Hrad | čeká na model, do té doby nejde vyrobit |
| `craft-room-cauldron` | Kotlík s lektvarem | Kouzla | čeká na model, do té doby nejde vyrobit |

### Materiály (jen jména, ikony zatím emoji)

| id | materiál | svět | vzácnost |
|---|---|---|---|
| `wood` | 🪵 Dřevo | Obecné | běžný |
| `iron` | 🔩 Železo | Obecné | neobvyklý |
| `silver` | 🥈 Stříbro | Obecné | vzácný |
| `gold` | 🪙 Zlato | Obecné | epický |
| `moon-dust` | 🌑 Měsíční prach | Vesmír | běžný |
| `meteorite` | ☄️ Meteorit | Vesmír | neobvyklý |
| `star-crystal` | 💠 Hvězdný krystal | Vesmír | vzácný |
| `comet-core` | 🌠 Jádro komety | Vesmír | epický |
| `shell` | 🐚 Mušle | Moře | běžný |
| `coral` | 🪸 Korál | Moře | neobvyklý |
| `pearl` | 🦪 Perla | Moře | vzácný |
| `ocean-heart` | 🌊 Srdce oceánu | Moře | epický |
| `acorn` | 🌰 Žalud | Les | běžný |
| `resin` | 🍯 Pryskyřice | Les | neobvyklý |
| `amber` | 🔶 Jantar | Les | vzácný |
| `golden-leaf` | 🍁 Zlatý list | Les | epický |
| `stone` | 🪨 Kámen | Hrad | běžný |
| `steel` | ⚙️ Ocel | Hrad | neobvyklý |
| `ruby` | 🔴 Rubín | Hrad | vzácný |
| `royal-seal` | 🏵️ Královská pečeť | Hrad | epický |
| `herb` | 🌿 Bylina | Kouzla | běžný |
| `magic-dust` | ✨ Kouzelný prach | Kouzla | neobvyklý |
| `moonstone` | 🔮 Měsíční kámen | Kouzla | vzácný |
| `dragon-scale` | 🐉 Dračí šupina | Kouzla | epický |

