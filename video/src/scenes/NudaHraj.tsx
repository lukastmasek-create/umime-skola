import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { HEADING } from "../fonts";

// Kinetic type: NUDA. přiletí, dostane škrt, rozpadne se na glitch.
export const NudaHraj = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({ frame: f, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  const scale = interpolate(slam, [0, 1], [2.6, 1]);
  const blur = interpolate(slam, [0, 1], [24, 0]);
  const strike = interpolate(f, [42, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glitch = f > 54 ? Math.sin(f * 9.1) * (90 - f) * 1.2 : 0;
  const shake = f < 14 ? Math.sin(f * 7) * (14 - f) * 1.4 : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          fontFamily: HEADING,
          fontWeight: 800,
          fontSize: 380,
          color: C.paper,
          letterSpacing: -10,
          transform: `translate(${shake + glitch}px, ${shake}px) scale(${scale})`,
          filter: `blur(${blur}px)`,
          textShadow: f > 54 ? `${glitch}px 0 ${C.coral}, ${-glitch}px 0 ${C.blue}` : "none",
        }}
      >
        NUDA.
        <div
          style={{
            position: "absolute",
            left: -30,
            top: "52%",
            height: 26,
            width: `${strike * 108}%`,
            background: C.coral,
            borderRadius: 13,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
