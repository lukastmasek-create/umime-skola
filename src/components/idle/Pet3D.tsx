"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import { PET_ACCESSORY_ANCHOR, petAccessoryModel, petModel, type PetAction } from "@/lib/pets3d";
import type { PetMood } from "@/components/idle/PetArt";
import type { SpeciesId } from "@/lib/idle/pets";

// Velikost podle fáze růstu, stejně jako u 2D mazlíčků.
const STAGE_SCALE = { 1: 0.78, 2: 0.9, 3: 1 } as const;
const MOODS: PetMood[] = ["happy", "ok", "sad", "hungry"];

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
    camera.lookAt(0, 0.72, 0);
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
          holder.scale.setScalar(STAGE_SCALE[value]);
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
      holder.rotation.y += dx * 0.012;
    };
    const onUp = () => {
      if (dragX !== null && moved < 6) apply.current.play("joy");
      dragX = null;
    };
    const onCancel = () => {
      dragX = null;
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);

    const tick = () => {
      mixer?.update(clock.getDelta());
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
