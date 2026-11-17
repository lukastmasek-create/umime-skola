import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';

export type CamKey = { f: number; pos: [number, number, number]; target: [number, number, number]; fov: number; ease?: (t: number) => number };

// Catmull-Rom spline over keyframes for position/target; smooth ease inside each segment.
export function sampleRig(keys: CamKey[], frame: number) {
  const f = Math.min(Math.max(frame, keys[0].f), keys[keys.length - 1].f);
  let i = 0;
  while (i < keys.length - 2 && f > keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  let t = (f - a.f) / Math.max(1, b.f - a.f);
  t = (b.ease ?? ((x: number) => x * x * (3 - 2 * x)))(t);
  const v = (k: CamKey, p: 'pos' | 'target') => new THREE.Vector3(...k[p]);
  const p0 = v(keys[Math.max(0, i - 1)], 'pos'), p3 = v(keys[Math.min(keys.length - 1, i + 2)], 'pos');
  const pos = new THREE.CatmullRomCurve3([p0, v(a, 'pos'), v(b, 'pos'), p3], false, 'centripetal').getPoint(0.333 + 0.334 * t);
  // exact endpoints: blend straight lerp to avoid spline overshoot at ends
  const lin = v(a, 'pos').lerp(v(b, 'pos'), t);
  const posF = lin.lerp(pos, 0.5);
  const target = v(a, 'target').lerp(v(b, 'target'), t);
  return { pos: posF, target, fov: a.fov + (b.fov - a.fov) * t };
}

export const CameraRig: React.FC<{ keys: CamKey[]; frame: number }> = ({ keys, frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { pos, target, fov } = sampleRig(keys, frame);
  useLayoutEffect(() => {
    camera.position.copy(pos);
    camera.fov = fov;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  });
  return null;
};
