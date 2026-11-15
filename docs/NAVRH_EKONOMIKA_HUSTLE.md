# Návrh: Hustle ve hře Ekonomika (v2)

Stav: návrh pro přepracování. Čísla jsou výchozí a dají se doladit po hraní.

## 1. Princip

Každý hustl je **projekt ve třech fázích**, jako skutečný podnikatelský pokus:

1. **Nákup / příprava** – rozhodneš, do čeho a jak kvalitně investovat.
2. **Provoz** – rozhodneš, jak to řídit (cena, oprava, inzerát, řízení rizika).
3. **Prodej / vyúčtování** – rozhodneš, jak a za kolik to prodáš.

Mezi fázemi uplyne čas (v reálném životě týdny nebo měsíce, ve hře sekundy až minuty). Fáze se otevře po čase a hráč ji rozhoduje, dokud neotevřená nebo nerozhodnutá nečeká.

Výsledek každé volby je **násobek hodnoty** v rozsahu (např. ×0,95–1,15), protože v reálu nevíš přesný výsledek předem. Vidíš jen rozsah. Konkrétní číslo se rozhodne až po volbě.

## 2. Co se děje v reálném životě a jak to hra zachycuje

### 2.1 Limonádový stánek
- **Realita:** ráno nakoupíš citrony, cukr a led. Stánek postavíš u parku, u školy nebo u náměstí. Tržby závisí hlavně na počasí: při vedru se prodává jako nic, za deště skoro nic. Led taje, ovoce se kazí. Večer uděláš vyúčtování.
- **Hra:** nákup surovin (levné ze skladu, čerstvé z trhu, zadarmo ze zahrady), cena a akce, konec dne (prodat všechno hned, stát do večera, přesunout se). Počasí je tržní faktor (0,9–1,1).
- **Náklady:** suroviny (vklad), průběžně led a obaly.
- **Provize:** žádná.
- **Riziko podvodu:** žádné.

### 2.2 Reselling
- **Realita:** na bazaru nebo v inzerátech hledáš zboží pod cenou (značkové boty, konzole). Koupíš, očistíš, vyfotíš a inzeruješ. Kupci píšou, smlouvají, někdy chtějí slevu za rychlou platbu. Podvodník pošle falešné potvrzení platby nebo zmizí. Platforma si bere provizi (~10 %).
- **Hra:** nákup (hromada 5 kusů s vadným kusem, jeden kus v dobrém stavu, nejistota podle fotek), inzerát (standardní, **ověřit kupce** s platbou předem, rychlá sleva), prodej (přijmout první nabídku, vyjednávat, počkat na lepšího kupce).
- **Náklady:** vklad, poplatek za ověření, průběžně skladování (zanedbatelné).
- **Provize:** 10 %.
- **Riziko podvodu:** ~10 % bez ochrany; ověřením kupce se snižuje na polovinu. Při podvodu je výsledek 0 (platba nepřišla).

### 2.3 Flipování aut
- **Realita:** koupíš auto z aukce nebo od soukromníka. Vady nejsou vidět (převodovka, koroze, nahraná nehoda). Prohlídka u mechanika stojí peníze, ale ušetří tě od nevýhodného koupě. Oprava zvyšuje cenu prodeje. Při prodeji inzerát, prohlídky, vyjednávání. Po prodeji se někdy ukáže vada a kupec žádá slevu.
- **Hra:** nákup (aukce bez prohlídky, soukromník se servisní knížkou, dovoz ze zahraničí), oprava (jen nejnutnější, prohlídka u mechanika, kompletní renovace), prodej (bazar hned, inzerát s prohlídkami, čekání na dobrou cenu).
- **Náklady:** vklad, oprava, pojištění a parkování (průběžně), poplatky.
- **Provize:** 5 % (inzerát, bazar).
- **Riziko:** skrytá vada se po prodeji ukáže v ~8 % případů a ztratíš 40 % hodnoty (sleva a reklamace). Prohlídka riziko poloviční.

### 2.4 Flipování domů
- **Realita:** kupuješ starší dům pod cenou, opravuješ a prodáváš. Většinou na hypotéku, takže úroky běží od prvního dne. Potřebuješ znalecký posudek (kolik dům opravdu stojí), stavební povolení, řemeslníky. Rekonstrukce se protahuje a přidává náklady. Prodej přes realitku bere provizi 3 %. Trh se mění (jaro je silnější než podzim).
- **Hra:** koupě (dům k rekonstrukci, byt v dobré lokalitě, pozemek na stavbu), rekonstrukce (kosmetika, posudek a oprava základů, přestavba půdy a koupelen), prodej (realitka hned, vlastní inzerát, čekání na jarní sezónu).
- **Náklady:** vklad, průběžně energie, daně a úroky (4 % vkladu za fázi).
- **Provize:** 3 %.
- **Riziko:** kupec odstoupí nebo se zhorší trh; ztráta 20 % hodnoty v ~5 % případů (snížené riziko s posudkem).
- **Odemknutí:** Vzdělání 3.

