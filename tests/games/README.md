# Testy her

Automatické testy všech arkádových kvízových her. Hry se spouští v pravém prohlížeči (Playwright), bez databáze:
stránka `main.tsx` vloží `SpaceQuizGame` s ukázkovými otázkami.

## Postup

```bash
npm i -D playwright esbuild      # jednorázově (nejsou v package.json)
bash tests/games/run.sh          # v jednom terminálu: sestaví a spustí stránku na :8770

# v druhém terminálu:
node tests/games/play.js space-invaders,pac-man,snake easy 300
node tests/games/fuzz.js snake,tetris,kong hard 25
```

- `play.js <hry> <easy|normal|hard> <limit v s>`: bot hraje celé kolo (osm otázek) jako rozumný hráč a vypíše,
  kolik otázek zvládl, kolik ztratil životů a jak dlouho trvala každá otázka. S `HINT=1` používá nápovědy.
- `fuzz.js <hry> <obtížnost> <s>`: náhodné klávesy, klepnutí, pauzy, nápovědy a tlačítka. Hlásí chyby stránky
  a nekonečné hodnoty ve stavu hry.
- `bots.js`: boti čtou vnitřek enginu přes `window.__quizEngine` (háček v `SpaceQuizGame.tsx`, aktivní jen
  když stránka nastaví `window.__QUIZ_TEST__`).

Bot je jen pravidlová pomůcka: když ho hra porazí, je to signál ke kontrole, ne důkaz, že je hra nehratelná.
