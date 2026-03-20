export interface Song {
  title: string;
  artist: string;
  filename: string;
  lyrics?: string[];
}

export const SONGS: Song[] = [
  {
    title: 'Those Eyes',
    artist: 'New West',
    filename: '/music/n01.mp3',
    lyrics: [
      'those eyes',
      "can't look away",
      "those eyes on me",
      "I can't forget",
      "they won't let me be",
      "lost in those eyes",
      "made a fool of me",
      "stay a little longer",
      "just one look",
      "those eyes again",
    ],
  },
  {
    title: 'The Night We Met',
    artist: 'Lord Huron',
    filename: '/music/n02.mp3',
    lyrics: [
      'take me back',
      'the night we met',
      'I had all and then lost you',
      "haunted by you",
      "don't know what I'm supposed to do",
      'carry me home',
      'ghost of you',
      'I was afraid',
      'back to that night',
      'please stay',
    ],
  },
  {
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    filename: '/music/n03.mp3',
    lyrics: [
      'until I found you',
      "I said I wouldn't fall",
      'but this I did for you',
      "I would've told you",
      'from the very start',
      'falling for you',
      'everything changed',
      'only ever you',
      'you pulled me in',
      'here I am',
    ],
  },
  {
    title: 'Blue',
    artist: 'Yung Kai',
    filename: '/music/n04.mp3',
    lyrics: [
      'feeling blue',
      'without you',
      "you're on my mind",
      'shades of blue',
      'come back to me',
      'painted blue for you',
      'in my dreams',
      'always blue',
      'just us two',
      'blue without you',
    ],
  },
  {
    title: 'I Wanna Be Yours',
    artist: 'Arctic Monkeys',
    filename: '/music/n05.mp3',
    lyrics: [
      'I wanna be yours',
      'let me be yours',
      'secrets in my heart',
      'yours forever',
      "don't tell anybody",
      'only yours',
      "I'll be yours",
      'belong to you',
      'yours and mine',
      'just say the word',
    ],
  },
  {
    title: 'Dandelions',
    artist: 'Ruth B.',
    filename: '/music/n06.mp3',
    lyrics: [
      'dandelions',
      'I close my eyes',
      'I see you there',
      'make a wish',
      'dancing in the wind',
      'set it free',
      'found the one',
      "I've been dreaming of",
      'soft as air',
      'blown away by you',
    ],
  },
  {
    title: 'Ordinary',
    artist: '',
    filename: '/music/n07.mp3',
    lyrics: [
      'nothing ordinary',
      'extraordinary you',
      'simple moments',
      'all we have',
      'just us here',
      'perfectly ours',
      'every little day',
      'you and me',
      'this is everything',
      'beautifully ordinary',
    ],
  },
];

const KEY_USED = 'bday_songsUsedPermanent';

/**
 * Picks a fresh random song on every call.
 * Strict no-repeat: once a song is picked it is never picked again
 * until all songs have been played (full cycle), then resets.
 */
export function getDailySong(): Song {
  const usedRaw = localStorage.getItem(KEY_USED);
  let used: number[] = usedRaw ? JSON.parse(usedRaw) : [];

  if (used.length >= SONGS.length) used = [];

  const available = SONGS.map((_, i) => i).filter(i => !used.includes(i));
  const pool = available.length > 0 ? available : SONGS.map((_, i) => i);

  const pick = pool[Math.floor(Math.random() * pool.length)];
  used.push(pick);
  localStorage.setItem(KEY_USED, JSON.stringify(used));

  return SONGS[pick];
}
