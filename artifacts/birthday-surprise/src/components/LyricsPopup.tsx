import { useEffect, useRef, useState } from 'react';
import type { Song, SyncedLyric } from '../lib/songs';

/* ─── Types ─────────────────────────────────────────────────── */
interface WordBurst {
  id: number;
  word: string;
  x: number;
  y: number;
  color: string;
  glowA: string;
  glowB: string;
  fontSize: number;
  angle: number;
  phase: 'in' | 'hold' | 'out';
}

/* ─── Palette ────────────────────────────────────────────────── */
const PALETTE = [
  { color: '#ff79c6', glowA: 'rgba(255,121,198,1)',   glowB: 'rgba(255,121,198,0.5)' },
  { color: '#bd93f9', glowA: 'rgba(189,147,249,1)',   glowB: 'rgba(189,147,249,0.5)' },
  { color: '#8be9fd', glowA: 'rgba(139,233,253,1)',   glowB: 'rgba(139,233,253,0.5)' },
  { color: '#ffb86c', glowA: 'rgba(255,184,108,1)',   glowB: 'rgba(255,184,108,0.5)' },
  { color: '#f1fa8c', glowA: 'rgba(241,250,140,1)',   glowB: 'rgba(241,250,140,0.5)' },
  { color: '#ff92df', glowA: 'rgba(255,146,223,1)',   glowB: 'rgba(255,146,223,0.5)' },
  { color: '#ffffff', glowA: 'rgba(255,255,255,0.95)', glowB: 'rgba(255,200,230,0.5)' },
  { color: '#fca5a5', glowA: 'rgba(252,165,165,1)',   glowB: 'rgba(252,165,165,0.5)' },
  { color: '#c4b5fd', glowA: 'rgba(196,181,253,1)',   glowB: 'rgba(196,181,253,0.5)' },
  { color: '#6ee7b7', glowA: 'rgba(110,231,183,1)',   glowB: 'rgba(110,231,183,0.5)' },
];

const SIZES  = [20, 22, 25, 28, 32, 36, 40];
const ANGLES = [-10, -7, -4, -2, 0, 2, 4, 7, 10];

/* ─── Helpers ────────────────────────────────────────────────── */
let _nextId = 0;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickRand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getActiveLyric(t: number, lyrics: SyncedLyric[]): SyncedLyric | null {
  let result: SyncedLyric | null = null;
  for (const l of lyrics) {
    if (l.time <= t) result = l;
    else break;
  }
  return result;
}

/* ─── Keyframes ──────────────────────────────────────────────── */
const CSS = `
@keyframes wb-in {
  0%   { opacity:0; transform:translate(-50%,-50%) scale(0.2) rotate(var(--ang)); filter:blur(10px); }
  55%  { opacity:1; transform:translate(-50%,-50%) scale(1.15) rotate(var(--ang)); filter:blur(0);   }
  100% { opacity:1; transform:translate(-50%,-50%) scale(1)    rotate(var(--ang)); filter:blur(0);   }
}
@keyframes wb-out {
  0%   { opacity:1; transform:translate(-50%,-50%) scale(1)   rotate(var(--ang)); filter:blur(0);   }
  100% { opacity:0; transform:translate(-50%,-50%) scale(0.6) rotate(var(--ang)); filter:blur(6px); }
}
`;

const IN_MS   = 450;
const HOLD_MS = 3200;
const OUT_MS  = 700;
const MAX_WORDS_PER_LINE = 2;  // only 2 words per lyric trigger
const WORD_STAGGER_MS   = 300; // gap between the 2 words

/* Words too small/common to show alone */
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'i','my','me','you','your','we','our','it','its','is','are','was','were',
  'be','been','so','up','by','if','as','not','do','did','had','has','have',
  'that','this','will','would','could','should','may','might','just','than',
  'then','when','what','who','how','all','from','they','them','their','her',
  'him','his','she','he','no','yes','oh','into',
]);

/* ─── Component ──────────────────────────────────────────────── */
interface Props {
  playing: boolean;
  song: Song;
  currentTime: number;
}

