// Cvičení na stránce /cs/code. Každé cvičení má zadání, výchozí kód, nápovědu a řešení.
// Kontrola běží v prohlížeči: každá položka v `checks` buď hledá regulární výraz (re),
// nebo spouští vlastní funkci (fn). Je to hrubá kontrola, ne přísný překladač.

export type Lang = "html" | "css" | "js";

export type Check = {
  msg: string; // co se kontroluje, zobrazí se u výsledku
  re?: RegExp;
  fn?: (code: string) => boolean;
};

export type Exercise = {
  id: string;
  kind?: "napis" | "doplni" | "projekt"; // napis = od nuly, doplni = místa ___, projekt = celá malá aplikace
  lang: Lang;
  topic: string; // krátké téma, např. „Flexbox“
  level: 1 | 2 | 3; // 1 = začátek, 3 = výzva
  title: string;
  task: string;
  starter: string;
  hint: string;
  solution: string;
  checks: Check[];
};

export const LANG_LABEL: Record<Lang, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

// Počet výskytů regulárního výrazu v textu (pro kontrolu „aspoň N prvků“).
function count(code: string, re: RegExp) {
  return (code.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g")) ?? []).length;
}

export const EXERCISES: Exercise[] = [
  // ---------- HTML ----------
  {
    id: "html-kostra",
    lang: "html",
    topic: "Kostra stránky",
    level: 1,
    title: "Postav kostru",
    task: 'Napiš celou kostru stránky: DOCTYPE, html s lang="cs", title s libovolným názvem a uvnitř body nadpis h1 s textem „Ahoj“.',
    starter: "",
    hint: "Začni <!DOCTYPE html>. Pak html, head s title, a body s h1.",
    solution: `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8">
    <title>Moje stránka</title>
  </head>
  <body>
    <h1>Ahoj</h1>
  </body>
</html>`,
    checks: [
      { msg: "Je tam <!DOCTYPE html>", re: /<!DOCTYPE html>/i },
      { msg: 'html má lang="cs"', re: /<html[^>]*lang="cs"/i },
      { msg: "Je tam title s textem", re: /<title>\s*\S[\s\S]*?<\/title>/i },
      { msg: "V body je h1 s textem Ahoj", re: /<body>[\s\S]*<h1>\s*Ahoj\s*<\/h1>[\s\S]*<\/body>/i },
    ],
  },
  {
    id: "html-seznam",
    lang: "html",
    topic: "Seznamy",
    level: 1,
    title: "Nákupní seznam",
    task: "Vytvoř nečíslovaný seznam ul se třemi položkami li: mléko, chleba, jablka.",
    starter: "",
    hint: "ul je obal, každá položka je li. Mezi tagy může být jen text.",
    solution: `<ul>
  <li>mléko</li>
  <li>chleba</li>
  <li>jablka</li>
</ul>`,
    checks: [
      { msg: "Je tam ul a jeho zavírací tag", re: /<ul>[\s\S]*<\/ul>/i },
      { msg: "Jsou tam aspoň 3 li", fn: (c) => count(c, /<li>[\s\S]*?<\/li>/i) >= 3 },
      { msg: "Obsahuje mléko, chleba a jablka", fn: (c) => /mléko/i.test(c) && /chleba/i.test(c) && /jablka/i.test(c) },
    ],
  },
  {
    id: "html-odkaz-obrazek",
    lang: "html",
    topic: "Odkazy a obrázky",
    level: 2,
    title: "Odkaz a obrázek",
    task: 'Přidej odkaz a. Vede na https://ucimesehrou.org a má text „Domů“. Přidej obrázek img se src="kocka.png" a alt popisem.',
    starter: "",
    hint: "href je adresa odkazu. alt je povinný popis obrázku, dej ho do uvozovek.",
    solution: `<a href="https://ucimesehrou.org">Domů</a>
<img src="kocka.png" alt="Kočka na gauči">`,
    checks: [
      { msg: "Odkaz má href na https://ucimesehrou.org", re: /<a[^>]*href="https:\/\/ucimesehrou\.org"[^>]*>[\s\S]*?<\/a>/i },
      { msg: "Odkaz má text Domů", re: /<a[^>]*>\s*Domů\s*<\/a>/i },
      { msg: 'Obrázek má src="kocka.png"', re: /<img[^>]*src="kocka\.png"/i },
      { msg: "Obrázek má neprázdný alt", re: /<img[^>]*alt="[^"]+"/i },
    ],
  },
  {
    id: "html-div-span",
    lang: "html",
    topic: "Obaly div a span",
    level: 2,
    title: "Obal a vložka",
    task: 'Ulož nadpis h2 a odstavec p do div s class="karta". Ve druhém odstavci označ slovo „důležité“ tagem span s class="zvyraznit".',
    starter: "",
    hint: "div je bloková krabice (obal), span je vložka uvnitř řádku.",
    solution: `<div class="karta">
  <h2>Pozor</h2>
  <p>Tohle je <span class="zvyraznit">důležité</span>.</p>
</div>`,
    checks: [
      { msg: 'Je tam div s class="karta"', re: /<div[^>]*class="karta"[^>]*>[\s\S]*<\/div>/i },
      { msg: "Je tam h2 a p uvnitř div", re: /<div[^>]*class="karta"[^>]*>[\s\S]*<h2>[\s\S]*<p>[\s\S]*<\/div>/i },
      { msg: 'Je tam span s class="zvyraznit"', re: /<span[^>]*class="zvyraznit"[^>]*>\s*důležité\s*<\/span>/i },
    ],
  },
  {
    id: "html-formular",
    lang: "html",
    topic: "Formuláře",
    level: 2,
    title: "Přihlašovací formulář",
    task: 'Vytvoř form s polem input type="email" (s popiskem label), polem type="password" a tlačítkem button type="submit" s textem „Přihlásit“.',
    starter: "",
    hint: "Každé pole má svůj label. Tlačítko s type=\"submit\" odešle formulář.",
    solution: `<form>
  <label for="mail">E-mail</label>
  <input type="email" id="mail">
  <label for="heslo">Heslo</label>
  <input type="password" id="heslo">
  <button type="submit">Přihlásit</button>
</form>`,
    checks: [
      { msg: "Je tam form", re: /<form[\s\S]*<\/form>/i },
      { msg: 'Je tam input type="email"', re: /<input[^>]*type="email"/i },
      { msg: 'Je tam input type="password"', re: /<input[^>]*type="password"/i },
      { msg: "Je tam label", re: /<label[\s\S]*?<\/label>/i },
      { msg: 'Tlačítko má type="submit" a text Přihlásit', re: /<button[^>]*type="submit"[^>]*>\s*Přihlásit\s*<\/button>/i },
    ],
  },
  {
    id: "html-sematicke",
    lang: "html",
    topic: "Sémantické tagy",
    level: 3,
    title: "Stránka se strukturou",
    task: "Postav rozložení s tagy header (s nadpisem h1), main (s article a jedním h2 a p) a footer (s textem © 2026).",
    starter: "",
    hint: "Tagy header, main, article a footer jsou obaly, které popisují, co je jejich obsah.",
    solution: `<header><h1>Můj web</h1></header>
<main>
  <article>
    <h2>Článek</h2>
    <p>Text článku.</p>
  </article>
</main>
<footer>© 2026</footer>`,
    checks: [
      { msg: "Je tam header s h1", re: /<header>[\s\S]*<h1>[\s\S]*<\/header>/i },
      { msg: "Je tam main s article", re: /<main>[\s\S]*<article>[\s\S]*<\/article>[\s\S]*<\/main>/i },
      { msg: "V article je h2 a p", re: /<article>[\s\S]*<h2>[\s\S]*<p>[\s\S]*<\/article>/i },
      { msg: "Je tam footer s ©", re: /<footer>[\s\S]*©[\s\S]*<\/footer>/i },
    ],
  },

  // ---------- CSS ----------
  {
    id: "css-barvy",
    lang: "css",
    topic: "Barvy a písmo",
    level: 1,
    title: "Barva a velikost",
    task: "Napiš pravidlo pro h1: barva textu #3248f0 a velikost písma 40px.",
    starter: "",
    hint: "Vlastnosti jsou color a font-size. Nezapomeň na středníky.",
    solution: `h1 {
  color: #3248f0;
  font-size: 40px;
}`,
    checks: [
      { msg: "Selektor h1 existuje", re: /h1\s*\{/ },
      { msg: "Je tam color: #3248f0", re: /color\s*:\s*#3248f0\s*;?/i },
      { msg: "Je tam font-size: 40px", re: /font-size\s*:\s*40px/i },
    ],
  },
  {
    id: "css-box",
    lang: "css",
    topic: "Okraje a odsazení",
    level: 1,
    title: "Odsazení krabice",
    task: "Pro třídu .karta nastav padding 16px, margin 24px auto a border-radius 12px.",
    starter: "",
    hint: "padding je uvnitř, margin je venku. auto u marginu vycentruje krabici vodorovně.",
    solution: `.karta {
  padding: 16px;
  margin: 24px auto;
  border-radius: 12px;
}`,
    checks: [
      { msg: "Selektor .karta existuje", re: /\.karta\s*\{/ },
      { msg: "Je tam padding: 16px", re: /padding\s*:\s*16px/i },
      { msg: "Je tam margin: 24px auto", re: /margin\s*:\s*24px\s+auto/i },
      { msg: "Je tam border-radius: 12px", re: /border-radius\s*:\s*12px/i },
    ],
  },
  {
    id: "css-flex",
    lang: "css",
    topic: "Flexbox",
    level: 2,
    title: "Tlačítka vedle sebe",
    task: "Pro .lista nastav display: flex, položky vycentruj vodorovně (justify-content) a svisle (align-items), a mezeru mezi nimi 12px (gap).",
    starter: "",
    hint: "justify-content je vodorovná osa, align-items svislá (v řádku).",
    solution: `.lista {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}`,
    checks: [
      { msg: "Je tam display: flex", re: /display\s*:\s*flex/i },
      { msg: "Je tam justify-content: center", re: /justify-content\s*:\s*center/i },
      { msg: "Je tam align-items: center", re: /align-items\s*:\s*center/i },
      { msg: "Je tam gap: 12px", re: /gap\s*:\s*12px/i },
    ],
  },
  {
    id: "css-hover",
    lang: "css",
    topic: "Hover a přechody",
    level: 2,
    title: "Tlačítko, které reaguje",
    task: "Pro button nastav pozadí #ffc933, a při najetí (:hover) změň pozadí na #ff8a6b. Přidej transition: background 0.2s.",
    starter: "",
    hint: "Pseudotřída :hover platí při najetí myší. transition řekne, jak dlouho změna trvá.",
    solution: `button {
  background: #ffc933;
  transition: background 0.2s;
}
button:hover {
  background: #ff8a6b;
}`,
    checks: [
      { msg: "Je tam button s pozadím #ffc933", re: /button\s*\{[^}]*background\s*:\s*#ffc933/i },
      { msg: "Je tam button:hover", re: /button:hover\s*\{/i },
      { msg: "Hover mění pozadí na #ff8a6b", re: /button:hover\s*\{[^}]*background\s*:\s*#ff8a6b/i },
      { msg: "Je tam transition s background 0.2s", re: /transition\s*:\s*background\s+0?\.2s/i },
    ],
  },
  {
    id: "css-media",
    lang: "css",
    topic: "Responzivní design",
    level: 3,
    title: "Mobilní verze",
    task: "Pro body nastav font-size 18px. Pod 600px šířky okna změň font-size na 14px pomocí @media.",
    starter: "",
    hint: "@media (max-width: 600px) { ... } platí jen pro úzké okno.",
    solution: `body {
  font-size: 18px;
}
@media (max-width: 600px) {
  body {
    font-size: 14px;
  }
}`,
    checks: [
      { msg: "body má font-size 18px", re: /body\s*\{[^}]*font-size\s*:\s*18px/i },
      { msg: "Je tam @media (max-width: 600px)", re: /@media\s*\(\s*max-width\s*:\s*600px\s*\)/i },
      { msg: "V @media je body s font-size 14px", re: /@media[^{]*\{[\s\S]*body\s*\{[^}]*font-size\s*:\s*14px/i },
    ],
  },
  {
    id: "css-grid",
    lang: "css",
    topic: "Grid",
    level: 3,
    title: "Mřížka karet",
    task: "Pro .mrizka vytvoř grid se třemi sloupci stejné šířky (repeat(3, 1fr)) a mezerou 16px.",
    starter: "",
    hint: "display: grid je mřížka, grid-template-columns říká sloupce.",
    solution: `.mrizka {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`,
    checks: [
      { msg: "Je tam display: grid", re: /display\s*:\s*grid/i },
      { msg: "Je tam repeat(3, 1fr)", re: /grid-template-columns\s*:\s*repeat\(\s*3\s*,\s*1fr\s*\)/i },
      { msg: "Je tam gap: 16px", re: /gap\s*:\s*16px/i },
    ],
  },

  // ---------- JavaScript ----------
  {
    id: "js-promenna",
    lang: "js",
    topic: "Proměnné",
    level: 1,
    title: "Pozdrav",
    task: 'Ulož své jméno do const jmeno (nebo jiné jméno proměnné) a vypiš do konzole zprávu „Ahoj “ + jmeno.',
    starter: "",
    hint: "const je konstanta. console.log vypisuje do konzole (F12).",
    solution: `const jmeno = "Marta";
console.log("Ahoj " + jmeno);`,
    checks: [
      { msg: "Je tam const s nějakou hodnotou", re: /const\s+\w+\s*=\s*["'][^"']+["']/ },
      { msg: "Je tam console.log", re: /console\.log\(/ },
      { msg: 'Zpráva začíná „Ahoj “', re: /console\.log\(\s*["']Ahoj\s["']/ },
    ],
  },
  {
    id: "js-if",
    lang: "js",
    topic: "Podmínky",
    level: 1,
    title: "Smí jít do kina?",
    task: "Ulož věk do let vek = 15. Pomocí if a else vypiš „Ano“, když je vek aspoň 18, jinak „Ne“.",
    starter: "",
    hint: "Porovnání většího nebo rovno je >=. else se provede, když if neplatí.",
    solution: `let vek = 15;
if (vek >= 18) {
  console.log("Ano");
} else {
  console.log("Ne");
}`,
    checks: [
      { msg: "Je tam let vek = 15", re: /let\s+vek\s*=\s*15\s*;?/ },
      { msg: "Je tam if (vek >= 18)", re: /if\s*\(\s*vek\s*>=\s*18\s*\)/ },
      { msg: "Je tam else", re: /else\s*\{/ },
      { msg: "Vypisuje Ano i Ne", fn: (c) => /["']Ano["']/.test(c) && /["']Ne["']/.test(c) },
    ],
  },
  {
    id: "js-for",
    lang: "js",
    topic: "Cykly",
    level: 2,
    title: "Odpočítávání",
    task: "Pomocí for vypiš čísla 5, 4, 3, 2, 1 do konzole.",
    starter: "",
    hint: "Počítadlo začíná na 5, v každém kole se odečte 1 (i--), a běží dokud je i >= 1.",
    solution: `for (let i = 5; i >= 1; i--) {
  console.log(i);
}`,
    checks: [
      { msg: "Je tam for smyčka", re: /for\s*\(\s*let\s+\w+\s*=\s*5\s*;/ },
      { msg: "Počítadlo jde dolů (--)", re: /--\s*\)|\w+\s*-=\s*1/ },
      { msg: "Je tam console.log", re: /console\.log\(/ },
    ],
  },
  {
    id: "js-funkce",
    lang: "js",
    topic: "Funkce",
    level: 2,
    title: "Součet",
    task: "Napiš funkci scitej(a, b), která vrátí součet. Pak ji zavolej s 3 a 4 a výsledek vypiš do konzole.",
    starter: "",
    hint: "return vrátí hodnotu ven z funkce. Volání je scitej(3, 4).",
    solution: `function scitej(a, b) {
  return a + b;
}
console.log(scitej(3, 4));`,
    checks: [
      { msg: "Je tam function scitej(a, b)", re: /function\s+scitej\s*\(\s*a\s*,\s*b\s*\)/ },
      { msg: "Funkce vrací return a + b", re: /return\s+a\s*\+\s*b\s*;?/ },
      { msg: "Funkce se volá scitej(3, 4)", re: /scitej\(\s*3\s*,\s*4\s*\)/ },
    ],
  },
  {
    id: "js-pole",
    lang: "js",
    topic: "Pole a forEach",
    level: 2,
    title: "Projdi seznam",
    task: "Vytvoř pole ovoce s třemi názvy. Pomocí forEach vypiš každý název do konzole.",
    starter: "",
    hint: "Pole píšeme do hranatých závorek []. forEach zavolá funkci pro každý prvek.",
    solution: `const ovoce = ["jablko", "hruška", "banán"];
ovoce.forEach((kus) => {
  console.log(kus);
});`,
    checks: [
      { msg: "Je tam pole s hranatými závorkami", re: /const\s+\w+\s*=\s*\[[^\]]+\]/ },
      { msg: "Pole má aspoň 3 prvky", fn: (c) => (c.match(/\[([^\]]*)\]/)?.[1].split(",").length ?? 0) >= 3 },
      { msg: "Je tam forEach", re: /\.forEach\(/ },
    ],
  },
  {
    id: "js-dom",
    lang: "js",
    topic: "DOM a události",
    level: 3,
    title: "Změň text po kliku",
    task: 'Najdi h1 přes document.querySelector("h1"). Po kliku na něj (addEventListener "click") změň jeho textContent na „Kliklo se!“.',
    starter: "",
    hint: "querySelector najde prvek. textContent mění text. Druhý argument addEventListener je funkce.",
    solution: `const nadpis = document.querySelector("h1");
nadpis.addEventListener("click", () => {
  nadpis.textContent = "Kliklo se!";
});`,
    checks: [
      { msg: 'Je tam querySelector("h1")', re: /document\.querySelector\(\s*["']h1["']\s*\)/ },
      { msg: 'Poslouchá událost "click"', re: /addEventListener\(\s*["']click["']/ },
      { msg: "Mění textContent na Kliklo se!", re: /textContent\s*=\s*["']Kliklo se!["']/ },
    ],
  },
  {
    id: "js-prepinac",
    lang: "js",
    topic: "Přepínání tříd",
    level: 3,
    title: "Tmavý režim",
    task: 'Najdi tělo stránky přes document.body. Po kliku na tlačítko s id="rezim" přepni třídu "tmavy" pomocí classList.toggle.',
    starter: "",
    hint: 'classList.toggle("název") přidá třídu, když tam není, a odebere ji, když tam je.',
    solution: `const tlacitko = document.getElementById("rezim");
tlacitko.addEventListener("click", () => {
  document.body.classList.toggle("tmavy");
});`,
    checks: [
      { msg: "Najde tlačítko přes getElementById(\"rezim\")", re: /getElementById\(\s*["']rezim["']\s*\)/ },
      { msg: "Poslouchá click", re: /addEventListener\(\s*["']click["']/ },
      { msg: 'Přepíná třídu "tmavy" přes classList.toggle', re: /classList\.toggle\(\s*["']tmavy["']\s*\)/ },
    ],
  },
  // ---------- DOPLŇ CHYBĚJÍCÍ (kód je předepsaný, místa ___ doplň) ----------
  {
    id: "doplni-html-kostra",
    kind: "doplni",
    lang: "html",
    topic: "Kostra stránky",
    level: 1,
    title: "Doplň kostru",
    task: "Kód je skoro hotový. Doplň místa ___: u html přidej lang=\"cs\" (jen hodnotu html), v title libovolný název a v h1 text Ahoj světe.",
    starter: `<!DOCTYPE html>
<___ lang="cs">
  <head>
    <title>___</title>
  </head>
  <body>
    <___>Ahoj světe</___>
  </body>
</html>`,
    hint: "Místo ___ u prvního tagu napiš html. Místo ___ v title napiš libovolný název. Místa u h1 jsou dvě: napiš tam h1 a zavírací tag h1.",
    solution: `<!DOCTYPE html>
<html lang="cs">
  <head>
    <title>Moje stránka</title>
  </head>
  <body>
    <h1>Ahoj světe</h1>
  </body>
</html>`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: 'html má lang="cs"', re: /<html lang="cs">/ },
      { msg: "Title má neprázdný text", re: /<title>\s*\S[^<]*<\/title>/ },
      { msg: "Je tam h1 s textem Ahoj světe", re: /<h1>Ahoj světe<\/h1>/ },
    ],
  },
  {
    id: "doplni-html-odkaz",
    kind: "doplni",
    lang: "html",
    topic: "Odkazy a obrázky",
    level: 1,
    title: "Doplň odkaz",
    task: "Odkaz má správně text, ale chybí mu adresa. Doplň místo ___ atribut href, aby vedl na https://ucimesehrou.org.",
    starter: `<a ___="https://ucimesehrou.org">Učíme se hrou</a>`,
    hint: "Atribut, který říká, kam odkaz vede, se jmenuje href.",
    solution: `<a href="https://ucimesehrou.org">Učíme se hrou</a>`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Odkaz má href na https://ucimesehrou.org", re: /<a href="https:\/\/ucimesehrou\.org">Učíme se hrou<\/a>/ },
    ],
  },
  {
    id: "doplni-html-obrazek",
    kind: "doplni",
    lang: "html",
    topic: "Odkazy a obrázky",
    level: 2,
    title: "Doplň popis obrázku",
    task: "Obrázek nemá alt popis. Doplň místo ___ atribut alt s textem „Kočka“ tak, aby byl správně napsaný.",
    starter: `<img src="kocka.png" ___="Kočka">`,
    hint: "Atribut pro popis obrázku se jmenuje alt. Pozor, nesmí chybět uvozovky.",
    solution: `<img src="kocka.png" alt="Kočka">`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: 'Obrázek má alt="Kočka"', re: /<img src="kocka\.png" alt="Kočka">/ },
    ],
  },
  {
    id: "doplni-html-formular",
    kind: "doplni",
    lang: "html",
    topic: "Formuláře",
    level: 2,
    title: "Doplň typ pole",
    task: "Pole na e-mail má špatný typ. Doplň místo ___ hodnotu type, aby prohlížeč hlídal, že jde o e-mail, a tlačítku dej typ submit.",
    starter: `<form>
  <input type="___" placeholder="E-mail">
  <button type="___">Odeslat</button>
</form>`,
    hint: "Pro e-mail je typ email. Pro odeslání formuláře je typ submit.",
    solution: `<form>
  <input type="email" placeholder="E-mail">
  <button type="submit">Odeslat</button>
</form>`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: 'Pole má type="email"', re: /<input type="email"/ },
      { msg: 'Tlačítko má type="submit"', re: /<button type="submit">Odeslat<\/button>/ },
    ],
  },
  {
    id: "doplni-css-flex",
    kind: "doplni",
    lang: "css",
    topic: "Flexbox",
    level: 2,
    title: "Doplň flexbox",
    task: "Krabice má být flexbox a obsah vycentrovaný vodorovně. Doplň místa ___.",
    starter: `.lista {
  display: ___;
  ___: center;
  gap: 8px;
}`,
    hint: "display: flex zapne flexbox. Vodorovné zarovnání se řídí vlastností justify-content.",
    solution: `.lista {
  display: flex;
  justify-content: center;
  gap: 8px;
}`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Je tam display: flex", re: /display\s*:\s*flex\s*;/ },
      { msg: "Je tam justify-content: center", re: /justify-content\s*:\s*center\s*;/ },
    ],
  },
  {
    id: "doplni-css-hover",
    kind: "doplni",
    lang: "css",
    topic: "Hover a přechody",
    level: 2,
    title: "Doplň stav při najetí",
    task: "Odkaz má mít modrou barvu jen při najetí myší. Doplň místo ___ pseudotřídu, aby pravidlo platilo při najetí.",
    starter: `a___ {
  color: #3248f0;
}`,
    hint: "Pseudotřída pro najetí myší se píše s dvojtečkou a začíná na h.",
    solution: `a:hover {
  color: #3248f0;
}`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Pravidlo je a:hover s barvou #3248f0", re: /a:hover\s*\{\s*color\s*:\s*#3248f0/ },
    ],
  },
  {
    id: "doplni-js-if",
    kind: "doplni",
    lang: "js",
    topic: "Podmínky",
    level: 1,
    title: "Doplň podmínku",
    task: "Program má vypsat „Dospělý“, když je vek aspoň 18, jinak „Dítě“. Doplň místa ___ (klíčová slova a operátor).",
    starter: `let vek = 16;
___ (vek ___ 18) {
  console.log("Dospělý");
} ___ {
  console.log("Dítě");
}`,
    hint: "Podmínka začíná klíčovým slovem if. Aspoň 18 znamená >=. Pak přijde else.",
    solution: `let vek = 16;
if (vek >= 18) {
  console.log("Dospělý");
} else {
  console.log("Dítě");
}`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Je tam if (vek >= 18)", re: /if\s*\(\s*vek\s*>=\s*18\s*\)/ },
      { msg: "Je tam else {", re: /else\s*\{/ },
    ],
  },
  {
    id: "doplni-js-for",
    kind: "doplni",
    lang: "js",
    topic: "Cykly",
    level: 2,
    title: "Doplň smyčku",
    task: "Smyčka má vypsat kola 0, 1 a 2. Doplň místa ___ tak, aby i rostlo o 1 a skončilo před 3.",
    starter: `for (let i = 0; i ___ 3; ___) {
  console.log("Kolo", i);
}`,
    hint: "Podmínka je i < 3. Krok o jedna dopředu zapisujeme i++.",
    solution: `for (let i = 0; i < 3; i++) {
  console.log("Kolo", i);
}`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Podmínka je i < 3", re: /i\s*<\s*3\s*;/ },
      { msg: "Krok je i++", re: /i\+\+\s*\)/ },
    ],
  },
  {
    id: "doplni-js-funkce",
    kind: "doplni",
    lang: "js",
    topic: "Funkce",
    level: 2,
    title: "Doplň funkci",
    task: "Funkce vynasob má vrátit součin dvou čísel. Doplň místa ___ (klíčové slovo pro funkci a pro návrat hodnoty).",
    starter: `___ vynasob(a, b) {
  ___ a * b;
}
console.log(vynasob(4, 5));`,
    hint: "Funkci začínáme slovem function. Hodnotu vracíme slovem return.",
    solution: `function vynasob(a, b) {
  return a * b;
}
console.log(vynasob(4, 5));`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: "Je tam function vynasob(a, b)", re: /function\s+vynasob\s*\(\s*a\s*,\s*b\s*\)/ },
      { msg: "Funkce vrací return a * b", re: /return\s+a\s*\*\s*b\s*;/ },
    ],
  },
  {
    id: "doplni-js-dom",
    kind: "doplni",
    lang: "js",
    topic: "DOM a události",
    level: 3,
    title: "Doplň DOM",
    task: "Po kliku na nadpis h1 se má jeho text změnit na „Ahoj!“. Doplň místa ___ (najít prvek a změnit jeho text).",
    starter: `const nadpis = document.___("h1");
nadpis.addEventListener("click", () => {
  nadpis.___ = "Ahoj!";
});`,
    hint: "Prvek najdeš přes querySelector. Text prvku měníme přes textContent.",
    solution: `const nadpis = document.querySelector("h1");
nadpis.addEventListener("click", () => {
  nadpis.textContent = "Ahoj!";
});`,
    checks: [
      { msg: "Už nezůstalo žádné ___", fn: (c) => !c.includes("___") },
      { msg: 'Je tam querySelector("h1")', re: /document\.querySelector\(\s*["']h1["']\s*\)/ },
      { msg: "Mění textContent na Ahoj!", re: /textContent\s*=\s*["']Ahoj!["']/ },
    ],
  },
  // ---------- PROJEKTY (celá malá aplikace v jednom HTML souboru) ----------
  {
    id: "projekt-kalkulacka",
    kind: "projekt",
    lang: "html",
    topic: "Kalkulačka",
    level: 3,
    title: "Kalkulačka",
    task: "Postav kalkulačku: dvě čísla, výběr operace (+ - * /), tlačítko = a místo na výsledek. Funkce spocitej(a, b, op) musí řešit dělení nulou. Výsledek ukaž v prvku s id=\"vysledek\".",
    starter: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Kalkulačka</title>
</head>
<body>
  <!-- TODO: dva vstupy s id a, b, výběr operace id op, tlačítko a výsledek -->
  <script>
    // TODO: funkce spocitej(a, b, op) a klik na tlačítko
  </script>
</body>
</html>`,
    hint: "Čísla čti přes parseFloat(input.value). Operaci vyber přes switch (op). U dělení nejdřív zkontroluj, jestli b není 0.",
    solution: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Kalkulačka</title>
  <style>
    body { font-family: sans-serif; padding: 24px; }
    input, select, button { font-size: 18px; margin: 4px; }
    input { width: 90px; }
  </style>
</head>
<body>
  <h1>Kalkulačka</h1>
  <input type="number" id="a">
  <select id="op">
    <option value="+">+</option>
    <option value="-">-</option>
    <option value="*">×</option>
    <option value="/">÷</option>
  </select>
  <input type="number" id="b">
  <button id="spocitat">=</button>
  <p>Výsledek: <span id="vysledek">?</span></p>
  <script>
    function spocitej(a, b, op) {
      switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/":
          if (b === 0) return "nelze dělit nulou";
          return a / b;
        default:
          return "neznámá operace";
      }
    }
    const vysledek = document.getElementById("vysledek");
    document.getElementById("spocitat").addEventListener("click", () => {
      const a = parseFloat(document.getElementById("a").value);
      const b = parseFloat(document.getElementById("b").value);
      const op = document.getElementById("op").value;
      vysledek.textContent = spocitej(a, b, op);
    });
  </script>
</body>
</html>`,
    checks: [
      { msg: 'Je tam vstup id="a" a id="b"', fn: (c) => /id="a"/.test(c) && /id="b"/.test(c) },
      { msg: 'Je tam výběr operace id="op"', re: /<select[^>]*id="op"/ },
      { msg: 'Je tam výsledek id="vysledek"', re: /id="vysledek"/ },
      { msg: "Je funkce spocitej(a, b, op)", re: /function\s+spocitej\s*\(\s*a\s*,\s*b\s*,\s*op\s*\)/ },
      { msg: "Operace se vybírají přes switch (nebo if)", re: /switch\s*\(\s*op\s*\)|if\s*\(\s*op\s*===/ },
      { msg: "Dělení kontroluje nulu (b === 0)", re: /b\s*===\s*0/ },
      { msg: "Čísla se čtou přes parseFloat", re: /parseFloat\(/ },
      { msg: 'Tlačítko poslouchá "click"', re: /addEventListener\(\s*["']click["']/ },
    ],
  },
  {
    id: "projekt-formular",
    kind: "projekt",
    lang: "html",
    topic: "Formulář s kontrolou",
    level: 3,
    title: "Registrace s kontrolou",
    task: "Udělej registrační formulář s e-mailem a heslem. Při odeslání zabraň reloadu stránky (preventDefault). Zkontroluj, že e-mail obsahuje @ a heslo má aspoň 8 znaků. Chybu i úspěch ukaž v prvku s id=\"zprava\".",
    starter: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Registrace</title>
</head>
<body>
  <!-- TODO: form s id formular, pole mail, heslo a tlačítko -->
  <p id="zprava"></p>
  <script>
    // TODO: poslouchej submit, zabraň reloadu a kontroluj hodnoty
  </script>
</body>
</html>`,
    hint: "Na formuláři poslouchej submit a zavolej e.preventDefault(). Hodnoty čti přes .value a .trim(). Délku hesla zjistíš přes heslo.length.",
    solution: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Registrace</title>
  <style>
    body { font-family: sans-serif; padding: 24px; }
    input, button { font-size: 16px; margin: 4px 0; display: block; }
    .chyba { color: #d6291f; }
    .ok { color: #17a864; }
  </style>
</head>
<body>
  <h1>Registrace</h1>
  <form id="formular">
    <label>E-mail <input type="email" id="mail"></label>
    <label>Heslo <input type="password" id="heslo"></label>
    <button type="submit">Registrovat</button>
  </form>
  <p id="zprava"></p>
  <script>
    const formular = document.getElementById("formular");
    const zprava = document.getElementById("zprava");
    formular.addEventListener("submit", (e) => {
      e.preventDefault();
      const mail = document.getElementById("mail").value.trim();
      const heslo = document.getElementById("heslo").value;
      if (!mail.includes("@")) {
        zprava.className = "chyba";
        zprava.textContent = "E-mail musí obsahovat @.";
      } else if (heslo.length < 8) {
        zprava.className = "chyba";
        zprava.textContent = "Heslo musí mít aspoň 8 znaků.";
      } else {
        zprava.className = "ok";
        zprava.textContent = "Vítej, " + mail + "!";
      }
    });
  </script>
</body>
</html>`,
    checks: [
      { msg: 'Je tam form id="formular"', re: /<form[^>]*id="formular"/ },
      { msg: 'Je tam pole type="password" s id="heslo"', re: /<input[^>]*type="password"[^>]*id="heslo"|<input[^>]*id="heslo"[^>]*type="password"/ },
      { msg: "Poslouchá submit", re: /addEventListener\(\s*["']submit["']/ },
      { msg: "Volá preventDefault", re: /preventDefault\(\s*\)/ },
      { msg: 'Kontroluje @ (includes("@"))', re: /includes\(\s*["']@["']\s*\)/ },
      { msg: "Kontroluje délku hesla aspoň 8", re: /heslo\.length\s*(<|>=)\s*8|length\s*>=\s*8/ },
      { msg: 'Výsledek jde do id="zprava"', re: /getElementById\(\s*["']zprava["']\s*\)[\s\S]*textContent/ },
    ],
  },
  {
    id: "projekt-kviz",
    kind: "projekt",
    lang: "html",
    topic: "Kvíz",
    level: 3,
    title: "Kvíz s bodováním",
    task: "Vytvoř kvíz se třemi otázkami. Otázky jsou v poli objektů. Po kliku na odpověď se připočte bod, pokud je správná, a pokračuje se další otázkou. Na konci ukaž text „Správně: X z 3“.",
    starter: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Kvíz</title>
</head>
<body>
  <!-- TODO: nadpis otázky, box pro tlačítka, místo na výsledek -->
  <script>
    // TODO: pole otázek, skóre, funkce, která vykreslí otázku
  </script>
</body>
</html>`,
    hint: "Otázky dej do const otazky = [ { text, moznosti, spravne }, ... ]. Tlačítka vytvářej přes createElement a přidávej přes appendChild. Porovnání s indexem je i === o.spravne.",
    solution: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Kvíz</title>
  <style>
    body { font-family: sans-serif; padding: 24px; }
    button { font-size: 16px; margin: 4px; }
  </style>
</head>
<body>
  <h1>Kvíz</h1>
  <div id="otazka"></div>
  <div id="moznosti"></div>
  <p id="vysledek"></p>
  <script>
    const otazky = [
      { text: "Kolik je 2 + 2?", moznosti: ["3", "4", "5"], spravne: 1 },
      { text: "Jak se zapisuje červená v CSS?", moznosti: ["rd", "red", "blue"], spravne: 1 },
      { text: "Který tag je odstavec?", moznosti: ["h1", "p", "a"], spravne: 1 },
    ];
    let aktualni = 0;
    let skore = 0;

    function ukazOtazku() {
      const o = otazky[aktualni];
      document.getElementById("otazka").textContent = o.text;
      const box = document.getElementById("moznosti");
      box.innerHTML = "";
      o.moznosti.forEach((m, i) => {
        const btn = document.createElement("button");
        btn.textContent = m;
        btn.addEventListener("click", () => {
          if (i === o.spravne) skore += 1;
          aktualni++;
          if (aktualni < otazky.length) {
            ukazOtazku();
          } else {
            document.getElementById("otazka").textContent = "Konec!";
            box.innerHTML = "";
            document.getElementById("vysledek").textContent = "Správně: " + skore + " z " + otazky.length;
          }
        });
        box.appendChild(btn);
      });
    }
    ukazOtazku();
  </script>
</body>
</html>`,
    checks: [
      { msg: "Otázky jsou v poli objektů", re: /const\s+otazky\s*=\s*\[\s*\{/ },
      { msg: "Pole má aspoň 3 otázky", fn: (c) => (c.match(/text\s*:/g) ?? []).length >= 3 },
      { msg: 'Tlačítka se vytvářejí přes createElement("button")', re: /createElement\(\s*["']button["']\s*\)/ },
      { msg: "Tlačítka se přidávají přes appendChild", re: /appendChild\(/ },
      { msg: "Správnou odpověď porovnává přes i === o.spravne", re: /i\s*===\s*o\.spravne/ },
      { msg: "Skóre se zvyšuje (+= 1, ++ nebo podobně)", re: /skore\s*(\+=\s*1|\+\+)|skore\s*=\s*skore\s*\+\s*1/ },
      { msg: 'Na konci je text „Správně: X z …“', re: /Správně:/ },
    ],
  },
  {
    id: "projekt-todo",
    kind: "projekt",
    lang: "html",
    topic: "Seznam úkolů",
    level: 3,
    title: "To-do seznam",
    task: "Vytvoř seznam úkolů: pole pro text, tlačítko Přidat a seznam ul. Prázdný úkol nepřidávej (trim). Nový úkol je li, který se po kliku na něj smaže. Po přidání vyprázdni pole.",
    starter: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Úkoly</title>
</head>
<body>
  <!-- TODO: input id novy, tlačítko Přidat, ul id seznam -->
  <script>
    // TODO: přidání úkolu, kontrola prázdného textu, mazání kliknutím
  </script>
</body>
</html>`,
    hint: "Text čti přes input.value.trim(). Prázdný text zastav přes return. Nový li vytvoř přes createElement('li') a přidej přes appendChild. Smazání je li.remove().",
    solution: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Úkoly</title>
  <style>
    body { font-family: sans-serif; padding: 24px; }
    li { cursor: pointer; margin: 4px 0; }
    li:hover { text-decoration: line-through; }
  </style>
</head>
<body>
  <h1>Úkoly</h1>
  <input type="text" id="novy" placeholder="Co máš za úkol?">
  <button id="pridat">Přidat</button>
  <ul id="seznam"></ul>
  <script>
    const input = document.getElementById("novy");
    const seznam = document.getElementById("seznam");
    document.getElementById("pridat").addEventListener("click", () => {
      const text = input.value.trim();
      if (text === "") return; // prázdný úkol nepřidáme
      const li = document.createElement("li");
      li.textContent = text;
      li.addEventListener("click", () => li.remove());
      seznam.appendChild(li);
      input.value = "";
    });
  </script>
</body>
</html>`,
    checks: [
      { msg: 'Je tam input id="novy"', re: /<input[^>]*id="novy"/ },
      { msg: 'Je tam ul id="seznam"', re: /<ul[^>]*id="seznam"/ },
      { msg: "Kontroluje prázdný text přes trim()", re: /\.trim\(\)/ },
      { msg: "Kontroluje prázdný text (=== \"\")", re: /===\s*["']["']/ },
      { msg: 'Vytváří li přes createElement("li")', re: /createElement\(\s*["']li["']\s*\)/ },
      { msg: "Přidává úkol přes appendChild", re: /appendChild\(/ },
      { msg: "Smaže li přes remove()", re: /\.remove\(\)/ },
      { msg: "Vyprazdňuje pole (input.value = \"\")", re: /input\.value\s*=\s*["']["']/ },
    ],
  },
];

export const TOPICS = Array.from(new Set(EXERCISES.map((e) => e.lang)));
