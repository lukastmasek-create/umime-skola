// Srdce oceánu: modré srdce z mořského skla s vlnkami uvnitř, zlatým lemem a perlami, tvářička.
import { INK, o, c, ln, dots, face } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="58" r="52" fill="#4fd0ff" fill-opacity=".22"/>`);
  const heart = "M64 112C26 84 8 62 12 40C16 18 44 12 64 36C84 12 112 18 116 40C120 62 102 84 64 112Z";
  A.add(o(heart, A.lin([[0, "#8fe6ff"], [0.5, "#2a8cf0"], [1, "#1a3fa8"]], [0.2, 0, 0.8, 1]), 3.6));
  const clip = A.clip(`<path d="${heart}"/>`);
  A.add(`<g clip-path="${clip}"><path d="M0 66Q20 56 40 66T80 66T128 62V120H0Z" fill="#0a2a78" fill-opacity=".35"/><path d="M0 66Q20 56 40 66T80 66T128 62" fill="none" stroke="#d8f6ff" stroke-width="2.4" stroke-opacity=".9"/><path d="M0 84Q20 76 40 84T80 84T128 80" fill="none" stroke="#d8f6ff" stroke-width="1.6" stroke-opacity=".5"/></g>`);
  A.add(`<path d="M${heart.slice(1)}`.replace("<path d=\"M", `<path d="M`) + `" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round" opacity="0"/>`);
  A.add(`<path d="M24 36Q34 22 50 24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".9"/>`);
  A.add(face(64, 56, 1, "#8fa8ff"));
  A.add(dots([[88, 40], [100, 52], [40, 76]], 2.2, "#fff", 0.7)); A.add(dots([[90, 70]], 3.4, "#fff", 0.5));
  A.add(`<path d="M64 112L60 122M64 112L68 122" stroke="${INK}" stroke-width="0"/>`);
  A.add(A.spark(112, 14, 7, "#fff", "#2a8cf0")); A.add(A.spark(14, 84, 5, "#fff", "#2a8cf0"));
  return { shadow: [64, 122, 40, 4.5, 0.3], sparkles: true };
}
