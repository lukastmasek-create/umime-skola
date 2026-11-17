import type { SectionDef } from '../types';
import { FILL, s } from './common';
// Real flow: Kurzy (4 sections) -> Základní škola (subject islands) -> course "Čtení s porozuměním" -> lesson/game picker.
export const courses: SectionDef = {
  id: 'courses', title: 'Courses & subjects', route: '/cs/kurzy', frames: s(36), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(3), cx: 960, cy: 540, w: 2300, yaw: -14, pitch: 3, v: { w: 1300, cy: 420 } },
    { f: s(7), cx: 763, cy: 442, w: 1000, yaw: 10, pitch: 2, v: { w: 700 } },
    { f: s(10), cx: 1162, cy: 451, w: 1000, yaw: -10, pitch: 2, v: { w: 700 } },
    { f: s(13), cx: 763, cy: 845, w: 1000, yaw: 8, pitch: 2, v: { w: 700 } },
    { f: s(16), cx: 960, cy: 540, w: 1500, yaw: 0, pitch: 0, v: { w: 1000 } },
    { f: s(19), cx: 960, cy: 540, w: 2100, yaw: -10, pitch: 2 },                       // category page (islands)
    { f: s(23), cx: 960, cy: 480, w: 1500, yaw: 8, pitch: 1, v: { w: 1000 } },
    { f: s(27), cx: 960, cy: 330, w: 1500, yaw: -6, pitch: 1, v: { w: 900 } },        // course levels
    { f: s(31), cx: 960, cy: 400, w: 1700, yaw: 4, pitch: 1, v: { w: 1000 } },
    { f: s(36) - 1, ...FILL },
  ],
  layers: [
    { page: 'kurzy', in: 0, out: s(17.4) },
    { page: 'zakladni', in: s(17.2), out: s(27.2), fadeIn: s(1), fadeOut: s(0.6), slide: 90, scroll: [[s(17), 0], [s(22), 0], [s(25), 160]] },
    { page: 'kurs', in: s(26.9), out: s(33.2), fadeIn: s(1), fadeOut: s(0.6), slide: 90 },
    { page: 'lekce', in: s(33), fadeIn: s(1), slide: 90 },
  ],
  cursor: [
    { f: s(4), x: 1500, y: 300 }, { f: s(7.5), x: 763, y: 442 }, { f: s(10.5), x: 1162, y: 451 }, { f: s(13), x: 763, y: 845 },
    { f: s(14.8), x: 1157, y: 854 }, { f: s(16.5), x: 763, y: 442 },
    { f: s(21), x: 1300, y: 600 }, { f: s(24.5), x: 519, y: 450 },
    { f: s(28.2), x: 700, y: 560 }, { f: s(30), x: 615, y: 399 }, { f: s(31.8), x: 615, y: 399 },
  ],
  clicks: [{ f: s(17), x: 763, y: 442 }, { f: s(26.8), x: 519, y: 450 }, { f: s(32.8), x: 615, y: 399 }],
  highlights: [
    { f0: s(6.4), f1: s(9), x: 574, y: 251, w: 376, h: 378 }, { f0: s(9.4), f1: s(12), x: 970, y: 264, w: 379, h: 384 },
    { f0: s(12.2), f1: s(14.2), x: 576, y: 662, w: 374, h: 375 }, { f0: s(14.2), f1: s(16), x: 970, y: 672, w: 379, h: 379 },
    { f0: s(28), f1: s(32), x: 560, y: 350, w: 830, h: 100 },
  ],
};
