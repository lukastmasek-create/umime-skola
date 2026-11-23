import { SCENES } from "./scenes";

const PALETTE: Record<string, string> = {
  k: "#14112f", w: "#f6f1e4", g: "#9a94c4", d: "#5a5580", r: "#ff5a4d", o: "#ff9a3d", y: "#ffc933",
  l: "#7ee05a", L: "#4fb83a", G: "#2f9f4f", b: "#4fb4ff", B: "#2a5fd0", p: "#b07bff", n: "#8a5a2b",
  N: "#5a3a1a", t: "#e8c58a", c: "#7ee0e0", m: "#ff8fd0",
};

/** Pixelová scéna únikovky (24×16) nakreslená z bitmapy, bez 3D modelů. Neznámé id nic nevykreslí. */
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
    <svg aria-hidden viewBox="0 0 24 16" shapeRendering="crispEdges" className={`px-scene ${className}`}>
      {Object.entries(byColor).map(([c, d]) => (
        <path key={c} d={d} fill={PALETTE[c] ?? "#fff"} />
      ))}
    </svg>
  );
}
