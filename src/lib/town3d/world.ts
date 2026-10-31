import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { figureUrl, loadGltf, makeHero, makeLoop, type Figure } from "./kit";
import {
  BRIDGES_X,
  LAGOON,
  LAMPS,
  PLACES,
  RIVER_Z,
  SEA,
  STALLS,
  buildGraph,
  buildRoads,
  distToRoad,
  doorPoint,
  findPath,
  nearestNode,
  type Place,
  type Pt,
  type Road,
} from "./layout";

// Živé 3D městečko: terén, ulice, voda, detailní budovy z Blenderu (public/mestecko3d), hrdina chodí
// po ulicích (klik = cesta k místu, WASD = volná chůze po cestách), obyvatelé, zvířata, den a noc.
// Engine je čistý three.js, React (TownWorld.tsx) jen kreslí panely a popisky.

export type WorldOpts = {
  look: number;
  onSelect: (id: string) => void;
  onArrive: (id: string) => void;
  onCollect?: (slot: number) => void;
  onReady?: () => void;
};

export type WorldHandle = {
  walkTo: (id: string) => void;
  focus: (id: string) => void;
  setNight: (night: boolean) => void;
  setBuildMode: (on: boolean) => void;
  setCollectibles: (slots: { slot: number; kind: string; taken: boolean }[]) => void;
  setQuestMarks: (ids: string[]) => void;
  labels: (cb: (items: { id: string; x: number; y: number; visible: boolean }[]) => void) => void;
  dispose: () => void;
};

const MODEL = (name: string) => `/mestecko3d/${name}.glb`;
const HERO_H = 1.75;
const WALK_SPEED = 6.5;
// Místa denního sběru (sloty 0..17 z lib/town.ts) podél ulic nového městečka.
export const COLLECT_SPOTS: Pt[] = [
  [-10, 2.6], [10, -2.6], [-26, -2.6], [26, 2.6], [2.4, -9], [-2.4, -21], [20, -15.8], [-20, -20.2], [-40.4, -12],
  [40.4, -6], [-46, -22], [48, -26], [-2.4, 20], [27.6, 22], [-32.4, 18], [-10, 30.4], [12, 25.6], [44, 30.4],
];

function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function std(color: number | string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
}

