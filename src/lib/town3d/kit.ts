import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";

// Společný základ 3D městečka: načtení postav z Blenderu (public/avatars-3d, animace „klid“ a „radost“),
// procedurální chůze (pohupování, náklon, mávání rukama) a pomocníci pro 3D cut scény (plátno, překryv, úklid).

export type Rig = {
  root: THREE.Group; // poloha a otočení postavy ve scéně (chodidla v počátku)
  height: number;
  /** walk 0..1 = jak rychle jde; vrací se pohupování, aby šlo přidat stín */
  update: (dt: number, walk: number) => void;
  joy: () => void;
};

let loader: GLTFLoader | null = null;
const cache = new Map<string, Promise<GLTF>>();

export function loadGltf(url: string): Promise<GLTF> {
  if (!loader) {
    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    loader = new GLTFLoader().setDRACOLoader(draco);
  }
  let p = cache.get(url);
  if (!p) {
    p = loader.loadAsync(url);
    cache.set(url, p);
    p.catch(() => cache.delete(url));
  }
  return p;
}

const modelUrl = (id: string) => `/avatars-3d/${id}.glb`;

/** Postava z profilu jako loutka: výška `height` (jednotky scény), chodidla v počátku, obličej k +z. */
export async function makeRig(id: string, height: number): Promise<Rig> {
  const gltf = await loadGltf(modelUrl(id));
  const model = gltf.scene.clone(true);
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.frustumCulled = false;
      m.userData.shared = true; // geometrie a materiály patří modelu v mezipaměti, úklid scény je nemaže
    }
  });
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const k = height / Math.max(size.y, 1e-3);
  const inner = new THREE.Group();
  inner.scale.setScalar(k);
  model.position.set(-(box.min.x + size.x / 2), -box.min.y, -(box.min.z + size.z / 2));
  inner.add(model);
  const root = new THREE.Group();
  root.add(inner);

  const mixer = new THREE.AnimationMixer(model);
  const clip = (n: string) => gltf.animations.find((c) => c.name === n);
  const idleClip = clip("klid");
  const joyClip = clip("radost");
  const idle = idleClip ? mixer.clipAction(idleClip) : null;
  const joyA = joyClip ? mixer.clipAction(joyClip) : null;
  idle?.play();
  if (joyA) {
    joyA.setLoop(THREE.LoopOnce, 1);
    joyA.clampWhenFinished = false;
    mixer.addEventListener("finished", (e) => {
      if (e.action === joyA && idle) {
        idle.reset().play();
        idle.crossFadeFrom(joyA, 0.25, false);
      }
    });
  }
  // ramena (uzly *_rameno_leva / *_rameno_prava) pro mávání při chůzi
  let armL: THREE.Object3D | null = null;
  let armR: THREE.Object3D | null = null;
  model.traverse((o) => {
    if (/_rameno_leva$/.test(o.name)) armL = o;
    if (/_rameno_prava$/.test(o.name)) armR = o;
  });
  let phase = Math.random() * 6;
  let w = 0;
  return {
    root,
    height,
    update(dt, walk) {
      mixer.update(dt);
      w += (walk - w) * Math.min(1, dt * 8);
      phase += dt * (6 + 5 * w);
      const s = Math.sin(phase);
      inner.position.y = Math.abs(s) * 0.07 * height * w;
      inner.rotation.z = s * 0.07 * w;
      inner.rotation.x = 0.12 * w;
      // mávání přičtené k animaci klidu (ta se každý snímek přepíše mixerem)
      const a = armL as THREE.Object3D | null;
      const b = armR as THREE.Object3D | null;
      if (a) a.rotation.x += s * 0.7 * w;
      if (b) b.rotation.x -= s * 0.7 * w;
    },
    joy() {
      if (!joyA) return;
      joyA.reset().play();
      if (idle?.isRunning()) joyA.crossFadeFrom(idle, 0.12, false);
    },
  };
}

export { NPC_MODEL, HERO_MODELS } from "./models";

// ---------------------------------------------------------------------------------------------- 3D cut scény
export type Stage = {
  renderer: THREE.WebGLRenderer;
  el: HTMLElement;
  overlay: HTMLDivElement;
  size: () => { w: number; h: number };
  env: THREE.Texture;
  dispose: (scenes: THREE.Object3D[]) => void;
};

/** Plátno přes celý `container`, nad ním překryv pro filmové pruhy a odpočet. */
export function createStage(container: HTMLElement): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const c = renderer.domElement;
  c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;inset:0;overflow:hidden;opacity:0;transition:opacity .45s ease;background:#000";
  el.appendChild(c);
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;pointer-events:none";
  overlay.innerHTML =
    '<div data-bar style="position:absolute;left:0;right:0;top:0;height:0;background:#000;transition:height .6s ease"></div>' +
    '<div data-bar style="position:absolute;left:0;right:0;bottom:0;height:0;background:#000;transition:height .6s ease"></div>' +
    '<div data-count class="market-count"></div>' +
    '<div data-flash style="position:absolute;inset:0;background:#fff;opacity:0"></div>';
  el.appendChild(overlay);
  container.appendChild(el);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const size = () => ({ w: Math.max(1, container.clientWidth), h: Math.max(1, container.clientHeight) });
  const { w, h } = size();
  renderer.setSize(w, h, false);
  return {
    renderer,
    el,
    overlay,
    size,
    env,
    dispose(scenes) {
      for (const s of scenes)
        s.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.userData.shared) return; // postavy sdílí geometrii a materiály s mezipamětí modelů
          if (m.geometry) m.geometry.dispose();
          if (m.material) for (const mt of [m.material].flat()) disposeMat(mt as THREE.Material);
        });
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      el.remove();
    },
  };
}

function disposeMat(m: THREE.Material) {
  for (const v of Object.values(m)) if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
  m.dispose();
}

/** Filmové pruhy (0..1), číslo odpočtu a bílý záblesk na překryvu scény. */
export function overlayFx(stage: Stage) {
  const bars = stage.overlay.querySelectorAll<HTMLElement>("[data-bar]");
  const count = stage.overlay.querySelector<HTMLElement>("[data-count]")!;
  const flash = stage.overlay.querySelector<HTMLElement>("[data-flash]")!;
  return {
    bars(on: boolean) {
      bars.forEach((b) => (b.style.height = on ? "9%" : "0"));
    },
    count(label: string) {
      if (count.dataset.l === label) return;
      count.dataset.l = label;
      count.textContent = label;
      count.style.animation = "none";
      void count.offsetWidth;
      count.style.animation = label ? "market-count 0.55s ease-out both" : "";
    },
    flash(a: number) {
      flash.style.opacity = String(a);
    },
  };
}

/** Plátno s nakreslenou texturou (sRGB). */
export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

/** Měkká kulatá skvrna (kouř, záře, stín). */
export function softDot(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  return canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner);
    gr.addColorStop(1, outer);
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });
}

export const std = (color: THREE.ColorRepresentation, rough = 0.55, metal = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
