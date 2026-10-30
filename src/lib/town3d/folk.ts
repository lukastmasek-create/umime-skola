import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeRig, softDot, type Rig } from "./kit";

// Živé 3D postavy v městečku. Městečko zůstává obrázek z Blenderu a postavy v něm jsou dál prvky stránky (poloha,
// vrstvy za domy, kliknutí, bubliny); místo pásu snímků se do každé postavy kreslí její 3D model.
// Jeden sdílený renderer vykreslí postavu po postavě do malého výřezu a obraz se zkopíruje do plátna v postavě.
// Co postava dělá, se čte z jejího stylu, který nastavuje TownHub i filmové přechody: pás „chuze“/„bezi“ = jde,
// „radost“ = raduje se, zastavená animace = stojí. Dokud se model nenačte (nebo bez WebGL), zůstává pás snímků.

export type FolkEntry = {
  el: HTMLElement | null; // prvek se spritem postavy (čtverec)
  model: string; // soubor v public/avatars-3d
  h: number; // výška postavy jako zlomek strany čtverce (může být i víc než pás snímků, plátno je větší)
  feet: number; // kde ve čtverci (od shora) stojí chodidla
};

type State = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; model: string; rig: Rig | null; joy: boolean; rotY: number; failed?: boolean };

const N = 256; // největší výřez v pixelech
const K = 1.7; // plátno je větší než čtverec spritu, ať se tam vejde hlava i zvednuté ruce
const FC = 0.86; // chodidla v plátně (od shora)

export function startFolk3D(get: () => FolkEntry[], opt: { night: () => boolean }): { stop: () => void } | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(N, N, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // stejný vzhled jako rendery z Blenderu
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.75;
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x7ccf64, 0.9);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.1);
  key.position.set(-3, 5, 4);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9);
  rim.position.set(3, 3, -4);
  scene.add(hemi, key, rim);
  const shadowTex = softDot("rgba(20,30,20,0.55)", "rgba(20,30,20,0)");
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(1, 1);

  // kamera zepředu s mírným nadhledem, jako u renderů městečka
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  const e = 0.22;
  cam.position.set(0, 10 * Math.sin(e), 10 * Math.cos(e));
  cam.lookAt(0, 0, 0);

  const states = new Map<HTMLElement, State>();
  const loading = new Set<HTMLElement>();
  let stopped = false;

  const load = (el: HTMLElement, st: State) => {
    if (loading.has(el)) return;
    loading.add(el);
    const model = st.model;
    makeRig(model, 1)
      .then((rig) => {
        loading.delete(el);
        if (stopped || st.model !== model) return;
        const sh = new THREE.Mesh(shadowGeo, shadowMat);
        sh.rotation.x = -Math.PI / 2;
        sh.scale.set(0.95, 0.45, 1);
        sh.position.y = 0.002;
        rig.root.add(sh);
        rig.root.visible = false;
        if (st.rig) scene.remove(st.rig.root);
        st.rig = rig;
        scene.add(rig.root);
        el.classList.add("town3d");
      })
      .catch(() => {
        loading.delete(el);
        st.failed = true;
      });
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
    hemi.intensity = night ? 0.35 : 0.9;
    key.intensity = night ? 0.7 : 2.1;
    scene.environmentIntensity = night ? 0.3 : 0.75;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (const en of get()) {
      const el = en.el;
      if (!el || !el.isConnected) continue;
      let st = states.get(el);
      if (!st) {
        const canvas = document.createElement("canvas");
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = `position:absolute;width:${K * 100}%;height:${K * 100}%;left:${(-(K - 1) / 2) * 100}%;top:${(en.feet - FC * K) * 100}%;pointer-events:none`;
        el.style.position = el.style.position || "relative";
        el.appendChild(canvas);
        st = { canvas, ctx: canvas.getContext("2d")!, model: en.model, rig: null, joy: false, rotY: 0.5 };
        states.set(el, st);
      }
      if (st.model !== en.model) {
        st.model = en.model;
        st.failed = false;
        el.classList.remove("town3d");
      }
      if (!st.rig || (st.rig && !el.classList.contains("town3d"))) {
        if (!st.failed) load(el, st);
        if (!st.rig || !el.classList.contains("town3d")) continue;
      }
      const rig = st.rig;
      // co postava právě dělá (podle pásu snímků, který by se jinak ukazoval)
      const bg = el.style.backgroundImage;
      const walking = /chuze|bezi/.test(bg) && el.style.animationPlayState !== "paused";
      const joy = /radost/.test(bg);
      if (joy && !st.joy) rig.joy();
      st.joy = joy;
      st.rotY += ((walking ? 1.2 : 0.45) - st.rotY) * Math.min(1, step * 8);
      rig.root.rotation.y = st.rotY;
      rig.update(step, walking ? 1 : 0);
      const r = st.canvas.getBoundingClientRect();
      if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh || r.width < 2) continue;
      const px = Math.min(N, Math.max(16, Math.round(r.width * Math.min(window.devicePixelRatio || 1, 2))));
      if (st.canvas.width !== px) {
        st.canvas.width = px;
        st.canvas.height = px;
      }
      for (const s2 of states.values()) if (s2.rig) s2.rig.root.visible = s2 === st;
      const H = K / en.h;
      cam.left = -H / 2;
      cam.right = H / 2;
      cam.top = H * FC;
      cam.bottom = -H * (1 - FC);
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
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
