import type { SectionDef } from '../types';
import { FILL, NAV, s } from './common';
// Lesson/game picker of a real course (action + classic games). In-game answer interaction clips: see NEXT_STEPS.md.
export const lessons: SectionDef = {
  id: 'lessons', title: 'Lessons & learning games', route: '/cs/kurzy/zakladni/cj-cteni-porozumeni/kurz/1', frames: s(40), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 300, w: 1500, yaw: -10, pitch: 2, v: { w: 900 } },
    { f: s(9), cx: 960, cy: 540, w: 1500, yaw: 9, pitch: 2, v: { w: 1000, cy: 480 } },
    { f: s(14), cx: 900, cy: 520, w: 1100, yaw: -8, pitch: 2, v: { w: 700, cx: 600, cy: 420 } },
    { f: s(20), cx: 1275, cy: 560, w: 1000, yaw: 12, pitch: 3, v: { w: 700 } },
    { f: s(27), cx: 960, cy: 600, w: 1900, yaw: -7, pitch: 2, v: { w: 1100 } },
    { f: s(34), cx: 960, cy: 540, w: 1500, yaw: 6, pitch: 1 },
    { f: s(40) - 1, ...FILL },
  ],
  layers: [
    { page: 'lekce', in: 0, out: s(38.2), scroll: [[0, 0], [s(8), 0], [s(14), 120], [s(22), 420], [s(30), 634], [s(36), 0]] },
    { page: 'multiplayer', in: s(38), fadeIn: s(1.2), slide: 90 },
  ],
  cursor: [
    { f: s(5), x: 1400, y: 250 }, { f: s(8), x: 555, y: 411 }, { f: s(11), x: 930, y: 411 }, { f: s(13), x: 1275, y: 411 },
    { f: s(16), x: 555, y: 540 }, { f: s(19), x: 1275, y: 666 }, { f: s(24), x: 700, y: 600 },
    { f: s(36), x: 1300, y: 400 }, { f: s(37.6), x: NAV.info[0], y: NAV.info[1] },
  ],
  clicks: [{ f: s(38), x: NAV.info[0], y: NAV.info[1] }],
  highlights: [
    { f0: s(7), f1: s(15), x: 440, y: 360, w: 1060, h: 150 }, { f0: s(15.5), f1: s(21), x: 440, y: 500, w: 1060, h: 230 },
  ],
};
