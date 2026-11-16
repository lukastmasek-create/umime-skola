// ucimesehrou.org/tymy showcase: 3 landscape parts (1920x1080, 30 fps). Timeline comes from tymyPlan.ts (one source for picture, sound, lint).
// The portrait engine createFilm (1080x1920, fades, POS grid) is NOT used: this file carries its own landscape film wrapper
// (one camera track sampled once per frame, one world, backdrop in screen space) and reuses Code.tsx fonts/logo/Morph, fx2 Cursor/Ripple.
import React, {useMemo} from "react";
import {Audio, staticFile, useCurrentFrame} from "remotion";
import {FontGate, Morph, tw, back, FAM, C} from "./Code";
import {LOGO_PARTS} from "./logo";
import {Cursor, Ripple} from "./fx2";
import {prog, easeIO, lerp, clamp} from "./kit";
import {
  StudioBackdrop, StudioCard, STUDIO, cardArrival, cardExit, sharedCardPose, clickMotion, magnetPose, typeState, textPose,
  textExitPose, bubblePose, dotPose, ResultMark, resultLap, createCameraTrack, stageTransform, smooth, phase, type Span, type CardRect,
} from "./studioMotion";
import {PARTS, WORLD_X, FPS, blurFor, caFor, type Item, type PartPlan} from "./tymyPlan";

const INK = STUDIO.ink, CREAM = STUDIO.cream, YEL = STUDIO.yellow, BLUE = "#3248f0", BLUE_D = "#2433b8", EDGE = "#8179A8";
const MUTE_INK = "#46415f", SOFT_FILL = "rgba(255,255,255,.07)";
const GLOW = "drop-shadow(0 0 10px rgba(110,231,255,.12)) drop-shadow(0 0 28px rgba(42,183,255,.07))"; // cream words only; the yellow accent word stays unglowed for 7:1 contrast
const S_LOGO = 1.5, LCX = 473.75, LCY = 55.7;

// ---------------- helpers ----------------
const item = (p: PartPlan, id: string): Item => { const it = p.items.find((i) => i.id === id); if (!it) throw new Error("missing item " + id); return it; };
const W = (it: Pick<Item, "text" | "size" | "wt" | "fam" | "sp">) => tw(it.text, it.size, it.wt, it.fam, it.sp ?? 0);

/** text drawn in a local frame whose origin is at screen (ox, oy) */
const Txt: React.FC<{it: Item; ox?: number; oy?: number; fill: string; text?: string; o?: number}> = ({it, ox = 0, oy = 0, fill, text, o = 1}) => (
  <text x={it.x - ox} y={it.y - oy} textAnchor={it.anchor} fontFamily={FAM[it.fam]} fontWeight={it.wt} fontSize={it.size} fill={fill}
    letterSpacing={it.sp ?? 0} opacity={o} style={{whiteSpace: "pre"}}>{text ?? it.text}</text>
);

const Pill: React.FC<{x: number; y: number; w: number; h: number; fill: string; lip?: string; o?: number; children?: React.ReactNode}> = ({x, y, w, h, fill, lip, o = 1, children}) => (
  <g opacity={o}>
    {lip && <rect x={x} y={y + 7} width={w} height={h} rx={h / 2} fill={lip} />}
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
    {children}
  </g>
);

const Bubble: React.FC<{x: number; y: number; w: number; h: number; fill: string; side: "left" | "right"}> = ({x, y, w, h, fill, side}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={32} fill={fill} />
    {side === "left"
      ? <path d={`M ${x + 6} ${y + h - 30} L ${x - 20} ${y + h + 8} L ${x + 40} ${y + h - 6} Z`} fill={fill} />
      : <path d={`M ${x + w - 6} ${y + h - 30} L ${x + w + 20} ${y + h + 8} L ${x + w - 40} ${y + h - 6} Z`} fill={fill} />}
  </g>
);

