module.exports = {
  subject: "FYZIKA",
  courses: [
    { slug: "fyz-elektricky-obvod", title: "Elektrický obvod", desc: "Napětí, proud, odpor a jednoduché elektrické obvody.", section: "Elektřina", grade: 8, qs: [
      [1,"Jaká je jednotka elektrického proudu?","ampér",["volt","ohm","watt"],"Elektrický proud měříme v ampérech."],
      [1,"Jaká je jednotka napětí?","volt",["ampér","ohm","joule"],"Napětí měříme ve voltech."],
      [2,"Co potřebuje jednoduchý obvod, aby jím procházel proud?","uzavřený obvod",["otevřený obvod","jen vodič","jen žárovku"],"Proud prochází pouze uzavřenou cestou."],
      [2,"Který materiál je dobrý vodič?","měď",["guma","sklo","plast"],"Měď vede elektrický proud velmi dobře."],
      [3,"Jaká je jednotka odporu?","ohm",["volt","ampér","watt"],"Elektrický odpor měříme v ohmech."],
      [3,"Co se stane s proudem při zvětšení odporu a stejném napětí?","zmenší se",["zvětší se","nezmění se vždy na nulu","změní směr"],"Podle Ohmova zákona I = U/R."],
      [4,"Jak zapojíme ampérmetr?","sériově",["paralelně vždy","mimo obvod","ke zdroji bez vodičů"],"Ampérmetr měří proud procházející větví."],
      [4,"Jak zapojíme voltmetr?","paralelně",["sériově","do vypínače místo vodiče","mimo obvod"],"Voltmetr měří napětí mezi dvěma body."],
      [5,"Jaký výkon má spotřebič při napětí 12 V a proudu 2 A?","24 W",["6 W","14 W","120 W"],"Výkon P = U · I = 12 · 2 = 24 W."],
      [5,"Proč se používá pojistka?","chrání obvod před velkým proudem",["zvyšuje napětí","vyrábí energii","mění proud na světlo"],"Pojistka obvod při nadproudu přeruší."],
    ] },
    { slug: "fyz-teplo-a-teplota", title: "Teplo a teplota", desc: "Teplota, přenos tepla, skupenské změny a tepelná roztažnost.", section: "Energie", grade: 7, qs: [
      [1,"Čím měříme teplotu?","teploměrem",["barometrem","voltmetrem","siloměrem"],"Teploměr měří teplotu."],
      [1,"Jaká je jednotka teploty v soustavě SI?","kelvin",["stupeň Celsia","joule","watt"],"Základní jednotkou teploty je kelvin."],
      [2,"Kam proudí teplo samovolně?","z teplejšího tělesa na chladnější",["z chladnějšího na teplejší","nikam","jen ve vakuu"],"Teplo se přenáší z vyšší teploty na nižší."],
      [2,"Který způsob přenosu tepla probíhá ve vakuu?","záření",["proudění","vedení","var"],"Tepelné záření nepotřebuje látkové prostředí."],
      [3,"Při jaké teplotě tuhne voda za běžného tlaku?","0 °C",["-100 °C","50 °C","100 °C"],"Voda tuhne při 0 °C."],
      [3,"Při jaké teplotě vře voda za běžného tlaku?","100 °C",["0 °C","50 °C","212 °C"],"Voda vře při 100 °C."],
      [4,"Co se obvykle stane s kovem při zahřátí?","roztáhne se",["vždy se smrští","zmizí","ztratí hmotnost na polovinu"],"Částice se více rozkmitají a kov se roztáhne."],
      [4,"Co je skupenské teplo?","energie potřebná ke změně skupenství",["teplota vzduchu","rychlost částic","hmotnost vody"],"Při změně skupenství se dodává nebo odebírá energie."],
      [5,"Proč mají domy izolaci?","omezuje přenos tepla",["zvyšuje spotřebu","vyrábí elektřinu","ochlazuje jen střechu"],"Izolace snižuje tepelné ztráty."],
      [5,"Který materiál je dobrý tepelný izolant?","polystyren",["měď","hliník","železo"],"Polystyren obsahuje vzduch a špatně vede teplo."],
    ] },
  ],
};
