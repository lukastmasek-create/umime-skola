import React from "react";
import { spring } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { StudioLighting } from "./components/StudioLighting";
import { Architecture } from "./components/Architecture";
import { SpotifyPhone } from "./components/SpotifyPhone";
import { AlbumCard3D } from "./components/AlbumCard3D";
import { PlaylistCard3D } from "./components/PlaylistCard3D";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import { Waveform3D } from "./components/Waveform3D";
import { GlassUniverse } from "./components/GlassUniverse";
import { Finale } from "./components/Finale";
import { lerp3, smoothstep, clamp01 } from "./utils/animation";

const RevealPhone: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const orbit = spring({
    frame: frame - 0,
    fps,
    config: { damping: 22, mass: 1.1, stiffness: 44 },
    durationInFrames: 210,
  });

  const rotationY = -1.18 + orbit * 1.29;

  const introOpacity = 1 - smoothstep(158, 212, frame);
  const nowPlayingOpacity = smoothstep(158, 212, frame);

  const logoOpacity =
    smoothstep(88, 168, frame) * (1 - smoothstep(196, 228, frame));

  const exit =
    1 -
    smoothstep(345, 420, frame);

  const scale = 0.95 * Math.max(0.001, exit);

  if (exit <= 0.001) return null;

  return (
    <SpotifyPhone
      position={[0, 0, 0]}
      rotation={[0.015, rotationY, -0.008]}
      scale={scale}
      screens={[
        { kind: "intro", opacity: introOpacity },
        { kind: "blinding", opacity: nowPlayingOpacity },
      ]}
      logoOpacity={logoOpacity}
    />
  );
};

const AlbumSequence: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const main = spring({
    frame: frame - 184,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 88 },
  });

  const second = spring({
    frame: frame - 236,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 88 },
  });

  const third = spring({
    frame: frame - 266,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 88 },
  });

  const fourth = spring({
    frame: frame - 296,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 88 },
  });

  const exit = 1 - smoothstep(372, 430, frame);

  const cardStart: [number, number, number] = [0, 0.05, 0.2];

  const mainT = clamp01(main);
  const secondT = clamp01(second);
  const thirdT = clamp01(third);
  const fourthT = clamp01(fourth);

  const mainPos = lerp3(cardStart, [0, 0.08, 2.25], mainT);
  const secondPos = lerp3(cardStart, [-2.05, 0.88, 1.08], secondT);
  const thirdPos = lerp3(cardStart, [1.95, -0.62, 0.76], thirdT);
  const fourthPos = lerp3(cardStart, [1.25, 1.62, -0.28], fourthT);

  if (exit <= 0.001) return null;

  return (
    <>
      <AlbumCard3D
        kind="blinding"
        position={mainPos}
        rotation={[-0.02, 0.15, 0.03]}
        scale={Math.max(0.001, (0.18 + main * 0.98) * exit)}
        frame={frame}
        seed={1}
      />

      <AlbumCard3D
        kind="getlucky"
        position={secondPos}
        rotation={[-0.06, -0.28, 0.02]}
        scale={Math.max(0.001, (0.18 + second * 0.9) * exit)}
        frame={frame}
        seed={2}
      />

      <AlbumCard3D
        kind="birds"
        position={thirdPos}
        rotation={[0.03, 0.3, -0.04]}
        scale={Math.max(0.001, (0.18 + third * 0.9) * exit)}
        frame={frame}
        seed={3}
      />

      <AlbumCard3D
        kind="fein"
        position={fourthPos}
        rotation={[-0.08, 0.12, 0.08]}
        scale={Math.max(0.001, (0.18 + fourth * 0.86) * exit)}
        frame={frame}
        seed={4}
      />
    </>
  );
};

const PlaylistSequence: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const exit = 1 - smoothstep(666, 720, frame);

  const items = [
    {
      kind: "today" as const,
      position: [-1.45, 0.62, -5.25] as [number, number, number],
      rotation: [0.02, 0.24, 0.03] as [number, number, number],
      start: 432,
    },
    {
      kind: "rapcaviar" as const,
      position: [1.35, -0.34, -7.2] as [number, number, number],
      rotation: [0.0, -0.28, -0.02] as [number, number, number],
      start: 452,
    },
    {
      kind: "mint" as const,
      position: [-1.15, -0.76, -9.2] as [number, number, number],
      rotation: [0.02, 0.22, 0.02] as [number, number, number],
      start: 472,
    },
    {
      kind: "discover" as const,
      position: [1.52, 0.74, -11.1] as [number, number, number],
      rotation: [-0.02, -0.3, 0.0] as [number, number, number],
      start: 492,
    },
    {
      kind: "release" as const,
      position: [0.15, 0.15, -13.05] as [number, number, number],
      rotation: [0.0, 0.12, 0.0] as [number, number, number],
      start: 512,
    },
  ];

  if (exit <= 0.001) return null;

  return (
    <>
      {items.map((item, i) => {
        const p = spring({
          frame: frame - item.start,
          fps,
          config: { damping: 19, mass: 0.9, stiffness: 78 },
        });

        const s = Math.max(0.001, clamp01(p) * exit);

        return (
          <PlaylistCard3D
            key={item.kind}
            kind={item.kind}
            position={item.position}
            rotation={item.rotation}
            scale={s}
            frame={frame}
            seed={i * 1.7 + 1}
          />
        );
      })}
    </>
  );
};

export const Scene: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  return (
    <>
      <CameraRig frame={frame} />
      <StudioLighting frame={frame} />
      <Architecture />

      <RevealPhone frame={frame} fps={fps} />
      <AlbumSequence frame={frame} fps={fps} />
      <PlaylistSequence frame={frame} fps={fps} />

      <SpotifyPlayer
        frame={frame}
        fps={fps}
        position={[0, 0.3, -24]}
      />

      <Waveform3D
        frame={frame}
        fps={fps}
        start={780}
        end={940}
        position={[0, -1.2, -23.8]}
        rotation={[0.05, 0.12, 0.02]}
      />

      <GlassUniverse frame={frame} />
      <Finale frame={frame} fps={fps} />
    </>
  );
};