### 2.5 Startup
- **Realita:** založíš firmu, najdeš investora, vyvíjíš produkt a rosteš. Investor chce podíl (20–45 %). Růst stojí peníze (výplaty týmu, server, reklama). Většina startupů zkrachuje. Některé skončí prodejem velké firmě, pár se dostane na burzu.
- **Hra:** financování (vlastní úspory, malý investor za 20 %, velký za 45 %), produkt (rychlé MVP, kvalitní vývoj, marketingová kampaň), exit (prodej korporaci, IPO, dál bez exitu).
- **Náklady:** vklad, průběžně výplaty týmu (8 % vkladu za fázi).
- **Provize:** žádná, ale podíly investorů se odečítají ve fázi financování.
- **Riziko:** bankrot ~15 % (ztráta 100 %). Kvalitní vývoj riziko snižuje na polovinu.
- **Odemknutí:** Vzdělání 8.

### 2.6 Freelance zakázka
- **Realita:** bereš zakázky na platformě (grafika, text, web). Mzda závisí na velikosti zakázky a termínu. Klient často chce revize, někdy nezaplatí nebo se hádá o rozsah. Platforma si bere 10 %. Bez velkého vkladu, hraje se dovednost a spolehlivost.
- **Hra:** zakázka (malá na 2 hodiny, střední na týden, velká s pevným termínem), práce (běž na jistotu, přesčasy, zkratka z šablony), předání (klient schválí, revize zdarma, spor o platbu).
- **Náklady:** vybavení a software (vklad 1 000), revize (malé).
- **Provize:** 10 %.
- **Riziko:** klient nezaplatí ~12 % (ztráta 100 %). „Běž na jistotu“ riziko neutralizuje (polovina).

## 3. Společná pravidla

- **Vklad:** libovolná celá částka, nejvýš do hotovosti. Výchozí je cena hustlu.
- **Časy:** každé kolo se otevře po pevném intervalu od předchozího (limonáda 20 s, reselling 40 s, auta 90 s, domy 3 min, startup 5 min, freelance 1 min). Nerozhodnuté kolo čeká.
- **Příležitost:** v každé fázi je s pravděpodobností 15 % navíc volba „Příležitost“. Je rizikovější (širší rozsah), ale průměrně nepřináší víc.
- **Série:** každé vítězné kolo (násobek ≥ 1) zvýší rozsahy dalších voleb o 1 %, nejvýš o 5 %. Prohra série ruší.
- **Férovost:** všechny volby jedné fáze mají stejnou očekávanou hodnotu. Liší se cenou (dražší volba má vyšší střed) a rozptylem (riziková má širší rozsah). Výhodu nedává volba sama, ale to, kdy ji zvolíš: podle zkušenosti, série a ochrany.
- **Znalost trhu:** po každém dokončeném běhu hustlu přibyde jeden bod zkušenosti (max 5). Zkušenost:
  - ukáže v prodejní fázi, jestli trh jde nahoru, nebo dolů (spolehlivost 50 % + 10 % za bod, max 90 %),
  - snižuje riziko podvodu a bankrotu o 1 procentní bod za bod.
- **Dokoupení:** během běhu můžeš přidat kapitál; zvýší hodnotu i vklad, zisk zůstává čistý.
- **Trh:** každý běh má náhodný tržní koeficient z rozsahu hustlu (limonáda 0,9–1,1, startup 0,8–1,2). Projeví se v prodejní fázi.
- **Vyúčtování:** po poslední fázi se hodnota připíše do hotovosti. Zisk = hodnota − celkový vklad.
- **Migrace:** rozjeté hustly ze staré verze se vrátí na hotovost (jejich hodnota), nic se neztratí.

## 4. Technika (rámec)

- Výsledek se počítá z uloženého semínka (deterministické losování), server i prohlížeč počítají stejně, server rozhoduje.
- Čísla (rozsahy, náklady, provize, rizika) jsou v jedné tabulce v `src/lib/idle/economy.ts`.
- Texty jsou v `src/i18n/economy-hustle.ts` ve čtyřech jazycích.
- UI je v `src/components/idle/HustleTab.tsx`.
