// Mazlíček: tlapka s polštářky a drápky na kulaté odměně se srstnatým okrajem a srdíčkem.
import { INK, arc, o, c, el, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  let fur = ""; for (let i = 0; i < 28; i++) { const [x, y] = polar(64, 62, 49, i * 360 / 28); fur += `<circle cx="${x}" cy="${y}" r="5.4"/>`; }
  A.add(`<g fill="${A.gr("#ffc9a3", 0.3, 0.25, 0.6, 0.25)}" stroke="${INK}" stroke-width="2.4">${fur}</g>`);
  A.add(c(64, 62, 47, A.gr("#ffc9a3", 0.3, 0.25, 0.6, 0.3), 0, 'stroke="none"'));
  A.add(c(64, 62, 40, A.gr("#ffe0c4", 0.3, 0.25, 0.4, 0.2), 1.6, 'stroke="#d98a5a"'));
  const pad = A.gr("#ff7a9a", 0.32, 0.28, 0.55, 0.4);
  A.add(o("M64 56C48 56 40 72 42 82C44 92 54 90 64 90C74 90 84 92 86 82C88 72 80 56 64 56Z", pad, 2.8));
  for (const [x, y, rot] of [[35, 52, -20], [50, 36, -6], [78, 36, 6], [93, 52, 20]]) {
    A.add(`<ellipse cx="${x}" cy="${y}" rx="7.4" ry="9.4" transform="rotate(${rot} ${x} ${y})" fill="${pad}" stroke="${INK}" stroke-width="2.6"/>`);
    A.add(`<ellipse cx="${x - 2}" cy="${y - 3}" rx="2" ry="3" transform="rotate(${rot} ${x} ${y})" fill="#fff" fill-opacity=".6"/>`);
  }
  A.add(ln("M52 66Q58 62 66 63", "#fff", 0.7, 2.4));
  A.add(`<path d="M64 84C58 80 56 76 59 74C61 73 63 74 64 76C65 74 67 73 69 74C72 76 70 80 64 84Z" fill="#fff" fill-opacity=".85"/>`);
  return { shadow: [64, 120, 42, 5, 0.3], sparkles: false };
}
