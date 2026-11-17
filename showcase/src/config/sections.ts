export type ShowcaseSection = {
  id: string; title: string; route: string; durationFrames: number; fps: number;
  enabledInMaster: boolean; renderStandalone: boolean; entranceTransition: string; exitTransition: string;
  shot?: string; // capture id in public/shots
};
export const FPS = 60;
const s = (n: number) => Math.round(n * FPS);
export const SECTIONS: ShowcaseSection[] = [
  { id: 'intro', title: 'Brand reveal', route: '/', durationFrames: s(18), fps: FPS, enabledInMaster: true, renderStandalone: true, entranceTransition: 'dark-open', exitTransition: 'push-through', shot: 'home' },
  { id: 'home', title: 'Homepage', route: '/cs', durationFrames: s(35), fps: FPS, enabledInMaster: true, renderStandalone: true, entranceTransition: 'push-through', exitTransition: 'shared-element', shot: 'home' },
];
