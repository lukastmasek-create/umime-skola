"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clone as cloneModel } from "three/addons/utils/SkeletonUtils.js";
import { DRACO_DECODER_PATH, getAvatarModel } from "@/lib/avatars3d";
import { AVATAR_REACTIONS, GESTURES, resetMotion, smooth, type Gesture, type Motion } from "@/components/motion-gestures";

export type StageEntry = { id: string; name: string; avatar: string | null; value: string };

// 3D scéna žebříčku: na stupních vítězů stojí první tři a oslavují, ostatní sedí u stolů a jedí, pijí,
// čtou nebo fandí. Postavy jsou stejné modely z Blenderu jako na profilu; stoly, rekvizity, korunu,
// konfety a světla skládá tento soubor z jednoduchých těles.

type Activity = "eat" | "drink" | "read" | "cheer";
const ACTIVITIES: Activity[] = ["eat", "read", "drink", "cheer"];

const PODIUM_X = [0, -1.22, 1.22];
const PODIUM_H = [1.0, 0.72, 0.52];
const PODIUM_COLOR = ["#f5c542", "#c9d3df", "#d9955a"];
const STAND_H = 1.05;
const SEAT_H = 0.95;
const SEAT_Y = 0.3;
const TABLE_TOP = 0.62;
const SEAT_GAP = 0.9;

const std = (color: string | number, rough = 0.55, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

function box(w: number, h: number, d: number, m: THREE.Material, r = 0.03) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const FONT = '"Baloo 2", "Nunito", system-ui, sans-serif';

// Cedulka se jménem a hodnotou (body nebo čas) na stolech a před stupni.
function namePlate(name: string, value: string, highlight: boolean) {
  return canvasTexture(512, 128, (g) => {
    g.fillStyle = highlight ? "#3d57ff" : "#fff6dc";
    roundRect(g, 6, 6, 500, 116, 28);
    g.fill();
    g.lineWidth = 8;
    g.strokeStyle = "#16132b";
    g.stroke();
    g.fillStyle = highlight ? "#ffffff" : "#16132b";
    g.textBaseline = "middle";
    g.font = `800 40px ${FONT}`;
    const valueW = g.measureText(value).width;
    let size = 48;
    const maxW = 512 - 64 - valueW - 24;
    g.font = `800 ${size}px ${FONT}`;
    while (g.measureText(name).width > maxW && size > 24) {
      size -= 2;
      g.font = `800 ${size}px ${FONT}`;
    }
    let text = name;
    while (g.measureText(text).width > maxW && text.length > 2) text = text.slice(0, -1);
    if (text !== name) text += "…";
    g.textAlign = "left";
    g.fillText(text, 32, 66);
    g.font = `800 40px ${FONT}`;
    g.textAlign = "right";
    g.fillStyle = highlight ? "#ffe27a" : "#5a43d6";
    g.fillText(value, 480, 66);
  });
}

function rankNumeral(n: number, color: string) {
  return canvasTexture(256, 256, (g) => {
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `900 200px ${FONT}`;
    g.lineWidth = 18;
    g.strokeStyle = "rgba(22,19,43,0.55)";
    g.strokeText(String(n), 128, 140);
    g.fillStyle = color;
    g.fillText(String(n), 128, 140);
  });
}

function addPlate(parent: THREE.Object3D, tex: THREE.Texture, w: number, pos: THREE.Vector3Like, tilt = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.rotation.x = tilt;
  parent.add(mesh);
  return mesh;
}

// --- rekvizity ---
type Prop = { group: THREE.Group; update: (t: number, a: ActorState) => void };

function cupcake(): Prop {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.02, 32), std("#ffffff", 0.35));
  plate.castShadow = plate.receiveShadow = true;
  g.add(plate);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.07, 24), std("#ff7aa8", 0.6));
  cup.position.y = 0.055;
  cup.castShadow = true;
  g.add(cup);
  const frosting = new THREE.Group();
  frosting.position.y = 0.09;
  const swirl = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), std("#fff0c8", 0.4));
  swirl.scale.set(1, 0.7, 1);
  swirl.castShadow = true;
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 20), std("#fff0c8", 0.4));
  top.position.y = 0.07;
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), std("#e0242f", 0.25));
  cherry.position.y = 0.125;
  frosting.add(swirl, top, cherry);
  g.add(frosting);
  return {
    group: g,
    update: (_t, a) => {
      // Každé sousto ukousne kousek; po pěti se objeví nový dortík.
      const bites = a.bites % 5;
      const s = 1 - bites * 0.16;
      frosting.scale.set(1, Math.max(0.2, s), 1);
      cherry.visible = bites < 2;
      g.scale.setScalar(1 + Math.max(0, 0.15 - (a.t % 2.8) * 0.5) * (bites === 0 ? 1 : 0));
    },
  };
}

