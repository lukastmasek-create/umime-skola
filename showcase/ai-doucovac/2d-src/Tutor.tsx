// Showcase "AI doučovač" (ucimesehrou.org/cs/pro/doucovatel, UčímePRO). Imports the finished engine (Code.tsx), effects (fx2.tsx) and depth kit (depth.tsx).
// Everything random comes from ONE seed (tutorPlan.ts): scene order, effects, intro morphs, katana angle, cut word, ...
import React from "react";
import { W, H, prog, easeOut, easeIO, lerp, pop, clamp } from "./kit";
import { KText, Morph, Tag, Rings, LogoRow, C, FAM, MONO, BRAND, SOFT, WARM, tw, back, createFilm } from "./Code";
import type { Sc, Cam } from "./Code";
import { Card3D } from "./depth";
import { PixelMorph, rasterCells, Squash, stretchAlong, PageRead, DollyZoom, Sparks, sparksFromWord, sparkCam, Katana, Cursor, Ripple, lerpPath, rnd } from "./fx2";
import type { Spark, Cell } from "./fx2";
import { pickScenes, pickEffects, metaFor, details, sparkTime, T } from "./tutorPlan";
import type { SceneDef, Effect } from "./tutorPlan";

const cx = W / 2;
type Pt = [number, number];
const CYAN = "#6ee7ff";
const NOP = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

// ---------- real texts (cs, src/i18n/pro-tools.ts + pro-extra.ts) ----------
const TXT = {
  placeholder: "Zeptej se na úlohu nebo látku…", attach: "Přidat fotku", send: "Odeslat", thinking: "Přemýšlím…",
  benefit: "Neřekne ti výsledek, dovede tě k němu.",
  url: "ucimesehrou.org/cs/pro/doucovatel",
};

