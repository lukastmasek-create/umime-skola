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
    // Bez rámečku a bez malého okénka: scéna přesahuje užší sloupec stránky a zabírá šířku okna i velkou část výšky.
    <div className="relative left-1/2 mb-8 w-[min(calc(100vw-1rem),72rem)] -translate-x-1/2 overflow-hidden rounded-[2rem]">
      <div
        className="relative h-[clamp(320px,52vw,640px)] w-full"
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
