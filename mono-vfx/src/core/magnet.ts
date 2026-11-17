import * as THREE from 'three';
import {easeInCubic, smootherstep} from './Timeline';

/** Magnetic-style converging trajectory: a decaying spiral about `axis` that accelerates toward the target. */
export const magnetic = (start: THREE.Vector3, target: THREE.Vector3, u: number, turns = 0.6, axis = new THREE.Vector3(0, 1, 0), out = new THREE.Vector3()) => {
  const e = easeInCubic(u) * 0.7 + smootherstep(u) * 0.3;
  const off = start.clone().sub(target).multiplyScalar(1 - e);
  off.applyAxisAngle(axis, (1 - e) * (1 - e) * turns * Math.PI * 2);
  return out.copy(target).add(off);
};
