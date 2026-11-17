import type { CamKey } from '../core/CameraRig';

/** Camera shot in page-pixel space (1920x1080 page). v* override for vertical (9:16). */
export type Shot = {
  f: number; cx: number; cy: number; w: number; yaw?: number; pitch?: number; fov?: number;
  v?: { cx?: number; cy?: number; w?: number; yaw?: number; pitch?: number };
  ease?: (t: number) => number;
};
export type LayerSpec = {
  page: string;               // PAGES id (strips) or "img:<path>" (single image)
  in: number; out?: number;   // frames: visible from `in` to `out` (inclusive fades)
  fadeIn?: number; fadeOut?: number;
  scroll?: [number, number][]; // [frame, scrollY css px] keyframes (eased)
  slide?: number;              // px slide-in distance on entry (x)
  bright?: [number, number][]; // [frame, brightness]
};
export type CursorKey = { f: number; x: number; y: number };
export type Click = { f: number; x: number; y: number };
export type Highlight = { f0: number; f1: number; x: number; y: number; w: number; h: number; color?: string };

export type SectionDef = {
  id: string; title: string; route: string; frames: number;
  entrance: string; exit: string; chainsToNext?: boolean; // last frame == first frame of next section
  shots: Shot[]; layers: LayerSpec[];
  cursor?: CursorKey[]; clicks?: Click[]; highlights?: Highlight[];
  intro?: boolean; // dark open (sweep light, exposure ramp)
  finale?: boolean;
  floaters?: Floater[];
  caption?: { f0: number; f1: number; text: string; sub?: string }[];
};


/** Finale: spatial interface layers that float around the monitor then converge into the screen. */
export type Floater = { src: string; from: [number, number, number]; ry: number; f0: number; fConverge: number; fEnd: number };
