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
    coins: "Mince",
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
    coins: "Coins",
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

const GATE_BG = ["#fff1b8", "#c9f0ff", "#ffd0ea"];
const GATE_POST = [0xffa800, 0x2aa7e8, 0xe8479b];

// Brána jen s odpovědí (otázka je nahoře na obrazovce). Každá dráha má jinou barvu, nahoře se točí hvězda.
function buildGate(label: string, lane: number, ballMat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.MeshLambertMaterial({ color: GATE_POST[lane] });
  const beamMat = new THREE.MeshLambertMaterial({ color: 0xffc933 });
  const post = new THREE.CylinderGeometry(0.09, 0.11, 2.7, 10);
  for (const x of [-1.0, 1.0]) {
    const p = new THREE.Mesh(post, frame);
    p.position.set(x, 1.35, 0);
    g.add(p);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), ballMat);
    ball.position.set(x, 2.75, 0);
    g.add(ball);
  }
  const beam = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 2.0, 4, 10), beamMat);
  beam.rotation.z = Math.PI / 2;
  beam.position.set(0, 2.62, 0);
  g.add(beam);
  for (let k = -4; k <= 4; k++) {
    const fl = new THREE.Mesh(new THREE.CircleGeometry(0.13, 3), new THREE.MeshBasicMaterial({ color: RAINBOW[(k + 4) % 7], side: THREE.DoubleSide }));
    fl.position.set(k * 0.22, 2.4 - Math.abs(k) * 0.01, 0.02);
    fl.rotation.z = Math.PI / 2 + Math.PI / 3;
    g.add(fl);
  }
  const star = new THREE.Mesh(starGeometry(0.34, 0.1), beamMat);
  star.name = "star";
  star.position.set(0, 3.15, 0);
  g.add(star);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.86, 2.28),
    new THREE.MeshBasicMaterial({ map: labelTexture(label, GATE_BG[lane], "#2a1a6b", 768, 944), transparent: true, side: THREE.DoubleSide }),
  );
  panel.position.set(0, 1.3, 0.02);
  g.add(panel);
  return g;
}

type Particle = { m: THREE.Mesh; v: THREE.Vector3; life: number; max: number; kind: "conf" | "puff" | "spark" };

// ----- Postavy

type Hat = "cap" | "party" | "beanie" | "hair" | "crown";
type Ears = "none" | "cat" | "bunny" | "bear";
type Kit = Record<
  | "torso" | "head" | "hairCap" | "eyeW" | "eyeP" | "shine" | "cheek" | "smile" | "arm" | "hand" | "leg" | "shoe" | "pack"
  | "cone" | "pom" | "brim" | "crown" | "cape" | "spike" | "catEar" | "bunnyEar" | "bearEar" | "tailCat" | "tailPom"
  | "belt" | "scarfRing" | "scarfSeg" | "star" | "tuft",
  THREE.BufferGeometry
>;

function starGeometry(r: number, depth: number): THREE.ExtrudeGeometry {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) sh.moveTo(x, y);
    else sh.lineTo(x, y);
  }
  sh.closePath();
  return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
}

