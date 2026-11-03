# Návrh: přepracování sekce Hustle ve hře Ekonomika

Stav: **implementováno** (větev `claude/serene-fermat-6tgwnp`). Čísla jsou výchozí a dají se doladit po hraní.

## 1. Co bylo špatně

- Hráč jen vložil kapitál a čekal. Výsledek určil los, rozhodování nebylo.
- Předčasný prodej byl lineární nabídka mínus 5 %, takže se skoro nikdy nevyplatil.
- Délky 1 až 45 minut byly dlouhé a pasivní.

## 2. Hlavní mechanika: tři kola rozhodnutí

- Hustl začíná vkladem a rizikem (1–100 %), jako dnes.
- Běží v **3 kolech**. Každé kolo se otevře po pevném intervalu (`gapSec`) od předchozího. Nerozhodnuté kolo čeká.
- V každém kole má hustl **vlastní situaci** (3 texty na hustl, v 4 jazycích). Hráč vybere jednu z voleb:
  - **Zajistit**: úzký rozsah, jistý výsledek.
  - **Vyvážit**: průměrný rozsah.
  - **Riskovat**: široký rozsah, možná velká výhra i ztráta.
  - **Příležitost** (jen někdy, 15 % kol): vyšší střed rozsahu, zřídka.
- Rozsah je vidět před volbou. Konkrétní výsledek se losuje až po ní.
- Střed rozsahů je rozložen tak, že součin středů tří kol dává střední hodnotu hustlu (`(min+max)/2`). Volba tedy mění jen rozptyl, ne průměr. Vyplatí se, když jsi v plusu, zajisti; když v mínusu, riskuj.
- Riziko na začátku zužuje nebo rozšiřuje rozsah všech voleb.
- Po posledním kole se výplata připíše a hustl se uzavře.

## 3. Funkce

- **Dokoupení během běhu**: přidá kapitál do hodnoty i do vkladu, zisk zůstává čistý.
- **Série úspěchů**: každé vítězné kolo v řadě zvedne střed o 2 %, nejvýš o 10 %. Prohra série ruší.
- **Odemykání**: Hustl Flipování domů se odemyká při Vzdělání 3, Startup při Vzdělání 8.
- **Náhodná příležitost**: viz výše, čtvrtá volba v kole.
- **Prodej teď** zrušen (nahrazen rozhodnutími).

## 4. Délky (kratší než dřív)

| Hustl | Interval kola | Celkem |
|---|---|---|
| Limonádový stánek | 20 s | 1 min |
| Reselling | 30 s | 1,5 min |
| Flipování aut | 60 s | 3 min |
| Flipování domů | 120 s | 6 min |
| Startup | 300 s | 15 min |

## 5. Technické poznámky

- Výsledek kola se počítá z uloženého semínka (`seed`) a deterministického hashe. Server i prohlížeč počítají stejně, server rozhoduje.
- **Migrace**: stará uložená hra s rozjetými hustly (bez kol) se při načtení vyplatí a hustl se odstraní. Vklad byl odečten už při startu, takže hráč nic neztratí.
- Testy: `src/lib/idle/economy.test.ts` (hustl: kola, volby, semínko a riziko, série a dokoupení, migrace).
