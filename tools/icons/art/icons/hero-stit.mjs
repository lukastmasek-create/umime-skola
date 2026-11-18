// Štít: kovový okraj s nýty, dvě pole (světlé/tmavé zeleň), vyražená fajfka a rytý lem.
import { INK, LINE, arc, o, c, ln, dots, sh } from "../kit.mjs";
export default function (A) {
  const outer = "M64 6L108 20V58C108 88 90 108 64 122C38 108 20 88 20 58V20Z";
  const mid = "M64 13L102 25V58C102 84 86 102 64 114C42 102 26 84 26 58V25Z";
  const inner = "M64 21L95 31V58C95 79 82 94 64 105C46 94 33 79 33 58V31Z";
  A.add(sh("M64 10L112 24V62C112 92 92 112 64 126C36 112 16 92 16 62V24Z", 0, "#000"));
  A.add(o(outer, A.lin([[0, "#f3f6ff"], [0.4, "#b9c4e6"], [1, "#6e7aa8"]]), LINE));
  A.add(o(mid, A.g("#2f9d6a", 0.5, 0.4), 1.8));
  // pravá polovina tmavší (hrana štítu = svislý hřeben)
  A.add(`<path d="M64 13L102 25V58C102 84 86 102 64 114Z" fill="#0b3b2a" fill-opacity=".28"/>`);
  A.add(o(inner, A.lin([[0, "#7bf0b0"], [0.5, "#33c27a"], [1, "#157a4c"]]), 2));
  A.add(`<path d="M64 21L95 31V58C95 79 82 94 64 105Z" fill="#0b3b2a" fill-opacity=".22"/>`);
  A.add(ln("M64 21V105", "#0f5b38", 0.45, 1.2));
  // nýty po obvodu
  A.add(dots([[64, 10], [26, 22], [102, 22], [22, 58], [106, 58], [34, 90], [94, 90]].map(([x, y]) => [x, y]), 2.2, "#fff", 0.95));
  A.add(dots([[64, 10], [26, 22], [102, 22], [22, 58], [106, 58], [34, 90], [94, 90]], 2.2, "none"));
  // fajfka: stín, obrys, výplň, lesk
  A.add(`<path d="M44 62L58 76L86 44" fill="none" stroke="#0b3b2a" stroke-opacity=".5" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" transform="translate(1.5 3)"/>`);
  A.add(`<path d="M44 62L58 76L86 44" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(`<path d="M44 62L58 76L86 44" fill="none" stroke="${A.lin([[0, "#ffffff"], [1, "#d9ffe9"]])}" stroke-width="8.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  A.add(ln("M47 60L58 71", "#fff", 0.9, 1.6));
  A.add(ln(arc(64, 58, 36, 205, 245), "#fff", 0.75, 2.4));
  A.add(ln("M24 30L26 50", "#fff", 0.8, 2));
  return { shadow: [64, 120, 38, 5, 0.32], sparkles: false };
}
