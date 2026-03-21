import { useEffect, useRef, useState } from 'react';
import type { Song, SyncedLyric } from '../lib/songs';
import { getAudioEnergy } from '../lib/audioReact';

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
  { color: '#ff2d78', glowA: 'rgba(255,45,120,0.9)',  glowB: 'rgba(255,45,120,0.4)'  },
  { color: '#bf5af2', glowA: 'rgba(191,90,242,0.9)',  glowB: 'rgba(191,90,242,0.4)'  },
  { color: '#0a84ff', glowA: 'rgba(10,132,255,0.9)',  glowB: 'rgba(10,132,255,0.4)'  },
  { color: '#ff9f0a', glowA: 'rgba(255,159,10,0.9)',  glowB: 'rgba(255,159,10,0.4)'  },
  { color: '#30d158', glowA: 'rgba(48,209,88,0.9)',   glowB: 'rgba(48,209,88,0.4)'   },
  { color: '#ff6b6b', glowA: 'rgba(255,107,107,0.9)', glowB: 'rgba(255,107,107,0.4)' },
  { color: '#ffd60a', glowA: 'rgba(255,214,10,0.9)',  glowB: 'rgba(255,214,10,0.4)'  },
  { color: '#64d2ff', glowA: 'rgba(100,210,255,0.9)', glowB: 'rgba(100,210,255,0.4)' },
  { color: '#ff79c6', glowA: 'rgba(255,121,198,0.9)', glowB: 'rgba(255,121,198,0.4)' },
  { color: '#bd93f9', glowA: 'rgba(189,147,249,0.9)', glowB: 'rgba(189,147,249,0.4)' },
  { color: '#50fa7b', glowA: 'rgba(80,250,123,0.9)',  glowB: 'rgba(80,250,123,0.4)'  },
  { color: '#ffb86c', glowA: 'rgba(255,184,108,0.9)', glowB: 'rgba(255,184,108,0.4)' },
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
const WORD_STAGGER_MS = 180; // gap between words in the same line

/* ─── Component ──────────────────────────────────────────────── */
interface Props {
  playing: boolean;
  song: Song;
  currentTime: number;
  isVideoPlaying?: boolean;
}

export default function LyricsPopup({ playing, song, currentTime, isVideoPlaying = false }: Props) {
  const [words, setWords]   = useState<WordBurst[]>([]);
  const lastTextRef         = useRef<string | null>(null);
  const lastTimeRef         = useRef<number>(-99);
  const timersRef           = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wrapperRef          = useRef<HTMLDivElement>(null);

  /* Energy-based brightness boost on the lyrics layer */
  useEffect(() => {
    if (!playing) {
      if (wrapperRef.current) wrapperRef.current.style.filter = '';
      return;
    }
    let raf: number;
    let smoothed = 0;
    const loop = () => {
      const raw = getAudioEnergy();
      smoothed = smoothed * 0.80 + raw * 0.20;
      if (wrapperRef.current) {
        wrapperRef.current.style.filter = `brightness(${1 + smoothed * 0.55})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

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

    /* Every word of this lyric line, shown exactly once */
    const wordList = lyric.text.split(/\s+/).filter(Boolean);

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
        setWords(prev => [...prev.slice(-30), burst]);
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

  if (!playing || words.length === 0 || isVideoPlaying) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={wrapperRef}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 40,
          pointerEvents: 'none',
          overflow: 'hidden',
          willChange: 'filter',
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
