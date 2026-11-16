// Single source of truth for the /tymy showcase: every frame, text item, cue and camera key lives here (30 fps output frames).
// Tymy.tsx draws from it, 2d/tymy_build.mjs derives scenes.json + lint JSON from it, audio/tymy_sfx.py renders sound from scenes.json.
import type {CameraKey, CardRect, Span} from "./studioMotion";

export const FPS = 30;
export const MAX_FRAMES = 450;
export const WORLD_X = {intro: 0, feature: 1920, outro: 3840} as const;
export const SAFE = {x0: 96, x1: 1824, y0: 64, y1: 984};
/** reading baseline in frames for a required text item: max(minimum hold, ceil(graphemes * 30 / 14)) */
export const graphemes = (s: string) => Array.from(new Intl.Segmenter("cs", {granularity: "grapheme"}).segment(s)).length;
export const readFrames = (s: string, min: number) => Math.max(min, Math.ceil(graphemes(s) * 30 / 14));

export type Family = "p" | "b" | "h";
export type Role = "headline" | "required" | "control" | "context";
export type Item = {
  id: string; role: Role; text: string; size: number; fam: Family; wt: number;
  x: number; y: number;              // SCREEN position at the hold (x = left edge, or centre when anchor = "middle"), y = baseline
  anchor: "start" | "middle" | "end"; sp?: number; scene: string;
  complete: number; leave: number;   // first fully readable frame, first unreadable frame
};
export type Cue = {id: string; frame: number; kind: string; gain: number; pan?: number; note?: string};
export type PartPlan = {
  id: string; comp: string; seed: number; title: string; frames: number;
  scenes: {id: string; kind: "intro" | "feature" | "outro"; start: number; end: number}[];
  camera: CameraKey[]; flights: Span[];
  hero: {lines: string[]; accent: number; intro: string[]; introAccent: number};
  card: {arrival: Span; exit: Span; exitTravel: [number, number]};
  stages: {id: string; rect: CardRect; tone: number}[];
  transfers: Span[];
  typing?: {span: Span; text: string; keyFrames: number[]};
  cursor: {start: number; from: [number, number]; exit: Span; clicks: {id: string; frame: number; approach: number; lead: number; target: [number, number]}[]};
  result: {reveal: number; pulse: Span; check: Span; lap: Span; hold: Span};
  logo: {morph: Span; pop: number; outroPop: number};
  texts: {intro: Span; feature: Span; outro: Span};
  fadeOut: Span; items: Item[]; cues: Cue[]; notes: string[];
  bubbles?: {user: Span; dots: Span; reply: Span};
};

const CARD_X = 736, CARD_W = 1088;
const HERO_X = 96;
export const NAVY_FACE = "#292541";

// ---- shared geometry (screen coordinates; the feature world is shifted by WORLD_X.feature) ----
const flightA: Span = {start: 104, end: 124};
const arrival: Span = {start: 106, end: 126};
const heroEnter: Span = {start: 124, end: 138};

function camera(flight2: Span, end: number): CameraKey[] {
  return [
    {frame: 0, x: 960, y: 540, zoom: 1.14},
    {frame: 52, x: 960, y: 540, zoom: 1, stop: true},
    {frame: flightA.start, x: 960, y: 540, zoom: 1, stop: true},
    {frame: flightA.end, x: 960 + 1920, y: 540, zoom: 1, stop: true},
    {frame: flight2.start, x: 960 + 1920, y: 540, zoom: 1, stop: true},
    {frame: flight2.end, x: 960 + 3840, y: 540, zoom: 1, stop: true},
    {frame: end, x: 960 + 3840, y: 540, zoom: 1, stop: true},
  ];
}

const mk = (it: Omit<Item, "anchor" | "scene"> & {anchor?: "start" | "middle" | "end"; scene: string}): Item => ({anchor: "start", ...it});

