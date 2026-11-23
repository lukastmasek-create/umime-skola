import { SCENES } from "./scenes";

const PALETTE: Record<string, string> = {
  k: "#14112f", w: "#f6f1e4", g: "#9a94c4", d: "#5a5580", r: "#ff5a4d", o: "#ff9a3d", y: "#ffc933",
  l: "#7ee05a", L: "#4fb83a", G: "#2f9f4f", b: "#4fb4ff", B: "#2a5fd0", p: "#b07bff", n: "#8a5a2b",
  N: "#5a3a1a", t: "#e8c58a", c: "#7ee0e0", m: "#ff8fd0",
  h: "#ff8a7a", H: "#b8352b", j: "#ffb866", J: "#cc6a1a", u: "#ffe58a", Y: "#c9961a", e: "#a6f08a", E: "#1f6a38",
  q: "#9bd6ff", Q: "#1f3f99", P: "#d2b0ff", z: "#7a4fc0", v: "#b57a40", T: "#b8935a", a: "#f6dfb5", C: "#b8f4f4",
  x: "#3fb0b0", M: "#c75fa0",
};

/** Pixelová scéna únikovky (48×32) nakreslená z bitmapy, bez 3D modelů. Neznámé id nic nevykreslí. */
export function PxScene({ id, className = "" }: { id: string; className?: string }) {
  const rows = SCENES[id];
  if (!rows) return null;
  const byColor: Record<string, string> = {};
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === ".") {
        x++;
        continue;
      }
      const start = x;
      while (x < row.length && row[x] === c) x++;
      byColor[c] = (byColor[c] ?? "") + `M${start} ${y}h${x - start}v1h-${x - start}z`;
    }
  });
  return (
    <svg aria-hidden viewBox="0 0 48 32" shapeRendering="crispEdges" className={`px-scene ${className}`}>
      {Object.entries(byColor).map(([c, d]) => (
        <path key={c} d={d} fill={PALETTE[c] ?? "#fff"} />
      ))}
    </svg>
  );
}
