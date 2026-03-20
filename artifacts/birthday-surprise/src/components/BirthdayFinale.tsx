import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { spawnConfetti } from './ConfettiEffect';
import { CoupleBearSVG } from './BearCharacter';

interface FWParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  r: number;
}

interface Firework {
  x: number;
  y: number;
  particles: FWParticle[];
}

export default function BirthdayFinale() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const fireworksRef = useRef<Firework[]>([]);
  const [phase, setPhase] = useState<'black' | 'heartbeat' | 'name' | 'full'>('black');
  const nameRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase sequence
    const t1 = setTimeout(() => setPhase('heartbeat'), 1000);
    const t2 = setTimeout(() => setPhase('name'), 3000);
    const t3 = setTimeout(() => {
      setPhase('full');
      spawnConfetti(25);
      spawnConfetti(50);
      spawnConfetti(75);
    }, 5500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase === 'name' && nameRef.current) {
      gsap.fromTo(nameRef.current,
        { opacity: 0, scale: 0.5, filter: 'blur(20px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }
      );
    }
    if (phase === 'full' && messageRef.current) {
      gsap.fromTo(messageRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'full') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#ff79c6', '#bd93f9', '#8be9fd', '#50fa7b', '#ffb86c', '#f1fa8c', '#ff5555', '#ff92d0'];

    const launchFirework = () => {
      const ox = Math.random() * canvas.width;
      const oy = Math.random() * canvas.height * 0.6;
      const count = 80 + Math.floor(Math.random() * 40);
      const fw: Firework = {
        x: ox, y: oy,
        particles: Array.from({ length: count }, () => {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 2;
          return {
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            life: 0,
            maxLife: 60 + Math.floor(Math.random() * 40),
            r: Math.random() * 2.5 + 1,
          };
        }),
      };
      fireworksRef.current.push(fw);
    };

    const fwInterval = setInterval(launchFirework, 800);
    launchFirework(); launchFirework();

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fireworksRef.current.forEach(fw => {
        fw.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.life++;
          const alpha = 1 - p.life / p.maxLife;
          if (alpha <= 0) return;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        });
      });

      fireworksRef.current = fireworksRef.current.filter(fw =>
        fw.particles.some(p => p.life < p.maxLife)
      );

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { clearInterval(fwInterval); cancelAnimationFrame(animRef.current); };
  }, [phase]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#000' }}>
      {/* Fireworks canvas */}
      {phase === 'full' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
      )}

      {/* Heartbeat phase */}
      {phase === 'heartbeat' && (
        <div className="z-10 text-8xl heartbeat" style={{ filter: 'drop-shadow(0 0 30px #ff2d78)' }}>
          ❤️
        </div>
      )}

      {/* Name reveal */}
      {(phase === 'name' || phase === 'full') && (
        <div ref={nameRef} className="z-10 flex flex-col items-center gap-6 text-center px-4">
          <div className="text-5xl mb-2">🎂✨🎂</div>
          <h1
            className="font-black"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              background: 'linear-gradient(135deg, #ff79c6, #bd93f9, #8be9fd, #ff79c6)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite, textGlow 2s ease-in-out infinite',
              lineHeight: 1.2,
              fontFamily: 'Georgia, serif',
            }}
          >
            Happy Birthday! ❤️
          </h1>
        </div>
      )}

      {/* Full finale */}
      {phase === 'full' && (
        <div ref={messageRef} className="z-10 flex flex-col items-center gap-6 mt-8 px-6 opacity-0">
          <CoupleBearSVG size={180} />
          
          <div className="glass-card p-6 max-w-md text-center">
            <p className="text-2xl font-light leading-relaxed mb-4" style={{ color: '#f8f8f2' }}>
              Today is YOUR day. 🌟
            </p>
            <p className="text-base opacity-80 leading-relaxed mb-4">
              I don't know where I stand in your life…
              but you made a place in mine.
            </p>
            <p className="text-sm opacity-60 italic">
              Wishing you every joy, every warmth, every beautiful moment
              the world has to offer. You deserve it all.
            </p>
          </div>

          <div 
            className="text-4xl"
            style={{ animation: 'glowPulse 1.5s ease-in-out infinite' }}
          >
            💝 🌸 💝
          </div>

          <button
            className="glow-button"
            onClick={() => { spawnConfetti(25); spawnConfetti(50); spawnConfetti(75); }}
          >
            Celebrate! 🎊
          </button>
        </div>
      )}
    </div>
  );
}
