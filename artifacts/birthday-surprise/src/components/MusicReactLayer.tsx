import { useEffect, useRef } from 'react';
import { getAudioEnergy } from '../lib/audioReact';

/* Background pulse overlay that reacts to audio energy.
   No props needed — reads energy directly from the singleton. */
export default function MusicReactLayer() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let smoothed  = 0;
    let smoothed2 = 0; /* slower envelope for size animation */

    const loop = () => {
      const raw  = getAudioEnergy();
      smoothed   = smoothed  * 0.80 + raw * 0.20; /* fast — follows beat */
      smoothed2  = smoothed2 * 0.92 + raw * 0.08; /* slow — size swell   */

      const el = overlayRef.current;
      if (el) {
        /* Opacity: 0 at rest, up to 0.20 on strong beats — clearly visible */
        el.style.opacity = String(Math.min(0.22, smoothed * 0.22));

        /* Expand the radial gradient outward on beats */
        const pct = Math.round(55 + smoothed2 * 30); /* 55% … 85% */
        el.style.background =
          `radial-gradient(ellipse ${pct}% ${Math.round(pct * 0.7)}% at 50% 50%, ` +
          `rgba(255,121,198,1) 0%, rgba(189,147,249,0.65) 40%, transparent 70%)`;
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
        background: 'radial-gradient(ellipse 55% 38% at 50% 50%, rgba(255,121,198,1) 0%, rgba(189,147,249,0.65) 40%, transparent 70%)',
        opacity: 0,
        willChange: 'opacity, background',
      }}
    />
  );
}
