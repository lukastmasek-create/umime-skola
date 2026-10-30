import * as THREE from "three";
import { figureUrl, loadGltf } from "./kit";

// Živé 3D postavy v městečku: původní obyvatelé z Blenderu (umime-art/blender/mesto_figury.py, export
// mesto_figury_glb.py do public/home/mesto3d) místo pásů snímků. Městečko zůstává obrázek a postavy v něm jsou
// dál prvky stránky (poloha, vrstvy za domy, kliknutí, bubliny); do každé se kreslí její 3D model.
// Který model a jak rychle, se čte z pásu snímků, který by se jinak ukazoval (TownHub i filmové přechody ho
// nastavují): /home/mesto/knihovnice-chuze.webp → /home/mesto3d/knihovnice_chuze.glb, délka smyčky podle
// animation-duration, zastavená animace = postava stojí. Dokud se model nenačte (nebo bez WebGL), zůstává pás.

// záběr jako v Blenderu (stage v mesto_figury.py): šířka ortografické kamery a výška, kam míří
const FRAME: Record<string, [number, number]> = {
  hrdina: [1.6, 0.55],
  knihovnice: [1.7, 0.62],
  pekar: [1.9, 0.62],
  farmar: [1.9, 0.62],
  babicka: [1.7, 0.55],
  kluk: [1.7, 0.55],
  pes: [1.3, 0.28],
  kocka: [1.2, 0.27],
  ovce: [1.4, 0.33],
  slepice: [0.9, 0.2],
};
const K = 1.5; // plátno je větší než čtverec spritu (skok radosti, zvednuté ruce)
const BELOW = 0.12; // kolik plátna (v šířkách záběru) je pod spodkem čtverce
const N = 320; // největší výřez v pixelech
const EL = (16 * Math.PI) / 180; // mírný nadhled (městečko je snímané shora pod 38°)

type Model = { root: THREE.Object3D; action: THREE.AnimationAction | null; mixer: THREE.AnimationMixer; dur: number };
type State = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; models: Map<string, Model | "loading" | "failed">; shown: string | null };

const nameOf = (bg: string) => /\/home\/mesto\/([\w-]+)\.webp/.exec(bg)?.[1]?.replace(/-/g, "_") ?? null;
const frameOf = (name: string) => FRAME[name.split("_")[0]] ?? FRAME.hrdina;

export function startFolk3D(get: () => (HTMLElement | null)[], opt: { night: () => boolean }): { stop: () => void } | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(N, N, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping; // jako „AgX“ v Blenderu
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  // světla jako v Blenderu: fialové okolí, chladné slunce zepředu zleva, teplé zprava zezadu
  const scene = new THREE.Scene();
  const amb = new THREE.HemisphereLight("#b9b2ff", "#6f68b8", 1.6);
  const sun = new THREE.DirectionalLight("#dfe6ff", 3.2);
  sun.position.set(-0.53, 0.61, 0.59);
  const warm = new THREE.DirectionalLight("#ffb07a", 1.8);
  warm.position.set(0.91, 0.21, -0.37);
  const fill = new THREE.DirectionalLight("#a8b0ff", 0.8);
  fill.position.set(-0.4, 0.5, 0.8);
  scene.add(amb, sun, warm, fill);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);

  const states = new Map<HTMLElement, State>();
  let stopped = false;

  const load = (st: State, name: string) => {
    st.models.set(name, "loading");
    loadGltf(figureUrl(name))
      .then((gltf) => {
        if (stopped) return;
        const root = gltf.scene.clone(true);
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) m.frustumCulled = false;
        });
        root.visible = false;
        scene.add(root);
        const mixer = new THREE.AnimationMixer(root);
        const tracks = gltf.animations.flatMap((a) => a.tracks);
        const clip = tracks.length ? new THREE.AnimationClip(name, -1, tracks) : null;
        const action = clip ? mixer.clipAction(clip) : null;
        action?.play();
        st.models.set(name, { root, action, mixer, dur: clip?.duration ?? 1 });
      })
      .catch(() => st.models.set(name, "failed"));
  };

  let raf = 0;
  let last = performance.now();
  let acc = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    if (acc < 1 / 40) return; // stačí ~40 snímků za sekundu
    const step = acc;
    acc = 0;
    const night = opt.night();
    amb.intensity = night ? 0.7 : 1.6;
    sun.intensity = night ? 1.2 : 3.2;
    warm.intensity = night ? 1.1 : 1.8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (const el of get()) {
      if (!el || !el.isConnected) continue;
      const name = nameOf(el.style.backgroundImage);
      if (!name) continue;
      let st = states.get(el);
      if (!st) {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-hidden", "true");
        el.style.position = el.style.position || "relative";
        el.appendChild(canvas);
        st = { canvas, ctx: canvas.getContext("2d")!, models: new Map(), shown: null };
        states.set(el, st);
      }
      if (!st.models.has(name)) load(st, name);
      const want = st.models.get(name);
      if (want && want !== "loading" && want !== "failed") st.shown = name;
      const cur = st.shown ? st.models.get(st.shown) : null;
      if (!cur || cur === "loading" || cur === "failed") continue;
      if (!el.classList.contains("town3d")) el.classList.add("town3d");
      // rychlost smyčky jako u pásu snímků, zastavený pás = postava stojí
      const css = parseFloat(el.style.animationDuration) || cur.dur;
      if (cur.action) {
        cur.action.paused = el.style.animationPlayState === "paused";
        cur.action.timeScale = cur.dur / css;
      }
      cur.mixer.update(step);
      const r = st.canvas.getBoundingClientRect();
      const [o, tz] = frameOf(st.shown!);
      // plátno: K× šířka čtverce, spodek kousek pod čtvercem (kvůli stínu), zbytek nahoru
      const style = `position:absolute;pointer-events:none;width:${K * 100}%;height:${K * 100}%;left:${(-(K - 1) / 2) * 100}%;top:${-(K - 1 - BELOW) * 100}%`;
      if (st.canvas.style.cssText !== style) st.canvas.style.cssText = style;
      if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh || r.width < 2) continue;
      const px = Math.min(N, Math.max(16, Math.round(r.width * Math.min(window.devicePixelRatio || 1, 2))));
      if (st.canvas.width !== px) {
        st.canvas.width = px;
        st.canvas.height = px;
      }
      for (const s2 of states.values()) for (const m of s2.models.values()) if (typeof m === "object") m.root.visible = m === cur;
      // chodidla musí zůstat na stejném místě plátna jako u pásu snímků: kamera míří na (0, tz, 0) a chodidla
      // jsou při náklonu EL o tz·cos(EL) pod středem
      const feetToBottom = o / 2 - tz + BELOW * o;
      cam.left = (-K * o) / 2;
      cam.right = (K * o) / 2;
      cam.bottom = -tz * Math.cos(EL) - feetToBottom;
      cam.top = cam.bottom + K * o;
      cam.position.set(0, tz + 12 * Math.sin(EL), 12 * Math.cos(EL));
      cam.lookAt(0, tz, 0);
      cam.updateProjectionMatrix();
      renderer.setViewport(0, 0, px, px);
      renderer.setScissor(0, 0, px, px);
      renderer.clear();
      renderer.render(scene, cam);
      st.ctx.clearRect(0, 0, px, px);
      st.ctx.drawImage(renderer.domElement, 0, N - px, px, px, 0, 0, px, px);
    }
  };
  raf = requestAnimationFrame(frame);
  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      for (const [el, st] of states) {
        st.canvas.remove();
        el.classList.remove("town3d");
      }
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
