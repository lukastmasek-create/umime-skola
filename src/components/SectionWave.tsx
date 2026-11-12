// Přechod mezi sekcemi úvodní stránky: vlna u spodního okraje sekce, jejíž výplň má barvu sekce pod ní.
// Vlna pomalu teče do stran (smyčka přes polovinu šířky) a při vjezdu do pohledu se zvedne.
// Čára na hřebeni má jemnou záři, takže přechod je vidět i mezi sekcemi se stejným pozadím.
// Animace jsou v globals.css v bloku „Přechody sekcí“ (vypnou se u reduced-motion).

const W = 2880;
const H = 120;
const STEP = 24;
const BASE = 62;

function buildPaths(): { line: string; fill: string } {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += STEP) {
    // Periody 720 a 360 dělí polovinu šířky (1440), proto smyčka animace navazuje bez skoku.
    const y = BASE + 24 * Math.sin((x / 720) * 2 * Math.PI) + 9 * Math.sin((x / 360) * 2 * Math.PI + 1);
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  const line = pts.join(" ");
  return { line, fill: `${line} L${W} ${H} L0 ${H} Z` };
}

const PATHS = buildPaths();

export function SectionWave({ fill, glow = "#8ea2ff", className = "" }: { fill: string; glow?: string; className?: string }) {
  return (
    <div aria-hidden className={`section-wave ${className}`} style={{ color: glow }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift">
        <path d={PATHS.fill} fill={fill} />
        <path d={PATHS.line} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" className="section-wave-line" />
      </svg>
    </div>
  );
}
