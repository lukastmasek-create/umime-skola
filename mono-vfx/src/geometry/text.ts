import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';

const font = new FontLoader().parse(fontJson as any);

export interface Letter { char: string; geo: THREE.BufferGeometry; center: THREE.Vector3; box: THREE.Box3; rings: THREE.Vector2[][]; }
export interface Word { geo: THREE.BufferGeometry; letters: Letter[]; depth: number; width: number; height: number; }

/**
 * 3D extruded text, centered at origin (z centered too). One geometry per letter + one merged geometry.
 * `rings` are the 2D outline polygons (outer + holes) in the same centered coordinates, used for exact cap generation.
 */
export function buildWord(lines: string[], opts: {size?: number; depth?: number; bevel?: number; bevelSegs?: number; lineGap?: number; tracking?: number} = {}): Word {
  const size = opts.size ?? 1, depth = opts.depth ?? 0.32, bev = opts.bevel ?? 0.025, tr = opts.tracking ?? 0.06, lh = (opts.lineGap ?? 1.3) * size;
  const scale = size / (font.data as any).resolution;
  const raw: Letter[] = [];
  lines.forEach((line, li) => {
    let x = 0; const widths: number[] = [];
    for (const ch of line) { const g = (font.data as any).glyphs[ch]; widths.push((g ? g.ha : 600) * scale + tr * size); }
    const total = widths.reduce((a, b) => a + b, 0) - tr * size;
    let cursor = -total / 2;
    [...line].forEach((ch, i) => {
      if (ch !== ' ') {
        const shapes = font.generateShapes(ch, size);
        const rings: THREE.Vector2[][] = [];
        shapes.forEach((s) => { rings.push(s.getPoints(10)); s.holes.forEach((h) => rings.push(h.getPoints(10))); });
        const geo = new THREE.ExtrudeGeometry(shapes, {depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: opts.bevelSegs ?? 3, curveSegments: 10});
        const dx = cursor, dy = -li * lh;
        geo.translate(dx, dy, -depth / 2);
        rings.forEach((r) => r.forEach((p) => { p.x += dx; p.y += dy; }));
        raw.push({char: ch, geo, center: new THREE.Vector3(), box: new THREE.Box3(), rings});
      }
      cursor += widths[i];
      x += widths[i];
    });
    void x;
  });
  const all = new THREE.Box3();
  raw.forEach((l) => { l.geo.computeBoundingBox(); all.union(l.geo.boundingBox!); });
  const c = all.getCenter(new THREE.Vector3());
  raw.forEach((l) => {
    l.geo.translate(-c.x, -c.y, 0);
    l.rings.forEach((r) => r.forEach((p) => { p.x -= c.x; p.y -= c.y; }));
    l.geo.computeVertexNormals();
    l.geo.computeBoundingBox(); l.box = l.geo.boundingBox!.clone(); l.center = l.box.getCenter(new THREE.Vector3());
  });
  const geo = mergeGeometries(raw.map((l) => l.geo.clone()), false)!;
  const sz = all.getSize(new THREE.Vector3());
  return {geo, letters: raw, depth, width: sz.x, height: sz.y};
}

/** Intersect the line n·p = d (2D) with polygon rings; returns [s0,s1] spans (even–odd) along dir=(−n.y,n.x). */
export function lineSpans(rings: THREE.Vector2[][], n: THREE.Vector2, d: number): [number, number][] {
  const dir = new THREE.Vector2(-n.y, n.x), hits: number[] = [];
  for (const ring of rings) for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const da = a.dot(n) - d, db = b.dot(n) - d;
    if ((da < 0) !== (db < 0)) { const t = da / (da - db); hits.push(new THREE.Vector2().lerpVectors(a, b, t).dot(dir)); }
  }
  hits.sort((x, y) => x - y);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < hits.length; i += 2) out.push([hits[i], hits[i + 1]]);
  return out;
}

/** Flat quads closing a cut through extruded letters. Normal = ±n. */
export function capGeometry(spans: [number, number][], n: THREE.Vector2, d: number, z0: number, z1: number, flip: boolean): THREE.BufferGeometry {
  const dir = new THREE.Vector2(-n.y, n.x), pos: number[] = [], nor: number[] = [], idx: number[] = [], uv: number[] = [];
  spans.forEach(([s0, s1], k) => {
    const P = (s: number, z: number) => [n.x * d + dir.x * s, n.y * d + dir.y * s, z];
    const q = [P(s0, z0), P(s1, z0), P(s1, z1), P(s0, z1)];
    const nn = flip ? [-n.x, -n.y, 0] : [n.x, n.y, 0];
    q.forEach((p, i) => { pos.push(...p); nor.push(...nn); uv.push(i === 1 || i === 2 ? 1 : 0, i >= 2 ? 1 : 0); });
    const b = k * 4;
    if (flip) idx.push(b, b + 2, b + 1, b, b + 3, b + 2); else idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** Clone a material that discards fragments outside the local-space band lo <= n·p <= hi. */
export const bandMaterial = (base: THREE.MeshPhysicalMaterial, n: THREE.Vector2, lo: number, hi: number) => {
  const m = base.clone();
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uN = {value: n.clone()}; sh.uniforms.uLo = {value: lo}; sh.uniforms.uHi = {value: hi};
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLP; uniform vec2 uN; uniform float uLo; uniform float uHi;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n { float s = dot(vLP.xy, uN); if (s < uLo || s > uHi) discard; }');
  };
  m.customProgramCacheKey = () => `band-${lo.toFixed(3)}-${hi.toFixed(3)}-${n.x.toFixed(3)}`;
  return m;
};
