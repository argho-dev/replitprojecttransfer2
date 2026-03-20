import { useEffect, useRef } from 'react';

type BgMode =
  | 'petals'
  | 'snow'
  | 'hearts'
  | 'particles'
  | 'fireflies'
  | 'stardust'
  | 'bubbles'
  | 'aurora'
  | 'birthday';

const MODES: BgMode[] = [
  'petals',
  'snow',
  'hearts',
  'particles',
  'fireflies',
  'stardust',
  'bubbles',
  'aurora',
];

const SESSION_BG_KEY  = 'bday_session_bg';
const HISTORY_BG_KEY  = 'bday_bg_history';
const AVOID_LAST_N    = 4; // never repeat any of the last 4 picks

export function getDailyBgMode(): BgMode {
  const now = new Date();
  if (now.getMonth() === 2 && now.getDate() === 31) return 'birthday';

  // Within the same page session, keep the same background
  const sessionPick = sessionStorage.getItem(SESSION_BG_KEY) as BgMode | null;
  if (sessionPick && (MODES as string[]).includes(sessionPick)) return sessionPick;

  // Build a pool excluding recently used modes
  const historyRaw = localStorage.getItem(HISTORY_BG_KEY);
  const history: BgMode[] = historyRaw ? JSON.parse(historyRaw) : [];
  const recentSet = new Set(history.slice(-AVOID_LAST_N));
  const pool = MODES.filter(m => !recentSet.has(m));
  const candidates = pool.length > 0 ? pool : MODES;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  // Persist history (cap at 20 entries)
  history.push(pick);
  if (history.length > 20) history.splice(0, history.length - 20);
  localStorage.setItem(HISTORY_BG_KEY, JSON.stringify(history));

  // Persist for this session
  sessionStorage.setItem(SESSION_BG_KEY, pick);

  return pick;
}

