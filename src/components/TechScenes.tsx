"use client";

import { useEffect, useRef, useState } from "react";
import { HomeArt } from "@/components/SpaceDecor";
import { prefersReducedMotion } from "@/lib/motion";

// Živé 3D scény pro sekci „Co tu najdeš“ (three.js se načítá až na klientovi a až když je sekce vidět).
// Bez WebGL, při omezeném pohybu a na úzkých displejích zůstává původní grafika.

type T = typeof import("three");
type Live = { scene: InstanceType<T["Scene"]>; camera: InstanceType<T["Camera"]>; tick: (t: number, dt: number) => void; dispose: () => void };
type Setup = (three: T, renderer: InstanceType<T["WebGLRenderer"]>, host: HTMLElement) => Live | null;

// Společný chod: renderer, smyčka, pozastavení mimo obrazovku a úklid.
function useScene(host: React.RefObject<HTMLElement | null>, setup: Setup, minWidth = 0, dpr = 2) {
  const [live, setLive] = useState(false);
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });
  useEffect(() => {
    const el = host.current;
    if (!el || prefersReducedMotion() || window.innerWidth < minWidth) return;
    let stop = false;
    let cleanup = () => {};
    import("three")
      .then((three) => {
        if (stop) return;
        let renderer: InstanceType<T["WebGLRenderer"]>;
        try {
          renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
        renderer.outputColorSpace = three.SRGBColorSpace;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
        el.appendChild(renderer.domElement);
        const s = setupRef.current(three, renderer, el);
        if (!s) {
          renderer.dispose();
          renderer.domElement.remove();
          return;
        }
        const clock = new three.Clock();
        let raf = 0;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(el);
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden) {
            clock.getDelta();
            return;
          }
          const dt = Math.min(clock.getDelta(), 0.05);
          s.tick(clock.elapsedTime, dt);
          renderer.render(s.scene, s.camera);
        };
        loop();
        setLive(true);
        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          s.dispose();
          s.scene.traverse((o) => {
            const m = o as InstanceType<T["Mesh"]>;
            if (m.geometry) m.geometry.dispose();
            const mat = m.material as InstanceType<T["Material"]> | InstanceType<T["Material"]>[] | undefined;
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else mat?.dispose();
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch((e) => console.warn("tech-scenes", e));
    return () => {
      stop = true;
      cleanup();
      setLive(false);
    };
  }, [host, minWidth, dpr]);
  return live;
}

function lights(three: T, scene: InstanceType<T["Scene"]>, tint = 0xffffff) {
  scene.add(new three.HemisphereLight(0xf4f8ff, 0x35507a, 1.6));
  const sun = new three.DirectionalLight(tint, 2.4);
  sun.position.set(-2, 4, 5);
  scene.add(sun);
  const rim = new three.DirectionalLight(0x6fd8ff, 1.2);
  rim.position.set(3, 1, -3);
  scene.add(rim);
}

const mat = (three: T, color: number, o: { rough?: number; metal?: number; emissive?: number; ei?: number } = {}) =>
  new three.MeshStandardMaterial({ color, roughness: o.rough ?? 0.5, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1 });

export type IconKind = "book" | "joystick" | "door" | "trophy";

// ───────────────────────── Ikony karet: kniha, joystick, dveře, pohár ─────────────────────────
function buildIcon(three: T, kind: IconKind, renderer: InstanceType<T["WebGLRenderer"]>, host: HTMLElement): Live {
  const SIZE = 64;
  renderer.setSize(SIZE, SIZE);
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.7, 5.4);
  camera.lookAt(0, 0.1, 0);
  lights(three, scene);
  const root = new three.Group();
  scene.add(root);
  const { Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, Group } = three;

  let hover = 0;
  let target = 0;
  const card = host.closest(".tech-card");
  const on = () => (target = 1);
  const off = () => (target = 0);
  card?.addEventListener("pointerenter", on);
  card?.addEventListener("pointerleave", off);
  card?.addEventListener("focusin", on);
  card?.addEventListener("focusout", off);

  let anim: (t: number) => void = () => {};

  if (kind === "book") {
    const cover = mat(three, 0x2d62d8, { rough: 0.45 });
    const paper = mat(three, 0xfff6e0, { rough: 0.8 });
    const spine = new Group();
    root.add(spine);
    for (const s of [-1, 1]) {
      const half = new Group();
      half.rotation.z = s * 0.2;
      const c = new Mesh(new BoxGeometry(1.15, 0.1, 1.5), cover);
      c.position.set(s * 0.6, 0, 0);
      const p = new Mesh(new BoxGeometry(1.05, 0.1, 1.4), paper);
      p.position.set(s * 0.6, 0.1, 0);
      half.add(c, p);
      spine.add(half);
    }
    spine.position.y = -0.4;
    const flip = new Group();
    flip.position.set(0, -0.28, 0);
    const leaf = new Mesh(new BoxGeometry(1.05, 0.03, 1.4), paper);
    leaf.position.x = 0.55;
    flip.add(leaf);
    root.add(flip);
    const disc = new Group();
    const dm = new Mesh(new CylinderGeometry(0.34, 0.34, 0.1, 28), mat(three, 0x2fbf71, { rough: 0.35, emissive: 0x0a5a2e }));
    dm.rotation.x = Math.PI / 2;
    const w = mat(three, 0xffffff);
    const a = new Mesh(new BoxGeometry(0.1, 0.3, 0.06), w);
    a.position.set(-0.08, -0.04, 0.07);
    a.rotation.z = 0.7;
    const b = new Mesh(new BoxGeometry(0.1, 0.5, 0.06), w);
    b.position.set(0.1, 0.02, 0.07);
    b.rotation.z = -0.7;
    disc.add(dm, a, b);
    disc.position.set(0, 1.05, 0);
    root.add(disc);
    root.rotation.x = 0.15;
    anim = (t) => {
      const speed = 0.55 + hover * 0.9;
      const ph = (t * speed) % 1;
      const e = ph < 0.55 ? 0.5 - 0.5 * Math.cos((ph / 0.55) * Math.PI) : 1;
      flip.rotation.z = 0.2 + e * (Math.PI - 0.4);
      flip.visible = ph < 0.6;
      const pop = ph > 0.5 ? Math.min(1, (ph - 0.5) / 0.15) : 0;
      const k = pop < 1 ? 1.2 * Math.sin(pop * Math.PI * 0.5 + 0.0001) : 1;
      disc.scale.setScalar(Math.max(0.0001, ph > 0.5 ? (ph < 0.95 ? k * (1 + hover * 0.15) : Math.max(0.0001, (1 - ph) / 0.05)) : 0.0001));
      disc.rotation.y = Math.sin(t * 2) * 0.3;
      root.rotation.y = Math.sin(t * 0.8) * 0.35 + hover * 0.4;
    };
  } else if (kind === "joystick") {
    const base = new Mesh(new BoxGeometry(1.7, 0.4, 1.3), mat(three, 0x3550b8, { rough: 0.4 }));
    const plate = new Mesh(new BoxGeometry(1.5, 0.08, 1.1), mat(three, 0x1f2f78, { rough: 0.5 }));
    plate.position.y = 0.24;
    base.position.y = -0.45;
    plate.position.y = -0.2;
    const pivot = new Group();
    pivot.position.set(-0.1, -0.15, 0);
    const shaft = new Mesh(new CylinderGeometry(0.075, 0.09, 0.7, 14), mat(three, 0xcfd6ee, { metal: 0.5, rough: 0.35 }));
    shaft.position.y = 0.35;
    const ball = new Mesh(new SphereGeometry(0.24, 24, 18), mat(three, 0xe8383d, { rough: 0.25 }));
    ball.position.y = 0.8;
    pivot.add(shaft, ball);
    const btns: InstanceType<T["Mesh"]>[] = [];
    for (const [x, c] of [[0.5, 0x39c26b], [0.75, 0xffc933]] as const) {
      const bt = new Mesh(new CylinderGeometry(0.11, 0.11, 0.1, 16), mat(three, c, { rough: 0.3 }));
      bt.position.set(x, -0.15, 0.3);
      root.add(bt);
      btns.push(bt);
    }
    const coin = new Mesh(new CylinderGeometry(0.34, 0.34, 0.08, 28), mat(three, 0xffc933, { rough: 0.25, metal: 0.4, emissive: 0x7a5200, ei: 0.6 }));
    coin.rotation.x = Math.PI / 2;
    const coinG = new Group();
    coinG.add(coin);
    root.add(base, plate, pivot, coinG);
    root.rotation.x = 0.15;
    anim = (t) => {
      const amp = 0.22 + hover * 0.25;
      const sp = 1.6 + hover * 3;
      pivot.rotation.z = Math.sin(t * sp) * amp;
      pivot.rotation.x = Math.cos(t * sp * 0.9) * amp;
      btns.forEach((b, i) => (b.position.y = -0.15 - (Math.sin(t * (2.2 + hover * 2) + i * 2.4) > 0.75 ? 0.05 : 0)));
      coinG.position.set(0.1, 1.15 + Math.sin(t * 2.5) * 0.12, 0);
      coinG.rotation.y = t * (3 + hover * 5);
      root.rotation.y = Math.sin(t * 0.7) * 0.3;
    };
  } else if (kind === "door") {
    const wood = mat(three, 0x7a4a26, { rough: 0.7 });
    const glow = new Mesh(new three.PlaneGeometry(1.1, 1.9), new three.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0 }));
    glow.position.set(-0.3, 0, -0.05);
    const jambL = new Mesh(new BoxGeometry(0.14, 2.05, 0.2), wood);
    jambL.position.set(-0.9, 0, 0);
    const jambR = jambL.clone();
    jambR.position.x = 0.3;
    const lintel = new Mesh(new BoxGeometry(1.34, 0.14, 0.2), wood);
    lintel.position.set(-0.3, 1.0, 0);
    const hinge = new Group();
    hinge.position.set(-0.83, 0, 0.02);
    const panel = new Mesh(new BoxGeometry(1.06, 1.86, 0.1), mat(three, 0xc4793a, { rough: 0.55 }));
    panel.position.x = 0.53;
    const knob = new Mesh(new SphereGeometry(0.07, 12, 10), mat(three, 0xffc933, { metal: 0.6, rough: 0.3 }));
    knob.position.set(0.9, -0.05, 0.08);
    hinge.add(panel, knob);
    const key = new Group();
    key.position.set(1.0, 0.85, 0);
    const ring = new Mesh(new three.TorusGeometry(0.16, 0.05, 10, 20), mat(three, 0xffc933, { metal: 0.6, rough: 0.3 }));
    ring.position.y = -0.16;
    const shaft = new Mesh(new BoxGeometry(0.07, 0.6, 0.06), mat(three, 0xffc933, { metal: 0.6, rough: 0.3 }));
    shaft.position.y = -0.55;
    const tooth = new Mesh(new BoxGeometry(0.2, 0.08, 0.06), shaft.material);
    tooth.position.set(0.1, -0.75, 0);
    key.add(ring, shaft, tooth);
    root.add(glow, jambL, jambR, lintel, hinge, key);
    root.position.set(-0.05, 0, 0);
    anim = (t) => {
      const sp = 0.5 + hover * 0.5;
      const ph = (t * sp) % 1;
      const open = ph < 0.35 ? 0.5 - 0.5 * Math.cos((ph / 0.35) * Math.PI) : ph < 0.6 ? 1 : ph < 0.9 ? 0.5 + 0.5 * Math.cos(((ph - 0.6) / 0.3) * Math.PI) : 0;
      hinge.rotation.y = -open * 1.3;
      (glow.material as InstanceType<T["MeshBasicMaterial"]>).opacity = open * 0.95;
      key.rotation.z = Math.sin(t * (2 + hover * 2)) * 0.45;
      root.rotation.y = Math.sin(t * 0.6) * 0.25 + 0.2;
    };
  } else {
    const slots = [
      { x: -0.75, h: 0.55, c: 0xc0c8d8 },
      { x: 0, h: 0.9, c: 0xffc933 },
      { x: 0.75, h: 0.38, c: 0xd08a4e },
    ];
    for (const s of slots) {
      const b = new Mesh(new BoxGeometry(0.7, s.h, 0.7), mat(three, s.c, { rough: 0.4, metal: 0.25 }));
      b.position.set(s.x, -0.8 + s.h / 2, 0);
      root.add(b);
    }
    const figs: InstanceType<T["Group"]>[] = [];
    for (const c of [0xff6f91, 0x8fd0ff, 0x7ee0b0]) {
      const f = new Group();
      const body = new Mesh(new three.CapsuleGeometry(0.12, 0.2, 4, 10), mat(three, c, { rough: 0.45 }));
      body.position.y = 0.2;
      const head = new Mesh(new SphereGeometry(0.11, 14, 12), mat(three, 0xffe0c0, { rough: 0.6 }));
      head.position.y = 0.46;
      f.add(body, head);
      root.add(f);
      figs.push(f);
    }
    const pts = [[0, 0], [0.3, 0.02], [0.32, 0.1], [0.12, 0.18], [0.1, 0.4], [0.3, 0.55], [0.5, 0.95], [0.46, 1.0], [0.28, 0.98], [0.1, 0.7]].map(([x, y]) => new three.Vector2(x, y));
    const cup = new Mesh(new three.LatheGeometry(pts, 24), mat(three, 0xffc933, { rough: 0.2, metal: 0.55, emissive: 0x6a4500, ei: 0.5 }));
    cup.scale.setScalar(0.62);
    cup.position.y = 0.55;
    root.add(cup);
    root.rotation.x = 0.1;
    anim = (t) => {
      const sp = 0.4 + hover * 0.5;
      const step = Math.floor(t * sp);
      const fr = t * sp - step;
      const e = fr < 0.3 ? 0.5 - 0.5 * Math.cos((fr / 0.3) * Math.PI) : 1;
      figs.forEach((f, k) => {
        const from = slots[(k + step) % 3];
        const to = slots[(k + step + 1) % 3];
        f.position.x = from.x + (to.x - from.x) * e;
        f.position.y = -0.8 + from.h + (to.h - from.h) * e + (e > 0 && e < 1 ? Math.sin(e * Math.PI) * 0.25 : 0);
      });
      cup.rotation.y = t * (1.4 + hover * 2.5);
      cup.position.y = 0.45 + Math.sin(t * 2) * 0.05 + 0.06;
      root.rotation.y = Math.sin(t * 0.7) * 0.3;
    };
  }

  return {
    scene,
    camera,
    tick: (t, dt) => {
      hover += (target - hover) * Math.min(1, dt * 6);
      anim(t);
    },
    dispose: () => {
      card?.removeEventListener("pointerenter", on);
      card?.removeEventListener("pointerleave", off);
      card?.removeEventListener("focusin", on);
      card?.removeEventListener("focusout", off);
    },
  };
}

