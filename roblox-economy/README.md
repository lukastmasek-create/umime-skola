# Ekonomika – Roblox Studio port

Samostatná Roblox hra (2D dashboard v `ScreenGui`, žádná mapa ani avatar) podle hry Ekonomika z ucimesehrou.org.
Zdroj (jen čtení): `src/lib/idle/economy.ts`, `src/app/api/stale-hry/ekonomika/route.ts`, `EconomyGame.tsx`.
Texty jsou česky a leží v jednom souboru `src/shared/Strings.lua`.

## Spuštění ve Studiu (stručně)
**Rojo:** `cd roblox-economy && rojo serve`, ve Studiu Plugins → Rojo → Connect.
**Bez Rojo:** vlož `install.lua` do `Script` v ServerStorage → Save as Local Plugin (spustí se při načtení pluginu), pak plugin smaž.
(Příkazový řádek Studia často ignoruje velké vložení.) Znovu vygeneruj: `python3 tools/build_installer.py`.
Pak: Game Settings → Security → *Studio Access to API Services*, a **Publish to Roblox** (jinak DataStore nefunguje a hra se neukládá, ale běží).
Ve Studiu jsou v horní liště tlačítka **1–4** pro náhled zařízení (jen lokální náhled, server stále ověřuje skutečný tier).

## Struktura
| Soubor | Kam | Role |
|---|---|---|
| `shared/Config.lua` | ReplicatedStorage.Economy | všechna data, **tabulka `DEVICES`** (ceny, podmínky, přínosy) |
| `shared/Logic.lua` | totéž | čistá simulace (porovnaná 1:1 s `economy.ts`) |
| `shared/Strings.lua` | totéž | veškerý český text |
| `server/EconomyService/init.server.lua` + `ServerCore.lua` | ServerScriptService | DataStore (verzovaný, retry), remoty, žebříček; jádro bez Roblox závislostí |
| `client/EconomyUI/*` | StarterPlayerScripts | `Theme`, `Widgets`, `Screens`, shell (`init.client.lua`) |

## Mapa původních akcí → obrazovky → server
| Web (`route.ts`) | Obrazovka | Server akce |
|---|---|---|
| create, restart | Vytvoření postavy, Přehled | `createCharacter`, `restart` |
| takeJob, quitJob, startShift, chooseShift, rest, startVacation, requestPromotion, negotiateRaise, setLead, investEdu | Práce | stejnojmenné |
| buyNeed, buyBoost | Potřeby | stejnojmenné |
| buyCompany, sellCompany, upgradeCompany, hireStaff, buyStock, setCompanySetting, runCampaign, fundResponse, signContract, researchCompany, unionDeal, upgradePhase | Firma | stejnojmenné |
| buyAsset, sellAsset, placeOrder, cancelOrder, arbitrage | Investice | stejnojmenné |
| startHustle, topUpHustle, decideHustle | Hustle | stejnojmenné |
| (nové) | Zařízení, Srovnání, Historie, panely | `buyDevice`, `toggleWatch`, `saveView`, `deleteView`, `setPins` |

## Zařízení (jedna tabulka v `Config.DEVICES`)
Kupují se postupně. Mění přehlednost a rychlost, **ne** příjem; všechny ekonomické akce jsou dostupné všude.
| Tier | Cena | Podmínky | Přínosy |
|---|---|---|---|
| Telefon | 0 | – | jeden panel, spodní navigace, vše hratelné |
| iPad | 600 | 3 směny | rozdělený pohled (hlavní obrazovka + boční panely), sledované investice (4), nadcházející výdaje a aktivní projekty |
| Laptop | 6 000 | 10 směn, Vzdělání 3, jmění 5 000 | + srovnávací pracovna (až 3 položky), uložené pohledy (4), lišta rychlých akcí |
| PC | 40 000 | Vzdělání 8, 1 firma, jmění 50 000 | + připnuté karty (6, nastavitelné), hluboká historie jmění, panel upozornění |
Ladění: u chudé/střední rodiny ≈ 140–200 kr / reálnou hodinu čistého přebytku, takže iPad ≈ 3–4 h, Laptop a PC soutěží s prvními firmami a potřebami.
Na úzké obrazovce se boční panely PC/iPadu změní v záložky; na telefonu jsou Srovnání a Historie pod „Víc“.
Nákup je jedna synchronní transakce na serveru (`Logic.buyDevice`) s idempotentním `requestId` (opakování vrátí uložený výsledek, nic se neúčtuje dvakrát). Směna, projekty a příkazy se nákupem nemění.

