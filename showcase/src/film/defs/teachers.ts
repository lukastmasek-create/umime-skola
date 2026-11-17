import type { SectionDef } from '../types';
import { FILL, shot, s } from './common';

export const teachers: SectionDef = {
  id: 'teachers', title: 'Teachers', route: '/cs/ucitele', frames: s(32), entrance: 'push-through', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 300, w: 1500, yaw: -10, pitch: 2, v: { w: 1000 } },
    { f: s(9), cx: 960, cy: 390, w: 900, yaw: 8, pitch: 2, v: { w: 640 } },
    { f: s(15), cx: 960, cy: 540, w: 1700, yaw: -8, pitch: 2, v: { w: 1000, cy: 600 } },
    { f: s(23), cx: 960, cy: 540, w: 1700, yaw: 8, pitch: 2, v: { w: 1000 } },
    { f: s(29), cx: 960, cy: 540, w: 1900, yaw: -3, pitch: 1 },
    { f: s(32) - 1, ...FILL },
  ],
  layers: [
    { page: 'ucitele', in: 0, out: s(30), scroll: [[0, 0], [s(11), 0], [s(16), 600], [s(22), 1500], [s(27), 2400]] },
    { page: 'home', in: s(29.8), fadeIn: s(1.2) },
  ],
  cursor: [{ f: s(6), x: 1400, y: 500 }, { f: s(9), x: 960, y: 390 }, { f: s(11), x: 960, y: 390 }],
  clicks: [{ f: s(11.2), x: 960, y: 390 }],
  highlights: [{ f0: s(8), f1: s(12), x: 820, y: 360, w: 280, h: 60 }],
};

// Finale: floating real interface layers converge into the monitor.
export const finale: SectionDef = {
  id: 'finale', title: 'Final hero', route: '/', frames: s(18), entrance: 'push-through', exit: 'fade', finale: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(3), cx: 960, cy: 540, w: 4200, yaw: 10, pitch: 3, fov: 22, v: { w: 3000 } },
    { f: s(9), cx: 960, cy: 540, w: 4800, yaw: -14, pitch: 4, fov: 22, v: { w: 3400 } },
    { f: s(14), cx: 960, cy: 540, w: 4000, yaw: 0, pitch: 3, v: { w: 2900 } },
    { f: s(18) - 1, cx: 960, cy: 540, w: 3700, yaw: 14, pitch: 3, v: { w: 2700 } },
  ],
  layers: [{ page: 'home', in: 0 }],
  floaters: [
    { src: 'shots/kurzy.webp', from: [-2.9, 0.55, 0.9], ry: 0.5, f0: s(3), fConverge: s(11), fEnd: s(13.5) },
    { src: 'shots/multiplayer.webp', from: [2.9, 0.65, 0.9], ry: -0.5, f0: s(3.6), fConverge: s(11.2), fEnd: s(13.7) },
    { src: 'shots/g-farma.webp', from: [-3.0, -0.65, 1.2], ry: 0.55, f0: s(4.2), fConverge: s(11.4), fEnd: s(13.9) },
    { src: 'shots/g-mesto.webp', from: [3.0, -0.6, 1.2], ry: -0.55, f0: s(4.8), fConverge: s(11.6), fEnd: s(14.1) },
    { src: 'shots/g-zakladna.webp', from: [-1.6, 1.5, -0.6], ry: 0.25, f0: s(5.4), fConverge: s(11.8), fEnd: s(14.3) },
    { src: 'shots/ucitele.webp', from: [1.7, 1.5, -0.6], ry: -0.25, f0: s(6), fConverge: s(12), fEnd: s(14.5) },
  ],
  caption: [{ f0: s(14.2), f1: s(18) + 60, text: 'Učíme se hrou', sub: 'ucimesehrou.org' }],
};
