import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, ECHO_COLORS, FONTS, seededJitter } from '../brand';

export const StarburstBlob: React.FC<{ text: string; localFrame: number }> = ({ text, localFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 10, stiffness: 220 } });
  const morph = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  const points = 24;
  const pathData =
    Array.from({ length: points }, (_, i) => {
      const angle = (i / points) * Math.PI * 2;
      const isOuter = i % 2 === 0;
      const r = isOuter ? 420 : interpolate(morph, [0, 1], [420, 290]);
      const x = 500 + Math.cos(angle) * r;
      const y = 500 + Math.sin(angle) * r;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ') + ' Z';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 1000 1000" width={920} height={920} style={{ transform: `scale(${pop}) rotate(${frame * 1.4}deg)` }}>
        <path d={pathData} fill={BRAND.coralLip} transform="translate(0, 22)" />
        <path d={pathData} fill={BRAND.coral} stroke={BRAND.ink} strokeWidth="10" />
      </svg>
      <div
        style={{
          position: 'absolute',
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 96,
          lineHeight: 0.96,
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: 680,
          textShadow: `0 10px 0 ${BRAND.ink}`,
          transform: `scale(${pop}) rotate(-4deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const QuestionMarks: React.FC<{ text: string; subtext?: string; localFrame: number }> = ({
  text,
  subtext,
  localFrame,
}) => {
  const { fps } = useVideoConfig();

  const items = [
    { x: -290, y: -420, rot: -18, size: 380, color: BRAND.coral, outline: false, delay: 0 },
    { x: 280, y: -360, rot: 16, size: 420, color: BRAND.blue, outline: true, delay: 3 },
    { x: -260, y: 420, rot: 14, size: 360, color: BRAND.ink, outline: false, delay: 6 },
    { x: 270, y: 390, rot: -15, size: 440, color: BRAND.coral, outline: true, delay: 9 },
  ];

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
      }}
    >
      {items.map((item, idx) => {
        const s = spring({ fps, frame: Math.max(0, localFrame - item.delay), config: { damping: 9, stiffness: 220 } });
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: item.size,
              color: item.outline ? 'transparent' : item.color,
              WebkitTextStroke: item.outline ? `8px ${item.color}` : undefined,
              textShadow: item.outline ? undefined : `0 14px 0 ${BRAND.ink}`,
              transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rot}deg) scale(${s})`,
              userSelect: 'none',
            }}
          >
            ?
          </div>
        );
      })}

      <div
        style={{
          padding: '44px 52px',
          backgroundColor: BRAND.surfaceLight,
          border: `6px solid ${BRAND.ink}`,
          borderRadius: 36,
          boxShadow: `0 16px 0 ${BRAND.ink}`,
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 82,
          lineHeight: 0.98,
          color: BRAND.ink,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        {text.replace('?', '')}
        <span style={{ color: BRAND.coral }}>?</span>
        {subtext && (
          <div style={{ marginTop: 20, fontFamily: FONTS.body, fontWeight: 800, fontSize: 34, color: BRAND.blue }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export const LaserOverlay: React.FC<{ localFrame: number; startFrame?: number }> = ({
  localFrame,
  startFrame = 10,
}) => {
  const p1 = interpolate(localFrame, [startFrame, startFrame + 10], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p2 = interpolate(localFrame, [startFrame + 8, startFrame + 18], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (p1 <= 0) return null;

  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
    >
      <line x1={110} y1={420} x2={110 + 860 * p1} y2={420 + 1080 * p1} stroke={BRAND.coral} strokeWidth={28} strokeLinecap="round" />
      <line x1={110} y1={420} x2={110 + 860 * p1} y2={420 + 1080 * p1} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
      {p2 > 0 && (
        <>
          <line x1={970} y1={420} x2={970 - 860 * p2} y2={420 + 1080 * p2} stroke={BRAND.coral} strokeWidth={28} strokeLinecap="round" />
          <line x1={970} y1={420} x2={970 - 860 * p2} y2={420 + 1080 * p2} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const Viewfinder: React.FC<{ label: string; accentColor?: string }> = ({
  label,
  accentColor = BRAND.yellow,
}) => {
  const frame = useCurrentFrame();

  const corners: React.CSSProperties[] = [
    { top: 0, left: 0, borderTop: `6px solid ${accentColor}`, borderLeft: `6px solid ${accentColor}` },
    { top: 0, right: 0, borderTop: `6px solid ${accentColor}`, borderRight: `6px solid ${accentColor}` },
    { bottom: 0, left: 0, borderBottom: `6px solid ${accentColor}`, borderLeft: `6px solid ${accentColor}` },
    { bottom: 0, right: 0, borderBottom: `6px solid ${accentColor}`, borderRight: `6px solid ${accentColor}` },
  ];

  return (
    <div style={{ position: 'absolute', inset: 44, pointerEvents: 'none', zIndex: 15 }}>
      {corners.map((c, i) => (
        <div key={i} style={{ position: 'absolute', width: 52, height: 52, borderRadius: 10, ...c }} />
      ))}

      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          right: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: BRAND.ink,
            color: accentColor,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 24,
            borderRadius: 999,
            border: `3px solid ${accentColor}`,
            boxShadow: `0 5px 0 #000000`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: BRAND.coral, display: 'inline-block' }} />
          {label}
        </div>

        <svg width={68} height={68} viewBox="0 0 68 68">
          <circle
            cx={34}
            cy={34}
            r={26}
            fill="none"
            stroke={accentColor}
            strokeWidth={4}
            strokeDasharray="6 6"
            transform={`rotate(${frame * 3} 34 34)`}
          />
          <circle cx={34} cy={34} r={10} fill={BRAND.coral} />
        </svg>
      </div>
    </div>
  );
};

export const BoringWayGag: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 11, stiffness: 220 } });
  const jitter = seededJitter('boring-gag', frame, 1.8);

  const wallRows = [
    'QUIZZES. PETS. CODE. SHOP.',
    'STUDY. STUDY. STUDY. REPEAT.',
    'QUIZZES. PETS. CODE. SHOP.',
    'STUDY. STUDY. STUDY. REPEAT.',
    'QUIZZES. PETS. CODE. SHOP.',
    'STUDY. STUDY. STUDY. REPEAT.',
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `radial-gradient(${BRAND.borderDark} 2px, transparent 2px)`,
        backgroundSize: '42px 42px',
        padding: '0 48px',
        transform: `translate3d(${jitter.x}px, ${jitter.y}px, 0)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          opacity: 0.22,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {wallRows.map((row, idx) => (
          <div
            key={idx}
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 66,
              whiteSpace: 'nowrap',
              color: idx % 2 === 0 ? 'transparent' : ECHO_COLORS[idx % 4],
              WebkitTextStroke: idx % 2 === 0 ? `3px ${ECHO_COLORS[idx % 4]}` : undefined,
              transform: `translateX(${(idx % 2 === 0 ? -1 : 1) * localFrame * 4}px)`,
            }}
          >
            {row} {row}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '52px 48px',
          backgroundColor: BRAND.surfaceDark,
          border: `5px solid ${BRAND.borderDark}`,
          boxShadow: `0 16px 0 #070514`,
          borderRadius: 36,
          textAlign: 'center',
          transform: `scale(${pop})`,
          zIndex: 2,
        }}
      >
        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 72, lineHeight: 1.02, color: BRAND.textLight }}>
          THINK ABOUT HOMEWORK
        </div>
        <div
          style={{
            marginTop: 22,
            display: 'inline-block',
            padding: '12px 34px',
            backgroundColor: BRAND.coral,
            color: '#ffffff',
            fontFamily: FONTS.hand,
            fontSize: 64,
            borderRadius: 20,
            boxShadow: `0 8px 0 ${BRAND.coralLip}`,
            transform: 'rotate(-3deg)',
          }}
        >
          &ldquo;the boring way&rdquo;
        </div>
      </div>
    </div>
  );
};

