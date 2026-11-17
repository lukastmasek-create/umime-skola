import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from './assets/fonts';
import {range, smooth, smoother} from './animation/motion';

const Mark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F5F7F5" />
    <g fill="none" stroke="#030504" strokeLinecap="round"><path d="M21.5 37.5C42 30 67 33 80 43.5" strokeWidth="8.2" /><path d="M25 53C42 47.5 62 49.5 74.5 58.5" strokeWidth="6.6" /><path d="M28.5 67.5C42 64 58 65.5 69 72.5" strokeWidth="5.2" /></g></svg>
);

/** Typography, vignette and the final fade. Pure functions of the frame. */
export const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = smooth(range(f, 705, 745)) * (1 - smooth(range(f, 866, 896)));
  const lift1 = (1 - smoother(range(f, 705, 760))) * 22;
  // final
  const logoA = smooth(range(f, 1590, 1640)), logoY = (1 - smoother(range(f, 1590, 1660))) * 18;
  const tagA = smooth(range(f, 1632, 1682)), tagY = (1 - smoother(range(f, 1632, 1700))) * 14;
  const fade = smooth(range(f, 1752, 1799));
  const common: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: FONT, color: '#F5F7F5'};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
      {/* section headline – shot 04 (kept clear of platform UI zones: sits at ~80%) */}
      <div style={{...common, top: 1495, opacity: t1, transform: `translateY(${lift1}px)`, fontSize: 64, fontWeight: 800, letterSpacing: -1.6, lineHeight: 1.05}}>
        Every mood.<br /><span style={{color: '#1DB954'}}>Every moment.</span>
      </div>
      {/* final lockup */}
      <div style={{...common, top: 1296, opacity: logoA, transform: `translateY(${logoY}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Mark size={96} /><span style={{fontSize: 108, fontWeight: 800, letterSpacing: -4}}>Spotify</span></div>
      </div>
      <div style={{...common, top: 1432, opacity: tagA, transform: `translateY(${tagY}px)`, fontSize: 40, fontWeight: 500, letterSpacing: 1.2, color: 'rgba(245,247,245,.82)'}}>Your music. Your world.</div>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
