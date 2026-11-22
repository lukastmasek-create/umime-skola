import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let draco: DRACOLoader | null = null;
const cache = new Map<string, Promise<THREE.Group>>();

const load = (name: string) => {
  let p = cache.get(name);
  if (!p) {
    draco ??= new DRACOLoader()
      .setDecoderPath(staticFile("draco/"))
      .setDecoderConfig({ type: "wasm" });
    const loader = new GLTFLoader().setDRACOLoader(draco);
    p = loader.loadAsync(staticFile(`models/${name}.glb`)).then((g) => g.scene);
    cache.set(name, p);
  }
  return p;
};

// Načte GLB z public/models a drží render, dokud není hotový.
export const useModel = (name: string) => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [handle] = useState(() => delayRender(`model ${name}`));
  useEffect(() => {
    let alive = true;
    load(name)
      .then((s) => {
        if (!alive) return;
        setScene(s.clone(true));
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
    return () => {
      alive = false;
    };
  }, [name, handle]);
  return scene;
};
