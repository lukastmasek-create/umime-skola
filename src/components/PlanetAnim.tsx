"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Otáčející se planeta: plynulé video s průhledností (WebM, 60 fps) nad statickým obrázkem.
// Když prohlížeč video s průhledností neumí (např. Safari), zůstane statický obrázek
// a ten se vymění za dřívější animované webp. Při vypnutých animacích video skryje CSS (.planet-video).
export function PlanetAnim({ width, height }: { width: number; height: number }) {
  const [videoOk, setVideoOk] = useState(true);
  const [still, setStill] = useState(false);
  // Při omezeném pohybu se video vůbec nenačítá (CSS ho jen skryje, ale stahovalo by se dál).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (prefersReducedMotion()) setStill(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  return (
    <span className="relative block" style={{ width, height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img loading="lazy" decoding="async"
        src={videoOk || still ? "/home/planeta.webp" : "/home/anim/planeta.webp"}
        alt=""
        aria-hidden
        width={width}
        height={height}
        draggable={false}
        className="h-full w-full object-contain"
      />
      {videoOk && !still && (
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="planet-video absolute inset-0 h-full w-full object-contain"
        >
          <source src="/home/anim/planeta.webm" type='video/webm; codecs="vp9"' onError={() => setVideoOk(false)} />
        </video>
      )}
    </span>
  );
}
