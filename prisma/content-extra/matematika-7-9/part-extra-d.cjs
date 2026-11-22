// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-7-procenta-urok": [
      [      1, "Kolik je 20 % ze 35?", "7", ["35","15","17,5"], "35 : 5 = 7."],
      [      1, "Kolik je 30 % ze 50?", "15", ["30","5","20"], "50 · 0,3 = 15."],
    ],
    "mat-7-pomer-umernost": [
      [      1, "Kolik je poměr 5 : 10 zkrácený na nejjednodušší tvar?", "1 : 2", ["2 : 1","5 : 10","1 : 5"], "Dělíme pěti."],
    ],
    "mat-7-trojuhelniky-konstrukce": [
      [      1, "Kolik stupňů má součet vnitřních úhlů trojúhelníku?", "180°", ["90°","270°","360°"], "Trojúhelník má 180°."],
    ],
    "mat-7-hranoly": [
      [      4, "Kvádr má rozměry 2, 3 a 6 cm. Jaký je jeho povrch?", "72 cm²", ["36 cm²","66 cm²","12 cm²"], "2(6 + 12 + 18) = 72."],
    ],
    "mat-7-statistika-data": [
      [      1, "Které číslo je nejmenší v souboru 8, 3, 11?", "3", ["8","11","0"], "3 je nejmenší."],
      [      2, "Kolik je modus souboru 4, 4, 5, 6?", "4", ["5","6","19"], "Číslo 4 se vyskytuje dvakrát."],
    ],
    "mat-9-podobnost-goniometrie": [
      [      1, "Kolik je sin 45°?", "√2/2", ["1/2","1","√3/2"], "Sinus 45° je √2/2."],
      [      1, "Kolik je cos 30°?", "√3/2", ["1/2","1","√2/2"], "Kosinus 30° je √3/2."],
      [      2, "Obsah podobných trojúhelníků s koeficientem 2 je větší kolikrát?", "4krát", ["2krát","8krát","3krát"], "Obsah roste s druhou mocninou koeficientu."],
      [      3, "Kolik je sin 60° · cos 30°?", "3/4", ["1/2","√3/2","1"], "(√3/2)(√3/2) = 3/4."],
      [      5, "Kolik je tg α, když cos α = 4/5 a α je ostrý?", "3/4", ["4/3","5/3","3/5"], "sin = 3/5, tg = (3/5)/(4/5) = 3/4."],
    ],
    "mat-9-teleso-jehlan-kuzel-koule": [
      [      1, "Kolik hran má jehlan se čtvercovou podstavou?", "8", ["4","5","6"], "4 hrany podstavy + 4 boční hrany."],
      [      1, "Má koule hrany?", "ne", ["ano","jen jedna","ano, dvě"], "Koule je těleso bez hran."],
      [      3, "Objem krychle s hranou 2 cm je?", "8 cm³", ["4 cm³","6 cm³","16 cm³"], "2³ = 8."],
      [      4, "Válec: r = 2 cm, v = 5 cm (π ≈ 3). Objem?", "60 cm³", ["30 cm³","40 cm³","120 cm³"], "3 · 4 · 5 = 60."],
      [      4, "Krychle má povrch 24 cm². Jaký je objem?", "8 cm³", ["24 cm³","16 cm³","4 cm³"], "Hrana 2 (6 · 4 = 24), objem 8."],
      [      5, "Kulová plocha s r = 5 cm (π ≈ 3). Povrch?", "300 cm²", ["150 cm²","75 cm²","600 cm²"], "4 · 3 · 25 = 300."],
      [      5, "Kužel s r = 3 cm a v = 8 cm (π ≈ 3). Objem?", "72 cm³", ["24 cm³","48 cm³","96 cm³"], "1/3 · 3 · 9 · 8 = 72."],
    ],
    "mat-9-financni-matematika": [
      [      1, "Kolik je 25 % z 400 Kč?", "100 Kč", ["25 Kč","400 Kč","50 Kč"], "400 : 4 = 100."],
      [      1, "Kolik je 10 % z 1 500 Kč?", "150 Kč", ["15 Kč","1 500 Kč","1 350 Kč"], "1500 · 0,1 = 150."],
      [      2, "Úrok 3 % z 2 000 Kč za rok?", "60 Kč", ["6 Kč","600 Kč","200 Kč"], "2000 · 0,03 = 60."],
      [      3, "Zboží za 750 Kč se zdražilo o 8 %. Nová cena?", "810 Kč", ["758 Kč","742 Kč","600 Kč"], "750 · 1,08 = 810."],
      [      4, "Vklad 5 000 Kč, roční úrok 4 %, složený 1 rok. Kolik bude?", "5 200 Kč", ["5 400 Kč","5 040 Kč","5 020 Kč"], "5000 · 1,04 = 5200."],
      [      5, "Složený úrok 6 % ročně z 1 000 Kč po 3 letech (zaokrouhleně na celé Kč)?", "1 191 Kč", ["1 180 Kč","1 240 Kč","1 060 Kč"], "1,06³ · 1000 ≈ 1191."],
    ],
    "mat-9-pravdepodobnost-kombinatorika": [
      [      1, "Kolik je 3! ?", "6", ["3","9","12"], "3 · 2 · 1 = 6."],
      [      1, "Kolik je pravděpodobnost jevu jistého?", "1", ["0","1/2","100"], "Jisté se stane vždy, p = 1."],
      [      2, "Kolik je pravděpodobnost jevu nemožného?", "0", ["1","1/2","−1"], "Nemožný jev má p = 0."],
      [      2, "Kolik různých pořadí má 5 osob?", "120", ["60","24","5"], "5! = 120."],
      [      4, "Kolik je C(6, 2)?", "15", ["12","30","6"], "6 · 5 / 2 = 15."],
      [      5, "Kolik různých kombinací lze z 5 bodů vybrat trojice?", "10", ["15","20","60"], "C(5, 3) = 10."],
    ],
    "mat-9-nerovnice": [
      [      1, "Řeš: x − 6 > 0.", "x > 6", ["x < 6","x > −6","x < −6"], "Přičteme 6."],
      [      2, "Řeš: −2x ≤ 10.", "x ≥ −5", ["x ≤ −5","x ≥ 5","x ≤ 5"], "Při dělení záporným číslem se obrátí znaménko."],
      [      3, "Řeš: x/2 + 1 ≥ 4.", "x ≥ 6", ["x ≤ 6","x ≥ 3","x ≥ 10"], "x/2 ≥ 3, x ≥ 6."],
      [      4, "Řeš: 3(x + 2) < 2x + 9.", "x < 3", ["x > 3","x < 1","x > 1"], "3x + 6 < 2x + 9, x < 3."],
      [      5, "Řeš: x² < 9 (pro x > 0).", "0 < x < 3", ["x < 3","x > 3","x < 9"], "Pro kladná x je x < 3."],
    ],
    "mat-9-slovni-ulohy": [
      [      1, "Sešit stojí 25 Kč. Kolik stojí 4 sešity?", "100 Kč", ["125 Kč","50 Kč","29 Kč"], "4 · 25 = 100."],
      [      1, "Jablko váží 150 g. Kolik gramů váží 6 jablek?", "900 g", ["756 g","150 g","1500 g"], "6 · 150 = 900."],
      [      2, "Obdélník má obsah 60 cm² a délku 12 cm. Obvod?", "34 cm", ["72 cm","17 cm","24 cm"], "Šířka 5, obvod 2 · (12 + 5) = 34."],
      [      3, "Rozdíl dvou čísel je 7, jejich součet 19. Větší je?", "13", ["12","6","26"], "(19 + 7) : 2 = 13."],
      [      4, "Pěšák jde 5 km/h, cyklista 15 km/h. Cyklista vyjel 1 hodinu po pěšákovi. Za kolik hodin ho dohoní?", "0,5 h", ["1 h","2 h","0,25 h"], "5t + 5 = 15t, 10t = 5, t = 0,5."],
    ],
  },
};
