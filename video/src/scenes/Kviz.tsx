import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { BODY, HEADING } from "../fonts";
import { Glass, Neon, Toast } from "../ui";

const OPTIONS = [
  { t: "54", x: 0 },
  { t: "56", x: 1 },
  { t: "64", x: 2 },
];
const CLICK = 70;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Kviz = () => {
  const f = useCurrentFrame();
  const correct = f >= CLICK;
  // Kurzor jede k odpovědi „56“ a klikne.
  const cx = interpolate(f, [22, CLICK], [1450, 960], { easing: Easing.bezier(0.3, 0, 0.2, 1), ...clamp });
  const cy = interpolate(f, [22, CLICK], [900, 555], { easing: Easing.bezier(0.3, 0, 0.2, 1), ...clamp });
  const press = interpolate(f, [CLICK - 3, CLICK, CLICK + 6], [1, 0.8, 1], clamp);
  const xp = Math.round(interpolate(f, [CLICK + 8, CLICK + 70], [0, 12480], { easing: Easing.out(Easing.cubic), ...clamp }));

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: 60 }}>
        <Neon size={110} delay={6} color="#ffe9a8" glow={C.yellow}>
          Kurzy ke každému předmětu.
        </Neon>
      </div>
      <div style={{ position: "absolute", top: 230 }}>
        <Glass width={1000} height={450}>
          <div style={{ padding: "80px 70px 0", fontFamily: BODY, fontWeight: 700, color: C.paper }}>
            <div style={{ fontSize: 66, textAlign: "center", marginBottom: 50 }}>7 × 8 = ?</div>
            <div style={{ display: "flex", gap: 36, justifyContent: "center" }}>
              {OPTIONS.map((o) => {
                const good = o.x === 1 && correct;
                return (
                  <div
                    key={o.t}
                    style={{
                      width: 260,
                      padding: "28px 0",
                      textAlign: "center",
                      fontFamily: HEADING,
                      fontWeight: 800,
                      fontSize: 62,
                      borderRadius: 22,
                      background: good ? C.green : "rgba(255,255,255,0.08)",
                      border: `2px solid ${good ? C.green : "rgba(255,255,255,0.2)"}`,
                      boxShadow: good ? `0 0 40px ${C.green}aa` : "none",
                      transform: good ? `scale(${1 + 0.06 * Math.sin(Math.min(f - CLICK, 12) / 12 * Math.PI)})` : "none",
                    }}
                  >
                    {o.t}
                  </div>
                );
              })}
            </div>
          </div>
        </Glass>
      </div>
      <div style={{ position: "absolute", top: 720 }}>
        <Toast title="Správně!" sub={`+50 XP · celkem ${xp.toLocaleString("cs-CZ")}`} delay={CLICK + 4} />
      </div>
      <div style={{ position: "absolute", bottom: 50, display: "flex", gap: 18 }}>
        {["Matematika", "Čeština", "Fyzika", "Dějepis", "Angličtina", "Chemie"].map((t, i) => {
          const k = interpolate(f, [12 + i * 5, 30 + i * 5], [0, 1], clamp);
          return (
            <div
              key={t}
              style={{
                padding: "12px 26px",
                borderRadius: 40,
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 30,
                color: C.paper,
                background: "rgba(255,255,255,0.1)",
                border: "2px solid rgba(255,255,255,0.22)",
                opacity: k,
                transform: `translateY(${(1 - k) * 30}px)`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
      {/* kurzor */}
      <svg
        width="54"
        height="54"
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: cx, top: cy, transform: `scale(${press})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.6))" }}
      >
        <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#16132b" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
