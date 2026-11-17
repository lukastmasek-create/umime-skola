import type { SectionDef } from '../types';
import { FILL, shot, s } from './common';
// Logged-in demo account ("Demo Žák", local seeded DB, no personal data). Static UI states captured from the real app.

export const farma: SectionDef = {
  id: 'farma', title: 'Farma', route: '/cs/stale-hry/farma', frames: s(36), entrance: 'light-sweep', exit: 'light-sweep', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 440, w: 1250, yaw: -14, pitch: 2, v: { w: 1000, cy: 430 } },     // 3D farm scene
    { f: s(9), cx: 960, cy: 440, w: 900, yaw: 10, pitch: 3, v: { w: 700 } },
    { f: s(13), cx: 960, cy: 730, w: 1100, yaw: -6, pitch: 2, v: { w: 800, cy: 740 } },      // tabs
    { f: s(21), cx: 800, cy: 760, w: 1300, yaw: 8, pitch: 2, v: { w: 900 } },
    { f: s(28), cx: 960, cy: 600, w: 1600, yaw: -10, pitch: 3, v: { w: 1000 } },
    { f: s(36) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/g-farma.webp', in: 0, out: s(33.5) },
    { page: shot('g-farma-zvirata', 'g-farma'), in: s(14.8), out: s(19.6), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-farma-sypka', 'g-farma'), in: s(19.2), out: s(24.6), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-farma-zakazky', 'g-farma'), in: s(24.2), out: s(33.5), fadeIn: 8, fadeOut: 8 },
    { page: 'img:shots/g-mesto.webp', in: s(33.2), fadeIn: s(1.4) },
  ],
  cursor: [
    { f: s(5), x: 1300, y: 300 }, { f: s(12), x: 498, y: 729 }, { f: s(14.6), x: 579, y: 729 }, { f: s(19), x: 657, y: 729 }, { f: s(24), x: 744, y: 729 }, { f: s(30), x: 900, y: 880 },
  ],
  clicks: [{ f: s(14.8), x: 579, y: 729 }, { f: s(19.2), x: 657, y: 729 }, { f: s(24.2), x: 744, y: 729 }],
  highlights: [
    { f0: s(7), f1: s(12), x: 480, y: 285, w: 966, h: 315 }, { f0: s(12.4), f1: s(14.4), x: 470, y: 700, w: 300, h: 58 }, { f0: s(25), f1: s(30), x: 470, y: 770, w: 980, h: 290 },
  ],
};

export const mesto: SectionDef = {
  id: 'mesto', title: 'Město', route: '/cs/stale-hry/mesto', frames: s(34), entrance: 'light-sweep', exit: 'light-sweep', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 700, w: 1400, yaw: 14, pitch: 4, v: { w: 1000 } },               // isometric city
    { f: s(10), cx: 960, cy: 345, w: 1250, yaw: -8, pitch: 2, v: { w: 900 } },               // resource stats row
    { f: s(16), cx: 460, cy: 450, w: 650, yaw: 12, pitch: 2, v: { w: 520 } },                // palette
    { f: s(23), cx: 960, cy: 720, w: 1250, yaw: -14, pitch: 5, v: { w: 900 } },
    { f: s(29), cx: 960, cy: 600, w: 1700, yaw: 6, pitch: 2 },
    { f: s(34) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/g-mesto.webp', in: 0, out: s(31.6) },
    { page: 'img:shots/g-zakladna.webp', in: s(31.4), fadeIn: s(1.4) },
  ],
  cursor: [{ f: s(11), x: 700, y: 345 }, { f: s(14), x: 1200, y: 345 }, { f: s(17), x: 438, y: 429 }, { f: s(19), x: 438, y: 471 }, { f: s(24), x: 960, y: 700 }, { f: s(27), x: 1100, y: 800 }],
  highlights: [{ f0: s(9), f1: s(15), x: 411, y: 320, w: 1098, h: 55 }, { f0: s(16), f1: s(20), x: 411, y: 405, w: 70, h: 100 }, { f0: s(21), f1: s(28), x: 411, y: 405, w: 1098, h: 660 }],
};

export const zakladna: SectionDef = {
  id: 'zakladna', title: 'Základna', route: '/cs/stale-hry/zakladna', frames: s(34), entrance: 'light-sweep', exit: 'light-sweep', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 400, w: 1500, yaw: -12, pitch: 2, v: { w: 1000 } },
    { f: s(10), cx: 800, cy: 650, w: 1100, yaw: 10, pitch: 3, v: { w: 800 } },             // base planet view
    { f: s(17), cx: 1260, cy: 620, w: 900, yaw: -8, pitch: 2, v: { w: 650 } },             // build panel
    { f: s(24), cx: 960, cy: 540, w: 1700, yaw: 6, pitch: 2, v: { w: 1000 } },
    { f: s(34) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/g-zakladna.webp', in: 0, out: s(31.6) },
    { page: shot('g-zakladna-vesmir', 'g-zakladna'), in: s(18), out: s(24), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-zakladna-kodex', 'g-zakladna'), in: s(23.6), out: s(31.6), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-ekonomika-form', 'g-ekonomika'), in: s(31.4), fadeIn: s(1.4) },
  ],
  cursor: [{ f: s(5), x: 1400, y: 300 }, { f: s(9), x: 800, y: 650 }, { f: s(14), x: 1300, y: 600 }, { f: s(17.6), x: 1050, y: 394 }, { f: s(23), x: 1130, y: 394 }],
  clicks: [{ f: s(18), x: 1050, y: 394 }, { f: s(23.6), x: 1130, y: 394 }],
  highlights: [{ f0: s(6), f1: s(12), x: 411, y: 255, w: 790, h: 600 }, { f0: s(13), f1: s(17), x: 1210, y: 280, w: 300, h: 600 }],
};

