import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SHOT, P2} from '../timeline';
import {Lights} from '../components/Studio';
import {StudioEnvironment} from '../components/StudioEnvironment';
import {useUITexture} from '../components/useUITexture';
import {drawNowPlaying, drawLibrary, drawSearch, drawAlbum, NP_LAYOUT, UI_H, UI_W, LW, LH} from '../components/SpotifyUI';
import {HEROES} from '../assets/content';
import {roundedPlane, bevelSlab} from '../components/geo';
import {Card3D} from '../components/Card3D';
import {heroArtTex, faceTexture} from '../assets/faces';
import {drawIcon} from '../assets/icons';
import {SW, SH} from '../components/Phone3D';
import {dampedSpring, range, smooth, smoother, cinematic, easeInOutQuart, lerp, settleLag} from '../animation/motion';
import {glassSheen, darkMetal} from '../materials';
import {useCamPose} from '../camera/context';

const hero = HEROES.weeknd;
const S = SW / (LW / LW); // screen width in world units (0.68)
const px = (lx: number) => (lx / LW - 0.5) * SW;       // logical → world x
const py = (ly: number) => (0.5 - ly / LH) * SH;       // logical → world y
export const COVER = {x: px(LW / 2), y: py(128 + (LW - 48) / 2), s: ((LW - 48) / LW) * SW};

/** Transparent depth layer carrying a slice of the Now Playing UI. */
const Layer: React.FC<{parts: Parameters<typeof drawNowPlaying>[1]['parts']; progress?: number; z: number; opacity?: number; keyId: string; sheen?: boolean}> = ({parts, progress = 0.06, z, opacity = 1, keyId}) => {
  const tex = useUITexture(UI_W, UI_H, (g) => drawNowPlaying(g, {hero, progress, playing: true, parts: {bg: false, header: false, art: false, title: false, progress: false, controls: false, play: false, volume: false, status: false, ...parts}}), keyId + Math.round(progress * 200));
  const geo = useMemo(() => roundedPlane(SW, SH, 0.0), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, transparent: true, toneMapped: false, depthWrite: false}), [tex]);
  mat.opacity = opacity;
  return <mesh geometry={geo} material={mat} position={[0, 0, z]} renderOrder={2} />;
};

/** Side UI panels – real thick slabs showing Search / Library / Album detail, floating at depth. */
const UISlab: React.FC<{draw: (g: CanvasRenderingContext2D) => void; id: string; position: [number, number, number]; rotation: [number, number, number]; opacity?: number}> = ({draw, id, position, rotation, opacity = 1}) => {
  const tex = useUITexture(UI_W, UI_H, draw, id);
  const geo = useMemo(() => ({b: bevelSlab(SW + 0.03, SH + 0.03, 0.03, 0.06, 0.008), s: roundedPlane(SW, SH, 0.05)}), []);
  const m = useMemo(() => ({b: darkMetal('#1a1d1e'), s: new THREE.MeshBasicMaterial({map: tex, toneMapped: false, transparent: true}), sh: glassSheen(1)}), [tex]);
  m.s.opacity = opacity; m.b.transparent = opacity < 1; m.b.opacity = opacity; m.sh.opacity = opacity;
  return (
    <group position={position} rotation={rotation} visible={opacity > 0.01}>
      <mesh geometry={geo.b} material={m.b} />
      <mesh geometry={geo.s} material={m.s} position={[0, 0, 0.0165]} />
      <mesh geometry={geo.s} material={m.sh} position={[0, 0, 0.018]} renderOrder={5} />
    </group>
  );
};

