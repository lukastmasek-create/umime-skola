import * as THREE from "three";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { createStage, loadGltf } from "./kit";
import { hero } from "./scenery";

// Živý 3D pokoj: místnost a nábytek z Blenderu (umime-art/blender/pokoj3d.py → public/room/3d), každý kus má své
// přirozené místo jako ve skutečném pokoji. Po pokoji chodí hráčův avatar (poskakuje), klik na nábytek ho pošle
// k němu a otevře akci (onPick), klik na podlahu ho tam pošle. Popisek nad nábytkem kreslí React (labels).

export type RoomSpot = { x: number; z: number; ry: number };
// x ∈ (-3,5; 3,5), z ∈ (-3; 3); zadní stěna s oknem je z = -3, levá stěna s dveřmi x = -3,5 (dveře kolem z = 1,8).
export const ROOM_SPOTS: Record<string, RoomSpot> = {
  rocketbed: { x: -2.85, z: -1.45, ry: Math.PI / 2 },
  plant: { x: -3.1, z: -2.72, ry: 0 },
  trophy: { x: -1.9, z: -2.76, ry: 0 },
  bookshelf: { x: -0.75, z: -2.79, ry: 0 },
  desk: { x: 0.8, z: -2.6, ry: 0 },
  telescope: { x: 2.1, z: -2.35, ry: -0.6 },
  arcade: { x: 3.0, z: -2.5, ry: -0.55 },
  aquarium: { x: 3.18, z: -0.85, ry: -Math.PI / 2 },
  sofa: { x: 2.95, z: 0.95, ry: -Math.PI / 2 },
  guitar: { x: 3.1, z: 2.35, ry: -0.8 },
  piano: { x: -3.15, z: 0.55, ry: Math.PI / 2 },
  globe: { x: -2.0, z: 2.45, ry: 0.3 },
};
// kam si hrdina stoupne, když jde k nábytku (o kus před jeho přední stranu)
const USE_DIST: Record<string, number> = { rocketbed: 1.0, desk: 1.35, sofa: 1.0, piano: 1.2, aquarium: 0.75, arcade: 0.9 };
const FREE = { x0: -2.2, x1: 2.3, z0: -1.75, z1: 2.6 };

export type RoomLabel = { id: string; x: number; y: number; visible: boolean };
export type RoomHandle = {
  setPlaced: (ids: string[]) => void;
  walkTo: (id: string) => void;
  labels: (cb: (items: RoomLabel[]) => void) => void;
  dispose: () => void;
};

const MODEL = (n: string) => `/room/3d/${n}.glb`;
const clampFree = (x: number, z: number) => [THREE.MathUtils.clamp(x, FREE.x0, FREE.x1), THREE.MathUtils.clamp(z, FREE.z0, FREE.z1)] as const;

