import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { spring } from "remotion";
import { SpotifyPhone } from "./SpotifyPhone";
import { SpotifyLogo } from "./SpotifyLogo";
import { smoothstep } from "../utils/animation";

type Props = {
  frame: number;
  fps: number;
};

export const Finale: React.FC<Props> = ({ frame, fps }) => {
  const settle = spring({
    frame: frame - 1210,
    fps,
    config: {
      damping: 18,
      mass: 1.0,
      stiffness: 70,
    },
  });

  const safeSettle = Math.max(0, settle);

  const rotateY = -1.15 + Math.min(1.27, safeSettle * 1.27);
  const drift = Math.sin(frame * 0.008) * 0.018;

  const phoneY = -0.82 + (1 - safeSettle) * 0.05;
  const phoneScale = 0.92 + safeSettle * 0.13;

  const logoOpacity = smoothstep(1280, 1380, frame);
  const logoY = 3.0 + Math.sin(frame * 0.014) * 0.035;

  const glow = useMemo(
    () => ({
      uTime: { value: 0 },
      uGreen: { value: new THREE.Color("#1DB954") },
    }),
    []
  );

  useLayoutEffect(() => {
    glow.uTime.value = frame / 60;
  }, [frame, glow]);

  if (frame < 1180) return null;

  return (
    <group>
      {/* Backdrop aura */}
      <mesh position={[0, 0.4, -78.4]} scale={[12, 16, 1]} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={glow}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uGreen;

            void main() {
              vec2 p = vUv * 2.0 - 1.0;
              p.x *= 1.15;
              float d = length(p);
              float core = smoothstep(0.78, 0.0, d);
              float pulse = 0.88 + 0.12 * sin(uTime * 0.8);
              float alpha = core * 0.11 * pulse;
              gl_FragColor = vec4(uGreen, alpha);
            }
          `}
        />
      </mesh>

      <SpotifyPhone
        position={[0, phoneY, -78]}
        rotation={[0.01, rotateY + drift, -0.01]}
        scale={phoneScale}
        screens={[{ kind: "home", opacity: 1 }]}
      />

      <SpotifyLogo
        position={[0, logoY, -78.15]}
        rotation={[0, drift * 0.4, 0]}
        scale={1.82}
        opacity={logoOpacity}
        glow
      />

      {/* Green rim light near final phone */}
      <pointLight
        position={[-2.2, 0.2, -76.5]}
        intensity={16 * smoothstep(1240, 1380, frame)}
        color="#1DB954"
        distance={12}
      />

      <pointLight
        position={[2.4, -0.2, -79.2]}
        intensity={12 * smoothstep(1240, 1380, frame)}
        color="#59ff95"
        distance={12}
      />
    </group>
  );
};
