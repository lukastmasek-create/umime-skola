import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Scene } from "./Scene";
import { smoothstep } from "./utils/animation";

export const SpotifyShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const openingBlack = 1 - smoothstep(0, 58, frame);
  const closingBlack = smoothstep(1460, 1500, frame);
  const black = Math.max(openingBlack, closingBlack);

  const finalTextIn = smoothstep(1338, 1438, frame);
  const finalTextY = interpolate(finalTextIn, [0, 1], [28, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#030504" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{
          fov: 35,
          near: 0.05,
          far: 240,
          position: [6.8, 1.55, 10.5],
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#030504",
        }}
      >
        <Scene frame={frame} fps={fps} />
      </ThreeCanvas>

      {/* Cinematic vignette */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 44%, rgba(0,0,0,0) 36%, rgba(0,0,0,0.42) 74%, rgba(0,0,0,0.82) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Subtle top/bottom falloff for mobile-safe contrast */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(3,5,4,0.22), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(3,5,4,0.44))",
        }}
      />

      {/* Final typography */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 122,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: finalTextIn,
          transform: `translateY(${finalTextY}px)`,
          pointerEvents: "none",
          fontFamily:
            'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            color: "#F7F9F7",
            fontSize: 78,
            lineHeight: 0.92,
            fontWeight: 850,
            letterSpacing: -3.8,
            textShadow:
              "0 8px 30px rgba(0,0,0,0.55), 0 0 36px rgba(29,185,84,0.08)",
          }}
        >
          Spotify
        </div>

        <div
          style={{
            marginTop: 20,
            color: "rgba(247,249,247,0.68)",
            fontSize: 32,
            lineHeight: 1.15,
            fontWeight: 500,
            letterSpacing: -0.7,
            textShadow: "0 6px 24px rgba(0,0,0,0.55)",
          }}
        >
          Music for every moment.
        </div>
      </div>

      {/* Open / close fade */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundColor: "#000",
          opacity: black,
        }}
      />

      {/* Very restrained static grain/vignette sheen, deterministic and non-animated */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.028,
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #fff 0.4px, transparent 0.5px), radial-gradient(circle at 70% 60%, #fff 0.35px, transparent 0.45px)",
          backgroundSize: "7px 9px, 11px 13px",
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
