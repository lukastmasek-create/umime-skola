"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";
import { AVATAR_IDLE_GESTURES, AVATAR_REACTIONS, resetMotion, type Gesture, type Motion } from "@/components/motion-gestures";
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
// Šedá kopie textury pro přebarvení: jas se natáhne tak, aby světlá místa byla skoro bílá
// a vlastní barva vyšla sytá. Kopie se ukládá k původní textuře, počítá se jen jednou.
function grayMap(tex: THREE.Texture): THREE.Texture {
  const cached = tex.userData.grayMap as THREE.Texture | undefined;
  if (cached) return cached;
  const img = tex.image as CanvasImageSource & { width: number; height: number };
  if (!img?.width) return tex;
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return tex;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const lum = new Float32Array(px.length / 4);
  for (let i = 0; i < lum.length; i++) lum[i] = 0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2];
  const sorted = Float32Array.from(lum).sort();
  const top = Math.max(1, sorted[Math.floor(sorted.length * 0.92)]);
  for (let i = 0; i < lum.length; i++) {
    const v = Math.min(255, (lum[i] / top) * 240);
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
  }
  ctx.putImageData(data, 0, 0);
  const gray = new THREE.CanvasTexture(canvas);
  gray.flipY = tex.flipY;
  gray.colorSpace = tex.colorSpace;
  gray.wrapS = tex.wrapS;
  gray.wrapT = tex.wrapT;
  gray.channel = tex.channel;
  gray.needsUpdate = true;
  tex.userData.grayMap = gray;
  return gray;
}

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