// ---------------- shared card that keeps one identity from setup to result ----------------
type Ctx = {f: number; p: PartPlan};
const ChainCard: React.FC<{f: number; p: PartPlan; nodes: React.ReactNode[]}> = ({f, p, nodes}) => {
  const {stages, transfers, card} = p, tr = transfers[0];
  const active = f >= tr.start && f < tr.end;
  const idx = f >= tr.end ? 1 : 0;
  const pose = sharedCardPose(f, tr.start, tr.end - tr.start, stages[0].rect, stages[1].rect, 24, stages[0].tone, stages[1].tone);
  let rect: CardRect = active ? {x: pose.x, y: pose.y, width: pose.width, height: pose.height} : stages[idx].rect;
  let tone = active ? pose.tone : stages[idx].tone, lift = active ? pose.lift : 0, shell = active ? pose.shellTransform : "";
  let ox = 0, oy = 0, op = 1;
  if (f < tr.start) {
    const a = cardArrival(f, card.arrival.start, card.arrival.end - card.arrival.start, 60, [rect.width / 2, rect.height / 2]);
    oy = a.y; op = a.opacity; lift = a.lift; shell = a.shellTransform;
  }
  if (f >= card.exit.start) {
    const e = cardExit(f, card.exit, card.exitTravel, [rect.width / 2, rect.height / 2]);
    ox = e.x; oy = e.y; op = e.opacity; lift = e.lift; shell = e.shellTransform;
  }
  if (op <= 0.003) return null;
  const oldO = active ? pose.oldOpacity : idx === 0 ? 1 : 0, newO = active ? pose.newOpacity : idx === 1 ? 1 : 0;
  const oldY = active ? pose.oldY : 0, newY = active ? pose.newY : 0;
  return (
    <>
      <g opacity={op * 0.5} transform={`translate(${ox - 30} ${oy - 24})`}>
        <StudioCard {...rect} depth={0.3} lift={0} tone={Math.min(1, tone * 0.15)} />
      </g>
      <g opacity={op} transform={`translate(${ox} ${oy})`}>
        <StudioCard {...rect} depth={1} lift={lift} tone={tone} shellTransform={shell}>
          {oldO > 0.002 && <g opacity={oldO} transform={`translate(0 ${oldY})`}>{nodes[0]}</g>}
          {newO > 0.002 && <g opacity={newO} transform={`translate(0 ${newY})`}>{nodes[1]}</g>}
        </StudioCard>
      </g>
    </>
  );
};

// ---------------- cursor logic shared by all parts ----------------
function cursorAt(p: PartPlan, f: number) {
  const cl = p.cursor.clicks;
  let i = cl.findIndex((c) => f < c.frame + 9);
  if (i < 0) i = cl.length - 1;
  const from = i === 0 ? p.cursor.from : cl[i - 1].target;
  const c = cl[i];
  return {i, id: c.id, ...clickMotion(f, c.frame, from, c.target, c.approach, c.lead, 3, 6)};
}
const pressFor = (p: PartPlan, f: number, id: string) => {
  const cur = cursorAt(p, f);
  const c = p.cursor.clicks.find((x) => x.id === id)!;
  // pose for a control: use the cursor only while it is the active click, otherwise a parked far-away cursor
  return cur.id === id ? magnetPose(cur, c.target) : "";
};

