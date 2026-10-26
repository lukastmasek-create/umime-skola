"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import { PET_ACCESSORY_ANCHOR, petAccessoryModel, petModel, type PetAction } from "@/lib/pets3d";
import type { PetMood } from "@/components/idle/PetArt";
import { makeBall, makeFeedingProp, makeHeart, makeStar, setOpacity } from "@/components/idle/pet-props";
import { IDLE_GESTURES, clamp01, easeOutBack, resetMotion, type Gesture, type Motion } from "@/components/motion-gestures";
import type { SpeciesId } from "@/lib/idle/pets";

// Velikost podle fáze růstu, stejně jako u 2D mazlíčků.
const STAGE_SCALE = { 1: 0.78, 2: 0.9, 3: 1 } as const;
const MOODS: PetMood[] = ["happy", "ok", "sad", "hungry"];

// Efekt trvá, dokud `update` nevrátí true (hotovo); `t` jsou sekundy od začátku.
type Effect = { t: number; update: (t: number, m: Motion) => boolean; dispose: () => void };

type Props = {
  species: SpeciesId;
  stage: 1 | 2 | 3;
  mood: PetMood;
  accessory: string | null;
  // Změna `action.id` přehraje animaci jednou (krmení, hraní, pamlsek), pak se vrátí klid.
  action: { id: number; kind: PetAction } | null;
  label: string;
  onReady: () => void;
  onError: () => void;
};

