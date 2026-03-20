export interface SyncedLyric {
  time: number;   // start time in seconds from the audio beginning
  text: string;
}

export interface Song {
  title: string;
  artist: string;
  filename: string;
  lyrics?: string[];             // fallback random snippets (unused when syncedLyrics present)
  syncedLyrics?: SyncedLyric[]; // time-stamped lines parsed from SRT
}

export const SONGS: Song[] = [
  /* ── n01 · Those Eyes · New West ───────────────────────────── */
  {
    title: 'Those Eyes',
    artist: 'New West',
    filename: '/music/n01.mp3',
    syncedLyrics: [
      { time: 0.46,  text: "When we're out in a crowd laughing loud" },
      { time: 5.32,  text: "and nobody knows why" },
      { time: 14.9,  text: "When we're lost at a club getting drunk" },
      { time: 19.08, text: "and you give me that smile" },
      { time: 28.39, text: "Going home in the back of a car" },
      { time: 37.13, text: "and your hand touches mine" },
      { time: 41.83, text: "When we're done making love and you look up" },
      { time: 49.39, text: "and give me those eyes" },
      { time: 55.19, text: "Cause all of the small things that you do" },
      { time: 60.26, text: "are what remind me what I felt for you" },
      { time: 66.66, text: "And when we're apart and I'm missing you" },
      { time: 70.64, text: "I close my eyes and all I see is you" },
      { time: 85.42, text: "When you call me at night" },
      { time: 89.2,  text: "getting high with your friends" },
      { time: 98.96, text: "Every hi, every bye" },
      { time: 104.72, text: "every I love you you've ever said" },
      { time: 107.34, text: "Cause all of the small things that you do" },
      { time: 112.56, text: "are what remind me what I felt for you" },
      { time: 118.32, text: "And when we're apart and I'm missing you" },
      { time: 123.88, text: "I close my eyes and all I see is you" },
      { time: 157.16, text: "And when we're apart and I'm missing you" },
      { time: 161.6,  text: "I close my eyes and all I see is you" },
      { time: 171.81, text: "Cause all of the small things that you do" },
      { time: 177.41, text: "are what remind me what I felt for you" },
      { time: 182.57, text: "And when we're apart and I'm missing you" },
      { time: 188.43, text: "I close my eyes and all I see is you" },
      { time: 204.23, text: "the small things you do" },
    ],
  },

  /* ── n02 · The Night We Met · Lord Huron ───────────────────── */
  {
    title: 'The Night We Met',
    artist: 'Lord Huron',
    filename: '/music/n02.mp3',
    syncedLyrics: [
      { time: 31.6,  text: "I am not the only traveller" },
      { time: 40.96, text: "who has not repaid his debt" },
      { time: 48.16, text: "I've been searching for a trail to follow again" },
      { time: 55.1,  text: "Take me back to the night we met" },
      { time: 65.48, text: "I can't tell myself what I'm supposed to do" },
      { time: 73.66, text: "I can't tell myself not to ride along with you" },
      { time: 82.02, text: "I had all and then most of you" },
      { time: 89.54, text: "Take me back to the night we met" },
      { time: 96.14, text: "I don't know what I'm supposed to do" },
      { time: 106.0, text: "Caught in my destiny" },
      { time: 113.06, text: "Take me back to the night we met" },
      { time: 120.62, text: "When the night was full of terror" },
      { time: 128.3,  text: "and your eyes were filled with tears" },
      { time: 130.7,  text: "When you had not touched me yet" },
      { time: 138.62, text: "Oh, take me back to the night we met" },
      { time: 148.38, text: "I had all and then most of you" },
      { time: 156.42, text: "Take me back to the night we met" },
      { time: 162.32, text: "I don't know what I'm supposed to do" },
      { time: 167.76, text: "Take me back to the night we met" },
    ],
  },

  /* ── n03 · Until I Found You · Stephen Sanchez ─────────────── */
  {
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    filename: '/music/n03.mp3',
    syncedLyrics: [
      { time: 11.95, text: "Georgia, right in the eye of the morning" },
      { time: 16.47, text: "In my arms you let me hold you" },
      { time: 23.63, text: "I'll never let you go again" },
      { time: 37.29, text: "I would never fall in love again" },
      { time: 41.75, text: "until I found her" },
      { time: 47.19, text: "I said I would never fall in love since you" },
      { time: 51.59, text: "I've fallen too" },
      { time: 55.93, text: "I was lost within the darkness" },
      { time: 69.83, text: "but then I found her, I found you" },
      { time: 77.07, text: "Once again you fell, I caught a chill" },
      { time: 89.35, text: "I'll never let you go again" },
      { time: 95.39, text: "I would never fall in love again until I found her" },
      { time: 105.05, text: "I said I would never fall in love since you" },
      { time: 109.49, text: "I've fallen too" },
      { time: 115.07, text: "but then I found her, I found you" },
      { time: 137.07, text: "I would never fall in love again until I found her" },
      { time: 146.97, text: "I said I would never fall in love since you" },
      { time: 151.41, text: "I've fallen too" },
      { time: 155.75, text: "but then I found her, I found you" },
    ],
  },

  /* ── n04 · Blue · Yung Kai ──────────────────────────────────── */
  {
    title: 'Blue',
    artist: 'Yung Kai',
    filename: '/music/n04.mp3',
    syncedLyrics: [
      { time: 22.28, text: "I could stare like watching stars" },
      { time: 26.98, text: "I could walk you by" },
      { time: 30.36, text: "I'll tell without a thought — you'd be mine" },
      { time: 34.78, text: "Would you mind if I took your hand tonight?" },
      { time: 41.86, text: "Know you're all that I want this time" },
      { time: 48.7,  text: "I'll imagine you fell in love" },
      { time: 51.22, text: "Love under moonlight skies with you" },
      { time: 61.16, text: "The ocean's colours on your face" },
      { time: 64.56, text: "I'll leave my heart with your air" },
      { time: 68.14, text: "So let me fly with you" },
      { time: 72.34, text: "Will you be forever with me?" },
      { time: 107.24, text: "My love will always stay by you" },
      { time: 113.24, text: "I'll keep it safe, don't you worry" },
      { time: 119.96, text: "I'll tell you I love you more" },
      { time: 123.5,  text: "It's stuck with you forever" },
      { time: 127.44, text: "So promise you won't let it go" },
      { time: 130.62, text: "I'll trust the universe to bring me to you" },
      { time: 136.82, text: "I'll imagine you fell in love" },
      { time: 141.98, text: "Love under moonlight skies with you" },
      { time: 149.5,  text: "The ocean's colours on your face" },
      { time: 152.52, text: "I'll leave my heart with your air" },
      { time: 156.18, text: "So let me fly with you" },
      { time: 159.84, text: "Will you be forever with me?" },
    ],
  },

  /* ── n05 · I Wanna Be Yours · Arctic Monkeys ────────────────── */
  {
    title: 'I Wanna Be Yours',
    artist: 'Arctic Monkeys',
    filename: '/music/n05.mp3',
    syncedLyrics: [
      { time: 19.06, text: "I wanna be your vacuum cleaner" },
      { time: 32.72, text: "If you like your coffee hot" },
      { time: 36.82, text: "let me be your coffee pot" },
      { time: 39.64, text: "You call the shots babe" },
      { time: 45.98, text: "Secrets I have held in my heart" },
      { time: 50.58, text: "are things I had to hide" },
      { time: 54.24, text: "I just wanna be yours" },
      { time: 58.08, text: "I wanna be yours" },
      { time: 65.88, text: "wanna be yours" },
      { time: 74.58, text: "Let me be your air commuter" },
      { time: 89.13, text: "I wanna be your steady lotion" },
      { time: 97.72, text: "hold you close to the Pacific Ocean" },
      { time: 103.46, text: "Secrets I have held in my heart" },
      { time: 107.44, text: "are things I had to hide" },
      { time: 111.14, text: "I just wanna be yours" },
      { time: 114.88, text: "I wanna be yours" },
      { time: 121.72, text: "wanna be yours" },
      { time: 154.32, text: "I wanna be yours" },
      { time: 160.86, text: "wanna be yours" },
    ],
  },

  /* ── n06 · Dandelions · Ruth B. ─────────────────────────────── */
  {
    title: 'Dandelions',
    artist: 'Ruth B.',
    filename: '/music/n06.mp3',
    syncedLyrics: [
      { time: 13.72, text: "Maybe it's the way you say my name" },
      { time: 19.4,  text: "Maybe it's the way you play your game" },
      { time: 23.2,  text: "But it's so good" },
      { time: 26.18, text: "I've never known anybody like you" },
      { time: 37.66, text: "And I've heard of a love that comes once in a lifetime" },
      { time: 44.48, text: "And I'm pretty sure that you are that love of mine" },
      { time: 48.58, text: "Cause I'm in a field of dandelions" },
      { time: 55.5,  text: "Wishing on everyone that you'd be mine" },
      { time: 64.92, text: "I see forever in your eyes" },
      { time: 69.96, text: "I feel okay when I see you smile" },
      { time: 75.02, text: "Wishing on dandelions all of the time" },
      { time: 77.32, text: "Praying to God that one day you'll be mine" },
      { time: 82.36, text: "I think that you are the one for me" },
      { time: 90.1,  text: "Cause it gets so hard to breathe" },
      { time: 99.08, text: "I've never felt so alive and free" },
      { time: 105.22, text: "I've never felt so happy" },
      { time: 109.76, text: "And I've heard of a love that comes once in a lifetime" },
      { time: 117.1,  text: "And I'm pretty sure that you are that love of mine" },
      { time: 124.0,  text: "Wishing on everyone that you'd be mine" },
      { time: 133.18, text: "I see forever in your eyes" },
      { time: 138.26, text: "I feel okay when I see you smile" },
      { time: 147.44, text: "Wishing on dandelions all of the time" },
      { time: 157.84, text: "Dandelion into the wind you go" },
      { time: 162.64, text: "Won't you let my darling know" },
      { time: 171.96, text: "I'm in a field of dandelions" },
      { time: 175.54, text: "Wishing on everyone that you'd be mine" },
      { time: 186.4,  text: "I see forever in your eyes" },
      { time: 198.24, text: "Wishing on dandelions all of the time" },
      { time: 208.64, text: "I'm in a field of dandelions" },
      { time: 213.66, text: "Wishing on everyone that you'd be mine" },
    ],
  },

  /* ── n07 · Ordinary ─────────────────────────────────────────── */
  {
    title: 'Ordinary',
    artist: '',
    filename: '/music/n07.mp3',
    syncedLyrics: [
      { time: 4.77,  text: "They say the holy water's watered down" },
      { time: 12.2,  text: "This town lost in its faith" },
      { time: 15.1,  text: "The colours will fade, eventually" },
      { time: 19.06, text: "So if our time is running out" },
      { time: 24.22, text: "We'll make the mundane a masterpiece" },
      { time: 30.56, text: "Oh my my, oh my my love" },
      { time: 35.02, text: "You're taking me out of the ordinary" },
      { time: 39.18, text: "I want you laying me down" },
      { time: 41.64, text: "So we're dead and buried" },
      { time: 45.12, text: "The angels up in the clouds" },
      { time: 49.58, text: "Are jealous knowing we're falling" },
      { time: 52.46, text: "Something so wild, out of the ordinary" },
      { time: 56.96, text: "You got me kissing the ground of your sanctuary" },
      { time: 60.98, text: "Shining me with your touch" },
      { time: 64.2,  text: "Oh lord, return me to dust" },
      { time: 67.94, text: "The angels up in the clouds are jealous" },
      { time: 74.08, text: "Hopeless heart in this sight of heaven's gate" },
      { time: 87.37, text: "Take my breath away" },
      { time: 92.37, text: "At your altar, I will pray" },
      { time: 96.37, text: "You're the sculptor, I'm the clay" },
      { time: 99.07, text: "You're taking me out of the ordinary" },
      { time: 103.31, text: "I want you laying me down" },
      { time: 106.83, text: "So we're dead and buried" },
      { time: 109.87, text: "The angels up in the clouds" },
      { time: 113.99, text: "Are jealous knowing we're falling" },
      { time: 116.89, text: "Something so wild, out of the ordinary" },
      { time: 121.11, text: "You got me kissing the ground of your sanctuary" },
      { time: 125.77, text: "Shining me with your touch" },
      { time: 129.89, text: "Oh lord, return me to dust" },
      { time: 133.75, text: "Something so heavenly, higher than ecstasy" },
      { time: 139.13, text: "Whenever you're next to me" },
      { time: 143.53, text: "Ripples in black and white" },
      { time: 147.25, text: "Until I see your light" },
      { time: 155.73, text: "Something so wild, out of the ordinary" },
      { time: 167.34, text: "Knowing we're falling" },
      { time: 170.24, text: "Something so wild, out of the ordinary" },
      { time: 174.44, text: "You got me kissing the ground of your sanctuary" },
      { time: 179.08, text: "Shining me with your touch" },
      { time: 183.22, text: "Oh lord, return me to dust" },
    ],
  },
];

const KEY_USED = 'bday_songsUsedPermanent';

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
