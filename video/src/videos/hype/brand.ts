import { loadFont as loadUnbounded } from '@remotion/google-fonts/Unbounded';
import { loadFont as loadOnest } from '@remotion/google-fonts/Onest';
import { loadFont as loadPangolin } from '@remotion/google-fonts/Pangolin';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { random } from 'remotion';

const unbounded = loadUnbounded('normal', {
  weights: ['800'],
  subsets: ['latin', 'latin-ext'],
});

const onest = loadOnest('normal', {
  weights: ['500', '700', '800'],
  subsets: ['latin', 'latin-ext'],
});

const pangolin = loadPangolin('normal', {
  weights: ['400'],
  subsets: ['latin', 'latin-ext'],
});

const jetbrainsMono = loadJetBrainsMono('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

export const FONTS = {
  display: unbounded.fontFamily,
  body: onest.fontFamily,
  hand: pangolin.fontFamily,
  mono: jetbrainsMono.fontFamily,
} as const;

export const BRAND = {
  cream: '#f6f4ee',
  ink: '#16132b',
  muted: '#4f4a66',
  surfaceLight: '#ffffff',
  borderLight: '#e0dccf',

  indigo: '#12102a',
  deepIndigo: '#0c0a24',
  textLight: '#f6f1e4',
  surfaceDark: '#1c1936',
  borderDark: '#35305f',
  brandGlow: '#5a6cff',

  blue: '#3248f0',
  blueLip: '#2433b8',

  coral: '#ff5a3c',
  coralLip: '#d63f24',

  yellow: '#ffc933',
  yellowLip: '#dca200',

  green: '#17a864',
  greenLip: '#0e7d48',

  sky: '#29a3ff',
  violet: '#6250d6',

  promptGradient: 'linear-gradient(135deg, #3248f0 0%, #6250d6 100%)',
} as const;

export type BrandBgKey = 'indigo' | 'deepIndigo' | 'cream' | 'blue' | 'coral' | 'yellow' | 'green';

export const BG_HEX: Record<BrandBgKey, string> = {
  indigo: BRAND.indigo,
  deepIndigo: BRAND.deepIndigo,
  cream: BRAND.cream,
  blue: BRAND.blue,
  coral: BRAND.coral,
  yellow: BRAND.yellow,
  green: BRAND.green,
};

export const HIGH_CONTRAST_TEXT: Record<BrandBgKey, string> = {
  indigo: BRAND.textLight,
  deepIndigo: BRAND.textLight,
  cream: BRAND.ink,
  blue: '#ffffff',
  coral: '#ffffff',
  yellow: BRAND.ink,
  green: '#ffffff',
};

export const TILE_SEQUENCE = [
  { fill: BRAND.blue, lip: BRAND.blueLip, name: 'blue' },
  { fill: BRAND.coral, lip: BRAND.coralLip, name: 'coral' },
  { fill: BRAND.yellow, lip: BRAND.yellowLip, name: 'yellow' },
  { fill: BRAND.green, lip: BRAND.greenLip, name: 'green' },
] as const;

export const ECHO_COLORS = [BRAND.blue, BRAND.coral, BRAND.yellow, BRAND.green] as const;

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 1440,
  bpm: 128,
} as const;

export function seededJitter(seedPrefix: string, frame: number, amplitude = 1.5): { x: number; y: number } {
  const qFrame = Math.floor(frame / 2);
  const rx = (random(`${seedPrefix}-x-${qFrame}`) - 0.5) * 2 * amplitude;
  const ry = (random(`${seedPrefix}-y-${qFrame}`) - 0.5) * 2 * amplitude;
  return { x: rx, y: ry };
}