// Živá 3D postava: klid ve smyčce, kolem toho náhodná gesta, kliknutí = radost a pokaždé jiná reakce
// (přemet, tanec, úklon, výskok), tažení = otočení, pohyb myši ji nechá koukat za kurzorem.
// Načítá se přes next/dynamic (ProfileAvatar), takže three.js stahuje jen ten, kdo ji vidí.
export default function Avatar3D({
  src,
  label,
  onReady,
  onError,
  custom,
  onParts,
  snapshotRef,
}: {
  src: string;
  label: string;
  onReady: () => void;
  onError: () => void;
  custom?: AvatarCustom;
  onParts?: (parts: AvatarParts) => void;
  // Sem se po načtení modelu vloží funkce, která vyfotí portrét postavy (data URL) pro malé ikonky.
  snapshotRef?: { current: (() => string | null) | null };
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
    // Celá postava visí na pivotu v pase, aby se přemet otáčel kolem těla a ne kolem chodidel.
    const PIVOT_Y = 0.9;
    const pivot = new THREE.Group();
    pivot.position.y = PIVOT_Y;
    scene.add(pivot);
    const motion: Motion = { y: 0, rotX: 0, rotY: 0, rotZ: 0, sx: 1, sy: 1 };
    let gesture: { t: number; g: Gesture } | null = null;
    let untilIdle = 3 + Math.random() * 3;
    let reaction = Math.floor(Math.random() * AVATAR_REACTIONS.length);
    let look = 0; // plynule sledovaný náklon za kurzorem
    let lookTarget = 0;
    let dragging = false;

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
        model.position.y = -PIVOT_Y;
        pivot.add(model);

        // Zjistí, co jde na modelu upravit, a uloží si původní vzhled.
        const slotMats: Record<string, THREE.MeshStandardMaterial[]> = {};
        const original = new Map<THREE.MeshStandardMaterial, { color: THREE.Color; map: THREE.Texture | null; emissive: THREE.Color }>();
        const toggleNodes: Record<string, THREE.Object3D[]> = {};
        const patternMats: THREE.Material[] = [];
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            for (const mat of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
              for (const slot of SLOTS) {
                if (SLOT_MATERIAL[slot].test(mat.name) && !(slotMats[slot] ??= []).includes(mat)) {
                  slotMats[slot].push(mat);
                  original.set(mat, { color: mat.color.clone(), map: mat.map, emissive: mat.emissive.clone() });
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
              const orig = original.get(mat)!;
              // Barva je v modelu zapečená v textuře: pro vlastní barvu se textura nahradí šedou verzí
              // (zachová stínování a detaily), jinak by se nová barva s původní smíchala do špinavého odstínu.
              const map = hex && orig.map ? grayMap(orig.map) : orig.map;
              if (mat.map !== map) {
                mat.map = map;
                mat.needsUpdate = true;
              }
              if (hex) mat.color.set(hex);
              else mat.color.copy(orig.color);
              // Svítící části (svit, oči robota) mění i barvu záře.
              if (orig.emissive.getHex() !== 0) {
                if (hex) mat.emissive.set(hex);
                else mat.emissive.copy(orig.emissive);
              }
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
        if (snapshotRef) {
          // Portrét (hlava a ramena) na chvíli vykreslený do plátna v malé velikosti, pak se vše vrátí.
          snapshotRef.current = () => {
            if (!model) return null;
            const SIZE = 160;
            const saved = { pos: pivot.position.clone(), rot: pivot.rotation.clone(), scale: pivot.scale.clone(), ratio: renderer.getPixelRatio() };
            pivot.position.set(0, PIVOT_Y, 0);
            pivot.rotation.set(0, 0, 0);
            pivot.scale.set(1, 1, 1);
            pivot.updateMatrixWorld(true);
            const bounds = new THREE.Box3().setFromObject(model);
            const height = bounds.max.y - bounds.min.y;
            const lookY = bounds.max.y - height * 0.3;
            const viewH = height * 0.68;
            const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 30);
            cam.position.set(0, lookY + height * 0.04, viewH / 2 / Math.tan((12 * Math.PI) / 180));
            cam.lookAt(0, lookY, 0);
            ground.visible = false;
            renderer.setPixelRatio(1);
            renderer.setSize(SIZE, SIZE, false);
            renderer.render(scene, cam);
            let url = renderer.domElement.toDataURL("image/webp", 0.86);
            if (!url.startsWith("data:image/webp")) url = renderer.domElement.toDataURL("image/png");
            ground.visible = true;
            pivot.position.copy(saved.pos);
            pivot.rotation.copy(saved.rot);
            pivot.scale.copy(saved.scale);
            renderer.setPixelRatio(saved.ratio);
            resize();
            renderer.render(scene, camera);
            return url;
          };
        }
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
        // Kliknutí: radost z modelu plus gesto celé postavy, každé kliknutí jiné.
        const joyClipPlay = playJoy;
        playJoy = () => {
          joyClipPlay();
          if (reduceMotion) return;
          gesture = { t: 0, g: AVATAR_REACTIONS[reaction++ % AVATAR_REACTIONS.length] };
        };
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
      dragging = true;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      // Bez tlačítka postava jen pootočí hlavu směrem ke kurzoru.
      if (dragX === null) {
        const r = el.getBoundingClientRect();
        lookTarget = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        return;
      }
      if (!model) return;
      if (e.buttons === 0) {
        dragX = null; // tlačítko se pustilo mimo okno: netočit při pouhém pohybu myši
        dragging = false;
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
      const dt = Math.min(clock.getDelta(), 0.1);
      mixer?.update(dt);
      resetMotion(motion);
      if (!reduceMotion) {
        if (gesture) {
          gesture.t += dt;
          gesture.g.run(Math.min(1, gesture.t / gesture.g.duration), motion);
          if (gesture.t >= gesture.g.duration) {
            gesture = null;
            untilIdle = 4 + Math.random() * 4;
          }
        } else if (!dragging && (untilIdle -= dt) <= 0) {
          gesture = { t: 0, g: AVATAR_IDLE_GESTURES[Math.floor(Math.random() * AVATAR_IDLE_GESTURES.length)] };
        }
        look += (lookTarget - look) * Math.min(1, dt * 4);
        motion.rotY += look * 0.28;
      }
      pivot.position.y = PIVOT_Y + motion.y;
      pivot.rotation.set(motion.rotX, motion.rotY, motion.rotZ);
      pivot.scale.set(motion.sx, motion.sy, motion.sx);
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
  }, [src, snapshotRef]);

  return <div ref={box} role="img" aria-label={label} title={label} className="absolute inset-0 cursor-grab" />;
}