// ---------------- stage content: part 1 (create team) ----------------
const FormNode: React.FC<Ctx> = ({f, p}) => {
  const A = p.stages[0].rect, ox = A.x, oy = A.y;
  const typ = typeState(f, p.typing!.span, p.typing!.text, "cs", 16);
  const typed = item(p, "typed"), ph = "Název (třeba 5. B – matematika)";
  const boxClick = p.cursor.clicks[0], btn = p.cursor.clicks[1];
  const tick = smooth(phase(f, {start: boxClick.frame, end: boxClick.frame + 8}));
  const focus = f >= p.typing!.span.start && f < btn.frame;
  const caretX = typed.x - ox + W({...typed, text: typ.text});
  return (
    <g>
      <Txt it={item(p, "form-title")} ox={ox} oy={oy} fill={CREAM} />
      <rect x={40} y={140} width={A.width - 80} height={104} rx={26} fill={SOFT_FILL} stroke={focus ? BLUE : EDGE} strokeWidth={focus ? 4 : 3} strokeOpacity={focus ? 1 : 0.55} />
      {typ.text === "" ? <text x={72} y={210} fontFamily={FAM.b} fontWeight={600} fontSize={52} fill={CREAM} opacity={0.5}>{ph}</text> : <Txt it={typed} ox={ox} oy={oy} fill={CREAM} text={typ.text} />}
      {typ.caret && <rect x={caretX + 4} y={166} width={4} height={56} rx={2} fill={YEL} />}
      <g transform={`translate(72 328)`}><g transform={pressFor(p, f, "checkbox")}>
        <rect x={-32} y={-32} width={64} height={64} rx={16} fill={tick > 0 ? BLUE : "none"} stroke={tick > 0 ? BLUE : EDGE} strokeWidth={4} />
        <path d="M -14 0 L -4 11 L 15 -11" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} opacity={tick > 0 ? 1 : 0} />
      </g></g>
      <Txt it={item(p, "check-1")} ox={ox} oy={oy} fill={CREAM} />
      <Txt it={item(p, "check-2")} ox={ox} oy={oy} fill={CREAM} />
      <g transform={`translate(220 502)`}><g transform={pressFor(p, f, "vytvorit")}>
        <Pill x={-180} y={-52} w={360} h={104} fill={BLUE} lip={BLUE_D}>
          <text x={180 - 180} y={18} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill="#fff">Vytvořit</text>
        </Pill>
      </g></g>
    </g>
  );
};

const ResultFrame: React.FC<Ctx & {children: React.ReactNode; rect: CardRect}> = ({f, p, children, rect}) => {
  const lap = resultLap(f, p.result.reveal, p.result.lap.end - p.result.lap.start);
  return (
    <g>
      {children}
      <rect x={2} y={2} width={rect.width - 4} height={rect.height - 4} rx={34} fill="none" stroke={STUDIO.green} strokeWidth={7} pathLength={1} strokeDasharray=".17 .83" strokeDashoffset={lap.offset} opacity={lap.opacity} />
      <g transform={`translate(${rect.width - 92} 92) scale(2.1)`}>
        <ResultMark frame={f} reveal={p.result.reveal} pulseSpan={p.result.pulse} checkSpan={p.result.check} />
      </g>
    </g>
  );
};

const BADGE = ["#3248f0", "#ff5a3c", "#17a864", "#29a3ff", "#8b5cf6", "#e0a100", "#e0409a", "#0f9fa8"];
const teamColor = (key: string) => { let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0; return BADGE[h % BADGE.length]; };

const TeamResultNode: React.FC<Ctx> = ({f, p}) => {
  const B = p.stages[1].rect, ox = B.x, oy = B.y;
  const name = item(p, "res-name"), code = item(p, "res-code");
  const label = "kód pro žáky: ", val = "K7M4QZ";
  const lw = tw(label, 52, 600, "b");
  return (
    <ResultFrame f={f} p={p} rect={B}>
      <rect x={48} y={48} width={120} height={120} rx={30} fill={teamColor(name.text)} stroke={INK} strokeOpacity={0.35} strokeWidth={3} />
      <text x={108} y={125} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill="#fff">5B</text>
      <Txt it={name} ox={ox} oy={oy} fill={INK} />
      <Pill x={200} y={128} w={204} h={72} fill="#dfe3ff"><text x={302} y={182} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill={BLUE_D}>Učitel</text></Pill>
      <line x1={48} x2={B.width - 48} y1={236} y2={236} stroke={INK} strokeOpacity={0.14} strokeWidth={3} />
      <Txt it={item(p, "res-role")} ox={ox} oy={oy} fill={INK} />
      <text x={code.x - ox} y={code.y - oy} fontFamily={FAM.b} fontSize={52} fontWeight={600} fill={INK}>{label}<tspan fontWeight={800} letterSpacing={4}>{val}</tspan></text>
      <g />{void lw}
    </ResultFrame>
  );
};

