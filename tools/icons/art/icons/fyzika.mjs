// Fyzika: atom s jádrem z protonů a neutronů, tři eliptické dráhy s elektrony a zářivým středem.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  const orb = (rot) => `<ellipse cx="64" cy="62" rx="50" ry="18" transform="rotate(${rot} 64 62)" fill="none" stroke="${INK}" stroke-width="6.2"/><ellipse cx="64" cy="62" rx="50" ry="18" transform="rotate(${rot} 64 62)" fill="none" stroke="${A.lin([[0, "#9ad4ff"], [1, "#4a8cff"]], [0, 0, 1, 0])}" stroke-width="3"/>`;
  A.add(orb(0)); A.add(orb(60)); A.add(orb(120));
  A.add(`<circle cx="64" cy="62" r="19" fill="#4a8cff" opacity=".25"/>`);
  for (const [x, y, col] of [[58, 66, "#ff6b6b"], [70, 58, "#9aa6c8"], [66, 70, "#ff6b6b"], [58, 56, "#9aa6c8"]]) A.add(c(x, y, 8, A.gr(col, 0.3, 0.3), 2.2));
  A.add(ln("M54 52L60 49M66 66L70 64", "#fff", 0.8, 1.6));
  for (const [x, y] of [[112, 62], [34, 36], [34, 88]]) { A.add(c(x, y, 7.4, A.gr("#ffd24d", 0.3, 0.3), 2.6)); A.add(ln(`M${x - 3} ${y - 2}l2-2`, "#fff", 0.9, 1.4)); }
  A.add(A.spark(112, 20, 6, "#fff", "#4a8cff"));
  return { shadow: [64, 121, 38, 4.5, 0.3], sparkles: true };
}