// shared intro/outro items
function frame2(intro: string, introText: Span, outroText: Span, outroDone: number, holdEnd: number, flight1: number, id: string): Item[] {
  return [
    mk({id: "intro-hero", role: "headline", text: intro, size: 160, fam: "p", wt: 400, x: 960, y: 720, anchor: "middle", scene: "intro", complete: introText.end, leave: flight1}),
    mk({id: "outro-url", role: "required", text: `ucimesehrou.org/${id}`, size: 52, fam: "b", wt: 800, x: 960, y: 690, anchor: "middle", scene: "outro", complete: outroDone, leave: holdEnd}),
  ];
}

function finish(p: Omit<PartPlan, "frames" | "camera" | "flights" | "fadeOut" | "scenes" | "texts" | "items"> & {
  items: Item[]; flight2: Span; outroPop: number; outroText: Span; holdEnd: number;
}): PartPlan {
  const {items, flight2, outroText, holdEnd, ...rest} = p;
  const fadeOut = {start: holdEnd, end: holdEnd + 12};
  const frames = fadeOut.end;
  return {
    ...rest, frames,
    scenes: [
      {id: "intro", kind: "intro", start: 0, end: flightA.end},
      {id: "feature", kind: "feature", start: flightA.start, end: flight2.end},
      {id: "outro", kind: "outro", start: flight2.start, end: frames},
    ],
    camera: camera(flight2, frames), flights: [flightA, flight2],
    texts: {intro: {start: 44, end: 66}, feature: heroEnter, outro: outroText},
    fadeOut, items,
  };
}

