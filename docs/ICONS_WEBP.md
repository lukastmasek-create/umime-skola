# Ilustrované ikony: kresba → SVG → průhledné WebP

Ikony v `public/ikony/` se kreslí kódem (deterministicky), převádějí na průhledné WebP a na webu skládají z vrstev,
aby se zachovalo pohupování a třpyt původních SVG i `prefers-reduced-motion`.

## Příkazy (stejné v Git Bash na Windows i na macOS/Linuxu)

Jednou:

```bash
npm ci
npx playwright-core install chromium
```

Pokud už máš Chrome/Chromium, stačí místo toho `export CHROMIUM_PATH="/cesta/k/chrome"` (na Windows v Git Bash např.
`export CHROMIUM_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"`).

Vygenerovat všechno (kresba → WebP → audit → kontrola odkazů → porovnání s originálem):

```bash
npm run icons
```

Po částech:

```bash
npm run icons:art      # tools/icons/art/icons/*.mjs  → public/ikony/*.svg (zdrojová SVG, deterministicky)
npm run icons:build    # public/ikony/*.svg → *.webp (+ *.twN.webp), src/lib/icon-manifest.ts, tools/icons/audit.json
npm run icons:audit    # docs/ICONS_WEBP_AUDIT.md (tabulka: zdroj, výstup, rozměr, velikost, pohyb, použití)
npm run icons:check    # rozbité odkazy, zbylé odkazy na převedené .svg, nepoužité ikony
npm run icons:verify   # pixelové porovnání SVG s animací v čase t vs. složené WebP vrstvy (6 časů)
npm run icons:sheets   # docs/icons/set-light.png, set-dark.png, set-32px.png
```

Jednu ikonu: `node tools/icons/art/build-art.mjs --only=sada && node tools/icons/build-webp.mjs --only=sada`.
Text v ikonách (Arial/Onest) se vykresluje systémovým fontem, generuj proto na stroji s Arialem (Windows, macOS).

## Jak ikona vzniká

1. `tools/icons/art/kit.mjs`: společný systém (obrys `#1f234c` 3,2, světlo zleva shora, krémový nálepkový okraj, materiálové
   přechody `A.g` / `A.gr`, třpytky `A.spark`, obal SVG se stínem a pohupováním). Každá ikona má vlastní modul v
   `tools/icons/art/icons/<název>.mjs` s předmětovými motivy (kalkulačka, atom, baňka, preclík, amfora...).
   Kresba, která by přesáhla bezpečnou plochu, se při generování automaticky zmenší (výpis `zmenšeno do bezpečné plochy`).
2. `tools/icons/build-webp.mjs` vykreslí SVG v Chromiu a uloží:
   - `<název>.webp`: tělo ikony (bez stínu a třpytek), 256 px (ikony výher `cat-*` 320 px, kvůli 160px zobrazení v kole),
   - `<název>.twN.webp`: každá třpytka zvlášť, oříznutá kolem svého středu,
   - kódování bezeztrátově; ztrátové q95 jen když je ≥ 20 % menší a odchylka od renderu je zanedbatelná.
   Kontroluje, že vrstvy po složení odpovídají celému renderu a že nic nezasahuje k okraji (ořez).
3. Komponenta `src/components/Icon.tsx` (a `iconHtml()` v `src/lib/icons.ts` pro řetězce HTML) složí obal: stín (CSS
   `radial-gradient`), pohupující se tělo a třpytky. CSS je v `src/app/globals.css` mezi `icon-layers:start/end`.
   Pohupování 2,8 s a třpyt 1,8 s (zpoždění 0,6 s u sudých) mají stejné křivky jako původní SVG; při `prefers-reduced-motion`
   se animace vypnou a zůstane klidový stav.

## Co zůstalo jako vektor (a proč)

| Soubor / místo | Důvod |
|---|---|
| `public/ikony/balicek-mince|poklad|truhla.svg` | Několik nezávislých animací s různou periodou (hop, blink, drop, fl, třpyt). Z bitmapy je nelze věrně složit; animovaný WebP by měl periodu v hodinách. Komponenta je dál servíruje jako SVG. |
| `public/brand/logo.svg`, `logo-tmave.svg`, `ikona.svg` | Logo je tvarově čisté, malé (1–4 kB) a zobrazuje se v několika velikostech; vektor je ostřejší a menší než WebP. Přepínání světlé/tmavé varianty zůstává v CSS. |
| `src/app/icon.svg`, `public/brand/icon-*.png`, `manifest.ts` | Favicon (SVG) a ikony PWA (PNG, včetně maskable) mají pevné požadavky platforem; WebP by instalaci nebo favicon rozbil. |
| `src/components/SketchIcons.tsx`, `ProIcon.tsx`, `teams/Glyph.tsx`, `HangDecor.tsx`, `scratch/ScratchIcons.tsx`, `PlayerMarket.tsx` (inline SVG) | Barvu přebírají z `currentColor` (motiv, stav hover/aktivní), bitmapa by ji nezměnila. |
| `idle/eco-icons.tsx`, `idle/BaseGame.tsx` | Řetězce SVG kreslené do canvasu/`<image>` ze `tools/eco-icons/gen.py`, barvy a stavy se skládají za běhu. |
| `lucide-react`, `@iconify/react` | Knihovní vektorové ikony řízené barvou textu. |
