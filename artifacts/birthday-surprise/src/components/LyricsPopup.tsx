import { useEffect, useRef, useState } from 'react';
import type { Song } from '../lib/songs';

interface LyricBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  opacity: number;
  phase: 'in' | 'hold' | 'out';
  driftX: number;
  driftY: number;
  fontSize: number;
}

interface Props {
  playing: boolean;
  song: Song;
}

let nextId = 0;

export default function LyricsPopup({ playing, song }: Props) {
  const [bubbles, setBubbles] = useState<LyricBubble[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lyricIndexRef = useRef(0);

  useEffect(() => {
    lyricIndexRef.current = 0;
  }, [song.filename]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setBubbles([]);
      return;
    }

    const lyrics = song.lyrics ?? [];
    if (lyrics.length === 0) return;

    const spawn = () => {
      const text = lyrics[lyricIndexRef.current % lyrics.length];
      lyricIndexRef.current++;

      const x = 8 + Math.random() * 74;
      const y = 12 + Math.random() * 66;
      const driftX = (Math.random() - 0.5) * 40;
      const driftY = -20 - Math.random() * 30;
      const fontSize = 0.85 + Math.random() * 0.45;

      const id = nextId++;
      const bubble: LyricBubble = { id, text, x, y, opacity: 0, phase: 'in', driftX, driftY, fontSize };

      setBubbles(prev => [...prev.slice(-8), bubble]);

      const lifetime = 2500 + Math.random() * 1500;
      const fadeInDur = 600;
      const fadeOutDur = 600;

      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === id ? { ...b, opacity: 1, phase: 'hold' } : b));
      }, fadeInDur);

      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === id ? { ...b, opacity: 0, phase: 'out' } : b));
      }, lifetime - fadeOutDur);

      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id));
      }, lifetime + 100);
    };

    spawn();
    intervalRef.current = setInterval(spawn, 1800 + Math.random() * 1200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, song.filename]);

  if (!playing || bubbles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {bubbles.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: `translate(-50%, -50%) translate(${b.phase !== 'in' ? b.driftX * 0.5 : 0}px, ${b.phase !== 'in' ? b.driftY * 0.4 : 0}px)`,
            opacity: b.opacity,
            transition: b.phase === 'in'
              ? 'opacity 0.6s ease, transform 0.6s ease'
              : b.phase === 'out'
                ? 'opacity 0.6s ease, transform 0.6s ease'
                : 'transform 2s ease',
            fontSize: `${b.fontSize}rem`,
            fontStyle: 'italic',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            textShadow: '0 0 18px rgba(255,121,198,0.9), 0 0 6px rgba(189,147,249,0.7)',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {b.text}
        </div>
      ))}
    </div>
  );
}
