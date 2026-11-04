// Další otázky k doplňkovým kurzům Zeměpisu (zem-p-*), přidáno k existujícím.
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "zem-p-hlavni-mesta-evropy-1": [
      [3, "Které je hlavní město Estonska?", "Tallinn", ["Riga", "Vilnius", "Helsinky"], "Tallinn je hlavní město Estonska."],
      [4, "Které je hlavní město Islandu?", "Reykjavík", ["Nuuk", "Tórshavn", "Oslo"], "Reykjavík je hlavní město Islandu."],
      [5, "Hlavním městem kterého státu je Dublin?", "Irsko", ["Island", "Velká Británie", "Portugalsko"], "Dublin je hlavní město Irska."],
    ],
    "zem-p-hlavni-mesta-evropy-2": [
      [3, "Které je hlavní město Černé Hory?", "Podgorica", ["Skopje", "Sarajevo", "Tirana"], "Podgorica je hlavní město Černé Hory."],
      [4, "Které je hlavní město Albánie?", "Tirana", ["Skopje", "Podgorica", "Sofie"], "Tirana je hlavní město Albánie."],
      [5, "Hlavním městem kterého státu je Vilnius?", "Litva", ["Lotyšsko", "Estonsko", "Polsko"], "Vilnius je hlavní město Litvy."],
    ],
    "zem-p-hlavni-mesta-sveta": [
      [3, "Které je hlavní město státu Indie?", "Nové Dillí", ["Bombaj", "Kalkata", "Bangalore"], "Hlavním městem Indie je Nové Dillí."],
      [4, "Které je hlavní město státu Indonésie?", "Jakarta", ["Surabaja", "Bandung", "Medan"], "Jakarta je hlavní město Indonésie."],
      [5, "Hlavním městem kterého státu je Nairobi?", "Keňa", ["Uganda", "Etiopie", "Tanzanie"], "Nairobi je hlavní město Keni."],
    ],
    "zem-p-nejvyssi-hory": [
      [4, "Čeho je nejvyšší horou Puncak Jaya?", "Austrálie a Oceánie", ["Asie", "Afrika", "Jižní Amerika"], "Puncak Jaya leží na Nové Guineji."],
      [5, "Čeho je nejvyšší horou Elbrus?", "Evropa", ["Asie", "Afrika", "Ural"], "Elbrus je nejvyšší hora Evropy."],
    ],
    "zem-p-reky-more": [
      [3, "Do kterého moře ústí řeka Ebro?", "Středozemní moře", ["Jaderské moře", "Tyrhénské moře", "Baltské moře"], "Ebro se vlévá do Středozemního moře ve Španělsku."],
      [4, "Do kterého moře ústí řeka Don?", "Azovské moře", ["Černé moře", "Kaspické moře", "Baltské moře"], "Don se vlévá do Azovského moře."],
      [5, "Do kterého moře ústí řeka Pečora?", "Barentsovo moře", ["Karské moře", "Bílé moře", "Baltské moře"], "Pečora se vlévá do Barentsova moře."],
    ],
  },
};
