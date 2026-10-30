import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { sfx } from "@/lib/market-sfx";
import { canvasTex, clamp01, createStage, lerp, makeHero, overlayFx, smooth, softDot, std, type Figure } from "./kit";

// 3D let raketou z městečka na vesmírnou stanici (náhrada 2D přechodu runSpace). Všechno je postavené v kódu:
// rampa s věží, výtahem a lávkou, raketa, kouř a plamen, mraky, planeta, hvězdy a otáčející se stanice s dokem.
// Děj: hrdina (jeho 3D postava) dojde k věži, vyjede výtahem, přejde lávku a nastoupí poklopem; lávka odjede,
// odpočet, start, průlet mraky do vesmíru, přílet ke stanici, brána se otevře a raketa vletí do hangáru.

export type SpaceOpts = { look: number; onEnd: () => void };
export type Handle = { stop: () => void; skip: () => void };

// časová osa (s)
const T = {
  walk: 1.5,
  liftUp: 2.7,
  arm: 3.3,
  board: 3.6,
  hatchShut: 4.0,
  armAway: 4.0,
  countdown: [4.5, 5.1, 5.7],
  lift: 6.3,
  white: 8.2,
  space: 8.9,
  dock: 11.6,
  enter: 12.1,
  flash: 12.85,
  end: 13.4,
};
const PAD_TOP = 0.45;
const BASE_Y = PAD_TOP + 0.5; // spodek trysky leží na rampě
const DECK_Y = BASE_Y + 2.9; // podlaha lávky = spodek poklopu
const TOWER_X = -3.9;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ---------------------------------------------------------------------------------------------- modely
function rocketBodyTexture() {
  return canvasTex(1024, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 1024, 0);
    gr.addColorStop(0, "#e9eef7");
    gr.addColorStop(0.5, "#d3dbe9");
    gr.addColorStop(1, "#e9eef7");
    g.fillStyle = gr;
    g.fillRect(0, 0, 1024, 512);
    // panely a nýty
    g.strokeStyle = "rgba(60,80,120,0.28)";
    g.lineWidth = 2;
    for (let y = 64; y < 512; y += 96) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    for (let x = 0; x < 1024; x += 128) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 512);
      g.stroke();
    }
    g.fillStyle = "rgba(60,80,120,0.35)";
    for (let y = 64; y < 512; y += 96) for (let x = 8; x < 1024; x += 32) g.fillRect(x, y - 6, 3, 3);
    // modrý pruh a nápis podél trupu
    g.fillStyle = "#2f5bd3";
    g.fillRect(250, 0, 26, 512);
    g.save();
    g.translate(150, 256);
    g.rotate(Math.PI / 2);
    g.fillStyle = "#1f2b55";
    g.font = '900 64px "Baloo 2", "Nunito", system-ui, sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("UČÍME SE HROU", 0, 0);
    g.restore();
    // hvězda (znak mise)
    g.save();
    g.translate(420, 300);
    g.fillStyle = "#ffcc33";
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 22 : 52;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    g.restore();
    // špína u spodku
    const soot = g.createLinearGradient(0, 512, 0, 380);
    soot.addColorStop(0, "rgba(40,40,50,0.35)");
    soot.addColorStop(1, "rgba(40,40,50,0)");
    g.fillStyle = soot;
    g.fillRect(0, 380, 1024, 132);
  });
}

type RocketModel = { group: THREE.Group; flame: THREE.Group; flameMats: THREE.MeshBasicMaterial[]; light: THREE.PointLight; hatch: THREE.Object3D };

