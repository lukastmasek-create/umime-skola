import * as THREE from "three";
import { sfx } from "@/lib/market-sfx";
import { canvasTex, clamp01, createStage, lerp, makeHero, makeLoop, makeModel, overlayFx, smooth, softDot, std, type Figure } from "./kit";

// 3D vyplutí pirátské lodi z přístavu (náhrada 2D přechodu runPirate). Galéra, molo a lávka jsou modely
// z Blenderu (pristav_lod.py, pristav_nastup.py → export_glb.py), kapitán a papoušek z mesto_figury.py;
// moře s vlnami, kotva s řetězem, rumpál, kormidlo, ostrovy, přístav s domky a racci jsou postavené tady.
// Děj: hrdina dojde po molu a lávce na palubu, kapitán u kormidla, lávka se stáhne, rumpál vytáhne kotvu,
// plachty se nadmou a loď vypluje k ostrovům.

export type PirateOpts = { look: number; onEnd: () => void };
export type Handle = { stop: () => void; skip: () => void };

const T = { molo: 2.2, plank: 3.6, deck: 4.4, plankAway: 4.6, anchor: [4.8, 6.0], wind: [5.9, 6.8], sail: 6.8, fade: 11.0, end: 11.6 };
const DECK = 0.81; // výška paluby (Blender z 0,805)
const FIG = 0.58; // postavy z městečka jsou v jiném měřítku než loď
const MOLO = 0.92;
// cesta hrdiny (souřadnice three.js: x podél lodi k přídi, y nahoru, z k divákovi)
const PATH: [number, number, number][] = [
  [-6.4, MOLO, 0.9],
  [-3.6, MOLO + 0.02, 1.05],
  [-1.35, 1.0, 0.6],
  [-0.9, DECK, 0.35],
  [-0.4, DECK, 0.2],
];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// vlny (stejný vzorec v shaderu i pro houpání lodi)
const wave = (x: number, z: number, t: number) => 0.09 * Math.sin(x * 0.6 + t * 1.1) + 0.06 * Math.sin(z * 0.9 + t * 1.4 + x * 0.3) + 0.035 * Math.sin((x + z) * 1.7 + t * 2.1);

