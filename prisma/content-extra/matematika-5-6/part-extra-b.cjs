// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-zlomky-pocitani": [
      [      1, "Jaký je součet zlomků 2/7 a 3/7?", "5/7", ["5/14","1/7","6/7"], "2 + 3 = 5, jmenovatel 7."],
      [      2, "Kolik je 3/4 − 1/2?", "1/4", ["2/4","1/2","3/8"], "3/4 − 2/4 = 1/4."],
    ],
    "mat-procenta-uvod": [
      [      1, "Kolik procent tvoří dvě poloviny celku?", "100 %", ["50 %","200 %","25 %"], "2 · 50 % = 100 %."],
      [      1, "Kolik procent tvoří tři čtvrtiny celku?", "75 %", ["25 %","34 %","60 %"], "3 · 25 % = 75 %."],
      [      1, "Kolik procent tvoří pět desetin celku?", "50 %", ["5 %","15 %","500 %"], "5 · 10 % = 50 %."],
      [      1, "Kolik procent tvoří jedna pětina celku?", "20 %", ["5 %","15 %","50 %"], "100 : 5 = 20."],
      [      4, "Kolik procent tvoří 7 z 35?", "20 %", ["7 %","35 %","25 %"], "7 : 35 = 0,2 = 20 %."],
      [      5, "Kolik procent tvoří 18 z 24?", "75 %", ["65 %","80 %","18 %"], "18 : 24 = 0,75 = 75 %."],
    ],
    "mat-zaporna-cisla": [
      [      1, "Které číslo leží na číselné ose nejvíc vlevo: −7, −2, 0?", "−7", ["−2","0","všechna stejně"], "Nejvíc vlevo je nejmenší číslo, −7."],
    ],
    "mat-objem-kvadr-krychle": [
      [      1, "Kolik hran vychází z jednoho vrcholu krychle?", "3", ["2","4","6"], "Z každého vrcholu krychle vychází 3 hrany."],
      [      1, "Krychle má hranu 1 cm. Jaký je její objem?", "1 cm³", ["3 cm³","6 cm³","1 cm²"], "1 · 1 · 1 = 1."],
    ],
    "mat-nasobeni-deleni-desetinnych": [
      [      1, "Kolik je 0,3 · 10?", "3", ["0,03","30","0,3"], "Posun desetinné čárky o jedno místo doprava."],
      [      1, "Kolik je 2,4 : 2?", "1,2", ["1,4","0,12","12"], "2,4 : 2 = 1,2."],
      [      1, "Kolik je 5 · 0,2?", "1", ["0,1","10","2"], "5 · 0,2 = 1."],
    ],
    "mat-trojuhelniky": [
      [      1, "Který trojúhelník má dvě stejně dlouhé strany?", "rovnoramenný", ["rovnostranný","pravoúhlý","tupoúhlý"], "Rovnoramenný má dvě ramena stejná."],
      [      1, "Kolik úhlů má trojúhelník?", "3", ["2","4","6"], "Trojúhelník má tři vnitřní úhly."],
    ],
    "mat-poradi-operaci": [
      [      1, "Kolik je 6 − 2 · 2?", "2", ["8","16","−2"], "2 · 2 = 4, 6 − 4 = 2."],
      [      2, "Kolik je (6 − 2) · 2 − 1?", "7", ["3","8","9"], "4 · 2 = 8, 8 − 1 = 7."],
    ],
    "mat-kraceni-rozsirovani": [
      [      1, "Zkrať zlomek 10/15.", "2/3", ["5/7","3/5","10/15"], "10 : 5 = 2, 15 : 5 = 3."],
      [      2, "Rozšiř zlomek 3/4 na jmenovatel 16.", "12/16", ["3/16","9/16","6/8"], "3 · 4 / 4 · 4 = 12/16."],
      [      3, "Zkrať zlomek 16/40.", "2/5", ["4/10","8/20","1/4"], "NSD(16, 40) = 8 → 2/5."],
      [      3, "Zkrať zlomek 21/56.", "3/8", ["7/8","2/7","21/56"], "NSD(21, 56) = 7 → 3/8."],
    ],
    "mat-cela-cisla": [
      [      2, "Kolik je −8 + 5?", "−3", ["3","−13","13"], "Od −8 se posuneme o 5 doprava: −3."],
    ],
    "mat-osova-soumernost": [
      [      1, "Kolik os souměrnosti má kružnice?", "nekonečně mnoho", ["1","2","4"], "Každá přímka procházející středem je osa."],
    ],
  },
};
