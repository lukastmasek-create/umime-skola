// Střední škola: tablet s grafem a vzorcem, sportovní míč a absolventská čepice, kolem ikony záře.
import { INK, o, c, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="64" r="58" fill="#6b4de0" fill-opacity=".16"/><ellipse cx="64" cy="114" rx="46" ry="6" fill="#1b1a3a" fill-opacity=".2"/>`);
  A.add(rc(30, 14, 62, 96, 8, A.g("#3b4fb8", 0.4, 0.4, [0, 0, 1, 0]), 3));
  A.add(rc(36, 22, 50, 72, 4, A.lin([[0, "#f4f8ff"], [1, "#cfd8f0"]]), 2.2));
  A.add(`<path d="M42 40H80M42 48H70" stroke="#9aa6c8" stroke-width="3" stroke-linecap="round"/>`);
  A.add(`<path d="M42 84V66L52 72L62 58L72 66L82 52V84Z" fill="${A.lin([[0, "#7bf0b0"], [1, "#1f9d63"]])}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M42 66L52 72L62 58L72 66L82 52" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.6" stroke-linejoin="round"/>`);
  A.add(`<text x="56" y="34" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="800" font-size="13" fill="#e5484d">E=mc²</text>`);
  A.add(c(61, 102, 3.2, "#fff", 1.6));
  A.add(c(96, 92, 20, A.gr("#ff9a3c", 0.3, 0.28, 0.5, 0.4), 3)); A.add(`<path d="M76 92Q96 80 116 92M76 92Q96 104 116 92M96 72Q88 92 96 112" fill="none" stroke="${INK}" stroke-width="2"/><path d="M84 78Q90 74 98 74" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`);
  A.add(`<g transform="translate(24 20)"><path d="M-18 4L0 -6L18 4L0 14Z" fill="${A.g("#2a3166", 0.4, 0.3)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-10 10V20Q0 26 10 20V10L0 14Z" fill="#1f234c" stroke="${INK}" stroke-width="2"/><path d="M14 6V18" stroke="#ffd24d" stroke-width="2"/><circle cx="14" cy="20" r="2.4" fill="#ffd24d"/></g>`);
  A.add(A.spark(108, 24, 6, "#fff", "#6b4de0").replace('class="tw" ', ''));
  return { still: true };
}