function makeKit(): Kit {
  return {
    torso: new THREE.CapsuleGeometry(0.17, 0.2, 6, 14),
    head: new THREE.SphereGeometry(0.28, 26, 20),
    hairCap: new THREE.SphereGeometry(0.295, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    eyeW: new THREE.SphereGeometry(0.075, 14, 10),
    eyeP: new THREE.SphereGeometry(0.045, 10, 8),
    shine: new THREE.SphereGeometry(0.016, 6, 5),
    cheek: new THREE.CircleGeometry(0.05, 12),
    smile: new THREE.TorusGeometry(0.07, 0.015, 6, 14, Math.PI),
    arm: new THREE.CapsuleGeometry(0.055, 0.16, 4, 8),
    hand: new THREE.SphereGeometry(0.07, 10, 8),
    leg: new THREE.CapsuleGeometry(0.075, 0.12, 4, 8),
    shoe: new THREE.SphereGeometry(0.1, 12, 8),
    pack: new THREE.BoxGeometry(0.24, 0.28, 0.12),
    cone: new THREE.ConeGeometry(0.16, 0.38, 12),
    pom: new THREE.SphereGeometry(0.065, 10, 8),
    brim: new THREE.CylinderGeometry(0.2, 0.2, 0.035, 18),
    crown: new THREE.CylinderGeometry(0.2, 0.17, 0.12, 12),
    cape: new THREE.PlaneGeometry(0.46, 0.64, 1, 4),
    spike: new THREE.ConeGeometry(0.05, 0.14, 6),
    catEar: new THREE.ConeGeometry(0.1, 0.2, 4),
    bunnyEar: new THREE.CapsuleGeometry(0.055, 0.22, 4, 8),
    bearEar: new THREE.SphereGeometry(0.1, 10, 8),
    tailCat: new THREE.CapsuleGeometry(0.04, 0.3, 4, 8),
    tailPom: new THREE.SphereGeometry(0.1, 10, 8),
    belt: new THREE.TorusGeometry(0.175, 0.028, 6, 18),
    scarfRing: new THREE.TorusGeometry(0.17, 0.055, 8, 18),
    scarfSeg: new THREE.BoxGeometry(0.13, 0.04, 0.16),
    star: starGeometry(0.085, 0.025),
    tuft: new THREE.SphereGeometry(0.065, 8, 6),
  };
}

type Human = {
  g: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  eyes: THREE.Mesh[];
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  cape: THREE.Group | null;
  tail: THREE.Group | null;
  ears: THREE.Group[];
  scarf: THREE.Group[];
};

type HumanOpts = {
  shirt: number;
  pants: number;
  hair: number;
  accent: number;
  hat: Hat;
  skin?: number;
  eye?: number;
  ears?: Ears;
  tail?: boolean;
  cape?: number;
  scarf?: number[];
  pack?: boolean;
  badge?: boolean;
};

// Barevná postavička s velkou hlavou hledí do −z (směr běhu): kamera vidí záda, plášť, šálu a ocásek.
// Při čekání a výhře se otočí k hráči a mává.
function buildHuman(kit: Kit, o: HumanOpts): Human {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const shirt = new THREE.MeshLambertMaterial({ color: o.shirt });
  const pants = new THREE.MeshLambertMaterial({ color: o.pants });
  const skin = new THREE.MeshLambertMaterial({ color: o.skin ?? 0xffd2b0 });
  const hairM = new THREE.MeshLambertMaterial({ color: o.hair });
  const accent = new THREE.MeshLambertMaterial({ color: o.accent });
  const gold = new THREE.MeshLambertMaterial({ color: 0xffc933, emissive: 0x553a00 });
  const dark = new THREE.MeshBasicMaterial({ color: 0x16132b });
  const iris = new THREE.MeshBasicMaterial({ color: o.eye ?? 0x2a1a6b });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pink = new THREE.MeshBasicMaterial({ color: 0xff8fa8, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const shoeM = new THREE.MeshLambertMaterial({ color: o.accent });

  const torso = new THREE.Mesh(kit.torso, shirt);
  torso.position.y = 0.62;
  body.add(torso);
  const belt = new THREE.Mesh(kit.belt, accent);
  belt.position.y = 0.5;
  belt.rotation.x = Math.PI / 2;
  body.add(belt);
  if (o.pack) {
    const pack = new THREE.Mesh(kit.pack, accent);
    pack.position.set(0, 0.64, 0.19);
    body.add(pack);
  }

  // Hlava: pivot v místě hlavy, aby se mohla naklánět a kývat
  const head = new THREE.Group();
  head.position.y = 1.05;
  body.add(head);
  head.add(new THREE.Mesh(kit.head, skin));
  const eyes: THREE.Mesh[] = [];
  for (const x of [-0.1, 0.1]) {
    const eye = new THREE.Mesh(kit.eyeW, white);
    eye.position.set(x, 0.03, -0.235);
    eye.scale.z = 0.7;
    head.add(eye);
    const pupil = new THREE.Mesh(kit.eyeP, iris);
    pupil.position.set(0, 0, -0.045);
    eye.add(pupil);
    const core = new THREE.Mesh(kit.eyeP, dark);
    core.scale.setScalar(0.55);
    core.position.set(0, 0, -0.03);
    pupil.add(core);
    const sh = new THREE.Mesh(kit.shine, white);
    sh.position.set(0.018, 0.022, -0.04);
    pupil.add(sh);
    eyes.push(eye);
    const cheek = new THREE.Mesh(kit.cheek, pink);
    cheek.position.set(x * 1.75, -0.06, -0.215);
    cheek.rotation.y = Math.PI + (x > 0 ? -0.5 : 0.5);
    head.add(cheek);
  }
  const smile = new THREE.Mesh(kit.smile, dark);
  smile.position.set(0, -0.08, -0.268);
  smile.rotation.z = Math.PI;
  head.add(smile);

  // Uši (kočka, králík, medvěd)
  const ears: THREE.Group[] = [];
  const earKind = o.ears ?? "none";
  if (earKind !== "none") {
    const earM = earKind === "bunny" ? new THREE.MeshLambertMaterial({ color: 0xffffff }) : hairM;
    const inner = new THREE.MeshLambertMaterial({ color: 0xff9fb2 });
    for (const side of [-1, 1]) {
      const pv = new THREE.Group();
      if (earKind === "cat") {
        pv.position.set(side * 0.17, 0.2, 0);
        const m = new THREE.Mesh(kit.catEar, earM);
        m.position.y = 0.1;
        pv.add(m);
        const im = new THREE.Mesh(kit.catEar, inner);
        im.scale.set(0.55, 0.6, 0.55);
        im.position.set(0, 0.08, -0.04);
        pv.add(im);
        pv.rotation.z = -side * 0.35;
      } else if (earKind === "bunny") {
        pv.position.set(side * 0.1, 0.25, 0);
        const m = new THREE.Mesh(kit.bunnyEar, earM);
        m.position.y = 0.17;
        pv.add(m);
        const im = new THREE.Mesh(kit.bunnyEar, inner);
        im.scale.set(0.5, 0.8, 0.4);
        im.position.set(0, 0.17, -0.035);
        pv.add(im);
        pv.rotation.z = -side * 0.18;
      } else {
        pv.position.set(side * 0.2, 0.19, 0);
        const m = new THREE.Mesh(kit.bearEar, earM);
        pv.add(m);
        const im = new THREE.Mesh(kit.bearEar, inner);
        im.scale.setScalar(0.55);
        im.position.z = -0.05;
        pv.add(im);
      }
      head.add(pv);
      ears.push(pv);
    }
  }

  // Čepice podle typu
  if (o.hat === "hair" || o.hat === "cap" || o.hat === "beanie") {
    const cap = new THREE.Mesh(kit.hairCap, o.hat === "hair" ? hairM : accent);
    cap.rotation.x = -0.2;
    head.add(cap);
    if (o.hat === "hair") {
      for (const x of [-0.07, 0, 0.07]) {
        const tuft = new THREE.Mesh(kit.tuft, hairM);
        tuft.position.set(x, 0.3 + (x === 0 ? 0.04 : 0), -0.05);
        tuft.scale.set(1, 1.7, 1);
        head.add(tuft);
      }
    }
    if (o.hat === "cap") {
      const brim = new THREE.Mesh(kit.brim, accent);
      brim.position.set(0, 0.17, -0.26);
      brim.rotation.x = 0.35;
      brim.scale.set(1, 1, 0.7);
      head.add(brim);
    }
    if (o.hat === "beanie") {
      const pom = new THREE.Mesh(kit.pom, white);
      pom.position.y = 0.31;
      pom.scale.setScalar(1.4);
      head.add(pom);
    }
  } else if (o.hat === "party") {
    const cone = new THREE.Mesh(kit.cone, accent);
    cone.position.y = 0.46;
    cone.rotation.z = 0.12;
    head.add(cone);
    const pom = new THREE.Mesh(kit.pom, gold);
    pom.position.set(-0.03, 0.66, 0);
    head.add(pom);
  } else {
    const crown = new THREE.Mesh(kit.crown, gold);
    crown.position.y = 0.3;
    head.add(crown);
    const gems = [0xff3b5c, 0x3aa8ff, 0x3fcf6a, 0xb46bff, 0xff8a3d];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const sp = new THREE.Mesh(kit.spike, gold);
      sp.position.set(Math.cos(a) * 0.17, 0.4, Math.sin(a) * 0.17);
      head.add(sp);
      const gem = new THREE.Mesh(kit.pom, new THREE.MeshBasicMaterial({ color: gems[k] }));
      gem.scale.setScalar(0.55);
      gem.position.set(Math.cos(a) * 0.2, 0.3, Math.sin(a) * 0.2);
      head.add(gem);
    }
  }

  // Plášť (hrdina): vlaje za zády, na něm hvězda
  let cape: THREE.Group | null = null;
  if (o.cape !== undefined) {
    cape = new THREE.Group();
    cape.position.set(0, 0.86, 0.15);
    const c = new THREE.Mesh(kit.cape, new THREE.MeshLambertMaterial({ color: o.cape, side: THREE.DoubleSide }));
    c.position.y = -0.31;
    cape.add(c);
    body.add(cape);
  }
  if (o.badge) {
    const st = new THREE.Mesh(kit.star, gold);
    if (cape) {
      st.position.set(0, -0.31, 0.012);
      st.rotation.y = Math.PI;
      cape.add(st);
    } else {
      st.position.set(0, 0.66, 0.19);
      body.add(st);
    }
  }

  // Duhová šála: kroužek kolem krku a vlající článek za článkem
  const scarf: THREE.Group[] = [];
  if (o.scarf && o.scarf.length) {
    const ring = new THREE.Mesh(kit.scarfRing, new THREE.MeshLambertMaterial({ color: o.scarf[0] }));
    ring.position.y = 0.84;
    ring.rotation.x = Math.PI / 2;
    body.add(ring);
    let parent: THREE.Group = new THREE.Group();
    parent.position.set(0, 0.84, 0.16);
    body.add(parent);
    o.scarf.forEach((c, k) => {
      const seg = new THREE.Mesh(kit.scarfSeg, new THREE.MeshLambertMaterial({ color: c }));
      seg.position.z = 0.07;
      parent.add(seg);
      scarf.push(parent);
      const next = new THREE.Group();
      next.position.z = 0.15;
      parent.add(next);
      parent = next;
      void k;
    });
  }

  // Ocásek (kočka dlouhý, králík chomáč)
  let tail: THREE.Group | null = null;
  if (o.tail) {
    tail = new THREE.Group();
    tail.position.set(0, 0.42, 0.17);
    if (earKind === "cat") {
      const m = new THREE.Mesh(kit.tailCat, hairM);
      m.position.y = 0.16;
      tail.add(m);
      tail.rotation.x = 0.7;
    } else {
      tail.add(new THREE.Mesh(kit.tailPom, white));
    }
    body.add(tail);
  }

  const mkLimb = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, off: number, tip: "hand" | "shoe") => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = off;
    pivot.add(m);
    if (tip === "hand") {
      const h = new THREE.Mesh(kit.hand, skin);
      h.position.y = off - 0.14;
      pivot.add(h);
    } else {
      const s = new THREE.Mesh(kit.shoe, shoeM);
      s.position.set(0, off - 0.14, -0.03);
      s.scale.set(1, 0.65, 1.35);
      pivot.add(s);
    }
    body.add(pivot);
    return pivot;
  };
  const armL = mkLimb(kit.arm, shirt, -0.25, 0.78, -0.1, "hand");
  const armR = mkLimb(kit.arm, shirt, 0.25, 0.78, -0.1, "hand");
  const legL = mkLimb(kit.leg, pants, -0.09, 0.36, -0.1, "shoe");
  const legR = mkLimb(kit.leg, pants, 0.09, 0.36, -0.1, "shoe");
  return { g, body, head, eyes, legL, legR, armL, armR, cape, tail, ears, scarf };
}

