// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-9-podobnost-goniometrie": [
      [      1, "Kolik je sin 90° − cos 0°?", "0", ["1","2","−1"], "1 − 1 = 0."],
    ],
    "mat-9-teleso-jehlan-kuzel-koule": [
      [      2, "Kolik stěn má trojboký hranol?", "5", ["6","3","4"], "2 trojúhelníkové podstavy + 3 boční stěny."],
    ],
    "mat-9-financni-matematika": [
      [      2, "Kolik Kč je 5 % z 600 Kč?", "30 Kč", ["3 Kč","300 Kč","60 Kč"], "600 · 0,05 = 30."],
      [      3, "Hodnota zboží 480 Kč po slevě 25 %. Kolik zaplatíš?", "360 Kč", ["120 Kč","455 Kč","240 Kč"], "480 · 0,75 = 360."],
      [      4, "Vklad 8 000 Kč, roční úrok 2,5 %, složený 2 roky. Konečný stav?", "8 405 Kč", ["8 400 Kč","8 500 Kč","8 200 Kč"], "8000 · 1,025² = 8000 · 1,050625 = 8405."],
      [      5, "Úvěr 100 000 Kč, roční úrok 6 %. Kolik Kč úroku za 2 roky (jednoduchý)?", "12 000 Kč", ["6 000 Kč","120 000 Kč","24 000 Kč"], "2 · 6000 = 12 000."],
    ],
    "mat-9-slovni-ulohy": [
      [      2, "Sešit stojí 35 Kč, pero 12 Kč. Kolik stojí 3 sešity a 2 pera?", "129 Kč", ["82 Kč","47 Kč","105 Kč"], "3 · 35 + 2 · 12 = 105 + 24 = 129."],
      [      3, "Ve třídě je 24 žáků, 3/8 jich hraje fotbal. Kolik jich hraje?", "9", ["8","12","3"], "24 : 8 · 3 = 9."],
      [      4, "Auto ujelo 180 km za 2 hodiny, pak 120 km za 1,5 hodiny. Průměrná rychlost celé cesty?", "85,7 km/h", ["80 km/h","60 km/h","90 km/h"], "300 km za 3,5 h = 85,7 km/h."],
      [      5, "Dva pracovníci udělají práci za 6 dní, první sám za 10 dní. Kolik dní by práci dělal druhý sám?", "15 dní", ["12 dní","20 dní","16 dní"], "1/6 − 1/10 = 1/15."],
      [      5, "Směs 40 % kyseliny o hmotnosti 500 g. Kolik gramů kyseliny?", "200 g", ["400 g","20 g","250 g"], "500 · 0,4 = 200."],
    ],
  },
};
