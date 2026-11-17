import { AbsoluteFill, Sequence } from 'remotion';
import { Film } from './film/Film';
import { DEFS } from './film/registry';

/** Sections whose last frame equals the next section's first frame are trimmed by 1 frame (no duplicated frame). */
export const masterLayout = () => {
  let at = 0;
  return DEFS.map((d, i) => {
    const dur = d.frames - (d.chainsToNext && i < DEFS.length - 1 ? 1 : 0);
    const row = { def: d, from: at, dur };
    at += dur;
    return row;
  });
};
export const MASTER_FRAMES = masterLayout().reduce((a, r) => a + r.dur, 0);

export const MasterFilm: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {masterLayout().map((r) => (
      <Sequence key={r.def.id} from={r.from} durationInFrames={r.dur} name={r.def.id}>
        <Film def={r.def} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
