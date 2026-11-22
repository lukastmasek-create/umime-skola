// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-p-kombinatorika": [
      [      1, "Kolik je 3!?", "6", ["3","9","12"], "3! = 3 · 2 · 1 = 6."],
      [      1, "Kolik je 2!?", "2", ["1","4","6"], "2! = 2 · 1 = 2."],
      [      2, "Kolik je 4!?", "24", ["12","20","36"], "4! = 24."],
      [      2, "Kolik je 5!/3!?", "20", ["10","30","60"], "120 : 6 = 20."],
      [      4, "Kolik je 6!?", "720", ["120","360","1440"], "6! = 720."],
      [      4, "Kolik různých trojic lze vybrat z 5 osob?", "10", ["6","15","20"], "5 · 4 · 3 : 6 = 10."],
      [      4, "Kolik různých trojic lze vybrat z 6 osob?", "20", ["15","30","40"], "6 · 5 · 4 : 6 = 20."],
      [      4, "Kolik je 5!/2!?", "60", ["30","120","20"], "120 : 2 = 60."],
      [      4, "Kolik je 4! · 2!?", "48", ["24","36","64"], "24 · 2 = 48."],
      [      5, "Kolik různých pořadí mají 7 osob?", "5040", ["720","4320","5400"], "7! = 5040."],
      [      5, "Kolik různých dvojic lze vybrat z 10 osob?", "45", ["40","50","90"], "10 · 9 : 2 = 45."],
      [      5, "Kolik různých trojic lze vybrat z 8 osob?", "56", ["48","64","112"], "8 · 7 · 6 : 6 = 56."],
      [      5, "Kolik různých čtveřic lze vybrat z 6 osob?", "15", ["10","20","24"], "C(6,4) = C(6,2) = 15."],
      [      5, "Kolik různých čtveřic lze vybrat z 5 osob?", "5", ["4","10","20"], "C(5,4) = 5."],
      [      5, "Kolik je 10!/8!?", "90", ["80","100","720"], "10 · 9 = 90."],
      [      5, "Kolik je 6!/4!?", "30", ["24","36","120"], "6 · 5 = 30."],
      [      5, "Kolik je 9!/7!?", "72", ["63","81","504"], "9 · 8 = 72."],
    ],
    "mat-p-kruh-valec": [
      [      2, "Kruh má poloměr 7 cm (π ≈ 3). Jaký je jeho obsah?", "147 cm²", ["140 cm²","150 cm²","128 cm²"], "3 · 7² = 147."],
      [      2, "Kruh má poloměr 8 cm (π ≈ 3). Jaký je jeho obsah?", "192 cm²", ["180 cm²","196 cm²","160 cm²"], "3 · 8² = 192."],
      [      2, "Kruh má poloměr 5 cm (π ≈ 3). Jaký je jeho obsah?", "75 cm²", ["70 cm²","80 cm²","65 cm²"], "3 · 5² = 75."],
      [      2, "Kruh má poloměr 6 cm (π ≈ 3). Jaký je jeho obsah?", "108 cm²", ["100 cm²","118 cm²","96 cm²"], "3 · 6² = 108."],
      [      2, "Kruh má poloměr 10 cm (π ≈ 3). Jaký je jeho obsah?", "300 cm²", ["290 cm²","310 cm²","330 cm²"], "3 · 10² = 300."],
    ],
  },
};
