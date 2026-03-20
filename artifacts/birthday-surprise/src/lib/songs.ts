export interface Song {
  title: string;
  artist: string;
  filename: string;
}

export const SONGS: Song[] = [
  { title: 'Those Eyes',        artist: 'New West',        filename: '/music/n01.mp3' },
  { title: 'The Night We Met',  artist: 'Lord Huron',      filename: '/music/n02.mp3' },
  { title: 'Until I Found You', artist: 'Stephen Sanchez', filename: '/music/n03.mp3' },
  { title: 'Blue',              artist: 'Yung Kai',        filename: '/music/n04.mp3' },
  { title: 'I Wanna Be Yours',  artist: 'Arctic Monkeys',  filename: '/music/n05.mp3' },
  { title: 'Dandelions',        artist: 'Ruth B.',         filename: '/music/n06.mp3' },
  { title: 'Ordinary',          artist: '',                filename: '/music/n07.mp3' },
];

const KEY_USED = 'bday_songsUsedPermanent';

/**
 * Picks a fresh random song on every call.
 * Strict no-repeat: once a song is picked it is never picked again
 * until all songs have been played (full cycle), then resets.
 *
 * MusicPlayer stores the result in useState so it stays stable
 * within a single session but refreshes on every page reload.
 */
export function getDailySong(): Song {
  const usedRaw = localStorage.getItem(KEY_USED);
  let used: number[] = usedRaw ? JSON.parse(usedRaw) : [];

  // Full cycle complete — reset so songs can be heard again
  if (used.length >= SONGS.length) used = [];

  const available = SONGS.map((_, i) => i).filter(i => !used.includes(i));
  const pool = available.length > 0 ? available : SONGS.map((_, i) => i);

  const pick = pool[Math.floor(Math.random() * pool.length)];

  used.push(pick);
  localStorage.setItem(KEY_USED, JSON.stringify(used));

  return SONGS[pick];
}
