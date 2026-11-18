export function HeroTitle({ line1, line2 }: { line1: string; line2: string }) {
  return <>{line1} <span className="neon-hl">{line2}</span></>;
}
