# Craftování: 3D modely a jejich napojení

Craftování je v profilu na záložce **Craftování** (`/profil#craftovani`). Katalog materiálů a receptů je v
`src/lib/craft.ts`, pole `asset3d` u receptu je název modelu, který má jednou dodat 3D tým.

**Modely jsou hotové** (generátory `umime-art/blender/avatary3d.py` a `craft_doplnky.py`, pokoj `umime-art/scripts/room.py`):

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
| `avatar-craft-comet-rider` | Jezdec komet | Vesmír | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-pearl-diver` | Lovkyně perel | Moře | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-amber-druid` | Jantarový druid | Les | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-royal-guard` | Královský strážce | Hrad | funguje už teď (SVG / CSS), model je vylepšení |
| `avatar-craft-dragon-mage` | Dračí mág | Kouzla | funguje už teď (SVG / CSS), model je vylepšení |

### Doplňky na avatara

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-antenna-helmet` | Helma s anténkou | Vesmír | hotovo, jde vyrobit |
| `craft-pearl-necklace` | Perlový náhrdelník | Moře | hotovo, jde vyrobit |
| `craft-leaf-wreath` | Věnec z listí | Les | hotovo, jde vyrobit |
| `craft-knight-helmet` | Rytířská přilba | Hrad | hotovo, jde vyrobit |
| `craft-witch-hat` | Čarodějný klobouk | Kouzla | hotovo, jde vyrobit |
| `craft-cape-of-stars` | Hvězdný plášť | Vesmír | hotovo, jde vyrobit |
| `craft-dragon-wings` | Dračí křídla | Kouzla | hotovo, jde vyrobit |

### Doplňky pro mazlíčky

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-pet-spacesuit` | Skafandr pro mazlíčka | Vesmír | hotovo, jde vyrobit |
| `craft-pet-sailor-collar` | Námořnický obojek | Moře | hotovo, jde vyrobit |
| `craft-pet-acorn-cap` | Žaludová čepička | Les | hotovo, jde vyrobit |
| `craft-pet-knight-cape` | Rytířský plášť pro mazlíčka | Hrad | hotovo, jde vyrobit |
| `craft-pet-star-collar` | Hvězdný obojek | Kouzla | hotovo, jde vyrobit |

### Ozdoby profilu (pozadí)

| název modelu | věc | svět | stav |
|---|---|---|---|
| `banner-craft-nebula` | Pozadí: Mlhovina | Vesmír | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-reef` | Pozadí: Korálový útes | Moře | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-grove` | Pozadí: Prastarý háj | Les | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-forge` | Pozadí: Kovárna | Hrad | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-moonlight` | Pozadí: Měsíční svit | Kouzla | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-comet-trail` | Pozadí: Stopa komety | Vesmír | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-lagoon` | Pozadí: Laguna | Moře | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-amber-forest` | Pozadí: Jantarový les | Les | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-throne` | Pozadí: Trůnní sál | Hrad | funguje už teď (SVG / CSS), model je vylepšení |
| `banner-craft-dragon-lair` | Pozadí: Dračí doupě | Kouzla | funguje už teď (SVG / CSS), model je vylepšení |

### Do pokoje

| název modelu | věc | svět | stav |
|---|---|---|---|
| `craft-room-solar-system` | Model sluneční soustavy | Vesmír | hotovo, jde vyrobit |
| `craft-room-ship-wheel` | Lodní kormidlo | Moře | hotovo, jde vyrobit |
| `craft-room-bonsai` | Bonsaj | Les | hotovo, jde vyrobit |
| `craft-room-armor-stand` | Brnění na stojanu | Hrad | hotovo, jde vyrobit |
| `craft-room-cauldron` | Kotlík s lektvarem | Kouzla | hotovo, jde vyrobit |

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



## Kde co leží a jak se to napojuje

| co | soubory | zápis vyrobené věci | kdo čte |
|---|---|---|---|
| avatary z craftování (10) | `public/avatars-3d/<id>.glb`, `-portret.webp`, `-postava.webp` | `avatar:<id>` | šatník, profil |
| doplňky na avatara (7) | `public/avatars-3d/accessories/<id>.glb` + `.png` | `acc:<id>` | `Avatar3D` (`AvatarCustom.worn`, max 3) |
| doplňky pro mazlíčky (5) | `public/pets/accessories/<id>.glb` + `.png` (id bez `pet-`) | `pet:<id>` | `PetGame`, `Pet3D` (kotvy v `pets3d.ts`) |
| nábytek do pokoje (5) | `public/room/furniture/<id>.webp` (id bez `room-`) | `room:<id>` | 2D pokoj (`RoomView`); ve 3D pokoji zatím nejsou |

Doplňky na avatara jsou modelované v souřadnicích avatara (počátek u chodidel); `Avatar3D` je připíná na uzel
`*_hlava` (čelenky, helmy, klobouky) nebo `*_telo` (náhrdelník, plášť, křídla). Nasazená pokrývka hlavy skryje
vestavěnou (anténu, korunu).

Pozadí z craftování zatím jen jako CSS přechody (`src/lib/cosmetics.ts`), obrázky z Blenderu nejsou.
