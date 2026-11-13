import type { Lang } from "@/lib/code-exercises";

// Učivo na stránce /cs/code. Každá sekce je rozbalovací karta: text, tabulky, příklady kódu,
// tipy a varování. Na konci sekce odkazuje na cvičení, kterými si to můžeš procvičit.

export type Block =
  | { type: "text"; text: string }
  | { type: "code"; title?: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "tip"; text: string }
  | { type: "warn"; text: string };

export type CurriculumSection = {
  id: string;
  lang: Lang;
  title: string;
  summary: string;
  blocks: Block[];
  practice: string[]; // id cvičení z code-exercises.ts
};

export const CURRICULUM: CurriculumSection[] = [
  // ======================= HTML =======================
  {
    id: "html-zaklady",
    lang: "html",
    title: "HTML: stavba stránky",
    summary: "Tagy, atributy, nadpisy, odstavce a jak se stránka skládá do stromu.",
    blocks: [
      {
        type: "text",
        text: "HTML je značkovací jazyk. Nepíšeme v něm příkazy, ale popisujeme obsah. Každý prvek je tvořen tagem: otevírací <p>, obsah, zavírací </p>. Některé tagy nemají obsah a zavírací část nepotřebují, například <img> nebo <hr>.",
      },
      {
        type: "table",
        head: ["Tag", "K čemu slouží"],
        rows: [
          ["<h1> až <h6>", "Nadpisy, h1 je nejdůležitější"],
          ["<p>", "Odstavec textu"],
          ["<a href>", "Odkaz na jinou stránku nebo soubor"],
          ["<img src alt>", "Obrázek s popisem pro čtečky"],
          ["<ul> / <ol> + <li>", "Seznam s odrážkami / číslovaný seznam"],
          ["<div>", "Obecný blokový obal, nic neznamená"],
          ["<span>", "Obecný řádkový obal uvnitř textu"],
        ],
      },
      {
        type: "text",
        text: "Atributy jsou dodatečné informace v otevíracím tagu, ve tvaru nazev=\"hodnota\". Nejčastější jsou id (jedinečné jméno prvku), class (skupina prvků pro CSS) a src nebo href (cesta či adresa).",
      },
      {
        type: "code",
        title: "Příklad: odstavec s odkazem a atributy",
        code: `<p class="uvod">
  Učení je
  <a href="https://ucimesehrou.org" id="domu">vzrušující</a>.
</p>`,
      },
      {
        type: "tip",
        text: "Dokument stavíme jako strom: html obsahuje head a body, body obsahuje header, main a footer. Prohlížeč tenhle strom čte shora dolů.",
      },
      {
        type: "warn",
        text: "Nezapomeň uzavírat tagy. Chybějící </div> se projeví tím, že se zbytek stránky rozbije, a hledání chyby je pak zdlouhavé.",
      },
    ],
    practice: ["html-kostra", "html-seznam", "html-odkaz-obrazek", "html-div-span", "doplni-html-kostra", "doplni-html-odkaz", "doplni-html-seznam", "doplni-html-div"],
  },
  {
    id: "html-formulare",
    lang: "html",
    title: "HTML: formuláře",
    summary: "Vstupní pole, typy, popisky, tlačítka a jak se data posílají dál.",
    blocks: [
      {
        type: "text",
        text: "Formulář sbírá data od uživatele. Každé pole je <input>, jeho typ určuje atribut type. Prohlížeč díky typu sám hlídá část chyb: email musí mít zavináč, number jen čísla.",
      },
      {
        type: "table",
        head: ["type", "Co uživatel vidí / zadá"],
        rows: [
          ["text", "Obyčejný text"],
          ["email", "E-mail, hlídá se zavináč"],
          ["password", "Heslo, místo znaků jsou tečky"],
          ["number", "Číslo, s min a max jako hranicemi"],
          ["checkbox", "Zaškrtávací políčko"],
          ["radio", "Kulaté volby, z nichž jde vybrat jen jedna (stejné name)"],
          ["date", "Kalendář pro datum"],
        ],
      },
      {
        type: "code",
        title: "Příklad: popisek, pole a tlačítko",
        code: `<form id="prihlaseni">
  <label for="mail">E-mail</label>
  <input type="email" id="mail" required>

  <label for="vek">Věk</label>
  <input type="number" id="vek" min="0" max="120">

  <button type="submit">Odeslat</button>
</form>`,
      },
      {
        type: "text",
        text: "Atribut required říká, že pole nemůže být prázdné. label for=\"mail\" propojí popisek s polem id=\"mail\", takže klik na text skočí do pole.",
      },
      {
        type: "tip",
        text: "Hodnotu pole čteme v JavaScriptu přes input.value. Všechna pole s name se při odeslání pošlou dál, bez name se neposílají vůbec.",
      },
    ],
    practice: ["html-formular", "doplni-html-formular", "doplni-html-obrazek"],
  },

  // ======================= CSS =======================
  {
    id: "css-zaklady",
    lang: "css",
    title: "CSS: selektory a vlastnosti",
    summary: "Jak vybrat prvek, co s ním udělat, a jaké jsou jednotky a barvy.",
    blocks: [
      {
        type: "text",
        text: "CSS pravidlo má selektor (co stylovat) a deklarace ve složených závorkách. Každá deklarace je vlastnost: hodnota; a končí středníkem.",
      },
      {
        type: "table",
        head: ["Selektor", "Co vybere", "Příklad"],
        rows: [
          ["h1", "Všechny prvky tagu", "h1 { color: red; }"],
          [".karta", "Prvky s class=\"karta\"", ".karta { padding: 16px; }"],
          ["#hlavni", "Jediný prvek s id=\"hlavni\"", "#hlavni { width: 800px; }"],
          ["nav a", "Odkazy uvnitř nav (potomci)", "nav a { color: white; }"],
          ["a:hover", "Odkaz ve stavu najetí myší", "a:hover { color: pink; }"],
          ["li:nth-child(2)", "Druhá položka seznamu", "li:nth-child(2) { font-weight: bold; }"],
        ],
      },
      {
        type: "table",
        head: ["Jednotka", "Význam"],
        rows: [
          ["px", "Pevný počet pixelů, nemění se s velikostí okna"],
          ["%", "Procenta rodiče"],
          ["rem", "Násobek velikosti písma v kořeni stránky (16 px je 1 rem)"],
          ["vw / vh", "Procenta šířky / výšky okna (1vw = 1 % šířky)"],
        ],
      },
      {
        type: "code",
        title: "Barvy: tři způsoby zápisu",
        code: `h1 { color: tomato; }            /* název */
h1 { color: #3248f0; }           /* hex: RGB v šestnáctkové soustavě */
h1 { color: rgb(50, 72, 240); }  /* rgb: červená, zelená, modrá 0-255 */`,
      },
      {
        type: "tip",
        text: "Když dvě pravidla míří na stejný prvek, vyhrává to konkrétnější. Třída přebije tag, id přebije třídu. Stejně konkrétní pravidlo vyhraje to, které je v souboru níž.",
      },
    ],
    practice: ["css-barvy", "doplni-css-hover", "css-hover"],
  },
  {
    id: "css-layout",
    lang: "css",
    title: "CSS: rozložení (box model, flex, grid)",
    summary: "Odsazení, okraje, řádky a sloupce, a responzivní design.",
    blocks: [
      {
        type: "text",
        text: "Každý prvek je krabice. Uvnitř je obsah, kolem něj vnitřní odsazení padding, a vně okraj margin. Obrys je border. Celková šířka se počítá z těchto čtyř vrstev.",
      },
      {
        type: "code",
        title: "Krabice v praxi",
        code: `.karta {
  padding: 16px;          /* uvnitř, mezi obsahem a obrysem */
  border: 2px solid #16132b;
  margin: 24px auto;      /* venku; auto vodorovně vycentruje */
  border-radius: 12px;    /* zaoblené rohy */
  box-sizing: border-box; /* šířka zahrnuje padding a border */
}`,
      },
      {
        type: "text",
        text: "Flexbox skládá položky do řádku (nebo sloupce). Hlavní osa je ta, kterou určuje flex-direction. justify-content řídí rozložení na hlavní ose, align-items na příčné.",
      },
      {
        type: "table",
        head: ["Vlastnost (flex)", "Hodnoty", "Význam"],
        rows: [
          ["flex-direction", "row / column", "Řádek nebo sloupec"],
          ["justify-content", "flex-start, center, space-between", "Rozložení na hlavní ose"],
          ["align-items", "stretch, center, flex-end", "Zarovnání na příčné ose"],
          ["gap", "16px", "Mezera mezi položkami"],
        ],
      },
      {
        type: "text",
        text: "Grid je mřížka. grid-template-columns: repeat(3, 1fr) udělá tři stejné sloupce, 1fr znamená jeden zlomek volného místa.",
      },
      {
        type: "code",
        title: "Responzivní design",
        code: `.mrizka {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 600px) {
  .mrizka {
    grid-template-columns: 1fr; /* na telefonu jeden sloupec */
  }
}`,
      },
      {
        type: "warn",
        text: "display: flex a display: grid nastavuješ na rodiči, ne na dětech. Dítě se řídí tím, co mu rodič nařídí.",
      },
    ],
    practice: ["css-box", "css-flex", "doplni-css-flex", "doplni-css-box", "doplni-css-grid", "css-grid", "css-media"],
  },

  // ======================= JAVASCRIPT =======================
  {
    id: "js-promenne",
    lang: "js",
    title: "JS: proměnné a typy",
    summary: "const, let, typy hodnot a typeof.",
    blocks: [
      {
        type: "text",
        text: "Proměnná je jméno, které drží hodnotu. Dnes používáme const (nemění se) a let (změní se). Starší var nepoužívej, má zvláštní pravidla rozsahu.",
      },
      {
        type: "table",
        head: ["Typ", "Příklad", "Poznámka"],
        rows: [
          ["string", "\"Ahoj\"", "Text, v uvozovkách"],
          ["number", "42, 3.14", "Všechna čísla, celá i desetinná"],
          ["boolean", "true, false", "Pravda nebo nepravda"],
          ["undefined", "let x;", "Proměnná bez hodnoty"],
          ["null", "null", "Záměrně prázdná hodnota"],
          ["array", "[1, 2, 3]", "Seznam (typeof vrátí object)"],
          ["object", "{ jmeno: \"Marta\" }", "Sada vlastností"],
        ],
      },
      {
        type: "code",
        title: "Zjištění typu",
        code: `const jmeno = "Marta";
let body = 0;
console.log(typeof jmeno); // "string"
console.log(typeof body);  // "number"
body = body + 10;          // teď je 10`,
      },
      {
        type: "tip",
        text: "Když něco nevíš, napiš console.log(typeof x). Pomůže to hodně při hledání chyb.",
      },
    ],
    practice: ["js-promenna", "doplni-js-if", "doplni-js-promenna"],
  },
  {
    id: "js-operatory",
    lang: "js",
    title: "JS: operátory, porovnání a logika (&&, ||, !)",
    summary: "Počítání, porovnávání a spojování podmínek. Včetně pravdivostní tabulky.",
    blocks: [
      {
        type: "text",
        text: "Operátor je znak, který pracuje s hodnotami. Výsledek je nová hodnota, kterou můžeš uložit nebo použít v podmínce.",
      },
      {
        type: "table",
        head: ["Skupina", "Operátory", "Příklad a výsledek"],
        rows: [
          ["Aritmetika", "+ - * / % **", "7 % 3 je 1 (zbytek), 2 ** 3 je 8"],
          ["Přiřazení", "= += -= *=", "x += 5 je totéž jako x = x + 5"],
          ["Přesné porovnání", "=== !==", "5 === \"5\" je false (jiný typ)"],
          ["Volné porovnání", "== !=", "5 == \"5\" je true (převede typ). Nepoužívej."],
          ["Velikost", "< > <= >=", "3 < 5 je true"],
          ["Logika", "&& || !", "viz tabulka níž"],
        ],
      },
      {
        type: "text",
        text: "Logické operátory pracují s pravdou a nepravdou. && (a zároveň) je pravda, jen když jsou obě strany pravda. || (nebo) je pravda, když je aspoň jedna strana pravda. ! (ne) pravdu obrací.",
      },
      {
        type: "table",
        head: ["A", "B", "A && B", "A || B", "!A"],
        rows: [
          ["true", "true", "true", "true", "false"],
          ["true", "false", "false", "true", "false"],
          ["false", "true", "false", "true", "true"],
          ["false", "false", "false", "false", "true"],
        ],
      },
      {
        type: "code",
        title: "Podmínka s && a ||",
        code: `const vek = 16;
const maRodice = true;
const jeVikend = false;

// může jít ven, když je dost starý A (má svolení NEBO je víkend)
if (vek >= 15 && (maRodice || jeVikend)) {
  console.log("Jdi ven!");
}

const je18 = !(vek < 18); // ! obrátí výsledek: false`,
      },
      {
        type: "warn",
        text: "&& a || vyhodnocují zleva a přestanou, jakmile je výsledek jasný. Proto se v podmínce hodí pořadí: nejdřív lehčí kontrolu. Priorita && je vyšší než || (stejně jako * je vyšší než +). Když si nejsi jistý, dej závorky.",
      },
    ],
    practice: ["js-if", "doplni-js-if", "doplni-js-logika"],
  },
  {
    id: "js-podminky",
    lang: "js",
    title: "JS: podmínky (if, else, switch, ?:)",
    summary: "Rozhodování programu: if, else if, else, switch a zkrácený zápis.",
    blocks: [
      {
        type: "text",
        text: "Podmínka if provede blok jen tehdy, když je výraz v závorkách pravdivý. else if přidává další možnost a else je pro případ, že nic z předchozího neplatilo. Zkouší se postupně a proběhne jen jedna větev.",
      },
      {
        type: "code",
        title: "Klasická podmínka",
        code: `const bodu = 73;

if (bodu >= 90) {
  console.log("Výborně");
} else if (bodu >= 50) {
  console.log("Dobře");
} else {
  console.log("Zkus to znovu");
}`,
      },
      {
        type: "text",
        text: "Když porovnáváš jednu hodnotu s mnoha možnostmi, switch je přehlednější. Každý case končí break, jinak program propadne do dalšího.",
      },
      {
        type: "code",
        title: "switch",
        code: `const den = "pátek";

switch (den) {
  case "sobota":
  case "neděle":
    console.log("Víkend");
    break;
  case "pátek":
    console.log("Skoro víkend");
    break;
  default:
    console.log("Pracovní den");
}`,
      },
      {
        type: "text",
        text: "Zkrácený zápis ?: je podmínka v jednom výrazu: podminka ? kdyzPravda : kdyzNepravda. Hodí se pro krátký výsledek, ne pro dlouhý kód.",
      },
      {
        type: "code",
        code: `const znamka = bodu >= 50 ? "prošel" : "neprošel";`,
      },
      {
        type: "warn",
        text: "Pozor na jedno = místo dvou. if (x = 5) přiřadí 5 a je vždy pravda. Porovnání je vždy ===.",
      },
    ],
    practice: ["js-if", "doplni-js-if"],
  },
  {
    id: "js-cykly",
    lang: "js",
    title: "JS: cykly (for, while, for...of)",
    summary: "Opakování kódu, počítadla, break a continue.",
    blocks: [
      {
        type: "text",
        text: "Cyklus opakuje kód, dokud platí podmínka. for se hodí, když znáš počet kol. while se hodí, když nevíš, kdy skončit. for...of projde každý prvek pole.",
      },
      {
        type: "code",
        title: "for, while a for...of",
        code: `for (let i = 1; i <= 3; i++) {
  console.log("Kolo", i);
}

let zivoty = 3;
while (zivoty > 0) {
  zivoty--;
}

const ovoce = ["jablko", "hruška"];
for (const kus of ovoce) {
  console.log(kus);
}`,
      },
      {
        type: "text",
        text: "break okamžitě ukončí cyklus. continue přeskočí zbytek tohoto kola a jde na další.",
      },
      {
        type: "code",
        title: "break a continue",
        code: `for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue; // sudá čísla přeskoč
  if (i > 7) break;          // po sedmi skonči
  console.log(i);            // 1, 3, 5, 7
}`,
      },
      {
        type: "warn",
        text: "Pokud podmínka v while nikdy neskončí (zapomněl jsi měnit proměnnou), prohlížeč se zasekne. Vždycky se ujisti, že se něco v cyklu mění.",
      },
    ],
    practice: ["js-for", "doplni-js-for", "doplni-js-foreach"],
  },
  {
    id: "js-funkce",
    lang: "js",
    title: "JS: funkce",
    summary: "Pojmenované kusy kódu, parametry, návratová hodnota a šipkové funkce.",
    blocks: [
      {
        type: "text",
        text: "Funkce je kus kódu s názvem, který můžeš zavolat víckrát. Dostává vstupy zvané parametry a může vrátit výsledek přes return. Bez return vrací undefined.",
      },
      {
        type: "code",
        title: "Tři způsoby zápisu",
        code: `function scitej(a, b) {
  return a + b;
}

const odecti = function (a, b) {
  return a - b;
};

const nasob = (a, b) => a * b; // šipková zkrácená verze

console.log(scitej(2, 3)); // 5`,
      },
      {
        type: "text",
        text: "Proměnné uvnitř funkce jsou vidět jen tam. Tomu se říká rozsah (scope). Proměnné venku funkce vidí, ale naopak ne.",
      },
      {
        type: "code",
        title: "Scope",
        code: `const pozdrav = "Ahoj";
function ukaz() {
  const zprava = pozdrav + "!";
  console.log(zprava);
}
ukaz();
// console.log(zprava); // chyba: zprava tady neexistuje`,
      },
      {
        type: "tip",
        text: "Dobrá funkce dělá jednu věc a jmenuje se podle toho, co dělá: spocitejCenu, ne funkce1.",
      },
    ],
    practice: ["js-funkce", "doplni-js-funkce"],
  },
  {
    id: "js-pole-objekty",
    lang: "js",
    title: "JS: pole a objekty",
    summary: "Seznamy a sady vlastností, plus map, filter a reduce.",
    blocks: [
      {
        type: "text",
        text: "Pole je seznam hodnot číslovaný od nuly. Objekt je sada dvojic klíč: hodnota. Pole i objekt se mohou měnit, i když je const.",
      },
      {
        type: "code",
        title: "Pole a objekt",
        code: `const znamky = [1, 2, 3, 1];
console.log(znamky[0]);    // 1
console.log(znamky.length); // 4

const hrac = { jmeno: "Marta", body: 0 };
console.log(hrac.jmeno);
hrac.body += 10;`,
      },
      {
        type: "table",
        head: ["Metoda", "Co dělá", "Výsledek"],
        rows: [
          ["map(f)", "Převede každý prvek", "Nové pole stejné délky"],
          ["filter(f)", "Ponechá prvky, pro které f vrátí true", "Nové, kratší pole"],
          ["reduce(f, start)", "Sečte nebo zkombinuje všechny prvky", "Jedna hodnota"],
          ["forEach(f)", "Projde prvky, nic nevrací", "undefined"],
        ],
      },
      {
        type: "code",
        title: "Práce s polem",
        code: `const cisla = [1, 2, 3, 4, 5, 6];

const sudá = cisla.filter((c) => c % 2 === 0); // [2, 4, 6]
const dvojnasobek = sudá.map((c) => c * 2);    // [4, 8, 12]
const soucet = dvojnasobek.reduce((s, c) => s + c, 0); // 24`,
      },
      {
        type: "warn",
        text: "map ani filter neupravují původní pole, vracejí nové. Pokud chceš původní změnit, přiřaď výsledek zpátky.",
      },
    ],
    practice: ["js-pole", "doplni-js-pole", "doplni-js-objekt"],
  },
  {
    id: "js-dom",
    lang: "js",
    title: "JS: DOM, události a formuláře",
    summary: "Jak JavaScript hledá prvky, mění je a reaguje na kliknutí a psaní.",
    blocks: [
      {
        type: "text",
        text: "DOM je stromová reprezentace stránky, se kterou JavaScript pracuje. Prvek najdeš přes querySelector (stejný selektor jako v CSS) nebo getElementById. Měnit můžeš text, třídy, styl i strukturu.",
      },
      {
        type: "table",
        head: ["Co chci", "Kód"],
        rows: [
          ["Najít prvek", "document.querySelector(\"#hlavni\")"],
          ["Změnit text", "prvek.textContent = \"Nový text\""],
          ["Přidat / odebrat třídu", "prvek.classList.add(\"aktivni\") / remove"],
          ["Přepnout třídu", "prvek.classList.toggle(\"tmavy\")"],
          ["Číst hodnotu pole", "input.value"],
          ["Reagovat na klik", "prvek.addEventListener(\"click\", () => { ... })"],
          ["Reagovat na odeslání", "form.addEventListener(\"submit\", (e) => { ... })"],
          ["Zabránit reloadu", "e.preventDefault()"],
        ],
      },
      {
        type: "code",
        title: "Počítadlo kliků",
        code: `let pocet = 0;
const tlacitko = document.querySelector("#klik");
const vystup = document.querySelector("#vystup");

tlacitko.addEventListener("click", () => {
  pocet++;
  vystup.textContent = "Kliknutí: " + pocet;
});`,
      },
      {
        type: "warn",
        text: "Skript musí být až za HTML, jinak document.querySelector nenajde prvek a vrátí null. Proto se script dává na konec body.",
      },
    ],
    practice: ["js-dom", "js-prepinac", "doplni-js-dom"],
  },
];

