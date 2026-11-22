import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { BODY, HEADING } from "../fonts";
import { Glass, Neon, Stage, Toast, useLayout } from "../ui";

const OPTIONS = ["54", "56", "64"];
const CLICK = 70;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BTN = 250;
const GAP = 28;

export const Kviz = () => {
  const f = useCurrentFrame();
  const { panel, title, v } = useLayout();
  const correct = f >= CLICK;
  const move = Easing.bezier(0.3, 0, 0.2, 1);
  // Kurzor je v řádku s tlačítky: cíl = střed tlačítka „56“.
  const cx = interpolate(f, [22, CLICK], [BTN * 2.4, BTN * 1.5 + GAP], { easing: move, ...clamp });
  const cy = interpolate(f, [22, CLICK], [260, 95], { easing: move, ...clamp });
  const press = interpolate(f, [CLICK - 3, CLICK, CLICK + 6], [1, 0.8, 1], clamp);
  const xp = Math.round(interpolate(f, [CLICK + 8, CLICK + 70], [0, 12480], { easing: Easing.out(Easing.cubic), ...clamp }));

  return (
    <Stage
      title={
        <Neon size={title} delay={6} color="#ffe9a8" glow={C.yellow}>
          Kurzy ke každému předmětu.
        </Neon>
      }
    >
      <Glass width={panel} height={v ? 520 : 450}>
        <div style={{ padding: "80px 0 0", fontFamily: BODY, fontWeight: 700, color: C.paper, textAlign: "center" }}>
          <div style={{ fontSize: 66, marginBottom: 50 }}>7 × 8 = ?</div>
          <div style={{ position: "relative", display: "flex", gap: GAP, justifyContent: "center" }}>
            {OPTIONS.map((t, i) => {
              const good = i === 1 && correct;
              return (
                <div
                  key={t}
                  style={{
                    width: BTN,
                    padding: "28px 0",
                    fontFamily: HEADING,
                    fontWeight: 800,
                    fontSize: 62,
                    borderRadius: 22,
                    background: good ? C.green : "rgba(255,255,255,0.08)",
                    border: `2px solid ${good ? C.green : "rgba(255,255,255,0.2)"}`,
                    boxShadow: good ? `0 0 40px ${C.green}aa` : "none",
                    transform: good ? `scale(${1 + 0.06 * Math.sin((Math.min(f - CLICK, 12) / 12) * Math.PI)})` : "none",
                  }}
                >
                  {t}
                </div>
              );
            })}
            <svg
              width="54"
              height="54"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                marginLeft: -((BTN * 3 + GAP * 2) / 2),
                transform: `translate(${cx}px, ${cy}px) scale(${press})`,
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,.6))",
              }}
            >
              <path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#16132b" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Glass>
      <Toast title="Správně!" sub={`+50 XP · celkem ${xp.toLocaleString("cs-CZ")}`} delay={CLICK + 4} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, maxWidth: panel }}>
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
    </Stage>
  );
};
