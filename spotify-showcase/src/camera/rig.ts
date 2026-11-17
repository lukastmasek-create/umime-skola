import * as THREE from 'three';
import {bezier, clamp} from '../animation/motion';

export type V3 = [number, number, number];
export type CamKey = {
  f: number;          // frame
  pos: V3;
  target: V3;
  fov: number;        // vertical FOV (deg)
  roll?: number;      // deg
  focus?: V3;         // focus target (world) for DoF
  ease?: [number, number, number, number]; // cubic-bezier for segment *ending* at this key
};
/** A chain = one continuous camera path. Hard cuts (match-cuts) start a new chain. */
export type CamChain = {from: number; to: number; keys: CamKey[]; blur?: number};

const v = (a: V3) => new THREE.Vector3(...a);

function catmull(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number, out: THREE.Vector3) {
  // centripetal-ish uniform Catmull-Rom (tension 0.5)
  const t2 = t * t, t3 = t2 * t;
  out.set(0, 0, 0);
  for (const k of ['x', 'y', 'z'] as const) {
    out[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
  }
  return out;
}

export type Pose = {pos: THREE.Vector3; quat: THREE.Quaternion; fov: number; focus: THREE.Vector3; target: THREE.Vector3};

const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), D = new THREE.Vector3();

function rawChain(chain: CamChain, f: number): Omit<Pose, 'quat'> & {roll: number} {
  const ks = chain.keys;
  f = clamp(f, ks[0].f, ks[ks.length - 1].f);
  let i = 0;
  while (i < ks.length - 2 && f > ks[i + 1].f) i++;
  const k1 = ks[i], k2 = ks[i + 1];
  const k0 = ks[Math.max(0, i - 1)], k3 = ks[Math.min(ks.length - 1, i + 2)];
  const raw = (f - k1.f) / (k2.f - k1.f);
  const e = k2.ease ? bezier(...k2.ease)(raw) : raw;
  const pos = new THREE.Vector3(), target = new THREE.Vector3();
  catmull(v(k0.pos), v(k1.pos), v(k2.pos), v(k3.pos), e, pos);
  catmull(v(k0.target), v(k1.target), v(k2.target), v(k3.target), e, target);
  const fo = (k: CamKey) => v(k.focus ?? k.target);
  const focus = new THREE.Vector3();
  catmull(fo(k0), fo(k1), fo(k2), fo(k3), e, focus);
  const fov = k1.fov + (k2.fov - k1.fov) * e;
  const roll = (k1.roll ?? 0) + ((k2.roll ?? 0) - (k1.roll ?? 0)) * e;
  return {pos, target, focus, fov, roll};
}

const UP = new THREE.Vector3(0, 1, 0);
function quatFor(pos: THREE.Vector3, target: THREE.Vector3, roll: number) {
  const m = new THREE.Matrix4().lookAt(pos, target, UP);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(roll)));
  return q;
}

/** Evaluate the camera at a frame. Positions smoothed with a symmetric window (removes
 *  velocity kinks at keys → operator-like motion); orientation blended with quaternion slerp. */
export function evalCamera(chains: CamChain[], frame: number): Pose {
  const chain = chains.find((c) => frame >= c.from && frame <= c.to) ?? chains[chains.length - 1];
  const W = chain.blur ?? 14;
  const lo = chain.keys[0].f, hi = chain.keys[chain.keys.length - 1].f;
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3(), foc = new THREE.Vector3();
  let fov = 0, wsum = 0;
  let qAcc: THREE.Quaternion | null = null;
  const N = 9;
  for (let s = 0; s < N; s++) {
    const o = ((s / (N - 1)) * 2 - 1) * W;
    const ff = clamp(frame + o, lo, hi);
    const w = Math.exp(-0.5 * (o / (W * 0.55)) ** 2);
    const r = rawChain(chain, ff);
    pos.addScaledVector(r.pos, w); tgt.addScaledVector(r.target, w); foc.addScaledVector(r.focus, w); fov += r.fov * w; wsum += w;
    const q = quatFor(r.pos, r.target, r.roll);
    if (!qAcc) qAcc = q.clone();
    else qAcc.slerp(q, w / (wsum)); // running weighted slerp
  }
  pos.divideScalar(wsum); tgt.divideScalar(wsum); foc.divideScalar(wsum);
  void A; void B; void C; void D;
  return {pos, target: tgt, quat: qAcc!, fov: fov / wsum, focus: foc};
}
