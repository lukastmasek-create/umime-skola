import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Waveform3D} from '../components/Waveform3D';

/** SHOT 05 — Music in Motion: the green progress line draws out of the player and becomes a waveform sculpture. */
export const MusicInMotion: React.FC = () => {
  const f = useCurrentFrame();
  return <Waveform3D frame={f} start={1020} headEnd={1262} />;
};
