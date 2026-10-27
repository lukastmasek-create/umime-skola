// Datový model výukových materiálů (výtahů z učiva). Obsah je v souborech
// src/lib/materials/<predmet>.ts, zobrazuje ho sekce /materialy.

export type MaterialLevel = 1 | 2 | 3 | 4;

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "examples"; items: string[] }
  | { type: "tip"; text: string };

export type Section = { heading: string; blocks: Block[] };

export type Topic = {
  slug: string;
  title: string;
  // 1 = úplné základy (1.–3. třída), 2 = základní (4.–6.), 3 = pokročilé (7.–9.), 4 = příprava na přijímačky
  level: MaterialLevel;
  intro: string;
  sections: Section[];
  remember: string[];
};
