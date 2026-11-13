import { EXERCISES } from "@/lib/code-exercises";

// Šablony a zadání pro volný editor. Šablona je výchozí kód, zadání přidává úkol k šabloně.
export type Template = { id: string; title: string; task?: string; code: string };

const BLANK: Template = {
  id: "prazdna",
  title: "Prázdná stránka",
  code: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Moje stránka</title>
</head>
<body>
  <h1>Ahoj!</h1>
</body>
</html>`,
};

const ZADANI: Template[] = [
  {
    id: "pozdrav",
    title: "Pozdrav podle jména",
    task: "Přidej tlačítko, které po kliku napíše „Ahoj, “ a jméno z políčka. Když je políčko prázdné, ať se nic nezobrazí.",
    code: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Pozdrav</title>
</head>
<body>
  <input id="jmeno" placeholder="Jak se jmenuješ?">
  <button id="ok">Pozdravit</button>
  <p id="zprava"></p>
  <script>
    const jmeno = document.getElementById("jmeno");
    const zprava = document.getElementById("zprava");
    document.getElementById("ok").addEventListener("click", () => {
      zprava.textContent = "Ahoj, " + jmeno.value;
    });
  </script>
</body>
</html>`,
  },
  {
    id: "pocitadlo",
    title: "Počítadlo kliků",
    task: "Přidej tlačítko Reset, které počítadlo vynuluje. Počítadlo ať se nesníží pod nulu.",
    code: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Počítadlo</title>
</head>
<body>
  <p>Kliknutí: <span id="cislo">0</span></p>
  <button id="plus">+1</button>
  <script>
    let pocet = 0;
    document.getElementById("plus").addEventListener("click", () => {
      pocet = pocet + 1;
      document.getElementById("cislo").textContent = pocet;
    });
  </script>
</body>
</html>`,
  },
  {
    id: "barvy",
    title: "Tlačítko s barvou",
    task: "Přidej druhé tlačítko s jinou barvou. Při najetí myší ať se zvětší a změní barvu.",
    code: `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>Barvy</title>
  <style>
    button {
      background: #ffc933;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    button:hover {
      background: #ff8a6b;
    }
  </style>
</head>
<body>
  <button>Najeď na mě</button>
</body>
</html>`,
  },
];

// Hotové projekty z cvičení nabídneme jako výchozí kód k úpravě.
const PROJEKTY: Template[] = EXERCISES.filter((e) => e.kind === "projekt").map((e) => ({
  id: e.id,
  title: e.title,
  task: "Uprav projekt podle sebe: změň texty a barvy a přidej jednu novou funkci.",
  code: e.solution,
}));

export const TEMPLATES: Template[] = [BLANK, ...ZADANI, ...PROJEKTY];