// Animace: běžecký cyklus, squash & stretch, kývání hlavy, mrkání, vlající plášť a šála, ocásek a uši;
// wave (0..1) zvedne ruku a zamává.
function animateHuman(h: Human, clock: number, phase: number, run: number, hop: number, wave = 0) {
  const s = Math.sin(clock * 11 + phase);
  const idle = Math.sin(clock * 2 + phase) * 0.03;
  h.legL.rotation.x = s * 1.0 * run - hop * 0.6;
  h.legR.rotation.x = -s * 1.0 * run + hop * 0.4;
  h.armL.rotation.x = -s * 1.0 * run + idle - hop * 1.4;
  h.armR.rotation.x = (s * 1.0 * run - idle - hop * 1.4) * (1 - wave);
  h.armL.rotation.z = 0.1 + hop * 0.6;
  h.armR.rotation.z = -0.1 - hop * 0.6 - wave * (2.5 + Math.sin(clock * 9 + phase) * 0.35);
  h.body.position.y = Math.abs(s) * 0.11 * run + idle * 0.5;
  h.body.rotation.x = -0.15 * run;
  const sq = Math.cos(clock * 22 + phase * 2) * 0.035 * run + hop * 0.05 + Math.sin(clock * 3 + phase) * 0.012;
  h.body.scale.set(1 - sq, 1 + sq, 1 - sq);
  h.head.rotation.z = Math.sin(clock * 5.5 + phase) * 0.09 * run + idle + wave * Math.sin(clock * 4 + phase) * 0.12;
  h.head.rotation.x = Math.sin(clock * 11 + phase + 1) * 0.05 * run;
  const blink = Math.sin(clock * 0.9 + phase * 1.7) > 0.985 ? 0.1 : 1;
  for (const e of h.eyes) e.scale.y = blink;
  if (h.cape) h.cape.rotation.x = -(0.2 + run * 0.55 + hop * 0.5 + Math.sin(clock * 13 + phase) * 0.12 * (0.3 + run));
  h.scarf.forEach((sg, k) => {
    sg.rotation.x = -0.12 - run * 0.1 + Math.sin(clock * 13 - k * 0.9 + phase) * (0.12 + run * 0.3);
    sg.rotation.y = Math.sin(clock * 9 - k * 0.7 + phase) * (0.1 + run * 0.25);
  });
  if (h.tail) h.tail.rotation.y = Math.sin(clock * (6 + run * 10) + phase) * (0.35 + run * 0.35);
  h.ears.forEach((e, k) => {
    e.rotation.x = Math.sin(clock * 11 + phase + k * 0.5) * 0.25 * run + hop * 0.5 + Math.sin(clock * 2.5 + phase + k) * 0.05;
  });
}

// ----- Boss

type Boss = {
  root: THREE.Group;
  body: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  wingL: THREE.Group;
  wingR: THREE.Group;
  tail: THREE.Group[];
  crest: THREE.Mesh[];
  mouth: THREE.Mesh;
  tongue: THREE.Mesh;
  eyes: THREE.Mesh[];
  pupils: THREE.Mesh[];
  pupMat: THREE.MeshBasicMaterial;
  stars: THREE.Group;
  mat: THREE.MeshLambertMaterial;
  hpFill: THREE.Mesh;
};

const RAINBOW = [0xff3b5c, 0xff8a3d, 0xffd93d, 0x3fcf6a, 0x3aa8ff, 0x5b4bff, 0xb46bff];

