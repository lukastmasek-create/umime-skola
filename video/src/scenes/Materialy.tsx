import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { BODY } from "../fonts";
import { Glass, Neon, Stage, Toast, ease, useLayout } from "../ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LEVELS = [
  { t: "Úplné základy", h: "1.–3. třída", c: C.green, w: 0.95 },
  { t: "Základní učivo", h: "4.–6. třída", c: C.blue, w: 0.75 },
  { t: "Pokročilé", h: "7.–9. třída", c: C.yellow, w: 0.55 },
  { t: "Příprava na přijímačky", h: "9. třída", c: C.coral, w: 0.35 },
];

export const Materialy = () => {
  const f = useCurrentFrame();
  const { panel, title, v } = useLayout();
  return (
    <Stage
      title={
        <Neon size={title} delay={4} color="#cfeaff" glow={C.blue}>
          Materiály k učivu.
        </Neon>
      }
    >
      <Glass width={v ? panel : 1100} height={v ? 620 : 500}>
        <div style={{ padding: "70px 56px 0", display: "flex", flexDirection: "column", gap: v ? 40 : 26, fontFamily: BODY, color: C.paper }}>
          {LEVELS.map((l, i) => {
            const k = interpolate(f, [14 + i * 9, 40 + i * 9], [0, 1], { easing: ease, ...clamp });
            return (
              <div key={l.t} style={{ opacity: k, transform: `translateX(${(1 - k) * -120}px)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: v ? 34 : 36 }}>
                  <span>{l.t}</span>
                  <span style={{ color: l.c, fontSize: 28 }}>{l.h}</span>
                </div>
                <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.1)", marginTop: 8 }}>
                  <div style={{ height: 14, borderRadius: 7, background: l.c, width: `${l.w * 100 * k}%`, boxShadow: `0 0 18px ${l.c}99` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Glass>
      <Toast title="Přečti si to. Pak procvič." sub="Výtahy ze všech předmětů" delay={58} />
    </Stage>
  );
};
