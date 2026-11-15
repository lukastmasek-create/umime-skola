import React from 'react';
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, ECHO_COLORS, FONTS, HIGH_CONTRAST_TEXT, seededJitter, BrandBgKey } from '../brand';

export type KineticMode = 'slam' | 'stretch' | 'scramble' | 'extrude' | 'outline-echo' | 'tracking-in';

export interface KineticWordProps {
  text: string;
  subtext?: string;
  color?: string;
  bg: BrandBgKey;
  align?: 'center' | 'left' | 'right';
  crop?: boolean;
  tracking?: number;
  mode?: KineticMode;
  localFrame: number;
  dur: number;
  shakeOnHit?: boolean;
}

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#?!';

export const KineticWord: React.FC<KineticWordProps> = ({
  text,
  subtext,
  color,
  bg,
  align = 'center',
  crop = false,
  tracking = -0.03,
  mode = 'slam',
  localFrame,
  dur,
  shakeOnHit = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const resolvedColor = color ?? HIGH_CONTRAST_TEXT[bg];

  const holdScale = interpolate(localFrame, [0, dur], [1, 1.045], { extrapolateRight: 'clamp' });
  const jitter = seededJitter(`kw-${text}`, frame, shakeOnHit && localFrame < 6 ? 12 : 1.6);

  const slamSpring = spring({ fps, frame: localFrame, config: { damping: 11, stiffness: 230, mass: 0.8 } });

  const baseScale =
    mode === 'slam'
      ? interpolate(slamSpring, [0, 1], [1.58, 1]) * holdScale
      : mode === 'extrude'
      ? interpolate(localFrame, [0, dur], [0.78, 1.35], {
          easing: Easing.inOut(Easing.cubic),
          extrapolateRight: 'clamp',
        })
      : holdScale;

  const stretchX = mode === 'stretch' ? interpolate(slamSpring, [0, 0.6, 1], [1.75, 0.88, 1]) : 1;
  const skewDeg = mode === 'stretch' ? interpolate(slamSpring, [0, 1], [-18, 0]) : 0;

  const dynamicTracking =
    mode === 'tracking-in' ? interpolate(slamSpring, [0, 1], [0.32, tracking]) : tracking;

  const cleanLength = text.length;
  const fontSize = crop
    ? cleanLength <= 7
      ? 235
      : 175
    : cleanLength <= 8
    ? 168
    : cleanLength <= 15
    ? 126
    : 94;

  const hasTrailingDot = text.endsWith('.');
  const mainBody = hasTrailingDot ? text.slice(0, -1) : text;
  const chars = Array.from(mainBody);

  const motionBlurOpacity = mode === 'slam' && localFrame < 5 ? (1 - localFrame / 5) * 0.38 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        padding: crop ? '0px' : '0 56px',
        overflow: 'hidden',
        transform: `translate3d(${jitter.x}px, ${jitter.y}px, 0)`,
      }}
    >
      {mode === 'outline-echo' &&
        ECHO_COLORS.map((echoCol, idx) => {
          const offset = (idx + 1) * 26 * slamSpring;
          return (
            <div
              key={echoCol}
              style={{
                position: 'absolute',
                fontFamily: FONTS.display,
                fontWeight: 800,
                fontSize,
                lineHeight: 0.94,
                letterSpacing: `${dynamicTracking}em`,
                textAlign: align,
                color: 'transparent',
                WebkitTextStroke: `4px ${echoCol}`,
                transform: `translateY(${idx % 2 === 0 ? -offset : offset}px) scale(${baseScale})`,
                opacity: 0.82 - idx * 0.14,
                userSelect: 'none',
                pointerEvents: 'none',
                textTransform: 'uppercase',
              }}
            >
              {text}
            </div>
          );
        })}

      {motionBlurOpacity > 0.02 && (
        <div
          style={{
            position: 'absolute',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize,
            lineHeight: 0.94,
            letterSpacing: `${dynamicTracking}em`,
            textAlign: align,
            color: BRAND.coral,
            transform: `scale(${baseScale * 1.16}) translateY(-18px)`,
            opacity: motionBlurOpacity,
            filter: 'blur(8px)',
            pointerEvents: 'none',
            textTransform: 'uppercase',
          }}
        >
          {text}
        </div>
      )}

      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize,
          lineHeight: 0.94,
          letterSpacing: `${dynamicTracking}em`,
          textAlign: align,
          color: resolvedColor,
          textTransform: 'uppercase',
          transform: `scale(${baseScale}) scaleX(${stretchX}) skewX(${skewDeg}deg)`,
          textShadow:
            mode === 'extrude'
              ? `0 4px 0 ${BRAND.blueLip}, 0 8px 0 ${BRAND.blueLip}, 0 12px 0 ${BRAND.ink}, 0 18px 0 ${BRAND.ink}`
              : `0 10px 0 ${bg === 'cream' || bg === 'yellow' ? BRAND.ink : '#080616'}`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          maxWidth: crop ? '118%' : '100%',
        }}
      >
        {chars.map((char, idx) => {
          const charFrame = Math.max(0, localFrame - idx * 0.7);
          const charPop = spring({ fps, frame: charFrame, config: { damping: 12, stiffness: 250 } });

          let displayChar = char;
          if (mode === 'scramble' && char !== ' ' && charFrame < 7) {
            const pick = Math.floor(
              random(`scr-${text}-${idx}-${Math.floor(charFrame)}`) * SCRAMBLE_GLYPHS.length
            );
            displayChar = SCRAMBLE_GLYPHS[pick];
          }

          const yOffset = interpolate(charPop, [0, 1], [42, 0]);

          return (
            <span
              key={`${idx}-${char}`}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : 'normal',
                transform: `translateY(${yOffset}px)`,
              }}
            >
              {displayChar}
            </span>
          );
        })}

        {hasTrailingDot && (
          <span
            style={{
              display: 'inline-block',
              color: bg === 'coral' ? BRAND.yellow : BRAND.coral,
              marginLeft: '4px',
            }}
          >
            .
          </span>
        )}
      </div>

      {subtext && (
        <div
          style={{
            marginTop: 36,
            padding: '14px 30px',
            backgroundColor: bg === 'indigo' || bg === 'deepIndigo' ? BRAND.surfaceDark : BRAND.ink,
            color: BRAND.cream,
            fontFamily: FONTS.body,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: '0.06em',
            borderRadius: 22,
            border: `3px solid ${BRAND.coral}`,
            boxShadow: `0 8px 0 ${BRAND.coralLip}`,
            transform: `scale(${slamSpring})`,
            textTransform: 'uppercase',
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};
