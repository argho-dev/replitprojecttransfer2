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

const KEY_DATE    = 'bday_songDate';
const KEY_IDX     = 'bday_songIdx';
const KEY_HISTORY = 'bday_songHistory';
const KEY_USED    = 'bday_songsUsedPermanent';

/**
 * Returns the song for today.
 * - Stable within a day (same song all day).
 * - Strict no-repeat: a song is never played again until all songs
 *   have been played once (full cycle), then it resets.
 */
export function getDailySong(): Song {
  const now    = new Date();
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  // Return today's song if already chosen (stable within a day)
  const storedDate = localStorage.getItem(KEY_DATE);
  const storedIdx  = localStorage.getItem(KEY_IDX);
  if (storedDate === dayKey && storedIdx !== null) {
    const idx = parseInt(storedIdx, 10);
    if (idx >= 0 && idx < SONGS.length) return SONGS[idx];
  }

  // Strict permanent no-repeat tracking
  const usedRaw = localStorage.getItem(KEY_USED);
  let used: number[] = usedRaw ? JSON.parse(usedRaw) : [];

  // Reset only when full cycle is complete (all songs played once)
  if (used.length >= SONGS.length) used = [];

  const available = SONGS.map((_, i) => i).filter(i => !used.includes(i));
  const pool = available.length > 0 ? available : SONGS.map((_, i) => i);

  const pick = pool[Math.floor(Math.random() * pool.length)];

  used.push(pick);
  localStorage.setItem(KEY_USED, JSON.stringify(used));
  localStorage.setItem(KEY_DATE, dayKey);
  localStorage.setItem(KEY_IDX,  String(pick));

  // Keep backward-compat history key
  const historyRaw = localStorage.getItem(KEY_HISTORY);
  let history: number[] = historyRaw ? JSON.parse(historyRaw) : [];
  history.push(pick);
  if (history.length > 10) history = history.slice(-10);
  localStorage.setItem(KEY_HISTORY, JSON.stringify(history));

  return SONGS[pick];
}
