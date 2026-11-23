// Pixel-art pozadí úvodní scény: soumračné nebe, blikající pixelové hvězdy, měsíc, plující mraky
// a tři vrstvy kopců s travou. Čisté SVG (crispEdges) + CSS, žádný JS ani canvas.

const W = 160;
const H = 90;

type Hill = { base: number; amp: number; f1: number; f2: number; ph: number; top: string; fill: string; dark: string };

const HILLS: Hill[] = [
  { base: 66, amp: 7, f1: 0.045, f2: 0.11, ph: 1.2, top: "#4a7fa8", fill: "#3b4f8c", dark: "#33427a" },
  { base: 74, amp: 6, f1: 0.06, f2: 0.15, ph: 3.1, top: "#4fbf6a", fill: "#2f7f55", dark: "#276b49" },
  { base: 82, amp: 4, f1: 0.08, f2: 0.2, ph: 0.4, top: "#7fe05a", fill: "#3e9a4b", dark: "#2f7f55" },
];

function heights(h: Hill) {
  return Array.from({ length: W }, (_, x) =>
    Math.round(h.base - h.amp * (0.6 * Math.sin(x * h.f1 + h.ph) + 0.4 * Math.sin(x * h.f2 + h.ph * 2))),
  );
}

// souvislé úseky stejné výšky sloučíme do jednoho obdélníku
function runs(hs: number[]) {
  const out: { x: number; w: number; y: number }[] = [];
  for (let x = 0; x < hs.length; ) {
    let e = x;
    while (e + 1 < hs.length && hs[e + 1] === hs[x]) e++;
    out.push({ x, w: e - x + 1, y: hs[x] });
    x = e + 1;
  }
  return out;
}

const STARS: [number, number, number][] = [
  [8, 6, 0], [19, 18, 1], [31, 9, 2], [44, 22, 0], [57, 5, 1], [70, 15, 2], [83, 8, 0], [96, 24, 1],
  [108, 4, 2], [121, 17, 0], [134, 9, 1], [147, 21, 2], [153, 6, 0], [14, 33, 2], [38, 38, 0],
  [66, 34, 1], [92, 40, 2], [118, 36, 0], [141, 42, 1], [26, 46, 1], [104, 48, 0],
];

// oblak jako shluk pixelů (relativní souřadnice)
const CLOUD: [number, number, number, number][] = [
  [2, 0, 6, 1], [0, 1, 11, 2], [1, 3, 9, 1],
];

const CLOUDS = [
  { y: 14, s: 1, dur: 150, delay: -40, op: 0.5 },
  { y: 30, s: 1.4, dur: 210, delay: -130, op: 0.35 },
  { y: 8, s: 0.8, dur: 120, delay: -90, op: 0.4 },
];

// měsíc: pixelový kotouč s krátery
const MOON: [number, number, number, number, string][] = [
  [0, 2, 8, 4, "#fff4c9"],
  [2, 0, 4, 8, "#fff4c9"],
  [1, 1, 6, 6, "#fff4c9"],
  [2, 2, 2, 1, "#e6d79a"],
  [5, 4, 1, 2, "#e6d79a"],
  [3, 5, 2, 1, "#e6d79a"],
];

export function HeroPixel() {
  return (
    <div aria-hidden className="hero-pixel pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
      >
        <defs>
          <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a0820" />
            <stop offset="0.45" stopColor="#1f1654" />
            <stop offset="0.75" stopColor="#5a2f7e" />
            <stop offset="1" stopColor="#c8567a" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#hp-sky)" />
        {/* pásy soumraku (pixelové schody místo hladkého přechodu) */}
        {[58, 62, 66].map((y, i) => (
          <rect key={y} x="0" y={y} width={W} height="2" fill="#ff9a7a" opacity={0.08 + i * 0.05} />
        ))}

        {STARS.map(([x, y, k], i) => (
          <rect
            key={i}
            className={`hp-star hp-star-${k}`}
            x={x}
            y={y}
            width={k === 0 ? 1 : 1}
            height={1}
            fill={k === 2 ? "#ffe9b0" : "#ffffff"}
          />
        ))}
        {/* plusové hvězdy */}
        {[[22, 12], [112, 12], [78, 28]].map(([x, y], i) => (
          <g key={i} className="hp-star hp-star-1" fill="#fff">
            <rect x={x} y={y - 1} width="1" height="3" />
            <rect x={x - 1} y={y} width="3" height="1" />
          </g>
        ))}

        <g transform="translate(128 9)">
          {MOON.map(([x, y, w, h, c], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
          ))}
        </g>

        {CLOUDS.map((c, i) => (
          <g key={i} className="hp-cloud" style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
            <g transform={`translate(0 ${c.y}) scale(${c.s})`} fill="#ffffff" opacity={c.op}>
              {CLOUD.map(([x, y, w, h], j) => (
                <rect key={j} x={x} y={y} width={w} height={h} />
              ))}
            </g>
          </g>
        ))}

        {HILLS.map((h, i) => {
          const rs = runs(heights(h));
          return (
            <g key={i}>
              {rs.map((r, j) => (
                <g key={j}>
                  <rect x={r.x} y={r.y} width={r.w} height={H - r.y} fill={h.fill} />
                  <rect x={r.x} y={r.y} width={r.w} height="1" fill={h.top} />
                  <rect x={r.x} y={r.y + 1} width={r.w} height="1" fill={h.dark} />
                </g>
              ))}
            </g>
          );
        })}
        {/* pár pixelových stromků na předním kopci */}
        {[18, 46, 101, 137].map((x) => {
          const y = heights(HILLS[2])[x];
          return (
            <g key={x}>
              <rect x={x + 1} y={y - 2} width="1" height="2" fill="#6b4226" />
              <rect x={x} y={y - 5} width="3" height="3" fill="#2f7f55" />
              <rect x={x + 1} y={y - 6} width="1" height="1" fill="#4fbf6a" />
            </g>
          );
        })}
      </svg>
      {/* jemné ztmavení za textem, aby zůstal čitelný */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_30%,rgba(10,8,32,0.55),transparent_75%)]" />
    </div>
  );
}
