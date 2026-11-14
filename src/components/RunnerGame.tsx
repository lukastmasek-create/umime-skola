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
const MAX_VISIBLE_CREW = 40;
const ROAD_W = 9;
const SKY_CSS = "linear-gradient(180deg, #8fd0ff 0%, #b49bff 42%, #7a35f5 100%)";
const FOG = 0xb9a2ff;

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

// Text na panelu (brána, tabule): zmenší písmo, dokud se vejde.
function labelTexture(text: string, bg: string, fg: string, w = 512, h = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = bg;
    roundRectPath(ctx, 6, 6, w - 12, h - 12, 36);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 96;
    let lines: string[] = [text];
    for (; size >= 28; size -= 6) {
      ctx.font = `800 ${size}px system-ui, sans-serif`;
      lines = wrapLines(ctx, text, w - 60);
      if (lines.length * size * 1.15 <= h - 36) break;
    }
    const lh = size * 1.15;
    const y0 = h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2, y0 + i * lh));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildGate(label: string): THREE.Group {
  const g = new THREE.Group();
  const frame = new THREE.MeshLambertMaterial({ color: 0x5b2fd6 });
  const beamMat = new THREE.MeshLambertMaterial({ color: 0xffc933 });
  const post = new THREE.BoxGeometry(0.16, 2.6, 0.16);
  for (const x of [-0.95, 0.95]) {
    const p = new THREE.Mesh(post, frame);
    p.position.set(x, 1.3, 0);
    g.add(p);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.2, 0.16), beamMat);
  beam.position.set(0, 2.5, 0);
  g.add(beam);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.2),
    new THREE.MeshBasicMaterial({ map: labelTexture(label, "#ffffff", "#2a1a6b"), transparent: true, side: THREE.DoubleSide }),
  );
  panel.position.set(0, 1.3, 0.02);
  g.add(panel);
  return g;
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
      pulse: 0,
      feedbackTimer: 0,
      projectiles: [] as { mesh: THREE.Mesh; t: number; from: THREE.Vector3; to: THREE.Vector3 }[],
    };

    // ----- Renderer a scéna
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(FOG, 80, 190);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7a35f5, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(4, 12, 6);
    scene.add(sun);

    const world = new THREE.Group();
    scene.add(world);

    // Silnice a boky
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_W, 520),
      new THREE.MeshLambertMaterial({ color: 0x9c7bff }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -190);
    scene.add(road);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 520), new THREE.MeshLambertMaterial({ color: 0xc9b6ff }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, -190);
    scene.add(ground);

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
        new THREE.MeshBasicMaterial({ map: labelTexture(row.prompt, "#3248f0", "#ffffff", 768, 256), transparent: true, side: THREE.DoubleSide }),
      );
      sign.position.set(0, 4.3, 0);
      grp.add(sign);
      for (const x of [-3.7, 3.7]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.3, 0.18), new THREE.MeshLambertMaterial({ color: 0x5b2fd6 }));
        p.position.set(x, 2.15, 0);
        grp.add(p);
      }
      world.add(grp);
      rowObjects.push(grp);
    });

    // Boss na konci trati
    const boss = new THREE.Group();
    boss.position.z = bossLocalZ;
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff5a8a });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.2, 2.4), bodyMat);
    body.position.y = 1.7;
    boss.add(body);
    for (const x of [-1.1, 1.1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 6), new THREE.MeshLambertMaterial({ color: 0xffc933 }));
      horn.position.set(x, 3.9, 0);
      boss.add(horn);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eye.position.set(x * 0.7, 2.1, 1.25);
      boss.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshBasicMaterial({ color: 0x16132b }));
      pupil.position.set(x * 0.7, 2.1, 1.5);
      boss.add(pupil);
    }
    const hpBack = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.36), new THREE.MeshBasicMaterial({ color: 0x2a1a6b }));
    hpBack.position.set(0, 5.1, 1.3);
    boss.add(hpBack);
    const hpFill = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.36), new THREE.MeshBasicMaterial({ color: 0x17a864 }));
    hpFill.position.set(0, 5.1, 1.32);
    boss.add(hpFill);
    world.add(boss);

    // Parta: menší kapsle za hráčem
    const crowdGroup = new THREE.Group();
    scene.add(crowdGroup);
    const crowdGeo = new THREE.CapsuleGeometry(0.2, 0.45, 3, 8);
    const crowdColors = [0xffffff, 0xffe36b, 0xff9ad5, 0x8fd0ff].map((c) => new THREE.MeshLambertMaterial({ color: c }));
    const members: THREE.Mesh[] = [];
    for (let i = 0; i < MAX_VISIBLE_CREW; i++) {
      const m = new THREE.Mesh(crowdGeo, crowdColors[i % crowdColors.length]);
      crowdGroup.add(m);
      members.push(m);
    }

    const projGeo = new THREE.SphereGeometry(0.18, 10, 8);
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
      sim.lane = next;
    };

    const start = () => {
      if (sim.phase !== "ready") return;
      setP("run");
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
        setCrew(sim.crew);
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

    // Výstřely party do bosse (vizuálně)
    function crowdShots(c: number) {
      return Math.max(1, Math.ceil(c / 8));
    }
    function shoot(k: number) {
      const mesh = new THREE.Mesh(projGeo, projMat);
      const from = new THREE.Vector3(sim.x + (k - 2) * 0.35, 1.4, 0.5);
      const to = new THREE.Vector3(0, 2.2, boss.position.z + 1.2);
      mesh.position.copy(from);
      scene.add(mesh);
      sim.projectiles.push({ mesh, t: 0, from, to });
    }

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
    window.addEventListener("pointercancel", () => (drag = null));
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
      sim.x += (targetX - sim.x) * Math.min(1, dt * 12);

      // Běh
      if (sim.phase === "run") {
        sim.d += SPEED * dt;
        // Průchod bránami
        while (sim.nextRow < rows.length) {
          const rz = ROW_START - sim.nextRow * ROW_GAP + sim.d;
          if (rz < 0.6) {
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

      // Silnice: pruhy se posouvají
      for (const dsh of dashes) {
        const base = dsh.i * 8 + sim.d * 0;
        const z = -220 + ((base + sim.d) % 240);
        dsh.mesh.position.z = z;
        dsh.mesh.visible = z > -215 && z < 25;
      }

      // Parta
      const shakeX = sim.shake > 0 ? Math.sin(clock * 60) * 0.12 * sim.shake : 0;
      sim.shake = Math.max(0, sim.shake - dt);
      sim.pulse = Math.max(0, sim.pulse - dt);
      const visible = Math.min(sim.crew, MAX_VISIBLE_CREW);
      crowdGroup.position.set(sim.x + shakeX, 0, 0);
      const scale = 1 + sim.pulse * 0.25;
      crowdGroup.scale.setScalar(scale);
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        m.visible = i < visible;
        if (!m.visible) continue;
        const col = i % 5;
        const row = Math.floor(i / 5);
        const jitter = Math.sin((i + 1) * 12.9898) * 0.12;
        const bob = Math.abs(Math.sin(clock * 9 + i * 0.7)) * 0.16;
        m.position.set((col - 2) * 0.46 + jitter, 0.45 + bob, -row * 0.5 - 0.3);
      }

      // Boss
      if (sim.bossShake > 0) sim.bossShake = Math.max(0, sim.bossShake - dt);
      boss.position.x = sim.bossShake > 0 ? Math.sin(clock * 60) * 0.25 : 0;
      boss.position.y = Math.sin(clock * 2.2) * 0.12;
      hpFill.scale.x = Math.max(0.001, sim.bossHp / RUNNER_BOSS_HITS);
      hpFill.position.x = -(1 - hpFill.scale.x) * 1.7;

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

      // Kamera sleduje hráče
      camera.position.set(sim.x * 0.35, 4.6, 7.5);
      camera.lookAt(sim.x * 0.25, 1.4, -12);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(sim.feedbackTimer);
      ro.disconnect();
      host?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      api.current = null;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material & { map?: THREE.Texture | null };
        if (mat) {
          mat.map?.dispose();
          mat.dispose();
        }
      });
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
          className="relative h-[min(70vh,620px)] min-h-[440px] w-full touch-none select-none overflow-hidden rounded-2xl"
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
