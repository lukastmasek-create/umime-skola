import React from 'react';
import { Easing, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS, TILE_SEQUENCE } from '../brand';
import { LaserOverlay } from './GraphicElements';
import { StoryShot } from '../story';

export const HomeworkMock: React.FC<{ localFrame: number; headline: string }> = ({ localFrame, headline }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 12, stiffness: 210 } });

  const rows = [
    '1. Read 42 pages of dense grammar notes',
    '2. Fill out Worksheet #402 (No hints)',
    '3. Copy vocabulary table 25 times',
    '4. Memorize dates for Friday test',
  ];

  const cursorX = interpolate(localFrame, [0, 35], [680, 225], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp' });
  const cursorY = interpolate(localFrame, [0, 35], [1220, 790], { easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 56px',
      }}
    >
      <div
        style={{
          marginBottom: 32,
          padding: '16px 32px',
          backgroundColor: BRAND.coral,
          color: '#ffffff',
          fontFamily: FONTS.display,
          fontWeight: 800,
          fontSize: 52,
          borderRadius: 24,
          boxShadow: `0 10px 0 ${BRAND.coralLip}`,
          textAlign: 'center',
          transform: `scale(${pop})`,
        }}
      >
        {headline}
      </div>

      <div
        style={{
          width: '100%',
          padding: '44px 40px',
          backgroundColor: BRAND.cream,
          border: `6px solid ${BRAND.ink}`,
          borderRadius: 32,
          boxShadow: `0 18px 0 ${BRAND.ink}`,
          transform: `scale(${pop})`,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: `4px solid ${BRAND.borderLight}`,
            paddingBottom: 18,
            marginBottom: 24,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 26,
            color: BRAND.muted,
          }}
        >
          <span>WORKSHEET_402.PDF</span>
          <span>TIME REMAINING: 03:30:00</span>
        </div>

        {rows.map((r, i) => {
          const checked = localFrame > 10 + i * 7;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '20px 18px',
                marginBottom: 16,
                backgroundColor: '#ffffff',
                border: `3px solid ${BRAND.borderLight}`,
                borderRadius: 18,
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: 32,
                color: BRAND.ink,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 10,
                  border: `4px solid ${BRAND.ink}`,
                  backgroundColor: checked ? BRAND.muted : '#ffffff',
                }}
              />
              <span style={{ textDecoration: checked ? 'line-through' : 'none' }}>{r}</span>
            </div>
          );
        })}
      </div>

      <svg
        width={68}
        height={68}
        viewBox="0 0 48 48"
        style={{ position: 'absolute', left: cursorX, top: cursorY, zIndex: 12, filter: 'drop-shadow(0 6px 0 #16132b)' }}
      >
        <path d="M8 4 L40 22 L25 26 L32 42 L24 45 L17 29 L8 38 Z" fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth="3.5" />
      </svg>

      <LaserOverlay localFrame={localFrame} startFrame={16} />
    </div>
  );
};

