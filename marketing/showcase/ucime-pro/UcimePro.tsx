// UčímePRO showcase (ucimesehrou.org/cs/pro). One 15 s vertical film: logo morph intro, three real tools of the PRO tab
// (AI doučovač, Fotka úlohy, Osobní plán učení) redrawn as small UI demos, end card merged into the last scene (max 3 camera flights).
// Everything seed-driven: 2d/ucimepro/plan.json (made by plan.mjs). Text data: 2d/ucimepro/items.json (also used by lint.mjs).
import React from "react";
import { createFilm, KText, Morph, Rings, LogoRow, C, FAM, WARM, SOFT, BRAND, back, tw, type Sc } from "./Code";
import { prog, easeOut, easeIO, lerp, pop, clamp } from "./kit";
import { squash, stretchAlong, Cursor, Ripple } from "./fx2";
import { Card3D, NeonRunner } from "./depth";
import PLAN from "../ucimepro/plan.json";
import ITEMS from "../ucimepro/items.json";

const cx = 540;
type It = { id: string; text: string; x: number; y: number; size: number; f: string; a: number; st: number; mode: string; fill?: string; glow?: string; maxW?: number; accent?: string; dur?: number };
const IT = (scene: keyof typeof ITEMS, id: string) => (ITEMS[scene] as It[]).find(i => i.id === id)!;
const eob = (p: number, c = 1.1) => { const q = clamp(p) - 1; return 1 + (c + 1) * q * q * q + c * q * q; };   // ease-out-back, small overshoot
const hero = PLAN.effects.includes("pinDrop");

// ---------- small shared pieces ----------
const Kt: React.FC<{ it: It; t: number; fill?: string }> = ({ it, t, fill }) =>
  <KText id={it.id} text={it.text} x={it.x} y={it.y} size={it.size} t={t} a={it.a} st={it.st} f={it.f as "h" | "b" | "p"} mode={it.mode as "rise" | "pop"} fill={fill ?? it.fill ?? C.cream} glow={(it.glow as "neon") ?? "soft"} maxW={it.maxW ?? 940} />;
/** sentence with ONE yellow accent word (the last one) */
const Sent: React.FC<{ it: It; t: number }> = ({ it, t }) => {
  const words = it.text.split(" "), last = words.pop()!, head = words.join(" ") + " ";
  const total = tw(it.text, it.size, 800, "b"), wh = tw(head, it.size, 800, "b"), wl = tw(last, it.size, 800, "b");
  const x0 = it.x - total / 2;
  return <>
    <KText id={it.id + "a"} text={head.trimEnd()} x={x0 + tw(head.trimEnd(), it.size, 800, "b") / 2} y={it.y} size={it.size} t={t} a={it.a} st={it.st} mode="rise" glow="soft" maxW={900} />
    <KText id={it.id + "b"} text={last} x={x0 + wh + wl / 2} y={it.y} size={it.size} t={t} a={it.a + head.length * it.st} st={it.st} mode="rise" fill={C.yellow} glow="warm" maxW={900} />
  </>;
};
const Glow: React.FC<{ y?: number }> = ({ y = 860 }) => <>
  <defs><radialGradient id="gl"><stop offset="0" stopColor="#6ee7ff" stopOpacity=".12" /><stop offset="1" stopColor="#6ee7ff" stopOpacity="0" /></radialGradient></defs>
  <ellipse cx={cx} cy={y} rx={640} ry={560} fill="url(#gl)" />