// =====================================================================================================
// PART 1: Založ tým (hero: Vytvořit)
// =====================================================================================================
function part1(): PartPlan {
  const typing = {start: 132, end: 169}, text = "5. B – matematika";
  const clickBox = 188, clickBtn = 208, transfer: Span = {start: 212, end: 240};
  const hold = readFrames("kód pro žáky: K7M4QZ", 42) + 5;
  const leave = transfer.end + hold, exit: Span = {start: leave, end: leave + 20};
  const flight2: Span = {start: leave + 4, end: leave + 22};
  const outroPop = flight2.start + 2, outroText: Span = {start: flight2.end + 4, end: flight2.end + 18};
  const holdEnd = outroText.end + readFrames("ucimesehrou.org/tymy", 42) + 9;
  const A: CardRect = {x: CARD_X, y: 235, width: CARD_W, height: 610};
  const B: CardRect = {x: CARD_X, y: 290, width: CARD_W, height: 490};
  const tk = typeKeys(typing, text);
  const items: Item[] = [
    ...frame2("Týmy a třídy", {start: 44, end: 66}, outroText, outroText.end, holdEnd, flightA.start, "tymy"),
    mk({id: "hero-1", role: "headline", text: "Založ", size: 150, fam: "p", wt: 400, x: HERO_X, y: 500, scene: "feature", complete: heroEnter.end, leave: exit.start}),
    mk({id: "hero-2", role: "headline", text: "tým", size: 150, fam: "p", wt: 400, x: HERO_X, y: 668, scene: "feature", complete: heroEnter.end + 3, leave: exit.start}),
    mk({id: "form-title", role: "required", text: "Založit tým / třídu", size: 52, fam: "b", wt: 800, x: CARD_X + 40, y: A.y + 96, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "typed", role: "required", text, size: 52, fam: "b", wt: 600, x: CARD_X + 72, y: A.y + 210, scene: "feature", complete: typing.end, leave: transfer.start}),
    mk({id: "check-1", role: "context", text: "Jsem učitel (budu zadávat úkoly", size: 52, fam: "b", wt: 600, x: CARD_X + 132, y: A.y + 322, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "check-2", role: "context", text: "a přidávat žáky)", size: 52, fam: "b", wt: 600, x: CARD_X + 132, y: A.y + 384, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "btn", role: "control", text: "Vytvořit", size: 52, fam: "b", wt: 800, x: CARD_X + 40 + 180, y: A.y + 520, anchor: "middle", scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "res-name", role: "required", text: "5. B – matematika", size: 52, fam: "b", wt: 800, x: CARD_X + 200, y: B.y + 100, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-pill", role: "required", text: "Učitel", size: 52, fam: "b", wt: 800, x: CARD_X + 200 + 102, y: B.y + 182, anchor: "middle", scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-role", role: "required", text: "Jsi učitel · Členů: 1", size: 52, fam: "b", wt: 600, x: CARD_X + 48, y: B.y + 310, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-code", role: "required", text: "kód pro žáky: K7M4QZ", size: 52, fam: "b", wt: 600, x: CARD_X + 48, y: B.y + 392, scene: "feature", complete: transfer.end, leave: exit.start, sp: 0}),
  ];
  return finish({
    id: "tymy-01", comp: "TymyDil1", seed: 4201, title: "Založ tým",
    hero: {lines: ["Založ", "tým"], accent: 1, intro: ["Týmy a třídy"], introAccent: -1},
    card: {arrival, exit, exitTravel: [-70, 0]},
    stages: [{id: "form", rect: A, tone: 0}, {id: "result", rect: B, tone: 1}],
    transfers: [transfer],
    typing: {span: typing, text, keyFrames: tk},
    cursor: {start: 150, from: [1560, 880], exit: {start: transfer.start, end: transfer.start + 10}, clicks: [
      {id: "checkbox", frame: clickBox, approach: 160, lead: 4, target: [CARD_X + 72, A.y + 328]},
      {id: "vytvorit", frame: clickBtn, approach: 192, lead: 4, target: [CARD_X + 220, A.y + 502]},
    ]},
    result: {reveal: transfer.end, pulse: {start: transfer.end, end: transfer.end + 18}, check: {start: transfer.end + 4, end: transfer.end + 20}, lap: {start: transfer.end, end: transfer.end + 30}, hold: {start: transfer.end, end: leave}},
    logo: {morph: {start: 4, end: 44}, pop: 36, outroPop},
    flight2, outroPop, outroText, holdEnd, items,
    cues: [], notes: [
      "Sample content (not from a database): team name '5. B – matematika' (the site's own placeholder example) and invite code K7M4QZ.",
      "Real flow navigates to the team page after Vytvořit; the result card reproduces that page's header (name, role, member count, code) from TeamView.tsx.",
    ],
  });
}

// =====================================================================================================
// PART 2: Připoj se kódem (hero: Připojit se → čeká na schválení učitelem)
// =====================================================================================================
function part2(): PartPlan {
  const typing = {start: 132, end: 145}, text = "K7M4QZ";
  const click = 184, transfer: Span = {start: 188, end: 216};
  const hold = readFrames("čeká na schválení učitelem", 42) + 3;
  const leave = transfer.end + hold, exit: Span = {start: leave, end: leave + 20};
  const flight2: Span = {start: leave + 4, end: leave + 22};
  const outroPop = flight2.start + 2, outroText: Span = {start: flight2.end + 4, end: flight2.end + 18};
  const holdEnd = outroText.end + readFrames("ucimesehrou.org/tymy", 42) + 9;
  const A: CardRect = {x: CARD_X, y: 260, width: CARD_W, height: 540};
  const B: CardRect = {x: CARD_X, y: 260, width: CARD_W, height: 540};
  const tk = typeKeys(typing, text);
  const items: Item[] = [
    ...frame2("Připoj se kódem", {start: 44, end: 66}, outroText, outroText.end, holdEnd, flightA.start, "tymy"),
    mk({id: "hero-1", role: "headline", text: "Zadej", size: 150, fam: "p", wt: 400, x: HERO_X, y: 500, scene: "feature", complete: heroEnter.end, leave: exit.start}),
    mk({id: "hero-2", role: "headline", text: "kód", size: 150, fam: "p", wt: 400, x: HERO_X, y: 668, scene: "feature", complete: heroEnter.end + 3, leave: exit.start}),
    mk({id: "join-title", role: "required", text: "Připojit se kódem", size: 52, fam: "b", wt: 800, x: CARD_X + 40, y: A.y + 96, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "join-hint", role: "required", text: "Kód ti dá učitel.", size: 52, fam: "b", wt: 600, x: CARD_X + 40, y: A.y + 168, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "typed", role: "required", text, size: 52, fam: "b", wt: 800, x: CARD_X + 72, y: A.y + 280, scene: "feature", complete: typing.end, leave: transfer.start, sp: 6}),
    mk({id: "btn", role: "control", text: "Připojit se", size: 52, fam: "b", wt: 800, x: CARD_X + 40 + 200, y: A.y + 458, anchor: "middle", scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "res-title", role: "required", text: "Moje týmy", size: 52, fam: "b", wt: 800, x: CARD_X + 40, y: B.y + 96, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-name", role: "required", text: "5. B – matematika", size: 52, fam: "b", wt: 800, x: CARD_X + 80, y: B.y + 236, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-status", role: "required", text: "čeká na schválení učitelem", size: 52, fam: "b", wt: 600, x: CARD_X + 80, y: B.y + 312, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-cancel", role: "context", text: "Zrušit žádost", size: 52, fam: "b", wt: 800, x: CARD_X + 80, y: B.y + 396, scene: "feature", complete: transfer.end, leave: exit.start}),
  ];
  return finish({
    id: "tymy-02", comp: "TymyDil2", seed: 4202, title: "Připoj se kódem",
    hero: {lines: ["Zadej", "kód"], accent: 1, intro: ["Připoj se kódem"], introAccent: -1},
    card: {arrival, exit, exitTravel: [-70, 0]},
    stages: [{id: "join", rect: A, tone: 0}, {id: "pending", rect: B, tone: 1}],
    transfers: [transfer],
    typing: {span: typing, text, keyFrames: tk},
    cursor: {start: 150, from: [1560, 880], exit: {start: transfer.start, end: transfer.start + 10}, clicks: [
      {id: "pripojit", frame: click, approach: 152, lead: 4, target: [CARD_X + 240, A.y + 440]},
    ]},
    result: {reveal: transfer.end, pulse: {start: transfer.end, end: transfer.end + 18}, check: {start: transfer.end + 4, end: transfer.end + 20}, lap: {start: transfer.end, end: transfer.end + 30}, hold: {start: transfer.end, end: leave}},
    logo: {morph: {start: 4, end: 44}, pop: 36, outroPop},
    flight2, outroPop, outroText, holdEnd, items,
    cues: [], notes: [
      "Sample content: invite code K7M4QZ and team name '5. B – matematika'.",
      "Result shown is the site's 'Se schválením' state: row in 'Moje týmy' with 'čeká na schválení učitelem' (from TeamsHome.tsx pending list). The toast sentence is not shown (too long for its reading budget).",
    ],
  });
}

// =====================================================================================================
// PART 3: Zeptej se asistenta (hero: chip Nesplněná zadání → odpověď)
// =====================================================================================================
function part3(): PartPlan {
  const click = 200, transfer: Span = {start: 204, end: 230};
  const userBubble: Span = {start: 230, end: 240}, dots: Span = {start: 240, end: 252}, replyBubble: Span = {start: 252, end: 262};
  const replyText = "Máš 3 nesplněných zadání.";
  const leave = replyBubble.end + readFrames(replyText, 42);
  const exit: Span = {start: leave, end: leave + 20};
  const flight2: Span = {start: leave + 4, end: leave + 22};
  const outroPop = flight2.start + 2, outroText: Span = {start: flight2.end + 4, end: flight2.end + 18};
  const holdEnd = outroText.end + readFrames("ucimesehrou.org/tymy", 42) + 9;
  const A: CardRect = {x: CARD_X, y: 184, width: CARD_W, height: 712};
  const B: CardRect = {x: CARD_X, y: 184, width: CARD_W, height: 712};
  const greet = "Dobrý den, jsi připravený na hodinu?";
  const items: Item[] = [
    ...frame2("Zeptej se asistenta", {start: 44, end: 66}, outroText, outroText.end, holdEnd, flightA.start, "tymy"),
    mk({id: "hero-1", role: "headline", text: "Zeptej se", size: 150, fam: "p", wt: 400, x: HERO_X, y: 500, scene: "feature", complete: heroEnter.end, leave: exit.start}),
    mk({id: "hero-2", role: "headline", text: "asistenta", size: 150, fam: "p", wt: 400, x: HERO_X, y: 668, scene: "feature", complete: heroEnter.end + 3, leave: exit.start}),
    mk({id: "ai-title", role: "required", text: "AI asistent", size: 52, fam: "b", wt: 800, x: CARD_X + 40, y: A.y + 96, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "ai-today", role: "context", text: "Dnes", size: 52, fam: "b", wt: 800, x: CARD_X + CARD_W - 40 - 78, y: A.y + 96, anchor: "middle", scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "greet-1", role: "context", text: "Dobrý den, jsi připravený", size: 52, fam: "b", wt: 600, x: CARD_X + 150, y: A.y + 214, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "greet-2", role: "context", text: "na hodinu?", size: 52, fam: "b", wt: 600, x: CARD_X + 150, y: A.y + 276, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "chip-1", role: "control", text: "Nejbližší termín", size: 52, fam: "b", wt: 800, x: CARD_X + 40 + 24, y: A.y + 384, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "chip-3", role: "control", text: "Moje týmy", size: 52, fam: "b", wt: 800, x: CARD_X + 40 + 437 + 24 + 24, y: A.y + 384, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "chip-2", role: "control", text: "Nesplněná zadání", size: 52, fam: "b", wt: 800, x: CARD_X + 40 + 24, y: A.y + 476, scene: "feature", complete: arrival.end, leave: transfer.start}),
    mk({id: "res-title", role: "required", text: "AI asistent", size: 52, fam: "b", wt: 800, x: CARD_X + 40, y: B.y + 96, scene: "feature", complete: transfer.end, leave: exit.start}),
    mk({id: "res-user", role: "required", text: "Nesplněná zadání", size: 52, fam: "b", wt: 800, x: CARD_X + CARD_W - 40 - 24, y: B.y + 394, anchor: "end", scene: "feature", complete: userBubble.end, leave: exit.start}),
    mk({id: "res-reply", role: "required", text: replyText, size: 52, fam: "b", wt: 600, x: CARD_X + 150, y: B.y + 508, scene: "feature", complete: replyBubble.end, leave: exit.start}),
  ];
  void greet;
  return finish({
    id: "tymy-03", comp: "TymyDil3", seed: 4203, title: "Zeptej se asistenta",
    hero: {lines: ["Zeptej se", "asistenta"], accent: 1, intro: ["Zeptej se asistenta"], introAccent: -1},
    card: {arrival, exit, exitTravel: [-70, 0]},
    stages: [{id: "ask", rect: A, tone: 0}, {id: "answer", rect: B, tone: 1}],
    transfers: [transfer],
    cursor: {start: 150, from: [1560, 900], exit: {start: transfer.start, end: transfer.start + 10}, clicks: [
      {id: "chip-nesplnena", frame: click, approach: 172, lead: 4, target: [CARD_X + 40 + 24 + 200, A.y + 454]},
    ]},
    result: {reveal: replyBubble.end, pulse: {start: replyBubble.end, end: replyBubble.end + 18}, check: {start: replyBubble.end + 4, end: replyBubble.end + 20}, lap: {start: replyBubble.end, end: replyBubble.end + 30}, hold: {start: replyBubble.end, end: leave}},
    logo: {morph: {start: 4, end: 44}, pop: 36, outroPop},
    flight2, outroPop, outroText, holdEnd, items,
    bubbles: {user: userBubble, dots, reply: replyBubble},
    cues: [], notes: [
      "Sample content: the open-task count (3) is a stand-in for the live number; the sentence pattern 'Máš {0} nesplněných zadání.' is the site's own (teams-edx aiOpen).",
      "Answer is shown from the site's local rule-based fallback (EdxAssistant.answer); the live model reply is not reproduced.",
    ],
  });
}

function typeKeys(span: Span, input: string) {
  const chars = Array.from(new Intl.Segmenter("cs", {granularity: "grapheme"}).segment(input), (s) => s.segment);
  return chars.map((_, i) => Math.ceil(span.start + (span.end - span.start) * (i + 1) / chars.length));
}

export const PARTS: PartPlan[] = [part1(), part2(), part3()];

// ---- camera-derived values shared by picture and lint ----
export const blurFor = (speed: number) => Math.min(14, Math.max(0, (speed - 30) * 0.07));
export const caFor = (speed: number) => Math.min(4, Math.max(0, (speed - 40) * 0.04));