export const TimerGag: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 12, stiffness: 220 } });

  const seconds = Math.max(0, 10 - Math.floor(localFrame / 4));
  const secStr = seconds.toString().padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 52px',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '44px 36px',
          backgroundColor: BRAND.ink,
          borderRadius: 36,
          border: `6px solid ${BRAND.cream}`,
          boxShadow: `0 18px 0 #070514`,
          transform: `scale(${pop})`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 36,
            width: '100%',
            marginBottom: 28,
            borderRadius: 10,
            backgroundImage: `repeating-linear-gradient(90deg, ${BRAND.yellow} 0 36px, ${BRAND.ink} 36px 72px)`,
          }}
        />

        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 92, color: BRAND.cream, letterSpacing: '-0.02em' }}>
          HOMEWORK
        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <svg width={88} height={88} viewBox="0 0 64 64" style={{ transform: `rotate(${Math.floor(localFrame / 10) * 45}deg)` }}>
            <path d="M16 8 H48 L36 30 L48 56 H16 L28 30 Z" fill={BRAND.yellow} stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          </svg>

          <div
            style={{
              padding: '18px 32px',
              backgroundColor: BRAND.surfaceDark,
              borderRadius: 22,
              border: `4px solid ${BRAND.coral}`,
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 58,
              color: BRAND.yellow,
            }}
          >
            ETA 03:30:{secStr}
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: BRAND.coral,
            color: '#ffffff',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 44,
            borderRadius: 18,
            boxShadow: `0 8px 0 ${BRAND.coralLip}`,
          }}
        >
          NEVER AGAIN.
        </div>
      </div>

      <LaserOverlay localFrame={localFrame} startFrame={6} />
    </div>
  );
};
