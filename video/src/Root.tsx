import React from 'react';
import { Composition } from 'remotion';
import { HypeShort } from './videos/hype/Hype';
import { VIDEO_CONFIG } from './videos/hype/brand';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HypeShort"
      component={HypeShort}
      durationInFrames={VIDEO_CONFIG.durationInFrames}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
      defaultProps={{ withAudio: false }}
    />
  );
};
