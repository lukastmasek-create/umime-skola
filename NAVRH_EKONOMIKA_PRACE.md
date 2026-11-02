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

Rozsah je potvrzen: 3 situace na směnu, každá s 2–3 volbami.

## 2a. Energie a odpočinek

- **Energie** má maximum 100. Každá situace stojí 10 energie, směna tedy 30.
- **Obnova:** 8 energie za hodinu reálného času, přepočet jako u ostatních hodinových hodnot (max. 15 minut mimo hru).
- **Směnu nejde spustit** pod 30 energie.
- **Nízká energie:** pod 40 energie klesá výkon o 10 %, pod 20 o 25 %. Hráč tak má důvod odpočívat.
- **Odpočinek** je volba „Vynechat směnu“, která energii doplní na 100 jednorázově, jednou za 6 hodin.

## 2b. Dovolená a nemoc

- **Dovolená:** hráč si vybere 1 den volna (24 h reálného času). Pasivní plat běží dál na 50 %, energie se doplní na 100. Max. 2 dny dovolené za 30 dní.
- **Nemoc:** náhodně 1 nebo 2 dny (hráč o ní neví předem). Pasivní plat je 0, energie se nedoplňuje. Nemoc nelze odmítnout.
- **Dovolená a nemoc** nesnižují body práce, takže postup nezaostane jen kvůli nim.

## 2c. Povýšení, prémie a vyjednání platu

- **Žádost o povýšení:** dostupná, když má hráč body na další stupeň, potřebné Vzdělání a aspoň 2 hodiny v pozici od posledního stupně.
  - Šance na schválení = 60 % + 0,3 × průměrný výkon posledních 5 směn (max. 90 %).
  - Zamítnutá žádost znamená 1 hodinu čekání na další pokus.
- **Vedoucí větev:** od stupně 4 se hráč může ucházet o místo vedoucího směny. Ta dává +5 % platu za každou směnu, kterou vede, ale spotřebuje o 10 energie navíc.
- **Týdenní prémie:** každých 24 h reálného času se vyplatí 10 % z průměrné výplaty za směnu za uplynulý den. Zvedá se výkonem, ne časem.
- **Vyjednání platu:** jednou za 7 dní. Šance na úspěch = 40 % + 0,5 × průměrný výkon posledních 5 směn − 10 % od stupně 4. Úspěch zvýší základní plat povolání o 5–10 %, trvale pro toto povolání.

## 2d. Rizika (mírná)

- **Výpověď:** přijde jen po 5 směnách za sebou s výkonem pod 30 %. Před ní je varování a jedna šance napravit výkon.
- **Krize v oboru:** náhodně na 7 dní snižuje plat povolání o 10 %. Hráč vidí varování předem.
- **Žádné pokuty** a žádné ztráty peněz, rizika jen ovlivňují plat a postup.

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

1. Je 60 % pasivního platu správný poměr, nebo má být pasivní plat nižší (jen 30 %)?
2. Schvaluješ 14 povolání z tabulky, nebo chceš jiná čísla platu a vzdělání?
3. Nábor zaměstnance 2 hodiny výnosu firmy, mzda 60 Kč/h a +6 % výnosu: sedí, nebo to ladit jinak?
4. Energie: 10 na situaci, obnova 8/h a práh 30 pro spuštění směny. Sedí, nebo mají být směny lehčí?
5. Povýšení: šance 60 % + 0,3 × výkon. Má být žádost jednodušší, nebo přísnější?

Po schválení navrhnu pořadí kroků (logika + testy → API → UI → překlady) a začnu implementací.
