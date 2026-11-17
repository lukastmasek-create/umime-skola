import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { spring } from "remotion";
import { clamp01, smoothstep } from "../utils/animation";

type Props = {
  frame: number;
  fps: number;
  start: number;
  end: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

const COUNT = 180;

export const Waveform3D: React.FC<Props> = ({
  frame,
  fps,
  start,
  end,
  position = [0, -1.2, -23.8],
  rotation = [0, 0, 0],
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const reveal = spring({
    frame: frame - start,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 80 },
  });

  const fade = smoothstep(start, start + 24, frame) * (1 - smoothstep(end, end + 90, frame));
  const opacity = clamp01(fade) * 0.82;
  const scale = Math.max(0.001, clamp01(reveal));

  const positions = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const t = i / (COUNT - 1);
      const angle = t * Math.PI * 3.4;
      const radius = 0.6 + Math.sin(t * Math.PI) * 2.1;

      return {
        x: Math.sin(angle) * radius,
        y: Math.sin(t * Math.PI * 2.0 + 0.4) * 0.9,
        z: -t * 8.2,
        phase: t * Math.PI * 11.0,
        t,
      };
    });
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = Math.max(0, (frame - start) / 60);

    for (let i = 0; i < COUNT; i++) {
      const p = positions[i];

      const wave = Math.abs(
        Math.sin(p.phase - time * 2.45 + Math.sin(p.t * 6.0) * 0.5)
      );

      const envelope =
        0.45 +
        0.55 *
          Math.sin(Math.min(1, Math.max(0, (frame - start) / 80)) * Math.PI * 0.5);

      const amplitude = (0.22 + wave * 1.85) * envelope;

      const x =
        p.x +
        Math.sin(time * 0.5 + p.t * 5.0) * 0.1;
      const y = p.y + amplitude * 0.5;
      const z = p.z;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        0,
        p.t * Math.PI * 0.35 + Math.sin(time * 0.3 + p.t) * 0.2,
        0
      );
      dummy.scale.set(1, amplitude, 1);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, frame, positions, start, opacity > 0.002]);

  if (opacity <= 0.002) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <instancedMesh
        ref={meshRef}
        args={[null as unknown as THREE.BufferGeometry, null as unknown as THREE.Material, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.055, 1, 0.055]} />
        <meshStandardMaterial
          color="#1DB954"
          emissive="#0e5d2b"
          emissiveIntensity={1.4}
          metalness={0.18}
          roughness={0.16}
          transparent
          opacity={opacity}
          envMapIntensity={1.4}
        />
      </instancedMesh>

      <pointLight
        position={[0, 0.8, -1]}
        color="#1DB954"
        intensity={8 * opacity}
        distance={12}
      />
    </group>
  );
};
