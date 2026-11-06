# Plakáty na Instagram – Učíme se hrou

Šest plakátů ve formátu 4:5 (1080 × 1350 px), barvy a fonty převzaty z webu.

| Soubor | Téma |
|---|---|
| `01-uvod.png` | Úvod: učení, které baví, registrace zdarma |
| `02-predmety.png` | Vyber si předmět (kurzy od 1. do 9. třídy) |
| `03-hry.png` | Hry za body (Obrana galaxie, Labyrint duchů, Pád bloků…) |
| `04-unikovka.png` | Únikovka Laboratoř doktora Atoma |
| `05-jak-to-funguje.png` | Tři kroky: vyber kurz, procvičuj hrou, rosteš |
| `06-spolu.png` | Hrát společně (kvíz, závod, zlatá horečka, týmy) a žebříčky |

## Návrhy popisků

**01** – Učení, které tě baví. Kurzy, testy a hry na jednom místě. Registrace je zdarma → ucimesehrou.org
**02** – Vyber si předmět od 1. do 9. třídy. U každé odpovědi máš vysvětlení.
**03** – Za každou správnou odpověď získáš body. Která hra je tvoje oblíbená?
**04** – Zamčená laboratoř, hádanky z učiva a čas, který běží. Dokážeš uniknout dřív, než dojde čas?
**05** – Jak to funguje: vyber kurz, procvičuj hrou, rosteš. Založ si účet zdarma.
**06** – Zahraj si s třídou. Založ hru, kamarádi se připojí kódem. Kdo vyhraje?

Hashtagy (volitelné): #učímesehrou #procvičování #základka #vzdělávání #učenihrou

## Vygenerování PNG znovu

Zdrojem jsou HTML soubory, PNG se exportují skriptem (potřebný Playwright s Chromium):

```bash
node marketing/instagram/render.cjs
```

Sdílené styly jsou v `poster.css`, loga a obrázky v `assets/`.
