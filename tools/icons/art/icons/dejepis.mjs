// Dějepis: řecká amfora s meandrem a černofigurovou scénou, zlomek pečetě a zrnka hlíny.
import { INK, o, c, el, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(o("M44 20Q36 20 36 30Q36 40 44 40M84 20Q92 20 92 30Q92 40 84 40", "none", 5.4));
  A.add(`<path d="M44 20Q36 20 36 30Q36 40 44 40M84 20Q92 20 92 30Q92 40 84 40" fill="none" stroke="#c4602a" stroke-width="2.2" stroke-linecap="round"/>`);
  A.add(o("M48 6H80L78 20Q96 34 98 62Q100 92 84 112Q76 120 64 120Q52 120 44 112Q28 92 30 62Q32 34 50 20Z", A.g("#d9743a", 0.4, 0.45, [0, 0, 1, 0.2]), 3.2));
  A.add(el(64, 6, 18, 5, A.g("#c4602a"), 2.8)); A.add(el(64, 6, 11, 2.4, "#4a1f0a", 1.2));
  A.add(`<path d="M32 40Q64 50 96 40M32 84Q64 94 96 84" fill="none" stroke="${INK}" stroke-width="2.4"/>`);
  let m = ""; for (let i = 0; i < 6; i++) m += `M${38 + i * 9} 50v5h5v-3h-2.4`; 
  A.add(`<path d="${m}" transform="translate(0 -1)" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`);
  A.add(`<path d="M30 62Q64 72 98 62" fill="#1f234c" fill-opacity=".1"/>`);
  // postava a kopí
  A.add(`<g fill="${INK}"><circle cx="54" cy="68" r="3.4"/><path d="M50 72h8l2 14-3 1 1 12h-3l-2-10-2 10h-3l1-12-3-1Z"/><path d="M62 70L84 66" stroke="${INK}" stroke-width="1.6"/><circle cx="78" cy="70" r="3"/><path d="M75 74h7l2 12-3 1 1 10h-3l-1-8-2 8h-3l1-10-3-1Z"/></g>`);
  A.add(`<path d="M34 100Q64 108 94 100" fill="none" stroke="${INK}" stroke-width="2"/><path d="M38 106l4 2 4-3 4 2 4-3 4 2 4-2 4 2 4-3 4 2" stroke="${INK}" stroke-width="1.5" fill="none"/>`);
  A.add(ln("M38 40Q34 62 40 88", "#fff", 0.6, 3)); A.add(ln("M50 22Q42 30 40 38", "#fff", 0.6, 2));
  A.add(`<path d="M72 22L74 14M88 98l-3 6" stroke="#7a2a0a" stroke-opacity=".5" stroke-width="1.2"/>`);
  return { shadow: [64, 122, 38, 4.5, 0.3], sparkles: false };
}
