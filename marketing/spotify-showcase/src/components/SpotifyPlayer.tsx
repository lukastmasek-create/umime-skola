import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { spring } from "remotion";
import {
  useCoverTexture,
  useNowPlayingOverlayTexture,
} from "../utils/textures";
import { clamp01, smoothstep } from "../utils/animation";

type Props = {
  frame: number;
  fps: number;
  position?: [number, number, number];
};

export const SpotifyPlayer: React.FC<Props> = ({
  frame,
  fps,
  position = [0, 0.3, -24],
}) => {
  const cover = useCoverTexture("getlucky");
  const overlay = useNowPlayingOverlayTexture("getlucky");

  const playShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.055, 0.17);
    shape.lineTo(0.2, 0);
    shape.lineTo(-0.055, -0.17);
    shape.closePath();
    return shape;
  }, []);

  const reveal = spring({
    frame: frame - 650,
    fps,
    config: {
      damping: 18,
      mass: 0.9,
      stiffness: 82,
    },
  });

  const exit = 1 - smoothstep(905, 955, frame);
  const panelScale = Math.max(0.001, clamp01(reveal) * exit);

  const pressDown = spring({
    frame: frame - 758,
    fps,
    config: { damping: 13, mass: 0.42, stiffness: 240 },
  });

  const pressUp = spring({
    frame: frame - 782,
    fps,
    config: { damping: 13, mass: 0.42, stiffness: 240 },
  });

  const press = Math.max(0, Math.min(1, pressDown - pressUp));
  const buttonZ = 0.23 - press * 0.052;
  const buttonScale = 1 - press * 0.075;

  const fill = Math.min(
    0.82,
    Math.max(0.07, (frame - 620) / 1500)
  );

  if (panelScale <= 0.002) return null;

  return (
    <group position={position} scale={panelScale}>
      {/* Back glow plate */}
      <RoundedBox
        args={[5.62, 7.62, 0.14]}
        radius={0.18}
        smoothness={8}
        position={[0, 0, -0.05]}
      >
        <meshBasicMaterial
          color="#07150d"
          transparent
          opacity={0.65}
        />
      </RoundedBox>

      {/* Main glass panel */}
      <RoundedBox
        args={[5.46, 7.46, 0.18]}
        radius={0.17}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#09120d"
          metalness={0.12}
          roughness={0.075}
          transmission={0.12}
          thickness={0.55}
          transparent
          opacity={0.94}
          clearcoat={1}
          clearcoatRoughness={0.035}
          ior={1.45}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Edge accents */}
      <mesh position={[-2.63, 0, 0.06]}>
        <boxGeometry args={[0.018, 5.8, 0.035]} />
        <meshBasicMaterial
          color="#1DB954"
          transparent
          opacity={0.34}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[2.63, 0, 0.06]}>
        <boxGeometry args={[0.018, 5.8, 0.035]} />
        <meshBasicMaterial
          color="#1DB954"
          transparent
          opacity={0.34}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Album artwork backing */}
      <RoundedBox
        args={[3.3, 3.3, 0.12]}
        radius={0.12}
        smoothness={7}
        position={[0, 1.24, 0.105]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#050705"
          metalness={0.24}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.4}
        />
      </RoundedBox>

      {/* Album artwork */}
      <mesh position={[0, 1.24, 0.173]}>
        <planeGeometry args={[3.1, 3.1]} />
        <meshBasicMaterial map={cover} toneMapped={false} />
      </mesh>

      {/* UI overlay texture */}
      <mesh position={[0, 0, 0.181]} renderOrder={5}>
        <planeGeometry args={[5.28, 7.28]} />
        <meshBasicMaterial
          map={overlay}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* 3D progress track */}
      <mesh position={[0, -1.72, 0.19]}>
        <boxGeometry args={[4.18, 0.038, 0.028]} />
        <meshBasicMaterial color="#F7F9F7" transparent opacity={0.18} />
      </mesh>

      <mesh
        position={[-2.09 + (4.18 * fill) / 2, -1.72, 0.194]}
        scale={[fill, 1, 1]}
      >
        <boxGeometry args={[4.18, 0.038, 0.028]} />
        <meshBasicMaterial color="#1DB954" toneMapped={false} />
      </mesh>

      <mesh position={[-2.09 + 4.18 * fill, -1.72, 0.202]}>
        <sphereGeometry args={[0.042, 24, 16]} />
        <meshBasicMaterial color="#F7F9F7" toneMapped={false} />
      </mesh>

      {/* Play button */}
      <group
        position={[0, -2.55, buttonZ]}
        scale={buttonScale}
      >
        <mesh castShadow>
          <circleGeometry args={[0.43, 80]} />
          <meshStandardMaterial
            color="#1DB954"
            emissive="#0a5d2a"
            emissiveIntensity={1.2}
            roughness={0.23}
            metalness={0.14}
          />
        </mesh>

        <mesh position={[0.025, 0, 0.012]}>
          <shapeGeometry args={[playShape]} />
          <meshBasicMaterial
            color="#050705"
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Decorative light strip under panel */}
      <mesh position={[0, -3.82, 0.02]}>
        <boxGeometry args={[4.6, 0.018, 0.03]} />
        <meshBasicMaterial
          color="#1DB954"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
