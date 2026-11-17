import type { SectionDef } from '../types';
import { FILL, s } from './common';
// "Stálé hry" hub: Základna, Mazlíčci, Farma, Město, Ekonomika. Ends by opening Farma.
export const hub: SectionDef = {
  id: 'hub', title: 'Persistent games hub', route: '/cs/stale-hry', frames: s(26), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 540, w: 2000, yaw: -12, pitch: 2, v: { w: 1200 } },
    { f: s(8), cx: 790, cy: 400, w: 1100, yaw: 9, pitch: 2, v: { w: 800 } },
    { f: s(13), cx: 1100, cy: 700, w: 1100, yaw: -9, pitch: 2, v: { w: 800 } },
    { f: s(19), cx: 1260, cy: 400, w: 900, yaw: 6, pitch: 1, v: { w: 640 } },
    { f: s(26) - 1, ...FILL },
  ],
  layers: [
    { page: 'hry', in: 0, out: s(23.4), scroll: [[0, 0]] },
    { page: 'img:shots/g-farma.webp', in: s(23.2), fadeIn: s(1.2), slide: 0 },
  ],
  cursor: [
    { f: s(4), x: 1500, y: 300 }, { f: s(7), x: 624, y: 400 }, { f: s(9), x: 951, y: 400 }, { f: s(11), x: 624, y: 708 },
    { f: s(13), x: 951, y: 708 }, { f: s(16), x: 1260, y: 400 }, { f: s(21), x: 1260, y: 400 },
  ],
  clicks: [{ f: s(23), x: 1260, y: 400 }],
  highlights: [
    { f0: s(6), f1: s(8.5), x: 470, y: 261, w: 310, h: 280 }, { f0: s(8.5), f1: s(10.5), x: 796, y: 261, w: 310, h: 280 },
    { f0: s(10.5), f1: s(12.5), x: 470, y: 561, w: 310, h: 294 }, { f0: s(12.5), f1: s(15), x: 796, y: 561, w: 310, h: 294 },
    { f0: s(15.5), f1: s(22.5), x: 1105, y: 261, w: 310, h: 280 },
  ],
};