export const ekonomika: SectionDef = {
  id: 'economy', title: 'Ekonomika', route: '/cs/stale-hry/ekonomika', frames: s(40), entrance: 'light-sweep', exit: 'light-sweep', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(3.5), cx: 810, cy: 480, w: 1200, yaw: -12, pitch: 2, v: { w: 900 } },
    { f: s(9), cx: 810, cy: 560, w: 1000, yaw: 10, pitch: 2, v: { w: 750 } },
    { f: s(13), cx: 960, cy: 420, w: 1500, yaw: -8, pitch: 2, v: { w: 1000, cy: 400 } },       // dashboard reveal
    { f: s(19), cx: 960, cy: 640, w: 1200, yaw: 9, pitch: 2, v: { w: 800 } },                  // wealth numbers
    { f: s(25), cx: 800, cy: 409, w: 1000, yaw: -9, pitch: 2, v: { w: 760 } },                 // tabs
    { f: s(32), cx: 960, cy: 560, w: 1700, yaw: 8, pitch: 3, v: { w: 1000 } },
    { f: s(40) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/g-ekonomika.webp', in: 0, out: s(9.2) },
    { page: shot('g-ekonomika-form', 'g-ekonomika'), in: s(3.8), out: s(9.2), fadeIn: 8 },
    { page: shot('g-ekonomika-dash', 'g-ekonomika'), in: s(9), out: s(26), fadeIn: s(0.8), fadeOut: 8 },
    { page: shot('g-ekonomika-prace', 'g-ekonomika-dash'), in: s(25.6), out: s(29.2), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-ekonomika-firma', 'g-ekonomika-dash'), in: s(28.8), out: s(32.4), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-ekonomika-investice', 'g-ekonomika-dash'), in: s(32), out: s(35.8), fadeIn: 8, fadeOut: 8 },
    { page: shot('g-ekonomika-banka', 'g-ekonomika-dash'), in: s(35.4), out: s(37.6), fadeIn: 8 },
    { page: 'img:shots/g-tymy.webp', in: s(37.4), fadeIn: s(1.4) },
  ],
  cursor: [
    { f: s(2.5), x: 1300, y: 300 }, { f: s(4), x: 810, y: 456 }, { f: s(6), x: 520, y: 534 }, { f: s(8), x: 810, y: 819 },
    { f: s(14), x: 1300, y: 600 }, { f: s(20), x: 700, y: 660 }, { f: s(25), x: 540, y: 409 }, { f: s(25.6), x: 629, y: 409 },
    { f: s(28.8), x: 807, y: 409 }, { f: s(32), x: 900, y: 409 }, { f: s(35.4), x: 1008, y: 409 },
  ],
  clicks: [{ f: s(8.4), x: 810, y: 819 }, { f: s(25.6), x: 629, y: 409 }, { f: s(28.8), x: 807, y: 409 }, { f: s(32), x: 900, y: 409 }, { f: s(35.4), x: 1008, y: 409 }],
  highlights: [{ f0: s(4), f1: s(7), x: 470, y: 430, w: 680, h: 55 }, { f0: s(14), f1: s(24), x: 497, y: 502, w: 925, h: 160 }, { f0: s(24), f1: s(37), x: 497, y: 389, w: 800, h: 55 }],
};

export const tymy: SectionDef = {
  id: 'teams', title: 'Týmy', route: '/cs/tymy', frames: s(32), entrance: 'light-sweep', exit: 'push-through', chainsToNext: true,
  shots: [
    { f: 0, ...FILL },
    { f: s(4), cx: 960, cy: 600, w: 1500, yaw: -10, pitch: 2, v: { w: 1000 } },
    { f: s(11), cx: 850, cy: 640, w: 1000, yaw: 9, pitch: 2, v: { w: 760 } },
    { f: s(18), cx: 1240, cy: 640, w: 1000, yaw: -9, pitch: 2, v: { w: 760 } },
    { f: s(25), cx: 960, cy: 600, w: 1700, yaw: 5, pitch: 1 },
    { f: s(32) - 1, ...FILL },
  ],
  layers: [
    { page: 'img:shots/g-tymy.webp', in: 0, out: s(29.6) },
    { page: 'ucitele', in: s(29.4), fadeIn: s(1.4), slide: 90 },
  ],
  cursor: [{ f: s(5), x: 1300, y: 300 }, { f: s(10), x: 800, y: 690 }, { f: s(14), x: 800, y: 760 }, { f: s(19), x: 1260, y: 640 }, { f: s(24), x: 1500, y: 700 }],
  highlights: [{ f0: s(9), f1: s(16), x: 746, y: 410, w: 140, h: 100 }, { f0: s(17), f1: s(23), x: 880, y: 410, w: 500, h: 300 }],
};
