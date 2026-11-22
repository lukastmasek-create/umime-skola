// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-cisla-do-10": [
      [      2, "Kolik je 9 − 4 + 1?", "6", ["4","8","14"], "9 − 4 = 5, 5 + 1 = 6."],
    ],
    "mat-scitani-do-20": [
      [      1, "Kolik je 19 − 9?", "10", ["9","11","28"], "19 − 9 = 10."],
      [      1, "Kolik je 6 + 13?", "19", ["18","20","7"], "6 + 13 = 19."],
      [      2, "Kolik je 14 + 3?", "17", ["16","18","11"], "14 + 3 = 17."],
      [      2, "Kolik je 18 − 7?", "11", ["10","12","25"], "18 − 7 = 11."],
    ],
    "mat-geometrie-tvary": [
      [      1, "Který tvar má tři rohy?", "trojúhelník", ["čtverec","kruh","obdélník"], "Trojúhelník má tři rohy."],
      [      1, "Který tvar je kulatý jako kolo?", "kruh", ["čtverec","trojúhelník","hranol"], "Kruh je kulatý."],
      [      3, "Kolik vrcholů má trojboký hranol?", "6", ["3","5","9"], "Dva trojúhelníky po třech vrcholech."],
      [      3, "Kolik hran má trojboký hranol?", "9", ["6","12","3"], "3 hrany podstavy · 2 + 3 boční hrany = 9."],
    ],
    "mat-nasobilka": [
      [      1, "Kolik je 1 · 9?", "9", ["1","10","0"], "Jedna krát cokoli je to samé."],
      [      2, "Kolik je 5 · 8?", "40", ["35","45","30"], "5 · 8 = 40."],
    ],
    "mat-jednotky": [
      [      1, "Kolik kilogramů má 1 tuna?", "1000", ["100","10","10 000"], "1 t = 1000 kg."],
      [      1, "Kolik centimetrů má 3 metry?", "300", ["30","3","3000"], "3 · 100 = 300."],
      [      1, "Kolik dní má rok (bez přestupného)?", "365", ["360","300","366"], "Běžný rok má 365 dní."],
      [      1, "Kolik litrů má 3 litry?", "3", ["30","300","0,3"], "Tři litry jsou tři litry."],
      [      2, "Kolik sekund má 2 minuty?", "120", ["60","20","200"], "2 · 60 = 120."],
      [      3, "Kolik hodin je 2 dny?", "48", ["24","12","72"], "2 · 24 = 48."],
    ],
    "mat-delitelnost": [
      [      1, "Je číslo 20 dělitelné pěti?", "ano", ["ne","jen 2","nelze"], "20 : 5 = 4."],
    ],
  },
};