/** SHOT 02 — The Music Player. Match-cut from the phone screen into a layered interface. */
export const MusicPlayer: React.FC = () => {
  const f = useCurrentFrame() - SHOT.s2[0];            // local frame 0..239
  const pose = useCamPose();
  const baseTex = useUITexture(UI_W, UI_H, (g) => drawNowPlaying(g, {hero, progress: 0.06, playing: true, parts: {art: f < 1, artHole: f >= 1, title: false, progress: false, controls: false, play: false, volume: true, header: true, status: true}}), f < 1 ? 'a' : 'b');
  const baseGeo = useMemo(() => roundedPlane(SW, SH, 0.1), []);
  const baseMat = useMemo(() => new THREE.MeshBasicMaterial({map: baseTex, toneMapped: false}), [baseTex]);

  // Layer separation (springs, heavier = slower / lower frequency)
  const sTitle = dampedSpring(f - 10, 1.1, 0.8);
  const sCtrl = dampedSpring(f - 16, 1.2, 0.82);
  const sPlay = dampedSpring(f - 22, 1.5, 0.62);
  const sCover = dampedSpring(f - 4, 0.8, 0.74);
  const sSide = smoother(range(f, 20, 90));
  // Cover leaves the screen, hovers, then flies past the camera (back face fills the frame)
  const fly = easeInOutQuart(range(f, 150, 238));
  const hover = Math.sin(range(f, 40, 150) * Math.PI) * 0.0;
  const coverBase = new THREE.Vector3(COVER.x, COVER.y + 0.02 * sCover, 0.32 * sCover + 0.0005);
  const coverRotY = lerp(0, Math.PI, fly) + 0.26 * Math.sin(range(f, 20, 150) * Math.PI) * (1 - fly);
  const coverRotX = -0.06 * sCover * (1 - fly);
  // attach-to-camera blend for the closing occluder
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(pose.quat);
  const attached = pose.pos.clone().addScaledVector(fwd, lerp(2.0, 0.9, fly));
  const coverPos = coverBase.clone().add(new THREE.Vector3(...P2)).lerp(attached, smoother(range(f, 175, 238)));
  const coverQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(coverRotX, coverRotY, 0));
  coverQ.slerp(pose.quat.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0))), smoother(range(f, 190, 238)));
  const art = heroArtTex('weeknd');
  const pauseTex = faceTexture('np-pause', (g) => { drawIcon(g, 'pause', 24, 24, 80, '#000'); }, 128, 128);
  const press = 0;

  return (
    <group>
      <StudioEnvironment rotationY={0.8} intensity={1.0} />
      <Lights rig={{key: 1.4, fill: 0.35, rim: 110, rimColor: '#ff2a3d', keyColor: '#ffe8e8', accent: 18, accentColor: '#ff2a3d', accentPos: [P2[0] + 1.4, 0.4, 1.2]}} origin={P2} />
      <group position={P2}>
        <mesh geometry={baseGeo} material={baseMat} />
        <group position={[0, 0, 0.05 * sTitle]}><Layer parts={{title: true}} z={0.0008} keyId="t" /></group>
        <group position={[0, 0, 0.11 * sCtrl]}><Layer parts={{progress: true, controls: true}} z={0.0008} keyId="c" /></group>
        {/* Play control: white at the match-cut, becomes a luminous green circular control as it lifts */}
        <group position={[px(LW / 2), py(NP_LAYOUT.playY * LH), 0.002 + 0.17 * sPlay]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[(33 / LW) * SW, (33 / LW) * SW * 1.02, 0.03, 64]} />
            <meshPhysicalMaterial color={new THREE.Color('#ffffff').lerp(new THREE.Color('#1DB954'), smooth(range(f, 14, 40)))} emissive="#1DB954" emissiveIntensity={0.5 * smooth(range(f, 14, 40))} roughness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, 0.0155]}><planeGeometry args={[0.09, 0.09]} /><meshBasicMaterial map={pauseTex} transparent toneMapped={false} /></mesh>
        </group>
        <UISlab id="lib" draw={(g) => drawLibrary(g)} position={[-1.05 * sSide, 0.0, -0.35 * sSide - 0.1]} rotation={[0, 0.5 * sSide, 0]} opacity={sSide} />
        <UISlab id="search" draw={(g) => drawSearch(g)} position={[1.05 * sSide, 0.05, -0.55 * sSide - 0.1]} rotation={[0, -0.5 * sSide, 0]} opacity={sSide} />
      </group>
      <Card3D front={art} position={coverPos} quaternion={coverQ} w={COVER.s} h={COVER.s} depth={0.045} radius={0.03} inset={0.004} edge="#7a1020" emissive={0.6} backEmissive={0} />
    </group>
  );
};