// ---------- small shared drawings ----------
const CameraIcon: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.cream }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-34 -18 H-16 L-10 -30 H10 L16 -18 H34 A8 8 0 0 1 42 -10 V24 A8 8 0 0 1 34 32 H-34 A8 8 0 0 1 -42 24 V-10 A8 8 0 0 1 -34 -18Z" /><circle cx={0} cy={6} r={14} />
  </g>
);
const Dots: React.FC<{ x: number; y: number }> = ({ x, y }) => <>{[C.coral, C.yellow, C.green].map((c, i) => <circle key={i} cx={x + i * 30} cy={y} r={9} fill={c} />)}</>;
const Photo: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; scan?: number; read?: number }> = ({ x, y, w, h, rot = 0, scan = 0, read = 0 }) => (
  <g transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${rot}) translate(${-x - w / 2} ${-y - h / 2})`}>
    <rect x={x + 6} y={y + 10} width={w} height={h} rx={14} fill="#05040f" opacity={0.6} />
    <rect x={x} y={y} width={w} height={h} rx={14} fill={C.paper} stroke="#d9d4c5" strokeWidth={3} />
    {[0.3, 0.55, 0.8].map((q, i) => <line key={i} x1={x + 24} x2={x + w - 24} y1={y + h * q + 30} y2={y + h * q + 30} stroke="#c9c4d8" strokeWidth={3} />)}
    {read > 0 && <rect x={x + 18} y={y + 30} width={(w - 36) * easeOut(read)} height={76} rx={10} fill={C.yellow} opacity={0.55} />}
    <text x={x + w / 2} y={y + 98} textAnchor="middle" fontFamily={FAM.h} fontWeight={800} fontSize={44} fill={C.ink}>1/2 + 1/3 = ?</text>
    {scan > 0 && scan < 1 && <g><rect x={x} y={y + (h - 6) * scan} width={w} height={8} rx={4} fill={C.yellow} style={{ filter: WARM }} /></g>}
  </g>
);
const Check: React.FC<{ x: number; y: number; r: number; t: number; a: number; col?: string }> = ({ x, y, r, t, a, col = C.greenL }) => {
  const k = pop(t, a, 10), p = prog(t, a + 2, a + 14);
  if (k <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={r} fill={C.surf} stroke={col} strokeWidth={6} />
    <path d={`M${-r * 0.42} ${r * 0.02} L${-r * 0.1} ${r * 0.34} L${r * 0.46} ${-r * 0.3}`} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset={80 * (1 - p)} />
  </g>;
};
const Ring: React.FC<{ x: number; y: number; t: number; a: number; col?: string }> = ({ x, y, t, a, col = C.yellow }) => {
  const p = prog(t, a, a + 22);
  return p > 0 && p < 1 ? <circle cx={x} cy={y} r={40 + 300 * easeOut(p)} fill="none" stroke={col} strokeWidth={5} opacity={(1 - p) * 0.8} /> : null;
};

// glyph centres of a word as KText lays it out (needed for sparks)
const glyphs = (text: string, size: number, f: "h" | "b" | "p", wt: number, x: number, y: number): Pt[] => {
  let px = x - tw(text, size, wt, f) / 2; const out: Pt[] = [];
  for (const c of text) { const w = tw(c, size, wt, f); if (c !== " ") out.push([px + w / 2, y - size * 0.3]); px += w; }
  return out;
};

// ---------- the video factory ----------
export const makeTutor = (seed: number, name: string) => {
  const fx: Set<Effect> = pickEffects(seed), D = details(seed), M = metaFor(fx);
  const sq = fx.has("squash"), SQ: React.FC<{ t: number; t0: number; px: number; py: number; children: React.ReactNode }> = sq ? Squash : (({ children }) => <>{children}</>);
  const SLOTY = 848, BUBX = 700;

  // ===== logoMorph: object -> logo (own intro with random morph list and no "Díl" tag; same recipe as IntroScene) =====
  const intro = (names: string[]) => (t: number) => {
    const A = { m0: 12, m1: 36, f0: 30, f1: 40, p0: 36, p1: 52, pop: 42, gap: 1.0, r0: 200 };
    const LY = 800, LS = 1.06, LCX = 473.75, LCY = 55.7, X0 = cx + (26 - LCX) * LS, Y0 = LY + (34.875 - LCY) * LS;
    const u = prog(t, A.m0, A.m1) * (names.length - 1), pm = easeIO(prog(t, A.p0, A.p1));
    const fa = prog(t, A.f0, A.f1), r = lerp(A.r0, 20.3125 * LS, pm), X = lerp(cx, X0, pm), Y = lerp(LY, Y0, pm), k = r / 20.3125, rot = 120 * (1 - easeIO(prog(t, A.m0, A.m1)));
    const face = prog(t, A.f0 + 4, A.f1 + 6);
    return <>
      <Rings x={cx} y={LY} t={t} />
      {t < A.p1 + 1 && <g opacity={pop(t, 10, 10)}>
        <Morph names={names} u={u} x={X} y={Y + r * 0.18} r={r} rot={rot} sw={0} fill={`rgba(36,51,184,${fa})`} />
        <Morph names={names} u={u} x={X} y={Y} r={r} rot={rot} sw={Math.max(3, 6 * (1 - pm))} trail={pm < 1 && fa < 0.3 ? 3 : 0} fill={`rgba(50,72,240,${fa})`} />
        {face > 0 && <g transform={`translate(${X} ${Y}) scale(${k})`} fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={6.906}>
          <path d="M-10.5625 -1.625V3.25A10.5625 10.5625 0 0 0 10.5625 3.25V-1.625" strokeDasharray="60" strokeDashoffset={60 * (1 - face)} />
          <circle cx={-7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" transform={`scale(${pop(t, A.f0 + 8, 8)})`} /><circle cx={7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" transform={`scale(${pop(t, A.f0 + 10, 8)})`} />
        </g>}
      </g>}
      <LogoRow y={LY} t={t} a={A.pop} gap={A.gap} skipFirst={t < A.p1 + 1} />
      <Tag text="UčímePRO" x={cx} y={1050} t={t} a={A.pop + 8} kind="gold" size={30} />
      <KText id="ti0" text="AI doučovač" x={cx} y={1210} size={104} t={t} a={A.pop - 6} f="h" wt={800} mode="rise" st={1} maxW={940} />
      <KText id="ti1" text="krok za krokem." x={cx} y={1360} size={120} t={t} a={A.pop + 4} f="p" mode="rise" st={1.2} glow="neon" fill="#f2fbff" maxW={940} />
    </>;
  };

  // ===== katanaCut: the question card is sliced, a corner chips off =====
  const katana = (t: number) => {
    const A = D.A, B = D.B, tc = T.katanaCut, X = 110, Y = 640, CW = 860, CH = 520;
    // corner that lies on the half the katana chips (b half = side (dy,-dx)); the preferred corner is rotated until it is on that side
    const corners: Pt[] = [[X + CW, Y], [X + CW, Y + CH], [X, Y + CH], [X, Y]];
    const inB = (p: Pt) => (B[1] - A[1]) * (p[0] - A[0]) - (B[0] - A[0]) * (p[1] - A[1]) > 0;
    let ci = D.corner; for (let j = 0; j < 4 && !inB(corners[ci]); j++) ci = (ci + 1) % 4;
    const c = corners[ci], sx = c[0] < cx ? 1 : -1, sy = c[1] < Y + CH / 2 ? 1 : -1;
    const chip: Pt[] = [c, [c[0] + sx * 190, c[1]], [c[0], c[1] + sy * 150]];
    const kp = clamp(pop(t, 8, 12));
    const card = <g opacity={clamp(kp * 1.6)}>
      <Card3D x={X} y={Y} w={CW} h={CH} z={0.95} t={t} tilt={0.05} lift={0.7} accent={CYAN} runPhase={0.15}>
        <Dots x={X + 44} y={Y + 44} />
        <text x={cx} y={Y + 360} textAnchor="middle" fontFamily={FAM.p} fontSize={D.word.length > 5 ? 190 : 230} fill="#f2fbff" style={{ filter: "drop-shadow(0 0 8px #6ee7ff) drop-shadow(0 0 22px #2ab7ff)" }}>{D.word}</text>
      </Card3D>
    </g>;
    const cutObj = <Katana t={t} tc={tc} A={A} B={B} chip={chip} id="tk">{card}</Katana>;
    return <>
      {fx.has("dollyZoom")
        ? <DollyZoom t={t} a={16} b={tc - 2} cx={cx} cy={Y + CH / 2} amount={0.14} fg={cutObj} bg={<Rings x={cx} y={900} t={t} />} />
        : <><Rings x={cx} y={900} t={t} />{cutObj}</>}
      <KText id="kt0" text="Nevíš si rady?" x={cx} y={400} size={120} t={t} a={8} f="p" mode="rise" st={1} glow="neon" fill="#f2fbff" />
    </>;
  };

  // ===== sparkChat: letters of the cut word turn into sparks, fly into a chat, land in slots, bubble grows, sentence, tutor bubble from dots =====
  let sparkCache: Spark[] | null = null;
  const WS = D.word.length > 5 ? 190 : 230, WY = 420;
  const sparkList = (): Spark[] => {
    if (sparkCache) return sparkCache;
    const xs = glyphs(D.word, WS, "p", 400, cx, WY), n = xs.length;
    const slots: Pt[] = Array.from({ length: n }, (_, i) => [BUBX - 20 + (i - (n - 1) / 2) * 62, SLOTY]);
    sparkCache = sparksFromWord(xs, slots, T.spark0).map((s, i) => { const st = sparkTime(i); return { ...s, a: st.a, dur: st.dur }; });
    return sparkCache;
  };
  const sparkChat = (t: number) => {
    const list = sparkList(), n = list.length, last = Math.max(...list.map(s => s.a + s.dur));
    const b0 = last - 4, b1 = last + 10, grow = easeOut(prog(t, b0, b1)), tutorA = b1 + 6, dots = t >= tutorA && t < tutorA + 12;
    const tg = easeOut(prog(t, tutorA + 8, tutorA + 22));
    return <>
      <Rings x={cx} y={900} t={t} />
      {t < T.spark0 + 6 && <KText id="sw" text={D.word} x={cx} y={WY} size={WS} t={t} a={0} f="p" mode="pop" st={0} glow="neon" fill="#f2fbff" o={1 - prog(t, T.spark0 - 1, T.spark0 + 5)} />}
      <KText id="sn" text="Napiš, s čím si nevíš rady." x={cx} y={560} size={48} t={t} a={6} mode="rise" st={1} wt={600} fill={C.muted} glow="none" o={1 - prog(t, T.spark0, T.spark0 + 8)} />
      <Card3D x={60} y={680} w={960} h={840} z={0.8} t={t} tilt={-0.05} lift={0.5} accent={C.yellow} runPhase={0.5} o={clamp(pop(t, 4, 12) * 1.5)}>
        <Dots x={104} y={724} />
        {/* slots where the sparks land */}
        {grow < 0.4 && list.map((s, i) => { const ar = t >= s.a + s.dur; return <g key={i} opacity={1 - grow * 2.5}>
          <circle cx={s.x1} cy={s.y1} r={ar ? 17 : 15} fill={ar ? C.yellow : "none"} stroke={C.yellow} strokeWidth={3} strokeDasharray={ar ? undefined : "5 6"} opacity={ar ? 1 : 0.55} />
          {ar && t < s.a + s.dur + 18 && <circle cx={s.x1} cy={s.y1} r={20 + 70 * easeOut(prog(t, s.a + s.dur, s.a + s.dur + 18))} fill="none" stroke={C.yellow} strokeWidth={4} opacity={1 - prog(t, s.a + s.dur, s.a + s.dur + 18)} />}
        </g>; })}
        {/* user bubble grows out of the landed sparks */}
        {t >= b0 && <Morph names={["circle", "sq"]} u={grow} x={BUBX - 20} y={SLOTY} sx={lerp(40, 290, grow)} sy={lerp(40, 66, grow)} sw={0} fill={C.blue} glow="none" o={clamp(grow * 4)} />}
        {sq && t >= b0 && <></>}
        <KText id="su" text="Nerozumím zlomkům." x={BUBX - 20} y={SLOTY + 17} size={50} t={t} a={b1 - 4} mode="rise" st={1} fill="#fff" glow="none" maxW={540} />
        {/* tutor: dots -> bubble */}
        {dots && [0, 1, 2].map(i => <circle key={i} cx={150 + i * 34} cy={1060 - Math.abs(Math.sin((t - i * 3) * 0.4)) * 16} r={10} fill={BRAND[i + 1]} />)}
        {t >= tutorA + 8 && <Morph names={["circle", "sq"]} u={tg} x={400} y={1090} sx={lerp(40, 330, tg)} sy={lerp(40, 105, tg)} sw={4} stroke={C.edge} fill={C.surf2} glow="none" o={clamp(tg * 4)} />}
        <KText id="st0" text="Pojď na to" x={400} y={1090} size={52} t={t} a={tutorA + 18} mode="rise" st={1} glow="none" maxW={600} />
        <KText id="st1" text="po krocích." x={400} y={1150} size={52} t={t} a={tutorA + 22} mode="rise" st={1} glow="none" fill={C.yellow} maxW={600} />
      </Card3D>
      <Sparks t={t} list={list} />
    </>;
  };
  const sparkCamBuilder = (i: number) => (t: number): Cam => {
    const px = i * 1450, py = i % 2 ? -850 : (i % 4 === 0 ? 0 : 300), list = sparkList(), s = list[0];
    const home: Cam = { x: px + Math.sin(t * 0.05) * 9, y: py + Math.cos(t * 0.041) * 7, s: 1.05, r: 0 };
    const last = s.a + s.dur, e = easeIO(prog(t, s.a - 2, s.a + 6)) * (1 - easeIO(prog(t, last - 4, last + 12)));
    const c = sparkCam(s, t), tx = c.x + px - cx, ty = c.y + py - H / 2;
    return { x: lerp(home.x, tx, e), y: lerp(home.y, ty, e), s: lerp(home.s, c.s, e), r: lerp(home.r, c.r, e) };
  };

  // ===== feature_photo: attach a photo of the task, send, the tutor reads it =====
  const photo = (t: number) => {
    const c0 = T.photoClick0, c1 = T.photoClick1, fl = prog(t, T.photoFly, T.photoLand), fe = easeIO(fl);
    const pts1: Pt[] = [[900, 1700], [330, 1430]], pts2: Pt[] = [[330, 1430], [860, 1430]];
    const [cxA, cyA] = t < c0 + 4 ? lerpPath(pts1, prog(t, 12, c0)) : lerpPath(pts2, prog(t, c0 + 6, c1));
    const press = clamp(1 - Math.abs(t - c0) / 3) + clamp(1 - Math.abs(t - c1) / 3);
    const phx = lerp(100, 520, fe), phy = lerp(1000, 650, fe) - Math.sin(Math.PI * fl) * 90, vx = (420 / 12), vy = -(350 / 12);
    const sent = t >= T.photoFly, thumb = t >= c0 + 2;
    const scan = prog(t, T.photoLand + 2, T.photoLand + 16), read = prog(t, T.photoLand + 14, T.photoLand + 24);
    return <>
      <Rings x={cx} y={900} t={t} />
      <KText id="p0" text="Vyfoť úlohu." x={cx} y={330} size={128} t={t} a={12} f="p" mode="rise" st={1} glow="neon" fill="#f2fbff" />
      <KText id="p1" text="Doučovač ji přečte." x={cx} y={470} size={92} t={t} a={T.photoLand + 2} f="p" mode="rise" st={1} glow="neon" fill={C.yellow} />
      <Card3D x={60} y={560} w={960} h={600} z={0.35} t={t} tilt={0.06} lift={0.2} accent="#5a6cff" runPhase={0.2} o={pop(t, 6, 12)}>
        <Dots x={104} y={604} />
      </Card3D>
      {/* the sent photo lands in the chat */}
      {sent && <SQ t={t} t0={T.photoLand} px={730} py={850}>
        <g transform={fl > 0 && fl < 1 ? `translate(${phx + 210} ${phy + 100}) ${stretchAlong(vx, vy, 0.01)} translate(${-phx - 210} ${-phy - 100})` : undefined}>
          <Photo x={phx} y={phy} w={420} h={200} rot={lerp(-5, 2, fe)} scan={scan} read={read} />
        </g>
      </SQ>}
      {t > T.photoLand + 24 && <g opacity={pop(t, T.photoLand + 24, 8)}><circle cx={190} cy={800} r={0} /><Check x={470} y={770} r={42} t={t} a={T.photoLand + 26} /></g>}
      {/* input bar */}
      <Card3D x={60} y={1210} w={960} h={330} z={1} t={t} tilt={0.04} lift={0.8} accent={CYAN} runPhase={0.7} o={clamp(pop(t, 8, 12) * 1.5)}>
        <rect x={90} y={1240} width={900} height={84} rx={22} fill={C.bg} stroke={C.edge} strokeWidth={3} />
        <text x={120} y={1296} fontFamily={FAM.b} fontWeight={600} fontSize={44} fill={C.faint}>{TXT.placeholder}</text>
        <g transform={`translate(0 ${t >= c0 && t < c0 + 8 ? 6 : 0})`}>
          <rect x={90} y={1356} width={450} height={100} rx={28} fill={C.surf2} stroke={C.edge} strokeWidth={3} />
          <CameraIcon x={160} y={1408} s={0.95} />
          <text x={222} y={1423} fontFamily={FAM.b} fontWeight={800} fontSize={44} fill={C.cream}>{TXT.attach}</text>
        </g>
        <g transform={`translate(0 ${t >= c1 && t < c1 + 8 ? 6 : 0})`}>
          <rect x={720} y={1362} width={270} height={100} rx={28} fill="#2433b8" />
          <rect x={720} y={1356} width={270} height={100} rx={28} fill={C.blue} />
          <text x={855} y={1421} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={44} fill="#fff">{TXT.send}</text>
        </g>
      </Card3D>
      {/* thumbnail above the bar, before sending */}
      {thumb && !sent && <SQ t={t} t0={c0 + 2} px={310} py={1200}><Photo x={100} y={1000} w={420} h={200} rot={-5} /></SQ>}
      <Ripple x={310} y={1406} t={t} a={c0} /><Ripple x={855} y={1406} t={t} a={c1} />
      <Cursor x={cxA} y={cyA} press={clamp(press)} o={clamp(prog(t, 10, 16)) * (1 - prog(t, c1 + 8, c1 + 14))} />
    </>;
  };

  // ===== feature_steps: the tutor gives steps, the last one is yours =====
  const steps = (t: number) => {
    const rows: [string, string][] = [["1", "1/2 = 3/6"], ["2", "1/3 = 2/6"], ["3", "3/6 + 2/6 ="]], Y0 = 590, DY = 240;
    const ans = "5/6".slice(0, Math.max(0, Math.floor((t - T.stepType) / 3) + 1)), ok = t >= T.stepOk;
    return <>
      <Rings x={cx} y={900} t={t} />
      <KText id="s0" text="Žádný hotový" x={cx} y={290} size={120} t={t} a={12} f="p" mode="rise" st={1} glow="neon" fill="#f2fbff" />
      <KText id="s1" text="výsledek." x={cx} y={430} size={140} t={t} a={22} f="p" mode="drop" st={1.2} glow="neon" fill={C.yellow} />
      {rows.map(([n, eq], i) => {
        const a = T.stepLand[i], y = Y0 + i * DY, e = easeOut(prog(t, a, a + 14)), off = (1 - e) * (i % 2 ? 700 : -700), last = i === 2;
        return <g key={i} transform={`translate(${off} 0)`} opacity={clamp(prog(t, a - 4, a + 2))}>
          <SQ t={t} t0={a + 14} px={cx} py={y + 200}>
            <Card3D x={90} y={y} w={900} h={200} z={0.55 + i * 0.2} t={ok && last ? (t - T.stepOk) * 2.2 : t + i * 30} tilt={i % 2 ? -0.08 : 0.08} lift={0.4 + i * 0.1} accent={ok && last ? C.greenL : [CYAN, "#5a6cff", C.yellow][i]} runPhase={ok && last ? 0 : i * 0.3}>
              <circle cx={170} cy={y + 100} r={48} fill={BRAND[(D.logoOrder[i]) % 4]} /><text x={170} y={y + 120} textAnchor="middle" fontFamily={FAM.h} fontWeight={800} fontSize={52} fill={BRAND[D.logoOrder[i] % 4] === C.yellow ? C.ink : "#fff"}>{n}</text>
              <text x={250} y={y + 126} fontFamily={FAM.h} fontWeight={800} fontSize={58} fill={C.cream}>{eq}</text>
              {last && <>
                <rect x={770} y={y + 50} width={190} height={100} rx={20} fill={ok ? "rgba(23,168,100,.25)" : "none"} stroke={ok ? C.greenL : C.yellow} strokeWidth={4} strokeDasharray={ok ? undefined : "10 8"} opacity={ok ? 1 : 0.6 + 0.4 * Math.sin(t * 0.3)} />
                {!ans && <text x={865} y={y + 128} textAnchor="middle" fontFamily={FAM.h} fontWeight={800} fontSize={70} fill={C.yellow}>?</text>}
                <text x={865} y={y + 122} textAnchor="middle" fontFamily={FAM.h} fontWeight={800} fontSize={58} fill={ok ? C.greenL : C.cream}>{ans}</text>
              </>}
            </Card3D>
          </SQ>
        </g>;
      })}
      <Ring x={865} y={Y0 + 2 * DY + 100} t={t} a={T.stepOk} col={C.greenL} />
      <Check x={975} y={Y0 + 2 * DY + 4} r={44} t={t} a={T.stepOk + 2} />
      {fx.has("pageRead")
        ? <PageRead x={90} y={1400} width={900} text={TXT.benefit} size={48} t={t} a={44} wpf={0.22} focus={[1, 5]} />
        : <>
          <KText id="sb0" text="Neřekne ti výsledek," x={cx} y={1410} size={56} t={t} a={42} mode="rise" st={1} glow="none" />
          <KText id="sb1" text="dovede tě k němu." x={cx} y={1480} size={56} t={t} a={50} mode="rise" st={1} glow="none" fill={C.yellow} />
        </>}
    </>;
  };

  // ===== finale: title pixels -> UčímePRO, hero line, real logo, url (last 24 frames play the intro backwards when endLoop) =====
  let CA: Cell[] | null = null, CB: Cell[] | null = null;
  const cellsA = () => CA || (CA = rasterCells(800, 170, 8, g => { g.fillStyle = "#f6f1e4"; g.font = "800 110px Onest"; g.textAlign = "center"; g.fillText("AI doučovač", 400, 125); }));
  const cellsB = () => CB || (CB = rasterCells(800, 170, 8, g => { g.fillStyle = "#ffc933"; g.font = "800 110px Onest"; g.textAlign = "center"; g.fillText("UčímePRO", 400, 125); }));
  const finaleLen = M.kit.finale.len;
  const finale = (t: number, closing?: (t: number) => React.ReactNode) => {
    const tEnd = 12 + finaleLen - 1, lp = fx.has("endLoop") ? easeIO(clamp((t - (tEnd - 23)) / 23)) : 0;
    return <>
      <g opacity={1 - clamp(lp / 0.35)}>
        <Rings x={cx} y={640} t={t} />
        {fx.has("pixelMorph")
          ? <PixelMorph A={cellsA()} B={cellsB()} ax={140} ay={500} bx={140} by={500} p={prog(t, 16, 44)} cell={8} />
          : <><KText id="f0" text="AI doučovač" x={cx} y={640} size={110} t={t} a={14} f="h" mode="pop" st={2} /><Tag text="UčímePRO" x={cx} y={735} t={t} a={34} kind="gold" size={30} /></>}
        <KText id="f1" text="Zeptej se" x={cx} y={950} size={150} t={t} a={28} f="p" mode="scatter" st={2} seed={31} glow="neon" fill="#f2fbff" />
        <KText id="f2" text="doučovače." x={cx} y={1100} size={150} t={t} a={36} f="p" mode="scatter" st={2} seed={37} glow="neon" fill={C.yellow} />
        <LogoRow y={1290} t={t} a={50} gap={0.9} scale={0.92} />
        <KText id="f3" text={TXT.url} x={cx} y={1450} size={50} t={t} a={64} mode="rise" st={0.8} fill={C.cream} maxW={940} />
      </g>
      {lp > 0.3 && <g opacity={clamp((lp - 0.3) * 3)}>{intro(D.morphs)(12 + 72 * (1 - lp))}</g>}
    </>;
  };

  // ===== assemble =====
  const kit: Record<string, SceneDef<(t: number) => React.ReactNode>> = {
    logoMorph: { ...M.kit.logoMorph, C: intro(D.morphs) },
    katanaCut: { ...M.kit.katanaCut, C: katana },
    sparkChat: { ...M.kit.sparkChat, C: sparkChat },
    finale: { ...M.kit.finale, C: (t: number) => finale(t) },
  };
  const feats = M.features.map(f => ({ ...f, weight: f.id.endsWith(D.first) ? 3 : 1, C: f.id === "feature_photo" ? photo : steps }));
  const order = pickScenes(kit, feats, [], seed, 15);
  const scenes: Sc[] = order.map((s, i) => {
    const sc: Sc = { C: s.C, len: s.len, k: s.k };
    if (s.id === "logoMorph") sc.fy = -80;
    if (s.id === "sparkChat" && fx.has("sparkChase")) sc.cam = sparkCamBuilder(i);
    if (s.id === "finale" && fx.has("endLoop")) { const px = i * 1450, py = i % 2 ? -850 : (i % 4 === 0 ? 0 : 300); sc.cam = (): Cam => ({ x: px, y: py - 73, s: 1, r: 0 }); }   // equals frame 0 of the intro hold
    return sc;
  });
  const film = createFilm(scenes, `${name}/sfx.wav`, { film: fx.has("filmLook"), loop: fx.has("endLoop") });
  return { ...film, scenes: order.map(s => s.id), effects: [...fx], seed };
};
