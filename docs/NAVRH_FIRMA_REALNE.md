# Návrh: firma jako realný provoz

Stav: **kroky 1, 2, 2b, 3 a 4 hotové** (fáze, nájem a daň; zaměstnanci s rolemi; odbory; zásoby; varování a krach). Zbytek je v kroku 5 a dál.

## Postup implementace

1. Hotovo: fáze, nájem a daň, postup do další fáze.
2. Hotovo: zaměstnanci s rolemi (výrobce, prodavač, účetní, manažer), zaškolení po náboru, nemoc a odchody.
2b. Hotovo: odbory a spokojenost. Spokojenost klesá s podílem mezd na výnosu. Při nízké spokojenosti a aspoň 3 lidech může vypuknout stávka (výnos na polovinu). Dohoda s odbory (den mezd) stávky zastaví na 12 hodin.
3. Hotovo: zásoby a vstupy. Výroba spotřebuje dávky (1 h výnosu kusu), sklad roste s fází, bez zásob výnos klesne na 20 %, při nedostatku zdraží dávky o 50 %.
4. Hotovo: varování před krachem a krach firmy. Když peníze nestačí na provozní náklady (méně než 24 h čistého výdaje), přijde varování. Po 24 hodinách bez záchrany zkrachuje firma s nejhorším výsledkem i se zaměstnanci a zásobami.
5. Úvěr v bance a investor za podíl.
6. Holding a jeho financování.
7. Zahraniční expanze.
8. Burza (IPO, akcie, dividendy).

## Rozhodnutí z dotazníku

- Přidat první: **fáze růstu**, **provozní náklady**, **zaměstnance s rolemi**, **zásoby a vstupy**.
- Firma **může zkrachovat, ale až po varování** (hráč má čas zachránit ji).
- Financování: **úvěr v bance**, **investor za podíl** a **vlastní peníze** (všechny tři).
- Všechny obory najednou, se stejnými pravidly.

## 1. Fáze růstu

Firma začíná v garáži a roste. Hráč nemůže koupit další firmu hned, nejdřív musí dosáhnout fáze.

| Fáze | Co odemyká | Kapacita |
|---|---|---|
| 1. Garáž | start bez nájmu, vlastní práce | malá |
| 2. Dílna | nájem, první zaměstnanci | střední |
| 3. Sklad | zásoby ve větším objemu | velká |
| 4. Pobočka | více prodejen, vedoucí | největší |

Přechod mezi fázemi stojí peníze a čas (podmínky: obrat, počet zaměstnanců, vybavení). Každá fáze zvyšuje fixní náklady.

## 2. Vybavení

- Nábytek, stroje a počítače se kupují na konkrétní fázi.
- Každý kus se odepisuje a potřebuje údržbu.
- Bez vybavení firma nemůže prodávat ve vyšší fázi.

## 3. Zaměstnanci s rolemi

- Role: prodavač, výrobce, účetní, manažer. Každá má mzdu, odvody a limit kapacity.
- Nábor a zaškolení trvají (nový člověk je zpočátku méně výkonný).
- Neobsazená role brzdí výrobu nebo prodej.

## 4. Provozní náklady

- Nájem (od fáze 2), elektřina, voda, internet, pojištění.
- Běží pořád, i když firma nic nevyrábí.
- Roste s velikostí provozu.

## 5. Zásoby a vstupy

- Firma kupuje suroviny nebo zboží a prodává s marží.
- Když dojdou zásoby, výroba stojí.
- Sklad zabírá místo a stojí peníze.

## 6. Cash flow a krach

- Hlavní ukazatel je **hotovost**, ne zisk na papíře.
- Když hotovost nestačí na provozní náklady, přijde **varování** s lhůtou.
- Hráč může zachránit firmu (úvěr, prodej vybavení, propuštění) nebo ji nechat zkrachovat.

## 7. Financování

- **Úvěr v bance:** půjčka se splátkami a úroky. Splácí se i ve ztrátě.
- **Investor za podíl:** peníze výměnou za podíl na zisku. Podíl se nevrací.
- **Vlastní peníze:** bez dluhů, ale firma roste pomaleji.

## 8. Rozšíření (druhé kolo dotazníku)

- **Dvanáct fází** místo čtyř. Cesta od garáže přes pobočku a fabriku až dál (přesné názvy a podmínky doladíme).
- **Za fabrikou:** holding (více firem pod jednou společností), zahraniční expanze (každá země má jiné mzdy, daně a nájmy) a burza (akcie firmy kolísají podle výsledků).
- **Vybavení:** staré se dá prodat za zlomek ceny, vyžaduje servis (bez něj klesá výkon a roste riziko poruchy), a místo koupi jde pronajmout (levnější start, dražší dlouhodobě).
- **Zaměstnanci:** zkušenost a školení (nový je pomalejší, zkušený dražší), odchody a nemoc (lidé odcházejí nebo onemocní, firma musí nahradit), odbory a spokojenost (nespokojení zaměstnanci snižují výkon a mohou stávkovat).

## 9. Holding, expanze a burza (třetí kolo dotazníku)

- **Holding:** podíl na každé firmě (zisk teče do holdingu a odtud se vyplácí), společné financování (dluh jedné firmy může ohrozit ostatní) a daně a optimalizace (rozhodnutí hráče, za cenu složitějšího účetnictví).
- **Expanze:** Slovensko, Německo, USA, Velká Británie, Japonsko. Každá země má vlastní mzdy, nájmy a daně.
- **Burza:** IPO (vyvedení firmy na burzu a prodej akcií, ztráta kontroly nad podílem), obchodování akcií (cena kolísá podle výsledků a zpráv) a dividendy (pravidelný příjem z firem, které vyplácejí zisk).

## 10. Tempo a pořadí (čtvrté kolo dotazníku)

- **Tempo:** střední, hodiny a dny. Dvanáct fází se dá dohrát za několik dní reálného času.
- **Pořadí stavby:** nejdřív fáze a provozní náklady, pak zaměstnanci a zásoby, potom holding a expanze, nakonec burza.

## 11. Nájem a daň podle fáze (výchozí hodnoty)

- **Nájem** je podíl na výnosu firmy za hodinu, ale **nejméně 0,1 % ceny firmy za hodinu** (platí i při nečinnosti). Garáž nájem nemá.
- **Daň** je podíl na kladném zisku firmy za hodinu. Ztráta daň nemá.

| # | Fáze | Nájem (podíl výnosu) | Daň (podíl zisku) |
|---|---|---:|---:|
| 1 | Garáž | 0 % | 5 % |
| 2 | Dílna | 5 % | 10 % |
| 3 | Malý sklad | 7 % | 12 % |
| 4 | Prodejna | 8 % | 15 % |
| 5 | Pobočka | 9 % | 15 % |
| 6 | Velká pobočka | 10 % | 18 % |
| 7 | Výrobní hala | 11 % | 18 % |
| 8 | Logistické centrum | 12 % | 20 % |
| 9 | Fabrika | 13 % | 20 % |
| 10 | Velká fabrika | 14 % | 22 % |
| 11 | Zahraniční závod | 15 % | 25 % |
| 12 | Sídlo holdingu | 16 % | 25 % |

Názvy fází jsou návrh a dají se změnit. Čísla jsou výchozí a doladí se po hraní.

## 12. Otevřené otázky

Jsou v dotazníku v rozhovoru. Hlavně: počty fází, role a jejich mzdy, výše úroků a podílů, délka varování.
