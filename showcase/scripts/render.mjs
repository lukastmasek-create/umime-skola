#!/usr/bin/env node
// Usage: node scripts/render.mjs <id|all|master> [--vertical|--both] [--preview] [--gl=angle]
//   id: intro home courses lessons multiplayer hub farma mesto zakladna economy teams teachers finale master
//   --preview : half resolution, every 2nd frame (30fps look), output to previews/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const IDS = ['intro', 'home', 'courses', 'lessons', 'multiplayer', 'hub', 'farma', 'mesto', 'zakladna', 'economy', 'teams', 'teachers', 'finale'];
const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--')) ?? 'all';
const preview = args.includes('--preview');
const both = args.includes('--both');
const vertical = args.includes('--vertical');
const gl = (args.find((a) => a.startsWith('--gl=')) ?? '--gl=angle');
const extra = args.filter((a) => a.startsWith('--') && !['--vertical', '--both', '--preview'].includes(a) && !a.startsWith('--gl='));
const formats = both ? ['16x9', '9x16'] : [vertical ? '9x16' : '16x9'];
const list = target === 'all' ? [...IDS, 'master'] : [target];
fs.mkdirSync(preview ? 'previews' : 'renders', { recursive: true });
let failed = 0;
for (const id of list) {
  for (const fmt of formats) {
    const n = id === 'master' ? 'master-showcase' : `${String(IDS.indexOf(id)).padStart(2, '0')}-${id}`;
    const out = `${preview ? 'previews' : 'renders'}/${n}-${fmt}${preview ? '-preview' : ''}.mp4`;
    const cmd = ['remotion', 'render', 'src/index.ts', `${id}-${fmt}`, out, gl, '--codec=h264', '--crf=16', '--pixel-format=yuv420p', ...(preview ? ['--scale=0.5', '--every-nth-frame=2'] : []), ...extra];
    console.log('\n>> npx ' + cmd.join(' '));
    const r = spawnSync('npx', cmd, { stdio: 'inherit' });
    if (r.status !== 0) { failed++; console.error('FAILED', id, fmt); }
  }
}
process.exit(failed ? 1 : 0);
