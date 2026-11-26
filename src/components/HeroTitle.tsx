import { Fragment } from "react";

// Slova nadpisu jsou samostatné prvky (--i = pořadí), aby mohla na úvodní stránce dopadnout jedno po druhém
// (styly v home-motion.css). Jinde se chovají jako obyčejný text.
function words(text: string, from: number) {
  return text.split(/\s+/).filter(Boolean).map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="hero-w" style={{ ["--i" as string]: from + i }}>{w}</span>
    </Fragment>
  ));
}

export function HeroTitle({ line1, line2 }: { line1: string; line2: string }) {
  const n1 = line1.split(/\s+/).filter(Boolean).length;
  return (
    <>
      {words(line1, 0)} <span className="neon-hl">{words(line2, n1)}</span>
    </>
  );
}