export function createRoom3D(
  container: HTMLElement,
  opts: { avatar: string | null; look: number; onPick: (id: string) => void; onArrive: (id: string) => void },
): RoomHandle | null {
  const stage = createStage(container);
  if (!stage) return null;
  const { renderer } = stage;
  const scene = new THREE.Scene();
  scene.environment = stage.env;
  scene.environmentIntensity = 0.45;
  scene.background = new THREE.Color("#2a2340");
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const cam = { theta: 0.62, phi: 0.62, dist: 11.5, target: new THREE.Vector3(0, 0.9, 0) };

  // ---- světlo: denní z okna, teplá lampa
  scene.add(new THREE.HemisphereLight("#fff4e0", "#5a4030", 0.85));
  const sun = new THREE.DirectionalLight("#ffe8c8", 2.0);
  sun.position.set(2.5, 6, -6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  sun.shadow.bias = -0.0006;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight("#cfe0ff", 0.6);
  fill.position.set(6, 5, 6);
  scene.add(fill);
  const lampLight = new THREE.PointLight("#ffd8a0", 6, 8, 1.6);
  lampLight.position.set(0.3, 1.75, 0.4);
  scene.add(lampLight);

  const prep = (root: THREE.Object3D, cast = true) => {
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = cast;
      m.receiveShadow = true;
      m.userData.shared = true;
    });
    return root;
  };
  const loads: Promise<unknown>[] = [];
  const add = (name: string, x: number, z: number, cast = true) =>
    loads.push(
      loadGltf(MODEL(name))
        .then((g) => {
          const r = prep(g.scene.clone(true), cast);
          r.position.set(x, 0, z);
          scene.add(r);
        })
        .catch(() => {}),
    );
  add("mistnost", 0, 0, false);
  add("koberec", 0.3, 0.6, false);

  // ---- nábytek
  const furn = new Map<string, THREE.Group>();
  for (const [id, s] of Object.entries(ROOM_SPOTS)) {
    const g = new THREE.Group();
    g.position.set(s.x, 0, s.z);
    g.rotation.y = s.ry;
    g.userData.furn = id;
    g.visible = false;
    scene.add(g);
    furn.set(id, g);
    loads.push(
      loadGltf(MODEL(id))
        .then((gl) => g.add(prep(gl.scene.clone(true))))
        .catch(() => {}),
    );
  }

  // ---- hrdina: avatar hráče (poskakuje při chůzi), bez modelu postava z městečka
  const heroRoot = new THREE.Group();
  heroRoot.position.set(0.2, 0, 1.3);
  scene.add(heroRoot);
  let mixer: THREE.AnimationMixer | null = null;
  let figureUpdate: ((dt: number) => void) | null = null;
  let figurePose: ((p: "chuze" | "stoji") => void) | null = null;
  if (opts.avatar) {
    loads.push(
      loadGltf(opts.avatar)
        .then((g) => {
          const r = prep(cloneSkinned(g.scene));
          const size = new THREE.Box3().setFromObject(r).getSize(new THREE.Vector3());
          r.scale.multiplyScalar(1.15 / Math.max(0.01, size.y));
          heroRoot.add(r);
          mixer = new THREE.AnimationMixer(r);
          const idle = g.animations.find((c) => c.name === "klid");
          if (idle) mixer.clipAction(idle).play();
        })
        .catch(() => {}),
    );
  } else {
    loads.push(
      hero(opts.look)
        .then((f) => {
          f.root.scale.multiplyScalar(1.2 / 1.6);
          f.root.rotation.y = -Math.PI / 2; // postava z městečka hledí k +x, ve skupině má hledět k +z
          heroRoot.add(f.root);
          figureUpdate = f.update;
          figurePose = f.pose;
        })
        .catch(() => {}),
    );
  }

  // ---- chůze: přímo k cíli (volná plocha uprostřed), u nábytku se otočí k němu
  let target: THREE.Vector3 | null = null;
  let arriveId: string | null = null;
  let idleT = 3;
  const standSpot = (id: string) => {
    const s = ROOM_SPOTS[id];
    const d = USE_DIST[id] ?? 0.85;
    const [x, z] = clampFree(s.x + Math.sin(s.ry) * d, s.z + Math.cos(s.ry) * d);
    return new THREE.Vector3(x, 0, z);
  };
  function walkTo(id: string) {
    target = standSpot(id);
    arriveId = id;
  }

  // ---- ovládání
  const el = renderer.domElement;
  el.style.touchAction = "none";
  el.style.cursor = "grab";
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let hovered: string | null = null;
  const toNdc = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  };
  const pickFurn = (e: PointerEvent) => {
    toNdc(e);
    for (const h of ray.intersectObjects([...furn.values()].filter((g) => g.visible), true)) {
      let o: THREE.Object3D | null = h.object;
      while (o && !o.userData.furn) o = o.parent;
      if (o) return o.userData.furn as string;
    }
    return null;
  };
  let drag: { x: number; y: number; moved: number } | null = null;
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
      cam.theta = THREE.MathUtils.clamp(cam.theta - dx * 0.005, 0.05, 1.45);
      cam.phi = THREE.MathUtils.clamp(cam.phi + dy * 0.003, 0.3, 1.1);
      return;
    }
    hovered = pickFurn(e);
    el.style.cursor = hovered ? "pointer" : "grab";
  };
  const onUp = (e: PointerEvent) => {
    const click = drag && drag.moved < 6;
    drag = null;
    if (!click) return;
    const id = pickFurn(e);
    if (id) {
      walkTo(id);
      opts.onPick(id);
      return;
    }
    toNdc(e);
    const p = ray.ray.intersectPlane(floorPlane, new THREE.Vector3());
    if (p) {
      const [x, z] = clampFree(p.x, p.z);
      target = new THREE.Vector3(x, 0, z);
      arriveId = null;
    }
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + Math.sign(e.deltaY) * 0.08), 7, 16);
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });

  const resize = () => {
    const { w, h } = stage.size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 56 : 38;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ---- smyčka
  let labelCb: ((items: RoomLabel[]) => void) | null = null;
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
    // samo se občas projde po pokoji
    if (!target && (idleT -= dt) <= 0) {
      const [x, z] = clampFree(THREE.MathUtils.randFloat(FREE.x0, FREE.x1), THREE.MathUtils.randFloat(FREE.z0, FREE.z1));
      target = new THREE.Vector3(x, 0, z);
      idleT = 5 + Math.random() * 6;
    }
    let walking = false;
    if (target) {
      const d = v.copy(target).sub(heroRoot.position);
      d.y = 0;
      const len = d.length();
      const step = 1.6 * dt;
      if (len <= step) {
        heroRoot.position.x = target.x;
        heroRoot.position.z = target.z;
        target = null;
        if (arriveId) {
          const s = ROOM_SPOTS[arriveId];
          heroRoot.rotation.y = Math.atan2(s.x - heroRoot.position.x, s.z - heroRoot.position.z);
          opts.onArrive(arriveId);
          arriveId = null;
        }
      } else {
        heroRoot.position.addScaledVector(d.normalize(), step);
        const want = Math.atan2(d.x, d.z);
        let diff = want - heroRoot.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heroRoot.rotation.y += diff * Math.min(1, dt * 10);
        walking = true;
      }
    }
    // poskakování avatara při chůzi, jemné pohupování na místě
    heroRoot.position.y = walking && !figurePose ? Math.abs(Math.sin(time * 9)) * 0.08 : 0;
    heroRoot.rotation.z = walking && !figurePose ? Math.sin(time * 9) * 0.06 : 0;
    figurePose?.(walking ? "chuze" : "stoji");
    figureUpdate?.(dt);
    (mixer as THREE.AnimationMixer | null)?.update(dt);
    for (const [id, g] of furn) {
      const k = id === hovered ? 1.03 : 1;
      g.scale.setScalar(g.scale.x + (k - g.scale.x) * Math.min(1, dt * 10));
    }
    camera.position.set(cam.target.x + Math.sin(cam.theta) * Math.cos(cam.phi) * cam.dist, cam.target.y + Math.sin(cam.phi) * cam.dist, cam.target.z + Math.cos(cam.theta) * Math.cos(cam.phi) * cam.dist);
    camera.lookAt(cam.target);
    renderer.render(scene, camera);
    if (labelCb) {
      const r = el.getBoundingClientRect();
      labelCb(
        [...furn].map(([id, g]) => {
          v.set(g.position.x, 2.1, g.position.z).project(camera);
          return { id, x: ((v.x + 1) / 2) * r.width, y: ((1 - v.y) / 2) * r.height, visible: g.visible && id === hovered && v.z < 1 };
        }),
      );
    }
  };
  void Promise.race([Promise.all(loads), new Promise((r) => window.setTimeout(r, 4000))]).then(() => (stage.el.style.opacity = "1"));
  raf = requestAnimationFrame(frame);

  return {
    setPlaced(ids) {
      for (const [id, g] of furn) g.visible = ids.includes(id);
    },
    walkTo,
    labels(cb) {
      labelCb = cb;
    },
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
