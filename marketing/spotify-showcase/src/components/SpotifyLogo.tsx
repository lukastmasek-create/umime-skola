import React from "react";
import * as THREE from "three";
import { useSpotifyLogoTexture } from "../utils/textures";

type Props = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  opacity?: number;
  glow?: boolean;
};

export const SpotifyLogo: React.FC<Props> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  opacity = 1,
  glow = false,
}) => {
  const texture = useSpotifyLogoTexture();

  if (opacity <= 0.001) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {glow && (
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.64, 64]} />
          <meshBasicMaterial
            color="#1DB954"
            transparent
            opacity={0.09 * opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh renderOrder={20}>
        <planeGeometry args={[1.25, 1.25]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
