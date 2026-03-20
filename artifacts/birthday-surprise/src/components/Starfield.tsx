import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
  type: 'normal' | 'bright' | 'pulse';
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  opacity: number;
  active: boolean;
}

const STAR_COLORS = [
  '255,255,255',
  '200,220,255',
  '255,200,230',
  '220,200,255',
  '255,240,200',
];

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
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

    const stars: Star[] = [];
    for (let i = 0; i < 320; i++) {
      const type: Star['type'] =
        i < 20 ? 'pulse' : i < 80 ? 'bright' : 'normal';
      const colorStr = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: type === 'pulse' ? Math.random() * 2 + 1.5
           : type === 'bright' ? Math.random() * 1.5 + 1
           : Math.random() * 1.2 + 0.3,
        baseOpacity: 0,
        twinkleSpeed: type === 'pulse'  ? Math.random() * 2 + 3
                    : type === 'bright' ? Math.random() * 1.5 + 1.5
                    : Math.random() * 1 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: colorStr,
        type,
      });
    }

    // Fade stars in staggered
    stars.forEach((star, i) => {
      gsap.to(star, {
        baseOpacity: star.type === 'pulse' ? Math.random() * 0.5 + 0.5
                   : star.type === 'bright' ? Math.random() * 0.5 + 0.4
                   : Math.random() * 0.6 + 0.2,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 2.5,
        ease: 'power2.inOut',
      });
    });

    // Shooting stars
    const shooters: ShootingStar[] = Array.from({ length: 4 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, len: 0, opacity: 0, active: false,
    }));

    const launchShooter = (s: ShootingStar) => {
      s.x = Math.random() * canvas.width * 0.7;
      s.y = Math.random() * canvas.height * 0.4;
      const angle = Math.random() * 0.4 + 0.1; // shallow downward
      const speed = Math.random() * 8 + 10;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.len = Math.random() * 120 + 80;
      s.opacity = 1;
      s.active = true;
    };

    const scheduleShooter = () => {
      const delay = Math.random() * 6000 + 3000;
      setTimeout(() => {
        const idle = shooters.find(s => !s.active);
        if (idle) launchShooter(idle);
        scheduleShooter();
      }, delay);
    };
    scheduleShooter();

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.025;

      for (const star of stars) {
        let twinkle: number;

        if (star.type === 'pulse') {
          // Bold pulsing: goes from dim to very bright repeatedly
          twinkle = (Math.sin(t * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
          twinkle = Math.pow(twinkle, 0.5); // spend more time bright
        } else if (star.type === 'bright') {
          // Noticeable flicker
          const s1 = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
          twinkle = (s1 + 1) / 2;
          twinkle = 0.3 + twinkle * 0.7;
        } else {
          // Gentle shimmer
          twinkle = (Math.sin(t * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
          twinkle = 0.4 + twinkle * 0.6;
        }

        const opacity = star.baseOpacity * twinkle;
        if (opacity < 0.01) continue;

        // Glow halo for bright/pulse stars
        if (star.type !== 'normal' && star.r > 1) {
          const haloR = star.r * (star.type === 'pulse' ? 5 : 3.5);
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, haloR);
          grad.addColorStop(0, `rgba(${star.color}, ${opacity * 0.35})`);
          grad.addColorStop(1, `rgba(${star.color}, 0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
        ctx.fill();

        // Cross sparkle for pulse stars
        if (star.type === 'pulse' && twinkle > 0.7) {
          const len = star.r * 4 * twinkle;
          ctx.save();
          ctx.globalAlpha = opacity * 0.5 * (twinkle - 0.7) / 0.3;
          ctx.strokeStyle = `rgba(${star.color}, 1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - len, star.y);
          ctx.lineTo(star.x + len, star.y);
          ctx.moveTo(star.x, star.y - len);
          ctx.lineTo(star.x, star.y + len);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw shooting stars
      for (const s of shooters) {
        if (!s.active) continue;
        s.x += s.vx;
        s.y += s.vy;
        s.opacity -= 0.018;
        if (s.opacity <= 0 || s.x > canvas.width + 100 || s.y > canvas.height + 100) {
          s.active = false;
          continue;
        }
        const tailX = s.x - s.vx * (s.len / Math.hypot(s.vx, s.vy));
        const tailY = s.y - s.vy * (s.len / Math.hypot(s.vx, s.vy));
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(1, `rgba(255,220,255,${s.opacity})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
