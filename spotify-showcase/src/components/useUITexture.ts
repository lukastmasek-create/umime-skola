import {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useFonts} from '../assets/fonts';

/** Canvas-drawn texture. `key` triggers redraw (pure function of frame state). */
export function useUITexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, key: string | number, aniso = true) {
  const gl = useThree((s) => s.gl);
  const ready = useFonts();
  const obj = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso ? gl.capabilities.getMaxAnisotropy() : 1;
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true;
    return {canvas, tex};
  }, [w, h, gl, aniso]);
  useMemo(() => {
    if (!ready) return;
    const g = obj.canvas.getContext('2d')!; g.clearRect(0, 0, w, h); draw(g); obj.tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key, obj]);
  return obj.tex;
}
