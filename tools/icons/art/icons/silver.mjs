// Stříbro: dva stříbrné slitky v mírně posunuté pyramidě s hallmark značkou a chladnými odlesky.
import { INK, o, c, ln, dots, starPts } from "../kit.mjs";
export default function (A) {
  const bar = (x, y, w) => { A.add(o(`M${x} ${y + 26}L${x + 10} ${y}H${x + w - 10}L${x + w} ${y + 26}Z`, A.lin([[0, "#ffffff"], [0.45, "#d8def2"], [1, "#7a86a8"]]), 3.2)); A.add(o(`M${x + 10} ${y}H${x + w - 10}L${x + w - 18} ${y + 9}H${x + 18}Z`, A.g("#ffffff", 0.1, 0.12), 1.8)); A.add(`<rect x="${x + w / 2 - 12}" y="${y + 12}" width="24" height="9" rx="3" fill="#9aa6c8" fill-opacity=".5" stroke="#5a668a" stroke-width="1"/>`); const S = starPts(x + w / 2, y + 16.6, 3.6, 1.6); A.add(`<path d="${S.map((p, i) => `${i ? "L" : "M"}${p}`).join("")}Z" fill="#fff"/>`); A.add(ln(`M${x + 16} ${y + 4}H${x + w - 22}`, "#fff", 0.9, 1.6)); };
  bar(10, 88, 66); bar(40, 58, 66);
  A.add(`<g transform="translate(24 40) rotate(-12)"><path d="M0 18L6 0H40L46 18Z" fill="${A.lin([[0, "#ffffff"], [1, "#9aa6c8"]])}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M8 5H38" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`);
  A.add(A.spark(14, 62, 6, "#fff", "#7a86a8")); A.add(A.spark(112, 24, 7, "#fff", "#7a86a8")); A.add(A.spark(100, 100, 5, "#fff", "#7a86a8"));
  return { shadow: [64, 122, 54, 4.5, 0.3], sparkles: true };
}
