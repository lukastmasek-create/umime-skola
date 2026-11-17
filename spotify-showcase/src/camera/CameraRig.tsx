import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {evalCamera} from './rig';

/** Applies the cinematic camera path to the R3F camera for the current frame. */
export const CameraRig: React.FC<{pose: ReturnType<typeof evalCamera>}> = ({pose: p}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.copy(p.pos); camera.quaternion.copy(p.quat); camera.fov = p.fov;
  camera.near = 0.01; camera.far = 400; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  useLayoutEffect(() => { camera.position.copy(p.pos); camera.quaternion.copy(p.quat); camera.fov = p.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); });
  return null;
};
