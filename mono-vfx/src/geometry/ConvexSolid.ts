import * as THREE from 'three';

/**
 * Exact convex polyhedron built by half-space clipping.
 * Cutting a solid with a plane yields two closed solids, each with a planar cap polygon.
 * This is real split geometry – not a clipping-plane trick.
 */
export interface Poly {
  pts: THREE.Vector3[];
  tag: number;               // 0 = outer skin, 1 = cut cap
  normal: THREE.Vector3;
}
export interface Plane3 { n: THREE.Vector3; d: number; } // inside: n·p <= d

const EPS = 1e-7;

const polyNormal = (pts: THREE.Vector3[]) => {
  const n = new THREE.Vector3();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    n.x += (a.y - b.y) * (a.z + b.z);
    n.y += (a.z - b.z) * (a.x + b.x);
    n.z += (a.x - b.x) * (a.y + b.y);
  }
  return n.normalize();
};

export class ConvexSolid {
  constructor(public polys: Poly[]) {}

  static box(half: number): ConvexSolid {
    const h = half;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const faces: THREE.Vector3[][] = [
      [P(h, -h, -h), P(h, h, -h), P(h, h, h), P(h, -h, h)],
      [P(-h, -h, h), P(-h, h, h), P(-h, h, -h), P(-h, -h, -h)],
      [P(-h, h, -h), P(-h, h, h), P(h, h, h), P(h, h, -h)],
      [P(-h, -h, h), P(-h, -h, -h), P(h, -h, -h), P(h, -h, h)],
      [P(-h, -h, h), P(h, -h, h), P(h, h, h), P(-h, h, h)],
      [P(h, -h, -h), P(-h, -h, -h), P(-h, h, -h), P(h, h, -h)],
    ];
    return new ConvexSolid(faces.map((pts) => ({pts, tag: 0, normal: polyNormal(pts)})));
  }

