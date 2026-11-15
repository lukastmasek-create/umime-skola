import { BrandBgKey } from './brand';
import { KineticMode } from './components/KineticWord';

export type TransitionType =
  | 'hard'
  | 'whip'
  | 'zoom'
  | 'stripes'
  | 'glitch'
  | 'flash'
  | 'laser'
  | 'shape';

export type SceneKind =
  | 'dot-burst'
  | 'kinetic-slam'
  | 'extrude-3d'
  | 'homework-laser'
  | 'question-marks'
  | 'node-graph'
  | 'whisper-build'
  | 'logo-reveal-dark'
  | 'logo-reveal-light'
  | 'prompt-box'
  | 'player-filmstrip'
  | 'feature-beat'
  | 'starburst-gag'
  | 'boring-way-gag'
  | 'timer-gag'
  | 'cta-yellow'
  | 'end-card';

export interface StoryShot {
  id: string;
  from: number;
  dur: number;
  scene: SceneKind;
  text: string;
  subtext?: string;
  bg: BrandBgKey;
  kineticMode?: KineticMode;
  transitionIn: TransitionType;
  transitionFrames: number;
  featureTag?: 'QUIZZES' | 'PETS' | 'CODE' | '3D TOWN' | 'AVATARS' | 'SHOP' | 'TEACHERS' | '8 LANGUAGES';
  cropEdge?: boolean;
  shakeOnHit?: boolean;
}