function makeRocket(): RocketModel {
  const group = new THREE.Group();
  const silver = std("#ffffff", 0.35, 0.25, { map: rocketBodyTexture() });
  const red = std("#e0413a", 0.45, 0.1);
  const nose = std("#ff9e7a", 0.4, 0.05);
  const dark = std("#3b3f4c", 0.35, 0.8);
  const metal = std("#c9d1de", 0.25, 0.9);
  // spodní lem trupu
  const skirt = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.001, 0.2), new THREE.Vector2(0.86, 0.2), new THREE.Vector2(1.06, 0.55), new THREE.Vector2(1.1, 0.9)], 48), red);
  // trup (válec, aby textura seděla)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4.6, 64, 1, true), silver);
  body.position.y = 0.9 + 2.3;
  // ramena a nos
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    const y = 5.5 + k * 2.9;
    const r = 1.1 * Math.pow(1 - k, 0.62) * (1 - 0.06 * Math.sin(k * Math.PI));
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const noseM = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), nose);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), metal);
  tip.position.y = 8.42;
  // červené pruhy
  const bands = [2.0, 5.3].map((y) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.125, 1.125, 0.24, 64, 1, true), red);
    b.position.y = y;
    return b;
  });
  // okénka (kovový rámeček a modré sklo)
  const glass = new THREE.MeshPhysicalMaterial({ color: "#5fb8ff", roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: "#0d3a78", emissiveIntensity: 0.6 });
  const windows: THREE.Object3D[] = [];
  for (const [a, y, s] of [[0, 3.9, 1], [Math.PI / 2, 3.2, 0.8], [Math.PI, 3.9, 1], [0.4, 2.6, 0.55]] as const) {
    const w = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34 * s, 0.07 * s, 12, 40), metal);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.33 * s, 32), glass);
    gl.position.z = -0.01;
    w.add(rim, gl);
    w.position.set(Math.sin(a) * 1.11, y, Math.cos(a) * 1.11);
    w.rotation.y = a;
    windows.push(w);
  }
  // poklop na boku k věži (−x), otáčí se na pantu
  const hatchHinge = new THREE.Group();
  hatchHinge.position.set(-1.115, 3.45, 0.45);
  const hatch = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.2, 0.08, 3, 0.03), std("#d7deea", 0.4, 0.3));
  hatch.position.set(0, 0, -0.45);
  hatch.rotation.y = Math.PI / 2;
  hatchHinge.add(hatch);
  const hatchHole = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.16), new THREE.MeshBasicMaterial({ color: "#1a1d2b" }));
  hatchHole.position.set(-1.105, 3.45, 0);
  hatchHole.rotation.y = -Math.PI / 2;
  // ploutve
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 2.7);
  finShape.lineTo(0, 0.35);
  finShape.lineTo(1.3, -0.5);
  finShape.quadraticCurveTo(1.5, -0.45, 1.45, -0.1);
  finShape.lineTo(0.55, 1.6);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 3 });
  finGeo.translate(0, 0, -0.07);
  const fins = [0, 1, 2, 3].map((i) => {
    const holder = new THREE.Group();
    const f = new THREE.Mesh(finGeo, red);
    f.position.x = 0.92;
    holder.add(f);
    holder.rotation.y = Math.PI / 4 + (i * Math.PI) / 2;
    return holder;
  });
  // tryska
  const bell = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0.4, 0.22), new THREE.Vector2(0.38, 0.05), new THREE.Vector2(0.5, -0.25), new THREE.Vector2(0.66, -0.5)], 48),
    new THREE.MeshStandardMaterial({ color: "#3b3f4c", roughness: 0.35, metalness: 0.8, side: THREE.DoubleSide }),
  );
  // malé trysky pro manévrování
  const rcs = [0, 1, 2, 3].map((i) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.3, 0.16, 2, 0.04), dark);
    const a = (i * Math.PI) / 2;
    b.position.set(Math.sin(a) * 1.13, 5.0, Math.cos(a) * 1.13);
    b.rotation.y = a;
    return b;
  });
  group.add(skirt, body, noseM, tip, ...bands, ...windows, hatchHinge, hatchHole, ...fins, bell, ...rcs);
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  hatchHole.castShadow = false;

  // plamen: tři vnořené kužely, jasné jádro
  const flame = new THREE.Group();
  flame.position.y = -0.5;
  const flameMats: THREE.MeshBasicMaterial[] = [];
  for (const [r, h, col, op] of [[0.62, 3.2, "#ff5a1f", 0.55], [0.46, 2.4, "#ffa630", 0.8], [0.26, 1.5, "#fff3c0", 0.95]] as const) {
    const geo = new THREE.ConeGeometry(r, h, 32, 1, true);
    geo.rotateX(Math.PI);
    geo.translate(0, -h / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    mat.userData.base = op;
    flameMats.push(mat);
    flame.add(new THREE.Mesh(geo, mat));
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot("rgba(255,190,100,1)", "rgba(255,120,40,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(3.4, 3.4, 1);
  glow.position.y = -0.6;
  flame.add(glow);
  flame.visible = false;
  group.add(flame);
  const light = new THREE.PointLight("#ff9a40", 0, 40, 1.6);
  light.position.y = -1;
  group.add(light);
  return { group, flame, flameMats, light, hatch: hatchHinge };
}

function makeLaunchSite() {
  const site = new THREE.Group();
  // tráva a cesta
  const grassTex = canvasTex(512, 512, (g) => {
    g.fillStyle = "#6fc45a";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,60,0,0.07)";
      g.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
  }, [18, 18]);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 64), std("#ffffff", 0.95, 0, { map: grassTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  site.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), std("#d8c7a8", 0.9));
  path.rotation.x = -Math.PI / 2;
  path.position.set(-10, 0.01, 0);
  path.receiveShadow = true;
  site.add(path);
  // rampa: tmavý kruh se světly a dvěma sloupky
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, PAD_TOP, 64), std("#4a4f63", 0.7, 0.2));
  pad.position.y = PAD_TOP / 2;
  pad.receiveShadow = true;
  pad.castShadow = true;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.04, 64), std("#2b2f3d", 0.8, 0.1));
  inner.position.y = PAD_TOP + 0.01;
  inner.receiveShadow = true;
  site.add(pad, inner);
  const lampMat = new THREE.MeshStandardMaterial({ color: "#ffb3d9", emissive: "#ff6fb6", emissiveIntensity: 2.2 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lampMat);
    l.position.set(Math.cos(a) * 2.95, PAD_TOP + 0.05, Math.sin(a) * 2.95);
    site.add(l);
  }
  for (const z of [-1.9, 1.9]) {
    const post = new THREE.Mesh(new RoundedBoxGeometry(0.35, 1.6, 0.35, 2, 0.05), std("#e0413a", 0.5));
    post.position.set(1.6, PAD_TOP + 0.8, z);
    post.castShadow = true;
    site.add(post);
  }
  // věž: příhradová konstrukce
  const steel = std("#e0533a", 0.5, 0.35);
  const tower = new THREE.Group();
  tower.position.set(TOWER_X, 0, 0);
  const H = 8.4;
  const s = 0.65;
  for (const [x, z] of [[-s, -s], [s, -s], [-s, s], [s, s]]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, H, 0.14), steel);
    col.position.set(x, H / 2, z);
    tower.add(col);
  }
  for (let y = 0.9; y < H; y += 0.9) {
    for (const [x, z, w, d] of [[0, -s, 2 * s, 0.08], [0, s, 2 * s, 0.08], [-s, 0, 0.08, 2 * s], [s, 0, 0.08, 2 * s]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.08, d + 0.08), steel);
      b.position.set(x, y, z);
      tower.add(b);
    }
    // úhlopříčky na přední a zadní stěně
    for (const z of [-s, s]) {
      const L = Math.hypot(2 * s, 0.9);
      const dgl = new THREE.Mesh(new THREE.BoxGeometry(L, 0.06, 0.06), steel);
      dgl.position.set(0, y - 0.45, z);
      dgl.rotation.z = (Math.floor(y / 0.9) % 2 ? 1 : -1) * Math.atan2(0.9, 2 * s);
      tower.add(dgl);
    }
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.6), steel);
  roof.position.y = H + 0.09;
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshStandardMaterial({ color: "#ff3b3b", emissive: "#ff2020", emissiveIntensity: 3 }));
  beacon.position.y = H + 0.3;
  tower.add(roof, beacon);
  tower.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  // výtah
  const lift = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.12, 1.1, 2, 0.03), std("#ffcc33", 0.5, 0.2));
  lift.position.set(TOWER_X, 0.06, 0);
  lift.castShadow = true;
  lift.receiveShadow = true;
  // lávka s zábradlím (pant u věže)
  const arm = new THREE.Group();
  arm.position.set(TOWER_X + s, DECK_Y, 0);
  const deckLen = -1.12 - (TOWER_X + s) + 0.05;
  const deck = new THREE.Mesh(new RoundedBoxGeometry(deckLen, 0.12, 1.0, 2, 0.03), std("#9aa3b5", 0.5, 0.6));
  deck.position.set(deckLen / 2, -0.06, 0);
  deck.castShadow = true;
  deck.receiveShadow = true;
  arm.add(deck);
  for (const z of [-0.48, 0.48]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(deckLen, 0.05, 0.05), steel);
    rail.position.set(deckLen / 2, 0.7, z);
    arm.add(rail);
    for (let x = 0.1; x < deckLen; x += 0.5) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), steel);
      p.position.set(x, 0.35, z);
      arm.add(p);
    }
  }
  site.add(tower, lift, arm);
  // městečko v dálce: domky, stromy
  const houseCols = ["#f08a7a", "#8fb0ff", "#c59bff", "#ffd27a", "#9fe0b0"];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI * 0.15 - (i / 16) * Math.PI * 1.1;
    const r = 26 + (i % 3) * 6;
    const hgrp = new THREE.Group();
    const w = 2.2 + (i % 2);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, 2), std("#f3ead8", 0.8));
    walls.position.y = 0.9;
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(w * 0.85, 1.3, 4), std(houseCols[i % houseCols.length], 0.7));
    roofM.position.y = 2.45;
    roofM.rotation.y = Math.PI / 4;
    hgrp.add(walls, roofM);
    hgrp.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    hgrp.rotation.y = -a;
    site.add(hgrp);
  }
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 14 + Math.random() * 40;
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), std("#7a5233", 0.9));
    trunk.position.y = 0.4;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + Math.random() * 0.6, 1), std(Math.random() < 0.5 ? "#3f9a4c" : "#52b05a", 0.8));
    crown.position.y = 1.5;
    t.add(trunk, crown);
    t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (Math.hypot(t.position.x + 10, t.position.z) < 3) continue;
    site.add(t);
  }
  return { site, lift, arm };
}

