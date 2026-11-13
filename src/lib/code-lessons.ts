import type { SketchIconKind } from "@/components/SketchIcons";

// Obsah stránky /cs/code: tři „soubory“ (HTML, CSS, JS). Každý řádek může mít vysvětlení,
// které se ukáže po kliknutí nebo při přehrávání.

export type CodeExplain = {
  cmd: string; // příkaz, který se vysvětluje (zobrazí se v nadpisu)
  title: string; // krátký název, co to dělá
  text: string; // popis v obyčejné řeči
  tip?: string; // volitelný tip nebo pozor
};

export type CodeLine = {
  code: string;
  explain?: CodeExplain;
};

export type CodeFile = {
  name: string;
  icon: SketchIconKind;
  lines: CodeLine[];
};

export const CODE_FILES: CodeFile[] = [
  {
    name: "index.html",
    icon: "scroll",
    lines: [
      {
        code: `<!DOCTYPE html>`,
        explain: {
          cmd: "<!DOCTYPE html>",
          title: "Řekni prohlížeči, co za dokument to je",
          text: "Je to první řádek každé stránky. Říká prohlížeči: tohle je moderní HTML5. Nemá žádný obsah ani zavírací tag.",
          tip: "Vždycky ho dávej úplně nahoru, před cokoliv jiného.",
        },
      },
      {
        code: `<html lang="cs">`,
        explain: {
          cmd: "<html lang>",
          title: "Obal celé stránky",
          text: "Všechno ostatní je uvnitř tohohle tagu. Atribut lang říká jazyk stránky, takže čtečky obrazovky a překladače vědí, jak to číst.",
        },
      },
      { code: `  <head>` },
      {
        code: `    <meta charset="UTF-8">`,
        explain: {
          cmd: "<meta charset>",
          title: "Kódování znaků",
          text: "Říká, jak se čtou písmena. Bez něj se ti místo ě, š, č zobrazí divné znaky.",
        },
      },
      {
        code: `    <title>Moje stránka</title>`,
        explain: {
          cmd: "<title>",
          title: "Název na kartě prohlížeče",
          text: "Ten text vidíš nahoře na kartě prohlížeče a vyhledávače ho ukazují jako nadpis odkazu.",
        },
      },
      {
        code: `    <link rel="stylesheet" href="style.css">`,
        explain: {
          cmd: "<link>",
          title: "Připojí CSS soubor",
          text: "href je cesta k souboru. rel=\"stylesheet\" říká, že jde o styly, takže prohlížeč je na stránku použije.",
        },
      },
      { code: `  </head>` },
      { code: `  <body>` },
      {
        code: `    <header>`,
        explain: {
          cmd: "<header>",
          title: "Horní část stránky",
          text: "Sem patří logo, nadpis a menu. Je to sémantický tag, takže je jasné, k čemu slouží.",
        },
      },
      {
        code: `      <h1>Učíme se hrou</h1>`,
        explain: {
          cmd: "<h1>",
          title: "Hlavní nadpis",
          text: "Největší nadpis. Od h1 po h6 se písmo zmenšuje. Na stránce bývá obvykle jeden h1.",
        },
      },
      { code: `    </header>` },
      { code: `    <main>` },
      {
        code: `      <p class="uvod">Ahoj! Tohle je moje první stránka.</p>`,
        explain: {
          cmd: "<p class>",
          title: "Odstavec s třídou",
          text: "p je odstavec textu. class=\"uvod\" je jméno, podle kterého ho CSS najde a obarví nebo zvětší.",
        },
      },
      {
        code: `      <img src="kocka.png" alt="Kočka">`,
        explain: {
          cmd: "<img src alt>",
          title: "Obrázek",
          text: "src je cesta k obrázku. alt je popis obrázku pro čtečky a pro případ, že se obrázek nenačte.",
          tip: "Tenhle tag nemá zavírací část, protože nemá obsah.",
        },
      },
      {
        code: `      <a href="https://ucimesehrou.org">Odkaz</a>`,
        explain: {
          cmd: "<a href>",
          title: "Odkaz",
          text: "Text mezi tagy je to, co se klikne. href je adresa, kam tě odkaz pošle.",
        },
      },
      {
        code: `      <hr>`,
        explain: {
          cmd: "<hr>",
          title: "Vodorovná čára",
          text: "Vykreslí čáru a naznačí přechod mezi částmi stránky. Stejně jako img nemá zavírací tag.",
        },
      },
      {
        code: `      <section>`,
        explain: {
          cmd: "<section>",
          title: "Oddíl stránky",
          text: "Skupina souvisejícího obsahu, typicky s vlastním nadpisem. Pomáhá čtečkám a vyhledávačům pochopit strukturu.",
        },
      },
      {
        code: `        <h2>Co umím</h2>`,
        explain: {
          cmd: "<h2>",
          title: "Podnadpis",
          text: "Druhá úroveň nadpisu. Pod h1 patří h2, pod h2 zase h3. Nepřeskakuj úrovně jen kvůli velikosti písma.",
        },
      },
      {
        code: `        <ul>`,
        explain: {
          cmd: "<ul>",
          title: "Odrážkový seznam",
          text: "Obal seznamu s odrážkami. Pro číslovaný seznam je tu ol.",
        },
      },
      {
        code: `          <li>HTML</li>`,
        explain: {
          cmd: "<li>",
          title: "Položka seznamu",
          text: "Jeden řádek v seznamu. Musí být uvnitř ul nebo ol, jinak to nedává smysl.",
        },
      },
      { code: `          <li>CSS</li>` },
      { code: `        </ul>` },
      { code: `      </section>` },
      {
        code: `      <form>`,
        explain: {
          cmd: "<form>",
          title: "Formulář",
          text: "Obal pro pole, která uživatel vyplňuje. Když odešleš, všechna pole se pošlou spolu.",
        },
      },
      {
        code: `        <input type="text" placeholder="Jméno">`,
        explain: {
          cmd: "<input>",
          title: "Vstupní pole",
          text: "type říká, jaký typ dat se sem píše (text, email, password, number). placeholder je šedý napovídací text.",
        },
      },
      {
        code: `        <button type="submit">Odeslat</button>`,
        explain: {
          cmd: "<button type>",
          title: "Tlačítko",
          text: "Uvnitř formuláře type=\"submit\" odešle formulář. Text uvnitř tagu je to, co uvidíš na tlačítku.",
        },
      },
      { code: `      </form>` },
      { code: `    </main>` },
      {
        code: `    <footer><p>© 2026 Učíme se hrou</p></footer>`,
        explain: {
          cmd: "<footer>",
          title: "Patička",
          text: "Dole na stránce. Obvykle jsou tam kontakty, autorská práva a odkazy na pravidla.",
        },
      },
      {
        code: `    <script src="script.js"></script>`,
        explain: {
          cmd: "<script src>",
          title: "Načte JavaScript",
          text: "Připojí soubor s logikou. Dává se nejlépe na konec body, aby se stránka nejdřív vykreslila.",
        },
      },
      { code: `  </body>` },
      { code: `</html>` },
    ],
  },
  {
    name: "style.css",
    icon: "palette",
    lines: [
      {
        code: `body { font-family: sans-serif; }`,
        explain: {
          cmd: "body { }",
          title: "Selektor a vlastnosti",
          text: "Před složenými závorkami je selektor, tedy co chceš stylovat. Uvnitř jsou vlastnosti ve tvaru vlastnost: hodnota;. Tady se mění celá stránka.",
          tip: "Každá vlastnost končí středníkem.",
        },
      },
      {
        code: `h1 { color: #3248f0; }`,
        explain: {
          cmd: "color",
          title: "Barva textu",
          text: "color mění barvu písma. Barvu můžeš psát názvem (red), hex kódem (#3248f0) nebo rgb(50, 72, 240).",
        },
      },
      {
        code: `.uvod { font-size: 20px; }`,
        explain: {
          cmd: ".uvod",
          title: "Třída (tečka)",
          text: "Tečka znamená třídu. Vybere všechny prvky, které mají class=\"uvod\". Velikost písma se nastavuje přes font-size.",
        },
      },
      {
        code: `header { background: #ffc933; padding: 16px; }`,
        explain: {
          cmd: "background, padding",
          title: "Pozadí a vnitřní odsazení",
          text: "background obarví plochu za prvkem. padding je prázdné místo mezi obsahem a okrajem prvku, takže text nelepí na hranu.",
        },
      },
      {
        code: `a:hover { color: #ff5a3c; }`,
        explain: {
          cmd: ":hover",
          title: "Když na to najedeš myší",
          text: "Dvojtečka vybírá stav prvku. :hover platí, dokud máš myš nad odkazem. Dá se použít i u tlačítek.",
        },
      },
      {
        code: `footer { display: flex; gap: 8px; }`,
        explain: {
          cmd: "display: flex",
          title: "Položky vedle sebe",
          text: "flex skládá prvky vedle sebe místo pod sebou. gap je mezera mezi nimi.",
        },
      },
      {
        code: `@media (max-width: 600px) { h1 { font-size: 24px; } }`,
        explain: {
          cmd: "@media",
          title: "Pravidlo jen pro malé obrazovky",
          text: "Pravidla uvnitř platí jen tehdy, když je okno užší než 600 px. Přesně tohle se dělá pro telefony.",
        },
      },
      {
        code: `.karta { border: 2px solid #16132b; box-shadow: 4px 4px 0 #16132b; }`,
        explain: {
          cmd: "border, box-shadow",
          title: "Rámeček a stín",
          text: "border je obrys (tloušťka, styl, barva). box-shadow přidá stín; když dáš posun 0 a rozmazání 0, dostaneš tvrdý stín, jako v tomhle webu.",
        },
      },
      {
        code: `.tlacitko { transition: transform 0.2s; }`,
        explain: {
          cmd: "transition",
          title: "Plynulá změna",
          text: "Když se vlastnost změní, transition ji nenechá přeskočit, ale animuje ji. Tady se transformace změní za 0,2 sekundy.",
        },
      },
      {
        code: `.tlacitko:hover { transform: scale(1.05); }`,
        explain: {
          cmd: "transform: scale()",
          title: "Zvětšení",
          text: "transform mění tvar prvku bez přesouvání ostatního obsahu. scale(1.05) ho zvětší o 5 %.",
        },
      },
      {
        code: `@keyframes skakat { from { top: 0; } to { top: -10px; } }`,
        explain: {
          cmd: "@keyframes",
          title: "Animace krok za krokem",
          text: "Definuje průběh animace. from je začátek, to je konec, a prohlížeč mezi nimi plynule přechází.",
        },
      },
      {
        code: `.postava { animation: skakat 1s infinite alternate; }`,
        explain: {
          cmd: "animation",
          title: "Spusť animaci",
          text: "Přiřadí prvku animaci z @keyframes. 1s je délka, infinite znamená furt dokola, alternate ji pustí tam a zpátky.",
        },
      },
    ],
  },
  {
    name: "script.js",
    icon: "bolt",
    lines: [
      {
        code: `const jmeno = "Marta";`,
        explain: {
          cmd: "const",
          title: "Konstanta",
          text: "const uloží hodnotu do názvu, který se nemění. Název jmeno tady odkazuje na text Marta.",
          tip: "Když nevíš, co použít, zkus nejdřív const.",
        },
      },
      {
        code: `let pocet = 0;`,
        explain: {
          cmd: "let",
          title: "Proměnná",
          text: "let taky ukládá hodnotu, ale může se později změnit. Tady počítáme kliknutí, takže začínáme na 0.",
        },
      },
      {
        code: `function pozdrav() {`,
        explain: {
          cmd: "function",
          title: "Funkce",
          text: "Pojmenovaný kus kódu, který můžeš zavolat kdykoliv a kolikrát chceš. Tohle je její začátek.",
        },
      },
      {
        code: `  console.log("Ahoj " + jmeno);`,
        explain: {
          cmd: "console.log()",
          title: "Výpis do konzole",
          text: "Vypíše zprávu do konzole. Otevřeš ji klávesou F12 nebo Ctrl+Shift+I. Znak + spojuje texty dohromady.",
        },
      },
      { code: `}` },
      {
        code: `const tlacitko = document.querySelector("button");`,
        explain: {
          cmd: "document.querySelector()",
          title: "Najdi prvek na stránce",
          text: "Najde první button v HTML podle stejného selektoru jako v CSS a uloží ho do proměnné tlacitko.",
        },
      },
      {
        code: `tlacitko.addEventListener("click", () => {`,
        explain: {
          cmd: "addEventListener()",
          title: "Poslouchej událost",
          text: "Když se stane událost (tady klik), spustí se funkce v závorkách. Šipka => je zkrácený zápis funkce.",
        },
      },
      {
        code: `  pocet = pocet + 1;`,
        explain: {
          cmd: "pocet = pocet + 1",
          title: "Přičti jedničku",
          text: "Vezme aktuální hodnotu pocet, přičte 1 a výsledek uloží zpátky do pocet. Proto můžeš použít let.",
        },
      },
      {
        code: `  if (pocet > 5) {`,
        explain: {
          cmd: "if",
          title: "Podmínka",
          text: "Kód uvnitř závorek se provede, jen když je podmínka pravdivá. > znamená „je větší než“.",
        },
      },
      {
        code: `    console.log("Moc klikání!");`,
        explain: {
          cmd: "console.log()",
          title: "Tahle zpráva se objeví jen po pátém kliku",
          text: "Platí jen uvnitř if, takže se vypíše jen tehdy, když je pocet větší než 5.",
        },
      },
      {
        code: `  } else {`,
        explain: {
          cmd: "else",
          title: "Jinak",
          text: "Kód v else se provede, když podmínka v if neplatí.",
        },
      },
      { code: `  }` },
      { code: `});` },
      {
        code: `for (let i = 0; i < 3; i++) {`,
        explain: {
          cmd: "for",
          title: "Opakování",
          text: "Opakuje blok kódu. i je počítadlo, začíná na 0, a dokud je menší než 3, přičte se k němu 1 (i++).",
          tip: "Pozor na nekonečný cyklus. Když podmínka nikdy nepřestane platit, prohlížeč zamrzne.",
        },
      },
      {
        code: `  console.log("Kolo číslo", i);`,
        explain: {
          cmd: "console.log()",
          title: "Výpis v každém kole",
          text: "Vypíše se třikrát: Kolo číslo 0, 1 a 2. Čárka odděluje víc hodnot.",
        },
      },
      { code: `}` },
    ],
  },
  {
    name: "hra.js",
    icon: "bolt",
    lines: [
      {
        code: `const hrac = { jmeno: "Marta", body: 0 };`,
        explain: {
          cmd: "{ }",
          title: "Objekt",
          text: "Složená hodnota, která drží víc věcí pod jmény. Přistupuješ k nim tečkou: hrac.jmeno nebo hrac.body.",
        },
      },
      {
        code: `hrac.body += 10;`,
        explain: {
          cmd: "+=",
          title: "Přičti a ulož",
          text: "Zkrácený zápis pro hrac.body = hrac.body + 10. Existují i -=, *= a /=.",
        },
      },
      {
        code: `const zprava = \`Máš \${hrac.body} bodů\`;`,
        explain: {
          cmd: "`šablona`",
          title: "Šablonový řetězec",
          text: "Text v zpětných uvozovkách umí vložit hodnotu přes ${…}. Výsledek bude „Máš 10 bodů“.",
        },
      },
      {
        code: `if (hrac.body === 10) {`,
        explain: {
          cmd: "===",
          title: "Přesné porovnání",
          text: "=== kontroluje hodnotu i typ. Vždycky ho používej místo ==, který dělá zbytečné převody.",
        },
      },
      { code: `  console.log(zprava);` },
      {
        code: `} else if (hrac.body > 10) {`,
        explain: {
          cmd: "else if",
          title: "Další podmínka",
          text: "Když první if neplatí, zkusí se tahle. Podmínek může být víc, ale proběhne jen jedna.",
        },
      },
      { code: `  console.log("Skvělé!");` },
      { code: `}` },
      {
        code: `const nahoda = Math.random();`,
        explain: {
          cmd: "Math.random()",
          title: "Náhodné číslo",
          text: "Vrátí desetinné číslo od 0 do 1 (bez jedničky). Pro celé číslo 1 až 6 použij Math.floor(Math.random() * 6) + 1.",
        },
      },
      {
        code: `setTimeout(() => console.log("Po dvou sekundách"), 2000);`,
        explain: {
          cmd: "setTimeout()",
          title: "Odlož úkol",
          text: "Spustí funkci až po zadaném čase v milisekundách. 2000 je dvě sekundy.",
        },
      },
      {
        code: `const obrazky = ["kocka.png", "pes.png"];`,
        explain: {
          cmd: "[ ]",
          title: "Pole",
          text: "Seznam hodnot v hranatých závorkách. Číslují se od nuly: obrazky[0] je kocka.png.",
        },
      },
      {
        code: `const nazvy = obrazky.map((o) => o.toUpperCase());`,
        explain: {
          cmd: ".map()",
          title: "Přetvoř každý prvek",
          text: "Projde pole a z každého prvku udělá něco nového. Výsledkem je nové pole, původní zůstane.",
        },
      },
    ],
  },
];