// Živý 3D mazlíček: klid ve smyčce, výraz podle nálady, doplněk z obchodu na kotvě modelu.
// Kliknutí ho rozradostní, tažení otáčí. Načítá se přes next/dynamic (PetView).
export default function Pet3D({ species, stage, mood, accessory, action, label, onReady, onError }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onReady, onError });
  useEffect(() => {
    handlers.current = { onReady, onError };
  });
  // Stav, který se mění bez nového sestavení scény.
  const live = useRef({ stage, mood, accessory });
  const apply = useRef({
    mood: (m: PetMood) => void m,
    stage: (s: 1 | 2 | 3) => void s,
    accessory: (a: string | null) => void a,
    play: (k: PetAction) => void k,
  });
  useEffect(() => {
    live.current.mood = mood;
    apply.current.mood(mood);
  }, [mood]);
  useEffect(() => {
    live.current.stage = stage;
    apply.current.stage(stage);
  }, [stage]);
  useEffect(() => {
    live.current.accessory = accessory;
    apply.current.accessory(accessory);
  }, [accessory]);
  const lastAction = useRef<number | null>(action?.id ?? null);
  useEffect(() => {
    if (!action || action.id === lastAction.current) return;
    lastAction.current = action.id;
    apply.current.play(action.kind);
  }, [action]);

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
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.8;
    const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
    key.position.set(-2.5, 4, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 1.2);
    rim.position.set(2, 3, -4);
    scene.add(rim);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    camera.position.set(0, 1.25, 4.3);
    camera.lookAt(0, 0.66, 0);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);
    resize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Object3D | null = null;
    const holder = new THREE.Group();
    scene.add(holder);
    // Rekvizity (miska, míč, srdíčka) nejsou v `holder`, takže se netočí s tažením myší.
    const extras = new THREE.Group();
    scene.add(extras);
    const motion: Motion = { y: 0, rotX: 0, rotY: 0, rotZ: 0, sx: 1, sy: 1 };
    let baseRotY = 0;
    let stageScale: number = STAGE_SCALE[live.current.stage];
    let dragging = false;
    const effects: Effect[] = [];
    let idle: { t: number; variant: Gesture } | null = null;
    let untilIdle = 3 + Math.random() * 3;

    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    const loader = new GLTFLoader().setDRACOLoader(draco);
    const disposeTree = (root: THREE.Object3D) =>
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of [mesh.material].flat()) {
          for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
          m.dispose();
        }
      });


    const startEffect = (effect: Effect) => {
      effects.push(effect);
      idle = null;
    };
    // Krmení: miska s oblíbeným jídlem druhu vyskočí před mazlíčka, ten se do ní pouští a jídlo ubývá.
    const feedEffect = (): Effect => {
      const prop = makeFeedingProp(species);
      prop.root.position.set(0, 0, 0.8);
      prop.root.scale.setScalar(0);
      extras.add(prop.root);
      return {
        t: 0,
        update(t, m) {
          const grow = easeOutBack(t / 0.45);
          const leave = clamp01((t - 3.1) / 0.5);
          prop.root.scale.setScalar(0.55 * grow * (1 - leave));
          setOpacity(prop.root, 1 - leave);
          const eaten = clamp01((t - 0.9) / 2.1);
          prop.food.scale.setScalar(Math.max(0.001, 1 - 0.9 * eaten * eaten));
          if (prop.hover) {
            prop.food.position.y = 0.3 + 0.1 * Math.sin(t * 5);
            prop.food.position.x = 0.12 * Math.sin(t * 2.3);
            for (const w of prop.wings) w.scale.y = 1 + 0.9 * Math.sin(t * 60);
          } else {
            prop.food.position.y = 0.012 * Math.sin(t * 7);
          }
          if (t > 0.6 && t < 3.0) m.rotX += 0.17 * (0.5 + 0.5 * Math.sin((t - 0.6) * 9));
          return t >= 3.6;
        },
        dispose() {
          extras.remove(prop.root);
          disposeTree(prop.root);
        },
      };
    };
    // Hraní: skákavý míč přeletí před mazlíčkem a ten ho sleduje.
    const playEffect = (): Effect => {
      const ball = makeBall();
      ball.scale.setScalar(0);
      extras.add(ball);
      return {
        t: 0,
        update(t, m) {
          const u = clamp01(t / 2.6);
          const x = -1.15 + 2.3 * u;
          ball.position.set(x, 0.2 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.75, 0.9);
          ball.rotation.z = -x * 5;
          const out = clamp01((t - 2.4) / 0.3);
          ball.scale.setScalar(0.8 * (1 - out));
          m.rotY += x * 0.35;
          m.y += 0.12 * Math.abs(Math.sin(t * 6));
          return t >= 2.7;
        },
        dispose() {
          extras.remove(ball);
          disposeTree(ball);
        },
      };
    };
    // Radost: srdíčka a hvězdičky stoupají nad mazlíčkem, ten poskočí a trochu se zploští.
    const joyEffect = (): Effect => {
      const bits: { obj: THREE.Mesh; x: number; z: number; delay: number; spin: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const obj = i % 3 === 2 ? makeStar() : makeHeart(i % 2 ? "#ff5a7a" : "#ff8fb3");
        obj.visible = false;
        extras.add(obj);
        bits.push({ obj, x: (Math.random() - 0.5) * 1.2, z: 0.3 + Math.random() * 0.6, delay: i * 0.12, spin: (Math.random() - 0.5) * 3 });
      }
      return {
        t: 0,
        update(t, m) {
          for (const b of bits) {
            const u = clamp01((t - b.delay) / 1.4);
            b.obj.visible = u > 0 && u < 1;
            b.obj.position.set(b.x + 0.15 * Math.sin(u * 6 + b.delay), 0.9 + u * 1.2, b.z);
            b.obj.rotation.y = t * b.spin;
            const pop = easeOutBack(u * 4) * (1 - clamp01((u - 0.7) / 0.3));
            b.obj.scale.setScalar(Math.max(0.001, pop));
            setOpacity(b.obj, 1 - clamp01((u - 0.6) / 0.4));
          }
          const k = Math.max(0, 1 - t / 1.4);
          m.y += 0.3 * Math.abs(Math.sin(t * 7)) * k;
          m.sy += 0.05 * Math.sin(t * 14) * k;
          return t >= 2.1;
        },
        dispose() {
          for (const b of bits) {
            extras.remove(b.obj);
            disposeTree(b.obj);
          }
        },
      };
    };
    const spawnEffect = (kind: PetAction) => startEffect(kind === "feed" ? feedEffect() : kind === "play" ? playEffect() : joyEffect());

    loader.load(
      petModel(species),
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        holder.add(model);

        // Výrazy: skupiny nalada_<nálada>_oci a nalada_<nálada>_pusa.
        const moodNodes: Record<string, THREE.Object3D[]> = {};
        const anchors: Record<string, THREE.Object3D> = {};
        model.traverse((o) => {
          const m = /^nalada_([a-z]+)_/.exec(o.name);
          if (m) (moodNodes[m[1]] ??= []).push(o);
          if (o.name.startsWith("kotva_")) anchors[o.name] = o;
        });
        apply.current.mood = (value) => {
          for (const m of MOODS) for (const n of moodNodes[m] ?? []) n.visible = m === value;
        };
        apply.current.stage = (value) => {
          stageScale = STAGE_SCALE[value];
        };

        // Doplněk: načte se jeho GLB a připne na kotvu (kotva má měřítko hlavy mazlíčka).
        let worn: THREE.Object3D | null = null;
        let wanted: string | null = null;
        apply.current.accessory = (value) => {
          wanted = value;
          if (worn) {
            worn.parent?.remove(worn);
            disposeTree(worn);
            worn = null;
          }
          const anchor = value ? anchors[PET_ACCESSORY_ANCHOR[value] ?? ""] : undefined;
          if (!value || !anchor) return;
          loader.load(petAccessoryModel(value), (acc) => {
            if (disposed || wanted !== value) return;
            acc.scene.traverse((o) => {
              if ((o as THREE.Mesh).isMesh) o.castShadow = true;
            });
            worn = acc.scene;
            anchor.add(worn);
          });
        };

        mixer = new THREE.AnimationMixer(model);
        const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, mixer!.clipAction(c)]));
        const idle = clips.klid ?? null;
        if (idle && !reduceMotion) idle.play();
        for (const name of ["jedeni", "hrani", "radost"]) clips[name]?.setLoop(THREE.LoopOnce, 1);
        mixer.addEventListener("finished", (e) => {
          if (e.action !== idle && idle && !reduceMotion) {
            idle.reset().play();
            idle.crossFadeFrom(e.action, 0.25, false);
          }
        });
        apply.current.play = (kind) => {
          spawnEffect(kind);
          const name = kind === "feed" ? "jedeni" : kind === "play" ? "hrani" : "radost";
          const clip = clips[name];
          if (!clip) return;
          clip.reset().play();
          if (idle?.isRunning()) clip.crossFadeFrom(idle, 0.12, false);
        };

        apply.current.mood(live.current.mood);
        apply.current.stage(live.current.stage);
        apply.current.accessory(live.current.accessory);
        renderer.render(scene, camera);
        handlers.current.onReady();
      },
      undefined,
      () => {
        if (!disposed) handlers.current.onError();
      },
    );

    // Tažením se mazlíček otáčí, krátké kliknutí ho rozradostní.
    let dragX: number | null = null;
    let moved = 0;
    const onDown = (e: PointerEvent) => {
      dragX = e.clientX;
      dragging = true;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null || !model) return;
      if (e.buttons === 0) {
        dragX = null;
        return;
      }
      const dx = e.clientX - dragX;
      dragX = e.clientX;
      moved += Math.abs(dx);
      baseRotY += dx * 0.012;
    };
    const onUp = () => {
      if (dragX !== null && moved < 6) apply.current.play("joy");
      dragX = null;
      dragging = false;
    };
    const onCancel = () => {
      dragX = null;
      dragging = false;
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.1);
      mixer?.update(dt);
      resetMotion(motion);
      for (let i = effects.length - 1; i >= 0; i--) {
        const fx = effects[i];
        fx.t += dt;
        if (fx.update(fx.t, motion)) {
          fx.dispose();
          effects.splice(i, 1);
        }
      }
      if (!reduceMotion && !dragging && effects.length === 0) {
        if (idle) {
          idle.t += dt;
          idle.variant.run(clamp01(idle.t / idle.variant.duration), motion);
          if (idle.t >= idle.variant.duration) {
            idle = null;
            untilIdle = 5 + Math.random() * 5;
          }
        } else if ((untilIdle -= dt) <= 0) {
          idle = { t: 0, variant: IDLE_GESTURES[Math.floor(Math.random() * IDLE_GESTURES.length)] };
        }
      }
      holder.position.y = motion.y;
      holder.rotation.set(motion.rotX, baseRotY + motion.rotY, motion.rotZ);
      holder.scale.set(stageScale * motion.sx, stageScale * motion.sy, stageScale * motion.sx);
      renderer.render(scene, camera);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      clock.getDelta();
      renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
    });
    visibility.observe(el);

    return () => {
      disposed = true;
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      mixer?.stopAllAction();
      for (const fx of effects) fx.dispose();
      disposeTree(scene);
      env.dispose();
      pmrem.dispose();
      draco.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [species]);

  return <div ref={box} role="img" aria-label={label} title={label} className="absolute inset-0 cursor-grab" />;
}
