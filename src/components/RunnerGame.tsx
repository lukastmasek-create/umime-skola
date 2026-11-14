"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GameQuestion } from "@/i18n/game";
import { runLength } from "@/lib/games";
import { readBest, saveBest, type Best } from "@/lib/game-best";
import {
  RUNNER_BOSS_HITS,
  RUNNER_LANES,
  RUNNER_START_CREW,
  bossOutcome,
  buildRunnerPlan,
  gateOutcome,
  runnerStars,
  type RunnerBossQuestion,
  type RunnerPlan,
} from "@/lib/runner";
import { GameFrame, type AnswerResult } from "./classic/shared";

const TXT = {
  cs: {
    title: "Matematický běh",
    intro: "Běž správnou bránou s odpovědí na otázku. Správná brána přidá do party, špatná ubere. Na konci tě čeká boss, kterého porazíš správnými odpověďmi.",
    back: "Zpět na kurz",
    crew: "Parta",
    gates: "Brány",
    boss: "Boss",
    start: "Spustit",
    controls: "Ovládání: táhni prstem nebo myší doleva a doprava, nebo klikni na levou či pravou část. Na klávesnici šipky ← →.",
    bossHint: "Odpověz na otázku, ať boss padne. Špatná odpověď ubere z party.",
    next: "Pokračovat",
    right: "Správně",
    wrongWas: "Správná odpověď:",
    gained: "+{n} do party",
    lostN: "−{n} z party",
    bossHit: "Boss dostal zásah!",
    bossWrongN: "Boss tě zasáhl: −{n}",
    won: "Boss padl! Vyhrál jsi.",
    lost: "Parta je pryč. Zkus to znovu.",
    again: "Hrát znovu",
    best: "Nejlepší",
    xpLabel: "XP",
    correctN: "Správné odpovědi",
    crewEnd: "Parta na konci",
    bossFight: "Souboj s bossem",
    noData: "Kurz zatím nemá dost otázek pro tuto hru.",
  },
  en: {
    title: "Math Run",
    intro: "Run through the gate with the right answer. The right gate grows your crew, the wrong one shrinks it. At the end a boss waits — beat it with right answers.",
    back: "Back to course",
    crew: "Crew",
    gates: "Gates",
    boss: "Boss",
    start: "Start",
    controls: "Controls: swipe or drag left and right, or tap the left or right side. Keyboard: ← →.",
    bossHint: "Answer the question to make the boss fall. A wrong answer costs crew.",
    next: "Continue",
    right: "Correct",
    wrongWas: "Correct answer:",
    gained: "+{n} crew",
    lostN: "−{n} crew",
    bossHit: "Boss hit!",
    bossWrongN: "The boss hit you: −{n}",
    won: "The boss is down! You won.",
    lost: "Your crew is gone. Try again.",
    again: "Play again",
    best: "Best",
    xpLabel: "XP",
    correctN: "Correct answers",
    crewEnd: "Crew at the end",
    bossFight: "Boss fight",
    noData: "This course does not have enough questions for this game.",
  },
} as const;

type Phase = "ready" | "run" | "boss" | "won" | "lost";
type Feedback = { id: number; text: string; good: boolean; sub?: string } | null;

// Geometrie světa (jednotky ~ metry). Hráč stojí na z = 0 a běží ve směru −z.
const ROW_START = -60;
const ROW_GAP = 34;
const SPEED = 7; // pomalu, ať se otázka stihne přečíst
const BOSS_STOP_Z = -14;
const MAX_VISIBLE_CREW = 30;
const ROAD_W = 9;
const GATE_HIT_Z = -0.6; // brána se vyhodnotí, když doběhne k hrdinovi
const HERO_Z = -0.7;
// Obloha přechází do barvy mlhy přesně na horizontu, ať je krajina bez švu.
const SKY_CSS = "linear-gradient(180deg, #4aa8ff 0%, #8ccfff 22%, #d6efff 36%, #d6efff 100%)";
const FOG = 0xd6efff;

let texAniso = 4;

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxW || !line) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Text na panelu (brána, tabule): vysoké rozlišení, písmo se zmenší, dokud se text nevejde.
// Poměr stran textury musí odpovídat ploše, na kterou se lepí, jinak je písmo zdeformované.
function labelTexture(text: string, bg: string, fg: string, w: number, h: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const k = Math.min(w, h) / 256;
  if (ctx) {
    ctx.fillStyle = bg;
    roundRectPath(ctx, 6 * k, 6 * k, w - 12 * k, h - 12 * k, 36 * k);
    ctx.fill();
    ctx.lineWidth = 8 * k;
    ctx.strokeStyle = "rgba(42,26,107,0.35)";
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 96 * k;
    let lines: string[] = [text];
    for (; size >= 28 * k; size -= 6 * k) {
      ctx.font = `800 ${size}px system-ui, sans-serif`;
      lines = wrapLines(ctx, text, w - 60 * k);
      if (lines.length * size * 1.15 <= h - 36 * k) break;
    }
    const lh = size * 1.15;
    const y0 = h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, y0 + i * lh));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = texAniso;
  return tex;
}

