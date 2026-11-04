// Doplňující otázky k Fyzice (střední) — kurz Kinematika a dynamika měl úroveň 1 prázdnou.
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "fyz-s-kinematika-dynamika": [
      [1, "Jak se značí zrychlení?", "a", ["v", "s", "t"], "Zrychlení se značí písmenem a."],
      [1, "Jaká je jednotka rychlosti v soustavě SI?", "m/s", ["m/s²", "N", "kg"], "Rychlost se v SI udává v metrech za sekundu."],
      [1, "Jak se nazývá změna rychlosti za jednotku času?", "zrychlení", ["hybnost", "dráha", "frekvence"], "Zrychlení a = Δv : t."],
      [4, "Jak se změní dostředivé zrychlení při zdvojnásobení poloměru kružnice, je-li rychlost stejná?", "zmenší se na polovinu", ["zdvojnásobí se", "zůstane stejné", "zmenší se na čtvrtinu"], "a = v² : r, takže je nepřímo úměrné poloměru."],
      [5, "Jaká je hybnost tělesa o hmotnosti 3 kg letícího rychlostí 10 m/s?", "30 kg·m/s", ["3 kg·m/s", "13 kg·m/s", "0,3 kg·m/s"], "p = m · v = 3 · 10 = 30 kg·m/s."],
    ],
  },
};