export function CardIcon3D({ kind, fallback }: { kind: IconKind; fallback: string }) {
  const host = useRef<HTMLDivElement>(null);
  const live = useScene(host, (three, renderer, el) => buildIcon(three, kind, renderer, el));
  return (
    <div className="relative h-11 w-11">
      {!live && <HomeArt name={fallback} size={44} className="home-icon" />}
      <div ref={host} aria-hidden className="pointer-events-none absolute -inset-[10px] h-16 w-16" />
    </div>
  );
}

// ───────────────────────── Hologram ozubeného kola u nadpisu ─────────────────────────
function buildGear(three: T, renderer: InstanceType<T["WebGLRenderer"]>): Live {
  renderer.setSize(56, 56);
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.5, 5.6);
  camera.lookAt(0, 0, 0);
  lights(three, scene);
  const N = 10;
  const shape = new three.Shape();
  for (let i = 0; i < N * 4; i++) {
    const a = (i / (N * 4)) * Math.PI * 2;
    const r = i % 4 === 1 || i % 4 === 2 ? 1.05 : 0.8;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new three.Path();
  hole.absarc(0, 0, 0.36, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new three.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 });
  geo.translate(0, 0, -0.175);
  const gear = new three.Group();
  const body = new three.Mesh(geo, new three.MeshStandardMaterial({ color: 0x1b6f9a, roughness: 0.35, metalness: 0.5, emissive: 0x0c4a6e, emissiveIntensity: 0.7, transparent: true, opacity: 0.85 }));
  const edges = new three.LineSegments(new three.EdgesGeometry(geo, 25), new three.LineBasicMaterial({ color: 0x9ff1ff }));
  gear.add(body, edges);
  scene.add(gear);
  // světelný paprsek, který přejíždí přes kolo shora dolů
  const scan = new three.Mesh(new three.PlaneGeometry(2.6, 0.08), new three.MeshBasicMaterial({ color: 0xa8f4ff, transparent: true, opacity: 0.9 }));
  scene.add(scan);
  const N_SP = 14;
  const sp = new three.BufferGeometry();
  sp.setAttribute("position", new three.BufferAttribute(new Float32Array(N_SP * 3), 3));
  const sparks = new three.Points(sp, new three.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.9 }));
  scene.add(sparks);
  const seeds = Array.from({ length: N_SP }, (_, i) => ({ a: (i / N_SP) * Math.PI * 2, s: 0.6 + (i % 5) * 0.2, o: i * 0.37 }));
  return {
    scene,
    camera,
    tick: (t) => {
      gear.rotation.z = t * 0.7;
      gear.rotation.x = -0.45 + Math.sin(t * 0.9) * 0.15;
      gear.rotation.y = Math.sin(t * 0.6) * 0.5;
      scan.position.y = Math.sin(t * 1.8) * 1.05;
      const p = sp.attributes.position;
      seeds.forEach((s, i) => {
        const k = (t * s.s + s.o) % 1;
        const r = 1 + k * 0.9;
        p.setXYZ(i, Math.cos(s.a + t * 0.7) * r, Math.sin(s.a + t * 0.7) * r, 0.1);
      });
      p.needsUpdate = true;
      (sparks.material as InstanceType<T["PointsMaterial"]>).opacity = 0.5 + 0.4 * Math.sin(t * 5);
    },
    dispose: () => {},
  };
}

