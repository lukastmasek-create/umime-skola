# Kontrola autorských práv (orientační, není právní posudek)

- Herní názvy v UI jsou už odlišené od značek (Labyrint duchů, Pád bloků, Výstup na vrchol…). Anglický název „Minesweeper“ (ochranná známka Microsoftu) přejmenován na „Mine Finder“. Interní slugy v URL (`pac-man`, `tetris`) zůstávají, viditelné nejsou; zvážit přejmenování.
- Písma: Unbounded a Onest z Google Fonts (SIL OFL), bez omezení.
- Zvuky (`market-sfx.ts`, `game-fx.ts`) se generují v kódu, žádné cizí audio soubory v `public/`.
- Grafika vzniká v Blenderu / vlastními skripty (`umime-art/`). **Ověřit ručně:** původ všech obrázků v `public/` (zejména `home/`, `game-sprites/`, `pets/`) a že neobsahují AI výstupy s nejasnou licencí nebo cizí díla. Zdroje zatím nejsou nikde zdokumentované.
- Jména a ilustrace členů týmu a fotky: potřeba souhlasu osob.
- Patička má „© rok“; chybí jméno právního subjektu (provozovatel je jen „tým Učíme se hrou“). Doplnit při založení firmy/spolku.
- Studijní materiály (`src/lib/materials`) a otázky: pokud jsou přebrané z učebnic, hrozí problém; mají být vlastní formulace.
