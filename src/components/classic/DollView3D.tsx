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

const isSlotNode = (name: string, slot: string) => name === `slot_${slot}` || name.startsWith(`slot_${slot}__`);

// 3D panenka z Blenderu (umime-art/blender/panenky_build.py): kostra a animace (idle, happy, sad, pose_<slot>), kusy oblečení
// jsou samostatné sítě pojmenované slot_<slot>__<materiál>, nálady a mrknutí jsou morph targety. Varianta kusu (po špatné odpovědi)
// posune odstín jeho materiálů. Tažením se panenka otáčí.
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
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.012;
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -1;
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
      const dist = Math.max(5.9, 1.0 / (Math.tan(THREE.MathUtils.degToRad(14)) * camera.aspect));
      camera.position.set(0, 1.3, dist);
      camera.lookAt(0, 1.18, 0);
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
    let mixer: THREE.AnimationMixer | null = null;
    let spin = 0; // ručně nastavené natočení
    let dragX: number | null = null;
    let lastEvent = -1;
    let moodTarget: Mood = "neutral";
    const morphMeshes: THREE.Mesh[] = [];
    let blinkAt = 1.5 + Math.random() * 2;
    let blinkT = -1;
    let time = 0;

    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    new GLTFLoader().setDRACOLoader(draco).load(
      `/dolls/panenka-${dollId}.glb`,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.frustumCulled = false; // ohraničení se po animaci kostry nepřepočítává
          if (mesh.morphTargetDictionary) morphMeshes.push(mesh);
          for (const m of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
            for (const tex of [m.map, m.normalMap]) if (tex) tex.anisotropy = aniso;
            if (m.transparent) m.depthWrite = false;
          }
        });
        pivot.add(model);

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

        // animace: idle ve smyčce, ostatní jednorázově s plynulým přechodem zpět do idle
        mixer = new THREE.AnimationMixer(model);
        const actions: Record<string, THREE.AnimationAction> = {};
        for (const clip of gltf.animations) actions[clip.name] = mixer.clipAction(clip);
        const idle = actions.idle;
        let current: THREE.AnimationAction | null = null;
        const toIdle = () => {
          if (!idle || reduceMotion) return;
          idle.reset().play();
          if (current) idle.crossFadeFrom(current, 0.3, false);
          current = idle;
        };
        const queue: string[] = [];
        const playNext = () => {
          const name = queue.shift();
          if (!name || !actions[name] || reduceMotion) return toIdle();
          const a = actions[name];
          a.reset();
          a.setLoop(THREE.LoopOnce, 1);
          a.clampWhenFinished = true;
          a.play();
          if (current) a.crossFadeFrom(current, 0.18, false);
          current = a;
        };
        mixer.addEventListener("finished", (e) => {
          if (e.action === current) playNext();
        });
        if (idle && !reduceMotion) {
          idle.play();
          current = idle;
        }

        const shown = new Set<string>();
        const hsl = { h: 0, s: 0, l: 0 };
        applyRef.current = (w, md, ev) => {
          const added: string[] = [];
          for (const slot of SLOTS) {
            const v = w[slot];
            if (v !== undefined && !shown.has(slot)) {
              shown.add(slot);
              added.push(slot);
            }
            if (v === undefined) shown.delete(slot);
            for (const { mat, base } of mats.get(slot) ?? []) {
              if (!v) mat.color.copy(base);
              else {
                base.getHSL(hsl);
                mat.color.setHSL((hsl.h + v * 0.31) % 1, Math.min(1, hsl.s * 1.1), hsl.l);
              }
            }
          }
          model?.traverse((o) => {
            for (const slot of SLOTS) if (isSlotNode(o.name, slot)) o.visible = w[slot] !== undefined;
            if (o.name === "underwear" || o.name.startsWith("underwear__")) o.visible = w.outfit === undefined;
          });
          moodTarget = md;
          if (ev && ev.id !== lastEvent) {
            lastEvent = ev.id;
            queue.length = 0;
            if (ev.kind === "happy") {
              if (added[0]) queue.push(`pose_${added[0]}`);
              queue.push("happy");
            } else queue.push("sad");
            playNext();
          }
        };
        applyRef.current(state.current.worn, state.current.mood, state.current.event);
        mixer.update(0);
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

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      time += dt;
      mixer?.update(dt);
      // mrkání: krátké zavření očí v náhodných intervalech
      if (!reduceMotion) {
        blinkAt -= dt;
        if (blinkAt <= 0 && blinkT < 0) blinkT = 0;
        if (blinkT >= 0) {
          blinkT += dt;
          if (blinkT > 0.16) {
            blinkT = -1;
            blinkAt = 1.8 + Math.random() * 3.5;
          }
        }
      }
      const blink = blinkT >= 0 ? Math.sin((blinkT / 0.16) * Math.PI) : 0;
      // plynulý přechod výrazu: úsměv / smutek / klid
      for (const mesh of morphMeshes) {
        const dict = mesh.morphTargetDictionary!;
        const inf = mesh.morphTargetInfluences!;
        for (const name of ["happy", "sad"] as const) {
          const i = dict[name];
          if (i === undefined) continue;
          const target = moodTarget === name ? 1 : 0;
          inf[i] += (target - inf[i]) * Math.min(1, dt * 9);
        }
        const b = dict.blink;
        if (b !== undefined) inf[b] = blink;
      }
      pivot.rotation.y = spin;
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
      mixer?.stopAllAction();
      if (model) mixer?.uncacheRoot(model);
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