// ---------------- stage content: part 2 (join with code) ----------------
const JoinNode: React.FC<Ctx> = ({f, p}) => {
  const A = p.stages[0].rect, ox = A.x, oy = A.y;
  const typ = typeState(f, p.typing!.span, p.typing!.text, "cs", 16);
  const typed = item(p, "typed"), btn = p.cursor.clicks[0];
  const focus = f >= p.typing!.span.start && f < btn.frame;
  const caretX = typed.x - ox + W({...typed, text: typ.text});
  return (
    <g>
      <Txt it={item(p, "join-title")} ox={ox} oy={oy} fill={CREAM} />
      <Txt it={item(p, "join-hint")} ox={ox} oy={oy} fill={CREAM} o={0.82} />
      <rect x={40} y={210} width={A.width - 80} height={104} rx={26} fill={SOFT_FILL} stroke={focus ? BLUE : EDGE} strokeWidth={focus ? 4 : 3} strokeOpacity={focus ? 1 : 0.55} />
      {typ.text === "" ? <text x={72} y={280} fontFamily={FAM.b} fontWeight={600} fontSize={52} fill={CREAM} opacity={0.5}>Kód týmu</text> : <Txt it={typed} ox={ox} oy={oy} fill={CREAM} text={typ.text} />}
      {typ.caret && <rect x={caretX + 6} y={236} width={4} height={56} rx={2} fill={YEL} />}
      <g transform={`translate(240 440)`}><g transform={pressFor(p, f, "pripojit")}>
        <Pill x={-200} y={-52} w={400} h={104} fill={BLUE} lip={BLUE_D}>
          <text x={0} y={18} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill="#fff">Připojit se</text>
        </Pill>
      </g></g>
    </g>
  );
};

const PendingNode: React.FC<Ctx> = ({f, p}) => {
  const B = p.stages[1].rect, ox = B.x, oy = B.y;
  return (
    <ResultFrame f={f} p={p} rect={B}>
      <Txt it={item(p, "res-title")} ox={ox} oy={oy} fill={INK} />
      <rect x={40} y={150} width={B.width - 80} height={320} rx={32} fill="#e9e4f4" stroke={INK} strokeOpacity={0.16} strokeWidth={3} />
      <Txt it={item(p, "res-name")} ox={ox} oy={oy} fill={INK} />
      <Txt it={item(p, "res-status")} ox={ox} oy={oy} fill={MUTE_INK} />
      <Txt it={item(p, "res-cancel")} ox={ox} oy={oy} fill="#b3321a" />
    </ResultFrame>
  );
};

