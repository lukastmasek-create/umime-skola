// Doplňující otázky k doplňkovým kurzům Zeměpisu (aby měla každá úroveň 1–5 alespoň 3 otázky).
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "zem-p-reky-more": [
      [2, "Do kterého moře ústí řeka Dněpr?", "Černé moře", ["Baltské moře", "Kaspické moře", "Severní moře"], "Dněpr → Černé moře."],
      [4, "Do kterého moře ústí řeka Ural?", "Kaspické moře", ["Černé moře", "Baltské moře", "Severní moře"], "Ural → Kaspické moře."],
      [5, "Do kterého moře ústí řeka Jordán?", "Mrtvé moře", ["Rudé moře", "Kaspické moře", "Středozemní moře"], "Jordán → Mrtvé moře."],
    ],
    "zem-p-vlajky-a-statni-symboly": [
      [2, "Na kterém světadílu leží stát Maroko?", "Afrika", ["Asie", "Evropa", "Jižní Amerika"], "Maroko → Afrika."],
      [4, "Na kterém světadílu leží stát Island?", "Evropa", ["Severní Amerika", "Asie", "Afrika"], "Island → Evropa."],
      [5, "Na kterém světadílu leží stát Madagaskar?", "Afrika", ["Asie", "Austrálie a Oceánie", "Jižní Amerika"], "Madagaskar → Afrika."],
    ],
  },
};
