import * as THREE from "three";
import { canvasTex, clamp01, lerp, loadGltf, makeHero, softDot, std, type Figure, type Pose } from "./kit";

// Sdílené kusy 3D scén (cut scény v films.ts, světy obchodu v market3d.ts): obloha, zem, voda, stromy,
// jiskry, modely z public/mestecko3d a chůze hrdiny po bodech.
export type P3 = [number, number, number];
export const HERO_H = 1.6;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

// ------------------------------------------------------------------------------------------ pomůcky
export function placeModel(name: string): Promise<THREE.Object3D> {
  return loadGltf(`/mestecko3d/${name}.glb`).then((g) => {
    const root = g.scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.shared = true;
    });
    return root;
  });
}

export async function hero(look: number): Promise<Figure> {
  const f = await makeHero(look);
  const size = new THREE.Box3().setFromObject(f.root).getSize(new THREE.Vector3());
  f.root.scale.multiplyScalar(HERO_H / Math.max(0.01, size.y));
  return f;
}

/** Chůze po bodech `path`, do bodu i dorazí v čase times[i]; jinak stojí v pozici `idle`. */
export function walk(f: Figure, path: P3[], times: number[], t: number, idle: Pose = "stoji") {
  const r = f.root;
  const face = (a: P3, b: P3) => {
    if (Math.hypot(b[0] - a[0], b[2] - a[2]) > 0.01) r.rotation.y = -Math.atan2(b[2] - a[2], b[0] - a[0]);
  };
  if (t <= times[0]) {
    r.position.set(...path[0]);
    face(path[0], path[1]);
    f.pose(idle);
    return;
  }
  for (let i = 0; i + 1 < path.length; i++) {
    if (t < times[i + 1]) {
      const k = clamp01((t - times[i]) / (times[i + 1] - times[i]));
      const a = path[i];
      const b = path[i + 1];
      r.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k));
      face(a, b);
      f.pose("chuze");
      return;
    }
  }
  r.position.set(...path[path.length - 1]);
  f.pose(idle);
}

