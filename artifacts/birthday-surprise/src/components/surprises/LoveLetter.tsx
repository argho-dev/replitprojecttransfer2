import { useRef, useEffect, useState, useCallback } from 'react';

const KF = `
@keyframes petalDrift{0%{transform:translateY(-30px) rotate(0deg);opacity:0}8%{opacity:1}92%{opacity:.8}100%{transform:translateY(110vh) rotate(var(--rot));opacity:0}}
@keyframes scratchHint{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
`;

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.6) % 96}%`,
  dur: 5 + (i % 5) * 1.3,
  delay: -(i * 0.6),
  rot: `${(i % 2 ? 1 : -1) * (180 + i * 30)}deg`,
}));

const SCRATCH_RADIUS = 28;

interface P { message: string; onReveal?: () => void }

export default function LoveLetter({ message, onReveal }: P) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratchPct, setScratchPct] = useState(0);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,105,170,0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        40 + Math.random() * 60,
        0, Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.font = 'bold 1rem serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('✦ scratch to reveal ✦', canvas.width / 2, canvas.height / 2 - 14);
    ctx.font = '0.78rem serif';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText('use your finger or mouse', canvas.width / 2, canvas.height / 2 + 12);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    initCanvas();
  }, [initCanvas]);

  const getScratchPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  const checkRevealPct = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    const pct = Math.round((transparent / (data.length / 4)) * 100);
    setScratchPct(pct);
    if (pct > 55 && !revealedRef.current) {
      revealedRef.current = true;
      setRevealed(true);
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const pos = getScratchPos(e, e.currentTarget);
    scratch(pos.x, pos.y);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const pos = getScratchPos(e, e.currentTarget);
    scratch(pos.x, pos.y);
    checkRevealPct();
  };
  const onMouseUp = () => { isDrawing.current = false; checkRevealPct(); };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getScratchPos(e, e.currentTarget);
    scratch(pos.x, pos.y);
  };
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getScratchPos(e, e.currentTarget);
    scratch(pos.x, pos.y);
    checkRevealPct();
  };
  const onTouchEnd = () => { isDrawing.current = false; checkRevealPct(); };

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

      {/* Letter content — always underneath */}
      <div style={{
        position: 'relative',
        width: 'min(420px, 92vw)',
        zIndex: 10,
      }}>
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

          {revealed && (
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

        {/* Scratch canvas overlay */}
        {!revealed && (
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
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        )}

        {/* Progress hint */}
        {!revealed && scratchPct > 0 && (
          <div style={{
            position: 'absolute', bottom: -28, left: 0, right: 0,
            textAlign: 'center', fontSize: '0.72rem',
            color: 'rgba(194,24,91,0.7)', pointerEvents: 'none',
          }}>
            {scratchPct < 55 ? `${scratchPct}% revealed — keep scratching!` : 'Almost there…'}
          </div>
        )}
      </div>
    </div>
  );
}
