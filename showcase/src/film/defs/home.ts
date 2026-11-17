import type { SectionDef } from '../types';
import { FILL, s } from './common';
// Page-px coordinates of the real homepage (1920x1080 viewport). Nav "Kurzy" at (720,28).
export const home: SectionDef = {
  id: 'home', title: 'Homepage', route: '/cs', frames: s(35), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 520, w: 2350, yaw: -15, pitch: 3, v: { w: 1250, cy: 330 } },
    { f: s(8), cx: 960, cy: 300, w: 1500, yaw: -8, pitch: 2, v: { w: 1100, cy: 290 } },       // hero headline
    { f: s(11.5), cx: 840, cy: 700, w: 1500, yaw: 12, pitch: 2, v: { w: 900, cx: 760, cy: 720 } }, // subject card + leaderboard
    { f: s(14), cx: 960, cy: 540, w: 2100, yaw: 10, pitch: 2, v: { w: 1300 } },                  // scroll: games
    { f: s(21), cx: 960, cy: 540, w: 2000, yaw: -9, pitch: 1, v: { w: 1300 } },                  // scroll: globe
    { f: s(27), cx: 960, cy: 540, w: 1700, yaw: 13, pitch: 3, v: { w: 1150 } },                  // sections hero moment
    { f: s(31), cx: 960, cy: 540, w: 2100, yaw: -6, pitch: 1 },
    { f: s(35) - 1, cx: 720, cy: 120, w: 1960, yaw: 0, pitch: 0, v: { cx: 960, cy: 540, w: 1960 } },
  ],
  layers: [
    { page: 'home', in: 0, scroll: [[0, 0], [s(12), 0], [s(14.5), 1020], [s(19), 1380], [s(23), 2700], [s(27), 3560], [s(31), 3640]] },
    { page: 'kurzy', in: s(33.2), fadeIn: s(1.2), slide: 90 },
  ],
  cursor: [{ f: s(5), x: 1500, y: 700 }, { f: s(6.5), x: 1080, y: 456 }, { f: s(8), x: 1090, y: 470 }, { f: s(31.6), x: 1090, y: 470 }, { f: s(32.8), x: 722, y: 30 }],
  clicks: [{ f: s(33.2), x: 722, y: 30 }],
  highlights: [{ f0: s(8.5), f1: s(10.5), x: 700, y: 440, w: 520, h: 50 }, { f0: s(11), f1: s(13), x: 480, y: 600, w: 300, h: 300 }],
  caption: [],
};