function makeSea() {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      deep: { value: new THREE.Color("#0b5fa8") },
      shallow: { value: new THREE.Color("#3fb4e8") },
      sky: { value: new THREE.Color("#bfe6ff") },
      sunDir: { value: new THREE.Vector3(0.4, 0.7, 0.5).normalize() },
      fogColor: { value: new THREE.Color("#cfeaff") },
      fogNear: { value: 60 },
      fogFar: { value: 260 },
    },
    vertexShader: `
      uniform float uTime; varying float vH; varying vec3 vW; varying vec3 vN;
      float wave(vec2 p){ return 0.09*sin(p.x*0.6+uTime*1.1)+0.06*sin(p.y*0.9+uTime*1.4+p.x*0.3)+0.035*sin((p.x+p.y)*1.7+uTime*2.1); }
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        float h = wave(w.xz);
        float e = 0.08;
        float hx = wave(w.xz + vec2(e, 0.0)) - h;
        float hz = wave(w.xz + vec2(0.0, e)) - h;
        vN = normalize(vec3(-hx / e, 1.0, -hz / e));
        w.y += h; vH = h; vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform vec3 deep; uniform vec3 shallow; uniform vec3 sky; uniform vec3 sunDir; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; uniform float uTime;
      varying float vH; varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(V, vN), 0.0), 3.0);
        vec3 col = mix(deep, shallow, clamp(vH * 3.5 + 0.45, 0.0, 1.0));
        col = mix(col, sky, fres * 0.55);
        vec3 H = normalize(sunDir + V);
        col += vec3(1.0, 0.95, 0.85) * pow(max(dot(vN, H), 0.0), 140.0) * 1.4;
        float foam = smoothstep(0.13, 0.19, vH + 0.02 * sin(vW.x * 7.0 + uTime * 3.0) * sin(vW.z * 6.0));
        col = mix(col, vec3(1.0), foam * 0.55);
        col = mix(col, fogColor, smoothstep(fogNear, fogFar, length(cameraPosition - vW)));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const geo = new THREE.PlaneGeometry(520, 520, 260, 260);
  geo.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(geo, mat);
  sea.receiveShadow = false;
  return { sea, mat };
}

function makeSky() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { top: { value: new THREE.Color("#3f9cff") }, bottom: { value: new THREE.Color("#d6efff") } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 vDir; void main(){ float h = clamp(vDir.y * 2.2 + 0.05, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, h), 1.0);\n#include <colorspace_fragment>\n}",
    side: THREE.BackSide,
    depthWrite: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), mat);
  dome.renderOrder = -1;
  return dome;
}

function makeIsland(r: number, palms: number) {
  const g = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.25, 0.6, 24), std("#f2d9a0", 0.9));
  sand.position.y = 0.1;
  const hill = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), std("#4fae5a", 0.85));
  hill.scale.y = 0.55;
  hill.position.y = 0.35;
  g.add(sand, hill);
  for (let i = 0; i < palms; i++) {
    const a = (i / palms) * Math.PI * 2 + Math.random();
    const p = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.6, 8), std("#9a6a3e", 0.9));
    trunk.position.y = 1.3;
    trunk.rotation.z = 0.15;
    p.add(trunk);
    for (let k = 0; k < 6; k++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.8, 4), std("#2f8f45", 0.8));
      leaf.position.set(0.25, 2.6, 0);
      leaf.rotation.set(0, (k / 6) * Math.PI * 2, 1.9);
      leaf.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (k / 6) * Math.PI * 2);
      p.add(leaf);
    }
    p.position.set(Math.cos(a) * r * 0.55, 0.3, Math.sin(a) * r * 0.55);
    g.add(p);
  }
  return g;
}

function makeHarbourTown() {
  const g = new THREE.Group();
  const shore = new THREE.Mesh(new THREE.BoxGeometry(80, 1.6, 30), std("#6cc472", 0.9));
  shore.position.set(-48, 0.2, -12);
  const quay = new THREE.Mesh(new THREE.BoxGeometry(80, 1.2, 1.2), std("#a79fb4", 0.8));
  quay.position.set(-48, 0.4, 2.4);
  g.add(shore, quay);
  const cols = ["#f08a7a", "#8fb0ff", "#c59bff", "#ffd27a", "#9fe0b0", "#ff9e7a"];
  for (let i = 0; i < 14; i++) {
    const h = new THREE.Group();
    const w = 2.2 + (i % 3) * 0.6;
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, 2 + (i % 2) * 0.8, 2.2), std("#f6e6c8", 0.8));
    walls.position.y = 1 + (i % 2) * 0.4;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.82, 1.4, 4), std(cols[i % cols.length], 0.7));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = walls.position.y * 2 + 0.7;
    h.add(walls, roof);
    h.position.set(-16 - i * 3.4, 1, -4 - (i % 3) * 4);
    g.add(h);
  }
  // maják
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.0, 7, 16), std("#ffffff", 0.6));
  tower.position.set(-12, 4.5, -6);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.9, 1.2, 16), std("#e0413a", 0.6));
  stripe.position.set(-12, 4.2, -6);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), new THREE.MeshStandardMaterial({ color: "#fff3b0", emissive: "#ffd36b", emissiveIntensity: 2 }));
  lamp.position.set(-12, 8.4, -6);
  g.add(tower, stripe, lamp);
  return g;
}

function makeAnchor() {
  const iron = std("#3b3f4c", 0.45, 0.85);
  const g = new THREE.Group();
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 10), iron);
  shank.position.y = -0.35;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), iron);
  const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), iron);
  stock.rotation.z = Math.PI / 2;
  stock.position.y = -0.1;
  const arms = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 24, Math.PI), iron);
  arms.rotation.z = Math.PI;
  arms.position.y = -0.48;
  g.add(shank, ring, stock, arms);
  for (const sx of [-1, 1]) {
    const fluke = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), iron);
    fluke.position.set(sx * 0.26, -0.43, 0);
    fluke.rotation.z = sx * -0.6;
    g.add(fluke);
  }
  g.traverse((o) => ((o as THREE.Mesh).isMesh ? (o.castShadow = true) : null));
  return g;
}

function makeWheel() {
  const wood = std("#7a4a2e", 0.7);
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.16), wood);
  stand.position.y = 0.27;
  const wheel = new THREE.Group();
  wheel.position.y = 0.6;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 28), wood);
  wheel.add(rim);
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.7, 6), wood);
    sp.rotation.z = (i / 8) * Math.PI;
    wheel.add(sp);
  }
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12).rotateX(Math.PI / 2), std("#ffc933", 0.3, 0.8)));
  wheel.rotation.y = Math.PI / 2;
  g.add(stand, wheel);
  g.traverse((o) => ((o as THREE.Mesh).isMesh ? (o.castShadow = true) : null));
  return { g, wheel };
}

function makeCapstan() {
  const wood = std("#8a5a34", 0.7);
  const g = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.36, 16), wood);
  drum.position.y = 0.18;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), std("#5a3a22", 0.7));
  cap.position.y = 0.38;
  const bars = new THREE.Group();
  bars.position.y = 0.34;
  for (let i = 0; i < 2; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6), wood);
    b.rotation.z = Math.PI / 2;
    b.rotation.y = (i * Math.PI) / 2;
    bars.add(b);
  }
  g.add(drum, cap, bars);
  g.traverse((o) => ((o as THREE.Mesh).isMesh ? (o.castShadow = true) : null));
  return { g, bars };
}

function makeGull() {
  const mat = std("#ffffff", 0.6);
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat);
  body.scale.set(1.8, 0.8, 0.8);
  g.add(body);
  const wings = [-1, 1].map((s) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.55), mat);
    w.geometry.translate(0, 0, (s * 0.55) / 2);
    g.add(w);
    return w;
  });
  return { g, wings };
}

type Cloth = { mesh: THREE.Mesh; base: Float32Array; axis: number; ua: number; va: number; min: THREE.Vector3; size: THREE.Vector3; flag: boolean };

// plachty a vlajka: vlastní kopie sítě, posun bodů kolmo k plátnu (vzdutí větrem, třepetání)
function prepCloth(ship: THREE.Object3D): Cloth[] {
  const out: Cloth[] = [];
  ship.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !/^(plachta|vlajka)/.test(m.name)) return;
    m.geometry = m.geometry.clone();
    m.userData.shared = false;
    for (const mt of [m.material].flat()) (mt as THREE.Material).side = THREE.DoubleSide;
    m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox!;
    const size = bb.getSize(new THREE.Vector3());
    const ext = [size.x, size.y, size.z];
    const axis = ext.indexOf(Math.min(...ext));
    const rest = [0, 1, 2].filter((k) => k !== axis);
    const ua = rest[0] === 1 ? rest[1] : rest[0]; // vodorovně (ne svislá osa y)
    const va = 1;
    out.push({ mesh: m, base: (m.geometry.attributes.position.array as Float32Array).slice(), axis, ua, va: ua === 1 ? rest[1] : va, min: bb.min.clone(), size, flag: m.name.startsWith("vlajka") });
  });
  return out;
}

function updateCloth(cl: Cloth[], t: number, wind: number) {
  for (const c of cl) {
    const pos = c.mesh.geometry.attributes.position as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    const sz = [c.size.x, c.size.y, c.size.z];
    const mn = [c.min.x, c.min.y, c.min.z];
    for (let i = 0; i < pos.count; i++) {
      const u = (c.base[i * 3 + c.ua] - mn[c.ua]) / Math.max(1e-4, sz[c.ua]);
      const v = (c.base[i * 3 + c.va] - mn[c.va]) / Math.max(1e-4, sz[c.va]);
      let d: number;
      if (c.flag) d = (0.05 + 0.06 * wind) * Math.sin(8 * u - t * (5 + 4 * wind)) * u;
      else d = (0.04 + 0.3 * wind) * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, v * 1.1)) + 0.025 * Math.sin(6 * u + t * 3.2) * Math.sin(Math.PI * v);
      a[i * 3] = c.base[i * 3];
      a[i * 3 + 1] = c.base[i * 3 + 1];
      a[i * 3 + 2] = c.base[i * 3 + 2];
      a[i * 3 + c.axis] += d;
    }
    pos.needsUpdate = true;
    c.mesh.geometry.computeVertexNormals();
  }
}

export function runPirate3D(container: HTMLElement, opts: PirateOpts): Handle {
  let stopped = false;
  let ended = false;
  let raf = 0;
  const stage = createStage(container);
  if (!stage) {
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

  const scene = new THREE.Scene();
  scene.environment = stage.env;
  scene.environmentIntensity = 0.45;
  const sky = makeSky();
  scene.add(sky);
  scene.fog = new THREE.Fog("#cfeaff", 60, 260);
  const hemi = new THREE.HemisphereLight("#d6ecff", "#3a7aa8", 1.1);
  const sun = new THREE.DirectionalLight("#fff0d6", 2.8);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  sun.shadow.bias = -0.0005;
  scene.add(hemi, sun, sun.target);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot("rgba(255,244,214,1)", "rgba(255,220,150,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  sunGlow.position.set(160, 70, -260);
  sunGlow.scale.set(90, 90, 1);
  scene.add(sunGlow);
  const { sea, mat: seaMat } = makeSea();
  scene.add(sea);
  scene.add(makeHarbourTown());
  for (const [x, z, r, p] of [[70, -90, 7, 4], [120, -40, 10, 6], [40, -140, 5, 3], [160, -130, 8, 5]] as const) {
    const is = makeIsland(r, p);
    is.position.set(x, -0.2, z);
    scene.add(is);
  }
  // oblaka na obzoru
  const cloudMat = new THREE.SpriteMaterial({
    map: canvasTex(256, 128, (g) => {
      for (let i = 0; i < 9; i++) {
        const gr = g.createRadialGradient(40 + i * 22, 70 - Math.sin(i) * 14, 0, 40 + i * 22, 70 - Math.sin(i) * 14, 46);
        gr.addColorStop(0, "rgba(255,255,255,0.95)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 128);
      }
    }),
    transparent: true,
    depthWrite: false,
  });
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Sprite(cloudMat);
    c.position.set(-60 + i * 35, 28 + (i % 3) * 8, -220 - (i % 2) * 40);
    c.scale.set(70, 35, 1);
    scene.add(c);
  }
  const gulls = Array.from({ length: 5 }, (_, i) => {
    const gl = makeGull();
    gl.g.userData.phase = i * 1.3;
    scene.add(gl.g);
    return gl;
  });

  // loď (v kontejneru kvůli houpání a plavbě), kotva, rumpál a kormidlo jsou její součástí
  const ship = new THREE.Group();
  scene.add(ship);
  const anchor = makeAnchor();
  anchor.position.set(2.15, -1.4, 0.85);
  ship.add(anchor);
  const chainMat = std("#4a4e5c", 0.4, 0.85);
  const links = Array.from({ length: 28 }, (_, i) => {
    const l = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.011, 6, 12), chainMat);
    l.rotation.y = i % 2 ? Math.PI / 2 : 0;
    ship.add(l);
    return l;
  });
  const capstan = makeCapstan();
  capstan.g.position.set(1.45, DECK, -0.15);
  ship.add(capstan.g);
  const helm = makeWheel();
  helm.g.position.set(-1.65, DECK, 0);
  ship.add(helm.g);

  let molo: THREE.Object3D | null = null;
  let plank: THREE.Object3D | null = null;
  let cloth: Cloth[] = [];
  let hero: Figure | null = null;
  let captain: { root: THREE.Object3D; update: (dt: number) => void } | null = null;
  let parrot: { root: THREE.Object3D; update: (dt: number) => void } | null = null;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1200);
  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 60 : 42;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const look = new THREE.Vector3();
  const heading = { x: 0, z: 0, yaw: 0, v: 0 };
  let boarded = false;
  let t0 = 0;
  let last = 0;
  let fired = 0;
  const pathLen = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[2] - PATH[i][2]));

  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const seek = (window as { __seek3d?: number }).__seek3d;
    const t = seek ?? (now - t0) / 1000;
    const dt = seek !== undefined ? 1 / 30 : Math.min(0.05, (now - last) / 1000);
    last = now;
    const cues: [number, () => void][] = [
      [0.3, () => sfx.gull()],
      [T.plankAway, () => sfx.creak()],
      [T.anchor[0], () => sfx.standUp(1.2)],
      [T.anchor[1] - 0.1, () => sfx.dock()],
      [T.wind[0], () => sfx.whoosh(1.2)],
      [T.sail + 0.4, () => sfx.horn()],
      [T.sail + 2, () => sfx.gull()],
    ];
    while (fired < cues.length && t >= cues[fired][0]) cues[fired++][1]();
    fx.bars(t < T.end - 0.3);
    seaMat.uniforms.uTime.value = t;

    // ---- plavba: loď se rozjede k přídi a stočí od přístavu k ostrovům
    const sailK = Math.max(0, t - T.sail);
    heading.v = Math.min(4.2, 0.9 * sailK * sailK + 0.3 * sailK);
    heading.yaw = 0.55 * smooth(t, T.sail + 0.5, T.sail + 3.2);
    heading.x += Math.cos(heading.yaw) * heading.v * dt;
    heading.z -= Math.sin(heading.yaw) * heading.v * dt;
    const bob = wave(heading.x, heading.z, t);
    ship.position.set(heading.x, bob - 0.02, heading.z);
    ship.rotation.set(0.03 * Math.sin(t * 1.3), heading.yaw, 0.025 * Math.sin(t * 1.1 + 1.2) + 0.04 * smooth(heading.v, 0, 3));

    // ---- lávka se stáhne na molo
    if (plank) {
      const k = smooth(t, T.plankAway, T.plankAway + 0.9);
      plank.position.x = -2.4 * k;
      plank.position.y = -0.05 * k;
    }
    // ---- kotva: rumpál ji vytáhne
    const ak = smooth(t, T.anchor[0], T.anchor[1]);
    capstan.bars.rotation.y = -ak * Math.PI * 6;
    const ay = lerp(-1.4, 0.55, ak);
    anchor.position.y = ay + Math.sin(t * 2) * 0.02 * (1 - ak);
    anchor.rotation.z = 0.15 * Math.sin(t * 1.5);
    const topY = 0.88;
    const len = topY - ay;
    links.forEach((l, i) => {
      const y = topY - i * 0.065;
      l.visible = topY - y < len && y > -0.4;
      l.position.set(2.15, y, 0.85);
    });
    // ---- kormidlo se otáčí, když loď zatáčí
    helm.wheel.rotation.x = -heading.yaw * 6 + 0.1 * Math.sin(t);
    // ---- plachty a vlajka
    updateCloth(cloth, t, smooth(t, T.wind[0], T.wind[1]));

    // ---- hrdina: po molu, lávce a na palubu, tam se raduje
    if (hero) {
      const hr = hero.root;
      let pose: "chuze" | "stoji" | "radost" = "stoji";
      if (t < T.deck) {
        const segT = [0, T.molo, T.plank, T.plank + 0.4, T.deck];
        let i = segT.findIndex((s, k) => t >= s && t < (segT[k + 1] ?? Infinity));
        i = Math.max(0, Math.min(PATH.length - 2, i));
        const k = clamp01((t - segT[i]) / (segT[i + 1] - segT[i]));
        const A = PATH[i];
        const B = PATH[i + 1];
        hr.position.set(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k));
        hr.rotation.y = -Math.atan2(B[2] - A[2], B[0] - A[0]);
        pose = pathLen[i] > 0.01 ? "chuze" : "stoji";
      } else {
        if (!boarded) {
          boarded = true;
          ship.attach(hr);
          hr.position.set(PATH[PATH.length - 1][0], DECK, PATH[PATH.length - 1][2]);
        }
        hr.rotation.y = lerp(0, -1.3, smooth(t, T.deck, T.deck + 0.6));
        pose = t > T.sail ? "radost" : "stoji";
      }
      hero.pose(pose);
      hero.update(dt);
    }
    captain?.update(dt);
    parrot?.update(dt);
    gulls.forEach((g, i) => {
      const ph = t * 0.35 + g.g.userData.phase;
      g.g.position.set(-2 + Math.cos(ph) * (6 + i), 6 + i * 0.7 + Math.sin(ph * 2) * 0.5, -3 + Math.sin(ph) * (5 + i));
      g.g.rotation.y = -ph - Math.PI / 2;
      const f = Math.sin(t * 9 + i) * 0.5;
      g.wings[0].rotation.x = f;
      g.wings[1].rotation.x = -f;
    });

    // ---- kamera
    const sx = ship.position.x;
    const sz = ship.position.z;
    if (t < T.molo) {
      const hx = hero ? hero.root.position.x : -5;
      camera.position.set(hx + 0.8, 1.9, 5.4);
      look.set(hx + 1.9, 1.15, 0.4);
    } else if (t < T.deck) {
      const k = ease(clamp01((t - T.molo) / (T.deck - T.molo)));
      camera.position.set(lerp(-2.4, -1.2, k), lerp(1.9, 2.2, k), lerp(5.2, 4.6, k));
      look.set(lerp(-2.2, -0.6, k), lerp(1.2, 1.35, k), 0.2);
    } else if (t < T.wind[0]) {
      // příď a kotva
      camera.position.set(sx + 4.6, 1.7, sz + 4.3);
      look.set(sx + 2.0, 0.8, sz + 0.6);
    } else if (t < T.sail) {
      // plachty se nadmou
      const k = ease(clamp01((t - T.wind[0]) / (T.sail - T.wind[0])));
      camera.position.set(sx - 4.8, lerp(3.0, 3.8, k), sz + 6);
      look.set(sx, lerp(2.0, 2.8, k), sz);
    } else {
      // vyplutí: kamera zůstane u mola a otáčí se za lodí, pak ji pomalu sleduje
      const k = smooth(t, T.sail, T.sail + 3);
      camera.position.set(lerp(-4.8, sx - 9, k * 0.5), lerp(3.8, 3.2, k), lerp(6, sz + 11, k * 0.6));
      look.set(sx + 1, 1.8, sz);
    }
    camera.lookAt(look);
    sky.position.copy(camera.position);
    fx.flash(smooth(t, T.fade, T.end));
    renderer.render(scene, camera);
    if (t >= T.end && seek === undefined) {
      cancelAnimationFrame(raf);
      finish();
    }
  };

  // modely z Blenderu a postavy (nejvýš 3 s, pak se začne i bez chybějících)
  const loads = Promise.all([
    makeModel("lod").then((m) => {
      ship.add(m);
      cloth = prepCloth(m);
    }),
    makeModel("molo").then((m) => {
      molo = m;
      scene.add(m);
    }),
    makeModel("lavka").then((m) => {
      plank = m;
      scene.add(m);
    }),
    makeHero(opts.look).then((f) => {
      hero = f;
      f.root.scale.setScalar(FIG);
      f.root.position.set(...PATH[0]);
      scene.add(f.root);
    }),
    makeLoop("kapitan").then((c) => {
      captain = c;
      c.root.scale.setScalar(FIG);
      c.root.position.set(-2.0, DECK, 0.05);
      ship.add(c.root);
    }),
    makeLoop("papousek").then((p) => {
      parrot = p;
      p.root.position.set(-1.6, DECK + 0.12, 0.6);
      p.root.scale.setScalar(FIG * 0.8);
      ship.add(p.root);
    }),
  ]).catch(() => {});
  void Promise.race([loads, new Promise((r) => window.setTimeout(r, 3000))]).then(() => {
    if (stopped) return;
    void molo;
    renderer.compile(scene, camera);
    t0 = last = performance.now();
    raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => (stage.el.style.opacity = "1"));
  });

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.dispose([scene]);
    },
    skip: finish,
  };
}
