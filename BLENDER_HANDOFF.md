# Předání pro Blender chat: web Umíme

Tenhle soubor je pro nový chat, který bude dělat grafiku v Blenderu pro web **Umíme**. Přečti ho celý, než cokoli uděláš. Uživatel píše česky, odpovídej česky.

## Kontext projektu

- **Co to je:** vzdělávací web pro české žáky (ZŠ, SŠ, přijímačky, maturita). Kurzy jsou témata (např. "Pravopis i/y", "Savci", "Druhá světová válka") rozdělená do 5 obtížností. Procvičují se hrami (Space Invaders, Mario) a píšou se souhrnné testy jako ve škole. Dál: obchod s kolem štěstí, žebříčky (hráči, moje škola, škola vs škola), profil s úrovněmi a avatary, Stálé hry (základna, mazlíčci, farma, město; zatím jen karty "Brzy").
- **Jazyky webu:** čeština, angličtina, němčina, ruština.
- **Složka projektu:** `C:\Users\TuziT\Downloads\edu-site`
- **Technologie:** Next.js 16 (App Router), React 19, Tailwind 4, Prisma, PostgreSQL (Supabase), NextAuth.
- **Pravidla repozitáře:** `AGENTS.md` upozorňuje, že Next.js 16 má změny proti starším verzím. Před psaním kódu pro Next.js se podívej do `node_modules/next/dist/docs/`.
- **Git:** `https://github.com/lukastmasek-create/umime-skola`, větev `main`. Uživatel si commity a pushe zatím schvaluje, nikdy necommituj ani nepushuj bez jeho výslovného pokynu.
- **Stav k předání:** velká část nových funkcí je jen na disku, **nic z ní není commitnuté** (profil, XP, školy, žebříčky, Stálé hry, nový vzhled, Mario úpravy). Nesahej na ty soubory zbytečně a nic nemaž.

## Cíl tohoto chatu

Vytvořit v Blenderu jednotnou grafiku pro celý web, ne jen pro kurzy. Doporučené pořadí (uživatel zatím nevybral):

1. **Maskot a avatary**: 12 avatarů v jednotném 3D stylu, každý ideálně ve více pózách (neutrální, radost, smutek, výhra).
2. **Izometrická sada pro Stálé hry**: dlaždice základny, města a farmy, mazlíčci ve fázích růstu.
3. **Postavy her**: Mario hrdina a želvy, mimozemšťané (4 druhy), Pac-Man a duchové, jako spritesheety s animací.
4. **Odměny a obchod**: kolo štěstí, mince, drahokamy, truhla, odznaky úrovní, podium a poháry pro žebříčky, odznaky škol, náhledy věcí do uživatelského obchodu.
5. **Krátké animace** (nový level, otevření truhly, výhra) jako lehké smyčky.
6. **Později 3D režim her**: stejné modely exportované do glTF pro three.js.

**Rozhodnutí, která musí udělat uživatel (zeptej se ho hned na začátku):**
- Kterou část dělat první (maskot a avatary, nebo Stálé hry).
- Vizuální styl: low-poly, hračkový, pixelový, jiný?

## Vzhled webu, ke kterému se grafika musí hodit

- **Směr:** čisté plochy, ploché barvy, tlusté inkoustové obrysy (2 px) a "mačkací" tlačítka se spodním stínem. Žádné fialovo-růžové přechody ani zářivé kuličky (vypadá to jako generická AI šablona, uživatel to nechce).
- **Písma:** nadpisy **Unbounded**, text **Onest** (oba podporují latinku, rozšířenou latinku i azbuku).
- **Barvy (světlý režim):** inkoust `#16132b`, pozadí `#f6f4ee`, plochy `#ffffff`, hlavní modrá `#3248f0`, korál `#ff5a3c`, žlutá `#ffc933`, zelená `#17a864`, modrá `#29a3ff`.
- **Tmavý režim:** pozadí `#12102a`, plochy `#1c1936`, hlavní modrá `#5a6cff`, žlutá `#ffd24d`. Obrázky musí vypadat dobře na světlém **i** tmavém pozadí, takže potřebují průhlednost a čitelný obrys.
- **Styl obrysu:** doporučuju v Blenderu toon/flat shading s tmavým obrysem (Freestyle nebo inverted hull) ve stejné barvě inkoustu, aby grafika sedla k webu.

## Co už existuje (nová grafika má jít stejným směrem nebo to nahradit)

**Avatary** jsou teď kreslené jako SVG v `src/components/Avatar.tsx`, data jsou v `src/lib/avatars.ts`. Seznam (id, pozadí, barva hlavy, odemknutí):

