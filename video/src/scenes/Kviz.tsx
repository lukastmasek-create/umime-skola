import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { BODY, HEADING } from "../fonts";

const CARDS = [
  { q: "7 × 8 = ?", a: "56", color: C.coral, x: -520, y: -300, r: -8 },
  { q: "Vlastní jména píšeme…", a: "velkým", color: C.yellow, x: 480, y: -310, r: 6 },
  { q: "Voda vře při…", a: "100 °C", color: C.green, x: -380, y: 300, r: 5 },
  { q: "Hauptstadt von Spanien?", a: "Madrid", color: C.blue, x: 440, y: 310, r: -6 },
];

export const Kviz = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const xp = Math.round(interpolate(f, [20, 170], [0, 12480], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const out = interpolate(f, [190, 210], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out }}>
      {CARDS.map((c, i) => {
        const s = spring({ frame: f - i * 12, fps, config: { damping: 11, stiffness: 120 } });
        const answered = f > i * 12 + 36;
        const float = Math.sin((f + i * 20) / 22) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 520,
              padding: "36px 40px",
              borderRadius: 28,
              background: C.paper,
              color: C.ink,
              border: `5px solid ${C.ink}`,
              boxShadow: `10px 10px 0 ${c.color}`,
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 40,
              transform: `translate(${c.x}px, ${c.y + float + (1 - s) * 500}px) rotate(${c.r * s}deg) scale(${s})`,
            }}
          >
            <div>{c.q}</div>
            <div
              style={{
                marginTop: 18,
                fontFamily: HEADING,
                fontWeight: 800,
                fontSize: 64,
                color: answered ? c.color : "transparent",
                filter: answered ? "none" : "blur(12px)",
              }}
            >
              {answered ? c.a : "?"}
            </div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", fontFamily: HEADING, fontWeight: 800, color: C.paper }}>
        <div style={{ fontSize: 190, color: C.yellow, letterSpacing: -4 }}>{xp.toLocaleString("cs-CZ")}</div>
        <div style={{ fontSize: 64 }}>XP</div>
      </div>
    </AbsoluteFill>
  );
};
