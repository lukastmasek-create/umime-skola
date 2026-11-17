import { registerPage } from '../../core/ScreenContent';
import { FPS } from '../../config/sections';
import manifest from '../manifest.json';
import home from '../../../public/strips/home.json';
import kurzy from '../../../public/strips/kurzy.json';
import zakladni from '../../../public/strips/zakladni.json';
import kurs from '../../../public/strips/kurs.json';
import lekce from '../../../public/strips/lekce.json';
import multiplayer from '../../../public/strips/multiplayer.json';
import hry from '../../../public/strips/hry.json';
import ucitele from '../../../public/strips/ucitele.json';
[home, kurzy, zakladni, kurs, lekce, multiplayer, hry, ucitele].forEach((m) => registerPage(m as never));

export const s = (sec: number) => Math.round(sec * FPS);
/** Full-screen-fill shot used at every chained boundary (identical on both sides => seamless cut). */
export const FILL = { cx: 960, cy: 540, w: 1960, yaw: 0, pitch: 0 } as const;
/** `img:` layer id for a captured shot; falls back to `base` when the state image was not captured. */
export const shot = (name: string, base = name) => `img:shots/${(manifest as string[]).includes(name + '.webp') ? name : base}.webp`;
export const has = (name: string) => (manifest as string[]).includes(name + '.webp');
/** nav item centres on the real header (page px) */
export const NAV = { kurzy: [720, 28], info: [811, 28], obchod: [920, 28], ucivo: [1010, 28], menu: [1572 * 0.96, 28] } as const;