// ---------------- stage content: part 3 (AI asistent) ----------------
const Avatar: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><radialGradient id="avg" cx=".3" cy=".3" r=".8"><stop offset="0" stopColor="#d9ccff" /><stop offset=".55" stopColor="#6c3df0" /><stop offset="1" stopColor="#2a1a7a" /></radialGradient></defs>
    <circle r={34} fill="url(#avg)" />
  </g>
);
const InputRow: React.FC<{w: number; y: number; dark: boolean}> = ({w, y, dark}) => (
  <g>
    <rect x={40} y={y} width={w - 80} height={104} rx={30} fill={dark ? SOFT_FILL : "rgba(25,29,46,.06)"} stroke={dark ? EDGE : INK} strokeOpacity={dark ? 0.55 : 0.2} strokeWidth={3} />
    <text x={72} y={y + 68} fontFamily={FAM.b} fontWeight={600} fontSize={52} fill={dark ? CREAM : INK} opacity={dark ? 0.5 : 0.55}>Napiš odpověď…</text>
    <g transform={`translate(${w - 40 - 72} ${y + 52}) scale(2.3) translate(-12 -12)`} fill="none" stroke={dark ? CREAM : INK} strokeOpacity={0.8} strokeWidth={1.74} strokeLinejoin="round" strokeLinecap="round">
      <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" />
    </g>
  </g>
);
const AskNode: React.FC<Ctx> = ({f, p}) => {
  const A = p.stages[0].rect, ox = A.x, oy = A.y;
  const chip = (id: string, y: number, w: number, hot: boolean) => {
    const it = item(p, id);
    return (
      <g transform={`translate(${it.x - ox - 24 + w / 2} ${y + 36})`}><g transform={hot ? pressFor(p, f, "chip-nesplnena") : ""}>
        <Pill x={-w / 2} y={-36} w={w} h={72} fill={hot ? BLUE : "#3a355f"} lip={hot ? BLUE_D : "#221f3d"}>
          <text x={0} y={18} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill="#fff">{it.text}</text>
        </Pill>
      </g></g>
    );
  };
  const w1 = W(item(p, "chip-1")) + 48, w3 = W(item(p, "chip-3")) + 48, w2 = W(item(p, "chip-2")) + 48;
  return (
    <g>
      <Txt it={item(p, "ai-title")} ox={ox} oy={oy} fill={CREAM} />
      <Pill x={A.width - 40 - 156} y={42} w={156} h={72} fill="#3a355f"><text x={A.width - 40 - 78} y={96} textAnchor="middle" fontFamily={FAM.b} fontWeight={800} fontSize={52} fill={CREAM}>Dnes</text></Pill>
      <Avatar x={74} y={196} />
      <Bubble x={126} y={140} w={740} h={168} fill="#3a355f" side="left" />
      <Txt it={item(p, "greet-1")} ox={ox} oy={oy} fill={CREAM} />
      <Txt it={item(p, "greet-2")} ox={ox} oy={oy} fill={CREAM} />
      {chip("chip-1", 330, w1, false)}
      {chip("chip-3", 330, w3, false)}
      {chip("chip-2", 422, w2, true)}
      <InputRow w={A.width} y={560} dark />
      <g />{void w3}
    </g>
  );
};
const AnswerNode: React.FC<Ctx> = ({f, p}) => {
  const B = p.stages[1].rect, ox = B.x, oy = B.y, bb = p.bubbles!;
  const user = item(p, "res-user"), reply = item(p, "res-reply");
  const uw = W(user) + 48, rw = W(reply) + 48;
  const ub = bubblePose(f, bb.user), rb = bubblePose(f, bb.reply);
  return (
    <ResultFrame f={f} p={p} rect={B}>
      <Txt it={item(p, "res-title")} ox={ox} oy={oy} fill={INK} />
      <Avatar x={74} y={196} />
      <Bubble x={126} y={140} w={740} h={168} fill="#e1dcf0" side="left" />
      <text x={150} y={214} fontFamily={FAM.b} fontWeight={600} fontSize={52} fill={INK}>Dobrý den, jsi připravený</text>
      <text x={150} y={276} fontFamily={FAM.b} fontWeight={600} fontSize={52} fill={INK}>na hodinu?</text>
      <g opacity={ub.opacity} transform={ub.transform}>
        <Bubble x={B.width - 40 - uw} y={330} w={uw} h={92} fill={BLUE} side="right" />
        <Txt it={user} ox={ox} oy={oy} fill="#fff" />
      </g>
      {f >= bb.dots.start && f < bb.dots.end && (
        <g>
          <Bubble x={126} y={444} w={200} h={92} fill="#e1dcf0" side="left" />
          {[0, 1, 2].map((i) => { const d = dotPose(f, bb.dots, i, 12); return <circle key={i} cx={176 + i * 40} cy={490 + d.y} r={10} fill={INK} opacity={d.opacity} />; })}
        </g>
      )}
      <g opacity={rb.opacity} transform={rb.transform}>
        <Bubble x={126} y={444} w={rw} h={92} fill="#e1dcf0" side="left" />
        <Txt it={reply} ox={ox} oy={oy} fill={INK} />
      </g>
      <InputRow w={B.width} y={560} dark={false} />
    </ResultFrame>
  );
};

