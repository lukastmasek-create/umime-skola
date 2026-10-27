"use client";

import { useState } from "react";

// Otáčející se planeta: plynulé video s průhledností (WebM, 60 fps) nad statickým obrázkem.
// Když prohlížeč video s průhledností neumí (např. Safari), zůstane statický obrázek
// a ten se vymění za dřívější animované webp. Při vypnutých animacích video skryje CSS (.planet-video).
export function PlanetAnim({ width, height }: { width: number; height: number }) {
  const [videoOk, setVideoOk] = useState(true);
  return (
    <span className="relative block" style={{ width, height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={videoOk ? "/home/planeta.webp" : "/home/anim/planeta.webp"}
        alt=""
        aria-hidden
        width={width}
        height={height}
        draggable={false}
        className="h-full w-full object-contain"
      />
      {videoOk && (
        <video
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="planet-video absolute inset-0 h-full w-full object-contain"
        >
          <source src="/home/anim/planeta.webm" type='video/webm; codecs="vp9"' onError={() => setVideoOk(false)} />
        </video>
      )}
    </span>
  );
}
