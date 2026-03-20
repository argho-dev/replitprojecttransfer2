import { useState, useRef, useEffect, useCallback } from 'react';
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

const SCRATCH_RADIUS = 30;

type Stage = 'envelope' | 'scratch' | 'revealed';

interface P { message: string; onReveal?: () => void }

export default function LoveLetter({ message, onReveal }: P) {
  const [stage, setStage] = useState<Stage>('envelope');
  const [scratchPct, setScratchPct] = useState(0);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const letterRef   = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const isDrawing   = useRef(false);
  const doneRef     = useRef(false);

  /* ── Init scratch canvas once scratch stage mounts ── */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width  = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Pink cover */
    ctx.fillStyle = '#e91e8c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Soft shimmer circles */
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        40 + Math.random() * 60, 0, Math.PI * 2,
      );
      ctx.fill();
    }

    /* Hint text */
    ctx.font      = 'bold 1rem Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('✦ scratch to reveal ✦', canvas.width / 2, canvas.height / 2 - 12);
    ctx.font      = '0.78rem Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('drag with finger or mouse', canvas.width / 2, canvas.height / 2 + 14);
  }, []);

  useEffect(() => {
    if (stage !== 'scratch') return;
    /* small delay so the letter div is fully painted before we measure it */
    const t = setTimeout(initCanvas, 80);
    return () => clearTimeout(t);
  }, [stage, initCanvas]);

  /* ── Envelope click → GSAP → scratch stage ── */
  const openEnvelope = (e: React.MouseEvent) => {
    if (stage !== 'envelope') return;
    const env = envelopeRef.current;
    if (!env) return;

    gsap.timeline()
      .to(env, { scale: 1.12, rotation: 8,   duration: .18, ease: 'power1.out' })
      .to(env, { scale: .85,  rotation: -5,  duration: .13 })
      .to(env, { scale: 0,    opacity: 0, rotation: 15, y: -30, duration: .35, ease: 'back.in(1.4)',
        onComplete: () => setStage('scratch'),
      });
  };

  /* ── Scratch helpers ── */
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    const m = e as React.MouseEvent;
    return { x: (m.clientX - rect.left) * scaleX, y: (m.clientY - rect.top) * scaleY };
  };

  const doScratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || doneRef.current) return;
    const ctx  = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    const pct = Math.round((transparent / (data.length / 4)) * 100);
    setScratchPct(pct);
    if (pct >= 65) {
      doneRef.current = true;
      /* clear canvas so revealed message is clean */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setStage('revealed');
    }
  }, []);

  const onMD  = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const p = getPos(e, e.currentTarget); doScratch(p.x, p.y);
  };
  const onMM  = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const p = getPos(e, e.currentTarget); doScratch(p.x, p.y); checkReveal();
  };
  const onMU  = () => { isDrawing.current = false; checkReveal(); };
  const onTS  = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); isDrawing.current = true;
    const p = getPos(e, e.currentTarget); doScratch(p.x, p.y);
  };
  const onTM  = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const p = getPos(e, e.currentTarget); doScratch(p.x, p.y); checkReveal();
  };
  const onTE  = () => { isDrawing.current = false; checkReveal(); };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
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
          <p style={{ color: '#9d4b7a', fontSize: 'clamp(.85rem,2.5vw,1.1rem)', fontStyle: 'italic', opacity: .8, animation: 'hintFade 2s ease-in-out infinite' }}>
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

      {/* ── LETTER + SCRATCH OVERLAY (scratch & revealed stages) ── */}
      {(stage === 'scratch' || stage === 'revealed') && (
        <div
          ref={letterRef}
          style={{
            position: 'relative',
            width: 'min(420px, 92vw)',
            zIndex: 10,
          }}
        >
          {/* Letter card */}
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

          {/* Scratch canvas — only while scratching */}
          {stage === 'scratch' && (
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                borderRadius: 20,
                cursor: 'crosshair',
                zIndex: 20,
                touchAction: 'none',
              }}
              onMouseDown={onMD}
              onMouseMove={onMM}
              onMouseUp={onMU}
              onMouseLeave={onMU}
              onTouchStart={onTS}
              onTouchMove={onTM}
              onTouchEnd={onTE}
            />
          )}

          {/* Scratch progress hint */}
          {stage === 'scratch' && scratchPct > 0 && (
            <div style={{
              position: 'absolute', bottom: -30, left: 0, right: 0,
              textAlign: 'center', fontSize: '0.72rem',
              color: 'rgba(194,24,91,0.75)', pointerEvents: 'none',
            }}>
              {scratchPct < 50 ? `${scratchPct}% revealed — keep scratching!` : 'Almost there…'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
