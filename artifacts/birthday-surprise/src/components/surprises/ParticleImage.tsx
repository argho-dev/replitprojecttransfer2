import { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  r: number; g: number; b: number; a: number;
  vx: number;
  vy: number;
  size: number;
}

type AnimState = 'idle' | 'dispersing' | 'returning';

interface Props {
  src: string;
  maxW: number;
  maxH: number;
}

export default function ParticleImage({ src, maxW, maxH }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const particles   = useRef<Particle[]>([]);
  const animState   = useRef<AnimState>('idle');
  const rafId       = useRef<number>(0);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef      = useRef<HTMLImageElement | null>(null);
  const [ready, setReady]     = useState(false);
  const [active, setActive]   = useState(false);
  const dimRef = useRef({ w: 0, h: 0 });

  /* ── Build particles from image pixels ─────────────────── */
  const buildParticles = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Scale image to fit within maxW × maxH, preserving aspect ratio */
    const ratio  = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const W = Math.round(img.naturalWidth  * ratio);
    const H = Math.round(img.naturalHeight * ratio);
    dimRef.current = { w: W, h: H };

    /* Off-screen canvas to sample pixels */
    const off = document.createElement('canvas');
    off.width  = W;
    off.height = H;
    const oc = off.getContext('2d')!;
    oc.drawImage(img, 0, 0, W, H);
    const { data } = oc.getImageData(0, 0, W, H);

    /* GAP controls density → particle count ≈ (W/GAP)×(H/GAP) */
    const target = Math.min(window.innerWidth < 600 ? 1800 : 2800, (W * H) / 4);
    const GAP    = Math.max(2, Math.round(Math.sqrt((W * H) / target)));

    const list: Particle[] = [];
    for (let py = 0; py < H; py += GAP) {
      for (let px = 0; px < W; px += GAP) {
        const idx = (py * W + px) * 4;
        const a   = data[idx + 3];
        if (a < 30) continue;
        list.push({
          x: px, y: py,
          originX: px, originY: py,
          r: data[idx], g: data[idx + 1], b: data[idx + 2], a,
          vx: 0, vy: 0,
          size: GAP,
        });
      }
    }
    particles.current = list;

    /* Size the visible canvas */
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    /* Draw initial image cleanly */
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.drawImage(img, 0, 0, W, H);

    setReady(true);
  }, [maxW, maxH]);

  /* ── Load image ─────────────────────────────────────────── */
  useEffect(() => {
    const img  = new Image();
    img.src    = src;
    imgRef.current = img;
    img.onload = () => buildParticles(img);
    return () => {
      cancelAnimationFrame(rafId.current);
      if (returnTimer.current) clearTimeout(returnTimer.current);
    };
  }, [src, buildParticles]);

  /* ── Animation loop ─────────────────────────────────────── */
  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d')!;
    const dpr  = window.devicePixelRatio || 1;
    const { w, h } = dimRef.current;

    ctx.clearRect(0, 0, w * dpr, h * dpr);

    const state = animState.current;
    const list  = particles.current;
    let settled = true;

    ctx.save();
    ctx.scale(dpr, dpr);

    for (const p of list) {
      if (state === 'dispersing') {
        /* Wind: bias rightward + upward, turbulence */
        p.vx += (Math.random() - 0.25) * 3.2 + 1.2;
        p.vy += (Math.random() - 0.72) * 3.2;
        /* Drag */
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x  += p.vx;
        p.y  += p.vy;
        settled = false;

      } else if (state === 'returning') {
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        /* Spring pull */
        p.vx = p.vx * 0.72 + dx * 0.18;
        p.vy = p.vy * 0.72 + dy * 0.18;
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(dx) > 0.8 || Math.abs(dy) > 0.8) settled = false;
      }

      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a / 255})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    ctx.restore();

    /* Snap to original image when fully reassembled */
    if (state === 'returning' && settled) {
      animState.current = 'idle';
      setActive(false);
      /* Snap particles to origins then redraw clean image */
      for (const p of list) { p.x = p.originX; p.y = p.originY; p.vx = 0; p.vy = 0; }
      const img = imgRef.current;
      if (img) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
      }
      return;
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  /* ── Trigger ─────────────────────────────────────────────── */
  const trigger = useCallback(() => {
    if (!ready || animState.current !== 'idle') return;

    /* Give each particle a random burst + wind bias */
    for (const p of particles.current) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 10;
      p.vx = Math.cos(angle) * speed + 4;
      p.vy = Math.sin(angle) * speed - 3;
    }

    animState.current = 'dispersing';
    setActive(true);
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(tick);

    /* Switch to return phase after 2.6 s */
    if (returnTimer.current) clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(() => {
      animState.current = 'returning';
    }, 2600);
  }, [ready, tick]);

  return (
    <div
      onClick={trigger}
      onTouchEnd={e => { e.preventDefault(); trigger(); }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        cursor: ready && !active ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 2 }} />

      {/* Hint badge — only when idle & ready */}
      {ready && !active && (
        <div style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          fontSize: 9,
          color: 'rgba(255,255,255,0.85)',
          background: 'rgba(0,0,0,0.38)',
          padding: '2px 6px',
          borderRadius: 6,
          pointerEvents: 'none',
          letterSpacing: '0.05em',
          fontFamily: 'Georgia, serif',
        }}>
          tap ✦
        </div>
      )}
    </div>
  );
}
