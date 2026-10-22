# Soupis všeho 3D, co web potřebuje

Tohle je hlavní zadání pro 3D session (Blender). **Přečti nejdřív `BLENDER_HANDOFF.md`** (styl, barvy, pravidla,
připojení k Blenderu) a `SHOP_ASSETS.md` (přesný postup renderu pro izometrické budovy). Tady je kompletní seznam, co
kde stránka potřebuje, rozdělený podle oblastí a priorit. Hra zatím všechno kreslí kódem (náhradní vzhled), takže
můžeš dodávat po částech. Co dodáš, napojím já a ověřím v prohlížeči.

> Soupis vznikl procházením všech stránek a her. Tabulky budov, avatarů a obchodu se generují přímo z kódu, takže `id`
> jsou přesná. Pokud v kódu přibude něco nového, doplním to sem.

## 0. Společná pravidla

**Styl** (jednotný pro vše): hračkový, čistý, ploché barvy, měkké stíny, tmavý obrys v barvě inkoustu `#16132b`.
Barvy webu: modrá `#3248f0` / `#5a6cff`, korál `#ff5a3c`, žlutá `#ffc933`, zelená `#17a864`, světle modrá `#29a3ff`.
Všechno musí vypadat dobře na **světlém i tmavém** pozadí (průhledné pozadí, čitelný obrys).

**Jedna scéna pro celou sadu:** stejná kamera, světlo a barevný profil u všeho, co patří k sobě (budovy, mazlíčci, ikony…).

**Tři druhy dodávky:**

| Druh | Použití | Formát |
|---|---|---|
| **A. Animovaný model** | avatary, maskot, mazlíčci (živé postavy v profilu a hrách) | `.glb` s Dracem, animace `klid` (smyčka) a `radost` (jednou), případně další |
| **B. Statický render** | budovy města, rekvizity únikovek, ikony, odznaky | `.webp` (nebo `.png`) s průhledností, přesné rozměry níže |
| **C. Spritesheet / sada snímků** | postavy v hrách (Space Invaders, Mario, Pac-Man) | `.webp`, pevná mřížka, JSON s popisem snímků |

**Pojmenování:** malá písmena, čísla, pomlčky nebo podtržítka, bez diakritiky, `id` přesně podle tabulek.
**Velikost:** web musí zůstat lehký. Ikony do ~15 kB, rekvizity do ~40 kB, budovy do ~60 kB, `.glb` do ~600 kB.
**Co nesmíš:** nic nemazat a nepřejmenovávat. Jen přidávat soubory do `public/`.

## 1. Už hotové (neděláme znovu)

- `public/rewards/`: kolo štěstí (disk, střed), mince (a otáčení), truhla (zavřená, otevřená, otevírání), odznaky
  (bronz, stříbro, zlato, diamant, i s leskem), poháry (bronz, stříbro, zlato), drahokamy (rubín, safír, smaragd s trojnožkou), podium.
- `public/brand/`: logo (světlé i tmavé), ikona.
- `public/avatars-3d/`: avatary `cat` a `robot` (glb, portrét, celá postava).

## 2. Značka, kurzy, rozhraní

Tady je největší viditelný rozdíl, protože kurzy a hlavní stránka se otevírají nejčastěji. **Priorita P0.**

