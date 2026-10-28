// Pozadí sekce s globusem: noční obloha s polární září, padajícími hvězdami, kometou a znaky
// předmětů, které se vznášejí nahoru. Jen CSS animace (bez JavaScriptu), při omezení animací v systému stojí.

const SYMBOLS: { t: string; color: string; x: number; y: number; size: number; dur: number; delay: number; blur: number }[] = [
  { t: "ě š ř", color: "#ffc933", x: 4, y: 70, size: 22, dur: 15, delay: -3, blur: 0 },
  { t: "π", color: "#7ee0b0", x: 12, y: 18, size: 34, dur: 19, delay: -8, blur: 1 },
  { t: "H₂O", color: "#7fdbd8", x: 22, y: 88, size: 20, dur: 17, delay: -5, blur: 0 },
  { t: "Hi!", color: "#8fd0ff", x: 31, y: 8, size: 24, dur: 21, delay: -12, blur: 1 },
  { t: "∑", color: "#7ee0b0", x: 44, y: 92, size: 30, dur: 16, delay: -2, blur: 0 },
  { t: "ä ö ü", color: "#ffb26b", x: 52, y: 6, size: 22, dur: 18, delay: -9, blur: 1 },
  { t: "1918", color: "#c9b8ff", x: 63, y: 84, size: 22, dur: 20, delay: -6, blur: 0 },
  { t: "Я Ж Ш", color: "#ff8a6b", x: 71, y: 12, size: 24, dur: 17, delay: -14, blur: 0 },
  { t: "√x", color: "#7ee0b0", x: 80, y: 90, size: 26, dur: 22, delay: -7, blur: 1 },
  { t: "📖", color: "#ff9ec7", x: 88, y: 20, size: 28, dur: 16, delay: -1, blur: 0 },
  { t: "E=mc²", color: "#8fd0ff", x: 94, y: 62, size: 20, dur: 19, delay: -11, blur: 1 },
  { t: "🌿", color: "#b6e36a", x: 8, y: 44, size: 26, dur: 21, delay: -4, blur: 1 },
  { t: "ABC", color: "#ffc933", x: 91, y: 40, size: 22, dur: 18, delay: -10, blur: 0 },
  { t: "α β", color: "#c9b8ff", x: 37, y: 52, size: 18, dur: 23, delay: -13, blur: 2 },
];

const SHOOTING = [
  { top: 6, left: 14, a: 24, delay: 1, dur: 9 },
  { top: 14, left: 52, a: 32, delay: 4.5, dur: 12 },
  { top: 3, left: 78, a: 20, delay: 8, dur: 10 },
  { top: 30, left: 6, a: 28, delay: 12, dur: 14 },
  { top: 22, left: 66, a: 36, delay: 16, dur: 11 },
];

export function GlobeSky() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-aurora">
        <span style={{ left: "-10%", top: "10%", width: 520, height: 520, background: "#3a6bff" }} />
        <span style={{ right: "-6%", top: "36%", width: 420, height: 420, background: "#b05cff", animationDelay: "-5s" }} />
        <span style={{ left: "34%", bottom: "-18%", width: 460, height: 360, background: "#1fd6a8", animationDelay: "-10s" }} />
      </div>
      {SHOOTING.map((s, i) => (
        <span key={i} className="globe-shoot" style={{ top: `${s.top}%`, left: `${s.left}%`, ["--a" as string]: `${s.a}deg`, ["--dur" as string]: `${s.dur}s`, ["--delay" as string]: `${s.delay}s` }} />
      ))}
      <span className="globe-comet" />
      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className="globe-sym"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            color: s.color,
            fontSize: s.size,
            filter: s.blur ? `blur(${s.blur}px)` : undefined,
            textShadow: `0 0 14px ${s.color}88`,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ["--dx" as string]: `${i % 2 ? 26 : -26}px`,
          }}
        >
          {s.t}
        </span>
      ))}
    </div>
  );
}