function makeClouds() {
  const g = new THREE.Group();
  const mat = std("#ffffff", 1, 0, { emissive: "#dfe8ff", emissiveIntensity: 0.25 });
  for (let i = 0; i < 26; i++) {
    const c = new THREE.Group();
    const n = 4 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + Math.random() * 2.2, 2), mat);
      s.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 4);
      c.add(s);
    }
    const a = Math.random() * Math.PI * 2;
    const r = 4 + Math.random() * 26;
    c.position.set(Math.cos(a) * r, 28 + Math.random() * 18, Math.sin(a) * r);
    g.add(c);
  }
  return g;
}

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { top: { value: new THREE.Color("#3f9cff") }, bottom: { value: new THREE.Color("#cfeaff") } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader:
      "uniform vec3 top; uniform vec3 bottom; varying vec3 vDir; void main(){ float h = clamp(vDir.y * 1.6 + 0.2, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0);\n#include <colorspace_fragment>\n}",
    side: THREE.BackSide,
    depthWrite: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat);
  dome.renderOrder = -1;
  return { dome, mat };
}

function makeStars(count = 2600, radius = 700) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * r * radius, u * radius, Math.sin(a) * r * radius], i * 3);
    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.5, 0.75 + Math.random() * 0.25);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, depthWrite: false }));
}

