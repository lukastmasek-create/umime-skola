import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { getActiveShot, STORY, StoryShot } from './story';
import { ThreeStage } from './components/ThreeStage';
import { KineticWord } from './components/KineticWord';
import { LogoReveal } from './components/LogoReveal';
import { BoringWayGag, QuestionMarks, StarburstBlob, TimerGag, Viewfinder } from './components/GraphicElements';
import { CTACard, FeatureBeatCard, HomeworkMock, NodeGraph, PlayerMockFilmStrip, PromptBox } from './components/UIMocks';
import { BRAND } from './brand';

const ShotOverlay: React.FC<{ shot: StoryShot; localFrame: number }> = ({ shot, localFrame }) => {
  switch (shot.scene) {
    case 'dot-burst':
      return (
        <>
          <Viewfinder label="UČÍME SE HROU // INIT" accentColor={BRAND.coral} />
          <KineticWord text={shot.text} bg={shot.bg} mode="tracking-in" localFrame={localFrame} dur={shot.dur} />
        </>
      );

    case 'kinetic-slam':
    case 'extrude-3d':
    case 'whisper-build':
      return (
        <>
          <Viewfinder
            label={shot.scene === 'extrude-3d' ? 'LEVEL UP // 3D ENGINE' : 'KINETIC // BEAT LOCK'}
            accentColor={shot.bg === 'yellow' || shot.bg === 'cream' ? BRAND.blue : BRAND.yellow}
          />
          <KineticWord
            text={shot.text}
            subtext={shot.subtext}
            bg={shot.bg}
            mode={shot.kineticMode ?? 'slam'}
            crop={shot.cropEdge}
            localFrame={localFrame}
            dur={shot.dur}
            shakeOnHit={shot.shakeOnHit}
          />
        </>
      );

    case 'homework-laser':
      return <HomeworkMock localFrame={localFrame} headline={shot.text} />;

    case 'question-marks':
      return <QuestionMarks text={shot.text} subtext={shot.subtext} localFrame={localFrame} />;

    case 'node-graph':
      return (
        <>
          <Viewfinder label="SYSTEM // NODE GRAPH" accentColor={BRAND.green} />
          <NodeGraph localFrame={localFrame} />
        </>
      );

    case 'logo-reveal-dark':
      return <LogoReveal theme="dark" localFrame={localFrame} headline="MEET UČÍME SE HROU" showUrlPill />;

    case 'logo-reveal-light':
      return <LogoReveal theme="light" localFrame={localFrame} headline={shot.text} showUrlPill />;

    case 'prompt-box':
      return (
        <>
          <Viewfinder label="QUEST // INTERACTIVE" accentColor={BRAND.coral} />
          <PromptBox localFrame={localFrame} />
        </>
      );

    case 'player-filmstrip':
      return <PlayerMockFilmStrip localFrame={localFrame} />;

    case 'feature-beat':
      return (
        <>
          <Viewfinder
            label={`FEATURE // ${shot.featureTag ?? 'GAME'}`}
            accentColor={shot.bg === 'yellow' || shot.bg === 'cream' ? BRAND.ink : BRAND.yellow}
          />
          <KineticWord
            text={shot.text}
            subtext={shot.subtext}
            bg={shot.bg}
            mode={shot.kineticMode ?? 'slam'}
            crop
            localFrame={localFrame}
            dur={shot.dur}
            shakeOnHit={shot.shakeOnHit}
          />
          <FeatureBeatCard shot={shot} localFrame={localFrame} />
        </>
      );

    case 'starburst-gag':
      return <StarburstBlob text={shot.text} localFrame={localFrame} />;

    case 'boring-way-gag':
      return <BoringWayGag localFrame={localFrame} />;

    case 'timer-gag':
      return <TimerGag localFrame={localFrame} />;

    case 'cta-yellow':
      return <CTACard localFrame={localFrame} />;

    case 'end-card':
      return <LogoReveal theme="dark" localFrame={localFrame} headline="LEARNING THAT FEELS LIKE A GAME." showUrlPill />;

    default:
      return null;
  }
};

export const HypeShort: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const { shot, localFrame, transitionProgress } = getActiveShot(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.indigo, overflow: 'hidden' }}>
      <ThreeStage shot={shot} localFrame={localFrame} transitionProgress={transitionProgress} />

      {STORY.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={`${s.id}: ${s.text}`}>
          <ShotOverlay shot={s} localFrame={frame - s.from} />
        </Sequence>
      ))}

      {withAudio && <Audio src={staticFile('audio/hype-master.wav')} />}
    </AbsoluteFill>
  );
};

export default HypeShort;
