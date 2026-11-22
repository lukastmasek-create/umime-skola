import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { HEADING } from "../fonts";

export const Outro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12, stiffness: 100 } });
  const url = interpolate(f, [24, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 48, flexDirection: "column" }}>
      <Img
        src={staticFile("brand/logo.svg")}
        style={{ width: 1100, transform: `scale(${0.7 + 0.3 * s})`, opacity: s }}
      />
      <div
        style={{
          fontFamily: HEADING,
          fontWeight: 800,
          fontSize: 84,
          color: C.yellow,
          opacity: url,
          transform: `translateY(${(1 - url) * 30}px)`,
        }}
      >
        ucimesehrou.org
      </div>
    </AbsoluteFill>
  );
};
