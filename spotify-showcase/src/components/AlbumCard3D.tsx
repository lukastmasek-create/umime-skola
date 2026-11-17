import React from 'react';
import {Card3D, CardProps} from './Card3D';
import {HEROES, Hero} from '../assets/content';
import {albumFaceTex, playlistFaceTex} from '../assets/faces';

/** Album plate (front) – optional playlist plate on the back so the card can flip & "transform". */
export const AlbumCard3D: React.FC<{hero: Hero['key']; playlist?: string} & Omit<CardProps, 'front' | 'back'>> = ({hero, playlist, ...p}) => (
  <Card3D front={albumFaceTex(hero)} back={playlist ? playlistFaceTex(playlist) : null} edge={HEROES[hero].accent} {...p} />
);
