import { lerp, lerp3, easeInOutCubic } from "./animation";

export type CameraFrame = {
  position: [number, number, number];
  look: [number, number, number];
  fov: number;
};

type CameraKey = {
  frame: number;
  position: [number, number, number];
  look: [number, number, number];
  fov?: number;
};

const DEFAULT_FOV = 35;

const keys: CameraKey[] = [
  { frame: 0, position: [6.8, 1.55, 10.5], look: [0, 0.05, 0], fov: 34 },
  { frame: 60, position: [4.5, 1.15, 9.1], look: [0, 0.05, 0] },
  { frame: 180, position: [1.55, 0.42, 6.9], look: [0, 0.1, 0] },
  { frame: 240, position: [0.62, 0.22, 6.55], look: [0, 0.16, 1.35] },
  { frame: 300, position: [0.18, 0.28, 6.25], look: [0, 0.2, 2.0] },
  { frame: 360, position: [0.95, 0.42, 5.05], look: [0, 0.1, 0.0] },
  { frame: 420, position: [1.9, 0.6, -0.8], look: [0, 0.0, -7.5] },
  { frame: 510, position: [-1.35, 0.72, -4.8], look: [0, 0.0, -9.5] },
  { frame: 600, position: [1.05, 0.5, -8.6], look: [0, -0.05, -14.0] },
  { frame: 660, position: [1.45, 0.45, -11.5], look: [0, 0.0, -22.0] },
  { frame: 720, position: [0.9, 0.32, -14.0], look: [0, 0.05, -24.0] },
  { frame: 780, position: [0.42, 0.18, -15.35], look: [0, 0.0, -24.2] },
  { frame: 840, position: [2.1, 0.5, -16.8], look: [0, 0.1, -26.0] },
  { frame: 900, position: [1.2, 0.4, -20.5], look: [0, 0.0, -31.0] },
  { frame: 960, position: [-0.8, 0.3, -28.0], look: [0, 0.1, -36.0] },
  { frame: 1040, position: [0.6, 0.5, -36.0], look: [0, 0.0, -46.0] },
  { frame: 1140, position: [-0.5, 0.35, -48.0], look: [0, 0.1, -60.0] },
  { frame: 1200, position: [0.0, 0.5, -54.0], look: [0, 0.2, -68.0] },
  { frame: 1280, position: [0.0, 0.65, -61.0], look: [0, 0.35, -77.0] },
  { frame: 1360, position: [0.0, 0.55, -63.8], look: [0, 0.2, -78.0] },
  { frame: 1500, position: [0.0, 0.45, -64.2], look: [0, 0.15, -78.0], fov: 34 },
];

export const getCameraFrame = (frame: number): CameraFrame => {
  if (frame <= keys[0].frame) {
    return {
      position: keys[0].position,
      look: keys[0].look,
      fov: keys[0].fov ?? DEFAULT_FOV,
    };
  }

  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];

    if (frame >= a.frame && frame <= b.frame) {
      const raw = (frame - a.frame) / Math.max(1, b.frame - a.frame);
      const t = easeInOutCubic(raw);

      return {
        position: lerp3(a.position, b.position, t),
        look: lerp3(a.look, b.look, t),
        fov: lerp(a.fov ?? DEFAULT_FOV, b.fov ?? DEFAULT_FOV, t),
      };
    }
  }

  const last = keys[keys.length - 1];
  return {
    position: last.position,
    look: last.look,
    fov: last.fov ?? DEFAULT_FOV,
  };
};