function buildBoss(): Boss {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const mat = new THREE.MeshLambertMaterial({ color: 0xff5a8a });
  const belly = new THREE.MeshLambertMaterial({ color: 0xffd9e6 });
  const gold = new THREE.MeshLambertMaterial({ color: 0xffc933, emissive: 0x553a00 });
  const purple = new THREE.MeshLambertMaterial({ color: 0x7a35f5 });
  const teal = new THREE.MeshLambertMaterial({ color: 0x2ad4c4 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const dark = new THREE.MeshBasicMaterial({ color: 0x16132b });
  const pupMat = new THREE.MeshBasicMaterial({ color: 0x16132b });

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.2, 28), new THREE.MeshBasicMaterial({ color: 0x1a1040, transparent: true, opacity: 0.28 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  root.add(shadow);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(1.9, 28, 20), mat);
  torso.scale.set(1.1, 1, 0.9);
  torso.position.y = 2.1;
  body.add(torso);
  const tummy = new THREE.Mesh(new THREE.SphereGeometry(1.3, 22, 16), belly);
  tummy.scale.set(1, 1, 0.5);
  tummy.position.set(0, 1.8, 1.35);
  body.add(tummy);
  // Puntíky po těle v barvách duhy
  for (let k = 0; k < 9; k++) {
    const az = -1.2 + (k % 5) * 0.6;
    const el = k < 5 ? 0.55 : -0.05 + (k - 5) * 0.2;
    const x = Math.sin(az) * Math.cos(el) * 2.1;
    const y = 2.1 + Math.sin(el) * 1.92;
    const z = Math.cos(az) * Math.cos(el) * 1.72;
    if (Math.abs(x) < 1.1 && y < 3.0) continue; // tam je bříško
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2 + (k % 3) * 0.05, 10, 8), new THREE.MeshLambertMaterial({ color: RAINBOW[(k * 2) % 7] }));
    dot.position.set(x, y, z);
    dot.scale.z = 0.4;
    body.add(dot);
  }
  // Srdce-hvězda na bříšku
  const bellyStar = new THREE.Mesh(starGeometry(0.6, 0.15), gold);
  bellyStar.position.set(0, 1.8, 1.72);
  bellyStar.rotation.y = Math.PI;
  body.add(bellyStar);

  // Duhové bodliny na zádech
  for (let k = 0; k < 7; k++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.85, 8), new THREE.MeshLambertMaterial({ color: RAINBOW[k] }));
    spike.position.set((k - 3) * 0.6, 3.9 - Math.abs(k - 3) * 0.3, -1.2);
    spike.rotation.x = -0.5;
    body.add(spike);
  }

  // Křídla
  const mkWing = (side: number) => {
    const pv = new THREE.Group();
    pv.position.set(side * 1.6, 3.2, -1.3);
    const w = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), purple);
    w.scale.set(2.2, 0.1, 1.3);
    w.position.x = side * 2.0;
    pv.add(w);
    const rim = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), teal);
    rim.scale.set(1.4, 0.13, 0.7);
    rim.position.set(side * 2.5, 0.01, -0.1);
    pv.add(rim);
    body.add(pv);
    return pv;
  };
  const wingL = mkWing(-1);
  const wingR = mkWing(1);

  // Ocas z koulí, na konci hvězda
  const tail: THREE.Group[] = [];
  let tp = new THREE.Group();
  tp.position.set(0, 1.2, -1.6);
  body.add(tp);
  for (let k = 0; k < 5; k++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.55 - k * 0.07, 10, 8), k % 2 ? gold : mat);
    seg.position.z = -0.35;
    tp.add(seg);
    tail.push(tp);
    const nx = new THREE.Group();
    nx.position.z = -0.7;
    tp.add(nx);
    tp = nx;
  }
  const tailStar = new THREE.Mesh(starGeometry(0.5, 0.12), gold);
  tailStar.position.z = -0.1;
  tp.add(tailStar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1.3, 28, 20), mat);
  head.position.y = 4.4;
  body.add(head);
  for (const x of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), mat);
    ear.position.set(x * 1.3, 4.7, 0);
    body.add(ear);
    const earIn = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshLambertMaterial({ color: 0xffd0ea }));
    earIn.position.set(x * 1.45, 4.7, 0.15);
    body.add(earIn);
  }
  // Duhový čírek na hlavě
  const crest: THREE.Mesh[] = [];
  for (let k = 0; k < 7; k++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.8, 8), new THREE.MeshLambertMaterial({ color: RAINBOW[k] }));
    c.position.set((k - 3) * 0.3, 5.7 - Math.abs(k - 3) * 0.1, 0.0);
    body.add(c);
    crest.push(c);
  }
  const eyes: THREE.Mesh[] = [];
  const pupils: THREE.Mesh[] = [];
  for (const x of [-0.8, 0.8]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.0, 12), gold);
    horn.position.set(x * 1.1, 5.55, -0.1);
    horn.rotation.z = -x * 0.5;
    body.add(horn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 14), white);
    eye.position.set(x * 0.7, 4.65, 1.0);
    body.add(eye);
    eyes.push(eye);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), new THREE.MeshBasicMaterial({ color: 0x3aa8ff }));
    iris.position.set(0, -0.03, 0.26);
    eye.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), pupMat);
    pupil.position.set(0, 0, 0.14);
    iris.add(pupil);
    pupils.push(iris);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.15), dark);
    brow.position.set(x * 0.7, 5.2, 1.12);
    brow.rotation.z = x * 0.45; // zamračený pohled
    body.add(brow);
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.28, 14), new THREE.MeshBasicMaterial({ color: 0xff9fb2, transparent: true, opacity: 0.8 }));
    cheek.position.set(x * 1.0, 4.0, 1.22);
    cheek.rotation.y = x * 0.25;
    body.add(cheek);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), gold);
  nose.position.set(0, 4.25, 1.3);
  body.add(nose);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 0.2), dark);
  mouth.position.set(0, 3.8, 1.15);
  body.add(mouth);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff7aa0 }));
  tongue.position.set(0.25, 3.62, 1.2);
  tongue.scale.set(1.2, 0.7, 0.6);
  body.add(tongue);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 6), white);
    tooth.position.set(x, 3.97, 1.28);
    tooth.rotation.x = Math.PI;
    body.add(tooth);
  }

  const mkArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 2.2, 3.1, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.3, 4, 12), mat);
    arm.position.y = -0.9;
    pivot.add(arm);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.12, 8, 18), teal);
    cuff.position.y = -1.55;
    cuff.rotation.x = Math.PI / 2;
    pivot.add(cuff);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), gold);
    fist.position.y = -1.95;
    pivot.add(fist);
    body.add(pivot);
    return pivot;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);
  for (const x of [-0.95, 0.95]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.5, 4, 12), mat);
    leg.position.set(x, 0.65, 0);
    body.add(leg);
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10), purple);
    boot.position.set(x, 0.25, 0.2);
    boot.scale.set(1, 0.55, 1.35);
    body.add(boot);
  }

  // Hvězdičky nad hlavou, když je boss poražen
  const stars = new THREE.Group();
  stars.position.y = 6.9;
  for (let k = 0; k < 5; k++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshBasicMaterial({ color: RAINBOW[k + 1] }));
    const a = (k / 5) * Math.PI * 2;
    st.position.set(Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6);
    stars.add(st);
  }
  stars.visible = false;
  body.add(stars);

  const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.5), new THREE.MeshBasicMaterial({ color: 0x2a1a6b }));
  hpBack.position.set(0, 8.0, 1.3);
  root.add(hpBack);
  const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.34), new THREE.MeshBasicMaterial({ color: 0x17a864 }));
  hpFill.position.set(0, 8.0, 1.32);
  root.add(hpFill);
  return { root, body, armL, armR, wingL, wingR, tail, crest, mouth, tongue, eyes, pupils, pupMat, stars, mat, hpFill };
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
  const [coins, setCoins] = useState(0);

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
      cheer: 0,
      face: 0,
      stumble: 0,
      dust: 0,
      coins: 0,
      parts: [] as Particle[],
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
      if (i % 3 === 0) {
        for (const x of [-0.6, 0.6]) {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2a1a6b }));
          e.position.set(x, 0.3, 2.1);
          g.add(e);
          const ch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa8c0 }));
          ch.position.set(x * 1.7, 0, 1.9);
          ch.scale.z = 0.4;
          g.add(ch);
        }
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
    const ballMat = new THREE.MeshBasicMaterial({ color: 0xffc933 });
    const gateObjs: { g: THREE.Group; star: THREE.Object3D | undefined; ph: number }[] = [];
    rows.forEach((row, i) => {
      const grp = new THREE.Group();
      grp.position.z = ROW_START - i * ROW_GAP;
      row.gates.forEach((gate, lane) => {
        const gobj = buildGate(gate.label, lane, ballMat);
        gobj.position.x = RUNNER_LANES[lane];
        grp.add(gobj);
        gateObjs.push({ g: gobj, star: gobj.getObjectByName("star"), ph: i * 1.3 + lane });
      });
      world.add(grp);
    });

    // Mince mezi řadami: sbírají se průchodem (jen pro radost, na body nemají vliv)
    const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 18);
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xffc933, emissive: 0x6b4a00 });
    const coinList: { pivot: THREE.Group; x: number; z: number; got: boolean }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const lane = (i * 2 + 1) % 3;
      for (let k = 0; k < 5; k++) {
        const pivot = new THREE.Group();
        const m = new THREE.Mesh(coinGeo, coinMat);
        m.rotation.x = Math.PI / 2;
        pivot.add(m);
        const z = ROW_START - i * ROW_GAP + 6 + k * 3.5;
        pivot.position.set(RUNNER_LANES[lane], 0.95, z);
        world.add(pivot);
        coinList.push({ pivot, x: RUNNER_LANES[lane], z, got: false });
      }
    }

    // Horkovzdušné balóny na obloze a motýli kolem cesty
    const balloons: { g: THREE.Group; i: number }[] = [];
    [0xff5a8a, 0xffc933, 0x3248f0, 0x17a864, 0xb46bff, 0xff8a3d].forEach((c, i) => {
      const g = new THREE.Group();
      const env = new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 14), new THREE.MeshLambertMaterial({ color: c }));
      env.scale.y = 1.2;
      env.position.y = 3.2;
      g.add(env);
      const band = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.2, 6, 28), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      band.rotation.x = Math.PI / 2;
      band.position.y = 3.2;
      g.add(band);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), new THREE.MeshLambertMaterial({ color: 0x8a5a36 }));
      basket.position.y = -0.7;
      g.add(basket);
      for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), new THREE.MeshBasicMaterial({ color: 0x4a2c17 }));
        rope.position.set(x, 0.3, z);
        g.add(rope);
      }
      scene.add(g);
      balloons.push({ g, i });
    });
    const flies: { g: THREE.Group; wl: THREE.Group; wr: THREE.Group; i: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const g = new THREE.Group();
      const wm = new THREE.MeshBasicMaterial({ color: [0xffc933, 0xff5a8a, 0x8fd0ff, 0xffffff][i % 4], side: THREE.DoubleSide });
      const mk = (side: number) => {
        const pv = new THREE.Group();
        const w = new THREE.Mesh(new THREE.CircleGeometry(0.24, 10), wm);
        w.position.x = side * 0.22;
        pv.add(w);
        g.add(pv);
        return pv;
      };
      const wl = mk(-1);
      const wr = mk(1);
      scene.add(g);
      flies.push({ g, wl, wr, i });
    }

    // ----- Oživlé pozadí: duha, sluneční paprsky, hejna ptáků, větrné mlýny, kytky, vlajky, králíčci, třpytky
    const rainbow = new THREE.Group();
    const rbMats = RAINBOW.map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, fog: false }));
    rbMats.forEach((m, k) => rainbow.add(new THREE.Mesh(new THREE.TorusGeometry(110 - k * 3.6, 1.9, 8, 64, Math.PI), m)));
    rainbow.position.set(25, -8, -340);
    scene.add(rainbow);

    const rays = new THREE.Group();
    for (let k = 0; k < 12; k++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 0.2), new THREE.MeshBasicMaterial({ color: 0xfff4c2, transparent: true, opacity: 0.45, fog: false }));
      const a = (k / 12) * Math.PI * 2;
      r.position.set(Math.cos(a) * 24, Math.sin(a) * 24, 0);
      r.rotation.z = a - Math.PI / 2;
      rays.add(r);
    }
    rays.position.copy(sunDisc.position);
    scene.add(rays);

    const flocks: { g: THREE.Group; wings: [THREE.Group, THREE.Group][]; speed: number; off: number; y: number; z: number }[] = [];
    for (let f = 0; f < 3; f++) {
      const g = new THREE.Group();
      const wings: [THREE.Group, THREE.Group][] = [];
      const bm = new THREE.MeshBasicMaterial({ color: [0x2a1a6b, 0xff5a8a, 0x17a864][f], side: THREE.DoubleSide });
      for (let k = 0; k < 5; k++) {
        const b = new THREE.Group();
        const bd = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), bm);
        bd.scale.set(0.7, 0.7, 1.4);
        b.add(bd);
        const mk = (side: number) => {
          const pv = new THREE.Group();
          const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.4), bm);
          w.rotation.x = -Math.PI / 2;
          w.position.x = side * 0.55;
          pv.add(w);
          b.add(pv);
          return pv;
        };
        wings.push([mk(-1), mk(1)]);
        const idx = Math.ceil(k / 2);
        b.position.set((k % 2 ? 1 : -1) * idx * 1.8, 0, idx * 1.4);
        g.add(b);
      }
      g.rotation.y = Math.PI / 2;
      scene.add(g);
      flocks.push({ g, wings, speed: 9 + f * 3, off: f * 60, y: 14 + f * 6, z: -50 - f * 40 });
    }

    const mills: { g: THREE.Group; blades: THREE.Group; i: number; x: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.5, 9, 10), new THREE.MeshLambertMaterial({ color: [0xffe0b2, 0xffc2d6, 0xc9f0ff, 0xfff1b8][i] }));
      tower.position.y = 4.5;
      g.add(tower);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2, 10), new THREE.MeshLambertMaterial({ color: 0xe8479b }));
      roof.position.y = 10;
      g.add(roof);
      const blades = new THREE.Group();
      blades.position.set(0, 8.2, 1.4);
      for (let k = 0; k < 4; k++) {
        const pv = new THREE.Group();
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 6, 0.12), new THREE.MeshLambertMaterial({ color: k % 2 ? 0xffffff : 0xffc933 }));
        bl.position.y = 3;
        pv.add(bl);
        pv.rotation.z = (k * Math.PI) / 2;
        blades.add(pv);
      }
      g.add(blades);
      scene.add(g);
      mills.push({ g, blades, i, x: (i % 2 ? 1 : -1) * (30 + (i >> 1) * 20) });
    }

    const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x2f9e5a });
    const headGeo = new THREE.SphereGeometry(0.17, 8, 6);
    const petalMats = [0xff5a8a, 0xffc933, 0xffffff, 0xb46bff, 0xff8a3d].map((c) => new THREE.MeshLambertMaterial({ color: c }));
    const flowers: { g: THREE.Group; i: number; x: number }[] = [];
    for (let i = 0; i < 44; i++) {
      const g = new THREE.Group();
      const st = new THREE.Mesh(stemGeo, stemMat);
      st.position.y = 0.35;
      g.add(st);
      const hd = new THREE.Mesh(headGeo, petalMats[i % 5]);
      hd.position.y = 0.78;
      g.add(hd);
      scene.add(g);
      flowers.push({ g, i, x: (i % 2 ? 1 : -1) * (ROAD_W / 2 + 0.9 + ((i * 13) % 7) * 0.45) });
    }

    const flags: { g: THREE.Group; flag: THREE.Group; i: number; x: number }[] = [];
    for (let j = 0; j < 20; j++) {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      pole.position.y = 1.7;
      g.add(pole);
      const flag = new THREE.Group();
      flag.position.y = 3.1;
      const fm = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), new THREE.MeshBasicMaterial({ color: RAINBOW[j % 7], side: THREE.DoubleSide }));
      fm.position.x = 0.55;
      flag.add(fm);
      g.add(flag);
      scene.add(g);
      flags.push({ g, flag, i: j >> 1, x: (j % 2 ? 1 : -1) * (ROAD_W / 2 + 0.7) });
    }

    const bunnies: { g: THREE.Group; earL: THREE.Mesh; earR: THREE.Mesh; i: number; x: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const m = new THREE.MeshLambertMaterial({ color: [0xffffff, 0xffd0ea, 0xd9a441][i % 3] });
      const bd = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), m);
      bd.position.y = 0.4;
      bd.scale.z = 1.25;
      g.add(bd);
      const hd = new THREE.Mesh(new THREE.SphereGeometry(0.27, 12, 10), m);
      hd.position.set(0, 0.8, 0.35);
      g.add(hd);
      const ear = new THREE.CapsuleGeometry(0.07, 0.35, 4, 8);
      const earL = new THREE.Mesh(ear, m);
      earL.position.set(-0.11, 1.17, 0.33);
      const earR = new THREE.Mesh(ear, m);
      earR.position.set(0.11, 1.17, 0.33);
      g.add(earL, earR);
      for (const x of [-0.1, 0.1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshBasicMaterial({ color: 0x16132b }));
        e.position.set(x, 0.85, 0.58);
        g.add(e);
      }
      const tl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      tl.position.set(0, 0.4, -0.55);
      g.add(tl);
      scene.add(g);
      bunnies.push({ g, earL, earR, i, x: (i % 2 ? 1 : -1) * (ROAD_W / 2 + 2.2 + (i % 3) * 1.2) });
    }

    // Třpytky a bubliny ve vzduchu
    const SP = 150;
    const spX = new Float32Array(SP);
    const spY = new Float32Array(SP);
    const spZ = new Float32Array(SP);
    const spPos = new Float32Array(SP * 3);
    const spCol = new Float32Array(SP * 3);
    const tmpC = new THREE.Color();
    for (let i = 0; i < SP; i++) {
      spX[i] = (Math.random() - 0.5) * 36;
      spY[i] = Math.random() * 14;
      spZ[i] = Math.random() * 75;
      tmpC.setHex(RAINBOW[i % 7]);
      spCol.set([tmpC.r, tmpC.g, tmpC.b], i * 3);
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
    spGeo.setAttribute("color", new THREE.BufferAttribute(spCol, 3));
    const sparkles = new THREE.Points(spGeo, new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
    sparkles.frustumCulled = false;
    scene.add(sparkles);

    // Částice: konfety při správné odpovědi, obláčky prachu a kouře
    const confMats = [0xff5a8a, 0xffc933, 0x3248f0, 0x17a864, 0xffffff, 0xb46bff].map((c) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    const confGeo = new THREE.PlaneGeometry(0.2, 0.13);
    const sparkGeo = new THREE.OctahedronGeometry(0.11);
    const puffGeo = new THREE.SphereGeometry(0.24, 8, 6);
    const dustMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x5d5778, transparent: true, opacity: 0.7 });
    const addPart = (m: THREE.Mesh, pos: THREE.Vector3, v: THREE.Vector3, max: number, kind: Particle["kind"]) => {
      m.position.copy(pos);
      scene.add(m);
      sim.parts.push({ m, v, life: max, max, kind });
    };
    const burstAt = (pos: THREE.Vector3, n: number) => {
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.5 + Math.random() * 3.5;
        addPart(
          new THREE.Mesh(confGeo, confMats[k % confMats.length]),
          pos,
          new THREE.Vector3(Math.cos(a) * sp, 4 + Math.random() * 4, Math.sin(a) * sp * 0.6),
          0.9 + Math.random() * 0.5,
          "conf",
        );
      }
    };
    const sparkAt = (pos: THREE.Vector3) => {
      addPart(
        new THREE.Mesh(sparkGeo, confMats[Math.floor(Math.random() * confMats.length)]),
        pos,
        new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.8, 1.5 + Math.random()),
        0.55,
        "spark",
      );
    };
    const puffAt = (pos: THREE.Vector3, n: number, smoke: boolean) => {
      for (let k = 0; k < n; k++) {
        addPart(
          new THREE.Mesh(puffGeo, smoke ? smokeMat : dustMat),
          pos,
          new THREE.Vector3((Math.random() - 0.5) * (smoke ? 3 : 1.2), smoke ? 1.5 + Math.random() : 0.4, (Math.random() - 0.3) * (smoke ? 2 : 1.5)),
          smoke ? 0.8 : 0.45,
          "puff",
        );
      }
    };

    // Boss na konci trati
    const boss = buildBoss();
    boss.root.position.z = bossLocalZ;
    world.add(boss.root);

    // Hrdina a parta
    const kit = makeKit();
    const crowdGroup = new THREE.Group();
    scene.add(crowdGroup);
    const hero = buildHuman(kit, { shirt: 0xff8a3d, pants: 0x3248f0, hair: 0x4a2c17, accent: 0xff5a8a, hat: "crown", cape: 0xb46bff, scarf: RAINBOW, badge: true, eye: 0x3aa8ff });
    hero.g.scale.setScalar(1.35);
    hero.g.position.z = HERO_Z;
    crowdGroup.add(hero.g);
    const shirts = [0xff7aa8, 0xffe36b, 0x7ee0ff, 0xa6f0b8, 0xc9a7ff, 0xffa65c];
    const pantsC = [0x5b2fd6, 0x2a3a8a, 0x1f9d8b, 0xe8479b];
    const skins = [0xffd2b0, 0xf2b98f, 0xc98d62, 0x8d5a3b];
    const eyeC = [0x3aa8ff, 0x3fcf6a, 0x8d5a3b, 0xb46bff];
    const hairs = [0x2a1a14, 0xe8479b, 0xd9a441, 0x3aa8ff, 0x6b4423, 0x17a864];
    const members: { h: Human; s: number }[] = [];
    for (let i = 0; i < MAX_VISIBLE_CREW; i++) {
      const earKind = (["cat", "bunny", "bear", "none"] as const)[i % 4];
      const h = buildHuman(kit, {
        shirt: shirts[i % shirts.length],
        pants: pantsC[i % pantsC.length],
        hair: hairs[i % hairs.length],
        accent: shirts[(i + 2) % shirts.length],
        hat: earKind === "none" ? (["cap", "party", "beanie", "hair"] as const)[(i >> 2) % 4] : "hair",
        skin: skins[i % skins.length],
        eye: eyeC[i % eyeC.length],
        ears: earKind,
        tail: earKind === "cat" || earKind === "bunny",
        scarf: i % 2 ? [RAINBOW[i % 7], RAINBOW[(i + 2) % 7], RAINBOW[(i + 4) % 7]] : undefined,
        pack: i % 5 === 0,
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
        sim.cheer = 1;
        burstAt(new THREE.Vector3(0, 3.4, boss.root.position.z + world.position.z + 1.8), 26);
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
      sim.cheer = Math.max(0, sim.cheer - dt / 0.7);
      sim.stumble = Math.max(0, sim.stumble - dt);
      sim.face += ((sim.phase === "ready" || sim.phase === "won" ? 1 : 0) - sim.face) * Math.min(1, dt * 5);

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
            const hp = new THREE.Vector3(sim.x, 1.4, HERO_Z);
            if (gate.correct) {
              burstAt(hp, 30);
              sim.cheer = 1;
            } else {
              puffAt(hp, 10, true);
              sim.stumble = 0.6;
            }
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

      // Brány se houpou a točí se na nich hvězda; mince se točí a sbírají
      for (const go of gateObjs) {
        go.g.position.y = Math.sin(clock * 2.2 + go.ph) * 0.07;
        if (go.star) {
          go.star.rotation.y = clock * 2.5;
          go.g.rotation.z = Math.sin(clock * 1.5 + go.ph) * 0.015;
          go.star.position.y = 3.15 + Math.sin(clock * 3 + go.ph) * 0.1;
        }
      }
      for (const c of coinList) {
        if (c.got) continue;
        c.pivot.rotation.y = clock * 3.2 + c.z;
        c.pivot.position.y = 0.95 + Math.sin(clock * 3 + c.z) * 0.1;
        const wz = c.z + sim.d;
        if (wz > 2.5) {
          c.got = true;
          c.pivot.visible = false;
        } else if (sim.phase === "run" && wz >= HERO_Z - 0.5 && Math.abs(c.x - sim.x) < 1.1) {
          c.got = true;
          c.pivot.visible = false;
          sim.coins += 1;
          setCoins(sim.coins);
          burstAt(new THREE.Vector3(c.x, 1.1, HERO_Z), 6);
        }
      }
      // Prach za nohama při běhu
      if (sim.phase === "run") {
        sim.dust -= dt;
        if (sim.dust <= 0) {
          sim.dust = 0.06;
          sparkAt(new THREE.Vector3(sim.x + (Math.random() - 0.5) * 0.7, 0.5 + Math.random() * 0.9, HERO_Z + 0.4));
          puffAt(new THREE.Vector3(sim.x + (Math.random() - 0.5) * 0.4, 0.12, HERO_Z + 0.5), 1, false);
        }
      }
      // Částice
      for (let i = sim.parts.length - 1; i >= 0; i--) {
        const p = sim.parts[i];
        p.life -= dt;
        if (p.life <= 0) {
          scene.remove(p.m);
          sim.parts.splice(i, 1);
          continue;
        }
        if (p.kind === "spark") {
          p.m.position.addScaledVector(p.v, dt);
          p.m.rotation.y += dt * 8;
          p.m.rotation.z += dt * 5;
          p.m.scale.setScalar(Math.max(0.01, p.life / p.max));
          continue;
        }
        if (p.kind === "conf") {
          p.v.y -= 11 * dt;
          p.m.position.addScaledVector(p.v, dt);
          p.m.rotation.x += dt * 9;
          p.m.rotation.y += dt * 7;
          p.m.scale.setScalar(Math.min(1, p.life / 0.3));
        } else {
          p.m.position.addScaledVector(p.v, dt);
          p.m.scale.setScalar(Math.sin(Math.PI * (1 - p.life / p.max)) * 1.3 + 0.05);
        }
      }
      // ----- Animace pozadí
      rbMats.forEach((m, k) => (m.opacity = 0.62 + Math.sin(clock * 1.6 - k * 0.6) * 0.12));
      rainbow.scale.setScalar(1 + Math.sin(clock * 0.5) * 0.015);
      rays.rotation.z = clock * 0.15;
      rays.scale.setScalar(1 + Math.sin(clock * 1.3) * 0.08);
      sunDisc.scale.setScalar(1 + Math.sin(clock * 2) * 0.03);
      dashMat.color.setHSL((clock * 0.15) % 1, 0.85, 0.75);
      ballMat.color.setHSL((clock * 0.5) % 1, 0.9, 0.6);
      for (const fl of flocks) {
        const x = 90 - ((clock * fl.speed + fl.off) % 180);
        fl.g.position.set(x, fl.y + Math.sin(clock * 0.8 + fl.off) * 1.2, fl.z);
        fl.wings.forEach(([l, r], k) => {
          const a = Math.sin(clock * 9 + k * 0.6) * 0.7;
          l.rotation.z = a;
          r.rotation.z = -a;
        });
      }
      for (const m of mills) {
        const z = -230 + ((m.i * 60 + sim.d * 0.5) % 240);
        m.g.position.set(m.x, 0, z);
        m.g.visible = z > -225 && z < -20;
        m.blades.rotation.z = clock * (1.2 + m.i * 0.3);
      }
      for (const f of flowers) {
        const z = -230 + ((f.i * 5.4 + sim.d) % 240);
        f.g.position.set(f.x, 0, z);
        f.g.visible = z > -225 && z < 14;
        f.g.rotation.z = Math.sin(clock * 3 + f.i) * 0.22;
      }
      for (const fg of flags) {
        const z = -230 + ((fg.i * 24 + sim.d) % 240);
        fg.g.position.set(fg.x, 0, z);
        fg.g.visible = z > -225 && z < 14;
        fg.flag.rotation.y = Math.sin(clock * 6 + fg.i * 1.7) * 0.5 + (fg.x > 0 ? 0 : Math.PI);
      }
      for (const bn of bunnies) {
        const z = -230 + ((bn.i * 38 + sim.d) % 240);
        const hop = Math.abs(Math.sin(clock * 5 + bn.i * 2));
        bn.g.position.set(bn.x, hop * 0.7, z);
        bn.g.visible = z > -225 && z < 14;
        bn.g.rotation.y = (bn.x > 0 ? -0.5 : 0.5) + Math.sin(clock + bn.i) * 0.3;
        bn.earL.rotation.x = -hop * 0.5;
        bn.earR.rotation.x = -hop * 0.5;
        bn.g.scale.y = 1 + (1 - hop) * 0.08;
      }
      for (let i = 0; i < SP; i++) {
        spPos[i * 3] = spX[i] + Math.sin(clock * 0.7 + i) * 0.8;
        spPos[i * 3 + 1] = (spY[i] + clock * (0.6 + (i % 5) * 0.12)) % 14;
        spPos[i * 3 + 2] = -70 + ((spZ[i] + sim.d) % 75);
      }
      spGeo.attributes.position.needsUpdate = true;
      sparkles.material.opacity = 0.65 + Math.sin(clock * 5) * 0.25;
      // Balóny a motýli
      for (const b of balloons) {
        b.g.position.set(((b.i * 41) % 130) - 65 + Math.sin(clock * 0.2 + b.i) * 4, 20 + ((b.i * 5) % 4) * 5 + Math.sin(clock * 0.7 + b.i * 2) * 1.2, -110 - (b.i % 3) * 45);
        b.g.rotation.z = Math.sin(clock * 0.8 + b.i) * 0.06;
      }
      for (const f of flies) {
        const z = -150 + ((f.i * 29 + sim.d * 0.9 + clock * 3) % 160);
        const side = f.i % 2 ? 1 : -1;
        f.g.position.set(side * (ROAD_W / 2 + 2 + (f.i % 3) * 2) + Math.sin(clock * 0.8 + f.i) * 1.5, 1.5 + Math.sin(clock * 1.7 + f.i * 2) * 0.5, z);
        f.g.visible = z > -148 && z < 10;
        f.g.rotation.y = Math.sin(clock * 0.8 + f.i) * 0.6;
        const fl = Math.sin(clock * 18 + f.i) * 0.9;
        f.wl.rotation.y = fl;
        f.wr.rotation.y = -fl;
      }
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
        tr.g.rotation.z = Math.sin(clock * 1.6 + tr.i) * 0.035;
      }

      // Mraky: plynou pomaleji než silnice
      for (const c of clouds) {
        const z = -230 + ((c.i * 17 + sim.d * 0.6 + clock * 0.8) % 260);
        c.g.position.set(((c.i * 37) % 60) - 30 + Math.sin(clock * 0.2 + c.i) * 6, 13 + (c.i % 4) * 2.2, z);
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
      const cheerArc = sim.cheer > 0 ? Math.sin(Math.PI * (1 - sim.cheer)) : 0;
      const heroUp = Math.max(hopArc * 0.95, cheerArc * 0.7);
      hero.g.position.y = heroUp;
      hero.g.rotation.z = -sim.hopDir * hopArc * 0.45 + Math.sin(clock * 45) * 0.3 * sim.stumble;
      hero.g.rotation.y = sim.face * Math.PI + cheerArc * Math.PI * 2 * (1 - sim.cheer);
      animateHuman(hero, clock, 0, sim.runAmt, Math.max(hopArc, cheerArc), sim.face);
      countSprite.position.y = 3.1 + heroUp + Math.sin(clock * 3) * 0.05;
      countSprite.scale.setScalar(1 + sim.pulse * 0.6);

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
        const mHop = Math.max(sim.hopT > 0 ? Math.sin(Math.PI * p) : 0, cheerArc);
        mem.h.g.position.set((col - 2) * 0.5 + jitter, mHop * 0.6, 0.55 + row * 0.62);
        mem.h.g.scale.setScalar(0.9 * mem.s);
        mem.h.g.rotation.z = -sim.hopDir * mHop * 0.35;
        mem.h.g.rotation.y = sim.face * Math.PI;
        animateHuman(mem.h, clock, i * 0.9, sim.runAmt, mHop, sim.face * (i % 2));
      }

      // Boss: dýchá, mává pěstmi, při zásahu bliká a padá, při špatné odpovědi udeří
      if (sim.bossShake > 0) sim.bossShake = Math.max(0, sim.bossShake - dt);
      if (sim.bossLunge > 0) sim.bossLunge = Math.max(0, sim.bossLunge - dt);
      if (sim.bossHp <= 0) sim.bossDown = Math.min(1, sim.bossDown + dt * 1.2);
      const lungeP = sim.bossLunge > 0 ? Math.sin(Math.PI * (1 - sim.bossLunge / 0.6)) : 0;
      boss.body.position.x = sim.bossShake > 0 ? Math.sin(clock * 60) * 0.25 : 0;
      boss.body.position.y = Math.sin(clock * 2.2) * 0.12 + Math.sin(Math.PI * Math.min(1, sim.bossDown * 1.2)) * 3;
      boss.body.position.z = lungeP * 5;
      boss.body.rotation.y = sim.bossDown * sim.bossDown * 14;
      const ds = Math.max(0.001, 1 - sim.bossDown * sim.bossDown);
      const bsq = Math.sin(clock * 4) * 0.03;
      boss.body.scale.set(ds * (1 + bsq), ds * (1 - bsq), ds * (1 + bsq));
      boss.body.rotation.z = Math.sin(clock * 1.4) * 0.05;
      boss.armL.rotation.x = Math.sin(clock * 3) * 0.3 - lungeP * 2.2;
      boss.armR.rotation.x = Math.sin(clock * 3 + Math.PI) * 0.3 - lungeP * 2.2;
      boss.armL.rotation.z = 0.25 + Math.sin(clock * 2) * 0.1;
      boss.armR.rotation.z = -0.25 - Math.sin(clock * 2) * 0.1;
      boss.mouth.scale.y = 1 + Math.abs(Math.sin(clock * 4)) * 0.8 + lungeP * 1.5;
      const flashK = sim.bossShake > 0 ? sim.bossShake * 2 : 0;
      boss.mat.emissive.setRGB(flashK, flashK * 0.2, flashK * 0.2);
      // Boss mrká, sleduje pohledem hráče, vyplazuje jazyk; po porážce mu nad hlavou krouží hvězdičky
      const bl = Math.sin(clock * 0.8) > 0.97 ? 0.1 : 1;
      for (const e of boss.eyes) e.scale.y = bl;
      for (const pu of boss.pupils) pu.position.x = Math.max(-0.12, Math.min(0.12, sim.x * 0.05));
      boss.tongue.position.y = 3.62 - Math.abs(Math.sin(clock * 4)) * 0.15;
      boss.wingL.rotation.z = -(0.35 + Math.sin(clock * 6) * 0.5);
      boss.wingR.rotation.z = 0.35 + Math.sin(clock * 6) * 0.5;
      boss.tail.forEach((tp, k) => (tp.rotation.y = Math.sin(clock * 5 - k * 0.8) * 0.45));
      boss.crest.forEach((c, k) => c.scale.set(1, 1 + Math.sin(clock * 6 + k * 0.9) * 0.3, 1));
      boss.pupMat.color.setHex(lungeP > 0.1 || sim.bossShake > 0 ? 0xe5174a : 0x16132b);
      boss.stars.visible = sim.bossHp <= 0 && sim.bossDown < 0.7;
      boss.stars.rotation.y = clock * 4;
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
      camera.rotation.z += (targetX - sim.x) * 0.02;

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
      [sparkGeo, confGeo, puffGeo, dustMat, smokeMat, coinGeo, coinMat, ...confMats].forEach((r) => r.dispose());
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
    setCoins(0);
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
              ...(coins > 0 ? [{ label: t.coins, value: String(coins) }] : []),
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
          <style>{`@keyframes rn-pop{0%{transform:translateY(-34px) scale(.8);opacity:0}60%{transform:translateY(5px) scale(1.04);opacity:1}100%{transform:none;opacity:1}}.rn-pop{animation:rn-pop .45s ease-out}`}</style>

          {phase === "run" && rowsDone < plan.rows.length && (
            <div
              key={rowsDone}
              className="rn-pop pointer-events-none absolute inset-x-3 top-3 z-10 mx-auto max-w-xl rounded-3xl border-4 border-white bg-[#3248f0] px-5 py-3 text-center text-lg font-extrabold leading-snug text-white shadow-[0_6px_0_#1d2a9e] sm:text-2xl"
            >
              <span className="mr-2 inline-block rounded-full bg-[#ffc933] px-2.5 text-base text-[#2a1a6b]">
                {rowsDone + 1}/{plan.rows.length}
              </span>
              {plan.rows[rowsDone].prompt}
            </div>
          )}

          {feedback && (
            <div
              key={feedback.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-none absolute left-1/2 top-[6.5rem] z-10 -translate-x-1/2 sm:top-28 rounded-2xl px-4 py-2 text-center text-lg font-extrabold text-white shadow-lg ${
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