</>;
/** far card (z .1, dim, soft) + main card (z 1) */
const Cards: React.FC<{ t: number; x?: number; y?: number; w?: number; h?: number; accent?: string; ph?: number }> = ({ t, x = 60, y = 460, w = 960, h = 800, accent = "#6ee7ff", ph = 0 }) => {
  const p = prog(t, 14, 26), s = lerp(0.92, 1, eob(p, 1.0));
  return <g opacity={clamp(p * 2)} transform={`translate(${cx} ${y + h / 2}) scale(${s}) translate(${-cx} ${-y - h / 2})`}>
    <Card3D x={x + 56} y={y - 44} w={w - 112} h={h - 40} z={0.1} t={t} accent="#5a6cff" runPhase={0.4 + ph} lift={0.2} />
    <Card3D x={x} y={y} w={w} h={h} z={1} t={t} accent={accent} runPhase={ph} lift={0.5} r={36} />
    {[C.coral, C.yellow, C.green].map((c, i) => <circle key={i} cx={x + 50 + i * 34} cy={y + 40} r={9} fill={c} />)}
  </g>;
};
/** one lap of a neon light around the card = success */
const Lap: React.FC<{ t: number; t0: number; len?: number; color?: string }> = ({ t, t0, len = 36, color = C.greenL }) =>
  t >= t0 && t <= t0 + len + 4 ? <NeonRunner x={60} y={460} w={960} h={800} r={36} t={t} speed={1 / len} phase={-t0 / len} color={color} z={1} tail={0.3} /> : null;
const Exit: React.FC<{ t: number; at: number; children: React.ReactNode }> = ({ t, at, children }) => {
  const p = easeIO(prog(t, at, at + 8)); if (p >= 1) return null;
  return <g opacity={1 - p} transform={`translate(${cx} 860) scale(${1 - 0.06 * p}) translate(${-cx} -860)`}>{children}</g>;
};
const Check: React.FC<{ x: number; y: number; t: number; a: number; r?: number; color?: string; fill?: boolean }> = ({ x, y, t, a, r = 30, color = C.greenL, fill = false }) => {
  const p = prog(t, a, a + 10); if (p <= 0) return null; const s = r / 30;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={30} fill={fill ? color : "none"} fillOpacity={fill ? p : 0} stroke={color} strokeWidth={4} />
    <path d="M-13 1 L-4 11 L14 -10" fill="none" stroke={fill ? C.ink : color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </g>;
};
const Bar: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.35 }) => <rect x={x} y={y - 12} width={w} height={24} rx={12} fill={C.cream} opacity={o} />;

