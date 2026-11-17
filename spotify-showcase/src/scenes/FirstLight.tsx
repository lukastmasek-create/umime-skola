import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Phone3D} from '../components/Phone3D';
import {Lights} from '../components/Studio';
import {StudioEnvironment} from '../components/StudioEnvironment';
import {useUITexture} from '../components/useUITexture';
import {drawNowPlaying, drawSplash, UI_H, UI_W} from '../components/SpotifyUI';
import {HEROES} from '../assets/content';
import {cinematic, range, smooth, smoother} from '../animation/motion';

const R0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, -0.78, -0.52));
const R1 = new THREE.Quaternion();
export const phoneQuat1 = (f: number) => new THREE.Quaternion().slerpQuaternions(R0, R1, cinematic(range(f, 0, 172)));

/** SHOT 01 — The First Light. A diagonal phone emerges from darkness; reflections sweep the glass. */
export const FirstLight: React.FC = () => {
  const f = useCurrentFrame();
  const glow = smooth(range(f, 62, 118));                 // logo illuminates
  const xf = smooth(range(f, 140, 176));                   // splash → Now Playing (on-device transition)
  const key = `${Math.round(glow * 24)}-${Math.round(xf * 24)}`;
  const tex = useUITexture(UI_W, UI_H, (g) => {
    drawSplash(g, glow);
    if (xf > 0) { g.globalAlpha = xf; drawNowPlaying(g, {hero: HEROES.weeknd, progress: 0.06, playing: true}); g.globalAlpha = 1; }
  }, key);
  const q = phoneQuat1(f);
  const envRot = -1.4 + 3.0 * cinematic(range(f, 0, 150));
  const bright = 0.02 + 0.98 * smooth(range(f, 40, 90));
  return (
    <group>
      <StudioEnvironment rotationY={envRot} intensity={1.1} />
      <Lights rig={{key: 1.1, fill: 0.15, rim: 120, rimColor: '#1DB954'}} />
      <Phone3D screen={tex} quaternion={q} brightness={bright} />
    </group>
  );
};
