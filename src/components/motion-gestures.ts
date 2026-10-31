// Pohyby navíc pro 3D postavy a mazlíčky. Modely z Blenderu mají jen smyčku v klidu a pár krátkých
// animací, tady se k nim přidává pohyb celé postavy (posun, náklon, otočka, přemet) bez dalších souborů.

// Výchylka celé postavy kolem její osy; `sx`/`sy` jsou násobky měřítka (stlačení a protažení).
export type Motion = { y: number; rotX: number; rotY: number; rotZ: number; sx: number; sy: number };
export type Gesture = { duration: number; run: (u: number, m: Motion) => void };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
export const easeOutBack = (v: number) => {
  const c = 1.70158;
  const x = clamp01(v) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

export const resetMotion = (m: Motion) => {
  m.y = m.rotX = m.rotY = m.rotZ = 0;
  m.sx = m.sy = 1;
};

const arc = (u: number) => Math.sin(u * Math.PI);

// Dopad po skoku: krátké stlačení a protažení, ať pohyb nepůsobí jako z gumy.
const land = (u: number, from: number, m: Motion) => {
  if (u < from) return;
  const k = (u - from) / (1 - from);
  const s = Math.sin(k * Math.PI) * (1 - k);
  m.sy *= 1 - 0.12 * s;
  m.sx *= 1 + 0.07 * s;
};

export const GESTURES: Record<string, Gesture> = {
  hop: {
    duration: 0.8,
    run: (u, m) => {
      m.y = 0.22 * arc(Math.min(1, u / 0.75));
      land(u, 0.72, m);
    },
  },
  wiggle: { duration: 1.4, run: (u, m) => (m.rotZ = 0.12 * Math.sin(u * Math.PI * 4) * (1 - u)) },
  spin: { duration: 1.3, run: (u, m) => ((m.rotY = smooth(u) * Math.PI * 2), (m.y = 0.1 * arc(u))) },
  lookAround: { duration: 2.4, run: (u, m) => (m.rotY = 0.55 * Math.sin(u * Math.PI * 2)) },
  stretch: { duration: 1.3, run: (u, m) => ((m.sy = 1 + 0.07 * arc(u)), (m.sx = 1 - 0.035 * arc(u))) },
  nod: { duration: 1.6, run: (u, m) => ((m.rotX = 0.1 * Math.sin(u * Math.PI * 3)), (m.rotZ = 0.05 * Math.sin(u * Math.PI * 3))) },
  // Jen pro postavy: větší gesta jako reakce na kliknutí.
  jumpSpin: {
    duration: 1.1,
    run: (u, m) => {
      m.rotY = smooth(Math.min(1, u / 0.82)) * Math.PI * 2;
      m.y = 0.45 * arc(Math.min(1, u / 0.82));
      land(u, 0.8, m);
    },
  },
  backflip: {
    duration: 1.1,
    run: (u, m) => {
      m.rotX = -smooth(u) * Math.PI * 2;
      m.y = 0.55 * arc(u);
      m.sy = 1 - 0.1 * Math.max(0, 1 - u * 8);
    },
  },
  bow: { duration: 1.5, run: (u, m) => (m.rotX = 0.55 * arc(clamp01(u * 1.15)) * (u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15)) },
  dance: {
    duration: 1.8,
    run: (u, m) => {
      m.rotZ = 0.18 * Math.sin(u * Math.PI * 8);
      m.y = 0.09 * Math.abs(Math.sin(u * Math.PI * 8));
      m.rotY = 0.35 * Math.sin(u * Math.PI * 4);
    },
  },
  // nová gesta: fandění, houpání, vykukování, piruetka, otřesení a dřímota
  cheer: {
    duration: 1.6,
    run: (u, m) => {
      const k = (u * 3) % 1;
      m.y = 0.2 * arc(k);
      m.rotZ = 0.1 * Math.sin(u * Math.PI * 3);
      land(k, 0.75, m);
    },
  },
  sway: { duration: 2.6, run: (u, m) => ((m.rotZ = 0.09 * Math.sin(u * Math.PI * 2)), (m.rotY = 0.12 * Math.sin(u * Math.PI * 2 + 0.6))) },
  peek: {
    duration: 2.2,
    run: (u, m) => {
      const k = smooth(u * 3) * (1 - smooth((u - 0.7) * 3.3));
      m.rotZ = 0.22 * k * (u < 0.5 ? 1 : 1);
      m.rotY = 0.4 * k;
      m.y = -0.03 * k;
    },
  },
  twirl: {
    duration: 1.4,
    run: (u, m) => {
      m.rotY = -smooth(u) * Math.PI * 2;
      m.sy = 1 + 0.06 * arc(u);
      m.sx = 1 - 0.04 * arc(u);
      m.y = 0.06 * arc(u);
    },
  },
  shake: { duration: 0.9, run: (u, m) => (m.rotZ = 0.06 * Math.sin(u * Math.PI * 14) * (1 - u)) },
  sleepy: {
    duration: 3.2,
    run: (u, m) => {
      const k = arc(u);
      m.rotX = 0.16 * k + 0.03 * Math.sin(u * Math.PI * 6) * k;
      m.sy = 1 - 0.04 * k;
      m.y = -0.04 * k;
    },
  },
  victory: {
    duration: 1.3,
    run: (u, m) => {
      m.y = 0.3 * Math.abs(Math.sin(u * Math.PI * 3));
      m.sy = 1 + 0.05 * Math.sin(u * Math.PI * 6);
      m.rotZ = 0.08 * Math.sin(u * Math.PI * 6);
    },
  },
};

export const IDLE_GESTURES = [GESTURES.hop, GESTURES.wiggle, GESTURES.spin, GESTURES.lookAround, GESTURES.stretch, GESTURES.nod];
export const AVATAR_IDLE_GESTURES = [...IDLE_GESTURES, GESTURES.bow, GESTURES.dance, GESTURES.sway, GESTURES.peek, GESTURES.sleepy, GESTURES.shake];
// Kliknutí postupně střídá reakce, aby postava nedělala pořád to samé.
export const AVATAR_REACTIONS = [GESTURES.jumpSpin, GESTURES.cheer, GESTURES.backflip, GESTURES.twirl, GESTURES.dance, GESTURES.bow, GESTURES.victory];
