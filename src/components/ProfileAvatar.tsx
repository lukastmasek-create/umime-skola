"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Avatar } from "@/components/Avatar";
import { getAvatarModel } from "@/lib/avatars3d";
import type { FrameId } from "@/lib/cosmetics";
import type { AvatarCustom, AvatarParts } from "@/lib/avatar-custom";

// three.js se stáhne jen tehdy, když má zvolený avatar 3D model.
const Avatar3D = dynamic(() => import("@/components/Avatar3D"), { ssr: false });

// Avatar v hlavičce profilu: živá 3D postava, pokud ji avatar má, jinak (a do načtení) SVG.
export function ProfileAvatar({
  id,
  label,
  frame,
  custom,
  onParts,
  snapshotRef,
  className = "h-[190px] w-[150px]",
  svgSize = 104,
}: {
  id: string | undefined;
  label: string;
  frame?: FrameId | null;
  custom?: AvatarCustom;
  onParts?: (parts: AvatarParts) => void;
  snapshotRef?: { current: (() => string | null) | null };
  className?: string;
  svgSize?: number;
}) {
  const model = getAvatarModel(id);
  const [state, setState] = useState<{ model: string | null; status: "loading" | "ready" | "failed" }>({
    model,
    status: "loading",
  });
  // Při změně avatara začíná načítání znovu.
  if (state.model !== model) setState({ model, status: "loading" });

  if (!model || state.status === "failed") return <Avatar id={id} size={svgSize} frame={frame} />;
  const ready = state.status === "ready";
  return (
    <div className={`relative shrink-0 self-center ${className}`}>
      <div
        className={`absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <Avatar id={id} size={svgSize} frame={frame} />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
        <Avatar3D
          key={model}
          src={model}
          label={label}
          custom={custom}
          onParts={onParts}
          snapshotRef={snapshotRef}
          onReady={() => setState({ model, status: "ready" })}
          onError={() => setState({ model, status: "failed" })}
        />
      </div>
    </div>
  );
}
