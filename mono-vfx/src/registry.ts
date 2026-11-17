import React from 'react';
import list from './effects.json';
import type {EffectProps} from './core/Stage';
import {ObsidianSlash} from './effects/katana/ObsidianSlash';
import {TriplePrecisionCut, DURATION as D02} from './effects/katana/TriplePrecisionCut';
import {GlassBlade, DURATION as D03} from './effects/katana/GlassBlade';
import {KatanaShockwave, DURATION as D04} from './effects/katana/KatanaShockwave';
import {InfiniteSlice, DURATION as D05} from './effects/katana/InfiniteSlice';
import {CrystalImpact, DURATION as D06} from './effects/fracture/CrystalImpact';
import {GlassExplosion, D07, ReverseShatter, D08, FracturePropagation, D09, FrozenDestruction, D10} from './effects/fracture/others';
import {ChromeMetamorphosis, D11, LiquidCrown, D12, MercuryCube, D13, LiquidRibbon, D14, ChromePortal, D15} from './effects/liquid/effects';
import {ExplodedView, D16, LayeredGlass, D17, GeometricDeconstruction, D18, FloatingArchitecture, D19, ImpossibleDepth, D20} from './effects/depth/effects';
import {BlackHoleCollapse, D21, WormholeFlight, D22, MirrorPortal, D23, FoldingReality, D24, PortalRing, D25} from './effects/portal/effects';
import {MagneticCube, D26, ParticleSphere, D27, ReverseExplosion, D28, MagneticSculpture, D29, ParticleToSolid, D30} from './effects/assembly/effects';
import {InfiniteTunnel, D31, MacroToUniverse, D32, SpeedRampSculpture, D33, HyperspaceCorridor, D34, OneShotTransformation, D35} from './effects/hyperspeed/effects';
import {GravityFlip, D36, DominoCascade, D37, ZeroGravity, D38, ControlledCollapse, D39, OrbitalMechanics, D40} from './effects/gravity/effects';
import {TypographySlash, D41, ChromeTypography, D42, TypographyAssembly, D43, LiquidTypography, D44, TypographyExplosion, D45} from './effects/typography/effects';
import {MagneticAttraction, D46, PrecisionLock, D47, SpringCompression, D48, KineticSwitch, D49, MechanicalChainReaction, D50} from './effects/micro/effects';
import {FPS} from './core/Timeline';

export type Family = 'katana' | 'fracture' | 'liquid' | 'depth' | 'portal' | 'assembly' | 'hyperspeed' | 'gravity' | 'typography' | 'micro';
export interface EffectDef { id: string; family: Family; seconds: number; component: React.FC<EffectProps>; }

