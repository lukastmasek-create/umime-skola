import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { BODY } from "../fonts";
import { Glass, Neon, Toast, ease } from "../ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BLOCKS = [
  { t: "Po kliknutí na vlajku", c: C.yellow, ink: C.ink },
  { t: "opakuj 4×", c: "#ff9a3c", ink: C.ink },
  { t: "   posuň o 100 kroků", c: C.blue, ink: C.ink },
  { t: "   otoč o 90°", c: C.blue, ink: C.ink },
];

export const Scratch = () => {
  const f = useCurrentFrame();
  const start = 36;
  const p = interpolate(f, [start, start + 40], [0, 4], { easing: Easing.linear, ...clamp });
  const side = Math.min(Math.floor(p), 3);
  const q = p - side;
  const pts = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  const [ax, ay] = pts[Math.min(side, 3)];
  const [bx, by] = pts[Math.min(side + 1, 4)];
  const x = (ax + (bx - ax) * (p >= 4 ? 1 : q)) * 220;
  const y = (ay + (by - ay) * (p >= 4 ? 1 : q)) * 220;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: 60 }}>
        <Neon size={110} delay={4} color="#ffe9a8" glow="#ff9a3c">
          Skládej bloky. Programuj.
        </Neon>
      </div>
      <div style={{ position: "absolute", top: 250, display: "flex", gap: 40 }}>
        <Glass width={720} height={470}>
          <div style={{ padding: "90px 60px 0", fontFamily: BODY, fontWeight: 700, fontSize: 34 }}>
            {BLOCKS.map((b, i) => {
              const k = interpolate(f, [4 + i * 7, 24 + i * 7], [0, 1], { easing: Easing.out(Easing.back(1.6)), ...clamp });
              return (
                <div
                  key={b.t}
                  style={{
                    width: 560,
                    padding: "16px 28px",
                    background: b.c,
                    color: b.ink,
                    borderRadius: 14,
                    marginBottom: 6,
                    whiteSpace: "pre",
                    opacity: k,
                    transform: `translate(${(1 - k) * (i % 2 ? 300 : -300)}px, ${(1 - k) * -80}px) rotate(${(1 - k) * (i % 2 ? 12 : -12)}deg)`,
                    boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
                  }}
                >
                  {b.t}
                </div>
              );
            })}
          </div>
        </Glass>
        <Glass width={720} height={470} style={{ background: "rgba(246,241,228,0.95)" }}>
          <div style={{ position: "absolute", left: 200, top: 120 }}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 90,
                height: 90,
                borderRadius: 26,
                background: C.brand,
                boxShadow: `0 8px 0 ${C.ink}33`,
                transform: `rotate(${p * 90}deg)`,
              }}
            >
              <div style={{ position: "absolute", left: 20, top: 26, width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
              <div style={{ position: "absolute", left: 54, top: 26, width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
              <div style={{ position: "absolute", left: 24, top: 52, width: 42, height: 20, borderBottom: "9px solid #fff", borderRadius: "0 0 30px 30px" }} />
            </div>
          </div>
        </Glass>
      </div>
      <div style={{ position: "absolute", top: 780 }}>
        <Toast title="Postavička běží podle tvých bloků." sub="Scratch pro děti" delay={62} />
      </div>
    </AbsoluteFill>
  );
};