// Učební plán: v jakém pořadí se to učit. Každý krok odkazuje na sekce učiva a na projekt,
// který ověří, že to umíš. Krok začni, až když předchozí projekt zvládneš.
export type PlanStep = {
  step: number;
  title: string;
  goal: string; // co na konci umíš
  time: string; // orientační čas
  sections: string[]; // id sekcí z CURRICULUM
  project?: string; // id projektu z code-exercises.ts
};

export const LEARNING_PLAN: PlanStep[] = [
  {
    step: 1,
    title: "Základ stránky",
    goal: "Napíšeš kostru HTML a rozumíš tagům, atributům a stromu dokumentu.",
    time: "1–2 týdny",
    sections: ["html-zaklady"],
    project: "html-kostra",
  },
  {
    step: 2,
    title: "Styl stránky",
    goal: "Vybereš prvek selektorem, změníš barvu, odsazení a umíš plynulý hover.",
    time: "1–2 týdny",
    sections: ["css-zaklady"],
  },
  {
    step: 3,
    title: "Rozložení a telefon",
    goal: "Postavíš řádek i mřížku z flexboxu a gridu a zařídíš, aby to fungovalo na telefonu.",
    time: "2 týdny",
    sections: ["css-layout"],
  },
  {
    step: 4,
    title: "První kód v JS",
    goal: "Ukládáš hodnoty do proměnných, víš, jaké typy existují, a umíš je zjistit přes typeof.",
    time: "1–2 týdny",
    sections: ["js-promenne"],
  },
  {
    step: 5,
    title: "Podmínky a logika",
    goal: "Porovnáváš přes ===, spojuješ podmínky přes && a || a rozhoduješ přes if, else a switch.",
    time: "2 týdny",
    sections: ["js-operatory", "js-podminky"],
    project: "projekt-kalkulacka",
  },
  {
    step: 6,
    title: "Opakování a funkce",
    goal: "Píšeš cykly for a while, funkce s parametry a return a rozumíš rozsahu proměnných.",
    time: "2 týdny",
    sections: ["js-cykly", "js-funkce"],
  },
  {
    step: 7,
    title: "Seznamy a objekty",
    goal: "Pracuješ s poli a objekty a umíš map, filter a reduce.",
    time: "1–2 týdny",
    sections: ["js-pole-objekty"],
  },
  {
    step: 8,
    title: "Interaktivní stránka",
    goal: "Najdeš prvky v DOM, reaguješ na kliky a čteš formuláře.",
    time: "2–3 týdny",
    sections: ["html-formulare", "js-dom"],
    project: "projekt-formular",
  },
  {
    step: 9,
    title: "Velký projekt",
    goal: "Spojíš všechno dohromady do malé aplikace s pamětí stavu (kvíz, úkoly).",
    time: "3–4 týdny",
    sections: [],
    project: "projekt-kviz",
  },
];
