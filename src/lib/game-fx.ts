// Zvuky her jsou syntetizované přes Web Audio, takže nepotřebují žádné soubory.
// AudioContext vzniká až při první interakci (prohlížeče ho předtím blokují).

export type Sfx =
  | "shoot"
  | "hit"
  | "correct"
  | "wrong"
  | "miss"
  | "damage"
  | "jump"
  | "stomp"
  | "land"
  | "tick"
  | "go"
  | "pickup"
  | "boss"
  | "win"
  | "lose";

const MUTE_KEY = "game:muted";

let ctx: AudioContext | null = null;
let muted = false;
let mutedLoaded = false;

function loadMuted() {
  if (mutedLoaded) return;
  mutedLoaded = true;
  try {
    muted = localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }
}

export function isMuted(): boolean {
  loadMuted();
  return muted;
}

export function setMuted(value: boolean) {
  loadMuted();
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Zavolat z kliknutí/stisku klávesy, aby se zvuk odblokoval.
export function unlockAudio() {
  audio();
}

type Tone = {
  freq: number;
  to?: number;
  at?: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
};

function play(tones: Tone[]) {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const tone of tones) {
    const start = now + (tone.at ?? 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = tone.type ?? "square";
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, start + tone.dur);
    const vol = (tone.vol ?? 0.12) * 0.8;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + tone.dur + 0.02);
  }
}

function noise(dur: number, vol = 0.14, at = 0) {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buffer;
  gain.gain.value = vol;
  src.connect(gain).connect(ac.destination);
  src.start(ac.currentTime + at);
}

const SOUNDS: Record<Sfx, () => void> = {
  shoot: () => play([{ freq: 880, to: 220, dur: 0.12, type: "square", vol: 0.07 }]),
  hit: () => {
    noise(0.18, 0.12);
    play([{ freq: 300, to: 80, dur: 0.18, type: "sawtooth", vol: 0.1 }]);
  },
  correct: () =>
    play([
      { freq: 523, dur: 0.1, type: "triangle", vol: 0.16 },
      { freq: 659, at: 0.09, dur: 0.1, type: "triangle", vol: 0.16 },
      { freq: 784, at: 0.18, dur: 0.1, type: "triangle", vol: 0.16 },
      { freq: 1047, at: 0.27, dur: 0.24, type: "triangle", vol: 0.16 },
    ]),
  wrong: () => {
    noise(0.12, 0.1);
    play([
      { freq: 220, to: 140, dur: 0.18, type: "sawtooth", vol: 0.14 },
      { freq: 160, to: 90, at: 0.14, dur: 0.24, type: "sawtooth", vol: 0.14 },
    ]);
  },
  miss: () => play([{ freq: 420, to: 70, dur: 0.5, type: "sawtooth", vol: 0.14 }]),
  damage: () => {
    noise(0.25, 0.16);
    play([{ freq: 200, to: 50, dur: 0.3, type: "square", vol: 0.12 }]);
  },
  jump: () => play([{ freq: 330, to: 760, dur: 0.16, type: "square", vol: 0.08 }]),
  stomp: () => {
    noise(0.08, 0.1);
    play([
      { freq: 200, to: 90, dur: 0.1, type: "square", vol: 0.14 },
      { freq: 660, at: 0.06, dur: 0.1, type: "square", vol: 0.1 },
    ]);
  },
  land: () => noise(0.05, 0.05),
  tick: () => play([{ freq: 660, dur: 0.07, type: "square", vol: 0.08 }]),
  go: () => play([{ freq: 990, dur: 0.22, type: "square", vol: 0.1 }]),
  pickup: () =>
    play([
      { freq: 700, to: 1400, dur: 0.12, type: "triangle", vol: 0.14 },
      { freq: 1400, at: 0.1, dur: 0.14, type: "triangle", vol: 0.12 },
    ]),
  boss: () =>
    play([
      { freq: 110, dur: 0.25, type: "sawtooth", vol: 0.14 },
      { freq: 92, at: 0.28, dur: 0.25, type: "sawtooth", vol: 0.14 },
      { freq: 73, at: 0.56, dur: 0.45, type: "sawtooth", vol: 0.16 },
    ]),
  win: () =>
    play([
      { freq: 523, dur: 0.14, type: "triangle", vol: 0.16 },
      { freq: 659, at: 0.14, dur: 0.14, type: "triangle", vol: 0.16 },
      { freq: 784, at: 0.28, dur: 0.14, type: "triangle", vol: 0.16 },
      { freq: 1047, at: 0.42, dur: 0.14, type: "triangle", vol: 0.16 },
      { freq: 784, at: 0.58, dur: 0.12, type: "triangle", vol: 0.16 },
      { freq: 1047, at: 0.7, dur: 0.4, type: "triangle", vol: 0.18 },
    ]),
  lose: () =>
    play([
      { freq: 392, dur: 0.22, type: "triangle", vol: 0.15 },
      { freq: 330, at: 0.22, dur: 0.22, type: "triangle", vol: 0.15 },
      { freq: 262, at: 0.44, dur: 0.22, type: "triangle", vol: 0.15 },
      { freq: 196, at: 0.66, dur: 0.5, type: "triangle", vol: 0.16 },
    ]),
};

export function sfx(name: Sfx) {
  SOUNDS[name]();
}

// Vznášející se text (+15, ×2, názvy bonusů), který se vykreslí a rozplyne.
export type FloatText = { x: number; y: number; text: string; color: string; life: number };

export function stepFloatTexts(list: FloatText[], dt: number): FloatText[] {
  return list.filter((f) => {
    f.life -= dt;
    f.y -= 38 * dt;
    return f.life > 0;
  });
}

export function drawFloatTexts(ctx: CanvasRenderingContext2D, list: FloatText[]) {
  ctx.save();
  ctx.font = "800 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(10,8,30,0.85)";
  for (const f of list) {
    ctx.globalAlpha = Math.min(1, f.life * 1.6);
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
}
