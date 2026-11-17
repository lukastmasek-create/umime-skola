import { intro } from './defs/intro';
import { home } from './defs/home';
import { courses } from './defs/courses';
import { lessons } from './defs/lessons';
import { multiplayer } from './defs/multiplayer';
import { hub } from './defs/hub';
import { farma, mesto, zakladna, ekonomika, tymy } from './defs/games';
import { teachers, finale } from './defs/teachers';
import type { SectionDef } from './types';

/** Master order. Every def with chainsToNext ends on the first frame of the def after it. */
export const DEFS: SectionDef[] = [intro, home, courses, lessons, multiplayer, hub, farma, mesto, zakladna, ekonomika, tymy, teachers, finale];
/** Numeric prefixes for output filenames. */
export const ORDER_ID = (id: string) => String(DEFS.findIndex((d) => d.id === id)).padStart(2, '0');
