import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Úvod: samotné logo.
export const Intro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 90 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("brand/logo.svg")}
        style={{
          width: 1200,
          opacity: s,
          transform: `scale(${0.7 + 0.3 * s})`,
          filter: "drop-shadow(0 0 40px rgba(80,110,255,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};
