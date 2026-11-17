import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(240000);
