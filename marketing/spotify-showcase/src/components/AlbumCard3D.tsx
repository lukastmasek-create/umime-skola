import React from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import {
  TrackKind,
  useAlbumCardTexture,
} from "../utils/textures";

type Props = {
  kind: TrackKind;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  frame: number;
  seed?: number;
  floatAmount?: number;
};

export const AlbumCard3D: React.FC<Props> = ({
  kind,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  frame,
  seed = 1,
  floatAmount = 1,
}) => {
  const texture = useAlbumCardTexture(kind);
  const t = frame / 60;

  const bobY =
    Math.sin(t * 0.75 + seed * 1.37) * 0.035 * floatAmount;
  const bobRot =
    Math.sin(t * 0.55 + seed * 0.73) * 0.018 * floatAmount;

  return (
    <group
      position={[position[0], position[1] + bobY, position[2]]}
      rotation={[
        rotation[0] + bobRot,
        rotation[1],
        rotation[2] + bobRot * 0.55,
      ]}
      scale={scale}
    >
      <RoundedBox
        args={[1.58, 2.22, 0.1]}
        radius={0.065}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#0a140e"
          metalness={0.22}
          roughness={0.11}
          clearcoat={1}
          clearcoatRoughness={0.055}
          envMapIntensity={1.25}
        />
      </RoundedBox>

      <mesh position={[0, 0, 0.054]}>
        <planeGeometry args={[1.49, 2.11]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.061]} renderOrder={4}>
        <planeGeometry args={[1.53, 2.15]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.065}
          roughness={0.025}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.8}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.064]}>
        <planeGeometry args={[1.58, 2.22]} />
        <meshBasicMaterial
          color="#1DB954"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
