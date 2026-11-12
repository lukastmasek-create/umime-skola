import type { ReactNode } from "react";
import { TearCard } from "@/components/TearCard";
import { PcardRing, PcardTape } from "@/components/PcardArt";

// Karta ve stylu výběru ZŠ / SŠ / přijímačky / maturita z úvodní stránky: naklopený papír,
// číslo, ikona v kroužené nálepce, titulek, text, šipka a lepicí páska. Dá se chytit a odtrhnout
// (TearCard). Bez ilustrace na spodku, ta existuje jen pro čtyři sekce.
// Rodič musí být `.pcard-pile` (položky se pak samy střídavě naklánějí).
export function PaperCard({
  href,
  accent,
  num,
  icon,
  title,
  text,
  children,
}: {
  href: string;
  accent: string;
  num?: number;
  icon: ReactNode;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <TearCard href={href} className="reveal pcard" accent={accent}>
      <span className="pcard-in pcard-flat">
        {num != null && (
          <span className="pcard-num" aria-hidden>
            {String(num).padStart(2, "0")}
          </span>
        )}
        <span className="pcard-iconwrap">
          <PcardRing />
          {icon}
        </span>
        <h3 className="pcard-title">{title}</h3>
        {text && <p className="pcard-text">{text}</p>}
        {children}
        <span className="pcard-go" aria-hidden>
          →
        </span>
      </span>
      <PcardTape />
    </TearCard>
  );
}