## Vizuální systém
Finální vzhled je přetvořen podle poslední reference (NexusPlay): fialovo-černý přechod, růžová záře u hlavní karty, mintová pilulková tlačítka,
horní lišta s podtrženou záložkou, hlavní karta „Doporučený krok“, boční panel „Dění v ekonomice“, řada dlaždic „Pokračuj“ s tenkým ukazatelem.
Mapa referencí (obrázky z promptu):
1. **Černé inkoustové menu (Controls)** → červená/růžová jako stav výběru a varování, kondenzované verzálky pro nadpisy, „barcode“ štítek v logu.
2. **Funko Fusion – nastavení** → svislé záložky s ikonami a zvýrazněný řádek (přeneseno do zvýrazněných řádků a výběru), hodnoty se stepery (±) u firem.
3. **Retro okna (hearts, Start/Stop)** → dialogy s titulkem a tlačítkem ×, potvrzovací okna.
4. **Retro OS okna (Critical error, progress)** → potvrzení nákupu, ukazatele průběhu.
5. **Sci‑fi herní UI kit (Completed/Shop)** → karty s obrysem, položky obchodu s cenou, hodnotové „pilulky“, zamčené položky s důvodem.
6. **NexusPlay** → finální kostra domovské obrazovky, tlačítka, dlaždice a záložky.
Jedna paleta (`Theme.color`), písma (Arvo / Code / BuilderSans / RobotoMono), škála 12/14/16/22/30, jedna sada tlačítek a stavů (hover, stisk, zamčeno s důvodem).

## Ověření
`cd tests && npm i && npm test` (Luau VM přes WASM):
- **91/91** hodnot shodných s `economy.ts` (ceny, sazby, směny, settle, hustly, události, startupy),
- integrační sada (migrace, zařízení, příkazy, firmy, hustly, restart),
- **UI smoke**: skutečné moduly klienta nad mockem Roblox API a skutečným serverovým jádrem: celá první řada (postava → práce → potřeby → směna → iPad), všechny záložky × 4 tiery × 3 šířky,
- **server smoke**: DataStore chyby, nečitelný profil nepřepíše uložení, nákup zařízení přežije opětovné připojení a opakované požadavky účtují jednou.
Náhled stejného profilu na všech tierech: `docs/preview/*.png` (`npm run preview`). **Je to HTML emulace skutečného stromu widgetů, ne render Roblox enginu.**

## Kontrolní seznam
Hotovo a ověřeno testy: postava, práce a směny (3 rozhodnutí, energie, body, povýšení, plat, vedoucí, dovolená, krize), potřeby a boosty, firmy (role, sklad, nastavení, fáze, nájem/daň, události, odbory, konkurent, kontrakty, výzkum, kampaň, krizový fond, krach s varováním),
investice (ceny, zprávy, startupy, limitní/stop příkazy, arbitráž), hustly (3 kola, příležitost, top‑up), offline limit 15 min, restart s rekordem, 4 tiery, uložení.
**Neověřeno / mezery:** nespuštěno v Roblox Studiu (žádný Studio ve sandboxu), vzhled písem a glyfů (⚠ ★ ⚙ ✓) závisí na enginu; hexagonová „dlaždice“ je zaoblený čtverec.
**Záměrné odchylky:** žádné zrychlení času 1–16×, žádná výměna bodů za peníze, záložka Banka (v webu jen ukázka), bonus za učení z kvízů (nahrazen body ze směn),
žebříček přes OrderedDataStore, úspory „rychlých akcí“ jsou pevná sada (ne podle četnosti), chybí zámek relace mezi servery (ProfileService), jen jedna lokalizace (cs).