| Co | Kolik | Rozměr | Poznámka |
|---|---|---|---|
| **Maskot** (postava webu) | 1 model | glb + pózy | pózy: neutrální, pozdrav, radost, přemýšlení, smutek, výhra. Použije se na hlavní stránce, v prázdných stavech a u vysvětlení |
| **Ikony předmětů** | 9 | 256 × 256 | `predmet-cestina`, `predmet-literatura`, `predmet-anglictina`, `predmet-nemcina`, `predmet-rustina`, `predmet-matematika`, `predmet-dejepis`, `predmet-zemepis`, `predmet-prirodopis` |
| **Ikony stupňů škol** | 4 | 256 × 256 | `stupen-zakladni`, `stupen-stredni`, `stupen-prijimacky`, `stupen-maturita` |
| **Odznaky obtížnosti** | 5 | 128 × 128 | `obtiznost-1` (nejsnazší) až `obtiznost-5` (nejtěžší), stupňovaná velikost nebo vzhled |
| **Ikony témat kurzů** | ~40 | 192 × 192 | obecné ikony, ke kterým přiřadím 102 kurzů. Návrh níže |
| **Známky** (razítka) | 5 | 160 × 160 | `znamka-1` až `znamka-5` pro výsledek písemného testu |
| **Odznak splněného kurzu** | 1 + 1 | 256 × 256 | `kurz-hotovo` a `kurz-hotovo-zlato` (všech 5 obtížností) |
| **Ikony stavu** | ~10 | 96 × 96 | zámek, hvězdička (prázdná/plná), nápověda (žárovka), čas, srdce, štít, blesk, ohnivá série, kniha |
| **Ilustrace prázdných stavů** | 6 | 480 × 320 | nic tu zatím není, chyba, bez připojení, 404, načítání, přihlášení (s maskotem) |
| **Hlavní ilustrace úvodní stránky** | 1 | 900 × 700 | herní automat nebo scéna s maskotem a předměty |

**Návrh ikon témat kurzů** (ke každému kurzu pak přiřadím nejbližší): čísla, sčítání a odčítání, násobilka, zlomky a desetinná čísla, geometrie a tvary,
jednotky a měření, dělitelnost, hlásky a písmena, slabiky, tvrdé a měkké souhlásky, párové souhlásky, věty, slovní druhy, podmět a přísudek,
básničky, pohádky, pověsti, bajky, román a divadlo, pozdravy, barvy a čísla, rodina, zvířata, škola, jídlo a pití, oblečení a tělo, čas a kalendář, dům a bydlení,
pravěk, starověký Egypt, Řecko, Řím, středověk (hrad), husité, objevy, mapa a orientace, Česko, Evropa, kontinenty, počasí, vesmír, voda a krajina,
člověk, zdraví, rostliny, les a louka, savci, ptáci, plazi a ryby, hmyz, houby, ekologie, horniny.

## 3. Avatary (profil, žebříčky, podium)

Postup jako u `cat` a `robot` (viz `src/lib/avatars3d.ts`): `<id>.glb`, `<id>-portret.webp` (256 × 256), `<id>-postava.webp` (výška 256).
**Priorita P0** pro prvních 5 (alien, fox, panda, dragon, owl), pak ostatní.

| id | název | 3D |
|---|---|---|
| `robot` | Robot | ✅ hotovo |
| `cat` | Kočka | ✅ hotovo |
| `alien` | Vetřelec | ❌ chybí |
| `ghost` | Duch | ❌ chybí |
| `fox` | Liška | ❌ chybí |
| `owl` | Sova | ❌ chybí |
| `panda` | Panda | ❌ chybí |
| `dragon` | Drak | ❌ chybí |
| `ninja` | Nindža | ❌ chybí |
| `king` | Král | ❌ chybí |
| `founder` | Zakladatel | ❌ chybí |
| `chemik` | Chemik | ❌ chybí |
| `winter` | Zimní | ❌ chybí |
| `astronaut` | Astronaut | ❌ chybí |
| `pirate` | Pirát | ❌ chybí |
| `wizard` | Čaroděj | ❌ chybí |
| `pumpkin` | Dýně | ❌ chybí |

**Rámečky avataru** (**P2**, volitelné, zatím je kreslí kód): `gold`, `rainbow`, `neon`, `leaf`, `stars`, `fire`.
**Pozadí profilu** (**P2**, volitelné): `sunset`, `ocean`, `forest`, `galaxy`, `candy`, `night-city`, `snow` (1200 × 400 px).
**Plakety titulů** (**P3**): `rookie` (Nováček), `explorer` (Průzkumník), `expert` (Expert), `heisenberg` (Heisenberg), `scholar` (Učenec), `bookworm` (Knihomol), `mathematician` (Matematik), `builder` (Stavitel), `pet-friend` (Přítel zvířat), `legend` (Legenda).
**Odznaky úrovní** (**P1**): `uroven-1`, `uroven-5`, `uroven-10`, `uroven-15`, `uroven-20`, `uroven-30` (192 × 192).

