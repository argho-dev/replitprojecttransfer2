export interface Song {
  title: string;
  artist: string;
  filename: string;
  lyrics?: string[];
}

export const SONGS: Song[] = [
  {
    title: 'Those Eyes', artist: 'New West', filename: '/music/n01.mp3',
    lyrics: [
      'those eyes', 'I can\'t forget', 'stay a while', 'you and I',
      'just one look', 'never leave', 'those eyes on me', 'lost in you',
      'can\'t look away', 'hold me close', 'just stay',
    ],
  },
  {
    title: 'The Night We Met', artist: 'Lord Huron', filename: '/music/n02.mp3',
    lyrics: [
      'the night we met', 'take me back', 'I had all', 'and then I lost you',
      'remember us', 'that night', 'I was afraid', 'please don\'t go',
      'stay with me', 'carry me home', 'I need you',
    ],
  },
  {
    title: 'Until I Found You', artist: 'Stephen Sanchez', filename: '/music/n03.mp3',
    lyrics: [
      'until I found you', 'I said I wouldn\'t', 'I swore I wouldn\'t',
      'you pulled me in', 'here I am', 'falling for you', 'always you',
      'I never knew', 'everything changed', 'only you', 'found you',
    ],
  },
  {
    title: 'Blue', artist: 'Yung Kai', filename: '/music/n04.mp3',
    lyrics: [
      'feeling blue', 'without you', 'shades of blue', 'come back to me',
      'so blue', 'in my dreams', 'painted blue', 'missing you',
      'just us two', 'always blue', 'blue for you',
    ],
  },
  {
    title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', filename: '/music/n05.mp3',
    lyrics: [
      'I wanna be yours', 'let me be', 'yours forever', 'I wanna be',
      'secret life', 'tell me now', 'yours and mine', 'only yours',
      'belong to you', 'I\'ll be yours', 'always yours',
    ],
  },
  {
    title: 'Dandelions', artist: 'Ruth B.', filename: '/music/n06.mp3',
    lyrics: [
      'dandelions', 'in the wind', 'I close my eyes', 'I see you',
      'make a wish', 'floating free', 'just like you', 'pure as air',
      'soft and sweet', 'blown away', 'a dream of you',
    ],
  },
  {
    title: 'Ordinary', artist: '', filename: '/music/n07.mp3',
    lyrics: [
      'nothing ordinary', 'all we have', 'extraordinary you', 'with you',
      'simple moments', 'just us here', 'nothing more', 'this is life',
      'perfectly ours', 'every day', 'you and me',
    ],
  },
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
