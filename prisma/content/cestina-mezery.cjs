// Čeština – doplněné mezery na základní škole. Řádek otázky: [obtížnost 1-5, otázka, správná, [3 špatné], vysvětlení]
//
// Pravopisné otázky se skládají ze seznamů slov. Špatné možnosti vznikají záměnou ú/ů, vynecháním
// diakritiky a zápisem „ou“, takže správná je vždycky jediná.
const spelling = (rows) =>
  rows.map(([d, clue, word, why]) => {
    const sym = word.includes("ú") ? "ú" : "ů";
    const other = sym === "ú" ? "ů" : "ú";
    return [
      d,
      `Jak se správně píše slovo, které znamená: ${clue}?`,
      word,
      [word.replace(sym, other), word.replace(sym, "u"), word.replace(sym, "ou")],
      why,
    ];
  });

// Otázky na předpony: správné slovo i špatné možnosti jsou skutečná slova s jinou předponou.
const prefixQuestions = (prompts, right, others, prefix, why) =>
  right.map((word, i) => {
    const wrong = others.slice(i, i + 3);
    return [3, prompts[i % prompts.length], word, wrong.length === 3 ? wrong : others.slice(0, 3), `${why} (${word})`.replace("{p}", prefix)];
  });

const VZ = ["vzlétnout", "vzbudit", "vzpomenout", "vzdálenost", "vzduch"];
const S = ["sundat", "sbírat", "spojit", "svázat", "sjet"];
const Z = ["zmenšit", "zlepšit", "zrušit", "zničit", "zhasnout"];

