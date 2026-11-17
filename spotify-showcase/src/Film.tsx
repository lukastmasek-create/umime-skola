import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {useFonts} from './assets/fonts';
import {CameraRig} from './camera/CameraRig';
import {CamPoseCtx} from './camera/context';
import {evalCamera} from './camera/rig';
import {CHAINS} from './camera/shots';
import {SHOT} from './timeline';
import {FirstLight} from './scenes/FirstLight';
import {MusicPlayer} from './scenes/MusicPlayer';
import {GalleryArchitecture, CoverExit, paletteAt} from './scenes/AlbumUniverse';
import {GalleryCards} from './scenes/PlaylistGallery';
import {MusicInMotion} from './scenes/MusicInMotion';
import {InsideTheSound} from './scenes/InsideTheSound';
import {FinalHero} from './scenes/FinalHero';
import {Lights, LightRig} from './components/Studio';
import {StudioEnvironment} from './components/StudioEnvironment';
import {Overlay} from './Overlay';
import {range, smooth, lerp} from './animation/motion';

const inR = (f: number, a: number, b: number) => f >= a && f <= b;

function rigAt(f: number): {rig: LightRig; envRot: number; envInt: number} {
  const pal = paletteAt(f);
  if (f < 700) return {rig: {key: 1.9, fill: 0.3, rim: 22, rimColor: '#' + pal.getHexString(), keyColor: '#' + pal.clone().lerp(new THREE.Color('#ffffff'), 0.6).getHexString(), accent: 0, accentColor: '#' + pal.getHexString(), accentPos: [0.6, 0.6, 2.4]}, envRot: 0.9, envInt: 0.9};
  if (f < 1140) return {rig: {key: 2.4, fill: 0.55, rim: 26, rimColor: '#1DB954', accent: 0, accentColor: '#1DB954', accentPos: [0, -0.6, 2]}, envRot: 0.9, envInt: 1.0};
  if (f < 1440) return {rig: {key: 0.9, fill: 0.15, rim: 150, rimColor: '#1DB954', keyColor: '#e8fff0', accent: 22, accentColor: '#3dff87', accentPos: [0, 0.2, 2.5]}, envRot: 0.4 + (f - 1140) * 0.004, envInt: 1.0};
  const k = smooth(range(f, 1440, 1520));
  const sweep = smooth(range(f, 1500, 1640));
  return {rig: {key: lerp(0.9, 3.1, k) * (1 - 0.18 * smooth(range(f, 1700, 1799))), fill: lerp(0.15, 0.7, k), rim: lerp(150, 90, k), rimColor: '#1DB954', accent: 0}, envRot: 0.5 + sweep * 1.2, envInt: lerp(0.9, 1.1, k)};
}

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ready = useFonts();
  if (!ready) return null;
  const pose = evalCamera(CHAINS, frame);
  const late = frame >= 420;
  const r = rigAt(frame);
  const origin = pose.focus.toArray() as [number, number, number];
  return (
    <AbsoluteFill style={{background: '#030504'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 30, near: 0.01, far: 400}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}>
        <color attach="background" args={['#030504']} />
        <fog attach="fog" args={['#030504', 12, 62]} />
        <CamPoseCtx.Provider value={pose}>
          <CameraRig pose={pose} />
          {frame <= 186 && <FirstLight />}
          {inR(frame, SHOT.s2[0], SHOT.s2[1] + 2) && <MusicPlayer />}
          {late && (<>
            <StudioEnvironment rotationY={r.envRot} intensity={r.envInt} greenRim={frame < 1140 ? 0.2 : 1} />
            <Lights rig={r.rig} origin={origin} />
            {frame < 1000 && <><GalleryArchitecture /><CoverExit /></>}
            {frame < 1140 && <GalleryCards />}
            {inR(frame, 1000, 1300) && <MusicInMotion />}
            {inR(frame, 1090, 1560) && <InsideTheSound />}
            {frame >= 1380 && <FinalHero />}
          </>)}
        </CamPoseCtx.Provider>
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