| id | pozadí | hlava | odemknutí |
|---|---|---|---|
| robot | #8fd0ff | #d9e2ee | úroveň 1 |
| cat | #ffc933 | #ffb26b | úroveň 1 |
| alien | #7ee0b0 | #9be15d | úroveň 2 |
| ghost | #c9b8ff | #ffffff | úroveň 3 |
| fox | #ff8a6b | #ff9d3d | úroveň 5 |
| owl | #f2d58a | #b98a5a | úroveň 7 |
| panda | #b8e3a6 | #fbfbfb | úroveň 10 |
| dragon | #ff6f91 | #44c27a | úroveň 13 |
| ninja | #9aa4c4 | #ffd5a8 | úroveň 16 |
| king | #ffd24d | #ffd5a8 | úroveň 20 |
| founder | #5a6cff | #ffe3b0 | událost (zatím nedostupné) |
| winter | #d6efff | #ffffff | událost (zatím nedostupné) |

**Hry** (canvas 640×420 px, kreslené kódem v `src/lib/space-engine.ts` a `src/lib/mario-engine.ts`):
- Mimozemšťané, 4 druhy: cyklop (#7c6cff), krab (#ff5d73), chobotnice (#ffb020), UFO s pilotem (#22c55e).
- Mario hrdina: červená čepice, modré montérky, hnědé boty (vlastní postava, žádné originální grafiky Nintenda). Želvy se skořápkami `#2fb344`, `#e5484d`, `#3b82f6`, `#f5a524` s dřevěnou tabulkou s odpovědí.
- Pozadí Maria: nebe, kopce, mraky, cihlová zem.

**Stálé hry** (`src/i18n/idle.ts`, stránka `/stale-hry`): Základna, Mazlíčci, Farma, Město. Zatím jen barevné karty "Brzy".

## Kam grafiku dát a jak ji napojit

- **Statické soubory:** složka `public/`, např. `public/avatars/<id>.webp`, `public/mascot/…`, `public/sprites/<hra>/…`. V kódu se odkazují jako `/avatars/robot.webp`.
- **Avatary:** zatím je používá komponenta `Avatar` (SVG). Až budou hotové rendery, komponenta se upraví tak, aby použila obrázek a SVG nechala jako záložní variantu. Neměň zatím kód komponenty bez domluvy.
- **Formáty a velikosti (návrh):** avatary 512×512 WebP s průhledností, sprity a ikony WebP nebo PNG, spritesheety s pevnou mřížkou, krátké animace WebP. Drž se malých souborů, web musí zůstat lehký.
- **Pojmenování:** malá písmena, bez diakritiky a mezer, `id` shodné s `src/lib/avatars.ts`.
- **Sjednocení:** všechno renderuj ze **stejné scény** (stejná ortografická kamera, světlo, barevný profil), jinak postavy nebudou působit jako jeden svět.

## Připojení k Blenderu

- **Verze:** Blender 4.3.2. Doplněk naslouchá na `127.0.0.1:9876`.
- **Moje nástroje `mcp__Blender__*` v minulém chatu vypršely** (časový limit), i když Blender běžel. Přímé spojení s portem ale fungovalo.
- **Ověřený dotaz** (posláno jako JSON přes TCP socket, vrátil informace o scéně):
  `{"type":"get_scene_info","params":{}}`
  Odpověď byla např.: `{"status":"success","result":{"name":"Scene","object_count":3,"objects":[Cube, Light, Camera],"materials_count":1}}`.
  Další příkazy jsem **neověřoval**. Pokud potřebuješ spouštět Python v Blenderu, zjisti nejdřív, jak doplněk příkazy pojmenovává, a zkoušej je opatrně.
- **Stav scény při předání:** výchozí scéna (Cube, Light, Camera). **V Blenderu jsem nic neměnil.**
- **Pozor:** Blender potřebuje běžet se zapnutým doplňkem MCP. Pokud neodpovídá, požádej uživatele, ať ho spustí a doplněk zapne.
- Pracuj bez ničení: nejdřív si scénu prohlédni, nic nemaž a rozsáhlé změny si nech od uživatele odsouhlasit.

## Poznámky k prostředí (Windows)

- Shell je Git Bash. Nástroj pro příkazy ztrácí zpětná lomítka, takže skripty s regulárními výrazy ukládej přes nástroj pro zápis souborů, ne přes heredoc v příkazu.
- Dev server: `npm run dev` (port 3000), v tomto projektu se spouští přes konfiguraci `.claude/launch.json` (`edu-site-dev`).
- Před předáním výsledku vždy `npm run lint` a `npx tsc --noEmit`.
- Prohlížeč pro kontrolu vzhledu: vestavěný prohlížeč v aplikaci Claude.

## Co ještě čeká mimo Blender (jen pro orientaci)

- V Supabase byl ručně spuštěn SQL pro školy, avatary a XP (uživatel hlásí, že je hotovo, **neověřeno**, protože se z jeho počítače nedá připojit k databázi).
- Plugin Supabase v Claude je nepřihlášený.
- Uživatelský obchod je zatím jen kostra, čeká na zadání, co v něm má být.
- Nasazení na Vercel: potřebuje proměnné `DATABASE_URL` a `AUTH_SECRET` (hodnoty jsou v lokálním `.env`, nikdy je nevypisuj ani necommituj).
