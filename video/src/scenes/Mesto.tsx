import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useModel } from "../useModel";
import { C } from "../theme";
import { HEADING } from "../fonts";

type Item = { name: string; pos: [number, number, number]; s: number; at: number };

// Budovy vyrůstají kolem fontány, každá o chvíli později.
const ITEMS: Item[] = [
  { name: "fontana", pos: [0, 0, 0], s: 1.4, at: 0 },
  { name: "skola", pos: [-4.5, 0, -2], s: 1.2, at: 14 },
  { name: "knihovna", pos: [4.5, 0, -2], s: 1.2, at: 28 },
  { name: "domek1", pos: [-3, 0, 3.5], s: 1.1, at: 42 },
  { name: "kavarna", pos: [3.2, 0, 3.5], s: 1.1, at: 56 },
  { name: "hvezdarna", pos: [0, 0, -5.5], s: 1.2, at: 70 },
  { name: "mlyn", pos: [-8, 0, 0.5], s: 1.1, at: 84 },
  { name: "domek3", pos: [8, 0, 0.5], s: 1.1, at: 98 },
  { name: "strom", pos: [-6, 0, 5], s: 1.2, at: 112 },
  { name: "strom", pos: [6.5, 0, 5], s: 1.0, at: 120 },
];

const Building = ({ item }: { item: Item }) => {
  const f = useCurrentFrame();
  const scene = useModel(item.name);
  const t = interpolate(f - item.at, [0, 26], [0, 1], {
    easing: Easing.out(Easing.back(2.2)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Normalizace: každý model na stejnou velikost, stojí na zemi, vycentrovaný.
  const norm = useMemo(() => {
    if (!scene) return null;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const k = (item.s * 3.2) / Math.max(size.x, size.y, size.z);
    scene.position.set(-c.x, -box.min.y, -c.z);
    return k;
  }, [scene, item.s]);
  if (!scene || norm === null) return null;
  return (
    <group position={item.pos} scale={norm * Math.max(t, 0.0001)}>
      <primitive object={scene} />
    </group>
  );
};

export const Mesto = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ang = interpolate(f, [0, 270], [-0.6, 0.9]);
  const r = interpolate(f, [0, 270], [22, 15]);
  const fade = interpolate(f, [0, 12, 250, 270], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [Math.sin(ang) * r, 9, Math.cos(ang) * r], fov: 38 }}
        onCreated={({ camera }) => camera.lookAt(0, 1, 0)}
      >
        <color attach="background" args={[C.bg]} />
        <hemisphereLight args={[C.brandLight, C.ink, 1.4]} />
        <directionalLight position={[8, 14, 6]} intensity={2.6} color={C.yellow} />
        {ITEMS.map((it, i) => (
          <Building key={i} item={it} />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[16, 64]} />
          <meshStandardMaterial color={C.brand} roughness={0.9} />
        </mesh>
      </ThreeCanvas>
      <div
        style={{
          position: "absolute",
          left: 90,
          bottom: 80,
          fontFamily: HEADING,
          fontWeight: 800,
          fontSize: 96,
          color: C.paper,
          opacity: interpolate(f, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(f, [30, 55], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}
      >
        Vybuduj město.
      </div>
    </AbsoluteFill>
  );
};