function planetTexture() {
  return canvasTex(1024, 512, (g) => {
    g.fillStyle = "#2a6fd6";
    g.fillRect(0, 0, 1024, 512);
    // pevniny z několika vln
    const img = g.getImageData(0, 0, 1024, 512);
    const d = img.data;
    const f = (x: number, y: number) => Math.sin(x * 0.012 + Math.sin(y * 0.02) * 2) + Math.sin(y * 0.017 + x * 0.006) + 0.6 * Math.sin((x + y) * 0.031) + 0.4 * Math.sin(x * 0.05 - y * 0.04);
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 1024; x++) {
        const v = f(x, y);
        const i = (y * 1024 + x) * 4;
        const lat = Math.abs(y - 256) / 256;
        if (lat > 0.86) {
          d[i] = d[i + 1] = d[i + 2] = 245;
        } else if (v > 0.9) {
          const k = Math.min(1, (v - 0.9) * 1.4);
          d[i] = 70 + 110 * k * 0.5;
          d[i + 1] = 160 - 30 * k;
          d[i + 2] = 70 - 20 * k;
        }
      }
    g.putImageData(img, 0, 0);
    // oblaka
    g.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 160; i++) {
      g.beginPath();
      g.ellipse(Math.random() * 1024, Math.random() * 512, 20 + Math.random() * 60, 4 + Math.random() * 8, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
}

function makeStation() {
  const st = new THREE.Group();
  const white = std("#eef2f8", 0.45, 0.35);
  const grey = std("#9aa3b5", 0.4, 0.7);
  const gold = std("#d9a84a", 0.3, 0.9);
  const cyan = new THREE.MeshStandardMaterial({ color: "#7fe8ff", emissive: "#3fd8ff", emissiveIntensity: 2.4 });
  // střed (osa z)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 10, 48), white);
  hub.rotation.x = Math.PI / 2;
  st.add(hub);
  for (const z of [-3, 0.5, 3.5]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.12, 10, 48), grey);
    ring.position.z = z;
    st.add(ring);
  }
  const back = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), white);
  back.rotation.x = -Math.PI / 2;
  back.position.z = -5;
  st.add(back);
  // laboratoř a anténa
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4, 32), gold);
  lab.position.set(0, 3.4, -1.5);
  st.add(lab);
  const dish = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.01, 0), new THREE.Vector2(0.6, 0.12), new THREE.Vector2(1.2, 0.45)], 32), new THREE.MeshStandardMaterial({ color: "#f4f6fb", roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }));
  dish.position.set(0, 5.6, -1.5);
  dish.rotation.x = -0.5;
  st.add(dish);
  // obytný prstenec se špicemi a okny
  const ringGroup = new THREE.Group();
  ringGroup.position.z = -1.2;
  const winTex = canvasTex(1024, 64, (g) => {
    g.fillStyle = "#cfd6e4";
    g.fillRect(0, 0, 1024, 64);
    g.fillStyle = "#28324a";
    g.fillRect(0, 26, 1024, 12);
    for (let x = 6; x < 1024; x += 24) {
      g.fillStyle = Math.random() < 0.75 ? "#ffe9a0" : "#4a5878";
      g.fillRect(x, 28, 12, 8);
    }
  });
  const torus = new THREE.Mesh(new THREE.TorusGeometry(9, 0.95, 20, 96), new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.45, metalness: 0.3, emissive: "#ffd36b", emissiveMap: winTex, emissiveIntensity: 0.35 }));
  ringGroup.add(torus);
  for (let i = 0; i < 4; i++) {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 6.6, 12), grey);
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    sp.position.set(Math.cos(a) * 5.7, Math.sin(a) * 5.7, 0);
    sp.rotation.z = a - Math.PI / 2;
    ringGroup.add(sp);
  }
  st.add(ringGroup);
  // solární křídla
  const solarTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#1b3d9c";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "#7aa6ff";
    g.lineWidth = 3;
    for (let i = 0; i <= 256; i += 32) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 256);
      g.moveTo(0, i);
      g.lineTo(256, i);
      g.stroke();
    }
    const gl = g.createLinearGradient(0, 0, 256, 256);
    gl.addColorStop(0, "rgba(255,255,255,0.25)");
    gl.addColorStop(0.5, "rgba(255,255,255,0)");
    g.fillStyle = gl;
    g.fillRect(0, 0, 256, 256);
  });
  const solarMat = std("#ffffff", 0.3, 0.6, { map: solarTex });
  const wings = new THREE.Group();
  wings.position.z = -4;
  const truss = new THREE.Mesh(new THREE.BoxGeometry(44, 0.22, 0.22), grey);
  wings.add(truss);
  for (const sx of [-1, 1])
    for (let k = 0; k < 3; k++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 2.8), solarMat);
      p.position.set(sx * (12 + k * 3.8), 0, 0);
      wings.add(p);
    }
  st.add(wings);
  // dokovací brána vpředu (+z): rám, svítící kruh, dvoudílná vrata a světlý hangár uvnitř
  const port = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 1.4, 48, 1, true), grey);
  port.rotation.x = Math.PI / 2;
  port.position.z = 5.7;
  st.add(port);
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.12, 12, 64), cyan);
  glowRing.position.z = 6.42;
  st.add(glowRing);
  const hangar = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 6, 48, 1, true), new THREE.MeshBasicMaterial({ color: "#cfefff", side: THREE.BackSide }));
  hangar.rotation.x = Math.PI / 2;
  hangar.position.z = 3.3;
  st.add(hangar);
  // dvoukřídlá vrata na pantech u okraje brány, otevírají se ven (k raketě)
  const doorMat = std("#d9dfeb", 0.4, 0.5);
  const doors = [-1, 1].map((sx) => {
    const hinge = new THREE.Group();
    hinge.position.set(sx * 1.8, 0, 6.33);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.12, 48, 1, false, sx < 0 ? Math.PI : 0, Math.PI), doorMat);
    d.rotation.x = Math.PI / 2;
    d.position.x = -sx * 1.8;
    hinge.add(d);
    st.add(hinge);
    return hinge;
  });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.5, 0.18), new THREE.MeshStandardMaterial({ color: "#ffcc33", emissive: "#ff9900", emissiveIntensity: 1.2 }));
  stripe.position.z = 6.34;
  st.add(stripe);
  // blikající světla
  const blinks: THREE.Mesh[] = [];
  for (const [x, y, z, c] of [[-22, 0, -4, "#ff3b3b"], [22, 0, -4, "#3bff6a"], [0, 10, -1.2, "#ffffff"], [0, -10, -1.2, "#ffffff"]] as const) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 3 }));
    m.position.set(x, y, z);
    st.add(m);
    blinks.push(m);
  }
  const portLight = new THREE.PointLight("#9fe8ff", 0, 30, 1.5);
  portLight.position.z = 7.5;
  st.add(portLight);
  return { st, ringGroup, doors, stripe, blinks, portLight, glowRing };
}

