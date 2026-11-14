"use client";

import { useState } from "react";
import { CodeExercises } from "@/components/CodeExercises";
import { SketchIcon, type SketchIconKind } from "@/components/SketchIcons";
import { CodePlayground } from "@/components/CodePlayground";
import { CodeSandbox } from "@/components/CodeSandbox";

// Přepínač mezi cvičeními a volným editorem s živým náhledem.
export function CodeWorkspace() {
  const [mode, setMode] = useState<"cviceni" | "volny" | "list">("cviceni");
  const tabs: { key: "cviceni" | "volny" | "list"; label: string; icon: SketchIconKind }[] = [
    { key: "cviceni", label: "Cvičení", icon: "pencil" },
    { key: "volny", label: "Volný editor", icon: "code" },
    { key: "list", label: "Čistý list", icon: "scroll" },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Režim" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = mode === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(t.key)}
              className={`sk-tab inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-bold transition-transform active:translate-y-0.5 ${
                active
                  ? "border-[#ffc933] bg-[#ffc933] text-[#16132b] shadow-[3px_3px_0_#16132b]"
                  : "border-[#35305f] bg-[#221e44] text-[#cfc8e4] hover:border-[#8d99ff]"
              }`}
            >
              <SketchIcon kind={t.icon} size={18} />
              {t.label}
            </button>
          );
        })}
      </div>
      {mode === "cviceni" && <CodeExercises />}
      {mode === "volny" && <CodePlayground />}
      {mode === "list" && <CodeSandbox />}
    </div>
  );
}
