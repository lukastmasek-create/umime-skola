"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DollView3D from "@/components/classic/DollView3D";
import { DOLLS, SLOTS } from "@/lib/dress";
const full = Object.fromEntries(SLOTS.map((s) => [s, 0]));
function Inner() {
  const q = useSearchParams();
  const d = DOLLS.find((x) => x.id === q.get("d")) ?? DOLLS[0];
  return (
    <div style={{ height: 700, width: 420, background: `linear-gradient(${d.bg[0]},${d.bg[1]})` }}>
      <DollView3D dollId={d.id} worn={full} mood={q.get("m") === "sad" ? "sad" : "happy"} event={null} label={d.id} onError={() => {}} />
    </div>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