function juice(): Prop {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({ color: "#d8f1ff", roughness: 0.1, transparent: true, opacity: 0.35 });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.2, 24, 1, true), glassMat);
  glass.position.y = 0.1;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 24), glassMat);
  base.position.y = 0.006;
  const liquidGeo = new THREE.CylinderGeometry(0.068, 0.056, 0.16, 24);
  liquidGeo.translate(0, 0.08, 0);
  const liquid = new THREE.Mesh(liquidGeo, std("#ff9f1c", 0.3));
  liquid.position.y = 0.01;
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), std("#ff4d6d", 0.4));
  straw.position.set(0.03, 0.14, 0);
  straw.rotation.z = -0.25;
  const slice = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 8, 20), std("#ffd23f", 0.4));
  slice.position.set(-0.06, 0.2, 0);
  slice.rotation.y = Math.PI / 2;
  g.add(glass, base, liquid, straw, slice);
  return {
    group: g,
    update: (_t, a) => {
      const level = 1 - (a.sips % 4) * 0.22;
      liquid.scale.y = Math.max(0.12, level);
    },
  };
}

function book(): Prop {
  const g = new THREE.Group();
  const cover = std("#3d57ff", 0.5);
  const paper = std("#fffdf5", 0.8);
  const left = box(0.17, 0.02, 0.24, cover, 0.01);
  left.position.set(-0.088, 0.01, 0);
  const right = box(0.17, 0.02, 0.24, cover, 0.01);
  right.position.set(0.088, 0.01, 0);
  const pagesL = box(0.155, 0.018, 0.225, paper, 0.004);
  pagesL.position.set(-0.088, 0.027, 0);
  const pagesR = box(0.155, 0.018, 0.225, paper, 0.004);
  pagesR.position.set(0.088, 0.027, 0);
  const flip = new THREE.Group();
  flip.position.set(0, 0.037, 0);
  const sheet = box(0.15, 0.004, 0.22, paper, 0.002);
  sheet.position.x = 0.075;
  flip.add(sheet);
  g.add(left, right, pagesL, pagesR, flip);
  g.rotation.x = -0.35;
  g.position.y = 0.03;
  return {
    group: g,
    update: (_t, a) => {
      const u = (a.t % 3.2) / 3.2;
      flip.rotation.z = u < 0.2 ? Math.PI * smooth(u / 0.2) : 0;
      flip.visible = u < 0.2;
    },
  };
}

function popcorn(): Prop {
  const g = new THREE.Group();
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.085, 0.17, 24, 1, true), std("#e63946", 0.5));
  bucket.position.y = 0.085;
  bucket.castShadow = true;
  g.add(bucket);
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.1215 - i * 0.0002, 0.0865, 0.17, 24, 1, true, i * (Math.PI / 2), 0.55), std("#ffffff", 0.5));
    stripe.position.y = 0.085;
    g.add(stripe);
  }
  const corn = std("#fff3c4", 0.7);
  for (let i = 0; i < 16; i++) {
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + (i % 3) * 0.006, 0), corn);
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 0.07 : 0.03;
    p.position.set(Math.cos(a) * r, 0.19 + (i % 4) * 0.012, Math.sin(a) * r);
    p.castShadow = true;
    g.add(p);
  }
  return { group: g, update: () => {} };
}

const PROPS: Record<Activity, () => Prop> = { eat: cupcake, drink: juice, read: book, cheer: popcorn };

