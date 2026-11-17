import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);
