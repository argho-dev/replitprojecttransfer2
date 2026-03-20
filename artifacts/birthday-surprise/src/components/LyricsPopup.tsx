import { useEffect, useRef, useState } from 'react';
import type { Song } from '../lib/songs';

interface LyricBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  driftY: number;
  fontSize: number;
}

interface Props {
  playing: boolean;
  song: Song;
}

let _id = 0;

export default function LyricsPopup({ playing, song }: Props) {
  const [bubbles, setBubbles]   = useState<LyricBubble[]>([]);
  const [opacities, setOpacities] = useState<Record<number, number>>({});

  const activeRef   = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ---------- helpers ---------------------------------------- */
  const addTimeout = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRef.current.push(t);
  };

  const clearAll = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  /* pick a random lyric from the current song (never the same twice in a row) */
  const lastPickRef = useRef(-1);
  const pickLyric = (lyrics: string[]) => {
    if (lyrics.length === 0) return '';
    if (lyrics.length === 1) return lyrics[0];
    let idx: number;
    do { idx = Math.floor(Math.random() * lyrics.length); }
    while (idx === lastPickRef.current);
    lastPickRef.current = idx;
    return lyrics[idx];
  };

  /* ---------- main effect ------------------------------------- */
  useEffect(() => {
    if (!playing) {
      activeRef.current = false;
      clearAll();
      setBubbles([]);
      setOpacities({});
      return;
    }

    const lyrics = song.lyrics ?? [];
    if (lyrics.length === 0) return;

    activeRef.current = true;
    lastPickRef.current = -1;   // reset on song change

    const spawnNext = () => {
      if (!activeRef.current) return;

      const id       = _id++;
      const text     = pickLyric(lyrics);

      /* spawn anywhere across the screen, avoid edges */
      const x        = 10 + Math.random() * 80;   // 10%–90%
      const y        = 10 + Math.random() * 72;   // 10%–82%
      const driftY   = -(20 + Math.random() * 30); // float upward
      const fontSize = 0.78 + Math.random() * 0.46;

      const bubble: LyricBubble = { id, text, x, y, driftY, fontSize };

      setBubbles(prev => [...prev.slice(-7), bubble]);
      setOpacities(prev => ({ ...prev, [id]: 0 }));

      const lifetime = 4200 + Math.random() * 2000;
      const fadeIn   = 600;
      const fadeOut  = 700;

      addTimeout(() => {
        if (!activeRef.current) return;
        setOpacities(prev => ({ ...prev, [id]: 1 }));
      }, fadeIn);

      addTimeout(() => {
        if (!activeRef.current) return;
        setOpacities(prev => ({ ...prev, [id]: 0 }));
      }, lifetime - fadeOut);

      addTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setOpacities(prev => { const c = { ...prev }; delete c[id]; return c; });
      }, lifetime + 100);

      /* next spawn: 3.5 – 5.5 s — slow, relaxed pacing */
      addTimeout(spawnNext, 3500 + Math.random() * 2000);
    };

    spawnNext();

    return () => {
      activeRef.current = false;
      clearAll();
      setBubbles([]);
      setOpacities({});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, song.filename]);

  if (!playing || bubbles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 40,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {bubbles.map(b => {
        const opacity = opacities[b.id] ?? 0;
        const risen   = opacity > 0;
        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top:  `${b.y}%`,
              transform: `translate(-50%, -50%) translateY(${risen ? b.driftY * 0.5 : 0}px)`,
              opacity,
              transition: 'opacity 0.45s ease, transform 2.8s ease',

              fontSize:      `${b.fontSize}rem`,
              fontStyle:     'italic',
              fontWeight:    600,
              color:         '#fff',
              letterSpacing: '0.04em',
              whiteSpace:    'nowrap',
              userSelect:    'none',

              /* Multi-layer text glow — readable on any bg, no box */
              textShadow: [
                '0 1px 3px rgba(0,0,0,0.9)',        // dark drop-shadow for contrast
                '0 0 10px rgba(0,0,0,0.8)',          // dark halo
                '0 0 18px rgba(255,121,198,0.85)',   // pink glow
                '0 0 32px rgba(189,147,249,0.55)',   // purple outer glow
              ].join(', '),
            }}
          >
            {b.text}
          </div>
        );
      })}
    </div>
  );
}