export const STORY: StoryShot[] = [
  { id: 'shot-01-burst', from: 0, dur: 18, scene: 'dot-burst', text: 'READY.', bg: 'indigo', kineticMode: 'tracking-in', transitionIn: 'hard', transitionFrames: 0 },
  { id: 'shot-02-noway', from: 18, dur: 27, scene: 'kinetic-slam', text: 'NO WAY.', subtext: 'FORGET EVERYTHING YOU KNEW', bg: 'cream', kineticMode: 'slam', transitionIn: 'shape', transitionFrames: 6, cropEdge: true, shakeOnHit: true },
  { id: 'shot-03-homework', from: 45, dur: 21, scene: 'kinetic-slam', text: 'HOMEWORK?', bg: 'blue', kineticMode: 'stretch', transitionIn: 'whip', transitionFrames: 6, cropEdge: true },
  { id: 'shot-04-dead', from: 66, dur: 21, scene: 'kinetic-slam', text: 'DEAD.', bg: 'coral', kineticMode: 'slam', transitionIn: 'flash', transitionFrames: 3, cropEdge: true, shakeOnHit: true },
  { id: 'shot-05-boring', from: 87, dur: 21, scene: 'kinetic-slam', text: 'BORING?', bg: 'indigo', kineticMode: 'outline-echo', transitionIn: 'glitch', transitionFrames: 6 },
  { id: 'shot-06-gone', from: 108, dur: 24, scene: 'kinetic-slam', text: 'GONE.', bg: 'yellow', kineticMode: 'slam', transitionIn: 'whip', transitionFrames: 6, cropEdge: true, shakeOnHit: true },
  { id: 'shot-07-worksheets', from: 132, dur: 42, scene: 'kinetic-slam', text: 'WORKSHEETS?', subtext: 'STILL STARING AT GREY PAPER?', bg: 'cream', kineticMode: 'scramble', transitionIn: 'stripes', transitionFrames: 8 },
  { id: 'shot-08-stop', from: 174, dur: 18, scene: 'kinetic-slam', text: 'STOP.', bg: 'coral', kineticMode: 'slam', transitionIn: 'hard', transitionFrames: 0, shakeOnHit: true },
  { id: 'shot-09-breathe', from: 192, dur: 21, scene: 'kinetic-slam', text: 'BREATHE.', bg: 'blue', kineticMode: 'tracking-in', transitionIn: 'hard', transitionFrames: 0 },
  { id: 'shot-10-watchthis-3d', from: 213, dur: 27, scene: 'extrude-3d', text: 'WATCH THIS.', bg: 'indigo', kineticMode: 'extrude', transitionIn: 'zoom', transitionFrames: 8, shakeOnHit: true },
  { id: 'shot-11-homework-mock', from: 240, dur: 66, scene: 'homework-laser', text: 'STUDY. STUDY. STUDY.', subtext: 'WORKSHEET #402 • MEMORIZE CHAPTER 7', bg: 'indigo', transitionIn: 'whip', transitionFrames: 7 },
  { id: 'shot-12-slice-it', from: 306, dur: 42, scene: 'homework-laser', text: 'SLICE IT. ERASE IT.', subtext: 'OLD WAY TERMINATED', bg: 'coral', kineticMode: 'slam', transitionIn: 'laser', transitionFrames: 8, shakeOnHit: true },
  { id: 'shot-13-before-you-ask', from: 348, dur: 72, scene: 'question-marks', text: 'AND BEFORE YOU ASK ?', subtext: 'WHAT TAKES ITS PLACE?', bg: 'cream', kineticMode: 'slam', transitionIn: 'whip', transitionFrames: 8 },
  { id: 'shot-14-node-graph', from: 420, dur: 84, scene: 'node-graph', text: 'EVERYTHING CONNECTS.', subtext: 'KID -> GAME -> LESSON', bg: 'indigo', transitionIn: 'zoom', transitionFrames: 8 },
  { id: 'shot-15-whisper', from: 504, dur: 54, scene: 'whisper-build', text: '...AND THEN EVERYTHING CHANGES.', bg: 'deepIndigo', kineticMode: 'tracking-in', transitionIn: 'glitch', transitionFrames: 6 },
  { id: 'shot-16-logo-dark', from: 558, dur: 90, scene: 'logo-reveal-dark', text: 'učíme se hrou', subtext: 'ucimesehrou.org', bg: 'indigo', transitionIn: 'flash', transitionFrames: 4, shakeOnHit: true },
  { id: 'shot-17-logo-light', from: 648, dur: 72, scene: 'logo-reveal-light', text: 'LEARNING THAT FEELS LIKE A GAME.', subtext: 'učíme se hrou • ucimesehrou.org', bg: 'cream', kineticMode: 'slam', transitionIn: 'shape', transitionFrames: 8 },
  { id: 'shot-18-just-play', from: 720, dur: 66, scene: 'kinetic-slam', text: 'YOU JUST PLAY.', subtext: 'NO BORING LECTURES', bg: 'blue', kineticMode: 'outline-echo', transitionIn: 'whip', transitionFrames: 7, cropEdge: true },
  { id: 'shot-19-prompt-box', from: 786, dur: 108, scene: 'prompt-box', text: 'PICK A QUEST. TYPE YOUR ANSWER.', subtext: 'BOOM — COINS UNLOCKED.', bg: 'indigo', transitionIn: 'stripes', transitionFrames: 8 },
  { id: 'shot-20-player-filmstrip', from: 894, dur: 126, scene: 'player-filmstrip', text: 'JUMP INTO THE WORLD.', subtext: 'REAL GAMES • REAL LESSONS', bg: 'cream', transitionIn: 'zoom', transitionFrames: 8 },
  { id: 'shot-21-quizzes', from: 1020, dur: 24, scene: 'feature-beat', text: 'QUIZZES.', subtext: 'FAST CHALLENGES & INSTANT XP', bg: 'blue', featureTag: 'QUIZZES', kineticMode: 'slam', transitionIn: 'hard', transitionFrames: 0, shakeOnHit: true },
  { id: 'shot-22-pets', from: 1044, dur: 24, scene: 'feature-beat', text: 'PETS.', subtext: 'FEED, TRAIN & COLLECT COMPANIONS', bg: 'coral', featureTag: 'PETS', kineticMode: 'slam', transitionIn: 'whip', transitionFrames: 5, shakeOnHit: true },
  { id: 'shot-23-code', from: 1068, dur: 24, scene: 'feature-beat', text: 'CODE.', subtext: 'INTERACTIVE CODING MISSIONS', bg: 'indigo', featureTag: 'CODE', kineticMode: 'scramble', transitionIn: 'glitch', transitionFrames: 5 },
  { id: 'shot-24-town', from: 1092, dur: 27, scene: 'feature-beat', text: '3D TOWN.', subtext: 'EXPLORE MĚSTEČKO IN 3D', bg: 'green', featureTag: '3D TOWN', kineticMode: 'extrude', transitionIn: 'zoom', transitionFrames: 6, shakeOnHit: true },
  { id: 'shot-25-avatars', from: 1119, dur: 24, scene: 'feature-beat', text: 'AVATARS.', subtext: 'CUSTOMIZE YOUR 3D HERO', bg: 'yellow', featureTag: 'AVATARS', kineticMode: 'stretch', transitionIn: 'hard', transitionFrames: 0 },
  { id: 'shot-26-shop', from: 1143, dur: 24, scene: 'feature-beat', text: 'SHOP.', subtext: 'UNLOCK GEAR WITH EARNED COINS', bg: 'cream', featureTag: 'SHOP', kineticMode: 'slam', transitionIn: 'stripes', transitionFrames: 5 },
  { id: 'shot-27-teachers', from: 1167, dur: 24, scene: 'feature-beat', text: 'TEACHERS.', subtext: 'CLASSROOMS & QUEST ASSIGNMENTS', bg: 'blue', featureTag: 'TEACHERS', kineticMode: 'outline-echo', transitionIn: 'hard', transitionFrames: 0 },
  { id: 'shot-28-languages', from: 1191, dur: 24, scene: 'feature-beat', text: '8 LANGUAGES.', subtext: 'CS • EN • DE • ES • FR • PL • SK • UK', bg: 'indigo', featureTag: '8 LANGUAGES', kineticMode: 'slam', transitionIn: 'flash', transitionFrames: 3 },
  { id: 'shot-29-kidding-me', from: 1215, dur: 30, scene: 'starburst-gag', text: 'ARE YOU ... KIDDING ME?', bg: 'cream', kineticMode: 'slam', transitionIn: 'shape', transitionFrames: 6, shakeOnHit: true },
  { id: 'shot-30-boring-way', from: 1245, dur: 33, scene: 'boring-way-gag', text: 'THINK ABOUT HOMEWORK', subtext: 'the boring way', bg: 'indigo', transitionIn: 'glitch', transitionFrames: 5 },
  { id: 'shot-31-timer-gag', from: 1278, dur: 36, scene: 'timer-gag', text: 'HOMEWORK', subtext: 'ETA 03:30:10 — NEVER AGAIN.', bg: 'coral', transitionIn: 'laser', transitionFrames: 6, shakeOnHit: true },
  { id: 'shot-32-level-up', from: 1314, dur: 27, scene: 'extrude-3d', text: 'LEVEL UP.', subtext: 'ALL YOURS.', bg: 'blue', kineticMode: 'extrude', transitionIn: 'zoom', transitionFrames: 6, shakeOnHit: true },
  { id: 'shot-33-cta-yellow', from: 1341, dur: 51, scene: 'cta-yellow', text: 'PLAY FREE AT ucimesehrou.org', subtext: 'NO DOWNLOADS • START IN SECONDS', bg: 'yellow', kineticMode: 'slam', transitionIn: 'whip', transitionFrames: 6 },
  { id: 'shot-34-end-card', from: 1392, dur: 48, scene: 'end-card', text: 'učíme se hrou', subtext: 'ucimesehrou.org', bg: 'indigo', transitionIn: 'shape', transitionFrames: 8 },
];

export function getActiveShot(frame: number): {
  shot: StoryShot;
  shotIndex: number;
  localFrame: number;
  transitionProgress: number;
} {
  for (let i = STORY.length - 1; i >= 0; i--) {
    const s = STORY[i];
    if (frame >= s.from) {
      const localFrame = frame - s.from;
      const tFrames = Math.max(1, s.transitionFrames);
      const transitionProgress =
        s.transitionFrames > 0 && localFrame < s.transitionFrames ? 1 - localFrame / tFrames : 0;
      return { shot: s, shotIndex: i, localFrame, transitionProgress };
    }
  }
  return { shot: STORY[0], shotIndex: 0, localFrame: 0, transitionProgress: 0 };
}