function buildGate(label: string): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.MeshLambertMaterial({ color: 0x5b2fd6 });
  const beamMat = new THREE.MeshLambertMaterial({ color: 0xffc933 });
  const post = new THREE.BoxGeometry(0.16, 2.7, 0.16);
  for (const x of [-1.0, 1.0]) {
    const p = new THREE.Mesh(post, frame);
    p.position.set(x, 1.35, 0);
    g.add(p);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.2, 0.16), beamMat);
  beam.position.set(0, 2.6, 0);
  g.add(beam);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 2.28),
    new THREE.MeshBasicMaterial({ map: labelTexture(label, "#ffffff", "#2a1a6b", 768, 944), transparent: true, side: THREE.DoubleSide }),
  );
  panel.position.set(0, 1.3, 0.02);
  g.add(panel);
  return g;
}

// ----- Postavy

type Kit = {
  torso: THREE.BufferGeometry;
  head: THREE.BufferGeometry;
  hair: THREE.BufferGeometry;
  eye: THREE.BufferGeometry;
  arm: THREE.BufferGeometry;
  leg: THREE.BufferGeometry;
  pack: THREE.BufferGeometry;
  shoe: THREE.BufferGeometry;
};

function makeKit(): Kit {
  return {
    torso: new THREE.CapsuleGeometry(0.17, 0.3, 4, 10),
    head: new THREE.SphereGeometry(0.2, 18, 14),
    hair: new THREE.SphereGeometry(0.215, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    eye: new THREE.SphereGeometry(0.032, 8, 6),
    arm: new THREE.CapsuleGeometry(0.056, 0.26, 3, 8),
    leg: new THREE.CapsuleGeometry(0.075, 0.28, 3, 8),
    pack: new THREE.BoxGeometry(0.28, 0.32, 0.13),
    shoe: new THREE.BoxGeometry(0.15, 0.08, 0.24),
  };
}

type Human = { g: THREE.Group; legL: THREE.Group; legR: THREE.Group; armL: THREE.Group; armR: THREE.Group; body: THREE.Group };

// Postava hledí do −z (směr běhu), takže kamera vidí záda a batoh.
function buildHuman(kit: Kit, o: { shirt: number; pants: number; hair: number; pack: number; skin?: number; cap?: boolean }): Human {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const shirt = new THREE.MeshLambertMaterial({ color: o.shirt });
  const pants = new THREE.MeshLambertMaterial({ color: o.pants });
  const skin = new THREE.MeshLambertMaterial({ color: o.skin ?? 0xffd2b0 });
  const hairM = new THREE.MeshLambertMaterial({ color: o.hair });
  const packM = new THREE.MeshLambertMaterial({ color: o.pack });
  const dark = new THREE.MeshBasicMaterial({ color: 0x16132b });
  const shoeM = new THREE.MeshLambertMaterial({ color: 0xffffff });

  const torso = new THREE.Mesh(kit.torso, shirt);
  torso.position.y = 0.8;
  body.add(torso);
  const pack = new THREE.Mesh(kit.pack, packM);
  pack.position.set(0, 0.82, 0.19);
  body.add(pack);
  const head = new THREE.Mesh(kit.head, skin);
  head.position.y = 1.23;
  body.add(head);
  const hair = new THREE.Mesh(kit.hair, o.cap ? packM : hairM);
  hair.position.y = 1.24;
  hair.rotation.x = -0.15;
  body.add(hair);
  for (const x of [-0.075, 0.075]) {
    const eye = new THREE.Mesh(kit.eye, dark);
    eye.position.set(x, 1.25, -0.185);
    body.add(eye);
  }

  const mkLimb = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, off: number, withShoe: boolean) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = off;
    pivot.add(m);
    if (withShoe) {
      const s = new THREE.Mesh(kit.shoe, shoeM);
      s.position.set(0, off - 0.2, -0.04);
      pivot.add(s);
    }
    body.add(pivot);
    return pivot;
  };
  const armL = mkLimb(kit.arm, skin, -0.25, 0.98, -0.17, false);
  const armR = mkLimb(kit.arm, skin, 0.25, 0.98, -0.17, false);
  const legL = mkLimb(kit.leg, pants, -0.09, 0.58, -0.2, true);
  const legR = mkLimb(kit.leg, pants, 0.09, 0.58, -0.2, true);
  return { g, legL, legR, armL, armR, body };
}

// Běžecký cyklus: nohy a ruce se kývají proti sobě, tělo mírně poskakuje.
function animateHuman(h: Human, clock: number, phase: number, run: number, hop: number) {
  const s = Math.sin(clock * 11 + phase);
  const idle = Math.sin(clock * 2 + phase) * 0.03;
  h.legL.rotation.x = s * 0.95 * run;
  h.legR.rotation.x = -s * 0.95 * run;
  // ve vzduchu (skok do strany) jsou nohy pokrčené a ruce nahoře
  h.legL.rotation.x += hop * -0.6;
  h.legR.rotation.x += hop * 0.4;
  h.armL.rotation.x = -s * 0.9 * run + idle - hop * 1.2;
  h.armR.rotation.x = s * 0.9 * run - idle - hop * 1.2;
  h.armL.rotation.z = 0.08 + hop * 0.5;
  h.armR.rotation.z = -0.08 - hop * 0.5;
  h.body.position.y = Math.abs(s) * 0.09 * run + idle * 0.5;
  h.body.rotation.x = -0.12 * run; // předklon při běhu
}

// ----- Boss

type Boss = {
  root: THREE.Group;
  body: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  mouth: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  hpFill: THREE.Mesh;
};

