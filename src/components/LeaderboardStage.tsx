"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { StageEntry } from "@/components/LeaderboardStage3D";

// three.js se stahuje až u žebříčku; do načtení (a bez WebGL) zůstává statické podium.
const Stage3D = dynamic(() => import("@/components/LeaderboardStage3D"), { ssr: false });

export function LeaderboardStage({
  entries,
  highlightId,
  label,
  fallback,
}: {
  entries: StageEntry[];
  highlightId?: string;
  label: string;
  fallback: ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  if (status === "failed") return <>{fallback}</>;
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-[var(--edge)] shadow-[0_6px_0_var(--edge)]">
      <div
        className="relative aspect-[5/4] w-full sm:aspect-[21/9]"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #6a4fd6 0%, #3a2b7d 55%, #221a52 100%)" }}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 ${status === "ready" ? "opacity-100" : "opacity-0"}`}>
          <Stage3D entries={entries} highlightId={highlightId} label={label} onReady={() => setStatus("ready")} onError={() => setStatus("failed")} />
        </div>
        {status === "loading" && <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse" aria-hidden>🏆</div>}
      </div>
    </div>
  );
}
