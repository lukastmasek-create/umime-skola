"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import type { Item3D, Layout3D, Scene3D, View3D } from "@/lib/scene3d";

const GW = 640;
const GH = 420;
const FOV = 35;

type Engine3D = {
  getScene3D?: () => Scene3D | null;
  setView3D?: (view: View3D | null) => void;
};

type Proto = { group: THREE.Group; size: THREE.Vector3 };
type Entry = {
  model: string;
  obj: THREE.Group | null;
  size: THREE.Vector3 | null;
  label: THREE.Sprite | null;
  labelKey: string;
  seen: boolean;
  phase: number;
};

// Modely se načítají jednou pro celou stránku a pak se jen klonují.
let loader: GLTFLoader | null = null;
const protos = new Map<string, Promise<Proto | null>>();

function getLoader() {
  if (!loader) {
    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    loader = new GLTFLoader().setDRACOLoader(draco);
  }
  return loader;
}

function loadProto(model: string, layout: Layout3D): Promise<Proto | null> {
  const id = `${layout}:${model}`;
  let p = protos.get(id);
  if (!p) {
    p = new Promise<Proto | null>((resolve) => {
      getLoader().load(
        `/game-models/${model}.glb`,
        (gltf) => {
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          // Počátek: střed modelu; na podlaze stojí spodní hranou.
          const inner = new THREE.Group();
          gltf.scene.position.set(-center.x, layout === "floor" ? -box.min.y : -center.y, -center.z);
          gltf.scene.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          inner.add(gltf.scene);
          resolve({ group: inner, size });
        },
        undefined,
        () => resolve(null),
      );
    });
    protos.set(id, p);
  }
  return p;
}

const labelCache = new Map<string, { tex: THREE.CanvasTexture; aspect: number }>();

function labelTexture(text: string, color: string) {
  const key = `${color}|${text}`;
  let hit = labelCache.get(key);
  if (!hit) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    let size = 30;
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    const maxW = 320;
    while (size > 16 && ctx.measureText(text).width > maxW) {
      size -= 2;
      ctx.font = `700 ${size}px system-ui, sans-serif`;
    }
    const tw = Math.min(maxW, ctx.measureText(text).width);
    const w = Math.ceil(tw + 36);
    const h = 56;
    c.width = w;
    c.height = h;
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(10,8,30,0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(3, 3, w - 6, h - 6, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2, maxW);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    hit = { tex, aspect: h / w };
    labelCache.set(key, hit);
  }
  return hit;
}