export default function LyricsPopup({ playing, song, currentTime }: Props) {
  const [words, setWords]   = useState<WordBurst[]>([]);
  const lastTextRef         = useRef<string | null>(null);
  const lastTimeRef         = useRef<number>(-99);
  const timersRef           = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  /* Reset when paused or song changes */
  useEffect(() => {
    if (!playing) {
      lastTextRef.current = null;
      lastTimeRef.current = -99;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setWords([]);
    }
  }, [playing, song.filename]);

  /* Sync: fire on every currentTime tick */
  useEffect(() => {
    if (!playing) return;

    const lyrics = song.syncedLyrics;
    if (!lyrics || lyrics.length === 0) return;

    const lyric = getActiveLyric(currentTime, lyrics);
    if (!lyric) return;

    /* Only fire when the active lyric LINE actually changes */
    if (lyric.text === lastTextRef.current) return;

    lastTextRef.current = lyric.text;
    lastTimeRef.current = currentTime;

    /* Split into words, filter stop words, cap per lyric trigger */
    const allWords = lyric.text.split(/\s+/).filter(Boolean);
    const meaningful = allWords.filter(w => !STOP_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, '')));
    /* Fall back to all words if nothing meaningful remains */
    const pool = meaningful.length > 0 ? meaningful : allWords;
    const wordList = pool.slice(0, MAX_WORDS_PER_LINE);

    wordList.forEach((word, wi) => {
      const delay    = wi * WORD_STAGGER_MS;
      const swatch   = pickRand(PALETTE);
      const fontSize = pickRand(SIZES);
      const angle    = pickRand(ANGLES);
      const x        = rand(6, 86);
      const y        = rand(8, 84);
      const id       = ++_nextId;

      const burst: WordBurst = {
        id, word, x, y,
        color: swatch.color,
        glowA: swatch.glowA,
        glowB: swatch.glowB,
        fontSize, angle,
        phase: 'in',
      };

      /* Spawn after stagger delay */
      addTimer(() => {
        setWords(prev => [...prev.slice(-20), burst]);
      }, delay);

      /* in → hold */
      addTimer(() => setWords(prev =>
        prev.map(b => b.id === id ? { ...b, phase: 'hold' } : b)
      ), delay + IN_MS);

      /* hold → out */
      addTimer(() => setWords(prev =>
        prev.map(b => b.id === id ? { ...b, phase: 'out' } : b)
      ), delay + IN_MS + HOLD_MS);

      /* remove */
      addTimer(() => setWords(prev => prev.filter(b => b.id !== id)),
        delay + IN_MS + HOLD_MS + OUT_MS + 50
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  if (!playing || words.length === 0) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          position: 'fixed', inset: 0,
          zIndex: 40,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {words.map(b => {
          const animName =
            b.phase === 'in'  ? 'wb-in'  :
            b.phase === 'out' ? 'wb-out' : 'none';
          const animDur =
            b.phase === 'in'  ? `${IN_MS}ms`  :
            b.phase === 'out' ? `${OUT_MS}ms` : '0ms';

          return (
            <span
              key={b.id}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top:  `${b.y}%`,
                ['--ang' as string]: `${b.angle}deg`,

                animation: animName !== 'none'
                  ? `${animName} ${animDur} cubic-bezier(0.175,0.885,0.32,1.4) forwards`
                  : 'none',
                opacity: b.phase === 'hold' ? 1 : undefined,

                /* Typography — no box, no background */
                fontSize: `${b.fontSize}px`,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '0.01em',
                color: b.color,
                whiteSpace: 'nowrap',
                userSelect: 'none',

                /* Pure neon text glow, no background at all */
                textShadow: [
                  `0 0 4px  ${b.glowA}`,
                  `0 0 12px ${b.glowA}`,
                  `0 0 28px ${b.glowB}`,
                  `0 0 55px ${b.glowB}`,
                ].join(', '),

                background: 'none',
                border: 'none',
                boxShadow: 'none',
                padding: 0,

                willChange: 'transform, opacity, filter',
              }}
            >
              {b.word}
            </span>
          );
        })}
      </div>
    </>
  );
}
