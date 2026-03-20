import { useEffect, useRef, useState } from 'react';
import { spawnConfetti } from './ConfettiEffect';

const POLAROIDS = [
  {
    msg: 'Every moment with you is a blessing 💛',
    bg: 'linear-gradient(135deg, #ffd6e7 0%, #ffb3c6 100%)',
    rotate: '-3deg',
  },
  {
    msg: 'Your smile lights up every room 🌸',
    bg: 'linear-gradient(135deg, #c9b8ff 0%, #a78bfa 100%)',
    rotate: '2deg',
  },
  {
    msg: "Here's to all our beautiful memories \u2728",
    bg: 'linear-gradient(135deg, #b5ead7 0%, #6ee7b7 100%)',
    rotate: '-1.5deg',
  },
  {
    msg: 'Wishing you endless happiness 🎂',
    bg: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)',
    rotate: '2.5deg',
  },
  {
    msg: 'You deserve the whole world and more 🌺',
    bg: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)',
    rotate: '-2deg',
  },
  {
    msg: 'Happy 22nd — stay magical always 💖',
    bg: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
    rotate: '1.5deg',
  },
];

export default function BirthdayFinale() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const fwInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [phase, setPhase]         = useState<'black' | 'heartbeat' | 'gallery'>('black');
  const [visibleCards, setVisible] = useState<boolean[]>(Array(6).fill(false));

  // Phase sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('heartbeat'), 800);
    const t2 = setTimeout(() => {
      setPhase('gallery');
      spawnConfetti(25);
      setTimeout(() => spawnConfetti(50), 400);
      setTimeout(() => spawnConfetti(75), 800);
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Stagger polaroid cards in
  useEffect(() => {
    if (phase !== 'gallery') return;
    POLAROIDS.forEach((_, i) => {
      setTimeout(() => {
        setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * 150);
    });
  }, [phase]);

  // Fireworks canvas (runs during gallery)
  useEffect(() => {
    if (phase !== 'gallery') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    type P = { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number; r: number };
    type FW = { x: number; y: number; particles: P[] };
    const fws: FW[] = [];
    const COLORS = ['#ff79c6','#bd93f9','#8be9fd','#50fa7b','#ffb86c','#f1fa8c','#ff5555','#ff92d0'];

    const launch = () => {
      const ox = Math.random() * canvas.width;
      const oy = Math.random() * canvas.height * 0.5;
      fws.push({
        x: ox, y: oy,
        particles: Array.from({ length: 80 }, () => {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 7 + 2;
          return { x: ox, y: oy, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, color: COLORS[Math.floor(Math.random()*COLORS.length)], life: 0, maxLife: 60+Math.floor(Math.random()*40), r: Math.random()*2.5+1 };
        }),
      });
    };
    fwInterval.current = setInterval(launch, 900);
    launch(); launch();

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      fws.forEach(fw => {
        fw.particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.vx *= 0.98; p.vy *= 0.98; p.life++;
          const alpha = 1 - p.life / p.maxLife;
          if (alpha <= 0) return;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI*2);
          ctx.fillStyle = p.color + Math.round(alpha*255).toString(16).padStart(2,'0');
          ctx.fill();
        });
      });
      fws.splice(0, fws.length, ...fws.filter(fw => fw.particles.some(p => p.life < p.maxLife)));
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (fwInterval.current) clearInterval(fwInterval.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [phase]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#050510' }}
    >
      {/* Fireworks */}
      {phase === 'gallery' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
      )}

      {/* Red heart beat */}
      {phase === 'heartbeat' && (
        <div
          className="z-10 heartbeat"
          style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            filter: 'drop-shadow(0 0 40px #ff2d78) drop-shadow(0 0 80px #ff0050)',
            lineHeight: 1,
          }}
        >
          ❤️
        </div>
      )}

      {/* Polaroid gallery */}
      {phase === 'gallery' && (
        <div
          className="relative z-10 flex flex-col items-center"
          style={{ width: '100%', maxHeight: '100vh', overflowY: 'auto', padding: '1.5rem 1rem' }}
        >
          {/* Header */}
          <div
            className="shimmer-text"
            style={{
              fontSize: 'clamp(1.3rem, 4vw, 2rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            Happy 22nd Birthday, Anuska 🎀
          </div>

          {/* 3-col × 2-row polaroid grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'clamp(12px, 3vw, 28px)',
              width: '100%',
              maxWidth: 860,
            }}
          >
            {POLAROIDS.map((p, i) => (
              <div
                key={i}
                style={{
                  opacity:    visibleCards[i] ? 1 : 0,
                  transform:  visibleCards[i]
                    ? `rotate(${p.rotate}) scale(1)`
                    : `rotate(${p.rotate}) scale(0.6) translateY(30px)`,
                  transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {/* Polaroid frame */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 4,
                    padding: '8px 8px 32px 8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'default',
                  }}
                >
                  {/* Photo area — placeholder gradient */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: p.bg,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Replace this div with an <img> tag pointing to your photo */}
                    <span style={{ fontSize: 'clamp(28px, 6vw, 48px)', opacity: 0.5 }}>📷</span>
                  </div>

                  {/* Message below photo */}
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 'clamp(0.58rem, 1.4vw, 0.75rem)',
                      color: '#333',
                      textAlign: 'center',
                      fontFamily: "'Georgia', serif",
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      padding: '0 4px',
                    }}
                  >
                    {p.msg}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom celebrate button */}
          <button
            className="glow-button"
            style={{ marginTop: '1.8rem' }}
            onClick={() => { spawnConfetti(25); spawnConfetti(50); spawnConfetti(75); }}
          >
            Celebrate! 🎊
          </button>
        </div>
      )}
    </div>
  );
}
