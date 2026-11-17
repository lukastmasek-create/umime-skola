export type Hero = {key: 'weeknd' | 'daft' | 'billie' | 'travis'; artist: string; track: string; album: string; accent: string; light: string; dur: string};
export const HEROES: Record<Hero['key'], Hero> = {
  weeknd: {key: 'weeknd', artist: 'The Weeknd', track: 'Blinding Lights', album: 'After Hours', accent: '#d0102a', light: '#ff2a3d', dur: '3:20'},
  daft: {key: 'daft', artist: 'Daft Punk', track: 'Get Lucky', album: 'Random Access Memories', accent: '#d9a441', light: '#ffc86b', dur: '4:08'},
  billie: {key: 'billie', artist: 'Billie Eilish', track: 'BIRDS OF A FEATHER', album: 'HIT ME HARD AND SOFT', accent: '#3b79d6', light: '#6fa8ff', dur: '3:30'},
  travis: {key: 'travis', artist: 'Travis Scott', track: 'FE!N', album: 'UTOPIA', accent: '#8a6a52', light: '#d29a6a', dur: '3:11'},
};
export type Playlist = {key: string; name: string; desc: string; meta: string};
export const PLAYLISTS: Playlist[] = [
  {key: 'top', name: "Today's Top Hits", desc: 'The biggest songs on the planet right now.', meta: '35.2M likes'},
  {key: 'rap', name: 'RapCaviar', desc: 'New music from Travis Scott, Future and more.', meta: '16.4M likes'},
  {key: 'discover', name: 'Discover Weekly', desc: 'Your weekly mixtape of fresh music.', meta: 'Made for you'},
  {key: 'radar', name: 'Release Radar', desc: 'Catch all the latest music from artists you follow.', meta: 'Made for you'},
  {key: 'mint', name: 'mint', desc: 'The best new dance & electronic music.', meta: '4.1M likes'},
];
export const GREEN = '#1DB954', BLACK = '#030504', FOREST = '#08130C', GRAPHITE = '#171C19', WHITE = '#F5F7F5';
