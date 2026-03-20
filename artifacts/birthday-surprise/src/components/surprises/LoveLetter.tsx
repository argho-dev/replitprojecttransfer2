import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const KF = `
@keyframes envelopeBob{0%,100%{transform:translateY(0) rotate(-3deg) scale(1)}50%{transform:translateY(-18px) rotate(4deg) scale(1.06)}}
@keyframes petalDrift{0%{transform:translateY(-30px) rotate(0deg);opacity:0}8%{opacity:1}92%{opacity:.8}100%{transform:translateY(110vh) rotate(var(--rot));opacity:0}}
@keyframes hintFade{0%,100%{opacity:.45}50%{opacity:1}}
`;

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.6) % 96}%`,
  dur: 5 + (i % 5) * 1.3,
  delay: -(i * 0.6),
  rot: `${(i % 2 ? 1 : -1) * (180 + i * 30)}deg`,
}));

type Stage = 'envelope' | 'scratch' | 'revealed';
interface P { message: string; onReveal?: () => void }

export default function LoveLetter({ message, onReveal }: P) {
  const [stage, setStage]           = useState<Stage>('envelope');
  const [scratchPct, setScratchPct] = useState(0);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  /* ── ENVELOPE → open letter ──────────────────────────── */
  const openEnvelope = () => {
    if (stage !== 'envelope') return;
    const env = envelopeRef.current;
    if (!env) return;
    gsap.timeline()
      .to(env, { scale: 1.12, rotation: 8,  duration: .18, ease: 'power1.out' })
      .to(env, { scale: .85,  rotation: -5, duration: .13 })
      .to(env, { scale: 0, opacity: 0, rotation: 15, y: -30, duration: .35,
        ease: 'back.in(1.4)', onComplete: () => setStage('scratch') });
  };

  /* ── SCRATCH CANVAS SETUP + NATIVE EVENTS ────────────── */
  /*
   * useLayoutEffect fires synchronously after the canvas element is
   * committed to the DOM – getBoundingClientRect() is guaranteed to
   * return real dimensions at that point (no RAF needed).
   */
  useLayoutEffect(() => {
    if (stage !== 'scratch') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── 1. Size the canvas with DPR so it's crisp on retina ── */
    const rect = canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.scale(dpr, dpr);          // from here on draw in CSS px

    /* ── 2. Paint the opaque cover layer ── */
    ctx.fillStyle = '#d81b60';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // shimmer blobs
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * rect.width, Math.random() * rect.height,
        30 + Math.random() * 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // hint text
    ctx.textAlign = 'center';
    ctx.font      = 'bold 15px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText('✦ scratch to reveal ✦', rect.width / 2, rect.height / 2 - 10);
    ctx.font      = '12px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fillText('hold & drag · swipe with finger', rect.width / 2, rect.height / 2 + 14);

    /* ── 3. Scratch logic ── */
    let drawing = false;
    let done    = false;
    let lastCheck = 0;

    /** clientX/Y → CSS-pixel position inside the canvas */
    const toXY = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const scratchAt = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);   // 40 CSS-px brush
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    };

    const checkReveal = () => {
      if (done) return;
      const now = Date.now();
      if (now - lastCheck < 200) return;   // throttle to ~5 checks/sec
      lastCheck = now;

      // getImageData works in physical pixels (canvas.width × canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) cleared++;
      }
      const pct = Math.round((cleared / (data.length / 4)) * 100);
      setScratchPct(pct);

      if (pct >= 65) {
        done = true;
        ctx.clearRect(0, 0, rect.width, rect.height);
        setStage('revealed');
      }
    };

    /* ── 4. Native DOM event listeners ── */
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      drawing = true;
      const { x, y } = toXY(e.clientX, e.clientY);
      scratchAt(x, y);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!drawing) return;
      const { x, y } = toXY(e.clientX, e.clientY);
      scratchAt(x, y);
      checkReveal();
    };
    const onMouseUp = () => {
      if (!drawing) return;
      drawing = false;
      checkReveal();
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      drawing = true;
      const t = e.touches[0];
      const { x, y } = toXY(t.clientX, t.clientY);
      scratchAt(x, y);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing) return;
      const t = e.touches[0];
      const { x, y } = toXY(t.clientX, t.clientY);
      scratchAt(x, y);
      checkReveal();
    };
    const onTouchEnd = () => {
      drawing = false;
      checkReveal();
    };

    canvas.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);

    /* ── 5. Cleanup — capture canvas locally so ref is still valid ── */
    return () => {
      canvas.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseup',    onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, [stage]);

  /* ── RENDER ──────────────────────────────────────────── */
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(155deg,#fbcfe8 0%,#fce7f3 35%,#f5d0fe 65%,#ede9fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{KF}</style>

      {PETALS.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, top: 0,
          fontSize: '1rem', userSelect: 'none', pointerEvents: 'none',
          ['--rot' as any]: p.rot,
          animation: `petalDrift ${p.dur}s ${p.delay}s linear infinite`,
        }}>🌸</div>
      ))}

      {/* ── ENVELOPE ── */}
      {stage === 'envelope' && (
        <div
          ref={envelopeRef}
          onClick={openEnvelope}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 'clamp(12px,3vw,22px)', cursor: 'pointer',
            position: 'relative', zIndex: 10,
          }}
        >
          <p style={{
            color: '#9d4b7a', fontSize: 'clamp(.85rem,2.5vw,1.1rem)',
            fontStyle: 'italic', opacity: .8, animation: 'hintFade 2s ease-in-out infinite',
          }}>
            Something is waiting for you…
          </p>
          <div style={{ animation: 'envelopeBob 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 20px rgba(200,80,150,.35))' }}>
            <svg width="clamp(180px,45vw,260px)" height="clamp(130px,33vw,190px)" viewBox="0 0 260 190" fill="none">
              <rect x="10" y="60" width="240" height="120" rx="12" fill="rgba(255,121,198,.15)" stroke="#ff79c6" strokeWidth="2"/>
              <path d="M10 60 L130 125 L250 60" fill="rgba(255,121,198,.1)" stroke="#ff79c6" strokeWidth="2"/>
              <path d="M10 180 L95 118" stroke="#ff79c6" strokeWidth="1.5" opacity=".4"/>
              <path d="M250 180 L165 118" stroke="#ff79c6" strokeWidth="1.5" opacity=".4"/>
              <circle cx="130" cy="85" r="16" fill="rgba(255,45,120,.2)" stroke="#ff2d78" strokeWidth="1.5"/>
              <path d="M130 80 C128 77 123 77 123 82 C123 87 130 93 130 93 C130 93 137 87 137 82 C137 77 132 77 130 80 Z" fill="#ff2d78"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#c2185b', fontWeight: 700, fontSize: 'clamp(.9rem,2.5vw,1.15rem)' }}>Tap to open 💌</p>
            <p style={{ color: 'rgba(150,50,100,.5)', fontSize: 'clamp(.6rem,1.6vw,.8rem)', marginTop: 4 }}>A letter just for you</p>
          </div>
        </div>
      )}

      {/* ── LETTER CARD — both scratch + revealed stages ── */}
      {(stage === 'scratch' || stage === 'revealed') && (
        <div style={{ position: 'relative', width: 'min(420px, 92vw)', zIndex: 10 }}>

          {/* Letter content (always visible underneath) */}
          <div style={{
            background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,121,198,.4)', borderRadius: 20,
            padding: 'clamp(20px,5vw,32px)',
            boxShadow: '0 8px 48px rgba(200,80,150,.25)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(12px,3vw,20px)' }}>
              <div style={{ fontSize: 'clamp(2rem,7vw,3.2rem)', lineHeight: 1, marginBottom: 8 }}>💌</div>
              <div style={{ fontWeight: 700, fontSize: 'clamp(1rem,3vw,1.3rem)', color: '#c2185b' }}>For You 💖</div>
            </div>

            <div style={{ color: '#4a1030', lineHeight: 1.75, fontSize: 'clamp(.8rem,2.2vw,1rem)' }}>
              <p style={{ fontStyle: 'italic', opacity: .65, marginBottom: 10 }}>Dear you,</p>
              <p style={{ fontWeight: 300, marginBottom: 12 }}>"{message}"</p>
              <p style={{ opacity: .6, fontSize: 'clamp(.72rem,1.9vw,.9rem)', marginBottom: 8 }}>
                There are feelings that words can barely carry — this is one of them. But I tried anyway, because you deserve to know.
              </p>
              <p style={{ opacity: .6, fontSize: 'clamp(.72rem,1.9vw,.9rem)' }}>
                Wishing you all the warmth and joy in the world, every single day.
              </p>
              <p style={{ textAlign: 'right', marginTop: 16, fontStyle: 'italic', color: '#c2185b', fontSize: 'clamp(.75rem,2vw,.9rem)' }}>
                With love ❤️
              </p>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 'clamp(1.2rem,4vw,1.8rem)' }}>💕 💖 💗</div>

            {stage === 'revealed' && (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button
                  onClick={() => onReveal?.()}
                  style={{
                    background: 'linear-gradient(135deg,#ff79c6,#c2185b)', color: 'white',
                    border: 'none', borderRadius: 20, padding: '8px 24px',
                    cursor: 'pointer', fontWeight: 600, fontSize: 'clamp(.7rem,1.8vw,.85rem)',
                  }}
                >Today's Message 💌</button>
              </div>
            )}
          </div>

          {/* ── Scratch overlay canvas ── */}
          {stage === 'scratch' && (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  cursor: 'crosshair',
                  zIndex: 20,
                  touchAction: 'none',
                  display: 'block',
                  userSelect: 'none',
                }}
              />
              {scratchPct > 2 && (
                <div style={{
                  position: 'absolute', bottom: -30, left: 0, right: 0,
                  textAlign: 'center', fontSize: '0.72rem',
                  color: 'rgba(194,24,91,0.85)', pointerEvents: 'none',
                  fontStyle: 'italic',
                }}>
                  {scratchPct < 50
                    ? `${scratchPct}% revealed — keep scratching!`
                    : 'Almost there…'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
