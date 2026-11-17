import React from 'react';
import {Composition, Still} from 'remotion';
import {UIDebug} from './UIDebug';
import {Film} from './Film';
import {FPS, TOTAL} from './timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Still id="UIDebug" component={UIDebug} width={1620} height={2414} />
  </>
);
