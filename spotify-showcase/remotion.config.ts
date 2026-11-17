import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
// Optional override: REMOTION_BROWSER=/path/to/chrome. Otherwise Remotion downloads its own.
const b = process.env.REMOTION_BROWSER;
if (b && fs.existsSync(b)) Config.setBrowserExecutable(b);
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
