import type { SectionDef } from '../types';
import { FILL, s } from './common';
export const intro: SectionDef = {
  id: 'intro', title: 'Brand reveal', route: '/', frames: s(18), entrance: 'dark-open', exit: 'push-through', chainsToNext: true, intro: true,
  shots: [
    { f: 0, cx: 1890, cy: 8, w: 240, yaw: 38, pitch: 8, v: { w: 200 } },
    { f: s(3.2), cx: 1500, cy: 120, w: 700, yaw: 34, pitch: 6 },
    { f: s(7), cx: 960, cy: 540, w: 2750, yaw: 24, pitch: 4, v: { w: 2200, cx: 1100 } },
    { f: s(11.5), cx: 960, cy: 540, w: 2500, yaw: -16, pitch: 3, v: { w: 1500, cx: 800, cy: 420 } },
    { f: s(15), cx: 960, cy: 540, w: 2200, yaw: 5, pitch: 1, v: { w: 1300, cy: 420 } },
    { f: s(18) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/logo.webp', in: s(3.4), out: s(11.2), fadeIn: s(1.2), fadeOut: s(0.9), bright: [[s(3.4), 0.0], [s(4.6), 1]] },
    { page: 'home', in: s(10.4), fadeIn: s(1.0) },
  ],
};
