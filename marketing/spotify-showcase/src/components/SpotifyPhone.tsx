import React from "react";
import { RoundedBox } from "@react-three/drei";
import {
  ScreenKind,
  usePhoneTextures,
} from "../utils/textures";
import { SpotifyLogo } from "./SpotifyLogo";

export type PhoneScreenLayer = {
  kind: ScreenKind;
  opacity: number;
};

type Props = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  screens: PhoneScreenLayer[];
  logoOpacity?: number;
};

export const SpotifyPhone: React.FC<Props> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  screens,
  logoOpacity = 0,
}) => {
  const textures = usePhoneTextures();

  const lenses: Array<[number, number]> = [
    [0.17, 0.35],
    [0.41, 0.35],
    [0.17, 0.03],
  ];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Outer metal frame */}
      <RoundedBox
        args={[2.36, 5.0, 0.24]}
        radius={0.18}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#121915"
          metalness={0.88}
          roughness={0.17}
          envMapIntensity={1.35}
        />
      </RoundedBox>

      {/* Inner black bezel */}
      <RoundedBox
        args={[2.24, 4.88, 0.248]}
        radius={0.14}
        smoothness={8}
        position={[0, 0, 0.012]}
        castShadow
      >
        <meshStandardMaterial
          color="#020303"
          metalness={0.35}
          roughness={0.2}
          envMapIntensity={0.9}
        />
      </RoundedBox>

      {/* Screen layers */}
      {screens.map((layer) =>
        layer.opacity > 0.001 ? (
          <mesh
            key={layer.kind}
            position={[0, 0, 0.137]}
            renderOrder={2}
          >
            <planeGeometry args={[2.08, 4.70]} />
            <meshBasicMaterial
              map={textures[layer.kind]}
              transparent
              opacity={layer.opacity}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        ) : null
      )}

      {/* Glass overlay */}
      <mesh position={[0, 0, 0.142]} renderOrder={3}>
        <planeGeometry args={[2.09, 4.73]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.075}
          roughness={0.03}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.025}
          envMapIntensity={1.8}
          depthWrite={false}
        />
      </mesh>

      {/* Logo plane on intro */}
      <SpotifyLogo
        position={[0, 0, 0.148]}
        scale={0.65}
        opacity={logoOpacity}
        glow={false}
      />

      {/* Camera housing on back */}
      <group position={[0.72, 1.66, -0.14]}>
        <RoundedBox
          args={[0.64, 1.34, 0.15]}
          radius={0.15}
          smoothness={6}
          position={[0, 0, -0.03]}
          castShadow
        >
          <meshStandardMaterial
            color="#0a0f0c"
            metalness={0.88}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </RoundedBox>

        {lenses.map(([x, y], i) => (
          <group key={i} position={[x - 0.2, y - 0.35, -0.115]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.04, 32]} />
              <meshStandardMaterial
                color="#050807"
                metalness={0.95}
                roughness={0.06}
                envMapIntensity={1.8}
              />
            </mesh>

            <mesh position={[0, 0, -0.025]}>
              <circleGeometry args={[0.092, 32]} />
              <meshBasicMaterial
                color="#0b1a10"
                toneMapped={false}
              />
            </mesh>

            <mesh position={[0, 0.03, -0.03]}>
              <circleGeometry args={[0.022, 20]} />
              <meshBasicMaterial
                color="#5cff9d"
                transparent
                opacity={0.45}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Side buttons */}
      <mesh position={[1.185, 0.7, 0]} castShadow>
        <boxGeometry args={[0.035, 0.72, 0.065]} />
        <meshStandardMaterial
          color="#111815"
          metalness={0.9}
          roughness={0.16}
          envMapIntensity={1.2}
        />
      </mesh>

      <mesh position={[-1.185, 0.45, 0]} castShadow>
        <boxGeometry args={[0.035, 0.9, 0.065]} />
        <meshStandardMaterial
          color="#111815"
          metalness={0.9}
          roughness={0.16}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
};
