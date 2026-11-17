import React from 'react';
import * as THREE from 'three';
import {polygonize, polygonizeCached, SDF} from '../../geometry/sdfMesh';

/** Time-varying implicit surface rendered with marching cubes. `id` + `t` key the per-frame mesh cache. */
export const LiquidMesh: React.FC<{id: string; t: number; field: SDF; res: number | [number, number, number]; min: THREE.Vector3; max: THREE.Vector3; material: THREE.Material}> = ({id, t, field, res, min, max, material}) => {
  const geo = polygonizeCached(`${id}:${t.toFixed(4)}`, () => polygonize(field, res, min, max));
  return <mesh geometry={geo} material={material} frustumCulled={false} />;
};
export const resScale = (q: string, base: number) => Math.round(base * (q === 'preview' ? 0.6 : q === 'high' ? 1 : 1.4));
