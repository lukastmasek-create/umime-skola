import React from 'react';
import {ObsidianSlash} from './effects/katana/ObsidianSlash';
import {FPS} from './core/Timeline';
import type {QualityName} from './core/QualityPresets';

export type Family = 'katana' | 'fracture' | 'liquid' | 'depth' | 'portal' | 'assembly' | 'hyperspeed' | 'gravity' | 'typography' | 'micro';
export interface EffectDef {
  id: string;
  family: Family;
  seconds: number;
  component: React.FC<{quality: QualityName; orientation: 'portrait' | 'landscape'}>;
}
/** Only effects that are really implemented get registered. */
export const EFFECTS: EffectDef[] = [
  {id: 'MONO-01-ObsidianSlash', family: 'katana', seconds: 14, component: ObsidianSlash},
];
export const FORMATS = {
  portrait: {width: 1080, height: 1920, suffix: ''},
  landscape: {width: 1920, height: 1080, suffix: '-16x9'},
} as const;
export {FPS};
