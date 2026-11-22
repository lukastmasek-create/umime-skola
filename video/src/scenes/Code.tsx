import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Glass, Neon, Toast } from "../ui";

const CODE = `for (let i = 1; i <= 3; i++) {
  console.log("Ahoj, světe! " + i);
}
const hvezdy = "★".repeat(5);
console.log(hvezdy);`;
const OUT = ["Ahoj, světe! 1", "Ahoj, světe! 2", "Ahoj, světe! 3", "★★★★★"];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const colorize = (line: string) =>
  line.split(/(\bfor\b|\blet\b|\bconst\b|"[^"]*"|\d+|console\.log)/g).map((t, i) => {
    const col = /^(for|let|const)$/.test(t) ? C.coral : /^"/.test(t) ? C.yellow : /^\d+$/.test(t) ? C.blue : t === "console.log" ? C.green : C.paper;
    return (
      <span key={i} style={{ color: col }}>
        {t}
      </span>
    );
  });

export const Code = () => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [8, 62], [0, CODE.length], clamp));
  const typed = CODE.slice(0, n);
  const lines = typed.split("\n");
  const run = f >= 66;
  const shown = Math.floor(interpolate(f, [68, 90], [0, OUT.length + 0.99], clamp));
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: 60 }}>
        <Neon size={110} delay={4} color="#d6ffe8" glow={C.green}>
          Kód na hraní.
        </Neon>
      </div>
      <div style={{ position: "absolute", top: 250, display: "flex", gap: 40 }}>
        <Glass width={880} height={470}>
          <pre style={{ margin: 0, padding: "80px 40px 0", fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 31, lineHeight: 1.55 }}>
            {lines.map((l, i) => (
              <div key={i}>
                {colorize(l)}
                {i === lines.length - 1 && f % 20 < 12 && <span style={{ color: C.paper }}>▌</span>}
              </div>
            ))}
          </pre>
        </Glass>
        <Glass width={560} height={470} style={{ background: "rgba(8,8,24,0.9)" }}>
          <div style={{ padding: "80px 40px 0", fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 34, color: C.green, lineHeight: 1.6 }}>
            <div style={{ color: "#8a849f", fontSize: 24, marginBottom: 10 }}>{run ? "▶ výstup" : "▶ čeká na spuštění"}</div>
            {OUT.slice(0, run ? shown : 0).map((o) => (
              <div key={o}>{o}</div>
            ))}
          </div>
        </Glass>
      </div>
      <div style={{ position: "absolute", top: 780 }}>
        <Toast title="Napiš. Spusť. Vidíš výsledek." sub="Programování pro začátečníky" delay={78} />
      </div>
    </AbsoluteFill>
  );
};