function buildBoss(): Boss {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const mat = new THREE.MeshLambertMaterial({ color: 0xff5a8a });
  const belly = new THREE.MeshLambertMaterial({ color: 0xffc2d6 });
  const gold = new THREE.MeshLambertMaterial({ color: 0xffc933 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const dark = new THREE.MeshBasicMaterial({ color: 0x16132b });

  const torso = new THREE.Mesh(new THREE.SphereGeometry(1.9, 24, 18), mat);
  torso.scale.set(1.1, 1, 0.9);
  torso.position.y = 2.1;
  body.add(torso);
  const tummy = new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 14), belly);
  tummy.scale.set(1, 1, 0.5);
  tummy.position.set(0, 1.8, 1.35);
  body.add(tummy);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 18), mat);
  head.position.y = 4.35;
  body.add(head);
  for (const x of [-0.8, 0.8]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.3, 10), gold);
    horn.position.set(x, 5.6, 0);
    horn.rotation.z = -x * 0.35;
    body.add(horn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), white);
    eye.position.set(x * 0.7, 4.6, 1.0);
    body.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), dark);
    pupil.position.set(x * 0.7, 4.55, 1.35);
    body.add(pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.14), dark);
    brow.position.set(x * 0.7, 5.12, 1.12);
    brow.rotation.z = x * 0.45; // zamračený pohled
    body.add(brow);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.2), dark);
  mouth.position.set(0, 3.75, 1.15);
  body.add(mouth);
  for (const x of [-0.4, -0.13, 0.13, 0.4]) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), white);
    tooth.position.set(x, 3.92, 1.28);
    tooth.rotation.x = Math.PI;
    body.add(tooth);
  }

  const mkArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 2.2, 3.1, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.3, 4, 10), mat);
    arm.position.y = -0.9;
    pivot.add(arm);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 10), gold);
    fist.position.y = -1.9;
    pivot.add(fist);
    body.add(pivot);
    return pivot;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);
  for (const x of [-0.9, 0.9]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.6, 4, 10), mat);
    leg.position.set(x, 0.55, 0);
    body.add(leg);
  }

  const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.5), new THREE.MeshBasicMaterial({ color: 0x2a1a6b }));
  hpBack.position.set(0, 7.2, 1.3);
  root.add(hpBack);
  const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.34), new THREE.MeshBasicMaterial({ color: 0x17a864 }));
  hpFill.position.set(0, 7.2, 1.32);
  root.add(hpFill);
  return { root, body, armL, armR, mouth, mat, hpFill };
}

// ----- Krajina

function buildMountain(r: number, h: number, color: number): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), new THREE.MeshLambertMaterial({ color, flatShading: true }));
  m.position.y = h / 2;
  g.add(m);
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(r * 0.34, h * 0.3, 6),
    new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
  );
  cap.position.y = h * 0.86;
  g.add(cap);
  return g;
}

function buildTree(variant: number): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 8), new THREE.MeshLambertMaterial({ color: 0x8a5a36 }));
  trunk.position.y = 0.8;
  g.add(trunk);
  const greens = [0x3fb46a, 0x2f9e5a, 0x56c97a];
  const leaf = new THREE.MeshLambertMaterial({ color: greens[variant % greens.length], flatShading: true });
  if (variant % 2 === 0) {
    for (let k = 0; k < 3; k++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(1.5 - k * 0.32, 1.9, 8), leaf);
      c.position.y = 2.3 + k * 1.1;
      g.add(c);
    }
  } else {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1.7, 12, 10), leaf);
    b.position.y = 3.1;
    g.add(b);
  }
  const s = 0.85 + (variant % 3) * 0.2;
  g.scale.setScalar(s);
  return g;
}

function buildPlane(color: number): THREE.Group {
  const g = new THREE.Group();
  const bodyM = new THREE.MeshLambertMaterial({ color });
  const white = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 4, 4, 12), bodyM);
  fus.rotation.z = Math.PI / 2; // trup podél osy x
  g.add(fus);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 7), white);
  g.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 2.6), white);
  tail.position.x = -2.5;
  g.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(1, 1.3, 0.12), bodyM);
  fin.position.set(-2.5, 0.7, 0);
  g.add(fin);
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshBasicMaterial({ color: 0x16132b }));
  win.position.set(1.2, 0.4, 0);
  g.add(win);
  const prop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.2), white);
  prop.name = "prop";
  prop.position.x = 2.9;
  g.add(prop);
  return g;
}

// Číslo nad partou: kolik nás je.
function drawCount(ctx: CanvasRenderingContext2D | null, n: number) {
  if (!ctx) return;
  ctx.clearRect(0, 0, 256, 128);
  ctx.fillStyle = "#2a1a6b";
  roundRectPath(ctx, 40, 14, 176, 100, 40);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 72px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(n), 128, 66);
}

