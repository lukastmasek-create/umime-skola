import React, {useEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {useFonts} from './assets/fonts';
import {drawHome, drawNowPlaying, drawLibrary, drawSearch, drawAlbum, drawSplash, UI_W, UI_H} from './components/SpotifyUI';
import {HEROES} from './assets/content';
export const UIDebug: React.FC = () => {
  const ready = useFonts();
  const refs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  useEffect(() => {
    if (!ready) return;
    const fns = [(g: CanvasRenderingContext2D) => drawHome(g), (g: CanvasRenderingContext2D) => drawNowPlaying(g, {hero: HEROES.weeknd, progress: 0.37, playing: true}), (g: CanvasRenderingContext2D) => drawLibrary(g), (g: CanvasRenderingContext2D) => drawSearch(g), (g: CanvasRenderingContext2D) => drawAlbum(g), (g: CanvasRenderingContext2D) => drawSplash(g)];
    refs.forEach((r, i) => { const c = r.current!; c.width = UI_W; c.height = UI_H; fns[i](c.getContext('2d')!); });
  }, [ready]);
  return <AbsoluteFill style={{background: '#333', flexDirection: 'row', flexWrap: 'wrap'}}>{refs.map((r, i) => <canvas key={i} ref={r} style={{width: 540, height: 1207}} />)}</AbsoluteFill>;
};
