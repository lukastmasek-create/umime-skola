// Farma: sazenice se dvěma lístky a kapkou, kynutá hlína v květináči, krajina za ní a slunce.
import { INK, o, c, el, rc, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(c(98, 26, 12, A.gr("#ffd24d", 0.3, 0.3), 2.8)); A.add(`<path d="M98 6v-4M98 50v-4M78 26h-4M122 26h-4M84 12l-3-3M112 40l3 3M112 12l3-3M84 40l-3 3" stroke="#ffb02e" stroke-width="2.4" stroke-linecap="round" transform="translate(0 0) scale(1)"/>`);
  A.add(`<path d="M14 100Q40 84 70 94T118 92V114H14Z" fill="${A.g("#46c46e", 0.3, 0.45)}" stroke="${INK}" stroke-width="3"/>`);
  A.add(o("M30 100H98L90 120H38Z", A.g("#b8641c", 0.35, 0.4, [0, 0, 1, 0]), 3.2));
  A.add(o("M24 94H104Q106 100 100 102H28Q22 100 24 94Z", A.g("#d98f3c", 0.4, 0.35), 3));
  A.add(`<ellipse cx="64" cy="94" rx="38" ry="6" fill="#6b3f1d" stroke="${INK}" stroke-width="2.4"/>`); A.add(dots([[40, 94], [54, 95], [70, 94], [86, 95]], 1.4, "#3a2010"));
  A.add(`<path d="M64 94V54" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M64 94V54" stroke="#4cc46e" stroke-width="3.4" stroke-linecap="round"/>`);
  A.add(o("M64 62C48 66 34 56 32 38C50 34 62 44 64 62Z", A.g("#6bd98a", 0.4, 0.4, [0, 0, 1, 1]), 3)); A.add(`<path d="M62 58Q50 50 38 40" stroke="#1f6a3a" stroke-opacity=".6" stroke-width="1.6" fill="none"/>`);
  A.add(o("M64 54C80 56 94 44 96 26C78 24 66 36 64 54Z", A.g("#46c46e", 0.4, 0.4, [0, 0, 1, 1]), 3)); A.add(`<path d="M66 50Q80 40 92 30" stroke="#1f6a3a" stroke-opacity=".6" stroke-width="1.6" fill="none"/>`);
  A.add(ln("M40 42Q48 42 56 50", "#fff", 0.7, 1.8)); A.add(ln("M72 44Q84 40 90 32", "#fff", 0.6, 1.8));
  A.add(`<path d="M104 62Q108 68 104 72Q100 68 104 62Z" fill="${A.lin([[0, "#d6f4ff"], [1, "#4a9fe0"]])}" stroke="${INK}" stroke-width="1.8"/>`);
  A.add(A.spark(22, 30, 6, "#fff", "#46c46e"));
  return { shadow: [64, 122, 48, 4.5, 0.3], sparkles: true };
}