/* ─── Petal Rain ─────────────────────────────────────── */
function drawPetals(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Petal {
    x: number; y: number;
    w: number; h: number;
    rot: number; rotSpeed: number;
    vx: number; vy: number;
    sway: number; swayOffset: number;
    opacity: number; color: string;
  }
  const colors = ['#ffb7c5', '#ffccd5', '#ff8fab', '#ffc8dd', '#ff99aa', '#ffb3c6', '#fff0f3'];
  const petals: Petal[] = [];
  for (let i = 0; i < 55; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 12 + 7,
      h: Math.random() * 7 + 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.5 + 0.7,
      sway: Math.random() * 1.5 + 0.5,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.45 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  let t = 0;
  return () => {
    t += 0.015;
    for (const p of petals) {
      p.x += p.vx + Math.sin(t * p.sway + p.swayOffset) * 0.6;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // petal shimmer highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-p.w * 0.1, -p.h * 0.1, p.w * 0.2, p.h * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };
}

/* ─── Snow Falls ─────────────────────────────────────── */
function drawSnow(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Flake {
    x: number; y: number;
    r: number; vy: number;
    vx: number; sway: number;
    swayOffset: number; opacity: number;
  }
  const flakes: Flake[] = [];
  for (let i = 0; i < 90; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1.5,
      vy: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * 0.8 + 0.3,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.15,
    });
  }
  let t = 0;
  return () => {
    t += 0.012;
    for (const f of flakes) {
      f.x += f.vx + Math.sin(t * f.sway + f.swayOffset) * 0.4;
      f.y += f.vy;
      if (f.y > canvas.height + 10) {
        f.y = -10;
        f.x = Math.random() * canvas.width;
      }
      // glow
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.5);
      grad.addColorStop(0, `rgba(200,230,255,${f.opacity})`);
      grad.addColorStop(1, `rgba(180,210,255,0)`);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // core
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${f.opacity * 1.4})`;
      ctx.fill();
    }
  };
}

/* ─── Floating Hearts ────────────────────────────────── */
function drawHearts(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Heart {
    x: number; y: number;
    size: number; vy: number;
    vx: number; sway: number;
    swayOffset: number; opacity: number;
    rotation: number; rotSpeed: number;
    color: string;
  }
  const heartColors = ['255,105,180', '255,20,147', '220,80,150', '255,150,180', '200,60,130'];
  const hearts: Heart[] = [];
  for (let i = 0; i < 40; i++) {
    const c = heartColors[Math.floor(Math.random() * heartColors.length)];
    hearts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      size: Math.random() * 16 + 7,
      vy: -(Math.random() * 1.0 + 0.5),
      vx: (Math.random() - 0.5) * 0.6,
      sway: Math.random() * 0.8 + 0.3,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * 0.4 - 0.2,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      color: c,
    });
  }
  const drawHeart = (x: number, y: number, size: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.35);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.1, -size, size * 0.35, 0, size);
    ctx.bezierCurveTo(size, size * 0.35, size * 0.5, -size * 0.1, 0, size * 0.35);
    ctx.closePath();
    ctx.restore();
  };
  let t = 0;
  return () => {
    t += 0.012;
    for (const h of hearts) {
      h.x += h.vx + Math.sin(t * h.sway + h.swayOffset) * 0.5;
      h.y += h.vy;
      h.rotation += h.rotSpeed;
      if (h.y < -h.size * 2) {
        h.y = canvas.height + h.size;
        h.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.globalAlpha = h.opacity;
      drawHeart(h.x, h.y, h.size, h.rotation);
      const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.size * 1.5);
      grad.addColorStop(0, `rgba(${h.color},${h.opacity * 1.5})`);
      grad.addColorStop(1, `rgba(${h.color},0)`);
      ctx.fillStyle = `rgba(${h.color}, ${h.opacity})`;
      ctx.fill();
      ctx.restore();
    }
  };
}

/* ─── Glowing Particles ──────────────────────────────── */
function drawParticles(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Particle {
    x: number; y: number;
    r: number; vx: number; vy: number;
    opacity: number; color: string;
    life: number; maxLife: number;
    phase: number;
  }
  const pColors = [
    '255,121,198', '189,147,249', '139,233,253', '255,184,108', '80,250,123',
  ];
  const particles: Particle[] = [];
  const spawn = () => {
    const c = pColors[Math.floor(Math.random() * pColors.length)];
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      opacity: 0,
      color: c,
      life: 0,
      maxLife: Math.random() * 200 + 150,
      phase: Math.random() * Math.PI * 2,
    });
  };
  for (let i = 0; i < 60; i++) spawn();
  let t = 0;
  return () => {
    t += 0.018;
    while (particles.length < 60) spawn();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const progress = p.life / p.maxLife;
      p.opacity = progress < 0.2
        ? (progress / 0.2) * 0.6
        : progress > 0.8
          ? ((1 - progress) / 0.2) * 0.6
          : 0.6;
      const pulse = (Math.sin(t * 3 + p.phase) + 1) / 2;
      const displayR = p.r * (0.8 + pulse * 0.4);
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, displayR * 5);
      glow.addColorStop(0, `rgba(${p.color},${p.opacity})`);
      glow.addColorStop(1, `rgba(${p.color},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, displayR * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, displayR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.9})`;
      ctx.fill();
    }
  };
}

/* ─── Fireflies ──────────────────────────────────────── */
function drawFireflies(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Fly {
    x: number; y: number;
    tx: number; ty: number;
    speed: number; r: number;
    opacity: number; phase: number;
    color: string;
  }
  const flyColors = ['180,255,180', '255,255,150', '180,255,220', '220,255,180'];
  const flies: Fly[] = [];
  for (let i = 0; i < 45; i++) {
    const c = flyColors[Math.floor(Math.random() * flyColors.length)];
    flies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      tx: Math.random() * canvas.width,
      ty: Math.random() * canvas.height,
      speed: Math.random() * 0.6 + 0.2,
      r: Math.random() * 2.5 + 1,
      opacity: 0,
      phase: Math.random() * Math.PI * 2,
      color: c,
    });
  }
  let t = 0;
  return () => {
    t += 0.018;
    for (const f of flies) {
      const dx = f.tx - f.x;
      const dy = f.ty - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) {
        f.tx = Math.random() * canvas.width;
        f.ty = Math.random() * canvas.height * 0.85;
      }
      f.x += (dx / dist) * f.speed;
      f.y += (dy / dist) * f.speed;
      // blink
      const blink = (Math.sin(t * 1.5 + f.phase) + 1) / 2;
      f.opacity = Math.pow(blink, 2) * 0.75;
      if (f.opacity < 0.02) continue;
      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 8);
      glow.addColorStop(0, `rgba(${f.color},${f.opacity})`);
      glow.addColorStop(0.4, `rgba(${f.color},${f.opacity * 0.3})`);
      glow.addColorStop(1, `rgba(${f.color},0)`);
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,255,220,${f.opacity})`;
      ctx.fill();
    }
  };
}

/* ─── Stardust Sparkles ──────────────────────────────── */
function drawStardust(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Sparkle {
    x: number; y: number;
    r: number; life: number;
    maxLife: number; rotation: number;
    color: string;
  }
  const sparkColors = ['255,215,0', '255,192,203', '255,255,255', '173,216,230', '255,182,193'];
  const sparkles: Sparkle[] = [];
  const spawn = () => {
    sparkles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 6 + 3,
      life: 0,
      maxLife: Math.random() * 80 + 60,
      rotation: Math.random() * Math.PI,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
    });
  };
  for (let i = 0; i < 40; i++) {
    const s = { x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 6 + 3, life: Math.floor(Math.random() * 80),
      maxLife: Math.random() * 80 + 60, rotation: Math.random() * Math.PI,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)] };
    sparkles.push(s);
  }
  return () => {
    if (sparkles.length < 40 && Math.random() < 0.3) spawn();
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life++;
      if (s.life >= s.maxLife) { sparkles.splice(i, 1); continue; }
      const prog = s.life / s.maxLife;
      const opacity = prog < 0.3
        ? (prog / 0.3) * 0.9
        : prog > 0.7
          ? ((1 - prog) / 0.3) * 0.9
          : 0.9;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation + prog * Math.PI * 0.5);
      ctx.globalAlpha = opacity;
      const arm = s.r * (1 - prog * 0.3);
      ctx.strokeStyle = `rgba(${s.color}, 1)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${s.color}, 0.8)`;
      for (let a = 0; a < 4; a++) {
        ctx.save();
        ctx.rotate((a * Math.PI) / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -arm);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  };
}

