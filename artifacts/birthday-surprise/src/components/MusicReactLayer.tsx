import { useEffect, useRef } from 'react';
import { getAudioEnergy } from '../lib/audioReact';

/* Subtle background pulse overlay that reacts to audio energy.
   No props needed — reads energy directly from the singleton. */
export default function MusicReactLayer() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let smoothed = 0;

    const loop = () => {
      const raw = getAudioEnergy();
      smoothed = smoothed * 0.84 + raw * 0.16;

      if (overlayRef.current) {
        /* Very subtle glow pulse — max opacity ~0.07 */
        overlayRef.current.style.opacity = String(smoothed * 0.07);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,121,198,1) 0%, rgba(189,147,249,0.6) 40%, transparent 70%)',
        opacity: 0,
        willChange: 'opacity',
      }}
    />
  );
}
