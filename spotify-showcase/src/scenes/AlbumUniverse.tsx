import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Card3D} from '../components/Card3D';
import {heroArtTex} from '../assets/faces';
import {useCamPose} from '../camera/context';
import {SHOT} from '../timeline';
import {HEROES} from '../assets/content';
import {range, smoother, lerp, easeInOutQuart} from '../animation/motion';
import {darkMetal} from '../materials';
import {Floor} from '../components/Studio';
import {ContactShadow} from '../components/ContactShadow';

const COL = [HEROES.weeknd.light, HEROES.daft.light, HEROES.billie.light, HEROES.travis.light, '#1DB954'].map((c) => new THREE.Color(c));
/** Lighting palette: as the camera passes each album the key/accent colour adopts that album's identity. */
export function paletteAt(f: number) {
  const keys = [[420, 0], [470, 0], [510, 1], [560, 2], [610, 3], [650, 3], [700, 4]] as const;
  let c = COL[0].clone();
  for (let i = 0; i < keys.length - 1; i++) {
    if (f >= keys[i][0] && f <= keys[i + 1][0]) { c = COL[keys[i][1]].clone().lerp(COL[keys[i + 1][1]], smoother(range(f, keys[i][0], keys[i + 1][0]))); }
  }
  if (f > keys[keys.length - 1][0]) c = COL[4].clone();
  return c;
}

/** Architectural set: reflective floor, slim dark fins forming a gallery corridor. */
export const GalleryArchitecture: React.FC = () => {
  const fins = React.useMemo(() => Array.from({length: 18}, (_, i) => i), []);
  const mat = React.useMemo(() => darkMetal('#141819'), []);
  return (
    <group>
      <Floor y={-2.6} size={90} position={[0, 0, -22]} color="#070a09" roughness={0.4} metalness={0.2} spec={0.25} envI={0.5} />
      {fins.map((i) => [-1, 1].map((s) => (
        <mesh key={`${i}${s}`} position={[s * 3.6, 0.8, 4 - i * 2.9]} material={mat}><boxGeometry args={[0.16, 7.4, 0.55]} /></mesh>
      )))}
      <mesh position={[0, 4.6, -14]} material={mat}><boxGeometry args={[7.6, 0.12, 60]} /></mesh>
    </group>
  );
};

/** Hero cover leaving the frame at the start of shot 3 (the "card rotates past the camera"). */
export const CoverExit: React.FC = () => {
  const f = useCurrentFrame();
  const pose = useCamPose();
  const t = range(f, SHOT.s3[0], SHOT.s3[0] + 34);
  if (f < SHOT.s3[0] || t >= 1) return null;
  const e = easeInOutQuart(t);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(pose.quat), right = new THREE.Vector3(1, 0, 0).applyQuaternion(pose.quat);
  const pos = pose.pos.clone().addScaledVector(fwd, lerp(0.9, 0.55, e)).addScaledVector(right, -1.6 * e);
  const q = pose.quat.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI + 0.9 * e, 0.25 * e)));
  return <Card3D front={heroArtTex('weeknd')} position={pos} quaternion={q} w={0.6} h={0.6} depth={0.045} radius={0.03} inset={0.004} edge="#7a1020" backEmissive={0} />;
};
