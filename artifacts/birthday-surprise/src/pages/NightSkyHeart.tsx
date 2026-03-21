import { useEffect, useRef, useState } from 'react';

/* ── Heart parametric ────────────────────────────────────── */
function heartPt(t: number, scale: number, cx: number, cy: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: cx + x * scale, y: cy + y * scale };
}

const HEART_STEPS = 320;
const DRAW_DURATION = 4200; // ms to trace the full heart

interface Star { x: number; y: number; r: number; phase: number; speed: number }

function makeStars(W: number, H: number, n: number): Star[] {
  return Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.6 + 0.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 1.2,
  }));
}

interface Props { onDismiss: () => void }

export default function NightSkyHeart({ onDismiss }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const startRef     = useRef<number>(0);
  const [textAlpha, setTextAlpha]   = useState(0);
  const [btnAlpha,  setBtnAlpha]    = useState(0);
  const heartDoneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d')!;

    const cx = W / 2;
    const cy = H / 2 - 30;
    const scale = Math.min(W, H) * 0.019;

    /* Pre-compute heart path */
    const heartPath: { x: number; y: number }[] = [];
    for (let i = 0; i <= HEART_STEPS; i++) {
      const t = (i / HEART_STEPS) * Math.PI * 2;
      heartPath.push(heartPt(t, scale, cx, cy));
    }

    /* Trail history */
    const trail: { x: number; y: number; alpha: number }[] = [];
    const TRAIL_LEN = 38;

    const stars = makeStars(W, H, 160);
    let t0 = performance.now();
    startRef.current = t0;
    let glowT = 0;
    let fullGlowAlpha = 0;

    const loop = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      glowT += 0.03;

      /* ── Starfield ── */
      for (const s of stars) {
        s.phase += 0.012 * s.speed;
        const blink = (Math.sin(s.phase) + 1) / 2;
        const alpha = 0.25 + blink * 0.65;
        ctx.save();
        ctx.globalAlpha = alpha;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
        grd.addColorStop(0, 'rgba(220,230,255,1)');
        grd.addColorStop(1, 'rgba(140,160,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* ── Progress along heart ── */
      const elapsed = now - t0;
      const progress = Math.min(1, elapsed / DRAW_DURATION);
      const stepIdx  = Math.floor(progress * HEART_STEPS);

      if (!heartDoneRef.current) {
        /* Moving shooting star */
        const curPt = heartPath[Math.min(stepIdx, HEART_STEPS - 1)];

        /* Append to trail */
        trail.push({ x: curPt.x, y: curPt.y, alpha: 1 });
        if (trail.length > TRAIL_LEN) trail.shift();

        /* Draw trail */
        trail.forEach((tp, i) => {
          const frac = (i + 1) / trail.length;
          tp.alpha = frac;
          ctx.save();
          ctx.globalAlpha = frac * 0.85;
          const rr = 1.5 + frac * 4;
          const grd = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, rr * 3);
          grd.addColorStop(0, 'rgba(255,160,220,1)');
          grd.addColorStop(1, 'rgba(200,80,180,0)');
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, rr * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
          ctx.restore();
        });

        /* Star head */
        ctx.save();
        const pulseStar = (Math.sin(glowT * 8) + 1) / 2;
        ctx.shadowBlur = 18 + pulseStar * 14;
        ctx.shadowColor = 'rgba(255,180,230,1)';
        ctx.globalAlpha = 0.95;
        const grd2 = ctx.createRadialGradient(curPt.x, curPt.y, 0, curPt.x, curPt.y, 9);
        grd2.addColorStop(0, 'rgba(255,255,255,1)');
        grd2.addColorStop(0.5, 'rgba(255,150,210,0.8)');
        grd2.addColorStop(1, 'rgba(200,80,180,0)');
        ctx.beginPath();
        ctx.arc(curPt.x, curPt.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = grd2;
        ctx.fill();
        ctx.restore();
      }

      /* ── After heart is complete ── */
      if (progress >= 1 && !heartDoneRef.current) {
        heartDoneRef.current = true;
      }

      if (heartDoneRef.current) {
        fullGlowAlpha = Math.min(1, fullGlowAlpha + 0.012);
        const pulse = (Math.sin(glowT) + 1) / 2;

        /* Draw full glowing heart path */
        ctx.save();
        ctx.beginPath();
        heartPath.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        ctx.strokeStyle = `rgba(255, 100, 180, ${(0.55 + pulse * 0.3) * fullGlowAlpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 18 + pulse * 16;
        ctx.shadowColor = 'rgba(255, 80, 160, 0.9)';
        ctx.globalAlpha = fullGlowAlpha;
        ctx.stroke();

        ctx.lineWidth = 7;
        ctx.strokeStyle = `rgba(255, 150, 200, ${(0.18 + pulse * 0.12) * fullGlowAlpha})`;
        ctx.shadowBlur = 40;
        ctx.stroke();
        ctx.restore();

        /* Faint heart fill */
        ctx.save();
        ctx.beginPath();
        heartPath.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        const radGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 18);
        radGrd.addColorStop(0, `rgba(255, 80, 160, ${0.10 * fullGlowAlpha})`);
        radGrd.addColorStop(1, 'rgba(255, 80, 160, 0)');
        ctx.fillStyle = radGrd;
        ctx.globalAlpha = fullGlowAlpha;
        ctx.fill();
        ctx.restore();

        /* Update react state for text fade */
        if (fullGlowAlpha > 0.3 && textAlpha < 1) {
          setTextAlpha(a => Math.min(1, a + 0.025));
        }
        if (fullGlowAlpha > 0.7 && btnAlpha < 1) {
          setBtnAlpha(a => Math.min(1, a + 0.02));
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 95,
      background: 'linear-gradient(180deg, #020411 0%, #060820 40%, #0a0420 100%)',
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

      {/* Text message */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        paddingBottom: '12vh',
        pointerEvents: 'none',
        opacity: textAlpha,
        transition: 'opacity 0.6s ease',
      }}>
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.4,
          textShadow: '0 0 20px rgba(255,120,200,0.9), 0 0 50px rgba(255,80,160,0.6)',
          letterSpacing: '0.03em',
          marginBottom: '1.5rem',
        }}>
          Every star tonight is for you,<br />
          <span style={{ color: '#ff79c6' }}>Anuska ✨</span>
        </div>
      </div>

      {/* Continue button */}
      {btnAlpha > 0.05 && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute', bottom: '5vh', left: '50%',
            transform: 'translateX(-50%)',
            opacity: btnAlpha,
            background: 'rgba(255,80,160,0.12)',
            border: '1px solid rgba(255,120,190,0.4)',
            borderRadius: 24,
            padding: '0.6rem 2rem',
            color: '#ff79c6',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(255,80,160,0.2)',
            transition: 'background 0.2s, box-shadow 0.2s',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,80,160,0.22)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(255,80,160,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,80,160,0.12)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,80,160,0.2)';
          }}
        >
          Continue ✦
        </button>
      )}
    </div>
  );
}
