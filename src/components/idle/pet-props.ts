import * as THREE from "three";
import type { SpeciesId } from "@/lib/idle/pets";

// Rekvizity, které se u mazlíčka objeví při akcích: miska s oblíbeným jídlem při krmení, míč při hraní,
// srdíčka při radosti. Jsou poskládané z jednoduchých těles, aby nebyl potřeba žádný další soubor.

// Oblíbené jídlo podle skutečné stravy druhu (pohádkoví tvorové dostali nejbližší reálnou obdobu).
export type FoodKind = "fish" | "bone" | "carrot" | "mouse" | "meat" | "seeds" | "bamboo" | "fly" | "apple" | "battery";

export const FAVORITE_FOOD: Record<SpeciesId, FoodKind> = {
  cat: "fish",
  dog: "bone",
  bunny: "carrot",
  fox: "mouse",
  dragon: "meat",
  hamster: "seeds",
  panda: "bamboo",
  penguin: "fish",
  frog: "fly",
  unicorn: "apple",
  robot: "battery",
};

const std = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, ...extra });

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number] = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.castShadow = true;
  return m;
}

function ellipsoid(rx: number, ry: number, rz: number, material: THREE.Material, position: [number, number, number] = [0, 0, 0]) {
  const m = mesh(new THREE.SphereGeometry(1, 20, 14), material, position);
  m.scale.set(rx, ry, rz);
  return m;
}

// Miska: soustruhem vytvořený profil s tlustým okrajem, uvnitř tmavší dno.
export function makeBowl() {
  const group = new THREE.Group();
  const profile = [
    [0.0, 0.0],
    [0.26, 0.0],
    [0.3, 0.03],
    [0.5, 0.2],
    [0.54, 0.27],
    [0.5, 0.29],
    [0.46, 0.26],
    [0.28, 0.1],
    [0.0, 0.08],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bowl = mesh(new THREE.LatheGeometry(profile, 40), std("#3248f0", { roughness: 0.3, side: THREE.DoubleSide }));
  group.add(bowl);
  const rim = mesh(new THREE.TorusGeometry(0.5, 0.025, 10, 40), std("#ffffff", { roughness: 0.35 }), [0, 0.28, 0]);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);
  // Tlapka na boku misky.
  const paw = new THREE.Group();
  paw.add(ellipsoid(0.07, 0.06, 0.012, std("#ffffff"), [0, -0.02, 0]));
  for (const x of [-0.08, -0.028, 0.028, 0.08]) paw.add(ellipsoid(0.026, 0.03, 0.01, std("#ffffff"), [x, 0.065 + (Math.abs(x) < 0.05 ? 0.02 : 0), 0]));
  paw.position.set(0, 0.14, 0.42);
  paw.rotation.x = -0.45;
  group.add(paw);
  return group;
}

function fish() {
  const g = new THREE.Group();
  g.add(ellipsoid(0.2, 0.09, 0.07, std("#9ec5e8", { metalness: 0.3, roughness: 0.3 })));
  g.add(ellipsoid(0.16, 0.035, 0.075, std("#e8f3ff", { roughness: 0.4 }), [0.01, -0.035, 0]));
  const tail = mesh(new THREE.ConeGeometry(0.1, 0.16, 3), std("#6f9fd0"), [-0.25, 0, 0]);
  tail.rotation.z = Math.PI / 2;
  tail.scale.z = 0.35;
  g.add(tail);
  const fin = mesh(new THREE.ConeGeometry(0.05, 0.1, 3), std("#6f9fd0"), [0, 0.1, 0]);
  fin.scale.z = 0.3;
  g.add(fin);
  g.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), std("#16132b"), [0.14, 0.02, 0.06]));
  g.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), std("#16132b"), [0.14, 0.02, -0.06]));
  return g;
}

function bone() {
  const g = new THREE.Group();
  const m = std("#f4ecd8", { roughness: 0.6 });
  const shaft = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 14), m);
  shaft.rotation.z = Math.PI / 2;
  g.add(shaft);
  for (const x of [-0.18, 0.18]) for (const z of [-0.045, 0.045]) g.add(mesh(new THREE.SphereGeometry(0.06, 14, 12), m, [x, 0, z]));
  return g;
}

function carrot() {
  const g = new THREE.Group();
  const body = mesh(new THREE.ConeGeometry(0.09, 0.42, 16), std("#ff8a2b", { roughness: 0.5 }), [0, 0, 0]);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  for (let i = 0; i < 3; i++) {
    const leaf = mesh(new THREE.ConeGeometry(0.03, 0.16, 8), std("#3d9a4a"), [0.28, (i - 1) * 0.03, (i - 1) * 0.05]);
    leaf.rotation.z = -Math.PI / 2 + (i - 1) * 0.35;
    g.add(leaf);
  }
  for (const x of [-0.05, 0.06]) {
    const ring = mesh(new THREE.TorusGeometry(0.075 - x * 0.1, 0.006, 6, 16), std("#e0701a"), [x, 0, 0]);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
  }
  return g;
}

