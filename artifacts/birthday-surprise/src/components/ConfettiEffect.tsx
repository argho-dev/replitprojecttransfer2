const COLORS = [
  '#ff79c6','#bd93f9','#8be9fd','#50fa7b',
  '#ffb86c','#ff5555','#f1fa8c','#ff92d0',
  '#ffffff','#a5f3fc','#fde68a',
];

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  rot: number; rotV: number;
  life: number; maxLife: number;
  w: number; h: number;
  shape: 'rect' | 'circle' | 'ribbon';
};

function burst(canvas: HTMLCanvasElement, ox: number, oy: number, count: number, spread: number) {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle  = (Math.random() * spread - spread / 2) - Math.PI / 2;
    const speed  = Math.random() * 14 + 5;
    const shape  = (['rect','rect','circle','ribbon'] as const)[Math.floor(Math.random()*4)];
    particles.push({
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 90 + Math.floor(Math.random() * 60),
      w: shape === 'ribbon' ? Math.random() * 3 + 2 : Math.random() * 9 + 4,
      h: shape === 'ribbon' ? Math.random() * 18 + 10 : Math.random() * 9 + 4,
      shape,
    });
  }

  const ctx = canvas.getContext('2d')!;
  let raf = 0;

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particles) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.35;
      p.vx  *= 0.985;
      p.vy  *= 0.985;
      p.rot += p.rotV;
      p.life++;

      const t = p.life / p.maxLife;
      if (t >= 1) continue;
      alive = true;

      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    if (alive) {
      raf = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  };

  raf = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(raf); };
}

export function spawnConfetti() {
  const canvas = document.createElement('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;
  const bx = canvas.width;
  const by = canvas.height;

  // Multiple burst origins: center + four corners + bottom cannons
  const origins: [number, number, number, number][] = [
    [cx,      cy,      120, Math.PI * 2],
    [0,       by,       60, Math.PI * 1.2],
    [bx,      by,       60, Math.PI * 1.2],
    [0,       cy,       40, Math.PI * 1.0],
    [bx,      cy,       40, Math.PI * 1.0],
    [cx * 0.5, by * 0.2, 50, Math.PI * 1.5],
    [cx * 1.5, by * 0.2, 50, Math.PI * 1.5],
  ];

  for (const [ox, oy, count, spread] of origins) {
    burst(canvas, ox, oy, count, spread);
  }
}

export function spawnFloatingHearts(x: number, y: number) {
  const emojis = ['❤️', '💕', '💖', '💗', '💝', '✨', '🌸'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.style.left = `${x + (Math.random() - 0.5) * 100}px`;
    el.style.top  = `${y}px`;
    el.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
    el.style.animationDelay   = `${Math.random() * 0.3}s`;
    el.style.fontSize = `${Math.random() * 1 + 1}rem`;
    el.style.position = 'fixed';
    el.style.zIndex   = '9999';
    el.style.pointerEvents = 'none';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

export default function ConfettiEffect({ active }: { active: boolean }) {
  if (!active) return null;
  return null;
}
