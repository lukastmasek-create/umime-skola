import * as THREE from "three";
import { canvasTex, createStage, std } from "./kit";
import { glowSprite, rand } from "./scenery";

// Materiály jako 3D knihovna: místnost s knihovnami podél tří stěn, jedna knihovna = jeden předmět (knihy v barvě
// předmětu). Najetí vysune knihu a rozsvítí knihovnu, klik otevře předmět. Popisky (emoji a název) kreslí React.

export type LibrarySubject = { slug: string; color: string };
export type LibraryLabel = { slug: string; x: number; y: number; visible: boolean };
export type LibraryHandle = { labels: (cb: (items: LibraryLabel[]) => void) => void; dispose: () => void };

const CASE_W = 1.7;
const CASE_H = 2.7;
const CASE_D = 0.45;
const SHELVES = 4;

function woodTex(base: string, grain: string) {
  return canvasTex(
    128,
    256,
    (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 128, 256);
      g.strokeStyle = grain;
      g.globalAlpha = 0.35;
      for (let i = 0; i < 22; i++) {
        g.beginPath();
        const x = Math.random() * 128;
        g.moveTo(x, 0);
        g.bezierCurveTo(x + rand(-12, 12), 80, x + rand(-12, 12), 170, x + rand(-8, 8), 256);
        g.lineWidth = rand(0.6, 2.2);
        g.stroke();
      }
      g.globalAlpha = 1;
    },
    [1, 1],
  );
}

/** Jedna knihovna s policemi a knihami; vrací skupinu a knihu, která se při najetí vysune. */
function bookcase(color: string, wood: THREE.Material, seed: number) {
  const g = new THREE.Group();
  const side = new THREE.BoxGeometry(0.06, CASE_H, CASE_D);
  for (const x of [-CASE_W / 2, CASE_W / 2]) {
    const s = new THREE.Mesh(side, wood);
    s.position.set(x, CASE_H / 2, 0);
    g.add(s);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(CASE_W, CASE_H, 0.03), std("#5a3a22", 0.9));
  back.position.set(0, CASE_H / 2, -CASE_D / 2);
  g.add(back);
  const top = new THREE.Mesh(new THREE.BoxGeometry(CASE_W + 0.14, 0.1, CASE_D + 0.08), wood);
  top.position.set(0, CASE_H + 0.05, 0.02);
  g.add(top);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(CASE_W + 0.06, 0.12, CASE_D + 0.04), wood);
  plinth.position.set(0, 0.06, 0.01);
  g.add(plinth);
  const base = new THREE.Color(color);
  const tints = [base.clone(), base.clone().offsetHSL(0, 0, -0.12), base.clone().offsetHSL(0.03, 0, 0.08), base.clone().offsetHSL(-0.03, -0.1, -0.05), new THREE.Color("#f4ead8"), new THREE.Color("#3a3f55")];
  const bookGeo = new THREE.BoxGeometry(1, 1, 1);
  let pull: THREE.Mesh | null = null;
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < SHELVES; k++) {
    const y = 0.12 + k * ((CASE_H - 0.2) / SHELVES);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(CASE_W, 0.04, CASE_D - 0.02), wood);
    shelf.position.set(0, y, 0);
    g.add(shelf);
    let x = -CASE_W / 2 + 0.06;
    const gap = (CASE_H - 0.2) / SHELVES - 0.06;
    while (x < CASE_W / 2 - 0.12) {
      const w = 0.05 + rnd() * 0.07;
      const h = gap * (0.62 + rnd() * 0.32);
      const tilt = rnd() < 0.08 && x > -CASE_W / 2 + 0.3 ? 0.18 : 0;
      const c = tints[Math.floor(rnd() * tints.length)];
      const book = new THREE.Mesh(bookGeo, std(c, 0.65));
      book.scale.set(w, h, CASE_D * (0.62 + rnd() * 0.18));
      book.position.set(x + w / 2, y + 0.02 + h / 2, 0.02);
      book.rotation.z = tilt;
      book.castShadow = true;
      g.add(book);
      // proužek na hřbetu
      if (rnd() < 0.55) {
        // kniha je škálovaná, proužek proto v jejích jednotkách: šířka celá, výška 1,8 cm, těsně před hřbetem
        const band = new THREE.Mesh(bookGeo, std("#ffd24d", 0.3, 0.6));
        band.scale.set(1.01, 0.018 / h, 0.02);
        band.position.set(0, 0.3 - rnd() * 0.6, 0.5);
        book.add(band);
      }
      if (!pull && k === 2 && x > -0.1) pull = book;
      x += w + (rnd() < 0.12 ? 0.04 : 0.006);
    }
    // na horní polici i ležící kniha a drobnost
    if (k === SHELVES - 1) {
      const lying = new THREE.Mesh(bookGeo, std(tints[2], 0.6));
      lying.scale.set(0.32, 0.06, 0.24);
      lying.position.set(CASE_W / 2 - 0.25, y + 0.05, 0);
      g.add(lying);
    }
  }
  g.traverse((o) => ((o as THREE.Mesh).receiveShadow = true));
  return { g, pull: pull as THREE.Mesh | null };
}

