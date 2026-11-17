import {createContext, useContext} from 'react';
import type {Pose} from './rig';
export const CamPoseCtx = createContext<Pose | null>(null);
export const useCamPose = () => useContext(CamPoseCtx)!;
