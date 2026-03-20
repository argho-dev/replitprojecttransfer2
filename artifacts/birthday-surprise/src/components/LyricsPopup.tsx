import { useEffect, useRef, useState } from 'react';
import type { Song, SyncedLyric } from '../lib/songs';

/* ─── Types ─────────────────────────────────────────────────── */
interface LyricBurst {
  id: number;
  text: string;
  x: number;      // % from left
  y: number;      // % from top
  color: string;
  glowA: string;  // glow color rgba (strong)
  glowB: string;  // glow color rgba (soft outer)
  fontSize: number;
  angle: number;
  phase: 'in' | 'hold' | 'out';
}

/* ─── Palette ────────────────────────────────────────────────── */
const PALETTE = [
  { color: '#ff79c6', glowA: 'rgba(255,121,198,0.95)', glowB: 'rgba(255,121,198,0.45)' },
  { color: '#bd93f9', glowA: 'rgba(189,147,249,0.95)', glowB: 'rgba(189,147,249,0.45)' },
  { color: '#8be9fd', glowA: 'rgba(139,233,253,0.95)', glowB: 'rgba(139,233,253,0.40)' },
  { color: '#ffb86c', glowA: 'rgba(255,184,108,0.95)', glowB: 'rgba(255,184,108,0.40)' },
  { color: '#f1fa8c', glowA: 'rgba(241,250,140,0.95)', glowB: 'rgba(241,250,140,0.40)' },
  { color: '#ff92df', glowA: 'rgba(255,146,223,0.95)', glowB: 'rgba(255,146,223,0.45)' },
  { color: '#a5f3fc', glowA: 'rgba(165,243,252,0.95)', glowB: 'rgba(165,243,252,0.40)' },
  { color: '#fca5a5', glowA: 'rgba(252,165,165,0.95)', glowB: 'rgba(252,165,165,0.40)' },
  { color: '#c4b5fd', glowA: 'rgba(196,181,253,0.95)', glowB: 'rgba(196,181,253,0.45)' },
  { color: '#6ee7b7', glowA: 'rgba(110,231,183,0.95)', glowB: 'rgba(110,231,183,0.40)' },
];

const SIZES  = [17, 19, 21, 23, 26, 29, 32];
const ANGLES = [-9, -6, -3, 0, 3, 6, 9];

/* ─── Helpers ────────────────────────────────────────────────── */
let _nextId = 0;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickRand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Return the lyric whose start time is ≤ currentTime and is the closest
 * match, i.e. the most-recently-started line.
 */
function getActiveLyric(t: number, lyrics: SyncedLyric[]): SyncedLyric | null {
  let result: SyncedLyric | null = null;
  for (const l of lyrics) {
    if (l.time <= t) result = l;
    else break;
  }
  return result;
}

/* ─── Animation keyframes ────────────────────────────────────── */
const CSS = `
@keyframes lb-in {
  0%   { opacity:0; transform:translate(-50%,-50%) scale(0.35) rotate(var(--a,0deg)); filter:blur(8px);  }
  60%  { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(var(--a,0deg)); filter:blur(0px); }
  100% { opacity:1; transform:translate(-50%,-50%) scale(1)    rotate(var(--a,0deg)); filter:blur(0px); }
}
@keyframes lb-out {
  0%   { opacity:1; transform:translate(-50%,-50%) scale(1)    rotate(var(--a,0deg)); filter:blur(0px); }
  100% { opacity:0; transform:translate(-50%,-50%) scale(0.7)  rotate(var(--a,0deg)); filter:blur(5px);  }
}
`;

const IN_MS   = 450;
const HOLD_MS = 2400;
const OUT_MS  = 600;

/* ─── Component ──────────────────────────────────────────────── */
interface Props {
  playing: boolean;
  song: Song;
  currentTime: number;
}

