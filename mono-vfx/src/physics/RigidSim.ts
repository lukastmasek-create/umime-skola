import * as THREE from 'three';
import {makeRng} from '../core/DeterministicRandom';

/**
 * Deterministic fixed-timestep rigid-body sim, precomputed once and sampled per frame.
 * Bodies collide (via their hull points) with half-space planes; optional sphere-sphere collisions.
 */
export interface BodyInit {
  pos: THREE.Vector3; quat?: THREE.Quaternion; vel?: THREE.Vector3; angVel?: THREE.Vector3;
  points: THREE.Vector3[];            // local-space hull points (collision)
  radius: number;                     // bounding radius
  mass?: number;
  collideSpheres?: boolean;
  half?: THREE.Vector3;               // box half-extents -> enables corner-vs-box contacts between boxes
  releaseAt?: number;                 // body is frozen until this time (s)
}
export interface Plane { n: THREE.Vector3; d: number; }          // inside: n·p >= d
export interface SimOpts {
  duration: number; fps?: number; sub?: number;
  gravity: (t: number) => THREE.Vector3;
  planes: Plane[] | ((t: number) => Plane[]);
  restitution?: number; friction?: number; linDrag?: number; angDrag?: number;
  forces?: (t: number, bodies: SimBody[], dt: number) => void;
}
export interface SimBody extends BodyInit { q: THREE.Quaternion; v: THREE.Vector3; w: THREE.Vector3; m: number; I: number; frozen: boolean; }
export interface SimResult { fps: number; frames: number; data: Float32Array[]; sample: (i: number, t: number, p: THREE.Vector3, q: THREE.Quaternion) => void; }

const _c = new THREE.Vector3(), _l = new THREE.Vector3(), _n = new THREE.Vector3(), _r1 = new THREE.Vector3(), _r2 = new THREE.Vector3(), _v = new THREE.Vector3(), _qi = new THREE.Quaternion();
/** Push corners of A that lie inside box B out of B, with a restitution impulse. */
function boxContact(A: SimBody, B: SimBody, e: number) {
  const h = B.half!, ha = A.half!;
  _qi.copy(B.q).invert();
  const fixedA = A.frozen, fixedB = B.frozen;
  for (let sx = -1; sx <= 1; sx += 2) for (let sy = -1; sy <= 1; sy += 2) for (let sz = -1; sz <= 1; sz += 2) {
    _r1.set(sx * ha.x, sy * ha.y, sz * ha.z).applyQuaternion(A.q);
    _c.copy(A.pos).add(_r1);
    _l.copy(_c).sub(B.pos).applyQuaternion(_qi);
    const dx = h.x - Math.abs(_l.x), dy = h.y - Math.abs(_l.y), dz = h.z - Math.abs(_l.z);
    if (dx <= 0 || dy <= 0 || dz <= 0) continue;
    let d = dx; _n.set(Math.sign(_l.x) || 1, 0, 0);
    if (dy < d) { d = dy; _n.set(0, Math.sign(_l.y) || 1, 0); }
    if (dz < d) { d = dz; _n.set(0, 0, Math.sign(_l.z) || 1); }
    _n.applyQuaternion(B.q);
    const wA = fixedA ? 0 : fixedB ? 1 : 0.5, wB = fixedB ? 0 : fixedA ? 1 : 0.5;
    if (!fixedA) A.pos.addScaledVector(_n, d * wA * 0.8);
    if (!fixedB) B.pos.addScaledVector(_n, -d * wB * 0.8);
    _r2.copy(_c).sub(B.pos);
    _v.copy(A.v).add(new THREE.Vector3().crossVectors(A.w, _r1)).sub(B.v).sub(new THREE.Vector3().crossVectors(B.w, _r2));
    const vn = _v.dot(_n);
    if (vn >= 0) continue;
    const rA = new THREE.Vector3().crossVectors(_r1, _n), rB = new THREE.Vector3().crossVectors(_r2, _n);
    const k = (fixedA ? 0 : 1 / A.m + rA.lengthSq() / A.I) + (fixedB ? 0 : 1 / B.m + rB.lengthSq() / B.I);
    const jn = (-(1 + e * 0.5) * vn) / (k || 1) / 2;
    const imp = _n.clone().multiplyScalar(jn);
    const vt = _v.clone().addScaledVector(_n, -vn); const vtl = vt.length();
    if (vtl > 1e-6) imp.addScaledVector(vt.divideScalar(vtl), -Math.min(0.5 * jn, vtl / (k || 1)));
    if (!fixedA) { A.v.addScaledVector(imp, 1 / A.m); A.w.add(new THREE.Vector3().crossVectors(_r1, imp).divideScalar(A.I)); }
    if (!fixedB) { B.v.addScaledVector(imp, -1 / B.m); B.w.sub(new THREE.Vector3().crossVectors(_r2, imp).divideScalar(B.I)); }
  }
}