// --- postavy ---
type ActorState = {
  rank: number;
  activity: Activity | "champion" | "second" | "third";
  root: THREE.Group;
  pivot: THREE.Group;
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  joy: THREE.AnimationAction | null;
  idle: THREE.AnimationAction | null;
  prop: Prop | null;
  gesture: { t: number; g: Gesture } | null;
  nextGesture: number;
  nextJoy: number;
  reaction: number;
  motion: Motion;
  t: number;
  bites: number;
  sips: number;
  baseY: number;
  center: number;
  phase: number;
};

function crown() {
  const g = new THREE.Group();
  const gold = std("#ffcf33", 0.25, 0.9);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 24, 1, true), gold);
  (band.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  g.add(band);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 12), gold);
    spike.position.set(Math.cos(a) * 0.185, 0.12, Math.sin(a) * 0.185);
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), std(["#e63946", "#3d57ff", "#2fbf71", "#ff4fa3", "#8f5bff"][i], 0.15));
    gem.position.set(Math.cos(a) * 0.19, 0.2, Math.sin(a) * 0.19);
    g.add(spike, gem);
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return g;
}

type Slot = { rank: number; local: boolean; parent: THREE.Object3D; x: number; y: number; z: number; height: number; kind: "podium" | "seat"; entry: StageEntry };

