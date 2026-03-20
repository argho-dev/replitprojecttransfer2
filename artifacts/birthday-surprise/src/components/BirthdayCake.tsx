import { useEffect, useRef, useState, useCallback } from 'react';
import Starfield from './Starfield';

const TOTAL_FLAMES = 2;
const BLOW_COOLDOWN_MS = 800;
const BLOW_RMS_THRESHOLD = 0.035;

interface FlameProps {
  lit: boolean;
  justBlown: boolean;
  onClick: () => void;
}

function Flame({ lit, justBlown, onClick }: FlameProps) {
  return (
    <div
      onClick={lit ? onClick : undefined}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: lit ? 'pointer' : 'default',
        height: 48,
        justifyContent: 'flex-end',
      }}
    >
      {/* Outer glow */}
      {lit && (
        <div style={{
          position: 'absolute',
          bottom: 4,
          width: 28,
          height: 34,
          borderRadius: '50% 50% 30% 30%',
          background: 'radial-gradient(ellipse at 50% 70%, rgba(255,200,0,0.35) 0%, transparent 70%)',
          filter: 'blur(6px)',
          animation: 'candleFlicker 0.5s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }} />
      )}

      {/* Flame body */}
      <div style={{
        width: 18,
        height: lit ? 36 : 0,
        background: lit
          ? 'radial-gradient(ellipse at 50% 80%, #fff 8%, #ffe566 35%, #ff9900 65%, #ff4400 90%, transparent 100%)'
          : 'transparent',
        borderRadius: '50% 50% 30% 30%',
        filter: lit ? 'drop-shadow(0 0 8px #ffcc00) drop-shadow(0 0 4px #ff8800)' : 'none',
        animation: lit ? 'candleFlicker 0.45s ease-in-out infinite alternate' : 'none',
        transition: 'height 0.3s ease, opacity 0.3s ease',
        opacity: lit ? 1 : 0,
      }} />

      {/* Wick */}
      <div style={{
        width: 3,
        height: 8,
        background: lit ? '#ffcc44' : '#555',
        borderRadius: 2,
        marginTop: -2,
        boxShadow: lit ? '0 0 4px #ffcc44' : 'none',
        transition: 'background 0.4s',
      }} />

      {/* Smoke */}
      {justBlown && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          width: 6,
          height: 30,
          background: 'linear-gradient(to top, rgba(200,200,200,0.5), transparent)',
          borderRadius: 4,
          animation: 'smokeRise 1.2s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

interface DigitWithFlameProps {
  flameIndex: number;
  lit: boolean;
  justBlown: boolean;
  onBlow: (i: number) => void;
}

function DigitWithFlame({ flameIndex, lit, justBlown, onBlow }: DigitWithFlameProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Flame sits at the immediate top-center head of the digit */}
      <Flame
        lit={lit}
        justBlown={justBlown}
        onClick={() => onBlow(flameIndex)}
      />

      {/* The digit "2" */}
      <div style={{
        fontSize: 'clamp(80px, 18vw, 130px)',
        fontWeight: 900,
        lineHeight: 1,
        background: lit
          ? 'linear-gradient(160deg, #ffe566 0%, #ffaa00 50%, #ff6600 100%)'
          : 'linear-gradient(160deg, #888 0%, #555 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: lit
          ? 'drop-shadow(0 0 18px rgba(255,180,0,0.6))'
          : 'drop-shadow(0 0 6px rgba(0,0,0,0.5))',
        transition: 'filter 0.5s ease',
        fontFamily: 'Georgia, serif',
        userSelect: 'none',
        letterSpacing: '-0.02em',
      }}>
        2
      </div>
    </div>
  );
}

interface Props {
  onDone: () => void;
}

export default function BirthdayCake({ onDone }: Props) {
  const [litFlames, setLitFlames]   = useState<boolean[]>(Array(TOTAL_FLAMES).fill(true));
  const [justBlown, setJustBlown]   = useState<boolean[]>(Array(TOTAL_FLAMES).fill(false));
  const [micActive, setMicActive]   = useState(false);
  const [micError, setMicError]     = useState(false);
  const [allOut, setAllOut]         = useState(false);
  const [showFinal, setShowFinal]   = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const streamRef   = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef      = useRef<AudioContext | null>(null);
  const rafRef      = useRef<number | null>(null);
  const lastBlowRef = useRef<number>(0);
  const litRef      = useRef<boolean[]>(litFlames);
  litRef.current    = litFlames;

  const litCount = litFlames.filter(Boolean).length;

  const extinguishNext = useCallback(() => {
    const idx = litRef.current.findIndex(v => v);
    if (idx === -1) return;
    setLitFlames(prev => { const n = [...prev]; n[idx] = false; return n; });
    setJustBlown(prev => { const n = [...prev]; n[idx] = true; return n; });
    setTimeout(() => setJustBlown(prev => { const n = [...prev]; n[idx] = false; return n; }), 1200);
  }, []);

  const handleBlow = (i: number) => {
    if (!litFlames[i]) return;
    setLitFlames(prev => { const n = [...prev]; n[i] = false; return n; });
    setJustBlown(prev => { const n = [...prev]; n[i] = true; return n; });
    setTimeout(() => setJustBlown(prev => { const n = [...prev]; n[i] = false; return n; }), 1200);
  };

  useEffect(() => {
    if (litFlames.every(v => !v) && !allOut) {
      setAllOut(true);
      setShowFireworks(true);
      setTimeout(() => setShowFinal(true), 1000);
    }
  }, [litFlames, allOut]);

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);

      const buf = new Float32Array(analyser.fftSize);
      const detect = () => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        const now = Date.now();
        if (rms > BLOW_RMS_THRESHOLD && now - lastBlowRef.current > BLOW_COOLDOWN_MS) {
          lastBlowRef.current = now;
          extinguishNext();
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch {
      setMicError(true);
    }
  }, [extinguishNext]);

  useEffect(() => {
    return () => {
      if (rafRef.current)    cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (ctxRef.current)    ctxRef.current.close();
    };
  }, []);

  // Fireworks
  const fwCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!showFireworks) return;
    const canvas = fwCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    const particles: P[] = [];
    const colors = ['#ff79c6','#bd93f9','#8be9fd','#ffe066','#ff5555','#50fa7b'];
    const burst = (cx: number, cy: number) => {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({ x: cx, y: cy, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed-2, life: 1, color: colors[Math.floor(Math.random()*colors.length)] });
      }
    };
    let frame = 0, raf: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 28 === 0) burst(Math.random()*canvas.width, Math.random()*canvas.height*0.5);
      frame++;
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.018;
        if (p.life <= 0) { particles.splice(i,1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [showFireworks]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#050510' }}>
      <Starfield />

      {showFireworks && (
        <canvas ref={fwCanvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 5 }} />
      )}

      {/* Final message */}
      {showFinal && (
        <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ zIndex: 20, textAlign: 'center', padding: '1.5rem' }}>
          <div style={{
            fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: 900,
            background: 'linear-gradient(135deg, #ff79c6, #ffe066, #bd93f9)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', lineHeight: 1.15,
            filter: 'drop-shadow(0 0 20px rgba(255,121,198,0.5))',
            animation: 'bubblePop 0.7s ease forwards',
          }}>
            Happy 22nd Birthday 🎉
          </div>
          <div style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: '#bd93f9', marginTop: '1rem', opacity: 0.9 }}>
            You are very very precious and always stay happy. Happy Birthday 💛
          </div>
          <button onClick={onDone} className="glow-button" style={{ marginTop: '2rem' }}>
            See your birthday surprise →
          </button>
        </div>
      )}

      {/* Main cake scene */}
      {!showFinal && (
        <div className="relative z-10 flex flex-col items-center" style={{ userSelect: 'none' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <div className="shimmer-text" style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 800, lineHeight: 1.2 }}>
              Happy 22nd Birthday 🎉
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: '0.4rem' }}>
              {micActive
                ? `Blow into your mic to put out the flames! (${litCount} left 🔥)`
                : micError
                  ? `Click each flame to blow it out! (${litCount} left 🔥)`
                  : `Blow out the flames to reveal your surprise 🔥`}
            </div>
          </div>

          {/* "22" digits with flames on top of pyramid cake */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Digits row — sits above cake */}
            <div style={{
              display: 'flex',
              gap: 'clamp(12px, 5vw, 36px)',
              alignItems: 'flex-end',
              marginBottom: -4,
              position: 'relative',
              zIndex: 2,
            }}>
              {[0, 1].map(i => (
                <DigitWithFlame
                  key={i}
                  flameIndex={i}
                  lit={litFlames[i]}
                  justBlown={justBlown[i]}
                  onBlow={handleBlow}
                />
              ))}
            </div>

            {/* Pyramid-style cake — each tier wider than the one above */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* Top tier — narrowest */}
              <div style={{
                width: 'clamp(140px, 32vw, 200px)',
                height: 54,
                background: 'linear-gradient(to bottom, #ff79c6, #c94fa0)',
                borderRadius: '10px 10px 0 0',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 22px rgba(255,121,198,0.45)',
              }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: -4,
                    left: `${10 + i * 18}%`, width: '8%', height: 18,
                    background: 'rgba(255,255,255,0.7)', borderRadius: '0 0 50% 50%',
                  }} />
                ))}
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: '1rem' }}>
                  🌸 🌸
                </div>
              </div>

              {/* Middle tier — medium */}
              <div style={{
                width: 'clamp(210px, 48vw, 300px)',
                height: 66,
                background: 'linear-gradient(to bottom, #bd93f9, #8b5cf6)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 20px rgba(189,147,249,0.38)',
              }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: -4,
                    left: `${4 + i * 14}%`, width: '6%', height: 16,
                    background: 'rgba(255,255,255,0.65)', borderRadius: '0 0 50% 50%',
                  }} />
                ))}
                <div style={{
                  position: 'absolute', bottom: 10, left: 0, right: 0,
                  textAlign: 'center', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', fontWeight: 600,
                }}>
                  22 years of being amazing ✨
                </div>
              </div>

              {/* Bottom tier — widest */}
              <div style={{
                width: 'clamp(290px, 66vw, 420px)',
                height: 80,
                background: 'linear-gradient(to bottom, #8be9fd, #5bc8e8)',
                borderRadius: '0 0 14px 14px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 28px rgba(139,233,253,0.3)',
              }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: -4,
                    left: `${2 + i * 10}%`, width: '5%', height: 14,
                    background: 'rgba(255,255,255,0.6)', borderRadius: '0 0 50% 50%',
                  }} />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 11, height: 11, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.45)',
                    top: 28 + (i % 2) * 22, left: `${7 + i * 10}%`,
                  }} />
                ))}
              </div>

              {/* Cake board */}
              <div style={{
                width: 'clamp(310px, 72vw, 450px)',
                height: 14,
                background: 'linear-gradient(to bottom, #d4a017, #a07800)',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
              }} />
            </div>
          </div>

          {/* Mic / instructions */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {!micActive && !micError && (
              <button onClick={startMic} className="glow-button" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                🎤 Enable Microphone to Blow
              </button>
            )}
            {micActive && (
              <div className="glass" style={{ padding: '8px 18px', fontSize: '0.8rem', color: '#8be9fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ animation: 'heartbeat 0.8s ease-in-out infinite' }}>🎤</span>
                Listening… take a deep breath and blow!
              </div>
            )}
            {micError && (
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Mic unavailable — tap each flame to blow it out 🔥
              </div>
            )}
            {!micActive && (
              <button
                onClick={() => { handleBlow(0); setTimeout(() => handleBlow(1), 600); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)',
                  textDecoration: 'underline',
                }}
              >
                or blow all out at once
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