export function simulate(inits: BodyInit[], o: SimOpts): SimResult {
  const fps = o.fps ?? 60, sub = o.sub ?? 8, dt = 1 / (fps * sub);
  const e = o.restitution ?? 0.3, mu = o.friction ?? 0.5;
  const bodies: SimBody[] = inits.map((b) => ({
    ...b, pos: b.pos.clone(), q: (b.quat ?? new THREE.Quaternion()).clone(), v: (b.vel ?? new THREE.Vector3()).clone(),
    w: (b.angVel ?? new THREE.Vector3()).clone(), m: b.mass ?? 1, I: 0.4 * (b.mass ?? 1) * b.radius * b.radius, frozen: (b.releaseAt ?? 0) > 0,
  }));
  const frames = Math.ceil(o.duration * fps) + 1;
  const data = bodies.map(() => new Float32Array(frames * 7));
  const tmp = new THREE.Vector3(), r = new THREE.Vector3(), vp = new THREE.Vector3(), dq = new THREE.Quaternion();
  for (let f = 0; f < frames; f++) {
    for (let s = 0; s < sub; s++) {
      const t = (f + s / sub) / fps;
      const g = o.gravity(t);
      o.forces?.(t, bodies, dt);
      const planes = typeof o.planes === 'function' ? o.planes(t) : o.planes;
      for (const b of bodies) {
        if (b.frozen) { if (t >= (b.releaseAt ?? 0)) b.frozen = false; else continue; }
        b.v.addScaledVector(g, dt);
        if (o.linDrag) b.v.multiplyScalar(1 - o.linDrag * dt);
        if (o.angDrag) b.w.multiplyScalar(1 - o.angDrag * dt);
        b.pos.addScaledVector(b.v, dt);
        const wl = b.w.length();
        if (wl > 1e-6) { dq.setFromAxisAngle(tmp.copy(b.w).divideScalar(wl), wl * dt); b.q.premultiply(dq).normalize(); }
        for (const pl of planes) {
          for (const lp of b.points) {
            r.copy(lp).applyQuaternion(b.q);
            const wp = tmp.copy(b.pos).add(r);
            const pen = pl.d - pl.n.dot(wp);
            if (pen <= 0) continue;
            b.pos.addScaledVector(pl.n, pen * 0.9);
            vp.copy(b.v).add(new THREE.Vector3().crossVectors(b.w, r));
            const vn = vp.dot(pl.n);
            if (vn >= 0) continue;
            const rn = new THREE.Vector3().crossVectors(r, pl.n);
            const kN = 1 / b.m + rn.lengthSq() / b.I;
            const jn = -(1 + e) * vn / kN / Math.max(1, b.points.length * 0.15);
            const imp = pl.n.clone().multiplyScalar(jn);
            const vt = vp.clone().addScaledVector(pl.n, -vn);
            const vtl = vt.length();
            if (vtl > 1e-6) imp.addScaledVector(vt.divideScalar(vtl), -Math.min(mu * jn, vtl * b.m * 0.5));
            b.v.addScaledVector(imp, 1 / b.m);
            b.w.add(new THREE.Vector3().crossVectors(r, imp).divideScalar(b.I));
          }
        }
      }
      // box-box (corner vs OBB). Frozen bodies act as static obstacles.
      for (let i = 0; i < bodies.length; i++) {
        const A = bodies[i]; if (!A.half) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          const B = bodies[j]; if (!B.half || (A.frozen && B.frozen)) continue;
          if (A.pos.distanceToSquared(B.pos) > (A.radius + B.radius) ** 2) continue;
          boxContact(A, B, e); boxContact(B, A, e);
        }
      }
      // sphere-sphere
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i]; if (!a.collideSpheres || a.frozen) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          const c = bodies[j]; if (!c.collideSpheres || c.frozen || (a.half && c.half)) continue;
          const d = tmp.copy(c.pos).sub(a.pos), L = d.length(), R = a.radius + c.radius;
          if (L >= R || L < 1e-6) continue;
          d.divideScalar(L);
          const corr = (R - L) * 0.5;
          a.pos.addScaledVector(d, -corr); c.pos.addScaledVector(d, corr);
          const rv = new THREE.Vector3().subVectors(c.v, a.v).dot(d);
          if (rv < 0) { const jj = -(1 + Math.max(e, 0.6)) * rv / (1 / a.m + 1 / c.m); a.v.addScaledVector(d, -jj / a.m); c.v.addScaledVector(d, jj / c.m); }
        }
      }
    }
    bodies.forEach((b, i) => { const k = f * 7; data[i].set([b.pos.x, b.pos.y, b.pos.z, b.q.x, b.q.y, b.q.z, b.q.w], k); });
  }
  const sample = (i: number, t: number, p: THREE.Vector3, q: THREE.Quaternion) => {
    const x = Math.min(Math.max(t * fps, 0), frames - 1.001), a = Math.floor(x), u = x - a, d = data[i];
    const A = a * 7, B = A + 7;
    p.set(d[A] + (d[B] - d[A]) * u, d[A + 1] + (d[B + 1] - d[A + 1]) * u, d[A + 2] + (d[B + 2] - d[A + 2]) * u);
    q.set(d[A + 3], d[A + 4], d[A + 5], d[A + 6]).slerp(new THREE.Quaternion(d[B + 3], d[B + 4], d[B + 5], d[B + 6]), u);
  };
  return {fps, frames, data, sample};
}
export {makeRng};
