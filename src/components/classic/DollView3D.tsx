"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import { SLOTS } from "@/lib/dress";
import type { Mood, Worn } from "./DollSvg";

export type DollEvent = { id: number; kind: "happy" | "sad" };

type Apply = (worn: Worn, mood: Mood, ev: DollEvent | null) => void;

// 3D panenka z Blenderu (umime-art/blender/panenky3d.py): kusy oblečení jsou samostatné uzly, které se zapínají podle `worn`.
// Varianta kusu (po špatné odpovědi) posune odstín jeho materiálů. Tažením se panenka otáčí.
export default function DollView3D({
  dollId,
  worn,
  mood,
  event,
  label,
  onReady,
  onError,
}: {
  dollId: string;
  worn: Worn;
  mood: Mood;
  event: DollEvent | null;
  label: string;
  onReady?: () => void;
  onError: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onReady, onError });
  const state = useRef({ worn, mood, event });
  const applyRef = useRef<Apply>(() => {});
  useEffect(() => {
    handlers.current = { onReady, onError };
    state.current = { worn, mood, event };
    applyRef.current(worn, mood, event);
  });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      handlers.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "pan-y";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.85;
    const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
    key.position.set(-2.5, 4, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 1.3);
    rim.position.set(2, 3, -4);
    scene.add(rim);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.ShadowMaterial({ opacity: 0.2 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      // vysoká panenka se musí vejít i do široké a nízké plochy
      const dist = Math.max(4.9, 0.8 / (Math.tan(THREE.MathUtils.degToRad(14)) * camera.aspect));
      camera.position.set(0, 1.25, dist);
      camera.lookAt(0, 1.12, 0);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);
    resize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    const pivot = new THREE.Group();
    scene.add(pivot);
    let model: THREE.Object3D | null = null;
    let spin = 0; // ručně nastavené natočení
    let dragX: number | null = null;
    let anim: { kind: "happy" | "sad"; t: number } | null = null;
    let lastEvent = -1;
    const pops = new Map<THREE.Object3D, number>();

    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    new GLTFLoader().setDRACOLoader(draco).load(
      `/dolls/panenka-${dollId}.glb`,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        pivot.add(model);

        const byName = new Map<string, THREE.Object3D>();
        model.traverse((o) => {
          if (o.name) byName.set(o.name, o);
        });
        // původní barvy materiálů kusů, od kterých se počítá posun odstínu
        const mats = new Map<string, { mat: THREE.MeshStandardMaterial; base: THREE.Color }[]>();
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          for (const m of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
            const slot = SLOTS.find((s) => m.name.startsWith(`${s}_`));
            if (!slot) continue;
            const list = (mats.get(slot) ?? []).filter((x) => x.mat !== m);
            list.push({ mat: m, base: m.color.clone() });
            mats.set(slot, list);
          }
        });
        const shown = new Set<string>();
        const hsl = { h: 0, s: 0, l: 0 };
        applyRef.current = (w, md, ev) => {
          for (const slot of SLOTS) {
            const n = byName.get(`slot_${slot}`);
            const v = w[slot];
            if (n) {
              n.visible = v !== undefined;
              if (v !== undefined && !shown.has(slot)) {
                shown.add(slot);
                pops.set(n, performance.now());
              }
              if (v === undefined) shown.delete(slot);
            }
            for (const { mat, base } of mats.get(slot) ?? []) {
              if (!v) mat.color.copy(base);
              else {
                base.getHSL(hsl);
                mat.color.setHSL((hsl.h + v * 0.31) % 1, Math.min(1, hsl.s * 1.1), hsl.l);
              }
            }
          }
          const under = byName.get("underwear");
          if (under) under.visible = w.outfit === undefined;
          for (const m of ["happy", "sad", "neutral"] as const) {
            const f = byName.get(`face_${m}`);
            if (f) f.visible = m === md;
            const l = byName.get(`lips_${m}`);
            if (l) l.visible = m === md;
          }
          if (ev && ev.id !== lastEvent) {
            lastEvent = ev.id;
            anim = { kind: ev.kind, t: 0 };
          }
        };
        applyRef.current(state.current.worn, state.current.mood, state.current.event);
        renderer.render(scene, camera);
        handlers.current.onReady?.();
      },
      undefined,
      () => {
        if (!disposed) handlers.current.onError();
      },
    );

    const onDown = (e: PointerEvent) => {
      dragX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null) return;
      if (e.buttons === 0) {
        dragX = null;
        return;
      }
      spin += (e.clientX - dragX) * 0.012;
      dragX = e.clientX;
    };
    const onUp = () => {
      dragX = null;
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    let time = 0;
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      time += dt;
      let y = 0;
      let rotY = spin;
      let rotZ = 0;
      if (!reduceMotion) {
        rotY += Math.sin(time * 0.7) * 0.16; // jemné pohupování ze strany na stranu
        y = Math.sin(time * 1.8) * 0.012;
        if (anim) {
          anim.t += dt;
          if (anim.kind === "happy") {
            const u = Math.min(1, anim.t / 0.9);
            y += Math.sin(u * Math.PI) * 0.22;
            rotY += u * Math.PI * 2;
            if (u >= 1) anim = null;
          } else {
            const u = Math.min(1, anim.t / 0.9);
            rotZ = Math.sin(u * Math.PI * 6) * 0.07 * (1 - u);
            y -= Math.sin(u * Math.PI) * 0.03;
            if (u >= 1) anim = null;
          }
        }
        const now = performance.now();
        for (const [n, t0] of pops) {
          const u = Math.min(1, (now - t0) / 420);
          const s = u < 1 ? 1 + Math.sin(u * Math.PI) * 0.06 - (1 - u) * 0.1 : 1;
          n.scale.setScalar(s);
          if (u >= 1) pops.delete(n);
        }
      } else if (anim) anim = null;
      pivot.position.y = y;
      pivot.rotation.set(0, rotY, rotZ);
      renderer.render(scene, camera);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      clock.getDelta();
      renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
    });
    visibility.observe(el);

    return () => {
      disposed = true;
      applyRef.current = () => {};
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of [mesh.material].flat()) m.dispose();
      });
      pmrem.dispose();
      draco.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [dollId]);

  return <div ref={box} role="img" aria-label={label} className="h-full w-full" />;
}
