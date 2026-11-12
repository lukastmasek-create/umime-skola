// Přechod mezi sekcemi úvodní stránky. Vrstvy zdola nahoru:
// 1) barevné prolnutí: spodní část sekce se plynule mění na barvu sekce pod ní,
// 2) dvě vlny různé rychlosti a výšky (zadní se světelnou čárou, přední vyplněná barvou další sekce),
// 3) SVG jiskry a hvězdičky, které přelétají přes hranu. Vše se hýbe jen transformacemi.
// Animace jsou v globals.css v bloku „Přechody sekcí“ (vypnou se u reduced-motion a u přepínače Animace).

const W = 2880;
const H = 160;
const STEP = 24;

// Periody 720 a 360 dělí polovinu šířky (1440), proto smyčka animace navazuje bez skoku.
function buildPaths(base: number, amp: number, amp2: number, phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += STEP) {
    const y = base + amp * Math.sin((x / 720) * 2 * Math.PI + phase) + amp2 * Math.sin((x / 360) * 2 * Math.PI + phase * 0.6 + 1);
    pts.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  const line = pts.join(" ");
  return { line, fill: `${line} L${W} ${H} L0 ${H} Z` };
}

const BACK = buildPaths(84, 34, 12, 2.4);
const FRONT = buildPaths(104, 26, 9, 0);

const SPARKS = [
  { left: "12%", top: "18%", size: 22, d: "17s", delay: "-3s", hue: "glow" },
  { left: "38%", top: "34%", size: 14, d: "23s", delay: "-11s", hue: "white" },
  { left: "63%", top: "10%", size: 28, d: "19s", delay: "-7s", hue: "glow" },
  { left: "84%", top: "42%", size: 18, d: "27s", delay: "-15s", hue: "glow" },
] as const;

function Spark({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
    </svg>
  );
}

export function SectionWave({ fill, glow = "#8ea2ff", className = "" }: { fill: string; glow?: string; className?: string }) {
  return (
    <div aria-hidden className={`section-blend ${className}`} style={{ ["--sb-fill" as string]: fill, ["--sb-glow" as string]: glow }}>
      <div className="section-wave">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift section-wave-back">
          <path d={BACK.fill} fill={glow} fillOpacity={0.14} />
          <path d={BACK.line} fill="none" stroke={glow} strokeOpacity={0.6} strokeWidth={2} vectorEffect="non-scaling-stroke" className="section-wave-line" />
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="section-wave-drift section-wave-front">
          <path d={FRONT.fill} fill={fill} />
          <path d={FRONT.line} fill="none" stroke={glow} strokeWidth={2.5} vectorEffect="non-scaling-stroke" className="section-wave-line" />
        </svg>
      </div>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="section-spark"
          style={{ left: s.left, top: s.top, ["--sd" as string]: s.d, ["--sdl" as string]: s.delay }}
        >
          <Spark size={s.size} color={s.hue === "glow" ? glow : "#ffffff"} />
        </span>
      ))}
    </div>
  );
}