const geometries: Record<string, THREE.BufferGeometry> = {};
function primitive(model: string): THREE.BufferGeometry {
  if (!geometries[model]) {
    geometries[model] =
      model === "sphere"
        ? new THREE.SphereGeometry(0.5, 20, 14)
        : model === "cyl"
          ? new THREE.CylinderGeometry(0.5, 0.5, 1, 20)
          : model === "cone"
            ? new THREE.ConeGeometry(0.5, 1, 20)
            : new THREE.BoxGeometry(1, 1, 1);
  }
  return geometries[model];
}
const PRIMITIVES = new Set(["box", "sphere", "cyl", "cone", "none"]);
const materials = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string, opacity: number) {
  const key = `${color}|${opacity}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, transparent: opacity < 1, opacity });
    materials.set(key, m);
  }
  return m;
}

export default function GameView3D({
  engineRef,
  onFail,
}: {
  engineRef: { current: Engine3D | null };
  onFail: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const fail = useRef(onFail);
  useEffect(() => {
    fail.current = onFail;
  });

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      fail.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.7;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7a7aa0, 0.5));
    const sun = new THREE.DirectionalLight(0xfff3e0, 2.1);
    sun.position.set(-260, 520, 340);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -420;
    sc.right = 420;
    sc.top = 340;
    sc.bottom = -340;
    sc.near = 50;
    sc.far = 1400;
    sun.shadow.bias = -0.0006;
    sun.shadow.radius = 3;
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(FOV, GW / GH, 10, 4000);
    const world = new THREE.Group();
    scene.add(world);

    const groundMat = new THREE.MeshStandardMaterial({ color: "#222244", roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(GW * 1.5, GH * 1.5), groundMat);
    ground.receiveShadow = true;
    world.add(ground);

    let layout: Layout3D | null = null;
    let zoom = 1;
    const aspectRef = { v: GW / GH };

    const placeCamera = () => {
      const t = Math.tan((FOV * Math.PI) / 360);
      const fitW = GW / 2 / (t * aspectRef.v);
      const fitH = GH / 2 / t;
      const dist = (Math.max(fitW, fitH) * 1.04) / zoom;
      camera.aspect = aspectRef.v;
      if (layout === "wall") {
        const el = (10 * Math.PI) / 180;
        camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      } else {
        const el = (58 * Math.PI) / 180;
        camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist + 6);
      }
      camera.lookAt(0, 0, layout === "wall" ? 0 : 6);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      aspectRef.v = w / h;
      placeCamera();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const entries = new Map<string, Entry>();
    const tmp = new THREE.Vector3();

    const worldPos = (x: number, y: number, z: number, out: THREE.Vector3) =>
      layout === "wall" ? out.set(x - GW / 2, GH / 2 - y, z) : out.set(x - GW / 2, z, y - GH / 2);

    const view: View3D = {
      project(x, y, z = 0) {
        worldPos(x, y, z, tmp);
        tmp.project(camera);
        if (tmp.z > 1) return null;
        return { x: (tmp.x * 0.5 + 0.5) * GW, y: (1 - (tmp.y * 0.5 + 0.5)) * GH };
      },
    };

    const ensure = (item: Item3D, lay: Layout3D): Entry => {
      let e = entries.get(item.key);
      if (e && e.model !== item.model) {
        if (e.obj) world.remove(e.obj);
        if (e.label) world.remove(e.label);
        entries.delete(item.key);
        e = undefined;
      }
      if (e) return e;
      const entry: Entry = { model: item.model, obj: null, size: null, label: null, labelKey: "", seen: true, phase: Math.random() * 6 };
      entries.set(item.key, entry);
      if (PRIMITIVES.has(item.model)) {
        const g = new THREE.Group();
        if (item.model !== "none") {
          const mesh = new THREE.Mesh(primitive(item.model), material(item.color ?? "#ffffff", item.opacity ?? 1));
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          // Primitiv má počátek ve středu; na podlaze ho posuneme, aby stál na ní.
          mesh.position.y = lay === "floor" ? 0.5 : 0;
          g.add(mesh);
        }
        entry.obj = g;
        entry.size = new THREE.Vector3(1, 1, 1);
        world.add(g);
      } else {
        loadProto(item.model, lay).then((p) => {
          if (!p || entries.get(item.key) !== entry) return;
          entry.obj = p.group.clone(true);
          entry.size = p.size;
          world.add(entry.obj);
        });
      }
      return entry;
    };

    let raf = 0;
    const clock = new THREE.Clock();
    let lastLayout: string | null = null;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const engine = engineRef.current;
      const data = engine?.getScene3D?.() ?? null;
      if (engine && engine.setView3D && data) engine.setView3D(view);
      if (!data) return;
      const t = clock.getElapsedTime();

      if (layout !== data.layout || zoom !== (data.zoom ?? 1)) {
        layout = data.layout;
        zoom = data.zoom ?? 1;
        // Podlaha leží v rovině XZ, zadní stěna v rovině XY.
        ground.rotation.x = layout === "floor" ? -Math.PI / 2 : 0;
        ground.position.set(0, layout === "floor" ? -0.5 : 0, layout === "floor" ? 0 : -40);
        for (const e of entries.values()) {
          if (e.obj) world.remove(e.obj);
          if (e.label) world.remove(e.label);
        }
        entries.clear();
        placeCamera();
      }
      groundMat.color.set(data.ground);
      const sky = `${data.layout}|${data.sky}`;
      if (lastLayout !== sky) {
        lastLayout = sky;
        el.style.background = data.sky;
      }

      for (const e of entries.values()) e.seen = false;
      for (const item of data.items) {
        if (item.hidden) continue;
        const e = ensure(item, data.layout);
        e.seen = true;
        const obj = e.obj;
        if (!obj || !e.size) continue;
        obj.visible = true;
        const bob = item.bob ? Math.sin(t * 3 + e.phase) * item.bob : 0;
        const z = (item.z ?? 0) + bob;
        worldPos(item.x, item.y, z, obj.position);
        let sx: number;
        let sy: number;
        let sz: number;
        if (PRIMITIVES.has(item.model)) {
          sx = item.w ?? 20;
          sy = item.h ?? sx;
          sz = item.d ?? sx;
        } else {
          if (item.w && item.h) {
            // Obě míry zadané: model se natáhne (třeba žebřík).
            sx = item.w / e.size.x;
            sy = item.h / e.size.y;
            sz = Math.min(sx, sy);
          } else {
            const s = item.w ? item.w / e.size.x : item.h ? item.h / e.size.y : 1;
            sx = sy = sz = s;
          }
        }
        obj.scale.set(sx, sy, sz);
        obj.rotation.y = (item.rot ?? 0) + (item.spin ? t * item.spin : 0);
        obj.rotation.z = item.roll ?? 0;

        if (item.label) {
          const key = `${item.labelColor ?? "#7c6cff"}|${item.label}`;
          if (!e.label || e.labelKey !== key) {
            if (e.label) world.remove(e.label);
            const tex = labelTexture(item.label, item.labelColor ?? "#7c6cff");
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.tex, depthTest: false, transparent: true }));
            sprite.renderOrder = 10;
            sprite.userData.aspect = tex.aspect;
            e.label = sprite;
            e.labelKey = key;
            world.add(sprite);
          }
          // Výška popisku je pevná, šířka podle textu, nejvýš labelW.
          const aspect = e.label.userData.aspect as number;
          let lh = 22;
          let lw = lh / aspect;
          const maxW = item.labelW ?? 92;
          if (lw > maxW) {
            lw = maxW;
            lh = lw * aspect;
          }
          e.label.scale.set(lw, lh, 1);
          const top = (item.h ?? e.size.y * sy) + z;
          if (layout === "wall") e.label.position.set(item.x - GW / 2, GH / 2 - item.y + (item.h ?? e.size.y * sy) / 2 + 14, z);
          else e.label.position.set(item.x - GW / 2, top + 16, item.y - GH / 2 + 8);
          e.label.visible = true;
        } else if (e.label) {
          e.label.visible = false;
        }
      }
      for (const [key, e] of entries) {
        if (e.seen) continue;
        if (e.obj) world.remove(e.obj);
        if (e.label) world.remove(e.label);
        entries.delete(key);
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      engineRef.current?.setView3D?.(null);
      env.dispose();
      pmrem.dispose();
      groundMat.dispose();
      ground.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [engineRef]);

  return <div ref={box} aria-hidden className="pointer-events-none absolute inset-0" />;
}