## 4. Hry při kurzech (kvízové)

Hry jsou nyní kreslené v canvasu 640 × 420 kódem. Ze 3D modelů se udělají **spritesheety** (varianta C), které canvas
nakreslí. Průhledné pozadí, pohled shora/zepředu jako dosud. **Priorita P1.**

**Space Invaders** (`public/game-sprites/space/`):
- loď hráče (klid, plamen z trysky, naklonění vlevo a vpravo, zásah) – 96 × 96 na snímek
- mimozemšťané **4 druhy** (cyklop, krab, chobotnice, UFO) × snímky: klid ×4, zásah ×2, nabíjení střely ×2 – 128 × 128
- **boss varianty** těch čtyř (větší, červená aura) – 160 × 160
- střela hráče, nepřátelská střela, exploze (8 snímků) – 64 × 64
- bonusy: štít, rychlá střelba, zpomalení – 64 × 64
- pozadí: mlhovina, vzdálená planeta s prstencem, hvězdné vrstvy (3 vrstvy se paralaxou) – 640 × 420

**Super Mario** (vlastní postava, žádná grafika Nintenda; `public/game-sprites/mario/`):
- hrdina: klid ×2, běh ×6, skok, pád, dopad, radost – 96 × 96
- želvy **4 barvy** (zelená, červená, modrá, oranžová): chůze ×6, rozdrcená – 96 × 96, s dřevěnou tabulkou na odpověď zvlášť (80 × 40)
- pozadí vrstvy: nebe, vzdálené kopce, blízké kopce, mraky ×3, slunce, cihlová zem (dlaždice 40 × 40)
- boss varianta nebe (oranžové)

**Pac-Man** (plánovaná hra, **P2**; `public/game-sprites/pacman/`): vlastní žlutá postava (otevřená, zavřená ústa), 4 duchové (+ vystrašený) , bludiště (dlaždice rovně, roh, T, křižovatka), tečky, bonus.

**Společné ikony vylepšení** (**P1**): rychlost střelby, extra život, zpomalení, výška skoku, mince kurzu – 96 × 96.

## 5. Únikovky

První místnost je **Laboratoř doktora Atoma** (chemie). Dnes je to SVG scéna s klikacími místy. Chceme **vyrenderovanou místnost**
s rekvizitami. **Priorita P1** pro laboratoř, pak další místnosti.

**Laboratoř** (`public/escape/lab/`): pozadí místnosti (1280 × 800, pohled mírně shora na zadní a boční stěnu) a samostatné rekvizity,
které se dají kliknout a mají stavy:
- periodická tabulka na zdi, skříňka s chemikáliemi (zavřená, otevřená), pracovní stůl, větrací mřížka (zavřená, otevřená), počítač (vypnutý, zapnutý), dveře s klávesnicí na kód (zamčené, odemčené), reaktor s kontrolkami (klid, varování, kritické)
- předměty ve **sbírce**: klíč, 4 poznámky (papír s číslem 1 až 4), kyselina chlorovodíková (láhev), zinkový plíšek, balónek s vodíkem, přístupová karta (každý 128 × 128)
- efekty: unikající plyn, jiskry, blikající světlo, nebezpečí (červený nádech)
- avatar `chemik` a titul `heisenberg` (viz oddíl 3)

**Další místnosti** (**P2**, každá = pozadí + ~8 rekvizit + předměty; obsah dopíšeme my):
1. **Hrobka faraona** (dějepis): sarkofág, hieroglyfy, pyramidová zeď, kanopy, svitek, zlatý kříž ankh, past s pískem, dveře s kamenným kolem
2. **Středověký hrad** (dějepis): trůn, zbrojnice, meč, štít, pochodně, padací most, truhla, mapa
3. **Cesta kolem světa** (zeměpis): globus, kompas, mapa, kufr, vlajky, letenka, maják, loď
4. **Džungle a ZOO** (přírodopis): klece, liána, lupa, herbář, mikroskop, sova, žába, kapradiny
5. **Knihovna zapomenutých příběhů** (literatura): regály, žebřík, svícen, tajná kniha, pero, kalamář, svitek, socha spisovatele

