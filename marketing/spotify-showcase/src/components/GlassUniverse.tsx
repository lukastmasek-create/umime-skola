import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AlbumCard3D } from "./AlbumCard3D";
import { smoothstep, hash, lerp3 } from "../utils/animation";

const COUNT = 360;

export const GlassUniverse: React.FC<{ frame: number }> = ({ frame }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const appear = smoothstep(890, 980, frame);
  const collapse = smoothstep(1160, 1270, frame);
  const fade = smoothstep(1240, 1320, frame);

  const opacity = appear * (1 - fade) * 0.56;

  const data = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      const ring = i % 9;
      const angle = (i / COUNT) * Math.PI * 2 * 6.2 + ring * 0.33;
      const radius = 1.9 + hash(i + 3) * 3.2;
      const z = -33 - ring * 3.1 - hash(i + 7) * 2.0;

      return {
        base: [
          Math.cos(angle) * radius + (hash(i + 11) - 0.5) * 0.7,
          Math.sin(angle) * radius * 0.72 + (hash(i + 13) - 0.5) * 0.9,
          z,
        ] as [number, number, number],
        rot: [
          hash(i + 17) * Math.PI,
          hash(i + 19) * Math.PI,
          hash(i + 23) * Math.PI,
        ] as [number, number, number],
        s: 0.22 + hash(i + 29) * 1.45,
        seed: hash(i + 31) * 6.283,
      };
    });
  }, []);

  const trailGeometry = useMemo(() => {
    const points: number[] = [];

    for (let i = 0; i < 86; i++) {
      const a = hash(i + 1) * Math.PI * 2;
      const r = 1.0 + hash(i + 8) * 3.8;
      const z = -34 - hash(i + 16) * 25;
      const len = 0.8 + hash(i + 24) * 4.2;

      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.62;

      points.push(
        x,
        y,
        z,
        x + Math.cos(a + 0.26) * len,
        y + Math.sin(a + 0.26) * len * 0.62,
        z - len
      );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
    return geo;
  }, []);

  const visible = opacity > 0.002;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = frame / 60;

    for (let i = 0; i < COUNT; i++) {
      const item = data[i];

      const stagger = smoothstep(1160 + (item.seed / 6.283) * 70, 1270, frame);

      const orbitX = Math.sin(time * 0.45 + item.seed) * 0.18;
      const orbitY = Math.cos(time * 0.35 + item.seed) * 0.22;

      const moving: [number, number, number] = [
        item.base[0] + orbitX,
        item.base[1] + orbitY,
        item.base[2] + Math.sin(time * 0.2 + item.seed) * 0.3,
      ];

      const target: [number, number, number] = [0, 0.2, -64];

      const pos = lerp3(moving, target, stagger);

      const scaleAmount =
        item.s *
        (0.18 + 0.82 * appear) *
        (1 - stagger * 0.97);

      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.rotation.set(
        item.rot[0] + time * 0.12,
        item.rot[1] + time * 0.17,
        item.rot[2] + time * 0.1
      );
      dummy.scale.set(
        Math.max(0.001, scaleAmount * 0.14),
        Math.max(0.001, scaleAmount),
        Math.max(0.001, scaleAmount * 0.14)
      );
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [appear, data, dummy, frame, visible]);

  const albumReveal = smoothstep(920, 1040, frame);
  const albumDissolve = 1 - smoothstep(1160, 1250, frame);
  const floatingScale = albumReveal * albumDissolve;

  return (
    <group>
      {visible && (
        <instancedMesh
          ref={meshRef}
          args={[
            null as unknown as THREE.BufferGeometry,
            null as unknown as THREE.Material,
            COUNT,
          ]}
          frustumCulled={false}
        >
          <boxGeometry args={[0.085, 1, 0.085]} />
          <meshStandardMaterial
            color="#0f9f48"
            emissive="#0c4b24"
            emissiveIntensity={0.85}
            metalness={0.34}
            roughness={0.15}
            transparent
            opacity={opacity}
            envMapIntensity={1.55}
          />
        </instancedMesh>
      )}

      {visible && (
        <lineSegments geometry={trailGeometry}>
          <lineBasicMaterial
            color="#1DB954"
            transparent
            opacity={opacity * 0.56}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* Center collapse core */}
      <mesh position={[0, 0.2, -64]}>
        <sphereGeometry args={[0.55 + collapse * 1.2, 32, 32]} />
        <meshBasicMaterial
          color="#1DB954"
          transparent
          opacity={appear * (1 - fade) * (0.12 + collapse * 0.18)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        position={[0, 0.2, -64]}
        color="#1DB954"
        intensity={18 * collapse * (1 - fade)}
        distance={18}
      />

      {floatingScale > 0.005 && (
        <>
          <AlbumCard3D
            kind="blinding"
            position={[-3.1, 1.1, -37]}
            rotation={[0.03, 0.44, 0.04]}
            scale={0.7 * floatingScale}
            frame={frame}
            seed={2}
          />
          <AlbumCard3D
            kind="getlucky"
            position={[3.1, -0.9, -43]}
            rotation={[-0.04, -0.54, -0.03]}
            scale={0.64 * floatingScale}
            frame={frame}
            seed={4}
          />
          <AlbumCard3D
            kind="birds"
            position={[-2.2, -1.4, -49]}
            rotation={[0.04, 0.35, -0.02]}
            scale={0.56 * floatingScale}
            frame={frame}
            seed={6}
          />
          <AlbumCard3D
            kind="fein"
            position={[2.6, 1.4, -55]}
            rotation={[-0.03, -0.42, 0.05]}
            scale={0.6 * floatingScale}
            frame={frame}
            seed={8}
          />
        </>
      )}
    </group>
  );
};
