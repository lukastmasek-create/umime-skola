import React, {useMemo} from 'react';
import * as THREE from 'three';

/** Instanced mesh whose matrices (and optional colors) are a pure function of time, filled every render. */
export const Instances: React.FC<{count: number; geometry: THREE.BufferGeometry; material: THREE.Material; t: number;
  fill: (i: number, t: number, m: THREE.Matrix4, color?: THREE.Color) => boolean | void | THREE.Matrix4; colored?: boolean}> = ({count, geometry, material, t, fill, colored}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, count);
    m.frustumCulled = false;
    if (colored) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    return m;
  }, [geometry, material, count, colored]);
  const m = new THREE.Matrix4(), c = new THREE.Color(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < count; i++) {
    const keep = fill(i, t, m, c);
    mesh.setMatrixAt(i, keep === false ? zero : m);
    if (colored) mesh.setColorAt(i, c);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};
export const composeTRS = (m: THREE.Matrix4, p: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3 | number) =>
  m.compose(p, q, typeof s === 'number' ? new THREE.Vector3(s, s, s) : s);