export function GearHolo3D() {
  const host = useRef<HTMLSpanElement>(null);
  const live = useScene(host, (three, renderer) => buildGear(three, renderer));
  return (
    <span aria-hidden className="relative inline-block h-8 w-8 align-middle">
      {!live && <span className="absolute inset-0 text-center leading-8">⚙️</span>}
      <span ref={host} className="pointer-events-none absolute -inset-3 block h-14 w-14" />
    </span>
  );
}

// ───────────────────────── Pozadí sekce: čipy, drony, robotická ruka ─────────────────────────
function buildBackdrop(three: T, renderer: InstanceType<T["WebGLRenderer"]>, host: HTMLElement): Live {
  const section = host.parentElement as HTMLElement;
  let W = 0;
  let H = 0;
  const scene = new three.Scene();
  const camera = new three.OrthographicCamera(0, 1, 1, 0, -600, 600);
  camera.position.z = 300;
  lights(three, scene);
  const world = new three.Group();
  scene.add(world);
  const { Mesh, BoxGeometry, CylinderGeometry, SphereGeometry, Group } = three;
  const CYAN = 0x35d0ff;
  const colors = [0x8fd0ff, 0xc9b8ff, 0x7ee0b0, 0xffc933];

  // DOM → svět (px, y nahoru)
  const rel = (r: DOMRect) => {
    const s = section.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  };

  // čipy v rozích na obvodech
  const chips: { g: InstanceType<T["Group"]>; top: InstanceType<T["Mesh"]>; spark: InstanceType<T["Mesh"]>; ph: number }[] = [];
  const chipPos: [number, number, boolean][] = [];
  const makeChip = (ph: number) => {
    const g = new Group();
    const body = new Mesh(new BoxGeometry(30, 30, 8), mat(three, 0x0c1a30, { rough: 0.35, metal: 0.4 }));
    const topMat = mat(three, 0x0a2a44, { rough: 0.3, emissive: CYAN, ei: 0.5 });
    const top = new Mesh(new BoxGeometry(18, 18, 2), topMat);
    top.position.z = 5;
    const pinMat = mat(three, 0xd7b45a, { metal: 0.7, rough: 0.3 });
    for (let i = 0; i < 5; i++) {
      const o = -10 + i * 5;
      for (const [x, y, w, h] of [[o, 17, 2.4, 6], [o, -17, 2.4, 6], [17, o, 6, 2.4], [-17, o, 6, 2.4]] as const) {
        const pin = new Mesh(new BoxGeometry(w, h, 2), pinMat);
        pin.position.set(x, y, 0);
        g.add(pin);
      }
    }
    const spark = new Mesh(new SphereGeometry(2.6, 10, 8), new three.MeshBasicMaterial({ color: 0xffffff }));
    g.add(body, top, spark);
    world.add(g);
    chips.push({ g, top, spark, ph });
  };
  for (let i = 0; i < 4; i++) makeChip(i * 1.7);

  // drony nad sběrnicí
  type Drone = { g: InstanceType<T["Group"]>; rotors: InstanceType<T["Mesh"]>[]; cube: InstanceType<T["Mesh"]>; edge: number; sp: number; off: number };
  const drones: Drone[] = [];
  for (let i = 0; i < 2; i++) {
    const g = new Group();
    const body = new Mesh(new SphereGeometry(8, 18, 12), mat(three, 0xeaf6ff, { rough: 0.3 }));
    body.scale.set(1.5, 0.55, 1);
    const eye = new Mesh(new SphereGeometry(2.6, 10, 8), new three.MeshBasicMaterial({ color: CYAN }));
    eye.position.set(0, 0, 7);
    const rotors: InstanceType<T["Mesh"]>[] = [];
    for (const sx of [-1, 1]) {
      const arm = new Mesh(new BoxGeometry(12, 1.6, 1.6), mat(three, 0x6f8fb0, { metal: 0.4 }));
      arm.position.set(sx * 13, 4, 0);
      const rotor = new Mesh(new BoxGeometry(18, 0.8, 3), new three.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.75 }));
      rotor.position.set(sx * 19, 6, 0);
      g.add(arm, rotor);
      rotors.push(rotor);
    }
    const rope = new Mesh(new CylinderGeometry(0.5, 0.5, 14, 6), mat(three, 0xaabbd0));
    rope.position.y = -12;
    const cube = new Mesh(new BoxGeometry(12, 12, 12), mat(three, colors[i], { rough: 0.35, emissive: colors[i], ei: 0.35 }));
    cube.position.y = -24;
    g.add(body, eye, rope, cube);
    world.add(g);
    drones.push({ g, rotors, cube, edge: 0, sp: 0.045 + i * 0.012, off: i * 0.5 });
  }

  // robotická ruka: dvoučlánek v rovině, bere kostku na jedné plošině a pokládá ji na druhou
  const arm = new Group();
  world.add(arm);
  const metal = mat(three, 0xcfe3f5, { rough: 0.3, metal: 0.5 });
  const dark = mat(three, 0x233a56, { rough: 0.45, metal: 0.3 });
  const L1 = 66;
  const L2 = 58;
  const pedestal = new Mesh(new CylinderGeometry(15, 19, 14, 20), dark);
  pedestal.rotation.x = Math.PI / 2;
  const ring = new Mesh(new three.TorusGeometry(15, 1.4, 8, 28), new three.MeshBasicMaterial({ color: CYAN }));
  ring.position.z = 8;
  arm.add(pedestal, ring);
  const j1 = new Group();
  const upper = new Mesh(new BoxGeometry(L1, 9, 10), metal);
  upper.position.x = L1 / 2;
  const elbowM = new Mesh(new CylinderGeometry(7, 7, 14, 16), dark);
  elbowM.rotation.x = Math.PI / 2;
  elbowM.position.x = L1;
  const j2 = new Group();
  j2.position.x = L1;
  const fore = new Mesh(new BoxGeometry(L2, 7, 8), metal);
  fore.position.x = L2 / 2;
  const wrist = new Group();
  wrist.position.x = L2;
  const clawPair: InstanceType<T["Mesh"]>[] = [];
  for (const s of [-1, 1]) {
    const f = new Mesh(new BoxGeometry(14, 2.6, 6), dark);
    f.position.set(7, s * 6, 0);
    wrist.add(f);
    clawPair.push(f);
  }
  const palm = new Mesh(new BoxGeometry(4, 18, 8), dark);
  wrist.add(palm);
  j2.add(fore, wrist);
  j1.add(upper, elbowM, j2);
  arm.add(j1);
  const plates: InstanceType<T["Mesh"]>[] = [];
  for (let i = 0; i < 2; i++) {
    const p = new Mesh(new BoxGeometry(34, 5, 14), dark);
    const glow = new Mesh(new BoxGeometry(30, 1, 10), new three.MeshBasicMaterial({ color: CYAN }));
    glow.position.y = 3;
    p.add(glow);
    world.add(p);
    plates.push(p);
  }
  const box = new Mesh(new BoxGeometry(15, 15, 15), mat(three, 0xff8a6b, { rough: 0.35, emissive: 0xff8a6b, ei: 0.35 }));
  world.add(box);

  let basePos = { x: 0, y: 0 };
  let A = { x: 0, y: 0 };
  let B = { x: 0, y: 0 };
  let busY = 0;
  let busX0 = 0;
  let busX1 = 0;

  const layout = () => {
    const sec = section.getBoundingClientRect();
    W = Math.max(1, Math.round(sec.width));
    H = Math.max(1, Math.round(sec.height));
    renderer.setSize(W, H);
    camera.left = 0;
    camera.right = W;
    camera.top = H;
    camera.bottom = 0;
    camera.updateProjectionMatrix();
    const bus = section.querySelector(".bus-line")?.closest("svg");
    const b = bus ? rel(bus.getBoundingClientRect()) : { x: W * 0.2, y: 190, w: W * 0.6, h: 44 };
    busY = H - (b.y + (b.h * 14) / 44);
    busX0 = b.x + 30;
    busX1 = b.x + b.w - 30;
    const hd = section.querySelector("h2");
    const hr = hd ? rel(hd.getBoundingClientRect()) : { x: b.x, y: 80, w: 300, h: 40 };
    basePos = { x: b.x + b.w - 300, y: H - (hr.y - 6) };
    A = { x: basePos.x - 108, y: basePos.y - 62 };
    B = { x: basePos.x - 30, y: basePos.y - 98 };
    // čipy na obvodech: pravý horní a levý dolní roh (stejné souřadnice jako SVG Circuit 320 × 176)
    chipPos.length = 0;
    chipPos.push([W - 191, H - 143, false], [W - 223, H - 191, false], [191, H - (sec.height - 24 - 176 + 63), false], [223, H - (sec.height - 24 - 176 + 111), false]);
    chips.forEach((c, i) => c.g.position.set(chipPos[i][0], chipPos[i][1], 0));
    arm.position.set(basePos.x, basePos.y, 0);
    plates[0].position.set(A.x, A.y - 12, 0);
    plates[1].position.set(B.x, B.y - 12, 0);
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(section);

  // IK dvoučlánku v rovině XY; vrací úhly ramene a lokte
  const ik = (tx: number, ty: number) => {
    const dx = tx - basePos.x;
    const dy = ty - basePos.y;
    const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5);
    const a = Math.atan2(dy, dx);
    const c1 = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const c2 = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))));
    return { s: a + c1, e: -(Math.PI - c2) };
  };
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
  const PERIOD = 9;
  let lastCycle = -1;
  const lift = { x: 0, y: 0 };

  return {
    scene,
    camera,
    tick: (t) => {
      // čipy
      chips.forEach((c, i) => {
        const p = 0.5 + 0.5 * Math.sin(t * 2 + c.ph);
        (c.top.material as InstanceType<T["MeshStandardMaterial"]>).emissiveIntensity = 0.3 + p * 1.1;
        const a = t * 2.2 + i;
        c.spark.position.set(Math.cos(a) * 20, Math.sin(a) * 20, 8);
        c.g.rotation.y = Math.sin(t * 0.7 + i) * 0.25;
        c.g.rotation.x = -0.35 + Math.cos(t * 0.5 + i) * 0.1;
      });
      // drony tam a zpět; na krajích se vymění náklad
      drones.forEach((d, i) => {
        const u = (t * d.sp + d.off) % 2;
        const f = u < 1 ? u : 2 - u;
        const dir = u < 1 ? 1 : -1;
        const x = busX0 + (busX1 - busX0) * ease(f);
        d.g.position.set(x, busY + 36 + Math.sin(t * 2.4 + i * 2) * 5, 20);
        d.g.rotation.z = -dir * 0.12 * Math.sin(Math.PI * f);
        d.g.rotation.y = dir * 0.3;
        d.rotors.forEach((r) => (r.rotation.y = t * 40));
        d.cube.rotation.y = t * 1.2;
        d.cube.rotation.x = Math.sin(t * 2) * 0.2;
        const edge = Math.floor((t * d.sp + d.off) / 1);
        if (edge !== d.edge) {
          d.edge = edge;
          const c = colors[(edge + i * 2) % colors.length];
          const m = d.cube.material as InstanceType<T["MeshStandardMaterial"]>;
          m.color.setHex(c);
          m.emissive.setHex(c);
        }
      });
      // ruka: 0–.2 k A, .2–.3 sevřít, .3–.55 přenést (zvednout), .55–.65 pustit, .65–.85 domů, zbytek klid
      const ph = (t % PERIOD) / PERIOD;
      const cycle = Math.floor(t / PERIOD);
      const HOME = { x: basePos.x - 60, y: basePos.y - 20 };
      let tgt = HOME;
      let grip = 1;
      let carry = false;
      if (ph < 0.2) {
        const e = ease(ph / 0.2);
        tgt = { x: HOME.x + (A.x - HOME.x) * e, y: HOME.y + (A.y + 12 + 14 - HOME.y) * e };
        grip = 1;
      } else if (ph < 0.3) {
        tgt = { x: A.x, y: A.y + 26 };
        grip = 1 - ease((ph - 0.2) / 0.1);
        carry = grip < 0.2;
      } else if (ph < 0.55) {
        const e = ease((ph - 0.3) / 0.25);
        tgt = { x: A.x + (B.x - A.x) * e, y: A.y + 26 + (B.y + 26 - (A.y + 26)) * e + Math.sin(e * Math.PI) * 26 };
        grip = 0;
        carry = true;
      } else if (ph < 0.65) {
        tgt = { x: B.x, y: B.y + 26 };
        grip = ease((ph - 0.55) / 0.1);
        carry = grip < 0.4;
      } else if (ph < 0.85) {
        const e = ease((ph - 0.65) / 0.2);
        tgt = { x: B.x + (HOME.x - B.x) * e, y: B.y + 26 + (HOME.y - B.y - 26) * e };
        grip = 1;
      }
      if (cycle !== lastCycle) {
        lastCycle = cycle;
        (box.material as InstanceType<T["MeshStandardMaterial"]>).color.setHex(colors[cycle % colors.length]);
        (box.material as InstanceType<T["MeshStandardMaterial"]>).emissive.setHex(colors[cycle % colors.length]);
      }
      const a = ik(tgt.x, tgt.y);
      j1.rotation.z = a.s;
      j2.rotation.z = a.e;
      wrist.rotation.z = -(a.s + a.e) - Math.PI / 2;
      clawPair.forEach((c, k) => (c.position.y = (k === 0 ? -1 : 1) * (6 + grip * 3)));
      if (carry) {
        wrist.updateWorldMatrix(true, false);
        const v = new three.Vector3(14, 0, 0);
        wrist.localToWorld(v);
        lift.x = v.x;
        lift.y = v.y;
        box.position.set(lift.x, lift.y - 4, 0);
      } else if (ph < 0.3) box.position.set(A.x, A.y + 2 + 7.5, 0);
      else box.position.set(B.x, B.y + 2 + 7.5, 0);
      box.visible = ph < 0.88;
      box.rotation.y = t * 0.4;
    },
    dispose: () => ro.disconnect(),
  };
}

export function TechBackdrop() {
  const host = useRef<HTMLDivElement>(null);
  useScene(host, (three, renderer, el) => buildBackdrop(three, renderer, el), 1024, 1.5);
  return <div ref={host} aria-hidden className="pointer-events-none absolute inset-0 z-[5] hidden lg:block" />;
}
