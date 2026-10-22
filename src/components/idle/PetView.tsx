"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PetArt, type PetMood } from "@/components/idle/PetArt";
import type { PetAction } from "@/lib/pets3d";
import type { SpeciesId } from "@/lib/idle/pets";

// three.js se stáhne až pro hlavního mazlíčka, náhledy jinde zůstávají lehké.
const Pet3D = dynamic(() => import("@/components/idle/Pet3D"), { ssr: false });

// Mazlíček ve hře: živý 3D model, do načtení (a bez WebGL) 2D kresba.
export function PetView({
  species,
  stage,
  mood,
  maxed,
  accessory,
  action,
  label,
}: {
  species: SpeciesId;
  stage: 1 | 2 | 3;
  mood: PetMood;
  maxed: boolean;
  accessory: string | null;
  action: { id: number; kind: PetAction } | null;
  label: string;
}) {
  const [state, setState] = useState<{ species: SpeciesId; status: "loading" | "ready" | "failed" }>({ species, status: "loading" });
  // Při změně druhu začíná načítání znovu.
  if (state.species !== species) setState({ species, status: "loading" });
  if (state.status === "failed") {
    return <PetArt species={species} stage={stage} mood={mood} maxed={maxed} size={230} accessory={accessory} />;
  }
  const ready = state.status === "ready";
  return (
    <div className="relative h-[250px] w-[250px]">
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}>
        <PetArt species={species} stage={stage} mood={mood} maxed={maxed} size={230} accessory={accessory} />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
        <Pet3D
          species={species}
          stage={stage}
          mood={mood}
          accessory={accessory}
          action={action}
          label={label}
          onReady={() => setState({ species, status: "ready" })}
          onError={() => setState({ species, status: "failed" })}
        />
      </div>
    </div>
  );
}
