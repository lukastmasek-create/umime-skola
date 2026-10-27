import * as React from "react";
import { createRoot } from "react-dom/client";
import { SpaceQuizGame } from "@/components/SpaceQuizGame";
(window as any).__QUIZ_TEST__ = true;
const qs: any[] = [
  ["Který pád má slovo „mluvit s kým“?", ["3. pád", "4. pád", "6. pád", "7. pád"], 0],
  ["Doplň: ž__vot", ["i", "í", "y", "ý"], 0],
  ["Kolik je 7 × 8?", ["54", "56", "58", "64"], 1],
  ["Hlavní město Francie?", ["Lyon", "Paříž", "Nice", "Brest"], 1],
  ["Která planeta je nejblíže Slunci?", ["Venuše", "Země", "Merkur", "Mars"], 2],
  ["Kolik stran má šestiúhelník?", ["5", "6", "7", "8"], 1],
  ["Kdo napsal Babičku?", ["K. J. Erben", "B. Němcová", "J. Neruda", "A. Jirásek"], 1],
  ["H₂O je chemický vzorec pro…", ["kyslík", "vodík", "vodu", "sůl"], 2],
  ["Kolik měsíců má rok?", ["10", "11", "12", "13"], 2],
  ["Která zvířata jsou savci?", ["ryby", "ptáci", "delfíni", "plazi"], 2],
  ["Zemí s hlavním městem Berlín je…", ["Rakousko", "Německo", "Polsko", "Švýcarsko"], 1],
  ["Kolik je 100 − 37?", ["63", "73", "67", "57"], 0],
].map(([prompt, options, correctIndex]) => ({ prompt, options, correctIndex, explanation: "Vysvětlení: správná odpověď je " + (options as string[])[correctIndex as number] + "." }));
const game = new URLSearchParams(location.search).get("game") || "space-invaders";
createRoot(document.getElementById("root")!).render(
  <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "system-ui" }}>
    <SpaceQuizGame locale="cs" courseSlug="test" courseTitle="Test kurz" backHref="/" questions={qs} game={game as any} />
  </div>,
);
