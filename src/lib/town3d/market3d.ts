import * as THREE from "three";
import type { StallKey, WorldId } from "@/lib/market-worlds";
import { canvasTex, createStage, makeLoop, makeModel, softDot, std, type Figure } from "./kit";
import { forestTrees, glowSprite, gradientSky, ground, hero, noiseTex, placeModel, rand, sparklePoints, sunLight, waterMat } from "./scenery";

// Uživatelský obchod jako živá 3D scéna: náměstíčko s pěti tematickými stánky do oblouku (modely stanek-<svět>
// z Blenderu), obchodníci za pulty, velká dominanta vzadu (loď, stanice, strom, hrad, kopule) a okolí podle světa.
// Klik na stánek: hrdina k němu dojde a otevře se nabídka (onOpen). Popisky stánků kreslí React přes labels().

// Místo ve scéně: stánky se zbožím, „lod“ = dominanta (stavby do městečka), „sady“ = obchodník se sadami,
// „trh“ = nástěnka trhu mezi hráči.
export type MarketSpot = StallKey | "sady" | "trh";
export type MarketOpts = {
  world: WorldId;
  look: number;
  onOpen: (key: MarketSpot) => void;
  onHover: (key: MarketSpot | null) => void;
};
export type MarketLabel = { key: MarketSpot; x: number; y: number; visible: boolean };
export type MarketHandle = { labels: (cb: (items: MarketLabel[]) => void) => void; open: (key: MarketSpot) => void; dispose: () => void };

const STALLS: MarketSpot[] = ["avatary", "tituly", "ramecky", "pozadi", "mazlicci", "sady", "trh"];
const ARC = [-68, -34, 0, 34, 68, 104, -104].map((d) => (d * Math.PI) / 180);
const RADIUS = 9.5;
const HOME = new THREE.Vector3(0, 0, 4.5);
const SPEED = 5.5;
// obchodníci (postavy z městečka) za pulty v každém světě
const SELLERS: Record<WorldId, string[]> = {
  pirate: ["kapitan", "pekar", "farmar", "knihovnice", "babicka", "kluk", "papousek"],
  space: ["knihovnice", "kluk", "kapitan", "pekar", "farmar", "babicka", "kocka"],
  forest: ["babicka", "farmar", "pekar", "knihovnice", "kluk", "kapitan", "kocka"],
  castle: ["knihovnice", "kapitan", "farmar", "babicka", "pekar", "kluk", "pes_sedi"],
  sea: ["kapitan", "knihovnice", "kluk", "babicka", "farmar", "pekar", "papousek"],
};

function fit(obj: THREE.Object3D, h: number) {
  const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  obj.scale.multiplyScalar(h / Math.max(0.01, size.y));
}

// ------------------------------------------------------------------------------------------- okolí světů
type Env = { update: (t: number, dt: number) => void; prop: Promise<THREE.Object3D | null> };

function planks(color: string, line: string) {
  return canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = color;
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = line;
        g.fillRect(0, i * 32, 256, 3);
        for (let j = 0; j < 3; j++) g.fillRect(((i * 97 + j * 83) % 256) | 0, i * 32, 3, 32);
        g.globalAlpha = 0.12;
        g.fillStyle = i % 2 ? "#ffffff" : "#000000";
        g.fillRect(0, i * 32 + 3, 256, 29);
        g.globalAlpha = 1;
      }
    },
    [6, 6],
  );
}

function disc(r: number, mat: THREE.Material, y = 0.02) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 64), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  return m;
}

function starField(n: number, r: number) {
  const pts = sparklePoints(n, ["#ffffff", "#cfe0ff", "#fff1c8"], 1.6);
  const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 0.45 + 0.05;
    pos.setXYZ(i, Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r);
  }
  pts.material.sizeAttenuation = false;
  pts.material.size = 2.2;
  return pts;
}

