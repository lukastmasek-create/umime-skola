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

export const GESTURES: Record<string, Gesture> = {
  hop: { duration: 0.7, run: (u, m) => (m.y = 0.22 * arc(u)) },
  wiggle: { duration: 1.4, run: (u, m) => (m.rotZ = 0.12 * Math.sin(u * Math.PI * 4) * (1 - u)) },
  spin: { duration: 1.3, run: (u, m) => ((m.rotY = smooth(u) * Math.PI * 2), (m.y = 0.1 * arc(u))) },
  lookAround: { duration: 2.4, run: (u, m) => (m.rotY = 0.55 * Math.sin(u * Math.PI * 2)) },
  stretch: { duration: 1.3, run: (u, m) => ((m.sy = 1 + 0.07 * arc(u)), (m.sx = 1 - 0.035 * arc(u))) },
  nod: { duration: 1.6, run: (u, m) => ((m.rotX = 0.1 * Math.sin(u * Math.PI * 3)), (m.rotZ = 0.05 * Math.sin(u * Math.PI * 3))) },
  // Jen pro postavy: větší gesta jako reakce na kliknutí.
  jumpSpin: { duration: 1.0, run: (u, m) => ((m.rotY = smooth(u) * Math.PI * 2), (m.y = 0.45 * arc(u))) },
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
export const AVATAR_IDLE_GESTURES = [...IDLE_GESTURES, GESTURES.bow, GESTURES.dance];
// Kliknutí postupně střídá reakce, aby postava nedělala pořád to samé.
export const AVATAR_REACTIONS = [GESTURES.jumpSpin, GESTURES.backflip, GESTURES.dance, GESTURES.bow, GESTURES.victory];