function mouse() {
  const g = new THREE.Group();
  const fur = std("#b7b0a6", { roughness: 0.8 });
  g.add(ellipsoid(0.16, 0.09, 0.08, fur));
  g.add(ellipsoid(0.06, 0.055, 0.05, fur, [0.15, -0.01, 0]));
  g.add(mesh(new THREE.SphereGeometry(0.014, 8, 8), std("#ff8fb3"), [0.205, -0.01, 0]));
  for (const z of [-0.035, 0.035]) g.add(mesh(new THREE.SphereGeometry(0.038, 12, 10), std("#ffc2d6"), [0.12, 0.075, z]));
  g.add(mesh(new THREE.SphereGeometry(0.012, 8, 8), std("#16132b"), [0.185, 0.02, 0.03]));
  g.add(mesh(new THREE.SphereGeometry(0.012, 8, 8), std("#16132b"), [0.185, 0.02, -0.03]));
  const tail = mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 20, Math.PI * 1.2), std("#ffc2d6"), [-0.2, 0, 0]);
  tail.rotation.z = Math.PI * 0.9;
  g.add(tail);
  return g;
}

function meat() {
  const g = new THREE.Group();
  g.add(ellipsoid(0.2, 0.16, 0.14, std("#a8501f", { roughness: 0.45 }), [0.05, 0, 0]));
  g.add(ellipsoid(0.13, 0.1, 0.1, std("#c46a2c", { roughness: 0.45 }), [0.1, 0.05, 0]));
  const stick = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 12), std("#f4ecd8"), [-0.22, -0.02, 0]);
  stick.rotation.z = Math.PI / 2;
  g.add(stick);
  for (const z of [-0.035, 0.035]) g.add(mesh(new THREE.SphereGeometry(0.05, 12, 10), std("#f4ecd8"), [-0.36, -0.02, z]));
  return g;
}

function seeds() {
  const g = new THREE.Group();
  const cream = std("#d8d2c0", { roughness: 0.6 });
  const dark = std("#2a2a2a", { roughness: 0.6 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 0.04 + (i % 3) * 0.05;
    const s = new THREE.Group();
    s.add(ellipsoid(0.075, 0.032, 0.042, cream));
    s.add(ellipsoid(0.066, 0.018, 0.018, dark, [0, 0.024, 0]));
    s.position.set(Math.cos(a) * r, (i % 2) * 0.02, Math.sin(a) * r);
    s.rotation.y = a * 1.7;
    s.rotation.z = (i % 3 - 1) * 0.3;
    g.add(s);
  }
  return g;
}

function bamboo() {
  const g = new THREE.Group();
  const green = std("#6dbb4a", { roughness: 0.4 });
  const joint = std("#4a8a32");
  for (let k = 0; k < 3; k++) {
    const stalk = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      stalk.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12), green, [0, i * 0.15, 0]));
      stalk.add(mesh(new THREE.TorusGeometry(0.042, 0.011, 6, 14), joint, [0, i * 0.15 + 0.075, 0]));
    }
    const leaf = ellipsoid(0.09, 0.012, 0.03, std("#4fa13a"), [0.06, 0.4, 0]);
    leaf.rotation.z = 0.5;
    stalk.add(leaf);
    stalk.position.set((k - 1) * 0.1, 0, (k % 2) * 0.05);
    stalk.rotation.z = (k - 1) * 0.28;
    g.add(stalk);
  }
  return g;
}

function fly() {
  const g = new THREE.Group();
  g.add(ellipsoid(0.07, 0.045, 0.045, std("#2a2a2a", { roughness: 0.3, metalness: 0.4 })));
  g.add(mesh(new THREE.SphereGeometry(0.04, 12, 10), std("#16132b", { roughness: 0.3 }), [0.08, 0, 0]));
  for (const z of [-0.02, 0.02]) g.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), std("#e5484d"), [0.105, 0.01, z]));
  const wing = std("#cfe8ff", { transparent: true, opacity: 0.6, roughness: 0.1 });
  for (const z of [-1, 1]) {
    const w = ellipsoid(0.09, 0.006, 0.05, wing, [0, 0.05, z * 0.05]);
    w.name = "wing";
    w.rotation.x = z * 0.5;
    g.add(w);
  }
  return g;
}

function apple() {
  const g = new THREE.Group();
  g.add(ellipsoid(0.14, 0.13, 0.14, std("#e5484d", { roughness: 0.3 })));
  g.add(mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.07, 8), std("#6b4a2a"), [0, 0.14, 0]));
  const leaf = ellipsoid(0.055, 0.01, 0.025, std("#3d9a4a"), [0.05, 0.16, 0]);
  leaf.rotation.z = 0.5;
  g.add(leaf);
  g.add(ellipsoid(0.03, 0.04, 0.012, std("#ffffff", { transparent: true, opacity: 0.45, roughness: 0.1 }), [-0.07, 0.05, 0.115]));
  return g;
}

