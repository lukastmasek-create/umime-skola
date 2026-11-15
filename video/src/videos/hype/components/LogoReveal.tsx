import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, FONTS, seededJitter } from '../brand';

export interface LogoRevealProps {
  theme: 'dark' | 'light';
  localFrame: number;
  headline?: string;
  showUrlPill?: boolean;
}

export const LogoReveal: React.FC<LogoRevealProps> = ({ theme, localFrame, headline, showUrlPill = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jitter = seededJitter(`logo-${theme}`, frame, 1.2);

  const tileSpring = (delay: number) =>
    spring({ fps, frame: Math.max(0, localFrame - delay), config: { damping: 10, stiffness: 220 } });
  const blueSpring = tileSpring(2);
  const coralSpring = tileSpring(7);
  const yellowSpring = tileSpring(12);
  const greenSpring = tileSpring(17);

  const smileDraw = interpolate(localFrame, [12, 26], [100, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sparklePop = spring({ fps, frame: Math.max(0, localFrame - 22), config: { damping: 8, stiffness: 260 } });
  const wordmarkSpring = spring({ fps, frame: Math.max(0, localFrame - 20), config: { damping: 13, stiffness: 190 } });

  const textColor = theme === 'dark' ? BRAND.textLight : BRAND.ink;
  const cardSurface = theme === 'dark' ? BRAND.surfaceDark : BRAND.surfaceLight;
  const cardBorder = theme === 'dark' ? BRAND.borderDark : BRAND.borderLight;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        transform: `translate3d(${jitter.x}px, ${jitter.y}px, 0)`,
      }}
    >
      {theme === 'dark' && (
        <div
          style={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND.brandGlow}55 0%, transparent 70%)`,
            transform: `scale(${interpolate(wordmarkSpring, [0, 1], [0.4, 1.15])})`,
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ width: 340, height: 354, position: 'relative', marginBottom: 36 }}>
        <svg viewBox="0 0 120 125" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <g transform={`translate(8, ${interpolate(blueSpring, [0, 1], [-60, 10])}) scale(${blueSpring})`}>
            <rect x="0" y="6" width="46" height="46" rx="14" fill={BRAND.blueLip} />
            <rect x="0" y="0" width="46" height="46" rx="14" fill={BRAND.blue} />
            <circle cx="15" cy="17" r="3.4" fill="#ffffff" />
            <circle cx="31" cy="17" r="3.4" fill="#ffffff" />
            <path
              d="M 13 27 Q 23 36 33 27"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset={smileDraw}
            />
          </g>

          <g
            transform={`translate(62, ${interpolate(coralSpring, [0, 1], [-60, 10])}) rotate(${interpolate(coralSpring, [0, 1], [-25, 12])} 23 23) scale(${coralSpring})`}
          >
            <rect x="0" y="6" width="46" height="46" rx="14" fill={BRAND.coralLip} />
            <rect x="0" y="0" width="46" height="46" rx="14" fill={BRAND.coral} />
          </g>

          <g transform={`translate(8, ${interpolate(yellowSpring, [0, 1], [130, 66])}) scale(${yellowSpring})`}>
            <rect x="0" y="6" width="46" height="46" rx="14" fill={BRAND.yellowLip} />
            <rect x="0" y="0" width="46" height="46" rx="14" fill={BRAND.yellow} />
          </g>

          <g transform={`translate(62, ${interpolate(greenSpring, [0, 1], [130, 66])}) scale(${greenSpring})`}>
            <rect x="0" y="6" width="46" height="46" rx="14" fill={BRAND.greenLip} />
            <rect x="0" y="0" width="46" height="46" rx="14" fill={BRAND.green} />
          </g>

          <g transform={`translate(110, 8) scale(${sparklePop}) rotate(${interpolate(sparklePop, [0, 1], [-90, 0])})`}>
            <path
              d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z"
              fill={BRAND.yellow}
              stroke={BRAND.yellowLip}
              strokeWidth="1.2"
            />
          </g>
        </svg>
      </div>

      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 78,
          color: textColor,
          letterSpacing: `${interpolate(wordmarkSpring, [0, 1], [0.22, -0.02])}em`,
          opacity: wordmarkSpring,
          transform: `translateY(${interpolate(wordmarkSpring, [0, 1], [28, 0])}px)`,
          textAlign: 'center',
          textShadow: theme === 'dark' ? `0 8px 0 #070514` : `0 6px 0 ${BRAND.borderLight}`,
        }}
      >
        učíme se <span style={{ color: BRAND.coral }}>hrou</span>
        <span style={{ color: BRAND.yellow }}>.</span>
      </div>

      {headline && (
        <div
          style={{
            marginTop: 28,
            padding: '20px 36px',
            backgroundColor: cardSurface,
            border: `4px solid ${cardBorder}`,
            boxShadow: `0 10px 0 ${theme === 'dark' ? '#070514' : BRAND.ink}`,
            borderRadius: 28,
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 1.15,
            color: textColor,
            textAlign: 'center',
            textTransform: 'uppercase',
            transform: `scale(${wordmarkSpring})`,
          }}
        >
          {headline}
        </div>
      )}

      {showUrlPill && (
        <div
          style={{
            marginTop: 32,
            padding: '16px 42px',
            backgroundColor: BRAND.blue,
            color: '#ffffff',
            fontFamily: FONTS.body,
            fontWeight: 800,
            fontSize: 40,
            borderRadius: 999,
            boxShadow: `0 10px 0 ${BRAND.blueLip}`,
            letterSpacing: '0.02em',
            transform: `scale(${wordmarkSpring})`,
          }}
        >
          ucimesehrou.org
        </div>
      )}
    </div>
  );
};