// ---------------------------------------------------------------------------------------------- scéna
export function runSpace3D(container: HTMLElement, opts: SpaceOpts): Handle {
  let stopped = false;
  let ended = false;
  let raf = 0;
  const stage = createStage(container);
  if (!stage) {
    // bez WebGL rovnou dál
    window.setTimeout(opts.onEnd, 0);
    return { stop: () => {}, skip: () => {} };
  }
  const { renderer } = stage;
  const fx = overlayFx(stage);
  const finish = () => {
    if (ended) return;
    ended = true;
    fx.flash(1);
    opts.onEnd();
  };

  // --- start z rampy
  const launch = new THREE.Scene();
  launch.environment = stage.env;
  launch.environmentIntensity = 0.5;
  const sky = makeSky();
  launch.add(sky.dome);
  launch.fog = new THREE.Fog("#cfeaff", 40, 220);
  const hemi = new THREE.HemisphereLight("#cfe6ff", "#5aa64a", 1.1);
  const sun = new THREE.DirectionalLight("#fff1d6", 2.6);
  sun.position.set(10, 18, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 4;
  launch.add(hemi, sun, sun.target);
  const { site, lift, arm } = makeLaunchSite();
  launch.add(site);
  const clouds = makeClouds();
  launch.add(clouds);
  const rocket = makeRocket();
  rocket.group.position.y = BASE_Y;
  launch.add(rocket.group);

  // kouř (sdílená textura, každá částice vlastní průhlednost)
  const smokeTex = softDot("rgba(255,255,255,0.95)", "rgba(255,255,255,0)");
  type Puff = { s: THREE.Sprite; v: THREE.Vector3; age: number; life: number; r0: number; r1: number; a: number };
  const puffs: Puff[] = [];
  const pool: THREE.Sprite[] = [];
  for (let i = 0; i < 320; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, color: "#e9e9ee" }));
    s.visible = false;
    launch.add(s);
    pool.push(s);
  }
  const puff = (p: THREE.Vector3, v: THREE.Vector3, life: number, r0: number, r1: number, a = 0.8, color = "#e9e9ee") => {
    const s = pool.pop();
    if (!s) return;
    s.visible = true;
    s.position.copy(p);
    (s.material as THREE.SpriteMaterial).color.set(color);
    puffs.push({ s, v, age: 0, life, r0, r1, a });
  };

  // --- vesmír
  const space = new THREE.Scene();
  space.environment = stage.env;
  space.environmentIntensity = 0.35;
  space.background = new THREE.Color("#02030c");
  space.add(makeStars());
  const sunS = new THREE.DirectionalLight("#fff3e0", 3.2);
  sunS.position.set(-30, 20, 25);
  space.add(sunS, new THREE.AmbientLight("#4a5a9a", 0.5));
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot("rgba(255,240,200,1)", "rgba(255,200,120,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sunGlow.position.set(-300, 200, 250);
  sunGlow.scale.set(160, 160, 1);
  space.add(sunGlow);
  const planet = new THREE.Mesh(new THREE.SphereGeometry(70, 64, 32), std("#ffffff", 0.8, 0, { map: planetTexture() }));
  planet.position.set(-50, -95, -60);
  space.add(planet);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(74, 64, 32),
    new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
      fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(0.4, 0.75, 1.0, f); }",
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  atmo.position.copy(planet.position);
  space.add(atmo);
  const ringed = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: canvasTex(256, 256, (g) => {
        g.translate(128, 128);
        g.rotate(-0.35);
        g.strokeStyle = "rgba(255,214,150,0.7)";
        g.lineWidth = 9;
        g.beginPath();
        g.ellipse(0, 0, 118, 30, 0, Math.PI, Math.PI * 2);
        g.stroke();
        const pg = g.createRadialGradient(-20, -20, 6, 0, 0, 64);
        pg.addColorStop(0, "#ffd18a");
        pg.addColorStop(0.6, "#e8803c");
        pg.addColorStop(1, "#6a2a14");
        g.fillStyle = pg;
        g.beginPath();
        g.arc(0, 0, 64, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.ellipse(0, 0, 118, 30, 0, 0, Math.PI);
        g.stroke();
      }),
      transparent: true,
      depthWrite: false,
    }),
  );
  ringed.position.set(160, 70, -380);
  ringed.scale.set(90, 90, 1);
  space.add(ringed);
  const station = makeStation();
  space.add(station.st);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // na úzké obrazovce širší záběr, ať je vidět celá raketa
    camera.fov = w / h < 1 ? 62 : 45;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let hero: Figure | null = null;
  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let t0 = 0;
  let last = 0;
  let fired = 0;
  let inSpace = false;

  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    // testy si mohou scénu přetočit na daný čas (window.__seek3d), jinak běží podle hodin
    const seek = (window as { __seek3d?: number }).__seek3d;
    const t = seek ?? (now - t0) / 1000;
    const dt = seek !== undefined ? 1 / 30 : Math.min(0.05, (now - last) / 1000);
    last = now;

    // ---- zvuky a odpočet
    const cues: [number, () => void][] = [
      [T.armAway, () => sfx.standUp(0.8)],
      [T.countdown[0], () => sfx.beep()],
      [T.countdown[1], () => sfx.beep()],
      [T.countdown[2], () => sfx.beep()],
      [T.lift, () => {
        sfx.beep(true);
        sfx.liftoff(3.8);
      }],
      [T.white - 0.2, () => sfx.whoosh(1.6)],
      [T.enter, () => sfx.dock()],
    ];
    while (fired < cues.length && t >= cues[fired][0]) cues[fired++][1]();
    const cd = T.countdown.findIndex((c, i) => t >= c && t < (T.countdown[i + 1] ?? T.lift));
    fx.count(cd >= 0 ? String(3 - cd) : t >= T.lift && t < T.lift + 0.9 ? "🚀" : "");
    fx.bars(t < T.end - 0.3);

    if (!inSpace && t >= T.space) {
      inSpace = true;
      space.add(rocket.group);
      rocket.group.scale.setScalar(1);
    }

    if (!inSpace) {
      // ---- hrdina: k věži, výtahem nahoru, přes lávku do poklopu
      const liftK = smooth(t, T.walk, T.liftUp);
      lift.position.y = 0.06 + liftK * (DECK_Y - 0.06 - 0.06);
      if (hero) {
        const hr = hero.root;
        let walking = 0;
        if (t < T.walk) {
          const k = t / T.walk;
          hr.position.set(lerp(-11, TOWER_X, k), 0, lerp(0.4, 0, k));
          walking = 1;
        } else if (t < T.liftUp) {
          hr.position.set(TOWER_X, lift.position.y + 0.06, 0);
        } else if (t < T.arm) {
          const k = (t - T.liftUp) / (T.arm - T.liftUp);
          hr.position.set(lerp(TOWER_X, -1.6, k), DECK_Y, 0);
          walking = 1;
        } else if (t < T.board) {
          const k = (t - T.arm) / (T.board - T.arm);
          hr.position.set(lerp(-1.6, -0.9, k), DECK_Y, 0);
          hr.scale.setScalar(1 - 0.5 * k);
          walking = 1;
        }
        hr.visible = t < T.board;
        // postava hledí k +x; ve výtahu se otočí ke kameře
        hr.rotation.y = t > T.walk && t < T.liftUp ? lerp(0, -1.2, smooth(t, T.walk, T.walk + 0.4)) : 0;
        hero.pose(walking ? "chuze" : "stoji");
        hero.update(dt);
      }
      // poklop se otevře před hrdinou a zavře za ním
      const open = smooth(t, T.liftUp - 0.3, T.liftUp) * (1 - smooth(t, T.hatchShut - 0.3, T.hatchShut));
      rocket.hatch.rotation.y = -1.9 * open;
      // lávka odjede
      arm.rotation.y = 1.4 * smooth(t, T.armAway, T.armAway + 0.9);

      // ---- raketa a plamen
      const tau = Math.max(0, t - T.lift);
      const rise = 0.5 * 11 * tau * tau * smooth(tau, 0, 0.35) + 0.05 * tau;
      const shake = t > T.countdown[0] ? (t < T.lift ? 0.012 * smooth(t, T.countdown[0], T.lift) : 0.03 * (1 - smooth(tau, 1, 2.5))) : 0;
      rocket.group.position.set((Math.random() - 0.5) * shake, BASE_Y + rise + (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      const ign = smooth(t, T.countdown[2], T.lift);
      const thrust = t < T.lift ? 0.25 * ign : 0.6 + 0.4 * smooth(tau, 0, 1);
      rocket.flame.visible = thrust > 0.02;
      const flick = 0.9 + Math.random() * 0.2;
      rocket.flame.scale.set(0.8 + 0.3 * thrust, (0.35 + 1.2 * thrust) * flick, 0.8 + 0.3 * thrust);
      for (const m of rocket.flameMats) m.opacity = (m.userData.base as number) * Math.min(1, thrust * 2);
      rocket.light.intensity = 40 * thrust * flick;

      // ---- kouř: pára při odpočtu, mračna kouře při startu
      const base = rocket.group.position.clone();
      if (t > T.countdown[0] && t < T.lift && Math.random() < 0.5) {
        const sx = Math.random() < 0.5 ? -1 : 1;
        puff(new THREE.Vector3(base.x + sx * 1.0, PAD_TOP + 0.2, (Math.random() - 0.5) * 1.5), new THREE.Vector3(sx * (0.8 + Math.random()), 0.6 + Math.random() * 0.6, (Math.random() - 0.5) * 0.6), 2.4, 0.4, 1.8, 0.6, "#ffffff");
      }
      if (t >= T.lift - 0.1) {
        const nozzleY = base.y - 0.6;
        const n = rise < 6 ? 6 : 3;
        for (let i = 0; i < n; i++) {
          if (nozzleY - PAD_TOP < 4) {
            const a = Math.random() * Math.PI * 2;
            const sp = 5 + Math.random() * 7;
            puff(new THREE.Vector3(Math.cos(a) * 0.8, PAD_TOP + 0.3 + Math.random() * 0.4, Math.sin(a) * 0.8), new THREE.Vector3(Math.cos(a) * sp, 0.4 + Math.random(), Math.sin(a) * sp), 3.5 + Math.random() * 1.5, 0.8, 4.5, 0.85);
          } else {
            puff(new THREE.Vector3(base.x + (Math.random() - 0.5) * 0.5, nozzleY - 0.6 - Math.random() * 1.5, base.z + (Math.random() - 0.5) * 0.5), new THREE.Vector3((Math.random() - 0.5) * 1.2, -2 - Math.random() * 2, (Math.random() - 0.5) * 1.2), 2.6 + Math.random(), 0.7, 3.2, 0.7);
          }
        }
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += dt;
        const k = p.age / p.life;
        if (k >= 1) {
          p.s.visible = false;
          pool.push(p.s);
          puffs.splice(i, 1);
          continue;
        }
        p.v.multiplyScalar(1 - 1.6 * dt);
        p.v.y += 0.25 * dt;
        p.s.position.addScaledVector(p.v, dt);
        const r = lerp(p.r0, p.r1, 1 - Math.pow(1 - k, 2));
        p.s.scale.set(r, r, 1);
        (p.s.material as THREE.SpriteMaterial).opacity = p.a * Math.min(1, k * 6) * (1 - k);
      }

      // ---- obloha se stoupáním tmavne, v mracích bílá clona
      const alt = rocket.group.position.y;
      const dark = smooth(alt, 18, 50);
      sky.mat.uniforms.top.value.set("#3f9cff").lerp(new THREE.Color("#050a2a"), dark);
      sky.mat.uniforms.bottom.value.set("#cfeaff").lerp(new THREE.Color("#2a3f8a"), dark);
      const white = smooth(t, T.white, T.space);
      (launch.fog as THREE.Fog).color.set("#cfeaff").lerp(new THREE.Color("#ffffff"), white);
      (launch.fog as THREE.Fog).near = lerp(40, 0.5, white);
      (launch.fog as THREE.Fog).far = lerp(220, 12, white);
      fx.flash(0.85 * smooth(t, T.space - 0.35, T.space));

      // ---- kamera
      if (t < 3.9) {
        // široký záběr: věž, výtah, lávka
        const k = ease(clamp01(t / 3.9));
        camera.position.set(lerp(-7.5, -6, k), lerp(2.6, 4.6, k), lerp(12.5, 10.5, k));
        look.set(lerp(-4, -2.2, k), lerp(1.4, DECK_Y + 0.4, liftK), 0);
      } else if (t < 5.1) {
        // celá raketa, lávka odjíždí
        const k = ease(clamp01((t - 3.9) / 1.2));
        camera.position.set(lerp(8, 7, k), lerp(3.2, 2.8, k), lerp(14, 12.5, k));
        look.set(0, 4.2, 0);
      } else if (t < T.lift) {
        // detail trysky a páry
        const k = ease(clamp01((t - 5.1) / (T.lift - 5.1)));
        camera.position.set(lerp(4.6, 4.0, k), lerp(1.3, 1.0, k), lerp(6.6, 6.0, k));
        look.set(0, 1.6, 0);
      } else {
        // start: nejdřív zespodu, pak kamera stoupá s raketou
        const follow = smooth(alt, 6, 16);
        camera.position.set(lerp(9, 6, follow), Math.max(1.6, alt - 6) * follow + 1.6 * (1 - follow), lerp(14, 11, follow));
        look.set(0, alt + 3, 0);
      }
      const sh = t > T.countdown[2] && t < T.lift + 2.2 ? 0.05 * smooth(t, T.countdown[2], T.lift + 0.3) * (1 - smooth(t, T.lift + 1, T.lift + 2.2)) : 0;
      camera.position.x += (Math.random() - 0.5) * sh;
      camera.position.y += (Math.random() - 0.5) * sh;
      camera.lookAt(look);
      sky.dome.position.copy(camera.position);
      renderer.render(launch, camera);
    } else {
      // ---- vesmír: přílet ke stanici a dokování
      fx.flash(0.85 * (1 - smooth(t, T.space, T.space + 0.5)) + smooth(t, T.flash, T.flash + 0.4));
      station.ringGroup.rotation.z += dt * 0.12;
      station.st.rotation.z = Math.sin(t * 0.1) * 0.05;
      station.blinks.forEach((b, i) => (b.visible = Math.floor(t * 2 + i * 0.5) % 2 === 0));
      const r = rocket.group;
      const k = ease(clamp01((t - T.space) / (T.dock - T.space)));
      const kd = smooth(t, T.enter, T.end - 0.15);
      const pos = new THREE.Vector3(lerp(7, 0, k), lerp(-4, 0, k), lerp(85, 16, 1 - Math.pow(1 - clamp01((t - T.space) / (T.dock - T.space)), 2.2)));
      pos.z = lerp(pos.z, -1, kd * kd);
      r.position.copy(pos);
      r.rotation.set(-Math.PI / 2 + (1 - k) * 0.12, 0, 0);
      r.rotateY(t * 0.5 * (1 - smooth(t, T.dock - 0.6, T.dock)));
      r.rotateZ((1 - k) * -0.12);
      const cruise = t < T.dock - 0.3 ? 0.35 : 0;
      rocket.flame.visible = cruise > 0;
      rocket.flame.scale.set(0.7, 0.6 + Math.random() * 0.15, 0.7);
      for (const m of rocket.flameMats) m.opacity = m.userData.base as number;
      rocket.light.intensity = cruise ? 8 : 0;
      // vrata se rozjedou
      const open = smooth(t, T.dock, T.enter + 0.1);
      station.doors.forEach((d, i) => (d.rotation.y = (i ? -1 : 1) * open * 1.75));
      station.stripe.visible = open < 0.05;
      station.portLight.intensity = 40 * open;
      (station.glowRing.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.4 + 2 * open * (0.7 + 0.3 * Math.sin(t * 12));
      // kamera: za raketou, pak z boku na bránu, nakonec za raketou do hangáru
      if (t < T.dock) {
        camera.position.copy(pos).add(tmp.set(2.8, 1.9, 9.5));
        look.copy(pos).add(tmp.set(0, 0.2, -9));
      } else {
        const a = smooth(t, T.dock, T.enter);
        const b = smooth(t, T.enter, T.end);
        camera.position.set(lerp(lerp(2.8, -7.5, a), -2.2, b), lerp(lerp(1.9, 3.2, a), 0.8, b), lerp(lerp(25.5, 21, a), 9.5, b));
        look.set(0, 0, lerp(8, 3, b));
      }
      camera.lookAt(look);
      renderer.render(space, camera);
    }
    if (t >= T.end && seek === undefined) {
      cancelAnimationFrame(raf);
      finish();
    }
  };

  // start až po načtení hrdiny (nejvýš 2,5 s, jinak bez něj)
  const heroP = makeHero(opts.look)
    .then((fig) => {
      hero = fig;
      fig.root.position.set(-11, 0, 0.4);
      launch.add(fig.root);
    })
    .catch(() => {});
  void Promise.race([heroP, new Promise((r) => window.setTimeout(r, 2500))]).then(() => {
    if (stopped) return;
    renderer.compile(launch, camera);
    t0 = last = performance.now();
    raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => (stage.el.style.opacity = "1"));
  });

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.dispose([launch, space]);
    },
    skip: finish,
  };
}
