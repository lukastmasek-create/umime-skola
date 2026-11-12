import { EDGE_CRACKS, HOLE_BAND, HOLE_EDGE, WEB1, WEB2, WEB3, type CrackPath } from "./shop-hole-data";

// Rozbitý rám úvodní karty obchodu: nepravidelná hrana lomu s viditelnou tloušťkou materiálu, jemně větvené praskliny,
// spáleniny a žhavý okraj, který stydne. Kosmonauta, střepy a výbuch přehrává ShopHeroStage. SVG je zakotvené k pravému
// hornímu rohu karty; hrana (HOLE_EDGE) musí sedět s clip-path `.gs-hero-card::before` v globals.css.
const INK = "#05040f";
export const W = 400;
export const TOP = 110;
const P = HOLE_EDGE.map(([r, y]) => [W - r, y + TOP] as [number, number]);
const EDGE = P.map(([x, y]) => `${x},${y}`).join(" ");

// plochy lomu: světlo shora zleva, každý úsek má vlastní odstín a tloušťku
const facets = P.slice(0, -1).map(([x0, y0], i) => {
  const [x1, y1] = P[i + 1];
  const t0 = HOLE_BAND[i], t1 = HOLE_BAND[i + 1];
  const slope = (y1 - y0) / Math.max(1, x1 - x0);
  const lit = Math.max(0, Math.min(1, 0.55 - slope * 0.35));
  const jitter = ((i * 37) % 11) / 11 - 0.5;
  return { pts: `${x0},${y0} ${x1},${y1} ${x1},${y1 + t1} ${x0},${y0 + t0}`, fill: `hsl(252 ${22 + 10 * lit}% ${46 + 30 * lit + jitter * 8}%)`, under: `${x0},${y0 + t0} ${x1},${y1 + t1}` };
});

function Cracks({ list, tone, drawn }: { list: CrackPath[]; tone: "dark" | "pale"; drawn?: boolean }) {
  return (
    <>
      {list.map((c, i) => (
        <g key={i}>
          <path d={c.d} stroke={INK} strokeOpacity={tone === "dark" ? 0.7 : 0.6} strokeWidth={c.w + 1.4} />
          <path d={c.d} stroke={tone === "dark" ? "#d4cdf2" : "#ece7ff"} strokeOpacity={tone === "dark" ? 0.55 : 0.95} strokeWidth={Math.max(0.6, c.w * 0.5)} pathLength={drawn ? 100 : undefined} className={drawn ? "gs-webline" : undefined} />
        </g>
      ))}
    </>
  );
}

export function ShopHeroArt() {
  return (
    <>
    <svg className="gs-hero-glowart" viewBox={`0 0 ${W} 520`} width={W} height={520} aria-hidden focusable="false">
      <defs>
        <clipPath id="sha-incard2"><rect x="-40" y={TOP} width={W + 80} height={520 - TOP} /></clipPath>
        <filter id="sha-leakblur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <g filter="url(#sha-leakblur)" clipPath="url(#sha-incard2)" fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="#ffb050">
        {([["gs-web1", WEB1], ["gs-web2", WEB2], ["gs-web3", WEB3]] as const).map(([cls, list]) => (
          <g key={cls} className={`gs-web ${cls}`}>
            {list.map((c, i) => <path key={i} d={c.d} strokeWidth={c.w + 3.5} strokeOpacity=".9" pathLength={100} className="gs-webline" />)}
          </g>
        ))}
      </g>
    </svg>
    <svg className="gs-hero-art" viewBox={`0 0 ${W} 520`} width={W} height={520} aria-hidden focusable="false">
      <defs>
        <clipPath id="sha-incard"><rect x="-40" y={TOP} width={W + 80} height={520 - TOP} /></clipPath>
        <radialGradient id="sha-scorch" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".6" /><stop offset=".6" stopColor="#0a0820" stopOpacity=".28" /><stop offset="1" stopColor="#0a0820" stopOpacity="0" /></radialGradient>
        <linearGradient id="sha-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#0a0820" stopOpacity=".62" /></linearGradient>
        <filter id="sha-glow" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="sha-blur" x="-10%" y="-20%" width="120%" height="160%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>

      {/* trhliny před prorazem: tři stupně kolem místa nárazu hlavou (200, 122); světlé čerstvé lomy */}
      {([["gs-web1", WEB1], ["gs-web2", WEB2], ["gs-web3", WEB3]] as const).map(([cls, list]) => (
        <g key={cls} className={`gs-web ${cls}`} clipPath="url(#sha-incard)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Cracks list={list} tone="pale" drawn />
        </g>
      ))}

      {/* po prorazu: spáleniny, stín pod lomem, plochy lomu, ostrá horní hrana, praskliny do karty a stydnoucí žhavý okraj */}
      <g className="gs-scorch">
        <ellipse cx="210" cy={TOP + 110} rx="190" ry="62" fill="url(#sha-scorch)" />
        <ellipse cx="120" cy={TOP + 92} rx="80" ry="40" fill="url(#sha-scorch)" />
        <ellipse cx="300" cy={TOP + 98} rx="70" ry="36" fill="url(#sha-scorch)" />
      </g>
      <polyline points={EDGE} transform="translate(0 7)" fill="none" stroke={INK} strokeOpacity=".7" strokeWidth="9" strokeLinejoin="round" filter="url(#sha-blur)" />
      <g strokeLinejoin="round">
        {facets.map((f, i) => (
          <g key={i}>
            <polygon points={f.pts} fill={f.fill} stroke={INK} strokeWidth="1.2" />
            <polygon points={f.pts} fill="url(#sha-band)" />
            <polyline points={f.under} fill="none" stroke={INK} strokeOpacity=".7" strokeWidth="1.6" />
          </g>
        ))}
      </g>
      <polyline points={EDGE} fill="none" stroke={INK} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={EDGE} fill="none" stroke="#f1edff" strokeOpacity=".75" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
      <g clipPath="url(#sha-incard)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Cracks list={EDGE_CRACKS} tone="dark" />
      </g>
      <polyline points={EDGE} fill="none" stroke="#ff8a2a" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" className="gs-hot" transform="translate(0 2.5)" filter="url(#sha-glow)" />
    </svg>
    </>
  );
}
