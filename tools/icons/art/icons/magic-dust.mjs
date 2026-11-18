// Kouzelný prach: hvězdný prach ve skleněné lahvičce s korkem, stuhou a vznášejícími se jiskrami.
import { INK, o, c, rc, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  const body = "M50 40H78V54Q96 62 98 88Q98 112 64 114Q30 112 30 88Q32 62 50 54Z";
  A.add(o(body, A.lin([[0, "#f4faff"], [1, "#d6e8f6"]]), 3.4, 'fill-opacity=".9"'));
  const clip = A.clip(`<path d="${body}"/>`);
  A.add(`<g clip-path="${clip}"><path d="M24 80Q44 72 64 80T104 78V120H24Z" fill="${A.lin([[0, "#d6b6ff"], [0.5, "#9a6bff"], [1, "#5a2fd0"]])}"/><path d="M24 80Q44 72 64 80T104 78" fill="none" stroke="#f0e0ff" stroke-width="2.4"/>` + Array.from({ length: 14 }, (_, i) => `<circle cx="${36 + (i * 17) % 56}" cy="${86 + (i * 11) % 24}" r="${1 + (i % 3) * .5}" fill="#fff" fill-opacity="${.5 + (i % 3) * .2}"/>`).join("") + `</g>`);
  A.add(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>`);
  A.add(ln("M40 66Q36 80 38 98", "#fff", 0.8, 3)); A.add(ln("M56 46V54", "#fff", 0.8, 2));
  A.add(rc(48, 36, 32, 8, 3, A.g("#fff"), 2.6));
  A.add(o("M52 36L54 16Q64 10 74 16L76 36Z", A.g("#c98a52", 0.4, 0.3), 2.6)); A.add(`<path d="M58 22h12M58 28h12" stroke="#7a4f26" stroke-opacity=".5" stroke-width="1.2"/>`);
  A.add(`<path d="M50 48Q64 54 78 48" fill="none" stroke="#ffd24d" stroke-width="3.4" stroke-linecap="round"/><path d="M50 48Q64 54 78 48" fill="none" stroke="${INK}" stroke-width=".8" opacity=".4"/>`);
  A.add(A.spark(98, 24, 8, "#fff", "#9a6bff")); A.add(A.spark(24, 32, 6, "#ffe08a", "#ffb020")); A.add(A.spark(106, 62, 4.5, "#fff", "#9a6bff"));
  return { shadow: [64, 123, 40, 4.5, 0.3], sparkles: true };
}
