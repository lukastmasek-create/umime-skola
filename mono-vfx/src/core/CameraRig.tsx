import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {smoothstep, impulse} from './Timeline';
import {makeRng} from './DeterministicRandom';

export interface CamKey {
  t: number;                       // seconds
  pos: [number, number, number];
  target: [number, number, number];
  fov?: number;
  roll?: number;                   // radians (dutch)
}
export interface Shake { t: number; amp: number; decay?: number; }

const v = (a: [number, number, number]) => new THREE.Vector3(...a);

/** Non-uniform Catmull-Rom (cubic Hermite) – C1 continuous velocity through keys. */
function hermite(keys: CamKey[], get: (k: CamKey) => THREE.Vector3, t: number, out: THREE.Vector3) {
  const n = keys.length;
  if (t <= keys[0].t) return out.copy(get(keys[0]));
  if (t >= keys[n - 1].t) return out.copy(get(keys[n - 1]));
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const p0 = get(k0), p1 = get(k1);
  const h = k1.t - k0.t;
  const tan = (j: number) => {
    const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)];
    const dt = b.t - a.t || 1;
    return get(b).clone().sub(get(a)).multiplyScalar(1 / dt);
  };
  // ends: zero velocity -> gentle ease in/out of the whole move
  const m0 = i === 0 ? new THREE.Vector3() : tan(i);
  const m1 = i + 1 === n - 1 ? new THREE.Vector3() : tan(i + 1);
  const u = (t - k0.t) / h, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return out.set(0, 0, 0)
    .addScaledVector(p0, h00).addScaledVector(m0, h10 * h)
    .addScaledVector(p1, h01).addScaledVector(m1, h11 * h);
}

export function sampleCamera(keys: CamKey[], t: number, shakes: Shake[] = [], seed = 7) {
  const pos = hermite(keys, (k) => v(k.pos), t, new THREE.Vector3());
  const tgt = hermite(keys, (k) => v(k.target), t, new THREE.Vector3());
  // fov / roll via smoothstep between bracketing keys
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[Math.min(i + 1, keys.length - 1)];
  const u = k1.t === k0.t ? 0 : smoothstep((t - k0.t) / (k1.t - k0.t));
  const fov = (k0.fov ?? 30) + ((k1.fov ?? k0.fov ?? 30) - (k0.fov ?? 30)) * u;
  const roll = (k0.roll ?? 0) + ((k1.roll ?? k0.roll ?? 0) - (k0.roll ?? 0)) * u;

  // Shake: deterministic smooth noise * decaying envelope
  let sx = 0, sy = 0, sr = 0;
  for (const s of shakes) {
    const e = impulse(t - s.t, s.decay ?? 14) * s.amp;
    if (e < 1e-5) continue;
    const f = Math.floor((t - s.t) * 60);
    const a = makeRng(seed + f * 31), b = makeRng(seed + (f + 1) * 31);
    const fr = (t - s.t) * 60 - f;
    const lerpN = (x: number, y: number) => x + (y - x) * fr;
    sx += (lerpN(a.next(), b.next()) - 0.5) * 2 * e;
    sy += (lerpN(a.next(), b.next()) - 0.5) * 2 * e;
    sr += (lerpN(a.next(), b.next()) - 0.5) * 2 * e * 0.4;
  }
  // orientation via quaternion from look-at, then roll as a quaternion about view axis
  const m = new THREE.Matrix4().lookAt(pos, tgt, new THREE.Vector3(0, 1, 0));
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const qr = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll + sr);
  q.multiply(qr);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  pos.addScaledVector(right, sx).addScaledVector(up, sy);
  return {pos, quat: q, fov};
}

/** Applies the camera for the given time. Mount inside <ThreeCanvas>. */
export const CameraRig: React.FC<{keys: CamKey[]; time: number; shakes?: Shake[]}> = ({keys, time, shakes}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const s = sampleCamera(keys, time, shakes);
  camera.position.copy(s.pos);
  camera.quaternion.copy(s.quat);
  if (camera.fov !== s.fov) {
    camera.fov = s.fov;
    camera.updateProjectionMatrix();
  }
  camera.updateMatrixWorld();
  return null;
};
