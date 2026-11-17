#!/usr/bin/env node
// ffprobe every MP4 in renders/ (or previews/) and check codec, size, fps, duration against expectations.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const dir = process.argv[2] ?? 'renders';
let bad = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort()) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_read_frames,duration', '-of', 'json', `${dir}/${f}`], { encoding: 'utf8' });
  try {
    const s = JSON.parse(r.stdout).streams[0];
    const vertical = f.includes('9x16');
    const okSize = vertical ? s.width === 1080 && s.height === 1920 : s.width === 1920 && s.height === 1080;
    const okFps = s.r_frame_rate === '60/1';
    const ok = s.codec_name === 'h264' && okSize && okFps;
    if (!ok) bad++;
    console.log(ok ? 'OK ' : 'BAD', f, `${s.width}x${s.height}`, s.r_frame_rate, `${s.nb_read_frames}f`, `${Number(s.duration).toFixed(2)}s`);
  } catch { bad++; console.log('BAD', f, 'unreadable'); }
}
process.exit(bad ? 1 : 0);
