import { PaperCard } from "@/components/PaperCard";
import { ProIcon } from "@/components/pro/ProIcon";
import { FEATURE_COLORS } from "@/components/pro/ProToolPile";

// Nástroje školního tarifu jako karty v Obchodu (stejný vzhled jako karty UčímePRO).
// Každá karta vede rovnou na svou záložku v /pro/skola přes #kotvu.
const SCHOOL_TOOLS = [
  { id: "gaps", icon: "skola-mezery", title: "Mapa mezer", text: "Kde má třída nejvíc potíží. U každého tématu je hotová 20minutová lekce." },
  { id: "live", icon: "skola-soubeh", title: "Souběžná hodina", text: "Zadej cvičení a sleduj, kdo je kde, v reálném čase." },
  { id: "test", icon: "skola-test", title: "Nepsaný test", text: "Krátký test bez stresu, hned vyhodnocený." },
  { id: "variants", icon: "skola-zadani", title: "Různá zadání", text: "Každý žák dostane jiné otázky a jiné pořadí možností." },
  { id: "exit", icon: "skola-exit", title: "Exit ticket", text: "Krátká otázka na konec hodiny. Hned vidíš, co zůstalo." },
  { id: "cover", icon: "skola-suplovani", title: "Suplování", text: "Připravené zadání pro suplování, když chybíš ty nebo kolega." },
  { id: "meeting", icon: "skola-schuzka", title: "Průvodce schůzkami", text: "Podklady a body pro schůzku s rodiči nebo kolegy." },
  { id: "pace", icon: "skola-tempo", title: "Tempo ve skupinách", text: "Třída se sama rozdělí do skupin A, B a C podle výsledků." },
  { id: "content", icon: "skola-obsah", title: "Vlastní obsah", text: "Vlastní otázky z tvého učiva, AI je pomůže připravit." },
  { id: "dilna", icon: "skola-dilna", title: "Učitelská dílna", text: "Hry na párování, řazení, příběh nebo mluvení z textu či fotky." },
  { id: "support", icon: "skola-podpora", title: "Podpora", text: "Něco nefunguje nebo potřebuješ poradit s tarifem? Napiš nám." },
] as const;

export function SchoolShopCards({ locale }: { locale: string }) {
  return (
    <div>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Nástroje pro učitele školního tarifu UčímePRO. Klikni na kartu a otevře se rovnou ten nástroj.
      </p>
      <div className="pcard-pile pcard-pile-wide">
        {SCHOOL_TOOLS.map((tool, i) => (
          <PaperCard
            key={tool.id}
            href={`/${locale}/pro/skola#${tool.id}`}
            accent={FEATURE_COLORS[i % FEATURE_COLORS.length]}
            num={i + 1}
            icon={<ProIcon name={tool.icon} className="pcard-icon size-14 text-[#f6f1e4]" />}
            title={tool.title}
            text={tool.text}
          />
        ))}
      </div>
    </div>
  );
}
