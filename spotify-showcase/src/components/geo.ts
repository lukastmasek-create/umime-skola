import * as THREE from 'three';

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); s.lineTo(x + r, y);
  return s;
}
/** Extruded rounded slab with real bevelled edges, centred on origin, thickness d along Z. */
export function bevelSlab(w: number, h: number, d: number, r: number, bevel: number, segs = 48) {
  const sh = roundedRectShape(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel));
  const g = new THREE.ExtrudeGeometry(sh, {depth: d - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: 0, bevelSegments: 5, curveSegments: segs});
  g.translate(0, 0, -(d - bevel * 2) / 2);
  return g;
}
/** Flat rounded plane with 0..1 UVs (for textures). */
export function roundedPlane(w: number, h: number, r: number, segs = 32) {
  const g = new THREE.ShapeGeometry(roundedRectShape(w, h, r), segs);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}
