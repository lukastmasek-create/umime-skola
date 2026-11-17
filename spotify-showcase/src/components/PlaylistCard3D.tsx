import React from 'react';
import {Card3D, CardProps} from './Card3D';
import {playlistFaceTex} from '../assets/faces';

export const PlaylistCard3D: React.FC<{playlist: string} & Omit<CardProps, 'front'>> = ({playlist, ...p}) => (
  <Card3D front={playlistFaceTex(playlist)} {...p} />
);