export function gradientSky(stops: [string, number][]) {
  const tex = canvasTex(8, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    for (const [c, k] of stops) gr.addColorStop(k, c);
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10;
  return sky;
}

export function noiseTex(base: string, spots: string[], n = 1600, size = 256, repeat = 24, r: [number, number] = [1, 4]) {
  return canvasTex(
    size,
    size,
    (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, size, size);
      for (let i = 0; i < n; i++) {
        g.fillStyle = spots[i % spots.length];
        g.globalAlpha = rand(0.25, 0.7);
        g.beginPath();
        g.arc(Math.random() * size, Math.random() * size, rand(r[0], r[1]), 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    },
    [repeat, repeat],
  );
}

export function ground(tex: THREE.Texture, size = 420, color = "#ffffff") {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), std(color, 1, 0, { map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

export function sunLight(scene: THREE.Scene, color: string, intensity: number, pos: P3, span = 18) {
  const sun = new THREE.DirectionalLight(color, intensity);
  sun.position.set(...pos);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, far: 120 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  return sun;
}

/** Jehličnany a listnáče jako instance (kmen + patra koruny). */
export function forestTrees(spots: { x: number; z: number; s: number }[], kind: "pine" | "round", crown: string[]) {
  const g = new THREE.Group();
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.22, 1.6, 7), std("#6a4428", 0.9), spots.length);
  const tiers = kind === "pine" ? 3 : 2;
  const crownGeo = kind === "pine" ? new THREE.ConeGeometry(1.2, 1.9, 8) : new THREE.IcosahedronGeometry(1.2, 1);
  const crowns = new THREE.InstancedMesh(crownGeo, std("#ffffff", 0.85), spots.length * tiers);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  spots.forEach((p, i) => {
    const s = p.s;
    m.compose(new THREE.Vector3(p.x, 0.8 * s, p.z), q, new THREE.Vector3(s, s, s));
    trunk.setMatrixAt(i, m);
    for (let k = 0; k < tiers; k++) {
      const ks = kind === "pine" ? s * (1 - k * 0.24) : s * (1 - k * 0.35);
      const y = kind === "pine" ? (1.9 + k * 0.95) * s : (2.3 + k * 0.9) * s;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.x * 3 + k);
      m.compose(new THREE.Vector3(p.x + (kind === "round" ? (k ? 0.3 * s : 0) : 0), y, p.z), q, new THREE.Vector3(ks, ks, ks));
      crowns.setMatrixAt(i * tiers + k, m);
      c.set(crown[(i + k) % crown.length]);
      crowns.setColorAt(i * tiers + k, c);
    }
    q.identity();
  });
  for (const im of [trunk, crowns]) {
    im.castShadow = true;
    im.receiveShadow = true;
    g.add(im);
  }
  return g;
}

/** Ruch vody: vlnky a odlesky; zespodu (z ponorky) světlá hladina s kaustikou. `fog` = mlha nad a pod hladinou. */
export type WaterFog = { up: string; near: number; far: number; down: string; density: number };
export function waterMat(deep: string, shallow: string, opacity = 1, fog?: WaterFog) {
  return new THREE.ShaderMaterial({
    transparent: opacity < 1,
    side: THREE.DoubleSide,
    depthWrite: opacity >= 1,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      deep: { value: new THREE.Color(deep) },
      shallow: { value: new THREE.Color(shallow) },
      below: { value: new THREE.Color("#7fe6ff") },
      fogUp: { value: new THREE.Color(fog?.up ?? "#ffffff") },
      fogDown: { value: new THREE.Color(fog?.down ?? "#000000") },
      fogNear: { value: fog?.near ?? 0 },
      fogFar: { value: fog?.far ?? 0 },
      fogDensity: { value: fog?.density ?? 0 },
    },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform float uTime; uniform float uOpacity; uniform vec3 deep; uniform vec3 shallow; uniform vec3 below;
      uniform vec3 fogUp; uniform vec3 fogDown; uniform float fogNear; uniform float fogFar; uniform float fogDensity;
      varying vec3 vW;
      // vlnky: několik natočených sinusovek a pokřivení, aby nevznikala pravidelná mřížka
      float ripple(vec2 p, float t){
        vec2 q = p + 0.6 * vec2(sin(p.y * 0.37 + t * 0.6), cos(p.x * 0.31 - t * 0.5));
        return sin(q.x * 1.1 + t * 1.2) * 0.5 + sin(dot(q, vec2(0.62, 0.78)) * 1.7 - t * 0.9) * 0.35 + sin(dot(q, vec2(-0.83, 0.55)) * 2.3 + t * 1.5) * 0.25;
      }
      void main(){
        float r = ripple(vW.xz, uTime);
        vec3 col = mix(deep, shallow, 0.5 + 0.35 * r);
        float glint = smoothstep(0.78, 1.05, ripple(vW.xz * 2.3 + 7.0, uTime * 1.6));
        col += vec3(0.9) * glint * 0.3;
        float a = uOpacity;
        float d = length(cameraPosition - vW);
        if (gl_FrontFacing) {
          if (fogFar > 0.0) col = mix(col, fogUp, smoothstep(fogNear, fogFar, d));
        } else {
          float c = smoothstep(0.45, 1.0, abs(ripple(vW.xz * 1.8, uTime * 1.3)));
          col = mix(below, vec3(1.0), c * 0.45);
          a = 0.85;
          if (fogDensity > 0.0) col = mix(col, fogDown, 1.0 - exp(-fogDensity * fogDensity * d * d * 0.35));
        }
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  });
}

export function sparklePoints(n: number, colors: string[], size: number) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const col = new Float32Array(n * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    c.set(colors[i % colors.length]);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size, map: softDot(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

export function glowSprite(color: string, scale: number) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot(color, "rgba(0,0,0,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.scale.set(scale, scale, 1);
  return s;
}

