import { useState, useRef, useEffect } from 'react';
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

const SCRATCH_R = 36; // bigger = easier to scratch

type Stage = 'envelope' | 'scratch' | 'revealed';

interface P { message: string; onReveal?: () => void }

export default function LoveLetter({ message, onReveal }: P) {
  const [stage, setStage]         = useState<Stage>('envelope');
  const [scratchPct, setScratchPct] = useState(0);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const stageRef    = useRef<Stage>('envelope'); // mirror for native listeners

  // keep stageRef in sync
  useEffect(() => { stageRef.current = stage; }, [stage]);

  /* ──────────────────────────────────────────────────────
     Envelope click  →  GSAP  →  scratch stage
  ────────────────────────────────────────────────────── */
  const openEnvelope = () => {
    if (stageRef.current !== 'envelope') return;
    const env = envelopeRef.current;
    if (!env) return;
    gsap.timeline()
      .to(env, { scale: 1.12, rotation: 8,  duration: .18, ease: 'power1.out' })
      .to(env, { scale: .85,  rotation: -5, duration: .13 })
      .to(env, { scale: 0, opacity: 0, rotation: 15, y: -30, duration: .35, ease: 'back.in(1.4)',
        onComplete: () => setStage('scratch'),
      });
  };

  /* ──────────────────────────────────────────────────────
     Canvas init + native event listeners
     (runs whenever stage becomes 'scratch')
  ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (stage !== 'scratch') return;

    // wait one frame so the canvas is in the DOM and has layout
    const raf = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      /* ── size the canvas to match its CSS rendered size ── */
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.round(rect.width);
      canvas.height = Math.round(rect.height);

      /* ── draw the cover layer ── */
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#d81b60';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // shimmer blobs
      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          35 + Math.random() * 55, 0, Math.PI * 2,
        );
        ctx.fill();
      }

      // instruction text
      ctx.textAlign    = 'center';
      ctx.font         = 'bold 15px Georgia, serif';
      ctx.fillStyle    = 'rgba(255,255,255,0.72)';
      ctx.fillText('✦ scratch to reveal ✦', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font         = '12px Georgia, serif';
      ctx.fillStyle    = 'rgba(255,255,255,0.45)';
      ctx.fillText('hold & drag  •  or swipe with finger', canvas.width / 2, canvas.height / 2 + 14);

      /* ── scratch helpers ── */
      let drawing = false;
      let done    = false;

      const toCanvas = (clientX: number, clientY: number) => {
        const r = canvas.getBoundingClientRect();
        const sx = canvas.width  / r.width;
        const sy = canvas.height / r.height;
        return { x: (clientX - r.left) * sx, y: (clientY - r.top) * sy };
      };

      const scratchAt = (cx: number, cy: number) => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx, cy, SCRATCH_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      };

      const checkDone = () => {
        if (done) return;
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let cleared = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] < 128) cleared++;
        }
        const pct = Math.round((cleared / (pixels.length / 4)) * 100);
        setScratchPct(pct);
        if (pct >= 60) {
          done = true;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setStage('revealed');
        }
      };

      /* ── mouse ── */
      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        drawing = true;
        const { x, y } = toCanvas(e.clientX, e.clientY);
        scratchAt(x, y);
      };
      const onMouseMove = (e: MouseEvent) => {
        if (!drawing) return;
        const { x, y } = toCanvas(e.clientX, e.clientY);
        scratchAt(x, y);
        checkDone();
      };
      const onMouseUp = () => {
        drawing = false;
        checkDone();
      };

      /* ── touch ── */
      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        drawing = true;
        const t = e.touches[0];
        const { x, y } = toCanvas(t.clientX, t.clientY);
        scratchAt(x, y);
      };
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (!drawing) return;
        const t = e.touches[0];
        const { x, y } = toCanvas(t.clientX, t.clientY);
        scratchAt(x, y);
        checkDone();
      };
      const onTouchEnd = () => {
        drawing = false;
        checkDone();
      };

      /* attach — mousemove/up on window so dragging outside card works */
      canvas.addEventListener('mousedown',  onMouseDown);
      window.addEventListener('mousemove',  onMouseMove);
      window.addEventListener('mouseup',    onMouseUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd);

      /* store detach fn on the canvas element itself for cleanup */
      (canvas as any)._cleanup = () => {
        canvas.removeEventListener('mousedown',  onMouseDown);
        window.removeEventListener('mousemove',  onMouseMove);
        window.removeEventListener('mouseup',    onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove',  onTouchMove);
        canvas.removeEventListener('touchend',   onTouchEnd);
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      const canvas = canvasRef.current;
      if (canvas && (canvas as any)._cleanup) (canvas as any)._cleanup();
    };
  }, [stage]);

  /* ──────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────── */
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

      {/* ── LETTER CARD (scratch + revealed) ── */}
      {(stage === 'scratch' || stage === 'revealed') && (
        <div style={{ position: 'relative', width: 'min(420px, 92vw)', zIndex: 10 }}>

          {/* Letter content */}
          <div style={{
            background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(16px)',
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

          {/* Scratch canvas overlay — native events wired in useEffect */}
          {stage === 'scratch' && (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  borderRadius: 20,
                  cursor: 'crosshair',
                  zIndex: 20,
                  touchAction: 'none',
                  display: 'block',
                }}
              />
              {scratchPct > 0 && (
                <div style={{
                  position: 'absolute', bottom: -28, left: 0, right: 0,
                  textAlign: 'center', fontSize: '0.72rem',
                  color: 'rgba(194,24,91,0.8)', pointerEvents: 'none',
                }}>
                  {scratchPct < 45
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