/* ─── Bubbles ────────────────────────────────────────── */
function drawBubbles(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface Bubble {
    x: number; y: number; r: number;
    vy: number; sway: number; swayOffset: number;
    opacity: number; color: string;
  }
  const bubbleColors = ['255,121,198', '189,147,249', '139,233,253'];
  const bubbles: Bubble[] = [];
  for (let i = 0; i < 35; i++) {
    const c = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height + canvas.height,
      r: Math.random() * 20 + 8,
      vy: -(Math.random() * 0.8 + 0.3),
      sway: Math.random() * 0.5 + 0.2,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.18 + 0.06,
      color: c,
    });
  }
  let t = 0;
  return () => {
    t += 0.012;
    for (const b of bubbles) {
      b.x += Math.sin(t * b.sway + b.swayOffset) * 0.6;
      b.y += b.vy;
      if (b.y < -b.r * 2) {
        b.y = canvas.height + b.r;
        b.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.globalAlpha = b.opacity;
      // outline
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${b.color}, 0.7)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // inner glow
      const inner = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
      inner.addColorStop(0, `rgba(255,255,255,0.2)`);
      inner.addColorStop(1, `rgba(${b.color},0.05)`);
      ctx.fillStyle = inner;
      ctx.fill();
      ctx.restore();
    }
  };
}

/* ─── Aurora (CSS gradient, no canvas) ──────────────── */
// Handled via inline div in the JSX render

/* ─── Birthday Special ───────────────────────────────── */
function drawBirthday(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  interface GoldParticle {
    x: number; y: number; r: number;
    vy: number; vx: number; opacity: number;
    color: string; phase: number;
  }
  const goldColors = ['255,215,0', '255,180,50', '255,200,100', '255,100,180', '255,150,200'];
  const golds: GoldParticle[] = [];
  for (let i = 0; i < 80; i++) {
    const c = goldColors[Math.floor(Math.random() * goldColors.length)];
    golds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 2 - canvas.height,
      r: Math.random() * 3 + 1,
      vy: -(Math.random() * 0.6 + 0.2),
      vx: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
      color: c,
      phase: Math.random() * Math.PI * 2,
    });
  }
  // Glowing orbs
  interface Orb { x: number; y: number; r: number; phase: number; color: string; }
  const orbs: Orb[] = [];
  for (let i = 0; i < 6; i++) {
    orbs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 80 + 60,
      phase: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? '255,180,50' : '255,80,150',
    });
  }
  let t = 0;
  return () => {
    t += 0.016;
    // Draw orbs
    for (const o of orbs) {
      const pulse = (Math.sin(t * 0.7 + o.phase) + 1) / 2;
      const r = o.r * (0.85 + pulse * 0.3);
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      grad.addColorStop(0, `rgba(${o.color},0.06)`);
      grad.addColorStop(1, `rgba(${o.color},0)`);
      ctx.beginPath();
      ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    // Draw gold particles
    for (const g of golds) {
      g.x += g.vx;
      g.y += g.vy;
      if (g.y < -10) { g.y = canvas.height + 10; g.x = Math.random() * canvas.width; }
      const pulse = (Math.sin(t * 3 + g.phase) + 1) / 2;
      const ro = g.r * (0.7 + pulse * 0.6);
      const glow = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, ro * 5);
      glow.addColorStop(0, `rgba(${g.color},${g.opacity})`);
      glow.addColorStop(1, `rgba(${g.color},0)`);
      ctx.beginPath();
      ctx.arc(g.x, g.y, ro * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(g.x, g.y, ro, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${g.opacity * 0.9})`;
      ctx.fill();
    }
  };
}

/* ─── Component ──────────────────────────────────────── */
interface DailyBackgroundProps {
  mode?: BgMode;
}

export default function DailyBackground({ mode: propMode }: DailyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mode = propMode ?? getDailyBgMode();

  useEffect(() => {
    if (mode === 'aurora') return; // aurora is CSS only

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawFns: Record<Exclude<BgMode, 'aurora'>, (c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => () => void> = {
      petals: drawPetals,
      snow: drawSnow,
      hearts: drawHearts,
      particles: drawParticles,
      fireflies: drawFireflies,
      stardust: drawStardust,
      bubbles: drawBubbles,
      birthday: drawBirthday,
    };

    const tick = drawFns[mode as Exclude<BgMode, 'aurora'>](canvas, ctx);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [mode]);

  if (mode === 'aurora') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'transparent',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 30% 60%, rgba(80,0,80,0.18) 0%, transparent 70%)',
          animation: 'auroraShift1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 40% at 70% 40%, rgba(0,60,100,0.15) 0%, transparent 70%)',
          animation: 'auroraShift2 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 35% at 50% 80%, rgba(120,0,60,0.12) 0%, transparent 70%)',
          animation: 'auroraShift3 18s ease-in-out infinite',
        }} />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
