import { useEffect, useRef, useState } from 'react';
import type { Song } from '../lib/songs';

interface LyricBubble {
  id: number;
  text: string;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  fontSize: number;
}

interface Props {
  playing: boolean;
  song: Song;
}

let _id = 0;

export default function LyricsPopup({ playing, song }: Props) {
  const [bubbles, setBubbles] = useState<LyricBubble[]>([]);
  /* tracks opacity per bubble id separately so we don't re-render the whole list */
  const [opacities, setOpacities] = useState<Record<number, number>>({});

  const activeRef    = useRef(false);
  const timeoutsRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lyricIdxRef  = useRef(0);

  const addTimeout = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  };

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    lyricIdxRef.current = 0;
  }, [song.filename]);

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

    const spawnNext = () => {
      if (!activeRef.current) return;

      const id   = _id++;
      const text = lyrics[lyricIdxRef.current % lyrics.length];
      lyricIdxRef.current++;

      const x       = 8  + Math.random() * 74;
      const y       = 12 + Math.random() * 66;
      const driftX  = (Math.random() - 0.5) * 50;
      const driftY  = -(18 + Math.random() * 28);
      const fontSize = 0.82 + Math.random() * 0.5;

      const bubble: LyricBubble = { id, text, x, y, driftX, driftY, fontSize };

      setBubbles(prev => [...prev.slice(-8), bubble]);
      setOpacities(prev => ({ ...prev, [id]: 0 }));

      const lifetime   = 2200 + Math.random() * 1400;
      const fadeIn     = 500;
      const fadeOut    = 550;

      /* fade in */
      addTimeout(() => {
        if (!activeRef.current) return;
        setOpacities(prev => ({ ...prev, [id]: 1 }));
      }, fadeIn);

      /* fade out */
      addTimeout(() => {
        if (!activeRef.current) return;
        setOpacities(prev => ({ ...prev, [id]: 0 }));
      }, lifetime - fadeOut);

      /* remove */
      addTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setOpacities(prev => { const c = { ...prev }; delete c[id]; return c; });
      }, lifetime + 80);

      /* schedule next spawn */
      const nextIn = 1500 + Math.random() * 1200;
      addTimeout(spawnNext, nextIn);
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
      position: 'fixed', inset: 0, zIndex: 40,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      {bubbles.map(b => {
        const opacity = opacities[b.id] ?? 0;
        const drifted = opacity > 0;
        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top:  `${b.y}%`,
              transform: `translate(-50%, -50%) translate(${drifted ? b.driftX * 0.45 : 0}px, ${drifted ? b.driftY * 0.4 : 0}px)`,
              opacity,
              transition: 'opacity 0.5s ease, transform 2.5s ease',
              fontSize: `${b.fontSize}rem`,
              fontStyle: 'italic',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 0 20px rgba(255,121,198,0.95), 0 0 8px rgba(189,147,249,0.8)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {b.text}
          </div>
        );
      })}
    </div>
  );
}
