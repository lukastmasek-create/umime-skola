# Animace úvodní stránky (Blender)

Animace jsou vyrenderované z Blenderu používaného jako Python modul (`bpy`) a uložené jako webp v `public/home/anim`.
Skripty jsou v `umime-art/blender`, snímky se renderují do `umime-art/out/<název>/` (složka je v `.gitignore`).

## Jak je znovu vyrenderovat

```bash
python3.13 -m venv .venv-art && .venv-art/bin/pip install bpy pillow numpy   # bpy 5.x potřebuje Python 3.13
cd umime-art/blender
../../.venv-art/bin/python planet.py            # --preview vyrenderuje jen pár snímků
../../.venv-art/bin/python liana.py
../../.venv-art/bin/python kvetina.py
../../.venv-art/bin/python motyl.py
../../.venv-art/bin/python vlajka.py
../../.venv-art/bin/python raketa.py
../../.venv-art/bin/python hory.py              # tři vrstvy hor
cd .. && ../.venv-art/bin/python encode.py      # složí webp do public/home/anim (volitelně jen: encode.py planeta liana)
```

Render běží na CPU (Cycles), celá sada trvá kolem deseti minut.

## Co kde je

| Soubor v `public/home/anim` | Co to je | Kde se používá |
|---|---|---|
| `planeta.webp` | otáčející se planeta s prstencem a obíhajícím měsícem (smyčka) | hrdina a dolní vesmír (`Planet`) |
| `raketa.webp` | raketa s plápolajícím plamenem | raketa letící po vlnovce (`Rocket`) |
| `liana-strip.webp` | pás 40 snímků, liána zarůstá roh | okraje nabídky předmětů (`Liana`, přehraje se při zobrazení) |
| `kvetina-strip.webp` | pás 24 snímků, vyklíčí a rozkvete květina | najetí na kartu předmětu (`.bloom`) |
| `motyl.webp` | motýl mávající křídly | letí přes část s přírodou (`NatureDecor`) |
| `hory-zadni/stredni/predni.webp` | tři vrstvy hor | paralaxa v části s horami (`MountainScene`) |
| `vlajka.webp` | vlající vlajka | stojí na nejvyšším vrcholu (`MountainScene`) |
| `*-still.webp` | první snímek | zobrazí se při zapnutém „omezit pohyb“ |

Elektřina v obvodech, sběrnice nad kartami, jiskra kolem karty, sníh, polární záře a běžec po cestě kroků jsou čisté SVG/CSS
(ostré v každé velikosti a reagují na kurzor); jejich styly jsou na konci `src/app/globals.css`.
Pásy snímků se přehrávají přes CSS `steps()`; při `prefers-reduced-motion` se nic nehýbe.
