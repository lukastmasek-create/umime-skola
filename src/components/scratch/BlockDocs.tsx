"use client";

import { BLOCK_TYPES, CATEGORIES, SPECS, type BlockType } from "@/lib/scratch/engine";
import type { ScratchText } from "@/i18n/scratch";
import { BlockIcon, CategoryIcon } from "./ScratchIcons";
import { CAT_COLOR, INK, SKETCH_RADIUS } from "./theme";

// Stránka Lekce: přehled všech bloků jako klíč k použití. Tlačítko blok rovnou přidá do skriptu.
export function BlockDocs({ t, onAdd }: { t: ScratchText; onAdd: (type: BlockType) => void }) {
  return (
    <section
      aria-label={t.docsTitle}
      className="flex flex-col gap-6 rounded-2xl border-[3px] border-[#16132b] bg-[#fffaf0] p-5 shadow-[6px_6px_0_#16132b]"
      style={{ borderRadius: SKETCH_RADIUS }}
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold" style={{ color: INK, fontFamily: "var(--font-heading)" }}>
          {t.docsTitle}
        </h2>
        <p className="max-w-3xl text-sm" style={{ color: INK }}>
          {t.docsIntro}
        </p>
      </div>
      {CATEGORIES.map((cat) => {
        const types = BLOCK_TYPES.filter((type) => SPECS[type].category === cat);
        if (types.length === 0) return null;
        return (
          <div key={cat} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold" style={{ color: INK }}>
              <CategoryIcon category={cat} size={22} /> {t.categories[cat]}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {types.map((type) => (
                <DocCard key={type} type={type} t={t} onAdd={onAdd} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// Text bloku s výchozími hodnotami místo zástupných znaků, třeba „jdi na x: 0 y: 0“.
function fillDefaults(type: BlockType, t: ScratchText): string {
  const fields = SPECS[type].fields;
  return t.blocks[type].replace(/\{(\w+)\}/g, (_, key: string) => {
    const f = fields.find((x) => x.key === key);
    if (!f) return "";
    if (f.kind === "select") return t.options[String(f.def)] ?? String(f.def);
    if (f.kind === "color") return "■";
    return String(f.def);
  });
}

function DocCard({ type, t, onAdd }: { type: BlockType; t: ScratchText; onAdd: (type: BlockType) => void }) {
  const s = SPECS[type];
  const doc = t.docs[type];
  const params = s.fields;
  return (
    <article
      className="flex flex-col gap-2 border-2 border-[#16132b] p-3 shadow-[3px_3px_0_#16132b]"
      style={{ background: CAT_COLOR[s.category], color: INK, borderRadius: SKETCH_RADIUS }}
    >
      <div className="flex items-center gap-2 font-bold">
        <BlockIcon type={type} size={20} className="shrink-0" />
        <span>{fillDefaults(type, t)}</span>
      </div>
      <p className="text-sm">{doc?.what}</p>
      <div className="rounded-md bg-white/80 px-2 py-1 text-xs font-semibold">
        {t.docsExample}: {doc?.example}
      </div>
      {params.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs">
          {params.map((f) => {
            const shown = f.kind === "select" ? (t.options[String(f.def)] ?? String(f.def)) : f.kind === "color" ? "■" : String(f.def);
            return (
              <li key={f.key}>
                {t.fieldNames[f.key] ?? f.key}: {t.docsDefault} {shown}
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onAdd(type)}
        className="mt-auto self-start rounded-lg border-2 border-[#16132b] bg-white px-2.5 py-1 text-xs font-bold transition hover:-translate-y-0.5"
        style={{ color: INK }}
      >
        {t.docsTry}
      </button>
    </article>
  );
}
