import type { Locale } from "./config";

// Texty skládačky vlastního tarifu. Ceny jsou návrh a platí jen orientačně (platby zatím nejsou spuštěné).
export type BuilderText = {
  title: string; hint: string; monthly: string; yearly: string; total: string; perMonth: string; perYear: string;
  allIn: string; capped: string; pick: string; note: string; items: Record<string, { title: string; text: string }>;
};

const cs: BuilderText = {
  title: "Poskládej si vlastní PRO", hint: "Zaplať jen za to, co opravdu použiješ. Když vybereš skoro všechno, nepřeplatíš: cena nikdy nepřekročí celé PRO.",
  monthly: "Měsíčně", yearly: "Ročně", total: "Tvoje cena", perMonth: "měsíčně", perYear: "ročně",
  allIn: "Máš všechno z PRO", capped: "Místo {n} platíš jen cenu celého PRO.", pick: "Vyber aspoň jednu funkci.",
  note: "Ceny jsou návrh a platí, až se spustí platby. Teď ještě nejde nic koupit. Rok = 10 měsíců.",
  items: {
    tutor: { title: "AI doučovač", text: "Vysvětlí krok za krokem, výsledek neřekne." },
    plan: { title: "Plán učení", text: "Týdenní plán podle toho, co ti nejde." },
    photo: { title: "Fotka úlohy", text: "Z fotky úlohy dostaneš podobné příklady." },
    notes: { title: "Fotky z poznámek", text: "Z poznámek se udělají kartičky a kvízy." },
    offline: { title: "Offline", text: "Stáhni lekce a uč se bez internetu." },
  },
};
const en: BuilderText = {
  title: "Build your own PRO", hint: "Pay only for what you use. If you pick almost everything you never overpay: the price never goes above full PRO.",
  monthly: "Monthly", yearly: "Yearly", total: "Your price", perMonth: "per month", perYear: "per year",
  allIn: "You have everything in PRO", capped: "Instead of {n} you pay only the full PRO price.", pick: "Pick at least one feature.",
  note: "Prices are a proposal and apply once payments launch. Nothing can be bought yet. A year = 10 months.",
  items: {
    tutor: { title: "AI tutor", text: "Explains step by step, never gives the answer." },
    plan: { title: "Study plan", text: "A weekly plan based on what you find hard." },
    photo: { title: "Task photo", text: "Snap a task and get similar examples." },
    notes: { title: "Photos of notes", text: "Notes become flashcards and quizzes." },
    offline: { title: "Offline", text: "Download lessons and learn without internet." },
  },
};
export function getBuilderText(l: Locale): BuilderText { return l === "cs" ? cs : en; }