**Rozhraní únikovek** (**P1**): ikona hvězdy (prázdná/plná), stopky, měřič nebezpečí (5 stavů), nápověda (žárovka), inventář (slot), nový předmět (záblesk), úspěch (otevřené dveře), neúspěch (přetížený reaktor).

## 6. Stálé hry

### 6a. Město (izometrické budovy, **P0 až P1**)

Postup renderu je v `SHOP_ASSETS.md` (kamera X 60° Z 45° ortografická, kotva spodního rohu půdorysu uprostřed dolního okraje,
šířka obrázku = (w + h) × 64 px při 2× rozlišení). Soubor = `public/city/sprites/<id>.png` a id do `manifest.json`.
**P1** jsou speciální budovy z obchodu (už se prodávají), ostatní se dělají podle toho, jak moc se hrají (začni domy a obchody).

| id | název | druh | půdorys | šířka PNG | pozn. |
|---|---|---|---|---|---|
| `road` | Silnice | silnice a koleje | 1 × 1 | 128 px | plochá dlaždice |
| `rail` | Koleje | silnice a koleje | 1 × 1 | 128 px | plochá dlaždice |
| `crossing` | Železniční přejezd | silnice a koleje | 1 × 1 | 128 px | plochá dlaždice |
| `bus_stop` | Autobusová zastávka | doprava | 1 × 1 | 128 px |  |
| `tram_stop` | Tramvajová zastávka | doprava | 1 × 1 | 128 px |  |
| `train_station` | Nádraží | doprava | 3 × 2 | 320 px |  |
| `cottage` | Chaloupka | bydlení | 1 × 1 | 128 px |  |
| `house` | Rodinný dům | bydlení | 2 × 2 | 256 px |  |
| `townhouse` | Řadový dům | bydlení | 2 × 1 | 192 px |  |
| `apartments` | Bytový dům | bydlení | 2 × 2 | 256 px |  |
| `tower` | Věžák | bydlení | 3 × 3 | 384 px |  |
| `stall` | Stánek | obchody a práce | 1 × 1 | 128 px |  |
| `shop` | Obchod | obchody a práce | 2 × 1 | 192 px |  |
| `bakery` | Pekárna | obchody a práce | 1 × 1 | 128 px |  |
| `cafe` | Kavárna | obchody a práce | 2 × 1 | 192 px |  |
| `market` | Tržnice | obchody a práce | 3 × 3 | 384 px |  |
| `supermarket` | Supermarket | obchody a práce | 3 × 2 | 320 px |  |
| `workshop` | Dílna | obchody a práce | 2 × 2 | 256 px |  |
| `factory` | Továrna | obchody a práce | 3 × 3 | 384 px |  |
| `office` | Kancelářská budova | obchody a práce | 2 × 2 | 256 px |  |
| `hotel` | Hotel | obchody a práce | 3 × 2 | 320 px |  |
| `mall` | Obchodní centrum | obchody a práce | 4 × 3 | 448 px |  |
| `skyscraper` | Mrakodrap | obchody a práce | 3 × 3 | 384 px |  |
| `school` | Škola | služby | 3 × 2 | 320 px |  |
| `library` | Knihovna | služby | 2 × 2 | 256 px |  |
| `fire_station` | Hasiči | služby | 2 × 2 | 256 px |  |
| `police` | Policie | služby | 2 × 2 | 256 px |  |
| `town_hall` | Radnice | služby | 3 × 3 | 384 px |  |
| `hospital` | Nemocnice | služby | 3 × 3 | 384 px |  |
| `museum` | Muzeum | služby | 3 × 2 | 320 px |  |
| `university` | Univerzita | služby | 4 × 3 | 448 px |  |
| `tree` | Strom | příroda | 1 × 1 | 128 px |  |
| `bush` | Keř | příroda | 1 × 1 | 128 px |  |
| `flowerbed` | Květinový záhon | příroda | 1 × 1 | 128 px |  |
| `park` | Park | příroda | 3 × 3 | 384 px |  |
| `playground` | Hřiště | příroda | 2 × 2 | 256 px |  |
| `pond` | Rybník | příroda | 2 × 2 | 256 px |  |
| `fountain` | Fontána | příroda | 2 × 2 | 256 px |  |
| `lamp` | Lampa | dekorace | 1 × 1 | 128 px |  |
| `bench` | Lavička | dekorace | 1 × 1 | 128 px |  |
| `bin` | Odpadkový koš | dekorace | 1 × 1 | 128 px |  |
| `fence` | Zábradlí | dekorace | 1 × 1 | 128 px |  |
| `mailbox` | Poštovní schránka | dekorace | 1 × 1 | 128 px |  |
| `flag` | Vlajka | dekorace | 1 × 1 | 128 px |  |
| `statue` | Socha | dekorace | 1 × 1 | 128 px |  |
| `clock_tower` | Hodinová věž | dekorace | 2 × 2 | 256 px |  |
| `memorial` | Pomník | dekorace | 2 × 2 | 256 px |  |
| `monument` | Monument | dekorace | 3 × 3 | 384 px |  |
| `christmas_tree` | Vánoční strom | z obchodu | 2 × 2 | 256 px | **P1** |
| `windmill` | Větrný mlýn | z obchodu | 2 × 2 | 256 px | **P1** |
| `ferris_wheel` | Obří kolo | z obchodu | 3 × 3 | 384 px | **P1** |