export default function LyricsPopup({ playing, song, currentTime }: Props) {
  const [bursts, setBursts] = useState<LyricBurst[]>([]);
  const lastTextRef         = useRef<string | null>(null);
  const lastTimeRef         = useRef<number>(-99);
  const timersRef           = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  /* Reset when paused or song changes */
  useEffect(() => {
    if (!playing) {
      lastTextRef.current = null;
      lastTimeRef.current = -99;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setBursts([]);
    }
  }, [playing, song.filename]);

  /* Sync effect: fire whenever currentTime ticks */
  useEffect(() => {
    if (!playing) return;

    const lyrics = song.syncedLyrics;
    if (!lyrics || lyrics.length === 0) return;

    const lyric = getActiveLyric(currentTime, lyrics);
    if (!lyric) return;

    /* Only spawn when a NEW lyric line becomes active */
    const isSameText = lyric.text === lastTextRef.current;
    /* Allow re-trigger if user seeks (large time jump) */
    const timeDelta  = Math.abs(currentTime - lastTimeRef.current);
    if (isSameText && timeDelta < 1) return;

    lastTextRef.current = lyric.text;
    lastTimeRef.current  = currentTime;

    const swatch   = pickRand(PALETTE);
    const fontSize = pickRand(SIZES);
    const angle    = pickRand(ANGLES);

    /* Random position: keep well inside viewport */
    const x = rand(8, 82);
    const y = rand(10, 82);

    const id = ++_nextId;

    const burst: LyricBurst = {
      id,
      text: lyric.text,
      x, y,
      color: swatch.color,
      glowA: swatch.glowA,
      glowB: swatch.glowB,
      fontSize,
      angle,
      phase: 'in',
    };

    setBursts(prev => [...prev.slice(-8), burst]);

    /* Transition: in → hold → out → remove */
    addTimer(() => setBursts(prev =>
      prev.map(b => b.id === id ? { ...b, phase: 'hold' } : b)
    ), IN_MS);

    addTimer(() => setBursts(prev =>
      prev.map(b => b.id === id ? { ...b, phase: 'out' } : b)
    ), IN_MS + HOLD_MS);

    addTimer(() => setBursts(prev => prev.filter(b => b.id !== id)),
      IN_MS + HOLD_MS + OUT_MS + 50
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  if (!playing || bursts.length === 0) return null;

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
        {bursts.map(b => {
          const animName =
            b.phase === 'in'  ? 'lb-in' :
            b.phase === 'out' ? 'lb-out' : 'none';
          const animDur =
            b.phase === 'in'  ? `${IN_MS}ms` :
            b.phase === 'out' ? `${OUT_MS}ms` : '0ms';

          return (
            <div
              key={b.id}
              style={{
                /* Position */
                position: 'absolute',
                left: `${b.x}%`,
                top:  `${b.y}%`,

                /* Pivot at center for scale/rotate */
                transform: `translate(-50%,-50%) scale(${b.phase === 'hold' ? 1 : undefined}) rotate(${b.angle}deg)`,

                /* CSS custom prop for keyframe rotation */
                ['--a' as string]: `${b.angle}deg`,

                /* Animation */
                animation: animName !== 'none'
                  ? `${animName} ${animDur} cubic-bezier(0.175,0.885,0.32,1.275) forwards`
                  : 'none',
                opacity: b.phase === 'hold' ? 1 : undefined,

                /* Typography */
                fontSize: `${b.fontSize}px`,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontStyle: 'italic',
                letterSpacing: '0.025em',
                lineHeight: 1.25,
                color: b.color,
                textAlign: 'center',
                maxWidth: '58vw',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',

                /* Pill background */
                padding: '5px 16px',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.22)',
                backdropFilter: 'blur(3px)',
                border: `1px solid ${b.color}30`,

                /* Neon glow layers */
                textShadow: [
                  `0 0 6px  ${b.glowA}`,
                  `0 0 18px ${b.glowA}`,
                  `0 0 38px ${b.glowB}`,
                  `0 0 70px ${b.glowB}`,
                  '0 2px 4px rgba(0,0,0,0.8)',
                ].join(', '),
                boxShadow: [
                  `0 0 16px ${b.glowB}`,
                  `inset 0 0 12px ${b.color}0a`,
                ].join(', '),

                userSelect: 'none',
                willChange: 'transform, opacity, filter',
              }}
            >
              {b.text}
            </div>
          );
        })}
      </div>
    </>
  );
}
