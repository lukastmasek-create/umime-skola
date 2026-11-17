import React from 'react';
import {ObsidianSlash} from './effects/katana/ObsidianSlash';
import {TriplePrecisionCut, DURATION as D02} from './effects/katana/TriplePrecisionCut';
import {GlassBlade, DURATION as D03} from './effects/katana/GlassBlade';
import {KatanaShockwave, DURATION as D04} from './effects/katana/KatanaShockwave';
import {InfiniteSlice, DURATION as D05} from './effects/katana/InfiniteSlice';
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
  {id: 'MONO-02-TriplePrecisionCut', family: 'katana', seconds: D02, component: TriplePrecisionCut},
  {id: 'MONO-03-GlassBlade', family: 'katana', seconds: D03, component: GlassBlade},
  {id: 'MONO-04-KatanaShockwave', family: 'katana', seconds: D04, component: KatanaShockwave},
  {id: 'MONO-05-InfiniteSlice', family: 'katana', seconds: D05, component: InfiniteSlice},
];
export const FORMATS = {
  portrait: {width: 1080, height: 1920, suffix: ''},
  landscape: {width: 1920, height: 1080, suffix: '-16x9'},
} as const;
export {FPS};