const IMPL: Record<string, {seconds: number; component: React.FC<EffectProps>}> = {
  'MONO-01-ObsidianSlash': {seconds: 14, component: ObsidianSlash},
  'MONO-02-TriplePrecisionCut': {seconds: D02, component: TriplePrecisionCut},
  'MONO-03-GlassBlade': {seconds: D03, component: GlassBlade},
  'MONO-04-KatanaShockwave': {seconds: D04, component: KatanaShockwave},
  'MONO-05-InfiniteSlice': {seconds: D05, component: InfiniteSlice},
  'MONO-06-CrystalImpact': {seconds: D06, component: CrystalImpact},
  'MONO-07-GlassExplosion': {seconds: D07, component: GlassExplosion},
  'MONO-08-ReverseShatter': {seconds: D08, component: ReverseShatter},
  'MONO-09-FracturePropagation': {seconds: D09, component: FracturePropagation},
  'MONO-10-FrozenDestruction': {seconds: D10, component: FrozenDestruction},
  'MONO-11-ChromeMetamorphosis': {seconds: D11, component: ChromeMetamorphosis},
  'MONO-12-LiquidCrown': {seconds: D12, component: LiquidCrown},
  'MONO-13-MercuryCube': {seconds: D13, component: MercuryCube},
  'MONO-14-LiquidRibbon': {seconds: D14, component: LiquidRibbon},
  'MONO-15-ChromePortal': {seconds: D15, component: ChromePortal},
  'MONO-16-ExplodedView': {seconds: D16, component: ExplodedView},
  'MONO-17-LayeredGlass': {seconds: D17, component: LayeredGlass},
  'MONO-18-GeometricDeconstruction': {seconds: D18, component: GeometricDeconstruction},
  'MONO-19-FloatingArchitecture': {seconds: D19, component: FloatingArchitecture},
  'MONO-20-ImpossibleDepth': {seconds: D20, component: ImpossibleDepth},
  'MONO-21-BlackHoleCollapse': {seconds: D21, component: BlackHoleCollapse},
  'MONO-22-WormholeFlight': {seconds: D22, component: WormholeFlight},
  'MONO-23-MirrorPortal': {seconds: D23, component: MirrorPortal},
  'MONO-24-FoldingReality': {seconds: D24, component: FoldingReality},
  'MONO-25-PortalRing': {seconds: D25, component: PortalRing},
  'MONO-26-MagneticCube': {seconds: D26, component: MagneticCube},
  'MONO-27-ParticleSphere': {seconds: D27, component: ParticleSphere},
  'MONO-28-ReverseExplosion': {seconds: D28, component: ReverseExplosion},
  'MONO-29-MagneticSculpture': {seconds: D29, component: MagneticSculpture},
  'MONO-30-ParticleToSolid': {seconds: D30, component: ParticleToSolid},
  'MONO-31-InfiniteTunnel': {seconds: D31, component: InfiniteTunnel},
  'MONO-32-MacroToUniverse': {seconds: D32, component: MacroToUniverse},
  'MONO-33-SpeedRampSculpture': {seconds: D33, component: SpeedRampSculpture},
  'MONO-34-HyperspaceCorridor': {seconds: D34, component: HyperspaceCorridor},
  'MONO-35-OneShotTransformation': {seconds: D35, component: OneShotTransformation},
  'MONO-36-GravityFlip': {seconds: D36, component: GravityFlip},
  'MONO-37-DominoCascade': {seconds: D37, component: DominoCascade},
  'MONO-38-ZeroGravity': {seconds: D38, component: ZeroGravity},
  'MONO-39-ControlledCollapse': {seconds: D39, component: ControlledCollapse},
  'MONO-40-OrbitalMechanics': {seconds: D40, component: OrbitalMechanics},
  'MONO-41-TypographySlash': {seconds: D41, component: TypographySlash},
  'MONO-42-ChromeTypography': {seconds: D42, component: ChromeTypography},
  'MONO-43-TypographyAssembly': {seconds: D43, component: TypographyAssembly},
  'MONO-44-LiquidTypography': {seconds: D44, component: LiquidTypography},
  'MONO-45-TypographyExplosion': {seconds: D45, component: TypographyExplosion},
  'MONO-46-MagneticAttraction': {seconds: D46, component: MagneticAttraction},
  'MONO-47-PrecisionLock': {seconds: D47, component: PrecisionLock},
  'MONO-48-SpringCompression': {seconds: D48, component: SpringCompression},
  'MONO-49-KineticSwitch': {seconds: D49, component: KineticSwitch},
  'MONO-50-MechanicalChainReaction': {seconds: D50, component: MechanicalChainReaction},
};
/** Only ids listed in effects.json AND implemented are registered. */
export const EFFECTS: EffectDef[] = (list as {id: string; family: Family}[]).map((e) => {
  const i = IMPL[e.id];
  if (!i) throw new Error('effects.json lists unimplemented effect ' + e.id);
  return {...e, ...i};
});
export const FORMATS = {
  portrait: {width: 1080, height: 1920, suffix: ''},
  landscape: {width: 1920, height: 1080, suffix: '-16x9'},
} as const;
export {FPS};
