import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
  twinkleOffset: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
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

    // Generate stars
    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        opacity: 0,
        speed: Math.random() * 0.5 + 0.1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // Animate stars appearing
    stars.forEach((star, i) => {
      gsap.to(star, {
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        ease: 'power2.inOut',
      });
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      stars.forEach(star => {
        const twinkle = Math.sin(t * star.speed * 2 + star.twinkleOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();

        // Occasional glow
        if (star.r > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
          grad.addColorStop(0, `rgba(255, 200, 255, ${star.opacity * twinkle * 0.3})`);
          grad.addColorStop(1, 'rgba(255, 200, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

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
