import Link from "next/link";
import { SectionWave } from "@/components/SectionWave";
import { Nebula } from "@/components/SpaceDecor";

// Obal vnitřních stránek ve stylu úvodní stránky: tmavá vesmírná zóna s hvězdami a mlhovinou,
// neonový nadpis a obsah v panelu `lobby-panel`. Sdílí ho Opakování, Moje mapa, Materiály
// a nástroje UčímePRO (AI doučovák, Fotka úlohy, Import z poznámek).
export function SpaceShell({
  title,
  subtitle,
  eyebrow,
  note,
  back,
  wide = false,
  full = false,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  note?: string;
  back?: { href: string; label: string };
  wide?: boolean;
  // Panel přes celou šířku obrazovky (s 16px okraji); hlavička a patička zůstávají na svém místě.
  full?: boolean;
  children: React.ReactNode;
}) {
  const width = wide ? "min(calc(100% - 2rem), 76rem)" : "min(calc(100% - 2rem), 56rem)";
  // Na úvodní stránce mají sekce vlastní okraje (`.space-page .zone > .lobby-panel` je zužuje na 72rem),
  // proto režim `full` přepíše jen padding a šířku nechá na 100 %, bez zúžení.
  const panelStyle = full ? { padding: "clamp(40px, 6vw, 72px) clamp(16px, 3vw, 40px)" } : { width };
  return (
    <div className="space-page">
      <section className="zone zone-space">
        <span className="px-stars" aria-hidden />
        <Nebula className="absolute inset-0 -z-10" />
        <div className="lobby-panel relative z-10" style={panelStyle}>
          {back && (
            <Link href={back.href} className="mb-4 inline-block text-sm font-bold text-[var(--accent-green)] hover:underline print:hidden">
              ← {back.label}
            </Link>
          )}
          {eyebrow && <p className="hero-in mb-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-green)]">{eyebrow}</p>}
          <h1 className="hero-in neon-h1 mb-3 text-3xl leading-[1.3] sm:text-4xl" style={{ ["--d" as string]: "0.1s" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="hero-in mb-2 max-w-2xl text-lg leading-relaxed text-[var(--muted)] print:hidden" style={{ ["--d" as string]: "0.22s" }}>
              {subtitle}
            </p>
          )}
          {note && <p className="mb-2 text-sm font-semibold text-[var(--accent-yellow)]">{note}</p>}
          <div className="mt-8">{children}</div>
        </div>
        <SectionWave fill="#0c0a24" glow="#8ea2ff" />
      </section>
    </div>
  );
}