function lantern(scene: THREE.Scene, x: number, z: number, color: string, h = 3) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 8), std("#3a3f55", 0.5, 0.5));
  pole.position.set(x, h / 2, z);
  pole.castShadow = true;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), std(color, 0.3, 0, { emissive: color, emissiveIntensity: 2.2 }));
  bulb.position.set(x, h + 0.1, z);
  const halo = glowSprite(color, 2.2);
  halo.position.copy(bulb.position);
  const light = new THREE.PointLight(color, 8, 12, 1.6);
  light.position.copy(bulb.position);
  scene.add(pole, bulb, halo, light);
}

function buildEnv(world: WorldId, scene: THREE.Scene): Env {
  const ringSpots = (n: number, r0: number, r1: number, s: [number, number]) =>
    Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = rand(r0, r1);
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: rand(s[0], s[1]) };
    }).filter((p) => !(p.z > 2 && Math.abs(p.x) < 9) && !(p.z < -14 && Math.abs(p.x) < 14));

  if (world === "pirate") {
    scene.add(gradientSky([["#1c2a5a", 0], ["#c86a7a", 0.5], ["#ffc88a", 0.7], ["#1a4a7a", 1]]));
    scene.fog = new THREE.Fog("#c8889a", 60, 220);
    scene.add(new THREE.HemisphereLight("#ffd0b0", "#2a4a7a", 1.0));
    sunLight(scene, "#ffc890", 2.2, [-14, 12, 10]);
    const water = waterMat("#1a5a9a", "#3a8ac8");
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), water);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.4;
    scene.add(sea);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(15, 15.4, 0.6, 48), std("#ffffff", 0.85, 0, { map: planks("#a8743e", "#6a4426") }));
    deck.position.y = -0.3;
    deck.receiveShadow = true;
    scene.add(deck);
    for (let k = 0; k < 22; k++) {
      const a = (k / 22) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.6, 8), std("#6a4426", 0.9));
      post.position.set(Math.cos(a) * 15.1, -0.3, Math.sin(a) * 15.1);
      scene.add(post);
    }
    for (const [x, z] of [[-11, 2], [11, 2], [-6, -12], [6, -12]] as const) lantern(scene, x, z, "#ffc46b");
    const crate = std("#9a6a3a", 0.85);
    for (const [x, z, s] of [[-12.5, -3, 1], [-12, -1.6, 0.8], [12.6, -2.5, 1], [9, 7, 0.9]] as const) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), crate);
      c.position.set(x, s / 2, z);
      c.rotation.y = x;
      c.castShadow = true;
      scene.add(c);
    }
    const prop = makeModel("lod")
      .then((m) => {
        const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        m.scale.multiplyScalar(16 / Math.max(size.x, size.z));
        m.position.set(0, -0.35, -24);
        return m;
      })
      .catch(() => null);
    return { prop, update: (t) => (water.uniforms.uTime.value = t) };
  }

  if (world === "space") {
    scene.background = new THREE.Color("#070a1e");
    scene.add(starField(900, 400));
    scene.add(new THREE.HemisphereLight("#9ab0ff", "#1a1a3a", 0.8));
    sunLight(scene, "#e8f0ff", 2.4, [10, 16, 12]);
    for (const [x, y, z, r, c] of [[-90, 50, -200, 26, "#c08cff"], [120, 70, -260, 40, "#ffb36b"], [40, 30, -150, 8, "#6fe8ff"]] as const) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), std(c, 0.8, 0, { emissive: c, emissiveIntensity: 0.25 }));
      p.position.set(x, y, z);
      scene.add(p);
    }
    const ringP = new THREE.Mesh(new THREE.TorusGeometry(58, 3, 2, 64), std("#ffd8a0", 0.6, 0, { emissive: "#ffd8a0", emissiveIntensity: 0.3 }));
    ringP.position.set(120, 70, -260);
    ringP.rotation.x = 1.2;
    scene.add(ringP);
    const grid = canvasTex(
      256,
      256,
      (g) => {
        g.fillStyle = "#2a3048";
        g.fillRect(0, 0, 256, 256);
        g.strokeStyle = "#4fd8ff";
        g.globalAlpha = 0.5;
        g.lineWidth = 3;
        g.strokeRect(0, 0, 256, 256);
        g.globalAlpha = 0.18;
        g.lineWidth = 1;
        g.strokeRect(64, 64, 128, 128);
      },
      [10, 10],
    );
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(15, 15.5, 0.5, 48), std("#ffffff", 0.4, 0.4, { map: grid, emissive: "#0a1a2a", emissiveIntensity: 0.6 }));
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    scene.add(floor);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(15.2, 0.12, 8, 96), std("#4fd8ff", 0.3, 0, { emissive: "#4fd8ff", emissiveIntensity: 2 }));
    rim.rotation.x = Math.PI / 2;
    scene.add(rim);
    for (const [x, z] of [[-11, 2], [11, 2], [-6, -12], [6, -12]] as const) lantern(scene, x, z, "#6fe8ff", 2.6);
    const orbs = Array.from({ length: 6 }, (_, i) => {
      const s = glowSprite(["#6fe8ff", "#c08cff", "#7ee0b0"][i % 3], 1.2);
      scene.add(s);
      return s;
    });
    const prop = placeModel("stanice")
      .then((m) => {
        m.position.set(0, -0.2, -24);
        return m;
      })
      .catch(() => null);
    return {
      prop,
      update: (t) =>
        orbs.forEach((o, i) => {
          const a = t * 0.4 + (i / 6) * Math.PI * 2;
          o.position.set(Math.cos(a) * 12, 3.5 + Math.sin(t * 1.3 + i) * 0.6, Math.sin(a) * 12 - 2);
        }),
    };
  }

  if (world === "forest") {
    scene.add(gradientSky([["#120f38", 0], ["#2e3a86", 0.5], ["#6aa6c0", 0.78], ["#2a4a52", 1]]));
    scene.fog = new THREE.FogExp2("#26365e", 0.022);
    scene.add(new THREE.HemisphereLight("#9ab8ff", "#1a3a2a", 1.0));
    sunLight(scene, "#c8d8ff", 1.5, [-12, 20, 10]);
    scene.add(ground(noiseTex("#2f5a34", ["#24482a", "#3d6e3a", "#1d3b24", "#4a7a40"], 2200)));
    scene.add(disc(13, std("#ffffff", 1, 0, { map: noiseTex("#8a6a48", ["#7a5a3a", "#9a7a58", "#6a4a2a"], 900, 256, 6, [2, 6]) })));
    scene.add(forestTrees(ringSpots(150, 16, 70, [1.1, 2.4]), "pine", ["#1f5a3a", "#2a6a42", "#174a32", "#2f7a4a"]));
    for (const [x, z, c] of [[-11, 2, "#ff6fd8"], [11, 2, "#6ff0ff"], [-6, -12, "#b88cff"], [6, -12, "#fff59a"]] as const) lantern(scene, x, z, c, 2.4);
    const flies = sparklePoints(200, ["#fff59a", "#c8ff9a", "#ffe08a"], 0.22);
    const base = Array.from({ length: 200 }, () => [rand(-24, 24), rand(0.3, 6), rand(-24, 16), Math.random() * 6] as const);
    scene.add(flies);
    const fp = flies.geometry.attributes.position as THREE.BufferAttribute;
    const prop = placeModel("strom")
      .then((m) => {
        m.scale.setScalar(1.3);
        m.position.set(0, 0, -23);
        return m;
      })
      .catch(() => null);
    return {
      prop,
      update: (t) => {
        base.forEach(([x, y, z, ph], i) => fp.setXYZ(i, x + Math.sin(t * 0.6 + ph) * 0.8, y + Math.sin(t * 1.3 + ph * 2) * 0.4, z + Math.cos(t * 0.5 + ph) * 0.8));
        fp.needsUpdate = true;
      },
    };
  }

  if (world === "castle") {
    scene.add(gradientSky([["#3f8fe8", 0], ["#8cc8ff", 0.45], ["#e4f4ff", 0.72], ["#a8c890", 1]]));
    scene.fog = new THREE.Fog("#dcefff", 70, 260);
    scene.add(new THREE.HemisphereLight("#e0f0ff", "#6a8a4a", 1.0));
    sunLight(scene, "#fff2d6", 2.6, [14, 22, 18]);
    scene.add(ground(noiseTex("#6aa84a", ["#5a9a40", "#7ab85a", "#4e8a3a", "#88c060"], 2400)));
    scene.add(disc(14, std("#ffffff", 0.95, 0, { map: noiseTex("#c8c0b0", ["#b8b0a0", "#d8d0c0", "#a8a090"], 1400, 256, 6, [3, 9]) })));
    scene.add(forestTrees(ringSpots(80, 17, 80, [0.9, 1.7]), "round", ["#3f9a4a", "#4eaa58", "#2f8a42", "#5ab85e"]));
    const flags: { m: THREE.Mesh; base: Float32Array; ph: number }[] = [];
    for (const [x, z, c] of [[-12, 1, "#c0392b"], [12, 1, "#2e5aa8"], [-8, -11, "#2e5aa8"], [8, -11, "#c0392b"]] as const) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 4.4, 8), std("#6a4a2a", 0.7));
      pole.position.set(x, 2.2, z);
      pole.castShadow = true;
      const geo = new THREE.PlaneGeometry(1.3, 0.9, 12, 4);
      const flag = new THREE.Mesh(geo, std(c, 0.7, 0, { side: THREE.DoubleSide }));
      flag.position.set(x + 0.66, 3.7, z);
      scene.add(pole, flag);
      flags.push({ m: flag, base: Float32Array.from(geo.attributes.position.array), ph: x });
    }
    const prop = placeModel("hrad")
      .then((m) => {
        m.position.set(0, 0, -30);
        return m;
      })
      .catch(() => null);
    return {
      prop,
      update: (t) =>
        flags.forEach((f) => {
          const p = f.m.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(t * 5 + f.base[i * 3] * 4 + f.ph) * 0.14 * ((f.base[i * 3] + 0.65) / 1.3));
          p.needsUpdate = true;
        }),
    };
  }

  // sea: pod hladinou
  scene.background = new THREE.Color("#0b5a8a");
  scene.fog = new THREE.FogExp2("#0b5a8a", 0.03);
  scene.add(new THREE.HemisphereLight("#bfefff", "#1a5a7a", 1.2));
  sunLight(scene, "#dff8ff", 2.0, [6, 24, 8]);
  scene.add(ground(noiseTex("#e8d4a0", ["#d8c490", "#f4e4b8", "#c8b480", "#b8a070"], 2600, 256, 30)));
  scene.add(disc(13, std("#f4e8c8", 0.9)));
  const corals = new THREE.InstancedMesh(new THREE.ConeGeometry(0.35, 1.4, 6), std("#ffffff", 0.7), 160);
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  ringSpots(220, 14, 50, [0.6, 1.6])
    .slice(0, 160)
    .forEach((p, i) => {
      m4.compose(new THREE.Vector3(p.x, 0.6 * p.s, p.z), new THREE.Quaternion(), new THREE.Vector3(p.s, p.s, p.s));
      corals.setMatrixAt(i, m4);
      corals.setColorAt(i, col.set(["#ff6f91", "#ffb347", "#c08cff", "#6fe0c0", "#ff8fb8"][i % 5]));
    });
  scene.add(corals);
  const weed = std("#3fa04a", 0.7);
  const weeds = ringSpots(90, 13, 40, [0.8, 1.6]).map((p) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 3 * p.s, 5), weed);
    w.geometry.translate(0, 1.5 * p.s, 0);
    w.position.set(p.x, 0, p.z);
    scene.add(w);
    return w;
  });
  const rays = Array.from({ length: 10 }, (_, i) => {
    const r = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 26),
      new THREE.MeshBasicMaterial({ map: softDot("rgba(220,250,255,0.35)", "rgba(220,250,255,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    );
    r.position.set(-24 + i * 5.5, 12, -8 + (i % 3) * 5);
    r.rotation.z = 0.25;
    scene.add(r);
    return r;
  });
  const bubbles = sparklePoints(160, ["#dff8ff"], 0.2);
  const bb = Array.from({ length: 160 }, () => [rand(-20, 20), rand(0, 1), rand(-24, 10), rand(0.6, 1.4)] as const);
  scene.add(bubbles);
  const bp = bubbles.geometry.attributes.position as THREE.BufferAttribute;
  for (const [x, z] of [[-11, 2], [11, 2], [-6, -12], [6, -12]] as const) lantern(scene, x, z, "#7fe8ff", 2.4);
  const prop = placeModel("podmorske")
    .then((m) => {
      m.scale.setScalar(1.7);
      m.position.set(0, 0, -24);
      return m;
    })
    .catch(() => null);
  return {
    prop,
    update: (t) => {
      weeds.forEach((w, i) => (w.rotation.z = Math.sin(t * 1.2 + i) * 0.12));
      rays.forEach((r, i) => ((r.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * Math.sin(t * 0.7 + i)));
      bb.forEach(([x, y, z, sp], i) => bp.setXYZ(i, x + Math.sin(t + i) * 0.2, ((t * 0.12 * sp + y) % 1) * 14, z));
      bp.needsUpdate = true;
    },
  };
}

// ------------------------------------------------------------------------------------------------ scéna
export function createMarket3D(container: HTMLElement, opts: MarketOpts): MarketHandle | null {
  const stage = createStage(container);
  if (!stage) return null;
  const { renderer } = stage;
  stage.el.style.background = "transparent";
  const scene = new THREE.Scene();
  scene.environment = stage.env;
  scene.environmentIntensity = 0.4;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1400);
  const cam = { theta: 0, phi: 0.42, dist: 23, target: new THREE.Vector3(0, 1.6, -3) };
  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 58 : 40;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const env = buildEnv(opts.world, scene);
  const sky = scene.children.find((c) => c.renderOrder === -10) ?? null;
  const stallObj = new Map<MarketSpot, THREE.Group>();
  const front = new Map<MarketSpot, THREE.Vector3>();
  const loops: { update: (dt: number) => void }[] = [];
  const loads: Promise<unknown>[] = [];
  STALLS.forEach((key, i) => {
    const a = ARC[i];
    const x = Math.sin(a) * RADIUS;
    const z = -Math.cos(a) * RADIUS;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = Math.atan2(-x, -z); // pultem do středu náměstí
    g.userData.stall = key;
    scene.add(g);
    stallObj.set(key, g);
    front.set(key, new THREE.Vector3(x, 0, z).multiplyScalar((RADIUS - 2.3) / RADIUS));
    loads.push(placeModel(`stanek-${opts.world}`).then((m) => g.add(m)).catch(() => {}));
    loads.push(
      makeLoop(SELLERS[opts.world][i], 0.8 + i * 0.07)
        .then((s) => {
          // zvířátko sedí na pultu, lidé stojí za ním (+Y v Blenderu = -z); postavy z městečka hledí k +x
          const pet = ["papousek", "kocka", "pes_sedi"].includes(SELLERS[opts.world][i]);
          fit(s.root, pet ? 0.6 : 1.62);
          if (pet) s.root.position.set(0.8, 1.08, -0.25);
          else s.root.position.set(0, 0, -0.75);
          s.root.rotation.y = -Math.PI / 2;
          g.add(s.root);
          loops.push(s);
        })
        .catch(() => {}),
    );
  });
  let propObj: THREE.Object3D | null = null;
  loads.push(
    env.prop.then((p) => {
      if (!p) return;
      p.traverse((o) => (o.userData.stall = "lod"));
      p.userData.stall = "lod";
      scene.add(p);
      propObj = p;
    }),
  );
  let f: Figure | null = null;
  loads.push(
    hero(opts.look)
      .then((h) => {
        f = h;
        h.root.position.copy(HOME);
        h.root.rotation.y = Math.PI / 2;
        scene.add(h.root);
      })
      .catch(() => {}),
  );

  // ---- chůze k stánku a otevření
  let path: THREE.Vector3[] = [];
  let arrive: MarketSpot | null = null;
  function open(key: MarketSpot) {
    if (key === "lod") {
      opts.onOpen(key);
      return;
    }
    const target = front.get(key);
    if (!f || !target) {
      opts.onOpen(key);
      return;
    }
    // kolem středu po oblouku, ať hrdina neprochází stánky
    const from = f.root.position.clone();
    const mid = target.clone().setLength(Math.max(4.5, Math.min(from.length(), target.length())));
    path = [mid, target];
    arrive = key;
  }

  // ---- ovládání: klik, najetí, tažení a kolečko
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const el = renderer.domElement;
  const pick = (e: PointerEvent): MarketSpot | null => {
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const targets: THREE.Object3D[] = [...stallObj.values()];
    if (propObj) targets.push(propObj);
    for (const h of ray.intersectObjects(targets, true)) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.stall) o = o.parent;
      if (o) return o.userData.stall as MarketSpot;
    }
    return null;
  };
  let drag: { x: number; y: number; moved: number } | null = null;
  let hovered: MarketSpot | null = null;
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, y: e.clientY, moved: 0 };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.x = e.clientX;
      drag.y = e.clientY;
      cam.theta = THREE.MathUtils.clamp(cam.theta - dx * 0.005, -0.9, 0.9);
      cam.phi = THREE.MathUtils.clamp(cam.phi + dy * 0.003, 0.18, 0.95);
      return;
    }
    const k = pick(e);
    if (k !== hovered) {
      hovered = k;
      el.style.cursor = k ? "pointer" : "grab";
      opts.onHover(k);
    }
  };
  const onUp = (e: PointerEvent) => {
    const wasClick = drag && drag.moved < 6;
    drag = null;
    if (!wasClick) return;
    const k = pick(e);
    if (k) open(k);
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.08), 13, 34);
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });
  el.style.cursor = "grab";
  el.style.touchAction = "none";

  // ---- smyčka
  let labelCb: ((items: MarketLabel[]) => void) | null = null;
  const v = new THREE.Vector3();
  let raf = 0;
  let last = performance.now();
  let time = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden) return;
    time += dt;
    env.update(time, dt);
    for (const l of loops) l.update(dt);
    stallObj.forEach((g, key) => g.scale.setScalar(hovered === key ? 1.04 : 1));
    if (f) {
      const r = f.root;
      if (path.length) {
        const tgt = path[0];
        const d = v.copy(tgt).sub(r.position);
        d.y = 0;
        const len = d.length();
        if (len < SPEED * dt) {
          r.position.copy(tgt);
          path.shift();
          if (!path.length && arrive) {
            const g = stallObj.get(arrive)!;
            r.rotation.y = -Math.atan2(g.position.z - r.position.z, g.position.x - r.position.x);
            opts.onOpen(arrive);
            arrive = null;
          }
        } else {
          r.position.addScaledVector(d.normalize(), SPEED * dt);
          r.rotation.y = -Math.atan2(d.z, d.x);
        }
        f.pose(path.length ? "chuze" : "stoji");
      } else f.pose("stoji");
      f.update(dt);
    }
    camera.position.set(
      cam.target.x + Math.sin(cam.theta) * Math.cos(cam.phi) * cam.dist,
      cam.target.y + Math.sin(cam.phi) * cam.dist,
      cam.target.z + Math.cos(cam.theta) * Math.cos(cam.phi) * cam.dist,
    );
    camera.lookAt(cam.target);
    sky?.position.copy(camera.position);
    renderer.render(scene, camera);
    if (labelCb) {
      const rect = el.getBoundingClientRect();
      labelCb(
        STALLS.map((key) => {
          const g = stallObj.get(key)!;
          v.set(g.position.x, 4.4, g.position.z).project(camera);
          return { key, x: ((v.x + 1) / 2) * rect.width, y: ((1 - v.y) / 2) * rect.height, visible: v.z < 1 };
        }),
      );
    }
  };
  void Promise.race([Promise.all(loads), new Promise((r) => window.setTimeout(r, 4000))]).then(() => {
    stage.el.style.opacity = "1";
  });
  raf = requestAnimationFrame(frame);

  return {
    labels(cb) {
      labelCb = cb;
    },
    open,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
      stage.dispose([scene]);
    },
  };
}