// ---------------- logo ----------------
const LogoParts: React.FC<{cx: number; cy: number; a: number; f: number; gap: number; skipFirst?: boolean}> = ({cx, cy, a, f, gap, skipFirst}) => (
  <g transform={`translate(${cx} ${cy}) scale(${S_LOGO}) translate(${-LCX} ${-LCY})`}>
    {LOGO_PARTS.map((q, e) => {
      if (e === 0 && skipFirst) return null;
      const k = e === 0 ? back(prog(f, a, a + 14)) : back(prog(f, a + e * gap, a + e * gap + 14));
      if (k <= 0.01) return null;
      const spin = (e >= 18 ? 160 : 36) * (Math.sin(e * 9.1) > 0 ? 1 : -1) * (1 - k);
      return <g key={e} opacity={clamp(k * 3)} transform={`translate(${q.cx} ${q.cy}) rotate(${spin}) scale(${Math.max(k, 0)}) translate(${-q.cx} ${-q.cy})`} dangerouslySetInnerHTML={{__html: q.svg}} />;
    })}
  </g>
);

const IntroScene: React.FC<Ctx> = ({f, p}) => {
  const LY = 400, cx = 960;
  const A = {m0: 4, m1: 28, f0: 22, f1: 32, p0: 30, p1: 46, pop: 36, gap: 1.2, r0: 190};
  const X0 = cx + (26 - LCX) * S_LOGO, Y0 = LY + (34.875 - LCY) * S_LOGO;
  const u = prog(f, A.m0, A.m1) * 4, pm = easeIO(prog(f, A.p0, A.p1));
  const fa = prog(f, A.f0, A.f1), r = lerp(A.r0, 20.3125 * S_LOGO, pm), X = lerp(cx, X0, pm), Y = lerp(LY, Y0, pm), k = r / 20.3125, rot = 120 * (1 - easeIO(prog(f, A.m0, A.m1)));
  const face = prog(f, A.f0 + 4, A.f1 + 6);
  const hero = item(p, "intro-hero"), words = hero.text.split(" ");
  const pos = textPose(f, p.texts.intro, 0, 0, [hero.x, hero.y]);
  const accentIdx = p.hero.introAccent;
  // single line, per-word groups keep proportions; yellow accent word is chosen in the plan (-1 = last word)
  const total = W(hero), spaceW = tw(" ", hero.size, hero.wt, hero.fam);
  const ai = accentIdx < 0 ? words.length - 1 : accentIdx;
  return (
    <g>
      {f < A.p1 + 1 && (
        <g opacity={clamp((f - 3) / 6)}>
          <Morph names={["circle", "sq", "spark", "circle", "sq"]} u={u} x={X} y={Y + r * 0.18} r={r} rot={rot} sw={0} fill={`rgba(36,51,184,${fa})`} />
          <Morph names={["circle", "sq", "spark", "circle", "sq"]} u={u} x={X} y={Y} r={r} rot={rot} sw={Math.max(3, 6 * (1 - pm))} trail={pm < 1 && fa < 0.3 ? 3 : 0} fill={`rgba(50,72,240,${fa})`} />
          {face > 0 && (
            <g transform={`translate(${X} ${Y}) scale(${k})`} fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={6.906}>
              <path d="M-10.5625 -1.625V3.25A10.5625 10.5625 0 0 0 10.5625 3.25V-1.625" strokeDasharray="60" strokeDashoffset={60 * (1 - face)} />
              <circle cx={-7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" />
              <circle cx={7.3125} cy={-10.5625} r={3.7375} fill="#fff" stroke="none" />
            </g>
          )}
        </g>
      )}
      <LogoParts cx={cx} cy={LY} a={A.pop} f={f} gap={A.gap} skipFirst={f < A.p1 + 1} />
      <g opacity={pos.opacity} transform={pos.transform}>
        {[false, true].map((accentPass) => (
          <g key={String(accentPass)} style={accentPass ? undefined : {filter: GLOW}}>
            {(() => { let qx = hero.x - total / 2; return words.map((w, i) => {
              const wx = qx; qx += tw(w, hero.size, hero.wt, hero.fam) + spaceW;
              return (i === ai) === accentPass ? <text key={i} x={wx} y={hero.y} fontFamily={FAM.p} fontSize={hero.size} fill={accentPass ? YEL : CREAM}>{w}</text> : null;
            }); })()}
          </g>
        ))}
      </g>
    </g>
  );
};

const OutroScene: React.FC<Ctx> = ({f, p}) => {
  const url = item(p, "outro-url");
  const pos = textPose(f, p.texts.outro, 0, 0, [url.x, url.y], 0.0);
  return (
    <g>
      <LogoParts cx={960} cy={470} a={p.logo.outroPop} f={f} gap={1.1} />
      <g opacity={pos.opacity} transform={pos.transform}><Txt it={url} fill={CREAM} /></g>
    </g>
  );
};

// ---------------- feature scene ----------------
const FeatureScene: React.FC<Ctx> = ({f, p}) => {
  const {hero, card} = p, h1 = item(p, "hero-1"), h2 = item(p, "hero-2");
  const lines = [h1, h2];
  const exitSpan: Span = {start: card.exit.start, end: card.exit.start + 14};
  const nodesByPart: Record<string, React.ReactNode[]> = {
    "tymy-01": [<FormNode f={f} p={p} />, <TeamResultNode f={f} p={p} />],
    "tymy-02": [<JoinNode f={f} p={p} />, <PendingNode f={f} p={p} />],
    "tymy-03": [<AskNode f={f} p={p} />, <AnswerNode f={f} p={p} />],
  };
  const cur = cursorAt(p, f);
  const showCursor = f >= p.cursor.start && f < p.cursor.exit.end;
  const cursorOp = Math.min(clamp((f - p.cursor.start) / 8), 1 - smooth(phase(f, p.cursor.exit)));
  return (
    <g>
      <g>
        {lines.map((it, i) => {
          const pivot: [number, number] = [it.x + 100, it.y];
          const pose = f >= exitSpan.start ? textExitPose(f, exitSpan, pivot, [-40, 0]) : textPose(f, p.texts.feature, i, 3, pivot);
          return (
            <g key={it.id} opacity={pose.opacity} transform={pose.transform}>
              {[false, true].map((accentPass) => (
                <g key={String(accentPass)} style={accentPass ? undefined : {filter: GLOW}}>
                  {it.text.split(" ").map((w, j, arr) => {
                    // accent: the plan picks which hero line is yellow; last word of that line
                    const accent = i === hero.accent && j === arr.length - 1;
                    const before = arr.slice(0, j).join(" ");
                    const wx = it.x + (j === 0 ? 0 : tw(before + " ", it.size, it.wt, it.fam));
                    return accent === accentPass ? <text key={j} x={wx} y={it.y} fontFamily={FAM.p} fontSize={it.size} fill={accent ? YEL : CREAM}>{w}</text> : null;
                  })}
                </g>
              ))}
            </g>
          );
        })}
      </g>
      <ChainCard f={f} p={p} nodes={nodesByPart[p.id]} />
      {p.cursor.clicks.map((c) => <Ripple key={c.id} x={c.target[0]} y={c.target[1]} t={f} a={c.frame} />)}
      {showCursor && cursorOp > 0.01 && <Cursor x={cur.x} y={cur.y} press={cur.press} o={clamp(cursorOp)} />}
    </g>
  );
};

// ---------------- film wrapper ----------------
let GRAIN: string[] | null = null;
const grainTiles = () => {
  if (GRAIN) return GRAIN;
  GRAIN = Array.from({length: 8}, (_, k) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 192;
    const g = cv.getContext("2d")!, im = g.createImageData(192, 192);
    let s = 1234567 + k * 7919;
    for (let i = 0; i < 192 * 192; i++) { s = (s * 1664525 + 1013904223) >>> 0; const v = s >>> 24; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0);
    return cv.toDataURL("image/png");
  });
  return GRAIN;
};

