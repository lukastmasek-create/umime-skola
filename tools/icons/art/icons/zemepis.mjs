// Zeměpis: globus v mosazném polokruhu na podstavci, kontinenty se stínem, rovník a poledníky, mraky.
import { INK, o, c, el, ln, dots, polar } from "../kit.mjs";
export default function (A) {
  A.add(o("M44 110H84L80 118H48Z", A.g("#8a95bb"), 2.8)); A.add(o("M60 96H68V110H60Z", A.g("#c98a2a", 0.4, 0.4, [0, 0, 1, 0]), 2.2));
  const clip = A.clip(`<circle cx="64" cy="54" r="40"/>`);
  A.add(c(64, 54, 40, A.gr("#3b9dff", 0.3, 0.25, 0.5, 0.5), 3.4));
  A.add(`<g clip-path="${clip}"><path d="M36 30Q48 20 62 28L66 40Q58 48 50 44Q44 54 36 48Z" fill="${A.g("#4cc46e", 0.3, 0.4)}" stroke="#1f6a3a" stroke-width="1.6"/><path d="M70 38Q86 32 98 44Q102 58 90 64Q84 72 76 80Q70 70 72 58Z" fill="${A.g("#e8c050", 0.3, 0.35)}" stroke="#8a6a1a" stroke-width="1.6"/><path d="M42 70Q54 66 60 78Q58 90 48 92Q40 84 42 70Z" fill="${A.g("#4cc46e", 0.3, 0.4)}" stroke="#1f6a3a" stroke-width="1.6"/><path d="M60 14Q68 12 80 18" stroke="#fff" stroke-width="5" opacity=".85" stroke-linecap="round"/>` +
    `<g fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1"><ellipse cx="64" cy="54" rx="40" ry="14"/><ellipse cx="64" cy="54" rx="14" ry="40"/><path d="M24 54H104M64 14V94"/></g>` +
    `<ellipse cx="64" cy="54" rx="40" ry="40" fill="url(#${A.id()})" opacity="0"/><path d="M96 30A40 40 0 0 1 64 94A52 52 0 0 0 96 30Z" fill="#0a1a5a" opacity=".3"/></g>`);
  A.add(`<path d="M18 40A52 52 0 0 0 64 106" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M18 40A52 52 0 0 0 64 106" fill="none" stroke="${A.lin([[0, "#ffe27a"], [1, "#b8780f"]])}" stroke-width="4" stroke-linecap="round"/>`);
  A.add(c(18, 40, 4.2, A.gr("#ffd24d"), 2)); A.add(c(64, 104, 4.2, A.gr("#ffd24d"), 2));
  A.add(ln("M38 28Q44 20 54 17", "#fff", 0.8, 2.6));
  A.add(`<g transform="translate(96 22)"><path d="M0 8L5 -8L10 8L5 4Z" fill="#e5484d" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></g>`);
  A.add(A.spark(14, 18, 6, "#fff", "#3b9dff"));
  return { shadow: [64, 122, 34, 4.5, 0.3], sparkles: true };
}
