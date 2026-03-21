import { useEffect, useRef, useState } from 'react';

/* ── Heart parametric curve ─────────────────────────────── */
function heartPoint(t: number, scale: number, cx: number, cy: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x: cx + x * scale, y: cy + y * scale };
}

function generateHeartPoints(n: number, cx: number, cy: number, scale: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push(heartPoint(t, scale, cx, cy));
  }
  return pts;
}

interface Particle {
  x: number; y: number;
  originX: number; originY: number;
  targetX: number; targetY: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  size: number;
}

type Phase = 'disperse' | 'form' | 'reveal' | 'done';

interface Props {
  imageSrc: string;
  onDismiss: () => void;
}

export default function HeartFormation({ imageSrc, onDismiss }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const particles   = useRef<Particle[]>([]);
  const phaseRef    = useRef<Phase>('disperse');
  const rafRef      = useRef<number>(0);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartPts    = useRef<{ x: number; y: number }[]>([]);
  const revealAlpha = useRef(0);
  const glowPulse   = useRef(0);
  const imgRef      = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const cx = W / 2;
    const cy = H / 2 + 20;
    const heartScale = Math.min(W, H) * 0.022;

    /* Load image → sample pixels → build particles */
    const img = new Image();
    img.src = imageSrc;
    imgRef.current = img;

    img.onload = () => {
      const target = window.innerWidth < 600 ? 1600 : 2400;
      const iW = Math.round(Math.min(img.naturalWidth,  280));
      const iH = Math.round(Math.min(img.naturalHeight, 280));
      const GAP = Math.max(2, Math.round(Math.sqrt((iW * iH) / target)));

      const off = document.createElement('canvas');
      off.width  = iW;
      off.height = iH;
      const oc = off.getContext('2d')!;
      oc.drawImage(img, 0, 0, iW, iH);
      const { data } = oc.getImageData(0, 0, iW, iH);

      const list: Particle[] = [];
      const startX = cx - iW / 2;
      const startY = cy - iH / 2;

      for (let py = 0; py < iH; py += GAP) {
        for (let px = 0; px < iW; px += GAP) {
          const idx = (py * iW + px) * 4;
          if (data[idx + 3] < 30) continue;
          const ox = startX + px;
          const oy = startY + py;
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 14;
          list.push({
            x: ox, y: oy,
            originX: ox, originY: oy,
            targetX: 0, targetY: 0,
            vx: Math.cos(angle) * speed + 3,
            vy: Math.sin(angle) * speed - 2,
            r: data[idx], g: data[idx + 1], b: data[idx + 2],
            size: GAP,
          });
        }
      }
      particles.current = list;

      /* Generate heart target positions (same count) */
      const hp = generateHeartPoints(list.length, cx, cy, heartScale);
      heartPts.current = hp;

      /* Sort particles by angle from center, sort heart pts by angle too → pair up */
      const sortByAngle = (arr: { x: number; y: number }[]) =>
        [...arr].sort((a, b) =>
          Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

      const sortedHeart = sortByAngle(hp);
      const sortedParts = [...list].sort((a, b) =>
        Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

      sortedParts.forEach((p, i) => {
        p.targetX = sortedHeart[i % sortedHeart.length].x;
        p.targetY = sortedHeart[i % sortedHeart.length].y;
      });

      setReady(true);
      startAnimation();
    };

    function startAnimation() {
      phaseRef.current = 'disperse';
      timerRef.current = setTimeout(() => {
        phaseRef.current = 'form';
        /* reassign targets after disperse for cleaner snap */
        timerRef.current = setTimeout(() => {
          phaseRef.current = 'reveal';
        }, 2800);
      }, 900);
      loop();
    }

    function loop() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const phase = phaseRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const list = particles.current;

      if (phase === 'disperse') {
        for (const p of list) {
          p.vx += (Math.random() - 0.3) * 2.5 + 1.0;
          p.vy += (Math.random() - 0.65) * 2.5;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.x  += p.vx;
          p.y  += p.vy;
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},0.85)`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      } else if (phase === 'form') {
        let settled = true;
        for (const p of list) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx = p.vx * 0.68 + dx * 0.16;
          p.vy = p.vy * 0.68 + dy * 0.16;
          p.x += p.vx;
          p.y += p.vy;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) settled = false;
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},0.9)`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        if (settled) phaseRef.current = 'reveal';
      } else if (phase === 'reveal' || phase === 'done') {
        glowPulse.current += 0.04;
        revealAlpha.current = Math.min(1, revealAlpha.current + 0.018);

        /* Draw particles (now in heart shape) */
        for (const p of list) {
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${0.65 - revealAlpha.current * 0.4})`;
          ctx.fillRect(p.targetX, p.targetY, p.size, p.size);
        }

        /* Clip image inside heart */
        if (imgRef.current && revealAlpha.current > 0) {
          ctx.save();
          ctx.beginPath();
          const n = 200;
          for (let i = 0; i <= n; i++) {
            const t = (i / n) * Math.PI * 2;
            const pt = heartPoint(t, heartScale, cx, cy);
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();
          ctx.clip();
          const hW = heartScale * 32;
          const hH = heartScale * 28;
          ctx.globalAlpha = revealAlpha.current;
          ctx.drawImage(imgRef.current, cx - hW / 2, cy - hH / 2 + heartScale * 2, hW, hH);
          ctx.restore();
        }

        /* Heart glow outline */
        const pulse = (Math.sin(glowPulse.current) + 1) / 2;
        const glowRadius = 8 + pulse * 12;
        ctx.save();
        ctx.beginPath();
        const n2 = 200;
        for (let i = 0; i <= n2; i++) {
          const t = (i / n2) * Math.PI * 2;
          const pt = heartPoint(t, heartScale, cx, cy);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 80, 140, ${0.55 + pulse * 0.35})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = glowRadius;
        ctx.shadowColor = 'rgba(255, 60, 120, 0.95)';
        ctx.globalAlpha = revealAlpha.current;
        ctx.stroke();
        /* Second softer glow pass */
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(255, 120, 180, ${0.2 + pulse * 0.15})`;
        ctx.shadowBlur = glowRadius * 2.5;
        ctx.stroke();
        ctx.restore();

        /* Dismiss hint */
        if (revealAlpha.current > 0.8) {
          ctx.globalAlpha = (revealAlpha.current - 0.8) / 0.2 * 0.7;
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.textAlign = 'center';
          ctx.font = '13px Georgia, serif';
          ctx.fillText('tap to close ✦', cx, cy + heartScale * 16 + 28);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [imageSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={ready ? onDismiss : undefined}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 90,
        background: 'rgba(5,2,20,0.88)',
        backdropFilter: 'blur(3px)',
        cursor: ready ? 'pointer' : 'default',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