// Textura vlnek na vodu (posouvá se v čase).
function waterTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#4fb8e6";
  g.fillRect(0, 0, 256, 256);
  const r = rand(5);
  for (let i = 0; i < 70; i++) {
    g.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.35})`;
    g.lineWidth = 1.5 + r() * 2;
    const x = r() * 256;
    const y = r() * 256;
    const w = 14 + r() * 26;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + w / 2, y - 4, x + w, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Tráva s jemnými skvrnami (méně ploché než jedna barva).
function grassTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#86c96c";
  g.fillRect(0, 0, 512, 512);
  const r = rand(11);
  for (let i = 0; i < 2600; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? "rgba(110,180,90,0.5)" : v < 0.85 ? "rgba(150,215,120,0.45)" : "rgba(255,240,150,0.35)";
    const s = 2 + r() * 6;
    g.fillRect(r() * 512, r() * 512, s, s * 0.6);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(18, 18);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function fitHeight(obj: THREE.Object3D, h: number) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const s = h / Math.max(0.001, size.y);
  obj.scale.multiplyScalar(s);
  const b2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= b2.min.y;
}

function fitLength(obj: THREE.Object3D, len: number) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  obj.scale.multiplyScalar(len / Math.max(size.x, size.z, 0.001));
  const b2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= b2.min.y;
}

export function createWorld(container: HTMLElement, opts: WorldOpts): WorldHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.45;
  const DAY_SKY = new THREE.Color("#a9dcff");
  const NIGHT_SKY = new THREE.Color("#141a44");
  scene.background = DAY_SKY.clone();
  scene.fog = new THREE.Fog(DAY_SKY.clone(), 140, 300);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 700);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x5a8a4a, 0.75);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 260 });
  scene.add(sun, sun.target);

  const disposables: { dispose: () => void }[] = [env, pmrem];
  const glowMats: THREE.MeshStandardMaterial[] = [];
  const add = <T extends THREE.Object3D>(o: T) => {
    scene.add(o);
    return o;
  };

  // ------------------------------------------------------------------------------------------ terén
  const grassTex = grassTexture();
  disposables.push(grassTex);
  const ground = add(new THREE.Mesh(new THREE.CircleGeometry(150, 96), std("#ffffff", { map: grassTex })));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  // kopce a hory na obzoru
  const r = rand(3);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const dist = 105 + r() * 25;
    const h = 8 + r() * 10;
    const hill = add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(r() < 0.5 ? "#7cbf68" : "#8fcf78", { flatShading: true })));
    hill.scale.set(16 + r() * 10, h, 16 + r() * 10);
    hill.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist);
  }
  for (const [x, z, rr, h] of [[-70, -95, 26, 40], [-25, -110, 32, 55], [25, -112, 30, 50], [72, -98, 28, 44], [105, -60, 22, 34], [-105, -55, 22, 32]]) {
    const m = add(new THREE.Mesh(new THREE.ConeGeometry(rr, h, 7), std("#8fb8a6", { flatShading: true })));
    m.position.set(x, h / 2 - 1, z);
    const cap = add(new THREE.Mesh(new THREE.ConeGeometry(rr * 0.34, h * 0.3, 7), std("#ffffff", { flatShading: true })));
    cap.position.set(x, h * 0.86 - 1, z);
  }

  // ------------------------------------------------------------------------------------------ ulice
  const roads = buildRoads();
  const graph = buildGraph(roads);
  const roadTop = std("#f2e2bf", { roughness: 0.95 });
  const roadEdge = std("#d9c49a", { roughness: 0.95 });
  const planMat = new THREE.MeshStandardMaterial({ color: "#7ee0b0", transparent: true, opacity: 0.0, roughness: 0.9 });
  const planned: THREE.Mesh[] = [];
  const stoneMat = std("#e8d6b0", { roughness: 0.95 });
  function drawRoad(rd: Road) {
    const [x1, z1] = rd.a;
    const [x2, z2] = rd.b;
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ang = Math.atan2(x2 - x1, z2 - z1);
    if (rd.planned) {
      const n = Math.floor(len / 2.2);
      for (let i = 0; i < n; i++) {
        const k = (i + 0.5) / n;
        const m = add(new THREE.Mesh(new THREE.BoxGeometry(rd.w, 0.08, 1.1), planMat));
        m.position.set(x1 + (x2 - x1) * k, 0.05, z1 + (z2 - z1) * k);
        m.rotation.y = ang;
        planned.push(m);
      }
      return;
    }
    const edge = add(new THREE.Mesh(new THREE.BoxGeometry(rd.w + 0.5, 0.08, len), roadEdge));
    edge.position.set((x1 + x2) / 2, 0.04, (z1 + z2) / 2);
    edge.rotation.y = ang;
    edge.receiveShadow = true;
    const top = add(new THREE.Mesh(new THREE.BoxGeometry(rd.w, 0.1, len), roadTop));
    top.position.set((x1 + x2) / 2, 0.06, (z1 + z2) / 2);
    top.rotation.y = ang;
    top.receiveShadow = true;
    // kulaté spoje na koncích (křižovatky nemají zubaté rohy)
    for (const [x, z] of [rd.a, rd.b]) {
      const c = add(new THREE.Mesh(new THREE.CylinderGeometry(rd.w / 2 + 0.25, rd.w / 2 + 0.25, 0.08, 20), roadEdge));
      c.position.set(x, 0.04, z);
      c.receiveShadow = true;
      const c2 = add(new THREE.Mesh(new THREE.CylinderGeometry(rd.w / 2, rd.w / 2, 0.1, 20), roadTop));
      c2.position.set(x, 0.06, z);
      c2.receiveShadow = true;
    }
    // dlažební kostky na hlavních ulicích
    if (!rd.drive) {
      const n = Math.floor(len / 1.6);
      const rr = rand(Math.floor(x1 * 7 + z1 * 13 + 999));
      for (let i = 0; i < n; i++) {
        if (rr() < 0.55) continue;
        const k = (i + 0.5) / n;
        const s = add(new THREE.Mesh(new THREE.BoxGeometry(0.5 + rr() * 0.3, 0.04, 0.4), stoneMat));
        const off = (rr() - 0.5) * (rd.w - 0.8);
        s.position.set(x1 + (x2 - x1) * k + Math.cos(ang) * off, 0.12, z1 + (z2 - z1) * k - Math.sin(ang) * off);
        s.rotation.y = ang + (rr() - 0.5) * 0.4;
        s.receiveShadow = true;
      }
    }
  }
  roads.forEach(drawRoad);
  // náměstí
  const plaza = add(new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 0.12, 48), std("#efdcb4", { roughness: 0.95 })));
  plaza.position.y = 0.08;
  plaza.receiveShadow = true;
  for (let ring = 0; ring < 3; ring++) {
    const m = add(new THREE.Mesh(new THREE.TorusGeometry(4.6 + ring * 1.6, 0.06, 4, 64), stoneMat));
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.15;
  }

  // ------------------------------------------------------------------------------------------ voda
  const waterTex = waterTexture();
  disposables.push(waterTex);
  const waterMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: waterTex, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.95 });
  waterTex.repeat.set(20, 1.2);
  const river = add(new THREE.Mesh(new THREE.PlaneGeometry(300, 7), waterMat));
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.05, RIVER_Z);
  for (const s of [-1, 1]) {
    const bank = add(new THREE.Mesh(new THREE.BoxGeometry(300, 0.3, 0.6), std("#b8a888")));
    bank.position.set(0, 0.12, RIVER_Z + s * 3.6);
  }
  const lagoonTex = waterTex.clone();
  lagoonTex.repeat.set(4, 4);
  lagoonTex.needsUpdate = true;
  disposables.push(lagoonTex);
  const lagoonMat = waterMat.clone();
  lagoonMat.map = lagoonTex;
  lagoonMat.color = new THREE.Color("#a8dcff");
  const lagoon = add(new THREE.Mesh(new THREE.CircleGeometry(LAGOON.r, 48), lagoonMat));
  lagoon.rotation.x = -Math.PI / 2;
  lagoon.position.set(LAGOON.x, 0.06, LAGOON.z);
  const lagoonRim = add(new THREE.Mesh(new THREE.TorusGeometry(LAGOON.r, 0.35, 6, 64), std("#d8c8a8")));
  lagoonRim.rotation.x = Math.PI / 2;
  lagoonRim.position.set(LAGOON.x, 0.15, LAGOON.z);
  const seaMat = lagoonMat.clone();
  seaMat.color = new THREE.Color("#8fd0f6");
  const sea = add(new THREE.Mesh(new THREE.PlaneGeometry(SEA.w, SEA.d), seaMat));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(SEA.x, 0.06, SEA.z);
  const beach = add(new THREE.Mesh(new THREE.PlaneGeometry(SEA.w + 6, SEA.d + 6), std("#f2d79a")));
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(SEA.x, 0.03, SEA.z);
  beach.receiveShadow = true;

  // ------------------------------------------------------------------------------------------ budovy
  const placeObj = new Map<string, THREE.Object3D>();
  const pickables: THREE.Object3D[] = [];
  function prepModel(root: THREE.Object3D) {
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      for (const mat of [m.material].flat() as THREE.MeshStandardMaterial[]) {
        if (mat.name?.startsWith("glow_") && !glowMats.includes(mat)) glowMats.push(mat);
        if (mat.transparent || (mat.opacity ?? 1) < 1) m.castShadow = false;
      }
    });
  }
  function placeholder(p: Place) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(p.hw * 2, 2.5, p.hd * 2), std("#e8e0f0", { transparent: true, opacity: 0.5 }));
    m.position.y = 1.25;
    return m;
  }
  const loads: Promise<unknown>[] = [];
  for (const p of PLACES) {
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.ry;
    g.userData.placeId = p.id;
    const ph = placeholder(p);
    g.add(ph);
    add(g);
    placeObj.set(p.id, g);
    pickables.push(g);
    const url = p.model === "molo" ? figureUrl("molo") : MODEL(p.model);
    loads.push(
      loadGltf(url)
        .then((gltf) => {
          const root = gltf.scene.clone(true);
          prepModel(root);
          if (p.model === "molo") {
            fitLength(root, 14);
            root.rotation.y = Math.PI / 2;
          }
          g.remove(ph);
          ph.geometry.dispose();
          g.add(root);
        })
        .catch(() => {}),
    );
  }
  // mosty, lampy, stánky
  for (const x of BRIDGES_X) {
    loads.push(
      loadGltf(MODEL("most")).then((gltf) => {
        const m = gltf.scene.clone(true);
        prepModel(m);
        m.position.set(x, 0, RIVER_Z);
        add(m);
      }).catch(() => {}),
    );
  }
  loads.push(
    loadGltf(MODEL("lampa")).then((gltf) => {
      for (const [x, z] of LAMPS) {
        const m = gltf.scene.clone(true);
        prepModel(m);
        m.position.set(x, 0, z);
        add(m);
      }
    }).catch(() => {}),
  );
  loads.push(
    loadGltf(MODEL("stanek")).then((gltf) => {
      for (const s of STALLS) {
        const m = gltf.scene.clone(true);
        prepModel(m);
        m.position.set(s.x, 0, s.z);
        m.rotation.y = s.ry;
        add(m);
      }
    }).catch(() => {}),
  );
  // pirátská loď u mola (starý model z městečka)
  let ship: THREE.Object3D | null = null;
  loads.push(
    loadGltf(figureUrl("lod")).then((gltf) => {
      ship = gltf.scene.clone(true);
      prepModel(ship);
      fitLength(ship, 12);
      ship.position.set(-66, 0, 46);
      ship.rotation.y = Math.PI / 2;
      add(ship);
    }).catch(() => {}),
  );

  // ------------------------------------------------------------------------------------------ příroda
  const footprints: { x: number; z: number; r: number }[] = PLACES.map((p) => ({ x: p.x, z: p.z, r: Math.max(p.hw, p.hd) + 1.2 }));
  STALLS.forEach((s) => footprints.push({ x: s.x, z: s.z, r: 2.2 }));
  LAMPS.forEach(([x, z]) => footprints.push({ x, z, r: 0.6 }));
  BRIDGES_X.forEach((x) => footprints.push({ x, z: RIVER_Z, r: 5 }));
  const free = (x: number, z: number, rr: number) =>
    !roads.some((rd) => distToRoad(x, z, rd) < rd.w / 2 + rr) &&
    !footprints.some((f) => Math.hypot(f.x - x, f.z - z) < f.r + rr) &&
    Math.abs(z - RIVER_Z) > 4 + rr &&
    Math.hypot(x - LAGOON.x, z - LAGOON.z) > LAGOON.r + 1 + rr &&
    !(Math.abs(x - SEA.x) < SEA.w / 2 + 3 + rr && Math.abs(z - SEA.z) < SEA.d / 2 + 3 + rr) &&
    Math.hypot(x, z) < 92;
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.6, 7);
  const crownGeo = new THREE.IcosahedronGeometry(1.25, 1);
  const pineGeo = new THREE.ConeGeometry(1.35, 2.2, 8);
  const flowerGeo = new THREE.IcosahedronGeometry(0.22, 0);
  const trunkMat = std("#7a5232");
  const crownMats = [std("#4ea844", { flatShading: true }), std("#3f9a3a", { flatShading: true }), std("#5cbf5a", { flatShading: true })];
  const pineMat = std("#2f7a5a", { flatShading: true });
  const forestMat = std("#2f6a5a", { flatShading: true });
  const treeSpots: { x: number; z: number; s: number; kind: number }[] = [];
  const rr = rand(21);
  for (let i = 0; i < 3000 && treeSpots.length < 230; i++) {
    const x = (rr() - 0.5) * 190;
    const z = (rr() - 0.5) * 180;
    const forest = x < -40 && z < -14;
    const s = forest ? 1.2 + rr() * 0.6 : 0.8 + rr() * 0.5;
    if (!free(x, z, 1.8 * s)) continue;
    treeSpots.push({ x, z, s, kind: forest ? 2 : rr() < 0.35 ? 1 : 0 });
    footprints.push({ x, z, r: 1.4 * s });
  }
  const dummy = new THREE.Object3D();
  const round = treeSpots.filter((t) => t.kind === 0);
  const pines = treeSpots.filter((t) => t.kind > 0);
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpots.length);
  const crowns = crownMats.map((m) => new THREE.InstancedMesh(crownGeo, m, round.length * 3));
  const pineTiers = new THREE.InstancedMesh(pineGeo, pineMat, pines.length * 3);
  const forestTiers = new THREE.InstancedMesh(pineGeo, forestMat, pines.length * 3);
  const ci = [0, 0, 0];
  let pi = 0;
  let fi = 0;
  treeSpots.forEach((t, i) => {
    dummy.position.set(t.x, 0.8 * t.s, t.z);
    dummy.scale.setScalar(t.s);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    if (t.kind === 0) {
      [[0, 2.6, 0, 1], [0.7, 2.2, 0.3, 0.75], [-0.6, 2.3, -0.3, 0.75]].forEach(([dx, dy, dz, sc], k) => {
        dummy.position.set(t.x + dx * t.s, dy * t.s, t.z + dz * t.s);
        dummy.scale.setScalar(t.s * sc);
        dummy.rotation.set(0, i, 0);
        dummy.updateMatrix();
        const mi = (i + k) % 3;
        crowns[mi].setMatrixAt(ci[mi]++, dummy.matrix);
      });
    } else {
      [[1.6, 1], [2.6, 0.78], [3.5, 0.55]].forEach(([dy, sc]) => {
        dummy.position.set(t.x, dy * t.s, t.z);
        dummy.scale.setScalar(t.s * sc);
        dummy.rotation.set(0, i, 0);
        dummy.updateMatrix();
        if (t.kind === 2) forestTiers.setMatrixAt(fi++, dummy.matrix);
        else pineTiers.setMatrixAt(pi++, dummy.matrix);
      });
    }
  });
  crowns.forEach((c, k) => (c.count = ci[k]));
  pineTiers.count = pi;
  forestTiers.count = fi;
  for (const m of [trunks, ...crowns, pineTiers, forestTiers]) {
    m.castShadow = true;
    m.receiveShadow = true;
    add(m);
  }
  const flowerCols = ["#ff6f91", "#ffd24d", "#ffffff", "#a87bff", "#ff9f43"];
  const flowers = flowerCols.map((c) => new THREE.InstancedMesh(flowerGeo, std(c, { flatShading: true }), 120));
  const fc = flowerCols.map(() => 0);
  for (let i = 0; i < 1500; i++) {
    const x = (rr() - 0.5) * 170;
    const z = (rr() - 0.5) * 150;
    if (!free(x, z, 0.4)) continue;
    const k = i % flowerCols.length;
    if (fc[k] >= 120) continue;
    dummy.position.set(x, 0.22, z);
    dummy.scale.setScalar(0.8 + rr() * 0.6);
    dummy.updateMatrix();
    flowers[k].setMatrixAt(fc[k]++, dummy.matrix);
  }
  flowers.forEach((f, k) => {
    f.count = fc[k];
    add(f);
  });

  // ------------------------------------------------------------------------------------------ postavy
  let hero: Figure | null = null;
  const heroPos = new THREE.Vector3(0, 0, 9.5);
  let heroDir = 0;
  let path: Pt[] = [];
  let arriveId: string | null = null;
  makeHero(opts.look)
    .then((f) => {
      hero = f;
      fitHeight(f.root, HERO_H);
      const holder = new THREE.Group();
      holder.add(f.root);
      holder.name = "hero";
      add(holder);
      heroHolder = holder;
    })
    .catch(() => {});
  let heroHolder: THREE.Group | null = null;
  // obyvatelé: chodci po ulicích a stojící u domků
  type Walker = { obj: THREE.Object3D; update: (dt: number) => void; route: Pt[]; t: number; speed: number };
  const walkers: Walker[] = [];
  const statics: { update: (dt: number) => void }[] = [];
  const walkerDefs: [string, Pt[], number][] = [
    ["knihovnice_chuze", [[-30, 0.9], [30, 0.9]], 1.6],
    ["pekar_chuze", [[0.9, 26], [0.9, -16]], 1.4],
    ["kluk_chuze", [[-36, -18.9], [36, -18.9]], 2.0],
    ["hrdina_2_chuze", [[-44, 28.9], [44, 28.9]], 1.7],
    ["hrdina_4_chuze", [[-30.9, 0], [-30.9, 28]], 1.5],
    ["pes_bezi", [[29.1, 2], [29.1, 26]], 3.2],
  ];
  for (const [name, route, speed] of walkerDefs) {
    makeLoop(name)
      .then((l) => {
        fitHeight(l.root, name.startsWith("pes") ? 0.7 : HERO_H * 0.95);
        const holder = new THREE.Group();
        holder.add(l.root);
        add(holder);
        walkers.push({ obj: holder, update: l.update, route, t: rr(), speed });
      })
      .catch(() => {});
  }
  const residents: [string, string, number][] = [
    ["babicka", "babicka", 1.5],
    ["farmar", "farmar", 1.7],
    ["kluk", "kluk", 1.3],
    ["kapitan", "kapitan", 1.75],
    ["vedkyne", "knihovnice", 1.7],
    ["rybar", "pekar", 1.75],
  ];
  for (const [home, model, h] of residents) {
    const p = PLACES.find((x) => x.id === home);
    if (!p) continue;
    makeLoop(model)
      .then((l) => {
        fitHeight(l.root, h);
        const holder = new THREE.Group();
        holder.add(l.root);
        const [dx, dz] = doorPoint(p);
        holder.position.set(dx + 1.6 * Math.cos(p.ry), 0, dz - 1.6 * Math.sin(p.ry));
        holder.rotation.y = Math.atan2(-(Math.cos(p.ry) * 1), Math.sin(p.ry)) + Math.PI;
        add(holder);
        statics.push(l);
      })
      .catch(() => {});
  }
  for (const [name, x, z, h] of [["kocka", 4.5, 3.5, 0.45], ["ovce", -60, -8, 0.9], ["ovce", -58, -11, 0.9], ["slepice", 20, -30, 0.45], ["slepice", 18, -31, 0.45], ["papousek", -58, 36, 0.5], ["pes_sedi", 15.5, -21, 0.6]] as [string, number, number, number][]) {
    makeLoop(name)
      .then((l) => {
        fitHeight(l.root, h);
        l.root.position.x = x;
        l.root.position.z = z;
        l.root.rotation.y = rr() * Math.PI * 2;
        add(l.root);
        statics.push(l);
      })
      .catch(() => {});
  }

  // ------------------------------------------------------------------------------------------ sběr a úkoly
  const starGeo = new THREE.OctahedronGeometry(0.55);
  const collectMats: Record<string, THREE.MeshStandardMaterial> = {
    star: new THREE.MeshStandardMaterial({ color: "#ffd24d", emissive: "#ffb020", emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.3 }),
    coin: new THREE.MeshStandardMaterial({ color: "#ffcf4d", emissive: "#a87a10", emissiveIntensity: 0.4, roughness: 0.25, metalness: 0.8 }),
    mushroom: new THREE.MeshStandardMaterial({ color: "#ff5d73", emissive: "#ff5d73", emissiveIntensity: 0.3, roughness: 0.5 }),
    flower: new THREE.MeshStandardMaterial({ color: "#ff8fd0", emissive: "#ff8fd0", emissiveIntensity: 0.3, roughness: 0.5 }),
  };
  let collectibles: { slot: number; mesh: THREE.Mesh; taken: boolean }[] = [];
  const questGeo = new THREE.ConeGeometry(0.35, 1.0, 4);
  const questMat = new THREE.MeshStandardMaterial({ color: "#ff5d73", emissive: "#ff5d73", emissiveIntensity: 0.8 });
  let questMarks: THREE.Mesh[] = [];

  // ------------------------------------------------------------------------------------------ kamera a ovládání
  const cam = { target: new THREE.Vector3(0, 1.5, 9.5), theta: 0.35, phi: 0.95, dist: 46, follow: true };
  let focusTo: THREE.Vector3 | null = null;
  const keys = new Set<string>();
  let drag: { x: number; y: number; moved: number; button: number } | null = null;
  const pointers = new Map<number, [number, number]>();
  let pinch = 0;
  const el = renderer.domElement;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function placeAt(clientX: number, clientY: number): { place: string | null; point: THREE.Vector3 | null } {
    const rect = el.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables, true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.placeId) o = o.parent;
      if (o) return { place: o.userData.placeId as string, point: h.point };
    }
    const g = ray.intersectObject(ground)[0];
    return { place: null, point: g?.point ?? null };
  }

  function walkToPoint(x: number, z: number, arrive: string | null) {
    const from = nearestNode(graph, heroPos.x, heroPos.z);
    const to = nearestNode(graph, x, z);
    const p = findPath(graph, from, to);
    const end: Pt = [x, z];
    // konec až k cíli, pokud je na cestě (dveře), jinak jen k nejbližšímu bodu ulice
    const onRoad = roads.some((rd) => !rd.planned && distToRoad(x, z, rd) < rd.w / 2 + 0.2);
    path = onRoad ? [...p, end] : p;
    arriveId = arrive;
    cam.follow = true;
  }

  const onDown = (e: PointerEvent) => {
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    drag = { x: e.clientX, y: e.clientY, moved: 0, button: e.button };
  };
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) cam.dist = THREE.MathUtils.clamp(cam.dist * (pinch / d), 14, 140);
      pinch = d;
      return;
    }
    const dx = e.clientX - prev[0];
    const dy = e.clientY - prev[1];
    if (drag) drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag && (drag.button === 2 || e.shiftKey)) {
      cam.follow = false;
      focusTo = null;
      const k = cam.dist * 0.0018;
      cam.target.x -= (dx * Math.cos(cam.theta) + dy * Math.sin(cam.theta)) * k;
      cam.target.z -= (-dx * Math.sin(cam.theta) + dy * Math.cos(cam.theta)) * k;
    } else {
      cam.theta -= dx * 0.006;
      cam.phi = THREE.MathUtils.clamp(cam.phi - dy * 0.005, 0.35, 1.3);
    }
  };
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (drag && drag.moved < 6 && drag.button === 0) {
      const hit = placeAt(e.clientX, e.clientY);
      if (hit.place) {
        opts.onSelect(hit.place);
        const p = PLACES.find((x) => x.id === hit.place)!;
        const [dx, dz] = p.door ? doorPoint(p) : [p.x, p.z];
        walkToPoint(dx, dz, p.id);
      } else if (hit.point) walkToPoint(hit.point.x, hit.point.z, null);
    }
    drag = null;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.08), 14, 140);
  };
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return;
    if ((e.target as HTMLElement)?.closest?.("input,textarea,select,button")) return;
    if (e.type === "keydown") keys.add(k);
    else keys.delete(k);
    e.preventDefault();
  };
  const onContext = (e: Event) => e.preventDefault();
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("contextmenu", onContext);
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);

  const onRoad = (x: number, z: number) => roads.some((rd) => !rd.planned && distToRoad(x, z, rd) < rd.w / 2 + 0.1) || Math.hypot(x, z) < 9.2;

  // ------------------------------------------------------------------------------------------ smyčka
  let night = false;
  let nightK = 0;
  let buildMode = false;
  let raf = 0;
  let last = performance.now();
  let labelCb: ((items: { id: string; x: number; y: number; visible: boolean }[]) => void) | null = null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const v = new THREE.Vector3();
  let time = 0;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  function step(dt: number) {
    time += dt;
    // klávesnice: chůze relativně ke kameře, jen po cestách
    let mx = 0;
    let mz = 0;
    if (keys.has("w") || keys.has("arrowup")) mz -= 1;
    if (keys.has("s") || keys.has("arrowdown")) mz += 1;
    if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
    if (keys.has("d") || keys.has("arrowright")) mx += 1;
    let moving = false;
    if (mx || mz) {
      path = [];
      arriveId = null;
      const len = Math.hypot(mx, mz);
      const fx = (mx * Math.cos(cam.theta) + mz * Math.sin(cam.theta)) / len;
      const fz = (-mx * Math.sin(cam.theta) + mz * Math.cos(cam.theta)) / len;
      const nx = heroPos.x + fx * WALK_SPEED * dt;
      const nz = heroPos.z + fz * WALK_SPEED * dt;
      if (onRoad(nx, nz)) {
        heroPos.x = nx;
        heroPos.z = nz;
      } else if (onRoad(nx, heroPos.z)) heroPos.x = nx;
      else if (onRoad(heroPos.x, nz)) heroPos.z = nz;
      heroDir = Math.atan2(fx, fz);
      moving = true;
      cam.follow = true;
    } else if (path.length) {
      const [tx, tz] = path[0];
      const dx = tx - heroPos.x;
      const dz = tz - heroPos.z;
      const d = Math.hypot(dx, dz);
      const s = WALK_SPEED * dt;
      if (d <= s) {
        heroPos.x = tx;
        heroPos.z = tz;
        path.shift();
        if (!path.length && arriveId) {
          opts.onArrive(arriveId);
          arriveId = null;
        }
      } else {
        heroPos.x += (dx / d) * s;
        heroPos.z += (dz / d) * s;
        heroDir = Math.atan2(dx, dz);
        moving = true;
      }
    }
    if (hero && heroHolder) {
      hero.pose(moving ? "chuze" : "stoji");
      hero.update(dt);
      heroHolder.position.copy(heroPos);
      // postava v modelu hledí k +x: natočit tak, aby mířila směrem chůze
      const want = heroDir - Math.PI / 2;
      let diff = want - heroHolder.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      heroHolder.rotation.y += diff * Math.min(1, dt * 10);
    }
    // sběr: hrdina projde kolem věci
    for (const c of collectibles) {
      if (c.taken) continue;
      c.mesh.rotation.y += dt * 2;
      c.mesh.position.y = 1.0 + Math.sin(time * 3 + c.slot) * 0.2;
      if (Math.hypot(c.mesh.position.x - heroPos.x, c.mesh.position.z - heroPos.z) < 1.4) {
        c.taken = true;
        c.mesh.visible = false;
        opts.onCollect?.(c.slot);
      }
    }
    questMarks.forEach((q, i) => {
      q.position.y = q.userData.baseY + Math.sin(time * 3 + i) * 0.3;
      q.rotation.y += dt * 1.5;
    });
    for (const w of walkers) {
      w.update(dt);
      const [a, b] = w.route;
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      w.t = (w.t + (dt * w.speed) / L / 2) % 1;
      const k = w.t < 0.5 ? w.t * 2 : 2 - w.t * 2;
      const dirx = (b[0] - a[0]) * (w.t < 0.5 ? 1 : -1);
      const dirz = (b[1] - a[1]) * (w.t < 0.5 ? 1 : -1);
      w.obj.position.set(a[0] + (b[0] - a[0]) * k, 0, a[1] + (b[1] - a[1]) * k);
      w.obj.rotation.y = Math.atan2(dirx, dirz) - Math.PI / 2;
    }
    statics.forEach((s) => s.update(dt));
    if (ship) {
      ship.position.y = Math.sin(time * 1.2) * 0.15;
      ship.rotation.z = Math.sin(time * 1.2 + 0.5) * 0.03;
    }
    waterTex.offset.x = (waterTex.offset.x + dt * 0.02) % 1;
    lagoonTex.offset.y = (lagoonTex.offset.y + dt * 0.01) % 1;
    // den a noc
    nightK += ((night ? 1 : 0) - nightK) * Math.min(1, dt * 1.5);
    (scene.background as THREE.Color).lerpColors(DAY_SKY, NIGHT_SKY, nightK);
    (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
    sun.intensity = 2.4 - 2.1 * nightK;
    sun.color.set(nightK > 0.5 ? "#9fb0ff" : "#fff0d8");
    hemi.intensity = 0.75 - 0.5 * nightK;
    scene.environmentIntensity = 0.45 - 0.3 * nightK;
    for (const m of glowMats) m.emissiveIntensity = 0.4 + nightK * 2.6;
    planMat.opacity = buildMode ? 0.45 + 0.2 * Math.sin(time * 4) : 0;
    // kamera
    if (cam.follow) cam.target.lerp(new THREE.Vector3(heroPos.x, 1.5, heroPos.z), Math.min(1, dt * 4));
    if (focusTo) {
      cam.target.lerp(focusTo, Math.min(1, dt * 3));
      if (cam.target.distanceTo(focusTo) < 0.3) focusTo = null;
    }
    camera.position.set(
      cam.target.x + cam.dist * Math.sin(cam.phi) * Math.sin(cam.theta),
      cam.target.y + cam.dist * Math.cos(cam.phi),
      cam.target.z + cam.dist * Math.sin(cam.phi) * Math.cos(cam.theta),
    );
    camera.lookAt(cam.target);
    sun.position.set(cam.target.x - 40, 80, cam.target.z + 30);
    sun.target.position.copy(cam.target);
  }

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden) {
      step(reduce ? dt * 0.5 : dt);
      renderer.render(scene, camera);
      if (labelCb) {
        const rect = el.getBoundingClientRect();
        labelCb(
          PLACES.map((p) => {
            v.set(p.x, p.label, p.z).project(camera);
            const visible = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && (p.kind !== "plot" || buildMode || cam.dist < 60);
            return { id: p.id, x: ((v.x + 1) / 2) * rect.width, y: ((1 - v.y) / 2) * rect.height, visible };
          }),
        );
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  Promise.allSettled(loads).then(() => opts.onReady?.());

  return {
    walkTo(id) {
      const p = PLACES.find((x) => x.id === id);
      if (!p) return;
      const [dx, dz] = p.door ? doorPoint(p) : [p.x, p.z];
      walkToPoint(dx, dz, id);
    },
    focus(id) {
      const p = PLACES.find((x) => x.id === id);
      if (!p) return;
      cam.follow = false;
      focusTo = new THREE.Vector3(p.x, 1.5, p.z);
    },
    setNight(n) {
      night = n;
    },
    setBuildMode(on) {
      buildMode = on;
    },
    setCollectibles(slots) {
      collectibles.forEach((c) => scene.remove(c.mesh));
      collectibles = slots
        .filter((s) => COLLECT_SPOTS[s.slot])
        .map((s) => {
          const mesh = new THREE.Mesh(starGeo, collectMats[s.kind] ?? collectMats.star);
          const [x, z] = COLLECT_SPOTS[s.slot];
          mesh.position.set(x, 1, z);
          mesh.castShadow = true;
          mesh.visible = !s.taken;
          scene.add(mesh);
          return { slot: s.slot, mesh, taken: s.taken };
        });
    },
    setQuestMarks(ids) {
      questMarks.forEach((q) => scene.remove(q));
      questMarks = ids
        .map((id) => PLACES.find((p) => p.id === id))
        .filter((p): p is Place => !!p)
        .map((p) => {
          const q = new THREE.Mesh(questGeo, questMat);
          q.rotation.x = Math.PI;
          q.position.set(p.x, p.label - 0.6, p.z);
          q.userData.baseY = p.label - 0.6;
          scene.add(q);
          return q;
        });
    },
    labels(cb) {
      labelCb = cb;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || m.userData.shared) return;
        m.geometry?.dispose();
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      el.remove();
    },
  };
}
