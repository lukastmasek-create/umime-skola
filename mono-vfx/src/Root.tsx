import React from 'react';
import {Composition, Folder} from 'remotion';
import {EFFECTS, FORMATS, FPS} from './registry';

export const Root: React.FC = () => (
  <>
    {EFFECTS.map((e) => (
      <Folder key={e.id} name={e.family}>
        {(Object.keys(FORMATS) as (keyof typeof FORMATS)[]).map((o) => (
          <Composition
            key={e.id + o}
            id={e.id + FORMATS[o].suffix}
            component={e.component as React.FC<any>}
            durationInFrames={Math.round(e.seconds * FPS)}
            fps={FPS}
            width={FORMATS[o].width}
            height={FORMATS[o].height}
            defaultProps={{quality: 'high', orientation: o}}
          />
        ))}
      </Folder>
    ))}
  </>
);