export default function LeaderboardStage3D({
  entries,
  highlightId,
  label,
  onReady,
  onError,
}: {
  entries: StageEntry[];
  highlightId?: string;
  label: string;
  onReady: () => void;
  onError: () => void;
}) {
  const box_ = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onReady, onError });
  useEffect(() => {
    handlers.current = { onReady, onError };
  });
  const entryKey = entries.map((e) => `${e.id}:${e.avatar}:${e.name}:${e.value}`).join("|");

  useEffect(() => {
    const el = box_.current;
    if (!el) return;
    let disposed = false;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      handlers.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "pan-y";
    el.appendChild(renderer.domElement);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.75;
    const key = new THREE.DirectionalLight(0xfff0d8, 2.4);
    key.position.set(-3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -3;
    key.shadow.camera.far = 20;
    key.shadow.radius = 5;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb9c8ff, 1.1);
    rim.position.set(4, 4, -5);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x4a3a8a, 0.55));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    let halfW = 5.2;
    const fitCamera = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      const aspect = w / Math.max(h, 1);
      camera.aspect = aspect;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = Math.max(halfW / (t * aspect), 2.15 / t);
      camera.position.set(0, 2.5 + d * 0.05, d);
      camera.lookAt(0, 1.3, 0);
      camera.updateProjectionMatrix();
    };

    // --- jeviště ---
    const stage = new THREE.Group();
    scene.add(stage);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7.5, 64), std("#3a2b7d", 0.85));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    stage.add(floor);
    const carpet = new THREE.Mesh(
      new THREE.CircleGeometry(3.0, 64),
      new THREE.MeshStandardMaterial({
        map: canvasTexture(256, 256, (g) => {
          const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
          grad.addColorStop(0, "#ff6b8b");
          grad.addColorStop(0.7, "#d63d6a");
          grad.addColorStop(1, "#a62650");
          g.fillStyle = grad;
          g.fillRect(0, 0, 256, 256);
        }),
        roughness: 0.9,
      }),
    );
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.004;
    carpet.receiveShadow = true;
    stage.add(carpet);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.035, 8, 96), std("#ffcf33", 0.3, 0.8));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.012;
    stage.add(ring);

    // Girlanda vlaječek vzadu
    const bunting = new THREE.Group();
    bunting.position.set(0, 3.15, -1.6);
    const flagColors = ["#ff5d73", "#ffc933", "#4cc9f0", "#7ee0b0", "#b388ff"];
    for (let i = 0; i < 17; i++) {
      const x = -5.6 + i * 0.7;
      const sag = Math.sin((i / 16) * Math.PI) * -0.45;
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.17, 0.34, 3),
        new THREE.MeshStandardMaterial({ color: flagColors[i % flagColors.length], roughness: 0.7, side: THREE.DoubleSide }),
      );
      flag.rotation.set(Math.PI, 0, 0);
      flag.rotation.y = Math.PI / 6;
      flag.position.set(x, sag - 0.1, 0);
      flag.userData.phase = i * 0.6;
      bunting.add(flag);
    }
    const rope = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 17 }, (_, i) => new THREE.Vector3(-5.6 + i * 0.7, Math.sin((i / 16) * Math.PI) * -0.45, 0))), 40, 0.012, 6),
      std("#f3e9ff", 0.8),
    );
    bunting.add(rope);
    stage.add(bunting);

    // Světelné kužele nad stupni
    const beams: THREE.Mesh[] = [];
    for (const [x, tilt] of [[-2.4, 0.42], [2.4, -0.42]] as const) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.95, 5.2, 28, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      );
      cone.position.set(x, 3.05, -0.4);
      cone.rotation.z = tilt;
      cone.userData.base = tilt;
      beams.push(cone);
      stage.add(cone);
    }

    // Konfety
    const CONF = 150;
    const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.11), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), CONF);
    const cData = Array.from({ length: CONF }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: Math.random() * 4,
      z: -1 + Math.random() * 3.2,
      v: 0.35 + Math.random() * 0.55,
      s: Math.random() * 6.28,
      w: 1 + Math.random() * 3,
    }));
    const tint = new THREE.Color();
    for (let i = 0; i < CONF; i++) confetti.setColorAt(i, tint.set(flagColors[i % flagColors.length]));
    confetti.frustumCulled = false;
    if (!reduceMotion) stage.add(confetti);
    const dummy = new THREE.Object3D();

    // --- stupně ---
    const podiumTops: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const h = PODIUM_H[i];
      const body = box(1.1, h, 1.0, std("#f4ecff", 0.5), 0.05);
      body.position.set(PODIUM_X[i], h / 2, 0);
      stage.add(body);
      const cap = box(1.14, 0.07, 1.04, std(PODIUM_COLOR[i], 0.28, 0.65), 0.03);
      cap.position.set(PODIUM_X[i], h + 0.01, 0);
      podiumTops.push(cap);
      stage.add(cap);
      const num = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: rankNumeral(i + 1, PODIUM_COLOR[i]), transparent: true, toneMapped: false }));
      num.position.set(PODIUM_X[i], h * 0.58, 0.502);
      stage.add(num);
    }

    // --- sedadla a stoly ---
    const perSide = entries.length > 7 ? 3 : entries.length > 5 ? 3 : 2;
    const seatCount = Math.max(0, entries.length - 3);
    // Na úzkém displeji sedí u každého stolu jen jeden, ať jsou postavy vidět; zbytek je v seznamu pod scénou.
    const narrow = el.clientWidth < 520;
    const sideCount = Math.max(1, Math.min(narrow ? 1 : perSide, Math.ceil(seatCount / 2)));
    const tables: THREE.Group[] = [];
    const tableW = sideCount * SEAT_GAP + 0.35;
    halfW = 2.2 + tableW + 0.7;
    for (const side of [-1, 1]) {
      const t = new THREE.Group();
      const cx = side * (2.2 + tableW / 2);
      t.position.set(cx, 0, 0.85);
      t.rotation.y = -side * 0.42;
      const wood = std("#c98b4f", 0.55);
      const darkWood = std("#8d5a2b", 0.6);
      const top = box(tableW, 0.07, 0.8, wood, 0.03);
      top.position.set(0, TABLE_TOP - 0.035, 0.55);
      const apron = box(tableW, TABLE_TOP - 0.07, 0.06, darkWood, 0.02);
      apron.position.set(0, (TABLE_TOP - 0.07) / 2, 0.93);
      const bench = box(tableW, 0.07, 0.42, darkWood, 0.03);
      bench.position.set(0, SEAT_Y - 0.035, -0.12);
      const benchSide = box(tableW, SEAT_Y - 0.07, 0.06, darkWood, 0.02);
      benchSide.position.set(0, (SEAT_Y - 0.07) / 2, -0.12);
      t.add(top, apron, bench, benchSide);
      for (const lx of [-tableW / 2 + 0.1, tableW / 2 - 0.1]) {
        const leg = box(0.08, TABLE_TOP, 0.08, darkWood, 0.02);
        leg.position.set(lx, TABLE_TOP / 2, 0.45);
        t.add(leg);
      }
      stage.add(t);
      tables.push(t);
    }

    // Pořadí: 1.–3. na stupních; 4., 6., 8. vlevo od středu ven, 5., 7., 9. vpravo.
    const slots: Slot[] = [];
    entries.slice(0, 3).forEach((entry, i) => {
      slots.push({ rank: i + 1, local: false, parent: stage, x: PODIUM_X[i], y: PODIUM_H[i] + 0.045, z: 0, height: STAND_H, kind: "podium", entry });
    });
    entries.slice(3, 3 + sideCount * 2).forEach((entry, i) => {
      const side = i % 2; // 0 vlevo, 1 vpravo
      const index = Math.floor(i / 2); // 0 = u středu
      const seat = side === 0 ? sideCount - 1 - index : index;
      const local = (seat - (sideCount - 1) / 2) * SEAT_GAP;
      slots.push({ rank: i + 4, local: true, parent: tables[side], x: local, y: SEAT_Y, z: 0.05, height: SEAT_H, kind: "seat", entry });
    });

    const actors: ActorState[] = [];
    const disposables: { dispose: () => void }[] = [];
    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    const loader = new GLTFLoader().setDRACOLoader(draco);
    const crownMesh = crown();
    const crownBase = { y: 0 };
    let ready = false;

    const files = new Set<string>();
    const fallbackFile = getAvatarModel("robot")!;
    files.add(fallbackFile);
    for (const s of slots) files.add(getAvatarModel(s.entry.avatar) ?? fallbackFile);
    const loaded = new Map<string, GLTF>();

    Promise.all([...files].map((f) => loader.loadAsync(f).then((g) => loaded.set(f, g)).catch(() => null))).then(() => {
      if (disposed) return;
      if (!loaded.has(fallbackFile) && loaded.size === 0) {
        handlers.current.onError();
        return;
      }
      slots.forEach((slot, n) => {
        const file = getAvatarModel(slot.entry.avatar) ?? fallbackFile;
        const gltf = loaded.get(file) ?? loaded.get(fallbackFile) ?? [...loaded.values()][0];
        if (!gltf) return;
        const model = cloneModel(gltf.scene);
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const s = slot.height / Math.max(size.y, 0.01);
        model.scale.setScalar(s);
        bounds.setFromObject(model);
        const center = (bounds.max.y - bounds.min.y) / 2;
        const bx = (bounds.min.x + bounds.max.x) / 2;
        const bz = (bounds.min.z + bounds.max.z) / 2;
        model.position.set(-bx, -bounds.min.y - center, -bz);
        const pivot = new THREE.Group();
        pivot.position.y = center;
        pivot.add(model);
        const root = new THREE.Group();
        root.position.set(slot.x, slot.y, slot.z);
        root.add(pivot);
        slot.parent.add(root);

        const mixer = new THREE.AnimationMixer(model);
        const idleClip = gltf.animations.find((c) => c.name === "klid");
        const joyClip = gltf.animations.find((c) => c.name === "radost");
        const idle = idleClip ? mixer.clipAction(idleClip) : null;
        const joy = joyClip ? mixer.clipAction(joyClip) : null;
        if (idle) {
          idle.time = (n * 0.37) % Math.max(idleClip!.duration, 0.1);
          idle.play();
          if (reduceMotion) idle.paused = true;
        }
        if (joy) {
          joy.setLoop(THREE.LoopOnce, 1);
          joy.clampWhenFinished = false;
        }
        const activity: ActorState["activity"] = slot.kind === "podium" ? (["champion", "second", "third"] as const)[slot.rank - 1] : ACTIVITIES[(slot.rank - 4) % ACTIVITIES.length];
        let prop: Prop | null = null;
        if (slot.kind === "seat" && activity !== "champion" && activity !== "second" && activity !== "third") {
          prop = PROPS[activity]();
          prop.group.position.set(slot.x, TABLE_TOP, 0.52);
          prop.group.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) o.castShadow = true;
          });
          slot.parent.add(prop.group);
        }
        // Cedulka: před stupněm na zemi, u stolu na čelní desce.
        const hl = slot.entry.id === highlightId;
        const tex = namePlate(slot.entry.name, slot.entry.value, hl);
        disposables.push(tex);
        if (slot.kind === "podium") {
          const m = addPlate(stage, tex, 1.1, { x: slot.x, y: 0.2, z: 0.75 }, -0.95);
          disposables.push(m.geometry, m.material as THREE.Material);
        } else {
          const m = addPlate(slot.parent, tex, 0.84, { x: slot.x, y: 0.33, z: 0.965 });
          disposables.push(m.geometry, m.material as THREE.Material);
        }
        if (slot.rank === 1) {
          crownMesh.position.set(slot.x, slot.y + slot.height + 0.25, 0);
          crownBase.y = crownMesh.position.y;
          stage.add(crownMesh);
        }
        actors.push({
          rank: slot.rank,
          activity,
          root,
          pivot,
          model,
          mixer,
          joy,
          idle,
          prop,
          gesture: null,
          nextGesture: 1 + Math.random() * 3 + n * 0.2,
          nextJoy: 1.5 + Math.random() * 3,
          reaction: n,
          motion: { y: 0, rotX: 0, rotY: 0, rotZ: 0, sx: 1, sy: 1 },
          t: n * 1.3,
          bites: 0,
          sips: 0,
          baseY: center,
          center,
          phase: n * 0.9,
        });
      });
      fitCamera();
      renderer.render(scene, camera);
      ready = true;
      handlers.current.onReady();
    });

    // --- ovládání: pohyb myši mírně otáčí kamerou, kliknutí na postavu ji rozradostní ---
    let px = 0;
    let pxTarget = 0;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pxTarget = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    };
    const react = (a: ActorState) => {
      if (reduceMotion) return;
      a.gesture = { t: 0, g: AVATAR_REACTIONS[a.reaction++ % AVATAR_REACTIONS.length] };
      if (a.joy) {
        a.joy.reset().play();
        if (a.idle?.isRunning()) a.joy.crossFadeFrom(a.idle, 0.12, false);
      }
    };
    let downAt = 0;
    const onDown = () => (downAt = performance.now());
    const onUp = (e: PointerEvent) => {
      if (performance.now() - downAt > 350) return;
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(actors.map((a) => a.root), true)[0];
      if (!hit) return;
      const actor = actors.find((a) => {
        let o: THREE.Object3D | null = hit.object;
        while (o) {
          if (o === a.root) return true;
          o = o.parent;
        }
        return false;
      });
      if (actor) react(actor);
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);

    const resizeObserver = new ResizeObserver(fitCamera);
    resizeObserver.observe(el);
    fitCamera();

    // --- animace ---
    const clock = new THREE.Clock();
    const bell = (u: number, a: number, b: number) => (u < a || u > b ? 0 : Math.sin(((u - a) / (b - a)) * Math.PI));
    let elapsed = 0;

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      elapsed += dt;
      if (!ready) {
        renderer.render(scene, camera);
        return;
      }
      for (const a of actors) {
        a.t += dt;
        a.mixer.update(dt);
        const m = a.motion;
        resetMotion(m);
        if (!reduceMotion) {
          // oslavy a gesta
          if (a.gesture) {
            a.gesture.t += dt;
            a.gesture.g.run(Math.min(1, a.gesture.t / a.gesture.g.duration), m);
            if (a.gesture.t >= a.gesture.g.duration) a.gesture = null;
          }
          if (a.activity === "champion" || a.activity === "second" || a.activity === "third") {
            const pool = a.activity === "champion" ? [GESTURES.victory, GESTURES.jumpSpin, GESTURES.dance, GESTURES.hop] : a.activity === "second" ? [GESTURES.dance, GESTURES.wiggle, GESTURES.hop, GESTURES.bow] : [GESTURES.wiggle, GESTURES.hop, GESTURES.nod, GESTURES.dance];
            if (!a.gesture && (a.nextGesture -= dt) <= 0) {
              a.gesture = { t: 0, g: pool[a.reaction++ % pool.length] };
              a.nextGesture = (a.activity === "champion" ? 1.2 : 2.4) + Math.random() * 2.2;
              if (a.joy && (a.activity === "champion" || Math.random() < 0.5)) {
                a.joy.reset().play();
                if (a.idle?.isRunning()) a.joy.crossFadeFrom(a.idle, 0.12, false);
              }
            }
            // radost se dohraje a vrací se klid
            if (a.joy && !a.joy.isRunning() && a.idle && !a.idle.isRunning()) a.idle.reset().play();
            // vítězové koukají k publiku, trochu za kurzorem
            m.rotY += px * 0.25;
          } else if (!a.gesture) {
            const t = a.t;
            switch (a.activity) {
              case "eat": {
                const period = 2.8;
                const u = (t % period) / period;
                const bites = Math.floor(t / period);
                a.bites = bites;
                m.rotX = 0.26 * bell(u, 0.15, 0.55);
                m.y = -0.03 * bell(u, 0.15, 0.55);
                const chew = u > 0.55 && u < 0.95 ? Math.sin((u - 0.55) * Math.PI * 10) : 0;
                m.sy = 1 + 0.025 * chew;
                m.sx = 1 - 0.015 * chew;
                break;
              }
              case "drink": {
                const period = 5;
                const u = (t % period) / period;
                a.sips = Math.floor(t / period);
                m.rotX = -0.16 * bell(u, 0.2, 0.6) + 0.08 * bell(u, 0.05, 0.2);
                m.rotZ = 0.05 * Math.sin(t * 0.8);
                break;
              }
              case "read": {
                m.rotX = 0.13;
                m.rotY = 0.28 * Math.sin(t * 0.9);
                break;
              }
              case "cheer": {
                m.y = 0.05 * Math.abs(Math.sin(t * 5.5 + a.phase));
                m.rotZ = 0.07 * Math.sin(t * 5.5 + a.phase);
                if ((a.nextJoy -= dt) <= 0) {
                  a.nextJoy = 2.5 + Math.random() * 3;
                  if (a.joy) {
                    a.joy.reset().play();
                    if (a.idle?.isRunning()) a.joy.crossFadeFrom(a.idle, 0.12, false);
                  }
                }
                if (a.joy && !a.joy.isRunning() && a.idle && !a.idle.isRunning()) a.idle.reset().play();
                break;
              }
            }
            m.rotY += px * 0.12;
          }
          a.prop?.update(a.t, a);
        }
        a.pivot.position.y = a.center + m.y;
        a.pivot.rotation.set(m.rotX, m.rotY, m.rotZ);
        a.pivot.scale.set(m.sx, m.sy, m.sx);
      }

      if (!reduceMotion) {
        px += (pxTarget - px) * Math.min(1, dt * 3);
        crownMesh.position.y = crownBase.y + Math.sin(elapsed * 2.2) * 0.04;
        crownMesh.rotation.y = elapsed * 0.9;
        bunting.children.forEach((c) => {
          if (c.userData.phase !== undefined) c.rotation.z = Math.sin(elapsed * 1.6 + c.userData.phase) * 0.12;
        });
        beams.forEach((b, i) => (b.rotation.z = (b.userData.base as number) + Math.sin(elapsed * 0.6 + i * 2) * 0.08));
        for (let i = 0; i < CONF; i++) {
          const c = cData[i];
          c.y -= c.v * dt;
          if (c.y < 0) {
            c.y = 3.9;
            c.x = (Math.random() - 0.5) * 8;
          }
          dummy.position.set(c.x + Math.sin(elapsed * 0.8 + c.s) * 0.18, c.y, c.z);
          dummy.rotation.set(elapsed * c.w + c.s, elapsed * c.w * 0.7, 0);
          dummy.updateMatrix();
          confetti.setMatrixAt(i, dummy.matrix);
        }
        confetti.instanceMatrix.needsUpdate = true;
        const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const d = Math.max(halfW / (t * camera.aspect), 2.15 / t);
        camera.position.x = px * 0.7;
        camera.position.set(px * 0.7, 2.5 + d * 0.05, d);
        camera.lookAt(0, 1.3, 0);
      }
      renderer.render(scene, camera);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      clock.getDelta();
      renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
    });
    visibility.observe(el);

    return () => {
      disposed = true;
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      actors.forEach((a) => a.mixer.stopAllAction());
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const mat of [mesh.material].flat()) {
          for (const value of Object.values(mat)) if (value instanceof THREE.Texture) value.dispose();
          mat.dispose();
        }
      });
      disposables.forEach((d) => d.dispose());
      confetti.dispose();
      env.dispose();
      pmrem.dispose();
      draco.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [entryKey, highlightId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={box_} role="img" aria-label={label} className="absolute inset-0" />;
}
