# Návrh: přepracování sekce Práce ve hře Ekonomika

Stav: **návrh ke schválení**. Kód zatím neměněn. Všechna čísla jsou výchozí a dají se doladit po hraní.

## 1. Co je dnes špatně (podle tvých odpovědí)

- **Pasivní čekání.** Plat běží sám, hráč s prací nic nedělá.
- **Práce se od sebe moc neliší.** Sedm povolání se liší hlavně platem a poplatkem.
- **Postup je nudný.** Stupně přibývají jen časem (každých 15 minut, max. 5), nic k nim nevede.
- **Chybí vazba na ostatní systémy.** Práce a Vzdělání (body z učení) spolu nesouvisí.

## 2. Hlavní mechanika: směny s rozhodováním

Směna je krátká sekvence rozhodnutí. Hráč spustí směnu a projde 3 situace. Každá situace nabídne 2–3 volby s různou váhou výkonu.

- **Spuštění:** tlačítko „Začít směnu“. Směna trvá 3 rozhodnutí, délka je reálný čas jen pro pořádek (bez čekání).
- **Výsledek směny:** součet výkonu (0–100 %) určí výplatu za směnu.
  - Výplata = základní plat za směnu × (0,7 až 1,3 podle výkonu).
- **Cooldown:** další směna jde spustit po 2 minutách (dá se doladit).
- **Pasivní plat zůstane jako základ, ale nižší.** Dnes je plat čistě pasivní. Navrhuji, aby 60 % platu běželo pasivně a 40 % tvořila směna. Hráč tak dostane důvod sledovat sekci.

Příklad situace (skladník): „Přišla dodávka a 3 palety jsou špatně označené.“
- Zkontrolovat všechny (výkon 100 %, pomalé)
- Přeřadit podle štítků (výkon 70 %)
- Přenechat kolegovi (výkon 30 %, ale zůstane čas na jinou práci)

Situace se budou lišit podle povolání. Každé povolání dostane vlastní sadu situací (aspoň 6–8 na povolání, tedy ~100 celkem, to je hlavní obsahová práce).

## 3. Postup: body z práce místo času

- Výkon ve směnách dává **body práce** (např. 10 bodů za dobrou směnu, 3 za slabou).
- Stupně se odemykají podle bodů: 1 → 0 b., 2 → 50 b., 3 → 150 b., 4 → 400 b., 5 → 900 b.
- Každý stupeň dál přidává +15 % platu (zachováno z dnešku).
- Při změně povolání se body **nepřenášejí**. Zůstanou jen u povolání, kde je hráč dobrý.

## 4. Vazba na Vzdělání

- **Vzdělání odemyká povolání.** Každé povolání má požadavek úrovně Vzdělání (`edu`).
- Dnešní `takeJob` kontroluje jen poplatek. Přibude kontrola `state.edu >= job.edu`.
- Body z učení a Vzdělání se dál kupují jako dnes, jen získají smysl.

## 5. Povolání (14 celkem)

Plat je za hodinu na stupni 1, před úpravou podle země a města. Poplatek je jednorázový.

| Povolání | Plat/h | Poplatek | Vzdělání | Stav |
|---|---:|---:|---:|---|
| Skladník | 40 | 0 | 0 | stávající |
| Farmář | 70 | 150 | 1 | **nové (návrh)** |
| Prodejce | 60 | 100 | 1 | stávající |
| Kuchař | 90 | 300 | 2 | stávající |
| Hasič | 120 | 500 | 4 | **nové (tvoje)** |
| Policista | 140 | 800 | 5 | stávající |
| Učitel | 180 | 1 200 | 6 | **nové (tvoje)** |
| Novinář | 200 | 1 500 | 6 | **nové (návrh)** |
| Zvěrolékař | 320 | 3 000 | 8 | stávající |
| Architekt | 400 | 4 000 | 9 | **nové (tvoje)** |
| Programátor | 480 | 6 000 | 10 | stávající |
| Pilot | 550 | 7 000 | 11 | **nové (návrh)** |
| Lékař | 600 | 9 000 | 12 | **nové (tvoje)** |
| Bankéř | 800 | 15 000 | 14 | stávající |

Každé nové povolání potřebuje překlady do všech čtyř jazyků (`src/i18n/economy.ts`: cs, en, de, ru) a vlastní situace do směn.

## 6. Zaměstnanci (najmu pro firmy)

- Zaměstnance najímáš do **svých firem** v záložce Firma.
- **Nábor:** jednorázově 2 hodiny výnosu dané firmy.
- **Mzda:** 60 Kč/h na stupni 1 (upravuje země a město jako plat).
- **Efekt:** každý zaměstnanec přidá firmě +6 % výnosu.
- **Limit:** max. 5 zaměstnanců na jednu firmu.
- Mzda se odečítá z čistého příjmu za hodinu, takže se zaměstnanci vyplatí jen u výnosnějších firem.

## 7. Technická část (pro vývoj)

- **Čistá logika** v `src/lib/idle/economy.ts`: situace směn, výpočet výkonu, body práce, požadavky povolání, zaměstnanci.
- **Server je autoritativní** v `src/app/api/stale-hry/ekonomika/route.ts`. Přibudou akce `startShift`, `chooseShift`, `hireEmployee`, `fireEmployee`. Klient posílá jen volbu, výsledek počítá server.
- **Nová pole ve stavu:** `shift`, `workPoints`, `employees` (podle firmy). `normalizeState` musí dát výchozí hodnoty, aby se staré uložené hry nerozbily.
- **Stávající `job.hours`** zůstane kvůli zpětné kompatibilitě. Stupeň se počítá z bodů, ne z hodin.
- **Testy:** rozšířit `src/lib/idle/economy.test.ts` (výkon směny, odemykání povolání, limit zaměstnanců, normalizace starého stavu).
- **Překlady:** cs, en, de, ru v `src/i18n/economy.ts`.

## 8. Otevřené otázky pro schválení

1. Má být směna 3 rozhodnutí, nebo raději 5 (delší, ale bohatší)?
2. Je 60 % pasivního platu správný poměr, nebo má být pasivní plat nižší (jen 30 %)?
3. Schvaluješ 14 povolání z tabulky, nebo chceš jiná čísla platu a vzdělání?
4. Nábor zaměstnance 2 hodiny výnosu firmy, mzda 60 Kč/h a +6 % výnosu: sedí, nebo to ladit jinak?

Po schválení navrhnu pořadí kroků (logika + testy → API → UI → překlady) a začnu implementací.