export const NodeGraph: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  const chains = [
    {
      title: 'CORE LOOP',
      nodes: [
        { label: 'KID', sub: '3D AVATAR', color: BRAND.blue, lip: BRAND.blueLip },
        { label: 'GAME', sub: 'QUESTS', color: BRAND.coral, lip: BRAND.coralLip },
        { label: 'LESSON', sub: 'MASTERY', color: BRAND.green, lip: BRAND.greenLip },
      ],
    },
    {
      title: 'REWARD ENGINE',
      nodes: [
        { label: 'QUIZ', sub: '+COINS', color: BRAND.yellow, lip: BRAND.yellowLip },
        { label: 'PET', sub: 'COMPANION', color: BRAND.blue, lip: BRAND.blueLip },
        { label: 'SHOP', sub: 'GEAR UNLOCK', color: BRAND.coral, lip: BRAND.coralLip },
      ],
    },
  ];

  const pulseProgress = (localFrame % 30) / 30;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        gap: 54,
      }}
    >
      <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 68, color: BRAND.textLight, textAlign: 'center', textShadow: '0 8px 0 #070514' }}>
        EVERYTHING <span style={{ color: BRAND.coral }}>CONNECTS.</span>
      </div>

      {chains.map((chain, cIdx) => (
        <div
          key={chain.title}
          style={{
            width: '100%',
            padding: '38px 32px',
            backgroundColor: BRAND.surfaceDark,
            borderRadius: 32,
            border: `4px solid ${BRAND.borderDark}`,
            boxShadow: '0 14px 0 #070514',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 20px',
              backgroundColor: BRAND.indigo,
              color: BRAND.yellow,
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 22,
              borderRadius: 999,
              border: `2px solid ${BRAND.yellow}`,
              marginBottom: 28,
            }}
          >
            {chain.title}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', left: 90, right: 90, height: 12, backgroundColor: BRAND.borderDark, borderRadius: 999, zIndex: 0 }}>
              <div
                style={{
                  position: 'absolute',
                  left: `${pulseProgress * 88}%`,
                  top: -6,
                  width: 48,
                  height: 24,
                  borderRadius: 999,
                  backgroundColor: BRAND.yellow,
                  boxShadow: `0 0 24px ${BRAND.yellow}`,
                }}
              />
            </div>

            {chain.nodes.map((node, nIdx) => {
              const s = spring({ fps, frame: Math.max(0, localFrame - (cIdx * 8 + nIdx * 5)), config: { damping: 11, stiffness: 220 } });
              const isDarkText = node.color === BRAND.yellow;
              return (
                <div
                  key={node.label}
                  style={{
                    zIndex: 2,
                    width: 260,
                    padding: '28px 18px',
                    backgroundColor: node.color,
                    borderRadius: 28,
                    boxShadow: `0 12px 0 ${node.lip}`,
                    textAlign: 'center',
                    transform: `scale(${s})`,
                  }}
                >
                  <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 40, color: isDarkText ? BRAND.ink : '#ffffff' }}>
                    {node.label}
                  </div>
                  <div style={{ marginTop: 8, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: isDarkText ? BRAND.ink : '#ffffff', opacity: 0.9 }}>
                    {node.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PromptBox: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 12, stiffness: 210 } });

  const fullPrompt = 'Solve the fraction quest & feed your dragon pet!';
  const typedChars = Math.min(fullPrompt.length, Math.floor(localFrame * 1.4));
  const typedText = fullPrompt.slice(0, typedChars);
  const cursorVisible = Math.floor(localFrame / 6) % 2 === 0;
  const enterPressed = localFrame > 46;

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
          padding: '48px 44px',
          background: BRAND.promptGradient,
          borderRadius: 40,
          border: `5px solid #ffffff`,
          boxShadow: `0 20px 0 ${BRAND.blueLip}`,
          transform: `scale(${pop})`,
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          {['QUIZ QUEST', 'CODE LESSON', '+150 COINS'].map((chip, idx) => (
            <span
              key={chip}
              style={{
                padding: '10px 22px',
                backgroundColor: idx === 2 ? BRAND.yellow : BRAND.coral,
                color: idx === 2 ? BRAND.ink : '#ffffff',
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 24,
                borderRadius: 16,
                boxShadow: `0 6px 0 ${idx === 2 ? BRAND.yellowLip : BRAND.coralLip}`,
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <div
          style={{
            padding: '32px 28px',
            backgroundColor: BRAND.indigo,
            borderRadius: 26,
            border: `3px solid ${BRAND.brandGlow}`,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 38,
            lineHeight: 1.35,
            minHeight: 150,
          }}
        >
          <span style={{ color: BRAND.yellow }}>&gt; </span>
          {typedText}
          {cursorVisible && (
            <span style={{ display: 'inline-block', width: 18, height: 38, backgroundColor: BRAND.coral, marginLeft: 6, verticalAlign: 'middle' }} />
          )}
        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 30 }}>
            {enterPressed ? 'QUEST COMPLETED!' : 'TYPE YOUR ANSWER...'}
          </div>

          <div
            style={{
              padding: '18px 38px',
              backgroundColor: enterPressed ? BRAND.green : BRAND.yellow,
              color: enterPressed ? '#ffffff' : BRAND.ink,
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: 32,
              borderRadius: 22,
              boxShadow: enterPressed ? `0 4px 0 ${BRAND.greenLip}` : `0 10px 0 ${BRAND.yellowLip}`,
              transform: enterPressed ? 'translateY(6px)' : 'translateY(0px)',
            }}
          >
            {enterPressed ? 'UNLOCKED ✓' : 'ENTER ↵'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlayerMockFilmStrip: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 12, stiffness: 200 } });

  const phase = interpolate(localFrame, [10, 45, 85], [0, 1, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const stripCards = [
    { title: '3D MĚSTEČKO', badge: 'TOWN EXPLORER', color: BRAND.blue, lip: BRAND.blueLip },
    { title: 'PET SANCTUARY', badge: 'CARE & EVOLVE', color: BRAND.coral, lip: BRAND.coralLip },
    { title: 'CODE LAB', badge: 'LOGIC BLOCKS', color: BRAND.green, lip: BRAND.greenLip },
    { title: 'REWARD SHOP', badge: 'EARNED COINS', color: BRAND.yellow, lip: BRAND.yellowLip },
    { title: 'AVATAR STUDIO', badge: '3D OUTFITS', color: BRAND.violet, lip: BRAND.blueLip },
  ];

  const scrollY = -localFrame * 5.5;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        gap: 36,
      }}
    >
      <div
        style={{
          flex: 1.15,
          padding: '44px 36px',
          backgroundColor: BRAND.indigo,
          borderRadius: 38,
          border: `6px solid ${BRAND.ink}`,
          boxShadow: `0 18px 0 ${BRAND.ink}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${pop})`,
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, color: BRAND.yellow, marginBottom: 24 }}>
          {phase < 0.8 ? '01 / PRESS PLAY' : phase < 1.6 ? '02 / EARN REWARDS' : '03 / UČÍME SE HROU'}
        </div>

        <svg width={260} height={260} viewBox="0 0 200 200">
          {phase < 1 ? (
            <polygon
              points={`
                ${interpolate(phase, [0, 1], [55, 100])},${interpolate(phase, [0, 1], [35, 20])}
                ${interpolate(phase, [0, 1], [165, 180])},100
                ${interpolate(phase, [0, 1], [55, 100])},${interpolate(phase, [0, 1], [165, 180])}
                ${interpolate(phase, [0, 1], [55, 20])},100
              `}
              fill={phase < 0.5 ? BRAND.coral : BRAND.yellow}
              stroke="#ffffff"
              strokeWidth="8"
              strokeLinejoin="round"
            />
          ) : (
            <g transform={`rotate(${interpolate(phase, [1, 2], [45, 0])} 100 100)`}>
              <rect x="30" y="38" width="140" height="140" rx={interpolate(phase, [1, 2], [16, 42])} fill={BRAND.blueLip} />
              <rect x="30" y="26" width="140" height="140" rx={interpolate(phase, [1, 2], [16, 42])} fill={BRAND.blue} />
              <circle cx="76" cy="78" r="10" fill="#ffffff" opacity={interpolate(phase, [1.2, 2], [0, 1], { extrapolateLeft: 'clamp' })} />
              <circle cx="124" cy="78" r="10" fill="#ffffff" opacity={interpolate(phase, [1.2, 2], [0, 1], { extrapolateLeft: 'clamp' })} />
              <path
                d="M 70 112 Q 100 138 130 112"
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
                opacity={interpolate(phase, [1.3, 2], [0, 1], { extrapolateLeft: 'clamp' })}
              />
            </g>
          )}
        </svg>

        <div style={{ marginTop: 28, fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: '#ffffff', textAlign: 'center' }}>
          JUMP INTO THE WORLD.
        </div>
      </div>

      <div
        style={{
          flex: 0.95,
          height: 1380,
          overflow: 'hidden',
          borderRadius: 32,
          border: `6px solid ${BRAND.ink}`,
          backgroundColor: BRAND.ink,
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, transform: `translateY(${scrollY % 760}px)` }}>
          {[...stripCards, ...stripCards].map((c, idx) => {
            const isLight = c.color === BRAND.yellow;
            return (
              <div
                key={idx}
                style={{
                  padding: '32px 24px',
                  backgroundColor: c.color,
                  borderRadius: 24,
                  boxShadow: `0 10px 0 ${c.lip}`,
                  color: isLight ? BRAND.ink : '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    backgroundColor: 'rgba(0,0,0,0.22)',
                    borderRadius: 10,
                    fontFamily: FONTS.mono,
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 12,
                  }}
                >
                  {c.badge}
                </div>
                <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 34 }}>{c.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const FeatureBeatCard: React.FC<{ shot: StoryShot; localFrame: number }> = ({ shot, localFrame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 11, stiffness: 240 } });
  const tag = shot.featureTag ?? 'QUIZZES';

  return (
    <div style={{ position: 'absolute', left: 64, right: 64, bottom: 180, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      {tag === 'CODE' ? (
        <div
          style={{
            width: '100%',
            padding: '28px 34px',
            backgroundColor: BRAND.surfaceDark,
            borderRadius: 28,
            border: `4px solid ${BRAND.coral}`,
            boxShadow: `0 12px 0 #070514`,
            fontFamily: FONTS.mono,
            fontSize: 28,
            color: BRAND.textLight,
            transform: `scale(${pop})`,
          }}
        >
          <div>
            <span style={{ color: BRAND.coral }}>function</span> <span style={{ color: BRAND.yellow }}>levelUpHero</span>(player) &#123;
          </div>
          <div style={{ paddingLeft: 28, marginTop: 8 }}>
            player.addCoins(
            <span style={{ backgroundColor: BRAND.coral, color: '#ffffff', padding: '2px 12px', borderRadius: 8 }}>100</span>);
          </div>
          <div style={{ marginTop: 8 }}>&#125;</div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, transform: `scale(${pop})` }}>
          {TILE_SEQUENCE.map((t) => (
            <div
              key={t.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: t.fill,
                boxShadow: `0 6px 0 ${t.lip}`,
                border: '3px solid #ffffff',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CTACard: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ fps, frame: localFrame, config: { damping: 11, stiffness: 220 } });
  const btnPress = localFrame > 24 ? 1 : 0;

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
          padding: '64px 48px',
          backgroundColor: BRAND.cream,
          borderRadius: 44,
          border: `8px solid ${BRAND.ink}`,
          boxShadow: `0 22px 0 ${BRAND.ink}`,
          textAlign: 'center',
          transform: `scale(${pop})`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            backgroundColor: BRAND.coral,
            color: '#ffffff',
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 28,
            borderRadius: 999,
            boxShadow: `0 6px 0 ${BRAND.coralLip}`,
            marginBottom: 28,
          }}
        >
          100% FREE TO PLAY • 8 LANGUAGES
        </div>

        <div style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: 82, lineHeight: 0.98, color: BRAND.ink }}>
          PLAY FREE AT
        </div>

        <div
          style={{
            marginTop: 36,
            padding: '28px 40px',
            backgroundColor: BRAND.blue,
            color: '#ffffff',
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 54,
            borderRadius: 28,
            boxShadow: btnPress ? `0 4px 0 ${BRAND.blueLip}` : `0 14px 0 ${BRAND.blueLip}`,
            transform: btnPress ? 'translateY(10px)' : 'translateY(0px)',
          }}
        >
          ucimesehrou.org
        </div>
      </div>
    </div>
  );
};