export function createLibrary3D(container: HTMLElement, subjects: LibrarySubject[], onOpen: (slug: string) => void): LibraryHandle | null {
  const stage = createStage(container);
  if (!stage) return null;
  const { renderer } = stage;
  const scene = new THREE.Scene();
  scene.environment = stage.env;
  scene.environmentIntensity = 0.35;
  scene.background = new THREE.Color("#2a1e18");
  scene.fog = new THREE.Fog("#2a1e18", 18, 34);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);

  // ---- místnost
  const n = subjects.length;
  const back = Math.ceil(n * 0.4);
  const sideN = Math.ceil((n - back) / 2);
  const W = Math.max(8, back * (CASE_W + 0.12) + 1.2);
  const D = Math.max(7, sideN * (CASE_W + 0.12) + 2.4);
  const H = 4.2;
  const floorTex = canvasTex(
    256,
    256,
    (g) => {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? "#9a6a42" : "#a8744a";
        g.fillRect(0, i * 32, 256, 32);
        g.fillStyle = "#6a4426";
        g.fillRect(0, i * 32, 256, 2);
        g.fillRect(((i * 73) % 200) + 20, i * 32, 2, 32);
      }
    },
    [W / 2, D / 2],
  );
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D + 6), std("#ffffff", 0.8, 0, { map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 1;
  floor.receiveShadow = true;
  scene.add(floor);
  const wallMat = std("#e8d8c0", 0.95);
  const wall = (w: number, h: number, x: number, z: number, ry: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    m.position.set(x, h / 2, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    scene.add(m);
    const skirting = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.04), std("#6a4426", 0.8));
    skirting.position.set(x, 0.08, z);
    skirting.rotation.y = ry;
    skirting.translateZ(0.02);
    scene.add(skirting);
  };
  wall(W, H, 0, -D / 2, 0);
  wall(D + 6, H, -W / 2, 1, Math.PI / 2);
  wall(D + 6, H, W / 2, 1, -Math.PI / 2);
  // strop s trámy
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D + 6), std("#f4e8d4", 0.95));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, H, 1);
  scene.add(ceil);
  const beamMat = std("#6a4426", 0.85);
  for (let z = -D / 2 + 0.8; z < D / 2 + 3; z += 1.6) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.22, 0.24), beamMat);
    beam.position.set(0, H - 0.11, z);
    scene.add(beam);
  }
  // okno nad knihovnami se světlem
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.9),
    new THREE.MeshBasicMaterial({
      map: canvasTex(128, 48, (g) => {
        const gr = g.createLinearGradient(0, 0, 0, 48);
        gr.addColorStop(0, "#9fd8ff");
        gr.addColorStop(1, "#ffe8b8");
        g.fillStyle = gr;
        g.fillRect(0, 0, 128, 48);
        g.fillStyle = "#6a4426";
        for (const x of [0, 42, 85, 125]) g.fillRect(x, 0, 3, 48);
        g.fillRect(0, 22, 128, 3);
      }),
    }),
  );
  win.position.set(0, CASE_H + 0.95, -D / 2 + 0.01);
  scene.add(win);

  // ---- světla
  scene.add(new THREE.HemisphereLight("#ffe8c8", "#4a3020", 0.9));
  const sun = new THREE.DirectionalLight("#ffe8c0", 1.6);
  sun.position.set(3, 8, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -W / 2, right: W / 2, top: D / 2 + 2, bottom: -D / 2 - 2 });
  scene.add(sun, sun.target);
  for (const x of [-W / 4, W / 4]) {
    const lamp = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 4), std("#2a2a2a", 0.8));
    cord.position.y = 0.5;
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 20, 1, true), std("#2e6a4a", 0.6, 0, { side: THREE.DoubleSide }));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), std("#fff2c8", 0.3, 0, { emissive: "#ffe0a0", emissiveIntensity: 2 }));
    bulb.position.y = -0.1;
    lamp.add(cord, shade, bulb);
    const light = new THREE.PointLight("#ffd8a0", 10, 9, 1.6);
    light.position.y = -0.2;
    lamp.add(light);
    lamp.position.set(x, H - 1, 0.5);
    scene.add(lamp);
  }

  // ---- knihovny
  const wood = std("#ffffff", 0.75, 0, { map: woodTex("#8a5a34", "#5a3a20") });
  const cases: { slug: string; g: THREE.Group; pull: THREE.Mesh | null; glow: THREE.Mesh; out: number }[] = [];
  subjects.forEach((s, i) => {
    const { g, pull } = bookcase(s.color, wood, i * 977 + 13);
    let x = 0;
    let z = 0;
    let ry = 0;
    if (i < sideN) {
      // levá stěna
      x = -W / 2 + CASE_D / 2 + 0.05;
      z = -D / 2 + 1.4 + i * (CASE_W + 0.12) + CASE_W / 2;
      ry = Math.PI / 2;
    } else if (i < sideN + back) {
      const k = i - sideN;
      x = -((back - 1) * (CASE_W + 0.12)) / 2 + k * (CASE_W + 0.12);
      z = -D / 2 + CASE_D / 2 + 0.05;
    } else {
      const k = i - sideN - back;
      x = W / 2 - CASE_D / 2 - 0.05;
      z = -D / 2 + 1.4 + k * (CASE_W + 0.12) + CASE_W / 2;
      ry = -Math.PI / 2;
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    g.userData.slug = s.slug;
    // záře za knihovnou při najetí
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(CASE_W + 0.6, CASE_H + 0.5), new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.set(0, CASE_H / 2, -CASE_D / 2 - 0.02);
    g.add(glow);
    scene.add(g);
    cases.push({ slug: s.slug, g, pull, glow, out: 0 });
  });

  // ---- zařízení: koberec, stůl s glóbem a lampou, křesla, rostliny, žebřík
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 48),
    std("#ffffff", 0.95, 0, {
      map: canvasTex(256, 256, (g) => {
        for (let r = 128; r > 0; r -= 16) {
          g.fillStyle = ["#b8392b", "#e8b84a", "#2e5aa8", "#f4ead8"][(r / 16) % 4];
          g.beginPath();
          g.arc(128, 128, r, 0, Math.PI * 2);
          g.fill();
        }
      }),
    }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, 0.6);
  rug.receiveShadow = true;
  scene.add(rug);
  const desk = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.0), wood);
  top.position.y = 0.78;
  desk.add(top);
  for (const [dx, dz] of [[-1, -0.42], [1, -0.42], [-1, 0.42], [1, 0.42]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.76, 0.08), wood);
    leg.position.set(dx, 0.38, dz);
    desk.add(leg);
  }
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 16),
    std("#ffffff", 0.5, 0, {
      map: canvasTex(128, 64, (g) => {
        g.fillStyle = "#3a8ad8";
        g.fillRect(0, 0, 128, 64);
        g.fillStyle = "#5ab85e";
        for (const [x, y, rx, ry] of [[22, 22, 14, 10], [40, 42, 8, 12], [70, 20, 18, 9], [76, 40, 8, 10], [104, 46, 9, 6]]) {
          g.beginPath();
          g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
          g.fill();
        }
      }),
    }),
  );
  globe.position.set(-0.6, 1.1, 0);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.12, 0.12, 12), std("#c8a050", 0.3, 0.8));
  stand.position.set(-0.6, 0.88, 0);
  const ringG = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.01, 6, 32, Math.PI), std("#c8a050", 0.3, 0.8));
  ringG.position.set(-0.6, 1.1, 0);
  ringG.rotation.z = Math.PI / 2;
  desk.add(globe, stand, ringG);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16), std("#2e6a4a", 0.4, 0.4));
  lampBase.position.set(0.7, 0.84, -0.2);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), std("#c8a050", 0.3, 0.8));
  lampArm.position.set(0.7, 1.06, -0.2);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.16, 16, 1, true), std("#2e6a4a", 0.5, 0, { side: THREE.DoubleSide }));
  lampShade.position.set(0.7, 1.3, -0.2);
  const deskLight = new THREE.PointLight("#ffe0a0", 4, 4, 1.6);
  deskLight.position.set(0.7, 1.2, -0.2);
  const openBook = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.34), std("#f4ead8", 0.8));
  openBook.position.set(0.05, 0.84, 0.1);
  openBook.rotation.y = 0.2;
  desk.add(lampBase, lampArm, lampShade, deskLight, openBook);
  desk.position.set(0, 0, 1.0);
  desk.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  scene.add(desk);
  const chair = (x: number, z: number, ry: number, c: string) => {
    const ch = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 0.75), std(c, 0.85));
    seat.position.y = 0.35;
    const backR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.18), std(c, 0.85));
    backR.position.set(0, 0.75, -0.3);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.75), std(c, 0.85));
    armL.position.set(-0.38, 0.6, 0);
    const armR = armL.clone();
    armR.position.x = 0.38;
    ch.add(seat, backR, armL, armR);
    ch.position.set(x, 0, z);
    ch.rotation.y = ry;
    ch.traverse((o) => ((o as THREE.Mesh).castShadow = true));
    scene.add(ch);
  };
  chair(-2.1, 2.2, 0.7, "#b8392b");
  chair(2.1, 2.2, -0.7, "#2e5aa8");
  for (const [x, z] of [[-W / 2 + 0.6, D / 2 - 0.4], [W / 2 - 0.6, D / 2 - 0.4]]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 14), std("#c8743a", 0.8));
    pot.position.set(x, 0.25, z);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), std("#3f9a4a", 0.8));
    leaves.position.set(x, 1.0, z);
    leaves.scale.y = 1.3;
    pot.castShadow = leaves.castShadow = true;
    scene.add(pot, leaves);
  }
  const dust = glowSprite("rgba(255,236,190,0.35)", 6);
  dust.position.set(0, CASE_H + 0.4, -D / 2 + 1.5);
  scene.add(dust);

  // ---- kamera a ovládání
  const cam = { theta: 0, phi: 0.2, dist: D * 0.95 + 2, target: new THREE.Vector3(0, 1.5, -D / 4) };
  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 70 : 46;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const el = renderer.domElement;
  el.style.cursor = "grab";
  el.style.touchAction = "pan-y";
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered: string | null = null;
  const pick = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const h of ray.intersectObjects(cases.map((c) => c.g), true)) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.slug) o = o.parent;
      if (o) return o.userData.slug as string;
    }
    return null;
  };
  let drag: { x: number; moved: number } | null = null;
  const onDown = (e: PointerEvent) => (drag = { x: e.clientX, moved: 0 });
  const onMove = (e: PointerEvent) => {
    if (drag && e.buttons) {
      const dx = e.clientX - drag.x;
      drag.x = e.clientX;
      drag.moved += Math.abs(dx);
      cam.theta = THREE.MathUtils.clamp(cam.theta - dx * 0.004, -0.6, 0.6);
      return;
    }
    hovered = pick(e);
    el.style.cursor = hovered ? "pointer" : "grab";
  };
  const onUp = (e: PointerEvent) => {
    const click = drag && drag.moved < 6;
    drag = null;
    if (!click) return;
    const s = pick(e);
    if (s) onOpen(s);
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  let labelCb: ((items: LibraryLabel[]) => void) | null = null;
  const v = new THREE.Vector3();
  let last = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden) return;
    for (const c of cases) {
      const want = c.slug === hovered ? 1 : 0;
      c.out += (want - c.out) * Math.min(1, dt * 8);
      if (c.pull) c.pull.position.z = 0.02 + 0.22 * c.out;
      (c.glow.material as THREE.MeshBasicMaterial).opacity = 0.35 * c.out;
    }
    globe.rotation.y += dt * 0.4;
    camera.position.set(cam.target.x + Math.sin(cam.theta) * cam.dist * Math.cos(cam.phi), cam.target.y + Math.sin(cam.phi) * cam.dist, cam.target.z + Math.cos(cam.theta) * cam.dist * Math.cos(cam.phi));
    camera.lookAt(cam.target);
    renderer.render(scene, camera);
    if (labelCb) {
      const r = el.getBoundingClientRect();
      labelCb(
        cases.map((c) => {
          // cedulky střídavě ve dvou výškách, ať se na úzkých stěnách nepřekrývají
          c.g.localToWorld(v.set(0, CASE_H + (cases.indexOf(c) % 2 ? 0.75 : 0.3), 0.1));
          v.project(camera);
          return { slug: c.slug, x: ((v.x + 1) / 2) * r.width, y: ((1 - v.y) / 2) * r.height, visible: v.z < 1 };
        }),
      );
    }
  };
  raf = requestAnimationFrame(frame);
  requestAnimationFrame(() => (stage.el.style.opacity = "1"));

  return {
    labels(cb) {
      labelCb = cb;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      stage.dispose([scene]);
    },
  };
}