export function RunnerGame({
  locale,
  courseSlug,
  backHref,
  questions,
  level,
}: {
  locale: "cs" | "en" | string;
  courseSlug: string;
  backHref: string;
  questions: GameQuestion[];
  level: number;
}) {
  const t = locale === "en" ? TXT.en : TXT.cs;
  const rowCount = runLength(level);
  const [round, setRound] = useState(0);
  // round mění plán při „Hrát znovu“.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo<RunnerPlan | null>(() => buildRunnerPlan(questions, rowCount), [questions, rowCount, round]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [crew, setCrew] = useState(RUNNER_START_CREW);
  const [rowsDone, setRowsDone] = useState(0);
  const [bossHp, setBossHp] = useState(RUNNER_BOSS_HITS);
  const [bossIdx, setBossIdx] = useState(0);
  const [revealed, setRevealed] = useState<{ picked: number; ok: boolean } | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [best, setBest] = useState<Best | null>(null);

  const hostRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  // Ovládání z tlačítek a klávesnice: vyplní je efekt níže (scéna a smyčka).
  const api = useRef<{ start: () => void; move: (dir: -1 | 1) => void; answer: (i: number) => void; next: () => void } | null>(null);

  useEffect(() => {
    setBest(readBest("runner", courseSlug, level)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [courseSlug, level]);

  // Scéna, smyčka, vstup. Běží znovu jen při nové hře (round) nebo jiném kurzu.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !plan) return;
    const rows = plan.rows;
    const bossQs: RunnerBossQuestion[] = plan.boss;
    const bossLocalZ = ROW_START - rows.length * ROW_GAP;
    const stopD = BOSS_STOP_Z - bossLocalZ;

    // Stav hry (zdroj pravdy); React jen zrcadlí, co se má ukázat.
    const sim = {
      phase: "ready" as Phase,
      d: 0,
      x: RUNNER_LANES[1],
      lane: 1 as 0 | 1 | 2,
      crew: RUNNER_START_CREW,
      nextRow: 0,
      bossHp: RUNNER_BOSS_HITS,
      bossIdx: 0,
      busy: false,
      results: [] as AnswerResult[],
      shake: 0,
      bossShake: 0,
      bossLunge: 0,
      bossDown: 0,
      pulse: 0,
      hopT: 0,
      hopDir: 0,
      runAmt: 0,
      feedbackTimer: 0,
      projectiles: [] as { mesh: THREE.Mesh; t: number; from: THREE.Vector3; to: THREE.Vector3 }[],
    };

    // ----- Renderer a scéna (vyšší rozlišení: supersampling i na běžných displejích)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2.5));
    texAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(FOG, 70, 240);
    const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 500);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6fbf7a, 1.2));
    const sun = new THREE.DirectionalLight(0xfff3d6, 1.0);
    sun.position.set(-8, 14, 6);
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);

    // Silnice a trávník
    const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 560), new THREE.MeshLambertMaterial({ color: 0x8f86c9 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -210);
    scene.add(road);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 560), new THREE.MeshLambertMaterial({ color: 0x7fd28f }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, -210);
    scene.add(ground);
    for (const x of [-ROAD_W / 2 - 0.2, ROAD_W / 2 + 0.2]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 560), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      curb.position.set(x, 0.05, -210);
      scene.add(curb);
    }

    // Slunce (mimo mlhu) a záře
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 18), new THREE.MeshBasicMaterial({ color: 0xfff4c2, fog: false }));
    sunDisc.position.set(-55, 62, -300);
    scene.add(sunDisc);
    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(16, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0xfff4c2, transparent: true, opacity: 0.3, fog: false }),
    );
    sunGlow.position.copy(sunDisc.position);
    scene.add(sunGlow);

    // Hory na obzoru (pevné) a nízké kopce po stranách
    const mountainColors = [0x7c8fd6, 0x8b7fd0, 0x6f9ad8, 0x9a8fd9];
    for (let i = 0; i < 16; i++) {
      const r = 22 + ((i * 7) % 5) * 5;
      const h = 26 + ((i * 11) % 6) * 6;
      const m = buildMountain(r, h, mountainColors[i % mountainColors.length]);
      m.position.set(-170 + i * 22 + ((i * 13) % 7), 0, -265 - ((i * 5) % 4) * 14);
      scene.add(m);
    }
    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshLambertMaterial({ color: i % 3 === 0 ? 0x5fc47a : 0x74d28b }));
      const sx = 22 + ((i * 9) % 5) * 7;
      hill.scale.set(sx, 7 + ((i * 3) % 4) * 2.5, 22 + ((i * 5) % 4) * 6);
      hill.position.set(side * (50 + ((i * 17) % 60)), -1, -90 - i * 22);
      scene.add(hill);
    }

    // Pruhy mezi drahami (recyklují se, ať běh nemá konec)
    const dashGeo = new THREE.BoxGeometry(0.08, 0.02, 2.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const dashes: { mesh: THREE.Mesh; i: number; x: number }[] = [];
    for (const x of [-1.15, 1.15]) {
      for (let i = 0; i < 30; i++) {
        const m = new THREE.Mesh(dashGeo, dashMat);
        m.position.x = x;
        scene.add(m);
        dashes.push({ mesh: m, i, x });
      }
    }

    // Stromy podél cesty (recyklují se jako pruhy)
    const trees: { g: THREE.Group; i: number; x: number }[] = [];
    for (let i = 0; i < 18; i++) {
      for (const side of [-1, 1]) {
        const g = buildTree(i + (side > 0 ? 1 : 0));
        const x = side * (ROAD_W / 2 + 3 + ((i * 7) % 5) * 2.6);
        scene.add(g);
        trees.push({ g, i: i * 2 + (side > 0 ? 1 : 0), x });
      }
    }

    // Mraky nad drahou: pomalu plynou, takže dávají pocit hloubky
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    const clouds: { g: THREE.Group; i: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const g = new THREE.Group();
      const puffs = 3 + (i % 3);
      for (let k = 0; k < puffs; k++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.3 + ((k * 7 + i) % 3) * 0.5, 12, 10), cloudMat);
        puff.position.set((k - puffs / 2) * 1.8, ((k * 3 + i) % 2) * 0.5, (((k * 5 + i) % 3) - 1) * 0.8);
        g.add(puff);
      }
      scene.add(g);
      clouds.push({ g, i });
    }

    // Letadla přelétají oblohu zprava doleva a zpět
    const planes = [
      { g: buildPlane(0xff5a8a), y: 24, z: -90, speed: 11, off: 0 },
      { g: buildPlane(0x3248f0), y: 31, z: -140, speed: -8, off: 70 },
      { g: buildPlane(0xffc933), y: 19, z: -60, speed: 14, off: 130 },
    ];
    for (const p of planes) scene.add(p.g);

    // Brány a tabule (řada i je na world.z = ROW_START - i * ROW_GAP)
    const rowObjects: THREE.Group[] = [];
    rows.forEach((row, i) => {
      const grp = new THREE.Group();
      grp.position.z = ROW_START - i * ROW_GAP;
      row.gates.forEach((gate, lane) => {
        const gobj = buildGate(gate.label);
        gobj.position.x = RUNNER_LANES[lane];
        grp.add(gobj);
      });
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(7.6, 1.6),
        new THREE.MeshBasicMaterial({ map: labelTexture(row.prompt, "#3248f0", "#ffffff", 2432, 512), transparent: true, side: THREE.DoubleSide }),
      );
      sign.position.set(0, 4.5, 0);
      grp.add(sign);
      for (const x of [-3.7, 3.7]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.5, 0.18), new THREE.MeshLambertMaterial({ color: 0x5b2fd6 }));
        p.position.set(x, 2.25, 0);
        grp.add(p);
      }
      world.add(grp);
      rowObjects.push(grp);
    });

    // Boss na konci trati
    const boss = buildBoss();
    boss.root.position.z = bossLocalZ;
    world.add(boss.root);

    // Hrdina a parta
    const kit = makeKit();
    const crowdGroup = new THREE.Group();
    scene.add(crowdGroup);
    const hero = buildHuman(kit, { shirt: 0xffc933, pants: 0x3248f0, hair: 0x4a2c17, pack: 0xff5a8a, cap: true });
    hero.g.scale.setScalar(1.35);
    hero.g.position.z = HERO_Z;
    crowdGroup.add(hero.g);
    const shirts = [0xffffff, 0xffe36b, 0xff9ad5, 0x8fd0ff, 0xa6f0b8];
    const hairs = [0x2a1a14, 0x6b4423, 0xd9a441, 0x1c1c1c];
    const members: { h: Human; s: number }[] = [];
    for (let i = 0; i < MAX_VISIBLE_CREW; i++) {
      const h = buildHuman(kit, {
        shirt: shirts[i % shirts.length],
        pants: i % 2 ? 0x5b2fd6 : 0x2a3a8a,
        hair: hairs[i % hairs.length],
        pack: shirts[(i + 2) % shirts.length],
      });
      h.g.scale.setScalar(0.9);
      h.g.visible = false;
      crowdGroup.add(h.g);
      members.push({ h, s: 0 });
    }

    // Počítadlo party nad hlavou hrdiny
    const countCanvas = document.createElement("canvas");
    countCanvas.width = 256;
    countCanvas.height = 128;
    const countCtx = countCanvas.getContext("2d");
    drawCount(countCtx, sim.crew);
    const countTex = new THREE.CanvasTexture(countCanvas);
    countTex.colorSpace = THREE.SRGBColorSpace;
    const countSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: countTex, transparent: true, depthTest: false }));
    countSprite.scale.set(1.8, 0.9, 1);
    countSprite.position.set(0, 3.1, HERO_Z);
    crowdGroup.add(countSprite);
    const refreshCount = () => {
      drawCount(countCtx, sim.crew);
      countTex.needsUpdate = true;
    };

    const projGeo = new THREE.SphereGeometry(0.22, 12, 10);
    const projMat = new THREE.MeshBasicMaterial({ color: 0xfff33b });

    // ----- Velikost
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ----- Herní logika
    const setP = (p: Phase) => {
      sim.phase = p;
      setPhase(p);
    };
    const flash = (text: string, good: boolean, sub?: string) => {
      setFeedback({ id: Date.now() + Math.random(), text, good, sub });
      window.clearTimeout(sim.feedbackTimer);
      sim.feedbackTimer = window.setTimeout(() => setFeedback(null), 1800);
    };
    const pushResult = (id: string | undefined, correct: boolean) => {
      if (!id) return;
      sim.results.push({ id, correct });
    };
    const finish = (ok: boolean) => {
      setP(ok ? "won" : "lost");
      setResults([...sim.results]);
      setCrew(sim.crew);
    };

    const move = (dir: -1 | 1) => {
      if (sim.phase !== "run") return;
      const next = Math.min(2, Math.max(0, sim.lane + dir)) as 0 | 1 | 2;
      if (next === sim.lane) return;
      sim.lane = next;
      sim.hopT = 1; // skok do strany
      sim.hopDir = dir;
    };

    const start = () => {
      if (sim.phase !== "ready") return;
      setP("run");
    };

    // Výstřely party do bosse (vizuálně)
    const crowdShots = (c: number) => Math.max(1, Math.ceil(c / 8));
    const shoot = (k: number) => {
      const mesh = new THREE.Mesh(projGeo, projMat);
      const from = new THREE.Vector3(sim.x + (k - 1.5) * 0.4, 1.5, 0.3);
      const to = new THREE.Vector3(0, 3.0, boss.root.position.z + world.position.z + 1.6);
      mesh.position.copy(from);
      scene.add(mesh);
      sim.projectiles.push({ mesh, t: 0, from, to });
    };

    const answer = (i: number) => {
      if (sim.phase !== "boss" || sim.busy) return;
      const q = bossQs[sim.bossIdx % bossQs.length];
      const ok = i === q.correctIndex;
      sim.busy = true;
      pushResult(q.id, ok);
      if (ok) {
        sim.bossHp -= 1;
        sim.bossShake = 0.45;
        for (let k = 0; k < Math.min(crowdShots(sim.crew), 4); k++) shoot(k);
        setBossHp(sim.bossHp);
      } else {
        const before = sim.crew;
        sim.crew = bossOutcome(sim.crew, false);
        sim.shake = 0.5;
        sim.bossLunge = 0.6;
        setCrew(sim.crew);
        refreshCount();
        flash(t.bossWrongN.replace("{n}", String(before - sim.crew)), false, `${t.wrongWas} ${q.options[q.correctIndex]}`);
      }
      setRevealed({ picked: i, ok });
    };

    const next = () => {
      if (!sim.busy) return;
      sim.busy = false;
      setRevealed(null);
      if (sim.crew <= 0) return finish(false);
      if (sim.bossHp <= 0) return finish(true);
      sim.bossIdx += 1;
      setBossIdx(sim.bossIdx);
    };

    api.current = { start, move, answer, next };

    // ----- Vstup: tažení/švih a klik na půlky, klávesy
    let drag: { x: number; y: number; target: EventTarget | null } | null = null;
    const host = hostRef.current;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a")) return;
      drag = { x: e.clientX, y: e.clientY, target };
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const startX = drag.x;
      drag = null;
      if (Math.abs(dx) >= 30 && Math.abs(dx) > Math.abs(dy)) {
        move(dx < 0 ? -1 : 1);
        return;
      }
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30 && host) {
        const rect = host.getBoundingClientRect();
        const rel = (startX - rect.left) / rect.width;
        if (rel < 0.35) move(-1);
        else if (rel > 0.65) move(1);
      }
    };
    const onCancel = () => (drag = null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(-1);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(1);
      else if (e.key === "Enter" && sim.phase === "ready") start();
      else if (sim.phase === "boss" && !sim.busy && ["1", "2", "3", "4"].includes(e.key)) answer(Number(e.key) - 1);
      else if (sim.phase === "boss" && sim.busy && e.key === "Enter") next();
      else return;
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    host?.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);

    // ----- Smyčka
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const tmpV = new THREE.Vector3();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

      // Pohyb do stran
      const targetX = RUNNER_LANES[sim.lane];
      sim.x += (targetX - sim.x) * Math.min(1, dt * 11);
      sim.hopT = Math.max(0, sim.hopT - dt / 0.4);

      // Běh
      if (sim.phase === "run") {
        sim.d += SPEED * dt;
        // Průchod bránami: řada se vyhodnotí, až doběhne k hrdinovi (její z se blíží k 0 zepředu)
        while (sim.nextRow < rows.length) {
          const rz = ROW_START - sim.nextRow * ROW_GAP + sim.d;
          if (rz >= GATE_HIT_Z) {
            const row = rows[sim.nextRow];
            const gate = row.gates[sim.lane];
            const before = sim.crew;
            sim.crew = gateOutcome(sim.crew, gate.correct);
            pushResult(row.id, gate.correct);
            sim.nextRow += 1;
            sim.pulse = gate.correct ? 0.5 : 0;
            if (sim.crew !== before) sim.shake = gate.correct ? 0 : 0.35;
            setCrew(sim.crew);
            setRowsDone(sim.nextRow);
            refreshCount();
            if (gate.correct) flash(`${t.gained.replace("{n}", String(sim.crew - before))}`, true);
            else flash(t.lostN.replace("{n}", String(before - sim.crew)), false, `${t.wrongWas} ${row.correctLabel}`);
            if (sim.crew <= 0) {
              finish(false);
              break;
            }
          } else break;
        }
        // Boss se zastaví před hráčem
        if (sim.phase === "run" && sim.d >= stopD) {
          sim.d = stopD;
          setP("boss");
          setBossIdx(0);
          sim.bossIdx = 0;
        }
      }

      world.position.z = sim.d;
      // Rychlost animace běhu dobíhá plynule; mimo běh postavy stojí.
      sim.runAmt += ((sim.phase === "run" ? 1 : 0) - sim.runAmt) * Math.min(1, dt * 8);
      // Pohyb scenérie: když hráč neběží, krajina stojí (sim.d se nemění).

      // Silnice: pruhy se posouvají
      for (const dsh of dashes) {
        const z = -220 + ((dsh.i * 8 + sim.d) % 240);
        dsh.mesh.position.z = z;
        dsh.mesh.visible = z > -215 && z < 25;
      }

      // Stromy
      for (const tr of trees) {
        const z = -230 + ((tr.i * 7.2 + sim.d) % 240);
        tr.g.position.set(tr.x, 0, z);
        tr.g.visible = z > -225 && z < 14;
      }

      // Mraky: plynou pomaleji než silnice
      for (const c of clouds) {
        const z = -230 + ((c.i * 17 + sim.d * 0.6 + clock * 0.8) % 260);
        c.g.position.set(((c.i * 37) % 60) - 30, 13 + (c.i % 4) * 2.2, z);
        c.g.visible = z < 6;
      }

      // Letadla
      for (const p of planes) {
        const dir = p.speed > 0 ? 1 : -1;
        const x = ((clock * Math.abs(p.speed) + p.off) % 180) - 90;
        p.g.position.set(dir > 0 ? x : -x, p.y + Math.sin(clock * 0.9 + p.off) * 0.8, p.z);
        p.g.rotation.y = dir > 0 ? Math.PI : 0; // nos míří po směru letu
        p.g.rotation.x = Math.sin(clock * 1.3 + p.off) * 0.12;
        const prop = p.g.getObjectByName("prop");
        if (prop) prop.rotation.x = clock * 40;
      }

      // Hrdina a parta
      const shakeX = sim.shake > 0 ? Math.sin(clock * 60) * 0.12 * sim.shake : 0;
      sim.shake = Math.max(0, sim.shake - dt);
      sim.pulse = Math.max(0, sim.pulse - dt);
      const hopP = 1 - sim.hopT; // 0..1 průběh skoku
      const hopArc = sim.hopT > 0 ? Math.sin(Math.PI * hopP) : 0;
      crowdGroup.position.set(sim.x + shakeX, 0, 0);
      crowdGroup.scale.setScalar(1 + sim.pulse * 0.2);
      hero.g.position.y = hopArc * 0.95;
      hero.g.rotation.z = -sim.hopDir * hopArc * 0.45;
      animateHuman(hero, clock, 0, sim.runAmt, hopArc);
      countSprite.position.y = 3.1 + hopArc * 0.95 + Math.sin(clock * 3) * 0.05;

      const want = Math.min(sim.crew, MAX_VISIBLE_CREW);
      for (let i = 0; i < members.length; i++) {
        const mem = members[i];
        const target = i < want ? 1 : 0;
        mem.s += (target - mem.s) * Math.min(1, dt * 10);
        const vis = mem.s > 0.03;
        mem.h.g.visible = vis;
        if (!vis) continue;
        const col = i % 5;
        const row = Math.floor(i / 5);
        const jitter = Math.sin((i + 1) * 12.9898) * 0.08;
        // členové skáčou se zpožděním podle řady, takže skok proběhne partou jako vlna
        const p = Math.min(1, Math.max(0, hopP - row * 0.07));
        const mHop = sim.hopT > 0 ? Math.sin(Math.PI * p) : 0;
        mem.h.g.position.set((col - 2) * 0.5 + jitter, mHop * 0.6, 0.55 + row * 0.62);
        mem.h.g.scale.setScalar(0.9 * mem.s);
        mem.h.g.rotation.z = -sim.hopDir * mHop * 0.35;
        animateHuman(mem.h, clock, i * 0.9, sim.runAmt, mHop);
      }

      // Boss: dýchá, mává pěstmi, při zásahu bliká a padá, při špatné odpovědi udeří
      if (sim.bossShake > 0) sim.bossShake = Math.max(0, sim.bossShake - dt);
      if (sim.bossLunge > 0) sim.bossLunge = Math.max(0, sim.bossLunge - dt);
      if (sim.bossHp <= 0) sim.bossDown = Math.min(1, sim.bossDown + dt * 1.2);
      const lungeP = sim.bossLunge > 0 ? Math.sin(Math.PI * (1 - sim.bossLunge / 0.6)) : 0;
      boss.body.position.x = sim.bossShake > 0 ? Math.sin(clock * 60) * 0.25 : 0;
      boss.body.position.y = Math.sin(clock * 2.2) * 0.12 - sim.bossDown * 2.2;
      boss.body.position.z = lungeP * 5;
      boss.body.rotation.x = -sim.bossDown * 1.45;
      boss.armL.rotation.x = Math.sin(clock * 3) * 0.3 - lungeP * 2.2;
      boss.armR.rotation.x = Math.sin(clock * 3 + Math.PI) * 0.3 - lungeP * 2.2;
      boss.armL.rotation.z = 0.25 + Math.sin(clock * 2) * 0.1;
      boss.armR.rotation.z = -0.25 - Math.sin(clock * 2) * 0.1;
      boss.mouth.scale.y = 1 + Math.abs(Math.sin(clock * 4)) * 0.8 + lungeP * 1.5;
      const flashK = sim.bossShake > 0 ? sim.bossShake * 2 : 0;
      boss.mat.emissive.setRGB(flashK, flashK * 0.2, flashK * 0.2);
      boss.hpFill.scale.x = Math.max(0.001, sim.bossHp / RUNNER_BOSS_HITS);
      boss.hpFill.position.x = -(1 - boss.hpFill.scale.x) * 2.0;

      // Výstřely
      for (let i = sim.projectiles.length - 1; i >= 0; i--) {
        const p = sim.projectiles[i];
        p.t += dt / 0.45;
        const k = Math.min(1, p.t);
        tmpV.lerpVectors(p.from, p.to, k);
        p.mesh.position.copy(tmpV);
        if (k >= 1) {
          scene.remove(p.mesh);
          sim.projectiles.splice(i, 1);
        }
      }

      // Kamera sleduje hráče (výš a blíž, ať jsou vidět brány i text)
      camera.position.set(sim.x * 0.35, 4.9, 8.2);
      camera.lookAt(sim.x * 0.25, 1.7, -12);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(sim.feedbackTimer);
      ro.disconnect();
      host?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      api.current = null;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
        if (mat) {
          mat.map?.dispose();
          mat.dispose();
        }
      });
      Object.values(kit).forEach((g) => g.dispose());
      countTex.dispose();
      projGeo.dispose();
      projMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Texty se mění jen s jazykem; hra se staví znovu jen pro nový plán.
  }, [plan, t]);

  // Výsledek hry: XP, rekord a zápis chyb do opakování (jednou za hru).
  const savedRound = useRef(-1);
  useEffect(() => {
    if (phase !== "won" && phase !== "lost") return;
    if (savedRound.current === round) return;
    savedRound.current = round;
    const right = results.filter((r) => r.correct).length;
    const total = results.length;
    const stars = runnerStars(right, total);
    saveBest("runner", courseSlug, level, { stars, score: crew });
    setBest(readBest("runner", courseSlug, level));
    const xp = phase === "won" ? 25 + Math.min(15, crew) : Math.min(20, 4 + right * 2);
    fetch("/api/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "game", amount: xp }),
    }).catch(() => {});
    const wrong = results.some((r) => !r.correct);
    if (wrong) {
      fetch("/api/opakovani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      }).catch(() => {});
    }
  }, [phase, round, results, crew, courseSlug, level]);

  if (plan === null) return <p className="card p-6">{t.noData}</p>;

  function restart() {
    setRound((n) => n + 1);
    setPhase("ready");
    setCrew(RUNNER_START_CREW);
    setRowsDone(0);
    setBossHp(RUNNER_BOSS_HITS);
    setBossIdx(0);
    setRevealed(null);
    setFeedback(null);
    setResults([]);
  }

  const bossQ = plan.boss[bossIdx % plan.boss.length];
  const right = results.filter((r) => r.correct).length;
  const stars = runnerStars(right, results.length);

  return (
    <GameFrame
      title={t.title}
      intro={t.intro}
      backHref={backHref}
      backLabel={t.back}
      stats={
        phase === "ready"
          ? undefined
          : [
              { label: t.crew, value: String(crew) },
              { label: t.gates, value: `${rowsDone}/${plan.rows.length}` },
              ...(phase === "boss" || bossHp < RUNNER_BOSS_HITS ? [{ label: t.boss, value: `${bossHp}/${RUNNER_BOSS_HITS}` }] : []),
            ]
      }
    >
      <div className="card p-3 sm:p-4">
        <div
          ref={hostRef}
          className="relative h-[min(78vh,720px)] min-h-[480px] w-full touch-none select-none overflow-hidden rounded-2xl"
          style={{ background: SKY_CSS }}
        >
          <div ref={mountRef} className="absolute inset-0" />

          {feedback && (
            <div
              key={feedback.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-2xl px-4 py-2 text-center text-lg font-extrabold text-white shadow-lg ${
                feedback.good ? "bg-[var(--accent-green)]" : "bg-[var(--danger)]"
              }`}
            >
              {feedback.text}
              {feedback.sub && <span className="block text-sm font-semibold">{feedback.sub}</span>}
            </div>
          )}

          {phase === "ready" && (
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 rounded-t-3xl bg-white/95 p-5 text-center text-[#16132b] shadow-xl">
              <p className="max-w-md text-sm text-[#4f4a66]">{t.controls}</p>
              {best && (
                <p className="text-xs font-semibold text-[#5f5978]">
                  {t.best}: {"⭐".repeat(best.stars)} · {best.score}
                </p>
              )}
              <button
                type="button"
                onClick={() => api.current?.start()}
                className="rounded-2xl bg-[var(--brand-500)] px-8 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-500)]"
              >
                {t.start}
              </button>
            </div>
          )}

          {phase === "boss" && (
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 rounded-t-3xl bg-white/95 p-4 text-[#16132b] shadow-xl sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#2336d1]">{t.bossFight}</p>
              <p className="text-base font-bold sm:text-lg">{bossQ.prompt}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bossQ.options.map((opt, i) => {
                  const isRight = revealed && i === bossQ.correctIndex;
                  const isWrong = revealed && revealed.picked === i && !revealed.ok;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!!revealed}
                      onClick={() => api.current?.answer(i)}
                      className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors ${
                        isRight
                          ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15"
                          : isWrong
                            ? "border-[var(--danger)] bg-[var(--danger)]/10"
                            : "border-[#e0dccf] bg-white text-[#16132b] hover:border-[#3248f0]"
                      }`}
                    >
                      <span className="mr-2 text-[#5f5978]">{i + 1}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#4f4a66]">{bossQ.explanation}</p>
                  <button
                    type="button"
                    onClick={() => api.current?.next()}
                    className="shrink-0 rounded-xl bg-[#3248f0] px-5 py-2 font-bold text-white"
                  >
                    {t.next}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#5f5978]">{t.bossHint}</p>
              )}
            </div>
          )}

          {(phase === "won" || phase === "lost") && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[rgba(44,20,96,0.55)] p-6 text-center text-white backdrop-blur-sm">
              <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {phase === "won" ? t.won : t.lost}
              </h2>
              <div aria-label={`${stars}/3`} className="text-3xl leading-none" aria-hidden>
                {"⭐".repeat(stars)}
                <span className="opacity-30">{"⭐".repeat(3 - stars)}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
                <span className="rounded-full bg-white/20 px-3 py-1.5">
                  {t.correctN}: {right}/{results.length}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1.5">
                  {t.crewEnd}: {crew}
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={restart} className="rounded-2xl bg-white px-6 py-3 font-bold text-[#2336d1]">
                  {t.again}
                </button>
                <Link href={backHref} className="rounded-2xl border-2 border-white/70 px-6 py-3 font-bold text-white">
                  {t.back}
                </Link>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-[#c9c3e0]">{t.controls}</p>
      </div>
    </GameFrame>
  );
}
