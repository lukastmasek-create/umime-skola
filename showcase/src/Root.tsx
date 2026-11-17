import { Composition, Still } from 'remotion';
import { HeroStill } from './sections/Hero';
import { Film } from './film/Film';
import { DEFS } from './film/registry';
import { MasterFilm, MASTER_FRAMES } from './MasterFilm';
import { FPS } from './config/sections';

export const Root: React.FC = () => (
  <>
    <Still id="hero-16x9" component={HeroStill} width={1920} height={1080} />
    <Still id="hero-9x16" component={HeroStill} width={1080} height={1920} />
    {DEFS.flatMap((d) => [
      <Composition key={d.id + 'h'} id={`${d.id}-16x9`} component={Film} defaultProps={{ def: d }} durationInFrames={d.frames} fps={FPS} width={1920} height={1080} />,
      <Composition key={d.id + 'v'} id={`${d.id}-9x16`} component={Film} defaultProps={{ def: d }} durationInFrames={d.frames} fps={FPS} width={1080} height={1920} />,
    ])}
    <Composition id="master-16x9" component={MasterFilm} durationInFrames={MASTER_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="master-9x16" component={MasterFilm} durationInFrames={MASTER_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
