import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { BODY } from "../fonts";
import { Glass, Neon, Stage, Toast, useLayout } from "../ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BLOCKS = [
  { t: "Po kliknutí na vlajku", c: C.yellow },
  { t: "opakuj 4×", c: "#ff9a3c" },
  { t: "   posuň o 100 kroků", c: C.blue },
  { t: "   otoč o 90°", c: C.blue },
];

export const Scratch = () => {
  const f = useCurrentFrame();
  const { panel, title, v } = useLayout();
  const start = 36;
  const p = interpolate(f, [start, start + 40], [0, 4], { easing: Easing.linear, ...clamp });
  const side = Math.min(Math.floor(p), 3);
  const q = p >= 4 ? 1 : p - side;
  const pts = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  const [ax, ay] = pts[side];
  const [bx, by] = pts[Math.min(side + 1, 4)];
  const D = 220;
  const x = (ax + (bx - ax) * q) * D;
  const y = (ay + (by - ay) * q) * D;
  const sw = v ? panel : 720;
  return (
    <Stage
      title={
        <Neon size={title} delay={4} color="#ffe9a8" glow="#ff9a3c">
          Skládej bloky. Programuj.
        </Neon>
      }
    >
      <div style={{ display: "flex", flexDirection: v ? "column" : "row", gap: v ? 30 : 40 }}>
        <Glass width={sw} height={v ? 430 : 470}>
          <div style={{ padding: "84px 0 0 60px", fontFamily: BODY, fontWeight: 700, fontSize: 34 }}>
            {BLOCKS.map((b, i) => {
              const k = interpolate(f, [4 + i * 7, 24 + i * 7], [0, 1], { easing: Easing.out(Easing.back(1.6)), ...clamp });
              return (
                <div
                  key={b.t}
                  style={{
                    width: sw - 120,
                    padding: "14px 28px",
                    boxSizing: "border-box",
                    background: b.c,
                    color: C.ink,
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
        <Glass width={sw} height={v ? 470 : 470} style={{ background: "rgba(246,241,228,0.95)" }}>
          <div style={{ position: "absolute", left: (sw - D - 90) / 2, top: 110 }}>
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
      <Toast title="Postavička běží podle bloků." sub="Scratch pro děti" delay={62} />
    </Stage>
  );
};