**Terén a dlaždice** (**P1**, 128 × 64 px, kosočtverec 2 : 1): tráva ×3 varianty, voda, písek, chodník, hlína; silnice rovně, roh (4 směry), T (4 směry), křižovatka, slepý konec; koleje rovně, roh, výhybka; přejezd.
**Vegetace** (**P1**): strom ×4 druhy (listnatý, jehličnatý, bříza, palma), keř ×3, květiny ×5 barev.
**Vozidla** (**P1**, malé izometrické sprity ve 4 směrech): auto ×7 barev, autobus, tramvaj, nákladní auto, lokomotiva a 2 druhy vagonů, mlýnský vůz.
**Lidé** (**P2**, 4 směry): chodec ×6 variant, dítě se psem, kolo.
**Efekty** (**P2**): kouř z komína (8 snímků), voda z fontány, zář lamp v noci, světla v oknech (maska), hvězdy při stavbě.

### 6b. Mazlíčci (**P0**)

Druhy: `cat`, `dog`, `bunny`, `fox`, `dragon`. Každý ve **3 fázích růstu** (mládě, dospívající, dospělý) a se **4 náladami** (šťastný, v pohodě, smutný, hladový).
Nejlépe jako `.glb` s animacemi `klid`, `jedeni`, `hrani`, `radost`; k tomu **statické rendery** každé kombinace (512 × 512 webp) jako záložní varianta.
Doplňky z obchodu (**P1**, glb + náhled 512 × 512): `bow` (Mašle), `flower` (Kytička), `party` (Oslavná čepice), `glasses` (Sluneční brýle), `scarf` (Šála), `crown` (Koruna). Doplňky se nasazují na hlavu, oči nebo krk, počátek modelu je u kotvy.
Další věci mazlíčků (**P1**): miska s jídlem (5 úrovní), hračky (míček, kost, myš; 5 úrovní), pelíšek (5 úrovní), pamlsek (dort), srdíčko, ikona hlad a nálada – 128 × 128.

### 6c. Základna a Farma (plánované hry, **P3**)

Karty „Brzy“ už na webu jsou. Až se dostaneme k nim, budeme potřebovat podobnou sadu jako město:
- **Základna:** centrála, dílna, laboratoř, generátor, sklad, hlídací věž, kasárna, hangár, observatoř, zeď, brána, antény, zásobník vody (~15 budov, izometricky, 3 úrovně vylepšení)
- **Farma:** záhon (stádia: osev, růst, zralé) pro 10 plodin (pšenice, kukuřice, mrkev, rajče, jahoda, dýně, brambor, slunečnice, jablko, hrozny), zvířata (kráva, slepice, prase, ovce, kůň, koza, kachna, včela), stodola, sýpka, studna, plot, traktor, vozík

## 7. Obchody, odměny a žebříčky

