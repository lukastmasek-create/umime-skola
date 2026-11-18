// Doplňování: papír s vynechaným slovem (podtržené okénko), tužka s gumou, razítko „správně“.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M22 12H88L102 26V104Q102 112 94 112H22Q14 112 14 104V20Q14 12 22 12Z", A.g("#fffaf0", 0.2, 0.2, [0, 0, 1, 1]), 3.2));
  A.add(o("M88 12V26H102Z", A.g("#e6d9b8"), 2.2));
  for (const y of [32, 52, 72]) { A.add(`<path d="M24 ${y}H64" stroke="#9aa6c8" stroke-width="3" stroke-linecap="round"/>`); A.add(`<rect x="70" y="${y - 6}" width="22" height="11" rx="3" fill="#e8f4ff" stroke="#4a8cff" stroke-width="1.8" stroke-dasharray="3 2"/>`); }
  A.add(`<path d="M24 92H46" stroke="#9aa6c8" stroke-width="3" stroke-linecap="round"/><rect x="52" y="86" width="22" height="11" rx="3" fill="#d8ffe8" stroke="#2fae6d" stroke-width="1.8"/><path d="M56 92l4 3 8-8" fill="none" stroke="#2fae6d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="M20 100h60" stroke="#c9b27a" stroke-opacity=".4" stroke-width="1"/>`);
  A.add(`<g transform="translate(-14 4) rotate(34 100 72)">` + o("M94 28H106V86H94Z", A.g("#ffd24d", 0.5, 0.35, [0, 0, 1, 0]), 2.8) + `<path d="M100 28V86" stroke="#c98a1a" stroke-width="1.2"/>` + o("M94 86L100 104L106 86Z", A.g("#f3d6b0"), 2.4) + `<path d="M98 98L100 104L102 98Z" fill="#2a3166"/>` + o("M94 20H106V28H94Z", A.g("#c9d0e8"), 2.4) + o("M94 10Q94 6 100 6Q106 6 106 10V20H94Z", A.g("#ff7a9a"), 2.6) + `</g>`);
  A.add(c(30, 32, 0, "none", 0));
  A.add(A.spark(14, 8, 6, "#fff", "#4a8cff"));
  return { shadow: [60, 122, 46, 4.5, 0.3], sparkles: true };
}