module.exports = {
  subject: "CESTINA",
  courses: [
    {
      slug: "cj-u-krouzek",
      title: "Pravopis ú a ů",
      desc: "Kdy psát ú a kdy ů: na začátku slova, uvnitř slova a po předponách.",
      section: "Pravopis",
      grade: 3,
      qs: [
        ...spelling([
          [1, "den týdne po pondělí", "úterý", "Na začátku slova píšeme ú, nikdy ů."],
          [1, "práce, kterou dostaneme od učitele na doma", "úkol", "Na začátku slova píšeme ú."],
          [1, "výraz tváře, když se usmíváme", "úsměv", "Na začátku slova píšeme ú."],
          [1, "druhý měsíc v roce", "únor", "Na začátku slova píšeme ú."],
          [1, "zvíře, na kterém jezdí jezdec", "kůň", "Uvnitř slova píšeme ů."],
          [1, "budova, ve které bydlíme", "dům", "Uvnitř slova píšeme ů."],
          [1, "nábytek, u kterého jíme nebo píšeme", "stůl", "Uvnitř slova píšeme ů."],
          [2, "plody, které farmář sklidí z pole", "úroda", "Na začátku slova píšeme ú."],
          [2, "opak slova široký", "úzký", "Na začátku slova píšeme ú."],
          [2, "instituce, kde vyřídíme například občanský průkaz", "úřad", "Na začátku slova píšeme ú."],
          [2, "květina s trny, kterou dáváme jako dárek", "růže", "Uvnitř slova píšeme ů."],
          [2, "vnější vrstva těla, která pokrývá člověka", "kůže", "Uvnitř slova píšeme ů."],
          [2, "bílé koření, kterým solíme jídlo", "sůl", "Na konci slova píšeme ů."],
          [2, "příbor, kterým krájíme", "nůž", "Na konci slova píšeme ů."],
          [2, "směr, kam jdeme po škole", "domů", "Na konci slova píšeme ů."],
          [3, "nížina mezi dvěma kopci nebo horami", "údolí", "Na začátku slova píšeme ú."],
          [3, "když se nám něco podaří", "úspěch", "Na začátku slova píšeme ú."],
          [3, "poranění, například při pádu", "úraz", "Na začátku slova píšeme ú."],
          [3, "fáze Měsíce, kdy vidíme celý kruh", "úplněk", "Na začátku slova píšeme ú."],
          [3, "skála vyčnívající z moře", "útes", "Na začátku slova píšeme ú."],
          [3, "vrchní vrstva země, ve které rostou rostliny", "půda", "Uvnitř slova píšeme ů."],
          [3, "neodejít, být dál na místě (sloveso)", "zůstat", "Uvnitř slova píšeme ů."],
          [4, "opak slova úspěch", "neúspěch", "Po předponě ne- píšeme ú: neúspěch."],
          [4, "útvar se třemi stranami a třemi vrcholy", "trojúhelník", "Po předponě troj- píšeme ú: trojúhelník."],
          [4, "útvar se čtyřmi stranami a čtyřmi vrcholy", "čtyřúhelník", "Po předponě čtyř- píšeme ú: čtyřúhelník."],
          [5, "takový, který nemá žádný účel", "bezúčelný", "Po předponě bez- píšeme ú: bezúčelný."],
        ]),
        [2, "Které písmeno píšeme na začátku slova?", "ú", ["ů", "obě stejně často", "záleží na slovním druhu"], "Na začátku slova se píše vždy ú, například úkol, úterý. Ů se na začátku slova nepíše."],
        [3, "Kde se ve slovech píše ů?", "uvnitř a na konci slova", ["na začátku slova", "vždy po předponě", "jen v cizích slovech"], "Například dům, kůň, domů."],
        [4, "Proč se ve slově trojúhelník píše ú?", "protože následuje po předponě troj-", ["protože je to cizí slovo", "protože je na začátku věty", "protože je to zdrobnělina"], "Po předponě se píše ú, i když je uprostřed slova."],
        [5, "Které z těchto slov je napsané s ú správně?", "neúplný", ["neůplný", "neuplný", "neouplný"], "Po předponě ne- píšeme ú."],
        [5, "Které z těchto slov je napsané správně?", "pětiúhelník", ["pětiůhelník", "pětiuhelník", "pětiouhelník"], "Po číslovkové předponě píšeme ú."],
      ],
    },
    {
      slug: "cj-predpony-s-z-vz",
      title: "Předpony s-, z-, vz- a předložky s, z",
      desc: "Rozlišení předpon s-, z-, vz- a předložek s, se, z, ze.",
      section: "Pravopis",
      grade: 5,
      qs: [
        [1, "Která předložka patří do věty: Maminka vyšla … domu?", "z", ["s", "se", "ze"], "Odkud? Z domu. Předložka z se pojí s druhým pádem a odpovídá na otázku odkud."],
        [1, "Která předložka patří do věty: Šel jsem na procházku … kamarádem?", "s", ["z", "ze", "se"], "S kamarádem, tedy společně. Předložka s se pojí s 7. pádem a znamená společně."],
        [1, "Která předložka patří do věty: Vracíme se … školy?", "ze", ["z", "s", "se"], "Odkud? Ze školy. Před souhláskovou skupinou škol- píšeme ze."],
        [1, "Která předložka patří do věty: Hraju si … sestrou?", "se", ["s", "z", "ze"], "Před slovem začínajícím na s píšeme se: se sestrou."],
        [1, "Která předložka patří do věty: Přijel … Prahy?", "z", ["s", "ze", "se"], "Odkud? Z Prahy."],
        [2, "Která předložka patří do věty: Půjdeš … mnou do kina?", "se", ["s", "z", "ze"], "Se mnou píšeme vždy se."],
        [2, "Která předložka patří do věty: Spadl … stromu?", "ze", ["z", "s", "se"], "Odkud? Ze stromu."],
        [2, "Která předložka patří do věty: Přinesl jsem jablka … zahrady?", "ze", ["z", "s", "se"], "Před slovem začínajícím na z píšeme ze: ze zahrady."],
        [2, "Která předložka patří do věty: Večeřím … rodiči?", "s", ["z", "ze", "se"], "Společně: s rodiči."],
        [2, "Která předložka patří do věty: Vyšel … lesa?", "z", ["s", "ze", "se"], "Odkud? Z lesa."],
        [2, "Která předložka patří do věty: Čeká nás sraz … Zuzanou?", "se", ["s", "z", "ze"], "Před slovem začínajícím na z píšeme se: se Zuzanou."],
        [2, "Která předložka patří do věty: Kdo půjde … tebou?", "s", ["z", "ze", "se"], "S tebou, tedy společně."],
        [3, "Co znamená předložka s ve větě „Jdu s kamarádem“?", "společně s někým", ["odkud někdo přichází", "kam někdo míří", "pro koho něco je"], "Předložka s vyjadřuje společně."],
        [3, "Co znamená předložka z ve větě „Vyšel z domu“?", "odkud, ven z něčeho", ["společně s někým", "pomocí něčeho", "místo něčeho"], "Předložka z odpovídá na otázku odkud."],
        [4, "Před jakými slovy píšeme místo s tvar se?", "před slovy začínajícími s, z, š nebo ž", ["před slovy začínajícími samohláskou", "před slovy na k", "před všemi podstatnými jmény"], "Například se sestrou, se zvířetem, se šnekem, se ženou."],
        ...prefixQuestions(
          ["Které z těchto slov se píše s předponou vz-?", "Které slovo začíná předponou vz-?", "Vyber slovo, které se píše s vz-.", "Které slovo patří mezi slova s předponou vz-?", "Které z těchto sloves nebo podstatných jmen se píše s vz-?"],
          VZ,
          ["sundat", "zmenšit", "spojit", "zrušit", "svázat", "zlepšit", "sjet", "zničit"],
          "vz-",
          "Správně se píše s předponou vz-",
        ),
        ...prefixQuestions(
          ["Které z těchto slov se píše s předponou s-?", "Které slovo začíná předponou s-?", "Vyber slovo, které se píše s s- na začátku.", "Které slovo patří mezi slova s předponou s-?", "Které z těchto sloves se píše s předponou s-?"],
          S,
          ["vzlétnout", "zmenšit", "vzbudit", "zrušit", "vzpomenout", "zlepšit", "vzdálenost", "zničit"],
          "s-",
          "Správně se píše s předponou s-",
        ),
        ...prefixQuestions(
          ["Které z těchto slov se píše s předponou z-?", "Které slovo začíná předponou z-?", "Vyber slovo, které se píše se z- na začátku.", "Které slovo patří mezi slova s předponou z-?", "Které z těchto sloves se píše s předponou z-?"],
          Z,
          ["vzlétnout", "sundat", "vzbudit", "sbírat", "vzpomenout", "spojit", "vzdálenost", "svázat"],
          "z-",
          "Správně se píše s předponou z-",
        ),
      ],
    },
  ],
};