// ---------- intro: object -> logo (copy of IntroScene with this film's texts) ----------
const LS = 1.06, LCX = 473.75, LCY = 55.7, SCL = 0.9;
const logoXY = (lx: number, ly: number, y0: number) => [cx + (lx - LCX) * LS * SCL, y0 + (ly - LCY) * LS * SCL];
const Intro = (t: number) => {
  const A = { m0: 10, m1: 30, f0: 24, f1: 32, p0: 30, p1: 44, pop: 36, gap: 0.9, r0: 200 };
  const LY = 800, [X0, Y0] = logoXY(26, 34.875, LY), u = prog(t, A.m0, A.m1) * 4, pm = easeIO(prog(t, A.p0, A.p1));
  const fa = prog(t, A.f0, A.f1), r = lerp(A.r0, 20.3125 * LS * SCL, pm), X = lerp(cx, X0, pm), Y = lerp(LY, Y0, pm), k = r / 20.3125, rot = 120 * (1 - easeIO(prog(t, A.m0, A.m1)));
  const face = prog(t, A.f0 + 4, A.f1 + 6), hit = IT("intro", "hero"), tag = IT("intro", "itag");
  const tk = pop(t, tag.a, tag.dur!), ts = 45, tx = tw(tag.text.toUpperCase(), ts, 800, "b", ts * 0.12) + ts * 1.6, th = ts * 1.9;
  return <>
    <Rings x={cx} y={LY} t={t} />
    {t < A.p1 + 1 && <g opacity={pop(t, 10, 10)}>
      <Morph names={PLAN.morph} u={u} x={X} y={Y + r * 0.18} r={r} rot={rot} sw={0} fill={`rgba(36,51,184,${fa})`} />
      <Morph names={PLAN.morph} u={u} x={X} y={Y} r={r} rot={rot} sw={Math.max(3, 6 * (1 - pm))} trail={pm < 1 && fa < 0.3 ? 3 : 0} fill={`rgba(50,72,240,${fa})`} />
      {face > 0 && <g transform={`translate(${X} ${Y}) scale(${k})`} fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={6.906}>
        <path d="M-10.5625 -1.625V3.25A10.5625 10.5625 0 0 0 10.5625 3.25V-1.625" strokeDasharray="60" strokeDashoffset={60 * (1 - face)} />
        <circle cx={-7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" transform={`scale(${pop(t, A.f0 + 8, 8)})`} /><circle cx={7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" transform={`scale(${pop(t, A.f0 + 10, 8)})`} />
      </g>}
    </g>}
    <LogoRow y={LY} t={t} a={A.pop} gap={A.gap} skipFirst={t < A.p1 + 1} scale={SCL} />
    <Kt it={hit} t={t} />
    {tk > 0 && <g transform={`translate(${tag.x} ${tag.y}) scale(${tk})`}>
      <rect x={-tx / 2} y={-th / 2 + 5} width={tx} height={th} rx={th / 2} fill="#2433b8" /><rect x={-tx / 2} y={-th / 2} width={tx} height={th} rx={th / 2} fill={C.blue} />
      <text textAnchor="middle" dominantBaseline="central" fontWeight={800} fontSize={ts} letterSpacing={ts * 0.12} fill="#fff" fontFamily={FAM.b}>{tag.text.toUpperCase()}</text>
    </g>}
  </>;
};

// ---------- end card (merged into the last scene; t = local - 114) ----------
const Outro = (t: number) => {
  const cl = easeIO(prog(t, 50, 59)), it = IT("outro", "url");
  return <g opacity={1 - cl}>
    <Rings x={cx} y={860} t={t + 114} />
    <g opacity={prog(t, 0, 6)}><LogoRow y={860} t={cl > 0 ? 24 * (1 - cl) : t} a={0} gap={0.25} scale={0.94} /></g>
    <Kt it={it} t={t} />
  </g>;
};

// ---------- feature: AI doučovač (chat: bubble, dots, answer steps with checks, green lap) ----------
const FDou = (t: number) => {
  const head = IT("doucovatel", "dh"), usr = IT("doucovatel", "du"), snt = IT("doucovatel", "ds");
  const ub = eob(prog(t, 24, 36)), grow = eob(prog(t, 58, 76), 0.8), dots = t >= 44 && t < 60;
  const aw = lerp(110, 660, grow), ah = lerp(110, 400, grow), problem = prog(t, 26, 46);
  const ux = 450, uy = 570, uw = 530, uh = 124;
  return <>
    <Rings x={cx} y={860} t={t} /><Glow />
    <Kt it={head} t={t} />
    <Cards t={t} accent="#6ee7ff" />
    {/* user bubble (blue = user action), tail points to the sender on the right */}
    <g opacity={clamp(ub * 2)} transform={`translate(${ux + uw} ${uy + uh}) scale(${lerp(0.6, 1, ub)}) translate(${-ux - uw} ${-uy - uh})`}>
      <rect x={ux} y={uy + 6} width={uw} height={uh} rx={32} fill="#2433b8" />
      <path d={`M${ux + uw - 40} ${uy + uh} L${ux + uw + 14} ${uy + uh + 30} L${ux + uw - 8} ${uy + uh - 10}Z`} fill={C.blue} />
      <rect x={ux} y={uy} width={uw} height={uh} rx={32} fill={C.blue} />
    </g>
    {problem > 0 && problem < 1 && <rect x={ux - 14 * problem} y={uy - 14 * problem} width={uw + 28 * problem} height={uh + 28 * problem} rx={32 + 14 * problem} fill="none" stroke={C.coral} strokeWidth={6} opacity={(1 - problem) * 0.9} />}
    <Kt it={usr} t={t} fill="#fff" />
    {/* AI side: three bouncing dots, then the bubble grows and shows three steps that get checked */}
    {dots && [0, 1, 2].map(i => <circle key={i} cx={150 + i * 40} cy={800 - Math.abs(Math.sin((t - i * 3) * 0.32)) * 22} r={13} fill={BRAND[PLAN.colorOrder[i]]} />)}
    {t >= 58 && <g>
      <rect x={100} y={746} width={aw} height={ah} rx={lerp(55, 32, grow)} fill="#0a0918" opacity={0.5} />
      <path d={`M${110} ${740 + ah - 18} L${86} ${740 + ah + 18} L${150} ${740 + ah - 4}Z`} fill={C.surf2} opacity={grow} />
      <rect x={100} y={740} width={aw} height={ah} rx={lerp(55, 32, grow)} fill={C.surf2} stroke={C.edge} strokeWidth={3} />
      {grow > 0.9 && [0, 1, 2].map(i => {
        const y = 810 + i * 105, a = 64 + i * 4, o = clamp(prog(t, a, a + 8)), ck = 72 + i * 7;
        return <g key={i} opacity={o}>
          <circle cx={170} cy={y} r={30} fill="none" stroke={C.edge} strokeWidth={4} />
          <Check x={170} y={y} t={t} a={ck} fill={i === 2} />
          <Bar x={225} y={y} w={430 - i * 90} />
          {i === 2 && t > ck + 6 && <circle cx={170} cy={y} r={34 + 14 * easeOut(prog(t, ck + 6, ck + 24))} fill="none" stroke={C.greenL} strokeWidth={5} opacity={1 - prog(t, ck + 6, ck + 24)} />}
        </g>;
      })}
    </g>}
    <Lap t={t} t0={82} len={30} />
    <Sent it={snt} t={t} />
  </>;
};

// ---------- feature: Fotka úlohy (magnet cursor -> click -> photo flies in with ghost trail -> five similar tasks fan out) ----------
const CHIP: [number, number] = [540, 1190], PHOTO: [number, number] = [540, 690];
const Photo: React.FC<{ x: number; y: number; s: number; o: number; txt?: boolean; t: number }> = ({ x, y, s, o, txt = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-260} y={-120} width={520} height={260} rx={22} fill="#0a0918" opacity={0.5} transform="translate(0 14)" />
    <rect x={-260} y={-130} width={520} height={260} rx={22} fill={C.cream} />
    {txt && <text x={0} y={16} textAnchor="middle" fontWeight={800} fontSize={52} fill={C.ink} fontFamily={FAM.b}>3/4 + 1/2</text>}
    <rect x={-200} y={50} width={400} height={16} rx={8} fill="#d9d4c5" />
  </g>
);
const FFoto = (t: number) => {
  const head = IT("fotka", "fh"), snt = IT("fotka", "fs");
  const cu = clamp((t - 20) / 18), cxp = lerp(930, 578, eob(cu, 1.0)), cyp = lerp(1480, 1214, eob(cu, 1.0));
  const d = Math.hypot(cxp - CHIP[0], cyp - CHIP[1]), m = t < 41 ? clamp(1 - d / 120) : 0, nx = (cxp - CHIP[0]) / (d || 1), ny = (cyp - CHIP[1]) / (d || 1);
  const press = clamp(1 - Math.abs(t - 40) / 3), dy = 6 * clamp(1 - Math.abs(t - 42) / 4);
  const fp = easeIO(prog(t, 42, 54)), px = lerp(CHIP[0], PHOTO[0], fp), py = lerp(CHIP[1], PHOTO[1], fp), ps = lerp(0.3, 1, easeOut(prog(t, 42, 54)));
  const sq = squash(t, 54, 0.2);
  const posAt = (tt: number): [number, number, number] => { const q = easeIO(prog(tt, 42, 54)); return [lerp(CHIP[0], PHOTO[0], q), lerp(CHIP[1], PHOTO[1], q), lerp(0.3, 1, easeOut(prog(tt, 42, 54)))]; };
  const chipOn = pop(t, 14, 12), chip = IT("fotka", "fc");
  return <>
    <Rings x={cx} y={860} t={t} /><Glow />
    <Kt it={head} t={t} />
    <Cards t={t} accent="#ffc933" ph={0.2} />
    {/* five similar tasks fan out of the photo */}
    {[0, 1, 2, 3, 4].map(i => {
      const a = 56 + i * 2, p = prog(t, a, a + 14), e = eob(p, 1.0); if (p <= 0) return null;
      const x = lerp(PHOTO[0], 180 + i * 180, easeOut(p)), y = lerp(PHOTO[1], 985, easeOut(p)), sp = Math.hypot(180 + i * 180 - PHOTO[0], 295) * (p < 1 ? 0.05 : 0);
      return <g key={i} transform={`translate(${x} ${y}) ${stretchAlong((180 + i * 180 - PHOTO[0]) * 0.02 * (1 - p), 295 * 0.02 * (1 - p))} scale(${lerp(0.3, 1, e)})`} opacity={clamp(p * 3)}>
        <rect x={-80} y={-64} width={160} height={150} rx={18} fill="#0a0918" opacity={0.5} />
        <rect x={-80} y={-75} width={160} height={150} rx={18} fill={C.cream} />
        <rect x={-52} y={-44} width={104} height={14} rx={7} fill="#c9c3b2" /><rect x={-52} y={-14} width={74} height={14} rx={7} fill="#d9d4c5" /><rect x={-52} y={16} width={90} height={14} rx={7} fill="#d9d4c5" />
        <g transform="translate(0 52) scale(0.8)"><Check x={0} y={0} t={t} a={74 + i * 2} r={30} color={C.green} fill /></g>
        {sp < 0 && null}
      </g>;
    })}
    {/* photo flight with ghost trail */}
    {t >= 42 && PLAN.effects.includes("ghostTrail") && t < 58 && [6, 4, 2].map((dl, j) => { const [gx, gy, gs] = posAt(t - dl); return <Photo key={j} x={gx} y={gy} s={gs} o={[0.1, 0.2, 0.35][j] * (1 - fp * 0.4)} txt={false} t={t} />; })}
    {t >= 42 && <g transform={`translate(${PHOTO[0]} ${PHOTO[1] + 130}) scale(${t >= 54 ? sq.sx : 1} ${t >= 54 ? sq.sy : 1}) translate(${-PHOTO[0]} ${-PHOTO[1] - 130})`}><g><Photo x={px} y={py} s={ps} o={clamp((t - 42) / 3)} t={t} /></g></g>}
    {/* chip: Přidat fotku */}
    <g opacity={clamp(chipOn * 2)} transform={`translate(${CHIP[0] + nx * 6 * m} ${CHIP[1] + ny * 6 * m + dy}) rotate(${3 * m * (nx > 0 ? 1 : -1)}) scale(${(1 + 0.04 * m) * chipOn})`}>
      <rect x={-274} y={-26} width={548} height={64} rx={32} fill="#2433b8" /><rect x={-274} y={-32 + (dy > 0 ? 4 : 0)} width={548} height={64} rx={32} fill={C.blue} />
      <g transform="translate(-232 0)" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round"><rect x={-26} y={-16} width={52} height={36} rx={8} /><circle cx={0} cy={2} r={10} /><path d="M-10 -16 L-6 -24 H6 L10 -16" /></g>
      <text x={chip.x - 540 + 0} y={14} textAnchor="middle" fontWeight={700} fontSize={44} fill="#fff" fontFamily={FAM.h}>{chip.text}</text>
    </g>
    <Ripple x={578} y={1214} t={t} a={40} />
    <Cursor x={cxp} y={cyp} press={press} o={t < 50 ? clamp((t - 18) / 4) : clamp(1 - (t - 50) / 6)} />
    <Lap t={t} t0={76} len={34} />
    <Sent it={snt} t={t} />
  </>;
};

// ---------- feature: Osobní plán učení (7 days fill with 15 minutes, pin drops on today, green lap) ----------
const DAYS = ["d0", "d1", "d2", "d3", "d4", "d5", "d6"], PIN: [number, number] = [262, 868];
const PinG: React.FC<{ y: number; sx?: number; sy?: number; o?: number }> = ({ y, sx = 1, sy = 1, o = 1 }) => (
  <g transform={`translate(${PIN[0]} ${PIN[1] + y}) scale(${sx} ${sy})`} opacity={o}>
    <path d="M0 0 L0 -70" stroke={C.cream} strokeWidth={7} strokeLinecap="round" />
    <circle cx={0} cy={-90} r={30} fill={C.blue} stroke="#fff" strokeWidth={4} /><circle cx={-9} cy={-99} r={8} fill="#fff" opacity={0.5} />
  </g>
);
const FPlan = (t: number) => {
  const head = IT("plan", "ph"), snt = IT("plan", "ps"), TL = 66, fallAt = (tt: number) => (tt < TL ? 600 * (1 - Math.pow(prog(tt, 54, TL), 2)) : 0), fall = fallAt(t), s = t - TL;
  const bounce = s > 0 ? -12 * Math.exp(-s / 3.5) * Math.abs(Math.sin(s * 0.55)) : 0, sq = squash(t, TL, 0.22);
  const rowY = (i: number) => 570 + i * 96;
  return <>
    <Rings x={cx} y={860} t={t} /><Glow />
    <Kt it={head} t={t} />
    <Cards t={t} accent="#7ee0b0" ph={0.5} />
    {DAYS.map((id, i) => {
      const it = IT("plan", id), y = rowY(i), fa = 34 + i * 3, f = easeOut(prog(t, fa, fa + 10)), o = clamp(pop(t, it.a, 12) * 2);
      return <g key={id} opacity={o}>
        <rect x={215} y={y - 24} width={640} height={48} rx={24} fill="#0a0918" opacity={0.55} />
        <rect x={220} y={y - 20} width={630 * f} height={40} rx={20} fill={C.blue} />
        <Check x={930} y={y} t={t} a={fa + 10} r={26} fill />
        <Kt it={it} t={t} />
      </g>;
    })}
    {t >= TL && <rect x={206} y={rowY(3) - 36} width={668} height={72} rx={36} fill="none" stroke={C.yellow} strokeWidth={5} opacity={clamp(1 - s / 30) * 0.9 + 0.1 * (s < 30 ? 0 : 1)} />}
    {/* pin: soft shadow grows as it comes, ghost copies while it falls, squash + small bounce on landing, yellow ring wave */}
    <ellipse cx={PIN[0]} cy={PIN[1] + 6} rx={lerp(34, 12, clamp(fall / 600) ** 0.5)} ry={lerp(10, 4, clamp(fall / 600) ** 0.5)} fill="#05040f" opacity={t >= 52 ? 0.55 * (1 - clamp(fall / 600) * 0.7) : 0} />
    {t >= 54 && t < TL && PLAN.effects.includes("ghostTrail") && [6, 4, 2].map((dl, j) => <PinG key={j} y={-fallAt(t - dl)} o={[0.1, 0.2, 0.35][j]} />)}
    {t >= 54 && <PinG y={-fall + bounce} sx={t >= TL ? sq.sx : 1} sy={t >= TL ? sq.sy : 1} />}
    <Ripple x={PIN[0]} y={PIN[1]} t={t} a={TL} />
    <Lap t={t} t0={70} len={36} />
    <Sent it={snt} t={t} />
  </>;
};

// ---------- the film ----------
const FEAT: Record<string, (t: number) => React.ReactNode> = { doucovatel: FDou, fotka: FFoto, plan: FPlan };
const POS = (i: number): [number, number] => [i * 1450, i % 2 ? -850 : (i % 4 === 0 ? 0 : 300)];
const camFor = (i: number) => { const q = PLAN.cams[i], len = PLAN.lens[i]; const [px, py] = POS(i);
  return (t: number) => { const u = easeIO(clamp((t - 22) / (len - 24))); return { x: px + Math.sin(t * 0.05) * 9, y: py + Math.cos(t * 0.041) * 7, s: lerp(q.s0, q.s1, u), r: q.r0 * (1 - u * 0.6) + Math.sin(t * 0.03) * 0.5 }; }; };
const lastIdx = PLAN.order.length;
const scs: Sc[] = [
  { C: Intro, len: PLAN.lens[0], k: 1, cam: camFor(0) },
  ...PLAN.order.map((f, j) => {
    const i = j + 1, Feat = FEAT[f];
    const C_ = i === lastIdx ? (t: number) => <><Exit t={t} at={104}>{Feat(t)}</Exit>{t >= 112 && Outro(t - 114)}</> : Feat;
    return { C: C_, len: PLAN.lens[i], k: 1, cam: camFor(i) } as Sc;
  }),
];
const film = createFilm(scs, "ucimepro/sfx.wav", { film: true, loop: true });
export const UCIMEPRO_FRAMES = film.frames;
export const UcimePro = film.Comp;
void WARM; void SOFT; void back; void hero;