function battery() {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 18), std("#ffc933", { roughness: 0.35, metalness: 0.2 }));
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const cap = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 14), std("#cfd8e3", { metalness: 0.9, roughness: 0.25 }), [0.16, 0, 0]);
  cap.rotation.z = Math.PI / 2;
  g.add(cap);
  const band = mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.08, 18), std("#16132b", { roughness: 0.4 }), [-0.04, 0, 0]);
  band.rotation.z = Math.PI / 2;
  g.add(band);
  const bolt = mesh(new THREE.OctahedronGeometry(0.035), std("#3ddc97", { emissive: "#3ddc97", emissiveIntensity: 1.2 }), [0.03, 0.065, 0]);
  bolt.scale.set(0.5, 1, 0.3);
  g.add(bolt);
  return g;
}

const BUILD: Record<FoodKind, () => THREE.Group> = { fish, bone, carrot, mouse, meat, seeds, bamboo, fly, apple, battery };

// Misky se jídlem: kolik kousků a jak jsou rozmístěné, aby vypadala plná.
const PILE: Record<FoodKind, { count: number; spread: number; lift: number; hover?: boolean }> = {
  fish: { count: 3, spread: 0.2, lift: 0.18 },
  bone: { count: 2, spread: 0.16, lift: 0.2 },
  carrot: { count: 3, spread: 0.16, lift: 0.2 },
  mouse: { count: 2, spread: 0.2, lift: 0.14 },
  meat: { count: 1, spread: 0, lift: 0.2 },
  seeds: { count: 1, spread: 0, lift: 0.1 },
  bamboo: { count: 1, spread: 0, lift: 0.1 },
  fly: { count: 1, spread: 0, lift: 0.5, hover: true },
  apple: { count: 2, spread: 0.2, lift: 0.18 },
  battery: { count: 3, spread: 0.18, lift: 0.18 },
};

// Miska s jídlem; `food` je skupina, kterou animace zmenšuje, jak mazlíček jí.
export function makeFeedingProp(species: SpeciesId) {
  const kind = FAVORITE_FOOD[species];
  const root = new THREE.Group();
  root.add(makeBowl());
  // `food` animace zmenšuje a posouvá; `heap` uvnitř ho zvětší, aby bylo jídlo vidět i v malé misce.
  const food = new THREE.Group();
  const heap = new THREE.Group();
  heap.scale.setScalar(1.7);
  food.add(heap);
  const pile = PILE[kind];
  for (let i = 0; i < pile.count; i++) {
    const item = BUILD[kind]();
    const a = (i / Math.max(pile.count, 1)) * Math.PI * 2 + 0.6;
    item.position.set(Math.cos(a) * pile.spread, pile.lift + (i % 2) * 0.05, Math.sin(a) * pile.spread * 0.7);
    item.rotation.y = a * 1.3;
    item.rotation.z = pile.count > 1 ? (i - 1) * 0.25 : 0;
    heap.add(item);
  }
  root.add(food);
  const wings: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (o.name === "wing") wings.push(o);
  });
  return { root, food, kind, hover: !!pile.hover, wings };
}

export function makeBall() {
  const g = new THREE.Group();
  const ball = mesh(new THREE.SphereGeometry(0.2, 24, 18), std("#ff5a3c", { roughness: 0.3 }));
  g.add(ball);
  const stripe = mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 28), std("#ffffff", { roughness: 0.3 }));
  g.add(stripe);
  const stripe2 = stripe.clone();
  stripe2.rotation.y = Math.PI / 2;
  g.add(stripe2);
  g.userData.spin = ball;
  return g;
}

export function makeHeart(color = "#ff5a7a") {
  const s = new THREE.Shape();
  s.moveTo(0, -0.12);
  s.bezierCurveTo(-0.2, 0.02, -0.14, 0.18, 0, 0.08);
  s.bezierCurveTo(0.14, 0.18, 0.2, 0.02, 0, -0.12);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  geo.center();
  return mesh(geo, std(color, { roughness: 0.3, transparent: true }));
}

export function makeStar() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.11 : 0.05;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.03, bevelEnabled: false });
  geo.center();
  return mesh(geo, std("#ffd24d", { roughness: 0.25, metalness: 0.4, emissive: "#ffb300", emissiveIntensity: 0.5, transparent: true }));
}

// Nastaví průhlednost celé skupiny (materiály se při vytvoření označily transparent jen tam, kde je třeba).
export function setOpacity(root: THREE.Object3D, opacity: number) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    for (const mat of [m.material].flat()) {
      const base = (mat.userData.baseOpacity ??= mat.opacity) as number;
      mat.transparent = true;
      mat.opacity = base * opacity;
    }
  });
}