export const camSpeed = (track: ReturnType<typeof createCameraTrack>, f: number) => Math.abs(track(f).x - track(f - 1).x);

const FILM_HOME = {x: 960 + WORLD_X.feature, y: 540, zoom: 1};

export const makeComp = (p: PartPlan): React.FC => {
  const Comp: React.FC = () => {
    const f = useCurrentFrame();
    const track = useMemo(() => createCameraTrack(p.camera), []);
    const view = track(f), sp = camSpeed(track, f), bx = blurFor(sp), ca = caFor(sp);
    const tiles = grainTiles();
    const fadeIn = 1 - clamp(f / 8), fadeOut = prog(f, p.fadeOut.start, p.fadeOut.end - 1);
    const veil = Math.max(fadeIn, fadeOut);
    const camHome = {x: 960 + WORLD_X.feature, y: 540, zoom: 1};
    void FILM_HOME;
    return (
      <FontGate>
        <div style={{width: 1920, height: 1080, position: "relative", overflow: "hidden", background: "#22262E"}}>
          <Audio src={staticFile(`${p.id}/sfx.wav`)} />
          <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0}}>
            <defs>
              <filter id="mbx" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} 0`} /></filter>
              <filter id="ca" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080" colorInterpolationFilters="sRGB">
                <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
                <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
                <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
                <feOffset in="r" dx={-ca} dy={0} result="r2" /><feOffset in="b" dx={ca} dy={0} result="b2" />
                <feBlend in="r2" in2="g" mode="screen" result="rg" /><feBlend in="rg" in2="b2" mode="screen" />
              </filter>
              {tiles.map((t, k) => <pattern key={k} id={`grain${k}`} width={192} height={192} patternUnits="userSpaceOnUse"><image href={t} width={192} height={192} /></pattern>)}
            </defs>
            <StudioBackdrop frame={f} />
            <g filter={ca > 0.01 ? "url(#ca)" : undefined}>
              <g filter={bx > 0.4 ? "url(#mbx)" : undefined}>
                <g transform={stageTransform(view, camHome, 1)}>
                  {f < p.flights[0].end + 2 && <g transform={`translate(${WORLD_X.intro} 0)`}><IntroScene f={f} p={p} /></g>}
                  {f >= p.card.arrival.start - 2 && f < p.flights[1].end + 2 && <g transform={`translate(${WORLD_X.feature} 0)`}><FeatureScene f={f} p={p} /></g>}
                  {f >= p.flights[1].start - 2 && <g transform={`translate(${WORLD_X.outro} 0)`}><OutroScene f={f} p={p} /></g>}
                </g>
              </g>
            </g>
            <rect width={1920} height={1080} fill={`url(#grain${f % 8})`} opacity={0.055} style={{mixBlendMode: "overlay"}} />
            <rect width={1920} height={1080} fill="#05040f" opacity={veil} />
          </svg>
        </div>
      </FontGate>
    );
  };
  return Comp;
};

export const TymyDil1 = makeComp(PARTS[0]), TymyDil2 = makeComp(PARTS[1]), TymyDil3 = makeComp(PARTS[2]);
export const TYMY_FRAMES = PARTS.map((q) => q.frames);
void FPS; void C; void lerp;
