// Ručně kreslená čára přes celou šířku stránky (hlavička a patička). Čistě dekorativní (aria-hidden).
// Tvar je pevný (bez náhody), takže se shoduje na serveru i v prohlížeči. Natahuje se do šířky,
// tloušťka čáry zůstává stejná díky vector-effect (viz globals.css, .sketch-edge).

const WIDTH = 1200;
const STEP = 24;

function wobble(base: number, amp: number, phase: number) {
  let d = "";
  for (let x = 0; x <= WIDTH; x += STEP) {
    const i = x / STEP;
    const y = base + amp * Math.sin(i * 0.9 + phase) + amp * 0.45 * Math.sin(i * 2.3 + phase * 1.7);
    d += `${d ? "L" : "M"}${x} ${y.toFixed(2)}`;
  }
  return d;
}

// Hlavní tah tužky a slabší vedlejší čára (přetažení), tečkovaná jako rýsování.
const MAIN = wobble(7, 1.6, 0.4);
const GUIDE = wobble(10.4, 1.1, 2.1);

export function SketchEdge({ position }: { position: "top" | "bottom" }) {
  return (
    <svg
      className={`sketch-edge sketch-edge-${position}`}
      viewBox={`0 0 ${WIDTH} 16`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <path d={MAIN} pathLength={1} className="sketch-edge-line" />
      <path d={GUIDE} pathLength={1} className="sketch-edge-guide" />
    </svg>
  );
}
