// Global timeline constants (60 fps, 1800 frames)
export const FPS = 60;
export const TOTAL = 1800;
export const SHOT = {
  s1: [0, 179], s2: [180, 419], s3: [420, 659], s4: [660, 899], s5: [900, 1139], s6: [1140, 1439], s7: [1440, 1799],
} as const;
export const P2: [number, number, number] = [100, 0, 0];    // Music-player scene origin
export const G: [number, number, number] = [0, 0, -14];     // Playlist gallery / player centre
export const STUDIO: [number, number, number] = [0, 0, -112]; // final hero studio
