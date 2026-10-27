"use client";

import dynamic from "next/dynamic";

// Hry míchají karty a písmena náhodně, takže se nesmí vykreslit na serveru (jinak by nesouhlasila hydratace).
export const ClassicGame = dynamic(() => import("./ClassicGameInner").then((m) => m.ClassicGameInner), {
  ssr: false,
  loading: () => <div className="card h-64 animate-pulse" aria-hidden />,
});