- **Kolo štěstí** (obchod): výherní ikony (body, mince, avatar, titul, truhla, prázdno, jackpot), 7 polí – 128 × 128 (**P1**). Kolo samotné už je.
- **Uživatelský obchod** (**P1**): náhledy zboží (avatary a doplňky z oddílů 3 a 6b), ikona obchodu, stužka „Novinka“ a „Oblíbené“, ikony druhů zboží (avatar, titul, rámeček, pozadí, mazlíček, město).
  Zboží: avatary `astronaut` (Astronaut), `pirate` (Pirát), `wizard` (Čaroděj), `pumpkin` (Dýně), `winter` (Zimní); tituly `scholar` (Učenec), `bookworm` (Knihomol), `mathematician` (Matematik), `builder` (Stavitel), `pet-friend` (Přítel zvířat), `legend` (Legenda); rámečky `leaf` (Listový rámeček), `gold` (Zlatý rámeček), `neon` (Neonový rámeček), `rainbow` (Duhový rámeček), `stars` (Hvězdný rámeček), `fire` (Ohnivý rámeček); pozadí `sunset` (Západ slunce), `ocean` (Oceán), `forest` (Les), `candy` (Bonbóny), `snow` (Sníh), `night-city` (Noční město), `galaxy` (Galaxie); město `christmas_tree` (Vánoční strom), `windmill` (Větrný mlýn), `ferris_wheel` (Obří kolo).
- **Body a XP** (**P1**): ikona bodů z učení (hvězda), ikona zkušeností, ikona mince města – 96 × 96, a animace přibývání (konfety, jiskry).
- **Žebříčky** (**P2**): odznaky škol (10 obecných štítů), medaile 1., 2., 3. místo (podium a poháry už jsou), ikona únikovky (stopky), ikona nekonečných her.
- **Profil** (**P2**): ilustrace „nová úroveň“ (fanfára), ilustrace „odemčeno“ (truhla se záblesky).
- **Sezónní sada** (**P3**): zima (sněhulák, vločky, čepice), Halloween (dýně, duch), jaro, léto. Hodí se jako události a avatary.

## 8. Technický postup a složky

| Oblast | Složka v `public/` | Manifest |
|---|---|---|
| Město | `city/sprites/` | `manifest.json` (už existuje, prázdný) |
| Avatary | `avatars-3d/` | napojení v `src/lib/avatars3d.ts` (doplním já) |
| Mazlíčci | `pets/` (`<druh>-<faze>-<nalada>.webp`, `<druh>.glb`) | doplním `manifest.json` |
| Hry kvízové | `game-sprites/space/`, `game-sprites/mario/`, `game-sprites/pacman/` | `<sada>.json` (mřížka snímků) |
| Únikovky | `escape/<id místnosti>/` | `manifest.json` místnosti |
| Ikony a odznaky | `icons/` (`predmet-*`, `stupen-*`, `obtiznost-*`, `znamka-*`, `stav-*`, `tema-*`) | `icons/manifest.json` |
| Ilustrace | `illustrations/` | – |
| Maskot | `mascot/` (`mascot.glb`, `mascot-<poza>.webp`) | – |

**Jak dodávat:** po každé dokončené sadě mi napiš její název a seznam souborů. Já je napojím do kódu (náhradní vzhled
zůstane jako záloha), ověřím v prohlížeči světlý i tmavý režim a telefon a dám vědět, co upravit.

## 9. Doporučené pořadí práce

1. **P0:** maskot, ikony předmětů a stupňů, avatary alien, fox, panda, dragon, owl, mazlíčci (5 druhů × 3 fáze × 4 nálady), základní budovy města (domy, obchody)
2. **P1:** speciální budovy z obchodu (vánoční strom, mlýn, obří kolo), terén a silnice města, ikony stavů a odznaky obtížnosti, ikony vylepšení, laboratoř únikovky, sprity Space Invaders a Maria, doplňky mazlíčků
3. **P2:** ostatní budovy města, vozidla, lidé, další únikovky, Pac-Man, rámečky a pozadí profilu, odznaky škol
4. **P3:** Základna a Farma, sezónní sada, plakety titulů

Orientačně: P0 přibližně 80 souborů, P1 přibližně 120, P2 přibližně 100, P3 přibližně 80.
