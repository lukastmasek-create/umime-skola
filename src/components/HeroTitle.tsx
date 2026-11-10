// Nadpis úvodní stránky: neonový, psaný po písmenech (animace v globals.css, třída .neon-*).
// Je to serverová komponenta bez stavu, každé písmeno dostane pořadí v proměnné --i.
import type { ReactNode } from "react";

function typed(text: string, offset: number): { nodes: ReactNode[]; next: number } {
  let i = offset;
  const words = text.split(" ");
  const nodes = words.map((word, wi) => {
    const chars = Array.from(word).map((ch) => (
      <span key={i} className="neon-c" style={{ ["--i" as string]: i++ }}>
        {ch}
      </span>
    ));
    i++; // mezera mezi slovy se počítá jako jeden znak, ať psaní nezrychluje
    // Slova drží pohromadě; text bez mezer (japonština) se smí zalomit kdekoli.
    const word_ = words.length > 1 ? <span className="neon-w">{chars}</span> : chars;
    return (
      <span key={wi}>
        {word_}
        {wi < words.length - 1 ? " " : null}
      </span>
    );
  });
  return { nodes, next: i };
}

export function HeroTitle({ line1, line2 }: { line1: string; line2: string }) {
  const a = typed(line1, 0);
  const b = typed(line2, a.next);
  return (
    <>
      <span className="sr-only">{`${line1} ${line2}`}</span>
      <span aria-hidden="true" className="neon-title" style={{ ["--n" as string]: b.next }}>
        {a.nodes} <span className="neon-hl">{b.nodes}</span>
      </span>
    </>
  );
}
