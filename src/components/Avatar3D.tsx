"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import {
  PATTERNS,
  SLOTS,
  SLOT_MATERIAL,
  TOGGLES,
  TOGGLE_NODE,
  type AvatarCustom,
  type AvatarParts,
} from "@/lib/avatar-custom";

// Vzory se kreslí přímo do materiálu podle polohy na těle (modely nemají UV souřadnice).
function addPattern(mat: THREE.Material) {
  const m = mat as THREE.MeshStandardMaterial;
  const uniforms = { uPat: { value: 0 }, uCol2: { value: new THREE.Color("#ffffff") } };
  m.userData.patternUniforms = uniforms;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPat = uniforms.uPat;
    shader.uniforms.uCol2 = uniforms.uCol2;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj;\nuniform float uPat;\nuniform vec3 uCol2;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float pm = 0.0;
        if (uPat > 0.5 && uPat < 1.5) pm = step(0.5, fract(vObj.y * 5.0));
        else if (uPat > 1.5 && uPat < 2.5) { vec2 g = fract(vObj.xy * 4.0) - 0.5; pm = 1.0 - step(0.2, length(g)); }
        else if (uPat > 2.5 && uPat < 3.5) pm = mod(floor(vObj.x * 3.5) + floor(vObj.y * 3.5) + floor(vObj.z * 3.5), 2.0);
        else if (uPat > 3.5) pm = smoothstep(0.1, 0.5, 0.5 - length(vObj.xy - vec2(0.0, 0.0)) * 0.9);
        diffuseColor.rgb = mix(diffuseColor.rgb, uCol2, pm);`,
      );
  };
  m.customProgramCacheKey = () => "pattern";
  m.needsUpdate = true;
}

// Živá 3D postava: klid ve smyčce, kliknutí = radost, tažení = otočení.
// Načítá se přes next/dynamic (ProfileAvatar), takže three.js stahuje jen ten, kdo ji vidí.
export default function Avatar3D({
  src,
  label,
  onReady,
  onError,
  custom,
  onParts,
}: {
  src: string;
  label: string;
  onReady: () => void;
  onError: () => void;
  custom?: AvatarCustom;
  onParts?: (parts: AvatarParts) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  // Callbacky v refu, aby se scéna nestavěla znovu při každém renderu rodiče.
  const handlers = useRef({ onReady, onError, onParts });
  useEffect(() => {
    handlers.current = { onReady, onError, onParts };
  });
  // Úpravy vzhledu se použijí bez nového sestavení scény.
  const customRef = useRef(custom);
  const applyRef = useRef<(c: AvatarCustom | undefined) => void>(() => {});
  useEffect(() => {
    customRef.current = custom;
    applyRef.current(custom);
  }, [custom]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let disposed = false;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      handlers.current.onError(); // bez WebGL zůstane SVG avatar
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping; // stejný vzhled jako rendery z Blenderu
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
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
    camera.position.set(0, 1.2, 5.1);
    camera.lookAt(0, 1.02, 0);

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
    let playJoy = () => {};

    const draco = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH).setDecoderConfig({ type: "wasm" });
    const loader = new GLTFLoader().setDRACOLoader(draco);
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        scene.add(model);

        // Zjistí, co jde na modelu upravit, a uloží si původní vzhled.
        const slotMats: Record<string, THREE.MeshStandardMaterial[]> = {};
        const original = new Map<THREE.MeshStandardMaterial, THREE.Color>();
        const toggleNodes: Record<string, THREE.Object3D[]> = {};
        const patternMats: THREE.Material[] = [];
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            for (const mat of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
              for (const slot of SLOTS) {
                if (SLOT_MATERIAL[slot].test(mat.name) && !(slotMats[slot] ??= []).includes(mat)) {
                  slotMats[slot].push(mat);
                  original.set(mat, mat.color.clone());
                  if ((slot === "body" || slot === "head") && !mat.userData.patternUniforms) {
                    addPattern(mat);
                    patternMats.push(mat);
                  }
                }
              }
            }
          }
          for (const t of TOGGLES) if (TOGGLE_NODE[t].test(o.name)) (toggleNodes[t] ??= []).push(o);
        });
        const parts: AvatarParts = {
          slots: SLOTS.filter((s) => slotMats[s]?.length),
          toggles: TOGGLES.filter((t) => toggleNodes[t]?.length),
        };
        applyRef.current = (c) => {
          for (const slot of SLOTS) {
            for (const mat of slotMats[slot] ?? []) {
              const hex = c?.colors[slot];
              if (hex) mat.color.set(hex);
              else mat.color.copy(original.get(mat)!);
            }
          }
          for (const t of TOGGLES) for (const n of toggleNodes[t] ?? []) n.visible = !c?.hidden.includes(t);
          const pat = PATTERNS.indexOf(c?.pattern ?? "none");
          for (const mat of patternMats) {
            const u = mat.userData.patternUniforms as { uPat: { value: number }; uCol2: { value: THREE.Color } };
            u.uPat.value = pat;
            u.uCol2.value.set(c?.patternColor ?? "#ffffff");
          }
        };
        applyRef.current(customRef.current);
        handlers.current.onParts?.(parts);
        mixer = new THREE.AnimationMixer(model);
        const clip = (name: string) => gltf.animations.find((c) => c.name === name);
        const idleClip = clip("klid");
        const joyClip = clip("radost");
        const idle = idleClip ? mixer.clipAction(idleClip) : null;
        const joy = joyClip ? mixer.clipAction(joyClip) : null;
        if (idle && !reduceMotion) idle.play();
        if (joy) {
          joy.setLoop(THREE.LoopOnce, 1);
          mixer.addEventListener("finished", (e) => {
            if (e.action === joy && idle && !reduceMotion) {
              idle.reset().play();
              idle.crossFadeFrom(joy, 0.25, false);
            }
          });
          playJoy = () => {
            joy.reset().play();
            if (idle?.isRunning()) joy.crossFadeFrom(idle, 0.12, false);
          };
        }
        renderer.render(scene, camera);
        handlers.current.onReady();
      },
      undefined,
      () => {
        if (!disposed) handlers.current.onError();
      },
    );

    // Tažením se postava otáčí, krátké kliknutí ji rozradostní.
    let dragX: number | null = null;
    let moved = 0;
    const onDown = (e: PointerEvent) => {
      dragX = e.clientX;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null || !model) return;
      if (e.buttons === 0) {
        dragX = null; // tlačítko se pustilo mimo okno: netočit při pouhém pohybu myši
        return;
      }
      const dx = e.clientX - dragX;
      dragX = e.clientX;
      moved += Math.abs(dx);
      model.rotation.y += dx * 0.012;
    };
    const onUp = () => {
      if (dragX !== null && moved < 6) playJoy();
      dragX = null;
    };
    // Posouvání stránky prstem gesto zruší: nic se nespustí ani neotočí.
    const onCancel = () => {
      dragX = null;
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);

    // Mimo obrazovku se nevykresluje (šetří baterii na telefonech).
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
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of [mesh.material].flat()) {
          for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
          m.dispose();
        }
      });
      env.dispose();
      pmrem.dispose();
      draco.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [src]);

  return <div ref={box} role="img" aria-label={label} title={label} className="absolute inset-0 cursor-grab" />;
}
