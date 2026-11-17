import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { getCameraFrame } from "../utils/camera";

export const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const c = getCameraFrame(frame);

    camera.position.set(c.position[0], c.position[1], c.position[2]);
    camera.lookAt(new THREE.Vector3(c.look[0], c.look[1], c.look[2]));

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = c.fov;
      camera.near = 0.05;
      camera.far = 240;
      camera.updateProjectionMatrix();
    }
  }, [camera, frame]);

  return null;
};
