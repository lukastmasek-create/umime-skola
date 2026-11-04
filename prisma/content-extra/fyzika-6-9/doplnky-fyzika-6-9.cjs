// Další otázky k Fyzice 6.–9. ročník (přidáno k existujícím, úroveň 1–5).
// Načítá se přes prisma/build-courses-sql.cjs (content-extra/<název souboru>/*.cjs).
module.exports = {
  extra: {
    "fyz-sila-pohyb": [
      [1, "Jak se značí rychlost?", "v", ["s", "t", "F"], "Rychlost se značí písmenem v."],
      [2, "Jak se nazývá síla, kterou podložka působí na těleso kolmo k sobě?", "normálová síla", ["třecí síla", "tíhová síla", "odstředivá síla"], "Normálová síla je kolmá ke stykové ploše."],
      [3, "Co je dráha tělesa?", "délka trajektorie, po které se těleso pohybuje", ["doba pohybu", "rychlost tělesa", "síla působící na těleso"], "Dráha se udává v metrech."],
      [4, "Těleso o hmotnosti 5 kg táhneme silou 20 N. Jaké je jeho zrychlení?", "4 m/s²", ["0,25 m/s²", "100 m/s²", "15 m/s²"], "a = F : m = 20 : 5 = 4 m/s²."],
      [5, "Který zákon říká, že síly akce a reakce mají stejnou velikost a opačný směr?", "třetí Newtonův zákon", ["první Newtonův zákon", "druhý Newtonův zákon", "zákon zachování energie"], "Akce a reakce působí na různá tělesa."],
    ],
    "fyz-elektrina": [
      [1, "Jak se značí elektrický náboj?", "Q", ["E", "I", "R"], "Elektrický náboj se značí Q."],
      [2, "V jaké jednotce se měří elektrický výkon?", "watt", ["volt", "ampér", "ohm"], "Výkon se měří ve wattech."],
      [3, "Dvě žárovky jsou zapojené paralelně. Jaké napětí je na každé z nich?", "stejné jako na zdroji", ["součet napětí obou", "nulové", "závisí jen na odporu"], "Při paralelním zapojení je napětí na všech větvích stejné."],
      [4, "Obvodem prochází proud 3 A při napětí 9 V. Jaký je výkon?", "27 W", ["3 W", "12 W", "0,33 W"], "P = U · I = 9 · 3 = 27 W."],
      [5, "Spotřebič odebere za hodinu energii 3,6 MJ. Jaký je jeho průměrný výkon?", "1 kW", ["10 kW", "100 W", "3,6 kW"], "3,6 · 10⁶ J : 3 600 s = 1 000 W."],
    ],
    "fyz-svetlo-zvuk": [
      [1, "Je obraz v rovinném zrcadle skutečný, nebo zdánlivý?", "zdánlivý", ["skutečný", "převrácený a skutečný", "promítnutý na stínítko"], "Obraz v rovinném zrcadle je zdánlivý (virtuální)."],
      [2, "Která barva viditelného světla má nejkratší vlnovou délku?", "fialová", ["červená", "zelená", "žlutá"], "Fialová světlo má nejkratší vlnovou délku z viditelné části spektra."],
      [3, "Jaká je přibližně rychlost světla ve vodě?", "225 000 km/s", ["300 000 km/s", "150 000 km/s", "340 km/s"], "Ve vodě je rychlost světla asi 3/4 rychlosti ve vakuu."],
      [4, "Jak dlouho trvá, než se ozvěna od překážky vzdálené 1 km vrátí k pozorovateli? (rychlost zvuku 340 m/s)", "asi 5,9 s", ["asi 2,9 s", "asi 0,3 s", "asi 11,8 s"], "Zvuk urazí 2 km, t = 2000 : 340 ≈ 5,9 s."],
      [5, "Proč vidíme po dešti na obloze duhu?", "rozkladem světla lomem a odrazem v kapkách", ["odrazem od mraků", "pohlcením světla ve vodě", "ohybem světla kolem kapek"], "Kapky rozkládají bílé slunce na barvy."],
    ],
    "fyz-teplo-skupenstvi": [
      [1, "Kolik stupňů Celsia odpovídá teplota 273,15 K?", "0 °C", ["100 °C", "−273 °C", "20 °C"], "0 °C odpovídá 273,15 K."],
      [2, "Co je teplo?", "energie předaná z tělesa teplejšího tělesu chladnějšímu", ["síla působící na těleso", "tlak plynu", "hmotnost tělesa"], "Teplo je přenos vnitřní energie."],
      [3, "Jak se nazývá přímá změna plynu v pevnou látku?", "desublimace", ["sublimace", "kondenzace", "tání"], "Desublimace je opakem sublimace."],
      [4, "Kolik tepla je potřeba k ohřátí 3 kg vody o 5 °C? (měrná tepelná kapacita vody 4 200 J/(kg·K))", "63 000 J", ["42 000 J", "21 000 J", "126 000 J"], "Q = m · c · Δt = 3 · 4 200 · 5 = 63 000 J."],
      [5, "Který z těchto materiálů nejlépe vede teplo?", "měď", ["dřevo", "polystyren", "vzduch"], "Kovy, například měď, jsou dobré tepelné vodiče."],
    ],
    "fyz-tlak-energie": [
      [1, "Jaká je jednotka síly v soustavě SI?", "newton", ["pascal", "joule", "watt"], "Síla se měří v newtonech."],
      [2, "Jaký tlak vyvolá síla 100 N na plochu 4 m²?", "25 Pa", ["400 Pa", "0,04 Pa", "250 Pa"], "p = F : S = 100 : 4 = 25 Pa."],
      [3, "Jak se nazývá přístroj na měření tlaku v uzavřené nádobě nebo potrubí?", "manometr", ["barometr", "teploměr", "hustoměr"], "Manometr měří přetlak plynu nebo kapaliny."],
      [4, "Jakou práci vykonáme, když zvedneme těleso o hmotnosti 2 kg do výšky 5 m? (g = 10 m/s²)", "100 J", ["10 J", "50 J", "1 000 J"], "W = F · s = 20 · 5 = 100 J."],
      [5, "Jaká je kinetická energie tělesa o hmotnosti 2 kg pohybujícího se rychlostí 3 m/s?", "9 J", ["6 J", "3 J", "18 J"], "E_k = ½ · m · v² = ½ · 2 · 9 = 9 J."],
    ],
  },
};
