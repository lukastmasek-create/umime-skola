// Sada karet: tři barevné karty s viditelnou tloušťkou, přední karta s ohnutým rohem, štítkem, piktogramem otázky,
// čtyřmi odpověďmi a rozměrným schvalovacím odznakem se stuhami.
import { INK, LINE, polar, arc } from "../kit.mjs";

export default function (A) {
  const card = (rot, fill, dark, pip) => {
    const g = A.lin([[0, fill], [1, dark]]);
    return `<g transform="rotate(${rot} 62 108)"><rect x="29.5" y="21.5" width="66" height="88" rx="8" fill="${dark}" stroke="${INK}" stroke-width="2.6"/><rect x="27" y="18" width="66" height="88" rx="8" fill="${g}" stroke="${INK}" stroke-width="2.6"/><path d="M33 25h54" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/><path d="M33 31h14" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>${pip}<path d="M30 110v-4M34 111v-3" stroke="${INK}" stroke-opacity=".35" stroke-width="1"/></g>`;
  };
  const pips = (c) => `<circle cx="36" cy="40" r="2.6" fill="${c}" opacity=".85"/><circle cx="44" cy="40" r="2.6" fill="${c}" opacity=".55"/>`;
  A.add(card(-17, "#9b7dff", "#4a33b8", pips("#fff")));
  A.add(card(13, "#4fa3ff", "#2a5fc2", pips("#fff")));
  A.add(card(-7, "#ffb06c", "#d0612a", pips("#fff6c8")));
  // přední karta: tloušťka (vrstvy papíru) vpravo a dole
  const paper = A.lin([[0, "#ffffff"], [0.7, "#f8f1df"], [1, "#e6d9b8"]]);
  const X = 27, Y = 17, W = 70, H = 92, K = 16; // K = ohnutý roh
  A.add(`<path d="M${X + 3} ${Y + 4}H${X + W - K + 3}L${X + W + 3} ${Y + K + 4}V${Y + H + 4}Q${X + W + 3} ${Y + H + 4} ${X + W - 5} ${Y + H + 4}H${X + 9}Q${X + 3} ${Y + H + 4} ${X + 3} ${Y + H - 2}Z" fill="#cdbd94" stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round"/>`);
  A.add(`<path d="M${X + W + 1} ${Y + K + 3}V${Y + H + 2}M${X + 7} ${Y + H + 2.4}H${X + W - 4}" stroke="#8d7b52" stroke-opacity=".6" stroke-width="1" fill="none"/>`);
  const body = `M${X + 8} ${Y}H${X + W - K}L${X + W} ${Y + K}V${Y + H - 8}Q${X + W} ${Y + H} ${X + W - 8} ${Y + H}H${X + 8}Q${X} ${Y + H} ${X} ${Y + H - 8}V${Y + 8}Q${X} ${Y} ${X + 8} ${Y}Z`;
  A.add(`<path d="${body}" fill="${paper}" stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round"/>`);
  // ohnutý roh se stínem
  A.add(`<path d="M${X + W - K} ${Y}V${Y + K - 2}Q${X + W - K} ${Y + K} ${X + W - K + 2} ${Y + K}H${X + W}Z" fill="#d9c9a0" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`);
  A.add(`<path d="M${X + W - K + 2} ${Y + 3}V${Y + K - 3}" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>`);
  // štítek (záložka) vlevo nahoře
  const tab = A.lin([[0, "#ff8f5c"], [1, "#e0502b"]]);
  A.add(`<path d="M${X + 7} ${Y - 7}H${X + 27}Q${X + 30} ${Y - 7} ${X + 30} ${Y - 4}V${Y + 6}H${X + 5}V${Y - 5}Q${X + 5} ${Y - 7} ${X + 7} ${Y - 7}Z" fill="${tab}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`);
  A.add(`<path d="M${X + 14} ${Y - 3}l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff6c8" stroke="#8f2d12" stroke-width=".9" stroke-linejoin="round" transform="translate(2.6 -2.4) scale(.9)"/>`);
  // hlavička s piktogramem otázky
  const head = A.lin([[0, "#34c8b3"], [1, "#1e8f86"]]);
  A.add(`<rect x="${X + 6}" y="${Y + 12}" width="${W - 26}" height="22" rx="6" fill="${head}" stroke="${INK}" stroke-width="2.4"/>`);
  A.add(`<path d="M${X + 9} ${Y + 15.5}h${W - 32}" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>`);
  A.add(`<circle cx="${X + 18}" cy="${Y + 23}" r="7.2" fill="#fff6d6" stroke="${INK}" stroke-width="1.8"/>`);
  A.add(`<path d="M${X + 15.2} ${Y + 21}Q${X + 15.2} ${Y + 18} ${X + 18} ${Y + 18}Q${X + 20.8} ${Y + 18} ${X + 20.8} ${Y + 20.4}Q${X + 20.8} ${Y + 22} ${X + 18} ${Y + 23}V${Y + 24.2}" fill="none" stroke="#1e6f68" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${X + 18}" cy="${Y + 27}" r="1.15" fill="#1e6f68"/>`);
  A.add(`<path d="M${X + 29} ${Y + 20}h${W - 54}M${X + 29} ${Y + 26.5}h${W - 62}" stroke="#d8fff8" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`);
  // čtyři odpovědi (A B C D) jako dlaždice s tečkami, jedna správně
  const tiles = [[X + 7, Y + 42, 0], [X + 29, Y + 42, 1], [X + 7, Y + 58, 2], [X + 29, Y + 58, 3]];
  const colors = ["#ffd24d", "#cfd8ff", "#cfd8ff", "#cfd8ff"];
  for (const [tx, ty, i] of tiles) {
    const ok = i === 1;
    const g = ok ? A.lin([[0, "#7be3a8"], [1, "#27a96a"]]) : A.lin([[0, "#fbfcff"], [1, "#c9d0ee"]]);
    A.add(`<rect x="${tx}" y="${ty}" width="19" height="13" rx="4" fill="${g}" stroke="${INK}" stroke-width="2"/>`);
    A.add(`<path d="M${tx + 3} ${ty + 3}h6" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>`);
    if (ok) A.add(`<path d="M${tx + 5.5} ${ty + 6.8}l3.2 3.2 5.8-6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
    else A.add(`<circle cx="${tx + 9.5}" cy="${ty + 7}" r="2.6" fill="none" stroke="#7a82b5" stroke-width="1.6"/>`);
  }
  // řádky obsahu s odrážkami + jemná struktura papíru
  A.add(`<path d="M${X + 11} ${Y + 79}h38M${X + 11} ${Y + 86}h28" stroke="#9aa2c8" stroke-width="2.6" stroke-linecap="round"/><circle cx="${X + 6}" cy="${Y + 79}" r="1.6" fill="#ff8f5c"/><circle cx="${X + 6}" cy="${Y + 86}" r="1.6" fill="#ff8f5c"/>`);
  A.add(`<path d="M${X + 52} ${Y + 62}l2 .5M${X + 4} ${Y + 40}l1.5 1M${X + 56} ${Y + 40}l1.8-.6M${X + 14} ${Y + 92}l2 .2M${X + 60} ${Y + 76}l-1.6 1.2" stroke="#b9a877" stroke-opacity=".45" stroke-width="1" stroke-linecap="round"/>`);
  // schvalovací odznak: stuhy, kroužek, lesk, fajfka
  const rib = A.lin([[0, "#58dc9a"], [1, "#1f9d63"]]);
  A.add(`<path d="M84 94L72 117L83 113L87 123L95 102Z" fill="${rib}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M100 94L112 117L101 113L97 123L89 102Z" fill="${rib}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M80 105L77 112M104 105L107 112" stroke="#8ff0bf" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/>`);
  A.add(`<circle cx="92" cy="90" r="19.5" fill="#0d3b2a" fill-opacity=".45" transform="translate(1.5 3)"/>`);
  const ring = A.lin([[0, "#c8ffe0"], [0.45, "#3fd18a"], [1, "#157a4c"]], [0.1, 0, 0.9, 1]);
  const disc = A.rad([[0, "#a4f5c7"], [0.5, "#35c47c"], [1, "#1a8f58"]], 0.35, 0.28, 0.85);
  A.add(`<circle cx="92" cy="88" r="19.5" fill="${ring}" stroke="${INK}" stroke-width="${LINE}"/>`);
  let beads = "";
  for (let i = 0; i < 24; i++) { const [x, y] = polar(92, 88, 17.2, i * 15); beads += `<circle cx="${x}" cy="${y}" r=".75" fill="#0f5b38" opacity=".55"/>`; }
  A.add(beads);
  A.add(`<circle cx="92" cy="88" r="14.4" fill="${disc}" stroke="#0f5b38" stroke-width="1.6"/>`);
  A.add(`<path d="${arc(92, 88, 12.2, 195, 255)}" stroke="#fff" stroke-opacity=".8" stroke-width="2.2" stroke-linecap="round" fill="none"/>`);
  A.add(`<path d="M84.5 88.5l5.4 5.6 10-11.8" fill="none" stroke="#0f5b38" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1.2)" opacity=".55"/>`);
  A.add(`<path d="M84.5 88.5l5.4 5.6 10-11.8" fill="none" stroke="${INK}" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="M84.5 88.5l5.4 5.6 10-11.8" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(A.spark(108, 24, 6.5, "#fff", "#8a6bff"));
  return { shadow: [64, 120, 44, 5, 0.35], sparkles: true };
}
