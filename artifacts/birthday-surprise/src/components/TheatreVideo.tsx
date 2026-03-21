import { useEffect, useRef, useState } from 'react';
import videoSrc from '@assets/km_20260322_720p_60f_20260322_015708_1774124941575.mp4';

interface Props {
  onClose: () => void;
}

export default function TheatreVideo({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  /* On mount: fade in + immediately hide lyrics */
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    window.dispatchEvent(new CustomEvent('theatre:open'));
    return () => {
      cancelAnimationFrame(id);
      /* On unmount: restore lyrics + volume */
      window.dispatchEvent(new CustomEvent('theatre:close'));
    };
  }, []);

  /* Smooth volume helper */
  function smoothVolume(target: number, duration = 600) {
    const audio = document.querySelector<HTMLAudioElement>('audio');
    if (!audio) return;
    const start = audio.volume;
    const diff = target - start;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      audio.volume = Math.max(0, Math.min(1, start + diff * t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const handlePlay = () => {
    smoothVolume(0.4);
  };

  const handlePauseOrEnd = () => {
    smoothVolume(1.0);
  };

  const handleClose = () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
    smoothVolume(1.0);
    setVisible(false);
    setTimeout(onClose, 350);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Theatre curtain effect — top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '12vh',
        background: 'linear-gradient(to bottom, rgba(60,0,20,0.85), transparent)',
        pointerEvents: 'none',
      }} />
      {/* Theatre curtain effect — bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '12vh',
        background: 'linear-gradient(to top, rgba(60,0,20,0.85), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '1.2rem',
          right: '1.2rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '50%',
          width: 36,
          height: 36,
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
          zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
      >
        ✕
      </button>

      {/* Theatre label */}
      <div style={{
        position: 'absolute',
        top: '1.4rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.68rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,200,160,0.55)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        🎬 &nbsp; Now Showing
      </div>

      {/* Video container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 860,
        aspectRatio: '16/9',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `
          0 0 0 1px rgba(255,180,100,0.15),
          0 0 60px rgba(255,100,50,0.18),
          0 0 120px rgba(200,60,20,0.12),
          0 30px 80px rgba(0,0,0,0.8)
        `,
        background: '#000',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(24px)',
        transition: 'opacity 0.45s ease 0.05s, transform 0.45s cubic-bezier(0.34,1.2,0.64,1) 0.05s',
      }}>
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          playsInline
          controlsList="nofullscreen nodownload noremoteplayback"
          onPlay={handlePlay}
          onPause={handlePauseOrEnd}
          onEnded={handlePauseOrEnd}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            background: '#000',
          }}
        />
      </div>
    </div>
  );
}
