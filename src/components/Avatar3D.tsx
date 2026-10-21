"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { DRACO_DECODER_PATH } from "@/lib/avatars3d";

// Živá 3D postava: klid ve smyčce, kliknutí = radost, tažení = otočení.
// Načítá se přes next/dynamic (ProfileAvatar), takže three.js stahuje jen ten, kdo ji vidí.
export default function Avatar3D({
  src,
  label,
  onReady,
  onError,
}: {
  src: string;
  label: string;
  onReady: () => void;
  onError: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  // Callbacky v refu, aby se scéna nestavěla znovu při každém renderu rodiče.
  const handlers = useRef({ onReady, onError });
  useEffect(() => {
    handlers.current = { onReady, onError };
  });

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
