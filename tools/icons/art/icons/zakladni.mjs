// Základní škola: barevné stavebnicové kostky s písmeny A B C a číslem 1, na kruhové záři, s jablkem a tužkou.
import { INK, o, c, ln, dots } from "../kit.mjs";
export default function (A) {
  A.add(`<circle cx="64" cy="64" r="58" fill="#4a5dff" fill-opacity=".16"/><ellipse cx="64" cy="112" rx="50" ry="7" fill="#1b1a3a" fill-opacity=".2"/>`);
  const cube = (x, y, top, left, right, t) => {
    A.add(o(`M${x} ${y}L${x + 22} ${y - 11}L${x + 44} ${y}L${x + 22} ${y + 11}Z`, top, 2.6));
    A.add(o(`M${x} ${y}L${x + 22} ${y + 11}V${y + 37}L${x} ${y + 26}Z`, left, 2.6));
    A.add(o(`M${x + 44} ${y}L${x + 22} ${y + 11}V${y + 37}L${x + 44} ${y + 26}Z`, right, 2.6));
    A.add(`<text x="${x + 11}" y="${y + 24}" text-anchor="middle" font-family="Onest,Arial,sans-serif" font-weight="900" font-size="17" fill="#fff" transform="skewY(26.565 ${x + 11} ${y + 20})" opacity=".95">${t}</text>`);
    A.add(ln(`M${x + 4} ${y - 1}L${x + 22} ${y - 9}`, "#fff", 0.7, 1.6));
  };
  cube(10, 78, "#ffa793", "#ff7a5c", "#c25d46", "A"); cube(60, 78, "#8894ff", "#4a5dff", "#3847c2", "B"); cube(35, 52, "#8cf0b8", "#35c47c", "#1f8f58", "C");
  A.add(`<g transform="translate(52 36)"><path d="M0 -6Q-14 -8 -14 8Q-14 24 0 22Q14 24 14 8Q14 -8 0 -6Z" fill="${A.gr("#e5484d", 0.3, 0.25)}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 -6Q-2 -14 4 -18" stroke="#6b3f1d" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M4 -14Q14 -20 20 -12Q10 -8 4 -14Z" fill="#6bd98a" stroke="${INK}" stroke-width="1.8"/><path d="M-8 2Q-8 -2 -4 -3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>`);
  A.add(`<g transform="translate(-8 6) rotate(30 98 30)"><path d="M92 6H104V52H92Z" fill="${A.g("#ffd24d", 0.5, 0.35, [0, 0, 1, 0])}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M92 52L98 64L104 52Z" fill="#f3d6b0" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M92 0H104V6H92Z" fill="#ff7a9a" stroke="${INK}" stroke-width="2.4"/></g>`);
  return { still: true };
}
