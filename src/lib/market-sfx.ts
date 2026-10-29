// Zvuky filmových přechodů v obchodu, syntetizované přes Web Audio (žádné soubory). Zapnuté jsou ve výchozím stavu,
// hráč si je vypne tlačítkem v městečku; volba se pamatuje v localStorage.

const KEY = "market-sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

export function sfxEnabled(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

export function setSfxEnabled(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  if (master) master.gain.value = on ? 0.6 : 0;
}

function audio(): AudioContext | null {
  if (!sfxEnabled()) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    if (master) master.gain.value = 0.6;
    return ctx;
  } catch {
    return null;
  }
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

type Env = { at: number; dur: number; gain: number; attack?: number };

function env(c: AudioContext, e: Env): GainNode {
  const g = c.createGain();
  const a = e.attack ?? 0.02;
  g.gain.setValueAtTime(0.0001, e.at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, e.gain), e.at + a);
  g.gain.exponentialRampToValueAtTime(0.0001, e.at + e.dur);
  g.connect(master!);
  return g;
}

// šum přes filtr, jehož frekvence se plynule mění
function sweepNoise(c: AudioContext, at: number, dur: number, gain: number, f0: number, f1: number, q = 1, type: BiquadFilterType = "bandpass", attack = 0.05) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, at);
  f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
  src.connect(f);
  f.connect(env(c, { at, dur, gain, attack }));
  src.start(at, Math.random());
  src.stop(at + dur + 0.05);
}

function tone(c: AudioContext, at: number, dur: number, gain: number, f0: number, f1: number, type: OscillatorType = "sine", attack = 0.01) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, at);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
  o.connect(env(c, { at, dur, gain, attack }));
  o.start(at);
  o.stop(at + dur + 0.05);
}

export const sfx = {
  // odpočet: krátký pípnutí, poslední je výš
  beep(last = false) {
    const c = audio();
    if (!c) return;
    tone(c, c.currentTime, 0.18, 0.25, last ? 880 : 520, last ? 880 : 520, "square", 0.005);
  },
  // zvedání rakety: hydraulika a kovové vrzání
  standUp(dur: number) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    sweepNoise(c, t, dur, 0.18, 300, 900, 4, "bandpass", 0.2);
    tone(c, t, dur, 0.12, 70, 110, "sawtooth", 0.2);
    for (let i = 0; i < 3; i++) tone(c, t + 0.15 + i * 0.28, 0.12, 0.08, 1200 + i * 150, 800, "triangle", 0.005);
  },
  // start: nárůst hřmotu, syčení a hluboký bas
  liftoff(dur: number) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    sweepNoise(c, t, dur, 0.55, 220, 3200, 0.6, "lowpass", 0.35);
    sweepNoise(c, t, dur * 0.8, 0.35, 90, 450, 0.7, "lowpass", 0.2);
    tone(c, t, dur, 0.4, 45, 90, "sawtooth", 0.4);
    tone(c, t, dur, 0.25, 60, 130, "square", 0.5);
    sweepNoise(c, t + 0.1, 0.5, 0.4, 2800, 400, 0.8, "highpass", 0.01); // úder zážehu
  },
  // proletí oblaky a přechod do vesmíru
  whoosh(dur = 1.4) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    sweepNoise(c, t, dur, 0.3, 400, 5000, 1.2, "bandpass", dur * 0.45);
  },
  // dokování: měkké zazvonění a šum vzduchu
  dock() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 0.9, 0.18, 660, 660, "sine", 0.01);
    tone(c, t + 0.18, 1.1, 0.15, 990, 990, "sine", 0.01);
    sweepNoise(c, t, 0.7, 0.18, 1800, 600, 0.6, "bandpass", 0.1);
  },
  // šplouchnutí vlny přes obrazovku
  splash(dur = 0.9) {
    const c = audio();
    if (!c) return;
    sweepNoise(c, c.currentTime, dur, 0.35, 700, 2400, 0.5, "bandpass", 0.15);
  },
  // kroky po prknech
  step() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    sweepNoise(c, t, 0.09, 0.12, 380 + Math.random() * 120, 160, 3, "bandpass", 0.004);
  },
  // vrzání dřeva lodi
  creak() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 0.45, 0.06, 150 + Math.random() * 60, 95, "sawtooth", 0.08);
    sweepNoise(c, t, 0.45, 0.06, 500, 260, 6, "bandpass", 0.08);
  },
  // racek
  gull() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 0.35, 0.07, 1900, 1100, "triangle", 0.03);
    tone(c, t + 0.4, 0.3, 0.06, 2100, 1250, "triangle", 0.03);
  },
  // lodní roh
  horn() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 1.4, 0.3, 112, 108, "sawtooth", 0.05);
    tone(c, t, 1.4, 0.2, 168, 162, "sawtooth", 0.05);
    tone(c, t, 1.4, 0.1, 224, 216, "square", 0.05);
  },
  // vlny pod lodí
  waves(dur = 3) {
    const c = audio();
    if (!c) return;
    sweepNoise(c, c.currentTime, dur, 0.15, 500, 900, 0.4, "lowpass", dur * 0.4);
  },
  // kotevní řetěz: krátké kovové cvaknutí rumpálu
  chain() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 0.06, 0.1, 1900 + Math.random() * 400, 1100, "square", 0.002);
    sweepNoise(c, t, 0.05, 0.08, 4000, 2500, 2, "highpass", 0.002);
  },
  // kotva zaklapne do úchytu: hluboká rána do dřeva
  clunk() {
    const c = audio();
    if (!c) return;
    const t = c.currentTime;
    tone(c, t, 0.3, 0.3, 170, 62, "triangle", 0.004);
    sweepNoise(c, t, 0.14, 0.14, 900, 300, 0.8, "lowpass", 0.004);
  },
  // bublina zprávy
  pop() {
    const c = audio();
    if (!c) return;
    tone(c, c.currentTime, 0.12, 0.12, 500, 900, "sine", 0.005);
  },
};
