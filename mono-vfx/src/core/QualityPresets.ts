export type QualityName = 'preview' | 'high' | 'ultra';
export interface Quality {
  envSize: number;        // PMREM source cube resolution
  roundingGrid: number;   // bevel facet density for convex solids (3 = coarse, 5 = fine)
  particles: number;
  shadows: boolean;
  shadowMap: number;
  mirrorFloor: boolean;
  antialias: boolean;
  grain: boolean;
}
/** Quality never changes timing – only fidelity. */
export const QUALITY: Record<QualityName, Quality> = {
  preview: {envSize: 128, roundingGrid: 3, particles: 60, shadows: false, shadowMap: 512, mirrorFloor: true, antialias: false, grain: false},
  high: {envSize: 256, roundingGrid: 4, particles: 180, shadows: true, shadowMap: 2048, mirrorFloor: true, antialias: true, grain: true},
  ultra: {envSize: 512, roundingGrid: 6, particles: 420, shadows: true, shadowMap: 4096, mirrorFloor: true, antialias: true, grain: true},
};
