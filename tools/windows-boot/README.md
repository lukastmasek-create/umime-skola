# Boot animace „Umíme školu“ pro Windows

Fullscreen animace (logo, hvězdy, loading bar), která se spustí hned po zapnutí
počítače a přihlášení, přes celou obrazovku, a po pár sekundách sama zmizí.

## Důležité – co to je a co ne

Skutečná **systémová** boot animace Windows (kroužek pod logem) je zapsaná ve
firmwaru/UEFI a v podepsaném `bootres.dll`. Její výměna vyžaduje vypnout
Secure Boot / patchovat systémové soubory, může rozbít bootování a každý
update ji přepíše – **tohle řešení to záměrně nedělá**. Místo toho se naše
animace pustí hned po startu systému jako kiosk přes celou obrazovku
a překryje načítání plochy. Pro uživatele to vypadá jako vlastní boot.

## Požadavky
- Windows 10 / 11
- Microsoft Edge (je součástí Windows)
- PowerShell (je součástí Windows)

## Instalace (krok za krokem)

1. Stáhni nebo naklonuj repozitář a otevři složku `tools\windows-boot`.
2. Klikni na Start, napiš **PowerShell**, pravým tlačítkem **Spustit jako správce**.
3. Přejdi do složky, např.:
   ```powershell
   cd C:\cesta\k\umime-skola\tools\windows-boot
   ```
4. Spusť instalaci (volitelně `-Duration` = délka v sekundách, výchozí 6):
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install.ps1 -Duration 8
   ```
5. Otestuj hned bez restartu:
   ```powershell
   Start-ScheduledTask UmimeBootAnimace
   ```
6. Restartuj počítač – animace naběhne po přihlášení.

Soubory se zkopírují do `C:\ProgramData\UmimeBoot` a vytvoří se naplánovaná
úloha **UmimeBootAnimace** (Plánovač úloh → Knihovna plánovače úloh).

## Aby běžela ještě před přihlášením (volitelné)
Zapni automatické přihlášení (`netplwiz` → odškrtni „Uživatelé musí zadat jméno
a heslo“). Animace se pak ukáže hned po zapnutí PC bez čekání na zadání hesla.

## Úpravy
- **Text, barvy, loga:** uprav `boot.html` (CSS proměnné nahoře), pak znovu spusť `install.ps1`.
- **Délka:** `install.ps1 -Duration 10`.
- **Náhled v prohlížeči:** otevři `boot.html` (přidej `?dur=8` pro jinou délku).

## Odinstalace
Jako správce:
```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall.ps1
```

## Řešení problémů
- *„running scripts is disabled“* → použij `-ExecutionPolicy Bypass`, jak je v příkazech.
- *Animace se nezavře* → otevři Správce úloh a ukonči `msedge.exe` s profilem `umime-boot-profile`, nebo spusť `Stop-ScheduledTask UmimeBootAnimace`.
- *Nespustí se* → zkontroluj, že existuje `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