  /** Rounded cube: support function of (cube ⊕ ball) sampled on an integer direction grid. */
  static roundedCube(half: number, radius: number, grid: number): ConvexSolid {
    let s = ConvexSolid.box(half * 2);
    const seen = new Set<string>();
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    const planes: Plane3[] = [];
    for (let i = -grid; i <= grid; i++)
      for (let j = -grid; j <= grid; j++)
        for (let k = -grid; k <= grid; k++) {
          if (!i && !j && !k) continue;
          const g = gcd(gcd(Math.abs(i), Math.abs(j)), Math.abs(k));
          const key = `${i / g},${j / g},${k / g}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const n = new THREE.Vector3(i, j, k).normalize();
          const d = (half - radius) * (Math.abs(n.x) + Math.abs(n.y) + Math.abs(n.z)) + radius;
          planes.push({n, d});
        }
    for (const p of planes) s = s.clip(p, 0).inside;
    return s;
  }

  /** Clip by plane; returns the kept inside part (and the outside part). capTag marks the new face. */
  clip(pl: Plane3, capTag = 1): {inside: ConvexSolid; outside: ConvexSolid} {
    const a = this.clipOne(pl, capTag);
    const b = this.clipOne({n: pl.n.clone().negate(), d: -pl.d}, capTag);
    return {inside: a, outside: b};
  }

  private clipOne(pl: Plane3, capTag: number): ConvexSolid {
    const out: Poly[] = [];
    const capPts: THREE.Vector3[] = [];
    const dist = (p: THREE.Vector3) => pl.n.dot(p) - pl.d;
    for (const poly of this.polys) {
      const res: THREE.Vector3[] = [];
      const n = poly.pts.length;
      for (let i = 0; i < n; i++) {
        const A = poly.pts[i], B = poly.pts[(i + 1) % n];
        const da = dist(A), db = dist(B);
        const aIn = da <= EPS, bIn = db <= EPS;
        if (aIn) res.push(A);
        if ((da < -EPS && db > EPS) || (da > EPS && db < -EPS)) {
          const t = da / (da - db);
          const I = A.clone().lerp(B, t);
          res.push(I);
          capPts.push(I);
        } else if (Math.abs(da) <= EPS && aIn) {
          capPts.push(A);
        }
      }
      // dedupe consecutive
      const clean = res.filter((p, i) => p.distanceToSquared(res[(i + 1) % res.length]) > 1e-12);
      if (clean.length >= 3) out.push({pts: clean, tag: poly.tag, normal: poly.normal});
    }
    // cap polygon from unique intersection points ordered around centroid
    const uniq: THREE.Vector3[] = [];
    for (const p of capPts) if (!uniq.some((q) => q.distanceToSquared(p) < 1e-10)) uniq.push(p);
    if (uniq.length >= 3) {
      const c = uniq.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / uniq.length);
      const n = pl.n.clone();
      const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const e1 = new THREE.Vector3().crossVectors(n, ref).normalize();
      const e2 = new THREE.Vector3().crossVectors(n, e1);
      uniq.sort((p, q) => {
        const pa = Math.atan2(p.clone().sub(c).dot(e2), p.clone().sub(c).dot(e1));
        const qa = Math.atan2(q.clone().sub(c).dot(e2), q.clone().sub(c).dot(e1));
        return pa - qa;
      });
      out.push({pts: uniq, tag: capTag, normal: n});
    }
    return new ConvexSolid(out);
  }

  /** Cap polygon (tag != 0), if any. */
  cap(): Poly | undefined { return this.polys.find((p) => p.tag !== 0); }

  /**
   * Build BufferGeometry. Group 0 = skin (smooth shaded across shallow angles), group 1 = cap.
   * Cap gets attributes: uv (planar), aEdge (0 at rim .. 1 at centre) for the heat-glow shader.
   */
  toGeometry(smoothAngleDeg = 38, uvScale = 0.5): THREE.BufferGeometry {
    const cosT = Math.cos(THREE.MathUtils.degToRad(smoothAngleDeg));
    const key = (p: THREE.Vector3) => `${Math.round(p.x * 1e5)},${Math.round(p.y * 1e5)},${Math.round(p.z * 1e5)}`;
    const vmap = new Map<string, Poly[]>();
    for (const poly of this.polys) {
      if (poly.tag !== 0) continue;
      for (const p of poly.pts) {
        const k = key(p);
        (vmap.get(k) ?? vmap.set(k, []).get(k)!).push(poly);
      }
    }
    const pos: number[] = [], nor: number[] = [], uv: number[] = [], edge: number[] = [];
    const idx: number[][] = [[], []];
    const push = (p: THREE.Vector3, n: THREE.Vector3, u: number, v: number, e: number) => {
      pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); uv.push(u, v); edge.push(e);
      return pos.length / 3 - 1;
    };
    for (const poly of this.polys) {
      const group = poly.tag === 0 ? 0 : 1;
      const ids: number[] = [];
      if (poly.tag === 0) {
        for (const p of poly.pts) {
          const nn = new THREE.Vector3();
          for (const o of vmap.get(key(p))!) if (o.normal.dot(poly.normal) > cosT) nn.addScaledVector(o.normal, 1);
          ids.push(push(p, nn.normalize(), 0, 0, 0));
        }
        for (let i = 1; i < ids.length - 1; i++) idx[0].push(ids[0], ids[i], ids[i + 1]);
      } else {
        const n = poly.normal;
        const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const e1 = new THREE.Vector3().crossVectors(n, ref).normalize();
        const e2 = new THREE.Vector3().crossVectors(n, e1);
        const c = poly.pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / poly.pts.length);
        const uvOf = (p: THREE.Vector3) => [p.dot(e1) * uvScale + 0.5, p.dot(e2) * uvScale + 0.5];
        const ci = push(c, n, ...(uvOf(c) as [number, number]), 1);
        const ring = poly.pts.map((p) => push(p, n, ...(uvOf(p) as [number, number]), 0));
        for (let i = 0; i < ring.length; i++) idx[1].push(ci, ring[i], ring[(i + 1) % ring.length]);
      }
      void group;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('aEdge', new THREE.Float32BufferAttribute(edge, 1));
    const all = [...idx[0], ...idx[1]];
    g.setIndex(all);
    g.addGroup(0, idx[0].length, 0);
    g.addGroup(idx[0].length, idx[1].length, 1);
    g.computeBoundingSphere();
    return g;
  }
}
