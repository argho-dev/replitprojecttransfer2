import { useEffect, useRef, useState, useCallback } from 'react';
import Starfield from './Starfield';

const TOTAL_CANDLES = 22;
const BLOW_COOLDOWN_MS = 700;      // ms between extinguishing candles
const BLOW_RMS_THRESHOLD = 0.035;  // microphone amplitude threshold for a "blow"

// Candle positions: two offset rows on the cake top
const CANDLE_ROWS = [
  // row, offset-within-row – we compute x/y from these
  Array.from({ length: 8 }, (_, i) => ({ row: 0, col: i, total: 8 })),
  Array.from({ length: 8 }, (_, i) => ({ row: 1, col: i, total: 8 })),
  Array.from({ length: 6 }, (_, i) => ({ row: 2, col: i, total: 6 })),
].flat();

interface CandleProps {
  lit: boolean;
  justBlown: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

function Candle({ lit, justBlown, onClick, style }: CandleProps) {
  return (
    <div
      onClick={onClick}
      title={lit ? 'Click to blow out' : ''}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: lit ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {/* Flame */}
      <div
        style={{
          width: 7, height: lit ? 14 : 0,
          background: lit
            ? 'radial-gradient(ellipse at 50% 80%, #fff 10%, #ffe066 40%, #ff8800 70%, transparent 100%)'
            : 'transparent',
          borderRadius: '50% 50% 30% 30%',
          filter: lit ? 'drop-shadow(0 0 6px #ffcc00) drop-shadow(0 0 2px #ff8800)' : 'none',
          animation: lit ? 'candleFlicker 0.45s ease-in-out infinite alternate' : 'none',
          transition: 'height 0.3s ease, opacity 0.3s ease',
          opacity: lit ? 1 : 0,
          marginBottom: 1,
        }}
      />

      {/* Smoke after blowing */}
      {justBlown && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            width: 4,
            height: 20,
            background: 'linear-gradient(to top, rgba(200,200,200,0.6), transparent)',
            borderRadius: 4,
            animation: 'smokeRise 1.2s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Candle body */}
      <div
        style={{
          width: 7, height: 26,
          background: lit
            ? 'linear-gradient(to right, #ff79c6, #bd93f9)'
            : 'linear-gradient(to right, #555, #777)',
          borderRadius: '3px 3px 2px 2px',
          boxShadow: lit
            ? 'inset -2px 0 4px rgba(0,0,0,0.3), 0 0 4px rgba(255,120,190,0.5)'
            : 'inset -2px 0 4px rgba(0,0,0,0.4)',
          transition: 'background 0.5s ease',
        }}
      />
      {/* Wick tip */}
      <div style={{ width: 2, height: 3, background: '#222', borderRadius: 1 }} />
    </div>
  );
}

interface Props {
  onDone: () => void;
}

export default function BirthdayCake({ onDone }: Props) {
  const [litCandles, setLitCandles]       = useState<boolean[]>(Array(TOTAL_CANDLES).fill(true));
  const [justBlown, setJustBlown]         = useState<boolean[]>(Array(TOTAL_CANDLES).fill(false));
  const [micActive, setMicActive]         = useState(false);
  const [micError, setMicError]           = useState(false);
  const [allOut, setAllOut]               = useState(false);
  const [showFinal, setShowFinal]         = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const streamRef    = useRef<MediaStream | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const ctxRef       = useRef<AudioContext | null>(null);
  const rafRef       = useRef<number | null>(null);
  const lastBlowRef  = useRef<number>(0);
  const litRef       = useRef<boolean[]>(litCandles); // shadow for animation loop

  litRef.current = litCandles;

  const litCount = litCandles.filter(Boolean).length;

  // ── Extinguish one candle ──────────────────────────────────────────────────
  const extinguishNext = useCallback(() => {
    const current = litRef.current;
    const idx = current.findIndex(v => v);
    if (idx === -1) return;

    setLitCandles(prev => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });

    setJustBlown(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    setTimeout(() => {
      setJustBlown(prev => {
        const next = [...prev];
        next[idx] = false;
        return next;
      });
    }, 1200);
  }, []);

  // ── Handle clicking a candle manually ─────────────────────────────────────
  const handleCandleClick = (i: number) => {
    if (!litCandles[i]) return;
    setLitCandles(prev => { const n = [...prev]; n[i] = false; return n; });
    setJustBlown(prev => { const n = [...prev]; n[i] = true; return n; });
    setTimeout(() => setJustBlown(prev => { const n = [...prev]; n[i] = false; return n; }), 1200);
  };

  // ── Watch for all candles out ──────────────────────────────────────────────
  useEffect(() => {
    if (litCandles.every(v => !v) && !allOut) {
      setAllOut(true);
      setShowFireworks(true);
      setTimeout(() => setShowFinal(true), 1000);
    }
  }, [litCandles, allOut]);

  // ── Microphone setup ──────────────────────────────────────────────────────
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
      console.log('🎤 Microphone active — blow detection on!');

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
    } catch (err) {
      console.warn('Mic denied:', err);
      setMicError(true);
    }
  }, [extinguishNext]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current)   cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (ctxRef.current)   ctxRef.current.close();
    };
  }, []);

  // ── Mini fireworks canvas ─────────────────────────────────────────────────
  const fwCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!showFireworks) return;
    const canvas = fwCanvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    if (!ctx)    return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    const particles: P[] = [];

    const colors = ['#ff79c6','#bd93f9','#8be9fd','#ffe066','#ff5555','#50fa7b'];
    const burst = (cx: number, cy: number) => {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    let frame = 0;
    let raf: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 28 === 0) burst(Math.random() * canvas.width, Math.random() * canvas.height * 0.5);
      frame++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += 0.1;
        p.life -= 0.018;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
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

      {/* Fireworks canvas */}
      {showFireworks && (
        <canvas
          ref={fwCanvasRef}
          className="fixed inset-0 w-full h-full"
          style={{ zIndex: 5 }}
        />
      )}

      {/* ── Final happy birthday message ── */}
      {showFinal && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 20, textAlign: 'center', padding: '1.5rem' }}
        >
          <div style={{
            fontSize: 'clamp(2rem, 8vw, 4.5rem)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ff79c6, #ffe066, #bd93f9)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.15,
            filter: 'drop-shadow(0 0 20px rgba(255,121,198,0.5))',
            animation: 'bubblePop 0.7s ease forwards',
          }}>
            Happy Birthday!! 🎂
          </div>
          <div style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: '#bd93f9', marginTop: '1rem', opacity: 0.9 }}>
            You blew them all out! 🎉 Make a wish ✨
          </div>
          <button
            onClick={onDone}
            className="glow-button"
            style={{ marginTop: '2rem' }}
          >
            See your birthday surprise →
          </button>
        </div>
      )}

      {/* ── Cake + candles ── */}
      {!showFinal && (
        <div className="relative z-10 flex flex-col items-center" style={{ userSelect: 'none' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              className="shimmer-text"
              style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 800, lineHeight: 1.2 }}
            >
              Happy Birthday!! 🎂
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              {micActive
                ? `Blow into your mic to extinguish the candles! (${litCount} left 🕯️)`
                : micError
                  ? `Click each candle to blow it out! (${litCount} left 🕯️)`
                  : `22 candles — one for each year 🕯️`}
            </div>
          </div>

          {/* Cake visual */}
          <div style={{ width: 'min(380px, 90vw)', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>

            {/* Candles — sit above the cake naturally */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              paddingBottom: 2,
              background: 'transparent',
            }}>
              {[
                litCandles.slice(0, 8),
                litCandles.slice(8, 16),
                litCandles.slice(16, 22),
              ].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 'clamp(5px, 2.2vw, 11px)', justifyContent: 'center' }}>
                  {row.map((lit, ci) => {
                    const globalIdx = ri * 8 + ci;
                    return (
                      <Candle
                        key={globalIdx}
                        lit={lit}
                        justBlown={justBlown[globalIdx]}
                        onClick={() => handleCandleClick(globalIdx)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Top tier */}
            <div style={{
              height: 60,
              background: 'linear-gradient(to bottom, #ff79c6, #c94fa0)',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(255,121,198,0.4)',
            }}>
              {/* Frosting drips */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: -4, left: `${8 + i * 12}%`,
                  width: '6%', height: 22,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '0 0 50% 50%',
                }} />
              ))}
              {/* Decorations */}
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: '1.1rem' }}>
                🌸 🌸 🌸
              </div>
            </div>

            {/* Middle tier */}
            <div style={{
              height: 70,
              background: 'linear-gradient(to bottom, #bd93f9, #8b5cf6)',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 0 18px rgba(189,147,249,0.35)',
            }}>
              {/* Frosting drips */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: -4, left: `${3 + i * 10}%`,
                  width: '5%', height: 18,
                  background: 'rgba(255,255,255,0.65)',
                  borderRadius: '0 0 50% 50%',
                }} />
              ))}
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', fontWeight: 600 }}>
                22 years of being amazing ✨
              </div>
            </div>

            {/* Bottom tier */}
            <div style={{
              height: 80,
              background: 'linear-gradient(to bottom, #8be9fd, #5bc8e8)',
              borderRadius: '0 0 12px 12px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(139,233,253,0.3)',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: -4, left: `${1 + i * 8.5}%`,
                  width: '4.5%', height: 16,
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: '0 0 50% 50%',
                }} />
              ))}
              {/* Polka dots */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.5)',
                  top: 30 + (i % 2) * 20,
                  left: `${8 + i * 9}%`,
                }} />
              ))}
            </div>

            {/* Cake board */}
            <div style={{
              height: 14,
              background: 'linear-gradient(to bottom, #d4a017, #a07800)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }} />
          </div>

          {/* Mic / instructions */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {!micActive && !micError && (
              <button
                onClick={startMic}
                className="glow-button"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              >
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
                Mic unavailable — tap each candle to blow it out 🕯️
              </div>
            )}
            {!micActive && (
              <button
                onClick={() => {
                  for (let i = 0; i < TOTAL_CANDLES; i++) {
                    setTimeout(() => handleCandleClick(i), i * 120);
                  }
                }}
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
