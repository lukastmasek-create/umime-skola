import * as THREE from "three";
import { sfx } from "@/lib/market-sfx";
import { canvasTex, clamp01, createStage, lerp, overlayFx, smooth, std, type Figure } from "./kit";
import { ease, forestTrees, glowSprite, gradientSky, ground, hero, noiseTex, placeModel, rand, sparklePoints, sunLight, walk, waterMat, type P3 } from "./scenery";

// 3D cut scény vstupu do světů z městečka (náhrada 2D přechodu runWorld): Kouzelný les, Hrad a Podmořské město.
// Velké stavby jsou detailní modely z Blenderu (public/mestecko3d: strom, hrad-scena, podmorske), okolí, voda,
// částice a pohyblivé díly (padací most, mříž, ponorka, portál ve dveřích) se staví tady.

export type FilmOpts = { look: number; onEnd: () => void };
export type Handle = { stop: () => void; skip: () => void };

type Ctx = { scene: THREE.Scene; camera: THREE.PerspectiveCamera; look: THREE.Vector3; renderer: THREE.WebGLRenderer };
type Film = {
  end: number;
  cues: [number, () => void][];
  loads: Promise<unknown>[];
  sky?: THREE.Object3D;
  frame: (t: number, dt: number) => void;
};


// ------------------------------------------------------------------------------------------ společný běh
function runFilm(container: HTMLElement, opts: FilmOpts, build: (ctx: Ctx) => Film): Handle {
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
  scene.environmentIntensity = 0.4;
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1400);
  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 62 : 42;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const look = new THREE.Vector3();
  const film = build({ scene, camera, look, renderer });

  let t0 = 0;
  let last = 0;
  let fired = 0;
  const frame = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    const seek = (window as { __seek3d?: number }).__seek3d;
    const t = seek ?? (now - t0) / 1000;
    const dt = seek !== undefined ? 1 / 30 : Math.min(0.05, (now - last) / 1000);
    last = now;
    while (fired < film.cues.length && t >= film.cues[fired][0]) film.cues[fired++][1]();
    fx.bars(t < film.end - 0.3);
    film.frame(t, dt);
    camera.lookAt(look);
    film.sky?.position.copy(camera.position);
    fx.flash(smooth(t, film.end - 0.75, film.end));
    renderer.render(scene, camera);
    if (t >= film.end && seek === undefined) {
      cancelAnimationFrame(raf);
      finish();
    }
  };
  film.cues.sort((a, b) => a[0] - b[0]);
  // modely nejvýš 3 s, pak se začne i bez chybějících
  void Promise.race([Promise.all(film.loads).catch(() => {}), new Promise((r) => window.setTimeout(r, 3000))]).then(() => {
    if (stopped) return;
    film.frame(0, 0);
    camera.lookAt(look);
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

// ====================================================================================== Kouzelný les
// Hrdina jde večerním lesem mezi svítícími houbami k obřímu stromu, víly ho doprovodí ke kulatým dveřím,
// ve dveřích se roztočí kouzelný portál a kamera do něj vletí.
export function runForest3D(container: HTMLElement, opts: FilmOpts): Handle {
  return runFilm(container, opts, ({ scene, camera, look }) => {
    const S = 1.25; // měřítko stromu
    const DOOR: P3 = [0, 1.3 * S, 2.45 * S + 0.06];
    const sky = gradientSky([
      ["#120f38", 0],
      ["#2e3a86", 0.5],
      ["#6aa6c0", 0.78],
      ["#2a4a52", 1],
    ]);
    scene.add(sky);
    scene.fog = new THREE.FogExp2("#26365e", 0.024);
    scene.add(new THREE.HemisphereLight("#9ab8ff", "#1a3a2a", 1.0));
    sunLight(scene, "#c8d8ff", 1.5, [-12, 20, 10]);
    const doorLight = new THREE.PointLight("#ffc46b", 0, 14, 1.6);
    doorLight.position.set(DOOR[0], DOOR[1], DOOR[2] + 1.2);
    scene.add(doorLight);
    for (const [x, z, c] of [[-4.5, 6, "#ff6fd8"], [4, 9, "#6ff0ff"], [-2.5, 15, "#b88cff"]] as const) {
      const l = new THREE.PointLight(c, 9, 10, 1.6);
      l.position.set(x, 0.8, z);
      scene.add(l);
    }
    scene.add(ground(noiseTex("#2f5a34", ["#24482a", "#3d6e3a", "#1d3b24", "#4a7a40"], 2200)));

    // cesta s kameny k stromu
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(4.5, 0, 30), new THREE.Vector3(2.8, 0, 18), new THREE.Vector3(0.9, 0, 10), new THREE.Vector3(0, 0, 4.4)]);
    const pts = curve.getSpacedPoints(60);
    const pathGeo = new THREE.BufferGeometry();
    const pos: number[] = [];
    const idx: number[] = [];
    pts.forEach((p, i) => {
      const n = pts[Math.min(i + 1, pts.length - 1)].clone().sub(pts[Math.max(i - 1, 0)]).normalize();
      const side = new THREE.Vector3(-n.z, 0, n.x).multiplyScalar(0.95 + 0.15 * Math.sin(i * 1.7));
      pos.push(p.x + side.x, 0.015, p.z + side.z, p.x - side.x, 0.015, p.z - side.z);
      if (i) idx.push((i - 1) * 2, i * 2, (i - 1) * 2 + 1, i * 2, i * 2 + 1, (i - 1) * 2 + 1);
    });
    pathGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    pathGeo.setIndex(idx);
    pathGeo.computeVertexNormals();
    const path = new THREE.Mesh(pathGeo, std("#8a6a48", 1));
    path.receiveShadow = true;
    scene.add(path);
    const stones = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 9), std("#b8b0a0", 0.9), 26);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 26; i++) {
      const p = curve.getPointAt(0.04 + (i / 26) * 0.92);
      m4.makeTranslation(p.x + (i % 2 ? 0.28 : -0.28), 0.04, p.z);
      stones.setMatrixAt(i, m4);
    }
    stones.receiveShadow = true;
    scene.add(stones);
    const nearPath = (x: number, z: number, d: number) => pts.some((p) => Math.hypot(p.x - x, p.z - z) < d);

    // les kolem mýtiny
    const spots: { x: number; z: number; s: number }[] = [];
    while (spots.length < 170) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(11, 70);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // volno pro cestu a úvodní záběr kamery
      if (nearPath(x, z, 4.5) || (z > 24 && x > -16 && x < 13)) continue;
      spots.push({ x, z, s: rand(1.1, 2.4) });
    }
    scene.add(forestTrees(spots, "pine", ["#1f5a3a", "#2a6a42", "#174a32", "#2f7a4a"]));
    // keře a svítící houby
    const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7, 1), std("#2f6a3a", 0.9), 70);
    const col = new THREE.Color();
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(6, 26);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const s = nearPath(x, z, 2.2) ? 0 : rand(0.6, 1.4);
      m4.compose(new THREE.Vector3(x, 0.35 * s, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.75, s));
      bush.setMatrixAt(i, m4);
      bush.setColorAt(i, col.set(["#2f6a3a", "#3a7a42", "#285a34"][i % 3]));
    }
    bush.castShadow = true;
    scene.add(bush);
    const mushColors = ["#ff6fd8", "#6ff0ff", "#b88cff"];
    mushColors.forEach((c, ci) => {
      const n = 16;
      const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), std("#f4ead8", 0.7), n);
      const caps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), std(c, 0.5, 0, { emissive: c, emissiveIntensity: 0.55 }), n);
      for (let i = 0; i < n; i++) {
        const p = curve.getPointAt(clamp01(((i * 3 + ci) / (n * 3)) * 0.95));
        const side = (i + ci) % 2 ? 1 : -1;
        const x = p.x + side * rand(1.3, 2.4);
        const z = p.z + rand(-0.5, 0.5);
        const s = rand(0.7, 1.6);
        m4.compose(new THREE.Vector3(x, 0.15 * s, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
        stems.setMatrixAt(i, m4);
        m4.compose(new THREE.Vector3(x, 0.28 * s, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
        caps.setMatrixAt(i, m4);
      }
      scene.add(stems, caps);
    });

    // obří strom a portál ve dveřích
    const loads: Promise<unknown>[] = [];
    loads.push(
      placeModel("strom").then((m) => {
        m.scale.setScalar(S);
        scene.add(m);
      }),
    );
    const portalMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uOpen: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; uniform float uOpen; varying vec2 vUv;
        void main(){
          vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
          float sw = sin(a * 5.0 + r * 12.0 - uTime * 5.0);
          vec3 col = mix(vec3(1.0, 0.8, 0.35), vec3(0.55, 0.35, 1.0), 0.5 + 0.5 * sw);
          col = mix(col, vec3(1.0, 0.95, 0.8), smoothstep(0.3, 0.0, r) * uOpen * 0.7);
          col *= 0.75 + 0.35 * sin(r * 20.0 - uTime * 6.0) * 0.5 + 0.2;
          float alpha = uOpen * smoothstep(1.0, 0.86, r);
          gl_FragColor = vec4(col * (0.8 + 0.4 * uOpen), alpha);
          #include <colorspace_fragment>
        }`,
    });
    const portal = new THREE.Mesh(new THREE.CircleGeometry(1.05 * S, 48), portalMat);
    portal.position.set(...DOOR);
    scene.add(portal);
    const portalGlow = glowSprite("rgba(255,214,140,0.9)", 6);
    portalGlow.position.set(DOOR[0], DOOR[1], DOOR[2] + 0.3);
    scene.add(portalGlow);

    // světlušky, víly a jiskry do portálu
    const flies = sparklePoints(240, ["#fff59a", "#c8ff9a", "#ffe08a"], 0.22);
    const flyBase = Array.from({ length: 240 }, () => [rand(-26, 26), rand(0.3, 6), rand(-14, 34), Math.random() * 6] as const);
    scene.add(flies);
    const fairies = ["#ffb8f0", "#a8f0ff", "#fff59a"].map((c, i) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), std(c, 0.3, 0, { emissive: c, emissiveIntensity: 3 })));
      g.add(glowSprite(c, 1.3));
      const wingMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
      const wings = [-1, 1].map((s) => {
        const w = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), wingMat);
        w.scale.set(1, 0.6, 1);
        const pivot = new THREE.Group();
        w.position.x = s * 0.15;
        pivot.add(w);
        g.add(pivot);
        return pivot;
      });
      const light = new THREE.PointLight(c, 3, 6, 1.6);
      g.add(light);
      scene.add(g);
      return { g, wings, ph: (i * Math.PI * 2) / 3 };
    });
    const swirl = sparklePoints(160, ["#fff1a8", "#ffb8f0", "#b8a8ff"], 0.16);
    scene.add(swirl);

    let f: Figure | null = null;
    loads.push(
      hero(opts.look).then((h) => {
        f = h;
        scene.add(h.root);
      }),
    );
    const HP: P3[] = [
      [4.5, 0, 30],
      [2.8, 0, 18],
      [0.9, 0, 10],
      [0, 0, 4.9],
    ];
    const HT = [0.4, 2.6, 4.2, 5.6];
    const T = { fairies: [5.4, 7.2], open: [7.0, 8.4], enter: [9.0, 10.2], end: 11.2 };
    const flyPos = flies.geometry.attributes.position as THREE.BufferAttribute;
    const swPos = swirl.geometry.attributes.position as THREE.BufferAttribute;

    return {
      end: T.end,
      sky,
      loads,
      cues: [
        [0.2, () => sfx.whoosh(1.0)],
        [T.fairies[0], () => sfx.pop()],
        [T.open[0], () => sfx.standUp(1.4)],
        [T.open[1], () => sfx.dock()],
        [T.enter[0] + 0.4, () => sfx.whoosh(1.6)],
      ],
      frame(t, dt) {
        portalMat.uniforms.uTime.value = t;
        const open = smooth(t, T.open[0], T.open[1]);
        portalMat.uniforms.uOpen.value = open;
        portalGlow.material.opacity = open * 0.45;
        portalGlow.scale.setScalar(4 + open * 2 + Math.sin(t * 3) * 0.3 * open);
        doorLight.intensity = open * 8;
        // světlušky poletují
        for (let i = 0; i < flyBase.length; i++) {
          const [x, y, z, ph] = flyBase[i];
          flyPos.setXYZ(i, x + Math.sin(t * 0.6 + ph) * 0.8, y + Math.sin(t * 1.3 + ph * 2) * 0.4, z + Math.cos(t * 0.5 + ph) * 0.8);
        }
        flyPos.needsUpdate = true;
        (flies.material as THREE.PointsMaterial).opacity = 0.6 + 0.4 * Math.sin(t * 2.3);
        // víly: krouží kolem koruny, pak se slétnou ke dveřím
        const fk = ease(smooth(t, T.fairies[0], T.fairies[1]));
        fairies.forEach((fa, i) => {
          const a = t * 0.9 + fa.ph;
          const far = new THREE.Vector3(Math.cos(a) * 5.2, 5 + Math.sin(t * 1.4 + i) * 0.7, Math.sin(a) * 5.2 + 1);
          const b = t * 2.4 + fa.ph;
          const near = new THREE.Vector3(DOOR[0] + Math.cos(b) * 1.7, DOOR[1] + Math.sin(b) * 1.5, DOOR[2] + 0.6);
          fa.g.position.lerpVectors(far, near, fk);
          const flap = Math.sin(t * 28 + i) * 0.9;
          fa.wings[0].rotation.y = flap;
          fa.wings[1].rotation.y = -flap;
          fa.g.lookAt(camera.position);
        });
        // jiskry se stáčejí do portálu
        for (let i = 0; i < 160; i++) {
          const life = ((t * 0.6 + i / 160) % 1 + 1) % 1;
          const r = (1 - life) * 3.2 * S;
          const a = i * 2.39996 + life * 8;
          swPos.setXYZ(i, DOOR[0] + Math.cos(a) * r, DOOR[1] + Math.sin(a) * r * 0.9, DOOR[2] + 0.2 + (1 - life) * 1.5);
        }
        swPos.needsUpdate = true;
        (swirl.material as THREE.PointsMaterial).opacity = open;
        // hrdina
        if (f) {
          if (t < T.enter[0]) walk(f, HP, HT, t, t > T.open[1] ? "radost" : "stoji");
          else walk(f, [[0, 0, 4.9], [0, 0.3, 3.9], [0, 0.3, 3.2]], [T.enter[0], T.enter[0] + 0.6, T.enter[1]], t, "chuze");
          if (t > HT[3] && t < T.enter[0]) f.root.rotation.y = Math.PI / 2;
          f.update(dt);
        }
        // kamera
        const hp = f ? f.root.position : new THREE.Vector3(...HP[0]);
        if (t < 2.4) {
          const k = ease(t / 2.4);
          camera.position.set(lerp(-10, -5, k), lerp(9, 4.2, k), lerp(34, 30, k));
          look.set(lerp(0, hp.x, k), lerp(7, 1.6, k), lerp(0, hp.z - 4, k));
        } else if (t < HT[3]) {
          camera.position.set(hp.x + 2.4, 2.3, hp.z + 5.6);
          look.set(hp.x * 0.5, 2.2, hp.z - 6);
        } else if (t < T.open[0] + 0.4) {
          const k = ease(clamp01((t - HT[3]) / (T.open[0] + 0.4 - HT[3])));
          const a = lerp(0.75, 0.2, k);
          camera.position.set(Math.sin(a) * 13, lerp(3.2, 2.4, k), Math.cos(a) * 13);
          look.set(0, lerp(6.5, 3.2, k), 0);
        } else if (t < T.enter[0]) {
          const k = ease(clamp01((t - T.open[0] - 0.4) / (T.enter[0] - T.open[0] - 0.4)));
          camera.position.set(lerp(3.2, 1.6, k), lerp(1.8, 1.7, k), lerp(8.8, 7.2, k));
          look.set(0, 1.6, DOOR[2]);
        } else {
          const k = ease(clamp01((t - T.enter[0]) / (T.end - T.enter[0])));
          camera.position.set(lerp(1.6, 0, k), lerp(1.7, DOOR[1], k), lerp(7.2, DOOR[2] + 0.4, k));
          look.set(0, DOOR[1], DOOR[2] - 2);
        }
      },
    };
  });
}

// ============================================================================================ Hrad
// Hrdina přijde po cestě s prapory k hradu, spustí se padací most přes příkop, zvedne se mříž, zazní fanfára,
// vybuchnou konfety a hrdina vejde bránou.
export function runCastle3D(container: HTMLElement, opts: FilmOpts): Handle {
  return runFilm(container, opts, ({ scene, camera, look, renderer }) => {
    renderer.localClippingEnabled = true;
    const sky = gradientSky([
      ["#3f8fe8", 0],
      ["#8cc8ff", 0.45],
      ["#e4f4ff", 0.72],
      ["#a8c890", 1],
    ]);
    scene.add(sky);
    scene.fog = new THREE.Fog("#dcefff", 70, 260);
    scene.add(new THREE.HemisphereLight("#e0f0ff", "#6a8a4a", 1.0));
    sunLight(scene, "#fff2d6", 2.7, [14, 22, 18], 22);
    scene.add(ground(noiseTex("#6aa84a", ["#5a9a40", "#7ab85a", "#4e8a3a", "#88c060"], 2400)));
    // kopce v dálce
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * 0.9 + (i / 9) * Math.PI * 0.8 - 0.3;
      const h = new THREE.Mesh(new THREE.SphereGeometry(rand(26, 44), 24, 12), std(["#6aa84a", "#5a9a42", "#78b452"][i % 3], 1));
      h.scale.y = rand(0.22, 0.38);
      h.position.set(Math.cos(a) * rand(110, 150), -2, Math.sin(a) * rand(110, 150));
      scene.add(h);
    }
    // cesta k bráně
    const road = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 60), std("#ffffff", 0.95, 0, { map: noiseTex("#d8c8a0", ["#c8b890", "#e8d8b0", "#b8a880"], 500, 128, 1, [2, 6]) }));
    (road.material as THREE.MeshStandardMaterial).map!.repeat.set(1, 12);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.012, 40.2);
    road.receiveShadow = true;
    scene.add(road);
    const trees: { x: number; z: number; s: number }[] = [];
    while (trees.length < 90) {
      const x = rand(-80, 80);
      const z = rand(-40, 90);
      if (Math.abs(x) < 6 && z > 8) continue;
      if (Math.abs(x) < 17 && z < 13 && z > -12) continue;
      trees.push({ x, z, s: rand(0.9, 1.7) });
    }
    scene.add(forestTrees(trees, "round", ["#3f9a4a", "#4eaa58", "#2f8a42", "#5ab85e"]));

    // příkop s vodou a kamennou obrubou
    const water = waterMat("#2a78b8", "#5ab8e8");
    const strips: [number, number, number, number][] = [
      [-15, 15, 6.6, 9.8],
      [-15, -11.8, -8, 6.6],
      [11.8, 15, -8, 6.6],
    ];
    const stone = std("#a8a094", 0.9);
    for (const [x0, x1, z0, z1] of strips) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), water);
      w.rotation.x = -Math.PI / 2;
      w.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2);
      scene.add(w);
    }
    for (const [x, z, w, d] of [[0, 9.95, 30.6, 0.35], [0, 6.45, 23.6, 0.35], [-15.15, 1, 0.35, 18.3], [15.15, 1, 0.35, 18.3], [-11.65, -0.7, 0.35, 14.6], [11.65, -0.7, 0.35, 14.6]] as const) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), stone);
      b.position.set(x, 0.14, z);
      b.castShadow = b.receiveShadow = true;
      scene.add(b);
    }

    const loads: Promise<unknown>[] = [placeModel("hrad-scena").then((m) => scene.add(m))];
    // světlo z nádvoří za bránou
    const inner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 3.8),
      new THREE.MeshBasicMaterial({
        map: canvasTex(64, 96, (g) => {
          const gr = g.createRadialGradient(32, 70, 4, 32, 60, 60);
          gr.addColorStop(0, "#fff6c8");
          gr.addColorStop(0.5, "#ffc860");
          gr.addColorStop(1, "#6a4a20");
          g.fillStyle = gr;
          g.fillRect(0, 0, 64, 96);
        }),
        transparent: true,
        opacity: 0,
      }),
    );
    inner.position.set(0, 1.9, 5.47);
    scene.add(inner);
    // mříž (ořízne se nad bránou)
    const clip = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 4.05)];
    const iron = std("#4a4e5c", 0.4, 0.8, { clippingPlanes: clip });
    const gate = new THREE.Group();
    for (let k = 0; k < 7; k++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.9, 0.09), iron);
      bar.position.set(-1.2 + k * 0.4, 0, 0);
      gate.add(bar);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), iron);
      tip.position.set(-1.2 + k * 0.4, -2.05, 0);
      tip.rotation.x = Math.PI;
      gate.add(tip);
    }
    for (let k = 0; k < 5; k++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.07), iron);
      bar.position.set(0, -1.4 + k * 0.75, 0.02);
      gate.add(bar);
    }
    gate.position.set(0, 2.0, 5.52);
    gate.traverse((o) => (o.castShadow = true));
    scene.add(gate);
    // padací most na pantech
    const bridge = new THREE.Group();
    bridge.position.set(0, 0.3, 5.75);
    const wood = std("#8a5a34", 0.85);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 4.6), wood);
    deck.position.set(0, 0, 2.3);
    bridge.add(deck);
    for (let k = 0; k < 11; k++) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(3.02, 0.21, 0.03), std("#5a3a20", 0.9));
      seam.position.set(0, 0.005, 0.2 + k * 0.42);
      bridge.add(seam);
    }
    for (const x of [-1.1, 1.1]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 4.6), std("#4a4e5c", 0.4, 0.8));
      band.position.set(x, 0.01, 2.3);
      bridge.add(band);
    }
    bridge.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    scene.add(bridge);
    const chainMat = std("#3a3e4a", 0.4, 0.85);
    const chains = [-1.35, 1.35].map((x) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 6), chainMat);
      scene.add(c);
      return { c, x };
    });
    const up = new THREE.Vector3(0, 1, 0);
    const setChain = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
      const d = b.clone().sub(a);
      m.position.copy(a).addScaledVector(d, 0.5);
      m.scale.set(1, d.length(), 1);
      m.quaternion.setFromUnitVectors(up, d.normalize());
    };
    // prapory podél cesty
    const flags = [12, 17, 22].flatMap((z, i) =>
      [-3, 3].map((x, j) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 4.2, 8), std("#6a4a2a", 0.7));
        pole.position.set(x, 2.1, z);
        pole.castShadow = true;
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), std("#ffd24d", 0.3, 0.7));
        knob.position.set(x, 4.25, z);
        const c = (i + j) % 2 ? "#2e5aa8" : "#c0392b";
        const tex = canvasTex(64, 48, (g) => {
          g.fillStyle = c;
          g.fillRect(0, 0, 64, 48);
          g.fillStyle = "#ffd24d";
          g.beginPath();
          g.arc(32, 24, 11, 0, Math.PI * 2);
          g.fill();
          g.fillRect(0, 0, 64, 5);
          g.fillRect(0, 43, 64, 5);
        });
        const geo = new THREE.PlaneGeometry(1.3, 0.9, 12, 4);
        const flag = new THREE.Mesh(geo, std("#ffffff", 0.7, 0, { map: tex, side: THREE.DoubleSide }));
        flag.position.set(x + (x < 0 ? -0.66 : 0.66), 3.6, z);
        flag.castShadow = true;
        scene.add(pole, knob, flag);
        return { geo, base: Float32Array.from(geo.attributes.position.array), side: x < 0 ? -1 : 1, ph: i + j };
      }),
    );
    // konfety
    const NC = 320;
    const confetti = sparklePoints(NC, ["#ff5d73", "#ffd24d", "#5ab8ff", "#7ed957", "#c08cff", "#ffffff"], 0.28);
    confetti.material.blending = THREE.NormalBlending;
    const cv = Array.from({ length: NC }, () => [rand(-1, 1) * 4, rand(5, 10), rand(1, 5), rand(-1.6, 1.6)] as const);
    scene.add(confetti);
    const cPos = confetti.geometry.attributes.position as THREE.BufferAttribute;

    let f: Figure | null = null;
    loads.push(
      hero(opts.look).then((h) => {
        f = h;
        scene.add(h.root);
      }),
    );
    const T = { arrive: 3.8, bridge: [3.7, 6.0], gate: [6.1, 7.3], party: 7.3, cross: [7.9, 10.2], end: 11.2 };
    const deckY = 0.42;
    return {
      end: T.end,
      sky,
      loads,
      cues: [
        [T.bridge[0], () => sfx.chain()],
        [T.bridge[1] - 0.15, () => sfx.clunk()],
        [T.gate[0], () => sfx.chain()],
        [T.party - 0.1, () => sfx.horn()],
        [T.party, () => sfx.pop()],
        [T.party + 0.25, () => sfx.pop()],
      ],
      frame(t, dt) {
        water.uniforms.uTime.value = t;
        // most: zvednutý svisle před bránou, spustí se s malým dopadem
        const bk = smooth(t, T.bridge[0], T.bridge[1]);
        const bounce = t > T.bridge[1] ? Math.exp(-(t - T.bridge[1]) * 7) * Math.sin((t - T.bridge[1]) * 30) * 0.03 : 0;
        bridge.rotation.x = -Math.PI / 2 + (Math.PI / 2) * (bk * bk) + bounce;
        for (const ch of chains) {
          const end = bridge.localToWorld(new THREE.Vector3(ch.x * 0.98, 0.1, 4.5));
          setChain(ch.c, new THREE.Vector3(ch.x, 4.7, 5.5), end);
        }
        const gk = ease(smooth(t, T.gate[0], T.gate[1]));
        gate.position.y = 2.0 + gk * 3.7;
        (inner.material as THREE.MeshBasicMaterial).opacity = gk;
        // prapory vlají
        for (const fl of flags) {
          const p = fl.geo.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < p.count; i++) {
            const x = fl.base[i * 3];
            const k = (x + 0.65) / 1.3;
            const kk = fl.side < 0 ? 1 - k : k;
            p.setZ(i, Math.sin(t * 5 + x * 4 * fl.side + fl.ph) * 0.14 * kk);
          }
          p.needsUpdate = true;
          fl.geo.computeVertexNormals();
        }
        // konfety z hradeb
        const ck = t - T.party;
        confetti.visible = ck > 0;
        if (ck > 0) {
          for (let i = 0; i < NC; i++) {
            const [vx, vy, vz, x0] = cv[i];
            cPos.setXYZ(i, x0 + vx * ck + Math.sin(ck * 6 + i) * 0.2, Math.max(0.05, 6.6 + vy * ck - 4.9 * ck * ck * 0.45), 5.6 + vz * ck);
          }
          cPos.needsUpdate = true;
        }
        // hrdina
        if (f) {
          if (t < T.cross[0]) walk(f, [[0, 0, 32], [0, 0, 11.4]], [0.3, T.arrive], t, t > T.party ? "radost" : "stoji");
          else walk(f, [[0, 0, 11.4], [0, deckY, 9.8], [0, deckY, 6.2], [0, deckY, 5.2]], [T.cross[0], T.cross[0] + 0.4, T.cross[1], T.cross[1] + 0.5], t, "chuze");
          f.update(dt);
        }
        // kamera
        const hz = f ? f.root.position.z : 30;
        if (t < 1.6) {
          const k = ease(t / 1.6);
          camera.position.set(lerp(-6, 1.8, k), lerp(16, 2.4, k), lerp(52, hz + 5.8, k));
          look.set(0, lerp(8, 3.0, k), lerp(0, 2, k));
        } else if (t < T.arrive) {
          camera.position.set(1.8, 2.4, hz + 5.8);
          look.set(0, 3.0, 2);
        } else if (t < T.gate[0]) {
          const k = ease(clamp01((t - T.arrive) / (T.gate[0] - T.arrive)));
          camera.position.set(lerp(10.5, 8.8, k), lerp(2.6, 2.2, k), lerp(13.5, 12.2, k));
          look.set(0, lerp(2.6, 2.0, k), 7.4);
        } else if (t < T.cross[0]) {
          const k = ease(clamp01((t - T.gate[0]) / (T.cross[0] - T.gate[0])));
          camera.position.set(lerp(-3.4, -2.2, k), lerp(1.0, 1.4, k), lerp(14, 14.6, k));
          look.set(0, lerp(3.6, 4.4, k), 5.5);
        } else {
          camera.position.set(0.7, 2.1, hz + 4.4);
          look.set(0, 1.9, hz - 3);
        }
      },
    };
  });
}

// ===================================================================================== Podmořské město
// Hrdina přejde po molu do žluté ponorky, poklop se zavře, ponorka se ponoří pod hladinu a pluje mezi rybami,
// řasami a korály k zářícím kopulím podmořského města.
function makeSub() {
  const g = new THREE.Group();
  const yellow = std("#ffc83a", 0.4, 0.15);
  const dark = std("#3a3f55", 0.4, 0.7);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 3.2, 10, 24), yellow);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  for (const x of [-1.1, 0.9]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.05, 8, 32), dark);
    band.rotation.y = Math.PI / 2;
    band.position.x = x;
    g.add(band);
  }
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.85, 20), yellow);
  tower.position.set(0.1, 1.2, 0);
  g.add(tower);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 24), dark);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0.1, 1.63, 0);
  g.add(rim);
  const hatch = new THREE.Group();
  hatch.position.set(-0.38, 1.66, 0);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.07, 20), dark);
  lid.position.set(0.48, 0, 0);
  hatch.add(lid);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 16), std("#ffd24d", 0.3, 0.7));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0.48, 0.06, 0);
  hatch.add(wheel);
  g.add(hatch);
  const peri = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), dark);
  peri.position.set(0.32, 1.95, 0.18);
  g.add(peri);
  const periTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.1), dark);
  periTop.position.set(0.42, 2.38, 0.18);
  g.add(periTop);
  const glass = std("#9ff0ff", 0.1, 0, { emissive: "#6fe8ff", emissiveIntensity: 1.2 });
  for (const z of [-0.93, 0.93])
    for (const x of [-0.8, 0.1, 1.0]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 20), dark);
      ring.position.set(x, 0.1, z);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.18, 20), glass);
      disc.position.set(x, 0.1, z + Math.sign(z) * 0.01);
      if (z < 0) disc.rotation.y = Math.PI;
      g.add(ring, disc);
    }
  for (const [rx, sz] of [[0, 1], [Math.PI / 2, 1]] as const) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 1.7 * sz), yellow);
    fin.position.set(-2.25, 0, 0);
    fin.rotation.x = rx;
    g.add(fin);
  }
  const prop = new THREE.Group();
  prop.position.set(-2.75, 0, 0);
  for (let k = 0; k < 3; k++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.16), dark);
    blade.position.y = 0.3;
    const piv = new THREE.Group();
    piv.rotation.x = (k * Math.PI * 2) / 3;
    blade.rotation.y = 0.5;
    piv.add(blade);
    prop.add(piv);
  }
  prop.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), dark));
  g.add(prop);
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), std("#fff6c8", 0.2, 0, { emissive: "#fff2b0", emissiveIntensity: 2 }));
  lamp.position.set(2.56, 0.15, 0);
  lamp.rotation.y = Math.PI / 2;
  g.add(lamp);
  const spot = new THREE.SpotLight("#fff2c8", 0, 30, 0.5, 0.5, 1.2);
  spot.position.set(2.6, 0.15, 0);
  spot.target.position.set(10, -2.5, 0);
  g.add(spot, spot.target);
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return { g, hatch, prop, spot };
}

export function runSea3D(container: HTMLElement, opts: FilmOpts): Handle {
  return runFilm(container, opts, ({ scene, camera, look }) => {
    const sky = gradientSky([
      ["#3a8ae8", 0],
      ["#8ccaff", 0.45],
      ["#dff4ff", 0.62],
      ["#1a6aa8", 1],
    ]);
    scene.add(sky);
    const fogUp = new THREE.Fog("#cfeaff", 60, 280);
    const fogDown = new THREE.FogExp2("#0b5a8a", 0.034);
    scene.add(new THREE.HemisphereLight("#d6ecff", "#1a5a7a", 1.1));
    sunLight(scene, "#fff0d6", 2.6, [8, 24, 10], 24);
    // hladina, dno a ostrůvek s molem
    const surf = waterMat("#1a7ac8", "#4cc0ee", 0.9, { up: "#cfeaff", near: 60, far: 280, down: "#0b5a8a", density: 0.034 });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), surf);
    sea.rotation.x = -Math.PI / 2;
    sea.renderOrder = 2;
    scene.add(sea);
    const sand = ground(noiseTex("#e8d4a0", ["#d8c490", "#f4e4b8", "#c8b480", "#b8a070"], 2600, 256, 30), 600);
    sand.position.y = -16;
    scene.add(sand);
    const isle = new THREE.Mesh(new THREE.SphereGeometry(7, 28, 14), std("#f0dca8", 1));
    isle.scale.y = 0.32;
    isle.position.set(-18, -0.9, 1);
    scene.add(isle);
    for (const [x, z, h] of [[-19, 0, 4.6], [-16.5, 3, 3.8]] as const) {
      const palm = new THREE.Group();
      for (let k = 0; k < 6; k++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - k * 0.012, 0.2 - k * 0.012, h / 6, 8), std("#8a6a42", 0.9));
        seg.position.set(k * 0.08, (k + 0.5) * (h / 6), 0);
        palm.add(seg);
      }
      for (let k = 0; k < 7; k++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 4), std("#3fa04a", 0.7));
        leaf.position.set(0.5, h, 0);
        leaf.rotation.set(0, (k / 7) * Math.PI * 2, 1.2);
        leaf.translateY(1.0);
        palm.add(leaf);
      }
      palm.position.set(x, 0.9, z);
      palm.traverse((o) => (o.castShadow = true));
      scene.add(palm);
    }
    const plank = std("#9a6a40", 0.85);
    const pier = new THREE.Group();
    const pdeck = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 1.8), plank);
    pdeck.position.set(-7.4, 0.62, 0);
    pier.add(pdeck);
    for (let k = 0; k < 12; k++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 1.82), std("#6a4428", 0.9));
      s.position.set(-11.6 + k * 0.76, 0.625, 0);
      pier.add(s);
    }
    for (let k = 0; k < 4; k++)
      for (const z of [-0.8, 0.8]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4, 8), std("#6a4428", 0.9));
        post.position.set(-11.2 + k * 2.6, -1.3, z);
        pier.add(post);
      }
    pier.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    scene.add(pier);

    // podmořská krajina: kameny, korály, řasy, paprsky, ryby, bubliny
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    const city = new THREE.Vector3(45, -16, -2);
    // místo na dně mimo kopule města
    const bed = (x0: number, x1: number, zr: number): [number, number] => {
      for (;;) {
        const x = rand(x0, x1);
        const z = rand(-zr, zr);
        if (Math.hypot(x - city.x, z - city.z) > 10) return [x, z];
      }
    };
    const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std("#7a7f8a", 0.9), 60);
    for (let i = 0; i < 60; i++) {
      const s = rand(0.6, 2.4);
      q.setFromEuler(new THREE.Euler(rand(0, 3), rand(0, 3), 0));
      const [bx, bz] = bed(-10, 90, 22);
      m4.compose(v.set(bx, -16 + s * 0.3, bz), q, new THREE.Vector3(s, s * 0.6, s));
      rocks.setMatrixAt(i, m4);
    }
    scene.add(rocks);
    const coralColors = ["#ff6f91", "#ffb347", "#c08cff", "#ff8fb8", "#6fe0c0"];
    const coral = new THREE.InstancedMesh(new THREE.ConeGeometry(0.35, 1.4, 6), std("#ffffff", 0.7), 140);
    const coralBall = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 1), std("#ffffff", 0.75), 80);
    for (let i = 0; i < 140; i++) {
      const s = rand(0.6, 1.6);
      q.setFromEuler(new THREE.Euler(rand(-0.3, 0.3), 0, rand(-0.3, 0.3)));
      const [bx, bz] = bed(0, 90, 14);
      m4.compose(v.set(bx, -16 + 0.6 * s, bz), q, new THREE.Vector3(s, s, s));
      coral.setMatrixAt(i, m4);
      coral.setColorAt(i, c.set(coralColors[i % coralColors.length]));
    }
    for (let i = 0; i < 80; i++) {
      const s = rand(0.5, 1.3);
      const [bx, bz] = bed(0, 90, 14);
      m4.compose(v.set(bx, -16 + 0.3 * s, bz), q.identity(), new THREE.Vector3(s, s * 0.8, s));
      coralBall.setMatrixAt(i, m4);
      coralBall.setColorAt(i, c.set(coralColors[(i + 2) % coralColors.length]));
    }
    scene.add(coral, coralBall);
    const weedMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, fogCol: { value: new THREE.Color("#0b5a8a") } },
      vertexShader: `
        uniform float uTime; varying float vY; varying float vD;
        void main(){
          vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
          float k = uv.y * uv.y;
          w.x += sin(uTime * 1.3 + w.x * 0.4 + w.z * 0.7) * 0.6 * k;
          w.z += cos(uTime * 1.1 + w.x * 0.5) * 0.3 * k;
          vY = uv.y;
          vec4 mv = viewMatrix * w; vD = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 fogCol; varying float vY; varying float vD;
        void main(){
          vec3 col = mix(vec3(0.12, 0.42, 0.2), vec3(0.45, 0.85, 0.4), vY);
          float f = 1.0 - exp(-0.034 * 0.034 * vD * vD);
          gl_FragColor = vec4(mix(col, fogCol, f), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const weedGeo = new THREE.PlaneGeometry(0.35, 4, 1, 10);
    weedGeo.translate(0, 2, 0);
    const weeds = new THREE.InstancedMesh(weedGeo, weedMat, 160);
    for (let i = 0; i < 160; i++) {
      const s = rand(0.6, 1.5);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand(0, Math.PI));
      const [bx, bz] = bed(-5, 95, 16);
      m4.compose(v.set(bx, -16, bz), q, new THREE.Vector3(1, s, 1));
      weeds.setMatrixAt(i, m4);
    }
    weeds.frustumCulled = false;
    scene.add(weeds);
    const rayTex = canvasTex(64, 256, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, "rgba(220,250,255,0.55)");
      gr.addColorStop(1, "rgba(220,250,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 256);
      g.globalCompositeOperation = "destination-in";
      const hz = g.createLinearGradient(0, 0, 64, 0);
      hz.addColorStop(0, "rgba(0,0,0,0)");
      hz.addColorStop(0.5, "rgba(0,0,0,1)");
      hz.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = hz;
      g.fillRect(0, 0, 64, 256);
    });
    const rays = Array.from({ length: 14 }, (_, i) => {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(rand(2, 4), 18), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
      r.position.set(i * 7 - 4, -8.5, rand(-6, 6));
      r.rotation.set(0, rand(-0.6, 0.6), 0.25);
      scene.add(r);
      return r;
    });
    const schools = [
      { color: "#ff9f43", n: 18, c: [8, -8, -4], r: 3.5, sp: 0.6 },
      { color: "#ffd24d", n: 16, c: [16, -12, 5], r: 4, sp: -0.5 },
      { color: "#5ab8ff", n: 20, c: [30, -13, -6], r: 5, sp: 0.4 },
    ].map((s) => {
      const body = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 10, 8), std(s.color, 0.45), s.n);
      const tailGeo = new THREE.ConeGeometry(0.16, 0.3, 4);
      tailGeo.rotateZ(Math.PI / 2);
      tailGeo.translate(-0.36, 0, 0);
      const tail = new THREE.InstancedMesh(tailGeo, std(s.color, 0.45), s.n);
      body.frustumCulled = tail.frustumCulled = false;
      scene.add(body, tail);
      const offs = Array.from({ length: s.n }, () => [rand(-1, 1), rand(-1, 1), rand(-1, 1), rand(0, 6)] as const);
      return { ...s, body, tail, offs };
    });
    const bubbles = sparklePoints(220, ["#dff8ff", "#bfefff"], 0.18);
    const bub = Array.from({ length: 220 }, () => [rand(-1, 1), rand(0, 1), rand(-1, 1), rand(0.6, 1.4)] as const);
    scene.add(bubbles);
    const bPos = bubbles.geometry.attributes.position as THREE.BufferAttribute;

    const loads: Promise<unknown>[] = [
      placeModel("podmorske").then((m) => {
        m.scale.setScalar(1.7);
        m.position.copy(city);
        scene.add(m);
      }),
    ];
    for (const [x, z] of [[-5, 0], [5, 3], [0, -5]] as const) {
      const l = new THREE.PointLight("#7fe8ff", 16, 26, 1.4);
      l.position.set(city.x + x, city.y + 4, city.z + z);
      scene.add(l);
    }
    // lucerny kolem kopulí
    const lanternCols = ["#7fe8ff", "#ffd27a", "#ff9fe0"];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const r = 9.5 + (k % 2) * 1.5;
      const x = city.x + Math.cos(a) * r;
      const z = city.z + Math.sin(a) * r;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6), std("#3a3f55", 0.4, 0.7));
      pole.position.set(x, -14.8, z);
      const col = lanternCols[k % 3];
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), std(col, 0.3, 0, { emissive: col, emissiveIntensity: 2.2 }));
      bulb.position.set(x, -13.5, z);
      const halo = glowSprite(col, 2.6);
      halo.position.copy(bulb.position);
      scene.add(pole, bulb, halo);
    }
    const cityGlow = glowSprite("rgba(140,240,255,0.7)", 30);
    cityGlow.position.set(city.x, city.y + 5, city.z);
    scene.add(cityGlow);

    const sub = makeSub();
    scene.add(sub.g);
    let f: Figure | null = null;
    loads.push(
      hero(opts.look).then((h) => {
        f = h;
        scene.add(h.root);
      }),
    );
    const T = { walk: [0.3, 3.0], hop: [3.0, 3.6], down: [3.7, 4.3], shut: 4.5, dive: [4.8, 7.2], cruise: 7.2, arrive: 11.0, end: 12.2 };
    let subX = 0;
    let subV = 0;
    return {
      end: T.end,
      sky,
      loads,
      cues: [
        [0.2, () => sfx.waves(3)],
        [T.hop[1], () => sfx.clunk()],
        [T.shut, () => sfx.clunk()],
        [T.dive[0], () => sfx.splash(1.2)],
        [T.dive[0] + 0.6, () => sfx.whoosh(1.6)],
        [T.arrive - 0.4, () => sfx.dock()],
      ],
      frame(t, dt) {
        surf.uniforms.uTime.value = t;
        weedMat.uniforms.uTime.value = t;
        // ponorka: houpe se u mola, pak se ponoří a pluje k městu
        const dk = smooth(t, T.dive[0], T.dive[1]);
        const acc = t > T.dive[0] ? Math.min(1, (t - T.dive[0]) / 1.5) : 0;
        const brake = 1 - smooth(t, T.arrive - 1.2, T.arrive + 0.6) * 0.85;
        subV = 6.2 * acc * brake;
        subX += subV * dt;
        const bob = t < T.dive[0] ? Math.sin(t * 1.6) * 0.06 : 0;
        const y = lerp(-0.42, -10.5, ease(dk)) + bob + Math.sin(t * 0.8) * 0.15 * dk;
        sub.g.position.set(subX, y, 0);
        sub.g.rotation.z = -0.32 * Math.sin(Math.PI * dk) + 0.02 * Math.sin(t * 1.3);
        sub.prop.rotation.x += dt * (2 + subV * 3);
        sub.hatch.rotation.z = t < T.down[1] ? smooth(t, 0.2, 1.2) * 1.9 : 1.9 * (1 - smooth(t, T.down[1], T.shut));
        sub.spot.intensity = 60 * smooth(t, T.dive[0] + 1, T.dive[1]);
        // pod hladinou: modrá mlha, světlo z hloubky
        const under = camera.position.y < 0;
        scene.fog = under ? fogDown : fogUp;
        scene.background = under ? fogDown.color : null;
        sky.visible = !under;
        for (const [i, r] of rays.entries()) {
          r.visible = under;
          (r.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * Math.sin(t * 0.7 + i);
        }
        cityGlow.material.opacity = 0.5 + 0.2 * Math.sin(t * 2);
        // ryby
        for (const s of schools) {
          const a = t * s.sp;
          const cx = s.c[0] + Math.cos(a) * s.r;
          const cz = s.c[2] + Math.sin(a) * s.r;
          s.offs.forEach(([ox, oy, oz, ph], i) => {
            const px = cx + ox * 1.6 + Math.sin(t * 2 + ph) * 0.2;
            const py = s.c[1] + oy * 1.0;
            const pz = cz + oz * 1.6;
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a - (s.sp > 0 ? Math.PI / 2 : -Math.PI / 2));
            m4.compose(v.set(px, py, pz), q, new THREE.Vector3(1, 0.62, 0.42));
            s.body.setMatrixAt(i, m4);
            const wag = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(t * 12 + ph) * 0.4);
            m4.compose(v.set(px, py, pz), q.clone().multiply(wag), new THREE.Vector3(1, 1, 1));
            s.tail.setMatrixAt(i, m4);
          });
          s.body.instanceMatrix.needsUpdate = true;
          s.tail.instanceMatrix.needsUpdate = true;
        }
        // bubliny od vrtule a ze dna
        for (let i = 0; i < bub.length; i++) {
          const [bx, by, bz, sp] = bub[i];
          if (i < 120) {
            const life = (t * sp * 0.8 + by) % 1;
            const on = t > T.dive[0] - 0.2;
            bPos.setXYZ(i, on ? subX - 2.8 - life * 4 + bx * 0.3 : 0, on ? y + life * 2.2 + bz * 0.2 : -100, bz * 0.6);
          } else {
            const life = (t * 0.15 * sp + by) % 1;
            bPos.setXYZ(i, 10 + bx * 45 + 45, -16 + life * 15.5, bz * 12);
          }
        }
        bPos.needsUpdate = true;
        // hrdina: po molu na palubu a poklopem dovnitř
        if (f) {
          const r = f.root;
          if (t < T.down[0]) walk(f, [[-11.2, 0.7, 0.1], [-3.4, 0.7, 0.1], [-0.9, 0.55, 0.05], [0.1, 1.25, 0]], [T.walk[0], T.walk[1], T.hop[0] + 0.3, T.hop[1]], t);
          else {
            const k = smooth(t, T.down[0], T.down[1]);
            r.position.set(sub.g.position.x + 0.1, sub.g.position.y + 1.67 - 1.9 * k, 0);
            r.visible = k < 0.98;
            f.pose("stoji");
          }
          f.update(dt);
        }
        // kamera
        const hp = f ? f.root.position : new THREE.Vector3(-11, 0.7, 0);
        if (t < T.hop[0]) {
          camera.position.set(hp.x + 2.6, 2.6, 7.4);
          look.set(hp.x + 3.4, 0.9, 0);
        } else if (t < T.dive[0]) {
          const k = ease(clamp01((t - T.hop[0]) / (T.dive[0] - T.hop[0])));
          camera.position.set(lerp(1.0, 2.6, k), lerp(2.6, 3.0, k), lerp(7.4, 8.4, k));
          look.set(0.1, 1.2, 0);
        } else if (t < T.cruise) {
          const k = ease(clamp01((t - T.dive[0]) / (T.cruise - T.dive[0])));
          camera.position.set(subX - lerp(-2.6, 5, k), lerp(3.0, y + 1.2, k), lerp(8.4, 6.8, k));
          look.set(subX + 1, y + 0.3, 0);
        } else {
          const k = ease(smooth(t, T.arrive - 2.4, T.arrive + 0.4));
          camera.position.set(subX - lerp(5, 6, k), y + lerp(1.2, 3.4, k), lerp(6.8, 8.5, k));
          look.lerpVectors(v.set(subX + 6, y - 0.6, 0), new THREE.Vector3(city.x, city.y + 3, city.z), k);
        }
      },
    };
  });
}
