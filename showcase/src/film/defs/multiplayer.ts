import type { SectionDef } from '../types';
import { FILL, NAV, s } from './common';
// Public lobby (join code + create game). Logged-in room/game flow clips: see NEXT_STEPS.md.
export const multiplayer: SectionDef = {
  id: 'multiplayer', title: 'Live multiplayer', route: '/cs/hrat-spolecne', frames: s(30), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(3), cx: 960, cy: 470, w: 1800, yaw: -12, pitch: 2, v: { w: 1100 } },
    { f: s(7), cx: 710, cy: 470, w: 760, yaw: 8, pitch: 2, v: { w: 640 } },
    { f: s(12), cx: 710, cy: 510, w: 700, yaw: 6, pitch: 1, v: { w: 640 } },
    { f: s(17), cx: 1083, cy: 450, w: 900, yaw: -12, pitch: 2, v: { w: 700 } },
    { f: s(22), cx: 960, cy: 470, w: 1700, yaw: 10, pitch: 3, v: { w: 1000 } },
    { f: s(26), cx: 960, cy: 470, w: 1900, yaw: -4, pitch: 1 },
    { f: s(30) - 1, ...FILL },
  ],
  layers: [
    { page: 'multiplayer', in: 0, out: s(28.4) },
    { page: 'img:shots/multiplayer-typed.webp', in: s(9.3), out: s(28.4), fadeIn: 6 },
    { page: 'hry', in: s(28.2), fadeIn: s(1.2), slide: 90 },
  ],
  cursor: [
    { f: s(4), x: 1500, y: 700 }, { f: s(8.8), x: 710, y: 473 }, { f: s(13), x: 710, y: 547 }, { f: s(18), x: 1083, y: 547 },
    { f: s(26.4), x: 1300, y: 300 }, { f: s(27.8), x: NAV.ucivo[0], y: NAV.ucivo[1] },
  ],
  clicks: [{ f: s(9), x: 710, y: 473 }, { f: s(13.6), x: 710, y: 547 }, { f: s(28), x: NAV.ucivo[0], y: NAV.ucivo[1] }],
  highlights: [
    { f0: s(6), f1: s(10), x: 475, y: 255, w: 475, h: 340 }, { f0: s(14), f1: s(17), x: 485, y: 510, w: 450, h: 70 }, { f0: s(17.5), f1: s(22), x: 970, y: 255, w: 475, h: 340, color: '#ffd24d' },
  ],
};
