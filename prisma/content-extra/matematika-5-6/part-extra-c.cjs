// Doplňující otázky (prisma/build-courses-sql.cjs). Řádek: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
module.exports = {
  extra: {
    "mat-objem-kvadr-krychle": [
      [      1, "Krychle má hranu 4 cm. Kolik cm je součet délek všech jejích hran?", "48 cm", ["16 cm","24 cm","64 cm"], "12 hran · 4 cm = 48 cm."],
    ],
    "mat-osova-soumernost": [
      [      1, "Kolik os souměrnosti má písmeno I?", "2", ["0","1","4"], "Písmeno I je souměrné podle svislé i vodorovné osy."],
      [      4, "Kolik os souměrnosti má písmeno H?", "2", ["0","1","4"], "H je souměrné podle svislé i vodorovné osy."],
    ],
  },
};
