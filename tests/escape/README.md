# Testy únikovek

## Rychlý test (bez prohlížeče, součást `npm test`)

`src/lib/escape/rooms.test.ts` projde všechny únikovky ve všech jazycích a ověří:

- strukturu místností (existující předměty, hádanky a místa, místa uvnitř scény, tři různé nápovědy),
- jednoznačnost hádanek (žádné duplicitní možnosti, dvojice ani kroky; index správné odpovědi),
- že každá místnost jde podle pravidel hry dohrát (prohledá všechny stavy: předměty, spojování, zámky)
  a že dveře nejdou otevřít dřív, než má hráč všechny poznámky s číslicemi kódu,
- že kód dveří má tolik číslic, kolik je poznámek, a je stejný ve všech jazycích,
- obtížnost 1–5, časový limit a karty na výpisu únikovek.

## Hraní v prohlížeči

`play.mjs` je bot, který únikovky dohraje přes opravdové UI (Playwright): kliká na místa, vybírá
a spojuje předměty v inventáři, řeší hádanky v okně a přechází do další místnosti. Na první místnosti
jednou schválně odpoví špatně, aby ověřil počítání chyb. Potřebuje běžící web.

```bash
npm run dev
node --experimental-strip-types --import ./tests/ts-resolve.mjs tests/escape/play.mjs http://localhost:3000
node --experimental-strip-types --import ./tests/ts-resolve.mjs tests/escape/play.mjs http://localhost:3000 pirate,lab cs,en
```

Playwright není v `package.json` (stejně jako u `tests/games`), použije se lokální nebo globální instalace.
Při selhání uloží snímek `tests/escape/fail-<jazyk>-<únikovka>.png`.
